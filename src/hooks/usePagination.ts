import { useState, useCallback } from 'react';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UsePaginationReturn {
  pagination: PaginationState;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setLimit: (limit: number) => void;
  reset: () => void;
}

export const usePagination = (initialPage = 1, initialLimit = 20): UsePaginationReturn => {
  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      page: Math.max(1, Math.min(page, prev.totalPages || 1))
    }));
  }, []);

  const nextPage = useCallback(() => {
    setPagination(prev => {
      if (prev.hasNextPage) {
        return { ...prev, page: prev.page + 1 };
      }
      return prev;
    });
  }, []);

  const previousPage = useCallback(() => {
    setPagination(prev => {
      if (prev.hasPreviousPage) {
        return { ...prev, page: prev.page - 1 };
      }
      return prev;
    });
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({
      ...prev,
      limit: Math.max(1, Math.min(limit, 100)),
      page: 1
    }));
  }, []);

  const reset = useCallback(() => {
    setPagination({
      page: initialPage,
      limit: initialLimit,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false
    });
  }, [initialPage, initialLimit]);

  const updatePaginationState = useCallback((data: Partial<PaginationState>) => {
    setPagination(prev => ({ ...prev, ...data }));
  }, []);

  return {
    pagination,
    goToPage,
    nextPage,
    previousPage,
    setLimit,
    reset
  };
};

export default usePagination;
