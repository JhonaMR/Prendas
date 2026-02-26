import React, { useContext, useEffect } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { MessagesList } from './MessagesList';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { useChat } from '../../hooks/useChat';

export const ChatWindow: React.FC = () => {
  const {
    currentChat,
    messages,
    isTyping,
    closeChat,
    sendMessage,
    markAsRead,
    activeUsers,
    markUserRead
  } = useChat();

  // Marcar como leído cuando abre el chat
  useEffect(() => {
    if (currentChat) {
      markAsRead(currentChat.userId);
      markUserRead(currentChat.userId);
    }
  }, [currentChat, markAsRead, markUserRead]);

  if (!currentChat) return null;

  // Obtener información del usuario
  const otherUser = activeUsers.find(u => u.id === currentChat.userId);
  const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
  const currentUserId = localStorage.getItem('current_user_id') || currentUser.id || '';

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'online':
        return '🟢';
      case 'inactive':
        return '🟡';
      case 'offline':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <div
      className="
        fixed bottom-4 right-4 z-50
        bg-white rounded-lg shadow-xl
        w-96 h-96
        flex flex-col
        animate-scale-in
      "
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
            {currentChat.userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-slate-800 text-sm">
              {currentChat.userName}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <span>{getStatusIcon(otherUser?.status)}</span>
              <span>
                {otherUser?.status === 'online'
                  ? 'Online'
                  : otherUser?.status === 'inactive'
                  ? 'Inactivo'
                  : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={closeChat}
          className="
            text-gray-500 hover:text-gray-700
            transition-colors
            text-xl
          "
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <MessagesList messages={messages} currentUserId={currentUserId} />

      {/* Typing indicator */}
      {isTyping && (
        <div className="px-4">
          <TypingIndicator />
        </div>
      )}

      {/* Input */}
      <ChatInput onSendMessage={sendMessage} />
    </div>
  );
};
