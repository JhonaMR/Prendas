/**
 * Logger centralizado para toda la aplicación
 * Proporciona niveles de logging (DEBUG, INFO, WARN, ERROR)
 * y configuración por ambiente
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
  }
};

module.exports = logger;
module.exports.LogLevel = LogLevel;
