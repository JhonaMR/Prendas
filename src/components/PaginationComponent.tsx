import React, { useState, useEffect } from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
  pageSizeOptions?: number[];
}

/**
 * Componente Pagination reutilizable
 * Props: currentPage, totalPages, pageSize, onPageChange, onPageSizeChange
 * Validación: Requirements 3.8, 3.9
 */
export const PaginationComponent: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  pageSizeOptions = [10, 20, 25, 30, 50, 100]
}) => {
  const [inputPage, setInputPage] = useState<string>(currentPage.toString());

  useEffect(() => {
    setInputPage(currentPage.toString());
  }, [currentPage]);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleGoToPage = () => {
    const page = parseInt(inputPage, 10);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    } else {
      setInputPage(currentPage.toString());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGoToPage();
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    onPageSizeChange(newSize);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-4 bg-gray-50 rounded-lg border border-gray-200">
      {/* Page Size Selector */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Registros por página:</label>
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          disabled={isLoading}
          className="px-3 py-2 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1 || isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          ← Anterior
        </button>

        {/* Page Info */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
        </div>

        {/* Go to Page Input */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max={totalPages}
            value={inputPage}
            onChange={handleInputChange}
            onKeyPress={handleInputKeyPress}
            disabled={isLoading}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm disabled:bg-gray-100"
            placeholder="Ir a"
          />
          <button
            onClick={handleGoToPage}
            disabled={isLoading}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm"
          >
            Ir
          </button>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages || isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          Siguiente →
        </button>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="ml-2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaginationComponent;
