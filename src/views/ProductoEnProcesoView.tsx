import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { User, UserRole } from '../types';
import usePagination from '../hooks/usePagination';
import PaginationComponent from '../components/PaginationComponent';
import ProductoEnProcesoImportModal, { ImportedLoteRow } from '../components/ProductoEnProcesoImportModal';
import TextAutocomplete from '../components/TextAutocomplete';
import api from '../services/api';

// ============================================================
// TIPOS
// ============================================================

type HighlightColor = 'yellow' | 'red' | null;

interface CellHighlights {
  [fieldKey: string]: HighlightColor;
}

interface CellComments {
  [fieldKey: string]: string;
}

interface LoteRow {
  id: string;
  isNew?: boolean;
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
  rowHighlight: HighlightColor;
  cellHighlights: CellHighlights;
  cellComments: CellComments;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  rowId: string;
  fieldKey: string;
}

interface CommentModalState {
  visible: boolean;
  rowId: string;
  fieldKey: string;
  current: string;
}

interface ProductoEnProcesoViewProps {
  user: User;
}

// ============================================================
// HELPERS
// ============================================================

const toNum = (v: string) => parseFloat(v) || 0;

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

const rowHighlightClass = (color: HighlightColor): string => {
  if (color === 'yellow') return 'bg-yellow-100';
  if (color === 'red') return 'bg-red-100';
  return '';
};

const cellHighlightClass = (color: HighlightColor): string => {
  if (color === 'yellow') return 'bg-yellow-200';
  if (color === 'red') return 'bg-red-200';
  return '';
};

const newRow = (): LoteRow => ({
  id: crypto.randomUUID(),
  isNew: true,
  confeccionista: '', remision: '', ref: '', salida: '',
  fechaRemision: '', entrega: '', segundas: '', vta: '',
  cobrado: '', incompleto: '', fechaLlegada: '',
  talegosSalida: '', talegosEntrega: '',
  muestrasSalida: '', muestrasEntrega: '',
  rowHighlight: null,
  cellHighlights: {},
  cellComments: {},
});

const STORAGE_KEY = 'producto_en_proceso_rows';

const canEdit = (role: UserRole) =>
  role === UserRole.ADMIN || role === UserRole.GENERAL || role === UserRole.SOPORTE || role === UserRole.OPERADOR;

// ============================================================
// NAVEGACIÓN CON TECLADO
// ============================================================

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
    if (nextRow) nextRow.querySelectorAll<HTMLInputElement>('input')[colIdx]?.focus();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    const row = current.closest('tr');
    const cells = row ? Array.from(row.querySelectorAll<HTMLInputElement>('input')) : [];
    const colIdx = cells.indexOf(current);
    const prevRow = row?.previousElementSibling as HTMLElement | null;
    if (prevRow) prevRow.querySelectorAll<HTMLInputElement>('input')[colIdx]?.focus();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    allInputs[idx + 1]?.focus();
  }
};

// ============================================================
// CELDA EDITABLE
// ============================================================

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
      <div className={`px-2 py-1 text-xs font-semibold rounded ${align === 'center' ? 'text-center' : 'text-left'}`} style={{ minWidth }}>
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
      onWheel={type === 'number' ? e => (e.target as HTMLInputElement).blur() : undefined}
      className={`w-full px-1 text-xs border border-transparent hover:border-slate-300 focus:border-blue-400 focus:outline-none rounded bg-transparent focus:bg-white ${align === 'center' ? 'text-center' : 'text-left'}`}
      style={{ minWidth, height: '22px', boxSizing: 'border-box' }}
    />
  );
};

// ============================================================
// TD CON CONTEXT MENU, HIGHLIGHT Y COMENTARIO
// (definido fuera del componente para evitar recreación en cada render)
// ============================================================

interface TdProps {
  rowId: string;
  fieldKey: string;
  row: LoteRow;
  className?: string;
  children: React.ReactNode;
  baseHighlight?: string;
  onContextMenu: (e: React.MouseEvent, rowId: string, fieldKey: string) => void;
  onMouseEnter: (e: React.MouseEvent, comment: string) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

const Td: React.FC<TdProps> = ({ rowId, fieldKey, row, className = '', children, baseHighlight, onContextMenu, onMouseEnter, onMouseMove, onMouseLeave }) => {
  const cellColor = row.cellHighlights[fieldKey];
  const hasComment = !!row.cellComments[fieldKey];
  const bg = cellColor ? cellHighlightClass(cellColor) : (baseHighlight || '');

  return (
    <td
      className={`border border-slate-200 px-1 py-0.5 relative ${bg} ${className}`}
      onContextMenu={e => onContextMenu(e, rowId, fieldKey)}
      onMouseEnter={e => onMouseEnter(e, row.cellComments[fieldKey] || '')}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {hasComment && (
        <span
          className="absolute top-0 right-0 w-0 h-0 pointer-events-none"
          style={{
            borderStyle: 'solid',
            borderWidth: '0 7px 7px 0',
            borderColor: 'transparent #f97316 transparent transparent',
          }}
        />
      )}
      {children}
    </td>
  );
};

// ============================================================
// VISTA PRINCIPAL
// ============================================================

const ProductoEnProcesoView: React.FC<ProductoEnProcesoViewProps> = ({ user }) => {
  const editable = canEdit(user.role);

  const [rows, setRows] = useState<LoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const persistedIds = useRef<Set<string>>(new Set());
  const dirtyIds = useRef<Set<string>>(new Set());

  // Filtros
  const [filterConfeccionista, setFilterConfeccionista] = useState('');
  const [filterRemision, setFilterRemision] = useState('');
  const [filterRef, setFilterRef] = useState('');
  const [filterSalida, setFilterSalida] = useState('');
  const [filterFechaRemisionMes, setFilterFechaRemisionMes] = useState('');
  const [filterFechaLlegadaMes, setFilterFechaLlegadaMes] = useState('');
  const [filterFechaRemisionEspecifica, setFilterFechaRemisionEspecifica] = useState('');
  const [filterFechaLlegadaEspecifica, setFilterFechaLlegadaEspecifica] = useState('');
  const [showFechaRemisionPicker, setShowFechaRemisionPicker] = useState(false);
  const [showFechaLlegadaPicker, setShowFechaLlegadaPicker] = useState(false);
  const [hideEntregados, setHideEntregados] = useState(false);
  const [filterOnlyVta, setFilterOnlyVta] = useState(false);
  const [filterOnlyCobrado, setFilterOnlyCobrado] = useState(false);
  const [filterTotalDiferente, setFilterTotalDiferente] = useState(false);

  // Context menu
  const [ctxMenu, setCtxMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, rowId: '', fieldKey: '' });

  // Comment modal
  const [commentModal, setCommentModal] = useState<CommentModalState>({ visible: false, rowId: '', fieldKey: '', current: '' });
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Import modal
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Report modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [pendientesModalOpen, setPendientesModalOpen] = useState(false);
  const [efectividadModalOpen, setEfectividadModalOpen] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Lotes sin fecha de llegada
  const lotesPendientes = useMemo(() => rows.filter(r => !r.fechaLlegada && (r.confeccionista || r.remision || r.ref)), [rows]);

