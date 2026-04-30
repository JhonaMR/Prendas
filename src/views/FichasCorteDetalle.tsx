// VISTA: Fichas Corte Detalle
import React, { useState, useEffect, useMemo } from 'react';
import { AppState } from '../types';
import { ConceptoFicha } from '../types/typesFichas';
import apiFichas from '../services/apiFichas';
import SeccionConceptos from '../components/modules/SeccionConceptos';
import DecimalInput from '../components/DecimalInput';
import { useDarkMode } from '../context/DarkModeContext';

interface Props {
    state: AppState; user: any;
    updateState: (u: (p: AppState) => AppState) => void;
    onNavigate: (view: string, params?: any) => void;
    params?: any;
}

const FichasCorteDetalle: React.FC<Props> = ({ state, user, updateState, onNavigate, params }) => {
    const { isDark } = useDarkMode();
    const referencia = params?.referencia || '';
    const numeroCorte = params?.numeroCorte || 1;
    const isNuevo = params?.nuevo || false;
    const canEdit = user?.role === 'admin' || user?.role === 'general' || user?.role === 'soporte' || user?.role === 'operador';

    const [isLoading, setIsLoading] = useState(false);
    const [hasUnsaved, setHasUnsaved] = useState(false);
    const [fichaCorte, setFichaCorte] = useState('');
    const [fechaCorte, setFechaCorte] = useState(new Date().toISOString().split('T')[0]);
    const [cantidadCortada, setCantidadCortada] = useState(0);
    const [materiaPrima, setMateriaPrima] = useState<ConceptoFicha[]>([]);
    const [manoObra, setManoObra] = useState<ConceptoFicha[]>([]);
    const [insumosDirectos, setInsumosDirectos] = useState<ConceptoFicha[]>([]);
    const [insumosIndirectos, setInsumosIndirectos] = useState<ConceptoFicha[]>([]);
    const [provisiones, setProvisiones] = useState<ConceptoFicha[]>([]);
    const [fichaData, setFichaData] = useState<any>(null);

    const fichaInicial = (state.fichasCosto || []).find(f => f.referencia === referencia);

    // Fetch ficha data on mount or when referencia changes
    useEffect(() => {
        const fetchFichaData = async () => {
            try {
                const apiUrl = window.API_CONFIG?.getApiUrl?.() || `${window.location.protocol}//${window.location.hostname}:3000/api`;
                const response = await fetch(`${apiUrl}/fichas-costo/${referencia}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
                });
                const data = await response.json();
                if (data.success) {
                    setFichaData(data.data);
                }
            } catch (error) {
                console.error('Error fetching ficha:', error);
            }
        };
        if (referencia) fetchFichaData();
    }, [referencia]);

    useEffect(() => {
        if (!fichaData) return;

        const corteExistente = fichaData?.cortes?.find((c: any) => c.numeroCorte === Number(numeroCorte));

        if (isNuevo) {
            setMateriaPrima(fichaData.materiaPrima || []);
            setManoObra(fichaData.manoObra || []);
            setInsumosDirectos(fichaData.insumosDirectos || []);
            setInsumosIndirectos(fichaData.insumosIndirectos || []);
            setProvisiones(fichaData.provisiones || []);
        } else if (corteExistente) {
            setFichaCorte(corteExistente.fichaCorte || '');
            setFechaCorte(corteExistente.fechaCorte ? corteExistente.fechaCorte.slice(0, 10) : new Date().toISOString().split('T')[0]);
            setCantidadCortada(corteExistente.cantidadCortada || 0);
            setMateriaPrima(corteExistente.materiaPrima || []);
            setManoObra(corteExistente.manoObra || []);
            setInsumosDirectos(corteExistente.insumosDirectos || []);
            setInsumosIndirectos(corteExistente.insumosIndirectos || []);
            setProvisiones(corteExistente.provisiones || []);
        }
        setHasUnsaved(false);
    }, [fichaData, isNuevo, numeroCorte]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (hasUnsaved) {
                    if (confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir? Se perderán los cambios.')) {
                        onNavigate('fichas-costo-detalle', { referencia });
                    }
                } else {
                    onNavigate('fichas-costo-detalle', { referencia });
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [hasUnsaved, referencia, onNavigate]);

    const totales = useMemo(() => {
        const calc = (items: ConceptoFicha[]) => Math.ceil(items.reduce((acc, i) => acc + (i.total || 0), 0));
        const totalMP = calc(materiaPrima), totalMO = calc(manoObra);
        const totalID = calc(insumosDirectos), totalII = calc(insumosIndirectos);
        const totalProv = calc(provisiones);
        const costoReal = totalMP + totalMO + totalID + totalII + totalProv;
        return { costoReal, totalMP, totalMO, totalID, totalII, totalProv };
    }, [materiaPrima, manoObra, insumosDirectos, insumosIndirectos, provisiones]);

    const costoProyectado = Math.ceil(fichaData?.costoTotal || 0);
    const precioVenta = fichaData?.precioVenta || 0;
    const diferencia = Math.ceil(costoProyectado - totales.costoReal);
    // Rentabilidad sobre precio de venta: (PV - Costo Real) / PV * 100
    const rentabilidadPV = precioVenta > 0 ? ((precioVenta - totales.costoReal) / precioVenta) * 100 : 0;
    // Rentabilidad del corte (fórmula anterior): diferencia / costo real * 100
    const margenUtilidad = totales.costoReal !== 0 ? (diferencia / totales.costoReal) * 100 : 0;

    const handleGuardar = async () => {
        if (!canEdit) { alert('No tienes permisos'); return; }
        if (cantidadCortada <= 0) { alert('La cantidad cortada debe ser mayor a 0'); return; }
        setIsLoading(true);
        const corteData = { numeroCorte: Number(numeroCorte), fichaCorte, fechaCorte, cantidadCortada, materiaPrima, manoObra, insumosDirectos, insumosIndirectos, provisiones };
        try {
            const result = isNuevo
                ? await apiFichas.crearCorte(referencia, corteData, user.name)
                : await apiFichas.updateCorte(referencia, Number(numeroCorte), corteData);
            if (result.success) {
                setHasUnsaved(false); alert('✅ Corte guardado');
                const fichas = await apiFichas.getFichasCosto();
                updateState(prev => ({ ...prev, fichasCosto: fichas }));
                onNavigate('fichas-costo-detalle', { referencia });
            } else alert('❌ ' + result.message);
        } catch { alert('❌ Error de conexión'); }
        finally { setIsLoading(false); }
    };

    const handleEliminar = async () => {
        if (!canEdit) { alert('No tienes permisos'); return; }
        if (!window.confirm(`¿Eliminar el Corte #${numeroCorte}? Esta acción no se puede deshacer.`)) return;
        setIsLoading(true);
        try {
            const result = await apiFichas.deleteCorte(referencia, Number(numeroCorte));
            if (result.success) {
                const fichas = await apiFichas.getFichasCosto();
                updateState(prev => ({ ...prev, fichasCosto: fichas }));
                onNavigate('fichas-costo-detalle', { referencia });
            } else alert('❌ ' + result.message);
        } catch { alert('❌ Error de conexión'); }
        finally { setIsLoading(false); }
    };

    const mark = (setter: any) => (v: any) => { setter(v); setHasUnsaved(true); };

    return (
        <div className={`space-y-6 pb-20 transition-colors ${isDark ? 'bg-[#3d2d52]' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => { if (hasUnsaved) { if (confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir? Se perderán los cambios.')) onNavigate('fichas-costo-detalle', { referencia }); } else onNavigate('fichas-costo-detalle', { referencia }); }}
                        className={`p-3 rounded-xl transition-colors ${isDark ? 'bg-violet-700/50 hover:bg-violet-700 text-violet-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                    </button>
                    <div>
                        <h2 className={`text-3xl font-black tracking-tighter transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{referencia} - CORTE #{numeroCorte}</h2>
                        <p className={`font-bold text-xs mt-1 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>{isNuevo ? 'Nuevo corte' : 'Editando corte existente'}</p>
                    </div>
                </div>
                {hasUnsaved && <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${isDark ? 'bg-pink-600/30 text-pink-300' : 'bg-red-50 text-red-600'}`}><div className={`w-2 h-2 rounded-full animate-pulse transition-colors ${isDark ? 'bg-pink-500' : 'bg-red-500'}`}></div><span className="font-bold text-sm">Cambios sin guardar</span></div>}
                {canEdit && !isNuevo && (
                    <button onClick={handleEliminar} disabled={isLoading}
                        className={`px-5 py-2 font-black rounded-xl border transition-colors text-sm uppercase tracking-wide ${isDark ? 'bg-red-900/40 text-red-400 border-red-700/50 hover:bg-red-900/60' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}>
                        Eliminar Corte
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6">
                    <div className={`p-6 rounded-3xl border shadow-sm space-y-4 transition-colors ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
                        <h3 className={`text-sm font-black uppercase tracking-widest transition-colors ${isDark ? 'text-violet-200' : 'text-slate-600'}`}>Información del Corte</h3>
                        <div><label className={`text-[10px] font-black uppercase tracking-widest block mb-2 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Ficha de Corte</label>
                            <input type="text" value={fichaCorte} onChange={e => { setFichaCorte(e.target.value); setHasUnsaved(true); }} readOnly={!canEdit}
                                className={`w-full px-4 py-3 border-2 rounded-xl font-bold transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-600 focus:ring-4 focus:ring-violet-400 focus:border-violet-500' : 'bg-slate-50 border-slate-200 text-slate-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500'}`} placeholder="Ej: 349" /></div>
                        <div><label className={`text-[10px] font-black uppercase tracking-widest block mb-2 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Fecha de Corte</label>
                            <input type="date" value={fechaCorte} onChange={e => { setFechaCorte(e.target.value); setHasUnsaved(true); }} readOnly={!canEdit}
                                className={`w-full px-4 py-3 border-2 rounded-xl font-bold transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:ring-4 focus:ring-violet-400 focus:border-violet-500' : 'bg-slate-50 border-slate-200 text-slate-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500'}`} /></div>
                        <div><label className={`text-[10px] font-black uppercase tracking-widest block mb-2 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Cantidad Cortada</label>
                            <DecimalInput 
                                value={cantidadCortada} 
                                onChange={v => { setCantidadCortada(v); setHasUnsaved(true); }} 
                                readOnly={!canEdit}
                                className={`w-full px-4 py-4 border-2 rounded-xl font-black text-2xl transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-600 focus:ring-4 focus:ring-violet-400 focus:border-violet-500' : 'bg-slate-50 border-slate-200 text-slate-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500'}`} 
                            />
                        </div>
                    </div>

                    <div className={`p-6 rounded-3xl border-2 space-y-4 transition-colors ${isDark ? 'bg-gradient-to-br from-blue-900/40 to-blue-800/30 border-blue-700/50' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'}`}>
                        <h3 className={`text-sm font-black uppercase tracking-widest transition-colors ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Utilidad o Pérdida</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div><p className={`text-[10px] font-black uppercase tracking-widest mb-1 transition-colors ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Costo Real</p><p className={`text-2xl font-black transition-colors ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>$ {totales.costoReal.toLocaleString()}</p></div>
                            <div><p className={`text-[10px] font-black uppercase tracking-widest mb-1 transition-colors ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Proyectado</p><p className={`text-2xl font-black transition-colors ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>$ {costoProyectado.toLocaleString()}</p></div>
                            <div><p className={`text-[10px] font-black uppercase tracking-widest mb-1 transition-colors ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Diferencia</p><p className={`text-2xl font-black transition-colors ${diferencia >= 0 ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>$ {diferencia.toLocaleString()}</p></div>
                        </div>
                        <div className={`pt-4 border-t-2 transition-colors ${isDark ? 'border-blue-700/50' : 'border-blue-300'}`}>
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 transition-colors ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>M.R Utilidad</p>
                            <div className="flex items-end justify-between gap-3">
                                <div className="flex items-end gap-3">
                                    <p className={`text-6xl font-black transition-colors ${rentabilidadPV >= 0 ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>{rentabilidadPV.toFixed(2)}%</p>
                                    <div className={`mb-3 px-4 py-2 rounded-xl transition-colors ${rentabilidadPV >= 0 ? (isDark ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-700') : (isDark ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-700')}`}>
                                        <p className="text-xs font-black uppercase">{rentabilidadPV >= 0 ? '✓ Utilidad' : '✗ Pérdida'}</p>
                                    </div>
                                </div>
                                <div className={`mb-2 px-4 py-3 rounded-xl text-right transition-colors ${isDark ? 'bg-blue-900/30' : 'bg-blue-100/60'}`}>
                                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 transition-colors ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>Rent. del Corte</p>
                                    <p className={`text-xl font-black transition-colors ${margenUtilidad >= 0 ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>{margenUtilidad.toFixed(2)}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`p-6 rounded-3xl border-2 shadow-lg transition-colors ${isDark ? 'bg-gradient-to-br from-yellow-900/40 to-yellow-800/30 border-yellow-700/50' : 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300'}`}>
                        <p className={`text-sm font-black uppercase tracking-widest opacity-90 mb-2 transition-colors ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>Costo para contabilizar</p>
                        <p className={`text-5xl font-black transition-colors ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>$ {(totales.costoReal - totales.totalProv).toLocaleString()}</p>
                    </div>

                    <div className={`p-6 rounded-3xl shadow-lg transition-colors ${isDark ? 'bg-gradient-to-br from-purple-700 to-purple-600' : 'bg-gradient-to-br from-purple-600 to-purple-500'}`}>
                        <p className={`text-sm font-black uppercase tracking-widest opacity-90 mb-2 transition-colors ${isDark ? 'text-purple-100' : 'text-white'}`}>Costo Real del Corte</p>
                        <p className={`text-5xl font-black transition-colors ${isDark ? 'text-purple-100' : 'text-white'}`}>$ {totales.costoReal.toLocaleString()}</p>
                    </div>
                </div>

                <div className="space-y-6 lg:col-span-2">
                    <SeccionConceptos titulo="MATERIA PRIMA" color="pink" conceptos={materiaPrima} onChange={mark(setMateriaPrima)} readOnly={!canEdit} mostrarTipo={true} isDark={isDark} />
                    <SeccionConceptos titulo="MANO DE OBRA" color="blue" conceptos={manoObra} onChange={mark(setManoObra)} readOnly={!canEdit} isDark={isDark} />
                    <SeccionConceptos titulo="INSUMOS DIRECTOS" color="slate" conceptos={insumosDirectos} onChange={mark(setInsumosDirectos)} readOnly={!canEdit} isDark={isDark} />
                    <SeccionConceptos titulo="INSUMOS INDIRECTOS" color="orange" conceptos={insumosIndirectos} onChange={mark(setInsumosIndirectos)} readOnly={!canEdit} isDark={isDark} />
                    <SeccionConceptos titulo="PROVISIONES" color="red" conceptos={provisiones} onChange={mark(setProvisiones)} readOnly={!canEdit} totalesOtrosCostos={{ totalMP: totales.totalMP, totalMO: totales.totalMO, totalID: totales.totalID, totalII: totales.totalII }} isDark={isDark} />
                </div>
            </div>

            {canEdit && (
                <button onClick={handleGuardar} disabled={isLoading}
                    className={`w-full py-6 text-white font-black text-2xl rounded-3xl shadow-2xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider ${isDark ? 'bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 hover:shadow-purple-900/50' : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 hover:shadow-purple-200'}`}>
                    {isLoading ? 'GUARDANDO...' : `GUARDAR CORTE #${numeroCorte}`}
                </button>
            )}
        </div>
    );
};

export default FichasCorteDetalle;
