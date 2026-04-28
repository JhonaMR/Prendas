import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import api from '../services/api';
import { useDarkMode } from '../context/DarkModeContext';

interface Props {
  onClose: () => void;
  onImportado: () => void;
}

interface FilaPreview {
  cedula: string;
  nombre: string;
  cuenta: string;
  valida: boolean;
  error?: string;
}

const CuentasBancariasImportModal: React.FC<Props> = ({ onClose, onImportado }) => {
  const { isDark } = useDarkMode();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<FilaPreview[] | null>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<{ ok: number; errores: number } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResultado(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result;
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      const filas: FilaPreview[] = rows.slice(1)
        .filter(r => r.some((c: any) => String(c).trim() !== ''))
        .map(r => {
          const cedula = String(r[0] ?? '').trim() || '-';
          const nombre = String(r[1] ?? '').trim();
          const cuenta = String(r[2] ?? '').trim();
          const valida = !!(nombre && cuenta);
          return {
            cedula, nombre, cuenta, valida,
            error: !valida ? 'Faltan campos obligatorios (nombre y cuenta)' : undefined,
          };
        });

      setPreview(filas);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImportar = async () => {
    if (!preview) return;
    const validas = preview.filter(f => f.valida);
    if (!validas.length) return;

    setLoading(true);
    const res = await api.importarCuentasBancarias(validas);
    setLoading(false);

    if (res.success) {
      setResultado({ ok: res.data?.ok ?? validas.length, errores: res.data?.errores ?? 0 });
      onImportado();
    } else {
      alert('Error al importar: ' + res.message);
    }
  };

  const validas = preview?.filter(f => f.valida) ?? [];
  const invalidas = preview?.filter(f => !f.valida) ?? [];

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transition-colors ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-violet-500 px-8 py-6 rounded-t-3xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">Importar Cuentas Bancarias</h2>
            <p className="text-violet-100 text-sm mt-1">Carga datos desde Excel (.xlsx / .xls)</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          {/* Instrucciones */}
          <div className={`border rounded-2xl p-4 mb-6 text-sm transition-colors ${isDark ? 'bg-violet-900/30 border-violet-700 text-violet-300' : 'bg-violet-50 border-violet-200 text-violet-700'}`}>
            <p className="font-semibold mb-1">Formato esperado del Excel:</p>
            <p>Fila 1: Títulos (se omite automáticamente)</p>
            <p>Columna A: Cédula &nbsp;·&nbsp; Columna B: Nombre &nbsp;·&nbsp; Columna C: Cuenta Bancaria</p>
          </div>

          {/* Selector de archivo */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors mb-6 ${isDark ? 'border-violet-600 hover:border-violet-400' : 'border-violet-300 hover:border-violet-500'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-violet-500' : 'text-violet-300'}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className={`font-semibold ${isDark ? 'text-violet-300' : 'text-violet-500'}`}>
              {fileName || 'Haz clic para seleccionar un archivo'}
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-violet-500' : 'text-violet-300'}`}>.xlsx o .xls</p>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileSelect} />
          </div>

          {/* Preview */}
          {preview && (
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-3">
                <span className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{validas.length} válidos</span>
                {invalidas.length > 0 && <span className={`text-sm font-semibold ${isDark ? 'text-red-400' : 'text-red-400'}`}>{invalidas.length} con errores</span>}
              </div>

              {validas.length > 0 && (
                <div className={`rounded-2xl overflow-hidden max-h-64 overflow-y-auto border transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-700' : 'bg-slate-50 border-slate-200'}`}>
                  <table className="w-full text-xs">
                    <thead className="bg-violet-500 text-white">
                      <tr>
                        <th className="text-left px-4 py-2">Cédula</th>
                        <th className="text-left px-4 py-2">Nombre</th>
                        <th className="text-left px-4 py-2">Cuenta Bancaria</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y transition-colors ${isDark ? 'divide-violet-700' : 'divide-slate-100'}`}>
                      {validas.map((f, i) => (
                        <tr key={i} className={isDark ? (i % 2 === 0 ? 'bg-[#4a3a63]' : 'bg-[#3d2d52]') : 'bg-white'}>
                          <td className={`px-4 py-2 ${isDark ? 'text-violet-400' : 'text-slate-600'}`}>{f.cedula}</td>
                          <td className={`px-4 py-2 font-semibold ${isDark ? 'text-violet-100' : 'text-slate-800'}`}>{f.nombre}</td>
                          <td className={`px-4 py-2 font-mono ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>{f.cuenta}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {invalidas.length > 0 && (
                <div className={`mt-3 rounded-xl p-3 text-xs transition-colors ${isDark ? 'bg-red-900/30 border border-red-700 text-red-400' : 'bg-red-50 text-red-500'}`}>
                  <p className="font-semibold mb-1">Filas con errores (se omitirán):</p>
                  {invalidas.map((f, i) => (
                    <p key={i}>Fila {i + 1}: {f.error}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Resultado */}
          {resultado && (
            <div className={`border rounded-2xl p-4 mb-6 text-sm font-semibold transition-colors ${isDark ? 'bg-emerald-900/30 border-emerald-700 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
              ✅ Importación completada: {resultado.ok} cuentas guardadas.
              {resultado.errores > 0 && <span className={`ml-2 ${isDark ? 'text-red-400' : 'text-red-500'}`}>{resultado.errores} con errores.</span>}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 border-2 font-semibold py-2.5 rounded-xl transition-colors ${isDark ? 'border-violet-600 text-violet-300 hover:bg-violet-700/30' : 'border-violet-200 text-violet-500 hover:bg-violet-50'}`}
            >
              {resultado ? 'Cerrar' : 'Cancelar'}
            </button>
            {!resultado && (
              <button
                onClick={handleImportar}
                disabled={loading || validas.length === 0}
                className="flex-1 bg-violet-500 hover:bg-violet-600 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl transition-colors"
              >
                {loading ? 'Importando...' : `Importar ${validas.length} registros`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuentasBancariasImportModal;
