/**
 * programacionPagosController.js
 * Módulo: Programación de Pagos
 * Maneja cuentas_bancarias, pagos_programados y descuentos_pago
 */

const { getDatabase } = require('../config/database');
const getPool = getDatabase;

// ─────────────────────────────────────────────────────────────────────────────
// CUENTAS BANCARIAS
// ─────────────────────────────────────────────────────────────────────────────

const getCuentas = async (req, res) => {
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT * FROM cuentas_bancarias ORDER BY LOWER(nombre) ASC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getCuentas error:', err);
    res.status(500).json({ success: false, message: 'Error al obtener cuentas bancarias' });
  }
};

const createCuenta = async (req, res) => {
  try {
    const { cedula, nombre, cuenta } = req.body;
    if (!cedula || !nombre || !cuenta) {
      return res.status(400).json({ success: false, message: 'cedula, nombre y cuenta son obligatorios' });
    }
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO cuentas_bancarias (cedula, nombre, cuenta)
       VALUES ($1, $2, $3) RETURNING *`,
      [cedula.trim(), nombre.trim(), cuenta.trim()]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('createCuenta error:', err);
    res.status(500).json({ success: false, message: 'Error al crear cuenta bancaria' });
  }
};

const updateCuenta = async (req, res) => {
  try {
    const { id } = req.params;
    const { cedula, nombre, cuenta } = req.body;
    const pool = getPool();
    const { rows } = await pool.query(
      `UPDATE cuentas_bancarias
       SET cedula = $1, nombre = $2, cuenta = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [cedula.trim(), nombre.trim(), cuenta.trim(), id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('updateCuenta error:', err);
    res.status(500).json({ success: false, message: 'Error al actualizar cuenta bancaria' });
  }
};

const deleteCuenta = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const { rowCount } = await pool.query(`DELETE FROM cuentas_bancarias WHERE id = $1`, [id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
    res.json({ success: true });
  } catch (err) {
    console.error('deleteCuenta error:', err);
    res.status(500).json({ success: false, message: 'Error al eliminar cuenta bancaria' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGOS PROGRAMADOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /pagos-programados?fecha=YYYY-MM-DD
 * Devuelve los pagos de un día con sus descuentos
 */
const getPagosPorFecha = async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ success: false, message: 'fecha es requerida' });

    const pool = getPool();

    const { rows: pagos } = await pool.query(
      `SELECT * FROM pagos_programados WHERE fecha = $1 ORDER BY orden ASC`,
      [fecha]
    );

    if (!pagos.length) return res.json({ success: true, data: [] });

    const ids = pagos.map(p => p.id);
    const { rows: descuentos } = await pool.query(
      `SELECT * FROM descuentos_pago WHERE pago_id = ANY($1) ORDER BY pago_id, orden ASC`,
      [ids]
    );

    const data = pagos.map(p => ({
      ...p,
      descuentosOF: descuentos.filter(d => d.pago_id === p.id && d.tipo === 'OF'),
      descuentosML: descuentos.filter(d => d.pago_id === p.id && d.tipo === 'ML'),
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error('getPagosPorFecha error:', err);
    res.status(500).json({ success: false, message: 'Error al obtener pagos' });
  }
};

/**
 * GET /pagos-programados/conteo?anio=YYYY&mes=MM
 * Devuelve { "YYYY-MM-DD": count } para pintar el calendario
 */
const getConteoPorMes = async (req, res) => {
  try {
    const { anio, mes } = req.query;
    if (!anio || !mes) return res.status(400).json({ success: false, message: 'anio y mes son requeridos' });

    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT fecha::text, COUNT(*) as total
       FROM pagos_programados
       WHERE EXTRACT(YEAR FROM fecha) = $1 AND EXTRACT(MONTH FROM fecha) = $2
       GROUP BY fecha`,
      [parseInt(anio), parseInt(mes)]
    );

    const conteo = {};
    rows.forEach(r => { conteo[r.fecha] = parseInt(r.total); });
    res.json({ success: true, data: conteo });
  } catch (err) {
    console.error('getConteoPorMes error:', err);
    res.status(500).json({ success: false, message: 'Error al obtener conteo' });
  }
};

/**
 * GET /pagos-programados/totales?anio=YYYY&mes=MM
 * Devuelve { "YYYY-MM-DD": { totalOF, totalML, countOF, countML } }
 * Calcula los totales netos (bruto - descuentos) por día
 */
const getTotalesPorMes = async (req, res) => {
  try {
    const { anio, mes } = req.query;
    if (!anio || !mes) return res.status(400).json({ success: false, message: 'anio y mes son requeridos' });

    const pool = getPool();
    
    // Obtener todos los pagos del mes con sus descuentos
    const { rows: pagos } = await pool.query(
      `SELECT id, fecha::text, bruto_of, bruto_ml
       FROM pagos_programados
       WHERE EXTRACT(YEAR FROM fecha) = $1 AND EXTRACT(MONTH FROM fecha) = $2
       ORDER BY fecha`,
      [parseInt(anio), parseInt(mes)]
    );

    if (!pagos.length) {
      return res.json({ success: true, data: {} });
    }

    const pagoIds = pagos.map(p => p.id);
    const { rows: descuentos } = await pool.query(
      `SELECT pago_id, tipo, monto FROM descuentos_pago WHERE pago_id = ANY($1)`,
      [pagoIds]
    );

    // Agrupar descuentos por pago
    const descuentosPorPago = {};
    descuentos.forEach(d => {
      if (!descuentosPorPago[d.pago_id]) {
        descuentosPorPago[d.pago_id] = { OF: 0, ML: 0 };
      }
      descuentosPorPago[d.pago_id][d.tipo] += parseFloat(d.monto) || 0;
    });

    // Agrupar por fecha y calcular totales
    const totalesPorFecha = {};
    pagos.forEach(p => {
      const fecha = p.fecha;
      if (!totalesPorFecha[fecha]) {
        totalesPorFecha[fecha] = { totalOF: 0, totalML: 0, countOF: 0, countML: 0 };
      }

      const descuentosDelPago = descuentosPorPago[p.id] || { OF: 0, ML: 0 };
      
      if (p.bruto_of > 0) {
        totalesPorFecha[fecha].totalOF += p.bruto_of - descuentosDelPago.OF;
        totalesPorFecha[fecha].countOF += 1;
      }
      
      if (p.bruto_ml > 0) {
        totalesPorFecha[fecha].totalML += p.bruto_ml - descuentosDelPago.ML;
        totalesPorFecha[fecha].countML += 1;
      }
    });

    res.json({ success: true, data: totalesPorFecha });
  } catch (err) {
    console.error('getTotalesPorMes error:', err);
    res.status(500).json({ success: false, message: 'Error al obtener totales' });
  }
};

/**
 * POST /pagos-programados
 * Crea un pago con sus descuentos en una transacción
 */
const createPago = async (req, res) => {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const {
      fecha, cuenta_bancaria_id, cedula, nombre, cuenta,
      detalle_inicial, bruto_of, bruto_ml, descuentosOF, descuentosML
    } = req.body;

    if (!fecha || !cedula || !nombre || !cuenta) {
      return res.status(400).json({ success: false, message: 'fecha, cedula, nombre y cuenta son obligatorios' });
    }

    await client.query('BEGIN');

    // Calcular orden (al final del día)
    const { rows: ordenRows } = await client.query(
      `SELECT COALESCE(MAX(orden), -1) + 1 as next_orden FROM pagos_programados WHERE fecha = $1`,
      [fecha]
    );

    const { rows: pagoRows } = await client.query(
      `INSERT INTO pagos_programados
         (fecha, cuenta_bancaria_id, cedula, nombre, cuenta, detalle_inicial, bruto_of, bruto_ml, orden)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [fecha, cuenta_bancaria_id || null, cedula, nombre, cuenta,
       detalle_inicial || '', bruto_of || 0, bruto_ml || 0, ordenRows[0].next_orden]
    );

    const pago = pagoRows[0];
    const allDescuentos = [
      ...(descuentosOF || []).map((d, i) => ({ ...d, tipo: 'OF', orden: i })),
      ...(descuentosML || []).map((d, i) => ({ ...d, tipo: 'ML', orden: i })),
    ];

    for (const d of allDescuentos) {
      await client.query(
        `INSERT INTO descuentos_pago (pago_id, tipo, etiqueta, monto, orden) VALUES ($1,$2,$3,$4,$5)`,
        [pago.id, d.tipo, d.etiqueta || '', d.monto || 0, d.orden]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: pago });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('createPago error:', err);
    res.status(500).json({ success: false, message: 'Error al crear pago' });
  } finally {
    client.release();
  }
};

/**
 * PUT /pagos-programados/:id
 * Actualiza pago y reemplaza sus descuentos
 */
const updatePago = async (req, res) => {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const {
      fecha, fecha_original, cuenta_bancaria_id, cedula, nombre, cuenta,
      detalle_inicial, bruto_of, bruto_ml, descuentosOF, descuentosML
    } = req.body;

    await client.query('BEGIN');

    const { rows } = await client.query(
      `UPDATE pagos_programados
       SET fecha=$1, fecha_original=$2, cuenta_bancaria_id=$3, cedula=$4, nombre=$5,
           cuenta=$6, detalle_inicial=$7, bruto_of=$8, bruto_ml=$9, updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [fecha, fecha_original || null, cuenta_bancaria_id || null, cedula, nombre,
       cuenta, detalle_inicial || '', bruto_of || 0, bruto_ml || 0, id]
    );

    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Pago no encontrado' });
    }

    // Reemplazar descuentos
    await client.query(`DELETE FROM descuentos_pago WHERE pago_id = $1`, [id]);

    const allDescuentos = [
      ...(descuentosOF || []).map((d, i) => ({ ...d, tipo: 'OF', orden: i })),
      ...(descuentosML || []).map((d, i) => ({ ...d, tipo: 'ML', orden: i })),
    ];

    for (const d of allDescuentos) {
      await client.query(
        `INSERT INTO descuentos_pago (pago_id, tipo, etiqueta, monto, orden) VALUES ($1,$2,$3,$4,$5)`,
        [id, d.tipo, d.etiqueta || '', d.monto || 0, d.orden]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('updatePago error:', err);
    res.status(500).json({ success: false, message: 'Error al actualizar pago' });
  } finally {
    client.release();
  }
};

/**
 * DELETE /pagos-programados/:id
 */
const deletePago = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const { rowCount } = await pool.query(`DELETE FROM pagos_programados WHERE id = $1`, [id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Pago no encontrado' });
    res.json({ success: true });
  } catch (err) {
    console.error('deletePago error:', err);
    res.status(500).json({ success: false, message: 'Error al eliminar pago' });
  }
};

/**
 * PUT /pagos-programados/reordenar
 * Body: { fecha, orden: [{ id, orden }] }
 * Actualiza el campo orden de todos los pagos del día
 */
const reordenarPagos = async (req, res) => {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const { orden } = req.body; // [{ id, orden }]
    if (!Array.isArray(orden)) return res.status(400).json({ success: false, message: 'orden debe ser un array' });

    await client.query('BEGIN');
    for (const item of orden) {
      await client.query(
        `UPDATE pagos_programados SET orden = $1 WHERE id = $2`,
        [item.orden, item.id]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('reordenarPagos error:', err);
    res.status(500).json({ success: false, message: 'Error al reordenar pagos' });
  } finally {
    client.release();
  }
};

const bulkImportCuentas = async (req, res) => {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const { cuentas } = req.body;
    if (!Array.isArray(cuentas) || !cuentas.length) {
      return res.status(400).json({ success: false, message: 'No se recibieron cuentas para importar' });
    }

    await client.query('BEGIN');
    let ok = 0;
    let errores = 0;

    for (const c of cuentas) {
      try {
        await client.query(
          `INSERT INTO cuentas_bancarias (cedula, nombre, cuenta) VALUES ($1, $2, $3)`,
          [String(c.cedula).trim(), String(c.nombre).trim(), String(c.cuenta).trim()]
        );
        ok++;
      } catch {
        errores++;
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, data: { ok, errores } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('bulkImportCuentas error:', err);
    res.status(500).json({ success: false, message: 'Error al importar cuentas' });
  } finally {
    client.release();
  }
};

module.exports = {
  getCuentas, createCuenta, updateCuenta, deleteCuenta,
  getPagosPorFecha, getConteoPorMes, getTotalesPorMes, createPago, updatePago, deletePago, reordenarPagos,
  bulkImportCuentas,
};
