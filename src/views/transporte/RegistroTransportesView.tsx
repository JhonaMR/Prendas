import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import api from '../../services/api';

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
  const [talleres, setTalleres] = useState<TallerRegistrado[]>([]);

  useEffect(() => {
    (api as any).getTalleres().then((data: TallerRegistrado[]) => setTalleres(data));
  }, []);

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
      <textarea placeholder="Detalle" value={form.detalle} onChange={e=>onChange({...form,detalle:e.target.value})} rows={3} className={ic+' resize-none'}/>
      <input type="text" placeholder="Servicio"  value={form.servicio}  onChange={e=>onChange({...form,servicio:e.target.value})}  className={ic}/>
    </div>
  );
};

interface TablaProps {
  transportista: Transportista;
  items: ItemRuta[];
  fecha: string;
  onAdd: (item: ItemRuta) => void;
  onEdit: (item: ItemRuta) => void;
  onDelete: (id: string) => void;
  onMove: (item: ItemRuta) => void;
}

const TablaTransportista: React.FC<TablaProps> = ({transportista, items, onAdd, onEdit, onDelete, onMove, fecha}) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<ItemRuta,'id'>>({...VACIO});
  const c = COLORES[transportista.colorKey] || COLORES['red'];

  const exportarRutaPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pw = doc.internal.pageSize.getWidth();

    // Título
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Ruta de Transporte', pw / 2, 50, { align: 'center' });

    // Transportista y fecha
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(transportista.nombre, pw / 2, 72, { align: 'center' });
    doc.text(fecha ? fmt(fecha) : '', pw / 2, 90, { align: 'center' });

    // Tabla
    const margin = 30;
    const tableW = pw - margin * 2;
    // Proporciones relativas a los anchos de la tabla visual
    const colRatios = [0.18, 0.11, 0.24, 0.11, 0.22, 0.10, 0.04];
    const colWidths = colRatios.map(r => r * tableW);
    const headers = ['Taller', 'Celular', 'Dirección', 'Sector', 'Detalle', 'Servicio', '#'];
    const headerH = 32;
    const rowH = 24;
    let y = 110;

    // Cabecera
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    let x = margin;
    headers.forEach((h, i) => {
      // fill gris oscuro
      doc.setFillColor(71, 85, 105);
      doc.setDrawColor(100, 116, 139);
      doc.rect(x, y, colWidths[i], headerH, 'FD');
      // texto blanco encima
      doc.setTextColor(255, 255, 255);
      doc.text(h, x + colWidths[i] / 2, y + headerH / 2 + 4, { align: 'center' });
      x += colWidths[i];
    });
    y += headerH;

    // Filas
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setDrawColor(148, 163, 184); // slate-400

    if (items.length === 0) {
      doc.setFillColor(248, 250, 252);
      doc.setTextColor(100, 116, 139);
      doc.rect(margin, y, tableW, rowH, 'FD');
      doc.text('Sin registros', pw / 2, y + rowH / 2 + 4, { align: 'center' });
    } else {
      items.forEach((item, idx) => {
        const fill = idx % 2 === 0 ? [255, 255, 255] : [241, 245, 249] as [number,number,number];
        x = margin;
        const vals = [item.taller||'—', item.celular||'—', item.direccion||'—', item.sector||'—', item.detalle||'—', item.servicio||'—', String(idx+1)];
        vals.forEach((v, i) => {
          doc.setFillColor(fill[0], fill[1], fill[2]);
          doc.setDrawColor(148, 163, 184);
          doc.rect(x, y, colWidths[i], rowH, 'FD');
          doc.setTextColor(30, 41, 59);
          const maxChars = Math.floor(colWidths[i] / 6.5);
          const txt = v.length > maxChars ? v.substring(0, maxChars - 1) + '…' : v;
          doc.text(txt, x + colWidths[i] / 2, y + rowH / 2 + 4, { align: 'center' });
          x += colWidths[i];
        });
        y += rowH;
      });
    }

    doc.save(`ruta-${transportista.nombre.replace(/\s+/g,'-')}-${fecha||'sin-fecha'}.pdf`);
  };

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
        <div className="flex items-center gap-2">
          <button onClick={exportarRutaPDF}
            className="flex items-center gap-1.5 text-xs font-bold bg-white/70 hover:bg-white px-3 py-1.5 rounded-lg transition-colors text-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12M12 16.5V3"/></svg>
            Exportar ruta
          </button>
          <button onClick={()=>{setForm({...VACIO});setOpen(true);}}
            className="flex items-center gap-1.5 text-xs font-bold bg-white/70 hover:bg-white px-3 py-1.5 rounded-lg transition-colors text-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
            Agregar registro
          </button>
        </div>
      </div>
      <div className="overflow-x-auto bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-700 text-white">
              <th className="text-left px-4 py-3 font-bold w-56 border-r border-slate-600">Taller</th>
              <th className="text-left px-4 py-3 font-bold w-36 border-r border-slate-600">Celular</th>
              <th className="text-left px-4 py-3 font-bold w-80 border-r border-slate-600">Dirección</th>
              <th className="text-left px-4 py-3 font-bold w-36 border-r border-slate-600">Sector</th>
              <th className="text-left px-4 py-3 font-bold w-72 border-r border-slate-600">Detalle</th>
              <th className="text-left px-4 py-3 font-bold w-32 border-r border-slate-600">Servicio</th>
              <th className="text-center px-4 py-3 font-bold w-28">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0
              ? <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-sm">Sin registros</td></tr>
              : items.map((item, idx) => (
                <tr key={item.id} className={idx%2===0?'bg-white':'bg-slate-50'}>
                  <td className="px-4 py-3 font-semibold text-slate-900 border-r border-slate-100">{item.taller||'—'}</td>
                  <td className="px-4 py-3 text-slate-600 border-r border-slate-100">{item.celular||'—'}</td>
                  <td className="px-4 py-3 text-slate-600 border-r border-slate-100">{item.direccion||'—'}</td>
                  <td className="px-4 py-3 text-slate-600 border-r border-slate-100">{item.sector||'—'}</td>
                  <td className="px-4 py-3 text-slate-600 border-r border-slate-100">{item.detalle||'—'}</td>
                  <td className="px-4 py-3 text-slate-600 border-r border-slate-100">{item.servicio||'—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
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
  const [tDestSeleccionado, setTDestSeleccionado] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (modalAgregar) { setModalAgregar(false); return; }
      if (editState)    { setEditState(null);      return; }
      if (moveState)    { setMoveState(null);       return; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modalAgregar, editState, moveState]);

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
    const origen = rutas.find(r => r.id === rutaId);
    setMoveState({item, rutaId});
    setFormMove({taller:item.taller, celular:item.celular, direccion:item.direccion, sector:item.sector, detalle:item.detalle, servicio:item.servicio});
    setFechaDest(origen?.fecha || fecha); // precarga la fecha actual de la ruta
    setTDestSeleccionado(origen?.transportistaId || '');
  };

  const confirmMove = () => {
    if (!moveState || !fechaDest || !tDestSeleccionado) return;
    let updated = rutas.map(r =>
      r.id === moveState.rutaId
        ? {...r, items: (r.items||[]).filter(i => i.id !== moveState.item.id)}
        : r
    );
    updated = updated.filter(r => (r.items||[]).length > 0);
    const itemMovido = {...moveState.item, ...formMove, id: Date.now().toString()};
    const dest = updated.find(r => r.fecha === fechaDest && r.transportistaId === tDestSeleccionado);
    if (dest) {
      updated = updated.map(r => r.id === dest.id ? {...r, items: [...(r.items||[]), itemMovido]} : r);
    } else {
      updated = [...updated, {id: Date.now().toString()+'d', fecha: fechaDest, transportistaId: tDestSeleccionado, items: [itemMovido]}];
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
              <th className="text-left px-4 py-3.5 font-bold w-56 border-r border-slate-600">Taller</th>
              <th className="text-left px-4 py-3.5 font-bold w-36 border-r border-slate-600">Celular</th>
              <th className="text-left px-4 py-3.5 font-bold w-80 border-r border-slate-600">Dirección</th>
              <th className="text-left px-4 py-3.5 font-bold w-36 border-r border-slate-600">Sector</th>
              <th className="text-left px-4 py-3.5 font-bold w-72 border-r border-slate-600">Detalle</th>
              <th className="text-left px-4 py-3.5 font-bold w-32 border-r border-slate-600">Servicio</th>
              <th className="text-center px-4 py-3.5 font-bold w-28">Acciones</th>
            </tr></thead>
            <tbody><tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">No hay registros para este día</td></tr></tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-6">
          {tDelDia.map(t => {
            const ruta = getRuta(t.id);
            return (
              <TablaTransportista key={t.id} transportista={t} items={ruta?.items||[]} fecha={fecha}
                onAdd={item => addItem(t.id, item)}
                onEdit={item => startEdit(item, ruta!.id)}
                onDelete={id => deleteItem(id, ruta!.id)}
                onMove={item => startMove(item, ruta!.id)}
              />
            );
          })}
        </div>
      )}

      {modalAgregar && (() => {
        const tActual = transportistas.find(t => t.id === tSeleccionado);
        const c = tActual ? (COLORES[tActual.colorKey] || COLORES['red']) : null;
        const gradients: Record<string,string> = {
          red:    'from-red-500 to-rose-600',
          green:  'from-green-500 to-emerald-600',
          blue:   'from-blue-500 to-indigo-600',
          yellow: 'from-yellow-400 to-amber-500',
          purple: 'from-purple-500 to-violet-600',
          orange: 'from-orange-400 to-orange-600',
          pink:   'from-pink-500 to-fuchsia-600',
        };
        const grad = tActual ? (gradients[tActual.colorKey] || gradients['pink']) : 'from-pink-500 to-fuchsia-600';
        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
              {/* Header con gradiente */}
              <div className={`bg-gradient-to-br ${grad} px-6 pt-6 pb-8 relative`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Nueva ruta</p>
                    <h2 className="text-2xl font-black text-white">Agregar ruta</h2>
                    {tActual && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 rounded-full bg-white/80"/>
                        <span className="text-white/90 text-sm font-semibold">{tActual.nombre}</span>
                      </div>
                    )}
                  </div>
                  <button onClick={()=>setModalAgregar(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                {/* Decoración */}
                <div className="absolute -bottom-4 left-0 right-0 h-8 bg-white rounded-t-3xl"/>
              </div>

              {/* Contenido */}
              <div className="px-6 pt-2 pb-6 flex flex-col gap-4">
                {/* Selector transportista */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Transportista</label>
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/>
                    </svg>
                    <select value={tSeleccionado} onChange={e=>setTSeleccionado(e.target.value)}
                      className={`${ic} pl-9 bg-white ${c ? `border-2 ${c.border} ${c.bg}` : ''}`}>
                      <option value="">Seleccionar transportista...</option>
                      {transportistas.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                    </select>
                  </div>
                </div>

                {/* Separador */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-100"/>
                  <span className="text-xs text-slate-400 font-semibold">Datos del registro</span>
                  <div className="flex-1 h-px bg-slate-100"/>
                </div>

                <FormItem form={formNuevo} onChange={setFormNuevo}/>

                {/* Botones */}
                <div className="flex gap-2 pt-1">
                  <button onClick={handleAgregar} disabled={!tSeleccionado || !formNuevo.taller.trim()}
                    className={`flex-1 bg-gradient-to-r ${grad} disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-2xl text-sm transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}>
                    Agregar ruta
                  </button>
                  <button onClick={()=>setModalAgregar(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-2xl text-sm transition-colors">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {editState && (() => {
        const rutaEdit = rutas.find(r => r.id === editState.rutaId);
        const tEdit = rutaEdit ? transportistas.find(t => t.id === rutaEdit.transportistaId) : null;
        const gradients: Record<string,string> = {
          red:    'from-red-500 to-rose-600',
          green:  'from-green-500 to-emerald-600',
          blue:   'from-blue-500 to-indigo-600',
          yellow: 'from-yellow-400 to-amber-500',
          purple: 'from-purple-500 to-violet-600',
          orange: 'from-orange-400 to-orange-600',
          pink:   'from-pink-500 to-fuchsia-600',
        };
        const grad = tEdit ? (gradients[tEdit.colorKey] || gradients['pink']) : 'from-pink-500 to-fuchsia-600';
        const c = tEdit ? (COLORES[tEdit.colorKey] || COLORES['red']) : null;
        void c;
        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
              <div className={`bg-gradient-to-br ${grad} px-6 pt-6 pb-8 relative`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Modificar registro</p>
                    <h2 className="text-2xl font-black text-white">Editar registro</h2>
                    {tEdit && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 rounded-full bg-white/80"/>
                        <span className="text-white/90 text-sm font-semibold">{tEdit.nombre}</span>
                      </div>
                    )}
                  </div>
                  <button onClick={()=>setEditState(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div className="absolute -bottom-4 left-0 right-0 h-8 bg-white rounded-t-3xl"/>
              </div>
              <div className="px-6 pt-6 pb-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-100"/>
                  <span className="text-xs text-slate-400 font-semibold">Datos del registro</span>
                  <div className="flex-1 h-px bg-slate-100"/>
                </div>
                <FormItem form={formEdit} onChange={setFormEdit}/>
                <div className="flex gap-2 pt-1">
                  <button onClick={saveEdit}
                    className={`flex-1 bg-gradient-to-r ${grad} text-white font-bold py-3 rounded-2xl text-sm transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}>
                    Guardar
                  </button>
                  <button onClick={()=>setEditState(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-2xl text-sm transition-colors">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {moveState && (() => {
        const rutaOrigen = rutas.find(r => r.id === moveState.rutaId);
        void rutaOrigen; // origen disponible si se necesita en el futuro
        const gradients: Record<string,string> = {
          red:    'from-red-500 to-rose-600',
          green:  'from-green-500 to-emerald-600',
          blue:   'from-blue-500 to-indigo-600',
          yellow: 'from-yellow-400 to-amber-500',
          purple: 'from-purple-500 to-violet-600',
          orange: 'from-orange-400 to-orange-600',
          pink:   'from-pink-500 to-fuchsia-600',
        };
        // El gradiente y color reaccionan al transportista destino seleccionado
        const tDest = transportistas.find(t => t.id === tDestSeleccionado);
        const grad = tDest ? (gradients[tDest.colorKey] || gradients['orange']) : 'from-amber-400 to-orange-500';
        const c = tDest ? (COLORES[tDest.colorKey] || COLORES['red']) : null;
        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
              {/* Header */}
              <div className={`bg-gradient-to-br ${grad} px-6 pt-6 pb-8 relative transition-all duration-300`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Reasignar registro</p>
                    <h2 className="text-2xl font-black text-white">Mover transporte</h2>
                    {tDest && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 rounded-full bg-white/80"/>
                        <span className="text-white/90 text-sm font-semibold">{tDest.nombre}</span>
                      </div>
                    )}
                  </div>
                  <button onClick={()=>setMoveState(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div className="absolute -bottom-4 left-0 right-0 h-8 bg-white rounded-t-3xl"/>
              </div>

              {/* Contenido */}
              <div className="px-6 pt-2 pb-6 flex flex-col gap-4">

                {/* Fila fecha + transportista */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mover al día</label>
                    <div className="relative">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/>
                      </svg>
                      <input type="date" value={fechaDest} onChange={e=>setFechaDest(e.target.value)}
                        className={`${ic} pl-9 ${c ? `${c.border} ${c.bg}` : ''}`}/>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Transportista</label>
                    <div className="relative">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/>
                      </svg>
                      <select value={tDestSeleccionado} onChange={e=>setTDestSeleccionado(e.target.value)}
                        className={`${ic} pl-9 bg-white ${c ? `${c.border} ${c.bg}` : ''}`}>
                        <option value="">Seleccionar...</option>
                        {transportistas.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Separador */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-100"/>
                  <span className="text-xs text-slate-400 font-semibold">Datos del registro</span>
                  <div className="flex-1 h-px bg-slate-100"/>
                </div>

                <FormItem form={formMove} onChange={setFormMove}/>

                {/* Botones */}
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={confirmMove} disabled={!fechaDest || !tDestSeleccionado}
                    className={`flex-1 bg-gradient-to-r ${grad} disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-2xl text-sm transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}>
                    Mover
                  </button>
                  <button type="button" onClick={()=>setMoveState(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-2xl text-sm transition-colors">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default RegistroTransportesView;
