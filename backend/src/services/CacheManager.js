/**
 * 💾 CACHE MANAGER
 * 
 * Manages in-memory cache for master data (references, clients, confeccionistas)
 * Reduces database queries and improves performance
 */

class CacheManager {
    constructor() {
        this.cache = new Map();
        this.ttl = new Map(); // Time-to-live for each cache entry
    }

    /**
     * Get value from cache
     * @param {string} key - Cache key
     * @returns {any} Cached value or null
     */
    get(key) {
        if (!this.cache.has(key)) {
            return null;
        }

        // Check if TTL has expired
        if (this.ttl.has(key)) {
            const expiresAt = this.ttl.get(key);
            if (Date.now() > expiresAt) {
                this.cache.delete(key);
                this.ttl.delete(key);
                return null;
            }
        }

        return this.cache.get(key);
    }

    /**
     * Set value in cache
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - Time-to-live in milliseconds (optional)
     */
    set(key, value, ttl = null) {
        this.cache.set(key, value);

        if (ttl) {
            this.ttl.set(key, Date.now() + ttl);
        } else {
            this.ttl.delete(key);
        }

        console.log(`✅ Cache set: ${key}`);
    }

    /**
     * Invalidate cache entry
     * @param {string} key - Cache key
     */
    invalidate(key) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
            this.ttl.delete(key);
            console.log(`🔄 Cache invalidated: ${key}`);
        }
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
        this.ttl.clear();
        console.log('🧹 Cache cleared');
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
     * Get cache statistics
     */
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
            memory: JSON.stringify(Array.from(this.cache.entries())).length
        };
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
