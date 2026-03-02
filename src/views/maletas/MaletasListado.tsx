import React, { useState } from 'react';
import { AppState } from '../../types';
import { UserRole } from '../../types/typesFichas';

interface MaletasListadoProps {
  state: AppState;
  user: any;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onNavigate?: (tab: string) => void;
}

const MaletasListado: React.FC<MaletasListadoProps> = ({ state, user, updateState, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.role === 'admin';
  const isGeneral = user?.role === 'general';
  const canCreate = isAdmin || isGeneral;

  const maletasFiltradas = (state.maletas || []).filter(maleta => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return maleta.nombre.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Maletas</h2>
          <p className="text-slate-500 font-bold text-xs mt-1">
            {maletasFiltradas.length} maleta{maletasFiltradas.length !== 1 ? 's' : ''} total{maletasFiltradas.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[250px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar maleta..."
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-900 shadow-sm"
            />
          </div>

          {canCreate && (
            <button
              onClick={() => onNavigate?.('maletas-nueva')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 uppercase tracking-wider text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nueva Maleta
            </button>
          )}
        </div>
      </div>

      {maletasFiltradas.length === 0 ? (
        <div className="bg-white p-24 rounded-[48px] border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
          <p className="text-slate-400 font-bold text-lg">No hay maletas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {maletasFiltradas.map(maleta => (
            <button
              key={maleta.id}
              onClick={() => onNavigate?.('maletas-asignar')}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all text-left"
            >
              <p className="font-black text-purple-600 text-lg mb-2">{maleta.nombre}</p>
              <p className="text-sm text-slate-600 mb-4">{maleta.correriaNombre || 'Sin correría'}</p>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-xs text-slate-400 font-bold">Referencias</p>
                  <p className="font-black text-slate-800">{maleta.numReferencias}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-bold">Creada</p>
                  <p className="font-black text-slate-800">{new Date(maleta.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaletasListado;
