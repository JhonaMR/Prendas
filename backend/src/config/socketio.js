/**
 * 🔌 CONFIGURACIÓN DE SOCKET.IO
 * 
 * Gestiona conexiones WebSocket, usuarios activos y eventos en tiempo real
 */

const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { query } = require('./database');
const logger = require('../utils/logger');

let io = null;
const activeUsers = new Map(); // userId -> { socketId, status, lastActivity, userName }

/**
 * Inicializar Socket.io
 */
const initializeSocket = (server) => {
  logger.info('🔌 Inicializando Socket.io...');
  
  io = socketIO(server, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000', 'https://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 60000
  });

  logger.info('✅ Socket.io configurado');

  // ==================== MIDDLEWARE ====================

  /**
   * Middleware de autenticación
   * Verifica que el token JWT sea válido
   */
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      logger.warn('⚠️ Conexión rechazada: Token no proporcionado');
      return next(new Error('Token no proporcionado'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_default');
      socket.userId = decoded.id;
      socket.userName = decoded.name;
      socket.userRole = decoded.role;
      logger.info(`✅ Token verificado para usuario: ${decoded.name}`);
      next();
    } catch (error) {
      logger.error('❌ Error verificando token Socket.io:', error.message);
      next(new Error('Token inválido'));
    }
  });

  // ==================== CONEXIÓN ====================

  io.on('connection', async (socket) => {
    logger.info(`✅ Nueva conexión Socket.io: ${socket.id}`);
    logger.info(`👤 Usuario: ${socket.userName} (ID: ${socket.userId})`);
    logger.info(`🔗 Dirección remota: ${socket.handshake.address}`);

    // Registrar en BD
    try {
      await query(
        `INSERT INTO user_sessions (user_id, socket_id, status, connected_at, last_activity) 
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (user_id, socket_id) DO UPDATE SET status = 'online', last_activity = NOW()`,
        [socket.userId, socket.id, 'online']
      );
      logger.info(`📝 Sesión registrada en BD para usuario ${socket.userId}`);
    } catch (error) {
      logger.error('Error registrando sesión en BD:', error);
    }

    // Actualizar mapa de usuarios activos
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      status: 'online',
      lastActivity: new Date(),
      userName: socket.userName
    });

    // Notificar a todos que un usuario está online
    io.emit('user:online', {
      userId: socket.userId,
      name: socket.userName,
      status: 'online'
    });

    logger.info(`👥 Usuarios activos: ${activeUsers.size}`);

    // ==================== EVENTOS ====================

    /**
     * Evento: Enviar mensaje
     * Emite el mensaje en tiempo real al receptor
     */
    socket.on('message:send', async (data) => {
      try {
        const { to, content } = data;

        logger.info(`📨 Evento message:send recibido: from=${socket.userId}, to=${to}, content=${content?.substring(0, 30)}`);

        if (!to || !content) {
          logger.warn('⚠️ Datos incompletos en message:send');
          socket.emit('error', { message: 'Datos incompletos' });
          return;
        }

        // Obtener socket del receptor (to es un string, no un número)
        const receiverUser = activeUsers.get(to);

        logger.info(`🔍 Buscando usuario ${to} en activeUsers. Encontrado: ${!!receiverUser}`);
        logger.info(`📊 Usuarios activos: ${Array.from(activeUsers.keys()).join(', ')}`);

        if (receiverUser) {
          // Emitir al receptor
          logger.info(`✉️ Emitiendo message:received al socket ${receiverUser.socketId}`);
          io.to(receiverUser.socketId).emit('message:received', {
            from: socket.userId,
            fromName: socket.userName,
            content,
            timestamp: new Date()
          });

          logger.info(`💬 Mensaje de ${socket.userName} (${socket.userId}) a usuario ${to}`);
        } else {
          logger.info(`⚠️ Usuario ${to} no está online. Mensaje guardado en BD.`);
        }
      } catch (error) {
        logger.error('Error enviando mensaje:', error);
        socket.emit('error', { message: 'Error al enviar mensaje' });
      }
    });

    /**
     * Evento: Usuario escribiendo
     * Notifica al receptor que el usuario está escribiendo
     */
    socket.on('user:typing', (data) => {
      try {
        const { to } = data;

        if (!to) return;

        const receiverUser = activeUsers.get(to);

        if (receiverUser) {
          io.to(receiverUser.socketId).emit('user:typing', {
            from: socket.userId,
            fromName: socket.userName
          });
        }
      } catch (error) {
        logger.error('Error en user:typing:', error);
      }
    });

    /**
     * Evento: Marcar como leído
     * Notifica al emisor que los mensajes fueron leídos
     */
    socket.on('messages:read', (data) => {
      try {
        const { from } = data;

        if (!from) return;

        const senderUser = activeUsers.get(from);

        if (senderUser) {
          io.to(senderUser.socketId).emit('messages:read', {
            from: socket.userId
          });
        }
      } catch (error) {
        logger.error('Error en messages:read:', error);
      }
    });

    /**
     * Evento: Actualizar actividad
     * Actualiza el timestamp de última actividad
     */
    socket.on('user:activity', () => {
      try {
        const user = activeUsers.get(socket.userId);
        if (user) {
          user.lastActivity = new Date();
          activeUsers.set(socket.userId, user);

          // Actualizar en BD
          query(
            'UPDATE user_sessions SET last_activity = NOW() WHERE user_id = $1',
            [socket.userId]
          ).catch(err => logger.error('Error actualizando actividad:', err));
        }
      } catch (error) {
        logger.error('Error en user:activity:', error);
      }
    });

    // ==================== DESCONEXIÓN ====================

    socket.on('disconnect', async (reason) => {
      logger.info(`❌ Usuario ${socket.userName} desconectado (${reason})`);

      // Eliminar de BD
      try {
        await query(
          'DELETE FROM user_sessions WHERE socket_id = $1',
          [socket.id]
        );
      } catch (error) {
        logger.error('Error eliminando sesión de BD:', error);
      }

      // Actualizar mapa
      activeUsers.delete(socket.userId);

      // Notificar a todos
      io.emit('user:offline', {
        userId: socket.userId
      });

      logger.info(`👥 Usuarios activos: ${activeUsers.size}`);
    });

    // ==================== MANEJO DE ERRORES ====================

    socket.on('error', (error) => {
      logger.error('Error en Socket.io:', error);
    });
  });

  logger.info('✅ Socket.io inicializado');
  return io;
};

/**
 * Obtener instancia de Socket.io
 */
const getIO = () => {
  if (!io) {
    logger.warn('⚠️ Socket.io no está inicializado');
  }
  return io;
};

/**
 * Obtener usuarios activos
 */
const getActiveUsers = () => {
  return Array.from(activeUsers.entries()).map(([userId, data]) => ({
    userId,
    ...data
  }));
};

/**
 * Verificar si un usuario está online
 */
const isUserOnline = (userId) => {
  return activeUsers.has(userId);
};

module.exports = {
  initializeSocket,
  getIO,
  getActiveUsers,
  isUserOnline
};
