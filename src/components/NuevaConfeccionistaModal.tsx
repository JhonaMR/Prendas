import React, { useState } from 'react';
import { useDarkMode } from '../context/DarkModeContext';

interface NuevaConfeccionistaModalProps {
  onClose: () => void;
  onSave: (conf: any) => Promise<{ success: boolean }>;
}

const NuevaConfeccionistaModal: React.FC<NuevaConfeccionistaModalProps> = ({ onClose, onSave }) => {
  const { isDark } = useDarkMode();

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [score, setScore] = useState('NA');
  const [isActive, setIsActive] = useState(true);
  const [consecRem, setConsecRem] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!id || !name) return alert('Cédula y Nombre son obligatorios');

    const newConf = {
      id,
      name,
      address,
      city,
      phone,
      score,
      active: isActive,
      ConsecRem: consecRem,
    };

    setIsLoading(true);
    try {
      const result = await onSave(newConf);
      if (result.success) {
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const labelCls = `text-[10px] font-black uppercase tracking-widest block mb-1.5 transition-colors ${isDark ? 'text-violet-300' : 'text-slate-400'}`;
  const inputCls = `w-full px-4 py-3 rounded-2xl font-bold text-sm transition-all focus:outline-none focus:ring-4 ${isDark ? 'bg-[#3d2d52] border border-violet-600 text-violet-100 placeholder-violet-600 focus:ring-violet-500/40' : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-blue-100 focus:border-blue-300'}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden transition-colors ${isDark ? 'bg-[#2d1f42]' : 'bg-white'}`}>

        {/* Header */}
        <div className={`px-8 pt-8 pb-6 border-b transition-colors ${isDark ? 'border-violet-700/50' : 'border-slate-100'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-black tracking-tight transition-colors ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>
                Nueva Confeccionista
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg transition-colors ${isDark ? 'bg-violet-800/50 text-violet-300 hover:bg-violet-700/60 hover:text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Cédula *</label>
              <input
                type="text"
                value={id}
                onChange={e => setId(e.target.value)}
                placeholder="Ej: 1234567890"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Nombre / Razón Social *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nombre completo"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Dirección</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Dirección"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Ciudad</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Ciudad"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Celular</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Número de celular"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Puntaje</label>
              <select
                value={score}
                onChange={e => setScore(e.target.value)}
                className={inputCls}
              >
                <option value="NA">NA</option>
                <option value="A">A</option>
                <option value="AA">AA</option>
                <option value="AAA">AAA</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Estado</label>
            <div className={`flex gap-2 p-1.5 rounded-2xl transition-colors ${isDark ? 'bg-[#3d2d52]' : 'bg-slate-50'}`}>
              <button
                onClick={() => setIsActive(true)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${isActive ? (isDark ? 'bg-blue-700 text-white shadow-lg' : 'bg-blue-600 text-white shadow-lg') : (isDark ? 'text-violet-400' : 'text-slate-400')}`}
              >
                ✓ Activo
              </button>
              <button
                onClick={() => setIsActive(false)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${!isActive ? (isDark ? 'bg-red-700 text-white shadow-lg' : 'bg-red-500 text-white shadow-lg') : (isDark ? 'text-violet-400' : 'text-slate-400')}`}
              >
                ✗ Inactivo
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-8 pb-8 pt-2 flex gap-3`}>
          <button
            onClick={onClose}
            className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-colors ${isDark ? 'bg-violet-900/40 text-violet-300 hover:bg-violet-900/60' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`flex-[2] py-3.5 rounded-2xl font-black text-sm text-white shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-gradient-to-r from-violet-600 to-purple-600 shadow-purple-900/50' : 'bg-gradient-to-r from-violet-600 to-purple-500 shadow-violet-200'}`}
          >
            {isLoading ? 'GUARDANDO...' : 'GUARDAR CONFECCIONISTA'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NuevaConfeccionistaModal;
