import React from 'react';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableHeaderProps {
  columns: TableColumn[];
  onSort?: (columnKey: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Componente reutilizable para encabezado de tabla
 * Validación: Requirements 4.5
 */
export const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  onSort,
  sortBy,
  sortOrder = 'asc'
}) => {
  return (
    <thead>
      <tr className="bg-gray-50 border-b border-gray-200">
        {columns.map(column => (
          <th
            key={column.key}
            className={`px-6 py-3 text-xs font-semibold text-gray-700 uppercase ${
              column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'
            } ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
            onClick={() => column.sortable && onSort?.(column.key)}
            style={{ width: column.width }}
          >
            <div className="flex items-center gap-2">
              {column.label}
              {column.sortable && sortBy === column.key && (
                <span className="text-xs">
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;
