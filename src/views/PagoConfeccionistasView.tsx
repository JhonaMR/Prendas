import React, { useState, useMemo, useEffect } from 'react';
import { User, AppState } from '../types';
import { ConceptoFicha } from '../types/typesFichas';

const LS_PCT_OF = 'pago_lotes_pct_of';
const LS_PCT_ML = 'pago_lotes_pct_ml';
const LS_BASE_RTE = 'pago_lotes_base_rte_fte';
const getLS = (key: string, def: number) => { const v = localStorage.getItem(key); return v !== null ? Number(v) : def; };
const KEYWORDS = ['confeccion', 'pegada de placa', 'terminacion', 'manualidad', 'empaque'];
const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const matchesKeyword = (c: string) => KEYWORDS.some(kw => normalize(c).includes(normalize(kw)));
const fmt = (n: number) => '$ ' + Math.round(n).toLocaleString('es-CO');

interface Props { user: User; state: AppState; onNavigate: (tab: string, params?: any) => void; onBack: () => void; loteData?: { referencia: string; unidades: number; cantidadCompra: number; cobroSeleccionado: boolean; empaqueSeleccionado: boolean; batchCode: string; arrivalDate?: string; } | null; }

const PagoConfeccionistasView: React.FC<Props> = ({ state, onNavigate, onBack, loteData }) => {
  const [referencia, setReferencia] = useState(loteData?.referencia || '');
  const [referenciaInput, setReferenciaInput] = useState(loteData?.referencia || '');
  const [unidades, setUnidades] = useState<number | ''>(loteData?.unidades ?? '');
  const [cantidadCompra, setCantidadCompra] = useState<number | ''>(loteData?.cantidadCompra ?? 1);
  const [configOpen, setConfigOpen] = useState(false);
  const [cobroSeleccionado, setCobroSeleccionado] = useState(loteData?.cobroSeleccionado ?? false);
  const [remisionInput, setRemisionInput] = useState(loteData?.batchCode || '');
  const [arrivalDate, setArrivalDate] = useState<string>(loteData?.arrivalDate || '');
  const [confeccionistaId, setConfeccionistaId] = useState<string>(loteData?.confeccionistaId || '');
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

  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  useEffect(() => {
    const allIndices = new Set(conceptosFiltrados.map((_, i) => i));
    // Si viene de un lote, des-seleccionar empaque según isPacked
    if (loteData && conceptosFiltrados.length > 0) {
      if (!loteData.empaqueSeleccionado) {
        // des-seleccionar los conceptos que contengan 'empaque'
        conceptosFiltrados.forEach((c, i) => {
          if (c.concepto.toLowerCase().includes('empaque')) allIndices.delete(i);
        });
      }
    }
    setSelectedIndices(allIndices);
  }, [conceptosFiltrados]);
  useEffect(() => { setUnidades(''); }, [referencia]);

  const toggleConcepto = (i: number) => setSelectedIndices(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const u = typeof unidades === 'number' ? unidades : 0;
  const totalPago = useMemo(() => conceptosFiltrados.reduce((acc, c, i) => selectedIndices.has(i) ? acc + c.total * u : acc, 0), [conceptosFiltrados, u, selectedIndices]);
  const valorOF = totalPago * (pctOF / 100);
  const valorML = totalPago * (pctML / 100);
  const rteFte = valorOF >= baseRte ? valorOF * 0.06 : 0;
  const totalOF = valorOF - rteFte;
  const precioCompra = ficha ? (ficha.precioVenta || 0) + 500 : 0;
  const cantC = typeof cantidadCompra === 'number' ? cantidadCompra : 0;
  const totalCompra = precioCompra * cantC;

  const buscarReferencia = () => setReferencia(referenciaInput.trim().toUpperCase());
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') buscarReferencia(); };

  const abrirModalTransportes = async () => {
    setModalTransportes(true);
    setTransportesLoading(true);
    const api = (await import('../services/api')).default;
    const data = await api.getTransportesPorReferencia(referencia);
    setTransportesData(data);
    setTransportesLoading(false);
  };

  const transpDescuento = typeof transpValor === 'number' && transpValor > 0 ? transpValor : 0;
  const transpCantNum = typeof transpCant === 'number' && transpCant > 0 ? transpCant : 0;

  // Calcula fecha sugerida: base + 7 días (misma semana siguiente), si cae sábado → lunes
  const calcFechaSugerida = (base: string): string => {
    if (!base) return '';
    const fechaLimpia = base.slice(0, 10);
    const [y, m, d] = fechaLimpia.split('-').map(Number);
    if (!y || !m || !d) return '';
    const fecha = new Date(y, m - 1, d);
    fecha.setDate(fecha.getDate() + 7);
    if (fecha.getDay() === 6) fecha.setDate(fecha.getDate() + 2); // sábado → lunes
    const yy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  };

  const abrirModalAsentar = () => {
    const llegada = arrivalDate
      ? arrivalDate.slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    setFechaLlegada(llegada);
    setFechaSugerida(calcFechaSugerida(llegada));
    setModalAsentar(true);
  };

  const handleAsentar = () => {
    if (!fechaSugerida) return;
    const cantC = typeof cantidadCompra === 'number' ? cantidadCompra : 0;
    const descuentosOF = rteFte > 0
      ? [{ id: Date.now(), etiqueta: 'RTE FTE', monto: Math.round(rteFte) }]
      : [];
    const descuentosML: { id: number; etiqueta: string; monto: number }[] = [];
    if (cobroSeleccionado && totalCompra > 0)
      descuentosML.push({ id: Date.now() + 1, etiqueta: `COBRO (${cantC})`, monto: Math.round(totalCompra) });
    if (transpDescuento > 0 && transpCantNum > 0)
      descuentosML.push({ id: Date.now() + 2, etiqueta: `Transp ${transpCantNum}`, monto: Math.round(transpDescuento) });

    setModalAsentar(false);
    onNavigate('programacionPagosDia', {
      fecha: fechaSugerida,
      precargar: {
        detalleInicial: `REF. ${referencia}`,
        brutOF: Math.round(valorOF),
        brutML: Math.round(valorML),
        descuentosOF,
        descuentosML,
      }
    });
  };

  const buscarPorRemision = () => {
    const remision = remisionInput.trim();
    if (!remision) return;
    const lote = (state.receptions || []).find((r: any) => r.batchCode === remision);
    if (!lote) { alert(`No se encontró ninguna recepción con remisión "${remision}"`); return; }
    const ref = lote.items?.[0]?.reference || '';
    const totalQty = (lote.items || []).reduce((a: number, b: any) => a + b.quantity, 0);
    const unidadesLote = totalQty + (lote.chargeUnits || 0) + (lote.segundasUnits || 0);
    setReferenciaInput(ref);
    setReferencia(ref);
    setUnidades(unidadesLote);
    setCantidadCompra(lote.chargeUnits || 0);
    setCobroSeleccionado((lote.chargeUnits || 0) > 0);
    if (lote.arrivalDate) setArrivalDate(lote.arrivalDate);
    if (lote.confeccionista) setConfeccionistaId(lote.confeccionista);
  };

  return (
    <div className="pb-24 space-y-6">

      {/* ── Header con gradiente ── */}
      <div className="relative bg-gradient-to-r from-pink-500 via-rose-400 to-pink-400 rounded-3xl p-6 overflow-hidden shadow-lg">
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
              <h2 className="text-2xl font-black text-white tracking-tight">Pago a Confeccionistas</h2>
              <p className="text-pink-100 text-sm">Liquidación de lote por confección</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate('reception', { directToBatch: true })} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-colors backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15m-3 0l-3-3m0 0l3-3m-3 3H15" />
              </svg>
              Recepción de lotes
            </button>
            <button onClick={() => setConfigOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-colors backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configurar bases
          </button>
          </div>
        </div>
      </div>

      {/* ── Layout principal: col izq (info+foto) | col der (inputs+conceptos) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        {/* Columna izquierda: info de referencia + foto */}
        <div className="lg:col-span-1 flex flex-col gap-3">

          {/* Info de la referencia encima de la foto */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4">
            {ficha ? (
              <>
                <p className="text-lg font-black text-slate-800 leading-tight">{ficha.referencia}</p>
                <div className="flex items-start justify-between gap-2 mt-0.5">
                  <p className="text-sm text-slate-600 font-medium">{ficha.descripcion}</p>
                  <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
                    {ficha.marca && <span className="text-xs bg-pink-50 text-pink-500 font-bold px-2 py-0.5 rounded-lg">{ficha.marca}</span>}
                    {ficha.disenadoraNombre && <span className="text-xs bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-lg">{ficha.disenadoraNombre}</span>}
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('fichas-costo-detalle', { referencia: ficha.referencia })}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 text-xs font-bold transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  Ver ficha de costo
                </button>
              </>
            ) : (
              <p className="text-sm text-slate-400 font-medium text-center py-2">Busca una referencia para ver su información</p>
            )}
          </div>

          {/* Foto */}
          <div className="w-full aspect-square rounded-3xl overflow-hidden border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm">
            {ficha?.foto1 ? (
              <img src={ficha.foto1} alt={ficha.referencia} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-200 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <p className="text-xs text-slate-400 font-semibold">{ficha ? 'Sin foto' : 'Sin referencia'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha: inputs + conceptos */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Inputs */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Banner título */}
            <div className="bg-pink-50 px-6 py-3 border-b border-pink-100">
              <p className="text-sm font-black text-slate-800 uppercase tracking-widest text-center">Datos del lote</p>
            </div>
            <div className="p-6">

            <div className="mb-4">
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">Referencia</label>
              <div className="flex gap-2">
                <input
                  type="text" value={referenciaInput}
                  onChange={e => setReferenciaInput(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown} placeholder="Ej: 13121"
                  className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none font-bold text-slate-800 text-sm transition-all"
                />
                <button onClick={buscarReferencia} className="px-5 py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm transition-colors shadow-sm">
                  Buscar
                </button>
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

            {/* Unidades + Remisión en la misma fila */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Unidades del lote</label>
                <input
                  type="number" min={0} value={unidades}
                  onChange={e => setUnidades(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0" disabled={!ficha}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none font-bold text-slate-800 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">
                  Remisión <span className="text-slate-300 font-normal">(opcional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text" value={remisionInput}
                    onChange={e => setRemisionInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') buscarPorRemision(); }}
                    placeholder="Ej: 001-2026"
                    className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none font-bold text-slate-800 text-sm transition-all"
                  />
                  <button onClick={buscarPorRemision} className="px-4 py-3 rounded-2xl bg-slate-600 hover:bg-slate-700 text-white font-bold text-sm transition-colors shadow-sm">
                    Cargar
                  </button>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Conceptos — en la columna derecha, debajo de los inputs */}
          {ficha && u > 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Banner título */}
              <div className="bg-pink-50 px-6 py-3 border-b border-pink-100">
                <p className="text-sm font-black text-slate-800 uppercase tracking-widest text-center">Conceptos de pago</p>
              </div>
              <div className="p-6">
              {conceptosFiltrados.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-4 text-center">No se encontraron conceptos de confección, placa, manualidad o empaque en la ficha de costo.</p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-4 px-4 pb-3 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider pl-8">Concepto</span>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider text-right">Vlr. Unit.</span>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider text-right">Total ({u} und)</span>
                  </div>
                  {conceptosFiltrados.map((c, i) => (
                    <div key={i} onClick={() => toggleConcepto(i)}
                      className={`grid grid-cols-3 gap-4 px-4 py-3.5 rounded-2xl transition-all cursor-pointer select-none ${selectedIndices.has(i) ? 'bg-pink-50 border border-pink-100' : 'bg-slate-50 opacity-40 hover:opacity-60'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selectedIndices.has(i) ? 'bg-pink-500 border-pink-500' : 'border-slate-300 bg-white'}`}>
                          {selectedIndices.has(i) && (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 text-white">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{c.concepto}</span>
                      </div>
                      <span className="text-[15px] font-semibold text-slate-500 text-right self-center leading-none">{fmt(c.total)}</span>
                      <span className={`text-sm font-black text-right self-center ${selectedIndices.has(i) ? 'text-pink-600' : 'text-slate-400'}`}>{fmt(c.total * u)}</span>
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Totales ── */}
      {ficha && u > 0 && conceptosFiltrados.length > 0 && (
        <>
          {/* Total grande */}
          <div className="bg-gradient-to-r from-pink-500 to-rose-400 rounded-3xl p-6 shadow-lg flex items-center justify-between gap-4">
            <div>
              <p className="text-pink-100 text-xs font-black uppercase tracking-widest mb-1">Total neto a pagar</p>
              <p className="text-5xl font-black text-white">{fmt(totalPago)}</p>
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
                  const lineas = conceptosFiltrados
                    .filter((_, i) => selectedIndices.has(i))
                    .map(c => ({
                      concepto: c.concepto,
                      referencia: referencia,
                      precio: c.total,
                      cantidadReal: u * (pctOF / 100),
                      cantidadVisual: Math.ceil(u * (pctOF / 100)),
                    }));
                  onNavigate('cuentasCobro', {
                    confeccionistaId,
                    batchCode: remisionInput.trim() || referencia,
                    fecha: arrivalDate ? arrivalDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
                    lineas,
                  });
                }}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm px-5 py-3 rounded-2xl shadow transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Generar cuenta de cobro
              </button>
            </div>
          </div>

          {/* OF, ML, Compra/Cobros y Total lote en grid 2x2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* OF */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex items-center justify-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-black text-blue-600">OF</span>
                </div>
                <span className="text-sm font-black text-slate-800">{pctOF}% del total</span>
              </div>
              <div className="p-6 flex flex-col flex-1">
              <p className="text-3xl font-black text-blue-600 mb-3">{fmt(valorOF)}</p>
              <div className="mt-auto pt-3 border-t border-slate-100 space-y-2">
                <div className="flex justify-between items-center" style={{visibility: rteFte > 0 ? 'visible' : 'hidden'}}>
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
                <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <span className="text-xs font-black text-emerald-600">ML</span>
                </div>
                <span className="text-sm font-black text-slate-800">{pctML}% del total</span>
              </div>
              <div className="p-6 flex flex-col flex-1">
              <p className="text-3xl font-black text-emerald-600 mb-3">{fmt(valorML)}</p>
              <div className="mt-auto pt-3 border-t border-slate-100 space-y-2">
                <div className="flex justify-between items-center" style={{visibility: cobroSeleccionado ? 'visible' : 'hidden'}}>
                  <span className="text-xs text-slate-400 font-semibold">Cobro ({cantC} und)</span>
                  <span className="text-sm text-red-400 font-black">− {fmt(totalCompra)}</span>
                </div>
                <div className="flex justify-between items-center" style={{visibility: transpDescuento > 0 && transpCantNum > 0 ? 'visible' : 'hidden'}}>
                  <span className="text-xs text-slate-400 font-semibold">Transp. ({transpCantNum})</span>
                  <span className="text-sm text-red-400 font-black">− {fmt(transpDescuento)}</span>
                </div>
                <div className="flex justify-between items-center bg-emerald-50 rounded-xl px-3 py-2">
                  <span className="text-xs text-emerald-600 font-black uppercase tracking-wide">Total a pagar</span>
                  <span className="text-base text-emerald-700 font-black">{fmt(valorML - (cobroSeleccionado ? totalCompra : 0) - (transpDescuento > 0 && transpCantNum > 0 ? transpDescuento : 0))}</span>
                </div>
              </div>
              </div>
            </div>

            {/* Compra / Cobros */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-pink-50 px-6 py-3 border-b border-pink-100">
                <p className="text-sm font-black text-slate-800 uppercase tracking-widest text-center">Compra / Cobros</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-2 px-2 pb-3 border-b border-slate-100 mb-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider pl-7">Cant.</span>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider text-right">Vlr. unit.</span>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider text-right">Total</span>
                </div>
                <div
                  onClick={() => setCobroSeleccionado(p => !p)}
                  className={`grid grid-cols-3 gap-2 px-2 py-3.5 rounded-2xl transition-all cursor-pointer select-none ${cobroSeleccionado ? 'bg-pink-50 border border-pink-100' : 'bg-slate-50 opacity-50 hover:opacity-70'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${cobroSeleccionado ? 'bg-pink-500 border-pink-500' : 'border-slate-300 bg-white'}`}>
                      {cobroSeleccionado && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 text-white">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="number" min={0} value={cantidadCompra}
                      onClick={e => e.stopPropagation()}
                      onChange={e => setCantidadCompra(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-14 px-2 py-1.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pink-200 outline-none font-bold text-slate-800 text-sm bg-white text-center"
                      onFocus={e => e.target.select()}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 text-right self-center">{fmt(precioCompra)}</span>
                  <span className={`text-sm font-black text-right self-center ${cobroSeleccionado ? 'text-pink-600' : 'text-slate-400'}`}>{fmt(totalCompra)}</span>
                </div>
                {ficha.precioVenta > 0 && (
                  <p className="text-xs text-slate-400 mt-2 px-1">{fmt(ficha.precioVenta)} + $500 = {fmt(precioCompra)}</p>
                )}
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
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                      <span className="text-xs font-black text-blue-600">OF</span>
                    </div>
                    <span className="text-xs font-black text-slate-500">Total pago oficial</span>
                  </div>
                  <span className="text-base font-black text-blue-700">{fmt(totalOF)}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 rounded-2xl bg-emerald-50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <span className="text-xs font-black text-emerald-600">ML</span>
                    </div>
                    <span className="text-xs font-black text-slate-500">Total pago remisión</span>
                  </div>
                  <span className="text-base font-black text-emerald-700">{fmt(valorML - (cobroSeleccionado ? totalCompra : 0) - (transpDescuento > 0 && transpCantNum > 0 ? transpDescuento : 0))}</span>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

      {/* ── Modal asentar pago ── */}
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Fecha de llegada del lote</label>
                <input
                  type="date" value={fechaLlegada}
                  onChange={e => {
                    setFechaLlegada(e.target.value);
                    setFechaSugerida(calcFechaSugerida(e.target.value));
                  }}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none font-bold text-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Fecha sugerida de pago
                  <span className="text-violet-400 font-normal ml-1">(+8 días hábiles)</span>
                </label>
                <input
                  type="date" value={fechaSugerida}
                  onChange={e => setFechaSugerida(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-violet-200 focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none font-bold text-violet-700 text-sm"
                />
              </div>

              <div className="bg-violet-50 rounded-2xl p-4 text-xs text-violet-600 space-y-2">
                <p className="text-center font-bold text-sm">{`REF. ${referencia}`}</p>
                <div className="flex gap-3">
                  <div className="flex-1 bg-white rounded-xl p-2 text-center">
                    <p className="text-violet-400 font-semibold mb-0.5">Bruto OF</p>
                    <p className="font-black text-violet-700">{fmt(Math.round(valorOF))}</p>
                    {rteFte > 0 && <p className="text-red-400 text-xs mt-0.5">RTE FTE: -{fmt(Math.round(rteFte))}</p>}
                  </div>
                  <div className="flex-1 bg-white rounded-xl p-2 text-center">
                    <p className="text-violet-400 font-semibold mb-0.5">Bruto ML</p>
                    <p className="font-black text-violet-700">{fmt(Math.round(valorML))}</p>
                    {cobroSeleccionado && totalCompra > 0 && <p className="text-red-400 text-xs mt-0.5">COBRO ({cantC}): -{fmt(Math.round(totalCompra))}</p>}
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
                className="flex-1 bg-violet-500 hover:bg-violet-600 disabled:opacity-40 text-white font-black py-3 rounded-2xl transition-colors">
                Asentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal transportes ── */}
      {modalTransportes && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 flex flex-col gap-4 max-h-[90vh]">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-800 text-xl">Transportes — REF. {referencia}</h3>
              <button onClick={() => setModalTransportes(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabla */}
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

            {/* Inputs descuento */}
            <div className="bg-emerald-50 rounded-2xl p-4 flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5">Valor a descontar</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                  <input
                    type="number" min={0} value={transpValor}
                    onChange={e => setTranspValor(e.target.value === '' ? '' : Number(e.target.value))}
                    onFocus={e => e.target.select()}
                    placeholder="0"
                    className="w-full pl-7 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none font-bold text-slate-800 text-sm"
                  />
                </div>
              </div>
              <div className="w-32">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5">Cant. transp</label>
                <input
                  type="number" min={0} value={transpCant}
                  onChange={e => setTranspCant(e.target.value === '' ? '' : Number(e.target.value))}
                  onFocus={e => e.target.select()}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none font-bold text-slate-800 text-sm text-center"
                />
              </div>
              <button
                onClick={() => setModalTransportes(false)}
                disabled={!transpValor || !transpCant}
                className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm transition-colors"
              >
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

      {/* ── Modal config ── */}
      {configOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-5">
            <h3 className="font-black text-slate-800 text-lg text-center">Configurar bases</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1 text-center">% OF</label>
                  <input type="number" value={pctOF} onChange={e => setPctOF(Number(e.target.value))} onFocus={e => e.target.select()} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-pink-200 outline-none font-bold text-slate-800 text-sm text-center" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1 text-center">% ML</label>
                  <input type="number" value={pctML} onChange={e => setPctML(Number(e.target.value))} onFocus={e => e.target.select()} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-pink-200 outline-none font-bold text-slate-800 text-sm text-center" />
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
                  <input
                    type="number" value={baseRte}
                    onChange={e => setBaseRte(Number(e.target.value))}
                    onFocus={e => e.target.select()}
                    className="w-full pl-8 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-pink-200 outline-none font-bold text-slate-800 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={saveConfig} disabled={pctOF + pctML !== 100} className="flex-1 py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-black text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Guardar</button>
              <button onClick={() => setConfigOpen(false)} className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-sm transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagoConfeccionistasView;
