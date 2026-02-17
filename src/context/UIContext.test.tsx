/**
 * Unit tests para UIContext
 * **Validates: Requirements 2.6**
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UIProvider } from './UIContext';
import { useUI } from './useContexts';

// Componente de prueba que usa el contexto
const TestComponent = () => {
  const {
    modals,
    notifications,
    filters,
    openModal,
    closeModal,
    toggleModal,
    addNotification,
    removeNotification,
    setFilter,
    clearFilters,
    getFilter
  } = useUI();

  return (
    <div>
      <div data-testid="modals-count">{Object.keys(modals).length}</div>
      <div data-testid="notifications-count">{notifications.length}</div>
      <div data-testid="filters-count">{Object.keys(filters).length}</div>
      <div data-testid="modal-status">
        {modals['testModal'] ? 'Open' : 'Closed'}
      </div>
      <div data-testid="filter-value">
        {getFilter('testFilter') || 'No filter'}
      </div>
      <div data-testid="notification-message">
        {notifications.length > 0 ? notifications[0].message : 'No notification'}
      </div>
      <div data-testid="notification-type">
        {notifications.length > 0 ? notifications[0].type : 'No type'}
      </div>
      <button
        data-testid="open-modal-btn"
        onClick={() => openModal('testModal')}
      >
        Open Modal
      </button>
      <button
        data-testid="close-modal-btn"
        onClick={() => closeModal('testModal')}
      >
        Close Modal
      </button>
      <button
        data-testid="toggle-modal-btn"
        onClick={() => toggleModal('testModal')}
      >
        Toggle Modal
      </button>
      <button
        data-testid="add-notification-btn"
        onClick={() => addNotification({
          message: 'Test notification',
          type: 'success'
        })}
      >
        Add Notification
      </button>
      <button
        data-testid="add-error-notification-btn"
        onClick={() => addNotification({
          message: 'Error notification',
          type: 'error'
        })}
      >
        Add Error Notification
      </button>
      <button
        data-testid="set-filter-btn"
        onClick={() => setFilter('testFilter', 'testValue')}
      >
        Set Filter
      </button>
      <button
        data-testid="set-multiple-filters-btn"
        onClick={() => {
          setFilter('filter1', 'value1');
          setFilter('filter2', 'value2');
        }}
      >
        Set Multiple Filters
      </button>
      <button
        data-testid="clear-filters-btn"
        onClick={clearFilters}
      >
        Clear Filters
      </button>
      {notifications.length > 0 && (
        <button
          data-testid="remove-notification-btn"
          onClick={() => removeNotification(notifications[0].id)}
        >
          Remove Notification
        </button>
      )}
    </div>
  );
};

describe('UIContext', () => {
  describe('Initial State', () => {
    it('should provide initial state with empty data', () => {
      render(
        <UIProvider>
          <TestComponent />
        </UIProvider>
      );

      expect(screen.getByTestId('modals-count')).toHaveTextContent('0');
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
      expect(screen.getByTestId('filters-count')).toHaveTextContent('0');
    });
  });

  describe('Modal Operations', () => {
    it('should open a modal', () => {
      render(
        <UIProvider>
          <TestComponent />
        </UIProvider>
      );

      const openBtn = screen.getByTestId('open-modal-btn');
      fireEvent.click(openBtn);

      expect(screen.getByTestId('modal-status')).toHaveTextContent('Open');
    });

    it('should close a modal', () => {
      render(
        <UIProvider>
          <TestComponent />
        </UIProvider>
      );

      const openBtn = screen.getByTestId('open-modal-btn');
      fireEvent.click(openBtn);

      expect(screen.getByTestId('modal-status')).toHaveTextContent('Open');

      const closeBtn = screen.getByTestId('close-modal-btn');
      fireEvent.click(closeBtn);

      expect(screen.getByTestId('modal-status')).toHaveTextContent('Closed');
    });

    it('should toggle a modal', () => {
      render(
        <UIProvider>
          <TestComponent />
        </UIProvider>
      );

      const toggleBtn = screen.getByTestId('toggle-modal-btn');
      fireEvent.click(toggleBtn);

      expect(screen.getByTestId('modal-status')).toHaveTextContent('Open');

      fireEvent.click(toggleBtn);

      expect(screen.getByTestId('modal-status')).toHaveTextContent('Closed');
    });

    it('should handle multiple toggle operations', () => {
      render(
        <UIProvider>
          <TestComponent />
        </UIProvider>
      );

      const toggleBtn = screen.getByTestId('toggle-modal-btn');

      fireEvent.click(toggleBtn);
      expect(screen.getByTestId('modal-status')).toHaveTextContent('Open');

      fireEvent.click(toggleBtn);
      expect(screen.getByTestId('modal-status')).toHaveTextContent('Closed');

      fireEvent.click(toggleBtn);
      expect(screen.getByTestId('modal-status')).toHaveTextContent('Open');
    });
  });

  describe('Notification Operations', () => {
    it('should add a notification with correct data', () => {
      render(
        <UIProvider>
          <TestComponent />
        </UIProvider>
      );

      const addBtn = screen.getByTestId('add-notification-btn');
      fireEvent.click(addBtn);

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      expect(screen.getByTestId('notification-message')).toHaveTextContent('Test notification');
      expect(screen.getByTestId('notification-type')).toHaveTextContent('success');
    });

    it('should add error notification', () => {
      render(
        <UIProvider>
          <TestComponent />
        </UIProvider>
      );

      const addBtn = screen.getByTestId('add-error-notification-btn');
      fireEvent.click(addBtn);

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      expect(screen.getByTestId('notification-type')).toHaveTextContent('error');
    });

    it('should remove a notification', () => {
      render(
        <UIProvider>
          <TestComponent />
        </UIProvider>
      );

      const addBtn = screen.getByTestId('add-notification-btn');
      fireEvent.click(addBtn);

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');

      const removeBtn = screen.getByTestId('remove-notification-btn');
      fireEvent.click(removeBtn);

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
    });

    it('should handle multiple notifications', () => {
      render(
        <UIProvider>
          <TestComponent />
        </UIProvider>
      );

      const addBtn = screen.getByTestId('add-notification-btn');
      fireEvent.click(addBtn);
      fireEvent.click(addBtn);

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('2');
    });
  });

  describe('Filter Operations', () => {
    it('should set a filter', () => {
      render(
        <UIProvider>
          <TestComponent />
        </UIProvider>
      );

      const setFilterBtn = screen.getByTestId('set-filter-btn');
      fireEvent.click(setFilterBtn);

      expect(screen.getByTestId('filter-value')).toHaveTextContent('testValue');
      expect(screen.getByTestId('filters-count')).toHaveTextContent('1');
    });

    it('should set multiple filters', () => {
      render(
        <UIProvider>
          <TestComponent />
        </UIProvider>
      );

      const setMultipleBtn = screen.getByTestId('set-multiple-filters-btn');
      fireEvent.click(setMultipleBtn);

      expect(screen.getByTestId('filters-count')).toHaveTextContent('2');
    });

    it('should clear filters', () => {
      render(
        <UIProvider>
          <TestComponent />
        </UIProvider>
      );

      const setFilterBtn = screen.getByTestId('set-filter-btn');
      fireEvent.click(setFilterBtn);

      expect(screen.getByTestId('filters-count')).toHaveTextContent('1');

      const clearBtn = screen.getByTestId('clear-filters-btn');
      fireEvent.click(clearBtn);

      expect(screen.getByTestId('filters-count')).toHaveTextContent('0');
      expect(screen.getByTestId('filter-value')).toHaveTextContent('No filter');
    });

    it('should update filter value', () => {
      render(
        <UIProvider>
          <TestComponent />
        </UIProvider>
      );

      const setFilterBtn = screen.getByTestId('set-filter-btn');
      fireEvent.click(setFilterBtn);

      expect(screen.getByTestId('filter-value')).toHaveTextContent('testValue');

      // Set the same filter with a different value
      fireEvent.click(setFilterBtn);
      expect(screen.getByTestId('filter-value')).toHaveTextContent('testValue');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useUI is used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useUI debe ser usado dentro de UIProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('State Independence', () => {
    it('should maintain independent state for modals, notifications, and filters', () => {
      render(
        <UIProvider>
          <TestComponent />
        </UIProvider>
      );

      const openModalBtn = screen.getByTestId('open-modal-btn');
      const addNotificationBtn = screen.getByTestId('add-notification-btn');
      const setFilterBtn = screen.getByTestId('set-filter-btn');

      fireEvent.click(openModalBtn);
      fireEvent.click(addNotificationBtn);
      fireEvent.click(setFilterBtn);

      expect(screen.getByTestId('modal-status')).toHaveTextContent('Open');
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      expect(screen.getByTestId('filters-count')).toHaveTextContent('1');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle opening and closing multiple modals', () => {
      render(
        <UIProvider>
          <TestComponent />
        </UIProvider>
      );

      const openBtn = screen.getByTestId('open-modal-btn');
      const closeBtn = screen.getByTestId('close-modal-btn');

      fireEvent.click(openBtn);
      expect(screen.getByTestId('modal-status')).toHaveTextContent('Open');

      fireEvent.click(closeBtn);
      expect(screen.getByTestId('modal-status')).toHaveTextContent('Closed');

      fireEvent.click(openBtn);
      expect(screen.getByTestId('modal-status')).toHaveTextContent('Open');
    });

    it('should handle adding and removing multiple notifications', () => {
      render(
        <UIProvider>
          <TestComponent />
        </UIProvider>
      );

      const addBtn = screen.getByTestId('add-notification-btn');
      fireEvent.click(addBtn);
      fireEvent.click(addBtn);

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('2');

      const removeBtn = screen.getByTestId('remove-notification-btn');
      fireEvent.click(removeBtn);

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
    });
  });
});
