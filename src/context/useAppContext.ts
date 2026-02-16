/**
 * Hook personalizado para acceder al AppContext
 * Proporciona acceso seguro al estado global
 */

import { useContext } from 'react';
import { AppContext, AppContextType } from './AppContext';

/**
 * Hook para acceder al contexto de la aplicación
 * Lanza error si se usa fuera del AppProvider
 */
export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error(
      'useAppContext debe ser usado dentro de un AppProvider. ' +
      'Asegúrate de envolver tu aplicación con <AppProvider>'
    );
  }
  
  return context;
}

/**
 * Hook para acceder solo al estado (read-only)
 */
export function useAppState() {
  const { state } = useAppContext();
  return state;
}

/**
 * Hook para acceder solo al dispatch
 */
export function useAppDispatch() {
  const { dispatch } = useAppContext();
  return dispatch;
}
