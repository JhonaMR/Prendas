// ============================================
// CONTROLADOR: Maletas
// Gestión de maletas para asignar referencias a correrías
// ============================================

const pool = require('../config/database');

/**
 * GET /api/maletas
 * Obtener todas las maletas
 */
const getMaletas = async (req, res) => {
    try {
        const result = await pool.query(`
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
 * Obtener una maleta con sus referencias
 */
const getMaleta = async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener maleta
        const maletaResult = await pool.query(`
            SELECT 
                m.*,
                c.name as correria_nombre,
                c.year as correria_year
            FROM maletas m
            LEFT JOIN correrias c ON m.correria_id = c.id
            WHERE m.id = $1
        `, [id]);

        if (maletaResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Maleta no encontrada' });
        }

        const m = maletaResult.rows[0];

        // Obtener referencias de la maleta
        const referenciasResult = await pool.query(`
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

        const maleta = {
            id: m.id,
            nombre: m.nombre,
            correriaId: m.correria_id,
            correriaNombre: m.correria_nombre,
            correriaYear: m.correria_year,
            referencias,
            createdBy: m.created_by,
            createdAt: m.created_at,
            updatedAt: m.updated_at
        };

        return res.json({ success: true, data: maleta });
    } catch (error) {
        console.error('❌ Error obteniendo maleta:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener maleta' });
    }
};

/**
 * POST /api/maletas
 * Crear nueva maleta
 */
const createMaleta = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { nombre, correriaId, referencias, createdBy } = req.body;

        if (!nombre) {
            return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
        }

        if (!referencias || referencias.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe agregar al menos una referencia'
            });
        }

        await client.query('BEGIN');

        // Crear maleta
        const maletaResult = await client.query(`
            INSERT INTO maletas (nombre, correria_id, created_by)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [nombre, correriaId || null, createdBy]);

        const maletaId = maletaResult.rows[0].id;

        // Insertar referencias
        for (let i = 0; i < referencias.length; i++) {
            await client.query(`
                INSERT INTO maletas_referencias (maleta_id, referencia, orden)
                VALUES ($1, $2, $3)
                ON CONFLICT (maleta_id, referencia) DO NOTHING
            `, [maletaId, referencias[i], i]);
        }

        // Si hay correría, actualizar product_references
        if (correriaId) {
            for (const ref of referencias) {
                // Verificar si existe en product_references
                const existe = await client.query(
                    'SELECT id FROM product_references WHERE id = $1',
                    [ref]
                );

                if (existe.rows.length > 0) {
                    // Verificar si ya tiene esta correría
                    const tieneCorreria = await client.query(`
                        SELECT 1 FROM correria_catalog 
                        WHERE reference_id = $1 AND correria_id = $2
                    `, [ref, correriaId]);

                    if (tieneCorreria.rows.length === 0) {
                        // Agregar correría
                        await client.query(`
                            INSERT INTO correria_catalog (reference_id, correria_id)
                            VALUES ($1, $2)
                            ON CONFLICT DO NOTHING
                        `, [ref, correriaId]);
                    }
                }
            }
        }

        await client.query('COMMIT');

        return res.json({
            success: true,
            data: {
                id: maletaId,
                nombre: maletaResult.rows[0].nombre,
                numReferencias: referencias.length
            },
            message: 'Maleta creada exitosamente'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error creando maleta:', error);
        return res.status(500).json({ success: false, message: 'Error al crear maleta' });
    } finally {
        client.release();
    }
};

/**
 * PUT /api/maletas/:id
 * Actualizar maleta
 */
const updateMaleta = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { id } = req.params;
        const { nombre, correriaId, referencias } = req.body;

        // Verificar que existe
        const existe = await client.query(
            'SELECT correria_id FROM maletas WHERE id = $1',
            [id]
        );

        if (existe.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Maleta no encontrada' });
        }

        const correriaAnterior = existe.rows[0].correria_id;

        await client.query('BEGIN');

        // Actualizar maleta
        await client.query(`
            UPDATE maletas
            SET nombre = COALESCE($1, nombre),
                correria_id = $2
            WHERE id = $3
        `, [nombre, correriaId, id]);

        // Si se proporcionaron referencias, actualizar
        if (referencias && referencias.length > 0) {
            // Eliminar referencias actuales
            await client.query(
                'DELETE FROM maletas_referencias WHERE maleta_id = $1',
                [id]
            );

            // Insertar nuevas referencias
            for (let i = 0; i < referencias.length; i++) {
                await client.query(`
                    INSERT INTO maletas_referencias (maleta_id, referencia, orden)
                    VALUES ($1, $2, $3)
                `, [id, referencias[i], i]);
            }

            // Actualizar correria_catalog si cambió la correría
            if (correriaId && correriaId !== correriaAnterior) {
                for (const ref of referencias) {
                    const existe = await client.query(
                        'SELECT id FROM product_references WHERE id = $1',
                        [ref]
                    );

                    if (existe.rows.length > 0) {
                        // Remover correría anterior si existía
                        if (correriaAnterior) {
                            await client.query(`
                                DELETE FROM correria_catalog
                                WHERE reference_id = $1 AND correria_id = $2
                            `, [ref, correriaAnterior]);
                        }

                        // Agregar nueva correría
                        await client.query(`
                            INSERT INTO correria_catalog (reference_id, correria_id)
                            VALUES ($1, $2)
                            ON CONFLICT DO NOTHING
                        `, [ref, correriaId]);
                    }
                }
            }
        }

        await client.query('COMMIT');

        return res.json({
            success: true,
            message: 'Maleta actualizada exitosamente'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error actualizando maleta:', error);
        return res.status(500).json({ success: false, message: 'Error al actualizar maleta' });
    } finally {
        client.release();
    }
};

/**
 * DELETE /api/maletas/:id
 * Eliminar maleta
 */
const deleteMaleta = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { id } = req.params;

        await client.query('BEGIN');

        // Las referencias se eliminan automáticamente por CASCADE
        const result = await client.query(
            'DELETE FROM maletas WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Maleta no encontrada' });
        }

        await client.query('COMMIT');

        return res.json({ success: true, message: 'Maleta eliminada exitosamente' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error eliminando maleta:', error);
        return res.status(500).json({ success: false, message: 'Error al eliminar maleta' });
    } finally {
        client.release();
    }
};

/**
 * GET /api/maletas/referencias-sin-correria
 * Obtener referencias que NO tienen correría asignada
 */
const getReferencias SinCorreria = async (req, res) => {
    try {
        const result = await pool.query(`
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
