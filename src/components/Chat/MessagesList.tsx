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
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p className="text-sm">No hay mensajes aún</p>
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
