import { useState, useEffect } from 'react';

interface ViewPreferences {
  viewOrder: string[];
}

// Obtener URL base de la API
function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.API_CONFIG?.getApiUrl) {
    const apiUrl = window.API_CONFIG.getApiUrl();
    return apiUrl.replace('/api', '');
  }
  return `${typeof window !== 'undefined' ? window.location.protocol : 'http:'}//${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3000`;
}

const API_BASE_URL = `${getBaseUrl()}/api`;

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

      console.log('Obteniendo preferencias del servidor');
      const response = await fetch(`${API_BASE_URL}/user/preferences`, {
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

      console.log('Enviando preferencias al servidor:', viewOrder);
      const response = await fetch(`${API_BASE_URL}/user/preferences`, {
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
