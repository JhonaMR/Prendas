import React, { useState, useEffect } from 'react';
import { AppState } from '../../types';
import { FichaDiseno, UserRole } from '../../types/typesFichas';
import SeccionConceptos from '../../components/fichas/SeccionConceptos';
import SubidaFotos from '../../components/fichas/SubidaFotos';
import apiFichas from '../../services/apiFichas';

interface FichasDisenoDetalleProps {
  state: AppState;
  user: any;
  updateState: (updater: (prev: AppState) => AppState) => void;
  referencia?: string;
  onNavigate?: (tab: string) => void;
}

const FichasDisenoDetalle: React.FC<FichasDisenoDetalleProps> = ({ state, user, updateState, referencia, onNavigate }) => {
  const [ficha, setFicha] = useState<FichaDiseno | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isDisenadora = user?.role === 'disenadora';
  const isOwner = ficha?.createdBy === user?.id || ficha?.disenadoraId === user?.id;
  const canEdit = isDisenadora && isOwner;

  useEffect(() => {
    const loadFicha = async () => {
      if (!referencia) return;
      try {
        const data = await apiFichas.getFichaDiseno(referencia);
        setFicha(data);
      } catch (error) {
        console.error('Error cargando ficha:', error);
      } finally {
        setLoading(false);
      }
    };
    loadFicha();
  }, [referencia]);

  const handleSave = async () => {
    if (!ficha) return;
    setSaving(true);
    try {
      const response = await apiFichas.updateFichaDiseno(ficha.referencia, ficha as any);
      if (response.success) {
        alert('Ficha guardada exitosamente');
        updateState(prev => ({
          ...prev,
          fichasDiseno: prev.fichasDiseno?.map(f => f.id === ficha.id ? ficha : f) || []
        }));
      }
    } catch (error) {
      alert('Error al guardar ficha');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Cargando...</div>;
  if (!ficha) return <div className="p-4">Ficha no encontrada</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-800">Ficha de Diseño: {ficha.referencia}</h2>
        <button
          onClick={() => onNavigate?.('fichas-diseno')}
          className="px-6 py-3 bg-slate-200 text-slate-700 font-black rounded-xl hover:bg-slate-300 transition-colors"
        >
          Volver
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-black text-slate-600 uppercase mb-2 block">Descripción</label>
          <input
            type="text"
            value={ficha.descripcion}
            onChange={(e) => setFicha({...ficha, descripcion: e.target.value})}
            readOnly={!canEdit}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
          />
        </div>
        <div>
          <label className="text-sm font-black text-slate-600 uppercase mb-2 block">Marca</label>
          <input
            type="text"
            value={ficha.marca}
            onChange={(e) => setFicha({...ficha, marca: e.target.value})}
            readOnly={!canEdit}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
          />
        </div>
      </div>

      <SubidaFotos
        referencia={ficha.referencia}
        foto1={ficha.foto1}
        foto2={ficha.foto2}
        onFoto1Change={(path) => setFicha({...ficha, foto1: path})}
        onFoto2Change={(path) => setFicha({...ficha, foto2: path})}
        readOnly={!canEdit}
      />

      <SeccionConceptos
        titulo="Materia Prima"
        color="pink"
        conceptos={ficha.materiaPrima}
        onChange={(conceptos) => setFicha({...ficha, materiaPrima: conceptos})}
        readOnly={!canEdit}
        mostrarTipo={true}
      />

      <SeccionConceptos
        titulo="Mano de Obra"
        color="blue"
        conceptos={ficha.manoObra}
        onChange={(conceptos) => setFicha({...ficha, manoObra: conceptos})}
        readOnly={!canEdit}
      />

      <SeccionConceptos
        titulo="Insumos Directos"
        color="slate"
        conceptos={ficha.insumosDirectos}
        onChange={(conceptos) => setFicha({...ficha, insumosDirectos: conceptos})}
        readOnly={!canEdit}
      />

      <SeccionConceptos
        titulo="Insumos Indirectos"
        color="orange"
        conceptos={ficha.insumosIndirectos}
        onChange={(conceptos) => setFicha({...ficha, insumosIndirectos: conceptos})}
        readOnly={!canEdit}
      />

      <SeccionConceptos
        titulo="Provisiones"
        color="red"
        conceptos={ficha.provisiones}
        onChange={(conceptos) => setFicha({...ficha, provisiones: conceptos})}
        readOnly={!canEdit}
      />

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase mb-1">Total Materia Prima</p>
            <p className="text-2xl font-black text-pink-600">${ficha.totalMateriaPrima.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase mb-1">Total Mano Obra</p>
            <p className="text-2xl font-black text-blue-600">${ficha.totalManoObra.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase mb-1">Total Insumos Directos</p>
            <p className="text-2xl font-black text-slate-600">${ficha.totalInsumosDirectos.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase mb-1">Total Insumos Indirectos</p>
            <p className="text-2xl font-black text-orange-600">${ficha.totalInsumosIndirectos.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase mb-1">Costo Total</p>
            <p className="text-2xl font-black text-slate-800">${ficha.costoTotal.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {canEdit && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-6 py-4 bg-gradient-to-r from-pink-600 to-pink-500 text-white font-black rounded-2xl hover:shadow-lg transition-all uppercase tracking-wider disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Ficha'}
        </button>
      )}
    </div>
  );
};

export default FichasDisenoDetalle;
