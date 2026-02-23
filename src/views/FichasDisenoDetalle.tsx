// ============================================
// VISTA: Fichas Diseño Detalle
// Editor completo de ficha de diseño
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

const FichasDisenoDetalle: React.FC<Props> = ({ state, user, updateState, onNavigate, params }) => {
    const referencia = params?.referencia || '';
    const isNueva = params?.nueva || false;

    const isDisenadora = user?.role === 'diseñadora';
    const canEdit = isDisenadora || user?.role === 'admin' || user?.role === 'general';
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

    const fichaExistente = (state.fichasDiseno || []).find(f => f.referencia === referencia);

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

    // Cargar valores base cuando se crea una nueva ficha
    useEffect(() => {
        if (isNueva && manoObra.length === 0 && insumosDirectos.length === 0 && provisiones.length === 0) {
            setManoObra([
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
                onNavigate('fichas-diseno');
            } else alert('❌ Error al guardar: ' + result.message);
        } catch { alert('❌ Error de conexión'); }
        finally { setIsLoading(false); }
    };

    const disenadoraNombre = (state.disenadoras || []).find(d => d.id === disenadoraId)?.nombre || '';
    const mark = (setter: any) => (v: any) => { setter(v); setHasUnsavedChanges(true); };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => { if (hasUnsavedChanges) { if (confirm('¿Salir sin guardar?')) onNavigate('fichas-diseno'); } else onNavigate('fichas-diseno'); }}
                        className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{referencia}</h2>
                        <p className="text-slate-500 font-bold text-xs mt-1">Diseñadora: {disenadoraNombre}{fichaExistente?.importada && <span className="ml-2 text-blue-600">• Importada a Costos</span>}</p>
                    </div>
                </div>
                {hasUnsavedChanges && (<div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div><span className="font-bold text-sm">Cambios sin guardar</span></div>)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6">
                    <SubidaFotos referencia={referencia} foto1={foto1} foto2={foto2} onFoto1Change={mark(setFoto1)} onFoto2Change={mark(setFoto2)} readOnly={!canEdit} />
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest">Información Básica</h3>
                        {[['Descripción de Prenda', descripcion, mark(setDescripcion)], ['Marca', marca, mark(setMarca)], ['Novedad o Correría', novedad, mark(setNovedad)]].map(([label, val, setter]: any) => (
                            <div key={label as string}>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{label}</label>
                                <input type="text" value={val} onChange={e => setter(e.target.value)} readOnly={!canEdit} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-pink-100 focus:border-pink-500" />
                            </div>
                        ))}
                        <div className="grid grid-cols-2 gap-4">
                            {[['Muestra #1', muestra1, mark(setMuestra1)], ['Muestra #2', muestra2, mark(setMuestra2)]].map(([label, val, setter]: any) => (
                                <div key={label as string}><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{label}</label><input type="text" value={val} onChange={e => setter(e.target.value)} readOnly={!canEdit} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-pink-100 focus:border-pink-500" /></div>
                            ))}
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Observaciones</label>
                            <textarea value={observaciones} onChange={e => { setObservaciones(e.target.value); setHasUnsavedChanges(true); }} readOnly={!canEdit} rows={6} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-pink-100 focus:border-pink-500 resize-none" />
                        </div>
                    </div>
                </div>
                <div className="space-y-6 lg:col-span-2">
                    <SeccionConceptos titulo="MATERIA PRIMA" color="pink" conceptos={materiaPrima} onChange={mark(setMateriaPrima)} readOnly={!canEdit} mostrarTipo={true} />
                    <SeccionConceptos titulo="MANO DE OBRA" color="blue" conceptos={manoObra} onChange={mark(setManoObra)} readOnly={!canEdit} />
                    <SeccionConceptos titulo="INSUMOS DIRECTOS" color="slate" conceptos={insumosDirectos} onChange={mark(setInsumosDirectos)} readOnly={!canEdit} />
                    <SeccionConceptos titulo="INSUMOS INDIRECTOS" color="orange" conceptos={insumosIndirectos} onChange={mark(setInsumosIndirectos)} readOnly={!canEdit} />
                    <SeccionConceptos titulo="PROVISIONES" color="red" conceptos={provisiones} onChange={mark(setProvisiones)} readOnly={!canEdit} totalesOtrosCostos={{ totalMP: totales.totalMP, totalMO: totales.totalMO, totalID: totales.totalID, totalII: totales.totalII }} />
                </div>
            </div>

            {canEdit && (
                <button onClick={handleGuardar} disabled={isLoading} className="w-full py-6 bg-gradient-to-r from-pink-600 to-pink-500 text-white font-black text-2xl rounded-3xl shadow-2xl hover:shadow-pink-200 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider">
                    {isLoading ? 'GUARDANDO...' : 'GUARDAR FICHA'}
                </button>
            )}
        </div>
    );
};

export default FichasDisenoDetalle;
