/**
 * useChat Hook - Maneja toda la lógica del chat
 * 
 * Conecta Socket.io, carga usuarios activos, maneja mensajes, etc.
 */

import { useContext, useEffect, useCallback, useRef } from 'react';
import { ChatContext } from '../context/ChatContext';
import { socketService } from '../services/socketService';
import { chatService } from '../services/chatService';
import { playMessageNotificationSound } from '../utils/soundNotification';

export const useChat = () => {
  const chatContext = useContext(ChatContext);
  const listenerRegisteredRef = useRef(false);

  if (!chatContext) {
    throw new Error('useChat debe ser usado dentro de ChatProvider');
  }

  const {
    setActiveUsers,
    setMessages,
    addMessage,
    setIsTyping,
    currentChat,
    openChat,
    closeChat,
    addNotification,
    removeNotification,
    incrementUnread,
    markUserUnread
  } = chatContext;

  // ==================== INICIALIZAR SOCKET ====================

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');

    if (token && currentUser.id) {
      // Guardar ID del usuario actual
      localStorage.setItem('current_user_id', currentUser.id);

      // Conectar Socket.io
      socketService.connect(token);

      // Cargar usuarios activos
      loadActiveUsers();

      // Cargar mensajes no leídos
      loadUnreadMessages();

      return () => {
        socketService.disconnect();
      };
    }
  }, []);

  // ==================== CARGAR DATOS ====================

  const loadActiveUsers = useCallback(async () => {
    try {
      const users = await chatService.getActiveUsers();
      setActiveUsers(users);
    } catch (error) {
      console.error('Error cargando usuarios activos:', error);
    }
  }, [setActiveUsers]);

  const loadUnreadMessages = useCallback(async () => {
    try {
      const data = await chatService.getUnreadMessages();
      console.log('Mensajes no leídos:', data.unreadCount);
    } catch (error) {
      console.error('Error cargando mensajes no leídos:', error);
    }
  }, []);

  const loadMessages = useCallback(async (userId: string) => {
    try {
      const messages = await chatService.getMessages(userId);
      setMessages(messages);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  }, [setMessages]);

  // ==================== SOCKET EVENTS ====================

  useEffect(() => {
    // Solo registrar listeners una sola vez
    if (listenerRegisteredRef.current) return;
    listenerRegisteredRef.current = true;

    // Usuario conectado
    socketService.on('user:online', (data) => {
      console.log('👤 Usuario online:', data.name);
      loadActiveUsers();
    });

    // Usuario desconectado
    socketService.on('user:offline', (data) => {
      console.log('👤 Usuario offline:', data.userId);
      loadActiveUsers();
    });

    // Mensaje recibido
    socketService.on('message:received', (data) => {
      // Reproducir sonido de notificación
      playMessageNotificationSound();

      // Si el chat está abierto con este usuario, agregar el mensaje
      if (currentChat?.userId === data.from.toString()) {
        addMessage({
          id: Date.now().toString(),
          senderId: data.from,
          senderName: data.fromName,
          receiverId: JSON.parse(localStorage.getItem('current_user') || '{}').id,
          content: data.content,
          timestamp: new Date(data.timestamp),
          read: true
        });

        // Marcar como leído
        socketService.emit('messages:read', { from: data.from });
        chatService.markAsRead(data.from.toString());
      } else {
        // Si no está abierto, mostrar notificación
        const notificationId = Date.now().toString();
        addNotification({
          id: notificationId,
          userName: data.fromName,
          messagePreview: data.content.substring(0, 50)
        });

        // Marcar usuario como que tiene mensajes no leídos
        markUserUnread(data.from);

        // Incrementar contador de no leídos
        incrementUnread();

        // Auto-remover notificación después de 5 segundos
        setTimeout(() => {
          removeNotification(notificationId);
        }, 5000);

        loadUnreadMessages();
      }
    });

    // Usuario escribiendo
    socketService.on('user:typing', (data) => {
      if (currentChat?.userId === data.from.toString()) {
        setIsTyping(true);

        // Limpiar después de 3 segundos
        setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    });

    // Mensajes marcados como leídos
    socketService.on('messages:read', (data) => {
      console.log('✓ Mensajes leídos por:', data.from);
    });

    return () => {
      socketService.off('user:online');
      socketService.off('user:offline');
      socketService.off('message:received');
      socketService.off('user:typing');
      socketService.off('messages:read');
    };
  }, []);

  // ==================== CARGAR MENSAJES AL ABRIR CHAT ====================

  useEffect(() => {
    if (currentChat) {
      loadMessages(currentChat.userId);
    }
  }, [currentChat, loadMessages]);

  // ==================== FUNCIONES PÚBLICAS ====================

  const sendMessage = useCallback(
    (content: string) => {
      if (!currentChat || !content.trim()) return;

      const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');

      // Agregar mensaje localmente
      const message = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        senderName: currentUser.name,
        receiverId: currentChat.userId,
        content: content.trim(),
        timestamp: new Date(),
        read: false
      };

      addMessage(message);

      // Enviar por Socket.io
      socketService.emit('message:send', {
        to: currentChat.userId,
        content: content.trim()
      });

      // Guardar en BD
      chatService.sendMessage(currentChat.userId, content.trim());
    },
    [currentChat, addMessage]
  );

  const handleTyping = useCallback(() => {
    if (currentChat) {
      socketService.emit('user:typing', { to: currentChat.userId });
    }
  }, [currentChat]);

  const handleActivity = useCallback(() => {
    socketService.emit('user:activity');
  }, []);

  return {
    ...chatContext,
    sendMessage,
    handleTyping,
    handleActivity,
    loadActiveUsers,
    loadMessages
  };
};
