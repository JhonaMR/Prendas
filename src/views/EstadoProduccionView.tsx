import React, { useState, useMemo } from 'react';
import { useDarkMode } from '../context/DarkModeContext';
import { AppState } from '../types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TextAutocomplete from '../components/TextAutocomplete';

interface EstadoProduccionViewProps {
  state: AppState;
}

const EstadoProduccionView: React.FC<EstadoProduccionViewProps> = ({ state }) => {
  const { correrias, orders, dispatches, productionTracking, references, deliveryDates } = state;
  const { isDark } = useDarkMode();

  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [selectedCorreria, setSelectedCorreria] = useState<string>('todas');

  // Obtener años únicos de las correrías disponibles
  const availableYears = useMemo(() => {
    const years = new Set<string>(correrias.map(c => c.year).filter((y): y is string => !!y));
    years.add(currentYear); // Asegurar que el año actual siempre esté
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [correrias, currentYear]);

  // Filtrar correrías según el año seleccionado
  const filteredCorrerias = useMemo(() => {
    if (selectedYear === 'todos') {
      return correrias;
    }
    return correrias.filter(c => c.year === selectedYear);
  }, [correrias, selectedYear]);

  // Manejador para el cambio de año (reinicia la correría a 'todas')
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
    setSelectedCorreria('todas');
  };

  // Obtener IDs de las correrías filtradas
  const aplicableCorreriaIds = useMemo(() => {
    if (selectedCorreria !== 'todas') return [selectedCorreria];
    return filteredCorrerias.map(c => c.id);
  }, [selectedCorreria, filteredCorrerias]);

  const pedidosFiltrados = useMemo(() => {
    const idsSet = new Set(aplicableCorreriaIds);
    return orders.filter(o => idsSet.has(o.correriaId));
  }, [orders, aplicableCorreriaIds]);

  const cantidadPedidos = pedidosFiltrados.length;

  // Cálculos para la primera sección: Unidades por despachar
  const { unidadesVendidas, unidadesDespachadas } = useMemo(() => {
    const idsSet = new Set(aplicableCorreriaIds);

    const vendidas = pedidosFiltrados
      .reduce((sum, order) => sum + order.items.reduce((acc, item) => acc + item.quantity, 0), 0);

    const despachadas = dispatches
      .filter(d => idsSet.has(d.correriaId))
      .reduce((sum, dispatch) => sum + dispatch.items.reduce((acc, item) => acc + item.quantity, 0), 0);

    return { unidadesVendidas: vendidas, unidadesDespachadas: despachadas };
  }, [orders, dispatches, aplicableCorreriaIds]);

  const unidadesPorDespachar = Math.max(0, unidadesVendidas - unidadesDespachadas);

  const porcentajeDespachado = unidadesVendidas > 0 ? (unidadesDespachadas / unidadesVendidas) * 100 : 0;

  const pieDataUnidades = unidadesVendidas > 0 
    ? [
        { name: 'Despachado', value: unidadesDespachadas },
        { name: 'Por despachar', value: unidadesPorDespachar },
      ]
    : [];

  // Cálculos para la segunda sección: Cantidad por producir
  const { inventarioTotal, cortadasTotal } = useMemo(() => {
    const idsSet = new Set(aplicableCorreriaIds);
    let inv = 0;
    let cut = 0;
    
    productionTracking.forEach(p => {
      if (idsSet.has(p.correriaId)) {
        inv += p.inventory || 0;
        cut += p.cut || 0;
      }
    });

    return { inventarioTotal: inv, cortadasTotal: cut };
  }, [productionTracking, aplicableCorreriaIds]);

  const unidadesPorProducir = Math.max(0, unidadesVendidas - (inventarioTotal + cortadasTotal));

  const pieDataProducir = unidadesVendidas > 0
    ? [
        { name: 'Producido', value: inventarioTotal + cortadasTotal },
        { name: 'Por Producir', value: unidadesPorProducir }
      ]
    : [];

  const porcentajeProducido = unidadesVendidas > 0 ? Math.min(100, ((inventarioTotal + cortadasTotal) / unidadesVendidas) * 100) : 0;

  // Cálculos para la tercera sección: Faltantes por despachar producidas
  const cantUndPendientes = useMemo(() => {
    const idsSet = new Set(aplicableCorreriaIds);
    const applicableRefs = new Set(
      references
        .filter(ref => ref.correrias?.some(cId => idsSet.has(cId)))
        .map(ref => ref.id)
    );

    const pending = deliveryDates.filter(d => 
      !d.deliveryDate && 
      d.process?.trim() && 
      applicableRefs.has(d.referenceId)
    );

    const byProcess = new Map<string, typeof pending>();
    pending.forEach(d => {
      const proc = d.process.trim();
      if (!byProcess.has(proc)) byProcess.set(proc, []);
      byProcess.get(proc)!.push(d);
    });

    let totalCantUnd = 0;
    for (const [proc, rows] of Array.from(byProcess.entries())) {
      const uniqueRefs = new Set(rows.map(r => r.referenceId));
      const procTotalUnd = Array.from(uniqueRefs).reduce<number>((total, refId) => {
        const refRows = rows.filter(r => r.referenceId === refId);
        const uniqueQtys = new Set<number>(refRows.map(r => r.quantity || 0));
        const refTotal = Array.from(uniqueQtys).reduce((s, q) => s + q, 0);
        return total + refTotal;
      }, 0);
      totalCantUnd += procTotalUnd;
    }

    return totalCantUnd;
  }, [references, deliveryDates, aplicableCorreriaIds]);

  const pendienteFinal = cortadasTotal - cantUndPendientes;

  const pieDataFaltantes = cortadasTotal > 0
    ? [
        { name: 'Cant. Und (En Proceso)', value: cantUndPendientes },
        { name: 'Pendiente', value: Math.max(0, pendienteFinal) }
      ]
    : [];

  const porcentajeTercera = cortadasTotal > 0 ? Math.min(100, (cantUndPendientes / cortadasTotal) * 100) : 0;

  return (
    <div className={`p-6 md:p-8 rounded-[32px] ${isDark ? 'bg-[#4a3a63] text-violet-50' : 'bg-white shadow-sm border border-slate-200 text-slate-800'}`}>
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 mb-6 border-slate-200 dark:border-violet-700/50">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Estado de Producción</h1>
          <p className={`text-sm mt-1 font-medium ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>
            Monitoreo y seguimiento de lotes en proceso
          </p>
        </div>

        {/* CONTROLES DERECHA */}
        <div className="flex items-center gap-6">
          
          {/* Dato: Cantidad de pedidos tomados */}
          <div className={`flex flex-col items-end pr-6 border-r ${isDark ? 'border-violet-700/50' : 'border-slate-200'}`}>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>
              Pedidos Tomados
            </span>
            <span className={`text-2xl font-black tracking-tighter ${isDark ? 'text-violet-100' : 'text-slate-800'}`}>
              {cantidadPedidos}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Selector de Año */}
            <div className="flex flex-col w-28">
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>
                Año
              </label>
              <TextAutocomplete
                value={selectedYear === 'todos' ? '' : selectedYear}
                suggestions={availableYears}
                onChange={(val) => {
                  setSelectedYear(val || 'todos');
                  setSelectedCorreria('todas');
                }}
                placeholder="Todos"
                isDark={isDark}
                className="!h-10 !rounded-xl !px-3"
              />
            </div>

            {/* Selector de Correría */}
            <div className="flex flex-col min-w-[200px]">
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>
                Correría
              </label>
              <select
                value={selectedCorreria}
                onChange={(e) => setSelectedCorreria(e.target.value)}
                className={`h-10 px-4 rounded-xl font-bold appearance-none bg-no-repeat focus:outline-none transition-colors border ${
                  isDark 
                    ? 'bg-violet-900/50 text-violet-100 border-violet-700 focus:border-pink-500' 
                    : 'bg-slate-50 text-slate-700 border-slate-200 focus:border-blue-500'
                }`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${isDark ? '%23a78bfa' : '%2394a3b8'}' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="todas">Todas las correrías</option>
                {filteredCorrerias.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIONES */}
      <div className="mt-8 flex flex-col gap-6">
        <ProductionSection
          title="Unidades por despachar"
          stats={[
            { label: 'Unidades Vendidas', value: unidadesVendidas, colorClass: isDark ? 'text-blue-400' : 'text-blue-600' },
            { label: 'Unidades Despachadas', value: unidadesDespachadas, colorClass: isDark ? 'text-emerald-400' : 'text-emerald-600' },
            { label: 'Por Despachar', value: unidadesPorDespachar, colorClass: isDark ? 'text-pink-400' : 'text-pink-600' }
          ]}
          pieData={pieDataUnidades}
          centerPercentage={porcentajeDespachado}
        />
        <ProductionSection
          title="Cantidad por producir"
          stats={[
            { label: 'Unidades Vendidas', value: unidadesVendidas, colorClass: isDark ? 'text-blue-400' : 'text-blue-600' },
            { label: 'Inventario', value: inventarioTotal, colorClass: isDark ? 'text-amber-400' : 'text-amber-600' },
            { label: 'Cortadas', value: cortadasTotal, colorClass: isDark ? 'text-purple-400' : 'text-purple-600' },
            { label: 'Und. por producir', value: unidadesPorProducir, colorClass: isDark ? 'text-pink-400' : 'text-pink-600' }
          ]}
          pieData={pieDataProducir}
          centerPercentage={porcentajeProducido}
        />
        <ProductionSection
          title="Faltantes por despachar producidas"
          stats={[
            { label: 'Cortadas', value: cortadasTotal, colorClass: isDark ? 'text-purple-400' : 'text-purple-600' },
            { label: 'Cant. Und (En Proceso)', value: cantUndPendientes, colorClass: isDark ? 'text-blue-400' : 'text-blue-600' },
            { label: 'Pendiente', value: pendienteFinal, colorClass: isDark ? 'text-pink-400' : 'text-pink-600' }
          ]}
          pieData={pieDataFaltantes}
          centerPercentage={porcentajeTercera}
        />
      </div>

    </div>
  );
};

// Interfaces para los datos de la sección
interface StatProps {
  label: string;
  value: number;
  colorClass?: string;
}

interface ProductionSectionProps {
  title: string;
  stats: StatProps[];
  pieData: any[];
  centerPercentage?: number;
}

// Subcomponente para cada sección
const ProductionSection = ({ title, stats, pieData, centerPercentage }: ProductionSectionProps) => {
  const { isDark } = useDarkMode();
  // Colores modernos para las gráficas
  const COLORS = ['#10b981', '#ec4899', '#3b82f6', '#8b5cf6', '#f59e0b'];

  return (
    <div className={`p-6 md:p-8 rounded-[2rem] border flex flex-col md:flex-row md:items-center gap-8 transition-all duration-500 hover:shadow-2xl ${
      isDark 
        ? 'border-violet-700/40 bg-gradient-to-br from-[#3d2d52]/90 to-[#2e1f42]/90 shadow-[0_0_40px_rgba(139,92,246,0.05)] hover:border-violet-500/50' 
        : 'border-slate-100 bg-white shadow-xl shadow-slate-200/40 hover:shadow-slate-300/60'
    }`}>
      {/* Lado Izquierdo: Datos */}
      <div className="flex-1 w-full flex flex-col justify-center pr-0 md:pr-4">
        <h3 className={`text-2xl font-black mb-6 tracking-tight flex items-center gap-3 ${isDark ? 'text-violet-100' : 'text-slate-800'}`}>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner ${isDark ? 'bg-gradient-to-br from-violet-600/40 to-fuchsia-600/40 text-violet-300 border border-violet-500/30' : 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 border border-blue-200'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118.25 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
            </svg>
          </div>
          {title}
        </h3>
        <div className="flex flex-col gap-4">
          {stats.map((stat, i) => {
            // Convertimos la clase de texto (ej. text-blue-500) a clase de fondo (ej. bg-blue-500)
            const bgColorClass = stat.colorClass ? stat.colorClass.replace('text-', 'bg-') : 'bg-violet-500';
            
            return (
              <div 
                key={i} 
                className={`group relative overflow-hidden p-5 rounded-2xl flex items-center justify-between border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default ${
                  isDark 
                    ? 'bg-gradient-to-r from-violet-900/10 to-transparent border-violet-700/40 hover:border-violet-500' 
                    : 'bg-gradient-to-r from-slate-50 to-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Barra de color lateral */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 ${bgColorClass} opacity-80 group-hover:opacity-100 group-hover:w-2`} />
                
                <div className="pl-3 flex flex-col gap-1">
                  <span className={`text-[11px] md:text-xs font-black uppercase tracking-widest transition-colors duration-300 ${isDark ? 'text-violet-300 group-hover:text-violet-200' : 'text-slate-500 group-hover:text-slate-700'}`}>
                    {stat.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-2xl md:text-3xl font-black tracking-tight ${stat.colorClass || (isDark ? 'text-violet-100' : 'text-slate-800')}`}>
                    {stat.value.toLocaleString()}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-violet-400/70' : 'text-slate-400'}`}>
                    uds
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lado Derecho: Gráfica de Torta */}
      <div className="flex-1 w-full h-[280px] min-h-[280px] flex items-center justify-center relative">
        {pieData && pieData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip 
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                backgroundColor: isDark ? '#2e1f42' : '#ffffff',
                color: isDark ? '#fff' : '#333',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                fontWeight: 'bold'
              }} 
              itemStyle={{ color: isDark ? '#e2e8f0' : '#475569' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              formatter={(value) => <span className={`text-sm font-semibold ${isDark ? 'text-violet-200' : 'text-slate-600'}`}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>

        {centerPercentage !== undefined && (
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" 
            style={{ paddingBottom: '36px' }} // Compensar el alto de la leyenda (height=36)
          >
            <span className={`text-2xl md:text-3xl font-black ${isDark ? 'text-violet-100' : 'text-slate-700'}`}>
              {centerPercentage.toFixed(1)}%
            </span>
          </div>
        )}
        </>
        ) : (
          <div className={`flex flex-col items-center justify-center w-full h-full rounded-full aspect-square max-w-[200px] border-8 ${
            isDark ? 'border-violet-900/30' : 'border-slate-100'
          }`}>
            <span className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-violet-500' : 'text-slate-400'}`}>Sin Datos</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstadoProduccionView;
