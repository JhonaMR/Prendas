/**
 * Hook genérico para operaciones CRUD
 * Proporciona interfaz estándar para crear, leer, actualizar y eliminar entidades
 */

import { useState, useCallback } from 'react';
import { useAppDispatch } from '../context/useAppContext';
import logger from '../services/logger';

export interface UseCRUDOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface UseCRUDReturn<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  create: (item: T) => Promise<T>;
  read: (id: string) => Promise<T>;
  update: (id: string, item: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
  list: () => Promise<T[]>;
  clearError: () => void;
}

/**
 * Hook genérico CRUD
 * @param apiService - Servicio API con métodos CRUD
 * @param stateKey - Clave del estado global para actualizar
 * @param options - Opciones de configuración
 */
export function useCRUD<T>(
  apiService: any,
  stateKey: string,
  options: UseCRUDOptions = {}
): UseCRUDReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const handleError = useCallback((err: Error) => {
    const message = err instanceof Error ? err.message : 'Unknown error';
    setError(message);
    logger.error(`CRUD operation failed for ${stateKey}`, err, { message });
    options.onError?.(err);
  }, [options]);

  const handleSuccess = useCallback((data: any) => {
    logger.info(`CRUD operation succeeded for ${stateKey}`, { dataLength: Array.isArray(data) ? data.length : 1 });
    options.onSuccess?.(data);
  }, [options]);

  const create = useCallback(async (item: T): Promise<T> => {
    setLoading(true);
    setError(null);
    logger.info(`Creating new ${stateKey}`, { item });
    try {
      const result = await apiService.create(item);
      const newItem = result.data || result;
      setItems(prev => [...prev, newItem]);
      
      // Actualizar estado global
      dispatch({ 
        type: `SET_${stateKey.toUpperCase()}`, 
        payload: [...items, newItem] 
      });
      
      handleSuccess(newItem);
      return newItem;
    } catch (err) {
      handleError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [items, dispatch, stateKey, handleError, handleSuccess]);

  const read = useCallback(async (id: string): Promise<T> => {
    setLoading(true);
    setError(null);
    logger.info(`Reading ${stateKey}`, { id });
    try {
      const result = await apiService.read(id);
      const item = result.data || result;
      handleSuccess(item);
      return item;
    } catch (err) {
      handleError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  const update = useCallback(async (id: string, item: Partial<T>): Promise<T> => {
    setLoading(true);
    setError(null);
    logger.info(`Updating ${stateKey}`, { id, item });
    try {
      const result = await apiService.update(id, item);
      const updatedItem = result.data || result;
      
      setItems(prev => prev.map(i => (i as any).id === id ? updatedItem : i));
      
      // Actualizar estado global
      dispatch({ 
        type: `SET_${stateKey.toUpperCase()}`, 
        payload: items.map(i => (i as any).id === id ? updatedItem : i) 
      });
      
      handleSuccess(updatedItem);
      return updatedItem;
    } catch (err) {
      handleError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [items, dispatch, stateKey, handleError, handleSuccess]);

  const delete_ = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    logger.info(`Deleting ${stateKey}`, { id });
    try {
      await apiService.delete(id);
      
      setItems(prev => prev.filter(i => (i as any).id !== id));
      
      // Actualizar estado global
      dispatch({ 
        type: `SET_${stateKey.toUpperCase()}`, 
        payload: items.filter(i => (i as any).id !== id) 
      });
      
      handleSuccess({ id });
    } catch (err) {
      handleError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [items, dispatch, stateKey, handleError, handleSuccess]);

  const list = useCallback(async (): Promise<T[]> => {
    setLoading(true);
    setError(null);
    logger.info(`Listing ${stateKey}`);
    try {
      const result = await apiService.list();
      const data = result.data || result;
      setItems(data);
      
      // Actualizar estado global
      dispatch({ 
        type: `SET_${stateKey.toUpperCase()}`, 
        payload: data 
      });
      
      handleSuccess(data);
      return data;
    } catch (err) {
      handleError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch, stateKey, handleError, handleSuccess]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    items,
    loading,
    error,
    create,
    read,
    update,
    delete: delete_,
    list,
    clearError
  };
}
