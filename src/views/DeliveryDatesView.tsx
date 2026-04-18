import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppState, DeliveryDate, UserRole, Confeccionista } from '../types';
import api from '../services/api';
import { validateBatch, validateRecord, ValidationError } from '../utils/deliveryDateValidator';
import PaginationComponent from '../components/PaginationComponent';
import usePagination from '../hooks/usePagination';
import DeliveryDatesImportModal from '../components/DeliveryDatesImportModal';
import TextAutocomplete from '../components/TextAutocomplete';

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
  const [refFilterId, setRefFilterId] = useState('');
  const [processFilter, setProcessFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sendDateMonthFilter, setSendDateMonthFilter] = useState('');
  const [expectedDateMonthFilter, setExpectedDateMonthFilter] = useState('');
  const [deliveryDateMonthFilter, setDeliveryDateMonthFilter] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ [index: number]: ValidationError }>({});
  const [isLoadingPaginated, setIsLoadingPaginated] = useState(false);
  const [usePaginatedView, setUsePaginatedView] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [filterHighPriority, setFilterHighPriority] = useState(false);
  const [isUndPendientesOpen, setIsUndPendientesOpen] = useState(false);
  const deliveryDatesPagination = usePagination(1, 50);
  
  const hasUnsavedChanges = useRef(false);
  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SOPORTE || user?.role === 'admin' || user?.role === 'soporte' || user?.role === UserRole.OPERADOR || user?.role === 'operador';
  const isGeneral = user?.role === 'general' || user?.role === UserRole.GENERAL;

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
      rem: null,
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

    // Validar el campo actualizado
    const updatedRecord = state.deliveryDates.find(d => d.id === id);
    if (updatedRecord) {
      const updated = { ...updatedRecord, [field]: value };
      const validation = validateRecord(updated);
      
      setValidationErrors(prev => {
        const recordIndex = state.deliveryDates.findIndex(d => d.id === id);
        if (validation.isValid) {
          const newErrors = { ...prev };
          delete newErrors[recordIndex];
          return newErrors;
        } else {
          return { ...prev, [recordIndex]: validation.errors };
        }
      });
    }

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

  const handleImportData = (importedData: DeliveryDate[]) => {
    updateState(prev => ({
      ...prev,
      deliveryDates: [...importedData, ...prev.deliveryDates]
    }));

    hasUnsavedChanges.current = true;
    if (onUnsavedChanges) onUnsavedChanges(true);

    alert(`✅ ${importedData.length} registros importados correctamente. No olvides guardar los cambios.`);
  };

  const handleSave = async () => {
    const changedData = state.deliveryDates.filter(current => {
      const initial = initialData.find(init => init.id === current.id);
      if (!initial) return true;
      return JSON.stringify(initial) !== JSON.stringify(current);
    });

    if (changedData.length === 0) {
      alert('No hay cambios para guardar');
      return;
    }

    // Validar todos los registros antes de enviar
    const batchValidation = validateBatch(changedData);
    if (!batchValidation.isValid) {
      // Actualizar errores de validación
      const errorMap: { [index: number]: ValidationError } = {};
      Object.entries(batchValidation.errors).forEach(([indexStr, errors]) => {
        const recordIndex = state.deliveryDates.findIndex(d => d.id === changedData[parseInt(indexStr)].id);
        if (recordIndex >= 0) {
          errorMap[recordIndex] = errors;
        }
      });
      setValidationErrors(errorMap);

      let errorMessage = '❌ Errores de validación:\n\n';
      Object.entries(batchValidation.errors).forEach(([indexStr, errors]) => {
        const index = parseInt(indexStr);
        errorMessage += `Fila ${index + 1}:\n`;
        Object.entries(errors).forEach(([field, msg]) => {
          errorMessage += `  • ${field}: ${msg}\n`;
        });
      });
      alert(errorMessage);
      return;
    }

    setIsSaving(true);
    try {
      const result = await api.saveDeliveryDatesBatch(changedData);

      if (result.data?.summary) {
        const { summary, errors } = result.data;
        
        // Mostrar resumen
        let message = `📊 Resultado: ${summary.saved} guardado(s)`;
        if (summary.failed > 0) {
          message += `, ${summary.failed} error(es)`;
        }
        alert(message);

        // Si hay registros guardados, actualizar initialData
        if (summary.saved > 0) {
          setInitialData(state.deliveryDates);
          hasUnsavedChanges.current = false;
          if (onUnsavedChanges) onUnsavedChanges(false);
          setValidationErrors({});
        }

        // Si hay errores, mostrarlos
        if (errors && errors.length > 0) {
          let errorMessage = '❌ Errores encontrados:\n\n';
          errors.forEach((err: any) => {
            errorMessage += `Fila ${err.index + 1}:\n`;
            Object.entries(err.errors).forEach(([field, msg]: [string, any]) => {
              errorMessage += `  • ${field}: ${msg}\n`;
            });
          });
          alert(errorMessage);
        }
      } else if (result.success) {
        setInitialData(state.deliveryDates);
        hasUnsavedChanges.current = false;
        if (onUnsavedChanges) onUnsavedChanges(false);
        setValidationErrors({});
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
      return diff > 10;
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

    if (filterHighPriority) {
      data = data.filter(d => {
        if (d.deliveryDate) return false; // Solo pendientes
        const expected = new Date(d.expectedDate);
        const today = new Date();
        const diff = Math.round((today.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 10;
      });
    }

    if (confFilterId) {
      data = data.filter(d => d.confeccionistaId.toLowerCase().includes(confFilterId.toLowerCase()));
    }

    if (refFilterId) {
      data = data.filter(d => d.referenceId.toLowerCase().includes(refFilterId.toLowerCase()));
    }

    if (processFilter) {
      data = data.filter(d => d.process.toLowerCase().includes(processFilter.toLowerCase()));
    }

    // Filtro de año - solo en sendDate
    if (yearFilter) {
      data = data.filter(d => {
        const sendYear = new Date(d.sendDate).getFullYear().toString();
        return sendYear === yearFilter;
      });
    }

    // Filtros de mes
    if (sendDateMonthFilter) {
      data = data.filter(d => {
        const sendMonth = (new Date(d.sendDate).getMonth() + 1).toString().padStart(2, '0');
        return sendMonth === sendDateMonthFilter;
      });
    }

    if (expectedDateMonthFilter) {
      data = data.filter(d => {
        const expectedMonth = (new Date(d.expectedDate).getMonth() + 1).toString().padStart(2, '0');
        return expectedMonth === expectedDateMonthFilter;
      });
    }

    if (deliveryDateMonthFilter) {
      data = data.filter(d => {
        if (!d.deliveryDate) return false;
        const deliveryMonth = (new Date(d.deliveryDate).getMonth() + 1).toString().padStart(2, '0');
        return deliveryMonth === deliveryDateMonthFilter;
      });
    }

    return data;
  }, [state.deliveryDates, hideDelivered, filterHighPriority, confFilterId, refFilterId, processFilter, yearFilter, sendDateMonthFilter, expectedDateMonthFilter, deliveryDateMonthFilter]);

  // Actualizar paginación cuando cambia filteredData
  useEffect(() => {
    deliveryDatesPagination.pagination.total = filteredData.length;
    deliveryDatesPagination.pagination.totalPages = Math.ceil(filteredData.length / deliveryDatesPagination.pagination.limit);
  }, [filteredData.length, deliveryDatesPagination.pagination.limit]);

  // Obtener sugerencias únicas de confeccionista (case-insensitive, pero mantener original)
  const confeccionistasSuggestions = useMemo(() => {
    const seen = new Map<string, string>();
    state.deliveryDates.forEach(d => {
      const key = d.confeccionistaId.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, d.confeccionistaId);
      }
    });
    return Array.from(seen.values()).sort();
  }, [state.deliveryDates]);

  // Obtener sugerencias únicas de referencia (case-insensitive, pero mantener original)
  const referenciasSuggestions = useMemo(() => {
    const seen = new Map<string, string>();
    state.deliveryDates.forEach(d => {
      const key = d.referenceId.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, d.referenceId);
      }
    });
    return Array.from(seen.values()).sort();
  }, [state.deliveryDates]);

  // Obtener sugerencias únicas de proceso (case-insensitive, pero mantener original)
  const procesosSuggestions = useMemo(() => {
    const seen = new Map<string, string>();
    state.deliveryDates.forEach(d => {
      if (d.process && d.process.trim()) {
        const key = d.process.toLowerCase();
        if (!seen.has(key)) {
          seen.set(key, d.process);
        }
      }
    });
    return Array.from(seen.values()).sort();
  }, [state.deliveryDates]);

  // Lógica UND pendientes por proceso
  const undPendientesPorProceso = useMemo(() => {
    const pending = state.deliveryDates.filter(d => !d.deliveryDate && d.process?.trim());

    // Agrupar por proceso
    const byProcess = new Map<string, DeliveryDate[]>();
    pending.forEach(d => {
      const proc = d.process.trim();
      if (!byProcess.has(proc)) byProcess.set(proc, []);
      byProcess.get(proc)!.push(d);
    });

    return Array.from(byProcess.entries()).map(([proceso, rows]) => {
      // CANT REF: referencias únicas
      const uniqueRefs = new Set(rows.map(r => r.referenceId));

      // CANT UND: por cada ref, deduplicar por cantidad y sumar valores únicos
      const totalUnd = Array.from(uniqueRefs).reduce((total, refId) => {
        const refRows = rows.filter(r => r.referenceId === refId);
        const uniqueQtys = new Set(refRows.map(r => r.quantity));
        const refTotal = Array.from(uniqueQtys).reduce((s, q) => s + q, 0);
        return total + refTotal;
      }, 0);

      return { proceso, cantEntradas: rows.length, cantRef: uniqueRefs.size, cantUnd: totalUnd, undTotales: rows.reduce((s, d) => s + (d.quantity || 0), 0) };
    }).sort((a, b) => a.proceso.localeCompare(b.proceso));
  }, [state.deliveryDates]);

  // Datos paginados
  const paginatedData = useMemo(() => {
    const startIndex = (deliveryDatesPagination.pagination.page - 1) * deliveryDatesPagination.pagination.limit;
    const endIndex = startIndex + deliveryDatesPagination.pagination.limit;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, deliveryDatesPagination.pagination.page, deliveryDatesPagination.pagination.limit]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Control de fechas de entrega y producción</h2>
          <p className="text-slate-500 font-bold text-xs mt-1">Gestión de lotes y cronogramas</p>
        </div>

        <div className="flex items-center gap-3">
        <button
          onClick={() => setIsUndPendientesOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs uppercase tracking-wider hover:shadow-lg hover:scale-105 transition-all"
        >
          Ver UND pendientes
        </button>

        <div className="flex flex-wrap gap-3 bg-white p-3 rounded-3xl border border-slate-100 shadow-sm items-center">
          <button
            onClick={() => {
              setConfFilterId('');
              setRefFilterId('');
              setProcessFilter('');
              setYearFilter('');
              setSendDateMonthFilter('');
              setExpectedDateMonthFilter('');
              setDeliveryDateMonthFilter('');
              setFilterHighPriority(false);
              setHideDelivered(false);
            }}
            title="Limpiar todos los filtros"
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs uppercase tracking-wider hover:shadow-lg hover:scale-105 transition-all h-fit flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpiar
          </button>

          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-600 uppercase ml-2 mb-1">Año (Envío)</span>
            <input
              type="number"
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
              placeholder="2026"
              min="2000"
              max="2099"
              className="px-3 py-1.5 bg-slate-50 rounded-xl text-xs font-bold w-24 border-none focus:ring-2 focus:ring-blue-100"
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

          {true && (
            <div className="flex items-center gap-2 border-l border-slate-100 pl-3">
              {(user?.role === UserRole.SOPORTE || user?.role === 'soporte') && (
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black rounded-xl text-xs uppercase tracking-wider hover:shadow-lg hover:scale-105 transition-all"
                >
                  Importar Excel
                </button>
              )}
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
      </div>

      {/* CARDS MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <button
          onClick={() => setFilterHighPriority(!filterHighPriority)}
          className={`bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-3xl border-2 transition-all cursor-pointer ${filterHighPriority ? 'border-red-500 shadow-lg scale-105' : 'border-red-200 hover:border-red-400'}`}
        >
          <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">Lotes de atención prioritaria</p>
          <p className="text-5xl font-black text-red-700 text-center">{metrics.highPriority}</p>
          <p className="text-[10px] font-bold text-red-500 uppercase mt-1 text-center">Lotes con 10 días de retraso</p>
        </button>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-3xl border border-yellow-200">
          <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-2">Lotes en proceso</p>
          <p className="text-5xl font-black text-yellow-700 text-center">{metrics.pending}</p>
          <p className="text-[10px] font-bold text-yellow-500 uppercase mt-1 text-center">Pendientes por entregar</p>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-3xl border border-pink-200">
          <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest mb-2">Retraso promedio</p>
          <p className="text-5xl font-black text-pink-700 text-center">{metrics.avgDelay}</p>
          <p className="text-[10px] font-bold text-pink-500 uppercase mt-1 text-center">Días respecto a fecha pactada</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-3xl border border-green-200">
          <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">Eficiencia entrega</p>
          <p className="text-5xl font-black text-green-700 text-center">{metrics.efficiency}%</p>
          <p className="text-[10px] font-bold text-green-500 uppercase mt-1 text-center">Cumplimiento de cronograma</p>
        </div>
      </div>

      {/* BOTÓN AGREGAR */}
      {true && (
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
          <table className="w-full text-left text-sm min-w-[1800px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2 font-black uppercase text-slate-700 w-48">Confeccionista</th>
                <th className="px-3 py-2 font-black uppercase text-slate-700 text-center w-24">Ref.</th>
                <th className="px-3 py-2 font-black uppercase text-slate-700 text-center w-20">Cant.</th>
                <th className="px-3 py-2 font-black uppercase text-orange-700 text-center w-32 bg-yellow-50">Fecha envío lote</th>
                <th className="px-3 py-2 font-black uppercase text-orange-700 text-center w-36 bg-yellow-50">Fecha presup. entrega</th>
                <th className="px-3 py-2 font-black uppercase text-slate-700 text-center w-20">REM</th>
                <th className="px-3 py-2 font-black uppercase text-blue-700 text-center w-32 bg-blue-50">Fecha entrega</th>
                <th className="px-3 py-2 font-black uppercase text-slate-700 text-center w-24">Dif fechas</th>
                <th className="px-3 py-2 font-black uppercase text-slate-700 text-center w-24">Rot. inicial</th>
                <th className="px-3 py-2 font-black uppercase text-slate-700 text-center w-24">Rot. final</th>
                <th className="px-3 py-2 font-black uppercase text-slate-700 text-center w-28">Rot final vs ini</th>
                <th className="px-4 py-2 font-black uppercase text-slate-700 w-32">Proceso</th>
                <th className="px-4 py-2 font-black uppercase text-slate-700 w-40">Observación</th>
                <th className="px-3 py-2 text-center w-16"></th>
              </tr>
              <tr className="bg-slate-100">
                <th className="px-4 py-1">
                  <TextAutocomplete
                    value={confFilterId}
                    suggestions={confeccionistasSuggestions}
                    onChange={setConfFilterId}
                    placeholder="Filtrar..."
                    disabled={false}
                  />
                </th>
                <th className="px-3 py-1">
                  <TextAutocomplete
                    value={refFilterId}
                    suggestions={referenciasSuggestions}
                    onChange={setRefFilterId}
                    placeholder="Filtrar..."
                    disabled={false}
                  />
                </th>
                <th className="px-3 py-1"></th>
                <th className="px-3 py-1 bg-yellow-100">
                  <select
                    value={sendDateMonthFilter}
                    onChange={e => setSendDateMonthFilter(e.target.value)}
                    className="w-full px-1 py-0.5 text-xs border border-orange-300 rounded bg-white"
                  >
                    <option value="">Mes</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {new Date(2000, i).toLocaleString('es', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="px-3 py-1 bg-yellow-100">
                  <select
                    value={expectedDateMonthFilter}
                    onChange={e => setExpectedDateMonthFilter(e.target.value)}
                    className="w-full px-1 py-0.5 text-xs border border-orange-300 rounded bg-white"
                  >
                    <option value="">Mes</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {new Date(2000, i).toLocaleString('es', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="px-3 py-1"></th>
                <th className="px-3 py-1 bg-blue-100">
                  <select
                    value={deliveryDateMonthFilter}
                    onChange={e => setDeliveryDateMonthFilter(e.target.value)}
                    className="w-full px-1 py-0.5 text-xs border border-blue-300 rounded bg-white"
                  >
                    <option value="">Mes</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {new Date(2000, i).toLocaleString('es', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="px-3 py-1"></th>
                <th className="px-3 py-1"></th>
                <th className="px-3 py-1"></th>
                <th className="px-3 py-1"></th>
                <th className="px-4 py-1">
                  <TextAutocomplete
                    value={processFilter}
                    suggestions={procesosSuggestions}
                    onChange={setProcessFilter}
                    placeholder="Filtrar..."
                    disabled={false}
                  />
                </th>
                <th className="px-4 py-1"></th>
                <th className="px-3 py-1"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedData.map((row, displayIndex) => {
                const recordIndex = state.deliveryDates.findIndex(d => d.id === row.id);
                const hasErrors = validationErrors[recordIndex];
                const difFechas = calcDaysDiff(row.expectedDate, row.deliveryDate);
                const rotInicial = calcDaysDiff(row.sendDate, row.expectedDate);
                const rotFinal = calcDaysDiff(row.sendDate, row.deliveryDate);
                const rotDiff = rotInicial !== null && rotFinal !== null ? rotInicial - rotFinal : null;

                return (
                  <tr key={row.id} className={`hover:bg-slate-50 transition-colors ${hasErrors ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-1">
                      <div>
                        <TextAutocomplete
                          value={row.confeccionistaId}
                          suggestions={confeccionistasSuggestions}
                          onChange={val => updateRow(row.id, 'confeccionistaId', val)}
                          placeholder="Confeccionista..."
                          disabled={false}
                        />
                        {hasErrors?.confeccionistaId && (
                          <p className="text-[8px] text-red-600 font-bold mt-0.5">{hasErrors.confeccionistaId}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-1 text-center">
                      <div>
                        <TextAutocomplete
                          value={row.referenceId}
                          suggestions={referenciasSuggestions}
                          onChange={val => updateRow(row.id, 'referenceId', val)}
                          placeholder="Referencia..."
                          disabled={false}
                          className="text-center text-blue-700"
                        />
                        {hasErrors?.referenceId && (
                          <p className="text-[8px] text-red-600 font-bold mt-0.5">{hasErrors.referenceId}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-1 text-center">
                      <div>
                        <input
                          type="number"
                          value={row.quantity}
                          onChange={e => updateRow(row.id, 'quantity', Number(e.target.value))}
                          onFocus={e => e.target.select()}
                          readOnly={false}
                          className={`w-full px-2 py-1 bg-slate-50 border rounded-lg font-black text-center focus:ring-2 focus:ring-blue-100 ${hasErrors?.quantity ? 'border-red-500' : 'border-slate-200'}`}
                        />
                        {hasErrors?.quantity && (
                          <p className="text-[8px] text-red-600 font-bold mt-0.5">{hasErrors.quantity}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-1 text-center bg-yellow-50">
                      <div>
                        <input
                          type="date"
                          value={row.sendDate}
                          onChange={e => updateRow(row.id, 'sendDate', e.target.value)}
                          readOnly={false}
                          className={`w-full px-2 py-1 bg-white border rounded-lg font-bold text-center text-orange-700 focus:ring-2 focus:ring-orange-100 ${hasErrors?.sendDate ? 'border-red-500' : 'border-orange-200'}`}
                        />
                        {hasErrors?.sendDate && (
                          <p className="text-[8px] text-red-600 font-bold mt-0.5">{hasErrors.sendDate}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-1 text-center bg-yellow-50">
                      <div>
                        <input
                          type="date"
                          value={row.expectedDate}
                          onChange={e => updateRow(row.id, 'expectedDate', e.target.value)}
                          readOnly={false}
                          className={`w-full px-2 py-1 bg-white border rounded-lg font-bold text-center text-orange-700 focus:ring-2 focus:ring-orange-100 ${hasErrors?.expectedDate ? 'border-red-500' : 'border-orange-200'}`}
                        />
                        {hasErrors?.expectedDate && (
                          <p className="text-[8px] text-red-600 font-bold mt-0.5">{hasErrors.expectedDate}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-1 text-center">
                      <input
                        type="number"
                        value={row.rem ?? ''}
                        onChange={e => updateRow(row.id, 'rem', e.target.value === '' ? null : Number(e.target.value))}
                        placeholder="-"
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-center focus:ring-2 focus:ring-blue-100"
                      />
                    </td>
                    <td className="px-3 py-1 text-center bg-blue-50">
                      <input
                        type={row.deliveryDate ? 'date' : 'text'}
                        value={row.deliveryDate || ''}
                        onChange={e => updateRow(row.id, 'deliveryDate', e.target.value || null)}
                        onFocus={e => (e.target.type = 'date')}
                        onBlur={e => { if (!e.target.value) e.target.type = 'text'; }}
                        placeholder=""
                        className="w-full px-2 py-1 bg-white border border-blue-200 rounded-lg font-bold text-center text-blue-700 focus:ring-2 focus:ring-blue-100"
                      />
                    </td>
                    <td className="px-3 py-1 text-center">
                      <span className={`font-black ${difFechas && difFechas > 0 ? 'text-red-600' : difFechas && difFechas < 0 ? 'text-green-600' : 'text-slate-400'}`}>
                        {difFechas !== null ? difFechas : '-'}
                      </span>
                    </td>
                    <td className="px-3 py-1 text-center">
                      <span className="font-bold text-slate-700">{rotInicial !== null ? rotInicial : '-'}</span>
                    </td>
                    <td className="px-3 py-1 text-center">
                      <span className="font-bold text-slate-700">{rotFinal !== null ? rotFinal : '-'}</span>
                    </td>
                    <td className="px-3 py-1 text-center">
                      <span className={`font-black ${rotDiff && rotDiff > 0 ? 'text-red-600' : rotDiff && rotDiff < 0 ? 'text-green-600' : 'text-slate-400'}`}>
                        {rotDiff !== null ? rotDiff : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-1">
                      <TextAutocomplete
                        value={row.process}
                        suggestions={procesosSuggestions}
                        onChange={val => updateRow(row.id, 'process', val)}
                        placeholder="Estado..."
                        disabled={false}
                      />
                    </td>
                    <td className="px-4 py-1">
                      <input
                        type="text"
                        value={row.observation}
                        onChange={e => updateRow(row.id, 'observation', e.target.value)}
                        readOnly={false}
                        placeholder="Nota..."
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      {(isAdmin || isGeneral) && (
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

      {/* PAGINACIÓN */}
      <div className="mt-6">
        <PaginationComponent
          currentPage={deliveryDatesPagination.pagination.page}
          totalPages={deliveryDatesPagination.pagination.totalPages}
          pageSize={deliveryDatesPagination.pagination.limit}
          onPageChange={deliveryDatesPagination.goToPage}
          onPageSizeChange={deliveryDatesPagination.setLimit}
        />
      </div>

      {/* Import Modal */}
      <DeliveryDatesImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportData}
        confeccionistas={state.confeccionistas}
      />
      {/* Modal UND Pendientes */}
      {isUndPendientesOpen && (
        <UndPendientesModal
          data={undPendientesPorProceso}
          onClose={() => setIsUndPendientesOpen(false)}
        />
      )}
    </div>
  );
};

const UndPendientesModal: React.FC<{
  data: { proceso: string; cantEntradas: number; cantRef: number; cantUnd: number; undTotales: number }[];
  onClose: () => void;
}> = ({ data, onClose }) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const totals = {
    cantEntradas: data.reduce((s, r) => s + r.cantEntradas, 0),
    cantRef: data.reduce((s, r) => s + r.cantRef, 0),
    cantUnd: data.reduce((s, r) => s + r.cantUnd, 0),
    undTotales: data.reduce((s, r) => s + r.undTotales, 0),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-black text-white text-xl tracking-tight">UND pendientes por proceso</h3>
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mt-0.5">Lotes sin fecha de entrega</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/25 text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Totales resumen */}
        {data.length > 0 && (
          <div className="grid grid-cols-4 divide-x divide-slate-100 bg-slate-50 border-b border-slate-200 shrink-0">
            {[
              { label: 'Lotes', value: totals.cantEntradas, color: 'text-slate-700' },
              { label: 'Cant. Ref', value: totals.cantRef, color: 'text-blue-600' },
              { label: 'Cant. Und', value: totals.cantUnd, color: 'text-indigo-600' },
              { label: 'Und. Totales', value: totals.undTotales, color: 'text-emerald-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex flex-col items-center py-3 px-2">
                <span className={`text-2xl font-black ${color}`}>{value.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tabla */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="px-5 py-3 text-left font-black uppercase text-slate-500 text-[11px] tracking-wider">Proceso</th>
                <th className="px-4 py-3 text-center font-black uppercase text-slate-500 text-[11px] tracking-wider">Lotes</th>
                <th className="px-4 py-3 text-center font-black uppercase text-slate-500 text-[11px] tracking-wider">Cant. Ref</th>
                <th className="px-4 py-3 text-center font-black uppercase text-slate-500 text-[11px] tracking-wider">Cant. Und</th>
                <th className="px-4 py-3 text-center font-black uppercase text-slate-500 text-[11px] tracking-wider">Und. Totales</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-bold">
                    No hay lotes pendientes
                  </td>
                </tr>
              ) : (
                data.map((row, i) => (
                  <tr
                    key={row.proceso}
                    className={`border-b border-slate-100 hover:bg-indigo-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                  >
                    <td className="px-5 py-3.5 font-black text-slate-800">{row.proceso}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-block bg-slate-100 text-slate-600 font-bold rounded-lg px-2.5 py-0.5 text-sm">{row.cantEntradas}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-block bg-blue-50 text-blue-700 font-bold rounded-lg px-2.5 py-0.5 text-sm">{row.cantRef}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-block bg-indigo-50 text-indigo-700 font-bold rounded-lg px-2.5 py-0.5 text-sm">{row.cantUnd}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-block bg-emerald-50 text-emerald-700 font-bold rounded-lg px-2.5 py-0.5 text-sm">{row.undTotales.toLocaleString()}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDatesView;
