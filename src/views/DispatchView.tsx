
import React, { useState, useRef } from 'react';
import { User, UserRole, Client, Dispatch, ItemEntry, AppState, Reference } from '../types';
import ScannerSimulator from '../components/ScannerSimulator';
import { Icons } from '../constants';
import PaginationComponent from '../components/PaginationComponent';
import usePagination from '../hooks/usePagination';
import { useDarkMode } from '../context/DarkModeContext';

// Función para formatear la fecha para visualización
const formatDateDisplay = (dateString: string): string => {
  if (!dateString) return '';
  // Si viene en formato ISO, extraer la parte de fecha y hora
  if (dateString.includes('T') && dateString.includes('Z')) {
    const date = new Date(dateString);
    const formatter = new Intl.DateTimeFormat('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(date);
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const hour = parts.find(p => p.type === 'hour')?.value;
    const minute = parts.find(p => p.type === 'minute')?.value;
    
    return `${year}-${month}-${day} T${hour}:${minute}`;
  }
  // Si ya está en nuestro formato, devolverlo tal cual
  return dateString;
};

interface DispatchViewProps {
  user: User;
  clients: Client[];
  dispatches: Dispatch[];
  orders: any[];
  updateState: (updater: (prev: AppState) => AppState) => void;
  referencesMaster: Reference[];
  correrias: any[];
  sellers: any[];
  onAddDispatch: (dispatch: Partial<Dispatch>) => Promise<{ success: boolean }>;
  onUpdateDispatch: (id: string, dispatch: Partial<Dispatch>) => Promise<{ success: boolean }>;
  onDeleteDispatch: (id: string) => Promise<{ success: boolean }>;
}

const DispatchView: React.FC<DispatchViewProps> = ({ user, clients, dispatches, orders, updateState, referencesMaster, correrias, sellers, onAddDispatch, onUpdateDispatch, onDeleteDispatch }) => {
  const { isDark } = useDarkMode();
  const [isDispatching, setIsDispatching] = useState(false);
  const [editingDisp, setEditingDisp] = useState<Dispatch | null>(null);
  const [historySearch, setHistorySearch] = useState('');
  const dispatchesPagination = usePagination(1, 20);

  // Dark mode palette
  const dk = {
    page:       isDark ? 'bg-[#3d2d52]'                    : '',
    title:      isDark ? 'text-violet-200'                  : 'text-slate-800',
    subtitle:   isDark ? 'text-violet-400'                  : 'text-slate-400',
    card:       isDark ? 'bg-[#4a3a63] border-violet-700'   : 'bg-white border-slate-100',
    thead:      isDark ? 'bg-[#5a4a75] border-violet-600'   : 'bg-slate-50 border-slate-100',
    th:         isDark ? 'text-violet-200'                  : 'text-slate-400',
    rowEven:    isDark ? 'bg-[#3d2d52]'                     : 'bg-white',
    rowOdd:     isDark ? 'bg-[#4a3a5f]'                     : 'bg-slate-50',
    rowDivide:  isDark ? 'divide-violet-700/50'             : 'divide-slate-100',
    rowBorder:  isDark ? 'border-violet-700/40'             : 'border-slate-100',
    input:      isDark ? 'bg-[#3d2d52] text-violet-100 placeholder-violet-600 border-violet-600' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-none',
    inputFocus: isDark ? 'focus:ring-violet-400'            : 'focus:ring-blue-100',
    btnAdd:     isDark ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white',
    btnCancel:  isDark ? 'bg-[#4a3a63] text-violet-300 border-violet-700 hover:text-pink-400' : 'bg-white text-slate-400 border-slate-100 hover:text-red-500',
    btnSave:    isDark ? 'bg-gradient-to-r from-violet-600 to-pink-600' : 'bg-gradient-to-r from-blue-600 to-pink-600',
    label:      isDark ? 'text-violet-300'                  : 'text-slate-400',
    text:       isDark ? 'text-violet-300'                  : 'text-slate-700',
    textMuted:  isDark ? 'text-violet-400'                  : 'text-slate-400',
    badge:      isDark ? 'bg-violet-900/50 text-violet-200' : 'bg-slate-100 text-slate-700',
    divider:    isDark ? 'border-violet-700/40'             : 'border-slate-100',
  };

// Form states
  const [clientId, setClientId] = useState('');
  const [correriaId, setCorreriaId] = useState(''); 
  const [clientSearch, setClientSearch] = useState('');
  const [showClientResults, setShowClientResults] = useState(false);
  const [correriaSearch, setCorreriaSearch] = useState('');
  const [showCorreriaDropdown, setShowCorreriaDropdown] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [remissionNo, setRemissionNo] = useState('');
  const [checkedBy, setCheckedBy] = useState('');
  const [items, setItems] = useState<ItemEntry[]>([]);
  const [duplicateRefWarnings, setDuplicateRefWarnings] = useState<Set<string>>(new Set());

  // History detail toggle
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleStart = () => {
    setIsDispatching(true);
    setEditingDisp(null);
    setClientId('');
    setCorreriaId(''); 
    setClientSearch('');
    setInvoiceNo('');
    setRemissionNo('');
    setCheckedBy('');
    setItems([]);
    setDuplicateRefWarnings(new Set());
  };

  const handleEdit = (disp: Dispatch) => {
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SOPORTE) {
      alert("Solo administradores pueden editar despachos.");
      return;
    }
    const client = clients.find(c => c.id === disp.clientId);
    setEditingDisp(disp);
    setIsDispatching(true);
    setClientId(disp.clientId);
    setCorreriaId(disp.correriaId || ''); 
    setClientSearch(client ? `${client.id} - ${client.name}` : disp.clientId);
    setInvoiceNo(disp.invoiceNo);
    setRemissionNo(disp.remissionNo);
    setCheckedBy(disp.checkedBy || '0');
    setItems(disp.items);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
    c.id.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const selectClient = (c: Client) => {
    setClientId(c.id);
    setClientSearch(`${c.id} - ${c.name}`);
    setShowClientResults(false);
  };

  const handleScan = (ref: string, quantity: number) => {
    const refExists = referencesMaster.some(r => r.id === ref);
    if (!refExists) {
      alert(`AVISO: La referencia "${ref}" no existe en el maestro de referencias. Recuerde crearla en el apartado de Maestros.`);
    }

    // Verificar si ya existe un despacho previo para este cliente + correría con esta referencia
    if (clientId && correriaId) {
      const alreadyDispatched = dispatches.some(d =>
        d.clientId === clientId &&
        d.correriaId === correriaId &&
        d.id !== editingDisp?.id &&
        d.items.some(i => i.reference === ref)
      );
      if (alreadyDispatched) {
        setDuplicateRefWarnings(prev => new Set(prev).add(ref));
      }
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
    if (!clientId) {
      alert("Debe seleccionar un cliente");
      return;
    }
    if (!correriaId) {
      alert("Debe seleccionar una correría");
      return;
    }
    if (!checkedBy.trim()) {
      alert("Debe ingresar quién revisó el despacho");
      return;
    }
    if (items.length === 0) {
      alert("Debe agregar al menos una prenda");
      return;
    }

    try {
      // Enriquecer items con salePrice del pedido
      const pedidoEspecifico = orders.find(o => 
        o.clientId === clientId && 
        o.correriaId === correriaId
      );

      console.log('🔍 Buscando pedido:', { clientId, correriaId });
      console.log('📋 Pedido encontrado:', pedidoEspecifico);
      console.log('📦 Orders disponibles:', orders);

      const itemsConPrecio = items.map(item => {
        const salePrice = pedidoEspecifico?.items.find(oi => oi.reference === item.reference)?.salePrice || 0;
        console.log(`💰 Item ${item.reference}: salePrice=${salePrice}`);
        return {
          ...item,
          salePrice
        };
      });

      if (editingDisp) {
        // Actualizar despacho existente
        const updatedData = {
          clientId,
          correriaId,
          invoiceNo,
          remissionNo,
          items: itemsConPrecio,
          dispatchedBy: editingDisp.dispatchedBy,
          checkedBy
        };

        const result = await onUpdateDispatch(editingDisp.id, updatedData);
        if (result?.success) {
          // No actualizar el estado aquí porque onUpdateDispatch ya lo hace
          setIsDispatching(false);
          setEditingDisp(null);
          alert("Despacho actualizado exitosamente");
        } else {
          const errorMsg = result?.message || 'Error desconocido al actualizar el despacho';
          alert(`Error al actualizar el despacho: ${errorMsg}`);
          console.error('Error response:', result);
        }
      } else {
        // Crear nuevo despacho
        const newData: Dispatch = {
          id: Math.random().toString(36).substr(2, 9),
          clientId,
          correriaId,
          invoiceNo,
          remissionNo,
          items: itemsConPrecio,
          dispatchedBy: user.name,
          checkedBy,
          createdAt: '', // El backend proporciona la fecha
          editLogs: [{ user: user.name, date: '' }]
        };

        const result = await onAddDispatch(newData);
        if (result.success) {
          // No actualizar el estado aquí porque onAddDispatch ya lo hace
          setIsDispatching(false);
          alert("Despacho guardado exitosamente");
        } else {
          alert("Error al guardar el despacho");
        }
      }
    } catch (error) {
      console.error('Error al guardar despacho:', error);
      alert("Error al guardar el despacho");
    }
  };

  const filteredDispatches = dispatches.filter(d => {
    if (!historySearch.trim()) return true;
    const client = clients.find(c => c.id === d.clientId);
    const search = historySearch.toLowerCase();
    return (
      client?.name.toLowerCase().includes(search) ||
      d.clientId.toLowerCase().includes(search)
    );
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalPagesDispatches = Math.ceil(filteredDispatches.length / dispatchesPagination.pagination.limit) || 1;

  React.useEffect(() => {
    dispatchesPagination.goToPage(1);
  }, [filteredDispatches.length, dispatchesPagination.pagination.limit]);

  if (isDispatching) {
    const totalCount = items.reduce((a, b) => a + b.quantity, 0);
    const totalRefs = new Set(items.map(i => i.reference)).size;
    const clientOrder = orders.find((o: any) => o.clientId === clientId && o.correriaId === correriaId);
    const totalValue = items.reduce((acc, item) => {
      const salePrice = clientOrder?.items?.find((i: any) => i.reference === item.reference)?.salePrice ?? 0;
      return acc + item.quantity * salePrice;
    }, 0);

    return (
      <div className={`space-y-8 animate-in slide-in-from-bottom-6 duration-500 pb-20 ${dk.page}`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{editingDisp ? 'Editar Despacho' : 'Nuevo Despacho'}</h2>
            <p className={`font-bold text-xs sm:text-base transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Registro de salida de bodega</p>
          </div>
          <button onClick={() => setIsDispatching(false)} className={`px-4 py-2 sm:px-6 sm:py-3 rounded-2xl font-bold hover:text-red-500 border transition-all text-sm transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] text-violet-300 border-violet-700 hover:text-pink-400' : 'bg-white text-slate-400 border-slate-100'}`}>
            Cancelar
          </button>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-sm border transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
          <div className="space-y-4">
            <div className="space-y-2 relative z-[100]">
              <label className={`text-[10px] font-black uppercase tracking-widest px-4 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-blue-500'}`}>Buscar Cliente</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={clientSearch}
                  onChange={(e) => { setClientSearch(e.target.value); setShowClientResults(true); if(!e.target.value) setClientId(''); }}
                  onFocus={() => setShowClientResults(true)}
                  placeholder="ID o Nombre de cliente..."
                  className={`w-full px-6 py-4 rounded-2xl font-bold transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] text-violet-100 placeholder-violet-600 border border-violet-600 focus:ring-4 focus:ring-violet-400' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-none focus:ring-4 focus:ring-blue-100'}`}
                />
                {showClientResults && clientSearch.length > 0 && (
                  <div className={`fixed rounded-2xl shadow-2xl border z-[9999] min-h-[280px] max-h-[350px] overflow-y-auto custom-scrollbar transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'}`} style={{
                    top: `${(document.activeElement as HTMLElement)?.getBoundingClientRect().bottom + 8}px`,
                    left: `${(document.activeElement as HTMLElement)?.getBoundingClientRect().left}px`,
                    width: `${(document.activeElement as HTMLElement)?.getBoundingClientRect().width}px`
                  }}>
                    {filteredClients.map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => selectClient(c)}
                        className={`w-full text-left px-6 py-4 transition-colors duration-300 border-b last:border-0 ${isDark ? 'hover:bg-[#5a4a75] border-violet-700/40 text-violet-100' : 'hover:bg-slate-50 border-slate-50 text-slate-800'}`}
                      >
                        <p className={`font-black text-base transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{c.name}</p>
                        <p className={`text-xs font-bold transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>ID: {c.id} • {c.city}</p>
                      </button>
                    ))}
                    {filteredClients.length === 0 && <p className={`px-6 py-4 font-bold italic text-sm transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>No se encontraron clientes</p>}
                  </div>
                )}
              </div>
            </div>
            {(() => {
              const selectedClient = clients.find(c => c.id === clientId);
              return (
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest px-4 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-blue-500'}`}>Dirección</label>
                  <div className={`px-6 py-4 rounded-2xl min-h-[56px] flex items-center transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-slate-50'}`}>
                    {selectedClient ? (
                      <p className={`font-bold text-sm transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>{selectedClient.address}&nbsp;&nbsp;–&nbsp;&nbsp;{selectedClient.city}</p>
                    ) : (
                      <p className={`text-sm font-bold italic transition-colors duration-300 ${isDark ? 'text-violet-600' : 'text-slate-300'}`}>Selecciona un cliente para ver su dirección</p>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
          <div className="grid grid-cols-2 gap-4 content-start">
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest px-4 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-pink-500'}`}>Factura</label>
              <input value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} placeholder="Ej: F-1234" className={`w-full px-6 py-4 rounded-2xl font-bold tracking-widest transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] text-violet-100 placeholder-violet-600 border border-violet-600 focus:ring-4 focus:ring-violet-400' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-none focus:ring-4 focus:ring-pink-100'}`} />
            </div>
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest px-4 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-pink-500'}`}>Remisión</label>
              <input value={remissionNo} onChange={e => setRemissionNo(e.target.value)} placeholder="Ej: R-1234" className={`w-full px-6 py-4 rounded-2xl font-bold tracking-widest transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] text-violet-100 placeholder-violet-600 border border-violet-600 focus:ring-4 focus:ring-violet-400' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-none focus:ring-4 focus:ring-pink-100'}`} />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[10px] font-black uppercase tracking-widest px-4 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-purple-500'}`}>Correría / Campaña</label>
              <CorreriaAutocomplete
                value={correriaId}
                correrias={correrias}
                onChange={setCorreriaId}
                search={correriaSearch}
                setSearch={setCorreriaSearch}
                showDropdown={showCorreriaDropdown}
                setShowDropdown={setShowCorreriaDropdown}
                isDark={isDark}
              />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[10px] font-black uppercase tracking-widest px-4 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-purple-500'}`}>Revisado por</label>
              <input 
                value={checkedBy} 
                onChange={e => setCheckedBy(e.target.value)} 
                placeholder="Nombre..." 
                className={`w-full px-6 py-3.5 rounded-2xl font-bold transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] text-violet-100 placeholder-violet-600 border border-violet-600 focus:ring-4 focus:ring-violet-400' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-none focus:ring-4 focus:ring-purple-100'}`} 
              />
            </div>
          </div>
        </div>

        <ScannerSimulator onScan={handleScan} label="Agregar referencia" />

        {items.length > 0 && (
          <div className={`rounded-[40px] shadow-sm border overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
            <div className={`px-6 py-3 sm:px-8 sm:py-4 border-b flex flex-wrap items-center justify-between gap-4 transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-600' : 'bg-slate-50 border-slate-100'}`}>
              <h3 className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-700'}`}>Mercancía para Despachar</h3>
              <div className="flex gap-4">
                <div className={`px-4 py-1.5 sm:px-6 sm:py-2 rounded-full font-black text-xs sm:text-sm shadow-sm transition-colors duration-300 ${isDark ? 'bg-pink-900/50 text-pink-300' : 'bg-pink-100 text-pink-600'}`}>
                  Ref Totales: {totalRefs}
                </div>
                <div className={`px-4 py-1.5 sm:px-6 sm:py-2 rounded-full font-black text-xs sm:text-sm shadow-lg transition-colors duration-300 ${isDark ? 'bg-violet-600 text-white shadow-violet-900/50' : 'bg-blue-600 text-white shadow-blue-100'}`}>
                  Total Unidades: {totalCount}
                </div>
                <div className={`px-4 py-1.5 sm:px-6 sm:py-2 rounded-full font-black text-xs sm:text-sm shadow-lg transition-colors duration-300 ${isDark ? 'bg-emerald-900/50 text-emerald-300 shadow-emerald-900/50' : 'bg-emerald-600 text-white shadow-emerald-100'}`}>
                  Total: $ {Math.round(totalValue).toLocaleString('es-CO')}
                </div>
              </div>
            </div>
            <div className={`divide-y transition-colors duration-300 ${isDark ? 'divide-violet-700/40' : 'divide-slate-100'}`}>
              {items.map((item) => {
                const refData = referencesMaster.find(r => r.id === item.reference);
                // Buscar la orden del cliente para esta correría
                const clientOrder = orders.find((o: any) => o.clientId === clientId && o.correriaId === correriaId);
                const orderItem = clientOrder?.items?.find((i: any) => i.reference === item.reference);
                const salePrice: number | null = orderItem?.salePrice ?? null;
                const notOrdered = clientId && correriaId && !orderItem;
                return (
                  <div key={item.reference} className="px-6 sm:px-8 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <span className={`text-xl sm:text-2xl font-black tracking-tight transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{item.reference}</span>
                        {refData?.description && (
                          <span className={`text-sm font-medium ml-4 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>
                            &nbsp;&nbsp;&nbsp;&nbsp;–&nbsp;&nbsp;&nbsp;&nbsp;{refData.description}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 flex justify-center">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={e => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val > 0) {
                              setItems(prev => prev.map(p => p.reference === item.reference ? { ...p, quantity: val } : p));
                            }
                          }}
                          onFocus={e => e.target.select()}
                          className={`text-lg sm:text-xl font-black text-center border-none outline-none w-16 cursor-pointer transition-all transition-colors duration-300 ${isDark ? 'bg-transparent text-violet-300 focus:bg-violet-700/40 focus:rounded-lg focus:px-2' : 'bg-transparent text-blue-600 focus:bg-blue-50 focus:rounded-lg focus:px-2'}`}
                        />
                      </div>
                      <div className="flex items-center justify-end flex-1 gap-3 flex-wrap">
                        {duplicateRefWarnings.has(item.reference) && (
                          <span className={`text-xs font-black px-3 py-1 rounded-full transition-colors duration-300 ${isDark ? 'text-orange-300 bg-orange-900/50 border border-orange-700/50' : 'text-orange-600 bg-orange-50 border border-orange-200'}`}>⚠ Ya despachada en esta correría</span>
                        )}
                        {notOrdered ? (
                          <span className={`text-xs font-black px-3 py-1 rounded-full transition-colors duration-300 ${isDark ? 'text-amber-300 bg-amber-900/50' : 'text-amber-500 bg-amber-50'}`}>Ref no pedida</span>
                        ) : salePrice !== null ? (
                          <span className={`text-sm font-bold transition-colors duration-300 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>$ {Math.round(salePrice).toLocaleString('es-CO')}</span>
                        ) : null}
                        <button 
                          onClick={() => {
                            setItems(prev => prev.filter(p => p.reference !== item.reference));
                            setDuplicateRefWarnings(prev => { const next = new Set(prev); next.delete(item.reference); return next; });
                          }}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all transition-colors duration-300 ${isDark ? 'bg-red-900/50 text-red-300 hover:bg-red-900/70' : 'bg-red-100 text-red-500 hover:bg-red-200'}`}
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

        <button onClick={handleSave} className={`w-full py-5 sm:py-6 text-white font-black text-xl sm:text-2xl rounded-[28px] sm:rounded-[32px] shadow-2xl hover:scale-[1.01] transition-all transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-violet-600 to-pink-600 shadow-violet-900/50' : 'bg-gradient-to-r from-blue-600 to-pink-600 shadow-blue-200'}`}>
          FINALIZAR DESPACHO
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-10 pb-20 transition-colors duration-300 ${dk.page}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-1">
          <div>
            <h2 className={`text-3xl sm:text-4xl font-black tracking-tighter transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Despachos</h2>
            <p className={`font-medium text-sm sm:text-base transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Gestiona la salida de mercancía</p>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input 
                type="text" 
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Buscar despacho por cliente o ID..."
                className={`w-full px-6 py-4 rounded-[24px] font-bold text-sm shadow-sm transition-all transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] text-violet-100 placeholder-violet-600 border border-violet-600 focus:ring-4 focus:ring-violet-400' : 'bg-white text-slate-900 placeholder-slate-400 border border-slate-200 focus:ring-4 focus:ring-blue-100'}`}
              />
              <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isDark ? 'text-violet-600' : 'text-slate-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <button onClick={handleStart} className={`w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 text-white font-black rounded-[24px] sm:rounded-[28px] shadow-2xl hover:scale-105 active:scale-95 transition-all transition-colors duration-300 flex items-center justify-center gap-3 ${isDark ? 'bg-gradient-to-r from-violet-600 to-pink-600 shadow-violet-900/50' : 'bg-gradient-to-r from-blue-500 to-pink-500 shadow-blue-200'}`}>
          <Icons.Dispatch />
          NUEVO DESPACHO
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredDispatches.length === 0 ? (
          <div className={`p-12 sm:p-24 rounded-[32px] sm:rounded-[48px] border-2 border-dashed flex flex-col items-center text-center space-y-4 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700/40' : 'bg-white border-slate-200'}`}>
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-violet-900/50 text-violet-600' : 'bg-slate-100 text-slate-300'}`}>
              <Icons.Dispatch />
            </div>
            <p className={`font-bold text-base sm:text-lg italic transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>
              {historySearch ? `No se encontraron despachos para "${historySearch}"` : 'Sin registros de despacho hoy'}
            </p>
          </div>
        ) : (
          <>
            {filteredDispatches.slice((dispatchesPagination.pagination.page - 1) * dispatchesPagination.pagination.limit, dispatchesPagination.pagination.page * dispatchesPagination.pagination.limit).map(d => {
            const client = clients.find(c => c.id === d.clientId);
            const isExpanded = expandedId === d.id;
            const totalQty = d.items.reduce((a, b) => a + b.quantity, 0);
            
            // Group items for display
            const itemsByRef = d.items.reduce((acc, curr) => {
              if(!acc[curr.reference]) acc[curr.reference] = 0;
              acc[curr.reference] += curr.quantity;
              return acc;
            }, {} as Record<string, number>);

            return (
              <div key={d.id} className={`rounded-[24px] sm:rounded-[32px] shadow-sm border overflow-hidden group hover:shadow-md transition-all transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700 hover:border-violet-600' : 'bg-white border-slate-100'}`}>
                <div 
                  className={`p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer transition-colors duration-300 ${isDark ? 'hover:bg-[#5a4a75]/50' : 'hover:bg-slate-50/50'}`}
                  onClick={() => setExpandedId(isExpanded ? null : d.id)}
                >
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] sm:text-[10px] font-bold transition-colors duration-300 ${isDark ? 'text-violet-500' : 'text-slate-400'}`}>{formatDateDisplay(d.createdAt)}</span>
                      {(d.invoiceNo || d.remissionNo) && <span className={`font-bold text-[9px] transition-colors duration-300 ${isDark ? 'text-violet-600' : 'text-slate-300'}`}>|</span>}
                      {d.invoiceNo && <span className={`text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter transition-colors duration-300 ${isDark ? 'bg-violet-900/50 text-violet-300' : 'bg-blue-50 text-blue-500'}`}>F: {d.invoiceNo}</span>}
                      {d.remissionNo && <span className={`text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter transition-colors duration-300 ${isDark ? 'bg-pink-900/50 text-pink-300' : 'bg-pink-50 text-pink-500'}`}>R: {d.remissionNo}</span>}
                      {correrias.find(c => c.id === d.correriaId) && <><span className={`font-bold text-[9px] transition-colors duration-300 ${isDark ? 'text-violet-600' : 'text-slate-300'}`}>|</span><span className={`text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter transition-colors duration-300 ${isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-50 text-purple-600'}`}>{correrias.find(c => c.id === d.correriaId)?.name} {correrias.find(c => c.id === d.correriaId)?.year}</span></>}
                    </div>
                    <div className="flex items-baseline gap-3">
                      <h3 className={`text-lg sm:text-xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{client?.name || 'Cliente Desconocido'}</h3>
                      <p className={`text-xs sm:text-sm font-bold transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>{client?.address}  -  {client?.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full md:w-auto gap-4">
                    <div className="flex flex-wrap gap-4 hidden sm:flex">
                      <span className={`text-[10px] sm:text-xs font-bold uppercase transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Referencias: <span className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{Object.keys(itemsByRef).length}</span></span>
                      <span className={`text-[10px] sm:text-xs font-bold uppercase transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Total Unid: <span className={`font-black transition-colors duration-300 ${isDark ? 'text-pink-300' : 'text-pink-600'}`}>{totalQty}</span></span>
                    </div>
                    <div className={`text-left md:text-right hidden sm:block transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>
                      <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 transition-colors duration-300 ${isDark ? 'text-violet-500' : 'text-slate-300'}`}>Ingresado por</p>
                      <p className={`text-xs font-black transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-500'}`}>{d.dispatchedBy}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-auto md:ml-0">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(d); }} className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all opacity-100 md:opacity-0 group-hover:opacity-100 transition-colors duration-300 ${isDark ? 'bg-violet-900/50 text-violet-400 hover:bg-violet-700 hover:text-violet-200' : 'bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-500'}`}>
                        <Icons.Edit />
                      </button>
                      {(user.role === UserRole.ADMIN || user.role === UserRole.SOPORTE) && (
                        <button onClick={async (e) => { 
                          e.stopPropagation(); 
                          if (confirm("¿Seguro que desea eliminar este despacho?")) {
                            try {
                              const result = await onDeleteDispatch(d.id);
                              if (result?.success) {
                                updateState(prev => ({
                                  ...prev,
                                  dispatches: prev.dispatches.filter(disp => disp.id !== d.id)
                                }));
                                alert('Despacho eliminado correctamente');
                              } else {
                                const errorMsg = result?.message || 'Error desconocido al eliminar el despacho';
                                alert(`Error al eliminar el despacho: ${errorMsg}`);
                              }
                            } catch (error) {
                              console.error('Error eliminando despacho:', error);
                              alert(`Error al eliminar el despacho: ${error}`);
                            }
                          }
                        }} className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all opacity-100 md:opacity-0 group-hover:opacity-100 transition-colors duration-300 ${isDark ? 'bg-violet-900/50 text-violet-400 hover:bg-red-900/50 hover:text-red-300' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500'}`}>
                          <Icons.Delete />
                        </button>
                      )}
                      <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-5 h-5 transition-colors duration-300 ${isDark ? 'text-violet-600' : 'text-slate-300'}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                         </svg>
                      </span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className={`px-6 pb-6 sm:px-8 sm:pb-8 pt-4 border-t animate-in slide-in-from-top-2 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-700/40' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                       <div>
                          <p className={`text-[10px] font-black uppercase tracking-widest mb-3 transition-colors duration-300 ${isDark ? 'text-violet-500' : 'text-slate-400'}`}>Detalles del Cliente</p>
                          <div className="space-y-1">
                             <p className={`font-black text-xs sm:text-sm mb-2 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-blue-600'}`}>Código: {client?.id}</p>
                             <p className={`font-black text-base sm:text-lg transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{client?.name}</p>
                             <p className={`text-xs sm:text-sm font-bold transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>{client?.address}  -  {client?.city}</p>
                             <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest mt-2 transition-colors duration-300 ${isDark ? 'text-pink-300' : 'text-pink-600'}`}>Vendedor: {sellers.find(s => s.id === client?.sellerId)?.name || client?.sellerId || '-'}</p>
                          </div>
                       </div>
                       <div className="md:text-right">
                          <p className={`text-[10px] font-black uppercase tracking-widest mb-3 transition-colors duration-300 ${isDark ? 'text-violet-500' : 'text-slate-400'}`}>Auditoría</p>
                           <p className={`text-xs sm:text-sm font-bold transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-600'}`}>Ingresado por: <span className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>{d.dispatchedBy}</span></p>
                           <p className={`text-xs sm:text-sm font-bold transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-600'}`}>Fecha: <span className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>{formatDateDisplay(d.createdAt)}</span></p>
                           <div className={`mt-2 pt-2 border-t transition-colors duration-300 ${isDark ? 'border-violet-700/40' : 'border-slate-100'}`}>
                             <p className={`text-xs sm:text-sm font-bold transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-600'}`}>Revisado por: <span className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>{d.checkedBy || '0'}</span></p>
                           </div>
                        </div>
                    </div>

                    <div className={`rounded-2xl sm:rounded-3xl border overflow-hidden shadow-sm transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'}`}>
                       <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm min-w-[500px]">
                            <thead>
                                <tr className={`border-b transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-600' : 'bg-slate-50 border-slate-100'}`}>
                                  <th className={`px-4 py-3 sm:px-6 sm:py-4 font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Referencia / Descripción</th>
                                  <th className={`px-4 py-3 sm:px-6 sm:py-4 font-black text-[9px] sm:text-[10px] uppercase tracking-widest text-center transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Cantidad</th>
                                  <th className={`px-4 py-3 sm:px-6 sm:py-4 font-black text-[9px] sm:text-[10px] uppercase tracking-widest text-right transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Precio Unit</th>
                                  <th className={`px-4 py-3 sm:px-6 sm:py-4 font-black text-[9px] sm:text-[10px] uppercase tracking-widest text-right transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y transition-colors duration-300 ${isDark ? 'divide-violet-700/40' : 'divide-slate-50'}`}>
                                {Object.entries(itemsByRef).map(([ref, qty]: [string, any]) => {
                                  const dispatchItem = d.items.find(item => item.reference === ref);
                                  const masterRef = referencesMaster.find(rm => rm.id === ref);
                                  const price = dispatchItem?.salePrice || masterRef?.price || 0;
                                  
                                  console.log(`📦 Despacho item ${ref}:`, { dispatchItem, salePrice: dispatchItem?.salePrice, masterRefPrice: masterRef?.price, finalPrice: price });
                                  
                                  const subtotal = price * qty;
                                  return (
                                    <tr key={ref} className={`transition-colors duration-300 ${isDark ? 'hover:bg-[#5a4a75]/50' : 'hover:bg-slate-50'}`}>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4">
                                          <p className={`font-black text-xs sm:text-sm transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-blue-600'}`}>{ref}  -  <span className={`font-bold uppercase text-[9px] sm:text-[10px] transition-colors duration-300 ${isDark ? 'text-violet-500' : 'text-slate-400'}`}>{masterRef?.description || 'Sin descripción'}</span></p>
                                      </td>
                                      <td className={`px-4 py-3 sm:px-6 sm:py-4 text-center font-black text-xs sm:text-sm transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{qty}</td>
                                      <td className={`px-4 py-3 sm:px-6 sm:py-4 text-right font-bold text-xs sm:text-sm transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>$ {Math.round(price).toLocaleString('es-CO')}</td>
                                      <td className={`px-4 py-3 sm:px-6 sm:py-4 text-right font-black text-xs sm:text-sm transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>${subtotal.toLocaleString()}</td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className={`border-t transition-colors duration-300 ${isDark ? 'bg-[#5a4a75]/50 border-violet-600' : 'bg-slate-50/80 border-slate-100'}`}>
                                  <td className={`px-4 py-4 sm:px-6 sm:py-6 font-black text-[9px] sm:text-[10px] uppercase tracking-widest text-right transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>TOTALES DESPACHO</td>
                                  <td className={`px-4 py-4 sm:px-6 sm:py-6 text-center font-black text-lg sm:text-xl transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>{totalQty}</td>
                                  <td></td>
                                  <td className={`px-4 py-4 sm:px-6 sm:py-6 text-right font-black text-xl sm:text-2xl transition-colors duration-300 ${isDark ? 'text-pink-300' : 'text-pink-600'}`}>${Object.entries(itemsByRef).reduce((acc, [ref, qty]: [string, any]) => {
                                    const dispatchItem = d.items.find(item => item.reference === ref);
                                    const masterRef = referencesMaster.find(rm => rm.id === ref);
                                    const price = dispatchItem?.salePrice || masterRef?.price || 0;
                                    return acc + (price * qty);
                                  }, 0).toLocaleString()}</td>
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
                currentPage={dispatchesPagination.pagination.page}
                totalPages={totalPagesDispatches}
                pageSize={dispatchesPagination.pagination.limit}
                onPageChange={dispatchesPagination.goToPage}
                onPageSizeChange={dispatchesPagination.setLimit}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const CorreriaAutocomplete: React.FC<{
  value: string;
  correrias: any[];
  onChange: (id: string) => void;
  search: string;
  setSearch: (search: string) => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  isDark: boolean;
}> = ({ value, correrias, onChange, search, setSearch, showDropdown, setShowDropdown, isDark }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

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
        className={`w-full px-6 py-3.5 rounded-2xl font-bold transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] text-violet-100 placeholder-violet-600 border border-violet-600 focus:ring-4 focus:ring-violet-400' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-none focus:ring-4 focus:ring-blue-100'}`}
      />
      {showDropdown && search.length >= 2 && (
        <div 
          className={`absolute top-full left-0 w-full mt-2 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50 border transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}
          onMouseDown={(e) => e.preventDefault()}
        >
          {filtered.map(c => (
            <button
              key={c.id}
              onMouseDown={() => handleSelect(c.id)}
              className={`w-full px-6 py-4 text-left transition-colors duration-300 border-b last:border-0 ${isDark ? 'hover:bg-[#5a4a75] border-violet-700/40 text-violet-100' : 'hover:bg-slate-50 border-slate-50'}`}
            >
              <p className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{c.name}</p>
              <p className={`text-[10px] font-bold transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>{c.year}</p>
            </button>
          ))}
          {filtered.length === 0 && <p className={`px-6 py-4 font-bold italic text-sm transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>No se encontraron correrias</p>}
        </div>
      )}
    </div>
  );
};

export default DispatchView;
