import React, { useState, useEffect } from 'react';
import { User, Correria, AppState } from '../../types';
import { Icons } from '../../constants';
import CorreriaSelectorDropdown from './CorreriaSelectorDropdown.tsx';
import MetricsDisplay from './MetricsDisplay.tsx';
import ChartsVisualization from './ChartsVisualization.tsx';
import ViewOrderModal from './ViewOrderModal.tsx';
import { useViewPreferences } from '../../hooks/useViewPreferences';

interface AdminLayoutProps {
  user: User;
  onNavigate: (tab: string, options?: { directToBatch?: boolean }) => void;
  onDirectNavigate?: (tab: string) => void;
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

const AdminLayout: React.FC<AdminLayoutProps> = ({ user, onNavigate, onDirectNavigate, state, correrias, correriasLoading, correriasError }) => {
  const [selectedCorreria, setSelectedCorreria] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { preferences, savePreferences, loading: preferencesLoading } = useViewPreferences();

  // Set default correria on load
  useEffect(() => {
    if (correrias && correrias.length > 0 && !selectedCorreria) {
      setSelectedCorreria(null);
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
      id: 'fichas-diseno',
      label: 'Fichas de Diseño',
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" /></svg>,
      description: 'Gestionar fichas'
    },
    {
      id: 'fichas-costo',
      label: 'Fichas de Costo',
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>,
      description: 'Precios y costos'
    },
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
      id: 'maletas',
      label: 'Maletas',
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>,
      description: 'Gestionar maletas'
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
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>,
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
    },
    {
      id: 'compras',
      label: 'Compras',
      icon: <Icons.Orders />,
      description: 'Registrar compras'
    },
    {
      id: 'comparativeDashboard',
      label: 'Dashboard Comparativo',
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 6.75c0-.621.504-1.125 1.125-1.125h2.25C13.496 5.625 14 6.129 14 6.75v13.5c0 .621-.504 1.125-1.125 1.125h-2.25c-.621 0-1.125-.504-1.125-1.125V6.75zm6-6c-.621 0-1.125.504-1.125 1.125v19.5c0 .621.504 1.125 1.125 1.125h2.25c.621 0 1.125-.504 1.125-1.125V1.875c0-.621-.504-1.125-1.125-1.125h-2.25z" /></svg>,
      description: 'Análisis comparativo'
    }
  ];

  return (
    <div className="h-full w-full flex flex-col bg-transparent p-6 md:p-10">
      {/* Navigation Grid */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Bienvenido, {user.name}</h1>
          <p className="text-slate-500 text-sm md:text-base">Selecciona una opción para continuar</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative h-12 md:h-14 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-semibold px-4 md:px-6 flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.592c.55 0 1.02.398 1.11.94m-9.642 0A9.001 9.001 0 005.422 20.25H18.578a9.001 9.001 0 007.128-16.06m-9.642 0A9 9 0 0012 3.75c-4.457 0-8.268 3.106-9.012 7.25m0 0H.5a9 9 0 0018 0h-.5z" />
          </svg>
          <span className="hidden sm:inline">Personalizar</span>
        </button>
      </div>

      {/* Reordered Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {navigationItems
          .sort((a, b) => {
            const aIndex = preferences.viewOrder.indexOf(a.id);
            const bIndex = preferences.viewOrder.indexOf(b.id);
            // Si la vista no está en el orden guardado, ponerla al final
            const aPos = aIndex === -1 ? navigationItems.length + navigationItems.indexOf(a) : aIndex;
            const bPos = bIndex === -1 ? navigationItems.length + navigationItems.indexOf(b) : bIndex;
            return aPos - bPos;
          })
          .map((item) => (
            <button
              key={item.id}
              onClick={() => {
                // Para Recepción de Lotes desde HomeView, ir directamente al listado
                if (item.id === 'reception' && onDirectNavigate) {
                  onDirectNavigate('reception');
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

      {/* View Order Modal */}
      <ViewOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={savePreferences}
        availableViews={navigationItems}
        currentOrder={preferences.viewOrder}
        colorScheme="pink"
        loading={preferencesLoading}
      />
    </div>
  );
};

export default AdminLayout;
