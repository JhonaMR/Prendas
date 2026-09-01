import React from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import { PagoDia, Descuento } from '../../views/ProgramacionPagosDiaView';

interface PagoDetalleModalProps {
  seleccionado: PagoDia;
  fechaContexto?: string; // Fecha en la que estamos parados, por si seleccionado.fecha no existe (o no usarlo)
  onClose: () => void;
  onEdit?: (pago: PagoDia) => void;
  onMove?: (pago: PagoDia) => void;
  onDelete?: (pago: PagoDia) => void;
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function labelFecha(f: string) {
  if (!f) return '';
  const [y, m, d] = f.split('-');
  return `${parseInt(d)} de ${MESES[parseInt(m) - 1]} de ${y}`;
}

const sumarDs = (ds: Descuento[]) => ds.reduce((a, d) => {
  const m = d.monto || 0;
  return d.tipo === 'suma' ? a - m : a + m; // 'resta' (default) descuenta, 'suma' suma
}, 0);
const neto = (bruto: number, ds: Descuento[]) => bruto - sumarDs(ds);
const fmt = (n: number) => n === 0 ? '-' : `$${n.toLocaleString('es-CR')}`;

const buildDetalle = (p: PagoDia) => {
  const partes = [p.detalleInicial,
    ...p.descuentosOF.map(d => d.etiqueta).filter(Boolean),
    ...p.descuentosML.map(d => d.etiqueta).filter(Boolean),
  ].filter(Boolean);
  return partes.join(' / ');
};

const PagoDetalleModal: React.FC<PagoDetalleModalProps> = ({ 
  seleccionado, 
  fechaContexto,
  onClose, 
  onEdit, 
  onMove, 
  onDelete 
}) => {
  const { isDark } = useDarkMode();
  
  // Usar la fecha del pago (si viene de búsqueda global) o la fecha del contexto (si estamos en el día)
  const fechaMostrar = (seleccionado as any).fecha || fechaContexto;

  return (
    <div className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-colors duration-300 ${isDark ? 'bg-black/50' : 'bg-black/40'}`} onClick={onClose}>
      <div className={`rounded-3xl shadow-2xl w-full max-w-lg p-8 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
        {/* Encabezado */}
        <div className="mb-5">
          <div className="flex items-start justify-between">
            <div>
              {fechaMostrar && (
                <p className={`text-sm mb-1 font-bold transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-violet-500'}`}>
                  {labelFecha(fechaMostrar)}
                </p>
              )}
              <h2 className={`text-2xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-violet-900'}`}>{seleccionado.nombre}</h2>
              <p className={`text-sm mt-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>{seleccionado.cedula} · {seleccionado.cuenta}</p>
              {seleccionado.fechaOriginal && (
                <span className={`text-xs font-semibold px-3 py-1 rounded-full mt-2 inline-block transition-colors duration-300 ${isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                  Traído del {labelFecha(seleccionado.fechaOriginal)}
                </span>
              )}
            </div>
            <button onClick={onClose} className={`transition-colors duration-300 ml-4 flex-shrink-0 ${isDark ? 'text-violet-400 hover:text-violet-200' : 'text-slate-400 hover:text-slate-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* OF */}
        {seleccionado.brutOF > 0 && (
          <div className={`rounded-2xl p-4 mb-3 transition-colors duration-300 ${isDark ? 'bg-violet-900/20' : 'bg-violet-50'}`}>
            <p className={`font-bold text-sm mb-2 text-center transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-violet-700'}`}>Pago OF</p>
            <div className={`flex justify-between text-sm mb-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>
              <span>Valor Bruto</span><span className={`font-semibold transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>{fmt(seleccionado.brutOF)}</span>
            </div>
            {seleccionado.descuentosOF.map(d => (
              <div key={d.id} className={`flex justify-between text-sm mb-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>
                <span>{d.tipo === 'suma' ? '+' : '-'} {d.etiqueta || 'Descuento'}</span>
                <span className={`transition-colors duration-300 ${d.tipo === 'suma' ? isDark ? 'text-green-400' : 'text-green-600' : isDark ? 'text-red-400' : 'text-red-400'}`}>
                  {d.tipo === 'suma' ? '+' : '-'}{fmt(d.monto)}
                </span>
              </div>
            ))}
            <div className={`flex justify-between text-sm font-bold pt-2 mt-2 border-t transition-colors duration-300 ${isDark ? 'border-violet-700 text-emerald-400' : 'border-violet-200 text-emerald-700'}`}>
              <span>Neto OF</span><span>{fmt(neto(seleccionado.brutOF, seleccionado.descuentosOF))}</span>
            </div>
          </div>
        )}

        {/* ML */}
        {seleccionado.brutML > 0 && (
          <div className={`rounded-2xl p-4 mb-3 transition-colors duration-300 ${isDark ? 'bg-pink-900/20' : 'bg-pink-50'}`}>
            <p className={`font-bold text-sm mb-2 text-center transition-colors duration-300 ${isDark ? 'text-pink-200' : 'text-pink-700'}`}>Pago ML</p>
            <div className={`flex justify-between text-sm mb-1 transition-colors duration-300 ${isDark ? 'text-pink-300' : 'text-slate-600'}`}>
              <span>Valor Bruto</span><span className={`font-semibold transition-colors duration-300 ${isDark ? 'text-pink-200' : 'text-slate-700'}`}>{fmt(seleccionado.brutML)}</span>
            </div>
            {seleccionado.descuentosML.map(d => (
              <div key={d.id} className={`flex justify-between text-sm mb-1 transition-colors duration-300 ${isDark ? 'text-pink-400' : 'text-slate-500'}`}>
                <span>{d.tipo === 'suma' ? '+' : '-'} {d.etiqueta || 'Descuento'}</span>
                <span className={`transition-colors duration-300 ${d.tipo === 'suma' ? isDark ? 'text-green-400' : 'text-green-600' : isDark ? 'text-red-400' : 'text-red-400'}`}>
                  {d.tipo === 'suma' ? '+' : '-'}{fmt(d.monto)}
                </span>
              </div>
            ))}
            <div className={`flex justify-between text-sm font-bold pt-2 mt-2 border-t transition-colors duration-300 ${isDark ? 'border-pink-700 text-emerald-400' : 'border-pink-200 text-emerald-700'}`}>
              <span>Neto ML</span><span>{fmt(neto(seleccionado.brutML, seleccionado.descuentosML))}</span>
            </div>
          </div>
        )}

        {/* Detalle */}
        {seleccionado.detalleInicial && (
          <div className={`rounded-2xl p-4 mb-5 transition-colors duration-300 ${isDark ? 'bg-slate-900/20' : 'bg-slate-50'}`}>
            <p className={`text-xs font-semibold mb-1 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Detalle</p>
            <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{buildDetalle(seleccionado)}</p>
          </div>
        )}

        <div className="flex gap-3">
          {onEdit && (
            <button onClick={() => { onClose(); onEdit(seleccionado); }}
              className={`flex-1 font-semibold py-2.5 rounded-xl transition-all transition-colors duration-300 border-2 ${isDark ? 'border-violet-600 text-violet-300 hover:bg-violet-900/40' : 'border-violet-200 text-violet-500 hover:bg-violet-50'}`}>
              Editar
            </button>
          )}
          {onMove && (
            <button onClick={() => { onClose(); onMove(seleccionado); }}
              className={`flex-1 font-semibold py-2.5 rounded-xl transition-all transition-colors duration-300 border-2 ${isDark ? 'border-amber-600 text-amber-300 hover:bg-amber-900/40' : 'border-amber-200 text-amber-500 hover:bg-amber-50'}`}>
              Mover
            </button>
          )}
          {onDelete && (
            <button onClick={() => { onClose(); onDelete(seleccionado); }}
              className={`flex-1 font-semibold py-2.5 rounded-xl transition-all transition-colors duration-300 border-2 ${isDark ? 'border-red-600 text-red-300 hover:bg-red-900/40' : 'border-red-200 text-red-400 hover:bg-red-50'}`}>
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PagoDetalleModal;
