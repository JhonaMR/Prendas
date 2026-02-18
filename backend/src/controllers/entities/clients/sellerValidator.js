/**
 * Validador de Vendedores para Clientes
 * 
 * Proporciona funciones para validar que los IDs de vendedores
 * existan en la tabla de vendedores.
 */

const { query } = require('../../../config/database');
const logger = require('../../shared/logger');

/**
 * Valida que un sellerId existe en la tabla de vendedores
 * 
 * @param {string} sellerId - ID del vendedor a validar
 * @returns {object} { valid: boolean, error?: string }
 */
async function validateSellerId(sellerId) {
  try {
    if (!sellerId) {
      return {
        valid: false,
        error: 'Seller ID is required'
      };
    }

    const result = await query('SELECT id FROM sellers WHERE id = $1', [sellerId]);

    if (result.rows.length === 0) {
      logger.warn('Seller not found', { sellerId });
      return {
        valid: false,
        error: `Seller with ID '${sellerId}' not found`
      };
    }

    return { valid: true };
  } catch (error) {
    logger.error('Error validating seller ID', error, { sellerId });
    return {
      valid: false,
      error: 'Error validating seller'
    };
  }
}

module.exports = {
  validateSellerId
};
