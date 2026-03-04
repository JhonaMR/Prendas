/**
 * 📦 BULK CONFECCIONISTA IMPORT SERVICE - POSTGRESQL
 * 
 * Servicio para importación masiva de confeccionistas desde CSV
 * Implementa transacciones para consistencia de datos
 */

const { query, transaction } = require('../config/database');
const { DatabaseError, ValidationError } = require('../controllers/shared/errorHandler');
const logger = require('../controllers/shared/logger');

/**
 * Valida y transforma un registro de confeccionista
 * @param {Object} record - Registro del CSV
 * @param {number} rowNumber - Número de fila para reportes de error
 * @returns {Object} Objeto con { valid: boolean, data: Object, error: string }
 */
function validateAndTransformRecord(record, rowNumber) {
  const errors = [];

  // Validar ID (cédula)
  if (!record.id || record.id.toString().trim() === '') {
    errors.push('ID (Cédula) es requerido');
  }

  // Validar nombre
  if (!record.name || record.name.toString().trim() === '') {
    errors.push('Nombre es requerido');
  }

  // Teléfono es opcional
  // Dirección es opcional
  // Ciudad es opcional
  // Score es opcional

  if (errors.length > 0) {
    return {
      valid: false,
      error: `Fila ${rowNumber}: ${errors.join('; ')}`
    };
  }

  // Transformar registro
  return {
    valid: true,
    data: {
      id: record.id.toString().trim(),
      name: record.name.toString().trim(),
      phone: record.phone ? record.phone.toString().trim() : null,
      address: record.address ? record.address.toString().trim() : null,
      city: record.city ? record.city.toString().trim() : null,
      score: record.score ? record.score.toString().trim() : null
    }
  };
}

/**
 * Importa confeccionistas masivamente desde un array de registros
 * @async
 * @param {Array} records - Array de registros del CSV
 * @returns {Promise<Object>} Resultado de la importación
 */
async function bulkImportConfeccionistas(records) {
  try {
    // Validar todos los registros
    const validRecords = [];
    const errors = [];
    const duplicateIds = new Set();

    records.forEach((record, index) => {
      const rowNumber = index + 2; // +2 porque fila 1 es header, index comienza en 0
      
      const validation = validateAndTransformRecord(record, rowNumber);
      
      if (!validation.valid) {
        errors.push(validation.error);
      } else {
        // Verificar duplicados dentro del lote
        if (duplicateIds.has(validation.data.id)) {
          errors.push(`Fila ${rowNumber}: ID "${validation.data.id}" está duplicado en el lote`);
        } else {
          duplicateIds.add(validation.data.id);
          validRecords.push(validation.data);
        }
      }
    });

    // Si hay errores de validación, retornar sin insertar nada
    if (errors.length > 0) {
      return {
        success: false,
        imported: 0,
        errors: errors,
        message: `Validación fallida. Se encontraron ${errors.length} error(es)`
      };
    }

    // Verificar que los IDs no existan en la BD
    const existingIds = [];
    for (const record of validRecords) {
      const existingResult = await query('SELECT id FROM confeccionistas WHERE id = $1', [record.id]);
      if (existingResult.rows.length > 0) {
        existingIds.push(record.id);
      }
    }

    if (existingIds.length > 0) {
      return {
        success: false,
        imported: 0,
        errors: [`Los siguientes IDs ya existen en la BD: ${existingIds.join(', ')}`],
        message: 'No se puede importar. Algunos confeccionistas ya existen'
      };
    }

    // Insertar en transacción
    await transaction(async (client) => {
      for (const record of validRecords) {
        await client.query(
          `INSERT INTO confeccionistas (id, name, phone, address, city, score, active)
          VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            record.id,
            record.name,
            record.phone,
            record.address,
            record.city,
            record.score,
            1
          ]
        );
      }
    });

    logger.info('Bulk import completed', { imported: validRecords.length });

    return {
      success: true,
      imported: validRecords.length,
      errors: [],
      message: `Se importaron exitosamente ${validRecords.length} confeccionista(s)`
    };

  } catch (error) {
    logger.error('Error in bulk import', error);
    throw new DatabaseError('Error durante la importación masiva', error);
  }
}

module.exports = {
  bulkImportConfeccionistas
};
