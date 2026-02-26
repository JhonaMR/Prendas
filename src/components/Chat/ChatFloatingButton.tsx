import React, { useContext } from 'react';
import { useChat } from '../../hooks/useChat';

export const ChatFloatingButton: React.FC = () => {
  const { unreadCount, openContactsModal } = useChat();

  return (
    <button
      onClick={openContactsModal}
      className="
        fixed bottom-4 right-4 z-50
        w-14 h-14 rounded-full
        bg-blue-500 hover:bg-blue-600
        text-white shadow-lg
        flex items-center justify-center
        transition-all duration-200
        hover:scale-110
        active:scale-95
      "
      title="Abrir chat"
    >
      {/* Chat icon */}
      <svg
        className="w-6 h-6"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
        <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
      </svg>

      {/* Badge with unread count */}
      {unreadCount > 0 && (
        <div
          className="
            absolute -top-2 -right-2
            bg-red-500 text-white
            rounded-full w-6 h-6
            flex items-center justify-center
            text-xs font-bold
            animate-bounce
            shadow-md
            animate-pulse-glow
          "
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </button>
  );
};
