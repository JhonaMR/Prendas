/**
 * Hook para manejar el cierre automático de sesiones
 * Escucha eventos de Socket.io para cerrar sesión
 */

import { useEffect } from 'react';
import { socketService } from '../services/socketService';

export function useSessionClose() {
  useEffect(() => {
    // Escuchar evento de cierre de sesión
    const handleSessionClose = (data: any) => {
      console.warn('🔐 Evento de cierre de sesión recibido:', data);

      // Mostrar alerta
      alert(
        `⏰ ${data.message}\n\nTu sesión ha sido cerrada automáticamente.\nPor favor, vuelve a iniciar sesión.`
      );

      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');

      // Redirigir a login usando window.location
      // Esto recarga la página completamente y limpia todo
      window.location.href = '/login';
    };

    // Registrar listener
    socketService.on('SESSION_CLOSE_NOTIFICATION', handleSessionClose);

    // Cleanup
    return () => {
      socketService.off('SESSION_CLOSE_NOTIFICATION');
    };
  }, []);
}
