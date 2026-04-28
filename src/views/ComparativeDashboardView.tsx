import React, { useState, useMemo, useEffect } from 'react';
import { AppState, Correria } from '../types';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp, Users, Package, DollarSign, ChevronDown, Filter,
  BarChart3, PieChart as PieChartIcon, Target, Palette, Calendar
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { useDarkMode } from '../context/DarkModeContext';

const formatCur = (v: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
const formatCompactCur = (v: number) => `$${(v / 1000000).toFixed(0)}M`;
const formatNum = (v: number) => new Intl.NumberFormat('es-CO').format(v);

interface ComparativeDashboardViewProps {
  state: AppState;
}

const ComparativeDashboardView: React.FC<ComparativeDashboardViewProps> = ({ state }) => {
  const { isDark } = useDarkMode();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCorreriaId, setSelectedCorreriaId] = useState<string | 'all'>('all');
  const [vendorView, setVendorView] = useState<'units' | 'value' | 'discounts'>('units');

  // ==================== NOVEDADES ====================
  const [novedadesByCorreria, setNovedadesByCorreria] = useState<Record<string, { id: number; contenido: string }[]>>({});
  const [showNovedadesModal, setShowNovedadesModal] = useState(false);

  useEffect(() => {
    setNovedadesByCorreria({});
    const yearCorrerias = state.correrias.filter(c => Number(c.year) === selectedYear);
    if (yearCorrerias.length === 0) return;
    // Fetch novedades of each correria in parallel
    Promise.all(
      yearCorrerias.map(c =>
        api.getNovedadesCorreria(c.id).then(data => ({ id: c.id, data }))
      )
    ).then(results => {
      const map: Record<string, { id: number; contenido: string }[]> = {};
      results.forEach(r => { if (r.data.length > 0) map[r.id] = r.data; });
      setNovedadesByCorreria(map);
    });
  }, [selectedYear, state.correrias]);

  const totalNovedades = useMemo(() => {
    const values = novedadesByCorreria as Record<string, { id: number; contenido: string }[]>;
    return Object.values(values).reduce((acc, arr) => acc + arr.length, 0);
  }, [novedadesByCorreria]);

  const correriaIdsWithNovedades = useMemo(() =>
    state.correrias.filter(c => Number(c.year) === selectedYear && novedadesByCorreria[c.id]?.length > 0)
  , [novedadesByCorreria, selectedYear, state.correrias]);

  // Compute the data similarly to how SalesReportView works
  const filteredCorrerias = useMemo(() => {
    const yearCorrerias = state.correrias.filter(c => Number(c.year) === selectedYear);

    return yearCorrerias.map(correria => {
      const maletaReferences = state.references.filter(r => r.correrias && r.correrias.includes(correria.id));
      const maletaRefIds = maletaReferences.map(r => r.id);

      const correriaOrders = state.orders.filter(o => o.correriaId === correria.id && o.items.some(item => maletaRefIds.includes(item.reference)));
      const correriaDispatches = state.dispatches.filter(d => d.correriaId === correria.id && d.items.some(item => maletaRefIds.includes(item.reference)));

      // General KPIs (undVendidas, despachos, valores)
      const ventasTotalesUnd = correriaOrders.reduce((acc, order) => acc + order.items.filter(item => maletaRefIds.includes(item.reference)).reduce((sum, item) => sum + item.quantity, 0), 0);
      const despachosTotalesUnd = correriaDispatches.reduce((acc, dispatch) => acc + dispatch.items.filter(item => maletaRefIds.includes(item.reference)).reduce((sum, item) => sum + item.quantity, 0), 0);

      const refsVendidas = maletaRefIds.filter(refId => correriaOrders.some(order => order.items.some(item => item.reference === refId && item.quantity > 0)));
      const referenciasCero = maletaReferences.length - refsVendidas.length;

      const ventasTotalesPesos = correriaOrders.reduce((acc, order) => acc + order.items.filter(item => maletaRefIds.includes(item.reference)).reduce((sum, item) => {
        return sum + (item.quantity * (item.salePrice || 0));
      }, 0), 0);

      const despachosRealesReal = correriaDispatches.reduce((acc, dispatch) => acc + dispatch.items.filter(item => maletaRefIds.includes(item.reference)).reduce((sum, item) => {
        const salePrice = item.salePrice || correriaOrders.find(o => o.clientId === dispatch.clientId)?.items.find(oi => oi.reference === item.reference)?.salePrice || 0;
        return sum + (item.quantity * salePrice);
      }, 0), 0);

      // Vendedores
      const vendedoresList = state.sellers.map(seller => {
        const sellerOrders = correriaOrders.filter(o => o.sellerId === seller.id);
        const clientIds = sellerOrders.map(o => o.clientId);

        const undVendidas = sellerOrders.reduce((acc, order) => acc + order.items.filter(item => maletaRefIds.includes(item.reference)).reduce((sum, item) => sum + item.quantity, 0), 0);
        const undDespachadas = correriaDispatches.filter(d => clientIds.includes(d.clientId)).reduce((acc, dispatch) => acc + dispatch.items.filter(item => maletaRefIds.includes(item.reference)).reduce((sum, item) => sum + item.quantity, 0), 0);

        const valorPrecioLista = sellerOrders.reduce((acc, order) => acc + order.items.filter(item => maletaRefIds.includes(item.reference)).reduce((sum, item) => {
          const ref = state.references.find(r => r.id === item.reference);
          return sum + (item.quantity * (ref?.price || 0));
        }, 0), 0);

        const valorVendido = sellerOrders.reduce((acc, order) => acc + order.items.filter(item => maletaRefIds.includes(item.reference)).reduce((sum, item) => {
          return sum + (item.quantity * (item.salePrice || 0));
        }, 0), 0);

        const valorDespachado = correriaDispatches.filter(d => clientIds.includes(d.clientId)).reduce((acc, dispatch) => acc + dispatch.items.filter(item => maletaRefIds.includes(item.reference)).reduce((sum, dispatchItem) => {
          const salePrice = dispatchItem.salePrice || correriaOrders.find(o => o.clientId === dispatch.clientId)?.items.find(oi => oi.reference === dispatchItem.reference)?.salePrice || 0;
          return sum + (dispatchItem.quantity * salePrice);
        }, 0), 0);

        return {
          nombre: seller.name,
          pedidos: sellerOrders.length,
          undVendidas,
          undDespachadas,
          porcentajeSobreVenta: ventasTotalesUnd > 0 ? (undVendidas / ventasTotalesUnd) * 100 : 0,
          valorVendido,
          valorDespachado,
          valorPrecioLista: valorVendido, // simplistic
          porcentajeDiferencia: 0,
          cumplimientoUnd: undVendidas > 0 ? (undDespachadas / undVendidas) * 100 : 0,
          cumplimientoVlr: valorVendido > 0 ? (valorDespachado / valorVendido) * 100 : 0,
          vlrDifVentaDesp: valorVendido - valorDespachado,
          descuentos: valorPrecioLista - valorVendido
        };
      }).filter(v => v.pedidos > 0);

      // Diseñadoras (case-insensitive, agrupado en mayúsculas)
      const disenadorasMap = new Map<string, typeof maletaReferences>();
      maletaReferences.filter(r => r.designer).forEach(r => {
        const key = r.designer.toUpperCase();
        if (!disenadorasMap.has(key)) disenadorasMap.set(key, []);
        disenadorasMap.get(key)!.push(r);
      });

      const disenadorasList = Array.from(disenadorasMap.entries()).map(([designerName, refsCreadas]) => {
        const refsCreadasIds = refsCreadas.map(r => r.id);
        const refsVendidasDesigner = refsCreadasIds.filter(refId => correriaOrders.some(order => order.items.some(item => item.reference === refId && item.quantity > 0)));

        const ventasGeneradas = correriaOrders.reduce((acc, order) => acc + order.items.filter(item => refsCreadasIds.includes(item.reference)).reduce((sum, item) => {
          return sum + (item.quantity * (item.salePrice || 0));
        }, 0), 0);

        return {
          nombre: designerName,
          ventas: ventasGeneradas,
          refCreadas: refsCreadas.length,
          refVendidas: refsVendidasDesigner.length,
          porcentajePedidas: refsCreadas.length > 0 ? (refsVendidasDesigner.length / refsCreadas.length) * 100 : 0,
          refEnCero: refsCreadas.length - refsVendidasDesigner.length,
          porcentajeEnCero: refsCreadas.length > 0 ? ((refsCreadas.length - refsVendidasDesigner.length) / refsCreadas.length) * 100 : 0
        };
      });

      return {
        id: correria.id,
        nombre: correria.name,
        año: Number(correria.year),
        totalPedidos: correriaOrders.length,
        kpis: {
          cantReferencias: maletaReferences.length,
          referenciasCero,
          porcentajeCero: maletaReferences.length > 0 ? (referenciasCero / maletaReferences.length) * 100 : 0,
          ventasTotalesUnd,
          despachosTotalesUnd,
          porcentajeDespacho: ventasTotalesUnd > 0 ? (despachosTotalesUnd / ventasTotalesUnd) * 100 : 0,
          ventasTotalesPesos,
          valorDespachoPrecioLista: ventasTotalesPesos,
          despachosRealesReal,
          diferenciaPesos: ventasTotalesPesos - despachosRealesReal,
          porcentajeDiferencia: ventasTotalesPesos > 0 ? ((ventasTotalesPesos - despachosRealesReal) / ventasTotalesPesos) * 100 : 0
        },
        vendedores: vendedoresList,
        disenadoras: disenadorasList
      };
    });
  }, [state.correrias, state.references, state.orders, state.dispatches, state.sellers, selectedYear]);

  const activeCorreria = useMemo(() => {
    if (selectedCorreriaId === 'all') return null;
    return filteredCorrerias.find(c => c.id === selectedCorreriaId);
  }, [selectedCorreriaId, filteredCorrerias]);

  const stats = useMemo(() => {
    if (activeCorreria) return activeCorreria.kpis;

    return filteredCorrerias.reduce((acc, curr) => ({
      cantReferencias: acc.cantReferencias + curr.kpis.cantReferencias,
      referenciasCero: acc.referenciasCero + curr.kpis.referenciasCero,
      porcentajeCero: (acc.referenciasCero + curr.kpis.referenciasCero) / (acc.cantReferencias + curr.kpis.cantReferencias || 1) * 100,
      ventasTotalesUnd: acc.ventasTotalesUnd + curr.kpis.ventasTotalesUnd,
      despachosTotalesUnd: acc.despachosTotalesUnd + curr.kpis.despachosTotalesUnd,
      porcentajeDespacho: (acc.despachosTotalesUnd + curr.kpis.despachosTotalesUnd) / (acc.ventasTotalesUnd + curr.kpis.ventasTotalesUnd || 1) * 100,
      ventasTotalesPesos: acc.ventasTotalesPesos + curr.kpis.ventasTotalesPesos,
      valorDespachoPrecioLista: acc.valorDespachoPrecioLista + curr.kpis.valorDespachoPrecioLista,
      despachosRealesReal: acc.despachosRealesReal + curr.kpis.despachosRealesReal,
      diferenciaPesos: acc.diferenciaPesos + curr.kpis.diferenciaPesos,
      porcentajeDiferencia: (acc.diferenciaPesos + curr.kpis.diferenciaPesos) / (acc.ventasTotalesPesos + curr.kpis.ventasTotalesPesos || 1) * 100,
    }), {
      cantReferencias: 0, referenciasCero: 0, porcentajeCero: 0, ventasTotalesUnd: 0, despachosTotalesUnd: 0,
      porcentajeDespacho: 0, ventasTotalesPesos: 0, valorDespachoPrecioLista: 0, despachosRealesReal: 0, diferenciaPesos: 0, porcentajeDiferencia: 0,
    });
  }, [activeCorreria, filteredCorrerias]);

  const chartData = useMemo(() => {
    return filteredCorrerias.map(c => ({
      name: c.nombre,
      pedidos: c.totalPedidos,
      ventas: c.kpis.ventasTotalesPesos,
      despachos: c.kpis.despachosRealesReal,
      ventasUnd: c.kpis.ventasTotalesUnd,
      despachosUnd: c.kpis.despachosTotalesUnd,
    }));
  }, [filteredCorrerias]);

  const allVendors = useMemo(() => {
    const names = new Set<string>();
    filteredCorrerias.forEach(c => c.vendedores.forEach(v => names.add(v.nombre)));
    return Array.from(names).sort();
  }, [filteredCorrerias]);

  const allDesigners = useMemo(() => {
    const names = new Map<string, string>();
    filteredCorrerias.forEach(c => c.disenadoras.forEach(d => {
      const key = d.nombre.toUpperCase();
      if (!names.has(key)) names.set(key, key);
    }));
    return Array.from(names.values()).sort();
  }, [filteredCorrerias]);

  const getFulfillmentColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (percentage >= 70) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (percentage >= 50) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-rose-100 text-rose-700 border-rose-200';
  };

  const yearsOptions = useMemo(() => {
    const years = new Set(state.correrias.map(c => Number(c.year)).filter(y => !isNaN(y)));
    const currentY = new Date().getFullYear();
    years.add(currentY);
    years.add(currentY - 1);
    years.add(currentY + 1);
    return Array.from(years).sort((a: number, b: number) => a - b);
  }, [state.correrias]);

  return (
    <div className={`max-w-full space-y-8 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-white'}`}>
      {/* Filters & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className={`text-2xl font-black uppercase tracking-tight transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Dashboard Comparativo</h2>
          <p className={`text-xs font-bold uppercase tracking-widest mt-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Análisis de rendimiento y cumplimiento</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Year Selector Dropdown */}
          <div className="relative group">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className={`appearance-none border rounded-2xl px-6 py-3 pr-12 text-sm font-bold shadow-sm outline-none focus:ring-2 transition-all cursor-pointer ${isDark ? 'bg-[#4a3a63] border-violet-600 text-violet-100 focus:ring-violet-500/20' : 'bg-white border-slate-200 text-slate-700 focus:ring-indigo-500/20'}`}
            >
              {yearsOptions.map(year => (
                <option key={year} value={year}>Año {year}</option>
              ))}
            </select>
            <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`} />
          </div>

          {/* Correria Selector Dropdown */}
          <div className="relative group">
            <select
              value={selectedCorreriaId}
              onChange={(e) => setSelectedCorreriaId(e.target.value)}
              className={`appearance-none border rounded-2xl px-6 py-3 pr-12 text-sm font-bold shadow-sm outline-none focus:ring-2 transition-all cursor-pointer ${isDark ? 'bg-[#4a3a63] border-violet-600 text-violet-100 focus:ring-violet-500/20' : 'bg-white border-slate-200 text-slate-700 focus:ring-indigo-500/20'}`}
            >
              <option value="all">Todas las Correrías</option>
              {filteredCorrerias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`} />
          </div>
        </div>
      </div>

      {/* Banner Novedades */}
      {totalNovedades > 0 && (
        <button
          onClick={() => setShowNovedadesModal(true)}
          className={`w-full text-left flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all ${isDark ? 'bg-[#4a3a63] border-violet-600 hover:bg-[#5a4a75]' : 'bg-amber-50 border-amber-200 hover:bg-amber-100'}`}
        >
          <span className="text-xl">💡</span>
          <div className="flex-1">
            <span className={`font-black text-sm transition-colors duration-300 ${isDark ? 'text-violet-100' : 'text-amber-800'}`}>
              Hay {totalNovedades} novedad{totalNovedades > 1 ? 'es' : ''} registrada{totalNovedades > 1 ? 's' : ''} en las correrías de {selectedYear}.
            </span>
            <span className={`font-bold text-xs ml-2 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-amber-600'}`}>Haz clic para ver novedades →</span>
          </div>
        </button>
      )}

      {filteredCorrerias.length === 0 ? (
        <div className={`p-24 rounded-[48px] border-2 border-dashed flex flex-col items-center text-center transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'}`}>
          <p className={`font-bold text-lg transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>No hay datos para el año seleccionado</p>
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="REFERENCIAS TOTALES"
              value={formatNum(stats.cantReferencias)}
              valueLabel="Total ref:"
              secondaryValue={formatNum(stats.referenciasCero)}
              secondaryValueLabel="Ref en 0:"
              subtitle=""
              icon={<Package className="w-6 h-6" />}
              color="indigo"
              progress={100 - stats.porcentajeCero}
              progressLabel="Efectividad Ref: "
            />
            <KPICard
              title="VENTAS VS DESPACHOS"
              value={formatNum(stats.ventasTotalesUnd)}
              valueLabel="VENTA:"
              secondaryValue={formatNum(stats.despachosTotalesUnd)}
              secondaryValueLabel="DESP:"
              subtitle=""
              icon={<TrendingUp className="w-6 h-6" />}
              color="emerald"
              progress={stats.porcentajeDespacho}
              progressLabel="Cumplimiento: "
            />
            <KPICard
              title="RESUMEN FINANCIERO"
              value={formatCur(stats.ventasTotalesPesos)}
              valueLabel="VENTA:"
              secondaryValue={formatCur(stats.despachosRealesReal)}
              secondaryValueLabel="DESP:"
              subtitle=""
              icon={<DollarSign className="w-6 h-6" />}
              color="blue"
              progress={stats.ventasTotalesPesos > 0 ? (stats.despachosRealesReal / stats.ventasTotalesPesos) * 100 : 0}
              progressLabel="Cumplimiento: "
            />
            <KPICard
              title="DIFERENCIA FALTANTE"
              value={formatCur(stats.diferenciaPesos)}
              subtitle={`${stats.porcentajeDiferencia.toFixed(1)}% de la venta total`}
              icon={<Target className="w-6 h-6" />}
              color="rose"
              progress={Math.min(100, Math.max(0, stats.porcentajeDiferencia))}
              isNegative
            />
          </section>

          {/* Charts & Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Chart */}
            <div className={`lg:col-span-2 rounded-3xl shadow-sm border p-8 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-8">
                <h3 className={`text-lg font-black uppercase tracking-tight transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Grafico de cumplimiento por correría</h3>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    <span className={`transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>Ventas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    <span className={`transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>Despachos</span>
                  </div>
                </div>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#5a4a75' : '#F1F5F9'} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={(props) => {
                        const { x, y, payload } = props;
                        const item = chartData.find(d => d.name === payload.value);
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <text x={0} y={0} dy={14} textAnchor="middle" fill={isDark ? '#c4b5fd' : '#64748B'} fontSize={12} fontWeight={600}>{payload.value}</text>
                            <text x={0} y={0} dy={28} textAnchor="middle" fill={isDark ? '#a78bfa' : '#94A3B8'} fontSize={10} fontWeight={600}>{item ? `${item.pedidos} pedidos` : ''}</text>
                          </g>
                        );
                      }}
                      height={50}
                    />
                    <YAxis
                      hide
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: isDark ? '#c4b5fd' : '#64748B', fontSize: 11 }}
                      tickFormatter={(v) => `$${v / 1000000}M`}
                    />
                    <Tooltip
                      cursor={{ fill: isDark ? '#5a4a75' : '#F8FAFC' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: isDark ? '#4a3a63' : '#ffffff', color: isDark ? '#e9d5ff' : '#000000' }}
                      formatter={(v: number) => [formatCur(v), '']}
                    />
                    <Bar dataKey="ventas" fill="#6366F1" radius={[6, 6, 0, 0]} barSize={40} />
                    <Bar dataKey="despachos" fill="#34D399" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribution Valor */}
            <div className={`rounded-3xl shadow-sm border p-8 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'}`}>
              <h3 className={`text-lg font-black uppercase tracking-tight mb-8 transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Ventas Valor</h3>
              <div className="h-[250px] w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="ventas"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-valor-${index}`} fill={['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'][index % 4] || '#6366F1'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCur(value)} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: isDark ? '#4a3a63' : '#ffffff', color: isDark ? '#e9d5ff' : '#000000' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {chartData.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full min-w-[12px]" style={{ backgroundColor: ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'][idx % 4] || '#6366F1' }}></div>
                      <span className={`text-xs font-bold truncate max-w-[80px] transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`} title={item.name}>{item.name}</span>
                    </div>
                    <span className={`text-xs font-black whitespace-nowrap transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>
                      {formatCur(item.ventas)} <span className={`text-[10px] font-bold ml-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>({stats.ventasTotalesPesos > 0 ? ((item.ventas / stats.ventasTotalesPesos) * 100).toFixed(0) : 0}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Distribution Unidades */}
            <div className={`rounded-3xl shadow-sm border p-8 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'}`}>
              <h3 className={`text-lg font-black uppercase tracking-tight mb-8 transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Venta Unds</h3>
              <div className="h-[250px] w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="ventasUnd"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-und-${index}`} fill={['#3B82F6', '#10B981', '#F43F5E', '#F59E0B'][index % 4] || '#3B82F6'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatNum(value) + ' Und'} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: isDark ? '#4a3a63' : '#ffffff', color: isDark ? '#e9d5ff' : '#000000' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {chartData.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full min-w-[12px]" style={{ backgroundColor: ['#3B82F6', '#10B981', '#F43F5E', '#F59E0B'][idx % 4] || '#3B82F6' }}></div>
                      <span className={`text-xs font-bold truncate max-w-[80px] transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`} title={item.name}>{item.name}</span>
                    </div>
                    <span className={`text-xs font-black whitespace-nowrap transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>
                      {formatNum(item.ventasUnd)}<span className={`text-xs opacity-60 ml-0.5 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>U</span> <span className={`text-[10px] font-bold ml-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>({stats.ventasTotalesUnd > 0 ? ((item.ventasUnd / stats.ventasTotalesUnd) * 100).toFixed(0) : 0}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vendors Timeline Section (Consolidated Year) */}
          <section className={`rounded-3xl border shadow-sm overflow-hidden mb-8 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'}`}>
            <div className={`p-8 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-300 ${isDark ? 'border-violet-600' : 'border-slate-100'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl transition-colors duration-300 ${isDark ? 'bg-violet-900/30' : 'bg-indigo-50'}`}>
                  <Users className={`w-6 h-6 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-indigo-600'}`} />
                </div>
                <div>
                  <h3 className={`text-lg font-black uppercase tracking-tight transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Cumplimiento por Vendedor</h3>
                  <p className={`text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Desglose detallado por correría - Año {selectedYear}</p>
                </div>
              </div>

              <div className={`flex items-center gap-2 p-1.5 rounded-2xl border transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600' : 'bg-slate-50 border-slate-200'}`}>
                {[
                  { id: 'units', label: 'Unidades' },
                  { id: 'value', label: 'Valor' },
                  { id: 'discounts', label: 'Descuentos' }
                ].map((view) => (
                  <button
                    key={view.id}
                    onClick={() => setVendorView(view.id as any)}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${vendorView === view.id
                      ? isDark ? 'bg-[#4a3a63] text-violet-100 shadow-sm border border-violet-600' : 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                      : isDark ? 'text-violet-400 hover:text-violet-300' : 'text-slate-400 hover:text-slate-600'
                      }`}
                  >
                    {view.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-slate-50/50'}`}>
                    <th className={`px-8 py-5 text-[11px] font-black uppercase tracking-widest border-b sticky left-0 z-10 transition-colors duration-300 ${isDark ? 'text-violet-300 border-violet-600 bg-[#3d2d52]' : 'text-slate-400 border-slate-100 bg-slate-50'}`}>Vendedor</th>
                    {filteredCorrerias.map(c => (
                      <th key={c.id} className={`px-8 py-5 text-[11px] font-black uppercase tracking-widest border-b text-center min-w-[180px] transition-colors duration-300 ${isDark ? 'text-violet-300 border-violet-600' : 'text-slate-400 border-slate-100'}`}>
                        {c.nombre}
                      </th>
                    ))}
                    <th className={`px-8 py-5 text-[11px] font-black uppercase tracking-widest border-b text-center transition-colors duration-300 ${isDark ? 'text-violet-400 bg-violet-900/20 border-violet-600' : 'text-indigo-600 bg-indigo-50/30 border-slate-100'}`}>
                      {vendorView === 'discounts' ? 'Total Descuentos' : 'Promedio Anual'}
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors duration-300 ${isDark ? 'divide-violet-700' : 'divide-slate-100'}`}>
                  {allVendors.map(vendorName => {
                    let totalFulfillment = 0;
                    let totalDiscount = 0;
                    let count = 0;

                    return (
                      <tr key={vendorName} className={`transition-colors ${isDark ? 'hover:bg-[#5a4a75]' : 'hover:bg-slate-50/50'}`}>
                        <td className={`px-8 py-6 font-black border-r sticky left-0 z-10 text-base transition-colors duration-300 ${isDark ? 'text-violet-50 border-violet-600 bg-[#4a3a63]' : 'text-slate-800 border-slate-100 bg-white'}`}>
                          {vendorName}
                        </td>
                        {filteredCorrerias.map(c => {
                          const vData = c.vendedores.find(v => v.nombre === vendorName);
                          if (vData) {
                            // Sum properly depending on view
                            if (vendorView === 'units') totalFulfillment += vData.cumplimientoUnd;
                            else totalFulfillment += vData.cumplimientoVlr;
                            totalDiscount += vData.descuentos || 0;
                            count++;
                          }
                          return (
                            <td key={c.id} className="px-8 py-6 text-center">
                              {vData ? (
                                vendorView === 'units' ? (
                                  <div className="inline-flex flex-col items-center px-5 py-3 rounded-2xl border shadow-sm transition-transform hover:scale-105 bg-blue-100 text-blue-700 border-blue-200">
                                    <span className="text-lg font-black tracking-tighter leading-none">{vData.undVendidas} / {vData.undDespachadas}</span>
                                    <div className="flex items-center gap-1 mt-1.5">
                                      <span className="text-[10px] font-black uppercase tracking-widest">{vData.cumplimientoUnd.toFixed(1)}%</span>
                                      <span className="text-[8px] font-bold uppercase opacity-60 tracking-tighter">Cumpl.</span>
                                    </div>
                                  </div>
                                ) : vendorView === 'value' ? (
                                  <div className="inline-flex flex-col items-center px-5 py-3 rounded-2xl border shadow-sm transition-transform hover:scale-105 bg-emerald-100 text-emerald-700 border-emerald-200">
                                    <span className="text-[13px] font-black tracking-tighter leading-none whitespace-nowrap">{formatCompactCur(vData.valorVendido)} / {formatCompactCur(vData.valorDespachado)}</span>
                                    <div className="flex items-center gap-1 mt-1.5">
                                      <span className="text-[10px] font-black uppercase tracking-widest">{vData.cumplimientoVlr.toFixed(1)}%</span>
                                      <span className="text-[8px] font-bold uppercase opacity-60 tracking-tighter">Vlr.</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="inline-flex flex-col items-center px-5 py-3 rounded-2xl bg-rose-100 border border-rose-200 text-rose-700 shadow-sm transition-transform hover:scale-105">
                                    <span className="text-lg font-black tracking-tighter leading-none">{formatCur(vData.descuentos || 0)}</span>
                                    <span className="text-[8px] font-bold uppercase opacity-60 tracking-tighter mt-1.5">Dscto.</span>
                                  </div>
                                )
                              ) : (
                                <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">N/A</span>
                              )}
                            </td>
                          );
                        })}
                        <td className={`px-8 py-6 text-center transition-colors duration-300 ${isDark ? 'bg-violet-900/20' : 'bg-indigo-50/10'}`}>
                          <span className={`text-xl font-black transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-indigo-700'}`}>
                            {vendorView === 'discounts'
                              ? formatCur(totalDiscount)
                              : `${count > 0 ? (totalFulfillment / count).toFixed(1) : '0.0'}%`
                            }
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className={`border-t-2 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600' : 'bg-slate-100 border-slate-300'}`}>
                  <tr>
                    <td className={`px-8 py-4 font-black uppercase text-xs sticky left-0 z-10 transition-colors duration-300 ${isDark ? 'text-violet-300 bg-[#3d2d52]' : 'text-slate-700 bg-slate-100'}`}>Totales</td>
                    {filteredCorrerias.map(c => {
                      const totUnd = c.vendedores.reduce((acc, v) => ({ vend: acc.vend + v.undVendidas, desp: acc.desp + v.undDespachadas, vVend: acc.vVend + v.valorVendido, vDesp: acc.vDesp + v.valorDespachado, desc: acc.desc + (v.descuentos || 0) }), { vend: 0, desp: 0, vVend: 0, vDesp: 0, desc: 0 });
                      return (
                        <td key={c.id} className="px-8 py-4 text-center">
                          {vendorView === 'units' ? (
                            <div className="inline-flex flex-col items-center px-4 py-2 rounded-xl bg-blue-600 text-white shadow-sm">
                              <span className="text-sm font-black">{formatNum(totUnd.vend)} / {formatNum(totUnd.desp)}</span>
                              <span className="text-[9px] font-black uppercase opacity-80">{totUnd.vend > 0 ? ((totUnd.desp / totUnd.vend) * 100).toFixed(1) : '0.0'}%</span>
                            </div>
                          ) : vendorView === 'value' ? (
                            <div className="inline-flex flex-col items-center px-4 py-2 rounded-xl bg-emerald-600 text-white shadow-sm">
                              <span className="text-sm font-black whitespace-nowrap">{formatCompactCur(totUnd.vVend)} / {formatCompactCur(totUnd.vDesp)}</span>
                              <span className="text-[9px] font-black uppercase opacity-80">{totUnd.vVend > 0 ? ((totUnd.vDesp / totUnd.vVend) * 100).toFixed(1) : '0.0'}%</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center px-4 py-2 rounded-xl bg-rose-600 text-white shadow-sm">
                              <span className="text-sm font-black">{formatCur(totUnd.desc)}</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className={`px-8 py-4 text-center transition-colors duration-300 ${isDark ? 'bg-violet-900/20' : 'bg-indigo-50/10'}`}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Designers Timeline Section (Consolidated Year) */}
          <section className={`rounded-3xl border shadow-sm overflow-hidden mb-12 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'}`}>
            <div className={`p-8 border-b flex items-center gap-4 transition-colors duration-300 ${isDark ? 'border-violet-600' : 'border-slate-100'}`}>
              <div className={`p-3 rounded-2xl transition-colors duration-300 ${isDark ? 'bg-violet-900/30' : 'bg-rose-50'}`}>
                <Palette className={`w-6 h-6 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-rose-600'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-black uppercase tracking-tight transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Efectividad por Diseñadora</h3>
                <p className={`text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Éxito de referencias por colección - Año {selectedYear}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-slate-50/50'}`}>
                    <th className={`px-8 py-5 text-[11px] font-black uppercase tracking-widest border-b sticky left-0 z-10 transition-colors duration-300 ${isDark ? 'text-violet-300 border-violet-600 bg-[#3d2d52]' : 'text-slate-400 border-slate-100 bg-slate-50'}`}>Diseñadora</th>
                    {filteredCorrerias.map(c => (
                      <th key={c.id} className={`px-8 py-5 text-[11px] font-black uppercase tracking-widest border-b text-center min-w-[180px] transition-colors duration-300 ${isDark ? 'text-violet-300 border-violet-600' : 'text-slate-400 border-slate-100'}`}>
                        {c.nombre}
                      </th>
                    ))}
                    <th className={`px-8 py-5 text-[11px] font-black uppercase tracking-widest border-b text-center transition-colors duration-300 ${isDark ? 'text-violet-400 bg-violet-900/20 border-violet-600' : 'text-rose-600 bg-rose-50/30 border-slate-100'}`}>Promedio Éxito</th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors duration-300 ${isDark ? 'divide-violet-700' : 'divide-slate-100'}`}>
                  {allDesigners.map(designerName => {
                    let totalSuccess = 0;
                    let count = 0;

                    return (
                      <tr key={designerName} className={`transition-colors ${isDark ? 'hover:bg-[#5a4a75]' : 'hover:bg-slate-50/50'}`}>
                        <td className={`px-4 py-3 font-black border-r sticky left-0 z-10 text-base transition-colors duration-300 ${isDark ? 'text-violet-50 border-violet-600 bg-[#4a3a63]' : 'text-slate-800 border-slate-100 bg-white'}`}>
                          {designerName}
                        </td>
                        {filteredCorrerias.map(c => {
                          const dData = c.disenadoras.find(d => d.nombre.toUpperCase() === designerName);
                          if (dData) {
                            totalSuccess += dData.porcentajePedidas;
                            count++;
                          }
                          return (
                            <td key={c.id} className="px-4 py-3 text-center">
                              {dData ? (
                                <div className="inline-flex flex-col items-center px-4 py-2 rounded-2xl border shadow-sm transition-transform hover:scale-105 bg-rose-50 text-rose-500 border-rose-200">
                                  <span className="text-lg font-black tracking-tighter leading-none">{dData.refCreadas} / {dData.refVendidas}</span>
                                  <div className="flex items-center gap-1 mt-1.5">
                                    <span className="text-[10px] font-black uppercase tracking-widest">{dData.porcentajePedidas.toFixed(1)}%</span>
                                    <span className="text-[8px] font-bold uppercase opacity-60 tracking-tighter">Éxito</span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">N/A</span>
                              )}
                            </td>
                          );
                        })}
                        <td className={`px-4 py-3 text-center transition-colors duration-300 ${isDark ? 'bg-violet-900/20' : 'bg-rose-50/10'}`}>
                          <span className={`text-xl font-black transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-rose-700'}`}>
                            {count > 0 ? (totalSuccess / count).toFixed(1) : '0.0'}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className={`border-t-2 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600' : 'bg-slate-100 border-slate-300'}`}>
                  <tr>
                    <td className={`px-8 py-4 font-black uppercase text-xs sticky left-0 z-10 transition-colors duration-300 ${isDark ? 'text-violet-300 bg-[#3d2d52]' : 'text-slate-700 bg-slate-100'}`}>Totales</td>
                    {filteredCorrerias.map(c => {
                      const totCreadas = c.disenadoras.reduce((acc, d) => acc + d.refCreadas, 0);
                      const totVendidas = c.disenadoras.reduce((acc, d) => acc + d.refVendidas, 0);
                      const pct = totCreadas > 0 ? ((totVendidas / totCreadas) * 100).toFixed(1) : '0.0';
                      return (
                        <td key={c.id} className="px-8 py-4 text-center">
                          <div className="inline-flex flex-col items-center px-4 py-2 rounded-xl bg-rose-600 text-white shadow-sm">
                            <span className="text-sm font-black">{totCreadas} / {totVendidas}</span>
                            <span className="text-[9px] font-black uppercase opacity-80">{pct}% Éxito</span>
                          </div>
                        </td>
                      );
                    })}
                    <td className={`px-8 py-4 text-center transition-colors duration-300 ${isDark ? 'bg-violet-900/20' : 'bg-rose-50/10'}`}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </>
      )}
      {/* Modal de Novedades - solo lectura */}
      {showNovedadesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className={`rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col transition-colors duration-300 ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}>
            {/* Header */}
            <div className={`px-8 py-6 border-b flex items-center justify-between flex-shrink-0 transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-600' : 'bg-amber-50 border-amber-100'}`}>
              <div>
                <h3 className={`text-xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-amber-900'}`}>Novedades de Correrías</h3>
                <p className={`font-bold text-xs mt-0.5 uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-amber-600'}`}>Año {selectedYear} · {correriaIdsWithNovedades.length} correría{correriaIdsWithNovedades.length > 1 ? 's' : ''} con novedades</p>
              </div>
              <button onClick={() => setShowNovedadesModal(false)} className={`text-3xl font-black leading-none transition-colors duration-300 ${isDark ? 'text-violet-400 hover:text-violet-300' : 'text-amber-400 hover:text-amber-600'}`}>×</button>
            </div>

            {/* Body */}
            <div className={`overflow-y-auto flex-1 p-8 space-y-6 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}>
              {correriaIdsWithNovedades.map(correria => (
                <div key={correria.id} className={`grid grid-cols-[200px_1fr] gap-6 items-start border-b pb-6 last:border-0 last:pb-0 transition-colors duration-300 ${isDark ? 'border-violet-700' : 'border-slate-100'}`}>
                  {/* Columna izquierda: nombre de la correría */}
                  <div className="sticky top-0">
                    <div className={`rounded-2xl px-4 py-3 transition-colors duration-300 ${isDark ? 'bg-violet-900/30' : 'bg-amber-100'}`}>
                      <p className={`font-black text-sm leading-tight transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-amber-900'}`}>{correria.name}</p>
                      <p className={`font-bold text-[10px] uppercase tracking-wider mt-0.5 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-amber-600'}`}>{correria.year}</p>
                    </div>
                  </div>
                  {/* Columna derecha: novedades enumeradas */}
                  <div className="space-y-2.5">
                    {(novedadesByCorreria[correria.id] || []).map((n, idx) => (
                      <div key={n.id} className="flex items-start gap-3">
                        <span className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded-full text-[10px] font-black flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-violet-900/30 text-violet-300' : 'bg-amber-100 text-amber-700'}`}>{idx + 1}</span>
                        <p className={`font-bold text-sm leading-relaxed transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>{n.contenido}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className={`px-8 py-4 border-t flex-shrink-0 transition-colors duration-300 ${isDark ? 'border-violet-600 bg-[#3d2d52]' : 'border-slate-100 bg-slate-50'}`}>
              <button
                onClick={() => setShowNovedadesModal(false)}
                className={`w-full py-2.5 rounded-xl font-black text-sm transition-all ${isDark ? 'bg-violet-600 hover:bg-violet-500 text-violet-50' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface KPICardProps {
  title: string;
  value: string;
  valueLabel?: string;
  secondaryValue?: string;
  secondaryValueLabel?: string;
  subtitle: string;
  icon: React.ReactNode;
  color: 'indigo' | 'emerald' | 'blue' | 'rose';
  progress: number;
  progressLabel?: string;
  isNegative?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  valueLabel,
  secondaryValue,
  secondaryValueLabel,
  subtitle,
  icon,
  color,
  progress,
  progressLabel,
  isNegative
}) => {
  const { isDark } = useDarkMode();
  const colors = {
    indigo: isDark ? 'bg-violet-900/30 text-violet-400 border-violet-600 ring-violet-900/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100 ring-indigo-50',
    emerald: isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-600 ring-emerald-900/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-50',
    blue: isDark ? 'bg-blue-900/30 text-blue-400 border-blue-600 ring-blue-900/20' : 'bg-blue-50 text-blue-600 border-blue-100 ring-blue-50',
    rose: isDark ? 'bg-rose-900/30 text-rose-400 border-rose-600 ring-rose-900/20' : 'bg-rose-50 text-rose-600 border-rose-100 ring-rose-50',
  };

  const barColors = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-400',
    blue: 'bg-blue-500',
    rose: 'bg-rose-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl p-6 shadow-sm border relative overflow-hidden group transition-all duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700 hover:shadow-xl hover:shadow-violet-900/30' : 'bg-white border-slate-200 hover:shadow-xl hover:shadow-slate-200/50'}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl border transition-transform group-hover:scale-110 duration-300 ${colors[color]}`}>
            {icon}
          </div>
          <h4 className={`text-xs font-black uppercase tracking-tight transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{title}</h4>
        </div>
      </div>

      <div className="space-y-1">
        {secondaryValue ? (
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className={`text-xs font-bold uppercase transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>{valueLabel || 'Venta:'}</span>
              <p className={`text-xl font-black tracking-tight transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>{value}</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-xs font-bold uppercase transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-indigo-500'}`}>{secondaryValueLabel || 'Desp:'}</span>
              <p className={`text-xl font-black tracking-tight transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-indigo-600'}`}>{secondaryValue}</p>
            </div>
          </div>
        ) : (
          <p className={`text-2xl font-black tracking-tight transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>{value}</p>
        )}
        {subtitle && <p className={`text-xs font-bold transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>{subtitle}</p>}
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
          <span className={`transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>{progressLabel || (isNegative ? 'Diferencia: ' : 'Progreso: ')}</span>
          <span className={`transition-colors duration-300 ${isNegative ? 'text-rose-500' : isDark ? 'text-violet-300' : 'text-slate-700'}`}>{progress.toFixed(1)}%</span>
        </div>
        <div className={`w-full h-2 rounded-full overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-slate-100'}`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${barColors[color]}`}
          ></motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ComparativeDashboardView;
