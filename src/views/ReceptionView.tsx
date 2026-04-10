
import React, { useState } from 'react';
import { User, UserRole, BatchReception, ItemEntry, AppState, ChargeType, Reference, Confeccionista } from '../types';
import ScannerSimulator from '../components/ScannerSimulator';
import { Icons } from '../constants';
import ReturnReceptionView from './ReturnReceptionView';
import PaginationComponent from '../components/PaginationComponent';
import usePagination from '../hooks/usePagination';

interface ReceptionViewProps {
  user: User;
  receptions: BatchReception[];
  updateState: (updater: (prev: AppState) => AppState) => void;
  referencesMaster: Reference[];
  confeccionistasMaster?: Confeccionista[];
  clientsMaster?: any[];  
  onAddReception?: (reception: any) => Promise<any>;
  onDeleteReception?: (id: string) => Promise<any>;
  ReturnReceptionComponent?: React.ComponentType<any>;
  state?: AppState;
  directToBatch?: boolean;
  onNavigate?: (tab: string, params?: any) => void;
}

const ReceptionView: React.FC<ReceptionViewProps> = ({ 
  user, 
  receptions, 
  updateState, 
  referencesMaster, 
  confeccionistasMaster = [], 
  clientsMaster = [],
  onAddReception,
  onDeleteReception,
  ReturnReceptionComponent,
  state,
  directToBatch = false,
  onNavigate
}) => {
  const [isCounting, setIsCounting] = useState(false);
  const [receptionType, setReceptionType] = useState<'selector' | 'batch' | 'return' | 'listing'>('listing');
  const [editingLot, setEditingLot] = useState<BatchReception | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refSearch, setRefSearch] = useState('');
  const [filterSinProcesar, setFilterSinProcesar] = useState(false);
  const [affectsInventory, setAffectsInventory] = useState(true);
  const receptionsPagination = usePagination(1, 20);

  // Form states
  const [confeccionista, setConfeccionista] = useState('');
  const [confSearch, setConfSearch] = useState('');
  const [showConfResults, setShowConfResults] = useState(false);
  const [batchCode, setBatchCode] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [hasSeconds, setHasSeconds] = useState<boolean | null>(null);
  const [segundasUnits, setSegundasUnits] = useState(0);
  const [chargeType, setChargeType] = useState<ChargeType>(null);
  const [chargeUnits, setChargeUnits] = useState(0);
  const [incompleteUnits, setIncompleteUnits] = useState(0);
  const [hasIncomplete, setHasIncomplete] = useState<boolean | null>(null);
  const [isPacked, setIsPacked] = useState<boolean | null>(null);
  const [hasMuestra, setHasMuestra] = useState<boolean | null>(null);
  const [bagQuantity, setBagQuantity] = useState(0);
  const [items, setItems] = useState<ItemEntry[]>([]);
  const [observacion, setObservacion] = useState('');

  const handleStart = () => {
    setReceptionType('batch');
    setIsCounting(true);
    setEditingLot(null);
    setConfeccionista('');
    setConfSearch('');
    setBatchCode('');
    setArrivalDate('');
    setHasSeconds(null);
    setSegundasUnits(0);
    setChargeType(null);
    setChargeUnits(0);
    setIncompleteUnits(0);
    setHasIncomplete(null);
    setIsPacked(null);
    setHasMuestra(null);
    setBagQuantity(0);
    setItems([]);
    setAffectsInventory(true);
    setObservacion('');
  };

  const handleEdit = (lot: BatchReception) => {
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SOPORTE) {
      alert("Acceso administrativo requerido para editar.");
      return;
    }
    setEditingLot(lot);
    setIsCounting(true);
    setConfeccionista(lot.confeccionista);
    // Buscar el nombre del confeccionista por su ID
    const confName = confeccionistasMaster.find(c => c.id === lot.confeccionista)?.name || lot.confeccionista;
    setConfSearch(`${lot.confeccionista} - ${confName}`);
    setBatchCode(lot.batchCode);
    setArrivalDate(lot.arrivalDate);
    setHasSeconds(lot.hasSeconds);
    setSegundasUnits(lot.segundasUnits || 0);
    setChargeType(lot.chargeType);
    setChargeUnits(lot.chargeUnits);
    setIncompleteUnits(lot.incompleteUnits || 0);
    setHasIncomplete((lot.incompleteUnits || 0) > 0);
    setIsPacked(lot.isPacked ?? null);
    setHasMuestra(lot.hasMuestra ?? false);
    setBagQuantity(lot.bagQuantity || 0);
    setItems(lot.items);
    setAffectsInventory(lot.affectsInventory !== false);
    setObservacion(lot.observacion || '');
  };

  const handleDelete = async (lot: BatchReception) => {
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SOPORTE) {
      alert("Acceso administrativo requerido para eliminar.");
      return;
    }
    if (!window.confirm(`¿Eliminar la recepción "${lot.batchCode}" de ${lot.confeccionista}? Esta acción no se puede deshacer.`)) return;
    if (onDeleteReception) {
      await onDeleteReception(lot.id);
    }
  };

  const filteredConf = confeccionistasMaster.filter(c => {
    // Check if confeccionista is active (handle both boolean and integer from DB)
    const isActive = c.active === true || c.active === 1;
    const matchesSearch = !confSearch ||
      c.name.toLowerCase().includes(confSearch.toLowerCase()) || 
      c.id.toLowerCase().includes(confSearch.toLowerCase());
    return isActive && matchesSearch;
  });

  const selectConf = (c: Confeccionista) => {
    setConfeccionista(c.id);
    setConfSearch(`${c.id} - ${c.name}`);
    setShowConfResults(false);
  };

  const getConfeccionistaName = (confId: string) => {
    return confeccionistasMaster.find(c => c.id === confId)?.name || confId;
  };

  const formatAuditDate = (dateString: string) => {
    // Convierte "2026-03-17T08:48:47.045-05:00" a "2026-03-17 T08:48"
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} T${hours}:${minutes}`;
  };

  const formatArrivalDate = (dateString: string) => {
    // Convierte "2026-03-16T05:00:00.000Z" o "2026-03-16" a "2026-03-16"
    if (!dateString) return '';
    // Si ya es formato YYYY-MM-DD, retornarlo tal cual
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    // Si es ISO format, extraer solo la fecha
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleScan = (ref: string, quantity: number) => {
    const refExists = referencesMaster.some(r => r.id === ref);
    if (!refExists) {
      alert(`AVISO: La referencia "${ref}" no existe en el maestro de referencias. Recuerde crearla en el apartado de Maestros.`);
    }

    setItems(prev => {
      const idx = prev.findIndex(i => i.reference === ref);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        return next;
      }
      return [...prev, { reference: ref, quantity }];
    });
  };

  const handleSave = async () => {
    if (!confeccionista || !batchCode) {
      alert("Nombre de Confeccionista y Remisión son obligatorios");
      return;
    }
    if (!arrivalDate) {
      alert("Fecha de llegada del lote es obligatoria");
      return;
    }
    if (!items || items.length === 0) {
      alert("Debe agregar al menos un item a la recepción");
      return;
    }
    if (chargeType && chargeUnits <= 0) {
      alert(`Debe especificar unidades para ${chargeType}`);
      return;
    }
    if (isPacked === null) {
      alert("Debe especificar si el lote está empacado");
      return;
    }
    if (hasIncomplete === true && incompleteUnits <= 0) {
      alert("Debe especificar la cantidad de unidades incompletas");
      return;
    }

    const data: BatchReception = {
      id: editingLot ? editingLot.id : Math.random().toString(36).substr(2, 9),
      batchCode,
      confeccionista,
      hasSeconds,
      segundasUnits: hasSeconds ? segundasUnits : 0,
      chargeType,
      chargeUnits,
      incompleteUnits: hasIncomplete ? incompleteUnits : 0,
      isPacked: isPacked ?? false,
      hasMuestra: hasMuestra ?? false,
      bagQuantity: bagQuantity || 0,
      items,
      receivedBy: editingLot ? editingLot.receivedBy : user.name,
      createdAt: editingLot ? editingLot.createdAt : new Date().toISOString(),
      arrivalDate,
      editLogs: editingLot ? [...(editingLot.editLogs || []), { user: user.name, date: new Date().toISOString() }] : [],
      affectsInventory,
      observacion: observacion.trim() || null
    };

    // ========== GUARDAR EN BACKEND ==========
    if (onAddReception) {
      try {
        const result = await onAddReception(data);
        
        if (result.success) {
          console.log('✅ Recepción guardada en BD');
          setIsCounting(false);
        } else {
          alert('Error al guardar: ' + (result.message || 'Error desconocido'));
        }
      } catch (error) {
        console.error('❌ Error guardando recepción:', error);
        alert('Error de conexión con el servidor');
      }
    } else {
      // Fallback si no hay función del backend
      console.warn('⚠️ onAddReception no está definido, guardando solo en estado local');
      
      updateState(prev => ({
        ...prev,
        receptions: editingLot 
          ? prev.receptions.map(r => r.id === data.id ? data : r)
          : [data, ...prev.receptions]
      }));
      
      setIsCounting(false);
    }
  };

  const filteredReceptions = receptions.filter(r => {
    if (filterSinProcesar && !['0', '00', '000', '0000'].includes(r.batchCode?.trim())) return false;
    if (!refSearch.trim()) return true;
    return r.items.some(item => 
      item.reference.toUpperCase().includes(refSearch.toUpperCase())
    );
  });

  const totalPagesReceptions = Math.ceil(filteredReceptions.length / receptionsPagination.pagination.limit) || 1;

  // Reset a página 1 cuando cambian los filtros
  React.useEffect(() => {
    receptionsPagination.goToPage(1);
  }, [filteredReceptions.length, receptionsPagination.pagination.limit]);

  if (receptionType === 'selector') {
    return (
      <div className="space-y-8 pb-20">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Recepción</h2>
          <p className="text-slate-400 font-medium">Selecciona el tipo de recepción</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button
            onClick={() => {
              setReceptionType('batch');
              setIsCounting(true);
            }}
            className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all flex flex-col items-center justify-center gap-6 min-h-[300px]"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <Icons.Reception />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-800">Recepción de Lotes</h3>
              <p className="text-slate-400 font-medium">Ingreso de producción de confeccionistas</p>
            </div>
          </button>

          <button
            onClick={() => {
              setReceptionType('return');
              setIsCounting(true);
            }}
            className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md hover:border-pink-200 transition-all flex flex-col items-center justify-center gap-6 min-h-[300px]"
          >
            <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center text-pink-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-800">Devolución de Mercancía</h3>
              <p className="text-slate-400 font-medium">Registro de devoluciones y ajustes</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (receptionType === 'return') {
    console.log('📍 Rendering ReturnReceptionView');
    console.log('📊 clientsMaster received in ReceptionView:', clientsMaster);
    console.log('📊 clientsMaster.length:', clientsMaster?.length || 0);
    console.log('📊 referencesMaster.length:', referencesMaster?.length || 0);
    console.log('📊 First client:', clientsMaster?.[0]);
    return <ReturnReceptionView 
      user={user} 
      updateState={updateState} 
      clientsMaster={clientsMaster}
      referencesMaster={referencesMaster}
      onAddReturnReception={onAddReception}
    />;
  }

  if (isCounting) {
    const totalCount = items.reduce((a, b) => a + b.quantity, 0);

    return (
      <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500 pb-20">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{editingLot ? 'Editar Lote' : 'Conteo de Lote'}</h2>
            <p className="text-slate-400 font-bold text-xs sm:text-base">Registro de ingreso de producción</p>
          </div>
          <button onClick={() => { setReceptionType('listing'); setIsCounting(false); setEditingLot(null); }} className="px-4 py-2 sm:px-6 sm:py-3 rounded-2xl bg-white text-slate-400 font-bold hover:text-red-500 transition-all border border-slate-100 text-sm">
            Atrás
          </button>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-sm border border-slate-100 space-y-8">
          {/* Row 1: Confeccionista & Remisión & Fecha de llegada */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 relative z-[100]">
              <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest px-4">Confeccionista</label>
              <div className="relative">
                <input 
                  value={confSearch} 
                  onChange={e => { setConfSearch(e.target.value); setShowConfResults(true); if(!e.target.value) setConfeccionista(''); }} 
                  onFocus={() => setShowConfResults(true)}
                  placeholder="Buscar confeccionista..." 
                  className="w-full px-6 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-semibold text-slate-900" 
                />
                {showConfResults && confSearch.length > 0 && (
                  <div className="fixed bg-white rounded-2xl shadow-2xl border border-slate-200 z-[9999] min-h-[280px] max-h-[350px] overflow-y-auto custom-scrollbar" style={{
                    top: `${(document.activeElement as HTMLElement)?.getBoundingClientRect().bottom + 8}px`,
                    left: `${(document.activeElement as HTMLElement)?.getBoundingClientRect().left}px`,
                    width: `${(document.activeElement as HTMLElement)?.getBoundingClientRect().width}px`
                  }}>
                    {filteredConf.map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => selectConf(c)}
                        className="w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                      >
                        <p className="font-black text-slate-800 text-base">{c.name}</p>
                        <p className="text-xs text-slate-400 font-bold">Cédula: {c.id} • Score: {c.score}</p>
                      </button>
                    ))}
                    {filteredConf.length === 0 && <p className="px-6 py-4 text-slate-400 font-bold italic text-sm">No se encontraron activos</p>}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest px-4">Remisión</label>
              <input value={batchCode} onChange={e => setBatchCode(e.target.value)} placeholder="Remisión de entrega..." className="w-full px-6 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-semibold text-slate-900" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest px-4">Fecha de llegada lote *</label>
              <input type="date" value={arrivalDate} onChange={e => setArrivalDate(e.target.value)} className="w-full px-6 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-semibold text-slate-900" />
            </div>
          </div>

          {/* Row 2: Status Toggles (Segundas, Empacado, Muestra, Inventario) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest px-4">¿Tiene Segundas?</label>
              <div className="flex gap-2 p-1.5 bg-slate-50 border-none rounded-2xl">
                <button 
                  onClick={() => setHasSeconds(true)} 
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${hasSeconds === true ? 'bg-pink-500 text-white shadow-md' : 'bg-white text-slate-400'}`}
                >SÍ</button>
                <button 
                  onClick={() => setHasSeconds(false)} 
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${hasSeconds === false ? 'bg-slate-300 text-white shadow-md' : 'bg-white text-slate-400'}`}
                >NO</button>
              </div>
              {hasSeconds === true && (
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl animate-in fade-in zoom-in duration-300 border border-slate-100">
                  <div className="flex-1 flex items-center bg-white rounded-lg p-1">
                    <button onClick={() => setSegundasUnits(u => Math.max(0, u - 1))} className="w-6 h-6 flex items-center justify-center bg-slate-50 rounded-md text-slate-500 font-bold text-xs">-</button>
                    <input type="number" value={segundasUnits} onChange={e => setSegundasUnits(Number(e.target.value))} onFocus={(e) => e.target.select()} className="flex-1 text-center font-black bg-transparent border-none focus:ring-0 text-slate-900 text-xs" />
                    <button onClick={() => setSegundasUnits(u => u + 1)} className="w-6 h-6 flex items-center justify-center bg-slate-50 rounded-md text-slate-500 font-bold text-xs">+</button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest px-4">¿Lote Empacado? *</label>
              <div className="flex gap-2 p-1.5 bg-slate-50 border-none rounded-2xl">
                <button 
                  onClick={() => setIsPacked(true)} 
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${isPacked === true ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400'}`}
                >SÍ</button>
                <button 
                  onClick={() => setIsPacked(false)} 
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${isPacked === false ? 'bg-slate-300 text-white shadow-md' : 'bg-white text-slate-400'}`}
                >NO</button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest px-4">¿Tiene Muestra?</label>
              <div className="flex gap-2 p-1.5 bg-slate-50 border-none rounded-2xl">
                <button 
                  onClick={() => setHasMuestra(true)} 
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${hasMuestra === true ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-slate-400'}`}
                >SÍ</button>
                <button 
                  onClick={() => setHasMuestra(false)} 
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${hasMuestra === false ? 'bg-slate-300 text-white shadow-md' : 'bg-white text-slate-400'}`}
                >NO</button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest px-4">Inventario</label>
              <button 
                onClick={() => setAffectsInventory(!affectsInventory)} 
                className={`w-full flex items-center justify-between px-6 py-3.5 rounded-2xl transition-all font-bold text-xs ${affectsInventory ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-orange-50 text-orange-700 border border-orange-100'}`}
              >
                <span>{affectsInventory ? 'CARGA STOCK' : 'SIN CARGO'}</span>
                <div className={`w-4 h-4 rounded-full ${affectsInventory ? 'bg-teal-500' : 'bg-orange-500'} flex items-center justify-center`}>
                  {affectsInventory && <span className="text-white text-[8px]">✓</span>}
                </div>
              </button>
            </div>
          </div>

          {/* Row 3: Special Units Consolidated */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
            {/* Cobros */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest px-4">Cobros</label>
              <div className="flex gap-1.5 p-1 bg-slate-50 border-none rounded-2xl">
                <button 
                  onClick={() => setChargeType(chargeType === 'Compra' ? null : 'Compra')} 
                  className={`flex-1 py-1.5 rounded-xl text-[9px] font-black transition-all ${chargeType === 'Compra' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400'}`}
                >COMPRA</button>
                <button 
                  onClick={() => setChargeType(chargeType === 'Cobro' ? null : 'Cobro')} 
                  className={`flex-1 py-1.5 rounded-xl text-[9px] font-black transition-all ${chargeType === 'Cobro' ? 'bg-pink-600 text-white shadow-md' : 'bg-white text-slate-400'}`}
                >COBRO</button>
              </div>
              {chargeType && (
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl animate-in fade-in zoom-in duration-300 border border-slate-100">
                  <div className="flex-1 flex items-center bg-white rounded-lg p-1">
                    <button onClick={() => setChargeUnits(u => Math.max(0, u - 1))} className="w-6 h-6 flex items-center justify-center bg-slate-50 rounded-md text-slate-500 font-bold text-xs">-</button>
                    <input type="number" value={chargeUnits} onChange={e => setChargeUnits(Number(e.target.value))} onFocus={(e) => e.target.select()} className="flex-1 text-center font-black bg-transparent border-none focus:ring-0 text-slate-900 text-xs" />
                    <button onClick={() => setChargeUnits(u => u + 1)} className="w-6 h-6 flex items-center justify-center bg-slate-50 rounded-md text-slate-500 font-bold text-xs">+</button>
                  </div>
                </div>
              )}
            </div>

            {/* Incompletas */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-purple-500 tracking-widest px-4">Incompletas</label>
              <div className="flex gap-1.5 p-1 bg-slate-50 border-none rounded-2xl">
                <button 
                  onClick={() => setHasIncomplete(true)} 
                  className={`flex-1 py-1.5 rounded-xl text-[9px] font-black transition-all ${hasIncomplete === true ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-slate-400'}`}
                >SÍ</button>
                <button 
                  onClick={() => setHasIncomplete(false)} 
                  className={`flex-1 py-1.5 rounded-xl text-[9px] font-black transition-all ${hasIncomplete === false ? 'bg-slate-300 text-white shadow-md' : 'bg-white text-slate-400'}`}
                >NO</button>
              </div>
              {hasIncomplete && (
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl animate-in fade-in zoom-in duration-300 border border-slate-100">
                  <div className="flex-1 flex items-center bg-white rounded-lg p-1">
                    <button onClick={() => setIncompleteUnits(u => Math.max(0, u - 1))} className="w-6 h-6 flex items-center justify-center bg-slate-50 rounded-md text-slate-500 font-bold text-xs">-</button>
                    <input type="number" value={incompleteUnits} onChange={e => setIncompleteUnits(Number(e.target.value))} onFocus={(e) => e.target.select()} className="flex-1 text-center font-black bg-transparent border-none focus:ring-0 text-slate-900 text-xs" />
                    <button onClick={() => setIncompleteUnits(u => u + 1)} className="w-6 h-6 flex items-center justify-center bg-slate-50 rounded-md text-slate-500 font-bold text-xs">+</button>
                  </div>
                </div>
              )}
            </div>

            {/* Talegos */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-4">Talegos</label>
              <div className="flex items-center bg-slate-50 rounded-2xl p-1 px-3 gap-3 h-[38px]">
                <div className="text-slate-400 scale-75">
                  <Icons.Reception />
                </div>
                <input 
                  type="number" 
                  value={bagQuantity === 0 ? '' : bagQuantity} 
                  onChange={e => setBagQuantity(Number(e.target.value))} 
                  onFocus={(e) => e.target.select()}
                  placeholder="0" 
                  className="flex-1 bg-transparent border-none focus:ring-0 font-black text-slate-900 text-sm"
                />
              </div>
            </div>

            {/* Observación */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-orange-500 tracking-widest px-4">Observación</label>
              <textarea
                value={observacion}
                onChange={e => setObservacion(e.target.value)}
                placeholder="Novedad o comentario..."
                rows={2}
                className="w-full px-4 py-2 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-orange-100 transition-all font-semibold text-slate-900 text-sm resize-none"
              />
            </div>
          </div>
        </div>

        <ScannerSimulator onScan={handleScan} label="Agregar referencia" />

        {items.length > 0 && (
          <div className="bg-white rounded-[32px] sm:rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <h3 className="font-black text-slate-700">Resumen de Recepción</h3>
              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full font-bold text-[10px] uppercase tracking-wider">
                  Completas: <span className="font-black ml-1 text-sm">{totalCount}</span>
                </div>
                <div className="px-4 py-1.5 bg-pink-50 text-pink-700 rounded-full font-bold text-[10px] uppercase tracking-wider">
                  Segundas: <span className="font-black ml-1 text-sm">{hasSeconds ? segundasUnits : 0}</span>
                </div>
                <div className="px-4 py-1.5 bg-purple-50 text-purple-700 rounded-full font-bold text-[10px] uppercase tracking-wider">
                  Incompletas: <span className="font-black ml-1 text-sm">{hasIncomplete ? incompleteUnits : 0}</span>
                </div>
                <div className="px-4 py-1.5 bg-pink-50 text-pink-700 rounded-full font-bold text-[10px] uppercase tracking-wider">
                  {chargeType || 'Cobros'}: <span className="font-black ml-1 text-sm">{chargeUnits}</span>
                </div>
                <div className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-black text-sm shadow-lg shadow-blue-100">
                  TOTAL: {totalCount + (hasIncomplete ? incompleteUnits : 0) + chargeUnits + (hasSeconds ? segundasUnits : 0)}
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                const refData = referencesMaster.find(r => r.id === item.reference);
                return (
                  <div key={item.reference} className="px-6 sm:px-8 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <span className="text-xl sm:text-2xl font-black text-blue-600 tracking-tighter">{item.reference}</span>
                        {refData?.description && (
                          <span className="text-sm font-medium text-slate-400 ml-4">
                            &nbsp;&nbsp;&nbsp;&nbsp;–&nbsp;&nbsp;&nbsp;&nbsp;{refData.description}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setItems(prev => prev.map(p => p.reference === item.reference ? { ...p, quantity: val } : p));
                          }}
                          onFocus={e => e.target.select()}
                          className="w-16 text-center text-lg sm:text-xl font-black text-slate-800 bg-transparent border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
                        />
                        <button 
                          onClick={() => setItems(prev => prev.filter(p => p.reference !== item.reference))}
                          className="w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-[10px] hover:bg-red-200 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button onClick={handleSave} className="w-full py-5 sm:py-6 bg-gradient-to-r from-blue-600 to-pink-600 text-white font-black text-xl sm:text-2xl rounded-[28px] sm:rounded-[32px] shadow-2xl shadow-blue-200 hover:scale-[1.01] transition-all">
          GUARDAR RECEPCIÓN
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-1">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter">Recepción</h2>
            <p className="text-slate-400 font-medium text-sm sm:text-base">Control de lotes e ingresos</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input 
                  type="text" 
                  value={refSearch}
                  onChange={(e) => setRefSearch(e.target.value)}
                  placeholder="Número de referencia..."
                  className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[24px] focus:ring-4 focus:ring-blue-100 transition-all font-semibold text-slate-900 shadow-sm text-sm"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
              </div>
            </div>
            <button
              onClick={() => setFilterSinProcesar(v => !v)}
              className={`px-5 py-3 rounded-[20px] font-black text-xs uppercase tracking-wider transition-all border ${filterSinProcesar ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-100 scale-105' : 'bg-white text-red-400 border-red-200 hover:border-red-400 hover:scale-105'}`}
            >
              Mostrar lotes sin procesar
            </button>
          </div>
        </div>
        <button onClick={handleStart} className="w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-blue-500 to-pink-500 text-white font-black rounded-[24px] sm:rounded-[28px] shadow-2xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
          <Icons.Reception />
          INICIAR CONTEO
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredReceptions.length === 0 ? (
          <div className="bg-white p-12 sm:p-24 rounded-[32px] sm:rounded-[48px] border-2 border-dashed border-slate-200 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
              <Icons.Reception />
            </div>
            <p className="text-slate-400 font-bold text-base sm:text-lg italic">
              {refSearch ? `No se encontraron lotes con la referencia "${refSearch}"` : 'Sin historial de recepciones hoy'}
            </p>
          </div>
        ) : (
          <>
            {filteredReceptions.slice((receptionsPagination.pagination.page - 1) * receptionsPagination.pagination.limit, receptionsPagination.pagination.page * receptionsPagination.pagination.limit).map(r => {
              const isExpanded = expandedId === r.id;
              const totalQty = r.items.reduce((a, b) => a + b.quantity, 0);
              const itemsByRef = r.items.reduce((acc, curr) => {
                if(!acc[curr.reference]) acc[curr.reference] = 0;
                acc[curr.reference] += curr.quantity;
                return acc;
              }, {} as Record<string, number>);

              return (
                <div key={r.id} className="bg-white rounded-[24px] sm:rounded-[32px] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-all">
                  <div 
                    className="p-3 sm:p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                  >
                    {/* Izquierda: Confeccionista */}
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ${['0', '00', '000', '0000'].includes(r.batchCode?.trim()) ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-500'}`}>{r.batchCode}</span>
                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold">Llegada: {formatArrivalDate(r.arrivalDate)}</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-800">{getConfeccionistaName(r.confeccionista)}</h3>
                    </div>

                    {/* Derecha: Referencias, Total e Indicadores */}
                    <div className="flex items-center justify-end w-full md:w-auto gap-6 flex-shrink-0">
                      {/* Referencias y Cantidades */}
                      <div className="flex flex-wrap items-center justify-end gap-4">
                        {r.observacion && (
                          <div className="w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-[9px] font-black leading-none">!</span>
                          </div>
                        )}
                        {Object.entries(itemsByRef).map(([ref, qty]: [string, any]) => (
                          <div key={ref} className="flex items-center gap-1.5">
                            <span className="text-sm sm:text-base font-black text-blue-600">{ref}</span>
                            <span className="text-sm sm:text-base font-black text-slate-700">({qty})</span>
                          </div>
                        ))}
                      </div>

                      {/* Total e Indicadores */}
                      <div className="flex flex-wrap gap-2 items-center">
                        {r.hasSeconds && <span className="text-pink-500 text-[9px] sm:text-[10px] font-black uppercase flex items-center gap-1"><span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span> Segu.</span>}
                        {r.chargeType && <span className="text-blue-500 text-[9px] sm:text-[10px] font-black uppercase flex items-center gap-1"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> {r.chargeType}</span>}
                        {r.incompleteUnits && r.incompleteUnits > 0 ? <span className="text-purple-500 text-[9px] sm:text-[10px] font-black uppercase flex items-center gap-1"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span> Inc.</span> : null}
                        <span className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase">Total: <span className="text-slate-800 font-black">{totalQty + (r.chargeUnits || 0) + (r.incompleteUnits || 0) + (r.segundasUnits || 0)}</span></span>
                        {r.isPacked 
                          ? <span className="text-teal-500 text-[9px] sm:text-[10px] font-black uppercase flex items-center gap-1"><span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span> Empacado</span>
                          : <span className="text-slate-400 text-[9px] sm:text-[10px] font-black uppercase flex items-center gap-1"><span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span> No empacado</span>
                        }
                        {r.affectsInventory === false && <span className="text-orange-500 text-[9px] sm:text-[10px] font-black uppercase flex items-center gap-1"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> No Inv.</span>}
                        {r.affectsInventory !== false && <span className="text-green-500 text-[9px] sm:text-[10px] font-black uppercase flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Inv.</span>}
                      </div>

                      {/* Botones */}
                      <div className="flex flex-row items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(r); }} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-all opacity-100 md:opacity-0 group-hover:opacity-100">
                          <Icons.Edit />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(r); }} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all opacity-100 md:opacity-0 group-hover:opacity-100">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                        <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-slate-300">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                           </svg>
                        </span>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-4 bg-slate-50/50 border-t border-slate-100 animate-in slide-in-from-top-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Detalles de Recepción</p>
                            <div className="space-y-1">
                               <p className="font-black text-slate-800 text-base sm:text-lg">Confeccionista: {getConfeccionistaName(r.confeccionista)}</p>
                               <p className="text-xs sm:text-sm font-bold text-slate-500">Remisión: {r.batchCode}</p>

                                <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase">{r.isPacked ? 'LOTE EMPACADO' : 'LOTE NO EMPACADO'}</p>
                                {r.bagQuantity && r.bagQuantity > 0 ? <p className="text-[9px] sm:text-[10px] font-black text-teal-600 uppercase">TALEGOS: {r.bagQuantity}</p> : null}
                                <p className="text-[9px] sm:text-[10px] font-black uppercase" style={{ color: r.hasMuestra ? '#10b981' : '#94a3b8' }}>{r.hasMuestra ? 'CON MUESTRA' : 'SIN MUESTRA'}</p>
                             </div>
                         </div>
                         <div className="md:text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Auditoría</p>
                            <p className="text-xs sm:text-sm font-bold text-slate-600">Asentado por: <span className="text-slate-900 font-black">{r.receivedBy}</span></p>
                            <p className="text-xs sm:text-sm font-bold text-slate-600">Fecha: <span className="text-slate-900 font-black">{formatAuditDate(r.createdAt)}</span></p>
                            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200">
                              <p className="text-xs sm:text-sm font-bold text-slate-600">Fecha de llegada lote: <span className="text-slate-900 font-black">{formatArrivalDate(r.arrivalDate)}</span></p>
                            </div>
                            {r.observacion && (
                              <div className="mt-4 pt-4 border-t border-slate-200 flex items-start gap-2 md:justify-end">
                                <div className="w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-white text-[9px] font-black leading-none">!</span>
                                </div>
                                <p className="text-xs sm:text-sm font-bold text-orange-600">{r.observacion}</p>
                              </div>
                            )}
                         </div>
                      </div>

                      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                         <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm min-w-[300px]">
                              <thead>
                                  <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-4 py-3 sm:px-6 sm:py-4 font-black text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-widest w-1/3">Tipo</th>
                                    <th className="px-4 py-3 sm:px-6 sm:py-4 font-black text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-widest">Referencia</th>
                                    <th className="px-4 py-3 sm:px-6 sm:py-4 font-black text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-widest text-center">Cantidad</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                  {Object.entries(itemsByRef).map(([ref, qty]: [string, any]) => (
                                    <tr key={ref}>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4 font-bold text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-widest">Recibido completo</td>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4 font-black text-blue-600 text-xs sm:text-sm">
                                        {ref}&nbsp;&nbsp;–&nbsp;&nbsp;<span className="font-bold text-slate-400 uppercase text-[9px] sm:text-[10px]">{referencesMaster.find(r => r.id === ref)?.description || ''}</span>
                                      </td>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4 text-center font-black text-slate-800 text-xs sm:text-sm">{qty}</td>
                                    </tr>
                                  ))}
                                  {r.segundasUnits && r.segundasUnits > 0 ? (
                                    <tr>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4 font-bold text-pink-500 text-[9px] sm:text-[10px] uppercase tracking-widest">Segundas</td>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4 font-black text-blue-600 text-xs sm:text-sm">
                                        {Object.keys(itemsByRef)[0]}&nbsp;&nbsp;–&nbsp;&nbsp;<span className="font-bold text-slate-400 uppercase text-[9px] sm:text-[10px]">{referencesMaster.find(rm => rm.id === Object.keys(itemsByRef)[0])?.description || ''}</span>
                                      </td>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4 text-center font-black text-pink-500 text-xs sm:text-sm">{r.segundasUnits}</td>
                                    </tr>
                                  ) : null}
                                  {r.chargeType && (
                                    <tr>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4 font-bold text-blue-500 text-[9px] sm:text-[10px] uppercase tracking-widest">{r.chargeType}</td>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4 font-black text-blue-600 text-xs sm:text-sm">
                                        {Object.keys(itemsByRef)[0]}&nbsp;&nbsp;–&nbsp;&nbsp;<span className="font-bold text-slate-400 uppercase text-[9px] sm:text-[10px]">{referencesMaster.find(rm => rm.id === Object.keys(itemsByRef)[0])?.description || ''}</span>
                                      </td>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4 text-center font-black text-blue-500 text-xs sm:text-sm">{r.chargeUnits}</td>
                                    </tr>
                                  )}
                                  {r.incompleteUnits && r.incompleteUnits > 0 ? (
                                    <tr>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4 font-bold text-purple-500 text-[9px] sm:text-[10px] uppercase tracking-widest">Incompletas</td>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4 font-black text-blue-600 text-xs sm:text-sm">
                                        {Object.keys(itemsByRef)[0]}&nbsp;&nbsp;–&nbsp;&nbsp;<span className="font-bold text-slate-400 uppercase text-[9px] sm:text-[10px]">{referencesMaster.find(rm => rm.id === Object.keys(itemsByRef)[0])?.description || ''}</span>
                                      </td>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4 text-center font-black text-purple-500 text-xs sm:text-sm">{r.incompleteUnits}</td>
                                    </tr>
                                  ) : null}
                              </tbody>
                              <tfoot>
                                  <tr className="bg-slate-50/80 border-t border-slate-100">
                                    <td className="px-4 py-2 sm:px-6 sm:py-3">
                                      {onNavigate && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const ref = Object.keys(itemsByRef)[0] || '';
                                            const unidades = totalQty + (r.chargeUnits || 0);
                                            onNavigate('calculoPagoLotes', {
                                              subView: 'confeccionistas',
                                              loteData: {
                                                referencia: ref,
                                                unidades,
                                                cantidadCompra: r.chargeUnits || 0,
                                                cobroSeleccionado: (r.chargeUnits || 0) > 0,
                                                empaqueSeleccionado: r.isPacked === true,
                                                batchCode: r.batchCode,
                                              }
                                            });
                                          }}
                                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-500 transition-colors"
                                          title="Liquidar lote"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
                                          </svg>
                                          <span className="text-[10px] font-black uppercase tracking-wider">Liquidar lote</span>
                                        </button>
                                      )}
                                    </td>
                                    <td className="px-4 py-2 sm:px-6 sm:py-3 font-black text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-widest text-right">
                                      TOTAL GLOBAL LOTE
                                    </td>
                                    <td className="px-4 py-2 sm:px-6 sm:py-3 text-center font-black text-blue-600 text-xl sm:text-2xl">
                                      {totalQty + (r.chargeUnits || 0) + (r.incompleteUnits || 0) + (r.segundasUnits || 0)}
                                    </td>
                                  </tr>
                              </tfoot>
                          </table>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
              <div className="mt-6">
                <PaginationComponent 
                  currentPage={receptionsPagination.pagination.page}
                  totalPages={totalPagesReceptions}
                  pageSize={receptionsPagination.pagination.limit}
                  onPageChange={receptionsPagination.goToPage}
                  onPageSizeChange={receptionsPagination.setLimit}
                />
              </div>
            </>
          )}
        </div>
    </div>
  );
};

export default ReceptionView;
