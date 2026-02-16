/**
 * Servicio de lógica de negocio para Sellers
 */

const { getDatabase } = require('../../../config/database');
const { NotFoundError, DatabaseError } = require('../../shared/errorHandler');
const logger = require('../../shared/logger');

function getAllSellers() {
  try {
    const db = getDatabase();
    const sellers = db.prepare('SELECT id, name, active FROM sellers ORDER BY id').all();
    logger.info('Retrieved all sellers', { count: sellers.length });
    return sellers;
  } catch (error) {
    logger.error('Error retrieving sellers', error);
    throw new DatabaseError('Failed to retrieve sellers', error);
  }
}

function getSellerById(id) {
  try {
    const db = getDatabase();
    const seller = db.prepare('SELECT id, name, active FROM sellers WHERE id = ?').get(id);
    if (!seller) throw new NotFoundError('Seller', id);
    logger.info('Retrieved seller', { id });
    return seller;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error retrieving seller', error, { id });
    throw new DatabaseError('Failed to retrieve seller', error);
  }
}

function createSeller(data) {
  try {
    const db = getDatabase();
    db.prepare('INSERT INTO sellers (id, name, active) VALUES (?, ?, 1)').run(data.id, data.name);
    logger.info('Created seller', { id: data.id });
    return getSellerById(data.id);
  } catch (error) {
    logger.error('Error creating seller', error, { data });
    throw new DatabaseError('Failed to create seller', error);
  }
}

function updateSeller(id, data) {
  try {
    const db = getDatabase();
    const existing = db.prepare('SELECT id FROM sellers WHERE id = ?').get(id);
    if (!existing) throw new NotFoundError('Seller', id);

    const updates = [];
    const values = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }

    if (updates.length > 0) {
      values.push(id);
      const query = `UPDATE sellers SET ${updates.join(', ')} WHERE id = ?`;
      db.prepare(query).run(...values);
    }

    logger.info('Updated seller', { id });
    return getSellerById(id);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error updating seller', error, { id, data });
    throw new DatabaseError('Failed to update seller', error);
  }
}

function deleteSeller(id) {
  try {
    const db = getDatabase();
    const existing = db.prepare('SELECT id FROM sellers WHERE id = ?').get(id);
    if (!existing) throw new NotFoundError('Seller', id);
    db.prepare('DELETE FROM sellers WHERE id = ?').run(id);
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
