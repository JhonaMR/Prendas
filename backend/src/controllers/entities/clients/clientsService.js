/**
 * Servicio de lógica de negocio para Clients
 */

const { getDatabase } = require('../../../config/database');
const { NotFoundError, DatabaseError } = require('../../shared/errorHandler');
const logger = require('../../shared/logger');

/**
 * Obtiene todos los clientes
 */
function getAllClients() {
  try {
    const db = getDatabase();

    const clients = db.prepare(`
      SELECT id, name, nit, address, city, seller, active
      FROM clients
      ORDER BY id
    `).all();

    logger.info('Retrieved all clients', { count: clients.length });
    return clients;
  } catch (error) {
    logger.error('Error retrieving clients', error);
    throw new DatabaseError('Failed to retrieve clients', error);
  }
}

/**
 * Obtiene un cliente específico por ID
 */
function getClientById(id) {
  try {
    const db = getDatabase();

    const client = db.prepare(`
      SELECT id, name, nit, address, city, seller, active
      FROM clients
      WHERE id = ?
    `).get(id);

    if (!client) {
      throw new NotFoundError('Client', id);
    }

    logger.info('Retrieved client', { id });
    return client;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error retrieving client', error, { id });
    throw new DatabaseError('Failed to retrieve client', error);
  }
}

/**
 * Crea un nuevo cliente
 */
function createClient(data) {
  try {
    const db = getDatabase();

    db.prepare(`
      INSERT INTO clients (id, name, nit, address, city, seller, active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(
      data.id,
      data.name,
      data.nit,
      data.address,
      data.city,
      data.seller
    );

    logger.info('Created client', { id: data.id });
    return getClientById(data.id);
  } catch (error) {
    logger.error('Error creating client', error, { data });
    throw new DatabaseError('Failed to create client', error);
  }
}

/**
 * Actualiza un cliente existente
 */
function updateClient(id, data) {
  try {
    const db = getDatabase();

    // Verificar que el cliente existe
    const existing = db.prepare('SELECT id FROM clients WHERE id = ?').get(id);
    if (!existing) {
      throw new NotFoundError('Client', id);
    }

    const updates = [];
    const values = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.nit !== undefined) {
      updates.push('nit = ?');
      values.push(data.nit);
    }
    if (data.address !== undefined) {
      updates.push('address = ?');
      values.push(data.address);
    }
    if (data.city !== undefined) {
      updates.push('city = ?');
      values.push(data.city);
    }
    if (data.seller !== undefined) {
      updates.push('seller = ?');
      values.push(data.seller);
    }

    if (updates.length > 0) {
      values.push(id);
      const query = `UPDATE clients SET ${updates.join(', ')} WHERE id = ?`;
      db.prepare(query).run(...values);
    }

    logger.info('Updated client', { id });
    return getClientById(id);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error updating client', error, { id, data });
    throw new DatabaseError('Failed to update client', error);
  }
}

/**
 * Elimina un cliente
 */
function deleteClient(id) {
  try {
    const db = getDatabase();

    // Verificar que el cliente existe
    const existing = db.prepare('SELECT id FROM clients WHERE id = ?').get(id);
    if (!existing) {
      throw new NotFoundError('Client', id);
    }

    db.prepare('DELETE FROM clients WHERE id = ?').run(id);

    logger.info('Deleted client', { id });
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error deleting client', error, { id });
    throw new DatabaseError('Failed to delete client', error);
  }
}

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};
