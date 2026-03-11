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
        fixed bottom-6 right-6 z-50
        bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100
        w-[22rem] h-[32rem]
        flex flex-col
        overflow-hidden
        animate-scale-in
      "
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-lg font-bold ring-2 ring-white/30 shadow-inner">
            {currentChat.userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-white text-sm tracking-wide">
              {currentChat.userName}
            </div>
            <div className="text-xs text-blue-100 flex items-center gap-1.5 opacity-90">
              <span className="text-[10px]">{getStatusIcon(otherUser?.status)}</span>
              <span className="font-medium">
                {otherUser?.status === 'online'
                  ? 'En línea'
                  : otherUser?.status === 'inactive'
                    ? 'Ausente'
                    : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={closeChat}
          className="
            text-white/70 hover:text-white hover:bg-white/10
            transition-all duration-200 rounded-full w-8 h-8 flex items-center justify-center
            text-lg focus:outline-none focus:ring-2 focus:ring-white/50
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
