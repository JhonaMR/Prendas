
import React, { useState, useMemo } from 'react';
import { Order, AppState, Correria, User, UserRole, Client, Seller } from '../types';
import { Icons } from '../constants';
import { api } from '../services/api';
import PaginationComponent from '../components/PaginationComponent';
import usePagination from '../hooks/usePagination';
import { useBrand } from '../hooks/useBrand';
import { exportOrderToExcel } from '../utils/exportOrderExcel';
import { exportOrderToPdf } from '../utils/exportOrderPdf';
import { useDarkMode } from '../context/DarkModeContext';

interface OrderHistoryViewProps {
  state: AppState;
  currentUser?: User | null;
  onOrderUpdate?: (order: Order) => void;
  onOrderDelete?: (orderId: string) => void;
}

const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({ state, currentUser, onOrderUpdate, onOrderDelete }) => {

  const { isDark } = useDarkMode();
  const [filterSeller, setFilterSeller] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterCorreria, setFilterCorreria] = useState('');
  const [correriaSearch, setCorreriaSearch] = useState('');
  const [showCorreriaDropdown, setShowCorreriaDropdown] = useState(false);
  const [filterClient, setFilterClient] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [focusedPriceIdx, setFocusedPriceIdx] = useState<number | null>(null);
  const ordersPagination = usePagination(1, 50);

  const isAdmin = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SOPORTE;
  const brand = useBrand();

  const handleGenerateExcel = async (order: Order, client: Client | undefined, seller: Seller | undefined) => {
    await exportOrderToExcel(order, client, seller, state.references, brand.isMelas);
  };

  const handleGeneratePdf = async (order: Order, client: Client | undefined, seller: Seller | undefined) => {
    await exportOrderToPdf(order, client, seller, state.references, brand.isMelas);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrderId(order.id);
    setEditingOrder({ ...order });
  };

  const handleSaveEdit = async () => {
    if (editingOrder && onOrderUpdate) {
      try {
        // Asegurar que todos los items tengan salePrice
        const itemsWithPrice = editingOrder.items.map(item => ({
          ...item,
          salePrice: item.salePrice !== undefined ? item.salePrice : state.references.find(r => r.id === item.reference)?.price || 0
        }));

        const orderToSave = {
          ...editingOrder,
          items: itemsWithPrice
        };

        const response = await api.updateOrder(editingOrder.id, orderToSave);
        if (response.success) {
          onOrderUpdate(orderToSave);
          setEditingOrderId(null);
          setEditingOrder(null);
        } else {
          alert('Error al guardar: ' + response.message);
        }
      } catch (error) {
        console.error('Error guardando pedido:', error);
        alert('Error al guardar el pedido');
      }
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
      api.deleteOrder(orderId).then(response => {
        if (response.success) {
          if (onOrderDelete) {
            onOrderDelete(orderId);
          }
        } else {
          alert('Error al eliminar: ' + response.message);
        }
      }).catch(error => {
        console.error('Error eliminando pedido:', error);
        alert('Error al eliminar el pedido');
      });
    }
  };

  const handleRemoveItem = (index: number) => {
    if (editingOrder) {
      const newItems = editingOrder.items.filter((_, i) => i !== index);
      const newTotalValue = newItems.reduce((sum, item) => {
        const price = item.salePrice !== undefined ? item.salePrice : state.references.find(r => r.id === item.reference)?.price || 0;
        return sum + (price * item.quantity);
      }, 0);
      setEditingOrder({
        ...editingOrder,
        items: newItems,
        totalValue: newTotalValue
      });
    }
  };

  const handleUpdateItemQuantity = (index: number, quantity: number) => {
    if (editingOrder && quantity > 0) {
      const newItems = [...editingOrder.items];
      newItems[index].quantity = quantity;
      const newTotalValue = newItems.reduce((sum, item) => {
        const price = item.salePrice !== undefined ? item.salePrice : state.references.find(r => r.id === item.reference)?.price || 0;
        return sum + (price * item.quantity);
      }, 0);
      setEditingOrder({
        ...editingOrder,
        items: newItems,
        totalValue: newTotalValue
      });
    }
  };

  const handleUpdateItemPrice = (index: number, price: number) => {
    if (editingOrder && price > 0) {
      const newItems = [...editingOrder.items];
      newItems[index].salePrice = price;
      const newTotalValue = newItems.reduce((sum, item) => {
        const itemPrice = item.salePrice !== undefined ? item.salePrice : state.references.find(r => r.id === item.reference)?.price || 0;
        return sum + (itemPrice * item.quantity);
      }, 0);
      setEditingOrder({
        ...editingOrder,
        items: newItems,
        totalValue: newTotalValue
      });
    }
  };

  const handleAddItem = () => {
    if (editingOrder) {
      setEditingOrder({
        ...editingOrder,
        items: [...editingOrder.items, { reference: '', quantity: 1 }]
      });
    }
  };

  const handleChangeReference = (index: number, refId: string) => {
    if (editingOrder) {
      const newItems = [...editingOrder.items];
      newItems[index].reference = refId;
      const newTotalValue = newItems.reduce((sum, item) => {
        const price = item.salePrice !== undefined ? item.salePrice : state.references.find(r => r.id === item.reference)?.price || 0;
        return sum + (price * item.quantity);
      }, 0);
      setEditingOrder({
        ...editingOrder,
        items: newItems,
        totalValue: newTotalValue
      });
    }
  };

  const filteredOrders = useMemo(() => {
    return state.orders.filter(o => {
      const correria = state.correrias.find(c => c.id === o.correriaId);
      if (filterSeller && o.sellerId !== filterSeller) return false;
      if (filterYear && correria?.year !== filterYear) return false;
      if (filterCorreria && correria?.id !== filterCorreria) return false;
      if (filterClient && o.clientId !== filterClient) return false;
      return true;
    });
  }, [state.orders, state.correrias, filterSeller, filterYear, filterCorreria, filterClient]);

  return (
    <div className={`space-y-8 pb-20 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-white'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className={`text-3xl font-black tracking-tighter transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Historial de Pedidos</h2>
          <p className={`font-medium transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Registro global de ventas tabuladas</p>
        </div>
      </div>

      <div className={`rounded-[32px] shadow-lg p-6 md:p-8 transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-violet-900/30 to-pink-900/30 border-violet-700' : 'bg-gradient-to-r from-blue-50 to-pink-50 border-blue-200'} border-2`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-end gap-4">
          <div className="flex-1 min-w-[200px] space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest px-4 block transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-blue-600'}`}>👤 Vendedor</label>
            <select
              value={filterSeller}
              onChange={e => setFilterSeller(e.target.value)}
              className={`w-full px-4 py-3 rounded-2xl font-bold text-sm transition-all transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-600 text-violet-100 focus:ring-4 focus:ring-violet-600 focus:border-violet-500' : 'bg-white border-2 border-blue-200 text-slate-800 focus:ring-4 focus:ring-blue-100 focus:border-blue-400'} shadow-sm hover:border-opacity-75`}
            >
              <option value="">Todos los vendedores</option>
              {state.sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="flex-1 min-w-[150px] space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest px-4 block transition-colors duration-300 ${isDark ? 'text-pink-300' : 'text-pink-600'}`}>📅 Año</label>
            <input
              type="number"
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              placeholder="Ej: 2025"
              className={`w-full px-4 py-3 rounded-2xl font-bold text-sm transition-all transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-pink-600 text-violet-100 focus:ring-4 focus:ring-pink-600 focus:border-pink-500 placeholder:text-violet-400' : 'bg-white border-2 border-pink-200 text-slate-800 focus:ring-4 focus:ring-pink-100 focus:border-pink-400 placeholder:text-slate-400'} shadow-sm hover:border-opacity-75`}
            />
          </div>

          <div className="flex-1 min-w-[200px] space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest px-4 block transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-purple-600'}`}>🎯 Correría</label>
            <CorreriaAutocomplete
              value={filterCorreria}
              correrias={state.correrias}
              onChange={setFilterCorreria}
              search={correriaSearch}
              setSearch={setCorreriaSearch}
              showDropdown={showCorreriaDropdown}
              setShowDropdown={setShowCorreriaDropdown}
            />
          </div>

          <div className="flex-1 min-w-[200px] space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest px-4 block transition-colors duration-300 ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>🏪 Cliente</label>
            <ClientAutocomplete
              value={filterClient}
              clients={state.clients}
              onChange={setFilterClient}
              search={clientSearch}
              setSearch={setClientSearch}
              showDropdown={showClientDropdown}
              setShowDropdown={setShowClientDropdown}
            />
          </div>

          <button
            onClick={() => { setFilterSeller(''); setFilterYear(''); setFilterCorreria(''); setFilterClient(''); setClientSearch(''); setCorreriaSearch(''); }}
            className={`px-8 py-3 font-black rounded-2xl text-sm uppercase border-2 transition-all shadow-sm hover:shadow-md active:scale-95 whitespace-nowrap transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] text-violet-200 border-violet-600 hover:bg-[#6a5a85]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
          >
            ✕ Limpiar
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-4 transition-colors duration-300`}>
        {filteredOrders.length === 0 ? (
          <div className={`p-20 rounded-[40px] text-center flex flex-col items-center transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'} border`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] text-violet-600' : 'bg-slate-50 text-slate-200'}`}>
              <Icons.History />
            </div>
            <p className={`font-bold italic transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>No hay pedidos con los filtros seleccionados</p>
          </div>
        ) : (
          <>
            {filteredOrders.slice((ordersPagination.pagination.page - 1) * ordersPagination.pagination.limit, ordersPagination.pagination.page * ordersPagination.pagination.limit).map(o => {
              const client = state.clients.find(c => c.id === o.clientId);
              const seller = state.sellers.find(s => s.id === o.sellerId);
              const correria = state.correrias.find(c => c.id === o.correriaId);
              const isExpanded = expandedId === o.id;

              return (
                <div key={o.id} className={`rounded-[24px] shadow-sm overflow-hidden transition-all group transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'} border`}>
                  <div
                    className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-colors duration-300 ${isDark ? 'hover:bg-[#5a4a75]/30' : 'hover:bg-slate-50/50'}`}
                    onClick={() => setExpandedId(isExpanded ? null : o.id)}
                  >
                    {/* Lado izquierdo: info del cliente, truncado */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase transition-colors duration-300 ${isDark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>{correria?.name} {correria?.year}</span>
                        <span className={`text-[10px] font-bold transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-300'}`}>{o.createdAt ? o.createdAt.slice(0, 10) + ' T ' + o.createdAt.slice(11, 16) : ''}</span>
                      </div>
                      <div className="flex items-baseline gap-3 min-w-0">
                        <h3 className={`text-lg font-black truncate transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{client?.name || 'Cliente'}</h3>
                        <span className={`font-bold text-xs transition-colors duration-300 ${isDark ? 'text-violet-600' : 'text-slate-300'}`}>•</span>
                        <span className={`text-xs font-black transition-colors duration-300 ${isDark ? 'text-blue-300' : 'text-blue-400'}`}>{client?.id}</span>
                        <p className={`text-xs font-medium truncate transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>{client?.address}</p>
                      </div>
                      <p className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${isDark ? 'text-violet-300' : ''}`}>
                        <span className={`transition-colors duration-300 ${isDark ? 'text-pink-300' : 'text-pink-500'}`}>Vendedor: {seller?.name}</span>
                        <span className={`transition-colors duration-300 ${isDark ? 'text-violet-600' : 'text-slate-300'}`}>   —   </span>
                        <span className={`transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-violet-500'}`}>N° Pedido: {o.orderNumber ?? '-'}</span>
                      </p>
                    </div>

                    {/* Lado derecho: controles con ancho fijo */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleGenerateExcel(o, client, seller); }}
                        className={`px-4 py-2 font-black rounded-xl text-xs flex items-center gap-2 hover:opacity-80 focus:ring-4 transition-all shadow-sm whitespace-nowrap transition-colors duration-300 ${isDark ? 'bg-emerald-900/40 text-emerald-300 focus:ring-emerald-900/20' : 'bg-emerald-100 text-emerald-800 focus:ring-emerald-50'}`}
                        title="Generar pedido Excel"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Excel
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleGeneratePdf(o, client, seller); }}
                        className={`px-4 py-2 font-black rounded-xl text-xs flex items-center gap-2 hover:opacity-80 focus:ring-4 transition-all shadow-sm whitespace-nowrap transition-colors duration-300 ${isDark ? 'bg-red-900/40 text-red-300 focus:ring-red-900/20' : 'bg-red-100 text-red-700 focus:ring-red-50'}`}
                        title="Generar pedido PDF"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                        PDF
                      </button>

                      <div className="w-[60px] text-center">
                        <p className={`text-[9px] font-black uppercase tracking-widest mb-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>% OF</p>
                        <p className={`text-xs font-black transition-colors duration-300 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                          {o.porcentajeOficial !== null && o.porcentajeOficial !== undefined ? o.porcentajeOficial.toFixed(2) : '0.00'}
                        </p>
                      </div>
                      <div className="w-[60px] text-center">
                        <p className={`text-[9px] font-black uppercase tracking-widest mb-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>% RM</p>
                        <p className={`text-xs font-black transition-colors duration-300 ${isDark ? 'text-pink-300' : 'text-pink-600'}`}>
                          {o.porcentajeRemision !== null && o.porcentajeRemision !== undefined ? o.porcentajeRemision.toFixed(2) : '0.00'}
                        </p>
                      </div>

                      <div className="w-[110px] text-center">
                        <p className={`text-[9px] font-black uppercase tracking-widest mb-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Inicio Desp.</p>
                        <p className={`text-sm font-black transition-colors duration-300 ${o.startDate ? (isDark ? 'text-blue-300' : 'text-blue-600') : (isDark ? 'text-violet-600' : 'text-slate-300')}`}>
                          {o.startDate ? new Date(o.startDate).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'N/A'}
                        </p>
                      </div>
                      <div className="w-[110px] text-center">
                        <p className={`text-[9px] font-black uppercase tracking-widest mb-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Límite Desp.</p>
                        <p className={`text-sm font-black transition-colors duration-300 ${o.endDate ? (isDark ? 'text-pink-300' : 'text-pink-600') : (isDark ? 'text-violet-600' : 'text-slate-300')}`}>
                          {o.endDate ? new Date(o.endDate).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'N/A'}
                        </p>
                      </div>

                      <div className="w-[90px] text-center">
                        <p className={`text-[9px] font-black uppercase tracking-widest mb-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Resumen</p>
                        <p className={`text-sm font-black transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>{o.items.length} Refs</p>
                        <p className={`text-sm font-black transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>{o.items.reduce((a, b) => a + b.quantity, 0)} Unid.</p>
                      </div>
                      <div className="w-[100px] text-center">
                        <p className={`text-[9px] font-black uppercase tracking-widest mb-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Valor Total</p>
                        <p className={`text-lg font-black transition-colors duration-300 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>${o.totalValue.toLocaleString()}</p>
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditOrder(o); }}
                            className={`p-2 rounded-lg transition-colors transition-colors duration-300 ${isDark ? 'hover:bg-blue-900/30 text-blue-400 hover:text-blue-300' : 'hover:bg-blue-50 text-blue-600 hover:text-blue-700'}`}
                            title="Editar pedido"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteOrder(o.id); }}
                            className={`p-2 rounded-lg transition-colors transition-colors duration-300 ${isDark ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300' : 'hover:bg-red-50 text-red-600 hover:text-red-700'}`}
                            title="Eliminar pedido"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 2.991a1.125 1.125 0 00-1.06-.694H7.898a1.125 1.125 0 00-1.06.694L4.232 5.805M4.232 5.805a2.625 2.625 0 00-.5 5.177m.5-5.177l.8 12A1.125 1.125 0 005.971 20.625h12.058a1.125 1.125 0 001.065-1.393l.8-12M10.5 1.5H13.5m0 0H16.5M13.5 1.5h-3" />
                            </svg>
                          </button>
                        </div>
                      )}

                      <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-5 h-5 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-300'}`}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className={`p-8 border-t animate-in slide-in-from-top-2 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-700' : 'bg-slate-50/50 border-slate-100'}`}>
                      <div className={`rounded-3xl border overflow-hidden shadow-sm transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'}`}>
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className={`border-b transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-700' : 'bg-slate-50 border-slate-100'}`}>
                              <th className={`px-6 py-4 font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Referencia</th>
                              <th className={`px-6 py-4 font-black uppercase text-center transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Cantidad</th>
                              <th className={`px-6 py-4 font-black uppercase text-right transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Precio Unit.</th>
                              <th className={`px-6 py-4 font-black uppercase text-right transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y transition-colors duration-300 ${isDark ? 'divide-violet-700' : 'divide-slate-50'}`}>
                            {o.items.map((item, idx) => {
                              const ref = state.references.find(r => r.id === item.reference);
                              const displayPrice = item.salePrice !== undefined ? item.salePrice : ref?.price || 0;
                              return (
                                <tr key={idx} className={`transition-colors ${isDark ? 'hover:bg-[#5a4a75]/30' : 'hover:bg-slate-50'}`}>
                                  <td className="px-6 py-2">
                                    <p className={`font-black text-sm transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{item.reference}  -  <span className={`font-bold uppercase text-[10px] transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>{ref?.description}</span></p>
                                  </td>
                                  <td className={`px-6 py-2 text-center font-black text-sm transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>{item.quantity}</td>
                                  <td className={`px-6 py-2 text-right font-bold text-sm transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>${Math.round(displayPrice).toLocaleString('es-CO')}</td>
                                  <td className={`px-6 py-2 text-right font-black text-sm transition-colors duration-300 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>${Math.round(displayPrice * item.quantity).toLocaleString('es-CO')}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className={`font-black transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] text-violet-200' : 'bg-slate-50/80 text-slate-800'}`}>
                              <td className={`px-6 py-6 uppercase text-[9px] transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Totales Pedido</td>
                              <td className="px-6 py-6 text-center">{o.items.reduce((a, b) => a + b.quantity, 0)}</td>
                              <td></td>
                              <td className={`px-6 py-6 text-right text-lg transition-colors duration-300 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>${Math.round(o.totalValue).toLocaleString('es-CO')}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div className="mt-6">
              <PaginationComponent
                currentPage={ordersPagination.pagination.page}
                totalPages={ordersPagination.pagination.totalPages}
                pageSize={ordersPagination.pagination.limit}
                onPageChange={ordersPagination.goToPage}
                onPageSizeChange={ordersPagination.setLimit}
              />
            </div>
          </>
        )}
      </div>

      {/* Modal de Edición */}
      {editingOrderId && editingOrder && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-colors duration-300 ${isDark ? 'bg-black/60' : 'bg-black/50'}`}>
          <div className={`rounded-[32px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border border-violet-700' : 'bg-white'}`}>
            <div className={`p-8 border-b flex-shrink-0 transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-700' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-2xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Editar Pedido</h2>
                <button
                  onClick={() => {
                    setEditingOrderId(null);
                    setEditingOrder(null);
                  }}
                  className={`transition-colors duration-300 ${isDark ? 'text-violet-400 hover:text-violet-300' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto p-8 space-y-6 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-white'}`}>
              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Items del Pedido</h3>
                  <div className="flex items-center gap-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-violet-500'}`}>N° Pedido</label>
                    <input
                      type="number"
                      min="1"
                      value={editingOrder.orderNumber ?? ''}
                      onChange={(e) => setEditingOrder({ ...editingOrder, orderNumber: e.target.value ? parseInt(e.target.value) : undefined })}
                      onFocus={(e) => e.target.select()}
                      placeholder="—"
                      className={`w-20 px-3 py-1.5 rounded-xl text-sm font-black text-center focus:ring-2 transition-colors duration-300 ${isDark ? 'bg-violet-900/30 border-violet-600 text-violet-200 focus:ring-violet-600' : 'bg-violet-50 border-violet-200 text-violet-600 focus:ring-violet-300'} border`}
                    />
                  </div>
                </div>
                <div className={`grid grid-cols-[1fr_64px_96px_80px_32px] gap-2 px-4 mb-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>
                  <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Referencia</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest text-center transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Cantidad</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest text-center transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Precio venta</span>
                  <span></span>
                  <span></span>
                </div>
                <div className="space-y-3 mb-4">
                  {editingOrder.items.map((item, idx) => {
                    const ref = state.references.find(r => r.id === item.reference);
                    const displayPrice = item.salePrice !== undefined ? item.salePrice : ref?.price || 0;
                    return (
                      <div key={idx} className={`flex items-center gap-2 p-4 rounded-xl border transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-slate-50 border-slate-100'}`}>
                        <ReferenceAutocomplete
                          value={item.reference}
                          references={state.references}
                          onChange={(refId) => handleChangeReference(idx, refId)}
                        />
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItemQuantity(idx, parseInt(e.target.value) || 1)}
                          onFocus={(e) => e.target.select()}
                          className={`w-16 px-2 py-2 rounded-lg text-sm font-bold text-center focus:ring-2 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:ring-violet-600' : 'bg-white border-slate-200 text-slate-800 focus:ring-blue-400'} border`}
                          placeholder="Cant."
                        />
                        {focusedPriceIdx === idx ? (
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={displayPrice}
                            onChange={(e) => handleUpdateItemPrice(idx, parseFloat(e.target.value) || 0)}
                            onFocus={(e) => e.target.select()}
                            onBlur={() => setFocusedPriceIdx(null)}
                            autoFocus
                            className={`w-24 px-2 py-2 rounded-lg text-sm font-bold focus:ring-2 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:ring-violet-600' : 'bg-white border-slate-200 text-slate-800 focus:ring-blue-400'} border`}
                          />
                        ) : (
                          <span
                            onClick={() => setFocusedPriceIdx(idx)}
                            className={`w-24 px-2 py-2 rounded-lg text-sm font-bold cursor-text inline-block text-center border transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100' : 'bg-white border-slate-200 text-slate-800'}`}
                          >
                            $ {Math.round(displayPrice).toLocaleString('es-CO')}
                          </span>
                        )}
                        <span className={`text-sm font-bold min-w-fit transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-600'}`}>${(displayPrice * item.quantity).toLocaleString()}</span>
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className={`p-2 rounded-lg transition-colors flex-shrink-0 transition-colors duration-300 ${isDark ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300' : 'hover:bg-red-50 text-red-600 hover:text-red-700'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={handleAddItem}
                  className={`w-full px-4 py-3 font-black rounded-xl border-2 transition-colors text-sm uppercase transition-colors duration-300 ${isDark ? 'bg-blue-900/30 text-blue-300 border-blue-600 hover:bg-blue-900/50' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'}`}
                >
                  + Agregar Referencia
                </button>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest block text-center transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Fecha de Inicio</label>
                  <input
                    type="date"
                    value={editingOrder.startDate ? editingOrder.startDate.slice(0, 10) : ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, startDate: e.target.value || null })}
                    className={`w-full px-4 py-3 rounded-xl font-bold focus:ring-2 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:ring-violet-600' : 'bg-white border-slate-200 text-slate-900 focus:ring-blue-400'} border`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest block text-center transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Fecha de Fin</label>
                  <input
                    type="date"
                    value={editingOrder.endDate ? editingOrder.endDate.slice(0, 10) : ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, endDate: e.target.value || null })}
                    className={`w-full px-4 py-3 rounded-xl font-bold focus:ring-2 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:ring-violet-600' : 'bg-white border-slate-200 text-slate-900 focus:ring-blue-400'} border`}
                  />
                </div>
              </div>

              {/* Porcentajes de Facturación */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest block text-center transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>% Oficial</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingOrder.porcentajeOficial || ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, porcentajeOficial: e.target.value ? parseFloat(e.target.value) : null })}
                    onFocus={(e) => e.target.select()}
                    placeholder="0.00"
                    className={`w-full px-4 py-3 rounded-xl font-bold text-center focus:ring-2 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:ring-violet-600' : 'bg-white border-slate-200 text-slate-900 focus:ring-blue-400'} border`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest block text-center transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>% Remisión</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingOrder.porcentajeRemision || ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, porcentajeRemision: e.target.value ? parseFloat(e.target.value) : null })}
                    onFocus={(e) => e.target.select()}
                    placeholder="0.00"
                    className={`w-full px-4 py-3 rounded-xl font-bold text-center focus:ring-2 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:ring-violet-600' : 'bg-white border-slate-200 text-slate-900 focus:ring-blue-400'} border`}
                  />
                </div>
              </div>

              {/* Total */}
              <div className={`p-4 rounded-xl border-2 transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-blue-900/30 to-pink-900/30 border-blue-600' : 'bg-gradient-to-r from-blue-50 to-pink-50 border-blue-200'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>Valor Total</span>
                  <span className={`text-2xl font-black transition-colors duration-300 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>${editingOrder.totalValue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Acciones - Fixed at bottom */}
            <div className={`p-8 border-t flex-shrink-0 flex gap-3 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
              <button
                onClick={() => {
                  setEditingOrderId(null);
                  setEditingOrder(null);
                }}
                className={`flex-1 px-4 py-3 font-black rounded-xl transition-colors text-sm uppercase transition-colors duration-300 ${isDark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className={`flex-1 px-4 py-3 font-black rounded-xl transition-colors text-sm uppercase transition-colors duration-300 ${isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  React.useEffect(() => {
    ordersPagination.pagination.total = filteredOrders.length;
    ordersPagination.pagination.totalPages = Math.ceil(filteredOrders.length / ordersPagination.pagination.limit);
  }, [filteredOrders.length, ordersPagination.pagination.limit]);
};

const ReferenceAutocomplete: React.FC<{
  value: string;
  references: any[];
  onChange: (id: string) => void;
}> = ({ value, references, onChange }) => {
  const { isDark } = useDarkMode();
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const ref = references.find(r => r.id === value);
  const displayValue = ref ? `${ref.id} - ${ref.description}` : value;

  const filtered = references.filter(r =>
    r.id.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleBlur = () => {
    timeoutRef.current = setTimeout(() => setShowDropdown(false), 300);
  };

  const handleSelect = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onChange(id);
    setShowDropdown(false);
    setSearch('');
  };

  return (
    <div className="relative flex-1" ref={containerRef}>
      <input
        type="text"
        value={showDropdown ? search : displayValue}
        onChange={e => setSearch(e.target.value)}
        onFocus={() => { setShowDropdown(true); setSearch(''); }}
        onBlur={handleBlur}
        placeholder="Buscar referencia..."
        className={`w-full px-3 py-2 rounded-lg text-sm font-bold focus:ring-2 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:ring-violet-600' : 'bg-white border-slate-200 text-slate-800 focus:ring-blue-400'} border`}
      />
      {showDropdown && (
        <div
          className={`absolute top-full left-0 w-full mt-1 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50 border transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}
          onMouseDown={(e) => e.preventDefault()}
        >
          {filtered.map(r => (
            <button
              key={r.id}
              onMouseDown={() => handleSelect(r.id)}
              className={`w-full px-4 py-3 text-left border-b transition-colors duration-300 last:border-0 ${isDark ? 'hover:bg-[#5a4a75] border-violet-700' : 'hover:bg-blue-50 border-slate-50'}`}
            >
              <p className={`font-black text-sm transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{r.id}</p>
              <p className={`text-[10px] font-bold transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>{r.description}</p>
            </button>
          ))}
          {filtered.length === 0 && <p className={`px-4 py-3 font-bold italic text-sm transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>No se encontraron referencias</p>}
        </div>
      )}
    </div>
  );
};

const CorreriaAutocomplete: React.FC<{
  value: string;
  correrias: Correria[];
  onChange: (id: string) => void;
  search: string;
  setSearch: (search: string) => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
}> = ({ value, correrias, onChange, search, setSearch, showDropdown, setShowDropdown }) => {
  const { isDark } = useDarkMode();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const correria = correrias.find(c => c.id === value);
  const displayValue = correria ? `${correria.name} ${correria.year}` : value;

  const filtered = search.length >= 2 ? correrias.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.year.toString().includes(search)
  ) : [];

  const handleBlur = () => {
    timeoutRef.current = setTimeout(() => setShowDropdown(false), 300);
  };

  const handleSelect = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onChange(id);
    setShowDropdown(false);
    setSearch('');
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={showDropdown ? search : displayValue}
        onChange={e => setSearch(e.target.value)}
        onFocus={() => { setShowDropdown(true); setSearch(''); }}
        onBlur={handleBlur}
        placeholder="Buscar..."
        className={`w-full px-4 py-3 border-2 rounded-2xl font-bold text-sm transition-all shadow-sm hover:border-opacity-75 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-600 text-violet-100 focus:ring-4 focus:ring-violet-600 focus:border-violet-500 placeholder:text-violet-400' : 'bg-white border-purple-200 text-slate-800 focus:ring-4 focus:ring-purple-100 focus:border-purple-400 placeholder:text-slate-400'}`}
      />
      {showDropdown && (
        <div
          className={`absolute top-full left-0 w-full mt-2 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50 border transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}
          onMouseDown={(e) => e.preventDefault()}
        >
          {filtered.map(c => (
            <button
              key={c.id}
              onMouseDown={() => handleSelect(c.id)}
              className={`w-full px-6 py-4 text-left border-b transition-colors duration-300 last:border-0 ${isDark ? 'hover:bg-[#5a4a75] border-violet-700' : 'hover:bg-slate-50 border-slate-50'}`}
            >
              <p className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{c.name}</p>
              <p className={`text-[10px] font-bold transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>{c.year}</p>
            </button>
          ))}
          {filtered.length === 0 && search.length >= 2 && <p className={`px-6 py-4 font-bold italic text-sm transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>No se encontraron correrias</p>}
          {filtered.length === 0 && search.length < 2 && <p className={`px-6 py-4 font-bold italic text-sm transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Escribe al menos 2 letras...</p>}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryView;

const ClientAutocomplete: React.FC<{
  value: string;
  clients: Client[];
  onChange: (id: string) => void;
  search: string;
  setSearch: (search: string) => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
}> = ({ value, clients, onChange, search, setSearch, showDropdown, setShowDropdown }) => {
  const { isDark } = useDarkMode();
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const client = clients.find(c => c.id === value);
  const displayValue = client ? client.name : value;

  const filtered = search.length >= 2 ? clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 30) : [];

  const handleBlur = () => {
    timeoutRef.current = setTimeout(() => setShowDropdown(false), 300);
  };

  const handleSelect = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onChange(id);
    setShowDropdown(false);
    setSearch('');
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={showDropdown ? search : displayValue}
        onChange={e => setSearch(e.target.value)}
        onFocus={() => { setShowDropdown(true); setSearch(''); }}
        onBlur={handleBlur}
        placeholder="Buscar cliente..."
        className={`w-full px-4 py-3 border-2 rounded-2xl font-bold text-sm transition-all shadow-sm hover:border-opacity-75 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-orange-600 text-violet-100 focus:ring-4 focus:ring-orange-600 focus:border-orange-500 placeholder:text-violet-400' : 'bg-white border-orange-200 text-slate-800 focus:ring-4 focus:ring-orange-100 focus:border-orange-400 placeholder:text-slate-400'}`}
      />
      {showDropdown && (
        <div
          className={`absolute top-full left-0 w-full mt-2 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50 border transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}
          onMouseDown={(e) => e.preventDefault()}
        >
          {filtered.map(c => (
            <button
              key={c.id}
              onMouseDown={() => handleSelect(c.id)}
              className={`w-full px-6 py-4 text-left border-b transition-colors duration-300 last:border-0 ${isDark ? 'hover:bg-[#5a4a75] border-violet-700' : 'hover:bg-slate-50 border-slate-50'}`}
            >
              <p className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{c.name}</p>
              <p className={`text-[10px] font-bold transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>{c.id}</p>
            </button>
          ))}
          {filtered.length === 0 && search.length >= 2 && <p className={`px-6 py-4 font-bold italic text-sm transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>No se encontraron clientes</p>}
          {filtered.length === 0 && search.length < 2 && <p className={`px-6 py-4 font-bold italic text-sm transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Escribe al menos 2 letras...</p>}
        </div>
      )}
    </div>
  );
};
