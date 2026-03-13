/**
 * Servicio de lógica de negocio para Novedades de Correría
 */

const { query, transaction } = require('../../../config/database');
const { DatabaseError } = require('../../shared/errorHandler');
const logger = require('../../shared/logger');

/**
 * Obtener todas las novedades de una correría
 * @param {string} correriaId 
 */
async function getNovedadesByCorreria(correriaId) {
  try {
    const result = await query(
      'SELECT id, contenido, created_at FROM correria_novedades WHERE correria_id = $1 ORDER BY id ASC',
      [correriaId]
    );
    return result.rows;
  } catch (error) {
    logger.error('Error al obtener novedades de correría', error, { correriaId });
    throw new DatabaseError('Error al obtener novedades de correría', error);
  }
}

/**
 * Guardar novedades de forma masiva (reemplaza las existentes)
 * @param {string} correriaId 
 * @param {string[]} novedades - Array de textos de novedades
 */
async function saveNovedadesBatch(correriaId, novedades) {
  return await transaction(async (client) => {
    try {
      // 1. Eliminar novedades anteriores
      await client.query('DELETE FROM correria_novedades WHERE correria_id = $1', [correriaId]);

      // 2. Insertar las nuevas
      if (novedades && novedades.length > 0) {
        for (const novedad of novedades) {
          if (novedad && novedad.trim()) {
            await client.query(
              'INSERT INTO correria_novedades (correria_id, contenido) VALUES ($1, $2)',
              [correriaId, novedad.trim()]
            );
          }
        }
      }

      logger.info('Novedades guardadas exitosamente', { correriaId, count: novedades.length });
      
      // Retornar las nuevas novedades guardadas
      const result = await client.query(
        'SELECT id, contenido, created_at FROM correria_novedades WHERE correria_id = $1 ORDER BY id ASC',
        [correriaId]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error en transacción de guardar novedades', error, { correriaId });
      throw new DatabaseError('Error al guardar novedades', error);
    }
  });
}

module.exports = {
  getNovedadesByCorreria,
  saveNovedadesBatch
};
