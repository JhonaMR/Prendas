import React, { useState, useContext, useRef, useEffect } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { ChatContext } from '../../context/ChatContext';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { currentChat } = useContext(ChatContext)!;
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      setShowEmojiPicker(false);
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

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  // Cerrar emoji picker cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showEmojiPicker]);

  return (
    <div className="border-t p-3 bg-gray-50">
      <div className="flex gap-2 relative">
        <input
          ref={inputRef}
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
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="
            px-3 py-2
            text-gray-600 hover:text-gray-800
            transition-colors
            text-lg
          "
          title="Agregar emoji"
        >
          😊
        </button>
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
      
      {showEmojiPicker && (
        <div 
          ref={emojiPickerRef}
          className="absolute bottom-full right-0 mb-2 z-50"
        >
          <EmojiPicker 
            onEmojiClick={handleEmojiClick}
            theme="light"
            height={400}
            width={350}
          />
        </div>
      )}
    </div>
  );
};
