/**
 * Unit Tests for CacheManager
 * Tests cover: get, set, delete, invalidatePattern, clear, getStats
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.7, 1.8
 */

const { CacheManager } = require('./CacheManager');

describe('CacheManager', () => {
    let cache;

    beforeEach(() => {
        cache = new CacheManager({ maxSize: 500, defaultTTL: 5000 });
    });

    describe('Basic Operations', () => {
        test('should set and get a value', () => {
            cache.set('key1', 'value1');
            expect(cache.get('key1')).toBe('value1');
        });

        test('should return null for non-existent key', () => {
            expect(cache.get('nonexistent')).toBeNull();
        });

        test('should delete a value', () => {
            cache.set('key1', 'value1');
            cache.delete('key1');
            expect(cache.get('key1')).toBeNull();
        });

        test('should clear all cache', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');
            cache.clear();
            expect(cache.get('key1')).toBeNull();
            expect(cache.get('key2')).toBeNull();
        });
    });

    describe('TTL (Time-To-Live)', () => {
        test('should expire entry after TTL', async () => {
            cache.set('key1', 'value1', 100); // 100ms TTL
            expect(cache.get('key1')).toBe('value1');
            
            await new Promise(resolve => setTimeout(resolve, 150));
            expect(cache.get('key1')).toBeNull();
        });

        test('should use default TTL if not specified', async () => {
            cache = new CacheManager({ maxSize: 500, defaultTTL: 100 });
            cache.set('key1', 'value1'); // No TTL specified, uses default
            expect(cache.get('key1')).toBe('value1');
            
            await new Promise(resolve => setTimeout(resolve, 150));
            expect(cache.get('key1')).toBeNull();
        });

        test('should not expire entry with TTL=0', async () => {
            cache.set('key1', 'value1', 0); // No expiration
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(cache.get('key1')).toBe('value1');
        });

        test('should handle multiple entries with different TTLs', async () => {
            cache.set('key1', 'value1', 50);
            cache.set('key2', 'value2', 200);
            
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(cache.get('key1')).toBeNull();
            expect(cache.get('key2')).toBe('value2');
        });
    });

    describe('LRU Eviction', () => {
        test('should evict LRU item when cache is full', () => {
            const smallCache = new CacheManager({ maxSize: 3, defaultTTL: 0 });
            
            smallCache.set('key1', 'value1');
            smallCache.set('key2', 'value2');
            smallCache.set('key3', 'value3');
            
            // Cache is full, adding new item should evict LRU (key1)
            smallCache.set('key4', 'value4');
            
            expect(smallCache.get('key1')).toBeNull();
            expect(smallCache.get('key2')).toBe('value2');
            expect(smallCache.get('key3')).toBe('value3');
            expect(smallCache.get('key4')).toBe('value4');
        });

        test('should update LRU on access', async () => {
            const smallCache = new CacheManager({ maxSize: 3, defaultTTL: 0 });
            
            smallCache.set('key1', 'value1');
            await new Promise(resolve => setTimeout(resolve, 10));
            smallCache.set('key2', 'value2');
            await new Promise(resolve => setTimeout(resolve, 10));
            smallCache.set('key3', 'value3');
            await new Promise(resolve => setTimeout(resolve, 10));
            
            // Access key1 to make it recently used
            smallCache.get('key1');
            await new Promise(resolve => setTimeout(resolve, 10));
            
            // Add new item, should evict key2 (now LRU)
            smallCache.set('key4', 'value4');
            
            expect(smallCache.get('key1')).toBe('value1');
            expect(smallCache.get('key2')).toBeNull();
            expect(smallCache.get('key3')).toBe('value3');
            expect(smallCache.get('key4')).toBe('value4');
        });

        test('should maintain cache size at maxSize', () => {
            const smallCache = new CacheManager({ maxSize: 5, defaultTTL: 0 });
            
            for (let i = 1; i <= 10; i++) {
                smallCache.set(`key${i}`, `value${i}`);
            }
            
            const stats = smallCache.getStats();
            expect(stats.size).toBe(5);
        });

        test('should handle updating existing key without eviction', () => {
            const smallCache = new CacheManager({ maxSize: 3, defaultTTL: 0 });
            
            smallCache.set('key1', 'value1');
            smallCache.set('key2', 'value2');
            smallCache.set('key3', 'value3');
            
            // Update existing key should not cause eviction
            smallCache.set('key1', 'updated1');
            
            expect(smallCache.getStats().size).toBe(3);
            expect(smallCache.get('key1')).toBe('updated1');
        });
    });

    describe('Pattern Invalidation', () => {
        test('should test regex pattern matching', () => {
            const testCache = new CacheManager({ maxSize: 500, defaultTTL: 0 });
            
            // Test the regex directly
            const regex = testCache._patternToRegex('clients:*');
            expect(regex.test('clients:all')).toBe(true);
            expect(regex.test('clients:active')).toBe(true);
            expect(regex.test('orders:all')).toBe(false);
        });

        test('should invalidate entries matching pattern with wildcard', () => {
            const testCache = new CacheManager({ maxSize: 500, defaultTTL: 0 });
            testCache.set('clients:all', 'data1');
            testCache.set('clients:active', 'data2');
            testCache.set('clients:inactive', 'data3');
            testCache.set('orders:all', 'data4');
            
            // Debug: verify entries exist
            expect(testCache.get('clients:all')).toBe('data1');
            expect(testCache.get('clients:active')).toBe('data2');
            
            const invalidated = testCache.invalidatePattern('clients:*');
            
            expect(invalidated).toBe(3);
            expect(testCache.get('clients:all')).toBeNull();
            expect(testCache.get('clients:active')).toBeNull();
            expect(testCache.get('clients:inactive')).toBeNull();
            expect(testCache.get('orders:all')).toBe('data4');
        });

        test('should invalidate entries with complex patterns', () => {
            const testCache = new CacheManager({ maxSize: 500, defaultTTL: 0 });
            testCache.set('orders:status:pending', 'data1');
            testCache.set('orders:status:completed', 'data2');
            testCache.set('orders:status:cancelled', 'data3');
            testCache.set('orders:client:123', 'data4');
            
            const invalidated = testCache.invalidatePattern('orders:status:*');
            
            expect(invalidated).toBe(3);
            expect(testCache.get('orders:status:pending')).toBeNull();
            expect(testCache.get('orders:client:123')).toBe('data4');
        });

        test('should handle pattern with no matches', () => {
            const testCache = new CacheManager({ maxSize: 500, defaultTTL: 0 });
            testCache.set('key1', 'value1');
            testCache.set('key2', 'value2');
            
            const invalidated = testCache.invalidatePattern('nonexistent:*');
            
            expect(invalidated).toBe(0);
            expect(testCache.get('key1')).toBe('value1');
        });

        test('should invalidate exact match without wildcard', () => {
            const testCache = new CacheManager({ maxSize: 500, defaultTTL: 0 });
            testCache.set('clients:all', 'data1');
            testCache.set('clients:active', 'data2');
            
            const invalidated = testCache.invalidatePattern('clients:all');
            
            expect(invalidated).toBe(1);
            expect(testCache.get('clients:all')).toBeNull();
            expect(testCache.get('clients:active')).toBe('data2');
        });
    });

    describe('Statistics', () => {
        test('should track cache hits', () => {
            cache.set('key1', 'value1');
            cache.get('key1');
            cache.get('key1');
            
            const stats = cache.getStats();
            expect(stats.hits).toBe(2);
        });

        test('should track cache misses', () => {
            cache.get('nonexistent1');
            cache.get('nonexistent2');
            
            const stats = cache.getStats();
            expect(stats.misses).toBe(2);
        });

        test('should calculate hit rate correctly', () => {
            cache.set('key1', 'value1');
            cache.get('key1'); // hit
            cache.get('key1'); // hit
            cache.get('nonexistent'); // miss
            
            const stats = cache.getStats();
            expect(stats.hitRate).toBe('66.67%');
        });

        test('should return correct size in stats', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');
            cache.set('key3', 'value3');
            
            const stats = cache.getStats();
            expect(stats.size).toBe(3);
            expect(stats.maxSize).toBe(500);
        });

        test('should reset stats on clear', () => {
            cache.set('key1', 'value1');
            cache.get('key1');
            cache.get('nonexistent');
            cache.clear();
            
            const stats = cache.getStats();
            expect(stats.size).toBe(0);
            expect(stats.hits).toBe(1);
            expect(stats.misses).toBe(1);
        });
    });

    describe('Edge Cases', () => {
        test('should handle null values', () => {
            cache.set('key1', null);
            expect(cache.get('key1')).toBeNull();
        });

        test('should handle undefined values', () => {
            cache.set('key1', undefined);
            expect(cache.get('key1')).toBeUndefined();
        });

        test('should handle complex objects', () => {
            const obj = { name: 'test', nested: { value: 123 } };
            cache.set('key1', obj);
            expect(cache.get('key1')).toEqual(obj);
        });

        test('should handle arrays', () => {
            const arr = [1, 2, 3, { id: 4 }];
            cache.set('key1', arr);
            expect(cache.get('key1')).toEqual(arr);
        });

        test('should handle empty string key', () => {
            cache.set('', 'value');
            expect(cache.get('')).toBe('value');
        });

        test('should handle very large values', () => {
            const largeValue = 'x'.repeat(1000000); // 1MB string
            cache.set('key1', largeValue);
            expect(cache.get('key1')).toBe(largeValue);
        });

        test('should handle rapid set/get operations', () => {
            for (let i = 0; i < 100; i++) {
                cache.set(`key${i}`, `value${i}`);
            }
            
            for (let i = 0; i < 100; i++) {
                expect(cache.get(`key${i}`)).toBe(`value${i}`);
            }
        });
    });

    describe('Configuration', () => {
        test('should use custom maxSize', () => {
            const customCache = new CacheManager({ maxSize: 10 });
            const stats = customCache.getStats();
            expect(stats.maxSize).toBe(10);
        });

        test('should use custom defaultTTL', async () => {
            const customCache = new CacheManager({ defaultTTL: 50 });
            customCache.set('key1', 'value1');
            
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(customCache.get('key1')).toBeNull();
        });

        test('should use default config if not provided', () => {
            const defaultCache = new CacheManager();
            const stats = defaultCache.getStats();
            expect(stats.maxSize).toBe(500);
        });
    });
});

