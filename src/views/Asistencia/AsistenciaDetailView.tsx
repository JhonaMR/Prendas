import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import { User, UserRole } from '../../types';
import { asistenciaService, AsistenciaEmpleado, AsistenciaRegistro, WeeklyScheduleItem } from '../../services/asistenciaService';
import { HorarioModal } from './HorarioModal';

interface AsistenciaDetailViewProps {
  empleadoId: number;
  onVolver: () => void;
  user: User;
}

const NOMBRE_DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const AsistenciaDetailView: React.FC<AsistenciaDetailViewProps> = ({ empleadoId, onVolver, user }) => {
  const { isDark } = useDarkMode();
  const [empleado, setEmpleado] = useState<AsistenciaEmpleado | null>(null);
  const [registros, setRegistros] = useState<AsistenciaRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHorarioOpen, setIsHorarioOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Estados locales temporales por fila para edición in-line
  const [editStates, setEditStates] = useState<{ [regId: number]: Partial<AsistenciaRegistro> & { suma_resta_display?: string } }>({});

  const filteredRegistros = registros.filter(reg => {
    if (startDate && reg.fecha < startDate) return false;
    if (endDate && reg.fecha > endDate) return false;
    return true;
  });

  const fetchData = async () => {
    setLoading(true);
    const data = await asistenciaService.getRegistros(empleadoId);
    if (data) {
      setEmpleado(data.empleado);
      setRegistros(data.registros);

      // Inicializar estados de edición
      const initialEdits: { [regId: number]: Partial<AsistenciaRegistro> & { suma_resta_display?: string } } = {};
      data.registros.forEach(reg => {
        initialEdits[reg.id] = {
          turno: reg.turno,
          hora_entrada: reg.hora_entrada,
          hora_salida: reg.hora_salida,
          horas_comida: reg.horas_comida,
          horas_trabajadas: reg.horas_trabajadas,
          horas_esperadas: reg.horas_esperadas,
          balance: reg.balance,
          programado_entrada: reg.programado_entrada,
          programado_salida: reg.programado_salida,
          suma_resta: reg.suma_resta
        };
      });
      setEditStates(initialEdits);
    } else {
      alert('No se pudieron obtener los detalles del empleado.');
      onVolver();
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [empleadoId]);

  const handleGuardarHorario = async (schedule: WeeklyScheduleItem[]) => {
    if (!empleado) return false;

    setLoading(true);
    const res = await asistenciaService.createOrUpdateEmpleado({
      id: empleado.id,
      nombre: empleado.nombre,
      horario_habitual: schedule
    });
    setLoading(false);

    if (res.success) {
      alert('Horario guardado correctamente.');
      fetchData();
      return true;
    } else {
      alert(res.message || 'Error al guardar el horario.');
      return false;
    }
  };

  const handleCellChange = (regId: number, field: keyof AsistenciaRegistro, value: any) => {
    setEditStates(prev => {
      const current = { ...prev[regId], [field]: value };

      // Si cambia entrada real, salida real, comida, entrada programada, salida programada o esperadas
      if (
        field === 'hora_entrada' ||
        field === 'hora_salida' ||
        field === 'horas_comida' ||
        field === 'programado_entrada' ||
        field === 'programado_salida' ||
        field === 'horas_esperadas'
      ) {
        let entrada = current.hora_entrada;
        const salida = current.hora_salida;
        const comida = parseFloat(String(current.horas_comida || 0));
        const esperadas = parseFloat(String(current.horas_esperadas || 0));
        const progEntrada = current.programado_entrada;

        // Regla: No contar tiempo antes de la hora de la jornada
        if (entrada && progEntrada && entrada.trim() !== '' && progEntrada.trim() !== '') {
          if (entrada < progEntrada) {
            entrada = progEntrada;
          }
        }

        if (entrada && salida && entrada.trim() !== '' && salida.trim() !== '') {
          // Extraer HH:MM
          const [eH, eM] = entrada.split(':').map(Number);
          const [sH, sM] = salida.split(':').map(Number);

          let diffMs = (sH * 3600 + sM * 60) - (eH * 3600 + eM * 60);
          if (diffMs < 0) diffMs += 24 * 3600; // Por si cruza medianoche

          let netHours = diffMs / 3600;
          netHours = Math.max(0, netHours - comida);

          current.horas_trabajadas = parseFloat(netHours.toFixed(2));
          current.balance = parseFloat((current.horas_trabajadas - esperadas).toFixed(2));
        } else {
          current.horas_trabajadas = null;
          current.balance = parseFloat((0 - esperadas).toFixed(2));
        }

        // Autocalcular Suma/Resta por defecto
        const balanceVal = current.balance || 0;
        current.suma_resta = balanceVal < 0 || balanceVal > 0.50 ? balanceVal : 0.00;
        delete current.suma_resta_display;
      }

      // Si editan las horas trabajadas manualmente
      if (field === 'horas_trabajadas') {
        const trabajadas = value === '' || value === null ? null : parseFloat(value);
        const esperadas = parseFloat(String(current.horas_esperadas || 0));
        current.horas_trabajadas = trabajadas;
        current.balance = trabajadas !== null
          ? parseFloat((trabajadas - esperadas).toFixed(2))
          : parseFloat((0 - esperadas).toFixed(2));

        // Autocalcular Suma/Resta por defecto
        const balanceVal = current.balance || 0;
        current.suma_resta = balanceVal < 0 || balanceVal > 0.50 ? balanceVal : 0.00;
        delete current.suma_resta_display;
      }

      return {
        ...prev,
        [regId]: current
      };
    });
  };

  const handleCellBlur = async (regId: number, originalReg: AsistenciaRegistro) => {
    const edited = editStates[regId];
    if (!edited) return;

    // Verificar si realmente cambió algo
    const hasChanges =
      edited.turno !== originalReg.turno ||
      edited.hora_entrada !== originalReg.hora_entrada ||
      edited.hora_salida !== originalReg.hora_salida ||
      parseFloat(String(edited.horas_comida || 0)) !== parseFloat(String(originalReg.horas_comida || 0)) ||
      (edited.horas_trabajadas !== originalReg.horas_trabajadas) ||
      parseFloat(String(edited.horas_esperadas || 0)) !== parseFloat(String(originalReg.horas_esperadas || 0)) ||
      edited.programado_entrada !== originalReg.programado_entrada ||
      edited.programado_salida !== originalReg.programado_salida ||
      parseFloat(String(edited.balance || 0)) !== parseFloat(String(originalReg.balance || 0)) ||
      parseFloat(String(edited.suma_resta || 0)) !== parseFloat(String(originalReg.suma_resta || 0));

    if (!hasChanges) return;

    try {
      const res = await asistenciaService.updateRegistro(regId, edited);
      if (res.success && res.data) {
        // Actualizar registro original en el listado local
        setRegistros(prev => prev.map(r => r.id === regId ? { ...r, ...res.data } : r));

        // Recalcular balance total del empleado localmente usando suma_resta
        setEmpleado(prev => {
          if (!prev) return null;
          const updatedRegistros = registros.map(r => r.id === regId ? { ...r, ...res.data } : r);
          const nuevoBalance = updatedRegistros.reduce((acc, curr) => acc + parseFloat(String(curr.suma_resta || 0)), 0);
          return {
            ...prev,
            balance_total: nuevoBalance
          };
        });
      } else {
        alert(res.message || 'Error al guardar cambios.');
        // Revertir cambios locales en caso de error
        fetchData();
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión al guardar cambios.');
      fetchData();
    }
  };

  const handleTurnoChange = async (regId: number, newTurno: string) => {
    const current = { ...(editStates[regId] || {}) };
    current.turno = newTurno;

    // Si es Festivo o N/A, ajustar horas_esperadas a 0.0 y programado a null
    if (newTurno === 'Festivo' || newTurno === 'N/A') {
      current.horas_esperadas = 0.0;
      current.programado_entrada = null;
      current.programado_salida = null;
    } else if (newTurno === 'Habitual' && empleado?.horario_habitual) {
      // Si vuelve a Habitual, restaurar horario programado por defecto
      const reg = registros.find(r => r.id === regId);
      if (reg) {
        const [y, m, d] = reg.fecha.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        const diaSemana = date.getDay();
        const dayConfig = empleado.horario_habitual.find(s => s.dia === diaSemana) || { dia: diaSemana, entrada: null, salida: null, horas_requeridas: 0 };
        current.horas_esperadas = dayConfig.horas_requeridas;
        current.programado_entrada = dayConfig.entrada;
        current.programado_salida = dayConfig.salida;
      }
    }

    // Recalcular horas trabajadas y balance
    let entrada = current.hora_entrada;
    const salida = current.hora_salida;
    const comida = parseFloat(String(current.horas_comida || 0));
    const esperadas = parseFloat(String(current.horas_esperadas || 0));
    const progEntrada = current.programado_entrada;

    if (entrada && progEntrada && entrada.trim() !== '' && progEntrada.trim() !== '') {
      if (entrada < progEntrada) {
        entrada = progEntrada;
      }
    }

    if (entrada && salida && entrada.trim() !== '' && salida.trim() !== '') {
      const [eH, eM] = entrada.split(':').map(Number);
      const [sH, sM] = salida.split(':').map(Number);
      let diffMs = (sH * 3600 + sM * 60) - (eH * 3600 + eM * 60);
      if (diffMs < 0) diffMs += 24 * 3600;
      let netHours = diffMs / 3600;
      netHours = Math.max(0, netHours - comida);
      current.horas_trabajadas = parseFloat(netHours.toFixed(2));
      current.balance = parseFloat((current.horas_trabajadas - esperadas).toFixed(2));
    } else {
      current.horas_trabajadas = null;
      current.balance = parseFloat((0 - esperadas).toFixed(2));
    }

    // Autocalcular Suma/Resta por defecto
    const balanceVal = current.balance || 0;
    current.suma_resta = balanceVal < 0 || balanceVal > 0.50 ? balanceVal : 0.00;
    delete current.suma_resta_display;

    setEditStates(prev => ({
      ...prev,
      [regId]: current
    }));

    try {
      const res = await asistenciaService.updateRegistro(regId, current);
      if (res.success && res.data) {
        setRegistros(prev => prev.map(r => r.id === regId ? { ...r, ...res.data } : r));

        setEmpleado(prev => {
          if (!prev) return null;
          const updatedRegistros = registros.map(r => r.id === regId ? { ...r, ...res.data } : r);
          const nuevoBalance = updatedRegistros.reduce((acc, curr) => acc + parseFloat(String(curr.suma_resta || 0)), 0);
          return {
            ...prev,
            balance_total: nuevoBalance
          };
        });
      } else {
        alert(res.message || 'Error al guardar cambios.');
        fetchData();
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión al guardar cambios.');
      fetchData();
    }
  };

  const parseHoursAndMinutes = (str: string): number => {
    const clean = str.trim().toLowerCase();
    if (!clean) return 0;

    // Si es un simple número decimal (ej. -1.5 o 2)
    if (/^-?\d+(\.\d+)?$/.test(clean)) {
      return parseFloat(clean);
    }

    // Formato con dos puntos (ej. 1:30 o -1:30 o -0:45)
    const colonMatch = clean.match(/^([+-]?\d+):(\d{2})$/);
    if (colonMatch) {
      const hrs = parseInt(colonMatch[1], 10);
      const mins = parseInt(colonMatch[2], 10);
      const isNegative = colonMatch[1].startsWith('-');
      const val = Math.abs(hrs) + mins / 60;
      return isNegative ? -val : val;
    }

    // Formato de texto con h y m (ej. 1h 30m, -1h 30m, 30m, -45m)
    let isNegative = false;
    let remaining = clean;
    if (remaining.startsWith('-')) {
      isNegative = true;
      remaining = remaining.substring(1);
    } else if (remaining.startsWith('+')) {
      remaining = remaining.substring(1);
    }

    const hMatch = remaining.match(/(\d+(?:\.\d+)?)\s*h/);
    const mMatch = remaining.match(/(\d+)\s*m/);

    let totalHours = 0;
    if (hMatch) {
      totalHours += parseFloat(hMatch[1]);
    }
    if (mMatch) {
      totalHours += parseInt(mMatch[1], 10) / 60;
    }

    if (!hMatch && !mMatch) {
      const fallbackVal = parseFloat(clean);
      return isNaN(fallbackVal) ? 0 : fallbackVal;
    }

    return isNegative ? -totalHours : totalHours;
  };

  const handleSumaRestaChange = (regId: number, textValue: string) => {
    setEditStates(prev => {
      const current = { ...prev[regId] };
      current.suma_resta_display = textValue;

      const parsedValue = parseHoursAndMinutes(textValue);
      current.suma_resta = parsedValue;

      return {
        ...prev,
        [regId]: current
      };
    });
  };

  const handleSumaRestaBlur = async (regId: number, originalReg: AsistenciaRegistro) => {
    const edited = editStates[regId];
    if (!edited) return;

    setEditStates(prev => {
      const current = { ...prev[regId] };
      delete current.suma_resta_display;
      return {
        ...prev,
        [regId]: current
      };
    });

    const hasChanges = parseFloat(String(edited.suma_resta || 0)) !== parseFloat(String(originalReg.suma_resta || 0));
    if (!hasChanges) return;

    try {
      const res = await asistenciaService.updateRegistro(regId, {
        ...edited,
        suma_resta: edited.suma_resta
      });
      if (res.success && res.data) {
        setRegistros(prev => prev.map(r => r.id === regId ? { ...r, ...res.data } : r));

        setEmpleado(prev => {
          if (!prev) return null;
          const updatedRegistros = registros.map(r => r.id === regId ? { ...r, ...res.data } : r);
          const nuevoBalance = updatedRegistros.reduce((acc, curr) => acc + parseFloat(String(curr.suma_resta || 0)), 0);
          return {
            ...prev,
            balance_total: nuevoBalance
          };
        });
      } else {
        alert(res.message || 'Error al guardar cambios.');
        fetchData();
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión al guardar cambios.');
      fetchData();
    }
  };

  const formatBalance = (val: number) => {
    const value = parseFloat(String(val));
    if (isNaN(value)) {
      return {
        text: '0h',
        isPositive: true
      };
    }
    const sign = value >= 0 ? '+' : '';
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

  const getDiaSemana = (fechaStr: string) => {
    // Evitar problemas de huso horario convirtiendo con offset correcto
    const [y, m, d] = fechaStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return NOMBRE_DIAS[date.getDay()];
  };

  const formatTimeInput = (timeStr: string | null) => {
    if (!timeStr) return '';
    return timeStr.slice(0, 5);
  };

  if (loading || !empleado) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const balanceTotal = formatBalance(empleado.balance_total);
  const canEdit = user.role === UserRole.ADMIN || user.role === UserRole.SOPORTE || user.role === UserRole.OPERADOR;

  return (
    <div className="space-y-6 pb-20">

      {/* Botón de retroceso */}
      <button
        onClick={onVolver}
        className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${isDark
          ? 'bg-violet-900/40 border-violet-750 text-violet-300 hover:text-violet-100 hover:bg-violet-850'
          : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Volver al listado
      </button>

      {/* Cabecera de Ficha de Empleado */}
      <div className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors ${isDark ? 'bg-[#4a3a63] border-violet-750' : 'bg-white border-slate-200 shadow-sm'
        }`}>
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tighter text-black dark:text-black-100">
            {empleado.nombre}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-black dark:text-blacks-100">
            {registros.length > 0 ? (
              <>
                <span>Registros del <b>{registros[registros.length - 1].fecha}</b> al <b>{registros[0].fecha}</b></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-black-100"></span>
                <span>{registros.length} días de historial</span>
              </>
            ) : (
              <span>Sin registros cargados</span>
            )}
          </div>
        </div>

        {/* Balance y Horario */}
        <div className="flex flex-wrap items-center gap-4">
          <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center min-w-[130px] ${balanceTotal.isPositive
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
            : 'bg-red-500/10 border-red-500/20 text-red-500'
            }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">Balance Total</span>
            <span className="text-xl font-black mt-1">{balanceTotal.text}</span>
          </div>

          {canEdit && (
            <button
              onClick={() => setIsHorarioOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-pink-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-pink-500/20 active:scale-95 transition-all flex items-center gap-2 h-14"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cargar Horario
            </button>
          )}
        </div>
      </div>

      {/* Filtro por Fechas */}
      <div className={`p-4 rounded-3xl border flex flex-wrap items-center gap-4 transition-colors ${isDark ? 'bg-[#4a3a63] border-violet-750' : 'bg-white border-slate-200'
        }`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-black dark:text-black-100">Filtrar por Fecha:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-black dark:text-black-300">Desde:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`text-xs font-bold px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all ${isDark ? 'bg-violet-950/20 border-violet-750 text-violet-100' : 'bg-slate-50 border-slate-200 text-black'
                }`}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-black dark:text-violet-300">Hasta:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`text-xs font-bold px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all ${isDark ? 'bg-violet-950/20 border-violet-750 text-violet-100' : 'bg-slate-50 border-slate-200 text-black'
                }`}
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${isDark
                ? 'border-violet-700 text-violet-300 hover:bg-violet-850'
                : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Historial Diario */}
      {registros.length === 0 ? (
        <div className={`text-center py-20 border-2 border-dashed rounded-3xl ${isDark ? 'border-violet-750' : 'border-slate-200'
          }`}>
          <p className="font-semibold text-slate-650 dark:text-black-100">No hay datos históricos para este empleado</p>
          <p className="text-xs text-slate-400 dark:text-black-100 mt-1">Sube un archivo de asistencia en la vista principal para cargar datos.</p>
        </div>
      ) : (
        <div className={`rounded-3xl border overflow-hidden ${isDark ? 'border-violet-750 bg-[#3d2d52]' : 'border-slate-200 bg-white'
          }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-[10px] font-extrabold uppercase tracking-wider border-b ${isDark ? 'border-violet-750 text-black-100' : 'border-slate-300 text-slate-900 bg-slate-50/20'
                  }`}>
                  <th className="px-4 py-4">Fecha</th>
                  <th className="px-4 py-4">Día</th>
                  <th className="px-4 py-4">Turno</th>
                  <th className="px-4 py-4 text-center">Entrada Prog.</th>
                  <th className="px-4 py-4 text-center">Salida Prog.</th>
                  <th className="px-4 py-4 text-center">Entrada Real</th>
                  <th className="px-4 py-4 text-center">Salida Real</th>
                  <th className="px-4 py-4 text-center">Comida</th>
                  <th className="px-4 py-4 text-center">Resultado</th>
                  <th className="px-4 py-4 text-center">Esperadas</th>
                  <th className="px-4 py-4 text-center">Balance</th>
                  <th className="px-4 py-4 text-center">Suma/Resta</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-violet-850' : 'divide-slate-100'
                }`}>
                {filteredRegistros.map((reg) => {
                  const editData = editStates[reg.id] || reg;
                  const balance = formatBalance(editData.balance || 0);

                  const isEntradaVacia = !editData.hora_entrada;
                  const isSalidaVacia = !editData.hora_salida;

                  // Clases de celdas vacías pintadas
                  const cellWarnClass = isDark
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-red-50/50 border-red-100 text-red-700';

                  return (
                    <tr
                      key={reg.id}
                      className={`transition-colors ${isDark ? 'hover:bg-violet-900/10' : 'hover:bg-slate-50/40'
                        }`}
                    >
                      {/* Fecha */}
                      <td className="px-6 py-4 font-black text-xs whitespace-nowrap text-black dark:text-black-100">
                        {reg.fecha}
                      </td>

                      {/* Día */}
                      <td className="px-6 py-4 text-xs font-bold text-black dark:text-black-100">
                        {getDiaSemana(reg.fecha)}
                      </td>

                      {/* Turno (Editable Selector) */}
                      <td className="px-4 py-2">
                        <select
                          disabled={!canEdit}
                          value={editData.turno || 'Habitual'}
                          onChange={(e) => handleTurnoChange(reg.id, e.target.value)}
                          className={`w-full max-w-[120px] text-xs font-bold px-2 py-1.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-violet-750 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 bg-transparent transition-all ${isDark ? 'text-violet-100 bg-[#3d2d52]' : 'text-slate-800 bg-white'
                            }`}
                        >
                          <option value="Habitual">Habitual</option>
                          <option value="Festivo">Festivo</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </td>

                      {/* Entrada Programada (Editable) */}
                      <td className="px-4 py-2 text-center">
                        <input
                          type="time"
                          disabled={!canEdit}
                          value={formatTimeInput(editData.programado_entrada)}
                          onChange={(e) => handleCellChange(reg.id, 'programado_entrada', e.target.value)}
                          onBlur={() => handleCellBlur(reg.id, reg)}
                          className={`mx-auto text-center text-xs font-bold px-2 py-1.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all ${isDark ? 'border-transparent text-violet-300 bg-transparent hover:border-violet-750' : 'border-transparent text-slate-700 bg-transparent hover:border-slate-300'
                            }`}
                        />
                      </td>

                      {/* Salida Programada (Editable) */}
                      <td className="px-4 py-2 text-center">
                        <input
                          type="time"
                          disabled={!canEdit}
                          value={formatTimeInput(editData.programado_salida)}
                          onChange={(e) => handleCellChange(reg.id, 'programado_salida', e.target.value)}
                          onBlur={() => handleCellBlur(reg.id, reg)}
                          className={`mx-auto text-center text-xs font-bold px-2 py-1.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all ${isDark ? 'border-transparent text-violet-300 bg-transparent hover:border-violet-750' : 'border-transparent text-slate-700 bg-transparent hover:border-slate-300'
                            }`}
                        />
                      </td>

                      {/* Hora Entrada Real (Editable) */}
                      <td className="px-4 py-2 text-center">
                        <input
                          type="time"
                          disabled={!canEdit}
                          value={formatTimeInput(editData.hora_entrada)}
                          onChange={(e) => handleCellChange(reg.id, 'hora_entrada', e.target.value)}
                          onBlur={() => handleCellBlur(reg.id, reg)}
                          className={`mx-auto text-center text-xs font-bold px-2 py-1.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all ${isEntradaVacia
                            ? cellWarnClass
                            : isDark ? 'border-transparent text-violet-100 bg-transparent hover:border-violet-750' : 'border-transparent text-slate-800 bg-transparent hover:border-slate-250'
                            }`}
                        />
                      </td>

                      {/* Hora Salida Real (Editable) */}
                      <td className="px-4 py-2 text-center">
                        <input
                          type="time"
                          disabled={!canEdit}
                          value={formatTimeInput(editData.hora_salida)}
                          onChange={(e) => handleCellChange(reg.id, 'hora_salida', e.target.value)}
                          onBlur={() => handleCellBlur(reg.id, reg)}
                          className={`mx-auto text-center text-xs font-bold px-2 py-1.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all ${isSalidaVacia
                            ? cellWarnClass
                            : isDark ? 'border-transparent text-violet-100 bg-transparent hover:border-violet-750' : 'border-transparent text-slate-800 bg-transparent hover:border-slate-250'
                            }`}
                        />
                      </td>

                      {/* Comida Descontada (Editable) */}
                      <td className="px-4 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            disabled={!canEdit}
                            value={editData.horas_comida ?? 0}
                            onChange={(e) => handleCellChange(reg.id, 'horas_comida', e.target.value)}
                            onBlur={() => handleCellBlur(reg.id, reg)}
                            onFocus={(e) => e.target.select()}
                            className={`w-14 text-center text-xs font-bold py-1.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-violet-750 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 bg-transparent transition-all ${isDark ? 'text-violet-100' : 'text-slate-700'
                              }`}
                          />
                          <span className="text-[10px] text-slate-400">h</span>
                        </div>
                      </td>

                      {/* Resultado Trabajadas (Editable) */}
                      <td className="px-4 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            disabled={!canEdit}
                            value={editData.horas_trabajadas === null ? '' : editData.horas_trabajadas}
                            onChange={(e) => handleCellChange(reg.id, 'horas_trabajadas', e.target.value)}
                            onBlur={() => handleCellBlur(reg.id, reg)}
                            onFocus={(e) => e.target.select()}
                            className={`w-16 text-center text-xs font-extrabold py-1.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-violet-750 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 bg-transparent transition-all ${isDark ? 'text-violet-100' : 'text-slate-800'
                              }`}
                          />
                          {editData.horas_trabajadas !== null && <span className="text-[10px] text-slate-400">h</span>}
                        </div>
                      </td>

                      {/* Esperadas (Editable) */}
                      <td className="px-4 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            disabled={!canEdit}
                            value={editData.horas_esperadas ?? 0}
                            onChange={(e) => handleCellChange(reg.id, 'horas_esperadas', e.target.value)}
                            onBlur={() => handleCellBlur(reg.id, reg)}
                            onFocus={(e) => e.target.select()}
                            className={`w-14 text-center text-xs font-bold py-1.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-violet-750 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 bg-transparent transition-all ${isDark ? 'text-violet-100' : 'text-slate-700'
                              }`}
                          />
                          <span className="text-[10px] text-slate-400">h</span>
                        </div>
                      </td>

                      {/* Balance (Recalculado) */}
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-black inline-block min-w-[60px] ${balance.isPositive
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-red-500/10 text-red-500'
                          }`}>
                          {balance.text}
                        </span>
                      </td>

                      {/* Suma/Resta (Editable) */}
                      <td className="px-4 py-2 text-center">
                        <input
                          type="text"
                          disabled={!canEdit}
                          value={
                            editStates[reg.id]?.suma_resta_display !== undefined
                              ? editStates[reg.id].suma_resta_display
                              : formatBalance(editData.suma_resta || 0).text
                          }
                          onChange={(e) => handleSumaRestaChange(reg.id, e.target.value)}
                          onBlur={() => handleSumaRestaBlur(reg.id, reg)}
                          className={`w-24 text-center text-xs font-black py-1.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-violet-750 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 bg-transparent transition-all ${isDark ? 'text-violet-100' : 'text-black bg-white/20'
                            }`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Horario */}
      {isHorarioOpen && empleado && (
        <HorarioModal
          isOpen={isHorarioOpen}
          onClose={() => setIsHorarioOpen(false)}
          empleado={empleado}
          onSave={handleGuardarHorario}
        />
      )}
    </div>
  );
};

export default AsistenciaDetailView;
