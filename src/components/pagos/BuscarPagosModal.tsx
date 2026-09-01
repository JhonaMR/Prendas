import React, { useState } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import api from '../../services/api';
import { PagoDia } from '../../views/ProgramacionPagosDiaView';
import PagoDetalleModal from './PagoDetalleModal';

interface BuscarPagosModalProps {
  onClose: () => void;
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function labelFecha(f: string) {
  if (!f) return '';
  const [y, m, d] = f.split('-');
  return `${parseInt(d)} de ${MESES[parseInt(m) - 1]} de ${y}`;
}

const sumarDs = (ds: any[]) => ds.reduce((a, d) => {
  const m = d.monto || 0;
  return d.tipo === 'suma' ? a - m : a + m;
}, 0);
const neto = (bruto: number, ds: any[]) => bruto - sumarDs(ds);
const fmt = (n: number) => n === 0 ? '-' : `$${n.toLocaleString('es-CR')}`;

const BuscarPagosModal: React.FC<BuscarPagosModalProps> = ({ onClose }) => {
  const { isDark } = useDarkMode();
  const [qDetalle, setQDetalle] = useState('');
  const [qNombre, setQNombre] = useState('');
  const [resultados, setResultados] = useState<PagoDia[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [seleccionado, setSeleccionado] = useState<PagoDia | null>(null);

  const handleSearch = async () => {
    if (!qDetalle.trim() && !qNombre.trim()) return;
    setLoading(true);
    setExpanded(false);
    try {
      const data = await api.searchPagos(qDetalle.trim(), qNombre.trim());
      // Mapear snake_case si hace falta (el backend devuelve camel/snake mixto)
      const mapped = data.map((p: any) => ({
        id: p.id,
        fecha: p.fecha,
        cedula: p.cedula,
        nombre: p.nombre,
        cuenta: p.cuenta,
        detalleInicial: p.detalle_inicial || '',
        brutOF: parseFloat(p.bruto_of) || 0,
        brutML: parseFloat(p.bruto_ml) || 0,
        descuentosOF: (p.descuentosOF || []).map((d: any) => ({ id: d.id, etiqueta: d.etiqueta, monto: parseFloat(d.monto), tipo: d.tipo })),
        descuentosML: (p.descuentosML || []).map((d: any) => ({ id: d.id, etiqueta: d.etiqueta, monto: parseFloat(d.monto), tipo: d.tipo })),
        orden: p.orden,
        fechaOriginal: p.fecha_original || undefined,
      }));
      setResultados(mapped);
      setSearched(true);
    } catch (error) {
      console.error('Error buscando pagos', error);
    } finally {
      setLoading(false);
    }
  };

  const visibleResults = expanded ? resultados : resultados.slice(0, 5);

  return (
    <>
      <div className={`fixed inset-0 backdrop-blur-md flex items-center justify-center z-40 p-4 transition-colors duration-300 ${isDark ? 'bg-black/60' : 'bg-slate-900/40'}`} onClick={onClose}>
        <div className={`rounded-3xl shadow-2xl w-full max-w-4xl p-6 md:p-8 max-h-[90vh] flex flex-col transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
          
          {/* Cabecera del modal */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-violet-900'}`}>Buscar Pagos</h2>
              <p className={`text-sm mt-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>Encuentra pagos realizados en cualquier fecha</p>
            </div>
            <button onClick={onClose} className={`p-2 rounded-full transition-colors duration-300 ${isDark ? 'text-violet-400 hover:bg-violet-900/50 hover:text-violet-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Buscadores */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <label className={`block text-xs font-bold mb-1 ml-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>Por Referencia / Detalle</label>
              <input
                type="text"
                placeholder="Ej. 10210"
                value={qDetalle}
                onChange={e => setQDetalle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className={`w-full border-2 rounded-2xl px-4 py-3 focus:outline-none transition-all transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-600 text-violet-100 focus:border-violet-400' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-violet-500'}`}
              />
            </div>
            <div className="flex-1 relative">
              <label className={`block text-xs font-bold mb-1 ml-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>Por Nombre (Confeccionista, Empleado)</label>
              <input
                type="text"
                placeholder="Ej. Juan Perez"
                value={qNombre}
                onChange={e => setQNombre(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className={`w-full border-2 rounded-2xl px-4 py-3 focus:outline-none transition-all transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-600 text-violet-100 focus:border-violet-400' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-violet-500'}`}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading || (!qDetalle.trim() && !qNombre.trim())}
                className={`h-[52px] px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all transition-colors duration-300 ${loading || (!qDetalle.trim() && !qNombre.trim()) ? isDark ? 'bg-violet-900/50 text-violet-400 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed' : isDark ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg' : 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200'}`}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {/* Resultados */}
          <div className="flex-1 overflow-auto rounded-2xl">
            {!searched && !loading && (
              <div className={`h-40 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors duration-300 ${isDark ? 'border-violet-800 bg-violet-900/10' : 'border-slate-200 bg-slate-50'}`}>
                <p className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Usa los campos de arriba para buscar pagos</p>
              </div>
            )}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className={`w-8 h-8 rounded-full border-4 border-t-transparent animate-spin ${isDark ? 'border-violet-500' : 'border-violet-600'}`}></div>
              </div>
            )}
            {searched && !loading && resultados.length === 0 && (
              <div className={`h-40 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors duration-300 ${isDark ? 'border-violet-800 bg-violet-900/10 text-violet-300' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                <p className="font-semibold text-lg">No se encontraron pagos</p>
                <p className="text-sm mt-1">Prueba con otros términos de búsqueda</p>
              </div>
            )}
            {searched && !loading && resultados.length > 0 && (
              <div className="flex flex-col gap-3 pb-4">
                {visibleResults.map(p => {
                  const netoOF = neto(p.brutOF, p.descuentosOF);
                  const netoML = neto(p.brutML, p.descuentosML);
                  
                  return (
                    <div 
                      key={p.id}
                      onClick={() => setSeleccionado(p)}
                      className={`group cursor-pointer rounded-2xl p-4 border-2 transition-all transition-colors duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isDark ? 'bg-[#4a3a63] border-violet-700 hover:border-violet-500 hover:bg-[#5a4a75]' : 'bg-white border-slate-100 hover:border-violet-300 hover:shadow-md'}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold px-2 py-1 rounded-lg transition-colors duration-300 ${isDark ? 'bg-violet-900/50 text-violet-300' : 'bg-slate-100 text-slate-600'}`}>
                            {(p as any).fecha ? labelFecha((p as any).fecha) : 'Sin fecha'}
                          </span>
                          <span className={`text-sm font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>
                            {p.nombre}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>
                          <span className="font-mono bg-black/5 px-1 rounded">{p.cuenta}</span>
                          {p.detalleInicial && ` · Ref: ${p.detalleInicial}`}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {netoOF > 0 && (
                          <div className={`text-right px-3 py-1.5 rounded-xl transition-colors duration-300 ${isDark ? 'bg-orange-900/20 border border-orange-900/50' : 'bg-orange-50 border border-orange-100'}`}>
                            <p className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Neto OF</p>
                            <p className={`font-black text-sm transition-colors duration-300 ${isDark ? 'text-orange-200' : 'text-orange-700'}`}>{fmt(netoOF)}</p>
                          </div>
                        )}
                        {netoML > 0 && (
                          <div className={`text-right px-3 py-1.5 rounded-xl transition-colors duration-300 ${isDark ? 'bg-blue-900/20 border border-blue-900/50' : 'bg-blue-50 border border-blue-100'}`}>
                            <p className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Neto ML</p>
                            <p className={`font-black text-sm transition-colors duration-300 ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>{fmt(netoML)}</p>
                          </div>
                        )}
                        <div className={`pl-2 transition-colors duration-300 ${isDark ? 'text-violet-500 group-hover:text-violet-300' : 'text-slate-300 group-hover:text-violet-500'}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {!expanded && resultados.length > 5 && (
                  <button 
                    onClick={() => setExpanded(true)}
                    className={`mt-2 py-3 w-full rounded-2xl font-bold text-sm border-2 border-dashed transition-all transition-colors duration-300 ${isDark ? 'border-violet-700 text-violet-300 hover:bg-violet-900/30 hover:border-violet-500' : 'border-violet-200 text-violet-600 hover:bg-violet-50 hover:border-violet-400'}`}
                  >
                    Hay {resultados.length - 5} resultados más... Clic aquí para expandir y ver todos
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {seleccionado && (
        <PagoDetalleModal
          seleccionado={seleccionado}
          onClose={() => setSeleccionado(null)}
          // No pasamos onEdit, onDelete, ni onMove porque desde la vista global 
          // podría ser peligroso o complejo actualizar la lista del día. 
          // Solo funciona en modo "Visualización".
        />
      )}
    </>
  );
};

export default BuscarPagosModal;
