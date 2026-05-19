// ============================================
// VISTA: Editor de Ficha de Confeccion
// ============================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import { AppState } from '../../types';
import { FichaConfeccionData, FichaConfeccionRecord, FICHA_DEFAULT, FilaMedida } from './types';
import { cargarYParsearDxf, DxfParseado, DxfPolilinea } from '../../components/modules/VisorMolde/dxfParser';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getBaseUrl(): string {
    if ((window as any).API_CONFIG?.getApiUrl) return (window as any).API_CONFIG.getApiUrl().replace('/api', '');
    return `${window.location.protocol}//${window.location.hostname}:3000`;
}

function fmtPrecio(v: string | number): string {
    const n = typeof v === 'string' ? parseFloat(v) : v;
    if (isNaN(n)) return '';
    return `$ ${Math.floor(n).toLocaleString('es-CO')}`;
}

// ── UI helpers (module-level) ─────────────────────────────────────────────────

function mkCls(dark: boolean) {
    return `w-full px-3 py-2 border-2 rounded-xl font-bold text-sm outline-none transition-colors ${
        dark
            ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-600 focus:border-violet-400'
            : 'bg-white border-slate-200 text-slate-700 placeholder-slate-300 focus:border-pink-400'
    }`;
}

const Lbl: React.FC<{ children: React.ReactNode; dark: boolean }> = ({ children, dark }) => (
    <label className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${dark ? 'text-violet-400' : 'text-slate-400'}`}>{children}</label>
);

const Sec: React.FC<{ title: string; children: React.ReactNode; dark: boolean }> = ({ title, children, dark }) => (
    <div className={`p-4 rounded-2xl border space-y-3 ${dark ? 'bg-[#4a3a63] border-violet-700' : 'bg-slate-50 border-slate-200'}`}>
        <h4 className={`text-xs font-black uppercase tracking-widest ${dark ? 'text-violet-300' : 'text-slate-500'}`}>{title}</h4>
        {children}
    </div>
);

const TI: React.FC<{
    value: string; onChange: (v: string) => void;
    placeholder?: string; readOnly?: boolean; dark: boolean; cls?: string;
}> = ({ value, onChange, placeholder = '', readOnly = false, dark, cls = '' }) => (
    <input
        type="text" value={value} readOnly={readOnly} placeholder={placeholder}
        className={`${mkCls(dark)} ${cls}`}
        onChange={e => onChange(e.target.value)}
        onFocus={e => e.target.select()}
    />
);

// ── Canvas piezas DXF ─────────────────────────────────────────────────────────

const CanvasPiezas: React.FC<{ datos: DxfParseado; altura: number; ancho: number; onResetClick?: () => void; zoom?: number }> = ({ datos, altura, ancho, onResetClick, zoom = 1 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [offsets, setOffsets] = useState<{ dx: number; dy: number }[]>([]);
    const escRef = useRef(1);
    const boRef = useRef({ x: 0, y: 0 });
    const drag = useRef<{ idx: number; sx: number; sy: number; odx: number; ody: number } | null>(null);
    const polys = datos.entidades.filter(e => e.tipo === 'polilinea' && e.cerrada) as DxfPolilinea[];

    // Inicializar offsets cuando cambian datos, ancho o altura
    useEffect(() => {
        setOffsets(polys.map(() => ({ dx: 0, dy: 0 })));
    }, [datos, ancho, altura, polys.length]);

    // Actualizar escala cuando cambia zoom (sin resetear offsets)
    useEffect(() => {
        const pad = 16;
        const esc = Math.min((ancho - pad * 2) / datos.bounds.ancho, (altura - pad * 2) / datos.bounds.alto, 4) * zoom;
        escRef.current = esc;
        boRef.current = { x: (ancho - datos.bounds.ancho * esc) / 2, y: (altura - datos.bounds.alto * esc) / 2 };
    }, [datos, ancho, altura, zoom]);

    const tc = useCallback((x: number, y: number, dx = 0, dy = 0): [number, number] => {
        const e = escRef.current; const b = boRef.current;
        return [(x - datos.bounds.minX + dx) * e + b.x, (datos.bounds.maxY - y - dy) * e + b.y];
    }, [datos]);

    useEffect(() => {
        const cv = canvasRef.current; if (!cv) return;
        const ctx = cv.getContext('2d'); if (!ctx) return;
        ctx.clearRect(0, 0, ancho, altura);
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, ancho, altura);
        polys.forEach((p, i) => {
            const off = offsets[i] || { dx: 0, dy: 0 };
            if (p.vertices.length < 2) return;
            ctx.beginPath(); ctx.strokeStyle = '#be185d'; ctx.lineWidth = 1.5; ctx.lineJoin = 'round';
            const [x0, y0] = tc(p.vertices[0].x, p.vertices[0].y, off.dx, off.dy);
            ctx.moveTo(x0, y0);
            for (let j = 1; j < p.vertices.length; j++) {
                const [xj, yj] = tc(p.vertices[j].x, p.vertices[j].y, off.dx, off.dy);
                ctx.lineTo(xj, yj);
            }
            ctx.closePath(); ctx.stroke();
        });
    }, [datos, offsets, ancho, altura, tc, polys, zoom]);

    const hitTest = useCallback((cx: number, cy: number, offs: { dx: number; dy: number }[]) => {
        for (let i = polys.length - 1; i >= 0; i--) {
            const off = offs[i] || { dx: 0, dy: 0 };
            let inside = false;
            const v = polys[i].vertices;
            for (let a = 0, b = v.length - 1; a < v.length; b = a++) {
                const [xi, yi] = tc(v[a].x, v[a].y, off.dx, off.dy);
                const [xj, yj] = tc(v[b].x, v[b].y, off.dx, off.dy);
                if ((yi > cy) !== (yj > cy) && cx < ((xj - xi) * (cy - yi)) / (yj - yi) + xi) inside = !inside;
            }
            if (inside) return i;
        }
        return -1;
    }, [polys, tc]);

    const pos = (e: React.MouseEvent<HTMLCanvasElement>): [number, number] => {
        const r = canvasRef.current!.getBoundingClientRect();
        return [(e.clientX - r.left) * (ancho / r.width), (e.clientY - r.top) * (altura / r.height)];
    };

    const handleReset = () => {
        setOffsets(polys.map(() => ({ dx: 0, dy: 0 })));
        onResetClick?.();
    };

    return (
        <canvas ref={canvasRef} width={ancho} height={altura}
            style={{ cursor: 'grab', display: 'block', width: '100%', height: '100%' }}
            onMouseDown={e => { const [cx, cy] = pos(e); const idx = hitTest(cx, cy, offsets); if (idx >= 0) { const o = offsets[idx] || { dx: 0, dy: 0 }; drag.current = { idx, sx: cx, sy: cy, odx: o.dx, ody: o.dy }; } }}
            onMouseMove={e => { if (!drag.current) return; const [cx, cy] = pos(e); const { idx, sx, sy, odx, ody } = drag.current; setOffsets(prev => { const n = [...prev]; n[idx] = { dx: odx + (cx - sx) / escRef.current, dy: ody - (cy - sy) / escRef.current }; return n; }); }}
            onMouseUp={() => { drag.current = null; }}
            onMouseLeave={() => { drag.current = null; }}
        />
    );
};

// ── Vista previa ──────────────────────────────────────────────────────────────

interface PreviewProps {
    data: FichaConfeccionData;
    foto1: string | null; foto2: string | null; foto3: string | null;
    dxfDatos: DxfParseado | null;
    zoomMolde?: number;
}

const FichaPreview = React.forwardRef<HTMLDivElement, PreviewProps>(({ data, foto1, foto2, foto3, dxfDatos, zoomMolde = 1 }, ref) => {
    const baseUrl = getBaseUrl();
    const fotoSrc = ([foto1, foto2, foto3][data.fotoSeleccionada - 1]) ? `${baseUrl}${[foto1, foto2, foto3][data.fotoSeleccionada - 1]}` : null;
    const c = 'border border-black px-1 py-0.5';
    const l = 'font-bold text-[8px] uppercase';
    const v = 'font-black text-[10px]';
    const filasVis = data.filasMedidas.filter(f => f.label || f.S || f.M || f.L);

    return (
        <div ref={ref} id="ficha-preview" className="bg-white text-black"
            style={{ width: '216mm', minHeight: '279mm', padding: '7mm', boxSizing: 'border-box', fontFamily: 'Arial,sans-serif', fontSize: '9px' }}>
            <div className="border border-black text-center py-1 mb-px font-black text-[12px] uppercase tracking-wider">
                FICHA TECNICA DE CONFECCION
            </div>
            <div className="grid grid-cols-2 border-b border-x border-black">
                <div className="flex items-center gap-3 border-r border-black px-2 py-1">
                    <span className={l}>REFERENCIA:</span><span className="font-black text-[15px]">{data.referencia}</span>
                </div>
                <div>
                    <div className="grid grid-cols-2 border-b border-black">
                        <span className={`${c} border-r border-black ${l}`}>FECHA DE ENVIO:</span>
                        <span className={`${c} ${v}`}>{data.fechaEnvio}</span>
                    </div>
                    <div className="grid grid-cols-2">
                        <span className={`${c} border-r border-black ${l}`}>FECHA DE ENTREGA:</span>
                        <span className={`${c} ${v}`}>{data.fechaEntrega}</span>
                    </div>
                </div>
            </div>
            <div className="grid border-b border-x border-black" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="border-r border-black">
                    {[['LINEA:', data.linea], ['MARCA:', data.marca], ['N MUESTRA', data.nMuestra], ['N CORTE', data.nCorte]].map(([lb, vl]) => (
                        <div key={lb} className="grid grid-cols-2 border-b border-black last:border-b-0">
                            <span className={`${c} border-r border-black ${l}`}>{lb}</span>
                            <span className={`${c} ${v}`}>{vl}</span>
                        </div>
                    ))}
                </div>
                <div className="border-r border-black">
                    <div className={`${c} border-b border-black text-center ${l}`}>PRECIO</div>
                    {[
                        ['CONFECCION', data.precioConfeccion],
                        ...(data.empaqueActivo ? [['EMPAQUE', data.precioEmpaque]] : []),
                        ...(data.precioManualidad ? [['MANUALIDAD', data.precioManualidad]] : []),
                    ].map(([lb, vl]) => (
                        <div key={lb} className="grid grid-cols-2 border-b border-black last:border-b-0">
                            <span className={`${c} border-r border-black ${l}`}>{lb}</span>
                            <span className={`${c} ${v}`}>{vl ? fmtPrecio(vl) : ''}</span>
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-center">
                    <div className="text-center">
                        <div className={`${l} mb-1`}>CANTIDAD</div>
                        <div className="font-black text-[26px] leading-none">{data.cantidad}</div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 border-b border-x border-black">
                <span className={`${c} border-r border-black ${l}`}>FICHA REALIZADA POR :</span>
                <span className={`${c} col-span-2 font-black text-[12px] text-center uppercase`}>{data.fichaRealizadaPor}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-x border-black">
                <span className={`${c} border-r border-black ${l}`}>DESCRIPCION:</span>
                <span className={`${c} col-span-2 font-black text-[12px] text-center uppercase`}>{data.descripcion}</span>
            </div>
            <div className="grid grid-cols-2 border-b border-x border-black" style={{ height: '75mm' }}>
                <div className="border-r border-black flex items-center justify-center overflow-hidden">
                    {fotoSrc ? <img src={fotoSrc} alt="Foto" className="w-full h-full object-contain" /> : <span className="text-slate-300 text-[9px]">Sin foto</span>}
                </div>
                <div className="flex flex-col">
                    <div className="flex-1 overflow-hidden">
                        {dxfDatos ? <CanvasPiezas datos={dxfDatos} altura={220} ancho={340} zoom={zoomMolde} /> : <div className="w-full h-full flex items-center justify-center text-slate-300 text-[9px]">Sin molde</div>}
                    </div>
                    {data.textoPiezas && (
                        <div className="border-t border-black text-center font-black text-[10px] py-0.5 uppercase" style={{ color: '#be185d' }}>
                            {data.textoPiezas}
                        </div>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-2 border-b border-x border-black">
                <div className="border-r border-black">
                    <div className={`${c} border-b border-black text-center ${l}`}>TABLA DE MEDIDAS</div>
                    <div className="grid grid-cols-4 border-b border-black">
                        {['TALLA', data.talla1, data.talla2, data.talla3].map((h, i) => (
                            <span key={i} className={`${c} ${i > 0 ? 'border-l border-black' : ''} ${l} text-center`}>{h}</span>
                        ))}
                    </div>
                    {filasVis.map((fila, i) => (
                        <div key={i} className="grid grid-cols-4 border-b border-black last:border-b-0">
                            <span className={`${c} ${l}`}>{fila.label}</span>
                            <span className={`${c} border-l border-black text-center`}>{fila.xl}</span>
                            <span className={`${c} border-l border-black text-center`}>{fila.xxl}</span>
                            <span className={`${c} border-l border-black text-center`}>{fila.xxxl}</span>
                        </div>
                    ))}
                </div>
                <div>
                    <div className={`${c} border-b border-black text-center ${l}`}>COMBINACION COLORES</div>
                    <div className="p-1 text-[9px] whitespace-pre-wrap min-h-[30px]">{data.combinacionColores}</div>
                </div>
            </div>
            <div className="border-b border-x border-black">
                <div className={`${c} border-b border-black ${l}`}>CONFECCION:</div>
                <div className="px-1 py-0.5 text-[9px] whitespace-pre-wrap min-h-[20px]">{data.confeccion}</div>
            </div>
            <div className="border-b border-x border-black py-1.5 text-center font-black text-[10px] uppercase whitespace-pre-line">{data.notaVerificar}</div>
            <div className="border-b border-x border-black">
                <div className={`${c} border-b border-black text-center ${l}`}>CONSUMO DE SESGO</div>
                <div className="px-1 py-0.5 text-[9px] min-h-[14px]">{data.consumoSesgo}</div>
            </div>
            <div className="border border-black mt-0.5 py-2 text-center font-black text-[11px] uppercase whitespace-pre-line">{data.notaFinal}</div>
        </div>
    );
});
FichaPreview.displayName = 'FichaPreview';

// ── Componente principal ──────────────────────────────────────────────────────

interface Props {
    user: any; state: AppState;
    onNavigate: (tab: string, params?: any) => void;
    fichaId?: string; fichas: FichaConfeccionRecord[];
    onGuardar: (ficha: FichaConfeccionRecord) => void;
}

const FichaConfeccionEditor: React.FC<Props> = ({ user, state, onNavigate, fichaId, fichas, onGuardar }) => {
    const { isDark } = useDarkMode();
    const d = isDark;
    const fichaExistente = fichaId ? fichas.find(f => f.id === fichaId) : null;

    const [data, setData] = useState<FichaConfeccionData>(
        fichaExistente ? fichaExistente.data
            : { ...FICHA_DEFAULT, fichaRealizadaPor: user?.name || '', empaqueActivo: true, precioEmpaque: '200' }
    );

    // fichaCostoDetalle: detalle completo con muestra1 y cortes[]
    const [fichaCostoDetalle, setFichaCostoDetalle] = useState<any>(null);
    const [dxfDatos, setDxfDatos] = useState<DxfParseado | null>(null);
    // Referencia separada para el useEffect (evita problema de closure con data)
    const [referenciaActiva, setReferenciaActiva] = useState(data.referencia);
    const [refSearch, setRefSearch] = useState(data.referencia);
    const [showRefDrop, setShowRefDrop] = useState(false);
    const [showDropConf, setShowDropConf] = useState(false);
    const [showDropMan, setShowDropMan] = useState(false);
    const [showDropCorte, setShowDropCorte] = useState(false);
    const [zoomPreview, setZoomPreview] = useState(1);
    const [zoomMolde, setZoomMolde] = useState(1);

    const baseUrl = getBaseUrl();

    const refsFiltradas = refSearch.length >= 1
        ? (state.fichasCosto || []).filter((fc: any) =>
            fc.referencia.toLowerCase().includes(refSearch.toLowerCase()) ||
            (fc.descripcion || '').toLowerCase().includes(refSearch.toLowerCase())
          ).slice(0, 8)
        : [];

    // Cuando cambia la referencia, fetch del detalle completo
    useEffect(() => {
        if (!referenciaActiva) { setFichaCostoDetalle(null); return; }
        const token = localStorage.getItem('auth_token');
        fetch(`${baseUrl}/api/fichas-costo/${referenciaActiva}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(res => {
                if (res.success && res.data) {
                    const fc = res.data;
                    setFichaCostoDetalle(fc);
                    setData(prev => ({
                        ...prev,
                        referencia: referenciaActiva,
                        linea: fc.novedad ?? prev.linea,
                        marca: fc.marca ?? prev.marca,
                        nMuestra: fc.muestra1 != null ? String(fc.muestra1) : prev.nMuestra,
                        descripcion: fc.descripcion ?? prev.descripcion,
                    }));
                }
            })
            .catch(() => setFichaCostoDetalle(null));
    }, [referenciaActiva]);

    // Cargar DXF
    useEffect(() => {
        if (!fichaCostoDetalle?.archivoPsd) { setDxfDatos(null); return; }
        cargarYParsearDxf(`${baseUrl}${fichaCostoDetalle.archivoPsd}`)
            .then(d => setDxfDatos(d)).catch(() => setDxfDatos(null));
    }, [fichaCostoDetalle?.archivoPsd]);

    const set = (key: keyof FichaConfeccionData, value: any) => setData(prev => ({ ...prev, [key]: value }));
    const setFila = (i: number, campo: keyof FilaMedida, valor: string) =>
        setData(prev => { const f = [...prev.filasMedidas]; f[i] = { ...f[i], [campo]: valor }; return { ...prev, filasMedidas: f }; });

    // Opciones desde el detalle completo
    const opConf = (fichaCostoDetalle?.manoObra || []).filter((x: any) => x.concepto?.toUpperCase().includes('CONFECCION'));
    const opMan = (fichaCostoDetalle?.manoObra || []).filter((x: any) => {
        const c = x.concepto?.toUpperCase() || '';
        return c.includes('MANUALIDAD') || c.includes('PLACA') || c.includes('TERMINACION');
    });
    // Cortes del detalle completo (array con numeroCorte, cantidadCortada, fichaCorte)
    const opCorte = (fichaCostoDetalle?.cortes || []);

    const foto1 = fichaCostoDetalle?.foto1 || null;
    const foto2 = fichaCostoDetalle?.foto2 || null;
    const foto3 = fichaCostoDetalle?.foto3 || null;

    const handleImprimir = async () => {
        const el = document.getElementById('ficha-preview');
        if (!el) return;
        
        try {
            // Importar html2canvas dinámicamente
            const html2canvas = (await import('html2canvas')).default;
            
            // Convertir el elemento a imagen
            const canvas = await html2canvas(el, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                allowTaint: true,
            });
            
            const imgData = canvas.toDataURL('image/png');
            
            // Crear ventana de impresión
            const win = window.open('', '_blank', 'width=900,height=750');
            if (!win) return;
            
            win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ficha de Confeccion</title>
<style>
@page{size:letter portrait;margin:0;padding:0}
html,body{margin:0;padding:0;background:white;width:100%;height:100%}
img{width:100%;height:auto;display:block}
@media print{
  body{margin:0;padding:0}
  img{margin:0;padding:0}
}
</style>
</head><body><img src="${imgData}" style="width:100%;height:auto;display:block;margin:0;padding:0"/><script>window.onload=function(){setTimeout(function(){window.print();window.close()},500)}<\/script></body></html>`);
            win.document.close();
        } catch (error) {
            console.error('Error al imprimir:', error);
            alert('Error al generar la vista previa para imprimir');
        }
    };

    const handleGuardar = () => {
        const record: FichaConfeccionRecord = {
            id: fichaId || `fc-${Date.now()}`,
            referencia: data.referencia,
            cantidadCortada: data.cantidad,
            fechaCreacion: fichaExistente?.fechaCreacion || new Date().toLocaleDateString('es-CO'),
            realizadoPor: data.fichaRealizadaPor || user?.name || '',
            data,
        };
        onGuardar(record);
        onNavigate('fichas-confeccion');
    };

    const dropCls = `absolute z-50 w-full mt-1 rounded-xl border shadow-xl overflow-hidden ${d ? 'bg-[#3d2d52] border-violet-600' : 'bg-white border-slate-200'}`;
    const dropItemCls = `w-full text-left px-3 py-2 text-sm font-bold transition-colors ${d ? 'hover:bg-violet-700/50 text-violet-200' : 'hover:bg-slate-50 text-slate-700'}`;
    const btnDrop = `shrink-0 px-2 rounded-xl border-2 font-black text-xs transition-colors ${d ? 'border-violet-600 text-violet-300 hover:bg-violet-700/40' : 'border-slate-300 text-slate-500 hover:bg-slate-100'}`;

    return (
        <div className={`flex flex-col h-full transition-colors ${d ? 'bg-[#3d2d52]' : 'bg-white'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${d ? 'border-violet-700' : 'border-slate-200'}`}>
                <div className="flex items-center gap-4">
                    <button onClick={() => onNavigate('fichas-confeccion')}
                        className={`p-3 rounded-xl transition-colors ${d ? 'bg-violet-700/50 hover:bg-violet-700 text-violet-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                    </button>
                    <h2 className={`text-2xl font-black tracking-tighter ${d ? 'text-violet-200' : 'text-slate-800'}`}>
                        {fichaExistente ? `Editar - ${data.referencia}` : 'Nueva Ficha de Confeccion'}
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleImprimir}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-black text-xs uppercase tracking-wider transition-all ${d ? 'border-violet-600 text-violet-300 hover:bg-violet-700/40' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" /></svg>
                        Imprimir
                    </button>
                    <button onClick={handleGuardar}
                        className={`px-4 py-2 text-white font-black rounded-xl uppercase text-xs tracking-wider transition-all hover:shadow-lg ${d ? 'bg-gradient-to-r from-pink-700 to-pink-600' : 'bg-gradient-to-r from-pink-600 to-pink-500'}`}>
                        Guardar
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">
                {/* Panel izquierdo */}
                <div className={`w-[440px] shrink-0 overflow-y-auto p-4 space-y-4 border-r ${d ? 'border-violet-700' : 'border-slate-200'}`}>

                    <Sec title="Referencia" dark={d}>
                        <div className="relative">
                            <Lbl dark={d}>Referencia</Lbl>
                            <input type="text" value={refSearch} placeholder="Buscar referencia..."
                                className={mkCls(d)}
                                onChange={e => { setRefSearch(e.target.value); setShowRefDrop(true); }}
                                onFocus={e => { e.target.select(); setShowRefDrop(true); }}
                                onBlur={() => setTimeout(() => setShowRefDrop(false), 150)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        const exacta = (state.fichasCosto || []).find((fc: any) =>
                                            fc.referencia.toLowerCase() === refSearch.toLowerCase()
                                        );
                                        const primera = refsFiltradas[0];
                                        const elegida = exacta || primera;
                                        if (elegida) {
                                            setReferenciaActiva(elegida.referencia);
                                            setRefSearch(elegida.referencia);
                                            setShowRefDrop(false);
                                            (e.target as HTMLInputElement).blur();
                                        }
                                    }
                                    if (e.key === 'Escape') { setShowRefDrop(false); }
                                }}
                            />
                            {showRefDrop && refsFiltradas.length > 0 && (
                                <div className={dropCls}>
                                    {refsFiltradas.map((fc: any) => (
                                        <button key={fc.referencia} className={dropItemCls}
                                            onMouseDown={() => { setReferenciaActiva(fc.referencia); setRefSearch(fc.referencia); setShowRefDrop(false); }}>
                                            <span className="font-black">{fc.referencia}</span>
                                            <span className={`ml-2 text-xs ${d ? 'text-violet-400' : 'text-slate-400'}`}>{fc.descripcion}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Sec>

                    <Sec title="Fechas" dark={d}>
                        <div className="grid grid-cols-2 gap-3">
                            <div><Lbl dark={d}>Fecha de Envio</Lbl><TI dark={d} value={data.fechaEnvio} onChange={v => set('fechaEnvio', v)} /></div>
                            <div><Lbl dark={d}>Fecha de Entrega</Lbl><TI dark={d} value={data.fechaEntrega} onChange={v => set('fechaEntrega', v)} /></div>
                        </div>
                    </Sec>

                    <Sec title="Informacion" dark={d}>
                        <div className="grid grid-cols-2 gap-3">
                            <div><Lbl dark={d}>Linea</Lbl><TI dark={d} value={data.linea} onChange={v => set('linea', v)} /></div>
                            <div><Lbl dark={d}>Marca</Lbl><TI dark={d} value={data.marca} onChange={v => set('marca', v)} /></div>
                            <div><Lbl dark={d}>N Muestra</Lbl><TI dark={d} value={data.nMuestra} onChange={v => set('nMuestra', v)} /></div>
                        </div>
                        <div><Lbl dark={d}>Descripcion</Lbl><TI dark={d} value={data.descripcion} onChange={v => set('descripcion', v)} /></div>
                        <div><Lbl dark={d}>Ficha realizada por</Lbl><TI dark={d} value={data.fichaRealizadaPor} onChange={v => set('fichaRealizadaPor', v)} /></div>

                        {/* N Corte / Cantidad — dropdown igual que confeccion */}
                        <div>
                            <Lbl dark={d}>N Corte / Cantidad</Lbl>
                            <div className="relative flex gap-2">
                                <div className={`flex-1 px-3 py-2 border-2 rounded-xl font-bold text-sm cursor-pointer transition-colors ${
                                    d ? 'bg-[#3d2d52] border-violet-600 text-violet-100' : 'bg-white border-slate-200 text-slate-700'
                                }`}
                                    onClick={() => setShowDropCorte(v => !v)}>
                                    {data.nCorte
                                        ? `Corte #${data.nCorte} - ${data.cantidad} uds`
                                        : <span className={d ? 'text-violet-600' : 'text-slate-300'}>Seleccionar corte...</span>
                                    }
                                </div>
                                {opCorte.length > 0 && (
                                    <button onClick={() => setShowDropCorte(v => !v)} className={btnDrop}>
                                        {showDropCorte ? '▴' : '▾'}
                                    </button>
                                )}
                                {showDropCorte && opCorte.length > 0 && (
                                    <div className={`${dropCls} top-full`}>
                                        {opCorte.map((c: any) => (
                                            <button key={c.numeroCorte} className={dropItemCls}
                                                onClick={() => {
                                                    set('nCorte', String(c.fichaCorte || c.numeroCorte));
                                                    set('cantidad', String(c.cantidadCortada));
                                                    setShowDropCorte(false);
                                                }}>
                                                <span className="font-black">Corte #{c.numeroCorte}</span>
                                                <span className={`ml-2 ${d ? 'text-violet-400' : 'text-slate-500'}`}>{c.cantidadCortada} uds</span>
                                                {c.fichaCorte && <span className={`ml-2 text-xs ${d ? 'text-violet-500' : 'text-slate-400'}`}>Ficha: {c.fichaCorte}</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Edicion manual */}
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <div><Lbl dark={d}>N Corte (editar)</Lbl><TI dark={d} value={data.nCorte} onChange={v => set('nCorte', v)} placeholder="N Corte" /></div>
                                <div><Lbl dark={d}>Cantidad (editar)</Lbl><TI dark={d} value={data.cantidad} onChange={v => set('cantidad', v)} placeholder="Cantidad" /></div>
                            </div>
                        </div>
                    </Sec>

                    <Sec title="Precios" dark={d}>
                        <div>
                            <Lbl dark={d}>Confeccion</Lbl>
                            <div className="relative flex gap-2">
                                <TI dark={d} value={data.precioConfeccion} onChange={v => set('precioConfeccion', v)} placeholder="$ precio" cls="flex-1" />
                                {opConf.length > 0 && <button onClick={() => setShowDropConf(v => !v)} className={btnDrop}>{showDropConf ? '▴' : '▾'}</button>}
                                {showDropConf && (
                                    <div className={`${dropCls} top-full`}>
                                        {opConf.map((x: any) => (
                                            <button key={x.concepto} className={dropItemCls}
                                                onClick={() => { set('precioConfeccion', String(x.vlr_unit)); setShowDropConf(false); }}>
                                                {x.concepto} - {fmtPrecio(x.vlr_unit)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <Lbl dark={d}>Empaque</Lbl>
                            <div className="flex items-center gap-3">
                                <button onClick={() => set('empaqueActivo', !data.empaqueActivo)}
                                    className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider border-2 transition-colors ${
                                        data.empaqueActivo
                                            ? d ? 'bg-emerald-700/50 border-emerald-500 text-emerald-300' : 'bg-emerald-50 border-emerald-400 text-emerald-700'
                                            : d ? 'bg-slate-700/40 border-slate-600 text-slate-500' : 'bg-slate-100 border-slate-300 text-slate-400'
                                    }`}>
                                    {data.empaqueActivo ? 'Si' : 'No'}
                                </button>
                                {data.empaqueActivo && <div className="flex-1"><TI dark={d} value={data.precioEmpaque} onChange={v => set('precioEmpaque', v)} placeholder="$ precio" /></div>}
                            </div>
                        </div>
                        <div>
                            <Lbl dark={d}>Manualidad / Placa / Terminacion</Lbl>
                            <div className="relative flex gap-2">
                                <TI dark={d} value={data.precioManualidad} onChange={v => set('precioManualidad', v)} placeholder="$ precio (opcional)" cls="flex-1" />
                                {opMan.length > 0 && <button onClick={() => setShowDropMan(v => !v)} className={btnDrop}>{showDropMan ? '▴' : '▾'}</button>}
                                {showDropMan && (
                                    <div className={`${dropCls} top-full`}>
                                        {opMan.map((x: any) => (
                                            <button key={x.concepto} className={dropItemCls}
                                                onClick={() => { set('precioManualidad', String(x.vlr_unit)); setShowDropMan(false); }}>
                                                {x.concepto} - {fmtPrecio(x.vlr_unit)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Sec>

                    <Sec title="Foto de la prenda" dark={d}>
                        <div className="flex gap-2">
                            {([1, 2, 3] as const).map(n => {
                                const f = [foto1, foto2, foto3][n - 1];
                                const activa = data.fotoSeleccionada === n;
                                return (
                                    <button key={n} onClick={() => set('fotoSeleccionada', n)}
                                        className={`flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-wider border-2 transition-all ${
                                            activa ? d ? 'bg-violet-700/50 border-violet-400 text-violet-200' : 'bg-violet-50 border-violet-500 text-violet-700'
                                                : f ? d ? 'border-emerald-600 text-emerald-400' : 'border-emerald-400 text-emerald-600'
                                                : d ? 'border-slate-600 text-slate-600' : 'border-slate-300 text-slate-400'
                                        }`}>
                                        F{n} {f ? '●' : '○'}
                                    </button>
                                );
                            })}
                        </div>
                        <p className={`text-[10px] font-bold ${d ? 'text-violet-500' : 'text-slate-400'}`}>● disponible · ○ sin foto</p>
                    </Sec>

                    <Sec title="Texto de piezas" dark={d}>
                        <TI dark={d} value={data.textoPiezas} onChange={v => set('textoPiezas', v)} placeholder="Ej: 2 POSTERIORES  2 FRENTES" />
                    </Sec>

                    <Sec title="Tabla de medidas" dark={d}>
                        <div className="grid grid-cols-4 gap-1 mb-1">
                            <span className={`text-[9px] font-black uppercase px-1 ${d ? 'text-violet-500' : 'text-slate-400'}`}>TALLA</span>
                            {(['talla1', 'talla2', 'talla3'] as const).map(k => (
                                <input key={k} type="text" value={data[k]} onChange={e => set(k, e.target.value)} onFocus={e => e.target.select()}
                                    className={`px-2 py-1 border rounded-lg text-xs font-black text-center outline-none ${d ? 'bg-[#3d2d52] border-violet-600 text-violet-200' : 'bg-white border-slate-200 text-slate-700'}`} />
                            ))}
                        </div>
                        {data.filasMedidas.map((fila, i) => (
                            <div key={i} className="grid grid-cols-4 gap-1 mb-1">
                                <input type="text" value={fila.label} onChange={e => setFila(i, 'label', e.target.value)} onFocus={e => e.target.select()}
                                    className={`px-2 py-1 border rounded-lg text-xs font-bold outline-none ${d ? 'bg-[#3d2d52] border-violet-600 text-violet-200' : 'bg-white border-slate-200 text-slate-700'}`} />
                                {(['xl', 'xxl', 'xxxl'] as const).map(k => (
                                    <input key={k} type="text" value={fila[k]} onChange={e => setFila(i, k, e.target.value)} onFocus={e => e.target.select()}
                                        className={`px-2 py-1 border rounded-lg text-xs font-bold text-center outline-none ${d ? 'bg-[#3d2d52] border-violet-600 text-violet-200' : 'bg-white border-slate-200 text-slate-700'}`} />
                                ))}
                            </div>
                        ))}
                    </Sec>

                    <Sec title="Combinacion de colores" dark={d}>
                        <textarea value={data.combinacionColores} onChange={e => set('combinacionColores', e.target.value)} onFocus={e => e.target.select()}
                            rows={3} className={`${mkCls(d)} resize-none`} placeholder="Descripcion de colores..." />
                    </Sec>

                    <Sec title="Instrucciones de confeccion" dark={d}>
                        <textarea value={data.confeccion} onChange={e => set('confeccion', e.target.value)} onFocus={e => e.target.select()}
                            rows={6} className={`${mkCls(d)} resize-none`} placeholder="Instrucciones paso a paso..." />
                    </Sec>

                    <Sec title="Notas" dark={d}>
                        <div><Lbl dark={d}>Nota verificar</Lbl>
                            <textarea value={data.notaVerificar} onChange={e => set('notaVerificar', e.target.value)} onFocus={e => e.target.select()}
                                rows={2} className={`${mkCls(d)} resize-none`} />
                        </div>
                        <div><Lbl dark={d}>Consumo de sesgo</Lbl><TI dark={d} value={data.consumoSesgo} onChange={v => set('consumoSesgo', v)} /></div>
                        <div><Lbl dark={d}>Nota final</Lbl>
                            <textarea value={data.notaFinal} onChange={e => set('notaFinal', e.target.value)} onFocus={e => e.target.select()}
                                rows={2} className={`${mkCls(d)} resize-none`} />
                        </div>
                    </Sec>
                </div>

                {/* Panel derecho: vista previa */}
                <div className={`flex-1 overflow-auto p-6 ${d ? 'bg-[#2d1f42]' : 'bg-slate-100'}`}>
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2">
                            <button onClick={() => {
                                // Resetear los offsets del canvas - buscar todos los canvas y resetearlos
                                const previewEl = document.getElementById('ficha-preview');
                                if (previewEl) {
                                    const canvases = previewEl.querySelectorAll('canvas');
                                    canvases.forEach(canvas => {
                                        // Redibujar el canvas limpio
                                        const ctx = (canvas as HTMLCanvasElement).getContext('2d');
                                        if (ctx) {
                                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                                            ctx.fillStyle = '#fff';
                                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                                        }
                                    });
                                }
                            }}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border-2 transition-colors ${d ? 'border-violet-600 text-violet-300 hover:bg-violet-700/40' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}>
                                ↻ Resetear Molde
                            </button>
                            <button onClick={() => setZoomPreview(Math.max(0.5, zoomPreview - 0.1))}
                                className={`px-2.5 py-1.5 rounded-lg text-[12px] font-black border-2 transition-colors ${d ? 'border-violet-600 text-violet-300 hover:bg-violet-700/40' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}>
                                −
                            </button>
                            <span className={`text-[10px] font-black w-12 text-center ${d ? 'text-violet-300' : 'text-slate-600'}`}>
                                {Math.round(zoomPreview * 100)}%
                            </span>
                            <button onClick={() => setZoomPreview(Math.min(2, zoomPreview + 0.1))}
                                className={`px-2.5 py-1.5 rounded-lg text-[12px] font-black border-2 transition-colors ${d ? 'border-violet-600 text-violet-300 hover:bg-violet-700/40' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}>
                                +
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase tracking-wider ${d ? 'text-violet-300' : 'text-slate-600'}`}>
                                Molde:
                            </span>
                            <button onClick={() => setZoomMolde(Math.max(0.5, zoomMolde - 0.1))}
                                className={`px-2.5 py-1.5 rounded-lg text-[12px] font-black border-2 transition-colors ${d ? 'border-violet-600 text-violet-300 hover:bg-violet-700/40' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}>
                                −
                            </button>
                            <span className={`text-[10px] font-black w-12 text-center ${d ? 'text-violet-300' : 'text-slate-600'}`}>
                                {Math.round(zoomMolde * 100)}%
                            </span>
                            <button onClick={() => setZoomMolde(Math.min(2, zoomMolde + 0.1))}
                                className={`px-2.5 py-1.5 rounded-lg text-[12px] font-black border-2 transition-colors ${d ? 'border-violet-600 text-violet-300 hover:bg-violet-700/40' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}>
                                +
                            </button>
                        </div>
                        <div className="shadow-2xl" style={{ transform: `scale(${zoomPreview})`, transformOrigin: 'top center', transition: 'transform 0.2s ease-out' }}>
                            <FichaPreview data={data} foto1={foto1} foto2={foto2} foto3={foto3} dxfDatos={dxfDatos} zoomMolde={zoomMolde} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FichaConfeccionEditor;
