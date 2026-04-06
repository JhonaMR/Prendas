import React, { useState, useMemo, useEffect } from 'react';
import { User, AppState } from '../types';
import { ConceptoFicha } from '../types/typesFichas';

const LS_PCT_OF = 'pago_lotes_pct_of';
const LS_PCT_ML = 'pago_lotes_pct_ml';
const LS_BASE_RTE = 'pago_lotes_base_rte_fte';
const getLS = (key: string, def: number) => { const v = localStorage.getItem(key); return v !== null ? Number(v) : def; };
const KEYWORDS = ['confeccion', 'pegada de placa', 'terminacion', 'manualidad', 'empaque'];
const matchesKeyword = (c: string) => KEYWORDS.some(kw => c.toLowerCase().includes(kw));
const fmt = (n: number) => '$ ' + Math.round(n).toLocaleString('es-CO');

interface Props { user: User; state: AppState; onNavigate: (tab: string, params?: any) => void; onBack: () => void; }

const PagoConfeccionistasView: React.FC<Props> = ({ state, onNavigate, onBack }) => {
  const [referencia, setReferencia] = useState('');
  const [referenciaInput, setReferenciaInput] = useState('');
  const [unidades, setUnidades] = useState<number | ''>('');
  const [cantidadCompra, setCantidadCompra] = useState<number | ''>(1);
  const [configOpen, setConfigOpen] = useState(false);
  const [cobroSeleccionado, setCobroSeleccionado] = useState(false);
  const [pctOF, setPctOF] = useState(() => getLS(LS_PCT_OF, 40));
  const [pctML, setPctML] = useState(() => getLS(LS_PCT_ML, 60));
  const [baseRte, setBaseRte] = useState(() => getLS(LS_BASE_RTE, 105000));

  const saveConfig = () => {
    if (pctOF + pctML !== 100) return;
    localStorage.setItem(LS_PCT_OF, String(pctOF));
    localStorage.setItem(LS_PCT_ML, String(pctML));
    localStorage.setItem(LS_BASE_RTE, String(baseRte));
    setConfigOpen(false);
  };

  const ficha = useMemo(() => (state.fichasCosto || []).find((f: any) => f.referencia === referencia) ?? null, [state.fichasCosto, referencia]);
  const notFound = referencia !== '' && ficha === null;

  const conceptosFiltrados: ConceptoFicha[] = useMemo(() => {
    if (!ficha) return [];
    return (ficha.manoObra || []).filter((c: ConceptoFicha) => matchesKeyword(c.concepto));
  }, [ficha]);

  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  useEffect(() => { setSelectedIndices(new Set(conceptosFiltrados.map((_, i) => i))); }, [conceptosFiltrados]);
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
          <button onClick={() => setConfigOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-colors backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configurar bases
          </button>
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

            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">Unidades del lote</label>
              <input
                type="number" min={0} value={unidades}
                onChange={e => setUnidades(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0" disabled={!ficha}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none font-bold text-slate-800 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              />
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
          <div className="bg-gradient-to-r from-pink-500 to-rose-400 rounded-3xl p-6 shadow-lg">
            <p className="text-pink-100 text-xs font-black uppercase tracking-widest mb-1">Total neto a pagar</p>
            <p className="text-5xl font-black text-white">{fmt(totalPago)}</p>
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
                <div className="flex justify-between items-center bg-emerald-50 rounded-xl px-3 py-2">
                  <span className="text-xs text-emerald-600 font-black uppercase tracking-wide">Total a pagar</span>
                  <span className="text-base text-emerald-700 font-black">{fmt(cobroSeleccionado ? valorML - totalCompra : valorML)}</span>
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
                  <span className="text-base font-black text-emerald-700">{fmt(cobroSeleccionado ? valorML - totalCompra : valorML)}</span>
                </div>
              </div>
            </div>

          </div>
        </>
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
