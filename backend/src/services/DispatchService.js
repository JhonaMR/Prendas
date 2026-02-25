/**
 * 📦 DISPATCH SERVICE - POSTGRESQL
 * 
 * Handles dispatch operations with pagination support
 * Implements transactions for data consistency
 */

const { query, transaction, generateId, generateNumericId } = require('../config/database');
const PaginationService = require('./PaginationService');
const logger = require('../utils/logger');

/**
 * Get all dispatches with pagination
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

        if (filters.referenceId) {
            whereClause += ` AND id IN (SELECT dispatch_id FROM dispatch_items WHERE reference = $${paramIndex++})`;
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
        const countResult = await query(`SELECT COUNT(*) as count FROM dispatches ${whereClause}`, params);
        const total = parseInt(countResult.rows[0].count);

        // Get paginated data
        const offset = PaginationService.calculateOffset(validPage, validLimit);
        const dataResult = await query(
            `SELECT * FROM dispatches 
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            [...params, validLimit, offset]
        );
        
        const dispatches = dataResult.rows;

        // Get items for each dispatch
        const mappedDispatches = await Promise.all(dispatches.map(async (d) => {
            const itemsResult = await query(
                `SELECT reference, quantity, sale_price
                FROM dispatch_items
                WHERE dispatch_id = $1`,
                [d.id]
            );

            return {
                id: d.id,
                clientId: d.client_id,
                correriaId: d.correria_id,
                invoiceNo: d.invoice_no,
                remissionNo: d.remission_no,
                items: itemsResult.rows.map(item => ({
                  reference: item.reference,
                  quantity: item.quantity,
                  salePrice: item.sale_price
                })),
                dispatchedBy: d.dispatched_by,
                createdAt: d.created_at
            };
        }));

        return PaginationService.buildPaginatedResponse(mappedDispatches, validPage, validLimit, total, filters);
    } catch (error) {
        logger.error('❌ Error getting dispatches with pagination:', error);
        throw error;
    }
};

/**
 * Create a new dispatch with items (transactional)
 * @async
 * @param {Object} dispatchData - Dispatch data
 * @param {Array} items - Dispatch items
 * @returns {Promise<Object>} Created dispatch
 */
const createDispatch = async (dispatchData, items) => {
    try {
        return await transaction(async (client) => {
            // Insert dispatch
            const dispatchResult = await client.query(
                `INSERT INTO dispatches (id, client_id, correria_id, invoice_no, remission_no, dispatched_by, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`,
                [
                    dispatchData.id,
                    dispatchData.clientId,
                    dispatchData.correriaId,
                    dispatchData.invoiceNo,
                    dispatchData.remissionNo,
                    dispatchData.dispatchedBy,
                    new Date().toISOString()
                ]
            );

            // Insert items
            for (const item of items) {
                await client.query(
                    `INSERT INTO dispatch_items (dispatch_id, reference, quantity, sale_price)
                    VALUES ($1, $2, $3, $4)`,
                    [dispatchData.id, item.reference, item.quantity, item.salePrice || 0]
                );
            }

            return dispatchResult.rows[0];
        });
    } catch (error) {
        logger.error('❌ Error creating dispatch:', error);
        throw error;
    }
};

/**
 * Get dispatch by ID
 * @async
 * @param {string} id - Dispatch ID
 * @returns {Promise<Object>} Dispatch with items
 */
const getDispatchById = async (id) => {
    try {
        const result = await query(
            `SELECT * FROM dispatches WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const dispatch = result.rows[0];
        const itemsResult = await query(
            `SELECT reference, quantity, sale_price FROM dispatch_items WHERE dispatch_id = $1`,
            [id]
        );

        return {
            ...dispatch,
            clientId: dispatch.client_id,
            correriaId: dispatch.correria_id,
            items: itemsResult.rows.map(item => ({
              reference: item.reference,
              quantity: item.quantity,
              salePrice: item.sale_price
            }))
        };
    } catch (error) {
        logger.error('❌ Error getting dispatch:', error);
        throw error;
    }
};

/**
 * Update dispatch
 * @async
 * @param {string} id - Dispatch ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} Updated dispatch
 */
const updateDispatch = async (id, data) => {
    try {
        const result = await query(
            `UPDATE dispatches 
            SET invoice_no = $1, remission_no = $2, dispatched_by = $3
            WHERE id = $4
            RETURNING *`,
            [data.invoiceNo, data.remissionNo, data.dispatchedBy, id]
        );

        return result.rows[0];
    } catch (error) {
        logger.error('❌ Error updating dispatch:', error);
        throw error;
    }
};

/**
 * Delete dispatch
 * @async
 * @param {string} id - Dispatch ID
 * @returns {Promise<boolean>} Success status
 */
const deleteDispatch = async (id) => {
    try {
        return await transaction(async (client) => {
            // Primero eliminar los items asociados
            await client.query(
                `DELETE FROM dispatch_items WHERE dispatch_id = $1`,
                [id]
            );

            // Luego eliminar el despacho
            const result = await client.query(
                `DELETE FROM dispatches WHERE id = $1`,
                [id]
            );

            return result.rowCount > 0;
        });
    } catch (error) {
        logger.error('❌ Error deleting dispatch:', error);
        throw error;
    }
};

module.exports = {
    getAllWithPagination,
    createDispatch,
    getDispatchById,
    updateDispatch,
    deleteDispatch
};
