import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import { User, UserRole } from '../../types';
import { asistenciaService, AsistenciaEmpleado, WeeklyScheduleItem } from '../../services/asistenciaService';
import { ImportAsistenciaModal } from './ImportAsistenciaModal';
import { HorarioModal } from './HorarioModal';

interface AsistenciaListViewProps {
  user: User;
  onNavigate: (tab: string, options?: any) => void;
}

const AsistenciaListView: React.FC<AsistenciaListViewProps> = ({ user, onNavigate }) => {
  const { isDark } = useDarkMode();
  const [empleados, setEmpleados] = useState<AsistenciaEmpleado[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modales
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedEmpleadoForSchedule, setSelectedEmpleadoForSchedule] = useState<AsistenciaEmpleado | null>(null);

  const fetchEmpleados = async () => {
    setLoading(true);
    const data = await asistenciaService.getEmpleados();
    setEmpleados(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const handleCrearEmpleadoManual = async () => {
    const nombre = prompt('Ingresa el nombre completo del nuevo empleado:');
    if (!nombre || !nombre.trim()) return;

    setLoading(true);
    const res = await asistenciaService.createOrUpdateEmpleado({ nombre: nombre.trim() });
    setLoading(false);

    if (res.success && res.data) {
      alert(`Empleado '${nombre}' creado con éxito.`);
      fetchEmpleados();
      // Abrir horario de una vez para configurarlo
      setSelectedEmpleadoForSchedule(res.data);
    } else {
      alert(res.message || 'Error al crear empleado.');
    }
  };

  const handleGuardarHorario = async (schedule: WeeklyScheduleItem[]) => {
    if (!selectedEmpleadoForSchedule) return false;

    setLoading(true);
    const res = await asistenciaService.createOrUpdateEmpleado({
      id: selectedEmpleadoForSchedule.id,
      nombre: selectedEmpleadoForSchedule.nombre,
      horario_habitual: schedule
    });
    setLoading(false);

    if (res.success) {
      alert('Horario configurado correctamente.');
      fetchEmpleados();
      return true;
    } else {
      alert(res.message || 'Error al guardar el horario.');
      return false;
    }
  };

  const handleEliminarEmpleado = async (emp: AsistenciaEmpleado) => {
    const confirmDelete = window.confirm(
      `⚠️ ¿Estás seguro de que deseas eliminar a ${emp.nombre}?\n\nEsta acción borrará permanentemente al empleado y TODOS sus registros de asistencia cargados históricamente.`
    );
    if (!confirmDelete) return;

    setLoading(true);
    const res = await asistenciaService.deleteEmpleado(emp.id);
    setLoading(false);

    if (res.success) {
      alert('Empleado eliminado correctamente.');
      fetchEmpleados();
    } else {
      alert(res.message || 'Error al eliminar empleado.');
    }
  };

  // Filtrar
  const filteredEmpleados = empleados.filter(emp =>
    emp.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatBalance = (val: number) => {
    const value = parseFloat(String(val));
    const sign = value >= 0 ? '+' : '';
    // Formato de horas y minutos para mayor claridad (ej: +12.5 hrs => +12 hrs 30 mins)
    const absolute = Math.abs(value);
    const hours = Math.floor(absolute);
    const minutes = Math.round((absolute - hours) * 60);

    let displayStr = `${sign}${hours}h`;
    if (minutes > 0) {
      displayStr += ` ${minutes}m`;
    }

    return {
      text: displayStr,
      isPositive: value >= 0
    };
  };

  const canEdit = user.role === UserRole.ADMIN || user.role === UserRole.SOPORTE || user.role === UserRole.OPERADOR;

  return (
    <div className="space-y-6 pb-20">

      {/* Cabecera y Buscador */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-black dark:text-black-100 tracking-tighter">Control de Asistencia</h2>
          <p className="text-slate-400 dark:text-violet-400 font-medium">Gestión de tiempos, horarios y balances de personal.</p>
        </div>

        {/* Acciones principales */}
        {canEdit && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleCrearEmpleadoManual}
              className={`px-5 py-2.5 rounded-2xl font-bold text-sm border shadow-sm transition-all flex items-center gap-2 ${isDark
                ? 'bg-violet-900/40 border-violet-750 text-violet-200 hover:bg-violet-850'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Crear Empleado
            </button>
            <button
              onClick={() => setIsImportOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-pink-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-pink-500/20 transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Importar Reporte (.xlsx)
            </button>
          </div>
        )}
      </div>

      {/* Barra de Filtros */}
      <div className={`p-4 rounded-3xl border flex items-center gap-3 transition-colors ${isDark ? 'bg-[#4a3a63] border-violet-750' : 'bg-white border-slate-200'
        }`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar empleado por nombre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none w-full text-sm font-medium focus:ring-0 placeholder-slate-400"
        />
      </div>

      {/* Grid de Contenido */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredEmpleados.length === 0 ? (
        <div className={`text-center py-20 border-2 border-dashed rounded-3xl ${isDark ? 'border-violet-750' : 'border-slate-200'
          }`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-slate-400 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <p className="font-semibold text-slate-650 dark:text-black-100">No se encontraron empleados registrados</p>
          <p className="text-xs text-slate-400 dark:text-black-100 mt-1">Carga un archivo Excel o crea un empleado manualmente.</p>
        </div>
      ) : (
        <div className={`rounded-3xl border overflow-hidden ${isDark ? 'border-violet-750 bg-[#3d2d52]' : 'border-slate-200 bg-white'
          }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-[10px] font-extrabold uppercase tracking-wider border-b ${isDark ? 'border-violet-750 text-black-100' : 'border-slate-300 text-slate-900 bg-slate-50/20'
                  }`}>
                  <th className="px-6 py-4">Empleado</th>
                  <th className="px-6 py-4">Rango de Fechas</th>
                  <th className="px-6 py-4 text-center">Horario Habitual</th>
                  <th className="px-6 py-4 text-center">Balance Total</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-violet-850' : 'divide-slate-150'
                }`}>
                {filteredEmpleados.map((emp) => {
                  const balance = formatBalance(emp.balance_total);
                  const tieneDatos = emp.fecha_inicio && emp.fecha_fin;

                  return (
                    <tr
                      key={emp.id}
                      className={`transition-colors ${isDark ? 'hover:bg-violet-900/10' : 'hover:bg-slate-50/40'
                        }`}
                    >
                      {/* Nombre */}
                      <td className="px-6 py-4 font-black text-black dark:text-black-100 text-sm">
                        {emp.nombre}
                      </td>

                      {/* Rango de Fechas */}
                      <td className="px-6 py-4 text-xs font-bold text-black dark:text-black-100">
                        {tieneDatos ? (
                          <span>{emp.fecha_inicio} a {emp.fecha_fin}</span>
                        ) : (
                          <span className="text-slate-700 font-bold italic">Sin datos cargados</span>
                        )}
                      </td>

                      {/* Configuración Horario */}
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${emp.horario_habitual && emp.horario_habitual.length > 0
                          ? isDark ? 'bg-violet-900/30 text-violet-300' : 'bg-blue-50 text-blue-600'
                          : isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500'
                          }`}>
                          {emp.horario_habitual && emp.horario_habitual.length > 0 ? 'Configurado' : 'Sin Configuración'}
                        </span>
                      </td>

                      {/* Balance Total */}
                      <td className="px-6 py-4 text-center">
                        {tieneDatos ? (
                          <span className={`px-3 py-1.5 rounded-2xl text-xs font-black inline-block min-w-[70px] ${balance.isPositive
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-red-500/10 text-red-500'
                            }`}>
                            {balance.text}
                          </span>
                        ) : (
                          <span className="text-slate-350 dark:text-violet-500">-</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onNavigate('asistenciaDetalle', { empleadoId: emp.id })}
                            className={`p-2 rounded-xl transition-all ${isDark
                              ? 'bg-violet-800/40 text-violet-300 hover:bg-violet-750 hover:text-violet-100'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-800'
                              }`}
                            title="Ver Asistencia"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>

                          {canEdit && (
                            <>
                              <button
                                onClick={() => setSelectedEmpleadoForSchedule(emp)}
                                className={`p-2 rounded-xl transition-all ${isDark
                                  ? 'bg-violet-850 text-violet-350 hover:bg-violet-700 hover:text-violet-100'
                                  : 'bg-slate-50 text-slate-600 hover:bg-slate-200 hover:text-slate-700'
                                  }`}
                                title="Configurar Horario"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleEliminarEmpleado(emp)}
                                className={`p-2 rounded-xl transition-all ${isDark
                                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/30'
                                  : 'bg-red-50 text-red-500 hover:bg-red-100'
                                  }`}
                                title="Eliminar Empleado"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modales */}
      {isImportOpen && (
        <ImportAsistenciaModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onSuccess={fetchEmpleados}
        />
      )}

      {selectedEmpleadoForSchedule && (
        <HorarioModal
          isOpen={!!selectedEmpleadoForSchedule}
          onClose={() => setSelectedEmpleadoForSchedule(null)}
          empleado={selectedEmpleadoForSchedule}
          onSave={handleGuardarHorario}
        />
      )}
    </div>
  );
};

export default AsistenciaListView;
