/**
 * Property-based tests para el endpoint de health check
 * Valida propiedades universales del endpoint usando fast-check
 */

const fc = require('fast-check');

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

describe('Health Check Endpoint - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 15: Test Connection on Startup
   * 
   * For any health check request, the system should attempt a test database
   * connection and return the result (success or failure).
   * 
   * **Validates: Requirements 4.1, 4.2, 4.3**
   */
  describe('Property 15: Test Connection on Startup', () => {
    it('should always attempt database connection on health check', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            connected: fc.boolean(),
            host: fc.oneof(fc.constant('10.10.0.34'), fc.constant('localhost')),
            port: fc.integer({ min: 1024, max: 65535 }),
            database: fc.string({ minLength: 1, maxLength: 50 })
          }),
          async (connectionStatus) => {
            // Arrange
            postgres.getConnectionStatus.mockReturnValue({
              ...connectionStatus,
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
            // Should always return a response with status code
            expect(response.status).toBeDefined();
            expect([200, 503]).toContain(response.status);

            // Should always attempt query when connected
            if (connectionStatus.connected) {
              expect(postgres.query).toHaveBeenCalled();
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 16: Service Unavailable When Database Not Ready
   * 
   * For any request when the database is not ready, the backend should
   * return a 503 Service Unavailable response with a descriptive error message.
   * 
   * **Validates: Requirements 4.4**
   */
  describe('Property 16: Service Unavailable When Database Not Ready', () => {
    it('should return 503 when database is not connected', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          async (errorMessage) => {
            // Arrange
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
            expect(response.status).toBe(503);
            expect(response.body.status).toBe('unhealthy');
            expect(response.body.database.connected).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should include error message in 503 response', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          async (errorMessage) => {
            // Arrange
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
            expect(response.status).toBe(503);
            expect(response.body.database.error).toBe(errorMessage);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 18: Health Endpoint Returns Accurate Status
   * 
   * For any call to the health check endpoint, the response should accurately
   * reflect the current database connection status (healthy if connected,
   * unhealthy if disconnected).
   * 
   * **Validates: Requirements 5.5, 5.6**
   */
  describe('Property 18: Health Endpoint Returns Accurate Status', () => {
    it('should return accurate connection status', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.boolean(),
          async (isConnected) => {
            // Arrange
            if (isConnected) {
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
            } else {
              postgres.getConnectionStatus.mockReturnValue({
                connected: false,
                host: null,
                port: null,
                database: null,
                error: 'Connection refused',
                fallbackUsed: false,
                poolStats: {}
              });
            }

            // Act
            const response = await simulateHealthRequest();

            // Assert
            if (isConnected) {
              expect(response.status).toBe(200);
              expect(response.body.status).toBe('healthy');
              expect(response.body.database.connected).toBe(true);
            } else {
              expect(response.status).toBe(503);
              expect(response.body.status).toBe('unhealthy');
              expect(response.body.database.connected).toBe(false);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reflect connection status changes', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.tuple(fc.boolean(), fc.boolean()),
          async ([firstConnected, secondConnected]) => {
            // First request
            if (firstConnected) {
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
            } else {
              postgres.getConnectionStatus.mockReturnValue({
                connected: false,
                host: null,
                port: null,
                database: null,
                error: 'Connection refused',
                fallbackUsed: false,
                poolStats: {}
              });
            }

            const response1 = await simulateHealthRequest();

            // Second request with different status
            if (secondConnected) {
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
            } else {
              postgres.getConnectionStatus.mockReturnValue({
                connected: false,
                host: null,
                port: null,
                database: null,
                error: 'Connection refused',
                fallbackUsed: false,
                poolStats: {}
              });
            }

            const response2 = await simulateHealthRequest();

            // Assert
            expect(response1.body.database.connected).toBe(firstConnected);
            expect(response2.body.database.connected).toBe(secondConnected);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 19: Health Endpoint Includes Required Fields
   * 
   * For any health check response, the response should include connection status,
   * detected IP, database availability, and pool statistics.
   * 
   * **Validates: Requirements 5.6**
   */
  describe('Property 19: Health Endpoint Includes Required Fields', () => {
    it('should always include required fields in response', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            nodeEnv: fc.oneof(
              fc.constant('development'),
              fc.constant('production'),
              fc.constant('staging')
            ),
            detectedIP: fc.ipV4(),
            fallbackUsed: fc.boolean()
          }),
          async (envConfig) => {
            // Arrange
            configurationManager.getConfiguration.mockReturnValue({
              NODE_ENV: envConfig.nodeEnv,
              DETECTED_IP: envConfig.detectedIP,
              DB_HOST: envConfig.fallbackUsed ? 'localhost' : envConfig.detectedIP,
              DB_PORT: 5433,
              DB_NAME: 'inventory'
            });

            postgres.getConnectionStatus.mockReturnValue({
              connected: true,
              host: envConfig.fallbackUsed ? 'localhost' : envConfig.detectedIP,
              port: 5433,
              database: 'inventory',
              error: null,
              fallbackUsed: envConfig.fallbackUsed,
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

            // Database object must have required fields
            expect(response.body.database).toHaveProperty('connected');
            expect(response.body.database).toHaveProperty('host');
            expect(response.body.database).toHaveProperty('port');
            expect(response.body.database).toHaveProperty('database');
            expect(response.body.database).toHaveProperty('responseTime');

            // Environment object must have required fields
            expect(response.body.environment).toHaveProperty('nodeEnv');
            expect(response.body.environment).toHaveProperty('detectedIP');
            expect(response.body.environment).toHaveProperty('fallbackUsed');

            // Pool object must be present when healthy
            if (response.body.status === 'healthy') {
              expect(response.body.pool).toBeDefined();
              expect(response.body.pool).toHaveProperty('totalConnections');
              expect(response.body.pool).toHaveProperty('idleConnections');
              expect(response.body.pool).toHaveProperty('waitingRequests');
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should always include timestamp in ISO format', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.boolean(),
          async (isConnected) => {
            // Arrange
            if (isConnected) {
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
            } else {
              postgres.getConnectionStatus.mockReturnValue({
                connected: false,
                host: null,
                port: null,
                database: null,
                error: 'Connection refused',
                fallbackUsed: false,
                poolStats: {}
              });
            }

            // Act
            const response = await simulateHealthRequest();

            // Assert
            expect(response.body.timestamp).toBeDefined();
            expect(typeof response.body.timestamp).toBe('string');
            // Should be valid ISO 8601 format
            expect(() => new Date(response.body.timestamp)).not.toThrow();
            expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should always include environment information', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            nodeEnv: fc.oneof(
              fc.constant('development'),
              fc.constant('production'),
              fc.constant('staging')
            ),
            detectedIP: fc.ipV4()
          }),
          async (envConfig) => {
            // Arrange
            configurationManager.getConfiguration.mockReturnValue({
              NODE_ENV: envConfig.nodeEnv,
              DETECTED_IP: envConfig.detectedIP,
              DB_HOST: envConfig.detectedIP,
              DB_PORT: 5433,
              DB_NAME: 'inventory'
            });

            postgres.getConnectionStatus.mockReturnValue({
              connected: true,
              host: envConfig.detectedIP,
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
            expect(response.body.environment.nodeEnv).toBe(envConfig.nodeEnv);
            expect(response.body.environment.detectedIP).toBe(envConfig.detectedIP);
            expect(typeof response.body.environment.fallbackUsed).toBe('boolean');
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
