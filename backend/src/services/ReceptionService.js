/**
 * 📦 RECEPTION SERVICE - POSTGRESQL
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
                items: itemsResult.rows,
                receivedBy: r.received_by,
                createdAt: r.created_at,
                affectsInventory: r.affects_inventory !== false
            };
        }));

        return PaginationService.buildPaginatedResponse(mappedReceptions, validPage, validLimit, total, filters);
    } catch (error) {
        logger.error('❌ Error getting receptions with pagination:', error);
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
                `INSERT INTO receptions (id, batch_code, confeccionista, has_seconds, charge_type, charge_units, received_by, created_at, affects_inventory)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *`,
                [
                    receptionData.id,
                    receptionData.batchCode,
                    receptionData.confeccionista,
                    receptionData.hasSeconds ? 1 : 0,
                    receptionData.chargeType,
                    receptionData.chargeUnits,
                    receptionData.receivedBy,
                    new Date(),
                    receptionData.affectsInventory !== false ? true : false
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
        logger.error('❌ Error creating reception:', error);
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
        logger.error('❌ Error getting reception:', error);
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
const updateReception = async (id, data) => {
    try {
        const result = await query(
            `UPDATE receptions 
            SET batch_code = $1, confeccionista = $2, has_seconds = $3, charge_type = $4, charge_units = $5, affects_inventory = $6
            WHERE id = $7
            RETURNING *`,
            [data.batchCode, data.confeccionista, data.hasSeconds ? 1 : 0, data.chargeType, data.chargeUnits, data.affectsInventory !== false, id]
        );

        return result.rows[0];
    } catch (error) {
        logger.error('❌ Error updating reception:', error);
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

            // Luego eliminar la recepción
            const result = await client.query(
                `DELETE FROM receptions WHERE id = $1`,
                [id]
            );

            return result.rowCount > 0;
        });
    } catch (error) {
        logger.error('❌ Error deleting reception:', error);
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
