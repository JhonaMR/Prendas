/**
 * 💬 CONTROLADOR DE CHAT
 * 
 * Maneja todos los endpoints relacionados con el chat:
 * - Obtener usuarios activos
 * - Obtener historial de mensajes
 * - Enviar mensajes
 * - Marcar como leído
 * - Obtener mensajes no leídos
 */

const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * GET /api/chat/active-users
 * Obtener lista de usuarios activos conectados
 */
const getActiveUsers = async (req, res) => {
  try {
    const result = await query(`
      SELECT
        u.id,
        u.name,
        u.role,
        COALESCE(MAX(us.status), 'offline') as status,
        COALESCE(MAX(us.last_activity), NOW()) as "lastSeen",
        0 as "unreadCount"
      FROM users u
      LEFT JOIN user_sessions us ON u.id::text = us.user_id
      WHERE u.id::text != $1
      GROUP BY u.id, u.name, u.role
      ORDER BY 
        CASE WHEN MAX(us.status) = 'online' THEN 0 ELSE 1 END ASC,
        u.name ASC
    `, [req.user.id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error obteniendo usuarios activos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios activos'
    });
  }
};

/**
 * GET /api/chat/messages/:userId
 * Obtener historial de mensajes con un usuario específico (solo del día actual)
 */
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Validar que userId sea válido
    if (!userId || userId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
    }

    const result = await query(`
      SELECT 
        id,
        sender_id as "senderId",
        (SELECT name FROM users WHERE id::text = sender_id) as "senderName",
        receiver_id as "receiverId",
        content,
        read,
        created_at as "timestamp"
      FROM messages
      WHERE 
        (
          (sender_id = $1 AND receiver_id = $2) OR
          (sender_id = $2 AND receiver_id = $1)
        )
        AND DATE(created_at) = CURRENT_DATE
      ORDER BY created_at ASC
    `, [currentUserId, userId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error obteniendo mensajes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensajes'
    });
  }
};

/**
 * POST /api/chat/messages
 * Enviar un mensaje
 */
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    // Validaciones
    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: 'receiverId y content son requeridos'
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'El mensaje no puede exceder 1000 caracteres'
      });
    }

    if (senderId === parseInt(receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'No puedes enviar mensajes a ti mismo'
      });
    }

    // Verificar que el receptor existe
    const userCheck = await query('SELECT id FROM users WHERE id = $1', [receiverId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario receptor no encontrado'
      });
    }

    // Guardar el mensaje
    const result = await query(`
      INSERT INTO messages (sender_id, receiver_id, content, read, created_at)
      VALUES ($1, $2, $3, false, NOW())
      RETURNING 
        id,
        sender_id as "senderId",
        receiver_id as "receiverId",
        content,
        read,
        created_at as "timestamp"
    `, [senderId, receiverId, content.trim()]);

    logger.info(`💬 Mensaje enviado de ${req.user.name} a usuario ${receiverId}`);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error enviando mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar mensaje'
    });
  }
};

/**
 * PUT /api/chat/messages/:userId/read
 * Marcar todos los mensajes de un usuario como leídos
 */
const markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (!userId || userId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
    }

    const result = await query(`
      UPDATE messages
      SET read = true
      WHERE 
        sender_id = $1 
        AND receiver_id = $2 
        AND read = false
        AND DATE(created_at) = CURRENT_DATE
      RETURNING id
    `, [userId, currentUserId]);

    logger.info(`✓ ${result.rowCount} mensajes marcados como leídos`);

    res.json({
      success: true,
      message: `${result.rowCount} mensajes marcados como leídos`
    });
  } catch (error) {
    logger.error('Error marcando como leído:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar como leído'
    });
  }
};

/**
 * GET /api/chat/unread-messages
 * Obtener resumen de mensajes no leídos al iniciar sesión
 */
const getUnreadMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Contar total de no leídos
    const countResult = await query(`
      SELECT COUNT(*) as count
      FROM messages
      WHERE receiver_id = $1 AND read = false AND DATE(created_at) = CURRENT_DATE
    `, [currentUserId]);

    // Obtener conversaciones con no leídos
    const conversationsResult = await query(`
      SELECT
        sender_id as "userId",
        COUNT(*) as "unreadCount"
      FROM messages
      WHERE receiver_id = $1 AND read = false AND DATE(created_at) = CURRENT_DATE
      GROUP BY sender_id
      ORDER BY MAX(created_at) DESC
    `, [currentUserId]);

    res.json({
      success: true,
      data: {
        unreadCount: parseInt(countResult.rows[0]?.count || 0),
        conversations: conversationsResult.rows
      }
    });
  } catch (error) {
    logger.error('Error obteniendo mensajes no leídos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensajes no leídos'
    });
  }
};

/**
 * DELETE /api/chat/messages
 * Limpiar mensajes antiguos (solo admin)
 * Query: ?days=1 (por defecto 1 día)
 */
const deleteOldMessages = async (req, res) => {
  try {
    // Solo admin puede limpiar mensajes
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para limpiar mensajes'
      });
    }

    const days = parseInt(req.query.days) || 1;

    const result = await query(`
      DELETE FROM messages
      WHERE DATE(created_at) < CURRENT_DATE - INTERVAL '${days} day'
    `);

    logger.info(`🗑️ ${result.rowCount} mensajes antiguos eliminados`);

    res.json({
      success: true,
      message: `${result.rowCount} mensajes eliminados`
    });
  } catch (error) {
    logger.error('Error limpiando mensajes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al limpiar mensajes'
    });
  }
};

module.exports = {
  getActiveUsers,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadMessages,
  deleteOldMessages
};
