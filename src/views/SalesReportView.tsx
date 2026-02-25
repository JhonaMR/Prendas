import React, { useState, useMemo, useRef } from 'react';
import { AppState, Correria } from '../types';

interface SalesReportViewProps {
  state: AppState;
}

const SalesReportView: React.FC<SalesReportViewProps> = ({ state }) => {
  
  const [selectedCorreriaId, setSelectedCorreriaId] = useState(state.correrias[0]?.id || '');
  const [correriaSearch, setCorreriaSearch] = useState('');
  const [showCorreriaDropdown, setShowCorreriaDropdown] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    includeDespachadas: true,
    sortBy: 'reference', // 'reference' o 'vendidas'
    format: 'pdf', // 'pdf' o 'excel'
    includeZeroSales: true // incluir referencias con 0 vendidas
  });

  // Obtener solo las referencias de la correría seleccionada (maleta)
  const maletaReferences = useMemo(() => {
    if (!selectedCorreriaId) return [];
    
    return state.references.filter(ref => 
      ref.correrias && ref.correrias.includes(selectedCorreriaId)
    );
  }, [selectedCorreriaId, state.references]);

  // Calcular métricas
  const metrics = useMemo(() => {
    if (!selectedCorreriaId) return null;

    const maletaRefIds = maletaReferences.map(r => r.id);

    // Pedidos de esta correría (solo refs de la maleta)
    const correriaOrders = state.orders.filter(o => 
      o.correriaId === selectedCorreriaId &&
      o.items.some(item => maletaRefIds.includes(item.reference))
    );

    // Despachos de esta correría (solo refs de la maleta)
    const correriaDispatches = state.dispatches.filter(d => 
      d.correriaId === selectedCorreriaId &&
      d.items.some(item => maletaRefIds.includes(item.reference))
    );

    // Total vendidas (solo de refs en maleta)
    const totalVendidas = correriaOrders.reduce((acc, order) => {
      return acc + order.items
        .filter(item => maletaRefIds.includes(item.reference))
        .reduce((sum, item) => sum + item.quantity, 0);
    }, 0);

    // Total despachadas (solo de refs en maleta)
    const totalDespachadas = correriaDispatches.reduce((acc, dispatch) => {
      return acc + dispatch.items
        .filter(item => maletaRefIds.includes(item.reference))
        .reduce((sum, item) => sum + item.quantity, 0);
    }, 0);

    // Referencias vendidas (al menos 1 unidad)
    const refsVendidas = maletaRefIds.filter(refId => {
      return correriaOrders.some(order => 
        order.items.some(item => item.reference === refId && item.quantity > 0)
      );
    });

    const refsEnCero = maletaReferences.length - refsVendidas.length;
    const efectividad = maletaReferences.length > 0 
      ? ((refsVendidas.length / maletaReferences.length) * 100) 
      : 0;

    // Cumplimiento unidades
    const cumplimientoUnidades = totalVendidas > 0 
      ? ((totalDespachadas / totalVendidas) * 100) 
      : 0;

    // Total valores
    const totalVendidoValor = correriaOrders.reduce((acc, order) => {
      return acc + order.items
        .filter(item => maletaRefIds.includes(item.reference))
        .reduce((sum, item) => {
          const ref = state.references.find(r => r.id === item.reference);
          return sum + (item.quantity * (ref?.price || 0));
        }, 0);
    }, 0);

    const totalDespachadoValor = correriaDispatches.reduce((acc, dispatch) => {
      return acc + dispatch.items
        .filter(item => maletaRefIds.includes(item.reference))
        .reduce((sum, item) => {
          // Usar el salePrice del despacho si existe, si no buscar en el pedido
          const salePrice = item.salePrice || correriaOrders.find(o => o.clientId === dispatch.clientId)?.items.find(oi => oi.reference === item.reference)?.salePrice || 0;
          
          console.log(`📦 Despacho item ${item.reference}: item.salePrice=${item.salePrice}, final salePrice=${salePrice}, cantidad=${item.quantity}, subtotal=${item.quantity * salePrice}`);
          
          return sum + (item.quantity * salePrice);
        }, 0);
    }, 0);

    const diferenciaValor = totalVendidoValor - totalDespachadoValor;
    const cumplimientoValor = totalVendidoValor > 0 
      ? ((totalDespachadoValor / totalVendidoValor) * 100) 
      : 0;

    // Análisis por vendedor
    const vendedoresData = state.sellers.map(seller => {
      const sellerOrders = correriaOrders.filter(o => o.sellerId === seller.id);
      
      const vendidas = sellerOrders.reduce((acc, order) => {
        return acc + order.items
          .filter(item => maletaRefIds.includes(item.reference))
          .reduce((sum, item) => sum + item.quantity, 0);
      }, 0);

      // Despachos de los clientes de este vendedor
      const clientIds = sellerOrders.map(o => o.clientId);
      const despachadas = correriaDispatches
        .filter(d => clientIds.includes(d.clientId))
        .reduce((acc, dispatch) => {
          return acc + dispatch.items
            .filter(item => maletaRefIds.includes(item.reference))
            .reduce((sum, item) => sum + item.quantity, 0);
        }, 0);

      const ventas = sellerOrders.reduce((acc, order) => {
        return acc + order.items
          .filter(item => maletaRefIds.includes(item.reference))
          .reduce((sum, item) => {
            const ref = state.references.find(r => r.id === item.reference);
            return sum + (item.quantity * (ref?.price || 0));
          }, 0);
      }, 0);

      const cumplimientoUnd = vendidas > 0 ? ((despachadas / vendidas) * 100) : 0;
      
      const valorDespachado = correriaDispatches
        .filter(d => clientIds.includes(d.clientId))
        .reduce((acc, dispatch) => {
          return acc + dispatch.items
            .filter(item => maletaRefIds.includes(item.reference))
            .reduce((sum, item) => {
              const ref = state.references.find(r => r.id === item.reference);
              return sum + (item.quantity * (ref?.price || 0));
            }, 0);
        }, 0);

      const cumplimientoValor = ventas > 0 ? ((valorDespachado / ventas) * 100) : 0;
      const porcentajeVenta = totalVendidoValor > 0 ? ((ventas / totalVendidoValor) * 100) : 0;

      return {
        nombre: seller.name,
        pedidos: sellerOrders.length,
        vendidas,
        despachadas,
        ventas,
        cumplimientoUnd,
        cumplimientoValor,
        porcentajeVenta
      };
    }).filter(v => v.pedidos > 0); // Solo vendedores con pedidos

    // Análisis de Valores Vendidos por Vendedor
    const valoresVendidosData = state.sellers.map(seller => {
      const sellerOrders = correriaOrders.filter(o => o.sellerId === seller.id);
      const clientIds = sellerOrders.map(o => o.clientId);

      // Cantidad de pedidos
      const cantidadPedidos = sellerOrders.length;

      // Valor vendido a precio de lista (referencia price)
      const valorListaTotal = sellerOrders.reduce((acc, order) => {
        return acc + order.items
          .filter(item => maletaRefIds.includes(item.reference))
          .reduce((sum, item) => {
            const ref = state.references.find(r => r.id === item.reference);
            return sum + (item.quantity * (ref?.price || 0));
          }, 0);
      }, 0);

      // Valor vendido real (totalValue del pedido - ya incluye descuentos)
      const valorRealTotal = sellerOrders
        .filter(order => order.items.some(item => maletaRefIds.includes(item.reference)))
        .reduce((acc, order) => acc + order.totalValue, 0);

      // Diferencia valor
      const diferenciaValorVendedor = valorListaTotal - valorRealTotal;

      // Valor despachado a precio de pedidos (busca el pedido específico por correría y cliente)
      const valorDespachadoReal = correriaDispatches
        .filter(d => clientIds.includes(d.clientId))
        .reduce((acc, dispatch) => {
          return acc + dispatch.items
            .filter(item => maletaRefIds.includes(item.reference))
            .reduce((sum, dispatchItem) => {
              // Usar el salePrice del despacho si existe, si no buscar en el pedido
              const salePrice = dispatchItem.salePrice || correriaOrders.find(o => o.clientId === dispatch.clientId)?.items.find(oi => oi.reference === dispatchItem.reference)?.salePrice || 0;
              
              return sum + (dispatchItem.quantity * salePrice);
            }, 0);
        }, 0);

      // Cumplimiento real (valor despachado / valor vendido real)
      const cumplimientoReal = valorRealTotal > 0 ? ((valorDespachadoReal / valorRealTotal) * 100) : 0;

      return {
        nombre: seller.name,
        pedidos: cantidadPedidos,
        valorLista: valorListaTotal,
        valorReal: valorRealTotal,
        diferencia: diferenciaValorVendedor,
        valorDespachado: valorDespachadoReal,
        cumplimientoReal
      };
    }).filter(v => v.pedidos > 0); // Solo vendedores con pedidos

    // Análisis por diseñadora
    const disenadoras = [...new Set(maletaReferences.map(r => r.designer))].filter(Boolean);
    
    const disenadorasData = disenadoras.map(designer => {
      const refsCreadas = maletaReferences.filter(r => r.designer === designer);
      const refIds = refsCreadas.map(r => r.id);

      const refsVendidasDesigner = refIds.filter(refId => {
        return correriaOrders.some(order => 
          order.items.some(item => item.reference === refId && item.quantity > 0)
        );
      });

      const ventasGeneradas = correriaOrders.reduce((acc, order) => {
        return acc + order.items
          .filter(item => refIds.includes(item.reference))
          .reduce((sum, item) => {
            const ref = state.references.find(r => r.id === item.reference);
            return sum + (item.quantity * (ref?.price || 0));
          }, 0);
      }, 0);

      const exitoPedido = refsCreadas.length > 0 
        ? ((refsVendidasDesigner.length / refsCreadas.length) * 100) 
        : 0;

      const refsEnCeroDesigner = refsCreadas.length - refsVendidasDesigner.length;
      const porcentajeEnCero = refsCreadas.length > 0 
        ? ((refsEnCeroDesigner / refsCreadas.length) * 100) 
        : 0;

      return {
        nombre: designer,
        ventasGeneradas,
        refsCreadas: refsCreadas.length,
        refsVendidas: refsVendidasDesigner.length,
        exitoPedido,
        refsEnCero: refsEnCeroDesigner,
        porcentajeEnCero
      };
    }).sort((a, b) => b.ventasGeneradas - a.ventasGeneradas);

    return {
      // Card 1
      totalRefsUnicas: maletaReferences.length,
      refsEnCero,
      porcentajeEnCero: maletaReferences.length > 0 ? ((refsEnCero / maletaReferences.length) * 100) : 0,
      efectividad,

      // Card 2
      totalVendidas,
      totalDespachadas,
      cumplimientoUnidades,

      // Card 3
      totalVendidoValor,
      totalDespachadoValor,
      diferenciaValor,
      porcentajeDiferencia: totalVendidoValor > 0 ? ((diferenciaValor / totalVendidoValor) * 100) : 0,
      cumplimientoValor,

      // Tablas
      vendedoresData,
      valoresVendidosData,
      disenadorasData
    };
  }, [selectedCorreriaId, state, maletaReferences]);

  const selectedCorreria = state.correrias.find(c => c.id === selectedCorreriaId);

  // Función para generar el informe PDF
  const generatePDFReport = async () => {
    try {
      // Importar dinámicamente las librerías
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      if (!selectedCorreriaId || !metrics) return;

      // Preparar datos del informe
      const maletaRefIds = maletaReferences.map(r => r.id);
      const correriaOrders = state.orders.filter(o => 
        o.correriaId === selectedCorreriaId &&
        o.items.some(item => maletaRefIds.includes(item.reference))
      );

      const correriaDispatches = state.dispatches.filter(d => 
        d.correriaId === selectedCorreriaId &&
        d.items.some(item => maletaRefIds.includes(item.reference))
      );

      // Construir datos de referencias
      let reportData = maletaReferences.map(ref => {
        // Unidades vendidas
        const vendidas = correriaOrders.reduce((acc, order) => {
          return acc + order.items
            .filter(item => item.reference === ref.id)
            .reduce((sum, item) => sum + item.quantity, 0);
        }, 0);

        // Unidades despachadas
        const despachadas = correriaDispatches.reduce((acc, dispatch) => {
          return acc + dispatch.items
            .filter(item => item.reference === ref.id)
            .reduce((sum, item) => sum + item.quantity, 0);
        }, 0);

        return {
          referencia: ref.id,
          vendidas,
          inventario: ref.inventory || 0,
          programadas: ref.programmed || 0,
          cortadas: ref.cut || 0,
          pendientes: ref.pending || 0,
          despachadas
        };
      });

      // Filtrar referencias con 0 vendidas si no está seleccionado
      if (!reportConfig.includeZeroSales) {
        reportData = reportData.filter(r => r.vendidas > 0);
      }

      // Ordenar datos
      if (reportConfig.sortBy === 'reference') {
        reportData.sort((a, b) => a.referencia.localeCompare(b.referencia));
      } else {
        reportData.sort((a, b) => b.vendidas - a.vendidas);
      }

      // Crear documento PDF
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

      // Definir columnas
      const columns = reportConfig.includeDespachadas
        ? ['Referencia', 'Und. Vendidas', 'Inventario', 'Programadas', 'Cortadas', 'Pendientes', 'Despachadas']
        : ['Referencia', 'Und. Vendidas', 'Inventario', 'Programadas', 'Cortadas', 'Pendientes'];

      const columnWidths = reportConfig.includeDespachadas
        ? [contentWidth * 0.143, contentWidth * 0.143, contentWidth * 0.143, contentWidth * 0.143, contentWidth * 0.143, contentWidth * 0.143, contentWidth * 0.142]
        : [contentWidth * 0.167, contentWidth * 0.167, contentWidth * 0.167, contentWidth * 0.167, contentWidth * 0.166, contentWidth * 0.166];

      // Función para dibujar encabezado de tabla
      const drawTableHeader = () => {
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);

        let xPos = margin;
        columns.forEach((col, idx) => {
          // Dibujar solo el borde, sin relleno
          doc.rect(xPos, yPosition, columnWidths[idx], headerRowHeight);
          doc.text(col, xPos + columnWidths[idx] / 2, yPosition + 4.5, { align: 'center' });
          xPos += columnWidths[idx];
        });

        yPosition += headerRowHeight;
      };

      // Función para dibujar fila de datos
      const drawDataRow = (rowData: (string | number)[]) => {
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);

        let xPos = margin;
        rowData.forEach((cell, idx) => {
          // Dibujar solo el borde, sin relleno
          doc.rect(xPos, yPosition, columnWidths[idx], dataRowHeight);
          
          // Primera columna (Referencia) en negrita
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

      // Función para agregar encabezado del documento
      const addDocumentHeader = () => {
        const sortLabel = reportConfig.sortBy === 'reference' ? 'Por Referencia' : 'Por Unidades Vendidas';
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(`Informe de Ventas - ${sortLabel}`, pageWidth / 2, margin + 3, { align: 'center' });

        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.text(`Correría: ${selectedCorreria?.name} ${selectedCorreria?.year}`, pageWidth / 2, margin + 8, { align: 'center' });
        doc.text(`Generado: ${new Date().toLocaleDateString()}`, pageWidth / 2, margin + 12, { align: 'center' });

        yPosition = margin + 16;
      };

      // Agregar encabezado inicial
      addDocumentHeader();

      // Dibujar encabezado de tabla
      drawTableHeader();

      // Dibujar filas de datos
      for (let i = 0; i < reportData.length; i++) {
        const row = reportData[i];
        const rowData = reportConfig.includeDespachadas
          ? [row.referencia, row.vendidas, row.inventario, row.programadas, row.cortadas, row.pendientes, row.despachadas]
          : [row.referencia, row.vendidas, row.inventario, row.programadas, row.cortadas, row.pendientes];

        // Verificar si necesita nueva página
        if (yPosition + dataRowHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          drawTableHeader();
        }

        drawDataRow(rowData);
      }

      // Descargar PDF
      doc.save(`Informe_Ventas_${selectedCorreria?.name}_${new Date().getTime()}.pdf`);
      setShowReportModal(false);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Asegúrate de tener las librerías instaladas.');
    }
  };

  // Función para generar el informe Excel
  const generateExcelReport = async () => {
    try {
      const ExcelJS = await import('exceljs');
      const Workbook = ExcelJS.Workbook;

      if (!selectedCorreriaId || !metrics) return;

      // Preparar datos del informe
      const maletaRefIds = maletaReferences.map(r => r.id);
      const correriaOrders = state.orders.filter(o => 
        o.correriaId === selectedCorreriaId &&
        o.items.some(item => maletaRefIds.includes(item.reference))
      );

      const correriaDispatches = state.dispatches.filter(d => 
        d.correriaId === selectedCorreriaId &&
        d.items.some(item => maletaRefIds.includes(item.reference))
      );

      // Construir datos de referencias
      let reportData = maletaReferences.map(ref => {
        // Unidades vendidas
        const vendidas = correriaOrders.reduce((acc, order) => {
          return acc + order.items
            .filter(item => item.reference === ref.id)
            .reduce((sum, item) => sum + item.quantity, 0);
        }, 0);

        // Unidades despachadas
        const despachadas = correriaDispatches.reduce((acc, dispatch) => {
          return acc + dispatch.items
            .filter(item => item.reference === ref.id)
            .reduce((sum, item) => sum + item.quantity, 0);
        }, 0);

        return {
          referencia: ref.id,
          vendidas,
          inventario: ref.inventory || 0,
          programadas: ref.programmed || 0,
          cortadas: ref.cut || 0,
          pendientes: ref.pending || 0,
          despachadas
        };
      });

      // Filtrar referencias con 0 vendidas si no está seleccionado
      if (!reportConfig.includeZeroSales) {
        reportData = reportData.filter(r => r.vendidas > 0);
      }

      // Ordenar datos
      if (reportConfig.sortBy === 'reference') {
        reportData.sort((a, b) => a.referencia.localeCompare(b.referencia));
      } else {
        reportData.sort((a, b) => b.vendidas - a.vendidas);
      }

      // Crear workbook
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Informe de Ventas');

      // Configurar página: Carta, márgenes estrechos
      worksheet.pageSetup = {
        paperSize: 1 as any, // Letter
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

      // Definir bordes
      const border = {
        top: { style: 'thin' as any, color: { argb: 'FF000000' } },
        bottom: { style: 'thin' as any, color: { argb: 'FF000000' } },
        left: { style: 'thin' as any, color: { argb: 'FF000000' } },
        right: { style: 'thin' as any, color: { argb: 'FF000000' } }
      };

      // Estilos
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

      // Agregar títulos
      const sortLabel = reportConfig.sortBy === 'reference' ? 'Por Referencia' : 'Por Unidades Vendidas';
      const titleRow = worksheet.addRow([`Informe de Ventas - ${sortLabel}`]);
      titleRow.eachCell(cell => { cell.style = titleStyle; });
      titleRow.height = 20;
      // Fusionar celdas del título
      const numColumns = reportConfig.includeDespachadas ? 7 : 6;
      worksheet.mergeCells(titleRow.number, 1, titleRow.number, numColumns);

      const infoRow1 = worksheet.addRow([`Correría: ${selectedCorreria?.name} ${selectedCorreria?.year}`]);
      infoRow1.eachCell(cell => { cell.style = infoStyle; });
      // Fusionar celdas de correría
      worksheet.mergeCells(infoRow1.number, 1, infoRow1.number, numColumns);

      const infoRow2 = worksheet.addRow([`Generado: ${new Date().toLocaleDateString()}`]);
      infoRow2.eachCell(cell => { cell.style = infoStyle; });
      // Fusionar celdas de fecha
      worksheet.mergeCells(infoRow2.number, 1, infoRow2.number, numColumns);

      // Fila vacía
      worksheet.addRow([]);

      // Encabezados de tabla
      const columns = reportConfig.includeDespachadas
        ? ['Referencia', 'Und. Vendidas', 'Inventario', 'Programadas', 'Cortadas', 'Pendientes', 'Despachadas']
        : ['Referencia', 'Und. Vendidas', 'Inventario', 'Programadas', 'Cortadas', 'Pendientes'];

      const headerRow = worksheet.addRow(columns);
      headerRow.eachCell(cell => { cell.style = headerStyle; });
      headerRow.height = 18;

      // Ajustar ancho de columnas
      const columnWidths = reportConfig.includeDespachadas
        ? [15, 15, 15, 15, 15, 15, 15]
        : [18, 18, 18, 18, 18, 18];
      
      columns.forEach((col, idx) => {
        worksheet.getColumn(idx + 1).width = columnWidths[idx];
      });

      // Agregar datos
      reportData.forEach(row => {
        const rowData = reportConfig.includeDespachadas
          ? [row.referencia, row.vendidas, row.inventario, row.programadas, row.cortadas, row.pendientes, row.despachadas]
          : [row.referencia, row.vendidas, row.inventario, row.programadas, row.cortadas, row.pendientes];

        const dataRow = worksheet.addRow(rowData);
        dataRow.eachCell((cell, colNumber) => {
          cell.style = colNumber === 1 ? refStyle : dataStyle;
        });
      });

      // Descargar Excel
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Informe_Ventas_${selectedCorreria?.name}_${new Date().getTime()}.xlsx`;
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

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">
            Informes generales de ventas y despacho por correría
          </h2>
          <p className="text-slate-500 font-bold text-xs mt-1">
            Panel Ejecutivo de Ventas y Despachos
          </p>
        </div>

        {/* Botón Generar Informe y Selector de correría */}
        <div className="flex items-end gap-3">
          <button
            onClick={() => setShowReportModal(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white px-6 py-3 rounded-3xl font-black text-sm uppercase tracking-wide transition-all shadow-sm"
          >
            Generar Informe
          </button>

          {/* Selector de correría */}
          <div className="bg-white p-3 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Correría Seleccionada
              </span>
              <CorreriaAutocomplete
                value={selectedCorreriaId}
                correrias={state.correrias}
                onChange={setSelectedCorreriaId}
                search={correriaSearch}
                setSearch={setCorreriaSearch}
                showDropdown={showCorreriaDropdown}
                setShowDropdown={setShowCorreriaDropdown}
              />
            </div>
          </div>
        </div>
      </div>

      {!metrics ? (
        <div className="bg-white p-24 rounded-[48px] border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
          <p className="text-slate-400 font-bold text-lg">Seleccione una correría</p>
        </div>
      ) : (
        <>
          {/* Cards de métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Card 1: Referencias (Maleta) */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-3xl border border-orange-200 shadow-sm">
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-4">
                Referencias (Maleta)
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-black text-slate-800">{metrics.totalRefsUnicas}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total referencias únicas</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-800">{metrics.refsEnCero}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Referencias en cero ({metrics.porcentajeEnCero.toFixed(0)}%)
                  </p>
                </div>
                <div className="pt-2 border-t border-orange-200">
                  <div className="w-full bg-orange-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all" 
                      style={{ width: `${metrics.efectividad}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] font-black text-orange-600 uppercase">
                    Efectividad Ref: {metrics.efectividad.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Ventas vs Despachos */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-3xl border border-blue-200 shadow-sm">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">
                Ventas vs Despachos
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-black text-slate-800">{metrics.totalVendidas.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unidades vendidas</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-800">{metrics.totalDespachadas.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unidades despachadas</p>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all" 
                      style={{ width: `${metrics.cumplimientoUnidades}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] font-black text-blue-600 uppercase">
                    Cumplimiento: {metrics.cumplimientoUnidades.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Resumen Financiero - Más ancho */}
            <div className="md:col-span-2 bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-3xl border border-green-200 shadow-sm">
              <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-4">
                Resumen Financiero
              </p>
              <div className="flex items-center justify-between gap-6">
                {/* Lado izquierdo: Total vendido y despachado */}
                <div className="space-y-4 flex-1">
                  <div>
                    <p className="text-3xl font-black text-slate-800">
                      $ {metrics.totalVendidoValor.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total vendido</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-800">
                      $ {metrics.totalDespachadoValor.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total despachado</p>
                  </div>
                </div>

                {/* Lado derecho: Diferencia centrada */}
                <div className="flex flex-col items-center justify-center border-l border-green-200 pl-6">
                  <p className="text-3xl font-black text-red-600">
                    $ {metrics.diferenciaValor.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider text-center">
                    Diferencia faltante
                  </p>
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider text-center">
                    {metrics.porcentajeDiferencia.toFixed(1)}% de venta
                  </p>
                </div>
              </div>

              {/* Barra de cumplimiento */}
              <div className="pt-4 border-t border-green-200 mt-4">
                <div className="w-full bg-green-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all" 
                    style={{ width: `${metrics.cumplimientoValor}%` }}
                  ></div>
                </div>
                <p className="text-[10px] font-black text-green-600 uppercase text-center">
                  Cumplimiento: {metrics.cumplimientoValor.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Tabla: Análisis de Vendedores */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4">
              <h3 className="text-lg font-black text-white uppercase tracking-wide">
                Análisis de Vendedores
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">
                      Vendedor
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      Pedidos
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      Vendidas vs Despachadas
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      Ventas ($)
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      Cumplimiento (UND)
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      Cumplimiento (Valor)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.vendedoresData.map((vendedor, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-black text-slate-800 text-sm">{vendedor.nombre}</p>
                        <p className="text-[10px] font-bold text-blue-500">
                          {vendedor.porcentajeVenta.toFixed(1)}% de la venta total
                        </p>
                      </td>
                      <td className="px-4 py-4 text-center font-black text-slate-800">
                        {vendedor.pedidos}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-black text-slate-800">{vendedor.vendidas}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="font-black text-blue-600">{vendedor.despachadas}</span>
                      </td>
                      <td className="px-4 py-4 text-center font-black text-slate-800">
                        $ {vendedor.ventas.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <span className="font-black text-xs">{vendedor.cumplimientoUnd.toFixed(1)}%</span>
                          <div className="w-16 bg-slate-200 rounded-full h-1.5">
                            <div 
                              className="bg-green-500 h-1.5 rounded-full" 
                              style={{ width: `${Math.min(vendedor.cumplimientoUnd, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <span className="font-black text-xs">{vendedor.cumplimientoValor.toFixed(1)}%</span>
                          <div className="w-16 bg-slate-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full" 
                              style={{ width: `${Math.min(vendedor.cumplimientoValor, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 border-t-2 border-slate-300">
                    <td className="px-6 py-4 font-black text-slate-700 uppercase text-xs">
                      Totales Consolidado
                    </td>
                    <td className="px-4 py-4 text-center font-black text-slate-800">
                      {metrics.vendedoresData.reduce((acc, v) => acc + v.pedidos, 0)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-black text-slate-800">{metrics.totalVendidas}</span>
                      <span className="text-slate-400 mx-1">/</span>
                      <span className="font-black text-blue-600">{metrics.totalDespachadas}</span>
                    </td>
                    <td className="px-4 py-4 text-center font-black text-slate-800">
                      $ {metrics.totalVendidoValor.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 font-black text-xs rounded-full">
                        {metrics.cumplimientoUnidades.toFixed(1)}% GLOBAL (UND)
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 font-black text-xs rounded-full">
                        {metrics.cumplimientoValor.toFixed(1)}% GLOBAL (VALOR)
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Tabla: Análisis de Valores Vendidos */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-4">
              <h3 className="text-lg font-black text-white uppercase tracking-wide">
                Análisis de Valores Vendidos
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[1100px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">
                      Vendedor
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      Pedidos
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      Valor Lista
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      Valor Real
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      Diferencia
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      Cumplimiento Real
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.valoresVendidosData.map((vendedor, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-black text-slate-800 text-sm">
                        {vendedor.nombre}
                      </td>
                      <td className="px-4 py-4 text-center font-black text-slate-800">
                        {vendedor.pedidos}
                      </td>
                      <td className="px-4 py-4 text-center font-black text-slate-800">
                        $ {vendedor.valorLista.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-center font-black text-emerald-600">
                        $ {vendedor.valorReal.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-black text-red-600">
                          $ {vendedor.diferencia.toLocaleString()}
                        </span>
                        <p className="text-[9px] text-red-500 font-bold">
                          {vendedor.valorLista > 0 ? ((vendedor.diferencia / vendedor.valorLista) * 100).toFixed(1) : 0}% descuento
                        </p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className="font-black text-emerald-600">
                            $ {vendedor.valorDespachado.toLocaleString()}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs">{vendedor.cumplimientoReal.toFixed(1)}%</span>
                            <div className="w-16 bg-slate-200 rounded-full h-1.5">
                              <div 
                                className="bg-emerald-500 h-1.5 rounded-full" 
                                style={{ width: `${Math.min(vendedor.cumplimientoReal, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 border-t-2 border-slate-300">
                    <td className="px-6 py-4 font-black text-slate-700 uppercase text-xs">
                      Totales Consolidado
                    </td>
                    <td className="px-4 py-4 text-center font-black text-slate-800">
                      {metrics.valoresVendidosData.reduce((acc, v) => acc + v.pedidos, 0)}
                    </td>
                    <td className="px-4 py-4 text-center font-black text-slate-800">
                      $ {metrics.valoresVendidosData.reduce((acc, v) => acc + v.valorLista, 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-center font-black text-emerald-600">
                      $ {metrics.valoresVendidosData.reduce((acc, v) => acc + v.valorReal, 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-black text-red-600">
                        $ {metrics.valoresVendidosData.reduce((acc, v) => acc + v.diferencia, 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 font-black text-xs rounded-full">
                        {metrics.valoresVendidosData.reduce((acc, v) => acc + v.valorDespachado, 0) > 0 
                          ? ((metrics.valoresVendidosData.reduce((acc, v) => acc + v.valorDespachado, 0) / metrics.valoresVendidosData.reduce((acc, v) => acc + v.valorReal, 0)) * 100).toFixed(1)
                          : 0}% GLOBAL
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Tabla: Performance de Diseñadoras */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-8 py-4">
              <h3 className="text-lg font-black text-white uppercase tracking-wide">
                Performance de Diseñadoras
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">
                      Diseñadora
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      Ventas Generadas
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      Ref. Creadas
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      Ref. Vendidas
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      % Éxito Pedido
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">
                      Refs en Cero
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.disenadorasData.map((disenadora, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-black text-slate-800 text-sm uppercase">
                        {disenadora.nombre}
                      </td>
                      <td className="px-4 py-4 text-center font-black text-slate-800">
                        $ {disenadora.ventasGeneradas.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-center font-black text-slate-800">
                        {disenadora.refsCreadas}
                      </td>
                      <td className="px-4 py-4 text-center font-black text-green-600">
                        {disenadora.refsVendidas}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <span className="font-black text-xs">{disenadora.exitoPedido.toFixed(0)}%</span>
                          <div className="w-16 bg-slate-200 rounded-full h-1.5">
                            <div 
                              className="bg-green-500 h-1.5 rounded-full" 
                              style={{ width: `${disenadora.exitoPedido}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-black text-red-600">
                          {disenadora.refsEnCero} ({disenadora.porcentajeEnCero.toFixed(0)}%)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal: Generar Informe */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Encabezado del modal */}
            <div className="bg-gradient-to-r from-purple-100 to-purple-50 px-8 py-6 border-b border-purple-200">
              <h3 className="text-2xl font-black text-purple-800 text-center">Generar Informe</h3>
              <p className="text-sm text-purple-600 text-center mt-1">Configura los parámetros</p>
            </div>

            {/* Contenedor de selectores con borde */}
            <div className="border-2 border-slate-200 m-6 rounded-2xl p-6 space-y-6 bg-slate-50">
              {/* Selector: Incluir Despachadas */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-600 uppercase tracking-widest text-center block">
                  Incluir Despachadas
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setReportConfig({ ...reportConfig, includeDespachadas: true })}
                    className={`flex-1 py-2 px-4 rounded-lg font-black text-sm transition-all ${
                      reportConfig.includeDespachadas
                        ? 'bg-blue-300 text-blue-900 shadow-sm'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    onClick={() => setReportConfig({ ...reportConfig, includeDespachadas: false })}
                    className={`flex-1 py-2 px-4 rounded-lg font-black text-sm transition-all ${
                      !reportConfig.includeDespachadas
                        ? 'bg-blue-300 text-blue-900 shadow-sm'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Selector: Agregar Vendidas en 0 */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-600 uppercase tracking-widest text-center block">
                  Agregar Vendidas en 0
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setReportConfig({ ...reportConfig, includeZeroSales: true })}
                    className={`flex-1 py-2 px-4 rounded-lg font-black text-sm transition-all ${
                      reportConfig.includeZeroSales
                        ? 'bg-orange-300 text-orange-900 shadow-sm'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    onClick={() => setReportConfig({ ...reportConfig, includeZeroSales: false })}
                    className={`flex-1 py-2 px-4 rounded-lg font-black text-sm transition-all ${
                      !reportConfig.includeZeroSales
                        ? 'bg-orange-300 text-orange-900 shadow-sm'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Selector: Ordenar Por */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-600 uppercase tracking-widest text-center block">
                  Ordenar Por
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setReportConfig({ ...reportConfig, sortBy: 'reference' })}
                    className={`flex-1 py-2 px-4 rounded-lg font-black text-sm transition-all ${
                      reportConfig.sortBy === 'reference'
                        ? 'bg-green-300 text-green-900 shadow-sm'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    Ref. Menor a Mayor
                  </button>
                  <button
                    onClick={() => setReportConfig({ ...reportConfig, sortBy: 'vendidas' })}
                    className={`flex-1 py-2 px-4 rounded-lg font-black text-sm transition-all ${
                      reportConfig.sortBy === 'vendidas'
                        ? 'bg-green-300 text-green-900 shadow-sm'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    Vendidas Mayor a Menor
                  </button>
                </div>
              </div>

              {/* Selector: Formato */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-600 uppercase tracking-widest text-center block">
                  Formato
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setReportConfig({ ...reportConfig, format: 'pdf' })}
                    className={`flex-1 py-2 px-4 rounded-lg font-black text-sm transition-all ${
                      reportConfig.format === 'pdf'
                        ? 'bg-red-300 text-red-900 shadow-sm'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => setReportConfig({ ...reportConfig, format: 'excel' })}
                    className={`flex-1 py-2 px-4 rounded-lg font-black text-sm transition-all ${
                      reportConfig.format === 'excel'
                        ? 'bg-emerald-300 text-emerald-900 shadow-sm'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    Excel
                  </button>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 px-8 py-6 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => {
                  if (reportConfig.format === 'pdf') {
                    generatePDFReport();
                  } else if (reportConfig.format === 'excel') {
                    generateExcelReport();
                  }
                }}
                className="flex-1 py-3 px-4 rounded-lg font-black text-sm bg-gradient-to-r from-purple-300 to-purple-200 text-purple-900 hover:from-purple-400 hover:to-purple-300 transition-all shadow-sm"
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

export default SalesReportView;

const CorreriaAutocomplete: React.FC<{
  value: string;
  correrias: Correria[];
  onChange: (id: string) => void;
  search: string;
  setSearch: (search: string) => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
}> = ({ value, correrias, onChange, search, setSearch, showDropdown, setShowDropdown }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const correria = correrias.find(c => c.id === value);
  const displayValue = correria ? `${correria.name} ${correria.year}` : value;

  const filtered = correrias.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.year.toString().includes(search)
  );

  const handleBlur = () => {
    timeoutRef.current = setTimeout(() => setShowDropdown(false), 300);
  };

  const handleSelect = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onChange(id);
    setShowDropdown(false);
    setSearch('');
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={showDropdown ? search : displayValue}
        onChange={e => setSearch(e.target.value)}
        onFocus={() => { setShowDropdown(true); setSearch(''); }}
        onBlur={handleBlur}
        placeholder="Buscar..."
        className="bg-transparent border-none font-black text-sm text-slate-800 focus:ring-0 pr-8 placeholder:text-slate-400"
      />
      {showDropdown && (
        <div 
          className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-2xl max-h-48 overflow-y-auto"
          style={{ 
            zIndex: 9999,
            minWidth: '250px'
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {filtered.map(c => (
            <button
              key={c.id}
              onMouseDown={() => handleSelect(c.id)}
              className="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0"
            >
              <p className="font-black text-slate-800 text-xs">{c.name}</p>
              <p className="text-[9px] text-slate-400">{c.year}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
