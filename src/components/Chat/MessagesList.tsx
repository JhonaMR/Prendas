import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../../context/ChatContext';
import { Message } from './Message';

interface MessagesListProps {
  messages: ChatMessage[];
  currentUserId: string;
}

export const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  currentUserId
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-2 bg-[#f8fafc]/50">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3 opacity-70">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
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
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
