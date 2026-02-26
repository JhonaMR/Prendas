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
        bg-white rounded-lg shadow-2xl
        p-4 max-w-sm
        cursor-pointer
        hover:shadow-xl
        transition-all duration-300
        animate-slide-in-right
        border-l-4 border-blue-500
        hover:scale-105
      "
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0 animate-pulse">💬</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 text-sm">{userName}</div>
          <div className="text-xs text-gray-600 truncate mt-1">{messagePreview}</div>
          <div className="text-xs text-gray-400 mt-2">Nuevo mensaje</div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0 hover:scale-125 transition-transform"
        >
          ✕
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 animate-shrink-width"></div>
      </div>
    </div>
  );
};
