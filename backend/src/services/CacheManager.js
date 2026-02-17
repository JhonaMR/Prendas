/**
 * 💾 CACHE MANAGER
 * 
 * Manages in-memory cache with LRU eviction strategy and TTL support
 * - LRU (Least Recently Used) eviction when cache reaches 500 items
 * - TTL (Time-To-Live) support for automatic expiration
 * - Pattern-based invalidation for related cache entries
 * - Statistics tracking (hits, misses, size)
 */

class CacheManager {
    constructor(config = {}) {
        this.maxSize = config.maxSize || 500;
        this.defaultTTL = config.defaultTTL || 300000; // 5 minutes
        
        // Main cache storage
        this.cache = new Map();
        
        // TTL tracking: key -> expiresAt timestamp
        this.ttl = new Map();
        
        // LRU tracking: key -> lastAccessedAt timestamp
        this.accessTime = new Map();
        
        // Statistics
        this.stats = {
            hits: 0,
            misses: 0
        };
    }

    /**
     * Get value from cache
     * @param {string} key - Cache key
     * @returns {any} Cached value or null
     */
    get(key) {
        if (!this.cache.has(key)) {
            this.stats.misses++;
            return null;
        }

        // Check if TTL has expired
        if (this.ttl.has(key)) {
            const expiresAt = this.ttl.get(key);
            if (Date.now() > expiresAt) {
                this.cache.delete(key);
                this.ttl.delete(key);
                this.accessTime.delete(key);
                this.stats.misses++;
                return null;
            }
        }

        // Update access time for LRU tracking
        this.accessTime.set(key, Date.now());
        this.stats.hits++;
        
        return this.cache.get(key);
    }

    /**
     * Set value in cache with LRU eviction
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - Time-to-live in milliseconds (optional, uses defaultTTL if not provided)
     */
    set(key, value, ttl = null) {
        // If key already exists, remove it first to update position
        if (this.cache.has(key)) {
            this.cache.delete(key);
            this.ttl.delete(key);
            this.accessTime.delete(key);
        }

        // Check if we need to evict LRU item
        if (this.cache.size >= this.maxSize) {
            this._evictLRU();
        }

        // Add new entry
        this.cache.set(key, value);
        this.accessTime.set(key, Date.now());

        // Set TTL if provided or use default
        const effectiveTTL = ttl !== null ? ttl : this.defaultTTL;
        if (effectiveTTL > 0) {
            this.ttl.set(key, Date.now() + effectiveTTL);
        }
    }

    /**
     * Delete a specific cache entry
     * @param {string} key - Cache key
     */
    delete(key) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
            this.ttl.delete(key);
            this.accessTime.delete(key);
        }
    }

    /**
     * Invalidate cache entries matching a pattern
     * @param {string} pattern - Pattern to match (supports wildcards: *)
     * @example
     * invalidatePattern('clients:*') // Invalidates all keys starting with 'clients:'
     * invalidatePattern('orders:status:*') // Invalidates all keys starting with 'orders:status:'
     */
    invalidatePattern(pattern) {
        const regex = this._patternToRegex(pattern);
        const keysToDelete = [];

        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.delete(key));
        return keysToDelete.length;
    }

    /**
     * Clear all cache entries
     */
    clear() {
        this.cache.clear();
        this.ttl.clear();
        this.accessTime.clear();
    }

    /**
     * Get cache statistics
     * @returns {Object} Statistics object with size, hits, misses
     */
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hits: this.stats.hits,
            misses: this.stats.misses,
            hitRate: this.stats.hits + this.stats.misses > 0 
                ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2) + '%'
                : '0%'
        };
    }

    /**
     * Load master data into cache
     * @param {Database} db - Database connection
     */
    loadMasterData(db) {
        try {
            console.log('📦 Loading master data into cache...');

            // Load references
            const references = db.prepare('SELECT * FROM product_references WHERE active = 1').all();
            this.set('references', references, 3600000); // 1 hour TTL
            console.log(`✅ Cached ${references.length} references`);

            // Load clients
            const clients = db.prepare('SELECT * FROM clients WHERE active = 1').all();
            this.set('clients', clients, 3600000); // 1 hour TTL
            console.log(`✅ Cached ${clients.length} clients`);

            // Load confeccionistas
            const confeccionistas = db.prepare('SELECT * FROM confeccionistas WHERE active = 1').all();
            this.set('confeccionistas', confeccionistas, 3600000); // 1 hour TTL
            console.log(`✅ Cached ${confeccionistas.length} confeccionistas`);

            // Load sellers
            const sellers = db.prepare('SELECT * FROM sellers WHERE active = 1').all();
            this.set('sellers', sellers, 3600000); // 1 hour TTL
            console.log(`✅ Cached ${sellers.length} sellers`);

            // Load correrias
            const correrias = db.prepare('SELECT * FROM correrias WHERE active = 1').all();
            this.set('correrias', correrias, 3600000); // 1 hour TTL
            console.log(`✅ Cached ${correrias.length} correrias`);

            console.log('✅ Master data loaded into cache');
        } catch (error) {
            console.error('❌ Error loading master data into cache:', error);
            throw error;
        }
    }

    /**
     * Evict the least recently used item from cache
     * @private
     */
    _evictLRU() {
        let lruKey = null;
        let lruTime = Infinity;

        // Find the key with the oldest access time
        for (const [key, accessTime] of this.accessTime.entries()) {
            if (accessTime < lruTime) {
                lruTime = accessTime;
                lruKey = key;
            }
        }

        if (lruKey) {
            this.delete(lruKey);
        }
    }

    /**
     * Convert pattern string to regex
     * @private
     * @param {string} pattern - Pattern with wildcards (*)
     * @returns {RegExp} Compiled regex
     */
    _patternToRegex(pattern) {
        // Escape all special regex characters except *
        const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
        // Replace * with .* (match any characters)
        const regex = escaped.replace(/\*/g, '.*');
        return new RegExp(`^${regex}$`);
    }
}

// Create singleton instance
let instance = null;

function getCacheManager() {
    if (!instance) {
        instance = new CacheManager();
    }
    return instance;
}

module.exports = {
    CacheManager,
    getCacheManager
};
