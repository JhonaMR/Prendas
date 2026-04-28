import React, { useState } from 'react';
import { User, AppState } from '../types';
import PagoConfeccionistasView from './PagoConfeccionistasView';
import PagoEstampadorasView from './PagoEstampadorasView';
import { useDarkMode } from '../context/DarkModeContext';

interface CalculoPagoLotesViewProps {
  user: User;
  state: AppState;
  onNavigate: (tab: string, params?: any) => void;
  params?: any;
}

type ViewType = 'selector' | 'confeccionistas' | 'estampadores';

const CalculoPagoLotesView: React.FC<CalculoPagoLotesViewProps> = ({ user, state, onNavigate, params }) => {
  const { isDark } = useDarkMode();
  const initialView: ViewType = params?.subView === 'confeccionistas' ? 'confeccionistas' : 'selector';
  const [view, setView] = useState<ViewType>(initialView);

  if (view === 'confeccionistas') {
    return <PagoConfeccionistasView user={user} state={state} onNavigate={onNavigate} onBack={() => setView('selector')} loteData={params?.loteData} />;
  }

  if (view === 'selector') {
    return (
      <div className={`space-y-8 pb-20 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-white'}`}>
        <div>
          <h2 className={`text-3xl font-black tracking-tighter transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Calculo, pago de lotes</h2>
          <p className={`font-medium transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Selecciona el tipo de cálculo</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button
            onClick={() => setView('confeccionistas')}
            className={`p-8 rounded-[32px] shadow-sm border transition-all flex flex-col items-center justify-center gap-6 min-h-[400px] ${isDark ? 'bg-[#4a3a63] border-violet-700 hover:shadow-md hover:border-violet-600' : 'bg-white border-slate-100 hover:shadow-md hover:border-pink-200'}`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-violet-900' : 'bg-pink-50'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-8 h-8 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-pink-500'}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
              </svg>
            </div>
            <div className="text-center space-y-2">
              <h3 className={`text-2xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Calcular pago a confeccionistas</h3>
              <p className={`font-medium transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Liquidación de lotes por confección</p>
            </div>
          </button>

          <button
            onClick={() => setView('estampadores')}
            className={`p-8 rounded-[32px] shadow-sm border transition-all flex flex-col items-center justify-center gap-6 min-h-[400px] ${isDark ? 'bg-[#4a3a63] border-violet-700 hover:shadow-md hover:border-violet-600' : 'bg-white border-slate-100 hover:shadow-md hover:border-purple-200'}`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-violet-900' : 'bg-purple-50'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-8 h-8 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-purple-500'}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
              </svg>
            </div>
            <div className="text-center space-y-2">
              <h3 className={`text-2xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Calcular pago a estampadores</h3>
              <p className={`font-medium transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Liquidación de lotes por estampado</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (view === 'estampadores') {
    return <PagoEstampadorasView user={user} state={state} onNavigate={onNavigate} onBack={() => setView('selector')} />;
  }

  // Estampadores — placeholder
  return (
    <div className={`space-y-6 pb-20 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-white'}`}>
      <div className="flex items-center gap-4">
        <button onClick={() => setView('selector')} className={`px-6 py-4 rounded-[24px] font-bold transition-all border text-sm ${isDark ? 'bg-[#4a3a63] text-violet-300 hover:text-violet-200 border-violet-700' : 'bg-white text-slate-400 hover:text-slate-600 border-slate-100'}`}>
          Atrás
        </button>
        <div>
          <h2 className={`text-3xl font-black tracking-tighter transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Calcular pago a estampadores</h2>
          <p className={`font-medium text-sm transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>En construcción</p>
        </div>
      </div>
      <div className={`p-12 rounded-[32px] border-2 border-dashed text-center font-bold italic transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700 text-violet-300' : 'bg-white border-slate-200 text-slate-400'}`}>
        Esta sección está en desarrollo
      </div>
    </div>
  );
};

export default CalculoPagoLotesView;
