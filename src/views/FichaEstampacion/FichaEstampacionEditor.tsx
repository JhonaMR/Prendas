// ============================================
// VISTA: Editor de Ficha de Estampación
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import { AppState } from '../../types';
import { FichaEstampacionData, FichaEstampacionRecord, FICHA_ESTAMPACION_DEFAULT, PintaEstampado } from './types';
import api from '../../services/api';
import apiFichas from '../../services/apiFichas';

function getBaseUrl(): string {
    if ((window as any).API_CONFIG?.getApiUrl) return (window as any).API_CONFIG.getApiUrl().replace('/api', '');
    return `${window.location.protocol}//${window.location.hostname}:3000`;
}

function fmtPrecio(v: string | number): string {
    const n = typeof v === 'string' ? parseFloat(v) : v;
    if (isNaN(n)) return '';
    return `$ ${Math.floor(n).toLocaleString('es-CO')}`;
}

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
        <div className="flex items-center justify-between">
            <h4 className={`text-xs font-black uppercase tracking-widest ${dark ? 'text-violet-300' : 'text-slate-500'}`}>{title}</h4>
        </div>
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

// ── Vista previa de la Ficha (Letter Size) ───────────────────────────────────

interface PreviewProps {
    data: FichaEstampacionData;
    foto1: string | null; foto2: string | null; foto3: string | null;
}

