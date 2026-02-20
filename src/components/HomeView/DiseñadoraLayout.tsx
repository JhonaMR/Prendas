import React from 'react';
import { User } from '../../types';
import { Icons } from '../../constants';

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
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Bienvenido, {user.name}</h1>
        <p className="text-slate-500 text-sm md:text-base">Selecciona una opción para continuar</p>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-max content-start">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="group relative h-32 md:h-40 rounded-3xl bg-white border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 p-6 flex flex-col items-start justify-between overflow-hidden"
          >
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-start justify-between h-full w-full">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
                {item.icon}
              </div>
              
              <div className="text-left">
                <h3 className="font-bold text-slate-900 text-sm md:text-base group-hover:text-blue-600 transition-colors">
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
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DiseñadoraLayout;
