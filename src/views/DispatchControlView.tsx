import React, { useState, useMemo } from 'react';
import { AppState, User } from '../types';
import { useDarkMode } from '../context/DarkModeContext';

interface DispatchControlViewProps {
  state: AppState;
  user: User;
}

const DispatchControlView: React.FC<DispatchControlViewProps> = ({ state, user }) => {
  const { isDark } = useDarkMode();
  const [selectedCorreriaId, setSelectedCorreriaId] = useState(state.correrias[0]?.id || '');
  const [selectedReference, setSelectedReference] = useState('');

  // Estados para autocompletado
  const [correriaSearch, setCorreriaSearch] = useState('');
  const [referenceSearch, setReferenceSearch] = useState('');
  const [showCorreriaDropdown, setShowCorreriaDropdown] = useState(false);
  const [showReferenceDropdown, setShowReferenceDropdown] = useState(false);

    // Filtrar correrías según búsqueda
  const filteredCorrerias = state.correrias.filter(c => 
    `${c.name} ${c.year}`.toLowerCase().includes(correriaSearch.toLowerCase())
  );

  // Filtrar referencias según búsqueda
  const filteredReferences = state.references.filter(r => 
    r.id.toLowerCase().includes(referenceSearch.toLowerCase())
  );

  // Función para seleccionar correría
  const selectCorreria = (correria: any) => {
    setSelectedCorreriaId(correria.id);
    setCorreriaSearch(`${correria.name} ${correria.year}`);
    setShowCorreriaDropdown(false);
    setSelectedReference('');
    setReferenceSearch('');
  };

  // Función para seleccionar referencia
  const selectReference = (reference: any) => {
    setSelectedReference(reference.id);
    setReferenceSearch(reference.id);
    setShowReferenceDropdown(false);
  };

  // Cerrar dropdowns al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Buscar si el click está dentro de algún contenedor de dropdown
      const isClickInsideDropdown = target.closest('[data-dropdown-container]');
      
      if (!isClickInsideDropdown) {
        setShowCorreriaDropdown(false);
        setShowReferenceDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calcular datos del reporte
  const reportData = useMemo(() => {
    if (!selectedCorreriaId || !selectedReference) return null;

    // Obtener todos los pedidos de esta correría para esta referencia
    const ordersForRef = state.orders.filter(
      o => o.correriaId === selectedCorreriaId && 
           o.items.some(item => item.reference === selectedReference)
    );

    // Obtener datos de la referencia
    const reference = state.references.find(r => r.id === selectedReference);
    const price = reference?.price || 0;

    // Agrupar por cliente
    const clientData = ordersForRef.map(order => {
      const client = state.clients.find(c => c.id === order.clientId);
      
      // Cantidad vendida de esta referencia en este pedido
      const orderItems = order.items.filter(item => item.reference === selectedReference);
      const totalSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);
      
      // Obtener el salePrice del pedido para esta referencia
      const salePrice = orderItems[0]?.salePrice || reference?.price || 0;

      // Cantidad despachada de esta referencia para este cliente en esta correría
      const clientDispatches = state.dispatches.filter(
        d => d.clientId === order.clientId && d.correriaId === selectedCorreriaId
      );
      
      const totalDispatched = clientDispatches.reduce((sum, dispatch) => {
        const dispatchItems = dispatch.items.filter(item => item.reference === selectedReference);
        return sum + dispatchItems.reduce((s, item) => s + item.quantity, 0);
      }, 0);

      // Obtener números de factura y remisión (del último despacho que contenga esta referencia específica)
      const lastDispatchWithReference = clientDispatches
        .filter(dispatch => dispatch.items.some(item => item.reference === selectedReference))
        .slice(-1)[0];

      // Obtener vendedor del cliente
      const seller = state.sellers.find(s => s.id === client?.sellerId)?.name || '-';

      return {
        clientId: order.clientId,
        clientName: client?.name || 'Cliente Desconocido',
        clientCode: client?.id || '',
        clientAddress: client?.address || '',
        seller,
        totalSold,
        totalDispatched,
        price: salePrice,
        invoiceNo: lastDispatchWithReference?.invoiceNo || '-',
        remissionNo: lastDispatchWithReference?.remissionNo || '-',
        orderNumber: order.orderNumber ?? null,
      };
    });

    // Ordenar por número de pedido de menor a mayor (sin número al final)
    const filteredData = clientData.sort((a, b) => {
      if (a.orderNumber == null && b.orderNumber == null) return 0;
      if (a.orderNumber == null) return 1;
      if (b.orderNumber == null) return -1;
      return a.orderNumber - b.orderNumber;
    });

    // Calcular totales
    const totalVendidas = filteredData.reduce((sum, c) => sum + c.totalSold, 0);
    const totalDespachadas = filteredData.reduce((sum, c) => sum + c.totalDispatched, 0);

    // Stock (inventario actual de esta referencia)
    const received = state.receptions
      .filter(r => r.affectsInventory !== false)
      .reduce((acc, r) => 
        acc + r.items.filter(i => i.reference === selectedReference).reduce((a, b) => a + b.quantity, 0), 0
      );
    const allDispatched = state.dispatches.reduce((acc, d) => 
      acc + d.items.filter(i => i.reference === selectedReference).reduce((a, b) => a + b.quantity, 0), 0
    );
    const stock = received - allDispatched;

    // Production tracking
    const production = state.productionTracking.find(
      p => p.refId === selectedReference && p.correriaId === selectedCorreriaId
    ) || { programmed: 0, cut: 0, inventory: 0 };

    const pending = totalVendidas - production.cut - ((production as any).inventory || 0) - production.programmed;
    const faltanDespachar = totalVendidas - totalDespachadas;

    return {
      clients: filteredData,
      totals: {
        totalVendidas,
        stock,
        cortadas: production.cut,
        programadas: production.programmed,
        inventario: (production as any).inventory || 0,
        pendiente: pending,
        faltanDespachar,
        totalDespachadas,
      },
      reference,
    };
  }, [selectedCorreriaId, selectedReference, state]);

  return (
    <div className={`space-y-6 pb-20 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : ''}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className={`text-3xl font-black tracking-tighter leading-none transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>
            Control de bodega para despachos
          </h2>
          <p className={`font-bold text-xs mt-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>
            Auxiliar de inventario y ventas para despacho de mercancía
          </p>
        </div>

        {/* Filtros */}
        <div className={`flex flex-wrap gap-3 p-3 rounded-3xl border shadow-sm items-center transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
          {/* CORRERÍA CON AUTOCOMPLETADO */}
          <div className="flex flex-col relative" data-dropdown-container>
            <span className={`text-[8px] font-black uppercase ml-2 mb-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>Correría</span>
            <input
              type="text"
              value={correriaSearch}
              onChange={(e) => {
                setCorreriaSearch(e.target.value);
                setShowCorreriaDropdown(true);
              }}
              onFocus={() => { setCorreriaSearch(''); setShowCorreriaDropdown(false); }}
              placeholder="Escriba 2 letras..."
              className={`px-3 py-1.5 rounded-xl text-xs font-bold w-48 border-none focus:ring-2 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] text-violet-100 placeholder:text-violet-400 focus:ring-violet-600' : 'bg-slate-50 text-slate-800 placeholder:text-slate-300 focus:ring-blue-100'}`}
            />
            
            {/* Dropdown de correrías */}
            {showCorreriaDropdown && correriaSearch.length >= 2 && filteredCorrerias.length > 0 && (
              <div className={`absolute top-full left-0 mt-1 w-full rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'} border`}>
                {filteredCorrerias.map(c => (
                  <button
                    key={c.id}
                    onClick={() => selectCorreria(c)}
                    className={`w-full px-3 py-2 text-left text-xs font-bold transition-colors border-b last:border-b-0 ${isDark ? 'text-violet-100 hover:bg-[#5a4a75] border-violet-700' : 'text-slate-800 hover:bg-blue-50 border-slate-100'}`}
                  >
                    <span>{c.name}</span>
                    <span className={`ml-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>{c.year}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* REFERENCIA CON AUTOCOMPLETADO */}
          <div className="flex flex-col relative" data-dropdown-container>
            <span className={`text-[8px] font-black uppercase ml-2 mb-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>Referencia</span>
            <input
              type="text"
              value={referenceSearch}
              onChange={(e) => {
                setReferenceSearch(e.target.value);
                setShowReferenceDropdown(true);
              }}
              onFocus={() => { setReferenceSearch(''); setShowReferenceDropdown(true); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const match = state.references.find(r => r.id.toLowerCase() === referenceSearch.toLowerCase().trim());
                  if (match) selectReference(match);
                }
              }}
              placeholder="Buscar referencia..."
              disabled={!selectedCorreriaId}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold w-48 border-none focus:ring-2 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] text-violet-100 placeholder:text-violet-400 focus:ring-violet-600 disabled:opacity-50 disabled:cursor-not-allowed' : 'bg-slate-50 text-slate-800 placeholder:text-slate-300 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed'}`}
            />
            
            {/* Dropdown de referencias */}
            {showReferenceDropdown && referenceSearch.length >= 3 && filteredReferences.length > 0 && selectedCorreriaId && (
              <div className={`absolute top-full left-0 mt-1 w-full rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'} border`}>
                {filteredReferences.map(r => (
                  <button
                    key={r.id}
                    onClick={() => selectReference(r)}
                    className={`w-full px-3 py-2 text-left text-xs transition-colors border-b last:border-b-0 ${isDark ? 'text-violet-100 hover:bg-[#5a4a75] border-violet-700' : 'text-slate-800 hover:bg-blue-50 border-slate-100'}`}
                  >
                    <span className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-blue-600'}`}>{r.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>


        </div>
      </div>

      {/* Contenido */}
      {!selectedCorreriaId || !selectedReference ? (
        <div className={`p-24 rounded-[48px] border-2 border-dashed flex flex-col items-center text-center transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] text-violet-400' : 'bg-slate-100 text-slate-300'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
            </svg>
          </div>
          <p className={`font-bold text-lg transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Seleccione una correría y una referencia</p>
          <p className={`font-bold text-sm mt-2 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-300'}`}>para ver el reporte de despachos</p>
        </div>
      ) : !reportData ? (
        <div className={`p-24 rounded-[48px] border-2 border-dashed flex flex-col items-center text-center transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'}`}>
          <p className={`font-bold text-lg transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>No hay datos para mostrar</p>
        </div>
      ) : (
        <>
          {/* Cards de métricas */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard label="Total Vendidas" value={reportData.totals.totalVendidas} color="slate" />
            <MetricCard label="Inventario" value={reportData.totals.inventario} color="blue" />
            <MetricCard label="Cortadas" value={reportData.totals.cortadas} color="purple" />
            <MetricCard label="Programadas" value={reportData.totals.programadas} color="indigo" />
            <MetricCard label="Pendiente" value={reportData.totals.pendiente} color={reportData.totals.pendiente < 0 ? 'green' : 'orange'} />
            <MetricCard label="Faltan Despachar" value={reportData.totals.faltanDespachar} color="red" highlight />
          </div>

          {/* Información de la referencia */}
          {reportData.reference && (
            <div className={`p-4 rounded-2xl border transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-violet-900/40 to-indigo-900/40 border-violet-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Referencia seleccionada</p>
                  <p className={`font-black text-lg transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>{reportData.reference.id}</p>
                  <p className={`text-xs font-bold transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>{reportData.reference.description}</p>
                </div>
                <div className="text-right">
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Precio</p>
                  <p className={`font-black text-xl transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-blue-600'}`}>$ {Math.round(reportData.reference.price).toLocaleString('es-CO')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabla de clientes */}
          <div className={`rounded-[32px] shadow-sm border overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs min-w-[1000px]">
                <thead className={`transition-colors duration-300 ${isDark ? 'bg-[#5a4a75]' : 'bg-slate-50'}`}>
                  <tr className={`border-b transition-colors duration-300 ${isDark ? 'border-violet-700' : 'border-slate-100'}`}>
                    <th className={`px-3 py-4 font-black uppercase w-10 text-center transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>N°</th>
                    <th className={`px-4 py-4 font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Código / Cliente / Dirección</th>
                    <th className={`px-2 py-4 font-black uppercase text-center transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-blue-800'}`}>Cant. Vendida</th>
                    <th className={`px-2 py-4 font-black uppercase text-center transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Precio</th>
                    <th className={`px-2 py-4 font-black uppercase text-center transition-colors duration-300 ${isDark ? 'text-green-300' : 'text-green-700'}`}>Und Despachadas</th>
                    <th className={`px-2 py-4 font-black uppercase text-center transition-colors duration-300 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>FV / Oficial</th>
                    <th className={`px-2 py-4 font-black uppercase text-center transition-colors duration-300 ${isDark ? 'text-pink-300' : 'text-pink-700'}`}>Remi / ML</th>
                    <th className={`px-2 py-4 font-black uppercase text-center transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Vendedor</th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors duration-300 ${isDark ? 'divide-violet-700' : 'divide-slate-50'}`}>
                  {reportData.clients.length === 0 ? (
                    <tr>
                      <td colSpan={8} className={`px-4 py-12 text-center font-bold transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>
                        No hay clientes con pedidos para esta referencia
                      </td>
                    </tr>
                  ) : (
                    reportData.clients.map((client, idx) => (
                      <tr key={`${client.clientId}-${idx}`} className={`transition-colors ${isDark ? 'hover:bg-[#5a4a75]/30' : 'hover:bg-slate-50/50'}`}>
                        <td className={`px-3 py-4 text-center font-black text-xs w-10 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>
                          {client.orderNumber ?? '-'}
                        </td>
                        <td className="px-4 py-4">
                          <p className={`font-black text-xs leading-tight transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{client.clientName}</p>
                          <p className={`text-[10px] font-bold truncate transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>{client.clientAddress} • <span className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-blue-600'}`}>{client.clientCode}</span></p>
                        </td>
                        <td className="px-2 py-4 text-center">
                          <span className={`px-2 py-1 rounded-md font-black ${client.totalSold > 0 ? 'bg-blue-600 text-white shadow-sm' : isDark ? 'bg-[#5a4a75] text-violet-300' : 'bg-slate-100 text-slate-400'}`}>
                            {client.totalSold}
                          </span>
                        </td>
                        <td className={`px-2 py-4 text-center font-bold transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-600'}`}>
                          ${Math.round(client.price).toLocaleString()}
                        </td>
                        <td className="px-2 py-4 text-center">
                          <span className={`px-2 py-1 rounded-md font-black ${client.totalDispatched > 0 ? 'bg-green-600 text-white shadow-sm' : isDark ? 'bg-[#5a4a75] text-violet-300' : 'bg-slate-100 text-slate-400'}`}>
                            {client.totalDispatched}
                          </span>
                        </td>
                        <td className={`px-2 py-4 text-center font-bold transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-600'}`}>{client.invoiceNo}</td>
                        <td className={`px-2 py-4 text-center font-bold uppercase text-[10px] transition-colors duration-300 ${isDark ? 'text-pink-300' : 'text-pink-600'}`}>{client.remissionNo}</td>
                        <td className={`px-2 py-4 text-center font-bold uppercase text-[10px] transition-colors duration-300 ${isDark ? 'text-pink-300' : 'text-pink-600'}`}>
                          {client.seller}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {reportData.clients.length > 0 && (
                  <tfoot className={`border-t-2 transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-700' : 'bg-slate-50 border-slate-200'}`}>
                    <tr>
                      <td className={`px-4 py-4 font-black uppercase text-xs transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Totales</td>
                      <td className={`px-2 py-4 text-center font-black text-xs transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>
                        TOTAL CLIENTES: <span className={`text-base transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-blue-800'}`}>{reportData.clients.length}</span>
                      </td>
                      <td className={`px-2 py-4 text-center font-black text-base transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-blue-800'}`}>
                        {reportData.totals.totalVendidas}
                      </td>
                      <td className={`px-2 py-4 text-center font-black transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>—</td>
                      <td className={`px-2 py-4 text-center font-black text-base transition-colors duration-300 ${isDark ? 'bg-red-900/40 text-red-300' : 'bg-red-50 text-red-600'}`}>
                        {reportData.totals.totalDespachadas}
                      </td>
                      <td colSpan={3} className="px-2 py-4 text-center">
                        <div className="inline-flex gap-2">
                          <div className={`text-white px-4 py-2 rounded-xl font-black text-xs transition-colors duration-300 ${isDark ? 'bg-violet-600' : 'bg-blue-600'}`}>
                            FALTAN: {reportData.totals.faltanDespachar} UNIDADES
                          </div>
                          <div className={`text-white px-4 py-2 rounded-xl font-black text-xs transition-colors duration-300 ${isDark ? 'bg-violet-700' : 'bg-slate-600'}`}>
                            STOCK: {reportData.totals.stock}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Componente auxiliar para las tarjetas de métricas
const MetricCard: React.FC<{ label: string; value: number; color: string; highlight?: boolean }> = ({ 
  label, 
  value, 
  color, 
  highlight = false 
}) => {
  const { isDark } = useDarkMode();

  const colorClasses = {
    slate: isDark ? 'text-violet-200' : 'text-slate-700',
    blue: isDark ? 'text-violet-300' : 'text-blue-600',
    purple: isDark ? 'text-purple-300' : 'text-purple-600',
    indigo: isDark ? 'text-indigo-300' : 'text-indigo-600',
    orange: isDark ? 'text-orange-300' : 'text-orange-600',
    red: isDark ? 'text-red-300' : 'text-red-600',
    green: isDark ? 'text-green-300' : 'text-green-600',
  }[color] || (isDark ? 'text-violet-200' : 'text-slate-700');

  const bgClasses = highlight 
    ? isDark 
      ? 'bg-gradient-to-br from-violet-600 to-violet-700 shadow-lg shadow-violet-900/50' 
      : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-200'
    : isDark
    ? 'bg-[#4a3a63]'
    : 'bg-white';
  
  const textClasses = highlight ? 'text-white' : '';
  const labelClasses = highlight 
    ? isDark 
      ? 'text-violet-200' 
      : 'text-blue-100'
    : isDark
    ? 'text-violet-400'
    : 'text-slate-400';
  
  const borderClasses = highlight 
    ? isDark 
      ? 'border-violet-600' 
      : 'border-blue-400'
    : isDark
    ? 'border-violet-700'
    : 'border-slate-100';

  return (
    <div className={`${bgClasses} p-4 rounded-2xl border ${borderClasses} transition-all hover:scale-105 duration-300`}>
      <p className={`text-[9px] font-black ${labelClasses} uppercase tracking-widest mb-2 transition-colors duration-300`}>{label}</p>
      <p className={`font-black text-2xl text-center ${textClasses || colorClasses} transition-colors duration-300`}>{value}</p>
    </div>
  );
};

export default DispatchControlView;