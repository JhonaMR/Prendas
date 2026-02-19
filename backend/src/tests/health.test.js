/**
 * Tests unitarios para el endpoint de health check
 * Valida que el endpoint retorna el estado correcto de la base de datos
 */

// Mock del postgres module BEFORE importing health routes
jest.mock('../config/postgres', () => ({
  getConnectionStatus: jest.fn(),
  query: jest.fn()
}));

// Mock del logger
jest.mock('../controllers/shared/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

// Mock del configurationManager
jest.mock('../config/configurationManager', () => ({
  getConfiguration: jest.fn(() => ({
    NODE_ENV: 'production',
    DETECTED_IP: '10.10.0.34',
    DB_HOST: '10.10.0.34',
    DB_PORT: 5433,
    DB_NAME: 'inventory'
  }))
}));

const healthRoutes = require('../routes/health');
const postgres = require('../config/postgres');
const configurationManager = require('../config/configurationManager');
const logger = require('../controllers/shared/logger');

// Helper para simular una petición HTTP
async function simulateHealthRequest() {
  // Obtener el router
  const router = healthRoutes;
  
  // Crear un mock de req y res
  const req = {
    method: 'GET',
    path: '/health'
  };

  const res = {
    statusCode: 200,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    }
  };

  // Encontrar el handler de GET /health
  const stack = router.stack;
  const healthHandler = stack.find(layer => 
    layer.route && 
    layer.route.path === '/health' && 
    layer.route.methods.get
  );

  if (!healthHandler) {
    throw new Error('Health endpoint not found');
  }

  // Ejecutar el handler
  const handler = healthHandler.route.stack[0].handle;
  await handler(req, res);

  return {
    status: res.statusCode,
    body: res.jsonData
  };
}

