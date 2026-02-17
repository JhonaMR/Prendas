import React, { useState, useMemo } from 'react';
import { Client } from '../../types';
import PaginatedTable from '../PaginatedTable';
import usePaginationWithContext from '../../hooks/usePaginationWithContext';
import { FilterBar, TableHeader, type TableColumn } from '../shared';

export interface ClientsModuleProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

/**
 * Módulo de Clientes con paginación
 * Muestra tabla de clientes con 25 registros por página
 * Validación: Requirements 3.1, 4.1, 4.5, 4.6, 4.7, 4.8
 */
export const ClientsModule: React.FC<ClientsModuleProps> = ({
  clients,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const { pagination, goToPage, setPageSize, getPaginatedData } = usePaginationWithContext(1, 25);
  const [searchTerm, setSearchTerm] = useState('');

  // Columnas de la tabla
  const columns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'nit', label: 'NIT', sortable: true },
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'address', label: 'Dirección', sortable: false },
    { key: 'city', label: 'Ciudad', sortable: true },
    { key: 'seller', label: 'Vendedor', sortable: true },
    { key: 'actions', label: 'Acciones', align: 'right' }
  ];

  // Filtrar clientes por búsqueda
  const filteredClients = useMemo(() => {
    return clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.nit && client.nit.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [clients, searchTerm]);

  // Paginar datos filtrados
  const paginatedClients = useMemo(() => {
    return getPaginatedData(filteredClients);
  }, [filteredClients, pagination.currentPage, pagination.pageSize]);

  const handleClearFilters = () => {
    setSearchTerm('');
    goToPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Buscar por ID, NIT o nombre..."
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
        title={`Clientes (${pagination.total} total)`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <TableHeader columns={columns} />
            <tbody className="divide-y divide-gray-200">
              {paginatedClients.length > 0 ? (
                paginatedClients.map(client => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-blue-600">{client.id}</td>
                    <td className="px-6 py-4 text-gray-600">{client.nit || '-'}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{client.name}</td>
                    <td className="px-6 py-4 text-gray-600">{client.address || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{client.city || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{client.seller || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(client)}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onDelete(client.id)}
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
                    No se encontraron clientes
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

export default ClientsModule;
