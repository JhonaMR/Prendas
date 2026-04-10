/**
 * Servicio de lógica de negocio para Transportistas - POSTGRESQL
 */

const { query } = require('../../../config/database');
const { NotFoundError, DatabaseError } = require('../../shared/errorHandler');
const logger = require('../../shared/logger');

async function getAllTransportistas() {
  try {
    const result = await query(
      `SELECT id, nombre, celular, picoyplaca, color_key FROM transportistas ORDER BY nombre`
    );
    return result.rows;
  } catch (error) {
    logger.error('Error retrieving transportistas', error);
    throw new DatabaseError('Failed to retrieve transportistas', error);
  }
}

async function getTransportistaById(id) {
  try {
    const result = await query(
      `SELECT id, nombre, celular, picoyplaca, color_key FROM transportistas WHERE id = $1`, [id]
    );
    if (result.rows.length === 0) throw new NotFoundError('Transportista', id);
    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError('Failed to retrieve transportista', error);
  }
}

async function createTransportista(data) {
  try {
    await query(
      `INSERT INTO transportistas (id, nombre, celular, picoyplaca, color_key)
       VALUES ($1, $2, $3, $4, $5)`,
      [data.id, data.nombre, data.celular || '', data.picoyplaca || '', data.colorKey || data.color_key || 'red']
    );
    logger.info('Created transportista', { id: data.id });
    return getTransportistaById(data.id);
  } catch (error) {
    logger.error('Error creating transportista', error);
    throw new DatabaseError('Failed to create transportista', error);
  }
}

async function updateTransportista(id, data) {
  try {
    const existing = await query('SELECT id FROM transportistas WHERE id = $1', [id]);
    if (existing.rows.length === 0) throw new NotFoundError('Transportista', id);

    const updates = [];
    const values = [];
    let i = 1;

    if (data.nombre    !== undefined) { updates.push(`nombre = $${i++}`);    values.push(data.nombre); }
    if (data.celular   !== undefined) { updates.push(`celular = $${i++}`);   values.push(data.celular); }
    if (data.picoyplaca !== undefined) { updates.push(`picoyplaca = $${i++}`); values.push(data.picoyplaca); }
    const colorKey = data.colorKey || data.color_key;
    if (colorKey !== undefined) { updates.push(`color_key = $${i++}`); values.push(colorKey); }

    if (updates.length > 0) {
      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);
      await query(`UPDATE transportistas SET ${updates.join(', ')} WHERE id = $${i}`, values);
    }

    logger.info('Updated transportista', { id });
    return getTransportistaById(id);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError('Failed to update transportista', error);
  }
}

async function deleteTransportista(id) {
  try {
    const existing = await query('SELECT id FROM transportistas WHERE id = $1', [id]);
    if (existing.rows.length === 0) throw new NotFoundError('Transportista', id);
    await query('DELETE FROM transportistas WHERE id = $1', [id]);
    logger.info('Deleted transportista', { id });
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError('Failed to delete transportista', error);
  }
}

module.exports = { getAllTransportistas, getTransportistaById, createTransportista, updateTransportista, deleteTransportista };
