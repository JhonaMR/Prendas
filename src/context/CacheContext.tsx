/**
 * CacheContext - Contexto de caché
 * Proporciona estado y control del sistema de caché
 */

import React, { createContext, useCallback, useMemo, useReducer, ReactNode } from 'react';

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
}

export interface CacheContextType {
  cacheStats: CacheStats;
  isCacheEnabled: boolean;
  enableCache: () => void;
  disableCache: () => void;
  clearCache: () => void;
  invalidateCache: (pattern: string) => void;
  updateStats: (stats: CacheStats) => void;
}

type CacheAction =
  | { type: 'ENABLE_CACHE' }
  | { type: 'DISABLE_CACHE' }
  | { type: 'CLEAR_CACHE' }
  | { type: 'INVALIDATE_CACHE'; payload: string }
  | { type: 'UPDATE_STATS'; payload: CacheStats };

interface CacheState {
  cacheStats: CacheStats;
  isCacheEnabled: boolean;
}

const initialState: CacheState = {
  cacheStats: {
    size: 0,
    hits: 0,
    misses: 0
  },
  isCacheEnabled: true
};

function cacheReducer(state: CacheState, action: CacheAction): CacheState {
  switch (action.type) {
    case 'ENABLE_CACHE':
      return { ...state, isCacheEnabled: true };
    case 'DISABLE_CACHE':
      return { ...state, isCacheEnabled: false };
    case 'CLEAR_CACHE':
      return {
        ...state,
        cacheStats: {
          size: 0,
          hits: 0,
          misses: 0
        }
      };
    case 'INVALIDATE_CACHE':
      // Invalidation is handled by the backend, we just update stats
      return state;
    case 'UPDATE_STATS':
      return { ...state, cacheStats: action.payload };
    default:
      return state;
  }
}

export const CacheContext = createContext<CacheContextType | undefined>(undefined);

interface CacheProviderProps {
  children: ReactNode;
}

/**
 * CacheProvider - Proveedor del contexto de caché
 * Gestiona el estado y control del sistema de caché
 */
export const CacheProvider: React.FC<CacheProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cacheReducer, initialState);

  const enableCache = useCallback(() => {
    dispatch({ type: 'ENABLE_CACHE' });
  }, []);

  const disableCache = useCallback(() => {
    dispatch({ type: 'DISABLE_CACHE' });
  }, []);

  const clearCache = useCallback(() => {
    dispatch({ type: 'CLEAR_CACHE' });
    // Aquí iría la llamada a la API para limpiar el caché del backend
    // await fetch('/api/cache/clear', { method: 'POST' });
  }, []);

  const invalidateCache = useCallback((pattern: string) => {
    dispatch({ type: 'INVALIDATE_CACHE', payload: pattern });
    // Aquí iría la llamada a la API para invalidar el caché del backend
    // await fetch('/api/cache/invalidate', { method: 'POST', body: JSON.stringify({ pattern }) });
  }, []);

  const updateStats = useCallback((stats: CacheStats) => {
    dispatch({ type: 'UPDATE_STATS', payload: stats });
  }, []);

  const value = useMemo(
    () => ({
      cacheStats: state.cacheStats,
      isCacheEnabled: state.isCacheEnabled,
      enableCache,
      disableCache,
      clearCache,
      invalidateCache,
      updateStats
    }),
    [
      state.cacheStats,
      state.isCacheEnabled,
      enableCache,
      disableCache,
      clearCache,
      invalidateCache,
      updateStats
    ]
  );

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
};
