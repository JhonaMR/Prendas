// VISTA: Maletas Recibir
import React, { useState, useEffect } from 'react';
import { AppState } from '../types';
import apiFichas from '../services/apiFichas';
import { useDarkMode } from '../context/DarkModeContext';

interface Props {
    state: AppState; user: any;
    updateState: (u: (p: AppState) => AppState) => void;
    onNavigate: (view: string, params?: any) => void;
}

const MaletasRecibir: React.FC<Props> = ({ state, user, updateState, onNavigate }) => {
    const { isDark } = useDarkMode();
    const canEdit = user?.role === 'admin' || user?.role === 'soporte' || user?.role === 'operador';
    const canCreate = user?.role === 'admin' || user?.role === 'soporte' || user?.role === 'general' || user?.role === 'operador';

    const [maletaSeleccionada, setMaletaSeleccionada] = useState<any>(null);
    const [referenciasEnviadas, setReferenciasEnviadas] = useState<string[]>([]);
    const [referenciasRecibidas, setReferenciasRecibidas] = useState<string[]>([]);
    const [busquedaEnviadas, setBusquedaEnviadas] = useState('');
    const [busquedaRecibidas, setBusquedaRecibidas] = useState('');
    const [recibidoPor, setRecibidoPor] = useState('');
    const [fechaRecepcion, setFechaRecepcion] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        cargarMaletas();
    }, []);

    const cargarMaletas = async () => {
        try {
            const maletas = await apiFichas.getMaletas();
            const enviadas = maletas.filter((m: any) => m.estado === 'enviada' || !m.estado);
            if (enviadas.length > 0) {
                await seleccionarMaleta(enviadas[0]);
            }
        } catch (error) {
            alert('Error al cargar maletas');
            console.error(error);
        }
    };

    const seleccionarMaleta = async (maleta: any) => {
        try {
            const maletaCompleta = await apiFichas.getMaleta(maleta.id);
            setMaletaSeleccionada(maletaCompleta);
            
            // Obtener referencias enviadas
            const refs = (maletaCompleta.referencias || []).map((r: any) => r.referencia);
            setReferenciasEnviadas(refs);
            
            // Obtener referencias ya recibidas
            const refsRecibidas = await apiFichas.getReferenciasMaletaRecibidas(maleta.id);
            setReferenciasRecibidas(refsRecibidas.map((r: any) => r.referencia));
            
            // Cargar datos de recepción si existen
            if (refsRecibidas.length > 0) {
                // Usar los datos de la primera referencia recibida
                const primerRecibida = refsRecibidas[0];
                setRecibidoPor(primerRecibida.recibido_por || '');
                setFechaRecepcion(primerRecibida.fecha_recepcion ? primerRecibida.fecha_recepcion.split('T')[0] : '');
            } else {
                setRecibidoPor('');
                setFechaRecepcion('');
            }
        } catch (error) {
            alert('Error al cargar maleta');
            console.error(error);
        }
    };

    const filtroEnviadas = referenciasEnviadas
        .filter(ref => !referenciasRecibidas.includes(ref))
        .filter(ref => ref.toLowerCase().includes(busquedaEnviadas.toLowerCase()))
        .sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.replace(/\D/g, '')) || 0;
            if (numA !== numB) return numA - numB;
            return a.localeCompare(b);
        });

    const filtroRecibidas = referenciasRecibidas
        .filter(ref => ref.toLowerCase().includes(busquedaRecibidas.toLowerCase()))
        .sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.replace(/\D/g, '')) || 0;
            if (numA !== numB) return numA - numB;
            return a.localeCompare(b);
        });

    const handleMoverARecibidas = (ref: string) => {
        setReferenciasRecibidas(prev => [...prev, ref]);
    };

    const handleMoverAEnviadas = (ref: string) => {
        setReferenciasRecibidas(prev => prev.filter(r => r !== ref));
    };

    const handleGuardar = async () => {
        if (!recibidoPor.trim() || !fechaRecepcion) {
            alert('Debe llenar fecha y nombre de recepción antes de guardar');
            return;
        }

        if (referenciasRecibidas.length === 0) {
            alert('Debe recibir al menos una referencia');
            return;
        }

        if (!maletaSeleccionada) {
            alert('Debe seleccionar una maleta');
            return;
        }

        setIsLoading(true);
        try {
            // Guardar referencias recibidas
            for (const ref of referenciasRecibidas) {
                await apiFichas.createReferenciaRecibida(maletaSeleccionada.id, ref, recibidoPor, fechaRecepcion);
            }

            // Verificar si todas las referencias fueron recibidas
            const todasRecibidas = referenciasEnviadas.length === referenciasRecibidas.length;
            
            if (todasRecibidas) {
                // Actualizar estado de maleta a recibida
                await apiFichas.updateMaleta(
                    maletaSeleccionada.id,
                    maletaSeleccionada.nombre,
                    maletaSeleccionada.correriaId,
                    referenciasEnviadas,
                    {
                        estado: 'recibida',
                        recibidoPor,
                        fechaRecepcion,
                        numReferenciasRecibidas: referenciasRecibidas.length
                    }
                );
            } else {
                // Solo actualizar cantidad recibida
                await apiFichas.updateMaleta(
                    maletaSeleccionada.id,
                    maletaSeleccionada.nombre,
                    maletaSeleccionada.correriaId,
                    referenciasEnviadas,
                    {
                        numReferenciasRecibidas: referenciasRecibidas.length
                    }
                );
            }

            alert(`✅ ${referenciasRecibidas.length} referencia(s) recibida(s)${todasRecibidas ? ' - Maleta completamente recibida' : ''}`);
            setRecibidoPor('');
            setFechaRecepcion('');
            cargarMaletas();
        } catch (error) {
            alert('❌ Error al guardar recepción');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!canCreate) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className={`font-bold text-lg transition-colors ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>
                        No tiene permisos para acceder a esta sección
                    </p>
                </div>
            </div>
        );
    }

    if (!maletaSeleccionada) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className={`font-bold text-lg transition-colors ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>
                        No hay maletas enviadas para recibir
                    </p>
                </div>
            </div>
        );
    }

    const correria = (state.correrias || []).find(c => c.id === maletaSeleccionada.correriaId);

    return (
        <div className="space-y-6 pb-20">
            {/* Header con botón guardar y campos */}
            <div className={`p-6 rounded-3xl border shadow-sm transition-colors ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
                <div className="mb-6">
                    <h2 className={`text-3xl font-black tracking-tighter transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{maletaSeleccionada.nombre}</h2>
                    <p className={`font-bold text-xs mt-1 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>
                        {correria ? `${correria.name} ${correria.year}` : 'Sin correría'} • {referenciasEnviadas.length} referencias enviadas • {referenciasRecibidas.length} recibidas
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
                    <button
                        onClick={handleGuardar}
                        disabled={isLoading || !canEdit}
                        className={`px-8 py-4 text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 uppercase tracking-wider text-sm ${isDark ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600'}`}
                    >
                        {isLoading ? 'GUARDANDO...' : 'GUARDAR RECEPCIÓN'}
                    </button>
                    <div className="flex-1 flex gap-4">
                        <div className="flex-1">
                            <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>
                                Recibido por
                            </label>
                            <input
                                type="text"
                                value={recibidoPor}
                                onChange={e => setRecibidoPor(e.target.value)}
                                placeholder="Nombre de quien recibe"
                                disabled={!canEdit}
                                className={`w-full px-4 py-3 border-2 rounded-xl font-bold focus:ring-4 transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-500 focus:ring-violet-400 focus:border-violet-500 disabled:opacity-50' : 'bg-slate-50 border-slate-200 focus:ring-purple-100 focus:border-purple-500 disabled:opacity-50'}`}
                            />
                        </div>
                        <div className="flex-1">
                            <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>
                                Fecha de recepción
                            </label>
                            <input
                                type="date"
                                value={fechaRecepcion}
                                onChange={e => setFechaRecepcion(e.target.value)}
                                disabled={!canEdit}
                                className={`w-full px-4 py-3 border-2 rounded-xl font-bold focus:ring-4 transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:ring-violet-400 focus:border-violet-500 disabled:opacity-50' : 'bg-slate-50 border-slate-200 focus:ring-purple-100 focus:border-purple-500 disabled:opacity-50'}`}
                            />
                        </div>
                    </div>
                </div>

                {!canEdit && (
                    <div className={`p-4 rounded-xl border-2 transition-colors ${isDark ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'}`}>
                        <p className={`text-sm font-bold transition-colors ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                            ⚠️ No tiene permiso para editar la recepción de la maleta. Solo puede visualizar.
                        </p>
                    </div>
                )}
            </div>

            {/* Dos cajones: Enviadas y Recibidas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Referencias Enviadas */}
                <div className={`p-6 rounded-3xl border shadow-sm transition-colors ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
                    <div className="mb-4">
                        <h3 className={`text-lg font-black mb-1 transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>Referencia Enviada</h3>
                        <p className={`text-xs font-bold transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>{filtroEnviadas.length} pendiente{filtroEnviadas.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="mb-4">
                        <input
                            type="text"
                            value={busquedaEnviadas}
                            onChange={e => setBusquedaEnviadas(e.target.value)}
                            placeholder="Buscar referencia..."
                            disabled={!canEdit}
                            className={`w-full px-4 py-3 border-2 rounded-xl font-bold focus:ring-4 transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-500 focus:ring-violet-400 focus:border-violet-500 disabled:opacity-50' : 'bg-slate-50 border-slate-200 focus:ring-purple-100 focus:border-purple-500 disabled:opacity-50'}`}
                        />
                    </div>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                        {filtroEnviadas.length === 0 ? (
                            <div className={`py-12 text-center transition-colors ${isDark ? 'text-violet-500' : 'text-slate-400'}`}>
                                <p className="font-bold">Todas las referencias han sido recibidas</p>
                            </div>
                        ) : (
                            filtroEnviadas.map(ref => (
                                <button
                                    key={ref}
                                    onClick={() => handleMoverARecibidas(ref)}
                                    disabled={!canEdit}
                                    className={`w-full p-3 rounded-xl border-2 text-left transition-all font-bold ${isDark ? 'bg-violet-700/20 border-violet-700 hover:bg-green-700/30 hover:border-green-600 text-violet-200 disabled:opacity-50' : 'bg-slate-50 border-slate-200 hover:bg-green-50 hover:border-green-300 text-slate-800 disabled:opacity-50'}`}
                                >
                                    {ref}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Referencias Recibidas */}
                <div className={`p-6 rounded-3xl border shadow-sm transition-colors ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
                    <div className="mb-4">
                        <h3 className={`text-lg font-black mb-1 transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>Referencia Recibida</h3>
                        <p className={`text-xs font-bold transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>{filtroRecibidas.length} recibida{filtroRecibidas.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="mb-4">
                        <input
                            type="text"
                            value={busquedaRecibidas}
                            onChange={e => setBusquedaRecibidas(e.target.value)}
                            placeholder="Buscar referencia..."
                            disabled={!canEdit}
                            className={`w-full px-4 py-3 border-2 rounded-xl font-bold focus:ring-4 transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-500 focus:ring-violet-400 focus:border-violet-500 disabled:opacity-50' : 'bg-slate-50 border-slate-200 focus:ring-purple-100 focus:border-purple-500 disabled:opacity-50'}`}
                        />
                    </div>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                        {filtroRecibidas.length === 0 ? (
                            <div className={`py-12 text-center transition-colors ${isDark ? 'text-violet-500' : 'text-slate-400'}`}>
                                <p className="font-bold">No hay referencias recibidas</p>
                            </div>
                        ) : (
                            filtroRecibidas.map(ref => (
                                <button
                                    key={ref}
                                    onClick={() => handleMoverAEnviadas(ref)}
                                    disabled={!canEdit}
                                    className={`w-full p-3 rounded-xl border-2 text-left transition-all font-bold ${isDark ? 'bg-green-700/30 border-green-600 hover:bg-red-700/30 hover:border-red-600 text-green-200 disabled:opacity-50' : 'bg-green-50 border-green-300 hover:bg-red-50 hover:border-red-300 text-green-800 disabled:opacity-50'}`}
                                >
                                    {ref}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaletasRecibir;
