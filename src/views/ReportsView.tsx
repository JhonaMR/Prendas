
import React, { useMemo, useState } from 'react';
import { AppState, BatchReception, Dispatch, Client, UserRole, User, Confeccionista } from '../types';

interface ReportsViewProps {
  state: AppState;
  user: User;
}

const ReportsView: React.FC<ReportsViewProps> = ({ state, user }) => {
  const [reportType, setReportType] = useState<'kardex' | 'ref' | 'client' | 'seller' | 'conf' | 'prod_conf'>('kardex');
  const [refInput, setRefInput] = useState('');
  const [clientInput, setClientInput] = useState('');
  const [sellerInput, setSellerInput] = useState('');
  const [confStatusFilter, setConfStatusFilter] = useState<'active' | 'all'>('active');
  const [selectedCorreriaId, setSelectedCorreriaId] = useState('global');

  const kardexData = useMemo(() => {
    const data: Record<string, { in: number, out: number, av: number, lots: number }> = {};
    state.receptions.forEach(r => {
      const uniqueRefsInThisBatch = new Set<string>();
      r.items.forEach(i => {
        if (!data[i.reference]) data[i.reference] = { in: 0, out: 0, av: 0, lots: 0 };
        data[i.reference].in += i.quantity;
        data[i.reference].av += i.quantity;
        uniqueRefsInThisBatch.add(i.reference);
      });
      uniqueRefsInThisBatch.forEach(ref => { if (data[ref]) data[ref].lots += 1; });
    });
    state.dispatches.forEach(d => d.items.forEach(i => {
      if (!data[i.reference]) data[i.reference] = { in: 0, out: 0, av: 0, lots: 0 };
      data[i.reference].out += i.quantity;
      data[i.reference].av -= i.quantity;
    }));
    return data;
  }, [state.receptions, state.dispatches]);

  const downloadCSV = (title: string, headers: string[], rows: string[][]) => {
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title}_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderKardex = () => {
    const sorted = Object.entries(kardexData).sort((a,b)=>a[0].localeCompare(b[0]));
    return (
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
        <div className="p-10 bg-blue-50 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-2xl font-black text-blue-900 tracking-tighter">Kardex Global</h3>
          {/* Added type cast [string, any] to fix unknown type error when accessing lots, in, out, av on line 60-61 */}
          <button onClick={() => downloadCSV('Kardex', ['Referencia', 'Lotes', 'Entradas', 'Salidas', 'Stock'], sorted.map(([ref, stats]: [string, any]) => [ref, stats.lots.toString(), stats.in.toString(), stats.out.toString(), stats.av.toString()]))} className="px-4 py-2 bg-white text-blue-600 rounded-xl font-bold text-[10px] uppercase shadow-sm border border-blue-100">Excel (CSV)</button>
        </div>
        <table className="w-full text-left">
          <thead><tr className="bg-slate-50"><th className="px-10 py-6 text-[10px] font-black uppercase text-slate-700">Referencia</th><th className="px-6 py-6 text-center text-[10px] font-black uppercase text-slate-700">Lots</th><th className="px-10 py-6 text-right text-[10px] font-black uppercase text-slate-700">Entradas</th><th className="px-10 py-6 text-right text-[10px] font-black uppercase text-slate-700">Salidas</th><th className="px-10 py-6 text-right text-[10px] font-black uppercase text-slate-700">Stock</th></tr></thead>
          <tbody>
            {sorted.map(([ref, stats]: [string, any]) => (
              <tr key={ref} className="hover:bg-slate-50 border-b border-slate-50 last:border-0"><td className="px-10 py-6 font-black text-slate-800">{ref}</td><td className="px-6 py-6 text-center font-bold text-slate-600">{stats.lots}</td><td className="px-10 py-6 text-right font-bold text-slate-500">{stats.in}</td><td className="px-10 py-6 text-right font-bold text-pink-400">{stats.out}</td><td className="px-10 py-6 text-right"><span className="px-4 py-1.5 bg-blue-100 text-blue-600 font-black rounded-xl">{stats.av}</span></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderRefDetail = () => {
    let refsToShow = state.references.sort((a,b)=>a.id.localeCompare(b.id));
    if (refInput) refsToShow = refsToShow.filter(r => r.id.includes(refInput.toUpperCase()));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {refsToShow.map(r => {
            const stats = kardexData[r.id] || { in: 0, out: 0, av: 0, lots: 0 };
            return (
              <div key={r.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                   <h4 className="text-2xl font-black text-indigo-600 tracking-tighter">{r.id}</h4>
                   <span className="text-[9px] font-black bg-slate-50 px-3 py-1 rounded-full uppercase text-slate-400">{r.designer}</span>
                </div>
                <p className="text-xs font-bold text-slate-600 mb-6 uppercase">{r.description}</p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-50 rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase mb-1">Entradas</p><p className="font-black text-slate-800">{stats.in}</p></div>
                   <div className="p-4 bg-slate-50 rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase mb-1">Salidas</p><p className="font-black text-pink-500">{stats.out}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderConfReport = () => {
    let list = (state.confeccionistas || []).sort((a,b) => a.name.localeCompare(b.name));
    if (confStatusFilter === 'active') list = list.filter(c => c.active);

    return (
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
        <div className="p-10 bg-indigo-50 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-indigo-900 tracking-tighter">Maestro de Confeccionistas</h3>
            <p className="text-indigo-400 text-xs font-bold uppercase mt-1">Total listados: {list.length}</p>
          </div>
          <button 
            onClick={() => downloadCSV('Confeccionistas', ['Cédula', 'Nombre', 'Dirección', 'Ciudad', 'Celular', 'Score', 'Activo'], list.map(c => [c.id, c.name, c.address, c.city, c.phone, c.score, c.active ? 'SÍ' : 'NO']))}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-indigo-100 hover:scale-105 transition-transform"
          >
            Descargar Excel
          </button>
        </div>
        <table className="w-full text-left">
          <thead><tr className="bg-slate-50"><th className="px-10 py-6 text-[10px] font-black uppercase text-slate-700">Cédula</th><th className="px-10 py-6 text-[10px] font-black uppercase text-slate-700">Nombre</th><th className="px-6 py-6 text-[10px] font-black uppercase text-slate-700">Celular</th><th className="px-6 py-6 text-center text-[10px] font-black uppercase text-slate-700">Puntaje</th><th className="px-10 py-6 text-center text-[10px] font-black uppercase text-slate-700">Estado</th></tr></thead>
          <tbody>
            {list.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 border-b border-slate-50 last:border-0">
                <td className="px-10 py-6 font-bold text-slate-500">{c.id}</td>
                <td className="px-10 py-6 font-black text-slate-800">{c.name}</td>
                <td className="px-6 py-6 font-bold text-slate-600">{c.phone || '-'}</td>
                <td className="px-6 py-6 text-center font-black text-blue-600">{c.score}</td>
                <td className="px-10 py-6 text-center">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${c.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {c.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderProdConfReport = () => {
    // Totales por confeccionista
    const report = (state.confeccionistas || []).map(c => {
      const confRecs = state.receptions.filter(r => r.confeccionista === c.name);
      const units = confRecs.reduce((acc, r) => acc + r.items.reduce((a,i) => a + i.quantity, 0), 0);
      const batches = confRecs.length;
      return { ...c, units, batches };
    }).filter(c => c.units > 0).sort((a,b) => b.units - a.units);

    return (
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
        <div className="p-10 bg-pink-50 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-pink-900 tracking-tighter">Producción por Taller</h3>
            <p className="text-pink-400 text-xs font-bold uppercase mt-1">Resumen de ingresos históricos</p>
          </div>
          <button 
            onClick={() => downloadCSV('Produccion_Por_Taller', ['Taller', 'Lotes Recibidos', 'Unidades Totales'], report.map(r => [r.name, r.batches.toString(), r.units.toString()]))}
            className="px-6 py-3 bg-pink-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-pink-100"
          >
            Exportar Excel
          </button>
        </div>
        <table className="w-full text-left">
          <thead><tr className="bg-slate-50"><th className="px-10 py-6 text-[10px] font-black uppercase text-slate-700">Taller / Confeccionista</th><th className="px-10 py-6 text-center text-[10px] font-black uppercase text-slate-700">Lotes</th><th className="px-10 py-6 text-right text-[10px] font-black uppercase text-slate-700">Unidades Recibidas</th></tr></thead>
          <tbody>
            {report.map(r => (
              <tr key={r.id} className="hover:bg-slate-50 border-b border-slate-50 last:border-0">
                <td className="px-10 py-6 font-black text-slate-800">{r.name}</td>
                <td className="px-10 py-6 text-center font-bold text-slate-500">{r.batches}</td>
                <td className="px-10 py-6 text-right">
                  <span className="px-4 py-1.5 bg-pink-100 text-pink-600 font-black rounded-xl">{r.units.toLocaleString()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderClientDetail = () => {
    let clientsToShow = state.clients.sort((a,b)=>a.id.localeCompare(b.id));
    if (clientInput) clientsToShow = clientsToShow.filter(c => c.id.includes(clientInput.toUpperCase()) || c.name.toUpperCase().includes(clientInput.toUpperCase()));

    return (
      <div className="space-y-6">
         <div className="flex justify-end bg-white p-4 rounded-3xl border mb-6">
            <select value={selectedCorreriaId} onChange={e=>setSelectedCorreriaId(e.target.value)} className="bg-transparent border-none text-xs font-black">
               <option value="global">Histórico Global</option>
               {state.correrias.map(c => <option key={c.id} value={c.id}>{c.name} {c.year}</option>)}
            </select>
         </div>
         <div className="grid grid-cols-1 gap-4">
           {clientsToShow.map(c => {
             const clientOrders = state.orders.filter(o => o.clientId === c.id && (selectedCorreriaId === 'global' || o.correriaId === selectedCorreriaId));
             const clientDispatches = state.dispatches.filter(d => d.clientId === c.id && (selectedCorreriaId === 'global'));
             
             const totalOrdered = clientOrders.reduce((acc, o) => acc + o.items.reduce((a,i)=>a+i.quantity, 0), 0);
             const totalDispatched = clientDispatches.reduce((acc, d) => acc + d.items.reduce((a,i)=>a+i.quantity, 0), 0);

             return (
               <div key={c.id} className="bg-white p-6 rounded-[24px] border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
                  <div>
                    <h5 className="text-xl font-black text-slate-800 leading-none">{c.name}</h5>
                    <p className="text-[10px] font-bold text-slate-600 mt-2">ID: {c.id} • VENDEDOR: <span className="text-pink-500 uppercase">{c.seller}</span></p>
                  </div>
                  <div className="flex gap-8 text-center">
                     <div><p className="text-[8px] font-black text-slate-400 uppercase mb-1">Pedidas</p><p className="text-xl font-black text-blue-600">{totalOrdered}</p></div>
                     <div><p className="text-[8px] font-black text-slate-400 uppercase mb-1">Despachadas</p><p className="text-xl font-black text-pink-600">{totalDispatched}</p></div>
                     <div className="border-l pl-8"><p className="text-[8px] font-black text-slate-400 uppercase mb-1">Pendientes</p><p className="text-xl font-black text-red-500">{Math.max(0, totalOrdered - totalDispatched)}</p></div>
                  </div>
               </div>
             );
           })}
         </div>
      </div>
    );
  };

  const renderSellerReport = () => {
    let sellersToShow = Array.from(new Set(state.clients.map(c => c.seller))).sort() as string[];
    if (sellerInput) sellersToShow = sellersToShow.filter(s => s.toUpperCase().includes(sellerInput.toUpperCase()));

    return (
      <div className="space-y-6">
         <div className="flex justify-end bg-white p-4 rounded-3xl border mb-6">
            <select value={selectedCorreriaId} onChange={e=>setSelectedCorreriaId(e.target.value)} className="bg-transparent border-none text-xs font-black">
               <option value="global">Histórico Global</option>
               {state.correrias.map(c => <option key={c.id} value={c.id}>{c.name} {c.year}</option>)}
            </select>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sellersToShow.map(s => {
               const sellerOrders = state.orders.filter(o => o.sellerId === state.sellers.find(sel=>sel.name===s)?.id && (selectedCorreriaId === 'global' || o.correriaId === selectedCorreriaId));
               const totalUnits = sellerOrders.reduce((acc, o) => acc + o.items.reduce((a,i)=>a+i.quantity, 0), 0);
               const totalVal = sellerOrders.reduce((acc, o) => acc + o.totalValue, 0);

               return (
                 <div key={s} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex justify-between items-center">
                    <div>
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Vendedor</p>
                       <h5 className="text-2xl font-black text-slate-800">{s}</h5>
                    </div>
                    <div className="text-right">
                       <p className="text-2xl font-black text-indigo-600">${totalVal.toLocaleString()}</p>
                       <p className="text-[10px] font-black text-slate-600 uppercase">{totalUnits} Unidades</p>
                    </div>
                 </div>
               );
            })}
         </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Reportes</h2>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl text-[10px] uppercase">Imprimir / PDF</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 no-print items-center">
        <div className="flex gap-2 p-1 bg-white rounded-2xl border shadow-sm">
          <TabBtnSmall active={reportType === 'kardex'} onClick={() => setReportType('kardex')} label="Kardex" />
          <TabBtnSmall active={reportType === 'ref'} onClick={() => setReportType('ref')} label="Referencias" />
          <TabBtnSmall active={reportType === 'client'} onClick={() => setReportType('client')} label="Clientes" />
          <TabBtnSmall active={reportType === 'seller'} onClick={() => setReportType('seller')} label="Vendedores" />
          <TabBtnSmall active={reportType === 'conf'} onClick={() => setReportType('conf')} label="Confeccionistas" />
          <TabBtnSmall active={reportType === 'prod_conf'} onClick={() => setReportType('prod_conf')} label="Taller (Prod)" />
        </div>
        
        {reportType === 'ref' && <input value={refInput} onChange={e => setRefInput(e.target.value)} placeholder="Ref..." className="px-4 py-2 bg-white border rounded-xl text-xs font-bold" />}
        {reportType === 'client' && <input value={clientInput} onChange={e => setClientInput(e.target.value)} placeholder="Cliente ID/Nombre..." className="px-4 py-2 bg-white border rounded-xl text-xs font-bold" />}
        {reportType === 'seller' && <input value={sellerInput} onChange={e => setSellerInput(e.target.value)} placeholder="Vendedor..." className="px-4 py-2 bg-white border rounded-xl text-xs font-bold" />}
        {reportType === 'conf' && (
          <div className="flex gap-2">
            <button onClick={() => setConfStatusFilter('all')} className={`px-4 py-2 text-[10px] font-black rounded-xl border transition-all ${confStatusFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'}`}>TODOS</button>
            <button onClick={() => setConfStatusFilter('active')} className={`px-4 py-2 text-[10px] font-black rounded-xl border transition-all ${confStatusFilter === 'active' ? 'bg-green-600 text-white' : 'bg-white text-slate-400'}`}>SÓLO ACTIVOS</button>
          </div>
        )}
      </div>

      <div className="mt-4">
        {reportType === 'kardex' && renderKardex()}
        {reportType === 'ref' && renderRefDetail()}
        {reportType === 'client' && renderClientDetail()}
        {reportType === 'seller' && renderSellerReport()}
        {reportType === 'conf' && renderConfReport()}
        {reportType === 'prod_conf' && renderProdConfReport()}
      </div>
    </div>
  );
};

const TabBtnSmall = ({ active, onClick, label }: any) => (
  <button onClick={onClick} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${active ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>{label}</button>
);

export default ReportsView;
