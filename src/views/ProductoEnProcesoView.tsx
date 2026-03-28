import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';

interface LoteRow {
  id: string;
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

interface ProductoEnProcesoViewProps {
  user: User;
}

const toNum = (v: string) => parseFloat(v) || 0;

// TOTAL = SALIDA - (ENTREGA + SEGUNDAS + VTA + COBRADO + INCOMPLETO)
const calcTotal = (row: LoteRow): number => {
  const salida = toNum(row.salida);
  const suma = toNum(row.entrega) + toNum(row.segundas) + toNum(row.vta) + toNum(row.cobrado) + toNum(row.incompleto);
  return salida - suma;
};

const calcTalegosTotal = (row: LoteRow): number =>
  toNum(row.talegosSalida) - toNum(row.talegosEntrega);

const calcMuestrasTotal = (row: LoteRow): number =>
  toNum(row.muestrasSalida) - toNum(row.muestrasEntrega);

const calcRotacion = (row: LoteRow): string => {
  if (!row.fechaRemision || !row.fechaLlegada) return '';
  const d1 = new Date(row.fechaRemision).getTime();
  const d2 = new Date(row.fechaLlegada).getTime();
  if (isNaN(d1) || isNaN(d2)) return '';
  return String(Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
};

// > 0 = rojo, < 0 = amarillo, = 0 = verde
const totalColor = (total: number): string => {
  if (total === 0) return 'bg-green-100 text-green-800';
  if (total > 0) return 'bg-red-100 text-red-800';
  return 'bg-yellow-100 text-yellow-800';
};

const newRow = (): LoteRow => ({
  id: crypto.randomUUID(),
  confeccionista: '', remision: '', ref: '', salida: '',
  fechaRemision: '', entrega: '', segundas: '', vta: '',
  cobrado: '', incompleto: '', fechaLlegada: '',
  talegosSalida: '', talegosEntrega: '',
  muestrasSalida: '', muestrasEntrega: '',
});

const STORAGE_KEY = 'producto_en_proceso_rows';

const canEdit = (role: UserRole) =>
  role === UserRole.ADMIN || role === UserRole.GENERAL || role === UserRole.SOPORTE;

// Navegación entre celdas con flechas
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const current = e.currentTarget;
  const allInputs = Array.from(
    document.querySelectorAll<HTMLInputElement>('table input:not([disabled])')
  );
  const idx = allInputs.indexOf(current);

  if (e.key === 'ArrowRight' || e.key === 'Tab') {
    e.preventDefault();
    allInputs[idx + 1]?.focus();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    allInputs[idx - 1]?.focus();
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    const row = current.closest('tr');
    const cells = row ? Array.from(row.querySelectorAll<HTMLInputElement>('input')) : [];
    const colIdx = cells.indexOf(current);
    const nextRow = row?.nextElementSibling as HTMLElement | null;
    if (nextRow) {
      const nextCells = Array.from(nextRow.querySelectorAll<HTMLInputElement>('input'));
      nextCells[colIdx]?.focus();
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    const row = current.closest('tr');
    const cells = row ? Array.from(row.querySelectorAll<HTMLInputElement>('input')) : [];
    const colIdx = cells.indexOf(current);
    const prevRow = row?.previousElementSibling as HTMLElement | null;
    if (prevRow) {
      const prevCells = Array.from(prevRow.querySelectorAll<HTMLInputElement>('input'));
      prevCells[colIdx]?.focus();
    }
  } else if (e.key === 'Enter') {
    e.preventDefault();
    allInputs[idx + 1]?.focus();
  }
};

interface CellProps {
  value: string;
  onChange: (v: string) => void;
  type?: 'text' | 'number' | 'date';
  readOnly?: boolean;
  minWidth?: string;
  align?: 'left' | 'center';
}

const Cell: React.FC<CellProps> = ({ value, onChange, type = 'text', readOnly, minWidth = '80px', align = 'center' }) => {
  if (readOnly) {
    return (
      <div
        className={`px-2 py-1 text-xs font-semibold rounded ${align === 'center' ? 'text-center' : 'text-left'}`}
        style={{ minWidth }}
      >
        {value}
      </div>
    );
  }
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={e => e.target.select()}
      onKeyDown={handleKeyDown}
      // Evitar que las flechas cambien el número en inputs numéricos
      onWheel={type === 'number' ? e => (e.target as HTMLInputElement).blur() : undefined}
      className={`w-full px-1 py-0.5 text-xs border border-transparent hover:border-slate-300 focus:border-blue-400 focus:outline-none rounded bg-transparent focus:bg-white ${align === 'center' ? 'text-center' : 'text-left'}`}
      style={{ minWidth }}
    />
  );
};

const ProductoEnProcesoView: React.FC<ProductoEnProcesoViewProps> = ({ user }) => {
  const editable = canEdit(user.role);

  const [rows, setRows] = useState<LoteRow[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [newRow()];
  });

