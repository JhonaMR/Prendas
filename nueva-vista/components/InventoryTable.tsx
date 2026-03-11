
import React from 'react';
import { InventoryItem } from '../types';

interface InventoryTableProps {
  items: InventoryItem[];
}

const InventoryTable: React.FC<InventoryTableProps> = ({ items }) => {
  const formatCurrency = (value: number) => {
    if (value === 0) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-r border-gray-100">Cliente / Dirección</th>
              <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center border-r border-gray-100">Referencia</th>
              <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right border-r border-gray-100">Precio</th>
              <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center border-r border-gray-100">Und Despachadas</th>
              <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-r border-gray-100">FV / Oficial</th>
              <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-r border-gray-100">Remi / ML</th>
              <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Vendedor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => {
              const isMediaNaranja = item.cliente.includes('MEDIA NARANJA');
              const isConfecciones = item.cliente.includes('COMERCIALIZADORA DE CONFECCIONES');
              
              return (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="font-bold text-gray-800 text-sm">{item.cliente}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{item.direccion || 'Sin dirección registrada'}</div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {item.cantidad > 0 ? (
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold">
                        {item.cantidad}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-5 text-right font-medium text-gray-600 text-sm">
                    {formatCurrency(item.precio)}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {item.undDespachadas > 0 ? (
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-bold ${
                        isMediaNaranja 
                          ? 'bg-red-50 text-red-600 border border-red-100 font-bold px-4 py-1.5 rounded-xl' 
                          : isConfecciones
                          ? 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200'
                          : 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                      }`}>
                        {item.undDespachadas}
                      </span>
                    ) : <span className="text-gray-300">0</span>}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-xs font-mono ${item.fvOficial === '-' || item.fvOficial === '0' ? 'text-gray-300' : 'text-blue-700 font-bold'}`}>
                      {item.fvOficial || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-xs font-mono ${item.remiMl === '-' || item.remiMl === '0' ? 'text-gray-300' : 'text-indigo-700 font-bold'}`}>
                      {item.remiMl || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{item.vendedor}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50/50">
            <tr>
              <td className="px-8 py-6 text-sm font-bold text-gray-500 text-right">TOTALES</td>
              <td className="px-6 py-6 text-center font-bold text-gray-800 text-base">244</td>
              <td className="px-6 py-6 text-right"></td>
              <td className="px-6 py-6 text-center">
                <span className="bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-100 font-bold">194</span>
              </td>
              <td colSpan={3} className="px-6 py-6">
                <div className="flex items-center gap-3">
                   <div className="bg-blue-600/10 text-blue-700 px-4 py-2 rounded-xl border border-blue-200 text-xs font-bold uppercase">
                    Faltan: 50 unidades
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
