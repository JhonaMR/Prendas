
import React, { useState, useRef } from 'react';
import { User, UserRole, Client, Dispatch, ItemEntry, AppState, Reference } from '../types';
import ScannerSimulator from '../components/ScannerSimulator';
import { Icons } from '../constants';
import PaginationComponent from '../components/PaginationComponent';
import usePagination from '../hooks/usePagination';

interface DispatchViewProps {
  user: User;
  clients: Client[];
  dispatches: Dispatch[];
  orders: any[];
  updateState: (updater: (prev: AppState) => AppState) => void;
  referencesMaster: Reference[];
  correrias: any[];
  onAddDispatch: (dispatch: Partial<Dispatch>) => Promise<{ success: boolean }>;
  onUpdateDispatch: (id: string, dispatch: Partial<Dispatch>) => Promise<{ success: boolean }>;
  onDeleteDispatch: (id: string) => Promise<{ success: boolean }>;
}

const DispatchView: React.FC<DispatchViewProps> = ({ user, clients, dispatches, orders, updateState, referencesMaster, correrias, onAddDispatch, onUpdateDispatch, onDeleteDispatch }) => {
  const [isDispatching, setIsDispatching] = useState(false);
  const [editingDisp, setEditingDisp] = useState<Dispatch | null>(null);
  const [historySearch, setHistorySearch] = useState('');
  const dispatchesPagination = usePagination(1, 50);

// Form states
  const [clientId, setClientId] = useState('');
  const [correriaId, setCorreriaId] = useState(''); 
  const [clientSearch, setClientSearch] = useState('');
  const [showClientResults, setShowClientResults] = useState(false);
  const [correriaSearch, setCorreriaSearch] = useState('');
  const [showCorreriaDropdown, setShowCorreriaDropdown] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [remissionNo, setRemissionNo] = useState('');
  const [items, setItems] = useState<ItemEntry[]>([]);

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
    setItems([]);
  };

  const handleEdit = (disp: Dispatch) => {
    if (user.role !== UserRole.ADMIN) {
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
          dispatchedBy: editingDisp.dispatchedBy
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
          createdAt: new Date().toLocaleString(),
          editLogs: [{ user: user.name, date: new Date().toLocaleString() }]
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

  React.useEffect(() => {
    dispatchesPagination.pagination.total = filteredDispatches.length;
    dispatchesPagination.pagination.totalPages = Math.ceil(filteredDispatches.length / dispatchesPagination.pagination.limit);
  }, [filteredDispatches.length, dispatchesPagination.pagination.limit]);

  if (isDispatching) {
    const totalCount = items.reduce((a, b) => a + b.quantity, 0);
    const totalRefs = new Set(items.map(i => i.reference)).size;

    return (
      <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500 pb-20">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{editingDisp ? 'Editar Despacho' : 'Nuevo Despacho'}</h2>
            <p className="text-slate-400 font-bold text-xs sm:text-base">Registro de salida de bodega</p>
          </div>
          <button onClick={() => setIsDispatching(false)} className="px-4 py-2 sm:px-6 sm:py-3 rounded-2xl bg-white text-slate-400 font-bold hover:text-red-500 border border-slate-100 transition-all text-sm">
            Cancelar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-sm border border-slate-100">
          <div className="space-y-4 relative">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest px-4">Buscar Cliente</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={clientSearch}
                  onChange={(e) => { setClientSearch(e.target.value); setShowClientResults(true); if(!e.target.value) setClientId(''); }}
                  onFocus={() => setShowClientResults(true)}
                  placeholder="ID o Nombre de cliente..."
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-900"
                />
                {showClientResults && clientSearch.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 max-h-60 overflow-y-auto custom-scrollbar">
                    {filteredClients.map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => selectClient(c)}
                        className="w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                      >
                        <p className="font-black text-slate-800">{c.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">ID: {c.id} • {c.city}</p>
                      </button>
                    ))}
                    {filteredClients.length === 0 && <p className="px-6 py-4 text-slate-400 font-bold italic text-sm">No se encontraron clientes</p>}
                  </div>
                )}
              </div>
            </div>
            {/* SELECTOR DE CORRERÍA */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Correría / Campaña</label>
              <CorreriaAutocomplete
                value={correriaId}
                correrias={correrias}
                onChange={setCorreriaId}
                search={correriaSearch}
                setSearch={setCorreriaSearch}
                showDropdown={showCorreriaDropdown}
                setShowDropdown={setShowCorreriaDropdown}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-pink-500 tracking-widest px-4">Factura</label>
              <input value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} placeholder="Ej: F-1234" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-pink-100 transition-all font-bold tracking-widest text-slate-900" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-pink-500 tracking-widest px-4">Remisión</label>
              <input value={remissionNo} onChange={e => setRemissionNo(e.target.value)} placeholder="Ej: R-1234" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-pink-100 transition-all font-bold tracking-widest text-slate-900" />
            </div>
          </div>
        </div>

        <ScannerSimulator onScan={handleScan} label="Escanear Salida" />

        {items.length > 0 && (
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <h3 className="font-black text-slate-700">Mercancía para Despachar</h3>
              <div className="flex gap-4">
                <div className="px-4 py-1.5 sm:px-6 sm:py-2 bg-pink-100 text-pink-600 rounded-full font-black text-xs sm:text-sm shadow-sm">
                  Ref Totales: {totalRefs}
                </div>
                <div className="px-4 py-1.5 sm:px-6 sm:py-2 bg-blue-600 text-white rounded-full font-black text-xs sm:text-sm shadow-lg shadow-blue-100">
                  Total Unidades: {totalCount}
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.reference} className="p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{item.reference}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-lg sm:text-xl font-black text-blue-600">{item.quantity}</span>
                      <button 
                        onClick={() => setItems(prev => prev.filter(p => p.reference !== item.reference))}
                        className="w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-[10px] hover:bg-red-200 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleSave} className="w-full py-5 sm:py-6 bg-gradient-to-r from-blue-600 to-pink-600 text-white font-black text-xl sm:text-2xl rounded-[28px] sm:rounded-[32px] shadow-2xl shadow-blue-200 hover:scale-[1.01] transition-all">
          FINALIZAR DESPACHO
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-1">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter">Despachos</h2>
            <p className="text-slate-400 font-medium text-sm sm:text-base">Gestiona la salida de mercancía</p>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input 
                type="text" 
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Buscar despacho por cliente o ID..."
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
        <button onClick={handleStart} className="w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-blue-500 to-pink-500 text-white font-black rounded-[24px] sm:rounded-[28px] shadow-2xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
          <Icons.Dispatch />
          NUEVO DESPACHO
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredDispatches.length === 0 ? (
          <div className="bg-white p-12 sm:p-24 rounded-[32px] sm:rounded-[48px] border-2 border-dashed border-slate-200 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
              <Icons.Dispatch />
            </div>
            <p className="text-slate-400 font-bold text-base sm:text-lg italic">
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
              <div key={d.id} className="bg-white rounded-[24px] sm:rounded-[32px] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-all">
                <div 
                  className="p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer" 
                  onClick={() => setExpandedId(isExpanded ? null : d.id)}
                >
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold">{d.createdAt}</span>
                      {d.invoiceNo && <span className="text-[9px] sm:text-[10px] font-black bg-blue-50 text-blue-500 px-2.5 py-1 rounded-full uppercase tracking-tighter">F: {d.invoiceNo}</span>}
                      {d.remissionNo && <span className="text-[9px] sm:text-[10px] font-black bg-pink-50 text-pink-500 px-2.5 py-1 rounded-full uppercase tracking-tighter">R: {d.remissionNo}</span>}
                      {correrias.find(c => c.id === d.correriaId) && <span className="text-[9px] sm:text-[10px] font-black bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full uppercase tracking-tighter">{correrias.find(c => c.id === d.correriaId)?.name} {correrias.find(c => c.id === d.correriaId)?.year}</span>}
                    </div>
                    <div className="flex items-baseline gap-3">
                      <h3 className="text-lg sm:text-xl font-black text-slate-800">{client?.name || 'Cliente Desconocido'}</h3>
                      <p className="text-xs sm:text-sm font-bold text-slate-400">{client?.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full md:w-auto gap-4">
                    <div className="flex flex-wrap gap-4 hidden sm:flex">
                      <span className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase">Referencias: <span className="text-slate-800 font-black">{Object.keys(itemsByRef).length}</span></span>
                      <span className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase">Total Unid: <span className="text-pink-600 font-black">{totalQty}</span></span>
                    </div>
                    <div className="text-left md:text-right hidden sm:block">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Leído por</p>
                      <p className="text-xs font-black text-slate-500">{d.dispatchedBy}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-auto md:ml-0">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(d); }} className="p-2 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-all opacity-100 md:opacity-0 group-hover:opacity-100">
                        <Icons.Edit />
                      </button>
                      {user.role === UserRole.ADMIN && (
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
                        }} className="p-2 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all opacity-100 md:opacity-0 group-hover:opacity-100">
                          <Icons.Delete />
                        </button>
                      )}
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
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Detalles del Cliente</p>
                          <div className="space-y-1">
                             <p className="font-black text-slate-800 text-base sm:text-lg">{client?.name}</p>
                             <p className="text-xs sm:text-sm font-bold text-slate-500">{client?.address} • {client?.city}</p>
                             <p className="text-[9px] sm:text-[10px] font-black text-blue-500 uppercase tracking-widest">Vendedor: {client?.seller}</p>
                          </div>
                       </div>
                       <div className="md:text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Auditoría</p>
                          <p className="text-xs sm:text-sm font-bold text-slate-600">Ingresado por: <span className="text-slate-900 font-black">{d.dispatchedBy}</span></p>
                          <p className="text-xs sm:text-sm font-bold text-slate-600">Fecha: <span className="text-slate-900 font-black">{d.createdAt}</span></p>
                       </div>
                    </div>

                    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                       <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm min-w-[500px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                  <th className="px-4 py-3 sm:px-6 sm:py-4 font-black text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-widest">Referencia / Descripción</th>
                                  <th className="px-4 py-3 sm:px-6 sm:py-4 font-black text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-widest text-center">Cantidad</th>
                                  <th className="px-4 py-3 sm:px-6 sm:py-4 font-black text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-widest text-right">Precio Unit</th>
                                  <th className="px-4 py-3 sm:px-6 sm:py-4 font-black text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-widest text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {Object.entries(itemsByRef).map(([ref, qty]: [string, any]) => {
                                  const dispatchItem = d.items.find(item => item.reference === ref);
                                  const masterRef = referencesMaster.find(rm => rm.id === ref);
                                  const price = dispatchItem?.salePrice || masterRef?.price || 0;
                                  
                                  console.log(`📦 Despacho item ${ref}:`, { dispatchItem, salePrice: dispatchItem?.salePrice, masterRefPrice: masterRef?.price, finalPrice: price });
                                  
                                  const subtotal = price * qty;
                                  return (
                                    <tr key={ref}>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4">
                                          <p className="font-black text-blue-600 text-xs sm:text-sm">{ref}</p>
                                          <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">{masterRef?.description || 'Sin descripción'}</p>
                                      </td>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4 text-center font-black text-slate-800 text-xs sm:text-sm">{qty}</td>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4 text-right font-bold text-slate-500 text-xs sm:text-sm">${price.toLocaleString()}</td>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4 text-right font-black text-slate-800 text-xs sm:text-sm">${subtotal.toLocaleString()}</td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-50/80 border-t border-slate-100">
                                  <td className="px-4 py-4 sm:px-6 sm:py-6 font-black text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-widest text-right">TOTALES DESPACHO</td>
                                  <td className="px-4 py-4 sm:px-6 sm:py-6 text-center font-black text-slate-900 text-lg sm:text-xl">{totalQty}</td>
                                  <td></td>
                                  <td className="px-4 py-4 sm:px-6 sm:py-6 text-right font-black text-pink-600 text-xl sm:text-2xl">${Object.entries(itemsByRef).reduce((acc, [ref, qty]: [string, any]) => {
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
                totalPages={dispatchesPagination.pagination.totalPages}
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
}> = ({ value, correrias, onChange, search, setSearch, showDropdown, setShowDropdown }) => {
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
        className="w-full px-6 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all"
      />
      {showDropdown && (
        <div 
          className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50"
          onMouseDown={(e) => e.preventDefault()}
        >
          {filtered.map(c => (
            <button
              key={c.id}
              onMouseDown={() => handleSelect(c.id)}
              className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
            >
              <p className="font-black text-slate-800">{c.name}</p>
              <p className="text-[10px] text-slate-400 font-bold">{c.year}</p>
            </button>
          ))}
          {filtered.length === 0 && <p className="px-6 py-4 text-slate-400 font-bold italic text-sm">No se encontraron correrias</p>}
        </div>
      )}
    </div>
  );
};

export default DispatchView;
