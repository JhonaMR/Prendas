/**
 * 📦 RETURN SERVICE
 * 
 * Handles return reception operations with pagination support
 */

const { getDatabase } = require('../config/database');
const PaginationService = require('./PaginationService');

/**
 * Get all return receptions with pagination
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

        if (filters.startDate) {
            whereClause += ' AND created_at >= ?';
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            whereClause += ' AND created_at <= ?';
            params.push(filters.endDate);
        }

        // Get total count
        const countStmt = db.prepare(`SELECT COUNT(*) as count FROM return_receptions ${whereClause}`);
        const countResult = countStmt.get(...params);
        const total = countResult.count;

        // Get paginated data
        const offset = PaginationService.calculateOffset(validPage, validLimit);
        const dataStmt = db.prepare(`
            SELECT * FROM return_receptions 
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `);
        
        const returns = dataStmt.all(...params, validLimit, offset);

        const mappedReturns = returns.map(r => {
            const items = db.prepare(`
                SELECT reference, size, quantity, unit_price
                FROM return_reception_items
                WHERE return_reception_id = ?
            `).all(r.id);

            return {
                id: r.id,
                clientId: r.client_id,
                creditNoteNumber: r.credit_note_number,
                items,
                totalValue: r.total_value,
                receivedBy: r.received_by,
                createdAt: r.created_at
            };
        });

        return PaginationService.buildPaginatedResponse(mappedReturns, validPage, validLimit, total, filters);
    } catch (error) {
        console.error('❌ Error getting returns with pagination:', error);
        throw error;
    }
};

module.exports = {
    getAllWithPagination
};
