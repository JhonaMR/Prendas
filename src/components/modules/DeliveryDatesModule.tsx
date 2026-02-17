import React, { useState, useMemo } from 'react';
import { DeliveryDate } from '../../types';
import PaginatedTable from '../PaginatedTable';
import usePaginationWithContext from '../../hooks/usePaginationWithContext';

export interface DeliveryDatesModuleProps {
  deliveryDates: DeliveryDate[];
  onEdit: (deliveryDate: DeliveryDate) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

/**
 * Módulo de Fechas de Entrega con paginación
 * Muestra tabla de fechas de entrega con 30 registros por página
 * Validación: Requirements 3.5
 */
export const DeliveryDatesModule: React.FC<DeliveryDatesModuleProps> = ({
  deliveryDates,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const { pagination, goToPage, setPageSize, getPaginatedData } = usePaginationWithContext(1, 30);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar fechas de entrega por búsqueda
  const filteredDeliveryDates = useMemo(() => {
    return deliveryDates.filter(dd =>
      dd.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dd.confeccionistaId && dd.confeccionistaId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (dd.referenceId && dd.referenceId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [deliveryDates, searchTerm]);

  // Paginar datos filtrados
  const paginatedDeliveryDates = useMemo(() => {
    return getPaginatedData(filteredDeliveryDates);
  }, [filteredDeliveryDates, pagination.currentPage, pagination.pageSize]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <input
          type="text"
          placeholder="Buscar por ID, confeccionista o referencia..."
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
        pageSizeOptions={[15, 20, 30, 50]}
        title={`Fechas de Entrega (${pagination.total} total)`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase">ID</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Confeccionista</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Referencia</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Cantidad</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Fecha Esperada</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Fecha Entrega</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedDeliveryDates.length > 0 ? (
                paginatedDeliveryDates.map(dd => (
                  <tr key={dd.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-blue-600">{dd.id}</td>
                    <td className="px-6 py-4 text-gray-600">{dd.confeccionistaId || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{dd.referenceId || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{dd.quantity || 0}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {dd.expectedDate ? new Date(dd.expectedDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {dd.deliveryDate ? new Date(dd.deliveryDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(dd)}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onDelete(dd.id)}
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
                    No se encontraron fechas de entrega
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

export default DeliveryDatesModule;
