import React, { useState } from 'react';

interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const PaginationComponent: React.FC<PaginationComponentProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false
}) => {
  const [inputPage, setInputPage] = useState<string>(currentPage.toString());

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
      setInputPage((currentPage - 1).toString());
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
      setInputPage((currentPage + 1).toString());
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

  return (
    <div className="flex items-center justify-center gap-4 py-4 px-4 bg-gray-50 rounded-lg border border-gray-200">
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
  );
};

export default PaginationComponent;
