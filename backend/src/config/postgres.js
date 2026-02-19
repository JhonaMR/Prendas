/**
 * 🗄️ MÓDULO DE CONEXIÓN A POSTGRESQL CON FALLBACK
 * 
 * Gestiona la conexión a PostgreSQL con connection pool,
 * queries parameterizadas, transacciones, manejo de errores,
 * mecanismo de fallback y reintentos con backoff exponencial.
 */

const { Pool } = require('pg');
const configurationManager = require('./configurationManager');
const logger = require('../controllers/shared/logger');

let pool = null;
let connectionStatus = {
  connected: false,
  host: null,
  port: null,
  database: null,
  error: null,
  fallbackUsed: false,
  lastAttempt: null,
  retryCount: 0,
  poolStats: {}
};

// Variables para reconexión automática
let reconnectionInterval = null;
const RECONNECTION_CHECK_INTERVAL = 30000; // 30 segundos

/**
 * Esperar un tiempo específico (para backoff exponencial)
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Intentar conexión con reintentos y backoff exponencial
 * @param {Object} config - Configuración de conexión
 * @param {number} maxRetries - Máximo número de reintentos (default: 3)
 * @returns {Promise<Pool>} Pool de conexiones
 */
async function connectWithRetry(config, maxRetries = 3) {
  const poolConfig = {
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    host: config.DB_HOST,
    port: config.DB_PORT,
    database: config.DB_NAME,
    max: config.DB_POOL_MAX,
    min: config.DB_POOL_MIN,
    idleTimeoutMillis: config.DB_IDLE_TIMEOUT,
    connectionTimeoutMillis: config.DB_CONNECTION_TIMEOUT,
    ssl: config.DB_SSL ? { rejectUnauthorized: false } : false
  };

  let lastError = null;
  const backoffDelays = [1000, 2000, 4000]; // 1s, 2s, 4s

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`🔄 Intento de conexión ${attempt}/${maxRetries} a ${config.DB_HOST}:${config.DB_PORT}`);
      
      const testPool = new Pool(poolConfig);
      
      // Test de conexión
      const client = await testPool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      
      logger.info(`✅ Conexión exitosa a PostgreSQL en ${config.DB_HOST}:${config.DB_PORT}`);
      
      // Configurar event handlers
      testPool.on('connect', () => {
        logger.debug('✅ Nueva conexión establecida con PostgreSQL');
      });

      testPool.on('error', (err) => {
        logger.error('❌ Error inesperado en cliente idle del pool', err);
      });

      testPool.on('remove', () => {
        logger.debug('🔌 Conexión removida del pool');
      });

      return testPool;
    } catch (error) {
      lastError = error;
      logger.warn(`⚠️ Intento ${attempt} fallido: ${error.message}`);
      
      if (attempt < maxRetries) {
        const delay = backoffDelays[attempt - 1];
        logger.info(`⏳ Esperando ${delay}ms antes del siguiente intento...`);
        await sleep(delay);
      }
    }
  }

  throw new Error(`Falló la conexión a ${config.DB_HOST}:${config.DB_PORT} después de ${maxRetries} intentos. Error: ${lastError.message}`);
}

/**
 * Intentar conexión de fallback a localhost
 * @returns {Promise<Pool>} Pool de conexiones
 */
async function attemptFallbackConnection() {
  try {
    logger.warn('⚠️ Intentando conexión de fallback a localhost...');
    
    const config = configurationManager.getConfiguration();
    const fallbackConfig = {
      ...config,
      DB_HOST: 'localhost'
    };

    const fallbackPool = await connectWithRetry(fallbackConfig, 3);
    
    logger.warn('⚠️ Conexión de fallback exitosa a localhost');
    connectionStatus.fallbackUsed = true;
    
    return fallbackPool;
  } catch (error) {
    logger.error('❌ Conexión de fallback a localhost también falló', error);
    throw error;
  }
}

/**
 * Inicializar el connection pool con mecanismo de fallback
 * Intenta conexión primaria y luego fallback a localhost
 * @returns {Promise<Pool>} Pool de conexiones
 */
