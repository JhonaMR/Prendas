import React, { useMemo } from 'react';
import { AppState, Seller } from '../../types';

interface ChartsVisualizationProps {
  selectedCorreria: string;
  state: AppState;
  loading: boolean;
}

const ChartsVisualization: React.FC<ChartsVisualizationProps> = ({ selectedCorreria, state, loading }) => {
  // Calculate seller fulfillment data
  const sellerFulfillmentData = useMemo(() => {
    if (!state.orders || !state.dispatches || !state.sellers) {
      return [];
    }

    const ordersForCorreria = state.orders.filter(o => o.correriaId === selectedCorreria);
    const dispatchesForCorreria = state.dispatches.filter(d => d.correriaId === selectedCorreria);

    // Group by seller
    const sellerMap = new Map<string, { unitsSold: number; unitsDispatched: number; valueSold: number; valueDispatched: number; sellerName: string }>();

    ordersForCorreria.forEach(order => {
      const sellerId = order.sellerId;
      const seller = state.sellers?.find(s => s.id === sellerId);
      const sellerName = seller?.name || sellerId;

      const units = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      const value = order.totalValue || 0;

      if (!sellerMap.has(sellerId)) {
        sellerMap.set(sellerId, { unitsSold: 0, unitsDispatched: 0, valueSold: 0, valueDispatched: 0, sellerName });
      }

      const data = sellerMap.get(sellerId)!;
      data.unitsSold += units;
      data.valueSold += value;
    });

    dispatchesForCorreria.forEach(dispatch => {
      const clientId = dispatch.clientId;
      const client = state.clients?.find(c => c.id === clientId);
      const sellerId = client?.sellerId;

      if (sellerId) {
        const seller = state.sellers?.find(s => s.id === sellerId);
        const sellerName = seller?.name || sellerId;

        const units = dispatch.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
        const value = dispatch.items?.reduce((sum, item) => {
          const price = item.salePrice || state.references?.find(r => r.id === item.reference)?.price || 0;
          return sum + (price * item.quantity);
        }, 0) || 0;

        if (!sellerMap.has(sellerId)) {
          sellerMap.set(sellerId, { unitsSold: 0, unitsDispatched: 0, valueSold: 0, valueDispatched: 0, sellerName });
        }

        const data = sellerMap.get(sellerId)!;
        data.unitsDispatched += units;
        data.valueDispatched += value;
      }
    });

    return Array.from(sellerMap.entries()).map(([sellerId, data]) => ({
      sellerId,
      sellerName: data.sellerName,
      unitsSold: data.unitsSold,
      unitsDispatched: data.unitsDispatched,
      valueSold: data.valueSold,
      valueDispatched: data.valueDispatched,
      fulfillmentPercentage: data.unitsSold > 0 ? Math.round((data.unitsDispatched / data.unitsSold) * 100 * 100) / 100 : 0,
      valuePercentage: data.valueSold > 0 ? Math.round((data.valueDispatched / data.valueSold) * 100 * 100) / 100 : 0
    }));
  }, [selectedCorreria, state]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 font-semibold">Cargando gráficas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fulfillment by Seller - Split into two halves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Fulfillment by Units */}
        <div className="bg-violet-50 rounded-3xl shadow-sm border border-violet-200 p-6">
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 text-center">Cumplimiento por Unidades</h3>

          {sellerFulfillmentData.length > 0 ? (
            <div className="space-y-3">
              {sellerFulfillmentData.map((seller) => (
                <div key={seller.sellerId} className="bg-gradient-to-r from-indigo-100 to-indigo-150 rounded-2xl p-4 border border-indigo-300 hover:border-indigo-400 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-base font-bold text-slate-900 truncate">{seller.sellerName}</p>
                    <p className="text-base font-black text-indigo-600 ml-2 flex-shrink-0">
                      {seller.fulfillmentPercentage}%
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="h-3 bg-indigo-300 rounded-full overflow-hidden shadow-sm">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 transition-all duration-300 rounded-full"
                        style={{ width: `${Math.min(seller.fulfillmentPercentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-sm font-bold text-indigo-600">{seller.unitsDispatched}</span>
                      <span className="text-sm text-slate-400">/</span>
                      <span className="text-sm font-bold text-slate-700">{seller.unitsSold}</span>
                      <span className="text-xs text-slate-500 ml-1">unidades</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">No hay datos de vendedores para esta correría</p>
            </div>
          )}
        </div>

        {/* Right: Fulfillment by Value */}
        <div className="bg-violet-50 rounded-3xl shadow-sm border border-violet-200 p-6">
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 text-center">Cumplimiento por Valor</h3>

          {sellerFulfillmentData.length > 0 ? (
            <div className="space-y-3">
              {sellerFulfillmentData.map((seller) => (
                <div key={`value-${seller.sellerId}`} className="bg-gradient-to-r from-indigo-100 to-indigo-150 rounded-2xl p-4 border border-indigo-300 hover:border-indigo-400 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-base font-bold text-slate-900 truncate">{seller.sellerName}</p>
                    <p className="text-base font-black text-indigo-600 ml-2 flex-shrink-0">
                      {seller.valuePercentage}%
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="h-3 bg-indigo-300 rounded-full overflow-hidden shadow-sm">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 transition-all duration-300 rounded-full"
                        style={{ width: `${Math.min(seller.valuePercentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-sm font-bold text-indigo-600">${seller.valueDispatched.toLocaleString()}</span>
                      <span className="text-sm text-slate-400">/</span>
                      <span className="text-sm font-bold text-slate-700">${seller.valueSold.toLocaleString()}</span>
                      <span className="text-xs text-slate-500 ml-1">pesos</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">No hay datos de vendedores para esta correría</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartsVisualization;
