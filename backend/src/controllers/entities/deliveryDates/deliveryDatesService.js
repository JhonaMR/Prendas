/**
 * 📦 SERVICIO DE FECHAS DE ENTREGA
 * 
 * Contiene la lógica de negocio para operaciones de fechas de entrega
 */

const { getDatabase, generateId } = require('../../../config/database');
const { validateDeliveryDate, validateReferenceExists, validateConfeccionistaExists } = require('./deliveryDatesValidator');

/**
 * Obtener todas las fechas de entrega
 */
const getAllDeliveryDates = () => {
    try {
        const db = getDatabase();
        const dates = db.prepare('SELECT * FROM delivery_dates ORDER BY send_date DESC').all();
        
        return dates.map(d => ({
            id: d.id,
            confeccionistaId: d.confeccionista_id,
            referenceId: d.reference_id,
            quantity: d.quantity,
            sendDate: d.send_date,
            expectedDate: d.expected_date,
            deliveryDate: d.delivery_date,
            process: d.process,
            observation: d.observation,
            createdAt: d.created_at,
            createdBy: d.created_by
        }));
    } catch (error) {
        console.error('❌ Error getting delivery dates:', error);
        throw error;
    }
};

/**
 * Guardar o actualizar múltiples fechas de entrega (batch)
 */
const saveDeliveryDatesBatch = (dates, userId) => {
    const errors = [];
    const saved = [];

    try {
        const db = getDatabase();
        db.prepare('BEGIN').run();

        for (let i = 0; i < dates.length; i++) {
            const date = dates[i];

            // Validar datos
            const validation = validateDeliveryDate(date);
            if (!validation.isValid) {
                errors.push({
                    index: i,
                    errors: validation.errors
                });
                continue;
            }

            // Validar referencias externas
            if (!validateConfeccionistaExists(db, date.confeccionistaId)) {
                errors.push({
                    index: i,
                    errors: { confeccionistaId: 'Confeccionista no existe' }
                });
                continue;
            }

            if (!validateReferenceExists(db, date.referenceId)) {
                errors.push({
                    index: i,
                    errors: { referenceId: 'Referencia no existe' }
                });
                continue;
            }

            // Preparar datos para insertar
            const id = date.id && !date.id.startsWith('temp_') ? date.id : generateId();
            const createdAt = date.createdAt || new Date().toISOString();
            const createdBy = date.createdBy || userId;

            // Upsert (INSERT or UPDATE)
            const upsertStmt = db.prepare(`
                INSERT INTO delivery_dates (
                    id, confeccionista_id, reference_id, quantity, 
                    send_date, expected_date, delivery_date, 
                    process, observation, created_by, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    confeccionista_id = excluded.confeccionista_id,
                    reference_id = excluded.reference_id,
                    quantity = excluded.quantity,
                    send_date = excluded.send_date,
                    expected_date = excluded.expected_date,
                    delivery_date = excluded.delivery_date,
                    process = excluded.process,
                    observation = excluded.observation
            `);

            upsertStmt.run(
                id,
                date.confeccionistaId,
                date.referenceId,
                date.quantity,
                date.sendDate,
                date.expectedDate,
                date.deliveryDate || null,
                date.process || '',
                date.observation || '',
                createdBy,
                createdAt
            );

            saved.push(id);
        }

        if (errors.length === 0) {
            db.prepare('COMMIT').run();
        } else {
            db.prepare('ROLLBACK').run();
            throw new Error('Errores de validación encontrados');
        }

        return {
            success: true,
            saved: saved.length,
            errors: errors
        };
    } catch (error) {
        try {
            const db = getDatabase();
            db.prepare('ROLLBACK').run();
        } catch (rollbackError) {
            console.error('Error during rollback:', rollbackError);
        }
        console.error('❌ Error saving delivery dates batch:', error);
        throw error;
    }
};

/**
 * Eliminar una fecha de entrega
 */
const deleteDeliveryDate = (id) => {
    try {
        const db = getDatabase();
        const result = db.prepare('DELETE FROM delivery_dates WHERE id = ?').run(id);
        
        if (result.changes === 0) {
            throw new Error('Registro no encontrado');
        }

        return {
            success: true,
            message: 'Registro eliminado exitosamente'
        };
    } catch (error) {
        console.error('❌ Error deleting delivery date:', error);
        throw error;
    }
};

/**
 * Obtener una fecha de entrega por ID
 */
const getDeliveryDateById = (id) => {
    try {
        const db = getDatabase();
        const date = db.prepare('SELECT * FROM delivery_dates WHERE id = ?').get(id);
        
        if (!date) {
            return null;
        }

        return {
            id: date.id,
            confeccionistaId: date.confeccionista_id,
            referenceId: date.reference_id,
            quantity: date.quantity,
            sendDate: date.send_date,
            expectedDate: date.expected_date,
            deliveryDate: date.delivery_date,
            process: date.process,
            observation: date.observation,
            createdAt: date.created_at,
            createdBy: date.created_by
        };
    } catch (error) {
        console.error('❌ Error getting delivery date:', error);
        throw error;
    }
};

module.exports = {
    getAllDeliveryDates,
    saveDeliveryDatesBatch,
    deleteDeliveryDate,
    getDeliveryDateById
};
