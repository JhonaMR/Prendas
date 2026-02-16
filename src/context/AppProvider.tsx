/**
 * AppProvider - Componente proveedor del contexto global
 * Carga datos iniciales y proporciona estado a toda la aplicación
 */

import React, { useEffect, ReactNode } from 'react';
import { AppProvider as ContextProvider, AppContext } from './AppContext';
import api from '../services/api';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Componente que envuelve la aplicación y carga datos iniciales
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <ContextProvider>
      <AppInitializer>
        {children}
      </AppInitializer>
    </ContextProvider>
  );
};

/**
 * Componente interno que carga datos iniciales
 */
const AppInitializer: React.FC<{ children: ReactNode }> = ({ children }) => {
  const context = React.useContext(AppContext);

  useEffect(() => {
    if (!context) return;

    const loadInitialData = async () => {
      context.dispatch({ type: 'SET_LOADING', payload: true });

      try {
        // Cargar todos los datos en paralelo
        const [
          usersData,
          referencesData,
          clientsData,
          confeccionistasData,
          sellersData,
          correriasData,
          receptionsData,
          dispatchesData,
          ordersData,
          productionData
        ] = await Promise.all([
          api.listUsers(),
          api.getReferences(),
          api.getClients(),
          api.getConfeccionistas(),
          api.getSellers(),
          api.getCorrerias(),
          api.getReceptions(),
          api.getDispatches(),
          api.getOrders(),
          api.getProductionTracking()
        ]);

        // Actualizar estado con los datos cargados
        context.dispatch({ type: 'SET_USERS', payload: usersData });
        context.dispatch({ type: 'SET_REFERENCES', payload: referencesData });
        context.dispatch({ type: 'SET_CLIENTS', payload: clientsData });
        context.dispatch({ type: 'SET_CONFECCIONISTAS', payload: confeccionistasData });
        context.dispatch({ type: 'SET_SELLERS', payload: sellersData });
        context.dispatch({ type: 'SET_CORRERIAS', payload: correriasData });
        context.dispatch({ type: 'SET_RECEPTIONS', payload: receptionsData });
        context.dispatch({ type: 'SET_DISPATCHES', payload: dispatchesData });
        context.dispatch({ type: 'SET_ORDERS', payload: ordersData });
        context.dispatch({ type: 'SET_PRODUCTION_TRACKING', payload: productionData });

        console.log('✅ Datos iniciales cargados del backend');
      } catch (error) {
        console.error('❌ Error cargando datos iniciales:', error);
        context.dispatch({ 
          type: 'SET_ERROR', 
          payload: 'Error al cargar datos del servidor' 
        });
      } finally {
        context.dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadInitialData();
  }, [context]);

  return <>{children}</>;
};

export default AppProvider;
