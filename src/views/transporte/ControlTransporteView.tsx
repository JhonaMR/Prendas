import React, { useState, useEffect, useCallback } from 'react';
import RegistroTransportesView from './RegistroTransportesView';
import TalleresView from './TalleresView';
import api from '../../services/api';
import { User } from '../../types';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Transportista {
  id: string;
  nombre: string;
  celular: string;
  picoyplaca: string;
  colorKey: string;
  tipoVehiculo: string;
}

interface RutaTransporte {
  id: string;
  fecha: string;
  transportistaId: string;
  items?: { id: string }[];
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_SEMANA_HEADER = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const DIAS_SEMANA_SELECTOR = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

const TIPOS_VEHICULO = [
  { value: 'moto', label: 'Moto' },
  { value: 'carro', label: 'Carro' }
];

const COLORES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  red:    { bg: 'bg-red-200',    text: 'text-red-700',    dot: 'bg-red-400',    label: 'Rojo'    },
  green:  { bg: 'bg-green-200',  text: 'text-green-700',  dot: 'bg-green-400',  label: 'Verde'   },
  blue:   { bg: 'bg-blue-200',   text: 'text-blue-700',   dot: 'bg-blue-400',   label: 'Azul'    },
  yellow: { bg: 'bg-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-400', label: 'Amarillo'},
  purple: { bg: 'bg-purple-200', text: 'text-purple-700', dot: 'bg-purple-400', label: 'Morado'  },
  orange: { bg: 'bg-orange-200', text: 'text-orange-700', dot: 'bg-orange-400', label: 'Naranja' },
  pink:   { bg: 'bg-pink-200',   text: 'text-pink-700',   dot: 'bg-pink-400',   label: 'Rosa'    },
};

const COLOR_KEYS = Object.keys(COLORES);

