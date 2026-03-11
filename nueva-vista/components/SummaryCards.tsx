
import React from 'react';
import { InventorySummary } from '../types';

interface SummaryCardsProps {
  summary: InventorySummary;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 text-center">
        <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Total Vendidas</p>
        <p className="text-2xl font-bold text-gray-800">{summary.totalVendidas}</p>
      </div>
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 text-center">
        <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Stock</p>
        <p className="text-2xl font-bold text-blue-600">{summary.stock}</p>
      </div>
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 text-center">
        <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Cortadas</p>
        <p className="text-2xl font-bold text-gray-800">{summary.cortadas}</p>
      </div>
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 text-center">
        <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Programadas</p>
        <p className="text-2xl font-bold text-gray-800">{summary.programadas}</p>
      </div>
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 text-center">
        <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Pendiente</p>
        <p className="text-2xl font-bold text-orange-500">{summary.pendiente}</p>
      </div>
      <div className="bg-blue-600 p-5 rounded-3xl shadow-lg shadow-blue-200 text-white text-center">
        <p className="text-blue-100 text-xs font-semibold uppercase mb-1">Faltan Despachar</p>
        <p className="text-2xl font-bold">{summary.faltanDespachar}</p>
      </div>
    </div>
  );
};

export default SummaryCards;
