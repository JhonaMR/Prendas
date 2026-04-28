// ============================================
// VISTA: Fichas Diseño Detalle
// Editor completo de ficha de diseño
// ============================================

import React, { useState, useEffect, useMemo } from 'react';
import { AppState } from '../types';
import { ConceptoFicha } from '../types/typesFichas';
import apiFichas from '../services/apiFichas';
import SeccionConceptos from '../components/modules/SeccionConceptos';
import SubidaFotos from '../components/modules/SubidaFotos';
import { useDarkMode } from '../context/DarkModeContext';

interface Props {
    state: AppState;
    user: any;
    updateState: (u: (p: AppState) => AppState) => void;
    onNavigate: (view: string, params?: any) => void;
    params?: any;
}

const FichasDisenoDetalle: React.FC<Props> = ({ state, user, updateState, onNavigate, params }) => {
    const { isDark } = useDarkMode();
    const referencia = params?.referencia || '';
    const isNueva = params?.nueva || false;

    const fichaExistente = (state.fichasDiseno || []).find(f => f.referencia === referencia);

    const isDisenadora = user?.role === 'diseñadora';
    const isGeneral = user?.role === 'general';
    const isAdminOrSoporte = user?.role === 'admin' || user?.role === 'soporte';
    const isImportada = fichaExistente?.importada === true;
    // Si la ficha está importada, solo admin y soporte pueden editar
    const canEdit = !isGeneral && (isAdminOrSoporte || (!isImportada && isDisenadora));
    const [isLoading, setIsLoading] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const [disenadoraId, setDisenadoraId] = useState(params?.disenadoraId || '');
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

    useEffect(() => {
        if (fichaExistente && !isNueva) {
            setDisenadoraId(fichaExistente.disenadoraId);
            setDescripcion(fichaExistente.descripcion || '');
            setMarca(fichaExistente.marca || '');
            setNovedad(fichaExistente.novedad || '');
            setMuestra1(fichaExistente.muestra1 || '');
            setMuestra2(fichaExistente.muestra2 || '');
            setObservaciones(fichaExistente.observaciones || '');
            setFoto1(fichaExistente.foto1);
            setFoto2(fichaExistente.foto2);
            setMateriaPrima(fichaExistente.materiaPrima || []);
            setManoObra(fichaExistente.manoObra || []);
            setInsumosDirectos(fichaExistente.insumosDirectos || []);
            setInsumosIndirectos(fichaExistente.insumosIndirectos || []);
            setProvisiones(fichaExistente.provisiones || []);
        }
    }, [fichaExistente?.referencia]);

    // ESC → volver al mosaico
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (hasUnsavedChanges) {
                    if (confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir? Se perderán los cambios.')) {
                        onNavigate('fichas-diseno');
                    }
                } else {
                    onNavigate('fichas-diseno');
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [hasUnsavedChanges]);

    // Cargar valores base cuando se crea una nueva ficha
    useEffect(() => {
        if (isNueva && manoObra.length === 0 && insumosDirectos.length === 0 && provisiones.length === 0) {
            setManoObra([
                { concepto: 'CONFECCION / ', um: 'UNIDAD', vlr_unit: 0, cant: 1, total: 0 },
                { concepto: 'EMPAQUE', um: 'UNIDAD', vlr_unit: 200, cant: 1, total: 200 },
                { concepto: 'CORTE', um: 'UNIDAD', vlr_unit: 500, cant: 1, total: 500 }
            ]);
            setInsumosDirectos([
                { concepto: 'MARQUILLA', um: 'UNIDAD', vlr_unit: 70, cant: 1, total: 70 },
                { concepto: 'MARQUILLA TECNICA', um: 'UNIDAD', vlr_unit: 10, cant: 1, total: 10 },
                { concepto: 'ETIQUETA', um: 'UNIDAD', vlr_unit: 90, cant: 1, total: 90 },
                { concepto: 'CODIGO BARRAS', um: 'UNIDAD', vlr_unit: 10, cant: 2, total: 20 },
                { concepto: 'BOLSA', um: 'UNIDAD', vlr_unit: 94, cant: 1, total: 94 }
            ]);
            
            // Calcular PROV. DSCTO CCIAL
            const calcDesctoComercial = () => {
                const totalMP = 0; // En nueva ficha no hay materia prima aún
                const totalMO = 200 + 500; // EMPAQUE + CORTE
                const totalID = 70 + 10 + 90 + 10 * 2 + 94; // Suma de insumos directos
                const totalII = 0; // En nueva ficha no hay insumos indirectos aún
                const suma = totalMP + totalMO + totalID + totalII;
                const conMargen = suma * 1.35;
                const descto70 = conMargen * 0.70;
                const desctoFinal = descto70 * 0.19;
                return Math.round(desctoFinal);
            };
            
            setProvisiones([
                { concepto: 'PROV. CARTERA', um: 'UNIDAD', vlr_unit: 200, cant: 1, total: 200 },
                { concepto: 'SERVICIOS CONFECCIONISTAS', um: 'UNIDAD', vlr_unit: 200, cant: 1, total: 200 },
                { concepto: 'TRANSPORTE', um: 'UNIDAD', vlr_unit: 0, cant: 1, total: 0 },
                { concepto: 'PROV. DSCTO CCIAL', um: 'UNIDAD', vlr_unit: calcDesctoComercial(), cant: 1, total: calcDesctoComercial() }
            ]);
        }
    }, [isNueva]);

    const totales = useMemo(() => {
        const calcTotal = (items: ConceptoFicha[]) => items.reduce((acc, i) => acc + (i.total || 0), 0);
        const totalMP = calcTotal(materiaPrima); const totalMO = calcTotal(manoObra);
        const totalID = calcTotal(insumosDirectos); const totalII = calcTotal(insumosIndirectos);
        const totalProv = calcTotal(provisiones);
        return { totalMP, totalMO, totalID, totalII, totalProv, total: totalMP + totalMO + totalID + totalII + totalProv };
    }, [materiaPrima, manoObra, insumosDirectos, insumosIndirectos, provisiones]);

    const handleGuardar = async () => {
        if (!canEdit) { alert('No tienes permisos para guardar fichas de diseño'); return; }
        if (!referencia || !disenadoraId) { alert('Referencia y diseñadora son obligatorios'); return; }
        setIsLoading(true);
        const fichaData = { referencia, disenadoraId, descripcion, marca, novedad, muestra1, muestra2, observaciones, foto1, foto2, materiaPrima, manoObra, insumosDirectos, insumosIndirectos, provisiones };
        try {
            const result = isNueva || !fichaExistente
                ? await apiFichas.createFichaDiseno(fichaData, user.name)
                : await apiFichas.updateFichaDiseno(referencia, fichaData);
            if (result.success) {
                setHasUnsavedChanges(false);
                alert('✅ Ficha guardada exitosamente');
                const fichas = await apiFichas.getFichasDiseno();
                updateState(prev => ({ ...prev, fichasDiseno: fichas }));
            } else alert('❌ Error al guardar: ' + result.message);
        } catch { alert('❌ Error de conexión'); }
        finally { setIsLoading(false); }
    };

    const disenadoraNombre = (state.disenadoras || []).find(d => d.id === disenadoraId)?.nombre || '';
    const mark = (setter: any) => (v: any) => { setter(v); setHasUnsavedChanges(true); };

    return (
        <div className={`space-y-6 pb-20 transition-colors ${isDark ? 'bg-[#3d2d52]' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => { if (hasUnsavedChanges) { if (confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir? Se perderán los cambios.')) onNavigate('fichas-diseno'); } else onNavigate('fichas-diseno'); }}
                        className={`p-3 rounded-xl transition-colors ${isDark ? 'bg-violet-700/50 hover:bg-violet-700 text-violet-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                    </button>
                    <div>
                        <h2 className={`text-3xl font-black tracking-tighter transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{referencia}</h2>
                        <p className={`font-bold text-xs mt-1 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>Diseñadora: {disenadoraNombre}{fichaExistente?.importada && <span className={`ml-2 transition-colors ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>• Importada a Costos</span>}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {hasUnsavedChanges && (<div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${isDark ? 'bg-pink-600/30 text-pink-300' : 'bg-red-50 text-red-600'}`}><div className={`w-2 h-2 rounded-full animate-pulse transition-colors ${isDark ? 'bg-pink-500' : 'bg-red-500'}`}></div><span className="font-bold text-sm">Cambios sin guardar</span></div>)}
                    {canEdit && (
                        <button 
                            onClick={handleGuardar} 
                            disabled={isLoading} 
                            className={`px-4 py-2 text-white font-black rounded-xl uppercase text-xs hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-gradient-to-r from-pink-700 to-pink-600 hover:from-pink-800 hover:to-pink-700' : 'bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600'}`}
                        >
                            {isLoading ? 'GUARDANDO...' : 'GUARDAR'}
                        </button>
                    )}
                </div>
            </div>

            {isImportada && !isAdminOrSoporte && (
                <div className={`flex items-center gap-3 px-5 py-4 border rounded-2xl transition-colors ${isDark ? 'bg-blue-900/40 border-blue-700/50 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                    <span className="font-bold text-sm">Esta ficha fue importada a costos y no puede ser editada.</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6">
                    <SubidaFotos referencia={referencia} foto1={foto1} foto2={foto2} onFoto1Change={mark(setFoto1)} onFoto2Change={mark(setFoto2)} readOnly={!canEdit} />
                    <div className={`p-6 rounded-3xl border shadow-sm space-y-4 transition-colors ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
                        <div>
                            <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Observaciones</label>
                            <textarea value={observaciones} onChange={e => { setObservaciones(e.target.value); setHasUnsavedChanges(true); }} readOnly={!canEdit} rows={10} className={`w-full px-4 py-3 border-2 rounded-xl font-bold resize-none transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-600 focus:ring-4 focus:ring-violet-400 focus:border-violet-500' : 'bg-slate-50 border-slate-200 text-slate-700 focus:ring-4 focus:ring-pink-100 focus:border-pink-500'}`} />
                        </div>
                    </div>
                </div>
                <div className="space-y-6 lg:col-span-2">
                    <div className={`p-6 rounded-3xl space-y-4 transition-colors ${isDark ? 'bg-[#4a3a63] border border-violet-700' : 'bg-slate-100'}`}>
                        <h3 className={`text-sm font-black uppercase tracking-widest transition-colors ${isDark ? 'text-violet-200' : 'text-slate-600'}`}>Información Básica</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>Descripción</label>
                                <input type="text" value={descripcion} onChange={e => mark(setDescripcion)(e.target.value)} readOnly={!canEdit} className={`w-full px-4 py-3 border-2 rounded-xl font-bold transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-600 focus:ring-4 focus:ring-violet-400 focus:border-violet-500' : 'bg-white border-slate-200 text-slate-700 focus:ring-4 focus:ring-pink-100 focus:border-pink-500'}`} />
                            </div>
                            <div>
                                <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>Novedad o Correría</label>
                                <input type="text" value={novedad} onChange={e => mark(setNovedad)(e.target.value)} readOnly={!canEdit} className={`w-full px-4 py-3 border-2 rounded-xl font-bold transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-600 focus:ring-4 focus:ring-violet-400 focus:border-violet-500' : 'bg-white border-slate-200 text-slate-700 focus:ring-4 focus:ring-pink-100 focus:border-pink-500'}`} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>Marca</label>
                                <input type="text" value={marca} onChange={e => mark(setMarca)(e.target.value)} readOnly={!canEdit} className={`w-full px-4 py-3 border-2 rounded-xl font-bold transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-600 focus:ring-4 focus:ring-violet-400 focus:border-violet-500' : 'bg-white border-slate-200 text-slate-700 focus:ring-4 focus:ring-pink-100 focus:border-pink-500'}`} />
                            </div>
                            <div>
                                <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>Muestra #1</label>
                                <input type="text" value={muestra1} onChange={e => mark(setMuestra1)(e.target.value)} readOnly={!canEdit} className={`w-full px-4 py-3 border-2 rounded-xl font-bold transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-600 focus:ring-4 focus:ring-violet-400 focus:border-violet-500' : 'bg-white border-slate-200 text-slate-700 focus:ring-4 focus:ring-pink-100 focus:border-pink-500'}`} />
                            </div>
                            <div>
                                <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>Muestra #2</label>
                                <input type="text" value={muestra2} onChange={e => mark(setMuestra2)(e.target.value)} readOnly={!canEdit} className={`w-full px-4 py-3 border-2 rounded-xl font-bold transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-600 focus:ring-4 focus:ring-violet-400 focus:border-violet-500' : 'bg-white border-slate-200 text-slate-700 focus:ring-4 focus:ring-pink-100 focus:border-pink-500'}`} />
                            </div>
                        </div>
                    </div>
                    <SeccionConceptos titulo="MATERIA PRIMA" color="pink" conceptos={materiaPrima} onChange={mark(setMateriaPrima)} readOnly={!canEdit} mostrarTipo={true} isDark={isDark} />
                    <SeccionConceptos titulo="MANO DE OBRA" color="blue" conceptos={manoObra} onChange={mark(setManoObra)} readOnly={!canEdit} isDark={isDark} />
                    <SeccionConceptos titulo="INSUMOS DIRECTOS" color="slate" conceptos={insumosDirectos} onChange={mark(setInsumosDirectos)} readOnly={!canEdit} isDark={isDark} />
                    <SeccionConceptos titulo="INSUMOS INDIRECTOS" color="orange" conceptos={insumosIndirectos} onChange={mark(setInsumosIndirectos)} readOnly={!canEdit} isDark={isDark} />
                    <SeccionConceptos titulo="PROVISIONES" color="red" conceptos={provisiones} onChange={mark(setProvisiones)} readOnly={!canEdit} totalesOtrosCostos={{ totalMP: totales.totalMP, totalMO: totales.totalMO, totalID: totales.totalID, totalII: totales.totalII }} isDark={isDark} />
                </div>
            </div>

            {canEdit && (
                <button onClick={handleGuardar} disabled={isLoading} className={`w-full py-6 text-white font-black text-2xl rounded-3xl shadow-2xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider ${isDark ? 'bg-gradient-to-r from-pink-700 to-pink-600 hover:from-pink-800 hover:to-pink-700 hover:shadow-pink-900/50' : 'bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 hover:shadow-pink-200'}`}>
                    {isLoading ? 'GUARDANDO...' : 'GUARDAR FICHA'}
                </button>
            )}
        </div>
    );
};

export default FichasDisenoDetalle;
