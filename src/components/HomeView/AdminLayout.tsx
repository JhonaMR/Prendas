import React, { useState, useEffect } from 'react';
import { User, Correria, AppState } from '../../types';
import { Icons } from '../../constants';
import CorreriaSelectorDropdown from './CorreriaSelectorDropdown.tsx';
import MetricsDisplay from './MetricsDisplay.tsx';
import ChartsVisualization from './ChartsVisualization.tsx';

interface AdminLayoutProps {
  user: User;
  onNavigate: (tab: string, options?: { directToBatch?: boolean }) => void;
  state: AppState;
  correrias: Correria[];
  correriasLoading: boolean;
  correriasError: any;
}

interface NavButton {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ user, onNavigate, state, correrias, correriasLoading, correriasError }) => {
  const [selectedCorreria, setSelectedCorreria] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Set default correria on load
  useEffect(() => {
    if (correrias && correrias.length > 0 && !selectedCorreria) {
      setSelectedCorreria((correrias[0] as any).id);
    }
  }, [correrias, selectedCorreria]);

  // Handle correria errors
  useEffect(() => {
    if (correriasError) {
      setError('No se pudieron cargar las correrias. Por favor, intente nuevamente.');
    } else if (correrias && correrias.length === 0) {
      setError('No hay correrias disponibles en el sistema.');
    } else {
      setError(null);
    }
  }, [correriasError, correrias]);

  const navigationItems: NavButton[] = [
    {
      id: 'reception',
      label: 'Recepción de Lotes',
      icon: <Icons.Reception />,
      description: 'Recibir lotes'
    },
    {
      id: 'returnReception',
      label: 'Devolución de Mercancía',
      icon: <Icons.Dispatch />,
      description: 'Registrar devoluciones'
    },
    {
      id: 'dispatch',
      label: 'Despachos',
      icon: <Icons.Dispatch />,
      description: 'Despachar mercancía'
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: <Icons.Inventory />,
      description: 'Ver inventario'
    },
    {
      id: 'orders',
      label: 'Pedidos',
      icon: <Icons.Orders />,
      description: 'Gestionar pedidos'
    },
    {
      id: 'settle',
      label: 'Asentar Ventas',
      icon: <Icons.Settle />,
      description: 'Registrar ventas'
    },
    {
      id: 'salesReport',
      label: 'Informe de Ventas',
      icon: <Icons.Reports />,
      description: 'Ver reporte'
    },
    {
      id: 'orderHistory',
      label: 'Historial de Pedidos',
      icon: <Icons.History />,
      description: 'Consultar historial'
    },
    {
      id: 'dispatchControl',
      label: 'Control de Despachos',
      icon: <Icons.Inventory />,
      description: 'Controlar despachos'
    },
    {
      id: 'deliveryDates',
      label: 'Fechas de Entrega',
      icon: <Icons.Inventory />,
      description: 'Gestionar fechas'
    },
    {
      id: 'reports',
      label: 'Reportes Generales',
      icon: <Icons.Reports />,
      description: 'Ver reportes'
    },
    {
      id: 'masters',
      label: 'Maestros',
      icon: <Icons.Masters />,
      description: 'Gestionar datos'
    }
  ];

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 p-6 md:p-10">
      {/* Navigation Grid */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Dashboard Administrativo</h1>
        <p className="text-slate-500 text-sm md:text-base">Selecciona una opción para continuar</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'reception') {
                onNavigate(item.id, { directToBatch: true });
              } else {
                onNavigate(item.id);
              }
            }}
            className="group relative h-24 md:h-28 rounded-2xl bg-white border-2 border-slate-200 hover:border-pink-500 hover:shadow-lg transition-all duration-300 p-4 flex flex-col items-start justify-between overflow-hidden"
          >
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-start justify-between h-full w-full">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 group-hover:bg-pink-200 transition-colors">
                {item.icon}
              </div>
              
              <div className="text-left">
                <h3 className="font-bold text-slate-900 text-xs md:text-sm group-hover:text-pink-600 transition-colors leading-tight">
                  {item.label}
                </h3>
              </div>
            </div>

            {/* Arrow icon on hover */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-pink-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-900">{error}</p>
            </div>
          </div>
        )}

        {/* Correria Selector */}
        {!error && (
          <>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3">Seleccionar Correría para Análisis</h3>
              <CorreriaSelectorDropdown
                correrias={correrias || []}
                selectedCorreria={selectedCorreria}
                onSelect={setSelectedCorreria}
                loading={correriasLoading}
              />
            </div>

            {/* Metrics and Charts */}
            {selectedCorreria && (
              <>
                <MetricsDisplay
                  selectedCorreria={selectedCorreria}
                  state={state}
                  loading={correriasLoading}
                />

                <ChartsVisualization
                  selectedCorreria={selectedCorreria}
                  state={state}
                  loading={correriasLoading}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminLayout;
