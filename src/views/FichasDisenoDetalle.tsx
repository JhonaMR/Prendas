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
import { VisorMolde } from '../components/modules/VisorMolde';
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
    const [modalFotos, setModalFotos] = useState(false);
    const [modalPsd, setModalPsd] = useState(false);

    const [disenadoraId, setDisenadoraId] = useState(params?.disenadoraId || '');
    const [descripcion, setDescripcion] = useState('');
    const [marca, setMarca] = useState('');
    const [novedad, setNovedad] = useState('');
    const [muestra1, setMuestra1] = useState('');
    const [muestra2, setMuestra2] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [foto1, setFoto1] = useState<string | null>(null);
    const [foto2, setFoto2] = useState<string | null>(null);
    const [foto3, setFoto3] = useState<string | null>(null);
    const [archivoPsd, setArchivoPsd] = useState<string | null>(null);
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
            setFoto3(fichaExistente.foto3 ?? null);
            setArchivoPsd(fichaExistente.archivoPsd ?? null);
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
        const fichaData = { referencia, disenadoraId, descripcion, marca, novedad, muestra1, muestra2, observaciones, foto1, foto2, foto3, archivoPsd, materiaPrima, manoObra, insumosDirectos, insumosIndirectos, provisiones };
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

                    {/* Botón Ver Fotos */}
                    <button
                        onClick={() => setModalFotos(true)}
                        title="Ver fotos de la referencia"
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 font-black text-xs uppercase tracking-wider transition-all ${isDark ? 'border-violet-600 text-violet-300 hover:bg-violet-700/40' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                        <span>Ver Fotos</span>
                    </button>

                    {/* Botón Visor Molde */}
                    <button
                        onClick={() => setModalPsd(true)}
                        title={archivoPsd ? 'Abrir visor de molde' : 'No hay molde cargado'}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 font-black text-xs uppercase tracking-wider transition-all ${
                            archivoPsd
                                ? isDark
                                    ? 'border-violet-500 text-violet-300 hover:bg-violet-700/40'
                                    : 'border-violet-400 text-violet-600 hover:bg-violet-50'
                                : isDark
                                    ? 'border-slate-600 text-slate-500 hover:border-slate-500'
                                    : 'border-slate-300 text-slate-400 hover:border-slate-400'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                        <span>Visor Molde</span>
                    </button>

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
                    <SubidaFotos referencia={referencia} foto1={foto1} foto2={foto2} foto3={foto3} archivoPsd={archivoPsd} onFoto1Change={mark(setFoto1)} onFoto2Change={mark(setFoto2)} onFoto3Change={mark(setFoto3)} onArchivoPsdChange={mark(setArchivoPsd)} readOnly={!canEdit} />
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

            {/* ── Modal Ver Fotos ─────────────────────────────────────────── */}
            {modalFotos && (
                <ModalVerFotos
                    referencia={referencia}
                    foto1={foto1}
                    foto2={foto2}
                    foto3={foto3}
                    isDark={isDark}
                    onClose={() => setModalFotos(false)}
                />
            )}

            {/* ── Modal Visor PSD ─────────────────────────────────────────── */}
            {modalPsd && (
                <ModalVisorPsd
                    referencia={referencia}
                    archivoPsd={archivoPsd}
                    isDark={isDark}
                    onClose={() => setModalPsd(false)}
                />
            )}
        </div>
    );
};

// ============================================
// MODAL: Ver Fotos (1, 2 y 3)
// ============================================

interface ModalVerFotosProps {
    referencia: string;
    foto1: string | null;
    foto2: string | null;
    foto3: string | null;
    isDark: boolean;
    onClose: () => void;
}

