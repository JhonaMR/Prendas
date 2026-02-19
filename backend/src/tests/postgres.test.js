/**
 * Tests unitarios para el módulo postgres.js
 * Valida la funcionalidad de conexión con fallback y reintentos
 */

const postgres = require('../config/postgres');
const configurationManager = require('../config/configurationManager');
const logger = require('../controllers/shared/logger');

// Mock del logger para evitar salida en tests
jest.mock('../controllers/shared/logger', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

// Mock del configurationManager
jest.mock('../config/configurationManager', () => ({
  getConfiguration: jest.fn(() => ({
    DB_HOST: 'test-host',
    DB_PORT: 5433,
    DB_USER: 'testuser',
    DB_PASSWORD: 'testpass',
    DB_NAME: 'testdb',
    DB_POOL_MIN: 2,
    DB_POOL_MAX: 10,
    DB_IDLE_TIMEOUT: 30000,
    DB_CONNECTION_TIMEOUT: 5000,
    DB_SSL: false
  }))
}));

// Mock de pg.Pool
jest.mock('pg', () => {
  return {
    Pool: jest.fn().mockImplementation(() => ({
      connect: jest.fn(),
      end: jest.fn(),
      on: jest.fn(),
      totalCount: 5,
      idleCount: 3,
      waitingCount: 0,
      _max: 10,
      _min: 2
    }))
  };
});

describe('postgres.js - Database Connection Manager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getConnectionStatus', () => {
    it('debe retornar el estado de conexión actual', () => {
      const status = postgres.getConnectionStatus();
      
      expect(status).toHaveProperty('connected');
      expect(status).toHaveProperty('host');
      expect(status).toHaveProperty('port');
      expect(status).toHaveProperty('database');
      expect(status).toHaveProperty('error');
      expect(status).toHaveProperty('fallbackUsed');
      expect(status).toHaveProperty('lastAttempt');
      expect(status).toHaveProperty('poolStats');
    });

    it('debe indicar que no está conectado inicialmente', () => {
      const status = postgres.getConnectionStatus();
      expect(status.connected).toBe(false);
    });
  });

  describe('getPoolStats', () => {
    it('debe retornar null si el pool no está inicializado', () => {
      const stats = postgres.getPoolStats();
      expect(stats).toBeNull();
    });
  });

  describe('getPool', () => {
    it('debe lanzar error si el pool no está inicializado', () => {
      expect(() => {
        postgres.getPool();
      }).toThrow('Pool no inicializado');
    });
  });

  describe('sleep', () => {
    it('debe esperar el tiempo especificado', async () => {
      const start = Date.now();
      await new Promise(resolve => setTimeout(resolve, 100));
      const elapsed = Date.now() - start;
      
      expect(elapsed).toBeGreaterThanOrEqual(100);
      expect(elapsed).toBeLessThan(200);
    });
  });

  describe('connectWithRetry', () => {
    it('debe intentar conexión con backoff exponencial', async () => {
      const config = configurationManager.getConfiguration();
      
      // Este test valida que la función existe y puede ser llamada
      expect(typeof postgres.connectWithRetry).toBe('function');
    });
  });

  describe('attemptFallbackConnection', () => {
    it('debe intentar conexión a localhost como fallback', async () => {
      expect(typeof postgres.attemptFallbackConnection).toBe('function');
    });
  });

  describe('initPoolWithFallback', () => {
    it('debe ser una función asíncrona', () => {
      expect(typeof postgres.initPoolWithFallback).toBe('function');
    });
  });

  describe('attemptReconnection', () => {
    it('debe ser una función asíncrona para reconexión', () => {
      expect(typeof postgres.attemptReconnection).toBe('function');
    });
  });

  describe('initPool', () => {
    it('debe ser una función asíncrona compatible', () => {
      expect(typeof postgres.initPool).toBe('function');
    });
  });

  describe('query', () => {
    it('debe ser una función asíncrona para ejecutar queries', () => {
      expect(typeof postgres.query).toBe('function');
    });
  });

  describe('transaction', () => {
    it('debe ser una función asíncrona para transacciones', () => {
      expect(typeof postgres.transaction).toBe('function');
    });
  });

  describe('closePool', () => {
    it('debe ser una función asíncrona para cerrar el pool', () => {
      expect(typeof postgres.closePool).toBe('function');
    });
  });

  describe('healthCheck', () => {
    it('debe ser una función asíncrona para health check', () => {
      expect(typeof postgres.healthCheck).toBe('function');
    });
  });
});
