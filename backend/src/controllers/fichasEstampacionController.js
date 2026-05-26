// ============================================
// CONTROLADOR: Fichas de Estampacion
// CRUD completo para la tabla fichas_estampacion
// ============================================

const { query } = require('../config/database');

// ── Mapper ────────────────────────────────────────────────────────────────────

const mapFicha = (f) => ({
    id: f.id,
    referencia: f.referencia,
    fechaEnvio: f.fecha_envio,
    fechaEntrega: f.fecha_entrega,
    nCorte: f.n_corte,
    cantidad: f.cantidad,
    fichaRealizadaPor: f.ficha_realizada_por,
    descripcion: f.descripcion,
    precios: f.precios || [],
    fotoSeleccionada: f.foto_seleccionada,
    observaciones: f.observaciones || [],
    responsable: f.responsable,
    pintasActivo: f.pintas_activo,
    pintas: f.pintas || [],
    combinacionColores: f.combinacion_colores || [],
    createdBy: f.created_by,
    createdAt: f.created_at,
    updatedAt: f.updated_at,
});

const mapFichaMetadata = (f) => ({
    id: f.id,
    referencia: f.referencia,
    fechaEnvio: f.fecha_envio,
    fechaEntrega: f.fecha_entrega,
    nCorte: f.n_corte,
    cantidad: f.cantidad,
    fichaRealizadaPor: f.ficha_realizada_por,
    responsable: f.responsable,
    createdBy: f.created_by,
    createdAt: f.created_at,
    updatedAt: f.updated_at,
});

// ── GET /api/fichas-estampacion ────────────────────────────────────────────────

const getFichasEstampacion = async (req, res) => {
    try {
        const result = await query(`
            SELECT *
            FROM fichas_estampacion
            ORDER BY created_at DESC
        `);
        return res.json({ success: true, data: result.rows.map(mapFicha) });
    } catch (error) {
        console.error('Error obteniendo fichas estampacion:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener fichas de estampación' });
    }
};

// ── GET /api/fichas-estampacion/:id ────────────────────────────────────────────

const getFichaEstampacion = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('SELECT * FROM fichas_estampacion WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Ficha no encontrada' });
        }
        return res.json({ success: true, data: mapFicha(result.rows[0]) });
    } catch (error) {
        console.error('Error obteniendo ficha estampacion:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener ficha de estampación' });
    }
};

// ── POST /api/fichas-estampacion ───────────────────────────────────────────────

const createFichaEstampacion = async (req, res) => {
    try {
        const {
            id, referencia, fechaEnvio, fechaEntrega,
            nCorte, cantidad, fichaRealizadaPor, descripcion,
            precios, fotoSeleccionada, observaciones, responsable,
            pintasActivo, pintas, combinacionColores, createdBy
        } = req.body;

        if (!referencia) {
            return res.status(400).json({ success: false, message: 'Referencia es obligatoria' });
        }

        const fichaId = id || `fe-${Date.now()}`;

        await query(`
            INSERT INTO fichas_estampacion (
                id, referencia, fecha_envio, fecha_entrega,
                n_corte, cantidad, ficha_realizada_por, descripcion,
                precios, foto_seleccionada, observaciones, responsable,
                pintas_activo, pintas, combinacion_colores, created_by
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8,
                $9, $10, $11, $12, $13, $14, $15, $16
            )
        `, [
            fichaId, referencia, fechaEnvio, fechaEntrega,
            nCorte, cantidad, fichaRealizadaPor, descripcion,
            JSON.stringify(precios || []),
            fotoSeleccionada ?? 1,
            JSON.stringify(observaciones || []),
            responsable,
            pintasActivo ?? true,
            JSON.stringify(pintas || []),
            JSON.stringify(combinacionColores || []),
            createdBy
        ]);

        const created = await query('SELECT * FROM fichas_estampacion WHERE id = $1', [fichaId]);
        return res.json({ success: true, data: mapFicha(created.rows[0]), message: 'Ficha de estampación creada exitosamente' });
    } catch (error) {
        console.error('Error creando ficha estampacion:', error);
        return res.status(500).json({ success: false, message: 'Error al crear ficha de estampación' });
    }
};

// ── PUT /api/fichas-estampacion/:id ────────────────────────────────────────────

const updateFichaEstampacion = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            referencia, fechaEnvio, fechaEntrega,
            nCorte, cantidad, fichaRealizadaPor, descripcion,
            precios, fotoSeleccionada, observaciones, responsable,
            pintasActivo, pintas, combinacionColores
        } = req.body;

        const existe = await query('SELECT id FROM fichas_estampacion WHERE id = $1', [id]);
        if (existe.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Ficha no encontrada' });
        }

        await query(`
            UPDATE fichas_estampacion SET
                referencia=$1, fecha_envio=$2, fecha_entrega=$3,
                n_corte=$4, cantidad=$5, ficha_realizada_por=$6, descripcion=$7,
                precios=$8, foto_seleccionada=$9, observaciones=$10, responsable=$11,
                pintas_activo=$12, pintas=$13, combinacion_colores=$14,
                updated_at=CURRENT_TIMESTAMP
            WHERE id=$15
        `, [
            referencia, fechaEnvio, fechaEntrega,
            nCorte, cantidad, fichaRealizadaPor, descripcion,
            JSON.stringify(precios || []),
            fotoSeleccionada ?? 1,
            JSON.stringify(observaciones || []),
            responsable,
            pintasActivo ?? true,
            JSON.stringify(pintas || []),
            JSON.stringify(combinacionColores || []),
            id
        ]);

        const updated = await query('SELECT * FROM fichas_estampacion WHERE id = $1', [id]);
        return res.json({ success: true, data: mapFicha(updated.rows[0]), message: 'Ficha de estampación actualizada exitosamente' });
    } catch (error) {
        console.error('Error actualizando ficha estampacion:', error);
        return res.status(500).json({ success: false, message: 'Error al actualizar ficha de estampación' });
    }
};

// ── DELETE /api/fichas-estampacion/:id ─────────────────────────────────────────

const deleteFichaEstampacion = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('DELETE FROM fichas_estampacion WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Ficha no encontrada' });
        }
        return res.json({ success: true, message: 'Ficha de estampación eliminada exitosamente' });
    } catch (error) {
        console.error('Error eliminando ficha estampacion:', error);
        return res.status(500).json({ success: false, message: 'Error al eliminar ficha de estampación' });
    }
};

module.exports = {
    getFichasEstampacion,
    getFichaEstampacion,
    createFichaEstampacion,
    updateFichaEstampacion,
    deleteFichaEstampacion,
};
