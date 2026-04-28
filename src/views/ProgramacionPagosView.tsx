import React, { useState, useEffect } from 'react';
import { User } from '../types';
import CuentasBancariasView from './CuentasBancariasView';
import api from '../services/api';
import { useDarkMode } from '../context/DarkModeContext';

interface ProgramacionPagosViewProps {
  user: User;
  onNavigate: (tab: string, params?: any) => void;
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Datos mock: { "YYYY-MM-DD": cantidad }
const mockPagos: Record<string, number> = {
  '2026-04-03': 2,
  '2026-04-07': 5,
  '2026-04-10': 1,
  '2026-04-15': 3,
  '2026-04-22': 4,
};
function getDiasEnMes(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Retorna el offset para semana Dom-Sáb (0=Dom, 6=Sáb)
function getPrimerDiaSemana(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const ProgramacionPagosView: React.FC<ProgramacionPagosViewProps> = ({ user, onNavigate }) => {
  const { isDark } = useDarkMode();
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [verCuentas, setVerCuentas] = useState(false);
  const [conteoPagos, setConteoPagos] = useState<Record<string, number>>({});

  useEffect(() => {
    api.getConteoPagosPorMes(anio, mes).then(data => setConteoPagos(data));
  }, [anio, mes]);

  if (verCuentas) {
    return <CuentasBancariasView onVolver={() => setVerCuentas(false)} user={user} />;
  }

  const diasEnMes = getDiasEnMes(anio, mes);
  const primerDia = getPrimerDiaSemana(anio, mes);

  const anioActual = hoy.getFullYear();
  const anios = Array.from({ length: 5 }, (_, i) => anioActual - 2 + i);

  const handleDiaClick = (dia: number) => {
    const fecha = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    onNavigate('programacionPagosDia', { fecha });
  };

  const esHoy = (dia: number) =>
    dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear();

  const getPagosDelDia = (dia: number): number => {
    const key = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return conteoPagos[key] ?? 0;
  };

  // Celdas vacías antes del primer día
  const celdas: (number | null)[] = [
    ...Array(primerDia).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => i + 1),
  ];

  // Rellenar hasta completar la última fila
  while (celdas.length % 7 !== 0) celdas.push(null);

  return (
    <div className={`h-full w-full flex flex-col p-4 md:p-8 overflow-auto pb-20 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-transparent'}`}>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl md:text-4xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-violet-900'}`}>Programación de Pagos</h1>
          <p className={`text-sm mt-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-violet-400'}`}>Selecciona un día para gestionar los pagos</p>
        </div>

        {/* Selectores */}
        <div className="flex items-center gap-3">
          <select
            value={mes}
            onChange={e => setMes(Number(e.target.value))}
            className={`appearance-none font-semibold rounded-xl px-4 py-2 focus:outline-none cursor-pointer shadow-sm transition-all transition-colors duration-300 border-2 ${isDark ? 'bg-[#4a3a63] border-violet-600 text-violet-100 focus:border-violet-500' : 'bg-white border-violet-200 text-violet-800 focus:border-violet-400'}`}
          >
            {MESES.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>

          <select
            value={anio}
            onChange={e => setAnio(Number(e.target.value))}
            className={`appearance-none font-semibold rounded-xl px-4 py-2 focus:outline-none cursor-pointer shadow-sm transition-all transition-colors duration-300 border-2 ${isDark ? 'bg-[#4a3a63] border-violet-600 text-violet-100 focus:border-violet-500' : 'bg-white border-violet-200 text-violet-800 focus:border-violet-400'}`}
          >
            {anios.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <button
            onClick={() => setVerCuentas(true)}
            className={`flex items-center gap-2 font-semibold px-4 py-2 rounded-xl shadow-sm transition-all whitespace-nowrap border-2 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-600 text-violet-300 hover:border-violet-500 hover:bg-[#5a4a75]' : 'bg-white border-violet-200 text-violet-500 hover:border-violet-400 hover:bg-violet-50'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
            Cuentas bancarias registradas
          </button>
        </div>
      </div>

      {/* Calendario */}
      <div className={`flex-1 rounded-3xl shadow-lg border overflow-hidden flex flex-col min-h-[600px] transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-violet-100'}`}>
        {/* Cabecera días de semana */}
        <div className={`grid grid-cols-7 transition-colors duration-300 ${isDark ? 'bg-violet-700' : 'bg-violet-500'}`}>
          {DIAS_SEMANA.map(d => (
            <div key={d} className={`py-3 text-center font-bold text-sm tracking-wide transition-colors duration-300 ${isDark ? 'text-violet-100' : 'text-white'}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Grid de días */}
        <div className="flex-1 grid grid-cols-7" style={{ gridAutoRows: '1fr' }}>
          {celdas.map((dia, idx) => {
            const colIdx = idx % 7; // 0=Dom, 6=Sáb
            const esFinDeSemana = colIdx === 0 || colIdx === 6;

            if (dia === null) {
              return (
                <div
                  key={`empty-${idx}`}
                  className={`border-b border-r transition-colors duration-300 ${isDark ? 'border-violet-700 bg-violet-900/20' : 'border-violet-50'} ${esFinDeSemana ? (isDark ? 'bg-violet-900/30' : 'bg-violet-50/60') : (isDark ? 'bg-violet-900/10' : 'bg-violet-50/20')}`}
                />
              );
            }

            const pagos = getPagosDelDia(dia);
            const hoyFlag = esHoy(dia);

            return (
              <button
                key={dia}
                onClick={() => handleDiaClick(dia)}
                className={`
                  relative border-b border-r p-2 flex flex-col items-start justify-between
                  transition-all duration-200 group min-h-[110px]
                  ${hoyFlag
                    ? isDark ? 'bg-violet-700 hover:bg-violet-700' : 'bg-violet-500 hover:bg-violet-500'
                    : esFinDeSemana
                      ? isDark ? 'bg-violet-900/20 hover:bg-violet-900/30' : 'bg-violet-50/70 hover:bg-violet-100/80'
                      : isDark ? 'bg-[#4a3a63] hover:bg-violet-900/20' : 'bg-white hover:bg-violet-50'
                  }
                  ${isDark ? 'border-violet-700' : 'border-violet-100'}
                `}
              >
                {/* Número del día */}
                <span className={`
                  text-sm md:text-base font-bold leading-none transition-colors duration-300
                  ${hoyFlag ? 'text-white' : isDark ? 'text-violet-200 group-hover:text-violet-100' : 'text-violet-900 group-hover:text-violet-500'}
                `}>
                  {dia}
                </span>

                {/* Badge de pagos */}
                {pagos > 0 && (
                  <span className={`
                    self-end text-sm font-bold px-3 py-1 rounded-full transition-colors duration-300
                    ${hoyFlag
                      ? 'bg-white/20 text-white'
                      : isDark ? 'bg-pink-900/30 text-pink-400' : 'bg-pink-100 text-pink-600'
                    }
                  `}>
                    {pagos} {pagos === 1 ? 'pago' : 'pagos'}
                  </span>
                )}

                {/* Indicador hover */}
                {!hoyFlag && (
                  <div className={`absolute inset-0 border-2 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transition-colors duration-300 ${isDark ? 'border-violet-500' : 'border-violet-400'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className={`mt-4 flex items-center gap-6 text-xs transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-violet-400'}`}>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded transition-colors duration-300 ${isDark ? 'bg-violet-700' : 'bg-violet-500'}`} />
          <span>Hoy</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-bold px-2 py-0.5 rounded-full transition-colors duration-300 ${isDark ? 'bg-pink-900/30 text-pink-400' : 'bg-pink-100 text-pink-600'}`}>N pagos</span>
          <span>Pagos programados</span>
        </div>
      </div>
    </div>
  );
};

export default ProgramacionPagosView;
