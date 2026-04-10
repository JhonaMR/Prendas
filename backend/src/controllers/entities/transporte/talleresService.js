/**
 * Servicio de lógica de negocio para Talleres - POSTGRESQL
 */

const { query } = require('../../../config/database');
const { NotFoundError, DatabaseError } = require('../../shared/errorHandler');
const logger = require('../../shared/logger');

async function getAllTalleres() {
  try {
    const result = await query(
      `SELECT id, nombre, celular, direccion, sector, estado FROM talleres ORDER BY nombre`
    );
    return result.rows;
  } catch (error) {
    logger.error('Error retrieving talleres', error);
    throw new DatabaseError('Failed to retrieve talleres', error);
  }
}

async function getTallerById(id) {
  try {
    const result = await query(
      `SELECT id, nombre, celular, direccion, sector, estado FROM talleres WHERE id = $1`, [id]
    );
    if (result.rows.length === 0) throw new NotFoundError('Taller', id);
    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError('Failed to retrieve taller', error);
  }
}

async function createTaller(data) {
  try {
    await query(
      `INSERT INTO talleres (id, nombre, celular, direccion, sector, estado)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [data.id, data.nombre, data.celular || '', data.direccion || '', data.sector || '', data.estado || 'activo']
    );
    logger.info('Created taller', { id: data.id });
    return getTallerById(data.id);
  } catch (error) {
    logger.error('Error creating taller', error);
    throw new DatabaseError('Failed to create taller', error);
  }
}

async function updateTaller(id, data) {
  try {
    const existing = await query('SELECT id FROM talleres WHERE id = $1', [id]);
    if (existing.rows.length === 0) throw new NotFoundError('Taller', id);

    const updates = [];
    const values = [];
    let i = 1;

    if (data.nombre    !== undefined) { updates.push(`nombre = $${i++}`);    values.push(data.nombre); }
    if (data.celular   !== undefined) { updates.push(`celular = $${i++}`);   values.push(data.celular); }
    if (data.direccion !== undefined) { updates.push(`direccion = $${i++}`); values.push(data.direccion); }
    if (data.sector    !== undefined) { updates.push(`sector = $${i++}`);    values.push(data.sector); }
    if (data.estado    !== undefined) { updates.push(`estado = $${i++}`);    values.push(data.estado); }

    if (updates.length > 0) {
      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);
      await query(`UPDATE talleres SET ${updates.join(', ')} WHERE id = $${i}`, values);
    }

    logger.info('Updated taller', { id });
    return getTallerById(id);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError('Failed to update taller', error);
  }
}

async function deleteTaller(id) {
  try {
    const existing = await query('SELECT id FROM talleres WHERE id = $1', [id]);
    if (existing.rows.length === 0) throw new NotFoundError('Taller', id);
    await query('DELETE FROM talleres WHERE id = $1', [id]);
    logger.info('Deleted taller', { id });
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError('Failed to delete taller', error);
  }
}

module.exports = { getAllTalleres, getTallerById, createTaller, updateTaller, deleteTaller };
