// ============================================
// COMPONENTE: Visor de Moldes DXF/SVG
// Reutilizable — FichasDiseño, FichasCosto, etc.
//
// Funcionalidades:
//   • Pan con drag, zoom con rueda
//   • Botones zoom +/-/reset
//   • Regla dinámica (superior e izquierda) en cm
//   • Hover sobre pieza → tooltip con ancho×alto y perímetro
//   • Dimensiones bbox sobre cada pieza (ancho×alto)
//   • Herramienta de medición manual (2 clicks = distancia)
//   • Unidades: 1 unidad DXF = 1 pulgada = 2.54 cm
// ============================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cargarYParsearDxf, DxfParseado, DxfPolilinea } from './dxfParser';

// ── Constantes de escala ────────────────────────────────────────────────────
const PULGADAS_A_CM = 2.54;
const GROSOR_REGLA = 28; // px reservados para la regla en cada borde

// ── Tipos ───────────────────────────────────────────────────────────────────

interface VisorMoldeProps {
    archivoUrl: string;
    nombreArchivo?: string;
    referencia?: string;
    isDark?: boolean;
    altura?: number;
}

interface Transform {
    offsetX: number;
    offsetY: number;
    escala: number;
}

interface TooltipPieza {
    x: number; // px en pantalla
    y: number;
    anchoIn: number;
    altoIn: number;
    perimetroIn: number;
}

interface PuntoMedicion {
    cx: number; // canvas px
    cy: number;
    dxfX: number; // unidades DXF
    dxfY: number;
}

// ── Helpers de transformación ───────────────────────────────────────────────

function dxfACanvas(
    x: number, y: number,
    bounds: DxfParseado['bounds'],
    t: Transform
): [number, number] {
    const nx = x - bounds.minX;
    const ny = bounds.maxY - y;
    return [nx * t.escala + t.offsetX + GROSOR_REGLA, ny * t.escala + t.offsetY + GROSOR_REGLA];
}

function canvasADxf(
    cx: number, cy: number,
    bounds: DxfParseado['bounds'],
    t: Transform
): [number, number] {
    const nx = (cx - GROSOR_REGLA - t.offsetX) / t.escala;
    const ny = (cy - GROSOR_REGLA - t.offsetY) / t.escala;
    return [nx + bounds.minX, bounds.maxY - ny];
}

function calcularTransformInicial(
    bounds: DxfParseado['bounds'],
    canvasW: number, canvasH: number,
    padding = 40
): Transform {
    const areaW = canvasW - GROSOR_REGLA - padding * 2;
    const areaH = canvasH - GROSOR_REGLA - padding * 2;
    const escala = Math.min(areaW / bounds.ancho, areaH / bounds.alto);
    const anchoRender = bounds.ancho * escala;
    const altoRender = bounds.alto * escala;
    return {
        escala,
        offsetX: (areaW - anchoRender) / 2 + padding,
        offsetY: (areaH - altoRender) / 2 + padding,
    };
}

// ── Geometría de piezas ─────────────────────────────────────────────────────

function bboxPolilinea(p: DxfPolilinea) {
    const xs = p.vertices.map(v => v.x);
    const ys = p.vertices.map(v => v.y);
    return {
        minX: Math.min(...xs), maxX: Math.max(...xs),
        minY: Math.min(...ys), maxY: Math.max(...ys),
    };
}

function perimetroPolilinea(p: DxfPolilinea): number {
    let total = 0;
    const v = p.vertices;
    for (let i = 0; i < v.length - 1; i++) {
        const dx = v[i + 1].x - v[i].x;
        const dy = v[i + 1].y - v[i].y;
        total += Math.sqrt(dx * dx + dy * dy);
    }
    if (p.cerrada && v.length > 1) {
        const dx = v[0].x - v[v.length - 1].x;
        const dy = v[0].y - v[v.length - 1].y;
        total += Math.sqrt(dx * dx + dy * dy);
    }
    return total;
}

