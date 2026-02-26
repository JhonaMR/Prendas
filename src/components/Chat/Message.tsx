import React from 'react';
import { ChatMessage } from '../../context/ChatContext';

interface MessageProps {
  message: ChatMessage;
  isOwn: boolean;
}

export const Message: React.FC<MessageProps> = ({ message, isOwn }) => {
  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 animate-message-pop`}>
      <div
        className={`
          max-w-xs px-4 py-2 rounded-lg
          ${
            isOwn
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-gray-200 text-gray-900 rounded-bl-none'
          }
        `}
      >
        <p className="break-words text-sm">{message.content}</p>
        <div
          className={`
            text-xs mt-1 flex items-center gap-1
            ${isOwn ? 'text-blue-100' : 'text-gray-500'}
          `}
        >
          <span>{formatTime(message.timestamp)}</span>
          {isOwn && <span>{message.read ? '✓✓' : '✓'}</span>}
        </div>
      </div>
    </div>
  );
};
