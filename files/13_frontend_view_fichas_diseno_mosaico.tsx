// ============================================
// VISTA: Fichas Diseño Mosaico
// Grid de fichas de diseño con búsqueda y creación
// ============================================

import React, { useState } from 'react';
import { AppState, FichaDiseno, Disenadora, UserRole } from '../types/typesFichas';
import { useNavigate } from 'react-router-dom';

interface FichasDisenoMosaicoProps {
  state: AppState;
  user: any;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const FichasDisenoMosaico: React.FC<FichasDisenoMosaicoProps> = ({ state, user, updateState }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModalCrear, setShowModalCrear] = useState(false);
  const [nuevaReferencia, setNuevaReferencia] = useState('');
  const [disenadoraSeleccionada, setDisenadoraSeleccionada] = useState('');

  const isDisenadora = user?.role === UserRole.disenadora || user?.role === 'disenadora';

  // Filtrar fichas
  const fichasFiltradas = state.fichasDiseno.filter(ficha => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      ficha.referencia.toLowerCase().includes(term) ||
      ficha.descripcion.toLowerCase().includes(term) ||
      ficha.marca.toLowerCase().includes(term)
    );
  });

  const handleCrearFicha = () => {
    if (!nuevaReferencia.trim()) {
      alert('La referencia es obligatoria');
      return;
    }

    if (!disenadoraSeleccionada) {
      alert('Debe seleccionar una diseñadora');
      return;
    }

    // Verificar que no exista
    const existe = state.fichasDiseno.find(f => f.referencia === nuevaReferencia);
    if (existe) {
      alert('Ya existe una ficha con esta referencia');
      return;
    }

    // Navegar a detalle con datos iniciales
    navigate(`/fichas-diseno/${nuevaReferencia}`, {
      state: { 
        nueva: true,
        disenadoraId: disenadoraSeleccionada 
      }
    });
  };

  const baseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : `http://${window.location.hostname}:3001`;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Fichas de Diseño</h2>
          <p className="text-slate-500 font-bold text-xs mt-1">
            {fichasFiltradas.length} ficha{fichasFiltradas.length !== 1 ? 's' : ''} total{fichasFiltradas.length !== 1 ? 'es' : ''}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Buscador */}
          <div className="relative flex-1 min-w-[250px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar referencia, descripción..."
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-900 shadow-sm"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
          </div>

          {/* Botón Crear */}
          {isDisenadora && (
            <button
              onClick={() => setShowModalCrear(true)}
              className="px-8 py-4 bg-gradient-to-r from-pink-600 to-pink-500 text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 uppercase tracking-wider text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Crear Ficha Nueva
            </button>
          )}
        </div>
      </div>

      {/* Grid de Fichas */}
      {fichasFiltradas.length === 0 ? (
        <div className="bg-white p-24 rounded-[48px] border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-slate-400 font-bold text-lg">
            {searchTerm ? `No se encontraron fichas con "${searchTerm}"` : 'No hay fichas de diseño'}
          </p>
          {isDisenadora && !searchTerm && (
            <button
              onClick={() => setShowModalCrear(true)}
              className="mt-6 px-6 py-3 bg-pink-500 text-white font-black rounded-xl hover:bg-pink-600 transition-colors"
            >
              Crear Primera Ficha
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {fichasFiltradas.map(ficha => (
            <button
              key={ficha.id}
              onClick={() => navigate(`/fichas-diseno/${ficha.referencia}`)}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-pink-300 hover:shadow-lg transition-all overflow-hidden"
            >
              {/* Foto */}
              <div className="aspect-square bg-slate-100 relative overflow-hidden">
                {ficha.foto1 ? (
                  <img
                    src={`${baseUrl}${ficha.foto1}`}
                    alt={ficha.referencia}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-slate-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                  </div>
                )}
                
                {/* Badge si importada */}
                {ficha.importada && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-blue-500 text-white rounded-lg text-[9px] font-black uppercase">
                    Importada
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="font-black text-pink-600 text-sm mb-1">{ficha.referencia}</p>
                <p className="text-xs font-bold text-slate-600 truncate mb-2">{ficha.descripcion || 'Sin descripción'}</p>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-bold">{ficha.disenadoraNombre}</span>
                  <span className="font-black text-slate-700">${ficha.costoTotal.toLocaleString()}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal Crear Ficha */}
      {showModalCrear && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-pink-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Crear Ficha Nueva</h3>
              <p className="text-sm text-slate-500 font-bold">Ingrese la referencia y diseñadora</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Referencia
                </label>
                <input
                  type="text"
                  value={nuevaReferencia}
                  onChange={(e) => setNuevaReferencia(e.target.value.toUpperCase())}
                  placeholder="Ej: 13011"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-pink-100 focus:border-pink-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Diseñadora
                </label>
                <select
                  value={disenadoraSeleccionada}
                  onChange={(e) => setDisenadoraSeleccionada(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-pink-100 focus:border-pink-500"
                >
                  <option value="">Seleccionar...</option>
                  {state.disenadoras.filter(d => d.activa).map(d => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowModalCrear(false);
                  setNuevaReferencia('');
                  setDisenadoraSeleccionada('');
                }}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-wide text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearFicha}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-500 text-white font-black rounded-xl hover:shadow-lg transition-all uppercase tracking-wide text-sm"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FichasDisenoMosaico;
