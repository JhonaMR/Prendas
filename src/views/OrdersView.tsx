import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppState, Correria, Reference, ProductionTracking, UserRole } from '../types';
import api from '../services/api';

interface OrdersViewProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  user: any; // Usuario actual para validar permisos
  onUnsavedChanges?: (hasChanges: boolean) => void; // Callback para notificar cambios sin guardar
}

  const OrdersView: React.FC<OrdersViewProps> = ({ state, updateState, user, onUnsavedChanges }) => {
  const [selectedCorreriaId, setSelectedCorreriaId] = useState(state.correrias[0]?.id || '');
  const [refFilter, setRefFilter] = useState('');
  const [clothFilter, setClothFilter] = useState('');
  const [hideZeros, setHideZeros] = useState(false);
    // Estado para trackear los datos iniciales (los que vienen del backend)
  const [initialProductionData, setInitialProductionData] = useState<ProductionTracking[]>([]);

  // Estado para el proceso de guardado
  const [isSaving, setIsSaving] = useState(false);

  // Ref para detectar si hay cambios sin guardar
  const hasUnsavedChanges = useRef(false);

  // Verificar si el usuario es admin
  const isAdmin = user?.role === UserRole.admin || user?.role === 'admin';
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

  const reportData = useMemo(() => {
    if (!selectedCorreriaId) return [];

    let data = state.references.map(ref => {
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

      const received = state.receptions.reduce((acc, r) => 
        acc + r.items.filter(i => i.reference === ref.id).reduce((a, b) => a + b.quantity, 0), 0);
      const dispatched = state.dispatches.reduce((acc, d) => 
        acc + d.items.filter(i => i.reference === ref.id).reduce((a, b) => a + b.quantity, 0), 0);
      const stock = received - dispatched;

      const prod = state.productionTracking.find(p => p.refId === ref.id && p.correriaId === selectedCorreriaId) || { programmed: 0, cut: 0 };
      const pending = totalSold - prod.cut;

      const totalCloth1 = (ref.avgCloth1 || 0) * totalSold;
      const totalCloth2 = (ref.avgCloth2 || 0) * totalSold;

      return {
        ...ref,
        totalSold,
        stock,
        programmed: prod.programmed,
        cut: prod.cut,
        pending: Math.max(0, pending),
        clientCount: clientsWhoOrdered.size,
        totalCloth1,
        totalCloth2
      };
    });

    if (refFilter) data = data.filter(r => r.id.includes(refFilter.toUpperCase()));
    if (clothFilter) data = data.filter(r => 
      (r.cloth1?.toUpperCase().includes(clothFilter.toUpperCase())) || 
      (r.cloth2?.toUpperCase().includes(clothFilter.toUpperCase()))
    );
    if (hideZeros) data = data.filter(r => r.totalSold > 0);

    return data;
  }, [selectedCorreriaId, state.orders, state.references, state.receptions, state.dispatches, state.productionTracking, refFilter, clothFilter, hideZeros]);

  const updateProduction = (refId: string, field: 'programmed' | 'cut', value: number) => {
    updateState(prev => {
      const existingIdx = prev.productionTracking.findIndex(p => p.refId === refId && p.correriaId === selectedCorreriaId);
      const newList = [...prev.productionTracking];
      if (existingIdx > -1) {
        newList[existingIdx] = { ...newList[existingIdx], [field]: value };
      } else {
        newList.push({ refId, correriaId: selectedCorreriaId, programmed: 0, cut: 0, [field]: value });
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
      return initial.programmed !== current.programmed || initial.cut !== current.cut;
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
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-600 uppercase ml-2 mb-1">Tela</span>
            <input type="text" value={clothFilter} onChange={e => setClothFilter(e.target.value)} placeholder="Ej: Lino" className="px-3 py-1.5 bg-slate-50 rounded-xl text-xs font-bold w-28 border-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300" />
          </div>
          <div className="flex items-center gap-2 border-l border-slate-100 pl-3 h-10 mt-2">
             <input type="checkbox" checked={hideZeros} onChange={e => setHideZeros(e.target.checked)} id="hz" className="rounded text-blue-600 focus:ring-blue-500" />
             <label htmlFor="hz" className="text-[10px] font-black text-slate-600 uppercase cursor-pointer">Ocultar 0</label>
          </div>
            <div className="flex flex-col border-l border-slate-100 pl-3">
            <span className="text-[8px] font-black text-slate-600 uppercase mb-1">Campaña</span>
            <select value={selectedCorreriaId} onChange={e => setSelectedCorreriaId(e.target.value)} className="bg-transparent border-none font-black text-xs p-0 focus:ring-0 text-slate-800">
              {state.correrias.map(c => <option key={c.id} value={c.id}>{c.name} {c.year}</option>)}
            </select>
          </div>
          
          {/* BOTÓN GUARDAR - Solo visible para admin */}
          {isAdmin && (
            <div className="flex items-center border-l border-slate-100 pl-3">
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
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-[10px] min-w-[1250px] table-fixed">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-100">
                <th className="px-4 py-4 font-black uppercase w-32 text-slate-700">Referencia</th>
                <th className="px-2 py-4 font-black uppercase text-center w-16 text-blue-800">Vendido</th>
                <th className="px-2 py-4 font-black uppercase text-center w-14 text-slate-700">Stock</th>
                <th className="px-2 py-4 font-black uppercase text-center w-24 text-indigo-700">Prog.</th>
                <th className="px-2 py-4 font-black uppercase text-center w-24 text-pink-700">Cortado</th>
                <th className="px-2 py-4 font-black uppercase text-center w-14 text-red-700">Pend.</th>
                <th className="px-2 py-4 font-black uppercase text-center w-10 text-slate-700">Clt</th>
                <th className="px-4 py-4 font-black uppercase text-center w-40 border-l border-slate-200 text-slate-700">Tela 1 / Prom / Total</th>
                <th className="px-4 py-4 font-black uppercase text-center w-40 border-l border-slate-200 text-slate-700">Tela 2 / Prom / Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {reportData.map(row => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-black text-slate-800 text-[11px] leading-tight">{row.id}</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase truncate">{row.description}</p>
                  </td>
                  <td className="px-2 py-3 text-center">
                    <span className={`px-2 py-1 rounded-md font-black ${row.totalSold > 0 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}>{row.totalSold}</span>
                  </td>
                  <td className="px-2 py-3 text-center font-bold text-slate-600">{row.stock}</td>
                    <td className="px-2 py-3 text-center">
                      <input 
                        type="number" 
                        value={row.programmed} 
                        onChange={e => updateProduction(row.id, 'programmed', Number(e.target.value))} 
                        readOnly={!isAdmin}
                        className={`w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-black text-center text-indigo-700 focus:ring-2 focus:ring-indigo-100 ${!isAdmin ? 'cursor-default' : ''}`}
                      />
                    </td>
                    <td className="px-2 py-3 text-center">
                      <input 
                        type="number" 
                        value={row.cut} 
                        onChange={e => updateProduction(row.id, 'cut', Number(e.target.value))} 
                        readOnly={!isAdmin}
                        className={`w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-black text-center text-pink-700 focus:ring-2 focus:ring-pink-100 ${!isAdmin ? 'cursor-default' : ''}`}
                      />
                    </td>
                  <td className="px-2 py-3 text-center font-black text-red-600">{row.pending}</td>
                  <td className="px-2 py-3 text-center font-bold text-slate-600">{row.clientCount}</td>
                  
                  {/* TELA 1 Column */}
                  <td className="px-4 py-3 border-l border-slate-100">
                    {row.cloth1 ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col flex-1 overflow-hidden">
                          <span className="font-black text-slate-800 truncate text-[9px] uppercase">{row.cloth1}</span>
                          <span className="text-[8px] font-bold text-slate-500">Prom: {row.avgCloth1}</span>
                        </div>
                        <div className="bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                          <span className="text-blue-700 font-black text-[10px]">{row.totalCloth1.toFixed(1)}m</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-slate-300">-</div>
                    )}
                  </td>

                  {/* TELA 2 Column */}
                  <td className="px-4 py-3 border-l border-slate-100">
                    {row.cloth2 ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col flex-1 overflow-hidden">
                          <span className="font-black text-slate-800 truncate text-[9px] uppercase">{row.cloth2}</span>
                          <span className="text-[8px] font-bold text-slate-500">Prom: {row.avgCloth2}</span>
                        </div>
                        <div className="bg-pink-50 px-2 py-1 rounded-lg border border-pink-100">
                          <span className="text-pink-700 font-black text-[10px]">{row.totalCloth2.toFixed(1)}m</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-slate-300">-</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersView;
