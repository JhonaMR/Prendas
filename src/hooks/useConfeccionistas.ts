/**
 * Hook personalizado para operaciones CRUD de Confeccionistas
 */

import { useCRUD, UseCRUDOptions } from './useCRUD';
import api from '../services/api';

export function useConfeccionistas(options: UseCRUDOptions = {}) {
  return useCRUD(api.confeccionistas, 'CONFECCIONISTAS', options);
}
