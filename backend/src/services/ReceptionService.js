/**
 * ðŸ“¦ RECEPTION SERVICE - POSTGRESQL
 * 
 * Handles reception operations with pagination support
 * Implements transactions for data consistency
 */

const { query, transaction, generateId } = require('../config/database');
const PaginationService = require('./PaginationService');
const logger = require('../utils/logger');

/**
 * Get all receptions with pagination
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
            whereClause += ` AND confeccionista = $${paramIndex++}`;
            params.push(filters.confeccionistaId);
        }

        if (filters.referenceId) {
            whereClause += ` AND id IN (SELECT reception_id FROM reception_items WHERE reference = $${paramIndex++})`;
            params.push(filters.referenceId);
        }

        if (filters.startDate) {
            whereClause += ` AND created_at >= $${paramIndex++}`;
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            whereClause += ` AND created_at <= $${paramIndex++}`;
            params.push(filters.endDate);
        }

        // Get total count
        const countResult = await query(`SELECT COUNT(*) as count FROM receptions ${whereClause}`, params);
        const total = parseInt(countResult.rows[0].count);

        // Get paginated data
        const offset = PaginationService.calculateOffset(validPage, validLimit);
        const dataResult = await query(
            `SELECT * FROM receptions 
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            [...params, validLimit, offset]
        );
        
        const receptions = dataResult.rows;

        // Get items for each reception
        const mappedReceptions = await Promise.all(receptions.map(async (r) => {
            const itemsResult = await query(
                `SELECT reference, quantity
                FROM reception_items
                WHERE reception_id = $1`,
                [r.id]
            );

            return {
                id: r.id,
                batchCode: r.batch_code,
                confeccionista: r.confeccionista,
                hasSeconds: r.has_seconds === 1 ? true : r.has_seconds === 0 ? false : null,
                chargeType: r.charge_type,
                chargeUnits: r.charge_units,
                incompleteUnits: r.incomplete_units || 0,
                isPacked: r.is_packed === true || r.is_packed === 1,
                hasMuestra: r.has_muestra === true || r.has_muestra === 1,
                bagQuantity: r.bag_quantity || 0,
                segundasUnits: r.segundas_units || 0,
                items: itemsResult.rows,
                receivedBy: r.received_by,
                createdAt: r.created_at,
                arrivalDate: r.arrival_date,
                affectsInventory: r.affects_inventory !== false,
                observacion: r.observacion || null
            };
        }));

        return PaginationService.buildPaginatedResponse(mappedReceptions, validPage, validLimit, total, filters);
    } catch (error) {
        logger.error('âŒ Error getting receptions with pagination:', error);
        throw error;
    }
};

/**
 * Create a new reception with items (transactional)
 * @async
 * @param {Object} receptionData - Reception data
 * @param {Array} items - Reception items
 * @returns {Promise<Object>} Created reception
 */
const createReception = async (receptionData, items) => {
    try {
        return await transaction(async (client) => {
            // Insert reception
            const receptionResult = await client.query(
                `INSERT INTO receptions (id, batch_code, confeccionista, has_seconds, charge_type, charge_units, incomplete_units, is_packed, has_muestra, bag_quantity, segundas_units, received_by, created_at, arrival_date, affects_inventory, observacion)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                RETURNING *`,
                [
                    receptionData.id,
                    receptionData.batchCode,
                    receptionData.confeccionista,
                    receptionData.hasSeconds ? 1 : 0,
                    receptionData.chargeType,
                    receptionData.chargeUnits || 0,
                    receptionData.incompleteUnits || 0,
                    receptionData.isPacked ? 1 : 0,
                    receptionData.hasMuestra ? 1 : 0,
                    receptionData.bagQuantity || 0,
                    receptionData.segundasUnits || 0,
                    receptionData.receivedBy,
                    new Date(),
                    receptionData.arrivalDate,
                    receptionData.affectsInventory !== false ? true : false,
                    receptionData.observacion || null
                ]
            );

            // Insert items
            for (const item of items) {
                await client.query(
                    `INSERT INTO reception_items (reception_id, reference, quantity)
                    VALUES ($1, $2, $3)`,
                    [receptionData.id, item.reference, item.quantity]
                );
            }

            return receptionResult.rows[0];
        });
    } catch (error) {
        logger.error('âŒ Error creating reception:', error);
        throw error;
    }
};

/**
 * Get reception by ID
 * @async
 * @param {string} id - Reception ID
 * @returns {Promise<Object>} Reception with items
 */
const getReceptionById = async (id) => {
    try {
        const result = await query(
            `SELECT * FROM receptions WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const reception = result.rows[0];
        const itemsResult = await query(
            `SELECT reference, quantity FROM reception_items WHERE reception_id = $1`,
            [id]
        );

        return {
            ...reception,
            items: itemsResult.rows
        };
    } catch (error) {
        logger.error('âŒ Error getting reception:', error);
        throw error;
    }
};

/**
 * Update reception
 * @async
 * @param {string} id - Reception ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} Updated reception
 */
const updateReception = async (id, data, items) => {
    try {
        return await transaction(async (client) => {
            const result = await client.query(
                `UPDATE receptions 
                SET batch_code = $1, confeccionista = $2, has_seconds = $3, charge_type = $4, charge_units = $5, affects_inventory = $6,
                    incomplete_units = $7, is_packed = $8, has_muestra = $9, bag_quantity = $10, arrival_date = $11, observacion = $12,
                    segundas_units = $13
                WHERE id = $14
                RETURNING *`,
                [
                    data.batchCode,
                    data.confeccionista,
                    data.hasSeconds ? 1 : 0,
                    data.chargeType,
                    data.chargeUnits || 0,
                    data.affectsInventory !== false,
                    data.incompleteUnits || 0,
                    data.isPacked ? 1 : 0,
                    data.hasMuestra ? 1 : 0,
                    data.bagQuantity || 0,
                    data.arrivalDate,
                    data.observacion || null,
                    data.segundasUnits || 0,
                    id
                ]
            );

            if (result.rows.length === 0) return null;

            // Si se pasan items, reemplazar los existentes
            if (items && items.length > 0) {
                await client.query(`DELETE FROM reception_items WHERE reception_id = $1`, [id]);
                for (const item of items) {
                    await client.query(
                        `INSERT INTO reception_items (reception_id, reference, quantity) VALUES ($1, $2, $3)`,
                        [id, item.reference, item.quantity]
                    );
                }
            }

            return result.rows[0];
        });
    } catch (error) {
        logger.error('âŒ Error updating reception:', error);
        throw error;
    }
};

/**
 * Delete reception
 * @async
 * @param {string} id - Reception ID
 * @returns {Promise<boolean>} Success status
 */
const deleteReception = async (id) => {
    try {
        return await transaction(async (client) => {
            // Primero eliminar los items asociados
            await client.query(
                `DELETE FROM reception_items WHERE reception_id = $1`,
                [id]
            );

            // Luego eliminar la recepciÃ³n
            const result = await client.query(
                `DELETE FROM receptions WHERE id = $1`,
                [id]
            );

            return result.rowCount > 0;
        });
    } catch (error) {
        logger.error('âŒ Error deleting reception:', error);
        throw error;
    }
};

module.exports = {
    getAllWithPagination,
    createReception,
    getReceptionById,
    updateReception,
    deleteReception
};
