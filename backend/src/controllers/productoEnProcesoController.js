// ============================================
// CONTROLADOR: Producto en Proceso
// Control de lotes enviados a confeccionistas
// ============================================

const { query } = require('../config/database');

/**
 * GET /api/producto-en-proceso
 * Devuelve todas las filas ordenadas por fecha de creación descendente
 */
const getAll = async (req, res) => {
    try {
        const result = await query(`
            SELECT
                id,
                confeccionista,
                remision,
                ref,
                salida,
                fecha_remision,
                entrega,
                segundas,
                vta,
                cobrado,
                incompleto,
                fecha_llegada,
                talegos_salida,
                talegos_entrega,
                muestras_salida,
                muestras_entrega,
                row_highlight,
                cell_highlights,
                cell_comments,
                created_by,
                created_at,
                updated_at
            FROM producto_en_proceso
            ORDER BY created_at DESC
        `);

        const rows = result.rows.map(mapRow);
        return res.json({ success: true, data: rows });
    } catch (error) {
        console.error('❌ Error obteniendo producto en proceso:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener datos' });
    }
};

/**
 * POST /api/producto-en-proceso
 * Crea una nueva fila
 */
const create = async (req, res) => {
    try {
        const d = req.body;
        const result = await query(`
            INSERT INTO producto_en_proceso (
                id, confeccionista, remision, ref, salida, fecha_remision,
                entrega, segundas, vta, cobrado, incompleto, fecha_llegada,
                talegos_salida, talegos_entrega, muestras_salida, muestras_entrega,
                row_highlight, cell_highlights, cell_comments, created_by
            ) VALUES (
                COALESCE($1, gen_random_uuid()), $2, $3, $4, $5, $6,
                $7, $8, $9, $10, $11, $12,
                $13, $14, $15, $16,
                $17, $18, $19, $20
            ) RETURNING *
        `, [
            d.id || null,
            d.confeccionista || '',
            d.remision || '',
            d.ref || '',
            toNum(d.salida),
            toDate(d.fechaRemision),
            toNum(d.entrega),
            toNum(d.segundas),
            toNum(d.vta),
            toNum(d.cobrado),
            toNum(d.incompleto),
            toDate(d.fechaLlegada),
            toNum(d.talegosSalida),
            toNum(d.talegosEntrega),
            toNum(d.muestrasSalida),
            toNum(d.muestrasEntrega),
            d.rowHighlight || null,
            JSON.stringify(d.cellHighlights || {}),
            JSON.stringify(d.cellComments || {}),
            d.createdBy || null,
        ]);

        return res.status(201).json({ success: true, data: mapRow(result.rows[0]) });
    } catch (error) {
        console.error('❌ Error creando fila producto en proceso:', error);
        return res.status(500).json({ success: false, message: 'Error al crear fila' });
    }
};

/**
 * PUT /api/producto-en-proceso/:id
 * Actualiza una fila existente
 */
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const d = req.body;

        const result = await query(`
            UPDATE producto_en_proceso SET
                confeccionista   = $1,
                remision         = $2,
                ref              = $3,
                salida           = $4,
                fecha_remision   = $5,
                entrega          = $6,
                segundas         = $7,
                vta              = $8,
                cobrado          = $9,
                incompleto       = $10,
                fecha_llegada    = $11,
                talegos_salida   = $12,
                talegos_entrega  = $13,
                muestras_salida  = $14,
                muestras_entrega = $15,
                row_highlight    = $16,
                cell_highlights  = $17,
                cell_comments    = $18,
                updated_at       = CURRENT_TIMESTAMP
            WHERE id = $19
            RETURNING *
        `, [
            d.confeccionista || '',
            d.remision || '',
            d.ref || '',
            toNum(d.salida),
            toDate(d.fechaRemision),
            toNum(d.entrega),
            toNum(d.segundas),
            toNum(d.vta),
            toNum(d.cobrado),
            toNum(d.incompleto),
            toDate(d.fechaLlegada),
            toNum(d.talegosSalida),
            toNum(d.talegosEntrega),
            toNum(d.muestrasSalida),
            toNum(d.muestrasEntrega),
            d.rowHighlight || null,
            JSON.stringify(d.cellHighlights || {}),
            JSON.stringify(d.cellComments || {}),
            id,
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Fila no encontrada' });
        }

        return res.json({ success: true, data: mapRow(result.rows[0]) });
    } catch (error) {
        console.error('❌ Error actualizando fila producto en proceso:', error);
        return res.status(500).json({ success: false, message: 'Error al actualizar fila' });
    }
};

/**
 * DELETE /api/producto-en-proceso/:id
 */
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(
            'DELETE FROM producto_en_proceso WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Fila no encontrada' });
        }

        return res.json({ success: true, message: 'Fila eliminada' });
    } catch (error) {
        console.error('❌ Error eliminando fila producto en proceso:', error);
        return res.status(500).json({ success: false, message: 'Error al eliminar fila' });
    }
};

