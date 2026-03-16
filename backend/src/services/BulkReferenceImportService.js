/**
 * 📦 BULK REFERENCE IMPORT SERVICE - POSTGRESQL
 * 
 * Servicio para importación masiva de referencias desde CSV
 * Implementa transacciones para consistencia de datos
 */

const { query, transaction } = require('../config/database');
const { DatabaseError, ValidationError } = require('../controllers/shared/errorHandler');
const logger = require('../controllers/shared/logger');

/**
 * Parsea un número que puede tener coma o punto como separador decimal
 * @param {string|number} value - Valor a parsear
 * @returns {number} Número parseado o 0 si no es válido
 */
function parseDecimal(value) {
  if (!value || value === '') return 0;
  
  // Convertir a string y reemplazar coma por punto
  const stringValue = value.toString().trim().replace(',', '.');
  const parsed = parseFloat(stringValue);
  
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Mapea nombres de correrias a sus IDs
 * @param {Array} correrias - Array de correrias con id, name y year
 * @returns {Map} Mapa de nombre -> id (soporta "Nombre" y "Nombre YYYY")
 */
function createCorreriaMap(correrias) {
  const map = new Map();
  correrias.forEach(correria => {
    // Agregar por nombre solo (ej: "madres")
    const nameOnly = correria.name.toLowerCase().trim();
    map.set(nameOnly, correria.id);
    
    // Agregar por nombre + año (ej: "madres 2026")
    const nameWithYear = `${correria.name} ${correria.year}`.toLowerCase().trim();
    map.set(nameWithYear, correria.id);
    
    logger.info(`Correria mapeada: "${nameOnly}" y "${nameWithYear}" -> ${correria.id}`);
  });
  return map;
}

/**
 * Valida y transforma un registro de referencia
 * @param {Object} record - Registro del CSV
 * @param {Map} correriaMap - Mapa de nombres de correrias a IDs
 * @param {number} rowNumber - Número de fila para reportes de error
 * @returns {Object} Objeto con { valid: boolean, data: Object, error: string }
 */
function validateAndTransformRecord(record, correriaMap, rowNumber) {
  const errors = [];

  // Validar ID
  if (!record.id || record.id.toString().trim() === '') {
    errors.push('ID es requerido');
  }

  // Validar descripción
  if (!record.description || record.description.toString().trim() === '') {
    errors.push('Descripción es requerida');
  }

  // Validar precio
  const price = parseDecimal(record.price);
  if (isNaN(price) || price < 0) {
    errors.push('Precio debe ser un número válido y positivo');
  }

  // Validar correrias
  if (!record.correrias || record.correrias.toString().trim() === '') {
    errors.push('Correrias es requerido');
  } else {
    const correriaNames = record.correrias.toString().trim().split(';').map(c => c.trim().toLowerCase());
    const invalidCorrerias = correriaNames.filter(name => !correriaMap.has(name));
    
    if (invalidCorrerias.length > 0) {
      // Mostrar las correrias disponibles para ayudar al usuario
      const availableCorrerias = Array.from(correriaMap.keys()).join(', ');
      errors.push(`Correrias no válidas: ${invalidCorrerias.join(', ')}. Disponibles: ${availableCorrerias}`);
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      error: `Fila ${rowNumber}: ${errors.join('; ')}`
    };
  }

  // Transformar registro
  const correriaNames = record.correrias.toString().trim().split(';').map(c => c.trim().toLowerCase());
  const correriaIds = correriaNames.map(name => correriaMap.get(name));
  
  // Parsear promedios de tela con manejo de valores vacíos y comas/puntos decimales
  const avgCloth1 = record.avgcloth1 || record.avgCloth1 || record.avgcloth1 || record.avg_cloth1;
  const avgCloth2 = record.avgcloth2 || record.avgCloth2 || record.avgcloth2 || record.avg_cloth2;
  
  const parsedAvgCloth1 = parseDecimal(avgCloth1);
  const parsedAvgCloth2 = parseDecimal(avgCloth2);
  
  logger.info(`Procesando referencia ${record.id}: avgCloth1="${avgCloth1}" -> ${parsedAvgCloth1}, avgCloth2="${avgCloth2}" -> ${parsedAvgCloth2}`);
  
  return {
    valid: true,
    data: {
      id: record.id.toString().trim(),
      description: record.description.toString().trim(),
      price: price,
      designer: record.designer ? record.designer.toString().trim() : '',
      cloth1: record.cloth1 ? record.cloth1.toString().trim() : '',
      avgCloth1: parsedAvgCloth1,
      cloth2: record.cloth2 ? record.cloth2.toString().trim() : '',
      avgCloth2: parsedAvgCloth2,
      correrias: correriaIds
    }
  };
}

/**
 * Importa referencias masivamente desde un array de registros
 * @async
 * @param {Array} records - Array de registros del CSV
 * @returns {Promise<Object>} Resultado de la importación
 */
async function bulkImportReferences(records) {
  try {
    // Obtener correrias del sistema (incluyendo year)
    const correriasResult = await query('SELECT id, name, year FROM correrias');
    const correriaMap = createCorreriaMap(correriasResult.rows);

    // Crear lista legible de correrias para logs
    const correriasDisplay = correriasResult.rows.map(c => `"${c.name} ${c.year}"`).join(', ');
    logger.info(`Correrias disponibles: ${correriasDisplay}`);

    // Validar y transformar registros
    const validRecords = [];
    const errors = [];

    records.forEach((record, index) => {
      const result = validateAndTransformRecord(record, correriaMap, index + 2); // +2 porque fila 1 es header
      
      if (result.valid) {
        validRecords.push(result.data);
      } else {
        errors.push(result.error);
        logger.warn(`Validación fallida: ${result.error}`);
      }
    });

    // Si hay errores, retornar sin importar nada
    if (errors.length > 0) {
      logger.error(`Errores de validación encontrados: ${errors.length}`);
      return {
        success: false,
        message: `Errores en validación: ${errors.length} registros rechazados. Correrias disponibles: ${correriasDisplay}`,
        errors: errors,
        saved: 0,
        summary: `0 referencias importadas, ${errors.length} errores`
      };
    }

    // Importar registros válidos en transacción
    let saved = 0;
    const importErrors = [];

    for (const record of validRecords) {
      try {
        // Verificar si la referencia ya existe
        const existingRef = await query(
          'SELECT id FROM product_references WHERE id = $1',
          [record.id]
        );

        if (existingRef.rows.length > 0) {
          // Actualizar referencia existente
          await query(
            `UPDATE product_references 
             SET description = $1, price = $2, designer = $3, 
                 cloth1 = $4, avg_cloth1 = $5, cloth2 = $6, avg_cloth2 = $7, active = $8
             WHERE id = $9`,
            [record.description, record.price, record.designer, 
             record.cloth1, record.avgCloth1, record.cloth2, record.avgCloth2, 1, record.id]
          );
        } else {
          // Crear nueva referencia
          await query(
            `INSERT INTO product_references (id, description, price, designer, cloth1, avg_cloth1, cloth2, avg_cloth2, active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [record.id, record.description, record.price, record.designer,
             record.cloth1, record.avgCloth1, record.cloth2, record.avgCloth2, 1]
          );
        }

        // Actualizar relación con correrias
        // Obtener correrias existentes
        const existingCorreriasResult = await query(
          'SELECT correria_id FROM correria_catalog WHERE reference_id = $1',
          [record.id]
        );
        const existingCorreriaIds = existingCorreriasResult.rows.map(row => row.correria_id);

        // Insertar solo las nuevas correrias (las que no existen)
        for (const correriaId of record.correrias) {
          if (!existingCorreriaIds.includes(correriaId)) {
            // Generar ID único para la relación
            const catalogId = `${record.id}_${correriaId}_${Date.now()}`;
            await query(
              'INSERT INTO correria_catalog (id, reference_id, correria_id) VALUES ($1, $2, $3)',
              [catalogId, record.id, correriaId]
            );
          }
        }

        saved++;
      } catch (error) {
        logger.error(`Error importando referencia ${record.id}:`, error);
        importErrors.push(`Referencia ${record.id}: ${error.message}`);
      }
    }

    return {
      success: importErrors.length === 0,
      message: `${saved} referencias importadas exitosamente`,
      saved: saved,
      errors: importErrors,
      summary: `${saved} referencias importadas${importErrors.length > 0 ? `, ${importErrors.length} errores` : ''}`
    };

  } catch (error) {
    logger.error('Error en bulk import de referencias:', error);
    return {
      success: false,
      message: 'Error en importación masiva',
      error: error.message,
      saved: 0,
      summary: 'Error en importación masiva'
    };
  }
}

module.exports = {
  bulkImportReferences
};
