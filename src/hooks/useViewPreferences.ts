import { useState, useEffect } from 'react';

interface ViewPreferences {
  viewOrder: string[];
}

// Obtener URL base de la API dinámicamente
// Usa window.API_CONFIG como fuente de verdad (igual que api.ts y config.js)
function getApiUrl(): string {
  // Usar window.API_CONFIG si está disponible (fuente de verdad del sistema)
  if (typeof window !== 'undefined' && window.API_CONFIG?.getApiUrl) {
    const configUrl = window.API_CONFIG.getApiUrl();
    console.log('📍 Usando window.API_CONFIG:', configUrl);
    return configUrl;
  }
  
  // Fallback: construir URL basada en el hostname/puerto actual
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // IP de red o nombre de equipo (no localhost)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const backendPort = (port === '5174' || port === '3001') ? '3001' : '3000';
      return `${protocol}//${hostname}:${backendPort}/api`;
    }
    
    // localhost: mapear puerto frontend -> puerto backend
    if (port === '5173' || port === '3000' || port === '') {
      return 'https://localhost:3000/api'; // Plow
    } else if (port === '5174' || port === '3001') {
      return 'https://localhost:3001/api'; // Melas
    } else if (port === '5175' || port === '5000') {
      return 'http://localhost:5000/api';  // Dev local
    }
  }
  
  return 'https://localhost:3000/api';
}

export const useViewPreferences = () => {
  const [preferences, setPreferences] = useState<ViewPreferences>({ viewOrder: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener token del localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  };

  // Obtener preferencias del usuario
  const fetchPreferences = async () => {
    const token = getToken();
    if (!token) {
      console.warn('No hay token disponible para obtener preferencias');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const apiUrl = getApiUrl();
      console.log('📍 API URL detectada:', apiUrl);
      console.log('Obteniendo preferencias del servidor');
      const response = await fetch(`${apiUrl}/user/preferences`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Respuesta del servidor:', response.status);

      if (!response.ok) {
        throw new Error('Error al obtener preferencias');
      }

      const data = await response.json();
      console.log('Preferencias obtenidas:', data);
      setPreferences(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  // Guardar preferencias del usuario
  const savePreferences = async (viewOrder: string[]) => {
    const token = getToken();
    if (!token) {
      console.error('No hay token disponible');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const apiUrl = getApiUrl();
      console.log('📍 API URL detectada:', apiUrl);
      console.log('Enviando preferencias al servidor:', viewOrder);
      const response = await fetch(`${apiUrl}/user/preferences`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ viewOrder })
      });

      console.log('Respuesta del servidor:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData);
        throw new Error('Error al guardar preferencias');
      }

      const data = await response.json();
      console.log('Datos recibidos:', data);
      setPreferences(data.data);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error saving preferences:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cargar preferencias al montar el componente
  useEffect(() => {
    fetchPreferences();
  }, []);

  return {
    preferences,
    loading,
    error,
    savePreferences,
    fetchPreferences
  };
};
