import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { AppState, Correria, User } from '../types';
import { api } from '../services/api';
import { useDarkMode } from '../context/DarkModeContext';

interface SalesReportViewProps {
  state: AppState;
  user: User;
}

const SalesReportView: React.FC<SalesReportViewProps> = ({ state, user }) => {
  const { isDark } = useDarkMode();
  const [selectedCorreriaId, setSelectedCorreriaId] = useState('');
  const [correriaSearch, setCorreriaSearch] = useState('');
  const [showCorreriaDropdown, setShowCorreriaDropdown] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    includeDespachadas: false,
    sortBy: 'reference', // 'reference' o 'vendidas'
    format: 'pdf', // 'pdf' o 'excel'
    includeZeroSales: true // incluir referencias con 0 vendidas
  });

  // ==================== NOVEDADES ====================
  const [novedades, setNovedades] = useState<{ id: number; contenido: string }[]>([]);
  const [showNovedadesModal, setShowNovedadesModal] = useState(false);
  const [showEditNovedadesModal, setShowEditNovedadesModal] = useState(false);
  const [editNovedadesLines, setEditNovedadesLines] = useState<string[]>(['']);
  const [savingNovedades, setSavingNovedades] = useState(false);
  const [hideVentasDisenadora, setHideVentasDisenadora] = useState(false);

  const isAdminOrSoporte = user?.role === 'admin' || user?.role === 'soporte';

  const loadNovedades = useCallback(async (correriaId: string) => {
    if (!correriaId) { setNovedades([]); return; }
    const data = await api.getNovedadesCorreria(correriaId);
    setNovedades(data);
  }, []);

  useEffect(() => {
    loadNovedades(selectedCorreriaId);
  }, [selectedCorreriaId, loadNovedades]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowReportModal(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenEditModal = () => {
    setEditNovedadesLines(
      novedades.length > 0 ? novedades.map(n => n.contenido) : ['']
    );
    setShowEditNovedadesModal(true);
  };

  const handleAddLine = () => setEditNovedadesLines(prev => [...prev, '']);

  const handleLineChange = (idx: number, value: string) => {
    setEditNovedadesLines(prev => prev.map((l, i) => i === idx ? value : l));
  };

  const handleRemoveLine = (idx: number) => {
    setEditNovedadesLines(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveNovedades = async () => {
    const clean = editNovedadesLines.filter(l => l.trim());
    setSavingNovedades(true);
    const result = await api.saveNovedadesCorreria(selectedCorreriaId, clean);
    setSavingNovedades(false);
    if (result.success) {
      await loadNovedades(selectedCorreriaId);
      setShowEditNovedadesModal(false);
    } else {
      alert('Error al guardar: ' + result.message);
    }
  };

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

    // Total valores - usando precio real de venta de los pedidos
    const totalVendidoValor = correriaOrders.reduce((acc, order) => {
      return acc + order.items
        .filter(item => maletaRefIds.includes(item.reference))
        .reduce((sum, item) => {
          // Usar salePrice del pedido si existe, si no usar el precio de lista
          const salePrice = item.salePrice || state.references.find(r => r.id === item.reference)?.price || 0;
          return sum + (item.quantity * salePrice);
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

    // Análisis por diseñadora (case-insensitive, agrupado en mayúsculas)
    const disenadoras = [...new Map(
      maletaReferences.filter(r => r.designer).map(r => [r.designer.toUpperCase(), r.designer.toUpperCase()])
    ).values()];
    
    const disenadorasData = disenadoras.map(designer => {
      const refsCreadas = maletaReferences.filter(r => r.designer?.toUpperCase() === designer);
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

        const prod = state.productionTracking.find(p => p.refId === ref.id && p.correriaId === selectedCorreriaId) || { programmed: 0, cut: 0, inventory: 0 };
        const pending = vendidas - (prod.inventory + prod.programmed + prod.cut);

        return {
          referencia: ref.id,
          vendidas,
          inventario: prod.inventory || 0,
          programadas: prod.programmed || 0,
          cortadas: prod.cut || 0,
          pendientes: pending,
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

      // Calcular totales
      const totales = {
        count: reportData.length,
        vendidas: reportData.reduce((sum, r) => sum + r.vendidas, 0),
        inventario: reportData.reduce((sum, r) => sum + r.inventario, 0),
        programadas: reportData.reduce((sum, r) => sum + r.programadas, 0),
        cortadas: reportData.reduce((sum, r) => sum + r.cortadas, 0),
        pendientes: reportData.reduce((sum, r) => sum + r.pendientes, 0),
        despachadas: reportData.reduce((sum, r) => sum + r.despachadas, 0)
      };

      // Verificar si necesita nueva página para totales
      const totalRowHeight = 7;
      if (yPosition + totalRowHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        drawTableHeader();
      }

      // Dibujar fila de totales
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);

      const totalesData = reportConfig.includeDespachadas
        ? [`${totales.count} Refs`, totales.vendidas, totales.inventario, totales.programadas, totales.cortadas, totales.pendientes, totales.despachadas]
        : [`${totales.count} Refs`, totales.vendidas, totales.inventario, totales.programadas, totales.cortadas, totales.pendientes];

      let xPos = margin;
      totalesData.forEach((cell, idx) => {
        doc.rect(xPos, yPosition, columnWidths[idx], totalRowHeight);
        const text = cell.toString();
        doc.text(text, xPos + columnWidths[idx] / 2, yPosition + 4.5, { align: 'center', maxWidth: columnWidths[idx] - 1 });
        xPos += columnWidths[idx];
      });

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

        const prod = state.productionTracking.find(p => p.refId === ref.id && p.correriaId === selectedCorreriaId) || { programmed: 0, cut: 0, inventory: 0 };
        const pending = vendidas - (prod.inventory + prod.programmed + prod.cut);

        return {
          referencia: ref.id,
          vendidas,
          inventario: prod.inventory || 0,
          programadas: prod.programmed || 0,
          cortadas: prod.cut || 0,
          pendientes: pending,
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

      // Calcular totales
      const totales = {
        count: reportData.length,
        vendidas: reportData.reduce((sum, r) => sum + r.vendidas, 0),
        inventario: reportData.reduce((sum, r) => sum + r.inventario, 0),
        programadas: reportData.reduce((sum, r) => sum + r.programadas, 0),
        cortadas: reportData.reduce((sum, r) => sum + r.cortadas, 0),
        pendientes: reportData.reduce((sum, r) => sum + r.pendientes, 0),
        despachadas: reportData.reduce((sum, r) => sum + r.despachadas, 0)
      };

      // Agregar fila de totales
      const totalesData = reportConfig.includeDespachadas
        ? [`${totales.count} Refs`, totales.vendidas, totales.inventario, totales.programadas, totales.cortadas, totales.pendientes, totales.despachadas]
        : [`${totales.count} Refs`, totales.vendidas, totales.inventario, totales.programadas, totales.cortadas, totales.pendientes];

      const totalRow = worksheet.addRow(totalesData);
      totalRow.height = 22;
      totalRow.eachCell(cell => {
        cell.style = {
          font: { bold: true, size: 12 },
          alignment: { horizontal: 'center' as any, vertical: 'center' as any },
          border: border,
          fill: { type: 'pattern' as any, pattern: 'solid' as any, fgColor: { argb: 'FFE0E0E0' } }
        };
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
    <div className={`space-y-6 pb-20 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : ''}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className={`text-3xl font-black tracking-tighter leading-none transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>
            Informes generales de ventas y despacho por correría
          </h2>
          <p className={`font-bold text-xs mt-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>
            Panel Ejecutivo de Ventas y Despachos
          </p>
        </div>

        {/* Botón Generar Informe y Selector de correría */}
        <div className="flex items-end gap-3">

          {/* Botón Agregar Novedades - Solo Admin/Soporte */}
          {isAdminOrSoporte && selectedCorreriaId && (
            <button
              onClick={handleOpenEditModal}
              className={`text-white px-5 py-3 rounded-3xl font-black text-sm uppercase tracking-wide transition-all shadow-sm ${isDark ? 'bg-amber-600 hover:bg-amber-700' : 'bg-amber-500 hover:bg-amber-600'}`}
            >
              📋 Agregar Novedades
            </button>
          )}

          <button
            onClick={() => setShowReportModal(true)}
            className={`text-white px-6 py-3 rounded-3xl font-black text-sm uppercase tracking-wide transition-all shadow-sm ${isDark ? 'bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600' : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600'}`}
          >
            ✓ Generar Informe
          </button>

          {/* Selector de correría */}
          <div className={`p-3 rounded-3xl border shadow-sm transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>
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
                isDark={isDark}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Banner Novedades - Visible para todos cuando hay novedades */}
      {novedades.length > 0 && selectedCorreriaId && (
        <button
          onClick={() => setShowNovedadesModal(true)}
          className={`w-full text-left flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all group ${isDark ? 'bg-amber-900/30 border-amber-700 hover:bg-amber-900/50' : 'bg-amber-50 border-amber-200 hover:bg-amber-100'}`}
        >
          <span className="text-xl">💡</span>
          <div className="flex-1">
            <span className={`font-black text-sm transition-colors duration-300 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
              Esta correría tiene {novedades.length} novedad{novedades.length > 1 ? 'es' : ''} registrada{novedades.length > 1 ? 's' : ''}.
            </span>
            <span className="text-amber-600 font-bold text-xs ml-2">Haz clic para verlas →</span>
          </div>
        </button>
      )}

      {!metrics ? (
        <div className={`p-24 rounded-[48px] border-2 border-dashed flex flex-col items-center text-center transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-200'}`}>
          <p className={`font-bold text-lg transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-400'}`}>Seleccione una correría</p>
        </div>
      ) : (
        <>
          {/* Cards de métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Card 1: Referencias (Maleta) */}
            <div className={`p-6 rounded-3xl border shadow-sm transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-orange-900/30 to-orange-900/20 border-orange-700' : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-4 transition-colors duration-300 ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>
                Referencias (Maleta)
              </p>
              <div className="space-y-4">
                <div>
                  <p className={`text-3xl font-black transition-colors duration-300 ${isDark ? 'text-orange-200' : 'text-slate-800'}`}>{metrics.totalRefsUnicas}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-orange-400' : 'text-slate-500'}`}>Total referencias únicas</p>
                </div>
                <div>
                  <p className={`text-3xl font-black transition-colors duration-300 ${isDark ? 'text-orange-200' : 'text-slate-800'}`}>{metrics.refsEnCero}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-orange-400' : 'text-slate-500'}`}>
                    Referencias en cero ({metrics.porcentajeEnCero.toFixed(0)}%)
                  </p>
                </div>
                <div className={`pt-2 border-t transition-colors duration-300 ${isDark ? 'border-orange-700' : 'border-orange-200'}`}>
                  <div className={`w-full rounded-full h-2 mb-2 transition-colors duration-300 ${isDark ? 'bg-orange-900/40' : 'bg-orange-200'}`}>
                    <div 
                      className={`h-2 rounded-full transition-all ${isDark ? 'bg-orange-500' : 'bg-orange-600'}`}
                      style={{ width: `${metrics.efectividad}%` }}
                    ></div>
                  </div>
                  <p className={`text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>
                    Efectividad Ref: {metrics.efectividad.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Ventas vs Despachos */}
            <div className={`p-6 rounded-3xl border shadow-sm transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-blue-900/30 to-blue-900/20 border-blue-700' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-4 transition-colors duration-300 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                Ventas vs Despachos
              </p>
              <div className="space-y-4">
                <div>
                  <p className={`text-3xl font-black transition-colors duration-300 ${isDark ? 'text-blue-200' : 'text-slate-800'}`}>{metrics.totalVendidas.toLocaleString('es-CO')}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-slate-500'}`}>Unidades vendidas</p>
                </div>
                <div>
                  <p className={`text-3xl font-black transition-colors duration-300 ${isDark ? 'text-blue-200' : 'text-slate-800'}`}>{metrics.totalDespachadas.toLocaleString('es-CO')}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-slate-500'}`}>Unidades despachadas</p>
                </div>
                <div className={`pt-2 border-t transition-colors duration-300 ${isDark ? 'border-blue-700' : 'border-blue-200'}`}>
                  <div className={`w-full rounded-full h-2 mb-2 transition-colors duration-300 ${isDark ? 'bg-blue-900/40' : 'bg-blue-200'}`}>
                    <div 
                      className={`h-2 rounded-full transition-all ${isDark ? 'bg-blue-500' : 'bg-blue-600'}`}
                      style={{ width: `${metrics.cumplimientoUnidades}%` }}
                    ></div>
                  </div>
                  <p className={`text-[10px] font-black uppercase transition-colors duration-300 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                    Cumplimiento: {metrics.cumplimientoUnidades.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Resumen Financiero - Más ancho */}
            <div className={`md:col-span-2 p-6 rounded-3xl border shadow-sm transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-green-900/30 to-green-900/20 border-green-700' : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-4 transition-colors duration-300 ${isDark ? 'text-green-300' : 'text-green-600'}`}>
                Resumen Financiero
              </p>
              <div className="flex items-center justify-between gap-6">
                {/* Lado izquierdo: Total vendido y despachado */}
                <div className="space-y-4 flex-1">
                  <div>
                    <p className={`text-3xl font-black transition-colors duration-300 ${isDark ? 'text-green-200' : 'text-slate-800'}`}>
                      $ {metrics.totalVendidoValor.toLocaleString()}
                    </p>
                    <p className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-green-400' : 'text-slate-500'}`}>Total vendido</p>
                  </div>
                  <div>
                    <p className={`text-3xl font-black transition-colors duration-300 ${isDark ? 'text-green-200' : 'text-slate-800'}`}>
                      $ {metrics.totalDespachadoValor.toLocaleString()}
                    </p>
                    <p className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-green-400' : 'text-slate-500'}`}>Total despachado</p>
                  </div>
                </div>

                {/* Lado derecho: Diferencia centrada */}
                <div className={`flex flex-col items-center justify-center border-l pl-6 transition-colors duration-300 ${isDark ? 'border-green-700' : 'border-green-200'}`}>
                  <p className={`text-3xl font-black transition-colors duration-300 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    $ {metrics.diferenciaValor.toLocaleString()}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider text-center transition-colors duration-300 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                    Diferencia faltante
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider text-center transition-colors duration-300 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                    {metrics.porcentajeDiferencia.toFixed(1)}% de venta
                  </p>
                </div>
              </div>

              {/* Barra de cumplimiento */}
              <div className={`pt-4 border-t mt-4 transition-colors duration-300 ${isDark ? 'border-green-700' : 'border-green-200'}`}>
                <div className={`w-full rounded-full h-2 mb-2 transition-colors duration-300 ${isDark ? 'bg-green-900/40' : 'bg-green-200'}`}>
                  <div 
                    className={`h-2 rounded-full transition-all ${isDark ? 'bg-green-500' : 'bg-green-600'}`}
                    style={{ width: `${metrics.cumplimientoValor}%` }}
                  ></div>
                </div>
                <p className={`text-[10px] font-black uppercase text-center transition-colors duration-300 ${isDark ? 'text-green-300' : 'text-green-600'}`}>
                  Cumplimiento: {metrics.cumplimientoValor.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Tabla: Análisis de Vendedores */}
          <div className={`rounded-3xl shadow-sm border overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
            <div className={`px-8 py-4 transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-violet-600 to-violet-500' : 'bg-gradient-to-r from-blue-600 to-blue-500'}`}>
              <h3 className="text-lg font-black text-white uppercase tracking-wide">
                Análisis de Vendedores
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-base min-w-[900px]">
                <thead>
                  <tr className={`border-b transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-700' : 'bg-slate-50 border-slate-100'}`}>
                    <th className={`px-6 py-4 font-black uppercase tracking-widest text-[10px] transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-500'}`}>
                      Vendedor
                    </th>
                    <th className={`px-4 py-4 font-black uppercase tracking-widest text-[10px] text-center transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-500'}`}>
                      Pedidos
                    </th>
                    <th className={`px-4 py-4 font-black uppercase tracking-widest text-[10px] text-center transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-500'}`}>
                      Vendidas vs Despachadas
                    </th>
                    <th className={`px-4 py-4 font-black uppercase tracking-widest text-[10px] text-center transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-500'}`}>
                      Ventas ($)
                    </th>
                    <th className={`px-4 py-4 font-black uppercase tracking-widest text-[10px] text-center transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-500'}`}>
                      Cumplimiento (UND)
                    </th>
                    <th className={`px-4 py-4 font-black uppercase tracking-widest text-[10px] text-center transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-500'}`}>
                      Cumplimiento (Valor)
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors duration-300 ${isDark ? 'divide-violet-700' : 'divide-slate-100'}`}>
                  {metrics.vendedoresData.map((vendedor, idx) => (
                    <tr key={idx} className={`transition-colors ${isDark ? 'hover:bg-[#5a4a75]/30' : 'hover:bg-slate-50'}`}>
                      <td className="px-6 py-4">
                        <p className={`font-black text-sm transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{vendedor.nombre}</p>
                        <p className="text-[10px] font-bold text-blue-500">
                          {vendedor.porcentajeVenta.toFixed(1)}% de la venta total
                        </p>
                      </td>
                      <td className="px-4 py-4 text-center font-black">
                        <span className={`transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{vendedor.pedidos}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{vendedor.vendidas.toLocaleString('es-CO')}</span>
                        <span className={`mx-1 transition-colors duration-300 ${isDark ? 'text-violet-600' : 'text-slate-400'}`}>/</span>
                        <span className={`font-black transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{vendedor.despachadas.toLocaleString('es-CO')}</span>
                      </td>
                      <td className="px-4 py-4 text-center font-black">
                        <span className={`transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>$ {vendedor.ventas.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <span className={`font-black text-xs transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{vendedor.cumplimientoUnd.toFixed(1)}%</span>
                          <div className={`w-16 rounded-full h-1.5 transition-colors duration-300 ${isDark ? 'bg-violet-700' : 'bg-slate-200'}`}>
                            <div 
                              className={`h-1.5 rounded-full transition-colors duration-300 ${isDark ? 'bg-green-400' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(vendedor.cumplimientoUnd, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <span className={`font-black text-xs transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{vendedor.cumplimientoValor.toFixed(1)}%</span>
                          <div className={`w-16 rounded-full h-1.5 transition-colors duration-300 ${isDark ? 'bg-violet-700' : 'bg-slate-200'}`}>
                            <div 
                              className={`h-1.5 rounded-full transition-colors duration-300 ${isDark ? 'bg-blue-400' : 'bg-blue-500'}`}
                              style={{ width: `${Math.min(vendedor.cumplimientoValor, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className={`border-t-2 transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-700' : 'bg-slate-100 border-slate-300'}`}>
                    <td className={`px-6 py-4 font-black uppercase text-xs transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>
                      Totales Consolidado
                    </td>
                    <td className={`px-4 py-4 text-center font-black transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>
                      {metrics.vendedoresData.reduce((acc, v) => acc + v.pedidos, 0)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`font-black transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{metrics.totalVendidas.toLocaleString('es-CO')}</span>
                      <span className={`mx-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>/</span>
                      <span className={`font-black transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{metrics.totalDespachadas.toLocaleString('es-CO')}</span>
                    </td>
                    <td className={`px-4 py-4 text-center font-black transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>
                      $ {metrics.totalVendidoValor.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full font-black text-xs transition-colors duration-300 ${isDark ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700'}`}>
                        {metrics.cumplimientoUnidades.toFixed(1)}% GLOBAL (UND)
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full font-black text-xs transition-colors duration-300 ${isDark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                        {metrics.cumplimientoValor.toFixed(1)}% GLOBAL (VALOR)
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Tabla: Análisis de Valores Vendidos */}
          <div className={`rounded-3xl shadow-sm border overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
            <div className={`px-8 py-4 transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-emerald-700 to-emerald-600' : 'bg-gradient-to-r from-emerald-600 to-emerald-500'}`}>
              <h3 className="text-lg font-black text-white uppercase tracking-wide">
                Análisis de Valores Vendidos
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-base min-w-[1100px]">
                <thead>
                  <tr className={`border-b transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-700' : 'bg-slate-50 border-slate-100'}`}>
                    <th className={`px-6 py-4 font-black uppercase tracking-widest text-[10px] transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-500'}`}>
                      Vendedor
                    </th>
                    <th className={`px-4 py-4 font-black uppercase tracking-widest text-[10px] text-center transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-500'}`}>
                      Pedidos
                    </th>
                    <th className={`px-4 py-4 font-black uppercase tracking-widest text-[10px] text-center transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-500'}`}>
                      Valor Lista
                    </th>
                    <th className={`px-4 py-4 font-black uppercase tracking-widest text-[10px] text-center transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-500'}`}>
                      Valor Real
                    </th>
                    <th className={`px-4 py-4 font-black uppercase tracking-widest text-[10px] text-center transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-500'}`}>
                      Diferencia
                    </th>
                    <th className={`px-4 py-4 font-black uppercase tracking-widest text-[10px] text-center transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-500'}`}>
                      Cumplimiento Real
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors duration-300 ${isDark ? 'divide-violet-700' : 'divide-slate-100'}`}>
                  {metrics.valoresVendidosData.map((vendedor, idx) => (
                    <tr key={idx} className={`transition-colors ${isDark ? 'hover:bg-[#5a4a75]/30' : 'hover:bg-slate-50'}`}>
                      <td className={`px-6 py-4 font-black text-sm transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>
                        {vendedor.nombre}
                      </td>
                      <td className={`px-4 py-4 text-center font-black transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>
                        {vendedor.pedidos}
                      </td>
                      <td className={`px-4 py-4 text-center font-black transition-colors duration-300 ${isDark ? 'text-green-300' : 'text-slate-800'}`}>
                        $ {vendedor.valorLista.toLocaleString()}
                      </td>
                      <td className={`px-4 py-4 text-center font-black transition-colors duration-300 ${isDark ? 'text-pink-300' : 'text-emerald-600'}`}>
                        $ {vendedor.valorReal.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`font-black transition-colors duration-300 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                          $ {vendedor.diferencia.toLocaleString()}
                        </span>
                        <p className={`text-[9px] font-bold transition-colors duration-300 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                          {vendedor.valorLista > 0 ? ((vendedor.diferencia / vendedor.valorLista) * 100).toFixed(1) : 0}% descuento
                        </p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className={`font-black transition-colors duration-300 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            $ {vendedor.valorDespachado.toLocaleString()}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`font-black text-xs transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{vendedor.cumplimientoReal.toFixed(1)}%</span>
                            <div className={`w-16 rounded-full h-1.5 transition-colors duration-300 ${isDark ? 'bg-violet-700' : 'bg-slate-200'}`}>
                              <div 
                                className={`h-1.5 rounded-full transition-colors duration-300 ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`}
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
                  <tr className={`border-t-2 transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-700' : 'bg-slate-100 border-slate-300'}`}>
                    <td className={`px-6 py-4 font-black uppercase text-xs transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>
                      Totales Consolidado
                    </td>
                    <td className={`px-4 py-4 text-center font-black transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>
                      {metrics.valoresVendidosData.reduce((acc, v) => acc + v.pedidos, 0)}
                    </td>
                    <td className={`px-4 py-4 text-center font-black transition-colors duration-300 ${isDark ? 'text-green-300' : 'text-slate-800'}`}>
                      $ {metrics.valoresVendidosData.reduce((acc, v) => acc + v.valorLista, 0).toLocaleString()}
                    </td>
                    <td className={`px-4 py-4 text-center font-black transition-colors duration-300 ${isDark ? 'text-pink-300' : 'text-emerald-600'}`}>
                      $ {metrics.valoresVendidosData.reduce((acc, v) => acc + v.valorReal, 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`font-black transition-colors duration-300 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        $ {metrics.valoresVendidosData.reduce((acc, v) => acc + v.diferencia, 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full font-black text-xs transition-colors duration-300 ${isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
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
          <div className={`rounded-3xl shadow-sm border overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
            <div className={`px-8 py-4 flex items-center justify-between transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-violet-700 to-violet-600' : 'bg-gradient-to-r from-slate-700 to-slate-600'}`}>
              <h3 className="text-lg font-black text-white uppercase tracking-wide">
                Performance de Diseñadoras
              </h3>
              <button
                onClick={() => setHideVentasDisenadora(v => !v)}
                title={hideVentasDisenadora ? 'Mostrar ventas generadas' : 'Ocultar ventas generadas'}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                {hideVentasDisenadora ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-base min-w-[800px]">
                <thead>
                  <tr className={`border-b transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-700' : 'bg-slate-50 border-slate-100'}`}>
                    <th className={`px-6 py-4 font-black uppercase tracking-widest text-[10px] transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-500'}`}>
                      Diseñadora
                    </th>
                    <th className={`px-4 py-4 font-black uppercase tracking-widest text-[10px] text-center transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-500'}`}>
                      Ventas Generadas
                    </th>
                    <th className={`px-4 py-4 font-black uppercase tracking-widest text-[10px] text-center transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-500'}`}>
                      Ref. Creadas
                    </th>
                    <th className={`px-4 py-4 font-black uppercase tracking-widest text-[10px] text-center transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-500'}`}>
                      Ref. Vendidas
                    </th>
                    <th className={`px-4 py-4 font-black uppercase tracking-widest text-[10px] text-center transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-500'}`}>
                      % Éxito Pedido
                    </th>
                    <th className={`px-4 py-4 font-black uppercase tracking-widest text-[10px] text-center transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-500'}`}>
                      Refs en Cero
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors duration-300 ${isDark ? 'divide-violet-700' : 'divide-slate-100'}`}>
                  {metrics.disenadorasData.map((disenadora, idx) => (
                    <tr key={idx} className={`transition-colors ${isDark ? 'hover:bg-[#5a4a75]/30' : 'hover:bg-slate-50'}`}>
                      <td className={`px-6 py-4 font-black text-sm uppercase transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>
                        {disenadora.nombre}
                      </td>
                      <td className={`px-4 py-4 text-center font-black transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>
                        {hideVentasDisenadora ? '-' : `$ ${disenadora.ventasGeneradas.toLocaleString()}`}
                      </td>
                      <td className={`px-4 py-4 text-center font-black transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>
                        {disenadora.refsCreadas}
                      </td>
                      <td className={`px-4 py-4 text-center font-black transition-colors duration-300 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        {disenadora.refsVendidas}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <span className={`font-black text-xs transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{disenadora.exitoPedido.toFixed(0)}%</span>
                          <div className={`w-16 rounded-full h-1.5 transition-colors duration-300 ${isDark ? 'bg-violet-700' : 'bg-slate-200'}`}>
                            <div 
                              className={`h-1.5 rounded-full transition-colors duration-300 ${isDark ? 'bg-green-400' : 'bg-green-500'}`}
                              style={{ width: `${disenadora.exitoPedido}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`font-black transition-colors duration-300 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                          {disenadora.refsEnCero} ({disenadora.porcentajeEnCero.toFixed(0)}%)
                        </span>
                      </td>
                    </tr>
                  ))}
                  {metrics.disenadorasData.length > 0 && (() => {
                    const totalVentas = metrics.disenadorasData.reduce((acc, d) => acc + d.ventasGeneradas, 0);
                    const totalCreadas = metrics.disenadorasData.reduce((acc, d) => acc + d.refsCreadas, 0);
                    const totalVendidas = metrics.disenadorasData.reduce((acc, d) => acc + d.refsVendidas, 0);
                    const avgExito = metrics.disenadorasData.reduce((acc, d) => acc + d.exitoPedido, 0) / metrics.disenadorasData.length;
                    const totalEnCero = metrics.disenadorasData.reduce((acc, d) => acc + d.refsEnCero, 0);
                    const avgEnCero = metrics.disenadorasData.reduce((acc, d) => acc + d.porcentajeEnCero, 0) / metrics.disenadorasData.length;
                    return (
                      <tr className={`border-t-2 font-black transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-700' : 'bg-slate-100 border-slate-300'}`}>
                        <td className={`px-6 py-4 font-black uppercase text-xs transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>Totales</td>
                        <td className={`px-4 py-4 text-center font-black transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{hideVentasDisenadora ? '-' : `$ ${totalVentas.toLocaleString('es-CO')}`}</td>
                        <td className={`px-4 py-4 text-center font-black transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{totalCreadas}</td>
                        <td className={`px-4 py-4 text-center font-black transition-colors duration-300 ${isDark ? 'text-green-400' : 'text-green-600'}`}>{totalVendidas}</td>
                        <td className={`px-4 py-4 text-center font-black transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-800'}`}>{avgExito.toFixed(0)}%</td>
                        <td className={`px-4 py-4 text-center font-black transition-colors duration-300 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{totalEnCero} ({avgEnCero.toFixed(0)}%)</td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal: Generar Informe */}
      {showReportModal && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-colors duration-300 ${isDark ? 'bg-black/60' : 'bg-black/50'}`}>
          <div className={`rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border border-violet-700' : 'bg-white'}`}>
            {/* Encabezado del modal */}
            <div className={`px-8 py-6 border-b transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-700' : 'bg-gradient-to-r from-purple-100 to-purple-50 border-purple-200'}`}>
              <h3 className={`text-2xl font-black text-center transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-purple-800'}`}>Generar Informe</h3>
              <p className={`text-sm text-center mt-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-purple-600'}`}>Configura los parámetros</p>
            </div>

            {/* Contenedor de selectores con borde */}
            <div className={`border-2 m-6 rounded-2xl p-6 space-y-6 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-700' : 'bg-slate-50 border-slate-200'}`}>
              {/* Selector: Incluir Despachadas */}
              <div className="space-y-3">
                <label className={`text-xs font-black uppercase tracking-widest text-center block transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>
                  Incluir Despachadas
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setReportConfig({ ...reportConfig, includeDespachadas: false })}
                    className={`flex-1 py-2 px-4 rounded-lg font-black text-sm transition-all ${
                      !reportConfig.includeDespachadas
                        ? isDark ? 'bg-violet-600 text-white shadow-sm' : 'bg-blue-300 text-blue-900 shadow-sm'
                        : isDark ? 'bg-[#5a4a75] text-violet-300 hover:bg-[#6a5a85]' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    No
                  </button>
                  <button
                    onClick={() => setReportConfig({ ...reportConfig, includeDespachadas: true })}
                    className={`flex-1 py-2 px-4 rounded-lg font-black text-sm transition-all ${
                      reportConfig.includeDespachadas
                        ? isDark ? 'bg-violet-600 text-white shadow-sm' : 'bg-blue-300 text-blue-900 shadow-sm'
                        : isDark ? 'bg-[#5a4a75] text-violet-300 hover:bg-[#6a5a85]' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    Sí
                  </button>
                </div>
              </div>

              {/* Selector: Agregar Vendidas en 0 */}
              <div className="space-y-3">
                <label className={`text-xs font-black uppercase tracking-widest text-center block transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>
                  Agregar Vendidas en 0
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setReportConfig({ ...reportConfig, includeZeroSales: true })}
                    className={`flex-1 py-2 px-4 rounded-lg font-black text-sm transition-all ${
                      reportConfig.includeZeroSales
                        ? isDark ? 'bg-orange-600 text-white shadow-sm' : 'bg-orange-300 text-orange-900 shadow-sm'
                        : isDark ? 'bg-[#5a4a75] text-violet-300 hover:bg-[#6a5a85]' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    onClick={() => setReportConfig({ ...reportConfig, includeZeroSales: false })}
                    className={`flex-1 py-2 px-4 rounded-lg font-black text-sm transition-all ${
                      !reportConfig.includeZeroSales
                        ? isDark ? 'bg-orange-600 text-white shadow-sm' : 'bg-orange-300 text-orange-900 shadow-sm'
                        : isDark ? 'bg-[#5a4a75] text-violet-300 hover:bg-[#6a5a85]' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Selector: Ordenar Por */}
              <div className="space-y-3">
                <label className={`text-xs font-black uppercase tracking-widest text-center block transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>
                  Ordenar Por
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setReportConfig({ ...reportConfig, sortBy: 'reference' })}
                    className={`flex-1 py-2 px-4 rounded-lg font-black text-sm transition-all ${
                      reportConfig.sortBy === 'reference'
                        ? isDark ? 'bg-green-600 text-white shadow-sm' : 'bg-green-300 text-green-900 shadow-sm'
                        : isDark ? 'bg-[#5a4a75] text-violet-300 hover:bg-[#6a5a85]' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    Ref. Menor a Mayor
                  </button>
                  <button
                    onClick={() => setReportConfig({ ...reportConfig, sortBy: 'vendidas' })}
                    className={`flex-1 py-2 px-4 rounded-lg font-black text-sm transition-all ${
                      reportConfig.sortBy === 'vendidas'
                        ? isDark ? 'bg-green-600 text-white shadow-sm' : 'bg-green-300 text-green-900 shadow-sm'
                        : isDark ? 'bg-[#5a4a75] text-violet-300 hover:bg-[#6a5a85]' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    Vendidas Mayor a Menor
                  </button>
                </div>
              </div>

              {/* Selector: Formato */}
              <div className="space-y-3">
                <label className={`text-xs font-black uppercase tracking-widest text-center block transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>
                  Formato
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setReportConfig({ ...reportConfig, format: 'pdf' })}
                    className={`flex-1 py-2 px-4 rounded-lg font-black text-sm transition-all ${
                      reportConfig.format === 'pdf'
                        ? isDark ? 'bg-red-600 text-white shadow-sm' : 'bg-red-300 text-red-900 shadow-sm'
                        : isDark ? 'bg-[#5a4a75] text-violet-300 hover:bg-[#6a5a85]' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => setReportConfig({ ...reportConfig, format: 'excel' })}
                    className={`flex-1 py-2 px-4 rounded-lg font-black text-sm transition-all ${
                      reportConfig.format === 'excel'
                        ? isDark ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-300 text-emerald-900 shadow-sm'
                        : isDark ? 'bg-[#5a4a75] text-violet-300 hover:bg-[#6a5a85]' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    Excel
                  </button>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className={`flex gap-3 px-8 py-6 border-t transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-700' : 'bg-slate-50 border-slate-200'}`}>
              <button
                onClick={() => {
                  if (reportConfig.format === 'pdf') {
                    generatePDFReport();
                  } else if (reportConfig.format === 'excel') {
                    generateExcelReport();
                  }
                }}
                className={`flex-1 py-3 px-4 rounded-lg font-black text-sm transition-all shadow-sm ${isDark ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:from-violet-700 hover:to-violet-600' : 'bg-gradient-to-r from-purple-300 to-purple-200 text-purple-900 hover:from-purple-400 hover:to-purple-300'}`}
              >
                Generar
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className={`flex-1 py-3 px-4 rounded-lg font-black text-sm transition-all shadow-sm ${isDark ? 'bg-[#5a4a75] text-violet-200 hover:bg-[#6a5a85]' : 'bg-slate-300 text-slate-700 hover:bg-slate-400'}`}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal lectura de Novedades - visible para todos */}
      {showNovedadesModal && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-colors duration-300 ${isDark ? 'bg-black/60' : 'bg-black/40'}`}>
          <div className={`rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border border-violet-700' : 'bg-white'}`}>
            <div className={`px-8 py-6 border-b flex items-center justify-between transition-colors duration-300 ${isDark ? 'bg-amber-900/40 border-amber-700' : 'bg-amber-50 border-amber-100'}`}>
              <div>
                <h3 className={`text-xl font-black transition-colors duration-300 ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>Novedades de la Correría</h3>
                <p className={`font-bold text-xs mt-0.5 uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{selectedCorreria?.name} {selectedCorreria?.year}</p>
              </div>
              <button onClick={() => setShowNovedadesModal(false)} className={`text-2xl font-black transition-colors duration-300 ${isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-400 hover:text-amber-600'}`}>×</button>
            </div>
            <div className={`p-8 space-y-3 max-h-[60vh] overflow-y-auto transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : ''}`}>
              {novedades.map((n, idx) => (
                <div key={n.id} className="flex items-start gap-3">
                  <span className={`mt-1 w-5 h-5 flex-shrink-0 rounded-full text-[10px] font-black flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>{idx + 1}</span>
                  <p className={`font-bold text-sm leading-relaxed transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>{n.contenido}</p>
                </div>
              ))}
            </div>
            {isAdminOrSoporte && (
              <div className={`px-8 py-4 border-t transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-700' : 'bg-slate-50 border-slate-100'}`}>
                <button
                  onClick={() => { setShowNovedadesModal(false); handleOpenEditModal(); }}
                  className={`w-full py-2.5 rounded-xl font-black text-sm transition-all ${isDark ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
                >
                  Editar novedades
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal edición de Novedades - solo Admin/Soporte */}
      {showEditNovedadesModal && isAdminOrSoporte && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-colors duration-300 ${isDark ? 'bg-black/60' : 'bg-black/40'}`}>
          <div className={`rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border border-violet-700' : 'bg-white'}`}>
            <div className={`px-8 py-6 border-b flex items-center justify-between transition-colors duration-300 ${isDark ? 'bg-amber-900/40 border-amber-700' : 'bg-amber-50 border-amber-100'}`}>
              <div>
                <h3 className={`text-xl font-black transition-colors duration-300 ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>Agregar Novedades</h3>
                <p className={`font-bold text-xs mt-0.5 uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>Correría: {selectedCorreria?.name} {selectedCorreria?.year}</p>
              </div>
              <button
                onClick={handleAddLine}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm transition-all ${isDark ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
              >
                + Agregar
              </button>
            </div>
            <div className={`p-6 space-y-3 max-h-[55vh] overflow-y-auto transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : ''}`}>
              {editNovedadesLines.map((line, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className={`w-5 h-5 flex-shrink-0 rounded-full text-[10px] font-black flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>{idx + 1}</span>
                  <input
                    type="text"
                    value={line}
                    onChange={e => handleLineChange(idx, e.target.value)}
                    placeholder="Escribe una novedad..."
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold focus:ring-2 outline-none transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border border-violet-600 text-violet-100 placeholder-violet-400 focus:ring-violet-500' : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-amber-200 focus:border-amber-400'}`}
                  />
                  {editNovedadesLines.length > 1 && (
                    <button
                      onClick={() => handleRemoveLine(idx)}
                      className={`w-7 h-7 flex items-center justify-center rounded-full font-black text-sm transition-all ${isDark ? 'bg-red-900/40 hover:bg-red-900/60 text-red-400' : 'bg-red-100 hover:bg-red-200 text-red-500'}`}
                    >×</button>
                  )}
                </div>
              ))}
            </div>
            <div className={`flex gap-3 px-8 py-5 border-t transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-700' : 'bg-slate-50 border-slate-100'}`}>
              <button
                onClick={handleSaveNovedades}
                disabled={savingNovedades}
                className={`flex-1 py-3 rounded-xl font-black text-sm transition-all disabled:opacity-50 ${isDark ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
              >
                {savingNovedades ? 'Guardando...' : 'Guardar Novedades'}
              </button>
              <button
                onClick={() => setShowEditNovedadesModal(false)}
                className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${isDark ? 'bg-[#5a4a75] hover:bg-[#6a5a85] text-violet-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
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
  isDark: boolean;
}> = ({ value, correrias, onChange, search, setSearch, showDropdown, setShowDropdown, isDark }) => {
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
        placeholder="Buscar correría..."
        className={`border rounded-xl font-black text-sm focus:ring-2 focus:outline-none px-3 py-1.5 pr-8 placeholder:text-slate-400 min-w-[180px] transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border-violet-600 text-violet-100 focus:ring-violet-500' : 'bg-slate-100 border-slate-300 text-slate-800 focus:ring-slate-400'}`}
      />
      {showDropdown && search.length >= 2 && (
        <div 
          className={`absolute top-full left-0 mt-1 rounded-lg shadow-2xl max-h-48 overflow-y-auto transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border border-violet-700' : 'bg-white border border-slate-200'}`}
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
              className={`w-full px-3 py-2 text-left transition-colors border-b last:border-0 ${isDark ? 'text-violet-100 hover:bg-[#5a4a75] border-violet-700' : 'text-slate-800 hover:bg-blue-50 border-slate-50'}`}
            >
              <p className={`font-black text-xs transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-800'}`}>{c.name}</p>
              <p className={`text-[9px] transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>{c.year}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