const TRANSPORTISTAS_DEFAULT: Transportista[] = [
  { id: '1', nombre: 'Jose Luis',      celular: '', picoyplaca: '', colorKey: 'red',   tipoVehiculo: 'carro' },
  { id: '2', nombre: 'Gilberto Marin', celular: '', picoyplaca: '', colorKey: 'green', tipoVehiculo: 'moto' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDiasEnMes(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function getPrimerDiaSemana(year: number, month: number) { return new Date(year, month, 1).getDay(); }
function toKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

const FORM_VACIO: Omit<Transportista,'id'> = { nombre:'', celular:'', picoyplaca:'', colorKey: 'red', tipoVehiculo: 'carro' };

// ─── Selector de color ────────────────────────────────────────────────────────

const ColorSelector: React.FC<{ value: string; onChange: (k: string) => void; usedKeys?: string[]; excludeSelf?: boolean }> = ({ value, onChange, usedKeys = [], excludeSelf = true }) => (
  <div className="space-y-1.5">
    <p className="text-xs text-slate-500 font-semibold">Color del indicador</p>
    <div className="flex gap-2 flex-wrap">
      {COLOR_KEYS.map(k => {
        const c = COLORES[k];
        const isUsed = excludeSelf
          ? usedKeys.includes(k) && k !== value
          : usedKeys.includes(k);
        return (
          <button
            key={k}
            type="button"
            onClick={() => !isUsed && onChange(k)}
            title={isUsed ? `${c.label} (en uso)` : c.label}
            disabled={isUsed}
            className={`w-7 h-7 rounded-full transition-all
              ${isUsed
                ? 'bg-slate-200 cursor-not-allowed opacity-50'
                : value === k
                  ? `${c.dot} ring-2 ring-offset-2 ring-slate-400 scale-110`
                  : `${c.dot} opacity-60 hover:opacity-100`
              }`}
          />
        );
      })}
    </div>
  </div>
);

// ─── Componente principal ────────────────────────────────────────────────────

const ControlTransporteView: React.FC<{ user?: User }> = ({ user }) => {
  const hoy = new Date();
  const [mes, setMes]   = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());

  const [transportistas, setTransportistas] = useState<Transportista[]>([]);
  const [rutas, setRutas] = useState<RutaTransporte[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [ts, rs] = await Promise.all([
        (api as any).getTransportistas(),
        (api as any).getRutasTransporte()
      ]);
      setTransportistas(ts);
      setRutas(rs);
    } catch (e) {
      console.error('Error cargando datos de transporte:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const persistirRutas = async (lista: RutaTransporte[], fecha: string) => {
    // Detectar todas las fechas afectadas (puede haber más de una al mover registros entre días)
    const fechasAfectadas = Array.from(new Set([fecha, ...lista.map(r => r.fecha)]));

    setRutas(prev => {
      let nuevo = [...prev];
      for (const f of fechasAfectadas) {
        nuevo = nuevo.filter(r => r.fecha !== f);
        nuevo = [...nuevo, ...lista.filter(r => r.fecha === f)];
      }
      return nuevo;
    });

    // Sincronizar cada fecha afectada con el backend
    await Promise.all(
      fechasAfectadas.map(f =>
        (api as any).syncRutasTransporte(f, lista.filter(r => r.fecha === f))
      )
    );
  };

  const [modalTransportistas, setModalTransportistas] = useState(false);
  const [formNuevo, setFormNuevo] = useState<Omit<Transportista,'id'>>({ ...FORM_VACIO });
  const [agregando, setAgregando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [formEditar, setFormEditar] = useState<Omit<Transportista,'id'>>({ ...FORM_VACIO });
  const [confirmEliminarId, setConfirmEliminarId] = useState<string | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);
  const [verTalleres, setVerTalleres] = useState(false);

  // ── Calendario ──
  const diasEnMes = getDiasEnMes(anio, mes);
  const primerDia = getPrimerDiaSemana(anio, mes);
  const anioActual = hoy.getFullYear();
  const anios = Array.from({ length: 5 }, (_, i) => anioActual - 2 + i);

  const celdas: (number | null)[] = [
    ...Array(primerDia).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => i + 1),
  ];
  while (celdas.length % 7 !== 0) celdas.push(null);

  const esHoy = (dia: number) =>
    dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear();

  const getRutasDia = (dia: number) => {
    const key = toKey(anio, mes, dia);
    const counts: Record<string, number> = {};
    rutas.filter((r: RutaTransporte) => r.fecha === key).forEach((r: RutaTransporte) => {
      counts[r.transportistaId] = (counts[r.transportistaId] || 0) + (r.items?.length || 0);
    });
    return counts;
  };

  // ── CRUD ──
  const agregarTransportista = async () => {
    if (!formNuevo.nombre.trim()) return;
    const nuevo = { id: Date.now().toString(), ...formNuevo };
    await (api as any).createTransportista(nuevo);
    setTransportistas(prev => [...prev, nuevo]);
    setFormNuevo({ ...FORM_VACIO });
    setAgregando(false);
  };

  const iniciarEdicion = (t: Transportista) => {
    setEditandoId(t.id);
    setFormEditar({ nombre: t.nombre, celular: t.celular, picoyplaca: t.picoyplaca, colorKey: t.colorKey || 'red', tipoVehiculo: t.tipoVehiculo || 'carro' });
  };

  const guardarEdicion = async () => {
    if (!formEditar.nombre.trim() || !editandoId) return;
    await (api as any).updateTransportista(editandoId, formEditar);
    setTransportistas(prev => prev.map((t: Transportista) => t.id === editandoId ? { ...t, ...formEditar } : t));
    setEditandoId(null);
  };

  const cancelarEdicion = () => setEditandoId(null);

  const eliminarTransportista = async (id: string) => {
    await (api as any).deleteTransportista(id);
    setTransportistas(prev => prev.filter((t: Transportista) => t.id !== id));
    setConfirmEliminarId(null);
  };

  const getColor = (t: Transportista) => COLORES[t.colorKey] || COLORES['red'];

  if (loading) {
    return <div className="h-full flex items-center justify-center text-slate-400 text-sm">Cargando...</div>;
  }

  if (verTalleres) {
    return <TalleresView onVolver={() => setVerTalleres(false)} user={user ?? undefined} />;
  }

  if (fechaSeleccionada) {
    return (
      <RegistroTransportesView
        fecha={fechaSeleccionada}
        transportistas={transportistas}
        rutas={rutas}
        onAgregarRuta={(ruta) => persistirRutas([...rutas, ruta], fechaSeleccionada)}
        onActualizarRutas={(lista) => persistirRutas(lista, fechaSeleccionada)}
        onVolver={() => setFechaSeleccionada(null)}
      />
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-transparent p-4 md:p-8 overflow-auto">

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">Control de Transporte</h1>
          <p className="text-slate-400 text-sm mt-1">Programaciones de ruta de transporte</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select value={mes} onChange={e => setMes(Number(e.target.value))}
            className="appearance-none bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl px-4 py-2 focus:outline-none focus:border-pink-400 cursor-pointer shadow-sm">
            {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={anio} onChange={e => setAnio(Number(e.target.value))}
            className="appearance-none bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl px-4 py-2 focus:outline-none focus:border-pink-400 cursor-pointer shadow-sm">
            {anios.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button onClick={() => setModalTransportistas(true)}
            className="flex items-center gap-2 bg-white border-2 border-slate-200 hover:border-pink-400 text-slate-600 hover:text-pink-600 font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            Control de transportistas
          </button>
          <button onClick={() => setVerTalleres(true)}
            className="flex items-center gap-2 bg-white border-2 border-slate-200 hover:border-pink-400 text-slate-600 hover:text-pink-600 font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
            </svg>
            Talleres
          </button>
        </div>
      </div>

      {/* Calendario */}
      <div className="flex-1 bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden flex flex-col min-h-[600px]">
        <div className="grid grid-cols-7 bg-slate-700">
          {DIAS_SEMANA_HEADER.map(d => (
            <div key={d} className="py-3 text-center text-white font-bold text-sm tracking-wide">{d}</div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7" style={{ gridAutoRows: '1fr' }}>
          {celdas.map((dia, idx) => {
            const colIdx = idx % 7;
            const esFinDeSemana = colIdx === 0 || colIdx === 6;
            if (dia === null) return <div key={`e-${idx}`} className={`border-b border-r border-slate-100 ${esFinDeSemana ? 'bg-slate-50' : ''}`} />;
            const counts = getRutasDia(dia);
            const hoyFlag = esHoy(dia);
            const tieneRutas = Object.keys(counts).length > 0;
            return (
              <div key={dia}
                onClick={() => setFechaSeleccionada(toKey(anio, mes, dia))}
                className={`relative border-b border-r border-slate-100 p-2 flex flex-col items-start justify-between min-h-[110px] cursor-pointer hover:brightness-95 transition-all ${hoyFlag ? 'bg-slate-700' : esFinDeSemana ? 'bg-slate-50' : 'bg-white'}`}>
                <span className={`text-sm md:text-base font-bold leading-none ${hoyFlag ? 'text-white' : 'text-slate-800'}`}>{dia}</span>
                {tieneRutas && (
                  <div className="flex flex-col gap-1 w-full mt-1 items-end">
                    {transportistas.map((t: Transportista) => {
                      const count = counts[t.id];
                      if (!count) return null;
                      const c = getColor(t);
                      return (
                        <div key={t.id} className="flex items-center gap-1 justify-end">
                          <span className={`text-xs text-slate-400 leading-none`}>{t.nombre}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text} flex-shrink-0`}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="mt-4 flex items-center gap-4 flex-wrap">
        {transportistas.map((t: Transportista) => {
          const c = getColor(t);
          return (
            <div key={t.id} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${c.dot}`} />
              <span className="text-xs text-slate-500 font-medium">{t.nombre}</span>
            </div>
          );
        })}
      </div>

      {/* Modal transportistas */}
      {modalTransportistas && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900">Transportistas</h2>
              <button onClick={() => { setModalTransportistas(false); setAgregando(false); setEditandoId(null); }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-500">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {transportistas.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No hay transportistas registrados</p>}
              {transportistas.map((t: Transportista) => {
                const c = getColor(t);
                return (
                  <div key={t.id} className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                    {editandoId === t.id ? (
                      <div className="p-4 space-y-3">
                        <input type="text" placeholder="Nombre" value={formEditar.nombre}
                          onChange={e => setFormEditar(p => ({ ...p, nombre: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-pink-400" />
                        <input type="text" placeholder="Celular" value={formEditar.celular}
                          onChange={e => setFormEditar(p => ({ ...p, celular: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-pink-400" />
                        <select value={formEditar.picoyplaca} onChange={e => setFormEditar(p => ({ ...p, picoyplaca: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 bg-white">
                          <option value="">Día de pico y placa</option>
                          {DIAS_SEMANA_SELECTOR.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select value={formEditar.tipoVehiculo} onChange={e => setFormEditar(p => ({ ...p, tipoVehiculo: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 bg-white">
                          <option value="">Tipo de vehículo</option>
                          {TIPOS_VEHICULO.map(tv => <option key={tv.value} value={tv.value}>{tv.label}</option>)}
                        </select>
                        <ColorSelector value={formEditar.colorKey} onChange={k => setFormEditar(p => ({ ...p, colorKey: k }))}
                          usedKeys={transportistas.filter((x: Transportista) => x.id !== editandoId).map((x: Transportista) => x.colorKey)} />
                        <div className="flex gap-2 pt-1">
                          <button onClick={guardarEdicion} className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 rounded-xl text-sm transition-colors">Guardar</button>
                          <button onClick={cancelarEdicion} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 rounded-xl text-sm transition-colors">Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${c.dot}`} />
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{t.nombre}</p>
                            <p className="text-xs text-slate-400">{t.celular || 'Sin celular'} · Pico y placa: {t.picoyplaca || '—'} · {TIPOS_VEHICULO.find(tv => tv.value === t.tipoVehiculo)?.label || 'Sin tipo'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => iniciarEdicion(t)}
                            className="w-7 h-7 flex items-center justify-center rounded-full text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          <button onClick={() => setConfirmEliminarId(t.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Formulario nuevo */}
            {agregando ? (
              <div className="p-6 border-t border-slate-100 space-y-3">
                <input type="text" placeholder="Nombre" value={formNuevo.nombre}
                  onChange={e => setFormNuevo(p => ({ ...p, nombre: e.target.value }))}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-pink-400" />
                <input type="text" placeholder="Celular" value={formNuevo.celular}
                  onChange={e => setFormNuevo(p => ({ ...p, celular: e.target.value }))}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-pink-400" />
                <select value={formNuevo.picoyplaca} onChange={e => setFormNuevo(p => ({ ...p, picoyplaca: e.target.value }))}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 bg-white">
                  <option value="">Día de pico y placa</option>
                  {DIAS_SEMANA_SELECTOR.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={formNuevo.tipoVehiculo} onChange={e => setFormNuevo(p => ({ ...p, tipoVehiculo: e.target.value }))}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 bg-white">
                  <option value="">Tipo de vehículo</option>
                  {TIPOS_VEHICULO.map(tv => <option key={tv.value} value={tv.value}>{tv.label}</option>)}
                </select>
                <ColorSelector value={formNuevo.colorKey} onChange={k => setFormNuevo(p => ({ ...p, colorKey: k }))}
                  usedKeys={transportistas.map((x: Transportista) => x.colorKey)} excludeSelf={false} />
                <div className="flex gap-2">
                  <button onClick={agregarTransportista} className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">Guardar</button>
                  <button onClick={() => { setAgregando(false); setFormNuevo({ ...FORM_VACIO }); }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm transition-colors">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="p-6 border-t border-slate-100">
                <button onClick={() => setAgregando(true)}
                  className="w-full flex items-center justify-center gap-2 bg-pink-50 hover:bg-pink-100 border-2 border-dashed border-pink-300 text-pink-600 font-bold py-3 rounded-2xl text-sm transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Agregar transportista
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal confirmación eliminar */}
      {confirmEliminarId && (() => {
        const t = transportistas.find((x: Transportista) => x.id === confirmEliminarId);
        if (!t) return null;
        return (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
              <div className="text-center space-y-1">
                <p className="text-slate-600 text-sm">¿Seguro que desea eliminar al transportista</p>
                <p className="font-black text-slate-900 text-base">{t.nombre}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => eliminarTransportista(confirmEliminarId)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">Eliminar</button>
                <button onClick={() => setConfirmEliminarId(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm transition-colors">Cancelar</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ControlTransporteView;
