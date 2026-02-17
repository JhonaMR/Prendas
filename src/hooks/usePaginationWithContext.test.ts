import { renderHook, act } from '@testing-library/react';
import { usePaginationWithContext } from './usePaginationWithContext';

describe('usePaginationWithContext', () => {
  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => usePaginationWithContext());
      
      expect(result.current.pagination.currentPage).toBe(1);
      expect(result.current.pagination.pageSize).toBe(25);
      expect(result.current.pagination.total).toBe(0);
      expect(result.current.pagination.totalPages).toBe(1);
    });

    it('should initialize with custom values', () => {
      const { result } = renderHook(() => usePaginationWithContext(2, 50));
      
      expect(result.current.pagination.currentPage).toBe(2);
      expect(result.current.pagination.pageSize).toBe(50);
    });
  });

  describe('goToPage', () => {
    it('should navigate to a valid page', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 10));
      
      act(() => {
        result.current.getPaginatedData(Array(100).fill(null));
      });

      act(() => {
        result.current.goToPage(5);
      });
      
      expect(result.current.pagination.currentPage).toBe(5);
    });

    it('should not go below page 1', () => {
      const { result } = renderHook(() => usePaginationWithContext());
      
      act(() => {
        result.current.goToPage(0);
      });
      
      expect(result.current.pagination.currentPage).toBe(1);
    });

    it('should not go beyond total pages', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 10));
      
      act(() => {
        result.current.getPaginatedData(Array(50).fill(null));
      });

      act(() => {
        result.current.goToPage(100);
      });
      
      expect(result.current.pagination.currentPage).toBe(5);
    });
  });

  describe('setPageSize', () => {
    it('should change page size', () => {
      const { result } = renderHook(() => usePaginationWithContext());
      
      act(() => {
        result.current.setPageSize(50);
      });
      
      expect(result.current.pagination.pageSize).toBe(50);
    });

    it('should reset to page 1 when changing page size', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 10));
      
      act(() => {
        result.current.getPaginatedData(Array(100).fill(null));
        result.current.goToPage(5);
        result.current.setPageSize(20);
      });
      
      expect(result.current.pagination.currentPage).toBe(1);
      expect(result.current.pagination.pageSize).toBe(20);
    });

    it('should not set page size below 1', () => {
      const { result } = renderHook(() => usePaginationWithContext());
      
      act(() => {
        result.current.setPageSize(0);
      });
      
      expect(result.current.pagination.pageSize).toBe(1);
    });

    it('should not set page size above 100', () => {
      const { result } = renderHook(() => usePaginationWithContext());
      
      act(() => {
        result.current.setPageSize(200);
      });
      
      expect(result.current.pagination.pageSize).toBe(100);
    });
  });

  describe('getPaginatedData', () => {
    it('should return correct slice of data', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 10));
      const data = Array.from({ length: 100 }, (_, i) => i);
      
      let paginatedData;
      act(() => {
        paginatedData = result.current.getPaginatedData(data);
      });
      
      expect(paginatedData).toEqual(Array.from({ length: 10 }, (_, i) => i));
    });

    it('should return correct slice for different pages', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 10));
      const data = Array.from({ length: 100 }, (_, i) => i);
      
      act(() => {
        result.current.getPaginatedData(data);
      });

      act(() => {
        result.current.goToPage(2);
      });
      
      let paginatedData;
      act(() => {
        paginatedData = result.current.getPaginatedData(data);
      });
      
      expect(paginatedData).toEqual(Array.from({ length: 10 }, (_, i) => i + 10));
    });

    it('should handle last page with fewer items', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 10));
      const data = Array.from({ length: 25 }, (_, i) => i);
      
      act(() => {
        result.current.getPaginatedData(data);
      });

      act(() => {
        result.current.goToPage(3);
      });
      
      let paginatedData;
      act(() => {
        paginatedData = result.current.getPaginatedData(data);
      });
      
      expect(paginatedData).toEqual([20, 21, 22, 23, 24]);
    });

    it('should update total count', () => {
      const { result } = renderHook(() => usePaginationWithContext());
      const data = Array(100).fill(null);
      
      act(() => {
        result.current.getPaginatedData(data);
      });
      
      expect(result.current.pagination.total).toBe(100);
    });

    it('should calculate total pages correctly', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));
      const data = Array(100).fill(null);
      
      act(() => {
        result.current.getPaginatedData(data);
      });
      
      expect(result.current.pagination.totalPages).toBe(4);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));
      
      act(() => {
        result.current.getPaginatedData(Array(100).fill(null));
        result.current.goToPage(5);
        result.current.setPageSize(50);
        result.current.reset();
      });
      
      expect(result.current.pagination.currentPage).toBe(1);
      expect(result.current.pagination.pageSize).toBe(25);
      expect(result.current.pagination.total).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data', () => {
      const { result } = renderHook(() => usePaginationWithContext());
      
      let paginatedData;
      act(() => {
        paginatedData = result.current.getPaginatedData([]);
      });
      
      expect(paginatedData).toEqual([]);
      expect(result.current.pagination.total).toBe(0);
      expect(result.current.pagination.totalPages).toBe(1);
    });

    it('should handle single item', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 10));
      
      let paginatedData;
      act(() => {
        paginatedData = result.current.getPaginatedData([1]);
      });
      
      expect(paginatedData).toEqual([1]);
      expect(result.current.pagination.totalPages).toBe(1);
    });

    it('should handle data exactly matching page size', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 10));
      const data = Array(10).fill(null);
      
      let paginatedData;
      act(() => {
        paginatedData = result.current.getPaginatedData(data);
      });
      
      expect(paginatedData.length).toBe(10);
      expect(result.current.pagination.totalPages).toBe(1);
    });

    it('should handle very large datasets', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));
      const data = Array(10000).fill(null);
      
      act(() => {
        result.current.getPaginatedData(data);
      });
      
      expect(result.current.pagination.totalPages).toBe(400);
    });
  });
});
