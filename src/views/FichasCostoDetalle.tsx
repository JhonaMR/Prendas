// ============================================
// VISTA: Fichas Costo Detalle
// Editor con precio, rentabilidad y cortes
// ============================================

import React, { useState, useEffect, useMemo } from 'react';
import { AppState } from '../../types';
import { ConceptoFicha } from '../../types/typesFichas';
import apiFichas from '../services/apiFichas';
import SeccionConceptos from '../components/modules/SeccionConceptos';
import SubidaFotos from '../components/modules/SubidaFotos';

interface Props {
    state: AppState;
    user: any;
    updateState: (u: (p: AppState) => AppState) => void;
    onNavigate: (view: string, params?: any) => void;
    params?: any;
}

const FichasCostoDetalle: React.FC<Props> = ({ state, user, updateState, onNavigate, params }) => {
    const referencia = params?.referencia || '';
    const isAdmin = user?.role === 'admin';
    const canEdit = isAdmin;

    const [isLoading, setIsLoading] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showModalCorte, setShowModalCorte] = useState(false);

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

    const fichaExistente = (state.fichasCosto || []).find(f => f.referencia === referencia);

    const ajustarA900 = (v: number) => { if (v <= 0) return 0; return Math.ceil(v / 1000) * 1000 - 100; };
    const calcPrecio = (costo: number, rent: number) => ajustarA900(costo / (1 - rent / 100));
    const calcRent = (precio: number, costo: number) => costo === 0 ? 0 : (1 - (costo / precio)) * 100;

    useEffect(() => {
        if (fichaExistente) {
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
            setPrecioVenta(fichaExistente.precioVenta || 0);
            setRentabilidad(fichaExistente.rentabilidad || 49);
        }
    }, [fichaExistente?.referencia]);

    const totales = useMemo(() => {
        const calc = (items: ConceptoFicha[]) => items.reduce((acc, i) => acc + (i.total || 0), 0);
        const totalMP = calc(materiaPrima), totalMO = calc(manoObra);
        const totalID = calc(insumosDirectos), totalII = calc(insumosIndirectos), totalProv = calc(provisiones);
        const total = totalMP + totalMO + totalID + totalII + totalProv;
        return { totalMP, totalMO, totalID, totalII, totalProv, total, costoContabilizar: total - totalProv };
    }, [materiaPrima, manoObra, insumosDirectos, insumosIndirectos, provisiones]);

    const descuentos = useMemo(() => {
        const calc = (desc: number) => { const p = ajustarA900(precioVenta * (1 - desc / 100)); return { precio: p, rent: calcRent(p, totales.total) }; };
        return { desc0: { precio: precioVenta, rent: rentabilidad }, desc5: calc(5), desc10: calc(10), desc15: calc(15) };
    }, [precioVenta, rentabilidad, totales.total]);

    const margenGanancia = useMemo(() => ajustarA900(precioVenta + (precioVenta * 0.35)), [precioVenta]);

    const handleGuardar = async () => {
        if (!canEdit) { alert('No tienes permisos para editar fichas de costo'); return; }
        setIsLoading(true);
        try {
            const result = await apiFichas.updateFichaCosto(referencia, { referencia, descripcion, marca, novedad, muestra1, muestra2, observaciones, foto1, foto2: foto2 || null, materiaPrima, manoObra, insumosDirectos, insumosIndirectos, provisiones }, precioVenta, rentabilidad);
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
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => { if (hasUnsavedChanges) { if (confirm('¿Salir sin guardar?')) onNavigate('fichas-costo'); } else onNavigate('fichas-costo'); }} className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{referencia}</h2>
                        <p className="text-slate-500 font-bold text-xs mt-1">Diseñadora: {fichaExistente?.disenadoraNombre || 'N/A'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {hasUnsavedChanges && <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div><span className="font-bold text-sm">Cambios sin guardar</span></div>}
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-yellow-500 text-white font-black rounded-xl uppercase text-xs">Costeo Inicial</button>
                        {[1, 2, 3, 4].map(num => (
                            <button key={num}
                                onClick={() => num <= numCortes ? onNavigate('fichas-corte-detalle', { referencia, numeroCorte: num }) : (num === numCortes + 1 ? setShowModalCorte(true) : null)}
                                disabled={num > numCortes + 1}
                                className={`px-4 py-2 font-black rounded-xl uppercase text-xs transition-all ${num <= numCortes ? 'bg-blue-500 text-white hover:bg-blue-600' : num === numCortes + 1 ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-slate-100 text-slate-300 opacity-50 cursor-not-allowed'}`}>
                                Corte #{num}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6">
                    <SubidaFotos referencia={referencia} foto1={foto1} foto2={foto2} onFoto1Change={mark(setFoto1)} onFoto2Change={mark(setFoto2)} readOnly={!canEdit} />
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Observaciones</label>
                            <textarea value={observaciones} onChange={e => { setObservaciones(e.target.value); setHasUnsavedChanges(true); }} readOnly={!canEdit} rows={10} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 resize-none" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-3xl border-2 border-yellow-200 space-y-4">
                        <h3 className="text-sm font-black text-yellow-700 uppercase tracking-widest">Rentabilidad vs Precio</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-[10px] font-black text-yellow-600 uppercase tracking-widest block mb-2">Costo Total</label><div className="px-4 py-3 bg-white rounded-xl"><p className="font-black text-2xl text-slate-800">$ {totales.total.toLocaleString()}</p></div></div>
                            <div><label className="text-[10px] font-black text-yellow-600 uppercase tracking-widest block mb-2">Costo Contabilizar</label><div className="px-4 py-3 bg-white rounded-xl"><p className="font-black text-2xl text-slate-800">$ {totales.costoContabilizar.toLocaleString()}</p></div></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-[10px] font-black text-yellow-600 uppercase tracking-widest block mb-2">Precio de Venta</label><div className="px-4 py-3 bg-white rounded-xl flex items-center justify-center"><div className="flex items-center gap-2"><span className="font-black text-lg text-yellow-600">$</span><input type="number" value={precioVenta} onChange={e => { const p = Number(e.target.value); setPrecioVenta(p); setRentabilidad(calcRent(p, totales.total)); setHasUnsavedChanges(true); }} readOnly={!canEdit} className="font-black text-2xl text-slate-800 bg-white text-center border-0 focus:ring-0 w-32" /></div></div></div>
                            <div><label className="text-[10px] font-black text-yellow-600 uppercase tracking-widest block mb-2">Rentabilidad %</label><div className="px-4 py-3 bg-white rounded-xl flex items-center justify-center"><input type="number" value={Math.round(rentabilidad)} onChange={e => { const r = Number(e.target.value); setRentabilidad(r); setPrecioVenta(calcPrecio(totales.total, r)); setHasUnsavedChanges(true); }} readOnly={!canEdit} className="font-black text-2xl text-slate-800 bg-white text-center border-0 focus:ring-0 w-16" /><span className="font-black text-lg text-yellow-600 ml-2">%</span></div></div>
                        </div>
                        <p className="text-xs text-yellow-700 font-bold italic">Los precios se ajustan automáticamente para terminar en 900</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-3xl border-2 border-purple-200 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-purple-700 uppercase tracking-widest">Cantidad Total Cortada</h3>
                            <p className="text-xs text-purple-600 font-bold mt-2">{numCortes} corte{numCortes !== 1 ? 's' : ''} asentado{numCortes !== 1 ? 's' : ''}</p>
                        </div>
                        <p className="text-6xl font-black text-purple-600">{fichaExistente?.cantidadTotalCortada || 0}</p>
                    </div>

                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-2xl border-2 border-pink-200 flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-black text-pink-700 uppercase tracking-widest">Margen Ganancia Cliente</h3>
                            <p className="text-sm font-black text-pink-600">35%</p>
                        </div>
                        <p className="text-3xl font-black text-pink-700">$ {margenGanancia.toLocaleString()}</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-3xl border-2 border-orange-200">
                        <h3 className="text-sm font-black text-orange-700 uppercase tracking-widest mb-4">Posibles Descuentos</h3>
                        <table className="w-full text-sm">
                            <thead><tr className="border-b-2 border-orange-300"><th className="py-2 text-left font-black text-orange-600 uppercase text-xs">Desc</th><th className="py-2 text-right font-black text-orange-600 uppercase text-xs">Precio</th><th className="py-2 text-right font-black text-orange-600 uppercase text-xs">Rent %</th></tr></thead>
                            <tbody className="divide-y divide-orange-200">
                                {[['0%', descuentos.desc0], ['5%', descuentos.desc5], ['10%', descuentos.desc10], ['15%', descuentos.desc15]].map(([label, d]: any) => (
                                    <tr key={label}><td className="py-3 font-black text-slate-700">{label}</td><td className="py-3 text-right font-black text-slate-800">$ {(d.precio || 0).toLocaleString()}</td><td className="py-3 text-right font-black text-green-600">{(d.rent || 0).toFixed(1)}%</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6 lg:col-span-2">
                    <div className="bg-slate-100 p-6 rounded-3xl space-y-4">
                        <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest">Información Básica</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Descripción</label>
                                <input type="text" value={descripcion} onChange={e => mark(setDescripcion)(e.target.value)} readOnly={!canEdit} className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Novedad</label>
                                <input type="text" value={novedad} onChange={e => mark(setNovedad)(e.target.value)} readOnly={!canEdit} className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Marca</label>
                                <input type="text" value={marca} onChange={e => mark(setMarca)(e.target.value)} readOnly={!canEdit} className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Muestra #1</label>
                                <input type="text" value={muestra1} onChange={e => mark(setMuestra1)(e.target.value)} readOnly={!canEdit} className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Muestra #2</label>
                                <input type="text" value={muestra2} onChange={e => mark(setMuestra2)(e.target.value)} readOnly={!canEdit} className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500" />
                            </div>
                        </div>
                    </div>
                    <SeccionConceptos titulo="MATERIA PRIMA" color="pink" conceptos={materiaPrima} onChange={mark(setMateriaPrima)} readOnly={!canEdit} mostrarTipo={true} />
                    <SeccionConceptos titulo="MANO DE OBRA" color="blue" conceptos={manoObra} onChange={mark(setManoObra)} readOnly={!canEdit} />
                    <SeccionConceptos titulo="INSUMOS DIRECTOS" color="slate" conceptos={insumosDirectos} onChange={mark(setInsumosDirectos)} readOnly={!canEdit} />
                    <SeccionConceptos titulo="INSUMOS INDIRECTOS" color="orange" conceptos={insumosIndirectos} onChange={mark(setInsumosIndirectos)} readOnly={!canEdit} />
                    <SeccionConceptos titulo="PROVISIONES" color="red" conceptos={provisiones} onChange={mark(setProvisiones)} readOnly={!canEdit} totalesOtrosCostos={{ totalMP: totales.totalMP, totalMO: totales.totalMO, totalID: totales.totalID, totalII: totales.totalII }} />

                </div>
            </div>

            {canEdit && (<button onClick={handleGuardar} disabled={isLoading} className="w-full py-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black text-2xl rounded-3xl shadow-2xl hover:shadow-blue-200 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider">{isLoading ? 'GUARDANDO...' : 'GUARDAR FICHA'}</button>)}

            {showModalCorte && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-black text-slate-800 mb-2">¿Asentar Corte #{numCortes + 1}?</h3>
                            <p className="text-sm text-slate-500 font-bold">Se copiarán todos los conceptos de la ficha inicial.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowModalCorte(false)} className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-wide text-sm">Cancelar</button>
                            <button onClick={() => { setShowModalCorte(false); onNavigate('fichas-corte-detalle', { referencia, numeroCorte: numCortes + 1, nuevo: true }); }} className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-black rounded-xl hover:shadow-lg transition-all uppercase tracking-wide text-sm">Asentar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FichasCostoDetalle;
