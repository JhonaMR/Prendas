/**
 * 📄 PAGINATION SERVICE
 * 
 * Handles pagination logic for all data retrieval.
 * Provides utilities for calculating offsets, total pages, and building paginated responses.
 */

class PaginationService {
    /**
     * Calculate offset for LIMIT/OFFSET query
     * @param {number} page - 1-indexed page number
     * @param {number} limit - Records per page
     * @returns {number} Offset value
     */
    static calculateOffset(page, limit) {
        if (page < 1) page = 1;
        if (limit < 1) limit = 20;
        if (limit > 100) limit = 100;
        return (page - 1) * limit;
    }

    /**
     * Calculate total pages
     * @param {number} total - Total records
     * @param {number} limit - Records per page
     * @returns {number} Total pages
     */
    static calculateTotalPages(total, limit) {
        if (limit < 1) limit = 20;
        if (limit > 100) limit = 100;
        return Math.ceil(total / limit);
    }

    /**
     * Build paginated response
     * @param {Array} data - Array of records
     * @param {number} page - Current page (1-indexed)
     * @param {number} limit - Records per page
     * @param {number} total - Total records
     * @param {Object} filters - Applied filters (optional)
     * @returns {Object} Paginated response
     */
    static buildPaginatedResponse(data, page, limit, total, filters = null) {
        // Validate inputs
        if (page < 1) page = 1;
        if (limit < 1) limit = 20;
        if (limit > 100) limit = 100;
        if (total < 0) total = 0;

        const totalPages = this.calculateTotalPages(total, limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        const response = {
            data: data || [],
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage,
                hasPreviousPage
            }
        };

        if (filters) {
            response.filters = filters;
        }

        return response;
    }

    /**
     * Validate pagination parameters
     * @param {number} page - Page number
     * @param {number} limit - Records per page
     * @returns {Object} Validated parameters
     */
    static validateParams(page, limit) {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 20;

        if (page < 1) page = 1;
        if (limit < 1) limit = 20;
        if (limit > 100) limit = 100;

        return { page, limit };
    }

    /**
     * Apply pagination to query results
     * @param {Array} allResults - All results from query
     * @param {number} page - Current page
     * @param {number} limit - Records per page
     * @returns {Array} Paginated results
     */
    static paginateResults(allResults, page, limit) {
        const { page: validPage, limit: validLimit } = this.validateParams(page, limit);
        const offset = this.calculateOffset(validPage, validLimit);
        return allResults.slice(offset, offset + validLimit);
    }
}

module.exports = PaginationService;
