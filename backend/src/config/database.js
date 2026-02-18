/**
 * 📊 MÓDULO DE BASE DE DATOS - POSTGRESQL
 * 
 * Este archivo maneja la conexión con PostgreSQL usando connection pool.
 * Proporciona funciones para ejecutar queries, transacciones y gestionar la conexión.
 */

const { initPool, getPool, query, transaction, closePool } = require('./postgres');
const logger = require('../controllers/shared/logger');

/**
 * Inicializar la base de datos (PostgreSQL)
 * Establece el connection pool
 */
async function initDatabase() {
    try {
        logger.info('📊 Inicializando base de datos PostgreSQL...');
        await initPool();
        logger.info('✅ Base de datos inicializada correctamente');
        return true;
    } catch (error) {
        logger.error('❌ Error inicializando base de datos:', error);
        throw error;
    }
}

/**
 * Obtener el pool de conexiones
 * Usa esto en otros módulos para acceder a la BD
 */
function getDatabase() {
    try {
        return getPool();
    } catch (error) {
        logger.error('❌ Error obteniendo pool de conexiones:', error);
        throw error;
    }
}

/**
 * Generar ID único
 * Usa timestamp + random para generar IDs únicos
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Generar ID numérico único
 * Usa timestamp + random para generar IDs numéricos únicos
 */
function generateNumericId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// Exportar funciones
module.exports = {
    initDatabase,
    getDatabase,
    generateId,
    generateNumericId,
    closePool,
    query,
    transaction
};
