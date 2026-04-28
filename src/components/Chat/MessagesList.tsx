import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../../context/ChatContext';
import { Message } from './Message';

interface MessagesListProps {
  messages: ChatMessage[];
  currentUserId: string;
  isDark?: boolean;
}

export const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  currentUserId,
  isDark = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={`flex-1 overflow-y-auto p-5 space-y-2 transition-colors ${isDark ? 'bg-gray-50' : 'bg-[#f8fafc]/50'}`}>
      {messages.length === 0 ? (
        <div className={`flex flex-col items-center justify-center h-full space-y-3 opacity-70 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-gray-100' : 'bg-blue-50'}`}>
            <span className="text-2xl">👋</span>
          </div>
          <p className="text-sm font-medium">Inicia una conversación</p>
        </div>
      ) : (
        messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUserId}
            isDark={isDark}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
