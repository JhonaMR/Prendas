// ============================================
// VISTA: Histórico de Fichas de Estampación
// Listado con búsqueda y acceso a crear/editar
// ============================================

import React, { useState } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import { FichaEstampacionRecord } from './types';

interface Props {
    user: any;
    onNavigate: (tab: string, params?: any) => void;
    fichas: FichaEstampacionRecord[];
    onEliminar: (id: string) => void;
    cargando?: boolean;
}

const HistoricoFichasEstampacion: React.FC<Props> = ({ user, onNavigate, fichas, onEliminar, cargando = false }) => {
    const { isDark } = useDarkMode();
    const [busqueda, setBusqueda] = useState('');
    const [confirmEliminar, setConfirmEliminar] = useState<string | null>(null);

    const filtradas = fichas.filter(f =>
        f.referencia.toLowerCase().includes(busqueda.toLowerCase())
    );

    const isAdmin = user?.role === 'admin' || user?.role === 'soporte';

    return (
        <div className={`space-y-6 pb-20 transition-colors ${isDark ? 'bg-[#3d2d52]' : 'bg-white'}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => onNavigate('home')}
                        className={`p-3 rounded-xl transition-colors ${isDark ? 'bg-violet-700/50 hover:bg-violet-700 text-violet-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </button>
                    <div>
                        <h2 className={`text-3xl font-black tracking-tighter ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>
                            Fichas de Estampación
                        </h2>
                        <p className={`text-xs font-bold mt-1 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>
                            {fichas.length} ficha{fichas.length !== 1 ? 's' : ''} registrada{fichas.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => onNavigate('ficha-estampacion-editor', { nueva: true })}
                    className={`flex items-center gap-2 px-5 py-2.5 text-white font-black rounded-xl uppercase text-xs tracking-wider transition-all hover:shadow-lg ${isDark ? 'bg-gradient-to-r from-pink-700 to-pink-600 hover:from-pink-800 hover:to-pink-700' : 'bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Crear Nueva Ficha
                </button>
            </div>

            {/* Buscador */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-colors ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-slate-50 border-slate-200'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 shrink-0 ${isDark ? 'text-violet-500' : 'text-slate-400'}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                    type="text"
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    onFocus={e => e.target.select()}
                    placeholder="Buscar por referencia..."
                    className={`flex-1 bg-transparent font-bold text-sm outline-none ${isDark ? 'text-violet-100 placeholder-violet-600' : 'text-slate-700 placeholder-slate-400'}`}
                />
                {busqueda && (
                    <button onClick={() => setBusqueda('')} className={`${isDark ? 'text-violet-500 hover:text-violet-300' : 'text-slate-400 hover:text-slate-600'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Tabla */}
            <div className={`rounded-3xl border overflow-hidden shadow-sm ${isDark ? 'border-violet-700' : 'border-slate-200'}`}>
                <table className="w-full">
                    <thead>
                        <tr className={`border-b ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-slate-50 border-slate-200'}`}>
                            {['Referencia', 'Cantidad Cortada', 'Responsable (Taller/Estampa)', 'Fecha Creación', 'Realizado Por', 'Acciones'].map(h => (
                                <th key={h} className={`px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-violet-800' : 'divide-slate-100'}`}>
                        {cargando ? (
                            <tr>
                                <td colSpan={6} className={`px-6 py-16 text-center font-bold text-sm ${isDark ? 'text-violet-500' : 'text-slate-400'}`}>
                                    Cargando fichas de estampación...
                                </td>
                            </tr>
                        ) : filtradas.length === 0 ? (
                            <tr>
                                <td colSpan={6} className={`px-6 py-16 text-center font-bold text-sm ${isDark ? 'text-violet-500' : 'text-slate-400'}`}>
                                    {busqueda ? 'No se encontraron fichas para esa referencia' : 'No hay fichas creadas aún'}
                                </td>
                            </tr>
                        ) : filtradas.map(f => (
                            <tr key={f.id} className={`transition-colors ${isDark ? 'hover:bg-violet-900/20' : 'hover:bg-slate-50'}`}>
                                <td className={`px-6 py-4 font-black text-sm ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{f.referencia}</td>
                                <td className={`px-6 py-4 font-bold text-sm ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>{f.cantidadCortada}</td>
                                <td className={`px-6 py-4 font-bold text-sm ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>{f.responsable}</td>
                                <td className={`px-6 py-4 font-bold text-sm ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>{f.fechaCreacion}</td>
                                <td className={`px-6 py-4 font-bold text-sm ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>{f.realizadoPor}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onNavigate('ficha-estampacion-editor', { fichaId: f.id })}
                                            className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider transition-colors ${isDark ? 'bg-violet-700/50 hover:bg-violet-700 text-violet-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                                        >
                                            Editar
                                        </button>
                                        {isAdmin && (
                                            <button
                                                onClick={() => setConfirmEliminar(f.id)}
                                                className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider transition-colors ${isDark ? 'bg-red-900/40 hover:bg-red-900/60 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}
                                            >
                                                Eliminar
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal confirmar eliminar */}
            {confirmEliminar && (
                <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 bg-slate-900/60">
                    <div className={`p-8 rounded-3xl shadow-2xl max-w-sm w-full ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}>
                        <p className={`font-black text-lg mb-2 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>¿Eliminar ficha?</p>
                        <p className={`font-bold text-sm mb-6 ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>Esta acción no se puede deshacer.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmEliminar(null)} className={`flex-1 py-2 rounded-xl font-black text-sm uppercase ${isDark ? 'bg-violet-900/40 text-violet-300' : 'bg-slate-100 text-slate-600'}`}>Cancelar</button>
                            <button onClick={() => { onEliminar(confirmEliminar); setConfirmEliminar(null); }} className="flex-1 py-2 rounded-xl font-black text-sm uppercase bg-red-500 hover:bg-red-600 text-white">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoricoFichasEstampacion;
