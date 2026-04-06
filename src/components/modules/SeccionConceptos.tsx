// ============================================
// COMPONENTE: Sección Conceptos
// Tabla editable de conceptos para fichas
// ============================================

import React, { useRef, useState } from 'react';
import { ConceptoFicha, TipoMaterial } from '../../types/typesFichas';
import DecimalInput from '../DecimalInput';

// Input con $ como prefijo visual, type="number" internamente
const CurrencyInput: React.FC<{ value: number; onChange: (v: number) => void; readOnly: boolean }> = ({ value, onChange, readOnly }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-100">
            <span className="px-2 font-black text-slate-400 select-none">$</span>
            <input
                ref={inputRef}
                type="number"
                value={value}
                onChange={e => onChange(Number(e.target.value))}
                onFocus={() => setTimeout(() => inputRef.current?.select(), 0)}
                readOnly={readOnly}
                className="w-full py-2 pr-3 bg-transparent font-black text-right focus:outline-none"
            />
        </div>
    );
};

interface SeccionConceptosProps {
    titulo: string;
    color: 'pink' | 'blue' | 'slate' | 'orange' | 'red';
    conceptos: ConceptoFicha[];
    onChange: (conceptos: ConceptoFicha[]) => void;
    readOnly: boolean;
    mostrarTipo?: boolean;
    totalesOtrosCostos?: { totalMP: number; totalMO: number; totalID: number; totalII: number };
}

