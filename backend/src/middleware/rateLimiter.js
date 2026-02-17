/**
 * 🚦 RATE LIMITER MIDDLEWARE
 * 
 * Middleware para limitar número de requests por IP/usuario
 * Validación: Requirements 7.8
 */

class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutos
    this.maxRequests = options.maxRequests || 100; // 100 requests por ventana
    this.keyGenerator = options.keyGenerator || ((req) => req.ip);
    this.store = new Map();
  }

  /**
   * Middleware para rate limiting
   */
  middleware() {
    return (req, res, next) => {
      const key = this.keyGenerator(req);
      const now = Date.now();

      // Obtener registro del cliente
      let record = this.store.get(key);

      // Si no existe o la ventana expiró, crear nuevo registro
      if (!record || now - record.windowStart > this.windowMs) {
        record = {
          windowStart: now,
          count: 0
        };
        this.store.set(key, record);
      }

      // Incrementar contador
      record.count++;

      // Calcular tiempo restante de la ventana
      const timeRemaining = Math.ceil((record.windowStart + this.windowMs - now) / 1000);

      // Agregar headers
      res.set('X-RateLimit-Limit', this.maxRequests.toString());
      res.set('X-RateLimit-Remaining', Math.max(0, this.maxRequests - record.count).toString());
      res.set('X-RateLimit-Reset', new Date(record.windowStart + this.windowMs).toISOString());

      // Verificar si se excedió el límite
      if (record.count > this.maxRequests) {
        return res.status(429).json({
          success: false,
          error: 'Too many requests',
          message: `Límite de ${this.maxRequests} requests por ${this.windowMs / 1000 / 60} minutos excedido`,
          retryAfter: timeRemaining
        });
      }

      next();
    };
  }

  /**
   * Limpiar registros antiguos
   */
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now - record.windowStart > this.windowMs) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * Crear instancia de rate limiter
 * @param {Object} options - Opciones
 * @returns {Function} Middleware
 */
function createRateLimiter(options = {}) {
  const limiter = new RateLimiter(options);

  // Limpiar registros antiguos cada 5 minutos
  setInterval(() => limiter.cleanup(), 5 * 60 * 1000);

  return limiter.middleware();
}

/**
 * Rate limiter específico para login (más restrictivo)
 */
function createLoginRateLimiter() {
  return createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5, // 5 intentos
    keyGenerator: (req) => req.body?.loginCode || req.ip
  });
}

/**
 * Rate limiter específico para API (menos restrictivo)
 */
function createApiRateLimiter() {
  return createRateLimiter({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 60, // 60 requests por minuto
    keyGenerator: (req) => req.user?.id || req.ip
  });
}

module.exports = {
  RateLimiter,
  createRateLimiter,
  createLoginRateLimiter,
  createApiRateLimiter
};
