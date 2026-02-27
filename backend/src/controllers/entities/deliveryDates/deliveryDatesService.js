/**
 * 📦 SERVICIO DE FECHAS DE ENTREGA - POSTGRESQL
 * 
 * Contiene la lógica de negocio para operaciones de fechas de entrega
 */

const { query, transaction, generateId } = require('../../../config/database');
const { validateDeliveryDate, validateReferenceExists, validateConfeccionistaExists, detectDuplicates } = require('./deliveryDatesValidator');
const PaginationService = require('../../../services/PaginationService');
const { invalidateOnCreate, invalidateOnUpdate, invalidateOnDelete } = require('../../../services/CacheInvalidationService');

/**
 * Obtener todas las fechas de entrega con paginación
 * @async
 */
const getAllWithPagination = async (page = 1, limit = 20, filters = {}) => {
    try {
        const { page: validPage, limit: validLimit } = PaginationService.validateParams(page, limit);

        // Build WHERE clause from filters
        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (filters.confeccionistaId) {
            whereClause += ` AND confeccionista_id = $${paramIndex++}`;
            params.push(filters.confeccionistaId);
        }

        if (filters.referenceId) {
            whereClause += ` AND reference_id = $${paramIndex++}`;
            params.push(filters.referenceId);
        }

        if (filters.startDate) {
            whereClause += ` AND send_date >= $${paramIndex++}`;
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            whereClause += ` AND send_date <= $${paramIndex++}`;
            params.push(filters.endDate);
        }

        // Get total count
        const countResult = await query(`SELECT COUNT(*) as count FROM delivery_dates ${whereClause}`, params);
        const total = parseInt(countResult.rows[0].count);

        // Get paginated data
        const offset = PaginationService.calculateOffset(validPage, validLimit);
        const dataResult = await query(
            `SELECT * FROM delivery_dates 
            ${whereClause}
            ORDER BY send_date DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            [...params, validLimit, offset]
        );
        
        const dates = dataResult.rows;

        const mappedDates = dates.map(d => ({
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

        return PaginationService.buildPaginatedResponse(mappedDates, validPage, validLimit, total, filters);
    } catch (error) {
        console.error('❌ Error getting delivery dates with pagination:', error);
        throw error;
    }
};

/**
 * Obtener todas las fechas de entrega
 * @async
 */
const getAllDeliveryDates = async () => {
    try {
        const result = await query('SELECT * FROM delivery_dates ORDER BY send_date DESC');
        const dates = result.rows;
        
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
 * Implementa persistencia parcial: guarda registros válidos incluso si algunos fallan
 * @async
 */
const saveDeliveryDatesBatch = async (dates, userId) => {
    const errors = [];
    const validRecords = [];
    const savedIds = [];

    try {
        // FASE 0: Detectar duplicados en el lote
        const duplicates = detectDuplicates(dates);
        duplicates.forEach(dup => {
            errors.push({
                index: dup.index,
                record: dates[dup.index],
                errors: { 
                    duplicate: `Registro duplicado (mismo confeccionista, referencia y fecha que fila ${dup.firstIndex + 1})`
                }
            });
        });

        // FASE 1: Validar todos los registros sin hacer cambios en BD
        for (let i = 0; i < dates.length; i++) {
            const date = dates[i];

            // Saltar si ya está marcado como duplicado
            if (errors.some(e => e.index === i)) {
                continue;
            }

            // Validar datos básicos
            const validation = validateDeliveryDate(date);
            if (!validation.isValid) {
                errors.push({
                    index: i,
                    record: date,
                    errors: validation.errors
                });
                continue;
            }

            // Validar referencias externas - SOLO VALIDAR REFERENCIA SI EXISTE EN LA BD
            // Si no existe, permitir como texto libre (como confeccionista)
            // const referenceResult = await query('SELECT id FROM product_references WHERE id = $1', [date.referenceId]);
            // if (referenceResult.rows.length === 0) {
            //     errors.push({
            //         index: i,
            //         record: date,
            //         errors: { referenceId: `Referencia no existe: ${date.referenceId}` }
            //     });
            //     continue;
            // }

            // Si llegó aquí, el registro es válido
            validRecords.push({
                index: i,
                data: date
            });
        }

        // FASE 2: Guardar solo los registros válidos en una transacción atómica
        if (validRecords.length > 0) {
            await transaction(async (client) => {
                for (const record of validRecords) {
                    const date = record.data;
                    const id = date.id && !date.id.startsWith('temp_') ? date.id : generateId();
                    const createdAt = date.createdAt || new Date();
                    const createdBy = date.createdBy || userId;

                    // Upsert (INSERT or UPDATE)
                    await client.query(`
                        INSERT INTO delivery_dates (
                            id, confeccionista_id, reference_id, quantity, 
                            send_date, expected_date, delivery_date, 
                            process, observation, created_by, created_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                        ON CONFLICT(id) DO UPDATE SET
                            confeccionista_id = excluded.confeccionista_id,
                            reference_id = excluded.reference_id,
                            quantity = excluded.quantity,
                            send_date = excluded.send_date,
                            expected_date = excluded.expected_date,
                            delivery_date = excluded.delivery_date,
                            process = excluded.process,
                            observation = excluded.observation
                    `, [
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
                    ]);

                    savedIds.push(id);
                }
            });
            console.log(`✅ Guardados ${savedIds.length} registros válidos`);
        }

        // Invalidate cache after batch save
        if (savedIds.length > 0) {
            invalidateOnCreate('DeliveryDate');
        }

        // FASE 3: Retornar respuesta con resumen completo
        return {
            success: errors.length === 0,
            summary: {
                total: dates.length,
                saved: savedIds.length,
                failed: errors.length
            },
            saved: savedIds,
            errors: errors
        };
    } catch (error) {
        console.error('❌ Error saving delivery dates batch:', error);
        throw error;
    }
};

/**
 * Eliminar una fecha de entrega
 * @async
 */
const deleteDeliveryDate = async (id) => {
    try {
        const result = await query('DELETE FROM delivery_dates WHERE id = $1', [id]);
        
        if (result.rowCount === 0) {
            throw new Error('Registro no encontrado');
        }

        // Invalidate cache after deletion
        invalidateOnDelete('DeliveryDate');

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
 * @async
 */
const getDeliveryDateById = async (id) => {
    try {
        const result = await query('SELECT * FROM delivery_dates WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return null;
        }

        const date = result.rows[0];
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
    getAllWithPagination,
    saveDeliveryDatesBatch,
    deleteDeliveryDate,
    getDeliveryDateById
};
