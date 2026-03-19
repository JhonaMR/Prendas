/**
 * useChat Hook - Acceso al contexto del chat
 * 
 * Solo expone estado y funciones del ChatContext.
 * La inicialización del socket vive en ChatInitializer (se monta una sola vez).
 */

import { useContext, useCallback } from 'react';
import { ChatContext } from '../context/ChatContext';
import { socketService } from '../services/socketService';
import { chatService } from '../services/chatService';

export const useChat = () => {
  const chatContext = useContext(ChatContext);

  if (!chatContext) {
    throw new Error('useChat debe ser usado dentro de ChatProvider');
  }

  const { currentChat, addMessage } = chatContext;

  const sendMessage = useCallback(
    (content: string) => {
      if (!currentChat || !content.trim()) return;

      const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');

      addMessage({
        id: Date.now().toString(),
        senderId: currentUser.id,
        senderName: currentUser.name,
        receiverId: currentChat.userId,
        content: content.trim(),
        timestamp: new Date(),
        read: false
      });

      socketService.emit('message:send', {
        to: currentChat.userId,
        content: content.trim()
      });

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
    handleActivity
  };
};
