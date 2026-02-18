/**
 * Servicio de lógica de negocio para Confeccionistas - POSTGRESQL
 */

const { query } = require('../../../config/database');
const { NotFoundError, DatabaseError } = require('../../shared/errorHandler');
const logger = require('../../shared/logger');
const { invalidateOnCreate, invalidateOnUpdate, invalidateOnDelete } = require('../../../services/CacheInvalidationService');

/**
 * Obtiene todos los confeccionistas
 * @async
 */
async function getAllConfeccionistas() {
  try {
    const result = await query(`
      SELECT id, name, address, city, phone, score, active
      FROM confeccionistas
      ORDER BY id
    `);

    logger.info('Retrieved all confeccionistas', { count: result.rows.length });
    return result.rows;
  } catch (error) {
    logger.error('Error retrieving confeccionistas', error);
    throw new DatabaseError('Failed to retrieve confeccionistas', error);
  }
}

/**
 * Obtiene un confeccionista específico por ID
 * @async
 */
async function getConfeccionistaById(id) {
  try {
    const result = await query(`
      SELECT id, name, address, city, phone, score, active
      FROM confeccionistas
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Confeccionista', id);
    }

    logger.info('Retrieved confeccionista', { id });
    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error retrieving confeccionista', error, { id });
    throw new DatabaseError('Failed to retrieve confeccionista', error);
  }
}

/**
 * Crea un nuevo confeccionista
 * @async
 */
async function createConfeccionista(data) {
  try {
    await query(`
      INSERT INTO confeccionistas (id, name, address, city, phone, score, active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      data.id,
      data.name,
      data.address,
      data.city,
      data.phone,
      data.score,
      true
    ]);

    // Invalidate cache after creation
    invalidateOnCreate('Confeccionista');

    logger.info('Created confeccionista', { id: data.id });
    return getConfeccionistaById(data.id);
  } catch (error) {
    logger.error('Error creating confeccionista', error, { data });
    throw new DatabaseError('Failed to create confeccionista', error);
  }
}

/**
 * Actualiza un confeccionista existente
 * @async
 */
async function updateConfeccionista(id, data) {
  try {
    const existingResult = await query('SELECT id FROM confeccionistas WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      throw new NotFoundError('Confeccionista', id);
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.address !== undefined) {
      updates.push(`address = $${paramIndex++}`);
      values.push(data.address);
    }
    if (data.city !== undefined) {
      updates.push(`city = $${paramIndex++}`);
      values.push(data.city);
    }
    if (data.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(data.phone);
    }
    if (data.score !== undefined) {
      updates.push(`score = $${paramIndex++}`);
      values.push(data.score);
    }

    if (updates.length > 0) {
      values.push(id);
      const query_str = `UPDATE confeccionistas SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
      await query(query_str, values);
    }

    // Invalidate cache after update
    invalidateOnUpdate('Confeccionista');

    logger.info('Updated confeccionista', { id });
    return getConfeccionistaById(id);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error updating confeccionista', error, { id, data });
    throw new DatabaseError('Failed to update confeccionista', error);
  }
}

/**
 * Elimina un confeccionista
 * @async
 */
async function deleteConfeccionista(id) {
  try {
    const existingResult = await query('SELECT id FROM confeccionistas WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      throw new NotFoundError('Confeccionista', id);
    }

    await query('DELETE FROM confeccionistas WHERE id = $1', [id]);

    // Invalidate cache after deletion
    invalidateOnDelete('Confeccionista');

    logger.info('Deleted confeccionista', { id });
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error deleting confeccionista', error, { id });
    throw new DatabaseError('Failed to delete confeccionista', error);
  }
}

module.exports = {
  getAllConfeccionistas,
  getConfeccionistaById,
  createConfeccionista,
  updateConfeccionista,
  deleteConfeccionista
};
