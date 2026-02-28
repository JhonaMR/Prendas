// ============================================
// COMPONENTE: Sección Conceptos
// Tabla editable de conceptos para fichas
// ============================================

import React from 'react';
import { ConceptoFicha, TipoMaterial, UnidadMedida } from '../../types/typesFichas';

interface SeccionConceptosProps {
  titulo: string;
  color: 'pink' | 'blue' | 'slate' | 'orange' | 'red';
  conceptos: ConceptoFicha[];
  onChange: (conceptos: ConceptoFicha[]) => void;
  readOnly: boolean;
  mostrarTipo?: boolean;
  onAgregarConcepto?: () => void;
}

const SeccionConceptos: React.FC<SeccionConceptosProps> = ({
  titulo,
  color,
  conceptos,
  onChange,
  readOnly,
  mostrarTipo = false,
  onAgregarConcepto
}) => {
  
  const colorClasses = {
    pink: {
      bg: 'bg-pink-500',
      text: 'text-pink-700',
      border: 'border-pink-200',
      bgLight: 'bg-pink-50'
    },
    blue: {
      bg: 'bg-blue-600',
      text: 'text-blue-700',
      border: 'border-blue-200',
      bgLight: 'bg-blue-50'
    },
    slate: {
      bg: 'bg-slate-700',
      text: 'text-slate-700',
      border: 'border-slate-200',
      bgLight: 'bg-slate-50'
    },
    orange: {
      bg: 'bg-orange-600',
      text: 'text-orange-700',
      border: 'border-orange-200',
      bgLight: 'bg-orange-50'
    },
    red: {
      bg: 'bg-red-600',
      text: 'text-red-700',
      border: 'border-red-200',
      bgLight: 'bg-red-50'
    }
  };

  const colors = colorClasses[color];

  const agregarConcepto = () => {
    const nuevoConcepto: ConceptoFicha = {
      concepto: 'INGRESE CONCEPTO',
      tipo: mostrarTipo ? 'INSUMO' : undefined,
      um: 'UNIDAD',
      vlr_unit: 0,
      cant: 1,
      total: 0
    };
    onChange([...conceptos, nuevoConcepto]);
  };

  const eliminarConcepto = (index: number) => {
    const nuevosConceptos = conceptos.filter((_, i) => i !== index);
    onChange(nuevosConceptos);
  };

  const actualizarConcepto = (index: number, campo: keyof ConceptoFicha, valor: any) => {
    const nuevosConceptos = [...conceptos];
    nuevosConceptos[index] = {
      ...nuevosConceptos[index],
      [campo]: valor
    };

    if (campo === 'vlr_unit' || campo === 'cant') {
      nuevosConceptos[index].total = 
        (nuevosConceptos[index].vlr_unit || 0) * (nuevosConceptos[index].cant || 0);
    }

    onChange(nuevosConceptos);
  };

  const total = conceptos.reduce((acc, c) => acc + (c.total || 0), 0);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className={`${colors.bg} p-4 flex items-center justify-between`}>
        <h3 className="text-white font-black uppercase tracking-wider text-sm">
          {titulo}
        </h3>
        {!readOnly && (
          <button
            onClick={onAgregarConcepto || agregarConcepto}
            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl font-black text-white text-xs uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Agregar
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className={`${colors.bgLight} border-b ${colors.border}`}>
              <th className="px-4 py-3 font-black text-slate-600 uppercase tracking-widest">Concepto</th>
              {mostrarTipo && (
                <th className="px-3 py-3 font-black text-slate-600 uppercase tracking-widest w-32">Tipo</th>
              )}
              <th className="px-3 py-3 font-black text-slate-600 uppercase tracking-widest w-28">U/M</th>
              <th className="px-3 py-3 font-black text-slate-600 uppercase tracking-widest text-right w-32">VLR. UNIT</th>
              <th className="px-3 py-3 font-black text-slate-600 uppercase tracking-widest text-center w-24">CANT.</th>
              <th className="px-3 py-3 font-black text-slate-600 uppercase tracking-widest text-right w-32">TOTAL</th>
              {!readOnly && <th className="px-3 py-3 w-16"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {conceptos.length === 0 ? (
              <tr>
                <td colSpan={mostrarTipo ? 7 : 6} className="px-4 py-8 text-center text-slate-400 italic">
                  No hay conceptos agregados
                </td>
              </tr>
            ) : (
              conceptos.map((concepto, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={concepto.concepto}
                      onChange={(e) => actualizarConcepto(index, 'concepto', e.target.value)}
                      readOnly={readOnly}
                      className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold ${colors.text} focus:ring-2 focus:ring-blue-100 ${readOnly ? 'cursor-default' : ''}`}
                    />
                  </td>
                  {mostrarTipo && (
                    <td className="px-3 py-3">
                      <select
                        value={concepto.tipo || 'INSUMO'}
                        onChange={(e) => actualizarConcepto(index, 'tipo', e.target.value as TipoMaterial)}
                        disabled={readOnly}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="TELA">TELA</option>
                        <option value="RESORTE">RESORTE</option>
                        <option value="INSUMO">INSUMO</option>
                        <option value="OTRO">OTRO</option>
                      </select>
                    </td>
                  )}
                  <td className="px-3 py-3">
                    <select
                      value={concepto.um}
                      onChange={(e) => actualizarConcepto(index, 'um', e.target.value)}
                      disabled={readOnly}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 text-xs focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="METRO">METRO</option>
                      <option value="UNIDAD">UNIDAD</option>
                      <option value="PRENDA">PRENDA</option>
                      <option value="KILOGRAMO">KG</option>
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      value={concepto.vlr_unit}
                      onChange={(e) => actualizarConcepto(index, 'vlr_unit', Number(e.target.value))}
                      readOnly={readOnly}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-black text-right focus:ring-2 focus:ring-blue-100"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      step="0.01"
                      value={concepto.cant}
                      onChange={(e) => actualizarConcepto(index, 'cant', Number(e.target.value))}
                      readOnly={readOnly}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-black text-center focus:ring-2 focus:ring-blue-100"
                    />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className={`font-black ${colors.text} text-base`}>
                      $ {concepto.total.toLocaleString()}
                    </span>
                  </td>
                  {!readOnly && (
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => eliminarConcepto(index)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className={`${colors.bgLight} border-t-2 ${colors.border}`}>
              <td colSpan={mostrarTipo ? 5 : 4} className="px-4 py-4 font-black text-slate-600 uppercase tracking-widest text-right text-sm">
                Total {titulo}
              </td>
              <td className="px-3 py-4 text-right">
                <span className={`font-black ${colors.text} text-xl`}>
                  $ {total.toLocaleString()}
                </span>
              </td>
              {!readOnly && <td></td>}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default SeccionConceptos;
