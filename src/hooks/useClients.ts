/**
 * Hook personalizado para operaciones CRUD de Clients
 */

import { useCRUD, UseCRUDOptions } from './useCRUD';
import api from '../services/api';

export function useClients(options: UseCRUDOptions = {}) {
  return useCRUD(api.clients, 'CLIENTS', options);
}
