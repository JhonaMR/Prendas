import React, { useState, useMemo } from 'react';
import { BatchReception } from '../../types';
import PaginatedTable from '../PaginatedTable';
import usePaginationWithContext from '../../hooks/usePaginationWithContext';

export interface ReceptionsModuleProps {
  receptions: BatchReception[];
  onEdit: (reception: BatchReception) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

/**
 * Módulo de Recepciones con paginación
 * Muestra tabla de recepciones con 20 registros por página
 * Validación: Requirements 3.6
 */
export const ReceptionsModule: React.FC<ReceptionsModuleProps> = ({
  receptions,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const { pagination, goToPage, setPageSize, getPaginatedData } = usePaginationWithContext(1, 20);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar recepciones por búsqueda
  const filteredReceptions = useMemo(() => {
    return receptions.filter(reception =>
      reception.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reception.confeccionistaId && reception.confeccionistaId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reception.batchCode && reception.batchCode.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [receptions, searchTerm]);

  // Paginar datos filtrados
  const paginatedReceptions = useMemo(() => {
    return getPaginatedData(filteredReceptions);
  }, [filteredReceptions, pagination.currentPage, pagination.pageSize]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <input
          type="text"
          placeholder="Buscar por ID, confeccionista o código de lote..."
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
        title={`Recepciones (${pagination.total} total)`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase">ID</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Confeccionista</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Código Lote</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Cantidad</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Fecha</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedReceptions.length > 0 ? (
                paginatedReceptions.map(reception => (
                  <tr key={reception.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-blue-600">{reception.id}</td>
                    <td className="px-6 py-4 text-gray-600">{reception.confeccionistaId || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{reception.batchCode || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{reception.totalQuantity || 0}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {reception.createdAt ? new Date(reception.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(reception)}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => onDelete(reception.id)}
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
                    No se encontraron recepciones
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

export default ReceptionsModule;
