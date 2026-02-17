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
    const sellerMap = new Map<string, { unitsSold: number; unitsDispatched: number; sellerName: string }>();

    ordersForCorreria.forEach(order => {
      const sellerId = order.sellerId;
      const seller = state.sellers?.find(s => s.id === sellerId);
      const sellerName = seller?.name || sellerId;

      const units = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

      if (!sellerMap.has(sellerId)) {
        sellerMap.set(sellerId, { unitsSold: 0, unitsDispatched: 0, sellerName });
      }

      const data = sellerMap.get(sellerId)!;
      data.unitsSold += units;
    });

    dispatchesForCorreria.forEach(dispatch => {
      const clientId = dispatch.clientId;
      const client = state.clients?.find(c => c.id === clientId);
      const sellerId = client?.sellerId;

      if (sellerId) {
        const seller = state.sellers?.find(s => s.id === sellerId);
        const sellerName = seller?.name || sellerId;

        const units = dispatch.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

        if (!sellerMap.has(sellerId)) {
          sellerMap.set(sellerId, { unitsSold: 0, unitsDispatched: 0, sellerName });
        }

        const data = sellerMap.get(sellerId)!;
        data.unitsDispatched += units;
      }
    });

    return Array.from(sellerMap.entries()).map(([sellerId, data]) => ({
      sellerId,
      sellerName: data.sellerName,
      unitsSold: data.unitsSold,
      unitsDispatched: data.unitsDispatched,
      fulfillmentPercentage: data.unitsSold > 0 ? Math.round((data.unitsDispatched / data.unitsSold) * 100 * 100) / 100 : 0
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
      {/* Fulfillment by Seller */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-6">Cumplimiento por Vendedor</h3>

        {sellerFulfillmentData.length > 0 ? (
          <div className="space-y-3">
            {sellerFulfillmentData.map((seller) => (
              <div key={seller.sellerId} className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-base font-bold text-slate-900 truncate">{seller.sellerName}</p>
                  <p className="text-base font-black text-blue-600 ml-2 flex-shrink-0">
                    {seller.fulfillmentPercentage}%
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="h-3 bg-slate-300 rounded-full overflow-hidden shadow-sm">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 transition-all duration-300 rounded-full"
                      style={{ width: `${Math.min(seller.fulfillmentPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-sm font-bold text-blue-600">{seller.unitsDispatched}</span>
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Units by Seller */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h4 className="text-lg md:text-xl font-black text-slate-900 mb-4">Unidades por Vendedor</h4>
          <div className="space-y-2">
            {sellerFulfillmentData.slice(0, 5).map((seller) => (
              <div key={seller.sellerId} className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-3 border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200 flex items-center justify-between">
                <span className="text-base font-semibold text-slate-900 truncate">{seller.sellerName}</span>
                <span className="text-xl font-black text-blue-600 ml-2 flex-shrink-0">{seller.unitsSold}</span>
              </div>
            ))}
            {sellerFulfillmentData.length > 5 && (
              <div className="text-xs font-semibold text-slate-500 pt-2 border-t border-slate-200 text-center">
                +{sellerFulfillmentData.length - 5} vendedores más
              </div>
            )}
          </div>
        </div>

        {/* Fulfillment Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-4">Distribución de Cumplimiento</h4>
          <div className="space-y-3">
            {(() => {
              const excellent = sellerFulfillmentData.filter(s => s.fulfillmentPercentage >= 90).length;
              const good = sellerFulfillmentData.filter(s => s.fulfillmentPercentage >= 70 && s.fulfillmentPercentage < 90).length;
              const fair = sellerFulfillmentData.filter(s => s.fulfillmentPercentage >= 50 && s.fulfillmentPercentage < 70).length;
              const poor = sellerFulfillmentData.filter(s => s.fulfillmentPercentage < 50).length;

              return (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm text-slate-600">Excelente (≥90%)</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{excellent}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm text-slate-600">Bueno (70-89%)</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{good}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="text-sm text-slate-600">Regular (50-69%)</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{fair}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-sm text-slate-600">Bajo (&lt;50%)</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{poor}</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsVisualization;
