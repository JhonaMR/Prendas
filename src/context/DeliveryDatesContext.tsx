/**
 * DeliveryDatesContext - Contexto de fechas de entrega
 * Proporciona acceso a fechas de entrega
 */

import React, { createContext, useCallback, useMemo, useReducer, ReactNode } from 'react';
import { DeliveryDate } from '../types';

export interface DeliveryDatesContextType {
  deliveryDates: DeliveryDate[];
  loading: boolean;
  error: string | null;
  fetchDeliveryDates: (page?: number, limit?: number) => Promise<void>;
  createDeliveryDate: (data: Omit<DeliveryDate, 'id'>) => Promise<void>;
  updateDeliveryDate: (id: string, data: Partial<DeliveryDate>) => Promise<void>;
  deleteDeliveryDate: (id: string) => Promise<void>;
}

type DeliveryDatesAction =
  | { type: 'SET_DELIVERY_DATES'; payload: DeliveryDate[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_DELIVERY_DATE'; payload: DeliveryDate }
  | { type: 'UPDATE_DELIVERY_DATE'; payload: DeliveryDate }
  | { type: 'DELETE_DELIVERY_DATE'; payload: string };

interface DeliveryDatesState {
  deliveryDates: DeliveryDate[];
  loading: boolean;
  error: string | null;
}

const initialState: DeliveryDatesState = {
  deliveryDates: [],
  loading: false,
  error: null
};

function deliveryDatesReducer(state: DeliveryDatesState, action: DeliveryDatesAction): DeliveryDatesState {
  switch (action.type) {
    case 'SET_DELIVERY_DATES':
      return { ...state, deliveryDates: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_DELIVERY_DATE':
      return { ...state, deliveryDates: [...state.deliveryDates, action.payload] };
    case 'UPDATE_DELIVERY_DATE':
      return {
        ...state,
        deliveryDates: state.deliveryDates.map(d => d.id === action.payload.id ? action.payload : d)
      };
    case 'DELETE_DELIVERY_DATE':
      return { ...state, deliveryDates: state.deliveryDates.filter(d => d.id !== action.payload) };
    default:
      return state;
  }
}

export const DeliveryDatesContext = createContext<DeliveryDatesContextType | undefined>(undefined);

interface DeliveryDatesProviderProps {
  children: ReactNode;
}

/**
 * DeliveryDatesProvider - Proveedor del contexto de fechas de entrega
 * Gestiona el estado de fechas de entrega
 */
export const DeliveryDatesProvider: React.FC<DeliveryDatesProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(deliveryDatesReducer, initialState);

  const fetchDeliveryDates = useCallback(async (page?: number, limit?: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Aquí iría la llamada a la API
      // const response = await fetch(`/api/delivery-dates?page=${page}&limit=${limit}`);
      // const data = await response.json();
      // dispatch({ type: 'SET_DELIVERY_DATES', payload: data });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createDeliveryDate = useCallback(async (data: Omit<DeliveryDate, 'id'>) => {
    try {
      // Aquí iría la llamada a la API
      const newDeliveryDate: DeliveryDate = { ...data, id: Date.now().toString() };
      dispatch({ type: 'ADD_DELIVERY_DATE', payload: newDeliveryDate });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  }, []);

  const updateDeliveryDate = useCallback(async (id: string, data: Partial<DeliveryDate>) => {
    try {
      const deliveryDate = state.deliveryDates.find(d => d.id === id);
      if (!deliveryDate) throw new Error('DeliveryDate not found');
      const updatedDeliveryDate = { ...deliveryDate, ...data };
      dispatch({ type: 'UPDATE_DELIVERY_DATE', payload: updatedDeliveryDate });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  }, [state.deliveryDates]);

  const deleteDeliveryDate = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'DELETE_DELIVERY_DATE', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      deliveryDates: state.deliveryDates,
      loading: state.loading,
      error: state.error,
      fetchDeliveryDates,
      createDeliveryDate,
      updateDeliveryDate,
      deleteDeliveryDate
    }),
    [
      state.deliveryDates,
      state.loading,
      state.error,
      fetchDeliveryDates,
      createDeliveryDate,
      updateDeliveryDate,
      deleteDeliveryDate
    ]
  );

  return (
    <DeliveryDatesContext.Provider value={value}>
      {children}
    </DeliveryDatesContext.Provider>
  );
};
