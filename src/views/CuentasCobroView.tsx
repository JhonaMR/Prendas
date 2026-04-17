import React from 'react';

const CuentasCobroView: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-10">
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-12 flex flex-col items-center gap-4 max-w-md w-full text-center shadow-sm">
        <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-pink-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-slate-900">Cuentas de Cobro</h1>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-amber-500 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span className="text-sm font-semibold text-amber-700">En desarrollo</span>
        </div>
        <p className="text-slate-400 text-sm">Esta funcionalidad estará disponible próximamente.</p>
      </div>
    </div>
  );
};

export default CuentasCobroView;
