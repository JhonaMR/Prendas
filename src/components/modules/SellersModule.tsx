import React, { useState, useMemo } from 'react';
import { Seller } from '../../types';
import PaginatedTable from '../PaginatedTable';
import usePaginationWithContext from '../../hooks/usePaginationWithContext';
import { FilterBar, TableHeader, type TableColumn } from '../shared';

export interface SellersModuleProps {
  sellers: Seller[];
  onEdit: (seller: Seller) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

/**
 * Módulo de Vendedores con paginación
 * Muestra tabla de vendedores con 25 registros por página
 * Validación: Requirements 3.2, 4.2, 4.5, 4.6, 4.7, 4.8
 */
export const SellersModule: React.FC<SellersModuleProps> = ({
  sellers,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const { pagination, goToPage, setPageSize, getPaginatedData } = usePaginationWithContext(1, 25);
  const [searchTerm, setSearchTerm] = useState('');

  // Columnas de la tabla
  const columns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'actions', label: 'Acciones', align: 'right' }
  ];

  // Filtrar vendedores por búsqueda
  const filteredSellers = useMemo(() => {
    return sellers.filter(seller =>
      seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sellers, searchTerm]);

  // Paginar datos filtrados
  const paginatedSellers = useMemo(() => {
    return getPaginatedData(filteredSellers);
  }, [filteredSellers, pagination.currentPage, pagination.pageSize]);

  const handleClearFilters = () => {
    setSearchTerm('');
    goToPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Buscar por ID o nombre..."
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
        pageSizeOptions={[10, 20, 25, 50]}
        title={`Vendedores (${pagination.total} total)`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <TableHeader columns={columns} />
            <tbody className="divide-y divide-gray-200">
              {paginatedSellers.length > 0 ? (
                paginatedSellers.map(seller => (
                  <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-blue-600">{seller.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{seller.name}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(seller)}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onDelete(seller.id)}
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
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron vendedores
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

export default SellersModule;
