/**
 * 📦 RECEPTION SERVICE
 * 
 * Handles reception operations with pagination support
 */

const { getDatabase } = require('../config/database');
const PaginationService = require('./PaginationService');

/**
 * Get all receptions with pagination
 */
const getAllWithPagination = (page = 1, limit = 20, filters = {}) => {
    try {
        const db = getDatabase();
        const { page: validPage, limit: validLimit } = PaginationService.validateParams(page, limit);

        // Build WHERE clause from filters
        let whereClause = 'WHERE 1=1';
        const params = [];

        if (filters.confeccionistaId) {
            whereClause += ' AND confeccionista = ?';
            params.push(filters.confeccionistaId);
        }

        if (filters.referenceId) {
            whereClause += ' AND id IN (SELECT reception_id FROM reception_items WHERE reference = ?)';
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
        const countStmt = db.prepare(`SELECT COUNT(*) as count FROM receptions ${whereClause}`);
        const countResult = countStmt.get(...params);
        const total = countResult.count;

        // Get paginated data
        const offset = PaginationService.calculateOffset(validPage, validLimit);
        const dataStmt = db.prepare(`
            SELECT * FROM receptions 
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `);
        
        const receptions = dataStmt.all(...params, validLimit, offset);

        const mappedReceptions = receptions.map(r => {
            const items = db.prepare(`
                SELECT reference, size, quantity
                FROM reception_items
                WHERE reception_id = ?
            `).all(r.id);

            return {
                id: r.id,
                batchCode: r.batch_code,
                confeccionista: r.confeccionista,
                hasSeconds: r.has_seconds === 1 ? true : r.has_seconds === 0 ? false : null,
                chargeType: r.charge_type,
                chargeUnits: r.charge_units,
                items,
                receivedBy: r.received_by,
                createdAt: r.created_at
            };
        });

        return PaginationService.buildPaginatedResponse(mappedReceptions, validPage, validLimit, total, filters);
    } catch (error) {
        console.error('❌ Error getting receptions with pagination:', error);
        throw error;
    }
};

module.exports = {
    getAllWithPagination
};
