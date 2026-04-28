import React, { useState } from 'react';
import { User } from '../../types';
import { Icons } from '../../constants';

interface NavButton {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

interface NavGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: NavButton[];
}

interface OperadorLayoutProps {
  user: User;
  onNavigate: (tab: string) => void;
  onDirectNavigate?: (tab: string) => void;
}

const navGroups: NavGroup[] = [
  {
    id: 'fichas',
    label: 'Fichas',
    icon: <Icons.FichasCosto />,
    items: [
      { id: 'fichas-costo',  label: 'Fichas de Costo',  icon: <Icons.FichasCosto />,  description: 'Precios y costos' },
      { id: 'fichas-diseno', label: 'Fichas de Diseño', icon: <Icons.FichasDiseno />, description: 'Gestionar fichas' },
      { id: 'control-telas', label: 'Control de Telas', icon: <Icons.FichasCosto />,  description: 'Control de telas' },
    ],
  },
  {
    id: 'produccion',
    label: 'Producción',
    icon: <Icons.DeliveryDates />,
    items: [
      { id: 'productoEnProceso', label: 'Producto en Proceso', icon: <Icons.ProductoEnProceso />, description: 'Control de lotes en confección' },
      { id: 'deliveryDates',     label: 'Fechas de Entrega',   icon: <Icons.DeliveryDates />,     description: 'Gestionar fechas' },
      { id: 'maletas',           label: 'Maletas',             icon: <Icons.Maletas />,           description: 'Gestionar maletas' },
      { id: 'compras',           label: 'Compras',             icon: <Icons.Orders />,            description: 'Registrar compras' },
    ],
  },
  {
    id: 'comercial',
    label: 'Comercial',
    icon: <Icons.Orders />,
    items: [
      { id: 'orders',          label: 'Pedidos',              icon: <Icons.Orders />,          description: 'Gestionar pedidos' },
      { id: 'settle',          label: 'Asentar Ventas',       icon: <Icons.Settle />,          description: 'Registrar ventas' },
      { id: 'orderHistory',    label: 'Historial de Pedidos', icon: <Icons.History />,         description: 'Consultar historial' },
      { id: 'dispatchControl', label: 'Control de Despachos', icon: <Icons.DispatchControl />, description: 'Control de despachos' },
    ],
  },
  {
    id: 'inventario',
    label: 'Inventario',
    icon: <Icons.Inventory />,
    items: [
      { id: 'reception',       label: 'Recepción de Lotes',      icon: <Icons.Reception />,       description: 'Recibir lotes' },
      { id: 'dispatch',        label: 'Despachos',               icon: <Icons.Dispatch />,        description: 'Despachar mercancía' },
      { id: 'returnReception', label: 'Devolución de Mercancía', icon: <Icons.ReturnReception />, description: 'Registrar devoluciones' },
      { id: 'inventory',       label: 'Inventario',              icon: <Icons.Inventory />,       description: 'Ver inventario' },
      { id: 'salidasBodega',   label: 'Salidas de Bodega',       icon: <Icons.Dispatch />,        description: 'Registrar salidas de bodega' },
    ],
  },
  {
    id: 'transporte',
    label: 'Transporte',
    icon: <Icons.Transporte />,
    items: [
      { id: 'controlTransporte',     label: 'Control de Transporte',     icon: <Icons.Transporte />, description: 'Control de transporte' },
      { id: 'liquidacionTransporte', label: 'Liquidación de Transporte', icon: <Icons.Transporte />, description: 'Liquidación de transporte' },
    ],
  },
  {
    id: 'tesoreria',
    label: 'Tesorería',
    icon: <Icons.Tesoreria />,
    items: [
      { id: 'programacionPagos', label: 'Programación de Pagos', icon: <Icons.ProgramacionPagos />, description: 'Programar pagos' },
    ],
  },
];

const OperadorLayout: React.FC<OperadorLayoutProps> = ({ user, onNavigate, onDirectNavigate }) => {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const currentGroup = activeGroup ? navGroups.find(g => g.id === activeGroup) : null;

  const handleItemClick = (id: string) => {
    if (id === 'reception' && onDirectNavigate) {
      onDirectNavigate('reception');
    } else {
      onNavigate(id);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-transparent p-6 md:p-10">

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        {currentGroup && (
          <button
            onClick={() => setActiveGroup(null)}
            className="h-10 w-10 rounded-xl bg-white border-2 border-slate-200 hover:border-teal-400 flex items-center justify-center text-slate-500 hover:text-teal-600 transition-all flex-shrink-0"
            aria-label="Volver"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
        )}
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-1">
            {currentGroup ? currentGroup.label : `Bienvenido, ${user.name}`}
          </h1>
          <p className="text-slate-500 text-sm md:text-base">
            {currentGroup ? 'Selecciona una opción' : 'Selecciona un grupo para continuar'}
          </p>
        </div>
      </div>

      {/* Grid: grupos o ítems del grupo activo */}
      {!currentGroup ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4" style={{ gridAutoRows: '8rem' }}>
          {navGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => setActiveGroup(group.id)}
              className="group relative h-full rounded-2xl bg-white border-2 border-slate-200 hover:border-teal-500 hover:shadow-lg transition-all duration-300 p-4 flex flex-col items-start justify-between overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-y-3 left-1/2 -translate-x-1/2 w-px bg-slate-200" />
              <div className="relative z-10 flex h-full w-full gap-3">
                <div className="w-1/2 flex flex-col items-start justify-between pr-3">
                  <div className="w-9 h-9 md:w-11 md:h-11 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 group-hover:bg-teal-200 transition-colors">
                    {group.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm md:text-base group-hover:text-teal-600 transition-colors leading-tight">
                    {group.label}
                  </h3>
                </div>
                <div className="w-1/2 flex flex-col justify-start gap-1 pl-3 pt-1">
                  {group.items.map(item => (
                    <div key={item.id} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />
                      <span className="text-xs text-slate-400 leading-tight truncate">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-teal-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4" style={{ gridAutoRows: '7rem' }}>
          {currentGroup.items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className="group relative h-full rounded-2xl bg-white border-2 border-slate-200 hover:border-teal-500 hover:shadow-lg transition-all duration-300 p-4 flex flex-col items-start justify-between overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex flex-col items-start justify-between h-full w-full">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 group-hover:bg-teal-200 transition-colors">
                  {item.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-900 text-xs md:text-sm group-hover:text-teal-600 transition-colors leading-tight">
                    {item.label}
                  </h3>
                </div>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-teal-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OperadorLayout;
