// ============================================
// VISTA: Fichas Diseño Detalle
// Editor completo de ficha de diseño
// ============================================

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AppState, FichaDiseno, ConceptoFicha, UserRole } from '../types/typesFichas';
import apiFichas from '../services/apiFichas';
import SeccionConceptos from '../components/SeccionConceptos';
import SubidaFotos from '../components/SubidaFotos';

interface FichasDisenoDetalleProps {
  state: AppState;
  user: any;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const FichasDisenoDetalle: React.FC<FichasDisenoDetalleProps> = ({ state, user, updateState }) => {
  const { referencia } = useParams<{ referencia: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isDisenadora = user?.role === UserRole.disenadora || user?.role === 'disenadora';
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Estados de la ficha
  const [disenadoraId, setDisenadoraId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [marca, setMarca] = useState('');
  const [novedad, setNovedad] = useState('');
  const [muestra1, setMuestra1] = useState('');
  const [muestra2, setMuestra2] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [foto1, setFoto1] = useState<string | null>(null);
  const [foto2, setFoto2] = useState<string | null>(null);
  
  const [materiaPrima, setMateriaPrima] = useState<ConceptoFicha[]>([]);
  const [manoObra, setManoObra] = useState<ConceptoFicha[]>([]);
  const [insumosDirectos, setInsumosDirectos] = useState<ConceptoFicha[]>([]);
  const [insumosIndirectos, setInsumosIndirectos] = useState<ConceptoFicha[]>([]);
  const [provisiones, setProvisiones] = useState<ConceptoFicha[]>([]);

  const isNueva = location.state?.nueva || false;
  const fichaExistente = state.fichasDiseno.find(f => f.referencia === referencia);

  // Cargar datos si es edición
  useEffect(() => {
    if (fichaExistente && !isNueva) {
      setDisenadoraId(fichaExistente.disenadoraId);
      setDescripcion(fichaExistente.descripcion);
      setMarca(fichaExistente.marca);
      setNovedad(fichaExistente.novedad);
      setMuestra1(fichaExistente.muestra1);
      setMuestra2(fichaExistente.muestra2);
      setObservaciones(fichaExistente.observaciones);
      setFoto1(fichaExistente.foto1);
      setFoto2(fichaExistente.foto2);
      setMateriaPrima(fichaExistente.materiaPrima);
      setManoObra(fichaExistente.manoObra);
      setInsumosDirectos(fichaExistente.insumosDirectos);
      setInsumosIndirectos(fichaExistente.insumosIndirectos);
      setProvisiones(fichaExistente.provisiones);
    } else if (isNueva && location.state?.disenadoraId) {
      setDisenadoraId(location.state.disenadoraId);
    }
  }, [fichaExistente]);

  // Calcular totales
  const totales = useMemo(() => {
    const calcTotal = (items: ConceptoFicha[]) => items.reduce((acc, i) => acc + (i.total || 0), 0);
    
    const totalMP = calcTotal(materiaPrima);
    const totalMO = calcTotal(manoObra);
    const totalID = calcTotal(insumosDirectos);
    const totalII = calcTotal(insumosIndirectos);
    const totalProv = calcTotal(provisiones);
    const total = totalMP + totalMO + totalID + totalII + totalProv;
    
    return { totalMP, totalMO, totalID, totalII, totalProv, total };
  }, [materiaPrima, manoObra, insumosDirectos, insumosIndirectos, provisiones]);

  // Advertencia de cambios sin guardar
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
    if (!isDisenadora) {
      alert('No tienes permisos para guardar fichas de diseño');
      return;
    }

    if (!referencia || !disenadoraId) {
      alert('Referencia y diseñadora son obligatorios');
      return;
    }

    setIsLoading(true);

    const fichaData = {
      referencia,
      disenadoraId,
      descripcion,
      marca,
      novedad,
      muestra1,
      muestra2,
      observaciones,
      foto1,
      foto2,
      materiaPrima,
      manoObra,
      insumosDirectos,
      insumosIndirectos,
      provisiones
    };

    try {
      let result;
      if (isNueva || !fichaExistente) {
        result = await apiFichas.createFichaDiseno(fichaData, user.name);
      } else {
        result = await apiFichas.updateFichaDiseno(referencia!, fichaData);
      }

      if (result.success) {
        setHasUnsavedChanges(false);
        alert('✅ Ficha guardada exitosamente');
        
        // Recargar datos
        const fichas = await apiFichas.getFichasDiseno();
        updateState(prev => ({ ...prev, fichasDiseno: fichas }));
        
        navigate('/fichas-diseno');
      } else {
        alert('❌ Error al guardar: ' + result.message);
      }
    } catch (error) {
      console.error('Error guardando ficha:', error);
      alert('❌ Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const disenadoraNombre = state.disenadoras.find(d => d.id === disenadoraId)?.nombre || '';

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (hasUnsavedChanges) {
                  if (confirm('¿Salir sin guardar cambios?')) navigate('/fichas-diseno');
                } else {
                  navigate('/fichas-diseno');
                }
              }}
              className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{referencia}</h2>
              <p className="text-slate-500 font-bold text-xs mt-1">
                Diseñadora: {disenadoraNombre}
                {fichaExistente?.importada && <span className="ml-2 text-blue-600">• Importada a Costos</span>}
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
          {/* Fotos */}
          <SubidaFotos
            referencia={referencia || ''}
            foto1={foto1}
            foto2={foto2}
            onFoto1Change={(path) => { setFoto1(path); setHasUnsavedChanges(true); }}
            onFoto2Change={(path) => { setFoto2(path); setHasUnsavedChanges(true); }}
            readOnly={!isDisenadora}
          />

          {/* Info Básica - Solo Descripción */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest">Información Básica</h3>
            
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Descripción de Prenda
              </label>
              <input
                type="text"
                value={descripcion}
                onChange={(e) => { setDescripcion(e.target.value); setHasUnsavedChanges(true); }}
                readOnly={!isDisenadora}
                placeholder="Ej: Bomber jacket con cierre frontal"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-pink-100 focus:border-pink-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Observaciones
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => { setObservaciones(e.target.value); setHasUnsavedChanges(true); }}
                readOnly={!isDisenadora}
                rows={4}
                placeholder="Notas adicionales..."
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-pink-100 focus:border-pink-500 resize-none"
              />
            </div>
          </div>

          {/* Costo Total */}
          <div className="bg-gradient-to-br from-pink-600 to-pink-500 p-6 rounded-3xl text-white shadow-lg">
            <p className="text-sm font-black uppercase tracking-widest opacity-90 mb-2">Costo Total</p>
            <p className="text-5xl font-black">$ {totales.total.toLocaleString()}</p>
          </div>
        </div>

        {/* COLUMNA DERECHA - Secciones */}
        <div className="space-y-6">
          {/* Detalles Adicionales */}
          <div className="bg-slate-100 p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest">Detalles Adicionales</h3>
            
            {/* Renglón 1: Descripción y Novedad */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => { setDescripcion(e.target.value); setHasUnsavedChanges(true); }}
                  readOnly={!isDisenadora}
                  placeholder="Ej: Bomber jacket con cierre frontal"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-pink-100 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                  Novedad o Correría
                </label>
                <input
                  type="text"
                  value={novedad}
                  onChange={(e) => { setNovedad(e.target.value); setHasUnsavedChanges(true); }}
                  readOnly={!isDisenadora}
                  placeholder="Texto libre"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-pink-100 focus:border-pink-500"
                />
              </div>
            </div>

            {/* Renglón 2: Marca, Muestra 1 y Muestra 2 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                  Marca
                </label>
                <input
                  type="text"
                  value={marca}
                  onChange={(e) => { setMarca(e.target.value); setHasUnsavedChanges(true); }}
                  readOnly={!isDisenadora}
                  placeholder="Ej: PLOW"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-pink-100 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                  Muestra #1
                </label>
                <input
                  type="text"
                  value={muestra1}
                  onChange={(e) => { setMuestra1(e.target.value); setHasUnsavedChanges(true); }}
                  readOnly={!isDisenadora}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-pink-100 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                  Muestra #2
                </label>
                <input
                  type="text"
                  value={muestra2}
                  onChange={(e) => { setMuestra2(e.target.value); setHasUnsavedChanges(true); }}
                  readOnly={!isDisenadora}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-pink-100 focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          <SeccionConceptos
            titulo="MATERIA PRIMA"
            color="pink"
            conceptos={materiaPrima}
            onChange={(c) => { setMateriaPrima(c); setHasUnsavedChanges(true); }}
            readOnly={!isDisenadora}
            mostrarTipo={true}
          />

          <SeccionConceptos
            titulo="MANO DE OBRA"
            color="blue"
            conceptos={manoObra}
            onChange={(c) => { setManoObra(c); setHasUnsavedChanges(true); }}
            readOnly={!isDisenadora}
          />

          <SeccionConceptos
            titulo="INSUMOS DIRECTOS"
            color="slate"
            conceptos={insumosDirectos}
            onChange={(c) => { setInsumosDirectos(c); setHasUnsavedChanges(true); }}
            readOnly={!isDisenadora}
          />

          <SeccionConceptos
            titulo="INSUMOS INDIRECTOS"
            color="orange"
            conceptos={insumosIndirectos}
            onChange={(c) => { setInsumosIndirectos(c); setHasUnsavedChanges(true); }}
            readOnly={!isDisenadora}
          />

          <SeccionConceptos
            titulo="PROVISIONES"
            color="red"
            conceptos={provisiones}
            onChange={(c) => { setProvisiones(c); setHasUnsavedChanges(true); }}
            readOnly={!isDisenadora}
          />
        </div>
      </div>

      {/* Botón Guardar */}
      {isDisenadora && (
        <button
          onClick={handleGuardar}
          disabled={isLoading}
          className="w-full py-6 bg-gradient-to-r from-pink-600 to-pink-500 text-white font-black text-2xl rounded-3xl shadow-2xl hover:shadow-pink-200 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
        >
          {isLoading ? 'GUARDANDO...' : 'GUARDAR FICHA'}
        </button>
      )}
    </div>
  );
};

export default FichasDisenoDetalle;
