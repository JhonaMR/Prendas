/**
 * Utilidad para detectar la instancia actual (Plow o Melas)
 * Se usa para mostrar solo los backups de la instancia correspondiente
 */

export type Instance = 'plow' | 'melas';

/**
 * Detecta la instancia actual basada en el puerto o la URL
 */
export function detectInstance(): Instance {
  // Intentar obtener del puerto
  const port = window.location.port;
  
  if (port === '3000' || port === '5173' || port === '5175') {
    return 'plow';
  } else if (port === '3001' || port === '5174') {
    return 'melas';
  }
  
  // Fallback: intentar obtener del hostname
  const hostname = window.location.hostname;
  if (hostname.includes('melas')) {
    return 'melas';
  }
  
  // Default a plow
  return 'plow';
}

/**
 * Obtiene el nombre legible de la instancia
 */
export function getInstanceName(instance: Instance): string {
  return instance === 'plow' ? 'Plow' : 'Melas';
}

/**
 * Obtiene el color de la instancia para UI
 */
export function getInstanceColor(instance: Instance): string {
  return instance === 'plow' ? '#3b82f6' : '#8b5cf6';
}

/**
 * Obtiene el puerto del backend para la instancia
 */
export function getBackendPort(instance: Instance): number {
  return instance === 'plow' ? 3000 : 3001;
}

/**
 * Obtiene el puerto del frontend para la instancia
 */
export function getFrontendPort(instance: Instance): number {
  return instance === 'plow' ? 5173 : 5174;
}
