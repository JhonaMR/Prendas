import React, { useState, useMemo } from 'react';
import { Dispatch } from '../../types';
import PaginatedTable from '../PaginatedTable';
import usePaginationWithContext from '../../hooks/usePaginationWithContext';

export interface DispatchesModuleProps {
  dispatches: Dispatch[];
  onEdit: (dispatch: Dispatch) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

/**
 * Módulo de Despachos con paginación
 * Muestra tabla de despachos con 20 registros por página
 * Validación: Requirements 3.7
 */
export const DispatchesModule: React.FC<DispatchesModuleProps> = ({
  dispatches,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const { pagination, goToPage, setPageSize, getPaginatedData } = usePaginationWithContext(1, 20);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar despachos por búsqueda
  const filteredDispatches = useMemo(() => {
    return dispatches.filter(dispatch =>
      dispatch.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dispatch.clientId && dispatch.clientId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (dispatch.invoiceNo && dispatch.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (dispatch.remissionNo && dispatch.remissionNo.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [dispatches, searchTerm]);

  // Paginar datos filtrados
  const paginatedDispatches = useMemo(() => {
    return getPaginatedData(filteredDispatches);
  }, [filteredDispatches, pagination.currentPage, pagination.pageSize]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <input
          type="text"
          placeholder="Buscar por ID, cliente, factura o remisión..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            goToPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Paginated Table */}
      <PaginatedTable
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        pageSize={pagination.pageSize}
        onPageChange={goToPage}
        onPageSizeChange={setPageSize}
        isLoading={isLoading}
        pageSizeOptions={[10, 15, 20, 30]}
        title={`Despachos (${pagination.total} total)`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase">ID</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Cliente</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Factura</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Remisión</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Cantidad</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Fecha</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedDispatches.length > 0 ? (
                paginatedDispatches.map(dispatch => (
                  <tr key={dispatch.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-blue-600">{dispatch.id}</td>
                    <td className="px-6 py-4 text-gray-600">{dispatch.clientId || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{dispatch.invoiceNo || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{dispatch.remissionNo || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{dispatch.totalQuantity || 0}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {dispatch.createdAt ? new Date(dispatch.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(dispatch)}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => onDelete(dispatch.id)}
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
                    No se encontraron despachos
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

export default DispatchesModule;
