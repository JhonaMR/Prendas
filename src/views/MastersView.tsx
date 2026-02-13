
import React, { useState, useRef } from 'react';
import { User, UserRole, Client, AppState, Reference, Seller, Correria, Confeccionista } from '../types';
import { Icons } from '../constants';

// Helper Components
const TabBtn = ({ active, onClick, label }: any) => (
  <button onClick={onClick} className={`px-8 py-3 rounded-2xl text-xs font-black transition-all ${active ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>{label}</button>
);

const FormWrapper = ({ children, title }: any) => (
  <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
    <h3 className="text-xl font-black text-slate-800">{title}</h3>
    {children}
  </div>
);

const TableWrapper = ({ children, title }: any) => (
  <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
    <div className="p-6 bg-slate-50 border-b border-slate-100 font-black text-slate-700">{title}</div>
    {children}
  </div>
);

const Input = ({ label, value, onChange, type = "text", className = "", disabled = false, maxLength }: any) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">{label}</label>
    <input 
      type={type} 
      value={value || ''} 
      onChange={e => onChange(e.target.value)} 
      disabled={disabled} 
      maxLength={maxLength}
      className="w-full px-6 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50" 
    />
  </div>
);

interface MastersViewProps {
  user: User;
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
    // ← AGREGAdAS ESTAS NUEVAS PROPS
  onAddReference: (ref: any) => Promise<{ success: boolean }>;
  onUpdateReference: (id: string, ref: any) => Promise<{ success: boolean }>;
  onDeleteReference: (id: string) => Promise<{ success: boolean }>;
  onAddClient: (client: any) => Promise<{ success: boolean }>;
  onUpdateClient: (id: string, client: any) => Promise<{ success: boolean }>;
  onDeleteClient: (id: string) => Promise<{ success: boolean }>;
  onAddConfeccionista: (conf: any) => Promise<{ success: boolean }>;
  onUpdateConfeccionista: (id: string, conf: any) => Promise<{ success: boolean }>;
  onDeleteConfeccionista: (id: string) => Promise<{ success: boolean }>;
  onAddUser: (user: any) => Promise<{ success: boolean }>;
  onUpdateUser: (id: string, user: any) => Promise<{ success: boolean }>;
  onDeleteUser: (id: string) => Promise<{ success: boolean }>;
  onAddSeller: (seller: any) => Promise<{ success: boolean }>;
  onUpdateSeller: (id: string, seller: any) => Promise<{ success: boolean }>;
  onDeleteSeller: (id: string) => Promise<{ success: boolean }>;
  onAddCorreria: (correria: any) => Promise<{ success: boolean }>;
  onUpdateCorreria: (id: string, correria: any) => Promise<{ success: boolean }>;
  onDeleteCorreria: (id: string) => Promise<{ success: boolean }>;
}

const MastersView: React.FC<MastersViewProps> = ({ 
  user, 
  state, 
  updateState,
  // ← AGREGAR ESTAS PROPS
  onAddReference,
  onUpdateReference,
  onDeleteReference,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onAddConfeccionista,
  onUpdateConfeccionista,
  onDeleteConfeccionista,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onAddSeller,
  onUpdateSeller,
  onDeleteSeller,
  onAddCorreria,
  onUpdateCorreria,
  onDeleteCorreria
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'clients' | 'users' | 'references' | 'sellers' | 'correrias' | 'confeccionistas'>('clients');
  const clientFileRef = useRef<HTMLInputElement>(null);
  const referenceFileRef = useRef<HTMLInputElement>(null);
  const confeccionistaFileRef = useRef<HTMLInputElement>(null);

  const isAdmin = user.role === UserRole.admin;

  // Forms Shared state
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [nit, setNit] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [seller, setSeller] = useState('');
  
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState(0);
  const [designer, setDesigner] = useState('');
  const [cloth1, setCloth1] = useState('');
  const [avgCloth1, setAvgCloth1] = useState(0);
  const [cloth2, setCloth2] = useState('');
  const [avgCloth2, setAvgCloth2] = useState(0);
  const [selectedCorrerias, setSelectedCorrerias] = useState<string[]>([]);

  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [pin, setPin] = useState('');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.GENERAL);

  const [score, setScore] = useState('A');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para autocompletado de correrías
  const [correriaSearch, setCorreriaSearch] = useState('');
  const [showCorreriaDropdown, setShowCorreriaDropdown] = useState(false);

  // Estados para autocompletado de vendedores
  const [sellerSearch, setSellerSearch] = useState('');
  const [showSellerDropdown, setShowSellerDropdown] = useState(false);

  const resetForms = () => {
    setId('');
    setName('');
    setNit('');
    setAddress('');
    setCity('');
    setSeller('');
    setDesc('');
    setPrice(0);
    setDesigner('');
    setCloth1('');
    setAvgCloth1(0);
    setCloth2('');
    setAvgCloth2(0);
    setYear(new Date().getFullYear().toString());
    setPin('');
    setUserRole(UserRole.GENERAL);
    setScore('A');
    setPhone('');
    setIsActive(true);
    setSelectedCorrerias([]);
    setEditingId(null);
    setCorreriaSearch('');
    setShowCorreriaDropdown(false);
    setSellerSearch('');
    setShowSellerDropdown(false);
  };

  // Cerrar dropdown al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickInsideDropdown = target.closest('[data-correria-dropdown]');
      const isClickInsideSellerDropdown = target.closest('[data-seller-dropdown]');
      
      if (!isClickInsideDropdown) {
        setShowCorreriaDropdown(false);
      }
      if (!isClickInsideSellerDropdown) {
        setShowSellerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImportCSV = async (type: 'clients' | 'references' | 'confeccionistas', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const rows = content.split('\n').filter(row => row.trim() !== '');
      
      setIsLoading(true);
      try {
        if (type === 'clients') {
          const newClients: Client[] = [];
          for (let i = 1; i < rows.length; i++) {
            const [cId, cNit, cName, cAddr, cCity, cSell] = rows[i].split(/[;,]/).map(c => c.trim());
            if (cId && cName) {
              const clientData = { id: cId, nit: cNit||'', name: cName, address: cAddr||'', city: cCity||'', seller: cSell||'' };
              newClients.push(clientData);
              
              // Guardar en backend
              try {
                await onAddClient(clientData);
              } catch (error) {
                console.error(`Error guardando cliente ${cId}:`, error);
              }
            }
          }
          
          // Actualizar estado local
          updateState(prev => ({
            ...prev,
            clients: [...prev.clients, ...newClients]
          }));
          
        } else if (type === 'references') {
          const newRefs: Reference[] = [];
          for (let i = 1; i < rows.length; i++) {
            const [rId, rDesc, rPrice, rDes, t1, p1, t2, p2, corr] = rows[i].split(/[;,]/).map(c => c.trim());
            if (rId && rDesc) {
              // Procesar correrías (separadas por |)
              const correrias = corr ? corr.split('|').map(c => c.trim()).filter(c => c) : [];
              
              const refData = { 
                id: rId, 
                description: rDesc, 
                price: Number(rPrice)||0, 
                designer: rDes||'', 
                cloth1: t1||'', 
                avgCloth1: Number(p1)||0, 
                cloth2: t2||'', 
                avgCloth2: Number(p2)||0,
                correrias: correrias
              };
              newRefs.push(refData);
              
              // Guardar en backend
              try {
                await onAddReference(refData);
              } catch (error) {
                console.error(`Error guardando referencia ${rId}:`, error);
              }
            }
          }
          
          // Actualizar estado local
          updateState(prev => ({
            ...prev,
            references: [...prev.references, ...newRefs]
          }));
          
        } else if (type === 'confeccionistas') {
          const newConf: Confeccionista[] = [];
          for (let i = 1; i < rows.length; i++) {
            const [cfId, cfName, cfAddr, cfCity, cfPhone, cfScore, cfActive] = rows[i].split(/[;,]/).map(c => c.trim());
            if (cfId && cfName) {
              const confData: Confeccionista = { 
                id: cfId, 
                name: cfName, 
                address: cfAddr||'', 
                city: cfCity||'', 
                phone: cfPhone||'',
                score: cfScore || 'A', 
                active: cfActive === '1' || cfActive?.toLowerCase() === 'sí' || cfActive?.toLowerCase() === 'true'
              };
              newConf.push(confData);
              
              // Guardar en backend
              try {
                await onAddConfeccionista(confData);
              } catch (error) {
                console.error(`Error guardando confeccionista ${cfId}:`, error);
              }
            }
          }
          
          // Actualizar estado local
          updateState(prev => ({
            ...prev,
            confeccionistas: [...(prev.confeccionistas || []), ...newConf]
          }));
        }
        
        alert(`Importación de ${type} finalizada correctamente.`);
      } catch (error) {
        console.error('Error en importación:', error);
        alert('Error durante la importación. Revisa la consola para más detalles.');
      } finally {
        setIsLoading(false);
        if(e.target) e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleSaveClient = async () => {
    if (!id || !name) return alert("ID y Nombre son obligatorios");
    const newItem: Client = { id, name, nit, address, city, seller };
    
    setIsLoading(true);
    try {
      let result;
      
      if (editingId) {
        // Actualizar cliente existente
        result = await onUpdateClient(editingId, newItem);
      } else {
        // Crear nuevo cliente
        result = await onAddClient(newItem);
      }
      
      if (result.success) {
        resetForms();
        alert('Cliente guardado correctamente');
      } else {
        alert('Error al guardar cliente');
      }
    } catch (error) {
      console.error('Error guardando cliente:', error);
      alert('Error de conexión al guardar cliente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfeccionista = async () => {
    if (!id || !name) return alert("Cédula y Nombre son obligatorios");
    const newItem: Confeccionista = { id, name, address, city, phone, score, active: isActive };
    
    setIsLoading(true);
    try {
      let result;
      
      if (editingId) {
        // Actualizar confeccionista existente
        result = await onUpdateConfeccionista(editingId, newItem);
      } else {
        // Crear nuevo confeccionista
        result = await onAddConfeccionista(newItem);
      }
      
      if (result.success) {
        resetForms();
        alert('Confeccionista guardado correctamente');
      } else {
        alert('Error al guardar confeccionista');
      }
    } catch (error) {
      console.error('Error guardando confeccionista:', error);
      alert('Error de conexión al guardar confeccionista');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUser = async () => {
    if (!isAdmin) return;
    if (!name) return alert("Nombre obligatorio");
    const newItem: User = { id: editingId || Math.random().toString(36).substr(2, 9), name, loginCode: id, pin, role: userRole };
    
    setIsLoading(true);
    try {
      let result;
      
      if (editingId) {
        // Actualizar usuario existente
        result = await onUpdateUser(editingId, newItem);
      } else {
        // Crear nuevo usuario
        result = await onAddUser(newItem);
      }
      
      if (result.success) {
        resetForms();
        alert('Usuario guardado correctamente');
      } else {
        alert('Error al guardar usuario');
      }
    } catch (error) {
      console.error('Error guardando usuario:', error);
      alert('Error de conexión al guardar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveReference = async () => {
    if (!id || !desc) return alert("Referencia y Descripción son obligatorias");
    
    // Validar que tenga al menos una correría
    if (selectedCorrerias.length === 0) {
      return alert("Debe asignar al menos una correría a la referencia");
    }
    
    const newItem: Reference = { 
      id, 
      description: desc, 
      price, 
      designer, 
      cloth1, 
      avgCloth1, 
      cloth2, 
      avgCloth2,
      correrias: selectedCorrerias
    };
    
    setIsLoading(true);
    try {
      let result;
      
      if (editingId) {
        // Actualizar referencia existente
        result = await onUpdateReference(editingId, newItem);
      } else {
        // Crear nueva referencia
        result = await onAddReference(newItem);
      }
      
      if (result.success) {
        resetForms();
        alert('Referencia guardada correctamente');
      } else {
        alert('Error al guardar referencia');
      }
    } catch (error) {
      console.error('Error guardando referencia:', error);
      alert('Error de conexión al guardar referencia');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSeller = async () => {
    if (!isAdmin) return;
    if (!name) return alert("Nombre obligatorio");
    const newItem: Seller = { id: editingId || Math.random().toString(36).substr(2, 9), name };
    
    setIsLoading(true);
    try {
      let result;
      
      if (editingId) {
        // Actualizar vendedor existente
        result = await onUpdateSeller(editingId, newItem);
      } else {
        // Crear nuevo vendedor
        result = await onAddSeller(newItem);
      }
      
      if (result.success) {
        resetForms();
        alert('Vendedor guardado correctamente');
      } else {
        alert('Error al guardar vendedor');
      }
    } catch (error) {
      console.error('Error guardando vendedor:', error);
      alert('Error de conexión al guardar vendedor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCorreria = async () => {
    if (!name || !year) return alert("Nombre y Año obligatorios");
    const newItem: Correria = { id: editingId || Math.random().toString(36).substr(2, 9), name, year };
    
    setIsLoading(true);
    try {
      let result;
      
      if (editingId) {
        // Actualizar correría existente
        result = await onUpdateCorreria(editingId, newItem);
      } else {
        // Crear nueva correría
        result = await onAddCorreria(newItem);
      }
      
      if (result.success) {
        resetForms();
        alert('Correría guardada correctamente');
      } else {
        alert('Error al guardar correría');
      }
    } catch (error) {
      console.error('Error guardando correría:', error);
      alert('Error de conexión al guardar correría');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (type: string, targetId: string) => {
    if (!isAdmin && (type === 'user' || type === 'seller' || type === 'confeccionista')) return;
    if (!confirm("¿Seguro que desea eliminar este registro?")) return;
    
    setIsLoading(true);
    try {
      let result;
      
      if (type === 'client') {
        // Eliminar cliente del backend
        result = await onDeleteClient(targetId);
      } else if (type === 'confeccionista') {
        // Eliminar confeccionista del backend
        result = await onDeleteConfeccionista(targetId);
      } else if (type === 'reference') {
        // Eliminar referencia del backend
        result = await onDeleteReference(targetId);
      } else if (type === 'seller') {
        // Eliminar vendedor del backend
        result = await onDeleteSeller(targetId);
      } else if (type === 'correria') {
        // Eliminar correría del backend
        result = await onDeleteCorreria(targetId);
      } else if (type === 'user') {
        // Eliminar usuario del backend
        if (targetId === user.id) {
          alert("No puedes eliminar tu propio usuario");
          setIsLoading(false);
          return;
        }
        result = await onDeleteUser(targetId);
      }
      
      if (result?.success) {
        alert('Registro eliminado correctamente');
      } else {
        alert('Error al eliminar el registro');
      }
    } catch (error) {
      console.error('Error eliminando:', error);
      alert('Error de conexión al eliminar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Maestros</h2>
          <p className="text-slate-400 font-medium">Configuración de base de datos</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-3xl shadow-sm border border-slate-100 w-fit">
        <TabBtn active={activeSubTab === 'clients'} onClick={() => {setActiveSubTab('clients'); resetForms();}} label="Clientes" />
        <TabBtn active={activeSubTab === 'confeccionistas'} onClick={() => {setActiveSubTab('confeccionistas'); resetForms();}} label="Confeccionistas" />
        <TabBtn active={activeSubTab === 'references'} onClick={() => {setActiveSubTab('references'); resetForms();}} label="Referencias" />
        <TabBtn active={activeSubTab === 'sellers'} onClick={() => {setActiveSubTab('sellers'); resetForms();}} label="Vendedores" />
        <TabBtn active={activeSubTab === 'correrias'} onClick={() => {setActiveSubTab('correrias'); resetForms();}} label="Correrías" />
        <TabBtn active={activeSubTab === 'users'} onClick={() => {setActiveSubTab('users'); resetForms();}} label="Usuarios" />
      </div>

      {activeSubTab === 'clients' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FormWrapper title={editingId ? 'Editar Cliente' : 'Nuevo Cliente'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="ID Cliente" value={id} onChange={setId} disabled={!!editingId} />
                  <Input label="NIT" value={nit} onChange={setNit} />
                  <Input label="Nombre del Cliente" value={name} onChange={setName} />
                  <Input label="Dirección" value={address} onChange={setAddress} />
                  <Input label="Ciudad" value={city} onChange={setCity} />
                  
                  {/* DROPDOWN DE VENDEDORES */}
                  <div className="md:col-span-2 space-y-1.5 relative" data-seller-dropdown>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Vendedor</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={sellerSearch}
                        onChange={(e) => {
                          setSellerSearch(e.target.value);
                          setShowSellerDropdown(true);
                        }}
                        onFocus={() => setShowSellerDropdown(true)}
                        placeholder="Buscar o seleccionar vendedor..."
                        className="w-full px-6 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all"
                      />
                      
                      {/* Botón para limpiar */}
                      {sellerSearch && (
                        <button
                          onClick={() => {
                            setSellerSearch('');
                            setSeller('');
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 font-black text-xl transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    
                    {/* Dropdown de vendedores */}
                    {showSellerDropdown && (
                      <div className="absolute top-full left-0 mt-2 w-full bg-white border-2 border-slate-200 rounded-2xl shadow-lg z-50 max-h-60 overflow-y-auto">
                        {state.sellers
                          .filter(s => 
                            s.name.toLowerCase().includes(sellerSearch.toLowerCase())
                          )
                          .map(s => (
                            <button
                              key={s.id}
                              onClick={() => {
                                setSeller(s.name);
                                setSellerSearch(s.name);
                                setShowSellerDropdown(false);
                              }}
                              className="w-full px-6 py-3 text-left hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0"
                            >
                              <p className="font-black text-slate-800">{s.name}</p>
                            </button>
                          ))}
                        {state.sellers.filter(s => 
                          s.name.toLowerCase().includes(sellerSearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-6 py-4 text-center text-slate-400 font-bold">
                            No se encontraron vendedores
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button 
                    onClick={handleSaveClient} 
                    disabled={isLoading}
                    className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? 'GUARDANDO...' : 'GUARDAR CLIENTE'}
                </button>
                  {editingId && <button onClick={resetForms} className="px-6 py-4 bg-slate-100 text-slate-400 font-bold rounded-2xl">CANCELAR</button>}
                </div>
              </FormWrapper>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-4">
                <h3 className="text-xl font-black text-slate-800">Importar Clientes</h3>
                <p className="text-[10px] font-bold text-slate-400 leading-relaxed">CSV: <span className="text-blue-500">ID;NIT;Nombre;Dirección;Ciudad;Vendedor</span></p>
                <input type="file" ref={clientFileRef} onChange={(e) => handleImportCSV('clients', e)} accept=".csv" className="hidden" />
                <button onClick={() => clientFileRef.current?.click()} className="w-full py-4 bg-slate-50 text-slate-500 font-black rounded-2xl border-2 border-dashed border-slate-200 hover:bg-blue-50 transition-colors">SUBIR CSV</button>
              </div>
            </div>
          </div>
          <TableWrapper title="Listado de Clientes">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="bg-slate-50/50"><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">ID</th><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">NIT</th><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Cliente</th><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Vendedor</th><th className="px-8 py-4 text-right">Acción</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {state.clients.sort((a,b)=>a.id.localeCompare(b.id)).map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4 font-bold text-blue-500">{c.id}</td>
                      <td className="px-8 py-4 font-bold text-slate-500">{c.nit}</td>
                      <td className="px-8 py-4 font-black text-slate-800">{c.name}</td>
                      <td className="px-8 py-4 font-bold text-pink-500 uppercase text-[10px]">{c.seller}</td>
                      <td className="px-8 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => { setEditingId(c.id); setId(c.id); setNit(c.nit); setName(c.name); setAddress(c.address); setCity(c.city); setSeller(c.seller); }} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Icons.Edit /></button>
                        <button onClick={() => handleDelete('client', c.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl"><Icons.Delete /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TableWrapper>
        </div>
      )}

      {activeSubTab === 'confeccionistas' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FormWrapper title={editingId ? 'Editar Confeccionista' : 'Nuevo Confeccionista'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Cédula" value={id} onChange={setId} disabled={!!editingId} />
                  <Input label="Nombre / Razón Social" value={name} onChange={setName} />
                  <Input label="Dirección" value={address} onChange={setAddress} />
                  <Input label="Ciudad" value={city} onChange={setCity} />
                  <Input label="Celular" value={phone} onChange={setPhone} />
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Puntaje</label>
                    <select 
                      value={score} 
                      onChange={(e) => setScore(e.target.value)}
                      className="w-full px-6 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all"
                    >
                      <option value="A">A</option>
                      <option value="AA">AA</option>
                      <option value="AAA">AAA</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Estado Activo</label>
                    <div className="flex gap-2">
                       <button onClick={() => setIsActive(true)} className={`flex-1 py-3.5 rounded-2xl font-bold transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>SÍ (Activo)</button>
                       <button onClick={() => setIsActive(false)} className={`flex-1 py-3.5 rounded-2xl font-bold transition-all ${!isActive ? 'bg-red-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>NO (Inactivo)</button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={handleSaveConfeccionista}
                    disabled={isLoading}
                      className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? 'GUARDANDO...' : 'GUARDAR CONFECCIONISTA'}
                    </button>
                  {editingId && <button onClick={resetForms} className="px-6 py-4 bg-slate-100 text-slate-400 font-bold rounded-2xl">CANCELAR</button>}
                </div>
              </FormWrapper>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-4">
                <h3 className="text-xl font-black text-slate-800">Importar Confeccionistas</h3>
                <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic">
                  CSV: <span className="text-indigo-500 font-black">Cédula;Nombre;Dirección;Ciudad;Celular;Puntaje;Activo(1/0)</span>
                </p>
                <input type="file" ref={confeccionistaFileRef} onChange={(e) => handleImportCSV('confeccionistas', e)} accept=".csv" className="hidden" />
                <button onClick={() => confeccionistaFileRef.current?.click()} className="w-full py-4 bg-slate-50 text-slate-500 font-black rounded-2xl border-2 border-dashed border-slate-200 hover:bg-indigo-50 transition-colors">SUBIR CSV</button>
              </div>
            </div>
          </div>
          <TableWrapper title="Listado de Confeccionistas">
            <table className="w-full text-left">
              <thead><tr className="bg-slate-50/50"><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Cédula</th><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Nombre</th><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Celular</th><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Score</th><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Estado</th><th className="px-8 py-4 text-right">Acción</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {(state.confeccionistas || []).sort((a,b)=>a.name.localeCompare(b.name)).map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4 font-bold text-slate-400">{c.id}</td>
                    <td className="px-8 py-4 font-black text-slate-800">{c.name}</td>
                    <td className="px-8 py-4 font-bold text-slate-600">{c.phone}</td>
                    <td className="px-8 py-4 text-center font-black text-blue-600">{c.score}</td>
                    <td className="px-8 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${c.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {c.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => { 
                        setEditingId(c.id); setId(c.id); setName(c.name); setAddress(c.address); setCity(c.city); setPhone(c.phone); setScore(c.score); setIsActive(c.active);
                      }} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Icons.Edit /></button>
                      <button onClick={() => handleDelete('confeccionista', c.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl"><Icons.Delete /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrapper>
        </div>
      )}

      {activeSubTab === 'references' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FormWrapper title={editingId ? 'Editar Referencia' : 'Nueva Referencia'}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Input label="Referencia" value={id} onChange={setId} disabled={!!editingId} />
                  <Input label="Descripción" value={desc} onChange={setDesc} className="md:col-span-3" />
                  <Input label="Precio Venta" type="number" value={price} onChange={(v: string) => setPrice(Number(v))} />
                  <Input label="Diseñadora" value={designer} onChange={setDesigner} />
                  <Input label="Tela 1" value={cloth1} onChange={setCloth1} />
                  <Input label="Prom. Tela 1" type="number" value={avgCloth1} onChange={(v: string) => setAvgCloth1(Number(v))} />
                  <Input label="Tela 2" value={cloth2} onChange={setCloth2} />
                  <Input label="Prom. Tela 2" type="number" value={avgCloth2} onChange={(v: string) => setAvgCloth2(Number(v))} />
                  
                  {/* SELECTOR DE CORRERÍAS CON AUTOCOMPLETADO */}
                  <div className="md:col-span-4 space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                      Correrías (Maleta) *
                    </label>
                    
                    {/* Input de búsqueda */}
                    <div className="relative" data-correria-dropdown>
                      <input
                        type="text"
                        value={correriaSearch}
                        onChange={(e) => {
                          setCorreriaSearch(e.target.value);
                          setShowCorreriaDropdown(true);
                        }}
                        onFocus={() => setShowCorreriaDropdown(true)}
                        placeholder="Buscar correría (ej: Mad, Navidad)..."
                        className="w-full px-6 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-slate-300"
                      />
                      
                      {/* Dropdown de correrías */}
                      {showCorreriaDropdown && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-white border-2 border-slate-200 rounded-2xl shadow-lg z-50 max-h-60 overflow-y-auto">
                          {state.correrias
                            .filter(c => 
                              `${c.name} ${c.year}`.toLowerCase().includes(correriaSearch.toLowerCase())
                            )
                            .map(correria => (
                              <button
                                key={correria.id}
                                onClick={() => {
                                  if (!selectedCorrerias.includes(correria.id)) {
                                    setSelectedCorrerias([...selectedCorrerias, correria.id]);
                                  }
                                  setCorreriaSearch('');
                                  setShowCorreriaDropdown(false);
                                }}
                                className="w-full px-6 py-3 text-left hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0 flex items-center justify-between group"
                              >
                                <div>
                                  <p className="font-black text-slate-800">{correria.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400">{correria.year}</p>
                                </div>
                                {selectedCorrerias.includes(correria.id) && (
                                  <span className="text-blue-600 font-black">✓</span>
                                )}
                              </button>
                            ))}
                          {state.correrias.filter(c => 
                            `${c.name} ${c.year}`.toLowerCase().includes(correriaSearch.toLowerCase())
                          ).length === 0 && (
                            <div className="px-6 py-4 text-center text-slate-400 font-bold">
                              No se encontraron correrías
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Cajoncito con correrías seleccionadas */}
                    <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-200 min-h-[60px]">
                      {selectedCorrerias.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedCorrerias.map(correriaId => {
                            const correria = state.correrias.find(c => c.id === correriaId);
                            return correria ? (
                              <div
                                key={correriaId}
                                className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border-2 border-blue-300 shadow-sm"
                              >
                                <div>
                                  <p className="font-black text-xs text-slate-800">{correria.name}</p>
                                  <p className="text-[9px] font-bold text-slate-400">{correria.year}</p>
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedCorrerias(selectedCorrerias.filter(id => id !== correriaId));
                                  }}
                                  className="ml-2 text-red-500 hover:text-red-700 font-black text-lg leading-none hover:bg-red-50 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                                >
                                  ×
                                </button>
                              </div>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-red-500 font-bold text-center">
                          ⚠️ Debe seleccionar al menos una correría
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={handleSaveReference}
                    disabled={isLoading}
                      className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? 'GUARDANDO...' : 'GUARDAR REFERENCIA'}
                    </button>
                  {editingId && <button onClick={resetForms} className="px-6 py-4 bg-slate-100 text-slate-400 font-bold rounded-2xl">CANCELAR</button>}
                </div>
              </FormWrapper>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-4">
                <h3 className="text-xl font-black text-slate-800">Importar Referencias</h3>
                <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                  CSV: <span className="text-indigo-500">Ref;Desc;Precio;Diseñadora;Tela1;Prom1;Tela2;Prom2;Correrias</span>
                </p>
                <p className="text-[9px] font-bold text-slate-500 italic mt-1">
                  Ejemplo correrías: Madres2026|Padres2026|Navidad2026
                </p>
                <input type="file" ref={referenceFileRef} onChange={(e) => handleImportCSV('references', e)} accept=".csv" className="hidden" />
                <button onClick={() => referenceFileRef.current?.click()} className="w-full py-4 bg-slate-50 text-slate-500 font-black rounded-2xl border-2 border-dashed border-slate-200 hover:bg-indigo-50 transition-colors">SUBIR CSV</button>
              </div>
            </div>
          </div>
          <TableWrapper title="Listado de Referencias">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead><tr className="bg-slate-50/50"><th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Ref</th><th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Descripción</th><th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Precio</th><th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Telas / Prom</th><th className="px-6 py-4 text-right">Acción</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {state.references.sort((a,b)=>a.id.localeCompare(b.id)).map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-black text-indigo-600">{r.id}</td>
                      <td className="px-6 py-4 font-black text-slate-900">{r.description}</td>
                      <td className="px-6 py-4 font-bold text-slate-400">${r.price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-[10px] space-y-1">
                        <div className="flex gap-2">
                          <span className="font-black text-slate-700">{r.cloth1}:</span> <span>{r.avgCloth1}</span>
                        </div>
                        {r.cloth2 && (
                          <div className="flex gap-2">
                            <span className="font-black text-slate-700">{r.cloth2}:</span> <span>{r.avgCloth2}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => { 
                          setEditingId(r.id); 
                          setId(r.id); 
                          setDesc(r.description); 
                          setPrice(r.price); 
                          setDesigner(r.designer); 
                          setCloth1(r.cloth1||''); 
                          setAvgCloth1(r.avgCloth1||0);
                          setCloth2(r.cloth2||''); 
                          setAvgCloth2(r.avgCloth2||0);
                          setSelectedCorrerias(r.correrias || []);
                        }} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Icons.Edit /></button>
                        <button onClick={() => handleDelete('reference', r.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl"><Icons.Delete /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TableWrapper>
        </div>
      )}

      {activeSubTab === 'sellers' && (
        <div className="space-y-6 animate-in fade-in duration-300">
           {isAdmin ? (
             <FormWrapper title={editingId ? 'Editar Vendedor' : 'Nuevo Vendedor'}>
                <div className="max-w-md space-y-4">
                   <Input label="Nombre del Vendedor" value={name} onChange={setName} />
                   <div className="flex gap-4">
                      <button onClick={handleSaveSeller}
                    disabled={isLoading}
                      className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? 'GUARDANDO...' : 'GUARDAR VENDEDOR'}
                    </button>
                      {editingId && <button onClick={resetForms} className="px-6 py-4 bg-slate-100 text-slate-400 font-bold rounded-2xl">CANCELAR</button>}
                   </div>
                </div>
             </FormWrapper>
           ) : (
             <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex items-center gap-4 text-amber-700 font-bold">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
               </svg>
               Se requiere acceso de administrador para crear o editar vendedores.
             </div>
           )}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {state.sellers.map(s => (
                <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
                   <p className="font-black text-slate-800">{s.name}</p>
                   {isAdmin && (
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingId(s.id); setName(s.name); }} className="p-2 text-pink-400 hover:bg-pink-50 rounded-lg transition-colors"><Icons.Edit /></button>
                      <button onClick={() => handleDelete('seller', s.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Icons.Delete /></button>
                    </div>
                   )}
                </div>
              ))}
           </div>
        </div>
      )}

      {activeSubTab === 'correrias' && (
        <div className="space-y-6 animate-in fade-in duration-300">
           <FormWrapper title={editingId ? 'Editar Correría' : 'Nueva Correría'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                 <Input label="Nombre de Campaña" value={name} onChange={setName} />
                 <Input label="Año" value={year} onChange={setYear} type="number" />
              </div>
              <div className="flex gap-4 mt-6">
                 <button onClick={handleSaveCorreria}
                    disabled={isLoading}
                      className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? 'GUARDANDO...' : 'GUARDAR CORRERÍA'}
                    </button>
                 {editingId && <button onClick={resetForms} className="px-6 py-4 bg-slate-100 text-slate-400 font-bold rounded-2xl">CANCELAR</button>}
              </div>
           </FormWrapper>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {state.correrias.sort((a,b)=>b.year.localeCompare(a.year)).map(c => (
                <div key={c.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
                   <div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{c.year}</p>
                      <p className="font-black text-slate-800">{c.name}</p>
                   </div>
                   <div className="flex gap-2">
                    <button onClick={() => { setEditingId(c.id); setName(c.name); setYear(c.year); }} className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"><Icons.Edit /></button>
                    <button onClick={() => handleDelete('correria', c.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Icons.Delete /></button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeSubTab === 'users' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {isAdmin ? (
            <FormWrapper title={editingId ? 'Editar Usuario' : 'Nuevo Usuario'}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Input label="Nombre del Usuario" value={name} onChange={setName} />
                <Input label="Código (3 Letras)" value={id} onChange={setId} maxLength={3} disabled={!!editingId} />
                <Input label="PIN (4 Números)" value={pin} onChange={setPin} maxLength={4} type="password" />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Rol del Usuario</label>
                  <select 
                    value={userRole} 
                    onChange={(e) => setUserRole(e.target.value as UserRole)}
                    className="w-full px-6 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all"
                  >
                    <option value={UserRole.GENERAL}>Vendedor / Operario</option>
                    <option value={UserRole.admin}>Administrador</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                 <button onClick={handleSaveUser}
                    disabled={isLoading}
                      className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? 'GUARDANDO...' : 'GUARDAR USUARIO'}
                    </button>
                 {editingId && <button onClick={resetForms} className="px-6 py-4 bg-slate-100 text-slate-400 font-bold rounded-2xl">CANCELAR</button>}
              </div>
            </FormWrapper>
          ) : (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex items-center gap-4 text-amber-700 font-bold">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
               </svg>
               Se requiere acceso de administrador para crear o editar usuarios.
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {state.users.map(u => (
               <div key={u.id} className="bg-white p-8 rounded-[40px] border border-slate-100 flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  {u.role === UserRole.admin && (
                    <div className="absolute top-0 right-0 p-2">
                      <span className="text-[8px] font-black bg-pink-500 text-white px-3 py-1 rounded-bl-2xl uppercase tracking-widest">Admin</span>
                    </div>
                  )}
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white font-black text-xl shadow-inner ${u.role === UserRole.admin ? 'bg-gradient-to-br from-pink-500 to-pink-400' : 'bg-gradient-to-br from-blue-500 to-blue-400'}`}>
                    {u.loginCode}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-lg leading-none mb-1">{u.name}</p>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">PIN: ****</p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-3 w-full pt-4 border-t border-slate-50">
                      <button 
                        onClick={() => { 
                          setEditingId(u.id); 
                          setName(u.name); 
                          setId(u.loginCode); 
                          setPin(u.pin); 
                          setUserRole(u.role); 
                        }} 
                        className="flex-1 py-2 bg-blue-50 text-blue-600 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-colors"
                      >
                        Editar
                      </button>
                      {u.id !== user.id && (
                        <button 
                          onClick={() => handleDelete('user', u.id)} 
                          className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          <Icons.Delete />
                        </button>
                      )}
                    </div>
                  )}
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MastersView;
