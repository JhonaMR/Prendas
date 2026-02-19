const logger = require('../controllers/shared/logger');

describe('Logger Module', () => {
  let consoleLogSpy;
  let consoleWarnSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Basic logging methods', () => {
    it('should log debug messages', () => {
      logger.debug('Test debug message', { key: 'value' });
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('[DEBUG]');
      expect(output).toContain('Test debug message');
    });

    it('should log info messages', () => {
      logger.info('Test info message', { key: 'value' });
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('[INFO]');
      expect(output).toContain('Test info message');
    });

    it('should log warn messages', () => {
      logger.warn('Test warn message', { key: 'value' });
      expect(consoleWarnSpy).toHaveBeenCalled();
      const output = consoleWarnSpy.mock.calls[0][0];
      expect(output).toContain('[WARN]');
      expect(output).toContain('Test warn message');
    });

    it('should log error messages with stack trace', () => {
      const error = new Error('Test error');
      logger.error('Test error message', error);
      expect(consoleErrorSpy).toHaveBeenCalled();
      const output = consoleErrorSpy.mock.calls[0][0];
      expect(output).toContain('[ERROR]');
      expect(output).toContain('Test error message');
      expect(output).toContain('Error: Test error');
    });
  });

  describe('Network detection logging', () => {
    it('should log network detection with detected IP', () => {
      logger.logNetworkDetection('192.168.1.100', ['192.168.1.100', '10.0.0.5'], '192.168.1.100');
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('[INFO]');
      expect(output).toContain('🌐 Network Environment Detection');
      expect(output).toContain('192.168.1.100');
    });

    it('should log network detection with no detected IP', () => {
      logger.logNetworkDetection(null, [], 'localhost');
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('[INFO]');
      expect(output).toContain('🌐 Network Environment Detection');
      expect(output).toContain('localhost');
    });

    it('should exclude credentials from network detection logs', () => {
      logger.logNetworkDetection('192.168.1.100', ['192.168.1.100'], '192.168.1.100');
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).not.toContain('password');
      expect(output).not.toContain('secret');
    });
  });

  describe('Database connection logging', () => {
    it('should log database connection establishment', () => {
      logger.logDatabaseConnection('192.168.1.100', 5433, 'inventory', 'postgres', 45);
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('[INFO]');
      expect(output).toContain('✅ Database Connection Established');
      expect(output).toContain('192.168.1.100');
      expect(output).toContain('5433');
      expect(output).toContain('inventory');
      expect(output).toContain('postgres');
      expect(output).toContain('45ms');
    });

    it('should log database connection without response time', () => {
      logger.logDatabaseConnection('localhost', 5433, 'inventory', 'postgres');
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('localhost');
      expect(output).toContain('N/A');
    });

    it('should exclude credentials from database connection logs', () => {
      logger.logDatabaseConnection('192.168.1.100', 5433, 'inventory', 'postgres', 45);
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).not.toContain('password');
      expect(output).not.toContain('secret');
    });
  });

  describe('Fallback connection logging', () => {
    it('should log fallback connection usage', () => {
      logger.logFallbackConnection('192.168.1.100', 5433, 'Connection timeout');
      expect(consoleWarnSpy).toHaveBeenCalled();
      const output = consoleWarnSpy.mock.calls[0][0];
      expect(output).toContain('[WARN]');
      expect(output).toContain('⚠️ Fallback Connection Used');
      expect(output).toContain('192.168.1.100');
      expect(output).toContain('5433');
      expect(output).toContain('localhost');
      expect(output).toContain('Connection timeout');
    });

    it('should log fallback connection with default reason', () => {
      logger.logFallbackConnection('10.0.0.5', 5433);
      expect(consoleWarnSpy).toHaveBeenCalled();
      const output = consoleWarnSpy.mock.calls[0][0];
      expect(output).toContain('Connection failed');
    });

    it('should exclude credentials from fallback logs', () => {
      logger.logFallbackConnection('192.168.1.100', 5433, 'Connection timeout');
      expect(consoleWarnSpy).toHaveBeenCalled();
      const output = consoleWarnSpy.mock.calls[0][0];
      expect(output).not.toContain('password');
      expect(output).not.toContain('secret');
    });
  });

  describe('Connection failure logging', () => {
    it('should log connection failure with error details', () => {
      const error = new Error('ECONNREFUSED');
      error.code = 'ECONNREFUSED';
      logger.logConnectionFailure('192.168.1.100', 5433, error);
      expect(consoleErrorSpy).toHaveBeenCalled();
      const output = consoleErrorSpy.mock.calls[0][0];
      expect(output).toContain('[ERROR]');
      expect(output).toContain('❌ Connection Failure');
      expect(output).toContain('192.168.1.100');
      expect(output).toContain('5433');
      expect(output).toContain('ECONNREFUSED');
    });

    it('should log connection failure with additional context', () => {
      const error = new Error('Connection timeout');
      logger.logConnectionFailure('localhost', 5433, error, { attempt: 1, maxRetries: 3 });
      expect(consoleErrorSpy).toHaveBeenCalled();
      const output = consoleErrorSpy.mock.calls[0][0];
      expect(output).toContain('localhost');
      expect(output).toContain('5433');
      expect(output).toContain('Connection timeout');
    });

    it('should include stack trace in connection failure logs', () => {
      const error = new Error('Test error');
      logger.logConnectionFailure('192.168.1.100', 5433, error);
      expect(consoleErrorSpy).toHaveBeenCalled();
      const output = consoleErrorSpy.mock.calls[0][0];
      expect(output).toContain('Error: Test error');
      expect(output).toContain('at');
    });

    it('should exclude credentials from connection failure logs', () => {
      const error = new Error('Connection failed');
      logger.logConnectionFailure('192.168.1.100', 5433, error);
      expect(consoleErrorSpy).toHaveBeenCalled();
      const output = consoleErrorSpy.mock.calls[0][0];
      expect(output).not.toContain('password');
      expect(output).not.toContain('secret');
    });
  });

  describe('Configuration logging', () => {
    it('should log configuration without exposing credentials', () => {
      const config = {
        DB_HOST: '192.168.1.100',
        DB_PORT: 5433,
        DB_NAME: 'inventory',
        DB_USER: 'postgres',
        DB_PASSWORD: 'secret123',
        NODE_ENV: 'production',
        DB_POOL_MIN: 5,
        DB_POOL_MAX: 20,
        DETECTED_IP: '192.168.1.100',
        FALLBACK_USED: false,
        JWT_SECRET: 'jwt_secret_key'
      };
      logger.logConfigurationLoaded(config);
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('[INFO]');
      expect(output).toContain('🔧 Configuration Loaded');
      expect(output).toContain('192.168.1.100');
      expect(output).toContain('5433');
      expect(output).toContain('inventory');
      expect(output).toContain('postgres');
      expect(output).toContain('production');
      // Verify credentials are redacted
      expect(output).toContain('***REDACTED***');
      expect(output).not.toContain('secret123');
      expect(output).not.toContain('jwt_secret_key');
    });

    it('should log configuration with all required fields', () => {
      const config = {
        DB_HOST: 'localhost',
        DB_PORT: 5433,
        DB_NAME: 'test_db',
        DB_USER: 'test_user',
        DB_PASSWORD: 'test_pass',
        NODE_ENV: 'development',
        DB_POOL_MIN: 2,
        DB_POOL_MAX: 10,
        DETECTED_IP: null,
        FALLBACK_USED: false
      };
      logger.logConfigurationLoaded(config);
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('localhost');
      expect(output).toContain('test_db');
      expect(output).toContain('development');
    });
  });

  describe('Automatic reconnection logging', () => {
    it('should log successful automatic reconnection', () => {
      logger.logAutomaticReconnection('192.168.1.100', 5433, true, 'Database recovered');
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('[INFO]');
      expect(output).toContain('✅ Automatic Reconnection Successful');
      expect(output).toContain('192.168.1.100');
      expect(output).toContain('5433');
      expect(output).toContain('Database recovered');
    });

    it('should log failed automatic reconnection attempt', () => {
      logger.logAutomaticReconnection('192.168.1.100', 5433, false, 'Connection timeout');
      expect(consoleWarnSpy).toHaveBeenCalled();
      const output = consoleWarnSpy.mock.calls[0][0];
      expect(output).toContain('[WARN]');
      expect(output).toContain('⚠️ Automatic Reconnection Attempted');
      expect(output).toContain('192.168.1.100');
      expect(output).toContain('5433');
      expect(output).toContain('Connection timeout');
    });

    it('should log automatic reconnection with default reason', () => {
      logger.logAutomaticReconnection('localhost', 5433, true);
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('Database unavailable');
    });

    it('should exclude credentials from reconnection logs', () => {
      logger.logAutomaticReconnection('192.168.1.100', 5433, true);
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).not.toContain('password');
      expect(output).not.toContain('secret');
    });
  });

  describe('Credential sanitization', () => {
    it('should sanitize password field', () => {
      const config = {
        DB_HOST: 'localhost',
        DB_PASSWORD: 'secret123'
      };
      logger.logConfigurationLoaded(config);
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('***REDACTED***');
      expect(output).not.toContain('secret123');
    });

    it('should sanitize JWT_SECRET field', () => {
      const config = {
        DB_HOST: 'localhost',
        DB_PORT: 5433,
        DB_NAME: 'test',
        DB_USER: 'user',
        DB_PASSWORD: 'pass',
        NODE_ENV: 'production',
        DB_POOL_MIN: 5,
        DB_POOL_MAX: 20,
        DETECTED_IP: null,
        FALLBACK_USED: false,
        JWT_SECRET: 'my_jwt_secret'
      };
      logger.logConfigurationLoaded(config);
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).not.toContain('my_jwt_secret');
    });

    it('should sanitize multiple sensitive fields', () => {
      const config = {
        DB_HOST: 'localhost',
        DB_PORT: 5433,
        DB_NAME: 'test',
        DB_USER: 'user',
        DB_PASSWORD: 'pass123',
        NODE_ENV: 'production',
        DB_POOL_MIN: 5,
        DB_POOL_MAX: 20,
        DETECTED_IP: null,
        FALLBACK_USED: false,
        JWT_SECRET: 'jwt_secret_key'
      };
      logger.logConfigurationLoaded(config);
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      // Count occurrences of ***REDACTED***
      const redactedCount = (output.match(/\*\*\*REDACTED\*\*\*/g) || []).length;
      expect(redactedCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Log formatting', () => {
    it('should include timestamp in all logs', () => {
      logger.info('Test message');
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });

    it('should include log level in all logs', () => {
      logger.info('Test message');
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('[INFO]');
    });

    it('should include emoji in specialized log messages', () => {
      logger.logNetworkDetection('192.168.1.100', ['192.168.1.100'], '192.168.1.100');
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('🌐');
    });
  });
});
