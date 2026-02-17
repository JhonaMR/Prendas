/**
 * 💾 CACHE MIDDLEWARE
 * 
 * Middleware para cachear respuestas de GET
 * Validación: Requirements 7.4
 */

const CacheManager = require('../services/CacheManager');

/**
 * Middleware para cachear respuestas de GET
 * @param {Object} options - Opciones
 * @param {number} options.ttl - Tiempo de vida en segundos (default: 300)
 * @returns {Function} Middleware
 */
function cacheMiddleware(options = {}) {
  const { ttl = 300 } = options;

  return (req, res, next) => {
    // Solo cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generar clave de caché basada en URL y query params
    const cacheKey = `${req.path}:${JSON.stringify(req.query)}`;

    // Intentar obtener del caché
    const cachedResponse = CacheManager.get(cacheKey);
    if (cachedResponse) {
      res.set('X-Cache', 'HIT');
      return res.json(cachedResponse);
    }

    // Guardar el método original de res.json
    const originalJson = res.json;

    // Reemplazar res.json para interceptar la respuesta
    res.json = function(data) {
      // Cachear la respuesta si fue exitosa
      if (data && data.success) {
        CacheManager.set(cacheKey, data, ttl);
        res.set('X-Cache', 'MISS');
      }

      // Llamar al método original
      return originalJson.call(this, data);
    };

    next();
  };
}

/**
 * Middleware para invalidar caché en POST/PUT/DELETE
 * @param {string} entityType - Tipo de entidad
 * @returns {Function} Middleware
 */
function invalidateCacheMiddleware(entityType) {
  return (req, res, next) => {
    // Guardar el método original de res.json
    const originalJson = res.json;

    // Reemplazar res.json para interceptar la respuesta
    res.json = function(data) {
      // Si la operación fue exitosa, invalidar caché
      if (data && data.success) {
        // Invalidar todos los patrones relacionados con esta entidad
        CacheManager.invalidatePattern(`/${entityType}*`);
        CacheManager.invalidatePattern(`/api/${entityType}*`);
      }

      // Llamar al método original
      return originalJson.call(this, data);
    };

    next();
  };
}

module.exports = {
  cacheMiddleware,
  invalidateCacheMiddleware
};