  // Filtros
  const [filterConfeccionista, setFilterConfeccionista] = useState('');
  const [filterRemision, setFilterRemision] = useState('');
  const [filterRef, setFilterRef] = useState('');
  const [filterSalida, setFilterSalida] = useState('');
  const [filterFechaRemisionMes, setFilterFechaRemisionMes] = useState('');
  const [filterFechaLlegadaMes, setFilterFechaLlegadaMes] = useState('');

  const clearFilters = () => {
    setFilterConfeccionista('');
    setFilterRemision('');
    setFilterRef('');
    setFilterSalida('');
    setFilterFechaRemisionMes('');
    setFilterFechaLlegadaMes('');
  };

  const hasFilters = filterConfeccionista || filterRemision || filterRef || filterSalida || filterFechaRemisionMes || filterFechaLlegadaMes;

  const filteredRows = rows.filter(row => {
    if (filterConfeccionista && !row.confeccionista.toLowerCase().includes(filterConfeccionista.toLowerCase())) return false;
    if (filterRemision && !row.remision.toLowerCase().includes(filterRemision.toLowerCase())) return false;
    if (filterRef && !row.ref.toLowerCase().includes(filterRef.toLowerCase())) return false;
    if (filterSalida && !row.salida.includes(filterSalida)) return false;
    if (filterFechaRemisionMes && row.fechaRemision) {
      const mes = row.fechaRemision.slice(5, 7);
      if (mes !== filterFechaRemisionMes) return false;
    } else if (filterFechaRemisionMes && !row.fechaRemision) return false;
    if (filterFechaLlegadaMes && row.fechaLlegada) {
      const mes = row.fechaLlegada.slice(5, 7);
      if (mes !== filterFechaLlegadaMes) return false;
    } else if (filterFechaLlegadaMes && !row.fechaLlegada) return false;
    return true;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }, [rows]);

  const updateRow = useCallback((id: string, field: keyof LoteRow, value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }, []);

  const addRow = () => setRows(prev => [...prev, newRow()]);

