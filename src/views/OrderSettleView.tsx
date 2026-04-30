
import React, { useState, useRef } from 'react';
import { Order, ItemEntry, User, Client, AppState } from '../types';
import { Icons } from '../constants';
import api from '../services/api';
import * as XLSX from 'xlsx';
import CorreriaAutocomplete from '../components/shared/CorreriaAutocomplete';
import { useDarkMode } from '../context/DarkModeContext';
import NuevoClienteModal from '../components/NuevoClienteModal';

interface OrderSettleViewProps {
  user: User;
  state: AppState;
  updateState: (fn: (prev: AppState) => AppState) => void;
  onAddClient?: (client: any) => Promise<{ success: boolean }>;
}

interface InvalidReference {
  reference: string;
  reason: string;
}

const OrderSettleView: React.FC<OrderSettleViewProps> = ({ user, state, updateState, onAddClient }) => {
  const { isDark } = useDarkMode();
  
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showClientResults, setShowClientResults] = useState(false);
  const [showNuevoClienteModal, setShowNuevoClienteModal] = useState(false);
  
  const [selectedSellerId, setSelectedSellerId] = useState('');
  const [selectedCorreriaId, setSelectedCorreriaId] = useState('');
  const [correriaSearch, setCorreriaSearch] = useState('');
  const [showCorreriaDropdown, setShowCorreriaDropdown] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | ''>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [porcentajeOficial, setPorcentajeOficial] = useState<number | ''>('');
  const [porcentajeRemision, setPorcentajeRemision] = useState<number | ''>('');
  const [tempItems, setTempItems] = useState<ItemEntry[]>([]);
  const [invalidReferences, setInvalidReferences] = useState<InvalidReference[]>([]);
  const [excelLoaded, setExcelLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredClients = state.clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
    c.id.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const selectClient = (c: Client) => {
    setSelectedClientId(c.id);
    setClientSearch(`${c.id} - ${c.name}`);
    setShowClientResults(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Leer celdas específicas
        const clientCode = String(worksheet['N9']?.v || '').trim();
        const orderNum = worksheet['M4']?.v || '';
        const porcentajeOficialExcel = worksheet['J3']?.v !== undefined ? worksheet['J3'].v : '';
        const porcentajeRemisionExcel = worksheet['K3']?.v !== undefined ? worksheet['K3'].v : '';
        
        // Validar que el cliente existe
        const clientExists = state.clients.find(c => c.id === clientCode);
        if (!clientExists) {
          alert(`❌ Cliente ${clientCode} no existe en la base de datos.\nVerifique el código o ingrese el nuevo cliente.`);
          return;
        }

        // Establecer cliente, número de pedido y porcentajes
        setSelectedClientId(clientCode);
        setClientSearch(`${clientCode} - ${clientExists.name}`);
        setOrderNumber(orderNum ? parseInt(orderNum) : '');
        
        // Establecer porcentajes si existen en el Excel
        if (porcentajeOficialExcel) {
          setPorcentajeOficial(parseFloat(porcentajeOficialExcel));
        }
        if (porcentajeRemisionExcel) {
          setPorcentajeRemision(parseFloat(porcentajeRemisionExcel));
        }

        // Leer items desde fila 20
        const newItems: ItemEntry[] = [];
        const invalidRefs: InvalidReference[] = [];
        let row = 20;
        let emptyRowCount = 0;

        while (emptyRowCount < 2) {
          const cellRef = `B${row}`;
          const cellQty = `L${row}`;
          const cellPrice = `M${row}`;

          const reference = String(worksheet[cellRef]?.v || '').trim();
          const quantity = worksheet[cellQty]?.v;
          const price = worksheet[cellPrice]?.v;

          if (!reference || !quantity || !price) {
            emptyRowCount++;
            row++;
            continue;
          }

          emptyRowCount = 0;

          const refExists = state.references.find(r => r.id === reference);
          if (refExists) {
            newItems.push({
              reference: reference,
              quantity: parseInt(quantity) || 0,
              salePrice: parseFloat(price) || 0
            });
          } else {
            invalidRefs.push({
              reference: reference,
              reason: 'No existe en la base de datos'
            });
          }

          row++;
        }

        setTempItems(newItems);
        setInvalidReferences(invalidRefs);
        setExcelLoaded(true);
      } catch (error) {
        console.error('Error leyendo Excel:', error);
        alert('❌ Error al leer el archivo Excel. Verifique que sea un archivo válido.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSaveOrder = async () => {
    if (!selectedClientId || !selectedSellerId || !selectedCorreriaId) {
      alert("Faltan campos obligatorios (Cliente, Vendedor o Campaña)");
      return;
    }
    if (tempItems.length === 0) {
      alert("No hay ítems cargados");
      return;
    }
    
    // Validar que los porcentajes estén presentes
    if (porcentajeOficial === '' || porcentajeRemision === '') {
      alert("⚠️ Recuerde agregar el porcentaje de facturación (Oficial y Remisión)");
      return;
    }

    const totalValue = tempItems.reduce((acc, item) => {
      return acc + (item.salePrice || 0) * item.quantity;
    }, 0);

    const newOrder: Order = {
      id: Math.random().toString(36).substring(2, 11),
      clientId: selectedClientId,
      sellerId: selectedSellerId,
      correriaId: selectedCorreriaId,
      items: tempItems,
      totalValue,
      createdAt: new Date().toLocaleString(),
      settledBy: user.name,
      orderNumber: orderNumber === '' ? undefined : orderNumber,
      startDate: startDate || null,
      endDate: endDate || null,
      porcentajeOficial: porcentajeOficial === '' ? null : porcentajeOficial,
      porcentajeRemision: porcentajeRemision === '' ? null : porcentajeRemision
    };

    try {
      // Guardar en la base de datos
      const result = await api.createOrder(newOrder);
      
      if (result.success) {
        // Actualizar estado local
        updateState(prev => ({
          ...prev,
          orders: [newOrder, ...prev.orders]
        }));

        alert("✅ Pedido asentado y guardado con éxito");
        setTempItems([]);
        setSelectedClientId('');
        setClientSearch('');
        setSelectedSellerId('');
        setSelectedCorreriaId('');
        setOrderNumber('');
        setStartDate('');
        setEndDate('');
        setPorcentajeOficial('');
        setPorcentajeRemision('');
        setInvalidReferences([]);
        setExcelLoaded(false);
        if(fileInputRef.current) fileInputRef.current.value = '';
      } else {
        alert(`❌ Error al guardar: ${result.message}`);
      }
    } catch (error) {
      console.error('Error guardando pedido:', error);
      alert('❌ Error de conexión al guardar el pedido');
    }
  };

  const totalUnits = tempItems.reduce((a, b) => a + b.quantity, 0);

  return (
    <div className={`space-y-8 pb-20 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-white'}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-3xl font-black tracking-tighter transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Asentar Ventas</h2>
          <p className={`font-medium transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Carga rápida de pedidos por cliente</p>
        </div>
        {onAddClient && (
          <button
            onClick={() => setShowNuevoClienteModal(true)}
            className={`px-6 py-3 rounded-2xl font-bold border text-sm transition-colors duration-300 ${isDark ? 'bg-violet-700/40 text-violet-200 border-violet-600 hover:bg-violet-700/60' : 'bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100'}`}
          >
            Nuevo cliente
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className={`p-8 rounded-[32px] shadow-sm border space-y-6 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
            <h3 className={`text-xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>1. Datos del Pedido</h3>
            
            <div className="space-y-4">
              <div className="space-y-1 relative">
                <label className={`text-[10px] font-black uppercase tracking-widest px-4 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Buscador Cliente</label>
                <input 
                  type="text" 
                  value={clientSearch}
                  onChange={(e) => { setClientSearch(e.target.value); setShowClientResults(true); if(!e.target.value) setSelectedClientId(''); }}
                  onFocus={() => setShowClientResults(true)}
                  placeholder="ID o Nombre..."
                  className={`w-full px-6 py-4 rounded-2xl font-bold transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:ring-4 focus:ring-violet-600 placeholder:text-violet-400' : 'bg-slate-50 border-none text-slate-900 focus:ring-4 focus:ring-blue-100 placeholder:text-slate-400'}`}
                />
                {showClientResults && clientSearch.length > 0 && (
                  <div className={`absolute top-full left-0 w-full mt-2 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'} border`}>
                    {filteredClients.map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => selectClient(c)}
                        className={`w-full text-left px-6 py-4 transition-colors duration-300 ${isDark ? 'hover:bg-[#5a4a75] border-violet-700' : 'hover:bg-slate-50 border-slate-50'} border-b last:border-0`}
                      >
                        <p className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{c.name}</p>
                        <p className={`text-[10px] font-bold transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>ID: {c.id} • {c.city}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className={`text-[10px] font-black uppercase tracking-widest px-4 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Vendedor</label>
                <select 
                  value={selectedSellerId} 
                  onChange={e => setSelectedSellerId(e.target.value)}
                  className={`w-full px-6 py-4 rounded-2xl font-bold transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100' : 'bg-slate-50 border-none text-slate-900'}`}
                >
                  <option value="">-- Seleccionar --</option>
                  {state.sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className={`text-[10px] font-black uppercase tracking-widest px-4 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Campaña</label>
                <CorreriaAutocomplete
                  value={selectedCorreriaId}
                  correrias={state.correrias}
                  onChange={setSelectedCorreriaId}
                  search={correriaSearch}
                  setSearch={setCorreriaSearch}
                  showDropdown={showCorreriaDropdown}
                  setShowDropdown={setShowCorreriaDropdown}
                  placeholder="Buscar campaña..."
                />
              </div>

              <div className="space-y-1">
                <label className={`text-[10px] font-black uppercase tracking-widest px-4 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Número de Pedido</label>
                <input 
                  type="number" 
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="Opcional"
                  className={`w-full px-6 py-4 rounded-2xl font-bold transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:ring-4 focus:ring-violet-600 placeholder:text-violet-400' : 'bg-slate-50 border-none text-slate-900 focus:ring-4 focus:ring-blue-100 placeholder:text-slate-400'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={`text-[10px] font-black uppercase tracking-widest px-4 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Fecha de Inicio</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`w-full px-6 py-4 border-none rounded-2xl font-bold transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] text-violet-100 focus:ring-4 focus:ring-violet-600' : 'bg-slate-50 text-slate-900 focus:ring-4 focus:ring-blue-100'}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-[10px] font-black uppercase tracking-widest px-4 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Fecha de Fin</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`w-full px-6 py-4 border-none rounded-2xl font-bold transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] text-violet-100 focus:ring-4 focus:ring-violet-600' : 'bg-slate-50 text-slate-900 focus:ring-4 focus:ring-blue-100'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={`text-[10px] font-black uppercase tracking-widest px-4 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>% Oficial</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={porcentajeOficial}
                    onChange={(e) => setPorcentajeOficial(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="0.00"
                    className={`w-full px-6 py-4 border-none rounded-2xl font-bold transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] text-violet-100 focus:ring-4 focus:ring-violet-600 placeholder:text-violet-400' : 'bg-slate-50 text-slate-900 focus:ring-4 focus:ring-blue-100 placeholder:text-slate-400'}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-[10px] font-black uppercase tracking-widest px-4 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>% Remisión</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={porcentajeRemision}
                    onChange={(e) => setPorcentajeRemision(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="0.00"
                    className={`w-full px-6 py-4 border-none rounded-2xl font-bold transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] text-violet-100 focus:ring-4 focus:ring-violet-600 placeholder:text-violet-400' : 'bg-slate-50 text-slate-900 focus:ring-4 focus:ring-blue-100 placeholder:text-slate-400'}`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`p-8 rounded-[32px] shadow-sm border space-y-6 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
            <h3 className={`text-xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>2. Adjuntar Pedido</h3>
            <p className={`text-[10px] font-bold leading-relaxed px-2 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>
              Carga un archivo Excel con formato estándar.<br/>
              Se extrae automáticamente: Cliente (N9), Número de pedido (M4) e Items desde fila 20.
            </p>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.xls" className="hidden" />
            <div className="flex gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 py-4 font-black rounded-2xl border-2 border-dashed transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] text-violet-300 border-violet-600 hover:bg-[#5a4a75]' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-blue-50'}`}
              >
                CARGAR EXCEL
              </button>
              <a href="/ejemplo_pedidos.xlsx" download className={`flex-1 py-4 font-black rounded-2xl border-2 transition-colors duration-300 text-center ${isDark ? 'bg-violet-900/30 text-violet-300 border-violet-600 hover:bg-violet-900/50' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'}`}>
                DESCARGAR EJEMPLO
              </a>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className={`rounded-[32px] shadow-sm overflow-hidden h-full flex flex-col transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'} border`}>
            <div className={`p-6 flex items-center justify-between transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-700' : 'bg-slate-50 border-slate-100'} border-b`}>
              <h3 className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-700'}`}>Vista Previa</h3>
              {tempItems.length > 0 && (
                <div className="flex gap-4">
                  <span className={`text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Refs: {tempItems.length}</span>
                  <span className={`text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-blue-500'}`}>Total Unid: {totalUnits}</span>
                  <span className={`text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-green-400' : 'text-green-600'}`}>Total Valor: ${tempItems.reduce((acc, item) => acc + (item.salePrice || 0) * item.quantity, 0).toLocaleString()}</span>
                </div>
              )}
            </div>
            
            <div className={`flex-1 overflow-y-auto custom-scrollbar transition-colors duration-300`}>
              {tempItems.length === 0 ? (
                <div className={`h-full flex flex-col items-center justify-center p-20 text-center space-y-4 transition-colors duration-300`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-slate-200 transition-colors duration-300 ${isDark ? 'bg-[#5a4a75]' : 'bg-slate-50'}`}>
                    <Icons.Settle />
                  </div>
                  <p className={`font-bold italic transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-300'}`}>Carga un archivo Excel para ver los detalles aquí</p>
                </div>
              ) : (
                <>
                  {invalidReferences.length > 0 && (
                    <div className={`p-6 border-b transition-colors duration-300 ${isDark ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
                      <h4 className={`font-black text-sm mb-3 transition-colors duration-300 ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>⚠️ Referencias No Encontradas</h4>
                      <div className="space-y-2">
                        {invalidReferences.map((ref, idx) => (
                          <p key={idx} className={`text-[10px] font-bold transition-colors duration-300 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                            • {ref.reference} ({ref.reason})
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  <table className="w-full text-left text-xs">
                    <thead className={`sticky top-0 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}>
                      <tr className={`border-b transition-colors duration-300 ${isDark ? 'border-violet-600 bg-[#5a4a75]/30' : 'border-slate-200 bg-slate-50/30'}`}>
                        <th className={`px-8 py-4 font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Referencia</th>
                        <th className={`px-8 py-4 font-black uppercase text-center transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Cantidad</th>
                        <th className={`px-8 py-4 font-black uppercase text-right transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Precio Venta</th>
                        <th className={`px-8 py-4 font-black uppercase text-right transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Subtotal</th>
                        <th className={`px-4 py-4 font-black uppercase text-right border-l-2 transition-colors duration-300 ${isDark ? 'text-violet-300 border-violet-600' : 'text-slate-400 border-slate-300'}`}>Precio Lista</th>
                        <th className={`px-4 py-4 font-black uppercase text-right transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Diferencia</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y transition-colors duration-300 ${isDark ? 'divide-violet-700' : 'divide-slate-200'}`}>
                      {tempItems.map((item, idx) => {
                        const ref = state.references.find(r => r.id === item.reference);
                        const subtotal = (item.salePrice || 0) * item.quantity;
                        const precioLista = ref?.price || 0;
                        const diferencia = (item.salePrice || 0) - precioLista;

                        let difBg = 'bg-slate-100 text-slate-500'; // = 0
                        if (diferencia > 0) difBg = 'bg-green-100 text-green-700';
                        else if (diferencia < 0 && diferencia >= -1900) difBg = 'bg-yellow-100 text-yellow-700';
                        else if (diferencia < -1900) difBg = 'bg-red-100 text-red-700';

                        return (
                          <tr key={idx} className={`transition-colors duration-300 ${isDark ? 'hover:bg-violet-700/20' : 'hover:bg-slate-50/50'}`}>
                            <td className="px-8 py-4">
                              <p className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{item.reference}</p>
                              <p className={`text-[9px] font-bold uppercase transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>{ref?.description}</p>
                            </td>
                            <td className={`px-8 py-4 text-center font-black transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{item.quantity}</td>
                            <td className={`px-8 py-4 text-right font-bold transition-colors duration-300 ${isDark ? 'text-pink-300' : 'text-slate-600'}`}>${(item.salePrice || 0).toLocaleString()}</td>
                            <td className={`px-8 py-4 text-right font-bold transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>${subtotal.toLocaleString()}</td>
                            <td className={`px-4 py-4 text-right font-bold border-l-2 transition-colors duration-300 ${isDark ? 'text-green-300 border-violet-600' : 'text-slate-600 border-slate-300'}`}>
                              ${Math.round(precioLista).toLocaleString()}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <span className={`inline-block px-2 py-1 rounded-lg font-black text-xs ${difBg}`}>
                                {diferencia === 0 ? '—' : `${diferencia > 0 ? '+' : ''}$${diferencia.toLocaleString()}`}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      <tr className={`border-t-2 font-black transition-colors duration-300 ${isDark ? 'bg-[#5a4a75]/30 border-violet-600' : 'bg-slate-50 border-slate-200'}`}>
                        <td colSpan={2} className={`px-8 py-4 text-right transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-700'}`}>TOTALES:</td>
                        <td className={`px-8 py-4 text-right transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-700'}`}>{tempItems.length} refs</td>
                        <td className={`px-8 py-4 text-right transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>${tempItems.reduce((acc, item) => acc + (item.salePrice || 0) * item.quantity, 0).toLocaleString()}</td>
                        <td colSpan={2} className={`border-l-2 transition-colors duration-300 ${isDark ? 'border-violet-600' : 'border-slate-300'}`}></td>
                      </tr>
                    </tbody>
                  </table>
                </>
              )}
            </div>

            <div className={`p-8 border-t transition-colors duration-300 ${isDark ? 'bg-[#5a4a75]/30 border-violet-700' : 'bg-white'}`}>
              <button 
                onClick={handleSaveOrder}
                disabled={tempItems.length === 0}
                className={`w-full py-5 text-white font-black text-xl rounded-3xl shadow-xl hover:scale-[1.01] transition-all transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-violet-600 to-pink-600 disabled:opacity-50' : 'bg-gradient-to-r from-blue-600 to-pink-600 disabled:opacity-50'}`}
              >
                ASENTAR VENTA
              </button>
            </div>
          </div>
        </div>
      </div>

      {showNuevoClienteModal && onAddClient && (
        <NuevoClienteModal
          sellers={state.sellers}
          onClose={() => setShowNuevoClienteModal(false)}
          onSave={async (client) => {
            const result = await onAddClient(client);
            if (result.success) {
              // Auto-seleccionar el cliente recién creado
              setSelectedClientId(client.id);
              setClientSearch(`${client.id} - ${client.name}`);
              setShowNuevoClienteModal(false);
            }
            return result;
          }}
        />
      )}
    </div>
  );
};

export default OrderSettleView;
