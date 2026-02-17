/**
 * 🔄 CACHE INVALIDATION SERVICE
 * 
 * Handles automatic cache invalidation based on entity operations
 * - Integrates with CacheManager to invalidate patterns
 * - Applies invalidation rules for CREATE, UPDATE, DELETE operations
 * - Provides logging and error handling
 */

const { getCacheManager } = require('./CacheManager');
const { getInvalidationPatterns } = require('./InvalidationRules');
const logger = require('../controllers/shared/logger');

/**
 * Invalidate cache for an entity operation
 * @param {string} entity - Entity name (e.g., 'Client', 'Order')
 * @param {string} trigger - Operation type ('CREATE', 'UPDATE', 'DELETE')
 * @returns {Object} Invalidation result with patterns and count
 */
function invalidateCache(entity, trigger) {
  try {
    const cacheManager = getCacheManager();
    const patterns = getInvalidationPatterns(entity, trigger);
    
    if (patterns.length === 0) {
      logger.debug(`No invalidation rules for ${entity} ${trigger}`);
      return { entity, trigger, patterns: [], invalidatedCount: 0 };
    }

    let totalInvalidated = 0;
    const invalidatedPatterns = [];

    // Invalidate each pattern
    for (const pattern of patterns) {
      const count = cacheManager.invalidatePattern(pattern);
      totalInvalidated += count;
      if (count > 0) {
        invalidatedPatterns.push({ pattern, count });
      }
    }

    logger.debug(`Cache invalidation for ${entity} ${trigger}`, {
      patterns: invalidatedPatterns,
      totalInvalidated
    });

    return {
      entity,
      trigger,
      patterns: invalidatedPatterns,
      invalidatedCount: totalInvalidated
    };
  } catch (error) {
    logger.error(`Error invalidating cache for ${entity} ${trigger}`, error);
    // Don't throw - cache invalidation failure shouldn't break the operation
    return {
      entity,
      trigger,
      patterns: [],
      invalidatedCount: 0,
      error: error.message
    };
  }
}

/**
 * Invalidate cache for entity creation
 * @param {string} entity - Entity name
 * @returns {Object} Invalidation result
 */
function invalidateOnCreate(entity) {
  return invalidateCache(entity, 'CREATE');
}

/**
 * Invalidate cache for entity update
 * @param {string} entity - Entity name
 * @returns {Object} Invalidation result
 */
function invalidateOnUpdate(entity) {
  return invalidateCache(entity, 'UPDATE');
}

/**
 * Invalidate cache for entity deletion
 * @param {string} entity - Entity name
 * @returns {Object} Invalidation result
 */
function invalidateOnDelete(entity) {
  return invalidateCache(entity, 'DELETE');
}

/**
 * Invalidate cache for multiple entities
 * @param {Array} operations - Array of { entity, trigger } objects
 * @returns {Array} Array of invalidation results
 */
function invalidateMultiple(operations) {
  return operations.map(op => invalidateCache(op.entity, op.trigger));
}

module.exports = {
  invalidateCache,
  invalidateOnCreate,
  invalidateOnUpdate,
  invalidateOnDelete,
  invalidateMultiple
};
