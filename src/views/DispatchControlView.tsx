import React, { useState, useMemo } from 'react';
import { AppState, User } from '../types';

interface DispatchControlViewProps {
  state: AppState;
  user: User;
}

const DispatchControlView: React.FC<DispatchControlViewProps> = ({ state, user }) => {
  const [selectedCorreriaId, setSelectedCorreriaId] = useState(state.correrias[0]?.id || '');
  const [selectedReference, setSelectedReference] = useState('');
  const [hideZeroSales, setHideZeroSales] = useState(false);

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
    r.id.toLowerCase().includes(referenceSearch.toLowerCase()) ||
    r.description.toLowerCase().includes(referenceSearch.toLowerCase())
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
    setReferenceSearch(`${reference.id} - ${reference.description}`);
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

      // Cantidad despachada de esta referencia para este cliente en esta correría
      const clientDispatches = state.dispatches.filter(
        d => d.clientId === order.clientId && d.correriaId === selectedCorreriaId
      );
      
      const totalDispatched = clientDispatches.reduce((sum, dispatch) => {
        const dispatchItems = dispatch.items.filter(item => item.reference === selectedReference);
        return sum + dispatchItems.reduce((s, item) => s + item.quantity, 0);
      }, 0);

      // Obtener números de factura y remisión (del último despacho)
      const lastDispatch = clientDispatches[clientDispatches.length - 1];

      return {
        clientId: order.clientId,
        clientName: client?.name || 'Cliente Desconocido',
        clientAddress: client?.address || '',
        seller: state.sellers.find(s => s.id === order.sellerId)?.name || client?.seller || '-',
        totalSold,
        totalDispatched,
        price,
        invoiceNo: lastDispatch?.invoiceNo || '-',
        remissionNo: lastDispatch?.remissionNo || '-',
      };
    });

    // Filtrar vendidas en 0 si está activo
    const filteredData = hideZeroSales 
      ? clientData.filter(c => c.totalSold > 0)
      : clientData;

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
    ) || { programmed: 0, cut: 0 };

    const pending = Math.max(0, totalVendidas - production.cut);
    const faltanDespachar = totalVendidas - totalDespachadas;

    return {
      clients: filteredData,
      totals: {
        totalVendidas,
        stock,
        cortadas: production.cut,
        programadas: production.programmed,
        pendiente: pending,
        faltanDespachar,
        totalDespachadas,
      },
      reference,
    };
  }, [selectedCorreriaId, selectedReference, state, hideZeroSales]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">
            Control de bodega para despachos
          </h2>
          <p className="text-slate-500 font-bold text-xs mt-1">
            Auxiliar de inventario y ventas para despacho de mercancía
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 bg-white p-3 rounded-3xl border border-slate-100 shadow-sm items-center">
          {/* CORRERÍA CON AUTOCOMPLETADO */}
          <div className="flex flex-col relative" data-dropdown-container>
            <span className="text-[8px] font-black text-slate-600 uppercase ml-2 mb-1">Correría</span>
            <input
              type="text"
              value={correriaSearch}
              onChange={(e) => {
                setCorreriaSearch(e.target.value);
                setShowCorreriaDropdown(true);
              }}
              onFocus={() => setShowCorreriaDropdown(true)}
              placeholder="Buscar correría..."
              className="px-3 py-1.5 bg-slate-50 rounded-xl text-xs font-bold w-48 border-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300"
            />
            
            {/* Dropdown de correrías */}
            {showCorreriaDropdown && filteredCorrerias.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                {filteredCorrerias.map(c => (
                  <button
                    key={c.id}
                    onClick={() => selectCorreria(c)}
                    className="w-full px-3 py-2 text-left text-xs font-bold hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0"
                  >
                    <span className="text-slate-800">{c.name}</span>
                    <span className="text-slate-400 ml-1">{c.year}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* REFERENCIA CON AUTOCOMPLETADO */}
          <div className="flex flex-col relative" data-dropdown-container>
            <span className="text-[8px] font-black text-slate-600 uppercase ml-2 mb-1">Referencia</span>
            <input
              type="text"
              value={referenceSearch}
              onChange={(e) => {
                setReferenceSearch(e.target.value);
                setShowReferenceDropdown(true);
              }}
              onFocus={() => setShowReferenceDropdown(true)}
              placeholder="Buscar referencia..."
              disabled={!selectedCorreriaId}
              className="px-3 py-1.5 bg-slate-50 rounded-xl text-xs font-bold w-48 border-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            
            {/* Dropdown de referencias */}
            {showReferenceDropdown && filteredReferences.length > 0 && selectedCorreriaId && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                {filteredReferences.map(r => (
                  <button
                    key={r.id}
                    onClick={() => selectReference(r)}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0"
                  >
                    <span className="font-black text-blue-600">{r.id}</span>
                    <span className="text-slate-500 ml-2 text-[10px]">{r.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-l border-slate-100 pl-3 h-10 mt-2">
            <input
              type="checkbox"
              checked={hideZeroSales}
              onChange={(e) => setHideZeroSales(e.target.checked)}
              id="hideZero"
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="hideZero" className="text-[10px] font-black text-slate-600 uppercase cursor-pointer">
              Filtrar vendidas en 0
            </label>
          </div>
        </div>
      </div>

      {/* Contenido */}
      {!selectedCorreriaId || !selectedReference ? (
        <div className="bg-white p-24 rounded-[48px] border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
            </svg>
          </div>
          <p className="text-slate-400 font-bold text-lg">Seleccione una correría y una referencia</p>
          <p className="text-slate-300 font-bold text-sm mt-2">para ver el reporte de despachos</p>
        </div>
      ) : !reportData ? (
        <div className="bg-white p-24 rounded-[48px] border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
          <p className="text-slate-400 font-bold text-lg">No hay datos para mostrar</p>
        </div>
      ) : (
        <>
          {/* Cards de métricas */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard label="Total Vendidas" value={reportData.totals.totalVendidas} color="slate" />
            <MetricCard label="Stock" value={reportData.totals.stock} color="blue" />
            <MetricCard label="Cortadas" value={reportData.totals.cortadas} color="purple" />
            <MetricCard label="Programadas" value={reportData.totals.programadas} color="indigo" />
            <MetricCard label="Pendiente" value={reportData.totals.pendiente} color="orange" />
            <MetricCard label="Faltan Despachar" value={reportData.totals.faltanDespachar} color="red" highlight />
          </div>

          {/* Información de la referencia */}
          {reportData.reference && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Referencia seleccionada</p>
                  <p className="font-black text-slate-900 text-lg">{reportData.reference.id}</p>
                  <p className="text-xs font-bold text-slate-500">{reportData.reference.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Precio</p>
                  <p className="font-black text-blue-600 text-xl">${reportData.reference.price.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabla de clientes */}
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-[10px] min-w-[1000px]">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-4 font-black uppercase text-slate-700">Cliente / Dirección</th>
                    <th className="px-2 py-4 font-black uppercase text-center text-blue-800">Referencia</th>
                    <th className="px-2 py-4 font-black uppercase text-center text-slate-700">Precio</th>
                    <th className="px-2 py-4 font-black uppercase text-center text-green-700">Und Despachadas</th>
                    <th className="px-2 py-4 font-black uppercase text-center text-indigo-700">FV / Oficial</th>
                    <th className="px-2 py-4 font-black uppercase text-center text-pink-700">Remi / ML</th>
                    <th className="px-2 py-4 font-black uppercase text-center text-slate-700">Vendedor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reportData.clients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-400 font-bold">
                        No hay clientes con pedidos para esta referencia
                      </td>
                    </tr>
                  ) : (
                    reportData.clients.map((client, idx) => (
                      <tr key={`${client.clientId}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-black text-slate-800 text-[11px] leading-tight">{client.clientName}</p>
                          <p className="text-[8px] font-bold text-slate-500 truncate">{client.clientAddress}</p>
                        </td>
                        <td className="px-2 py-3 text-center">
                          <span className={`px-2 py-1 rounded-md font-black ${client.totalSold > 0 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}>
                            {client.totalSold}
                          </span>
                        </td>
                        <td className="px-2 py-3 text-center font-bold text-slate-600">
                          ${client.price.toLocaleString()}
                        </td>
                        <td className="px-2 py-3 text-center">
                          <span className={`px-2 py-1 rounded-md font-black ${client.totalDispatched > 0 ? 'bg-green-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}>
                            {client.totalDispatched}
                          </span>
                        </td>
                        <td className="px-2 py-3 text-center font-bold text-slate-600">{client.invoiceNo}</td>
                        <td className="px-2 py-3 text-center font-bold text-slate-600">{client.remissionNo}</td>
                        <td className="px-2 py-3 text-center font-bold text-pink-600 uppercase text-[9px]">
                          {client.seller}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {reportData.clients.length > 0 && (
                  <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                    <tr>
                      <td className="px-4 py-4 font-black text-slate-700 uppercase text-xs">Totales</td>
                      <td className="px-2 py-4 text-center font-black text-blue-800 text-base">
                        {reportData.totals.totalVendidas}
                      </td>
                      <td className="px-2 py-4 text-center font-black text-slate-700">Total</td>
                      <td className="px-2 py-4 text-center font-black text-red-600 text-base bg-red-50">
                        {reportData.totals.totalDespachadas}
                      </td>
                      <td colSpan={3} className="px-2 py-4 text-center">
                        <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-xs">
                          FALTAN: {reportData.totals.faltanDespachar} UNIDADES
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
  const colorClasses = {
    slate: 'text-slate-700',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    indigo: 'text-indigo-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
  }[color] || 'text-slate-700';

  const bgClasses = highlight ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-200' : 'bg-white';
  const textClasses = highlight ? 'text-white' : '';
  const labelClasses = highlight ? 'text-blue-100' : 'text-slate-400';

  return (
    <div className={`${bgClasses} p-4 rounded-2xl border ${highlight ? 'border-blue-400' : 'border-slate-100'} transition-all hover:scale-105`}>
      <p className={`text-[9px] font-black ${labelClasses} uppercase tracking-widest mb-2`}>{label}</p>
      <p className={`font-black text-2xl ${textClasses || colorClasses}`}>{value}</p>
    </div>
  );
};

export default DispatchControlView;