  const deleteRow = (id: string) => {
    if (rows.length === 1) { setRows([newRow()]); return; }
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const Th: React.FC<{ children: React.ReactNode; className?: string; colSpan?: number }> = ({ children, className = '', colSpan }) => (
    <th colSpan={colSpan} className={`px-2 py-1.5 text-xs font-bold text-center border border-slate-300 whitespace-nowrap ${className}`}>
      {children}
    </th>
  );

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Producto en Proceso</h2>
          <p className="text-slate-400 text-sm">Control de lotes enviados a confeccionistas</p>
        </div>
        {editable && (
          <div className="flex items-center gap-2">
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-xl transition-colors"
                title="Limpiar filtros"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar filtros
              </button>
            )}
            <button
              onClick={addRow}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Agregar fila
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="text-xs border-collapse" style={{ minWidth: '1500px' }}>
          <thead>
            <tr>
              <Th colSpan={12} className="bg-blue-700 text-white text-sm">LOTES - REFERENCIAS</Th>
              <Th colSpan={3} className="bg-emerald-700 text-white text-sm">TALEGOS</Th>
              <Th colSpan={3} className="bg-purple-700 text-white text-sm">MUESTRAS</Th>
              <Th className="bg-orange-700 text-white text-sm">ROTACIÓN</Th>
              {editable && <Th className="bg-slate-600 text-white text-sm"></Th>}
            </tr>
            <tr className="bg-slate-100">
              <Th className="bg-slate-200">CONFECCIONISTA</Th>
              <Th className="bg-slate-200">REMISIÓN</Th>
              <Th className="bg-slate-200">REF</Th>
              <Th className="bg-slate-200">SALIDA</Th>
              {/* Fecha remisión: azul suave */}
              <Th className="bg-blue-100 text-blue-800">FECHA REMISIÓN</Th>
              <Th className="bg-slate-200">ENTREGA</Th>
              <Th className="bg-slate-200">SEGUNDAS</Th>
              <Th className="bg-slate-200">VTA</Th>
              <Th className="bg-slate-200">COBRADO</Th>
              <Th className="bg-slate-200">INCOMPLETO</Th>
              <Th className="bg-slate-200">TOTAL</Th>
              {/* Fecha llegada: verde suave */}
              <Th className="bg-green-100 text-green-800">FECHA LLEGADA</Th>
              {/* Talegos */}
              <Th className="bg-emerald-50">SALIDA</Th>
              <Th className="bg-emerald-50">ENTREGA</Th>
              <Th className="bg-emerald-50">TOTAL</Th>
              {/* Muestras */}
              <Th className="bg-purple-50">SALIDA</Th>
              <Th className="bg-purple-50">ENTREGA</Th>
              <Th className="bg-purple-50">TOTAL</Th>
              {/* Rotación */}
              <Th className="bg-orange-50">DÍAS</Th>
              {editable && <Th className="bg-slate-100"></Th>}
            </tr>
            {/* Fila de filtros */}
            <tr className="bg-slate-50">
              {/* Confeccionista */}
              <th className="border border-slate-200 px-1 py-0.5">
                <input
                  type="text"
                  value={filterConfeccionista}
                  onChange={e => setFilterConfeccionista(e.target.value)}
                  placeholder="Filtrar..."
                  className="w-full px-1 py-0.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-400 bg-white"
                />
              </th>
              {/* Remisión */}
              <th className="border border-slate-200 px-1 py-0.5">
                <input
                  type="text"
                  value={filterRemision}
                  onChange={e => setFilterRemision(e.target.value)}
                  placeholder="Filtrar..."
                  className="w-full px-1 py-0.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-400 bg-white"
                />
              </th>
              {/* Ref */}
              <th className="border border-slate-200 px-1 py-0.5">
                <input
                  type="text"
                  value={filterRef}
                  onChange={e => setFilterRef(e.target.value)}
                  placeholder="Filtrar..."
                  className="w-full px-1 py-0.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-400 bg-white"
                />
              </th>
              {/* Salida */}
              <th className="border border-slate-200 px-1 py-0.5">
                <input
                  type="text"
                  value={filterSalida}
                  onChange={e => setFilterSalida(e.target.value)}
                  placeholder="Filtrar..."
                  className="w-full px-1 py-0.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-400 bg-white"
                />
              </th>
              {/* Fecha remisión - filtro por mes */}
              <th className="border border-slate-200 px-1 py-0.5 bg-blue-50">
                <select
                  value={filterFechaRemisionMes}
                  onChange={e => setFilterFechaRemisionMes(e.target.value)}
                  className="w-full px-1 py-0.5 text-xs border border-blue-300 rounded bg-white focus:outline-none"
                >
                  <option value="">Mes</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {new Date(2000, i).toLocaleString('es', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </th>
              {/* Entrega a Incompleto - sin filtro */}
              <th className="border border-slate-200"></th>
              <th className="border border-slate-200"></th>
              <th className="border border-slate-200"></th>
              <th className="border border-slate-200"></th>
              <th className="border border-slate-200"></th>
              {/* Total - sin filtro */}
              <th className="border border-slate-200"></th>
              {/* Fecha llegada - filtro por mes */}
              <th className="border border-slate-200 px-1 py-0.5 bg-green-50">
                <select
                  value={filterFechaLlegadaMes}
                  onChange={e => setFilterFechaLlegadaMes(e.target.value)}
                  className="w-full px-1 py-0.5 text-xs border border-green-300 rounded bg-white focus:outline-none"
                >
                  <option value="">Mes</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {new Date(2000, i).toLocaleString('es', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </th>
              {/* Talegos, Muestras, Rotación, Borrar - sin filtro */}
              <th className="border border-slate-200"></th>
              <th className="border border-slate-200"></th>
              <th className="border border-slate-200"></th>
              <th className="border border-slate-200"></th>
              <th className="border border-slate-200"></th>
              <th className="border border-slate-200"></th>
              <th className="border border-slate-200"></th>
              {editable && <th className="border border-slate-200"></th>}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, idx) => {
              const total = calcTotal(row);
              const tTotal = calcTalegosTotal(row);
              const mTotal = calcMuestrasTotal(row);
              const rotacion = calcRotacion(row);
              const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50';
              const hasData = row.salida !== '' || row.entrega !== '';

              return (
                <tr key={row.id} className={`${rowBg} hover:bg-blue-50 transition-colors`}>
                  <td className="border border-slate-200 px-1 py-0.5">
                    <Cell value={row.confeccionista} onChange={v => updateRow(row.id, 'confeccionista', v)} readOnly={!editable} minWidth="180px" align="left" />
                  </td>
                  <td className="border border-slate-200 px-1 py-0.5">
                    <Cell value={row.remision} onChange={v => updateRow(row.id, 'remision', v)} readOnly={!editable} minWidth="55px" />
                  </td>
                  <td className="border border-slate-200 px-1 py-0.5">
                    <Cell value={row.ref} onChange={v => updateRow(row.id, 'ref', v)} readOnly={!editable} minWidth="45px" />
                  </td>
                  <td className="border border-slate-200 px-1 py-0.5">
                    <Cell value={row.salida} onChange={v => updateRow(row.id, 'salida', v)} type="number" readOnly={!editable} minWidth="40px" />
                  </td>
                  {/* FECHA REMISIÓN - fondo azul suave */}
                  <td className="border border-slate-200 px-1 py-0.5 bg-blue-50">
                    <Cell value={row.fechaRemision} onChange={v => updateRow(row.id, 'fechaRemision', v)} type="date" readOnly={!editable} minWidth="120px" />
                  </td>
                  <td className="border border-slate-200 px-1 py-0.5">
                    <Cell value={row.entrega} onChange={v => updateRow(row.id, 'entrega', v)} type="number" readOnly={!editable} minWidth="45px" />
                  </td>
                  <td className="border border-slate-200 px-1 py-0.5">
                    <Cell value={row.segundas} onChange={v => updateRow(row.id, 'segundas', v)} type="number" readOnly={!editable} minWidth="45px" />
                  </td>
                  <td className="border border-slate-200 px-1 py-0.5">
                    <Cell value={row.vta} onChange={v => updateRow(row.id, 'vta', v)} type="number" readOnly={!editable} minWidth="45px" />
                  </td>
                  <td className="border border-slate-200 px-1 py-0.5">
                    <Cell value={row.cobrado} onChange={v => updateRow(row.id, 'cobrado', v)} type="number" readOnly={!editable} minWidth="45px" />
                  </td>
                  <td className="border border-slate-200 px-1 py-0.5">
                    <Cell value={row.incompleto} onChange={v => updateRow(row.id, 'incompleto', v)} type="number" readOnly={!editable} minWidth="45px" />
                  </td>
                  {/* TOTAL calculado */}
                  <td className="border border-slate-200 px-1 py-0.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${hasData ? totalColor(total) : ''}`}>
                      {hasData ? total : ''}
                    </span>
                  </td>
                  {/* FECHA LLEGADA - fondo verde suave */}
                  <td className="border border-slate-200 px-1 py-0.5 bg-green-50">
                    <Cell value={row.fechaLlegada} onChange={v => updateRow(row.id, 'fechaLlegada', v)} type="date" readOnly={!editable} minWidth="120px" />
                  </td>

                  {/* TALEGOS */}
                  <td className="border border-slate-200 px-1 py-0.5 bg-emerald-50/40">
                    <Cell value={row.talegosSalida} onChange={v => updateRow(row.id, 'talegosSalida', v)} type="number" readOnly={!editable} minWidth="40px" />
                  </td>
                  <td className="border border-slate-200 px-1 py-0.5 bg-emerald-50/40">
                    <Cell value={row.talegosEntrega} onChange={v => updateRow(row.id, 'talegosEntrega', v)} type="number" readOnly={!editable} minWidth="45px" />
                  </td>
                  <td className="border border-slate-200 px-1 py-0.5 bg-emerald-50/40 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${row.talegosSalida !== '' ? totalColor(tTotal) : ''}`}>
                      {row.talegosSalida !== '' ? tTotal : ''}
                    </span>
                  </td>

                  {/* MUESTRAS */}
                  <td className="border border-slate-200 px-1 py-0.5 bg-purple-50/40">
                    <Cell value={row.muestrasSalida} onChange={v => updateRow(row.id, 'muestrasSalida', v)} type="number" readOnly={!editable} minWidth="40px" />
                  </td>
                  <td className="border border-slate-200 px-1 py-0.5 bg-purple-50/40">
                    <Cell value={row.muestrasEntrega} onChange={v => updateRow(row.id, 'muestrasEntrega', v)} type="number" readOnly={!editable} minWidth="45px" />
                  </td>
                  <td className="border border-slate-200 px-1 py-0.5 bg-purple-50/40 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${row.muestrasSalida !== '' ? totalColor(mTotal) : ''}`}>
                      {row.muestrasSalida !== '' ? mTotal : ''}
                    </span>
                  </td>

                  {/* ROTACIÓN */}
                  <td className="border border-slate-200 px-1 py-0.5 bg-orange-50/40 text-center">
                    <span className="text-xs font-semibold text-slate-600">{rotacion}</span>
                  </td>

                  {editable && (
                    <td className="border border-slate-200 px-1 py-0.5 text-center">
                      <button
                        onClick={() => deleteRow(row.id)}
                        className="text-red-400 hover:text-red-600 transition-colors p-0.5"
                        title="Eliminar fila"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-100 border border-green-300 inline-block"></span> TOTAL = 0
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block"></span> TOTAL &gt; 0 (faltan unidades)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300 inline-block"></span> TOTAL &lt; 0 (exceso)
        </span>
      </div>
    </div>
  );
};

export default ProductoEnProcesoView;
