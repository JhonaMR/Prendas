/**
 * Hook para cargar datos iniciales
 * Maneja la carga de datos desde el backend con manejo de errores
 */

import { useEffect, useState } from 'react';
import { useAppDispatch } from '../context/useAppContext';

export interface UseDataLoaderOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  autoLoad?: boolean;
}

export interface UseDataLoaderReturn {
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/**
 * Hook para cargar datos iniciales
 * @param loadFn - Función que carga los datos
 * @param updateActions - Acciones para actualizar el estado global
 * @param options - Opciones de configuración
 */
export function useDataLoader(
  loadFn: () => Promise<any>,
  updateActions: Array<{ type: string; payload: any }>,
  options: UseDataLoaderOptions = {}
): UseDataLoaderReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { onSuccess, onError, autoLoad = true } = options;

  const reload = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await loadFn();
      
      // Despachar todas las acciones de actualización
      updateActions.forEach(action => {
        dispatch(action);
      });

      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      onError?.(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      reload();
    }
  }, [autoLoad]);

  return { loading, error, reload };
}