const ModalVerFotos: React.FC<ModalVerFotosProps> = ({ referencia, foto1, foto2, foto3, isDark, onClose }) => {
    const [indice, setIndice] = useState(0);

    const getBaseUrl = (): string => {
        if ((window as any).API_CONFIG?.getApiUrl) {
            return (window as any).API_CONFIG.getApiUrl().replace('/api', '');
        }
        return `${window.location.protocol}//${window.location.hostname}:3000`;
    };

    const fotos = [foto1, foto2, foto3]
        .map((f, i) => ({ src: f ? `${getBaseUrl()}${f}` : null, label: `Foto ${i + 1}` }))
        .filter(f => f.src !== null) as { src: string; label: string }[];

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { onClose(); e.stopImmediatePropagation(); }
            if (e.key === 'ArrowRight') setIndice(i => (i + 1) % fotos.length);
            if (e.key === 'ArrowLeft') setIndice(i => (i - 1 + fotos.length) % fotos.length);
        };
        document.addEventListener('keydown', handler, true);
        return () => document.removeEventListener('keydown', handler, true);
    }, [fotos.length]);

    if (fotos.length === 0) {
        return (
            <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 bg-slate-900/80" onClick={onClose}>
                <div className={`p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-8 h-8 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                    </div>
                    <p className={`font-black text-lg mb-1 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>{referencia}</p>
                    <p className={`font-bold text-sm ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>No hay fotos cargadas para esta referencia</p>
                    <button onClick={onClose} className={`mt-6 px-6 py-2 rounded-xl font-black text-sm uppercase tracking-wider transition-colors ${isDark ? 'bg-violet-700 hover:bg-violet-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>Cerrar</button>
                </div>
            </div>
        );
    }

    const foto = fotos[indice];

    return (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 bg-slate-900/85" onClick={onClose}>
            <div className="relative flex flex-col items-center max-w-4xl w-full" onClick={e => e.stopPropagation()}>
                {/* Imagen */}
                <img
                    src={foto.src}
                    alt={foto.label}
                    className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl"
                />

                {/* Label y contador */}
                <div className={`mt-4 flex items-center gap-3 px-5 py-2 rounded-full font-black text-sm ${isDark ? 'bg-slate-800/80 text-violet-200' : 'bg-white/90 text-slate-700'}`}>
                    <span>{referencia}</span>
                    <span className={isDark ? 'text-violet-500' : 'text-slate-300'}>•</span>
                    <span>{foto.label}</span>
                    {fotos.length > 1 && (
                        <>
                            <span className={isDark ? 'text-violet-500' : 'text-slate-300'}>•</span>
                            <span className={isDark ? 'text-violet-400' : 'text-slate-400'}>{indice + 1} / {fotos.length}</span>
                        </>
                    )}
                </div>

                {/* Navegación entre fotos */}
                {fotos.length > 1 && (
                    <>
                        <button
                            onClick={() => setIndice(i => (i - 1 + fotos.length) % fotos.length)}
                            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-3 rounded-full shadow-lg transition-colors ${isDark ? 'bg-violet-700 hover:bg-violet-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-800'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                        </button>
                        <button
                            onClick={() => setIndice(i => (i + 1) % fotos.length)}
                            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-3 rounded-full shadow-lg transition-colors ${isDark ? 'bg-violet-700 hover:bg-violet-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-800'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                        </button>
                    </>
                )}

                {/* Cerrar */}
                <button
                    onClick={onClose}
                    className={`absolute top-0 right-0 -translate-y-2 translate-x-2 p-3 rounded-full shadow-lg transition-colors ${isDark ? 'bg-violet-700 hover:bg-violet-800 text-white' : 'bg-white hover:bg-slate-100 text-slate-800'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* Miniaturas */}
                {fotos.length > 1 && (
                    <div className="flex gap-3 mt-4">
                        {fotos.map((f, i) => (
                            <button
                                key={i}
                                onClick={() => setIndice(i)}
                                className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === indice ? (isDark ? 'border-violet-400 scale-110' : 'border-violet-500 scale-110') : (isDark ? 'border-slate-600 opacity-60' : 'border-slate-300 opacity-60')}`}
                            >
                                <img src={f.src} alt={f.label} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================
// MODAL: Visor PSD
// ============================================

interface ModalVisorPsdProps {
    referencia: string;
    archivoPsd: string | null;
    isDark: boolean;
    onClose: () => void;
}

const ModalVisorPsd: React.FC<ModalVisorPsdProps> = ({ referencia, archivoPsd, isDark, onClose }) => {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { onClose(); e.stopImmediatePropagation(); }
        };
        document.addEventListener('keydown', handler, true);
        return () => document.removeEventListener('keydown', handler, true);
    }, []);

    // Sin PSD cargado → aviso
    if (!archivoPsd) {
        return (
            <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 bg-slate-900/80" onClick={onClose}>
                <div className={`p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-amber-900/40' : 'bg-amber-50'}`}>
                        {/* Triángulo de alerta */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-9 h-9 text-amber-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                    </div>
                    <p className={`font-black text-lg mb-2 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>{referencia}</p>
                    <p className={`font-bold text-sm leading-relaxed ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>
                        No hay molde cargado<br />para esta referencia
                    </p>
                    <button onClick={onClose} className={`mt-6 px-6 py-2 rounded-xl font-black text-sm uppercase tracking-wider transition-colors ${isDark ? 'bg-violet-700 hover:bg-violet-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>Cerrar</button>
                </div>
            </div>
        );
    }

    // Con PSD cargado → placeholder del visor (se implementará con ag-psd)
    const nombreArchivo = archivoPsd.split('/').pop() || archivoPsd;

    return (
        <div className="fixed inset-0 pt-20 backdrop-blur-sm z-50 flex items-center justify-center p-4 bg-slate-900/85" onClick={onClose}>
            <div
                className={`relative w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}
                style={{ height: 'calc(90vh - 80px)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header del visor */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-violet-700' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isDark ? 'bg-violet-700/40' : 'bg-violet-50'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 ${isDark ? 'text-violet-300' : 'text-violet-600'}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                        </div>
                        <div>
                            <p className={`font-black text-sm ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>{referencia} — Molde</p>
                            <p className={`font-bold text-xs ${isDark ? 'text-violet-500' : 'text-slate-400'}`}>{nombreArchivo}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-violet-700/50 text-violet-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Cuerpo — visor DXF/SVG */}
                <div className={`${isDark ? 'bg-[#3d2d52]' : 'bg-slate-50'}`}>
                    <VisorMolde
                        archivoUrl={`${(() => {
                            if ((window as any).API_CONFIG?.getApiUrl) {
                                return (window as any).API_CONFIG.getApiUrl().replace('/api', '');
                            }
                            return `${window.location.protocol}//${window.location.hostname}:3000`;
                        })()}${archivoPsd}`}
                        nombreArchivo={nombreArchivo}
                        referencia={referencia}
                        isDark={isDark}
                        altura={Math.round(window.innerHeight * 0.9 - 80 - 60)}
                    />
                </div>
            </div>
        </div>
    );
};

export default FichasDisenoDetalle;
