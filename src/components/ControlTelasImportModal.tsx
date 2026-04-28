import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useDarkMode } from '../context/DarkModeContext';

// ── Tipos exportados ───────────────────────────────────────────────────────────
export interface ImportedTelaProduccion {
  tela: string; color: string; undMedida: string; rdmto: string;
  subtotal: string; proveedor: string; fechaCompra: string;
  ivaIncluido: string; feOrRm: string;
}

export interface ImportedTelaMuestra {
  tela: string; color: string; undMedida: string; rdmto: string;
  subtotal: string; proveedor: string; fechaCompra: string;
  facturaNo: string; solicitaRecibe: string; usadaEnProduccion: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
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

// ── Modal Producción ───────────────────────────────────────────────────────────
interface ProduccionProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (rows: ImportedTelaProduccion[]) => void;
}

export const ControlTelasProduccionImportModal: React.FC<ProduccionProps> = ({ isOpen, onClose, onImport }) => {
  const { isDark } = useDarkMode();
  const [preview, setPreview] = useState<ImportedTelaProduccion[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);
      const parsed: ImportedTelaProduccion[] = rows.map(row => ({
        tela:        getCol(row, ['TELA', 'Tela', 'tela']),
        color:       getCol(row, ['COLOR', 'Color', 'color']),
        undMedida:   getCol(row, ['UND MEDIDA', 'UND', 'Und', 'UNIDAD', 'undMedida']) || 'M',
        rdmto:       getCol(row, ['RDMTO', 'Rdmto', 'RENDIMIENTO', 'rdmto']),
        subtotal:    getCol(row, ['SUBTOTAL', 'Subtotal', 'NETO', 'Neto', 'subtotal']),
        proveedor:   getCol(row, ['PROVEEDOR', 'Proveedor', 'proveedor']),
        fechaCompra: parseDate(row['FECHA DE COMPRA'] ?? row['FECHA COMPRA'] ?? row['Fecha Compra'] ?? row['fechaCompra'] ?? ''),
        ivaIncluido: getCol(row, ['IVA INCLUIDO SI/NO', 'IVA INCLUIDO', 'IVA Inc', 'ivaIncluido']) || 'S',
        feOrRm:      getCol(row, ['FE O RM', 'FE/RM', 'FACTURA', 'feOrRm']),
      })).filter(r => r.tela);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col transition-colors ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-5 flex justify-between items-center rounded-t-3xl">
          <div>
            <h2 className="text-xl font-black text-white">Importar desde Excel</h2>
            <p className="text-pink-100 text-xs mt-0.5">Telas para producción</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {!preview ? (
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${isDark ? 'border-violet-600 hover:border-pink-500' : 'border-pink-300 hover:border-pink-500'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-violet-400' : 'text-pink-400'}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33A3 3 0 0116.5 19.5H6.75z" />
                </svg>
                <p className={`font-bold mb-1 ${isDark ? 'text-violet-100' : 'text-slate-700'}`}>Selecciona tu archivo Excel</p>
                <p className={`text-xs mb-3 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Arrastra aquí o haz click para seleccionar</p>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFile} disabled={isLoading} className="hidden" />
                <button disabled={isLoading} className="px-5 py-2 bg-pink-500 text-white text-sm font-bold rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50">
                  {isLoading ? 'Leyendo...' : 'Seleccionar archivo'}
                </button>
              </div>
              <div className={`border rounded-xl p-4 text-xs space-y-1 ${isDark ? 'bg-violet-900/30 border-violet-700 text-violet-300' : 'bg-pink-50 border-pink-200 text-pink-800'}`}>
                <p className="font-bold mb-1">Columnas esperadas:</p>
                <p>TELA · COLOR · UND MEDIDA · RDMTO · SUBTOTAL · PROVEEDOR · FECHA DE COMPRA · IVA INCLUIDO SI/NO · FE O RM</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`border rounded-xl p-4 flex items-center gap-3 ${isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'}`}>
                <span className={`text-3xl font-black ${isDark ? 'text-green-400' : 'text-green-700'}`}>{preview.length}</span>
                <span className={`text-sm font-semibold ${isDark ? 'text-green-300' : 'text-green-700'}`}>filas listas para importar</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-64">
                <table className="text-xs w-full border-collapse">
                  <thead className={`sticky top-0 ${isDark ? 'bg-[#3d2d52]' : 'bg-slate-100'}`}>
                    <tr>{['TELA','COLOR','UND','RDMTO','SUBTOTAL','PROVEEDOR','FECHA','IVA','FE/RM'].map(h => (
                      <th key={h} className={`px-2 py-1.5 text-left font-bold border whitespace-nowrap ${isDark ? 'border-violet-700 text-violet-300' : 'border-slate-200 text-slate-700'}`}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 20).map((r, i) => (
                      <tr key={i} className={isDark ? (i % 2 === 0 ? 'bg-[#4a3a63]' : 'bg-[#3d2d52]') : (i % 2 === 0 ? 'bg-white' : 'bg-slate-50')}>
                        <td className={`px-2 py-1 border ${isDark ? 'border-violet-700 text-violet-200' : 'border-slate-200 text-slate-800'}`}>{r.tela}</td>
                        <td className={`px-2 py-1 border ${isDark ? 'border-violet-700 text-violet-200' : 'border-slate-200 text-slate-800'}`}>{r.color}</td>
                        <td className={`px-2 py-1 border text-center ${isDark ? 'border-violet-700 text-violet-300' : 'border-slate-200 text-slate-700'}`}>{r.undMedida}</td>
                        <td className={`px-2 py-1 border text-center ${isDark ? 'border-violet-700 text-violet-300' : 'border-slate-200 text-slate-700'}`}>{r.rdmto}</td>
                        <td className={`px-2 py-1 border text-right ${isDark ? 'border-violet-700 text-violet-200' : 'border-slate-200 text-slate-700'}`}>{r.subtotal}</td>
                        <td className={`px-2 py-1 border ${isDark ? 'border-violet-700 text-violet-200' : 'border-slate-200 text-slate-700'}`}>{r.proveedor}</td>
                        <td className={`px-2 py-1 border text-center ${isDark ? 'border-violet-700 text-violet-400' : 'border-slate-200 text-slate-500'}`}>{r.fechaCompra}</td>
                        <td className={`px-2 py-1 border text-center ${isDark ? 'border-violet-700 text-violet-300' : 'border-slate-200 text-slate-700'}`}>{r.ivaIncluido}</td>
                        <td className={`px-2 py-1 border ${isDark ? 'border-violet-700 text-violet-300' : 'border-slate-200 text-slate-700'}`}>{r.feOrRm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 20 && (
                  <div className={`px-3 py-2 text-center text-xs font-bold ${isDark ? 'bg-[#3d2d52] text-violet-400' : 'bg-slate-100 text-slate-500'}`}>
                    +{preview.length - 20} filas más
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`border-t px-6 py-4 flex justify-end gap-3 rounded-b-3xl transition-colors ${isDark ? 'border-violet-700 bg-[#3d2d52]' : 'border-slate-200 bg-slate-50'}`}>
          {preview ? (
            <>
              <button onClick={() => { setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition-colors ${isDark ? 'bg-violet-700/50 text-violet-200 hover:bg-violet-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                Cambiar archivo
              </button>
              <button onClick={handleImport} className="px-5 py-2 text-sm bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">
                Importar {preview.length} filas
              </button>
            </>
          ) : (
            <button onClick={onClose}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-colors ${isDark ? 'bg-violet-700/50 text-violet-200 hover:bg-violet-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Modal Muestras ─────────────────────────────────────────────────────────────
interface MuestrasProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (rows: ImportedTelaMuestra[]) => void;
}

export const ControlTelasMuestrasImportModal: React.FC<MuestrasProps> = ({ isOpen, onClose, onImport }) => {
  const { isDark } = useDarkMode();
  const [preview, setPreview] = useState<ImportedTelaMuestra[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);
      const parsed: ImportedTelaMuestra[] = rows.map(row => ({
        tela:               getCol(row, ['TELA', 'Tela', 'tela']),
        color:              getCol(row, ['COLOR', 'Color', 'color']),
        undMedida:          getCol(row, ['UND MEDIDA', 'UND', 'Und', 'UNIDAD', 'undMedida']) || 'M',
        rdmto:              getCol(row, ['RDMTO', 'Rdmto', 'RENDIMIENTO', 'rdmto']),
        subtotal:           getCol(row, ['SUBTOTAL', 'Subtotal', 'NETO', 'Neto', 'subtotal']),
        proveedor:          getCol(row, ['PROVEEDOR', 'Proveedor', 'proveedor']),
        fechaCompra:        parseDate(row['FECHA DE COMPRA'] ?? row['FECHA COMPRA'] ?? row['Fecha Compra'] ?? row['fechaCompra'] ?? ''),
        facturaNo:          getCol(row, ['FACTURA No', 'FACTURA NO', 'Factura No', 'FACTURA', 'facturaNo']),
        solicitaRecibe:     getCol(row, ['SOLICITA Y RECIBE DISEÑADORA', 'SOLICITA', 'Solicita', 'solicitaRecibe']),
        usadaEnProduccion:  getCol(row, ['SE USÓ EN PRODUCCIÓN PARA REFERENCIA', 'USADA EN PRODUCCION', 'usadaEnProduccion']),
      })).filter(r => r.tela);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col transition-colors ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-8 py-5 flex justify-between items-center rounded-t-3xl">
          <div>
            <h2 className="text-xl font-black text-white">Importar desde Excel</h2>
            <p className="text-purple-100 text-xs mt-0.5">Telas para muestras</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {!preview ? (
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${isDark ? 'border-violet-600 hover:border-purple-500' : 'border-purple-300 hover:border-purple-500'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-violet-400' : 'text-purple-400'}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33A3 3 0 0116.5 19.5H6.75z" />
                </svg>
                <p className={`font-bold mb-1 ${isDark ? 'text-violet-100' : 'text-slate-700'}`}>Selecciona tu archivo Excel</p>
                <p className={`text-xs mb-3 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Arrastra aquí o haz click para seleccionar</p>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFile} disabled={isLoading} className="hidden" />
                <button disabled={isLoading} className="px-5 py-2 bg-purple-500 text-white text-sm font-bold rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50">
                  {isLoading ? 'Leyendo...' : 'Seleccionar archivo'}
                </button>
              </div>
              <div className={`border rounded-xl p-4 text-xs space-y-1 ${isDark ? 'bg-violet-900/30 border-violet-700 text-violet-300' : 'bg-purple-50 border-purple-200 text-purple-800'}`}>
                <p className="font-bold mb-1">Columnas esperadas:</p>
                <p>TELA · COLOR · UND MEDIDA · RDMTO · SUBTOTAL · PROVEEDOR · FECHA DE COMPRA · FACTURA No · SOLICITA Y RECIBE DISEÑADORA · SE USÓ EN PRODUCCIÓN PARA REFERENCIA</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`border rounded-xl p-4 flex items-center gap-3 ${isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'}`}>
                <span className={`text-3xl font-black ${isDark ? 'text-green-400' : 'text-green-700'}`}>{preview.length}</span>
                <span className={`text-sm font-semibold ${isDark ? 'text-green-300' : 'text-green-700'}`}>filas listas para importar</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-64">
                <table className="text-xs w-full border-collapse">
                  <thead className={`sticky top-0 ${isDark ? 'bg-[#3d2d52]' : 'bg-slate-100'}`}>
                    <tr>{['TELA','COLOR','UND','RDMTO','SUBTOTAL','PROVEEDOR','FECHA','FACTURA','SOLICITA','USADA'].map(h => (
                      <th key={h} className={`px-2 py-1.5 text-left font-bold border whitespace-nowrap ${isDark ? 'border-violet-700 text-violet-300' : 'border-slate-200 text-slate-700'}`}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 20).map((r, i) => (
                      <tr key={i} className={isDark ? (i % 2 === 0 ? 'bg-[#4a3a63]' : 'bg-[#3d2d52]') : (i % 2 === 0 ? 'bg-white' : 'bg-slate-50')}>
                        <td className={`px-2 py-1 border ${isDark ? 'border-violet-700 text-violet-200' : 'border-slate-200 text-slate-800'}`}>{r.tela}</td>
                        <td className={`px-2 py-1 border ${isDark ? 'border-violet-700 text-violet-200' : 'border-slate-200 text-slate-800'}`}>{r.color}</td>
                        <td className={`px-2 py-1 border text-center ${isDark ? 'border-violet-700 text-violet-300' : 'border-slate-200 text-slate-700'}`}>{r.undMedida}</td>
                        <td className={`px-2 py-1 border text-center ${isDark ? 'border-violet-700 text-violet-300' : 'border-slate-200 text-slate-700'}`}>{r.rdmto}</td>
                        <td className={`px-2 py-1 border text-right ${isDark ? 'border-violet-700 text-violet-200' : 'border-slate-200 text-slate-700'}`}>{r.subtotal}</td>
                        <td className={`px-2 py-1 border ${isDark ? 'border-violet-700 text-violet-200' : 'border-slate-200 text-slate-700'}`}>{r.proveedor}</td>
                        <td className={`px-2 py-1 border text-center ${isDark ? 'border-violet-700 text-violet-400' : 'border-slate-200 text-slate-500'}`}>{r.fechaCompra}</td>
                        <td className={`px-2 py-1 border ${isDark ? 'border-violet-700 text-violet-300' : 'border-slate-200 text-slate-700'}`}>{r.facturaNo}</td>
                        <td className={`px-2 py-1 border ${isDark ? 'border-violet-700 text-violet-300' : 'border-slate-200 text-slate-700'}`}>{r.solicitaRecibe}</td>
                        <td className={`px-2 py-1 border ${isDark ? 'border-violet-700 text-violet-300' : 'border-slate-200 text-slate-700'}`}>{r.usadaEnProduccion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 20 && (
                  <div className={`px-3 py-2 text-center text-xs font-bold ${isDark ? 'bg-[#3d2d52] text-violet-400' : 'bg-slate-100 text-slate-500'}`}>
                    +{preview.length - 20} filas más
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`border-t px-6 py-4 flex justify-end gap-3 rounded-b-3xl transition-colors ${isDark ? 'border-violet-700 bg-[#3d2d52]' : 'border-slate-200 bg-slate-50'}`}>
          {preview ? (
            <>
              <button onClick={() => { setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition-colors ${isDark ? 'bg-violet-700/50 text-violet-200 hover:bg-violet-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                Cambiar archivo
              </button>
              <button onClick={handleImport} className="px-5 py-2 text-sm bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">
                Importar {preview.length} filas
              </button>
            </>
          ) : (
            <button onClick={onClose}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-colors ${isDark ? 'bg-violet-700/50 text-violet-200 hover:bg-violet-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
