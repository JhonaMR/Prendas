import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDarkMode } from '../../context/DarkModeContext';
import { X, Download, ChevronDown, ChevronRight, Package, DollarSign, FileSpreadsheet } from 'lucide-react';
import { AppState } from '../../types';
import ExcelJS from 'exceljs';

interface VendorReportResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: string;
  vendorId: string;
  state: AppState;
}

interface ClientGroup {
  clientId: string;
  clientName: string;
  clientNit: string;
  clientCity: string;
  orderNumbers: string;
  orderedUnits: number;
  orderedValue: number;
  dispatchedUnits: number;
  dispatchedValue: number;
  unitsCompliance: number;
  valueCompliance: number;
}

interface CorreriaSummary {
  correriaId: string;
  correriaName: string;
  ordersCount: number;
  orderedUnits: number;
  orderedValue: number;
  dispatchedUnits: number;
  dispatchedValue: number;
  clients: ClientGroup[];
}

const formatCur = (v: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
const formatNum = (v: number) => new Intl.NumberFormat('es-CO').format(v);

export const VendorReportResultsModal: React.FC<VendorReportResultsModalProps> = ({ isOpen, onClose, year, vendorId, state }) => {
  const { isDark } = useDarkMode();
  const [expandedCorrerias, setExpandedCorrerias] = useState<Record<string, boolean>>({});
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const toggleCorreria = (id: string) => {
    setExpandedCorrerias(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const sellerName = useMemo(() => state.sellers.find(s => s.id === vendorId)?.name || 'Desconocido', [state.sellers, vendorId]);

  const reportData = useMemo(() => {
    if (!year || !vendorId || !state) return [];

    const yearCorrerias = state.correrias.filter(c => c.year === year);
    if (yearCorrerias.length === 0) return [];

    const sellerOrders = state.orders.filter(o => o.sellerId === vendorId);
    
    const relevantCorrerias = yearCorrerias.filter(c => 
      sellerOrders.some(o => o.correriaId === c.id)
    );

    const summaries: CorreriaSummary[] = relevantCorrerias.map(correria => {
      const correriaOrders = sellerOrders.filter(o => o.correriaId === correria.id);
      const clientGroupsMap = new Map<string, ClientGroup>();

      let cOrdersCount = 0;
      let cOrderedUnits = 0;
      let cOrderedValue = 0;
      let cDispatchedUnits = 0;
      let cDispatchedValue = 0;

      correriaOrders.forEach(order => {
        cOrdersCount++;
        const client = state.clients.find(c => c.id === order.clientId);
        const clientId = order.clientId;

        const orderUnits = order.items.reduce((acc, item) => acc + item.quantity, 0);
        let orderValue = 0;
        order.items.forEach(item => {
           orderValue += item.quantity * (item.salePrice || 0);
        });
        if (orderValue === 0) orderValue = order.totalValue || 0;

        cOrderedUnits += orderUnits;
        cOrderedValue += orderValue;

        if (!clientGroupsMap.has(clientId)) {
          clientGroupsMap.set(clientId, {
            clientId,
            clientName: client?.name || 'Desconocido',
            clientNit: client?.nit || 'N/A',
            clientCity: client?.city || 'N/A',
            orderNumbers: order.orderNumber ? order.orderNumber.toString() : 'S/N',
            orderedUnits: orderUnits,
            orderedValue: orderValue,
            dispatchedUnits: 0,
            dispatchedValue: 0,
            unitsCompliance: 0,
            valueCompliance: 0
          });
        } else {
          const group = clientGroupsMap.get(clientId)!;
          if (order.orderNumber) {
            group.orderNumbers = group.orderNumbers === 'S/N' 
              ? order.orderNumber.toString() 
              : `${group.orderNumbers}, ${order.orderNumber}`;
          }
          group.orderedUnits += orderUnits;
          group.orderedValue += orderValue;
        }
      });

      const correriaDispatches = state.dispatches.filter(d => d.correriaId === correria.id);
      
      clientGroupsMap.forEach((group, clientId) => {
        const clientDispatches = correriaDispatches.filter(d => d.clientId === clientId);
        let dispatchedUnits = 0;
        let dispatchedValue = 0;

        clientDispatches.forEach(dispatch => {
          dispatch.items.forEach(item => {
             dispatchedUnits += item.quantity;
             let price = item.salePrice;
             if (!price) {
               const cOrders = correriaOrders.filter(o => o.clientId === clientId);
               for (const o of cOrders) {
                 const oi = o.items.find(x => x.reference === item.reference);
                 if (oi && oi.salePrice) {
                   price = oi.salePrice;
                   break;
                 }
               }
             }
             dispatchedValue += item.quantity * (price || 0);
          });
        });

        group.dispatchedUnits = dispatchedUnits;
        group.dispatchedValue = dispatchedValue;
        group.unitsCompliance = group.orderedUnits > 0 ? (dispatchedUnits / group.orderedUnits) * 100 : 0;
        group.valueCompliance = group.orderedValue > 0 ? (dispatchedValue / group.orderedValue) * 100 : 0;

        cDispatchedUnits += dispatchedUnits;
        cDispatchedValue += dispatchedValue;
      });

      return {
        correriaId: correria.id,
        correriaName: correria.name,
        ordersCount: cOrdersCount,
        orderedUnits: cOrderedUnits,
        orderedValue: cOrderedValue,
        dispatchedUnits: cDispatchedUnits,
        dispatchedValue: cDispatchedValue,
        clients: Array.from(clientGroupsMap.values()).sort((a, b) => {
          const numA = parseInt(a.orderNumbers.split(',')[0]) || 0;
          const numB = parseInt(b.orderNumbers.split(',')[0]) || 0;
          return numA - numB;
        })
      };
    });

    return summaries.filter(s => s.ordersCount > 0);
  }, [year, vendorId, state]);

  const globalTotals = useMemo(() => {
    const totals = reportData.reduce((acc, curr) => {
      const currCompliance = curr.orderedUnits > 0 ? (curr.dispatchedUnits / curr.orderedUnits) * 100 : 0;
      return {
        ordersCount: acc.ordersCount + curr.ordersCount,
        orderedUnits: acc.orderedUnits + curr.orderedUnits,
        orderedValue: acc.orderedValue + curr.orderedValue,
        dispatchedUnits: acc.dispatchedUnits + curr.dispatchedUnits,
        complianceSum: acc.complianceSum + currCompliance,
        validCorreriasCount: acc.validCorreriasCount + 1
      };
    }, { ordersCount: 0, orderedUnits: 0, orderedValue: 0, dispatchedUnits: 0, complianceSum: 0, validCorreriasCount: 0 });
    
    return {
      ...totals,
      avgCompliance: totals.validCorreriasCount > 0 ? (totals.complianceSum / totals.validCorreriasCount) : 0
    };
  }, [reportData]);

  const handleExport = async (correriaId?: string) => {
    if (!reportData || reportData.length === 0) return;
    
    const dataToExport = correriaId ? reportData.filter(r => r.correriaId === correriaId) : reportData;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Informe');

    // Estilos generales
    const headerFont = { name: 'Arial', family: 2, size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    const subHeaderFont = { name: 'Arial', family: 2, size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    const tableHeaderFont = { name: 'Arial', family: 2, size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    const normalFont = { name: 'Arial', family: 2, size: 10 };
    const boldFont = { name: 'Arial', family: 2, size: 10, bold: true };
    const borderAll = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    } as any;
    
    // Header Global
    const titleRow = worksheet.addRow(['INFORME DE CUMPLIMIENTO POR VENDEDOR']);
    titleRow.font = headerFont;
    titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
    worksheet.mergeCells('A1:J1');
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
    titleRow.height = 30;

    const infoRow = worksheet.addRow(['Vendedor:', sellerName, 'Año:', year]);
    infoRow.font = boldFont;
    infoRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
    infoRow.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
    worksheet.mergeCells('D2:J2');

    worksheet.addRow([]);

    let currentRow = 4;

    dataToExport.forEach(correria => {
      // Correria Title
      const cTitleRow = worksheet.addRow([`CORRERÍA: ${correria.correriaName.toUpperCase()}`]);
      cTitleRow.font = subHeaderFont;
      cTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6B21A8' } };
      worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
      cTitleRow.alignment = { horizontal: 'center' };
      currentRow++;

      // Resumen Cabecera
      const summaryHeader = worksheet.addRow(['Total Pedidos', 'Unidades Pedidas', 'Und. Despachadas', '% Cumpl. Und.', 'Valor Pedido', 'Valor Despachado', '% Cumpl. Valor']);
      summaryHeader.font = tableHeaderFont;
      summaryHeader.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B5CF6' } };
        cell.border = borderAll;
        cell.alignment = { horizontal: 'center' };
      });
      currentRow++;

      // Resumen Valores
      const summaryValues = worksheet.addRow([
        correria.ordersCount,
        correria.orderedUnits,
        correria.dispatchedUnits,
        (correria.orderedUnits > 0 ? (correria.dispatchedUnits / correria.orderedUnits) : 0),
        correria.orderedValue,
        correria.dispatchedValue,
        (correria.orderedValue > 0 ? (correria.dispatchedValue / correria.orderedValue) : 0)
      ]);
      summaryValues.font = boldFont;
      summaryValues.eachCell(cell => cell.border = borderAll);
      summaryValues.getCell(1).alignment = { horizontal: 'center' };
      summaryValues.getCell(2).numFmt = '#,##0';
      summaryValues.getCell(3).numFmt = '#,##0';
      summaryValues.getCell(4).numFmt = '0.00%';
      summaryValues.getCell(5).numFmt = '"$"#,##0';
      summaryValues.getCell(6).numFmt = '"$"#,##0';
      summaryValues.getCell(7).numFmt = '0.00%';
      currentRow++;

      worksheet.addRow([]);
      currentRow++;

      // Clients Table Header
      const clientsHeader = worksheet.addRow(['Nº Pedidos', 'Cliente', 'NIT', 'Ciudad', 'Und. Pedidas', 'Und. Despachadas', '% Cumpl. Und.', 'Valor Pedido', 'Valor Despachado', '% Cumpl. Valor']);
      clientsHeader.font = tableHeaderFont;
      clientsHeader.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
        cell.border = borderAll;
        cell.alignment = { horizontal: 'center' };
      });
      currentRow++;
      
      // Clients Rows
      correria.clients.forEach(c => {
        const clientRow = worksheet.addRow([
          c.orderNumbers,
          c.clientName,
          c.clientNit,
          c.clientCity,
          c.orderedUnits,
          c.dispatchedUnits,
          (c.unitsCompliance / 100),
          c.orderedValue,
          c.dispatchedValue,
          (c.valueCompliance / 100)
        ]);
        clientRow.font = normalFont;
        clientRow.eachCell(cell => cell.border = borderAll);
        clientRow.getCell(1).alignment = { horizontal: 'center' };
        clientRow.getCell(5).numFmt = '#,##0';
        clientRow.getCell(6).numFmt = '#,##0';
        clientRow.getCell(7).numFmt = '0.00%';
        clientRow.getCell(8).numFmt = '"$"#,##0';
        clientRow.getCell(9).numFmt = '"$"#,##0';
        clientRow.getCell(10).numFmt = '0.00%';
        currentRow++;
      });

      worksheet.addRow([]);
      worksheet.addRow([]);
      currentRow += 2;
    });

    // Auto-size columns
    worksheet.columns = [
      { width: 25 },
      { width: 40 },
      { width: 15 },
      { width: 20 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 20 },
      { width: 20 },
      { width: 15 }
    ];

    // Download file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Informe_${sellerName.replace(/\s+/g, '_')}_${year}${correriaId ? `_${dataToExport[0].correriaName}` : ''}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    setShowExportMenu(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-hidden"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className={`w-full max-w-7xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border ${isDark ? 'bg-[#2a1a4a] border-violet-700' : 'bg-white border-slate-200'}`}
        >
          {/* Header */}
          <div className={`flex-shrink-0 px-8 py-6 border-b flex justify-between items-center transition-colors duration-300 ${isDark ? 'border-violet-700 bg-[#322055]' : 'border-slate-100 bg-slate-50'}`}>
            <div className="flex flex-wrap items-center gap-8 flex-1">
              <div>
                <h2 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>
                  {sellerName}
                </h2>
                <p className={`text-sm font-bold tracking-widest uppercase mt-1 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>
                  Año {year}
                </p>
              </div>

              {/* Global KPI Cards */}
              <div className="flex flex-wrap gap-4">
                <div className={`px-5 py-3 rounded-2xl border ${isDark ? 'bg-[#1e1136] border-violet-800' : 'bg-white border-slate-200'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Total Pedidos</p>
                  <p className={`text-xl font-black ${isDark ? 'text-violet-100' : 'text-slate-800'}`}>{formatNum(globalTotals.ordersCount)}</p>
                </div>
                <div className={`px-5 py-3 rounded-2xl border ${isDark ? 'bg-[#1e1136] border-violet-800' : 'bg-white border-slate-200'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Total Und. Vendidas</p>
                  <p className={`text-xl font-black ${isDark ? 'text-violet-100' : 'text-slate-800'}`}>{formatNum(globalTotals.orderedUnits)}</p>
                </div>
                <div className={`px-5 py-3 rounded-2xl border ${isDark ? 'bg-[#1e1136] border-violet-800' : 'bg-white border-slate-200'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Total Valor Vendido</p>
                  <p className={`text-xl font-black text-emerald-500`}>{formatCur(globalTotals.orderedValue)}</p>
                </div>
                <div className={`px-5 py-3 rounded-2xl border ${isDark ? 'bg-[#1e1136] border-violet-800' : 'bg-white border-slate-200'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Cump.</p>
                  <p className={`text-xl font-black ${globalTotals.avgCompliance >= 100 ? 'text-emerald-500' : isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    {globalTotals.avgCompliance.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 relative">
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md ${
                    isDark ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Exportar
                  <ChevronDown className="w-3 h-3 ml-1" />
                </button>
                
                {/* Export Dropdown */}
                {showExportMenu && (
                  <div className={`absolute right-0 mt-2 w-56 py-2 rounded-2xl shadow-xl border z-10 ${isDark ? 'bg-[#322055] border-violet-700' : 'bg-white border-slate-200'}`}>
                    <button
                      onClick={() => handleExport()}
                      className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${isDark ? 'hover:bg-violet-800/50 text-violet-100' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                      Todas las Correrías
                    </button>
                    <div className={`my-1 border-t ${isDark ? 'border-violet-800' : 'border-slate-100'}`}></div>
                    {reportData.map(c => (
                      <button
                        key={`exp-${c.correriaId}`}
                        onClick={() => handleExport(c.correriaId)}
                        className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${isDark ? 'hover:bg-violet-800/50 text-violet-300' : 'hover:bg-slate-50 text-slate-500'}`}
                      >
                        {c.correriaName}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-violet-800/50 text-violet-300' : 'hover:bg-slate-200 text-slate-500'}`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className={`flex-1 overflow-y-auto p-8 space-y-6 ${isDark ? 'bg-[#2a1a4a]' : 'bg-slate-50'}`}>
            {reportData.length === 0 ? (
              <div className="text-center py-20">
                <p className={`text-lg font-bold uppercase tracking-widest ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>No hay datos para el año {year} de este vendedor.</p>
              </div>
            ) : (
              reportData.map(correria => {
                const isExpanded = expandedCorrerias[correria.correriaId];
                const unitsPct = correria.orderedUnits > 0 ? (correria.dispatchedUnits / correria.orderedUnits) * 100 : 0;
                const valuePct = correria.orderedValue > 0 ? (correria.dispatchedValue / correria.orderedValue) * 100 : 0;

                return (
                  <div key={correria.correriaId} className={`rounded-3xl border overflow-hidden transition-all shadow-sm ${isDark ? 'bg-[#322055] border-violet-700' : 'bg-white border-slate-200'}`}>
                    {/* Correria Header (Clickable) */}
                    <button
                      onClick={() => toggleCorreria(correria.correriaId)}
                      className={`w-full px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${isDark ? 'hover:bg-violet-800/30' : 'hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${isDark ? 'bg-[#4a3a63]' : 'bg-slate-100'}`}>
                          {isExpanded ? (
                            <ChevronDown className={`w-5 h-5 ${isDark ? 'text-violet-300' : 'text-slate-500'}`} />
                          ) : (
                            <ChevronRight className={`w-5 h-5 ${isDark ? 'text-violet-300' : 'text-slate-500'}`} />
                          )}
                        </div>
                        <div className="text-left">
                          <h3 className={`text-lg font-black uppercase tracking-tight ${isDark ? 'text-violet-100' : 'text-slate-800'}`}>
                            {correria.correriaName}
                          </h3>
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>
                            {correria.ordersCount} Pedido{correria.ordersCount !== 1 && 's'}
                          </p>
                        </div>
                      </div>

                      {/* Correria KPI mini-summary */}
                      <div className="flex gap-6 items-center">
                        <div className="text-right">
                          <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Unds (Vend / Desp)</p>
                          <p className={`text-sm font-black ${isDark ? 'text-violet-100' : 'text-slate-700'}`}>
                            {formatNum(correria.orderedUnits)} / {formatNum(correria.dispatchedUnits)}
                            <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-lg ${unitsPct >= 100 ? 'bg-emerald-500/20 text-emerald-600' : 'bg-rose-500/20 text-rose-600'}`}>
                              {unitsPct.toFixed(1)}%
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Valor (Vend / Desp)</p>
                          <p className={`text-sm font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            {formatCur(correria.orderedValue)} / {formatCur(correria.dispatchedValue)}
                            <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-lg ${valuePct >= 100 ? 'bg-emerald-500/20 text-emerald-600' : 'bg-rose-500/20 text-rose-600'}`}>
                              {valuePct.toFixed(1)}%
                            </span>
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Table Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className={`p-4 border-t ${isDark ? 'border-violet-700 bg-[#251744]' : 'border-slate-100 bg-slate-50/50'}`}>
                            <div className={`overflow-x-auto rounded-2xl border ${isDark ? 'border-violet-700/50' : 'border-slate-200'}`}>
                              <table className="w-full text-left whitespace-nowrap">
                                <thead>
                                  <tr className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-[#1e1136] text-violet-300' : 'bg-slate-100 text-slate-500'}`}>
                                    <th className="px-3 py-2 border-r border-transparent">Nº Pedido</th>
                                    <th className="px-3 py-2 border-r border-transparent">Cliente</th>
                                    <th className="px-3 py-2 border-r border-transparent">NIT</th>
                                    <th className="px-3 py-2 border-r border-transparent">Ciudad</th>
                                    <th className="px-3 py-2 border-r border-transparent text-right">Und Ped</th>
                                    <th className="px-3 py-2 border-r border-transparent text-right">Und Desp</th>
                                    <th className="px-3 py-2 border-r border-transparent text-right">% Und</th>
                                    <th className="px-3 py-2 border-r border-transparent text-right">Val Pedido</th>
                                    <th className="px-3 py-2 border-r border-transparent text-right">Val Desp</th>
                                    <th className="px-3 py-2 text-right">% Valor</th>
                                  </tr>
                                </thead>
                                <tbody className={`text-xs font-semibold ${isDark ? 'text-violet-100' : 'text-slate-700'}`}>
                                  {correria.clients.map((c, idx) => (
                                    <tr key={c.clientId} className={`transition-colors ${idx % 2 === 0 ? (isDark ? 'bg-[#322055]/50' : 'bg-white') : (isDark ? 'bg-[#2a1a4a]/50' : 'bg-slate-50/30')} hover:${isDark ? 'bg-violet-900/40' : 'bg-slate-100'}`}>
                                      <td className="px-3 py-1.5">{c.orderNumbers}</td>
                                      <td className="px-3 py-1.5 max-w-[150px] truncate" title={c.clientName}>{c.clientName}</td>
                                      <td className="px-3 py-1.5 opacity-70">{c.clientNit}</td>
                                      <td className="px-3 py-1.5 opacity-70">{c.clientCity}</td>
                                      <td className="px-3 py-1.5 text-right font-black">{formatNum(c.orderedUnits)}</td>
                                      <td className="px-3 py-1.5 text-right font-black opacity-80">{formatNum(c.dispatchedUnits)}</td>
                                      <td className={`px-3 py-1.5 text-right font-black ${c.unitsCompliance >= 100 ? 'text-emerald-500' : c.unitsCompliance > 0 ? 'text-amber-500' : 'text-rose-500'}`}>{c.unitsCompliance.toFixed(1)}%</td>
                                      <td className="px-3 py-1.5 text-right font-black">{formatCur(c.orderedValue)}</td>
                                      <td className="px-3 py-1.5 text-right font-black opacity-80">{formatCur(c.dispatchedValue)}</td>
                                      <td className={`px-3 py-1.5 text-right font-black ${c.valueCompliance >= 100 ? 'text-emerald-500' : c.valueCompliance > 0 ? 'text-amber-500' : 'text-rose-500'}`}>{c.valueCompliance.toFixed(1)}%</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
