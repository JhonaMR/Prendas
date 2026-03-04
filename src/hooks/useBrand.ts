/**
 * Hook para acceder a las variables de marca
 * Detecta automáticamente si es PLOW o MELAS
 */

declare global {
  interface Window {
    BRAND_CONFIG?: {
      name: string;
      short: string;
      color: string;
      description: string;
      isMelas: boolean;
      isPlow: boolean;
    };
  }
}

export function useBrand() {
  // Usar window.BRAND_CONFIG si está disponible, sino detectar por puerto
  if (window.BRAND_CONFIG) {
    return window.BRAND_CONFIG;
  }

  // Fallback: detectar por puerto
  const port = window.location.port;
  const isMelas = port === '5174' || port === '3001';

  return {
    name: isMelas ? 'Melas' : 'Plow',
    short: isMelas ? 'melas' : 'plow',
    color: isMelas ? '#ef4444' : '#3b82f6',
    description: isMelas ? 'Sistema de Gestión - Melas' : 'Sistema de Gestión - Plow',
    isPlow: !isMelas,
    isMelas: isMelas
  };
}
