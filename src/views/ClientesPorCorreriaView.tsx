import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useDarkMode } from "../context/DarkModeContext";
import { Order, Client, Correria, Seller } from "../types";
import { api } from "../services/api";

interface ClientesPorCorreriaViewProps {
  orders: Order[];
  clients: Client[];
  correrias: Correria[];
  sellers: Seller[];
}

interface NoteState {
  contacto: string;
  novedad: string;
}

// Map orderId -> NoteState (lo que hay en BD)
type NotesMap = Record<string, NoteState>;
// Map orderId -> NoteState (ediciones locales pendientes)
type DirtyMap = Record<string, NoteState>;

function formatFecha(val: string | null | undefined): string {
  if (!val || val === "-") return "-";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return val; }
}

function primerNombre(nombre: string): string {
  return nombre.trim().split(/\s+/)[0];
}

function getFinDespachoClasses(endDate: string | null | undefined, isDark: boolean): string {
  if (!endDate) return "";
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const fin = new Date(endDate); fin.setHours(0,0,0,0);
  const diff = Math.ceil((fin.getTime() - hoy.getTime()) / 86400000);
  if (diff < 0)   return isDark ? "bg-red-900/50 text-red-300"    : "bg-red-100 text-red-700";
  if (diff <= 8)  return isDark ? "bg-amber-900/50 text-amber-300" : "bg-amber-100 text-amber-700";
  return isDark ? "bg-emerald-900/40 text-emerald-300" : "bg-emerald-100 text-emerald-700";
}

function getInicioClasses(isDark: boolean): string {
  return isDark ? "bg-sky-900/40 text-sky-300" : "bg-sky-100 text-sky-700";
}

// Tooltip de novedad
const NovedadCell: React.FC<{ orderId: string; value: string; isDark: boolean; onChange: (orderId: string, field: "contacto" | "novedad", value: string) => void }> = ({ orderId, value, isDark, onChange }) => {
  const [editing, setEditing] = useState(false);
  const [show, setShow] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLTableCellElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const handleMouseEnter = () => {
    if (!value || editing) return;
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX });
    }
    setShow(true);
  };

  if (editing) {
    return (
      <td className="px-2 py-1.5 whitespace-nowrap">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(orderId, "novedad", e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") setEditing(false); }}
          className={`w-full px-2 py-1 rounded-lg border text-xs font-medium focus:outline-none ${
            isDark ? "bg-[#3d2d52] border-violet-500 text-violet-100" : "bg-white border-violet-400 text-slate-700"
          }`}
          style={{ minWidth: 140 }}
        />
      </td>
    );
  }

  return (
    <td
      ref={ref}
      onClick={() => setEditing(true)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
      className={`px-3 py-2.5 text-sm whitespace-nowrap max-w-[140px] truncate cursor-pointer group ${
        value
          ? isDark ? "text-amber-300" : "text-amber-700"
          : isDark ? "text-violet-600" : "text-slate-300"
      }`}
    >
      <span className={`truncate block ${!value ? "italic text-xs" : ""}`}>{value || "—"}</span>
      {show && value && (
        <div
          style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999, maxWidth: 320 }}
          className={`px-3 py-2 rounded-xl shadow-xl border text-xs leading-relaxed pointer-events-none ${
            isDark ? "bg-[#2d1f42] border-violet-700 text-violet-100" : "bg-white border-slate-200 text-slate-700"
          }`}
        >
          {value}
        </div>
      )}
    </td>
  );
};

// Input editable inline para contacto/novedad
interface EditableCellProps {
  orderId: string;
  field: "contacto" | "novedad";
  value: string;
  isDark: boolean;
  onChange: (orderId: string, field: "contacto" | "novedad", value: string) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({ orderId, field, value, isDark, onChange }) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const baseClass = `px-3 py-2.5 text-sm whitespace-nowrap max-w-[160px] cursor-pointer group`;
  const textClass = value
    ? isDark ? "text-violet-100" : "text-slate-700"
    : isDark ? "text-violet-600" : "text-slate-300";

