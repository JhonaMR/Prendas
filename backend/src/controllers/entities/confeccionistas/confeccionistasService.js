/**
 * Servicio de lógica de negocio para Confeccionistas
 */

const { getDatabase } = require('../../../config/database');
const { NotFoundError, DatabaseError } = require('../../shared/errorHandler');
const logger = require('../../shared/logger');

/**
 * Obtiene todos los confeccionistas
 */
function getAllConfeccionistas() {
  try {
    const db = getDatabase();

    const confeccionistas = db.prepare(`
      SELECT id, name, address, city, phone, score, active
      FROM confeccionistas
      ORDER BY id
    `).all();

    logger.info('Retrieved all confeccionistas', { count: confeccionistas.length });
    return confeccionistas;
  } catch (error) {
    logger.error('Error retrieving confeccionistas', error);
    throw new DatabaseError('Failed to retrieve confeccionistas', error);
  }
}

/**
 * Obtiene un confeccionista específico por ID
 */
function getConfeccionistaById(id) {
  try {
    const db = getDatabase();

    const confeccionista = db.prepare(`
      SELECT id, name, address, city, phone, score, active
      FROM confeccionistas
      WHERE id = ?
    `).get(id);

    if (!confeccionista) {
      throw new NotFoundError('Confeccionista', id);
    }

    logger.info('Retrieved confeccionista', { id });
    return confeccionista;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error retrieving confeccionista', error, { id });
    throw new DatabaseError('Failed to retrieve confeccionista', error);
  }
}

/**
 * Crea un nuevo confeccionista
 */
function createConfeccionista(data) {
  try {
    const db = getDatabase();

    db.prepare(`
      INSERT INTO confeccionistas (id, name, address, city, phone, score, active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(
      data.id,
      data.name,
      data.address,
      data.city,
      data.phone,
      data.score
    );

    logger.info('Created confeccionista', { id: data.id });
    return getConfeccionistaById(data.id);
  } catch (error) {
    logger.error('Error creating confeccionista', error, { data });
    throw new DatabaseError('Failed to create confeccionista', error);
  }
}

/**
 * Actualiza un confeccionista existente
 */
function updateConfeccionista(id, data) {
  try {
    const db = getDatabase();

    const existing = db.prepare('SELECT id FROM confeccionistas WHERE id = ?').get(id);
    if (!existing) {
      throw new NotFoundError('Confeccionista', id);
    }

    const updates = [];
    const values = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.address !== undefined) {
      updates.push('address = ?');
      values.push(data.address);
    }
    if (data.city !== undefined) {
      updates.push('city = ?');
      values.push(data.city);
    }
    if (data.phone !== undefined) {
      updates.push('phone = ?');
      values.push(data.phone);
    }
    if (data.score !== undefined) {
      updates.push('score = ?');
      values.push(data.score);
    }

    if (updates.length > 0) {
      values.push(id);
      const query = `UPDATE confeccionistas SET ${updates.join(', ')} WHERE id = ?`;
      db.prepare(query).run(...values);
    }

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
 */
function deleteConfeccionista(id) {
  try {
    const db = getDatabase();

    const existing = db.prepare('SELECT id FROM confeccionistas WHERE id = ?').get(id);
    if (!existing) {
      throw new NotFoundError('Confeccionista', id);
    }

    db.prepare('DELETE FROM confeccionistas WHERE id = ?').run(id);

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
