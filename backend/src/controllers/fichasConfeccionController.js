// ============================================
// CONTROLADOR: Fichas de Confeccion
// CRUD completo para la tabla fichas_confeccion
// ============================================

const { query, transaction } = require('../config/database');

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
    precioConfeccion: f.precio_confeccion,
    precioEmpaque: f.precio_empaque,
    empaqueActivo: f.empaque_activo,
    precioManualidad: f.precio_manualidad,
    fotoSeleccionada: f.foto_seleccionada,
    textoPiezas: f.texto_piezas,
    talla1: f.talla1,
    talla2: f.talla2,
    talla3: f.talla3,
    filasMedidas: f.filas_medidas || [],
    combinacionColores: f.combinacion_colores,
    confeccion: f.confeccion,
    notaVerificar: f.nota_verificar,
    consumoSesgo: f.consumo_sesgo,
    notaFinal: f.nota_final,
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
    createdBy: f.created_by,
    createdAt: f.created_at,
    updatedAt: f.updated_at,
});

// ── GET /api/fichas-confeccion ────────────────────────────────────────────────

const getFichasConfeccion = async (req, res) => {
    try {
        const result = await query(`
            SELECT *
            FROM fichas_confeccion
            ORDER BY created_at DESC
        `);
        return res.json({ success: true, data: result.rows.map(mapFicha) });
    } catch (error) {
        console.error('Error obteniendo fichas confeccion:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener fichas' });
    }
};

// ── GET /api/fichas-confeccion/:id ────────────────────────────────────────────

const getFichaConfeccion = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('SELECT * FROM fichas_confeccion WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Ficha no encontrada' });
        }
        return res.json({ success: true, data: mapFicha(result.rows[0]) });
    } catch (error) {
        console.error('Error obteniendo ficha confeccion:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener ficha' });
    }
};

// ── POST /api/fichas-confeccion ───────────────────────────────────────────────

const createFichaConfeccion = async (req, res) => {
    try {
        const {
            id, referencia, fechaEnvio, fechaEntrega,
            nCorte, cantidad, fichaRealizadaPor, descripcion,
            precioConfeccion, precioEmpaque, empaqueActivo, precioManualidad,
            fotoSeleccionada, textoPiezas,
            talla1, talla2, talla3, filasMedidas,
            combinacionColores, confeccion, notaVerificar, consumoSesgo, notaFinal,
            createdBy
        } = req.body;

        if (!referencia) {
            return res.status(400).json({ success: false, message: 'Referencia es obligatoria' });
        }

        const fichaId = id || `fc-${Date.now()}`;

        await query(`
            INSERT INTO fichas_confeccion (
                id, referencia, fecha_envio, fecha_entrega,
                n_corte, cantidad, ficha_realizada_por, descripcion,
                precio_confeccion, precio_empaque, empaque_activo, precio_manualidad,
                foto_seleccionada, texto_piezas,
                talla1, talla2, talla3, filas_medidas,
                combinacion_colores, confeccion, nota_verificar, consumo_sesgo, nota_final,
                created_by
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8,
                $9, $10, $11, $12, $13, $14,
                $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
            )
        `, [
            fichaId, referencia, fechaEnvio, fechaEntrega,
            nCorte, cantidad, fichaRealizadaPor, descripcion,
            precioConfeccion, precioEmpaque, empaqueActivo ?? true, precioManualidad,
            fotoSeleccionada ?? 1, textoPiezas,
            talla1 ?? 'XL', talla2 ?? '2XL', talla3 ?? '3XL',
            JSON.stringify(filasMedidas || []),
            combinacionColores, confeccion, notaVerificar, consumoSesgo, notaFinal,
            createdBy
        ]);

        const created = await query('SELECT * FROM fichas_confeccion WHERE id = $1', [fichaId]);
        return res.json({ success: true, data: mapFicha(created.rows[0]), message: 'Ficha creada exitosamente' });
    } catch (error) {
        console.error('Error creando ficha confeccion:', error);
        return res.status(500).json({ success: false, message: 'Error al crear ficha' });
    }
};

// ── PUT /api/fichas-confeccion/:id ────────────────────────────────────────────

const updateFichaConfeccion = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            referencia, fechaEnvio, fechaEntrega,
            nCorte, cantidad, fichaRealizadaPor, descripcion,
            precioConfeccion, precioEmpaque, empaqueActivo, precioManualidad,
            fotoSeleccionada, textoPiezas,
            talla1, talla2, talla3, filasMedidas,
            combinacionColores, confeccion, notaVerificar, consumoSesgo, notaFinal
        } = req.body;

        const existe = await query('SELECT id FROM fichas_confeccion WHERE id = $1', [id]);
        if (existe.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Ficha no encontrada' });
        }

        await query(`
            UPDATE fichas_confeccion SET
                referencia=$1, fecha_envio=$2, fecha_entrega=$3,
                n_corte=$4, cantidad=$5, ficha_realizada_por=$6, descripcion=$7,
                precio_confeccion=$8, precio_empaque=$9, empaque_activo=$10, precio_manualidad=$11,
                foto_seleccionada=$12, texto_piezas=$13,
                talla1=$14, talla2=$15, talla3=$16, filas_medidas=$17,
                combinacion_colores=$18, confeccion=$19, nota_verificar=$20,
                consumo_sesgo=$21, nota_final=$22,
                updated_at=CURRENT_TIMESTAMP
            WHERE id=$23
        `, [
            referencia, fechaEnvio, fechaEntrega,
            nCorte, cantidad, fichaRealizadaPor, descripcion,
            precioConfeccion, precioEmpaque, empaqueActivo ?? true, precioManualidad,
            fotoSeleccionada ?? 1, textoPiezas,
            talla1 ?? 'XL', talla2 ?? '2XL', talla3 ?? '3XL',
            JSON.stringify(filasMedidas || []),
            combinacionColores, confeccion, notaVerificar, consumoSesgo, notaFinal,
            id
        ]);

        const updated = await query('SELECT * FROM fichas_confeccion WHERE id = $1', [id]);
        return res.json({ success: true, data: mapFicha(updated.rows[0]), message: 'Ficha actualizada exitosamente' });
    } catch (error) {
        console.error('Error actualizando ficha confeccion:', error);
        return res.status(500).json({ success: false, message: 'Error al actualizar ficha' });
    }
};

// ── DELETE /api/fichas-confeccion/:id ─────────────────────────────────────────

const deleteFichaConfeccion = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('DELETE FROM fichas_confeccion WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Ficha no encontrada' });
        }
        return res.json({ success: true, message: 'Ficha eliminada exitosamente' });
    } catch (error) {
        console.error('Error eliminando ficha confeccion:', error);
        return res.status(500).json({ success: false, message: 'Error al eliminar ficha' });
    }
};

module.exports = {
    getFichasConfeccion,
    getFichaConfeccion,
    createFichaConfeccion,
    updateFichaConfeccion,
    deleteFichaConfeccion,
};
