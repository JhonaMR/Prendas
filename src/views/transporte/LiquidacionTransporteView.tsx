import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useDarkMode } from '../../context/DarkModeContext';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Transportista { id: string; nombre: string; colorKey: string; }
interface ItemRuta { id: string; taller: string; celular: string; direccion: string; sector: string; detalle: string; servicio: string; }
interface RutaTransporte { id: string; fecha: string; transportistaId: string; items: ItemRuta[]; }
interface Taller { id: string; nombre: string; PrecioCarro: string; PrecioMoto: string; }

interface FilaLiquidacion {
  uid: string;
  fecha: string;
  taller: string;
  detalle: string;
  valor: number;
  servicio: string;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const COLORES: Record<string, { dot: string; bg: string; text: string; border: string; bgDark?: string; textDark?: string; borderDark?: string }> = {
  red:    { dot: 'bg-red-400',    bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    bgDark: 'bg-red-900/30', textDark: 'text-red-300', borderDark: 'border-red-700' },
  green:  { dot: 'bg-green-400',  bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  bgDark: 'bg-green-900/30', textDark: 'text-green-300', borderDark: 'border-green-700' },
  blue:   { dot: 'bg-blue-400',   bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   bgDark: 'bg-blue-900/30', textDark: 'text-blue-300', borderDark: 'border-blue-700' },
  yellow: { dot: 'bg-yellow-400', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', bgDark: 'bg-yellow-900/30', textDark: 'text-yellow-300', borderDark: 'border-yellow-700' },
  purple: { dot: 'bg-purple-400', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', bgDark: 'bg-purple-900/30', textDark: 'text-purple-300', borderDark: 'border-purple-700' },
  orange: { dot: 'bg-orange-400', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', bgDark: 'bg-orange-900/30', textDark: 'text-orange-300', borderDark: 'border-orange-700' },
  pink:   { dot: 'bg-pink-400',   bg: 'bg-pink-50',   text: 'text-pink-700',   border: 'border-pink-200',   bgDark: 'bg-pink-900/30', textDark: 'text-pink-300', borderDark: 'border-pink-700' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtFechaCorta(f: string) {
  if (!f) return '';
  const [a, m, d] = f.split('-');
  return `${d}/${m}/${a}`;
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Gilberto → precio moto; todos los demás → precio carro
function inferirValor(nombreTransportista: string, tallerData: Taller | undefined): number {
  if (!tallerData) return 0;
  if (nombreTransportista.toLowerCase().includes('gilberto')) {
    return Number(tallerData.PrecioMoto) || 0;
  }
  return Number(tallerData.PrecioCarro) || 0;
}

// ─── Componente principal ─────────────────────────────────────────────────────

const LiquidacionTransporteView: React.FC = () => {
  const { isDark } = useDarkMode();
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  const [transportistas, setTransportistas] = useState<Transportista[]>([]);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [rutas, setRutas] = useState<RutaTransporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);

  const [transportistaId, setTransportistaId] = useState<string>('');
  const [fechaDesde, setFechaDesde] = useState<string>(toDateKey(primerDiaMes));
  const [fechaHasta, setFechaHasta] = useState<string>(toDateKey(hoy));

  // Filas editables de la liquidación (solo visual, no toca BD)
  const [filas, setFilas] = useState<FilaLiquidacion[]>([]);
  const [buscado, setBuscado] = useState(false);

  // Celda en edición
  const [editando, setEditando] = useState<{ uid: string; campo: keyof FilaLiquidacion } | null>(null);
  const [editValor, setEditValor] = useState<string>('');

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [ts, tls, rs] = await Promise.all([
        (api as any).getTransportistas(),
        (api as any).getTalleres(),
        (api as any).getRutasTransporte(),
      ]);
      setTransportistas(ts as Transportista[]);
      setTalleres(tls as Taller[]);
      setRutas(rs as RutaTransporte[]);
    } catch (e) {
      console.error('Error cargando datos:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  // ── Buscar ──
  const buscar = () => {
    if (!transportistaId || !fechaDesde || !fechaHasta) return;
    const transportista = transportistas.find((t: Transportista) => t.id === transportistaId);
    if (!transportista) return;

    const desde = new Date(fechaDesde + 'T00:00:00');
    const hasta = new Date(fechaHasta + 'T00:00:00');

    const rutasFiltradas = rutas.filter((r: RutaTransporte) => {
      if (r.transportistaId !== transportistaId) return false;
      const f = new Date(r.fecha + 'T00:00:00');
      return f >= desde && f <= hasta;
    });
    rutasFiltradas.sort((a: RutaTransporte, b: RutaTransporte) => a.fecha.localeCompare(b.fecha));

    const resultado: FilaLiquidacion[] = [];
    for (const ruta of rutasFiltradas) {
      for (const item of (ruta.items || [])) {
        const tallerData = talleres.find((t: Taller) =>
          t.nombre.toLowerCase().trim() === item.taller.toLowerCase().trim()
        );
        resultado.push({
          uid: `${ruta.id}-${item.id}`,
          fecha: ruta.fecha,
          taller: item.taller,
          detalle: item.detalle,
          valor: inferirValor(transportista.nombre, tallerData),
          servicio: item.servicio,
        });
      }
    }
    setFilas(resultado);
    setBuscado(true);
  };

  const total = filas.reduce((s, f) => s + (Number(f.valor) || 0), 0);

  const transportistaSeleccionado = transportistas.find((t: Transportista) => t.id === transportistaId);
  const colorInfo = transportistaSeleccionado
    ? (COLORES[transportistaSeleccionado.colorKey] || COLORES['pink'])
    : COLORES['pink'];

  // ── Eliminar fila (solo visual) ──
  const eliminarFila = (uid: string) => {
    setFilas(prev => prev.filter(f => f.uid !== uid));
  };

  // ── Agregar fila manual ──
  const agregarFila = () => {
    setFilas(prev => [...prev, {
      uid: `manual-${Date.now()}-${Math.random()}`,
      fecha: '',
      taller: '',
      detalle: '',
      valor: 0,
      servicio: '',
    }]);
  };

  // ── Edición inline ──
  const iniciarEdicion = (uid: string, campo: keyof FilaLiquidacion, valorActual: string | number) => {
    setEditando({ uid, campo });
    setEditValor(String(valorActual));
  };

  const confirmarEdicion = () => {
    if (!editando) return;
    const { uid, campo } = editando;
    setFilas(prev => prev.map(f => {
      if (f.uid !== uid) return f;
      if (campo === 'valor') {
        const num = parseInt(editValor.replace(/\D/g, ''), 10);
        return { ...f, valor: isNaN(num) ? 0 : num };
      }
      return { ...f, [campo]: editValor };
    }));
    setEditando(null);
  };

  const cancelarEdicion = () => setEditando(null);

  // ── Exportar Excel ──
  const exportarExcel = async () => {
    if (!transportistaSeleccionado || filas.length === 0) return;
    setExportando(true);
    try {
      const ExcelJS = await import('exceljs');
      const wb = new ExcelJS.Workbook();
      const nombreHoja = transportistaSeleccionado.nombre.toUpperCase().trim();
      const ws = wb.addWorksheet(nombreHoja);

      // Anchos: col A reducida, B-F con datos
      ws.getColumn(1).width = 4;
      ws.getColumn(2).width = 14;
      ws.getColumn(3).width = 36;
      ws.getColumn(4).width = 52;
      ws.getColumn(5).width = 14;
      ws.getColumn(6).width = 22;

      // Fila 1: vacía
      ws.addRow(['', '', '', '', '', '']);

      // Fila 2: nombre transportista en B2, combinado B2:F2
      const filaHeader = ws.addRow(['', nombreHoja, '', '', '', '']);
      ws.mergeCells('B2:F2');
      filaHeader.getCell(2).font = { bold: true, size: 13 };
      filaHeader.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
      filaHeader.height = 22;

      // Fila 3: vacía (separador)
      ws.addRow(['', '', '', '', '', '']);

      // Fila 4: encabezados en B4:F4
      const filaEncabezados = ws.addRow(['', 'FECHA', 'NOMBRE DESTINO', 'DETALLE', 'VALOR', 'SERVICIO']);
      filaEncabezados.font = { bold: true };
      filaEncabezados.height = 18;
      for (let col = 2; col <= 6; col++) {
        const cell = filaEncabezados.getCell(col);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
        cell.border = { bottom: { style: 'thin', color: { argb: 'FF94A3B8' } } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }

      // Filas de datos desde fila 5
      const filaInicioData = 5;
      filas.forEach((fila, idx) => {
        const row = ws.addRow(['', fila.fecha, fila.taller, fila.detalle, fila.valor, fila.servicio]);
        row.getCell(2).numFmt = 'dd/mm/yyyy';
        row.getCell(5).numFmt = '#,##0';
        const fillColor = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF8FAFC';
        for (let col = 2; col <= 6; col++) {
          row.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
        }
      });

      // Fila de liquidación con fórmula SUM en columna E
      const filaFinData = filaInicioData + filas.length - 1;
      const labelLiq = `LIQUIDACION DEL ${fmtFechaCorta(fechaDesde)} AL ${fmtFechaCorta(fechaHasta)}`;
      const totalRow = ws.addRow([
        '',
        '',
        labelLiq,
        '',
        { formula: `SUM(E${filaInicioData}:E${filaFinData})` },
        '',
      ]);
      totalRow.font = { bold: true };
      totalRow.getCell(5).numFmt = '#,##0';
      for (let col = 2; col <= 6; col++) {
        totalRow.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9C4' } };
      }
      // Combinar C:D en la fila de liquidación
      const filaLiqNum = totalRow.number;
      ws.mergeCells(`C${filaLiqNum}:D${filaLiqNum}`);
      totalRow.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PAGO TRANSPORTE ${nombreHoja} ${fechaDesde} AL ${fechaHasta}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error exportando Excel:', e);
    } finally {
      setExportando(false);
    }
  };

  // ── Celda editable inline ──
  const CeldaEditable = (props: {
    uid: string;
    campo: keyof FilaLiquidacion;
    valor: string | number;
    className?: string;
    esValor?: boolean;
  }) => {
    const { uid, campo, valor, className = '', esValor = false } = props;
    const activo = editando?.uid === uid && editando?.campo === campo;
    if (activo) {
      return (
        <input
          type="text"
          autoFocus
          value={editValor}
          onChange={e => setEditValor(esValor ? e.target.value.replace(/\D/g, '') : e.target.value)}
          onBlur={confirmarEdicion}
          onKeyDown={e => {
            if (e.key === 'Enter') confirmarEdicion();
            if (e.key === 'Escape') cancelarEdicion();
          }}
          className={`w-full px-2 py-1 border-2 border-pink-400 rounded-lg text-sm focus:outline-none transition-colors duration-300 ${esValor ? 'text-right' : ''} ${isDark ? 'bg-[#3d2d52] text-violet-100 border-violet-600' : 'bg-white text-slate-900'} ${className}`}
        />
      );
    }
    return (
      <button
        onClick={() => iniciarEdicion(uid, campo, valor)}
        title="Clic para editar"
        className={`w-full text-left rounded px-1 py-0.5 transition-colors duration-300 ${isDark ? 'hover:bg-violet-900/30 hover:text-violet-300 text-violet-300' : 'hover:bg-pink-50 hover:text-pink-700 text-slate-900'} ${className}`}
      >
        {esValor
          ? <span className={`block text-right transition-colors duration-300 ${Number(valor) > 0 ? (isDark ? 'text-violet-100' : 'text-slate-800') : (isDark ? 'text-violet-600' : 'text-slate-300')}`}>
              {Number(valor) > 0 ? `$ ${Number(valor).toLocaleString('es-CO')}` : 'Sin precio'}
            </span>
          : <span className={`block transition-colors duration-300 ${!valor ? (isDark ? 'text-violet-600' : 'text-slate-300') : (isDark ? 'text-violet-200' : 'text-slate-900')}`}>{valor || '—'}</span>
        }
      </button>
    );
  };

  // ── Render ──

  if (loading) {
    return (
      <div className={`h-full flex items-center justify-center text-sm transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] text-violet-400' : 'bg-white text-slate-400'}`}>
        Cargando...
      </div>
    );
  }

  return (
    <div className={`h-full w-full flex flex-col p-4 md:p-8 overflow-auto transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-transparent'}`}>

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl md:text-4xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>Liquidación de Transporte</h1>
          <p className={`text-sm mt-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Resumen de servicios por transportista en un rango de fechas</p>
        </div>
        <button
          onClick={exportarExcel}
          disabled={exportando || filas.length === 0}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm whitespace-nowrap flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          {exportando ? 'Exportando...' : 'Exportar Excel'}
        </button>
      </div>

      {/* Filtros */}
      <div className={`rounded-2xl border shadow-sm p-5 mb-6 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col sm:flex-row gap-4 items-end">

          {/* Transportista */}
          <div className="flex-1 min-w-0">
            <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>
              Transportista
            </label>
            <div className="relative">
              {transportistaSeleccionado && (
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${colorInfo.dot}`} />
              )}
              <select
                value={transportistaId}
                onChange={e => { setTransportistaId(e.target.value); setFilas([]); setBuscado(false); }}
                className={`w-full appearance-none border-2 rounded-xl text-sm font-semibold py-2.5 pr-4 focus:outline-none transition-colors duration-300
                  ${transportistaSeleccionado 
                    ? `pl-8 ${isDark ? (colorInfo.borderDark || 'border-violet-600') : colorInfo.border} ${isDark ? (colorInfo.bgDark || 'bg-violet-900/20') : colorInfo.bg} ${isDark ? (colorInfo.textDark || 'text-violet-200') : colorInfo.text}` 
                    : `pl-4 ${isDark ? 'border-violet-600 bg-[#3d2d52] text-violet-200 focus:border-violet-500' : 'border-slate-200 bg-white text-slate-700 focus:border-pink-400'}`}`}
              >
                <option value="">Seleccionar transportista...</option>
                {transportistas.map((t: Transportista) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fecha desde */}
          <div className="flex-1 min-w-0">
            <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>
              Desde
            </label>
            <input
              type="date"
              value={fechaDesde}
              onChange={e => { setFechaDesde(e.target.value); setFilas([]); setBuscado(false); }}
              className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:border-violet-500' : 'bg-white border-slate-200 text-slate-900 focus:border-pink-400'}`}
            />
          </div>

          {/* Fecha hasta */}
          <div className="flex-1 min-w-0">
            <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>
              Hasta
            </label>
            <input
              type="date"
              value={fechaHasta}
              onChange={e => { setFechaHasta(e.target.value); setFilas([]); setBuscado(false); }}
              className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:border-violet-500' : 'bg-white border-slate-200 text-slate-900 focus:border-pink-400'}`}
            />
          </div>

          {/* Botón buscar */}
          <button
            onClick={buscar}
            disabled={!transportistaId || !fechaDesde || !fechaHasta}
            className={`flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm whitespace-nowrap ${isDark ? 'bg-violet-600 hover:bg-violet-700' : 'bg-pink-500 hover:bg-pink-600'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            Buscar
          </button>

        </div>
      </div>

      {/* Tabla */}
      <div className={`flex-1 rounded-3xl shadow-sm border overflow-hidden flex flex-col transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'}`}>

        {/* Encabezado con nombre del transportista */}
        {transportistaSeleccionado && buscado && (
          <div className={`px-6 py-3 border-b flex items-center justify-between transition-colors duration-300 ${isDark ? `${colorInfo.bgDark || 'bg-violet-900/20'} ${colorInfo.borderDark || 'border-violet-600'}` : `${colorInfo.bg} ${colorInfo.border}`}`}>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${colorInfo.dot}`} />
              <span className={`font-black text-base transition-colors duration-300 ${isDark ? (colorInfo.textDark || 'text-violet-200') : colorInfo.text}`}>
                {transportistaSeleccionado.nombre}
              </span>
            </div>
            <span className={`text-xs font-semibold transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>
              {fmtFechaCorta(fechaDesde)} — {fmtFechaCorta(fechaHasta)}
            </span>
          </div>
        )}

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm">
            <thead>
              <tr className={`text-white transition-colors duration-300 ${isDark ? 'bg-[#5a4a75]' : 'bg-slate-700'}`}>
                <th className="w-10 px-3 py-3.5" />
                <th className={`text-left px-4 py-3.5 font-bold tracking-wide w-32 border-r transition-colors duration-300 ${isDark ? 'border-violet-600' : 'border-slate-600'}`}>Fecha</th>
                <th className={`text-left px-4 py-3.5 font-bold tracking-wide w-52 border-r transition-colors duration-300 ${isDark ? 'border-violet-600' : 'border-slate-600'}`}>Nombre destino</th>
                <th className={`text-left px-4 py-3.5 font-bold tracking-wide border-r transition-colors duration-300 ${isDark ? 'border-violet-600' : 'border-slate-600'}`}>Detalle</th>
                <th className={`text-right px-4 py-3.5 font-bold tracking-wide w-36 border-r transition-colors duration-300 ${isDark ? 'border-violet-600' : 'border-slate-600'}`}>Valor</th>
                <th className="text-left px-4 py-3.5 font-bold tracking-wide w-40">Servicio</th>
              </tr>
            </thead>
            <tbody>
              {!buscado ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className={`flex flex-col items-center gap-3 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-10 h-10 transition-colors duration-300 ${isDark ? 'text-violet-500' : 'text-slate-300'}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                      </svg>
                      <p className="text-sm">
                        Selecciona un transportista y un rango de fechas, luego presiona{' '}
                        <span className={`font-bold transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-pink-500'}`}>Buscar</span>
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filas.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`px-5 py-12 text-center text-sm transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>
                    No hay registros en el rango de fechas seleccionado
                  </td>
                </tr>
              ) : (
                filas.map((fila, idx) => (
                  <tr key={fila.uid} className={`transition-colors duration-300 ${idx % 2 === 0 ? (isDark ? 'bg-[#4a3a63]' : 'bg-white') : (isDark ? 'bg-[#3d2d52]' : 'bg-slate-50')}`}>
                    {/* Botón eliminar (solo visual) */}
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => eliminarFila(fila.uid)}
                        title="Quitar de la liquidación"
                        className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors duration-300 ${isDark ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400 hover:text-red-300' : 'bg-red-100 hover:bg-red-200 text-red-500 hover:text-red-700'} mx-auto`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                        </svg>
                      </button>
                    </td>
                    <td className={`px-2 py-2 border-r transition-colors duration-300 ${isDark ? 'border-violet-700' : 'border-slate-100'}`}>
                      <CeldaEditable uid={fila.uid} campo="fecha" valor={fila.fecha} className={`whitespace-nowrap transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-500'}`} />
                    </td>
                    <td className={`px-2 py-2 border-r transition-colors duration-300 ${isDark ? 'border-violet-700' : 'border-slate-100'}`}>
                      <CeldaEditable uid={fila.uid} campo="taller" valor={fila.taller} className={`font-semibold transition-colors duration-300 ${isDark ? 'text-violet-100' : 'text-slate-900'}`} />
                    </td>
                    <td className={`px-2 py-2 border-r transition-colors duration-300 ${isDark ? 'border-violet-700' : 'border-slate-100'}`}>
                      <CeldaEditable uid={fila.uid} campo="detalle" valor={fila.detalle} className={`transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`} />
                    </td>
                    <td className={`px-2 py-2 border-r transition-colors duration-300 ${isDark ? 'border-violet-700' : 'border-slate-100'}`}>
                      <CeldaEditable uid={fila.uid} campo="valor" valor={fila.valor} esValor className={`font-semibold transition-colors duration-300 ${isDark ? 'text-violet-100' : 'text-slate-800'}`} />
                    </td>
                    <td className="px-2 py-2">
                      <CeldaEditable uid={fila.uid} campo="servicio" valor={fila.servicio} className={`transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Fila de total */}
            {buscado && filas.length > 0 && (
              <tfoot>
                <tr className={`border-t-2 transition-colors duration-300 ${isDark ? 'bg-violet-900/20 border-violet-600' : 'bg-yellow-50 border-yellow-200'}`}>
                  <td className="px-3 py-4" />
                  <td className="px-4 py-4" />
                  <td colSpan={2} className={`px-4 py-4 font-black text-sm uppercase tracking-wide transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>
                    Liquidación del {fmtFechaCorta(fechaDesde)} al {fmtFechaCorta(fechaHasta)}
                  </td>
                  <td className={`px-4 py-4 text-right font-black text-base transition-colors duration-300 ${isDark ? 'text-violet-100' : 'text-slate-900'}`}>
                    $ {total.toLocaleString('es-CO')}
                  </td>
                  <td className="px-4 py-4" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pie: agregar fila + resumen */}
        {buscado && (
          <div className={`px-6 py-4 border-t flex items-center justify-between rounded-b-3xl gap-4 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-700' : 'bg-slate-50 border-slate-100'}`}>
            <button
              onClick={agregarFila}
              className={`flex items-center gap-2 border-2 border-dashed font-bold px-4 py-2 rounded-xl text-sm transition-colors ${isDark ? 'bg-[#4a3a63] hover:bg-violet-900/30 border-violet-600 hover:border-violet-500 text-violet-300 hover:text-violet-200' : 'bg-white hover:bg-pink-50 border-pink-300 hover:border-pink-400 text-pink-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Agregar registro
            </button>
            <div className="flex items-center gap-3">
              <span className={`text-sm transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>
                <span className={`font-bold transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>{filas.length}</span> servicio{filas.length !== 1 ? 's' : ''}
              </span>
              <span className={`transition-colors duration-300 ${isDark ? 'text-violet-600' : 'text-slate-300'}`}>·</span>
              <span className={`text-sm transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>Total:</span>
              <span className={`text-lg font-black transition-colors duration-300 ${isDark ? 'text-violet-100' : 'text-slate-900'}`}>$ {total.toLocaleString('es-CO')}</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default LiquidacionTransporteView;
