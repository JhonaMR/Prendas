import React, { useState, useEffect } from 'react';
import { User, Reference, AppState, Correria, Order, Dispatch, BatchReception, DeliveryDate } from '../types';
import { api } from '../services/api';

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
  transportista: string;
  detalle: string;
}

interface FichaCosto {
  referencia: string;
  foto1?: string | null;
  foto2?: string | null;
}

const HistoricoReferenciaView: React.FC<HistoricoReferenciaViewProps> = ({ user, onNavigate, state }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReference, setSelectedReference] = useState<Reference | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCorreriaModal, setShowCorreriaModal] = useState(false);
  const [selectedCorreriaDetail, setSelectedCorreriaDetail] = useState<CorreriaDetail | null>(null);
  
  // Datos reales de la base de datos
  const [corteRecords, setCorteRecords] = useState<CorteRecord[]>([]);
  const [procesoRecords, setProcesoRecords] = useState<ProcesoRecord[]>([]);
  const [transporteRecords, setTransporteRecords] = useState<TransporteRecord[]>([]);
  const [fichasCosto, setFichasCosto] = useState<FichaCosto[]>([]);

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
      const procesoFiltered = procesoResponse.filter((record: any) => record.referencia === referenceId);
      setProcesoRecords(procesoFiltered.map((record: any) => ({
        id: record.id,
        remision: record.remision || record.numeroRemision || 'N/A',
        fechaRemision: record.fechaRemision || record.fechaSalida || '',
        cantidadSalida: record.cantidadSalida || record.cantidad || 0,
        confeccionista: record.confeccionista || record.nombreConfeccionista || 'N/A',
        fechaLlegada: record.fechaLlegada || record.fechaRecepcion,
        cantidadLlegada: record.cantidadLlegada || record.cantidadRecibida
      })));

      // Cargar transportes
      const transporteResponse = await api.getTransportesPorReferencia(referenceId);
      setTransporteRecords(transporteResponse.map((record: any) => ({
        fecha: record.fecha || '',
        transportista: record.transportista || record.nombreTransportista || 'N/A',
        detalle: record.detalle || record.descripcion || 'Sin detalles'
      })));

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
    // Cantidad cortada real de los registros de corte
    const cantidadCortada = corteRecords.reduce((total, record) => total + (record.cantidadCortada || 0), 0);
    
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
    <div className="h-full w-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('home')}
              className="h-12 w-12 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-700 transition-all shadow-sm"
              aria-label="Volver al inicio"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Histórico de Referencia
              </h1>
              <p className="text-sm text-gray-600">Consulta el historial completo de referencias del sistema</p>
            </div>
          </div>
          
          {/* Búsqueda y Botón en la misma fila */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-700">
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
                className="w-64 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                placeholder="Código de referencia..."
              />
            </div>
            
            {selectedReference && (
              <button
                onClick={handleGoToFichaCosto}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm font-semibold"
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
            <div className="bg-white rounded-2xl p-2 border border-gray-200 shadow-sm">
              <div className="w-full h-96 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                {selectedReference && getReferencePhoto(selectedReference.id) ? (
                  <img 
                    src={`${baseUrl}${getReferencePhoto(selectedReference.id)}`} 
                    alt={selectedReference.id}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
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
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-700 text-lg mb-4">Cantidad por Correría</h3>
                <div className="space-y-3">
                  {calculateReferenceStats(selectedReference).cantidadPorCorreria.map((correria, index) => (
                    <button
                      key={index}
                      onClick={() => handleCorreriaClick(correria)}
                      className="w-full bg-blue-50 rounded-xl p-4 border border-blue-200 hover:border-blue-300 transition-all hover:shadow-md text-left"
                    >
                      <div className="font-semibold text-blue-700">{correria.correria}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Vendido: <span className="font-semibold text-green-600">{correria.cantidadVendida}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Despachado: <span className="font-semibold text-blue-600">{correria.cantidadDespachada}</span>
                      </div>
                    </button>
                  ))}
                  {calculateReferenceStats(selectedReference).cantidadPorCorreria.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">Sin información en esta sección</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-700 text-lg mb-4">Cantidad por Correría</h3>
                <div className="text-center py-8 text-gray-500">
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
                <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Información Básica */}
                    <div className="space-y-4">
                      <div className="text-center lg:text-left">
                        <div className="flex items-center justify-between mb-1">
                          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wide">
                            Referencia
                          </div>
                          <h2 className="text-3xl font-black text-gray-900">{selectedReference.id}</h2>
                        </div>
                        <p className="text-gray-600 font-medium leading-tight">{selectedReference.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-white rounded-xl p-3 border border-purple-200 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold uppercase tracking-wide">
                              Diseñadora
                            </div>
                            <p className="text-lg font-semibold text-gray-800">{selectedReference.designer}</p>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-3 border border-emerald-200 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wide">
                              Rentabilidad
                            </div>
                            <p className="text-lg font-semibold text-emerald-700">
                              {Math.round(((selectedReference.price - Math.floor(selectedReference.price * 0.6)) / selectedReference.price) * 100)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Precios */}
                    <div className="space-y-3 h-full flex flex-col">
                      <div className="bg-white rounded-2xl p-3 border border-green-200 shadow-sm flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold uppercase tracking-wide mb-1">
                            Precio Venta
                          </div>
                          <p className="text-3xl font-black text-green-700">{formatPrice(selectedReference.price)}</p>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-2xl p-3 border border-orange-200 shadow-sm flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <div className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold uppercase tracking-wide mb-1">
                            Costo Producción
                          </div>
                          <p className="text-3xl font-black text-orange-700">{formatPrice(Math.floor(selectedReference.price * 0.6))}</p>
                        </div>
                      </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="bg-white rounded-2xl p-3 border border-gray-200 shadow-sm">
                      {(() => {
                        const stats = calculateReferenceStats(selectedReference);
                        return (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="text-center">
                                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                                  <p className="text-2xl font-black text-blue-700 mb-1">{stats.cantidadCortada}</p>
                                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Cortada</span>
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                                  <p className="text-2xl font-black text-green-700 mb-1">{stats.cantidadPedidos}</p>
                                  <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Pedidos</span>
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                                  <p className="text-2xl font-black text-purple-700 mb-1">{stats.cantidadCorrerias}</p>
                                  <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Correrias</span>
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="bg-pink-50 rounded-xl p-3 border border-pink-200">
                                  <p className="text-2xl font-black text-pink-700 mb-1">
                                    {stats.cantidadPorCorreria.reduce((total, c) => total + c.cantidadVendida, 0)}
                                  </p>
                                  <span className="text-xs font-semibold text-pink-600 uppercase tracking-wide">Vendido</span>
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
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Título Banner */}
                    <div className="bg-gradient-to-r from-orange-200 to-orange-300 px-6 py-4">
                      <h3 className="font-bold text-orange-800 text-lg text-center">Registros de Corte</h3>
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
                            <thead className="bg-orange-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Número Ficha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Fecha Corte</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Cantidad Cortada</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {corteRecords.map((record, index) => (
                                <tr key={record.id || index} className="hover:bg-orange-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-700">{record.numeroFicha}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.fechaCorte}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-orange-600">{record.cantidadCortada}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
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
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Título Banner */}
                    <div className="bg-gradient-to-r from-blue-200 to-blue-300 px-6 py-4">
                      <h3 className="font-bold text-blue-800 text-lg text-center">Producto en Proceso</h3>
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
                            <thead className="bg-blue-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Remisión</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Fecha Remisión</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Cantidad Salida</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Confeccionista</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Fecha Llegada</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Cantidad Llegada</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {procesoRecords.map((record, index) => (
                                <tr key={record.id || index} className="hover:bg-blue-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700">{record.remision}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.fechaRemision}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.cantidadSalida}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.confeccionista}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{record.fechaLlegada || '-'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{record.cantidadLlegada || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
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
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Título Banner */}
                    <div className="bg-gradient-to-r from-green-200 to-green-300 px-6 py-4">
                      <h3 className="font-bold text-green-800 text-lg text-center">Registros de Transporte</h3>
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
                            <thead className="bg-green-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Transportista</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Detalle</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {transporteRecords.map((record, index) => (
                                <tr key={index} className="hover:bg-green-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.fecha}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-700">{record.transportista}</td>
                                  <td className="px-6 py-4 text-sm text-gray-600">{record.detalle}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
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
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Selecciona una referencia</h3>
                  <p className="text-gray-600">Busca y selecciona una referencia para ver su historial completo</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalle de Correría */}
      {showCorreriaModal && selectedCorreriaDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-700">
                Detalle - {selectedCorreriaDetail.correria}
              </h3>
              <button
                onClick={() => setShowCorreriaModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-700">{selectedCorreriaDetail.cantidadCortada}</div>
                  <div className="text-sm text-blue-600">Cortada</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-700">{selectedCorreriaDetail.cantidadVendida}</div>
                  <div className="text-sm text-green-600">Vendida</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-700">{selectedCorreriaDetail.cantidadDespachada}</div>
                  <div className="text-sm text-purple-600">Despachada</div>
                </div>
              </div>

              <h4 className="font-semibold text-gray-800 mb-3">Clientes que pidieron esta referencia:</h4>
              <div className="space-y-2">
                {selectedCorreriaDetail.clientes.map((cliente, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                    <div className="font-medium text-gray-800">{cliente.cliente}</div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-600">
                        Pedida: <strong>{cliente.cantidadPedida}</strong>
                      </span>
                      <span className="text-blue-600">
                        Despachada: <strong>{cliente.cantidadDespachada}</strong>
                      </span>
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