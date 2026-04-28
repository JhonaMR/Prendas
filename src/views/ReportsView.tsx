import React, { useMemo, useState, useRef, useEffect } from 'react';
import { User, AppState } from '../types';
import PaginationComponent from '../components/PaginationComponent';
import usePagination from '../hooks/usePagination';
import { useDarkMode } from '../context/DarkModeContext';

interface ReportsViewProps {
  user: User;
  state: AppState;
}

const ReportsView: React.FC<ReportsViewProps> = ({ user, state }) => {
  const { isDark } = useDarkMode();
  const [reportType, setReportType] = useState<'kardex' | 'ref' | 'client' | 'seller' | 'prod_conf' | 'conf'>('kardex');
  const [refInput, setRefInput] = useState('');
  const [clientInput, setClientInput] = useState('');
  const [confStatusFilter, setConfStatusFilter] = useState<'active' | 'all'>('active');
  const [confSearchFilter, setConfSearchFilter] = useState('');
  const [confShowDropdown, setConfShowDropdown] = useState(false);
  const confTimeoutRef = useRef<NodeJS.Timeout>();
  const [selectedCorreriaForOrders, setSelectedCorreriaForOrders] = useState('');
  const [correriaSearchOrders, setCorreriaSearchOrders] = useState('');
  const [correriaShowDropdownOrders, setCorreriaShowDropdownOrders] = useState(false);
  const [clientSearchOrders, setClientSearchOrders] = useState('');
  const [selectedCorreriaForProdConf, setSelectedCorreriaForProdConf] = useState('');
  const [correriaSearchProdConf, setCorreriaSearchProdConf] = useState('');
  const [correriaShowDropdownProdConf, setCorreriaShowDropdownProdConf] = useState(false);
  const [clientSearchProdConf, setClientSearchProdConf] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const ordersReportPagination = usePagination(1, 20);
  const prodConfReportPagination = usePagination(1, 20);
  const confReportPagination = usePagination(1, 20);
  const correriaTimeoutRef = useRef<NodeJS.Timeout>();
  const correriaTimeoutRefProdConf = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let ordersToShow: any[] = [];
    if (selectedCorreriaForOrders) {
      ordersToShow = (state.orders || []).filter(o => o.correriaId === selectedCorreriaForOrders);
    }
    ordersReportPagination.goToPage(1);
  }, [state.orders, selectedCorreriaForOrders, ordersReportPagination.pagination.limit]);

  useEffect(() => {
    let ordersToShow: any[] = [];
    if (selectedCorreriaForProdConf) {
      ordersToShow = (state.orders || []).filter(o => o.correriaId === selectedCorreriaForProdConf);
    }
    prodConfReportPagination.goToPage(1);
  }, [state.orders, selectedCorreriaForProdConf, prodConfReportPagination.pagination.limit]);

  useEffect(() => {
    let list = (state.confeccionistas || []).sort((a, b) => a.name.localeCompare(b.name));
    if (confStatusFilter === 'active') list = list.filter(c => c.active);
    if (confSearchFilter) list = list.filter(c => c.name.toUpperCase().includes(confSearchFilter.toUpperCase()) || c.id.includes(confSearchFilter));
    confReportPagination.goToPage(1);
  }, [state.confeccionistas, confStatusFilter, confSearchFilter, confReportPagination.pagination.limit]);
  const [kardexSearch, setKardexSearch] = useState('');
  
  const kardexPagination = usePagination(1, 20);
  const refDetailPagination = usePagination(1, 20);
  const clientDetailPagination = usePagination(1, 20);

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
    kardexPagination.goToPage(1);
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
        <div className={`rounded-[40px] shadow-sm border overflow-hidden animate-in fade-in transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
          <div className={`p-10 border-b transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-600' : 'bg-blue-50 border-slate-100'}`}>
            <h3 className={`text-2xl font-black tracking-tighter transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-blue-900'}`}>Kardex Global</h3>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className={`transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-slate-50'}`}>
                <th className={`px-10 py-3 text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Referencia</th>
                <th className={`px-6 py-3 text-center text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Lots</th>
                <th className={`px-10 py-3 text-right text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Entradas</th>
                <th className={`px-10 py-3 text-right text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Salidas</th>
                <th className={`px-10 py-3 text-right text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Stock</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map(([ref, stats]: [string, { in: number; out: number; av: number; lots: number }]) => (
                <tr key={ref} className={`hover:bg-opacity-50 border-b last:border-0 transition-colors duration-300 ${isDark ? 'hover:bg-[#5a4a75] border-violet-700' : 'hover:bg-slate-50 border-slate-50'}`}>
                  <td className={`px-10 py-3 font-black transition-colors duration-300 ${isDark ? 'text-violet-100' : 'text-slate-800'}`}>{ref}</td>
                  <td className={`px-6 py-3 text-center font-bold transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-600'}`}>{stats.lots}</td>
                  <td className={`px-10 py-3 text-right font-bold transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>{stats.in}</td>
                  <td className={`px-10 py-3 text-right font-bold transition-colors duration-300 ${isDark ? 'text-pink-400' : 'text-pink-400'}`}>{stats.out}</td>
                  <td className="px-10 py-3 text-right">
                    <span className={`px-4 py-1.5 font-black rounded-xl transition-colors duration-300 ${isDark ? 'bg-violet-900 text-violet-200' : 'bg-blue-100 text-blue-600'}`}>{stats.av}</span>
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
    refDetailPagination.goToPage(1);
  }, [state.references, refInput, refDetailPagination.pagination.limit]);

  useEffect(() => {
    clientDetailPagination.goToPage(1);
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
              <div key={r.id} className={`p-4 rounded-[20px] border shadow-sm transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
                <div className="flex justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h4 className={`text-lg font-black tracking-tighter transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-indigo-600'}`}>{r.id}</h4>
                    <p className={`text-[11px] font-bold uppercase line-clamp-2 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>{r.description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase block mb-1 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] text-violet-300' : 'bg-slate-50 text-slate-400'}`}>{r.designer}</span>
                    <p className={`text-[10px] font-black transition-colors duration-300 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>$ {Math.round(r.price || 0).toLocaleString('es-CO')}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className={`p-2 rounded-lg text-center transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-slate-50'}`}>
                    <p className={`text-[8px] font-black uppercase mb-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Entradas</p>
                    <p className={`font-black text-base transition-colors duration-300 ${isDark ? 'text-violet-100' : 'text-slate-800'}`}>{stats.in}</p>
                  </div>
                  <div className={`p-2 rounded-lg text-center transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-slate-50'}`}>
                    <p className={`text-[8px] font-black uppercase mb-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Despachadas</p>
                    <p className={`font-black text-base transition-colors duration-300 ${isDark ? 'text-pink-400' : 'text-pink-500'}`}>{stats.out}</p>
                  </div>
                  <div className={`p-2 rounded-lg text-center transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-slate-50'}`}>
                    <p className={`text-[8px] font-black uppercase mb-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Lotes</p>
                    <p className={`font-black text-base transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{stats.lots}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className={`p-2 rounded-lg text-center transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-slate-50'}`}>
                    <p className={`text-[8px] font-black uppercase mb-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Vendidas</p>
                    <p className={`font-black text-base transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {(state.orders || []).reduce((acc, o) => acc + (o.items || []).filter(i => i.reference === r.id).reduce((s, i) => s + i.quantity, 0), 0)}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg text-center transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-slate-50'}`}>
                    <p className={`text-[8px] font-black uppercase mb-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Clientes</p>
                    <p className={`font-black text-base transition-colors duration-300 ${isDark ? 'text-green-400' : 'text-green-600'}`}>{clientsOrdered}</p>
                  </div>
                  <div className={`p-2 rounded-lg text-center transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-slate-50'}`}>
                    <p className={`text-[8px] font-black uppercase mb-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Correrias</p>
                    <p className={`font-black text-base transition-colors duration-300 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{correrias}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <PaginationComponent
          currentPage={refDetailPagination.pagination.page}
          totalPages={Math.ceil((state.references || []).filter(r => !refInput || r.id.includes(refInput.toUpperCase())).length / refDetailPagination.pagination.limit) || 1}
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
        <div className={`rounded-[40px] shadow-sm border overflow-hidden animate-in fade-in transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
          <div className={`p-10 border-b transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-600' : 'bg-indigo-50 border-slate-100'}`}>
            <h3 className={`text-2xl font-black tracking-tighter transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-indigo-900'}`}>Maestro de Confeccionistas</h3>
            <p className={`text-xs font-bold uppercase mt-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-indigo-400'}`}>Total listados: {list.length}</p>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className={`transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-slate-50'}`}>
                <th className={`px-10 py-6 text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Cédula</th>
                <th className={`px-10 py-6 text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Nombre</th>
                <th className={`px-6 py-6 text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Celular</th>
                <th className={`px-6 py-6 text-center text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Puntaje</th>
                <th className={`px-10 py-6 text-center text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Lotes Entregados</th>
                <th className={`px-10 py-6 text-center text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.map(c => {
                const lotesEntregados = (state.receptions || []).filter(r => r.confeccionista === c.id).length;
                
                return (
                  <tr key={c.id} className={`border-b last:border-0 transition-colors duration-300 ${isDark ? 'hover:bg-[#5a4a75] border-violet-700' : 'hover:bg-slate-50 border-slate-50'}`}>
                    <td className={`px-10 py-6 font-bold transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>{c.id}</td>
                    <td className={`px-10 py-6 font-black transition-colors duration-300 ${isDark ? 'text-violet-100' : 'text-slate-800'}`}>{c.name}</td>
                    <td className={`px-6 py-6 font-bold transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-600'}`}>{c.phone || '-'}</td>
                    <td className={`px-6 py-6 text-center font-black transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{c.score}</td>
                    <td className={`px-10 py-6 text-center font-black transition-colors duration-300 ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>{lotesEntregados}</td>
                    <td className="px-10 py-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-colors duration-300 ${c.active ? (isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-600') : (isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-600')}`}>
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
          totalPages={Math.ceil(list.length / confReportPagination.pagination.limit) || 1}
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
              <div key={c.id} className={`p-3 rounded-[20px] border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <h5 className={`text-lg font-black transition-colors duration-300 ${isDark ? 'text-violet-100' : 'text-slate-800'}`}>{c.name}</h5>
                    <p className={`text-[9px] font-bold transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>{c.address || '-'}</p>
                  </div>
                  <p className={`text-[9px] font-bold mt-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>ID: {c.id} • VENDEDOR: <span className={`uppercase transition-colors duration-300 ${isDark ? 'text-pink-400' : 'text-pink-500'}`}>{c.seller}</span></p>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <p className={`text-[8px] font-black uppercase mb-0.5 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Pedidos</p>
                    <p className={`text-lg font-black transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{ordersCount}</p>
                  </div>
                  <div>
                    <p className={`text-[8px] font-black uppercase mb-0.5 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Correrias</p>
                    <p className={`text-lg font-black transition-colors duration-300 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{correrias}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <PaginationComponent
          currentPage={clientDetailPagination.pagination.page}
          totalPages={Math.ceil(clientsToShow.length / clientDetailPagination.pagination.limit) || 1}
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

    if (clientSearchOrders) {
      const search = clientSearchOrders.toUpperCase();
      ordersToShow = ordersToShow.filter(o => {
        const client = (state.clients || []).find(c => c.id === o.clientId);
        return client?.name.toUpperCase().includes(search) || client?.id.toUpperCase().includes(search);
      });
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
          <div className={`rounded-[40px] shadow-sm border overflow-hidden animate-in fade-in transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
            <div className={`p-10 border-b transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-600' : 'bg-blue-50 border-slate-100'}`}>
              <h3 className={`text-2xl font-black tracking-tighter transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-blue-900'}`}>Pedidos por Correría</h3>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1100px]">
              <thead>
                <tr className={`transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-slate-50'}`}>
                  <th className={`px-10 py-3 text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Cliente</th>
                  <th className={`px-10 py-3 text-center text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Unidades Pedidas</th>
                  <th className={`px-10 py-3 text-center text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Unidades Despachadas</th>
                  <th className={`px-10 py-3 text-center text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>% Cumpl. Unidades</th>
                  <th className={`px-10 py-3 text-right text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Valor Pedido</th>
                  <th className={`px-10 py-3 text-right text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Valor Despachado</th>
                  <th className={`px-10 py-3 text-center text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>% Cumpl. Valor</th>
                  <th className={`px-10 py-3 text-center text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Fecha Inicio Desp.</th>
                  <th className={`px-10 py-3 text-center text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Fecha Fin Desp.</th>
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
                    <tr key={order.id} className={`border-b last:border-0 transition-colors duration-300 ${isDark ? 'hover:bg-[#5a4a75] border-violet-700' : 'hover:bg-slate-50 border-slate-50'}`}>
                      <td className="px-10 py-3">
                        <p className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-100' : 'text-slate-800'}`}>{client?.name || 'Cliente desconocido'}</p>
                        <p className={`text-[9px] font-bold transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>{client?.id} - {client?.address}   -   {client?.city}</p>
                      </td>
                      <td className={`px-10 py-3 text-center font-bold transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-600'}`}>{totalUnitsOrdered}</td>
                      <td className={`px-10 py-3 text-center font-bold transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{totalUnitsDispatched}</td>
                      <td className={`px-10 py-3 text-center font-black transition-colors duration-300 ${isDark ? 'text-green-400' : 'text-green-600'}`}>{percentageUnits}%</td>
                      <td className={`px-10 py-3 text-right font-bold transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-600'}`}>{formatCurrency(totalValueOrdered)}</td>
                      <td className={`px-10 py-3 text-right font-bold transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{formatCurrency(totalValueDispatched)}</td>
                      <td className={`px-10 py-3 text-center font-black transition-colors duration-300 ${isDark ? 'text-green-400' : 'text-green-600'}`}>{percentageValue}%</td>
                      <td className="px-10 py-3 text-center">
                        <p className={`text-sm font-black transition-colors duration-300 ${order.startDate ? (isDark ? 'text-blue-400' : 'text-blue-600') : (isDark ? 'text-violet-400' : 'text-slate-300')}`}>
                          {order.startDate ? new Date(order.startDate).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'N/A'}
                        </p>
                      </td>
                      <td className="px-10 py-3 text-center">
                        <p className={`text-sm font-black transition-colors duration-300 ${order.endDate ? (isDark ? 'text-pink-400' : 'text-pink-600') : (isDark ? 'text-violet-400' : 'text-slate-300')}`}>
                          {order.endDate ? new Date(order.endDate).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'N/A'}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {selectedCorreriaForOrders && (
          <PaginationComponent
            currentPage={ordersReportPagination.pagination.page}
            totalPages={Math.ceil(ordersToShow.length / ordersReportPagination.pagination.limit) || 1}
            pageSize={ordersReportPagination.pagination.limit}
            onPageChange={ordersReportPagination.goToPage}
            onPageSizeChange={ordersReportPagination.setLimit}
          />
        )}
      </div>
    );
  };

  const renderProdConfReport = () => {
    let ordersToShow: any[] = [];
    if (selectedCorreriaForProdConf) {
      ordersToShow = (state.orders || []).filter(o => o.correriaId === selectedCorreriaForProdConf);
    }

    if (clientSearchProdConf) {
      const search = clientSearchProdConf.toUpperCase();
      ordersToShow = ordersToShow.filter(o => {
        const client = (state.clients || []).find(c => c.id === o.clientId);
        return client?.name.toUpperCase().includes(search) || client?.id.toUpperCase().includes(search);
      });
    }

    const paginatedOrders = ordersToShow.slice(
      (prodConfReportPagination.pagination.page - 1) * prodConfReportPagination.pagination.limit,
      prodConfReportPagination.pagination.page * prodConfReportPagination.pagination.limit
    );

    const getDispatchColor = (ordered: number, dispatched: number) => {
      if (dispatched === 0) return isDark ? 'text-violet-400' : 'text-slate-400';
      if (dispatched < ordered) return 'text-red-600';
      if (dispatched === ordered) return 'text-green-600';
      return 'text-yellow-600';
    };

    const getDispatchBgColor = (ordered: number, dispatched: number) => {
      if (dispatched === 0) return isDark ? 'bg-[#3d2d52]' : 'bg-slate-50';
      if (dispatched < ordered) return 'bg-red-50';
      if (dispatched === ordered) return 'bg-green-50';
      return 'bg-yellow-50';
    };

    return (
      <div className="space-y-6">
        {selectedCorreriaForProdConf && (
          <div className={`rounded-[40px] shadow-sm border overflow-hidden animate-in fade-in transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
            <div className={`p-10 border-b transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-600' : 'bg-blue-50 border-slate-100'}`}>
              <h3 className={`text-2xl font-black tracking-tighter transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-blue-900'}`}>Detalle de Pedidos por Correría</h3>
            </div>
            <div className={`divide-y transition-colors duration-300 ${isDark ? 'divide-violet-700' : 'divide-slate-100'}`}>
              {paginatedOrders.map(order => {
                const client = (state.clients || []).find(c => c.id === order.clientId);
                const seller = (state.sellers || []).find(s => s.id === order.sellerId);
                const totalUnitsOrdered = (order.items || []).reduce((acc, i) => acc + i.quantity, 0);
                
                const dispatchesForOrder = (state.dispatches || []).filter(d => 
                  d.clientId === order.clientId && d.correriaId === selectedCorreriaForProdConf
                );
                const totalUnitsDispatched = dispatchesForOrder.reduce((acc, d) => acc + (d.items || []).reduce((a, i) => a + i.quantity, 0), 0);
                
                const percentageUnits = totalUnitsOrdered > 0 ? Math.round((totalUnitsDispatched / totalUnitsOrdered) * 100) : 0;
                const isExpanded = expandedOrderId === order.id;

                return (
                  <div key={order.id}>
                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className={`w-full px-10 py-4 transition-colors text-left ${isDark ? 'hover:bg-[#5a4a75]' : 'hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center justify-between gap-6">
                        <div className="grid grid-cols-7 gap-6 flex-1 items-center">
                          <div>
                            <p className={`text-[8px] font-black uppercase mb-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Cliente</p>
                            <p className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-100' : 'text-slate-800'}`}>{client?.name || 'Cliente desconocido'}</p>
                            <p className={`text-[9px] font-bold transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>{client?.id}</p>
                          </div>
                          <div>
                            <p className={`text-[8px] font-black uppercase mb-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Dirección</p>
                            <p className={`font-bold transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-600'}`}>{client?.address || '-'}</p>
                          </div>
                          <div>
                            <p className={`text-[8px] font-black uppercase mb-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Número de Pedido</p>
                            <p className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-100' : 'text-slate-800'}`}>{order.orderNumber || '-'}</p>
                          </div>
                          <div>
                            <p className={`text-[8px] font-black uppercase mb-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Vendedor</p>
                            <p className={`font-bold transition-colors duration-300 ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>{seller?.name || '-'}</p>
                          </div>
                          <div>
                            <p className={`text-[8px] font-black uppercase mb-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>% Cumplimiento</p>
                            <p className={`font-black text-lg transition-colors duration-300 ${isDark ? 'text-green-400' : 'text-green-600'}`}>{percentageUnits}%</p>
                          </div>
                          <div>
                            <p className={`text-[8px] font-black uppercase mb-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Inicio Despacho</p>
                            <p className={`font-black text-sm transition-colors duration-300 ${order.startDate ? (isDark ? 'text-blue-400' : 'text-blue-600') : (isDark ? 'text-violet-400' : 'text-slate-300')}`}>
                              {order.startDate ? new Date(order.startDate).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className={`text-[8px] font-black uppercase mb-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Límite Despacho</p>
                            <p className={`font-black text-sm transition-colors duration-300 ${order.endDate ? (isDark ? 'text-pink-400' : 'text-pink-600') : (isDark ? 'text-violet-400' : 'text-slate-300')}`}>
                              {order.endDate ? new Date(order.endDate).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-2xl transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>
                            {isExpanded ? '▼' : '▶'}
                          </p>
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className={`px-10 py-6 border-t transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-700' : 'bg-slate-50 border-slate-100'}`}>
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className={`transition-colors duration-300 ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}>
                              <th className={`px-4 py-2 text-[9px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Referencia</th>
                              <th className={`px-4 py-2 text-center text-[9px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Cantidad Pedida</th>
                              <th className={`px-4 py-2 text-center text-[9px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Cantidad Despachada</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(order.items || []).map((item, idx) => {
                              const dispatchedQty = dispatchesForOrder.reduce((acc, d) => {
                                const dispatchItem = (d.items || []).find(di => di.reference === item.reference);
                                return acc + (dispatchItem?.quantity || 0);
                              }, 0);

                              return (
                                <tr key={idx} className={`border-b last:border-0 transition-colors duration-300 ${isDark ? 'border-violet-700' : 'border-white'}`}>
                                  <td className={`px-4 py-3 font-bold transition-colors duration-300 ${isDark ? 'text-violet-100' : 'text-slate-800'}`}>{item.reference}  -  <span className={`font-bold uppercase text-[9px] transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>{(state.references || []).find(r => r.id === item.reference)?.description || ''}</span></td>
                                  <td className={`px-4 py-3 text-center font-bold transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-600'}`}>{item.quantity}</td>
                                  <td className={`px-4 py-3 text-center font-black ${getDispatchColor(item.quantity, dispatchedQty)}`}>
                                    <span className={`px-3 py-1 rounded-lg ${getDispatchBgColor(item.quantity, dispatchedQty)}`}>
                                      {dispatchedQty === 0 ? '-' : dispatchedQty}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                            <tr className={`font-black border-t-2 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-600' : 'bg-white border-slate-300'}`}>
                              <td className={`px-4 py-3 transition-colors duration-300 ${isDark ? 'text-violet-100' : 'text-slate-800'}`}>TOTAL</td>
                              <td className={`px-4 py-3 text-center transition-colors duration-300 ${isDark ? 'text-violet-100' : 'text-slate-800'}`}>{totalUnitsOrdered}</td>
                              <td className={`px-4 py-3 text-center ${getDispatchColor(totalUnitsOrdered, totalUnitsDispatched)}`}>
                                <span className={`px-3 py-1 rounded-lg ${getDispatchBgColor(totalUnitsOrdered, totalUnitsDispatched)}`}>
                                  {totalUnitsDispatched === 0 ? '-' : totalUnitsDispatched}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedCorreriaForProdConf && (
          <PaginationComponent
            currentPage={prodConfReportPagination.pagination.page}
            totalPages={Math.ceil(ordersToShow.length / prodConfReportPagination.pagination.limit) || 1}
            pageSize={prodConfReportPagination.pagination.limit}
            onPageChange={prodConfReportPagination.goToPage}
            onPageSizeChange={prodConfReportPagination.setLimit}
          />
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-8 pb-20 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-white'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <h2 className={`text-4xl font-black tracking-tighter transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Reportes</h2>
      </div>

      <div className="flex flex-wrap gap-4 no-print items-center">
        <div className={`flex gap-2 p-1 rounded-2xl border shadow-sm transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white'}`}>
          <TabBtnSmall active={reportType === 'kardex'} onClick={() => setReportType('kardex')} label="Kardex" isDark={isDark} />
          <TabBtnSmall active={reportType === 'ref'} onClick={() => setReportType('ref')} label="Referencias" isDark={isDark} />
          <TabBtnSmall active={reportType === 'client'} onClick={() => setReportType('client')} label="Clientes" isDark={isDark} />
          <TabBtnSmall active={reportType === 'prod_conf'} onClick={() => setReportType('prod_conf')} label="Pedidos/Correría" isDark={isDark} />
          <TabBtnSmall active={reportType === 'seller'} onClick={() => setReportType('seller')} label="Clientes/Correría" isDark={isDark} />
          <TabBtnSmall active={reportType === 'conf'} onClick={() => setReportType('conf')} label="Confeccionistas" isDark={isDark} />
        </div>
        
        {reportType === 'ref' && <input value={refInput} onChange={e => setRefInput(e.target.value)} placeholder="Ref..." className={`px-4 py-2 border rounded-xl text-xs font-bold transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100' : 'bg-white border-slate-300 text-slate-900'}`} />}
        {reportType === 'client' && <input value={clientInput} onChange={e => setClientInput(e.target.value)} placeholder="Cliente ID/Nombre..." className={`px-4 py-2 border rounded-xl text-xs font-bold transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100' : 'bg-white border-slate-300 text-slate-900'}`} />}
        {reportType === 'kardex' && <input value={kardexSearch} onChange={e => setKardexSearch(e.target.value)} placeholder="Ref..." className={`px-4 py-2 border rounded-xl text-xs font-bold transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100' : 'bg-white border-slate-300 text-slate-900'}`} />}
        {reportType === 'prod_conf' && (
          <>
          <div className={`relative p-2 rounded-xl border transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600' : 'bg-white'}`}>
            <input
              type="text"
              value={correriaSearchProdConf}
              onChange={e => setCorreriaSearchProdConf(e.target.value)}
              onFocus={() => setCorreriaShowDropdownProdConf(true)}
              onBlur={() => setTimeout(() => setCorreriaShowDropdownProdConf(false), 300)}
              placeholder="Buscar correría..."
              className={`px-4 py-2 border-2 rounded-xl font-bold focus:ring-4 w-48 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-600 text-violet-100 focus:ring-violet-900 focus:border-violet-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-100 focus:border-blue-500'}`}
            />
            {correriaShowDropdownProdConf && correriaSearchProdConf.length >= 2 && (
              <div 
                className={`absolute top-full left-0 mt-1 border rounded-lg shadow-2xl max-h-48 overflow-y-auto z-50 w-full transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'}`}
                onMouseDown={(e) => e.preventDefault()}
              >
                {((state.correrias || []).filter(c => c.name.toLowerCase().includes(correriaSearchProdConf.toLowerCase()) || c.year.toString().includes(correriaSearchProdConf))).length === 0 ? (
                  <div className={`px-3 py-2 text-sm font-bold transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Sin resultados</div>
                ) : (
                  (state.correrias || []).filter(c => c.name.toLowerCase().includes(correriaSearchProdConf.toLowerCase()) || c.year.toString().includes(correriaSearchProdConf)).map(c => (
                    <button
                      key={c.id}
                      onMouseDown={() => {
                        setSelectedCorreriaForProdConf(c.id);
                        setCorreriaShowDropdownProdConf(false);
                        setCorreriaSearchProdConf('');
                      }}
                      className={`w-full px-3 py-2 text-left transition-colors border-b last:border-0 ${isDark ? 'hover:bg-[#5a4a75] border-violet-700 text-violet-100' : 'hover:bg-blue-50 border-slate-50 text-slate-800'}`}
                    >
                      <p className={`font-black text-xs transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{c.name} {c.year}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          {selectedCorreriaForProdConf && (
            <input
              type="text"
              value={clientSearchProdConf}
              onChange={e => setClientSearchProdConf(e.target.value)}
              placeholder="Buscar cliente..."
              className={`px-4 py-2 border-2 rounded-xl font-bold focus:ring-4 text-xs w-48 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:ring-violet-900 focus:border-violet-500' : 'bg-white border-slate-200 text-slate-900 focus:ring-blue-100 focus:border-blue-500'}`}
            />
          )}
          </>
        )}
        {reportType === 'seller' && (
          <>
          <div className={`relative p-2 rounded-xl border transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600' : 'bg-white'}`}>
            <input
              type="text"
              value={correriaSearchOrders}
              onChange={e => setCorreriaSearchOrders(e.target.value)}
              onFocus={() => setCorreriaShowDropdownOrders(true)}
              onBlur={() => setTimeout(() => setCorreriaShowDropdownOrders(false), 300)}
              placeholder="Buscar correría..."
              className={`px-4 py-2 border-2 rounded-xl font-bold focus:ring-4 w-48 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-600 text-violet-100 focus:ring-violet-900 focus:border-violet-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-100 focus:border-blue-500'}`}
            />
            {correriaShowDropdownOrders && correriaSearchOrders.length >= 2 && (
              <div 
                className={`absolute top-full left-0 mt-1 border rounded-lg shadow-2xl max-h-48 overflow-y-auto z-50 w-full transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'}`}
                onMouseDown={(e) => e.preventDefault()}
              >
                {((state.correrias || []).filter(c => c.name.toLowerCase().includes(correriaSearchOrders.toLowerCase()) || c.year.toString().includes(correriaSearchOrders))).length === 0 ? (
                  <div className={`px-3 py-2 text-sm font-bold transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Sin resultados</div>
                ) : (
                  (state.correrias || []).filter(c => c.name.toLowerCase().includes(correriaSearchOrders.toLowerCase()) || c.year.toString().includes(correriaSearchOrders)).map(c => (
                    <button
                      key={c.id}
                      onMouseDown={() => {
                        setSelectedCorreriaForOrders(c.id);
                        setCorreriaShowDropdownOrders(false);
                        setCorreriaSearchOrders('');
                        setClientSearchOrders('');
                      }}
                      className={`w-full px-3 py-2 text-left transition-colors border-b last:border-0 ${isDark ? 'hover:bg-[#5a4a75] border-violet-700 text-violet-100' : 'hover:bg-blue-50 border-slate-50 text-slate-800'}`}
                    >
                      <p className={`font-black text-xs transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{c.name} {c.year}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          {selectedCorreriaForOrders && (
            <input
              type="text"
              value={clientSearchOrders}
              onChange={e => setClientSearchOrders(e.target.value)}
              placeholder="Buscar cliente..."
              className={`px-4 py-2 border-2 rounded-xl font-bold focus:ring-4 text-xs w-48 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:ring-violet-900 focus:border-violet-500' : 'bg-white border-slate-200 text-slate-900 focus:ring-blue-100 focus:border-blue-500'}`}
            />
          )}
          </>
        )}
        {reportType === 'conf' && (
          <div className="flex gap-2 items-center">
            <button onClick={() => setConfStatusFilter('all')} className={`px-4 py-2 text-[10px] font-black rounded-xl border transition-all ${confStatusFilter === 'all' ? (isDark ? 'bg-violet-600 text-white border-violet-600' : 'bg-indigo-600 text-white') : (isDark ? 'bg-[#4a3a63] text-violet-300 border-violet-700' : 'bg-white text-slate-400 border-slate-300')}`}>TODOS</button>
            <button onClick={() => setConfStatusFilter('active')} className={`px-4 py-2 text-[10px] font-black rounded-xl border transition-all ${confStatusFilter === 'active' ? (isDark ? 'bg-green-600 text-white border-green-600' : 'bg-green-600 text-white') : (isDark ? 'bg-[#4a3a63] text-violet-300 border-violet-700' : 'bg-white text-slate-400 border-slate-300')}`}>SÓLO ACTIVOS</button>
            <div className={`relative p-2 rounded-xl border transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600' : 'bg-white'}`}>
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
                className={`px-4 py-2 border-2 rounded-xl font-bold focus:ring-4 w-48 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-600 text-violet-100 focus:ring-violet-900 focus:border-violet-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-100 focus:border-indigo-500'}`}
              />
              {confShowDropdown && (
                <div 
                  className={`absolute top-full left-0 mt-1 border rounded-lg shadow-2xl max-h-48 overflow-y-auto z-50 w-full transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'}`}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {((state.confeccionistas || []).filter(c => !confSearchFilter || c.name.toUpperCase().includes(confSearchFilter.toUpperCase()) || c.id.includes(confSearchFilter))).length === 0 ? (
                    <div className={`px-3 py-2 text-sm font-bold transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Sin resultados</div>
                  ) : (
                    (state.confeccionistas || []).filter(c => !confSearchFilter || c.name.toUpperCase().includes(confSearchFilter.toUpperCase()) || c.id.includes(confSearchFilter)).map(c => (
                      <button
                        key={c.id}
                        onMouseDown={() => {
                          setConfSearchFilter(c.name);
                          setConfShowDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left transition-colors border-b last:border-0 ${isDark ? 'hover:bg-[#5a4a75] border-violet-700 text-violet-100' : 'hover:bg-indigo-50 border-slate-50 text-slate-800'}`}
                      >
                        <p className={`font-black text-xs transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{c.id} - {c.name}</p>
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
        {reportType === 'prod_conf' && renderProdConfReport()}
        {reportType === 'seller' && renderOrdersReport()}
        {reportType === 'conf' && renderConfReport()}
      </div>
    </div>
  );
};

const TabBtnSmall = ({ active, onClick, label, isDark }: any) => (
  <button onClick={onClick} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${active ? (isDark ? 'bg-violet-600 text-white shadow-md' : 'bg-indigo-600 text-white shadow-md') : (isDark ? 'text-violet-300 hover:bg-[#5a4a75]' : 'text-slate-500 hover:bg-slate-50')}`}>{label}</button>
);

export default ReportsView;