function puntoDentroPolilinea(px: number, py: number, p: DxfPolilinea): boolean {
    // Ray casting
    const v = p.vertices;
    let dentro = false;
    for (let i = 0, j = v.length - 1; i < v.length; j = i++) {
        const xi = v[i].x, yi = v[i].y;
        const xj = v[j].x, yj = v[j].y;
        if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
            dentro = !dentro;
        }
    }
    return dentro;
}

function formatCm(pulgadas: number): string {
    return (pulgadas * PULGADAS_A_CM).toFixed(1) + ' cm';
}

// ── Renderizado principal ───────────────────────────────────────────────────

function renderizarDxf(
    ctx: CanvasRenderingContext2D,
    datos: DxfParseado,
    t: Transform,
    canvasW: number,
    canvasH: number,
    isDark: boolean,
    piezaHover: number | null,
    puntosMedicion: PuntoMedicion[],
    lineaMedicion: { p1: PuntoMedicion; p2: PuntoMedicion } | null
) {
    ctx.clearRect(0, 0, canvasW, canvasH);

    const colorFondo = isDark ? '#2d1f42' : '#f8fafc';
    const colorLinea = isDark ? '#a78bfa' : '#4f46e5';
    const colorHover = isDark ? '#f0abfc' : '#a21caf';
    const colorTexto = isDark ? '#e2e8f0' : '#1e293b';
    const colorRef = isDark ? '#4a4a6a' : '#cbd5e1';
    const colorDim = isDark ? '#7c6fa0' : '#94a3b8';
    const colorRegla = isDark ? '#3d2d52' : '#f1f5f9';
    const colorReglaTexto = isDark ? '#7c6fa0' : '#94a3b8';
    const colorReglaLinea = isDark ? '#4a3a63' : '#e2e8f0';

    // Fondo del área de dibujo
    ctx.fillStyle = colorFondo;
    ctx.fillRect(GROSOR_REGLA, GROSOR_REGLA, canvasW - GROSOR_REGLA, canvasH - GROSOR_REGLA);

    // ── Entidades ──────────────────────────────────────────────────────────
    datos.entidades.forEach((ent, idx) => {
        if (ent.tipo === 'polilinea') {
            if (ent.vertices.length < 2) return;
            const esHover = idx === piezaHover;
            ctx.beginPath();
            ctx.strokeStyle = esHover ? colorHover : colorLinea;
            ctx.lineWidth = esHover ? 2.5 : 1.5;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            if (esHover) {
                ctx.shadowColor = colorHover;
                ctx.shadowBlur = 6;
            }

            const [x0, y0] = dxfACanvas(ent.vertices[0].x, ent.vertices[0].y, datos.bounds, t);
            ctx.moveTo(x0, y0);
            for (let i = 1; i < ent.vertices.length; i++) {
                const [xi, yi] = dxfACanvas(ent.vertices[i].x, ent.vertices[i].y, datos.bounds, t);
                ctx.lineTo(xi, yi);
            }
            if (ent.cerrada) ctx.closePath();
            ctx.stroke();
            ctx.shadowBlur = 0;

            // ── Dimensiones bbox sobre la pieza ────────────────────────────
            if (ent.cerrada && t.escala > 0.8) {
                const bb = bboxPolilinea(ent);
                const anchoIn = bb.maxX - bb.minX;
                const altoIn = bb.maxY - bb.minY;
                const [cx1] = dxfACanvas(bb.minX, bb.maxY, datos.bounds, t);
                const [cx2] = dxfACanvas(bb.maxX, bb.maxY, datos.bounds, t);
                const [, cy1] = dxfACanvas(bb.minX, bb.maxY, datos.bounds, t);
                const [, cy2] = dxfACanvas(bb.minX, bb.minY, datos.bounds, t);
                const cxMid = (cx1 + cx2) / 2;
                const cyMid = (cy1 + cy2) / 2;

                ctx.font = `bold 10px system-ui, sans-serif`;
                ctx.fillStyle = esHover ? colorHover : colorDim;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Ancho (horizontal, arriba de la pieza)
                ctx.fillText(`↔ ${formatCm(anchoIn)}`, cxMid, cy1 - 10);
                // Alto (vertical, a la derecha)
                ctx.save();
                ctx.translate(cx2 + 12, cyMid);
                ctx.rotate(-Math.PI / 2);
                ctx.fillText(`↕ ${formatCm(altoIn)}`, 0, 0);
                ctx.restore();
                ctx.textAlign = 'left';
            }

        } else if (ent.tipo === 'linea') {
            const [x1, y1] = dxfACanvas(ent.desde.x, ent.desde.y, datos.bounds, t);
            const [x2, y2] = dxfACanvas(ent.hasta.x, ent.hasta.y, datos.bounds, t);
            ctx.beginPath();
            ctx.strokeStyle = colorRef;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 3]);
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.setLineDash([]);

        } else if (ent.tipo === 'texto') {
            const [tx, ty] = dxfACanvas(ent.posicion.x, ent.posicion.y, datos.bounds, t);
            const tamFuente = Math.max(9, Math.min(ent.altura * t.escala, 14));
            ctx.save();
            ctx.translate(tx, ty);
            ctx.rotate((-ent.rotacion * Math.PI) / 180);
            ctx.font = `bold ${tamFuente}px system-ui, sans-serif`;
            ctx.fillStyle = colorTexto;
            ctx.textBaseline = 'bottom';
            ctx.fillText(ent.texto, 0, 0);
            ctx.restore();
        }
    });

    // ── Herramienta de medición ────────────────────────────────────────────
    const colorMed = '#f59e0b';
    puntosMedicion.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.cx, p.cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = colorMed;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    });

    if (lineaMedicion) {
        const { p1, p2 } = lineaMedicion;
        ctx.beginPath();
        ctx.strokeStyle = colorMed;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 3]);
        ctx.moveTo(p1.cx, p1.cy);
        ctx.lineTo(p2.cx, p2.cy);
        ctx.stroke();
        ctx.setLineDash([]);

        const dx = p2.dxfX - p1.dxfX;
        const dy = p2.dxfY - p1.dxfY;
        const distIn = Math.sqrt(dx * dx + dy * dy);
        const midX = (p1.cx + p2.cx) / 2;
        const midY = (p1.cy + p2.cy) / 2;

        const label = formatCm(distIn);
        ctx.font = 'bold 11px system-ui, sans-serif';
        const tw = ctx.measureText(label).width;
        ctx.fillStyle = colorMed;
        ctx.fillRect(midX - tw / 2 - 4, midY - 10, tw + 8, 18);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, midX, midY);
        ctx.textAlign = 'left';
    }

    // ── Regla superior ─────────────────────────────────────────────────────
    ctx.fillStyle = colorRegla;
    ctx.fillRect(0, 0, canvasW, GROSOR_REGLA);
    ctx.fillRect(0, 0, GROSOR_REGLA, canvasH);

    // Línea de borde de la regla
    ctx.strokeStyle = colorReglaLinea;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(GROSOR_REGLA, GROSOR_REGLA);
    ctx.lineTo(canvasW, GROSOR_REGLA);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(GROSOR_REGLA, GROSOR_REGLA);
    ctx.lineTo(GROSOR_REGLA, canvasH);
    ctx.stroke();

    // Marcas de la regla — calcular intervalo dinámico en cm
    const cmPorPx = 1 / (t.escala * PULGADAS_A_CM);
    const cmVisiblesH = (canvasW - GROSOR_REGLA) * cmPorPx;
    const cmVisiblesV = (canvasH - GROSOR_REGLA) * cmPorPx;

    // Elegir intervalo de marca: 0.5, 1, 2, 5, 10, 20, 50 cm
    const intervalos = [0.5, 1, 2, 5, 10, 20, 50, 100];
    const marcasDeseadas = 10;
    const intervaloH = intervalos.find(i => cmVisiblesH / i <= marcasDeseadas * 2) ?? 100;
    const intervaloV = intervalos.find(i => cmVisiblesV / i <= marcasDeseadas * 2) ?? 100;

    ctx.font = '9px system-ui, sans-serif';
    ctx.fillStyle = colorReglaTexto;
    ctx.textBaseline = 'top';

    // Regla horizontal (superior)
    const [dxfX0] = canvasADxf(GROSOR_REGLA, GROSOR_REGLA, datos.bounds, t);
    const [dxfX1] = canvasADxf(canvasW, GROSOR_REGLA, datos.bounds, t);
    const cmX0 = dxfX0 * PULGADAS_A_CM;
    const cmX1 = dxfX1 * PULGADAS_A_CM;
    const primeraMarcaH = Math.ceil(cmX0 / intervaloH) * intervaloH;

    for (let cm = primeraMarcaH; cm <= cmX1; cm += intervaloH) {
        const dxfX = cm / PULGADAS_A_CM;
        const [cx] = dxfACanvas(dxfX + datos.bounds.minX, datos.bounds.maxY, datos.bounds, t);
        if (cx < GROSOR_REGLA || cx > canvasW) continue;
        const esMayor = Math.round(cm) % (intervaloH * 2) === 0 || intervaloH >= 5;
        const altMarca = esMayor ? 10 : 5;
        ctx.strokeStyle = colorReglaTexto;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(cx, GROSOR_REGLA - altMarca);
        ctx.lineTo(cx, GROSOR_REGLA);
        ctx.stroke();
        if (esMayor) {
            ctx.fillText(`${cm}`, cx + 2, 2);
        }
    }

    // Regla vertical (izquierda)
    const [, dxfY0] = canvasADxf(GROSOR_REGLA, GROSOR_REGLA, datos.bounds, t);
    const [, dxfY1] = canvasADxf(GROSOR_REGLA, canvasH, datos.bounds, t);
    const cmY0 = dxfY1 * PULGADAS_A_CM; // Y invertida
    const cmY1 = dxfY0 * PULGADAS_A_CM;
    const primeraMarcaV = Math.ceil(cmY0 / intervaloV) * intervaloV;

    for (let cm = primeraMarcaV; cm <= cmY1; cm += intervaloV) {
        const dxfY = cm / PULGADAS_A_CM;
        const [, cy] = dxfACanvas(datos.bounds.minX, dxfY + datos.bounds.minY, datos.bounds, t);
        if (cy < GROSOR_REGLA || cy > canvasH) continue;
        const esMayor = Math.round(cm) % (intervaloV * 2) === 0 || intervaloV >= 5;
        const altMarca = esMayor ? 10 : 5;
        ctx.strokeStyle = colorReglaTexto;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(GROSOR_REGLA - altMarca, cy);
        ctx.lineTo(GROSOR_REGLA, cy);
        ctx.stroke();
        if (esMayor) {
            ctx.save();
            ctx.translate(2, cy - 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(`${cm}`, 0, 0);
            ctx.restore();
        }
    }

    // Esquina de la regla (cm label)
    ctx.fillStyle = colorReglaTexto;
    ctx.font = 'bold 8px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('cm', GROSOR_REGLA / 2, GROSOR_REGLA / 2);
    ctx.textAlign = 'left';
}

