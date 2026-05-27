import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useDarkMode } from '../../context/DarkModeContext';
import { asistenciaService, WeeklyScheduleItem } from '../../services/asistenciaService';

interface ImportAsistenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ExcelRow {
  nombre: string;
  fecha: string;
  entrada: string | null;
  salida: string | null;
}

interface ProcessedEmpleado {
  nombre: string;
  existe: boolean;
  ultima_fecha: string | null;
  horario_habitual: WeeklyScheduleItem[] | null;
  seleccionado: boolean;
  sobreescribir: boolean; // false = solo nuevos, true = sobreescribir anteriores
  totalFilasExcel: number;
}

const DEFAULT_SCHEDULE: WeeklyScheduleItem[] = [
  { dia: 1, entrada: "08:00:00", salida: "18:00:00", horas_requeridas: 9.0 },
  { dia: 2, entrada: "08:00:00", salida: "18:00:00", horas_requeridas: 9.0 },
  { dia: 3, entrada: "08:00:00", salida: "18:00:00", horas_requeridas: 9.0 },
  { dia: 4, entrada: "08:00:00", salida: "18:00:00", horas_requeridas: 9.0 },
  { dia: 5, entrada: "08:00:00", salida: "18:00:00", horas_requeridas: 9.0 },
  { dia: 6, entrada: "08:00:00", salida: "12:00:00", horas_requeridas: 3.67 },
  { dia: 0, entrada: null, salida: null, horas_requeridas: 0.0 }
];

