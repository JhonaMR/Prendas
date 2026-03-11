
import React from 'react';
import { ProductionItem } from '../types';

interface Props { items: ProductionItem[]; }

const ProductionKPIs: React.FC<Props> = ({ items }) => {
  const totalLotes = items.length;
  const enProceso = items.filter(i => !i.fechaEntrega).length;
  
  // Calculate lots with delay >= 20 days
  const prioritarios = items.filter(i => {
    if (!i.fechaEntrega) {
      // For items in process, compare budgeted date with "today" (simulated as Jan 30, 2026 based on mock data context)
      const today = new Date('2026-01-30');
      const bud = new Date(i.fechaPresupuestada);
      const diff = Math.floor((today.getTime() - bud.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 20;
    } else {
      // For delivered items, use the actual difference
      const bud = new Date(i.fechaPresupuestada);
      const del = new Date(i.fechaEntrega);
      const diff = Math.floor((del.getTime() - bud.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 20;
    }
  }).length;

  // Calculate average delay for those delivered
  const deliveredItems = items.filter(i => i.fechaEntrega);
  let totalDelay = 0;
  deliveredItems.forEach(i => {
    const bud = new Date(i.fechaPresupuestada);
    const del = new Date(i.fechaEntrega!);
    const diff = Math.floor((del.getTime() - bud.getTime()) / (1000 * 60 * 60 * 24));
    totalDelay += diff;
  });
  const avgDelay = deliveredItems.length > 0 ? (totalDelay / deliveredItems.length).toFixed(1) : "0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* New Priority Box */}
      <div className="bg-rose-50 rounded-[2rem] p-8 shadow-sm border border-rose-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
        <div className="relative">
          <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-2">Lotes de atención prioritaria</p>
          <p className="text-3xl font-black text-rose-600">{prioritarios}</p>
          <p className="text-[10px] font-bold text-rose-400 mt-2 uppercase">lotes con 20 días de retraso</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">Lotes en Proceso</p>
        <p className="text-3xl font-black text-amber-600">{enProceso}</p>
        <p className="text-[10px] font-bold text-amber-400 mt-2">PENDIENTES POR ENTREGAR</p>
      </div>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-2">Retraso Promedio</p>
        <p className="text-3xl font-black text-rose-600">{avgDelay} <span className="text-sm font-bold uppercase">Días</span></p>
        <p className="text-[10px] font-bold text-rose-400 mt-2">RESPECTO A FECHA PACTADA</p>
      </div>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Eficiencia Entrega</p>
        <p className="text-3xl font-black text-emerald-600">{((deliveredItems.length / totalLotes) * 100).toFixed(0)}%</p>
        <p className="text-[10px] font-bold text-emerald-400 mt-2">CUMPLIMIENTO DE CRONOGRAMA</p>
      </div>
    </div>
  );
};

export default ProductionKPIs;
