import React, { useState, useEffect } from 'react';
import { AppState } from '../../types';
import apiFichas from '../../services/apiFichas';

interface FichasCorteDetalleProps {
  state: AppState;
  user: any;
  updateState: (updater: (prev: AppState) => AppState) => void;
  referencia?: string;
  numeroCorte?: string;
  onNavigate?: (tab: string) => void;
}

const FichasCorteDetalle: React.FC<FichasCorteDetalleProps> = ({ state, user, updateState, referencia, numeroCorte, onNavigate }) => {
  const [ficha, setFicha] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFicha = async () => {
      if (!referencia) return;
      try {
        const data = await apiFichas.getFichaCosto(referencia);
        setFicha(data);
      } catch (error) {
        console.error('Error cargando ficha:', error);
      } finally {
        setLoading(false);
      }
    };
    loadFicha();
  }, [referencia]);

  if (loading) return <div className="p-4">Cargando...</div>;
  if (!ficha) return <div className="p-4">Ficha no encontrada</div>;

  const corte = ficha.cortes?.find((c: any) => c.numeroCorte === parseInt(numeroCorte || '0'));

  if (!corte) return <div className="p-4">Corte no encontrado</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-800">Corte #{corte.numeroCorte} - {ficha.referencia}</h2>
        <button
          onClick={() => onNavigate?.('fichas-costo-detalle')}
          className="px-6 py-3 bg-slate-200 text-slate-700 font-black rounded-xl hover:bg-slate-300 transition-colors"
        >
          Volver
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100">
          <p className="text-xs font-black text-slate-400 uppercase mb-1">Fecha Corte</p>
          <p className="text-lg font-black text-slate-800">{corte.fechaCorte}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100">
          <p className="text-xs font-black text-slate-400 uppercase mb-1">Cantidad Cortada</p>
          <p className="text-lg font-black text-slate-800">{corte.cantidadCortada}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100">
          <p className="text-xs font-black text-slate-400 uppercase mb-1">Costo Real</p>
          <p className="text-lg font-black text-slate-800">${corte.costoReal.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100">
          <p className="text-xs font-black text-slate-400 uppercase mb-1">Utilidad</p>
          <p className={`text-lg font-black ${corte.margenUtilidad > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {corte.margenUtilidad.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100">
        <h3 className="text-lg font-black text-slate-800 mb-4">Comparativa</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-400 font-bold mb-2">Proyectado</p>
            <p className="text-2xl font-black text-slate-800">${corte.costoProyectado.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 font-bold mb-2">Real</p>
            <p className="text-2xl font-black text-slate-800">${corte.costoReal.toLocaleString()}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-slate-400 font-bold mb-2">Diferencia</p>
            <p className={`text-2xl font-black ${corte.diferencia > 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${corte.diferencia.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FichasCorteDetalle;
