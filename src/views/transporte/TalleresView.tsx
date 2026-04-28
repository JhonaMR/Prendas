import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { User, UserRole } from '../../types';
import TalleresImportModal from '../../components/TalleresImportModal';
import PaginationComponent from '../../components/PaginationComponent';
import usePagination from '../../hooks/usePagination';
import { useDarkMode } from '../../context/DarkModeContext';

interface Taller {
  id: string;
  nombre: string;
  celular: string;
  direccion: string;
  sector: string;
  estado: 'activo' | 'inactivo';
  PrecioCarro: string;
  PrecioMoto: string;
}

const FORM_VACIO: Omit<Taller, 'id'> = { nombre: '', celular: '', direccion: '', sector: '', estado: 'activo', PrecioCarro: '', PrecioMoto: '' };

const CamposForm: React.FC<{
  form: Omit<Taller, 'id'>;
  onChange: (f: Omit<Taller, 'id'>) => void;
}> = ({ form, onChange }) => {
  const { isDark } = useDarkMode();
  const inputCls = `w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none transition-colors duration-300 ${
    isDark 
      ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-500 focus:border-violet-400' 
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-pink-400'
  }`;
  
  return (
    <div className="space-y-3">
      <input type="text" placeholder="Nombre del taller" value={form.nombre}
        onChange={e => onChange({ ...form, nombre: e.target.value })} className={inputCls} />
      <input type="text" placeholder="Celular" value={form.celular}
        onChange={e => onChange({ ...form, celular: e.target.value })} className={inputCls} />
      <input type="text" placeholder="Dirección" value={form.direccion}
        onChange={e => onChange({ ...form, direccion: e.target.value })} className={inputCls} />
      <input type="text" placeholder="Sector" value={form.sector}
        onChange={e => onChange({ ...form, sector: e.target.value })} className={inputCls} />
      <select value={form.estado} onChange={e => onChange({ ...form, estado: e.target.value as 'activo' | 'inactivo' })}
        className={`${inputCls} ${isDark ? 'bg-[#3d2d52]' : 'bg-white'}`}>
        <option value="activo">Activo</option>
        <option value="inactivo">Inactivo</option>
      </select>
      <div className="flex gap-3">
        <input type="text" placeholder="Precio carro" value={form.PrecioCarro}
          onChange={e => onChange({ ...form, PrecioCarro: e.target.value })} className={inputCls} />
        <input type="text" placeholder="Precio moto" value={form.PrecioMoto}
          onChange={e => onChange({ ...form, PrecioMoto: e.target.value })} className={inputCls} />
      </div>
    </div>
  );
};

interface TalleresViewProps {
  onVolver: () => void;
  user?: User;
}

