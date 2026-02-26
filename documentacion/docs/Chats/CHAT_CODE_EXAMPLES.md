# 💻 Ejemplos de Código del Chat

## 1. BOTÓN FLOTANTE (ChatFloatingButton.tsx)

```tsx
import React, { useContext } from 'react';
import { ChatContext } from './ChatContext';

export const ChatFloatingButton: React.FC = () => {
  const { unreadCount, openContactsModal } = useContext(ChatContext);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botón */}
      <button
        onClick={openContactsModal}
        className="
          w-14 h-14 rounded-full
          bg-blue-500 hover:bg-blue-600
          text-white shadow-lg
          flex items-center justify-center
          transition-all duration-200
          hover:scale-110
          animate-pulse-on-message
        "
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
        </svg>
      </button>

      {/* Badge con contador */}
      {unreadCount > 0 && (
        <div className="
          absolute -top-2 -right-2
          bg-red-500 text-white
          rounded-full w-6 h-6
          flex items-center justify-center
          text-xs font-bold
          animate-bounce
        ">
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </div>
  );
};
```

---

## 2. MODAL DE CONTACTOS (ChatContactsModal.tsx)

```tsx
import React, { useContext, useState } from 'react';
import { ChatContext } from './ChatContext';

export const ChatContactsModal: React.FC = () => {
  const { 
    isContactsModalOpen, 
    closeContactsModal, 
    activeUsers, 
    openChat 
  } = useContext(ChatContext);
  
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = activeUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '🟢';
      case 'inactive': return '🟡';
      case 'offline': return '🔴';
      default: return '⚪';
    }
  };

  if (!isContactsModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="
        bg-white rounded-lg shadow-xl
        w-80 h-96
        flex flex-col
        animate-scale-in
      ">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">Mensajes</h2>
          <button
            onClick={closeContactsModal}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              w-full px-3 py-2
              border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          />
        </div>

        {/* Lista de usuarios */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map(user => (
            <button
              key={user.id}
              onClick={() => {
                openChat(user.id);
                closeContactsModal();
              }}
              className="
                w-full px-4 py-3
                hover:bg-gray-100
                border-b text-left
                transition-colors
              "
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.role}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span>{getStatusColor(user.status)}</span>
                  {user.unreadCount > 0 && (
                    <span className="
                      bg-red-500 text-white
                      rounded-full w-5 h-5
                      flex items-center justify-center
                      text-xs font-bold
                    ">
                      {user.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## 3. VENTANA DE CHAT (ChatWindow.tsx)

```tsx
import React, { useContext, useRef, useEffect } from 'react';
import { ChatContext } from './ChatContext';
import { MessagesList } from './MessagesList';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';

export const ChatWindow: React.FC = () => {
  const {
    currentChat,
    currentUser,
    messages,
    isTyping,
    closeChat,
    sendMessage,
    markAsRead
  } = useContext(ChatContext);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Marcar como leído cuando abre el chat
  useEffect(() => {
    if (currentChat) {
      markAsRead(currentChat.userId);
    }
  }, [currentChat]);

  if (!currentChat) return null;

  const otherUser = currentChat.otherUser;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="
        bg-white rounded-lg shadow-xl
        w-96 h-96
        flex flex-col
        animate-slide-up
      ">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {otherUser.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold">{otherUser.name}</div>
              <div className="text-xs text-gray-500">
                {otherUser.status === 'online' ? '🟢 Online' : '🔴 Offline'}
              </div>
            </div>
          </div>
          <button
            onClick={closeChat}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <MessagesList messages={messages} currentUserId={currentUser.id} />
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput onSendMessage={sendMessage} />
      </div>
    </div>
  );
};
```

---

## 4. MENSAJE INDIVIDUAL (Message.tsx)

```tsx
import React from 'react';

interface MessageProps {
  content: string;
  timestamp: Date;
  isOwn: boolean;
  read: boolean;
}

export const Message: React.FC<MessageProps> = ({
  content,
  timestamp,
  isOwn,
  read
}) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-xs px-4 py-2 rounded-lg
        ${isOwn 
          ? 'bg-blue-500 text-white rounded-br-none' 
          : 'bg-gray-200 text-gray-900 rounded-bl-none'
        }
      `}>
        <p className="break-words">{content}</p>
        <div className={`
          text-xs mt-1
          ${isOwn ? 'text-blue-100' : 'text-gray-500'}
          flex items-center gap-1
        `}>
          <span>{formatTime(timestamp)}</span>
          {isOwn && (
            <span>{read ? '✓✓' : '✓'}</span>
          )}
        </div>
      </div>
    </div>
  );
};
```

---

## 5. INPUT DE CHAT (ChatInput.tsx)

```tsx
import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

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

  return (
    <div className="border-t p-4 flex gap-2">
      <button className="text-gray-500 hover:text-gray-700">
        📎
      </button>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Escribe tu mensaje..."
        className="
          flex-1 px-3 py-2
          border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500
        "
      />
      <button
        onClick={handleSend}
        disabled={!message.trim()}
        className="
          text-blue-500 hover:text-blue-600
          disabled:text-gray-300
          transition-colors
        "
      >
        ➤
      </button>
    </div>
  );
};
```

---

## 6. NOTIFICACIÓN TOAST (ChatNotification.tsx)

```tsx
import React, { useEffect } from 'react';

interface ChatNotificationProps {
  userName: string;
  messagePreview: string;
  onClose: () => void;
  onClick: () => void;
}

export const ChatNotification: React.FC<ChatNotificationProps> = ({
  userName,
  messagePreview,
  onClose,
  onClick
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      onClick={onClick}
      className="
        fixed top-4 right-4 z-50
        bg-white rounded-lg shadow-lg
        p-4 max-w-sm
        cursor-pointer
        hover:shadow-xl
        transition-shadow
        animate-slide-in-right
      "
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">💬</div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{userName}</div>
          <div className="text-sm text-gray-600 truncate">
            {messagePreview}
          </div>
          <div className="text-xs text-gray-400 mt-1">Hace 2 segundos</div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
```

---

## 7. INDICADOR DE ESCRITURA (TypingIndicator.tsx)

```tsx
import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-1 text-gray-500 text-sm">
      <span>Está escribiendo</span>
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
      </div>
    </div>
  );
};
```

---

## 8. TAILWIND ANIMATIONS (tailwind.config.js)

```js
module.exports = {
  theme: {
    extend: {
      animation: {
        'pulse-on-message': 'pulse-message 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scale-in': 'scale-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
      },
      keyframes: {
        'pulse-message': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(400px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
};
```

