/**
 * Servicio de lógica de negocio para Sellers - POSTGRESQL
 */

const { query } = require('../../../config/database');
const { NotFoundError, DatabaseError } = require('../../shared/errorHandler');
const logger = require('../../shared/logger');
const { invalidateOnCreate, invalidateOnUpdate, invalidateOnDelete } = require('../../../services/CacheInvalidationService');

/**
 * @async
 */
async function getAllSellers() {
  try {
    const result = await query('SELECT id, name, active FROM sellers ORDER BY id');
    logger.info('Retrieved all sellers', { count: result.rows.length });
    return result.rows;
  } catch (error) {
    logger.error('Error retrieving sellers', error);
    throw new DatabaseError('Failed to retrieve sellers', error);
  }
}

/**
 * @async
 */
async function getSellerById(id) {
  try {
    const result = await query('SELECT id, name, active FROM sellers WHERE id = $1', [id]);
    if (result.rows.length === 0) throw new NotFoundError('Seller', id);
    logger.info('Retrieved seller', { id });
    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error retrieving seller', error, { id });
    throw new DatabaseError('Failed to retrieve seller', error);
  }
}

/**
 * @async
 */
async function createSeller(data) {
  try {
    await query('INSERT INTO sellers (id, name, active) VALUES ($1, $2, $3)', [data.id, data.name, true]);
    
    // Invalidate cache after creation
    invalidateOnCreate('Seller');
    
    logger.info('Created seller', { id: data.id });
    return getSellerById(data.id);
  } catch (error) {
    logger.error('Error creating seller', error, { data });
    throw new DatabaseError('Failed to create seller', error);
  }
}

/**
 * @async
 */
async function updateSeller(id, data) {
  try {
    const existingResult = await query('SELECT id FROM sellers WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) throw new NotFoundError('Seller', id);

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }

    if (updates.length > 0) {
      values.push(id);
      const query_str = `UPDATE sellers SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
      await query(query_str, values);
    }

    // Invalidate cache after update
    invalidateOnUpdate('Seller');

    logger.info('Updated seller', { id });
    return getSellerById(id);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error updating seller', error, { id, data });
    throw new DatabaseError('Failed to update seller', error);
  }
}

/**
 * @async
 */
async function deleteSeller(id) {
  try {
    const existingResult = await query('SELECT id FROM sellers WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) throw new NotFoundError('Seller', id);
    await query('DELETE FROM sellers WHERE id = $1', [id]);
    
    // Invalidate cache after deletion
    invalidateOnDelete('Seller');
    
    logger.info('Deleted seller', { id });
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error deleting seller', error, { id });
    throw new DatabaseError('Failed to delete seller', error);
  }
}

module.exports = {
  getAllSellers,
  getSellerById,
  createSeller,
  updateSeller,
  deleteSeller
};
