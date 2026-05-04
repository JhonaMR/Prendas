import React, { useState, useEffect, useRef, useMemo } from 'react';
import usePagination from '../hooks/usePagination';
import PaginationComponent from '../components/PaginationComponent';
import api from '../services/api';
import { User, UserRole } from '../types';
import { ControlTelasProduccionImportModal, ControlTelasMuestrasImportModal } from '../components/ControlTelasImportModal';
import type { ImportedTelaProduccion, ImportedTelaMuestra } from '../components/ControlTelasImportModal';
import TextAutocomplete from '../components/TextAutocomplete';
import { useDarkMode } from '../context/DarkModeContext';

// ── Tipos ──────────────────────────────────────────────────────────────────────
type ViewType = 'selector' | 'produccion' | 'muestras';

interface TelaProduccion {
  id: string; isNew?: boolean;
  tela: string; color: string; undMedida: string; rdmto: string;
  subtotal: string; iva: string; precioTotalKilos: string; precioTotalMetros: string;
  proveedor: string; fechaCompra: string; ivaIncluido: string; feOrRm: string;
}

interface TelaMuestra {
  id: string; isNew?: boolean;
  tela: string; color: string; undMedida: string; rdmto: string;
  subtotal: string; iva: string; totalPrecioKilos: string; totalPrecioMetros: string;
  proveedor: string; fechaCompra: string; facturaNo: string;
  solicitaRecibe: string; usadaEnProduccion: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const IVA = 0.19;

function calcProduccion(row: TelaProduccion): TelaProduccion {
  const neto = parseFloat(row.subtotal) || 0;
  if (!neto) return { ...row, iva: '', precioTotalKilos: '', precioTotalMetros: '' };
  
  // Si IVA no está incluido, no calcular IVA
  const shouldCalculateIva = row.ivaIncluido === 'S';
  const iva = shouldCalculateIva ? parseFloat((neto * IVA).toFixed(2)) : 0;
  const totalKilos = parseFloat((neto + iva).toFixed(2));
  const rdmto = parseFloat(row.rdmto) || 0;
  const totalMetros = rdmto > 0 ? parseFloat((totalKilos / rdmto).toFixed(2)) : 0;
  
  if (row.undMedida === 'M') {
    return { 
      ...row, 
      iva: shouldCalculateIva ? String(iva) : '', 
      precioTotalKilos: '', 
      precioTotalMetros: String(neto + iva) 
    };
  }
  return {
    ...row, 
    iva: shouldCalculateIva ? String(iva) : '',
    precioTotalKilos: String(totalKilos),
    precioTotalMetros: rdmto > 0 ? String(totalMetros) : '',
  };
}

function calcMuestra(row: TelaMuestra): TelaMuestra {
  const neto = parseFloat(row.subtotal) || 0;
  if (!neto) return { ...row, iva: '', totalPrecioKilos: '', totalPrecioMetros: '' };
  
  // Muestras siempre calcula con IVA
  const iva = parseFloat((neto * IVA).toFixed(2));
  const totalKilos = parseFloat((neto + iva).toFixed(2));
  const rdmto = parseFloat(row.rdmto) || 0;
  const totalMetros = rdmto > 0 ? parseFloat((totalKilos / rdmto).toFixed(2)) : 0;
  
  if (row.undMedida === 'M') {
    return { 
      ...row, 
      iva: String(iva), 
      totalPrecioKilos: '', 
      totalPrecioMetros: String(neto + iva) 
    };
  }
  return {
    ...row, 
    iva: String(iva),
    totalPrecioKilos: String(totalKilos),
    totalPrecioMetros: rdmto > 0 ? String(totalMetros) : '',
  };
}

const newProduccion = (): TelaProduccion => ({
  id: crypto.randomUUID(), isNew: true,
  tela: '', color: '', undMedida: 'M', rdmto: '',
  subtotal: '', iva: '', precioTotalKilos: '', precioTotalMetros: '',
  proveedor: '', fechaCompra: '', ivaIncluido: 'S', feOrRm: '',
});

const newMuestra = (): TelaMuestra => ({
  id: crypto.randomUUID(), isNew: true,
  tela: '', color: '', undMedida: 'M', rdmto: '',
  subtotal: '', iva: '', totalPrecioKilos: '', totalPrecioMetros: '',
  proveedor: '', fechaCompra: '', facturaNo: '', solicitaRecibe: '', usadaEnProduccion: '',
});

const fmt = (v: string) => {
  const n = parseFloat(v);
  return n > 0 ? `$${Math.ceil(n).toLocaleString('es-CO')}` : '—';
};

// ── Componentes compartidos ────────────────────────────────────────────────────
const UndBadge = ({ u, isDark = false }: { u: string; isDark?: boolean }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${u === 'K' ? isDark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700' : isDark ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>{u}</span>
);

const FilterBar: React.FC<{
  filterTela: string; setFilterTela: (v: string) => void;
  filterProveedor: string; setFilterProveedor: (v: string) => void;
  onClear: () => void;
  isDark?: boolean;
}> = ({ filterTela, setFilterTela, filterProveedor, setFilterProveedor, onClear, isDark = false }) => (
  <div className="flex items-center gap-2">
    <button onClick={onClear} className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all flex-shrink-0 ${isDark ? 'border-violet-600 bg-[#3d2d52] text-violet-400 hover:text-red-400 hover:border-red-600' : 'border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:border-red-200'}`} title="Limpiar filtros">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </button>
    <div className="relative">
      <input type="text" placeholder="Buscar tela..." value={filterTela} onChange={e => setFilterTela(e.target.value)}
        className={`pl-8 pr-3 py-2 rounded-xl border text-sm transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-400' : 'border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300'} w-44`} />
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-violet-500' : 'text-slate-400'}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    </div>
    <div className="relative">
      <input type="text" placeholder="Buscar proveedor..." value={filterProveedor} onChange={e => setFilterProveedor(e.target.value)}
        className={`pl-8 pr-3 py-2 rounded-xl border text-sm transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-400' : 'border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300'} w-48`} />
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-violet-500' : 'text-slate-400'}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    </div>
  </div>
);

// ── Toggle pills ───────────────────────────────────────────────────────────────
const UndToggle: React.FC<{ value: string; onChange: (v: string) => void; isDark?: boolean }> = ({ value, onChange, isDark = false }) => (
  <div className={`flex rounded-full overflow-hidden border w-fit mx-auto transition-colors ${isDark ? 'border-violet-600' : 'border-slate-200'}`}>
    {(['M','K'] as const).map(opt => (
      <button key={opt} type="button" onClick={() => onChange(opt)}
        className={`px-3 py-0.5 text-xs font-bold transition-all ${
          value === opt
            ? opt === 'K' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
            : isDark ? 'bg-[#3d2d52] text-violet-400 hover:text-violet-300' : 'bg-white text-slate-400 hover:text-slate-600'
        }`}>
        {opt}
      </button>
    ))}
  </div>
);

const IvaToggle: React.FC<{ value: string; onChange: (v: string) => void; isDark?: boolean }> = ({ value, onChange, isDark = false }) => (
  <div className={`flex rounded-full overflow-hidden border w-fit mx-auto transition-colors ${isDark ? 'border-violet-600' : 'border-slate-200'}`}>
    {(['S','N'] as const).map(opt => (
      <button key={opt} type="button" onClick={() => onChange(opt)}
        className={`px-2.5 py-0.5 text-xs font-bold transition-all ${
          value === opt
            ? opt === 'S' ? 'bg-green-500 text-white' : 'bg-red-400 text-white'
            : isDark ? 'bg-[#3d2d52] text-violet-400 hover:text-violet-300' : 'bg-white text-slate-400 hover:text-slate-600'
        }`}>
        {opt === 'S' ? 'SI' : 'NO'}
      </button>
    ))}
  </div>
);

// Input de Neto: muestra formateado en reposo, número al editar
const NetoInput: React.FC<{ value: string; onChange: (v: string) => void; cls: string }> = ({ value, onChange, cls }) => {
  const [focused, setFocused] = React.useState(false);
  const n = parseFloat(value);
  const display = !focused && n > 0 ? `$${Math.ceil(n).toLocaleString('es-CO')}` : value;
  return (
    <input
      className={cls + ' text-right'}
      type={focused ? 'number' : 'text'}
      value={display}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={e => onChange(e.target.value)}
    />
  );
};


const TelaProduccionTable: React.FC<{ onBack: () => void; user: User }> = ({ onBack, user }) => {
  const { isDark } = useDarkMode();
  const [rows, setRows] = useState<TelaProduccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const dirtyIds = useRef<Set<string>>(new Set());
  const [importOpen, setImportOpen] = useState(false);
  const [filterTela, setFilterTela] = useState('');
  const [filterProveedor, setFilterProveedor] = useState('');
  const { pagination, goToPage, setLimit } = usePagination(1, 30);

  const canEdit = user.role === UserRole.ADMIN || user.role === UserRole.SOPORTE || user.role === UserRole.OPERADOR;

  useEffect(() => {
    api.getControlTelasProduccion().then(data => {
      const sorted = (data.length > 0 ? data : []).sort((a: TelaProduccion, b: TelaProduccion) => {
        const da = a.fechaCompra ? new Date(a.fechaCompra).getTime() : 0;
        const db = b.fechaCompra ? new Date(b.fechaCompra).getTime() : 0;
        return db - da;
      });
      setRows(sorted);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (hasUnsaved) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [hasUnsaved]);

  const filtered = useMemo(() => rows.filter(r =>
    r.tela.toLowerCase().includes(filterTela.toLowerCase()) &&
    r.proveedor.toLowerCase().includes(filterProveedor.toLowerCase())
  ), [rows, filterTela, filterProveedor]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pagination.limit));
  const page = Math.min(pagination.page, totalPages);
  const paged = filtered.slice((page - 1) * pagination.limit, page * pagination.limit);

  const updateRow = (id: string, field: keyof TelaProduccion, value: string) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: value };
      const recalc = calcProduccion(updated);
      dirtyIds.current.add(id);
      setHasUnsaved(true);
      return recalc;
    }));
  };

  const addRow = () => {
    const r = newProduccion();
    dirtyIds.current.add(r.id);
    setRows(prev => [r, ...prev]);
    setHasUnsaved(true);
    goToPage(1);
  };

  const handleImportProduccion = (imported: ImportedTelaProduccion[]) => {
    const newRows: TelaProduccion[] = imported.map(r => {
      const base = { ...newProduccion(), ...r };
      return calcProduccion(base);
    });
    newRows.forEach(r => dirtyIds.current.add(r.id));
    setRows(prev => [...newRows, ...prev]);
    setHasUnsaved(true);
  };

  const deleteRow = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
    dirtyIds.current.delete(id);
    setDeletedIds(prev => [...prev, id]);
    setHasUnsaved(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentUser = api.getCurrentUser();
      await Promise.all(deletedIds.map(id => api.deleteControlTelaProduccion(id)));
      setDeletedIds([]);
      const toSave = rows.filter(r => dirtyIds.current.has(r.id));
      if (toSave.length > 0) {
        const result = await api.saveControlTelasProduccionBatch(toSave, currentUser?.id);
        if (result.success && result.data) {
          const savedMap = new Map(result.data.map((r: any) => [r.id, r]));
          setRows(prev => prev.map(r => savedMap.has(r.id) ? { ...(savedMap.get(r.id) as any), isNew: false } : r));
        }
      }
      dirtyIds.current.clear();
      setHasUnsaved(false);
    } catch { alert('Error al guardar. Intenta de nuevo.'); }
    finally { setSaving(false); }
  };

  const thCls = `px-3 py-3 text-xs font-black text-center uppercase tracking-wider whitespace-nowrap transition-colors ${isDark ? 'text-violet-400 bg-[#3d2d52]' : 'text-pink-400 bg-pink-50'}`;
  const tdCls = 'px-3 py-2 text-[13px]';
  const inputCls = `w-full px-2 py-1 text-[13px] border-none outline-none bg-transparent focus:ring-1 focus:ring-inset focus:rounded-sm transition-colors ${isDark ? 'focus:ring-violet-400 text-violet-100' : 'focus:ring-pink-300 text-slate-900'}`;

  const telaSuggestions = useMemo(() => [...new Set(rows.map(r => r.tela).filter(Boolean))].sort(), [rows]);
  const proveedorSuggestions = useMemo(() => [...new Set(rows.map(r => r.proveedor).filter(Boolean))].sort(), [rows]);

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`px-5 py-3 rounded-2xl font-bold transition-all border text-sm ${isDark ? 'bg-violet-700/50 text-violet-300 border-violet-700 hover:bg-violet-700 hover:text-violet-200' : 'bg-white text-slate-400 border-slate-100 hover:text-slate-600'}`}>← Atrás</button>
          <div>
            <h2 className={`text-3xl font-black tracking-tighter transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>Telas para producción</h2>
            {hasUnsaved && (
              <p className={`font-medium text-sm transition-colors ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>
                <span className={`flex items-center gap-1.5 font-semibold transition-colors ${isDark ? 'text-pink-400' : 'text-amber-600'}`}><span className={`w-2 h-2 rounded-full animate-pulse inline-block transition-colors ${isDark ? 'bg-pink-500' : 'bg-amber-500'}`} />Cambios sin guardar</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FilterBar filterTela={filterTela} setFilterTela={setFilterTela} filterProveedor={filterProveedor} setFilterProveedor={setFilterProveedor} onClear={() => { setFilterTela(''); setFilterProveedor(''); }} isDark={isDark} />
          {canEdit && (
          <button onClick={addRow} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-bold text-sm transition-all shadow-sm ${isDark ? 'bg-pink-600 hover:bg-pink-700' : 'bg-pink-500 hover:bg-pink-600'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Agregar tela
          </button>
          )}
          {user.role === UserRole.SOPORTE && (
            <button onClick={() => setImportOpen(true)} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-bold text-sm transition-all shadow-sm ${isDark ? 'bg-purple-700 hover:bg-purple-800' : 'bg-purple-600 hover:bg-purple-700'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
              Importar Excel
            </button>
          )}
          <button onClick={handleSave} disabled={!hasUnsaved || saving || !canEdit}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-sm ${hasUnsaved && canEdit ? isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700' : isDark ? 'bg-violet-700/30 text-violet-700 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className={`flex justify-center py-20 transition-colors ${isDark ? 'text-violet-400' : 'text-pink-400'}`}><div className={`w-8 h-8 border-4 rounded-full animate-spin transition-colors ${isDark ? 'border-violet-400 border-t-transparent' : 'border-pink-400 border-t-transparent'}`} /></div>
      ) : (
        <div className={`rounded-3xl shadow-sm border overflow-hidden transition-colors ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col style={{width:'140px'}} />{/* Tela */}
                <col style={{width:'100px'}} />{/* Color */}
                <col style={{width:'80px'}}  />{/* Und */}
                <col style={{width:'65px'}}  />{/* Rdmto */}
                <col style={{width:'75px'}}  />{/* Neto */}
                <col style={{width:'75px'}}  />{/* IVA */}
                <col style={{width:'80px'}} />{/* Vlr Kilos */}
                <col style={{width:'80px'}} />{/* Vrl Metros */}
                <col style={{width:'200px'}} />{/* Proveedor */}
                <col style={{width:'100px'}} />{/* Fecha */}
                <col style={{width:'75px'}}  />{/* IVA Inc */}
                <col style={{width:'100px'}}  />{/* FE/RM */}
                {canEdit && <col style={{width:'36px'}} />}{/* Eliminar */}
              </colgroup>
              <thead>
                <tr className={`border-b divide-x transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-700 divide-violet-700' : 'bg-pink-50 border-pink-200 divide-pink-200'}`}>
                  {['Tela','Color','Und.','Rdmto','Neto','IVA 19%','Vlr Kilos','Vlr Metros','Proveedor','Fecha Compra','IVA Inc.','FE / RM', ...(canEdit ? [''] : [])].map(h => (
                    <th key={h} className={thCls}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((row, i) => (
                  <tr key={row.id} className={`border-b divide-x transition-colors ${isDark ? `${i % 2 === 0 ? 'bg-[#4a3a63]' : 'bg-[#3d2d52]'} border-violet-700 divide-violet-700 hover:bg-violet-700/30` : `${i % 2 === 0 ? 'bg-white' : 'bg-pink-50/30'} border-slate-100 divide-slate-300 hover:bg-pink-50/40`}`}>
                    <td className={tdCls}><TextAutocomplete value={row.tela} onChange={v => canEdit && updateRow(row.id, 'tela', v)} suggestions={telaSuggestions} placeholder="" className={`text-[13px] border-none outline-none bg-transparent ${canEdit ? 'focus:ring-1 focus:ring-inset focus:ring-pink-300' : 'pointer-events-none'} rounded-sm font-normal ${isDark ? 'text-violet-100' : 'text-slate-900'}`} /></td>
                    <td className={tdCls}><input className={inputCls + ' text-left'} value={row.color} onChange={e => updateRow(row.id, 'color', e.target.value)} readOnly={!canEdit} /></td>
                    <td className={`${tdCls} text-center`}>
                      {canEdit ? <UndToggle value={row.undMedida} onChange={v => updateRow(row.id, 'undMedida', v)} isDark={isDark} /> : <UndBadge u={row.undMedida} isDark={isDark} />}
                    </td>
                    <td className={`${tdCls} text-center`}><input className={`${inputCls} text-center`} type="number" value={row.rdmto} onChange={e => updateRow(row.id, 'rdmto', e.target.value)} readOnly={!canEdit} /></td>
                    <td className={tdCls}><NetoInput value={row.subtotal} onChange={v => canEdit && updateRow(row.id, 'subtotal', v)} cls={inputCls + (!canEdit ? ' pointer-events-none' : '')} /></td>
                    <td className={`${tdCls} text-right transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'} whitespace-nowrap`}>{fmt(row.iva)}</td>
                    <td className={`${tdCls} text-center font-semibold transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'} whitespace-nowrap`}>{fmt(row.precioTotalKilos)}</td>
                    <td className={`${tdCls} text-center font-semibold transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'} whitespace-nowrap`}>{fmt(row.precioTotalMetros)}</td>
                    <td className={tdCls}><TextAutocomplete value={row.proveedor} onChange={v => canEdit && updateRow(row.id, 'proveedor', v)} suggestions={proveedorSuggestions} placeholder="" className={`text-[13px] border-none outline-none bg-transparent ${canEdit ? 'focus:ring-1 focus:ring-inset focus:ring-pink-300' : 'pointer-events-none'} rounded-sm font-normal ${isDark ? 'text-violet-100' : 'text-slate-900'}`} /></td>
                    <td className={tdCls}><input className={inputCls} type="date" value={row.fechaCompra} onChange={e => updateRow(row.id, 'fechaCompra', e.target.value)} readOnly={!canEdit} /></td>
                    <td className={`${tdCls} text-center`}>
                      {canEdit ? <IvaToggle value={row.ivaIncluido} onChange={v => updateRow(row.id, 'ivaIncluido', v)} isDark={isDark} /> : <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${row.ivaIncluido === 'S' ? isDark ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700' : isDark ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-500'}`}>{row.ivaIncluido === 'S' ? 'SI' : 'NO'}</span>}
                    </td>
                    <td className={tdCls}><input className={inputCls + ' text-left'} value={row.feOrRm} onChange={e => updateRow(row.id, 'feOrRm', e.target.value)} readOnly={!canEdit} /></td>
                    {canEdit && (
                    <td className="px-2 py-2 text-center">
                      <button onClick={() => deleteRow(row.id)} className={`transition-colors ${isDark ? 'text-violet-700 hover:text-red-400' : 'text-slate-300 hover:text-red-500'}`} title="Eliminar">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                      </button>
                    </td>
                    )}
                  </tr>
                ))}
                {paged.length === 0 && (
                  <tr><td colSpan={canEdit ? 13 : 12} className="px-4 py-10 text-center text-slate-400 font-medium">Sin resultados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <PaginationComponent
        currentPage={page} totalPages={totalPages}
        onPageChange={goToPage} totalItems={filtered.length} itemsPerPage={pagination.limit}
        pageSize={pagination.limit} onPageSizeChange={size => { setLimit(size); goToPage(1); }}
      />
      <ControlTelasProduccionImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImportProduccion}
      />
    </div>
  );
};

// ── Vista Muestras ─────────────────────────────────────────────────────────────
const TelaMuestrasTable: React.FC<{ onBack: () => void; user: User }> = ({ onBack, user }) => {
  const { isDark } = useDarkMode();
  const [rows, setRows] = useState<TelaMuestra[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const dirtyIds = useRef<Set<string>>(new Set());
  const [importOpen, setImportOpen] = useState(false);
  const [filterTela, setFilterTela] = useState('');
  const [filterProveedor, setFilterProveedor] = useState('');
  const { pagination, goToPage, setLimit } = usePagination(1, 30);

  const canEdit = user.role === UserRole.ADMIN || user.role === UserRole.SOPORTE || user.role === UserRole.OPERADOR;

  useEffect(() => {
    api.getControlTelasMuestras().then(data => {
      const sorted = (data.length > 0 ? data : []).sort((a: TelaMuestra, b: TelaMuestra) => {
        const da = a.fechaCompra ? new Date(a.fechaCompra).getTime() : 0;
        const db = b.fechaCompra ? new Date(b.fechaCompra).getTime() : 0;
        return db - da;
      });
      setRows(sorted);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (hasUnsaved) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [hasUnsaved]);

  const filtered = useMemo(() => rows.filter(r =>
    r.tela.toLowerCase().includes(filterTela.toLowerCase()) &&
    r.proveedor.toLowerCase().includes(filterProveedor.toLowerCase())
  ), [rows, filterTela, filterProveedor]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pagination.limit));
  const page = Math.min(pagination.page, totalPages);
  const paged = filtered.slice((page - 1) * pagination.limit, page * pagination.limit);

  const updateRow = (id: string, field: keyof TelaMuestra, value: string) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: value };
      const recalc = calcMuestra(updated);
      dirtyIds.current.add(id);
      setHasUnsaved(true);
      return recalc;
    }));
  };

  const addRow = () => {
    const r = newMuestra();
    dirtyIds.current.add(r.id);
    setRows(prev => [r, ...prev]);
    setHasUnsaved(true);
    goToPage(1);
  };

  const handleImportMuestras = (imported: ImportedTelaMuestra[]) => {
    const newRows: TelaMuestra[] = imported.map(r => {
      const base = { ...newMuestra(), ...r };
      return calcMuestra(base);
    });
    newRows.forEach(r => dirtyIds.current.add(r.id));
    setRows(prev => [...newRows, ...prev]);
    setHasUnsaved(true);
  };

  const deleteRow = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
    dirtyIds.current.delete(id);
    setDeletedIds(prev => [...prev, id]);
    setHasUnsaved(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentUser = api.getCurrentUser();
      await Promise.all(deletedIds.map(id => api.deleteControlTelaMuestra(id)));
      setDeletedIds([]);
      const toSave = rows.filter(r => dirtyIds.current.has(r.id));
      if (toSave.length > 0) {
        const result = await api.saveControlTelasMuestrasBatch(toSave, currentUser?.id);
        if (result.success && result.data) {
          const savedMap = new Map(result.data.map((r: any) => [r.id, r]));
          setRows(prev => prev.map(r => savedMap.has(r.id) ? { ...(savedMap.get(r.id) as any), isNew: false } : r));
        }
      }
      dirtyIds.current.clear();
      setHasUnsaved(false);
    } catch { alert('Error al guardar. Intenta de nuevo.'); }
    finally { setSaving(false); }
  };

  const thCls = `px-3 py-3 text-xs font-black text-center uppercase tracking-wider whitespace-nowrap transition-colors ${isDark ? 'text-violet-400 bg-[#3d2d52]' : 'text-purple-400 bg-purple-50'}`;
  const tdCls = 'px-3 py-2 text-[13px]';
  const inputCls = `w-full px-2 py-1 text-[13px] border-none outline-none bg-transparent focus:ring-1 focus:ring-inset focus:rounded-sm transition-colors ${isDark ? 'focus:ring-violet-400 text-violet-100' : 'focus:ring-pink-300 text-slate-900'}`;

  const telaSuggestions = useMemo(() => [...new Set(rows.map(r => r.tela).filter(Boolean))].sort(), [rows]);
  const proveedorSuggestions = useMemo(() => [...new Set(rows.map(r => r.proveedor).filter(Boolean))].sort(), [rows]);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`px-5 py-3 rounded-2xl font-bold transition-all border text-sm ${isDark ? 'bg-violet-700/50 text-violet-300 border-violet-700 hover:bg-violet-700 hover:text-violet-200' : 'bg-white text-slate-400 border-slate-100 hover:text-slate-600'}`}>← Atrás</button>
          <div>
            <h2 className={`text-3xl font-black tracking-tighter transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>Telas para muestras</h2>
            {hasUnsaved && (
              <p className={`font-medium text-sm transition-colors ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>
                <span className={`flex items-center gap-1.5 font-semibold transition-colors ${isDark ? 'text-pink-400' : 'text-amber-600'}`}><span className={`w-2 h-2 rounded-full animate-pulse inline-block transition-colors ${isDark ? 'bg-pink-500' : 'bg-amber-500'}`} />Cambios sin guardar</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FilterBar filterTela={filterTela} setFilterTela={setFilterTela} filterProveedor={filterProveedor} setFilterProveedor={setFilterProveedor} onClear={() => { setFilterTela(''); setFilterProveedor(''); }} isDark={isDark} />
          {canEdit && (
          <button onClick={addRow} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-bold text-sm transition-all shadow-sm ${isDark ? 'bg-purple-700 hover:bg-purple-800' : 'bg-purple-500 hover:bg-purple-600'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Agregar tela
          </button>
          )}
          {user.role === UserRole.SOPORTE && (
            <button onClick={() => setImportOpen(true)} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-bold text-sm transition-all shadow-sm ${isDark ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
              Importar Excel
            </button>
          )}
          <button onClick={handleSave} disabled={!hasUnsaved || saving || !canEdit}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-sm ${hasUnsaved && canEdit ? isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700' : isDark ? 'bg-violet-700/30 text-violet-700 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className={`flex justify-center py-20 transition-colors ${isDark ? 'text-violet-400' : 'text-purple-400'}`}><div className={`w-8 h-8 border-4 rounded-full animate-spin transition-colors ${isDark ? 'border-violet-400 border-t-transparent' : 'border-purple-400 border-t-transparent'}`} /></div>
      ) : (
        <div className={`rounded-3xl shadow-sm border overflow-hidden transition-colors ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col style={{width:'175px'}} />{/* Tela */}
                <col style={{width:'90px'}}  />{/* Color */}
                <col style={{width:'70px'}}  />{/* Und */}
                <col style={{width:'60px'}}  />{/* Rdmto */}
                <col style={{width:'85px'}}  />{/* Neto */}
                <col style={{width:'70px'}}  />{/* IVA */}
                <col style={{width:'80px'}}  />{/* Vlr Kilos */}
                <col style={{width:'80px'}}  />{/* Vlr Metros */}
                <col style={{width:'150px'}} />{/* Proveedor */}
                <col style={{width:'110px'}} />{/* Fecha */}
                <col style={{width:'90px'}}  />{/* Factura */}
                <col style={{width:'120px'}} />{/* Solicita */}
                <col style={{width:'80px'}}  />{/* Usada */}
                {canEdit && <col style={{width:'36px'}} />}{/* Eliminar */}
              </colgroup>
              <thead>
                <tr className={`border-b divide-x transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-700 divide-violet-700' : 'bg-purple-50 border-purple-200 divide-purple-200'}`}>
                  {['Tela','Color','Und.','Rdmto','Neto','IVA 19%','Vlr Kilos','Vlr Metros','Proveedor','Fecha Compra','Factura No','Solicita / Recibe','Usa en Ref', ...(canEdit ? [''] : [])].map(h => (
                    <th key={h} className={thCls}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((row, i) => (
                  <tr key={row.id} className={`border-b divide-x transition-colors ${isDark ? `${i % 2 === 0 ? 'bg-[#4a3a63]' : 'bg-[#3d2d52]'} border-violet-700 divide-violet-700 hover:bg-violet-700/30` : `${i % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'} border-slate-100 divide-slate-300 hover:bg-purple-50/40`}`}>
                    <td className={tdCls}><TextAutocomplete value={row.tela} onChange={v => canEdit && updateRow(row.id, 'tela', v)} suggestions={telaSuggestions} placeholder="" className={`text-[13px] border-none outline-none bg-transparent ${canEdit ? 'focus:ring-1 focus:ring-inset focus:ring-purple-300' : 'pointer-events-none'} rounded-sm font-normal ${isDark ? 'text-violet-100' : 'text-slate-900'}`} /></td>
                    <td className={tdCls}><input className={inputCls + ' text-left'} value={row.color} onChange={e => updateRow(row.id, 'color', e.target.value)} readOnly={!canEdit} /></td>
                    <td className={`${tdCls} text-center`}>
                      {canEdit ? <UndToggle value={row.undMedida} onChange={v => updateRow(row.id, 'undMedida', v)} isDark={isDark} /> : <UndBadge u={row.undMedida} isDark={isDark} />}
                    </td>
                    <td className={`${tdCls} text-center`}><input className={`${inputCls} text-center`} type="number" value={row.rdmto} onChange={e => updateRow(row.id, 'rdmto', e.target.value)} readOnly={!canEdit} /></td>
                    <td className={tdCls}><NetoInput value={row.subtotal} onChange={v => canEdit && updateRow(row.id, 'subtotal', v)} cls={inputCls + (!canEdit ? ' pointer-events-none' : '')} /></td>
                    <td className={`${tdCls} text-right transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'} whitespace-nowrap`}>{fmt(row.iva)}</td>
                    <td className={`${tdCls} text-center font-semibold transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'} whitespace-nowrap`}>{fmt(row.totalPrecioKilos)}</td>
                    <td className={`${tdCls} text-center font-semibold transition-colors ${isDark ? 'text-violet-200' : 'text-slate-800'} whitespace-nowrap`}>{fmt(row.totalPrecioMetros)}</td>
                    <td className={tdCls}><TextAutocomplete value={row.proveedor} onChange={v => canEdit && updateRow(row.id, 'proveedor', v)} suggestions={proveedorSuggestions} placeholder="" className={`text-[13px] border-none outline-none bg-transparent ${canEdit ? 'focus:ring-1 focus:ring-inset focus:ring-purple-300' : 'pointer-events-none'} rounded-sm font-normal ${isDark ? 'text-violet-100' : 'text-slate-900'}`} /></td>
                    <td className={tdCls}><input className={inputCls} type="date" value={row.fechaCompra} onChange={e => updateRow(row.id, 'fechaCompra', e.target.value)} readOnly={!canEdit} /></td>
                    <td className={tdCls}><input className={inputCls + ' text-left'} value={row.facturaNo} onChange={e => updateRow(row.id, 'facturaNo', e.target.value)} readOnly={!canEdit} /></td>
                    <td className={tdCls}><input className={inputCls + ' text-left'} value={row.solicitaRecibe} onChange={e => updateRow(row.id, 'solicitaRecibe', e.target.value)} readOnly={!canEdit} /></td>
                    <td className={`${tdCls} text-center`}><input className={`${inputCls} text-center`} value={row.usadaEnProduccion} onChange={e => updateRow(row.id, 'usadaEnProduccion', e.target.value)} readOnly={!canEdit} /></td>
                    {canEdit && (
                    <td className="px-2 py-2 text-center">
                      <button onClick={() => deleteRow(row.id)} className={`transition-colors ${isDark ? 'text-violet-700 hover:text-red-400' : 'text-slate-300 hover:text-red-500'}`} title="Eliminar">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                      </button>
                    </td>
                    )}
                  </tr>
                ))}
                {paged.length === 0 && (
                  <tr><td colSpan={canEdit ? 14 : 13} className="px-4 py-10 text-center text-slate-400 font-medium">Sin resultados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <PaginationComponent
        currentPage={page} totalPages={totalPages}
        onPageChange={goToPage} totalItems={filtered.length} itemsPerPage={pagination.limit}
        pageSize={pagination.limit} onPageSizeChange={size => { setLimit(size); goToPage(1); }}
      />
      <ControlTelasMuestrasImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImportMuestras}
      />
    </div>
  );
};

// ── Modal Buscar Tela ──────────────────────────────────────────────────────────
const fmtModal = (v: string) => {
  const n = parseFloat(v);
  return n > 0 ? `$${Math.ceil(n).toLocaleString('es-CO')}` : '—';
};

const BuscarTelaModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [query, setQuery] = React.useState('');
  const [searched, setSearched] = React.useState(false);
  const [produccion, setProduccion] = React.useState<any[]>([]);
  const [muestras, setMuestras] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setQuery(''); setSearched(false); setProduccion([]); setMuestras([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const [prod, must] = await Promise.all([
        api.getControlTelasProduccion(),
        api.getControlTelasMuestras(),
      ]);
      const q = query.trim().toLowerCase();
      const filterSort = (arr: any[]) =>
        arr
          .filter(r => r.tela?.toLowerCase().includes(q))
          .sort((a, b) => new Date(b.fechaCompra || b.createdAt || 0).getTime() - new Date(a.fechaCompra || a.createdAt || 0).getTime())
          .slice(0, 3);
      setProduccion(filterSort(prod));
      setMuestras(filterSort(must));
      setSearched(true);
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  const ColHeader = ({ label, color }: { label: string; color: string }) => (
    <th className={`px-3 py-2 text-xs font-black uppercase tracking-wider text-left ${color}`}>{label}</th>
  );

  const ResultRow = ({ r, type }: { r: any; type: 'prod' | 'must' }) => {
    const isM = r.undMedida === 'M';
    const kilos = type === 'prod' ? r.precioTotalKilos : r.totalPrecioKilos;
    const metros = type === 'prod' ? r.precioTotalMetros : r.totalPrecioMetros;
    return (
      <tr className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
        <td className="px-3 py-2 font-semibold text-slate-800 text-sm">{r.tela}</td>
        <td className="px-3 py-2 text-center">
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.undMedida === 'K' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{r.undMedida}</span>
        </td>
        <td className="px-3 py-2 text-center text-slate-600 text-sm">{isM ? '—' : (r.rdmto || '—')}</td>
        <td className="px-3 py-2 text-right text-slate-700 text-sm">{fmtModal(r.subtotal)}</td>
        <td className="px-3 py-2 text-right text-slate-700 text-sm">{fmtModal(metros)}</td>
        <td className="px-3 py-2 text-right text-slate-700 text-sm">{isM ? '—' : fmtModal(kilos)}</td>
        <td className="px-3 py-2 text-slate-600 text-sm">{r.proveedor}</td>
        <td className="px-3 py-2 text-slate-500 text-xs whitespace-nowrap">{r.fechaCompra || '—'}</td>
      </tr>
    );
  };

  const EmptyRow = ({ msg }: { msg: string }) => (
    <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-400 text-sm italic">{msg}</td></tr>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Buscar tela</h2>
            <p className="text-slate-400 text-sm mt-0.5">Últimos 3 registros por sección</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Search bar */}
        <div className="px-8 py-5 flex gap-3">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={e => e.target.select()}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Nombre de la tela..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <button onClick={handleSearch} disabled={loading || !query.trim()}
            className="px-6 py-3 rounded-2xl bg-pink-500 text-white font-bold text-sm hover:bg-pink-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
            Buscar
          </button>
        </div>

        {/* Results */}
        <div className="px-8 pb-8 overflow-y-auto flex-1 space-y-6">

          {/* Producción */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-pink-400" />
              <h3 className="font-black text-slate-700 text-sm uppercase tracking-wider">Producción</h3>
            </div>
            <div className="bg-pink-50/50 rounded-2xl border border-pink-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-pink-100">
                    {['Tela','Und.','Rdmto','Neto','Vlr Metros','Vlr Kilos','Proveedor','Fecha'].map(h => (
                      <th key={h} className={`px-3 py-2 text-xs font-black uppercase tracking-wider text-left text-pink-400`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!searched ? (
                    <EmptyRow msg="Ingresa un nombre y presiona Buscar" />
                  ) : produccion.length === 0 ? (
                    <EmptyRow msg="Sin registros en producción" />
                  ) : (
                    produccion.map((r, i) => {
                      const isM = r.undMedida === 'M';
                      const kilos = r.precioTotalKilos;
                      const metros = r.precioTotalMetros;
                      return (
                        <tr key={i} className="border-b border-slate-100 hover:bg-pink-50/40 transition-colors">
                          <td className="px-3 py-2 font-semibold text-slate-800 text-sm">{r.tela}</td>
                          <td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.undMedida === 'K' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{r.undMedida}</span></td>
                          <td className="px-3 py-2 text-center text-slate-600 text-sm">{isM ? '—' : (r.rdmto || '—')}</td>
                          <td className="px-3 py-2 text-right text-slate-700 text-sm">{fmtModal(r.subtotal)}</td>
                          <td className="px-3 py-2 text-center text-slate-700 text-sm">{fmtModal(metros)}</td>
                          <td className="px-3 py-2 text-center text-slate-700 text-sm">{isM ? '—' : fmtModal(kilos)}</td>
                          <td className="px-3 py-2 text-slate-600 text-sm">{r.proveedor}</td>
                          <td className="px-3 py-2 text-slate-500 text-xs whitespace-nowrap">{r.fechaCompra || '—'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Muestras */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-purple-400" />
              <h3 className="font-black text-slate-700 text-sm uppercase tracking-wider">Muestras</h3>
            </div>
            <div className="bg-purple-50/50 rounded-2xl border border-purple-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-100">
                    {['Tela','Und.','Rdmto','Neto','Vlr Metros','Vlr Kilos','Proveedor','Fecha'].map(h => (
                      <th key={h} className={`px-3 py-2 text-xs font-black uppercase tracking-wider text-left text-purple-400`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!searched ? (
                    <EmptyRow msg="Ingresa un nombre y presiona Buscar" />
                  ) : muestras.length === 0 ? (
                    <EmptyRow msg="Sin registros en muestras" />
                  ) : (
                    muestras.map((r, i) => {
                      const isM = r.undMedida === 'M';
                      const kilos = r.totalPrecioKilos;
                      const metros = r.totalPrecioMetros;
                      return (
                        <tr key={i} className="border-b border-slate-100 hover:bg-purple-50/40 transition-colors">
                          <td className="px-3 py-2 font-semibold text-slate-800 text-sm">{r.tela}</td>
                          <td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.undMedida === 'K' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{r.undMedida}</span></td>
                          <td className="px-3 py-2 text-center text-slate-600 text-sm">{isM ? '—' : (r.rdmto || '—')}</td>
                          <td className="px-3 py-2 text-right text-slate-700 text-sm">{fmtModal(r.subtotal)}</td>
                          <td className="px-3 py-2 text-center text-slate-700 text-sm">{fmtModal(metros)}</td>
                          <td className="px-3 py-2 text-center text-slate-700 text-sm">{isM ? '—' : fmtModal(kilos)}</td>
                          <td className="px-3 py-2 text-slate-600 text-sm">{r.proveedor}</td>
                          <td className="px-3 py-2 text-slate-500 text-xs whitespace-nowrap">{r.fechaCompra || '—'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// ── Selector principal ─────────────────────────────────────────────────────────
const ControlTelasView: React.FC<{ user: User }> = ({ user }) => {
  const { isDark } = useDarkMode();
  const [view, setView] = useState<ViewType>('selector');
  const [buscarOpen, setBuscarOpen] = useState(false);
  if (view === 'produccion') return <TelaProduccionTable onBack={() => setView('selector')} user={user} />;
  if (view === 'muestras')   return <TelaMuestrasTable   onBack={() => setView('selector')} user={user} />;
  return (
    <>
    <div className={`space-y-8 pb-20 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-white'}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-3xl font-black tracking-tighter transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Control de Telas</h2>
          <p className={`font-medium transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Selecciona el tipo de control</p>
        </div>
        <button onClick={() => setBuscarOpen(true)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-bold text-sm shadow-md hover:shadow-lg transition-all ${isDark ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500' : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          Buscar tela
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <button onClick={() => setView('produccion')} className={`p-8 rounded-[32px] shadow-sm border transition-all flex flex-col items-center justify-center gap-6 min-h-[400px] ${isDark ? 'bg-[#4a3a63] border-violet-700 hover:shadow-md hover:border-violet-600' : 'bg-white border-slate-100 hover:shadow-md hover:border-pink-200'}`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-violet-900' : 'bg-pink-50'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-8 h-8 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-pink-500'}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
            </svg>
          </div>
          <div className="text-center space-y-2">
            <h3 className={`text-2xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Telas para producción</h3>
            <p className={`font-medium transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Control de telas destinadas a producción</p>
          </div>
        </button>
        <button onClick={() => setView('muestras')} className={`p-8 rounded-[32px] shadow-sm border transition-all flex flex-col items-center justify-center gap-6 min-h-[400px] ${isDark ? 'bg-[#4a3a63] border-violet-700 hover:shadow-md hover:border-violet-600' : 'bg-white border-slate-100 hover:shadow-md hover:border-purple-200'}`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-violet-900' : 'bg-purple-50'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-8 h-8 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-purple-500'}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
            </svg>
          </div>
          <div className="text-center space-y-2">
            <h3 className={`text-2xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Telas para muestras</h3>
            <p className={`font-medium transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Control de telas destinadas a muestras</p>
          </div>
        </button>
      </div>
    </div>
    <BuscarTelaModal isOpen={buscarOpen} onClose={() => setBuscarOpen(false)} />
    </>
  );
};

export default ControlTelasView;







