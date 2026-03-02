import React, { useState, useEffect } from 'react';
import { User, UserRole, AppState, ItemEntry, Client, Reference } from '../types';
import ScannerSimulator from '../components/ScannerSimulator';
import { Icons } from '../constants';
import { api } from '../services/api';

interface ReturnReceptionViewProps {
  user: User;
  updateState: (updater: (prev: AppState) => AppState) => void;
  clientsMaster: Client[];
  referencesMaster: Reference[];
  onAddReturnReception?: (reception: any) => Promise<any>;
  onUpdateReturnReception?: (id: string, reception: any) => Promise<any>;
  onDeleteReturnReception?: (id: string) => Promise<any>;
}

interface ReturnReceptionData {
  id: string;
  clientId: string;
  creditNoteNumber?: string;
  items: ItemEntry[];
  totalValue: number;
  receivedBy: string;
  createdAt: string;
}

const ReturnReceptionView: React.FC<ReturnReceptionViewProps> = ({ 
  user, 
  updateState, 
  clientsMaster = [], 
  referencesMaster = [],
  onAddReturnReception,
  onUpdateReturnReception,
  onDeleteReturnReception
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showClientResults, setShowClientResults] = useState(false);
  const [creditNoteNumber, setCreditNoteNumber] = useState('');
  const [items, setItems] = useState<ItemEntry[]>([]);
  const [returnReceptions, setReturnReceptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingReturn, setEditingReturn] = useState<any | null>(null);

  // Load return receptions on mount
  useEffect(() => {
    loadReturnReceptions();
  }, []);

  const loadReturnReceptions = async () => {
    try {
      setIsLoading(true);
      const response = await api.getReturnReceptionsWithPagination(1, 100);
      if (response.success && response.data) {
        setReturnReceptions(response.data);
      }
    } catch (error) {
      console.error('❌ Error loading return receptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (reception: any) => {
    if (user.role !== UserRole.ADMIN) {
      alert("Solo administradores pueden editar devoluciones.");
      return;
    }
    const client = clientsMaster.find(c => c.id === reception.clientId);
    setEditingReturn(reception);
    setIsProcessing(true);
    setSelectedClientId(reception.clientId);
    setClientSearch(client ? `${client.id} - ${client.name}` : reception.clientId);
    setCreditNoteNumber(reception.creditNoteNumber || '');
    setItems(reception.items || []);
  };

  const handleDelete = async (id: string) => {
    if (user.role !== UserRole.ADMIN) {
      alert("Solo administradores pueden eliminar devoluciones.");
      return;
    }
    if (!confirm("¿Seguro que desea eliminar esta devolución?")) {
      return;
    }
    try {
      if (onDeleteReturnReception) {
        const result = await onDeleteReturnReception(id);
        if (result?.success) {
          await loadReturnReceptions();
          updateState(prev => ({
            ...prev,
            returnReceptions: prev.returnReceptions?.filter(r => r.id !== id) || []
          }));
          alert('Devolución eliminada correctamente');
        } else {
          alert('Error al eliminar la devolución');
        }
      }
    } catch (error) {
      console.error('Error eliminando devolución:', error);
      alert('Error al eliminar la devolución');
    }
  };

  console.log('🔍 ReturnReceptionView mounted');
  console.log('🔍 clientsMaster received:', clientsMaster);
  console.log('🔍 clientsMaster.length:', clientsMaster?.length || 0);
  console.log('🔍 referencesMaster.length:', referencesMaster?.length || 0);
  console.log('🔍 clientsMaster is array?', Array.isArray(clientsMaster));
  console.log('🔍 First client:', clientsMaster?.[0]);

  const filteredClients = clientsMaster.filter(c => {
    // Check if client is active (handle both boolean and integer from DB)
    const isActive = c.active === true || c.active === 1 || c.active !== false;
    const matchesSearch = !clientSearch || 
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
      c.id.toLowerCase().includes(clientSearch.toLowerCase());
    return isActive && matchesSearch;
  });

  console.log('filteredClients:', filteredClients);
  console.log('clientSearch:', clientSearch);

  const selectClient = (c: Client) => {
    setSelectedClientId(c.id);
    setClientSearch(`${c.id} - ${c.name}`);
    setShowClientResults(false);
  };

  const handleScan = (ref: string, quantity: number) => {
    const refExists = referencesMaster.some(r => r.id === ref);
    if (!refExists) {
      alert(`AVISO: La referencia "${ref}" no existe en el maestro de referencias.`);
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

  const calculateTotalValue = () => {
    return items.reduce((acc, item) => {
      const ref = referencesMaster.find(r => r.id === item.reference);
      return acc + (ref?.price || 0) * item.quantity;
    }, 0);
  };

  const handleSave = async () => {
    if (!selectedClientId) {
      alert("Cliente es obligatorio");
      return;
    }
    if (items.length === 0) {
      alert("Debe agregar al menos un item");
      return;
    }

    const totalValue = calculateTotalValue();

    const data: ReturnReceptionData = {
      id: editingReturn?.id || Math.random().toString(36).substr(2, 9),
      clientId: selectedClientId,
      creditNoteNumber: creditNoteNumber || undefined,
      items,
      totalValue,
      receivedBy: editingReturn?.receivedBy || user.name,
      createdAt: editingReturn?.createdAt || new Date().toISOString()
    };

    if (editingReturn && onUpdateReturnReception) {
      // Actualizar devolución existente
      try {
        const result = await onUpdateReturnReception(editingReturn.id, data);
        if (result?.success) {
          await loadReturnReceptions();
          setIsProcessing(false);
          setEditingReturn(null);
          setSelectedClientId('');
          setClientSearch('');
          setCreditNoteNumber('');
          setItems([]);
          alert('Devolución actualizada exitosamente');
        } else {
          alert('Error al actualizar: ' + (result?.message || 'Error desconocido'));
        }
      } catch (error) {
        console.error('❌ Error actualizando devolución:', error);
        alert('Error de conexión con el servidor');
      }
    } else if (onAddReturnReception) {
      // Crear nueva devolución
      try {
        const result = await onAddReturnReception(data);
        
        if (result.success) {
          console.log('✅ Devolución guardada en BD');
          
          // Reload return receptions from server
          await loadReturnReceptions();
          
          updateState(prev => ({
            ...prev,
            returnReceptions: [...(prev.returnReceptions || []), data]
          }));
          
          setIsProcessing(false);
          setSelectedClientId('');
          setClientSearch('');
          setCreditNoteNumber('');
          setItems([]);
          alert('Devolución registrada exitosamente');
        } else {
          alert('Error al guardar: ' + (result.message || 'Error desconocido'));
        }
      } catch (error) {
        console.error('❌ Error guardando devolución:', error);
        alert('Error de conexión con el servidor');
      }
    } else {
      console.warn('⚠️ onAddReturnReception no está definido');
      
      updateState(prev => ({
        ...prev,
        returnReceptions: [...(prev.returnReceptions || []), data]
      }));
      
      setIsProcessing(false);
      setSelectedClientId('');
      setClientSearch('');
      setCreditNoteNumber('');
      setItems([]);
      alert('Devolución registrada exitosamente');
    }
  };

  const totalUnits = items.reduce((a, b) => a + b.quantity, 0);
  const totalValue = calculateTotalValue();

  if (isProcessing) {
    return (
      <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500 pb-20">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{editingReturn ? 'Editar Devolución' : 'Nueva Devolución'}</h2>
            <p className="text-slate-400 font-bold text-xs sm:text-base">Registro de devoluciones de clientes</p>
          </div>
          <button onClick={() => { setIsProcessing(false); setEditingReturn(null); }} className="px-4 py-2 sm:px-6 sm:py-3 rounded-2xl bg-white text-slate-400 font-bold hover:text-red-500 transition-all border border-slate-100 text-sm">
            Cancelar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-sm border border-slate-100">
          <div className="space-y-4 relative col-span-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest px-4">Buscar Cliente</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={clientSearch}
                  onChange={(e) => { setClientSearch(e.target.value); setShowClientResults(true); if(!e.target.value) setSelectedClientId(''); }}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-pink-500 tracking-widest px-4">Nota Crédito</label>
              <input value={creditNoteNumber} onChange={e => setCreditNoteNumber(e.target.value)} placeholder="Ej: NC-1234" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-pink-100 transition-all font-bold tracking-widest text-slate-900" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-pink-500 tracking-widest px-4">Valor Total</label>
              <div className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-black text-slate-900 text-lg">
                ${totalValue.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <ScannerSimulator onScan={handleScan} label="Escanear Referencia" />

        {items.length > 0 && (
          <div className="bg-white rounded-[32px] sm:rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-black text-slate-700">Resumen de Devolución</h3>
              <div className="px-6 py-2 bg-blue-600 text-white rounded-full font-black text-sm shadow-lg shadow-blue-100 w-fit">
                Total: {totalUnits} unidades
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.reference} className="p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="text-xl sm:text-2xl font-black text-blue-600 tracking-tighter">{item.reference}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-lg sm:text-xl font-black text-slate-800">{item.quantity}</span>
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
          GUARDAR DEVOLUCIÓN
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Devoluciones</h2>
          <p className="text-slate-400 font-medium">Historial de devoluciones de clientes</p>
        </div>
        <button onClick={() => setIsProcessing(true)} className="w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-blue-500 to-pink-500 text-white font-black rounded-[24px] sm:rounded-[28px] shadow-2xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
          <Icons.Reception />
          NUEVA DEVOLUCIÓN
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white p-12 sm:p-24 rounded-[32px] sm:rounded-[48px] border-2 border-dashed border-slate-200 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 sm:w-10 sm:h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </div>
          <p className="text-slate-400 font-bold text-base sm:text-lg italic">
            Cargando devoluciones...
          </p>
        </div>
      ) : returnReceptions.length === 0 ? (
        <div className="bg-white p-12 sm:p-24 rounded-[32px] sm:rounded-[48px] border-2 border-dashed border-slate-200 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 sm:w-10 sm:h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </div>
          <p className="text-slate-400 font-bold text-base sm:text-lg italic">
            Sin devoluciones registradas
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {returnReceptions.map((reception) => {
            const client = clientsMaster.find(c => c.id === reception.clientId);
            const isExpanded = expandedId === reception.id;
            const totalQty = reception.items?.reduce((a: number, b: ItemEntry) => a + b.quantity, 0) || 0;
            
            // Group items by reference
            const itemsByRef = (reception.items || []).reduce((acc: Record<string, number>, curr: ItemEntry) => {
              if (!acc[curr.reference]) acc[curr.reference] = 0;
              acc[curr.reference] += curr.quantity;
              return acc;
            }, {} as Record<string, number>);

            return (
              <div key={reception.id} className="bg-white rounded-[24px] sm:rounded-[32px] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-all">
                <div 
                  className="p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer" 
                  onClick={() => setExpandedId(isExpanded ? null : reception.id)}
                >
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold">{new Date(reception.createdAt).toLocaleString()}</span>
                      {reception.creditNoteNumber && <span className="text-[9px] sm:text-[10px] font-black bg-blue-50 text-blue-500 px-2.5 py-1 rounded-full uppercase tracking-tighter">NC: {reception.creditNoteNumber}</span>}
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
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Recibido por</p>
                      <p className="text-xs font-black text-slate-500">{reception.receivedBy}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-auto md:ml-0">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(reception); }} className="p-2 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-all opacity-100 md:opacity-0 group-hover:opacity-100">
                        <Icons.Edit />
                      </button>
                      {user.role === UserRole.ADMIN && (
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(reception.id); }} className="p-2 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all opacity-100 md:opacity-0 group-hover:opacity-100">
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
                          {client?.seller && <p className="text-[9px] sm:text-[10px] font-black text-blue-500 uppercase tracking-widest">Vendedor: {client?.seller}</p>}
                        </div>
                      </div>
                      <div className="md:text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Auditoría</p>
                        <p className="text-xs sm:text-sm font-bold text-slate-600">Ingresado por: <span className="text-slate-900 font-black">{reception.receivedBy}</span></p>
                        <p className="text-xs sm:text-sm font-bold text-slate-600">Fecha: <span className="text-slate-900 font-black">{new Date(reception.createdAt).toLocaleString()}</span></p>
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
                              const returnItem = reception.items?.find((item: ItemEntry) => item.reference === ref);
                              const masterRef = referencesMaster.find(rm => rm.id === ref);
                              const price = returnItem?.unitPrice || masterRef?.price || 0;
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
                              <td className="px-4 py-4 sm:px-6 sm:py-6 font-black text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-widest text-right">TOTALES DEVOLUCIÓN</td>
                              <td className="px-4 py-4 sm:px-6 sm:py-6 text-center font-black text-slate-900 text-lg sm:text-xl">{totalQty}</td>
                              <td></td>
                              <td className="px-4 py-4 sm:px-6 sm:py-6 text-right font-black text-pink-600 text-xl sm:text-2xl">${reception.totalValue?.toLocaleString() || '0'}</td>
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
        </div>
      )}
    </div>
  );
};

export default ReturnReceptionView;
