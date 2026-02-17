/**
 * OrdersContext - Contexto de órdenes
 * Proporciona acceso a órdenes y sus estados
 */

import React, { createContext, useCallback, useMemo, useReducer, ReactNode } from 'react';
import { Order } from '../types';

export interface OrdersContextType {
  orders: Order[];
  ordersByStatus: Record<string, Order[]>;
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  fetchOrdersByStatus: (status: string) => Promise<void>;
  createOrder: (data: Omit<Order, 'id'>) => Promise<void>;
  updateOrder: (id: string, data: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
}

type OrdersAction =
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'SET_ORDERS_BY_STATUS'; payload: Record<string, Order[]> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'DELETE_ORDER'; payload: string };

interface OrdersState {
  orders: Order[];
  ordersByStatus: Record<string, Order[]>;
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  ordersByStatus: {},
  loading: false,
  error: null
};

function ordersReducer(state: OrdersState, action: OrdersAction): OrdersState {
  switch (action.type) {
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'SET_ORDERS_BY_STATUS':
      return { ...state, ordersByStatus: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(o => o.id === action.payload.id ? action.payload : o)
      };
    case 'DELETE_ORDER':
      return { ...state, orders: state.orders.filter(o => o.id !== action.payload) };
    default:
      return state;
  }
}

export const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

interface OrdersProviderProps {
  children: ReactNode;
}

/**
 * OrdersProvider - Proveedor del contexto de órdenes
 * Gestiona el estado de órdenes y sus estados
 */
export const OrdersProvider: React.FC<OrdersProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(ordersReducer, initialState);

  const fetchOrders = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Aquí iría la llamada a la API
      // const response = await fetch('/api/orders');
      // const data = await response.json();
      // dispatch({ type: 'SET_ORDERS', payload: data });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchOrdersByStatus = useCallback(async (status: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Aquí iría la llamada a la API
      // const response = await fetch(`/api/orders?status=${status}`);
      // const data = await response.json();
      // dispatch({ type: 'SET_ORDERS_BY_STATUS', payload: { [status]: data } });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createOrder = useCallback(async (data: Omit<Order, 'id'>) => {
    try {
      // Aquí iría la llamada a la API
      const newOrder: Order = { ...data, id: Date.now().toString() };
      dispatch({ type: 'ADD_ORDER', payload: newOrder });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  }, []);

  const updateOrder = useCallback(async (id: string, data: Partial<Order>) => {
    try {
      const order = state.orders.find(o => o.id === id);
      if (!order) throw new Error('Order not found');
      const updatedOrder = { ...order, ...data };
      dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  }, [state.orders]);

  const deleteOrder = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'DELETE_ORDER', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      orders: state.orders,
      ordersByStatus: state.ordersByStatus,
      loading: state.loading,
      error: state.error,
      fetchOrders,
      fetchOrdersByStatus,
      createOrder,
      updateOrder,
      deleteOrder
    }),
    [
      state.orders,
      state.ordersByStatus,
      state.loading,
      state.error,
      fetchOrders,
      fetchOrdersByStatus,
      createOrder,
      updateOrder,
      deleteOrder
    ]
  );

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};