export const ImportAsistenciaModal: React.FC<ImportAsistenciaModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { isDark } = useDarkMode();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [empleados, setEmpleados] = useState<ProcessedEmpleado[]>([]);
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [globalOption, setGlobalOption] = useState<'nuevos' | 'sobreescribir'>('nuevos');

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const data = evt.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Parsear a matriz 2D
          const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          const rawData: ExcelRow[] = [];
          const nombresEncontrados = new Set<string>();

          // Omitir cabecera (fila 0) y recorrer
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length < 3) continue;

            const nombre = row[2]; // Columna C (índice 2)
            const fechaVal = row[6]; // Columna G (índice 6)
            const entradaVal = row[9]; // Columna J (índice 9)
            const salidaVal = row[10]; // Columna K (índice 10)

            if (!nombre || !fechaVal) continue;

            // Formatear fecha robustamente
            let fechaStr = '';
            if (fechaVal instanceof Date) {
              const y = fechaVal.getFullYear();
              const m = String(fechaVal.getMonth() + 1).padStart(2, '0');
              const d = String(fechaVal.getDate()).padStart(2, '0');
              fechaStr = `${y}-${m}-${d}`;
            } else {
              const rawStr = String(fechaVal).trim();
              const monthMap: Record<string, string> = {
                jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
                jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
                ene: '01', abr: '04', ago: '08', dic: '12'
              };
              
              const matchLongDate = rawStr.match(/([A-Za-z]{3,4})\s+(\d{1,2})\s+(\d{4})/);

              if (!isNaN(Number(rawStr)) && Number(rawStr) > 40000) {
                const dateObj = XLSX.SSF.parse_date_code(Number(rawStr));
                fechaStr = `${dateObj.y}-${String(dateObj.m).padStart(2, '0')}-${String(dateObj.d).padStart(2, '0')}`;
              } else if (/^\d{4}-\d{2}-\d{2}$/.test(rawStr)) {
                fechaStr = rawStr;
              } else if (rawStr.includes('/')) {
                const parts = rawStr.split('/');
                if (parts[2]?.length === 4) {
                  fechaStr = `${parts[2]}-${String(parts[1]).padStart(2, '0')}-${String(parts[0]).padStart(2, '0')}`;
                } else if (parts[0]?.length === 4) {
                  fechaStr = `${parts[0]}-${String(parts[1]).padStart(2, '0')}-${String(parts[2]).padStart(2, '0')}`;
                } else {
                  fechaStr = rawStr;
                }
              } else if (/^\d{2}-\d{2}-\d{4}$/.test(rawStr)) {
                const parts = rawStr.split('-');
                fechaStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
              } else if (matchLongDate && monthMap[matchLongDate[1].toLowerCase().substring(0, 3)]) {
                const mon = monthMap[matchLongDate[1].toLowerCase().substring(0, 3)];
                fechaStr = `${matchLongDate[3]}-${mon}-${matchLongDate[2].padStart(2, '0')}`;
              } else {
                const parsedDate = new Date(rawStr);
                if (!isNaN(parsedDate.getTime())) {
                  const y = parsedDate.getFullYear();
                  const m = String(parsedDate.getMonth() + 1).padStart(2, '0');
                  const d = String(parsedDate.getDate()).padStart(2, '0');
                  fechaStr = `${y}-${m}-${d}`;
                } else {
                  fechaStr = rawStr;
                }
              }
            }

            // Formatear tiempos
            const formatTime = (val: any) => {
              if (val === undefined || val === null || String(val).trim() === '') return null;
              let timeStr = String(val).trim();
              
              // Si es número fraccional de Excel (tiempo)
              if (!isNaN(Number(timeStr)) && Number(timeStr) < 1) {
                const totalSeconds = Math.round(Number(timeStr) * 24 * 3600);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
              }
              
              // Si viene en formato HH:MM
              if (timeStr.length === 5 && timeStr.includes(':')) {
                return `${timeStr}:00`;
              }
              return timeStr;
            };

            const cleanNombre = String(nombre).trim();
            nombresEncontrados.add(cleanNombre);

            rawData.push({
              nombre: cleanNombre,
              fecha: fechaStr,
              entrada: formatTime(entradaVal),
              salida: formatTime(salidaVal)
            });
          }

          setExcelData(rawData);

          // Cruzar nombres con la BD
          if (nombresEncontrados.size > 0) {
            const checkRes = await asistenciaService.checkImport(Array.from(nombresEncontrados));
            
            const processedList: ProcessedEmpleado[] = checkRes.map(item => {
              const count = rawData.filter(d => d.nombre.toLowerCase() === item.nombre.toLowerCase()).length;
              return {
                nombre: item.nombre,
                existe: item.existe,
                ultima_fecha: item.ultima_fecha,
                horario_habitual: item.horario_habitual,
                seleccionado: true,
                sobreescribir: false,
                totalFilasExcel: count
              };
            });

            setEmpleados(processedList);
          } else {
            alert('No se encontraron registros válidos de empleados en las columnas correspondientes.');
            setFile(null);
          }
        } catch (err) {
          console.error(err);
          alert('Error al leer la estructura del archivo Excel. Asegúrate de que las columnas coincidan.');
          setFile(null);
        } finally {
          setLoading(false);
        }
      };

      reader.readAsBinaryString(selectedFile);
    } catch (err) {
      console.error(err);
      alert('No se pudo abrir el archivo.');
      setLoading(false);
      setFile(null);
    }
  };

  const handleGlobalOptionChange = (option: 'nuevos' | 'sobreescribir') => {
    setGlobalOption(option);
    setEmpleados(prev => prev.map(emp => ({
      ...emp,
      sobreescribir: option === 'sobreescribir'
    })));
  };

  const handleToggleEmpleado = (nombre: string) => {
    setEmpleados(prev => prev.map(emp => {
      if (emp.nombre === nombre) {
        return { ...emp, seleccionado: !emp.seleccionado };
      }
      return emp;
    }));
  };

  const handleToggleSobreescribirEmpleado = (nombre: string) => {
    setEmpleados(prev => prev.map(emp => {
      if (emp.nombre === nombre) {
        return { ...emp, sobreescribir: !emp.sobreescribir };
      }
      return emp;
    }));
  };

  const handleImportar = async () => {
    setLoading(true);
    try {
      const payload: any[] = [];
      const empleadosSeleccionados = empleados.filter(e => e.seleccionado);

      if (!empleadosSeleccionados.length) {
        alert('Debes seleccionar al menos un empleado para importar.');
        setLoading(false);
        return;
      }

      // Helper robusto para convertir HH:MM o HH:MM:SS a segundos
      const parseTimeToSeconds = (timeStr: string | null): number | null => {
        if (!timeStr || timeStr.trim() === '') return null;
        const parts = timeStr.split(':').map(Number);
        const h = parts[0] || 0;
        const m = parts[1] || 0;
        const s = parts[2] || 0;
        if (isNaN(h) || isNaN(m) || isNaN(s)) return null;
        return h * 3600 + m * 60 + s;
      };

      for (const emp of empleadosSeleccionados) {
        // Filtrar filas del Excel para este empleado
        let filas = excelData.filter(d => d.nombre.toLowerCase() === emp.nombre.toLowerCase());

        // Si la opción es "Solo nuevos" y tiene registros previos, filtrar
        if (!emp.sobreescribir && emp.ultima_fecha) {
          const limitDate = new Date(emp.ultima_fecha);
          filas = filas.filter(f => new Date(f.fecha) > limitDate);
        }

        const schedule = emp.horario_habitual || DEFAULT_SCHEDULE;

        filas.forEach(row => {
          const dateObj = new Date(row.fecha);
          let diaSemana = dateObj.getUTCDay(); // 0 = Domingo, 1 = Lunes, ...
          if (isNaN(diaSemana)) {
            diaSemana = 1; // Por defecto lunes si la fecha es inválida
          }

          // Buscar horas requeridas en el horario
          const dayConfig = schedule.find(s => s.dia === diaSemana) || { dia: diaSemana, entrada: null, salida: null, horas_requeridas: 0 };
          const horasEsperadasRaw = dayConfig.horas_requeridas;
          const horasEsperadas = isNaN(horasEsperadasRaw) ? 0 : horasEsperadasRaw;

          let horasTrabajadas: number | null = null;
          let balance = 0;
          let comida = 0; // Descuento de comida en horas

          let entradaSecs = parseTimeToSeconds(row.entrada);
          const scheduledEntradaSecs = parseTimeToSeconds(dayConfig.entrada);

          // Regla: No contar tiempo antes de la hora de la jornada
          if (entradaSecs !== null && scheduledEntradaSecs !== null) {
            if (entradaSecs < scheduledEntradaSecs) {
              entradaSecs = scheduledEntradaSecs;
            }
          }

          const salidaSecs = parseTimeToSeconds(row.salida);

          if (entradaSecs !== null && salidaSecs !== null) {
            let diffSecs = salidaSecs - entradaSecs;
            if (diffSecs < 0) diffSecs += 24 * 3600; // Caso cruza medianoche

            let netHours = diffSecs / 3600;

            // Restar comida
            if (diaSemana === 6) { // Sábado
              comida = 0.33; // 20 min
            } else if (diaSemana !== 0) { // Lunes-Viernes
              comida = 1.0; // 1 hora
            }

            netHours = Math.max(0, netHours - comida);
            horasTrabajadas = parseFloat(netHours.toFixed(2));
            balance = parseFloat((horasTrabajadas - horasEsperadas).toFixed(2));
          } else {
            // Falta entrada o salida: dejamos vacío (null) y balance negativo según lo esperado
            horasTrabajadas = null;
            balance = parseFloat((0 - horasEsperadas).toFixed(2));
          }

          // Validar contra valores NaN de seguridad final antes de pushear
          const finalHorasTrabajadas = horasTrabajadas === null || isNaN(horasTrabajadas) ? null : horasTrabajadas;
          const finalHorasEsperadas = isNaN(horasEsperadas) ? 0 : horasEsperadas;
          const finalBalance = isNaN(balance) ? -finalHorasEsperadas : balance;
          const finalComida = isNaN(comida) ? 0 : comida;

          payload.push({
            nombre: emp.nombre,
            fecha: row.fecha,
            entrada: row.entrada,
            salida: row.salida,
            comida: finalComida,
            horasTrabajadas: finalHorasTrabajadas,
            horasEsperadas: finalHorasEsperadas,
            balance: finalBalance,
            turno: 'Habitual',
            programado_entrada: dayConfig.entrada,
            programado_salida: dayConfig.salida
          });
        });
      }

      if (!payload.length) {
        alert('No hay registros nuevos para importar con los filtros seleccionados.');
        setLoading(false);
        return;
      }

      const res = await asistenciaService.importAsistencia(payload);
      if (res.success) {
        alert(res.message || 'Importación completada con éxito.');
        onSuccess();
        onClose();
      } else {
        alert(res.message || 'Ocurrió un error al importar.');
      }
    } catch (err) {
      console.error(err);
      alert('Error en el proceso de importación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className={`w-full max-w-4xl rounded-3xl p-6 shadow-2xl transition-all duration-300 border ${
        isDark ? 'bg-[#3d2d52] border-violet-700 text-violet-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Cabecera */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black">Importar Reporte de Asistencia</h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>
              Carga tu archivo XLSX de control de asistencia. El sistema leerá automáticamente las columnas.
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

        {/* Carga de Archivo */}
        {!file && (
          <div className="py-10 flex flex-col items-center justify-center">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`w-full max-w-lg border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-pink-500 transition-all ${
                isDark ? 'border-violet-700 hover:bg-violet-900/10' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center text-pink-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold">Seleccionar archivo Excel</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Formato soportado: .xlsx / .xls</p>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".xlsx, .xls" 
              className="hidden" 
            />
          </div>
        )}

        {/* Previsualización y Reglas */}
        {file && (
          <div className="space-y-6">
            {/* Opción Global */}
            <div className={`p-4 rounded-2xl flex items-center justify-between border ${
              isDark ? 'bg-violet-950/20 border-violet-750' : 'bg-slate-50 border-slate-100'
            }`}>
              <span className="text-xs font-bold uppercase tracking-wider">Preferencia Global:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleGlobalOptionChange('nuevos')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    globalOption === 'nuevos'
                      ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                      : isDark ? 'bg-violet-900/30 text-violet-300' : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  Solo datos nuevos
                </button>
                <button
                  onClick={() => handleGlobalOptionChange('sobreescribir')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    globalOption === 'sobreescribir'
                      ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                      : isDark ? 'bg-violet-900/30 text-violet-300' : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  Sobreescribir todo
                </button>
              </div>
            </div>

            {/* Listado de Empleados Cruzados */}
            <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`text-[10px] font-bold uppercase tracking-wider border-b ${
                    isDark ? 'border-violet-750 text-violet-400' : 'border-slate-100 text-slate-400'
                  }`}>
                    <th className="py-2">Importar</th>
                    <th className="py-2">Empleado</th>
                    <th className="py-2">Registros en Excel</th>
                    <th className="py-2">Estado en Sistema</th>
                    <th className="py-2 text-center">Acción si existe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-transparent">
                  {empleados.map((emp) => (
                    <tr 
                      key={emp.nombre} 
                      className={`text-sm py-2 ${
                        !emp.seleccionado ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="py-3">
                        <input
                          type="checkbox"
                          checked={emp.seleccionado}
                          onChange={() => handleToggleEmpleado(emp.nombre)}
                          className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 font-semibold">{emp.nombre}</td>
                      <td className="py-3">{emp.totalFilasExcel} días</td>
                      <td className="py-3">
                        {emp.existe ? (
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isDark ? 'bg-violet-900/40 text-violet-300' : 'bg-slate-100 text-slate-600'
                          }`}>
                            Último: {emp.ultima_fecha}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500">
                            Nuevo empleado
                          </span>
                        )}
                      </td>
                      <td className="py-3 flex justify-center">
                        {emp.existe && (
                          <button
                            onClick={() => handleToggleSobreescribirEmpleado(emp.nombre)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              emp.sobreescribir
                                ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                                : 'bg-blue-500/10 text-blue-500 border border-blue-500/30'
                            }`}
                          >
                            {emp.sobreescribir ? 'Sobreescribir históricos' : 'Solo datos nuevos'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className={`mt-6 pt-4 border-t flex justify-between items-center ${
          isDark ? 'border-violet-750' : 'border-slate-100'
        }`}>
          <div>
            {file && (
              <button
                onClick={() => {
                  setFile(null);
                  setEmpleados([]);
                  setExcelData([]);
                }}
                className={`text-xs font-bold flex items-center gap-1.5 ${
                  isDark ? 'text-violet-400 hover:text-violet-200' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Cambiar de archivo
              </button>
            )}
          </div>
          <div className="flex gap-3">
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
            {file && (
              <button
                type="button"
                onClick={handleImportar}
                disabled={loading}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-pink-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-pink-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Importando...' : 'Confirmar Importación'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
