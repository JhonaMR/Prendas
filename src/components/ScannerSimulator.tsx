
import React, { useState } from 'react';
import { Icons } from '../constants';
import { useDarkMode } from '../context/DarkModeContext';

interface ScannerSimulatorProps {
  onScan: (reference: string, quantity: number) => void;
  label?: string;
}

const ScannerSimulator: React.FC<ScannerSimulatorProps> = ({ onScan, label = "Escanear Referencia" }) => {
  const { isDark } = useDarkMode();
  const [ref, setRef] = useState('');
  const [qty, setQty] = useState(1);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const refInputRef = React.useRef<HTMLInputElement>(null);

  const handleTrigger = () => {
    if (ref.trim() && qty > 0) {
      onScan(ref.trim().toUpperCase(), qty);
      setRef('');
      setQty(1);
      refInputRef.current?.focus();
    }
  };

  const adjustQty = (amount: number) => {
    setQty(prev => Math.max(1, prev + amount));
  };

  const toggleCamera = () => {
    setIsCameraActive(!isCameraActive);
    if (!isCameraActive) {
      alert("Cámara activada. En un dispositivo real, aquí se abriría el visor del código de barras.");
    }
  };

  return (
    <div className="space-y-4">
      <div className={`backdrop-blur-xl p-4 sm:p-5 rounded-[32px] sm:rounded-[40px] border shadow-xl flex flex-col gap-4 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63]/70 border-violet-700 shadow-violet-900/50' : 'bg-white/70 border-blue-100 shadow-blue-50/50'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6 items-end">
          
          {/* Reference Input */}
          <div className="lg:col-span-6 space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest px-4 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-blue-500'}`}>{label}</label>
            <div className="relative">
              <input 
                type="text" 
                ref={refInputRef}
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="Número de referencia..."
                className={`w-full pl-12 pr-6 py-3.5 border-none rounded-2xl font-black text-sm sm:text-base uppercase transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] text-violet-100 placeholder-violet-600 focus:ring-4 focus:ring-violet-400' : 'bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-blue-100'}`}
                onKeyDown={(e) => e.key === 'Enter' && handleTrigger()}
                onFocus={(e) => e.target.select()}
              />
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isDark ? 'text-violet-600' : 'text-slate-300'}`}>
                <Icons.Inventory />
              </div>
            </div>
          </div>

          {/* Manual Quantity with +/- buttons */}
          <div className="lg:col-span-3 space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest px-4 text-center block transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Cantidad</label>
            <div className={`flex items-center p-1 rounded-2xl sm:rounded-[24px] border w-full transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600' : 'bg-slate-100 border-slate-200'}`}>
              <button 
                type="button"
                onClick={() => adjustQty(-1)}
                className={`w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center rounded-xl font-bold text-lg active:scale-90 transition-all transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] text-violet-400 hover:text-pink-400 hover:shadow-sm' : 'bg-white text-slate-500 hover:text-pink-500 hover:shadow-sm'}`}
              >
                -
              </button>
              <input 
                type="number" 
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => e.key === 'Enter' && handleTrigger()}
                className={`w-full min-w-0 bg-transparent border-none text-center font-black text-lg sm:text-xl focus:ring-0 px-2 transition-colors duration-300 ${isDark ? 'text-violet-100' : 'text-slate-800'}`}
              />
              <button 
                type="button"
                onClick={() => adjustQty(1)}
                className={`w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center rounded-xl font-bold text-lg active:scale-90 transition-all transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] text-violet-400 hover:text-violet-300 hover:shadow-sm' : 'bg-white text-slate-500 hover:text-blue-500 hover:shadow-sm'}`}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="lg:col-span-3 flex gap-2">
            <button 
              onClick={toggleCamera}
              className={`w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center rounded-2xl sm:rounded-3xl border-2 transition-all transition-colors duration-300 ${isCameraActive ? (isDark ? 'border-pink-500 text-pink-400 bg-pink-900/40' : 'border-pink-500 text-pink-500 bg-pink-50') : (isDark ? 'border-violet-700 text-violet-600 hover:bg-violet-900/40' : 'border-slate-100 text-slate-400 hover:bg-slate-50')}`}
              title="Abrir Cámara"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            </button>
            <button 
              onClick={handleTrigger}
              disabled={!ref.trim()}
              className={`flex-1 h-12 sm:h-14 text-white font-black rounded-2xl sm:rounded-3xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-sm sm:text-base transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-violet-600 to-pink-600 shadow-violet-900/50' : 'bg-gradient-to-r from-blue-600 to-pink-600 shadow-blue-200'}`}
            >
              AGREGAR
            </button>
          </div>
        </div>

        {isCameraActive && (
          <div className={`h-40 sm:h-48 rounded-[24px] sm:rounded-3xl flex items-center justify-center text-[10px] sm:text-xs font-bold uppercase tracking-widest animate-pulse border-4 transition-colors duration-300 ${isDark ? 'bg-slate-900 text-violet-400/50 border-violet-600/40' : 'bg-slate-900 text-white/50 border-blue-500/20'}`}>
            [ Simulación de Visor de Cámara Activo ]
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannerSimulator;