const SeccionConceptos: React.FC<SeccionConceptosProps> = ({
    titulo, color, conceptos, onChange, readOnly, mostrarTipo = false, totalesOtrosCostos
}) => {
    const dragIndex = useRef<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handleDragStart = (i: number) => { dragIndex.current = i; };
    const handleDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOverIndex(i); };
    const handleDrop = (i: number) => {
        if (dragIndex.current === null || dragIndex.current === i) { setDragOverIndex(null); return; }
        const arr = [...conceptos];
        const [moved] = arr.splice(dragIndex.current, 1);
        arr.splice(i, 0, moved);
        onChange(arr);
        dragIndex.current = null;
        setDragOverIndex(null);
    };
    const handleDragEnd = () => { dragIndex.current = null; setDragOverIndex(null); };
    const colorMap = {
        pink: { bg: 'bg-pink-500', text: 'text-pink-700', border: 'border-pink-200', bgLight: 'bg-pink-50' },
        blue: { bg: 'bg-blue-600', text: 'text-blue-700', border: 'border-blue-200', bgLight: 'bg-blue-50' },
        slate: { bg: 'bg-slate-700', text: 'text-slate-700', border: 'border-slate-200', bgLight: 'bg-slate-50' },
        orange: { bg: 'bg-orange-600', text: 'text-orange-700', border: 'border-orange-200', bgLight: 'bg-orange-50' },
        red: { bg: 'bg-red-600', text: 'text-red-700', border: 'border-red-200', bgLight: 'bg-red-50' },
    };
    const c = colorMap[color];

    // Recalcular PROV. DSCTO CCIAL cuando cambien los totales
    React.useEffect(() => {
        if (titulo === 'PROVISIONES' && totalesOtrosCostos && conceptos.length > 0) {
            const calcDesctoComercial = () => {
                const { totalMP, totalMO, totalID, totalII } = totalesOtrosCostos;
                const suma = totalMP + totalMO + totalID + totalII;
                const conMargen = suma * 1.35;
                const descto70 = conMargen * 0.70;
                const desctoFinal = descto70 * 0.19;
                return Math.round(desctoFinal);
            };

            // Buscar si existe PROV. DSCTO CCIAL
            const indexDescto = conceptos.findIndex(c => c.concepto === 'PROV. DSCTO CCIAL');
            if (indexDescto !== -1) {
                const nuevoValor = calcDesctoComercial();
                if (conceptos[indexDescto].vlr_unit !== nuevoValor) {
                    const nuevosConceptos = [...conceptos];
                    nuevosConceptos[indexDescto] = {
                        ...nuevosConceptos[indexDescto],
                        vlr_unit: nuevoValor,
                        total: nuevoValor * (nuevosConceptos[indexDescto].cant || 1)
                    };
                    onChange(nuevosConceptos);
                }
            }
        }
    }, [totalesOtrosCostos, titulo, conceptos, onChange]);

    const agregar = () => {
        let nuevosConceptos = [...conceptos];
        
        // Agregar valores base según la sección
        if (titulo === 'MANO DE OBRA') {
            if (conceptos.length === 0) {
                nuevosConceptos = [
                    { concepto: 'EMPAQUE', um: 'UNIDAD', vlr_unit: 200, cant: 1, total: 200 },
                    { concepto: 'CORTE', um: 'UNIDAD', vlr_unit: 500, cant: 1, total: 500 }
                ];
            } else {
                nuevosConceptos.unshift({ concepto: 'NUEVO CONCEPTO', um: 'UNIDAD', vlr_unit: 0, cant: 1, total: 0 });
            }
        } else if (titulo === 'INSUMOS DIRECTOS') {
            if (conceptos.length === 0) {
                nuevosConceptos = [
                    { concepto: 'MARQUILLA', um: 'UNIDAD', vlr_unit: 70, cant: 1, total: 70 },
                    { concepto: 'MARQUILLA TECNICA', um: 'UNIDAD', vlr_unit: 10, cant: 1, total: 10 },
                    { concepto: 'ETIQUETA', um: 'UNIDAD', vlr_unit: 90, cant: 1, total: 90 },
                    { concepto: 'CODIGO BARRAS', um: 'UNIDAD', vlr_unit: 10, cant: 2, total: 20 },
                    { concepto: 'BOLSA', um: 'UNIDAD', vlr_unit: 94, cant: 1, total: 94 }
                ];
            } else {
                nuevosConceptos.unshift({ concepto: 'NUEVO CONCEPTO', um: 'UNIDAD', vlr_unit: 0, cant: 1, total: 0 });
            }
        } else if (titulo === 'PROVISIONES') {
            if (conceptos.length === 0) {
                const calcDesctoComercial = () => {
                    if (!totalesOtrosCostos) return 0;
                    const { totalMP, totalMO, totalID, totalII } = totalesOtrosCostos;
                    const suma = totalMP + totalMO + totalID + totalII;
                    const conMargen = suma * 1.35;
                    const descto70 = conMargen * 0.70;
                    const desctoFinal = descto70 * 0.19;
                    return Math.round(desctoFinal);
                };
                
                nuevosConceptos = [
                    { concepto: 'PROV. CARTERA', um: 'UNIDAD', vlr_unit: 200, cant: 1, total: 200 },
                    { concepto: 'SERVICIOS CONFECCIONISTAS', um: 'UNIDAD', vlr_unit: 200, cant: 1, total: 200 },
                    { concepto: 'TRANSPORTE', um: 'UNIDAD', vlr_unit: 0, cant: 1, total: 0 },
                    { concepto: 'PROV. DSCTO CCIAL', um: 'UNIDAD', vlr_unit: calcDesctoComercial(), cant: 1, total: calcDesctoComercial() }
                ];
            } else {
                nuevosConceptos.unshift({ concepto: 'NUEVO CONCEPTO', um: 'UNIDAD', vlr_unit: 0, cant: 1, total: 0 });
            }
        } else {
            nuevosConceptos.unshift({ concepto: 'NUEVO CONCEPTO', tipo: mostrarTipo ? 'SESGO' : undefined, um: 'UNIDAD', vlr_unit: 0, cant: 1, total: 0 });
        }
        
        onChange(nuevosConceptos);
    };

    const eliminar = (i: number) => onChange(conceptos.filter((_, idx) => idx !== i));

    const actualizar = (i: number, campo: keyof ConceptoFicha, valor: any) => {
        const arr = [...conceptos];
        arr[i] = { ...arr[i], [campo]: valor };
        if (campo === 'vlr_unit' || campo === 'cant') {
            arr[i].total = (arr[i].vlr_unit || 0) * (arr[i].cant || 0);
        }
        onChange(arr);
    };

    const total = conceptos.reduce((acc, c) => acc + (c.total || 0), 0);

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className={`${c.bg} p-4 flex items-center justify-between`}>
                <h3 className="text-white font-black uppercase tracking-wider text-sm">{titulo}</h3>
                {!readOnly && (
                    <button onClick={agregar} className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl font-black text-white text-xs uppercase tracking-wider transition-all flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Agregar
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className={`${c.bgLight} border-b ${c.border}`}>
                            {!readOnly && <th className="px-2 py-3 w-8"></th>}
                            <th className="px-4 py-3 font-black text-slate-600 uppercase tracking-widest">Concepto</th>
                            {mostrarTipo && <th className="px-3 py-3 font-black text-slate-600 uppercase tracking-widest w-32">Tipo</th>}
                            <th className="px-3 py-3 font-black text-slate-600 uppercase tracking-widest w-28">U/M</th>
                            <th className="px-3 py-3 font-black text-slate-600 uppercase tracking-widest text-right w-32">VLR. UNIT</th>
                            <th className="px-3 py-3 font-black text-slate-600 uppercase tracking-widest text-center w-24">CANT.</th>
                            <th className="px-3 py-3 font-black text-slate-600 uppercase tracking-widest text-right w-32">TOTAL</th>
                            {!readOnly && <th className="px-3 py-3 w-16"></th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {conceptos.length === 0 ? (
                            <tr><td colSpan={mostrarTipo ? (readOnly ? 6 : 7) : (readOnly ? 5 : 6)} className="px-4 py-8 text-center text-slate-400 italic">No hay conceptos agregados</td></tr>
                        ) : conceptos.map((con, i) => (
                            <tr key={i}
                                draggable={!readOnly}
                                onDragStart={() => handleDragStart(i)}
                                onDragOver={e => handleDragOver(e, i)}
                                onDrop={() => handleDrop(i)}
                                onDragEnd={handleDragEnd}
                                className={`hover:bg-slate-50 transition-colors ${dragOverIndex === i ? `border-t-2 ${c.border}` : ''}`}>
                                {!readOnly && (
                                    <td className="px-2 py-3 text-center">
                                        <span className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing select-none text-base leading-none">⠿</span>
                                    </td>
                                )}
                                <td className="px-4 py-3">
                                    <input type="text" value={con.concepto} onChange={e => actualizar(i, 'concepto', e.target.value)} readOnly={readOnly}
                                        className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold ${c.text} focus:ring-2 focus:ring-blue-100 ${readOnly ? 'cursor-default' : ''}`} />
                                </td>
                                {mostrarTipo && (
                                    <td className="px-3 py-3">
                                        <select value={con.tipo || 'SESGO'} onChange={e => actualizar(i, 'tipo', e.target.value as TipoMaterial)} disabled={readOnly}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 focus:ring-2 focus:ring-blue-100">
                                            <option value="TELA">TELA</option>
                                            <option value="SESGO">SESGO</option>
                                            <option value="ELÁSTICO">ELÁSTICO</option>
                                            <option value="OTRO">OTRO</option>
                                        </select>
                                    </td>
                                )}
                                <td className="px-3 py-3">
                                    <select value={con.um} onChange={e => actualizar(i, 'um', e.target.value)} disabled={readOnly}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 text-xs focus:ring-2 focus:ring-blue-100">
                                        <option value="METRO">METRO</option>
                                        <option value="UNIDAD">UNIDAD</option>
                                        <option value="PRENDA">PRENDA</option>
                                        <option value="KILOGRAMO">KG</option>
                                    </select>
                                </td>
                                <td className="px-3 py-3">
                                    <CurrencyInput
                                        value={con.vlr_unit}
                                        onChange={val => actualizar(i, 'vlr_unit', val)}
                                        readOnly={readOnly}
                                    />
                                </td>
                                <td className="px-3 py-3">
                                    <DecimalInput
                                        value={con.cant}
                                        onChange={val => actualizar(i, 'cant', val)}
                                        readOnly={readOnly}
                                        onFocus={e => e.target.select()}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-black text-center focus:ring-2 focus:ring-blue-100"
                                    />
                                </td>
                                <td className="px-3 py-3 text-right">
                                    <span className={`font-black ${c.text} text-base`}>$ {con.total.toLocaleString()}</span>
                                </td>
                                {!readOnly && (
                                    <td className="px-3 py-3 text-center">
                                        <button onClick={() => eliminar(i)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className={`${c.bgLight} border-t-2 ${c.border}`}>
                            <td colSpan={mostrarTipo ? (readOnly ? 5 : 6) : (readOnly ? 4 : 5)} className="px-4 py-4 font-black text-slate-600 uppercase tracking-widest text-right text-sm">Total {titulo}</td>
                            <td className="px-3 py-4 text-right w-32"><span className={`font-black ${c.text} text-xl`}>$ {total.toLocaleString()}</span></td>
                            {!readOnly && <td className="w-16"></td>}
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default SeccionConceptos;
