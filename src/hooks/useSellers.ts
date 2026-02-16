/**
 * Hook personalizado para operaciones CRUD de Sellers
 */

import { useCRUD, UseCRUDOptions } from './useCRUD';
import api from '../services/api';

export function useSellers(options: UseCRUDOptions = {}) {
  return useCRUD(api.sellers, 'SELLERS', options);
}
