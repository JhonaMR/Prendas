/**
 * 🔒 INTERCEPTOR DE API - VALIDACIÓN DE PERMISOS
 * 
 * Intercepta requests PUT, POST, DELETE para verificar permisos
 * Previene que usuarios no-admin realicen operaciones de edición
 */

import { User, UserRole } from '../types';
import { canEdit } from '../utils/permissions';

/**
 * Validar si el usuario puede realizar una operación
 */
export function validateEditPermission(user: User | null, method: string): boolean {
  if (!user) return false;
  
  // Solo permitir GET y HEAD sin restricciones
  if (method === 'GET' || method === 'HEAD') {
    return true;
  }
  
  // Para PUT, POST, DELETE, solo admin puede
  if (method === 'PUT' || method === 'POST' || method === 'DELETE') {
    return canEdit(user);
  }
  
  return false;
}

/**
 * Obtener mensaje de error apropiado
 */
export function getPermissionErrorMessage(method: string): string {
  switch (method) {
    case 'POST':
      return 'No tienes permiso para crear recursos. Tu rol es de solo lectura';
    case 'PUT':
      return 'No tienes permiso para editar recursos. Tu rol es de solo lectura';
    case 'DELETE':
      return 'No tienes permiso para eliminar recursos. Tu rol es de solo lectura';
    default:
      return 'No tienes permiso para realizar esta acción';
  }
}

/**
 * Interceptor de fetch para validar permisos
 */
export function createFetchInterceptor(user: User | null) {
  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    const method = options.method || 'GET';
    
    // Validar permisos
    if (!validateEditPermission(user, method)) {
      // Retornar respuesta simulada de error 403
      return new Response(
        JSON.stringify({
          success: false,
          message: getPermissionErrorMessage(method)
        }),
        {
          status: 403,
          statusText: 'Forbidden',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Si tiene permisos, hacer el fetch normal
    return fetch(url, options);
  };
}
