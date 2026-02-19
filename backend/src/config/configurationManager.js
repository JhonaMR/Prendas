/**
 * 🔧 CONFIGURATION MANAGER MODULE
 * 
 * Manages dynamic configuration based on network detection and environment variables.
 * Detects the network environment, loads configuration, and provides utilities for
 * managing database connection parameters.
 */

const networkDetector = require('./networkDetector');
const { getConfig } = require('./environment');
const logger = require('../controllers/shared/logger');

/**
 * Current configuration state
 */
let currentConfig = null;

/**
 * Initialize configuration with network detection
 * Detects the network environment and loads environment variables
 * Applies NODE_ENV-specific rules for database host selection
 * @returns {Promise<Object>} Configuration object with detected host
 */
async function initializeConfiguration() {
  try {
    logger.info('🔧 Initializing configuration...');

    // Get environment variables
    const envConfig = getConfig();

    // Detect network environment
    const interfaces = networkDetector.detectNetworkInterfaces();
    const detectedIP = networkDetector.selectPrimaryIP(interfaces);
    let nodeEnv = envConfig.NODE_ENV || 'development';

    // Validate NODE_ENV and default to development if unknown
    const validEnvs = ['development', 'production', 'staging'];
    if (!validEnvs.includes(nodeEnv)) {
      logger.warn(`⚠️ Unknown NODE_ENV: "${nodeEnv}". Defaulting to "development"`);
      nodeEnv = 'development';
    }

    // Apply NODE_ENV-specific rules for database host selection
    let dbHost;
    let validationStrict = false;

    if (nodeEnv === 'production') {
      // Production: use detected IP, enforce strict validation
      dbHost = detectedIP || 'localhost';
      validationStrict = true;
      logger.info(`🏭 Production mode: Using detected IP (${dbHost}) with strict validation`);
    } else if (nodeEnv === 'staging') {
      // Staging: use detected IP with relaxed validation
      dbHost = detectedIP || 'localhost';
      validationStrict = false;
      logger.info(`🔄 Staging mode: Using detected IP (${dbHost}) with relaxed validation`);
    } else {
      // Development: use localhost, allow connection failures
      dbHost = 'localhost';
      validationStrict = false;
      logger.info('💻 Development mode: Using localhost');
    }

    // Build configuration object
    const config = {
      // Server
      PORT: envConfig.PORT,
      NODE_ENV: nodeEnv,
      HOST: envConfig.HOST,

      // Database Connection
      DB_HOST: dbHost,
      DB_PORT: envConfig.DB_PORT,
      DB_USER: envConfig.DB_USER,
      DB_PASSWORD: envConfig.DB_PASSWORD,
      DB_NAME: envConfig.DB_NAME,

      // Connection Pool
      DB_POOL_MIN: envConfig.DB_POOL_MIN,
      DB_POOL_MAX: envConfig.DB_POOL_MAX,
      DB_IDLE_TIMEOUT: envConfig.DB_IDLE_TIMEOUT,
      DB_CONNECTION_TIMEOUT: envConfig.DB_CONNECTION_TIMEOUT,
      DB_SSL: envConfig.DB_SSL,

      // Network Detection
      DETECTED_IP: detectedIP,
      FALLBACK_USED: false,
      NETWORK_INTERFACES: interfaces,

      // Environment-specific settings
      VALIDATION_STRICT: validationStrict,

      // JWT
      JWT_SECRET: envConfig.JWT_SECRET,
      JWT_EXPIRES_IN: envConfig.JWT_EXPIRES_IN,

      // CORS
      CORS_ORIGIN: envConfig.CORS_ORIGIN
    };

    // Validate configuration
    const validation = validateConfiguration(config);
    if (!validation.valid) {
      throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
    }

    // Store configuration
    currentConfig = config;

    // Log configuration details
    logConfiguration(config);

    logger.info('✅ Configuration initialized successfully');
    return config;
  } catch (error) {
    logger.error('❌ Failed to initialize configuration', error);
    throw error;
  }
}

/**
 * Get the current configuration
 * @returns {Object} Configuration object
 */
function getConfiguration() {
  if (!currentConfig) {
    throw new Error('Configuration not initialized. Call initializeConfiguration() first.');
  }
  return currentConfig;
}

/**
 * Construct database connection string parameters for pg.Pool
 * @param {Object} config - Configuration object
 * @returns {Object} Connection parameters for pg.Pool
 */
function constructConnectionString(config) {
  if (!config) {
    config = getConfiguration();
  }

  return {
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    min: config.DB_POOL_MIN,
    max: config.DB_POOL_MAX,
    idleTimeoutMillis: config.DB_IDLE_TIMEOUT,
    connectionTimeoutMillis: config.DB_CONNECTION_TIMEOUT,
    ssl: config.DB_SSL ? { rejectUnauthorized: false } : false
  };
}

