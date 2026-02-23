// ============================================
// VISTA: Fichas Corte Detalle
// Editor de corte con utilidad vs proyectado
// ============================================

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AppState, ConceptoFicha } from '../types/typesFichas';
import apiFichas from '../services/apiFichas';
import SeccionConceptos from '../components/SeccionConceptos';

interface FichasCorteDetalleProps {
  state: AppState;
  user: any;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const FichasCorteDetalle: React.FC<FichasCorteDetalleProps> = ({ state, user, updateState }) => {
  const { referencia, numeroCorte } = useParams<{ referencia: string; numeroCorte: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAdmin = user?.role === 'admin';
  const isGeneral = user?.role === 'general';
  const canEdit = isAdmin || isGeneral;
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isNuevo = location.state?.nuevo || false;

  const [fechaCorte, setFechaCorte] = useState(new Date().toISOString().split('T')[0]);
  const [cantidadCortada, setCantidadCortada] = useState(0);
  const [materiaPrima, setMateriaPrima] = useState<ConceptoFicha[]>([]);
  const [manoObra, setManoObra] = useState<ConceptoFicha[]>([]);
  const [insumosDirectos, setInsumosDirectos] = useState<ConceptoFicha[]>([]);
  const [insumosIndirectos, setInsumosIndirectos] = useState<ConceptoFicha[]>([]);
  const [provisiones, setProvisiones] = useState<ConceptoFicha[]>([]);

  const fichaInicial = state.fichasCosto.find(f => f.referencia === referencia);
  const corteExistente = fichaInicial?.cortes?.find(c => c.numeroCorte === Number(numeroCorte));

  // Cargar datos
  useEffect(() => {
    if (isNuevo && fichaInicial) {
      // Copiar de ficha inicial
      setMateriaPrima(fichaInicial.materiaPrima);
      setManoObra(fichaInicial.manoObra);
      setInsumosDirectos(fichaInicial.insumosDirectos);
      setInsumosIndirectos(fichaInicial.insumosIndirectos);
      setProvisiones(fichaInicial.provisiones);
    } else if (corteExistente) {
      // Cargar corte existente
      setFechaCorte(corteExistente.fechaCorte);
      setCantidadCortada(corteExistente.cantidadCortada);
      setMateriaPrima(corteExistente.materiaPrima);
      setManoObra(corteExistente.manoObra);
      setInsumosDirectos(corteExistente.insumosDirectos);
      setInsumosIndirectos(corteExistente.insumosIndirectos);
      setProvisiones(corteExistente.provisiones);
    }
  }, [isNuevo, fichaInicial, corteExistente]);

  // Calcular totales
  const totales = useMemo(() => {
    const calcTotal = (items: ConceptoFicha[]) => items.reduce((acc, i) => acc + (i.total || 0), 0);
    
    const totalMP = calcTotal(materiaPrima);
    const totalMO = calcTotal(manoObra);
    const totalID = calcTotal(insumosDirectos);
    const totalII = calcTotal(insumosIndirectos);
    const totalProv = calcTotal(provisiones);
    const costoReal = totalMP + totalMO + totalID + totalII + totalProv;
    
    return { totalMP, totalMO, totalID, totalII, totalProv, costoReal };
  }, [materiaPrima, manoObra, insumosDirectos, insumosIndirectos, provisiones]);

  // Calcular utilidad
  const costoProyectado = fichaInicial?.costoTotal || 0;
  const diferencia = costoProyectado - totales.costoReal;
  const margenUtilidad = totales.costoReal !== 0 ? (diferencia / totales.costoReal) * 100 : 0;

  // Advertencia cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleGuardar = async () => {
    if (!canEdit) {
      alert('No tienes permisos para editar cortes');
      return;
    }

    if (cantidadCortada <= 0) {
      alert('La cantidad cortada debe ser mayor a 0');
      return;
    }

    setIsLoading(true);

    const corteData = {
      numeroCorte: Number(numeroCorte),
      fechaCorte,
      cantidadCortada,
      materiaPrima,
      manoObra,
      insumosDirectos,
      insumosIndirectos,
      provisiones
    };

    try {
      let result;
      if (isNuevo) {
        result = await apiFichas.crearCorte(referencia!, corteData, user.name);
      } else {
        result = await apiFichas.updateCorte(referencia!, Number(numeroCorte), corteData);
      }

      if (result.success) {
        setHasUnsavedChanges(false);
        alert('✅ Corte guardado exitosamente');
        
        const fichas = await apiFichas.getFichasCosto();
        updateState(prev => ({ ...prev, fichasCosto: fichas }));
        
        navigate(`/fichas-costo/${referencia}`);
      } else {
        alert('❌ Error al guardar: ' + result.message);
      }
    } catch (error) {
      console.error('Error guardando corte:', error);
      alert('❌ Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (hasUnsavedChanges) {
                  if (confirm('¿Salir sin guardar cambios?')) navigate(`/fichas-costo/${referencia}`);
                } else {
                  navigate(`/fichas-costo/${referencia}`);
                }
              }}
              className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter">
                {referencia} - CORTE #{numeroCorte}
              </h2>
              <p className="text-slate-500 font-bold text-xs mt-1">
                {isNuevo ? 'Nuevo corte' : 'Editando corte existente'}
              </p>
            </div>
          </div>
        </div>

        {hasUnsavedChanges && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-bold text-sm">Cambios sin guardar</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUMNA IZQUIERDA */}
        <div className="space-y-6">
          {/* Info del Corte */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest">Información del Corte</h3>
            
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Fecha de Corte
              </label>
              <input
                type="date"
                value={fechaCorte}
                onChange={(e) => { setFechaCorte(e.target.value); setHasUnsavedChanges(true); }}
                readOnly={!canEdit}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Cantidad Cortada
              </label>
              <input
                type="number"
                value={cantidadCortada}
                onChange={(e) => { setCantidadCortada(Number(e.target.value)); setHasUnsavedChanges(true); }}
                readOnly={!canEdit}
                className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-black text-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Utilidad o Pérdida */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-3xl border-2 border-blue-200 space-y-4">
            <h3 className="text-sm font-black text-blue-700 uppercase tracking-widest">Utilidad o Pérdida Corte</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Costo Real</p>
                <p className="text-2xl font-black text-blue-700">$ {totales.costoReal.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Proyectado</p>
                <p className="text-2xl font-black text-blue-700">$ {costoProyectado.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Diferencia</p>
                <p className={`text-2xl font-black ${diferencia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  $ {diferencia.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-blue-300">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">M.R Utilidad</p>
              <div className="flex items-end gap-3">
                <p className={`text-6xl font-black ${margenUtilidad >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {margenUtilidad.toFixed(2)}%
                </p>
                <div className={`mb-3 px-4 py-2 rounded-xl ${margenUtilidad >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  <p className="text-xs font-black uppercase">
                    {margenUtilidad >= 0 ? '✓ Utilidad' : '✗ Pérdida'}
                  </p>
                </div>
              </div>
              {margenUtilidad >= 0 ? (
                <p className="text-xs text-green-700 font-bold mt-2">
                  El costo real fue menor al proyectado
                </p>
              ) : (
                <p className="text-xs text-red-700 font-bold mt-2">
                  El costo real superó al proyectado
                </p>
              )}
            </div>
          </div>

          {/* Costo Total */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-500 p-6 rounded-3xl text-white shadow-lg">
            <p className="text-sm font-black uppercase tracking-widest opacity-90 mb-2">Costo Real del Corte</p>
            <p className="text-5xl font-black">$ {totales.costoReal.toLocaleString()}</p>
          </div>
        </div>

        {/* COLUMNA DERECHA - Secciones */}
        <div className="space-y-6">
          <SeccionConceptos
            titulo="MATERIA PRIMA"
            color="pink"
            conceptos={materiaPrima}
            onChange={(c) => { setMateriaPrima(c); setHasUnsavedChanges(true); }}
            readOnly={!canEdit}
            mostrarTipo={true}
          />

          <SeccionConceptos
            titulo="MANO DE OBRA"
            color="blue"
            conceptos={manoObra}
            onChange={(c) => { setManoObra(c); setHasUnsavedChanges(true); }}
            readOnly={!canEdit}
          />

          <SeccionConceptos
            titulo="INSUMOS DIRECTOS"
            color="slate"
            conceptos={insumosDirectos}
            onChange={(c) => { setInsumosDirectos(c); setHasUnsavedChanges(true); }}
            readOnly={!canEdit}
          />

          <SeccionConceptos
            titulo="INSUMOS INDIRECTOS"
            color="orange"
            conceptos={insumosIndirectos}
            onChange={(c) => { setInsumosIndirectos(c); setHasUnsavedChanges(true); }}
            readOnly={!canEdit}
          />

          <SeccionConceptos
            titulo="PROVISIONES"
            color="red"
            conceptos={provisiones}
            onChange={(c) => { setProvisiones(c); setHasUnsavedChanges(true); }}
            readOnly={!canEdit}
          />
        </div>
      </div>

      {/* Botón Guardar */}
      {canEdit && (
        <button
          onClick={handleGuardar}
          disabled={isLoading}
          className="w-full py-6 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black text-2xl rounded-3xl shadow-2xl hover:shadow-purple-200 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
        >
          {isLoading ? 'GUARDANDO...' : `GUARDAR CORTE #${numeroCorte}`}
        </button>
      )}
    </div>
  );
};

export default FichasCorteDetalle;
