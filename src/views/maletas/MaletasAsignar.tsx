import React, { useState, useEffect } from 'react';
import { AppState } from '../../types';
import apiFichas from '../../services/apiFichas';

interface MaletasAsignarProps {
  state: AppState;
  user: any;
  updateState: (updater: (prev: AppState) => AppState) => void;
  id?: string;
  onNavigate?: (tab: string) => void;
}

const MaletasAsignar: React.FC<MaletasAsignarProps> = ({ state, user, updateState, id, onNavigate }) => {
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

  if (loading) return <div className="p-4">Cargando...</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-800">Maleta: {nombre}</h2>
        <button
          onClick={() => onNavigate?.('maletas')}
          className="px-6 py-3 bg-slate-200 text-slate-700 font-black rounded-xl hover:bg-slate-300 transition-colors"
        >
          Volver
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100">
        <label className="text-sm font-black text-slate-600 uppercase mb-2 block">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
        />
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100">
        <h3 className="text-lg font-black text-slate-800 mb-4">Referencias ({referencias.length})</h3>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newRef}
            onChange={(e) => setNewRef(e.target.value)}
            placeholder="Ingrese referencia..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
          />
          <button
            onClick={handleAddRef}
            disabled={!newRef}
            className="px-6 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            Agregar
          </button>
        </div>

        <div className="space-y-2">
          {referencias.map(ref => (
            <div key={ref} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
              <span className="font-bold text-slate-800">{ref}</span>
              <button
                onClick={() => handleRemoveRef(ref)}
                className="px-3 py-1 bg-red-500 text-white font-black rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black rounded-2xl hover:shadow-lg transition-all uppercase tracking-wider"
      >
        Guardar Maleta
      </button>
    </div>
  );
};

export default MaletasAsignar;
