import React, { useState, useMemo, useRef } from 'react';
import { AppState, Correria } from '../types';

interface SalesReportViewProps {
  state: AppState;
}

const SalesReportView: React.FC<SalesReportViewProps> = ({ state }) => {
  
  const [selectedCorreriaId, setSelectedCorreriaId] = useState(state.correrias[0]?.id || '');
  const [correriaSearch, setCorreriaSearch] = useState('');
  const [showCorreriaDropdown, setShowCorreriaDropdown] = useState(false);

  // Obtener solo las referencias de la correría seleccionada (maleta)
  const maletaReferences = useMemo(() => {
    if (!selectedCorreriaId) return [];
    
    return state.references.filter(ref => 
      ref.correrias && ref.correrias.includes(selectedCorreriaId)
    );
  }, [selectedCorreriaId, state.references]);

  // Calcular métricas
  const metrics = useMemo(() => {
    if (!selectedCorreriaId) return null;

    const maletaRefIds = maletaReferences.map(r => r.id);

    // Pedidos de esta correría (solo refs de la maleta)
    const correriaOrders = state.orders.filter(o => 
      o.correriaId === selectedCorreriaId &&
      o.items.some(item => maletaRefIds.includes(item.reference))
    );

    // Despachos de esta correría (solo refs de la maleta)
    const correriaDispatches = state.dispatches.filter(d => 
      d.correriaId === selectedCorreriaId &&
      d.items.some(item => maletaRefIds.includes(item.reference))
    );

    // Total vendidas (solo de refs en maleta)
    const totalVendidas = correriaOrders.reduce((acc, order) => {
      return acc + order.items
        .filter(item => maletaRefIds.includes(item.reference))
        .reduce((sum, item) => sum + item.quantity, 0);
    }, 0);

    // Total despachadas (solo de refs en maleta)
    const totalDespachadas = correriaDispatches.reduce((acc, dispatch) => {
      return acc + dispatch.items
        .filter(item => maletaRefIds.includes(item.reference))
        .reduce((sum, item) => sum + item.quantity, 0);
    }, 0);

    // Referencias vendidas (al menos 1 unidad)
    const refsVendidas = maletaRefIds.filter(refId => {
      return correriaOrders.some(order => 
        order.items.some(item => item.reference === refId && item.quantity > 0)
      );
    });

    const refsEnCero = maletaReferences.length - refsVendidas.length;
    const efectividad = maletaReferences.length > 0 
      ? ((refsVendidas.length / maletaReferences.length) * 100) 
      : 0;

    // Cumplimiento unidades
    const cumplimientoUnidades = totalVendidas > 0 
      ? ((totalDespachadas / totalVendidas) * 100) 
      : 0;

    // Total valores
    const totalVendidoValor = correriaOrders.reduce((acc, order) => {
      return acc + order.items
        .filter(item => maletaRefIds.includes(item.reference))
        .reduce((sum, item) => {
          const ref = state.references.find(r => r.id === item.reference);
          return sum + (item.quantity * (ref?.price || 0));
        }, 0);
    }, 0);

    const totalDespachadoValor = correriaDispatches.reduce((acc, dispatch) => {
      return acc + dispatch.items
        .filter(item => maletaRefIds.includes(item.reference))
        .reduce((sum, item) => {
          const ref = state.references.find(r => r.id === item.reference);
          return sum + (item.quantity * (ref?.price || 0));
        }, 0);
    }, 0);

    const diferenciaValor = totalVendidoValor - totalDespachadoValor;
    const cumplimientoValor = totalVendidoValor > 0 
      ? ((totalDespachadoValor / totalVendidoValor) * 100) 
      : 0;

    // Análisis por vendedor
    const vendedoresData = state.sellers.map(seller => {
      const sellerOrders = correriaOrders.filter(o => o.sellerId === seller.id);
      
      const vendidas = sellerOrders.reduce((acc, order) => {
        return acc + order.items
          .filter(item => maletaRefIds.includes(item.reference))
          .reduce((sum, item) => sum + item.quantity, 0);
      }, 0);

      // Despachos de los clientes de este vendedor
      const clientIds = sellerOrders.map(o => o.clientId);
      const despachadas = correriaDispatches
        .filter(d => clientIds.includes(d.clientId))
        .reduce((acc, dispatch) => {
          return acc + dispatch.items
            .filter(item => maletaRefIds.includes(item.reference))
            .reduce((sum, item) => sum + item.quantity, 0);
        }, 0);

      const ventas = sellerOrders.reduce((acc, order) => {
        return acc + order.items
          .filter(item => maletaRefIds.includes(item.reference))
          .reduce((sum, item) => {
            const ref = state.references.find(r => r.id === item.reference);
            return sum + (item.quantity * (ref?.price || 0));
          }, 0);
      }, 0);

      const cumplimientoUnd = vendidas > 0 ? ((despachadas / vendidas) * 100) : 0;
      
      const valorDespachado = correriaDispatches
        .filter(d => clientIds.includes(d.clientId))
        .reduce((acc, dispatch) => {
          return acc + dispatch.items
            .filter(item => maletaRefIds.includes(item.reference))
            .reduce((sum, item) => {
              const ref = state.references.find(r => r.id === item.reference);
              return sum + (item.quantity * (ref?.price || 0));
            }, 0);
        }, 0);

      const cumplimientoValor = ventas > 0 ? ((valorDespachado / ventas) * 100) : 0;
      const porcentajeVenta = totalVendidoValor > 0 ? ((ventas / totalVendidoValor) * 100) : 0;

      return {
        nombre: seller.name,
        pedidos: sellerOrders.length,
        vendidas,
        despachadas,
        ventas,
        cumplimientoUnd,
        cumplimientoValor,
        porcentajeVenta
      };
    }).filter(v => v.pedidos > 0); // Solo vendedores con pedidos

    // Análisis por diseñadora
    const disenadoras = [...new Set(maletaReferences.map(r => r.designer))].filter(Boolean);
    
    const disenadorasData = disenadoras.map(designer => {
      const refsCreadas = maletaReferences.filter(r => r.designer === designer);
      const refIds = refsCreadas.map(r => r.id);

      const refsVendidasDesigner = refIds.filter(refId => {
        return correriaOrders.some(order => 
          order.items.some(item => item.reference === refId && item.quantity > 0)
        );
      });

      const ventasGeneradas = correriaOrders.reduce((acc, order) => {
        return acc + order.items
          .filter(item => refIds.includes(item.reference))
          .reduce((sum, item) => {
            const ref = state.references.find(r => r.id === item.reference);
            return sum + (item.quantity * (ref?.price || 0));
          }, 0);
      }, 0);

      const exitoPedido = refsCreadas.length > 0 
        ? ((refsVendidasDesigner.length / refsCreadas.length) * 100) 
        : 0;

      const refsEnCeroDesigner = refsCreadas.length - refsVendidasDesigner.length;
      const porcentajeEnCero = refsCreadas.length > 0 
        ? ((refsEnCeroDesigner / refsCreadas.length) * 100) 
        : 0;

      return {
        nombre: designer,
        ventasGeneradas,
        refsCreadas: refsCreadas.length,
        refsVendidas: refsVendidasDesigner.length,
        exitoPedido,
        refsEnCero: refsEnCeroDesigner,
        porcentajeEnCero
      };
    }).sort((a, b) => b.ventasGeneradas - a.ventasGeneradas);

    return {
      // Card 1
      totalRefsUnicas: maletaReferences.length,
      refsEnCero,
      porcentajeEnCero: maletaReferences.length > 0 ? ((refsEnCero / maletaReferences.length) * 100) : 0,
      efectividad,

      // Card 2
      totalVendidas,
      totalDespachadas,
      cumplimientoUnidades,

      // Card 3
      totalVendidoValor,
      totalDespachadoValor,
      diferenciaValor,
      porcentajeDiferencia: totalVendidoValor > 0 ? ((diferenciaValor / totalVendidoValor) * 100) : 0,
      cumplimientoValor,

      // Tablas
      vendedoresData,
      disenadorasData
    };
  }, [selectedCorreriaId, state, maletaReferences]);

  const selectedCorreria = state.correrias.find(c => c.id === selectedCorreriaId);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">
            Informes generales de ventas y despacho por correría
          </h2>
          <p className="text-slate-500 font-bold text-xs mt-1">
            Panel Ejecutivo de Ventas y Despachos
          </p>
        </div>

        {/* Selector de correría */}
        <div className="bg-white p-3 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Correría Seleccionada
            </span>
            <CorreriaAutocomplete
              value={selectedCorreriaId}
              correrias={state.correrias}
              onChange={setSelectedCorreriaId}
              search={correriaSearch}
              setSearch={setCorreriaSearch}
              showDropdown={showCorreriaDropdown}
              setShowDropdown={setShowCorreriaDropdown}
            />
          </div>
        </div>
      </div>

      {!metrics ? (
        <div className="bg-white p-24 rounded-[48px] border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
          <p className="text-slate-400 font-bold text-lg">Seleccione una correría</p>
        </div>
      ) : (
        <>
          {/* Cards de métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Card 1: Referencias (Maleta) */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-3xl border border-orange-200 shadow-sm">
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-4">
                Referencias (Maleta)
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-black text-slate-800">{metrics.totalRefsUnicas}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total referencias únicas</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-800">{metrics.refsEnCero}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Referencias en cero ({metrics.porcentajeEnCero.toFixed(0)}%)
                  </p>
                </div>
                <div className="pt-2 border-t border-orange-200">
                  <div className="w-full bg-orange-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all" 
                      style={{ width: `${metrics.efectividad}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] font-black text-orange-600 uppercase">
                    Efectividad Ref: {metrics.efectividad.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Ventas vs Despachos */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-3xl border border-blue-200 shadow-sm">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">
                Ventas vs Despachos
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-black text-slate-800">{metrics.totalVendidas.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unidades vendidas</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-800">{metrics.totalDespachadas.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unidades despachadas</p>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all" 
                      style={{ width: `${metrics.cumplimientoUnidades}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] font-black text-blue-600 uppercase">
                    Cumplimiento: {metrics.cumplimientoUnidades.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Resumen Financiero - Más ancho */}
            <div className="md:col-span-2 bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-3xl border border-green-200 shadow-sm">
              <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-4">
                Resumen Financiero
              </p>
              <div className="flex items-center justify-between gap-6">
                {/* Lado izquierdo: Total vendido y despachado */}
                <div className="space-y-4 flex-1">
                  <div>
                    <p className="text-3xl font-black text-slate-800">
                      $ {metrics.totalVendidoValor.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total vendido</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-800">
                      $ {metrics.totalDespachadoValor.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total despachado</p>
                  </div>
                </div>

                {/* Lado derecho: Diferencia centrada */}
                <div className="flex flex-col items-center justify-center border-l border-green-200 pl-6">
                  <p className="text-3xl font-black text-red-600">
                    $ {metrics.diferenciaValor.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider text-center">
                    Diferencia faltante
                  </p>
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider text-center">
                    {metrics.porcentajeDiferencia.toFixed(1)}% de venta
                  </p>
                </div>
              </div>

              {/* Barra de cumplimiento */}
              <div className="pt-4 border-t border-green-200 mt-4">
                <div className="w-full bg-green-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all" 
                    style={{ width: `${metrics.cumplimientoValor}%` }}
                  ></div>
                </div>
                <p className="text-[10px] font-black text-green-600 uppercase text-center">
                  Cumplimiento: {metrics.cumplimientoValor.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Tabla: Análisis de Vendedores */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4">
              <h3 className="text-lg font-black text-white uppercase tracking-wide">
                Análisis de Vendedores
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">
                      Vendedor
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      Pedidos
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      Vendidas vs Despachadas
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      Ventas ($)
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      Cumplimiento (UND)
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      Cumplimiento (Valor)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.vendedoresData.map((vendedor, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-black text-slate-800 text-sm">{vendedor.nombre}</p>
                        <p className="text-[10px] font-bold text-blue-500">
                          {vendedor.porcentajeVenta.toFixed(1)}% de la venta total
                        </p>
                      </td>
                      <td className="px-4 py-4 text-center font-black text-slate-800">
                        {vendedor.pedidos}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-black text-slate-800">{vendedor.vendidas}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="font-black text-blue-600">{vendedor.despachadas}</span>
                      </td>
                      <td className="px-4 py-4 text-center font-black text-slate-800">
                        $ {vendedor.ventas.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <span className="font-black text-xs">{vendedor.cumplimientoUnd.toFixed(1)}%</span>
                          <div className="w-16 bg-slate-200 rounded-full h-1.5">
                            <div 
                              className="bg-green-500 h-1.5 rounded-full" 
                              style={{ width: `${Math.min(vendedor.cumplimientoUnd, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <span className="font-black text-xs">{vendedor.cumplimientoValor.toFixed(1)}%</span>
                          <div className="w-16 bg-slate-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full" 
                              style={{ width: `${Math.min(vendedor.cumplimientoValor, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 border-t-2 border-slate-300">
                    <td className="px-6 py-4 font-black text-slate-700 uppercase text-xs">
                      Totales Consolidado
                    </td>
                    <td className="px-4 py-4 text-center font-black text-slate-800">
                      {metrics.vendedoresData.reduce((acc, v) => acc + v.pedidos, 0)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-black text-slate-800">{metrics.totalVendidas}</span>
                      <span className="text-slate-400 mx-1">/</span>
                      <span className="font-black text-blue-600">{metrics.totalDespachadas}</span>
                    </td>
                    <td className="px-4 py-4 text-center font-black text-slate-800">
                      $ {metrics.totalVendidoValor.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 font-black text-xs rounded-full">
                        {metrics.cumplimientoUnidades.toFixed(1)}% GLOBAL (UND)
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 font-black text-xs rounded-full">
                        {metrics.cumplimientoValor.toFixed(1)}% GLOBAL (VALOR)
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Tabla: Performance de Diseñadoras */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-8 py-4">
              <h3 className="text-lg font-black text-white uppercase tracking-wide">
                Performance de Diseñadoras
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">
                      Diseñadora
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      Ventas Generadas
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      Ref. Creadas
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      Ref. Vendidas
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      % Éxito Pedido
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      Refs en Cero
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.disenadorasData.map((disenadora, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-black text-slate-800 text-sm uppercase">
                        {disenadora.nombre}
                      </td>
                      <td className="px-4 py-4 text-center font-black text-slate-800">
                        $ {disenadora.ventasGeneradas.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-center font-black text-slate-800">
                        {disenadora.refsCreadas}
                      </td>
                      <td className="px-4 py-4 text-center font-black text-green-600">
                        {disenadora.refsVendidas}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <span className="font-black text-xs">{disenadora.exitoPedido.toFixed(0)}%</span>
                          <div className="w-16 bg-slate-200 rounded-full h-1.5">
                            <div 
                              className="bg-green-500 h-1.5 rounded-full" 
                              style={{ width: `${disenadora.exitoPedido}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-black text-red-600">
                          {disenadora.refsEnCero} ({disenadora.porcentajeEnCero.toFixed(0)}%)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesReportView;

const CorreriaAutocomplete: React.FC<{
  value: string;
  correrias: Correria[];
  onChange: (id: string) => void;
  search: string;
  setSearch: (search: string) => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
}> = ({ value, correrias, onChange, search, setSearch, showDropdown, setShowDropdown }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

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
        className="bg-transparent border-none font-black text-sm text-slate-800 focus:ring-0 pr-8 placeholder:text-slate-400"
      />
      {showDropdown && (
        <div 
          className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-2xl max-h-48 overflow-y-auto"
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
              <p className="text-[9px] text-slate-400">{c.year}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
