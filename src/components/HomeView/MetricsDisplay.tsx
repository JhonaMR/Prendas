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

    // Calculate value dispatched (estimate based on dispatch items)
    const valueDispatched = dispatchesForCorreria.reduce((sum, dispatch) => {
      return sum + (dispatch.items?.reduce((itemSum, item) => {
        // Find reference price if available
        const ref = state.references?.find(r => r.id === item.reference);
        return itemSum + ((ref?.price || 0) * item.quantity);
      }, 0) || 0);
    }, 0);

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

  const MetricCard: React.FC<{ label: string; value: string | number; unit?: string; icon: React.ReactNode }> = ({
    label,
    value,
    unit,
    icon
  }) => (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-xs md:text-sm font-semibold text-slate-600 uppercase tracking-wide">{label}</h4>
        <div className="text-slate-400">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl md:text-3xl font-black text-slate-900">{value}</p>
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
      </div>
    </div>
  );

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
      <div>
        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3">Métricas de Ventas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            label="Unidades Vendidas"
            value={metrics.unitsSold}
            unit="unidades"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0A24.226 24.226 0 005.378 3.099M9.6 19.5h4.8M7.575 2.6h8.85m0 0A20.523 20.523 0 006.75 10.5" /></svg>}
          />
          <MetricCard
            label="Unidades Despachadas"
            value={metrics.unitsDispatched}
            unit="unidades"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m0 0H3m16.5 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m0 0H21m-9-12a.75.75 0 00-.75.75v6.75h9V2.25a.75.75 0 00-.75-.75h-3.268a.75.75 0 00-.75.75V9m-15 0a.75.75 0 01.75-.75H9m0 0a.75.75 0 01.75.75v6.75H.75V2.25a.75.75 0 01.75-.75h3.268a.75.75 0 01.75.75V9" /></svg>}
          />
          <MetricCard
            label="Cumplimiento (%)"
            value={metrics.fulfillmentPercentage}
            unit="%"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <MetricCard
            label="Pedidos Tomados"
            value={metrics.ordersTaken}
            unit="pedidos"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .984.578 1.83 1.414 2.209m-5.314 0a48.882 48.882 0 013.814.051m6.314 0a48.882 48.882 0 013.814-.051m0 0A3.75 3.75 0 0021 12a3.75 3.75 0 01-3.75 3.75m0 0A3.75 3.75 0 0113.5 15.75m0 0A3.75 3.75 0 0110.125 12" /></svg>}
          />
          <MetricCard
            label="Valor Vendido"
            value={`$${metrics.valueSold.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3.75-6.75h7.5M12 3c-4.97 0-9 2.686-9 6v6c0 3.314 4.03 6 9 6s9-2.686 9-6V9c0-3.314-4.03-6-9-6z" /></svg>}
          />
          <MetricCard
            label="Valor Despachado"
            value={`$${metrics.valueDispatched.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5H4.5A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z" /></svg>}
          />
        </div>
      </div>

      {/* Efficiency Metrics */}
      <div>
        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3">Métricas de Eficiencia</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCard
            label="Lotes en Proceso"
            value={metrics.batchesInProcess}
            unit="lotes"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m0 0C5.25 5.547 8.167 5.25 12 5.25s6.75.297 9 1.125" /></svg>}
          />
          <MetricCard
            label="Eficiencia de Entrega"
            value={metrics.deliveryEfficiency}
            unit="%"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>
      </div>
    </div>
  );
};

export default MetricsDisplay;
