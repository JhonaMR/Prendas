// ============================================
// CONTROLADOR: Maletas
// Gestión de maletas para asignar referencias a correrías
// ============================================

const { query, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

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
                (SELECT COUNT(*) FROM maletas_referencias WHERE maleta_id = m.id) as num_referencias,
                (SELECT COUNT(*) FROM maletas_referencias_recibidas WHERE maleta_id = m.id) as num_referencias_recibidas
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
            numReferenciasRecibidas: parseInt(m.num_referencias_recibidas),
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

        // Obtener cantidad de referencias recibidas
        const recibidosResult = await query(`
            SELECT COUNT(*) as count FROM maletas_referencias_recibidas WHERE maleta_id = $1
        `, [id]);
        const numReferenciasRecibidas = parseInt(recibidosResult.rows[0].count) || 0;

        return res.json({
            success: true,
            data: {
                id: m.id,
                nombre: m.nombre,
                correriaId: m.correria_id,
                correriaNombre: m.correria_nombre,
                correriaYear: m.correria_year,
                referencias,
                numReferenciasRecibidas,
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

        let maletaData;
        await transaction(async (client) => {
            const maletaResult = await client.query(`
                INSERT INTO maletas (nombre, correria_id, created_by) VALUES ($1, $2, $3) RETURNING *
            `, [nombre, correriaId || null, createdBy]);

            const maletaId = maletaResult.rows[0].id;

            if (referencias && referencias.length > 0) {
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
                                INSERT INTO correria_catalog (id, reference_id, correria_id, added_at)
                                VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                                ON CONFLICT DO NOTHING
                            `, [uuidv4(), ref, correriaId]);
                        }
                    }
                }
            }

            maletaData = { id: maletaId, nombre: maletaResult.rows[0].nombre };
        });

        return res.json({
            success: true,
            data: { id: maletaData.id, nombre: maletaData.nombre, numReferencias: referencias ? referencias.length : 0 },
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
        const { nombre, correriaId, referencias, estado, recibidoPor, fechaRecepcion, numReferenciasRecibidas } = req.body;

        const existe = await query('SELECT correria_id FROM maletas WHERE id = $1', [id]);
        if (existe.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Maleta no encontrada' });
        }
        const correriaAnterior = existe.rows[0].correria_id;

        // Obtener referencias anteriores de la maleta
        const referenciasAnterioresResult = await query(`
            SELECT referencia FROM maletas_referencias WHERE maleta_id = $1
        `, [id]);
        const referenciasAnteriores = referenciasAnterioresResult.rows.map(r => r.referencia);

        // Eliminar referencias anteriores ANTES de la transacción
        await query('DELETE FROM maletas_referencias WHERE maleta_id = $1', [id]);

        await transaction(async (client) => {
            await client.query(`
                UPDATE maletas SET 
                    nombre = COALESCE($1, nombre), 
                    correria_id = $2,
                    estado = COALESCE($3, estado),
                    recibido_por = COALESCE($4, recibido_por),
                    fecha_recepcion = COALESCE($5, fecha_recepcion),
                    num_referencias_recibidas = COALESCE($6, num_referencias_recibidas)
                WHERE id = $7
            `, [nombre, correriaId, estado, recibidoPor, fechaRecepcion, numReferenciasRecibidas, id]);

            if (referencias && referencias.length > 0) {
                // Insertar nuevas referencias
                for (let i = 0; i < referencias.length; i++) {
                    await client.query(`
                        INSERT INTO maletas_referencias (maleta_id, referencia, orden) VALUES ($1, $2, $3)
                    `, [id, referencias[i], i]);
                }

                // Asignar/actualizar correrías a las referencias nuevas
                for (const ref of referencias) {
                    const existeRef = await client.query('SELECT id FROM product_references WHERE id = $1', [ref]);
                    if (existeRef.rows.length > 0) {
                        // Si hay correría nueva, asignarla
                        if (correriaId) {
                            await client.query(`
                                INSERT INTO correria_catalog (id, reference_id, correria_id, added_at) 
                                VALUES ($1, $2, $3, CURRENT_TIMESTAMP) 
                                ON CONFLICT DO NOTHING
                            `, [uuidv4(), ref, correriaId]);
                        }
                    }
                }
            }

            // Eliminar correrías de referencias que fueron removidas
            for (const refAnterior of referenciasAnteriores) {
                if (!referencias || !referencias.includes(refAnterior)) {
                    // Esta referencia fue removida, eliminar su correría
                    if (correriaAnterior) {
                        await client.query(`
                            DELETE FROM correria_catalog WHERE reference_id = $1 AND correria_id = $2
                        `, [refAnterior, correriaAnterior]);
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

/**
 * GET /api/maletas/:id/referencias-recibidas
 */
const getReferenciasMaletaRecibidas = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await query(`
            SELECT referencia, recibido_por, fecha_recepcion FROM maletas_referencias_recibidas 
            WHERE maleta_id = $1 
            ORDER BY referencia ASC
        `, [id]);

        return res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('❌ Error obteniendo referencias recibidas:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener referencias recibidas' });
    }
};

/**
 * POST /api/maletas/:id/referencias-recibidas
 */
const createReferenciaRecibida = async (req, res) => {
    try {
        const { id } = req.params;
        const { referencia, recibidoPor, fechaRecepcion } = req.body;

        if (!referencia || !recibidoPor || !fechaRecepcion) {
            return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
        }

        const result = await query(`
            INSERT INTO maletas_referencias_recibidas (maleta_id, referencia, recibido_por, fecha_recepcion)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (maleta_id, referencia) DO UPDATE SET 
                recibido_por = $3, 
                fecha_recepcion = $4,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id
        `, [id, referencia, recibidoPor, fechaRecepcion]);

        return res.json({ success: true, message: 'Referencia recibida registrada', data: result.rows[0] });
    } catch (error) {
        console.error('❌ Error creando referencia recibida:', error);
        return res.status(500).json({ success: false, message: 'Error al registrar referencia recibida' });
    }
};

module.exports = {
    getMaletas,
    getMaleta,
    createMaleta,
    updateMaleta,
    deleteMaleta,
    getReferenciasSinCorreria,
    getReferenciasMaletaRecibidas,
    createReferenciaRecibida
};
