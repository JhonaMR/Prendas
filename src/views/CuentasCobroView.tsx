import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { User, AppState, Confeccionista } from '../types';
import { useBrand } from '../hooks/useBrand';

const BRAND_INFO = {
  plow: {
    nombre: 'ARARE S.A.S.',
    nit: '901453438',
    direccion: 'CLL 77 a # 45 a 30 - 301',
    ciudad: 'Itagüí, Antioquia',
    celular: '3146320002',
    bgColor: '#f2bfbe',
    textColor: '#6b2a35',
    headerBg: '#f9d8d8',
  },
  melas: {
    nombre: 'CLAMELAS S.A.S.',
    nit: '901980480',
    direccion: 'CR 52 d # 76 67',
    ciudad: 'Itagüí, Antioquia',
    celular: '3146317522',
    bgColor: '#fce7f3',
    textColor: '#9d174d',
    headerBg: '#fce7f3',
  },
};

interface CuentasCobroViewProps {
  user: User;
  state: AppState;
  onNavigate?: (tab: string, params?: any) => void;
  params?: {
    confeccionistaId?: string;
    batchCode?: string;
    fecha?: string;
    lineas?: Array<{
      concepto: string;
      referencia: string;
      precio: number;
      cantidadReal: number;
      cantidadVisual: number;
    }>;
  };
}

interface LineItem {
  id: string;
  concepto: string;
  referencia: string;
  precio: number | '';
  cantidad: number | '';
  cantidadVisual?: number; // redondeado hacia arriba para mostrar, solo cuando viene de liquidación
}

const emptyLine = (): LineItem => ({
  id: Math.random().toString(36).slice(2),
  concepto: '',
  referencia: '',
  precio: '',
  cantidad: '',
});

