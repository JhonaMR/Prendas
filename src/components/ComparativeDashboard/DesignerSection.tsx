import React from 'react';
import { Correria } from '../../types';

interface DesignerData {
  designerName: string;
  refsCreadas: number;
  refsVendidas: number;
  porcentajeExito: number;
}

interface CorreriaData {
  correriaId: string;
  correriaName: string;
  designerData: DesignerData[];
}

interface Props {
  yearCorrerias: Correria[];
  correriaData: CorreriaData[];
  allDesigners: string[];
  selectedYear: number;
}

const DesignerSection: React.FC<Props> = ({ 
  yearCorrerias, 
  correriaData, 
  allDesigners,
  selectedYear 
}) => {
  const getFulfillmentColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (percentage >= 70) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (percentage >= 50) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-rose-100 text-rose-700 border-rose-200';
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex items-center gap-4">
        <div className="p-3 bg-rose-50 rounded-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-rose-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
          </svg>
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
              {yearCorrerias.map(c => (
                <th key={c.id} className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center min-w-[180px]">
                  {c.name}
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
                  {yearCorrerias.map(c => {
                    const correriaInfo = correriaData.find(cd => cd.correriaId === c.id);
                    const dData = correriaInfo?.designerData.find(d => d.designerName === designerName);
                    
                    if (dData && dData.refsCreadas > 0) {
                      totalSuccess += dData.porcentajeExito;
                      count++;
                    }

                    return (
                      <td key={c.id} className="px-8 py-6 text-center">
                        {dData && dData.refsCreadas > 0 ? (
                          <div className={`inline-flex flex-col items-center px-5 py-3 rounded-2xl border shadow-sm transition-transform hover:scale-105 ${getFulfillmentColor(dData.porcentajeExito)}`}>
                            <span className="text-lg font-black tracking-tighter leading-none">{dData.refsVendidas} / {dData.refsCreadas}</span>
                            <div className="flex items-center gap-1 mt-1.5">
                              <span className="text-[10px] font-black uppercase tracking-widest">{dData.porcentajeExito.toFixed(1)}%</span>
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
  );
};

export default DesignerSection;
