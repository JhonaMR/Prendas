import React, { useState } from 'react';
import { User, AppState, ItemEntry, Client, Reference } from '../types';
import ScannerSimulator from '../components/ScannerSimulator';
import { Icons } from '../constants';

interface ReturnReceptionViewProps {
  user: User;
  updateState: (updater: (prev: AppState) => AppState) => void;
  clientsMaster: Client[];
  referencesMaster: Reference[];
  onAddReturnReception?: (reception: any) => Promise<any>;
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
  onAddReturnReception 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showClientResults, setShowClientResults] = useState(false);
  const [creditNoteNumber, setCreditNoteNumber] = useState('');
  const [items, setItems] = useState<ItemEntry[]>([]);

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
      id: Math.random().toString(36).substr(2, 9),
      clientId: selectedClientId,
      creditNoteNumber: creditNoteNumber || undefined,
      items,
      totalValue,
      receivedBy: user.name,
      createdAt: new Date().toISOString()
    };

    if (onAddReturnReception) {
      try {
        const result = await onAddReturnReception(data);
        
        if (result.success) {
          console.log('✅ Devolución guardada en BD');
          
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
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Devolución de Mercancía</h2>
            <p className="text-slate-400 font-bold text-xs sm:text-base">Registro de devoluciones de clientes</p>
          </div>
          <button onClick={() => setIsProcessing(false)} className="px-4 py-2 sm:px-6 sm:py-3 rounded-2xl bg-white text-slate-400 font-bold hover:text-red-500 transition-all border border-slate-100 text-sm">
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
    </div>
  );
};

export default ReturnReceptionView;
