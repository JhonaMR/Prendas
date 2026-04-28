import React from 'react';

interface TypingIndicatorProps {
  isDark?: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isDark = false }) => {
  return (
    <div className={`flex items-center gap-1 text-sm mb-3 transition-colors ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
      <span>Está escribiendo</span>
      <div className="flex gap-1">
        <span
          className={`w-2 h-2 rounded-full animate-bounce transition-colors ${isDark ? 'bg-gray-400' : 'bg-gray-400'}`}
          style={{ animationDelay: '0s' }}
        ></span>
        <span
          className={`w-2 h-2 rounded-full animate-bounce transition-colors ${isDark ? 'bg-gray-400' : 'bg-gray-400'}`}
          style={{ animationDelay: '0.1s' }}
        ></span>
        <span
          className={`w-2 h-2 rounded-full animate-bounce transition-colors ${isDark ? 'bg-gray-400' : 'bg-gray-400'}`}
          style={{ animationDelay: '0.2s' }}
        ></span>
      </div>
    </div>
  );
};
