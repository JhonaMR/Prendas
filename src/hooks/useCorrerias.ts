/**
 * Hook personalizado para operaciones CRUD de Correrias
 */

import { useCRUD, UseCRUDOptions } from './useCRUD';
import api from '../services/api';

export function useCorrerias(options: UseCRUDOptions = {}) {
  return useCRUD(api.correrias, 'CORRERIAS', options);
}
