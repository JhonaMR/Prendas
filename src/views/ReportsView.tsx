import React, { useMemo, useState, useRef, useEffect } from 'react';
import { User, AppState } from '../types';
import PaginationComponent from '../components/PaginationComponent';
import usePagination from '../hooks/usePagination';

interface ReportsViewProps {
  user: User;
  state: AppState;
}

const ReportsView: React.FC<ReportsViewProps> = ({ user, state }) => {
  const [reportType, setReportType] = useState<'kardex' | 'ref' | 'client' | 'seller' | 'conf' | 'prod_conf'>('kardex');
  const [refInput, setRefInput] = useState('');
  const [clientInput, setClientInput] = useState('');
  const [confStatusFilter, setConfStatusFilter] = useState<'active' | 'all'>('active');
  const [confSearchFilter, setConfSearchFilter] = useState('');
  const [confShowDropdown, setConfShowDropdown] = useState(false);
  const confTimeoutRef = useRef<NodeJS.Timeout>();
  const [selectedCorreriaForOrders, setSelectedCorreriaForOrders] = useState('');
  const [correriaSearchOrders, setCorreriaSearchOrders] = useState('');
  const [correriaShowDropdownOrders, setCorreriaShowDropdownOrders] = useState(false);
  const ordersReportPagination = usePagination(1, 50);
  const confReportPagination = usePagination(1, 50);
  const correriaTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let ordersToShow: any[] = [];
    if (selectedCorreriaForOrders) {
      ordersToShow = (state.orders || []).filter(o => o.correriaId === selectedCorreriaForOrders);
    }
    ordersReportPagination.pagination.total = ordersToShow.length;
    ordersReportPagination.pagination.totalPages = Math.ceil(ordersToShow.length / ordersReportPagination.pagination.limit);
  }, [state.orders, selectedCorreriaForOrders, ordersReportPagination.pagination.limit]);

  useEffect(() => {
    let list = (state.confeccionistas || []).sort((a, b) => a.name.localeCompare(b.name));
    if (confStatusFilter === 'active') list = list.filter(c => c.active);
    if (confSearchFilter) list = list.filter(c => c.name.toUpperCase().includes(confSearchFilter.toUpperCase()) || c.id.includes(confSearchFilter));
    confReportPagination.pagination.total = list.length;
    confReportPagination.pagination.totalPages = Math.ceil(list.length / confReportPagination.pagination.limit);
  }, [state.confeccionistas, confStatusFilter, confSearchFilter, confReportPagination.pagination.limit]);
  const [kardexSearch, setKardexSearch] = useState('');
  
  const kardexPagination = usePagination(1, 50);
  const refDetailPagination = usePagination(1, 50);
  const clientDetailPagination = usePagination(1, 50);

  const kardexData = useMemo(() => {
    const data: Record<string, { in: number; out: number; av: number; lots: number }> = {};
    const receptions = state.receptions || [];
    const dispatches = state.dispatches || [];
    
    receptions
      .filter(r => r.affectsInventory !== false)
      .forEach(r => {
        const uniqueRefsInThisBatch = new Set<string>();
        const items = r.items || [];
        items.forEach(i => {
          if (!data[i.reference]) data[i.reference] = { in: 0, out: 0, av: 0, lots: 0 };
          data[i.reference].in += i.quantity;
          data[i.reference].av += i.quantity;
          uniqueRefsInThisBatch.add(i.reference);
        });
        uniqueRefsInThisBatch.forEach(ref => {
          if (data[ref]) data[ref].lots += 1;
        });
      });
    
    dispatches.forEach(d => {
      const items = d.items || [];
      items.forEach(i => {
        if (!data[i.reference]) data[i.reference] = { in: 0, out: 0, av: 0, lots: 0 };
        data[i.reference].out += i.quantity;
        data[i.reference].av -= i.quantity;
      });
    });
    
    return data;
  }, [state.receptions, state.dispatches]);

  useEffect(() => {
    const sortedLength = Object.keys(kardexData).length;
    kardexPagination.pagination.total = sortedLength;
    kardexPagination.pagination.totalPages = Math.ceil(sortedLength / kardexPagination.pagination.limit);
  }, [kardexData, kardexPagination.pagination.limit]);

  const renderKardex = () => {
    let sorted = Object.entries(kardexData).sort((a, b) => a[0].localeCompare(b[0]));
    
    if (kardexSearch) {
      sorted = sorted.filter(([ref]) => ref.toUpperCase().includes(kardexSearch.toUpperCase()));
    }
    
    const paginatedData = sorted.slice(
      (kardexPagination.pagination.page - 1) * kardexPagination.pagination.limit,
      kardexPagination.pagination.page * kardexPagination.pagination.limit
    );

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
          <div className="p-10 bg-blue-50 border-b border-slate-100">
            <h3 className="text-2xl font-black text-blue-900 tracking-tighter">Kardex Global</h3>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-10 py-3 text-[10px] font-black uppercase text-slate-700">Referencia</th>
                <th className="px-6 py-3 text-center text-[10px] font-black uppercase text-slate-700">Lots</th>
                <th className="px-10 py-3 text-right text-[10px] font-black uppercase text-slate-700">Entradas</th>
                <th className="px-10 py-3 text-right text-[10px] font-black uppercase text-slate-700">Salidas</th>
                <th className="px-10 py-3 text-right text-[10px] font-black uppercase text-slate-700">Stock</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map(([ref, stats]: [string, { in: number; out: number; av: number; lots: number }]) => (
                <tr key={ref} className="hover:bg-slate-50 border-b border-slate-50 last:border-0">
                  <td className="px-10 py-3 font-black text-slate-800">{ref}</td>
                  <td className="px-6 py-3 text-center font-bold text-slate-600">{stats.lots}</td>
                  <td className="px-10 py-3 text-right font-bold text-slate-500">{stats.in}</td>
                  <td className="px-10 py-3 text-right font-bold text-pink-400">{stats.out}</td>
                  <td className="px-10 py-3 text-right">
                    <span className="px-4 py-1.5 bg-blue-100 text-blue-600 font-black rounded-xl">{stats.av}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PaginationComponent
          currentPage={kardexPagination.pagination.page}
          totalPages={Math.ceil(sorted.length / kardexPagination.pagination.limit)}
          pageSize={kardexPagination.pagination.limit}
          onPageChange={kardexPagination.goToPage}
          onPageSizeChange={kardexPagination.setLimit}
        />
      </div>
    );
  };

  useEffect(() => {
    let refsToShow = (state.references || []).sort((a, b) => a.id.localeCompare(b.id));
    if (refInput) refsToShow = refsToShow.filter(r => r.id.includes(refInput.toUpperCase()));
    refDetailPagination.pagination.total = refsToShow.length;
    refDetailPagination.pagination.totalPages = Math.ceil(refsToShow.length / refDetailPagination.pagination.limit);
  }, [state.references, refInput, refDetailPagination.pagination.limit]);

  useEffect(() => {
    let clientsToShow = (state.clients || []).sort((a, b) => a.id.localeCompare(b.id));
    if (clientInput) clientsToShow = clientsToShow.filter(c => c.id.includes(clientInput.toUpperCase()) || c.name.toUpperCase().includes(clientInput.toUpperCase()));
    clientDetailPagination.pagination.total = clientsToShow.length;
    clientDetailPagination.pagination.totalPages = Math.ceil(clientsToShow.length / clientDetailPagination.pagination.limit);
  }, [state.clients, clientInput, clientDetailPagination.pagination.limit]);

  const renderRefDetail = () => {
    let refsToShow = (state.references || []).sort((a, b) => a.id.localeCompare(b.id));
    if (refInput) refsToShow = refsToShow.filter(r => r.id.includes(refInput.toUpperCase()));

    const paginatedRefs = refsToShow.slice(
      (refDetailPagination.pagination.page - 1) * refDetailPagination.pagination.limit,
      refDetailPagination.pagination.page * refDetailPagination.pagination.limit
    );

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {paginatedRefs.map(r => {
            const stats = kardexData[r.id] || { in: 0, out: 0, av: 0, lots: 0 };
            
            // Contar clientes que han pedido esta referencia
            const clientsOrdered = new Set(
              (state.orders || [])
                .filter(o => (o.items || []).some(i => i.reference === r.id))
                .map(o => o.clientId)
            ).size;
            
            // Contar correrias en las que ha estado
            const correrias = new Set(
              (state.orders || [])
                .filter(o => (o.items || []).some(i => i.reference === r.id))
                .map(o => o.correriaId)
            ).size;

            return (
              <div key={r.id} className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm">
                <div className="flex justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-black text-indigo-600 tracking-tighter">{r.id}</h4>
                    <p className="text-[11px] font-bold text-slate-600 uppercase line-clamp-2">{r.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-black bg-slate-50 px-2 py-0.5 rounded-full uppercase text-slate-400 block mb-1">{r.designer}</span>
                    <p className="text-[10px] font-black text-orange-600">${r.price || 0}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="p-2 bg-slate-50 rounded-lg text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Entradas</p>
                    <p className="font-black text-slate-800 text-base">{stats.in}</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Salidas</p>
                    <p className="font-black text-pink-500 text-base">{stats.out}</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Lotes</p>
                    <p className="font-black text-blue-600 text-base">{stats.lots}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-slate-50 rounded-lg text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Clientes</p>
                    <p className="font-black text-green-600 text-base">{clientsOrdered}</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Correrias</p>
                    <p className="font-black text-purple-600 text-base">{correrias}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <PaginationComponent
          currentPage={refDetailPagination.pagination.page}
          totalPages={refDetailPagination.pagination.totalPages}
          pageSize={refDetailPagination.pagination.limit}
          onPageChange={refDetailPagination.goToPage}
          onPageSizeChange={refDetailPagination.setLimit}
        />
      </div>
    );
  };

  const renderConfReport = () => {
    let list = (state.confeccionistas || []).sort((a, b) => a.name.localeCompare(b.name));
    if (confStatusFilter === 'active') list = list.filter(c => c.active);
    if (confSearchFilter) list = list.filter(c => c.name.toUpperCase().includes(confSearchFilter.toUpperCase()) || c.id.includes(confSearchFilter));

    const paginatedList = list.slice(
      (confReportPagination.pagination.page - 1) * confReportPagination.pagination.limit,
      confReportPagination.pagination.page * confReportPagination.pagination.limit
    );

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
          <div className="p-10 bg-indigo-50 border-b border-slate-100">
            <h3 className="text-2xl font-black text-indigo-900 tracking-tighter">Maestro de Confeccionistas</h3>
            <p className="text-indigo-400 text-xs font-bold uppercase mt-1">Total listados: {list.length}</p>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-700">Cédula</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-700">Nombre</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase text-slate-700">Celular</th>
                <th className="px-6 py-6 text-center text-[10px] font-black uppercase text-slate-700">Puntaje</th>
                <th className="px-10 py-6 text-center text-[10px] font-black uppercase text-slate-700">Lotes Entregados</th>
                <th className="px-10 py-6 text-center text-[10px] font-black uppercase text-slate-700">Estado</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.map(c => {
                const lotesEntregados = (state.receptions || []).filter(r => r.confeccionista === c.id).length;
                
                return (
                  <tr key={c.id} className="hover:bg-slate-50 border-b border-slate-50 last:border-0">
                    <td className="px-10 py-6 font-bold text-slate-500">{c.id}</td>
                    <td className="px-10 py-6 font-black text-slate-800">{c.name}</td>
                    <td className="px-6 py-6 font-bold text-slate-600">{c.phone || '-'}</td>
                    <td className="px-6 py-6 text-center font-black text-blue-600">{c.score}</td>
                    <td className="px-10 py-6 text-center font-black text-pink-600">{lotesEntregados}</td>
                    <td className="px-10 py-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${c.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {c.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <PaginationComponent
          currentPage={confReportPagination.pagination.page}
          totalPages={confReportPagination.pagination.totalPages}
          pageSize={confReportPagination.pagination.limit}
          onPageChange={confReportPagination.goToPage}
          onPageSizeChange={confReportPagination.setLimit}
        />
      </div>
    );
  };

  const renderClientDetail = () => {
    let clientsToShow = (state.clients || []).sort((a, b) => a.id.localeCompare(b.id));
    if (clientInput) clientsToShow = clientsToShow.filter(c => c.id.includes(clientInput.toUpperCase()) || c.name.toUpperCase().includes(clientInput.toUpperCase()));

    const paginatedClients = clientsToShow.slice(
      (clientDetailPagination.pagination.page - 1) * clientDetailPagination.pagination.limit,
      clientDetailPagination.pagination.page * clientDetailPagination.pagination.limit
    );

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-2">
          {paginatedClients.map(c => {
            const clientOrders = (state.orders || []).filter(o => o.clientId === c.id);
            const ordersCount = clientOrders.length;
            const correrias = new Set(clientOrders.map(o => o.correriaId)).size;

            return (
              <div key={c.id} className="bg-white p-3 rounded-[20px] border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <h5 className="text-lg font-black text-slate-800">{c.name}</h5>
                    <p className="text-[9px] font-bold text-slate-500">{c.address || '-'}</p>
                  </div>
                  <p className="text-[9px] font-bold text-slate-600 mt-1">ID: {c.id} • VENDEDOR: <span className="text-pink-500 uppercase">{c.seller}</span></p>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Pedidos</p>
                    <p className="text-lg font-black text-blue-600">{ordersCount}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Correrias</p>
                    <p className="text-lg font-black text-purple-600">{correrias}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <PaginationComponent
          currentPage={clientDetailPagination.pagination.page}
          totalPages={clientDetailPagination.pagination.totalPages}
          pageSize={clientDetailPagination.pagination.limit}
          onPageChange={clientDetailPagination.goToPage}
          onPageSizeChange={clientDetailPagination.setLimit}
        />
      </div>
    );
  };

  const renderOrdersReport = () => {
    let ordersToShow: any[] = [];
    if (selectedCorreriaForOrders) {
      ordersToShow = (state.orders || []).filter(o => o.correriaId === selectedCorreriaForOrders);
    }

    const paginatedOrders = ordersToShow.slice(
      (ordersReportPagination.pagination.page - 1) * ordersReportPagination.pagination.limit,
      ordersReportPagination.pagination.page * ordersReportPagination.pagination.limit
    );

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
    };

    return (
      <div className="space-y-6">
        {selectedCorreriaForOrders && (
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
            <div className="p-10 bg-blue-50 border-b border-slate-100">
              <h3 className="text-2xl font-black text-blue-900 tracking-tighter">Pedidos por Correría</h3>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-10 py-3 text-[10px] font-black uppercase text-slate-700">Cliente</th>
                  <th className="px-10 py-3 text-center text-[10px] font-black uppercase text-slate-700">Unidades Pedidas</th>
                  <th className="px-10 py-3 text-center text-[10px] font-black uppercase text-slate-700">Unidades Despachadas</th>
                  <th className="px-10 py-3 text-center text-[10px] font-black uppercase text-slate-700">% Cumpl. Unidades</th>
                  <th className="px-10 py-3 text-right text-[10px] font-black uppercase text-slate-700">Valor Pedido</th>
                  <th className="px-10 py-3 text-right text-[10px] font-black uppercase text-slate-700">Valor Despachado</th>
                  <th className="px-10 py-3 text-center text-[10px] font-black uppercase text-slate-700">% Cumpl. Valor</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map(order => {
                  const client = (state.clients || []).find(c => c.id === order.clientId);
                  const totalUnitsOrdered = (order.items || []).reduce((acc, i) => acc + i.quantity, 0);
                  
                  // Obtener despachos para este cliente en esta correría
                  const dispatchesForOrder = (state.dispatches || []).filter(d => 
                    d.clientId === order.clientId && d.correriaId === selectedCorreriaForOrders
                  );
                  const totalUnitsDispatched = dispatchesForOrder.reduce((acc, d) => acc + (d.items || []).reduce((a, i) => a + i.quantity, 0), 0);
                  
                  const totalValueOrdered = order.totalValue || 0;
                  const totalValueDispatched = dispatchesForOrder.reduce((acc, d) => acc + (d.items || []).reduce((a, i) => a + (i.salePrice || 0) * i.quantity, 0), 0);
                  
                  const percentageUnits = totalUnitsOrdered > 0 ? Math.round((totalUnitsDispatched / totalUnitsOrdered) * 100) : 0;
                  const percentageValue = totalValueOrdered > 0 ? Math.round((totalValueDispatched / totalValueOrdered) * 100) : 0;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50 border-b border-slate-50 last:border-0">
                      <td className="px-10 py-3">
                        <p className="font-black text-slate-800">{client?.name || 'Cliente desconocido'}</p>
                        <p className="text-[9px] font-bold text-slate-500">{client?.id} - {client?.address || '-'}</p>
                      </td>
                      <td className="px-10 py-3 text-center font-bold text-slate-600">{totalUnitsOrdered}</td>
                      <td className="px-10 py-3 text-center font-bold text-blue-600">{totalUnitsDispatched}</td>
                      <td className="px-10 py-3 text-center font-black text-green-600">{percentageUnits}%</td>
                      <td className="px-10 py-3 text-right font-bold text-slate-600">{formatCurrency(totalValueOrdered)}</td>
                      <td className="px-10 py-3 text-right font-bold text-blue-600">{formatCurrency(totalValueDispatched)}</td>
                      <td className="px-10 py-3 text-center font-black text-green-600">{percentageValue}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {selectedCorreriaForOrders && (
          <PaginationComponent
            currentPage={ordersReportPagination.pagination.page}
            totalPages={ordersReportPagination.pagination.totalPages}
            pageSize={ordersReportPagination.pagination.limit}
            onPageChange={ordersReportPagination.goToPage}
            onPageSizeChange={ordersReportPagination.setLimit}
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Reportes</h2>
      </div>

      <div className="flex flex-wrap gap-4 no-print items-center">
        <div className="flex gap-2 p-1 bg-white rounded-2xl border shadow-sm">
          <TabBtnSmall active={reportType === 'kardex'} onClick={() => setReportType('kardex')} label="Kardex" />
          <TabBtnSmall active={reportType === 'ref'} onClick={() => setReportType('ref')} label="Referencias" />
          <TabBtnSmall active={reportType === 'client'} onClick={() => setReportType('client')} label="Clientes" />
          <TabBtnSmall active={reportType === 'seller'} onClick={() => setReportType('seller')} label="Pedidos/Correría" />
          <TabBtnSmall active={reportType === 'conf'} onClick={() => setReportType('conf')} label="Confeccionistas" />
        </div>
        
        {reportType === 'ref' && <input value={refInput} onChange={e => setRefInput(e.target.value)} placeholder="Ref..." className="px-4 py-2 bg-white border rounded-xl text-xs font-bold" />}
        {reportType === 'client' && <input value={clientInput} onChange={e => setClientInput(e.target.value)} placeholder="Cliente ID/Nombre..." className="px-4 py-2 bg-white border rounded-xl text-xs font-bold" />}
        {reportType === 'kardex' && <input value={kardexSearch} onChange={e => setKardexSearch(e.target.value)} placeholder="Ref..." className="px-4 py-2 bg-white border rounded-xl text-xs font-bold" />}
        {reportType === 'seller' && (
          <div className="relative bg-white p-2 rounded-xl border">
            <input
              type="text"
              value={correriaSearchOrders}
              onChange={e => setCorreriaSearchOrders(e.target.value)}
              onFocus={() => setCorreriaShowDropdownOrders(true)}
              onBlur={() => setTimeout(() => setCorreriaShowDropdownOrders(false), 300)}
              placeholder="Buscar correría..."
              className="px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 w-48"
            />
            {correriaShowDropdownOrders && (
              <div 
                className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-2xl max-h-48 overflow-y-auto z-50 w-full"
                onMouseDown={(e) => e.preventDefault()}
              >
                {((state.correrias || []).filter(c => !correriaSearchOrders || c.name.toLowerCase().includes(correriaSearchOrders.toLowerCase()) || c.year.toString().includes(correriaSearchOrders))).length === 0 ? (
                  <div className="px-3 py-2 text-slate-400 text-sm font-bold">Sin resultados</div>
                ) : (
                  (state.correrias || []).filter(c => !correriaSearchOrders || c.name.toLowerCase().includes(correriaSearchOrders.toLowerCase()) || c.year.toString().includes(correriaSearchOrders)).map(c => (
                    <button
                      key={c.id}
                      onMouseDown={() => {
                        setSelectedCorreriaForOrders(c.id);
                        setCorreriaShowDropdownOrders(false);
                        setCorreriaSearchOrders('');
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <p className="font-black text-slate-800 text-xs">{c.name} {c.year}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
        {reportType === 'conf' && (
          <div className="flex gap-2 items-center">
            <button onClick={() => setConfStatusFilter('all')} className={`px-4 py-2 text-[10px] font-black rounded-xl border transition-all ${confStatusFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'}`}>TODOS</button>
            <button onClick={() => setConfStatusFilter('active')} className={`px-4 py-2 text-[10px] font-black rounded-xl border transition-all ${confStatusFilter === 'active' ? 'bg-green-600 text-white' : 'bg-white text-slate-400'}`}>SÓLO ACTIVOS</button>
            <div className="relative bg-white p-2 rounded-xl border">
              <input
                type="text"
                value={confSearchFilter}
                onChange={e => setConfSearchFilter(e.target.value)}
                onFocus={() => setConfShowDropdown(true)}
                onBlur={() => {
                  if (confTimeoutRef.current) clearTimeout(confTimeoutRef.current);
                  confTimeoutRef.current = setTimeout(() => setConfShowDropdown(false), 300);
                }}
                placeholder="Buscar confeccionista..."
                className="px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 w-48"
              />
              {confShowDropdown && (
                <div 
                  className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-2xl max-h-48 overflow-y-auto z-50 w-full"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {((state.confeccionistas || []).filter(c => !confSearchFilter || c.name.toUpperCase().includes(confSearchFilter.toUpperCase()) || c.id.includes(confSearchFilter))).length === 0 ? (
                    <div className="px-3 py-2 text-slate-400 text-sm font-bold">Sin resultados</div>
                  ) : (
                    (state.confeccionistas || []).filter(c => !confSearchFilter || c.name.toUpperCase().includes(confSearchFilter.toUpperCase()) || c.id.includes(confSearchFilter)).map(c => (
                      <button
                        key={c.id}
                        onMouseDown={() => {
                          setConfSearchFilter(c.name);
                          setConfShowDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-0"
                      >
                        <p className="font-black text-slate-800 text-xs">{c.id} - {c.name}</p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        {reportType === 'kardex' && renderKardex()}
        {reportType === 'ref' && renderRefDetail()}
        {reportType === 'client' && renderClientDetail()}
        {reportType === 'seller' && renderOrdersReport()}
        {reportType === 'conf' && renderConfReport()}
      </div>
    </div>
  );
};

const TabBtnSmall = ({ active, onClick, label }: any) => (
  <button onClick={onClick} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${active ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>{label}</button>
);

export default ReportsView;
