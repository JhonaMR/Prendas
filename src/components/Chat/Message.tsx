import React from 'react';
import { ChatMessage } from '../../context/ChatContext';

interface MessageProps {
  message: ChatMessage;
  isOwn: boolean;
  isDark?: boolean;
}

export const Message: React.FC<MessageProps> = ({ message, isOwn, isDark = false }) => {
  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 animate-message-pop group`}>
      <div
        className={`
          max-w-[85%] px-4 py-2 rounded-2xl relative
          transition-all
          ${isOwn
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 rounded-br-sm'
            : 'bg-gray-100 text-gray-700 shadow-sm border border-gray-200 rounded-bl-sm'
          }
          hover:scale-[1.01]
        `}
      >
        <p className={`break-words text-[15px] leading-relaxed transition-colors ${isOwn ? 'text-white/95' : 'text-gray-700'}`}>
          {message.content}
        </p>
        <div
          className={`
            text-[10px] mt-1.5 flex items-center justify-end gap-1
            font-medium
            transition-colors
            ${isOwn 
              ? 'text-blue-100' 
              : 'text-gray-500'
            }
          `}
        >
          <span>{formatTime(message.timestamp)}</span>
          {isOwn && (
            <span className={message.read ? 'text-white' : 'text-blue-200'}>
              {message.read ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
