import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

// Columnas esperadas en el Excel (case-insensitive)
// CONFECCIONISTA | REMISION | REF | SALIDA | FECHA REMISION | ENTREGA | SEGUNDAS | VTA | COBRADO | INCOMPLETO | FECHA LLEGADA | TALEGOS SALIDA | TALEGOS ENTREGA | MUESTRAS SALIDA | MUESTRAS ENTREGA

export interface ImportedLoteRow {
  confeccionista: string;
  remision: string;
  ref: string;
  salida: string;
  fechaRemision: string;
  entrega: string;
  segundas: string;
  vta: string;
  cobrado: string;
  incompleto: string;
  fechaLlegada: string;
  talegosSalida: string;
  talegosEntrega: string;
  muestrasSalida: string;
  muestrasEntrega: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (rows: ImportedLoteRow[]) => void;
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

const ProductoEnProcesoImportModal: React.FC<Props> = ({ isOpen, onClose, onImport }) => {
  const [preview, setPreview] = useState<ImportedLoteRow[] | null>(null);
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

      const parsed: ImportedLoteRow[] = rows.map(row => ({
        confeccionista: getCol(row, ['CONFECCIONISTA', 'Confeccionista', 'confeccionista']),
        remision:       getCol(row, ['REMISION', 'REMISIÓN', 'Remision', 'Remisión']),
        ref:            getCol(row, ['REF', 'Ref', 'REFERENCIA', 'Referencia']),
        salida:         getCol(row, ['SALIDA', 'Salida']),
        fechaRemision:  parseDate(row['FECHA REMISION'] ?? row['FECHA REMISIÓN'] ?? row['Fecha Remision'] ?? row['Fecha Remisión'] ?? ''),
        entrega:        getCol(row, ['ENTREGA', 'Entrega']),
        segundas:       getCol(row, ['SEGUNDAS', 'Segundas']),
        vta:            getCol(row, ['VTA', 'Vta', 'VENTAS', 'Ventas']),
        cobrado:        getCol(row, ['COBRADO', 'Cobrado']),
        incompleto:     getCol(row, ['INCOMPLETO', 'Incompleto']),
        fechaLlegada:   parseDate(row['FECHA LLEGADA'] ?? row['Fecha Llegada'] ?? ''),
        talegosSalida:  getCol(row, ['TALEGOS SALIDA', 'Talegos Salida', 'TALEGOS_SALIDA']),
        talegosEntrega: getCol(row, ['TALEGOS ENTREGA', 'Talegos Entrega', 'TALEGOS_ENTREGA']),
        muestrasSalida: getCol(row, ['MUESTRAS SALIDA', 'Muestras Salida', 'MUESTRAS_SALIDA']),
        muestrasEntrega:getCol(row, ['MUESTRAS ENTREGA', 'Muestras Entrega', 'MUESTRAS_ENTREGA']),
      })).filter(r => r.confeccionista || r.remision || r.ref);

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
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-5 flex justify-between items-center rounded-t-3xl">
          <div>
            <h2 className="text-xl font-black text-white">Importar desde Excel</h2>
            <p className="text-purple-100 text-xs mt-0.5">Producto en Proceso</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {!preview ? (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-purple-300 rounded-2xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-purple-400 mb-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33A3 3 0 0116.5 19.5H6.75z" />
                </svg>
                <p className="font-bold text-slate-700 mb-1">Selecciona tu archivo Excel</p>
                <p className="text-slate-400 text-xs mb-3">Arrastra aquí o haz click para seleccionar</p>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileSelect} disabled={isLoading} className="hidden" />
                <button disabled={isLoading} className="px-5 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50">
                  {isLoading ? 'Leyendo...' : 'Seleccionar archivo'}
                </button>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-xs text-purple-800 space-y-1">
                <p className="font-bold mb-1">Columnas esperadas en el Excel:</p>
                <p>CONFECCIONISTA · REMISION · REF · SALIDA · FECHA REMISION · ENTREGA · SEGUNDAS · VTA · COBRADO · INCOMPLETO · FECHA LLEGADA · TALEGOS SALIDA · TALEGOS ENTREGA · MUESTRAS SALIDA · MUESTRAS ENTREGA</p>
                <p className="text-purple-600 mt-1">Las fechas pueden estar en formato YYYY-MM-DD, DD/MM/YYYY o número de serie de Excel.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <span className="text-3xl font-black text-green-700">{preview.length}</span>
                <span className="text-sm text-green-700 font-semibold">filas listas para importar</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-64">
                <table className="text-xs w-full border-collapse">
                  <thead className="bg-slate-100 sticky top-0">
                    <tr>
                      {['CONFECCIONISTA','REMISIÓN','REF','SALIDA','F. REMISIÓN','ENTREGA','SEGUNDAS','VTA','COBRADO','INCOMPLETO','F. LLEGADA'].map(h => (
                        <th key={h} className="px-2 py-1.5 text-left font-bold border border-slate-200 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 20).map((r, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-2 py-1 border border-slate-200">{r.confeccionista}</td>
                        <td className="px-2 py-1 border border-slate-200 text-center">{r.remision}</td>
                        <td className="px-2 py-1 border border-slate-200 text-center">{r.ref}</td>
                        <td className="px-2 py-1 border border-slate-200 text-center">{r.salida}</td>
                        <td className="px-2 py-1 border border-slate-200 text-center">{r.fechaRemision}</td>
                        <td className="px-2 py-1 border border-slate-200 text-center">{r.entrega}</td>
                        <td className="px-2 py-1 border border-slate-200 text-center">{r.segundas}</td>
                        <td className="px-2 py-1 border border-slate-200 text-center">{r.vta}</td>
                        <td className="px-2 py-1 border border-slate-200 text-center">{r.cobrado}</td>
                        <td className="px-2 py-1 border border-slate-200 text-center">{r.incompleto}</td>
                        <td className="px-2 py-1 border border-slate-200 text-center">{r.fechaLlegada}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 20 && (
                  <div className="px-3 py-2 bg-slate-100 text-center text-xs font-bold text-slate-500">
                    +{preview.length - 20} filas más
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3 rounded-b-3xl bg-slate-50">
          {preview ? (
            <>
              <button onClick={handleReset} className="px-5 py-2 text-sm bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors">
                Cambiar archivo
              </button>
              <button onClick={handleImport} disabled={!preview.length} className="px-5 py-2 text-sm bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                Importar {preview.length} filas
              </button>
            </>
          ) : (
            <button onClick={onClose} className="px-5 py-2 text-sm bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors">
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductoEnProcesoImportModal;