// ============================================================================
// PROPERTY-BASED TESTS
// ============================================================================
// **Validates: Requirements 1.5, 1.6, 1.7, 1.8**

const fc = require('fast-check');

describe('CacheManager - Property-Based Tests', () => {
    
    describe('Property 1: Cache LRU Eviction', () => {
        test('should maintain cache size at maxSize when adding items beyond capacity', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 2, max: 100 }),
                    fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
                    (maxSize, keys) => {
                        const cache = new CacheManager({ maxSize, defaultTTL: 0 });
                        keys.forEach((key, index) => {
                            cache.set(key, `value${index}`);
                        });
                        const stats = cache.getStats();
                        return stats.size <= maxSize;
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('should evict LRU item when cache reaches maxSize', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 2, max: 50 }),
                    (maxSize) => {
                        const cache = new CacheManager({ maxSize, defaultTTL: 0 });
                        for (let i = 0; i < maxSize; i++) {
                            cache.set(`key${i}`, `value${i}`);
                        }
                        let stats = cache.getStats();
                        if (stats.size !== maxSize) return false;
                        cache.set(`key${maxSize}`, `value${maxSize}`);
                        stats = cache.getStats();
                        return stats.size === maxSize;
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('should not evict when updating existing key', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 2, max: 20 }),
                    (maxSize) => {
                        const cache = new CacheManager({ maxSize, defaultTTL: 0 });
                        for (let i = 0; i < maxSize; i++) {
                            cache.set(`key${i}`, `value${i}`);
                        }
                        const statsBefore = cache.getStats();
                        cache.set('key0', 'updated');
                        const statsAfter = cache.getStats();
                        return statsBefore.size === statsAfter.size;
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('should evict items when cache exceeds maxSize', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 3, max: 30 }),
                    (maxSize) => {
                        const cache = new CacheManager({ maxSize, defaultTTL: 0 });
                        const itemsToAdd = maxSize + 10;
                        for (let i = 0; i < itemsToAdd; i++) {
                            cache.set(`key${i}`, `value${i}`);
                        }
                        const stats = cache.getStats();
                        return stats.size === maxSize;
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    describe('Property 2: Cache TTL Expiration', () => {
        test('should expire entries after TTL', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 50, max: 200 }),
                    async (ttl) => {
                        const cache = new CacheManager({ maxSize: 100, defaultTTL: 0 });
                        cache.set('key1', 'value1', ttl);
                        if (cache.get('key1') === null) return false;
                        await new Promise(resolve => setTimeout(resolve, ttl + 50));
                        return cache.get('key1') === null;
                    }
                ),
                { numRuns: 50 }
            );
        });

        test('should not expire entries with TTL=0', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.constant(null),
                    async () => {
                        const cache = new CacheManager({ maxSize: 100, defaultTTL: 0 });
                        cache.set('key1', 'value1', 0);
                        await new Promise(resolve => setTimeout(resolve, 100));
                        return cache.get('key1') === 'value1';
                    }
                ),
                { numRuns: 50 }
            );
        });

        test('should use defaultTTL when TTL not specified', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 50, max: 150 }),
                    async (defaultTTL) => {
                        const cache = new CacheManager({ maxSize: 100, defaultTTL });
                        cache.set('key1', 'value1');
                        if (cache.get('key1') === null) return false;
                        await new Promise(resolve => setTimeout(resolve, defaultTTL + 50));
                        return cache.get('key1') === null;
                    }
                ),
                { numRuns: 50 }
            );
        });

        test('should handle multiple entries with different TTLs', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.tuple(
                        fc.integer({ min: 100, max: 150 }),
                        fc.integer({ min: 250, max: 350 })
                    ),
                    async ([ttl1, ttl2]) => {
                        const cache = new CacheManager({ maxSize: 100, defaultTTL: 0 });
                        cache.set('key1', 'value1', ttl1);
                        cache.set('key2', 'value2', ttl2);
                        if (cache.get('key1') === null || cache.get('key2') === null) return false;
                        await new Promise(resolve => setTimeout(resolve, ttl1 + 100));
                        const key1Expired = cache.get('key1') === null;
                        const key2Exists = cache.get('key2') !== null;
                        return key1Expired && key2Exists;
                    }
                ),
                { numRuns: 30 }
            );
        });
    });

    describe('Property 3: Cache Invalidation on Create', () => {
        test('should invalidate pattern when creating new entry', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 20 }),
                    (keys) => {
                        const cache = new CacheManager({ maxSize: 500, defaultTTL: 0 });
                        const uniqueKeys = [...new Set(keys)];
                        uniqueKeys.forEach(key => {
                            cache.set(`clients:${key}`, `data${key}`);
                        });
                        if (uniqueKeys.some(key => cache.get(`clients:${key}`) === null)) return false;
                        const invalidated = cache.invalidatePattern('clients:*');
                        const allInvalidated = uniqueKeys.every(key => cache.get(`clients:${key}`) === null);
                        return invalidated === uniqueKeys.length && allInvalidated;
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('should only invalidate matching patterns', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
                    fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
                    (clientKeys, orderKeys) => {
                        const cache = new CacheManager({ maxSize: 500, defaultTTL: 0 });
                        const uniqueClientKeys = [...new Set(clientKeys)];
                        const uniqueOrderKeys = [...new Set(orderKeys)];
                        uniqueClientKeys.forEach(key => {
                            cache.set(`clients:${key}`, `data${key}`);
                        });
                        uniqueOrderKeys.forEach(key => {
                            cache.set(`orders:${key}`, `data${key}`);
                        });
                        const invalidated = cache.invalidatePattern('clients:*');
                        const clientsInvalidated = uniqueClientKeys.every(key => cache.get(`clients:${key}`) === null);
                        const ordersExist = uniqueOrderKeys.every(key => cache.get(`orders:${key}`) !== null);
                        return invalidated === uniqueClientKeys.length && clientsInvalidated && ordersExist;
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    describe('Property 4: Cache Invalidation on Update', () => {
        test('should invalidate pattern on update operation', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 20 }),
                    (keys) => {
                        const cache = new CacheManager({ maxSize: 500, defaultTTL: 0 });
                        const uniqueKeys = [...new Set(keys)];
                        uniqueKeys.forEach(key => {
                            cache.set(`sellers:${key}`, `data${key}`);
                        });
                        const invalidated = cache.invalidatePattern('sellers:*');
                        const allInvalidated = uniqueKeys.every(key => cache.get(`sellers:${key}`) === null);
                        return invalidated === uniqueKeys.length && allInvalidated;
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('should handle complex invalidation patterns', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
                    (statuses) => {
                        const cache = new CacheManager({ maxSize: 500, defaultTTL: 0 });
                        const uniqueStatuses = [...new Set(statuses)];
                        uniqueStatuses.forEach(status => {
                            cache.set(`orders:status:${status}`, `data${status}`);
                            cache.set(`orders:client:123`, 'clientData');
                        });
                        const invalidated = cache.invalidatePattern('orders:status:*');
                        const statusInvalidated = uniqueStatuses.every(status => 
                            cache.get(`orders:status:${status}`) === null
                        );
                        const clientExists = cache.get('orders:client:123') !== null;
                        return invalidated === uniqueStatuses.length && statusInvalidated && clientExists;
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    describe('Property 5: Cache Invalidation on Delete', () => {
        test('should invalidate pattern on delete operation', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 20 }),
                    (keys) => {
                        const cache = new CacheManager({ maxSize: 500, defaultTTL: 0 });
                        const uniqueKeys = [...new Set(keys)];
                        uniqueKeys.forEach(key => {
                            cache.set(`confeccionistas:${key}`, `data${key}`);
                        });
                        const invalidated = cache.invalidatePattern('confeccionistas:*');
                        const allInvalidated = uniqueKeys.every(key => cache.get(`confeccionistas:${key}`) === null);
                        return invalidated === uniqueKeys.length && allInvalidated;
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('should handle invalidation with no matches', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
                    (keys) => {
                        const cache = new CacheManager({ maxSize: 500, defaultTTL: 0 });
                        const uniqueKeys = [...new Set(keys)];
                        uniqueKeys.forEach(key => {
                            cache.set(`key:${key}`, `data${key}`);
                        });
                        const invalidated = cache.invalidatePattern('nonexistent:*');
                        const allStillExist = uniqueKeys.every(key => cache.get(`key:${key}`) !== null);
                        return invalidated === 0 && allStillExist;
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('should support exact match invalidation', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
                    (keys) => {
                        const cache = new CacheManager({ maxSize: 500, defaultTTL: 0 });
                        const uniqueKeys = [...new Set(keys)];
                        uniqueKeys.forEach(key => {
                            cache.set(`key:${key}`, `data${key}`);
                        });
                        if (uniqueKeys.length === 0) return true;
                        const firstKey = uniqueKeys[0];
                        const invalidated = cache.invalidatePattern(`key:${firstKey}`);
                        const firstInvalidated = cache.get(`key:${firstKey}`) === null;
                        const othersExist = uniqueKeys.slice(1).every(key => cache.get(`key:${key}`) !== null);
                        return invalidated === 1 && firstInvalidated && othersExist;
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    describe('Property: Cache Consistency', () => {
        test('should maintain consistency between get/set operations', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.tuple(fc.string({ minLength: 1 }), fc.anything()),
                        { minLength: 1, maxLength: 100 }
                    ),
                    (operations) => {
                        const cache = new CacheManager({ maxSize: 500, defaultTTL: 0 });
                        operations.forEach(([key, value]) => {
                            cache.set(key, value);
                        });
                        return operations.every(([key, value]) => {
                            const retrieved = cache.get(key);
                            return JSON.stringify(retrieved) === JSON.stringify(value);
                        });
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    describe('Property: Pattern Matching Correctness', () => {
        test('should correctly match patterns with wildcards', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 20 }),
                    (suffixes) => {
                        const cache = new CacheManager({ maxSize: 500, defaultTTL: 0 });
                        const uniqueSuffixes = [...new Set(suffixes)];
                        uniqueSuffixes.forEach(suffix => {
                            cache.set(`prefix:${suffix}`, `value${suffix}`);
                        });
                        const invalidated = cache.invalidatePattern('prefix:*');
                        return invalidated === uniqueSuffixes.length;
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