const CuentasCobroView: React.FC<CuentasCobroViewProps> = ({ state, params, onNavigate }) => {
  const brand = useBrand();
  const empresa = brand.isMelas ? BRAND_INFO.melas : BRAND_INFO.plow;
  const printRef = useRef<HTMLDivElement>(null);

  // Resolver confeccionista desde params si viene pre-cargado
  const confFromParams = params?.confeccionistaId
    ? (state.confeccionistas || []).find(c => c.id === params.confeccionistaId)
    : undefined;

  // Beneficiario
  const [confSearch, setConfSearch] = useState(confFromParams?.name || '');
  const [showConfDropdown, setShowConfDropdown] = useState(false);
  const [nombre, setNombre] = useState(confFromParams?.name || '');
  const [cedula, setCedula] = useState(confFromParams?.id || '');
  const [direccion, setDireccion] = useState(confFromParams?.address || '');
  const [ciudad, setCiudad] = useState(confFromParams?.city || '');
  const [telefono, setTelefono] = useState(confFromParams?.phone || '');

  // Documento
  const [fecha, setFecha] = useState(() => params?.fecha || new Date().toISOString().split('T')[0]);
  const [numeroCuenta, setNumeroCuenta] = useState('');
  const [concepto, setConcepto] = useState('');

  // Líneas de detalle — pre-rellenar desde params si vienen
  const [lines, setLines] = useState<LineItem[]>(() => {
    if (params?.lineas && params.lineas.length > 0) {
      return params.lineas.map(l => ({
        id: Math.random().toString(36).slice(2),
        concepto: l.concepto,
        referencia: l.referencia,
        precio: l.precio,
        cantidad: l.cantidadReal,       // valor real para el cálculo
        cantidadVisual: l.cantidadVisual, // valor redondeado para mostrar
      }));
    }
    return [emptyLine()];
  });

  const confeccionistas = (state.confeccionistas || [])
    .filter(c => c.active)
    .filter(c =>
      !confSearch ||
      c.name.toUpperCase().includes(confSearch.toUpperCase()) ||
      c.id.includes(confSearch)
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const selectConf = (c: Confeccionista) => {
    setNombre(c.name);
    setCedula(c.id);
    setDireccion(c.address || '');
    setCiudad(c.city || '');
    setTelefono(c.phone || '');
    setConfSearch(c.name);
    setShowConfDropdown(false);
  };

  const updateLine = (id: string, field: keyof LineItem, value: string) => {
    setLines(prev => prev.map(l => {
      if (l.id !== id) return l;
      if (field === 'precio' || field === 'cantidad') {
        const num = value === '' ? '' : Number(value);
        // Si el usuario edita la cantidad manualmente, limpiar cantidadVisual
        if (field === 'cantidad') return { ...l, cantidad: num, cantidadVisual: undefined };
        return { ...l, [field]: num };
      }
      return { ...l, [field]: value };
    }));
  };

  const addLine = () => setLines(prev => [...prev, emptyLine()]);
  const removeLine = (id: string) => setLines(prev => prev.filter(l => l.id !== id));

  const total = lines.reduce((acc, l) => {
    const p = typeof l.precio === 'number' ? l.precio : 0;
    const q = typeof l.cantidad === 'number' ? l.cantidad : 0;
    return acc + p * q;
  }, 0);

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

  const [printing, setPrinting] = useState(false);

  const handlePrint = async () => {
    const content = printRef.current;
    if (!content) return;
    setPrinting(true);
    try {
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = 210;
      const pageH = 297;
      const margin = 10;
      const usableW = pageW - margin * 2;
      const imgH = (canvas.height * usableW) / canvas.width;

      if (imgH <= pageH - margin * 2) {
        pdf.addImage(imgData, 'PNG', margin, margin, usableW, imgH);
      } else {
        let yOffset = 0;
        const sliceH = pageH - margin * 2;
        while (yOffset < imgH) {
          if (yOffset > 0) pdf.addPage();
          pdf.addImage(imgData, 'PNG', margin, margin - yOffset, usableW, imgH);
          yOffset += sliceH;
        }
      }

      const safeName = nombre ? nombre.replace(/\s+/g, '_') : 'cuenta_cobro';
      pdf.save(`${safeName}_${fecha || 'sin_fecha'}.pdf`);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-50 p-6">
      <div className="w-full space-y-6">

        {/* Título */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter">Cuentas de Cobro</h1>
            <p className="text-xs font-bold text-slate-400 uppercase mt-0.5">Plow — Formato oficial</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate?.('reception', { directToBatch: true })}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Recepción de lotes
            </button>
            <button
              onClick={handlePrint}
              disabled={printing}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {printing ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Generando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Exportar PDF
                </>
              )}
            </button>
            <button
              onClick={async () => {
                const content = printRef.current;
                if (!content) return;
                const canvas = await html2canvas(content, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
                const imgData = canvas.toDataURL('image/png');
                const win = window.open('', '_blank', 'width=800,height=900');
                if (!win) return;
                win.document.write(`<!DOCTYPE html><html><head><title>Cuenta de Cobro</title>
                  <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { background: #fff; }
                    img { width: 100%; display: block; }
                    @media print { @page { margin: 10mm; } }
                  </style>
                </head><body><img src="${imgData}" /></body></html>`);
                win.document.close();
                win.focus();
                setTimeout(() => { win.print(); }, 600);
              }}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
              </svg>
              Imprimir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Columna 1: Datos del documento + Beneficiario */}
          <div className="space-y-4">

            {/* Datos del documento */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <h2 className="text-xs font-black text-center text-slate-500 uppercase tracking-widest">Datos del documento</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">N° Cuenta</label>
                  <input
                    value={numeroCuenta}
                    onChange={e => setNumeroCuenta(e.target.value)}
                    placeholder="001"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Fecha</label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={e => setFecha(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Beneficiario */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <h2 className="text-xs font-black text-center text-slate-500 uppercase tracking-widest">Beneficiario (Debe a)</h2>

              {/* Buscar confeccionista */}
              <div className="relative">
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Buscar confeccionista</label>
                <input
                  value={confSearch}
                  onChange={e => { setConfSearch(e.target.value); setShowConfDropdown(true); }}
                  onFocus={() => setShowConfDropdown(true)}
                  onBlur={() => setTimeout(() => setShowConfDropdown(false), 150)}
                  placeholder="Nombre o cédula..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
                {showConfDropdown && confeccionistas.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {confeccionistas.slice(0, 10).map(c => (
                      <button
                        key={c.id}
                        onMouseDown={() => selectConf(c)}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0"
                      >
                        <p className="font-black text-slate-800 text-sm">{c.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{c.id}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: 'Nombre', value: nombre, set: setNombre },
                  { label: 'Cédula', value: cedula, set: setCedula },
                  { label: 'Dirección', value: direccion, set: setDireccion },
                  { label: 'Ciudad', value: ciudad, set: setCiudad },
                  { label: 'Teléfono', value: telefono, set: setTelefono },
                ].map(({ label, value, set }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase w-20 shrink-0">{label}</span>
                    <input
                      value={value}
                      onChange={e => set(e.target.value)}
                      className="flex-1 border-b border-slate-200 px-1 py-1 text-sm font-bold focus:outline-none focus:border-slate-500 bg-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna 2: Concepto general + Líneas de detalle */}
          <div className="space-y-4">

            {/* Concepto general */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-2">
              <h2 className="text-xs font-black text-center text-slate-500 uppercase tracking-widest">Concepto general</h2>
              <textarea
                value={concepto}
                onChange={e => setConcepto(e.target.value)}
                rows={2}
                placeholder="Descripción del servicio o trabajo..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
              />
            </div>

            {/* Líneas de detalle */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Detalle</h2>
                <button
                  onClick={addLine}
                  className="text-xs font-black text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Agregar línea
                </button>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-1 text-[9px] font-black text-slate-400 uppercase px-1">
                  <span className="col-span-4">Concepto</span>
                  <span className="col-span-3">Referencia</span>
                  <span className="col-span-2 text-right">Precio</span>
                  <span className="col-span-2 text-right">Cant.</span>
                  <span className="col-span-1"></span>
                </div>
                {lines.map(line => (
                  <div key={line.id} className="grid grid-cols-12 gap-1 items-center">
                    <input
                      value={line.concepto}
                      onChange={e => updateLine(line.id, 'concepto', e.target.value)}
                      placeholder="Concepto"
                      className="col-span-4 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-slate-300"
                    />
                    <input
                      value={line.referencia}
                      onChange={e => updateLine(line.id, 'referencia', e.target.value)}
                      placeholder="Ref."
                      className="col-span-3 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-slate-300"
                    />
                    <input
                      type="number"
                      value={line.precio}
                      onChange={e => updateLine(line.id, 'precio', e.target.value)}
                      placeholder="0"
                      className="col-span-2 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-right focus:outline-none focus:ring-1 focus:ring-slate-300"
                    />
                    <input
                      type="number"
                      value={line.cantidadVisual !== undefined ? line.cantidadVisual : line.cantidad}
                      onChange={e => updateLine(line.id, 'cantidad', e.target.value)}
                      placeholder="0"
                      className="col-span-2 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-right focus:outline-none focus:ring-1 focus:ring-slate-300"
                    />
                    <button
                      onClick={() => removeLine(line.id)}
                      className="col-span-1 flex justify-center text-slate-300 hover:text-red-400 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Total</p>
                  <p className="text-xl font-black text-slate-900">{fmt(total)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel derecho: vista previa */}
          <div className="lg:sticky lg:top-6 self-start">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-[10px] font-black text-center text-slate-400 uppercase tracking-widest mb-4">Vista previa</p>

              {/* Documento imprimible */}
              <div ref={printRef} className="border-2 p-6 font-mono text-xs text-slate-900 space-y-3" style={{ fontFamily: 'Arial, sans-serif', borderColor: empresa.textColor }}>

                {/* Header */}
                <div className="text-center pb-3 mb-3" style={{ borderBottom: `2px solid ${empresa.textColor}`, background: empresa.bgColor, margin: '-24px -24px 0', padding: '16px 24px' }}>
                  <p className="text-lg font-black tracking-widest uppercase" style={{ color: empresa.textColor }}>Cuenta de Cobro</p>
                  <p className="text-[10px] font-bold mt-1" style={{ color: empresa.textColor, opacity: 0.8 }}>{empresa.nombre}</p>
                </div>

                {/* Número y fecha */}
                <div className="flex justify-between text-[11px] pt-2">
                  <span><strong>N°:</strong> {numeroCuenta || '___'}</span>
                  <span><strong>Fecha:</strong> {fecha ? new Date(fecha + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }) : '___'}</span>
                </div>

                {/* Empresa */}
                <div className="rounded px-3 py-1.5 text-[10px]" style={{ background: empresa.bgColor, border: `1px solid ${empresa.textColor}44` }}>
                  <p className="font-black mb-0.5" style={{ color: empresa.textColor }}>{empresa.nombre}</p>
                  <div className="grid grid-cols-2 gap-x-4" style={{ color: empresa.textColor, opacity: 0.85 }}>
                    <div className="flex flex-col gap-0.5">
                      <p><span className="font-black">NIT:</span> {empresa.nit}</p>
                      <p><span className="font-black">Dir:</span> {empresa.direccion}</p>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p><span className="font-black">Ciudad:</span> {empresa.ciudad}</p>
                      <p><span className="font-black">Cel:</span> {empresa.celular}</p>
                    </div>
                  </div>
                </div>

                {/* Debe a */}
                <div>
                  <p className="font-black text-[11px] text-center uppercase pb-0.5 mb-1" style={{ borderBottom: `1px solid ${empresa.textColor}`, color: empresa.textColor }}>Debe a</p>
                  <div className="text-[10px]">
                    {/* Nombre — fila completa */}
                    <div className="flex gap-1 mb-0.5">
                      <span className="font-black shrink-0">Nombre:</span>
                      <span className="border-b border-slate-300 flex-1">{nombre || ' '}</span>
                    </div>
                    {/* Dos columnas */}
                    <div className="grid grid-cols-2 gap-x-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex gap-1">
                          <span className="font-black shrink-0">Cédula:</span>
                          <span className="border-b border-slate-300 flex-1">{cedula || ' '}</span>
                        </div>
                        <div className="flex gap-1">
                          <span className="font-black shrink-0">Teléfono:</span>
                          <span className="border-b border-slate-300 flex-1">{telefono || ' '}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex gap-1">
                          <span className="font-black shrink-0">Dirección:</span>
                          <span className="border-b border-slate-300 flex-1">{direccion || ' '}</span>
                        </div>
                        <div className="flex gap-1">
                          <span className="font-black shrink-0">Ciudad:</span>
                          <span className="border-b border-slate-300 flex-1">{ciudad || ' '}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Concepto general */}
                {concepto && (
                  <div>
                    <p className="font-black text-[11px] uppercase border-b border-slate-300 pb-1 mb-1">La suma de:</p>
                    <p className="text-[11px] border border-slate-200 p-2 rounded">{concepto}</p>
                  </div>
                )}

                {/* Tabla */}
                <table className="w-full border-collapse text-[10px]">
                  <thead>
                    <tr style={{ background: empresa.textColor, color: '#fff' }}>
                      <th className="px-2 py-1.5 text-left font-black">Concepto</th>
                      <th className="px-2 py-1.5 text-left font-black">Referencia</th>
                      <th className="px-2 py-1.5 text-right font-black">Precio</th>
                      <th className="px-2 py-1.5 text-right font-black">Cant.</th>
                      <th className="px-2 py-1.5 text-right font-black">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l, i) => {
                      const p = typeof l.precio === 'number' ? l.precio : 0;
                      const q = typeof l.cantidad === 'number' ? l.cantidad : 0;
                      // Mostrar cantidadVisual (redondeado ↑) si existe, sino la cantidad real
                      const qDisplay = l.cantidadVisual !== undefined ? l.cantidadVisual : q;
                      return (
                        <tr key={l.id} style={{ background: i % 2 === 0 ? '#fff' : empresa.bgColor + '66' }}>
                          <td className="px-2 py-1 border-b border-slate-100">{l.concepto || '-'}</td>
                          <td className="px-2 py-1 border-b border-slate-100">{l.referencia || '-'}</td>
                          <td className="px-2 py-1 border-b border-slate-100 text-right">{p ? fmt(p) : '-'}</td>
                          <td className="px-2 py-1 border-b border-slate-100 text-right">{qDisplay || '-'}</td>
                          <td className="px-2 py-1 border-b border-slate-100 text-right font-bold">{p && q ? fmt(p * q) : '-'}</td>
                        </tr>
                      );
                    })}
                    <tr style={{ background: empresa.textColor, color: '#fff' }}>
                      <td colSpan={4} className="px-2 py-2 font-black text-right uppercase text-[11px]">Total</td>
                      <td className="px-2 py-2 font-black text-right text-[12px]">{fmt(total)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Firma */}
                <div className="flex justify-around pt-6 mt-4">
                  <div className="text-center">
                    <div className="w-36 mb-1" style={{ borderTop: `1px solid ${empresa.textColor}` }}></div>
                    <p className="text-[10px] font-black uppercase" style={{ color: empresa.textColor }}>Firma Beneficiario</p>
                    <p className="text-[9px] text-slate-500">{nombre || 'Nombre'}</p>
                    <p className="text-[9px] text-slate-500">C.C. {cedula || '___'}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-36 mb-1" style={{ borderTop: `1px solid ${empresa.textColor}` }}></div>
                    <p className="text-[10px] font-black uppercase" style={{ color: empresa.textColor }}>Firma Empresa</p>
                    <p className="text-[9px] text-slate-500">{empresa.nombre}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CuentasCobroView;
