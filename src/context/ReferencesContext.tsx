/**
 * ReferencesContext - Contexto de referencias de productos
 * Proporciona acceso a referencias de productos
 */

import React, { createContext, useCallback, useMemo, useReducer, ReactNode } from 'react';
import { Reference } from '../types';

export interface ReferencesContextType {
  references: Reference[];
  loading: boolean;
  error: string | null;
  fetchReferences: (page?: number, limit?: number) => Promise<void>;
  createReference: (data: Omit<Reference, 'id'>) => Promise<void>;
  updateReference: (id: string, data: Partial<Reference>) => Promise<void>;
  deleteReference: (id: string) => Promise<void>;
}

type ReferencesAction =
  | { type: 'SET_REFERENCES'; payload: Reference[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_REFERENCE'; payload: Reference }
  | { type: 'UPDATE_REFERENCE'; payload: Reference }
  | { type: 'DELETE_REFERENCE'; payload: string };

interface ReferencesState {
  references: Reference[];
  loading: boolean;
  error: string | null;
}

const initialState: ReferencesState = {
  references: [],
  loading: false,
  error: null
};

function referencesReducer(state: ReferencesState, action: ReferencesAction): ReferencesState {
  switch (action.type) {
    case 'SET_REFERENCES':
      return { ...state, references: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_REFERENCE':
      return { ...state, references: [...state.references, action.payload] };
    case 'UPDATE_REFERENCE':
      return {
        ...state,
        references: state.references.map(r => r.id === action.payload.id ? action.payload : r)
      };
    case 'DELETE_REFERENCE':
      return { ...state, references: state.references.filter(r => r.id !== action.payload) };
    default:
      return state;
  }
}

export const ReferencesContext = createContext<ReferencesContextType | undefined>(undefined);

interface ReferencesProviderProps {
  children: ReactNode;
}

/**
 * ReferencesProvider - Proveedor del contexto de referencias
 * Gestiona el estado de referencias de productos
 */
export const ReferencesProvider: React.FC<ReferencesProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(referencesReducer, initialState);

  const fetchReferences = useCallback(async (page?: number, limit?: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Aquí iría la llamada a la API
      // const response = await fetch(`/api/references?page=${page}&limit=${limit}`);
      // const data = await response.json();
      // dispatch({ type: 'SET_REFERENCES', payload: data });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createReference = useCallback(async (data: Omit<Reference, 'id'>) => {
    try {
      // Aquí iría la llamada a la API
      const newReference: Reference = { ...data, id: Date.now().toString() };
      dispatch({ type: 'ADD_REFERENCE', payload: newReference });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  }, []);

  const updateReference = useCallback(async (id: string, data: Partial<Reference>) => {
    try {
      const reference = state.references.find(r => r.id === id);
      if (!reference) throw new Error('Reference not found');
      const updatedReference = { ...reference, ...data };
      dispatch({ type: 'UPDATE_REFERENCE', payload: updatedReference });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  }, [state.references]);

  const deleteReference = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'DELETE_REFERENCE', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      references: state.references,
      loading: state.loading,
      error: state.error,
      fetchReferences,
      createReference,
      updateReference,
      deleteReference
    }),
    [
      state.references,
      state.loading,
      state.error,
      fetchReferences,
      createReference,
      updateReference,
      deleteReference
    ]
  );

  return (
    <ReferencesContext.Provider value={value}>
      {children}
    </ReferencesContext.Provider>
  );
};
