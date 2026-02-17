/**
 * AuthContext - Contexto de autenticación
 * Proporciona usuario, permisos y estado de sesión
 */

import React, { createContext, useCallback, useMemo, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';

export interface AuthContextType {
  user: User | null;
  permissions: string[];
  isAuthenticated: boolean;
  login: (credentials: { loginCode: string; pin: string }) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider - Proveedor del contexto de autenticación
 * Gestiona el estado de autenticación del usuario
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);

  // Determinar permisos basados en el rol del usuario
  const permissions = useMemo(() => {
    if (!user) return [];
    
    const basePermissions = ['view:dashboard', 'view:profile'];
    
    if (user.role === UserRole.ADMIN) {
      return [
        ...basePermissions,
        'manage:users',
        'manage:clients',
        'manage:sellers',
        'manage:confeccionistas',
        'manage:references',
        'manage:orders',
        'manage:deliveryDates',
        'view:audit',
        'manage:cache'
      ];
    }
    
    return basePermissions;
  }, [user]);

  // Verificar si el usuario está autenticado
  const isAuthenticated = useMemo(() => user !== null, [user]);

  // Función para hacer login
  const login = useCallback(async (credentials: { loginCode: string; pin: string }) => {
    try {
      // Aquí iría la llamada a la API
      // Por ahora, simulamos un login exitoso
      const mockUser: User = {
        id: '1',
        name: 'Admin User',
        loginCode: credentials.loginCode,
        pin: credentials.pin,
        role: UserRole.ADMIN
      };
      setUserState(mockUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  // Función para hacer logout
  const logout = useCallback(() => {
    setUserState(null);
  }, []);

  // Función para verificar si el usuario tiene un permiso específico
  const hasPermission = useCallback((permission: string): boolean => {
    return permissions.includes(permission);
  }, [permissions]);

  // Función para establecer el usuario
  const setUser = useCallback((newUser: User | null) => {
    setUserState(newUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      permissions,
      isAuthenticated,
      login,
      logout,
      hasPermission,
      setUser
    }),
    [user, permissions, isAuthenticated, login, logout, hasPermission, setUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
