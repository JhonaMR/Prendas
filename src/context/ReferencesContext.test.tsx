/**
 * Unit tests para ReferencesContext
 * **Validates: Requirements 2.5**
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReferencesProvider } from './ReferencesContext';
import { useReferences } from './useContexts';

// Componente de prueba que usa el contexto
const TestComponent = () => {
  const {
    references,
    loading,
    error,
    createReference,
    updateReference,
    deleteReference,
    fetchReferences
  } = useReferences();

  const handleCreateReference = async () => {
    await createReference({
      description: 'Test Reference',
      price: 100,
      designer: 'Designer 1',
      correrias: ['correria1']
    });
  };

  const handleUpdateReference = async () => {
    if (references.length > 0) {
      await updateReference(references[0].id, { price: 150 });
    }
  };

  const handleDeleteReference = async () => {
    if (references.length > 0) {
      await deleteReference(references[0].id);
    }
  };

  const handleFetchReferences = async () => {
    await fetchReferences(1, 50);
  };

  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <div data-testid="references-count">{references.length}</div>
      {references.length > 0 && (
        <>
          <div data-testid="first-reference-price">{references[0].price}</div>
          <div data-testid="first-reference-id">{references[0].id}</div>
          <div data-testid="first-reference-description">{references[0].description}</div>
          <div data-testid="first-reference-designer">{references[0].designer}</div>
        </>
      )}
      <button data-testid="create-reference-btn" onClick={handleCreateReference}>
        Create Reference
      </button>
      <button data-testid="update-reference-btn" onClick={handleUpdateReference}>
        Update Reference
      </button>
      <button data-testid="delete-reference-btn" onClick={handleDeleteReference}>
        Delete Reference
      </button>
      <button data-testid="fetch-references-btn" onClick={handleFetchReferences}>
        Fetch References
      </button>
    </div>
  );
};

describe('ReferencesContext', () => {
  describe('Initial State', () => {
    it('should provide initial state with empty references', () => {
      render(
        <ReferencesProvider>
          <TestComponent />
        </ReferencesProvider>
      );

      expect(screen.getByTestId('references-count')).toHaveTextContent('0');
      expect(screen.getByTestId('error')).toHaveTextContent('No error');
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
  });

  describe('Reference Creation', () => {
    it('should create a reference with correct data', async () => {
      render(
        <ReferencesProvider>
          <TestComponent />
        </ReferencesProvider>
      );

      const createBtn = screen.getByTestId('create-reference-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('references-count')).toHaveTextContent('1');
      });

      expect(screen.getByTestId('first-reference-price')).toHaveTextContent('100');
      expect(screen.getByTestId('first-reference-description')).toHaveTextContent('Test Reference');
      expect(screen.getByTestId('first-reference-designer')).toHaveTextContent('Designer 1');
    });

    it('should assign unique ID to reference', async () => {
      render(
        <ReferencesProvider>
          <TestComponent />
        </ReferencesProvider>
      );

      const createBtn = screen.getByTestId('create-reference-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('references-count')).toHaveTextContent('1');
      });

      const referenceId = screen.getByTestId('first-reference-id').textContent;
      expect(referenceId).toBeTruthy();
      expect(referenceId).not.toHaveLength(0);
    });

    it('should handle multiple references', async () => {
      render(
        <ReferencesProvider>
          <TestComponent />
        </ReferencesProvider>
      );

      const createBtn = screen.getByTestId('create-reference-btn');
      fireEvent.click(createBtn);
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('references-count')).toHaveTextContent('2');
      });
    });
  });

  describe('Reference Update', () => {
    it('should update a reference', async () => {
      render(
        <ReferencesProvider>
          <TestComponent />
        </ReferencesProvider>
      );

      const createBtn = screen.getByTestId('create-reference-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('references-count')).toHaveTextContent('1');
      });

      const updateBtn = screen.getByTestId('update-reference-btn');
      fireEvent.click(updateBtn);

      await waitFor(() => {
        expect(screen.getByTestId('first-reference-price')).toHaveTextContent('150');
      });
    });

    it('should preserve reference ID after update', async () => {
      render(
        <ReferencesProvider>
          <TestComponent />
        </ReferencesProvider>
      );

      const createBtn = screen.getByTestId('create-reference-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('references-count')).toHaveTextContent('1');
      });

      const originalId = screen.getByTestId('first-reference-id').textContent;

      const updateBtn = screen.getByTestId('update-reference-btn');
      fireEvent.click(updateBtn);

      await waitFor(() => {
        expect(screen.getByTestId('first-reference-price')).toHaveTextContent('150');
      });

      const updatedId = screen.getByTestId('first-reference-id').textContent;
      expect(updatedId).toBe(originalId);
    });
  });

  describe('Reference Deletion', () => {
    it('should delete a reference', async () => {
      render(
        <ReferencesProvider>
          <TestComponent />
        </ReferencesProvider>
      );

      const createBtn = screen.getByTestId('create-reference-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('references-count')).toHaveTextContent('1');
      });

      const deleteBtn = screen.getByTestId('delete-reference-btn');
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(screen.getByTestId('references-count')).toHaveTextContent('0');
      });
    });

    it('should handle deletion of non-existent reference', async () => {
      render(
        <ReferencesProvider>
          <TestComponent />
        </ReferencesProvider>
      );

      // Try to delete when no references exist
      const deleteBtn = screen.getByTestId('delete-reference-btn');
      fireEvent.click(deleteBtn);

      // Should not crash
      expect(screen.getByTestId('references-count')).toHaveTextContent('0');
    });
  });

  describe('Fetch Operations', () => {
    it('should handle fetchReferences with pagination', async () => {
      render(
        <ReferencesProvider>
          <TestComponent />
        </ReferencesProvider>
      );

      const fetchBtn = screen.getByTestId('fetch-references-btn');
      fireEvent.click(fetchBtn);

      // Should set loading to false after fetch
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useReferences is used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useReferences debe ser usado dentro de ReferencesProvider');

      consoleSpy.mockRestore();
    });

    it('should handle update error when reference not found', async () => {
      render(
        <ReferencesProvider>
          <TestComponent />
        </ReferencesProvider>
      );

      // Try to update non-existent reference
      const updateBtn = screen.getByTestId('update-reference-btn');
      fireEvent.click(updateBtn);

      // Should not crash
      expect(screen.getByTestId('references-count')).toHaveTextContent('0');
    });
  });

  describe('State Consistency', () => {
    it('should maintain correct reference count after multiple operations', async () => {
      render(
        <ReferencesProvider>
          <TestComponent />
        </ReferencesProvider>
      );

      const createBtn = screen.getByTestId('create-reference-btn');
      const deleteBtn = screen.getByTestId('delete-reference-btn');

      fireEvent.click(createBtn);
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('references-count')).toHaveTextContent('2');
      });

      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(screen.getByTestId('references-count')).toHaveTextContent('1');
      });

      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(screen.getByTestId('references-count')).toHaveTextContent('0');
      });
    });
  });
});
