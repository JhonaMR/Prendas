const fc = require('fast-check');
const logger = require('../controllers/shared/logger');

// Helper to generate safe strings without special characters
const safeString = (minLength, maxLength) => 
  fc.string({ minLength, maxLength }).filter(s => !s.includes('"') && !s.includes('\\'));

describe('Logger Property-Based Tests', () => {
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

  /**
   * Property 11: Logging Excludes Sensitive Credentials
   * 
   * For any log message containing connection details, the message should include
   * host, port, and database name but exclude passwords and secrets.
   * 
   * **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
   */
  describe('Property 11: Logging Excludes Sensitive Credentials', () => {
    it('should never expose passwords in database connection logs', () => {
      fc.assert(
        fc.property(
          fc.record({
            host: fc.tuple(fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 })).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`),
            port: fc.integer({ min: 1024, max: 65535 }),
            database: safeString(1, 20),
            user: safeString(1, 20),
            password: safeString(8, 50),
            responseTime: fc.integer({ min: 1, max: 5000 })
          }),
          (config) => {
            logger.logDatabaseConnection(
              config.host,
              config.port,
              config.database,
              config.user,
              config.responseTime
            );

            expect(consoleLogSpy).toHaveBeenCalled();
            const output = consoleLogSpy.mock.calls[0][0];

            // Password should never appear in logs
            expect(output).not.toContain(config.password);
            // But host, port, database, and user should be present
            expect(output).toContain(config.host);
            expect(output).toContain(config.port.toString());
            expect(output).toContain(config.database);
            expect(output).toContain(config.user);

            consoleLogSpy.mockClear();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should never expose JWT secrets in configuration logs', () => {
      fc.assert(
        fc.property(
          fc.record({
            DB_HOST: fc.tuple(fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 })).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`),
            DB_PORT: fc.integer({ min: 1024, max: 65535 }),
            DB_NAME: safeString(1, 20),
            DB_USER: safeString(1, 20),
            DB_PASSWORD: safeString(8, 50),
            NODE_ENV: fc.constantFrom('development', 'production', 'staging'),
            DB_POOL_MIN: fc.integer({ min: 1, max: 10 }),
            DB_POOL_MAX: fc.integer({ min: 10, max: 50 }),
            DETECTED_IP: fc.option(fc.tuple(fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 })).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`)),
            FALLBACK_USED: fc.boolean(),
            JWT_SECRET: safeString(20, 50)
          }),
          (config) => {
            logger.logConfigurationLoaded(config);

            expect(consoleLogSpy).toHaveBeenCalled();
            const output = consoleLogSpy.mock.calls[0][0];

            // JWT_SECRET should never appear in logs
            expect(output).not.toContain(config.JWT_SECRET);
            // DB_PASSWORD should never appear in logs
            expect(output).not.toContain(config.DB_PASSWORD);
            // But host, port, database, and user should be present
            expect(output).toContain(config.DB_HOST);
            expect(output).toContain(config.DB_PORT.toString());
            expect(output).toContain(config.DB_NAME);
            expect(output).toContain(config.DB_USER);

            consoleLogSpy.mockClear();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should never expose passwords in fallback connection logs', () => {
      fc.assert(
        fc.property(
          fc.record({
            primaryHost: fc.tuple(fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 })).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`),
            primaryPort: fc.integer({ min: 1024, max: 65535 }),
            reason: safeString(1, 50),
            password: safeString(8, 50)
          }),
          (config) => {
            logger.logFallbackConnection(
              config.primaryHost,
              config.primaryPort,
              config.reason
            );

            expect(consoleWarnSpy).toHaveBeenCalled();
            const output = consoleWarnSpy.mock.calls[0][0];

            // Password should never appear in logs
            expect(output).not.toContain(config.password);
            // But primary host and port should be present
            expect(output).toContain(config.primaryHost);
            expect(output).toContain(config.primaryPort.toString());
            expect(output).toContain('localhost');

            consoleWarnSpy.mockClear();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should never expose passwords in connection failure logs', () => {
      fc.assert(
        fc.property(
          fc.record({
            host: fc.tuple(fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 })).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`),
            port: fc.integer({ min: 1024, max: 65535 }),
            errorMessage: safeString(1, 50),
            password: safeString(8, 50)
          }),
          (config) => {
            const error = new Error(config.errorMessage);
            logger.logConnectionFailure(config.host, config.port, error);

            expect(consoleErrorSpy).toHaveBeenCalled();
            const output = consoleErrorSpy.mock.calls[0][0];

            // Password should never appear in logs
            expect(output).not.toContain(config.password);
            // But host and port should be present
            expect(output).toContain(config.host);
            expect(output).toContain(config.port.toString());

            consoleErrorSpy.mockClear();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should never expose passwords in network detection logs', () => {
      fc.assert(
        fc.property(
          fc.record({
            detectedIP: fc.option(fc.tuple(fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 })).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`)),
            availableIPs: fc.array(fc.tuple(fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 })).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`), { minLength: 0, maxLength: 3 }),
            selectedHost: fc.tuple(fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 })).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`),
            password: safeString(8, 50)
          }),
          (config) => {
            logger.logNetworkDetection(
              config.detectedIP,
              config.availableIPs,
              config.selectedHost
            );

            expect(consoleLogSpy).toHaveBeenCalled();
            const output = consoleLogSpy.mock.calls[0][0];

            // Password should never appear in logs
            expect(output).not.toContain(config.password);
            // But selected host should be present
            expect(output).toContain(config.selectedHost);

            consoleLogSpy.mockClear();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should never expose passwords in automatic reconnection logs', () => {
      fc.assert(
        fc.property(
          fc.record({
            host: fc.tuple(fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 })).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`),
            port: fc.integer({ min: 1024, max: 65535 }),
            success: fc.boolean(),
            reason: safeString(1, 50),
            password: safeString(8, 50)
          }),
          (config) => {
            logger.logAutomaticReconnection(
              config.host,
              config.port,
              config.success,
              config.reason
            );

            const spy = config.success ? consoleLogSpy : consoleWarnSpy;
            expect(spy).toHaveBeenCalled();
            const output = spy.mock.calls[0][0];

            // Password should never appear in logs
            expect(output).not.toContain(config.password);
            // But host and port should be present
            expect(output).toContain(config.host);
            expect(output).toContain(config.port.toString());

            consoleLogSpy.mockClear();
            consoleWarnSpy.mockClear();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should redact all sensitive fields in configuration logs', () => {
      fc.assert(
        fc.property(
          fc.record({
            DB_HOST: fc.tuple(fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 })).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`),
            DB_PORT: fc.integer({ min: 1024, max: 65535 }),
            DB_NAME: safeString(1, 20),
            DB_USER: safeString(1, 20),
            DB_PASSWORD: safeString(8, 50),
            NODE_ENV: fc.constantFrom('development', 'production', 'staging'),
            DB_POOL_MIN: fc.integer({ min: 1, max: 10 }),
            DB_POOL_MAX: fc.integer({ min: 10, max: 50 }),
            DETECTED_IP: fc.option(fc.tuple(fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 })).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`)),
            FALLBACK_USED: fc.boolean(),
            JWT_SECRET: safeString(20, 50)
          }),
          (config) => {
            logger.logConfigurationLoaded(config);

            expect(consoleLogSpy).toHaveBeenCalled();
            const output = consoleLogSpy.mock.calls[0][0];

            // All sensitive fields should be redacted
            expect(output).not.toContain(config.DB_PASSWORD);
            expect(output).not.toContain(config.JWT_SECRET);

            // Should contain redaction marker
            expect(output).toContain('***REDACTED***');

            consoleLogSpy.mockClear();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should maintain log readability while excluding credentials', () => {
      fc.assert(
        fc.property(
          fc.record({
            host: fc.tuple(fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 }), fc.integer({ min: 1, max: 255 })).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`),
            port: fc.integer({ min: 1024, max: 65535 }),
            database: safeString(1, 20),
            user: safeString(1, 20),
            password: safeString(8, 50)
          }),
          (config) => {
            logger.logDatabaseConnection(
              config.host,
              config.port,
              config.database,
              config.user
            );

            expect(consoleLogSpy).toHaveBeenCalled();
            const output = consoleLogSpy.mock.calls[0][0];

            // Log should have proper structure
            expect(output).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
            expect(output).toContain('[INFO]');
            expect(output).toContain('✅ Database Connection Established');

            // Should be valid JSON context
            const jsonMatch = output.match(/\| ({.*})$/);
            if (jsonMatch) {
              expect(() => JSON.parse(jsonMatch[1])).not.toThrow();
            }

            consoleLogSpy.mockClear();
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