  // Métricas de efectividad de terceros
  const efectividadData = useMemo(() => {
    const validRows = rows.filter(r => r.confeccionista.trim());

    // Talleres únicos
    const talleresUnicos = new Set(validRows.map(r => r.confeccionista.trim().toLowerCase())).size;

    // Promedio de rotación (solo filas con valor numérico en rotación)
    const rotaciones = validRows.map(r => {
      const rot = calcRotacion(r);
      return rot !== '' ? Number(rot) : null;
    }).filter((v): v is number => v !== null);
    const promedioRotacion = rotaciones.length > 0
      ? Math.round(rotaciones.reduce((a, b) => a + b, 0) / rotaciones.length)
      : 0;

    // Lotes sin fecha de llegada
    const sinLlegada = validRows.filter(r => !r.fechaLlegada);
    const lotesEnProceso = sinLlegada.length;
    const unidadesEnProceso = Math.ceil(sinLlegada.reduce((s, r) => s + toNum(r.salida), 0));
    const referenciasEnProceso = new Set(sinLlegada.map(r => r.ref.trim()).filter(Boolean)).size;

    // Agrupado por confeccionista
    const byConf = new Map<string, { nombre: string; lotes: number; unidades: number[]; rotaciones: number[] }>();
    validRows.forEach(r => {
      const key = r.confeccionista.trim().toLowerCase();
      if (!byConf.has(key)) byConf.set(key, { nombre: r.confeccionista.trim(), lotes: 0, unidades: [], rotaciones: [] });
      const entry = byConf.get(key)!;
      entry.lotes++;
      if (r.salida) entry.unidades.push(toNum(r.salida));
      const rot = calcRotacion(r);
      if (rot !== '') entry.rotaciones.push(Number(rot));
    });

    const porConfeccionista = Array.from(byConf.values()).map(e => ({
      nombre: e.nombre,
      cantidadLotes: e.lotes,
      promedioUnidades: e.unidades.length > 0 ? Math.round(e.unidades.reduce((a, b) => a + b, 0) / e.unidades.length) : 0,
      promedioRotacion: e.rotaciones.length > 0 ? Math.round(e.rotaciones.reduce((a, b) => a + b, 0) / e.rotaciones.length) : 0,
    })).sort((a, b) => b.cantidadLotes - a.cantidadLotes);

    return { talleresUnicos, promedioRotacion, lotesEnProceso, unidadesEnProceso, referenciasEnProceso, porConfeccionista };
  }, [rows]);

