/**
 * Job para cerrar todas las sesiones a las 8:00 PM
 * Se ejecuta automáticamente cada día a las 20:00 (8:00 PM)
 */

const cron = require('node-cron');
const { getIO } = require('../config/socketio');
const logger = require('../utils/logger');

/**
 * Inicia el job de cierre de sesiones
 * Se ejecuta a las 20:00 (8:00 PM) todos los días
 */
function startSessionCloseJob() {
  // Cron: "0 20 * * *" = 20:00 (8:00 PM) todos los días
  const job = cron.schedule('0 20 * * *', () => {
    closeAllSessions();
  });

  logger.info('✅ Job de cierre de sesiones iniciado (8:00 PM diariamente)');
  return job;
}

/**
 * Cierra todas las sesiones activas
 */
function closeAllSessions() {
  try {
    const io = getIO();
    
    if (!io) {
      logger.warn('⚠️ Socket.io no está disponible');
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-ES');

    logger.info(`🔐 [${timeStr}] Iniciando cierre de todas las sesiones...`);

    // Emitir evento a todos los clientes conectados
    io.emit('SESSION_CLOSE_NOTIFICATION', {
      type: 'SESSION_CLOSE',
      message: 'Tu sesión ha sido cerrada automáticamente por cierre de jornada.',
      timestamp: now.toISOString(),
      reason: 'DAILY_CLOSE_TIME'
    });

    logger.info(`✅ [${timeStr}] Notificación de cierre de sesión enviada a todos los clientes`);

    // Desconectar todos los clientes después de 2 segundos
    // Esto da tiempo para que el cliente reciba el mensaje
    setTimeout(() => {
      io.disconnectSockets();
      logger.info(`✅ [${new Date().toLocaleTimeString('es-ES')}] Todas las conexiones han sido desconectadas`);
    }, 2000);

  } catch (error) {
    logger.error('❌ Error en job de cierre de sesiones:', error);
  }
}

/**
 * Función para cerrar sesiones manualmente (para testing)
 */
function closeSessionsManually() {
  logger.warn('⚠️ Cierre manual de sesiones solicitado');
  closeAllSessions();
}

module.exports = {
  startSessionCloseJob,
  closeSessionsManually
};
