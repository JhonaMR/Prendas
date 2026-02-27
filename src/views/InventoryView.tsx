import React, { useMemo, useState } from 'react';
import { BatchReception, Dispatch, ItemEntry, Reference, UserRole } from '../types';
import PaginationComponent from '../components/PaginationComponent';
import usePagination from '../hooks/usePagination';
import InventoryInsumosView from './InventoryInsumosView';

interface InventoryViewProps {
  receptions?: BatchReception[];
  dispatches?: Dispatch[];
  references?: Reference[];
  orders?: any[];
  correrias?: any[];
  user?: any;
}

const InventoryView: React.FC<InventoryViewProps> = ({
  receptions = [],
  dispatches = [],
  references = [],
  orders = [],
  correrias = [],
  user
}) => {
  const [search, setSearch] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [inventoryType, setInventoryType] = useState<'selector' | 'supplies' | 'finished'>('selector');
  const pagination = usePagination(1, 20);

  // Verificar si el usuario es Admin u Observer
  const canGenerateReports = user && (user.role === UserRole.ADMIN || user.role === 'admin' || user.role === UserRole.OBSERVER || user.role === 'observer');

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
      dispatched: number,
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
            stock[item.reference] = { received: 0, dispatched: 0, available: 0, lotsCount: 0, ordersCount: 0, correriasCount: 0 };
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

    return stock;
  }, [receptions, dispatches, orders]);

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

      const reportData = Object.entries(stockByRef).map(([ref, data]: [string, any]) => ({
        referencia: ref,
        descripcion: refDescriptionMap[ref] || '',
        cantidad: data.available
      }));

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

      const reportData = Object.entries(stockByRef).map(([ref, data]: [string, any]) => ({
        referencia: ref,
        descripcion: refDescriptionMap[ref] || '',
        cantidad: data.available
      }));

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
      <div className="space-y-8 pb-20">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Inventario</h2>
          <p className="text-slate-400 font-medium">Selecciona el tipo de inventario</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button
            onClick={() => setInventoryType('finished')}
            className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all flex flex-col items-center justify-center gap-6 min-h-[400px]"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-blue-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H2.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-800">Inventario de Producto Terminado</h3>
              <p className="text-slate-400 font-medium">Existencias de referencias confeccionadas</p>
            </div>
          </button>

          <button
            onClick={() => setInventoryType('supplies')}
            className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md hover:border-orange-200 transition-all flex flex-col items-center justify-center gap-6 min-h-[400px]"
          >
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-orange-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375M12 9.75v.75m0 2.25v.75m0 2.25v.75" />
              </svg>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-800">Inventario de Insumos</h3>
              <p className="text-slate-400 font-medium">Materias primas y materiales</p>
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
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter">Inventario</h2>
          <p className="text-slate-400 font-medium text-sm sm:text-base">Existencias actuales por referencia</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={() => setInventoryType('selector')}
            className="px-6 py-4 rounded-[24px] bg-white text-slate-400 font-bold hover:text-slate-600 transition-all border border-slate-100 text-sm"
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
                className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[24px] focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-900 shadow-sm text-sm"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
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
          <div className="bg-white p-12 sm:p-24 rounded-[32px] sm:rounded-[48px] border-2 border-dashed border-slate-200 text-center text-slate-400 font-bold italic">
            {search ? `No se encontraron resultados para "${search}"` : 'No hay mercancía registrada en bodega'}
          </div>
        ) : (
          <>
            {paginatedStock.map(([ref, data]) => (
              <div key={ref} className="bg-white rounded-[20px] sm:rounded-[24px] shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all border-l-4 border-l-blue-500 px-4 py-2 sm:py-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                  <div className="flex items-center gap-2 min-w-fit">
                    <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight leading-none">{ref}</h3>
                    <span className="px-1 py-0 bg-blue-100 text-blue-600 text-[8px] sm:text-[9px] font-black uppercase tracking-widest rounded leading-none whitespace-nowrap">
                      Lotes: {data.lotsCount}
                    </span>
                  </div>

                  {refDescriptionMap[ref] && (
                    <p className="text-[11px] sm:text-sm font-medium text-slate-500 leading-tight flex-1 truncate">{refDescriptionMap[ref]}</p>
                  )}

                  <div className="flex gap-4 sm:gap-6">
                    <div className="px-2 py-1 bg-blue-50/50 rounded w-24 flex items-center gap-1">
                      <span className="text-[8px] sm:text-[9px] font-black text-blue-400 uppercase leading-none whitespace-nowrap">Ing:</span>
                      <span className="text-base sm:text-lg font-black text-blue-600 leading-none">+{data.received}</span>
                    </div>

                    <div className="px-2 py-1 bg-pink-50/50 rounded w-24 flex items-center gap-1">
                      <span className="text-[8px] sm:text-[9px] font-black text-pink-400 uppercase leading-none whitespace-nowrap">Desp:</span>
                      <span className="text-base sm:text-lg font-black text-pink-600 leading-none">-{data.dispatched}</span>
                    </div>

                    <div className="px-2 py-1 bg-white rounded-lg shadow-xs border border-slate-100 w-24 flex items-center gap-1">
                      <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none whitespace-nowrap">Stock:</span>
                      <span className="text-base sm:text-lg font-black text-blue-600 leading-none">{data.available}</span>
                    </div>

                    <div className="px-2 py-1 bg-white rounded-lg shadow-xs border border-slate-100 w-24 flex items-center gap-1">
                      <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none whitespace-nowrap">Recib:</span>
                      <span className="text-base sm:text-lg font-black text-slate-800 leading-none">{data.received}</span>
                    </div>

                    <div className="px-2 py-1 bg-purple-50/50 rounded w-24 flex items-center gap-1">
                      <span className="text-[8px] sm:text-[9px] font-black text-purple-400 uppercase leading-none whitespace-nowrap">Ped:</span>
                      <span className="text-base sm:text-lg font-black text-purple-600 leading-none">{data.ordersCount}</span>
                    </div>

                    <div className="px-2 py-1 bg-amber-50/50 rounded w-24 flex items-center gap-1">
                      <span className="text-[8px] sm:text-[9px] font-black text-amber-400 uppercase leading-none whitespace-nowrap">Corr:</span>
                      <span className="text-base sm:text-lg font-black text-amber-600 leading-none">{data.correriasCount}</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-green-100 to-green-50 px-8 py-6 border-b border-green-200">
              <h3 className="text-2xl font-black text-green-800 text-center">Generar Informe</h3>
              <p className="text-sm text-green-600 text-center mt-1">Selecciona el formato</p>
            </div>

            <div className="border-2 border-slate-200 m-6 rounded-2xl p-6 space-y-6 bg-slate-50">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-600 uppercase tracking-widest text-center block">
                  Formato
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setReportFormat('pdf')}
                    className={`flex-1 py-2 px-4 rounded-lg font-black text-sm transition-all ${
                      reportFormat === 'pdf'
                        ? 'bg-red-300 text-red-900 shadow-sm'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => setReportFormat('excel')}
                    className={`flex-1 py-2 px-4 rounded-lg font-black text-sm transition-all ${
                      reportFormat === 'excel'
                        ? 'bg-emerald-300 text-emerald-900 shadow-sm'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    Excel
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-8 py-6 bg-slate-50 border-t border-slate-200">
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
                className="flex-1 py-3 px-4 rounded-lg font-black text-sm bg-slate-300 text-slate-700 hover:bg-slate-400 transition-all shadow-sm"
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