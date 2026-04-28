import React, { useState } from 'react';
import { AppState } from '../../types';
import { UserRole } from '../../types/typesFichas';
import { useDarkMode } from '../../context/DarkModeContext';

interface MaletasListadoProps {
  state: AppState;
  user: any;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onNavigate?: (tab: string) => void;
}

const MaletasListado: React.FC<MaletasListadoProps> = ({ state, user, updateState, onNavigate }) => {
  const { isDark } = useDarkMode();
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
          <h2 className={`text-3xl font-black tracking-tighter transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>Maletas</h2>
          <p className={`font-bold text-xs mt-1 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>
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
              className={`w-full px-6 py-4 rounded-2xl focus:ring-4 transition-all font-bold shadow-sm border transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-500 focus:ring-violet-400' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-blue-100'}`}
            />
          </div>

          {canCreate && (
            <button
              onClick={() => onNavigate?.('maletas-nueva')}
              className={`px-8 py-4 text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 uppercase tracking-wider text-sm ${isDark ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600'}`}
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
        <div className={`p-24 rounded-[48px] border-2 border-dashed flex flex-col items-center text-center transition-colors ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'}`}>
          <p className={`font-bold text-lg transition-colors ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>No hay maletas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {maletasFiltradas.map(maleta => (
            <button
              key={maleta.id}
              onClick={() => onNavigate?.('maletas-asignar')}
              className={`p-6 rounded-2xl border transition-all text-left ${isDark ? 'bg-[#4a3a63] border-violet-700 hover:border-pink-600 hover:shadow-lg text-violet-200' : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-lg text-slate-800'}`}
            >
              <p className={`font-black text-lg mb-2 transition-colors ${isDark ? 'text-pink-400' : 'text-purple-600'}`}>{maleta.nombre}</p>
              <p className={`text-sm mb-4 transition-colors ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>{maleta.correriaNombre || 'Sin correría'}</p>
              <div className={`flex items-center justify-between text-sm transition-colors ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>
                <div>
                  <p className={`text-xs font-bold transition-colors ${isDark ? 'text-violet-500' : 'text-slate-400'}`}>Referencias</p>
                  <p className={`font-black transition-colors ${isDark ? 'text-violet-100' : 'text-slate-800'}`}>{maleta.numReferencias}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-bold transition-colors ${isDark ? 'text-violet-500' : 'text-slate-400'}`}>Creada</p>
                  <p className={`font-black transition-colors ${isDark ? 'text-violet-100' : 'text-slate-800'}`}>{new Date(maleta.createdAt).toLocaleDateString()}</p>
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
