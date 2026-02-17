/**
 * Logger centralizado para frontend
 * Proporciona niveles de logging (DEBUG, INFO, WARN, ERROR)
 * y configuración por ambiente
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

// Determinar nivel de logging según ambiente
const currentLogLevel = process.env.REACT_APP_LOG_LEVEL 
  ? LogLevel[process.env.REACT_APP_LOG_LEVEL as keyof typeof LogLevel] 
  : (process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG);

/**
 * Formatea un mensaje de log con timestamp y contexto
 */
function formatLog(level: string, message: string, context?: any): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level}] ${message}${contextStr}`;
}

/**
 * Logger centralizado para frontend
 */
const logger = {
  debug(message: string, context?: any) {
    if (currentLogLevel <= LogLevel.DEBUG) {
      console.log(formatLog('DEBUG', message, context));
    }
  },

  info(message: string, context?: any) {
    if (currentLogLevel <= LogLevel.INFO) {
      console.log(formatLog('INFO', message, context));
    }
  },

  warn(message: string, context?: any) {
    if (currentLogLevel <= LogLevel.WARN) {
      console.warn(formatLog('WARN', message, context));
    }
  },

  error(message: string, error?: Error, context?: any) {
    if (currentLogLevel <= LogLevel.ERROR) {
      const errorInfo = error ? `\n${error.stack}` : '';
      console.error(formatLog('ERROR', message, context) + errorInfo);
    }
  }
};

export default logger;
