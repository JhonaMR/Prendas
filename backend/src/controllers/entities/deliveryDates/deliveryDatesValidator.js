/**
 * 🔍 VALIDADOR DE FECHAS DE ENTREGA
 * 
 * Valida los datos de fechas de entrega antes de guardarlos en la base de datos
 */

const validateDeliveryDate = (data) => {
    const errors = {};

    // Validar confeccionista_id
    if (!data.confeccionistaId || (typeof data.confeccionistaId === 'string' && data.confeccionistaId.trim() === '')) {
        errors.confeccionistaId = 'Confeccionista es requerido';
    }

    // Validar reference_id
    if (!data.referenceId || (typeof data.referenceId === 'string' && data.referenceId.trim() === '')) {
        errors.referenceId = 'Referencia es requerida';
    }

    // Validar quantity
    if (data.quantity === undefined || data.quantity === null || data.quantity === '') {
        errors.quantity = 'Cantidad es requerida';
    } else if (data.quantity <= 0) {
        errors.quantity = 'Cantidad debe ser mayor a 0';
    } else if (!Number.isInteger(Number(data.quantity))) {
        errors.quantity = 'Cantidad debe ser un número entero';
    }

    // Validar send_date
    if (!data.sendDate || (typeof data.sendDate === 'string' && data.sendDate.trim() === '')) {
        errors.sendDate = 'Fecha de envío es requerida';
    } else if (!isValidDate(data.sendDate)) {
        errors.sendDate = `Fecha de envío inválida: ${data.sendDate} (formato: YYYY-MM-DD)`;
    }

    // Validar expected_date
    if (!data.expectedDate || (typeof data.expectedDate === 'string' && data.expectedDate.trim() === '')) {
        errors.expectedDate = 'Fecha presupuestada es requerida';
    } else if (!isValidDate(data.expectedDate)) {
        errors.expectedDate = `Fecha presupuestada inválida: ${data.expectedDate} (formato: YYYY-MM-DD)`;
    }

    // Validar delivery_date (opcional pero si existe debe ser válida)
    if (data.deliveryDate && (typeof data.deliveryDate === 'string' && data.deliveryDate.trim() !== '')) {
        if (!isValidDate(data.deliveryDate)) {
            errors.deliveryDate = `Fecha de entrega inválida: ${data.deliveryDate} (formato: YYYY-MM-DD)`;
        }
    }

    // Validar process (opcional)
    if (data.process && typeof data.process !== 'string') {
        errors.process = 'Proceso debe ser texto';
    }

    // Validar observation (opcional)
    if (data.observation && typeof data.observation !== 'string') {
        errors.observation = 'Observación debe ser texto';
    }

    // Validar created_by
    if (!data.createdBy || (typeof data.createdBy === 'string' && data.createdBy.trim() === '')) {
        errors.createdBy = 'Usuario creador es requerido';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validar que una fecha sea válida en formato YYYY-MM-DD
 */
function isValidDate(dateString) {
    if (typeof dateString !== 'string') return false;
    
    // Verificar formato YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;

    // Verificar que sea una fecha válida
    const date = new Date(dateString + 'T00:00:00Z');
    return date instanceof Date && !isNaN(date);
}

/**
 * Validar que una referencia existe
 */
const validateReferenceExists = (db, referenceId) => {
    try {
        const ref = db.prepare('SELECT id FROM product_references WHERE id = ?').get(referenceId);
        return !!ref;
    } catch (error) {
        console.error('Error validating reference:', error);
        return false;
    }
};

/**
 * Validar que un confeccionista existe
 */
const validateConfeccionistaExists = (db, confeccionistaId) => {
    try {
        const conf = db.prepare('SELECT id FROM confeccionistas WHERE id = ?').get(confeccionistaId);
        return !!conf;
    } catch (error) {
        console.error('Error validating confeccionista:', error);
        return false;
    }
};

/**
 * Detectar registros duplicados en un lote
 * DESHABILITADO: Es normal tener múltiples registros del mismo confeccionista con la misma referencia
 * incluso en la misma fecha (múltiples lotes)
 */
const detectDuplicates = (records) => {
    // Retornar array vacío - sin validación de duplicados
    return [];
};

module.exports = {
    validateDeliveryDate,
    isValidDate,
    validateReferenceExists,
    validateConfeccionistaExists,
    detectDuplicates
};
