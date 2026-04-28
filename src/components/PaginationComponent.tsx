import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../context/DarkModeContext';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
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
  pageSize = 100,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  pageSizeOptions = [10, 20, 25, 30, 48, 50, 100]
}) => {
  const [inputPage, setInputPage] = useState<string>(currentPage.toString());
  const { isDark } = useDarkMode();

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
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
  };

  return (
    <div className={`flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-4 rounded-lg border transition-colors duration-300 ${
      isDark
        ? 'bg-[#4a3a63] border-violet-600 text-violet-200'
        : 'bg-gray-50 border-gray-200 text-gray-700'
    }`}>
      {/* Page Size Selector */}
      {onPageSizeChange && (
        <div className="flex items-center gap-2">
          <label className={`text-sm font-medium ${isDark ? 'text-violet-200' : 'text-gray-700'}`}>Registros por página:</label>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            disabled={isLoading}
            className={`px-3 py-2 border rounded text-sm transition-colors duration-300 ${
              isDark
                ? 'bg-[#3d2d52] border-violet-600 text-violet-100 disabled:bg-violet-900/40 disabled:text-violet-700'
                : 'border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed'
            }`}
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size} className={isDark ? 'bg-[#3d2d52]' : ''}>{size}</option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1 || isLoading}
          className={`px-4 py-2 rounded transition-all duration-300 ${
            isDark
              ? 'bg-violet-600 text-white hover:bg-violet-700 disabled:bg-violet-900/40 disabled:text-violet-700 disabled:cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed'
          }`}
        >
          ← Anterior
        </button>

        {/* Page Info */}
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isDark ? 'text-violet-200' : 'text-gray-700'}`}>
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
            className={`w-16 px-2 py-1 border rounded text-center text-sm transition-colors duration-300 ${
              isDark
                ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-500 disabled:bg-violet-900/40'
                : 'border-gray-300 disabled:bg-gray-100'
            }`}
            placeholder="Ir a"
          />
          <button
            onClick={handleGoToPage}
            disabled={isLoading}
            className={`px-3 py-1 rounded transition-all duration-300 text-sm ${
              isDark
                ? 'bg-purple-700 text-white hover:bg-purple-800 disabled:bg-violet-900/40 disabled:text-violet-700 disabled:cursor-not-allowed'
                : 'bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed'
            }`}
          >
            Ir
          </button>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages || isLoading}
          className={`px-4 py-2 rounded transition-all duration-300 ${
            isDark
              ? 'bg-violet-600 text-white hover:bg-violet-700 disabled:bg-violet-900/40 disabled:text-violet-700 disabled:cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed'
          }`}
        >
          Siguiente →
        </button>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="ml-2">
            <div className={`animate-spin h-5 w-5 border-2 rounded-full ${
              isDark
                ? 'border-violet-500 border-t-transparent'
                : 'border-blue-500 border-t-transparent'
            }`}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaginationComponent;
