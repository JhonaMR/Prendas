import React from 'react';
import { Correria, Seller } from '../../types';

interface VendorData {
  sellerId: string;
  sellerName: string;
  vendidas: number;
  despachadas: number;
  valorVendido: number;
  valorDespachado: number;
  descuentos: number;
  cumplimientoUnd: number;
  cumplimientoVlr: number;
}

interface CorreriaData {
  correriaId: string;
  correriaName: string;
  vendorData: VendorData[];
}

interface Props {
  yearCorrerias: Correria[];
  correriaData: CorreriaData[];
  allVendors: Seller[];
  vendorView: 'units' | 'value' | 'discounts';
  setVendorView: (view: 'units' | 'value' | 'discounts') => void;
  selectedYear: number;
}

const VendorSection: React.FC<Props> = ({ 
  yearCorrerias, 
  correriaData, 
  allVendors, 
  vendorView, 
  setVendorView,
  selectedYear 
}) => {
  const formatCur = (v: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
  const formatCompactCur = (v: number) => `$${(v / 1000000).toFixed(0)}M`;

  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-indigo-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-3.833-6.247 4.103 4.103 0 01-2.913-6.236 4.125 4.125 0 00-7.494 0 4.103 4.103 0 01-2.913 6.236 4.125 4.125 0 00-3.833 6.247 9.337 9.337 0 004.121.952 9.38 9.38 0 002.625-.372" />
            </svg>
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
              {yearCorrerias.map(c => (
                <th key={c.id} className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center min-w-[180px]">
                  {c.name}
                </th>
              ))}
              <th className="px-8 py-5 text-[11px] font-black text-indigo-600 uppercase tracking-widest border-b border-slate-100 text-center bg-indigo-50/30">
                {vendorView === 'discounts' ? 'Total Descuentos' : 'Promedio Anual'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allVendors.map(seller => {
              let totalFulfillment = 0;
              let totalDiscount = 0;
              let count = 0;

              return (
                <tr key={seller.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 font-black text-slate-800 border-r border-slate-100 sticky left-0 bg-white z-10 text-base">
                    {seller.name}
                  </td>
                  {yearCorrerias.map(c => {
                    const correriaInfo = correriaData.find(cd => cd.correriaId === c.id);
                    const vData = correriaInfo?.vendorData.find(v => v.sellerId === seller.id);
                    
                    if (vData && vData.vendidas > 0) {
                      totalFulfillment += vendorView === 'units' ? vData.cumplimientoUnd : vData.cumplimientoVlr;
                      totalDiscount += vData.descuentos || 0;
                      count++;
                    }

                    return (
                      <td key={c.id} className="px-8 py-6 text-center">
                        {vData && vData.vendidas > 0 ? (
                          vendorView === 'units' ? (
                            <div className="inline-flex flex-col items-center px-5 py-3 rounded-2xl border shadow-sm transition-transform hover:scale-105 bg-blue-100 text-blue-700 border-blue-200">
                              <span className="text-lg font-black tracking-tighter leading-none">{vData.despachadas} / {vData.vendidas}</span>
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
  );
};

export default VendorSection;
