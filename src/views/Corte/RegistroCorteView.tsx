import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Search, Save, Upload } from 'lucide-react';
import PaginationComponent from '../../components/PaginationComponent';
import usePagination from '../../hooks/usePagination';
import api from '../../services/api';
import CorteImportModal, { ImportedCorteRow } from '../../components/CorteImportModal';
import { User, UserRole, Reference } from '../../types';

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
  const [registros, setRegistros] = useState<RegistroCorte[]>([]);
  const [searchReferencia, setSearchReferencia] = useState('');
  const [searchNumeroFicha, setSearchNumeroFicha] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const cortesPagination = usePagination(1, 20);

  const isSoporte = user.role === UserRole.SOPORTE;

  // Actualizar descripciones cuando cambien las referencias
  useEffect(() => {
    if (referencesMaster.length > 0 && registros.length > 0) {
      setRegistros(prev => prev.map(r => {
        const referenceData = referencesMaster.find(ref => ref.id === r.referencia);
        return {
          ...r,
          descripcion: referenceData?.description || r.descripcion
        };
      }));
    }
  }, [referencesMaster]);

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
        setRegistros(loaded);
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
    const newRegistro: RegistroCorte = {
      id: `temp_${Date.now()}`,
      numeroFicha: '',
      fechaCorte: new Date().toISOString().split('T')[0],
      referencia: '',
      descripcion: '',
      cantidadCortada: 0,
      saved: false,
    };
    setRegistros(prev => [newRegistro, ...prev]);
    setEditingId(newRegistro.id);
    setHasUnsavedChanges(true);
  };

  const handleFieldChange = (id: string, field: string, value: any) => {
    setRegistros(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    setHasUnsavedChanges(true);
  };

  const handleEditReferencia = (id: string, value: string) => {
    const referenceData = referencesMaster.find(ref => ref.id === value);
    setRegistros(prev => prev.map(r =>
      r.id === id
        ? { ...r, referencia: value, descripcion: referenceData?.description || r.descripcion }
        : r
    ));
    setHasUnsavedChanges(true);
  };

  const handleSaveAll = async () => {
    const unsaved = registros.filter(r => !r.saved);

    for (const r of unsaved) {
      if (!r.numeroFicha || !r.referencia || !r.cantidadCortada) {
        alert('Por favor completa todos los campos requeridos antes de guardar');
        return;
      }
    }

    setLoading(true);
    try {
      for (const r of unsaved) {
        const { id, saved, ...data } = r;
        if (id.startsWith('temp_')) {
          await api.createCorteRegistro(data);
        } else {
          await api.updateCorteRegistro(id, data);
        }
      }
      // Recargar
      const data = await api.getCorteRegistros();
      setRegistros(data.map((r: any) => ({ ...r, saved: true })));
      setEditingId(null);
      setHasUnsavedChanges(false);
    } catch {
      alert('Error al guardar los registros');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este registro?')) return;
    if (id.startsWith('temp_')) {
      setRegistros(prev => prev.filter(r => r.id !== id));
      if (editingId === id) setEditingId(null);
      return;
    }
    setLoading(true);
    try {
      await api.deleteCorteRegistro(id);
      setRegistros(prev => prev.filter(r => r.id !== id));
      if (editingId === id) setEditingId(null);
    } catch {
      alert('Error al eliminar el registro');
    } finally {
      setLoading(false);
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
    setRegistros(prev => [...newRegistros, ...prev]);
    setHasUnsavedChanges(true);
    alert(`${rows.length} registros importados. Revisa y guarda cuando estés listo.`);
  };

  const filteredRegistros = registros.filter(r =>
    r.referencia.toLowerCase().includes(searchReferencia.toLowerCase()) &&
    r.numeroFicha.toLowerCase().includes(searchNumeroFicha.toLowerCase())
  );

  useEffect(() => {
    cortesPagination.goToPage(1);
  }, [filteredRegistros.length]);

  const totalPages = Math.ceil(filteredRegistros.length / cortesPagination.pagination.limit) || 1;
  const paginatedRegistros = filteredRegistros.slice(
    (cortesPagination.pagination.page - 1) * cortesPagination.pagination.limit,
    cortesPagination.pagination.page * cortesPagination.pagination.limit
  );

  return (
    <div className="h-full w-full flex flex-col p-6 bg-transparent">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-1">Registro de Corte</h1>
            <p className="text-sm text-slate-500">Gestiona tus fichas de corte de forma eficiente</p>
          </div>

          <div className="flex items-end gap-3">
            {/* Limpiar filtros */}
            <button
              onClick={() => { setSearchReferencia(''); setSearchNumeroFicha(''); }}
              className="flex items-center justify-center w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-lg transition shadow-md"
              title="Limpiar filtros"
            >✕</button>

            {/* Filtro Ref */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 text-center">Filtro por Ref.</label>
              <div className="relative">
                <Search className="absolute left-2 top-2 w-4 h-4 text-pink-400" />
                <input
                  type="text"
                  placeholder="13101"
                  value={searchReferencia}
                  onChange={e => setSearchReferencia(e.target.value)}
                  className="pl-7 pr-3 py-1.5 text-sm border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white/80"
                />
              </div>
            </div>

            {/* Filtro N° Ficha */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 text-center">Filtrar por N° FICHA</label>
              <div className="relative">
                <Search className="absolute left-2 top-2 w-4 h-4 text-purple-400" />
                <input
                  type="text"
                  placeholder="1482"
                  value={searchNumeroFicha}
                  onChange={e => setSearchNumeroFicha(e.target.value)}
                  className="pl-7 pr-3 py-1.5 text-sm border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/80"
                />
              </div>
            </div>

            {/* Botón Import - solo SOPORTE */}
            {isSoporte && (
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1.5 rounded-lg font-medium text-sm transition shadow-md"
              >
                <Upload className="w-4 h-4" />
                Importar
              </button>
            )}

            {/* Botón Agregar */}
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white px-3 py-1.5 rounded-lg font-medium text-sm transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>

            {/* Botón Guardar */}
            <button
              onClick={handleSaveAll}
              disabled={!hasUnsavedChanges}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition shadow-md ${
                hasUnsavedChanges
                  ? 'bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="flex-1 overflow-auto bg-white/90 backdrop-blur rounded-xl shadow-lg border border-pink-100 mb-4">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-400">Cargando...</div>
        ) : (
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
            <thead className="bg-gradient-to-r from-pink-100 to-purple-100 border-b-2 border-pink-200 sticky top-0">
              <tr>
                <th className="px-6 py-4 text-center text-sm font-bold text-slate-800 border-r border-pink-200 w-32">N° DE FICHA</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-slate-800 border-r border-pink-200 w-32">FECHA CORTE</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-slate-800 border-r border-pink-200" style={{ width: '100px' }}>REF.</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-slate-800 border-r border-pink-200" style={{ width: '200px' }}>DESCRIPCION</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-slate-800 border-r border-pink-200 w-32">CANT. CORTADA</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-slate-800 w-20">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRegistros.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-pink-200" />
                      <p>No hay registros que coincidan con tu búsqueda</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRegistros.map((registro, idx) => (
                  <tr key={registro.id} className={`border-b border-pink-100 hover:bg-pink-50/50 transition ${idx % 2 === 0 ? 'bg-white/50' : 'bg-purple-50/30'}`}>
                    <td className="px-6 py-2.5 text-sm border-r border-pink-100 text-center">
                      {editingId === registro.id ? (
                        <input type="text" value={registro.numeroFicha}
                          onChange={e => handleFieldChange(registro.id, 'numeroFicha', e.target.value)}
                          className="w-full px-2 py-1 border-2 border-pink-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white text-center" />
                      ) : (
                        <span className="text-slate-900 font-semibold">{registro.numeroFicha}</span>
                      )}
                    </td>
                    <td className="px-6 py-2.5 text-sm border-r border-pink-100 text-center">
                      {editingId === registro.id ? (
                        <input type="date" value={registro.fechaCorte}
                          onChange={e => handleFieldChange(registro.id, 'fechaCorte', e.target.value)}
                          className="w-full px-2 py-1 border-2 border-pink-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white text-center" />
                      ) : (
                        <span className="text-slate-700">{registro.fechaCorte}</span>
                      )}
                    </td>
                    <td className="px-6 py-2.5 text-sm border-r border-pink-100 text-center">
                      {editingId === registro.id ? (
                        <input type="text" value={registro.referencia}
                          onChange={e => handleEditReferencia(registro.id, e.target.value)}
                          placeholder="13101" list="referencias-list"
                          className="w-full px-2 py-1 border-2 border-pink-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white text-center" />
                      ) : (
                        <span className="text-slate-900 font-semibold">{registro.referencia}</span>
                      )}
                    </td>
                    <td className="px-6 py-2.5 text-sm border-r border-pink-100 text-left">
                      <span className="text-slate-700">{registro.descripcion}</span>
                    </td>
                    <td className="px-6 py-2.5 text-sm border-r border-pink-100 text-center">
                      {editingId === registro.id ? (
                        <input type="number" value={registro.cantidadCortada}
                          onChange={e => handleFieldChange(registro.id, 'cantidadCortada', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 border-2 border-pink-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white text-center" />
                      ) : (
                        <span className="text-slate-900 font-bold">{registro.cantidadCortada}</span>
                      )}
                    </td>
                    <td className="px-6 py-2.5 text-center">
                      <div className="flex justify-center gap-2">
                        {editingId === registro.id ? (
                          <button onClick={() => setEditingId(null)}
                            className="p-2 text-slate-600 hover:bg-red-100 rounded-lg transition" title="Cancelar">✕</button>
                        ) : (
                          <>
                            <button onClick={() => setEditingId(registro.id)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition" title="Editar">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(registro.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition" title="Eliminar">
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
