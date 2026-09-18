import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDarkMode } from '../../context/DarkModeContext';
import { X, FileText } from 'lucide-react';
import { Seller } from '../../types';

interface VendorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (year: string, vendorId: string) => void;
  sellers: Seller[];
}

export const VendorReportModal: React.FC<VendorReportModalProps> = ({ isOpen, onClose, onGenerate, sellers }) => {
  const { isDark } = useDarkMode();
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [vendorId, setVendorId] = useState('');

  // Manejar el cierre con la tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Limpiar el estado cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setYear(new Date().getFullYear().toString());
      setVendorId('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`w-full max-w-md p-6 rounded-3xl shadow-xl border ${isDark ? 'bg-[#2a1a4a] border-violet-700' : 'bg-white border-slate-200'}`}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-black uppercase tracking-tight flex items-center gap-2 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>
              <div className={`p-2 rounded-xl ${isDark ? 'bg-violet-900/30' : 'bg-indigo-50'}`}>
                <FileText className={`w-5 h-5 ${isDark ? 'text-violet-400' : 'text-indigo-600'}`} />
              </div>
              Generar Informe
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-violet-800/50 text-violet-300' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>
                Año
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Ej. 2024"
                className={`w-full px-4 py-3 rounded-xl border text-sm font-bold transition-colors focus:outline-none focus:ring-2 ${
                  isDark 
                    ? 'bg-[#1e1136] border-violet-800 text-violet-50 focus:border-violet-500 focus:ring-violet-500/20' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
                autoComplete="off"
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>
                Vendedor
              </label>
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-bold transition-colors focus:outline-none focus:ring-2 ${
                  isDark 
                    ? 'bg-[#1e1136] border-violet-800 text-violet-50 focus:border-violet-500 focus:ring-violet-500/20' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
              >
                <option value="">Seleccione un vendedor...</option>
                {sellers.map((seller) => (
                  <option key={seller.id} value={seller.id}>
                    {seller.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors border ${
                isDark 
                  ? 'bg-transparent border-violet-700 text-violet-300 hover:bg-violet-800/30' 
                  : 'bg-transparent border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Cancelar
            </button>
            <button
              onClick={() => onGenerate(year, vendorId)}
              disabled={!year || !vendorId}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${
                (!year || !vendorId)
                  ? isDark ? 'bg-violet-900/50 text-violet-500/50 cursor-not-allowed border border-transparent' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-transparent'
                  : isDark ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/20 border border-violet-500' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500'
              }`}
            >
              Generar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
