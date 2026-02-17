import React, { useState, useMemo } from 'react';
import { Confeccionista } from '../../types';
import PaginatedTable from '../PaginatedTable';
import usePaginationWithContext from '../../hooks/usePaginationWithContext';
import { FilterBar, TableHeader, type TableColumn } from '../shared';

export interface ConfeccionistasModuleProps {
  confeccionistas: Confeccionista[];
  onEdit: (confeccionista: Confeccionista) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

/**
 * Módulo de Confeccionistas con paginación
 * Muestra tabla de confeccionistas con 25 registros por página
 * Validación: Requirements 3.3, 4.3, 4.5, 4.6, 4.7, 4.8
 */
export const ConfeccionistasModule: React.FC<ConfeccionistasModuleProps> = ({
  confeccionistas,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const { pagination, goToPage, setPageSize, getPaginatedData } = usePaginationWithContext(1, 25);
  const [searchTerm, setSearchTerm] = useState('');

  // Columnas de la tabla
  const columns: TableColumn[] = [
    { key: 'id', label: 'Cédula', sortable: true },
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'phone', label: 'Teléfono', sortable: false },
    { key: 'score', label: 'Puntaje', sortable: true },
    { key: 'active', label: 'Estado', sortable: true },
    { key: 'actions', label: 'Acciones', align: 'right' }
  ];

  // Filtrar confeccionistas por búsqueda
  const filteredConfeccionistas = useMemo(() => {
    return confeccionistas.filter(conf =>
      conf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conf.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conf.phone && conf.phone.includes(searchTerm))
    );
  }, [confeccionistas, searchTerm]);

  // Paginar datos filtrados
  const paginatedConfeccionistas = useMemo(() => {
    return getPaginatedData(filteredConfeccionistas);
  }, [filteredConfeccionistas, pagination.currentPage, pagination.pageSize]);

  const handleClearFilters = () => {
    setSearchTerm('');
    goToPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Buscar por cédula, nombre o teléfono..."
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
        title={`Confeccionistas (${pagination.total} total)`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <TableHeader columns={columns} />
            <tbody className="divide-y divide-gray-200">
              {paginatedConfeccionistas.length > 0 ? (
                paginatedConfeccionistas.map(conf => (
                  <tr key={conf.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-blue-600">{conf.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{conf.name}</td>
                    <td className="px-6 py-4 text-gray-600">{conf.phone || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded text-sm font-medium">
                        {conf.score || 'NA'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        conf.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {conf.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(conf)}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onDelete(conf.id)}
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
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron confeccionistas
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

export default ConfeccionistasModule;
