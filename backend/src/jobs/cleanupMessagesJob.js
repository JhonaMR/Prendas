/**
 * 🧹 JOB DE LIMPIEZA DE MENSAJES
 * 
 * Se ejecuta cada día a las 23:59 para limpiar mensajes antiguos
 */

const cron = require('node-cron');
const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Ejecutar limpieza cada día a las 23:59
 * Formato: minuto hora día mes día-semana
 * 59 23 * * * = 23:59 todos los días
 */
const cleanupMessagesJob = cron.schedule('59 23 * * *', async () => {
  try {
    logger.info('🧹 Iniciando limpieza de mensajes antiguos...');

    // Eliminar mensajes de hace más de 1 día
    const result = await query(`
      DELETE FROM messages
      WHERE DATE(created_at) < CURRENT_DATE
    `);

    logger.info(`✅ ${result.rowCount} mensajes eliminados`);

    // Limpiar sesiones antiguas (más de 7 días)
    const sessionsResult = await query(`
      DELETE FROM user_sessions
      WHERE connected_at < NOW() - INTERVAL '7 days'
    `);

    logger.info(`✅ ${sessionsResult.rowCount} sesiones antiguas eliminadas`);
  } catch (error) {
    logger.error('❌ Error limpiando mensajes:', error);
  }
});

/**
 * Iniciar el job
 */
const startCleanupJob = () => {
  logger.info('⏰ Job de limpieza de mensajes programado para las 23:59 cada día');
  return cleanupMessagesJob;
};

/**
 * Detener el job
 */
const stopCleanupJob = () => {
  if (cleanupMessagesJob) {
    cleanupMessagesJob.stop();
    logger.info('⏹️ Job de limpieza detenido');
  }
};

module.exports = {
  startCleanupJob,
  stopCleanupJob,
  cleanupMessagesJob
};
