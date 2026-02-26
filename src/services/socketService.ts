/**
 * Socket.io Service - Maneja la conexión WebSocket
 * 
 * Proporciona métodos para conectar, desconectar y comunicarse
 * con el servidor a través de Socket.io
 */

import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const socketService = {
  /**
   * Conectar a Socket.io
   */
  connect: (token: string) => {
    if (socket?.connected) {
      console.log('⚠️ Socket ya está conectado');
      return socket;
    }

    // Obtener la URL del servidor desde window.API_CONFIG o construirla
    let url: string;
    
    if (window.API_CONFIG?.getApiUrl) {
      // Usar la misma URL que para la API, pero sin /api
      const apiUrl = window.API_CONFIG.getApiUrl();
      url = apiUrl.replace('/api', '');
    } else {
      // Fallback: construir URL manualmente
      const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
      const hostname = window.location.hostname;
      const port = 3000;
      url = `${protocol}://${hostname}:${port}`;
    }

    console.log(`🔌 Conectando a Socket.io en ${url}`);

    socket = io(url, {
      auth: {
        token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('✅ Conectado a Socket.io');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión Socket.io:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Desconectado de Socket.io:', reason);
    });

    return socket;
  },

  /**
   * Desconectar de Socket.io
   */
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      console.log('🔌 Socket desconectado');
    }
  },

  /**
   * Obtener la instancia del socket
   */
  getSocket: (): Socket | null => socket,

  /**
   * Escuchar un evento
   */
  on: (event: string, callback: (...args: any[]) => void) => {
    if (socket) {
      socket.on(event, callback);
    } else {
      console.warn(`⚠️ Socket no está conectado. No se puede escuchar ${event}`);
    }
  },

  /**
   * Emitir un evento
   */
  emit: (event: string, data?: any) => {
    if (socket?.connected) {
      socket.emit(event, data);
    } else {
      console.warn(`⚠️ Socket no está conectado. No se puede emitir ${event}`);
    }
  },

  /**
   * Dejar de escuchar un evento
   */
  off: (event: string) => {
    if (socket) {
      socket.off(event);
    }
  },

  /**
   * Escuchar un evento una sola vez
   */
  once: (event: string, callback: (...args: any[]) => void) => {
    if (socket) {
      socket.once(event, callback);
    }
  },

  /**
   * Verificar si está conectado
   */
  isConnected: (): boolean => {
    return socket?.connected || false;
  }
};
