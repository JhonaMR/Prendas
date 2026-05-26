/**
 * 📦 BULK CLIENT IMPORT SERVICE - POSTGRESQL
 * 
 * Servicio para importación masiva de clientes desde CSV
 * Implementa transacciones para consistencia de datos
 */

const { query, transaction } = require('../config/database');
const { DatabaseError, ValidationError } = require('../controllers/shared/errorHandler');
const logger = require('../controllers/shared/logger');

/**
 * Mapea nombres de vendedores a sus IDs
 * @param {Array} sellers - Array de vendedores con id y name
 * @returns {Map} Mapa de nombre -> id
 */
function createSellerMap(sellers) {
  const map = new Map();
  sellers.forEach(seller => {
    map.set(seller.name.toLowerCase().trim(), seller.id);
  });
  return map;
}

/**
 * Valida y transforma un registro de cliente
 * @param {Object} record - Registro del CSV
 * @param {Map} sellerMap - Mapa de nombres de vendedores a IDs
 * @param {number} rowNumber - Número de fila para reportes de error
 * @returns {Object} Objeto con { valid: boolean, data: Object, error: string }
 */
function validateAndTransformRecord(record, sellerMap, rowNumber) {
  const errors = [];

  // Validar ID
  if (!record.id || record.id.toString().trim() === '') {
    errors.push('ID es requerido');
  }

  // Validar nombre
  if (!record.name || record.name.toString().trim() === '') {
    errors.push('Nombre es requerido');
  }

  // Validar NIT
  if (!record.nit || record.nit.toString().trim() === '') {
    errors.push('NIT es requerido');
  }

  // Validar dirección
  if (!record.address || record.address.toString().trim() === '') {
    errors.push('Dirección es requerida');
  }

  // Validar ciudad
  if (!record.city || record.city.toString().trim() === '') {
    errors.push('Ciudad es requerida');
  }

  // Validar y mapear vendedor
  if (!record.seller || record.seller.toString().trim() === '') {
    errors.push('Vendedor es requerido');
  } else {
    const sellerName = record.seller.toString().trim().toLowerCase();
    const sellerId = sellerMap.get(sellerName);
    
    if (!sellerId) {
      errors.push(`Vendedor "${record.seller}" no existe en el sistema`);
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      error: `Fila ${rowNumber}: ${errors.join('; ')}`
    };
  }

  // Transformar registro
  const sellerId = sellerMap.get(record.seller.toString().trim().toLowerCase());
  
  // Mapear cod_of
  let codOf = null;
  if (record.cod_of !== undefined) codOf = record.cod_of;
  else if (record.codof !== undefined) codOf = record.codof;
  else if (record['cód. of'] !== undefined) codOf = record['cód. of'];
  else if (record['cod. of'] !== undefined) codOf = record['cod. of'];

  // Mapear cod_rm
  let codRm = null;
  if (record.cod_rm !== undefined) codRm = record.cod_rm;
  else if (record.codrm !== undefined) codRm = record.codrm;
  else if (record.cod_ml !== undefined) codRm = record.cod_ml;
  else if (record.codml !== undefined) codRm = record.codml;
  else if (record['cód. ml'] !== undefined) codRm = record['cód. ml'];
  else if (record['cod. ml'] !== undefined) codRm = record['cod. ml'];
  else if (record['cód. rm'] !== undefined) codRm = record['cód. rm'];
  else if (record['cod. rm'] !== undefined) codRm = record['cod. rm'];

  const cleanCodOf = (codOf !== null && String(codOf).trim() !== '') ? String(codOf).trim() : null;
  const cleanCodRm = (codRm !== null && String(codRm).trim() !== '') ? String(codRm).trim() : null;

  return {
    valid: true,
    data: {
      id: record.id.toString().trim(),
      name: record.name.toString().trim(),
      nit: record.nit.toString().trim(),
      address: record.address.toString().trim(),
      city: record.city.toString().trim(),
      sellerId: sellerId,
      codOf: cleanCodOf,
      codRm: cleanCodRm
    }
  };
}

/**
 * Importa clientes masivamente desde un array de registros
 * @async
 * @param {Array} records - Array de registros del CSV
 * @returns {Promise<Object>} Resultado de la importación
 */
async function bulkImportClients(records) {
  try {
    // Obtener todos los vendedores
    const sellersResult = await query('SELECT id, name FROM sellers');
    const sellers = sellersResult.rows;
    const sellerMap = createSellerMap(sellers);

    // Validar todos los registros
    const validRecords = [];
    const errors = [];
    const duplicateIds = new Set();

    records.forEach((record, index) => {
      const rowNumber = index + 2; // +2 porque fila 1 es header, index comienza en 0
      
      const validation = validateAndTransformRecord(record, sellerMap, rowNumber);
      
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
      const existingResult = await query('SELECT id FROM clients WHERE id = $1', [record.id]);
      if (existingResult.rows.length > 0) {
        existingIds.push(record.id);
      }
    }

    if (existingIds.length > 0) {
      return {
        success: false,
        imported: 0,
        errors: [`Los siguientes IDs ya existen en la BD: ${existingIds.join(', ')}`],
        message: 'No se puede importar. Algunos clientes ya existen'
      };
    }

    // Insertar en transacción
    await transaction(async (client) => {
      for (const record of validRecords) {
        await client.query(
          `INSERT INTO clients (id, name, nit, address, city, seller_id, active, cod_of, cod_rm)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            record.id,
            record.name,
            record.nit,
            record.address,
            record.city,
            record.sellerId,
            true,
            record.codOf,
            record.codRm
          ]
        );
      }
    });

    logger.info('Bulk import completed', { imported: validRecords.length });

    return {
      success: true,
      imported: validRecords.length,
      errors: [],
      message: `Se importaron exitosamente ${validRecords.length} cliente(s)`
    };

  } catch (error) {
    logger.error('Error in bulk import', error);
    throw new DatabaseError('Error durante la importación masiva', error);
  }
}

module.exports = {
  bulkImportClients
};
