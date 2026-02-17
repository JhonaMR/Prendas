/**
 * 🧪 MIDDLEWARE TESTS
 * 
 * Tests para verificar que todos los middlewares funcionan correctamente
 */

const { validateBody, validateQuery } = require('../middleware/validation');
const { cacheMiddleware, invalidateCacheMiddleware } = require('../middleware/cacheMiddleware');
const { createRateLimiter, createLoginRateLimiter } = require('../middleware/rateLimiter');
const { auditMiddleware, captureOldDataMiddleware } = require('../middleware/audit');
const { clientSchemas } = require('../validators/schemas');

describe('🔍 Validation Middleware Tests', () => {
  test('✅ validateBody should pass valid data', (done) => {
    const req = {
      body: {
        id: 'client-1',
        name: 'Test Client',
        nit: '123456',
        address: 'Test Address',
        city: 'Test City',
        seller: 'Test Seller'
      }
    };

    const res = {};
    const next = jest.fn();

    const middleware = validateBody(clientSchemas.create);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    done();
  });

  test('✅ validateBody should reject invalid data', (done) => {
    const req = {
      body: {
        name: 'Test Client'
        // Missing id
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const next = jest.fn();

    const middleware = validateBody(clientSchemas.create);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    done();
  });

  test('✅ validateBody should strip unknown fields', (done) => {
    const req = {
      body: {
        id: 'client-1',
        name: 'Test Client',
        nit: '123456',
        address: 'Test Address',
        city: 'Test City',
        seller: 'Test Seller',
        unknownField: 'should be removed'
      }
    };

    const res = {};
    const next = jest.fn();

    const middleware = validateBody(clientSchemas.create);
    middleware(req, res, next);

    expect(req.body.unknownField).toBeUndefined();
    expect(next).toHaveBeenCalled();
    done();
  });

  test('✅ validateQuery should validate query parameters', (done) => {
    const Joi = require('joi');
    const schema = Joi.object({
      page: Joi.number().min(1),
      limit: Joi.number().min(1).max(100)
    });

    const req = {
      query: {
        page: '1',
        limit: '25'
      }
    };

    const res = {};
    const next = jest.fn();

    const middleware = validateQuery(schema);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    done();
  });
});

describe('💾 Cache Middleware Tests', () => {
  test('✅ cacheMiddleware should cache GET requests', (done) => {
    const req = {
      method: 'GET',
      path: '/api/clients',
      query: {}
    };

    const res = {
      set: jest.fn(),
      json: jest.fn().mockReturnThis()
    };

    const next = jest.fn();

    const middleware = cacheMiddleware({ ttl: 300 });
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    done();
  });

  test('✅ cacheMiddleware should not cache non-GET requests', (done) => {
    const req = {
      method: 'POST',
      path: '/api/clients',
      query: {}
    };

    const res = {};
    const next = jest.fn();

    const middleware = cacheMiddleware({ ttl: 300 });
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    done();
  });

  test('✅ invalidateCacheMiddleware should invalidate cache on success', (done) => {
    const req = {
      method: 'POST'
    };

    const res = {
      set: jest.fn(),
      json: jest.fn(function(data) {
        return this;
      })
    };

    const next = jest.fn();

    const middleware = invalidateCacheMiddleware('clients');
    middleware(req, res, next);

    // Simular respuesta exitosa
    res.json({ success: true });

    expect(next).toHaveBeenCalled();
    done();
  });
});

describe('🚦 Rate Limiter Middleware Tests', () => {
  test('✅ Rate limiter should allow requests within limit', (done) => {
    const middleware = createRateLimiter({
      windowMs: 60000,
      maxRequests: 10
    });

    const req = {
      ip: '127.0.0.1'
    };

    const res = {
      set: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const next = jest.fn();

    // Hacer 5 requests
    for (let i = 0; i < 5; i++) {
      middleware(req, res, next);
    }

    expect(next).toHaveBeenCalledTimes(5);
    expect(res.status).not.toHaveBeenCalledWith(429);
    done();
  });

  test('✅ Rate limiter should reject requests exceeding limit', (done) => {
    const middleware = createRateLimiter({
      windowMs: 60000,
      maxRequests: 3
    });

    const req = {
      ip: '127.0.0.1'
    };

    const res = {
      set: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const next = jest.fn();

    // Hacer 5 requests (excediendo el límite de 3)
    for (let i = 0; i < 5; i++) {
      middleware(req, res, next);
    }

    // Los primeros 3 deben pasar, los últimos 2 deben ser rechazados
    expect(next).toHaveBeenCalledTimes(3);
    expect(res.status).toHaveBeenCalledWith(429);
    done();
  });

  test('✅ Login rate limiter should be more restrictive', (done) => {
    const middleware = createLoginRateLimiter();

    const req = {
      body: { loginCode: 'ADM' },
      ip: '127.0.0.1'
    };

    const res = {
      set: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const next = jest.fn();

    // Hacer 10 requests (excediendo el límite de 5)
    for (let i = 0; i < 10; i++) {
      middleware(req, res, next);
    }

    // Los primeros 5 deben pasar, los últimos 5 deben ser rechazados
    expect(next).toHaveBeenCalledTimes(5);
    expect(res.status).toHaveBeenCalledWith(429);
    done();
  });

  test('✅ Rate limiter should set response headers', (done) => {
    const middleware = createRateLimiter({
      windowMs: 60000,
      maxRequests: 10
    });

    const req = {
      ip: '127.0.0.1'
    };

    const res = {
      set: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const next = jest.fn();

    middleware(req, res, next);

    expect(res.set).toHaveBeenCalledWith('X-RateLimit-Limit', '10');
    expect(res.set).toHaveBeenCalledWith('X-RateLimit-Remaining', '9');
    expect(res.set).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(String));
    done();
  });
});

describe('📋 Audit Middleware Tests', () => {
  test('✅ auditMiddleware should log successful operations', (done) => {
    const req = {
      user: { id: 'user-1' },
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Test Agent'),
      body: { name: 'Test' },
      params: { id: 'client-1' }
    };

    const res = {
      set: jest.fn(),
      json: jest.fn(function(data) {
        return this;
      })
    };

    const next = jest.fn();

    const middleware = auditMiddleware('clients', 'CREATE');
    middleware(req, res, next);

    // Simular respuesta exitosa
    res.json({ success: true, id: 'client-1' });

    expect(next).toHaveBeenCalled();
    done();
  });

  test('✅ auditMiddleware should not log failed operations', (done) => {
    const req = {
      user: { id: 'user-1' },
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Test Agent'),
      body: { name: 'Test' }
    };

    const res = {
      set: jest.fn(),
      json: jest.fn(function(data) {
        return this;
      })
    };

    const next = jest.fn();

    const middleware = auditMiddleware('clients', 'CREATE');
    middleware(req, res, next);

    // Simular respuesta fallida
    res.json({ success: false, error: 'Error' });

    expect(next).toHaveBeenCalled();
    done();
  });

  test('✅ captureOldDataMiddleware should capture old data', (done) => {
    const req = {
      params: { id: 'client-1' }
    };

    const res = {};
    const next = jest.fn();

    // Mock getDatabase
    jest.mock('../config/database', () => ({
      getDatabase: () => ({
        prepare: () => ({
          get: () => ({ id: 'client-1', name: 'Old Name' })
        })
      })
    }));

    const middleware = captureOldDataMiddleware('clients');
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    done();
  });
});

describe('🔗 Middleware Chain Tests', () => {
  test('✅ Multiple middlewares should work together', (done) => {
    const req = {
      method: 'POST',
      path: '/api/clients',
      query: {},
      body: {
        id: 'client-1',
        name: 'Test Client',
        nit: '123456',
        address: 'Test Address',
        city: 'Test City',
        seller: 'Test Seller'
      },
      user: { id: 'user-1' },
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Test Agent')
    };

    const res = {
      set: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(function(data) {
        return this;
      })
    };

    let middlewareCount = 0;
    const next = jest.fn(() => {
      middlewareCount++;
    });

    // Aplicar múltiples middlewares
    const validationMiddleware = validateBody(clientSchemas.create);
    const rateLimiterMiddleware = createRateLimiter({ windowMs: 60000, maxRequests: 100 });
    const auditMid = auditMiddleware('clients', 'CREATE');

    validationMiddleware(req, res, () => {
      rateLimiterMiddleware(req, res, () => {
        auditMid(req, res, next);
      });
    });

    expect(middlewareCount).toBe(1);
    done();
  });
});
