
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Icons } from '../constants';
import api from '../services/api';
import { useAppState, useAppDispatch } from '../context/useAppContext';

// Views
import LoginView from './LoginView';
import HomeView from './HomeView';
import ReceptionView from './ReceptionView';
import ReturnReceptionView from './ReturnReceptionView';
import DispatchView from './DispatchView';
import InventoryView from './InventoryView';
import MastersView from './MastersView';
import ReportsView from './ReportsView';
import OrdersView from './OrdersView';
import OrderSettleView from './OrderSettleView';
import OrderHistoryView from './OrderHistoryView';
import SalesReportView from './SalesReportView';

const App: React.FC = () => {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setIsNavOpen(false);
    dispatch({ type: 'RESET_STATE' });
  };

  if (!user) {
    return (
      <LoginView 
        users={state.users} 
        onLogin={setUser} 
        onRegister={(u) => dispatch({ type: 'SET_USERS', payload: [...state.users, u] })} 
      />
    );
  }

  if (state.loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Cargando datos...</p>
        </div>
      </div>
    );
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsNavOpen(false);
    console.log('📍 Tab changed to:', tab);
    console.log('📊 Current state.clients:', state.clients);
    console.log('📊 Current state.clients.length:', state.clients?.length || 0);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView user={user} onNavigate={handleTabChange} />;
      case 'reception':
        console.log('🎯 Rendering ReceptionView with state.clients:', state.clients);
        console.log('🎯 state.clients.length:', state.clients?.length || 0);
        return (
          <ReceptionView 
            user={user} 
            receptions={state.receptions} 
            referencesMaster={state.references}
            confeccionistasMaster={state.confeccionistas}
            clientsMaster={state.clients}
            onAddReception={(reception) => api.createReception(reception).then(res => ({ success: res.success }))}
            ReturnReceptionComponent={ReturnReceptionView}
            state={state}
          />
        );
      case 'dispatch': {
        const handleAddDispatch = (dispatch_: any) => api.createDispatch(dispatch_);
        const handleUpdateDispatch = (id: string, dispatch_: any) => api.updateDispatch(id, dispatch_);
        const handleDeleteDispatch = (id: string) => api.deleteDispatch(id);
        
        return (
          <DispatchView 
            user={user} 
            clients={state.clients} 
            dispatches={state.dispatches} 
            referencesMaster={state.references}
            correrias={state.correrias}
            updateState={(updater) => {
              const newState = updater(state);
              if (newState.dispatches !== state.dispatches) {
                dispatch({ type: 'SET_DISPATCHES', payload: newState.dispatches });
              }
            }}
            onAddDispatch={handleAddDispatch}
            onUpdateDispatch={handleUpdateDispatch}
            onDeleteDispatch={handleDeleteDispatch}
          />
        );
      }
      case 'inventory':
        return <InventoryView receptions={state.receptions} dispatches={state.dispatches} />;
      case 'orders':
        return <OrdersView state={state} />;
      case 'settle':
        return <OrderSettleView state={state} user={user} />;
      case 'orderHistory':
        return <OrderHistoryView state={state} />;
      case 'masters':
        // Solo admin puede acceder a Maestros
        if (user.role !== UserRole.ADMIN) {
          setActiveTab('home');
          alert('No tienes permiso para acceder a esta sección');
          return <HomeView user={user} onNavigate={handleTabChange} />;
        }
        return (
          <MastersView 
            user={user} 
            state={state}
            updateState={(updater) => {
              const newState = updater(state);
              if (newState.correrias !== state.correrias) {
                dispatch({ type: 'SET_CORRERIAS', payload: newState.correrias });
              }
              if (newState.clients !== state.clients) {
                dispatch({ type: 'SET_CLIENTS', payload: newState.clients });
              }
              if (newState.references !== state.references) {
                dispatch({ type: 'SET_REFERENCES', payload: newState.references });
              }
              if (newState.sellers !== state.sellers) {
                dispatch({ type: 'SET_SELLERS', payload: newState.sellers });
              }
              if (newState.confeccionistas !== state.confeccionistas) {
                dispatch({ type: 'SET_CONFECCIONISTAS', payload: newState.confeccionistas });
              }
              if (newState.users !== state.users) {
                dispatch({ type: 'SET_USERS', payload: newState.users });
              }
            }}
            onAddReference={(ref) => api.createReference(ref).then(res => ({ success: res.success }))}
            onUpdateReference={(id, ref) => api.updateReference(id, ref).then(res => ({ success: res.success }))}
            onDeleteReference={(id) => api.deleteReference(id).then(res => ({ success: res.success }))}
            onAddClient={(client) => api.createClient(client).then(res => ({ success: res.success }))}
            onUpdateClient={(id, client) => api.updateClient(id, client).then(res => ({ success: res.success }))}
            onDeleteClient={(id) => api.deleteClient(id).then(res => ({ success: res.success }))}
            onAddConfeccionista={(conf) => api.createConfeccionista(conf).then(res => ({ success: res.success }))}
            onUpdateConfeccionista={(id, conf) => api.updateConfeccionista(id, conf).then(res => ({ success: res.success }))}
            onDeleteConfeccionista={(id) => api.deleteConfeccionista(id).then(res => ({ success: res.success }))}
            onAddUser={(user_) => api.createUser(user_.name, user_.loginCode, user_.pin, user_.role).then(res => ({ success: res.success }))}
            onUpdateUser={(id, user_) => api.updateUser(id, user_).then(res => ({ success: res.success }))}
            onDeleteUser={(id) => api.deleteUser(id).then(res => ({ success: res.success }))}
            onAddSeller={(seller) => api.createSeller(seller).then(res => ({ success: res.success }))}
            onUpdateSeller={(id, seller) => api.updateSeller(id, seller).then(res => ({ success: res.success }))}
            onDeleteSeller={(id) => api.deleteSeller(id).then(res => ({ success: res.success }))}
            onAddCorreria={(correria) => api.createCorreria(correria).then(res => ({ success: res.success }))}
            onUpdateCorreria={(id, correria) => api.updateCorreria(id, correria).then(res => ({ success: res.success }))}
            onDeleteCorreria={(id) => api.deleteCorreria(id).then(res => ({ success: res.success }))}
          />
        );
      case 'reports':
        return <ReportsView state={state} user={user} />;
      case 'salesReport':
        return <SalesReportView state={state} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden text-slate-700 bg-slate-50 flex flex-col">
      <header className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-40 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsNavOpen(true)}
            className="p-3 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all shadow-sm flex items-center justify-center"
            aria-label="Abrir Menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md">
              Plow
            </div>
            <div className="hidden sm:block">
              <h1 className="font-extrabold text-lg tracking-tighter leading-none">PLOW</h1>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">Ventas y Producción</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <p className="font-bold text-sm leading-none">{user.name}</p>
            <p className="text-[10px] text-slate-400 capitalize font-bold mt-1">{user.role}</p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm ${user.role === UserRole.ADMIN ? 'bg-pink-500' : 'bg-blue-500'}`}>
            {user.loginCode}
          </div>
        </div>
      </header>

      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsNavOpen(false)}
      >
        <div 
          className={`absolute top-0 left-0 h-full w-full max-w-[320px] bg-white shadow-2xl transition-transform duration-300 transform ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-35 h-10 bg-gradient-to-br from-blue-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-black text-lg">
                  Menú
                </div>
                <h1 className="font-black text-xl tracking-tighter"></h1>
             </div>
             <button onClick={() => setIsNavOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
             </button>
          </div>

          <div className="p-6 space-y-0.5 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
            <NavItem active={activeTab === 'home'} onClick={() => handleTabChange('home')} icon={<Icons.Home />} label="Inicio" />
            <div className="my-2 border-t border-slate-100 pt-2">
              <p className="px-6 text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Manejo de Inventario</p>
              <NavItem active={activeTab === 'reception'} onClick={() => handleTabChange('reception')} icon={<Icons.Reception />} label="Recepción" />
              <NavItem active={activeTab === 'dispatch'} onClick={() => handleTabChange('dispatch')} icon={<Icons.Dispatch />} label="Despachos" />
              <NavItem active={activeTab === 'inventory'} onClick={() => handleTabChange('inventory')} icon={<Icons.Inventory />} label="Inventario" />
            </div>
            <div className="my-2 border-t border-slate-100 pt-2">
              <p className="px-6 text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Comercial</p>
              <NavItem active={activeTab === 'orders'} onClick={() => handleTabChange('orders')} icon={<Icons.Orders />} label="Pedidos" />
              <NavItem active={activeTab === 'settle'} onClick={() => handleTabChange('settle')} icon={<Icons.Settle />} label="Asentar Ventas" />
              <NavItem active={activeTab === 'salesReport'} onClick={() => handleTabChange('salesReport')} icon={<Icons.Reports />} label="Informe de Ventas" />
              <NavItem active={activeTab === 'orderHistory'} onClick={() => handleTabChange('orderHistory')} icon={<Icons.History />} label="Historial Pedidos" />
            </div>
            <div className="my-2 border-t border-slate-100 pt-2">
              <p className="px-6 text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Reportes</p>
              <NavItem active={activeTab === 'reports'} onClick={() => handleTabChange('reports')} icon={<Icons.Reports />} label="Reportes Generales" />
              {user.role === UserRole.ADMIN && (
                <div className="border-t border-slate-100 mt-2 pt-2">
                  <NavItem active={activeTab === 'masters'} onClick={() => handleTabChange('masters')} icon={<Icons.Masters />} label="Maestros" />
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full p-8 border-t border-slate-100 bg-slate-50/50">
            <button onClick={handleLogout} className="w-full py-4 flex items-center justify-center gap-3 rounded-2xl bg-white border border-slate-200 text-slate-400 font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm">
              <Icons.Logout />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

        <main className="flex-1 relative overflow-hidden bg-slate-50">
          <div className={`h-full w-full overflow-y-auto custom-scrollbar ${activeTab === 'orders' ? 'p-2 md:p-3' : 'p-6 md:p-10'}`}>
            <div className="max-w-full mx-auto">
              {renderContent()}
            </div>
          </div>
        </main>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-2.5 rounded-[22px] transition-all group ${
      active 
        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-lg shadow-blue-200' 
        : 'text-slate-500 hover:bg-slate-100 hover:translate-x-1'
    }`}
  >
    <span className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`}>{icon}</span>
    <span className="text-[14px]">{label}</span>
  </button>
);

export default App;
