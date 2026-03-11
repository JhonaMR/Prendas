import React, { useState, useMemo } from 'react';
import { ComparativeDashboardData, CorreriaReport } from '../types';
import { mockDashboardData } from '../mockData';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  ChevronDown, 
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Palette,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

const formatCur = (v: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
const formatCompactCur = (v: number) => `$${(v / 1000000).toFixed(0)}M`;
const formatNum = (v: number) => new Intl.NumberFormat('es-CO').format(v);

const DashboardView: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedCorreriaId, setSelectedCorreriaId] = useState<string | 'all'>('all');
  const [vendorView, setVendorView] = useState<'units' | 'value' | 'discounts'>('units');

  const data = mockDashboardData.comparativo as ComparativeDashboardData;

  const filteredCorrerias = useMemo(() => {
    return data.correrias.filter(c => c.año === selectedYear);
  }, [selectedYear, data.correrias]);

  const activeCorreria = useMemo(() => {
    if (selectedCorreriaId === 'all') return null;
    return filteredCorrerias.find(c => c.id === selectedCorreriaId);
  }, [selectedCorreriaId, filteredCorrerias]);

  // Aggregated stats for the selected view
  const stats = useMemo(() => {
    if (activeCorreria) return activeCorreria.kpis;
    
    // Aggregate all filtered correrias
    return filteredCorrerias.reduce((acc, curr) => ({
      cantReferencias: acc.cantReferencias + curr.kpis.cantReferencias,
      referenciasCero: acc.referenciasCero + curr.kpis.referenciasCero,
      porcentajeCero: (acc.referenciasCero + curr.kpis.referenciasCero) / (acc.cantReferencias + curr.kpis.cantReferencias) * 100,
      ventasTotalesUnd: acc.ventasTotalesUnd + curr.kpis.ventasTotalesUnd,
      despachosTotalesUnd: acc.despachosTotalesUnd + curr.kpis.despachosTotalesUnd,
      porcentajeDespacho: (acc.despachosTotalesUnd + curr.kpis.despachosTotalesUnd) / (acc.ventasTotalesUnd + curr.kpis.ventasTotalesUnd) * 100,
      ventasTotalesPesos: acc.ventasTotalesPesos + curr.kpis.ventasTotalesPesos,
      valorDespachoPrecioLista: acc.valorDespachoPrecioLista + curr.kpis.valorDespachoPrecioLista,
      despachosRealesReal: acc.despachosRealesReal + curr.kpis.despachosRealesReal,
      diferenciaPesos: acc.diferenciaPesos + curr.kpis.diferenciaPesos,
      porcentajeDiferencia: (acc.diferenciaPesos + curr.kpis.diferenciaPesos) / (acc.ventasTotalesPesos + curr.kpis.ventasTotalesPesos) * 100,
    }), {
      cantReferencias: 0,
      referenciasCero: 0,
      porcentajeCero: 0,
      ventasTotalesUnd: 0,
      despachosTotalesUnd: 0,
      porcentajeDespacho: 0,
      ventasTotalesPesos: 0,
      valorDespachoPrecioLista: 0,
      despachosRealesReal: 0,
      diferenciaPesos: 0,
      porcentajeDiferencia: 0,
    });
  }, [activeCorreria, filteredCorrerias]);

  const chartData = useMemo(() => {
    return filteredCorrerias.map(c => ({
      name: c.nombre.split(' ')[0],
      ventas: c.kpis.ventasTotalesPesos,
      despachos: c.kpis.despachosRealesReal,
    }));
  }, [filteredCorrerias]);

  // Extract all unique vendor names for the year
  const allVendors = useMemo(() => {
    const names = new Set<string>();
    filteredCorrerias.forEach(c => c.vendedores.forEach(v => names.add(v.nombre)));
    return Array.from(names).sort();
  }, [filteredCorrerias]);

  // Extract all unique designer names for the year
  const allDesigners = useMemo(() => {
    const names = new Set<string>();
    filteredCorrerias.forEach(c => c.disenadoras.forEach(d => names.add(d.nombre)));
    return Array.from(names).sort();
  }, [filteredCorrerias]);

  const getFulfillmentColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (percentage >= 70) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (percentage >= 50) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-rose-100 text-rose-700 border-rose-200';
  };

  return (
    <div className="max-w-full space-y-8">
      {/* Filters & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Dashboard Comparativo</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Análisis de rendimiento y cumplimiento</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Year Selector Dropdown */}
          <div className="relative group">
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="appearance-none bg-white border border-slate-200 rounded-2xl px-6 py-3 pr-12 text-sm font-bold text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            >
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>Año {year}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Correria Selector Dropdown */}
          <div className="relative group">
            <select 
              value={selectedCorreriaId}
              onChange={(e) => setSelectedCorreriaId(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-2xl px-6 py-3 pr-12 text-sm font-bold text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            >
              <option value="all">Todas las Correrías</option>
              {filteredCorrerias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

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
          progress={(stats.despachosRealesReal / stats.ventasTotalesPesos) * 100}
          progressLabel="Cumplimiento: "
        />
          <KPICard 
            title="DIFERENCIA FALTANTE" 
            value={formatCur(stats.diferenciaPesos)} 
            subtitle={`${stats.porcentajeDiferencia.toFixed(1)}% de la venta total`}
            icon={<Target className="w-6 h-6" />}
            color="rose"
            progress={stats.porcentajeDiferencia}
            isNegative
          />
        </section>

        {/* Charts & Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Grafico de cumplimiento por correría</h3>
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <span className="text-slate-500">Ventas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="text-slate-500">Despachos</span>
                </div>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    hide
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    tickFormatter={(v) => `$${v / 1000000}M`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(v: number) => [formatCur(v), '']}
                  />
                  <Bar dataKey="ventas" fill="#6366F1" radius={[6, 6, 0, 0]} barSize={40} />
                  <Bar dataKey="despachos" fill="#34D399" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8">Distribución de Venta</h3>
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
                      <Cell key={`cell-${index}`} fill={['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {chartData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'][idx % 4] }}></div>
                    <span className="text-sm font-bold text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">
                    {((item.ventas / stats.ventasTotalesPesos) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      {/* Vendors Timeline Section (Consolidated Year) */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Cumplimiento por Vendedor</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Desglose detallado por correría - Año {selectedYear}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            {[
              { id: 'units', label: 'Unidades' },
              { id: 'value', label: 'Valor' },
              { id: 'discounts', label: 'Descuentos' }
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setVendorView(view.id as any)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                  vendorView === view.id 
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' 
                    : 'text-slate-400 hover:text-slate-600'
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
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 sticky left-0 bg-slate-50 z-10">Vendedor</th>
                {filteredCorrerias.map(c => (
                  <th key={c.id} className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center min-w-[180px]">
                    {c.nombre}
                  </th>
                ))}
                <th className="px-8 py-5 text-[11px] font-black text-indigo-600 uppercase tracking-widest border-b border-slate-100 text-center bg-indigo-50/30">
                  {vendorView === 'discounts' ? 'Total Descuentos' : 'Promedio Anual'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allVendors.map(vendorName => {
                let totalFulfillment = 0;
                let totalDiscount = 0;
                let count = 0;

                return (
                  <tr key={vendorName} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 font-black text-slate-800 border-r border-slate-100 sticky left-0 bg-white z-10 text-base">
                      {vendorName}
                    </td>
                    {filteredCorrerias.map(c => {
                      const vData = c.vendedores.find(v => v.nombre === vendorName);
                      if (vData) {
                        totalFulfillment += vendorView === 'units' ? vData.cumplimientoUnd : vData.cumplimientoVlr;
                        totalDiscount += vData.descuentos || 0;
                        count++;
                      }
                      return (
                        <td key={c.id} className="px-8 py-6 text-center">
                          {vData ? (
                            vendorView === 'units' ? (
                              <div className="inline-flex flex-col items-center px-5 py-3 rounded-2xl border shadow-sm transition-transform hover:scale-105 bg-blue-100 text-blue-700 border-blue-200">
                                <span className="text-lg font-black tracking-tighter leading-none">{vData.undDespachadas} / {vData.undVendidas}</span>
                                <div className="flex items-center gap-1 mt-1.5">
                                  <span className="text-[10px] font-black uppercase tracking-widest">{vData.cumplimientoUnd.toFixed(1)}%</span>
                                  <span className="text-[8px] font-bold uppercase opacity-60 tracking-tighter">Cumpl.</span>
                                </div>
                              </div>
                            ) : vendorView === 'value' ? (
                              <div className="inline-flex flex-col items-center px-5 py-3 rounded-2xl border shadow-sm transition-transform hover:scale-105 bg-emerald-100 text-emerald-700 border-emerald-200">
                                <span className="text-lg font-black tracking-tighter leading-none">{formatCompactCur(vData.valorDespachado)} / {formatCompactCur(vData.valorVendido)}</span>
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
                    <td className="px-8 py-6 text-center bg-indigo-50/10">
                      <span className="text-xl font-black text-indigo-700">
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
          </table>
        </div>
      </section>

      {/* Designers Timeline Section (Consolidated Year) */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-2xl">
            <Palette className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Efectividad por Diseñadora</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Éxito de referencias por colección - Año {selectedYear}</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 sticky left-0 bg-slate-50 z-10">Diseñadora</th>
                {filteredCorrerias.map(c => (
                  <th key={c.id} className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center min-w-[180px]">
                    {c.nombre}
                  </th>
                ))}
                <th className="px-8 py-5 text-[11px] font-black text-rose-600 uppercase tracking-widest border-b border-slate-100 text-center bg-rose-50/30">Promedio Éxito</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allDesigners.map(designerName => {
                let totalSuccess = 0;
                let count = 0;

                return (
                  <tr key={designerName} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 font-black text-slate-800 border-r border-slate-100 sticky left-0 bg-white z-10 text-base">
                      {designerName}
                    </td>
                    {filteredCorrerias.map(c => {
                      const dData = c.disenadoras.find(d => d.nombre === designerName);
                      if (dData) {
                        totalSuccess += dData.porcentajePedidas;
                        count++;
                      }
                      return (
                        <td key={c.id} className="px-8 py-6 text-center">
                          {dData ? (
                            <div className={`inline-flex flex-col items-center px-5 py-3 rounded-2xl border shadow-sm transition-transform hover:scale-105 ${getFulfillmentColor(dData.porcentajePedidas)}`}>
                              <span className="text-lg font-black tracking-tighter leading-none">{dData.refVendidas} / {dData.refCreadas}</span>
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
                    <td className="px-8 py-6 text-center bg-rose-50/10">
                      <span className="text-xl font-black text-rose-700">
                        {count > 0 ? (totalSuccess / count).toFixed(1) : '0.0'}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
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
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 ring-indigo-50',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-50',
    blue: 'bg-blue-50 text-blue-600 border-blue-100 ring-blue-50',
    rose: 'bg-rose-50 text-rose-600 border-rose-100 ring-rose-50',
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
      className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${colors[color]} border transition-transform group-hover:scale-110 duration-300`}>
            {icon}
          </div>
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{title}</h4>
        </div>
      </div>
      
      <div className="space-y-1">
        {secondaryValue ? (
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase">{valueLabel || 'Venta:'}</span>
              <p className="text-xl font-black text-slate-900 tracking-tight">{value}</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold text-indigo-500 uppercase">{secondaryValueLabel || 'Desp:'}</span>
              <p className="text-xl font-black text-indigo-600 tracking-tight">{secondaryValue}</p>
            </div>
          </div>
        ) : (
          <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
        )}
        {subtitle && <p className="text-xs font-bold text-slate-500">{subtitle}</p>}
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
          <span className="text-slate-400">{progressLabel || (isNegative ? 'Diferencia: ' : 'Progreso: ')}</span>
          <span className={`${isNegative ? 'text-rose-500' : 'text-slate-700'}`}>{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
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

export default DashboardView;
