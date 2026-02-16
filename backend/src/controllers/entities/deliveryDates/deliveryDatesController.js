/**
 * 🎮 CONTROLADOR DE FECHAS DE ENTREGA
 * 
 * Maneja las peticiones HTTP para operaciones de fechas de entrega
 */

const {
    getAllDeliveryDates,
    saveDeliveryDatesBatch,
    deleteDeliveryDate
} = require('./deliveryDatesService');

/**
 * GET /api/delivery-dates
 * Obtener todas las fechas de entrega
 */
const getDeliveryDates = (req, res) => {
    try {
        const dates = getAllDeliveryDates();

        return res.json({
            success: true,
            data: dates
        });
    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener fechas de entrega'
        });
    }
};

/**
 * POST /api/delivery-dates/batch
 * Guardar o actualizar múltiples fechas de entrega
 * Implementa persistencia parcial: guarda válidos, rechaza inválidos
 */
const saveDeliveryDatesBatchHandler = (req, res) => {
    try {
        const { dates } = req.body;
        const userId = req.user?.id || 'system';

        if (!dates || !Array.isArray(dates)) {
            return res.status(400).json({
                success: false,
                message: 'Datos inválidos: se requiere un array de fechas'
            });
        }

        if (dates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El array de fechas no puede estar vacío'
            });
        }

        const result = saveDeliveryDatesBatch(dates, userId);

        // Respuesta con persistencia parcial
        return res.json({
            success: result.summary.failed === 0,
            summary: result.summary,
            saved: result.saved,
            errors: result.errors,
            message: result.summary.failed === 0 
                ? `✅ ${result.summary.saved} registro(s) guardado(s) exitosamente`
                : `⚠️ ${result.summary.saved} guardado(s), ${result.summary.failed} error(es)`
        });
    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al guardar fechas de entrega',
            error: error.message
        });
    }
};

/**
 * DELETE /api/delivery-dates/:id
 * Eliminar una fecha de entrega
 */
const deleteDeliveryDateHandler = (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID es requerido'
            });
        }

        const result = deleteDeliveryDate(id);

        return res.json(result);
    } catch (error) {
        console.error('❌ Error:', error);
        
        if (error.message === 'Registro no encontrado') {
            return res.status(404).json({
                success: false,
                message: 'Registro no encontrado'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error al eliminar fecha de entrega'
        });
    }
};

module.exports = {
    getDeliveryDates,
    saveDeliveryDatesBatchHandler,
    deleteDeliveryDateHandler
};
