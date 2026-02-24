// VISTA: Maletas Asignar
import React, { useState, useEffect } from 'react';
import { AppState } from '../../types';
import apiFichas from '../services/apiFichas';

interface Props {
    state: AppState; user: any;
    updateState: (u: (p: AppState) => AppState) => void;
    onNavigate: (view: string, params?: any) => void;
    params?: any;
}

const MaletasAsignar: React.FC<Props> = ({ state, user, updateState, onNavigate, params }) => {
    const id = params?.id || '';
    const canEdit = user?.role === 'admin' || user?.role === 'general';

    const [maleta, setMaleta] = useState<any>(null);
    const [refsSinCorreria, setRefsSinCorreria] = useState<any[]>([]);
    const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const cargar = async () => {
            try {
                const [maletaData, refs] = await Promise.all([apiFichas.getMaleta(id), apiFichas.getReferenciasSinCorreria()]);
                setMaleta(maletaData);
                setRefsSinCorreria(refs);
                if (maletaData?.referencias) setSeleccionadas(maletaData.referencias.map((r: any) => r.referencia));
            } catch { alert('Error al cargar datos'); }
        };
        if (id) cargar();
    }, [id]);

    const resultadosBusqueda = busqueda.trim().length >= 2
        ? (state.references || []).filter(ref => ref.id.toLowerCase().includes(busqueda.toLowerCase()) || (ref.description || '').toLowerCase().includes(busqueda.toLowerCase())).slice(0, 10)
        : [];

    const toggleRef = (ref: string) => setSeleccionadas(prev => prev.includes(ref) ? prev.filter(r => r !== ref) : [...prev, ref]);

    const handleGuardar = async () => {
        if (!canEdit) { alert('Sin permisos'); return; }
        if (seleccionadas.length === 0) { alert('Seleccione al menos una referencia'); return; }
        setIsLoading(true);
        try {
            const result = await apiFichas.updateMaleta(id, maleta?.nombre, maleta?.correriaId, seleccionadas);
            if (result.success) {
                alert('✅ Maleta guardada');
                const maletas = await apiFichas.getMaletas();
                updateState(prev => ({ ...prev, maletas }));
                onNavigate('maletas');
            } else alert('❌ ' + result.message);
        } catch { alert('❌ Error de conexión'); }
        finally { setIsLoading(false); }
    };

    const handleLimpiar = async () => {
        if (!window.confirm('¿Estás seguro de que deseas limpiar todas las referencias?')) return;
        setIsLoading(true);
        try {
            const result = await apiFichas.updateMaleta(id, maleta?.nombre, maleta?.correriaId, []);
            if (result.success) {
                alert('✅ Maleta limpiada');
                setSeleccionadas([]);
                const maletas = await apiFichas.getMaletas();
                updateState(prev => ({ ...prev, maletas }));
                onNavigate('maletas');
            } else alert('❌ ' + result.message);
        } catch { alert('❌ Error de conexión'); }
        finally { setIsLoading(false); }
    };

    if (!maleta) return (
        <div className="flex items-center justify-center h-96">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500 font-bold">Cargando maleta...</p>
            </div>
        </div>
    );

    const correria = (state.correrias || []).find(c => c.id === maleta.correriaId);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => onNavigate('maletas')} className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{maleta.nombre}</h2>
                        <p className="text-slate-500 font-bold text-xs mt-1">
                            {correria ? `${correria.name} ${correria.year}` : 'Sin correría'} • {seleccionadas.length} referencia{seleccionadas.length !== 1 ? 's' : ''} seleccionada{seleccionadas.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                {canEdit && (
                    <button onClick={handleGuardar} disabled={isLoading} className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 uppercase tracking-wider text-sm">
                        {isLoading ? 'GUARDANDO...' : 'GUARDAR MALETA'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Referencias disponibles */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="mb-4">
                        <h3 className="text-lg font-black text-slate-800 mb-1">Referencias Disponibles</h3>
                        <p className="text-xs text-slate-500 font-bold">{refsSinCorreria.length} sin correría asignada</p>
                    </div>
                    {refsSinCorreria.length === 0 ? (
                        <div className="py-12 text-center"><p className="text-slate-400 font-bold">No hay referencias disponibles</p></div>
                    ) : (
                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                            {refsSinCorreria.map((ref: any) => (
                                <label key={ref.referencia} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${seleccionadas.includes(ref.referencia) ? 'bg-purple-50 border-purple-300' : 'bg-slate-50 border-slate-200 hover:border-purple-200'}`}>
                                    <input type="checkbox" checked={seleccionadas.includes(ref.referencia)} onChange={() => toggleRef(ref.referencia)} disabled={!canEdit} className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
                                    <div className="flex-1">
                                        <p className="font-black text-slate-800">{ref.referencia}</p>
                                        <p className="text-xs text-slate-500 font-bold truncate">{ref.descripcion || 'Sin descripción'}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Buscar referencias antiguas */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="mb-4">
                        <h3 className="text-lg font-black text-slate-800 mb-1">Buscar Referencias Antiguas</h3>
                        <p className="text-xs text-slate-500 font-bold">Referencias que ya tienen correría</p>
                    </div>
                    <div className="mb-4 relative">
                        <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Mín. 2 caracteres..."
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-purple-100 focus:border-purple-500" />
                    </div>
                    {busqueda.trim().length < 2 ? (
                        <div className="py-12 text-center"><p className="text-slate-400 font-bold text-sm">Escribe al menos 2 caracteres</p></div>
                    ) : resultadosBusqueda.length === 0 ? (
                        <div className="py-12 text-center"><p className="text-slate-400 font-bold">Sin resultados</p></div>
                    ) : (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                            {resultadosBusqueda.map(ref => (
                                <label key={ref.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${seleccionadas.includes(ref.id) ? 'bg-purple-50 border-purple-300' : 'bg-slate-50 border-slate-200 hover:border-purple-200'}`}>
                                    <input type="checkbox" checked={seleccionadas.includes(ref.id)} onChange={() => toggleRef(ref.id)} disabled={!canEdit} className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
                                    <div className="flex-1">
                                        <p className="font-black text-slate-800">{ref.id}</p>
                                        <p className="text-xs text-slate-500 font-bold truncate">{ref.description || 'Sin descripción'}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Resumen */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-3xl border-2 border-purple-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-black text-purple-700 uppercase tracking-widest mb-1">Resumen de Selección</p>
                        <p className="text-3xl font-black text-purple-800">{seleccionadas.length}</p>
                        <p className="text-xs text-purple-600 font-bold mt-1">referencia{seleccionadas.length !== 1 ? 's' : ''} seleccionada{seleccionadas.length !== 1 ? 's' : ''}</p>
                    </div>
                    {seleccionadas.length > 0 && <button onClick={handleLimpiar} disabled={isLoading} className="px-4 py-2 bg-white text-purple-600 rounded-xl font-bold text-sm hover:bg-purple-50 transition-colors disabled:opacity-50">
                        {isLoading ? 'LIMPIANDO...' : 'Limpiar'}
                    </button>}
                </div>
                {seleccionadas.length > 0 && (
                    <div className="mt-4 pt-4 border-t-2 border-purple-300">
                        <p className="text-xs font-black text-purple-600 uppercase tracking-widest mb-2">Seleccionadas:</p>
                        <div className="flex flex-wrap gap-2">
                            {seleccionadas.slice(0, 20).map(ref => <span key={ref} className="px-3 py-1 bg-white text-purple-700 rounded-lg text-xs font-bold">{ref}</span>)}
                            {seleccionadas.length > 20 && <span className="px-3 py-1 bg-purple-200 text-purple-700 rounded-lg text-xs font-bold">+{seleccionadas.length - 20} más</span>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MaletasAsignar;
