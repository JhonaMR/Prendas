/**
 * Hook personalizado para operaciones CRUD de References
 * Wrapper sobre useCRUD con lógica específica de dominio
 */

import { useCallback } from 'react';
import { useCRUD, UseCRUDOptions } from './useCRUD';
import api from '../services/api';

export function useReferences(options: UseCRUDOptions = {}) {
  const crud = useCRUD(api.references, 'REFERENCES', options);

  /**
   * Obtiene referencias de una correría específica
   */
  const getByCorreria = useCallback(async (correria_id: string) => {
    try {
      const result = await api.getCorreriaReferences(correria_id);
      return result.data || result;
    } catch (error) {
      console.error('Error getting references by correria:', error);
      throw error;
    }
  }, []);

  /**
   * Refresca la lista de referencias
   */
  const refresh = useCallback(async () => {
    return crud.list();
  }, [crud]);

  return {
    ...crud,
    getByCorreria,
    refresh
  };
}
