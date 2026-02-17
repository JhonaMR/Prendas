import { renderHook, act } from '@testing-library/react';
import { usePaginationWithContext } from './usePaginationWithContext';

/**
 * Unit Tests para usePaginationWithContext
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9
 */
describe('usePaginationWithContext - Unit Tests', () => {
  describe('Correct Number of Items', () => {
    it('should return 25 items per page for Clients', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));
      const data = Array.from({ length: 100 }, (_, i) => i);

      let paginatedData;
      act(() => {
        paginatedData = result.current.getPaginatedData(data);
      });

      expect(paginatedData).toHaveLength(25);
      expect(paginatedData).toEqual(Array.from({ length: 25 }, (_, i) => i));
    });

    it('should return 50 items per page for References', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 50));
      const data = Array.from({ length: 200 }, (_, i) => i);

      let paginatedData;
      act(() => {
        paginatedData = result.current.getPaginatedData(data);
      });

      expect(paginatedData).toHaveLength(50);
    });

    it('should return 30 items per page for DeliveryDates', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 30));
      const data = Array.from({ length: 150 }, (_, i) => i);

      let paginatedData;
      act(() => {
        paginatedData = result.current.getPaginatedData(data);
      });

      expect(paginatedData).toHaveLength(30);
    });

    it('should return 20 items per page for Receptions/Dispatches', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 20));
      const data = Array.from({ length: 100 }, (_, i) => i);

      let paginatedData;
      act(() => {
        paginatedData = result.current.getPaginatedData(data);
      });

      expect(paginatedData).toHaveLength(20);
    });

    it('should return correct number of items on different pages', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));
      const data = Array.from({ length: 100 }, (_, i) => i);

      // Page 1
      let page1Data;
      act(() => {
        page1Data = result.current.getPaginatedData(data);
      });
      expect(page1Data).toHaveLength(25);

      // Page 2
      act(() => {
        result.current.getPaginatedData(data);
        result.current.goToPage(2);
      });
      let page2Data;
      act(() => {
        page2Data = result.current.getPaginatedData(data);
      });
      expect(page2Data).toHaveLength(25);

      // Page 4 (last page with 100 items and 25 per page)
      act(() => {
        result.current.getPaginatedData(data);
        result.current.goToPage(4);
      });
      let page4Data;
      act(() => {
        page4Data = result.current.getPaginatedData(data);
      });
      expect(page4Data).toHaveLength(25);
    });
  });

  describe('Edge Case: Page 0', () => {
    it('should not allow navigation to page 0', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));
      const data = Array.from({ length: 100 }, (_, i) => i);

      act(() => {
        result.current.getPaginatedData(data);
        result.current.goToPage(0);
      });

      expect(result.current.pagination.currentPage).toBe(1);
    });

    it('should not allow negative page numbers', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));
      const data = Array.from({ length: 100 }, (_, i) => i);

      act(() => {
        result.current.getPaginatedData(data);
        result.current.goToPage(-5);
      });

      expect(result.current.pagination.currentPage).toBe(1);
    });

    it('should return first page data when trying to go to page 0', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));
      const data = Array.from({ length: 100 }, (_, i) => i);

      act(() => {
        result.current.getPaginatedData(data);
        result.current.goToPage(0);
      });

      let paginatedData;
      act(() => {
        paginatedData = result.current.getPaginatedData(data);
      });

      expect(paginatedData).toEqual(Array.from({ length: 25 }, (_, i) => i));
    });
  });

  describe('Edge Case: Page > Total', () => {
    it('should not allow navigation beyond total pages', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));
      const data = Array.from({ length: 100 }, (_, i) => i);

      act(() => {
        result.current.getPaginatedData(data);
      });

      act(() => {
        result.current.goToPage(100);
      });

      // Total pages = 100 / 25 = 4, so goToPage(100) should limit to 4
      expect(result.current.pagination.currentPage).toBe(4);
    });

    it('should return last page data when trying to go beyond total pages', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));
      const data = Array.from({ length: 100 }, (_, i) => i);

      act(() => {
        result.current.getPaginatedData(data);
      });

      act(() => {
        result.current.goToPage(100);
      });

      let paginatedData;
      act(() => {
        paginatedData = result.current.getPaginatedData(data);
      });

      // Last page should have items 75-99
      expect(paginatedData).toEqual(Array.from({ length: 25 }, (_, i) => i + 75));
    });

    it('should calculate correct total pages', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));
      const data = Array.from({ length: 100 }, (_, i) => i);

      act(() => {
        result.current.getPaginatedData(data);
      });

      // Total pages = 100 / 25 = 4
      expect(result.current.pagination.totalPages).toBe(4);
    });

    it('should handle datasets not evenly divisible by page size', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));
      const data = Array.from({ length: 103 }, (_, i) => i);

      act(() => {
        result.current.getPaginatedData(data);
      });

      // Total pages = ceil(103 / 25) = 5
      expect(result.current.pagination.totalPages).toBe(5);

      act(() => {
        result.current.goToPage(5);
      });

      let lastPageData;
      act(() => {
        lastPageData = result.current.getPaginatedData(data);
      });

      expect(lastPageData).toHaveLength(3);
      expect(lastPageData).toEqual([100, 101, 102]);
    });
  });

  describe('Edge Case: Limit = 0', () => {
    it('should handle page size of 0 by setting to 1', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));

      act(() => {
        result.current.setPageSize(0);
      });

      expect(result.current.pagination.pageSize).toBe(1);
    });

    it('should not allow page size below 1', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));

      act(() => {
        result.current.setPageSize(-10);
      });

      expect(result.current.pagination.pageSize).toBe(1);
    });

    it('should not allow page size above 100', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));

      act(() => {
        result.current.setPageSize(200);
      });

      expect(result.current.pagination.pageSize).toBe(100);
    });

    it('should reset to page 1 when changing page size', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));
      const data = Array.from({ length: 100 }, (_, i) => i);

      act(() => {
        result.current.getPaginatedData(data);
        result.current.goToPage(3);
        result.current.setPageSize(50);
      });

      expect(result.current.pagination.currentPage).toBe(1);
      expect(result.current.pagination.pageSize).toBe(50);
    });
  });

  describe('Empty Data', () => {
    it('should handle empty data array', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));

      let paginatedData;
      act(() => {
        paginatedData = result.current.getPaginatedData([]);
      });

      expect(paginatedData).toEqual([]);
      expect(result.current.pagination.total).toBe(0);
      expect(result.current.pagination.totalPages).toBe(1);
    });

    it('should handle single item', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));

      let paginatedData;
      act(() => {
        paginatedData = result.current.getPaginatedData([1]);
      });

      expect(paginatedData).toEqual([1]);
      expect(result.current.pagination.total).toBe(1);
      expect(result.current.pagination.totalPages).toBe(1);
    });

    it('should handle data exactly matching page size', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));
      const data = Array.from({ length: 25 }, (_, i) => i);

      let paginatedData;
      act(() => {
        paginatedData = result.current.getPaginatedData(data);
      });

      expect(paginatedData).toHaveLength(25);
      expect(result.current.pagination.totalPages).toBe(1);
    });
  });

  describe('Data Slice Correctness', () => {
    it('should return correct slice for page 1', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));
      const data = Array.from({ length: 100 }, (_, i) => i);

      let paginatedData;
      act(() => {
        paginatedData = result.current.getPaginatedData(data);
      });

      expect(paginatedData).toEqual(Array.from({ length: 25 }, (_, i) => i));
    });

    it('should return correct slice for page 2', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));
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

      expect(paginatedData).toEqual(Array.from({ length: 25 }, (_, i) => i + 25));
    });

    it('should return correct slice for middle page', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 20));
      const data = Array.from({ length: 100 }, (_, i) => i);

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

      expect(paginatedData).toEqual(Array.from({ length: 20 }, (_, i) => i + 40));
    });

    it('should return correct slice for last page', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));
      const data = Array.from({ length: 100 }, (_, i) => i);

      act(() => {
        result.current.getPaginatedData(data);
      });

      act(() => {
        result.current.goToPage(4);
      });

      let paginatedData;
      act(() => {
        paginatedData = result.current.getPaginatedData(data);
      });

      expect(paginatedData).toEqual(Array.from({ length: 25 }, (_, i) => i + 75));
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to initial state', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));
      const data = Array.from({ length: 100 }, (_, i) => i);

      act(() => {
        result.current.getPaginatedData(data);
        result.current.goToPage(3);
        result.current.setPageSize(50);
        result.current.reset();
      });

      expect(result.current.pagination.currentPage).toBe(1);
      expect(result.current.pagination.pageSize).toBe(25);
      expect(result.current.pagination.total).toBe(0);
      expect(result.current.pagination.totalPages).toBe(1);
    });

    it('should reset with custom initial values', () => {
      const { result } = renderHook(() => usePaginationWithContext(2, 50));

      act(() => {
        result.current.goToPage(5);
        result.current.setPageSize(100);
        result.current.reset();
      });

      expect(result.current.pagination.currentPage).toBe(2);
      expect(result.current.pagination.pageSize).toBe(50);
    });
  });

  describe('Total Count Tracking', () => {
    it('should track total count correctly', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));
      const data = Array.from({ length: 100 }, (_, i) => i);

      act(() => {
        result.current.getPaginatedData(data);
      });

      expect(result.current.pagination.total).toBe(100);
    });

    it('should update total count when data changes', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));

      let paginatedData;
      act(() => {
        paginatedData = result.current.getPaginatedData(Array.from({ length: 50 }, (_, i) => i));
      });
      expect(result.current.pagination.total).toBe(50);

      act(() => {
        paginatedData = result.current.getPaginatedData(Array.from({ length: 100 }, (_, i) => i));
      });
      expect(result.current.pagination.total).toBe(100);
    });
  });

  describe('Large Datasets', () => {
    it('should handle very large datasets', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));
      const data = Array.from({ length: 10000 }, (_, i) => i);

      act(() => {
        result.current.getPaginatedData(data);
      });

      expect(result.current.pagination.total).toBe(10000);
      expect(result.current.pagination.totalPages).toBe(400);
    });

    it('should navigate correctly in large datasets', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 25));
      const data = Array.from({ length: 10000 }, (_, i) => i);

      act(() => {
        result.current.getPaginatedData(data);
      });

      act(() => {
        result.current.goToPage(200);
      });

      let paginatedData;
      act(() => {
        paginatedData = result.current.getPaginatedData(data);
      });

      const expectedStart = (200 - 1) * 25;
      const expectedEnd = expectedStart + 25;
      expect(paginatedData).toEqual(Array.from({ length: 25 }, (_, i) => i + expectedStart));
    });
  });

  describe('Object Data', () => {
    it('should handle object data correctly', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 10));
      const data = Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Item ${i}` }));

      let paginatedData;
      act(() => {
        paginatedData = result.current.getPaginatedData(data);
      });

      expect(paginatedData).toHaveLength(10);
      expect(paginatedData[0]).toEqual({ id: 0, name: 'Item 0' });
      expect(paginatedData[9]).toEqual({ id: 9, name: 'Item 9' });
    });

    it('should maintain object references', () => {
      const { result } = renderHook(() => usePaginationWithContext(1, 10));
      const obj1 = { id: 1, name: 'Item 1' };
      const obj2 = { id: 2, name: 'Item 2' };
      const data = [obj1, obj2];

      let paginatedData;
      act(() => {
        paginatedData = result.current.getPaginatedData(data);
      });

      expect(paginatedData[0]).toBe(obj1);
      expect(paginatedData[1]).toBe(obj2);
    });
  });
});
