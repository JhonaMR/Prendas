import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useDarkMode } from '../context/DarkModeContext';

// ── Tipos ──────────────────────────────────────────────────────────────────
export interface Descuento {
  id: number;
  etiqueta: string;
  monto: number;
}

export interface PagoDia {
  id: number;
  cedula: string;
  nombre: string;
  cuenta: string;
  detalleInicial: string;
  brutOF: number;
  descuentosOF: Descuento[];
  brutML: number;
  descuentosML: Descuento[];
  orden: number;
  fechaOriginal?: string; // si fue movido de otro día
}

interface CuentaBancaria {
  id: number;
  cedula: string;
  nombre: string;
  cuenta: string;
}

interface Props {
  fecha: string; // "YYYY-MM-DD"
  onVolver: () => void;
  cuentasRegistradas?: CuentaBancaria[];
  precargar?: {
    detalleInicial: string;
    brutOF: number;
    brutML: number;
    descuentosOF: Descuento[];
    descuentosML: Descuento[];
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────
const sumar = (ds: Descuento[]) => ds.reduce((a, d) => a + (d.monto || 0), 0);
const neto = (bruto: number, ds: Descuento[]) => bruto - sumar(ds);
const fmt = (n: number) => n === 0 ? '-' : `$${n.toLocaleString('es-CR')}`;

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function labelFecha(f: string) {
  const [y, m, d] = f.split('-');
  return `${parseInt(d)} de ${MESES[parseInt(m) - 1]} de ${y}`;
}

// ── Formulario vacío ───────────────────────────────────────────────────────
const formVacio = () => ({
  cedula: '', nombre: '', cuenta: '', detalleInicial: '',
  brutOF: '' as string | number,
  descuentosOF: [] as Descuento[],
  brutML: '' as string | number,
  descuentosML: [] as Descuento[],
});

// ── Componente principal ───────────────────────────────────────────────────
const ProgramacionPagosDiaView: React.FC<Props> = ({ fecha, onVolver, cuentasRegistradas, precargar }) => {
  const { isDark } = useDarkMode();
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>(cuentasRegistradas ?? []);
  const [pagos, setPagos] = useState<PagoDia[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'crear' | 'editar' | 'detalle' | 'eliminar' | 'mover' | null>(null);
  const [seleccionado, setSeleccionado] = useState<PagoDia | null>(null);
  const [form, setForm] = useState(formVacio());
  const [errorForm, setErrorForm] = useState('');
  const [sugerencias, setSugerencias] = useState<CuentaBancaria[]>([]);
  const [fechaMover, setFechaMover] = useState('');

  // Cargar cuentas y pagos del día
  useEffect(() => {
    Promise.all([
      cuentasRegistradas ? Promise.resolve(cuentasRegistradas) : api.getCuentasBancarias(),
      api.getPagosPorFecha(fecha)
    ]).then(([cuentasData, pagosData]) => {
      setCuentas(cuentasData);
      // Mapear snake_case del backend a camelCase del frontend
      setPagos(pagosData.map((p: any) => ({
        id: p.id,
        cedula: p.cedula,
        nombre: p.nombre,
        cuenta: p.cuenta,
        detalleInicial: p.detalle_inicial || '',
        brutOF: parseFloat(p.bruto_of) || 0,
        brutML: parseFloat(p.bruto_ml) || 0,
        descuentosOF: (p.descuentosOF || []).map((d: any) => ({ id: d.id, etiqueta: d.etiqueta, monto: parseFloat(d.monto) })),
        descuentosML: (p.descuentosML || []).map((d: any) => ({ id: d.id, etiqueta: d.etiqueta, monto: parseFloat(d.monto) })),
        orden: p.orden,
        fechaOriginal: p.fecha_original || undefined,
      })));
      setLoading(false);

      // Si viene con datos pre-cargados desde pago confeccionistas, abrir modal
      if (precargar) {
        setForm({
          cedula: '', nombre: '', cuenta: '',
          detalleInicial: precargar.detalleInicial,
          brutOF: precargar.brutOF,
          descuentosOF: precargar.descuentosOF,
          brutML: precargar.brutML,
          descuentosML: precargar.descuentosML,
        });
        setModal('crear');
      }
    });
  }, [fecha]);

  // ESC cierra cualquier modal
  useEffect(() => {
    if (!modal) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') cerrarModal(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [modal]);

  const cerrarModal = () => {
    setModal(null); setSeleccionado(null);
    setForm(formVacio()); setErrorForm('');
    setSugerencias([]); setFechaMover('');
  };

  // ── Autocompletado nombre ──────────────────────────────────────────────
  const handleNombreChange = (val: string) => {
    setForm(f => ({ ...f, nombre: val, cedula: '', cuenta: '' }));
    if (val.length >= 2) {
      setSugerencias(cuentas.filter(c =>
        c.nombre.toLowerCase().includes(val.toLowerCase())
      ));
    } else {
      setSugerencias([]);
    }
  };

  const seleccionarCuenta = (c: CuentaBancaria) => {
    setForm(f => ({ ...f, nombre: c.nombre, cedula: c.cedula, cuenta: c.cuenta }));
    setSugerencias([]);
  };

  // ── Descuentos ─────────────────────────────────────────────────────────
  const addDescuento = (tipo: 'OF' | 'ML') => {
    const nuevo: Descuento = { id: Date.now(), etiqueta: '', monto: 0 };
    if (tipo === 'OF') setForm(f => ({ ...f, descuentosOF: [...f.descuentosOF, nuevo] }));
    else setForm(f => ({ ...f, descuentosML: [...f.descuentosML, nuevo] }));
  };

  const updateDescuento = (tipo: 'OF' | 'ML', id: number, campo: 'etiqueta' | 'monto', val: string) => {
    const upd = (ds: Descuento[]) => ds.map(d =>
      d.id === id ? { ...d, [campo]: campo === 'monto' ? parseFloat(val) || 0 : val } : d
    );
    if (tipo === 'OF') setForm(f => ({ ...f, descuentosOF: upd(f.descuentosOF) }));
    else setForm(f => ({ ...f, descuentosML: upd(f.descuentosML) }));
  };

  const removeDescuento = (tipo: 'OF' | 'ML', id: number) => {
    if (tipo === 'OF') setForm(f => ({ ...f, descuentosOF: f.descuentosOF.filter(d => d.id !== id) }));
    else setForm(f => ({ ...f, descuentosML: f.descuentosML.filter(d => d.id !== id) }));
  };

  // ── CRUD pagos ─────────────────────────────────────────────────────────
  const handleGuardar = async () => {
    if (!form.nombre.trim() || !form.cedula.trim() || !form.cuenta.trim()) {
      setErrorForm('Nombre, cédula y cuenta son obligatorios.'); return;
    }
    const brOF = parseFloat(String(form.brutOF)) || 0;
    const brML = parseFloat(String(form.brutML)) || 0;
    if (brOF === 0 && brML === 0) {
      setErrorForm('Debe ingresar al menos un valor bruto (OF o ML).'); return;
    }

    const payload = {
      fecha,
      cedula: form.cedula, nombre: form.nombre, cuenta: form.cuenta,
      detalle_inicial: form.detalleInicial,
      bruto_of: brOF, bruto_ml: brML,
      descuentosOF: form.descuentosOF,
      descuentosML: form.descuentosML,
    };

    if (modal === 'crear') {
      const res = await api.createPago(payload);
      if (res.success && res.data) {
        // Recargar pagos del día para tener IDs reales
        const pagosActualizados = await api.getPagosPorFecha(fecha);
        setPagos(pagosActualizados.map((p: any) => ({
          id: p.id, cedula: p.cedula, nombre: p.nombre, cuenta: p.cuenta,
          detalleInicial: p.detalle_inicial || '', brutOF: parseFloat(p.bruto_of) || 0,
          brutML: parseFloat(p.bruto_ml) || 0,
          descuentosOF: (p.descuentosOF || []).map((d: any) => ({ id: d.id, etiqueta: d.etiqueta, monto: parseFloat(d.monto) })),
          descuentosML: (p.descuentosML || []).map((d: any) => ({ id: d.id, etiqueta: d.etiqueta, monto: parseFloat(d.monto) })),
          orden: p.orden, fechaOriginal: p.fecha_original || undefined,
        })));
      } else { setErrorForm(res.message || 'Error al guardar'); return; }
    } else if (modal === 'editar' && seleccionado) {
      const res = await api.updatePago(seleccionado.id, { ...payload, fecha_original: seleccionado.fechaOriginal });
      if (res.success) {
        setPagos(prev => prev.map(pg => pg.id === seleccionado.id
          ? { ...pg, cedula: form.cedula, nombre: form.nombre, cuenta: form.cuenta,
              detalleInicial: form.detalleInicial, brutOF: brOF, descuentosOF: form.descuentosOF,
              brutML: brML, descuentosML: form.descuentosML }
          : pg
        ));
      } else { setErrorForm(res.message || 'Error al guardar'); return; }
    }
    cerrarModal();
  };

  const handleEliminar = async () => {
    if (seleccionado) {
      await api.deletePago(seleccionado.id);
      setPagos(p => p.filter(pg => pg.id !== seleccionado.id));
    }
    cerrarModal();
  };

  const handleMover = async () => {
    if (!fechaMover || !seleccionado) return;
    await api.updatePago(seleccionado.id, {
      fecha: fechaMover,
      fecha_original: seleccionado.fechaOriginal || fecha,
      cedula: seleccionado.cedula, nombre: seleccionado.nombre, cuenta: seleccionado.cuenta,
      detalle_inicial: seleccionado.detalleInicial,
      bruto_of: seleccionado.brutOF, bruto_ml: seleccionado.brutML,
      descuentosOF: seleccionado.descuentosOF, descuentosML: seleccionado.descuentosML,
    });
    setPagos(p => p.filter(pg => pg.id !== seleccionado.id));
    cerrarModal();
  };

  // ── Reordenar ──────────────────────────────────────────────────────────
  const moverOrden = async (id: number, dir: -1 | 1) => {
    const arr = [...pagos];
    const idx = arr.findIndex(p => p.id === id);
    const nuevo = idx + dir;
    if (nuevo < 0 || nuevo >= arr.length) return;
    [arr[idx], arr[nuevo]] = [arr[nuevo], arr[idx]];
    const conOrden = arr.map((p, i) => ({ ...p, orden: i }));
    setPagos(conOrden);
    await api.reordenarPagos(conOrden.map(p => ({ id: p.id, orden: p.orden })));
  };

  // ── Abrir modales ──────────────────────────────────────────────────────
  const abrirCrear = () => { setForm(formVacio()); setErrorForm(''); setModal('crear'); };

  const abrirEditar = (p: PagoDia) => {
    setSeleccionado(p);
    setForm({ cedula: p.cedula, nombre: p.nombre, cuenta: p.cuenta,
      detalleInicial: p.detalleInicial, brutOF: p.brutOF,
      descuentosOF: p.descuentosOF, brutML: p.brutML, descuentosML: p.descuentosML });
    setErrorForm(''); setModal('editar');
  };

  // ── Detalle string ─────────────────────────────────────────────────────
  const buildDetalle = (p: PagoDia) => {
    const partes = [p.detalleInicial,
      ...p.descuentosOF.map(d => d.etiqueta).filter(Boolean),
      ...p.descuentosML.map(d => d.etiqueta).filter(Boolean),
    ].filter(Boolean);
    return partes.join(' / ');
  };

  // ── Totales ────────────────────────────────────────────────────────────
  const totalNetoOF = pagos.reduce((a, p) => a + neto(p.brutOF, p.descuentosOF), 0);
  const totalNetoML = pagos.reduce((a, p) => a + neto(p.brutML, p.descuentosML), 0);

  // ── Descargar Excel ────────────────────────────────────────────────────
  const descargarExcel = (tipo: 'OF' | 'ML') => {
    // Importar exceljs para mejor formato
    import('exceljs').then(({ Workbook }) => {
      const wb = new Workbook();
      const ws = wb.addWorksheet(`Pagos ${tipo}`);

      // Definir columnas con headers
      ws.columns = [
        { header: 'Fecha', key: 'Fecha', width: 12 },
        { header: 'Cédula', key: 'Cedula', width: 18 },
        { header: 'Nombre', key: 'Nombre', width: 35 },
        { header: 'Cuenta', key: 'Cuenta', width: 20 },
        { header: 'Valor', key: 'Valor', width: 18 },
      ];

      // Estilo del encabezado (primera fila)
      const headerRow = ws.getRow(1);
      headerRow.height = 28;
      
      const headerColor = tipo === 'OF' ? 'FFFFC9A3' : 'FFA8D8FF'; // Naranja suave para OF, Azul suave para ML
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: headerColor },
        };
        cell.font = { bold: true, size: 12, color: { argb: 'FF333333' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF999999' } },
          bottom: { style: 'thin', color: { argb: 'FF999999' } },
          left: { style: 'thin', color: { argb: 'FF999999' } },
          right: { style: 'thin', color: { argb: 'FF999999' } },
        };
      });

      // Preparar datos
      const datos = pagos
        .filter(p => tipo === 'OF' ? p.brutOF > 0 : p.brutML > 0)
        .map(p => ({
          Fecha: fecha,
          Cedula: p.cedula,
          Nombre: p.nombre,
          Cuenta: p.cuenta,
          Valor: tipo === 'OF' ? neto(p.brutOF, p.descuentosOF) : neto(p.brutML, p.descuentosML),
        }));

      // Agregar filas de datos
      datos.forEach((dato, index) => {
        const row = ws.addRow(dato);
        row.height = 18;
        row.font = { size: 11, color: { argb: 'FF333333' } };

        // Alternar colores de fila
        if (index % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFAFAFA' },
            };
          });
        } else {
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFFFF' },
            };
          });
        }

        // Alinear columna Valor a la derecha y formato moneda
        const valorCell = row.getCell('Valor');
        valorCell.alignment = { horizontal: 'right', vertical: 'middle' };
        valorCell.numFmt = '#,##0';
      });

      // Agregar fila de total
      const totalRow = ws.addRow({
        Fecha: '',
        Cedula: '',
        Nombre: 'TOTAL',
        Cuenta: '',
        Valor: tipo === 'OF' ? totalNetoOF : totalNetoML,
      });
      totalRow.height = 22;
      
      const totalColor = tipo === 'OF' ? 'FFFFE0CC' : 'FFD4E8FF'; // Naranja muy suave para OF, Azul muy suave para ML
      totalRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: totalColor },
        };
        cell.font = { bold: true, size: 12, color: { argb: 'FF333333' } };
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF999999' } },
          bottom: { style: 'thin', color: { argb: 'FF999999' } },
          left: { style: 'thin', color: { argb: 'FF999999' } },
          right: { style: 'thin', color: { argb: 'FF999999' } },
        };
      });
      
      const totalValorCell = totalRow.getCell('Valor');
      totalValorCell.numFmt = '#,##0';

      // Guardar archivo usando buffer
      wb.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Pagos_${tipo}_${fecha}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      });
    }).catch((err) => {
      console.error('Error al descargar Excel:', err);
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className={`h-full w-full flex flex-col p-4 md:p-6 pt-1 md:pt-2 overflow-auto pb-20 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-transparent'}`}>
      {/* Header */}
      <div className="mb-4 flex items-center">
        <button onClick={onVolver} className={`flex items-center gap-2 font-semibold transition-colors duration-300 ${isDark ? 'text-violet-300 hover:text-violet-100' : 'text-violet-500 hover:text-violet-700'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver al calendario
        </button>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl md:text-4xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-violet-900'}`}>Pagos del día</h1>
          <p className={`text-sm mt-0.5 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-violet-400'}`}>{labelFecha(fecha)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => descargarExcel('OF')}
            className={`flex items-center gap-2 font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all whitespace-nowrap transition-colors duration-300 ${isDark ? 'bg-orange-700 hover:bg-orange-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3 3m3-3l3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33A3 3 0 0116.5 19.5H6.75z" />
            </svg>
            Descargar OF
          </button>
          <button onClick={() => descargarExcel('ML')}
            className={`flex items-center gap-2 font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all whitespace-nowrap transition-colors duration-300 ${isDark ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3 3m3-3l3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33A3 3 0 0116.5 19.5H6.75z" />
            </svg>
            Descargar ML
          </button>
          <button onClick={abrirCrear}
            className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all whitespace-nowrap transition-colors duration-300 ${isDark ? 'bg-violet-700 hover:bg-violet-600 text-white' : 'bg-violet-500 hover:bg-violet-600 text-white'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Agregar pago
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className={`rounded-3xl shadow-lg border overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-violet-100'}`}>
        <table className={`w-full divide-y transition-colors duration-300 ${isDark ? 'divide-violet-700/50' : 'divide-slate-100'}`}>
          <thead>
            <tr className={`divide-x transition-colors duration-300 ${isDark ? 'bg-violet-700 text-white divide-violet-600' : 'bg-violet-500 text-white divide-violet-400'}`}>
              <th className="px-3 py-4 w-10 text-center font-bold text-sm"></th>
              <th className="text-left px-5 py-4 font-bold text-sm tracking-wide w-32">Cédula</th>
              <th className="text-left px-5 py-4 font-bold text-sm tracking-wide">Nombre</th>
              <th className="text-left px-5 py-4 font-bold text-sm tracking-wide w-56">Cuenta</th>
              <th className="text-center px-5 py-4 font-bold text-sm w-32">Neto OF</th>
              <th className="text-center px-5 py-4 font-bold text-sm w-32">Neto ML</th>
              <th className="text-left px-5 py-4 font-bold text-sm tracking-wide">Detalle</th>
              <th className="px-4 py-4 font-bold text-sm tracking-wide text-center w-36">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagos.length === 0 ? (
              <tr><td colSpan={8} className={`text-center py-12 font-medium transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-violet-300'}`}>
                {loading ? 'Cargando pagos...' : 'No hay pagos registrados para este día.'}
              </td></tr>
            ) : (
              pagos.map((p, i) => (
                <tr key={p.id} className={`divide-x transition-colors duration-300 ${isDark ? 'divide-violet-700/50 hover:bg-violet-700/20' : 'divide-slate-100'} ${i % 2 === 0 ? (isDark ? 'bg-[#4a3a63]' : 'bg-white') : (isDark ? 'bg-violet-900/10' : 'bg-violet-50/40')}`}>
                  {/* Flechas orden */}
                  <td className="px-2 py-3">
                    <div className="flex flex-col items-center gap-0.5">
                      <button onClick={() => moverOrden(p.id, -1)} disabled={i === 0}
                        className={`disabled:opacity-20 transition-colors duration-300 ${isDark ? 'text-violet-400 hover:text-violet-200' : 'text-violet-300 hover:text-violet-500'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        </svg>
                      </button>
                      <button onClick={() => moverOrden(p.id, 1)} disabled={i === pagos.length - 1}
                        className={`disabled:opacity-20 transition-colors duration-300 ${isDark ? 'text-violet-400 hover:text-violet-200' : 'text-violet-300 hover:text-violet-500'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className={`px-5 py-3 text-sm transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>{p.cedula}</td>
                  <td className={`px-5 py-3 font-semibold text-sm transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-900'}`}>{p.nombre}</td>
                  <td className={`px-5 py-3 text-sm font-mono text-xs transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-600'}`}>{p.cuenta}</td>
                  <td className={`px-5 py-3 text-center text-sm font-semibold cursor-pointer transition-all transition-colors duration-300 ${isDark ? 'text-emerald-400 hover:bg-emerald-900/20' : 'text-emerald-600 hover:bg-emerald-50'}`} onClick={() => { setSeleccionado(p); setModal('detalle'); }}>{fmt(neto(p.brutOF, p.descuentosOF))}</td>
                  <td className={`px-5 py-3 text-center text-sm font-semibold cursor-pointer transition-all transition-colors duration-300 ${isDark ? 'text-emerald-400 hover:bg-emerald-900/20' : 'text-emerald-600 hover:bg-emerald-50'}`} onClick={() => { setSeleccionado(p); setModal('detalle'); }}>{fmt(neto(p.brutML, p.descuentosML))}</td>
                  {/* Detalle con indicador de movido */}
                  <td className={`px-5 py-3 text-sm relative cursor-pointer transition-all transition-colors duration-300 ${isDark ? 'text-violet-400 hover:bg-violet-700/20' : 'text-slate-500 hover:bg-violet-50'}`} onClick={() => { setSeleccionado(p); setModal('detalle'); }}>
                    <span className={`transition-colors duration-300 ${isDark ? 'hover:text-violet-200' : 'hover:text-violet-600'}`}>
                      {buildDetalle(p) || <span className={`italic transition-colors duration-300 ${isDark ? 'text-violet-600' : 'text-slate-300'}`}>Sin detalle</span>}
                    </span>
                    {p.fechaOriginal && (
                      <span title={`Traído del ${labelFecha(p.fechaOriginal)}`}
                        className="absolute top-1 right-1 w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-t-amber-400 cursor-help" />
                    )}
                  </td>
                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => abrirEditar(p)}
                        className={`text-xs font-semibold px-2 py-1.5 rounded-lg transition-all transition-colors duration-300 ${isDark ? 'text-violet-300 bg-violet-900/30 hover:bg-violet-700 hover:text-white' : 'text-violet-500 bg-violet-100 hover:bg-violet-500 hover:text-white'}`}>
                        Editar
                      </button>
                      <button onClick={() => { setSeleccionado(p); setModal('mover'); }}
                        className={`text-xs font-semibold px-2 py-1.5 rounded-lg transition-all transition-colors duration-300 ${isDark ? 'text-amber-400 bg-amber-900/30 hover:bg-amber-700 hover:text-white' : 'text-amber-500 bg-amber-50 hover:bg-amber-400 hover:text-white'}`}>
                        Mover
                      </button>
                      <button onClick={() => { setSeleccionado(p); setModal('eliminar'); }}
                        className={`text-xs font-semibold px-2 py-1.5 rounded-lg transition-all transition-colors duration-300 ${isDark ? 'text-red-400 bg-red-900/30 hover:bg-red-700 hover:text-white' : 'text-red-400 bg-red-50 hover:bg-red-400 hover:text-white'}`}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {pagos.length > 0 && (
            <tfoot>
              <tr className={`divide-x transition-colors duration-300 font-bold ${isDark ? 'bg-violet-900/20 divide-violet-700/50' : 'bg-violet-50 divide-slate-100'}`}>
                <td className="px-3 py-3" />
                <td className="px-5 py-3" />
                <td className={`px-5 py-3 text-sm transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-violet-700'}`}>{pagos.length} {pagos.length === 1 ? 'pago' : 'pagos'}</td>
                <td className={`px-5 py-3 text-right text-sm transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-violet-700'}`}>Totales</td>
                <td className={`px-5 py-3 text-center text-sm transition-colors duration-300 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{fmt(totalNetoOF)}</td>
                <td className={`px-5 py-3 text-center text-sm transition-colors duration-300 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{fmt(totalNetoML)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* ── Modal Crear / Editar ─────────────────────────────────────────── */}
      {(modal === 'crear' || modal === 'editar') && (
        <div className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-colors duration-300 ${isDark ? 'bg-black/50' : 'bg-black/40'}`}>
          <div className={`rounded-3xl shadow-2xl w-full max-w-6xl p-10 max-h-[95vh] overflow-y-auto transition-colors duration-300 ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}>
            <div className="flex items-start justify-between mb-6">
              <h2 className={`text-2xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-violet-900'}`}>
                {modal === 'crear' ? 'Agregar Pago' : 'Editar Pago'}
              </h2>
              <button onClick={cerrarModal} className={`transition-colors duration-300 ml-4 flex-shrink-0 ${isDark ? 'text-violet-400 hover:text-violet-200' : 'text-slate-400 hover:text-slate-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nombre con autocompletado */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="relative col-span-2">
                <label className={`block text-sm font-semibold mb-1 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-violet-700'}`}>Nombre</label>
                <input type="text" value={form.nombre} onChange={e => handleNombreChange(e.target.value)}
                  placeholder="Escribe 2 o más letras..."
                  className={`w-full border-2 rounded-xl px-4 py-2.5 focus:outline-none transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:border-violet-500' : 'border-violet-200 text-slate-900 focus:border-violet-400'}`} />
                {sugerencias.length > 0 && (
                  <ul className={`absolute z-10 w-full border rounded-xl shadow-lg mt-1 overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-violet-200'}`}>
                    {sugerencias.map(c => (
                      <li key={c.id} onClick={() => seleccionarCuenta(c)}
                        className={`px-4 py-3 cursor-pointer border-b last:border-0 transition-colors duration-300 ${isDark ? 'hover:bg-violet-700/40 border-violet-700/50' : 'hover:bg-violet-50 border-slate-100'}`}>
                        <p className={`text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{c.nombre}</p>
                        <p className={`text-xs mt-0.5 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>{c.cedula} · <span className="font-mono">{c.cuenta}</span></p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-1 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-violet-700'}`}>Cédula</label>
                <input type="text" value={form.cedula} onChange={e => setForm(f => ({ ...f, cedula: e.target.value }))}
                  className={`w-full border-2 rounded-xl px-4 py-2.5 focus:outline-none transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:border-violet-500' : 'border-violet-200 text-slate-900 focus:border-violet-400'}`} />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-1 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-violet-700'}`}>Cuenta Bancaria</label>
                <input type="text" value={form.cuenta} onChange={e => setForm(f => ({ ...f, cuenta: e.target.value }))}
                  className={`w-full border-2 rounded-xl px-4 py-2.5 focus:outline-none transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:border-violet-500' : 'border-violet-200 text-slate-900 focus:border-violet-400'}`} />
              </div>
              <div className="col-span-2">
                <label className={`block text-sm font-semibold mb-1 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-violet-700'}`}>Detalle inicial</label>
                <input type="text" value={form.detalleInicial} onChange={e => setForm(f => ({ ...f, detalleInicial: e.target.value }))}
                  placeholder="Ej: Ref. o Factura"
                  className={`w-full border-2 rounded-xl px-4 py-2.5 focus:outline-none transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:border-violet-500' : 'border-violet-200 text-slate-900 focus:border-violet-400'}`} />
              </div>
            </div>

            {/* OF y ML lado a lado */}
            <div className="grid grid-cols-2 gap-4 mb-4">
            {/* OF */}
            <div className={`rounded-2xl p-4 transition-colors duration-300 ${isDark ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`font-bold text-sm transition-colors duration-300 ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>💳 Pago OF</span>
                <span className={`text-xs transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>
                  Neto: <strong>{fmt(neto(parseFloat(String(form.brutOF)) || 0, form.descuentosOF))}</strong>
                </span>
              </div>
              <div className="mb-3">
                <label className={`block text-xs font-semibold mb-1 transition-colors duration-300 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>Valor Bruto OF</label>
                <input type="number" value={form.brutOF} onChange={e => setForm(f => ({ ...f, brutOF: e.target.value }))}
                  placeholder="0"
                  className={`w-full border-2 rounded-xl px-4 py-2 focus:outline-none text-sm transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-blue-600 text-blue-100 focus:border-blue-500' : 'border-blue-200 text-slate-900 focus:border-blue-400'}`} />
              </div>
              {form.descuentosOF.map(d => (
                <div key={d.id} className="flex gap-2 mb-2">
                  <input type="number" value={d.monto || ''} onChange={e => updateDescuento('OF', d.id, 'monto', e.target.value)}
                    placeholder="Monto"
                    className={`w-36 border-2 rounded-xl px-3 py-2 text-sm focus:outline-none transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-blue-600 text-blue-100 focus:border-blue-500' : 'border-blue-200 text-slate-900 focus:border-blue-400'}`} />
                  <input type="text" value={d.etiqueta} onChange={e => updateDescuento('OF', d.id, 'etiqueta', e.target.value)}
                    placeholder="Etiqueta (ej: RTE FTE)"
                    className={`flex-1 border-2 rounded-xl px-3 py-2 text-sm focus:outline-none transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-blue-600 text-blue-100 focus:border-blue-500' : 'border-blue-200 text-slate-900 focus:border-blue-400'}`} />
                  <button onClick={() => removeDescuento('OF', d.id)}
                    className={`px-2 transition-colors duration-300 ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-400 hover:text-red-600'}`}>✕</button>
                </div>
              ))}
              <button onClick={() => addDescuento('OF')}
                className={`text-xs font-semibold mt-1 transition-colors duration-300 ${isDark ? 'text-blue-300 hover:text-blue-100' : 'text-blue-500 hover:text-blue-700'}`}>
                + Agregar descuento OF
              </button>
            </div>

            {/* ML */}
            <div className={`rounded-2xl p-4 transition-colors duration-300 ${isDark ? 'bg-pink-900/20 border border-pink-700' : 'bg-pink-50 border border-pink-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`font-bold text-sm transition-colors duration-300 ${isDark ? 'text-pink-200' : 'text-pink-800'}`}>💰 Pago ML</span>
                <span className={`text-xs transition-colors duration-300 ${isDark ? 'text-pink-400' : 'text-pink-500'}`}>
                  Neto: <strong>{fmt(neto(parseFloat(String(form.brutML)) || 0, form.descuentosML))}</strong>
                </span>
              </div>
              <div className="mb-3">
                <label className={`block text-xs font-semibold mb-1 transition-colors duration-300 ${isDark ? 'text-pink-300' : 'text-pink-600'}`}>Valor Bruto ML</label>
                <input type="number" value={form.brutML} onChange={e => setForm(f => ({ ...f, brutML: e.target.value }))}
                  placeholder="0"
                  className={`w-full border-2 rounded-xl px-4 py-2 focus:outline-none text-sm transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-pink-600 text-pink-100 focus:border-pink-500' : 'border-pink-200 text-slate-900 focus:border-pink-400'}`} />
              </div>
              {form.descuentosML.map(d => (
                <div key={d.id} className="flex gap-2 mb-2">
                  <input type="number" value={d.monto || ''} onChange={e => updateDescuento('ML', d.id, 'monto', e.target.value)}
                    placeholder="Monto"
                    className={`w-36 border-2 rounded-xl px-3 py-2 text-sm focus:outline-none transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-pink-600 text-pink-100 focus:border-pink-500' : 'border-pink-200 text-slate-900 focus:border-pink-400'}`} />
                  <input type="text" value={d.etiqueta} onChange={e => updateDescuento('ML', d.id, 'etiqueta', e.target.value)}
                    placeholder="Etiqueta (ej: TRANSP)"
                    className={`flex-1 border-2 rounded-xl px-3 py-2 text-sm focus:outline-none transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-pink-600 text-pink-100 focus:border-pink-500' : 'border-pink-200 text-slate-900 focus:border-pink-400'}`} />
                  <button onClick={() => removeDescuento('ML', d.id)}
                    className={`px-2 transition-colors duration-300 ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-400 hover:text-red-600'}`}>✕</button>
                </div>
              ))}
              <button onClick={() => addDescuento('ML')}
                className={`text-xs font-semibold mt-1 transition-colors duration-300 ${isDark ? 'text-pink-300 hover:text-pink-100' : 'text-pink-500 hover:text-pink-700'}`}>
                + Agregar descuento ML
              </button>
            </div>
            </div>

            {errorForm && <p className={`text-sm font-medium mb-4 transition-colors duration-300 ${isDark ? 'text-red-400' : 'text-red-500'}`}>{errorForm}</p>}

            <div className="flex gap-3">
              <button onClick={cerrarModal}
                className={`flex-1 font-semibold py-2.5 rounded-xl transition-all transition-colors duration-300 border-2 ${isDark ? 'border-violet-600 text-violet-300 hover:bg-violet-900/40' : 'border-violet-200 text-violet-500 hover:bg-violet-50'}`}>
                Cancelar
              </button>
              <button onClick={handleGuardar}
                className={`flex-1 font-semibold py-2.5 rounded-xl transition-all transition-colors duration-300 ${isDark ? 'bg-violet-700 hover:bg-violet-600 text-white' : 'bg-violet-500 hover:bg-violet-600 text-white'}`}>
                {modal === 'crear' ? 'Agregar' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Detalle ────────────────────────────────────────────────── */}
      {modal === 'detalle' && seleccionado && (
        <div className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-colors duration-300 ${isDark ? 'bg-black/50' : 'bg-black/40'}`} onClick={cerrarModal}>
          <div className={`rounded-3xl shadow-2xl w-full max-w-lg p-8 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            {/* Encabezado */}
            <div className="mb-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className={`text-2xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-violet-900'}`}>{seleccionado.nombre}</h2>
                  <p className={`text-sm mt-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>{seleccionado.cedula} · {seleccionado.cuenta}</p>
                  {seleccionado.fechaOriginal && (
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full mt-2 inline-block transition-colors duration-300 ${isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                      Traído del {labelFecha(seleccionado.fechaOriginal)}
                    </span>
                  )}
                </div>
                <button onClick={cerrarModal} className={`transition-colors duration-300 ml-4 flex-shrink-0 ${isDark ? 'text-violet-400 hover:text-violet-200' : 'text-slate-400 hover:text-slate-600'}`}>
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
                    <span>- {d.etiqueta || 'Descuento'}</span><span className={`transition-colors duration-300 ${isDark ? 'text-red-400' : 'text-red-400'}`}>-{fmt(d.monto)}</span>
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
                    <span>- {d.etiqueta || 'Descuento'}</span><span className={`transition-colors duration-300 ${isDark ? 'text-red-400' : 'text-red-400'}`}>-{fmt(d.monto)}</span>
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
              <button onClick={() => { cerrarModal(); abrirEditar(seleccionado); }}
                className={`flex-1 font-semibold py-2.5 rounded-xl transition-all transition-colors duration-300 border-2 ${isDark ? 'border-violet-600 text-violet-300 hover:bg-violet-900/40' : 'border-violet-200 text-violet-500 hover:bg-violet-50'}`}>
                Editar
              </button>
              <button onClick={() => { setModal('mover'); }}
                className={`flex-1 font-semibold py-2.5 rounded-xl transition-all transition-colors duration-300 border-2 ${isDark ? 'border-amber-600 text-amber-300 hover:bg-amber-900/40' : 'border-amber-200 text-amber-500 hover:bg-amber-50'}`}>
                Mover
              </button>
              <button onClick={() => setModal('eliminar')}
                className={`flex-1 font-semibold py-2.5 rounded-xl transition-all transition-colors duration-300 border-2 ${isDark ? 'border-red-600 text-red-300 hover:bg-red-900/40' : 'border-red-200 text-red-400 hover:bg-red-50'}`}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Mover ──────────────────────────────────────────────────── */}
      {modal === 'mover' && seleccionado && (
        <div className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-colors duration-300 ${isDark ? 'bg-black/50' : 'bg-black/40'}`}>
          <div className={`rounded-3xl shadow-2xl w-full max-w-sm p-8 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}>
            <h2 className={`text-xl font-black mb-2 transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-violet-900'}`}>Mover pago</h2>
            <p className={`text-sm mb-5 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>
              Selecciona la nueva fecha para el pago de <span className={`font-semibold transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>{seleccionado.nombre}</span>.
            </p>
            <label className={`block text-sm font-semibold mb-1 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-violet-700'}`}>Nueva fecha</label>
            <input type="date" value={fechaMover} onChange={e => setFechaMover(e.target.value)}
              className={`w-full border-2 rounded-xl px-4 py-2.5 focus:outline-none mb-6 transition-all transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:border-violet-500' : 'border-violet-200 text-slate-900 focus:border-violet-400'}`} />
            <div className="flex gap-3">
              <button onClick={cerrarModal}
                className={`flex-1 font-semibold py-2.5 rounded-xl transition-all transition-colors duration-300 border-2 ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-900/40' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                Cancelar
              </button>
              <button onClick={handleMover} disabled={!fechaMover}
                className={`flex-1 font-semibold py-2.5 rounded-xl transition-all disabled:opacity-40 transition-colors duration-300 ${isDark ? 'bg-amber-700 hover:bg-amber-600 text-white' : 'bg-amber-400 hover:bg-amber-500 text-white'}`}>
                Mover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Eliminar ───────────────────────────────────────────────── */}
      {modal === 'eliminar' && seleccionado && (
        <div className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-colors duration-300 ${isDark ? 'bg-black/50' : 'bg-black/40'}`}>
          <div className={`rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center transition-colors duration-300 ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${isDark ? 'bg-red-900/30' : 'bg-red-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-7 h-7 transition-colors duration-300 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className={`text-xl font-black mb-2 transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>¿Eliminar pago?</h2>
            <p className={`text-sm mb-8 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>
              ¿Seguro que desea eliminar el pago de <span className={`font-semibold transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>{seleccionado.nombre}</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={cerrarModal}
                className={`flex-1 font-semibold py-2.5 rounded-xl transition-all transition-colors duration-300 border-2 ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-900/40' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                Cancelar
              </button>
              <button onClick={handleEliminar}
                className={`flex-1 font-semibold py-2.5 rounded-xl transition-all transition-colors duration-300 ${isDark ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramacionPagosDiaView;
