// VISTA: Maletas Listado
import React, { useState } from 'react';
import { AppState, UserRole } from '../../types';
import apiFichas from '../services/apiFichas';
import CorreriaAutocomplete from '../components/shared/CorreriaAutocomplete';
import { useDarkMode } from '../context/DarkModeContext';
import { canCreate, canDelete } from '../utils/permissions';

interface Props {
    state: AppState; user: any;
    updateState: (u: (p: AppState) => AppState) => void;
    onNavigate: (view: string, params?: any) => void;
}

const MaletasListado: React.FC<Props> = ({ state, user, updateState, onNavigate }) => {
    const { isDark } = useDarkMode();
    const [showModalCrear, setShowModalCrear] = useState(false);
    const [showModalEliminar, setShowModalEliminar] = useState(false);
    const [nombreMaleta, setNombreMaleta] = useState('');
    const [correriaId, setCorreriaId] = useState('');
    const [correriaSearch, setCorreriaSearch] = useState('');
    const [showCorreriaDropdown, setShowCorreriaDropdown] = useState(false);
    const [maletaEliminar, setMaletaEliminar] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const canCreateMaleta = canCreate(user);
    const canDeleteMaleta = canDelete(user);

    const handleCrear = async () => {
        if (!nombreMaleta.trim()) { alert('El nombre es obligatorio'); return; }
        setIsLoading(true);
        try {
            const result = await apiFichas.createMaleta(nombreMaleta, correriaId || null, [], user.name);
            if (result.success) {
                const maletas = await apiFichas.getMaletas();
                updateState(prev => ({ ...prev, maletas }));
                setShowModalCrear(false); setNombreMaleta(''); setCorreriaId('');
                onNavigate('maletas-asignar', { id: result.data.id });
            } else alert('❌ ' + result.message);
        } catch { alert('❌ Error de conexión'); }
        finally { setIsLoading(false); }
    };

    const handleEliminar = async () => {
        if (!maletaEliminar) return;
        setIsLoading(true);
        try {
            const result = await apiFichas.deleteMaleta(maletaEliminar);
            if (result.success) {
                const maletas = await apiFichas.getMaletas();
                updateState(prev => ({ ...prev, maletas }));
                setShowModalEliminar(false); setMaletaEliminar(null);
                alert('✅ Maleta eliminada');
            } else alert('❌ ' + result.message);
        } catch { alert('❌ Error de conexión'); }
        finally { setIsLoading(false); }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className={`text-3xl font-black tracking-tighter transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>Maletas</h2>
                    <p className={`font-bold text-xs mt-1 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>{(state.maletas || []).length} maleta{(state.maletas || []).length !== 1 ? 's' : ''}</p>
                </div>
                {canCreateMaleta && (
                    <button onClick={() => setShowModalCrear(true)} className={`px-8 py-4 text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 uppercase tracking-wider text-sm ${isDark ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Crear Maleta
                    </button>
                )}
            </div>

            {(state.maletas || []).length === 0 ? (
                <div className={`p-24 rounded-[48px] border-2 border-dashed flex flex-col items-center text-center transition-colors ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'}`}>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors ${isDark ? 'bg-violet-700/50 text-violet-400' : 'bg-slate-100 text-slate-300'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>
                    </div>
                    <p className={`font-bold text-lg transition-colors ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>No hay maletas creadas</p>
                    {canCreateMaleta && <button onClick={() => setShowModalCrear(true)} className={`mt-6 px-6 py-3 font-black rounded-xl transition-colors ${isDark ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'bg-purple-500 text-white hover:bg-purple-600'}`}>Crear Primera Maleta</button>}
                </div>
            ) : (
                <div className={`rounded-3xl border shadow-sm overflow-hidden transition-colors ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
                    <table className="w-full">
                        <thead>
                            <tr className={`border-b transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-700' : 'bg-slate-50 border-slate-100'}`}>
                                {['Nombre', 'Correría', '# Refs', 'Creada por', 'Acciones'].map(h => (
                                    <th key={h} className={`px-6 py-4 ${h === 'Acciones' ? 'text-right' : h === '# Refs' ? 'text-center' : 'text-left'}`}>
                                        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>{h}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className={`divide-y transition-colors ${isDark ? 'divide-violet-700' : 'divide-slate-50'}`}>
                            {(state.maletas || []).map(maleta => (
                                <tr key={maleta.id} className={`transition-colors ${isDark ? 'hover:bg-violet-700/30' : 'hover:bg-slate-50'}`}>
                                    <td className={`px-6 py-4 font-black transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{maleta.nombre}</td>
                                    <td className="px-6 py-4">
                                        {maleta.correriaNombre
                                            ? <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${isDark ? 'bg-violet-700/50 text-violet-200' : 'bg-blue-50 text-blue-700'}`}><span className="font-bold text-sm">{maleta.correriaNombre}</span><span className="text-xs opacity-75">{maleta.correriaYear}</span></div>
                                            : <span className={`italic text-sm transition-colors ${isDark ? 'text-violet-500' : 'text-slate-400'}`}>Sin correría</span>}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-black transition-colors ${isDark ? 'bg-violet-700/50 text-violet-200' : 'bg-purple-100 text-purple-700'}`}>{maleta.numReferencias}</span>
                                    </td>
                                    <td className={`px-6 py-4 font-bold text-sm transition-colors ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>{maleta.createdBy}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => onNavigate('maletas-asignar', { id: maleta.id })} className={`px-4 py-2 rounded-lg hover:transition-colors font-bold text-sm ${isDark ? 'bg-violet-700/50 text-violet-200 hover:bg-violet-700' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>Ver / Editar</button>
                                            {canDeleteMaleta && (
                                                <button onClick={() => { setMaletaEliminar(maleta.id); setShowModalEliminar(true); }} className={`px-4 py-2 rounded-lg transition-colors font-bold text-sm ${isDark ? 'bg-pink-600/50 text-pink-200 hover:bg-pink-600' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>Eliminar</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Crear */}
            {showModalCrear && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors ${isDark ? 'bg-black/60' : 'bg-slate-900/40 backdrop-blur-sm'}`}>
                    <div className={`rounded-3xl shadow-2xl max-w-md w-full p-8 transition-colors ${isDark ? 'bg-[#4a3a63] border border-violet-700' : 'bg-white'}`}>
                        <div className="text-center mb-6">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${isDark ? 'bg-violet-700/50 text-violet-400' : 'bg-purple-100 text-purple-600'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>
                            </div>
                            <h3 className={`text-2xl font-black mb-2 transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>Crear Nueva Maleta</h3>
                            <p className={`text-sm font-bold transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>Nombre y correría (opcional)</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Nombre de Maleta</label>
                                <input type="text" value={nombreMaleta} onChange={e => setNombreMaleta(e.target.value)} placeholder="Ej: Maleta Madres 2026" autoFocus
                                    className={`w-full px-4 py-3 border-2 rounded-xl font-bold focus:ring-4 transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-500 focus:ring-violet-400 focus:border-violet-500' : 'bg-slate-50 border-slate-200 focus:ring-purple-100 focus:border-purple-500'}`} />
                            </div>
                            <div>
                                <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Correría (Opcional)</label>
                                <CorreriaAutocomplete
                                  value={correriaId}
                                  correrias={state.correrias || []}
                                  onChange={setCorreriaId}
                                  search={correriaSearch}
                                  setSearch={setCorreriaSearch}
                                  showDropdown={showCorreriaDropdown}
                                  setShowDropdown={setShowCorreriaDropdown}
                                  placeholder="Buscar correría..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => { setShowModalCrear(false); setNombreMaleta(''); setCorreriaId(''); setCorreriaSearch(''); setShowCorreriaDropdown(false); }} className={`flex-1 px-6 py-3 font-black rounded-xl transition-colors uppercase tracking-wide text-sm ${isDark ? 'bg-violet-700/50 hover:bg-violet-700 text-violet-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancelar</button>
                            <button onClick={handleCrear} disabled={isLoading} className={`flex-1 px-6 py-3 text-white font-black rounded-xl hover:shadow-lg transition-all uppercase tracking-wide text-sm disabled:opacity-50 ${isDark ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600'}`}>{isLoading ? 'CREANDO...' : 'CREAR'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Eliminar */}
            {showModalEliminar && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors ${isDark ? 'bg-black/60' : 'bg-slate-900/40 backdrop-blur-sm'}`}>
                    <div className={`rounded-3xl shadow-2xl max-w-md w-full p-8 transition-colors ${isDark ? 'bg-[#4a3a63] border border-violet-700' : 'bg-white'}`}>
                        <div className="text-center mb-6">
                            <h3 className={`text-2xl font-black mb-2 transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>¿Eliminar Maleta?</h3>
                            <p className={`text-sm font-bold transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>Esta acción no se puede deshacer.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { setShowModalEliminar(false); setMaletaEliminar(null); }} className={`flex-1 px-6 py-3 font-black rounded-xl transition-colors uppercase tracking-wide text-sm ${isDark ? 'bg-violet-700/50 hover:bg-violet-700 text-violet-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancelar</button>
                            <button onClick={handleEliminar} disabled={isLoading} className={`flex-1 px-6 py-3 text-white font-black rounded-xl hover:shadow-lg transition-all uppercase tracking-wide text-sm disabled:opacity-50 ${isDark ? 'bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700' : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600'}`}>{isLoading ? 'ELIMINANDO...' : 'ELIMINAR'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaletasListado;
