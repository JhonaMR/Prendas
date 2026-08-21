import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Search, Save, Upload, Download } from 'lucide-react';
import PaginationComponent from '../../components/PaginationComponent';
import usePagination from '../../hooks/usePagination';
import api from '../../services/api';
import CorteImportModal, { ImportedCorteRow } from '../../components/CorteImportModal';
import CorteExportModal, { ExportConfig } from '../../components/CorteExportModal';
import { User, UserRole, Reference } from '../../types';
import { useDarkMode } from '../../context/DarkModeContext';

interface RegistroCorte {
  id: string;
  numeroFicha: string;
  fechaCorte: string;
  referencia: string;
  descripcion: string;
  cantidadCortada: number;
  saved: boolean;
}

interface Props {
  user: User;
  referencesMaster: Reference[];
}



const RegistroCorteView: React.FC<Props> = ({ user, referencesMaster }) => {
  const { isDark } = useDarkMode();
  const [registros, setRegistros] = useState<RegistroCorte[]>([]);
  const [searchReferencia, setSearchReferencia] = useState('');
  const [searchNumeroFicha, setSearchNumeroFicha] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // Nuevo estado para guardado
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const cortesPagination = usePagination(1, 20);

  const isSoporte = user.role === UserRole.SOPORTE;

  // Función para ordenar registros: no guardados primero, luego guardados por número de ficha (mayor a menor)
  const sortRegistrosByFicha = (registros: RegistroCorte[]) => {
    const unsaved = registros.filter(r => !r.saved);
    const saved = registros.filter(r => r.saved);
    
    // Ordenar solo los guardados por número de ficha (mayor a menor)
    const sortedSaved = saved.sort((a, b) => {
      const fichaA = parseInt(a.numeroFicha) || 0;
      const fichaB = parseInt(b.numeroFicha) || 0;
      return fichaB - fichaA; // Orden descendente (mayor a menor)
    });
    
    // Retornar: no guardados primero, luego guardados ordenados
    return [...unsaved, ...sortedSaved];
  };

  // Actualizar descripciones cuando cambien las referencias maestras
  useEffect(() => {
    if (referencesMaster.length > 0 && registros.length > 0) {
      setRegistros(prev => sortRegistrosByFicha(prev.map(r => {
        const referenceData = referencesMaster.find(ref => ref.id === r.referencia);
        const newDescription = referenceData?.description || '';
        // Solo actualizar si la descripción realmente cambió
        return r.descripcion !== newDescription ? { ...r, descripcion: newDescription } : r;
      })));
    }
  }, [referencesMaster]); // Solo cuando cambien las referencias maestras

  // Carga inicial desde la BD
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.getCorteRegistros().then(data => {
      if (!cancelled) {
        const loaded = data.map((r: any) => {
          // Obtener la descripción actualizada desde referencesMaster
          const referenceData = referencesMaster.find(ref => ref.id === r.referencia);
          return {
            ...r,
            descripcion: referenceData?.description || r.descripcion,
            saved: true
          };
        });
        setRegistros(sortRegistrosByFicha(loaded));
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [referencesMaster]);

  // Alerta de cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleAddNew = () => {
    // Si hay una fila en edición, completar la edición primero
    if (editingId) {
      const editingRow = registros.find(r => r.id === editingId);
      if (editingRow && (!editingRow.numeroFicha.trim() || !editingRow.referencia.trim() || !editingRow.cantidadCortada || editingRow.cantidadCortada <= 0)) {
        alert('Por favor completa todos los campos de la fila en edición antes de agregar una nueva.');
        return;
      }
    }

    const newRegistro: RegistroCorte = {
      id: `temp_${Date.now()}`,
      numeroFicha: '',
      fechaCorte: new Date().toISOString().split('T')[0],
      referencia: '',
      descripcion: '',
      cantidadCortada: 0,
      saved: false,
    };
    // Agregar al inicio sin reordenar (las filas no guardadas van primero)
    setRegistros(prev => [newRegistro, ...prev]);
    setEditingId(newRegistro.id);
    setHasUnsavedChanges(true);
  };

  const handleFieldChange = (id: string, field: string, value: any) => {
    setRegistros(prev => prev.map(r => 
      r.id === id 
        ? { ...r, [field]: value, saved: false } // Marcar como no guardado cuando se edita
        : r
    ));
    setHasUnsavedChanges(true);
  };

  const handleEditReferencia = (id: string, value: string) => {
    const referenceData = referencesMaster.find(ref => ref.id === value);
    setRegistros(prev => prev.map(r =>
      r.id === id
        ? { 
            ...r, 
            referencia: value, 
            descripcion: referenceData?.description || '', // Limpiar descripción si no existe la referencia
            saved: false // Marcar como no guardado cuando se edita
          }
        : r
    ));
    setHasUnsavedChanges(true);
  };

  const handleSaveAll = async () => {
    const unsaved = registros.filter(r => !r.saved);

    // Validación mejorada con mensajes específicos
    for (const r of unsaved) {
      if (!r.numeroFicha.trim()) {
        alert(`Error: El campo "N° DE FICHA" es requerido en una de las filas.`);
        return;
      }
      if (!r.referencia.trim()) {
        alert(`Error: El campo "REF" es requerido en la fila con ficha "${r.numeroFicha}".`);
        return;
      }
      if (!r.cantidadCortada || r.cantidadCortada <= 0) {
        alert(`Error: El campo "CANT. CORTADA" debe ser mayor a 0 en la fila con ficha "${r.numeroFicha}".`);
        return;
      }
      // Validar que la referencia exista en referencesMaster
      const referenceExists = referencesMaster.find(ref => ref.id === r.referencia);
      if (!referenceExists) {
        alert(`Error: La referencia "${r.referencia}" no existe en el catálogo de productos (fila con ficha "${r.numeroFicha}").`);
        return;
      }
    }

    setSaving(true);
    try {
      // Guardar cada registro y actualizar el estado local
      for (const r of unsaved) {
        const { id, saved, ...data } = r;
        
        if (id.startsWith('temp_')) {
          const response = await api.createCorteRegistro(data);
          
          // Verificar si hubo error
          if (!response.success) {
            throw new Error(response.message || 'Error al crear el registro');
          }
          
          // Actualizar el registro local con el ID real de la BD
          setRegistros(prev => prev.map(reg => 
            reg.id === id 
              ? { ...reg, id: response.data?.id || id, saved: true }
              : reg
          ));
        } else {
          const response = await api.updateCorteRegistro(id, data);
          
          // Verificar si hubo error
          if (!response.success) {
            throw new Error(response.message || 'Error al actualizar el registro');
          }
          
          // Marcar como guardado
          setRegistros(prev => prev.map(reg => 
            reg.id === id 
              ? { ...reg, saved: true }
              : reg
          ));
        }
      }
      
      setEditingId(null);
      setHasUnsavedChanges(false);
      
      // Aplicar ordenamiento después de guardar exitosamente
      setRegistros(prev => sortRegistrosByFicha(prev));
      
      alert(`${unsaved.length} registro(s) guardado(s) exitosamente.`);
    } catch (error) {
      console.error('❌ Error completo al guardar:', error);
      console.error('❌ Stack trace:', error.stack);
      
      // Mostrar error más específico
      let errorMessage = 'Error al guardar los registros. ';
      if (error.message) {
        errorMessage += `Detalle: ${error.message}`;
      } else {
        errorMessage += 'Por favor intenta nuevamente.';
      }
      
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este registro?')) return;
    if (id.startsWith('temp_')) {
      setRegistros(prev => prev.filter(r => r.id !== id));
      if (editingId === id) setEditingId(null);
      return;
    }
    setSaving(true);
    try {
      await api.deleteCorteRegistro(id);
      setRegistros(prev => prev.filter(r => r.id !== id));
      if (editingId === id) setEditingId(null);
    } catch {
      alert('Error al eliminar el registro');
    } finally {
      setSaving(false);
    }
  };

  const handleImportFromExcel = async (rows: ImportedCorteRow[]) => {
    const newRegistros: RegistroCorte[] = rows.map((row, idx) => {
      const referenceData = referencesMaster.find(ref => ref.id === row.referencia);
      return {
        id: `temp_import_${Date.now()}_${idx}`,
        numeroFicha: row.numeroFicha,
        fechaCorte: row.fechaCorte,
        referencia: row.referencia,
        descripcion: row.descripcion || referenceData?.description || '',
        cantidadCortada: parseInt(row.cantidadCortada) || 0,
        saved: false,
      };
    });
    // Agregar al inicio sin reordenar (las filas no guardadas van primero)
    setRegistros(prev => [...newRegistros, ...prev]);
    setHasUnsavedChanges(true);
    alert(`${rows.length} registros importados. Revisa y guarda cuando estés listo.`);
  };

  const truncateText = (pdfDoc: any, text: string, maxW: number, fSize: number): string => {
    pdfDoc.setFontSize(fSize);
    if (pdfDoc.getTextWidth(text) <= maxW) return text;
    let t = text;
    while (t.length > 0 && pdfDoc.getTextWidth(t + '...') > maxW) {
      t = t.slice(0, -1);
    }
    return t + '...';
  };

  const drawPageHeaderAndColumns = (pdfDoc: any, config: ExportConfig, cols: any[], margin: number, pageWidth: number) => {
    pdfDoc.setFont('helvetica', 'bold');
    pdfDoc.setFontSize(14);
    pdfDoc.setTextColor(30, 41, 59);
    pdfDoc.text('REPORTE DE REGISTRO DE CORTE', pageWidth / 2, margin + 4, { align: 'center' });
    
    pdfDoc.setFont('helvetica', 'normal');
    pdfDoc.setFontSize(9);
    pdfDoc.setTextColor(71, 85, 105);
    const fDesdeFormatted = config.fechaDesde.split('-').reverse().join('/');
    const fHastaFormatted = config.fechaHasta.split('-').reverse().join('/');
    pdfDoc.text(`RANGO: ${fDesdeFormatted} - ${fHastaFormatted}`, pageWidth / 2, margin + 9, { align: 'center' });
    
    const headerY = margin + 14;
    const headerHeight = 7;
    pdfDoc.setFont('helvetica', 'bold');
    pdfDoc.setFontSize(9);
    pdfDoc.setDrawColor(148, 163, 184); // border color (slate-400)
    pdfDoc.setLineWidth(0.3);
    
    let currentX = margin;
    cols.forEach(col => {
      pdfDoc.setFillColor(241, 245, 249); // background color (slate-100)
      pdfDoc.rect(currentX, headerY, col.w, headerHeight, 'F');
      pdfDoc.rect(currentX, headerY, col.w, headerHeight, 'S');
      
      const textY = headerY + headerHeight / 2 + (9 * 0.3528) / 2;
      if (col.align === 'center') {
        pdfDoc.text(col.label, currentX + col.w / 2, textY, { align: 'center' });
      } else if (col.align === 'right') {
        pdfDoc.text(col.label, currentX + col.w - 2, textY, { align: 'right' });
      } else {
        pdfDoc.text(col.label, currentX + 2, textY, { align: 'left' });
      }
      currentX += col.w;
    });
  };

  const exportToPDF = async (config: ExportConfig, dataToExport: RegistroCorte[]) => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10; // estrecha
      const contentWidth = pageWidth - (margin * 2);

      const cols = config.incluirDescripcion
        ? [
            { key: 'numeroFicha', label: 'N° DE FICHA', w: 35, align: 'center' },
            { key: 'fechaCorte', label: 'FECHA CORTE', w: 35, align: 'center' },
            { key: 'referencia', label: 'REFERENCIA', w: 30, align: 'center' },
            { key: 'descripcion', label: 'DESCRIPCIÓN', w: contentWidth - 130, align: 'left' },
            { key: 'cantidadCortada', label: 'CANT. CORTADA', w: 30, align: 'center' }
          ]
        : [
            { key: 'numeroFicha', label: 'N° DE FICHA', w: contentWidth * 0.25, align: 'center' },
            { key: 'fechaCorte', label: 'FECHA CORTE', w: contentWidth * 0.25, align: 'center' },
            { key: 'referencia', label: 'REFERENCIA', w: contentWidth * 0.25, align: 'center' },
            { key: 'cantidadCortada', label: 'CANT. CORTADA', w: contentWidth * 0.25, align: 'center' }
          ];

      drawPageHeaderAndColumns(doc, config, cols, margin, pageWidth);

      let y = margin + 21;
      const rowHeight = 6;
      const fontSize = 8;

      dataToExport.forEach(row => {
        if (y + rowHeight > pageHeight - margin) {
          doc.addPage();
          drawPageHeaderAndColumns(doc, config, cols, margin, pageWidth);
          y = margin + 21;
        }

        doc.setFontSize(fontSize);
        doc.setTextColor(30, 41, 59); // Standard dark slate text
        doc.setLineWidth(0.2);
        doc.setDrawColor(226, 232, 240); // Standard light border (slate-200)

        let currentX = margin;
        cols.forEach(col => {
          doc.rect(currentX, y, col.w, rowHeight, 'S');

          let val = '';
          if (col.key === 'numeroFicha') {
            val = row.numeroFicha;
            doc.setFont(undefined, 'bold'); // "número de ficha en negrita"
          } else if (col.key === 'fechaCorte') {
            val = row.fechaCorte ? row.fechaCorte.split('-').reverse().join('/') : '';
            doc.setFont(undefined, 'normal');
          } else if (col.key === 'referencia') {
            val = row.referencia || '';
            doc.setFont(undefined, 'normal');
          } else if (col.key === 'descripcion') {
            val = row.descripcion || '';
            doc.setFont(undefined, 'normal');
          } else if (col.key === 'cantidadCortada') {
            val = String(row.cantidadCortada || 0);
            doc.setFont(undefined, 'normal');
          }

          const pad = 2;
          const maxTextW = col.w - (pad * 2);
          const text = truncateText(doc, val, maxTextW, fontSize);

          const textY = y + rowHeight / 2 + (fontSize * 0.3528) / 2;
          if (col.align === 'center') {
            doc.text(text, currentX + col.w / 2, textY, { align: 'center' });
          } else if (col.align === 'right') {
            doc.text(text, currentX + col.w - pad, textY, { align: 'right' });
          } else {
            doc.text(text, currentX + pad, textY, { align: 'left' });
          }

          currentX += col.w;
        });

        y += rowHeight;
      });

      // Totales
      const uniqueFichas = new Set(dataToExport.map(r => r.numeroFicha)).size;
      const uniqueReferences = new Set(dataToExport.map(r => r.referencia).filter(Boolean)).size;
      const totalCantCortada = dataToExport.reduce((acc, r) => acc + (r.cantidadCortada || 0), 0);
      const totalsRowHeight = 8;

      if (y + totalsRowHeight > pageHeight - margin) {
        doc.addPage();
        drawPageHeaderAndColumns(doc, config, cols, margin, pageWidth);
        y = margin + 21;
      }

      let currentX = margin;
      cols.forEach((col) => {
        doc.setFillColor(248, 250, 252); // background fill slate-50 (very light, high contrast)
        doc.setTextColor(15, 23, 42); // text color slate-900 (almost black)
        doc.setDrawColor(148, 163, 184); // border color slate-400
        doc.setFont(undefined, 'bold');
        doc.setFontSize(9);
        doc.rect(currentX, y, col.w, totalsRowHeight, 'FD'); // Fill and Draw in one call

        let val = '';
        if (col.key === 'numeroFicha') {
          val = `REGISTROS: ${dataToExport.length}`;
        } else if (col.key === 'fechaCorte') {
          val = `ÚNICAS: ${uniqueFichas}`;
        } else if (col.key === 'referencia') {
          val = `REFS: ${uniqueReferences}`;
        } else if (col.key === 'cantidadCortada') {
          val = String(totalCantCortada);
        }

        const textY = y + totalsRowHeight / 2 + (9 * 0.3528) / 2;
        if (col.align === 'center') {
          doc.text(val, currentX + col.w / 2, textY, { align: 'center' });
        } else if (col.align === 'right') {
          doc.text(val, currentX + col.w - 2, textY, { align: 'right' });
        } else {
          doc.text(val, currentX + 2, textY, { align: 'left' });
        }

        currentX += col.w;
      });

      doc.save(`Reporte_Cortes_${config.fechaDesde}_${config.fechaHasta}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Ocurrió un error al generar el PDF.');
    }
  };

  const exportToExcel = async (config: ExportConfig, dataToExport: RegistroCorte[]) => {
    try {
      const ExcelJS = await import('exceljs');
      const Workbook = ExcelJS.Workbook;
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('CORTES');

      worksheet.pageSetup = {
        paperSize: 1 as any, // Letter
        orientation: 'portrait' as any,
        margins: {
          left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.5, footer: 0.5
        }
      };

      const thinBorder = {
        top: { style: 'thin' as any, color: { argb: 'FFCBD5E1' } }, // slate-300
        bottom: { style: 'thin' as any, color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin' as any, color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin' as any, color: { argb: 'FFCBD5E1' } }
      };

      const titleStyle = {
        font: { bold: true, size: 14, color: { argb: 'FF1E293B' } },
        alignment: { horizontal: 'center' as any, vertical: 'center' as any },
        fill: { type: 'pattern' as any, pattern: 'solid' as any, fgColor: { argb: 'FFF1F5F9' } } // slate-100
      };

      const subtitleStyle = {
        font: { size: 10, color: { argb: 'FF475569' } },
        alignment: { horizontal: 'center' as any, vertical: 'center' as any },
        fill: { type: 'pattern' as any, pattern: 'solid' as any, fgColor: { argb: 'FFF1F5F9' } }
      };

      const numCols = config.incluirDescripcion ? 5 : 4;

      const titleRow = worksheet.addRow(['REPORTE DE REGISTRO DE CORTE']);
      titleRow.height = 25;
      worksheet.mergeCells(titleRow.number, 1, titleRow.number, numCols);
      titleRow.getCell(1).style = titleStyle;

      const fDesdeFormatted = config.fechaDesde.split('-').reverse().join('/');
      const fHastaFormatted = config.fechaHasta.split('-').reverse().join('/');
      const subtitleRow = worksheet.addRow([`RANGO: ${fDesdeFormatted} - ${fHastaFormatted}`]);
      subtitleRow.height = 20;
      worksheet.mergeCells(subtitleRow.number, 1, subtitleRow.number, numCols);
      subtitleRow.getCell(1).style = subtitleStyle;

      worksheet.addRow([]); // Espacio en blanco

      const headers = config.incluirDescripcion
        ? ['N° DE FICHA', 'FECHA CORTE', 'REFERENCIA', 'DESCRIPCIÓN', 'CANT. CORTADA']
        : ['N° DE FICHA', 'FECHA CORTE', 'REFERENCIA', 'CANT. CORTADA'];

      const headerRow = worksheet.addRow(headers);
      headerRow.height = 22;
      headerRow.eachCell((cell) => {
        cell.style = {
          font: { bold: true, size: 10, color: { argb: 'FF1E293B' } },
          alignment: { horizontal: 'center' as any, vertical: 'center' as any },
          border: thinBorder,
          fill: { type: 'pattern' as any, pattern: 'solid' as any, fgColor: { argb: 'FFE2E8F0' } } // slate-200
        };
      });

      // Configurar anchos de columna
      worksheet.getColumn(1).width = 20;
      worksheet.getColumn(2).width = 20;
      worksheet.getColumn(3).width = 20; // REFERENCIA
      if (config.incluirDescripcion) {
        worksheet.getColumn(4).width = 45;
        worksheet.getColumn(5).width = 20;
      } else {
        worksheet.getColumn(4).width = 20;
      }

      const cellStyleCenter = {
        alignment: { horizontal: 'center' as any, vertical: 'center' as any },
        border: thinBorder
      };
      const cellStyleLeft = {
        alignment: { horizontal: 'left' as any, vertical: 'center' as any },
        border: thinBorder
      };
      const fichaCellStyle = {
        font: { bold: true }, // "número de ficha en negrita"
        alignment: { horizontal: 'center' as any, vertical: 'center' as any },
        border: thinBorder
      };

      dataToExport.forEach(r => {
        const formattedDate = r.fechaCorte ? r.fechaCorte.split('-').reverse().join('/') : '';
        const fichaNum = Number(r.numeroFicha);
        const fichaValue = isNaN(fichaNum) ? r.numeroFicha : fichaNum;
        const rowData = config.incluirDescripcion
          ? [fichaValue, formattedDate, r.referencia || '', r.descripcion || '', r.cantidadCortada]
          : [fichaValue, formattedDate, r.referencia || '', r.cantidadCortada];

        const dataRow = worksheet.addRow(rowData);
        dataRow.height = 18;
        dataRow.eachCell((cell, colNum) => {
          if (colNum === 1) {
            cell.style = fichaCellStyle;
          } else if (config.incluirDescripcion && colNum === 4) {
            cell.style = cellStyleLeft;
          } else {
            cell.style = cellStyleCenter;
          }
        });
      });

      // Totales
      const uniqueFichas = new Set(dataToExport.map(r => r.numeroFicha)).size;
      const uniqueReferences = new Set(dataToExport.map(r => r.referencia).filter(Boolean)).size;
      const totalCantCortada = dataToExport.reduce((acc, r) => acc + (r.cantidadCortada || 0), 0);

      const totalsRowData = config.incluirDescripcion
        ? [`REGISTROS: ${dataToExport.length}`, `ÚNICAS: ${uniqueFichas}`, `REFS: ${uniqueReferences}`, '', totalCantCortada]
        : [`REGISTROS: ${dataToExport.length}`, `ÚNICAS: ${uniqueFichas}`, `REFS: ${uniqueReferences}`, totalCantCortada];

      const totalRow = worksheet.addRow(totalsRowData);
      totalRow.height = 22;
      totalRow.eachCell((cell) => {
        cell.style = {
          font: { bold: true, size: 10, color: { argb: 'FF1E293B' } },
          alignment: { horizontal: 'center' as any, vertical: 'center' as any },
          border: thinBorder,
          fill: { type: 'pattern' as any, pattern: 'solid' as any, fgColor: { argb: 'FFE2E8F0' } }
        };
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Reporte_Cortes_${config.fechaDesde}_${config.fechaHasta}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Ocurrió un error al generar el Excel.');
    }
  };

  const handleExport = (config: ExportConfig) => {
    const dataToExport = registros.filter(r => r.fechaCorte >= config.fechaDesde && r.fechaCorte <= config.fechaHasta);

    if (dataToExport.length === 0) {
      alert('No se encontraron registros en el rango de fechas seleccionado.');
      return;
    }

    if (config.format === 'pdf') {
      exportToPDF(config, dataToExport);
    } else {
      exportToExcel(config, dataToExport);
    }

    setShowExportModal(false);
  };

  const filteredRegistros = registros.filter(r =>
    r.referencia.toLowerCase().includes(searchReferencia.toLowerCase()) &&
    r.numeroFicha.toLowerCase().includes(searchNumeroFicha.toLowerCase())
  );

  // Solo resetear paginación cuando cambian los filtros, no cuando se agregan filas
  useEffect(() => {
    // Solo ir a página 1 si realmente cambió el filtro (no por agregar filas)
    const hasActiveFilters = searchReferencia.trim() !== '' || searchNumeroFicha.trim() !== '';
    if (hasActiveFilters) {
      cortesPagination.goToPage(1);
    }
  }, [searchReferencia, searchNumeroFicha]);

  const totalPages = Math.ceil(filteredRegistros.length / cortesPagination.pagination.limit) || 1;
  const paginatedRegistros = filteredRegistros.slice(
    (cortesPagination.pagination.page - 1) * cortesPagination.pagination.limit,
    cortesPagination.pagination.page * cortesPagination.pagination.limit
  );

  return (
    <div className={`h-full w-full flex flex-col p-6 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-transparent'}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className={`text-4xl font-bold mb-1 transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>Registro de Corte</h1>
            <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>Gestiona tus fichas de corte de forma eficiente</p>
          </div>

          <div className="flex items-end gap-3">
            {/* Limpiar filtros */}
            <button
              onClick={() => { setSearchReferencia(''); setSearchNumeroFicha(''); }}
              className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold text-lg transition shadow-md transition-colors duration-300 ${isDark ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
              title="Limpiar filtros"
            >✕</button>

            {/* Filtro Ref */}
            <div>
              <label className={`block text-xs font-semibold mb-1 text-center transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-700'}`}>Filtro por Ref.</label>
              <div className="relative">
                <Search className={`absolute left-2 top-2 w-4 h-4 transition-colors duration-300 ${isDark ? 'text-pink-400' : 'text-pink-400'}`} />
                <input
                  type="text"
                  placeholder="13101"
                  value={searchReferencia}
                  onChange={e => setSearchReferencia(e.target.value)}
                  className={`pl-7 pr-3 py-1.5 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-pink-600 text-pink-200 placeholder-pink-600 focus:ring-pink-500' : 'border-pink-200 focus:ring-pink-400 bg-white/80 text-slate-900'}`}
                />
              </div>
            </div>

            {/* Filtro N° Ficha */}
            <div>
              <label className={`block text-xs font-semibold mb-1 text-center transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-700'}`}>Filtrar por N° FICHA</label>
              <div className="relative">
                <Search className={`absolute left-2 top-2 w-4 h-4 transition-colors duration-300 ${isDark ? 'text-purple-400' : 'text-purple-400'}`} />
                <input
                  type="text"
                  placeholder="1482"
                  value={searchNumeroFicha}
                  onChange={e => setSearchNumeroFicha(e.target.value)}
                  className={`pl-7 pr-3 py-1.5 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-purple-600 text-purple-200 placeholder-purple-600 focus:ring-purple-500' : 'border-purple-200 focus:ring-purple-400 bg-white/80 text-slate-900'}`}
                />
              </div>
            </div>

            {/* Botón Import - solo SOPORTE */}
            {isSoporte && (
              <button
                onClick={() => setShowImportModal(true)}
                className={`flex items-center gap-2 text-white px-3 py-1.5 rounded-lg font-medium text-sm transition shadow-md transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'}`}
              >
                <Upload className="w-4 h-4" />
                Importar
              </button>
            )}

            {/* Botón Exportar */}
            <button
              onClick={() => setShowExportModal(true)}
              className={`flex items-center gap-2 text-white px-3 py-1.5 rounded-lg font-medium text-sm transition shadow-md transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500' : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'}`}
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>

            {/* Botón Agregar */}
            <button
              onClick={handleAddNew}
              className={`flex items-center gap-2 text-white px-3 py-1.5 rounded-lg font-medium text-sm transition shadow-md transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400' : 'bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600'}`}
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>

            {/* Botón Guardar */}
            <button
              onClick={handleSaveAll}
              disabled={!hasUnsavedChanges || saving}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition shadow-md transition-colors duration-300 ${
                hasUnsavedChanges && !saving
                  ? isDark ? 'bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white' : 'bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white'
                  : isDark ? 'bg-violet-900/40 text-violet-700 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className={`flex-1 overflow-auto backdrop-blur rounded-xl shadow-lg border mb-4 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white/90 border-pink-100'}`}>
        {loading ? (
          <div className={`flex items-center justify-center h-40 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Cargando...</div>
        ) : (
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
            <thead className={`border-b-2 sticky top-0 transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-700' : 'bg-gradient-to-r from-pink-100 to-purple-100 border-pink-200'}`}>
              <tr>
                <th className={`px-6 py-4 text-center text-sm font-bold border-r w-32 transition-colors duration-300 ${isDark ? 'text-violet-200 border-violet-700' : 'text-slate-800 border-pink-200'}`}>N° DE FICHA</th>
                <th className={`px-6 py-4 text-center text-sm font-bold border-r w-32 transition-colors duration-300 ${isDark ? 'text-violet-200 border-violet-700' : 'text-slate-800 border-pink-200'}`}>FECHA CORTE</th>
                <th className={`px-6 py-4 text-center text-sm font-bold border-r transition-colors duration-300 ${isDark ? 'text-violet-200 border-violet-700' : 'text-slate-800 border-pink-200'}`} style={{ width: '100px' }}>REF.</th>
                <th className={`px-6 py-4 text-center text-sm font-bold border-r transition-colors duration-300 ${isDark ? 'text-violet-200 border-violet-700' : 'text-slate-800 border-pink-200'}`} style={{ width: '200px' }}>DESCRIPCION</th>
                <th className={`px-6 py-4 text-center text-sm font-bold border-r w-32 transition-colors duration-300 ${isDark ? 'text-violet-200 border-violet-700' : 'text-slate-800 border-pink-200'}`}>CANT. CORTADA</th>
                <th className={`px-6 py-4 text-center text-sm font-bold w-20 transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRegistros.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`px-6 py-12 text-center transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>
                    <div className="flex flex-col items-center gap-2">
                      <Search className={`w-8 h-8 transition-colors duration-300 ${isDark ? 'text-violet-600' : 'text-pink-200'}`} />
                      <p>No hay registros que coincidan con tu búsqueda</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRegistros.map((registro, idx) => (
                  <tr key={registro.id} className={`border-b transition-colors duration-300 ${isDark ? `border-violet-700/50 ${idx % 2 === 0 ? 'bg-[#3d2d52]' : 'bg-[#4a3a5f]'} hover:bg-violet-700/20` : `border-pink-100 ${idx % 2 === 0 ? 'bg-white/50' : 'bg-purple-50/30'} hover:bg-pink-50/50`}`}>
                    <td className={`px-6 py-2.5 text-sm border-r transition-colors duration-300 text-center ${isDark ? 'border-violet-700/50 text-violet-200' : 'border-pink-100 text-slate-900'}`}>
                      {editingId === registro.id ? (
                        <input type="text" value={registro.numeroFicha}
                          onChange={e => handleFieldChange(registro.id, 'numeroFicha', e.target.value)}
                          className={`w-full px-2 py-1 border-2 rounded focus:outline-none focus:ring-2 transition-colors duration-300 text-center ${isDark ? 'bg-[#3d2d52] border-pink-600 text-pink-200 focus:ring-pink-500' : 'border-pink-300 focus:ring-pink-400 bg-white text-slate-900'}`} />
                      ) : (
                        <span className={`font-semibold transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-900'}`}>{registro.numeroFicha}</span>
                      )}
                    </td>
                    <td className={`px-6 py-2.5 text-sm border-r transition-colors duration-300 text-center ${isDark ? 'border-violet-700/50 text-violet-300' : 'border-pink-100 text-slate-700'}`}>
                      {editingId === registro.id ? (
                        <input type="date" value={registro.fechaCorte}
                          onChange={e => handleFieldChange(registro.id, 'fechaCorte', e.target.value)}
                          className={`w-full px-2 py-1 border-2 rounded focus:outline-none focus:ring-2 transition-colors duration-300 text-center ${isDark ? 'bg-[#3d2d52] border-pink-600 text-pink-200 focus:ring-pink-500' : 'border-pink-300 focus:ring-pink-400 bg-white text-slate-900'}`} />
                      ) : (
                        <span className={`transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-700'}`}>{registro.fechaCorte}</span>
                      )}
                    </td>
                    <td className={`px-6 py-2.5 text-sm border-r transition-colors duration-300 text-center ${isDark ? 'border-violet-700/50 text-violet-200' : 'border-pink-100 text-slate-900'}`}>
                      {editingId === registro.id ? (
                        <input type="text" value={registro.referencia}
                          onChange={e => handleEditReferencia(registro.id, e.target.value)}
                          placeholder="13101" list="referencias-list"
                          className={`w-full px-2 py-1 border-2 rounded focus:outline-none focus:ring-2 transition-colors duration-300 text-center ${isDark ? 'bg-[#3d2d52] border-pink-600 text-pink-200 focus:ring-pink-500' : 'border-pink-300 focus:ring-pink-400 bg-white text-slate-900'}`} />
                      ) : (
                        <span className={`font-semibold transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-900'}`}>{registro.referencia}</span>
                      )}
                    </td>
                    <td className={`px-6 py-2.5 text-sm border-r transition-colors duration-300 text-left ${isDark ? 'border-violet-700/50 text-violet-300' : 'border-pink-100 text-slate-700'}`}>
                      <span className={`transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-700'}`}>{registro.descripcion}</span>
                    </td>
                    <td className={`px-6 py-2.5 text-sm border-r transition-colors duration-300 text-center ${isDark ? 'border-violet-700/50 text-violet-200' : 'border-pink-100 text-slate-900'}`}>
                      {editingId === registro.id ? (
                        <input type="number" value={registro.cantidadCortada}
                          onChange={e => handleFieldChange(registro.id, 'cantidadCortada', parseInt(e.target.value) || 0)}
                          className={`w-full px-2 py-1 border-2 rounded focus:outline-none focus:ring-2 transition-colors duration-300 text-center ${isDark ? 'bg-[#3d2d52] border-pink-600 text-pink-200 focus:ring-pink-500' : 'border-pink-300 focus:ring-pink-400 bg-white text-slate-900'}`} />
                      ) : (
                        <span className={`font-bold transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-900'}`}>{registro.cantidadCortada}</span>
                      )}
                    </td>
                    <td className="px-6 py-2.5 text-center">
                      <div className="flex justify-center gap-2">
                        {editingId === registro.id ? (
                          <button onClick={() => setEditingId(null)}
                            className={`p-2 rounded-lg transition-colors duration-300 ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-slate-600 hover:bg-red-100'}`} title="Cancelar">✕</button>
                        ) : (
                          <>
                            <button onClick={() => setEditingId(registro.id)}
                              className={`p-2 rounded-lg transition-colors duration-300 ${isDark ? 'text-blue-400 hover:bg-blue-900/30' : 'text-blue-600 hover:bg-blue-100'}`} title="Editar">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(registro.id)}
                              className={`p-2 rounded-lg transition-colors duration-300 ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-100'}`} title="Eliminar">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
        <datalist id="referencias-list">
          {referencesMaster.map(ref => <option key={ref.id} value={ref.id} />)}
        </datalist>
      </div>

      {/* Paginación */}
      <div className="mt-auto">
        <PaginationComponent
          currentPage={cortesPagination.pagination.page}
          totalPages={totalPages}
          pageSize={cortesPagination.pagination.limit}
          onPageChange={cortesPagination.goToPage}
          onPageSizeChange={cortesPagination.setLimit}
        />
      </div>

      <CorteImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportFromExcel}
      />

      <CorteExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />
    </div>
  );
};

export default RegistroCorteView;
