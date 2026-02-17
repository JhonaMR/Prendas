/**
 * Unit tests para DeliveryDatesContext
 * **Validates: Requirements 2.4**
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeliveryDatesProvider } from './DeliveryDatesContext';
import { useDeliveryDates } from './useContexts';

// Componente de prueba que usa el contexto
const TestComponent = () => {
  const {
    deliveryDates,
    loading,
    error,
    createDeliveryDate,
    updateDeliveryDate,
    deleteDeliveryDate,
    fetchDeliveryDates
  } = useDeliveryDates();

  const handleCreateDeliveryDate = async () => {
    await createDeliveryDate({
      confeccionistaId: 'conf1',
      referenceId: 'ref1',
      quantity: 10,
      sendDate: '2024-01-01',
      expectedDate: '2024-01-15',
      deliveryDate: null,
      process: 'cutting',
      observation: 'Test observation',
      createdAt: new Date().toISOString(),
      createdBy: 'user1'
    });
  };

  const handleUpdateDeliveryDate = async () => {
    if (deliveryDates.length > 0) {
      await updateDeliveryDate(deliveryDates[0].id, { quantity: 20 });
    }
  };

  const handleDeleteDeliveryDate = async () => {
    if (deliveryDates.length > 0) {
      await deleteDeliveryDate(deliveryDates[0].id);
    }
  };

  const handleFetchDeliveryDates = async () => {
    await fetchDeliveryDates(1, 30);
  };

  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <div data-testid="delivery-dates-count">{deliveryDates.length}</div>
      {deliveryDates.length > 0 && (
        <>
          <div data-testid="first-delivery-date-quantity">{deliveryDates[0].quantity}</div>
          <div data-testid="first-delivery-date-id">{deliveryDates[0].id}</div>
          <div data-testid="first-delivery-date-process">{deliveryDates[0].process}</div>
          <div data-testid="first-delivery-date-confeccionista">{deliveryDates[0].confeccionistaId}</div>
        </>
      )}
      <button data-testid="create-delivery-date-btn" onClick={handleCreateDeliveryDate}>
        Create Delivery Date
      </button>
      <button data-testid="update-delivery-date-btn" onClick={handleUpdateDeliveryDate}>
        Update Delivery Date
      </button>
      <button data-testid="delete-delivery-date-btn" onClick={handleDeleteDeliveryDate}>
        Delete Delivery Date
      </button>
      <button data-testid="fetch-delivery-dates-btn" onClick={handleFetchDeliveryDates}>
        Fetch Delivery Dates
      </button>
    </div>
  );
};

describe('DeliveryDatesContext', () => {
  describe('Initial State', () => {
    it('should provide initial state with empty delivery dates', () => {
      render(
        <DeliveryDatesProvider>
          <TestComponent />
        </DeliveryDatesProvider>
      );

      expect(screen.getByTestId('delivery-dates-count')).toHaveTextContent('0');
      expect(screen.getByTestId('error')).toHaveTextContent('No error');
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
  });

  describe('Delivery Date Creation', () => {
    it('should create a delivery date with correct data', async () => {
      render(
        <DeliveryDatesProvider>
          <TestComponent />
        </DeliveryDatesProvider>
      );

      const createBtn = screen.getByTestId('create-delivery-date-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('delivery-dates-count')).toHaveTextContent('1');
      });

      expect(screen.getByTestId('first-delivery-date-quantity')).toHaveTextContent('10');
      expect(screen.getByTestId('first-delivery-date-process')).toHaveTextContent('cutting');
      expect(screen.getByTestId('first-delivery-date-confeccionista')).toHaveTextContent('conf1');
    });

    it('should assign unique ID to delivery date', async () => {
      render(
        <DeliveryDatesProvider>
          <TestComponent />
        </DeliveryDatesProvider>
      );

      const createBtn = screen.getByTestId('create-delivery-date-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('delivery-dates-count')).toHaveTextContent('1');
      });

      const deliveryDateId = screen.getByTestId('first-delivery-date-id').textContent;
      expect(deliveryDateId).toBeTruthy();
      expect(deliveryDateId).not.toHaveLength(0);
    });

    it('should handle multiple delivery dates', async () => {
      render(
        <DeliveryDatesProvider>
          <TestComponent />
        </DeliveryDatesProvider>
      );

      const createBtn = screen.getByTestId('create-delivery-date-btn');
      fireEvent.click(createBtn);
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('delivery-dates-count')).toHaveTextContent('2');
      });
    });
  });

  describe('Delivery Date Update', () => {
    it('should update a delivery date', async () => {
      render(
        <DeliveryDatesProvider>
          <TestComponent />
        </DeliveryDatesProvider>
      );

      const createBtn = screen.getByTestId('create-delivery-date-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('delivery-dates-count')).toHaveTextContent('1');
      });

      const updateBtn = screen.getByTestId('update-delivery-date-btn');
      fireEvent.click(updateBtn);

      await waitFor(() => {
        expect(screen.getByTestId('first-delivery-date-quantity')).toHaveTextContent('20');
      });
    });

    it('should preserve delivery date ID after update', async () => {
      render(
        <DeliveryDatesProvider>
          <TestComponent />
        </DeliveryDatesProvider>
      );

      const createBtn = screen.getByTestId('create-delivery-date-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('delivery-dates-count')).toHaveTextContent('1');
      });

      const originalId = screen.getByTestId('first-delivery-date-id').textContent;

      const updateBtn = screen.getByTestId('update-delivery-date-btn');
      fireEvent.click(updateBtn);

      await waitFor(() => {
        expect(screen.getByTestId('first-delivery-date-quantity')).toHaveTextContent('20');
      });

      const updatedId = screen.getByTestId('first-delivery-date-id').textContent;
      expect(updatedId).toBe(originalId);
    });
  });

  describe('Delivery Date Deletion', () => {
    it('should delete a delivery date', async () => {
      render(
        <DeliveryDatesProvider>
          <TestComponent />
        </DeliveryDatesProvider>
      );

      const createBtn = screen.getByTestId('create-delivery-date-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('delivery-dates-count')).toHaveTextContent('1');
      });

      const deleteBtn = screen.getByTestId('delete-delivery-date-btn');
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(screen.getByTestId('delivery-dates-count')).toHaveTextContent('0');
      });
    });

    it('should handle deletion of non-existent delivery date', async () => {
      render(
        <DeliveryDatesProvider>
          <TestComponent />
        </DeliveryDatesProvider>
      );

      // Try to delete when no delivery dates exist
      const deleteBtn = screen.getByTestId('delete-delivery-date-btn');
      fireEvent.click(deleteBtn);

      // Should not crash
      expect(screen.getByTestId('delivery-dates-count')).toHaveTextContent('0');
    });
  });

  describe('Fetch Operations', () => {
    it('should handle fetchDeliveryDates with pagination', async () => {
      render(
        <DeliveryDatesProvider>
          <TestComponent />
        </DeliveryDatesProvider>
      );

      const fetchBtn = screen.getByTestId('fetch-delivery-dates-btn');
      fireEvent.click(fetchBtn);

      // Should set loading to false after fetch
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useDeliveryDates is used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useDeliveryDates debe ser usado dentro de DeliveryDatesProvider');

      consoleSpy.mockRestore();
    });

    it('should handle update error when delivery date not found', async () => {
      render(
        <DeliveryDatesProvider>
          <TestComponent />
        </DeliveryDatesProvider>
      );

      // Try to update non-existent delivery date
      const updateBtn = screen.getByTestId('update-delivery-date-btn');
      fireEvent.click(updateBtn);

      // Should not crash
      expect(screen.getByTestId('delivery-dates-count')).toHaveTextContent('0');
    });
  });

  describe('State Consistency', () => {
    it('should maintain correct delivery date count after multiple operations', async () => {
      render(
        <DeliveryDatesProvider>
          <TestComponent />
        </DeliveryDatesProvider>
      );

      const createBtn = screen.getByTestId('create-delivery-date-btn');
      const deleteBtn = screen.getByTestId('delete-delivery-date-btn');

      fireEvent.click(createBtn);
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('delivery-dates-count')).toHaveTextContent('2');
      });

      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(screen.getByTestId('delivery-dates-count')).toHaveTextContent('1');
      });

      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(screen.getByTestId('delivery-dates-count')).toHaveTextContent('0');
      });
    });
  });
});
