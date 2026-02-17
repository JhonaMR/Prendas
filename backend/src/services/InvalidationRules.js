/**
 * 🔄 INVALIDATION RULES
 * 
 * Defines cache invalidation patterns for each entity
 * - Specifies which cache keys should be invalidated on CREATE, UPDATE, DELETE
 * - Supports pattern-based invalidation with wildcards
 * - Automatically triggered by service operations
 */

/**
 * Invalidation rules for each entity
 * Format: { trigger: 'CREATE'|'UPDATE'|'DELETE', entity: string, patterns: string[] }
 */
const invalidationRules = [
  // ============ CLIENTS ============
  {
    trigger: 'CREATE',
    entity: 'Client',
    patterns: [
      'clients:*',
      'clients:list:*',
      'masters:*',
      'masters:clients:*'
    ]
  },
  {
    trigger: 'UPDATE',
    entity: 'Client',
    patterns: [
      'clients:*',
      'clients:list:*',
      'clients:id:*',
      'masters:*',
      'masters:clients:*'
    ]
  },
  {
    trigger: 'DELETE',
    entity: 'Client',
    patterns: [
      'clients:*',
      'clients:list:*',
      'clients:id:*',
      'masters:*',
      'masters:clients:*'
    ]
  },

  // ============ SELLERS ============
  {
    trigger: 'CREATE',
    entity: 'Seller',
    patterns: [
      'sellers:*',
      'sellers:list:*',
      'masters:*',
      'masters:sellers:*'
    ]
  },
  {
    trigger: 'UPDATE',
    entity: 'Seller',
    patterns: [
      'sellers:*',
      'sellers:list:*',
      'sellers:id:*',
      'masters:*',
      'masters:sellers:*'
    ]
  },
  {
    trigger: 'DELETE',
    entity: 'Seller',
    patterns: [
      'sellers:*',
      'sellers:list:*',
      'sellers:id:*',
      'masters:*',
      'masters:sellers:*'
    ]
  },

  // ============ CONFECCIONISTAS ============
  {
    trigger: 'CREATE',
    entity: 'Confeccionista',
    patterns: [
      'confeccionistas:*',
      'confeccionistas:list:*',
      'masters:*',
      'masters:confeccionistas:*'
    ]
  },
  {
    trigger: 'UPDATE',
    entity: 'Confeccionista',
    patterns: [
      'confeccionistas:*',
      'confeccionistas:list:*',
      'confeccionistas:id:*',
      'masters:*',
      'masters:confeccionistas:*'
    ]
  },
  {
    trigger: 'DELETE',
    entity: 'Confeccionista',
    patterns: [
      'confeccionistas:*',
      'confeccionistas:list:*',
      'confeccionistas:id:*',
      'masters:*',
      'masters:confeccionistas:*'
    ]
  },

  // ============ REFERENCES ============
  {
    trigger: 'CREATE',
    entity: 'Reference',
    patterns: [
      'references:*',
      'references:list:*',
      'masters:*',
      'masters:references:*'
    ]
  },
  {
    trigger: 'UPDATE',
    entity: 'Reference',
    patterns: [
      'references:*',
      'references:list:*',
      'references:id:*',
      'masters:*',
      'masters:references:*'
    ]
  },
  {
    trigger: 'DELETE',
    entity: 'Reference',
    patterns: [
      'references:*',
      'references:list:*',
      'references:id:*',
      'masters:*',
      'masters:references:*'
    ]
  },

  // ============ DELIVERY DATES ============
  {
    trigger: 'CREATE',
    entity: 'DeliveryDate',
    patterns: [
      'deliveryDates:*',
      'deliveryDates:list:*',
      'masters:*',
      'masters:deliveryDates:*'
    ]
  },
  {
    trigger: 'UPDATE',
    entity: 'DeliveryDate',
    patterns: [
      'deliveryDates:*',
      'deliveryDates:list:*',
      'deliveryDates:id:*',
      'masters:*',
      'masters:deliveryDates:*'
    ]
  },
  {
    trigger: 'DELETE',
    entity: 'DeliveryDate',
    patterns: [
      'deliveryDates:*',
      'deliveryDates:list:*',
      'deliveryDates:id:*',
      'masters:*',
      'masters:deliveryDates:*'
    ]
  },

  // ============ ORDERS ============
  {
    trigger: 'CREATE',
    entity: 'Order',
    patterns: [
      'orders:*',
      'orders:list:*',
      'orders:status:*'
    ]
  },
  {
    trigger: 'UPDATE',
    entity: 'Order',
    patterns: [
      'orders:*',
      'orders:list:*',
      'orders:id:*',
      'orders:status:*'
    ]
  },
  {
    trigger: 'DELETE',
    entity: 'Order',
    patterns: [
      'orders:*',
      'orders:list:*',
      'orders:id:*',
      'orders:status:*'
    ]
  },

  // ============ CORRERIAS ============
  {
    trigger: 'CREATE',
    entity: 'Correria',
    patterns: [
      'correrias:*',
      'correrias:list:*',
      'masters:*',
      'masters:correrias:*'
    ]
  },
  {
    trigger: 'UPDATE',
    entity: 'Correria',
    patterns: [
      'correrias:*',
      'correrias:list:*',
      'correrias:id:*',
      'masters:*',
      'masters:correrias:*'
    ]
  },
  {
    trigger: 'DELETE',
    entity: 'Correria',
    patterns: [
      'correrias:*',
      'correrias:list:*',
      'correrias:id:*',
      'masters:*',
      'masters:correrias:*'
    ]
  }
];

/**
 * Get invalidation rules for a specific entity and trigger
 * @param {string} entity - Entity name (e.g., 'Client', 'Order')
 * @param {string} trigger - Trigger type ('CREATE', 'UPDATE', 'DELETE')
 * @returns {string[]} Array of cache patterns to invalidate
 */
function getInvalidationPatterns(entity, trigger) {
  const rule = invalidationRules.find(
    r => r.entity === entity && r.trigger === trigger
  );
  return rule ? rule.patterns : [];
}

/**
 * Get all invalidation rules
 * @returns {Array} All invalidation rules
 */
function getAllRules() {
  return invalidationRules;
}

/**
 * Get invalidation rules for a specific entity
 * @param {string} entity - Entity name
 * @returns {Array} Rules for the entity
 */
function getRulesForEntity(entity) {
  return invalidationRules.filter(r => r.entity === entity);
}

module.exports = {
  invalidationRules,
  getInvalidationPatterns,
  getAllRules,
  getRulesForEntity
};
