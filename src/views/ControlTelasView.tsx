import React from 'react';

const ControlTelasView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Control de Telas</h2>
        <p className="text-slate-400 font-medium">Gestión y seguimiento de telas</p>
      </div>
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-12 flex items-center justify-center">
        <p className="text-slate-400 font-medium">Vista en construcción</p>
      </div>
    </div>
  );
};

export default ControlTelasView;