// ── Componente principal ────────────────────────────────────────────────────

const VisorMolde: React.FC<VisorMoldeProps> = ({
    archivoUrl,
    nombreArchivo,
    isDark = false,
    altura = 520,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [datos, setDatos] = useState<DxfParseado | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [transform, setTransform] = useState<Transform>({ offsetX: 0, offsetY: 0, escala: 1 });

    // Hover sobre pieza
    const [piezaHover, setPiezaHover] = useState<number | null>(null);
    const [tooltip, setTooltip] = useState<TooltipPieza | null>(null);

    // Herramienta de medición
    const [modoMedicion, setModoMedicion] = useState(false);
    const [puntosMedicion, setPuntosMedicion] = useState<PuntoMedicion[]>([]);
    const [lineaMedicion, setLineaMedicion] = useState<{ p1: PuntoMedicion; p2: PuntoMedicion } | null>(null);

    // Drag
    const dragging = useRef(false);
    const lastMouse = useRef({ x: 0, y: 0 });

    // ── Cargar archivo ──────────────────────────────────────────────────────
    useEffect(() => {
        setCargando(true);
        setError(null);
        setDatos(null);
        setPiezaHover(null);
        setTooltip(null);
        setPuntosMedicion([]);
        setLineaMedicion(null);

        cargarYParsearDxf(archivoUrl)
            .then(d => { setDatos(d); setCargando(false); })
            .catch(e => { setError(e.message || 'Error al cargar'); setCargando(false); });
    }, [archivoUrl]);

    // ── Transform inicial ───────────────────────────────────────────────────
    useEffect(() => {
        if (!datos || !canvasRef.current || !containerRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = containerRef.current.clientWidth || 800;
        canvas.height = altura;
        setTransform(calcularTransformInicial(datos.bounds, canvas.width, canvas.height));
    }, [datos, altura]);

    // ── Renderizar ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!datos || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        renderizarDxf(ctx, datos, transform, canvas.width, canvas.height, isDark, piezaHover, puntosMedicion, lineaMedicion);
    }, [datos, transform, isDark, piezaHover, puntosMedicion, lineaMedicion]);

    // ── Zoom con rueda ──────────────────────────────────────────────────────
    const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
        setTransform((prev: Transform) => {
            const nuevaEscala = Math.max(0.05, Math.min(prev.escala * factor, 50));
            const ratio = nuevaEscala / prev.escala;
            return {
                escala: nuevaEscala,
                offsetX: mouseX - ratio * (mouseX - prev.offsetX),
                offsetY: mouseY - ratio * (mouseY - prev.offsetY),
            };
        });
    }, []);

    // ── Mouse move: pan + hover ─────────────────────────────────────────────
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current || !datos) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;

        if (dragging.current && !modoMedicion) {
            const dx = e.clientX - lastMouse.current.x;
            const dy = e.clientY - lastMouse.current.y;
            lastMouse.current = { x: e.clientX, y: e.clientY };
            setTransform((prev: Transform) => ({ ...prev, offsetX: prev.offsetX + dx, offsetY: prev.offsetY + dy }));
            return;
        }

        // Detectar hover sobre polilineas cerradas
        const [dxfX, dxfY] = canvasADxf(cx, cy, datos.bounds, transform);
        let encontrado: number | null = null;
        datos.entidades.forEach((ent, idx) => {
            if (ent.tipo === 'polilinea' && ent.cerrada) {
                if (puntoDentroPolilinea(dxfX, dxfY, ent)) {
                    encontrado = idx;
                }
            }
        });

        if (encontrado !== piezaHover) {
            setPiezaHover(encontrado);
            if (encontrado !== null) {
                const ent = datos.entidades[encontrado] as DxfPolilinea;
                const bb = bboxPolilinea(ent);
                setTooltip({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                    anchoIn: bb.maxX - bb.minX,
                    altoIn: bb.maxY - bb.minY,
                    perimetroIn: perimetroPolilinea(ent),
                });
            } else {
                setTooltip(null);
            }
        } else if (encontrado !== null) {
            // Actualizar posición del tooltip
            setTooltip((prev: TooltipPieza | null) => prev ? { ...prev, x: cx, y: cy } : null);
        }
    }, [datos, transform, piezaHover, modoMedicion]);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (modoMedicion) return;
        dragging.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
    }, [modoMedicion]);

    const handleMouseUp = useCallback(() => { dragging.current = false; }, []);

    // ── Click: herramienta de medición ──────────────────────────────────────
    const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!modoMedicion || !canvasRef.current || !datos) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const [dxfX, dxfY] = canvasADxf(cx, cy, datos.bounds, transform);
        const punto: PuntoMedicion = { cx, cy, dxfX, dxfY };

        setPuntosMedicion(prev => {
            if (prev.length === 0) {
                setLineaMedicion(null);
                return [punto];
            } else {
                setLineaMedicion({ p1: prev[0], p2: punto });
                return [];
            }
        });
    }, [modoMedicion, datos, transform]);

    // ── Controles zoom ──────────────────────────────────────────────────────
    const zoomIn = () => setTransform((prev: Transform) => ({ ...prev, escala: prev.escala * 1.25 }));
    const zoomOut = () => setTransform((prev: Transform) => ({ ...prev, escala: Math.max(0.05, prev.escala / 1.25) }));
    const resetZoom = () => {
        if (!datos || !canvasRef.current) return;
        const c = canvasRef.current;
        setTransform(calcularTransformInicial(datos.bounds, c.width, c.height));
    };
    const limpiarMedicion = () => { setPuntosMedicion([]); setLineaMedicion(null); };

    const nombre = nombreArchivo || archivoUrl.split('/').pop() || 'molde';
    const ext = nombre.split('.').pop()?.toUpperCase() ?? 'DXF';

    const cursorCanvas = modoMedicion ? 'crosshair' : (dragging.current ? 'grabbing' : 'grab');

    return (
        <div className="flex flex-col h-full select-none">
            {/* ── Info bar ─────────────────────────────────────────────── */}
            <div className={`flex items-center justify-between px-4 py-2 text-xs font-bold border-b shrink-0 ${isDark ? 'border-violet-700 text-violet-400' : 'border-slate-100 text-slate-400'}`}>
                <div className="flex items-center gap-2 min-w-0">
                    <span className={`px-1.5 py-0.5 rounded font-black text-[10px] shrink-0 ${isDark ? 'bg-violet-700/50 text-violet-300' : 'bg-violet-100 text-violet-600'}`}>{ext}</span>
                    <span className="truncate max-w-[180px]">{nombre}</span>
                    {datos && (
                        <span className={`shrink-0 ${isDark ? 'text-violet-600' : 'text-slate-300'}`}>
                            • {datos.entidades.filter(e => e.tipo === 'polilinea').length} piezas
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {/* Botón medición */}
                    <button
                        onClick={() => { setModoMedicion(m => !m); limpiarMedicion(); }}
                        title={modoMedicion ? 'Salir de medición' : 'Herramienta de medición'}
                        className={`flex items-center gap-1 px-2 h-7 rounded-lg font-black text-[10px] uppercase tracking-wider transition-colors ${
                            modoMedicion
                                ? isDark ? 'bg-amber-600/40 text-amber-300 border border-amber-500' : 'bg-amber-50 text-amber-600 border border-amber-400'
                                : isDark ? 'hover:bg-violet-700/50 text-violet-400' : 'hover:bg-slate-100 text-slate-500'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                        </svg>
                        <span>{modoMedicion ? 'Midiendo' : 'Medir'}</span>
                    </button>

                    {lineaMedicion && (
                        <button onClick={limpiarMedicion} title="Limpiar medición"
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'hover:bg-violet-700/50 text-violet-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}

                    <div className={`w-px h-5 mx-1 ${isDark ? 'bg-violet-700' : 'bg-slate-200'}`} />

                    {/* Zoom */}
                    <button onClick={zoomOut} title="Alejar" className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-base transition-colors ${isDark ? 'hover:bg-violet-700/50 text-violet-300' : 'hover:bg-slate-100 text-slate-600'}`}>−</button>
                    <button onClick={resetZoom} title="Ajustar a pantalla" className={`px-2 h-7 rounded-lg font-black text-[10px] uppercase tracking-wider transition-colors ${isDark ? 'hover:bg-violet-700/50 text-violet-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                        {Math.round(transform.escala * 100)}%
                    </button>
                    <button onClick={zoomIn} title="Acercar" className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-base transition-colors ${isDark ? 'hover:bg-violet-700/50 text-violet-300' : 'hover:bg-slate-100 text-slate-600'}`}>+</button>
                </div>
            </div>

            {/* ── Canvas area ──────────────────────────────────────────── */}
            <div ref={containerRef} className="relative flex-1 overflow-hidden" style={{ height: altura }}>
                {cargando && (
                    <div className={`absolute inset-0 flex items-center justify-center ${isDark ? 'bg-[#2d1f42]' : 'bg-slate-50'}`}>
                        <div className="text-center">
                            <div className={`w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-3 ${isDark ? 'border-violet-500 border-t-transparent' : 'border-violet-400 border-t-transparent'}`} />
                            <p className={`font-bold text-sm ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>Cargando molde...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className={`absolute inset-0 flex items-center justify-center p-6 ${isDark ? 'bg-[#2d1f42]' : 'bg-slate-50'}`}>
                        <div className="text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-red-400 mx-auto mb-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                            <p className={`font-black text-sm mb-1 ${isDark ? 'text-red-300' : 'text-red-600'}`}>Error al cargar el molde</p>
                            <p className={`font-bold text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{error}</p>
                        </div>
                    </div>
                )}

                {!cargando && !error && datos && (
                    <canvas
                        ref={canvasRef}
                        width={containerRef.current?.clientWidth || 800}
                        height={altura}
                        style={{ cursor: cursorCanvas, display: 'block', width: '100%' }}
                        onWheel={handleWheel}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onClick={handleClick}
                    />
                )}

                {/* Tooltip de pieza */}
                {tooltip && !modoMedicion && (
                    <div
                        className={`absolute pointer-events-none px-3 py-2 rounded-xl shadow-lg text-xs font-bold z-10 ${isDark ? 'bg-[#4a3a63] border border-violet-600 text-violet-200' : 'bg-white border border-slate-200 text-slate-700'}`}
                        style={{ left: tooltip.x + 14, top: tooltip.y - 10, minWidth: 140 }}
                    >
                        <div className="flex items-center gap-1 mb-1">
                            <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-violet-400' : 'bg-violet-500'}`} />
                            <span className={`font-black text-[10px] uppercase tracking-wider ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>Pieza</span>
                        </div>
                        <div className={`space-y-0.5 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>
                            <div>↔ Ancho: <span className="font-black">{formatCm(tooltip.anchoIn)}</span></div>
                            <div>↕ Alto: <span className="font-black">{formatCm(tooltip.altoIn)}</span></div>
                            <div className={`pt-1 mt-1 border-t ${isDark ? 'border-violet-700' : 'border-slate-100'}`}>
                                ⌯ Perímetro: <span className="font-black">{formatCm(tooltip.perimetroIn)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hint modo medición */}
                {modoMedicion && (
                    <div className={`absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider pointer-events-none ${isDark ? 'bg-amber-600/30 text-amber-300 border border-amber-600/50' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                        {puntosMedicion.length === 0 ? 'Click para primer punto' : 'Click para segundo punto'}
                    </div>
                )}

                {/* Hint controles */}
                {!cargando && !error && datos && !modoMedicion && (
                    <div className={`absolute bottom-3 right-3 text-[10px] font-bold px-2 py-1 rounded-lg pointer-events-none ${isDark ? 'bg-slate-900/60 text-slate-500' : 'bg-white/70 text-slate-400'}`}>
                        Rueda: zoom • Drag: mover • Hover: medidas
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisorMolde;
