// ============================================
// CONTROLADOR: Configuración Pago de Lotes
// Maneja los parámetros globales: %OF, %ML, Base Rte. Fte.
// ============================================

const { query } = require('../config/database');

/**
 * GET /api/pago-lotes-config
 * Devuelve todos los parámetros como objeto { pct_of, pct_ml, base_rte_fte }
 */
const getConfig = async (req, res) => {
    try {
        const result = await query('SELECT clave, valor FROM pago_lotes_config ORDER BY id');
        const config = {};
        result.rows.forEach(r => { config[r.clave] = parseFloat(r.valor); });
        return res.json({ success: true, data: config });
    } catch (error) {
        console.error('❌ Error obteniendo config pago lotes:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener configuración' });
    }
};

/**
 * PUT /api/pago-lotes-config
 * Actualiza uno o más parámetros
 * Body: { pct_of: 40, pct_ml: 60, base_rte_fte: 105000 }
 */
const updateConfig = async (req, res) => {
    try {
        const { pct_of, pct_ml, base_rte_fte } = req.body;
        const updatedBy = req.user?.name || req.user?.id || 'sistema';

        // Validar que OF + ML = 100 si se envían ambos
        if (pct_of !== undefined && pct_ml !== undefined) {
            if (Number(pct_of) + Number(pct_ml) !== 100) {
                return res.status(400).json({ success: false, message: 'pct_of + pct_ml debe sumar 100' });
            }
        }

        const updates = [];
        if (pct_of !== undefined)      updates.push({ clave: 'pct_of',       valor: pct_of });
        if (pct_ml !== undefined)      updates.push({ clave: 'pct_ml',       valor: pct_ml });
        if (base_rte_fte !== undefined) updates.push({ clave: 'base_rte_fte', valor: base_rte_fte });

        for (const u of updates) {
            await query(
                `UPDATE pago_lotes_config
                 SET valor = $1, updated_at = CURRENT_TIMESTAMP, updated_by = $2
                 WHERE clave = $3`,
                [u.valor, updatedBy, u.clave]
            );
        }

        // Devolver config actualizada
        const result = await query('SELECT clave, valor FROM pago_lotes_config ORDER BY id');
        const config = {};
        result.rows.forEach(r => { config[r.clave] = parseFloat(r.valor); });

        return res.json({ success: true, data: config });
    } catch (error) {
        console.error('❌ Error actualizando config pago lotes:', error);
        return res.status(500).json({ success: false, message: 'Error al actualizar configuración' });
    }
};

module.exports = { getConfig, updateConfig };
