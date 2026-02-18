/**
 * 🗄️ MÓDULO DE CONEXIÓN A POSTGRESQL
 * 
 * Gestiona la conexión a PostgreSQL con connection pool,
 * queries parameterizadas, transacciones y manejo de errores.
 */

const { Pool } = require('pg');
const { getConfig } = require('./environment');
const logger = require('../controllers/shared/logger');

let pool = null;

/**
 * Inicializar el connection pool de PostgreSQL
 * @returns {Promise<Pool>} Pool de conexiones
 */
async function initPool() {
  if (pool) {
    logger.info('✅ Connection pool ya inicializado');
    return pool;
  }

  const config = getConfig();

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

  pool = new Pool(poolConfig);

  // Event handlers
  pool.on('connect', () => {
    logger.debug('✅ Nueva conexión establecida con PostgreSQL');
  });

  pool.on('error', (err) => {
    logger.error('❌ Error inesperado en cliente idle del pool', err);
  });

  pool.on('remove', () => {
    logger.debug('🔌 Conexión removida del pool');
  });

  // Test de conexión
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    logger.info(`✅ Conexión a PostgreSQL exitosa: ${result.rows[0].now}`);
  } catch (error) {
    logger.error('❌ Error al conectar a PostgreSQL:', error);
    throw error;
  }

  return pool;
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
 * Cerrar el pool de conexiones
 * @returns {Promise<void>}
 */
async function closePool() {
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
  getPool,
  query,
  transaction,
  closePool,
  getPoolStats,
  healthCheck
};
