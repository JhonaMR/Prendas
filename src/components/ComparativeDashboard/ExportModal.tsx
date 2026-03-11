import React, { useState } from 'react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'excel') => void;
  loading?: boolean;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport, loading = false }) => {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel'>('pdf');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-100 to-indigo-50 px-8 py-6 border-b border-indigo-200">
          <h3 className="text-2xl font-black text-indigo-800 text-center">Exportar Datos</h3>
          <p className="text-sm text-indigo-600 text-center mt-1">Selecciona el formato</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-600 uppercase tracking-widest text-center block">
              Formato de Exportación
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedFormat('pdf')}
                className={`flex-1 py-3 px-4 rounded-lg font-black text-sm transition-all ${
                  selectedFormat === 'pdf'
                    ? 'bg-red-300 text-red-900 shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                📄 PDF
              </button>
              <button
                onClick={() => setSelectedFormat('excel')}
                className={`flex-1 py-3 px-4 rounded-lg font-black text-sm transition-all ${
                  selectedFormat === 'excel'
                    ? 'bg-emerald-300 text-emerald-900 shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                📊 Excel
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-xs font-bold text-slate-600">
              {selectedFormat === 'pdf'
                ? 'Se generará un PDF con todas las métricas y tablas del dashboard'
                : 'Se generará un archivo Excel con datos detallados para análisis'}
            </p>
          </div>
        </div>

        <div className="flex gap-3 px-8 py-6 bg-slate-50 border-t border-slate-200">
          <button
            onClick={() => onExport(selectedFormat)}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-lg font-black text-sm bg-gradient-to-r from-indigo-300 to-indigo-200 text-indigo-900 hover:from-indigo-400 hover:to-indigo-300 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generando...' : 'Exportar'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-lg font-black text-sm bg-slate-300 text-slate-700 hover:bg-slate-400 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
