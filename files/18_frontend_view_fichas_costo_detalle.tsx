// ============================================
// VISTA: Fichas Costo Detalle
// Editor completo con precio, rentabilidad y cortes
// ============================================

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppState, ConceptoFicha } from '../types/typesFichas';
import apiFichas from '../services/apiFichas';
import SeccionConceptos from '../components/SeccionConceptos';
import SubidaFotos from '../components/SubidaFotos';

interface FichasCostoDetalleProps {
  state: AppState;
  user: any;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const FichasCostoDetalle: React.FC<FichasCostoDetalleProps> = ({ state, user, updateState }) => {
  const { referencia } = useParams<{ referencia: string }>();
  const navigate = useNavigate();
  
  const isAdmin = user?.role === 'admin';
  const canEdit = isAdmin;
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showModalCorte, setShowModalCorte] = useState(false);
  const [numeroCorteNuevo, setNumeroCorteNuevo] = useState(1);

  // Estados
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

  const [precioVenta, setPrecioVenta] = useState(0);
  const [rentabilidad, setRentabilidad] = useState(49);

  const fichaExistente = state.fichasCosto.find(f => f.referencia === referencia);

  // Funciones de cálculo
  const ajustarA900 = (valor: number): number => {
    if (valor <= 0) return 0;
    const miles = Math.ceil(valor / 1000);
    return miles * 1000 - 100;
  };

  const calcularPrecioVenta = (costo: number, rent: number): number => {
    return ajustarA900(costo * (1 + rent / 100));
  };

  const calcularRentabilidad = (precio: number, costo: number): number => {
    if (costo === 0) return 0;
    return ((precio / costo) - 1) * 100;
  };

  // Cargar datos
  useEffect(() => {
    if (fichaExistente) {
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
      setPrecioVenta(fichaExistente.precioVenta);
      setRentabilidad(fichaExistente.rentabilidad);
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
    const costoContabilizar = total - totalProv;
    
    return { totalMP, totalMO, totalID, totalII, totalProv, total, costoContabilizar };
  }, [materiaPrima, manoObra, insumosDirectos, insumosIndirectos, provisiones]);

  // Calcular descuentos
  const descuentos = useMemo(() => {
    const calc = (desc: number) => {
      const precio = ajustarA900(precioVenta * (1 - desc / 100));
      const rent = calcularRentabilidad(precio, totales.total);
      return { precio, rent };
    };

    return {
      desc0: { precio: precioVenta, rent: rentabilidad },
      desc5: calc(5),
      desc10: calc(10),
      desc15: calc(15)
    };
  }, [precioVenta, rentabilidad, totales.total]);

  // Margen ganancia cliente
  const margenGanancia = useMemo(() => {
    return ajustarA900(precioVenta * 0.35);
  }, [precioVenta]);

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
      alert('No tienes permisos para editar fichas de costo');
      return;
    }

    setIsLoading(true);

