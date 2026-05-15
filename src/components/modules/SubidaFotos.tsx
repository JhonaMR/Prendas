// ============================================
// COMPONENTE: Subida de Fotos
// Upload y preview de fotos de referencias
// + Foto 3 y archivo PSD (botones en header)
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import apiFichas from '../../services/apiFichas';
import { useDarkMode } from '../../context/DarkModeContext';

declare global {
    interface Window {
        API_CONFIG?: { getApiUrl: () => string; };
    }
}

interface SubidaFotosProps {
    referencia: string;
    foto1: string | null;
    foto2: string | null;
    foto3: string | null;
    archivoPsd: string | null;
    onFoto1Change: (path: string | null) => void;
    onFoto2Change: (path: string | null) => void;
    onFoto3Change: (path: string | null) => void;
    onArchivoPsdChange: (path: string | null) => void;
    readOnly: boolean;
}

const SubidaFotos: React.FC<SubidaFotosProps> = ({
    referencia,
    foto1, foto2, foto3, archivoPsd,
    onFoto1Change, onFoto2Change, onFoto3Change, onArchivoPsdChange,
    readOnly
}) => {
    const { isDark } = useDarkMode();
    const [uploading1, setUploading1] = useState(false);
    const [uploading2, setUploading2] = useState(false);
    const [uploading3, setUploading3] = useState(false);
    const [uploadingPsd, setUploadingPsd] = useState(false);
    const [preview1, setPreview1] = useState<string | null>(null);
    const [preview2, setPreview2] = useState<string | null>(null);
    const [preview3, setPreview3] = useState<string | null>(null);
    const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && fotoAmpliada) {
                setFotoAmpliada(null);
                e.stopImmediatePropagation();
            }
        };
        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [fotoAmpliada]);

    const input1Ref = useRef<HTMLInputElement>(null);
    const input2Ref = useRef<HTMLInputElement>(null);
    const input3Ref = useRef<HTMLInputElement>(null);
    const inputPsdRef = useRef<HTMLInputElement>(null);

    const getBaseUrl = (): string => {
        if (window.API_CONFIG?.getApiUrl) {
            const apiUrl = window.API_CONFIG.getApiUrl();
            return apiUrl.replace('/api', '');
        }
        return `${window.location.protocol}//${window.location.hostname}:3000`;
    };

    const handleFileSelect = async (file: File, numero: 1 | 2 | 3) => {
        if (!file) return;
        if (!file.type.match(/image\/(jpeg|jpg|png)/)) { alert('Solo se permiten imágenes JPG, JPEG o PNG'); return; }
        if (file.size > 5 * 1024 * 1024) { alert('La imagen no debe superar 5MB'); return; }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (numero === 1) setPreview1(result);
            else if (numero === 2) setPreview2(result);
            else setPreview3(result);
        };
        reader.readAsDataURL(file);

        const ext = file.name.split('.').pop();
        const sufijos: Record<1 | 2 | 3, string> = { 1: `${referencia}.${ext}`, 2: `${referencia}-2.${ext}`, 3: `${referencia}-3.${ext}` };
        const renamedFile = new File([file], sufijos[numero], { type: file.type });

        if (numero === 1) setUploading1(true);
        else if (numero === 2) setUploading2(true);
        else setUploading3(true);

        try {
            const result = await apiFichas.uploadFotoFicha(renamedFile);
            if (result.success) {
                if (numero === 1) onFoto1Change(result.data.path);
                else if (numero === 2) onFoto2Change(result.data.path);
                else onFoto3Change(result.data.path);
            } else {
                alert('Error al subir foto: ' + result.message);
                if (numero === 1) setPreview1(null);
                else if (numero === 2) setPreview2(null);
                else setPreview3(null);
            }
        } catch {
            alert('Error de conexión al subir foto');
            if (numero === 1) setPreview1(null);
            else if (numero === 2) setPreview2(null);
            else setPreview3(null);
        } finally {
            if (numero === 1) setUploading1(false);
            else if (numero === 2) setUploading2(false);
            else setUploading3(false);
        }
    };

    const handleMoldeSelect = async (file: File) => {
        if (!file) return;
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext !== 'dxf' && ext !== 'svg') { alert('Solo se permiten archivos DXF o SVG'); return; }
        if (file.size > 100 * 1024 * 1024) { alert('El archivo no debe superar 100MB'); return; }

        setUploadingPsd(true);
        try {
            const nuevoNombre = `${referencia}-molde.${ext}`;
            const renamedFile = new File([file], nuevoNombre, { type: file.type });
            const result = await apiFichas.uploadMoldeFicha(renamedFile);
            if (result.success) {
                onArchivoPsdChange(result.data.path);
            } else {
                alert('Error al subir molde: ' + result.message);
            }
        } catch {
            alert('Error de conexión al subir molde');
        } finally {
            setUploadingPsd(false);
        }
    };

    const eliminarFoto = (numero: 1 | 2 | 3) => {
        if (numero === 1) { setPreview1(null); onFoto1Change(null); if (input1Ref.current) input1Ref.current.value = ''; }
        else if (numero === 2) { setPreview2(null); onFoto2Change(null); if (input2Ref.current) input2Ref.current.value = ''; }
        else { setPreview3(null); onFoto3Change(null); if (input3Ref.current) input3Ref.current.value = ''; }
    };

    // ── Botón compacto para Foto 3 ──────────────────────────────────────────
    const BtnFoto3 = () => {
        const cargada = !!(foto3 || preview3);
        return (
            <>
                <input
                    ref={input3Ref}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f, 3); }}
                    className="hidden"
                    id="foto3-upload"
                />
                <label
                    htmlFor={readOnly ? undefined : 'foto3-upload'}
                    title={cargada ? 'Foto 3 cargada — click para cambiar' : 'Subir Foto 3'}
                    className={`
                        relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl border-2 cursor-pointer
                        transition-all select-none text-xs font-black uppercase tracking-wider
                        ${readOnly ? 'cursor-default opacity-60' : ''}
                        ${cargada
                            ? isDark
                                ? 'bg-emerald-700/40 border-emerald-500 text-emerald-300 hover:bg-emerald-700/60'
                                : 'bg-emerald-50 border-emerald-400 text-emerald-600 hover:bg-emerald-100'
                            : isDark
                                ? 'bg-slate-700/40 border-slate-600 text-slate-500 hover:border-slate-500'
                                : 'bg-slate-100 border-slate-300 text-slate-400 hover:border-slate-400'
                        }
                        ${uploadingPsd ? 'pointer-events-none' : ''}
                    `}
                >
                    {/* Icono imagen */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    <span className="leading-none">3</span>
                    {uploading3 && (
                        <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-t-transparent animate-spin ${isDark ? 'border-violet-400' : 'border-blue-500'}`} />
                    )}
                    {cargada && !uploading3 && (
                        <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                    )}
                </label>
            </>
        );
    };

    // ── Botón compacto para PSD ─────────────────────────────────────────────
    const BtnPsd = () => {
        const cargado = !!archivoPsd;
        const nombreArchivo = archivoPsd ? archivoPsd.split('/').pop() : null;
        return (
            <>
                <input
                    ref={inputPsdRef}
                    type="file"
                    accept=".dxf,.svg"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleMoldeSelect(f); }}
                    className="hidden"
                    id="psd-upload"
                />
                <label
                    htmlFor={readOnly ? undefined : 'psd-upload'}
                    title={cargado ? `Molde cargado: ${nombreArchivo} — click para cambiar` : 'Subir archivo de molde (DXF o SVG)'}
                    className={`
                        relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl border-2 cursor-pointer
                        transition-all select-none text-xs font-black uppercase tracking-wider
                        ${readOnly ? 'cursor-default opacity-60' : ''}
                        ${cargado
                            ? isDark
                                ? 'bg-violet-700/40 border-violet-500 text-violet-300 hover:bg-violet-700/60'
                                : 'bg-violet-50 border-violet-400 text-violet-600 hover:bg-violet-100'
                            : isDark
                                ? 'bg-slate-700/40 border-slate-600 text-slate-500 hover:border-slate-500'
                                : 'bg-slate-100 border-slate-300 text-slate-400 hover:border-slate-400'
                        }
                        ${uploadingPsd ? 'pointer-events-none' : ''}
                    `}
                >
                    {uploadingPsd ? (
                        <span className={`w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin ${isDark ? 'border-violet-400' : 'border-violet-500'}`} />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                    )}
                    <span className="leading-none">Molde</span>
                    {cargado && !uploadingPsd && (
                        <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${isDark ? 'bg-violet-400' : 'bg-violet-500'}`} />
                    )}
                </label>
            </>
        );
    };

    // ── FotoBox (fotos 1 y 2, sin cambios) ─────────────────────────────────
    const FotoBox = ({ numero, foto, preview, uploading, inputRef }: {
        numero: 1 | 2;
        foto: string | null;
        preview: string | null;
        uploading: boolean;
        inputRef: React.RefObject<HTMLInputElement>;
    }) => {
        const src = preview || (foto ? `${getBaseUrl()}${foto}` : null);
        return (
            <div className="flex-1">
                <div
                    className={`relative h-80 rounded-2xl overflow-hidden border-2 group cursor-pointer transition-colors ${isDark ? 'bg-[#3d2d52] border-violet-700' : 'bg-slate-100 border-slate-200'}`}
                    onClick={() => src && setFotoAmpliada(src)}
                >
                    {src ? (
                        <>
                            <img src={src} alt={`Foto ${numero}`} className="w-full h-full object-cover group-hover:brightness-75 transition-all" />
                            {!readOnly && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); eliminarFoto(numero); }}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                            </div>
                        </>
                    ) : uploading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className={`w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-3 transition-colors ${isDark ? 'border-violet-500 border-t-transparent' : 'border-blue-500 border-t-transparent'}`}></div>
                                <p className={`font-bold text-sm transition-colors ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>Subiendo...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${isDark ? 'bg-violet-900/40' : 'bg-slate-200'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-8 h-8 transition-colors ${isDark ? 'text-violet-600' : 'text-slate-400'}`}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                                </div>
                                <p className={`font-bold text-sm transition-colors ${isDark ? 'text-violet-600' : 'text-slate-400'}`}>Sin foto</p>
                            </div>
                        </div>
                    )}
                </div>
                {!readOnly && (
                    <div className="mt-3">
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f, numero); }}
                            className="hidden"
                            id={`foto-upload-${numero}`}
                        />
                        <label
                            htmlFor={`foto-upload-${numero}`}
                            className={`block w-full py-2 px-4 text-white font-black rounded-xl text-center cursor-pointer hover:shadow-lg transition-all text-sm uppercase tracking-wider ${isDark ? 'bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}
                        >
                            {src ? 'Cambiar' : 'Seleccionar'} Foto {numero}
                        </label>
                        <p className={`text-xs font-bold mt-1 text-center transition-colors ${isDark ? 'text-violet-500' : 'text-slate-400'}`}>
                            {numero === 1 ? `${referencia}.jpg` : `${referencia}-2.jpg`}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`p-6 rounded-3xl border shadow-sm transition-colors ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
            {/* Header con título + botones F3 y PSD */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className={`text-sm font-black uppercase tracking-widest transition-colors ${isDark ? 'text-violet-200' : 'text-slate-600'}`}>
                        Fotos de Referencia
                    </h3>
                    <p className={`text-xs font-bold mt-0.5 transition-colors ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>
                        JPG, JPEG o PNG • Máximo 5MB
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <BtnFoto3 />
                    <BtnPsd />
                </div>
            </div>

            {/* Grid fotos 1 y 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FotoBox numero={1} foto={foto1} preview={preview1} uploading={uploading1} inputRef={input1Ref} />
                <FotoBox numero={2} foto={foto2} preview={preview2} uploading={uploading2} inputRef={input2Ref} />
            </div>

            {/* Modal foto ampliada */}
            {fotoAmpliada && (
                <div
                    data-foto-ampliada="true"
                    className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 bg-slate-900/80"
                    onClick={() => setFotoAmpliada(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img src={fotoAmpliada} alt="Foto ampliada" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
                        <button
                            onClick={() => setFotoAmpliada(null)}
                            className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-colors ${isDark ? 'bg-violet-700 hover:bg-violet-800 text-white' : 'bg-white hover:bg-slate-100 text-slate-800'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubidaFotos;
