/**
 * Servicio de lógica de negocio para Correrias - POSTGRESQL
 */

const { query } = require('../../../config/database');
const { NotFoundError, DatabaseError } = require('../../shared/errorHandler');
const logger = require('../../shared/logger');
const { invalidateOnCreate, invalidateOnUpdate, invalidateOnDelete } = require('../../../services/CacheInvalidationService');

/**
 * @async
 */
async function getAllCorrerias() {
  try {
    const result = await query('SELECT id, name, year, active FROM correrias ORDER BY year DESC, id');
    logger.info('Retrieved all correrias', { count: result.rows.length });
    return result.rows;
  } catch (error) {
    logger.error('Error retrieving correrias', error);
    throw new DatabaseError('Failed to retrieve correrias', error);
  }
}

/**
 * @async
 */
async function getCorrieriaById(id) {
  try {
    const result = await query('SELECT id, name, year, active FROM correrias WHERE id = $1', [id]);
    if (result.rows.length === 0) throw new NotFoundError('Correria', id);
    logger.info('Retrieved correria', { id });
    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error retrieving correria', error, { id });
    throw new DatabaseError('Failed to retrieve correria', error);
  }
}

/**
 * @async
 */
async function createCorreria(data) {
  try {
    await query('INSERT INTO correrias (id, name, year, active) VALUES ($1, $2, $3, $4)', [
      data.id,
      data.name,
      data.year,
      true
    ]);
    
    // Invalidate cache after creation
    invalidateOnCreate('Correria');
    
    logger.info('Created correria', { id: data.id });
    return getCorrieriaById(data.id);
  } catch (error) {
    logger.error('Error creating correria', error, { data });
    throw new DatabaseError('Failed to create correria', error);
  }
}

/**
 * @async
 */
async function updateCorreria(id, data) {
  try {
    const existingResult = await query('SELECT id FROM correrias WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) throw new NotFoundError('Correria', id);

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.year !== undefined) {
      updates.push(`year = $${paramIndex++}`);
      values.push(data.year);
    }

    if (updates.length > 0) {
      values.push(id);
      const query_str = `UPDATE correrias SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
      await query(query_str, values);
    }

    // Invalidate cache after update
    invalidateOnUpdate('Correria');

    logger.info('Updated correria', { id });
    return getCorrieriaById(id);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error updating correria', error, { id, data });
    throw new DatabaseError('Failed to update correria', error);
  }
}

/**
 * @async
 */
async function deleteCorreria(id) {
  try {
    const existingResult = await query('SELECT id FROM correrias WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) throw new NotFoundError('Correria', id);
    await query('DELETE FROM correrias WHERE id = $1', [id]);
    
    // Invalidate cache after deletion
    invalidateOnDelete('Correria');
    
    logger.info('Deleted correria', { id });
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error deleting correria', error, { id });
    throw new DatabaseError('Failed to delete correria', error);
  }
}

module.exports = {
  getAllCorrerias,
  getCorrieriaById,
  createCorreria,
  updateCorreria,
  deleteCorreria
};
