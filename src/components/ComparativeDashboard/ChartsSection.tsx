import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface CorreriaData {
  correriaId: string;
  correriaName: string;
  totalVendidas: number;
  totalDespachadas: number;
  totalVendidoValor: number;
  totalDespachadoValor: number;
}

interface Props {
  correriaData: CorreriaData[];
  totalVentasYear: number;
}

const ChartsSection: React.FC<Props> = ({ correriaData, totalVentasYear }) => {
  const formatCur = (v: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

  // Data for bar chart
  const barChartData = correriaData.map(c => ({
    name: c.correriaName.split(' ')[0], // Short name
    ventas: c.totalVendidoValor,
    despachos: c.totalDespachadoValor,
  }));

  // Data for pie chart
  const pieChartData = correriaData.map(c => ({
    name: c.correriaName,
    value: c.totalVendidoValor,
  }));

  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Bar Chart */}
      <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Venta vs Despacho por Correría</h3>
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <span className="text-slate-500">Ventas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              <span className="text-slate-500">Despachos</span>
            </div>
          </div>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                hide
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 11 }}
                tickFormatter={(v) => `${v / 1000000}M`}
              />
              <Tooltip 
                cursor={{ fill: '#F8FAFC' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(v: number) => [formatCur(v), '']}
              />
              <Bar dataKey="ventas" fill="#6366F1" radius={[6, 6, 0, 0]} barSize={40} />
              <Bar dataKey="despachos" fill="#34D399" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8">Distribución de Venta</h3>
        <div className="h-[250px] w-full mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCur(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-4">
          {correriaData.map((item, idx) => (
            <div key={item.correriaId} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                <span className="text-sm font-bold text-slate-600">{item.correriaName}</span>
              </div>
              <span className="text-sm font-black text-slate-900">
                {((item.totalVendidoValor / totalVentasYear) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
