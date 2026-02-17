/**
 * UIContext - Contexto de UI
 * Proporciona estado de modales, notificaciones y filtros
 */

import React, { createContext, useCallback, useMemo, useReducer, ReactNode } from 'react';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface UIContextType {
  modals: Record<string, boolean>;
  notifications: Notification[];
  filters: Record<string, any>;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  toggleModal: (modalId: string) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  setFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  getFilter: (key: string) => any;
}

type UIAction =
  | { type: 'OPEN_MODAL'; payload: string }
  | { type: 'CLOSE_MODAL'; payload: string }
  | { type: 'TOGGLE_MODAL'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_FILTER'; payload: { key: string; value: any } }
  | { type: 'CLEAR_FILTERS' };

interface UIState {
  modals: Record<string, boolean>;
  notifications: Notification[];
  filters: Record<string, any>;
}

const initialState: UIState = {
  modals: {},
  notifications: [],
  filters: {}
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'OPEN_MODAL':
      return {
        ...state,
        modals: { ...state.modals, [action.payload]: true }
      };
    case 'CLOSE_MODAL':
      return {
        ...state,
        modals: { ...state.modals, [action.payload]: false }
      };
    case 'TOGGLE_MODAL':
      return {
        ...state,
        modals: { ...state.modals, [action.payload]: !state.modals[action.payload] }
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, [action.payload.key]: action.payload.value }
      };
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {}
      };
    default:
      return state;
  }
}

export const UIContext = createContext<UIContextType | undefined>(undefined);

interface UIProviderProps {
  children: ReactNode;
}

/**
 * UIProvider - Proveedor del contexto de UI
 * Gestiona el estado de modales, notificaciones y filtros
 */
export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  const openModal = useCallback((modalId: string) => {
    dispatch({ type: 'OPEN_MODAL', payload: modalId });
  }, []);

  const closeModal = useCallback((modalId: string) => {
    dispatch({ type: 'CLOSE_MODAL', payload: modalId });
  }, []);

  const toggleModal = useCallback((modalId: string) => {
    dispatch({ type: 'TOGGLE_MODAL', payload: modalId });
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { ...notification, id }
    });

    // Auto-remove notification after duration
    if (notification.duration) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
      }, notification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  const setFilter = useCallback((key: string, value: any) => {
    dispatch({ type: 'SET_FILTER', payload: { key, value } });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  const getFilter = useCallback((key: string) => {
    return state.filters[key];
  }, [state.filters]);

  const value = useMemo(
    () => ({
      modals: state.modals,
      notifications: state.notifications,
      filters: state.filters,
      openModal,
      closeModal,
      toggleModal,
      addNotification,
      removeNotification,
      setFilter,
      clearFilters,
      getFilter
    }),
    [
      state.modals,
      state.notifications,
      state.filters,
      openModal,
      closeModal,
      toggleModal,
      addNotification,
      removeNotification,
      setFilter,
      clearFilters,
      getFilter
    ]
  );

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};
