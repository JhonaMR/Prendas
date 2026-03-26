/**
 * ChatInitializer - Monta el socket y los listeners UNA SOLA VEZ
 * 
 * Se renderiza dentro de ChatProvider. Ningún otro componente
 * debe conectar el socket ni registrar listeners de socket.
 */

import React, { useEffect, useRef, useContext } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { socketService } from '../../services/socketService';
import { chatService } from '../../services/chatService';
import { playMessageNotificationSound } from '../../utils/soundNotification';
import { ActiveUser } from '../../context/ChatContext';

export const ChatInitializer: React.FC = () => {
  const chatContext = useContext(ChatContext)!;
  const initializedRef = useRef(false);

  const currentChatRef = useRef(chatContext.currentChat);
  const addMessageRef = useRef(chatContext.addMessage);
  const activeUsersRef = useRef<ActiveUser[]>(chatContext.activeUsers);

  const {
    setActiveUsers,
    addMessage,
    setIsTyping,
    currentChat,
    addNotification,
    removeNotification,
    addPending,
  } = chatContext;

  useEffect(() => { currentChatRef.current = currentChat; }, [currentChat]);
  useEffect(() => { addMessageRef.current = addMessage; }, [addMessage]);
  useEffect(() => { activeUsersRef.current = chatContext.activeUsers; }, [chatContext.activeUsers]);

  useEffect(() => {
    if (initializedRef.current) return;

    const token = localStorage.getItem('auth_token');
    const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
    if (!token || !currentUser.id) return;

    initializedRef.current = true;
    localStorage.setItem('current_user_id', currentUser.id);

    socketService.connect(token);

    const loadActiveUsers = async () => {
      try {
        const users = await chatService.getActiveUsers();
        setActiveUsers(users);
      } catch (e) {
        console.error('Error cargando usuarios activos:', e);
      }
    };

    loadActiveUsers();

    socketService.on('user:online', () => loadActiveUsers());

    socketService.on('user:offline', (data) => {
      setActiveUsers(
        activeUsersRef.current.map(u =>
          u.id === data.userId.toString()
            ? { ...u, status: 'offline' as const }
            : u
        )
      );
      loadActiveUsers();
    });

    socketService.on('message:received', (data) => {
      playMessageNotificationSound();

      if (currentChatRef.current?.userId === data.from.toString()) {
        addMessageRef.current({
          id: Date.now().toString(),
          senderId: data.from,
          senderName: data.fromName,
          receiverId: JSON.parse(localStorage.getItem('current_user') || '{}').id,
          content: data.content,
          timestamp: new Date(data.timestamp),
          read: true
        });
        socketService.emit('messages:read', { from: data.from });
        chatService.markAsRead(data.from.toString());
      } else {
        const notificationId = Date.now().toString();
        addNotification({
          id: notificationId,
          userId: data.from.toString(),
          userName: data.fromName,
          messagePreview: data.content.substring(0, 50)
        });
        addPending(data.from.toString(), data.fromName);
        setTimeout(() => removeNotification(notificationId), 5000);
      }
    });

    socketService.on('user:typing', (data) => {
      if (currentChatRef.current?.userId === data.from.toString()) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    return () => {
      socketService.off('user:online');
      socketService.off('user:offline');
      socketService.off('message:received');
      socketService.off('user:typing');
      socketService.disconnect();
      initializedRef.current = false;
    };
  }, []);

  return null;
};
