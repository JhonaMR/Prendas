// ============================================
// VISTA: Fichas Costo Mosaico
// Grid de fichas de costo con importación
// ============================================

import React, { useState } from 'react';
import { AppState } from '../types';
import apiFichas from '../services/apiFichas';
import PaginationComponent from '../components/PaginationComponent';
import usePagination from '../hooks/usePagination';
import { useDarkMode } from '../context/DarkModeContext';

declare global { interface Window { API_CONFIG?: { getApiUrl: () => string } } }
function getBaseUrl(): string {
    if (window.API_CONFIG?.getApiUrl) return window.API_CONFIG.getApiUrl().replace('/api', '');
    return `${window.location.protocol}//${window.location.hostname}:3000`;
}

interface Props {
    state: AppState;
    user: any;
    updateState: (u: (p: AppState) => AppState) => void;
    onNavigate: (view: string, params?: any) => void;
}

const FichasCostoMosaico: React.FC<Props> = ({ state, user, updateState, onNavigate }) => {
    const { isDark } = useDarkMode();
    const [searchTerm, setSearchTerm] = useState('');
    const [disenadoraFilter, setDisenadoraFilter] = useState('');
    const [disenadoraInput, setDisenadoraInput] = useState('');
    const [showDisenadoraSuggestions, setShowDisenadoraSuggestions] = useState(false);
    const [revisionFilter, setRevisionFilter] = useState<'rojo' | 'verde' | 'morado' | 'sin-estado' | null>(null);
    const [showRevisionFilter, setShowRevisionFilter] = useState(false);
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
    const [correriaFilter, setCorreriaFilter] = useState('');
    const [correriaInput, setCorreriaInput] = useState('');
    const [showCorreriaSuggestions, setShowCorreriaSuggestions] = useState(false);
    const [showModalImportar, setShowModalImportar] = useState(false);
    const [referenciaImportar, setReferenciaImportar] = useState('');
    const [fichaEncontrada, setFichaEncontrada] = useState<any>(null);
    const [importando, setImportando] = useState(false);
    const fichasPagination = usePagination(1, 48);

    const isAdmin = user?.role === 'admin' || user?.role === 'soporte';
    const isGeneral = user?.role === 'general';
    const canEdit = isAdmin || isGeneral || user?.role === 'operador';
    const canImportar = isAdmin || isGeneral; // operador no puede importar desde fichas de diseño
    const baseUrl = getBaseUrl();

    const disenadorasUnicas = React.useMemo(() => {
        const nombres = (state.fichasCosto || [])
            .map(f => f.disenadoraNombre)
            .filter(Boolean) as string[];
        return [...new Set(nombres)].sort();
    }, [state.fichasCosto]);

    const disenadorasSugeridas = disenadoraInput
        ? disenadorasUnicas.filter(d => d.toLowerCase().includes(disenadoraInput.toLowerCase()))
        : disenadorasUnicas;

    const correriasUnicas = React.useMemo(() => {
        return (state.correrias || []).sort((a, b) => b.year.localeCompare(a.year) || b.name.localeCompare(a.name));
    }, [state.correrias]);

    const correriassugeridas = correriaInput.length >= 2
        ? correriasUnicas.filter(c => `${c.name} ${c.year}`.toLowerCase().includes(correriaInput.toLowerCase()))
        : [];

    const fichas = (state.fichasCosto || []).filter(f => {
        const matchSearch = !searchTerm || (() => {
            const t = searchTerm.toLowerCase();
            return f.referencia.toLowerCase().includes(t) || (f.descripcion || '').toLowerCase().includes(t) || (f.marca || '').toLowerCase().includes(t);
        })();
        const matchDisenadora = !disenadoraFilter || f.disenadoraNombre === disenadoraFilter;
        const matchYear = !yearFilter || (f.createdAt && new Date(f.createdAt).getFullYear().toString() === yearFilter);
        const matchCorreria = !correriaFilter || (() => {
            const ref = (state.references || []).find(r => r.id === f.referencia);
            return ref?.correrias?.includes(correriaFilter);
        })();
        const matchRevision = !revisionFilter || (revisionFilter === 'sin-estado' ? !f.estadoRevision : f.estadoRevision === revisionFilter);
        return matchSearch && matchDisenadora && matchYear && matchCorreria && matchRevision;
    }).sort((a, b) => b.referencia.localeCompare(a.referencia, undefined, { numeric: true, sensitivity: 'base' }));

    const pageSize = fichasPagination.pagination.limit;
    const currentPage = fichasPagination.pagination.page;
    const totalPages = Math.ceil(fichas.length / pageSize) || 1;
    const pagedFichas = fichas.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Reset a página 1 cuando cambia el filtro o el tamaño de página
    React.useEffect(() => {
        fichasPagination.goToPage(1);
    }, [searchTerm, disenadoraFilter, correriaFilter, pageSize]);

    const handleBuscar = () => {
        if (!referenciaImportar.trim()) { alert('Ingrese una referencia'); return; }
        if ((state.fichasCosto || []).find(f => f.referencia === referenciaImportar)) { alert('Esta ficha ya fue importada a costos'); return; }
        const ficha = (state.fichasDiseno || []).find(f => f.referencia === referenciaImportar);
        if (!ficha) { alert('No existe ficha de diseño con esta referencia'); setFichaEncontrada(null); }
        else setFichaEncontrada(ficha);
    };

    const handleImportar = async () => {
        if (!fichaEncontrada) return;
        setImportando(true);
        try {
            const result = await apiFichas.importarFichaDiseno(referenciaImportar, user.name);
            if (result.success) {
                alert('✅ Ficha importada exitosamente');
                const [fichasCosto, fichasDiseno] = await Promise.all([apiFichas.getFichasCosto(), apiFichas.getFichasDiseno()]);
                updateState(prev => ({ ...prev, fichasCosto, fichasDiseno }));
                setShowModalImportar(false); setReferenciaImportar(''); setFichaEncontrada(null);
                onNavigate('fichas-costo-detalle', { referencia: referenciaImportar });
            } else alert('❌ Error al importar: ' + result.message);
        } catch { alert('❌ Error de conexión'); }
        finally { setImportando(false); }
    };

    const handleEliminar = async (referencia: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('¿Está seguro de que desea eliminar esta ficha?')) return;
        try {
            const response = await fetch(`${getBaseUrl()}/api/fichas-costo/${referencia}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
            });
            const data = await response.json();
            if (data.success) {
                alert('✅ Ficha eliminada exitosamente');
                const [fichasCosto, fichasDiseno] = await Promise.all([
                    apiFichas.getFichasCosto(),
                    apiFichas.getFichasDiseno()
                ]);
                updateState(prev => ({ ...prev, fichasCosto, fichasDiseno }));
            } else alert('❌ Error: ' + data.message);
        } catch { alert('❌ Error de conexión'); }
    };

    return (
        <div className={`space-y-6 pb-20 ${isDark ? 'bg-[#3d2d52]' : 'bg-white'} transition-colors duration-300`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className={`text-3xl font-black tracking-tighter ${isDark ? 'text-violet-50' : 'text-slate-800'} transition-colors duration-300`}>Fichas de Costo</h2>
                    <p className={`font-bold text-xs mt-1 ${isDark ? 'text-violet-300' : 'text-slate-500'} transition-colors duration-300`}>{fichas.length} ficha{fichas.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Limpiar filtros */}
                    <button
                        onClick={() => { setCorreriaFilter(''); setCorreriaInput(''); setDisenadoraFilter(''); setDisenadoraInput(''); setSearchTerm(''); setYearFilter(''); setRevisionFilter(null); }}
                        title="Limpiar filtros"
                        className={`p-4 rounded-2xl transition-colors border ${isDark ? 'bg-red-900/30 hover:bg-red-900/50 text-red-300 hover:text-red-200 border-red-700' : 'bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 border-red-200'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    {/* Filtro revisión */}
                    <div className="relative">
                        <button
                            onClick={() => setShowRevisionFilter(v => !v)}
                            className={`w-12 h-12 rounded-2xl border shadow-sm flex items-center justify-center hover:border-opacity-100 transition-colors ${isDark ? 'border-violet-600 bg-[#4a3a63]' : 'border-slate-200 bg-white'}`}
                            title="Filtrar por revisión"
                        >
                            {revisionFilter ? (
                                <div className="w-5 h-5 rounded-full border-2 border-white shadow"
                                    style={{ backgroundColor: revisionFilter === 'rojo' ? '#fca5a5' : revisionFilter === 'verde' ? '#86efac' : revisionFilter === 'morado' ? '#c4b5fd' : '#e2e8f0' }}
                                />
                            ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-white shadow"
                                    style={{ background: 'conic-gradient(#c4b5fd 0% 25%, #86efac 25% 50%, #e2e8f0 50% 75%, #fca5a5 75% 100%)' }}
                                />
                            )}
                        </button>
                        {showRevisionFilter && (
                            <div className={`absolute top-14 left-0 rounded-2xl shadow-2xl border p-3 flex flex-col gap-2 z-50 ${isDark ? 'bg-[#4a3a63] border-violet-600' : 'bg-white border-slate-200'}`}>
                                <button
                                    key="none"
                                    onClick={() => { setRevisionFilter(null); setShowRevisionFilter(false); }}
                                    className="w-8 h-8 rounded-full border-4 transition-transform hover:scale-110"
                                    style={{
                                        background: 'conic-gradient(#c4b5fd 0% 25%, #86efac 25% 50%, #e2e8f0 50% 75%, #fca5a5 75% 100%)',
                                        borderColor: revisionFilter === null ? '#64748b' : '#e2e8f0'
                                    }}
                                />
                                {(['sin-estado', 'rojo', 'verde', 'morado'] as const).map(color => (
                                    <button
                                        key={color}
                                        onClick={() => { setRevisionFilter(color); setShowRevisionFilter(false); }}
                                        className="w-8 h-8 rounded-full border-4 transition-transform hover:scale-110"
                                        style={{
                                            backgroundColor: color === 'rojo' ? '#fca5a5' : color === 'verde' ? '#86efac' : color === 'morado' ? '#c4b5fd' : '#e2e8f0',
                                            borderColor: revisionFilter === color ? '#64748b' : '#e2e8f0'
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Filtro año */}
                    <input
                        type="number"
                        value={yearFilter}
                        onChange={e => setYearFilter(e.target.value)}
                        placeholder="Año..."
                        min="2000"
                        max="2099"
                        className={`w-28 px-4 py-4 rounded-2xl focus:ring-4 transition-all font-bold shadow-sm ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:ring-violet-500/30' : 'bg-white border-slate-200 text-slate-900 focus:ring-blue-100'} border`}
                    />
                    {/* Filtro correría */}
                    <div className="relative min-w-[100px]">
                        <input
                            type="text"
                            value={correriaInput}
                            onChange={e => { setCorreriaInput(e.target.value); setCorreriaFilter(''); setShowCorreriaSuggestions(true); }}
                            onFocus={() => setShowCorreriaSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowCorreriaSuggestions(false), 150)}
                            placeholder="Filtrar correría..."
                            className={`w-full px-6 py-4 rounded-2xl focus:ring-4 transition-all font-bold shadow-sm border ${isDark ? correriaFilter ? 'border-blue-600 text-blue-200 bg-[#3d2d52] focus:ring-blue-500/30' : 'border-violet-600 text-violet-100 bg-[#3d2d52] focus:ring-violet-500/30' : correriaFilter ? 'border-blue-400 text-blue-700 bg-white focus:ring-blue-100' : 'border-slate-200 text-slate-900 bg-white focus:ring-blue-100'}`}
                        />
                        {correriaFilter && (
                            <button
                                onClick={() => { setCorreriaFilter(''); setCorreriaInput(''); }}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 font-black text-lg leading-none transition-colors ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-400 hover:text-blue-600'}`}
                            >×</button>
                        )}
                        {showCorreriaSuggestions && correriassugeridas.length > 0 && (
                            <div className={`absolute top-full mt-2 left-0 w-full rounded-2xl shadow-2xl border z-50 max-h-60 overflow-y-auto ${isDark ? 'bg-[#4a3a63] border-violet-600' : 'bg-white border-slate-200'}`}>
                                {correriassugeridas.map(c => (
                                    <button
                                        key={c.id}
                                        onMouseDown={() => { setCorreriaFilter(c.id); setCorreriaInput(`${c.name} ${c.year}`); setShowCorreriaSuggestions(false); }}
                                        className={`w-full text-left px-5 py-3 font-bold text-sm border-b last:border-0 transition-colors ${isDark ? 'hover:bg-violet-700/50 text-violet-200 border-violet-700' : 'hover:bg-blue-50 text-slate-700 border-slate-50'}`}
                                    ><span className={isDark ? 'text-violet-100' : 'text-slate-800'}>{c.name}</span> <span className={isDark ? 'text-violet-400' : 'text-slate-400'}>{c.year}</span></button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Filtro diseñadora */}
                    <div className="relative min-w-[100px]">
                        <input
                            type="text"
                            value={disenadoraInput}
                            onChange={e => { setDisenadoraInput(e.target.value); setDisenadoraFilter(''); setShowDisenadoraSuggestions(true); }}
                            onFocus={() => setShowDisenadoraSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowDisenadoraSuggestions(false), 150)}
                            placeholder="Filtrar diseñadora..."
                            className={`w-full px-6 py-4 rounded-2xl focus:ring-4 transition-all font-bold shadow-sm border ${isDark ? disenadoraFilter ? 'border-purple-600 text-purple-200 bg-[#3d2d52] focus:ring-purple-500/30' : 'border-violet-600 text-violet-100 bg-[#3d2d52] focus:ring-violet-500/30' : disenadoraFilter ? 'border-purple-400 text-purple-700 bg-white focus:ring-purple-100' : 'border-slate-200 text-slate-900 bg-white focus:ring-purple-100'}`}
                        />
                        {disenadoraFilter && (
                            <button
                                onClick={() => { setDisenadoraFilter(''); setDisenadoraInput(''); }}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 font-black text-lg leading-none transition-colors ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-400 hover:text-purple-600'}`}
                            >×</button>
                        )}
                        {showDisenadoraSuggestions && disenadorasSugeridas.length > 0 && (
                            <div className={`absolute top-full mt-2 left-0 w-full rounded-2xl shadow-2xl border z-50 max-h-60 overflow-y-auto ${isDark ? 'bg-[#4a3a63] border-violet-600' : 'bg-white border-slate-200'}`}>
                                {disenadorasSugeridas.map(d => (
                                    <button
                                        key={d}
                                        onMouseDown={() => { setDisenadoraFilter(d); setDisenadoraInput(d); setShowDisenadoraSuggestions(false); }}
                                        className={`w-full text-left px-5 py-3 font-bold text-sm border-b last:border-0 transition-colors ${isDark ? 'hover:bg-violet-700/50 text-violet-200 border-violet-700' : 'hover:bg-purple-50 text-slate-700 border-slate-50'}`}
                                    >{d}</button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Buscador referencia */}
                    <div className="relative flex-1 min-w-[100px]">
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar referencia, descripción..."
                            className={`w-full px-6 py-4 rounded-2xl focus:ring-4 transition-all font-bold shadow-sm border ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:ring-violet-500/30' : 'bg-white border-slate-200 text-slate-900 focus:ring-blue-100'}`} />
                    </div>
                    {canImportar && (
                        <button onClick={() => setShowModalImportar(true)} className="px-5 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 uppercase tracking-wider text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" /></svg>
                            Importar Ficha
                        </button>
                    )}
                </div>
            </div>

            {fichas.length === 0 ? (
                <div className={`p-24 rounded-[48px] border-2 border-dashed flex flex-col items-center text-center transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'}`}>
                    <p className={`font-bold text-lg ${isDark ? 'text-violet-300' : 'text-slate-400'} transition-colors duration-300`}>{searchTerm ? `No se encontraron fichas con "${searchTerm}"` : 'No hay fichas de costo'}</p>
                    {canImportar && !searchTerm && <button onClick={() => setShowModalImportar(true)} className="mt-6 px-6 py-3 bg-green-500 text-white font-black rounded-xl hover:bg-green-600 transition-colors">Importar Primera Ficha</button>}
                </div>
            ) : (
                <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {pagedFichas.map(ficha => (
                        <div key={ficha.id} className={`group rounded-2xl border hover:shadow-lg transition-all overflow-hidden text-left cursor-pointer ${isDark ? 'bg-[#4a3a63] border-violet-700 hover:border-blue-500' : 'bg-white border-slate-200 hover:border-blue-300'}`} onClick={() => onNavigate('fichas-costo-detalle', { referencia: ficha.referencia })}>
                            <div className={`aspect-square relative overflow-hidden ${isDark ? 'bg-[#3d2d52]' : 'bg-slate-100'}`}>
                                {ficha.foto1 ? (
                                    <img src={`${baseUrl}${ficha.foto1}`} alt={ficha.referencia} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className={`w-12 h-12 ${isDark ? 'text-violet-600' : 'text-slate-300'}`}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                                    </div>
                                )}
                                {(ficha.numCortes || 0) > 0 && <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-white rounded-lg text-[9px] font-black uppercase">{ficha.numCortes} Corte{ficha.numCortes !== 1 ? 's' : ''}</div>}
                                {(ficha.cortesResumen || []).length > 0 && (
                                    <div className="absolute top-9 right-2 flex flex-col gap-1">
                                        {(ficha.cortesResumen || []).map((c: any) => (
                                            <div key={c.numeroCorte} className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black shadow ${c.margenUtilidad >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {c.cantidadCortada}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {isAdmin && <div onClick={(e) => handleEliminar(ficha.referencia, e)} className={`absolute top-2 left-2 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${isDark ? 'bg-red-900/70 text-red-200 hover:bg-red-900' : 'bg-red-500 text-white hover:bg-red-600'}`}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></div>}
                                {ficha.estadoRevision && (
                                    <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-white shadow"
                                        style={{ backgroundColor: ficha.estadoRevision === 'rojo' ? '#fca5a5' : ficha.estadoRevision === 'verde' ? '#86efac' : '#c4b5fd' }}
                                    />
                                )}
                            </div>
                            <div className="p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <p className={`font-black text-sm ${isDark ? 'text-blue-300' : 'text-blue-600'} transition-colors duration-300`}>{ficha.referencia}</p>
                                    <span className={`font-bold text-[10px] truncate ml-1 max-w-[60%] text-right ${isDark ? 'text-violet-400' : 'text-slate-400'} transition-colors duration-300`}>{ficha.disenadoraNombre}</span>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className={`text-xs font-bold truncate ${isDark ? 'text-violet-200' : 'text-slate-600'} transition-colors duration-300`}>{ficha.descripcion || 'Sin descripción'}</p>
                                    <span className={`font-black text-[10px] ml-1 shrink-0 ${isDark ? 'text-blue-300' : 'text-blue-600'} transition-colors duration-300`}>R. {(ficha.rentabilidad || 0).toFixed(1)}%</span>
                                </div>
                                <div className="flex items-center text-[10px]">
                                    <div className="flex-1 flex items-center gap-1"><span className={`font-bold ${isDark ? 'text-violet-400' : 'text-slate-400'} transition-colors duration-300`}>Cant. cort:</span><span className={`font-black ${isDark ? 'text-violet-200' : 'text-slate-700'} transition-colors duration-300`}>{ficha.cantidadTotalCortada || 0}</span></div>
                                    <div className={`w-px h-4 mx-2 ${isDark ? 'bg-violet-700' : 'bg-slate-200'} transition-colors duration-300`}></div>
                                    <div className="flex items-center gap-1"><span className={`font-bold ${isDark ? 'text-violet-400' : 'text-slate-400'} transition-colors duration-300`}>Precio</span><span className={`font-black ${isDark ? 'text-green-400' : 'text-green-600'} transition-colors duration-300`}>${(ficha.precioVenta || 0).toLocaleString()}</span></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6">
                  <PaginationComponent 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    onPageChange={fichasPagination.goToPage}
                    onPageSizeChange={fichasPagination.setLimit}
                  />
                </div>
                </>
            )}

            {showModalImportar && (
                <div className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${isDark ? 'bg-slate-900/60' : 'bg-slate-900/40'}`}>
                    <div className={`rounded-3xl shadow-2xl max-w-md w-full p-8 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}>
                        <div className="text-center mb-6">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`}><path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" /></svg>
                            </div>
                            <h3 className={`text-2xl font-black mb-2 ${isDark ? 'text-violet-50' : 'text-slate-800'} transition-colors duration-300`}>Importar Ficha</h3>
                            <p className={`text-sm font-bold ${isDark ? 'text-violet-300' : 'text-slate-500'} transition-colors duration-300`}>Desde Fichas de Diseño</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${isDark ? 'text-violet-400' : 'text-slate-400'} transition-colors duration-300`}>Referencia</label>
                                <div className="flex gap-2">
                                    <input type="text" value={referenciaImportar} onChange={e => { setReferenciaImportar(e.target.value.toUpperCase()); setFichaEncontrada(null); }} placeholder="Ej: 13011" autoFocus
                                        className={`flex-1 px-4 py-3 rounded-xl font-bold focus:ring-4 border-2 transition-all ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:ring-green-500/30 focus:border-green-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-green-100 focus:border-green-500'}`} />
                                    <button onClick={handleBuscar} className={`px-6 py-3 font-black rounded-xl transition-colors ${isDark ? 'bg-[#3d2d52] text-violet-200 hover:bg-[#5a4a75]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Buscar</button>
                                </div>
                            </div>
                            {fichaEncontrada && (
                                <div className={`p-4 rounded-xl border-2 ${isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'}`}>
                                    <p className={`text-xs font-black uppercase mb-1 ${isDark ? 'text-green-400' : 'text-green-700'} transition-colors duration-300`}>Ficha Encontrada</p>
                                    <p className={`font-bold text-sm mb-2 ${isDark ? 'text-violet-100' : 'text-slate-700'} transition-colors duration-300`}>{fichaEncontrada.descripcion}</p>
                                    <p className={`text-xs font-bold ${isDark ? 'text-violet-300' : 'text-slate-500'} transition-colors duration-300`}>Diseñadora: <span className={`font-black ${isDark ? 'text-green-400' : 'text-green-600'}`}>{fichaEncontrada.disenadoraNombre}</span></p>
                                    <p className={`text-xs font-bold ${isDark ? 'text-violet-300' : 'text-slate-500'} transition-colors duration-300`}>Costo: <span className={`font-black ${isDark ? 'text-violet-100' : 'text-slate-700'}`}>${(fichaEncontrada.costoTotal || 0).toLocaleString()}</span></p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => { setShowModalImportar(false); setReferenciaImportar(''); setFichaEncontrada(null); }} className={`flex-1 px-6 py-3 font-black rounded-xl transition-colors uppercase tracking-wide text-sm ${isDark ? 'bg-[#3d2d52] text-violet-200 hover:bg-[#5a4a75]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancelar</button>
                            <button onClick={handleImportar} disabled={!fichaEncontrada || importando} className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-black rounded-xl hover:shadow-lg transition-all uppercase tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                {importando ? 'IMPORTANDO...' : 'IMPORTAR'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FichasCostoMosaico;