  // Cambios sin guardar
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Carga inicial desde la BD
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.getProductoEnProceso().then(data => {
      if (!cancelled) {
        const loaded = data.length > 0 ? data : [newRow()];
        setRows(loaded);
        persistedIds.current = new Set(data.map((r: LoteRow) => r.id));
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setRows([newRow()]);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const generateEfectividadPDF = async () => {
    setGeneratingReport(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const cw = pageWidth - margin * 2;
      let y = margin;

      // Título
      doc.setFontSize(14); doc.setFont(undefined, 'bold');
      doc.text('Informe - Efectividad de Terceros', pageWidth / 2, y + 4, { align: 'center' });
      doc.setFontSize(9); doc.setFont(undefined, 'normal');
      doc.text(`Generado: ${new Date().toLocaleDateString('es')}`, pageWidth / 2, y + 9, { align: 'center' });
      y += 18;

      // Métricas resumen
      const metricas = [
        ['Talleres activos', String(efectividadData.talleresUnicos)],
        ['Promedio de rotación', `${efectividadData.promedioRotacion} días`],
        ['Lotes en proceso', String(efectividadData.lotesEnProceso)],
        ['Unidades en proceso', String(efectividadData.unidadesEnProceso)],
        ['Referencias en proceso', String(efectividadData.referenciasEnProceso)],
      ];
      const mw = cw / 2;
      metricas.forEach(([label, val]) => {
        doc.setFontSize(9); doc.setFont(undefined, 'bold');
        doc.rect(margin, y, mw, 6);
        doc.text(label, margin + 2, y + 4);
        doc.setFont(undefined, 'normal');
        doc.rect(margin + mw, y, mw, 6);
        doc.text(val, margin + mw + 2, y + 4);
        y += 6;
      });
      y += 6;

      // Tabla por confeccionista
      doc.setFontSize(11); doc.setFont(undefined, 'bold');
      doc.text('Detalle por confeccionista', margin, y); y += 6;

      const cols = ['Confeccionista', 'Cant. Lotes', 'Prom. Unidades', 'Prom. Rotación'];
      const ws2 = [cw * 0.45, cw * 0.18, cw * 0.18, cw * 0.19];
      const hh = 7; const rh = 5;

      const drawHeader = () => {
        doc.setFontSize(9); doc.setFont(undefined, 'bold');
        let x = margin;
        cols.forEach((c, i) => { doc.rect(x, y, ws2[i], hh); doc.text(c, x + ws2[i] / 2, y + 4.5, { align: 'center' }); x += ws2[i]; });
        y += hh;
      };
      drawHeader();

      efectividadData.porConfeccionista.forEach(row => {
        if (y + rh > pageHeight - margin) { doc.addPage(); y = margin; drawHeader(); }
        const cells = [row.nombre, String(row.cantidadLotes), String(row.promedioUnidades), `${row.promedioRotacion} días`];
        doc.setFontSize(8); doc.setFont(undefined, 'normal');
        let x = margin;
        cells.forEach((c, i) => {
          doc.rect(x, y, ws2[i], rh);
          const align = i === 0 ? 'left' : 'center';
          const tx = i === 0 ? x + 2 : x + ws2[i] / 2;
          doc.text(c, tx, y + 3.5, { align, maxWidth: ws2[i] - 2 });
          x += ws2[i];
        });
        y += rh;
      });

      doc.save(`Efectividad_Terceros_${Date.now()}.pdf`);
      setEfectividadModalOpen(false);
    } catch { alert('Error al generar PDF'); }
    finally { setGeneratingReport(false); }
  };

  const generateEfectividadExcel = async () => {
    setGeneratingReport(true);
    try {
      const ExcelJS = await import('exceljs');
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Efectividad de Terceros');

      // Hoja de resumen
      const resumenData = [
        ['Talleres activos', efectividadData.talleresUnicos],
        ['Promedio de rotación (días)', efectividadData.promedioRotacion],
        ['Lotes en proceso', efectividadData.lotesEnProceso],
        ['Unidades en proceso', efectividadData.unidadesEnProceso],
        ['Referencias en proceso', efectividadData.referenciasEnProceso],
      ];

      ws.addRow(['RESUMEN - Efectividad de Terceros']).getCell(1).font = { bold: true, size: 13, color: { argb: 'FF7C3AED' } };
      ws.addRow([`Generado: ${new Date().toLocaleDateString('es')}`]).getCell(1).font = { italic: true, color: { argb: 'FF888888' } };
      ws.addRow([]);
      resumenData.forEach(([label, val]) => {
        const r = ws.addRow([label, val]);
        r.getCell(1).font = { bold: true };
        r.getCell(2).alignment = { horizontal: 'center' };
      });
      ws.addRow([]);

      // Encabezado tabla
      const headerRow = ws.addRow(['Confeccionista', 'Cantidad de Lotes', 'Promedio de Unidades', 'Promedio de Rotación (días)']);
      headerRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      headerRow.height = 20;

      efectividadData.porConfeccionista.forEach((row, i) => {
        const r = ws.addRow([row.nombre, row.cantidadLotes, row.promedioUnidades, row.promedioRotacion]);
        r.eachCell(cell => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? 'FFFAF5FF' : 'FFFFFFFF' } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        r.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
      });

      ws.getColumn(1).width = 30;
      ws.getColumn(2).width = 18;
      ws.getColumn(3).width = 22;
      ws.getColumn(4).width = 28;

      const buf = await wb.xlsx.writeBuffer();
      const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `Efectividad_Terceros_${Date.now()}.xlsx`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      setEfectividadModalOpen(false);
    } catch { alert('Error al generar Excel'); }
    finally { setGeneratingReport(false); }
  };

  const handleSave = async () => {
    try {
      const currentUser = api.getCurrentUser();
      // Eliminar de la BD las filas borradas localmente
      await Promise.all(deletedIds.map(id => api.deleteProductoEnProceso(id)));
      deletedIds.forEach(id => persistedIds.current.delete(id));
      setDeletedIds([]);
      // Solo enviar las filas que cambiaron (nuevas o modificadas)
      const rowsToSave = rows.filter(r => dirtyIds.current.has(r.id));
      if (rowsToSave.length > 0) {
        const result = await api.saveProductoEnProcesoBatch(rowsToSave, currentUser?.id);
        if (result.success && result.data) {
          result.data.forEach((r: LoteRow) => persistedIds.current.add(r.id));
          // Quitar isNew de las filas ya guardadas
          const savedIds = new Set(result.data.map((r: LoteRow) => r.id));
          setRows(prev => prev.map(r => savedIds.has(r.id) ? { ...r, isNew: false } : r));
        }
      }
      dirtyIds.current.clear();
      setHasUnsavedChanges(false);
    } catch {
      alert('Error al guardar. Intenta de nuevo.');
    }
  };

  const generatePendientesPDF = async () => {
    setGeneratingReport(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const cw = pageWidth - margin * 2;
      let y = margin;

      // Título
      doc.setFontSize(14); doc.setFont(undefined, 'bold');
      doc.text('Informe - Pendientes de Entrega', pageWidth / 2, y + 4, { align: 'center' });
      doc.setFontSize(9); doc.setFont(undefined, 'normal');
      doc.text(`Generado: ${new Date().toLocaleDateString('es')}  |  Total pendientes: ${lotesPendientes.length}`, pageWidth / 2, y + 9, { align: 'center' });
      y += 16;

      const cols = ['Confeccionista', 'Remisión', 'Ref', 'Salida', 'Fecha Remisión', 'Entrega', 'Segundas', 'VTA', 'Cobrado', 'Incompleto', 'Total'];
      const ws = [cw*0.18, cw*0.08, cw*0.07, cw*0.06, cw*0.1, cw*0.07, cw*0.07, cw*0.06, cw*0.07, cw*0.08, cw*0.06];
      const hh = 7; const rh = 5;

      const drawHeader = () => {
        doc.setFontSize(8); doc.setFont(undefined, 'bold');
        let x = margin;
        cols.forEach((c, i) => { doc.rect(x, y, ws[i], hh); doc.text(c, x + ws[i]/2, y + 4.5, { align: 'center' }); x += ws[i]; });
        y += hh;
      };

      drawHeader();

      lotesPendientes.forEach(row => {
        if (y + rh > pageHeight - margin) { doc.addPage(); y = margin; drawHeader(); }
        const total = calcTotal(row);
        const cells = [row.confeccionista, row.remision, row.ref, row.salida, row.fechaRemision, row.entrega, row.segundas, row.vta, row.cobrado, row.incompleto, String(total)];
        doc.setFontSize(7); doc.setFont(undefined, 'normal');
        let x = margin;
        cells.forEach((c, i) => {
          doc.rect(x, y, ws[i], rh);
          doc.text(String(c ?? ''), x + ws[i]/2, y + 3.5, { align: 'center', maxWidth: ws[i] - 1 });
          x += ws[i];
        });
        y += rh;
      });

      doc.save(`Pendientes_Entrega_${Date.now()}.pdf`);
      setPendientesModalOpen(false);
    } catch (e) {
      alert('Error al generar PDF');
    } finally {
      setGeneratingReport(false);
    }
  };

  const generatePendientesExcel = async () => {
    setGeneratingReport(true);
    try {
      const ExcelJS = await import('exceljs');
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Pendientes de Entrega');

      ws.columns = [
        { header: 'Confeccionista', key: 'confeccionista', width: 25 },
        { header: 'Remisión', key: 'remision', width: 12 },
        { header: 'Ref', key: 'ref', width: 10 },
        { header: 'Salida', key: 'salida', width: 10 },
        { header: 'Fecha Remisión', key: 'fechaRemision', width: 16 },
        { header: 'Entrega', key: 'entrega', width: 10 },
        { header: 'Segundas', key: 'segundas', width: 10 },
        { header: 'VTA', key: 'vta', width: 8 },
        { header: 'Cobrado', key: 'cobrado', width: 10 },
        { header: 'Incompleto', key: 'incompleto', width: 12 },
        { header: 'Total', key: 'total', width: 10 },
      ];

      // Estilo encabezado
      ws.getRow(1).eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = { bottom: { style: 'thin' } };
      });
      ws.getRow(1).height = 20;

      lotesPendientes.forEach((row, i) => {
        const rowNum = i + 2; // fila 1 es encabezado
        const r = ws.addRow({
          confeccionista: row.confeccionista,
          remision: row.remision,
          ref: row.ref,
          salida: row.salida ? Number(row.salida) : null,
          fechaRemision: row.fechaRemision,
          entrega: row.entrega ? Number(row.entrega) : null,
          segundas: row.segundas ? Number(row.segundas) : null,
          vta: row.vta ? Number(row.vta) : null,
          cobrado: row.cobrado ? Number(row.cobrado) : null,
          incompleto: row.incompleto ? Number(row.incompleto) : null,
          total: null,
        });
        r.eachCell(cell => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? 'FFFAF5FF' : 'FFFFFFFF' } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        r.getCell('confeccionista').alignment = { horizontal: 'left', vertical: 'middle' };
        // Reemplazar valor de total por fórmula
        const totalCell = r.getCell('total');
        totalCell.value = { formula: `D${rowNum}-(F${rowNum}+G${rowNum}+H${rowNum}+I${rowNum}+J${rowNum})` };
        totalCell.numFmt = '0';
      });

      const buf = await wb.xlsx.writeBuffer();
      const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `Pendientes_Entrega_${Date.now()}.xlsx`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      setPendientesModalOpen(false);
    } catch (e) {
      alert('Error al generar Excel');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleImport = (imported: ImportedLoteRow[]) => {
    const newRows: LoteRow[] = imported.map(r => ({ ...newRow(), ...r }));
    newRows.forEach(r => dirtyIds.current.add(r.id));
    setRows(prev => [...newRows, ...prev]);
    setHasUnsavedChanges(true);
  };

  // Tooltip hover
  const [tooltip, setTooltip] = useState<{ visible: boolean; text: string; x: number; y: number }>({ visible: false, text: '', x: 0, y: 0 });

  // Aviso al cerrar/recargar la pestaña con cambios pendientes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  // Cerrar context menu al click fuera
  useEffect(() => {
    const close = (e: MouseEvent) => {
      // No cerrar si el click fue dentro del modal de comentario
      const target = e.target as HTMLElement;
      if (target.closest('[data-comment-modal]') || target.closest('[data-ctx-menu]')) return;
      setCtxMenu(m => ({ ...m, visible: false }));
      // Cerrar calendarios si se hace click fuera
      if (!target.closest('[data-fecha-remision-picker]') && !target.closest('[data-fecha-llegada-picker]')) {
        setShowFechaRemisionPicker(false);
        setShowFechaLlegadaPicker(false);
      }
    };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, []);

  // Focus en textarea al abrir modal
  useEffect(() => {
    if (commentModal.visible) {
      // Usar requestAnimationFrame para asegurar que el portal ya está montado
      const raf = requestAnimationFrame(() => {
        commentInputRef.current?.focus();
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [commentModal.visible]);

  // No guardamos automáticamente — el usuario debe presionar Guardar

  const clearFilters = () => {
    setFilterConfeccionista(''); setFilterRemision(''); setFilterRef('');
    setFilterSalida(''); setFilterFechaRemisionMes(''); setFilterFechaLlegadaMes('');
    setFilterFechaRemisionEspecifica(''); setFilterFechaLlegadaEspecifica('');
    setHideEntregados(false);
    setFilterOnlyVta(false);
    setFilterOnlyCobrado(false);
    setFilterTotalDiferente(false);
  };

  const hasFilters = filterConfeccionista || filterRemision || filterRef || filterSalida || filterFechaRemisionMes || filterFechaLlegadaMes || filterFechaRemisionEspecifica || filterFechaLlegadaEspecifica || hideEntregados;

  const filteredRows = rows.filter(row => {
    if (hideEntregados && row.fechaLlegada) return false;
    if (filterOnlyVta && toNum(row.vta) < 1) return false;
    if (filterOnlyCobrado && toNum(row.cobrado) < 1) return false;
    if (filterTotalDiferente && !(row.fechaLlegada && calcTotal(row) !== 0)) return false;
    if (filterConfeccionista && !row.confeccionista.toLowerCase().includes(filterConfeccionista.toLowerCase())) return false;
    if (filterRemision && !row.remision.toLowerCase().includes(filterRemision.toLowerCase())) return false;
    if (filterRef && !row.ref.toLowerCase().includes(filterRef.toLowerCase())) return false;
    if (filterSalida && !row.salida.includes(filterSalida)) return false;
    if (filterFechaRemisionMes && row.fechaRemision) {
      if (row.fechaRemision.slice(5, 7) !== filterFechaRemisionMes) return false;
    } else if (filterFechaRemisionMes && !row.fechaRemision) return false;
    if (filterFechaLlegadaMes && row.fechaLlegada) {
      if (row.fechaLlegada.slice(5, 7) !== filterFechaLlegadaMes) return false;
    } else if (filterFechaLlegadaMes && !row.fechaLlegada) return false;
    if (filterFechaRemisionEspecifica && row.fechaRemision !== filterFechaRemisionEspecifica) return false;
    if (filterFechaLlegadaEspecifica && row.fechaLlegada !== filterFechaLlegadaEspecifica) return false;
    return true;
  }).sort((a, b) => {
    if (a.isNew && !b.isNew) return -1;
    if (!a.isNew && b.isNew) return 1;
    return b.remision.localeCompare(a.remision, undefined, { numeric: true, sensitivity: 'base' });
  });

  const pagination = usePagination(1, 50);

  useEffect(() => {
    pagination.pagination.total = filteredRows.length;
    pagination.pagination.totalPages = Math.ceil(filteredRows.length / pagination.pagination.limit);
  }, [filteredRows.length, pagination.pagination.limit]);

  useEffect(() => { pagination.goToPage(1); }, [filterConfeccionista, filterRemision, filterRef, filterSalida, filterFechaRemisionMes, filterFechaLlegadaMes, filterFechaRemisionEspecifica, filterFechaLlegadaEspecifica]);

  const paginatedRows = useMemo(() => {
    const start = (pagination.pagination.page - 1) * pagination.pagination.limit;
    return filteredRows.slice(start, start + pagination.pagination.limit);
  }, [filteredRows, pagination.pagination.page, pagination.pagination.limit]);

  // Sugerencias de confeccionista desde las filas existentes
  const confeccionistasSuggestions = useMemo(() => {
    const seen = new Map<string, string>();
    rows.forEach(r => {
      const key = r.confeccionista.toLowerCase().trim();
      if (key && !seen.has(key)) seen.set(key, r.confeccionista.trim());
    });
    return Array.from(seen.values()).sort();
  }, [rows]);

  const updateRow = useCallback((id: string, field: keyof LoteRow, value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    dirtyIds.current.add(id);
    setHasUnsavedChanges(true);
  }, []);

  const addRow = () => {
    const r = newRow();
    dirtyIds.current.add(r.id);
    setRows(prev => [r, ...prev]);
    setHasUnsavedChanges(true);
  };

  const deleteRow = (id: string) => {
    if (rows.length === 1) {
      const r = newRow();
      dirtyIds.current.delete(id);
      dirtyIds.current.add(r.id);
      setRows([r]);
      if (persistedIds.current.has(id)) setDeletedIds(prev => [...prev, id]);
      setHasUnsavedChanges(true);
      return;
    }
    dirtyIds.current.delete(id);
    setRows(prev => prev.filter(r => r.id !== id));
    if (persistedIds.current.has(id)) setDeletedIds(prev => [...prev, id]);
    setHasUnsavedChanges(true);
  };

  // ---- Highlight ----
  const setRowHighlight = (rowId: string, color: HighlightColor) => {
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, rowHighlight: color } : r));
    dirtyIds.current.add(rowId);
    setHasUnsavedChanges(true);
  };

  const setCellHighlight = (rowId: string, fieldKey: string, color: HighlightColor) => {
    setRows(prev => prev.map(r => {
      if (r.id !== rowId) return r;
      const ch = { ...r.cellHighlights };
      if (color === null) delete ch[fieldKey]; else ch[fieldKey] = color;
      return { ...r, cellHighlights: ch };
    }));
    dirtyIds.current.add(rowId);
    setHasUnsavedChanges(true);
  };

  // ---- Comments ----
  const saveComment = (rowId: string, fieldKey: string, text: string) => {
    setRows(prev => prev.map(r => {
      if (r.id !== rowId) return r;
      const cc = { ...r.cellComments };
      if (!text.trim()) delete cc[fieldKey]; else cc[fieldKey] = text.trim();
      return { ...r, cellComments: cc };
    }));
    dirtyIds.current.add(rowId);
    setHasUnsavedChanges(true);
  };

  // ---- Context menu handler ----
  const handleContextMenu = (e: React.MouseEvent, rowId: string, fieldKey: string) => {
    e.preventDefault();
    setCtxMenu({ visible: true, x: e.clientX, y: e.clientY, rowId, fieldKey });
  };

  const openCommentModal = (rowId: string, fieldKey: string) => {
    const row = rows.find(r => r.id === rowId);
    setCommentModal({ visible: true, rowId, fieldKey, current: row?.cellComments[fieldKey] || '' });
    setCtxMenu(m => ({ ...m, visible: false }));
  };

  // ---- Tooltip handlers ----
  const handleMouseEnterCell = (e: React.MouseEvent, comment: string) => {
    if (!comment) return;
    setTooltip({ visible: true, text: comment, x: e.clientX, y: e.clientY });
  };
  const handleMouseMoveCell = (e: React.MouseEvent) => {
    if (tooltip.visible) setTooltip(t => ({ ...t, x: e.clientX, y: e.clientY }));
  };
  const handleMouseLeaveCell = () => setTooltip(t => ({ ...t, visible: false }));

  const Th: React.FC<{ children: React.ReactNode; className?: string; colSpan?: number; width?: string }> = ({ children, className = '', colSpan, width }) => (
    <th colSpan={colSpan} style={width ? { width, minWidth: width } : undefined} className={`px-2 py-1.5 text-xs font-bold text-center border border-slate-300 whitespace-nowrap ${className}`}>
      {children}
    </th>
  );

  // Obtener la fila del context menu activo
  const ctxRow = rows.find(r => r.id === ctxMenu.rowId);
  const ctxHasComment = ctxRow?.cellComments[ctxMenu.fieldKey];
  const ctxCellHighlight = ctxRow?.cellHighlights[ctxMenu.fieldKey];
  const ctxRowHighlight = ctxRow?.rowHighlight;

  // Props compartidos para Td
  const tdHandlers = {
    onContextMenu: handleContextMenu,
    onMouseEnter: handleMouseEnterCell,
    onMouseMove: handleMouseMoveCell,
    onMouseLeave: handleMouseLeaveCell,
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm gap-2">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
          Cargando datos...
        </div>
      )}
      {!loading && (<>
      {/* Tooltip de comentario - portal para no afectar el layout */}
      {tooltip.visible && ReactDOM.createPortal(
        <div
          className="fixed z-[9999] max-w-xs bg-yellow-50 border border-yellow-300 text-yellow-900 text-xs rounded shadow-lg px-3 py-2 pointer-events-none whitespace-pre-wrap"
          style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
        >
          💬 {tooltip.text}
        </div>,
        document.body
      )}

      {/* Context Menu - portal para no afectar el layout */}
      {ctxMenu.visible && ReactDOM.createPortal(
        <div
          className="fixed z-[9999] bg-white border border-slate-200 rounded-xl shadow-xl py-1 min-w-[200px] text-xs"
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
          data-ctx-menu
          onClick={e => e.stopPropagation()}
        >
          {/* Comentario */}
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comentario</div>
          <button
            onClick={() => openCommentModal(ctxMenu.rowId, ctxMenu.fieldKey)}
            className="w-full text-left px-4 py-1.5 hover:bg-slate-50 flex items-center gap-2"
          >
            <span>💬</span>
            {ctxHasComment ? 'Editar comentario' : 'Agregar comentario'}
          </button>
          {ctxHasComment && (
            <button
              onClick={() => { saveComment(ctxMenu.rowId, ctxMenu.fieldKey, ''); setCtxMenu(m => ({ ...m, visible: false })); }}
              className="w-full text-left px-4 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-red-500"
            >
              <span>🗑️</span> Eliminar comentario
            </button>
          )}

          <div className="border-t border-slate-100 my-1" />

          {/* Resaltar celda */}
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resaltar celda</div>
          <button onClick={() => { setCellHighlight(ctxMenu.rowId, ctxMenu.fieldKey, 'yellow'); setCtxMenu(m => ({ ...m, visible: false })); }}
            className="w-full text-left px-4 py-1.5 hover:bg-slate-50 flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-yellow-200 border border-yellow-400 inline-block"></span> Amarillo
          </button>
          <button onClick={() => { setCellHighlight(ctxMenu.rowId, ctxMenu.fieldKey, 'red'); setCtxMenu(m => ({ ...m, visible: false })); }}
            className="w-full text-left px-4 py-1.5 hover:bg-slate-50 flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-200 border border-red-400 inline-block"></span> Rojo
          </button>
          {ctxCellHighlight && (
            <button onClick={() => { setCellHighlight(ctxMenu.rowId, ctxMenu.fieldKey, null); setCtxMenu(m => ({ ...m, visible: false })); }}
              className="w-full text-left px-4 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-500">
              ✕ Quitar resaltado celda
            </button>
          )}

          <div className="border-t border-slate-100 my-1" />

          {/* Resaltar fila */}
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resaltar fila</div>
          <button onClick={() => { setRowHighlight(ctxMenu.rowId, 'yellow'); setCtxMenu(m => ({ ...m, visible: false })); }}
            className="w-full text-left px-4 py-1.5 hover:bg-slate-50 flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-yellow-200 border border-yellow-400 inline-block"></span> Amarillo
          </button>
          <button onClick={() => { setRowHighlight(ctxMenu.rowId, 'red'); setCtxMenu(m => ({ ...m, visible: false })); }}
            className="w-full text-left px-4 py-1.5 hover:bg-slate-50 flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-200 border border-red-400 inline-block"></span> Rojo
          </button>
          {ctxRowHighlight && (
            <button onClick={() => { setRowHighlight(ctxMenu.rowId, null); setCtxMenu(m => ({ ...m, visible: false })); }}
              className="w-full text-left px-4 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-500">
              ✕ Quitar resaltado fila
            </button>
          )}
        </div>,
        document.body
      )}

      {/* Modal de comentario - portal para no afectar el layout */}
      {commentModal.visible && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/30 z-[9999] flex items-center justify-center" onMouseDown={() => setCommentModal(m => ({ ...m, visible: false }))}>
          <div data-comment-modal className="bg-white rounded-2xl shadow-xl p-5 w-80 space-y-3" onMouseDown={e => e.stopPropagation()}>
            <h3 className="font-bold text-slate-800 text-sm">💬 Comentario</h3>
            <textarea
              ref={commentInputRef}
              value={commentModal.current}
              onChange={e => setCommentModal(m => ({ ...m, current: e.target.value }))}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-blue-400 resize-none overflow-auto"
              style={{ height: '80px' }}
              placeholder="Escribe tu comentario..."
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setCommentModal(m => ({ ...m, visible: false }))}
                className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
                Cancelar
              </button>
              <button
                onClick={() => { saveComment(commentModal.rowId, commentModal.fieldKey, commentModal.current); setCommentModal(m => ({ ...m, visible: false })); }}
                className="px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold">
                Guardar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Producto en Proceso</h2>
          <p className="text-slate-400 text-sm">Control de lotes enviados a confeccionistas y demás procesos</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-xs font-semibold rounded-xl transition-colors shadow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Generar informe
          </button>

          {/* Filtro Fecha Remisión */}
          <div className="relative" data-fecha-remision-picker>
            <button
              onClick={() => setShowFechaRemisionPicker(!showFechaRemisionPicker)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-colors border ${filterFechaRemisionEspecifica ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'}`}
              title="Filtrar por fecha de remisión específica"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {filterFechaRemisionEspecifica ? filterFechaRemisionEspecifica : 'Fecha remisión'}
            </button>
            {showFechaRemisionPicker && (
              <div className="absolute top-full mt-1 left-0 z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-2">
                <input
                  type="date"
                  value={filterFechaRemisionEspecifica}
                  onChange={e => setFilterFechaRemisionEspecifica(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-400"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Filtro Fecha Llegada */}
          <div className="relative" data-fecha-llegada-picker>
            <button
              onClick={() => setShowFechaLlegadaPicker(!showFechaLlegadaPicker)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-colors border ${filterFechaLlegadaEspecifica ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-600 border-slate-300 hover:border-green-400'}`}
              title="Filtrar por fecha de llegada específica"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0121 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {filterFechaLlegadaEspecifica ? filterFechaLlegadaEspecifica : 'Fecha llegada'}
            </button>
            {showFechaLlegadaPicker && (
              <div className="absolute top-full mt-1 left-0 z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-2">
                <input
                  type="date"
                  value={filterFechaLlegadaEspecifica}
                  onChange={e => setFilterFechaLlegadaEspecifica(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-green-400"
                  autoFocus
                />
              </div>
            )}
          </div>

          {editable && (
            <>
            <button
              onClick={() => setHideEntregados(h => !h)}
              className={`flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl transition-colors border ${hideEntregados ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
              {hideEntregados ? 'Mostrando pendientes' : 'Ocultar entregados'}
            </button>
            <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-xl transition-colors">
              <span className="text-sm font-black leading-none">✕</span>
              Limpiar filtros
            </button>
            <button onClick={addRow} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Agregar fila
            </button>
            {user.role === UserRole.SOPORTE && (
              <button onClick={() => setImportModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors shadow">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Importar Excel
              </button>
            )}
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-xl border border-red-200">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-bold text-xs">Cambios sin guardar</span>
              </div>
            )}
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors shadow ${hasUnsavedChanges ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-200 text-slate-500 cursor-default'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Guardar
            </button>
            </>
          )}
        </div>
      </div>

      {/* Tabla */}
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
              <Th className="bg-slate-200" width="220px">CONFECCIONISTA</Th>
              <Th className="bg-slate-200">REMISIÓN</Th>
              <Th className="bg-slate-200">REF</Th>
              <Th className="bg-slate-200">SALIDA</Th>
              <Th className="bg-blue-100 text-blue-800">FECHA REMISIÓN</Th>
              <Th className="bg-slate-200">ENTREGA</Th>
              <Th className="bg-slate-200">SEGUNDAS</Th>
              <Th className="bg-slate-200">VTA</Th>
              <Th className="bg-slate-200">COBRADO</Th>
              <Th className="bg-slate-200">INCOMPLETO</Th>
              <Th className="bg-slate-200">TOTAL</Th>
              <Th className="bg-green-100 text-green-800">FECHA LLEGADA</Th>
              <Th className="bg-emerald-50" width="28px">SALIDA</Th>
              <Th className="bg-emerald-50" width="28px">ENTREGA</Th>
              <Th className="bg-emerald-50">TOTAL</Th>
              <Th className="bg-purple-50" width="28px">SALIDA</Th>
              <Th className="bg-purple-50" width="28px">ENTREGA</Th>
              <Th className="bg-purple-50">TOTAL</Th>
              <Th className="bg-orange-50">DÍAS</Th>
              {editable && <Th className="bg-slate-100"></Th>}
            </tr>
            {/* Fila de filtros */}
            <tr className="bg-slate-100">
              <th className="border border-slate-200 px-1 py-0.5">
                <input type="text" value={filterConfeccionista} onChange={e => setFilterConfeccionista(e.target.value)} placeholder="Filtrar..." className="w-full px-1 py-0.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-400 bg-white" />
              </th>
              <th className="border border-slate-200 px-1 py-0.5">
                <input type="text" value={filterRemision} onChange={e => setFilterRemision(e.target.value)} placeholder="Filtrar..." className="w-full px-1 py-0.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-400 bg-white" />
              </th>
              <th className="border border-slate-200 px-1 py-0.5">
                <input type="text" value={filterRef} onChange={e => setFilterRef(e.target.value)} placeholder="Filtrar..." className="w-full px-1 py-0.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-400 bg-white" />
              </th>
              <th className="border border-slate-200 px-1 py-0.5">
                <input type="text" value={filterSalida} onChange={e => setFilterSalida(e.target.value)} placeholder="Filtrar..." className="w-full px-1 py-0.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-400 bg-white" />
              </th>
              <th className="border border-slate-200 px-1 py-0.5 bg-blue-50">
                <select value={filterFechaRemisionMes} onChange={e => setFilterFechaRemisionMes(e.target.value)} className="w-full px-1 py-0.5 text-xs border border-blue-300 rounded bg-white focus:outline-none">
                  <option value="">Mes</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{new Date(2000, i).toLocaleString('es', { month: 'long' })}</option>
                  ))}
                </select>
              </th>
              <th className="border border-slate-200"></th>
              <th className="border border-slate-200"></th>
              <th className="border border-slate-200 px-1 py-0.5 text-center">
                <button onClick={() => setFilterOnlyVta(v => !v)} title={filterOnlyVta ? 'Mostrando solo con VTA ≥ 1' : 'Mostrar solo con VTA ≥ 1'} className={`p-0.5 rounded transition-colors ${filterOnlyVta ? 'text-blue-600' : 'text-slate-300 hover:text-slate-500'}`}>
                  {filterOnlyVta ? (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" /><path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" /></svg>) : (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>)}
                </button>
              </th>
              <th className="border border-slate-200 px-1 py-0.5 text-center">
                <button onClick={() => setFilterOnlyCobrado(v => !v)} title={filterOnlyCobrado ? 'Mostrando solo con COBRADO ≥ 1' : 'Mostrar solo con COBRADO ≥ 1'} className={`p-0.5 rounded transition-colors ${filterOnlyCobrado ? 'text-blue-600' : 'text-slate-300 hover:text-slate-500'}`}>
                  {filterOnlyCobrado ? (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" /><path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" /></svg>) : (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>)}
                </button>
              </th>
              <th className="border border-slate-200"></th>
              <th className="border border-slate-200 px-1 py-0.5 text-center">
                <button onClick={() => setFilterTotalDiferente(v => !v)} title={filterTotalDiferente ? 'Mostrando llegados con TOTAL ≠ 0' : 'Mostrar llegados con TOTAL ≠ 0'} className={`p-0.5 rounded transition-colors ${filterTotalDiferente ? 'text-orange-600' : 'text-slate-300 hover:text-slate-500'}`}>
                  {filterTotalDiferente ? (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" /><path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" /></svg>) : (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>)}
                </button>
              </th>
              <th className="border border-slate-200 px-1 py-0.5 bg-green-50">
                <select value={filterFechaLlegadaMes} onChange={e => setFilterFechaLlegadaMes(e.target.value)} className="w-full px-1 py-0.5 text-xs border border-green-300 rounded bg-white focus:outline-none">
                  <option value="">Mes</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{new Date(2000, i).toLocaleString('es', { month: 'long' })}</option>
                  ))}
                </select>
              </th>
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
            {paginatedRows.map((row, idx) => {
              const total = calcTotal(row);
              const tTotal = calcTalegosTotal(row);
              const mTotal = calcMuestrasTotal(row);
              const rotacion = calcRotacion(row);
              const hasData = row.salida !== '' || row.entrega !== '';
              // Fila: celda highlight tiene prioridad sobre row highlight, row highlight sobre alterno
              const baseRowBg = row.rowHighlight ? rowHighlightClass(row.rowHighlight) : (idx % 2 === 0 ? 'bg-white' : 'bg-slate-50');

              return (
                <tr key={row.id} className={`${baseRowBg} hover:brightness-95 transition-all`} style={{ height: '28px' }}>
                  <Td {...tdHandlers} rowId={row.id} fieldKey="confeccionista" row={row}>
                    {editable ? (
                      <TextAutocomplete
                        value={row.confeccionista}
                        onChange={v => updateRow(row.id, 'confeccionista', v)}
                        suggestions={confeccionistasSuggestions}
                        placeholder=""
                      />
                    ) : (
                      <div className="px-2 py-1 text-xs font-semibold text-left" style={{ minWidth: '220px' }}>{row.confeccionista}</div>
                    )}
                  </Td>
                  <Td {...tdHandlers} rowId={row.id} fieldKey="remision" row={row}>
                    <Cell value={row.remision} onChange={v => updateRow(row.id, 'remision', v)} readOnly={!editable} minWidth="55px" />
                  </Td>
                  <Td {...tdHandlers} rowId={row.id} fieldKey="ref" row={row}>
                    <Cell value={row.ref} onChange={v => updateRow(row.id, 'ref', v)} readOnly={!editable} minWidth="45px" />
                  </Td>
                  <Td {...tdHandlers} rowId={row.id} fieldKey="salida" row={row}>
                    <Cell value={row.salida} onChange={v => updateRow(row.id, 'salida', v)} type="number" readOnly={!editable} minWidth="40px" />
                  </Td>
                  <Td {...tdHandlers} rowId={row.id} fieldKey="fechaRemision" row={row} baseHighlight="bg-blue-50">
                    <Cell value={row.fechaRemision} onChange={v => updateRow(row.id, 'fechaRemision', v)} type="date" readOnly={!editable} minWidth="120px" />
                  </Td>
                  <Td {...tdHandlers} rowId={row.id} fieldKey="entrega" row={row}>
                    <Cell value={row.entrega} onChange={v => updateRow(row.id, 'entrega', v)} type="number" readOnly={!editable} minWidth="45px" />
                  </Td>
                  <Td {...tdHandlers} rowId={row.id} fieldKey="segundas" row={row}>
                    <Cell value={row.segundas} onChange={v => updateRow(row.id, 'segundas', v)} type="number" readOnly={!editable} minWidth="45px" />
                  </Td>
                  <Td {...tdHandlers} rowId={row.id} fieldKey="vta" row={row}>
                    <Cell value={row.vta} onChange={v => updateRow(row.id, 'vta', v)} type="number" readOnly={!editable} minWidth="45px" />
                  </Td>
                  <Td {...tdHandlers} rowId={row.id} fieldKey="cobrado" row={row}>
                    <Cell value={row.cobrado} onChange={v => updateRow(row.id, 'cobrado', v)} type="number" readOnly={!editable} minWidth="45px" />
                  </Td>
                  <Td {...tdHandlers} rowId={row.id} fieldKey="incompleto" row={row}>
                    <Cell value={row.incompleto} onChange={v => updateRow(row.id, 'incompleto', v)} type="number" readOnly={!editable} minWidth="45px" />
                  </Td>
                  <Td {...tdHandlers} rowId={row.id} fieldKey="total" row={row} className="text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${hasData ? totalColor(total) : ''}`}>
                      {hasData ? total : ''}
                    </span>
                  </Td>
                  <Td {...tdHandlers} rowId={row.id} fieldKey="fechaLlegada" row={row} baseHighlight="bg-green-50">
                    {editable ? (
                      <input
                        type="date"
                        value={row.fechaLlegada}
                        onChange={e => updateRow(row.id, 'fechaLlegada', e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full px-1 text-xs border border-transparent hover:border-slate-300 focus:border-blue-400 focus:outline-none rounded bg-transparent focus:bg-white text-center"
                        style={{ minWidth: '120px', height: '22px', boxSizing: 'border-box' }}
                      />
                    ) : (
                      <div className="px-2 py-1 text-xs font-semibold text-center" style={{ minWidth: '120px' }}>{row.fechaLlegada}</div>
                    )}
                  </Td>
                  <Td {...tdHandlers} rowId={row.id} fieldKey="talegosSalida" row={row} baseHighlight="bg-emerald-50/40">
                    <Cell value={row.talegosSalida} onChange={v => updateRow(row.id, 'talegosSalida', v)} type="number" readOnly={!editable} minWidth="28px" />
                  </Td>
                  <Td {...tdHandlers} rowId={row.id} fieldKey="talegosEntrega" row={row} baseHighlight="bg-emerald-50/40">
                    <Cell value={row.talegosEntrega} onChange={v => updateRow(row.id, 'talegosEntrega', v)} type="number" readOnly={!editable} minWidth="28px" />
                  </Td>
                  <Td {...tdHandlers} rowId={row.id} fieldKey="talegosTotal" row={row} baseHighlight="bg-emerald-50/40" className="text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${row.talegosSalida !== '' ? totalColor(tTotal) : ''}`}>
                      {row.talegosSalida !== '' ? tTotal : ''}
                    </span>
                  </Td>
                  <Td {...tdHandlers} rowId={row.id} fieldKey="muestrasSalida" row={row} baseHighlight="bg-purple-50/40">
                    <Cell value={row.muestrasSalida} onChange={v => updateRow(row.id, 'muestrasSalida', v)} type="number" readOnly={!editable} minWidth="28px" />
                  </Td>
                  <Td {...tdHandlers} rowId={row.id} fieldKey="muestrasEntrega" row={row} baseHighlight="bg-purple-50/40">
                    <Cell value={row.muestrasEntrega} onChange={v => updateRow(row.id, 'muestrasEntrega', v)} type="number" readOnly={!editable} minWidth="28px" />
                  </Td>
                  <Td {...tdHandlers} rowId={row.id} fieldKey="muestrasTotal" row={row} baseHighlight="bg-purple-50/40" className="text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${row.muestrasSalida !== '' ? totalColor(mTotal) : ''}`}>
                      {row.muestrasSalida !== '' ? mTotal : ''}
                    </span>
                  </Td>
                  <Td {...tdHandlers} rowId={row.id} fieldKey="rotacion" row={row} baseHighlight="bg-orange-50/40" className="text-center">
                    <span className="text-xs font-semibold text-slate-600">{rotacion}</span>
                  </Td>
                  {editable && (
                    <td className="border border-slate-200 px-1 py-0.5 text-center">
                      <button onClick={() => deleteRow(row.id)} className="text-red-400 hover:text-red-600 transition-colors p-0.5" title="Eliminar fila">
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

      <PaginationComponent
        currentPage={pagination.pagination.page}
        totalPages={pagination.pagination.totalPages}
        pageSize={pagination.pagination.limit}
        onPageChange={pagination.goToPage}
        onPageSizeChange={pagination.setLimit}
      />

      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 border border-green-300 inline-block"></span> TOTAL = 0</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block"></span> TOTAL &gt; 0 (faltan unidades)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300 inline-block"></span> TOTAL &lt; 0 (exceso)</span>
        <span className="flex items-center gap-1"><span className="inline-block w-0 h-0" style={{ borderStyle:'solid', borderWidth:'0 7px 7px 0', borderColor:'transparent #f97316 transparent transparent' }}></span> Tiene comentario</span>
      </div>

      {/* Modal efectividad de terceros */}
      {efectividadModalOpen && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4" onMouseDown={() => !generatingReport && setEfectividadModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" onMouseDown={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-600 to-violet-700 px-8 py-7">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Efectividad de terceros</h2>
                  <p className="text-purple-200 text-xs">Análisis de rendimiento por confeccionista</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Métricas principales */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-black text-white">{efectividadData.talleresUnicos}</span>
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">Talleres activos</p>
                    <p className="text-slate-400 text-xs">Nombres únicos</p>
                  </div>
                </div>
                <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-black text-white">{efectividadData.promedioRotacion}d</span>
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">Prom. rotación</p>
                    <p className="text-slate-400 text-xs">Días promedio</p>
                  </div>
                </div>
              </div>

              {/* Fila de proceso */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">En proceso actualmente</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-black text-slate-800">{efectividadData.lotesEnProceso}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Lotes</p>
                  </div>
                  <div className="border-x border-slate-200">
                    <p className="text-2xl font-black text-slate-800">{efectividadData.unidadesEnProceso}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Unidades</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-800">{efectividadData.referenciasEnProceso}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Referencias</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-slate-600 text-sm font-semibold">Generar informe de Efectividad de terceros</p>
              </div>

              {/* Botones formato */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={generateEfectividadPDF} disabled={generatingReport}
                  className="group flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-red-100 hover:border-red-400 hover:bg-red-50 transition-all disabled:opacity-50">
                  <div className="w-10 h-10 bg-red-100 group-hover:bg-red-200 rounded-xl flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-red-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <span className="font-black text-red-700 text-sm">PDF</span>
                  <span className="text-xs text-slate-400">Documento imprimible</span>
                </button>
                <button onClick={generateEfectividadExcel} disabled={generatingReport}
                  className="group flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-emerald-100 hover:border-emerald-400 hover:bg-emerald-50 transition-all disabled:opacity-50">
                  <div className="w-10 h-10 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-emerald-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125v-1.5c0-.621.504-1.125 1.125-1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125m1.125-1.125V4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v13.5m-3.75 0h3.75m-3.75 0c0 .621.504 1.125 1.125 1.125h1.5c.621 0 1.125-.504 1.125-1.125m-6.75 0V4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v13.5m0 0h3.75" />
                    </svg>
                  </div>
                  <span className="font-black text-emerald-700 text-sm">Excel</span>
                  <span className="text-xs text-slate-400">Hoja de cálculo</span>
                </button>
              </div>

              {generatingReport && (
                <div className="flex items-center justify-center gap-2 text-purple-600 text-sm font-semibold">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  Generando informe...
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => { setEfectividadModalOpen(false); setReportModalOpen(true); }} disabled={generatingReport}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 font-semibold transition-colors disabled:opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Volver
              </button>
              <button onClick={() => setEfectividadModalOpen(false)} disabled={generatingReport} className="ml-auto text-sm text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50">
                Cancelar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ProductoEnProcesoImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImport}
      />

      {/* Modal pendientes de entrega */}      {pendientesModalOpen && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4" onMouseDown={() => !generatingReport && setPendientesModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onMouseDown={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-br from-violet-600 to-purple-700 px-8 py-7">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Pendientes de entrega</h2>
                  <p className="text-violet-200 text-xs">Lotes sin fecha de llegada</p>
                </div>
              </div>
            </div>

            {/* Cuerpo */}
            <div className="p-8 space-y-6">
              {/* Contador */}
              <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-black text-white">{lotesPendientes.length}</span>
                </div>
                <div>
                  <p className="font-black text-slate-800 text-base">
                    Hay <span className="text-violet-700">{lotesPendientes.length} lote{lotesPendientes.length !== 1 ? 's' : ''}</span> pendiente{lotesPendientes.length !== 1 ? 's' : ''} por llegar
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">Registros sin fecha de llegada registrada</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-slate-600 text-sm font-semibold">¿Desea generar el informe para revisar lotes a entregar?</p>
              </div>

              {/* Botones de formato */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={generatePendientesPDF}
                  disabled={generatingReport || lotesPendientes.length === 0}
                  className="group flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-red-100 hover:border-red-400 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 bg-red-100 group-hover:bg-red-200 rounded-xl flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-red-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <span className="font-black text-red-700 text-sm">PDF</span>
                  <span className="text-xs text-slate-400">Documento imprimible</span>
                </button>

                <button
                  onClick={generatePendientesExcel}
                  disabled={generatingReport || lotesPendientes.length === 0}
                  className="group flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-emerald-100 hover:border-emerald-400 hover:bg-emerald-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-emerald-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125v-1.5c0-.621.504-1.125 1.125-1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125m1.125-1.125V4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v13.5m-3.75 0h3.75m-3.75 0c0 .621.504 1.125 1.125 1.125h1.5c.621 0 1.125-.504 1.125-1.125m-6.75 0V4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v13.5m0 0h3.75" />
                    </svg>
                  </div>
                  <span className="font-black text-emerald-700 text-sm">Excel</span>
                  <span className="text-xs text-slate-400">Hoja de cálculo</span>
                </button>
              </div>

              {generatingReport && (
                <div className="flex items-center justify-center gap-2 text-violet-600 text-sm font-semibold">
                  <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                  Generando informe...
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 pb-6 flex gap-3">
              <button
                onClick={() => { setPendientesModalOpen(false); setReportModalOpen(true); }}
                disabled={generatingReport}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 font-semibold transition-colors disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Volver
              </button>
              <button onClick={() => setPendientesModalOpen(false)} disabled={generatingReport} className="ml-auto text-sm text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50">
                Cancelar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal selector de informe */}
      {reportModalOpen && ReactDOM.createPortal(
        <div
          className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4"
          onMouseDown={() => setReportModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            onMouseDown={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-violet-600 to-purple-700 px-8 py-7">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Generar informe</h2>
                  <p className="text-violet-200 text-xs">Selecciona el tipo de informe</p>
                </div>
              </div>
            </div>

            {/* Opciones */}
            <div className="p-6 space-y-3">
              <button
                onClick={() => { setReportModalOpen(false); setPendientesModalOpen(true); }}
                className="w-full group flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-violet-300 hover:bg-violet-50 transition-all text-left"
              >
                <div className="w-11 h-11 bg-violet-100 group-hover:bg-violet-200 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-violet-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm group-hover:text-violet-700 transition-colors">Pendientes de entrega</p>
                  <p className="text-xs text-slate-400 mt-0.5">Lotes enviados sin fecha de llegada</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-slate-300 group-hover:text-violet-400 ml-auto transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>

              <button
                onClick={() => { setReportModalOpen(false); setEfectividadModalOpen(true); }}
                className="w-full group flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-purple-300 hover:bg-purple-50 transition-all text-left"
              >
                <div className="w-11 h-11 bg-purple-100 group-hover:bg-purple-200 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-purple-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm group-hover:text-purple-700 transition-colors">Efectividad de terceros</p>
                  <p className="text-xs text-slate-400 mt-0.5">Análisis de rendimiento por confeccionista</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-slate-300 group-hover:text-purple-400 ml-auto transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <button
                onClick={() => setReportModalOpen(false)}
                className="w-full py-2.5 text-sm text-slate-500 hover:text-slate-700 font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      </>)}
    </div>
  );
};

export default ProductoEnProcesoView;