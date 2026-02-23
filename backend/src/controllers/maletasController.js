// ============================================
// CONTROLADOR: Maletas
// Gestión de maletas para asignar referencias a correrías
// ============================================

const { query, transaction } = require('../config/database');

/**
 * GET /api/maletas
 */
const getMaletas = async (req, res) => {
    try {
        const result = await query(`
            SELECT
                m.*,
                c.name as correria_nombre,
                c.year as correria_year,
                (SELECT COUNT(*) FROM maletas_referencias WHERE maleta_id = m.id) as num_referencias
            FROM maletas m
            LEFT JOIN correrias c ON m.correria_id = c.id
            ORDER BY m.created_at DESC
        `);

        const maletas = result.rows.map(m => ({
            id: m.id,
            nombre: m.nombre,
            correriaId: m.correria_id,
            correriaNombre: m.correria_nombre,
            correriaYear: m.correria_year,
            numReferencias: parseInt(m.num_referencias),
            createdBy: m.created_by,
            createdAt: m.created_at,
            updatedAt: m.updated_at
        }));

        return res.json({ success: true, data: maletas });
    } catch (error) {
        console.error('❌ Error obteniendo maletas:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener maletas' });
    }
};

/**
 * GET /api/maletas/:id
 */
const getMaleta = async (req, res) => {
    try {
        const { id } = req.params;

        const maletaResult = await query(`
            SELECT m.*, c.name as correria_nombre, c.year as correria_year
            FROM maletas m
            LEFT JOIN correrias c ON m.correria_id = c.id
            WHERE m.id = $1
        `, [id]);

        if (maletaResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Maleta no encontrada' });
        }

        const m = maletaResult.rows[0];

        const referenciasResult = await query(`
            SELECT
                mr.referencia,
                mr.orden,
                COALESCE(fd.descripcion, fc.descripcion) as descripcion,
                COALESCE(fd.foto_1, fc.foto_1) as foto
            FROM maletas_referencias mr
            LEFT JOIN fichas_diseno fd ON mr.referencia = fd.referencia
            LEFT JOIN fichas_costo fc ON mr.referencia = fc.referencia
            WHERE mr.maleta_id = $1
            ORDER BY mr.orden ASC, mr.referencia ASC
        `, [id]);

        const referencias = referenciasResult.rows.map(r => ({
            referencia: r.referencia,
            descripcion: r.descripcion,
            foto: r.foto,
            orden: r.orden
        }));

        return res.json({
            success: true,
            data: {
                id: m.id,
                nombre: m.nombre,
                correriaId: m.correria_id,
                correriaNombre: m.correria_nombre,
                correriaYear: m.correria_year,
                referencias,
                createdBy: m.created_by,
                createdAt: m.created_at,
                updatedAt: m.updated_at
            }
        });
    } catch (error) {
        console.error('❌ Error obteniendo maleta:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener maleta' });
    }
};

/**
 * POST /api/maletas
 */
const createMaleta = async (req, res) => {
    try {
        const { nombre, correriaId, referencias, createdBy } = req.body;

        if (!nombre) {
            return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
        }
        if (!referencias || referencias.length === 0) {
            return res.status(400).json({ success: false, message: 'Debe agregar al menos una referencia' });
        }

        let maletaData;
        await transaction(async (client) => {
            const maletaResult = await client.query(`
                INSERT INTO maletas (nombre, correria_id, created_by) VALUES ($1, $2, $3) RETURNING *
            `, [nombre, correriaId || null, createdBy]);

            const maletaId = maletaResult.rows[0].id;

            for (let i = 0; i < referencias.length; i++) {
                await client.query(`
                    INSERT INTO maletas_referencias (maleta_id, referencia, orden)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (maleta_id, referencia) DO NOTHING
                `, [maletaId, referencias[i], i]);
            }

            if (correriaId) {
                for (const ref of referencias) {
                    const existe = await client.query('SELECT id FROM product_references WHERE id = $1', [ref]);
                    if (existe.rows.length > 0) {
                        await client.query(`
                            INSERT INTO correria_catalog (reference_id, correria_id)
                            VALUES ($1, $2)
                            ON CONFLICT DO NOTHING
                        `, [ref, correriaId]);
                    }
                }
            }

            maletaData = { id: maletaId, nombre: maletaResult.rows[0].nombre };
        });

        return res.json({
            success: true,
            data: { id: maletaData.id, nombre: maletaData.nombre, numReferencias: referencias.length },
            message: 'Maleta creada exitosamente'
        });
    } catch (error) {
        console.error('❌ Error creando maleta:', error);
        return res.status(500).json({ success: false, message: 'Error al crear maleta' });
    }
};

