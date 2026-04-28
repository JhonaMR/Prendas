// ============================================
// CONTROLADOR: Salidas de Bodega
// ============================================
//
// Lógica de stock:
//   - Crear salida          → descuenta cantidad del inventario (como un despacho)
//   - Poner fecha_devolucion → suma cantidad de vuelta (mercancía regresó)
//   - Quitar fecha_devolucion → descuenta de nuevo (mercancía salió otra vez)
//   - Eliminar salida        → suma cantidad de vuelta (como si nunca hubiera salido)
//
// El stock se calcula dinámicamente en el frontend (InventoryView):
//   available = recepciones - despachos
// Para que las salidas de bodega participen en ese cálculo, las registramos
// en la tabla dispatch_items usando un dispatch_id especial por salida,
// y las retiramos cuando hay devolución.
// Sin embargo, para mantener la arquitectura simple y no contaminar dispatches,
// usamos la tabla salidas_bodega de forma independiente y el frontend
// sumará/restará según fecha_devolucion al calcular el stock.
// ============================================

const { query, transaction } = require('../config/database');

// ── helpers ──────────────────────────────────────────────────────────────────

function toDate(v) {
  return (!v || v === '') ? null : v;
}

function mapRow(r) {
  return {
    id:              r.id,
    fecha:           r.fecha ? r.fecha.toISOString().split('T')[0] : '',
    referencia:      r.referencia,
    cantidad:        r.cantidad,
    talla:           r.talla || '',
    quienRecibe:     r.quien_recibe,
    fechaDevolucion: r.fecha_devolucion ? r.fecha_devolucion.toISOString().split('T')[0] : '',
    createdBy:       r.created_by,
    createdAt:       r.created_at,
    updatedAt:       r.updated_at,
  };
}

// ── GET /salidas-bodega ───────────────────────────────────────────────────────

const getAll = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM salidas_bodega ORDER BY fecha DESC, created_at DESC'
    );
    return res.json({ success: true, data: result.rows.map(mapRow) });
  } catch (e) {
    console.error('❌ Error salidas_bodega getAll:', e);
    return res.status(500).json({ success: false, message: 'Error al obtener salidas de bodega' });
  }
};

// ── POST /salidas-bodega ──────────────────────────────────────────────────────
// Crea una nueva salida. La cantidad queda fija — no se puede editar después.

const create = async (req, res) => {
  try {
    const { fecha, referencia, cantidad, talla, quienRecibe, fechaDevolucion } = req.body;
    const createdBy = req.user?.name || req.user?.id || null;

    if (!referencia || !cantidad || cantidad <= 0) {
      return res.status(400).json({ success: false, message: 'referencia y cantidad son requeridos' });
    }

    const result = await query(`
      INSERT INTO salidas_bodega
        (fecha, referencia, cantidad, talla, quien_recibe, fecha_devolucion, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      toDate(fecha) || new Date().toISOString().split('T')[0],
      referencia.trim(),
      parseInt(cantidad),
      talla || '',
      quienRecibe || '',
      toDate(fechaDevolucion),
      createdBy,
    ]);

    return res.status(201).json({ success: true, data: mapRow(result.rows[0]) });
  } catch (e) {
    console.error('❌ Error salidas_bodega create:', e);
    return res.status(500).json({ success: false, message: 'Error al crear salida de bodega' });
  }
};

// ── POST /salidas-bodega/batch ────────────────────────────────────────────────
// Carga masiva desde Excel (solo Soporte). Usa UPSERT por id.

const createBatch = async (req, res) => {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'rows debe ser un array no vacío' });
    }

    const createdBy = req.user?.name || req.user?.id || null;
    const inserted = [];

    for (const d of rows) {
      if (!d.referencia || !d.cantidad) continue;
      const result = await query(`
        INSERT INTO salidas_bodega
          (id, fecha, referencia, cantidad, talla, quien_recibe, fecha_devolucion, created_by)
        VALUES
          (COALESCE($1, gen_random_uuid()), $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          fecha            = EXCLUDED.fecha,
          referencia       = EXCLUDED.referencia,
          cantidad         = EXCLUDED.cantidad,
          talla            = EXCLUDED.talla,
          quien_recibe     = EXCLUDED.quien_recibe,
          fecha_devolucion = EXCLUDED.fecha_devolucion,
          updated_at       = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        d.id || null,
        toDate(d.fecha) || new Date().toISOString().split('T')[0],
        d.referencia.trim(),
        parseInt(d.cantidad) || 0,
        d.talla || '',
        d.quienRecibe || '',
        toDate(d.fechaDevolucion),
        createdBy,
      ]);
      inserted.push(mapRow(result.rows[0]));
    }

    return res.json({ success: true, data: inserted, count: inserted.length });
  } catch (e) {
    console.error('❌ Error salidas_bodega batch:', e);
    return res.status(500).json({ success: false, message: 'Error en carga masiva' });
  }
};

// ── PATCH /salidas-bodega/:id/devolucion ──────────────────────────────────────
// Actualiza solo la fecha de devolución.
// - Poner fecha   → mercancía regresó (stock sube)
// - Quitar fecha  → mercancía salió de nuevo (stock baja) — solo admin/soporte

const updateDevolucion = async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaDevolucion } = req.body;

    // Verificar que la salida existe
    const existing = await query('SELECT * FROM salidas_bodega WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Salida no encontrada' });
    }

    const result = await query(`
      UPDATE salidas_bodega
      SET fecha_devolucion = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [toDate(fechaDevolucion), id]);

    return res.json({ success: true, data: mapRow(result.rows[0]) });
  } catch (e) {
    console.error('❌ Error salidas_bodega updateDevolucion:', e);
    return res.status(500).json({ success: false, message: 'Error al actualizar devolución' });
  }
};

// ── DELETE /salidas-bodega/:id ────────────────────────────────────────────────
// Solo admin/soporte. Al eliminar, la mercancía "regresa" al stock.

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM salidas_bodega WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Salida no encontrada' });
    }
    return res.json({ success: true, data: mapRow(result.rows[0]) });
  } catch (e) {
    console.error('❌ Error salidas_bodega delete:', e);
    return res.status(500).json({ success: false, message: 'Error al eliminar salida' });
  }
};

module.exports = { getAll, create, createBatch, updateDevolucion, remove };
