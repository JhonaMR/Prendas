
import React, { useState, useMemo } from 'react';
import { Order, AppState, Correria, User, UserRole } from '../types';
import { Icons } from '../constants';
import { api } from '../services/api';
import PaginationComponent from '../components/PaginationComponent';
import usePagination from '../hooks/usePagination';

interface OrderHistoryViewProps {
  state: AppState;
  currentUser?: User | null;
  onOrderUpdate?: (order: Order) => void;
  onOrderDelete?: (orderId: string) => void;
}

const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({ state, currentUser, onOrderUpdate, onOrderDelete }) => {
  
  const [filterSeller, setFilterSeller] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterCorreria, setFilterCorreria] = useState('');
  const [correriaSearch, setCorreriaSearch] = useState('');
  const [showCorreriaDropdown, setShowCorreriaDropdown] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const ordersPagination = usePagination(1, 50);

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const years = useMemo(() => Array.from(new Set(state.correrias.map(c => c.year))).sort(), [state.correrias]);

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
      return true;
    });
  }, [state.orders, state.correrias, filterSeller, filterYear, filterCorreria]);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Historial de Pedidos</h2>
          <p className="text-slate-400 font-medium">Registro global de ventas tabuladas</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-[32px] shadow-lg border-2 border-blue-200 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-black">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.75 7.707 2.122.98.566 1.766 1.423 2.228 2.45.461 1.026.696 2.189.696 3.428 0 3.623-2.343 6.723-5.656 7.972-.9.383-1.97.591-3.075.591-.703 0-1.386-.067-2.042-.2.537.406 1.522 1.064 2.687 1.84 1.165.777 2.527 1.694 3.528 2.848.501.577.978 1.196 1.422 1.858.444.662.852 1.365 1.22 2.105.368.74.694 1.52.973 2.325.279.805.506 1.636.676 2.485.17.849.28 1.723.325 2.607M12 3v18m0 0c-2.755 0-5.455-.75-7.707-2.122-.98-.566-1.766-1.423-2.228-2.45C.604 15.402.369 14.239.369 13c0-3.623 2.343-6.723 5.656-7.972.9-.383 1.97-.591 3.075-.591.703 0 1.386.067 2.042.2-.537-.406-1.522-1.064-2.687-1.84-1.165-.777-2.527-1.694-3.528-2.848-.501-.577-.978-1.196-1.422-1.858-.444-.662-.852-1.365-1.22-2.105-.368-.74-.694-1.52-.973-2.325-.279-.805-.506-1.636-.676-2.485-.17-.849-.28-1.723-.325-2.607" />
            </svg>
          </div>
          <h3 className="text-lg md:text-xl font-black text-slate-800">Filtrar Resultados</h3>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-end gap-4">
          <div className="flex-1 min-w-[200px] space-y-2">
            <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-4 block">👤 Vendedor</label>
            <select 
              value={filterSeller} 
              onChange={e => setFilterSeller(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-2xl font-bold text-sm text-slate-800 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm hover:border-blue-300"
            >
              <option value="">Todos los vendedores</option>
              {state.sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="flex-1 min-w-[150px] space-y-2">
            <label className="text-[10px] font-black text-pink-600 uppercase tracking-widest px-4 block">📅 Año</label>
            <select 
              value={filterYear} 
              onChange={e => setFilterYear(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-pink-200 rounded-2xl font-bold text-sm text-slate-800 focus:ring-4 focus:ring-pink-100 focus:border-pink-400 transition-all shadow-sm hover:border-pink-300"
            >
              <option value="">Cualquier año</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="flex-1 min-w-[200px] space-y-2">
            <label className="text-[10px] font-black text-purple-600 uppercase tracking-widest px-4 block">🎯 Correría</label>
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

          <button 
            onClick={() => { setFilterSeller(''); setFilterYear(''); setFilterCorreria(''); }} 
            className="px-8 py-3 bg-white text-slate-600 font-black rounded-2xl text-sm uppercase border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow-md active:scale-95 whitespace-nowrap"
          >
            ✕ Limpiar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-20 rounded-[40px] text-center border border-slate-100 flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
              <Icons.History />
            </div>
            <p className="text-slate-400 font-bold italic">No hay pedidos con los filtros seleccionados</p>
          </div>
        ) : (
          <>
            {filteredOrders.slice((ordersPagination.pagination.page - 1) * ordersPagination.pagination.limit, ordersPagination.pagination.page * ordersPagination.pagination.limit).map(o => {
            const client = state.clients.find(c => c.id === o.clientId);
            const seller = state.sellers.find(s => s.id === o.sellerId);
            const correria = state.correrias.find(c => c.id === o.correriaId);
            const isExpanded = expandedId === o.id;

            return (
              <div key={o.id} className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden transition-all group">
                <div 
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50"
                  onClick={() => setExpandedId(isExpanded ? null : o.id)}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black uppercase">{correria?.name} {correria?.year}</span>
                      <span className="text-[10px] text-slate-300 font-bold">{o.createdAt}</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <h3 className="text-lg font-black text-slate-800">{client?.name || 'Cliente'}</h3>
                      <p className="text-xs font-medium text-slate-500">{client?.address}</p>
                    </div>
                    <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Vendedor: {seller?.name}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-300 uppercase">Resumen</p>
                      <p className="text-sm font-black text-slate-700">{o.items.length} Refs • {o.items.reduce((a,b)=>a+b.quantity,0)} Unid.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-300 uppercase">Valor Total</p>
                      <p className="text-lg font-black text-blue-600">${o.totalValue.toLocaleString()}</p>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditOrder(o);
                          }}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600 hover:text-blue-700"
                          title="Editar pedido"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOrder(o.id);
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 hover:text-red-700"
                          title="Eliminar pedido"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 2.991a1.125 1.125 0 00-1.06-.694H7.898a1.125 1.125 0 00-1.06.694L4.232 5.805M4.232 5.805a2.625 2.625 0 00-.5 5.177m.5-5.177l.8 12A1.125 1.125 0 005.971 20.625h12.058a1.125 1.125 0 001.065-1.393l.8-12M10.5 1.5H13.5m0 0H16.5M13.5 1.5h-3" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-slate-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-8 bg-slate-50/50 border-t border-slate-100 animate-in slide-in-from-top-2">
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-4 font-black text-slate-400 uppercase">Referencia</th>
                            <th className="px-6 py-4 font-black text-slate-400 uppercase text-center">Cantidad</th>
                            <th className="px-6 py-4 font-black text-slate-400 uppercase text-right">Precio Unit.</th>
                            <th className="px-6 py-4 font-black text-slate-400 uppercase text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {o.items.map((item, idx) => {
                            const ref = state.references.find(r => r.id === item.reference);
                            const displayPrice = item.salePrice !== undefined ? item.salePrice : ref?.price || 0;
                            return (
                              <tr key={idx}>
                                <td className="px-6 py-4">
                                  <p className="font-black text-slate-800">{item.reference}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase">{ref?.description}</p>
                                </td>
                                <td className="px-6 py-4 text-center font-black text-slate-700">{item.quantity}</td>
                                <td className="px-6 py-4 text-right font-bold text-slate-500">${displayPrice.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right font-black text-blue-600">${(displayPrice * item.quantity).toLocaleString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-50/80 font-black text-slate-800">
                            <td className="px-6 py-6 uppercase text-[9px] text-slate-400">Totales Pedido</td>
                            <td className="px-6 py-6 text-center">{o.items.reduce((a,b)=>a+b.quantity,0)}</td>
                            <td></td>
                            <td className="px-6 py-6 text-right text-blue-600 text-lg">${o.totalValue.toLocaleString()}</td>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-800">Editar Pedido</h2>
                <button
                  onClick={() => {
                    setEditingOrderId(null);
                    setEditingOrder(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Items */}
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-4">Items del Pedido</h3>
                <div className="space-y-3 mb-4">
                  {editingOrder.items.map((item, idx) => {
                    const ref = state.references.find(r => r.id === item.reference);
                    const displayPrice = item.salePrice !== undefined ? item.salePrice : ref?.price || 0;
                    return (
                      <div key={idx} className="flex items-center gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
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
                          className="w-16 px-2 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-400"
                          placeholder="Cant."
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={displayPrice}
                          onChange={(e) => handleUpdateItemPrice(idx, parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-400"
                          placeholder="Precio"
                        />
                        <span className="text-sm font-bold text-slate-600 min-w-fit">${(displayPrice * item.quantity).toLocaleString()}</span>
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 hover:text-red-700 flex-shrink-0"
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
                  className="w-full px-4 py-3 bg-blue-50 text-blue-600 font-black rounded-xl border-2 border-blue-200 hover:bg-blue-100 transition-colors text-sm uppercase"
                >
                  + Agregar Referencia
                </button>
              </div>

              {/* Total */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-pink-50 rounded-xl border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-600 uppercase">Valor Total</span>
                  <span className="text-2xl font-black text-blue-600">${editingOrder.totalValue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Acciones - Fixed at bottom */}
            <div className="p-8 border-t border-slate-100 bg-white flex-shrink-0 flex gap-3">
              <button
                onClick={() => {
                  setEditingOrderId(null);
                  setEditingOrder(null);
                }}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-black rounded-xl hover:bg-slate-200 transition-colors text-sm uppercase"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-colors text-sm uppercase"
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
        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-400"
      />
      {showDropdown && (
        <div 
          className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-100 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50"
          onMouseDown={(e) => e.preventDefault()}
        >
          {filtered.map(r => (
            <button
              key={r.id}
              onMouseDown={() => handleSelect(r.id)}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0"
            >
              <p className="font-black text-slate-800 text-sm">{r.id}</p>
              <p className="text-[10px] text-slate-400 font-bold">{r.description}</p>
            </button>
          ))}
          {filtered.length === 0 && <p className="px-4 py-3 text-slate-400 font-bold italic text-sm">No se encontraron referencias</p>}
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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const correria = correrias.find(c => c.id === value);
  const displayValue = correria ? `${correria.name} ${correria.year}` : value;

  const filtered = correrias.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.year.toString().includes(search)
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
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={showDropdown ? search : displayValue}
        onChange={e => setSearch(e.target.value)}
        onFocus={() => { setShowDropdown(true); setSearch(''); }}
        onBlur={handleBlur}
        placeholder="Buscar..."
        className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-2xl font-bold text-sm text-slate-800 focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all shadow-sm hover:border-purple-300"
      />
      {showDropdown && (
        <div 
          className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50"
          onMouseDown={(e) => e.preventDefault()}
        >
          {filtered.map(c => (
            <button
              key={c.id}
              onMouseDown={() => handleSelect(c.id)}
              className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
            >
              <p className="font-black text-slate-800">{c.name}</p>
              <p className="text-[10px] text-slate-400 font-bold">{c.year}</p>
            </button>
          ))}
          {filtered.length === 0 && <p className="px-6 py-4 text-slate-400 font-bold italic text-sm">No se encontraron correrias</p>}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryView;