/**
 * POST /api/producto-en-proceso/batch
 * Reemplaza todas las filas con el array enviado (para importación masiva)
 */
const saveBatch = async (req, res) => {
    try {
        const { rows, createdBy } = req.body;
        if (!Array.isArray(rows)) {
            return res.status(400).json({ success: false, message: 'rows debe ser un array' });
        }

        // Insertar todas las filas nuevas
        const inserted = [];
        for (const d of rows) {
            const result = await query(`
                INSERT INTO producto_en_proceso (
                    id, confeccionista, remision, ref, salida, fecha_remision,
                    entrega, segundas, vta, cobrado, incompleto, fecha_llegada,
                    talegos_salida, talegos_entrega, muestras_salida, muestras_entrega,
                    row_highlight, cell_highlights, cell_comments, created_by
                ) VALUES (
                    COALESCE($1, gen_random_uuid()), $2, $3, $4, $5, $6,
                    $7, $8, $9, $10, $11, $12,
                    $13, $14, $15, $16,
                    $17, $18, $19, $20
                )
                ON CONFLICT (id) DO UPDATE SET
                    confeccionista   = EXCLUDED.confeccionista,
                    remision         = EXCLUDED.remision,
                    ref              = EXCLUDED.ref,
                    salida           = EXCLUDED.salida,
                    fecha_remision   = EXCLUDED.fecha_remision,
                    entrega          = EXCLUDED.entrega,
                    segundas         = EXCLUDED.segundas,
                    vta              = EXCLUDED.vta,
                    cobrado          = EXCLUDED.cobrado,
                    incompleto       = EXCLUDED.incompleto,
                    fecha_llegada    = EXCLUDED.fecha_llegada,
                    talegos_salida   = EXCLUDED.talegos_salida,
                    talegos_entrega  = EXCLUDED.talegos_entrega,
                    muestras_salida  = EXCLUDED.muestras_salida,
                    muestras_entrega = EXCLUDED.muestras_entrega,
                    row_highlight    = EXCLUDED.row_highlight,
                    cell_highlights  = EXCLUDED.cell_highlights,
                    cell_comments    = EXCLUDED.cell_comments,
                    updated_at       = CURRENT_TIMESTAMP
                RETURNING *
            `, [
                d.id || null,
                d.confeccionista || '',
                d.remision || '',
                d.ref || '',
                toNum(d.salida),
                toDate(d.fechaRemision),
                toNum(d.entrega),
                toNum(d.segundas),
                toNum(d.vta),
                toNum(d.cobrado),
                toNum(d.incompleto),
                toDate(d.fechaLlegada),
                toNum(d.talegosSalida),
                toNum(d.talegosEntrega),
                toNum(d.muestrasSalida),
                toNum(d.muestrasEntrega),
                d.rowHighlight || null,
                JSON.stringify(d.cellHighlights || {}),
                JSON.stringify(d.cellComments || {}),
                createdBy || null,
            ]);
            inserted.push(mapRow(result.rows[0]));
        }

        return res.json({ success: true, data: inserted, count: inserted.length });
    } catch (error) {
        console.error('❌ Error en batch producto en proceso:', error);
        return res.status(500).json({ success: false, message: 'Error en importación masiva' });
    }
};

// ---- helpers ----

function toNum(v) {
    if (v === '' || v === null || v === undefined) return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
}

function toDate(v) {
    if (!v || v === '') return null;
    return v;
}

function mapRow(r) {
    return {
        id:              r.id,
        confeccionista:  r.confeccionista,
        remision:        r.remision,
        ref:             r.ref,
        salida:          r.salida != null ? String(r.salida) : '',
        fechaRemision:   r.fecha_remision ? r.fecha_remision.toISOString().split('T')[0] : '',
        entrega:         r.entrega != null ? String(r.entrega) : '',
        segundas:        r.segundas != null ? String(r.segundas) : '',
        vta:             r.vta != null ? String(r.vta) : '',
        cobrado:         r.cobrado != null ? String(r.cobrado) : '',
        incompleto:      r.incompleto != null ? String(r.incompleto) : '',
        fechaLlegada:    r.fecha_llegada ? r.fecha_llegada.toISOString().split('T')[0] : '',
        talegosSalida:   r.talegos_salida != null ? String(r.talegos_salida) : '',
        talegosEntrega:  r.talegos_entrega != null ? String(r.talegos_entrega) : '',
        muestrasSalida:  r.muestras_salida != null ? String(r.muestras_salida) : '',
        muestrasEntrega: r.muestras_entrega != null ? String(r.muestras_entrega) : '',
        rowHighlight:    r.row_highlight || null,
        cellHighlights:  r.cell_highlights || {},
        cellComments:    r.cell_comments || {},
        createdBy:       r.created_by,
        createdAt:       r.created_at,
        updatedAt:       r.updated_at,
    };
}

module.exports = { getAll, create, update, remove, saveBatch };
