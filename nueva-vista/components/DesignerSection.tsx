
import React from 'react';
import { DesignerPerformance } from '../types';

interface Props { designers: DesignerPerformance[]; }

const DesignerSection: React.FC<Props> = ({ designers }) => {
  const formatCur = (v: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
      <div className="bg-slate-800 px-10 py-6">
        <h2 className="text-xl font-bold text-white tracking-wide uppercase">Performance de Diseñadoras</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diseñadora</th>
              <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ventas Generadas</th>
              <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Ref. Creadas</th>
              <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Ref. Vendidas</th>
              <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">% Éxito Pedido</th>
              <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Refs en Cero</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {designers.map((d, i) => (
              <tr key={i} className="hover:bg-indigo-50/30 transition-colors group">
                <td className="px-10 py-6">
                  <span className="text-base font-bold text-slate-700 uppercase group-hover:text-indigo-600 transition-colors">{d.nombre}</span>
                </td>
                <td className="px-6 py-6 text-right">
                  <span className="text-sm font-bold text-slate-800">{formatCur(d.ventas)}</span>
                </td>
                <td className="px-6 py-6 text-center">
                   <span className="text-sm font-bold text-slate-600">{d.refCreadas}</span>
                </td>
                <td className="px-6 py-6 text-center">
                   <span className="text-sm font-black text-emerald-600">{d.refVendidas}</span>
                </td>
                <td className="px-6 py-6">
                   <div className="flex flex-col items-center gap-1">
                      <span className={`text-xs font-black ${d.porcentajePedidas >= 90 ? 'text-emerald-500' : 'text-slate-700'}`}>{d.porcentajePedidas}%</span>
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${d.porcentajePedidas >= 90 ? 'bg-emerald-500' : 'bg-slate-400'}`} style={{ width: `${d.porcentajePedidas}%` }}></div>
                      </div>
                   </div>
                </td>
                <td className="px-10 py-6 text-center">
                   <span className={`px-3 py-1 rounded-lg text-xs font-bold ${d.refEnCero > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
                    {d.refEnCero} ({d.porcentajeEnCero}%)
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DesignerSection;
