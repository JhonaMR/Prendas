import React, { useState, useContext } from 'react';
import { ChatContext } from '../../context/ChatContext';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const { currentChat } = useContext(ChatContext)!;

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    // Emitir evento de typing
    if (currentChat) {
      // Aquí se emitiría el evento de typing
    }
  };

  return (
    <div className="border-t p-3 flex gap-2 bg-gray-50">
      <input
        type="text"
        value={message}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder="Escribe tu mensaje..."
        className="
          flex-1 px-3 py-2
          border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500
          focus:border-transparent
          text-sm
        "
      />
      <button
        onClick={handleSend}
        disabled={!message.trim()}
        className="
          text-blue-500 hover:text-blue-600
          disabled:text-gray-300
          transition-colors
          text-lg
        "
        title="Enviar mensaje"
      >
        ➤
      </button>
    </div>
  );
};
