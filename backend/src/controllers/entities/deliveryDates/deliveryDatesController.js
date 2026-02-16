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

        if (result.errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación encontrados',
                errors: result.errors,
                saved: result.saved
            });
        }

        return res.json({
            success: true,
            message: `${result.saved} registro(s) guardado(s) exitosamente`,
            saved: result.saved
        });
    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al guardar fechas de entrega'
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
