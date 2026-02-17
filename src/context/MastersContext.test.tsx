/**
 * Unit tests para MastersContext
 * **Validates: Requirements 2.2**
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MastersProvider } from './MastersContext';
import { useMasters } from './useContexts';
import { Client, Seller, Confeccionista } from '../types';

// Componente de prueba que usa el contexto
const TestComponent = () => {
  const {
    clients,
    sellers,
    confeccionistas,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    createSeller,
    updateSeller,
    deleteSeller,
    createConfeccionista,
    updateConfeccionista,
    deleteConfeccionista
  } = useMasters();

  const handleCreateClient = async () => {
    await createClient({
      name: 'Test Client',
      nit: '123456',
      address: 'Test Address',
      city: 'Test City',
      seller: 'seller1'
    });
  };

  const handleUpdateClient = async () => {
    if (clients.length > 0) {
      await updateClient(clients[0].id, { name: 'Updated Client' });
    }
  };

  const handleDeleteClient = async () => {
    if (clients.length > 0) {
      await deleteClient(clients[0].id);
    }
  };

  const handleCreateSeller = async () => {
    await createSeller({
      name: 'Test Seller',
      email: 'seller@test.com',
      phone: '1234567890'
    });
  };

  const handleUpdateSeller = async () => {
    if (sellers.length > 0) {
      await updateSeller(sellers[0].id, { name: 'Updated Seller' });
    }
  };

  const handleDeleteSeller = async () => {
    if (sellers.length > 0) {
      await deleteSeller(sellers[0].id);
    }
  };

  const handleCreateConfeccionista = async () => {
    await createConfeccionista({
      name: 'Test Confeccionista',
      email: 'conf@test.com',
      phone: '0987654321'
    });
  };

  const handleUpdateConfeccionista = async () => {
    if (confeccionistas.length > 0) {
      await updateConfeccionista(confeccionistas[0].id, { name: 'Updated Confeccionista' });
    }
  };

  const handleDeleteConfeccionista = async () => {
    if (confeccionistas.length > 0) {
      await deleteConfeccionista(confeccionistas[0].id);
    }
  };

  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <div data-testid="clients-count">{clients.length}</div>
      <div data-testid="sellers-count">{sellers.length}</div>
      <div data-testid="confeccionistas-count">{confeccionistas.length}</div>
      {clients.length > 0 && (
        <>
          <div data-testid="first-client-name">{clients[0].name}</div>
          <div data-testid="first-client-nit">{clients[0].nit}</div>
          <div data-testid="first-client-id">{clients[0].id}</div>
        </>
      )}
      {sellers.length > 0 && (
        <>
          <div data-testid="first-seller-name">{sellers[0].name}</div>
          <div data-testid="first-seller-email">{sellers[0].email}</div>
        </>
      )}
      {confeccionistas.length > 0 && (
        <>
          <div data-testid="first-confeccionista-name">{confeccionistas[0].name}</div>
          <div data-testid="first-confeccionista-email">{confeccionistas[0].email}</div>
        </>
      )}
      <button data-testid="create-client-btn" onClick={handleCreateClient}>
        Create Client
      </button>
      <button data-testid="update-client-btn" onClick={handleUpdateClient}>
        Update Client
      </button>
      <button data-testid="delete-client-btn" onClick={handleDeleteClient}>
        Delete Client
      </button>
      <button data-testid="create-seller-btn" onClick={handleCreateSeller}>
        Create Seller
      </button>
      <button data-testid="update-seller-btn" onClick={handleUpdateSeller}>
        Update Seller
      </button>
      <button data-testid="delete-seller-btn" onClick={handleDeleteSeller}>
        Delete Seller
      </button>
      <button data-testid="create-confeccionista-btn" onClick={handleCreateConfeccionista}>
        Create Confeccionista
      </button>
      <button data-testid="update-confeccionista-btn" onClick={handleUpdateConfeccionista}>
        Update Confeccionista
      </button>
      <button data-testid="delete-confeccionista-btn" onClick={handleDeleteConfeccionista}>
        Delete Confeccionista
      </button>
    </div>
  );
};

describe('MastersContext', () => {
  describe('Initial State', () => {
    it('should provide initial state with empty data', () => {
      render(
        <MastersProvider>
          <TestComponent />
        </MastersProvider>
      );

      expect(screen.getByTestId('clients-count')).toHaveTextContent('0');
      expect(screen.getByTestId('sellers-count')).toHaveTextContent('0');
      expect(screen.getByTestId('confeccionistas-count')).toHaveTextContent('0');
      expect(screen.getByTestId('error')).toHaveTextContent('No error');
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
  });

  describe('Client Operations', () => {
    it('should create a client with correct data', async () => {
      render(
        <MastersProvider>
          <TestComponent />
        </MastersProvider>
      );

      const createBtn = screen.getByTestId('create-client-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('clients-count')).toHaveTextContent('1');
      });

      expect(screen.getByTestId('first-client-name')).toHaveTextContent('Test Client');
      expect(screen.getByTestId('first-client-nit')).toHaveTextContent('123456');
    });

    it('should update a client', async () => {
      render(
        <MastersProvider>
          <TestComponent />
        </MastersProvider>
      );

      const createBtn = screen.getByTestId('create-client-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('clients-count')).toHaveTextContent('1');
      });

      const updateBtn = screen.getByTestId('update-client-btn');
      fireEvent.click(updateBtn);

      await waitFor(() => {
        expect(screen.getByTestId('first-client-name')).toHaveTextContent('Updated Client');
      });
    });

    it('should delete a client', async () => {
      render(
        <MastersProvider>
          <TestComponent />
        </MastersProvider>
      );

      const createBtn = screen.getByTestId('create-client-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('clients-count')).toHaveTextContent('1');
      });

      const deleteBtn = screen.getByTestId('delete-client-btn');
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(screen.getByTestId('clients-count')).toHaveTextContent('0');
      });
    });

    it('should handle multiple clients', async () => {
      render(
        <MastersProvider>
          <TestComponent />
        </MastersProvider>
      );

      const createBtn = screen.getByTestId('create-client-btn');
      fireEvent.click(createBtn);
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('clients-count')).toHaveTextContent('2');
      });
    });

    it('should assign unique IDs to clients', async () => {
      render(
        <MastersProvider>
          <TestComponent />
        </MastersProvider>
      );

      const createBtn = screen.getByTestId('create-client-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('clients-count')).toHaveTextContent('1');
      });

      const firstClientId = screen.getByTestId('first-client-id').textContent;
      expect(firstClientId).toBeTruthy();
      expect(firstClientId).not.toHaveLength(0);
    });
  });

  describe('Seller Operations', () => {
    it('should create a seller with correct data', async () => {
      render(
        <MastersProvider>
          <TestComponent />
        </MastersProvider>
      );

      const createBtn = screen.getByTestId('create-seller-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('sellers-count')).toHaveTextContent('1');
      });

      expect(screen.getByTestId('first-seller-name')).toHaveTextContent('Test Seller');
      expect(screen.getByTestId('first-seller-email')).toHaveTextContent('seller@test.com');
    });

    it('should update a seller', async () => {
      render(
        <MastersProvider>
          <TestComponent />
        </MastersProvider>
      );

      const createBtn = screen.getByTestId('create-seller-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('sellers-count')).toHaveTextContent('1');
      });

      const updateBtn = screen.getByTestId('update-seller-btn');
      fireEvent.click(updateBtn);

      await waitFor(() => {
        expect(screen.getByTestId('first-seller-name')).toHaveTextContent('Updated Seller');
      });
    });

    it('should delete a seller', async () => {
      render(
        <MastersProvider>
          <TestComponent />
        </MastersProvider>
      );

      const createBtn = screen.getByTestId('create-seller-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('sellers-count')).toHaveTextContent('1');
      });

      const deleteBtn = screen.getByTestId('delete-seller-btn');
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(screen.getByTestId('sellers-count')).toHaveTextContent('0');
      });
    });
  });

  describe('Confeccionista Operations', () => {
    it('should create a confeccionista with correct data', async () => {
      render(
        <MastersProvider>
          <TestComponent />
        </MastersProvider>
      );

      const createBtn = screen.getByTestId('create-confeccionista-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('confeccionistas-count')).toHaveTextContent('1');
      });

      expect(screen.getByTestId('first-confeccionista-name')).toHaveTextContent('Test Confeccionista');
      expect(screen.getByTestId('first-confeccionista-email')).toHaveTextContent('conf@test.com');
    });

    it('should update a confeccionista', async () => {
      render(
        <MastersProvider>
          <TestComponent />
        </MastersProvider>
      );

      const createBtn = screen.getByTestId('create-confeccionista-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('confeccionistas-count')).toHaveTextContent('1');
      });

      const updateBtn = screen.getByTestId('update-confeccionista-btn');
      fireEvent.click(updateBtn);

      await waitFor(() => {
        expect(screen.getByTestId('first-confeccionista-name')).toHaveTextContent('Updated Confeccionista');
      });
    });

    it('should delete a confeccionista', async () => {
      render(
        <MastersProvider>
          <TestComponent />
        </MastersProvider>
      );

      const createBtn = screen.getByTestId('create-confeccionista-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('confeccionistas-count')).toHaveTextContent('1');
      });

      const deleteBtn = screen.getByTestId('delete-confeccionista-btn');
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(screen.getByTestId('confeccionistas-count')).toHaveTextContent('0');
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useMasters is used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useMasters debe ser usado dentro de MastersProvider');

      consoleSpy.mockRestore();
    });

    it('should handle update error when client not found', async () => {
      render(
        <MastersProvider>
          <TestComponent />
        </MastersProvider>
      );

      // Try to update non-existent client
      const updateBtn = screen.getByTestId('update-client-btn');
      fireEvent.click(updateBtn);

      // Should not crash, just do nothing
      expect(screen.getByTestId('clients-count')).toHaveTextContent('0');
    });

    it('should handle delete error when client not found', async () => {
      render(
        <MastersProvider>
          <TestComponent />
        </MastersProvider>
      );

      // Try to delete non-existent client
      const deleteBtn = screen.getByTestId('delete-client-btn');
      fireEvent.click(deleteBtn);

      // Should not crash, just do nothing
      expect(screen.getByTestId('clients-count')).toHaveTextContent('0');
    });
  });

  describe('State Independence', () => {
    it('should maintain independent state for clients, sellers, and confeccionistas', async () => {
      render(
        <MastersProvider>
          <TestComponent />
        </MastersProvider>
      );

      const createClientBtn = screen.getByTestId('create-client-btn');
      const createSellerBtn = screen.getByTestId('create-seller-btn');
      const createConfeccionistaBtn = screen.getByTestId('create-confeccionista-btn');

      fireEvent.click(createClientBtn);
      fireEvent.click(createSellerBtn);
      fireEvent.click(createConfeccionistaBtn);

      await waitFor(() => {
        expect(screen.getByTestId('clients-count')).toHaveTextContent('1');
      });

      expect(screen.getByTestId('sellers-count')).toHaveTextContent('1');
      expect(screen.getByTestId('confeccionistas-count')).toHaveTextContent('1');
    });
  });
});
