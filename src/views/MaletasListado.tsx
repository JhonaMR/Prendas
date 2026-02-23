// VISTA: Maletas Listado
import React, { useState } from 'react';
import { AppState } from '../../types';
import apiFichas from '../services/apiFichas';

interface Props {
    state: AppState; user: any;
    updateState: (u: (p: AppState) => AppState) => void;
    onNavigate: (view: string, params?: any) => void;
}

const MaletasListado: React.FC<Props> = ({ state, user, updateState, onNavigate }) => {
    const [showModalCrear, setShowModalCrear] = useState(false);
    const [showModalEliminar, setShowModalEliminar] = useState(false);
    const [nombreMaleta, setNombreMaleta] = useState('');
    const [correriaId, setCorreriaId] = useState('');
    const [maletaEliminar, setMaletaEliminar] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const canEdit = user?.role === 'admin' || user?.role === 'general';

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
                    <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Maletas</h2>
                    <p className="text-slate-500 font-bold text-xs mt-1">{(state.maletas || []).length} maleta{(state.maletas || []).length !== 1 ? 's' : ''}</p>
                </div>
                {canEdit && (
                    <button onClick={() => setShowModalCrear(true)} className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 uppercase tracking-wider text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Crear Maleta
                    </button>
                )}
            </div>

            {(state.maletas || []).length === 0 ? (
                <div className="bg-white p-24 rounded-[48px] border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>
                    </div>
                    <p className="text-slate-400 font-bold text-lg">No hay maletas creadas</p>
                    {canEdit && <button onClick={() => setShowModalCrear(true)} className="mt-6 px-6 py-3 bg-purple-500 text-white font-black rounded-xl hover:bg-purple-600 transition-colors">Crear Primera Maleta</button>}
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                {['Nombre', 'Correría', '# Refs', 'Creada por', 'Acciones'].map(h => (
                                    <th key={h} className={`px-6 py-4 ${h === 'Acciones' ? 'text-right' : h === '# Refs' ? 'text-center' : 'text-left'}`}>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {(state.maletas || []).map(maleta => (
                                <tr key={maleta.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4"><p className="font-black text-slate-800">{maleta.nombre}</p></td>
                                    <td className="px-6 py-4">
                                        {maleta.correriaNombre
                                            ? <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg"><span className="font-bold text-sm">{maleta.correriaNombre}</span><span className="text-xs opacity-75">{maleta.correriaYear}</span></div>
                                            : <span className="text-slate-400 italic text-sm">Sin correría</span>}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-700 rounded-full font-black">{maleta.numReferencias}</span>
                                    </td>
                                    <td className="px-6 py-4"><span className="text-slate-600 font-bold text-sm">{maleta.createdBy}</span></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => onNavigate('maletas-asignar', { id: maleta.id })} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-bold text-sm">Ver / Editar</button>
                                            {canEdit && (
                                                <button onClick={() => { setMaletaEliminar(maleta.id); setShowModalEliminar(true); }} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-bold text-sm">Eliminar</button>
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
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-purple-600"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">Crear Nueva Maleta</h3>
                            <p className="text-sm text-slate-500 font-bold">Nombre y correría (opcional)</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nombre de Maleta</label>
                                <input type="text" value={nombreMaleta} onChange={e => setNombreMaleta(e.target.value)} placeholder="Ej: Maleta Madres 2026" autoFocus
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-purple-100 focus:border-purple-500" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Correría (Opcional)</label>
                                <select value={correriaId} onChange={e => setCorreriaId(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-purple-100 focus:border-purple-500">
                                    <option value="">Sin correría</option>
                                    {(state.correrias || []).map(c => <option key={c.id} value={c.id}>{c.name} {c.year}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => { setShowModalCrear(false); setNombreMaleta(''); setCorreriaId(''); }} className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-wide text-sm">Cancelar</button>
                            <button onClick={handleCrear} disabled={isLoading} className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black rounded-xl hover:shadow-lg transition-all uppercase tracking-wide text-sm disabled:opacity-50">{isLoading ? 'CREANDO...' : 'CREAR'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Eliminar */}
            {showModalEliminar && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-black text-slate-800 mb-2">¿Eliminar Maleta?</h3>
                            <p className="text-sm text-slate-500 font-bold">Esta acción no se puede deshacer.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { setShowModalEliminar(false); setMaletaEliminar(null); }} className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-wide text-sm">Cancelar</button>
                            <button onClick={handleEliminar} disabled={isLoading} className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-black rounded-xl hover:shadow-lg transition-all uppercase tracking-wide text-sm disabled:opacity-50">{isLoading ? 'ELIMINANDO...' : 'ELIMINAR'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaletasListado;
