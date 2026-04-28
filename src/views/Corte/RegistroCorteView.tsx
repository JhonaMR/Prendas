import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Search, Save, Upload } from 'lucide-react';
import PaginationComponent from '../../components/PaginationComponent';
import usePagination from '../../hooks/usePagination';
import api from '../../services/api';
import CorteImportModal, { ImportedCorteRow } from '../../components/CorteImportModal';
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
    </div>
  );
};

export default RegistroCorteView;
