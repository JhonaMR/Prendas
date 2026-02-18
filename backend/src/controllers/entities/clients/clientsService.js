/**
 * Servicio de lógica de negocio para Clients - POSTGRESQL
 */

const { query } = require('../../../config/database');
const { NotFoundError, DatabaseError } = require('../../shared/errorHandler');
const logger = require('../../shared/logger');
const { invalidateOnCreate, invalidateOnUpdate, invalidateOnDelete } = require('../../../services/CacheInvalidationService');
const { validateSellerId } = require('./sellerValidator');

/**
 * Obtiene todos los clientes
 * @async
 */
async function getAllClients() {
  try {
    const result = await query(`
      SELECT id, name, nit, address, city, seller_id
      FROM clients
      ORDER BY id
    `);

    logger.info('Retrieved all clients', { count: result.rows.length });
    return result.rows;
  } catch (error) {
    logger.error('Error retrieving clients', error);
    throw new DatabaseError('Failed to retrieve clients', error);
  }
}

/**
 * Obtiene un cliente específico por ID
 * @async
 */
async function getClientById(id) {
  try {
    const result = await query(`
      SELECT id, name, nit, address, city, seller_id
      FROM clients
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Client', id);
    }

    logger.info('Retrieved client', { id });
    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error retrieving client', error, { id });
    throw new DatabaseError('Failed to retrieve client', error);
  }
}

/**
 * Crea un nuevo cliente
 * @async
 */
async function createClient(data) {
  try {
    // Validar que el vendedor existe
    const validation = await validateSellerId(data.seller_id || data.sellerId);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const sellerId = data.seller_id || data.sellerId;

    await query(`
      INSERT INTO clients (id, name, nit, address, city, seller_id)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      data.id,
      data.name,
      data.nit,
      data.address,
      data.city,
      sellerId
    ]);

    // Invalidate cache after creation
    invalidateOnCreate('Client');

    logger.info('Created client', { id: data.id });
    return getClientById(data.id);
  } catch (error) {
    logger.error('Error creating client', error, { data });
    throw new DatabaseError('Failed to create client', error);
  }
}

/**
 * Actualiza un cliente existente
 * @async
 */
async function updateClient(id, data) {
  try {
    // Verificar que el cliente existe
    const existingResult = await query('SELECT id FROM clients WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      throw new NotFoundError('Client', id);
    }

    // Validar que el vendedor existe si se está actualizando
    if (data.seller_id !== undefined || data.sellerId !== undefined) {
      const sellerId = data.seller_id || data.sellerId;
      const validation = await validateSellerId(sellerId);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.nit !== undefined) {
      updates.push(`nit = $${paramIndex++}`);
      values.push(data.nit);
    }
    if (data.address !== undefined) {
      updates.push(`address = $${paramIndex++}`);
      values.push(data.address);
    }
    if (data.city !== undefined) {
      updates.push(`city = $${paramIndex++}`);
      values.push(data.city);
    }
    if (data.seller_id !== undefined || data.sellerId !== undefined) {
      updates.push(`seller_id = $${paramIndex++}`);
      values.push(data.seller_id || data.sellerId);
    }

    if (updates.length > 0) {
      // Agregar updated_at automáticamente
      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      
      // Agregar el ID como último parámetro para el WHERE clause
      values.push(id);
      
      // Construir la consulta SQL
      const setClause = updates.join(', ');
      const query_str = `UPDATE clients SET ${setClause} WHERE id = $${paramIndex}`;
      await query(query_str, values);
    }

    // Invalidate cache after update
    invalidateOnUpdate('Client');

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
 * @async
 */
async function deleteClient(id) {
  try {
    // Verificar que el cliente existe
    const existingResult = await query('SELECT id FROM clients WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      throw new NotFoundError('Client', id);
    }

    await query('DELETE FROM clients WHERE id = $1', [id]);

    // Invalidate cache after deletion
    invalidateOnDelete('Client');

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