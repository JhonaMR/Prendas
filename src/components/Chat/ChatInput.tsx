import React, { useState, useContext, useRef, useEffect } from 'react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
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
    <div className="p-4 bg-white border-t border-gray-100 relative rounded-b-2xl">
      <div className="flex items-center relative bg-gray-50 p-1.5 rounded-full border border-gray-200/60 shadow-inner focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-300 transition-all">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="
            p-2 w-10 h-10
            text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 rounded-full
            transition-all
            text-xl flex items-center justify-center flex-shrink-0
          "
          title="Agregar emoji"
        >
          😊
        </button>

        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="Escribe tu mensaje..."
          className="
            flex-1 bg-transparent px-3 py-2
            focus:outline-none focus:ring-0
            text-[14px] text-gray-700 placeholder-gray-400
            min-w-0
          "
        />

        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className={`
            p-2 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0
            transition-all duration-200 ml-1
            ${message.trim()
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md shadow-blue-500/30 text-white transform hover:scale-105 active:scale-95'
              : 'bg-gray-200 text-white cursor-not-allowed'}
          `}
          title="Enviar mensaje"
        >
          <span className="rotate-0 text-[15px] font-bold">➤</span>
        </button>
      </div>

      {/* Quick emojis shortcuts */}
      <div className="flex gap-3 mt-2 px-1 justify-center">
        {['👍', '❤️', '😂', '🔥', '👏'].map(emoji => (
          <button 
            key={emoji}
            onClick={() => onSendMessage(emoji)}
            className="text-lg hover:scale-125 transition-transform duration-200 opacity-70 hover:opacity-100 grayscale hover:grayscale-0"
          >
            {emoji}
          </button>
        ))}
      </div>

      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-full right-0 mb-4 z-50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden border border-gray-100 bg-white"
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            autoFocusSearch={false}
            theme={Theme.LIGHT}
            searchPlaceholder="Buscar emoji..."
            width={320}
            height={360}
          />
        </div>
      )}
    </div>
  );
};
