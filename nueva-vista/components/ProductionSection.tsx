
import React from 'react';
import { ProductionItem } from '../types';

interface Props { items: ProductionItem[]; }

const ProductionSection: React.FC<Props> = ({ items }) => {
  const diffDays = (d1: string, d2: string) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (d?: string) => {
    if (!d) return '-';
    return d.split('-').reverse().join('/');
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-50 z-10">Confeccionistas y Terceros</th>
              <th className="px-4 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Ref.</th>
              <th className="px-4 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Cant.</th>
              
              {/* Yellow headers group */}
              <th className="px-4 py-6 text-[10px] font-bold text-amber-700 uppercase tracking-widest text-center bg-amber-50">Fecha Envío Lote</th>
              <th className="px-4 py-6 text-[10px] font-bold text-amber-700 uppercase tracking-widest text-center bg-amber-50">Fecha Presup. Entrega</th>
              
              {/* Blue headers group */}
              <th className="px-4 py-6 text-[10px] font-bold text-blue-700 uppercase tracking-widest text-center bg-blue-50">Fecha Entrega</th>
              
              <th className="px-4 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Dif en Fechas</th>
              <th className="px-4 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Rot. Inicial</th>
              <th className="px-4 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Rot. Final</th>
              <th className="px-4 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Rot Final vs Rot Ini</th>
              <th className="px-4 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Proceso</th>
              <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Observación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const rotInicial = diffDays(item.fechaEnvio, item.fechaPresupuestada);
              const hasEntrega = !!item.fechaEntrega;
              const rotFinal = hasEntrega ? diffDays(item.fechaEnvio, item.fechaEntrega!) : null;
              const diffFechas = hasEntrega ? diffDays(item.fechaPresupuestada, item.fechaEntrega!) : null;
              const rotVsRot = (rotFinal !== null) ? rotFinal - rotInicial : null;

              return (
                <tr key={item.id} className="hover:bg-indigo-50/20 transition-colors text-xs">
                  <td className="px-6 py-4 font-bold text-slate-900 sticky left-0 bg-white group-hover:bg-indigo-50/20 z-10 border-r border-slate-50">
                    {item.tercero}
                  </td>
                  <td className="px-4 py-4 text-center font-mono font-bold text-slate-600">{item.referencia}</td>
                  <td className="px-4 py-4 text-center font-black text-slate-800">{item.cantidad}</td>
                  
                  {/* Phase 1: Planning (Yellowish) */}
                  <td className="px-4 py-4 text-center bg-amber-50/30 text-amber-800 font-bold">{formatDate(item.fechaEnvio)}</td>
                  <td className="px-4 py-4 text-center bg-amber-50/30 text-amber-800 font-bold">{formatDate(item.fechaPresupuestada)}</td>
                  
                  {/* Phase 2: Completion (Blueish) */}
                  <td className={`px-4 py-4 text-center bg-blue-50/30 font-bold ${hasEntrega ? 'text-blue-800' : 'text-slate-300 italic'}`}>
                    {formatDate(item.fechaEntrega)}
                  </td>
                  
                  {/* Metrics */}
                  <td className={`px-4 py-4 text-center font-black ${diffFechas !== null && diffFechas > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {diffFechas !== null ? diffFechas : ''}
                  </td>
                  <td className="px-4 py-4 text-center text-slate-600 font-medium">{rotInicial}</td>
                  <td className="px-4 py-4 text-center text-slate-600 font-black">{rotFinal !== null ? rotFinal : ''}</td>
                  <td className={`px-4 py-4 text-center font-black ${(rotVsRot !== null && rotVsRot > 0) ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {rotVsRot !== null ? rotVsRot : ''}
                  </td>
                  
                  <td className="px-4 py-4 text-center">
                    <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase">{item.proceso}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 italic max-w-xs truncate">{item.observacion || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductionSection;