    const fichaData = {
      referencia: referencia!,
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
      const result = await apiFichas.updateFichaCosto(
        referencia!,
        fichaData,
        precioVenta,
        rentabilidad
      );

      if (result.success) {
        setHasUnsavedChanges(false);
        alert('✅ Ficha guardada exitosamente');
        
        const fichas = await apiFichas.getFichasCosto();
        updateState(prev => ({ ...prev, fichasCosto: fichas }));
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

  const handleAsentarCorte = () => {
    const numCortes = fichaExistente?.cortes?.length || 0;
    setNumeroCorteNuevo(numCortes + 1);
    setShowModalCorte(true);
  };

  const confirmarCorte = () => {
    setShowModalCorte(false);
    navigate(`/fichas-costo/${referencia}/corte/${numeroCorteNuevo}`, {
      state: { nuevo: true }
    });
  };

  const numCortes = fichaExistente?.cortes?.length || 0;
  const cantidadTotalCortada = fichaExistente?.cantidadTotalCortada || 0;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (hasUnsavedChanges) {
                  if (confirm('¿Salir sin guardar cambios?')) navigate('/fichas-costo');
                } else {
                  navigate('/fichas-costo');
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
                Diseñadora: {fichaExistente?.disenadoraNombre || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-bold text-sm">Cambios sin guardar</span>
            </div>
          )}

          {/* Botones de Cortes */}
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-yellow-500 text-white font-black rounded-xl uppercase text-xs"
              onClick={() => navigate(`/fichas-costo/${referencia}`)}
            >
              Costeo Inicial
            </button>
            
            {[1, 2, 3, 4].map(num => {
              const existe = num <= numCortes;
              return (
                <button
                  key={num}
                  onClick={() => existe ? navigate(`/fichas-costo/${referencia}/corte/${num}`) : (num === numCortes + 1 ? handleAsentarCorte() : null)}
                  disabled={num > numCortes + 1}
                  className={`px-4 py-2 font-black rounded-xl uppercase text-xs transition-all ${
                    existe 
                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                      : num === numCortes + 1
                      ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      : 'bg-slate-100 text-slate-300 opacity-50 cursor-not-allowed'
                  }`}
                >
                  Corte #{num}
                </button>
              );
            })}
          </div>
        </div>
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
            readOnly={!canEdit}
          />

          {/* Info Básica */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest">Información Básica</h3>
            
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Descripción
              </label>
              <input
                type="text"
                value={descripcion}
                onChange={(e) => { setDescripcion(e.target.value); setHasUnsavedChanges(true); }}
                readOnly={!canEdit}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Marca
              </label>
              <input
                type="text"
                value={marca}
                onChange={(e) => { setMarca(e.target.value); setHasUnsavedChanges(true); }}
                readOnly={!canEdit}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Novedad
              </label>
              <input
                type="text"
                value={novedad}
                onChange={(e) => { setNovedad(e.target.value); setHasUnsavedChanges(true); }}
                readOnly={!canEdit}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Muestra #1
                </label>
                <input
                  type="text"
                  value={muestra1}
                  onChange={(e) => { setMuestra1(e.target.value); setHasUnsavedChanges(true); }}
                  readOnly={!canEdit}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Muestra #2
                </label>
                <input
                  type="text"
                  value={muestra2}
                  onChange={(e) => { setMuestra2(e.target.value); setHasUnsavedChanges(true); }}
                  readOnly={!canEdit}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Observaciones
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => { setObservaciones(e.target.value); setHasUnsavedChanges(true); }}
                readOnly={!canEdit}
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Rentabilidad vs Precio */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-3xl border-2 border-yellow-200 space-y-4">
            <h3 className="text-sm font-black text-yellow-700 uppercase tracking-widest">Rentabilidad vs Precio</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-yellow-600 uppercase tracking-widest block mb-2">
                  Costo Total
                </label>
                <div className="px-4 py-3 bg-white rounded-xl">
                  <p className="font-black text-2xl text-slate-800">$ {totales.total.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-yellow-600 uppercase tracking-widest block mb-2">
                  Costo Contabilizar
                </label>
                <div className="px-4 py-3 bg-white rounded-xl">
                  <p className="font-black text-2xl text-slate-800">$ {totales.costoContabilizar.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-yellow-600 uppercase tracking-widest block mb-2">
                Precio de Venta
              </label>
              <input
                type="number"
                value={precioVenta}
                onChange={(e) => {
                  const precio = Number(e.target.value);
                  setPrecioVenta(precio);
                  setRentabilidad(calcularRentabilidad(precio, totales.total));
                  setHasUnsavedChanges(true);
                }}
                readOnly={!canEdit}
                className="w-full px-4 py-4 bg-white border-2 border-yellow-300 rounded-xl font-black text-2xl focus:ring-4 focus:ring-yellow-200 focus:border-yellow-400"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-black text-yellow-600 uppercase tracking-widest block mb-2">
                  Rentabilidad %
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={rentabilidad.toFixed(1)}
                  onChange={(e) => {
                    const rent = Number(e.target.value);
                    setRentabilidad(rent);
                    setPrecioVenta(calcularPrecioVenta(totales.total, rent));
                    setHasUnsavedChanges(true);
                  }}
                  readOnly={!canEdit}
                  className="w-full px-4 py-4 bg-white border-2 border-yellow-300 rounded-xl font-black text-2xl focus:ring-4 focus:ring-yellow-200 focus:border-yellow-400"
                />
              </div>
              <div className="pt-7">
                <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-yellow-700">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                </div>
              </div>
            </div>

            <p className="text-xs text-yellow-700 font-bold italic">
              Los precios se ajustan automáticamente para terminar en 900
            </p>
          </div>

          {/* Cantidad Cortada */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-3xl border-2 border-purple-200">
            <h3 className="text-sm font-black text-purple-700 uppercase tracking-widest mb-3">Cantidad Total Cortada</h3>
            <p className="text-6xl font-black text-purple-600">{cantidadTotalCortada}</p>
            <p className="text-xs text-purple-600 font-bold mt-2">{numCortes} corte{numCortes !== 1 ? 's' : ''} asentado{numCortes !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-6">
          {/* Secciones */}
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

          {/* Descuentos */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-3xl border-2 border-orange-200">
            <h3 className="text-sm font-black text-orange-700 uppercase tracking-widest mb-4">Posibles Descuentos</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-orange-300">
                  <th className="py-2 text-left font-black text-orange-600 uppercase text-xs">Desc</th>
                  <th className="py-2 text-right font-black text-orange-600 uppercase text-xs">Precio</th>
                  <th className="py-2 text-right font-black text-orange-600 uppercase text-xs">Rent %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-200">
                <tr>
                  <td className="py-3 font-black text-slate-700">0%</td>
                  <td className="py-3 text-right font-black text-slate-800">$ {descuentos.desc0.precio.toLocaleString()}</td>
                  <td className="py-3 text-right font-black text-green-600">{descuentos.desc0.rent.toFixed(1)}%</td>
                </tr>
                <tr>
                  <td className="py-3 font-black text-slate-700">5%</td>
                  <td className="py-3 text-right font-black text-slate-800">$ {descuentos.desc5.precio.toLocaleString()}</td>
                  <td className="py-3 text-right font-black text-green-600">{descuentos.desc5.rent.toFixed(1)}%</td>
                </tr>
                <tr>
                  <td className="py-3 font-black text-slate-700">10%</td>
                  <td className="py-3 text-right font-black text-slate-800">$ {descuentos.desc10.precio.toLocaleString()}</td>
                  <td className="py-3 text-right font-black text-green-600">{descuentos.desc10.rent.toFixed(1)}%</td>
                </tr>
                <tr>
                  <td className="py-3 font-black text-slate-700">15%</td>
                  <td className="py-3 text-right font-black text-slate-800">$ {descuentos.desc15.precio.toLocaleString()}</td>
                  <td className="py-3 text-right font-black text-green-600">{descuentos.desc15.rent.toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Margen Ganancia */}
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-3xl border-2 border-pink-200">
            <h3 className="text-sm font-black text-pink-700 uppercase tracking-widest mb-3">Margen Ganancia Cliente</h3>
            <p className="text-2xl font-black text-pink-600 mb-2">35%</p>
            <p className="text-5xl font-black text-pink-700">$ {margenGanancia.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Botón Guardar */}
      {canEdit && (
        <button
          onClick={handleGuardar}
          disabled={isLoading}
          className="w-full py-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black text-2xl rounded-3xl shadow-2xl hover:shadow-blue-200 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
        >
          {isLoading ? 'GUARDANDO...' : 'GUARDAR FICHA'}
        </button>
      )}

      {/* Modal Asentar Corte */}
      {showModalCorte && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-yellow-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">¿Asentar Corte #{numeroCorteNuevo}?</h3>
              <p className="text-sm text-slate-500 font-bold">
                Se copiarán todos los conceptos y valores de la ficha inicial. Podrás editarlos de forma independiente.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModalCorte(false)}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-wide text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCorte}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-black rounded-xl hover:shadow-lg transition-all uppercase tracking-wide text-sm"
              >
                Asentar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FichasCostoDetalle;
