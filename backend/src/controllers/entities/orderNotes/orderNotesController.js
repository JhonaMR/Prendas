/**
 * Controller para order_notes
 * Maneja contacto y novedad por pedido (vista Clientes por Correría)
 * Relación 1:1 con orders — UPSERT: crea si no existe, actualiza si ya existe
 */

const { query } = require('../../../config/database');
const logger = require('../../shared/logger');

/**
 * GET /api/order-notes?orderIds=id1,id2,id3
 * Devuelve las notas para una lista de order_ids
 */
const getByOrderIds = async (req, res) => {
  try {
    const { orderIds } = req.query;
    if (!orderIds) {
      return res.json({ success: true, data: [] });
    }

    const ids = orderIds.split(',').map(id => id.trim()).filter(Boolean);
    if (ids.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Construir placeholders: $1, $2, ...
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
    const result = await query(
      `SELECT order_id, contacto, novedad, updated_at, updated_by
       FROM public.order_notes
       WHERE order_id IN (${placeholders})`,
      ids
    );

    return res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error('Error obteniendo order_notes:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener notas de pedidos' });
  }
};

/**
 * PUT /api/order-notes/:orderId
 * UPSERT: crea o actualiza la nota de un pedido
 * Body: { contacto, novedad }
 */
const upsert = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { contacto, novedad } = req.body;
    const updatedBy = req.user?.name || req.user?.id || 'sistema';

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId es requerido' });
    }

    // Verificar que el pedido existe
    const orderCheck = await query('SELECT id FROM public.orders WHERE id = $1', [orderId]);
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }

    // Si ambos campos están vacíos/null, eliminar la fila (no guardar vacíos)
    const contactoVal = contacto?.trim() || null;
    const novedadVal = novedad?.trim() || null;

    if (!contactoVal && !novedadVal) {
      await query('DELETE FROM public.order_notes WHERE order_id = $1', [orderId]);
      return res.json({ success: true, data: null, message: 'Nota eliminada (sin contenido)' });
    }

    const result = await query(
      `INSERT INTO public.order_notes (order_id, contacto, novedad, updated_at, updated_by)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
       ON CONFLICT (order_id) DO UPDATE
         SET contacto   = EXCLUDED.contacto,
             novedad    = EXCLUDED.novedad,
             updated_at = CURRENT_TIMESTAMP,
             updated_by = EXCLUDED.updated_by
       RETURNING order_id, contacto, novedad, updated_at, updated_by`,
      [orderId, contactoVal, novedadVal, updatedBy]
    );

    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error('Error en upsert order_notes:', error);
    return res.status(500).json({ success: false, message: 'Error al guardar nota del pedido' });
  }
};

/**
 * POST /api/order-notes/batch
 * Guarda múltiples notas de una vez
 * Body: { notes: [{ orderId, contacto, novedad }, ...] }
 */
const batchUpsert = async (req, res) => {
  try {
    const { notes } = req.body;
    const updatedBy = req.user?.name || req.user?.id || 'sistema';

    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      return res.status(400).json({ success: false, message: 'Se requiere un array de notas' });
    }

    const results = [];

    for (const note of notes) {
      const { orderId, contacto, novedad } = note;
      if (!orderId) continue;

      const contactoVal = contacto?.trim() || null;
      const novedadVal = novedad?.trim() || null;

      if (!contactoVal && !novedadVal) {
        await query('DELETE FROM public.order_notes WHERE order_id = $1', [orderId]);
        results.push({ orderId, deleted: true });
        continue;
      }

      const result = await query(
        `INSERT INTO public.order_notes (order_id, contacto, novedad, updated_at, updated_by)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
         ON CONFLICT (order_id) DO UPDATE
           SET contacto   = EXCLUDED.contacto,
               novedad    = EXCLUDED.novedad,
               updated_at = CURRENT_TIMESTAMP,
               updated_by = EXCLUDED.updated_by
         RETURNING order_id, contacto, novedad`,
        [orderId, contactoVal, novedadVal, updatedBy]
      );

      results.push(result.rows[0]);
    }

    return res.json({ success: true, data: results, message: `${results.length} nota(s) guardadas` });
  } catch (error) {
    logger.error('Error en batch upsert order_notes:', error);
    return res.status(500).json({ success: false, message: 'Error al guardar notas en lote' });
  }
};

module.exports = { getByOrderIds, upsert, batchUpsert };
