import React, { useState, useEffect } from 'react';
import { User, Reference, AppState, Correria, Order, Dispatch, BatchReception, DeliveryDate } from '../types';
import { api } from '../services/api';
import { useDarkMode } from '../context/DarkModeContext';

interface HistoricoReferenciaViewProps {
  user: User;
  onNavigate: (tab: string, options?: any) => void;
  state: AppState;
}

interface CorreriaDetail {
  correria: string;
  cantidadCortada: number;
  cantidadVendida: number;
  cantidadDespachada: number;
  clientes: Array<{
    cliente: string;
    cantidadPedida: number;
    cantidadDespachada: number;
  }>;
}

interface CorteRecord {
  id: string;
  numeroFicha: string;
  fechaCorte: string;
  cantidadCortada: number;
}

interface ProcesoRecord {
  id: string;
  remision: string;
  fechaRemision: string;
  cantidadSalida: number;
  confeccionista: string;
  fechaLlegada?: string;
  cantidadLlegada?: number;
}

interface TransporteRecord {
  fecha: string;
  taller: string;
  detalle: string;
  transportista: string;
}

interface FichaCosto {
  referencia: string;
  foto1?: string | null;
  foto2?: string | null;
}

const HistoricoReferenciaView: React.FC<HistoricoReferenciaViewProps> = ({ user, onNavigate, state }) => {
  const { isDark } = useDarkMode();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReference, setSelectedReference] = useState<Reference | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCorreriaModal, setShowCorreriaModal] = useState(false);
  const [selectedCorreriaDetail, setSelectedCorreriaDetail] = useState<CorreriaDetail | null>(null);
  const [showCortesModal, setShowCortesModal] = useState(false);
  
  // Datos reales de la base de datos
  const [corteRecords, setCorteRecords] = useState<CorteRecord[]>([]);
  const [procesoRecords, setProcesoRecords] = useState<ProcesoRecord[]>([]);
  const [transporteRecords, setTransporteRecords] = useState<TransporteRecord[]>([]);
  const [fichasCosto, setFichasCosto] = useState<FichaCosto[]>([]);
  const [cortesData, setCortesData] = useState<any[]>([]);

  // Obtener URL base para las fotos
  const getBaseUrl = (): string => {
    if (window.API_CONFIG?.getApiUrl) {
      const apiUrl = window.API_CONFIG.getApiUrl();
      return apiUrl.replace('/api', '');
    }
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    let backendPort = '3000';
    if (port === '5173' || port === '3000' || port === '') {
      backendPort = '3000';
    } else if (port === '5174' || port === '3001') {
      backendPort = '3001';
    } else if (port === '5175' || port === '5000') {
      backendPort = '5000';
    }
    
    return `${protocol}//${hostname}:${backendPort}`;
  };

  const baseUrl = getBaseUrl();

  // Cargar datos cuando se selecciona una referencia
  useEffect(() => {
    if (selectedReference) {
      loadReferenceData(selectedReference.id);
    }
  }, [selectedReference]);

  // Cargar fichas de costo al inicializar
  useEffect(() => {
    loadFichasCosto();
  }, []);

  const loadFichasCosto = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/fichas-costo`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setFichasCosto(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando fichas de costo:', error);
    }
  };

  const loadReferenceData = async (referenceId: string) => {
    setLoading(true);
    try {
      // Cargar registros de corte
      const corteResponse = await api.getCorteRegistros();
      const corteFiltered = corteResponse.filter((record: any) => record.referencia === referenceId);
      setCorteRecords(corteFiltered);

      // Cargar producto en proceso
      const procesoResponse = await api.getProductoEnProceso();
      const procesoFiltered = procesoResponse.filter((record: any) => record.ref === referenceId);
      setProcesoRecords(procesoFiltered.map((record: any) => ({
        id: record.id,
        remision: record.remision || record.numeroRemision || 'N/A',
        fechaRemision: record.fechaRemision || record.fechaSalida || '',
        cantidadSalida: record.salida || record.cantidadSalida || record.cantidad || 0,
        confeccionista: record.confeccionista || record.nombreConfeccionista || 'N/A',
        fechaLlegada: record.fechaLlegada || record.fechaRecepcion,
        cantidadLlegada: record.entrega || record.cantidadLlegada || record.cantidadRecibida
      })));

      // Cargar transportes
      const transporteResponse = await api.getTransportesPorReferencia(referenceId);
      setTransporteRecords(transporteResponse.map((record: any) => ({
        fecha: record.fecha || '',
        taller: record.taller || 'N/A',
        detalle: record.detalle || record.descripcion || 'Sin detalles',
        transportista: record.transportista || record.nombreTransportista || 'N/A'
      })));

      // Cargar datos completos de la ficha de costo (incluyendo cortes)
      try {
        const response = await fetch(`${baseUrl}/api/fichas-costo/${referenceId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        });
        const fichaData = await response.json();
        if (fichaData.success && fichaData.data) {
          setCortesData(fichaData.data.cortes || []);
        }
      } catch (error) {
        console.error('Error cargando datos de cortes:', error);
        setCortesData([]);
      }

    } catch (error) {
      console.error('Error cargando datos de referencia:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar referencias basado en el término de búsqueda
  const filteredReferences = state.references.filter(ref =>
    ref.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estadísticas reales para una referencia
  const calculateReferenceStats = (reference: Reference) => {
    // Cantidad cortada real de la ficha de costo
    const fichaCorrespondiente = fichasCosto.find(f => f.referencia === reference.id);
    const cantidadCortada = fichaCorrespondiente?.cantidadTotalCortada || 0;
    
    // Pedidos que incluyen esta referencia
    const pedidosConReferencia = state.orders.filter(order =>
      order.items.some(item => item.reference === reference.id)
    );
    
    // Correrias donde aparece
    const correriasConReferencia = [...new Set(pedidosConReferencia.map(order => order.correriaId))];
    
    // Cantidad vendida por correria
    const cantidadPorCorreria: CorreriaDetail[] = correriasConReferencia.map(correriaId => {
      const correria = state.correrias.find(c => c.id === correriaId);
      const pedidosCorreria = pedidosConReferencia.filter(order => order.correriaId === correriaId);
      
      const cantidadVendida = pedidosCorreria.reduce((total, order) => {
        const item = order.items.find(item => item.reference === reference.id);
        return total + (item?.quantity || 0);
      }, 0);
      
      // Cantidad despachada real
      const despachosCorreria = state.dispatches.filter(dispatch => 
        dispatch.correriaId === correriaId &&
        dispatch.items.some(item => item.reference === reference.id)
      );
      
      const cantidadDespachada = despachosCorreria.reduce((total, dispatch) => {
        const item = dispatch.items.find(item => item.reference === reference.id);
        return total + (item?.quantity || 0);
      }, 0);
      
      // Clientes que pidieron esta referencia en esta correria
      const clientes = pedidosCorreria.map(order => {
        const cliente = state.clients.find(c => c.id === order.clientId);
        const item = order.items.find(item => item.reference === reference.id);
        const despachoCliente = despachosCorreria.find(d => d.clientId === order.clientId);
        const itemDespachado = despachoCliente?.items.find(item => item.reference === reference.id);
        
        return {
          cliente: cliente?.name || 'Cliente desconocido',
          cantidadPedida: item?.quantity || 0,
          cantidadDespachada: itemDespachado?.quantity || 0
        };
      });
      
      return {
        correria: correria?.name || correriaId,
        cantidadCortada: cantidadCortada, // Usar cantidad real de corte
        cantidadVendida,
        cantidadDespachada,
        clientes
      };
    });
    
    return {
      cantidadCortada,
      cantidadPedidos: pedidosConReferencia.length,
      cantidadCorrerias: correriasConReferencia.length,
      cantidadPorCorreria
    };
  };

  const handleCorreriaClick = (correria: CorreriaDetail) => {
    setSelectedCorreriaDetail(correria);
    setShowCorreriaModal(true);
  };

  const handleCortesClick = () => {
    setShowCortesModal(true);
  };

  const handleGoToFichaCosto = () => {
    if (selectedReference) {
      onNavigate('fichas-costo-detalle', { referencia: selectedReference.id });
    }
  };

  // Obtener foto de la referencia
  const getReferencePhoto = (referenceId: string): string | null => {
    const ficha = fichasCosto.find(f => f.referencia === referenceId);
    return ficha?.foto1 || null;
  };

  // Formatear precios
  const formatPrice = (price: number): string => {
    return `$ ${Math.floor(price).toLocaleString('es-CO')}`;
  };

  return (
    <div className={`h-full w-full flex flex-col transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`border-b px-6 py-4 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('home')}
              className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-sm transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] hover:bg-[#6a5a85] text-violet-300 hover:text-violet-50' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-700'}`}
              aria-label="Volver al inicio"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <h1 className={`text-3xl font-bold transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-gray-900'}`}>
                Histórico de Referencia
              </h1>
              <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-gray-600'}`}>Consulta el historial completo de referencias del sistema</p>
            </div>
          </div>
          
          {/* Búsqueda y Botón en la misma fila */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <label className={`text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-gray-700'}`}>
                Buscar Referencia:
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // Buscar automáticamente si hay coincidencia exacta
                  const exactMatch = state.references.find(ref => 
                    ref.id.toLowerCase() === e.target.value.toLowerCase()
                  );
                  if (exactMatch) {
                    setSelectedReference(exactMatch);
                  } else if (e.target.value === '') {
                    setSelectedReference(null);
                  }
                }}
                className={`w-64 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:ring-violet-600 placeholder:text-violet-400' : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400'} border`}
                placeholder="Código de referencia..."
              />
            </div>
            
            {selectedReference && (
              <button
                onClick={handleGoToFichaCosto}
                className={`px-6 py-2 text-white rounded-xl hover:opacity-90 transition-all shadow-sm font-semibold transition-colors duration-300 ${isDark ? 'bg-violet-600 hover:bg-violet-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                Ver Ficha de Costo
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full w-full flex gap-6">
          
          {/* Panel Izquierdo - Foto y Cantidad por Correría */}
          <div className="w-80 flex flex-col gap-6">
            
            {/* Foto de la Referencia - Más grande sin tanto margen */}
            <div className={`rounded-2xl p-2 border shadow-sm transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-gray-200'}`}>
              <div className={`w-full h-96 rounded-xl flex items-center justify-center overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-gray-100'}`}>
                {selectedReference && getReferencePhoto(selectedReference.id) ? (
                  <img 
                    src={`${baseUrl}${getReferencePhoto(selectedReference.id)}`} 
                    alt={selectedReference.id}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`flex flex-col items-center justify-center transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-gray-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 mb-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    <p className="text-sm font-medium">Sin foto disponible</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cantidad por Correría */}
            {selectedReference ? (
              <div className={`rounded-2xl p-6 border shadow-sm transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`font-bold text-lg mb-4 text-center transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-gray-700'}`}>Cantidad por Correría</h3>
                <div className="space-y-3">
                  {calculateReferenceStats(selectedReference).cantidadPorCorreria.map((correria, index) => (
                    <button
                      key={index}
                      onClick={() => handleCorreriaClick(correria)}
                      className={`w-full rounded-xl p-4 border transition-all hover:shadow-md text-left transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 hover:border-violet-500 hover:bg-[#4a3a63]' : 'bg-blue-50 border-blue-200 hover:border-blue-300'}`}
                    >
                      <div className={`font-semibold text-center mb-3 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-blue-700'}`}>{correria.correria}</div>
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className={`text-sm mb-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-gray-600'}`}>
                            Vendido: <span className={`font-semibold transition-colors duration-300 ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>{correria.cantidadVendida}</span>
                          </div>
                          <div className={`text-sm transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-gray-600'}`}>
                            Despachado: <span className={`font-semibold transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{correria.cantidadDespachada}</span>
                          </div>
                        </div>
                        <div className={`border-l pl-4 ml-4 transition-colors duration-300 ${isDark ? 'border-violet-600' : 'border-gray-300'}`}>
                          <div className="text-center">
                            <div className={`text-lg font-bold transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-purple-700'}`}>
                              {correria.cantidadVendida > 0 ? Math.round((correria.cantidadDespachada / correria.cantidadVendida) * 100) : 0}%
                            </div>
                            <div className={`text-xs transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-gray-500'}`}>Despachado</div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                  {calculateReferenceStats(selectedReference).cantidadPorCorreria.length === 0 && (
                    <div className={`text-center py-4 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-gray-500'}`}>
                      <p className="text-sm">Sin información en esta sección</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={`rounded-2xl p-6 border shadow-sm transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`font-bold text-lg mb-4 text-center transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-gray-700'}`}>Cantidad por Correría</h3>
                <div className={`text-center py-8 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-gray-500'}`}>
                  <p className="text-sm">Digite referencia para buscar información</p>
                </div>
              </div>
            )}
          </div>

          {/* Panel Principal (Derecha) */}
          <div className="flex-1 flex flex-col gap-6">
            {selectedReference ? (
              <>
                {/* Información Completa de la Referencia */}
                <div className={`rounded-2xl p-6 border shadow-lg transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-[#4a3a63] via-[#3d2d52] to-[#4a3a63] border-violet-700' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 border-gray-200'}`}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Información Básica */}
                    <div className="space-y-4">
                      <div className="text-center lg:text-left">
                        <div className="flex items-center justify-between mb-1">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors duration-300 ${isDark ? 'bg-violet-700 text-violet-100' : 'bg-blue-100 text-blue-800'}`}>
                            Referencia
                          </div>
                          <h2 className={`text-3xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-gray-900'}`}>{selectedReference.id}</h2>
                        </div>
                        <p className={`font-medium leading-tight transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-gray-600'}`}>{selectedReference.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div className={`rounded-xl p-3 border shadow-sm transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600' : 'bg-white border-purple-200'}`}>
                          <div className="flex items-center justify-between">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors duration-300 ${isDark ? 'bg-violet-700 text-violet-100' : 'bg-purple-100 text-purple-800'}`}>
                              Diseñadora
                            </div>
                            <p className={`text-lg font-semibold transition-colors duration-300 ${isDark ? 'text-violet-100' : 'text-gray-800'}`}>{selectedReference.designer}</p>
                          </div>
                        </div>
                        
                        <div className={`rounded-xl p-3 border shadow-sm transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-emerald-600' : 'bg-white border-emerald-200'}`}>
                          <div className="flex items-center justify-between">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors duration-300 ${isDark ? 'bg-emerald-700 text-emerald-100' : 'bg-emerald-100 text-emerald-800'}`}>
                              Rentabilidad
                            </div>
                            <p className={`text-lg font-semibold transition-colors duration-300 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                              {(() => {
                                const fichaCorrespondiente = fichasCosto.find(f => f.referencia === selectedReference.id);
                                return Math.round(fichaCorrespondiente?.rentabilidad || 0);
                              })()}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Precios */}
                    <div className="space-y-3 h-full flex flex-col">
                      <div className={`rounded-2xl p-3 border shadow-sm flex-1 flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-emerald-600' : 'bg-white border-green-200'}`}>
                        <div className="text-center">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-1 transition-colors duration-300 ${isDark ? 'bg-emerald-700 text-emerald-100' : 'bg-green-100 text-green-800'}`}>
                            Precio Venta
                          </div>
                          <p className={`text-3xl font-black transition-colors duration-300 ${isDark ? 'text-emerald-400' : 'text-green-700'}`}>{formatPrice(selectedReference.price)}</p>
                        </div>
                      </div>
                      
                      <div className={`rounded-2xl p-3 border shadow-sm flex-1 flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-orange-600' : 'bg-white border-orange-200'}`}>
                        <div className="text-center">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-1 transition-colors duration-300 ${isDark ? 'bg-orange-700 text-orange-100' : 'bg-orange-100 text-orange-800'}`}>
                            Costo Producción
                          </div>
                          <p className={`text-3xl font-black transition-colors duration-300 ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>
                            {(() => {
                              const fichaCorrespondiente = fichasCosto.find(f => f.referencia === selectedReference.id);
                              return formatPrice(fichaCorrespondiente?.costoTotal || 0);
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Estadísticas */}
                    <div className={`rounded-2xl p-3 border shadow-sm transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-700' : 'bg-white border-gray-200'}`}>
                      {(() => {
                        const stats = calculateReferenceStats(selectedReference);
                        return (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="text-center">
                                <div className={`rounded-xl p-3 border-2 hover:border-blue-400 hover:bg-blue-100 transition-all duration-200 shadow-lg hover:shadow-xl transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-blue-600 hover:bg-[#5a4a75]' : 'bg-blue-50 border-blue-300'}`}>
                                  <button 
                                    onClick={handleCortesClick}
                                    className="w-full rounded-lg transition-colors cursor-pointer group"
                                  >
                                    <div className="flex items-center justify-center">
                                      <p className={`text-2xl font-black transition-colors duration-300 ${isDark ? 'text-blue-400 group-hover:text-blue-300' : 'text-blue-700 group-hover:text-blue-800'}`}>{stats.cantidadCortada}</p>
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 ml-2 opacity-70 group-hover:opacity-100 transition-all transition-colors duration-300 ${isDark ? 'text-blue-400 group-hover:text-blue-300' : 'text-blue-500 group-hover:text-blue-700'}`}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                      </svg>
                                    </div>
                                    <span className={`text-xs font-semibold uppercase tracking-wide transition-colors duration-300 ${isDark ? 'text-blue-400 group-hover:text-blue-300' : 'text-blue-600 group-hover:text-blue-700'}`}>Cortada</span>
                                  </button>
                                </div>
                              </div>
                              <div className="text-center">
                                <div className={`rounded-xl p-3 border transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-emerald-600' : 'bg-green-50 border-green-200'}`}>
                                  <p className={`text-2xl font-black mb-1 transition-colors duration-300 ${isDark ? 'text-emerald-400' : 'text-green-700'}`}>{stats.cantidadPedidos}</p>
                                  <span className={`text-xs font-semibold uppercase tracking-wide transition-colors duration-300 ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>Pedidos</span>
                                </div>
                              </div>
                              <div className="text-center">
                                <div className={`rounded-xl p-3 border transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-600' : 'bg-purple-50 border-purple-200'}`}>
                                  <p className={`text-2xl font-black mb-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-purple-700'}`}>{stats.cantidadCorrerias}</p>
                                  <span className={`text-xs font-semibold uppercase tracking-wide transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-purple-600'}`}>Correrias</span>
                                </div>
                              </div>
                              <div className="text-center">
                                <div className={`rounded-xl p-3 border transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-pink-600' : 'bg-pink-50 border-pink-200'}`}>
                                  <p className={`text-2xl font-black mb-1 transition-colors duration-300 ${isDark ? 'text-pink-400' : 'text-pink-700'}`}>
                                    {stats.cantidadPorCorreria.reduce((total, c) => total + c.cantidadVendida, 0)}
                                  </p>
                                  <span className={`text-xs font-semibold uppercase tracking-wide transition-colors duration-300 ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>Vendido</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Secciones de Registros - A lo ancho con títulos banner */}
                <div className="space-y-6">
                  
                  {/* Registros de Corte */}
                  <div className={`rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-gray-200'}`}>
                    {/* Título Banner */}
                    <div className={`px-6 py-4 transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-orange-900 to-orange-800' : 'bg-gradient-to-r from-orange-200 to-orange-300'}`}>
                      <h3 className={`font-bold text-lg text-center transition-colors duration-300 ${isDark ? 'text-orange-200' : 'text-orange-800'}`}>Registros de Corte</h3>
                    </div>
                    
                    {selectedReference ? (
                      loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Cargando...</p>
                        </div>
                      ) : corteRecords.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className={`transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-orange-50'}`}>
                              <tr>
                                <th className={`px-6 py-3 text-left text-xs font-medium text-center uppercase tracking-wider border-r transition-colors duration-300 ${isDark ? 'text-orange-300 border-violet-700' : 'text-orange-700 border-gray-200'}`}>Número Ficha</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium text-center uppercase tracking-wider border-r transition-colors duration-300 ${isDark ? 'text-orange-300 border-violet-700' : 'text-orange-700 border-gray-200'}`}>Fecha Corte</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium text-center uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>Cantidad Cortada</th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y transition-colors duration-300 ${isDark ? 'divide-violet-700' : 'divide-gray-200 bg-white'}`}>
                              {corteRecords.map((record, index) => (
                                <tr key={record.id || index} className={`transition-colors duration-300 ${isDark ? 'hover:bg-[#3d2d52]' : 'hover:bg-orange-50'}`}>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium border-r transition-colors duration-300 ${isDark ? 'text-orange-300 border-violet-700' : 'text-orange-700 border-gray-100'}`}>{record.numeroFicha}</td>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm border-r transition-colors duration-300 ${isDark ? 'text-violet-300 border-violet-700' : 'text-gray-600 border-gray-100'}`}>{record.fechaCorte}</td>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>{record.cantidadCortada}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className={`text-center py-8 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-gray-500'}`}>
                          <p className="text-sm">Sin información en esta sección</p>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">Digite referencia para buscar información</p>
                      </div>
                    )}
                  </div>

                  {/* Producto en Proceso */}
                  <div className={`rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-gray-200'}`}>
                    {/* Título Banner */}
                    <div className={`px-6 py-4 transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-blue-900 to-blue-800' : 'bg-gradient-to-r from-blue-200 to-blue-300'}`}>
                      <h3 className={`font-bold text-lg text-center transition-colors duration-300 ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>Producto en Proceso</h3>
                    </div>
                    
                    {selectedReference ? (
                      loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Cargando...</p>
                        </div>
                      ) : procesoRecords.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className={`transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-blue-50'}`}>
                              <tr>
                                <th className={`px-6 py-3 text-left text-xs font-medium text-center uppercase tracking-wider border-r transition-colors duration-300 ${isDark ? 'text-blue-300 border-violet-700' : 'text-blue-700 border-gray-200'}`}>Remisión</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium text-center uppercase tracking-wider border-r transition-colors duration-300 ${isDark ? 'text-blue-300 border-violet-700' : 'text-blue-700 border-gray-200'}`}>Fecha Remisión</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium text-center uppercase tracking-wider border-r transition-colors duration-300 ${isDark ? 'text-blue-300 border-violet-700' : 'text-blue-700 border-gray-200'}`}>Cantidad Salida</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium text-center uppercase tracking-wider border-r transition-colors duration-300 ${isDark ? 'text-blue-300 border-violet-700' : 'text-blue-700 border-gray-200'}`}>Confeccionista</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium text-center uppercase tracking-wider border-r transition-colors duration-300 ${isDark ? 'text-blue-300 border-violet-700' : 'text-blue-700 border-gray-200'}`}>Fecha Llegada</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium text-center uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Cantidad Llegada</th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y transition-colors duration-300 ${isDark ? 'divide-violet-700' : 'divide-gray-200 bg-white'}`}>
                              {procesoRecords.map((record, index) => (
                                <tr key={record.id || index} className={`transition-colors duration-300 ${isDark ? 'hover:bg-[#3d2d52]' : 'hover:bg-blue-50'}`}>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium border-r transition-colors duration-300 ${isDark ? 'text-blue-300 border-violet-700' : 'text-blue-700 border-gray-100'}`}>{record.remision}</td>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm border-r transition-colors duration-300 ${isDark ? 'text-violet-300 border-violet-700' : 'text-gray-600 border-gray-100'}`}>{record.fechaRemision}</td>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm border-r transition-colors duration-300 ${isDark ? 'text-violet-300 border-violet-700' : 'text-gray-600 border-gray-100'}`}>{record.cantidadSalida}</td>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm border-r transition-colors duration-300 ${isDark ? 'text-violet-300 border-violet-700' : 'text-gray-600 border-gray-100'}`}>{record.confeccionista}</td>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm border-r transition-colors duration-300 ${isDark ? 'text-emerald-400 border-violet-700' : 'text-green-600 border-gray-100'}`}>{record.fechaLlegada || '-'}</td>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>{record.cantidadLlegada || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className={`text-center py-8 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-gray-500'}`}>
                          <p className="text-sm">Sin información en esta sección</p>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">Digite referencia para buscar información</p>
                      </div>
                    )}
                  </div>

                  {/* Registros de Transporte */}
                  <div className={`rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-gray-200'}`}>
                    {/* Título Banner */}
                    <div className={`px-6 py-4 transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-green-900 to-green-800' : 'bg-gradient-to-r from-green-200 to-green-300'}`}>
                      <h3 className={`font-bold text-lg text-center transition-colors duration-300 ${isDark ? 'text-green-200' : 'text-green-800'}`}>Registros de Transporte</h3>
                    </div>
                    
                    {selectedReference ? (
                      loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Cargando...</p>
                        </div>
                      ) : transporteRecords.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className={`transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-green-50'}`}>
                              <tr>
                                <th className={`px-6 py-3 text-left text-xs font-medium text-center uppercase tracking-wider border-r transition-colors duration-300 ${isDark ? 'text-green-300 border-violet-700' : 'text-green-700 border-gray-200'}`}>Fecha</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium text-center uppercase tracking-wider border-r transition-colors duration-300 ${isDark ? 'text-green-300 border-violet-700' : 'text-green-700 border-gray-200'}`}>Taller</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium text-center uppercase tracking-wider border-r transition-colors duration-300 ${isDark ? 'text-green-300 border-violet-700' : 'text-green-700 border-gray-200'}`}>Detalle</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium text-center uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-green-300' : 'text-green-700'}`}>Transportista</th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y transition-colors duration-300 ${isDark ? 'divide-violet-700' : 'divide-gray-200 bg-white'}`}>
                              {transporteRecords.map((record, index) => (
                                <tr key={index} className={`transition-colors duration-300 ${isDark ? 'hover:bg-[#3d2d52]' : 'hover:bg-green-50'}`}>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm border-r transition-colors duration-300 ${isDark ? 'text-violet-300 border-violet-700' : 'text-gray-600 border-gray-100'}`}>{record.fecha}</td>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm border-r transition-colors duration-300 ${isDark ? 'text-violet-300 border-violet-700' : 'text-gray-600 border-gray-100'}`}>{record.taller}</td>
                                  <td className={`px-6 py-4 text-sm border-r transition-colors duration-300 ${isDark ? 'text-violet-300 border-violet-700' : 'text-gray-600 border-gray-100'}`}>{record.detalle}</td>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium transition-colors duration-300 ${isDark ? 'text-green-300' : 'text-green-700'}`}>{record.transportista}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className={`text-center py-8 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-gray-500'}`}>
                          <p className="text-sm">Sin información en esta sección</p>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">Digite referencia para buscar información</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63]' : 'bg-gray-100'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-12 h-12 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-gray-400'}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-gray-700'}`}>Selecciona una referencia</h3>
                  <p className={`transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-gray-600'}`}>Busca y selecciona una referencia para ver su historial completo</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Cortes */}
      {showCortesModal && selectedReference && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl p-6 max-w-6xl w-full max-h-[80vh] overflow-y-auto transition-colors duration-300 ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-6">
              <div></div>
              <h3 className={`text-2xl font-bold transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-gray-700'}`}>
                Cortes Asentados - {selectedReference.id}
              </h3>
              <button
                onClick={() => setShowCortesModal(false)}
                className={`p-2 rounded-xl transition-colors duration-300 ${isDark ? 'hover:bg-[#3d2d52] text-violet-300' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {(() => {
                if (cortesData.length === 0) {
                  return (
                    <div className={`col-span-3 text-center py-12 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-gray-500'}`}>
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-gray-100'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-10 h-10 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-gray-400'}`}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                        </svg>
                      </div>
                      <p className={`text-xl font-semibold mb-2 transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-gray-600'}`}>No hay cortes asentados</p>
                      <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-gray-500'}`}>Esta referencia no tiene cortes registrados</p>
                    </div>
                  );
                }

                return cortesData.map((corte: any, index: number) => {
                  // Calcular totales del corte
                  const calc = (items: any[]) => Math.ceil((items || []).reduce((acc: number, i: any) => acc + (i.total || 0), 0));
                  const totalMP = calc(corte.materiaPrima);
                  const totalMO = calc(corte.manoObra);
                  const totalID = calc(corte.insumosDirectos);
                  const totalII = calc(corte.insumosIndirectos);
                  const totalProv = calc(corte.provisiones);
                  const costoReal = totalMP + totalMO + totalID + totalII + totalProv;
                  
                  // Obtener costo inicial de la ficha
                  const fichaCorrespondiente = fichasCosto.find(f => f.referencia === selectedReference.id);
                  const costoInicial = fichaCorrespondiente?.costoTotal || 0;
                  const diferencia = costoReal - costoInicial;
                  const margenUtilidad = costoReal > 0 ? ((selectedReference.price - costoReal) / selectedReference.price * 100) : 0;
                  const esUtilidad = diferencia <= 0; // Verde si la diferencia es negativa o cero

                  return (
                    <div 
                      key={index} 
                      className={`group relative rounded-3xl p-4 border-2 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                        esUtilidad 
                          ? `${isDark ? 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 border-emerald-600 hover:border-emerald-500' : 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 border-green-200 hover:border-green-300'}` 
                          : `${isDark ? 'bg-gradient-to-br from-red-900 via-red-800 to-red-900 border-red-600 hover:border-red-500' : 'bg-gradient-to-br from-red-50 via-rose-50 to-red-100 border-red-200 hover:border-red-300'}`
                      }`}
                    >
                      {/* Decoración superior */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 rounded-t-3xl"></div>
                      
                      {/* Header con badge y indicador */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide shadow-sm transition-colors duration-300 ${
                          esUtilidad ? `${isDark ? 'bg-emerald-700 text-emerald-100' : 'bg-green-200 text-green-800'}` : `${isDark ? 'bg-red-700 text-red-100' : 'bg-red-200 text-red-800'}`
                        }`}>
                          Corte #{corte.numeroCorte || index + 1}
                        </div>
                        <div className={`w-4 h-4 rounded-full shadow-inner transition-colors duration-300 ${esUtilidad ? `${isDark ? 'bg-emerald-400' : 'bg-green-500'}` : `${isDark ? 'bg-red-400' : 'bg-red-500'}`}`}></div>
                      </div>

                      {/* Información principal */}
                      <div className="space-y-3">
                        <div className={`rounded-2xl p-3 backdrop-blur-sm border-b transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]/60 border-violet-700' : 'bg-white/60 border-gray-200'}`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-sm font-semibold uppercase tracking-wide transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-gray-600'}`}>Fecha</span>
                            <span className={`text-sm font-bold transition-colors duration-300 ${isDark ? 'text-violet-100' : 'text-gray-800'}`}>
                              {corte.fechaCorte ? new Date(corte.fechaCorte).toLocaleDateString('es-CO') : 'N/A'}
                            </span>
                          </div>
                          <div className={`border-t pt-2 mt-2 transition-colors duration-300 ${isDark ? 'border-violet-700' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className={`text-sm font-semibold uppercase tracking-wide transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-gray-600'}`}>Ficha</span>
                              <span className={`text-sm font-bold transition-colors duration-300 ${isDark ? 'text-violet-100' : 'text-gray-800'}`}>{corte.fichaCorte || 'N/A'}</span>
                            </div>
                          </div>
                          <div className={`border-t pt-2 mt-2 transition-colors duration-300 ${isDark ? 'border-violet-700' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-center">
                              <span className={`text-sm font-semibold uppercase tracking-wide transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-gray-600'}`}>Cantidad</span>
                              <span className={`text-xl font-black transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>{corte.cantidadCortada || 0}</span>
                            </div>
                          </div>
                        </div>

                        {/* Métricas financieras */}
                        <div className={`rounded-2xl p-3 backdrop-blur-sm transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]/60' : 'bg-white/60'}`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-sm font-semibold uppercase tracking-wide transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-gray-600'}`}>Costo Real</span>
                            <span className={`text-sm font-bold transition-colors duration-300 ${isDark ? 'text-violet-100' : 'text-gray-800'}`}>{formatPrice(costoReal)}</span>
                          </div>
                          <div className={`border-t pt-2 mt-2 transition-colors duration-300 ${isDark ? 'border-violet-700' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className={`text-sm font-semibold uppercase tracking-wide transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-gray-600'}`}>Diferencia</span>
                              <span className={`text-sm font-bold transition-colors duration-300 ${diferencia <= 0 ? `${isDark ? 'text-emerald-400' : 'text-green-700'}` : `${isDark ? 'text-red-400' : 'text-red-700'}`}`}>
                                {diferencia > 0 ? '+' : ''}{formatPrice(diferencia)}
                              </span>
                            </div>
                          </div>
                          <div className={`border-t pt-2 mt-2 transition-colors duration-300 ${isDark ? 'border-violet-700' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-center">
                              <span className={`text-sm font-semibold uppercase tracking-wide transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-gray-600'}`}>M.R Utilidad</span>
                              <span className={`text-2xl font-black transition-colors duration-300 ${margenUtilidad > 0 ? `${isDark ? 'text-emerald-400' : 'text-green-700'}` : `${isDark ? 'text-red-400' : 'text-red-700'}`}`}>
                                {margenUtilidad.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Correría */}
      {showCorreriaModal && selectedCorreriaDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto transition-colors duration-300 ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-2xl font-bold transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-gray-700'}`}>
                Detalle - {selectedCorreriaDetail.correria}
              </h3>
              <button
                onClick={() => setShowCorreriaModal(false)}
                className={`p-2 rounded-xl transition-colors duration-300 ${isDark ? 'hover:bg-[#3d2d52] text-violet-300' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <h4 className={`font-semibold text-center mb-3 transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-gray-800'}`}>Clientes que pidieron esta referencia: {selectedCorreriaDetail.clientes.length}</h4>
              <div className="space-y-2">
                {selectedCorreriaDetail.clientes.map((cliente, index) => (
                  <div key={index} className={`rounded-xl p-4 flex items-center transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border border-violet-700' : 'bg-gray-50'}`}>
                    <div className={`flex-1 font-medium transition-colors duration-300 ${isDark ? 'text-violet-100' : 'text-gray-800'}`}>{cliente.cliente}</div>
                    <div className={`border-l pl-6 ml-6 flex gap-8 transition-colors duration-300 ${isDark ? 'border-violet-700' : 'border-gray-300'}`}>
                      <div className="text-center min-w-[80px]">
                        <div className={`text-lg font-bold transition-colors duration-300 ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>{cliente.cantidadPedida}</div>
                        <div className={`text-xs transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-gray-500'}`}>Pedida</div>
                      </div>
                      <div className="text-center min-w-[80px]">
                        <div className={`text-lg font-bold transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{cliente.cantidadDespachada}</div>
                        <div className={`text-xs transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-gray-500'}`}>Despachada</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoricoReferenciaView;