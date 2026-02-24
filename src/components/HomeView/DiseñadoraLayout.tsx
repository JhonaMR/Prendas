import React, { useState } from 'react';
import { User } from '../../types';
import { Icons } from '../../constants';
import ViewOrderModal from './ViewOrderModal.tsx';
import { useViewPreferences } from '../../hooks/useViewPreferences';

interface DiseñadoraLayoutProps {
  user: User;
  onNavigate: (tab: string) => void;
}

interface NavButton {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

const DiseñadoraLayout: React.FC<DiseñadoraLayoutProps> = ({ user, onNavigate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { preferences, savePreferences, loading: preferencesLoading } = useViewPreferences();
  // Diseñadora tiene acceso a todo excepto:
  // - Informe de Ventas
  // - Reportes Generales
  // - Despachos
  // - Recepciones
  // - Devoluciones
  // - Asentar Pedidos
  // - Historial de Pedidos
  // - Control de Despachos
  // - Maestros
  const navigationItems: NavButton[] = [
    {
      id: 'fichas-diseno',
      label: 'Fichas de Diseño',
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128A2.25 2.25 0 002.25 18h15.75a2.25 2.25 0 002.247-2.16c.969-2.904-.946-5.514-3.979-5.514-.21 0-.414.014-.614.042a3 3 0 00-5.738-1.128M9.5 16.25v-1.002M15 16.25v-1.002" /></svg>,
      description: 'Crear y editar fichas de diseño'
    },
    {
      id: 'fichas-costo',
      label: 'Fichas de Costo',
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0l.879-.659m-3.172-2.819a3 3 0 112.4 0m-5.007-7.003h0a3 3 0 016 0h0m-6 8.5h0a3 3 0 016 0h0" /></svg>,
      description: 'Gestionar precios y costos'
    },
    {
      id: 'maletas',
      label: 'Maletas',
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.5v2.25m3-6v6m3-6v2.25m-13.5-3h2.25a2.25 2.25 0 012.25 2.25v.894a2.25 2.25 0 01-2.25 2.25H5.25a2.25 2.25 0 01-2.25-2.25V8.25a2.25 2.25 0 012.25-2.25z" /></svg>,
      description: 'Gestionar maletas'
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: <Icons.Inventory />,
      description: 'Ver estado del inventario'
    },
    {
      id: 'orders',
      label: 'Pedidos',
      icon: <Icons.Orders />,
      description: 'Gestionar pedidos de clientes'
    },
    {
      id: 'deliveryDates',
      label: 'Fechas de Entrega',
      icon: <Icons.Inventory />,
      description: 'Gestionar fechas de entrega'
    }
  ];

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 p-6 md:p-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Bienvenido, {user.name}</h1>
          <p className="text-slate-500 text-sm md:text-base">Selecciona una opción para continuar</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative h-12 md:h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold px-4 md:px-6 flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.592c.55 0 1.02.398 1.11.94m-9.642 0A9.001 9.001 0 005.422 20.25H18.578a9.001 9.001 0 007.128-16.06m-9.642 0A9 9 0 0012 3.75c-4.457 0-8.268 3.106-9.012 7.25m0 0H.5a9 9 0 0018 0h-.5z" />
          </svg>
          <span className="hidden sm:inline">Personalizar</span>
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-max content-start">
        {navigationItems
          .sort((a, b) => {
            const aIndex = preferences.viewOrder.indexOf(a.id);
            const bIndex = preferences.viewOrder.indexOf(b.id);
            const aPos = aIndex === -1 ? navigationItems.indexOf(a) : aIndex;
            const bPos = bIndex === -1 ? navigationItems.indexOf(b) : bIndex;
            return aPos - bPos;
          })
          .map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="group relative h-32 md:h-40 rounded-3xl bg-white border-2 border-slate-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 p-6 flex flex-col items-start justify-between overflow-hidden"
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="relative z-10 flex flex-col items-start justify-between h-full w-full">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 group-hover:bg-green-200 transition-colors">
                  {item.icon}
                </div>
                
                <div className="text-left">
                  <h3 className="font-bold text-slate-900 text-sm md:text-base group-hover:text-green-600 transition-colors">
                    {item.label}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-slate-400 mt-1 group-hover:text-slate-500 transition-colors">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Arrow icon on hover */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </button>
          ))}
      </div>

      {/* View Order Modal */}
      <ViewOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={savePreferences}
        availableViews={navigationItems}
        currentOrder={preferences.viewOrder}
        colorScheme="green"
        loading={preferencesLoading}
      />
    </div>
  );
};

export default DiseñadoraLayout;
