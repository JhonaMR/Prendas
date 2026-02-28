import React, { useState, useEffect } from 'react';
import { AppState } from '../../types';
import { UserRole } from '../../types/typesFichas';
import apiFichas from '../../services/apiFichas';

interface FichasCosoDetalleProps {
  state: AppState;
  user: any;
  updateState: (updater: (prev: AppState) => AppState) => void;
  referencia?: string;
  onNavigate?: (tab: string) => void;
}

const FichasCostoDetalle: React.FC<FichasCosoDetalleProps> = ({ state, user, updateState, referencia, onNavigate }) => {
  const [ficha, setFicha] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

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

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-800">Ficha de Costo: {ficha.referencia}</h2>
        <button
          onClick={() => onNavigate?.('fichas-costo')}
          className="px-6 py-3 bg-slate-200 text-slate-700 font-black rounded-xl hover:bg-slate-300 transition-colors"
        >
          Volver
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100">
          <p className="text-xs font-black text-slate-400 uppercase mb-1">Costo Total</p>
          <p className="text-2xl font-black text-slate-800">${ficha.costoTotal.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100">
          <p className="text-xs font-black text-slate-400 uppercase mb-1">Precio Venta</p>
          <p className="text-2xl font-black text-blue-600">${ficha.precioVenta.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100">
          <p className="text-xs font-black text-slate-400 uppercase mb-1">Rentabilidad</p>
          <p className="text-2xl font-black text-green-600">{ficha.rentabilidad.toFixed(2)}%</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100">
          <p className="text-xs font-black text-slate-400 uppercase mb-1">Margen Ganancia</p>
          <p className="text-2xl font-black text-slate-800">${ficha.margenGanancia.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100">
        <h3 className="text-lg font-black text-slate-800 mb-4">Descuentos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-400 font-bold mb-1">0% Desc</p>
            <p className="font-black text-slate-800">${ficha.desc0Precio.toLocaleString()}</p>
            <p className="text-xs text-slate-500">{ficha.desc0Rent.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold mb-1">5% Desc</p>
            <p className="font-black text-slate-800">${ficha.desc5Precio.toLocaleString()}</p>
            <p className="text-xs text-slate-500">{ficha.desc5Rent.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold mb-1">10% Desc</p>
            <p className="font-black text-slate-800">${ficha.desc10Precio.toLocaleString()}</p>
            <p className="text-xs text-slate-500">{ficha.desc10Rent.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold mb-1">15% Desc</p>
            <p className="font-black text-slate-800">${ficha.desc15Precio.toLocaleString()}</p>
            <p className="text-xs text-slate-500">{ficha.desc15Rent.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      {ficha.cortes && ficha.cortes.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-4">Cortes ({ficha.cortes.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {ficha.cortes.map((corte: any, idx: number) => (
              <button
                key={idx}
                onClick={() => onNavigate?.('fichas-corte-detalle')}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-center"
              >
                <p className="font-black text-slate-800">Corte #{corte.numeroCorte}</p>
                <p className="text-xs text-slate-500">{corte.cantidadCortada} unidades</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FichasCostoDetalle;
