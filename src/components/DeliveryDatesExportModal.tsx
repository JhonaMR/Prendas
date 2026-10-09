import React, { useState, useEffect } from 'react';
import { DeliveryDate } from '../types';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import TextAutocomplete from './TextAutocomplete';

interface DeliveryDatesExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryDates: DeliveryDate[];
  confeccionistasSuggestions: string[];
  referenciasSuggestions: string[];
  procesosSuggestions: string[];
  isDark: boolean;
}

const DeliveryDatesExportModal: React.FC<DeliveryDatesExportModalProps> = ({
  isOpen,
  onClose,
  deliveryDates,
  confeccionistasSuggestions,
  referenciasSuggestions,
  procesosSuggestions,
  isDark,
}) => {
  const [exportAllConfeccionistas, setExportAllConfeccionistas] = useState(true);
  const [selectedConfeccionistas, setSelectedConfeccionistas] = useState<string[]>([]);
  const [confeccionistaInput, setConfeccionistaInput] = useState('');
  
  const [referenceFilter, setReferenceFilter] = useState('');
  const [processFilter, setProcessFilter] = useState('');
  const [onlyHighPriority, setOnlyHighPriority] = useState(false);
  const [hideDelivered, setHideDelivered] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf'>('excel');

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddConfeccionista = () => {
    if (confeccionistaInput.trim() && !selectedConfeccionistas.includes(confeccionistaInput.trim())) {
      setSelectedConfeccionistas([...selectedConfeccionistas, confeccionistaInput.trim()]);
      setConfeccionistaInput('');
    }
  };

  const handleRemoveConfeccionista = (name: string) => {
    setSelectedConfeccionistas(selectedConfeccionistas.filter(c => c !== name));
  };

  const handleExport = async () => {
    // 1. Filtrar los datos
    let dataToExport = deliveryDates;

    if (!exportAllConfeccionistas) {
      const activeSelections = [...selectedConfeccionistas];
      if (confeccionistaInput.trim() && !activeSelections.includes(confeccionistaInput.trim())) {
        activeSelections.push(confeccionistaInput.trim());
      }

      if (activeSelections.length === 0) {
        alert('Debes escribir o agregar al menos un confeccionista a la lista.');
        return;
      }

      dataToExport = dataToExport.filter(d => 
        activeSelections.some(sc => d.confeccionistaId.toLowerCase().trim() === sc.toLowerCase().trim())
      );
    }

    if (referenceFilter) {
      dataToExport = dataToExport.filter(d => 
        d.referenceId.toLowerCase().includes(referenceFilter.toLowerCase())
      );
    }

    if (processFilter) {
      dataToExport = dataToExport.filter(d => 
        d.process.toLowerCase().includes(processFilter.toLowerCase())
      );
    }

    if (hideDelivered) {
      dataToExport = dataToExport.filter(d => !d.deliveryDate);
    }

    if (onlyHighPriority) {
      dataToExport = dataToExport.filter(d => {
        if (d.deliveryDate) return false;
        const expectedDate = new Date(d.expectedDate);
        const today = new Date();
        const diff = Math.round((today.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 3;
      });
    }

    if (dataToExport.length === 0) {
      alert('No hay datos para exportar con los filtros seleccionados.');
      return;
    }

    // Calcular días de diferencia (utilidad)
    const calcDaysDiff = (date1: string, date2: string | null) => {
      if (!date1 || !date2) return null;
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    };

    // Formatear filas para exportación
    const exportRows = dataToExport.map(row => {
      const difFechas = calcDaysDiff(row.expectedDate, row.deliveryDate);
      const rotInicial = calcDaysDiff(row.sendDate, row.expectedDate);
      const rotFinal = calcDaysDiff(row.sendDate, row.deliveryDate);
      const rotDiff = rotInicial !== null && rotFinal !== null ? rotInicial - rotFinal : null;

      return [
        row.confeccionistaId,
        row.referenceId,
        row.quantity,
        row.sendDate,
        row.expectedDate,
        row.rem || '-',
        row.deliveryDate || 'Pendiente',
        difFechas !== null ? difFechas : '-',
        rotInicial !== null ? rotInicial : '-',
        rotFinal !== null ? rotFinal : '-',
        rotDiff !== null ? rotDiff : '-',
        row.process || '-',
        row.observation || '-'
      ];
    });

    const headers = [
      'Confeccionista',
      'Referencia',
      'Cantidad',
      'Fecha Envío',
      'Fecha Presup. Entrega',
      'REM',
      'Fecha Entrega Real',
      'Dif Fechas',
      'Rotación Inicial',
      'Rotación Final',
      'Rot. Final vs Inicial',
      'Proceso',
      'Observación'
    ];

    const todayStr = new Date().toLocaleDateString('es-CO');

    if (exportFormat === 'excel') {
      const wsData = [
        ['Reporte de Fechas de Entrega y Producción'],
        [`Generado el: ${todayStr}`],
        [],
        headers,
        ...exportRows
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Ajustar anchos de columna básicos
      ws['!cols'] = [
        { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 20 }, 
        { wch: 10 }, { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, 
        { wch: 18 }, { wch: 15 }, { wch: 30 }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'FechasEntrega');
      XLSX.writeFile(wb, `Reporte_Fechas_Entrega_${Date.now()}.xlsx`);
      onClose();

    } else {
      // Exportar PDF
      const doc = new jsPDF({ orientation: 'landscape' });
      
      doc.setFontSize(16);
      doc.text('Reporte de Fechas de Entrega y Producción', 14, 15);
      doc.setFontSize(10);
      doc.text(`Generado el: ${todayStr}`, 14, 22);
      
      // Resumen de filtros
      let yFilterPos = 28;
      doc.setFontSize(9);
      doc.text(`Filtros: Confeccionistas: ${exportAllConfeccionistas ? 'Todos' : selectedConfeccionistas.length + ' seleccionados'}`, 14, yFilterPos);
      if (referenceFilter) { yFilterPos+=5; doc.text(`Referencia: ${referenceFilter}`, 14, yFilterPos); }
      if (processFilter) { yFilterPos+=5; doc.text(`Proceso: ${processFilter}`, 14, yFilterPos); }
      if (onlyHighPriority) { yFilterPos+=5; doc.text(`* Solo lotes con atención prioritaria`, 14, yFilterPos); }
      if (hideDelivered) { yFilterPos+=5; doc.text(`* Ocultando entregados`, 14, yFilterPos); }

      try {
        const autoTableModule = await import('jspdf-autotable');
        const autoTable = autoTableModule.default || autoTableModule;
        autoTable(doc, {
          startY: yFilterPos + 5,
          head: [headers],
          body: exportRows,
          styles: { fontSize: 7, cellPadding: 1 },
          headStyles: { fillColor: [79, 70, 229] }, // Indigo 600
          theme: 'grid',
        });
        doc.save(`Reporte_Fechas_Entrega_${Date.now()}.pdf`);
        onClose();
      } catch (err) {
        console.error('Error al generar PDF:', err);
        alert('Hubo un error al generar el PDF. Verifica la consola para más detalles.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className={`w-full max-w-2xl rounded-3xl shadow-2xl p-6 transition-colors duration-300 ${
          isDark ? 'bg-[#3d2d52] border border-violet-700/50' : 'bg-white border border-slate-100'
        }`}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-2xl font-black tracking-tighter ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>
              Exportar Reporte
            </h2>
            <p className={`text-xs font-bold ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>
              Filtra y descarga el estado de producción
            </p>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-[#4a3a63] text-violet-300' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          
          {/* Confeccionistas Filter */}
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#4a3a63]/50 border-violet-700' : 'bg-slate-50 border-slate-200'}`}>
            <h3 className={`text-sm font-black uppercase mb-3 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>
              1. Confeccionistas
            </h3>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={exportAllConfeccionistas} 
                  onChange={() => setExportAllConfeccionistas(true)}
                  className={`focus:ring-2 ${isDark ? 'text-violet-500 bg-[#3d2d52] border-violet-600 focus:ring-violet-500' : 'text-indigo-600'}`}
                />
                <span className={`text-xs font-bold ${isDark ? 'text-violet-100' : 'text-slate-700'}`}>Todos los confeccionistas</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={!exportAllConfeccionistas} 
                  onChange={() => setExportAllConfeccionistas(false)}
                  className={`focus:ring-2 ${isDark ? 'text-violet-500 bg-[#3d2d52] border-violet-600 focus:ring-violet-500' : 'text-indigo-600'}`}
                />
                <span className={`text-xs font-bold ${isDark ? 'text-violet-100' : 'text-slate-700'}`}>Elegir específicos</span>
              </label>
            </div>

            {!exportAllConfeccionistas && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <TextAutocomplete
                      value={confeccionistaInput}
                      suggestions={confeccionistasSuggestions}
                      onChange={setConfeccionistaInput}
                      placeholder="Buscar confeccionista..."
                      isDark={isDark}
                    />
                  </div>
                  <button 
                    onClick={handleAddConfeccionista}
                    className={`p-2 rounded-xl text-white font-black hover:scale-105 transition-transform ${isDark ? 'bg-violet-600 hover:bg-violet-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </div>
                
                {selectedConfeccionistas.length > 0 && (
                  <div>
                    <p className={`text-[10px] font-bold mb-2 uppercase ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>
                      Seleccionados: {selectedConfeccionistas.length}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedConfeccionistas.map((conf, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-violet-900/50 text-violet-200 border border-violet-700' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}`}
                        >
                          {conf}
                          <button 
                            onClick={() => handleRemoveConfeccionista(conf)}
                            className="hover:text-red-500 ml-1 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Otros Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-black uppercase mb-1 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>
                Referencia
              </label>
              <TextAutocomplete
                value={referenceFilter}
                suggestions={referenciasSuggestions}
                onChange={setReferenceFilter}
                placeholder="Ej. REF-001"
                isDark={isDark}
              />
            </div>
            <div>
              <label className={`block text-xs font-black uppercase mb-1 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>
                Proceso
              </label>
              <TextAutocomplete
                value={processFilter}
                suggestions={procesosSuggestions}
                onChange={setProcessFilter}
                placeholder="Ej. Confección"
                isDark={isDark}
              />
            </div>
          </div>

          {/* Toggles Prioridad y Entregados */}
          <div className="flex flex-col gap-3">
            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              onlyHighPriority ? (isDark ? 'bg-red-900/30 border-red-700/50' : 'bg-red-50 border-red-200') : (isDark ? 'bg-[#4a3a63]/50 border-violet-700/50' : 'bg-slate-50 border-slate-200')
            }`}>
              <input 
                type="checkbox" 
                checked={onlyHighPriority}
                onChange={(e) => setOnlyHighPriority(e.target.checked)}
                className={`w-5 h-5 rounded focus:ring-2 ${isDark ? 'bg-[#3d2d52] border-red-600 text-red-500 focus:ring-red-500' : 'text-red-500 focus:ring-red-500'}`}
              />
              <div>
                <p className={`text-sm font-black ${isDark ? (onlyHighPriority ? 'text-red-400' : 'text-violet-100') : (onlyHighPriority ? 'text-red-700' : 'text-slate-700')}`}>
                  Lotes con atención prioritaria
                </p>
                <p className={`text-[10px] font-bold ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>
                  Solo lotes vencidos hace más de 3 días
                </p>
              </div>
            </label>

            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              hideDelivered ? (isDark ? 'bg-blue-900/30 border-blue-700/50' : 'bg-blue-50 border-blue-200') : (isDark ? 'bg-[#4a3a63]/50 border-violet-700/50' : 'bg-slate-50 border-slate-200')
            }`}>
              <input 
                type="checkbox" 
                checked={hideDelivered}
                onChange={(e) => setHideDelivered(e.target.checked)}
                className={`w-5 h-5 rounded focus:ring-2 ${isDark ? 'bg-[#3d2d52] border-blue-600 text-blue-500 focus:ring-blue-500' : 'text-blue-600 focus:ring-blue-500'}`}
              />
              <div>
                <p className={`text-sm font-black ${isDark ? (hideDelivered ? 'text-blue-400' : 'text-violet-100') : (hideDelivered ? 'text-blue-700' : 'text-slate-700')}`}>
                  Ocultar entregadas
                </p>
                <p className={`text-[10px] font-bold ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>
                  Solo exportar lotes pendientes
                </p>
              </div>
            </label>
          </div>

          {/* Formato */}
          <div>
            <h3 className={`text-sm font-black uppercase mb-3 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>
              2. Formato de Exportación
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setExportFormat('excel')}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  exportFormat === 'excel' 
                    ? (isDark ? 'border-green-500 bg-green-900/30' : 'border-green-500 bg-green-50') 
                    : (isDark ? 'border-violet-700/50 bg-[#4a3a63]/50 hover:bg-[#4a3a63]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100')
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-8 h-8 ${exportFormat === 'excel' ? 'text-green-500' : (isDark ? 'text-violet-400' : 'text-slate-400')}`}>
                  <path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm14.25 6V7.5a1.5 1.5 0 0 0-1.5-1.5h-3.75v6h5.25Zm-5.25 1.5v6h3.75a1.5 1.5 0 0 0 1.5-1.5v-4.5h-5.25Zm-1.5-7.5v6H5.25V7.5a1.5 1.5 0 0 1 1.5-1.5h3.75Zm-5.25 7.5v4.5a1.5 1.5 0 0 0 1.5 1.5h3.75v-6H5.25Z" clipRule="evenodd" />
                </svg>
                <span className={`font-black ${exportFormat === 'excel' ? 'text-green-500' : (isDark ? 'text-violet-200' : 'text-slate-600')}`}>
                  Excel
                </span>
              </button>

              <button
                onClick={() => setExportFormat('pdf')}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  exportFormat === 'pdf' 
                    ? (isDark ? 'border-red-500 bg-red-900/30' : 'border-red-500 bg-red-50') 
                    : (isDark ? 'border-violet-700/50 bg-[#4a3a63]/50 hover:bg-[#4a3a63]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100')
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-8 h-8 ${exportFormat === 'pdf' ? 'text-red-500' : (isDark ? 'text-violet-400' : 'text-slate-400')}`}>
                  <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875Zm5.845 17.03a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72V12a.75.75 0 0 0-1.5 0v4.19l-1.72-1.72a.75.75 0 0 0-1.06 1.06l3 3Z" clipRule="evenodd" />
                </svg>
                <span className={`font-black ${exportFormat === 'pdf' ? 'text-red-500' : (isDark ? 'text-violet-200' : 'text-slate-600')}`}>
                  PDF
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`mt-8 pt-6 border-t flex gap-4 ${isDark ? 'border-violet-700/50' : 'border-slate-100'}`}>
          <button 
            onClick={onClose}
            className={`flex-1 px-6 py-3 rounded-xl font-black text-sm transition-all ${isDark ? 'bg-[#4a3a63] hover:bg-[#5a4a75] text-violet-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
          >
            Cancelar
          </button>
          <button 
            onClick={handleExport}
            className={`flex-1 px-6 py-3 rounded-xl font-black text-sm text-white shadow-lg transition-all hover:scale-105 ${isDark ? 'bg-gradient-to-r from-violet-600 to-indigo-600' : 'bg-gradient-to-r from-green-600 to-teal-600'}`}
          >
            Generar {exportFormat === 'excel' ? 'Excel' : 'PDF'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DeliveryDatesExportModal;
