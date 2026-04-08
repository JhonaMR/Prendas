
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { AppState } from '../types';
import { ConceptoFicha, FichaFormData } from '../types/typesFichas';
import apiFichas from '../services/apiFichas';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    state: AppState;
    user: any;
    onSuccess: (referencia: string) => void;
}

const FichaDisenoImportModal: React.FC<Props> = ({ isOpen, onClose, state, user, onSuccess }) => {
    const [referenciaToSearch, setReferenciaToSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getCellValue = (worksheet: XLSX.WorkSheet, addr: string): any => {
        const cell = worksheet[addr];
        return cell ? cell.v : null;
    };

    const extractTableData = (worksheet: XLSX.WorkSheet, startRow: number, endRow: number): ConceptoFicha[] => {
        const data: ConceptoFicha[] = [];
        for (let r = startRow; r <= endRow; r++) {
            const concepto = getCellValue(worksheet, `B${r}`);
            const um = getCellValue(worksheet, `C${r}`);
            const vlr_unit = Number(getCellValue(worksheet, `D${r}`)) || 0;
            const cant = Number(getCellValue(worksheet, `E${r}`));
            const total = Number(getCellValue(worksheet, `F${r}`)) || 0;

            // Solo procesar si la columna E (Cantidad) tiene datos
            if (cant !== null && !isNaN(cant) && cant !== 0) {
                data.push({
                    concepto: String(concepto || 'Sin concepto').trim(),
                    um: String(um || 'UND').trim(),
                    vlr_unit,
                    cant,
                    total
                });
            }
        }
        return data;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !referenciaToSearch.trim()) return;

        setIsLoading(true);
        try {
            const reader = new FileReader();
            reader.onload = async (evt) => {
                try {
                    const bstr = evt.target?.result;
                    const workbook = XLSX.read(bstr, { type: 'binary' });
                    
                    // Buscar la hoja que se llame como la referencia
                    const sheetName = workbook.SheetNames.find(name => name.trim() === referenciaToSearch.trim());
                    
                    if (!sheetName) {
                        alert(`❌ No se encontró una hoja llamada "${referenciaToSearch}" en el archivo Excel.`);
                        setIsLoading(false);
                        return;
                    }

                    const worksheet = workbook.Sheets[sheetName];

                    // 1. Validar Diseñadora (C11)
                    const disenadoraNombreExcel = String(getCellValue(worksheet, 'C11') || '').trim();
                    const targetDisenadora = (state.disenadoras || []).find(d => 
                        d.nombre.toLowerCase().trim() === disenadoraNombreExcel.toLowerCase()
                    );

                    if (!targetDisenadora) {
                        alert(`🛑 ERROR: La diseñadora "${disenadoraNombreExcel}" no existe en el sistema. Debe crearla primero para poder realizar la importación.`);
                        setIsLoading(false);
                        return;
                    }

                    // 2. Extraer datos básicos
                    const refExcel = String(getCellValue(worksheet, 'C4') || '').trim();
                    const marca = String(getCellValue(worksheet, 'C5') || '').trim();
                    const descripcion = String(getCellValue(worksheet, 'C8') || '').trim();
                    const novedad = String(getCellValue(worksheet, 'C10') || '').trim();
                    const muestra1 = String(getCellValue(worksheet, 'I18') || '').trim();
                    const muestra2 = String(getCellValue(worksheet, 'I19') || '').trim();

                    // 3. Extraer Observaciones (H7 a K15)
                    let observacionesParts: string[] = [];
                    for (let r = 7; r <= 15; r++) {
                        for (let c = 7; c <= 10; c++) { // H, I, J, K are 7, 8, 9, 10 (0-indexed G is 6, H is 7)
                            const addr = XLSX.utils.encode_cell({ r: r - 1, c: c });
                            const val = getCellValue(worksheet, addr);
                            if (val) observacionesParts.push(String(val).trim());
                        }
                    }
                    const observaciones = observacionesParts.join(' ');

                    // 4. Extraer tablas de costos
                    const materiaPrima = extractTableData(worksheet, 23, 30);
                    const manoObra = extractTableData(worksheet, 35, 53);
                    const insumosDirectos = extractTableData(worksheet, 58, 66);
                    const insumosIndirectos = extractTableData(worksheet, 71, 77);
                    let provisiones = extractTableData(worksheet, 81, 84);

                    // 4.1 Calcular PROV. DSCTO CCIAL (Fórmula estándar del sistema)
                    const sumMP = materiaPrima.reduce((acc, i) => acc + (i.total || 0), 0);
                    const sumMO = manoObra.reduce((acc, i) => acc + (i.total || 0), 0);
                    const sumID = insumosDirectos.reduce((acc, i) => acc + (i.total || 0), 0);
                    const sumII = insumosIndirectos.reduce((acc, i) => acc + (i.total || 0), 0);
                    
                    const sumaBase = sumMP + sumMO + sumID + sumII;
                    const valorDesctoComercial = Math.round(sumaBase * 1.35 * 0.70 * 0.19);

                    // Asegurar que PROV. DSCTO CCIAL esté al final
                    provisiones = provisiones.filter(p => p.concepto !== 'PROV. DSCTO CCIAL');
                    provisiones.push({
                        concepto: 'PROV. DSCTO CCIAL',
                        um: 'UNIDAD',
                        vlr_unit: valorDesctoComercial,
                        cant: 1,
                        total: valorDesctoComercial
                    });

                    // 5. Preparar objeto final
                    const fichaData: FichaFormData = {
                        referencia: refExcel || referenciaToSearch,
                        disenadoraId: targetDisenadora.id,
                        descripcion,
                        marca,
                        novedad,
                        muestra1,
                        muestra2,
                        observaciones,
                        foto1: null,
                        foto2: null,
                        materiaPrima,
                        manoObra,
                        insumosDirectos,
                        insumosIndirectos,
                        provisiones
                    };

                    // Guardar en el sistema
                    const response = await apiFichas.createFichaDiseno(fichaData, user.name);
                    
                    if (response.success) {
                        alert(`✅ Ficha ${fichaData.referencia} importada con éxito.`);
                        onSuccess(fichaData.referencia);
                        onClose();
                    } else {
                        alert(`❌ Error al importar: ${response.message}`);
                    }
                } catch (err) {
                    console.error(err);
                    alert('❌ Error procesando el contenido del archivo.');
                }
                setIsLoading(false);
            };
            reader.readAsBinaryString(file);
        } catch (err) {
            console.error(err);
            alert('❌ Error al cargar el archivo.');
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] shadow-2xl max-w-lg w-full p-8 border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Importación Especial</h3>
                        <p className="text-sm text-slate-500 font-bold">Carga masiva desde Libro de Costos</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                            </div>
                            <p className="text-sm text-blue-700 font-bold leading-tight">
                                Ingrese la referencia que desea importar. El sistema buscará una hoja con ese nombre en el archivo Excel.
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Número de Referencia</label>
                        <input 
                            type="text" 
                            value={referenciaToSearch} 
                            onChange={e => setReferenciaToSearch(e.target.value)} 
                            placeholder="Ej: 13098"
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                        />
                    </div>

                    <div className="relative">
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept=".xlsx, .xls" 
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={!referenciaToSearch.trim() || isLoading}
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={!referenciaToSearch.trim() || isLoading}
                            className={`w-full py-5 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-dashed transition-all
                                ${!referenciaToSearch.trim() || isLoading 
                                    ? 'bg-slate-50 border-slate-100 cursor-not-allowed opacity-50' 
                                    : 'bg-white border-blue-200 hover:border-blue-500 hover:bg-blue-50 text-blue-600'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33A3 3 0 0116.5 19.5H6.75z" /></svg>
                            <span className="font-black uppercase tracking-wide text-xs">
                                {isLoading ? 'Procesando...' : 'Seleccionar Libro de Excel'}
                            </span>
                        </button>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-xs"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FichaDisenoImportModal;

