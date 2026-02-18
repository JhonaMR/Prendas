/**
 * 📦 RETURN SERVICE - POSTGRESQL
 * 
 * Handles return reception operations with pagination support
 * Implements transactions for data consistency
 */

const { query, transaction, generateId } = require('../config/database');
const PaginationService = require('./PaginationService');
const logger = require('../utils/logger');

/**
 * Get all return receptions with pagination
 * @async
 */
const getAllWithPagination = async (page = 1, limit = 20, filters = {}) => {
    try {
        const { page: validPage, limit: validLimit } = PaginationService.validateParams(page, limit);

        // Build WHERE clause from filters
        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (filters.clientId) {
            whereClause += ` AND client_id = $${paramIndex++}`;
            params.push(filters.clientId);
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
        const countResult = await query(`SELECT COUNT(*) as count FROM return_receptions ${whereClause}`, params);
        const total = parseInt(countResult.rows[0].count);

        // Get paginated data
        const offset = PaginationService.calculateOffset(validPage, validLimit);
        const dataResult = await query(
            `SELECT * FROM return_receptions 
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            [...params, validLimit, offset]
        );
        
        const returns = dataResult.rows;

        // Get items for each return reception
        const mappedReturns = await Promise.all(returns.map(async (r) => {
            const itemsResult = await query(
                `SELECT reference, quantity, unit_price
                FROM return_reception_items
                WHERE return_reception_id = $1`,
                [r.id]
            );

            return {
                id: r.id,
                clientId: r.client_id,
                creditNoteNumber: r.credit_note_number,
                items: itemsResult.rows,
                totalValue: r.total_value,
                receivedBy: r.received_by,
                createdAt: r.created_at
            };
        }));

        return PaginationService.buildPaginatedResponse(mappedReturns, validPage, validLimit, total, filters);
    } catch (error) {
        logger.error('❌ Error getting returns with pagination:', error);
        throw error;
    }
};

/**
 * Create a new return reception with items (transactional)
 * @async
 * @param {Object} returnData - Return reception data
 * @param {Array} items - Return reception items
 * @returns {Promise<Object>} Created return reception
 */
const createReturnReception = async (returnData, items) => {
    try {
        return await transaction(async (client) => {
            // Insert return reception
            const returnResult = await client.query(
                `INSERT INTO return_receptions (id, client_id, credit_note_number, total_value, received_by, created_at)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [
                    returnData.id,
                    returnData.clientId,
                    returnData.creditNoteNumber,
                    returnData.totalValue,
                    returnData.receivedBy,
                    new Date()
                ]
            );

            // Insert items
            for (const item of items) {
                await client.query(
                    `INSERT INTO return_reception_items (return_reception_id, reference, quantity, unit_price)
                    VALUES ($1, $2, $3, $4)`,
                    [returnData.id, item.reference, item.quantity, item.unitPrice]
                );
            }

            return returnResult.rows[0];
        });
    } catch (error) {
        logger.error('❌ Error creating return reception:', error);
        throw error;
    }
};

/**
 * Get return reception by ID
 * @async
 * @param {string} id - Return reception ID
 * @returns {Promise<Object>} Return reception with items
 */
const getReturnReceptionById = async (id) => {
    try {
        const result = await query(
            `SELECT * FROM return_receptions WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const returnReception = result.rows[0];
        const itemsResult = await query(
            `SELECT reference, quantity, unit_price FROM return_reception_items WHERE return_reception_id = $1`,
            [id]
        );

        return {
            ...returnReception,
            items: itemsResult.rows
        };
    } catch (error) {
        logger.error('❌ Error getting return reception:', error);
        throw error;
    }
};

/**
 * Update return reception
 * @async
 * @param {string} id - Return reception ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} Updated return reception
 */
const updateReturnReception = async (id, data) => {
    try {
        const result = await query(
            `UPDATE return_receptions 
            SET credit_note_number = $1, total_value = $2, received_by = $3
            WHERE id = $4
            RETURNING *`,
            [data.creditNoteNumber, data.totalValue, data.receivedBy, id]
        );

        return result.rows[0];
    } catch (error) {
        logger.error('❌ Error updating return reception:', error);
        throw error;
    }
};

/**
 * Delete return reception
 * @async
 * @param {string} id - Return reception ID
 * @returns {Promise<boolean>} Success status
 */
const deleteReturnReception = async (id) => {
    try {
        return await transaction(async (client) => {
            // Primero eliminar los items asociados
            await client.query(
                `DELETE FROM return_reception_items WHERE return_reception_id = $1`,
                [id]
            );

            // Luego eliminar la devolución
            const result = await client.query(
                `DELETE FROM return_receptions WHERE id = $1`,
                [id]
            );

            return result.rowCount > 0;
        });
    } catch (error) {
        logger.error('❌ Error deleting return reception:', error);
        throw error;
    }
};

module.exports = {
    getAllWithPagination,
    createReturnReception,
    getReturnReceptionById,
    updateReturnReception,
    deleteReturnReception
};
