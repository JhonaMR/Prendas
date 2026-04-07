import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { User, UserRole } from '../types';
import CuentasBancariasImportModal from '../components/CuentasBancariasImportModal';

interface CuentaBancaria {
  id: number;
  cedula: string;
  nombre: string;
  cuenta: string;
}

interface CuentasBancariasViewProps {
  onVolver: () => void;
  user: User;
}

type ModalTipo = 'crear' | 'editar' | 'eliminar' | null;

const FORM_VACIO = { cedula: '', nombre: '', cuenta: '' };

const CuentasBancariasView: React.FC<CuentasBancariasViewProps> = ({ onVolver, user }) => {
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState<ModalTipo>(null);
  const [modalImport, setModalImport] = useState(false);
  const [seleccionada, setSeleccionada] = useState<CuentaBancaria | null>(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [error, setError] = useState('');

  const esSoporte = user.role === UserRole.SOPORTE;

  const cargarCuentas = () => {
    api.getCuentasBancarias().then(data => {
      setCuentas(data);
      setLoading(false);
    });
  };

  useEffect(() => { cargarCuentas(); }, []);

  const cuentasFiltradas = cuentas
    .filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const cerrarModal = () => {
    setModal(null);
    setSeleccionada(null);
    setForm(FORM_VACIO);
    setError('');
  };

  // ESC cierra cualquier modal abierto
  useEffect(() => {
    if (!modal) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') cerrarModal(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modal]);

  const abrirCrear = () => {
    setForm(FORM_VACIO);
    setError('');
    setModal('crear');
  };

  const abrirEditar = (c: CuentaBancaria) => {
    setSeleccionada(c);
    setForm({ cedula: c.cedula, nombre: c.nombre, cuenta: c.cuenta });
    setError('');
    setModal('editar');
  };

  const abrirEliminar = (c: CuentaBancaria) => {
    setSeleccionada(c);
    setModal('eliminar');
  };

  const handleGuardar = async () => {
    if (!form.cedula.trim() || !form.nombre.trim() || !form.cuenta.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (modal === 'crear') {
      const res = await api.createCuentaBancaria(form);
      if (res.success && res.data) setCuentas(prev => [...prev, res.data]);
      else { setError(res.message || 'Error al guardar'); return; }
    } else if (modal === 'editar' && seleccionada) {
      const res = await api.updateCuentaBancaria(seleccionada.id, form);
      if (res.success && res.data) setCuentas(prev => prev.map(c => c.id === seleccionada.id ? res.data : c));
      else { setError(res.message || 'Error al guardar'); return; }
    }
    cerrarModal();
  };

  const handleEliminar = async () => {
    if (seleccionada) {
      await api.deleteCuentaBancaria(seleccionada.id);
      setCuentas(prev => prev.filter(c => c.id !== seleccionada.id));
    }
    cerrarModal();
  };

  return (
    <div className="h-full w-full flex flex-col bg-transparent p-4 md:p-6 pt-1 md:pt-2 overflow-auto">
      {/* Volver */}
      <div className="mb-4 flex items-center">
        <button
          onClick={onVolver}
          className="flex items-center gap-2 text-violet-500 hover:text-violet-800 font-semibold transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver al calendario
        </button>
      </div>

      {/* Título + acciones */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-black text-violet-900">Cuentas Bancarias Registradas</h1>
        <div className="flex items-center gap-3 flex-shrink-0">
          {esSoporte && (
            <button
              onClick={() => setModalImport(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Importar desde Excel
            </button>
          )}
          <button
            onClick={abrirCrear}
            className="flex items-center gap-2 bg-violet-500 hover:bg-violet-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva cuenta
          </button>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-violet-300 absolute left-3 top-1/2 -translate-y-1/2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="pl-10 pr-4 py-2.5 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 text-violet-900 placeholder-violet-300 w-64"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-3xl shadow-lg border border-violet-100 overflow-hidden">
        <table className="w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-violet-500 text-white divide-x divide-violet-500">
              <th className="text-left px-6 py-4 font-bold text-sm tracking-wide">Cédula</th>
              <th className="text-left px-6 py-4 font-bold text-sm tracking-wide">Nombre</th>
              <th className="text-left px-6 py-4 font-bold text-sm tracking-wide w-96">Cuenta Banc.</th>
              <th className="px-4 py-4 font-bold text-sm tracking-wide text-center w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cuentasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-violet-300 font-medium">
                  {loading ? 'Cargando...' : 'No se encontraron cuentas registradas.'}
                </td>
              </tr>
            ) : (
              cuentasFiltradas.map((c, i) => (
                <tr key={c.id} className={`divide-x divide-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-violet-50/40'}`}>
                  <td className="px-6 py-4 text-slate-600 text-sm">{c.cedula}</td>
                  <td className="px-6 py-4 text-slate-900 font-semibold text-sm">{c.nombre}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm font-mono">{c.cuenta}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Editar */}
                      <button
                        onClick={() => abrirEditar(c)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-violet-500 hover:text-white bg-violet-100 hover:bg-violet-500 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                        </svg>
                        Editar
                      </button>
                      {/* Eliminar */}
                      <button
                        onClick={() => abrirEliminar(c)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-white bg-red-50 hover:bg-red-500 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear / Editar */}
      {(modal === 'crear' || modal === 'editar') && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-black text-violet-900 mb-6">
              {modal === 'crear' ? 'Nueva Cuenta Bancaria' : 'Editar Cuenta Registrada'}
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-violet-500 mb-1">Cédula</label>
                <input
                  type="text"
                  value={form.cedula}
                  onChange={e => setForm(f => ({ ...f, cedula: e.target.value }))}
                  placeholder="Ej: 123456"
                  className="w-full border-2 border-violet-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-violet-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-violet-500 mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Nombre completo"
                  className="w-full border-2 border-violet-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-violet-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-violet-500 mb-1">Cuenta Banc.</label>
                <input
                  type="text"
                  value={form.cuenta}
                  onChange={e => setForm(f => ({ ...f, cuenta: e.target.value }))}
                  placeholder="Número de cuenta"
                  className="w-full border-2 border-violet-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-violet-500 text-slate-900"
                />
              </div>
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={cerrarModal}
                className="flex-1 border-2 border-violet-200 text-violet-500 font-semibold py-2.5 rounded-xl hover:bg-violet-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                className="flex-1 bg-violet-500 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-xl transition-colors"
              >
                {modal === 'crear' ? 'Agregar' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modal === 'eliminar' && seleccionada && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-red-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">¿Eliminar cuenta?</h2>
            <p className="text-slate-500 text-sm mb-8">
              ¿Seguro que desea eliminar la cuenta de <span className="font-semibold text-slate-700">{seleccionada.nombre}</span>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cerrarModal}
                className="flex-1 border-2 border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalImport && (
        <CuentasBancariasImportModal
          onClose={() => setModalImport(false)}
          onImportado={() => { cargarCuentas(); setModalImport(false); }}
        />
      )}
    </div>
  );
};

export default CuentasBancariasView;
