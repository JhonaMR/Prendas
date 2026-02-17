/**
 * Unit Tests for CacheInvalidationService
 * Tests cover: invalidation for CREATE, UPDATE, DELETE operations
 * Validates pattern-based cache invalidation for all entity types
 * 
 * **Validates: Requirements 1.5, 1.6**
 */

const { invalidateCache, invalidateOnCreate, invalidateOnUpdate, invalidateOnDelete } = require('./CacheInvalidationService');
const { getCacheManager } = require('./CacheManager');

describe('CacheInvalidationService', () => {
  let cacheManager;

  beforeEach(() => {
    // Get fresh cache manager instance
    cacheManager = getCacheManager();
    cacheManager.clear();
  });

  describe('invalidateOnCreate', () => {
    test('should invalidate client cache patterns on CREATE', () => {
      // Setup: Add some cache entries
      cacheManager.set('clients:list:1', { data: 'clients' });
      cacheManager.set('clients:id:123', { data: 'client' });
      cacheManager.set('masters:clients:all', { data: 'all' });
      cacheManager.set('other:data', { data: 'other' });

      // Verify cache has entries
      expect(cacheManager.get('clients:list:1')).not.toBeNull();
      expect(cacheManager.get('masters:clients:all')).not.toBeNull();

      // Execute: Invalidate on Client CREATE
      const result = invalidateOnCreate('Client');

      // Verify: Client patterns are invalidated
      expect(result.entity).toBe('Client');
      expect(result.trigger).toBe('CREATE');
      expect(result.invalidatedCount).toBeGreaterThan(0);
      expect(cacheManager.get('clients:list:1')).toBeNull();
      expect(cacheManager.get('masters:clients:all')).toBeNull();
      
      // Verify: Other data is not affected
      expect(cacheManager.get('other:data')).not.toBeNull();
    });

    test('should invalidate seller cache patterns on CREATE', () => {
      cacheManager.set('sellers:list:1', { data: 'sellers' });
      cacheManager.set('masters:sellers:all', { data: 'all' });

      const result = invalidateOnCreate('Seller');

      expect(result.entity).toBe('Seller');
      expect(result.invalidatedCount).toBeGreaterThan(0);
      expect(cacheManager.get('sellers:list:1')).toBeNull();
      expect(cacheManager.get('masters:sellers:all')).toBeNull();
    });

    test('should invalidate confeccionista cache patterns on CREATE', () => {
      cacheManager.set('confeccionistas:list:1', { data: 'confeccionistas' });
      cacheManager.set('masters:confeccionistas:all', { data: 'all' });

      const result = invalidateOnCreate('Confeccionista');

      expect(result.entity).toBe('Confeccionista');
      expect(result.invalidatedCount).toBeGreaterThan(0);
      expect(cacheManager.get('confeccionistas:list:1')).toBeNull();
    });

    test('should invalidate reference cache patterns on CREATE', () => {
      cacheManager.set('references:list:1', { data: 'references' });
      cacheManager.set('masters:references:all', { data: 'all' });

      const result = invalidateOnCreate('Reference');

      expect(result.entity).toBe('Reference');
      expect(result.invalidatedCount).toBeGreaterThan(0);
      expect(cacheManager.get('references:list:1')).toBeNull();
    });

    test('should invalidate order cache patterns on CREATE', () => {
      cacheManager.set('orders:list:1', { data: 'orders' });
      cacheManager.set('orders:status:pending', { data: 'pending' });

      const result = invalidateOnCreate('Order');

      expect(result.entity).toBe('Order');
      expect(result.invalidatedCount).toBeGreaterThan(0);
      expect(cacheManager.get('orders:list:1')).toBeNull();
      expect(cacheManager.get('orders:status:pending')).toBeNull();
    });
  });

  describe('invalidateOnUpdate', () => {
    test('should invalidate client cache patterns on UPDATE', () => {
      cacheManager.set('clients:list:1', { data: 'clients' });
      cacheManager.set('clients:id:123', { data: 'client' });
      cacheManager.set('masters:clients:all', { data: 'all' });

      const result = invalidateOnUpdate('Client');

      expect(result.entity).toBe('Client');
      expect(result.trigger).toBe('UPDATE');
      expect(result.invalidatedCount).toBeGreaterThan(0);
      expect(cacheManager.get('clients:list:1')).toBeNull();
      expect(cacheManager.get('clients:id:123')).toBeNull();
    });

    test('should invalidate order cache patterns on UPDATE', () => {
      cacheManager.set('orders:list:1', { data: 'orders' });
      cacheManager.set('orders:id:456', { data: 'order' });
      cacheManager.set('orders:status:pending', { data: 'pending' });

      const result = invalidateOnUpdate('Order');

      expect(result.entity).toBe('Order');
      expect(result.invalidatedCount).toBeGreaterThan(0);
      expect(cacheManager.get('orders:list:1')).toBeNull();
      expect(cacheManager.get('orders:id:456')).toBeNull();
      expect(cacheManager.get('orders:status:pending')).toBeNull();
    });

    test('should invalidate delivery date cache patterns on UPDATE', () => {
      cacheManager.set('deliveryDates:list:1', { data: 'dates' });
      cacheManager.set('deliveryDates:id:789', { data: 'date' });

      const result = invalidateOnUpdate('DeliveryDate');

      expect(result.entity).toBe('DeliveryDate');
      expect(result.invalidatedCount).toBeGreaterThan(0);
      expect(cacheManager.get('deliveryDates:list:1')).toBeNull();
      expect(cacheManager.get('deliveryDates:id:789')).toBeNull();
    });
  });

  describe('invalidateOnDelete', () => {
    test('should invalidate client cache patterns on DELETE', () => {
      cacheManager.set('clients:list:1', { data: 'clients' });
      cacheManager.set('clients:id:123', { data: 'client' });
      cacheManager.set('masters:clients:all', { data: 'all' });

      const result = invalidateOnDelete('Client');

      expect(result.entity).toBe('Client');
      expect(result.trigger).toBe('DELETE');
      expect(result.invalidatedCount).toBeGreaterThan(0);
      expect(cacheManager.get('clients:list:1')).toBeNull();
      expect(cacheManager.get('clients:id:123')).toBeNull();
    });

    test('should invalidate seller cache patterns on DELETE', () => {
      cacheManager.set('sellers:list:1', { data: 'sellers' });
      cacheManager.set('sellers:id:456', { data: 'seller' });

      const result = invalidateOnDelete('Seller');

      expect(result.entity).toBe('Seller');
      expect(result.invalidatedCount).toBeGreaterThan(0);
      expect(cacheManager.get('sellers:list:1')).toBeNull();
      expect(cacheManager.get('sellers:id:456')).toBeNull();
    });

    test('should invalidate reference cache patterns on DELETE', () => {
      cacheManager.set('references:list:1', { data: 'references' });
      cacheManager.set('references:id:789', { data: 'reference' });

      const result = invalidateOnDelete('Reference');

      expect(result.entity).toBe('Reference');
      expect(result.invalidatedCount).toBeGreaterThan(0);
      expect(cacheManager.get('references:list:1')).toBeNull();
      expect(cacheManager.get('references:id:789')).toBeNull();
    });

    test('should invalidate order cache patterns on DELETE', () => {
      cacheManager.set('orders:list:1', { data: 'orders' });
      cacheManager.set('orders:status:completed', { data: 'completed' });

      const result = invalidateOnDelete('Order');

      expect(result.entity).toBe('Order');
      expect(result.invalidatedCount).toBeGreaterThan(0);
      expect(cacheManager.get('orders:list:1')).toBeNull();
      expect(cacheManager.get('orders:status:completed')).toBeNull();
    });
  });

  describe('invalidateCache', () => {
    test('should handle unknown entity gracefully', () => {
      cacheManager.set('unknown:data', { data: 'unknown' });

      const result = invalidateCache('UnknownEntity', 'CREATE');

      expect(result.entity).toBe('UnknownEntity');
      expect(result.trigger).toBe('CREATE');
      expect(result.patterns).toEqual([]);
      expect(result.invalidatedCount).toBe(0);
      // Unknown entity should not affect cache
      expect(cacheManager.get('unknown:data')).not.toBeNull();
    });

    test('should return empty patterns for non-existent rules', () => {
      const result = invalidateCache('NonExistent', 'UNKNOWN_TRIGGER');

      expect(result.patterns).toEqual([]);
      expect(result.invalidatedCount).toBe(0);
    });
  });

  describe('Pattern matching', () => {
    test('should correctly match wildcard patterns', () => {
      // Setup: Add various cache entries
      cacheManager.set('clients:list:page1', { data: 'page1' });
      cacheManager.set('clients:list:page2', { data: 'page2' });
      cacheManager.set('clients:id:123', { data: 'client123' });
      cacheManager.set('clients:id:456', { data: 'client456' });
      cacheManager.set('masters:clients:all', { data: 'all' });
      cacheManager.set('sellers:list:page1', { data: 'sellers' });

      // Execute: Invalidate client patterns
      invalidateOnCreate('Client');

      // Verify: All client patterns are invalidated
      expect(cacheManager.get('clients:list:page1')).toBeNull();
      expect(cacheManager.get('clients:list:page2')).toBeNull();
      expect(cacheManager.get('clients:id:123')).toBeNull();
      expect(cacheManager.get('clients:id:456')).toBeNull();
      expect(cacheManager.get('masters:clients:all')).toBeNull();
      
      // Verify: Other patterns are not affected
      expect(cacheManager.get('sellers:list:page1')).not.toBeNull();
    });

    test('should handle multiple pattern invalidation', () => {
      // Setup: Add entries matching multiple patterns
      cacheManager.set('orders:list:1', { data: 'list' });
      cacheManager.set('orders:status:pending', { data: 'pending' });
      cacheManager.set('orders:status:completed', { data: 'completed' });
      cacheManager.set('orders:id:999', { data: 'order' });

      // Execute: Invalidate order patterns
      const result = invalidateOnUpdate('Order');

      // Verify: Multiple patterns are invalidated
      expect(result.patterns.length).toBeGreaterThan(0);
      expect(cacheManager.get('orders:list:1')).toBeNull();
      expect(cacheManager.get('orders:status:pending')).toBeNull();
      expect(cacheManager.get('orders:status:completed')).toBeNull();
      expect(cacheManager.get('orders:id:999')).toBeNull();
    });
  });

  describe('Edge cases', () => {
    test('should handle empty cache gracefully', () => {
      cacheManager.clear();

      const result = invalidateOnCreate('Client');

      expect(result.entity).toBe('Client');
      expect(result.invalidatedCount).toBe(0);
      expect(result.patterns).toEqual([]);
    });

    test('should handle multiple invalidations in sequence', () => {
      cacheManager.set('clients:list:1', { data: 'clients' });
      cacheManager.set('sellers:list:1', { data: 'sellers' });

      // First invalidation
      invalidateOnCreate('Client');
      expect(cacheManager.get('clients:list:1')).toBeNull();
      expect(cacheManager.get('sellers:list:1')).not.toBeNull();

      // Second invalidation
      invalidateOnCreate('Seller');
      expect(cacheManager.get('sellers:list:1')).toBeNull();
    });

    test('should handle all entity types', () => {
      const entities = ['Client', 'Seller', 'Confeccionista', 'Reference', 'DeliveryDate', 'Order', 'Correria'];
      const triggers = ['CREATE', 'UPDATE', 'DELETE'];

      for (const entity of entities) {
        for (const trigger of triggers) {
          const result = invalidateCache(entity, trigger);
          expect(result.entity).toBe(entity);
          expect(result.trigger).toBe(trigger);
          expect(Array.isArray(result.patterns)).toBe(true);
        }
      }
    });
  });
});