  if (editing) {
    return (
      <td className={`px-2 py-1.5 whitespace-nowrap`}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(orderId, field, e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") setEditing(false); }}
          className={`w-full px-2 py-1 rounded-lg border text-xs font-medium focus:outline-none ${
            isDark
              ? "bg-[#3d2d52] border-violet-500 text-violet-100"
              : "bg-white border-violet-400 text-slate-700"
          }`}
          style={{ minWidth: 120 }}
        />
      </td>
    );
  }

  return (
    <td className={`${baseClass} ${textClass}`} onClick={() => setEditing(true)}>
      <span className={`truncate block ${!value ? "italic text-xs" : ""}`}>
        {value || "—"}
      </span>
      <span className={`absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-60 transition-opacity text-xs ${
        isDark ? "text-violet-400" : "text-slate-400"
      }`}>✎</span>
    </td>
  );
};

// Autocomplete input
interface AutocompleteInputProps {
  value: string;
  onChange: (v: string) => void;
  suggestions: string[];
  placeholder: string;
  isDark: boolean;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ value, onChange, suggestions, placeholder, isDark }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const filtered = value.length >= 2 ? suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase())) : [];

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { onChange(e.target.value); setOpen(e.target.value.length >= 2); }}
        onFocus={() => value.length >= 2 && setOpen(true)}
        className={`w-full px-3 py-2 rounded-xl border-2 text-sm font-medium focus:outline-none transition-all ${
          isDark
            ? "bg-[#4a3a63] border-violet-600 text-violet-100 placeholder-violet-400 focus:border-violet-400"
            : "bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-violet-400"
        }`}
      />
      {open && filtered.length > 0 && (
        <ul className={`absolute z-50 top-full mt-1 left-0 right-0 rounded-xl border shadow-lg overflow-hidden ${
          isDark ? "bg-[#3d2d52] border-violet-700" : "bg-white border-slate-200"
        }`}>
          {filtered.map(s => (
            <li key={s} onMouseDown={() => { onChange(s); setOpen(false); }}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                isDark ? "text-violet-100 hover:bg-violet-800/60" : "text-slate-700 hover:bg-violet-50"
              }`}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ClientesPorCorreriaView: React.FC<ClientesPorCorreriaViewProps> = ({ orders, clients, correrias, sellers }) => {
  const { isDark } = useDarkMode();
  const [search, setSearch] = useState("");
  const [vendedorFiltro, setVendedorFiltro] = useState("Todos");
  const [ciudadFiltro, setCiudadFiltro] = useState("");
  const [correriaNombre, setCorreriaNombre] = useState("");
  const [anioFiltro, setAnioFiltro] = useState("");

  // Notas: lo que hay en BD
  const [notesMap, setNotesMap] = useState<NotesMap>({});
  // Ediciones locales pendientes
  const [dirtyMap, setDirtyMap] = useState<DirtyMap>({});
  const [saving, setSaving] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const hasDirty = Object.keys(dirtyMap).length > 0;

  // Mapas lookup
  const clientMap = useMemo(() => { const m = new Map<string, Client>(); clients.forEach(c => m.set(c.id, c)); return m; }, [clients]);
  const sellerMap = useMemo(() => { const m = new Map<string, Seller>(); sellers.forEach(s => m.set(s.id, s)); return m; }, [sellers]);

  const correriaSuggestions = useMemo(() => Array.from(new Set(correrias.map(c => c.name))).sort(), [correrias]);
  const anioSuggestions = useMemo(() => Array.from(new Set(correrias.map(c => c.year))).sort((a, b) => String(b).localeCompare(String(a))), [correrias]);

  const correriaSeleccionada = useMemo(() => {
    if (!correriaNombre) return null;
    return correrias.find(c => {
      const matchNombre = c.name.toLowerCase().includes(correriaNombre.toLowerCase());
      const matchAnio = anioFiltro ? c.year === anioFiltro : true;
      return matchNombre && matchAnio;
    }) || null;
  }, [correrias, correriaNombre, anioFiltro]);

  const vendedoresUnicos = useMemo(() => {
    const nombres = Array.from(new Set(sellers.map(s => primerNombre(s.name)))).sort();
    return ["Todos", ...nombres];
  }, [sellers]);

  const ciudadesUnicas = useMemo(() => {
    if (!correriaSeleccionada) return [];
    const pedidos = orders.filter(o => o.correriaId === correriaSeleccionada.id);
    const ciudades = pedidos
      .map(o => clientMap.get(o.clientId)?.city)
      .filter((c): c is string => !!c);
    return Array.from(new Set(ciudades)).sort();
  }, [orders, correriaSeleccionada, clientMap]);

  const rows = useMemo(() => {
    if (!correriaSeleccionada) return [];
    return orders
      .filter(o => o.correriaId === correriaSeleccionada.id)
      .map(o => ({ order: o, client: clientMap.get(o.clientId), seller: sellerMap.get(o.sellerId) }))
      .filter(({ client, seller }) => {
        const matchSearch = search === "" ||
          (client?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (client?.city ?? "").toLowerCase().includes(search.toLowerCase());
        const matchVendedor = vendedorFiltro === "Todos" || primerNombre(seller?.name ?? "") === vendedorFiltro;
        const matchCiudad = ciudadFiltro === "" || (client?.city ?? "") === ciudadFiltro;
        return matchSearch && matchVendedor && matchCiudad;
      })
      .sort((a, b) => (a.order.orderNumber ?? 0) - (b.order.orderNumber ?? 0));
  }, [orders, correriaSeleccionada, clientMap, sellerMap, search, vendedorFiltro, ciudadFiltro]);

  // Porcentajes OF y RM para la correría completa (todos los pedidos, sin filtros de búsqueda)
  const porcentajesCorreria = useMemo(() => {
    if (!correriaSeleccionada) return null;
    const pedidosCorreria = orders.filter(o => o.correriaId === correriaSeleccionada.id);
    if (pedidosCorreria.length === 0) return null;
    let sumOf = 0, sumRm = 0, count = 0;
    pedidosCorreria.forEach(o => {
      const of = o.porcentajeOficial ?? 0;
      const rm = o.porcentajeRemision ?? 0;
      sumOf += of;
      sumRm += rm;
      count++;
    });
    const totalOf = Math.round(sumOf / count);
    const totalRm = Math.round(sumRm / count);
    return { of: totalOf, rm: totalRm };
  }, [orders, correriaSeleccionada]);

  // Cargar notas cuando cambia la correría
  useEffect(() => {
    if (!correriaSeleccionada || rows.length === 0) { setNotesMap({}); setDirtyMap({}); return; }
    const orderIds = rows.map(r => r.order.id);
    setLoadingNotes(true);
    api.getOrderNotes(orderIds).then(data => {
      const m: NotesMap = {};
      data.forEach(n => { m[n.order_id] = { contacto: n.contacto || "", novedad: n.novedad || "" }; });
      setNotesMap(m);
      setDirtyMap({});
    }).catch(() => {}).finally(() => setLoadingNotes(false));
  }, [correriaSeleccionada?.id, rows.length]);

  // Aviso antes de salir si hay cambios sin guardar
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (hasDirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasDirty]);

  const handleCellChange = useCallback((orderId: string, field: "contacto" | "novedad", value: string) => {
    setDirtyMap(prev => ({
      ...prev,
      [orderId]: { ...(prev[orderId] ?? notesMap[orderId] ?? { contacto: "", novedad: "" }), [field]: value }
    }));
  }, [notesMap]);

  // Obtener valor actual (dirty tiene prioridad sobre BD)
  const getVal = (orderId: string, field: "contacto" | "novedad"): string => {
    if (dirtyMap[orderId]) return dirtyMap[orderId][field];
    return notesMap[orderId]?.[field] ?? "";
  };

  const handleSave = async () => {
    if (!hasDirty) return;
    setSaving(true);
    try {
      const notes = Object.entries(dirtyMap).map(([orderId, n]) => ({
        orderId,
        contacto: (n as NoteState).contacto,
        novedad: (n as NoteState).novedad
      }));
      const res = await api.batchUpsertOrderNotes(notes);
      if (res.success) {
        // Merge dirty → notesMap
        setNotesMap(prev => {
          const next = { ...prev };
          Object.entries(dirtyMap).forEach(([id, n]) => { next[id] = n as NoteState; });
          return next;
        });
        setDirtyMap({});
      } else {
        alert("Error al guardar: " + res.message);
      }
    } catch {
      alert("Error de conexión al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    if (window.confirm("¿Descartar todos los cambios sin guardar?")) setDirtyMap({});
  };

  const thClass = `px-3 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap ${isDark ? "text-violet-300 bg-[#3d2d52]" : "text-slate-500 bg-slate-50"}`;
  const tdClass = `px-3 py-2.5 text-sm whitespace-nowrap ${isDark ? "text-violet-100" : "text-slate-700"}`;
  const rowClass = (i: number) => `border-b transition-colors relative ${isDark
    ? i % 2 === 0 ? "bg-[#4a3a63] border-violet-800 hover:bg-violet-900/40" : "bg-[#3d2d52] border-violet-800 hover:bg-violet-900/40"
    : i % 2 === 0 ? "bg-white border-slate-100 hover:bg-pink-50/40" : "bg-slate-50/60 border-slate-100 hover:bg-pink-50/40"}`;

  return (
    <div className={`h-full w-full flex flex-col p-3 md:p-4 overflow-auto pb-10 transition-colors duration-300 ${isDark ? "bg-[#3d2d52]" : "bg-transparent"}`}>

      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className={`text-2xl md:text-3xl font-black transition-colors duration-300 ${isDark ? "text-violet-50" : "text-violet-900"}`}>
            Clientes por Correría
          </h1>
          <p className={`text-sm mt-0.5 transition-colors duration-300 ${isDark ? "text-violet-300" : "text-slate-400"}`}>
            {correriaSeleccionada
              ? `${correriaSeleccionada.name} · ${correriaSeleccionada.year} · ${rows.length} pedido${rows.length !== 1 ? "s" : ""}`
              : "Selecciona una correría para ver los pedidos"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-48">
            <AutocompleteInput value={correriaNombre} onChange={v => { setCorreriaNombre(v); setDirtyMap({}); }} suggestions={correriaSuggestions} placeholder="Correría..." isDark={isDark} />
          </div>
          <div className="w-28">
            <AutocompleteInput value={anioFiltro} onChange={setAnioFiltro} suggestions={anioSuggestions} placeholder="Año..." isDark={isDark} />
          </div>
        </div>
      </div>

      {/* Barra de cambios sin guardar */}
      {hasDirty && (
        <div className={`mb-3 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border-2 ${
          isDark ? "bg-amber-900/30 border-amber-700" : "bg-amber-50 border-amber-300"
        }`}>
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-amber-400" : "text-amber-600"}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <span className={`text-sm font-semibold ${isDark ? "text-amber-300" : "text-amber-700"}`}>
              Tienes {Object.keys(dirtyMap).length} cambio{Object.keys(dirtyMap).length !== 1 ? "s" : ""} sin guardar
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDiscardChanges} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              isDark ? "border-amber-700 text-amber-400 hover:bg-amber-900/40" : "border-amber-300 text-amber-600 hover:bg-amber-100"
            }`}>
              Descartar
            </button>
            <button onClick={handleSave} disabled={saving} className={`text-xs font-bold px-4 py-1.5 rounded-lg transition-colors ${
              isDark ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-amber-500 hover:bg-amber-600 text-white"
            } disabled:opacity-50`}>
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Buscador — flex-1 para tomar todo el espacio disponible */}
        <div className="relative flex-1 min-w-[160px]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-violet-400" : "text-slate-400"}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" placeholder="Buscar cliente, ciudad..." value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-xl border-2 text-sm font-medium focus:outline-none transition-all ${
              isDark ? "bg-[#4a3a63] border-violet-600 text-violet-100 placeholder-violet-400 focus:border-violet-400"
                     : "bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-violet-400"
            }`} />
        </div>

        {/* Filtro vendedor */}
        <select value={vendedorFiltro} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVendedorFiltro(e.target.value)}
          className={`appearance-none font-semibold rounded-xl px-4 py-2 border-2 text-sm focus:outline-none cursor-pointer transition-all ${
            isDark ? "bg-[#4a3a63] border-violet-600 text-violet-100 focus:border-violet-400"
                   : "bg-white border-slate-200 text-slate-700 focus:border-violet-400"
          }`}>
          {vendedoresUnicos.map(v => <option key={v} value={v}>{v === "Todos" ? "Todos los vendedores" : v}</option>)}
        </select>

        {/* Filtro ciudad */}
        <select value={ciudadFiltro} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCiudadFiltro(e.target.value)}
          className={`appearance-none font-semibold rounded-xl px-4 py-2 border-2 text-sm focus:outline-none cursor-pointer transition-all ${
            isDark ? "bg-[#4a3a63] border-violet-600 text-violet-100 focus:border-violet-400"
                   : "bg-white border-slate-200 text-slate-700 focus:border-violet-400"
          }`}>
          <option value="">Todas las ciudades</option>
          {ciudadesUnicas.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Contador */}
        <div className={`flex items-center px-4 py-2 rounded-xl border-2 text-sm font-bold ${
          isDark ? "bg-violet-900/30 border-violet-700 text-violet-300" : "bg-violet-50 border-violet-200 text-violet-600"
        }`}>
          {rows.length} pedido{rows.length !== 1 ? "s" : ""}
        </div>

        {/* Badges % OF y % RM — al extremo derecho */}
        {porcentajesCorreria && (
          <>
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-bold ${
              isDark ? "bg-orange-900/30 border-orange-700 text-orange-300" : "bg-orange-50 border-orange-200 text-orange-700"
            }`}>
              <span className={`text-xs font-semibold ${isDark ? "text-orange-400" : "text-orange-500"}`}>% OF</span>
              <span>{porcentajesCorreria.of}%</span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-bold ${
              isDark ? "bg-blue-900/30 border-blue-700 text-blue-300" : "bg-blue-50 border-blue-200 text-blue-700"
            }`}>
              <span className={`text-xs font-semibold ${isDark ? "text-blue-400" : "text-blue-500"}`}>% RM</span>
              <span>{porcentajesCorreria.rm}%</span>
            </div>
          </>
        )}
      </div>

      {/* Tabla */}
      <div className={`flex-1 rounded-2xl border overflow-hidden shadow-sm ${isDark ? "border-violet-700" : "border-slate-200"}`}>
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-230px)]">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className={thClass}>#</th>
                <th className={thClass}>Cliente</th>
                <th className={thClass}>Dirección</th>
                <th className={thClass}>Contacto</th>
                <th className={thClass}>Ciudad</th>
                <th className={`${thClass} text-center`}>OF %</th>
                <th className={`${thClass} text-center`}>ML %</th>
                <th className={thClass}>Cód. OF</th>
                <th className={thClass}>Cód. ML</th>
                <th className={thClass}>Vendedor</th>
                <th className={thClass}>Nov. Cliente</th>
                <th className={thClass}>Inicio Despacho</th>
                <th className={thClass}>Fin Despacho</th>
                <th className={thClass}>Fecha Ped.</th>
              </tr>
            </thead>
            <tbody>
              {!correriaSeleccionada ? (
                <tr><td colSpan={14} className={`text-center py-20 text-sm ${isDark ? "text-violet-500" : "text-slate-400"}`}>
                  <div className="flex flex-col items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 opacity-30">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25H12M3.75 3h16.5c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125H3.75A1.125 1.125 0 0 1 2.625 19.875V4.125C2.625 3.504 3.129 3 3.75 3Z" />
                    </svg>
                    <span>Escribe al menos 2 letras en el campo Correría para comenzar</span>
                  </div>
                </td></tr>
              ) : loadingNotes ? (
                <tr><td colSpan={14} className={`text-center py-16 text-sm ${isDark ? "text-violet-400" : "text-slate-400"}`}>Cargando notas...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={14} className={`text-center py-16 text-sm ${isDark ? "text-violet-400" : "text-slate-400"}`}>No hay pedidos para esta correría con los filtros aplicados.</td></tr>
              ) : (
                rows.map(({ order, client, seller }, i) => {
                  const isDirtyRow = !!dirtyMap[order.id];
                  return (
                    <tr key={order.id} className={`${rowClass(i)} ${isDirtyRow ? (isDark ? "ring-1 ring-inset ring-amber-700/60" : "ring-1 ring-inset ring-amber-300") : ""}`}>

                      {/* # */}
                      <td className={`${tdClass} font-bold ${isDark ? "text-violet-400" : "text-slate-400"}`}>
                        {order.orderNumber != null ? String(order.orderNumber).padStart(3, "0") : "-"}
                      </td>

                      {/* Cliente */}
                      <td className={`${tdClass} font-semibold max-w-[200px] truncate`} title={client?.name}>
                        {client?.name || <span className={isDark ? "text-violet-600" : "text-slate-300"}>-</span>}
                      </td>

                      {/* Dirección */}
                      <td className={`${tdClass} max-w-[180px] truncate ${isDark ? "text-violet-300" : "text-slate-500"}`} title={client?.address}>
                        {client?.address || "-"}
                      </td>

                      {/* Contacto — editable */}
                      <EditableCell orderId={order.id} field="contacto" value={getVal(order.id, "contacto")} isDark={isDark} onChange={handleCellChange} />

                      {/* Ciudad */}
                      <td className={`${tdClass} ${isDark ? "text-violet-100" : "text-slate-700"}`}>{client?.city || "-"}</td>

                      {/* OF % */}
                      <td className={`${tdClass} text-center`}>
                        {order.porcentajeOficial != null && order.porcentajeOficial > 0
                          ? <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold ${isDark ? "bg-orange-900/40 text-orange-300" : "bg-orange-100 text-orange-700"}`}>{order.porcentajeOficial}%</span>
                          : <span className={isDark ? "text-violet-600" : "text-slate-300"}>-</span>}
                      </td>

                      {/* ML % */}
                      <td className={`${tdClass} text-center`}>
                        {order.porcentajeRemision != null && order.porcentajeRemision > 0
                          ? <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold ${isDark ? "bg-blue-900/40 text-blue-300" : "bg-blue-100 text-blue-700"}`}>{order.porcentajeRemision}%</span>
                          : <span className={isDark ? "text-violet-600" : "text-slate-300"}>-</span>}
                      </td>

                      {/* Cód. OF */}
                      <td className={`${tdClass} font-mono text-xs ${isDark ? "text-violet-300" : "text-slate-500"}`}>{client?.codOf || "-"}</td>

                      {/* Cód. ML */}
                      <td className={`${tdClass} font-mono text-xs ${isDark ? "text-violet-300" : "text-slate-500"}`}>{client?.codRm || "-"}</td>

                      {/* Vendedor */}
                      <td className={tdClass}>
                        {seller
                          ? <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold ${isDark ? "bg-pink-900/40 text-pink-300" : "bg-pink-100 text-pink-700"}`}>{primerNombre(seller.name)}</span>
                          : <span className={isDark ? "text-violet-600" : "text-slate-300"}>-</span>}
                      </td>

                      {/* Nov. Cliente — editable + tooltip */}
                      <NovedadCell orderId={order.id} value={getVal(order.id, "novedad")} isDark={isDark} onChange={handleCellChange} />

                      {/* Inicio Despacho */}
                      <td className={tdClass}>
                        {order.startDate
                          ? <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-semibold ${getInicioClasses(isDark)}`}>{formatFecha(order.startDate)}</span>
                          : <span className={isDark ? "text-violet-600" : "text-slate-300"}>-</span>}
                      </td>

                      {/* Fin Despacho */}
                      <td className={tdClass}>
                        {order.endDate
                          ? <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-semibold ${getFinDespachoClasses(order.endDate, isDark)}`}>{formatFecha(order.endDate)}</span>
                          : <span className={isDark ? "text-violet-600" : "text-slate-300"}>-</span>}
                      </td>

                      {/* Fecha Ped. */}
                      <td className={`${tdClass} text-xs ${isDark ? "text-violet-300" : "text-slate-500"}`}>{formatFecha(order.createdAt)}</td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientesPorCorreriaView;
