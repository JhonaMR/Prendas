
import React, { useMemo, useState } from 'react';
import { BatchReception, Dispatch, ItemEntry, Reference } from '../types';
import PaginationComponent from '../components/PaginationComponent';
import usePagination from '../hooks/usePagination';

interface InventoryViewProps {
  receptions?: BatchReception[];
  dispatches?: Dispatch[];
  references?: Reference[];
}

const InventoryView: React.FC<InventoryViewProps> = ({ 
  receptions = [], 
  dispatches = [],
  references = []
}) => {
  
  const [search, setSearch] = useState('');
  const pagination = usePagination(1, 20);

  // Create a map of reference ID to description for quick lookup
  const refDescriptionMap = useMemo(() => {
    const map: Record<string, string> = {};
    references.forEach(ref => {
      map[ref.id] = ref.description;
    });
    return map;
  }, [references]);

  const stockByRef = useMemo(() => {
    const stock: Record<string, {
      received: number,
      dispatched: number,
      available: number,
      lotsCount: number
    }> = {};

    receptions
      .filter(r => r.affectsInventory !== false)
      .forEach(r => {
        r.items.forEach(item => {
          if (!stock[item.reference]) {
            stock[item.reference] = { received: 0, dispatched: 0, available: 0, lotsCount: 0 };
          }
          stock[item.reference].received += item.quantity;
          stock[item.reference].available += item.quantity;
        });
        const uniqueRefsInBatch = new Set(r.items.map(i => i.reference));
        // FIX: Cast ref to string to fix 'unknown' type error
        uniqueRefsInBatch.forEach((ref: string) => {
          if (stock[ref]) stock[ref].lotsCount += 1;
        });
      });

    dispatches.forEach(d => {
      d.items.forEach(item => {
        if (!stock[item.reference]) return;
        stock[item.reference].dispatched += item.quantity;
        stock[item.reference].available -= item.quantity;
      });
    });

    return stock;
  }, [receptions, dispatches]);

  // Filter and Sort entries
  const filteredSortedStock = useMemo(() => {
    return Object.entries(stockByRef)
      .filter(([ref]) => !search.trim() || ref.toUpperCase().includes(search.toUpperCase()))
      .sort(([refA], [refB]) => refA.localeCompare(refB));
  }, [stockByRef, search]);

  // Actualizar paginación cuando cambia el filtro
  React.useEffect(() => {
    pagination.pagination.total = filteredSortedStock.length;
    pagination.pagination.totalPages = Math.ceil(filteredSortedStock.length / pagination.pagination.limit);
  }, [filteredSortedStock.length, pagination.pagination.limit]);

  // Paginar datos
  const paginatedStock = useMemo(() => {
    const start = (pagination.pagination.page - 1) * pagination.pagination.limit;
    const end = start + pagination.pagination.limit;
    return filteredSortedStock.slice(start, end);
  }, [filteredSortedStock, pagination.pagination.page, pagination.pagination.limit]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter">Inventario</h2>
          <p className="text-slate-400 font-medium text-sm sm:text-base">Existencias actuales por referencia</p>
        </div>
        <div className="w-full sm:max-w-md">
          <div className="relative">
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar referencia..."
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[24px] focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-900 shadow-sm text-sm"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-3">
        {filteredSortedStock.length === 0 ? (
          <div className="bg-white p-12 sm:p-24 rounded-[32px] sm:rounded-[48px] border-2 border-dashed border-slate-200 text-center text-slate-400 font-bold italic">
            {search ? `No se encontraron resultados para "${search}"` : 'No hay mercancía registrada en bodega'}
          </div>
        ) : (
          <>
            {paginatedStock.map(([ref, data]) => (
              <div key={ref} className="bg-white rounded-[20px] sm:rounded-[24px] shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all border-l-4 border-l-blue-500">
                {/* Header section - more compact */}
                <div className="px-4 py-1 sm:py-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 bg-slate-50/40">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight leading-none">{ref}</h3>
                    <span className="px-1 py-0 bg-blue-100 text-blue-600 text-[6px] sm:text-[7px] font-black uppercase tracking-widest rounded leading-none">
                      Lotes: {data.lotsCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="px-2 py-1 bg-white rounded-lg shadow-xs border border-slate-100 text-center min-w-[60px]">
                      <p className="text-[5px] sm:text-[6px] font-black text-slate-400 uppercase tracking-widest mb-0 leading-none">Stock</p>
                      <p className="text-sm sm:text-base font-black text-blue-600 leading-none">{data.available}</p>
                    </div>
                    <div className="px-2 py-1 bg-white rounded-lg shadow-xs border border-slate-100 text-center min-w-[60px]">
                      <p className="text-[5px] sm:text-[6px] font-black text-slate-400 uppercase tracking-widest mb-0 leading-none">Recib.</p>
                      <p className="text-sm sm:text-base font-black text-slate-800 leading-none">{data.received}</p>
                    </div>
                  </div>
                </div>

                {/* Description section */}
                {refDescriptionMap[ref] && (
                  <div className="px-4 py-0.5 bg-white border-b border-slate-50">
                    <p className="text-[10px] sm:text-xs font-medium text-slate-500 leading-tight">{refDescriptionMap[ref]}</p>
                  </div>
                )}

                {/* Sizes section - more compact */}
                <div className="px-4 py-1 sm:py-1.5 grid grid-cols-1 lg:grid-cols-12 gap-1 items-center">
                  <div className="lg:col-span-12 flex gap-1">
                     <div className="flex-1 p-2 bg-blue-50/50 rounded text-center">
                        <p className="text-[4px] font-black text-blue-400 uppercase leading-none">Ingresos</p>
                        <p className="text-[10px] sm:text-sm font-black text-blue-600 leading-none">+{data.received}</p>
                     </div>
                     <div className="flex-1 p-2 bg-pink-50/50 rounded text-center">
                        <p className="text-[4px] font-black text-pink-400 uppercase leading-none">Despachos</p>
                        <p className="text-[10px] sm:text-sm font-black text-pink-600 leading-none">-{data.dispatched}</p>
                     </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-6">
              <PaginationComponent 
                currentPage={pagination.pagination.page}
                totalPages={pagination.pagination.totalPages}
                pageSize={pagination.pagination.limit}
                onPageChange={pagination.goToPage}
                onPageSizeChange={pagination.setLimit}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InventoryView;
