import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { User, AppState } from '../types';
import { ConceptoFicha } from '../types/typesFichas';

const LS_PCT_OF = 'pago_lotes_pct_of';
const LS_PCT_ML = 'pago_lotes_pct_ml';
const LS_BASE_RTE = 'pago_lotes_base_rte_fte';
const getLS = (key: string, def: number) => { const v = localStorage.getItem(key); return v !== null ? Number(v) : def; };

const KEYWORDS_EST = ['estampado', 'aplique', 'sublimado', 'resortado', 'ojal', 'boton', 'tenido', 'pegada', 'bordado', 'perla', 'perlado'];
const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const matchesKeyword = (c: string) => KEYWORDS_EST.some(kw => normalize(c).includes(normalize(kw)));
const fmt = (n: number) => '$ ' + Math.round(n).toLocaleString('es-CO');

interface LoteRow {
  id: string;
  referencia: string;
  concepto: string;
  vlrUnit: number;
  unidades: number;
  total: number;
  cobro: boolean;
  unidadesCobro: number;
  precioVenta: number;
  manual?: boolean;
}

interface Props { user: User; state: AppState; onNavigate: (tab: string, params?: any) => void; onBack: () => void; }

const PagoEstampadorasView: React.FC<Props> = ({ state, onNavigate, onBack }) => {
  const [referenciaInput, setReferenciaInput] = useState('');
  const [referencia, setReferencia] = useState('');
  const [unidades, setUnidades] = useState<number | ''>(1);
  const [lotes, setLotes] = useState<LoteRow[]>([]);
  const [fotoModal, setFotoModal] = useState<{ url: string; ref: string } | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [modalAsentar, setModalAsentar] = useState(false);
  const [fechaLlegada, setFechaLlegada] = useState('');
  const [fechaSugerida, setFechaSugerida] = useState('');
  const [modalTransportes, setModalTransportes] = useState(false);
  const [transportesData, setTransportesData] = useState<any[]>([]);
  const [transportesLoading, setTransportesLoading] = useState(false);
  const [transpValor, setTranspValor] = useState<number | ''>('');
  const [transpCant, setTranspCant] = useState<number | ''>('');
  const [pctOF, setPctOF] = useState(() => getLS(LS_PCT_OF, 40));
  const [pctML, setPctML] = useState(() => getLS(LS_PCT_ML, 60));
  const [baseRte, setBaseRte] = useState(() => getLS(LS_BASE_RTE, 105000));

  // Cargar config desde BD al montar
  useEffect(() => {
    import('../services/api').then(({ default: api }) => {
      api.getPagoLotesConfig().then(cfg => {
        setPctOF(cfg.pct_of);
        setPctML(cfg.pct_ml);
        setBaseRte(cfg.base_rte_fte);
      });
    });
  }, []);

  const saveConfig = () => {
    if (pctOF + pctML !== 100) return;
    localStorage.setItem(LS_PCT_OF, String(pctOF));
    localStorage.setItem(LS_PCT_ML, String(pctML));
    localStorage.setItem(LS_BASE_RTE, String(baseRte));
    import('../services/api').then(({ default: api }) => {
      api.updatePagoLotesConfig({ pct_of: pctOF, pct_ml: pctML, base_rte_fte: baseRte });
    });
    setConfigOpen(false);
  };

  const ficha = useMemo(() => (state.fichasCosto || []).find((f: any) => f.referencia === referencia) ?? null, [state.fichasCosto, referencia]);
  const notFound = referencia !== '' && ficha === null;

  const conceptosFiltrados: ConceptoFicha[] = useMemo(() => {
    if (!ficha) return [];
    return (ficha.manoObra || []).filter((c: ConceptoFicha) => matchesKeyword(c.concepto));
  }, [ficha]);

  const buscarReferencia = () => setReferencia(referenciaInput.trim().toUpperCase());
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') buscarReferencia(); };

  const abrirModalTransportes = async () => {
    setModalTransportes(true);
    setTransportesLoading(true);
    const api = (await import('../services/api')).default;
    const refs = referencia ? [referencia] : [...new Set(lotes.map(l => l.referencia).filter(Boolean))];
    const results = await Promise.all(refs.map(r => api.getTransportesPorReferencia(r)));
    setTransportesData(results.flat());
    setTransportesLoading(false);
  };

  const transpDescuento = typeof transpValor === 'number' && transpValor > 0 ? transpValor : 0;
  const transpCantNum = typeof transpCant === 'number' && transpCant > 0 ? transpCant : 0;

  const agregarLote = (concepto: ConceptoFicha) => {
    const u = typeof unidades === 'number' && unidades > 0 ? unidades : 1;
    setLotes(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      referencia,
      concepto: concepto.concepto,
      vlrUnit: concepto.total,
      unidades: u,
      total: concepto.total * u,
      cobro: false,
      unidadesCobro: 0,
      precioVenta: ficha?.precioVenta || 0,
    }]);
  };

  const agregarLoteManual = () => {
    setLotes(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      referencia: '',
      concepto: '',
      vlrUnit: 0,
      unidades: 1,
      total: 0,
      cobro: false,
      unidadesCobro: 0,
      precioVenta: 0,
      manual: true,
    }]);
  };

  const updateCampo = (id: string, campo: keyof LoteRow, val: string | number | boolean) => {
    setLotes(prev => prev.map(l => {
      if (l.id !== id) return l;
      const updated = { ...l, [campo]: val };
      // Recalcular total si cambia vlrUnit o unidades
      if (campo === 'vlrUnit' || campo === 'unidades') {
        updated.total = (campo === 'vlrUnit' ? Number(val) : l.vlrUnit) * (campo === 'unidades' ? Number(val) : l.unidades);
      }
      return updated;
    }));
  };
  const eliminarLote = (id: string) => setLotes(prev => prev.filter(l => l.id !== id));

  const toggleCobro = (id: string) => setLotes(prev => prev.map(l => l.id === id ? { ...l, cobro: !l.cobro, unidadesCobro: !l.cobro ? 1 : 0 } : l));
  const updateUnidadesCobro = (id: string, val: number) => setLotes(prev => prev.map(l => l.id === id ? { ...l, unidadesCobro: val } : l));

  const updateUnidades = (id: string, val: number) => setLotes(prev => prev.map(l => l.id === id ? { ...l, unidades: val, total: l.vlrUnit * val } : l));

  // ESC cierra modal foto
  const handleEsc = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') setFotoModal(null); }, []);
  useEffect(() => { document.addEventListener('keydown', handleEsc); return () => document.removeEventListener('keydown', handleEsc); }, [handleEsc]);

  // Cálculos
  const totalLotes = lotes.reduce((acc, l) => acc + l.total, 0);
  const totalCobro = lotes.filter(l => l.cobro).reduce((acc, l) => acc + (l.precioVenta + 500) * l.unidadesCobro, 0);
  const valorOF = totalLotes * (pctOF / 100);
  const valorML = totalLotes * (pctML / 100);
  const rteFte = valorOF >= baseRte ? valorOF * 0.06 : 0;
  const totalOF = valorOF - rteFte;
  const totalMLNeto = valorML - totalCobro - (transpDescuento > 0 && transpCantNum > 0 ? transpDescuento : 0);

  // Fecha sugerida: hoy + 7 días, sábado → lunes
  const calcFechaSugerida = (base: string): string => {
    if (!base) return '';
    const [y, m, d] = base.slice(0, 10).split('-').map(Number);
    if (!y || !m || !d) return '';
    const fecha = new Date(y, m - 1, d);
    fecha.setDate(fecha.getDate() + 7);
    if (fecha.getDay() === 6) fecha.setDate(fecha.getDate() + 2);
    const yy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  };

  const abrirModalAsentar = () => {
    const hoy = new Date().toISOString().slice(0, 10);
    setFechaLlegada(hoy);
    setFechaSugerida(calcFechaSugerida(hoy));
    setModalAsentar(true);
  };

  const handleAsentar = () => {
    if (!fechaSugerida) return;
    // Construir detalle: REF. 12345 - 12978 - 13036
    const refs = [...new Set(lotes.map(l => l.referencia))];
    const detalleInicial = `REF. ${refs.join(' - ')}`;

    const descuentosOF = rteFte > 0
      ? [{ id: Date.now(), etiqueta: 'RTE FTE', monto: Math.round(rteFte) }]
      : [];

    // Cobro ML: suma total de cobros con etiqueta COBRO (N und)
    const totalUnidadesCobro = lotes.filter(l => l.cobro).reduce((a, l) => a + l.unidadesCobro, 0);
    const descuentosML: { id: number; etiqueta: string; monto: number }[] = [];
    if (totalCobro > 0)
      descuentosML.push({ id: Date.now() + 1, etiqueta: `COBRO (${totalUnidadesCobro})`, monto: Math.round(totalCobro) });
    if (transpDescuento > 0 && transpCantNum > 0)
      descuentosML.push({ id: Date.now() + 2, etiqueta: `Transp ${transpCantNum}`, monto: Math.round(transpDescuento) });

    setModalAsentar(false);
    onNavigate('programacionPagosDia', {
      fecha: fechaSugerida,
      precargar: {
        detalleInicial,
        brutOF: Math.round(valorOF),
        brutML: Math.round(valorML),
        descuentosOF,
        descuentosML,
      }
    });
  };

  return (
    <div className="pb-24 space-y-6">

      {/* Header */}
      <div className="relative bg-gradient-to-r from-purple-500 via-violet-400 to-purple-400 rounded-3xl p-6 overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white" />
          <div className="absolute -bottom-12 -left-6 w-36 h-36 rounded-full bg-white" />
        </div>
        <div className="relative flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Pago a Estampadores</h2>
              <p className="text-purple-100 text-sm">Liquidación de lotes por estampado y aplique</p>
            </div>
          </div>
          <button onClick={() => setConfigOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-colors backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configurar bases
          </button>
        </div>
      </div>

      {/* Buscar referencia + Conceptos en dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

        {/* Columna izquierda: Buscar referencia */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-purple-50 px-6 py-3 border-b border-purple-100">
            <p className="text-sm font-black text-slate-800 uppercase tracking-widest text-center">Buscar referencia</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Referencia</label>
                <div className="flex gap-2">
                  <input type="text" value={referenciaInput} onChange={e => setReferenciaInput(e.target.value.toUpperCase())} onKeyDown={handleKeyDown} placeholder="Ej: 13121"
                    className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none font-bold text-slate-800 text-sm transition-all" />
                  <button onClick={buscarReferencia} className="px-5 py-3 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm transition-colors shadow-sm">Buscar</button>
                </div>
                {notFound && (
                  <p className="mt-2 text-xs font-semibold text-red-500 flex items-center gap-1.5 bg-red-50 px-3 py-2 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    Referencia no encontrada. Revise la referencia ingresada.
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Unidades</label>
                <input type="number" min={1} value={unidades} onChange={e => setUnidades(e.target.value === '' ? '' : Number(e.target.value))}
                  onFocus={e => e.target.select()} disabled={!ficha}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none font-bold text-slate-800 text-sm text-center transition-all disabled:opacity-40 disabled:cursor-not-allowed" />
              </div>
            </div>
            {/* Info de la ficha */}
            {ficha && (
              <div className="pt-4 border-t border-slate-100 space-y-1">
                <p className="text-base font-black text-slate-800">{ficha.referencia}</p>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-slate-600 font-medium">{ficha.descripcion}</p>
                  <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
                    {ficha.marca && <span className="text-xs bg-purple-50 text-purple-500 font-bold px-2 py-0.5 rounded-lg">{ficha.marca}</span>}
                    {ficha.disenadoraNombre && <span className="text-xs bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-lg">{ficha.disenadoraNombre}</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha: Conceptos */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-purple-50 px-6 py-3 border-b border-purple-100 flex items-center justify-between">
            <p className="text-sm font-black text-slate-800 uppercase tracking-widest">
              {ficha ? `Conceptos — ${ficha.referencia}` : 'Conceptos'}
            </p>
            {ficha && (
              <div className="flex items-center gap-2">
                {ficha.foto1 && (
                  <button onClick={() => setFotoModal({ url: ficha.foto1!, ref: ficha.referencia })}
                    className="p-1.5 rounded-lg bg-white hover:bg-purple-100 text-purple-500 transition-colors border border-purple-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                )}
                <button onClick={() => onNavigate('fichas-costo-detalle', { referencia: ficha.referencia })}
                  className="p-1.5 rounded-lg bg-white hover:bg-purple-100 text-purple-500 transition-colors border border-purple-100">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className="p-6">
            {!ficha ? (
              <p className="text-sm text-slate-400 italic text-center py-8">Busca una referencia para ver sus conceptos.</p>
            ) : conceptosFiltrados.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-4">No se encontraron conceptos de estampado, aplique, sublimado, etc. en la ficha de costo.</p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-3 px-4 pb-3 border-b border-slate-100">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider col-span-2">Concepto</span>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider text-right">Vlr. Unit.</span>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider text-right">Total</span>
                </div>
                {conceptosFiltrados.map((c, i) => (
                  <div key={i} className="grid grid-cols-4 gap-3 px-4 py-3 rounded-2xl bg-purple-50 border border-purple-100 items-center">
                    <div className="col-span-2 flex items-center gap-2">
                      <button onClick={() => agregarLote(c)}
                        className="w-7 h-7 rounded-full bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-sm font-black text-sm">
                        +
                      </button>
                      <span className="text-sm font-bold text-slate-700">{c.concepto}</span>
                    </div>
                    <span className="text-[15px] font-semibold text-slate-500 text-right leading-none">{fmt(c.total)}</span>
                    <span className="text-sm font-black text-purple-600 text-right">{fmt(c.total * (typeof unidades === 'number' ? unidades : 1))}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lotes a liquidar */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-slate-800 px-6 py-3 flex items-center justify-between relative">
          <p className="absolute left-1/2 -translate-x-1/2 text-sm font-black text-white uppercase tracking-widest">Lotes a liquidar</p>
          <div className="ml-auto">
            <button onClick={agregarLoteManual}
              className="flex items-center gap-1.5 text-xs font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Agregar concepto
            </button>
          </div>
        </div>
        <div className="p-6 space-y-2">
          {lotes.length === 0 ? (
            <p className="text-center text-slate-300 font-medium py-8 italic">Agrega lotes desde los conceptos de la referencia buscada.</p>
          ) : (
            <>
            {/* Header columnas */}
            <div className="grid grid-cols-12 gap-2 px-4 pb-3 border-b border-slate-100 items-center">
              <span className="col-span-1 text-xs font-black text-slate-400 uppercase tracking-wider text-center">Cobro</span>
              <span className="col-span-3 text-xs font-black text-slate-400 uppercase tracking-wider">Concepto</span>
              <span className="col-span-1 text-xs font-black text-slate-400 uppercase tracking-wider text-center">Ref.</span>
              <span className="col-span-2 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Vlr. Unit.</span>
              <span className="col-span-1 text-xs font-black text-slate-400 uppercase tracking-wider text-center"></span>
              <span className="col-span-1 text-xs font-black text-slate-400 uppercase tracking-wider text-center">Und.</span>
              <span className="col-span-1 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Total</span>
              <span className="col-span-1 text-xs font-black text-slate-400 uppercase tracking-wider text-center">Fotos</span>
              <span className="col-span-1 text-xs font-black text-slate-400 uppercase tracking-wider text-center">Quitar</span>
            </div>

            {lotes.map(l => (
              <div key={l.id} className={`rounded-2xl transition-all ${l.cobro ? 'bg-purple-50 border border-purple-100' : 'bg-slate-50'}`}>
                {/* Fila principal */}
                <div className="grid grid-cols-12 gap-2 px-4 py-3 items-center">
                  {/* Toggle cobro */}
                  <div className="col-span-1 flex justify-center">
                    <div onClick={() => toggleCobro(l.id)} className="cursor-pointer">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${l.cobro ? 'bg-purple-500 border-purple-500' : 'border-slate-300 bg-white'}`}>
                        {l.cobro && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                      </div>
                    </div>
                  </div>
                  {/* Concepto */}
                  {l.manual ? (
                    <input type="text" value={l.concepto} onChange={e => updateCampo(l.id, 'concepto', e.target.value)}
                      placeholder="Concepto"
                      className="col-span-3 px-2 py-1.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-200 outline-none font-bold text-slate-700 text-sm bg-white" />
                  ) : (
                    <span className="col-span-3 text-sm font-bold text-slate-700 truncate">{l.concepto}</span>
                  )}
                  {/* Referencia */}
                  {l.manual ? (
                    <input type="text" value={l.referencia} onChange={e => updateCampo(l.id, 'referencia', e.target.value.toUpperCase())}
                      placeholder="Ref."
                      className="col-span-1 px-2 py-1.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-200 outline-none font-black text-purple-500 text-sm text-center bg-white" />
                  ) : (
                    <span className="col-span-1 text-sm font-black text-purple-500 text-center leading-none">{l.referencia}</span>
                  )}
                  {/* Vlr Unit */}
                  {l.manual ? (
                    <input type="number" min={0} value={l.vlrUnit || ''} onChange={e => updateCampo(l.id, 'vlrUnit', parseFloat(e.target.value) || 0)}
                      placeholder="Precio"
                      className="col-span-2 px-2 py-1.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-200 outline-none font-semibold text-slate-500 text-sm text-right bg-white" />
                  ) : (
                    <span className="col-span-2 text-[15px] font-semibold text-slate-500 text-right leading-none">{fmt(l.vlrUnit)}</span>
                  )}
                  {/* spacer */}
                  <div className="col-span-1" />
                  {/* Unidades */}
                  <div className="col-span-1 flex justify-center">
                    <input type="number" min={1} value={l.unidades}
                      onChange={e => updateUnidades(l.id, Number(e.target.value) || 1)}
                      onFocus={e => e.target.select()}
                      className="w-14 px-2 py-1.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-200 outline-none font-bold text-slate-800 text-sm text-center bg-white" />
                  </div>
                  {/* Total */}
                  <span className={`col-span-1 text-sm font-black text-right ${l.cobro ? 'text-purple-600' : 'text-slate-800'}`}>{fmt(l.total)}</span>
                  {/* Botones foto + ficha */}
                  <div className="col-span-1 flex justify-center gap-1">
                    {(state.fichasCosto || []).find((f: any) => f.referencia === l.referencia)?.foto1 && (
                      <button onClick={() => { const f = (state.fichasCosto || []).find((f: any) => f.referencia === l.referencia); if (f?.foto1) setFotoModal({ url: f.foto1, ref: l.referencia }); }}
                        className="p-1 rounded-lg bg-white hover:bg-purple-100 text-purple-400 transition-colors border border-slate-200">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    )}
                    <button onClick={() => onNavigate('fichas-costo-detalle', { referencia: l.referencia })}
                      className="p-1 rounded-lg bg-white hover:bg-purple-100 text-purple-400 transition-colors border border-slate-200">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </button>
                  </div>
                  {/* Eliminar */}
                  <div className="col-span-1 flex justify-center">
                    <button onClick={() => eliminarLote(l.id)} className="p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Fila de cobro — aparece si toggle activo */}
                {l.cobro && (
                  <div className="grid grid-cols-12 gap-2 px-4 pb-3 items-center border-t border-purple-100">
                    <div className="col-span-1" />
                    <span className="col-span-3 text-xs font-black text-purple-500 uppercase tracking-wider">Und. a cobrar</span>
                    <div className="col-span-1" />
                    <span className="col-span-2 text-xs text-slate-400 font-semibold text-right">{fmt(l.precioVenta + 500)} / und</span>
                    <div className="col-span-1 flex justify-center">
                      <input type="number" min={0} max={l.unidades} value={l.unidadesCobro}
                        onChange={e => updateUnidadesCobro(l.id, Math.min(Number(e.target.value) || 0, l.unidades))}
                        onFocus={e => e.target.select()}
                        className="w-14 px-2 py-1.5 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-300 outline-none font-bold text-purple-700 text-sm text-center bg-white" />
                    </div>
                    <span className="col-span-2 text-sm font-black text-purple-600 text-right">{fmt((l.precioVenta + 500) * l.unidadesCobro)}</span>
                    <div className="col-span-2" />
                  </div>
                )}
              </div>
            ))}

            {/* Total */}
            <div className="flex justify-between items-center px-4 pt-3 border-t border-slate-100 mt-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total lotes</span>
              <span className="text-2xl font-black text-slate-800">{fmt(totalLotes)}</span>
            </div>
            </>
          )}
        </div>
      </div>

      {/* Totales OF / ML */}
      {lotes.length > 0 && (
        <>
          <div className="bg-gradient-to-r from-purple-500 to-violet-400 rounded-3xl p-6 shadow-lg flex items-center justify-between gap-4">
            <div>
              <p className="text-purple-100 text-xs font-black uppercase tracking-widest mb-1">Total neto a pagar</p>
              <p className="text-5xl font-black text-white">{fmt(totalLotes)}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={abrirModalTransportes}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-black text-sm px-5 py-3 rounded-2xl shadow transition-colors backdrop-blur-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                Buscar transportes
              </button>
              <button
                onClick={abrirModalAsentar}
                className="flex items-center gap-2 bg-violet-400 hover:bg-violet-300 text-white font-black text-sm px-5 py-3 rounded-2xl shadow transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                Asentar pago en programación
              </button>
              <button
                onClick={() => {
                  const lineas = lotes.map(l => ({
                    concepto: l.concepto,
                    referencia: l.referencia,
                    precio: l.vlrUnit,
                    cantidadReal: l.unidades * (pctOF / 100),
                    cantidadVisual: Math.ceil(l.unidades * (pctOF / 100)),
                  }));
                  onNavigate('cuentasCobro', {
                    fecha: new Date().toISOString().slice(0, 10),
                    lineas,
                  });
                }}
                disabled={lotes.length === 0}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm px-5 py-3 rounded-2xl shadow transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Generar cuenta de cobro
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* OF */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex items-center justify-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center"><span className="text-xs font-black text-blue-600">OF</span></div>
                <span className="text-sm font-black text-slate-800">{pctOF}% del total</span>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-3xl font-black text-blue-600 mb-3">{fmt(valorOF)}</p>
                <div className="mt-auto pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between items-center" style={{ visibility: rteFte > 0 ? 'visible' : 'hidden' }}>
                    <span className="text-xs text-slate-400 font-semibold">Rte. Fte. (6%)</span>
                    <span className="text-sm text-red-400 font-black">− {fmt(rteFte)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50 rounded-xl px-3 py-2">
                    <span className="text-xs text-blue-600 font-black uppercase tracking-wide">Total a pagar</span>
                    <span className="text-base text-blue-700 font-black">{fmt(totalOF)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ML */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-emerald-50 px-6 py-3 border-b border-emerald-100 flex items-center justify-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center"><span className="text-xs font-black text-emerald-600">ML</span></div>
                <span className="text-sm font-black text-slate-800">{pctML}% del total</span>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-3xl font-black text-emerald-600 mb-3">{fmt(valorML)}</p>
                <div className="mt-auto pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between items-center" style={{ visibility: totalCobro > 0 ? 'visible' : 'hidden' }}>
                    <span className="text-xs text-slate-400 font-semibold">Cobro ({lotes.filter(l => l.cobro).length} lote{lotes.filter(l => l.cobro).length !== 1 ? 's' : ''})</span>
                    <span className="text-sm text-red-400 font-black">− {fmt(totalCobro)}</span>
                  </div>
                  <div className="flex justify-between items-center" style={{ visibility: transpDescuento > 0 && transpCantNum > 0 ? 'visible' : 'hidden' }}>
                    <span className="text-xs text-slate-400 font-semibold">Transp. ({transpCantNum})</span>
                    <span className="text-sm text-red-400 font-black">− {fmt(transpDescuento)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-emerald-50 rounded-xl px-3 py-2">
                    <span className="text-xs text-emerald-600 font-black uppercase tracking-wide">Total a pagar</span>
                    <span className="text-base text-emerald-700 font-black">{fmt(totalMLNeto)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total a pagar Lote */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-slate-800 px-6 py-3">
              <p className="text-sm font-black text-white uppercase tracking-widest text-center">Total a pagar Lote</p>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between items-center py-3 px-4 rounded-2xl bg-blue-50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center"><span className="text-xs font-black text-blue-600">OF</span></div>
                  <span className="text-xs font-black text-slate-500">Total pago oficial</span>
                </div>
                <span className="text-base font-black text-blue-700">{fmt(totalOF)}</span>
              </div>
              <div className="flex justify-between items-center py-3 px-4 rounded-2xl bg-emerald-50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center"><span className="text-xs font-black text-emerald-600">ML</span></div>
                  <span className="text-xs font-black text-slate-500">Total pago remisión</span>
                </div>
                <span className="text-base font-black text-emerald-700">{fmt(totalMLNeto)}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal asentar pago */}
      {modalAsentar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-800 text-xl">Asentar pago en programación</h3>
              <button onClick={() => setModalAsentar(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Fecha de proceso</label>
                <input type="date" value={fechaLlegada}
                  onChange={e => { setFechaLlegada(e.target.value); setFechaSugerida(calcFechaSugerida(e.target.value)); }}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none font-bold text-slate-800 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Fecha sugerida de pago <span className="text-purple-400 font-normal">(+7 días)</span>
                </label>
                <input type="date" value={fechaSugerida} onChange={e => setFechaSugerida(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none font-bold text-purple-700 text-sm" />
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 text-xs text-purple-600 space-y-2">
                <p className="text-center font-bold text-sm">{`REF. ${[...new Set(lotes.map(l => l.referencia))].join(' - ')}`}</p>
                <div className="flex gap-3">
                  <div className="flex-1 bg-white rounded-xl p-2 text-center">
                    <p className="text-purple-400 font-semibold mb-0.5">Bruto OF</p>
                    <p className="font-black text-purple-700">{fmt(Math.round(valorOF))}</p>
                    {rteFte > 0 && <p className="text-red-400 text-xs mt-0.5">RTE FTE: -{fmt(Math.round(rteFte))}</p>}
                  </div>
                  <div className="flex-1 bg-white rounded-xl p-2 text-center">
                    <p className="text-purple-400 font-semibold mb-0.5">Bruto ML</p>
                    <p className="font-black text-purple-700">{fmt(Math.round(valorML))}</p>
                    {totalCobro > 0 && <p className="text-red-400 text-xs mt-0.5">COBRO: -{fmt(Math.round(totalCobro))}</p>}
                    {transpDescuento > 0 && transpCantNum > 0 && <p className="text-red-400 text-xs mt-0.5">Transp {transpCantNum}: -{fmt(Math.round(transpDescuento))}</p>}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalAsentar(false)}
                className="flex-1 border-2 border-slate-200 text-slate-500 font-semibold py-3 rounded-2xl hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleAsentar} disabled={!fechaSugerida}
                className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:opacity-40 text-white font-black py-3 rounded-2xl transition-colors">
                Asentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal transportes */}
      {modalTransportes && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 flex flex-col gap-4 max-h-[90vh]">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-800 text-xl">Transportes — {referencia || 'Lotes'}</h3>
              <button onClick={() => setModalTransportes(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-auto flex-1 rounded-2xl border border-slate-100">
              {transportesLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-400 text-sm font-semibold">Buscando...</div>
              ) : transportesData.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-slate-400 text-sm font-semibold">No se encontraron transportes para esta referencia.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-wider">Taller</th>
                      <th className="text-left px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-wider">Detalle</th>
                      <th className="text-left px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-wider">Fecha</th>
                      <th className="text-left px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-wider">Transportista</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transportesData.map((t: any, i: number) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-700">{t.taller}</td>
                        <td className="px-4 py-3 text-slate-600">{t.detalle}</td>
                        <td className="px-4 py-3 text-slate-500">{t.fecha}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{t.transportista}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="bg-emerald-50 rounded-2xl p-4 flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5">Valor a descontar</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                  <input type="number" min={0} value={transpValor}
                    onChange={e => setTranspValor(e.target.value === '' ? '' : Number(e.target.value))}
                    onFocus={e => e.target.select()} placeholder="0"
                    className="w-full pl-7 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none font-bold text-slate-800 text-sm" />
                </div>
              </div>
              <div className="w-32">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5">Cant. transp</label>
                <input type="number" min={0} value={transpCant}
                  onChange={e => setTranspCant(e.target.value === '' ? '' : Number(e.target.value))}
                  onFocus={e => e.target.select()} placeholder="0"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none font-bold text-slate-800 text-sm text-center" />
              </div>
              <button onClick={() => setModalTransportes(false)} disabled={!transpValor || !transpCant}
                className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm transition-colors">
                Aplicar
              </button>
            </div>
            {transpDescuento > 0 && transpCantNum > 0 && (
              <div className="flex justify-between items-center bg-red-50 rounded-2xl px-4 py-3">
                <span className="text-sm font-black text-slate-600">Transp. ({transpCantNum}) — descuento aplicado en ML</span>
                <span className="text-sm font-black text-red-500">− {fmt(transpDescuento)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal foto */}
      {fotoModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setFotoModal(null)}>
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <p className="font-black text-slate-700 text-sm">{fotoModal.ref}</p>
              <button onClick={() => setFotoModal(null)} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <img src={fotoModal.url} alt={fotoModal.ref} className="w-full object-contain max-h-[70vh]" />
            <p className="text-center text-xs text-slate-400 py-2">Presiona ESC para cerrar</p>
          </div>
        </div>
      )}

      {/* Modal config */}
      {configOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-5">
            <h3 className="font-black text-slate-800 text-lg text-center">Configurar bases</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1 text-center">% OF</label>
                  <input type="number" value={pctOF} onChange={e => setPctOF(Number(e.target.value))} onFocus={e => e.target.select()} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-purple-200 outline-none font-bold text-slate-800 text-sm text-center" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1 text-center">% ML</label>
                  <input type="number" value={pctML} onChange={e => setPctML(Number(e.target.value))} onFocus={e => e.target.select()} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-purple-200 outline-none font-bold text-slate-800 text-sm text-center" />
                </div>
              </div>
              {pctOF + pctML !== 100 && (
                <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5 bg-red-50 px-3 py-2 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  OF + ML debe sumar 100. Actualmente suman {pctOF + pctML}.
                </p>
              )}
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">Base Rte. Fte.</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                  <input type="number" value={baseRte} onChange={e => setBaseRte(Number(e.target.value))} onFocus={e => e.target.select()} className="w-full pl-8 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-purple-200 outline-none font-bold text-slate-800 text-sm" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={saveConfig} disabled={pctOF + pctML !== 100} className="flex-1 py-3 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-black text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Guardar</button>
              <button onClick={() => setConfigOpen(false)} className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-sm transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagoEstampadorasView;
