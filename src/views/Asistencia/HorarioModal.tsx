import React, { useState } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import { WeeklyScheduleItem, AsistenciaEmpleado } from '../../services/asistenciaService';

interface HorarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  empleado: AsistenciaEmpleado;
  onSave: (schedule: WeeklyScheduleItem[]) => Promise<boolean>;
}

const DIAS_SEMANA = [
  { index: 1, nombre: 'Lunes' },
  { index: 2, nombre: 'Martes' },
  { index: 3, nombre: 'Miércoles' },
  { index: 4, nombre: 'Jueves' },
  { index: 5, nombre: 'Viernes' },
  { index: 6, nombre: 'Sábado' },
  { index: 0, nombre: 'Domingo' }
];

export const HorarioModal: React.FC<HorarioModalProps> = ({ isOpen, onClose, empleado, onSave }) => {
  const { isDark } = useDarkMode();
  const [schedule, setSchedule] = useState<WeeklyScheduleItem[]>(() => {
    // Si el empleado tiene un horario configurado, usarlo; si no, inicializar vacío
    const initialSchedule = [...(empleado.horario_habitual || [])];
    // Asegurar que contenga los 7 días
    DIAS_SEMANA.forEach(d => {
      if (!initialSchedule.some(item => item.dia === d.index)) {
        initialSchedule.push({
          dia: d.index,
          entrada: d.index === 0 ? null : '08:00:00',
          salida: d.index === 0 ? null : d.index === 6 ? '12:00:00' : '18:00:00',
          horas_requeridas: d.index === 0 ? 0 : d.index === 6 ? 3.67 : 9.0
        });
      }
    });
    // Ordenar de Lunes (1) a Domingo (0)
    return initialSchedule.sort((a, b) => {
      const orderA = a.dia === 0 ? 7 : a.dia;
      const orderB = b.dia === 0 ? 7 : b.dia;
      return orderA - orderB;
    });
  });
  
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleTimeChange = (diaIndex: number, field: 'entrada' | 'salida', value: string) => {
    setSchedule(prev => prev.map(item => {
      if (item.dia === diaIndex) {
        const timeVal = value ? `${value}:00` : null;
        const updated = { ...item, [field]: timeVal };
        
        // Calcular horas automáticas si hay entrada y salida
        if (updated.entrada && updated.salida) {
          const [h1, m1] = updated.entrada.split(':').map(Number);
          const [h2, m2] = updated.salida.split(':').map(Number);
          
          let diffMs = (h2 * 3600 + m2 * 60) - (h1 * 3600 + m1 * 60);
          if (diffMs < 0) diffMs += 24 * 3600; // Caso cruza medianoche
          
          let hours = diffMs / 3600;
          
          // Descontar comida por defecto
          if (diaIndex === 6) { // Sábado
            hours = Math.max(0, hours - 0.33); // 20 mins comida
          } else if (diaIndex !== 0) { // Entre semana
            hours = Math.max(0, hours - 1.0); // 1 hora comida
          }
          
          updated.horas_requeridas = parseFloat(hours.toFixed(2));
        } else {
          updated.horas_requeridas = 0;
        }

        return updated;
      }
      return item;
    }));
  };

  const handleRequiredHoursChange = (diaIndex: number, val: string) => {
    setSchedule(prev => prev.map(item => {
      if (item.dia === diaIndex) {
        return { ...item, horas_requeridas: parseFloat(val) || 0 };
      }
      return item;
    }));
  };

  const handleToggleDia = (diaIndex: number, activo: boolean) => {
    setSchedule(prev => prev.map(item => {
      if (item.dia === diaIndex) {
        if (activo) {
          return {
            ...item,
            entrada: '08:00:00',
            salida: diaIndex === 6 ? '12:00:00' : '18:00:00',
            horas_requeridas: diaIndex === 6 ? 3.67 : 9.0
          };
        } else {
          return {
            ...item,
            entrada: null,
            salida: null,
            horas_requeridas: 0
          };
        }
      }
      return item;
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const success = await onSave(schedule);
    setIsSaving(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className={`w-full max-w-2xl rounded-3xl p-6 shadow-2xl transition-all duration-300 border ${
        isDark ? 'bg-[#3d2d52] border-violet-700 text-violet-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        {/* Cabecera */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black">Horario Habitual</h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>
              Establece las horas y turnos esperados para <b>{empleado.nombre}</b>.
            </p>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'hover:bg-violet-800/40 text-violet-400' : 'hover:bg-slate-100 text-slate-400'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabla / Grid de Horarios */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          <div className={`grid grid-cols-5 text-xs font-bold uppercase tracking-wider pb-2 border-b ${
            isDark ? 'border-violet-850 text-violet-400' : 'border-slate-100 text-slate-400'
          }`}>
            <div className="col-span-1">Día</div>
            <div className="col-span-1 text-center">Laborable</div>
            <div className="col-span-1 text-center">Entrada</div>
            <div className="col-span-1 text-center">Salida</div>
            <div className="col-span-1 text-center">Horas Requeridas</div>
          </div>

          {schedule.map((item) => {
            const diaInfo = DIAS_SEMANA.find(d => d.index === item.dia)!;
            const isLaborable = item.entrada !== null;
            
            // Format temporal a HH:MM para el input type="time"
            const formatTime = (timeStr: string | null) => {
              if (!timeStr) return '';
              return timeStr.slice(0, 5);
            };

            return (
              <div 
                key={item.dia} 
                className={`grid grid-cols-5 items-center py-2.5 rounded-xl transition-colors ${
                  isLaborable 
                    ? '' 
                    : isDark ? 'text-violet-500' : 'text-slate-400 bg-slate-50/20'
                }`}
              >
                {/* Nombre del Día */}
                <div className="col-span-1 font-bold text-sm">
                  {diaInfo.nombre}
                </div>

                {/* Laborable Toggle */}
                <div className="col-span-1 flex justify-center">
                  <input
                    type="checkbox"
                    checked={isLaborable}
                    onChange={(e) => handleToggleDia(item.dia, e.target.checked)}
                    className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 cursor-pointer"
                  />
                </div>

                {/* Hora Entrada */}
                <div className="col-span-1 px-1">
                  <input
                    type="time"
                    disabled={!isLaborable}
                    value={formatTime(item.entrada)}
                    onChange={(e) => handleTimeChange(item.dia, 'entrada', e.target.value)}
                    className={`w-full text-center py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all ${
                      isDark 
                        ? 'bg-violet-950/40 border-violet-750 disabled:bg-violet-950/10 disabled:border-transparent text-violet-100'
                        : 'bg-slate-50 border-slate-200 disabled:bg-slate-100/50 disabled:border-transparent text-slate-700'
                    }`}
                  />
                </div>

                {/* Hora Salida */}
                <div className="col-span-1 px-1">
                  <input
                    type="time"
                    disabled={!isLaborable}
                    value={formatTime(item.salida)}
                    onChange={(e) => handleTimeChange(item.dia, 'salida', e.target.value)}
                    className={`w-full text-center py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all ${
                      isDark 
                        ? 'bg-violet-950/40 border-violet-750 disabled:bg-violet-950/10 disabled:border-transparent text-violet-100'
                        : 'bg-slate-50 border-slate-200 disabled:bg-slate-100/50 disabled:border-transparent text-slate-700'
                    }`}
                  />
                </div>

                {/* Horas requeridas (manual) */}
                <div className="col-span-1 px-1 flex items-center justify-center gap-1">
                  <input
                    type="number"
                    step="0.01"
                    disabled={!isLaborable}
                    value={isLaborable ? item.horas_requeridas : ''}
                    onChange={(e) => handleRequiredHoursChange(item.dia, e.target.value)}
                    className={`w-16 text-center py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all ${
                      isDark 
                        ? 'bg-violet-950/40 border-violet-750 disabled:bg-violet-950/10 disabled:border-transparent text-violet-100'
                        : 'bg-slate-50 border-slate-200 disabled:bg-slate-100/50 disabled:border-transparent text-slate-700'
                    }`}
                  />
                  {isLaborable && <span className="text-[10px] text-slate-450">hrs</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Acciones */}
        <div className={`mt-6 pt-4 border-t flex justify-end gap-3 ${
          isDark ? 'border-violet-750' : 'border-slate-100'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all border ${
              isDark
                ? 'border-violet-700 text-violet-300 hover:bg-violet-850'
                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-pink-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-pink-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar Horario'}
          </button>
        </div>
      </div>
    </div>
  );
};
