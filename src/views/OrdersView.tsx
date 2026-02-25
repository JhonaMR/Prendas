import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Correria, Reference, ProductionTracking, UserRole, AppState, User } from '../types';
import api from '../services/api';

interface OrdersViewProps {
  user: User;
  state: AppState;
  updateState: (fn: (prev: AppState) => AppState) => void;
  onUnsavedChanges?: (hasChanges: boolean) => void;
}

const OrdersView: React.FC<OrdersViewProps> = ({ user, state, updateState, onUnsavedChanges }) => {
  
  const [selectedCorreriaId, setSelectedCorreriaId] = useState('');
  const [refFilter, setRefFilter] = useState('');
  const [hideZeros, setHideZeros] = useState(false);
  const [correriaSearch, setCorreriaSearch] = useState('');
  const [showCorreriaDropdown, setShowCorreriaDropdown] = useState(false);
  
  // Estados para filtros de columnas
  const [columnFilters, setColumnFilters] = useState<{
    [key: string]: { type: 'none' | 'equals' | 'greater' | 'less' | 'asc' | 'desc' | 'contains'; value?: number | string }
  }>({});
  const [activeFilterMenu, setActiveFilterMenu] = useState<string | null>(null);
  const [textFilterInputs, setTextFilterInputs] = useState<{ [key: string]: string }>({});
  const [numericFilterInputs, setNumericFilterInputs] = useState<{ [key: string]: string }>({});
  const [initialProductionData, setInitialProductionData] = useState<ProductionTracking[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const hasUnsavedChanges = useRef(false);

  // Verificar si el usuario es admin
  const isAdmin = user?.role === UserRole.ADMIN || user?.role === 'admin';
// Cargar datos iniciales SOLO cuando cambia la correría (no cuando se edita)
useEffect(() => {
  const currentCorreriaData = state.productionTracking.filter(
    pt => pt.correriaId === selectedCorreriaId
  );
  setInitialProductionData(currentCorreriaData);
  hasUnsavedChanges.current = false;
  if (onUnsavedChanges) {
    onUnsavedChanges(false);
  }
}, [selectedCorreriaId]); // ← SOLO depende de selectedCorreriaId, NO de state.productionTracking

// Actualizar datos iniciales cuando se cargan del backend (al inicio)
useEffect(() => {
  if (state.productionTracking.length > 0) {
    const currentCorreriaData = state.productionTracking.filter(
      pt => pt.correriaId === selectedCorreriaId
    );
    
    // Solo actualizar si initialProductionData está vacío (primera carga)
    if (initialProductionData.length === 0) {
      setInitialProductionData(currentCorreriaData);
    }
  }
}, []); // Solo se ejecuta una vez al montar el componente

  // Advertir al usuario si intenta recargar la página con cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault();
        e.returnValue = ''; // Esto muestra el mensaje del navegador
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Cerrar filtro al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // No cerrar si el click es dentro del menú de filtro
      if (!target.closest('[data-filter-menu]')) {
        setActiveFilterMenu(null);
      }
    };

    if (activeFilterMenu) {
      // Usar setTimeout para evitar que el click que abre el menú lo cierre inmediatamente
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [activeFilterMenu]);

  const reportData = useMemo(() => {
    if (!selectedCorreriaId) return [];

    let data = state.references
      .filter(ref => ref.correrias.includes(selectedCorreriaId)) // ← FILTRAR POR CORRERÍA
      .map(ref => {
        const refOrders = state.orders.filter(o => o.correriaId === selectedCorreriaId);
        const totalSold = refOrders.reduce((acc, order) => {
          const item = order.items.find(i => i.reference === ref.id);
          return acc + (item?.quantity || 0);
        }, 0);

        const clientsWhoOrdered = new Set(
          refOrders
            .filter(o => o.items.some(i => i.reference === ref.id))
            .map(o => o.clientId)
        );

        const received = state.receptions
          .filter(r => r.affectsInventory !== false)
          .reduce((acc, r) => 
            acc + r.items.filter(i => i.reference === ref.id).reduce((a, b) => a + b.quantity, 0), 0);
        const dispatched = state.dispatches.reduce((acc, d) => 
          acc + d.items.filter(i => i.reference === ref.id).reduce((a, b) => a + b.quantity, 0), 0);
        const stock = received - dispatched;

        const prod = state.productionTracking.find(p => p.refId === ref.id && p.correriaId === selectedCorreriaId) || { programmed: 0, cut: 0, inventory: 0 };
        const pending = totalSold - (prod.inventory + prod.programmed + prod.cut);

        const totalCloth1 = (ref.avgCloth1 || 0) * totalSold;
        const totalCloth2 = (ref.avgCloth2 || 0) * totalSold;

        return {
          ...ref,
          totalSold,
          stock,
          programmed: prod.programmed,
          cut: prod.cut,
          inventory: prod.inventory,
          pending,
          clientCount: clientsWhoOrdered.size,
          totalCloth1,
          totalCloth2
        };
      });

    if (refFilter) data = data.filter(r => r.id.includes(refFilter.toUpperCase()));
    if (hideZeros) data = data.filter(r => r.totalSold > 0);

    // Aplicar filtros de columnas
    if (columnFilters.vendido?.type === 'greater' && columnFilters.vendido.value !== undefined) {
      data = data.filter(r => r.totalSold > columnFilters.vendido.value!);
    }
    if (columnFilters.vendido?.type === 'less' && columnFilters.vendido.value !== undefined) {
      data = data.filter(r => r.totalSold < columnFilters.vendido.value!);
    }
    if (columnFilters.vendido?.type === 'equals' && columnFilters.vendido.value !== undefined) {
      data = data.filter(r => r.totalSold === columnFilters.vendido.value!);
    }

    if (columnFilters.stock?.type === 'greater' && columnFilters.stock.value !== undefined) {
      data = data.filter(r => r.stock > columnFilters.stock.value!);
    }
    if (columnFilters.stock?.type === 'less' && columnFilters.stock.value !== undefined) {
      data = data.filter(r => r.stock < columnFilters.stock.value!);
    }
    if (columnFilters.stock?.type === 'equals' && columnFilters.stock.value !== undefined) {
      data = data.filter(r => r.stock === columnFilters.stock.value!);
    }

    if (columnFilters.programmed?.type === 'greater' && columnFilters.programmed.value !== undefined) {
      data = data.filter(r => r.programmed > columnFilters.programmed.value!);
    }
    if (columnFilters.programmed?.type === 'less' && columnFilters.programmed.value !== undefined) {
      data = data.filter(r => r.programmed < columnFilters.programmed.value!);
    }
    if (columnFilters.programmed?.type === 'equals' && columnFilters.programmed.value !== undefined) {
      data = data.filter(r => r.programmed === columnFilters.programmed.value!);
    }

    if (columnFilters.cut?.type === 'greater' && columnFilters.cut.value !== undefined) {
      data = data.filter(r => r.cut > columnFilters.cut.value!);
    }
    if (columnFilters.cut?.type === 'less' && columnFilters.cut.value !== undefined) {
      data = data.filter(r => r.cut < columnFilters.cut.value!);
    }
    if (columnFilters.cut?.type === 'equals' && columnFilters.cut.value !== undefined) {
      data = data.filter(r => r.cut === columnFilters.cut.value!);
    }

    if (columnFilters.pending?.type === 'greater' && columnFilters.pending.value !== undefined) {
      data = data.filter(r => r.pending > columnFilters.pending.value!);
    }
    if (columnFilters.pending?.type === 'less' && columnFilters.pending.value !== undefined) {
      data = data.filter(r => r.pending < columnFilters.pending.value!);
    }
    if (columnFilters.pending?.type === 'equals' && columnFilters.pending.value !== undefined) {
      data = data.filter(r => r.pending === columnFilters.pending.value!);
    }

    // Ordenamiento
    if (columnFilters.vendido?.type === 'asc') {
      data.sort((a, b) => a.totalSold - b.totalSold);
    }
    if (columnFilters.vendido?.type === 'desc') {
      data.sort((a, b) => b.totalSold - a.totalSold);
    }

    if (columnFilters.stock?.type === 'asc') {
      data.sort((a, b) => a.stock - b.stock);
    }
    if (columnFilters.stock?.type === 'desc') {
      data.sort((a, b) => b.stock - a.stock);
    }

    if (columnFilters.programmed?.type === 'asc') {
      data.sort((a, b) => a.programmed - b.programmed);
    }
    if (columnFilters.programmed?.type === 'desc') {
      data.sort((a, b) => b.programmed - a.programmed);
    }

    if (columnFilters.cut?.type === 'asc') {
      data.sort((a, b) => a.cut - b.cut);
    }
    if (columnFilters.cut?.type === 'desc') {
      data.sort((a, b) => b.cut - a.cut);
    }

    if (columnFilters.pending?.type === 'asc') {
      data.sort((a, b) => a.pending - b.pending);
    }
    if (columnFilters.pending?.type === 'desc') {
      data.sort((a, b) => b.pending - a.pending);
    }

    // Filtros de texto para telas
    if (columnFilters.cloth1?.type === 'contains' && columnFilters.cloth1.value) {
      const searchValue = (columnFilters.cloth1.value as string).toUpperCase();
      data = data.filter(r => {
        const cloth1 = r.cloth1 ? r.cloth1.toUpperCase() : '';
        return cloth1.includes(searchValue);
      });
    }

    if (columnFilters.cloth2?.type === 'contains' && columnFilters.cloth2.value) {
      const searchValue = (columnFilters.cloth2.value as string).toUpperCase();
      data = data.filter(r => {
        const cloth2 = r.cloth2 ? r.cloth2.toUpperCase() : '';
        return cloth2.includes(searchValue);
      });
    }

    return data;
  }, [selectedCorreriaId, state.orders, state.references, state.receptions, state.dispatches, state.productionTracking, refFilter, hideZeros, columnFilters]);

  const updateProduction = (refId: string, field: 'programmed' | 'cut' | 'inventory', value: number) => {
    updateState(prev => {
      const existingIdx = prev.productionTracking.findIndex(p => p.refId === refId && p.correriaId === selectedCorreriaId);
      const newList = [...prev.productionTracking];
      if (existingIdx > -1) {
        newList[existingIdx] = { ...newList[existingIdx], [field]: value };
      } else {
        newList.push({ refId, correriaId: selectedCorreriaId, programmed: 0, cut: 0, inventory: 0, [field]: value });
      }
      
      // Marcar que hay cambios sin guardar
      hasUnsavedChanges.current = true;
      if (onUnsavedChanges) {
        onUnsavedChanges(true);
      }
      
      return { ...prev, productionTracking: newList };
    });
  };

  // Función para guardar los cambios
const handleSaveProduction = async () => {
  if (!isAdmin) {
    alert('No tienes permisos para guardar cambios');
    return;
  }

    // ===== LOGS DE DEBUG =====
  console.log('🔍 DEBUGGING:');
  console.log('1. initialProductionData:', initialProductionData);
  
  const currentCorreriaData = state.productionTracking.filter(
    pt => pt.correriaId === selectedCorreriaId
  );
  console.log('2. currentCorreriaData:', currentCorreriaData);
  // ===== FIN LOGS =====

  setIsSaving(true);

  try {
    // Obtener solo los datos de la correría actual
    const currentCorreriaData = state.productionTracking.filter(
      pt => pt.correriaId === selectedCorreriaId
    );

    // Detectar qué cambió comparando con los datos iniciales
    const changedData = currentCorreriaData.filter(current => {
      const initial = initialProductionData.find(
        init => init.refId === current.refId && init.correriaId === current.correriaId
      );
      
      // Si no existía antes, es nuevo
      if (!initial) return true;
      
      // Si cambió algún valor, incluirlo
      return initial.programmed !== current.programmed || initial.cut !== current.cut || initial.inventory !== current.inventory;
    });

    // ===== LOG DE DEBUG =====
    console.log('3. changedData:', changedData);
    console.log('4. changedData.length:', changedData.length);
    // ===== FIN LOG =====

    // Si no hay cambios, no hacer nada
    if (changedData.length === 0) {
      alert('No hay cambios para guardar');
      setIsSaving(false);
      return;
    }

    // Guardar en el backend
    const result = await api.saveProductionBatch(changedData);

    if (result.success) {
      // Actualizar los datos iniciales con los nuevos valores
      setInitialProductionData(currentCorreriaData);
      hasUnsavedChanges.current = false;
      if (onUnsavedChanges) {
        onUnsavedChanges(false);
      }
      
      alert(`✅ ${changedData.length} registro(s) guardado(s) exitosamente`);
    } else {
      alert(`❌ Error al guardar: ${result.message || 'Error desconocido'}`);
    }

  } catch (error) {
    console.error('Error al guardar producción:', error);
    alert('❌ Error de conexión al guardar');
  } finally {
    setIsSaving(false);
  }
};

  // Componente para el botón de filtro - Memoizado para evitar re-renders
  const FilterButton = React.memo(({ columnKey, color, isTextFilter = false }: { columnKey: string; color: string; isTextFilter?: boolean }) => {
    const filter = columnFilters[columnKey];
    const isActive = filter && filter.type !== 'none';

    return (
      <div className="relative" data-filter-menu>
        <button
          onClick={() => setActiveFilterMenu(activeFilterMenu === columnKey ? null : columnKey)}
          className={`p-1.5 rounded-lg transition-all ${
            isActive
              ? `bg-${color}-200 text-${color}-700`
              : `bg-transparent text-slate-400 hover:bg-slate-100`
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 00-1 1v2.586a1 1 0 00.293.707l6.414 6.414v7.586a1 1 0 001 1h2a1 1 0 001-1v-7.586l6.414-6.414A1 1 0 0021 7.586V5a1 1 0 00-1-1h-16z" />
          </svg>
        </button>

        {activeFilterMenu === columnKey && (
          <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[200px]" data-filter-menu onMouseDown={(e) => e.stopPropagation()}>
            <div className="p-3 space-y-2">
              <button
                onClick={() => {
                  setColumnFilters(prev => ({ ...prev, [columnKey]: { type: 'none' } }));
                  setTextFilterInputs(prev => ({ ...prev, [columnKey]: '' }));
                  setNumericFilterInputs(prev => ({ ...prev, [columnKey]: '' }));
                  setActiveFilterMenu(null);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded"
              >
                Limpiar filtro
              </button>

              {!isTextFilter && (
                <>
                  <div className="border-t border-slate-100 pt-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Ordenar</p>
                    <button
                      onClick={() => {
                        setColumnFilters(prev => ({ ...prev, [columnKey]: { type: 'asc' } }));
                        setActiveFilterMenu(null);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 5.25M17.25 9v12" />
                      </svg>
                      Menor a Mayor
                    </button>
                    <button
                      onClick={() => {
                        setColumnFilters(prev => ({ ...prev, [columnKey]: { type: 'desc' } }));
                        setActiveFilterMenu(null);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25.75L17.25 15m0 0L21 18.75M17.25 15v-12" />
                      </svg>
                      Mayor a Menor
                    </button>
                  </div>
                  <div className="border-t border-slate-100 pt-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Filtrar</p>
                    <input
                      type="number"
                      placeholder="Valor"
                      value={numericFilterInputs[columnKey] || ''}
                      className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded mb-2 focus:ring-2 focus:ring-blue-100"
                      onMouseDown={(e) => e.stopPropagation()}
                      autoFocus
                      onChange={(e) => {
                        setNumericFilterInputs(prev => ({ ...prev, [columnKey]: e.target.value }));
                      }}
                    />
                    <button
                      onClick={() => {
                        const value = numericFilterInputs[columnKey];
                        if (value) {
                          setColumnFilters(prev => ({ ...prev, [columnKey]: { type: 'equals', value: Number(value) } }));
                          setTimeout(() => setActiveFilterMenu(null), 100);
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded mb-1"
                    >
                      Igual a
                    </button>
                    <button
                      onClick={() => {
                        const value = numericFilterInputs[columnKey];
                        if (value) {
                          setColumnFilters(prev => ({ ...prev, [columnKey]: { type: 'greater', value: Number(value) } }));
                          setTimeout(() => {
                            setNumericFilterInputs(prev => ({ ...prev, [columnKey]: '' }));
                            setActiveFilterMenu(null);
                          }, 100);
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded mb-1"
                    >
                      Mayor que
                    </button>
                    <button
                      onClick={() => {
                        const value = numericFilterInputs[columnKey];
                        if (value) {
                          setColumnFilters(prev => ({ ...prev, [columnKey]: { type: 'less', value: Number(value) } }));
                          setTimeout(() => {
                            setNumericFilterInputs(prev => ({ ...prev, [columnKey]: '' }));
                            setActiveFilterMenu(null);
                          }, 100);
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded"
                    >
                      Menor que
                    </button>
                  </div>
                </>
              )}

              {isTextFilter && (
                <div className="border-t border-slate-100 pt-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Buscar</p>
                  <input
                    type="text"
                    placeholder="Ej: Burda"
                    value={textFilterInputs[columnKey] || ''}
                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:ring-2 focus:ring-blue-100"
                    onMouseDown={(e) => e.stopPropagation()}
                    autoFocus
                    onChange={(e) => {
                      const value = e.target.value;
                      setTextFilterInputs(prev => ({ ...prev, [columnKey]: value }));
                      
                      if (value.trim()) {
                        setColumnFilters(prev => ({ ...prev, [columnKey]: { type: 'contains', value } }));
                      } else {
                        setColumnFilters(prev => ({ ...prev, [columnKey]: { type: 'none' } }));
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">Ventas y producción</h2>
          <p className="text-slate-500 font-bold text-xs mt-1">Campaña: {state.correrias.find(c => c.id === selectedCorreriaId)?.name}</p>
        </div>
        
        <div className="flex flex-wrap gap-3 bg-white p-3 rounded-3xl border border-slate-100 shadow-sm items-center">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-600 uppercase ml-2 mb-1">Referencia</span>
            <input type="text" value={refFilter} onChange={e => setRefFilter(e.target.value)} placeholder="Ej: 10210" className="px-3 py-1.5 bg-slate-50 rounded-xl text-xs font-bold w-28 border-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300" />
          </div>
          <div className="flex items-center gap-2 border-l border-slate-100 pl-3 h-10 mt-2">
             <input type="checkbox" checked={hideZeros} onChange={e => setHideZeros(e.target.checked)} id="hz" className="rounded text-blue-600 focus:ring-blue-500" />
             <label htmlFor="hz" className="text-[10px] font-black text-slate-600 uppercase cursor-pointer">Ocultar 0</label>
          </div>
            <div className="flex flex-col border-l border-slate-100 pl-3">
            <span className="text-[8px] font-black text-slate-600 uppercase mb-1">Campaña</span>
            <CorreriaAutocomplete
              value={selectedCorreriaId}
              correrias={state.correrias}
              onChange={setSelectedCorreriaId}
              search={correriaSearch}
              setSearch={setCorreriaSearch}
              showDropdown={showCorreriaDropdown}
              setShowDropdown={setShowCorreriaDropdown}
            />
          </div>
          
          {/* BOTÓN GUARDAR - Solo visible para admin */}
          {isAdmin && (
            <div className="flex items-center border-l border-slate-100 pl-3 gap-2">
              <button 
                onClick={handleSaveProduction}
                disabled={isSaving}
                className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white font-black rounded-xl text-xs uppercase tracking-wider hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                    Guardar
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setColumnFilters({});
                  setTextFilterInputs({});
                  setNumericFilterInputs({});
                }}
                className="px-4 py-2.5 bg-slate-100 text-slate-600 font-black rounded-xl text-xs uppercase tracking-wider hover:bg-slate-200 transition-all flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar Filtros
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-[10px] min-w-[1250px] table-fixed">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 font-black uppercase w-32 text-slate-700">Referencia</th>
                <th className="px-2 py-3 font-black uppercase text-center w-16 text-blue-800">
                  <div className="flex items-center justify-center gap-1">
                    Vendido
                    <FilterButton columnKey="vendido" color="blue" />
                  </div>
                </th>
                <th className="px-2 py-3 font-black uppercase text-center w-20 text-orange-700">
                  <div className="flex items-center justify-center gap-1">
                    Inventario
                    <FilterButton columnKey="inventory" color="orange" />
                  </div>
                </th>
                <th className="px-2 py-3 font-black uppercase text-center w-24 text-indigo-700">
                  <div className="flex items-center justify-center gap-1">
                    Prog.
                    <FilterButton columnKey="programmed" color="indigo" />
                  </div>
                </th>
                <th className="px-2 py-3 font-black uppercase text-center w-24 text-pink-700">
                  <div className="flex items-center justify-center gap-1">
                    Cortado
                    <FilterButton columnKey="cut" color="pink" />
                  </div>
                </th>
                <th className="px-2 py-3 font-black uppercase text-center w-14 text-red-700">
                  <div className="flex items-center justify-center gap-1">
                    Pend.
                    <FilterButton columnKey="pending" color="red" />
                  </div>
                </th>
                <th className="px-2 py-3 font-black uppercase text-center w-10 text-slate-700">Clt</th>
                <th className="px-2 py-3 font-black uppercase text-center w-14 text-slate-700 border-l border-slate-200">
                  <div className="flex items-center justify-center gap-1">
                    Stock
                    <FilterButton columnKey="stock" color="slate" />
                  </div>
                </th>
                <th className="px-3 py-3 font-black uppercase text-center w-32 border-l border-slate-200 text-slate-700">
                  <div className="flex items-center justify-center gap-1">
                    Tela 1 / Prom / Total
                    <FilterButton columnKey="cloth1" color="blue" isTextFilter={true} />
                  </div>
                </th>
                <th className="px-3 py-3 font-black uppercase text-center w-32 border-l border-slate-200 text-slate-700">
                  <div className="flex items-center justify-center gap-1">
                    Tela 2 / Prom / Total
                    <FilterButton columnKey="cloth2" color="pink" isTextFilter={true} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {reportData.map(row => {
                const prod = state.productionTracking.find(p => p.refId === row.id && p.correriaId === selectedCorreriaId) || { programmed: 0, cut: 0, inventory: 0 };
                return (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2">
                    <p className="font-black text-slate-800 text-sm leading-tight">{row.id}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase truncate">{row.description}</p>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <span className={`px-2 py-1 rounded-md font-black text-sm ${row.totalSold > 0 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}>{row.totalSold}</span>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <input 
                      type="number" 
                      value={prod.inventory || 0} 
                      onChange={e => updateProduction(row.id, 'inventory', Number(e.target.value))} 
                      readOnly={!isAdmin}
                      className={`w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-black text-center text-orange-700 text-sm focus:ring-2 focus:ring-orange-100 ${!isAdmin ? 'cursor-default' : ''}`}
                    />
                  </td>
                    <td className="px-2 py-2 text-center">
                      <input 
                        type="number" 
                        value={row.programmed} 
                        onChange={e => updateProduction(row.id, 'programmed', Number(e.target.value))} 
                        readOnly={!isAdmin}
                        className={`w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-black text-center text-indigo-700 text-sm focus:ring-2 focus:ring-indigo-100 ${!isAdmin ? 'cursor-default' : ''}`}
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input 
                        type="number" 
                        value={row.cut} 
                        onChange={e => updateProduction(row.id, 'cut', Number(e.target.value))} 
                        readOnly={!isAdmin}
                        className={`w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-black text-center text-pink-700 text-sm focus:ring-2 focus:ring-pink-100 ${!isAdmin ? 'cursor-default' : ''}`}
                      />
                    </td>
                  <td className="px-2 py-2 text-center font-black text-sm">
                    <span className={`px-2 py-1 rounded-md font-black ${
                      row.pending < 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {row.pending}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center font-bold text-slate-600 text-sm">{row.clientCount}</td>
                  <td className="px-2 py-2 text-center font-bold text-slate-600 text-sm border-l border-slate-200">{row.stock}</td>
                  
                  {/* TELA 1 Column */}
                  <td className="px-3 py-2 border-l border-slate-100">
                    {row.cloth1 ? (
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex flex-col flex-1 overflow-hidden">
                          <span className="font-black text-slate-800 truncate text-xs uppercase">{row.cloth1}</span>
                          <span className="text-[9px] font-bold text-slate-500">Prom: {row.avgCloth1}</span>
                        </div>
                        <div className="bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                          <span className="text-blue-700 font-black text-xs">{row.totalCloth1.toFixed(1)}m</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-slate-300">-</div>
                    )}
                  </td>

                  {/* TELA 2 Column */}
                  <td className="px-3 py-2 border-l border-slate-100">
                    {row.cloth2 ? (
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex flex-col flex-1 overflow-hidden">
                          <span className="font-black text-slate-800 truncate text-xs uppercase">{row.cloth2}</span>
                          <span className="text-[9px] font-bold text-slate-500">Prom: {row.avgCloth2}</span>
                        </div>
                        <div className="bg-pink-50 px-2 py-1 rounded-lg border border-pink-100">
                          <span className="text-pink-700 font-black text-xs">{row.totalCloth2.toFixed(1)}m</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-slate-300">-</div>
                    )}
                  </td>
                </tr>
                );
              })}
              {/* FILA DE TOTALES */}
              {reportData.length > 0 && (
                <tr className="bg-slate-100 border-t-2 border-slate-300 font-black">
                  <td className="px-4 py-3 text-slate-800 uppercase text-xs">TOTALES</td>
                  <td className="px-2 py-3 text-center">
                    <span className="px-2 py-1 rounded-md font-black text-sm bg-blue-600 text-white shadow-sm">
                      {reportData.reduce((sum, row) => sum + row.totalSold, 0)}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-center font-black text-orange-700 text-sm">
                    {state.productionTracking
                      .filter(p => p.correriaId === selectedCorreriaId && reportData.some(r => r.id === p.refId))
                      .reduce((sum, p) => sum + (p.inventory || 0), 0)}
                  </td>
                  <td className="px-2 py-3 text-center font-black text-indigo-700 text-sm">
                    {reportData.reduce((sum, row) => sum + row.programmed, 0)}
                  </td>
                  <td className="px-2 py-3 text-center font-black text-pink-700 text-sm">
                    {reportData.reduce((sum, row) => sum + row.cut, 0)}
                  </td>
                  <td className="px-2 py-3 text-center font-black text-sm">
                    <span className={`px-2 py-1 rounded-md font-black ${
                      reportData.reduce((sum, row) => sum + row.pending, 0) < 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {reportData.reduce((sum, row) => sum + row.pending, 0)}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-center font-black text-slate-700 text-sm">
                    {reportData.length > 0 ? (reportData.reduce((sum, row) => sum + row.clientCount, 0) / reportData.length).toFixed(1) : 0}
                  </td>
                  <td className="px-2 py-3 text-center font-black text-slate-700 text-sm border-l border-slate-200">
                    {reportData.reduce((sum, row) => sum + row.stock, 0)}
                  </td>
                  <td className="px-3 py-3 border-l border-slate-200"></td>
                  <td className="px-3 py-3 border-l border-slate-200"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersView;

const CorreriaAutocomplete: React.FC<{
  value: string;
  correrias: Correria[];
  onChange: (id: string) => void;
  search: string;
  setSearch: (search: string) => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
}> = ({ value, correrias, onChange, search, setSearch, showDropdown, setShowDropdown }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const correria = correrias.find(c => c.id === value);
  const displayValue = correria ? `${correria.name} ${correria.year}` : value;

  const filtered = correrias.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.year.toString().includes(search)
  );

  const handleBlur = () => {
    timeoutRef.current = setTimeout(() => setShowDropdown(false), 300);
  };

  const handleSelect = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onChange(id);
    setShowDropdown(false);
    setSearch('');
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={showDropdown ? search : displayValue}
        onChange={e => setSearch(e.target.value)}
        onFocus={() => { setShowDropdown(true); setSearch(''); }}
        onBlur={handleBlur}
        placeholder="Buscar..."
        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300 text-xs"
      />
      {showDropdown && (
        <div 
          className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-2xl max-h-48 overflow-y-auto"
          style={{ 
            zIndex: 9999,
            minWidth: '250px'
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {filtered.map(c => (
            <button
              key={c.id}
              onMouseDown={() => handleSelect(c.id)}
              className="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0"
            >
              <p className="font-black text-slate-800 text-xs">{c.name}</p>
              <p className="text-[9px] text-slate-400">{c.year}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
