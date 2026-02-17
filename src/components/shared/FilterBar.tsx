import React, { ReactNode } from 'react';

export interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClearFilters?: () => void;
  children?: ReactNode;
  showClearButton?: boolean;
}

/**
 * Componente reutilizable para barra de filtros
 * Validación: Requirements 4.7
 */
export const FilterBar: React.FC<FilterBarProps> = ({
  searchPlaceholder = 'Buscar...',
  searchValue,
  onSearchChange,
  onClearFilters,
  children,
  showClearButton = true
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {showClearButton && searchValue && (
          <button
            onClick={() => onSearchChange('')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Limpiar búsqueda
          </button>
        )}
      </div>

      {/* Additional Filters */}
      {children && (
        <div className="flex flex-wrap gap-2">
          {children}
        </div>
      )}

      {/* Clear All Filters Button */}
      {showClearButton && onClearFilters && (searchValue || children) && (
        <div className="flex justify-end">
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Limpiar todos los filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