/**
 * PUT /api/maletas/:id
 */
const updateMaleta = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, correriaId, referencias } = req.body;

        const existe = await query('SELECT correria_id FROM maletas WHERE id = $1', [id]);
        if (existe.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Maleta no encontrada' });
        }
        const correriaAnterior = existe.rows[0].correria_id;

        await transaction(async (client) => {
            await client.query(`
                UPDATE maletas SET nombre = COALESCE($1, nombre), correria_id = $2 WHERE id = $3
            `, [nombre, correriaId, id]);

            if (referencias && referencias.length > 0) {
                await client.query('DELETE FROM maletas_referencias WHERE maleta_id = $1', [id]);

                for (let i = 0; i < referencias.length; i++) {
                    await client.query(`
                        INSERT INTO maletas_referencias (maleta_id, referencia, orden) VALUES ($1, $2, $3)
                    `, [id, referencias[i], i]);
                }

                if (correriaId && correriaId !== correriaAnterior) {
                    for (const ref of referencias) {
                        const existeRef = await client.query('SELECT id FROM product_references WHERE id = $1', [ref]);
                        if (existeRef.rows.length > 0) {
                            if (correriaAnterior) {
                                await client.query('DELETE FROM correria_catalog WHERE reference_id = $1 AND correria_id = $2', [ref, correriaAnterior]);
                            }
                            await client.query(`
                                INSERT INTO correria_catalog (reference_id, correria_id) VALUES ($1, $2) ON CONFLICT DO NOTHING
                            `, [ref, correriaId]);
                        }
                    }
                }
            }
        });

        return res.json({ success: true, message: 'Maleta actualizada exitosamente' });
    } catch (error) {
        console.error('❌ Error actualizando maleta:', error);
        return res.status(500).json({ success: false, message: 'Error al actualizar maleta' });
    }
};

/**
 * DELETE /api/maletas/:id
 */
const deleteMaleta = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query('DELETE FROM maletas WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Maleta no encontrada' });
        }

        return res.json({ success: true, message: 'Maleta eliminada exitosamente' });
    } catch (error) {
        console.error('❌ Error eliminando maleta:', error);
        return res.status(500).json({ success: false, message: 'Error al eliminar maleta' });
    }
};

/**
 * GET /api/maletas/referencias-sin-correria
 */
const getReferenciasSinCorreria = async (req, res) => {
    try {
        const result = await query(`
            SELECT DISTINCT
                pr.id as referencia,
                pr.description as descripcion,
                COALESCE(fd.foto_1, fc.foto_1) as foto
            FROM product_references pr
            LEFT JOIN correria_catalog cc ON pr.id = cc.reference_id
            LEFT JOIN fichas_diseno fd ON pr.id = fd.referencia
            LEFT JOIN fichas_costo fc ON pr.id = fc.referencia
            WHERE cc.reference_id IS NULL
            ORDER BY pr.id DESC
        `);

        const referencias = result.rows.map(r => ({
            referencia: r.referencia,
            descripcion: r.descripcion,
            foto: r.foto
        }));

        return res.json({ success: true, data: referencias });
    } catch (error) {
        console.error('❌ Error obteniendo referencias sin correría:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener referencias' });
    }
};

module.exports = {
    getMaletas,
    getMaleta,
    createMaleta,
    updateMaleta,
    deleteMaleta,
    getReferenciasSinCorreria
};
