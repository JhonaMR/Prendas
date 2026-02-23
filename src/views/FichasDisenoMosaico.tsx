// ============================================
// VISTA: Fichas Diseño Mosaico
// Grid de fichas de diseño con búsqueda y creación
// ============================================

import React, { useState } from 'react';
import { AppState } from '../../types';
import { Disenadora, FichaDiseno } from '../../types/typesFichas';

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

const FichasDisenoMosaico: React.FC<Props> = ({ state, user, updateState, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [nuevaRef, setNuevaRef] = useState('');
    const [disenadoraId, setDisenadoraId] = useState('');
    const [showNewDisenadora, setShowNewDisenadora] = useState(false);
    const [newDisenadoraNombre, setNewDisenadoraNombre] = useState('');
    const [newDisenadoraCedula, setNewDisenadoraCedula] = useState('');
    const [newDisenadoraTelefono, setNewDisenadoraTelefono] = useState('');

    const isDisenadora = user?.role === 'diseñadora';
    const canCreate = isDisenadora || user?.role === 'admin' || user?.role === 'general';
    const baseUrl = getBaseUrl();

    const fichas = (state.fichasDiseno || []).filter(f => {
        if (!searchTerm) return true;
        const t = searchTerm.toLowerCase();
        return f.referencia.toLowerCase().includes(t) || (f.descripcion || '').toLowerCase().includes(t) || (f.marca || '').toLowerCase().includes(t);
    });

    const handleCrear = () => {
        if (!nuevaRef.trim()) { alert('La referencia es obligatoria'); return; }
        if (!disenadoraId) { alert('Debe seleccionar una diseñadora'); return; }
        if ((state.fichasDiseno || []).find(f => f.referencia === nuevaRef)) { alert('Ya existe una ficha con esta referencia'); return; }
        setShowModal(false);
        onNavigate('fichas-diseno-detalle', { referencia: nuevaRef, nueva: true, disenadoraId });
        setNuevaRef(''); setDisenadoraId('');
    };

    const handleCrearDisenadora = async () => {
        if (!newDisenadoraNombre.trim()) { alert('El nombre es obligatorio'); return; }
        
        try {
            const response = await fetch(`${getBaseUrl()}/api/disenadoras`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    nombre: newDisenadoraNombre,
                    cedula: newDisenadoraCedula || null,
                    telefono: newDisenadoraTelefono || null,
                    activa: true
                })
            });

            const data = await response.json();
            if (data.success && data.data) {
                updateState(prev => ({
                    ...prev,
                    disenadoras: [...(prev.disenadoras || []), data.data]
                }));
                setDisenadoraId(data.data.id);
                setShowNewDisenadora(false);
                setNewDisenadoraNombre('');
                setNewDisenadoraCedula('');
                setNewDisenadoraTelefono('');
                alert('Diseñadora creada exitosamente');
            } else {
                alert(data.message || 'Error al crear diseñadora');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al crear diseñadora');
        }
    };

    const handleEliminar = async (referencia: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('¿Está seguro de que desea eliminar esta ficha?')) return;
        try {
            const response = await fetch(`${getBaseUrl()}/api/fichas-diseno/${referencia}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
            });
            const data = await response.json();
            if (data.success) {
                alert('✅ Ficha eliminada exitosamente');
                const fichasDiseno = await fetch(`${getBaseUrl()}/api/fichas-diseno`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
                }).then(r => r.json()).then(d => d.data || []);
                updateState(prev => ({ ...prev, fichasDiseno }));
            } else alert('❌ Error: ' + data.message);
        } catch { alert('❌ Error de conexión'); }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Fichas de Diseño</h2>
                    <p className="text-slate-500 font-bold text-xs mt-1">{fichas.length} ficha{fichas.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-[250px]">
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar referencia, descripción..."
                            className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-900 shadow-sm" />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                        </div>
                    </div>
                    {canCreate && (
                        <button onClick={() => setShowModal(true)} className="px-8 py-4 bg-gradient-to-r from-pink-600 to-pink-500 text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 uppercase tracking-wider text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            Crear Ficha Nueva
                        </button>
                    )}
                </div>
            </div>

            {fichas.length === 0 ? (
                <div className="bg-white p-24 rounded-[48px] border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                    </div>
                    <p className="text-slate-400 font-bold text-lg">{searchTerm ? `No se encontraron fichas con "${searchTerm}"` : 'No hay fichas de diseño'}</p>
                    {canCreate && !searchTerm && (
                        <button onClick={() => setShowModal(true)} className="mt-6 px-6 py-3 bg-pink-500 text-white font-black rounded-xl hover:bg-pink-600 transition-colors">Crear Primera Ficha</button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {fichas.map(ficha => (
                        <div key={ficha.id} className="group bg-white rounded-2xl border border-slate-200 hover:border-pink-300 hover:shadow-lg transition-all overflow-hidden text-left cursor-pointer" onClick={() => onNavigate('fichas-diseno-detalle', { referencia: ficha.referencia })}>
                            <div className="aspect-square bg-slate-100 relative overflow-hidden">
                                {ficha.foto1 ? (
                                    <img src={`${baseUrl}${ficha.foto1}`} alt={ficha.referencia} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-slate-300"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                                    </div>
                                )}
                                {ficha.importada && <div className="absolute top-2 right-2 px-2 py-1 bg-blue-500 text-white rounded-lg text-[9px] font-black uppercase">Importada</div>}
                                {user?.role === 'admin' && !ficha.importada && <div onClick={(e) => handleEliminar(ficha.referencia, e)} className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></div>}
                            </div>
                            <div className="p-3">
                                <p className="font-black text-pink-600 text-sm mb-1">{ficha.referencia}</p>
                                <p className="text-xs font-bold text-slate-600 truncate mb-2">{ficha.descripcion || 'Sin descripción'}</p>
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-slate-400 font-bold">{ficha.disenadoraNombre}</span>
                                    <span className="font-black text-slate-700">${(ficha.costoTotal || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-pink-600"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">Crear Ficha Nueva</h3>
                            <p className="text-sm text-slate-500 font-bold">Ingrese la referencia y diseñadora</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Referencia</label>
                                <input type="text" value={nuevaRef} onChange={e => setNuevaRef(e.target.value.toUpperCase())} placeholder="Ej: 13011" autoFocus
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-pink-100 focus:border-pink-500" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diseñadora</label>
                                    <button onClick={() => setShowNewDisenadora(true)} className="text-[10px] font-black text-pink-600 hover:text-pink-700 uppercase tracking-widest">+ Nueva</button>
                                </div>
                                <select value={disenadoraId} onChange={e => setDisenadoraId(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-pink-100 focus:border-pink-500">
                                    <option value="">Seleccionar...</option>
                                    {(state.disenadoras || []).filter(d => d.activa).map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => { setShowModal(false); setNuevaRef(''); setDisenadoraId(''); }} className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-wide text-sm">Cancelar</button>
                            <button onClick={handleCrear} className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-500 text-white font-black rounded-xl hover:shadow-lg transition-all uppercase tracking-wide text-sm">Crear</button>
                        </div>
                    </div>
                </div>
            )}

            {showNewDisenadora && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-blue-600"><path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A6.375 6.375 0 013 19.235z" /></svg>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">Nueva Diseñadora</h3>
                            <p className="text-sm text-slate-500 font-bold">Ingrese los datos de la diseñadora</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nombre *</label>
                                <input type="text" value={newDisenadoraNombre} onChange={e => setNewDisenadoraNombre(e.target.value)} placeholder="Ej: María García" autoFocus
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Cédula</label>
                                <input type="text" value={newDisenadoraCedula} onChange={e => setNewDisenadoraCedula(e.target.value)} placeholder="Ej: 1234567890"
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Teléfono</label>
                                <input type="text" value={newDisenadoraTelefono} onChange={e => setNewDisenadoraTelefono(e.target.value)} placeholder="Ej: 3001234567"
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => { setShowNewDisenadora(false); setNewDisenadoraNombre(''); setNewDisenadoraCedula(''); setNewDisenadoraTelefono(''); }} className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-wide text-sm">Cancelar</button>
                            <button onClick={handleCrearDisenadora} className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black rounded-xl hover:shadow-lg transition-all uppercase tracking-wide text-sm">Crear</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FichasDisenoMosaico;
