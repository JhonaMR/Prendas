
import React from 'react';
import { VendorPerformance, SalesKPIs } from '../types';

interface Props { vendors: VendorPerformance[]; totals: SalesKPIs; }

const VendorSection: React.FC<Props> = ({ vendors, totals }) => {
  const formatCur = (v: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

  // Sum up pedidos from the vendor list
  const totalPedidos = vendors.reduce((sum, v) => sum + v.pedidos, 0);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
      <div className="bg-blue-600 px-10 py-6">
        <h2 className="text-xl font-bold text-white tracking-wide uppercase">Análisis de Vendedores</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vendedor</th>
              <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Pedidos</th>
              <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Vendidas vs Despachadas</th>
              <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ventas ($)</th>
              <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Cumplimiento (Und)</th>
              <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Cumplimiento (Valor)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vendors.map((v, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-10 py-6">
                  {/* Vendor name font size increased */}
                  <span className="text-base font-bold text-slate-900 uppercase tracking-wider">{v.nombre}</span>
                  <div className="text-[10px] font-bold text-blue-500 mt-1">{v.porcentajeSobreVenta}% de la venta total</div>
                </td>
                <td className="px-6 py-6 text-center">
                  <span className="inline-flex bg-slate-100 text-slate-600 px-4 py-1.5 rounded-lg text-sm font-bold">{v.pedidos}</span>
                </td>
                <td className="px-6 py-6 text-center">
                  <div className="text-base font-black text-slate-800">{v.undVendidas} <span className="text-slate-300 mx-1 font-normal">/</span> <span className="text-blue-600">{v.undDespachadas}</span></div>
                </td>
                <td className="px-6 py-6 text-right">
                  <div className="text-sm font-bold text-slate-800">{formatCur(v.valorVendido)}</div>
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-xs font-bold text-slate-700">{v.cumplimientoUnd}%</span>
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${v.cumplimientoUnd}%` }}></div>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-6">
                   <div className="flex items-center justify-center gap-3">
                    <span className="text-xs font-bold text-blue-600">{v.cumplimientoVlr}%</span>
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${v.cumplimientoVlr}%` }}></div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50/80 border-t-2 border-slate-200">
            <tr>
              <td className="px-10 py-8 text-xs font-black text-slate-500 uppercase tracking-widest">Totales Consolidado</td>
              <td className="px-6 py-8 text-center text-sm font-black text-slate-900">{totalPedidos}</td>
              <td className="px-6 py-8 text-center text-base font-black text-slate-900">{totals.ventasTotalesUnd} / {totals.despachosTotalesUnd}</td>
              <td className="px-6 py-8 text-right text-sm font-black text-slate-900">{formatCur(totals.ventasTotalesPesos)}</td>
              <td className="px-6 py-8 text-center">
                <div className="inline-flex bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-xs font-black ring-1 ring-emerald-200 uppercase">
                  42.1% Global (Und)
                </div>
              </td>
              <td className="px-10 py-8 text-center">
                 <div className="inline-flex bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-xs font-black ring-1 ring-blue-200 uppercase">
                  40.2% Global (Valor)
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default VendorSection;
