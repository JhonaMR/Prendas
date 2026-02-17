import { renderHook, act } from '@testing-library/react';
import { usePaginationWithContext } from './usePaginationWithContext';
import fc from 'fast-check';

/**
 * Property-Based Tests para Paginación
 * Validates: Requirements 3.8, 3.9
 */
describe('usePaginationWithContext - Property Tests', () => {
  /**
   * Property 7: Pagination Consistency
   * For any paginated request with page N and limit L, the returned data should contain
   * exactly L items (or fewer on the last page) and should not overlap with other pages.
   * Validates: Requirements 3.8, 3.9
   */
  it('Property 7: Pagination Consistency - pages should not overlap and contain correct number of items', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // total items
        fc.integer({ min: 1, max: 100 }), // page size
        (total, pageSize) => {
          const { result } = renderHook(() => usePaginationWithContext(1, pageSize));
          const data = Array.from({ length: total }, (_, i) => i);

          // Get all pages and verify no overlap
          const allPages: number[] = [];
          const totalPages = Math.ceil(total / pageSize);

          for (let page = 1; page <= totalPages; page++) {
            act(() => {
              result.current.goToPage(page);
            });

            let paginatedData: number[];
            act(() => {
              paginatedData = result.current.getPaginatedData(data);
            });

            // Verify page size (except last page which may have fewer items)
            if (page < totalPages) {
              expect(paginatedData!.length).toBe(pageSize);
            } else {
              expect(paginatedData!.length).toBeLessThanOrEqual(pageSize);
            }

            // Verify no overlap with previous pages
            for (const item of paginatedData!) {
              expect(allPages).not.toContain(item);
            }

            allPages.push(...paginatedData!);
          }

          // Verify all items are covered
          expect(allPages.length).toBe(total);
          expect(allPages.sort((a, b) => a - b)).toEqual(
            Array.from({ length: total }, (_, i) => i)
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8: Pagination Round Trip
   * For any dataset, paginating through all pages and collecting results should produce
   * the same total count as a non-paginated query.
   * Validates: Requirements 3.8
   */
  it('Property 8: Pagination Round Trip - total should be consistent across all pages', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }), // total items
        fc.integer({ min: 1, max: 100 }), // page size
        (total, pageSize) => {
          const { result } = renderHook(() => usePaginationWithContext(1, pageSize));
          const data = Array.from({ length: total }, (_, i) => ({ id: i, value: `item-${i}` }));

          // Get pagination state
          let paginationState;
          act(() => {
            result.current.getPaginatedData(data);
          });
          paginationState = result.current.pagination;

          // Verify total count
          expect(paginationState.total).toBe(total);

          // Verify total pages calculation
          const expectedTotalPages = Math.ceil(total / pageSize) || 1;
          expect(paginationState.totalPages).toBe(expectedTotalPages);

          // Collect all items from all pages
          const collectedItems: typeof data = [];
          for (let page = 1; page <= paginationState.totalPages; page++) {
            act(() => {
              result.current.goToPage(page);
            });

            let pageData;
            act(() => {
              pageData = result.current.getPaginatedData(data);
            });

            collectedItems.push(...pageData!);
          }

          // Verify round trip: collected items should equal original data
          expect(collectedItems.length).toBe(total);
          expect(collectedItems).toEqual(data);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional Property: Page Navigation Bounds
   * For any page number, navigation should be bounded between 1 and totalPages
   */
  it('should always keep current page within valid bounds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }), // total items
        fc.integer({ min: 1, max: 100 }), // page size
        fc.integer({ min: -1000, max: 2000 }), // requested page
        (total, pageSize, requestedPage) => {
          const { result } = renderHook(() => usePaginationWithContext(1, pageSize));
          const data = Array.from({ length: total }, (_, i) => i);

          act(() => {
            result.current.getPaginatedData(data);
            result.current.goToPage(requestedPage);
          });

          const { currentPage, totalPages } = result.current.pagination;

          // Current page should always be between 1 and totalPages
          expect(currentPage).toBeGreaterThanOrEqual(1);
          expect(currentPage).toBeLessThanOrEqual(Math.max(1, totalPages));
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional Property: Page Size Bounds
   * For any page size, it should be bounded between 1 and 100
   */
  it('should always keep page size within valid bounds (1-100)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 2000 }), // requested page size
        (requestedSize) => {
          const { result } = renderHook(() => usePaginationWithContext());

          act(() => {
            result.current.setPageSize(requestedSize);
          });

          const { pageSize } = result.current.pagination;

          // Page size should always be between 1 and 100
          expect(pageSize).toBeGreaterThanOrEqual(1);
          expect(pageSize).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional Property: Data Slice Correctness
   * For any page and page size, the returned data should be the correct slice
   */
  it('should return correct data slice for any page and page size', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 500 }), // total items
        fc.integer({ min: 1, max: 50 }), // page size
        (total, pageSize) => {
          const { result } = renderHook(() => usePaginationWithContext(1, pageSize));
          const data = Array.from({ length: total }, (_, i) => i);

          act(() => {
            result.current.getPaginatedData(data);
          });

          const totalPages = result.current.pagination.totalPages;

          // For each page, verify the slice is correct
          for (let page = 1; page <= totalPages; page++) {
            act(() => {
              result.current.goToPage(page);
            });

            let pageData;
            act(() => {
              pageData = result.current.getPaginatedData(data);
            });

            const expectedStart = (page - 1) * pageSize;
            const expectedEnd = Math.min(expectedStart + pageSize, total);
            const expectedData = data.slice(expectedStart, expectedEnd);

            expect(pageData).toEqual(expectedData);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
