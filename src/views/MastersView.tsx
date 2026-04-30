
import React, { useState, useRef, useMemo } from 'react';
import { User, UserRole, Client, AppState, Reference, Seller, Correria, Confeccionista } from '../types';
import { Icons } from '../constants';
import { canEdit, canDelete } from '../utils/permissions';
import RoleBadge from '../components/Badge/RoleBadge';
import PaginationComponent from '../components/PaginationComponent';
import usePagination from '../hooks/usePagination';
import { api } from '../services/api';
import { useDarkMode } from '../context/DarkModeContext';

// Helper Components - defined outside MastersView to avoid re-mounting on every render
const TabBtn = ({ active, onClick, label }: any) => (
  <button onClick={onClick} className={`px-8 py-3 rounded-2xl text-xs font-black transition-all ${active ? 'bg-violet-600 text-white shadow-xl' : 'text-violet-300 hover:bg-[#5a4a75]'}`}>{label}</button>
);

const FormWrapper = ({ children, title, isDark }: any) => (
  <div className={`p-8 rounded-[32px] shadow-sm space-y-6 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'} border`}>
    <h3 className={`text-xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{title}</h3>
    {children}
  </div>
);

const TableWrapper = ({ children, title, isDark }: any) => (
  <div className={`rounded-[32px] shadow-sm overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'} border`}>
    <div className={`p-6 font-black transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] text-violet-50 border-violet-700' : 'bg-slate-50 text-slate-700 border-slate-100'} border-b`}>{title}</div>
    {children}
  </div>
);

const Input = ({ label, value, onChange, type = "text", className = "", disabled = false, maxLength, isDark }: any) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className={`text-[10px] font-black uppercase tracking-widest px-4 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      maxLength={maxLength}
      className={`w-full px-6 py-3.5 rounded-2xl font-bold transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:ring-4 focus:ring-violet-600' : 'bg-slate-50 border-none text-slate-900 focus:ring-4 focus:ring-blue-100'} disabled:opacity-50`}
    />
  </div>
);

// Función para ordenar IDs correctamente (numérico si es posible, sino alfabético)
const sortByIdNaturally = (a: string, b: string) => {
  const aNum = parseInt(a);
  const bNum = parseInt(b);
  
  // Si ambos son números, ordenar numéricamente
  if (!isNaN(aNum) && !isNaN(bNum)) {
    return aNum - bNum;
  }
  
  // Si no, ordenar alfabéticamente
  return a.localeCompare(b);
};

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
  const { isDark } = useDarkMode();
  
  const [activeSubTab, setActiveSubTab] = useState<'clients' | 'users' | 'references' | 'sellers' | 'correrias' | 'confeccionistas'>('clients');
  const clientFileRef = useRef<HTMLInputElement>(null);
  const referenceFileRef = useRef<HTMLInputElement>(null);
  const confeccionistaFileRef = useRef<HTMLInputElement>(null);

  // Pagination hooks for each table
  const clientsPagination = usePagination(1, 50);
  const confeccionistasPagination = usePagination(1, 50);
  const referencesPagination = usePagination(1, 50);
  const sellersPagination = usePagination(1, 50);
  const correriasPagination = usePagination(1, 50);
  const usersPagination = usePagination(1, 50);

  // Update pagination state when data changes
  React.useEffect(() => {
    sellersPagination.pagination.total = state.sellers.length;
    sellersPagination.pagination.totalPages = Math.ceil(state.sellers.length / sellersPagination.pagination.limit);
  }, [state.sellers.length, sellersPagination.pagination.limit]);

  React.useEffect(() => {
    correriasPagination.pagination.total = state.correrias.length;
    correriasPagination.pagination.totalPages = Math.ceil(state.correrias.length / correriasPagination.pagination.limit);
  }, [state.correrias.length, correriasPagination.pagination.limit]);

  React.useEffect(() => {
    usersPagination.pagination.total = state.users.length;
    usersPagination.pagination.totalPages = Math.ceil(state.users.length / usersPagination.pagination.limit);
  }, [state.users.length, usersPagination.pagination.limit]);

  const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SOPORTE;

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

  const [score, setScore] = useState('NA');
  const [consecRem, setConsecRem] = useState(0);
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estado modal cambio de PIN (solo soporte)
  const [changePinModal, setChangePinModal] = useState<{ loginCode: string; name: string } | null>(null);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [changePinLoading, setChangePinLoading] = useState(false);
  const [changePinError, setChangePinError] = useState('');

  // Estados para búsqueda
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [referenceSearchTerm, setReferenceSearchTerm] = useState('');
  const [confeccionistaSearchTerm, setConfeccionistaSearchTerm] = useState('');

  // Estados para autocompletado de correrías
  const [correriaSearch, setCorreriaSearch] = useState('');
  const [showCorreriaDropdown, setShowCorreriaDropdown] = useState(false);

  // Estados para autocompletado de vendedores
  const [sellerSearch, setSellerSearch] = useState('');
  const [showSellerDropdown, setShowSellerDropdown] = useState(false);

  // Filtros de búsqueda
  const filteredClients = useMemo(() => {
    return state.clients.filter(client => {
      const searchLower = clientSearchTerm.toLowerCase();
      const sellerName = state.sellers.find(s => s.id === client.sellerId)?.name || '';
      
      return (
        client.id.toLowerCase().includes(searchLower) ||
        client.name.toLowerCase().includes(searchLower) ||
        client.nit?.toLowerCase().includes(searchLower) ||
        sellerName.toLowerCase().includes(searchLower)
      );
    }).sort((a, b) => sortByIdNaturally(a.id, b.id));
  }, [state.clients, state.sellers, clientSearchTerm]);

  const filteredReferences = useMemo(() => {
    return state.references.filter(ref => {
      const searchLower = referenceSearchTerm.toLowerCase();
      
      return (
        ref.id.toLowerCase().includes(searchLower) ||
        ref.description.toLowerCase().includes(searchLower) ||
        ref.designer?.toLowerCase().includes(searchLower)
      );
    }).sort((a, b) => sortByIdNaturally(a.id, b.id));
  }, [state.references, referenceSearchTerm]);

  const filteredConfeccionistas = useMemo(() => {
    return (state.confeccionistas || []).filter(conf => {
      const searchLower = confeccionistaSearchTerm.toLowerCase();
      
      return (
        conf.id.toLowerCase().includes(searchLower) ||
        conf.name.toLowerCase().includes(searchLower) ||
        conf.phone?.toLowerCase().includes(searchLower)
      );
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [state.confeccionistas, confeccionistaSearchTerm]);

  // Update pagination for filtered data
  React.useEffect(() => {
    clientsPagination.pagination.total = filteredClients.length;
    clientsPagination.pagination.totalPages = Math.ceil(filteredClients.length / clientsPagination.pagination.limit);
  }, [filteredClients.length, clientsPagination.pagination.limit]);

  React.useEffect(() => {
    confeccionistasPagination.pagination.total = filteredConfeccionistas.length;
    confeccionistasPagination.pagination.totalPages = Math.ceil(filteredConfeccionistas.length / confeccionistasPagination.pagination.limit);
  }, [filteredConfeccionistas.length, confeccionistasPagination.pagination.limit]);

  React.useEffect(() => {
    referencesPagination.pagination.total = filteredReferences.length;
    referencesPagination.pagination.totalPages = Math.ceil(filteredReferences.length / referencesPagination.pagination.limit);
  }, [filteredReferences.length, referencesPagination.pagination.limit]);

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
    setScore('NA');
    setConsecRem(0);
    setPhone('');
    setIsActive(true);
    setSelectedCorrerias([]);
    setEditingId(null);
    setCorreriaSearch('');
    setShowCorreriaDropdown(false);
    setSellerSearch('');
    setShowSellerDropdown(false);
  };

  const handleChangePin = async () => {
    if (!changePinModal) return;
    if (!currentPin) { setChangePinError('Ingresa el PIN actual'); return; }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setChangePinError('El nuevo PIN debe tener exactamente 4 dígitos numéricos');
      return;
    }
    if (newPin !== confirmPin) {
      setChangePinError('Los PINs no coinciden');
      return;
    }
    setChangePinLoading(true);
    setChangePinError('');
    try {
      const result = await api.changePin(changePinModal.loginCode, currentPin, newPin);
      if (result.success) {
        setChangePinModal(null);
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
      } else {
        setChangePinError(result.message || 'Error al cambiar PIN');
      }
    } catch {
      setChangePinError('Error al cambiar PIN');
    } finally {
      setChangePinLoading(false);
    }
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
      
      setIsLoading(true);
      try {
        if (type === 'clients') {
          // Usar el nuevo endpoint de carga masiva
          try {
            const response = await fetch('/api/clients/bulk-import', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
              },
              body: JSON.stringify({ csvContent: content })
            });

            const result = await response.json();

            if (result.success) {
              // Recargar clientes desde el backend
              const clientsResponse = await fetch('/api/clients', {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
              });
              const clientsData = await clientsResponse.json();
              
              if (clientsData.success) {
                updateState(prev => ({
                  ...prev,
                  clients: clientsData.data
                }));
              }
              
              alert(`✅ ${result.message}`);
            } else {
              // Mostrar errores detallados
              const errorMsg = result.errors?.length > 0 
                ? `Errores encontrados:\n${result.errors.slice(0, 5).join('\n')}${result.errors.length > 5 ? `\n... y ${result.errors.length - 5} errores más` : ''}`
                : result.message;
              alert(`❌ Error en importación:\n${errorMsg}`);
            }
          } catch (error) {
            console.error('Error en carga masiva:', error);
            alert('❌ Error de conexión al importar clientes');
          }
          
        } else if (type === 'references') {
          // Usar el nuevo endpoint de carga masiva
          try {
            const response = await fetch('/api/references/bulk-import', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
              },
              body: JSON.stringify({ csvContent: content })
            });

            const result = await response.json();

            if (result.success) {
              // Recargar referencias desde el backend
              const referencesResponse = await fetch('/api/references', {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
              });
              const referencesData = await referencesResponse.json();
              
              if (referencesData.success) {
                updateState(prev => ({
                  ...prev,
                  references: referencesData.data
                }));
              }
              
              alert(`✅ ${result.message}`);
            } else {
              // Mostrar errores detallados
              const errorMsg = result.errors?.length > 0 
                ? `Errores encontrados:\n${result.errors.slice(0, 5).join('\n')}${result.errors.length > 5 ? `\n... y ${result.errors.length - 5} errores más` : ''}`
                : result.message;
              alert(`❌ Error en importación:\n${errorMsg}`);
            }
          } catch (error) {
            console.error('Error en carga masiva:', error);
            alert('❌ Error de conexión al importar referencias');
          }
          
        } else if (type === 'confeccionistas') {
          // Usar el nuevo endpoint de carga masiva
          try {
            const response = await fetch('/api/confeccionistas/bulk-import', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
              },
              body: JSON.stringify({ csvContent: content })
            });

            const result = await response.json();

            if (result.success) {
              // Recargar confeccionistas desde el backend
              const confeccionistasResponse = await fetch('/api/confeccionistas', {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
              });
              const confeccionistasData = await confeccionistasResponse.json();
              
              if (confeccionistasData.success) {
                updateState(prev => ({
                  ...prev,
                  confeccionistas: confeccionistasData.data
                }));
              }
              
              alert(`✅ ${result.message}`);
            } else {
              // Mostrar errores detallados
              const errorMsg = result.errors?.length > 0 
                ? `Errores encontrados:\n${result.errors.slice(0, 5).join('\n')}${result.errors.length > 5 ? `\n... y ${result.errors.length - 5} errores más` : ''}`
                : result.message;
              alert(`❌ Error en importación:\n${errorMsg}`);
            }
          } catch (error) {
            console.error('Error en carga masiva:', error);
            alert('❌ Error de conexión al importar confeccionistas');
          }
        }
        
      } catch (error) {
        console.error('Error en importación:', error);
        alert('Error durante la importación. Revisa la consola para más detalles.');
      } finally {
        setIsLoading(false);
        if(e.target) e.target.value = '';
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleSaveClient = async () => {
    if (!id || !name) return alert("ID y Nombre son obligatorios");
    if (!seller) return alert("Debe seleccionar un vendedor");
    
    const newItem: Client = { id, name, nit, address, city, sellerId: seller };
    
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
    const newItem: Confeccionista = { id, name, address, city, phone, score, active: isActive, ConsecRem: consecRem };
    
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
    if (!id) return alert("Código de usuario obligatorio");
    if (!pin) return alert("PIN obligatorio");
    
    // Normalizar el rol a minúsculas para el backend
    const normalizedRole = userRole.toLowerCase() as UserRole;
    const newItem = { name, loginCode: id, pin, role: normalizedRole };
    
    setIsLoading(true);
    try {
      let result;
      
      if (editingId) {
        // Actualizar usuario existente
        result = await onUpdateUser(editingId, newItem);
      } else {
        // Crear nuevo usuario - no incluir ID, el backend lo genera
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
      price: Number(price) || 0, 
      designer, 
      cloth1, 
      avgCloth1: Number(avgCloth1) || 0, 
      cloth2, 
      avgCloth2: Number(avgCloth2) || 0,
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
        if (result.success) {
          updateState(prev => ({
            ...prev,
            correrias: prev.correrias.map(c => c.id === editingId ? newItem : c)
          }));
        }
      } else {
        // Crear nueva correría
        result = await onAddCorreria(newItem);
        if (result.success) {
          updateState(prev => ({
            ...prev,
            correrias: [...prev.correrias, newItem]
          }));
        }
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
    if (!isAdmin && (type === 'user' || type === 'seller' || type === 'confeccionista' || type === 'correria')) return;
    if (!confirm("¿Seguro que desea eliminar este registro?")) return;
    
    setIsLoading(true);
    try {
      let result;
      
      if (type === 'client') {
        // Eliminar cliente del backend
        result = await onDeleteClient(targetId);
        if (result?.success) {
          updateState(prev => ({
            ...prev,
            clients: prev.clients.filter(c => c.id !== targetId)
          }));
        }
      } else if (type === 'confeccionista') {
        // Eliminar confeccionista del backend
        result = await onDeleteConfeccionista(targetId);
        if (result?.success) {
          updateState(prev => ({
            ...prev,
            confeccionistas: (prev.confeccionistas || []).filter(c => c.id !== targetId)
          }));
        }
      } else if (type === 'reference') {
        // Eliminar referencia del backend
        result = await onDeleteReference(targetId);
        if (result?.success) {
          updateState(prev => ({
            ...prev,
            references: prev.references.filter(r => r.id !== targetId)
          }));
        }
      } else if (type === 'seller') {
        // Eliminar vendedor del backend
        result = await onDeleteSeller(targetId);
        if (result?.success) {
          updateState(prev => ({
            ...prev,
            sellers: prev.sellers.filter(s => s.id !== targetId)
          }));
        }
      } else if (type === 'correria') {
        // Eliminar correría del backend
        result = await onDeleteCorreria(targetId);
        if (result?.success) {
          updateState(prev => ({
            ...prev,
            correrias: prev.correrias.filter(c => c.id !== targetId)
          }));
        }
      } else if (type === 'user') {
        // Eliminar usuario del backend
        if (targetId === user.id) {
          alert("No puedes eliminar tu propio usuario");
          setIsLoading(false);
          return;
        }
        result = await onDeleteUser(targetId);
        if (result?.success) {
          updateState(prev => ({
            ...prev,
            users: prev.users.filter(u => u.id !== targetId)
          }));
        }
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
    <div className={`space-y-8 pb-20 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-white'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-3xl font-black tracking-tighter transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Maestros</h2>
          <p className={`font-medium transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Configuración de base de datos</p>
        </div>
      </div>

      <div className={`flex flex-wrap gap-2 p-1.5 rounded-3xl shadow-sm w-fit transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'} border`}>
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
              <FormWrapper isDark={isDark} title={editingId ? 'Editar Cliente' : 'Nuevo Cliente'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input isDark={isDark} label="ID Cliente" value={id} onChange={setId} disabled={!!editingId} />
                  <Input isDark={isDark} label="NIT" value={nit} onChange={setNit} />
                  <Input isDark={isDark} label="Nombre del Cliente" value={name} onChange={setName} />
                  <Input isDark={isDark} label="Dirección" value={address} onChange={setAddress} />
                  <Input isDark={isDark} label="Ciudad" value={city} onChange={setCity} />
                  
                  {/* DROPDOWN DE VENDEDORES */}
                  <div className="md:col-span-2 space-y-1.5 relative" data-seller-dropdown>
                    <label className={`text-[10px] font-black uppercase tracking-widest px-4 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Vendedor</label>
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
                        className={`w-full px-6 py-3.5 border-none rounded-2xl font-bold focus:ring-4 transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] text-violet-100 placeholder-violet-600 focus:ring-violet-600' : 'bg-slate-50 text-slate-900 focus:ring-blue-100'}`}
                      />
                      
                      {/* Botón para limpiar */}
                      {sellerSearch && (
                        <button
                          onClick={() => {
                            setSellerSearch('');
                            setSeller('');
                          }}
                          className={`absolute right-4 top-1/2 -translate-y-1/2 font-black text-xl transition-colors duration-300 ${isDark ? 'text-violet-400 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}
                        >
                          ×
                        </button>
                      )}
                    </div>
                    
                    {/* Dropdown de vendedores */}
                    {showSellerDropdown && (
                      <div className={`absolute top-full left-0 mt-2 w-full border-2 rounded-2xl shadow-lg z-50 max-h-60 overflow-y-auto transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'}`}>
                        {state.sellers
                          .filter(s => 
                            s.name.toLowerCase().includes(sellerSearch.toLowerCase())
                          )
                          .map(s => (
                            <button
                              key={s.id}
                              onClick={() => {
                                setSeller(s.id);
                                setSellerSearch(s.name);
                                setShowSellerDropdown(false);
                              }}
                              className={`w-full px-6 py-3 text-left transition-colors duration-300 border-b last:border-b-0 ${isDark ? 'hover:bg-violet-700/40 border-violet-700/50 text-violet-200' : 'hover:bg-blue-50 border-slate-100 text-slate-900'}`}
                            >
                              <p className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{s.name}</p>
                            </button>
                          ))}
                        {state.sellers.filter(s => 
                          s.name.toLowerCase().includes(sellerSearch.toLowerCase())
                        ).length === 0 && (
                          <div className={`px-6 py-4 text-center font-bold transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>
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
                  {editingId && <button onClick={resetForms} className={`px-6 py-4 font-bold rounded-2xl transition-colors duration-300 ${isDark ? 'bg-violet-900/40 text-violet-300 hover:bg-violet-900/60' : 'bg-slate-100 text-slate-400'}`}>CANCELAR</button>}
                </div>
              </FormWrapper>
            </div>
            <div className="lg:col-span-1">
              <div className={`p-8 rounded-[32px] shadow-sm border space-y-4 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
                <h3 className={`text-xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Importar Clientes</h3>
                <p className={`text-[10px] font-bold leading-relaxed transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>CSV: <span className={`transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>id,name,nit,address,city,seller</span></p>
                <p className={`text-[9px] font-bold italic mt-2 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>
                  Ejemplo:<br/>
                  <span className={`font-mono transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-600'}`}>C001,Acme Inc,123456,Cra 5 #10,Bogotá,Juan Pérez</span><br/>
                  <span className={`font-mono transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-600'}`}>C002,Tech Ltd,789012,Cra 7 #20,Medellín,María García</span>
                </p>
                <div className="flex gap-2">
                  <input type="file" ref={clientFileRef} onChange={(e) => handleImportCSV('clients', e)} accept=".csv" className="hidden" />
                  <button onClick={() => clientFileRef.current?.click()} className={`flex-1 py-4 font-black rounded-2xl border-2 border-dashed transition-colors duration-300 ${isDark ? 'bg-violet-900/20 text-violet-300 border-violet-700 hover:bg-violet-900/40' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-blue-50'}`}>SUBIR CSV</button>
                  <a href="/ejemplo_clientes.csv" download className={`flex-1 py-4 font-black rounded-2xl border-2 transition-colors duration-300 text-center ${isDark ? 'bg-blue-900/20 text-blue-300 border-blue-700 hover:bg-blue-900/40' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'}`}>DESCARGAR EJEMPLO</a>
                </div>
              </div>
            </div>
          </div>
          <TableWrapper isDark={isDark} title={
            <div className="flex items-center justify-between">
              <span>Listado de Clientes</span>
              <div className="relative">
                <input
                  type="text"
                  value={clientSearchTerm}
                  onChange={(e) => setClientSearchTerm(e.target.value)}
                  placeholder="Buscar cliente..."
                  className={`px-4 py-2 border-2 rounded-xl text-sm font-bold outline-none w-64 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-600 focus:ring-2 focus:ring-violet-600' : 'bg-white border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-200 focus:border-blue-400'}`}
                />
                {clientSearchTerm && (
                  <button
                    onClick={() => setClientSearchTerm('')}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 font-black transition-colors duration-300 ${isDark ? 'text-violet-400 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          }>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className={`transition-colors duration-300 ${isDark ? 'bg-[#5a4a75]' : 'bg-slate-50/50'}`}><th className={`px-8 py-4 text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>ID</th><th className={`px-8 py-4 text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>NIT</th><th className={`px-8 py-4 text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Cliente</th><th className={`px-8 py-4 text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Ciudad</th><th className={`px-8 py-4 text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Vendedor</th><th className={`px-8 py-4 text-right transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Acción</th></tr></thead>
                <tbody className={`divide-y transition-colors duration-300 ${isDark ? 'divide-violet-700/50' : 'divide-slate-100'}`}>
                  {filteredClients.slice((clientsPagination.pagination.page - 1) * clientsPagination.pagination.limit, clientsPagination.pagination.page * clientsPagination.pagination.limit).map(c => {
                    const seller = state.sellers.find(s => s.id === c.sellerId);
                    return (
                    <tr key={c.id} className={`transition-colors duration-300 ${isDark ? 'hover:bg-violet-700/20' : 'hover:bg-slate-50'}`}>
                      <td className={`px-8 py-4 font-bold transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>{c.id}</td>
                      <td className={`px-8 py-4 font-bold transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>{c.nit}</td>
                      <td className={`px-8 py-4 font-black transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{c.name}</td>
                      <td className={`px-8 py-4 font-bold transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>{c.city || '—'}</td>
                      <td className={`px-8 py-4 font-bold uppercase text-[10px] transition-colors duration-300 ${isDark ? 'text-pink-400' : 'text-pink-500'}`}>{seller?.name || c.sellerId || 'Sin vendedor'}</td>
                      <td className="px-8 py-4 text-right flex justify-end gap-2">
                        <button disabled={!canEdit(user)} onClick={() => { setEditingId(c.id); setId(c.id); setNit(c.nit); setName(c.name); setAddress(c.address); setCity(c.city); setSeller(c.sellerId); setSellerSearch(seller?.name || ''); }} className={`p-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${isDark ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}><Icons.Edit /></button>
                        <button disabled={!canDelete(user)} onClick={() => handleDelete('client', c.id)} className={`p-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${isDark ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}><Icons.Delete /></button>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>
            <PaginationComponent 
              currentPage={clientsPagination.pagination.page}
              totalPages={clientsPagination.pagination.totalPages}
              pageSize={clientsPagination.pagination.limit}
              onPageChange={clientsPagination.goToPage}
              onPageSizeChange={clientsPagination.setLimit}
            />
          </TableWrapper>
        </div>
      )}

      {activeSubTab === 'confeccionistas' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FormWrapper isDark={isDark} title={editingId ? 'Editar Confeccionista' : 'Nuevo Confeccionista'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input isDark={isDark} label="Cédula" value={id} onChange={setId} disabled={!!editingId} />
                  <Input isDark={isDark} label="Nombre / Razón Social" value={name} onChange={setName} />
                  <Input isDark={isDark} label="Dirección" value={address} onChange={setAddress} />
                  <Input isDark={isDark} label="Ciudad" value={city} onChange={setCity} />
                  <Input isDark={isDark} label="Celular" value={phone} onChange={setPhone} />
                  <div className="flex gap-3">
                    <div className="space-y-1.5 flex-1">
                      <label className={`text-[10px] font-black uppercase tracking-widest px-4 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Puntaje</label>
                      <select
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        className={`w-full px-6 py-3.5 border-none rounded-2xl font-bold focus:ring-4 transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] text-violet-100 focus:ring-violet-600' : 'bg-slate-50 text-slate-900 focus:ring-blue-100'}`}
                      >
                        <option value="NA">NA</option>
                        <option value="A">A</option>
                        <option value="AA">AA</option>
                        <option value="AAA">AAA</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <label className={`text-[10px] font-black uppercase tracking-widest px-4 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Consec. Rem</label>
                      <input
                        type="number"
                        min={0}
                        value={consecRem}
                        onChange={(e) => setConsecRem(Number(e.target.value))}
                        onFocus={(e) => e.target.select()}
                        className={`w-full px-6 py-3.5 border-none rounded-2xl font-bold focus:ring-4 transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] text-violet-100 focus:ring-violet-600' : 'bg-slate-50 text-slate-900 focus:ring-blue-100'}`}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest px-4 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Estado Activo</label>
                    <div className="flex gap-2">
                       <button onClick={() => setIsActive(true)} className={`flex-1 py-3.5 rounded-2xl font-bold transition-all transition-colors duration-300 ${isActive ? (isDark ? 'bg-blue-700 text-white shadow-lg' : 'bg-blue-600 text-white shadow-lg') : (isDark ? 'bg-violet-900/40 text-violet-300' : 'bg-slate-100 text-slate-400')}`}>SÍ (Activo)</button>
                       <button onClick={() => setIsActive(false)} className={`flex-1 py-3.5 rounded-2xl font-bold transition-all transition-colors duration-300 ${!isActive ? (isDark ? 'bg-red-700 text-white shadow-lg' : 'bg-red-500 text-white shadow-lg') : (isDark ? 'bg-violet-900/40 text-violet-300' : 'bg-slate-100 text-slate-400')}`}>NO (Inactivo)</button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={handleSaveConfeccionista}
                    disabled={isLoading}
                      className={`px-10 py-4 font-black rounded-2xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${isDark ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                      {isLoading ? 'GUARDANDO...' : 'GUARDAR CONFECCIONISTA'}
                    </button>
                  {editingId && <button onClick={resetForms} className={`px-6 py-4 font-bold rounded-2xl transition-colors duration-300 ${isDark ? 'bg-violet-900/40 text-violet-300 hover:bg-violet-900/60' : 'bg-slate-100 text-slate-400'}`}>CANCELAR</button>}
                </div>
              </FormWrapper>
            </div>
            <div className="lg:col-span-1">
              <div className={`p-8 rounded-[32px] shadow-sm border space-y-4 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
                <h3 className={`text-xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Importar Confeccionistas</h3>
                <p className={`text-[10px] font-bold italic transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>
                  CSV: <span className={`font-black transition-colors duration-300 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}>id,name,address,city,phone,score,active</span>
                </p>
                <p className={`text-[9px] font-bold italic transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>
                  Score: A/AA/AAA/NA | Activo: 1/0
                </p>
                <div className="flex gap-2">
                  <input type="file" ref={confeccionistaFileRef} onChange={(e) => handleImportCSV('confeccionistas', e)} accept=".csv" className="hidden" />
                  <button onClick={() => confeccionistaFileRef.current?.click()} className={`flex-1 py-4 font-black rounded-2xl border-2 border-dashed transition-colors duration-300 ${isDark ? 'bg-violet-900/20 text-violet-300 border-violet-700 hover:bg-violet-900/40' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-indigo-50'}`}>SUBIR CSV</button>
                  <a href="/ejemplo_confeccionistas.csv" download className={`flex-1 py-4 font-black rounded-2xl border-2 transition-colors duration-300 text-center ${isDark ? 'bg-indigo-900/20 text-indigo-300 border-indigo-700 hover:bg-indigo-900/40' : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'}`}>DESCARGAR EJEMPLO</a>
                </div>
              </div>
            </div>
          </div>
          <TableWrapper isDark={isDark} title={
            <div className="flex items-center justify-between">
              <span>Listado de Confeccionistas</span>
              <div className="relative">
                <input
                  type="text"
                  value={confeccionistaSearchTerm}
                  onChange={(e) => setConfeccionistaSearchTerm(e.target.value)}
                  placeholder="Buscar confeccionista..."
                  className={`px-4 py-2 border-2 rounded-xl text-sm font-bold outline-none w-64 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-600 focus:ring-2 focus:ring-violet-600' : 'bg-white border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-200 focus:border-blue-400'}`}
                />
                {confeccionistaSearchTerm && (
                  <button
                    onClick={() => setConfeccionistaSearchTerm('')}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 font-black transition-colors duration-300 ${isDark ? 'text-violet-400 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          }>
            <table className="w-full text-left">
              <thead><tr className={`transition-colors duration-300 ${isDark ? 'bg-[#5a4a75]' : 'bg-slate-50/50'}`}><th className={`px-8 py-4 text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Cédula</th><th className={`px-8 py-4 text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Nombre</th><th className={`px-8 py-4 text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Celular</th><th className={`px-8 py-4 text-[10px] font-black uppercase text-center transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Score</th><th className={`px-8 py-4 text-[10px] font-black uppercase text-center transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Estado</th><th className={`px-8 py-4 text-[10px] font-black uppercase text-center transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Consec. Rem</th><th className={`px-8 py-4 text-right transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Acción</th></tr></thead>
              <tbody className={`divide-y transition-colors duration-300 ${isDark ? 'divide-violet-700/50' : 'divide-slate-100'}`}>
                {filteredConfeccionistas.slice((confeccionistasPagination.pagination.page - 1) * confeccionistasPagination.pagination.limit, confeccionistasPagination.pagination.page * confeccionistasPagination.pagination.limit).map(c => (
                  <tr key={c.id} className={`transition-colors duration-300 ${isDark ? 'hover:bg-violet-700/20' : 'hover:bg-slate-50'}`}>
                    <td className={`px-8 py-4 font-bold transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-slate-400'}`}>{c.id}</td>
                    <td className={`px-8 py-4 font-black transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{c.name}</td>
                    <td className={`px-8 py-4 font-bold transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>{c.phone}</td>
                    <td className={`px-8 py-4 text-center font-black transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{c.score}</td>
                    <td className="px-8 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-colors duration-300 ${c.active ? (isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600') : (isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600')}`}>
                        {c.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className={`px-8 py-4 text-center font-bold transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>{c.ConsecRem ?? 0}</td>
                    <td className="px-8 py-4 text-right flex justify-end gap-2">
                      <button disabled={!canEdit(user)} onClick={() => { 
                        setEditingId(c.id); setId(c.id); setName(c.name); setAddress(c.address); setCity(c.city); setPhone(c.phone); setScore(c.score); setIsActive(c.active); setConsecRem(c.ConsecRem ?? 0);
                      }} className={`p-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${isDark ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}><Icons.Edit /></button>
                      <button disabled={!canDelete(user)} onClick={() => handleDelete('confeccionista', c.id)} className={`p-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${isDark ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}><Icons.Delete /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PaginationComponent 
              currentPage={confeccionistasPagination.pagination.page}
              totalPages={confeccionistasPagination.pagination.totalPages}
              pageSize={confeccionistasPagination.pagination.limit}
              onPageChange={confeccionistasPagination.goToPage}
              onPageSizeChange={confeccionistasPagination.setLimit}
            />
          </TableWrapper>
        </div>
      )}

      {activeSubTab === 'references' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FormWrapper isDark={isDark} title={editingId ? 'Editar Referencia' : 'Nueva Referencia'}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Input isDark={isDark} label="Referencia" value={id} onChange={setId} disabled={!!editingId} />
                  <Input isDark={isDark} label="Descripción" value={desc} onChange={setDesc} className="md:col-span-3" />
                  <Input isDark={isDark} label="Precio Venta" type="number" value={price} onChange={(v: string) => setPrice(Number(v))} />
                  <Input isDark={isDark} label="Diseñadora" value={designer} onChange={setDesigner} />
                  <Input isDark={isDark} label="Tela 1" value={cloth1} onChange={setCloth1} />
                  <Input isDark={isDark} label="Prom. Tela 1" type="number" value={avgCloth1} onChange={(v: string) => setAvgCloth1(Number(v))} />
                  <Input isDark={isDark} label="Tela 2" value={cloth2} onChange={setCloth2} />
                  <Input isDark={isDark} label="Prom. Tela 2" type="number" value={avgCloth2} onChange={(v: string) => setAvgCloth2(Number(v))} />
                  
                  {/* SELECTOR DE CORRERÍAS CON AUTOCOMPLETADO */}
                  <div className="md:col-span-4 space-y-3">
                    <label className={`text-[10px] font-black uppercase tracking-widest px-4 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>
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
                        className={`w-full px-6 py-3.5 border-2 rounded-2xl font-bold focus:ring-4 transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-600 focus:ring-violet-600' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-100 focus:border-blue-300'}`}
                      />
                      
                      {/* Dropdown de correrías */}
                      {showCorreriaDropdown && (
                        <div className={`absolute top-full left-0 mt-2 w-full border-2 rounded-2xl shadow-lg z-50 max-h-60 overflow-y-auto transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'}`}>
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
                                className={`w-full px-6 py-3 text-left transition-colors duration-300 border-b last:border-b-0 flex items-center justify-between group ${isDark ? 'hover:bg-violet-700/40 border-violet-700/50' : 'hover:bg-blue-50 border-slate-100'}`}
                              >
                                <div>
                                  <p className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{correria.name}</p>
                                  <p className={`text-[10px] font-bold transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>{correria.year}</p>
                                </div>
                                {selectedCorrerias.includes(correria.id) && (
                                  <span className={`font-black transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>✓</span>
                                )}
                              </button>
                            ))}
                          {state.correrias.filter(c => 
                            `${c.name} ${c.year}`.toLowerCase().includes(correriaSearch.toLowerCase())
                          ).length === 0 && (
                            <div className={`px-6 py-4 text-center font-bold transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>
                              No se encontraron correrías
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Cajoncito con correrías seleccionadas */}
                    <div className={`p-4 rounded-2xl border-2 min-h-[60px] transition-colors duration-300 ${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                      {selectedCorrerias.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedCorrerias.map(correriaId => {
                            const correria = state.correrias.find(c => c.id === correriaId);
                            return correria ? (
                              <div
                                key={correriaId}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 shadow-sm transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-blue-700' : 'bg-white border-blue-300'}`}
                              >
                                <div>
                                  <p className={`font-black text-xs transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{correria.name}</p>
                                  <p className={`text-[9px] font-bold transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>{correria.year}</p>
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedCorrerias(selectedCorrerias.filter(id => id !== correriaId));
                                  }}
                                  className={`ml-2 font-black text-lg leading-none rounded-full w-6 h-6 flex items-center justify-center transition-colors duration-300 ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-500 hover:bg-red-50'}`}
                                >
                                  ×
                                </button>
                              </div>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <p className={`text-xs font-bold text-center transition-colors duration-300 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                          ⚠️ Debe seleccionar al menos una correría
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={handleSaveReference}
                    disabled={isLoading}
                      className={`px-10 py-4 font-black rounded-2xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${isDark ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                      {isLoading ? 'GUARDANDO...' : 'GUARDAR REFERENCIA'}
                    </button>
                  {editingId && <button onClick={resetForms} className={`px-6 py-4 font-bold rounded-2xl transition-colors duration-300 ${isDark ? 'bg-violet-900/40 text-violet-300 hover:bg-violet-900/60' : 'bg-slate-100 text-slate-400'}`}>CANCELAR</button>}
                </div>
              </FormWrapper>
            </div>
            <div className="lg:col-span-1">
              <div className={`p-8 rounded-[32px] shadow-sm border space-y-4 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
                <h3 className={`text-xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Importar Referencias</h3>
                <p className={`text-[10px] font-bold leading-relaxed transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>
                  CSV: <span className={`transition-colors duration-300 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}>id,description,price,designer,cloth1,avgCloth1,cloth2,avgCloth2,correrias</span>
                </p>
                <p className={`text-[9px] font-bold italic mt-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>
                  Correrías separadas por | (ej: Madres2026|Padres2026|Navidad2026)
                </p>
                <div className="flex gap-2">
                  <input type="file" ref={referenceFileRef} onChange={(e) => handleImportCSV('references', e)} accept=".csv" className="hidden" />
                  <button onClick={() => referenceFileRef.current?.click()} className={`flex-1 py-4 font-black rounded-2xl border-2 border-dashed transition-colors duration-300 ${isDark ? 'bg-violet-900/20 text-violet-300 border-violet-700 hover:bg-violet-900/40' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-indigo-50'}`}>SUBIR CSV</button>
                  <a href="/ejemplo_referencias.csv" download className={`flex-1 py-4 font-black rounded-2xl border-2 transition-colors duration-300 text-center ${isDark ? 'bg-indigo-900/20 text-indigo-300 border-indigo-700 hover:bg-indigo-900/40' : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'}`}>DESCARGAR EJEMPLO</a>
                </div>
              </div>
            </div>
          </div>
          <TableWrapper isDark={isDark} title={
            <div className="flex items-center justify-between">
              <span>Listado de Referencias</span>
              <div className="relative">
                <input
                  type="text"
                  value={referenceSearchTerm}
                  onChange={(e) => setReferenceSearchTerm(e.target.value)}
                  placeholder="Buscar referencia..."
                  className={`px-4 py-2 border-2 rounded-xl text-sm font-bold outline-none w-64 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-600 focus:ring-2 focus:ring-violet-600' : 'bg-white border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-200 focus:border-blue-400'}`}
                />
                {referenceSearchTerm && (
                  <button
                    onClick={() => setReferenceSearchTerm('')}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 font-black transition-colors duration-300 ${isDark ? 'text-violet-400 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          }>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead><tr className={`transition-colors duration-300 ${isDark ? 'bg-[#5a4a75]' : 'bg-slate-50/50'}`}><th className={`px-6 py-4 text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Ref</th><th className={`px-6 py-4 text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Descripción</th><th className={`px-6 py-4 text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Precio</th><th className={`px-6 py-4 text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Diseñadora</th><th className={`px-6 py-4 text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Telas / Prom</th><th className={`px-6 py-4 text-right transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Acción</th></tr></thead>
                <tbody className={`divide-y transition-colors duration-300 ${isDark ? 'divide-violet-700/50' : 'divide-slate-100'}`}>
                  {filteredReferences.slice((referencesPagination.pagination.page - 1) * referencesPagination.pagination.limit, referencesPagination.pagination.page * referencesPagination.pagination.limit).map(r => (
                    <tr key={r.id} className={`transition-colors duration-300 ${isDark ? 'hover:bg-violet-700/20' : 'hover:bg-slate-50'}`}>
                      <td className={`px-6 py-4 font-black transition-colors duration-300 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{r.id}</td>
                      <td className={`px-6 py-4 font-black transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-900'}`}>{r.description}</td>
                      <td className={`px-6 py-4 font-bold transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>$ {Math.round(r.price).toLocaleString('es-CO')}</td>
                      <td className={`px-6 py-4 font-bold transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>{r.designer || <span className={`italic transition-colors duration-300 ${isDark ? 'text-violet-600' : 'text-slate-300'}`}>—</span>}</td>
                      <td className={`px-6 py-4 text-[10px] space-y-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>
                        {r.cloth1 ? (
                          <>
                            <div className="flex gap-2">
                              <span className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>{r.cloth1}:</span> <span>{r.avgCloth1}</span>
                            </div>
                            {r.cloth2 && (
                              <div className="flex gap-2">
                                <span className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>{r.cloth2}:</span> <span>{r.avgCloth2}</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className={`italic transition-colors duration-300 ${isDark ? 'text-violet-600' : 'text-slate-400'}`}>Sin telas</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button disabled={!canEdit(user)} onClick={() => { 
                          setEditingId(r.id); 
                          setId(r.id); 
                          setDesc(r.description); 
                          setPrice(Number(r.price) || 0); 
                          setDesigner(r.designer); 
                          setCloth1(r.cloth1||''); 
                          setAvgCloth1(Number(r.avgCloth1) || 0);
                          setCloth2(r.cloth2||''); 
                          setAvgCloth2(Number(r.avgCloth2) || 0);
                          setSelectedCorrerias(r.correrias || []);
                        }} className={`p-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${isDark ? 'bg-indigo-900/30 text-indigo-400 hover:bg-indigo-900/50' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}><Icons.Edit /></button>
                        <button disabled={!canDelete(user)} onClick={() => handleDelete('reference', r.id)} className={`p-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${isDark ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}><Icons.Delete /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationComponent 
              currentPage={referencesPagination.pagination.page}
              totalPages={referencesPagination.pagination.totalPages}
              pageSize={referencesPagination.pagination.limit}
              onPageChange={referencesPagination.goToPage}
              onPageSizeChange={referencesPagination.setLimit}
            />
          </TableWrapper>
        </div>
      )}

      {activeSubTab === 'sellers' && (
        <div className="space-y-6 animate-in fade-in duration-300">
           {isAdmin ? (
             <FormWrapper isDark={isDark} title={editingId ? 'Editar Vendedor' : 'Nuevo Vendedor'}>
                <div className="max-w-md space-y-4">
                   <Input isDark={isDark} label="Nombre del Vendedor" value={name} onChange={setName} />
                   <div className="flex gap-4">
                      <button onClick={handleSaveSeller}
                    disabled={isLoading}
                      className={`px-10 py-4 font-black rounded-2xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${isDark ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                      {isLoading ? 'GUARDANDO...' : 'GUARDAR VENDEDOR'}
                    </button>
                      {editingId && <button onClick={resetForms} className={`px-6 py-4 font-bold rounded-2xl transition-colors duration-300 ${isDark ? 'bg-violet-900/40 text-violet-300 hover:bg-violet-900/60' : 'bg-slate-100 text-slate-400'}`}>CANCELAR</button>}
                   </div>
                </div>
             </FormWrapper>
           ) : (
             <div className={`border p-6 rounded-3xl flex items-center gap-4 font-bold transition-colors duration-300 ${isDark ? 'bg-amber-900/20 border-amber-700 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
               </svg>
               Se requiere acceso de administrador para crear o editar vendedores.
             </div>
           )}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {state.sellers.map(s => (
                <div key={s.id} className={`p-6 rounded-3xl border flex items-center justify-between shadow-sm transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
                   <p className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{s.name}</p>
                   {isAdmin && (
                    <div className="flex gap-2">
                      <button disabled={!canEdit(user)} onClick={() => { setEditingId(s.id); setName(s.name); }} className={`p-2 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'text-pink-400 hover:bg-pink-900/30' : 'text-pink-400 hover:bg-pink-50'}`}><Icons.Edit /></button>
                      <button disabled={!canDelete(user)} onClick={() => handleDelete('seller', s.id)} className={`p-2 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-400 hover:bg-red-50'}`}><Icons.Delete /></button>
                    </div>
                   )}
                </div>
              ))}
           </div>
        </div>
      )}

      {activeSubTab === 'correrias' && (
        <div className="space-y-6 animate-in fade-in duration-300">
           {isAdmin ? (
             <FormWrapper isDark={isDark} title={editingId ? 'Editar Correría' : 'Nueva Correría'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                   <Input isDark={isDark} label="Nombre de Campaña" value={name} onChange={setName} />
                   <Input isDark={isDark} label="Año" value={year} onChange={setYear} type="number" />
                </div>
                <div className="flex gap-4 mt-6">
                   <button onClick={handleSaveCorreria}
                      disabled={isLoading}
                        className={`px-10 py-4 font-black rounded-2xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${isDark ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                        {isLoading ? 'GUARDANDO...' : 'GUARDAR CORRERÍA'}
                      </button>
                   {editingId && <button onClick={resetForms} className={`px-6 py-4 font-bold rounded-2xl transition-colors duration-300 ${isDark ? 'bg-violet-900/40 text-violet-300 hover:bg-violet-900/60' : 'bg-slate-100 text-slate-400'}`}>CANCELAR</button>}
                </div>
             </FormWrapper>
           ) : (
             <div className={`border p-6 rounded-3xl flex items-center gap-4 font-bold transition-colors duration-300 ${isDark ? 'bg-amber-900/20 border-amber-700 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
               </svg>
               Se requiere acceso de administrador para crear o editar correrías.
             </div>
           )}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {state.correrias.sort((a,b)=>b.year.localeCompare(a.year)).map(c => (
                <div key={c.id} className={`p-6 rounded-3xl border flex items-center justify-between shadow-sm transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
                   <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-300'}`}>{c.year}</p>
                      <p className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{c.name}</p>
                   </div>
                   {isAdmin && (
                     <div className="flex gap-2">
                      <button disabled={!canEdit(user)} onClick={() => { setEditingId(c.id); setName(c.name); setYear(c.year); }} className={`p-2 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'text-blue-400 hover:bg-blue-900/30' : 'text-blue-400 hover:bg-blue-50'}`}><Icons.Edit /></button>
                      <button disabled={!canDelete(user)} onClick={() => handleDelete('correria', c.id)} className={`p-2 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-400 hover:bg-red-50'}`}><Icons.Delete /></button>
                     </div>
                   )}
                </div>
              ))}
           </div>
        </div>
      )}

      {activeSubTab === 'users' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {isAdmin ? (
            <FormWrapper isDark={isDark} title={editingId ? 'Editar Usuario' : 'Nuevo Usuario'}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Input isDark={isDark} label="Nombre del Usuario" value={name} onChange={setName} />
                <Input isDark={isDark} label="Código (3 Letras)" value={id} onChange={setId} maxLength={3} disabled={!!editingId} />
                <Input isDark={isDark} label="PIN (4 Números)" value={pin} onChange={setPin} maxLength={4} type="password" />
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-widest px-4 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Rol del Usuario</label>
                  <select 
                    value={userRole} 
                    onChange={(e) => setUserRole(e.target.value as UserRole)}
                    className={`w-full px-6 py-3.5 border-none rounded-2xl font-bold focus:ring-4 transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] text-violet-100 focus:ring-violet-600' : 'bg-slate-50 text-slate-900 focus:ring-blue-100'}`}
                  >
                    <option value={UserRole.GENERAL}>General</option>
                    <option value={UserRole.OBSERVER}>Observador</option>
                    <option value={UserRole.DISEÑADORA}>Diseñadora</option>
                    <option value={UserRole.OPERADOR}>Operador</option>
                    <option value={UserRole.ADMIN}>Administrador</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                 <button onClick={handleSaveUser}
                    disabled={isLoading}
                      className={`px-10 py-4 font-black rounded-2xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${isDark ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                      {isLoading ? 'GUARDANDO...' : 'GUARDAR USUARIO'}
                    </button>
                 {editingId && <button onClick={resetForms} className={`px-6 py-4 font-bold rounded-2xl transition-colors duration-300 ${isDark ? 'bg-violet-900/40 text-violet-300 hover:bg-violet-900/60' : 'bg-slate-100 text-slate-400'}`}>CANCELAR</button>}
              </div>
            </FormWrapper>
          ) : (
            <div className={`border p-6 rounded-3xl flex items-center gap-4 font-bold transition-colors duration-300 ${isDark ? 'bg-amber-900/20 border-amber-700 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
               </svg>
               Solo los admins pueden crear o editar usuarios
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[...state.users].sort((a, b) => a.role.localeCompare(b.role)).slice((usersPagination.pagination.page - 1) * usersPagination.pagination.limit, usersPagination.pagination.page * usersPagination.pagination.limit).map(u => {
               const isSoporteUser = u.loginCode === 'SOP' && u.role === UserRole.SOPORTE;
               return (
               <div key={u.id} className={`p-8 rounded-[40px] border flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden transition-colors duration-300 ${isSoporteUser ? (isDark ? 'bg-amber-900/20 border-amber-700' : 'bg-amber-50 border-amber-200') : (isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100')}`}>
                  <RoleBadge role={u.role} />
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white font-black text-xl shadow-inner ${u.role === UserRole.ADMIN ? 'bg-gradient-to-br from-pink-500 to-pink-400' : u.role === UserRole.SOPORTE ? 'bg-gradient-to-br from-amber-500 to-amber-400' : u.role === UserRole.OBSERVER ? 'bg-gradient-to-br from-purple-500 to-purple-400' : u.role === UserRole.DISEÑADORA ? 'bg-gradient-to-br from-green-400 to-green-300' : u.role === UserRole.OPERADOR ? 'bg-gradient-to-br from-teal-500 to-teal-400' : 'bg-gradient-to-br from-blue-500 to-blue-400'}`}>
                    {u.loginCode}
                  </div>
                  <div>
                    <p className={`font-black text-lg leading-none mb-1 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{u.name}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-300'}`}>PIN: ****</p>
                  </div>
                  {isAdmin && (
                    <div className={`flex gap-3 w-full pt-4 border-t transition-colors duration-300 ${isDark ? 'border-violet-700/50' : 'border-slate-50'}`}>
                      <button 
                        onClick={() => { 
                          setEditingId(u.id); 
                          setName(u.name); 
                          setId(u.loginCode); 
                          setPin(u.pin); 
                          setUserRole(u.role); 
                        }} 
                        disabled={isSoporteUser}
                        className={`flex-1 py-2 font-black rounded-xl text-[10px] uppercase tracking-widest transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                      >
                        Editar
                      </button>
                      {user.role === UserRole.SOPORTE && (
                        <button
                          onClick={() => { setChangePinModal({ loginCode: u.loginCode, name: u.name }); setCurrentPin(''); setNewPin(''); setConfirmPin(''); setChangePinError(''); }}
                          className={`p-2 rounded-xl transition-colors duration-300 ${isDark ? 'bg-amber-900/30 text-amber-400 hover:bg-amber-900/50' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
                          title="Cambiar PIN"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
                          </svg>
                        </button>
                      )}
                      {u.id !== user.id && !isSoporteUser && (
                        <button 
                          onClick={() => handleDelete('user', u.id)} 
                          className={`p-2 rounded-xl transition-colors duration-300 ${isDark ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                        >
                          <Icons.Delete />
                        </button>
                      )}
                    </div>
                  )}
               </div>
             );
             })}
          </div>
          <PaginationComponent 
            currentPage={usersPagination.pagination.page}
            totalPages={usersPagination.pagination.totalPages}
            pageSize={usersPagination.pagination.limit}
            onPageChange={usersPagination.goToPage}
            onPageSizeChange={usersPagination.setLimit}
          />
        </div>
      )}

      {/* Modal cambio de PIN - solo soporte */}
      {changePinModal && (
      <div className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors duration-300 ${isDark ? 'bg-black/50' : 'bg-black/50'}`}>
        <div className={`rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}>
          <div className="bg-gradient-to-br from-amber-500 to-amber-400 px-6 pt-6 pb-8 relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Cambiar PIN</p>
                <h2 className="text-2xl font-black text-white">{changePinModal.name}</h2>
                <p className="text-white/80 text-sm mt-1">{changePinModal.loginCode}</p>
              </div>
              <button onClick={() => setChangePinModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className={`absolute -bottom-4 left-0 right-0 h-8 rounded-t-3xl transition-colors duration-300 ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}/>
          </div>
          <div className="px-6 pt-2 pb-6 flex flex-col gap-4">
            <div className="space-y-1.5">
              <label className={`text-[10px] font-black uppercase tracking-widest px-1 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>PIN Actual</label>
              <input
                type="password" maxLength={4} value={currentPin}
                onChange={e => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className={`w-full px-4 py-3 rounded-2xl font-bold focus:outline-none focus:ring-4 text-center text-xl tracking-widest transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] text-violet-100 focus:ring-amber-600' : 'bg-slate-50 text-slate-900 focus:ring-amber-100'}`}
              />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[10px] font-black uppercase tracking-widest px-1 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>PIN Nuevo</label>
              <input
                type="password" maxLength={4} value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className={`w-full px-4 py-3 rounded-2xl font-bold focus:outline-none focus:ring-4 text-center text-xl tracking-widest transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] text-violet-100 focus:ring-amber-600' : 'bg-slate-50 text-slate-900 focus:ring-amber-100'}`}
              />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[10px] font-black uppercase tracking-widest px-1 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Confirmar PIN Nuevo</label>
              <input
                type="password" maxLength={4} value={confirmPin}
                onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className={`w-full px-4 py-3 rounded-2xl font-bold focus:outline-none focus:ring-4 text-center text-xl tracking-widest transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] text-violet-100 focus:ring-amber-600' : 'bg-slate-50 text-slate-900 focus:ring-amber-100'}`}
              />
            </div>
            {changePinError && (
              <p className={`text-xs font-bold text-center transition-colors duration-300 ${isDark ? 'text-red-400' : 'text-red-500'}`}>{changePinError}</p>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={handleChangePin} disabled={changePinLoading}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black py-3 rounded-2xl text-sm transition-colors disabled:opacity-50">
                {changePinLoading ? 'Guardando...' : 'Cambiar PIN'}
              </button>
              <button onClick={() => setChangePinModal(null)}
                className={`flex-1 font-bold py-3 rounded-2xl text-sm transition-colors ${isDark ? 'bg-violet-900/40 text-violet-300 hover:bg-violet-900/60' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default MastersView;
