import { useState, useCallback, useMemo } from 'react';

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface UsePaginationWithContextReturn {
  pagination: PaginationState;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  reset: () => void;
  getPaginatedData: <T>(data: T[]) => T[];
}

/**
 * Hook para manejar paginación con contextos
 * Proporciona estado de paginación y métodos para navegar
 * Validación: Requirements 3.8, 3.9
 */
export const usePaginationWithContext = (
  initialPage: number = 1,
  initialPageSize: number = 25
): UsePaginationWithContextReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => {
    return Math.ceil(total / pageSize) || 1;
  }, [total, pageSize]);

  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  const setPageSize = useCallback((size: number) => {
    const validSize = Math.max(1, Math.min(size, 100));
    setPageSizeState(validSize);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSizeState(initialPageSize);
    setTotal(0);
  }, [initialPage, initialPageSize]);

  const getPaginatedData = useCallback(<T,>(data: T[]): T[] => {
    setTotal(data.length);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [currentPage, pageSize]);

  const pagination: PaginationState = useMemo(
    () => ({
      currentPage,
      pageSize,
      total,
      totalPages
    }),
    [currentPage, pageSize, total, totalPages]
  );

  return {
    pagination,
    goToPage,
    setPageSize,
    reset,
    getPaginatedData
  };
};

export default usePaginationWithContext;
