/**
 * AppContext - Contexto global de estado de la aplicación
 * Contiene todo el estado compartido entre componentes
 */

import React, { createContext, useReducer, ReactNode } from 'react';
import { AppState, User, UserRole } from '../types';

// Tipos de acciones para el reducer
export type AppAction = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_REFERENCES'; payload: any[] }
  | { type: 'SET_CLIENTS'; payload: any[] }
  | { type: 'SET_CONFECCIONISTAS'; payload: any[] }
  | { type: 'SET_SELLERS'; payload: any[] }
  | { type: 'SET_CORRERIAS'; payload: any[] }
  | { type: 'SET_RECEPTIONS'; payload: any[] }
  | { type: 'SET_RETURN_RECEPTIONS'; payload: any[] }
  | { type: 'SET_DISPATCHES'; payload: any[] }
  | { type: 'SET_ORDERS'; payload: any[] }
  | { type: 'SET_PRODUCTION_TRACKING'; payload: any[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' };

// Estado inicial
const initialState: AppState & { loading: boolean; error: string | null } = {
  users: [],
  references: [],
  clients: [],
  confeccionistas: [],
  sellers: [],
  correrias: [],
  receptions: [],
  returnReceptions: [],
  dispatches: [],
  orders: [],
  productionTracking: [],
  loading: false,
  error: null
};

// Reducer para manejar acciones
function appReducer(
  state: typeof initialState,
  action: AppAction
): typeof initialState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_REFERENCES':
      return { ...state, references: action.payload };
    case 'SET_CLIENTS':
      return { ...state, clients: action.payload };
    case 'SET_CONFECCIONISTAS':
      return { ...state, confeccionistas: action.payload };
    case 'SET_SELLERS':
      return { ...state, sellers: action.payload };
    case 'SET_CORRERIAS':
      return { ...state, correrias: action.payload };
    case 'SET_RECEPTIONS':
      return { ...state, receptions: action.payload };
    case 'SET_RETURN_RECEPTIONS':
      return { ...state, returnReceptions: action.payload };
    case 'SET_DISPATCHES':
      return { ...state, dispatches: action.payload };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'SET_PRODUCTION_TRACKING':
      return { ...state, productionTracking: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

// Tipo del contexto
export interface AppContextType {
  state: typeof initialState;
  dispatch: (action: AppAction) => void;
}

// Crear contexto
export const AppContext = createContext<AppContextType | undefined>(undefined);

// Props del provider
interface AppProviderProps {
  children: ReactNode;
}

/**
 * AppProvider - Proveedor del contexto global
 * Envuelve la aplicación y proporciona acceso al estado global
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
