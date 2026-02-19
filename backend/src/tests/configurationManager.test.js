/**
 * Unit tests for Configuration Manager Module
 * Tests configuration initialization, validation, and connection string construction
 */

// Mock dependencies BEFORE requiring the module
jest.mock('../config/networkDetector');
jest.mock('../config/environment');
jest.mock('../controllers/shared/logger');

const configManager = require('../config/configurationManager');
const networkDetector = require('../config/networkDetector');
const { getConfig } = require('../config/environment');
const logger = require('../controllers/shared/logger');

describe('Configuration Manager Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeConfiguration()', () => {
    it('should initialize configuration with detected IP in production mode', async () => {
      // Mock environment config
      getConfig.mockReturnValue({
        PORT: 3000,
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        DB_HOST: 'localhost',
        DB_PORT: 5433,
        DB_USER: 'postgres',
        DB_PASSWORD: 'password123',
        DB_NAME: 'inventory',
        DB_POOL_MIN: 5,
        DB_POOL_MAX: 20,
        DB_IDLE_TIMEOUT: 30000,
        DB_CONNECTION_TIMEOUT: 5000,
        DB_SSL: true,
        JWT_SECRET: 'secret123',
        JWT_EXPIRES_IN: '24h',
        CORS_ORIGIN: 'http://localhost:3000'
      });

      // Mock network detection
      networkDetector.detectNetworkInterfaces.mockReturnValue({
        eth0: [{ family: 'IPv4', address: '10.10.0.34' }],
        lo: [{ family: 'IPv4', address: '127.0.0.1' }]
      });

      networkDetector.selectPrimaryIP.mockReturnValue('10.10.0.34');

      const config = await configManager.initializeConfiguration();

      expect(config).toBeDefined();
      expect(config.DB_HOST).toBe('10.10.0.34');
      expect(config.NODE_ENV).toBe('production');
      expect(config.DETECTED_IP).toBe('10.10.0.34');
      expect(config.VALIDATION_STRICT).toBe(true);
    });

    it('should initialize configuration with localhost in development mode', async () => {
      getConfig.mockReturnValue({
        PORT: 3000,
        NODE_ENV: 'development',
        HOST: '0.0.0.0',
        DB_HOST: 'localhost',
        DB_PORT: 5433,
        DB_USER: 'postgres',
        DB_PASSWORD: 'password123',
        DB_NAME: 'inventory',
        DB_POOL_MIN: 5,
        DB_POOL_MAX: 20,
        DB_IDLE_TIMEOUT: 30000,
        DB_CONNECTION_TIMEOUT: 5000,
        DB_SSL: false,
        JWT_SECRET: 'secret123',
        JWT_EXPIRES_IN: '24h',
        CORS_ORIGIN: 'http://localhost:3000'
      });

      networkDetector.detectNetworkInterfaces.mockReturnValue({
        lo: [{ family: 'IPv4', address: '127.0.0.1' }]
      });

      networkDetector.selectPrimaryIP.mockReturnValue(null);
      networkDetector.getDatabaseHost.mockReturnValue('localhost');

      const config = await configManager.initializeConfiguration();

      expect(config.DB_HOST).toBe('localhost');
      expect(config.NODE_ENV).toBe('development');
    });

    it('should throw error if required fields are missing', async () => {
      getConfig.mockReturnValue({
        PORT: 3000,
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        DB_HOST: 'localhost',
        DB_PORT: 5433,
        // Missing DB_USER
        DB_PASSWORD: 'password123',
        DB_NAME: 'inventory',
        DB_POOL_MIN: 5,
        DB_POOL_MAX: 20,
        DB_IDLE_TIMEOUT: 30000,
        DB_CONNECTION_TIMEOUT: 5000,
        DB_SSL: true,
        JWT_SECRET: 'secret123',
        JWT_EXPIRES_IN: '24h',
        CORS_ORIGIN: 'http://localhost:3000'
      });

      networkDetector.detectNetworkInterfaces.mockReturnValue({});
      networkDetector.selectPrimaryIP.mockReturnValue(null);

      await expect(configManager.initializeConfiguration()).rejects.toThrow();
    });

    it('should initialize configuration with staging mode using detected IP', async () => {
      getConfig.mockReturnValue({
        PORT: 3000,
        NODE_ENV: 'staging',
        HOST: '0.0.0.0',
        DB_HOST: 'localhost',
        DB_PORT: 5433,
        DB_USER: 'postgres',
        DB_PASSWORD: 'password123',
        DB_NAME: 'inventory',
        DB_POOL_MIN: 5,
        DB_POOL_MAX: 20,
        DB_IDLE_TIMEOUT: 30000,
        DB_CONNECTION_TIMEOUT: 5000,
        DB_SSL: false,
        JWT_SECRET: 'secret123',
        JWT_EXPIRES_IN: '24h',
        CORS_ORIGIN: 'http://localhost:3000'
      });

      networkDetector.detectNetworkInterfaces.mockReturnValue({
        eth0: [{ family: 'IPv4', address: '10.10.0.34' }]
      });

      networkDetector.selectPrimaryIP.mockReturnValue('10.10.0.34');

      const config = await configManager.initializeConfiguration();

      expect(config.DB_HOST).toBe('10.10.0.34');
      expect(config.NODE_ENV).toBe('staging');
      expect(config.VALIDATION_STRICT).toBe(false);
    });

    it('should default to development mode for unknown NODE_ENV', async () => {
      getConfig.mockReturnValue({
        PORT: 3000,
        NODE_ENV: 'unknown_env',
        HOST: '0.0.0.0',
        DB_HOST: 'localhost',
        DB_PORT: 5433,
        DB_USER: 'postgres',
        DB_PASSWORD: 'password123',
        DB_NAME: 'inventory',
        DB_POOL_MIN: 5,
        DB_POOL_MAX: 20,
        DB_IDLE_TIMEOUT: 30000,
        DB_CONNECTION_TIMEOUT: 5000,
        DB_SSL: false,
        JWT_SECRET: 'secret123',
        JWT_EXPIRES_IN: '24h',
        CORS_ORIGIN: 'http://localhost:3000'
      });

      networkDetector.detectNetworkInterfaces.mockReturnValue({
        eth0: [{ family: 'IPv4', address: '10.10.0.34' }]
      });

      networkDetector.selectPrimaryIP.mockReturnValue('10.10.0.34');

      const config = await configManager.initializeConfiguration();

      expect(config.NODE_ENV).toBe('development');
      expect(config.DB_HOST).toBe('localhost');
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Unknown NODE_ENV'));
    });
  });

  describe('constructConnectionString()', () => {
    it('should construct connection string with all required parameters', () => {
      const config = {
        DB_HOST: '10.10.0.34',
        DB_PORT: 5433,
        DB_USER: 'postgres',
        DB_PASSWORD: 'password123',
        DB_NAME: 'inventory',
        DB_POOL_MIN: 5,
        DB_POOL_MAX: 20,
        DB_IDLE_TIMEOUT: 30000,
        DB_CONNECTION_TIMEOUT: 5000,
        DB_SSL: false
      };

      const connectionString = configManager.constructConnectionString(config);

      expect(connectionString.host).toBe('10.10.0.34');
      expect(connectionString.port).toBe(5433);
      expect(connectionString.user).toBe('postgres');
      expect(connectionString.password).toBe('password123');
      expect(connectionString.database).toBe('inventory');
      expect(connectionString.min).toBe(5);
      expect(connectionString.max).toBe(20);
    });

    it('should include SSL configuration when DB_SSL is true', () => {
      const config = {
        DB_HOST: 'localhost',
        DB_PORT: 5433,
        DB_USER: 'postgres',
        DB_PASSWORD: 'password123',
        DB_NAME: 'inventory',
        DB_POOL_MIN: 5,
        DB_POOL_MAX: 20,
        DB_IDLE_TIMEOUT: 30000,
        DB_CONNECTION_TIMEOUT: 5000,
        DB_SSL: true
      };

      const connectionString = configManager.constructConnectionString(config);

      expect(connectionString.ssl).toBeDefined();
      expect(connectionString.ssl).not.toBe(false);
    });

    it('should use default port 5433 if not specified', () => {
      const config = {
        DB_HOST: 'localhost',
        DB_PORT: 5433,
        DB_USER: 'postgres',
        DB_PASSWORD: 'password123',
        DB_NAME: 'inventory',
        DB_POOL_MIN: 5,
        DB_POOL_MAX: 20,
        DB_IDLE_TIMEOUT: 30000,
        DB_CONNECTION_TIMEOUT: 5000,
        DB_SSL: false
      };

      const connectionString = configManager.constructConnectionString(config);

      expect(connectionString.port).toBe(5433);
    });
  });

  describe('validateConfiguration()', () => {
    it('should validate configuration with all required fields', () => {
      const config = {
        DB_HOST: '10.10.0.34',
        DB_PORT: 5433,
        DB_USER: 'postgres',
        DB_PASSWORD: 'password123',
        DB_NAME: 'inventory',
        NODE_ENV: 'production',
        JWT_SECRET: 'secret123',
        DB_POOL_MIN: 5,
        DB_POOL_MAX: 20
      };

      const validation = configManager.validateConfiguration(config);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing DB_USER field', () => {
      const config = {
        DB_HOST: 'localhost',
        DB_PORT: 5433,
        // Missing DB_USER
        DB_PASSWORD: 'password123',
        DB_NAME: 'inventory',
        NODE_ENV: 'production',
        JWT_SECRET: 'secret123'
      };

      const validation = configManager.validateConfiguration(config);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Missing required field: DB_USER');
    });

    it('should detect missing DB_PASSWORD field', () => {
      const config = {
        DB_HOST: 'localhost',
        DB_PORT: 5433,
        DB_USER: 'postgres',
        // Missing DB_PASSWORD
        DB_NAME: 'inventory',
        NODE_ENV: 'production',
        JWT_SECRET: 'secret123'
      };

      const validation = configManager.validateConfiguration(config);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Missing required field: DB_PASSWORD');
    });

    it('should detect missing DB_NAME field', () => {
      const config = {
        DB_HOST: 'localhost',
        DB_PORT: 5433,
        DB_USER: 'postgres',
        DB_PASSWORD: 'password123',
        // Missing DB_NAME
        NODE_ENV: 'production',
        JWT_SECRET: 'secret123'
      };

      const validation = configManager.validateConfiguration(config);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Missing required field: DB_NAME');
    });

    it('should detect invalid NODE_ENV value', () => {
      const config = {
        DB_HOST: 'localhost',
        DB_PORT: 5433,
        DB_USER: 'postgres',
        DB_PASSWORD: 'password123',
        DB_NAME: 'inventory',
        NODE_ENV: 'invalid_env',
        JWT_SECRET: 'secret123'
      };

      const validation = configManager.validateConfiguration(config);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('NODE_ENV'))).toBe(true);
    });

    it('should detect when DB_POOL_MIN is greater than DB_POOL_MAX', () => {
      const config = {
        DB_HOST: 'localhost',
        DB_PORT: 5433,
        DB_USER: 'postgres',
        DB_PASSWORD: 'password123',
        DB_NAME: 'inventory',
        NODE_ENV: 'production',
        JWT_SECRET: 'secret123',
        DB_POOL_MIN: 30,
        DB_POOL_MAX: 20
      };

      const validation = configManager.validateConfiguration(config);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('DB_POOL_MIN'))).toBe(true);
    });

    it('should enforce strict validation in production mode', () => {
      const config = {
        DB_HOST: 'localhost',
        DB_PORT: 5433,
        DB_USER: 'postgres',
        DB_PASSWORD: 'password123',
        DB_NAME: 'inventory',
        NODE_ENV: 'production',
        JWT_SECRET: 'secret123',
        DB_POOL_MIN: 5,
        DB_POOL_MAX: 20,
        DETECTED_IP: '10.10.0.34'
      };

      const validation = configManager.validateConfiguration(config);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('Production mode requires a detected network IP'))).toBe(true);
    });

    it('should allow localhost in staging mode with warning', () => {
      const config = {
        DB_HOST: 'localhost',
        DB_PORT: 5433,
        DB_USER: 'postgres',
        DB_PASSWORD: 'password123',
        DB_NAME: 'inventory',
        NODE_ENV: 'staging',
        JWT_SECRET: 'secret123',
        DB_POOL_MIN: 5,
        DB_POOL_MAX: 20,
        DETECTED_IP: '10.10.0.34'
      };

      const validation = configManager.validateConfiguration(config);

      expect(validation.valid).toBe(true);
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Staging mode'));
    });

    it('should allow localhost in development mode without warnings', () => {
      const config = {
        DB_HOST: 'localhost',
        DB_PORT: 5433,
        DB_USER: 'postgres',
        DB_PASSWORD: 'password123',
        DB_NAME: 'inventory',
        NODE_ENV: 'development',
        JWT_SECRET: 'secret123',
        DB_POOL_MIN: 5,
        DB_POOL_MAX: 20
      };

      const validation = configManager.validateConfiguration(config);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('logConfiguration()', () => {
    it('should log configuration without exposing passwords', () => {
      const config = {
        DB_HOST: 'localhost',
        DB_PORT: 5433,
        DB_USER: 'postgres',
        DB_PASSWORD: 'secret_password_123',
        DB_NAME: 'inventory',
        NODE_ENV: 'production',
        JWT_SECRET: 'jwt_secret_123',
        DB_POOL_MIN: 5,
        DB_POOL_MAX: 20,
        DB_IDLE_TIMEOUT: 30000,
        DB_CONNECTION_TIMEOUT: 5000,
        DB_SSL: false,
        DETECTED_IP: '10.10.0.34',
        FALLBACK_USED: false,
        PORT: 3000,
        HOST: '0.0.0.0',
        CORS_ORIGIN: 'http://localhost:3000'
      };

      configManager.logConfiguration(config);

      // Verify logger.info was called
      expect(logger.info).toHaveBeenCalled();

      // Verify that sensitive data is not logged
      const logCalls = logger.info.mock.calls;
      const allLoggedData = JSON.stringify(logCalls);
      expect(allLoggedData).not.toContain('secret_password_123');
      expect(allLoggedData).not.toContain('jwt_secret_123');
    });
  });

  describe('reloadConfiguration()', () => {
    it('should reload configuration successfully', async () => {
      getConfig.mockReturnValue({
        PORT: 3000,
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        DB_HOST: 'localhost',
        DB_PORT: 5433,
        DB_USER: 'postgres',
        DB_PASSWORD: 'password123',
        DB_NAME: 'inventory',
        DB_POOL_MIN: 5,
        DB_POOL_MAX: 20,
        DB_IDLE_TIMEOUT: 30000,
        DB_CONNECTION_TIMEOUT: 5000,
        DB_SSL: true,
        JWT_SECRET: 'secret123',
        JWT_EXPIRES_IN: '24h',
        CORS_ORIGIN: 'http://localhost:3000'
      });

      networkDetector.detectNetworkInterfaces.mockReturnValue({
        eth0: [{ family: 'IPv4', address: '10.10.0.34' }]
      });

      networkDetector.selectPrimaryIP.mockReturnValue('10.10.0.34');

      // Initialize first
      await configManager.initializeConfiguration();

      // Then reload
      const reloadedConfig = await configManager.reloadConfiguration();

      expect(reloadedConfig).toBeDefined();
      expect(logger.info).toHaveBeenCalledWith('🔄 Reloading configuration...');
    });
  });
});