async function initPoolWithFallback() {
  if (pool) {
    logger.info('✅ Connection pool ya inicializado');
    return pool;
  }

  try {
    const config = configurationManager.getConfiguration();
    
    logger.info(`🚀 Inicializando pool de conexiones con fallback...`);
    logger.info(`📍 Host primario: ${config.DB_HOST}:${config.DB_PORT}`);

    // Intentar conexión primaria
    try {
      pool = await connectWithRetry(config, 3);
      
      connectionStatus.connected = true;
      connectionStatus.host = config.DB_HOST;
      connectionStatus.port = config.DB_PORT;
      connectionStatus.database = config.DB_NAME;
      connectionStatus.error = null;
      connectionStatus.fallbackUsed = false;
      connectionStatus.lastAttempt = new Date();
      
      logger.info('✅ Pool de conexiones inicializado exitosamente');
      
      // Iniciar tarea de reconexión automática
      startAutomaticReconnection();
      
      return pool;
    } catch (primaryError) {
      logger.error('❌ Conexión primaria falló', primaryError);
      
      // Intentar fallback a localhost
      try {
        pool = await attemptFallbackConnection();
        
        connectionStatus.connected = true;
        connectionStatus.host = 'localhost';
        connectionStatus.port = config.DB_PORT;
        connectionStatus.database = config.DB_NAME;
        connectionStatus.error = null;
        connectionStatus.fallbackUsed = true;
        connectionStatus.lastAttempt = new Date();
        
        logger.info('✅ Pool de conexiones inicializado con fallback');
        
        // Iniciar tarea de reconexión automática
        startAutomaticReconnection();
        
        return pool;
      } catch (fallbackError) {
        logger.error('❌ Ambas conexiones (primaria y fallback) fallaron', fallbackError);
        
        connectionStatus.connected = false;
        connectionStatus.error = fallbackError.message;
        connectionStatus.lastAttempt = new Date();
        
        throw new Error(`No se pudo establecer conexión a la base de datos. Primaria: ${primaryError.message}. Fallback: ${fallbackError.message}`);
      }
    }
  } catch (error) {
    logger.error('❌ Error crítico al inicializar pool', error);
    throw error;
  }
}

/**
 * Inicializar el connection pool de PostgreSQL (compatibilidad)
 * @returns {Promise<Pool>} Pool de conexiones
 */
async function initPool() {
  return initPoolWithFallback();
}

/**
 * Obtener el estado actual de la conexión
 * @returns {Object} Estado de conexión con detalles
 */
function getConnectionStatus() {
  if (pool) {
    connectionStatus.poolStats = {
      totalConnections: pool.totalCount,
      idleConnections: pool.idleCount,
      waitingRequests: pool.waitingCount,
      maxConnections: pool._max,
      minConnections: pool._min
    };
  }
  return { ...connectionStatus };
}

/**
 * Intentar reconexión automática
 * @returns {Promise<boolean>} true si se reconectó exitosamente
 */
async function attemptReconnection() {
  try {
    logger.info('🔄 Intentando reconexión automática...');
    
    // Cerrar pool existente si está disponible
    if (pool) {
      try {
        await pool.end();
        logger.info('🔌 Pool anterior cerrado');
      } catch (error) {
        logger.warn('⚠️ Error al cerrar pool anterior', error);
      }
      pool = null;
    }

    // Reintentar inicialización
    await initPoolWithFallback();
    
    logger.info('✅ Reconexión automática exitosa');
    return true;
  } catch (error) {
    logger.error('❌ Reconexión automática falló', error);
    connectionStatus.connected = false;
    connectionStatus.error = error.message;
    return false;
  }
}

/**
 * Obtener el pool de conexiones
 * @returns {Pool} Pool de conexiones
 */
function getPool() {
  if (!pool) {
    throw new Error('Pool no inicializado. Llama a initPool() primero.');
  }
  return pool;
}

