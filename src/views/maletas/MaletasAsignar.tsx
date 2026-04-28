import React, { useState, useEffect } from 'react';
import { AppState } from '../../types';
import apiFichas from '../../services/apiFichas';
import { useDarkMode } from '../../context/DarkModeContext';

interface MaletasAsignarProps {
  state: AppState;
  user: any;
  updateState: (updater: (prev: AppState) => AppState) => void;
  id?: string;
  onNavigate?: (tab: string) => void;
}

const MaletasAsignar: React.FC<MaletasAsignarProps> = ({ state, user, updateState, id, onNavigate }) => {
  const { isDark } = useDarkMode();
  const [maleta, setMaleta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [referencias, setReferencias] = useState<string[]>([]);
  const [newRef, setNewRef] = useState('');

  useEffect(() => {
    const loadMaleta = async () => {
      if (!id) return;
      try {
        const data = await apiFichas.getMaleta(id);
        if (data) {
          setMaleta(data);
          setNombre(data.nombre);
          setReferencias(data.referencias?.map((r: any) => r.referencia) || []);
        }
      } catch (error) {
        console.error('Error cargando maleta:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMaleta();
  }, [id]);

  const handleAddRef = () => {
    if (newRef && !referencias.includes(newRef)) {
      setReferencias([...referencias, newRef]);
      setNewRef('');
    }
  };

  const handleRemoveRef = (ref: string) => {
    setReferencias(referencias.filter(r => r !== ref));
  };

  const handleSave = async () => {
    if (!id || !nombre) return;
    try {
      const response = await apiFichas.updateMaleta(id, nombre, maleta?.correriaId, referencias);
      if (response.success) {
        alert('Maleta guardada exitosamente');
        onNavigate?.('maletas');
      }
    } catch (error) {
      alert('Error al guardar maleta');
    }
  };

  if (loading) return <div className={`p-4 transition-colors ${isDark ? 'text-violet-300' : 'text-slate-700'}`}>Cargando...</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className={`text-3xl font-black transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>Maleta: {nombre}</h2>
        <button
          onClick={() => onNavigate?.('maletas')}
          className={`px-6 py-3 font-black rounded-xl transition-colors ${isDark ? 'bg-violet-700/50 hover:bg-violet-700 text-violet-200' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
        >
          Volver
        </button>
      </div>

      <div className={`p-6 rounded-3xl border transition-colors ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
        <label className={`text-sm font-black uppercase mb-2 block transition-colors ${isDark ? 'text-violet-400' : 'text-slate-600'}`}>Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={`w-full px-4 py-3 rounded-xl font-bold border transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-500' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
        />
      </div>

      <div className={`p-6 rounded-3xl border transition-colors ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
        <h3 className={`text-lg font-black mb-4 transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>Referencias ({referencias.length})</h3>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newRef}
            onChange={(e) => setNewRef(e.target.value)}
            placeholder="Ingrese referencia..."
            className={`flex-1 px-4 py-3 rounded-xl font-bold border transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-500' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
          />
          <button
            onClick={handleAddRef}
            disabled={!newRef}
            className={`px-6 py-3 font-black rounded-xl transition-colors ${isDark ? 'bg-violet-600 hover:bg-violet-700 text-white disabled:bg-violet-900/40 disabled:text-violet-700' : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400'}`}
          >
            Agregar
          </button>
        </div>

        <div className="space-y-2">
          {referencias.map(ref => (
            <div key={ref} className={`flex justify-between items-center p-3 rounded-lg transition-colors ${isDark ? 'bg-violet-700/30 text-violet-200' : 'bg-slate-50 text-slate-800'}`}>
              <span className="font-bold">{ref}</span>
              <button
                onClick={() => handleRemoveRef(ref)}
                className={`px-3 py-1 font-black rounded-lg transition-colors text-sm ${isDark ? 'bg-pink-600 hover:bg-pink-700 text-white' : 'bg-red-500 text-white hover:bg-red-600'}`}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className={`w-full px-6 py-4 text-white font-black rounded-2xl hover:shadow-lg transition-all uppercase tracking-wider ${isDark ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600'}`}
      >
        Guardar Maleta
      </button>
    </div>
  );
};

export default MaletasAsignar;
