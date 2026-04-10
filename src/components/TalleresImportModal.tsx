import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { api } from '../services/api';

interface Props {
  onClose: () => void;
  onImportado: () => void;
}

interface FilaPreview {
  nombre: string;
  celular: string;
  direccion: string;
  sector: string;
  estado: 'activo' | 'inactivo';
  valida: boolean;
  error?: string;
}

const TalleresImportModal: React.FC<Props> = ({ onClose, onImportado }) => {
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
          const nombre    = String(r[0] ?? '').trim();
          const celular   = String(r[1] ?? '').trim();
          const direccion = String(r[2] ?? '').trim();
          const sector    = String(r[3] ?? '').trim();
          const estadoRaw = String(r[4] ?? '').trim().toLowerCase();
          const estado: 'activo' | 'inactivo' = estadoRaw === 'inactivo' ? 'inactivo' : 'activo';
          const valida = !!nombre;
          return { nombre, celular, direccion, sector, estado, valida,
            error: !valida ? 'Falta el nombre del taller' : undefined };
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
    const res = await (api as any).importarTalleres(validas);
    setLoading(false);

    if (res.success) {
      setResultado({ ok: res.data?.ok ?? validas.length, errores: res.data?.errores ?? 0 });
      onImportado();
    } else {
      alert('Error al importar: ' + res.message);
    }
  };

  const validas   = preview?.filter(f => f.valida)  ?? [];
  const invalidas = preview?.filter(f => !f.valida) ?? [];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-pink-500 px-8 py-6 rounded-t-3xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">Importar Talleres</h2>
            <p className="text-pink-100 text-sm mt-1">Carga datos desde Excel (.xlsx / .xls)</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          {/* Instrucciones */}
          <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 mb-6 text-sm text-pink-700">
            <p className="font-semibold mb-1">Formato esperado del Excel:</p>
            <p>Fila 1: Títulos (se omite automáticamente)</p>
            <p>Col A: Nombre &nbsp;·&nbsp; Col B: Celular &nbsp;·&nbsp; Col C: Dirección &nbsp;·&nbsp; Col D: Sector &nbsp;·&nbsp; Col E: Estado (activo/inactivo)</p>
          </div>

          {/* Selector de archivo */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-pink-300 hover:border-pink-500 rounded-2xl p-8 text-center cursor-pointer transition-colors mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-pink-300 mx-auto mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-pink-500 font-semibold">{fileName || 'Haz clic para seleccionar un archivo'}</p>
            <p className="text-pink-300 text-xs mt-1">.xlsx o .xls</p>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileSelect} />
          </div>

          {/* Preview */}
          {preview && (
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-3">
                <span className="text-sm font-semibold text-emerald-600">{validas.length} válidos</span>
                {invalidas.length > 0 && <span className="text-sm font-semibold text-red-400">{invalidas.length} con errores</span>}
              </div>

              {validas.length > 0 && (
                <div className="bg-slate-50 rounded-2xl overflow-hidden max-h-64 overflow-y-auto border border-slate-200">
                  <table className="w-full text-xs">
                    <thead className="bg-pink-500 text-white">
                      <tr>
                        <th className="text-left px-4 py-2">Nombre</th>
                        <th className="text-left px-4 py-2">Celular</th>
                        <th className="text-left px-4 py-2">Dirección</th>
                        <th className="text-left px-4 py-2">Sector</th>
                        <th className="text-left px-4 py-2">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {validas.map((f, i) => (
                        <tr key={i} className="bg-white">
                          <td className="px-4 py-2 font-semibold text-slate-800">{f.nombre}</td>
                          <td className="px-4 py-2 text-slate-600">{f.celular || '—'}</td>
                          <td className="px-4 py-2 text-slate-600">{f.direccion || '—'}</td>
                          <td className="px-4 py-2 text-slate-600">{f.sector || '—'}</td>
                          <td className="px-4 py-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${f.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                              {f.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {invalidas.length > 0 && (
                <div className="mt-3 bg-red-50 rounded-xl p-3 text-xs text-red-500">
                  <p className="font-semibold mb-1">Filas con errores (se omitirán):</p>
                  {invalidas.map((f, i) => (
                    <p key={i}>Fila {i + 2}: {f.error}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Resultado */}
          {resultado && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 text-sm text-emerald-700 font-semibold">
              ✅ Importación completada: {resultado.ok} talleres guardados.
              {resultado.errores > 0 && <span className="text-red-500 ml-2">{resultado.errores} con errores.</span>}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 border-2 border-pink-200 text-pink-500 font-semibold py-2.5 rounded-xl hover:bg-pink-50 transition-colors">
              {resultado ? 'Cerrar' : 'Cancelar'}
            </button>
            {!resultado && (
              <button
                onClick={handleImportar}
                disabled={loading || validas.length === 0}
                className="flex-1 bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl transition-colors"
              >
                {loading ? 'Importando...' : `Importar ${validas.length} talleres`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalleresImportModal;
