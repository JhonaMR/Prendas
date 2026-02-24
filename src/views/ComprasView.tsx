import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import usePagination from '../hooks/usePagination';

interface Compra {
  id: string;
  fecha: string;
  referencia: string | null;
  unidades: number | null;
  insumo: string;
  cantidadInsumo: number;
  precioUnidad: number;
  cantidadTotal: number;
  total: number;
  proveedor: string;
  fechaPedido: string | null;
  observacion: string | null;
  factura: string | null;
  precioRealInsumoUnd: 'pendiente' | 'ok' | 'diferencia';
  afectaInventario: boolean;
}

interface ComprasViewProps {
  user?: any;
  onNavigate?: (tab: string) => void;
}

const ComprasView: React.FC<ComprasViewProps> = ({ user, onNavigate }) => {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [insumoFilter, setInsumoFilter] = useState('');
  const [referenciaFilter, setReferenciaFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<{
    [key: string]: { type: 'none' | 'equals' | 'greater' | 'less' | 'asc' | 'desc' | 'contains'; value?: number | string }
  }>({});
  const [activeFilterMenu, setActiveFilterMenu] = useState<string | null>(null);
  const [filterPosition, setFilterPosition] = useState({ top: 0, left: 0 });
  const filterButtonRef = React.useRef<HTMLButtonElement>(null);
  const [textFilterInputs, setTextFilterInputs] = useState<{ [key: string]: string }>({});
  const [numericFilterInputs, setNumericFilterInputs] = useState<{ [key: string]: string }>({});
  
  // Pagination
  const { pagination, goToPage, nextPage, previousPage, setLimit } = usePagination(1, 50);
  
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    referencia: '',
    unidades: '',
    insumo: '',
    cantidadInsumo: '',
    precioUnidad: '',
    cantidadTotal: '',
    total: '',
    proveedor: '',
    fechaPedido: '',
    observacion: '',
    factura: '',
    precioRealInsumoUnd: 'pendiente',
    afectaInventario: true
  });

  // Cargar compras al montar el componente
  useEffect(() => {
    try {
      loadCompras();
    } catch (error) {
      console.error('❌ Error en useEffect:', error);
    }
  }, []);

  // Cerrar filtro al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-filter-menu]')) {
        setActiveFilterMenu(null);
      }
    };

    if (activeFilterMenu) {
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [activeFilterMenu]);

  const loadCompras = async () => {
    setLoading(true);
    try {
      const data = await api.getCompras();
      console.log('✅ Compras cargadas:', data);
      setCompras(data);
      // Update pagination total
      const totalPages = Math.ceil(data.length / pagination.limit);
      (pagination as any).total = data.length;
      (pagination as any).totalPages = totalPages;
      (pagination as any).hasNextPage = pagination.page < totalPages;
      (pagination as any).hasPreviousPage = pagination.page > 1;
    } catch (error) {
      console.error('❌ Error cargando compras:', error);
      setCompras([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtered and paginated data
  const filteredCompras = useMemo(() => {
    let data = [...compras];

    // Apply text filters
    if (insumoFilter) {
      data = data.filter(c => c.insumo.toLowerCase().includes(insumoFilter.toLowerCase()));
    }
    if (referenciaFilter) {
      data = data.filter(c => c.referencia && c.referencia.toLowerCase().includes(referenciaFilter.toLowerCase()));
    }

    // Sorting by fecha
    if (columnFilters.fecha?.type === 'asc') {
      data.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    }
    if (columnFilters.fecha?.type === 'desc') {
      data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }

    // Sorting by fechaPedido
    if (columnFilters.fechaPedido?.type === 'asc') {
      data.sort((a, b) => {
        const dateA = a.fechaPedido ? new Date(a.fechaPedido).getTime() : 0;
        const dateB = b.fechaPedido ? new Date(b.fechaPedido).getTime() : 0;
        return dateA - dateB;
      });
    }
    if (columnFilters.fechaPedido?.type === 'desc') {
      data.sort((a, b) => {
        const dateA = a.fechaPedido ? new Date(a.fechaPedido).getTime() : 0;
        const dateB = b.fechaPedido ? new Date(b.fechaPedido).getTime() : 0;
        return dateB - dateA;
      });
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
  }, [compras, insumoFilter, referenciaFilter, columnFilters, pagination.page, pagination.limit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const calculateCantidadTotal = (unidades: string, cantidadInsumo: string) => {
    if (unidades && cantidadInsumo) {
      return (parseFloat(unidades) * parseFloat(cantidadInsumo)).toString();
    }
    return cantidadInsumo;
  };

  const calculateTotal = (cantidadTotal: string, precioUnidad: string) => {
    if (cantidadTotal && precioUnidad) {
      return (parseFloat(cantidadTotal) * parseFloat(precioUnidad)).toString();
    }
    return '';
  };

  const handleUnidadesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const unidades = e.target.value;
    setFormData(prev => ({
      ...prev,
      unidades
    }));
    
    const cantidadTotal = calculateCantidadTotal(unidades, formData.cantidadInsumo);
    setFormData(prev => ({
      ...prev,
      cantidadTotal
    }));
  };

  const handleCantidadInsumoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cantidadInsumo = e.target.value;
    setFormData(prev => ({
      ...prev,
      cantidadInsumo
    }));
    
    const cantidadTotal = calculateCantidadTotal(formData.unidades, cantidadInsumo);
    setFormData(prev => ({
      ...prev,
      cantidadTotal
    }));
  };

  const handlePrecioUnidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const precioUnidad = e.target.value;
    setFormData(prev => ({
      ...prev,
      precioUnidad
    }));
    
    const total = calculateTotal(formData.cantidadTotal, precioUnidad);
    setFormData(prev => ({
      ...prev,
      total
    }));
  };

  const handleCantidadTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cantidadTotal = e.target.value;
    setFormData(prev => ({
      ...prev,
      cantidadTotal
    }));
    
    const total = calculateTotal(cantidadTotal, formData.precioUnidad);
    setFormData(prev => ({
      ...prev,
      total
    }));
  };

  const resetForm = () => {
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      referencia: '',
      unidades: '',
      insumo: '',
      cantidadInsumo: '',
      precioUnidad: '',
      cantidadTotal: '',
      total: '',
      proveedor: '',
      fechaPedido: '',
      observacion: '',
      factura: '',
      precioRealInsumoUnd: 'pendiente',
      afectaInventario: true
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.fecha || !formData.insumo || !formData.cantidadInsumo || !formData.proveedor) {
      alert('Por favor completa los campos requeridos: Fecha, Insumo, Cantidad Insumo y Proveedor');
      return;
    }

    setLoading(true);
    try {
      const compraData = {
        fecha: formData.fecha,
        referencia: formData.referencia || null,
        unidades: formData.unidades ? parseFloat(formData.unidades) : null,
        insumo: formData.insumo,
        cantidadInsumo: parseFloat(formData.cantidadInsumo),
        precioUnidad: parseFloat(formData.precioUnidad) || 0,
        cantidadTotal: parseFloat(formData.cantidadTotal) || parseFloat(formData.cantidadInsumo),
        total: parseFloat(formData.total) || 0,
        proveedor: formData.proveedor,
        fechaPedido: formData.fechaPedido || null,
        observacion: formData.observacion || null,
        factura: formData.factura || null,
        precioRealInsumoUnd: formData.precioRealInsumoUnd,
        afectaInventario: formData.afectaInventario
      };

      if (editingId) {
        const response = await api.updateCompra(editingId, compraData);
        if (response.success) {
          alert('Compra actualizada exitosamente');
          loadCompras();
          resetForm();
          setShowForm(false);
        } else {
          alert('Error al actualizar compra: ' + response.message);
        }
      } else {
        const response: any = await api.createCompra(compraData);
        if (response.success) {
          alert('Compra creada exitosamente');
          loadCompras();
          resetForm();
          setShowForm(false);
        } else {
          const errorMsg = response.errors 
            ? response.errors.join('\n') 
            : response.message;
          alert('Error al crear compra:\n' + errorMsg);
          console.error('Errores de validación:', response.errors);
        }
      }
    } catch (error) {
      console.error('Error guardando compra:', error);
      alert('Error al guardar compra');
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    // Si es un ISO string, extraer solo la fecha
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    return dateString;
  };

  const handleEdit = (compra: Compra) => {
    setFormData({
      fecha: formatDateForInput(compra.fecha),
      referencia: compra.referencia || '',
      unidades: compra.unidades?.toString() || '',
      insumo: compra.insumo,
      cantidadInsumo: compra.cantidadInsumo.toString(),
      precioUnidad: compra.precioUnidad.toString(),
      cantidadTotal: compra.cantidadTotal.toString(),
      total: compra.total.toString(),
      proveedor: compra.proveedor,
      fechaPedido: formatDateForInput(compra.fechaPedido),
      observacion: compra.observacion || '',
      factura: compra.factura || '',
      precioRealInsumoUnd: compra.precioRealInsumoUnd,
      afectaInventario: compra.afectaInventario
    });
    setEditingId(compra.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta compra?')) {
      setLoading(true);
      try {
        const response = await api.deleteCompra(id);
        if (response.success) {
          alert('Compra eliminada exitosamente');
          loadCompras();
        } else {
          alert('Error al eliminar compra: ' + response.message);
        }
      } catch (error) {
        console.error('Error eliminando compra:', error);
        alert('Error al eliminar compra');
      } finally {
        setLoading(false);
      }
    }
  };

  const getPrecioRealColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ok':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'diferencia':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPrecioRealLabel = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'ok':
        return 'OK';
      case 'diferencia':
        return 'Diferencia';
      default:
        return estado;
    }
  };

  const FilterButton = React.memo(({ column }: { column: string }) => {
    const filter = columnFilters[column];
    const hasFilter = filter?.type !== 'none' && filter?.type !== undefined;
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    const handleClick = () => {
      if (buttonRef.current && activeFilterMenu !== column) {
        const rect = buttonRef.current.getBoundingClientRect();
        setFilterPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX
        });
      }
      setActiveFilterMenu(activeFilterMenu === column ? null : column);
    };

    return (
      <div className="relative inline-block" data-filter-menu>
        <button
          ref={buttonRef}
          onClick={handleClick}
          className={`inline-flex items-center gap-1 px-1 py-0.5 rounded transition-colors ${
            hasFilter
              ? 'text-blue-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
          title="Ordenar"
        >
          ▼
        </button>

        {activeFilterMenu === column && (
          <div 
            className="fixed bg-white border-2 border-slate-300 rounded-lg shadow-2xl p-2 z-[9999]"
            style={{
              top: `${filterPosition.top}px`,
              left: `${filterPosition.left}px`,
              width: 'max-content'
            }}
          >
            <div className="space-y-1">
              <button
                onClick={() => {
                  setColumnFilters(prev => ({ ...prev, [column]: { type: 'none' } }));
                  setActiveFilterMenu(null);
                }}
                className="text-left px-2 py-1 text-xs hover:bg-slate-100 rounded whitespace-nowrap block"
              >
                Sin filtro
              </button>
              <button
                onClick={() => {
                  setColumnFilters(prev => ({ ...prev, [column]: { type: 'asc' } }));
                  setActiveFilterMenu(null);
                }}
                className="text-left px-2 py-1 text-xs hover:bg-slate-100 rounded whitespace-nowrap block"
              >
                Menor a Mayor ↑
              </button>
              <button
                onClick={() => {
                  setColumnFilters(prev => ({ ...prev, [column]: { type: 'desc' } }));
                  setActiveFilterMenu(null);
                }}
                className="text-left px-2 py-1 text-xs hover:bg-slate-100 rounded whitespace-nowrap block"
              >
                Mayor a Menor ↓
              </button>
            </div>
          </div>
        )}
      </div>
    );
  });

  FilterButton.displayName = 'FilterButton';

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    // Si es un ISO string, extraer solo la fecha
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

  return (
    <div className="w-full flex flex-col bg-slate-50">
      {/* Header con búsqueda y botón */}
      <div className="px-4 md:px-6 pt-4 md:pt-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">Compras</h1>
          <p className="text-slate-500 text-sm md:text-base">Registro de compras de insumos</p>
        </div>
        <div className="flex gap-3 items-center">
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
          {(insumoFilter || referenciaFilter || Object.values(columnFilters).some((f: any) => f.type !== 'none' && f.type !== undefined)) && (
            <button
              onClick={() => {
                setInsumoFilter('');
                setReferenciaFilter('');
                setColumnFilters({});
                setTextFilterInputs({});
                setNumericFilterInputs({});
                goToPage(1);
              }}
              className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-300 transition-colors whitespace-nowrap"
            >
              Limpiar
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
            {showForm ? 'Cancelar' : '+ Nueva Compra'}
          </button>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="mt-4 mx-4 md:mx-6 mb-4 bg-white rounded-2xl border-2 border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">{editingId ? 'Editar Compra' : 'Nueva Compra'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha *</label>
                <input 
                  type="date" 
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Referencia</label>
                <input 
                  type="text" 
                  name="referencia"
                  value={formData.referencia}
                  onChange={handleInputChange}
                  placeholder="Opcional" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Unidades</label>
                <input 
                  type="number" 
                  name="unidades"
                  value={formData.unidades}
                  onChange={handleUnidadesChange}
                  placeholder="Opcional" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" 
                />
              </div>
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Cantidad Insumo *</label>
                <input 
                  type="number" 
                  name="cantidadInsumo"
                  value={formData.cantidadInsumo}
                  onChange={handleCantidadInsumoChange}
                  step="0.01"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Precio Unitario</label>
                <input 
                  type="number" 
                  name="precioUnidad"
                  value={formData.precioUnidad}
                  onChange={handlePrecioUnidadChange}
                  step="0.01" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Cantidad Total</label>
                <input 
                  type="number" 
                  name="cantidadTotal"
                  value={formData.cantidadTotal}
                  onChange={handleCantidadTotalChange}
                  step="0.01"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Total</label>
                <input 
                  type="number" 
                  name="total"
                  value={formData.total}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" 
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha Pedido</label>
                <input 
                  type="date" 
                  name="fechaPedido"
                  value={formData.fechaPedido}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Factura</label>
                <input 
                  type="text" 
                  name="factura"
                  value={formData.factura}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Precio Real Insumo UND</label>
                <select 
                  name="precioRealInsumoUnd"
                  value={formData.precioRealInsumoUnd}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="ok">OK</option>
                  <option value="diferencia">Diferencia</option>
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Afecta Inventario</label>
                <input 
                  type="checkbox" 
                  name="afectaInventario"
                  checked={formData.afectaInventario}
                  onChange={handleInputChange}
                  className="w-5 h-5 border border-slate-300 rounded focus:outline-none focus:border-blue-500 cursor-pointer" 
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Observación</label>
              <textarea 
                name="observacion"
                value={formData.observacion}
                onChange={handleInputChange}
                rows={3} 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" 
              />
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
                <th className="px-4 py-1 text-center font-bold text-slate-700 w-24">
                  <div className="flex items-center justify-center gap-1">
                    Fecha
                    <FilterButton column="fecha" />
                  </div>
                </th>
                <th className="px-4 py-1 text-center font-bold text-slate-700 w-32">Referencia</th>
                <th className="px-4 py-1 text-center font-bold text-slate-700 w-20">Unidades</th>
                <th className="px-4 py-1 text-center font-bold text-slate-700 flex-1 min-w-[250px]">Insumo</th>
                <th className="px-4 py-1 text-center font-bold text-slate-700 w-28">Cant. Insumo</th>
                <th className="px-4 py-1 text-center font-bold text-slate-700 w-24">Precio Unit.</th>
                <th className="px-4 py-1 text-center font-bold text-slate-700 w-24">Cant. Total</th>
                <th className="px-4 py-1 text-center font-bold text-slate-700 w-24">Total</th>
                <th className="px-4 py-1 text-center font-bold text-slate-700 w-40">Proveedor</th>
                <th className="px-4 py-1 text-center font-bold text-slate-700 w-24">
                  <div className="flex items-center justify-center gap-1">
                    Fecha Pedido
                    <FilterButton column="fechaPedido" />
                  </div>
                </th>
                <th className="px-4 py-1 text-center font-bold text-slate-700 w-40">Observación</th>
                <th className="px-4 py-1 text-center font-bold text-slate-700 w-24">Factura</th>
                <th className="px-4 py-1 text-center font-bold text-slate-700 w-32">Precio Verificado</th>
                <th className="px-4 py-1 text-center font-bold text-slate-700 w-20">Afecta Inv.</th>
                <th className="px-4 py-1 text-center font-bold text-slate-700 w-24">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={15} className="px-4 py-8 text-center text-slate-500">
                    Cargando...
                  </td>
                </tr>
              ) : filteredCompras.length === 0 ? (
                <tr>
                  <td colSpan={15} className="px-4 py-8 text-center text-slate-500">
                    {compras.length === 0 ? 'No hay compras registradas. Crea una nueva compra para comenzar.' : 'No hay resultados que coincidan con los filtros.'}
                  </td>
                </tr>
              ) : (
                filteredCompras.map((compra) => (
                  <tr key={compra.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-1 text-slate-900 w-24 text-center">{formatDate(compra.fecha)}</td>
                    <td className="px-4 py-1 text-slate-900 w-32 text-center">{compra.referencia || '-'}</td>
                    <td className="px-4 py-1 text-slate-900 w-20 text-center">{compra.unidades || '-'}</td>
                    <td className="px-4 py-1 text-slate-900 flex-1 min-w-[250px]">{compra.insumo}</td>
                    <td className="px-4 py-1 text-slate-900 w-28 text-center">{compra.cantidadInsumo}</td>
                    <td className="px-4 py-1 text-slate-900 w-24 text-right">{formatCurrency(compra.precioUnidad)}</td>
                    <td className="px-4 py-1 text-slate-900 w-24 text-center">{compra.cantidadTotal}</td>
                    <td className="px-4 py-1 text-slate-900 font-semibold w-24 text-right">{formatCurrency(compra.total)}</td>
                    <td className="px-4 py-1 text-slate-900 w-40 text-center">{compra.proveedor}</td>
                    <td className="px-4 py-1 text-slate-900 w-24 text-center">{formatDate(compra.fechaPedido)}</td>
                    <td className="px-4 py-1 text-slate-900 w-40 truncate" title={compra.observacion || ''}>{compra.observacion || '-'}</td>
                    <td className="px-4 py-1 text-slate-900 w-24 text-center">{compra.factura || '-'}</td>
                    <td className="px-4 py-1 w-32 flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPrecioRealColor(compra.precioRealInsumoUnd)}`}>
                        {getPrecioRealLabel(compra.precioRealInsumoUnd)}
                      </span>
                    </td>
                    <td className="px-4 py-1 text-center w-20">
                      <input
                        type="checkbox"
                        checked={compra.afectaInventario}
                        readOnly
                        className="w-5 h-5 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-1 text-center w-24">
                      <button 
                        onClick={() => handleEdit(compra)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-xs mr-2 disabled:opacity-50"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(compra.id)}
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
        {compras.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Mostrando {filteredCompras.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} compras
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
    </div>
  );
};

export default ComprasView;
