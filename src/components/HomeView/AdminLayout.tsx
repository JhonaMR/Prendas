import React, { useState, useEffect } from 'react';
import { User, UserRole, Correria, AppState } from '../../types';
import { Icons } from '../../constants';
import CorreriaSelectorDropdown from './CorreriaSelectorDropdown.tsx';
import MetricsDisplay from './MetricsDisplay.tsx';
import ChartsVisualization from './ChartsVisualization.tsx';
import ViewOrderModal from './ViewOrderModal.tsx';
import { useViewPreferences } from '../../hooks/useViewPreferences';
import { useDarkMode } from '../../context/DarkModeContext';

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

interface AdminLayoutProps {
  user: User;
  onNavigate: (tab: string, options?: { directToBatch?: boolean }) => void;
  onDirectNavigate?: (tab: string) => void;
  state: AppState;
  correrias: Correria[];
  correriasLoading: boolean;
  correriasError: any;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ user, onNavigate, onDirectNavigate, state, correrias, correriasLoading, correriasError }) => {
  const [selectedCorreria, setSelectedCorreria] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const { preferences, savePreferences, loading: preferencesLoading } = useViewPreferences();
  const { isDark } = useDarkMode();

  useEffect(() => {
    if (correriasError) {
      setError('No se pudieron cargar las correrias. Por favor, intente nuevamente.');
    } else if (correrias && correrias.length === 0) {
      setError('No hay correrias disponibles en el sistema.');
    } else {
      setError(null);
    }
  }, [correriasError, correrias]);

  // navigationItems se mantiene para compatibilidad con ViewOrderModal
  const navigationItems: NavButton[] = [
    { id: 'orders',              label: 'Pedidos',                icon: <Icons.Orders />,          description: 'Gestionar pedidos' },
    { id: 'settle',              label: 'Asentar Ventas',         icon: <Icons.Settle />,          description: 'Registrar ventas' },
    { id: 'orderHistory',        label: 'Historial de Pedidos',   icon: <Icons.History />,         description: 'Consultar historial' },
    { id: 'salesReport',         label: 'Informe de Ventas',      icon: <Icons.SalesReport />,     description: 'Ver reporte' },
    { id: 'comparativeDashboard',label: 'Dashboard Comparativo',  icon: <Icons.Dashboard />,       description: 'Análisis comparativo' },
    { id: 'dispatchControl',     label: 'Control de Despachos',   icon: <Icons.DispatchControl />, description: 'Control de despachos' },
    { id: 'reports',             label: 'Reportes Generales',     icon: <Icons.Reports />,         description: 'Ver reportes' },
    { id: 'fichas-costo',        label: 'Fichas de Costo',        icon: <Icons.FichasCosto />,     description: 'Precios y costos' },
    { id: 'fichas-diseno',       label: 'Fichas de Diseño',       icon: <Icons.FichasDiseno />,    description: 'Gestionar fichas' },
    { id: 'control-telas',       label: 'Control de Telas',       icon: <Icons.ControlTelas />,    description: 'Control de telas' },
    { id: 'productoEnProceso',   label: 'Producto en Proceso',    icon: <Icons.ProductoEnProceso />, description: 'Control de lotes en confección' },
    { id: 'deliveryDates',       label: 'Fechas de Entrega',      icon: <Icons.DeliveryDates />,   description: 'Gestionar fechas' },
    { id: 'calculoPagoLotes',    label: 'Calculo, pago de lotes', icon: <Icons.CalculoPago />,     description: 'Calcular y pagar lotes' },
    { id: 'programacionPagos',   label: 'Programación de Pagos',  icon: <Icons.ProgramacionPagos />, description: 'Programar pagos' },
    { id: 'maletas',             label: 'Maletas',                icon: <Icons.Maletas />,         description: 'Gestionar maletas' },
    { id: 'reception',           label: 'Recepción de Lotes',     icon: <Icons.Reception />,       description: 'Recibir lotes' },
    { id: 'dispatch',            label: 'Despachos',              icon: <Icons.Dispatch />,        description: 'Despachar mercancía' },
    { id: 'salidasBodega',       label: 'Salidas de Bodega',      icon: <Icons.SalidasBodega />,   description: 'Gestionar salidas de bodega' },
    { id: 'returnReception',     label: 'Devolución de Mercancía',icon: <Icons.ReturnReception />, description: 'Registrar devoluciones' },
    { id: 'compras',             label: 'Compras',                icon: <Icons.Orders />,          description: 'Registrar compras' },
    { id: 'inventory',              label: 'Inventario',                icon: <Icons.Inventory />,         description: 'Ver inventario' },
    { id: 'masters',               label: 'Maestros',                  icon: <Icons.Masters />,           description: 'Gestionar datos' },
    { id: 'backups',               label: 'Backups',                   icon: <Icons.Backup />,            description: 'Gestionar backups' },
    { id: 'corte',                 label: 'Corte',                     icon: <Icons.Scissors />,          description: 'Módulo de corte' },
    { id: 'controlTransporte',     label: 'Control de Transporte',     icon: <Icons.Transporte />,        description: 'Control de transporte' },
    { id: 'liquidacionTransporte', label: 'Liquidación de Transporte', icon: <Icons.Transporte />,        description: 'Liquidación de transporte' },
    { id: 'historicoReferencia',   label: 'Histórico de Referencia',   icon: <Icons.History />,           description: 'Consultar historial de referencias' },
  ];

  const navGroups: NavGroup[] = [
    {
      id: 'comercial',
      label: 'Comercial',
      icon: <Icons.Orders />,
      items: [
        { id: 'orders',            label: 'Pedidos',                icon: <Icons.Orders />,       description: 'Gestionar pedidos' },
        { id: 'settle',            label: 'Asentar Ventas',         icon: <Icons.Settle />,       description: 'Registrar ventas' },
        { id: 'orderHistory',      label: 'Historial de Pedidos',   icon: <Icons.History />,      description: 'Consultar historial' },
        { id: 'listaPrecios',      label: 'Generar Lista de Precios', icon: <Icons.ListaPrecios />, description: 'Generar lista de precios' },
      ],
    },
    {
      id: 'informes',
      label: 'Informes',
      icon: <Icons.Dashboard />,
      items: [
        { id: 'salesReport',          label: 'Informe de Ventas',     icon: <Icons.SalesReport />,     description: 'Ver reporte' },
        { id: 'comparativeDashboard', label: 'Dashboard Comparativo', icon: <Icons.Dashboard />,       description: 'Análisis comparativo' },
        { id: 'dispatchControl',      label: 'Control de Despachos',  icon: <Icons.DispatchControl />, description: 'Control de despachos' },
        { id: 'reports',              label: 'Reportes Generales',    icon: <Icons.Reports />,         description: 'Ver reportes' },
      ],
    },
    {
      id: 'fichas',
      label: 'Fichas',
      icon: <Icons.FichasCosto />,
      items: [
        { id: 'fichas-costo',    label: 'Fichas de Costo',   icon: <Icons.FichasCosto />,  description: 'Precios y costos' },
        { id: 'fichas-diseno',   label: 'Fichas de Diseño',  icon: <Icons.FichasDiseno />, description: 'Gestionar fichas' },
        ...(user.role === UserRole.ADMIN || user.role === UserRole.SOPORTE ? [{ id: 'control-telas', label: 'Control de Telas', icon: <Icons.ControlTelas />, description: 'Control de telas' }] : []),
      ],
    },
    {
      id: 'produccion',
      label: 'Producción',
      icon: <Icons.DeliveryDates />,
      items: [
        { id: 'productoEnProceso',    label: 'Producto en Proceso',    icon: <Icons.ProductoEnProceso />,  description: 'Control de lotes en confección' },
        { id: 'deliveryDates',        label: 'Fechas de Entrega',      icon: <Icons.DeliveryDates />,      description: 'Gestionar fechas' },
        { id: 'maletas',              label: 'Maletas',                icon: <Icons.Maletas />,            description: 'Gestionar maletas' },
        { id: 'compras',              label: 'Compras',                icon: <Icons.Orders />,             description: 'Registrar compras' },
        { id: 'controlTransporte',    label: 'Control de Transporte',  icon: <Icons.Transporte />,         description: 'Control de transporte' },
      ],
    },
    {
      id: 'tesoreria',
      label: 'Tesorería',
      icon: <Icons.Tesoreria />,
      items: [
        { id: 'calculoPagoLotes',      label: 'Calculo, pago de lotes',     icon: <Icons.CalculoPago />,        description: 'Calcular y pagar lotes' },
        { id: 'programacionPagos',     label: 'Programación de Pagos',      icon: <Icons.ProgramacionPagos />,  description: 'Programar pagos' },
        { id: 'liquidacionTransporte', label: 'Liquidación de Transporte',  icon: <Icons.Transporte />,        description: 'Liquidación de transporte' },
      ],
    },
    {
      id: 'inventario',
      label: 'Inventario',
      icon: <Icons.ProductoEnProceso />,
      items: [
        { id: 'reception',      label: 'Recepción de Lotes',      icon: <Icons.Reception />, description: 'Recibir lotes' },
        { id: 'dispatch',       label: 'Despachos',               icon: <Icons.Dispatch />,  description: 'Despachar mercancía' },
        { id: 'salidasBodega',  label: 'Salidas de Bodega',       icon: <Icons.SalidasBodega />, description: 'Gestionar salidas de bodega' },
        { id: 'returnReception',label: 'Devolución de Mercancía', icon: <Icons.ReturnReception />, description: 'Registrar devoluciones' },
        { id: 'inventory',      label: 'Inventario',              icon: <Icons.Inventory />, description: 'Ver inventario' },
      ],
    },
    {
      id: 'corte',
      label: 'Corte',
      icon: <Icons.Scissors />,
      items: [
        { id: 'corte', label: 'Corte', icon: <Icons.Scissors />, description: 'Módulo de corte' },
      ],
    },
    {
      id: 'herramientas',
      label: 'Herramientas',
      icon: <Icons.Edit />,
      items: [
        { id: 'cuentasCobro', label: 'Cuentas de Cobro', icon: <Icons.Edit />, description: 'Gestionar cuentas de cobro' },
        { id: 'historicoReferencia', label: 'Histórico de Referencia', icon: <Icons.History />, description: 'Consultar historial de referencias' },
      ],
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: <Icons.Masters />,
      items: [
        { id: 'masters', label: 'Maestros', icon: <Icons.Masters />, description: 'Gestionar datos' },
        { id: 'backups', label: 'Backups',  icon: <Icons.Backup />,  description: 'Gestionar backups' },
      ],
    },
  ];

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
            className={`h-10 w-10 rounded-xl border-2 flex items-center justify-center transition-all flex-shrink-0 ${
              isDark
                ? 'bg-violet-900/40 border-violet-700 text-violet-500 hover:border-pink-600 hover:text-pink-400'
                : 'bg-white border-slate-200 text-slate-500 hover:border-pink-400 hover:text-pink-600'
            }`}
            aria-label="Volver"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
        )}
        <div>
          <h1 className={`text-3xl md:text-4xl font-black mb-1 ${
            isDark ? 'text-violet-50' : 'text-slate-900'
          }`}>
            {currentGroup ? currentGroup.label : `Bienvenido, ${user.name}`}
          </h1>
          <p className={`text-sm md:text-base ${
            isDark ? 'text-violet-200' : 'text-slate-500'
          }`}>
            {currentGroup ? 'Selecciona una opción' : 'Selecciona un grupo para continuar'}
          </p>
        </div>
      </div>

      {/* Grid: grupos o ítems del grupo activo */}
      {!currentGroup ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mb-8" style={{ gridAutoRows: '8rem' }}>
          {navGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => setActiveGroup(group.id)}
              className={`group relative h-full rounded-2xl border-2 transition-all duration-300 p-4 flex flex-col items-start justify-between overflow-hidden ${
                isDark
                  ? 'bg-[#4a3a63] border-violet-700 hover:border-pink-600 hover:shadow-lg'
                  : 'bg-white border-slate-200 hover:border-pink-500 hover:shadow-lg'
              }`}
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                isDark
                  ? 'bg-gradient-to-br from-pink-900/20 to-transparent'
                  : 'bg-gradient-to-br from-pink-50 to-transparent'
              }`} />
              {/* Línea vertical central */}
              <div className={`absolute inset-y-3 left-1/2 -translate-x-1/2 w-px ${
                isDark ? 'bg-violet-600' : 'bg-slate-200'
              }`} />
              <div className="relative z-10 flex h-full w-full gap-3">
                {/* Mitad izquierda: icono y nombre */}
                <div className="w-1/2 flex flex-col items-start justify-between pr-3">
                  <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-colors ${
                    isDark
                      ? 'bg-pink-900/40 text-pink-400 group-hover:bg-pink-900/60'
                      : 'bg-pink-100 text-pink-600 group-hover:bg-pink-200'
                  }`}>
                    {group.icon}
                  </div>
                  <h3 className={`font-bold text-sm md:text-base group-hover:text-pink-600 transition-colors leading-tight ${
                    isDark ? 'text-violet-50' : 'text-slate-900'
                  }`}>
                    {group.label}
                  </h3>
                </div>
                {/* Mitad derecha: lista de ítems */}
                <div className="w-1/2 flex flex-col justify-start gap-1 pl-3 pt-1">
                  {group.items.map(item => (
                    <div key={item.id} className="flex items-center gap-1.5">
                      <span className={`w-1 h-1 rounded-full flex-shrink-0 ${
                        isDark ? 'bg-violet-600' : 'bg-slate-300'
                      }`} />
                      <span className={`text-xs leading-tight truncate ${
                        isDark ? 'text-violet-200' : 'text-slate-400'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-4 h-4 ${
                  isDark ? 'text-pink-500' : 'text-pink-500'
                }`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-8" style={{ gridAutoRows: '7rem' }}>
          {currentGroup.items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`group relative h-full rounded-2xl border-2 transition-all duration-300 p-4 flex flex-col items-start justify-between overflow-hidden ${
                isDark
                  ? 'bg-[#4a3a63] border-violet-700 hover:border-pink-600 hover:shadow-lg'
                  : 'bg-white border-slate-200 hover:border-pink-500 hover:shadow-lg'
              }`}
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                isDark
                  ? 'bg-gradient-to-br from-pink-900/20 to-transparent'
                  : 'bg-gradient-to-br from-pink-50 to-transparent'
              }`} />
              <div className="relative z-10 flex flex-col items-start justify-between h-full w-full">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isDark
                    ? 'bg-pink-900/40 text-pink-400 group-hover:bg-pink-900/60'
                    : 'bg-pink-100 text-pink-600 group-hover:bg-pink-200'
                }`}>
                  {item.icon}
                </div>
                <div className="text-left">
                  <h3 className={`font-bold text-xs md:text-sm group-hover:text-pink-600 transition-colors leading-tight ${
                    isDark ? 'text-violet-50' : 'text-slate-900'
                  }`}>
                    {item.label}
                  </h3>
                </div>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-4 h-4 ${
                  isDark ? 'text-pink-500' : 'text-pink-600'
                }`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Analytics Section — solo visible en la vista de grupos */}
      {!currentGroup && (
        <div className="flex-1 flex flex-col gap-6">
          {error && (
            <div className={`border rounded-2xl p-4 flex items-start gap-3 ${
              isDark
                ? 'bg-red-900/30 border-red-700'
                : 'bg-red-50 border-red-200'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                isDark ? 'text-red-400' : 'text-red-600'
              }`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className={`text-sm font-semibold ${
                isDark ? 'text-red-300' : 'text-red-900'
              }`}>{error}</p>
            </div>
          )}

          {!error && (
            <>
              <div className={`rounded-3xl shadow-sm border p-6 ${
                isDark
                  ? 'bg-[#4a3a63] border-violet-700'
                  : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-sm font-bold uppercase tracking-wide ${
                    isDark ? 'text-violet-200' : 'text-slate-500'
                  }`}>Análisis rápido de correrías</h3>
                  {selectedCorreria && (
                    <button
                      onClick={() => setSelectedCorreria(null)}
                      className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                        isDark
                          ? 'bg-violet-900/40 hover:bg-violet-900/60'
                          : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                      aria-label="Limpiar selección"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={`w-3.5 h-3.5 ${
                        isDark ? 'text-violet-500' : 'text-slate-500'
                      }`}>
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
                <CorreriaSelectorDropdown
                  correrias={correrias || []}
                  selectedCorreria={selectedCorreria}
                  onSelect={setSelectedCorreria}
                  loading={correriasLoading}
                />
              </div>

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
      )}

      {/* TODO: ViewOrderModal oculto temporalmente mientras se define el sistema de grupos */}
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
