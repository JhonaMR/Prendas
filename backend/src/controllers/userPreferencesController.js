/**
 * 🎨 CONTROLADOR DE PREFERENCIAS DE USUARIO
 * 
 * Maneja las preferencias de visualización del usuario:
 * - Orden de vistas en el homeview
 * - Configuración personalizada por rol
 */

const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * GET /api/user/preferences
 * Obtener preferencias del usuario autenticado
 */
const getUserPreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        logger.info(`📋 Obteniendo preferencias para usuario: ${userId}`);

        if (!userId) {
            logger.warn('⚠️ Usuario no autenticado');
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        // Buscar preferencias del usuario
        logger.info(`🔍 Ejecutando query para preferencias del usuario ${userId}`);
        const result = await query(
            `SELECT view_order FROM user_view_preferences WHERE user_id = $1`,
            [userId]
        );
        logger.info(`✅ Query ejecutada. Filas encontradas: ${result.rows.length}`);

        // Si no existen preferencias, retornar array vacío (usará orden por defecto)
        if (result.rows.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    viewOrder: []
                }
            });
        }

        // Asegurar que view_order es un array (PostgreSQL devuelve JSONB como string)
        let viewOrder = [];
        if (result.rows[0].view_order) {
            if (typeof result.rows[0].view_order === 'string') {
                viewOrder = JSON.parse(result.rows[0].view_order);
            } else if (Array.isArray(result.rows[0].view_order)) {
                viewOrder = result.rows[0].view_order;
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                viewOrder: viewOrder
            }
        });
    } catch (error) {
        logger.error('Error obteniendo preferencias de usuario:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener preferencias',
            error: error.message
        });
    }
};

/**
 * POST /api/user/preferences
 * Guardar preferencias del usuario autenticado
 * Body: { viewOrder: ['view1', 'view2', ...] }
 */
const saveUserPreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const { viewOrder } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        if (!Array.isArray(viewOrder)) {
            return res.status(400).json({
                success: false,
                message: 'viewOrder debe ser un array'
            });
        }

        // Verificar si ya existen preferencias para este usuario
        const existingPreferences = await query(
            `SELECT id FROM user_view_preferences WHERE user_id = $1`,
            [userId]
        );

        let result;

        if (existingPreferences.rows.length > 0) {
            // Actualizar preferencias existentes
            result = await query(
                `UPDATE user_view_preferences 
                 SET view_order = $1, updated_at = CURRENT_TIMESTAMP
                 WHERE user_id = $2
                 RETURNING view_order`,
                [JSON.stringify(viewOrder), userId]
            );
        } else {
            // Crear nuevas preferencias
            result = await query(
                `INSERT INTO user_view_preferences (user_id, view_order)
                 VALUES ($1, $2)
                 RETURNING view_order`,
                [userId, JSON.stringify(viewOrder)]
            );
        }

        // Asegurar que view_order es un array (PostgreSQL devuelve JSONB como string)
        let savedViewOrder = [];
        if (result.rows[0].view_order) {
            if (typeof result.rows[0].view_order === 'string') {
                savedViewOrder = JSON.parse(result.rows[0].view_order);
            } else if (Array.isArray(result.rows[0].view_order)) {
                savedViewOrder = result.rows[0].view_order;
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Preferencias guardadas correctamente',
            data: {
                viewOrder: savedViewOrder
            }
        });
    } catch (error) {
        logger.error('Error guardando preferencias de usuario:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al guardar preferencias',
            error: error.message
        });
    }
};

module.exports = {
    getUserPreferences,
    saveUserPreferences
};