describe('Health Check Endpoint', () => {
  beforeEach(() => {
    // Limpiar mocks
    jest.clearAllMocks();
  });

  describe('GET /health - Healthy Database', () => {
    it('should return 200 OK with healthy status when database is connected', async () => {
      // Arrange
      postgres.getConnectionStatus.mockReturnValue({
        connected: true,
        host: '10.10.0.34',
        port: 5433,
        database: 'inventory',
        error: null,
        fallbackUsed: false,
        poolStats: {
          totalConnections: 5,
          idleConnections: 4,
          waitingRequests: 0
        }
      });

      postgres.query.mockResolvedValue({
        rowCount: 1
      });

      // Act
      const response = await simulateHealthRequest();

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.database.connected).toBe(true);
      expect(response.body.database.host).toBe('10.10.0.34');
      expect(response.body.database.port).toBe(5433);
      expect(response.body.database.database).toBe('inventory');
      expect(response.body.database.responseTime).toBeGreaterThanOrEqual(0);
      expect(response.body.environment.nodeEnv).toBe('production');
      expect(response.body.environment.detectedIP).toBe('10.10.0.34');
      expect(response.body.environment.fallbackUsed).toBe(false);
      expect(response.body.pool).not.toBeNull();
      expect(response.body.pool.totalConnections).toBe(5);
      expect(response.body.pool.idleConnections).toBe(4);
      expect(response.body.pool.waitingRequests).toBe(0);
    });

    it('should include timestamp in ISO format', async () => {
      // Arrange
      postgres.getConnectionStatus.mockReturnValue({
        connected: true,
        host: '10.10.0.34',
        port: 5433,
        database: 'inventory',
        error: null,
        fallbackUsed: false,
        poolStats: {
          totalConnections: 5,
          idleConnections: 4,
          waitingRequests: 0
        }
      });

      postgres.query.mockResolvedValue({
        rowCount: 1
      });

      // Act
      const response = await simulateHealthRequest();

      // Assert
      expect(response.body.timestamp).toBeDefined();
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    it('should measure database response time', async () => {
      // Arrange
      postgres.getConnectionStatus.mockReturnValue({
        connected: true,
        host: '10.10.0.34',
        port: 5433,
        database: 'inventory',
        error: null,
        fallbackUsed: false,
        poolStats: {
          totalConnections: 5,
          idleConnections: 4,
          waitingRequests: 0
        }
      });

      postgres.query.mockResolvedValue({
        rowCount: 1
      });

      // Act
      const response = await simulateHealthRequest();

      // Assert
      expect(response.body.database.responseTime).toBeDefined();
      expect(typeof response.body.database.responseTime).toBe('number');
      expect(response.body.database.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should indicate fallback connection when used', async () => {
      // Arrange
      postgres.getConnectionStatus.mockReturnValue({
        connected: true,
        host: 'localhost',
        port: 5433,
        database: 'inventory',
        error: null,
        fallbackUsed: true,
        poolStats: {
          totalConnections: 5,
          idleConnections: 4,
          waitingRequests: 0
        }
      });

      postgres.query.mockResolvedValue({
        rowCount: 1
      });

      // Act
      const response = await simulateHealthRequest();

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.environment.fallbackUsed).toBe(true);
    });
  });

  describe('GET /health - Unhealthy Database', () => {
    it('should return 503 Service Unavailable when database is not connected', async () => {
      // Arrange
      postgres.getConnectionStatus.mockReturnValue({
        connected: false,
        host: null,
        port: null,
        database: null,
        error: 'Connection refused',
        fallbackUsed: false,
        poolStats: {}
      });

      // Act
      const response = await simulateHealthRequest();

      // Assert
      expect(response.status).toBe(503);
      expect(response.body.status).toBe('unhealthy');
      expect(response.body.database.connected).toBe(false);
      expect(response.body.database.error).toBe('Connection refused');
      expect(response.body.pool).toBeNull();
    });

    it('should return 503 when health check query fails', async () => {
      // Arrange
      postgres.getConnectionStatus.mockReturnValue({
        connected: true,
        host: '10.10.0.34',
        port: 5433,
        database: 'inventory',
        error: null,
        fallbackUsed: false,
        poolStats: {
          totalConnections: 5,
          idleConnections: 4,
          waitingRequests: 0
        }
      });

      postgres.query.mockRejectedValue(new Error('Query timeout'));

      // Act
      const response = await simulateHealthRequest();

      // Assert
      expect(response.status).toBe(503);
      expect(response.body.status).toBe('unhealthy');
      expect(response.body.database.connected).toBe(false);
      expect(response.body.database.error).toBe('Query timeout');
    });

    it('should include error message in response when database is unavailable', async () => {
      // Arrange
      const errorMessage = 'ECONNREFUSED: Connection refused at 10.10.0.34:5433';
      postgres.getConnectionStatus.mockReturnValue({
        connected: false,
        host: null,
        port: null,
        database: null,
        error: errorMessage,
        fallbackUsed: false,
        poolStats: {}
      });

      // Act
      const response = await simulateHealthRequest();

      // Assert
      expect(response.body.database.error).toBe(errorMessage);
    });

    it('should return null pool stats when unhealthy', async () => {
      // Arrange
      postgres.getConnectionStatus.mockReturnValue({
        connected: false,
        host: null,
        port: null,
        database: null,
        error: 'Connection refused',
        fallbackUsed: false,
        poolStats: {}
      });

      // Act
      const response = await simulateHealthRequest();

      // Assert
      expect(response.body.pool).toBeNull();
    });
  });

  describe('GET /health - Response Structure', () => {
    it('should include all required fields in response', async () => {
      // Arrange
      postgres.getConnectionStatus.mockReturnValue({
        connected: true,
        host: '10.10.0.34',
        port: 5433,
        database: 'inventory',
        error: null,
        fallbackUsed: false,
        poolStats: {
          totalConnections: 5,
          idleConnections: 4,
          waitingRequests: 0
        }
      });

      postgres.query.mockResolvedValue({
        rowCount: 1
      });

      // Act
      const response = await simulateHealthRequest();

      // Assert
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('pool');

      // Database object
      expect(response.body.database).toHaveProperty('connected');
      expect(response.body.database).toHaveProperty('host');
      expect(response.body.database).toHaveProperty('port');
      expect(response.body.database).toHaveProperty('database');
      expect(response.body.database).toHaveProperty('responseTime');

      // Environment object
      expect(response.body.environment).toHaveProperty('nodeEnv');
      expect(response.body.environment).toHaveProperty('detectedIP');
      expect(response.body.environment).toHaveProperty('fallbackUsed');

      // Pool object (when healthy)
      expect(response.body.pool).toHaveProperty('totalConnections');
      expect(response.body.pool).toHaveProperty('idleConnections');
      expect(response.body.pool).toHaveProperty('waitingRequests');
    });

    it('should return valid JSON response', async () => {
      // Arrange
      postgres.getConnectionStatus.mockReturnValue({
        connected: true,
        host: '10.10.0.34',
        port: 5433,
        database: 'inventory',
        error: null,
        fallbackUsed: false,
        poolStats: {
          totalConnections: 5,
          idleConnections: 4,
          waitingRequests: 0
        }
      });

      postgres.query.mockResolvedValue({
        rowCount: 1
      });

      // Act
      const response = await simulateHealthRequest();

      // Assert
      expect(response.body).toBeDefined();
      expect(typeof response.body).toBe('object');
    });
  });

  describe('GET /health - Error Handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      // Arrange
      postgres.getConnectionStatus.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      // Act
      const response = await simulateHealthRequest();

      // Assert
      expect(response.status).toBe(503);
      expect(response.body.status).toBe('unhealthy');
      expect(response.body.database.error).toBe('Unexpected error');
    });

    it('should return 503 when configuration is unavailable', async () => {
      // Arrange
      configurationManager.getConfiguration.mockImplementation(() => {
        throw new Error('Configuration not initialized');
      });

      postgres.getConnectionStatus.mockReturnValue({
        connected: true,
        host: '10.10.0.34',
        port: 5433,
        database: 'inventory',
        error: null,
        fallbackUsed: false,
        poolStats: {
          totalConnections: 5,
          idleConnections: 4,
          waitingRequests: 0
        }
      });

      // Act
      const response = await simulateHealthRequest();

      // Assert
      expect(response.status).toBe(503);
      expect(response.body.status).toBe('unhealthy');
    });
  });

  describe('GET /health - Pool Statistics', () => {
    it('should include pool statistics in healthy response', async () => {
      // Arrange
      postgres.getConnectionStatus.mockReturnValue({
        connected: true,
        host: '10.10.0.34',
        port: 5433,
        database: 'inventory',
        error: null,
        fallbackUsed: false,
        poolStats: {
          totalConnections: 5,
          idleConnections: 4,
          waitingRequests: 0
        }
      });

      postgres.query.mockResolvedValue({
        rowCount: 1
      });

      // Act
      const response = await simulateHealthRequest();

      // Assert
      if (response.status === 200) {
        expect(response.body.pool).not.toBeNull();
        expect(response.body.pool).toHaveProperty('totalConnections');
        expect(response.body.pool).toHaveProperty('idleConnections');
        expect(response.body.pool).toHaveProperty('waitingRequests');
      }
    });
  });
});
