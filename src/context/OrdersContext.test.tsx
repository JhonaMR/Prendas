/**
 * Unit tests para OrdersContext
 * **Validates: Requirements 2.3**
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OrdersProvider } from './OrdersContext';
import { useOrders } from './useContexts';

// Componente de prueba que usa el contexto
const TestComponent = () => {
  const {
    orders,
    ordersByStatus,
    loading,
    error,
    createOrder,
    updateOrder,
    deleteOrder,
    fetchOrders,
    fetchOrdersByStatus
  } = useOrders();

  const handleCreateOrder = async () => {
    await createOrder({
      clientId: 'client1',
      sellerId: 'seller1',
      correriaId: 'correria1',
      items: [{ reference: 'ref1', quantity: 5 }],
      totalValue: 100,
      createdAt: new Date().toISOString(),
      settledBy: 'user1'
    });
  };

  const handleUpdateOrder = async () => {
    if (orders.length > 0) {
      await updateOrder(orders[0].id, { totalValue: 200 });
    }
  };

  const handleDeleteOrder = async () => {
    if (orders.length > 0) {
      await deleteOrder(orders[0].id);
    }
  };

  const handleFetchOrders = async () => {
    await fetchOrders();
  };

  const handleFetchOrdersByStatus = async () => {
    await fetchOrdersByStatus('pending');
  };

  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <div data-testid="orders-count">{orders.length}</div>
      <div data-testid="orders-by-status-count">{Object.keys(ordersByStatus).length}</div>
      {orders.length > 0 && (
        <>
          <div data-testid="first-order-value">{orders[0].totalValue}</div>
          <div data-testid="first-order-id">{orders[0].id}</div>
          <div data-testid="first-order-client-id">{orders[0].clientId}</div>
        </>
      )}
      <button data-testid="create-order-btn" onClick={handleCreateOrder}>
        Create Order
      </button>
      <button data-testid="update-order-btn" onClick={handleUpdateOrder}>
        Update Order
      </button>
      <button data-testid="delete-order-btn" onClick={handleDeleteOrder}>
        Delete Order
      </button>
      <button data-testid="fetch-orders-btn" onClick={handleFetchOrders}>
        Fetch Orders
      </button>
      <button data-testid="fetch-orders-by-status-btn" onClick={handleFetchOrdersByStatus}>
        Fetch Orders by Status
      </button>
    </div>
  );
};

describe('OrdersContext', () => {
  describe('Initial State', () => {
    it('should provide initial state with empty orders', () => {
      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      expect(screen.getByTestId('orders-count')).toHaveTextContent('0');
      expect(screen.getByTestId('orders-by-status-count')).toHaveTextContent('0');
      expect(screen.getByTestId('error')).toHaveTextContent('No error');
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
  });

  describe('Order Creation', () => {
    it('should create an order with correct data', async () => {
      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      const createBtn = screen.getByTestId('create-order-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('1');
      });

      expect(screen.getByTestId('first-order-value')).toHaveTextContent('100');
      expect(screen.getByTestId('first-order-client-id')).toHaveTextContent('client1');
    });

    it('should assign unique ID to order', async () => {
      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      const createBtn = screen.getByTestId('create-order-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('1');
      });

      const orderId = screen.getByTestId('first-order-id').textContent;
      expect(orderId).toBeTruthy();
      expect(orderId).not.toHaveLength(0);
    });

    it('should handle multiple orders', async () => {
      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      const createBtn = screen.getByTestId('create-order-btn');
      fireEvent.click(createBtn);
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('2');
      });
    });
  });

  describe('Order Update', () => {
    it('should update an order', async () => {
      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      const createBtn = screen.getByTestId('create-order-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('1');
      });

      const updateBtn = screen.getByTestId('update-order-btn');
      fireEvent.click(updateBtn);

      await waitFor(() => {
        expect(screen.getByTestId('first-order-value')).toHaveTextContent('200');
      });
    });

    it('should preserve order ID after update', async () => {
      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      const createBtn = screen.getByTestId('create-order-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('1');
      });

      const originalId = screen.getByTestId('first-order-id').textContent;

      const updateBtn = screen.getByTestId('update-order-btn');
      fireEvent.click(updateBtn);

      await waitFor(() => {
        expect(screen.getByTestId('first-order-value')).toHaveTextContent('200');
      });

      const updatedId = screen.getByTestId('first-order-id').textContent;
      expect(updatedId).toBe(originalId);
    });
  });

  describe('Order Deletion', () => {
    it('should delete an order', async () => {
      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      const createBtn = screen.getByTestId('create-order-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('1');
      });

      const deleteBtn = screen.getByTestId('delete-order-btn');
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('0');
      });
    });

    it('should handle deletion of non-existent order', async () => {
      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      // Try to delete when no orders exist
      const deleteBtn = screen.getByTestId('delete-order-btn');
      fireEvent.click(deleteBtn);

      // Should not crash
      expect(screen.getByTestId('orders-count')).toHaveTextContent('0');
    });
  });

  describe('Fetch Operations', () => {
    it('should handle fetchOrders', async () => {
      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      const fetchBtn = screen.getByTestId('fetch-orders-btn');
      fireEvent.click(fetchBtn);

      // Should set loading to false after fetch
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });
    });

    it('should handle fetchOrdersByStatus', async () => {
      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      const fetchBtn = screen.getByTestId('fetch-orders-by-status-btn');
      fireEvent.click(fetchBtn);

      // Should set loading to false after fetch
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useOrders is used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useOrders debe ser usado dentro de OrdersProvider');

      consoleSpy.mockRestore();
    });

    it('should handle update error when order not found', async () => {
      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      // Try to update non-existent order
      const updateBtn = screen.getByTestId('update-order-btn');
      fireEvent.click(updateBtn);

      // Should not crash
      expect(screen.getByTestId('orders-count')).toHaveTextContent('0');
    });
  });

  describe('State Consistency', () => {
    it('should maintain correct order count after multiple operations', async () => {
      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      const createBtn = screen.getByTestId('create-order-btn');
      const deleteBtn = screen.getByTestId('delete-order-btn');

      fireEvent.click(createBtn);
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('2');
      });

      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('1');
      });

      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('0');
      });
    });
  });
});
