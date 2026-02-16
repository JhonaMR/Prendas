/**
 * Servicio de lógica de negocio para Correrias
 */

const { getDatabase } = require('../../../config/database');
const { NotFoundError, DatabaseError } = require('../../shared/errorHandler');
const logger = require('../../shared/logger');

function getAllCorrerias() {
  try {
    const db = getDatabase();
    const correrias = db.prepare('SELECT id, name, year, active FROM correrias ORDER BY year DESC, id').all();
    logger.info('Retrieved all correrias', { count: correrias.length });
    return correrias;
  } catch (error) {
    logger.error('Error retrieving correrias', error);
    throw new DatabaseError('Failed to retrieve correrias', error);
  }
}

function getCorrieriaById(id) {
  try {
    const db = getDatabase();
    const correria = db.prepare('SELECT id, name, year, active FROM correrias WHERE id = ?').get(id);
    if (!correria) throw new NotFoundError('Correria', id);
    logger.info('Retrieved correria', { id });
    return correria;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error retrieving correria', error, { id });
    throw new DatabaseError('Failed to retrieve correria', error);
  }
}

function createCorreria(data) {
  try {
    const db = getDatabase();
    db.prepare('INSERT INTO correrias (id, name, year, active) VALUES (?, ?, ?, 1)').run(
      data.id,
      data.name,
      data.year
    );
    logger.info('Created correria', { id: data.id });
    return getCorrieriaById(data.id);
  } catch (error) {
    logger.error('Error creating correria', error, { data });
    throw new DatabaseError('Failed to create correria', error);
  }
}

function updateCorreria(id, data) {
  try {
    const db = getDatabase();
    const existing = db.prepare('SELECT id FROM correrias WHERE id = ?').get(id);
    if (!existing) throw new NotFoundError('Correria', id);

    const updates = [];
    const values = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.year !== undefined) {
      updates.push('year = ?');
      values.push(data.year);
    }

    if (updates.length > 0) {
      values.push(id);
      const query = `UPDATE correrias SET ${updates.join(', ')} WHERE id = ?`;
      db.prepare(query).run(...values);
    }

    logger.info('Updated correria', { id });
    return getCorrieriaById(id);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error updating correria', error, { id, data });
    throw new DatabaseError('Failed to update correria', error);
  }
}

function deleteCorreria(id) {
  try {
    const db = getDatabase();
    const existing = db.prepare('SELECT id FROM correrias WHERE id = ?').get(id);
    if (!existing) throw new NotFoundError('Correria', id);
    db.prepare('DELETE FROM correrias WHERE id = ?').run(id);
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
