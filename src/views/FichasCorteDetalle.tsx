// VISTA: Fichas Corte Detalle
import React, { useState, useEffect, useMemo } from 'react';
import { AppState } from '../../types';
import { ConceptoFicha } from '../../types/typesFichas';
import apiFichas from '../services/apiFichas';
import SeccionConceptos from '../components/modules/SeccionConceptos';

interface Props {
    state: AppState; user: any;
    updateState: (u: (p: AppState) => AppState) => void;
    onNavigate: (view: string, params?: any) => void;
    params?: any;
}

const FichasCorteDetalle: React.FC<Props> = ({ state, user, updateState, onNavigate, params }) => {
    const referencia = params?.referencia || '';
    const numeroCorte = params?.numeroCorte || 1;
    const isNuevo = params?.nuevo || false;
    const canEdit = user?.role === 'admin' || user?.role === 'general';

    const [isLoading, setIsLoading] = useState(false);
    const [hasUnsaved, setHasUnsaved] = useState(false);
    const [fechaCorte, setFechaCorte] = useState(new Date().toISOString().split('T')[0]);
    const [cantidadCortada, setCantidadCortada] = useState(0);
    const [materiaPrima, setMateriaPrima] = useState<ConceptoFicha[]>([]);
    const [manoObra, setManoObra] = useState<ConceptoFicha[]>([]);
    const [insumosDirectos, setInsumosDirectos] = useState<ConceptoFicha[]>([]);
    const [insumosIndirectos, setInsumosIndirectos] = useState<ConceptoFicha[]>([]);
    const [provisiones, setProvisiones] = useState<ConceptoFicha[]>([]);

    const fichaInicial = (state.fichasCosto || []).find(f => f.referencia === referencia);
    const corteExistente = fichaInicial?.cortes?.find(c => c.numeroCorte === Number(numeroCorte));

    useEffect(() => {
        if (isNuevo && fichaInicial) {
            setMateriaPrima(fichaInicial.materiaPrima || []);
            setManoObra(fichaInicial.manoObra || []);
            setInsumosDirectos(fichaInicial.insumosDirectos || []);
            setInsumosIndirectos(fichaInicial.insumosIndirectos || []);
            setProvisiones(fichaInicial.provisiones || []);
        } else if (corteExistente) {
            setFechaCorte(corteExistente.fechaCorte || new Date().toISOString().split('T')[0]);
            setCantidadCortada(corteExistente.cantidadCortada || 0);
            setMateriaPrima(corteExistente.materiaPrima || []);
            setManoObra(corteExistente.manoObra || []);
            setInsumosDirectos(corteExistente.insumosDirectos || []);
            setInsumosIndirectos(corteExistente.insumosIndirectos || []);
            setProvisiones(corteExistente.provisiones || []);
        }
    }, [isNuevo, referencia, numeroCorte]);

    const totales = useMemo(() => {
        const calc = (items: ConceptoFicha[]) => items.reduce((acc, i) => acc + (i.total || 0), 0);
        const costoReal = calc(materiaPrima) + calc(manoObra) + calc(insumosDirectos) + calc(insumosIndirectos) + calc(provisiones);
        return { costoReal };
    }, [materiaPrima, manoObra, insumosDirectos, insumosIndirectos, provisiones]);

    const costoProyectado = fichaInicial?.costoTotal || 0;
    const diferencia = costoProyectado - totales.costoReal;
    const margenUtilidad = totales.costoReal !== 0 ? (diferencia / totales.costoReal) * 100 : 0;

    const handleGuardar = async () => {
        if (!canEdit) { alert('No tienes permisos'); return; }
        if (cantidadCortada <= 0) { alert('La cantidad cortada debe ser mayor a 0'); return; }
        setIsLoading(true);
        const corteData = { numeroCorte: Number(numeroCorte), fechaCorte, cantidadCortada, materiaPrima, manoObra, insumosDirectos, insumosIndirectos, provisiones };
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

    const mark = (setter: any) => (v: any) => { setter(v); setHasUnsaved(true); };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => { if (hasUnsaved) { if (confirm('¿Salir sin guardar?')) onNavigate('fichas-costo-detalle', { referencia }); } else onNavigate('fichas-costo-detalle', { referencia }); }}
                        className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{referencia} - CORTE #{numeroCorte}</h2>
                        <p className="text-slate-500 font-bold text-xs mt-1">{isNuevo ? 'Nuevo corte' : 'Editando corte existente'}</p>
                    </div>
                </div>
                {hasUnsaved && <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div><span className="font-bold text-sm">Cambios sin guardar</span></div>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest">Información del Corte</h3>
                        <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Fecha de Corte</label>
                            <input type="date" value={fechaCorte} onChange={e => { setFechaCorte(e.target.value); setHasUnsaved(true); }} readOnly={!canEdit}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500" /></div>
                        <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Cantidad Cortada</label>
                            <input type="number" value={cantidadCortada} onChange={e => { setCantidadCortada(Number(e.target.value)); setHasUnsaved(true); }} readOnly={!canEdit}
                                className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-black text-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500" /></div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-3xl border-2 border-blue-200 space-y-4">
                        <h3 className="text-sm font-black text-blue-700 uppercase tracking-widest">Utilidad o Pérdida</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div><p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Costo Real</p><p className="text-2xl font-black text-blue-700">$ {totales.costoReal.toLocaleString()}</p></div>
                            <div><p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Proyectado</p><p className="text-2xl font-black text-blue-700">$ {costoProyectado.toLocaleString()}</p></div>
                            <div><p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Diferencia</p><p className={`text-2xl font-black ${diferencia >= 0 ? 'text-green-600' : 'text-red-600'}`}>$ {diferencia.toLocaleString()}</p></div>
                        </div>
                        <div className="pt-4 border-t-2 border-blue-300">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">M.R Utilidad</p>
                            <div className="flex items-end gap-3">
                                <p className={`text-6xl font-black ${margenUtilidad >= 0 ? 'text-green-600' : 'text-red-600'}`}>{margenUtilidad.toFixed(2)}%</p>
                                <div className={`mb-3 px-4 py-2 rounded-xl ${margenUtilidad >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    <p className="text-xs font-black uppercase">{margenUtilidad >= 0 ? '✓ Utilidad' : '✗ Pérdida'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-600 to-purple-500 p-6 rounded-3xl text-white shadow-lg">
                        <p className="text-sm font-black uppercase tracking-widest opacity-90 mb-2">Costo Real del Corte</p>
                        <p className="text-5xl font-black">$ {totales.costoReal.toLocaleString()}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <SeccionConceptos titulo="MATERIA PRIMA" color="pink" conceptos={materiaPrima} onChange={mark(setMateriaPrima)} readOnly={!canEdit} mostrarTipo={true} />
                    <SeccionConceptos titulo="MANO DE OBRA" color="blue" conceptos={manoObra} onChange={mark(setManoObra)} readOnly={!canEdit} />
                    <SeccionConceptos titulo="INSUMOS DIRECTOS" color="slate" conceptos={insumosDirectos} onChange={mark(setInsumosDirectos)} readOnly={!canEdit} />
                    <SeccionConceptos titulo="INSUMOS INDIRECTOS" color="orange" conceptos={insumosIndirectos} onChange={mark(setInsumosIndirectos)} readOnly={!canEdit} />
                    <SeccionConceptos titulo="PROVISIONES" color="red" conceptos={provisiones} onChange={mark(setProvisiones)} readOnly={!canEdit} />
                </div>
            </div>

            {canEdit && (
                <button onClick={handleGuardar} disabled={isLoading}
                    className="w-full py-6 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black text-2xl rounded-3xl shadow-2xl hover:shadow-purple-200 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider">
                    {isLoading ? 'GUARDANDO...' : `GUARDAR CORTE #${numeroCorte}`}
                </button>
            )}
        </div>
    );
};

export default FichasCorteDetalle;
