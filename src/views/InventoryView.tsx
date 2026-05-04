import React, { useMemo, useState } from 'react';
import { BatchReception, Dispatch, ItemEntry, Reference, UserRole } from '../types';
import PaginationComponent from '../components/PaginationComponent';
import usePagination from '../hooks/usePagination';
import InventoryInsumosView from './InventoryInsumosView';
import { useDarkMode } from '../context/DarkModeContext';

interface InventoryViewProps {
  receptions?: BatchReception[];
  dispatches?: Dispatch[];
  references?: Reference[];
  orders?: any[];
  correrias?: any[];
  returnReceptions?: any[];
  salidasBodega?: any[];
  user?: any;
}

const InventoryView: React.FC<InventoryViewProps> = ({
  receptions = [],
  dispatches = [],
  references = [],
  orders = [],
  correrias = [],
  returnReceptions = [],
  salidasBodega = [],
  user
}) => {
  const { isDark } = useDarkMode();
  const [search, setSearch] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [inventoryType, setInventoryType] = useState<'selector' | 'supplies' | 'finished'>('selector');
  const pagination = usePagination(1, 20);

  // Verificar si el usuario es Admin u Observer
  const canGenerateReports = user && (user.role === UserRole.ADMIN || user.role === UserRole.SOPORTE || user.role === 'admin' || user.role === 'soporte' || user.role === UserRole.OBSERVER || user.role === 'observer');

  // Create a map of reference ID to description for quick lookup
  const refDescriptionMap = useMemo(() => {
    const map: Record<string, string> = {};
    references.forEach(ref => {
      map[ref.id] = ref.description;
    });
    return map;
  }, [references]);

  const stockByRef = useMemo(() => {
    const stock: Record<string, {
      received: number,
      returned: number,
      dispatched: number,
      salidas: number,
      available: number,
      lotsCount: number,
      ordersCount: number,
      correriasCount: number
    }> = {};

    receptions
      .filter(r => r.affectsInventory !== false)
      .forEach(r => {
        r.items.forEach(item => {
          if (!stock[item.reference]) {
            stock[item.reference] = { received: 0, returned: 0, dispatched: 0, salidas: 0, available: 0, lotsCount: 0, ordersCount: 0, correriasCount: 0 };
          }
          stock[item.reference].received += item.quantity;
          stock[item.reference].available += item.quantity;
        });
        const uniqueRefsInBatch = new Set(r.items.map(i => i.reference));
        uniqueRefsInBatch.forEach((ref: string) => {
          if (stock[ref]) stock[ref].lotsCount += 1;
        });
      });

    dispatches.forEach(d => {
      d.items.forEach(item => {
        if (!stock[item.reference]) return;
        stock[item.reference].dispatched += item.quantity;
        stock[item.reference].available -= item.quantity;
      });
    });

    // Calcular salidas de bodega por referencia
    salidasBodega.forEach(salida => {
      if (!stock[salida.referencia]) {
        stock[salida.referencia] = { received: 0, returned: 0, dispatched: 0, salidas: 0, available: 0, lotsCount: 0, ordersCount: 0, correriasCount: 0 };
      }
      const cantidad = parseInt(salida.cantidad) || 0;
      stock[salida.referencia].salidas += cantidad;
      stock[salida.referencia].available -= cantidad;
    });

    const ordersByRef = new Map<string, Set<string>>();
    orders.forEach(order => {
      order.items.forEach((item: any) => {
        if (!ordersByRef.has(item.reference)) {
          ordersByRef.set(item.reference, new Set());
        }
        ordersByRef.get(item.reference)!.add(order.id);
      });
    });

    const correriasSet = new Map<string, Set<string>>();
    orders.forEach(order => {
      order.items.forEach((item: any) => {
        if (!correriasSet.has(item.reference)) {
          correriasSet.set(item.reference, new Set());
        }
        correriasSet.get(item.reference)!.add(order.correriaId);
      });
    });

    Object.keys(stock).forEach(ref => {
      stock[ref].ordersCount = ordersByRef.get(ref)?.size || 0;
      stock[ref].correriasCount = correriasSet.get(ref)?.size || 0;
    });

    // Sumar devoluciones a las entradas
    returnReceptions.forEach(r => {
      r.items.forEach(item => {
        if (!stock[item.reference]) {
          stock[item.reference] = { received: 0, returned: 0, dispatched: 0, salidas: 0, available: 0, lotsCount: 0, ordersCount: 0, correriasCount: 0 };
        }
        stock[item.reference].returned += item.quantity;
        stock[item.reference].available += item.quantity;
      });
    });

    return stock;
  }, [receptions, dispatches, orders, returnReceptions, salidasBodega]);

  // Filter and Sort entries
  const filteredSortedStock = useMemo(() => {
    return Object.entries(stockByRef)
      .filter(([ref]) => !search.trim() || ref.toUpperCase().includes(search.toUpperCase()))
      .sort(([refA], [refB]) => refA.localeCompare(refB));
  }, [stockByRef, search]);

  // Actualizar paginación cuando cambia el filtro
  React.useEffect(() => {
    pagination.pagination.total = filteredSortedStock.length;
    pagination.pagination.totalPages = Math.ceil(filteredSortedStock.length / pagination.pagination.limit);
  }, [filteredSortedStock.length, pagination.pagination.limit]);

  // Paginar datos
  const paginatedStock = useMemo(() => {
    const start = (pagination.pagination.page - 1) * pagination.pagination.limit;
    const end = start + pagination.pagination.limit;
    return filteredSortedStock.slice(start, end);
  }, [filteredSortedStock, pagination.pagination.page, pagination.pagination.limit]);

  // Función para generar el informe PDF
  const generateInventoryPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);

      let yPosition = margin;
      const headerRowHeight = 7;
      const dataRowHeight = 5;

      const columns = ['Referencia', 'Descripción', 'Cantidad'];
      const columnWidths = [
        contentWidth * 0.2,
        contentWidth * 0.4,
        contentWidth * 0.4
      ];

      const drawTableHeader = () => {
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);

        let xPos = margin;
        columns.forEach((col, idx) => {
          doc.rect(xPos, yPosition, columnWidths[idx], headerRowHeight);
          doc.text(col, xPos + columnWidths[idx] / 2, yPosition + 4.5, { align: 'center' });
          xPos += columnWidths[idx];
        });

        yPosition += headerRowHeight;
      };

      const drawDataRow = (rowData: (string | number)[]) => {
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);

        let xPos = margin;
        rowData.forEach((cell, idx) => {
          doc.rect(xPos, yPosition, columnWidths[idx], dataRowHeight);

          if (idx === 0) {
            doc.setFont(undefined, 'bold');
          } else {
            doc.setFont(undefined, 'normal');
          }

          const text = cell.toString();
          doc.text(text, xPos + columnWidths[idx] / 2, yPosition + 3.5, { align: 'center', maxWidth: columnWidths[idx] - 1 });
          xPos += columnWidths[idx];
        });

        yPosition += dataRowHeight;
      };

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Informe de Inventario', pageWidth / 2, margin + 3, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text(`Generado: ${new Date().toLocaleDateString()}`, pageWidth / 2, margin + 8, { align: 'center' });

      yPosition = margin + 14;

      drawTableHeader();

      const reportData = Object.entries(stockByRef)
        .map(([ref, data]: [string, any]) => ({
          referencia: ref,
          descripcion: refDescriptionMap[ref] || '',
          cantidad: data.available
        }))
        .filter(row => row.cantidad >= 1);

      for (let i = 0; i < reportData.length; i++) {
        const row = reportData[i];
        const rowData = [row.referencia, row.descripcion, row.cantidad];

        if (yPosition + dataRowHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          drawTableHeader();
        }

        drawDataRow(rowData);
      }

      doc.save(`Informe_Inventario_${new Date().getTime()}.pdf`);
      setShowReportModal(false);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Asegúrate de tener las librerías instaladas.');
    }
  };

  // Función para generar el informe Excel
  const generateInventoryExcel = async () => {
    try {
      const ExcelJS = await import('exceljs');
      const Workbook = ExcelJS.Workbook;

      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Inventario');

      worksheet.pageSetup = {
        paperSize: 1 as any,
        orientation: 'portrait' as any,
        margins: {
          left: 0.5,
          right: 0.5,
          top: 0.5,
          bottom: 0.5,
          header: 0.5,
          footer: 0.5
        }
      };

      const border = {
        top: { style: 'thin' as any, color: { argb: 'FF000000' } },
        bottom: { style: 'thin' as any, color: { argb: 'FF000000' } },
        left: { style: 'thin' as any, color: { argb: 'FF000000' } },
        right: { style: 'thin' as any, color: { argb: 'FF000000' } }
      };

      const titleStyle = {
        font: { bold: true, size: 14 },
        alignment: { horizontal: 'center' as any, vertical: 'center' as any },
        border: border
      };

      const infoStyle = {
        font: { size: 10 },
        alignment: { horizontal: 'center' as any, vertical: 'center' as any },
        border: border
      };

      const headerStyle = {
        font: { bold: true, size: 11 },
        alignment: { horizontal: 'center' as any, vertical: 'center' as any, wrapText: true },
        border: border,
        fill: { type: 'pattern' as any, pattern: 'solid' as any, fgColor: { argb: 'FFDCDCDC' } }
      };

      const dataStyle = {
        alignment: { horizontal: 'center' as any, vertical: 'center' as any },
        border: border
      };

      const refStyle = {
        font: { bold: true },
        alignment: { horizontal: 'center' as any, vertical: 'center' as any },
        border: border
      };

      const titleRow = worksheet.addRow(['Informe de Inventario']);
      titleRow.eachCell(cell => { cell.style = titleStyle; });
      titleRow.height = 20;
      worksheet.mergeCells(titleRow.number, 1, titleRow.number, 3);

      const infoRow = worksheet.addRow([`Generado: ${new Date().toLocaleDateString()}`]);
      infoRow.eachCell(cell => { cell.style = infoStyle; });
      worksheet.mergeCells(infoRow.number, 1, infoRow.number, 3);

      worksheet.addRow([]);

      const columns = ['Referencia', 'Descripción', 'Cantidad'];
      const headerRow = worksheet.addRow(columns);
      headerRow.eachCell(cell => { cell.style = headerStyle; });
      headerRow.height = 18;

      worksheet.getColumn(1).width = 15;
      worksheet.getColumn(2).width = 30;
      worksheet.getColumn(3).width = 15;

      const reportData = Object.entries(stockByRef)
        .map(([ref, data]: [string, any]) => ({
          referencia: ref,
          descripcion: refDescriptionMap[ref] || '',
          cantidad: data.available
        }))
        .filter(row => row.cantidad >= 1);

      reportData.forEach(row => {
        const dataRow = worksheet.addRow([row.referencia, row.descripcion, row.cantidad]);
        dataRow.eachCell((cell, colNumber) => {
          cell.style = colNumber === 1 ? refStyle : dataStyle;
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Informe_Inventario_${new Date().getTime()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setShowReportModal(false);
    } catch (error) {
      console.error('Error generando Excel:', error);
      alert('Error al generar el Excel. Asegúrate de tener las librerías instaladas.');
    }
  };

  if (inventoryType === 'selector') {
    return (
      <div className={`space-y-8 pb-20 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : ''}`}>
        <div>
          <h2 className={`text-3xl font-black tracking-tighter transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Inventario</h2>
          <p className={`font-medium transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Selecciona el tipo de inventario</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button
            onClick={() => setInventoryType('finished')}
            className={`p-8 rounded-[32px] shadow-sm border transition-all flex flex-col items-center justify-center gap-6 min-h-[400px] ${isDark ? 'bg-[#4a3a63] border-violet-700 hover:shadow-md hover:border-violet-600' : 'bg-white border-slate-100 hover:shadow-md hover:border-blue-200'}`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-violet-900/40' : 'bg-blue-50'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-8 h-8 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-blue-500'}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H2.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <div className="text-center space-y-2">
              <h3 className={`text-2xl font-black tracking-tight transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Inventario de Producto Terminado</h3>
              <p className={`font-medium transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Existencias de referencias confeccionadas</p>
            </div>
          </button>

          <button
            onClick={() => setInventoryType('supplies')}
            className={`p-8 rounded-[32px] shadow-sm border transition-all flex flex-col items-center justify-center gap-6 min-h-[400px] ${isDark ? 'bg-[#4a3a63] border-violet-700 hover:shadow-md hover:border-violet-600' : 'bg-white border-slate-100 hover:shadow-md hover:border-orange-200'}`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-violet-900/40' : 'bg-orange-50'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-8 h-8 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-orange-500'}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375M12 9.75v.75m0 2.25v.75m0 2.25v.75" />
              </svg>
            </div>
            <div className="text-center space-y-2">
              <h3 className={`text-2xl font-black tracking-tight transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Inventario de Insumos</h3>
              <p className={`font-medium transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Materias primas y materiales</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (inventoryType === 'supplies') {
    return (
      <InventoryInsumosView user={user} onNavigate={() => setInventoryType('selector')} />
    );
  }

  return (
    <div className={`space-y-6 pb-20 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className={`text-3xl sm:text-4xl font-black tracking-tighter transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>Inventario</h2>
          <p className={`font-medium text-sm sm:text-base transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Existencias actuales por referencia</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={() => setInventoryType('selector')}
            className={`px-6 py-4 rounded-[24px] font-bold text-sm transition-all border ${isDark ? 'bg-[#4a3a63] text-violet-300 border-violet-700 hover:text-violet-200' : 'bg-white text-slate-400 border-slate-100 hover:text-slate-600'}`}
          >
            Atrás
          </button>
          <div className="w-full sm:max-w-md">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar referencia..."
                className={`w-full px-6 py-4 rounded-[24px] focus:ring-4 transition-all font-bold text-sm shadow-sm ${isDark ? 'bg-[#3d2d52] border border-violet-600 text-violet-100 placeholder-violet-600 focus:ring-violet-400' : 'bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-blue-100'}`}
              />
              <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isDark ? 'text-violet-600' : 'text-slate-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
            </div>
          </div>
          {canGenerateReports && (
            <button
              onClick={() => setShowReportModal(true)}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-6 py-4 rounded-[24px] font-black text-sm uppercase tracking-wide transition-all shadow-sm whitespace-nowrap"
            >
              Generar Informe
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-3">
        {filteredSortedStock.length === 0 ? (
          <div className={`p-12 sm:p-24 rounded-[32px] sm:rounded-[48px] border-2 border-dashed text-center font-bold italic transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700 text-violet-400' : 'bg-white border-slate-200 text-slate-400'}`}>
            {search ? `No se encontraron resultados para "${search}"` : 'No hay mercancía registrada en bodega'}
          </div>
        ) : (
          <>
            {paginatedStock.map(([ref, data]) => (
              <div key={ref} className={`rounded-[20px] sm:rounded-[24px] shadow-sm border-l-4 px-4 py-2 sm:py-3 overflow-hidden hover:shadow-md transition-all ${isDark ? 'bg-[#4a3a63] border-violet-700 border-l-violet-500' : 'bg-white border-slate-100 border-l-blue-500'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                  <div className="flex items-center gap-2 min-w-fit">
                    <h3 className={`text-base sm:text-lg font-black tracking-tight leading-none transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{ref}</h3>
                    <span className={`px-1 py-0 text-[8px] sm:text-[9px] font-black uppercase tracking-widest rounded leading-none whitespace-nowrap transition-colors duration-300 ${isDark ? 'bg-violet-900/50 text-violet-300' : 'bg-blue-100 text-blue-600'}`}>
                      Lotes: {data.lotsCount}
                    </span>
                  </div>

                  {refDescriptionMap[ref] && (
                    <p className={`text-[11px] sm:text-sm font-medium leading-tight flex-1 truncate transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>{refDescriptionMap[ref]}</p>
                  )}

                  <div className="flex gap-4 sm:gap-6">
                    <div className={`px-2 py-1 rounded w-24 flex items-center gap-1 transition-colors duration-300 ${isDark ? 'bg-violet-900/30' : 'bg-blue-50/50'}`}>
                      <span className={`text-[8px] sm:text-[9px] font-black uppercase leading-none whitespace-nowrap transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-blue-400'}`}>Ing:</span>
                      <span className={`text-base sm:text-lg font-black leading-none transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-blue-600'}`}>+{data.received}</span>
                    </div>

                    <div className={`px-2 py-1 rounded w-24 flex items-center gap-1 transition-colors duration-300 ${isDark ? 'bg-orange-900/30' : 'bg-orange-50/50'}`}>
                      <span className={`text-[8px] sm:text-[9px] font-black uppercase leading-none whitespace-nowrap transition-colors duration-300 ${isDark ? 'text-orange-400' : 'text-orange-400'}`}>Dev:</span>
                      <span className={`text-base sm:text-lg font-black leading-none transition-colors duration-300 ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>+{data.returned}</span>
                    </div>

                    <div className={`px-2 py-1 rounded w-24 flex items-center gap-1 transition-colors duration-300 ${isDark ? 'bg-pink-900/30' : 'bg-pink-50/50'}`}>
                      <span className={`text-[8px] sm:text-[9px] font-black uppercase leading-none whitespace-nowrap transition-colors duration-300 ${isDark ? 'text-pink-400' : 'text-pink-400'}`}>Desp:</span>
                      <span className={`text-base sm:text-lg font-black leading-none transition-colors duration-300 ${isDark ? 'text-pink-300' : 'text-pink-600'}`}>-{data.dispatched}</span>
                    </div>

                    <div className={`px-2 py-1 rounded w-24 flex items-center gap-1 transition-colors duration-300 ${isDark ? 'bg-red-900/30' : 'bg-red-50/50'}`}>
                      <span className={`text-[8px] sm:text-[9px] font-black uppercase leading-none whitespace-nowrap transition-colors duration-300 ${isDark ? 'text-red-400' : 'text-red-400'}`}>Sal:</span>
                      <span className={`text-base sm:text-lg font-black leading-none transition-colors duration-300 ${isDark ? 'text-red-300' : 'text-red-600'}`}>-{data.salidas}</span>
                    </div>

                    <div className={`px-2 py-1 rounded-lg shadow-xs border w-24 flex items-center gap-1 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600' : 'bg-white border-slate-100'}`}>
                      <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest leading-none whitespace-nowrap transition-colors duration-300 ${isDark ? 'text-violet-600' : 'text-slate-400'}`}>Stock:</span>
                      <span className={`text-base sm:text-lg font-black leading-none transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-blue-600'}`}>{data.available}</span>
                    </div>

                    <div className={`px-2 py-1 rounded w-24 flex items-center gap-1 transition-colors duration-300 ${isDark ? 'bg-purple-900/30' : 'bg-purple-50/50'}`}>
                      <span className={`text-[8px] sm:text-[9px] font-black uppercase leading-none whitespace-nowrap transition-colors duration-300 ${isDark ? 'text-purple-400' : 'text-purple-400'}`}>Ped:</span>
                      <span className={`text-base sm:text-lg font-black leading-none transition-colors duration-300 ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>{data.ordersCount}</span>
                    </div>

                    <div className={`px-2 py-1 rounded w-24 flex items-center gap-1 transition-colors duration-300 ${isDark ? 'bg-amber-900/30' : 'bg-amber-50/50'}`}>
                      <span className={`text-[8px] sm:text-[9px] font-black uppercase leading-none whitespace-nowrap transition-colors duration-300 ${isDark ? 'text-amber-400' : 'text-amber-400'}`}>Corr:</span>
                      <span className={`text-base sm:text-lg font-black leading-none transition-colors duration-300 ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>{data.correriasCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-6">
              <PaginationComponent
                currentPage={pagination.pagination.page}
                totalPages={pagination.pagination.totalPages}
                pageSize={pagination.pagination.limit}
                onPageChange={pagination.goToPage}
                onPageSizeChange={pagination.setLimit}
              />
            </div>
          </>
        )}
      </div>

      {showReportModal && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-colors duration-300 ${isDark ? 'bg-black/60' : 'bg-black/50'}`}>
          <div className={`rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}>
            <div className={`px-8 py-6 border-b transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-600' : 'bg-gradient-to-r from-green-100 to-green-50 border-green-200'}`}>
              <h3 className={`text-2xl font-black text-center transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-green-800'}`}>Generar Informe</h3>
              <p className={`text-sm text-center mt-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-green-600'}`}>Selecciona el formato</p>
            </div>

            <div className={`border-2 m-6 rounded-2xl p-6 space-y-6 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="space-y-3">
                <label className={`text-xs font-black uppercase tracking-widest text-center block transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-600'}`}>
                  Formato
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setReportFormat('pdf')}
                    className={`flex-1 py-2 px-4 rounded-lg font-black text-sm transition-all ${
                      reportFormat === 'pdf'
                        ? 'bg-red-300 text-red-900 shadow-sm'
                        : isDark ? 'bg-violet-900/40 text-violet-400 hover:bg-violet-900/60' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => setReportFormat('excel')}
                    className={`flex-1 py-2 px-4 rounded-lg font-black text-sm transition-all ${
                      reportFormat === 'excel'
                        ? 'bg-emerald-300 text-emerald-900 shadow-sm'
                        : isDark ? 'bg-violet-900/40 text-violet-400 hover:bg-violet-900/60' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    Excel
                  </button>
                </div>
              </div>
            </div>

            <div className={`flex gap-3 px-8 py-6 border-t transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-700' : 'bg-slate-50 border-slate-200'}`}>
              <button
                onClick={() => {
                  if (reportFormat === 'pdf') {
                    generateInventoryPDF();
                  } else if (reportFormat === 'excel') {
                    generateInventoryExcel();
                  }
                }}
                className="flex-1 py-3 px-4 rounded-lg font-black text-sm bg-gradient-to-r from-green-300 to-green-200 text-green-900 hover:from-green-400 hover:to-green-300 transition-all shadow-sm"
              >
                Generar
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className={`flex-1 py-3 px-4 rounded-lg font-black text-sm transition-all shadow-sm ${isDark ? 'bg-violet-900/40 text-violet-300 hover:bg-violet-900/60' : 'bg-slate-300 text-slate-700 hover:bg-slate-400'}`}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;