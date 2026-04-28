import React, { useState, useEffect, useRef, useMemo } from 'react';
import usePagination from '../hooks/usePagination';
import PaginationComponent from '../components/PaginationComponent';
import api from '../services/api';
import { User, UserRole } from '../types';
import SalidasBodegaImportModal, { ImportedSalidaBodega } from '../components/SalidasBodegaImportModal';
import { useDarkMode } from '../context/DarkModeContext';

// ── Tipos ──────────────────────────────────────────────────────────────────────
const TALLAS = ['2-4', '6-8', '10-12', '14-16', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as const;
type Talla = typeof TALLAS[number];

interface SalidaBodega {
  id: string;
  isNew?: boolean;
  fecha: string;
  referencia: string;
  descripcion: string;  // solo visual, no se guarda en BD
  cantidad: string;
  talla: Talla | '';
  quienRecibe: string;
  fechaDevolucion: string;
}

const newSalida = (): SalidaBodega => ({
  id: crypto.randomUUID(),
  isNew: true,
  fecha: new Date().toISOString().split('T')[0],
  referencia: '',
  descripcion: '',
  cantidad: '',
  talla: '',
  quienRecibe: '',
  fechaDevolucion: '',
});

// ── Permisos ───────────────────────────────────────────────────────────────────
const isAdminOrSoporte = (user: User) =>
  user.role === UserRole.ADMIN || user.role === UserRole.SOPORTE;

// ── FilterBar ─────────────────────────────────────────────────────────────────
const FilterBar: React.FC<{
  filterRef: string; setFilterRef: (v: string) => void;
  filterRecibe: string; setFilterRecibe: (v: string) => void;
  onClear: () => void;
  clrBtn: string; inputCls: string;
}> = ({ filterRef, setFilterRef, filterRecibe, setFilterRecibe, onClear, clrBtn, inputCls }) => (
  <div className="flex items-center gap-2">
    <button onClick={onClear}
      className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all flex-shrink-0 ${clrBtn}`}
      title="Limpiar filtros">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </button>
    <div className="relative">
      <input type="text" placeholder="Buscar referencia..." value={filterRef}
        onChange={e => setFilterRef(e.target.value)}
        className={`pl-8 pr-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 w-44 ${inputCls}`} />
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    </div>
    <div className="relative">
      <input type="text" placeholder="Buscar quien recibe..." value={filterRecibe}
        onChange={e => setFilterRecibe(e.target.value)}
        className={`pl-8 pr-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 w-48 ${inputCls}`} />
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    </div>
  </div>
);

// ── Vista principal ────────────────────────────────────────────────────────────
interface SalidasBodegaViewProps {
  user: User;
}

const SalidasBodegaView: React.FC<SalidasBodegaViewProps> = ({ user }) => {
  const [rows, setRows] = useState<SalidaBodega[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [filterRef, setFilterRef] = useState('');
  const [filterRecibe, setFilterRecibe] = useState('');
  const [references, setReferences] = useState<{ id: string; description: string }[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  // Rastrear qué filas tenían fechaDevolucion antes de editar (para detectar cambios)
  const prevDevolucionRef = useRef<Record<string, string>>({});
  const dirtyIds = useRef<Set<string>>(new Set());
  const { pagination, goToPage, setLimit } = usePagination(1, 30);

  const canAdminEdit = isAdminOrSoporte(user);
  const { isDark } = useDarkMode();

  // ── Paleta dark ──────────────────────────────────────────────────────────────
  const dk = {
    page:       isDark ? 'bg-[#3d2d52]'                    : '',
    title:      isDark ? 'text-violet-200'                  : 'text-slate-800',
    subtitle:   isDark ? 'text-violet-400'                  : 'text-slate-400',
    card:       isDark ? 'bg-[#4a3a63] border-violet-700'   : 'bg-white border-slate-100',
    thead:      isDark ? 'bg-[#5a4a75] border-violet-600'   : 'bg-indigo-50 border-indigo-200',
    thDivide:   isDark ? 'divide-violet-600'                : 'divide-indigo-200',
    th:         isDark ? 'text-violet-200'                  : 'text-indigo-400',
    rowEven:    isDark ? 'bg-[#3d2d52]'                     : 'bg-white',
    rowOdd:     isDark ? 'bg-[#4a3a5f]'                     : 'bg-indigo-50/20',
    rowDev:     isDark ? 'bg-[#5a3a70]/70'                  : 'bg-slate-100/90',
    rowHover:   isDark ? 'hover:bg-violet-700/40'           : 'hover:bg-indigo-50/40',
    rowDevHov:  isDark ? 'hover:bg-[#5a3a70]'               : 'hover:bg-slate-200/70',
    rowDivide:  isDark ? 'divide-violet-700/50'             : 'divide-slate-200',
    rowBorder:  isDark ? 'border-violet-700/40'             : 'border-slate-100',
    input:      isDark ? 'text-violet-100 placeholder-violet-600' : '',
    inputFocus: isDark ? 'focus:ring-violet-400'            : 'focus:ring-indigo-300',
    select:     isDark ? 'text-violet-100'                  : '',
    btnAdd:     isDark ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white',
    btnImport:  isDark ? 'bg-purple-700 hover:bg-purple-800 text-white' : 'bg-violet-600 hover:bg-violet-700 text-white',
    btnSave:    isDark ? 'bg-pink-600 hover:bg-pink-700 text-white'     : 'bg-blue-600 hover:bg-blue-700 text-white',
    btnSaveDis: isDark ? 'bg-violet-900/40 text-violet-700 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed',
    filterBtn:  isDark ? 'border-violet-700 bg-[#3d2d52] text-violet-300 hover:text-pink-400 hover:border-pink-600' : 'border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:border-red-200',
    filterInput:isDark ? 'border-violet-600 bg-[#3d2d52] text-violet-100 placeholder-violet-500 focus:ring-violet-400' : 'border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:ring-slate-300',
    legend:     isDark ? 'text-violet-400'                  : 'text-slate-400',
    legendBox:  isDark ? 'bg-violet-900/50 border-violet-600' : 'bg-slate-200 border-slate-300',
    delBtn:     isDark ? 'text-violet-700 hover:text-pink-400' : 'text-slate-300 hover:text-red-500',
    delBtnDis:  isDark ? 'text-violet-900/40 cursor-not-allowed' : 'text-slate-200 cursor-not-allowed',
    newRing:    isDark ? 'ring-violet-600'                  : 'ring-indigo-200',
    amber:      isDark ? 'text-pink-400'                    : 'text-amber-600',
    amberDot:   isDark ? 'bg-pink-500'                      : 'bg-amber-500',
    spinner:    isDark ? 'border-violet-500'                : 'border-indigo-400',
  };

  // Cargar datos de la BD
  useEffect(() => {
    api.getSalidasBodega().then(data => {
      const withDesc = data.map((r: any) => ({ ...r, descripcion: '', isNew: false }));
      const sorted = withDesc.sort((a: SalidaBodega, b: SalidaBodega) =>
        (b.fecha || '').localeCompare(a.fecha || '')
      );
      setRows(sorted);
      const snap: Record<string, string> = {};
      sorted.forEach((r: SalidaBodega) => { snap[r.id] = r.fechaDevolucion; });
      prevDevolucionRef.current = snap;
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Cargar referencias para autocompletar descripción
  useEffect(() => {
    api.getReferences().then(refs => {
      setReferences(refs.map(r => ({ id: r.id, description: r.description })));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (hasUnsaved) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [hasUnsaved]);

  // Mapa referencia → descripción (solo visual)
  const refDescMap = useMemo(() => {
    const map: Record<string, string> = {};
    references.forEach(r => { map[r.id.toLowerCase()] = r.description; });
    return map;
  }, [references]);

  // Enriquecer descripción cuando llegan las referencias
  useEffect(() => {
    if (references.length === 0) return;
    setRows(prev => prev.map(r => ({
      ...r,
      descripcion: refDescMap[r.referencia.toLowerCase()] || r.descripcion,
    })));
  }, [references]);

  const filtered = useMemo(() => rows.filter(r =>
    r.referencia.toLowerCase().includes(filterRef.toLowerCase()) &&
    r.quienRecibe.toLowerCase().includes(filterRecibe.toLowerCase())
  ), [rows, filterRef, filterRecibe]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pagination.limit));
  const page = Math.min(pagination.page, totalPages);
  const paged = filtered.slice((page - 1) * pagination.limit, page * pagination.limit);

  const updateRow = (id: string, field: keyof SalidaBodega, value: string) => {
    // Cantidad no editable en filas ya guardadas
    if (field === 'cantidad') {
      const row = rows.find(r => r.id === id);
      if (row && !row.isNew) return;
    }
    // Quitar fecha devolución solo admin/soporte
    if (field === 'fechaDevolucion' && value === '') {
      if (!canAdminEdit) {
        alert('Solo Admin o Soporte pueden quitar la fecha de devolución.');
        return;
      }
    }
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated: SalidaBodega = { ...r, [field]: value };
      if (field === 'referencia') {
        updated.descripcion = refDescMap[value.toLowerCase()] ?? r.descripcion;
      }
      dirtyIds.current.add(id);
      setHasUnsaved(true);
      return updated;
    }));
  };

  const addRow = () => {
    const r = newSalida();
    dirtyIds.current.add(r.id);
    prevDevolucionRef.current[r.id] = '';
    setRows(prev => [r, ...prev]);
    setHasUnsaved(true);
    goToPage(1);
  };

  const deleteRow = async (id: string) => {
    if (!canAdminEdit) {
      alert('Solo Admin o Soporte tienen permiso para eliminar registros.');
      return;
    }
    const row = rows.find(r => r.id === id);
    if (!row) return;

    // Si es nueva (no guardada aún), solo la quitamos del estado
    if (row.isNew) {
      setRows(prev => prev.filter(r => r.id !== id));
      dirtyIds.current.delete(id);
      delete prevDevolucionRef.current[id];
      return;
    }

    // Si ya está en BD, la eliminamos via API
    const result = await api.deleteSalidaBodega(id);
    if (result.success) {
      setRows(prev => prev.filter(r => r.id !== id));
      dirtyIds.current.delete(id);
      delete prevDevolucionRef.current[id];
    } else {
      alert('Error al eliminar: ' + (result.message || 'Error desconocido'));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dirty = rows.filter(r => dirtyIds.current.has(r.id));

      for (const row of dirty) {
        const payload = {
          fecha: row.fecha,
          referencia: row.referencia,
          cantidad: parseInt(row.cantidad) || 0,
          talla: row.talla,
          quienRecibe: row.quienRecibe,
          fechaDevolucion: row.fechaDevolucion || null,
        };

        if (row.isNew) {
          // Crear nueva salida
          const result = await api.createSalidaBodega(payload);
          if (result.success && result.data) {
            const saved = { ...result.data, descripcion: refDescMap[result.data.referencia?.toLowerCase()] || '', isNew: false };
            setRows(prev => prev.map(r => r.id === row.id ? { ...saved, id: result.data.id } : r));
          }
        } else {
          // Solo puede cambiar fechaDevolucion en filas existentes
          const prevDev = prevDevolucionRef.current[row.id] ?? '';
          if (row.fechaDevolucion !== prevDev) {
            await api.updateSalidaBodegaDevolucion(row.id, row.fechaDevolucion);
          }
        }
      }

      // Actualizar snapshot de fechas de devolución
      const snap: Record<string, string> = {};
      rows.forEach(r => { snap[r.id] = r.fechaDevolucion; });
      prevDevolucionRef.current = snap;

      // Marcar todas como no nuevas
      setRows(prev => prev.map(r => ({ ...r, isNew: false })));
      dirtyIds.current.clear();
      setHasUnsaved(false);
    } catch (e) {
      alert('Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async (imported: ImportedSalidaBodega[]) => {
    const newRows = imported.map(r => ({
      id: crypto.randomUUID(),
      isNew: true,
      fecha: r.fecha || new Date().toISOString().split('T')[0],
      referencia: r.referencia,
      descripcion: refDescMap[r.referencia.toLowerCase()] || '',
      cantidad: r.cantidad,
      talla: (TALLAS as readonly string[]).includes(r.talla) ? r.talla as Talla : '' as const,
      quienRecibe: r.quienRecibe,
      fechaDevolucion: r.fechaDevolucion,
    }));
    newRows.forEach(r => {
      dirtyIds.current.add(r.id);
      prevDevolucionRef.current[r.id] = r.fechaDevolucion;
    });
    setRows(prev => [...newRows, ...prev]);
    setHasUnsaved(true);
    goToPage(1);
  };

  const thCls = `px-3 py-3 text-xs font-black text-center ${dk.th} uppercase tracking-wider whitespace-nowrap`;
  const tdCls = 'px-3 py-2 text-[13px]';
  const inputCls = `w-full px-2 py-1 text-[13px] border-none outline-none bg-transparent focus:ring-1 focus:ring-inset ${dk.inputFocus} focus:rounded-sm ${dk.input}`;

  return (
    <div className={`space-y-4 pb-20 min-h-full transition-colors duration-300 ${dk.page}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className={`text-3xl font-black tracking-tighter ${dk.title}`}>Salidas de Bodega</h2>
          {hasUnsaved ? (
            <span className={`flex items-center gap-1.5 font-semibold text-sm ${dk.amber}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse inline-block ${dk.amberDot}`} />
              Cambios sin guardar
            </span>
          ) : (
            <p className={`font-medium text-sm ${dk.subtitle}`}>Registro de salidas de mercancía</p>
          )}
        </div>        <div className="flex items-center gap-3 flex-wrap">
          <FilterBar
            filterRef={filterRef} setFilterRef={setFilterRef}
            filterRecibe={filterRecibe} setFilterRecibe={setFilterRecibe}
            onClear={() => { setFilterRef(''); setFilterRecibe(''); }}
            clrBtn={dk.filterBtn}
            inputCls={dk.filterInput}
          />
          <button onClick={addRow}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-sm ${dk.btnAdd}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Agregar salida
          </button>
          {/* Importar Excel — solo Soporte */}
          {user.role === UserRole.SOPORTE && (
            <button onClick={() => setImportOpen(true)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-sm ${dk.btnImport}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Importar Excel
            </button>
          )}
          <button onClick={handleSave} disabled={!hasUnsaved || saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-sm ${
              hasUnsaved ? dk.btnSave : dk.btnSaveDis
            }`}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className={`w-8 h-8 border-4 border-t-transparent rounded-full animate-spin ${dk.spinner}`} />
        </div>
      ) : (
        <div className={`rounded-3xl shadow-sm border overflow-hidden ${dk.card}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col style={{ width: '110px' }} />{/* Fecha */}
              <col style={{ width: '110px' }} />{/* Referencia */}
              <col style={{ width: '220px' }} />{/* Descripción */}
              <col style={{ width: '80px' }}  />{/* Cantidad */}
              <col style={{ width: '100px' }} />{/* Talla */}
              <col style={{ width: '160px' }} />{/* Quien recibe */}
              <col style={{ width: '130px' }} />{/* Fecha devolución */}
              <col style={{ width: '36px' }}  />{/* Eliminar */}
            </colgroup>
            <thead>
              <tr className={`border-b ${dk.thead} ${dk.thDivide} divide-x`}>
                {['Fecha', 'Referencia', 'Descripción', 'Cantidad', 'Talla', 'Quien recibe', 'Fecha devolución', ''].map(h => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((row, i) => {
                const devuelta = Boolean(row.fechaDevolucion);
                const rowBg = devuelta
                  ? `${dk.rowDev} ${dk.rowDevHov}`
                  : `${i % 2 === 0 ? dk.rowEven : dk.rowOdd} ${dk.rowHover}`;

                return (
                  <tr key={row.id}
                    className={`border-b ${dk.rowBorder} divide-x ${dk.rowDivide} transition-colors ${rowBg} ${row.isNew ? `ring-1 ring-inset ${dk.newRing}` : ''}`}>

                    {/* Fecha */}
                    <td className={tdCls}>
                      <input className={inputCls} type="date" value={row.fecha}
                        onChange={e => updateRow(row.id, 'fecha', e.target.value)} />
                    </td>

                    {/* Referencia */}
                    <td className={`${tdCls} text-center`}>
                      <input
                        className={`${inputCls} text-center uppercase`}
                        style={{ fontFamily: "'Trebuchet MS', 'Gill Sans', 'Calibri', sans-serif" }}
                        value={row.referencia}
                        onChange={e => updateRow(row.id, 'referencia', e.target.value)}
                        placeholder="Ref..."
                        list={`refs-${row.id}`}
                        readOnly={!row.isNew}
                      />
                      {row.isNew && (
                        <datalist id={`refs-${row.id}`}>
                          {references.map(r => (
                            <option key={r.id} value={r.id}>{r.description}</option>
                          ))}
                        </datalist>
                      )}
                    </td>

                    {/* Descripción — solo lectura, autocompletada */}
                    <td className={`${tdCls} ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>
                      <span className="block w-full px-2 py-1 text-[13px] truncate">
                        {row.descripcion || <span className={`italic ${isDark ? 'text-violet-800' : 'text-slate-300'}`}>—</span>}
                      </span>
                    </td>

                    {/* Cantidad — solo editable en filas nuevas */}
                    <td className={tdCls}>
                      <input
                        className={`${inputCls} text-center ${!row.isNew ? `pointer-events-none ${isDark ? 'text-violet-600' : 'text-slate-500'}` : ''}`}
                        type="number" min="0"
                        value={row.cantidad}
                        onChange={e => updateRow(row.id, 'cantidad', e.target.value)}
                        readOnly={!row.isNew}
                        placeholder="0"
                      />
                    </td>

                    {/* Talla */}
                    <td className={`${tdCls} text-center`}>
                      <select
                        value={row.talla}
                        onChange={e => updateRow(row.id, 'talla', e.target.value)}
                        className={`w-full px-2 py-1 text-[13px] border-none outline-none bg-transparent focus:ring-1 focus:ring-inset ${dk.inputFocus} focus:rounded-sm cursor-pointer text-center ${dk.select}`}>
                        <option value="" className={isDark ? 'bg-[#1a1025]' : ''}>—</option>
                        {TALLAS.map(t => <option key={t} value={t} className={isDark ? 'bg-[#1a1025]' : ''}>{t}</option>)}
                      </select>
                    </td>

                    {/* Quien recibe */}
                    <td className={tdCls}>
                      <input className={inputCls} value={row.quienRecibe}
                        onChange={e => updateRow(row.id, 'quienRecibe', e.target.value)}
                        placeholder="Nombre..." />
                    </td>

                    {/* Fecha devolución */}
                    <td className={tdCls}>
                      <input
                        className={inputCls}
                        type="date"
                        value={row.fechaDevolucion}
                        onChange={e => updateRow(row.id, 'fechaDevolucion', e.target.value)}
                      />
                    </td>

                    {/* Eliminar */}
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => deleteRow(row.id)}
                        className={`transition-colors ${canAdminEdit ? dk.delBtn : dk.delBtnDis}`}
                        title={canAdminEdit ? 'Eliminar' : 'Solo Admin puede eliminar'}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={8} className={`px-4 py-12 text-center font-medium ${isDark ? 'text-violet-700' : 'text-slate-400'}`}>
                    Sin registros. Presiona "Agregar salida" para comenzar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      <div className={`flex items-center gap-2 text-xs ${dk.legend}`}>
        <span className={`inline-block w-3 h-3 rounded-sm border ${dk.legendBox}`} />
        Fila oscura = mercancía devuelta a bodega
      </div>

      <PaginationComponent
        currentPage={page} totalPages={totalPages}
        onPageChange={goToPage} totalItems={filtered.length} itemsPerPage={pagination.limit}
        pageSize={pagination.limit} onPageSizeChange={size => { setLimit(size); goToPage(1); }}
      />

      <SalidasBodegaImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
};

export default SalidasBodegaView;
