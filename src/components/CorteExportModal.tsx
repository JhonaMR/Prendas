import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../context/DarkModeContext';

export interface ExportConfig {
  format: 'pdf' | 'excel';
  fechaDesde: string;
  fechaHasta: string;
  incluirDescripcion: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onExport: (config: ExportConfig) => void;
}

const CorteExportModal: React.FC<Props> = ({ isOpen, onClose, onExport }) => {
  const { isDark } = useDarkMode();
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [incluirDescripcion, setIncluirDescripcion] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fechaDesde || !fechaHasta) {
      setError('Por favor, selecciona ambas fechas del rango.');
      return;
    }

    if (fechaDesde > fechaHasta) {
      setError('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }

    onExport({
      format,
      fechaDesde,
      fechaHasta,
      incluirDescripcion,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-3xl shadow-2xl max-w-md w-full flex flex-col transition-colors duration-300 ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}>
        {/* Header */}
        <div className={`px-8 py-5 flex justify-between items-center rounded-t-3xl transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-pink-700 to-purple-700' : 'bg-gradient-to-r from-pink-600 to-purple-600'}`}>
          <div>
            <h2 className={`text-xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-white'}`}>EXPORTAR REPORTES</h2>
            <p className={`text-xs mt-0.5 transition-colors duration-300 ${isDark ? 'text-pink-200' : 'text-pink-100'}`}>Registro de Corte</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-white hover:bg-white/20 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {error && (
            <div className={`p-3 rounded-lg text-sm border font-medium transition-colors duration-300 ${isDark ? 'bg-red-950/40 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
              ⚠️ {error}
            </div>
          )}

          {/* Format Selector */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-700'}`}>
              FORMATO DE EXPORTACIÓN
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`py-2.5 px-4 rounded-xl text-sm font-bold uppercase border-2 transition-all duration-300 flex items-center justify-center gap-2 ${
                  format === 'pdf'
                    ? isDark
                      ? 'bg-pink-700 border-pink-500 text-white shadow-lg'
                      : 'bg-pink-500 border-pink-400 text-white shadow-md'
                    : isDark
                      ? 'bg-[#3d2d52]/50 border-violet-700 text-violet-300 hover:bg-[#3d2d52]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                PDF
              </button>
              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={`py-2.5 px-4 rounded-xl text-sm font-bold uppercase border-2 transition-all duration-300 flex items-center justify-center gap-2 ${
                  format === 'excel'
                    ? isDark
                      ? 'bg-purple-700 border-purple-500 text-white shadow-lg'
                      : 'bg-purple-600 border-purple-500 text-white shadow-md'
                    : isDark
                      ? 'bg-[#3d2d52]/50 border-violet-700 text-violet-300 hover:bg-[#3d2d52]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                EXCEL
              </button>
            </div>
          </div>

          {/* Date Range Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-700'}`}>
                FECHA DESDE *
              </label>
              <input
                type="date"
                required
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                placeholder="dd/mm/aaaa"
                className={`w-full px-3 py-2 border-2 rounded-xl text-sm transition focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-[#3d2d52] border-violet-700 text-violet-200 focus:ring-pink-500'
                    : 'border-slate-200 focus:ring-pink-400 text-slate-900 bg-white'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-700'}`}>
                FECHA HASTA *
              </label>
              <input
                type="date"
                required
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                placeholder="dd/mm/aaaa"
                className={`w-full px-3 py-2 border-2 rounded-xl text-sm transition focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-[#3d2d52] border-violet-700 text-violet-200 focus:ring-pink-500'
                    : 'border-slate-200 focus:ring-pink-400 text-slate-900 bg-white'
                }`}
              />
            </div>
          </div>

          {/* Include Description Checkbox */}
          <label className={`flex items-center gap-3 py-1.5 cursor-pointer select-none transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>
            <input
              type="checkbox"
              checked={incluirDescripcion}
              onChange={(e) => setIncluirDescripcion(e.target.checked)}
              className={`w-4 h-4 rounded focus:ring-0 ${
                isDark ? 'accent-pink-600 bg-[#3d2d52] border-violet-700' : 'accent-pink-500'
              }`}
            />
            <span className="text-sm font-semibold uppercase tracking-wide">INCLUIR DESCRIPCIÓN</span>
          </label>

          {/* Footer Actions */}
          <div className="flex gap-3 mt-2 border-t pt-4 border-slate-200/20">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2 rounded-xl text-sm font-bold uppercase transition ${
                isDark
                  ? 'bg-violet-900/40 text-violet-300 hover:bg-violet-900/60'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className={`flex-1 py-2 rounded-xl text-sm font-bold uppercase text-white shadow transition ${
                isDark
                  ? 'bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400'
                  : 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'
              }`}
            >
              GENERAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CorteExportModal;
