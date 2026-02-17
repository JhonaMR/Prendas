/**
 * MastersContext - Contexto de datos maestros
 * Proporciona acceso a Clientes, Vendedores y Confeccionistas
 */

import React, { createContext, useCallback, useMemo, useReducer, ReactNode } from 'react';
import { Client, Seller, Confeccionista } from '../types';

export interface MastersContextType {
  clients: Client[];
  sellers: Seller[];
  confeccionistas: Confeccionista[];
  loading: boolean;
  error: string | null;
  fetchClients: (page?: number, limit?: number) => Promise<void>;
  fetchSellers: (page?: number, limit?: number) => Promise<void>;
  fetchConfeccionistas: (page?: number, limit?: number) => Promise<void>;
  createClient: (data: Omit<Client, 'id'>) => Promise<void>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  createSeller: (data: Omit<Seller, 'id'>) => Promise<void>;
  updateSeller: (id: string, data: Partial<Seller>) => Promise<void>;
  deleteSeller: (id: string) => Promise<void>;
  createConfeccionista: (data: Omit<Confeccionista, 'id'>) => Promise<void>;
  updateConfeccionista: (id: string, data: Partial<Confeccionista>) => Promise<void>;
  deleteConfeccionista: (id: string) => Promise<void>;
}

type MastersAction =
  | { type: 'SET_CLIENTS'; payload: Client[] }
  | { type: 'SET_SELLERS'; payload: Seller[] }
  | { type: 'SET_CONFECCIONISTAS'; payload: Confeccionista[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: Client }
  | { type: 'DELETE_CLIENT'; payload: string }
  | { type: 'ADD_SELLER'; payload: Seller }
  | { type: 'UPDATE_SELLER'; payload: Seller }
  | { type: 'DELETE_SELLER'; payload: string }
  | { type: 'ADD_CONFECCIONISTA'; payload: Confeccionista }
  | { type: 'UPDATE_CONFECCIONISTA'; payload: Confeccionista }
  | { type: 'DELETE_CONFECCIONISTA'; payload: string };

interface MastersState {
  clients: Client[];
  sellers: Seller[];
  confeccionistas: Confeccionista[];
  loading: boolean;
  error: string | null;
}

const initialState: MastersState = {
  clients: [],
  sellers: [],
  confeccionistas: [],
  loading: false,
  error: null
};

function mastersReducer(state: MastersState, action: MastersAction): MastersState {
  switch (action.type) {
    case 'SET_CLIENTS':
      return { ...state, clients: action.payload };
    case 'SET_SELLERS':
      return { ...state, sellers: action.payload };
    case 'SET_CONFECCIONISTAS':
      return { ...state, confeccionistas: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_CLIENT':
      return { ...state, clients: [...state.clients, action.payload] };
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(c => c.id === action.payload.id ? action.payload : c)
      };
    case 'DELETE_CLIENT':
      return { ...state, clients: state.clients.filter(c => c.id !== action.payload) };
    case 'ADD_SELLER':
      return { ...state, sellers: [...state.sellers, action.payload] };
    case 'UPDATE_SELLER':
      return {
        ...state,
        sellers: state.sellers.map(s => s.id === action.payload.id ? action.payload : s)
      };
    case 'DELETE_SELLER':
      return { ...state, sellers: state.sellers.filter(s => s.id !== action.payload) };
    case 'ADD_CONFECCIONISTA':
      return { ...state, confeccionistas: [...state.confeccionistas, action.payload] };
    case 'UPDATE_CONFECCIONISTA':
      return {
        ...state,
        confeccionistas: state.confeccionistas.map(c => c.id === action.payload.id ? action.payload : c)
      };
    case 'DELETE_CONFECCIONISTA':
      return { ...state, confeccionistas: state.confeccionistas.filter(c => c.id !== action.payload) };
    default:
      return state;
  }
}

export const MastersContext = createContext<MastersContextType | undefined>(undefined);

interface MastersProviderProps {
  children: ReactNode;
}

/**
 * MastersProvider - Proveedor del contexto de datos maestros
 * Gestiona el estado de Clientes, Vendedores y Confeccionistas
 */
export const MastersProvider: React.FC<MastersProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(mastersReducer, initialState);

  const fetchClients = useCallback(async (page?: number, limit?: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Aquí iría la llamada a la API
      // const response = await fetch(`/api/clients?page=${page}&limit=${limit}`);
      // const data = await response.json();
      // dispatch({ type: 'SET_CLIENTS', payload: data });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchSellers = useCallback(async (page?: number, limit?: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Aquí iría la llamada a la API
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchConfeccionistas = useCallback(async (page?: number, limit?: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Aquí iría la llamada a la API
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createClient = useCallback(async (data: Omit<Client, 'id'>) => {
    try {
      // Aquí iría la llamada a la API
      const newClient: Client = { ...data, id: Date.now().toString() };
      dispatch({ type: 'ADD_CLIENT', payload: newClient });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  }, []);

  const updateClient = useCallback(async (id: string, data: Partial<Client>) => {
    try {
      const client = state.clients.find(c => c.id === id);
      if (!client) throw new Error('Client not found');
      const updatedClient = { ...client, ...data };
      dispatch({ type: 'UPDATE_CLIENT', payload: updatedClient });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  }, [state.clients]);

  const deleteClient = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'DELETE_CLIENT', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  }, []);

  const createSeller = useCallback(async (data: Omit<Seller, 'id'>) => {
    try {
      const newSeller: Seller = { ...data, id: Date.now().toString() };
      dispatch({ type: 'ADD_SELLER', payload: newSeller });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  }, []);

  const updateSeller = useCallback(async (id: string, data: Partial<Seller>) => {
    try {
      const seller = state.sellers.find(s => s.id === id);
      if (!seller) throw new Error('Seller not found');
      const updatedSeller = { ...seller, ...data };
      dispatch({ type: 'UPDATE_SELLER', payload: updatedSeller });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  }, [state.sellers]);

  const deleteSeller = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'DELETE_SELLER', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  }, []);

  const createConfeccionista = useCallback(async (data: Omit<Confeccionista, 'id'>) => {
    try {
      const newConfeccionista: Confeccionista = { ...data, id: Date.now().toString() };
      dispatch({ type: 'ADD_CONFECCIONISTA', payload: newConfeccionista });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  }, []);

  const updateConfeccionista = useCallback(async (id: string, data: Partial<Confeccionista>) => {
    try {
      const confeccionista = state.confeccionistas.find(c => c.id === id);
      if (!confeccionista) throw new Error('Confeccionista not found');
      const updatedConfeccionista = { ...confeccionista, ...data };
      dispatch({ type: 'UPDATE_CONFECCIONISTA', payload: updatedConfeccionista });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  }, [state.confeccionistas]);

  const deleteConfeccionista = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'DELETE_CONFECCIONISTA', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      clients: state.clients,
      sellers: state.sellers,
      confeccionistas: state.confeccionistas,
      loading: state.loading,
      error: state.error,
      fetchClients,
      fetchSellers,
      fetchConfeccionistas,
      createClient,
      updateClient,
      deleteClient,
      createSeller,
      updateSeller,
      deleteSeller,
      createConfeccionista,
      updateConfeccionista,
      deleteConfeccionista
    }),
    [
      state.clients,
      state.sellers,
      state.confeccionistas,
      state.loading,
      state.error,
      fetchClients,
      fetchSellers,
      fetchConfeccionistas,
      createClient,
      updateClient,
      deleteClient,
      createSeller,
      updateSeller,
      deleteSeller,
      createConfeccionista,
      updateConfeccionista,
      deleteConfeccionista
    ]
  );

  return (
    <MastersContext.Provider value={value}>
      {children}
    </MastersContext.Provider>
  );
};
