/**
 * Chat Service - Maneja todas las llamadas a la API del chat
 */

const getApiUrl = () => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = 3000;
  return `${protocol}//${hostname}:${port}/api`;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const chatService = {
  /**
   * Obtener usuarios activos
   */
  async getActiveUsers() {
    try {
      const response = await fetch(`${getApiUrl()}/chat/active-users`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error obteniendo usuarios activos:', error);
      return [];
    }
  },

  /**
   * Obtener historial de mensajes con un usuario
   */
  async getMessages(userId: string) {
    try {
      const response = await fetch(`${getApiUrl()}/chat/messages/${userId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error obteniendo mensajes:', error);
      return [];
    }
  },

  /**
   * Enviar un mensaje
   */
  async sendMessage(receiverId: string, content: string) {
    try {
      const response = await fetch(`${getApiUrl()}/chat/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          receiverId,
          content
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      return null;
    }
  },

  /**
   * Marcar mensajes como leídos
   */
  async markAsRead(userId: string) {
    try {
      const response = await fetch(`${getApiUrl()}/chat/messages/${userId}/read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error marcando como leído:', error);
      return false;
    }
  },

  /**
   * Obtener mensajes no leídos
   */
  async getUnreadMessages() {
    try {
      const response = await fetch(`${getApiUrl()}/chat/unread-messages`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || { unreadCount: 0, conversations: [] };
    } catch (error) {
      console.error('Error obteniendo mensajes no leídos:', error);
      return { unreadCount: 0, conversations: [] };
    }
  }
};
