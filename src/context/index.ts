/**
 * Exportar todos los contextos y hooks
 */

// Contextos
export { AuthContext, AuthProvider } from './AuthContext';
export type { AuthContextType } from './AuthContext';

export { MastersContext, MastersProvider } from './MastersContext';
export type { MastersContextType } from './MastersContext';

export { OrdersContext, OrdersProvider } from './OrdersContext';
export type { OrdersContextType } from './OrdersContext';

export { DeliveryDatesContext, DeliveryDatesProvider } from './DeliveryDatesContext';
export type { DeliveryDatesContextType } from './DeliveryDatesContext';

export { ReferencesContext, ReferencesProvider } from './ReferencesContext';
export type { ReferencesContextType } from './ReferencesContext';

export { UIContext, UIProvider } from './UIContext';
export type { UIContextType, Notification } from './UIContext';

export { CacheContext, CacheProvider } from './CacheContext';
export type { CacheContextType, CacheStats } from './CacheContext';

// Hooks
export {
  useAuth,
  useMasters,
  useOrders,
  useDeliveryDates,
  useReferences,
  useUI,
  useCache
} from './useContexts';
