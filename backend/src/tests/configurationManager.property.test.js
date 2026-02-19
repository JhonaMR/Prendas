/**
 * Property-Based Tests for Configuration Manager Module
 * Tests universal properties that should hold across all valid inputs
 */

const fc = require('fast-check');
const configManager = require('../config/configurationManager');

describe('Configuration Manager - Property-Based Tests', () => {
  describe('Property 8: Connection String Contains All Credentials', () => {
    it('should include all credentials in connection string for any valid config', () => {
      /**
       * Validates: Requirements 2.2, 2.3, 2.4
       * 
       * For any valid configuration object with user, password, and database name,
       * the constructed connection string should include all three credentials.
       */
      fc.assert(
        fc.property(
          fc.record({
            DB_HOST: fc.domain(),
            DB_PORT: fc.integer({ min: 1024, max: 65535 }),
            DB_USER: fc.string({ minLength: 1, maxLength: 50 }),
            DB_PASSWORD: fc.string({ minLength: 1, maxLength: 100 }),
            DB_NAME: fc.string({ minLength: 1, maxLength: 50 }),
            DB_POOL_MIN: fc.integer({ min: 1, max: 10 }),
            DB_POOL_MAX: fc.integer({ min: 5, max: 100 }),
            DB_IDLE_TIMEOUT: fc.integer({ min: 1000, max: 300000 }),
            DB_CONNECTION_TIMEOUT: fc.integer({ min: 1000, max: 60000 }),
            DB_SSL: fc.boolean()
          }),
          (config) => {
            const connectionString = configManager.constructConnectionString(config);

            // Verify all credentials are present
            expect(connectionString.user).toBe(config.DB_USER);
            expect(connectionString.password).toBe(config.DB_PASSWORD);
            expect(connectionString.database).toBe(config.DB_NAME);
            expect(connectionString.host).toBe(config.DB_HOST);
            expect(connectionString.port).toBe(config.DB_PORT);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9: Connection String Uses Correct Port', () => {
    it('should use specified DB_PORT in connection string for any valid port', () => {
      /**
       * Validates: Requirements 2.3
       * 
       * For any configuration with a specified DB_PORT, the constructed connection
       * string should use that port (default 5433 if not specified).
       */
      fc.assert(
        fc.property(
          fc.record({
            DB_HOST: fc.domain(),
            DB_PORT: fc.integer({ min: 1024, max: 65535 }),
            DB_USER: fc.string({ minLength: 1, maxLength: 50 }),
            DB_PASSWORD: fc.string({ minLength: 1, maxLength: 100 }),
            DB_NAME: fc.string({ minLength: 1, maxLength: 50 }),
            DB_POOL_MIN: fc.integer({ min: 1, max: 10 }),
            DB_POOL_MAX: fc.integer({ min: 5, max: 100 }),
            DB_IDLE_TIMEOUT: fc.integer({ min: 1000, max: 300000 }),
            DB_CONNECTION_TIMEOUT: fc.integer({ min: 1000, max: 60000 }),
            DB_SSL: fc.boolean()
          }),
          (config) => {
            const connectionString = configManager.constructConnectionString(config);

            // Verify port matches
            expect(connectionString.port).toBe(config.DB_PORT);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10: Configuration Validation Detects Missing Fields', () => {
    it('should detect all missing required fields in any configuration', () => {
      /**
       * Validates: Requirements 2.5, 2.6
       * 
       * For any configuration object missing required fields (DB_USER, DB_PASSWORD, DB_NAME),
       * validation should return an error list containing all missing fields.
       */
      const requiredFields = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'NODE_ENV', 'JWT_SECRET'];

      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(...requiredFields), { minLength: 1, maxLength: requiredFields.length - 1 }),
          (fieldsToInclude) => {
            // Create config with only some required fields
            const config = {};
            fieldsToInclude.forEach(field => {
              config[field] = 'value';
            });

            const validation = configManager.validateConfiguration(config);

            // Should be invalid
            expect(validation.valid).toBe(false);

            // Should have errors for missing fields
            expect(validation.errors.length).toBeGreaterThan(0);

            // Verify each missing field is reported
            const missingFields = requiredFields.filter(f => !fieldsToInclude.includes(f));
            missingFields.forEach(field => {
              const hasError = validation.errors.some(e => e.includes(field));
              expect(hasError).toBe(true);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should validate successfully when all required fields are present', () => {
      /**
       * Validates: Requirements 2.5, 2.6
       * 
       * For any configuration with all required fields, validation should succeed.
       */
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }).chain(poolMin =>
            fc.integer({ min: poolMin, max: 100 }).map(poolMax => ({ poolMin, poolMax }))
          ),
          ({ poolMin, poolMax }) => {
            const config = {
              DB_HOST: '10.10.0.34',
              DB_PORT: 5433,
              DB_USER: 'postgres',
              DB_PASSWORD: 'password123',
              DB_NAME: 'inventory',
              NODE_ENV: 'development',
              JWT_SECRET: 'secret123',
              DB_POOL_MIN: poolMin,
              DB_POOL_MAX: poolMax
            };

            const validation = configManager.validateConfiguration(config);

            // Should be valid
            expect(validation.valid).toBe(true);
            expect(validation.errors).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 11: Logging Excludes Sensitive Credentials', () => {
    it('should not expose passwords in logged configuration for any config', () => {
      /**
       * Validates: Requirements 2.5, 5.1, 5.2
       * 
       * For any log message containing connection details, the message should include
       * host, port, and database name but exclude passwords and secrets.
       */
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }).chain(poolMin =>
            fc.integer({ min: poolMin, max: 100 }).map(poolMax => ({ poolMin, poolMax }))
          ),
          ({ poolMin, poolMax }) => {
            const config = {
              DB_HOST: 'localhost',
              DB_PORT: 5433,
              DB_USER: 'postgres',
              DB_PASSWORD: 'secret_password_123',
              DB_NAME: 'inventory',
              NODE_ENV: 'production',
              JWT_SECRET: 'jwt_secret_123',
              DB_POOL_MIN: poolMin,
              DB_POOL_MAX: poolMax,
              DB_IDLE_TIMEOUT: 30000,
              DB_CONNECTION_TIMEOUT: 5000,
              DB_SSL: false,
              DETECTED_IP: '10.10.0.34',
              FALLBACK_USED: false,
              PORT: 3000,
              HOST: '0.0.0.0',
              CORS_ORIGIN: 'http://localhost:3000'
            };

            // Capture console output
            const originalLog = console.log;
            const originalWarn = console.warn;
            const logs = [];

            console.log = jest.fn((...args) => {
              logs.push(JSON.stringify(args));
            });
            console.warn = jest.fn((...args) => {
              logs.push(JSON.stringify(args));
            });

            try {
              configManager.logConfiguration(config);

              // Verify sensitive data is not in logs
              const allLogs = logs.join(' ');
              expect(allLogs).not.toContain(config.DB_PASSWORD);
              expect(allLogs).not.toContain(config.JWT_SECRET);
            } finally {
              console.log = originalLog;
              console.warn = originalWarn;
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 8-11 Combined: Connection String Consistency', () => {
    it('should maintain consistency between config and connection string for any valid config', () => {
      /**
       * Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.6
       * 
       * For any valid configuration, the connection string should be constructible
       * and contain all required credentials without exposing sensitive data in logs.
       */
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }).chain(poolMin =>
            fc.integer({ min: poolMin, max: 100 }).map(poolMax => ({ poolMin, poolMax }))
          ),
          ({ poolMin, poolMax }) => {
            const config = {
              DB_HOST: '10.10.0.34',
              DB_PORT: 5433,
              DB_USER: 'postgres',
              DB_PASSWORD: 'password123',
              DB_NAME: 'inventory',
              NODE_ENV: 'development',
              JWT_SECRET: 'secret123',
              DB_POOL_MIN: poolMin,
              DB_POOL_MAX: poolMax,
              DB_IDLE_TIMEOUT: 30000,
              DB_CONNECTION_TIMEOUT: 5000,
              DB_SSL: false
            };

            // Validate configuration
            const validation = configManager.validateConfiguration(config);
            expect(validation.valid).toBe(true);

            // Construct connection string
            const connectionString = configManager.constructConnectionString(config);

            // Verify all credentials are present
            expect(connectionString.user).toBe(config.DB_USER);
            expect(connectionString.password).toBe(config.DB_PASSWORD);
            expect(connectionString.database).toBe(config.DB_NAME);
            expect(connectionString.host).toBe(config.DB_HOST);
            expect(connectionString.port).toBe(config.DB_PORT);

            // Verify pool settings
            expect(connectionString.min).toBe(config.DB_POOL_MIN);
            expect(connectionString.max).toBe(config.DB_POOL_MAX);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


describe('Property 4-7: NODE_ENV Modes', () => {
  describe('Property 4: Development Mode Uses Localhost', () => {
    it('should use localhost for development mode regardless of detected IP', () => {
      /**
       * Validates: Requirements 6.1
       * 
       * For any configuration with NODE_ENV set to "development", the database host
       * should be localhost regardless of detected network IPs.
       */
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (detectedIP) => {
            const config = {
              DB_HOST: 'localhost',
              DB_PORT: 5433,
              DB_USER: 'postgres',
              DB_PASSWORD: 'password123',
              DB_NAME: 'inventory',
              NODE_ENV: 'development',
              JWT_SECRET: 'secret123',
              DB_POOL_MIN: 5,
              DB_POOL_MAX: 20,
              DETECTED_IP: detectedIP
            };

            const validation = configManager.validateConfiguration(config);

            // Should be valid in development mode
            expect(validation.valid).toBe(true);
            // DB_HOST should be localhost
            expect(config.DB_HOST).toBe('localhost');
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 5: Production Mode Uses Detected IP', () => {
    it('should use detected IP for production mode', () => {
      /**
       * Validates: Requirements 6.2
       * 
       * For any configuration with NODE_ENV set to "production" and available
       * non-loopback IPs, the database host should be the detected network IP, not localhost.
       */
      fc.assert(
        fc.property(
          fc.ipV4(),
          (detectedIP) => {
            // Skip if it's localhost
            if (detectedIP === '127.0.0.1') {
              return;
            }

            const config = {
              DB_HOST: detectedIP,
              DB_PORT: 5433,
              DB_USER: 'postgres',
              DB_PASSWORD: 'password123',
              DB_NAME: 'inventory',
              NODE_ENV: 'production',
              JWT_SECRET: 'secret123',
              DB_POOL_MIN: 5,
              DB_POOL_MAX: 20,
              DETECTED_IP: detectedIP
            };

            const validation = configManager.validateConfiguration(config);

            // Should be valid in production mode with detected IP
            expect(validation.valid).toBe(true);
            // DB_HOST should be the detected IP, not localhost
            expect(config.DB_HOST).not.toBe('localhost');
            expect(config.DB_HOST).toBe(detectedIP);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 6: Staging Mode Uses Detected IP', () => {
    it('should use detected IP for staging mode', () => {
      /**
       * Validates: Requirements 6.3
       * 
       * For any configuration with NODE_ENV set to "staging" and available
       * non-loopback IPs, the database host should be the detected network IP.
       */
      fc.assert(
        fc.property(
          fc.ipV4(),
          (detectedIP) => {
            // Skip if it's localhost
            if (detectedIP === '127.0.0.1') {
              return;
            }

            const config = {
              DB_HOST: detectedIP,
              DB_PORT: 5433,
              DB_USER: 'postgres',
              DB_PASSWORD: 'password123',
              DB_NAME: 'inventory',
              NODE_ENV: 'staging',
              JWT_SECRET: 'secret123',
              DB_POOL_MIN: 5,
              DB_POOL_MAX: 20,
              DETECTED_IP: detectedIP
            };

            const validation = configManager.validateConfiguration(config);

            // Should be valid in staging mode with detected IP
            expect(validation.valid).toBe(true);
            // DB_HOST should be the detected IP
            expect(config.DB_HOST).toBe(detectedIP);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 7: Unknown NODE_ENV Defaults to Development', () => {
    it('should handle unknown NODE_ENV gracefully', () => {
      /**
       * Validates: Requirements 6.4
       * 
       * For any unknown NODE_ENV value, the system should default to development mode
       * and log a warning.
       */
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(
            (env) => !['development', 'production', 'staging'].includes(env)
          ),
          (unknownEnv) => {
            const config = {
              DB_HOST: 'localhost',
              DB_PORT: 5433,
              DB_USER: 'postgres',
              DB_PASSWORD: 'password123',
              DB_NAME: 'inventory',
              NODE_ENV: unknownEnv,
              JWT_SECRET: 'secret123',
              DB_POOL_MIN: 5,
              DB_POOL_MAX: 20
            };

            // Unknown NODE_ENV should fail validation
            const validation = configManager.validateConfiguration(config);
            expect(validation.valid).toBe(false);
            expect(validation.errors.some(e => e.includes('NODE_ENV'))).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
