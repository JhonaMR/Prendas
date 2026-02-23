// ============================================
// COMPONENTE: Subida de Fotos
// Upload y preview de fotos de referencias
// ============================================

import React, { useState, useRef } from 'react';
import apiFichas from '../../services/apiFichas';

declare global {
    interface Window {
        API_CONFIG?: { getApiUrl: () => string; };
    }
}

interface SubidaFotosProps {
    referencia: string;
    foto1: string | null;
    foto2: string | null;
    onFoto1Change: (path: string | null) => void;
    onFoto2Change: (path: string | null) => void;
    readOnly: boolean;
}

const SubidaFotos: React.FC<SubidaFotosProps> = ({ referencia, foto1, foto2, onFoto1Change, onFoto2Change, readOnly }) => {
    const [uploading1, setUploading1] = useState(false);
    const [uploading2, setUploading2] = useState(false);
    const [preview1, setPreview1] = useState<string | null>(null);
    const [preview2, setPreview2] = useState<string | null>(null);

    const input1Ref = useRef<HTMLInputElement>(null);
    const input2Ref = useRef<HTMLInputElement>(null);

    // Usar la misma URL base que el proyecto (puerto 3000 por defecto)
    const getBaseUrl = (): string => {
        if (window.API_CONFIG?.getApiUrl) {
            const apiUrl = window.API_CONFIG.getApiUrl();
            return apiUrl.replace('/api', '');
        }
        return `${window.location.protocol}//${window.location.hostname}:3000`;
    };

    const handleFileSelect = async (file: File, numero: 1 | 2) => {
        if (!file) return;
        if (!file.type.match(/image\/(jpeg|jpg|png)/)) { alert('Solo se permiten imágenes JPG, JPEG o PNG'); return; }
        if (file.size > 5 * 1024 * 1024) { alert('La imagen no debe superar 5MB'); return; }

        const reader = new FileReader();
        reader.onload = (e) => {
            if (numero === 1) setPreview1(e.target?.result as string);
            else setPreview2(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        const ext = file.name.split('.').pop();
        const nuevoNombre = numero === 1 ? `${referencia}.${ext}` : `${referencia}-2.${ext}`;
        const renamedFile = new File([file], nuevoNombre, { type: file.type });

        if (numero === 1) setUploading1(true); else setUploading2(true);

        try {
            const result = await apiFichas.uploadFotoFicha(renamedFile);
            if (result.success) {
                if (numero === 1) onFoto1Change(result.data.path);
                else onFoto2Change(result.data.path);
            } else {
                alert('Error al subir foto: ' + result.message);
                if (numero === 1) setPreview1(null); else setPreview2(null);
            }
        } catch {
            alert('Error de conexión al subir foto');
            if (numero === 1) setPreview1(null); else setPreview2(null);
        } finally {
            if (numero === 1) setUploading1(false); else setUploading2(false);
        }
    };

    const eliminarFoto = (numero: 1 | 2) => {
        if (numero === 1) { setPreview1(null); onFoto1Change(null); if (input1Ref.current) input1Ref.current.value = ''; }
        else { setPreview2(null); onFoto2Change(null); if (input2Ref.current) input2Ref.current.value = ''; }
    };

    const FotoBox = ({ numero, foto, preview, uploading, inputRef }: { numero: 1 | 2; foto: string | null; preview: string | null; uploading: boolean; inputRef: React.RefObject<HTMLInputElement>; }) => {
        const src = preview || (foto ? `${getBaseUrl()}${foto}` : null);
        return (
            <div className="flex-1">
                <div className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden border-2 border-slate-200 group">
                    {src ? (
                        <>
                            <img src={src} alt={`Foto ${numero}`} className="w-full h-full object-cover" />
                            {!readOnly && (
                                <button onClick={() => eliminarFoto(numero)} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                        </>
                    ) : uploading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-slate-500 font-bold text-sm">Subiendo...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                                </div>
                                <p className="text-slate-400 font-bold text-sm">Sin foto</p>
                            </div>
                        </div>
                    )}
                </div>
                {!readOnly && (
                    <div className="mt-3">
                        <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f, numero); }} className="hidden" id={`foto-upload-${numero}`} />
                        <label htmlFor={`foto-upload-${numero}`} className="block w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-xl text-center cursor-pointer hover:shadow-lg transition-all text-sm uppercase tracking-wider">
                            {src ? 'Cambiar' : 'Seleccionar'} Foto {numero}
                        </label>
                        <p className="text-xs text-slate-400 font-bold mt-1 text-center">{numero === 1 ? `${referencia}.jpg` : `${referencia}-2.jpg`}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="mb-4">
                <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest">Fotos de Referencia</h3>
                <p className="text-xs text-slate-400 font-bold mt-1">JPG, JPEG o PNG • Máximo 5MB por foto</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FotoBox numero={1} foto={foto1} preview={preview1} uploading={uploading1} inputRef={input1Ref} />
                <FotoBox numero={2} foto={foto2} preview={preview2} uploading={uploading2} inputRef={input2Ref} />
            </div>
        </div>
    );
};

export default SubidaFotos;
