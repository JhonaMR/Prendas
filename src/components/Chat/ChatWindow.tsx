import React, { useEffect } from 'react';
import { chatService } from '../../services/chatService';
import { MessagesList } from './MessagesList';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { useChat } from '../../hooks/useChat';
import { useDarkMode } from '../../context/DarkModeContext';

export const ChatWindow: React.FC = () => {
  const { isDark } = useDarkMode();
  const {
    currentChat,
    messages,
    isTyping,
    closeChat,
    sendMessage,
    markAsRead,
    setMessages,
    activeUsers,
    markUserRead,
    clearPending
  } = useChat();

  // Cargar mensajes al abrir chat
  useEffect(() => {
    if (currentChat) {
      chatService.getMessages(currentChat.userId).then(setMessages).catch(console.error);
    }
  }, [currentChat]);

  // Marcar como leído cuando abre el chat
  useEffect(() => {
    if (currentChat) {
      markAsRead(currentChat.userId);
      markUserRead(currentChat.userId);
      clearPending(currentChat.userId);
    }
  }, [currentChat, markAsRead, markUserRead, clearPending]);

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
      className={`
        fixed bottom-6 right-6 z-50
        rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border
        w-[22rem] h-[32rem]
        flex flex-col
        overflow-visible
        animate-scale-in
        transition-colors
        ${isDark 
          ? 'bg-white/95 backdrop-blur-md border-gray-100' 
          : 'bg-white/95 backdrop-blur-md border-gray-100'
        }
      `}
    >
      {/* Header */}
      <div className={`flex justify-between items-center p-4 border-b shadow-sm relative z-10 rounded-t-2xl transition-colors ${isDark ? 'border-violet-200 bg-gradient-to-r from-violet-600 to-purple-600' : 'border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ring-2 ring-white/30 shadow-inner transition-colors ${isDark ? 'bg-white/20 text-white' : 'bg-white/20 text-white'}`}>
            {currentChat.userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className={`font-semibold text-sm tracking-wide transition-colors text-white`}>
              {currentChat.userName}
            </div>
            <div className={`text-xs flex items-center gap-1.5 opacity-90 transition-colors text-white/80`}>
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
          className={`
            transition-all duration-200 rounded-full w-8 h-8 flex items-center justify-center
            text-lg focus:outline-none focus:ring-2
            text-white/70 hover:text-white hover:bg-white/10 focus:ring-white/50
          `}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <MessagesList messages={messages} currentUserId={currentUserId} isDark={isDark} />

      {/* Typing indicator */}
      {isTyping && (
        <div className="px-4">
          <TypingIndicator isDark={isDark} />
        </div>
      )}

      {/* Input */}
      <ChatInput onSendMessage={sendMessage} isDark={isDark} />
    </div>
  );
};
