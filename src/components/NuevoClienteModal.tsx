import React, { useState } from 'react';
import { useDarkMode } from '../context/DarkModeContext';

interface NuevoClienteModalProps {
  sellers: { id: string; name: string }[];
  onClose: () => void;
  onSave: (client: any) => Promise<{ success: boolean }>;
}

const NuevoClienteModal: React.FC<NuevoClienteModalProps> = ({ sellers, onClose, onSave }) => {
  const { isDark } = useDarkMode();

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [nit, setNit] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [sellerSearch, setSellerSearch] = useState('');
  const [showSellerDropdown, setShowSellerDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredSellers = sellers.filter(s =>
    s.name.toLowerCase().includes(sellerSearch.toLowerCase())
  );

  const labelCls = `text-[10px] font-black uppercase tracking-widest block mb-1.5 transition-colors ${isDark ? 'text-violet-300' : 'text-slate-400'}`;
  const inputCls = `w-full px-4 py-3 rounded-2xl font-bold text-sm transition-all focus:outline-none focus:ring-4 ${isDark ? 'bg-[#3d2d52] border border-violet-600 text-violet-100 placeholder-violet-600 focus:ring-violet-500/40' : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-300 focus:ring-blue-100 focus:border-blue-300'}`;

  const handleSave = async () => {
    if (!id || !name) return alert('ID y Nombre son obligatorios');
    if (!sellerId) return alert('Debe seleccionar un vendedor');

    setIsLoading(true);
    try {
      const result = await onSave({ id, name, nit, address, city, sellerId });
      if (result.success) {
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className={`relative w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden transition-colors ${isDark ? 'bg-[#2d1f42]' : 'bg-white'}`}>

        {/* Header */}
        <div className={`px-8 pt-8 pb-6 border-b transition-colors ${isDark ? 'border-violet-700/50' : 'border-slate-100'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-black tracking-tight transition-colors ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>
                Nuevo Cliente
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
        <div className="px-8 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>ID Cliente *</label>
              <input
                type="text"
                value={id}
                onChange={e => setId(e.target.value)}
                placeholder="Ej: C001"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>NIT</label>
              <input
                type="text"
                value={nit}
                onChange={e => setNit(e.target.value)}
                placeholder="NIT o cédula"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Nombre del Cliente *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nombre completo o razón social"
              className={inputCls}
            />
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

          {/* Vendedor con autocomplete */}
          <div className="relative">
            <label className={labelCls}>Vendedor *</label>
            <input
              type="text"
              value={sellerSearch}
              onChange={e => { setSellerSearch(e.target.value); setShowSellerDropdown(true); if (!e.target.value) setSellerId(''); }}
              onFocus={() => setShowSellerDropdown(true)}
              placeholder="Buscar vendedor..."
              className={inputCls}
            />
            {sellerId && (
              <button
                onClick={() => { setSellerSearch(''); setSellerId(''); }}
                className={`absolute right-3 top-[38px] font-black text-xl transition-colors ${isDark ? 'text-violet-400 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}
              >
                ×
              </button>
            )}
            {showSellerDropdown && sellerSearch.length > 0 && (
              <div className={`absolute top-full left-0 w-full mt-1 rounded-2xl shadow-xl border z-50 max-h-48 overflow-y-auto transition-colors ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'}`}>
                {filteredSellers.length === 0 ? (
                  <p className={`px-5 py-3 text-xs font-bold italic ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Sin resultados</p>
                ) : filteredSellers.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setSellerId(s.id); setSellerSearch(s.name); setShowSellerDropdown(false); }}
                    className={`w-full text-left px-5 py-3 text-sm font-bold border-b last:border-0 transition-colors ${isDark ? 'hover:bg-violet-700/40 border-violet-700/50 text-violet-200' : 'hover:bg-blue-50 border-slate-100 text-slate-800'}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-2 flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-colors ${isDark ? 'bg-violet-900/40 text-violet-300 hover:bg-violet-900/60' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`flex-[2] py-3.5 rounded-2xl font-black text-sm text-white shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-gradient-to-r from-blue-600 to-violet-600 shadow-violet-900/50' : 'bg-gradient-to-r from-blue-600 to-violet-500 shadow-blue-200'}`}
          >
            {isLoading ? 'GUARDANDO...' : 'GUARDAR CLIENTE'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NuevoClienteModal;
