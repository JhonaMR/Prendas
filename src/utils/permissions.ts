/**
 * 🔐 UTILIDADES DE PERMISOS - FRONTEND
 * 
 * Funciones para verificar permisos de usuarios basados en su rol
 */

import { User, UserRole } from '../types';

/**
 * Verificar si un usuario puede editar
 */
export function canEdit(user: User | null): boolean {
  if (!user) return false;
  return user.role === UserRole.ADMIN;
}

/**
 * Verificar si un usuario puede crear
 */
export function canCreate(user: User | null): boolean {
  if (!user) return false;
  return user.role === UserRole.ADMIN;
}

/**
 * Verificar si un usuario puede eliminar
 */
export function canDelete(user: User | null): boolean {
  if (!user) return false;
  return user.role === UserRole.ADMIN;
}

/**
 * Verificar si un usuario es observador
 */
export function isObserver(user: User | null): boolean {
  if (!user) return false;
  return user.role === UserRole.OBSERVER;
}

/**
 * Verificar si un usuario es admin
 */
export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  return user.role === UserRole.ADMIN;
}

/**
 * Verificar si un usuario es general
 */
export function isGeneral(user: User | null): boolean {
  if (!user) return false;
  return user.role === UserRole.GENERAL;
}

/**
 * Verificar si un usuario es diseñadora
 */
export function isDiseñadora(user: User | null): boolean {
  if (!user) return false;
  return user.role === UserRole.DISEÑADORA;
}

/**
 * Obtener el nivel de permiso
 */
export function getPermissionLevel(user: User | null): 'FULL' | 'READ_ONLY' | 'LIMITED' | 'NONE' {
  if (!user) return 'NONE';
  
  if (user.role === UserRole.ADMIN) return 'FULL';
  if (user.role === UserRole.OBSERVER) return 'READ_ONLY';
  if (user.role === UserRole.GENERAL) return 'LIMITED';
  if (user.role === UserRole.DISEÑADORA) return 'LIMITED';
  
  return 'NONE';
}
