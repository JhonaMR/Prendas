import React from 'react';

const LiquidacionTransporteView: React.FC = () => {
  return (
    <div className="h-full w-full flex items-center justify-center p-10">
      <div className="text-center">
        <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-pink-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Liquidación de Transporte</h2>
        <p className="text-slate-500 text-sm">Módulo en desarrollo</p>
      </div>
    </div>
  );
};

export default LiquidacionTransporteView;
