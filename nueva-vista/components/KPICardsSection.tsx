
import React from 'react';
import { SalesKPIs } from '../types';

interface Props { kpis: SalesKPIs; }

const KPICardsSection: React.FC<Props> = ({ kpis }) => {
  const formatCur = (v: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

  // Calculate new difference based on user request: Total Vendido - Total Despachado
  const diffVentaDespacho = kpis.ventasTotalesPesos - kpis.despachosRealesReal;
  const pctDiff = ((diffVentaDespacho / kpis.ventasTotalesPesos) * 100).toFixed(1);
  const pctCumplimientoVlr = ((kpis.despachosRealesReal / kpis.ventasTotalesPesos) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
      {/* Refs Box - Adjusted vertical distribution */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 relative overflow-hidden group md:col-span-5 lg:col-span-3">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
        <div className="relative h-full flex flex-col">
          <h3 className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-6">Referencias (Maleta)</h3>
          
          <div className="flex-1 flex flex-col justify-center space-y-6 mb-8">
            <div>
              <p className="text-2xl font-black text-slate-800 tracking-tighter">{kpis.cantReferencias}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total referencias únicas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600 tracking-tighter">{kpis.referenciasCero}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Referencias en cero ({kpis.porcentajeCero}%)</p>
            </div>
          </div>

          <div className="mt-auto">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-400 rounded-full" style={{ width: `${100 - kpis.porcentajeCero}%` }}></div>
            </div>
            <p className="text-[10px] font-bold text-orange-500 mt-2 uppercase">Efectividad Ref: {(100 - kpis.porcentajeCero).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Sales Box - Adjusted vertical distribution */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 relative overflow-hidden group md:col-span-5 lg:col-span-3">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
        <div className="relative h-full flex flex-col">
          <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-6">Ventas vs Despachos</h3>
          
          <div className="flex-1 flex flex-col justify-center space-y-6 mb-8">
            <div>
              <p className="text-2xl font-black text-slate-800 tracking-tighter">{kpis.ventasTotalesUnd}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Unidades Vendidas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 tracking-tighter">{kpis.despachosTotalesUnd}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Unidades Despachadas</p>
            </div>
          </div>

          <div className="mt-auto">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${kpis.porcentajeDespacho}%` }}></div>
            </div>
            <p className="text-[10px] font-bold text-blue-500 mt-2 uppercase">Cumplimiento: {kpis.porcentajeDespacho}%</p>
          </div>
        </div>
      </div>

      {/* Money Box - Title updated to 'Resumen Financiero' */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 md:col-span-10 lg:col-span-4 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full -mr-24 -mt-24 transition-transform group-hover:scale-110"></div>
         <div className="flex flex-col md:flex-row justify-between h-full gap-8 relative">
            <div className="flex-1 flex flex-col">
              <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-6">Resumen Financiero</h3>
              <div className="flex-1 flex flex-col justify-center space-y-6 mb-8">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Total Vendido</span>
                  <p className="text-2xl font-black text-slate-800 tracking-tight">{formatCur(kpis.ventasTotalesPesos)}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Total Despachado</span>
                  <p className="text-2xl font-bold text-blue-600 tracking-tight">{formatCur(kpis.despachosRealesReal)}</p>
                </div>
              </div>
              
              <div className="mt-auto">
                 <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pctCumplimientoVlr}%` }}></div>
                 </div>
                 <p className="text-[10px] font-bold text-emerald-500 mt-2 uppercase">Cumplimiento: {pctCumplimientoVlr}%</p>
              </div>
            </div>
            
            <div className="md:w-px md:h-full bg-slate-100"></div>
            
            <div className="flex flex-col justify-center text-right min-w-[150px]">
               <h3 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Diferencia Faltante</h3>
               <p className="text-2xl font-black text-rose-500">{formatCur(diffVentaDespacho)}</p>
               <div className="inline-flex justify-end mt-1">
                 <span className="px-3 py-1 bg-rose-50 text-rose-500 text-[11px] font-black rounded-lg uppercase border border-rose-100">
                    -{pctDiff}% de Venta
                 </span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default KPICardsSection;
