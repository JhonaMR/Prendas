// ============================================
// CONTROLADOR: Diseñadoras
// Gestión de catálogo de diseñadoras
// ============================================

const { query } = require('../config/database');

/**
 * GET /api/disenadoras
 */
const getDisenadoras = async (req, res) => {
    try {
        const result = await query(`
            SELECT id, nombre, cedula, telefono, activa, created_at, updated_at
            FROM disenadoras
            ORDER BY nombre ASC
        `);

        const disenadoras = result.rows.map(d => ({
            id: d.id,
            nombre: d.nombre,
            cedula: d.cedula,
            telefono: d.telefono,
            activa: d.activa,
            createdAt: d.created_at,
            updatedAt: d.updated_at
        }));

        return res.json({ success: true, data: disenadoras });
    } catch (error) {
        console.error('❌ Error obteniendo diseñadoras:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener diseñadoras' });
    }
};

/**
 * POST /api/disenadoras
 */
const createDisenadora = async (req, res) => {
    try {
        const { nombre, cedula, telefono } = req.body;

        if (!nombre) {
            return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
        }

        const result = await query(`
            INSERT INTO disenadoras (nombre, cedula, telefono, activa)
            VALUES ($1, $2, $3, true)
            RETURNING *
        `, [nombre, cedula || null, telefono || null]);

        const disenadora = result.rows[0];

        return res.json({
            success: true,
            data: {
                id: disenadora.id,
                nombre: disenadora.nombre,
                cedula: disenadora.cedula,
                telefono: disenadora.telefono,
                activa: disenadora.activa,
                createdAt: disenadora.created_at
            }
        });
    } catch (error) {
        console.error('❌ Error creando diseñadora:', error);
        return res.status(500).json({ success: false, message: 'Error al crear diseñadora' });
    }
};

/**
 * PUT /api/disenadoras/:id
 */
const updateDisenadora = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, cedula, telefono, activa } = req.body;

        const result = await query(`
            UPDATE disenadoras
            SET nombre = COALESCE($1, nombre),
                cedula = COALESCE($2, cedula),
                telefono = COALESCE($3, telefono),
                activa = COALESCE($4, activa)
            WHERE id = $5
            RETURNING *
        `, [nombre, cedula, telefono, activa, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Diseñadora no encontrada' });
        }

        const disenadora = result.rows[0];

        return res.json({
            success: true,
            data: {
                id: disenadora.id,
                nombre: disenadora.nombre,
                cedula: disenadora.cedula,
                telefono: disenadora.telefono,
                activa: disenadora.activa,
                updatedAt: disenadora.updated_at
            }
        });
    } catch (error) {
        console.error('❌ Error actualizando diseñadora:', error);
        return res.status(500).json({ success: false, message: 'Error al actualizar diseñadora' });
    }
};

/**
 * DELETE /api/disenadoras/:id
 */
const deleteDisenadora = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(`
            UPDATE disenadoras SET activa = false WHERE id = $1 RETURNING id
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Diseñadora no encontrada' });
        }

        return res.json({ success: true, message: 'Diseñadora desactivada' });
    } catch (error) {
        console.error('❌ Error eliminando diseñadora:', error);
        return res.status(500).json({ success: false, message: 'Error al eliminar diseñadora' });
    }
};

module.exports = {
    getDisenadoras,
    createDisenadora,
    updateDisenadora,
    deleteDisenadora
};
