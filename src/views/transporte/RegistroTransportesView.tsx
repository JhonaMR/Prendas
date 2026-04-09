import React, { useState } from 'react';

interface Transportista { id: string; nombre: string; colorKey: string; }
interface ItemRuta { id: string; taller: string; celular: string; direccion: string; sector: string; detalle: string; servicio: string; }
interface RutaTransporte { id: string; fecha: string; transportistaId: string; items: ItemRuta[]; }

interface Props {
  fecha: string;
  transportistas: Transportista[];
  rutas: RutaTransporte[];
  onAgregarRuta: (r: RutaTransporte) => void;
  onActualizarRutas: (r: RutaTransporte[]) => void;
  onVolver: () => void;
}

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const COLORES: Record<string,{bg:string;text:string;border:string}> = {
  red:    {bg:'bg-red-100',    text:'text-red-800',    border:'border-red-300'},
  green:  {bg:'bg-green-100',  text:'text-green-800',  border:'border-green-300'},
  blue:   {bg:'bg-blue-100',   text:'text-blue-800',   border:'border-blue-300'},
  yellow: {bg:'bg-yellow-100', text:'text-yellow-800', border:'border-yellow-300'},
  purple: {bg:'bg-purple-100', text:'text-purple-800', border:'border-purple-300'},
  orange: {bg:'bg-orange-100', text:'text-orange-800', border:'border-orange-300'},
  pink:   {bg:'bg-pink-100',   text:'text-pink-800',   border:'border-pink-300'},
};
const VACIO: Omit<ItemRuta,'id'> = {taller:'',celular:'',direccion:'',sector:'',detalle:'',servicio:''};
const ic = "w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-pink-400";

interface TallerRegistrado { id: string; nombre: string; celular: string; direccion: string; sector: string; }

function cargarTalleres(): TallerRegistrado[] {
  try { return JSON.parse(localStorage.getItem('ctrl_talleres') || '[]'); } catch { return []; }
}

function fmt(f: string) {
  const [a,m,d] = f.split('-');
  return `${parseInt(d)} de ${MESES[parseInt(m)-1]} de ${a}`;
}

const CloseBtn: React.FC<{onClick:()=>void}> = ({onClick}) => (
  <button onClick={onClick} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-500"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  </button>
);