const FichaEstampacionPreview = React.forwardRef<HTMLDivElement, PreviewProps>(({ data, foto1, foto2, foto3 }, ref) => {
    const baseUrl = getBaseUrl();
    const fotoSrc = ([foto1, foto2, foto3][data.fotoSeleccionada - 1]) ? `${baseUrl}${[foto1, foto2, foto3][data.fotoSeleccionada - 1]}` : null;
    const c = 'border border-black px-1 py-0.5';
    const l = 'font-bold text-[8px] uppercase';
    const v = 'font-black text-[10px]';

    // Clases dinámicas de rejilla basadas en la cantidad de pintas
    const gridColsCls = data.pintas.length === 1 ? 'grid-cols-1' : 'grid-cols-2';
    const gridRowsCls = data.pintas.length <= 2 ? 'grid-rows-1' : 'grid-rows-2';

    return (
        <div ref={ref} id="ficha-preview" className="bg-white text-black"
            style={{ width: '216mm', minHeight: '279mm', padding: '7mm', boxSizing: 'border-box', fontFamily: 'Arial,sans-serif', fontSize: '9px' }}>
            
            {/* Título Principal */}
            <div className="border border-black text-center py-1 mb-px font-black text-[12px] uppercase tracking-wider">
                FICHA TECNICA DE ESTAMPACIÓN
            </div>
            
            {/* Fila 1: Referencia y Fechas */}
            <div className="grid grid-cols-2 border-b border-x border-black">
                <div className="flex items-center gap-3 border-r border-black px-2 py-1">
                    <span className={l}>REFERENCIA:</span><span className="font-black text-[16px]">{data.referencia}</span>
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
            
            {/* Fila 2: Línea, Marca, Muestra, Corte, Precios y Cantidad */}
            <div className="grid border-b border-x border-black" style={{ gridTemplateColumns: '1fr 1.2fr 0.8fr' }}>
                <div className="border-r border-black">
                    {[
                        ['LINEA:', data.linea],
                        ['MARCA:', data.marca],
                        ['Nº MUESTRA', data.nMuestra],
                        ['Nº CORTE', data.nCorte]
                    ].map(([lb, vl]) => (
                        <div key={lb} className="grid grid-cols-2 border-b border-black last:border-b-0">
                            <span className={`${c} border-r border-black ${l}`}>{lb}</span>
                            <span className={`${c} ${v}`}>{vl}</span>
                        </div>
                    ))}
                </div>
                <div className="border-r border-black">
                    <div className={`${c} border-b border-black text-center ${l}`}>PRECIO</div>
                    {data.precios.map((pr, i) => (
                        <div key={i} className="grid grid-cols-2 border-b border-black last:border-b-0">
                            <span className={`${c} border-r border-black ${l} truncate`}>{pr.concepto || 'PROCESO'}</span>
                            <span className={`${c} ${v}`}>{pr.valor ? fmtPrecio(pr.valor) : ''}</span>
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
            
            {/* Fila 3: Realizada por */}
            <div className="grid grid-cols-3 border-b border-x border-black">
                <span className={`${c} border-r border-black ${l}`}>FICHA REALIZADA POR :</span>
                <span className={`${c} col-span-2 font-black text-[12px] text-center uppercase`}>{data.fichaRealizadaPor}</span>
            </div>
            
            {/* Fila 4: Descripción */}
            <div className="grid grid-cols-3 border-b border-x border-black">
                <span className={`${c} border-r border-black ${l}`}>DESCRIPCION:</span>
                <span className={`${c} col-span-2 font-black text-[12px] text-center uppercase`}>{data.descripcion}</span>
            </div>
            
            {/* Fila 5: Foto Prenda (Frente) y Pintas (Espalda / Estampados) */}
            {data.pintasActivo ? (
                <div className="grid grid-cols-2 border-b border-x border-black" style={{ height: '78mm' }}>
                    {/* Frente */}
                    <div className="border-r border-black flex flex-col h-full overflow-hidden">
                        <div className="border-b border-black text-center font-black py-0.5 uppercase tracking-wider bg-slate-100 text-[9px]">FRENTE</div>
                        <div className="flex-1 flex items-center justify-center overflow-hidden p-1 max-h-[70mm]">
                            {fotoSrc ? (
                                <img src={fotoSrc} alt="Prenda Frente" className="max-w-full max-h-full object-contain" style={{ maxHeight: '68mm' }} />
                            ) : (
                                <span className="text-slate-300 text-[9px] font-bold">Sin foto de referencia</span>
                            )}
                        </div>
                    </div>
                    {/* Espalda / Estampados */}
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="border-b border-black text-center font-black py-0.5 uppercase tracking-wider bg-slate-100 text-[9px]">ESPALDA / VARIANTES</div>
                        <div className={`flex-1 grid gap-1 p-1 ${gridColsCls} ${gridRowsCls}`}>
                            {data.pintas.map((p, i) => {
                                const pSrc = p.fotoPath ? `${baseUrl}${p.fotoPath}` : null;
                                return (
                                    <div key={i} className="border border-slate-300 rounded flex flex-col overflow-hidden bg-slate-50 h-full">
                                        <div className="flex-1 flex items-center justify-center overflow-hidden p-0.5">
                                            {pSrc ? (
                                                <img src={pSrc} alt={p.label} className="max-w-full max-h-full object-contain" />
                                            ) : (
                                                <span className="text-[7px] text-slate-300">Vacío</span>
                                            )}
                                        </div>
                                        {p.label && (
                                            <div className="bg-white border-t border-slate-300 text-center font-black text-[8px] py-0.5 truncate uppercase">
                                                {p.label}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                /* Layout sin variantes (Foto completa) */
                <div className="border-b border-x border-black flex flex-col h-full overflow-hidden" style={{ height: '78mm' }}>
                    <div className="border-b border-black text-center font-black py-0.5 uppercase tracking-wider bg-slate-100 text-[9px]">FOTO PRENDA</div>
                    <div className="flex-1 flex items-center justify-center overflow-hidden p-1 max-h-[70mm]">
                        {fotoSrc ? (
                            <img src={fotoSrc} alt="Prenda" className="max-w-full max-h-full object-contain" style={{ maxHeight: '72mm' }} />
                        ) : (
                            <span className="text-slate-300 text-[9px] font-bold">Sin foto de referencia</span>
                        )}
                    </div>
                </div>
            )}
            
            {/* Fila 6: Observaciones */}
            <div className="grid border-b border-x border-black" style={{ gridTemplateColumns: '1.2fr 4.8fr' }}>
                <div className="flex items-center justify-center border-r border-black p-2 font-black uppercase text-[10px] tracking-wider text-center bg-slate-100">
                    OBSERVACION
                </div>
                <div className="flex flex-col divide-y divide-black bg-white">
                    {data.observaciones.map((obs, i) => (
                        <div key={i} className="px-2 py-1 text-[9px] font-bold whitespace-pre-wrap uppercase min-h-[16px]">
                            {obs}
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Fila 7: Responsable */}
            <div className="grid grid-cols-4 border-b border-x border-black">
                <div className="flex items-center border-r border-black px-2 py-1 font-bold text-[8px] uppercase">RESPONSABLE:</div>
                <div className="col-span-3 font-black text-[18px] text-center uppercase py-0.5 tracking-wider bg-slate-50">{data.responsable}</div>
            </div>
            
            {/* Fila 8: Combinación de Colores */}
            <div className="border border-black mt-0.5">
                <div className="text-center font-black py-0.5 uppercase tracking-wider bg-slate-100 text-[9px] border-b border-black">
                    COMBINACIÓN DE COLORES
                </div>
                <div className="grid grid-cols-6 divide-x divide-black bg-white text-center font-bold text-[8px]">
                    {data.combinacionColores.map((fila, rIdx) => (
                        <React.Fragment key={rIdx}>
                            {fila.map((celda, cIdx) => (
                                <div key={cIdx} className={`p-1 min-h-[18px] flex items-center justify-center uppercase truncate border-b border-black last:border-b-0 ${rIdx === data.combinacionColores.length - 1 ? 'border-b-0' : ''}`}>
                                    {celda}
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
});
FichaEstampacionPreview.displayName = 'FichaEstampacionPreview';

// ── Componente Principal ─────────────────────────────────────────────────────

interface Props {
    user: any;
    state: AppState;
    onNavigate: (tab: string, params?: any) => void;
    fichaId?: string;
    fichas: FichaEstampacionRecord[];
    onGuardar: (ficha: FichaEstampacionRecord) => void;
}

const FichaEstampacionEditor: React.FC<Props> = ({ user, state, onNavigate, fichaId, fichas, onGuardar }) => {
    const { isDark } = useDarkMode();
    const d = isDark;
    const fichaExistente = fichaId ? fichas.find(f => f.id === fichaId) : null;

    const [data, setData] = useState<FichaEstampacionData>(
        fichaExistente ? { ...fichaExistente.data }
            : { ...FICHA_ESTAMPACION_DEFAULT, fichaRealizadaPor: user?.name || '' }
    );

    const [fichaCostoDetalle, setFichaCostoDetalle] = useState<any>(null);
    const [referenciaActiva, setReferenciaActiva] = useState(data.referencia);
    const [refSearch, setRefSearch] = useState(data.referencia);
    const [showRefDrop, setShowRefDrop] = useState(false);
    
    const [todosLosCortes, setTodosLosCortes] = useState<any[]>([]);
    const [showDropCorte, setShowDropCorte] = useState(false);
    
    const [showDropPrecios, setShowDropPrecios] = useState<number | null>(null);
    const [zoomPreview, setZoomPreview] = useState(1);
    
    // Subida de archivos individuales de pintas
    const [uploadingPintas, setUploadingPintas] = useState<boolean[]>([false, false, false, false]);
    const fileInputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null)
    ];

    const baseUrl = getBaseUrl();

    // Buscar referencias desde Fichas de Costo para el autocompletado
    const refsFiltradas = refSearch.length >= 1
        ? (state.fichasCosto || []).filter((fc: any) =>
            fc.referencia.toLowerCase().includes(refSearch.toLowerCase()) ||
            (fc.descripcion || '').toLowerCase().includes(refSearch.toLowerCase())
          ).slice(0, 8)
        : [];

    // Cargar todos los registros de corte al montar
    useEffect(() => {
        api.getCorteRegistros()
            .then(res => setTodosLosCortes(res || []))
            .catch(err => console.error('Error cargando registros de corte:', err));
    }, []);

    // Cerrar dropdowns al hacer click en cualquier parte
    useEffect(() => {
        const handleClickOutside = () => {
            setShowDropPrecios(null);
            setShowDropCorte(false);
            setShowRefDrop(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

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

    const set = (key: keyof FichaEstampacionData, value: any) => setData(prev => ({ ...prev, [key]: value }));

    // Filtrar los registros de corte por referencia activa
    const opCorte = todosLosCortes.filter((c: any) => c.referencia === referenciaActiva);

    // Fotos de Ficha de Costo
    const foto1 = fichaCostoDetalle?.foto1 || null;
    const foto2 = fichaCostoDetalle?.foto2 || null;
    const foto3 = fichaCostoDetalle?.foto3 || null;

    // Buscar mano de obra con palabras clave de estampado/aplique
    const opPrecios = (fichaCostoDetalle?.manoObra || []).filter((x: any) => {
        const c = (x.concepto || '').toUpperCase();
        return c.includes('PERLA') || c.includes('APLIQUE') || c.includes('ESTAMPADO') || 
               c.includes('ESTAMPACION') || c.includes('SUBLIMADO') || c.includes('PEGADA') ||
               c.includes('OJAL') || c.includes('BOTON') || c.includes('BOTÓN') ||
               c.includes('FUSION') || c.includes('FUSIÓN');
    });

    // ── Precios Dinámicos ────────────────────────────────────────────────────
    const updatePrecio = (i: number, campo: 'concepto' | 'valor', valor: string) => {
        setData(prev => {
            const pr = [...prev.precios];
            pr[i] = { ...pr[i], [campo]: valor };
            return { ...prev, precios: pr };
        });
    };
    const addPrecioRow = () => {
        setData(prev => ({ ...prev, precios: [...prev.precios, { concepto: '', valor: '' }] }));
    };
    const removePrecioRow = (i: number) => {
        setData(prev => ({ ...prev, precios: prev.precios.filter((_, idx) => idx !== i) }));
    };

    // ── Observaciones Dinámicas ──────────────────────────────────────────────
    const updateObservacion = (i: number, valor: string) => {
        setData(prev => {
            const obs = [...prev.observaciones];
            obs[i] = valor;
            return { ...prev, observaciones: obs };
        });
    };
    const addObservacionRow = () => {
        setData(prev => ({ ...prev, observaciones: [...prev.observaciones, ''] }));
    };
    const removeObservacionRow = (i: number) => {
        setData(prev => ({ ...prev, observaciones: prev.observaciones.filter((_, idx) => idx !== i) }));
    };

    // ── Combinaciones de Colores Dinámicas ───────────────────────────────────
    const updateCombinacion = (rIdx: number, cIdx: number, valor: string) => {
        setData(prev => {
            const grid = [...prev.combinacionColores];
            grid[rIdx] = [...grid[rIdx]];
            grid[rIdx][cIdx] = valor;
            return { ...prev, combinacionColores: grid };
        });
    };
    const addCombinacionRow = () => {
        setData(prev => ({ ...prev, combinacionColores: [...prev.combinacionColores, Array(6).fill('')] }));
    };
    const removeCombinacionRow = (rIdx: number) => {
        setData(prev => ({ ...prev, combinacionColores: prev.combinacionColores.filter((_, idx) => idx !== rIdx) }));
    };

    // ── Pintas (Manejo de Swatches) ──────────────────────────────────────────
    const updatePintaLabel = (i: number, label: string) => {
        setData(prev => {
            const pts = [...prev.pintas];
            pts[i] = { ...pts[i], label };
            return { ...prev, pintas: pts };
        });
    };
    
    const setPintaFromFicha = (i: number, num: 1 | 2 | 3) => {
        const path = [foto1, foto2, foto3][num - 1];
        if (!path) return;
        setData(prev => {
            const pts = [...prev.pintas];
            pts[i] = {
                ...pts[i],
                fotoPath: path,
                isFromFicha: true,
                fotoNum: num
            };
            return { ...prev, pintas: pts };
        });
    };

    const handleUploadPinta = async (i: number, file: File) => {
        if (!file) return;
        if (!file.type.match(/image\/(jpeg|jpg|png)/)) { alert('Solo se permiten imágenes JPG, JPEG o PNG'); return; }
        if (file.size > 5 * 1024 * 1024) { alert('La imagen no debe superar 5MB'); return; }

        setUploadingPintas(prev => { const n = [...prev]; n[i] = true; return n; });

        try {
            const ext = file.name.split('.').pop();
            const renamedFile = new File([file], `${data.referencia}-pinta-${i + 1}-${Date.now()}.${ext}`, { type: file.type });
            const result = await apiFichas.uploadFotoFicha(renamedFile);
            if (result.success) {
                setData(prev => {
                    const pts = [...prev.pintas];
                    pts[i] = {
                        ...pts[i],
                        fotoPath: result.data.path,
                        isFromFicha: false,
                        fotoNum: undefined
                    };
                    return { ...prev, pintas: pts };
                });
            } else {
                alert('Error al subir imagen: ' + result.message);
            }
        } catch {
            alert('Error de conexión al subir imagen');
        } finally {
            setUploadingPintas(prev => { const n = [...prev]; n[i] = false; return n; });
        }
    };

    const clearPinta = (i: number) => {
        setData(prev => {
            const pts = [...prev.pintas];
            pts[i] = { label: pts[i].label, fotoPath: null, isFromFicha: undefined, fotoNum: undefined };
            return { ...prev, pintas: pts };
        });
        if (fileInputRefs[i].current) fileInputRefs[i].current!.value = '';
    };

    // ── Imprimir / Guardar ───────────────────────────────────────────────────
    const handleImprimir = async () => {
        const el = document.getElementById('ficha-preview');
        if (!el) return;
        
        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(el, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                allowTaint: true,
            });
            const imgData = canvas.toDataURL('image/png');
            const win = window.open('', '_blank', 'width=900,height=750');
            if (!win) return;
            win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ficha de Estampacion</title>
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
        if (!data.referencia) {
            alert('Debes ingresar una referencia');
            return;
        }
        const record: FichaEstampacionRecord = {
            id: fichaId || `fe-${Date.now()}`,
            referencia: data.referencia,
            cantidadCortada: data.cantidad,
            fechaCreacion: fichaExistente?.fechaCreacion || new Date().toLocaleDateString('es-CO'),
            realizadoPor: data.fichaRealizadaPor || user?.name || '',
            responsable: data.responsable || '',
            data,
        };
        onGuardar(record);
        onNavigate('fichas-estampacion');
    };

    const dropCls = `absolute z-50 w-full mt-1 rounded-xl border shadow-xl overflow-hidden ${d ? 'bg-[#3d2d52] border-violet-600' : 'bg-white border-slate-200'}`;
    const dropItemCls = `w-full text-left px-3 py-2 text-sm font-bold transition-colors ${d ? 'hover:bg-violet-700/50 text-violet-200' : 'hover:bg-slate-50 text-slate-700'}`;
    
    // Dropdown exclusivo para precios con z-index más alto y scrollbar
    const priceDropCls = `absolute z-[100] left-0 top-full w-[350px] max-h-48 overflow-y-auto mt-1 rounded-xl border shadow-xl ${
        d ? 'bg-[#4a3a63] border-violet-600 text-violet-200' : 'bg-white border-slate-200 text-slate-700'
    }`;
    const priceDropItemCls = `w-full text-left px-3 py-2 text-xs font-bold transition-colors border-b last:border-b-0 ${
        d ? 'hover:bg-violet-850/80 border-violet-800 text-violet-200' : 'hover:bg-slate-50 border-slate-100 text-slate-700'
    }`;

    const btnDrop = `shrink-0 px-2 rounded-xl border-2 font-black text-xs transition-colors ${d ? 'border-violet-600 text-violet-300 hover:bg-violet-700/40' : 'border-slate-300 text-slate-500 hover:bg-slate-100'}`;

    return (
        <div className={`flex flex-col h-full transition-colors ${d ? 'bg-[#3d2d52]' : 'bg-white'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${d ? 'border-violet-700' : 'border-slate-200'}`}>
                <div className="flex items-center gap-4">
                    <button onClick={() => onNavigate('fichas-estampacion')}
                        className={`p-3 rounded-xl transition-colors ${d ? 'bg-violet-700/50 hover:bg-violet-700 text-violet-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                    </button>
                    <h2 className={`text-2xl font-black tracking-tighter ${d ? 'text-violet-200' : 'text-slate-800'}`}>
                        {fichaExistente ? `Editar - ${data.referencia}` : 'Nueva Ficha de Estampación'}
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
                <div className={`w-[450px] shrink-0 overflow-y-auto p-4 space-y-4 border-r ${d ? 'border-violet-700' : 'border-slate-200'}`}>

                    <Sec title="Referencia" dark={d}>
                        <div className="relative">
                            <Lbl dark={d}>Referencia</Lbl>
                            <input type="text" value={refSearch} placeholder="Buscar referencia..."
                                className={mkCls(d)}
                                onChange={e => { setRefSearch(e.target.value); setShowRefDrop(true); }}
                                onClick={e => { e.stopPropagation(); setShowRefDrop(true); }}
                                onFocus={e => { e.stopPropagation(); e.target.select(); setShowRefDrop(true); }}
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
                                <div className={dropCls} onClick={e => e.stopPropagation()}>
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

                    <Sec title="Información Básica" dark={d}>
                        <div className="grid grid-cols-2 gap-3">
                            <div><Lbl dark={d}>Línea</Lbl><TI dark={d} value={data.linea} onChange={v => set('linea', v)} /></div>
                            <div><Lbl dark={d}>Marca</Lbl><TI dark={d} value={data.marca} onChange={v => set('marca', v)} /></div>
                            <div><Lbl dark={d}>Nº Muestra</Lbl><TI dark={d} value={data.nMuestra} onChange={v => set('nMuestra', v)} /></div>
                        </div>
                        <div><Lbl dark={d}>Descripción</Lbl><TI dark={d} value={data.descripcion} onChange={v => set('descripcion', v)} /></div>
                        <div><Lbl dark={d}>Ficha realizada por</Lbl><TI dark={d} value={data.fichaRealizadaPor} onChange={v => set('fichaRealizadaPor', v)} /></div>

                        {/* N Corte / Cantidad (arrastra de Registro de Corte / corte_registros) */}
                        <div>
                            <Lbl dark={d}>Nº Corte / Cantidad (Registro de Corte)</Lbl>
                            <div className="relative flex gap-2">
                                <div className={`flex-1 px-3 py-2 border-2 rounded-xl font-bold text-sm cursor-pointer transition-colors ${
                                    d ? 'bg-[#3d2d52] border-violet-600 text-violet-100' : 'bg-white border-slate-200 text-slate-700'
                                }`}
                                    onClick={(e) => { e.stopPropagation(); setShowDropCorte(v => !v); }}>
                                    {data.nCorte
                                        ? `Corte #${data.nCorte} - ${data.cantidad} uds`
                                        : <span className={d ? 'text-violet-600' : 'text-slate-300'}>Seleccionar corte...</span>
                                    }
                                </div>
                                {opCorte.length > 0 && (
                                    <button onClick={(e) => { e.stopPropagation(); setShowDropCorte(v => !v); }} className={btnDrop}>
                                        {showDropCorte ? '▴' : '▾'}
                                    </button>
                                )}
                                {showDropCorte && opCorte.length > 0 && (
                                    <div className={`${dropCls} top-full`} onClick={e => e.stopPropagation()}>
                                        {opCorte.map((c: any) => (
                                            <button key={c.id || c.numeroFicha} className={dropItemCls}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    set('nCorte', String(c.numeroFicha));
                                                    set('cantidad', String(c.cantidadCortada));
                                                    setShowDropCorte(false);
                                                }}>
                                                <span className="font-black">Corte #{c.numeroFicha}</span>
                                                <span className={`ml-2 ${d ? 'text-violet-400' : 'text-slate-500'}`}>{c.cantidadCortada} uds</span>
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

                            <Sec title="Precios (Mano de Obra Estampado)" dark={d}>
                                <div className="space-y-3">
                                    {data.precios.map((pr, i) => {
                                        const filteredOptions = (fichaCostoDetalle?.manoObra || []).filter((x: any) => {
                                            const conceptUpper = (x.concepto || '').toUpperCase();
                                            return conceptUpper.includes('PERLA') || 
                                                   conceptUpper.includes('APLIQUE') || 
                                                   conceptUpper.includes('ESTAMPADO') || 
                                                   conceptUpper.includes('ESTAMPACION') || 
                                                   conceptUpper.includes('SUBLIMADO') || 
                                                   conceptUpper.includes('PEGADA') ||
                                                   conceptUpper.includes('OJAL') ||
                                                   conceptUpper.includes('BOTON') ||
                                                   conceptUpper.includes('BOTÓN') ||
                                                   conceptUpper.includes('FUSION') ||
                                                   conceptUpper.includes('FUSIÓN');
                                        });

                                        return (
                                            <div key={i} className="flex gap-2 items-center">
                                                <div className="relative flex-1 flex gap-1 items-center">
                                                    <input type="text" value={pr.concepto} placeholder="Concepto (Ej: ESTAMPADO)"
                                                        className={`${mkCls(d)} flex-1 min-w-0`}
                                                        onChange={e => {
                                                            updatePrecio(i, 'concepto', e.target.value);
                                                            setShowDropPrecios(i);
                                                        }}
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            setShowDropPrecios(i);
                                                        }}
                                                        onFocus={e => {
                                                            e.stopPropagation();
                                                            setShowDropPrecios(i);
                                                        }}
                                                    />
                                                    {filteredOptions.length > 0 && (
                                                        <button type="button" 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShowDropPrecios(prev => prev === i ? null : i);
                                                            }} 
                                                            className={btnDrop}>
                                                            {showDropPrecios === i ? '▴' : '▾'}
                                                        </button>
                                                    )}
                                                    {showDropPrecios === i && filteredOptions.length > 0 && (
                                                        <div className={priceDropCls} onClick={e => e.stopPropagation()}>
                                                            {filteredOptions.map((x: any) => (
                                                                <button key={x.concepto} type="button" className={priceDropItemCls}
                                                                    onMouseDown={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        updatePrecio(i, 'concepto', x.concepto);
                                                                        updatePrecio(i, 'valor', String(x.vlr_unit));
                                                                        setShowDropPrecios(null);
                                                                    }}>
                                                                    {x.concepto} - {fmtPrecio(x.vlr_unit)}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <input type="text" value={pr.valor} placeholder="Valor ($)"
                                                    className={`w-24 ${mkCls(d)}`}
                                                    onChange={e => updatePrecio(i, 'valor', e.target.value)}
                                                />
                                                {data.precios.length > 1 && (
                                                    <button onClick={() => removePrecioRow(i)} className="p-2 text-red-500 hover:text-red-700">
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <button onClick={addPrecioRow}
                                        className={`w-full py-1.5 border-2 border-dashed rounded-xl font-bold text-xs uppercase tracking-wider ${d ? 'border-violet-600 text-violet-400 hover:bg-violet-700/20' : 'border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
                                        + Agregar Proceso
                                    </button>
                                </div>
                            </Sec>

                    <Sec title="Foto Frente de la Prenda" dark={d}>
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

                    <Sec title="Variantes / Pintas de Estampado" dark={d}>
                        {/* Control para activar/desactivar el cajón de variantes */}
                        <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-200 dark:border-violet-700 mb-3">
                            <span className={`text-xs font-bold ${d ? 'text-violet-300' : 'text-slate-500'}`}>Activar Variantes / Pintas en la ficha</span>
                            <button onClick={() => set('pintasActivo', !data.pintasActivo)}
                                className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase border transition-colors ${
                                    data.pintasActivo
                                        ? d ? 'bg-emerald-700/50 border-emerald-500 text-emerald-300' : 'bg-emerald-50 border-emerald-400 text-emerald-700'
                                        : d ? 'bg-slate-700/40 border-slate-600 text-slate-500' : 'bg-slate-100 border-slate-300 text-slate-400'
                                }`}>
                                {data.pintasActivo ? 'Sí' : 'No'}
                            </button>
                        </div>

                        {data.pintasActivo ? (
                            <div className="space-y-4">
                                {data.pintas.map((p, i) => {
                                    const pSrc = p.fotoPath ? `${baseUrl}${p.fotoPath}` : null;
                                    return (
                                        <div key={i} className={`p-3 border rounded-xl space-y-2 ${d ? 'border-violet-700 bg-violet-900/10' : 'border-slate-200 bg-slate-50/50'}`}>
                                            <div className="flex items-center justify-between">
                                                <span className={`text-[10px] font-black uppercase ${d ? 'text-violet-400' : 'text-slate-400'}`}>Pinta #{i + 1}</span>
                                                <div className="flex gap-2">
                                                    {p.fotoPath && (
                                                        <button onClick={() => clearPinta(i)} className="text-[10px] font-black text-red-500 hover:text-red-700 uppercase">
                                                            Quitar Foto
                                                        </button>
                                                    )}
                                                    {data.pintas.length > 1 && (
                                                        <button onClick={() => {
                                                            const updated = data.pintas.filter((_, idx) => idx !== i);
                                                            set('pintas', updated);
                                                        }} className="text-[10px] font-black text-red-500 hover:text-red-700 uppercase">
                                                            Eliminar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <TI dark={d} value={p.label} onChange={v => updatePintaLabel(i, v)} placeholder="Nombre Variante (Ej: FLORES ROSA)" />
                                            
                                            <div className="flex gap-2 items-center">
                                                {/* Preview de la pinta */}
                                                <div className={`w-12 h-12 rounded-lg border overflow-hidden shrink-0 flex items-center justify-center ${d ? 'border-violet-600 bg-[#3d2d52]' : 'border-slate-200 bg-white'}`}>
                                                    {pSrc ? (
                                                        <img src={pSrc} alt={p.label} className="w-full h-full object-cover" />
                                                    ) : uploadingPintas[i] ? (
                                                        <span className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></span>
                                                    ) : (
                                                        <span className="text-[8px] text-slate-300 font-bold">Sin foto</span>
                                                    )}
                                                </div>

                                                {/* Botones de control */}
                                                <div className="flex-1 flex flex-wrap gap-1">
                                                    {/* Cargar desde PC */}
                                                    <input
                                                        ref={fileInputRefs[i]}
                                                        type="file"
                                                        accept="image/jpeg,image/jpg,image/png"
                                                        onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadPinta(i, f); }}
                                                        className="hidden"
                                                        id={`pinta-file-${i}`}
                                                    />
                                                    <label htmlFor={`pinta-file-${i}`}
                                                        className={`px-2 py-1 rounded border text-[9px] font-bold uppercase cursor-pointer transition-colors ${d ? 'border-violet-600 text-violet-300 hover:bg-violet-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}>
                                                        📁 Subir
                                                    </label>
                                                    
                                                    {/* Seleccionar de Ficha */}
                                                    {[1, 2, 3].map(num => {
                                                        const path = [foto1, foto2, foto3][num - 1];
                                                        if (!path) return null;
                                                        const esActiva = p.isFromFicha && p.fotoNum === num;
                                                        return (
                                                            <button key={num} type="button" onClick={() => setPintaFromFicha(i, num as 1|2|3)}
                                                                className={`px-1.5 py-1 rounded border text-[9px] font-bold ${
                                                                    esActiva 
                                                                        ? d ? 'bg-emerald-800 border-emerald-600 text-emerald-200' : 'bg-emerald-50 border-emerald-400 text-emerald-700'
                                                                        : d ? 'border-violet-600 text-violet-400 hover:bg-violet-800' : 'border-slate-300 text-slate-400 hover:bg-slate-100'
                                                                }`}>
                                                                F{num}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {data.pintas.length < 4 && (
                                    <button type="button"
                                        onClick={() => set('pintas', [...data.pintas, { label: '', fotoPath: null }])}
                                        className={`w-full py-1.5 border-2 border-dashed rounded-xl font-bold text-xs uppercase tracking-wider ${d ? 'border-violet-600 text-violet-400 hover:bg-violet-700/20' : 'border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
                                        + Agregar Variante
                                    </button>
                                )}
                            </div>
                        ) : (
                            <p className={`text-xs font-bold text-center py-4 ${d ? 'text-violet-500' : 'text-slate-400'}`}>
                                Las variantes están desactivadas. La foto principal se mostrará a ancho completo.
                            </p>
                        )}
                    </Sec>

                    <Sec title="Observaciones" dark={d}>
                        <div className="space-y-2">
                            {data.observaciones.map((obs, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <input type="text" value={obs} placeholder="Observación"
                                        className={mkCls(d)}
                                        onChange={e => updateObservacion(i, e.target.value)}
                                    />
                                    {data.observaciones.length > 1 && (
                                        <button onClick={() => removeObservacionRow(i)} className="p-2 text-red-500 hover:text-red-700">
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button onClick={addObservacionRow}
                                className={`w-full py-1.5 border-2 border-dashed rounded-xl font-bold text-xs uppercase tracking-wider ${d ? 'border-violet-600 text-violet-400 hover:bg-violet-700/20' : 'border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
                                + Agregar Observación
                            </button>
                        </div>
                    </Sec>

                    <Sec title="Responsable de Estampación" dark={d}>
                        <TI dark={d} value={data.responsable} onChange={v => set('responsable', v)} placeholder="Nombre Taller / Estampador (Ej: GLOBLO)" />
                    </Sec>

                    <Sec title="Combinación de Colores" dark={d}>
                        <div className="space-y-3">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[360px]">
                                    <thead>
                                        <tr>
                                            {Array(6).fill(null).map((_, i) => (
                                                <th key={i} className={`p-1 text-[8px] font-black uppercase text-center ${d ? 'text-violet-400' : 'text-slate-400'}`}>Col {i + 1}</th>
                                            ))}
                                            <th className="p-1 w-6"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.combinacionColores.map((fila, rIdx) => (
                                            <tr key={rIdx}>
                                                {fila.map((celda, cIdx) => (
                                                    <td key={cIdx} className="p-0.5">
                                                        <input type="text" value={celda}
                                                            className={`p-1 border text-center text-xs outline-none rounded-lg w-full ${d ? 'bg-[#3d2d52] border-violet-700 text-violet-200' : 'bg-white border-slate-200 text-slate-700'}`}
                                                            onChange={e => updateCombinacion(rIdx, cIdx, e.target.value)}
                                                        />
                                                    </td>
                                                ))}
                                                <td className="p-0.5 text-center">
                                                    {data.combinacionColores.length > 1 && (
                                                        <button onClick={() => removeCombinacionRow(rIdx)} className="text-red-500 hover:text-red-700 text-xs">
                                                            ✕
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button onClick={addCombinacionRow}
                                className={`w-full py-1.5 border-2 border-dashed rounded-xl font-bold text-xs uppercase tracking-wider ${d ? 'border-violet-600 text-violet-400 hover:bg-violet-700/20' : 'border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
                                + Agregar Fila de Colores
                            </button>
                        </div>
                    </Sec>
                </div>

                {/* Panel derecho: vista previa */}
                <div className={`flex-1 overflow-auto p-6 flex flex-col items-center gap-4 ${d ? 'bg-[#2d1f42]' : 'bg-slate-100'}`}>
                    <div className="flex items-center gap-2 shrink-0">
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

                    <div className="shadow-2xl overflow-auto p-2" style={{ transform: `scale(${zoomPreview})`, transformOrigin: 'top center', transition: 'transform 0.2s ease-out' }}>
                        <FichaEstampacionPreview data={data} foto1={foto1} foto2={foto2} foto3={foto3} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FichaEstampacionEditor;
