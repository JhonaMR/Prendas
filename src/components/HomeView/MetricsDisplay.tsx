import React, { useMemo } from 'react';
import { AppState } from '../../types';

interface MetricsDisplayProps {
  selectedCorreria: string;
  state: AppState;
  loading: boolean;
}

interface MetricsData {
  unitsSold: number;
  unitsDispatched: number;
  fulfillmentPercentage: number;
  ordersTaken: number;
  valueSold: number;
  valueDispatched: number;
  batchesInProcess: number;
  deliveryEfficiency: number;
}

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ selectedCorreria, state, loading }) => {
  // Calculate metrics
  const metrics = useMemo<MetricsData>(() => {
    if (!state.orders || !state.dispatches || !state.deliveryDates) {
      return {
        unitsSold: 0,
        unitsDispatched: 0,
        fulfillmentPercentage: 0,
        ordersTaken: 0,
        valueSold: 0,
        valueDispatched: 0,
        batchesInProcess: 0,
        deliveryEfficiency: 0
      };
    }

    // Filter data by correria
    const ordersForCorreria = state.orders.filter(o => o.correriaId === selectedCorreria);
    const dispatchesForCorreria = state.dispatches.filter(d => d.correriaId === selectedCorreria);
    const deliveryDatesForCorreria = state.deliveryDates.filter(d => d.process === 'in_process');

    // Calculate units sold
    const unitsSold = ordersForCorreria.reduce((sum, order) => {
      return sum + (order.items?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0);
    }, 0);

    // Calculate units dispatched
    const unitsDispatched = dispatchesForCorreria.reduce((sum, dispatch) => {
      return sum + (dispatch.items?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0);
    }, 0);

    // Calculate fulfillment percentage
    const fulfillmentPercentage = unitsSold > 0 ? Math.round((unitsDispatched / unitsSold) * 100 * 100) / 100 : 0;

    // Calculate orders taken
    const ordersTaken = ordersForCorreria.length;

    // Calculate value sold
    const valueSold = ordersForCorreria.reduce((sum, order) => sum + (order.totalValue || 0), 0);

    // Calculate value dispatched (using salePrice from dispatch items)
    const valueDispatched = dispatchesForCorreria.reduce((sum, dispatch) => {
      const dispatchValue = dispatch.items?.reduce((itemSum, item) => {
        // Usar el salePrice del despacho si existe, si no usar el precio de referencia
        const price = item.salePrice || state.references?.find(r => r.id === item.reference)?.price || 0;
        return itemSum + (price * item.quantity);
      }, 0) || 0;
      
      console.log(`📦 Despacho ${dispatch.id}: valor=${dispatchValue}, items=${dispatch.items?.length}`);
      
      return sum + dispatchValue;
    }, 0);
    
    console.log(`💰 Total valor despachado: ${valueDispatched}`);

    // Calculate batches in process
    const batchesInProcess = deliveryDatesForCorreria.length;

    // Calculate delivery efficiency
    const onTimeDeliveries = state.deliveryDates.filter(d => {
      if (!d.deliveryDate || !d.expectedDate) return false;
      return new Date(d.deliveryDate) <= new Date(d.expectedDate);
    }).length;

    const totalDeliveries = state.deliveryDates.filter(d => d.deliveryDate).length;
    const deliveryEfficiency = totalDeliveries > 0 ? Math.round((onTimeDeliveries / totalDeliveries) * 100 * 100) / 100 : 0;

    return {
      unitsSold,
      unitsDispatched,
      fulfillmentPercentage,
      ordersTaken,
      valueSold,
      valueDispatched,
      batchesInProcess,
      deliveryEfficiency
    };
  }, [selectedCorreria, state]);

  const MetricCard: React.FC<{ label: string; value: string | number; unit?: string }> = ({
    label,
    value,
    unit,
  }) => {
    // Asignar colores pastel según el label
    const getBackgroundColor = () => {
      if (label.includes('Vendidas')) return 'bg-orange-50';
      if (label.includes('Despachadas')) return 'bg-orange-50';
      if (label.includes('Cumplimiento')) return 'bg-blue-50';
      if (label.includes('Tomados')) return 'bg-purple-50';
      if (label.includes('Vendido')) return 'bg-green-50';
      if (label.includes('Despachado')) return 'bg-emerald-50';
      if (label.includes('Proceso')) return 'bg-pink-50';
      if (label.includes('Entrega')) return 'bg-cyan-50';
      return 'bg-slate-50';
    };

    const getBorderColor = () => {
      if (label.includes('Vendidas')) return 'border-orange-200';
      if (label.includes('Despachadas')) return 'border-orange-200';
      if (label.includes('Cumplimiento')) return 'border-blue-200';
      if (label.includes('Tomados')) return 'border-purple-200';
      if (label.includes('Vendido')) return 'border-green-200';
      if (label.includes('Despachado')) return 'border-emerald-200';
      if (label.includes('Proceso')) return 'border-pink-200';
      if (label.includes('Entrega')) return 'border-cyan-200';
      return 'border-slate-200';
    };

    return (
      <div className={`${getBackgroundColor()} rounded-2xl border ${getBorderColor()} p-4 md:p-6 hover:shadow-md transition-shadow`}>
        <div className="mb-3">
          <h4 className="text-xs md:text-sm font-semibold text-slate-600 uppercase tracking-wide">{label}</h4>
        </div>
        <div className="flex items-baseline gap-2 min-h-[2.5rem]">
          <p className="text-xl md:text-2xl font-black text-slate-900 break-words line-clamp-2">{value}</p>
          {unit && <span className="text-xs md:text-sm text-slate-500 flex-shrink-0">{unit}</span>}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 font-semibold">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sales Metrics */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-pink-100 px-6 py-3">
          <h3 className="text-sm font-bold text-pink-700 uppercase tracking-wide text-center">Métricas de Ventas</h3>
        </div>
        <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            label="Unidades Vendidas"
            value={metrics.unitsSold}
            unit="unidades"
          />
          <MetricCard
            label="Unidades Despachadas"
            value={metrics.unitsDispatched}
            unit="unidades"
          />
          <MetricCard
            label="Cumplimiento (%)"
            value={metrics.fulfillmentPercentage}
            unit="%"
          />
          <MetricCard
            label="Valor Vendido"
            value={`${metrics.valueSold.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`}
          />
          <MetricCard
            label="Valor Despachado"
            value={`${metrics.valueDispatched.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`}
          />
          <MetricCard
            label="Pedidos Tomados"
            value={metrics.ordersTaken}
            unit="pedidos"
          />
        </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDisplay;
