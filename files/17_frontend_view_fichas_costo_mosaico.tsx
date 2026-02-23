// ============================================
// VISTA: Fichas Costo Mosaico
// Grid de fichas de costo con importación
// ============================================

import React, { useState } from 'react';
import { AppState, UserRole } from '../types/typesFichas';
import { useNavigate } from 'react-router-dom';
import apiFichas from '../services/apiFichas';

interface FichasCostoMosaicoProps {
  state: AppState;
  user: any;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const FichasCostoMosaico: React.FC<FichasCostoMosaicoProps> = ({ state, user, updateState }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModalImportar, setShowModalImportar] = useState(false);
  const [referenciaImportar, setReferenciaImportar] = useState('');
  const [fichaEncontrada, setFichaEncontrada] = useState<any>(null);
  const [buscando, setBuscando] = useState(false);
  const [importando, setImportando] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isGeneral = user?.role === 'general';
  const canEdit = isAdmin || isGeneral;

  // Filtrar fichas
  const fichasFiltradas = state.fichasCosto.filter(ficha => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      ficha.referencia.toLowerCase().includes(term) ||
      ficha.descripcion.toLowerCase().includes(term) ||
      ficha.marca.toLowerCase().includes(term)
    );
  });

  const handleBuscarFicha = async () => {
    if (!referenciaImportar.trim()) {
      alert('Ingrese una referencia');
      return;
    }

    // Verificar que no exista ya en costos
    const existeEnCosto = state.fichasCosto.find(f => f.referencia === referenciaImportar);
    if (existeEnCosto) {
      alert('Esta ficha ya fue importada a costos');
      return;
    }

    setBuscando(true);
    try {
      // Buscar en fichas diseño
      const ficha = state.fichasDiseno.find(f => f.referencia === referenciaImportar);
      
      if (!ficha) {
        alert('No existe ficha de diseño con esta referencia');
        setFichaEncontrada(null);
      } else {
        setFichaEncontrada(ficha);
      }
    } catch (error) {
      console.error('Error buscando ficha:', error);
      alert('Error al buscar ficha');
    } finally {
      setBuscando(false);
    }
  };

  const handleImportar = async () => {
    if (!fichaEncontrada) return;

    setImportando(true);
    try {
      const result = await apiFichas.importarFichaDiseno(referenciaImportar, user.name);
      
      if (result.success) {
        alert('✅ Ficha importada exitosamente');
        
        // Recargar datos
        const [fichasCosto, fichasDiseno] = await Promise.all([
          apiFichas.getFichasCosto(),
          apiFichas.getFichasDiseno()
        ]);
        
        updateState(prev => ({
          ...prev,
          fichasCosto,
          fichasDiseno
        }));
        
        setShowModalImportar(false);
        setReferenciaImportar('');
        setFichaEncontrada(null);
        
        // Navegar a la ficha importada
        navigate(`/fichas-costo/${referenciaImportar}`);
      } else {
        alert('❌ Error al importar: ' + result.message);
      }
    } catch (error) {
      console.error('Error importando:', error);
      alert('❌ Error de conexión');
    } finally {
      setImportando(false);
    }
  };

  const baseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : `http://${window.location.hostname}:3001`;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Fichas de Costo</h2>
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

          {/* Botones */}
          {canEdit && (
            <>
              <button
                onClick={() => setShowModalImportar(true)}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 uppercase tracking-wider text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" />
                </svg>
                Importar Ficha
              </button>

              {isAdmin && (
                <button
                  onClick={() => navigate('/fichas-costo/nueva')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 uppercase tracking-wider text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Crear Nueva
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Grid de Fichas */}
      {fichasFiltradas.length === 0 ? (
        <div className="bg-white p-24 rounded-[48px] border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          </div>
          <p className="text-slate-400 font-bold text-lg">
            {searchTerm ? `No se encontraron fichas con "${searchTerm}"` : 'No hay fichas de costo'}
          </p>
          {canEdit && !searchTerm && (
            <button
              onClick={() => setShowModalImportar(true)}
              className="mt-6 px-6 py-3 bg-green-500 text-white font-black rounded-xl hover:bg-green-600 transition-colors"
            >
              Importar Primera Ficha
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {fichasFiltradas.map(ficha => (
            <button
              key={ficha.id}
              onClick={() => navigate(`/fichas-costo/${ficha.referencia}`)}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all overflow-hidden"
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
                
                {/* Badge cortes */}
                {(ficha.numCortes || 0) > 0 && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-white rounded-lg text-[9px] font-black uppercase">
                    {ficha.numCortes} Corte{ficha.numCortes !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="font-black text-blue-600 text-sm mb-1">{ficha.referencia}</p>
                <p className="text-xs font-bold text-slate-600 truncate mb-2">{ficha.descripcion || 'Sin descripción'}</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-bold">Costo</span>
                    <span className="font-black text-slate-700">${ficha.costoTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-bold">Precio</span>
                    <span className="font-black text-green-600">${ficha.precioVenta.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-bold">Rent.</span>
                    <span className="font-black text-blue-600">{ficha.rentabilidad.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal Importar */}
      {showModalImportar && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Importar Ficha</h3>
              <p className="text-sm text-slate-500 font-bold">Desde Fichas de Diseño</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Referencia
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referenciaImportar}
                    onChange={(e) => {
                      setReferenciaImportar(e.target.value.toUpperCase());
                      setFichaEncontrada(null);
                    }}
                    placeholder="Ej: 13011"
                    className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-green-100 focus:border-green-500"
                    autoFocus
                  />
                  <button
                    onClick={handleBuscarFicha}
                    disabled={buscando}
                    className="px-6 py-3 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    {buscando ? '...' : 'Buscar'}
                  </button>
                </div>
              </div>

              {fichaEncontrada && (
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                  <p className="text-xs font-black text-green-700 uppercase mb-1">Ficha Encontrada</p>
                  <p className="font-bold text-slate-700 text-sm mb-2">{fichaEncontrada.descripcion}</p>
                  <p className="text-xs text-slate-500 font-bold">
                    Creada por: <span className="text-green-600 font-black">{fichaEncontrada.disenadoraNombre}</span>
                  </p>
                  <p className="text-xs text-slate-500 font-bold">
                    Costo: <span className="text-slate-700 font-black">${fichaEncontrada.costoTotal.toLocaleString()}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowModalImportar(false);
                  setReferenciaImportar('');
                  setFichaEncontrada(null);
                }}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-wide text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleImportar}
                disabled={!fichaEncontrada || importando}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-black rounded-xl hover:shadow-lg transition-all uppercase tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
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