const FormItem: React.FC<{form: Omit<ItemRuta,'id'>; onChange:(f:Omit<ItemRuta,'id'>)=>void}> = ({form, onChange}) => {
  const [sugerencias, setSugerencias] = useState<TallerRegistrado[]>([]);
  const talleres = cargarTalleres();

  const handleTallerChange = (valor: string) => {
    onChange({...form, taller: valor});
    if (valor.length >= 1) {
      setSugerencias(talleres.filter(t => t.nombre.toLowerCase().includes(valor.toLowerCase())));
    } else {
      setSugerencias([]);
    }
  };

  const seleccionarTaller = (t: TallerRegistrado) => {
    onChange({...form, taller: t.nombre, celular: t.celular, direccion: t.direccion, sector: t.sector});
    setSugerencias([]);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <input type="text" placeholder="Taller" value={form.taller}
          onChange={e => handleTallerChange(e.target.value)}
          onBlur={() => setTimeout(() => setSugerencias([]), 150)}
          className={ic}/>
        {sugerencias.length > 0 && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border-2 border-slate-200 rounded-xl shadow-lg overflow-hidden">
            {sugerencias.map(t => (
              <button key={t.id} type="button" onMouseDown={() => seleccionarTaller(t)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-pink-50 hover:text-pink-700 transition-colors border-b border-slate-100 last:border-0">
                <span className="font-semibold">{t.nombre}</span>
                {t.sector && <span className="text-slate-400 ml-2 text-xs">{t.sector}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
      <input type="text" placeholder="Celular"   value={form.celular}   onChange={e=>onChange({...form,celular:e.target.value})}   className={ic}/>
      <input type="text" placeholder="Dirección" value={form.direccion} onChange={e=>onChange({...form,direccion:e.target.value})} className={ic}/>
      <input type="text" placeholder="Sector"    value={form.sector}    onChange={e=>onChange({...form,sector:e.target.value})}    className={ic}/>
      <input type="text" placeholder="Detalle"   value={form.detalle}   onChange={e=>onChange({...form,detalle:e.target.value})}   className={ic}/>
      <input type="text" placeholder="Servicio"  value={form.servicio}  onChange={e=>onChange({...form,servicio:e.target.value})}  className={ic}/>
    </div>
  );
};

interface TablaProps {
  transportista: Transportista;
  items: ItemRuta[];
  onAdd: (item: ItemRuta) => void;
  onEdit: (item: ItemRuta) => void;
  onDelete: (id: string) => void;
  onMove: (item: ItemRuta) => void;
}

const TablaTransportista: React.FC<TablaProps> = ({transportista, items, onAdd, onEdit, onDelete, onMove}) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<ItemRuta,'id'>>({...VACIO});
  const c = COLORES[transportista.colorKey] || COLORES['red'];

  const guardar = () => {
    if (!form.taller.trim()) return;
    onAdd({id: Date.now().toString(), ...form});
    setForm({...VACIO});
    setOpen(false);
  };

  return (
    <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
      <div className={`px-6 py-3 ${c.bg} ${c.border} border-b flex items-center justify-between`}>
        <span className={`text-base font-black ${c.text}`}>{transportista.nombre}</span>
        <button onClick={()=>{setForm({...VACIO});setOpen(true);}}
          className="flex items-center gap-1.5 text-xs font-bold bg-white/70 hover:bg-white px-3 py-1.5 rounded-lg transition-colors text-slate-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
          Agregar registro
        </button>
      </div>
      <div className="overflow-x-auto bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-700 text-white">
              <th className="text-left px-4 py-3 font-bold w-52">Taller</th>
              <th className="text-left px-4 py-3 font-bold w-32">Celular</th>
              <th className="text-left px-4 py-3 font-bold w-64">Dirección</th>
              <th className="text-left px-4 py-3 font-bold w-32">Sector</th>
              <th className="text-left px-4 py-3 font-bold">Detalle</th>
              <th className="text-left px-4 py-3 font-bold w-28">Servicio</th>
              <th className="text-left px-4 py-3 font-bold w-28">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0
              ? <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-sm">Sin registros</td></tr>
              : items.map((item, idx) => (
                <tr key={item.id} className={idx%2===0?'bg-white':'bg-slate-50'}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{item.taller||'—'}</td>
                  <td className="px-4 py-3 text-slate-600">{item.celular||'—'}</td>
                  <td className="px-4 py-3 text-slate-600">{item.direccion||'—'}</td>
                  <td className="px-4 py-3 text-slate-600">{item.sector||'—'}</td>
                  <td className="px-4 py-3 text-slate-600">{item.detalle||'—'}</td>
                  <td className="px-4 py-3 text-slate-600">{item.servicio||'—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={()=>onEdit(item)} title="Editar" className="w-7 h-7 flex items-center justify-center rounded-full text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"/></svg>
                      </button>
                      <button onClick={()=>onMove(item)} title="Mover" className="w-7 h-7 flex items-center justify-center rounded-full text-slate-300 hover:text-amber-500 hover:bg-amber-50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/></svg>
                      </button>
                      <button onClick={()=>onDelete(item.id)} title="Eliminar" className="w-7 h-7 flex items-center justify-center rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Agregar registro</h2>
              <CloseBtn onClick={()=>setOpen(false)}/>
            </div>
            <FormItem form={form} onChange={setForm}/>
            <div className="flex gap-2">
              <button onClick={guardar} className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">Guardar</button>
              <button onClick={()=>setOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RegistroTransportesView: React.FC<Props> = ({fecha, transportistas, rutas, onAgregarRuta, onActualizarRutas, onVolver}) => {
  const [modalAgregar, setModalAgregar] = useState(false);
  const [tSeleccionado, setTSeleccionado] = useState('');
  const [formNuevo, setFormNuevo] = useState<Omit<ItemRuta,'id'>>({...VACIO});
  const [editState, setEditState] = useState<{item:ItemRuta;rutaId:string}|null>(null);
  const [formEdit, setFormEdit] = useState<Omit<ItemRuta,'id'>>({...VACIO});
  const [moveState, setMoveState] = useState<{item:ItemRuta;rutaId:string}|null>(null);
  const [formMove, setFormMove] = useState<Omit<ItemRuta,'id'>>({...VACIO});
  const [fechaDest, setFechaDest] = useState('');

  const rutasDelDia = rutas.filter(r => r.fecha === fecha);
  const tDelDia = transportistas.filter(t => rutasDelDia.some(r => r.transportistaId === t.id));

  const getRuta = (tid: string) => rutasDelDia.find(r => r.transportistaId === tid);

  const addItem = (tid: string, item: ItemRuta) => {
    onActualizarRutas(rutas.map(r =>
      r.fecha === fecha && r.transportistaId === tid ? {...r, items: [...(r.items||[]), item]} : r
    ));
  };

  const handleAgregar = () => {
    if (!tSeleccionado || !formNuevo.taller.trim()) return;
    const primerItem: ItemRuta = {id: Date.now().toString(), ...formNuevo};
    const yaExiste = rutasDelDia.some(r => r.transportistaId === tSeleccionado);
    if (yaExiste) {
      addItem(tSeleccionado, primerItem);
    } else {
      onAgregarRuta({id: Date.now().toString()+'r', fecha, transportistaId: tSeleccionado, items: [primerItem]});
    }
    setTSeleccionado('');
    setFormNuevo({...VACIO});
    setModalAgregar(false);
  };

  const startEdit = (item: ItemRuta, rutaId: string) => {
    setEditState({item, rutaId});
    setFormEdit({taller:item.taller, celular:item.celular, direccion:item.direccion, sector:item.sector, detalle:item.detalle, servicio:item.servicio});
  };

  const saveEdit = () => {
    if (!editState) return;
    onActualizarRutas(rutas.map(r =>
      r.id === editState.rutaId ? {...r, items: r.items.map(i => i.id === editState.item.id ? {...i,...formEdit} : i)} : r
    ));
    setEditState(null);
  };

  const deleteItem = (itemId: string, rutaId: string) => {
    const updated = rutas.map(r => r.id === rutaId ? {...r, items: (r.items||[]).filter(i => i.id !== itemId)} : r);
    onActualizarRutas(updated.filter(r => (r.items||[]).length > 0));
  };

  const startMove = (item: ItemRuta, rutaId: string) => {
    setMoveState({item, rutaId});
    setFormMove({taller:item.taller, celular:item.celular, direccion:item.direccion, sector:item.sector, detalle:item.detalle, servicio:item.servicio});
    setFechaDest('');
  };

  const confirmMove = () => {
    if (!moveState || !fechaDest) return;
    const origen = rutas.find(r => r.id === moveState.rutaId);
    if (!origen) return;
    let updated = rutas.map(r =>
      r.id === moveState.rutaId
        ? {...r, items: (r.items||[]).filter(i => i.id !== moveState.item.id)}
        : r
    );
    updated = updated.filter(r => (r.items||[]).length > 0);
    const itemMovido = {...moveState.item, ...formMove, id: Date.now().toString()};
    const dest = updated.find(r => r.fecha === fechaDest && r.transportistaId === origen.transportistaId);
    if (dest) {
      updated = updated.map(r => r.id === dest.id ? {...r, items: [...(r.items||[]), itemMovido]} : r);
    } else {
      updated = [...updated, {id: Date.now().toString()+'d', fecha: fechaDest, transportistaId: origen.transportistaId, items: [itemMovido]}];
    }
    onActualizarRutas(updated);
    setMoveState(null);
  };

  return (
    <div className="h-full w-full flex flex-col bg-transparent p-4 md:p-8 overflow-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onVolver} className="h-10 w-10 rounded-xl bg-white border-2 border-slate-200 hover:border-pink-400 flex items-center justify-center text-slate-500 hover:text-pink-600 transition-all flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/></svg>
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900">Registro de Transportes</h1>
            <p className="text-slate-400 text-sm mt-1">{fmt(fecha)}</p>
          </div>
        </div>
        <button onClick={()=>{setTSeleccionado('');setFormNuevo({...VACIO});setModalAgregar(true);}}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm whitespace-nowrap">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
          Agregar ruta
        </button>
      </div>

      {tDelDia.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-700 text-white">
              <th className="text-left px-4 py-3.5 font-bold w-52">Taller</th>
              <th className="text-left px-4 py-3.5 font-bold w-32">Celular</th>
              <th className="text-left px-4 py-3.5 font-bold w-64">Dirección</th>
              <th className="text-left px-4 py-3.5 font-bold w-32">Sector</th>
              <th className="text-left px-4 py-3.5 font-bold">Detalle</th>
              <th className="text-left px-4 py-3.5 font-bold w-28">Servicio</th>
              <th className="text-left px-4 py-3.5 font-bold w-28">Acciones</th>
            </tr></thead>
            <tbody><tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">No hay registros para este día</td></tr></tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-6">
          {tDelDia.map(t => {
            const ruta = getRuta(t.id);
            return (
              <TablaTransportista key={t.id} transportista={t} items={ruta?.items||[]}
                onAdd={item => addItem(t.id, item)}
                onEdit={item => startEdit(item, ruta!.id)}
                onDelete={id => deleteItem(id, ruta!.id)}
                onMove={item => startMove(item, ruta!.id)}
              />
            );
          })}
        </div>
      )}

      {modalAgregar && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Agregar ruta</h2>
              <CloseBtn onClick={()=>setModalAgregar(false)}/>
            </div>
            <select value={tSeleccionado} onChange={e=>setTSeleccionado(e.target.value)} className={ic+' bg-white'}>
              <option value="">Seleccionar transportista</option>
              {transportistas.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
            <FormItem form={formNuevo} onChange={setFormNuevo}/>
            <div className="flex gap-2">
              <button onClick={handleAgregar} disabled={!tSeleccionado || !formNuevo.taller.trim()}
                className="flex-1 bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">Agregar</button>
              <button onClick={()=>setModalAgregar(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {editState && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Editar registro</h2>
              <CloseBtn onClick={()=>setEditState(null)}/>
            </div>
            <FormItem form={formEdit} onChange={setFormEdit}/>
            <div className="flex gap-2">
              <button onClick={saveEdit} className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">Guardar</button>
              <button onClick={()=>setEditState(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {moveState && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Mover transporte</h2>
              <CloseBtn onClick={()=>setMoveState(null)}/>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-slate-500 font-semibold">Mover al día</p>
              <input type="date" value={fechaDest} onChange={e=>setFechaDest(e.target.value)} className={ic}/>
            </div>
            <FormItem form={formMove} onChange={setFormMove}/>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={confirmMove}
                disabled={!fechaDest}
                className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">Mover</button>
              <button type="button" onClick={()=>setMoveState(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistroTransportesView;
