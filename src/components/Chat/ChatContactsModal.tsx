import React, { useState } from 'react';
import { useChat } from '../../hooks/useChat';

export const ChatContactsModal: React.FC = () => {
  const {
    isContactsModalOpen,
    closeContactsModal,
    activeUsers,
    openChat
  } = useChat();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = activeUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return '🟢';
      case 'inactive':
        return '🟡';
      case 'offline':
        return '🔴';
      default:
        return '⚪';
    }
  };

  if (!isContactsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="
          fixed bottom-4 right-4 z-50
          bg-white rounded-lg shadow-xl
          w-80 h-96
          flex flex-col
          animate-scale-in
        "
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <h2 className="text-lg font-bold text-slate-800">Mensajes</h2>
          <button
            onClick={closeContactsModal}
            className="
              text-gray-500 hover:text-gray-700
              transition-colors
              text-xl
            "
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
              border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
              focus:border-transparent
              text-sm
            "
          />
        </div>

        {/* Users list */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p className="text-sm">No hay usuarios disponibles</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  openChat(user.id, user.name);
                  closeContactsModal();
                }}
                className="
                  w-full px-4 py-3
                  hover:bg-blue-50
                  border-b border-gray-100
                  text-left
                  transition-colors
                  flex items-center justify-between
                  group
                "
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user.role}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <span className="text-lg">{getStatusIcon(user.status)}</span>
                  {user.hasUnreadMessages && (
                    <span
                      className="
                        text-red-500
                        text-xl
                        animate-pulse
                        font-bold
                      "
                      title="Tiene mensajes sin leer"
                    >
                      *
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
