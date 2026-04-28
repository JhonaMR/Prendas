import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useDarkMode } from '../context/DarkModeContext';

export interface ImportedCorteRow {
  numeroFicha: string;
  fechaCorte: string;
  referencia: string;
  descripcion: string;
  cantidadCortada: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (rows: ImportedCorteRow[]) => void;
}

const getCol = (row: any, names: string[]): string => {
  for (const n of names) {
    const val = row[n];
    if (val !== undefined && val !== null && val !== '') return String(val).trim();
  }
  return '';
};

const parseDate = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [d, m, y] = value.split('/');
    return `${y}-${m}-${d}`;
  }
  if (typeof value === 'number') {
    const date = new Date((value - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }
  return String(value).trim();
};

const CorteImportModal: React.FC<Props> = ({ isOpen, onClose, onImport }) => {
  const { isDark } = useDarkMode();
  const [preview, setPreview] = useState<ImportedCorteRow[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);

      const parsed: ImportedCorteRow[] = rows.map(row => ({
        numeroFicha:    getCol(row, ['N° DE FICHA', 'NUMERO FICHA', 'Número Ficha', 'numero_ficha']),
        fechaCorte:     parseDate(row['FECHA CORTE'] ?? row['Fecha Corte'] ?? row['fecha_corte'] ?? ''),
        referencia:     getCol(row, ['REF', 'Ref', 'REFERENCIA', 'Referencia', 'referencia']),
        descripcion:    getCol(row, ['DESCRIPCION', 'Descripción', 'Description', 'descripcion']),
        cantidadCortada: getCol(row, ['CANT. CORTADA', 'CANTIDAD CORTADA', 'Cantidad Cortada', 'cantidad_cortada']),
      })).filter(r => r.numeroFicha || r.referencia);

      setPreview(parsed);
    } catch {
      alert('Error al leer el archivo. Asegúrate de que sea un Excel válido (.xlsx o .xls).');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (!preview?.length) return;
    onImport(preview);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  const handleReset = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col transition-colors duration-300 ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}>
        {/* Header */}
        <div className={`px-8 py-5 flex justify-between items-center rounded-t-3xl transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-pink-700 to-purple-700' : 'bg-gradient-to-r from-pink-600 to-purple-600'}`}>
          <div>
            <h2 className={`text-xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-white'}`}>Importar desde Excel</h2>
            <p className={`text-xs mt-0.5 transition-colors duration-300 ${isDark ? 'text-pink-200' : 'text-pink-100'}`}>Registro de Corte</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors duration-300 ${isDark ? 'text-white hover:bg-white/20' : 'text-white hover:bg-white/20'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className={`p-6 overflow-y-auto flex-1 space-y-4 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}>
          {!preview ? (
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors duration-300 cursor-pointer ${isDark ? 'border-pink-600 hover:border-pink-500 bg-pink-900/20' : 'border-pink-300 hover:border-pink-500 bg-white'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-12 h-12 mx-auto mb-3 transition-colors duration-300 ${isDark ? 'text-pink-400' : 'text-pink-400'}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33A3 3 0 0116.5 19.5H6.75z" />
                </svg>
                <p className={`font-bold mb-1 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Selecciona tu archivo Excel</p>
                <p className={`text-xs mb-3 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Arrastra aquí o haz click para seleccionar</p>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileSelect} disabled={isLoading} className="hidden" />
                <button disabled={isLoading} className={`px-5 py-2 text-sm font-bold rounded-lg transition-colors duration-300 ${isDark ? 'bg-pink-700 text-white hover:bg-pink-600 disabled:opacity-50' : 'bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50'}`}>
                  {isLoading ? 'Leyendo...' : 'Seleccionar archivo'}
                </button>
              </div>

              <div className={`border rounded-xl p-4 text-xs space-y-1 transition-colors duration-300 ${isDark ? 'bg-pink-900/20 border-pink-700 text-pink-300' : 'bg-pink-50 border-pink-200 text-pink-800'}`}>
                <p className="font-bold mb-1">Columnas esperadas en el Excel:</p>
                <p>N° DE FICHA · FECHA CORTE · REF · DESCRIPCION · CANT. CORTADA</p>
                <p className={`mt-1 transition-colors duration-300 ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>Las fechas pueden estar en formato YYYY-MM-DD, DD/MM/YYYY o número de serie de Excel.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`border rounded-xl p-4 flex items-center gap-3 transition-colors duration-300 ${isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'}`}>
                <span className={`text-3xl font-black transition-colors duration-300 ${isDark ? 'text-green-400' : 'text-green-700'}`}>{preview.length}</span>
                <span className={`text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-green-300' : 'text-green-700'}`}>filas listas para importar</span>
              </div>

              <div className={`overflow-x-auto rounded-xl border max-h-64 transition-colors duration-300 ${isDark ? 'border-violet-700' : 'border-slate-200'}`}>
                <table className={`text-xs w-full border-collapse transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-white'}`}>
                  <thead className={`sticky top-0 transition-colors duration-300 ${isDark ? 'bg-[#5a4a75]' : 'bg-slate-100'}`}>
                    <tr>
                      {['N° FICHA','FECHA CORTE','REF','DESCRIPCION','CANT. CORTADA'].map(h => (
                        <th key={h} className={`px-2 py-1.5 text-left font-bold border whitespace-nowrap transition-colors duration-300 ${isDark ? 'border-violet-700 text-violet-200' : 'border-slate-200 text-slate-800'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 20).map((r, i) => (
                      <tr key={i} className={`transition-colors duration-300 ${isDark ? `${i % 2 === 0 ? 'bg-[#3d2d52]' : 'bg-[#4a3a5f]'}` : `${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}`}>
                        <td className={`px-2 py-1 border transition-colors duration-300 ${isDark ? 'border-violet-700 text-violet-300' : 'border-slate-200 text-slate-900'}`}>{r.numeroFicha}</td>
                        <td className={`px-2 py-1 border text-center transition-colors duration-300 ${isDark ? 'border-violet-700 text-violet-300' : 'border-slate-200 text-slate-900'}`}>{r.fechaCorte}</td>
                        <td className={`px-2 py-1 border text-center transition-colors duration-300 ${isDark ? 'border-violet-700 text-violet-300' : 'border-slate-200 text-slate-900'}`}>{r.referencia}</td>
                        <td className={`px-2 py-1 border transition-colors duration-300 ${isDark ? 'border-violet-700 text-violet-300' : 'border-slate-200 text-slate-900'}`}>{r.descripcion}</td>
                        <td className={`px-2 py-1 border text-center transition-colors duration-300 ${isDark ? 'border-violet-700 text-violet-300' : 'border-slate-200 text-slate-900'}`}>{r.cantidadCortada}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 20 && (
                  <div className={`px-3 py-2 text-center text-xs font-bold transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] text-violet-400' : 'bg-slate-100 text-slate-500'}`}>
                    +{preview.length - 20} filas más
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`border-t px-6 py-4 flex justify-end gap-3 rounded-b-3xl transition-colors duration-300 ${isDark ? 'border-violet-700 bg-[#3d2d52]' : 'border-slate-200 bg-slate-50'}`}>
          {preview ? (
            <>
              <button onClick={handleReset} className={`px-5 py-2 text-sm font-bold rounded-lg transition-colors duration-300 ${isDark ? 'bg-violet-900/40 text-violet-300 hover:bg-violet-900/60' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                Cambiar archivo
              </button>
              <button onClick={handleImport} disabled={!preview.length} className={`px-5 py-2 text-sm font-bold rounded-lg transition-colors duration-300 ${isDark ? 'bg-green-700 text-white hover:bg-green-600 disabled:opacity-50' : 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'}`}>
                Importar {preview.length} filas
              </button>
            </>
          ) : (
            <button onClick={onClose} className={`px-5 py-2 text-sm font-bold rounded-lg transition-colors duration-300 ${isDark ? 'bg-violet-900/40 text-violet-300 hover:bg-violet-900/60' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CorteImportModal;
