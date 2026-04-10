import React, { useState, useEffect } from 'react';
import api from '../../services/api';

interface Taller {
  id: string;
  nombre: string;
  celular: string;
  direccion: string;
  sector: string;
  estado: 'activo' | 'inactivo';
}

const FORM_VACIO: Omit<Taller, 'id'> = { nombre: '', celular: '', direccion: '', sector: '', estado: 'activo' };

const inputCls = "w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-pink-400";

const CamposForm: React.FC<{
  form: Omit<Taller, 'id'>;
  onChange: (f: Omit<Taller, 'id'>) => void;
}> = ({ form, onChange }) => (
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
      className={`${inputCls} bg-white`}>
      <option value="activo">Activo</option>
      <option value="inactivo">Inactivo</option>
    </select>
  </div>
);

interface TalleresViewProps {
  onVolver: () => void;
}

const TalleresView: React.FC<TalleresViewProps> = ({ onVolver }) => {
  const [talleres, setTalleres] = useState<Taller[]>([]);

  useEffect(() => {
    (api as any).getTalleres().then((data: Taller[]) => setTalleres(data));
  }, []);

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
    setFormEditar({ nombre: t.nombre, celular: t.celular, direccion: t.direccion, sector: t.sector, estado: t.estado });
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
    <div className="h-full w-full flex flex-col bg-transparent p-4 md:p-8 overflow-auto">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onVolver}
            className="h-10 w-10 rounded-xl bg-white border-2 border-slate-200 hover:border-pink-400 flex items-center justify-center text-slate-500 hover:text-pink-600 transition-all flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900">Talleres</h1>
            <p className="text-slate-400 text-sm mt-1">{talleres.length} taller{talleres.length !== 1 ? 'es' : ''} registrado{talleres.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={() => { setFormNuevo({ ...FORM_VACIO }); setModalNuevo(true); }}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo taller
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-700 text-white">
                <th className="text-left px-5 py-3.5 font-bold tracking-wide w-64">Taller</th>
                <th className="text-left px-5 py-3.5 font-bold tracking-wide w-36">Celular</th>
                <th className="text-left px-5 py-3.5 font-bold tracking-wide w-72">Dirección</th>
                <th className="text-left px-5 py-3.5 font-bold tracking-wide w-36">Sector</th>
                <th className="text-left px-5 py-3.5 font-bold tracking-wide w-28">Estado</th>
                <th className="px-5 py-3.5 w-20" />
              </tr>
            </thead>
            <tbody>
              {talleres.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">
                    No hay talleres registrados
                  </td>
                </tr>
              ) : talleres.map((t: Taller, idx: number) => (
                <tr key={t.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{t.nombre}</td>
                  <td className="px-5 py-3.5 text-slate-600">{t.celular || '—'}</td>
                  <td className="px-5 py-3.5 text-slate-600">{t.direccion || '—'}</td>
                  <td className="px-5 py-3.5 text-slate-600">{t.sector || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {t.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => iniciarEdicion(t)}
                        className="w-7 h-7 flex items-center justify-center rounded-full text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      <button onClick={() => setConfirmEliminarId(t.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
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
      </div>

      {/* Modal nuevo taller */}
      {modalNuevo && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Nuevo taller</h2>
              <button onClick={() => setModalNuevo(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-500">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <CamposForm form={formNuevo} onChange={setFormNuevo} />
            <div className="flex gap-2">
              <button onClick={agregar} className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">Guardar</button>
              <button onClick={() => setModalNuevo(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar taller */}
      {editandoId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Editar taller</h2>
              <button onClick={() => setEditandoId(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-500">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <CamposForm form={formEditar} onChange={setFormEditar} />
            <div className="flex gap-2">
              <button onClick={guardarEdicion} className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">Guardar</button>
              <button onClick={() => setEditandoId(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {confirmEliminarId && tallerAEliminar && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="text-center space-y-1">
              <p className="text-slate-600 text-sm">¿Seguro que desea eliminar el taller</p>
              <p className="font-black text-slate-900 text-base">{tallerAEliminar.nombre}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => eliminar(confirmEliminarId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">Eliminar</button>
              <button onClick={() => setConfirmEliminarId(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TalleresView;
