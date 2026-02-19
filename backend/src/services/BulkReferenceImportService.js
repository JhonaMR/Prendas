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
 * Mapea nombres de correrias a sus IDs
 * @param {Array} correrias - Array de correrias con id y name
 * @returns {Map} Mapa de nombre -> id
 */
function createCorreriaMap(correrias) {
  const map = new Map();
  correrias.forEach(correria => {
    map.set(correria.name.toLowerCase().trim(), correria.id);
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
  const price = parseFloat(record.price);
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
      errors.push(`Correrias no válidas: ${invalidCorrerias.join(', ')}`);
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
  
  return {
    valid: true,
    data: {
      id: record.id.toString().trim(),
      description: record.description.toString().trim(),
      price: price,
      designer: record.designer ? record.designer.toString().trim() : '',
      cloth1: record.cloth1 ? record.cloth1.toString().trim() : '',
      avgCloth1: record.avgCloth1 ? parseFloat(record.avgCloth1) : 0,
      cloth2: record.cloth2 ? record.cloth2.toString().trim() : '',
      avgCloth2: record.avgCloth2 ? parseFloat(record.avgCloth2) : 0,
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
    // Obtener correrias del sistema
    const correriasResult = await query('SELECT id, name FROM correrias');
    const correriaMap = createCorreriaMap(correriasResult.rows);

    // Validar y transformar registros
    const validRecords = [];
    const errors = [];

    records.forEach((record, index) => {
      const result = validateAndTransformRecord(record, correriaMap, index + 2); // +2 porque fila 1 es header
      
      if (result.valid) {
        validRecords.push(result.data);
      } else {
        errors.push(result.error);
      }
    });

    // Si hay errores, retornar sin importar nada
    if (errors.length > 0) {
      return {
        success: false,
        message: `Errores en validación: ${errors.length} registros rechazados`,
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
          'SELECT id FROM references WHERE id = $1',
          [record.id]
        );

        if (existingRef.rows.length > 0) {
          // Actualizar referencia existente
          await query(
            `UPDATE references 
             SET description = $1, price = $2, designer = $3, 
                 cloth1 = $4, avg_cloth1 = $5, cloth2 = $6, avg_cloth2 = $7
             WHERE id = $8`,
            [record.description, record.price, record.designer, 
             record.cloth1, record.avgCloth1, record.cloth2, record.avgCloth2, record.id]
          );
        } else {
          // Crear nueva referencia
          await query(
            `INSERT INTO references (id, description, price, designer, cloth1, avg_cloth1, cloth2, avg_cloth2)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [record.id, record.description, record.price, record.designer,
             record.cloth1, record.avgCloth1, record.cloth2, record.avgCloth2]
          );
        }

        // Actualizar relación con correrias
        // Primero eliminar relaciones existentes
        await query(
          'DELETE FROM reference_correrias WHERE reference_id = $1',
          [record.id]
        );

        // Luego insertar nuevas relaciones
        for (const correriaId of record.correrias) {
          await query(
            'INSERT INTO reference_correrias (reference_id, correria_id) VALUES ($1, $2)',
            [record.id, correriaId]
          );
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
