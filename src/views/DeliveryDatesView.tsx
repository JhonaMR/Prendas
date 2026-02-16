import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppState, DeliveryDate, UserRole, Confeccionista } from '../types';
import api from '../services/api';

interface DeliveryDatesViewProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  user: any;
  onUnsavedChanges?: (hasChanges: boolean) => void;
}

const DeliveryDatesView: React.FC<DeliveryDatesViewProps> = ({ state, updateState, user, onUnsavedChanges }) => {
  const [initialData, setInitialData] = useState<DeliveryDate[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hideDelivered, setHideDelivered] = useState(false);
  const [confFilterId, setConfFilterId] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  const hasUnsavedChanges = useRef(false);
  const isAdmin = user?.role === UserRole.admin || user?.role === 'admin';

  useEffect(() => {
    setInitialData(state.deliveryDates);
    hasUnsavedChanges.current = false;
    if (onUnsavedChanges) onUnsavedChanges(false);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const addNewRow = () => {
    const newRow: DeliveryDate = {
      id: `temp_${Date.now()}`,
      confeccionistaId: '',
      referenceId: '',
      quantity: 0,
      sendDate: '',
      expectedDate: '',
      deliveryDate: null,
      process: '',
      observation: '',
      createdAt: new Date().toISOString(),
      createdBy: user.name
    };

    updateState(prev => ({
      ...prev,
      deliveryDates: [newRow, ...prev.deliveryDates]
    }));

    hasUnsavedChanges.current = true;
    if (onUnsavedChanges) onUnsavedChanges(true);
  };

  const updateRow = (id: string, field: keyof DeliveryDate, value: any) => {
    updateState(prev => ({
      ...prev,
      deliveryDates: prev.deliveryDates.map(d =>
        d.id === id ? { ...d, [field]: value } : d
      )
    }));

    hasUnsavedChanges.current = true;
    if (onUnsavedChanges) onUnsavedChanges(true);
  };

  const deleteRow = async (id: string) => {
    if (!confirm('¿Eliminar este registro?')) return;

    if (id.startsWith('temp_')) {
      updateState(prev => ({
        ...prev,
        deliveryDates: prev.deliveryDates.filter(d => d.id !== id)
      }));
    } else {
      try {
        const result = await api.deleteDeliveryDate(id);
        if (result.success) {
          updateState(prev => ({
            ...prev,
            deliveryDates: prev.deliveryDates.filter(d => d.id !== id)
          }));
        } else {
          alert('Error al eliminar');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
      }
    }
  };

  const handleSave = async () => {
    if (!isAdmin) {
      alert('No tienes permisos para guardar');
      return;
    }

    const changedData = state.deliveryDates.filter(current => {
      const initial = initialData.find(init => init.id === current.id);
      if (!initial) return true;
      return JSON.stringify(initial) !== JSON.stringify(current);
    });

    if (changedData.length === 0) {
      alert('No hay cambios para guardar');
      return;
    }

    setIsSaving(true);
    try {
      const result = await api.saveDeliveryDatesBatch(changedData);

      if (result.success) {
        setInitialData(state.deliveryDates);
        hasUnsavedChanges.current = false;
        if (onUnsavedChanges) onUnsavedChanges(false);
        alert(`✅ ${changedData.length} registro(s) guardado(s)`);
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error de conexión');
    } finally {
      setIsSaving(false);
    }
  };

  const calcDaysDiff = (date1: string, date2: string | null) => {
    if (!date1 || !date2) return null;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  };

  const metrics = useMemo(() => {
    const delivered = state.deliveryDates.filter(d => d.deliveryDate);
    const pending = state.deliveryDates.filter(d => !d.deliveryDate);

    const highPriority = pending.filter(d => {
      const expected = new Date(d.expectedDate);
      const today = new Date();
      const diff = Math.round((today.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 20;
    }).length;

    const avgDelay = delivered.length > 0
      ? delivered.reduce((acc, d) => {
          const diff = calcDaysDiff(d.expectedDate, d.deliveryDate);
          return acc + (diff || 0);
        }, 0) / delivered.length
      : 0;

    const efficiency = state.deliveryDates.length > 0
      ? (delivered.length / state.deliveryDates.length) * 100
      : 0;

    return {
      highPriority,
      pending: pending.length,
      avgDelay: avgDelay.toFixed(1),
      efficiency: efficiency.toFixed(0)
    };
  }, [state.deliveryDates]);

  const filteredData = useMemo(() => {
    let data = state.deliveryDates;

    if (hideDelivered) {
      data = data.filter(d => !d.deliveryDate);
    }

    if (confFilterId) {
      data = data.filter(d => d.confeccionistaId === confFilterId);
    }

    if (dateFilter) {
      data = data.filter(d =>
        d.sendDate.includes(dateFilter) ||
        d.expectedDate.includes(dateFilter) ||
        d.deliveryDate?.includes(dateFilter)
      );
    }

    return data;
  }, [state.deliveryDates, hideDelivered, confFilterId, dateFilter]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Control de fechas de entrega y producción</h2>
          <p className="text-slate-500 font-bold text-xs mt-1">Gestión de lotes y cronogramas</p>
        </div>

        <div className="flex flex-wrap gap-3 bg-white p-3 rounded-3xl border border-slate-100 shadow-sm items-center">
          <div className="flex flex-col w-48">
            <span className="text-[8px] font-black text-slate-600 uppercase ml-2 mb-1">Confeccionista</span>
            <ConfeccionistaAutocomplete
              value={confFilterId}
              confeccionistas={state.confeccionistas}
              onChange={setConfFilterId}
              disabled={false}
            />
          </div>

          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-600 uppercase ml-2 mb-1">Fecha</span>
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 rounded-xl text-xs font-bold w-36 border-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center gap-2 border-l border-slate-100 pl-3 h-10 mt-2">
            <input
              type="checkbox"
              checked={hideDelivered}
              onChange={e => setHideDelivered(e.target.checked)}
              id="hideD"
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="hideD" className="text-[10px] font-black text-slate-600 uppercase cursor-pointer">
              Ocultar entregados
            </label>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2 border-l border-slate-100 pl-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white font-black rounded-xl text-xs uppercase tracking-wider hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CARDS MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-3xl border border-red-200">
          <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">Lotes de atención prioritaria</p>
          <p className="text-5xl font-black text-red-700">{metrics.highPriority}</p>
          <p className="text-[10px] font-bold text-red-500 uppercase mt-1">Lotes con 20 días de retraso</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-3xl border border-yellow-200">
          <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-2">Lotes en proceso</p>
          <p className="text-5xl font-black text-yellow-700">{metrics.pending}</p>
          <p className="text-[10px] font-bold text-yellow-500 uppercase mt-1">Pendientes por entregar</p>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-3xl border border-pink-200">
          <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest mb-2">Retraso promedio</p>
          <p className="text-5xl font-black text-pink-700">{metrics.avgDelay}</p>
          <p className="text-[10px] font-bold text-pink-500 uppercase mt-1">Días respecto a fecha pactada</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-3xl border border-green-200">
          <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">Eficiencia entrega</p>
          <p className="text-5xl font-black text-green-700">{metrics.efficiency}%</p>
          <p className="text-[10px] font-bold text-green-500 uppercase mt-1">Cumplimiento de cronograma</p>
        </div>
      </div>

      {/* BOTÓN AGREGAR */}
      {isAdmin && (
        <button
          onClick={addNewRow}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          AGREGAR NUEVA FILA
        </button>
      )}

      {/* TABLA */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100" style={{ overflow: 'visible' }}>
        <div style={{ overflow: 'visible' }}>
          <table className="w-full text-left text-[10px] min-w-[1800px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-4 font-black uppercase text-slate-700 w-48">Confeccionista</th>
                <th className="px-3 py-4 font-black uppercase text-slate-700 text-center w-24">Ref.</th>
                <th className="px-3 py-4 font-black uppercase text-slate-700 text-center w-20">Cant.</th>
                <th className="px-3 py-4 font-black uppercase text-orange-700 text-center w-32 bg-yellow-50">Fecha envío lote</th>
                <th className="px-3 py-4 font-black uppercase text-orange-700 text-center w-36 bg-yellow-50">Fecha presup. entrega</th>
                <th className="px-3 py-4 font-black uppercase text-blue-700 text-center w-32 bg-blue-50">Fecha entrega</th>
                <th className="px-3 py-4 font-black uppercase text-slate-700 text-center w-24">Dif fechas</th>
                <th className="px-3 py-4 font-black uppercase text-slate-700 text-center w-24">Rot. inicial</th>
                <th className="px-3 py-4 font-black uppercase text-slate-700 text-center w-24">Rot. final</th>
                <th className="px-3 py-4 font-black uppercase text-slate-700 text-center w-28">Rot final vs ini</th>
                <th className="px-4 py-4 font-black uppercase text-slate-700 w-32">Proceso</th>
                <th className="px-4 py-4 font-black uppercase text-slate-700 w-40">Observación</th>
                <th className="px-3 py-4 text-center w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map(row => {
                const difFechas = calcDaysDiff(row.expectedDate, row.deliveryDate);
                const rotInicial = calcDaysDiff(row.sendDate, row.expectedDate);
                const rotFinal = calcDaysDiff(row.sendDate, row.deliveryDate);
                const rotDiff = rotInicial !== null && rotFinal !== null ? rotInicial - rotFinal : null;

                return (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2">
                      <ConfeccionistaAutocomplete
                        value={row.confeccionistaId}
                        confeccionistas={state.confeccionistas}
                        onChange={val => updateRow(row.id, 'confeccionistaId', val)}
                        disabled={!isAdmin}
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="text"
                        value={row.referenceId}
                        onChange={e => updateRow(row.id, 'referenceId', e.target.value)}
                        readOnly={!isAdmin}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-black text-center text-blue-700 focus:ring-2 focus:ring-blue-100"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        value={row.quantity}
                        onChange={e => updateRow(row.id, 'quantity', Number(e.target.value))}
                        readOnly={!isAdmin}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-black text-center focus:ring-2 focus:ring-blue-100"
                      />
                    </td>
                    <td className="px-3 py-2 text-center bg-yellow-50">
                      <input
                        type="date"
                        value={row.sendDate}
                        onChange={e => updateRow(row.id, 'sendDate', e.target.value)}
                        readOnly={!isAdmin}
                        className="w-full px-2 py-1 bg-white border border-orange-200 rounded-lg font-bold text-center text-orange-700 focus:ring-2 focus:ring-orange-100"
                      />
                    </td>
                    <td className="px-3 py-2 text-center bg-yellow-50">
                      <input
                        type="date"
                        value={row.expectedDate}
                        onChange={e => updateRow(row.id, 'expectedDate', e.target.value)}
                        readOnly={!isAdmin}
                        className="w-full px-2 py-1 bg-white border border-orange-200 rounded-lg font-bold text-center text-orange-700 focus:ring-2 focus:ring-orange-100"
                      />
                    </td>
                    <td className="px-3 py-2 text-center bg-blue-50">
                      <input
                        type="date"
                        value={row.deliveryDate || ''}
                        onChange={e => updateRow(row.id, 'deliveryDate', e.target.value || null)}
                        readOnly={!isAdmin}
                        className="w-full px-2 py-1 bg-white border border-blue-200 rounded-lg font-bold text-center text-blue-700 focus:ring-2 focus:ring-blue-100"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`font-black ${difFechas && difFechas > 0 ? 'text-red-600' : difFechas && difFechas < 0 ? 'text-green-600' : 'text-slate-400'}`}>
                        {difFechas !== null ? difFechas : '-'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="font-bold text-slate-700">{rotInicial !== null ? rotInicial : '-'}</span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="font-bold text-slate-700">{rotFinal !== null ? rotFinal : '-'}</span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`font-black ${rotDiff && rotDiff > 0 ? 'text-red-600' : rotDiff && rotDiff < 0 ? 'text-green-600' : 'text-slate-400'}`}>
                        {rotDiff !== null ? rotDiff : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={row.process}
                        onChange={e => updateRow(row.id, 'process', e.target.value)}
                        readOnly={!isAdmin}
                        placeholder="Estado..."
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-300"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={row.observation}
                        onChange={e => updateRow(row.id, 'observation', e.target.value)}
                        readOnly={!isAdmin}
                        placeholder="Nota..."
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      {isAdmin && (
                        <button
                          onClick={() => deleteRow(row.id)}
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ConfeccionistaAutocomplete: React.FC<{
  value: string;
  confeccionistas: Confeccionista[];
  onChange: (id: string) => void;
  disabled: boolean;
}> = ({ value, confeccionistas, onChange, disabled }) => {
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const conf = confeccionistas.find(c => c.id === value);
  const displayValue = conf ? `${conf.id} - ${conf.name}` : value;

  const filtered = confeccionistas.filter(c =>
    c.active && (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
    )
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
        readOnly={disabled}
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
              <p className="text-[9px] text-slate-400">{c.id}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryDatesView;
