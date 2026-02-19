/**
 * Logger centralizado para toda la aplicación
 * Proporciona niveles de logging (DEBUG, INFO, WARN, ERROR)
 * y configuración por ambiente
 * 
 * Incluye funciones especializadas para logging de red y conexión a BD
 * que excluyen credenciales sensibles (contraseñas, secretos)
 */

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// Determinar nivel de logging según ambiente
const currentLogLevel = process.env.LOG_LEVEL 
  ? LogLevel[process.env.LOG_LEVEL] 
  : (process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG);

/**
 * Formatea un mensaje de log con timestamp y contexto
 */
function formatLog(level, message, context) {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level}] ${message}${contextStr}`;
}

/**
 * Sanitiza un objeto para excluir credenciales sensibles
 * @param {Object} obj - Objeto a sanitizar
 * @returns {Object} Objeto sin credenciales sensibles
 */
function sanitizeCredentials(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized = { ...obj };
  const sensitiveFields = ['password', 'secret', 'token', 'apiKey', 'DB_PASSWORD', 'JWT_SECRET'];
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '***REDACTED***';
    }
  }

  return sanitized;
}

/**
 * Logger centralizado
 */
const logger = {
  debug(message, context) {
    if (currentLogLevel <= LogLevel.DEBUG) {
      console.log(formatLog('DEBUG', message, context));
    }
  },

  info(message, context) {
    if (currentLogLevel <= LogLevel.INFO) {
      console.log(formatLog('INFO', message, context));
    }
  },

  warn(message, context) {
    if (currentLogLevel <= LogLevel.WARN) {
      console.warn(formatLog('WARN', message, context));
    }
  },

  error(message, error, context) {
    if (currentLogLevel <= LogLevel.ERROR) {
      const errorInfo = error ? `\n${error.stack}` : '';
      console.error(formatLog('ERROR', message, context) + errorInfo);
    }
  },

  /**
   * Log de detección de red
   * Registra las interfaces de red detectadas e IP seleccionada
   * @param {string} detectedIP - IP detectada
   * @param {Array<string>} availableIPs - IPs disponibles
   * @param {string} selectedHost - Host seleccionado para BD
   */
  logNetworkDetection(detectedIP, availableIPs = [], selectedHost = 'localhost') {
    if (currentLogLevel <= LogLevel.INFO) {
      const message = '🌐 Network Environment Detection';
      const context = {
        detectedIP: detectedIP || 'none',
        availableIPs: availableIPs.length > 0 ? availableIPs : ['127.0.0.1 (loopback only)'],
        selectedHost: selectedHost,
        timestamp: new Date().toISOString()
      };
      console.log(formatLog('INFO', message, context));
    }
  },

  /**
   * Log de establecimiento de conexión a BD
   * Registra detalles de conexión sin exponer credenciales
   * @param {string} host - Host de la BD
   * @param {number} port - Puerto de la BD
   * @param {string} database - Nombre de la BD
   * @param {string} user - Usuario de la BD
   * @param {number} responseTime - Tiempo de respuesta en ms
   */
  logDatabaseConnection(host, port, database, user, responseTime = null) {
    if (currentLogLevel <= LogLevel.INFO) {
      const message = '✅ Database Connection Established';
      const context = {
        host: host,
        port: port,
        database: database,
        user: user,
        responseTime: responseTime ? `${responseTime}ms` : 'N/A',
        timestamp: new Date().toISOString()
      };
      console.log(formatLog('INFO', message, context));
    }
  },

  /**
   * Log de uso de conexión de fallback
   * Registra cuando se usa la conexión de fallback a localhost
   * @param {string} primaryHost - Host primario que falló
   * @param {number} primaryPort - Puerto primario
   * @param {string} reason - Razón del fallo
   */
  logFallbackConnection(primaryHost, primaryPort, reason = 'Connection failed') {
    if (currentLogLevel <= LogLevel.WARN) {
      const message = '⚠️ Fallback Connection Used';
      const context = {
        primaryHost: primaryHost,
        primaryPort: primaryPort,
        fallbackHost: 'localhost',
        reason: reason,
        timestamp: new Date().toISOString()
      };
      console.warn(formatLog('WARN', message, context));
    }
  },

  /**
   * Log de fallo de conexión con stack trace
   * Registra errores de conexión con detalles completos
   * @param {string} host - Host donde falló la conexión
   * @param {number} port - Puerto donde falló la conexión
   * @param {Error} error - Objeto de error con stack trace
   * @param {Object} context - Contexto adicional
   */
  logConnectionFailure(host, port, error, context = {}) {
    if (currentLogLevel <= LogLevel.ERROR) {
      const message = '❌ Connection Failure';
      const errorContext = {
        host: host,
        port: port,
        errorMessage: error ? error.message : 'Unknown error',
        errorCode: error ? error.code : 'UNKNOWN',
        ...context,
        timestamp: new Date().toISOString()
      };
      const errorStack = error ? `\n${error.stack}` : '';
      console.error(formatLog('ERROR', message, errorContext) + errorStack);
    }
  },

  /**
   * Log de configuración cargada
   * Registra detalles de configuración sin exponer credenciales
   * @param {Object} config - Objeto de configuración
   */
  logConfigurationLoaded(config) {
    if (currentLogLevel <= LogLevel.INFO) {
      const message = '🔧 Configuration Loaded';
      const configToLog = {
        dbHost: config.DB_HOST,
        dbPort: config.DB_PORT,
        dbName: config.DB_NAME,
        dbUser: config.DB_USER,
        DB_PASSWORD: config.DB_PASSWORD,
        nodeEnv: config.NODE_ENV,
        poolMin: config.DB_POOL_MIN,
        poolMax: config.DB_POOL_MAX,
        detectedIP: config.DETECTED_IP,
        fallbackUsed: config.FALLBACK_USED,
        JWT_SECRET: config.JWT_SECRET
      };
      const sanitizedConfig = sanitizeCredentials(configToLog);
      console.log(formatLog('INFO', message, sanitizedConfig));
    }
  },

  /**
   * Log de reconexión automática
   * Registra intentos de reconexión automática
   * @param {string} host - Host de reconexión
   * @param {number} port - Puerto de reconexión
   * @param {boolean} success - Si la reconexión fue exitosa
   * @param {string} reason - Razón de la reconexión
   */
  logAutomaticReconnection(host, port, success, reason = 'Database unavailable') {
    const level = success ? 'INFO' : 'WARN';
    const emoji = success ? '✅' : '⚠️';
    const message = `${emoji} Automatic Reconnection ${success ? 'Successful' : 'Attempted'}`;
    const context = {
      host: host,
      port: port,
      success: success,
      reason: reason,
      timestamp: new Date().toISOString()
    };
    
    if (level === 'INFO' && currentLogLevel <= LogLevel.INFO) {
      console.log(formatLog('INFO', message, context));
    } else if (level === 'WARN' && currentLogLevel <= LogLevel.WARN) {
      console.warn(formatLog('WARN', message, context));
    }
  }
};

module.exports = logger;
module.exports.LogLevel = LogLevel;
