import React, { useState, useEffect } from 'react';
import { AppState, User, UserRole } from './types';
import { api } from './services/api';
import { Icons } from './constants';

// Views
import LoginView from './views/LoginView';
import ReceptionView from './views/ReceptionView';
import DispatchView from './views/DispatchView';
import InventoryView from './views/InventoryView';
import MastersView from './views/MastersView';
import ReportsView from './views/ReportsView';
import OrdersView from './views/OrdersView';
import OrderSettleView from './views/OrderSettleView';
import OrderHistoryView from './views/OrderHistoryView';
import DispatchControlView from './views/DispatchControlView';

const App: React.FC = () => {
  // ========== ESTADOS ==========
  
  const [state, setState] = useState<AppState>({
    users: [],
    references: [],
    clients: [],
    confeccionistas: [],
    sellers: [],
    correrias: [],
    receptions: [],
    dispatches: [],
    orders: [],
    productionTracking: []
  });

  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('reception');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedOrderChanges, setHasUnsavedOrderChanges] = useState(false);

  // ========== CARGAR DATOS DEL BACKEND ==========
  
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      console.log('🔄 Cargando datos del backend...');
      
      try {
        const [
          usersData,
          referencesData,
          clientsData,
          confeccionistasData,
          sellersData,
          correriasData,
          receptionsData,
          dispatchesData,
          ordersData,
          productionData
        ] = await Promise.all([
          api.listUsers(),
          api.getReferences(),
          api.getClients(),
          api.getConfeccionistas(),
          api.getSellers(),
          api.getCorrerias(),
          api.getReceptions(),
          api.getDispatches(),
          api.getOrders(),
          api.getProductionTracking()
        ]);

        setState({
          users: usersData,
          references: referencesData,
          clients: clientsData,
          confeccionistas: confeccionistasData,
          sellers: sellersData,
          correrias: correriasData,
          receptions: receptionsData,
          dispatches: dispatchesData,
          orders: ordersData,
          productionTracking: productionData
        });

        console.log('✅ Datos cargados del backend exitosamente');
        console.log('📊 Referencias:', referencesData.length);
        console.log('👥 Clientes:', clientsData.length);

      } catch (error) {
        console.error('❌ Error cargando datos del backend:', error);
        alert('Error al cargar datos del servidor. Por favor, recarga la página.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // ========== FUNCIONES GENERALES ==========

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setIsNavOpen(false);
    setState({
      users: [],
      references: [],
      clients: [],
      confeccionistas: [],
      sellers: [],
      correrias: [],
      receptions: [],
      dispatches: [],
      orders: [],
      productionTracking: []
    });
  };

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState(prev => updater(prev));
  };

  const handleTabChange = (tab: string) => {
    // Si estamos en la vista de pedidos y hay cambios sin guardar
    if (activeTab === 'orders' && hasUnsavedOrderChanges) {
      const confirmLeave = window.confirm(
        '⚠️ Tienes cambios sin guardar en Pedidos.\n\n¿Estás seguro de que quieres salir sin guardar?\n\nLos cambios se perderán.'
      );
      
      if (!confirmLeave) {
        // Si el usuario cancela, no cambiar de vista
        return;
      }
      
      // Si confirma, resetear el estado de cambios
      setHasUnsavedOrderChanges(false);
    }
    
    setActiveTab(tab);
    setIsNavOpen(false);
  };

  // ========== FUNCIONES CRUD (Crear/Actualizar/Eliminar) ==========

  /**
   * REFERENCIAS
   */
  const addReference = async (ref: any) => {
    try {
      const response = await api.createReference(ref);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          references: [...prev.references, response.data]
        }));
        console.log('✅ Referencia creada');
        return { success: true };
      } else {
        alert(response.message || 'Error al crear referencia');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('❌ Error creando referencia:', error);
      alert('Error de conexión con el servidor');
      return { success: false, message: 'Error de conexión' };
    }
  };

  const updateReference = async (id: string, ref: any) => {
    try {
      const response = await api.updateReference(id, ref);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          references: prev.references.map(r => r.id === id ? response.data : r)
        }));
        console.log('✅ Referencia actualizada');
        return { success: true };
      } else {
        alert(response.message || 'Error al actualizar referencia');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error actualizando referencia:', error);
      alert('Error de conexión con el servidor');
      return { success: false };
    }
  };

  const deleteReference = async (id: string) => {
    try {
      const response = await api.deleteReference(id);

      if (response.success) {
        setState(prev => ({
          ...prev,
          references: prev.references.filter(r => r.id !== id)
        }));
        console.log('✅ Referencia eliminada');
        return { success: true };
      } else {
        alert(response.message || 'Error al eliminar referencia');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error eliminando referencia:', error);
      alert('Error de conexión con el servidor');
      return { success: false };
    }
  };

  /**
   * CLIENTES
   */
  const addClient = async (client: any) => {
    try {
      const response = await api.createClient(client);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          clients: [...prev.clients, response.data]
        }));
        console.log('✅ Cliente creado');
        return { success: true };
      } else {
        alert(response.message || 'Error al crear cliente');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error creando cliente:', error);
      alert('Error de conexión con el servidor');
      return { success: false };
    }
  };

  const updateClient = async (id: string, client: any) => {
    try {
      const response = await api.updateClient(id, client);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          clients: prev.clients.map(c => c.id === id ? response.data : c)
        }));
        console.log('✅ Cliente actualizado');
        return { success: true };
      } else {
        alert(response.message || 'Error al actualizar cliente');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error actualizando cliente:', error);
      alert('Error de conexión con el servidor');
      return { success: false };
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const response = await api.deleteClient(id);

      if (response.success) {
        setState(prev => ({
          ...prev,
          clients: prev.clients.filter(c => c.id !== id)
        }));
        console.log('✅ Cliente eliminado');
        return { success: true };
      } else {
        alert(response.message || 'Error al eliminar cliente');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error eliminando cliente:', error);
      alert('Error de conexión con el servidor');
      return { success: false };
    }
  };

  /**
   * CONFECCIONISTAS
   */
  const addConfeccionista = async (conf: any) => {
    try {
      const response = await api.createConfeccionista(conf);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          confeccionistas: [...prev.confeccionistas, response.data]
        }));
        console.log('✅ Confeccionista creado');
        return { success: true };
      } else {
        alert(response.message || 'Error al crear confeccionista');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error creando confeccionista:', error);
      alert('Error de conexión con el servidor');
      return { success: false };
    }
  };

  const updateConfeccionista = async (id: string, conf: any) => {
    try {
      const response = await api.updateConfeccionista(id, conf);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          confeccionistas: prev.confeccionistas.map(c => c.id === id ? response.data : c)
        }));
        console.log('✅ Confeccionista actualizado');
        return { success: true };
      } else {
        alert(response.message || 'Error al actualizar confeccionista');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error actualizando confeccionista:', error);
      alert('Error de conexión con el servidor');
      return { success: false };
    }
  };

  const deleteConfeccionista = async (id: string) => {
    try {
      const response = await api.deleteConfeccionista(id);

      if (response.success) {
        setState(prev => ({
          ...prev,
          confeccionistas: prev.confeccionistas.filter(c => c.id !== id)
        }));
        console.log('✅ Confeccionista eliminado');
        return { success: true };
      } else {
        alert(response.message || 'Error al eliminar confeccionista');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error eliminando confeccionista:', error);
      alert('Error de conexión con el servidor');
      return { success: false };
    }
  };

  /**
   * VENDEDORES
   */
  const addSeller = async (seller: any) => {
    try {
      const response = await api.createSeller(seller);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          sellers: [...prev.sellers, response.data]
        }));
        console.log('✅ Vendedor creado');
        return { success: true };
      } else {
        alert(response.message || 'Error al crear vendedor');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error creando vendedor:', error);
      alert('Error de conexión con el servidor');
      return { success: false };
    }
  };

  const updateSeller = async (id: string, seller: any) => {
    try {
      const response = await api.updateSeller(id, seller);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          sellers: prev.sellers.map(s => s.id === id ? response.data : s)
        }));
        console.log('✅ Vendedor actualizado');
        return { success: true };
      } else {
        alert(response.message || 'Error al actualizar vendedor');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error actualizando vendedor:', error);
      alert('Error de conexión con el servidor');
      return { success: false };
    }
  };

  const deleteSeller = async (id: string) => {
    try {
      const response = await api.deleteSeller(id);

      if (response.success) {
        setState(prev => ({
          ...prev,
          sellers: prev.sellers.filter(s => s.id !== id)
        }));
        console.log('✅ Vendedor eliminado');
        return { success: true };
      } else {
        alert(response.message || 'Error al eliminar vendedor');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error eliminando vendedor:', error);
      alert('Error de conexión con el servidor');
      return { success: false };
    }
  };

  /**
   * USUARIOS
   */
  const addUser = async (user: any) => {
    try {
      const response = await api.createUser(user.name, user.loginCode, user.pin, user.role);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          users: [...prev.users, response.data]
        }));
        console.log('✅ Usuario creado');
        return { success: true };
      } else {
        alert(response.message || 'Error al crear usuario');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error creando usuario:', error);
      alert('Error de conexión con el servidor');
      return { success: false };
    }
  };

  const updateUser = async (id: string, user: any) => {
    try {
      const response = await api.updateUser(id, user);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          users: prev.users.map(u => u.id === id ? response.data : u)
        }));
        console.log('✅ Usuario actualizado');
        return { success: true };
      } else {
        alert(response.message || 'Error al actualizar usuario');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error actualizando usuario:', error);
      alert('Error de conexión con el servidor');
      return { success: false };
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const response = await api.deleteUser(id);

      if (response.success) {
        setState(prev => ({
          ...prev,
          users: prev.users.filter(u => u.id !== id)
        }));
        console.log('✅ Usuario eliminado');
        return { success: true };
      } else {
        alert(response.message || 'Error al eliminar usuario');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error eliminando usuario:', error);
      alert('Error de conexión con el servidor');
      return { success: false };
    }
  };

  /**
   * CORRERIAS
   */
  const addCorreria = async (correria: any) => {
    try {
      const response = await api.createCorreria(correria);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          correrias: [...prev.correrias, response.data]
        }));
        console.log('✅ Correría creada');
        return { success: true };
      } else {
        alert(response.message || 'Error al crear correría');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error creando correría:', error);
      alert('Error de conexión con el servidor');
      return { success: false };
    }
  };

  const updateCorreria = async (id: string, correria: any) => {
    try {
      const response = await api.updateCorreria(id, correria);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          correrias: prev.correrias.map(c => c.id === id ? response.data : c)
        }));
        console.log('✅ Correría actualizada');
        return { success: true };
      } else {
        alert(response.message || 'Error al actualizar correría');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error actualizando correría:', error);
      alert('Error de conexión con el servidor');
      return { success: false };
    }
  };

  const deleteCorreria = async (id: string) => {
    try {
      const response = await api.deleteCorreria(id);

      if (response.success) {
        setState(prev => ({
          ...prev,
          correrias: prev.correrias.filter(c => c.id !== id)
        }));
        console.log('✅ Correría eliminada');
        return { success: true };
      } else {
        alert(response.message || 'Error al eliminar correría');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error eliminando correría:', error);
      alert('Error de conexión con el servidor');
      return { success: false };
    }
  };

  /**
   * RECEPCIONES
   */
  const addReception = async (reception: any) => {
    try {
      const response = await api.createReception(reception);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          receptions: [...prev.receptions, response.data]
        }));
        console.log('✅ Recepción creada');
        return { success: true };
      } else {
        alert(response.message || 'Error al crear recepción');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error creando recepción:', error);
      alert('Error de conexión con el servidor');
      return { success: false };
    }
  };

  /**
   * DESPACHOS
   */
  const addDispatch = async (dispatch: any) => {
    try {
      const response = await api.createDispatch(dispatch);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          dispatches: [...prev.dispatches, response.data]
        }));
        console.log('✅ Despacho creado');
        return { success: true };
      } else {
        alert(response.message || 'Error al crear despacho');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error creando despacho:', error);
      alert('Error de conexión con el servidor');
      return { success: false };
    }
  };

  /**
   * PEDIDOS
   */
  const addOrder = async (order: any) => {
    try {
      const response = await api.createOrder(order);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          orders: [...prev.orders, response.data]
        }));
        console.log('✅ Pedido creado');
        return { success: true };
      } else {
        alert(response.message || 'Error al crear pedido');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error creando pedido:', error);
      alert('Error de conexión con el servidor');
      return { success: false };
    }
  };

  // ========== RENDERIZADO ==========

  if (!user) {
    return (
      <LoginView 
        users={state.users} 
        onLogin={setUser} 
        onRegister={(u) => setUser(u)} 
      />
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Cargando datos...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'reception':
        return (
          <ReceptionView 
            user={user} 
            receptions={state.receptions} 
            confeccionistasMaster={state.confeccionistas} 
            updateState={updateState} 
            referencesMaster={state.references}
            onAddReception={addReception}
          />
        );
      case 'dispatch':
        return (
          <DispatchView 
            user={user} 
            clients={state.clients} 
            dispatches={state.dispatches} 
            updateState={updateState} 
            referencesMaster={state.references}
            correrias={state.correrias}
            onAddDispatch={addDispatch}
          />
        );
      case 'inventory':
        return <InventoryView receptions={state.receptions} dispatches={state.dispatches} />;
        case 'orders':
          return (
            <OrdersView 
              state={state} 
              updateState={updateState}
              user={user}
              onUnsavedChanges={setHasUnsavedOrderChanges}
            />
          );
      case 'settle':
        return <OrderSettleView state={state} user={user} updateState={updateState} />;
      case 'orderHistory':
        return <OrderHistoryView state={state} />;
      case 'dispatchControl':
        return <DispatchControlView state={state} user={user} />;
      case 'masters':
        return (
          <MastersView 
            user={user} 
            state={state} 
            updateState={updateState}
            onAddReference={addReference}
            onUpdateReference={updateReference}
            onDeleteReference={deleteReference}
            onAddClient={addClient}
            onUpdateClient={updateClient}
            onDeleteClient={deleteClient}
            onAddConfeccionista={addConfeccionista}
            onUpdateConfeccionista={updateConfeccionista}
            onDeleteConfeccionista={deleteConfeccionista}
            onAddUser={addUser}
            onUpdateUser={updateUser}
            onDeleteUser={deleteUser}
            onAddSeller={addSeller}
            onUpdateSeller={updateSeller}
            onDeleteSeller={deleteSeller}
            onAddCorreria={addCorreria}
            onUpdateCorreria={updateCorreria}
            onDeleteCorreria={deleteCorreria}
          />
        );
      case 'reports':
        return <ReportsView state={state} user={user} />;
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
            <div className="w-20 h-10 bg-gradient-to-br from-blue-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md">
              Plow
            </div>
            <div className="hidden sm:block">
              <h1 className="font-extrabold text-lg tracking-tighter leading-none">Gestión de inventarios</h1>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">Ventas y producción</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <p className="font-bold text-sm leading-none">{user.name}</p>
            <p className="text-[10px] text-slate-400 capitalize font-bold mt-1">{user.role}</p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm ${user.role === UserRole.admin ? 'bg-pink-500' : 'bg-blue-500'}`}>
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
                <div className="w-40 h-10 bg-gradient-to-br from-blue-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-black text-lg">
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

          <div className="p-6 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
            <NavItem active={activeTab === 'reception'} onClick={() => handleTabChange('reception')} icon={<Icons.Reception />} label="Recepción" />
            <NavItem active={activeTab === 'dispatch'} onClick={() => handleTabChange('dispatch')} icon={<Icons.Dispatch />} label="Despachos" />
            <NavItem active={activeTab === 'inventory'} onClick={() => handleTabChange('inventory')} icon={<Icons.Inventory />} label="Inventario" />
            <div className="my-4 border-t border-slate-100 pt-4">
              <p className="px-6 text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Comercial</p>
              <NavItem 
                active={activeTab === 'orders'} 
                onClick={() => handleTabChange('orders')} 
                icon={<Icons.Orders />} 
                label={
                  <span className="flex items-center gap-2">
                    Pedidos
                    {hasUnsavedOrderChanges && (
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </span>
                } 
              />
              <NavItem 
                active={activeTab === 'dispatchControl'} 
                onClick={() => handleTabChange('dispatchControl')} 
                icon={<Icons.Inventory />} 
                label="Control de Despachos" 
             />
              <NavItem active={activeTab === 'settle'} onClick={() => handleTabChange('settle')} icon={<Icons.Settle />} label="Asentar Ventas" />
              <NavItem active={activeTab === 'orderHistory'} onClick={() => handleTabChange('orderHistory')} icon={<Icons.History />} label="Historial Pedidos" />
            </div>
            <div className="my-4 border-t border-slate-100 pt-4">
              <NavItem active={activeTab === 'masters'} onClick={() => handleTabChange('masters')} icon={<Icons.Masters />} label="Maestros" />
              <NavItem active={activeTab === 'reports'} onClick={() => handleTabChange('reports')} icon={<Icons.Reports />} label="Reportes" />
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
        <div className="h-full w-full overflow-y-auto custom-scrollbar p-6 md:p-10">
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
    className={`w-full flex items-center gap-4 px-6 py-3.5 rounded-[22px] transition-all group ${
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
