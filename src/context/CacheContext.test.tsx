/**
 * Unit tests para CacheContext
 * **Validates: Requirements 2.7**
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CacheProvider } from './CacheContext';
import { useCache } from './useContexts';

// Componente de prueba que usa el contexto
const TestComponent = () => {
  const {
    cacheStats,
    isCacheEnabled,
    enableCache,
    disableCache,
    clearCache,
    invalidateCache,
    updateStats
  } = useCache();

  return (
    <div>
      <div data-testid="cache-enabled">
        {isCacheEnabled ? 'Enabled' : 'Disabled'}
      </div>
      <div data-testid="cache-size">{cacheStats.size}</div>
      <div data-testid="cache-hits">{cacheStats.hits}</div>
      <div data-testid="cache-misses">{cacheStats.misses}</div>
      <button data-testid="enable-cache-btn" onClick={enableCache}>
        Enable Cache
      </button>
      <button data-testid="disable-cache-btn" onClick={disableCache}>
        Disable Cache
      </button>
      <button data-testid="clear-cache-btn" onClick={clearCache}>
        Clear Cache
      </button>
      <button
        data-testid="invalidate-cache-btn"
        onClick={() => invalidateCache('clients:*')}
      >
        Invalidate Cache
      </button>
      <button
        data-testid="update-stats-btn"
        onClick={() => updateStats({ size: 10, hits: 5, misses: 2 })}
      >
        Update Stats
      </button>
      <button
        data-testid="update-stats-large-btn"
        onClick={() => updateStats({ size: 500, hits: 1000, misses: 100 })}
      >
        Update Stats Large
      </button>
    </div>
  );
};

describe('CacheContext', () => {
  describe('Initial State', () => {
    it('should provide initial state with cache enabled', () => {
      render(
        <CacheProvider>
          <TestComponent />
        </CacheProvider>
      );

      expect(screen.getByTestId('cache-enabled')).toHaveTextContent('Enabled');
      expect(screen.getByTestId('cache-size')).toHaveTextContent('0');
      expect(screen.getByTestId('cache-hits')).toHaveTextContent('0');
      expect(screen.getByTestId('cache-misses')).toHaveTextContent('0');
    });
  });

  describe('Cache Enable/Disable', () => {
    it('should enable cache', () => {
      render(
        <CacheProvider>
          <TestComponent />
        </CacheProvider>
      );

      const disableBtn = screen.getByTestId('disable-cache-btn');
      fireEvent.click(disableBtn);

      expect(screen.getByTestId('cache-enabled')).toHaveTextContent('Disabled');

      const enableBtn = screen.getByTestId('enable-cache-btn');
      fireEvent.click(enableBtn);

      expect(screen.getByTestId('cache-enabled')).toHaveTextContent('Enabled');
    });

    it('should disable cache', () => {
      render(
        <CacheProvider>
          <TestComponent />
        </CacheProvider>
      );

      const disableBtn = screen.getByTestId('disable-cache-btn');
      fireEvent.click(disableBtn);

      expect(screen.getByTestId('cache-enabled')).toHaveTextContent('Disabled');
    });

    it('should handle multiple enable/disable cycles', () => {
      render(
        <CacheProvider>
          <TestComponent />
        </CacheProvider>
      );

      const enableBtn = screen.getByTestId('enable-cache-btn');
      const disableBtn = screen.getByTestId('disable-cache-btn');

      fireEvent.click(disableBtn);
      expect(screen.getByTestId('cache-enabled')).toHaveTextContent('Disabled');

      fireEvent.click(enableBtn);
      expect(screen.getByTestId('cache-enabled')).toHaveTextContent('Enabled');

      fireEvent.click(disableBtn);
      expect(screen.getByTestId('cache-enabled')).toHaveTextContent('Disabled');
    });
  });

  describe('Cache Clear', () => {
    it('should clear cache', () => {
      render(
        <CacheProvider>
          <TestComponent />
        </CacheProvider>
      );

      const updateStatsBtn = screen.getByTestId('update-stats-btn');
      fireEvent.click(updateStatsBtn);

      expect(screen.getByTestId('cache-size')).toHaveTextContent('10');
      expect(screen.getByTestId('cache-hits')).toHaveTextContent('5');
      expect(screen.getByTestId('cache-misses')).toHaveTextContent('2');

      const clearBtn = screen.getByTestId('clear-cache-btn');
      fireEvent.click(clearBtn);

      expect(screen.getByTestId('cache-size')).toHaveTextContent('0');
      expect(screen.getByTestId('cache-hits')).toHaveTextContent('0');
      expect(screen.getByTestId('cache-misses')).toHaveTextContent('0');
    });

    it('should clear cache even when already empty', () => {
      render(
        <CacheProvider>
          <TestComponent />
        </CacheProvider>
      );

      const clearBtn = screen.getByTestId('clear-cache-btn');
      fireEvent.click(clearBtn);

      expect(screen.getByTestId('cache-size')).toHaveTextContent('0');
      expect(screen.getByTestId('cache-hits')).toHaveTextContent('0');
      expect(screen.getByTestId('cache-misses')).toHaveTextContent('0');
    });
  });

  describe('Cache Stats Update', () => {
    it('should update cache stats', () => {
      render(
        <CacheProvider>
          <TestComponent />
        </CacheProvider>
      );

      const updateStatsBtn = screen.getByTestId('update-stats-btn');
      fireEvent.click(updateStatsBtn);

      expect(screen.getByTestId('cache-size')).toHaveTextContent('10');
      expect(screen.getByTestId('cache-hits')).toHaveTextContent('5');
      expect(screen.getByTestId('cache-misses')).toHaveTextContent('2');
    });

    it('should update cache stats with large values', () => {
      render(
        <CacheProvider>
          <TestComponent />
        </CacheProvider>
      );

      const updateStatsBtn = screen.getByTestId('update-stats-large-btn');
      fireEvent.click(updateStatsBtn);

      expect(screen.getByTestId('cache-size')).toHaveTextContent('500');
      expect(screen.getByTestId('cache-hits')).toHaveTextContent('1000');
      expect(screen.getByTestId('cache-misses')).toHaveTextContent('100');
    });

    it('should handle multiple stats updates', () => {
      render(
        <CacheProvider>
          <TestComponent />
        </CacheProvider>
      );

      const updateStatsBtn = screen.getByTestId('update-stats-btn');
      fireEvent.click(updateStatsBtn);

      expect(screen.getByTestId('cache-size')).toHaveTextContent('10');

      const updateStatsLargeBtn = screen.getByTestId('update-stats-large-btn');
      fireEvent.click(updateStatsLargeBtn);

      expect(screen.getByTestId('cache-size')).toHaveTextContent('500');
      expect(screen.getByTestId('cache-hits')).toHaveTextContent('1000');
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate cache pattern', () => {
      render(
        <CacheProvider>
          <TestComponent />
        </CacheProvider>
      );

      const invalidateBtn = screen.getByTestId('invalidate-cache-btn');
      fireEvent.click(invalidateBtn);

      // Cache should still be enabled after invalidation
      expect(screen.getByTestId('cache-enabled')).toHaveTextContent('Enabled');
    });

    it('should handle invalidation with stats', () => {
      render(
        <CacheProvider>
          <TestComponent />
        </CacheProvider>
      );

      const updateStatsBtn = screen.getByTestId('update-stats-btn');
      fireEvent.click(updateStatsBtn);

      expect(screen.getByTestId('cache-size')).toHaveTextContent('10');

      const invalidateBtn = screen.getByTestId('invalidate-cache-btn');
      fireEvent.click(invalidateBtn);

      // Stats should remain unchanged after invalidation
      expect(screen.getByTestId('cache-size')).toHaveTextContent('10');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useCache is used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useCache debe ser usado dentro de CacheProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('State Consistency', () => {
    it('should maintain cache state across operations', () => {
      render(
        <CacheProvider>
          <TestComponent />
        </CacheProvider>
      );

      // Initial state
      expect(screen.getByTestId('cache-enabled')).toHaveTextContent('Enabled');

      // Update stats
      const updateStatsBtn = screen.getByTestId('update-stats-btn');
      fireEvent.click(updateStatsBtn);

      expect(screen.getByTestId('cache-size')).toHaveTextContent('10');
      expect(screen.getByTestId('cache-enabled')).toHaveTextContent('Enabled');

      // Disable cache
      const disableBtn = screen.getByTestId('disable-cache-btn');
      fireEvent.click(disableBtn);

      expect(screen.getByTestId('cache-enabled')).toHaveTextContent('Disabled');
      expect(screen.getByTestId('cache-size')).toHaveTextContent('10');

      // Clear cache
      const clearBtn = screen.getByTestId('clear-cache-btn');
      fireEvent.click(clearBtn);

      expect(screen.getByTestId('cache-size')).toHaveTextContent('0');
      expect(screen.getByTestId('cache-enabled')).toHaveTextContent('Disabled');
    });

    it('should maintain correct stats after clear and update', () => {
      render(
        <CacheProvider>
          <TestComponent />
        </CacheProvider>
      );

      const updateStatsBtn = screen.getByTestId('update-stats-btn');
      fireEvent.click(updateStatsBtn);

      expect(screen.getByTestId('cache-size')).toHaveTextContent('10');

      const clearBtn = screen.getByTestId('clear-cache-btn');
      fireEvent.click(clearBtn);

      expect(screen.getByTestId('cache-size')).toHaveTextContent('0');

      fireEvent.click(updateStatsBtn);

      expect(screen.getByTestId('cache-size')).toHaveTextContent('10');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle complete cache lifecycle', () => {
      render(
        <CacheProvider>
          <TestComponent />
        </CacheProvider>
      );

      // Start with cache enabled
      expect(screen.getByTestId('cache-enabled')).toHaveTextContent('Enabled');

      // Add some stats
      const updateStatsBtn = screen.getByTestId('update-stats-btn');
      fireEvent.click(updateStatsBtn);

      expect(screen.getByTestId('cache-size')).toHaveTextContent('10');

      // Disable cache
      const disableBtn = screen.getByTestId('disable-cache-btn');
      fireEvent.click(disableBtn);

      expect(screen.getByTestId('cache-enabled')).toHaveTextContent('Disabled');

      // Invalidate cache
      const invalidateBtn = screen.getByTestId('invalidate-cache-btn');
      fireEvent.click(invalidateBtn);

      // Clear cache
      const clearBtn = screen.getByTestId('clear-cache-btn');
      fireEvent.click(clearBtn);

      expect(screen.getByTestId('cache-size')).toHaveTextContent('0');

      // Re-enable cache
      const enableBtn = screen.getByTestId('enable-cache-btn');
      fireEvent.click(enableBtn);

      expect(screen.getByTestId('cache-enabled')).toHaveTextContent('Enabled');
    });
  });
});