/**
 * Validate configuration completeness
 * Checks for required fields and valid values
 * Applies environment-specific validation rules
 * @param {Object} config - Configuration object
 * @returns {Object} Validation result {valid: boolean, errors: Array<string>}
 */
function validateConfiguration(config) {
  const errors = [];

  // Required fields
  const requiredFields = [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'NODE_ENV',
    'JWT_SECRET'
  ];

  for (const field of requiredFields) {
    if (!config[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate port is a number
  if (config.DB_PORT && typeof config.DB_PORT !== 'number') {
    errors.push('DB_PORT must be a number');
  }

  // Validate pool settings
  if (config.DB_POOL_MIN && config.DB_POOL_MAX && config.DB_POOL_MIN > config.DB_POOL_MAX) {
    errors.push('DB_POOL_MIN cannot be greater than DB_POOL_MAX');
  }

  // Validate NODE_ENV
  const validEnvs = ['development', 'production', 'staging'];
  if (config.NODE_ENV && !validEnvs.includes(config.NODE_ENV)) {
    errors.push(`NODE_ENV must be one of: ${validEnvs.join(', ')}`);
  }

  // Apply environment-specific validation rules
  if (config.NODE_ENV === 'production') {
    // Production: strict validation
    // Ensure DB_HOST is not localhost (should be detected IP)
    if (config.DB_HOST === 'localhost') {
      errors.push('Production mode requires a detected network IP, not localhost');
    }

    // Ensure SSL is configured in production
    if (config.DB_SSL === false) {
      logger.warn('⚠️ Production mode detected with SSL disabled. Consider enabling SSL for security.');
    }
  } else if (config.NODE_ENV === 'staging') {
    // Staging: relaxed validation
    // Allow localhost but prefer detected IP
    if (config.DB_HOST === 'localhost' && config.DETECTED_IP) {
      logger.warn('⚠️ Staging mode: Using localhost instead of detected IP. Consider using detected IP.');
    }
  } else if (config.NODE_ENV === 'development') {
    // Development: allow connection failures, use localhost
    // No strict validation needed
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Log configuration details (excluding sensitive data)
 * Logs connection parameters, detected IP, environment info, and active mode
 * @param {Object} config - Configuration object
 */
function logConfiguration(config) {
  if (!config) {
    config = getConfiguration();
  }

  // Log active environment mode
  const modeEmoji = {
    'development': '💻',
    'production': '🏭',
    'staging': '🔄'
  };
  const emoji = modeEmoji[config.NODE_ENV] || '⚙️';
  logger.info(`${emoji} Active Environment Mode: ${config.NODE_ENV.toUpperCase()}`);

  logger.info('🌐 Network Environment Detection:', {
    detectedIP: config.DETECTED_IP,
    nodeEnv: config.NODE_ENV,
    fallbackUsed: config.FALLBACK_USED
  });

  logger.info('🔧 Configuration Loaded:', {
    dbHost: config.DB_HOST,
    dbPort: config.DB_PORT,
    dbName: config.DB_NAME,
    dbUser: config.DB_USER,
    poolMin: config.DB_POOL_MIN,
    poolMax: config.DB_POOL_MAX,
    environment: config.NODE_ENV,
    validationStrict: config.VALIDATION_STRICT
  });

  logger.debug('📋 Full Configuration:', {
    port: config.PORT,
    host: config.HOST,
    nodeEnv: config.NODE_ENV,
    dbHost: config.DB_HOST,
    dbPort: config.DB_PORT,
    dbName: config.DB_NAME,
    dbPoolMin: config.DB_POOL_MIN,
    dbPoolMax: config.DB_POOL_MAX,
    dbIdleTimeout: config.DB_IDLE_TIMEOUT,
    dbConnectionTimeout: config.DB_CONNECTION_TIMEOUT,
    dbSSL: config.DB_SSL,
    corsOrigin: config.CORS_ORIGIN,
    detectedIP: config.DETECTED_IP,
    fallbackUsed: config.FALLBACK_USED,
    validationStrict: config.VALIDATION_STRICT
  });
}

/**
 * Reload configuration without restarting the application
 * Useful for updating configuration when environment variables change
 * @returns {Promise<Object>} Updated configuration
 */
async function reloadConfiguration() {
  try {
    logger.info('🔄 Reloading configuration...');

    // Re-initialize configuration
    const newConfig = await initializeConfiguration();

    logger.info('✅ Configuration reloaded successfully');
    return newConfig;
  } catch (error) {
    logger.error('❌ Failed to reload configuration', error);
    throw error;
  }
}

module.exports = {
  initializeConfiguration,
  getConfiguration,
  constructConnectionString,
  validateConfiguration,
  logConfiguration,
  reloadConfiguration
};
