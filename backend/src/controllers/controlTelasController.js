// ============================================
// CONTROLADOR: Control de Telas
// ============================================

const { query } = require('../config/database');

// ── helpers ──────────────────────────────────────────────────────────────────

function toNum(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function toDate(v) {
  return (!v || v === '') ? null : v;
}

function numStr(v) {
  if (v == null) return '';
  const n = parseFloat(v);
  return isNaN(n) ? '' : String(parseFloat(n.toFixed(10)));
}

// ── Producción ────────────────────────────────────────────────────────────────

function mapProduccion(r) {
  return {
    id:                 r.id,
    tela:               r.tela,
    color:              r.color,
    undMedida:          r.und_medida,
    rdmto:              numStr(r.rdmto),
    subtotal:           numStr(r.subtotal),
    iva:                numStr(r.iva),
    precioTotalKilos:   numStr(r.precio_total_kilos),
    precioTotalMetros:  numStr(r.precio_total_metros),
    proveedor:          r.proveedor,
    fechaCompra:        r.fecha_compra ? r.fecha_compra.toISOString().split('T')[0] : '',
    ivaIncluido:        r.iva_incluido,
    feOrRm:             r.fe_or_rm,
    createdBy:          r.created_by,
    createdAt:          r.created_at,
    updatedAt:          r.updated_at,
  };
}

const getAllProduccion = async (req, res) => {
  try {
    const result = await query('SELECT * FROM control_telas_produccion ORDER BY created_at DESC');
    return res.json({ success: true, data: result.rows.map(mapProduccion) });
  } catch (e) {
    console.error('❌ Error control_telas_produccion getAll:', e);
    return res.status(500).json({ success: false, message: 'Error al obtener datos' });
  }
};

const saveBatchProduccion = async (req, res) => {
  try {
    const { rows, createdBy } = req.body;
    if (!Array.isArray(rows)) return res.status(400).json({ success: false, message: 'rows debe ser un array' });

    const inserted = [];
    for (const d of rows) {
      const result = await query(`
        INSERT INTO control_telas_produccion
          (id, tela, color, und_medida, rdmto, subtotal, iva,
           precio_total_kilos, precio_total_metros,
           proveedor, fecha_compra, iva_incluido, fe_or_rm, created_by)
        VALUES
          (COALESCE($1, gen_random_uuid()), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE SET
          tela = EXCLUDED.tela, color = EXCLUDED.color, und_medida = EXCLUDED.und_medida,
          rdmto = EXCLUDED.rdmto, subtotal = EXCLUDED.subtotal, iva = EXCLUDED.iva,
          precio_total_kilos = EXCLUDED.precio_total_kilos,
          precio_total_metros = EXCLUDED.precio_total_metros,
          proveedor = EXCLUDED.proveedor, fecha_compra = EXCLUDED.fecha_compra,
          iva_incluido = EXCLUDED.iva_incluido, fe_or_rm = EXCLUDED.fe_or_rm,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        d.id || null, d.tela || '', d.color || '', d.undMedida || 'M',
        toNum(d.rdmto), toNum(d.subtotal), toNum(d.iva),
        toNum(d.precioTotalKilos), toNum(d.precioTotalMetros),
        d.proveedor || '', toDate(d.fechaCompra), d.ivaIncluido || 'S', d.feOrRm || '',
        createdBy || null,
      ]);
      inserted.push(mapProduccion(result.rows[0]));
    }
    return res.json({ success: true, data: inserted, count: inserted.length });
  } catch (e) {
    console.error('❌ Error batch control_telas_produccion:', e);
    return res.status(500).json({ success: false, message: 'Error al guardar' });
  }
};

const deleteProduccion = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM control_telas_produccion WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'No encontrado' });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Error al eliminar' });
  }
};

// ── Muestras ──────────────────────────────────────────────────────────────────

function mapMuestra(r) {
  return {
    id:                  r.id,
    tela:                r.tela,
    color:               r.color,
    undMedida:           r.und_medida,
    rdmto:               numStr(r.rdmto),
    subtotal:            numStr(r.subtotal),
    iva:                 numStr(r.iva),
    totalPrecioKilos:    numStr(r.total_precio_kilos),
    totalPrecioMetros:   numStr(r.total_precio_metros),
    proveedor:           r.proveedor,
    fechaCompra:         r.fecha_compra ? r.fecha_compra.toISOString().split('T')[0] : '',
    facturaNo:           r.factura_no,
    solicitaRecibe:      r.solicita_recibe,
    usadaEnProduccion:   r.usada_en_produccion,
    createdBy:           r.created_by,
    createdAt:           r.created_at,
    updatedAt:           r.updated_at,
  };
}

const getAllMuestras = async (req, res) => {
  try {
    const result = await query('SELECT * FROM control_telas_muestras ORDER BY created_at DESC');
    return res.json({ success: true, data: result.rows.map(mapMuestra) });
  } catch (e) {
    console.error('❌ Error control_telas_muestras getAll:', e);
    return res.status(500).json({ success: false, message: 'Error al obtener datos' });
  }
};

const saveBatchMuestras = async (req, res) => {
  try {
    const { rows, createdBy } = req.body;
    if (!Array.isArray(rows)) return res.status(400).json({ success: false, message: 'rows debe ser un array' });

    const inserted = [];
    for (const d of rows) {
      const result = await query(`
        INSERT INTO control_telas_muestras
          (id, tela, color, und_medida, rdmto, subtotal, iva,
           total_precio_kilos, total_precio_metros,
           proveedor, fecha_compra, factura_no, solicita_recibe, usada_en_produccion, created_by)
        VALUES
          (COALESCE($1, gen_random_uuid()), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO UPDATE SET
          tela = EXCLUDED.tela, color = EXCLUDED.color, und_medida = EXCLUDED.und_medida,
          rdmto = EXCLUDED.rdmto, subtotal = EXCLUDED.subtotal, iva = EXCLUDED.iva,
          total_precio_kilos = EXCLUDED.total_precio_kilos,
          total_precio_metros = EXCLUDED.total_precio_metros,
          proveedor = EXCLUDED.proveedor, fecha_compra = EXCLUDED.fecha_compra,
          factura_no = EXCLUDED.factura_no, solicita_recibe = EXCLUDED.solicita_recibe,
          usada_en_produccion = EXCLUDED.usada_en_produccion,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        d.id || null, d.tela || '', d.color || '', d.undMedida || 'M',
        toNum(d.rdmto), toNum(d.subtotal), toNum(d.iva),
        toNum(d.totalPrecioKilos), toNum(d.totalPrecioMetros),
        d.proveedor || '', toDate(d.fechaCompra), d.facturaNo || '',
        d.solicitaRecibe || '', d.usadaEnProduccion || '',
        createdBy || null,
      ]);
      inserted.push(mapMuestra(result.rows[0]));
    }
    return res.json({ success: true, data: inserted, count: inserted.length });
  } catch (e) {
    console.error('❌ Error batch control_telas_muestras:', e);
    return res.status(500).json({ success: false, message: 'Error al guardar' });
  }
};

const deleteMuestra = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM control_telas_muestras WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'No encontrado' });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Error al eliminar' });
  }
};

module.exports = {
  getAllProduccion, saveBatchProduccion, deleteProduccion,
  getAllMuestras,   saveBatchMuestras,   deleteMuestra,
};
