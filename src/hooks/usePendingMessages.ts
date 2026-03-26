/**
 * usePendingMessages
 * 
 * Hook independiente que carga y gestiona los mensajes pendientes
 * al iniciar sesión. No depende del estado de activeUsers.
 * 
 * Expone:
 * - pendingUserIds: Set de IDs de usuarios con mensajes sin leer
 * - totalPending: número total de mensajes sin leer
 * - clearPending(userId): marcar como leído al abrir un chat
 * - reload: refrescar desde el backend
 */

import { useState, useCallback, useEffect } from 'react';
import { chatService } from '../services/chatService';

interface PendingConversation {
  userId: string;
  userName: string;
  unreadCount: number;
}

export const usePendingMessages = () => {
  const [pendingConversations, setPendingConversations] = useState<PendingConversation[]>([]);
  const [totalPending, setTotalPending] = useState(0);

  const reload = useCallback(async () => {
    try {
      const data = await chatService.getUnreadMessages();
      if (data.unreadCount > 0) {
        setPendingConversations(
          data.conversations.map((c: { userId: string; userName: string; unreadCount: number }) => ({
            userId: c.userId.toString(),
            userName: c.userName,
            unreadCount: Number(c.unreadCount)
          }))
        );
        setTotalPending(data.unreadCount);
      } else {
        setPendingConversations([]);
        setTotalPending(0);
      }
    } catch (e) {
      console.error('Error cargando mensajes pendientes:', e);
    }
  }, []);

  // Cargar al montar
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) reload();
  }, [reload]);

  const clearPending = useCallback((userId: string) => {
    setPendingConversations(prev => {
      const conv = prev.find(c => c.userId === userId);
      const removed = conv?.unreadCount ?? 0;
      setTotalPending(t => Math.max(0, t - removed));
      return prev.filter(c => c.userId !== userId);
    });
  }, []);

  const addPending = useCallback((userId: string, userName: string) => {
    setPendingConversations(prev => {
      const existing = prev.find(c => c.userId === userId);
      if (existing) {
        return prev.map(c =>
          c.userId === userId ? { ...c, unreadCount: c.unreadCount + 1 } : c
        );
      }
      return [...prev, { userId, userName, unreadCount: 1 }];
    });
    setTotalPending(t => t + 1);
  }, []);

  const hasPending = useCallback(
    (userId: string) => pendingConversations.some(c => c.userId === userId),
    [pendingConversations]
  );

  return {
    pendingConversations,
    totalPending,
    hasPending,
    clearPending,
    addPending,
    reload
  };
};
