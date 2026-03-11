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
          fixed bottom-6 right-6 z-50
          bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100
          w-[20rem] h-[30rem]
          flex flex-col
          overflow-hidden
          animate-scale-in
        "
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm relative z-10">
          <h2 className="text-lg font-bold text-white tracking-wide">Contactos</h2>
          <button
            onClick={closeContactsModal}
            className="
              text-white/70 hover:text-white hover:bg-white/10
              transition-all duration-200 rounded-full w-8 h-8 flex items-center justify-center
              text-lg focus:outline-none focus:ring-2 focus:ring-white/50
            "
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative flex items-center border border-gray-200 rounded-full bg-white shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-400 transition-all">
            <span className="pl-3 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar contacto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                w-full pl-2 pr-4 py-2 bg-transparent
                focus:outline-none
                text-[14px] text-gray-700 placeholder-gray-400
              "
            />
          </div>
        </div>

        {/* Users list */}
        <div className="flex-1 overflow-y-auto bg-[#f8fafc]/30 p-2 space-y-1">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3 opacity-70 pt-8">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="text-xl">🔍</span>
              </div>
              <p className="text-sm font-medium">No se encontraron usuarios</p>
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
                  w-full p-3 rounded-xl
                  hover:bg-white hover:shadow-sm hover:border-gray-100 border border-transparent
                  text-left
                  transition-all duration-200
                  flex items-center gap-3
                  group
                "
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center text-blue-700 font-bold shadow-inner ring-1 ring-black/5 flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 truncate text-[14px] group-hover:text-indigo-700 transition-colors">
                    {user.name}
                  </div>
                  <div className="text-[12px] text-gray-400 truncate flex items-center gap-1.5 font-medium mt-0.5">
                    <span className="text-[8px]">{getStatusIcon(user.status)}</span>
                    {user.role}
                  </div>
                </div>
                <div className="flex items-center flex-shrink-0 mr-1">
                  {user.hasUnreadMessages && (
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
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