/**
 * Ejecutar una query parameterizada
 * @param {string} sql - SQL con placeholders ($1, $2, etc.)
 * @param {Array} params - Parámetros para la query
 * @returns {Promise<Object>} Resultado de la query
 */
async function query(sql, params = []) {
  const client = await pool.connect();
  try {
    logger.debug(`📝 Ejecutando query: ${sql.substring(0, 100)}...`);
    const result = await client.query(sql, params);
    logger.debug(`✅ Query ejecutada exitosamente. Filas: ${result.rowCount}`);
    return result;
  } catch (error) {
    logger.error(`❌ Error en query: ${error.message}`);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Ejecutar una transacción
 * @param {Function} callback - Función que ejecuta las queries dentro de la transacción
 * @returns {Promise<any>} Resultado de la transacción
 */
async function transaction(callback) {
  const client = await pool.connect();
  try {
    logger.debug('🔄 Iniciando transacción');
    await client.query('BEGIN');

    const result = await callback(client);

    await client.query('COMMIT');
    logger.debug('✅ Transacción completada exitosamente');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error(`❌ Transacción revertida: ${error.message}`);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Iniciar tarea de reconexión automática
 * Verifica la conectividad periódicamente y reconecta si es necesario
 */
function startAutomaticReconnection() {
  if (reconnectionInterval) {
    logger.debug('🔄 Tarea de reconexión automática ya está activa');
    return;
  }

  logger.info('🔄 Iniciando tarea de reconexión automática...');

  reconnectionInterval = setInterval(async () => {
    try {
      // Verificar si el pool está saludable
      if (!pool || !connectionStatus.connected) {
        logger.warn('⚠️ Conexión perdida detectada. Intentando reconexión automática...');
        await attemptReconnection();
      } else {
        // Hacer un health check silencioso
        try {
          const result = await pool.query('SELECT 1');
          if (result.rowCount !== 1) {
            logger.warn('⚠️ Health check falló. Intentando reconexión...');
            await attemptReconnection();
          }
        } catch (error) {
          logger.warn(`⚠️ Health check error: ${error.message}. Intentando reconexión...`);
          await attemptReconnection();
        }
      }
    } catch (error) {
      logger.error('❌ Error en tarea de reconexión automática', error);
    }
  }, RECONNECTION_CHECK_INTERVAL);

  logger.info(`✅ Tarea de reconexión automática iniciada (intervalo: ${RECONNECTION_CHECK_INTERVAL}ms)`);
}

/**
 * Detener tarea de reconexión automática
 */
function stopAutomaticReconnection() {
  if (reconnectionInterval) {
    clearInterval(reconnectionInterval);
    reconnectionInterval = null;
    logger.info('🛑 Tarea de reconexión automática detenida');
  }
}

/**
 * Cerrar el pool de conexiones
 * @returns {Promise<void>}
 */
async function closePool() {
  // Detener tarea de reconexión automática
  stopAutomaticReconnection();

  if (pool) {
    try {
      await pool.end();
      logger.info('✅ Pool de conexiones cerrado');
      pool = null;
    } catch (error) {
      logger.error('❌ Error al cerrar pool:', error);
      throw error;
    }
  }
}

/**
 * Obtener estadísticas del pool
 * @returns {Object} Estadísticas del pool
 */
function getPoolStats() {
  if (!pool) {
    return null;
  }

  return {
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingRequests: pool.waitingCount,
    maxConnections: pool._max,
    minConnections: pool._min
  };
}

/**
 * Health check del pool
 * @returns {Promise<boolean>} true si el pool está saludable
 */
async function healthCheck() {
  try {
    const result = await query('SELECT 1');
    return result.rowCount === 1;
  } catch (error) {
    logger.error('❌ Health check fallido:', error);
    return false;
  }
}

module.exports = {
  initPool,
  initPoolWithFallback,
  connectWithRetry,
  attemptFallbackConnection,
  getConnectionStatus,
  attemptReconnection,
  getPool,
  query,
  transaction,
  closePool,
  getPoolStats,
  healthCheck,
  startAutomaticReconnection,
  stopAutomaticReconnection
};
