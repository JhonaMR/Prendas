/**
 * Servicio de lógica de negocio para Rutas de Transporte - POSTGRESQL
 */

const { query, transaction } = require('../../../config/database');
const { NotFoundError, DatabaseError } = require('../../shared/errorHandler');
const logger = require('../../shared/logger');

/**
 * Obtiene todas las rutas con sus items, opcionalmente filtradas por fecha
 */
async function getAllRutas(fecha) {
  try {
    const whereClause = fecha ? 'WHERE r.fecha = $1' : '';
    const params = fecha ? [fecha] : [];

    const rutasResult = await query(
      `SELECT r.id, r.fecha::text, r.transportista_id
       FROM rutas_transporte r
       ${whereClause}
       ORDER BY r.fecha DESC, r.transportista_id`,
      params
    );

    if (rutasResult.rows.length === 0) return [];

    const rutaIds = rutasResult.rows.map(r => r.id);
    const itemsResult = await query(
      `SELECT id, ruta_id, taller, celular, direccion, sector, detalle, servicio
       FROM rutas_transporte_items
       WHERE ruta_id = ANY($1)
       ORDER BY created_at ASC`,
      [rutaIds]
    );

    const itemsByRuta = {};
    for (const item of itemsResult.rows) {
      if (!itemsByRuta[item.ruta_id]) itemsByRuta[item.ruta_id] = [];
      itemsByRuta[item.ruta_id].push({
        id: item.id,
        taller: item.taller,
        celular: item.celular,
        direccion: item.direccion,
        sector: item.sector,
        detalle: item.detalle,
        servicio: item.servicio
      });
    }

    return rutasResult.rows.map(r => ({
      id: r.id,
      fecha: r.fecha,
      transportistaId: r.transportista_id,
      items: itemsByRuta[r.id] || []
    }));
  } catch (error) {
    logger.error('Error retrieving rutas', error);
    throw new DatabaseError('Failed to retrieve rutas', error);
  }
}

/**
 * Crea una ruta con su primer item
 */
async function createRuta(data) {
  try {
    await transaction(async (client) => {
      await client.query(
        `INSERT INTO rutas_transporte (id, fecha, transportista_id) VALUES ($1, $2, $3)`,
        [data.id, data.fecha, data.transportistaId]
      );
      for (const item of (data.items || [])) {
        await client.query(
          `INSERT INTO rutas_transporte_items (id, ruta_id, taller, celular, direccion, sector, detalle, servicio)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [item.id, data.id, item.taller || '', item.celular || '', item.direccion || '', item.sector || '', item.detalle || '', item.servicio || '']
        );
      }
    });
    logger.info('Created ruta', { id: data.id });
    const rutas = await getAllRutas();
    return rutas.find(r => r.id === data.id);
  } catch (error) {
    logger.error('Error creating ruta', error);
    throw new DatabaseError('Failed to create ruta', error);
  }
}

/**
 * Reemplaza completamente la lista de rutas de una fecha (sync completo desde frontend)
 * Recibe array de rutas con sus items y sincroniza el estado
 */
async function syncRutasPorFecha(fecha, rutas) {
  try {
    await transaction(async (client) => {
      // Obtener rutas existentes para esa fecha
      const existingResult = await client.query(
        `SELECT id FROM rutas_transporte WHERE fecha = $1`, [fecha]
      );
      const existingIds = existingResult.rows.map(r => r.id);
      const incomingIds = rutas.map(r => r.id);

      // Eliminar rutas que ya no existen
      const toDelete = existingIds.filter(id => !incomingIds.includes(id));
      for (const id of toDelete) {
        await client.query(`DELETE FROM rutas_transporte WHERE id = $1`, [id]);
      }

      for (const ruta of rutas) {
        const exists = existingIds.includes(ruta.id);
        if (!exists) {
          await client.query(
            `INSERT INTO rutas_transporte (id, fecha, transportista_id) VALUES ($1, $2, $3)`,
            [ruta.id, fecha, ruta.transportistaId]
          );
        }

        // Reemplazar items de esta ruta
        await client.query(`DELETE FROM rutas_transporte_items WHERE ruta_id = $1`, [ruta.id]);
        for (const item of (ruta.items || [])) {
          await client.query(
            `INSERT INTO rutas_transporte_items (id, ruta_id, taller, celular, direccion, sector, detalle, servicio)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [item.id, ruta.id, item.taller || '', item.celular || '', item.direccion || '', item.sector || '', item.detalle || '', item.servicio || '']
          );
        }
      }
    });

    logger.info('Synced rutas for fecha', { fecha, count: rutas.length });
    return getAllRutas(fecha);
  } catch (error) {
    logger.error('Error syncing rutas', error);
    throw new DatabaseError('Failed to sync rutas', error);
  }
}

async function deleteRuta(id) {
  try {
    const existing = await query('SELECT id FROM rutas_transporte WHERE id = $1', [id]);
    if (existing.rows.length === 0) throw new NotFoundError('Ruta', id);
    await query('DELETE FROM rutas_transporte WHERE id = $1', [id]);
    logger.info('Deleted ruta', { id });
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError('Failed to delete ruta', error);
  }
}

module.exports = { getAllRutas, createRuta, syncRutasPorFecha, deleteRuta };
