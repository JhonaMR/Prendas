// VISTA: Maletas Asignar
import React, { useState, useEffect } from 'react';
import { AppState } from '../../types';
import apiFichas from '../services/apiFichas';
import { useDarkMode } from '../context/DarkModeContext';

interface Props {
    state: AppState; user: any;
    updateState: (u: (p: AppState) => AppState) => void;
    onNavigate: (view: string, params?: any) => void;
    params?: any;
}

const MaletasAsignar: React.FC<Props> = ({ state, user, updateState, onNavigate, params }) => {
    const { isDark } = useDarkMode();
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
                <div className={`w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4 transition-colors ${isDark ? 'border-violet-500 border-t-transparent' : 'border-purple-500 border-t-transparent'}`}></div>
                <p className={`font-bold transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>Cargando maleta...</p>
            </div>
        </div>
    );

    const correria = (state.correrias || []).find(c => c.id === maleta.correriaId);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => onNavigate('maletas')} className={`p-3 rounded-xl transition-colors ${isDark ? 'bg-violet-700/50 hover:bg-violet-700 text-violet-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                    </button>
                    <div>
                        <h2 className={`text-3xl font-black tracking-tighter transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{maleta.nombre}</h2>
                        <p className={`font-bold text-xs mt-1 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>
                            {correria ? `${correria.name} ${correria.year}` : 'Sin correría'} • {seleccionadas.length} referencia{seleccionadas.length !== 1 ? 's' : ''} seleccionada{seleccionadas.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                {canEdit && (
                    <button onClick={handleGuardar} disabled={isLoading} className={`px-8 py-4 text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 uppercase tracking-wider text-sm ${isDark ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600'}`}>
                        {isLoading ? 'GUARDANDO...' : 'GUARDAR MALETA'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Referencias disponibles */}
                <div className={`p-6 rounded-3xl border shadow-sm transition-colors ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
                    <div className="mb-4">
                        <h3 className={`text-lg font-black mb-1 transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>Referencias Disponibles</h3>
                        <p className={`text-xs font-bold transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>{refsSinCorreria.length} sin correría asignada</p>
                    </div>
                    {refsSinCorreria.length === 0 ? (
                        <div className={`py-12 text-center transition-colors ${isDark ? 'text-violet-500' : 'text-slate-400'}`}><p className="font-bold">No hay referencias disponibles</p></div>
                    ) : (
                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                            {refsSinCorreria.map((ref: any) => (
                                <label key={ref.referencia} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${seleccionadas.includes(ref.referencia) ? isDark ? 'bg-violet-700/50 border-violet-600' : 'bg-purple-50 border-purple-300' : isDark ? 'bg-violet-700/20 border-violet-700 hover:border-pink-600' : 'bg-slate-50 border-slate-200 hover:border-purple-200'}`}>
                                    <input type="checkbox" checked={seleccionadas.includes(ref.referencia)} onChange={() => toggleRef(ref.referencia)} disabled={!canEdit} className={`w-5 h-5 rounded focus:ring-2 transition-colors ${isDark ? 'text-violet-600 focus:ring-violet-500 bg-[#3d2d52] border-violet-600' : 'text-purple-600 focus:ring-purple-500'}`} />
                                    <div className="flex-1">
                                        <p className={`font-black transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{ref.referencia}</p>
                                        <p className={`text-xs font-bold truncate transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>{ref.descripcion || 'Sin descripción'}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Buscar referencias antiguas */}
                <div className={`p-6 rounded-3xl border shadow-sm transition-colors ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
                    <div className="mb-4">
                        <h3 className={`text-lg font-black mb-1 transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>Buscar Referencias Antiguas</h3>
                        <p className={`text-xs font-bold transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>Referencias que ya tienen correría</p>
                    </div>
                    <div className="mb-4 relative">
                        <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Mín. 2 caracteres..."
                            className={`w-full px-4 py-3 border-2 rounded-xl font-bold focus:ring-4 transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-500 focus:ring-violet-400 focus:border-violet-500' : 'bg-slate-50 border-slate-200 focus:ring-purple-100 focus:border-purple-500'}`} />
                    </div>
                    {busqueda.trim().length < 2 ? (
                        <div className={`py-12 text-center transition-colors ${isDark ? 'text-violet-500' : 'text-slate-400'}`}><p className="font-bold text-sm">Escribe al menos 2 caracteres</p></div>
                    ) : resultadosBusqueda.length === 0 ? (
                        <div className={`py-12 text-center transition-colors ${isDark ? 'text-violet-500' : 'text-slate-400'}`}><p className="font-bold">Sin resultados</p></div>
                    ) : (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                            {resultadosBusqueda.map(ref => (
                                <label key={ref.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${seleccionadas.includes(ref.id) ? isDark ? 'bg-violet-700/50 border-violet-600' : 'bg-purple-50 border-purple-300' : isDark ? 'bg-violet-700/20 border-violet-700 hover:border-pink-600' : 'bg-slate-50 border-slate-200 hover:border-purple-200'}`}>
                                    <input type="checkbox" checked={seleccionadas.includes(ref.id)} onChange={() => toggleRef(ref.id)} disabled={!canEdit} className={`w-5 h-5 rounded focus:ring-2 transition-colors ${isDark ? 'text-violet-600 focus:ring-violet-500 bg-[#3d2d52] border-violet-600' : 'text-purple-600 focus:ring-purple-500'}`} />
                                    <div className="flex-1">
                                        <p className={`font-black transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{ref.id}</p>
                                        <p className={`text-xs font-bold truncate transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>{ref.description || 'Sin descripción'}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Resumen */}
            <div className={`p-6 rounded-3xl border-2 transition-colors ${isDark ? 'bg-violet-700/20 border-violet-700' : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`text-sm font-black uppercase tracking-widest mb-1 transition-colors ${isDark ? 'text-violet-400' : 'text-purple-700'}`}>Resumen de Selección</p>
                        <p className={`text-3xl font-black transition-colors ${isDark ? 'text-violet-200' : 'text-purple-800'}`}>{seleccionadas.length}</p>
                        <p className={`text-xs font-bold mt-1 transition-colors ${isDark ? 'text-violet-400' : 'text-purple-600'}`}>referencia{seleccionadas.length !== 1 ? 's' : ''} seleccionada{seleccionadas.length !== 1 ? 's' : ''}</p>
                    </div>
                    {seleccionadas.length > 0 && <button onClick={handleLimpiar} disabled={isLoading} className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 ${isDark ? 'bg-violet-700/50 hover:bg-violet-700 text-violet-200' : 'bg-white text-purple-600 hover:bg-purple-50'}`}>
                        {isLoading ? 'LIMPIANDO...' : 'Limpiar'}
                    </button>}
                </div>
                {seleccionadas.length > 0 && (
                    <div className={`mt-4 pt-4 border-t-2 transition-colors ${isDark ? 'border-violet-700' : 'border-purple-300'}`}>
                        <p className={`text-xs font-black uppercase tracking-widest mb-2 transition-colors ${isDark ? 'text-violet-400' : 'text-purple-600'}`}>Seleccionadas:</p>
                        <div className="flex flex-wrap gap-2">
                            {seleccionadas.slice(0, 20).map(ref => <span key={ref} className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${isDark ? 'bg-violet-700/50 text-violet-200' : 'bg-white text-purple-700'}`}>{ref}</span>)}
                            {seleccionadas.length > 20 && <span className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${isDark ? 'bg-violet-700/70 text-violet-200' : 'bg-purple-200 text-purple-700'}`}>+{seleccionadas.length - 20} más</span>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MaletasAsignar;
