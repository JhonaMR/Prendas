// ============================================
// VISTA: Fichas Costo Detalle
// Editor con precio, rentabilidad y cortes
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

const FichasCostoDetalle: React.FC<Props> = ({ state, user, updateState, onNavigate, params }) => {
    const { isDark } = useDarkMode();
    const referencia = params?.referencia || '';
    const isAdmin = user?.role === 'admin' || user?.role === 'soporte';
    const isGeneral = user?.role === 'general';
    const canEdit = isAdmin || user?.role === 'operador';

    const [estadoRevision, setEstadoRevision] = useState<'rojo' | 'verde' | 'morado' | null>(null);
    const [showRevisionPicker, setShowRevisionPicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showModalCorte, setShowModalCorte] = useState(false);
    const [modalFotos, setModalFotos] = useState(false);
    const [modalMolde, setModalMolde] = useState(false);

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
    const [precioVenta, setPrecioVenta] = useState(0);
    const [rentabilidad, setRentabilidad] = useState(35);
    const [costoTotalGuardado, setCostoTotalGuardado] = useState(0);

    const fichaExistente = (state.fichasCosto || []).find(f => f.referencia === referencia);

    const ajustarA900 = (v: number) => { if (v <= 0) return 0; return Math.ceil(v / 1000) * 1000 - 100; };
    const calcPrecio = (costo: number, rent: number) => ajustarA900(costo / (1 - rent / 100));
    const calcRent = (precio: number, costo: number) => costo === 0 ? 0 : (1 - (costo / precio)) * 100;

    useEffect(() => {
        if (fichaExistente) {
            console.log('📋 Ficha cargada:', { referencia: fichaExistente.referencia, precioVenta: fichaExistente.precioVenta, rentabilidad: fichaExistente.rentabilidad, costoTotal: fichaExistente.costoTotal });
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
            const costoGuardado = fichaExistente.costoTotal || 0;
            const precioGuardado = fichaExistente.precioVenta || 0;
            // Si no tiene precio guardado, calcular automáticamente al 35%
            if (precioGuardado > 0) {
                setPrecioVenta(precioGuardado);
                setRentabilidad(fichaExistente.rentabilidad || calcRent(precioGuardado, costoGuardado));
            } else {
                const precioCalculado = ajustarA900(costoGuardado / (1 - 35 / 100));
                setPrecioVenta(precioCalculado);
                setRentabilidad(calcRent(precioCalculado, costoGuardado));
            }
            setCostoTotalGuardado(costoGuardado);
            setEstadoRevision(fichaExistente.estadoRevision || null);
        }
    }, [fichaExistente?.referencia]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (hasUnsavedChanges) {
                    if (confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir? Se perderán los cambios.')) {
                        onNavigate('fichas-costo');
                    }
                } else {
                    onNavigate('fichas-costo');
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [hasUnsavedChanges, onNavigate]);

    const totales = useMemo(() => {
        const calc = (items: ConceptoFicha[]) => Math.ceil(items.reduce((acc, i) => acc + (i.total || 0), 0));
        const totalMP = calc(materiaPrima), totalMO = calc(manoObra);
        const totalID = calc(insumosDirectos), totalII = calc(insumosIndirectos), totalProv = calc(provisiones);
        const total = totalMP + totalMO + totalID + totalII + totalProv;
        return { totalMP, totalMO, totalID, totalII, totalProv, total, costoContabilizar: total - totalProv };
    }, [materiaPrima, manoObra, insumosDirectos, insumosIndirectos, provisiones]);

    // Costo de referencia: usa el guardado en BD si existe, si no el calculado en vivo
    const costoRef = (fichaExistente?.costoTotal || costoTotalGuardado) > 0
        ? (fichaExistente?.costoTotal || costoTotalGuardado)
        : totales.total;

    const descuentos = useMemo(() => {
        const calc = (desc: number) => { const p = ajustarA900(precioVenta * (1 - desc / 100)); return { precio: p, rent: calcRent(p, costoRef) }; };
        return { desc0: { precio: precioVenta, rent: rentabilidad }, desc5: calc(5), desc10: calc(10), desc15: calc(15) };
    }, [precioVenta, rentabilidad, costoRef]);

    const margenGanancia = useMemo(() => ajustarA900(precioVenta + (precioVenta * 0.30)), [precioVenta]);

    const handleGuardar = async () => {
        if (!canEdit) { alert('No tienes permisos para editar fichas de costo'); return; }
        setIsLoading(true);
        try {
            const result = await apiFichas.updateFichaCosto(referencia, { referencia, descripcion, marca, novedad, muestra1, muestra2, observaciones, foto1, foto2: foto2 || null, foto3: foto3 || null, archivoPsd: archivoPsd || null, materiaPrima, manoObra, insumosDirectos, insumosIndirectos, provisiones }, precioVenta, rentabilidad, estadoRevision);
            if (result.success) {
                setHasUnsavedChanges(false); alert('✅ Ficha guardada exitosamente');
                const fichas = await apiFichas.getFichasCosto();
                updateState(prev => ({ ...prev, fichasCosto: fichas }));
            } else alert('❌ Error al guardar: ' + result.message);
        } catch { alert('❌ Error de conexión'); }
        finally { setIsLoading(false); }
    };

    const numCortes = fichaExistente?.cortes?.length || fichaExistente?.numCortes || 0;
    const mark = (setter: any) => (v: any) => { setter(v); setHasUnsavedChanges(true); };

    return (
        <div className={`space-y-6 pb-20 transition-colors ${isDark ? 'bg-[#3d2d52]' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => { if (hasUnsavedChanges) { if (confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir? Se perderán los cambios.')) onNavigate('fichas-costo'); } else onNavigate('fichas-costo'); }} className={`p-3 rounded-xl transition-colors ${isDark ? 'bg-violet-700/50 hover:bg-violet-700 text-violet-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                    </button>
                    <div>
                        <h2 className={`text-3xl font-black tracking-tighter transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{referencia}</h2>
                        <p className={`font-bold text-xs mt-1 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>Diseñadora: {fichaExistente?.disenadoraNombre || 'N/A'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {hasUnsavedChanges && <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${isDark ? 'bg-pink-600/30 text-pink-300' : 'bg-red-50 text-red-600'}`}><div className={`w-2 h-2 rounded-full animate-pulse transition-colors ${isDark ? 'bg-pink-500' : 'bg-red-500'}`}></div><span className="font-bold text-sm">Cambios sin guardar</span></div>}
                    <div className="flex gap-2">
                        {/* Botón Ver Fotos */}
                        <button
                            onClick={() => setModalFotos(true)}
                            title="Ver fotos de la referencia"
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 font-black text-xs uppercase tracking-wider transition-all ${isDark ? 'border-violet-600 text-violet-300 hover:bg-violet-700/40' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>
                            <span>Ver Fotos</span>
                        </button>

                        {/* Botón Visor Molde */}
                        <button
                            onClick={() => setModalMolde(true)}
                            title={archivoPsd ? 'Abrir visor de molde' : 'No hay molde cargado'}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 font-black text-xs uppercase tracking-wider transition-all ${
                                archivoPsd
                                    ? isDark ? 'border-violet-500 text-violet-300 hover:bg-violet-700/40' : 'border-violet-400 text-violet-600 hover:bg-violet-50'
                                    : isDark ? 'border-slate-600 text-slate-500 hover:border-slate-500' : 'border-slate-300 text-slate-400 hover:border-slate-400'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                            <span>Visor Molde</span>
                        </button>

                        <div className={`w-px h-8 self-center ${isDark ? 'bg-violet-700' : 'bg-slate-200'}`} />

                        {canEdit && (
                            <button
                                onClick={handleGuardar}
                                disabled={isLoading}
                                className={`px-4 py-2 text-white font-black rounded-xl uppercase text-xs hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'}`}
                            >
                                {isLoading ? 'GUARDANDO...' : 'GUARDAR'}
                            </button>
                        )}
                        <button className={`px-4 py-2 text-white font-black rounded-xl uppercase text-xs transition-colors ${isDark ? 'bg-yellow-700 hover:bg-yellow-800' : 'bg-yellow-500 hover:bg-yellow-600'}`}>Costeo Inicial</button>
                        {[1, 2, 3, 4, 5].map(num => (
                            <button key={num}
                        onClick={() => {
                                    const navegar = () => num <= numCortes ? onNavigate('fichas-corte-detalle', { referencia, numeroCorte: num }) : (num === numCortes + 1 ? setShowModalCorte(true) : null);
                                    if (hasUnsavedChanges) { if (confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir? Se perderán los cambios.')) navegar(); } else navegar();
                                }}
                                disabled={num > numCortes + 1}
                                className={`px-4 py-2 font-black rounded-xl uppercase text-xs transition-all ${num <= numCortes ? isDark ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-blue-500 text-white hover:bg-blue-600' : num === numCortes + 1 ? isDark ? 'bg-violet-700/50 text-violet-300 hover:bg-violet-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300' : isDark ? 'bg-violet-900/30 text-violet-700 opacity-50 cursor-not-allowed' : 'bg-slate-100 text-slate-300 opacity-50 cursor-not-allowed'}`}>
                                Corte #{num}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6">
                    <SubidaFotos referencia={referencia} foto1={foto1} foto2={foto2} foto3={foto3} archivoPsd={archivoPsd} onFoto1Change={mark(setFoto1)} onFoto2Change={mark(setFoto2)} onFoto3Change={mark(setFoto3)} onArchivoPsdChange={mark(setArchivoPsd)} readOnly={!canEdit} />
                    <div className={`p-6 rounded-3xl border shadow-sm space-y-4 transition-colors ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
                        <div>
                            <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Observaciones</label>
                            <textarea value={observaciones} onChange={e => { setObservaciones(e.target.value); setHasUnsavedChanges(true); }} readOnly={!canEdit} rows={10} className={`w-full px-4 py-3 border-2 rounded-xl font-bold resize-none transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-600 focus:ring-4 focus:ring-violet-400 focus:border-violet-500' : 'bg-slate-50 border-slate-200 text-slate-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500'}`} />
                        </div>
                    </div>

                    <div className={`p-6 rounded-3xl border-2 space-y-4 transition-colors ${isDark ? 'bg-gradient-to-br from-purple-900/40 to-purple-800/30 border-purple-700/50' : 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'}`}>
                        <h3 className={`text-sm font-black uppercase tracking-widest text-center transition-colors ${isDark ? 'text-purple-300' : 'text-yellow-700'}`}>Rentabilidad vs Precio</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className={`text-[10px] font-black uppercase tracking-widest block mb-2 text-center transition-colors ${isDark ? 'text-purple-400' : 'text-orange-400'}`}>Precio de Venta</label><div className={`px-4 py-3 rounded-xl border-2 flex items-center justify-center transition-colors ${isDark ? 'bg-[#3d2d52] border-purple-600' : 'bg-orange-100 border-orange-200'}`}><div className="flex items-center gap-2"><span className={`font-black text-lg transition-colors ${isDark ? 'text-purple-400' : 'text-orange-700'}`}>$</span><input type="number" value={precioVenta} onChange={e => { const p = Number(e.target.value); setPrecioVenta(p); setRentabilidad(calcRent(p, costoRef)); setHasUnsavedChanges(true); }} onFocus={e => e.target.select()} readOnly={!canEdit} className={`font-black text-2xl bg-transparent text-center border-0 focus:ring-0 w-32 transition-colors ${isDark ? 'text-purple-300' : 'text-orange-700'}`} /></div></div></div>
                            <div><label className={`text-[10px] font-black uppercase tracking-widest block mb-2 text-center transition-colors ${isDark ? 'text-purple-400' : 'text-yellow-600'}`}>Rentabilidad %</label><div className={`px-4 py-3 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-[#3d2d52] border-2 border-purple-600' : 'bg-white'}`}><input type="number" value={Math.round(rentabilidad)} onChange={e => { const r = Number(e.target.value); setRentabilidad(r); setPrecioVenta(calcPrecio(costoRef, r)); setHasUnsavedChanges(true); }} onFocus={e => e.target.select()} readOnly={!canEdit} className={`font-black text-2xl bg-transparent text-center border-0 focus:ring-0 w-16 transition-colors ${isDark ? 'text-purple-300' : 'text-slate-800'}`} /><span className={`font-black text-lg ml-2 transition-colors ${isDark ? 'text-purple-400' : 'text-yellow-600'}`}>%</span></div></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className={`text-[10px] font-black uppercase tracking-widest block mb-2 text-center transition-colors ${isDark ? 'text-purple-400' : 'text-orange-400'}`}>Costo sin provisiones</label><div className={`px-4 py-3 rounded-xl border-2 text-center transition-colors ${isDark ? 'bg-[#3d2d52] border-purple-600' : 'bg-orange-100 border-orange-200'}`}><p className={`font-black text-2xl transition-colors ${isDark ? 'text-purple-300' : 'text-orange-700'}`}>$ {totales.costoContabilizar.toLocaleString()}</p></div></div>
                            <div><label className={`text-[10px] font-black uppercase tracking-widest block mb-2 text-center transition-colors ${isDark ? 'text-purple-400' : 'text-yellow-600'}`}>Costo Total</label><div className={`px-4 py-3 rounded-xl text-center transition-colors ${isDark ? 'bg-[#3d2d52] border-2 border-purple-600' : 'bg-white'}`}><p className={`font-black text-2xl transition-colors ${isDark ? 'text-purple-300' : 'text-slate-800'}`}>$ {totales.total.toLocaleString()}</p></div></div>
                        </div>
                        <p className={`text-xs font-bold italic transition-colors ${isDark ? 'text-purple-400' : 'text-yellow-700'}`}>Los precios se ajustan automáticamente para terminar en 900</p>
                    </div>

                    <div className={`p-6 rounded-3xl border-2 flex items-center justify-between transition-colors ${isDark ? 'bg-gradient-to-br from-purple-900/40 to-purple-800/30 border-purple-700/50' : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'}`}>
                        <div>
                            <h3 className={`text-sm font-black uppercase tracking-widest transition-colors ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>Cantidad Total Cortada</h3>
                            <p className={`text-xs font-bold mt-2 transition-colors ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{numCortes} corte{numCortes !== 1 ? 's' : ''} asentado{numCortes !== 1 ? 's' : ''}</p>
                        </div>
                        <p className={`text-6xl font-black transition-colors ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{fichaExistente?.cantidadTotalCortada || 0}</p>
                    </div>

                    <div className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-colors ${isDark ? 'bg-gradient-to-br from-pink-900/40 to-pink-800/30 border-pink-700/50' : 'bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200'}`}>
                        <div>
                            <h3 className={`text-xs font-black uppercase tracking-widest transition-colors ${isDark ? 'text-pink-300' : 'text-pink-700'}`}>Margen Venta Cliente</h3>
                            <p className={`text-sm font-black transition-colors ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>30%</p>
                        </div>
                        <p className={`text-3xl font-black transition-colors ${isDark ? 'text-pink-400' : 'text-pink-700'}`}>$ {margenGanancia.toLocaleString()}</p>
                    </div>

                    <div className={`p-6 rounded-3xl border-2 transition-colors ${isDark ? 'bg-gradient-to-br from-orange-900/40 to-orange-800/30 border-orange-700/50' : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'}`}>
                        <h3 className={`text-sm font-black uppercase tracking-widest mb-4 text-center transition-colors ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>Posibles Descuentos</h3>
                        <table className="w-full text-sm">
                            <thead><tr className={`border-b-2 transition-colors ${isDark ? 'border-orange-700/50' : 'border-orange-300'}`}><th className={`py-2 text-left font-black uppercase text-xs transition-colors ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Desc</th><th className={`py-2 text-right font-black uppercase text-xs transition-colors ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Precio</th><th className={`py-2 text-right font-black uppercase text-xs transition-colors ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Rent %</th></tr></thead>
                            <tbody className={`divide-y transition-colors ${isDark ? 'divide-orange-700/50' : 'divide-orange-200'}`}>
                                {[['0%', descuentos.desc0], ['5%', descuentos.desc5], ['10%', descuentos.desc10], ['15%', descuentos.desc15]].map(([label, d]: any) => (
                                    <tr key={label}><td className={`py-3 font-black transition-colors ${isDark ? 'text-orange-300' : 'text-slate-700'}`}>{label}</td><td className={`py-3 text-right font-black transition-colors ${isDark ? 'text-orange-300' : 'text-slate-800'}`}>$ {(d.precio || 0).toLocaleString()}</td><td className={`py-3 text-right font-black transition-colors ${isDark ? 'text-green-400' : 'text-green-600'}`}>{(d.rent || 0).toFixed(1)}%</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6 lg:col-span-2">
                    <div className={`p-6 rounded-3xl space-y-4 transition-colors ${isDark ? 'bg-[#4a3a63] border border-violet-700' : 'bg-slate-100 border border-slate-200'}`}>
                        <div className="flex items-center justify-between">
                            <h3 className={`text-sm font-black uppercase tracking-widest transition-colors ${isDark ? 'text-violet-200' : 'text-slate-600'}`}>Información Básica</h3>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-black uppercase tracking-widest transition-colors ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Revisión:</span>
                            <div className="relative">
                                <button
                                    onClick={() => isAdmin && setShowRevisionPicker(v => !v)}
                                    className={`w-7 h-7 rounded-full border-2 border-white shadow transition-transform ${isAdmin ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                                    style={{ backgroundColor: estadoRevision === 'rojo' ? '#fca5a5' : estadoRevision === 'verde' ? '#86efac' : estadoRevision === 'morado' ? '#c4b5fd' : isDark ? '#6b5b7f' : '#e2e8f0' }}
                                    title="Estado de revisión"
                                />
                                {showRevisionPicker && (
                                    <div className={`absolute right-0 top-9 rounded-2xl shadow-2xl border p-3 flex gap-2 z-50 transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-700' : 'bg-white border-slate-200'}`}>
                                        {(['rojo', 'verde', 'morado'] as const).map(color => (
                                            <button
                                                key={color}
                                                onClick={() => { setEstadoRevision(estadoRevision === color ? null : color); setShowRevisionPicker(false); }}
                                                className="w-8 h-8 rounded-full border-4 transition-transform hover:scale-110"
                                                style={{
                                                    backgroundColor: color === 'rojo' ? '#fca5a5' : color === 'verde' ? '#86efac' : '#c4b5fd',
                                                    borderColor: estadoRevision === color ? (color === 'rojo' ? '#ef4444' : color === 'verde' ? '#22c55e' : '#8b5cf6') : 'transparent'
                                                }}
                                            />
                                        ))}
                                        <button
                                            key="gris"
                                            onClick={() => { setEstadoRevision(null); setShowRevisionPicker(false); }}
                                            className="w-8 h-8 rounded-full border-4 transition-transform hover:scale-110 flex items-center justify-center"
                                            style={{
                                                backgroundColor: isDark ? '#6b5b7f' : '#94a3b8',
                                                borderColor: estadoRevision === null ? (isDark ? '#8b7ba8' : '#64748b') : 'transparent'
                                            }}
                                            title="Sin estado"
                                        >
                                            <span className="text-white font-bold text-lg leading-none">−</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>Descripción</label>
                                <input type="text" value={descripcion} onChange={e => mark(setDescripcion)(e.target.value)} readOnly={!canEdit} className={`w-full px-4 py-3 border-2 rounded-xl font-bold transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-600 focus:ring-4 focus:ring-violet-400 focus:border-violet-500' : 'bg-white border-slate-200 text-slate-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500'}`} />
                            </div>
                            <div>
                                <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>Novedad</label>
                                <input type="text" value={novedad} onChange={e => mark(setNovedad)(e.target.value)} readOnly={!canEdit} className={`w-full px-4 py-3 border-2 rounded-xl font-bold transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-600 focus:ring-4 focus:ring-violet-400 focus:border-violet-500' : 'bg-white border-slate-200 text-slate-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500'}`} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>Marca</label>
                                <input type="text" value={marca} onChange={e => mark(setMarca)(e.target.value)} readOnly={!canEdit} className={`w-full px-4 py-3 border-2 rounded-xl font-bold transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-600 focus:ring-4 focus:ring-violet-400 focus:border-violet-500' : 'bg-white border-slate-200 text-slate-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500'}`} />
                            </div>
                            <div>
                                <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>Muestra #1</label>
                                <input type="text" value={muestra1} onChange={e => mark(setMuestra1)(e.target.value)} readOnly={!canEdit} className={`w-full px-4 py-3 border-2 rounded-xl font-bold transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-600 focus:ring-4 focus:ring-violet-400 focus:border-violet-500' : 'bg-white border-slate-200 text-slate-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500'}`} />
                            </div>
                            <div>
                                <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>Muestra #2</label>
                                <input type="text" value={muestra2} onChange={e => mark(setMuestra2)(e.target.value)} readOnly={!canEdit} className={`w-full px-4 py-3 border-2 rounded-xl font-bold transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-600 focus:ring-4 focus:ring-violet-400 focus:border-violet-500' : 'bg-white border-slate-200 text-slate-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500'}`} />
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

            {canEdit && (<button onClick={handleGuardar} disabled={isLoading} className={`w-full py-6 text-white font-black text-2xl rounded-3xl shadow-2xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider ${isDark ? 'bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 hover:shadow-blue-900/50' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 hover:shadow-blue-200'}`}>{isLoading ? 'GUARDANDO...' : 'GUARDAR FICHA'}</button>)}

            {showModalCorte && (
                <div className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors ${isDark ? 'bg-slate-900/40' : 'bg-slate-900/40'}`}>
                    <div className={`rounded-3xl shadow-2xl max-w-md w-full p-8 transition-colors ${isDark ? 'bg-[#4a3a63] border border-violet-700' : 'bg-white'}`}>
                        <div className="text-center mb-6">
                            <h3 className={`text-2xl font-black mb-2 transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>¿Asentar Corte #{numCortes + 1}?</h3>
                            <p className={`text-sm font-bold transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>Se copiarán todos los conceptos de la ficha inicial.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowModalCorte(false)} className={`flex-1 px-6 py-3 font-black rounded-xl transition-colors uppercase tracking-wide text-sm ${isDark ? 'bg-violet-900/40 text-violet-300 hover:bg-violet-900/60' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancelar</button>
                            <button onClick={() => { setShowModalCorte(false); onNavigate('fichas-corte-detalle', { referencia, numeroCorte: numCortes + 1, nuevo: true }); }} className={`flex-1 px-6 py-3 text-white font-black rounded-xl hover:shadow-lg transition-all uppercase tracking-wide text-sm ${isDark ? 'bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-800 hover:to-yellow-700' : 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600'}`}>Asentar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal Ver Fotos ─────────────────────────────────────────── */}
            {modalFotos && (
                <ModalVerFotosCosto
                    referencia={referencia}
                    foto1={foto1}
                    foto2={foto2}
                    foto3={foto3}
                    isDark={isDark}
                    onClose={() => setModalFotos(false)}
                />
            )}

            {/* ── Modal Visor Molde ────────────────────────────────────────── */}
            {modalMolde && (
                <ModalVisorMoldeCosto
                    referencia={referencia}
                    archivoPsd={archivoPsd}
                    isDark={isDark}
                    onClose={() => setModalMolde(false)}
                />
            )}
        </div>
    );
};

// ── Modal Ver Fotos ──────────────────────────────────────────────────────────

interface ModalVerFotosCostoProps {
    referencia: string;
    foto1: string | null;
    foto2: string | null;
    foto3: string | null;
    isDark: boolean;
    onClose: () => void;
}

const ModalVerFotosCosto: React.FC<ModalVerFotosCostoProps> = ({ referencia, foto1, foto2, foto3, isDark, onClose }) => {
    const [indice, setIndice] = useState(0);

    const getBaseUrl = (): string => {
        if ((window as any).API_CONFIG?.getApiUrl) return (window as any).API_CONFIG.getApiUrl().replace('/api', '');
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
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400">
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
                <img src={foto.src} alt={foto.label} className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl" />
                <div className={`mt-4 flex items-center gap-3 px-5 py-2 rounded-full font-black text-sm ${isDark ? 'bg-slate-800/80 text-violet-200' : 'bg-white/90 text-slate-700'}`}>
                    <span>{referencia}</span>
                    <span className={isDark ? 'text-violet-500' : 'text-slate-300'}>•</span>
                    <span>{foto.label}</span>
                    {fotos.length > 1 && <><span className={isDark ? 'text-violet-500' : 'text-slate-300'}>•</span><span className={isDark ? 'text-violet-400' : 'text-slate-400'}>{indice + 1} / {fotos.length}</span></>}
                </div>
                {fotos.length > 1 && (
                    <>
                        <button onClick={() => setIndice(i => (i - 1 + fotos.length) % fotos.length)} className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-3 rounded-full shadow-lg transition-colors ${isDark ? 'bg-violet-700 hover:bg-violet-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-800'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                        </button>
                        <button onClick={() => setIndice(i => (i + 1) % fotos.length)} className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-3 rounded-full shadow-lg transition-colors ${isDark ? 'bg-violet-700 hover:bg-violet-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-800'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                        </button>
                    </>
                )}
                <button onClick={onClose} className={`absolute top-0 right-0 -translate-y-2 translate-x-2 p-3 rounded-full shadow-lg transition-colors ${isDark ? 'bg-violet-700 hover:bg-violet-800 text-white' : 'bg-white hover:bg-slate-100 text-slate-800'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                {fotos.length > 1 && (
                    <div className="flex gap-3 mt-4">
                        {fotos.map((f, i) => (
                            <button key={i} onClick={() => setIndice(i)} className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === indice ? (isDark ? 'border-violet-400 scale-110' : 'border-violet-500 scale-110') : (isDark ? 'border-slate-600 opacity-60' : 'border-slate-300 opacity-60')}`}>
                                <img src={f.src} alt={f.label} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Modal Visor Molde ────────────────────────────────────────────────────────

interface ModalVisorMoldeCostoProps {
    referencia: string;
    archivoPsd: string | null;
    isDark: boolean;
    onClose: () => void;
}

const ModalVisorMoldeCosto: React.FC<ModalVisorMoldeCostoProps> = ({ referencia, archivoPsd, isDark, onClose }) => {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { onClose(); e.stopImmediatePropagation(); }
        };
        document.addEventListener('keydown', handler, true);
        return () => document.removeEventListener('keydown', handler, true);
    }, []);

    if (!archivoPsd) {
        return (
            <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 bg-slate-900/80" onClick={onClose}>
                <div className={`p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-amber-900/40' : 'bg-amber-50'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-9 h-9 text-amber-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                    </div>
                    <p className={`font-black text-lg mb-2 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>{referencia}</p>
                    <p className={`font-bold text-sm leading-relaxed ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>No hay molde cargado<br />para esta referencia</p>
                    <button onClick={onClose} className={`mt-6 px-6 py-2 rounded-xl font-black text-sm uppercase tracking-wider transition-colors ${isDark ? 'bg-violet-700 hover:bg-violet-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>Cerrar</button>
                </div>
            </div>
        );
    }

    const getBaseUrl = (): string => {
        if ((window as any).API_CONFIG?.getApiUrl) return (window as any).API_CONFIG.getApiUrl().replace('/api', '');
        return `${window.location.protocol}//${window.location.hostname}:3000`;
    };

    const nombreArchivo = archivoPsd.split('/').pop() || archivoPsd;

    return (
        <div className="fixed inset-0 pt-20 backdrop-blur-sm z-50 flex items-center justify-center p-4 bg-slate-900/85" onClick={onClose}>
            <div
                className={`relative w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}
                style={{ height: 'calc(90vh - 80px)' }}
                onClick={e => e.stopPropagation()}
            >
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
                <div className={isDark ? 'bg-[#3d2d52]' : 'bg-slate-50'}>
                    <VisorMolde
                        archivoUrl={`${getBaseUrl()}${archivoPsd}`}
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

export default FichasCostoDetalle;
