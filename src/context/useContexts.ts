/**
 * Custom hooks para acceder a los contextos especializados
 */

import { useContext } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';
import { MastersContext, MastersContextType } from './MastersContext';
import { OrdersContext, OrdersContextType } from './OrdersContext';
import { DeliveryDatesContext, DeliveryDatesContextType } from './DeliveryDatesContext';
import { ReferencesContext, ReferencesContextType } from './ReferencesContext';
import { UIContext, UIContextType } from './UIContext';
import { CacheContext, CacheContextType } from './CacheContext';

/**
 * Hook para acceder al contexto de autenticación
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

/**
 * Hook para acceder al contexto de datos maestros
 */
export const useMasters = (): MastersContextType => {
  const context = useContext(MastersContext);
  if (!context) {
    throw new Error('useMasters debe ser usado dentro de MastersProvider');
  }
  return context;
};

/**
 * Hook para acceder al contexto de órdenes
 */
export const useOrders = (): OrdersContextType => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders debe ser usado dentro de OrdersProvider');
  }
  return context;
};

/**
 * Hook para acceder al contexto de fechas de entrega
 */
export const useDeliveryDates = (): DeliveryDatesContextType => {
  const context = useContext(DeliveryDatesContext);
  if (!context) {
    throw new Error('useDeliveryDates debe ser usado dentro de DeliveryDatesProvider');
  }
  return context;
};

/**
 * Hook para acceder al contexto de referencias
 */
export const useReferences = (): ReferencesContextType => {
  const context = useContext(ReferencesContext);
  if (!context) {
    throw new Error('useReferences debe ser usado dentro de ReferencesProvider');
  }
  return context;
};

/**
 * Hook para acceder al contexto de UI
 */
export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI debe ser usado dentro de UIProvider');
  }
  return context;
};

/**
 * Hook para acceder al contexto de caché
 */
export const useCache = (): CacheContextType => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache debe ser usado dentro de CacheProvider');
  }
  return context;
};
