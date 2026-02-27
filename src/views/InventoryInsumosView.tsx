import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import usePagination from '../hooks/usePagination';
import { UserRole } from '../types';

interface InventoryMovement {
  id: string;
  insumo: string;
  cantidad: number;
  valor_unitario: number;
  valor_total: number;
  proveedor: string;
  referencia_destino: string | null;
  remision_factura: string | null;
  movimiento: 'Entrada' | 'Salida';
  compra_id: string | null;
  fecha_creacion: string;
}

interface InventoryInsumosViewProps {
  user?: any;
  onNavigate?: () => void;
}

const InventoryInsumosView: React.FC<InventoryInsumosViewProps> = ({ user, onNavigate }) => {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [includeZeroStock, setIncludeZeroStock] = useState(false);
  
  // Verificar si el usuario es Admin u Observer
  const canGenerateReports = user && (user.role === UserRole.ADMIN || user.role === 'admin' || user.role === UserRole.OBSERVER || user.role === 'observer');
  
  // Filter states
  const [insumoFilter, setInsumoFilter] = useState('');
  const [referenciaFilter, setReferenciaFilter] = useState('');
  const [movimientoFilter, setMovimientoFilter] = useState<'Entrada' | 'Salida' | ''>('');
  
  // Pagination
  const { pagination, goToPage, nextPage, previousPage, setLimit } = usePagination(1, 50);
  
  const [formData, setFormData] = useState({
    insumo: '',
    cantidad: '',
    valor_unitario: '',
    valor_total: '',
    proveedor: '',
    referencia_destino: '',
    remision_factura: '',
    movimiento: 'Entrada' as 'Entrada' | 'Salida'
  });

  // Cargar movimientos al montar el componente
  useEffect(() => {
    try {
      loadMovements();
    } catch (error) {
      console.error('❌ Error en useEffect:', error);
    }
  }, []);

  const loadMovements = async () => {
    setLoading(true);
    try {
      const data = await api.getInventoryMovements();
      console.log('✅ Movimientos de inventario cargados:', data);
      setMovements(data);
    } catch (error) {
      console.error('❌ Error cargando movimientos:', error);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateValorTotal = (cantidad: string, valorUnitario: string) => {
    if (cantidad && valorUnitario) {
      return (parseFloat(cantidad) * parseFloat(valorUnitario)).toString();
    }
    return '';
  };

  const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cantidad = e.target.value;
    setFormData(prev => ({
      ...prev,
      cantidad
    }));
    
    const valorTotal = calculateValorTotal(cantidad, formData.valor_unitario);
    setFormData(prev => ({
      ...prev,
      valor_total: valorTotal
    }));
  };

  const handleValorUnitarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorUnitario = e.target.value;
    setFormData(prev => ({
      ...prev,
      valor_unitario: valorUnitario
    }));
    
    const valorTotal = calculateValorTotal(formData.cantidad, valorUnitario);
    setFormData(prev => ({
      ...prev,
      valor_total: valorTotal
    }));
  };

  const resetForm = () => {
    setFormData({
      insumo: '',
      cantidad: '',
      valor_unitario: '',
      valor_total: '',
      proveedor: '',
      referencia_destino: '',
      remision_factura: '',
      movimiento: 'Entrada'
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.insumo || !formData.cantidad || !formData.valor_unitario || !formData.proveedor) {
      alert('Por favor completa los campos requeridos: Insumo, Cantidad, Valor Unitario y Proveedor');
      return;
    }

    setLoading(true);
    try {
      const movementData = {
        insumo: formData.insumo,
        cantidad: parseFloat(formData.cantidad),
        valor_unitario: parseFloat(formData.valor_unitario),
        valor_total: parseFloat(formData.valor_total) || parseFloat(formData.cantidad) * parseFloat(formData.valor_unitario),
        proveedor: formData.proveedor,
        referencia_destino: formData.referencia_destino || null,
        remision_factura: formData.remision_factura || null,
        movimiento: formData.movimiento
      };

      if (editingId) {
        const response: any = await api.updateInventoryMovement(editingId, movementData);
        if (response.success) {
          alert('Movimiento actualizado exitosamente');
          loadMovements();
          resetForm();
          setShowForm(false);
        } else {
          alert('Error al actualizar movimiento: ' + response.message);
        }
      } else {
        const response: any = await api.createInventoryMovement(movementData);
        if (response.success) {
          alert('Movimiento creado exitosamente');
          loadMovements();
          resetForm();
          setShowForm(false);
        } else {
          alert('Error al crear movimiento: ' + response.message);
        }
      }
    } catch (error) {
      console.error('Error guardando movimiento:', error);
      alert('Error al guardar movimiento');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (movement: InventoryMovement) => {
    setFormData({
      insumo: movement.insumo,
      cantidad: movement.cantidad.toString(),
      valor_unitario: movement.valor_unitario.toString(),
      valor_total: movement.valor_total.toString(),
      proveedor: movement.proveedor,
      referencia_destino: movement.referencia_destino || '',
      remision_factura: movement.remision_factura || '',
      movimiento: movement.movimiento
    });
    setEditingId(movement.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este movimiento?')) {
      setLoading(true);
      try {
        const response = await api.deleteInventoryMovement(id);
        if (response.success) {
          alert('Movimiento eliminado exitosamente');
          loadMovements();
        } else {
          alert('Error al eliminar movimiento: ' + response.message);
        }
      } catch (error) {
        console.error('Error eliminando movimiento:', error);
        alert('Error al eliminar movimiento');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    return dateString;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calcular existencias por insumo
  const calculateStockByInsumo = () => {
    const stock: Record<string, number> = {};
    
    movements.forEach(m => {
      if (!stock[m.insumo]) {
        stock[m.insumo] = 0;
      }
      const cantidad = parseFloat(m.cantidad.toString());
      if (m.movimiento === 'Entrada') {
        stock[m.insumo] += cantidad;
      } else {
        stock[m.insumo] -= cantidad;
      }
    });

    return stock;
  };

  // Generar informe PDF
  const generateInsumosPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const stock = calculateStockByInsumo();

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

      const columns = ['Insumo', 'Existencias'];
      const columnWidths = [
        contentWidth * 0.6,
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
      doc.text('Informe de Existencias de Insumos', pageWidth / 2, margin + 3, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text(`Generado: ${new Date().toLocaleDateString()}`, pageWidth / 2, margin + 8, { align: 'center' });

      yPosition = margin + 14;

      drawTableHeader();

      const reportData = Object.entries(stock)
        .filter(([_, cantidad]) => includeZeroStock || cantidad !== 0)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([insumo, cantidad]) => ({
          insumo,
          existencias: Math.round(cantidad)
        }));

      for (let i = 0; i < reportData.length; i++) {
        const row = reportData[i];
        const rowData = [row.insumo, row.existencias];

        if (yPosition + dataRowHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          drawTableHeader();
        }

        drawDataRow(rowData);
      }

      doc.save(`Informe_Existencias_Insumos_${new Date().getTime()}.pdf`);
      setShowReportModal(false);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Asegúrate de tener las librerías instaladas.');
    }
  };

  // Generar informe Excel
  const generateInsumosExcel = async () => {
    try {
      const ExcelJS = await import('exceljs');
      const Workbook = ExcelJS.Workbook;

      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Existencias');

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

      const insumoStyle = {
        font: { bold: true },
        alignment: { horizontal: 'center' as any, vertical: 'center' as any },
        border: border
      };

      const titleRow = worksheet.addRow(['Informe de Existencias de Insumos']);
      titleRow.eachCell(cell => { cell.style = titleStyle; });
      titleRow.height = 20;
      worksheet.mergeCells(titleRow.number, 1, titleRow.number, 2);

      const infoRow = worksheet.addRow([`Generado: ${new Date().toLocaleDateString()}`]);
      infoRow.eachCell(cell => { cell.style = infoStyle; });
      worksheet.mergeCells(infoRow.number, 1, infoRow.number, 2);

      worksheet.addRow([]);

      const columns = ['Insumo', 'Existencias'];
      const headerRow = worksheet.addRow(columns);
      headerRow.eachCell(cell => { cell.style = headerStyle; });
      headerRow.height = 18;

      worksheet.getColumn(1).width = 40;
      worksheet.getColumn(2).width = 20;

      const stock = calculateStockByInsumo();
      const reportData = Object.entries(stock)
        .filter(([_, cantidad]) => includeZeroStock || cantidad !== 0)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([insumo, cantidad]) => ({
          insumo,
          existencias: Math.round(cantidad)
        }));

      reportData.forEach(row => {
        const dataRow = worksheet.addRow([row.insumo, row.existencias]);
        dataRow.eachCell((cell, colNumber) => {
          cell.style = colNumber === 1 ? insumoStyle : dataStyle;
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Informe_Existencias_Insumos_${new Date().getTime()}.xlsx`;
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

  // Filtered and paginated data
  const filteredMovements = useMemo(() => {
    let data = [...movements];

    // Apply text filters (case-insensitive)
    if (insumoFilter) {
      data = data.filter(m => m.insumo.toLowerCase().includes(insumoFilter.toLowerCase()));
    }
    if (referenciaFilter) {
      data = data.filter(m => m.referencia_destino && m.referencia_destino.toLowerCase().includes(referenciaFilter.toLowerCase()));
    }
    if (movimientoFilter) {
      data = data.filter(m => m.movimiento === movimientoFilter);
    }

    // Update pagination
    const totalPages = Math.ceil(data.length / pagination.limit);
    (pagination as any).total = data.length;
    (pagination as any).totalPages = totalPages;
    (pagination as any).hasNextPage = pagination.page < totalPages;
    (pagination as any).hasPreviousPage = pagination.page > 1;

    // Apply pagination
    const startIdx = (pagination.page - 1) * pagination.limit;
    return data.slice(startIdx, startIdx + pagination.limit);
  }, [movements, insumoFilter, referenciaFilter, movimientoFilter, pagination.page, pagination.limit]);

  return (
    <div className="w-full flex flex-col bg-slate-50">
      {/* Header con búsqueda y botón */}
      <div className="px-4 md:px-6 pt-4 md:pt-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">Inventario de Insumos</h1>
          <p className="text-slate-500 text-sm md:text-base">Movimientos de insumos</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <button
            onClick={() => onNavigate?.()}
            className="px-4 py-2 bg-white text-slate-400 font-bold hover:text-slate-600 transition-all border border-slate-100 text-sm rounded-lg"
          >
            ← Atrás
          </button>
          <input
            type="text"
            placeholder="Buscar por insumo..."
            value={insumoFilter}
            onChange={(e) => {
              setInsumoFilter(e.target.value);
              goToPage(1);
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="Buscar por referencia..."
            value={referenciaFilter}
            onChange={(e) => {
              setReferenciaFilter(e.target.value);
              goToPage(1);
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
          <select
            value={movimientoFilter}
            onChange={(e) => {
              setMovimientoFilter(e.target.value as 'Entrada' | 'Salida' | '');
              goToPage(1);
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos los movimientos</option>
            <option value="Entrada">Entrada</option>
            <option value="Salida">Salida</option>
          </select>
          {(insumoFilter || referenciaFilter || movimientoFilter) && (
            <button
              onClick={() => {
                setInsumoFilter('');
                setReferenciaFilter('');
                setMovimientoFilter('');
                goToPage(1);
              }}
              className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-300 transition-colors whitespace-nowrap"
            >
              Limpiar
            </button>
          )}
          {canGenerateReports && (
            <button
              onClick={() => setShowReportModal(true)}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-6 py-2 rounded-lg font-black text-sm uppercase tracking-wide transition-all shadow-sm whitespace-nowrap"
            >
              Generar Informe
            </button>
          )}
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {showForm ? 'Cancelar' : '+ Nuevo Movimiento'}
          </button>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="mt-4 mx-4 md:mx-6 mb-4 bg-white rounded-2xl border-2 border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">{editingId ? 'Editar Movimiento' : 'Nuevo Movimiento'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Insumo *</label>
                <input 
                  type="text" 
                  name="insumo"
                  value={formData.insumo}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Cantidad *</label>
                <input 
                  type="number" 
                  name="cantidad"
                  value={formData.cantidad}
                  onChange={handleCantidadChange}
                  step="0.01"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Valor Unitario *</label>
                <input 
                  type="number" 
                  name="valor_unitario"
                  value={formData.valor_unitario}
                  onChange={handleValorUnitarioChange}
                  step="0.01"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Valor Total</label>
                <input 
                  type="number" 
                  name="valor_total"
                  value={formData.valor_total}
                  readOnly
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Proveedor *</label>
                <input 
                  type="text" 
                  name="proveedor"
                  value={formData.proveedor}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Referencia/Destino</label>
                <input 
                  type="text" 
                  name="referencia_destino"
                  value={formData.referencia_destino}
                  onChange={handleInputChange}
                  placeholder="Opcional"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Remisión/Factura</label>
                <input 
                  type="text" 
                  name="remision_factura"
                  value={formData.remision_factura}
                  onChange={handleInputChange}
                  placeholder="Opcional"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Movimiento *</label>
                <select 
                  name="movimiento"
                  value={formData.movimiento}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="Entrada">Entrada</option>
                  <option value="Salida">Salida</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button 
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button 
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                disabled={loading}
                className="px-6 py-2 bg-slate-300 text-slate-900 rounded-lg font-semibold hover:bg-slate-400 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Section */}
      <div className="flex-1 mx-4 md:mx-6 mt-4 mb-4 md:mb-6 bg-white rounded-2xl border-2 border-slate-200 overflow-visible flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 border-b-2 border-slate-200 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-center font-bold text-slate-700 w-40">Insumo</th>
                <th className="px-4 py-3 text-center font-bold text-slate-700 w-24">Cantidad</th>
                <th className="px-4 py-3 text-center font-bold text-slate-700 w-24">Valor Unit.</th>
                <th className="px-4 py-3 text-center font-bold text-slate-700 w-24">Valor Total</th>
                <th className="px-4 py-3 text-center font-bold text-slate-700 w-32">Proveedor</th>
                <th className="px-4 py-3 text-center font-bold text-slate-700 w-32">Referencia/Destino</th>
                <th className="px-4 py-3 text-center font-bold text-slate-700 w-32">Remisión/Factura</th>
                <th className="px-4 py-3 text-center font-bold text-slate-700 w-20">Movimiento</th>
                <th className="px-4 py-3 text-center font-bold text-slate-700 w-24">Fecha</th>
                <th className="px-4 py-3 text-center font-bold text-slate-700 w-24">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                    Cargando...
                  </td>
                </tr>
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                    {movements.length === 0 ? 'No hay movimientos registrados. Crea uno nuevo para comenzar.' : 'No hay resultados que coincidan con los filtros.'}
                  </td>
                </tr>
              ) : (
                filteredMovements.map((movement) => (
                  <tr key={movement.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-900 w-40">{movement.insumo}</td>
                    <td className="px-4 py-3 text-slate-900 w-24 text-center">{Math.round(movement.cantidad)}</td>
                    <td className="px-4 py-3 text-slate-900 w-24 text-right">{formatCurrency(movement.valor_unitario)}</td>
                    <td className="px-4 py-3 text-slate-900 font-semibold w-24 text-right">{formatCurrency(movement.valor_total)}</td>
                    <td className="px-4 py-3 text-slate-900 w-32 text-center">{movement.proveedor}</td>
                    <td className="px-4 py-3 text-slate-900 w-32 text-center">{movement.referencia_destino || '-'}</td>
                    <td className="px-4 py-3 text-slate-900 w-32 text-center">{movement.remision_factura || '-'}</td>
                    <td className="px-4 py-3 text-center w-20">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        movement.movimiento === 'Entrada' 
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : 'bg-red-100 text-red-800 border-red-300'
                      }`}>
                        {movement.movimiento}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-900 w-24 text-center">{formatDate(movement.fecha_creacion)}</td>
                    <td className="px-4 py-3 text-center w-24">
                      <button 
                        onClick={() => handleEdit(movement)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-xs mr-2 disabled:opacity-50"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(movement.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 font-semibold text-xs disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {movements.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Mostrando {filteredMovements.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} movimientos
            </div>
            <div className="flex gap-2 items-center">
              <select
                value={pagination.limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="px-3 py-1 border border-slate-300 rounded text-sm"
              >
                <option value={10}>10 por página</option>
                <option value={25}>25 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
              </select>
              <button
                onClick={() => previousPage()}
                disabled={!pagination.hasPreviousPage}
                className="px-3 py-1 border border-slate-300 rounded text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>
              <span className="text-sm text-slate-600">
                Página {pagination.page} de {pagination.totalPages || 1}
              </span>
              <button
                onClick={() => nextPage()}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1 border border-slate-300 rounded text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente →
              </button>
            </div>
          </div>
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
                  Incluir insumos en 0
                </label>
                <div className="flex items-center justify-center gap-3">
                  <input
                    type="checkbox"
                    checked={includeZeroStock}
                    onChange={(e) => setIncludeZeroStock(e.target.checked)}
                    className="w-5 h-5 border border-slate-300 rounded cursor-pointer"
                  />
                  <span className="text-sm text-slate-600">Incluir insumos con existencia 0</span>
                </div>
              </div>

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
                    generateInsumosPDF();
                  } else if (reportFormat === 'excel') {
                    generateInsumosExcel();
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

export default InventoryInsumosView;