const TalleresView: React.FC<TalleresViewProps> = ({ onVolver, user }) => {
  const { isDark } = useDarkMode();
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [modalImport, setModalImport] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const esSoporte = (user?.role as string)?.trim().toLowerCase() === 'soporte';
  const paginacion = usePagination(1, 30);

  useEffect(() => {
    (api as any).getTalleres().then((data: Taller[]) => setTalleres(data));
  }, []);

  const talleresFiltrados = useMemo(() => {
    if (!busqueda.trim()) return talleres;
    const q = busqueda.toLowerCase();
    return talleres.filter(t =>
      t.nombre.toLowerCase().includes(q) ||
      t.sector.toLowerCase().includes(q) ||
      t.direccion.toLowerCase().includes(q) ||
      t.celular.toLowerCase().includes(q)
    );
  }, [talleres, busqueda]);

  useEffect(() => {
    paginacion.goToPage(1);
  }, [busqueda, paginacion.pagination.limit]);

  const totalPages = Math.ceil(talleresFiltrados.length / paginacion.pagination.limit);
  const talleresPagina = talleresFiltrados.slice(
    (paginacion.pagination.page - 1) * paginacion.pagination.limit,
    paginacion.pagination.page * paginacion.pagination.limit
  );

  const [modalNuevo, setModalNuevo] = useState(false);
  const [formNuevo, setFormNuevo] = useState<Omit<Taller, 'id'>>({ ...FORM_VACIO });

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [formEditar, setFormEditar] = useState<Omit<Taller, 'id'>>({ ...FORM_VACIO });

  const [confirmEliminarId, setConfirmEliminarId] = useState<string | null>(null);

  const agregar = async () => {
    if (!formNuevo.nombre.trim()) return;
    const nuevo = { id: Date.now().toString(), ...formNuevo };
    await (api as any).createTaller(nuevo);
    setTalleres(prev => [...prev, nuevo]);
    setFormNuevo({ ...FORM_VACIO });
    setModalNuevo(false);
  };

  const iniciarEdicion = (t: Taller) => {
    setEditandoId(t.id);
    setFormEditar({ nombre: t.nombre, celular: t.celular, direccion: t.direccion, sector: t.sector, estado: t.estado, PrecioCarro: t.PrecioCarro, PrecioMoto: t.PrecioMoto });
  };

  const guardarEdicion = async () => {
    if (!formEditar.nombre.trim() || !editandoId) return;
    await (api as any).updateTaller(editandoId, formEditar);
    setTalleres(prev => prev.map((t: Taller) => t.id === editandoId ? { ...t, ...formEditar } : t));
    setEditandoId(null);
  };

  const eliminar = async (id: string) => {
    await (api as any).deleteTaller(id);
    setTalleres(prev => prev.filter(t => t.id !== id));
    setConfirmEliminarId(null);
  };

  const tallerAEliminar = talleres.find((t: Taller) => t.id === confirmEliminarId);

  return (
    <div className={`h-full w-full flex flex-col p-4 md:p-8 overflow-auto transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-transparent'}`}>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onVolver}
            className={`h-10 w-10 rounded-xl border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
              isDark 
                ? 'bg-[#4a3a63] border-violet-700 text-violet-400 hover:border-pink-600 hover:text-pink-400' 
                : 'bg-white border-slate-200 text-slate-500 hover:border-pink-400 hover:text-pink-600'
            }`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <h1 className={`text-3xl md:text-4xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>Talleres</h1>
            <p className={`text-sm mt-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>{talleres.length} taller{talleres.length !== 1 ? 'es' : ''} registrado{talleres.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {esSoporte && (
            <button onClick={() => setModalImport(true)}
              className={`flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors duration-300 shadow-sm ${
                isDark 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Importar Excel
            </button>
          )}
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
              className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 ${isDark ? 'text-violet-500' : 'text-slate-400'}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar taller..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className={`pl-9 pr-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none w-56 transition-colors duration-300 ${
                isDark 
                  ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-500 focus:border-violet-400' 
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-pink-400'
              }`}
            />
          </div>
          <button onClick={() => { setFormNuevo({ ...FORM_VACIO }); setModalNuevo(true); }}
            className={`flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors duration-300 shadow-sm text-white ${
              isDark 
                ? 'bg-pink-600 hover:bg-pink-700' 
                : 'bg-pink-500 hover:bg-pink-600'
            }`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo taller
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className={`rounded-3xl shadow-sm border overflow-hidden transition-colors duration-300 ${
        isDark 
          ? 'bg-[#4a3a63] border-violet-700' 
          : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] text-violet-50' : 'bg-slate-700 text-white'}`}>
                <th className={`text-left px-5 py-3.5 font-bold tracking-wide w-64 border-r transition-colors duration-300 ${isDark ? 'border-violet-600' : 'border-slate-600'}`}>Taller</th>
                <th className={`text-left px-5 py-3.5 font-bold tracking-wide w-36 border-r transition-colors duration-300 ${isDark ? 'border-violet-600' : 'border-slate-600'}`}>Celular</th>
                <th className={`text-left px-5 py-3.5 font-bold tracking-wide w-72 border-r transition-colors duration-300 ${isDark ? 'border-violet-600' : 'border-slate-600'}`}>Dirección</th>
                <th className={`text-left px-5 py-3.5 font-bold tracking-wide w-36 border-r transition-colors duration-300 ${isDark ? 'border-violet-600' : 'border-slate-600'}`}>Sector</th>
                <th className={`text-left px-5 py-3.5 font-bold tracking-wide w-28 border-r transition-colors duration-300 ${isDark ? 'border-violet-600' : 'border-slate-600'}`}>Estado</th>
                <th className={`text-left px-5 py-3.5 font-bold tracking-wide w-24 border-r transition-colors duration-300 ${isDark ? 'border-violet-600' : 'border-slate-600'}`}>P. Carro</th>
                <th className={`text-left px-5 py-3.5 font-bold tracking-wide w-24 border-r transition-colors duration-300 ${isDark ? 'border-violet-600' : 'border-slate-600'}`}>P. Moto</th>
                <th className="px-5 py-3.5 w-20" />
              </tr>
            </thead>
            <tbody>
              {talleres.length === 0 ? (
                <tr>
                  <td colSpan={8} className={`px-5 py-12 text-center text-sm transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>
                    No hay talleres registrados
                  </td>
                </tr>
              ) : talleresPagina.map((t: Taller, idx: number) => (
                <tr key={t.id} className={`transition-colors duration-300 ${
                  isDark 
                    ? idx % 2 === 0 ? 'bg-[#4a3a63]' : 'bg-[#3d2d52]' 
                    : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                }`}>
                  <td className={`px-5 py-3.5 font-semibold transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>{t.nombre}</td>
                  <td className={`px-5 py-3.5 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>{t.celular || '—'}</td>
                  <td className={`px-5 py-3.5 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>{t.direccion || '—'}</td>
                  <td className={`px-5 py-3.5 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>{t.sector || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors duration-300 ${
                      t.estado === 'activo' 
                        ? isDark ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700'
                        : isDark ? 'bg-violet-900/40 text-violet-400' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {t.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className={`px-5 py-3.5 text-center transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>{t.PrecioCarro ? `$ ${Number(t.PrecioCarro).toLocaleString('es-CO')}` : '—'}</td>
                  <td className={`px-5 py-3.5 text-center transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>{t.PrecioMoto ? `$ ${Number(t.PrecioMoto).toLocaleString('es-CO')}` : '—'}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => iniciarEdicion(t)}
                        className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors duration-300 ${
                          isDark 
                            ? 'text-violet-500 hover:text-blue-400 hover:bg-blue-900/30' 
                            : 'text-slate-300 hover:text-blue-500 hover:bg-blue-50'
                        }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      <button onClick={() => setConfirmEliminarId(t.id)}
                        className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors duration-300 ${
                          isDark 
                            ? 'text-violet-500 hover:text-red-400 hover:bg-red-900/30' 
                            : 'text-slate-300 hover:text-red-500 hover:bg-red-50'
                        }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <PaginationComponent
            currentPage={paginacion.pagination.page}
            totalPages={totalPages}
            pageSize={paginacion.pagination.limit}
            onPageChange={paginacion.goToPage}
            onPageSizeChange={paginacion.setLimit}
          />
        )}
      </div>

      {/* Modal nuevo taller */}
      {modalNuevo && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-300 ${isDark ? 'bg-black/60' : 'bg-black/40'}`}>
          <div className={`rounded-3xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4 transition-colors duration-300 ${
            isDark 
              ? 'bg-[#4a3a63] border border-violet-700' 
              : 'bg-white'
          }`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>Nuevo taller</h2>
              <button onClick={() => setModalNuevo(false)}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-300 ${
                  isDark 
                    ? 'bg-violet-900/40 hover:bg-violet-900/60 text-violet-400' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                }`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <CamposForm form={formNuevo} onChange={setFormNuevo} />
            <div className="flex gap-2">
              <button onClick={agregar} className={`flex-1 font-bold py-2.5 rounded-xl text-sm transition-colors duration-300 text-white ${
                isDark 
                  ? 'bg-pink-600 hover:bg-pink-700' 
                  : 'bg-pink-500 hover:bg-pink-600'
              }`}>Guardar</button>
              <button onClick={() => setModalNuevo(false)} className={`flex-1 font-bold py-2.5 rounded-xl text-sm transition-colors duration-300 ${
                isDark 
                  ? 'bg-violet-900/40 hover:bg-violet-900/60 text-violet-300' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar taller */}
      {editandoId && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-300 ${isDark ? 'bg-black/60' : 'bg-black/40'}`}>
          <div className={`rounded-3xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4 transition-colors duration-300 ${
            isDark 
              ? 'bg-[#4a3a63] border border-violet-700' 
              : 'bg-white'
          }`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>Editar taller</h2>
              <button onClick={() => setEditandoId(null)}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-300 ${
                  isDark 
                    ? 'bg-violet-900/40 hover:bg-violet-900/60 text-violet-400' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                }`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <CamposForm form={formEditar} onChange={setFormEditar} />
            <div className="flex gap-2">
              <button onClick={guardarEdicion} className={`flex-1 font-bold py-2.5 rounded-xl text-sm transition-colors duration-300 text-white ${
                isDark 
                  ? 'bg-pink-600 hover:bg-pink-700' 
                  : 'bg-pink-500 hover:bg-pink-600'
              }`}>Guardar</button>
              <button onClick={() => setEditandoId(null)} className={`flex-1 font-bold py-2.5 rounded-xl text-sm transition-colors duration-300 ${
                isDark 
                  ? 'bg-violet-900/40 hover:bg-violet-900/60 text-violet-300' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {confirmEliminarId && tallerAEliminar && (
        <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-colors duration-300 ${isDark ? 'bg-black/70' : 'bg-black/50'}`}>
          <div className={`rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4 transition-colors duration-300 ${
            isDark 
              ? 'bg-[#4a3a63] border border-violet-700' 
              : 'bg-white'
          }`}>
            <div className="text-center space-y-1">
              <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>¿Seguro que desea eliminar el taller</p>
              <p className={`font-black text-base transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>{tallerAEliminar.nombre}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => eliminar(confirmEliminarId)} className={`flex-1 font-bold py-2.5 rounded-xl text-sm transition-colors duration-300 text-white ${
                isDark 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-red-500 hover:bg-red-600'
              }`}>Eliminar</button>
              <button onClick={() => setConfirmEliminarId(null)} className={`flex-1 font-bold py-2.5 rounded-xl text-sm transition-colors duration-300 ${
                isDark 
                  ? 'bg-violet-900/40 hover:bg-violet-900/60 text-violet-300' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {modalImport && (
        <TalleresImportModal
          onClose={() => setModalImport(false)}
          onImportado={() => {
            (api as any).getTalleres().then((data: Taller[]) => setTalleres(data));
            setModalImport(false);
          }}
        />
      )}
    </div>
  );
};

export default TalleresView;
