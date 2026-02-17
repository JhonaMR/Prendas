import React, { ReactNode } from 'react';
import PaginationComponent from './PaginationComponent';

export interface PaginatedTableProps {
  children: ReactNode;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
  pageSizeOptions?: number[];
  title?: string;
}

/**
 * Componente wrapper para tablas con paginación
 * Encapsula la tabla y el componente de paginación
 */
export const PaginatedTable: React.FC<PaginatedTableProps> = ({
  children,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  pageSizeOptions,
  title
}) => {
  return (
    <div className="space-y-4">
      {title && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {children}
      </div>
      
      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        isLoading={isLoading}
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  );
};

export default PaginatedTable;
