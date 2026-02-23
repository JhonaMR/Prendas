// ============================================
// VISTA: Maletas Asignar
// Asignar referencias a maleta y correría
// ============================================

import React, { useState, useEffect } from 'react';
import { AppState } from '../types/typesFichas';
import { useParams, useNavigate } from 'react-router-dom';
import apiFichas from '../services/apiFichas';

interface MaletasAsignarProps {
  state: AppState;
  user: any;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const MaletasAsignar: React.FC<MaletasAsignarProps> = ({ state, user, updateState }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const isAdmin = user?.role === 'admin';
  const isGeneral = user?.role === 'general';
  const canEdit = isAdmin || isGeneral;

  const [maleta, setMaleta] = useState<any>(null);
  const [referenciasSinCorreria, setReferenciasSinCorreria] = useState<any[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar datos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [maletaData, refsSinCorreria] = await Promise.all([
          apiFichas.getMaleta(id!),
          apiFichas.getReferenciasSinCorreria()
        ]);

        setMaleta(maletaData);
        setReferenciasSinCorreria(refsSinCorreria);

        // Preseleccionar referencias ya en maleta
        if (maletaData?.referencias) {
          setSeleccionadas(maletaData.referencias.map((r: any) => r.referencia));
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
        alert('Error al cargar datos');
      }
    };

    cargarDatos();
  }, [id]);

  // Buscar referencias antiguas
  useEffect(() => {
    if (busqueda.trim().length >= 2) {
      const resultados = state.references
        .filter(ref => {
          const term = busqueda.toLowerCase();
          return (
            ref.id.toLowerCase().includes(term) ||
            (ref.description && ref.description.toLowerCase().includes(term))
          );
        })
        .slice(0, 10);
      
      setResultadosBusqueda(resultados);
    } else {
      setResultadosBusqueda([]);
    }
  }, [busqueda, state.references]);

  const toggleReferencia = (ref: string) => {
    if (seleccionadas.includes(ref)) {
      setSeleccionadas(seleccionadas.filter(r => r !== ref));
    } else {
      setSeleccionadas([...seleccionadas, ref]);
    }
  };

  const handleGuardar = async () => {
    if (!canEdit) {
      alert('No tienes permisos para editar maletas');
      return;
    }

    if (seleccionadas.length === 0) {
      alert('Debe seleccionar al menos una referencia');
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiFichas.updateMaleta(
        id!,
        maleta?.nombre,
        maleta?.correriaId,
        seleccionadas
      );

      if (result.success) {
        alert('✅ Maleta guardada exitosamente');
        navigate('/maletas');
      } else {
        alert('❌ Error al guardar: ' + result.message);
      }
    } catch (error) {
      console.error('Error guardando:', error);
      alert('❌ Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  if (!maleta) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold">Cargando maleta...</p>
        </div>
      </div>
    );
  }

  const correria = state.correrias.find(c => c.id === maleta.correriaId);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/maletas')}
              className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{maleta.nombre}</h2>
              <p className="text-slate-500 font-bold text-xs mt-1">
                {correria ? `${correria.name} ${correria.year}` : 'Sin correría asignada'}
                {' • '}
                {seleccionadas.length} referencia{seleccionadas.length !== 1 ? 's' : ''} seleccionada{seleccionadas.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={handleGuardar}
            disabled={isLoading}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 uppercase tracking-wider text-sm"
          >
            {isLoading ? 'GUARDANDO...' : 'GUARDAR MALETA'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* REFERENCIAS SIN CORRERÍA */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-black text-slate-800 mb-1">Referencias Disponibles</h3>
            <p className="text-xs text-slate-500 font-bold">
              {referenciasSinCorreria.length} referencia{referenciasSinCorreria.length !== 1 ? 's' : ''} sin correría asignada
            </p>
          </div>

          {referenciasSinCorreria.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <p className="text-slate-400 font-bold">No hay referencias disponibles</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {referenciasSinCorreria.map(ref => (
                <label
                  key={ref.referencia}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    seleccionadas.includes(ref.referencia)
                      ? 'bg-purple-50 border-purple-300'
                      : 'bg-slate-50 border-slate-200 hover:border-purple-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={seleccionadas.includes(ref.referencia)}
                    onChange={() => toggleReferencia(ref.referencia)}
                    disabled={!canEdit}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <p className="font-black text-slate-800">{ref.referencia}</p>
                    <p className="text-xs text-slate-500 font-bold truncate">{ref.descripcion || 'Sin descripción'}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* BUSCAR REFERENCIAS ANTIGUAS */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-black text-slate-800 mb-1">Buscar Referencias Antiguas</h3>
            <p className="text-xs text-slate-500 font-bold">
              Referencias que ya tienen correría asignada
            </p>
          </div>

          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por referencia o descripción..."
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-purple-100 focus:border-purple-500"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
            </div>
          </div>

          {busqueda.trim().length < 2 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <p className="text-slate-400 font-bold text-sm">Escribe al menos 2 caracteres para buscar</p>
            </div>
          ) : resultadosBusqueda.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-400 font-bold">No se encontraron resultados</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {resultadosBusqueda.map(ref => {
                const correria = state.correrias.find(c => 
                  state.references.some(r => r.id === ref.id)
                );
                
                return (
                  <label
                    key={ref.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      seleccionadas.includes(ref.id)
                        ? 'bg-purple-50 border-purple-300'
                        : 'bg-slate-50 border-slate-200 hover:border-purple-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={seleccionadas.includes(ref.id)}
                      onChange={() => toggleReferencia(ref.id)}
                      disabled={!canEdit}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <p className="font-black text-slate-800">{ref.id}</p>
                      <p className="text-xs text-slate-500 font-bold truncate">{ref.description || 'Sin descripción'}</p>
                      {correria && (
                        <p className="text-[10px] text-blue-600 font-bold mt-1">
                          Ya en: {correria.name} {correria.year}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Resumen */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-3xl border-2 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-purple-700 uppercase tracking-widest mb-1">Resumen de Selección</p>
            <p className="text-3xl font-black text-purple-800">{seleccionadas.length}</p>
            <p className="text-xs text-purple-600 font-bold mt-1">
              referencia{seleccionadas.length !== 1 ? 's' : ''} seleccionada{seleccionadas.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {seleccionadas.length > 0 && (
            <button
              onClick={() => setSeleccionadas([])}
              className="px-4 py-2 bg-white text-purple-600 rounded-xl font-bold text-sm hover:bg-purple-50 transition-colors"
            >
              Limpiar Selección
            </button>
          )}
        </div>

        {seleccionadas.length > 0 && (
          <div className="mt-4 pt-4 border-t-2 border-purple-300">
            <p className="text-xs font-black text-purple-600 uppercase tracking-widest mb-2">Referencias seleccionadas:</p>
            <div className="flex flex-wrap gap-2">
              {seleccionadas.slice(0, 20).map(ref => (
                <span key={ref} className="px-3 py-1 bg-white text-purple-700 rounded-lg text-xs font-bold">
                  {ref}
                </span>
              ))}
              {seleccionadas.length > 20 && (
                <span className="px-3 py-1 bg-purple-200 text-purple-700 rounded-lg text-xs font-bold">
                  +{seleccionadas.length - 20} más
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Botón Guardar móvil */}
      {canEdit && (
        <button
          onClick={handleGuardar}
          disabled={isLoading}
          className="lg:hidden w-full py-6 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black text-2xl rounded-3xl shadow-2xl hover:shadow-purple-200 hover:scale-[1.01] transition-all disabled:opacity-50 uppercase tracking-wider"
        >
          {isLoading ? 'GUARDANDO...' : 'GUARDAR MALETA'}
        </button>
      )}
    </div>
  );
};

export default MaletasAsignar;
