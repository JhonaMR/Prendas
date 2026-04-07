import React, { useState, useEffect } from 'react';
import api from '../services/api';

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

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="h-full w-full flex flex-col bg-transparent p-4 md:p-6 pt-1 md:pt-2 overflow-auto">
      {/* Header */}
      <div className="mb-4 flex items-center">
        <button onClick={onVolver} className="flex items-center gap-2 text-violet-500 hover:text-violet-700 font-semibold transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver al calendario
        </button>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-violet-900">Pagos del día</h1>
          <p className="text-violet-400 text-sm mt-0.5">{labelFecha(fecha)}</p>
        </div>
        <button onClick={abrirCrear}
          className="flex items-center gap-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors whitespace-nowrap">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Agregar pago
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-3xl shadow-lg border border-violet-100 overflow-hidden">
        <table className="w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-violet-500 text-white divide-x divide-violet-400">
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
              <tr><td colSpan={8} className="text-center py-12 text-violet-300 font-medium">
                {loading ? 'Cargando pagos...' : 'No hay pagos registrados para este día.'}
              </td></tr>
            ) : (
              pagos.map((p, i) => (
                <tr key={p.id} className={`divide-x divide-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-violet-50/40'}`}>
                  {/* Flechas orden */}
                  <td className="px-2 py-3">
                    <div className="flex flex-col items-center gap-0.5">
                      <button onClick={() => moverOrden(p.id, -1)} disabled={i === 0}
                        className="text-violet-300 hover:text-violet-500 disabled:opacity-20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        </svg>
                      </button>
                      <button onClick={() => moverOrden(p.id, 1)} disabled={i === pagos.length - 1}
                        className="text-violet-300 hover:text-violet-500 disabled:opacity-20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600 text-sm">{p.cedula}</td>
                  <td className="px-5 py-3 text-slate-900 font-semibold text-sm">{p.nombre}</td>
                  <td className="px-5 py-3 text-slate-600 text-sm font-mono text-xs">{p.cuenta}</td>
                  <td className="px-5 py-3 text-center text-sm font-semibold text-emerald-600 cursor-pointer hover:bg-emerald-50 transition-colors" onClick={() => { setSeleccionado(p); setModal('detalle'); }}>{fmt(neto(p.brutOF, p.descuentosOF))}</td>
                  <td className="px-5 py-3 text-center text-sm font-semibold text-emerald-600 cursor-pointer hover:bg-emerald-50 transition-colors" onClick={() => { setSeleccionado(p); setModal('detalle'); }}>{fmt(neto(p.brutML, p.descuentosML))}</td>
                  {/* Detalle con indicador de movido */}
                  <td className="px-5 py-3 text-slate-500 text-sm relative cursor-pointer hover:bg-violet-50 transition-colors" onClick={() => { setSeleccionado(p); setModal('detalle'); }}>
                    <span className="hover:text-violet-600 transition-colors">
                      {buildDetalle(p) || <span className="text-slate-300 italic">Sin detalle</span>}
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
                        className="text-xs font-semibold text-violet-500 hover:text-white bg-violet-100 hover:bg-violet-500 px-2 py-1.5 rounded-lg transition-colors">
                        Editar
                      </button>
                      <button onClick={() => { setSeleccionado(p); setModal('mover'); }}
                        className="text-xs font-semibold text-amber-500 hover:text-white bg-amber-50 hover:bg-amber-400 px-2 py-1.5 rounded-lg transition-colors">
                        Mover
                      </button>
                      <button onClick={() => { setSeleccionado(p); setModal('eliminar'); }}
                        className="text-xs font-semibold text-red-400 hover:text-white bg-red-50 hover:bg-red-400 px-2 py-1.5 rounded-lg transition-colors">
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
              <tr className="bg-violet-50 divide-x divide-slate-100 font-bold">
                <td className="px-3 py-3" />
                <td className="px-5 py-3" />
                <td className="px-5 py-3 text-sm text-violet-700">{pagos.length} {pagos.length === 1 ? 'pago' : 'pagos'}</td>
                <td className="px-5 py-3 text-right text-sm text-violet-700">Totales</td>
                <td className="px-5 py-3 text-center text-sm text-emerald-700">{fmt(totalNetoOF)}</td>
                <td className="px-5 py-3 text-center text-sm text-emerald-700">{fmt(totalNetoML)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* ── Modal Crear / Editar ─────────────────────────────────────────── */}
      {(modal === 'crear' || modal === 'editar') && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl p-10 max-h-[95vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-black text-violet-900">
                {modal === 'crear' ? 'Agregar Pago' : 'Editar Pago'}
              </h2>
              <button onClick={cerrarModal} className="text-slate-400 hover:text-slate-600 transition-colors ml-4 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nombre con autocompletado */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="relative col-span-2">
                <label className="block text-sm font-semibold text-violet-700 mb-1">Nombre</label>
                <input type="text" value={form.nombre} onChange={e => handleNombreChange(e.target.value)}
                  placeholder="Escribe 2 o más letras..."
                  className="w-full border-2 border-violet-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-violet-400 text-slate-900" />
                {sugerencias.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-violet-200 rounded-xl shadow-lg mt-1 overflow-hidden">
                    {sugerencias.map(c => (
                      <li key={c.id} onClick={() => seleccionarCuenta(c)}
                        className="px-4 py-3 hover:bg-violet-50 cursor-pointer border-b border-slate-100 last:border-0">
                        <p className="text-sm font-semibold text-slate-800">{c.nombre}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{c.cedula} · <span className="font-mono">{c.cuenta}</span></p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-violet-700 mb-1">Cédula</label>
                <input type="text" value={form.cedula} onChange={e => setForm(f => ({ ...f, cedula: e.target.value }))}
                  className="w-full border-2 border-violet-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-violet-400 text-slate-900" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-violet-700 mb-1">Cuenta Bancaria</label>
                <input type="text" value={form.cuenta} onChange={e => setForm(f => ({ ...f, cuenta: e.target.value }))}
                  className="w-full border-2 border-violet-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-violet-400 text-slate-900" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-violet-700 mb-1">Detalle inicial</label>
                <input type="text" value={form.detalleInicial} onChange={e => setForm(f => ({ ...f, detalleInicial: e.target.value }))}
                  placeholder="Ej: Ref. o Factura"
                  className="w-full border-2 border-violet-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-violet-400 text-slate-900" />
              </div>
            </div>

            {/* OF y ML lado a lado */}
            <div className="grid grid-cols-2 gap-4 mb-4">
            {/* OF */}
            <div className="bg-violet-50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-violet-800 text-sm">Pago OF</span>
                <span className="text-xs text-violet-500">
                  Neto: <strong>{fmt(neto(parseFloat(String(form.brutOF)) || 0, form.descuentosOF))}</strong>
                </span>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-violet-600 mb-1">Valor Bruto OF</label>
                <input type="number" value={form.brutOF} onChange={e => setForm(f => ({ ...f, brutOF: e.target.value }))}
                  placeholder="0"
                  className="w-full border-2 border-violet-200 rounded-xl px-4 py-2 focus:outline-none focus:border-violet-400 text-slate-900 text-sm" />
              </div>
              {form.descuentosOF.map(d => (
                <div key={d.id} className="flex gap-2 mb-2">
                  <input type="number" value={d.monto || ''} onChange={e => updateDescuento('OF', d.id, 'monto', e.target.value)}
                    placeholder="Monto"
                    className="w-36 border-2 border-violet-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400" />
                  <input type="text" value={d.etiqueta} onChange={e => updateDescuento('OF', d.id, 'etiqueta', e.target.value)}
                    placeholder="Etiqueta (ej: RTE FTE)"
                    className="flex-1 border-2 border-violet-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400" />
                  <button onClick={() => removeDescuento('OF', d.id)}
                    className="text-red-400 hover:text-red-600 px-2 transition-colors">✕</button>
                </div>
              ))}
              <button onClick={() => addDescuento('OF')}
                className="text-xs text-violet-500 hover:text-violet-700 font-semibold mt-1 transition-colors">
                + Agregar descuento OF
              </button>
            </div>

            {/* ML */}
            <div className="bg-pink-50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-pink-800 text-sm">Pago ML</span>
                <span className="text-xs text-pink-500">
                  Neto: <strong>{fmt(neto(parseFloat(String(form.brutML)) || 0, form.descuentosML))}</strong>
                </span>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-pink-600 mb-1">Valor Bruto ML</label>
                <input type="number" value={form.brutML} onChange={e => setForm(f => ({ ...f, brutML: e.target.value }))}
                  placeholder="0"
                  className="w-full border-2 border-pink-200 rounded-xl px-4 py-2 focus:outline-none focus:border-pink-400 text-slate-900 text-sm" />
              </div>
              {form.descuentosML.map(d => (
                <div key={d.id} className="flex gap-2 mb-2">
                  <input type="number" value={d.monto || ''} onChange={e => updateDescuento('ML', d.id, 'monto', e.target.value)}
                    placeholder="Monto"
                    className="w-36 border-2 border-pink-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400" />
                  <input type="text" value={d.etiqueta} onChange={e => updateDescuento('ML', d.id, 'etiqueta', e.target.value)}
                    placeholder="Etiqueta (ej: TRANSP)"
                    className="flex-1 border-2 border-pink-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400" />
                  <button onClick={() => removeDescuento('ML', d.id)}
                    className="text-red-400 hover:text-red-600 px-2 transition-colors">✕</button>
                </div>
              ))}
              <button onClick={() => addDescuento('ML')}
                className="text-xs text-pink-500 hover:text-pink-700 font-semibold mt-1 transition-colors">
                + Agregar descuento ML
              </button>
            </div>
            </div>

            {errorForm && <p className="text-red-500 text-sm font-medium mb-4">{errorForm}</p>}

            <div className="flex gap-3">
              <button onClick={cerrarModal}
                className="flex-1 border-2 border-violet-200 text-violet-500 font-semibold py-2.5 rounded-xl hover:bg-violet-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleGuardar}
                className="flex-1 bg-violet-500 hover:bg-violet-600 text-white font-semibold py-2.5 rounded-xl transition-colors">
                {modal === 'crear' ? 'Agregar' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Detalle ────────────────────────────────────────────────── */}
      {modal === 'detalle' && seleccionado && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={cerrarModal}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8" onClick={e => e.stopPropagation()}>
            {/* Encabezado */}
            <div className="mb-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-black text-violet-900">{seleccionado.nombre}</h2>
                  <p className="text-slate-400 text-sm mt-1">{seleccionado.cedula} · {seleccionado.cuenta}</p>
                  {seleccionado.fechaOriginal && (
                    <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-3 py-1 rounded-full mt-2 inline-block">
                      Traído del {labelFecha(seleccionado.fechaOriginal)}
                    </span>
                  )}
                </div>
                <button onClick={cerrarModal} className="text-slate-400 hover:text-slate-600 transition-colors ml-4 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* OF */}
            {seleccionado.brutOF > 0 && (
              <div className="bg-violet-50 rounded-2xl p-4 mb-3">
                <p className="font-bold text-violet-700 text-sm mb-2 text-center">Pago OF</p>
                <div className="flex justify-between text-sm text-slate-600 mb-1">
                  <span>Valor Bruto</span><span className="font-semibold">{fmt(seleccionado.brutOF)}</span>
                </div>
                {seleccionado.descuentosOF.map(d => (
                  <div key={d.id} className="flex justify-between text-sm text-slate-500 mb-1">
                    <span>- {d.etiqueta || 'Descuento'}</span><span className="text-red-400">-{fmt(d.monto)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold text-emerald-700 border-t border-violet-200 pt-2 mt-2">
                  <span>Neto OF</span><span>{fmt(neto(seleccionado.brutOF, seleccionado.descuentosOF))}</span>
                </div>
              </div>
            )}

            {/* ML */}
            {seleccionado.brutML > 0 && (
              <div className="bg-pink-50 rounded-2xl p-4 mb-3">
                <p className="font-bold text-pink-700 text-sm mb-2 text-center">Pago ML</p>
                <div className="flex justify-between text-sm text-slate-600 mb-1">
                  <span>Valor Bruto</span><span className="font-semibold">{fmt(seleccionado.brutML)}</span>
                </div>
                {seleccionado.descuentosML.map(d => (
                  <div key={d.id} className="flex justify-between text-sm text-slate-500 mb-1">
                    <span>- {d.etiqueta || 'Descuento'}</span><span className="text-red-400">-{fmt(d.monto)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold text-emerald-700 border-t border-pink-200 pt-2 mt-2">
                  <span>Neto ML</span><span>{fmt(neto(seleccionado.brutML, seleccionado.descuentosML))}</span>
                </div>
              </div>
            )}

            {/* Detalle */}
            {seleccionado.detalleInicial && (
              <div className="bg-slate-50 rounded-2xl p-4 mb-5">
                <p className="text-xs font-semibold text-slate-400 mb-1">Detalle</p>
                <p className="text-sm text-slate-700">{buildDetalle(seleccionado)}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { cerrarModal(); abrirEditar(seleccionado); }}
                className="flex-1 border-2 border-violet-200 text-violet-500 font-semibold py-2.5 rounded-xl hover:bg-violet-50 transition-colors">
                Editar
              </button>
              <button onClick={() => { setModal('mover'); }}
                className="flex-1 border-2 border-amber-200 text-amber-500 font-semibold py-2.5 rounded-xl hover:bg-amber-50 transition-colors">
                Mover
              </button>
              <button onClick={() => setModal('eliminar')}
                className="flex-1 border-2 border-red-200 text-red-400 font-semibold py-2.5 rounded-xl hover:bg-red-50 transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Mover ──────────────────────────────────────────────────── */}
      {modal === 'mover' && seleccionado && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">
            <h2 className="text-xl font-black text-violet-900 mb-2">Mover pago</h2>
            <p className="text-slate-500 text-sm mb-5">
              Selecciona la nueva fecha para el pago de <span className="font-semibold text-slate-700">{seleccionado.nombre}</span>.
            </p>
            <label className="block text-sm font-semibold text-violet-700 mb-1">Nueva fecha</label>
            <input type="date" value={fechaMover} onChange={e => setFechaMover(e.target.value)}
              className="w-full border-2 border-violet-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-violet-400 text-slate-900 mb-6" />
            <div className="flex gap-3">
              <button onClick={cerrarModal}
                className="flex-1 border-2 border-slate-200 text-slate-500 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleMover} disabled={!fechaMover}
                className="flex-1 bg-amber-400 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl transition-colors">
                Mover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Eliminar ───────────────────────────────────────────────── */}
      {modal === 'eliminar' && seleccionado && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-red-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">¿Eliminar pago?</h2>
            <p className="text-slate-500 text-sm mb-8">
              ¿Seguro que desea eliminar el pago de <span className="font-semibold text-slate-700">{seleccionado.nombre}</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={cerrarModal}
                className="flex-1 border-2 border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleEliminar}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors">
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
