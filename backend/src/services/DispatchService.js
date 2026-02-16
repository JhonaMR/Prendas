/**
 * 📦 DISPATCH SERVICE
 * 
 * Handles dispatch operations with pagination support
 */

const { getDatabase } = require('../config/database');
const PaginationService = require('./PaginationService');

/**
 * Get all dispatches with pagination
 */
const getAllWithPagination = (page = 1, limit = 20, filters = {}) => {
    try {
        const db = getDatabase();
        const { page: validPage, limit: validLimit } = PaginationService.validateParams(page, limit);

        // Build WHERE clause from filters
        let whereClause = 'WHERE 1=1';
        const params = [];

        if (filters.clientId) {
            whereClause += ' AND client_id = ?';
            params.push(filters.clientId);
        }

        if (filters.referenceId) {
            whereClause += ' AND id IN (SELECT dispatch_id FROM dispatch_items WHERE reference = ?)';
            params.push(filters.referenceId);
        }

        if (filters.startDate) {
            whereClause += ' AND created_at >= ?';
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            whereClause += ' AND created_at <= ?';
            params.push(filters.endDate);
        }

        // Get total count
        const countStmt = db.prepare(`SELECT COUNT(*) as count FROM dispatches ${whereClause}`);
        const countResult = countStmt.get(...params);
        const total = countResult.count;

        // Get paginated data
        const offset = PaginationService.calculateOffset(validPage, validLimit);
        const dataStmt = db.prepare(`
            SELECT * FROM dispatches 
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `);
        
        const dispatches = dataStmt.all(...params, validLimit, offset);

        const mappedDispatches = dispatches.map(d => {
            const items = db.prepare(`
                SELECT reference, size, quantity
                FROM dispatch_items
                WHERE dispatch_id = ?
            `).all(d.id);

            return {
                id: d.id,
                clientId: d.client_id,
                invoiceNo: d.invoice_no,
                remissionNo: d.remission_no,
                items,
                dispatchedBy: d.dispatched_by,
                createdAt: d.created_at
            };
        });

        return PaginationService.buildPaginatedResponse(mappedDispatches, validPage, validLimit, total, filters);
    } catch (error) {
        console.error('❌ Error getting dispatches with pagination:', error);
        throw error;
    }
};

module.exports = {
    getAllWithPagination
};
