import React, { useState, useMemo } from 'react';
import { Reference } from '../../types';
import PaginatedTable from '../PaginatedTable';
import usePaginationWithContext from '../../hooks/usePaginationWithContext';
import { FilterBar, TableHeader, type TableColumn } from '../shared';

export interface ReferencesModuleProps {
  references: Reference[];
  onEdit: (reference: Reference) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

/**
 * Módulo de Referencias con paginación
 * Muestra tabla de referencias con 50 registros por página
 * Validación: Requirements 3.4, 4.4, 4.5, 4.6, 4.7, 4.8
 */
export const ReferencesModule: React.FC<ReferencesModuleProps> = ({
  references,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const { pagination, goToPage, setPageSize, getPaginatedData } = usePaginationWithContext(1, 50);
  const [searchTerm, setSearchTerm] = useState('');

  // Columnas de la tabla
  const columns: TableColumn[] = [
    { key: 'id', label: 'Código', sortable: true },
    { key: 'description', label: 'Descripción', sortable: true },
    { key: 'designer', label: 'Diseñador', sortable: true },
    { key: 'price', label: 'Precio', sortable: true },
    { key: 'cloth1', label: 'Tela 1', sortable: false },
    { key: 'cloth2', label: 'Tela 2', sortable: false },
    { key: 'actions', label: 'Acciones', align: 'right' }
  ];

  // Filtrar referencias por búsqueda
  const filteredReferences = useMemo(() => {
    return references.filter(ref =>
      ref.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ref.designer && ref.designer.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [references, searchTerm]);

  // Paginar datos filtrados
  const paginatedReferences = useMemo(() => {
    return getPaginatedData(filteredReferences);
  }, [filteredReferences, pagination.currentPage, pagination.pageSize]);

  const handleClearFilters = () => {
    setSearchTerm('');
    goToPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Buscar por código, descripción o diseñador..."
        searchValue={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          goToPage(1);
        }}
        onClearFilters={handleClearFilters}
        showClearButton={true}
      />

      {/* Paginated Table */}
      <PaginatedTable
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        pageSize={pagination.pageSize}
        onPageChange={goToPage}
        onPageSizeChange={setPageSize}
        isLoading={isLoading}
        pageSizeOptions={[20, 30, 50, 100]}
        title={`Referencias (${pagination.total} total)`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <TableHeader columns={columns} />
            <tbody className="divide-y divide-gray-200">
              {paginatedReferences.length > 0 ? (
                paginatedReferences.map(ref => (
                  <tr key={ref.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-blue-600">{ref.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{ref.description}</td>
                    <td className="px-6 py-4 text-gray-600">{ref.designer || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">${ref.price?.toLocaleString() || '0'}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {ref.cloth1 && <span>{ref.cloth1} ({ref.avgCloth1}%)</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {ref.cloth2 && <span>{ref.cloth2} ({ref.avgCloth2}%)</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(ref)}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onDelete(ref.id)}
                          className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron referencias
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PaginatedTable>
    </div>
  );
};

export default ReferencesModule;
