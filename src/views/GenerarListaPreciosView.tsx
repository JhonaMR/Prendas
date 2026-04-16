// ============================================
// VISTA: Generar Lista de Precios + Pedido Manual
// ============================================

import React, { useState, useMemo } from 'react';
import { AppState } from '../types';
import ExcelJS from 'exceljs';
import api from '../services/api';
import CorreriaAutocomplete from '../components/shared/CorreriaAutocomplete';
import { exportOrderToExcel } from '../utils/exportOrderExcel';
import { useBrand } from '../hooks/useBrand';

interface Props {
    state: AppState;
    user: any;
    updateState: (u: (p: AppState) => AppState) => void;
    onNavigate: (view: string, params?: any) => void;
}

interface ItemRow {
    reference: string;
    description: string;
    salePrice: number | '';
    quantity: number | '';
}

const emptyRow = (): ItemRow => ({ reference: '', description: '', salePrice: '', quantity: '' });

const GenerarListaPreciosView: React.FC<Props> = ({ state, user, onNavigate, updateState }) => {
    const brand = useBrand();

    // ── Lista de precios ──
    const [generando, setGenerando] = useState(false);

    // ── Pedido manual ──
    const [clientSearch, setClientSearch] = useState('');
    const [showClientResults, setShowClientResults] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedClientInfo, setSelectedClientInfo] = useState<{ address: string; city: string } | null>(null);

    const [selectedSellerId, setSelectedSellerId] = useState('');
    const [selectedCorreriaId, setSelectedCorreriaId] = useState('');
    const [correriaSearch, setCorreriaSearch] = useState('');
    const [showCorreriaDropdown, setShowCorreriaDropdown] = useState(false);

    const [orderNumber, setOrderNumber] = useState<number | ''>('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [porcentajeOficial, setPorcentajeOficial] = useState<number | ''>('');
    const [porcentajeRemision, setPorcentajeRemision] = useState<number | ''>('');

    const [items, setItems] = useState<ItemRow[]>(Array.from({ length: 10 }, emptyRow));
    const [guardando, setGuardando] = useState(false);

    // ── Clientes filtrados ──
    const filteredClients = useMemo(() =>
        clientSearch.length > 0
            ? state.clients.filter(c =>
                c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                c.id.toLowerCase().includes(clientSearch.toLowerCase())
              )
            : [],
        [clientSearch, state.clients]
    );

    const selectClient = (c: any) => {
        setSelectedClientId(c.id);
        setClientSearch(`${c.id} - ${c.name}`);
        setSelectedClientInfo({ address: c.address || '', city: c.city || '' });
        // Auto-seleccionar vendedor del cliente
        if (c.sellerId) setSelectedSellerId(c.sellerId);
        setShowClientResults(false);
    };

    // ── Manejo de filas ──
    const updateItem = (idx: number, field: keyof ItemRow, value: string) => {
        setItems(prev => {
            const next = [...prev];
            if (field === 'reference') {
                const ref = state.references.find(r => r.id === value.trim().toUpperCase());
                next[idx] = {
                    ...next[idx],
                    reference: value.toUpperCase(),
                    description: value === '' ? '' : (ref?.description || next[idx].description),
                    salePrice: value === '' ? '' : (ref?.price ? Math.round(ref.price) : next[idx].salePrice),
                };
            } else if (field === 'salePrice') {
                next[idx] = { ...next[idx], salePrice: value === '' ? '' : Number(value) };
            } else if (field === 'quantity') {
                next[idx] = { ...next[idx], quantity: value === '' ? '' : Number(value) };
            } else {
                next[idx] = { ...next[idx], [field]: value };
            }
            return next;
        });
    };

    const addRow = () => setItems(prev => [...prev, emptyRow()]);

    const removeRow = (idx: number) =>
        setItems(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

    // ── Totales ──
    const filledItems = items.filter(i => i.reference && i.quantity && i.salePrice);
    const totalUnits = filledItems.reduce((a, b) => a + Number(b.quantity), 0);
    const totalValue = filledItems.reduce((a, b) => a + Number(b.salePrice) * Number(b.quantity), 0);

    // ── Guardar pedido ──
    const handleGuardar = async () => {
        if (!selectedClientId || !selectedSellerId || !selectedCorreriaId) {
            alert('Faltan campos obligatorios: Cliente, Vendedor o Campaña');
            return;
        }
        if (filledItems.length === 0) {
            alert('Agrega al menos una referencia con cantidad y precio');
            return;
        }
        if (porcentajeOficial === '' || porcentajeRemision === '') {
            alert('Ingresa los porcentajes de facturación (Oficial y Remisión)');
            return;
        }

        setGuardando(true);
        try {
            const newOrder: any = {
                id: Math.random().toString(36).substring(2, 11),
                clientId: selectedClientId,
                sellerId: selectedSellerId,
                correriaId: selectedCorreriaId,
                items: filledItems.map(i => ({
                    reference: i.reference,
                    quantity: Number(i.quantity),
                    salePrice: Number(i.salePrice),
                })),
                totalValue,
                createdAt: new Date().toLocaleString(),
                settledBy: user.name,
                orderNumber: orderNumber === '' ? undefined : orderNumber,
                startDate: startDate || null,
                endDate: endDate || null,
                porcentajeOficial: porcentajeOficial === '' ? null : porcentajeOficial,
                porcentajeRemision: porcentajeRemision === '' ? null : porcentajeRemision,
            };

            const result = await api.createOrder(newOrder);
            if (result.success) {
                updateState(prev => ({ ...prev, orders: [newOrder, ...prev.orders] }));
                alert('✅ Pedido guardado exitosamente');
                // Reset
                setSelectedClientId(''); setClientSearch('');
                setSelectedSellerId(''); setSelectedCorreriaId('');
                setOrderNumber(''); setStartDate(''); setEndDate('');
                setPorcentajeOficial(''); setPorcentajeRemision('');
                setItems(Array.from({ length: 10 }, emptyRow));
            } else {
                alert('❌ Error al guardar: ' + result.message);
            }
        } catch {
            alert('❌ Error de conexión');
        } finally {
            setGuardando(false);
        }
    };

    // ── Generar Excel pedido ──
    const handleGenerarPedido = async () => {
        if (!selectedClientId) { alert('Selecciona un cliente para generar el pedido'); return; }
        if (filledItems.length === 0) { alert('Agrega al menos una referencia con cantidad y precio'); return; }

        const client = state.clients.find(c => c.id === selectedClientId);
        const seller = state.sellers.find(s => s.id === selectedSellerId);

        const order: any = {
            id: Math.random().toString(36).substring(2, 11),
            clientId: selectedClientId,
            sellerId: selectedSellerId,
            correriaId: selectedCorreriaId,
            items: filledItems.map(i => ({
                reference: i.reference,
                quantity: Number(i.quantity),
                salePrice: Number(i.salePrice),
            })),
            totalValue,
            createdAt: new Date().toISOString(),
            settledBy: user.name,
            orderNumber: orderNumber === '' ? undefined : orderNumber,
            startDate: startDate || null,
            endDate: endDate || null,
            porcentajeOficial: porcentajeOficial === '' ? null : porcentajeOficial,
            porcentajeRemision: porcentajeRemision === '' ? null : porcentajeRemision,
        };

        await exportOrderToExcel(order, client, seller, state.references, brand.isMelas);
    };

    // ── Generar Excel lista de precios ──
    const handleGenerar = async () => {
        const fichas = (state.fichasCosto || []).filter(f => f.precioVenta > 0);
        if (fichas.length === 0) {
            alert('No hay fichas de costo con precio de venta para generar la lista.');
            return;
        }
        setGenerando(true);
        try {
            const año = new Date().getFullYear();
            const wb = new ExcelJS.Workbook();
            const ws = wb.addWorksheet('Lista de Precios');
            ws.getColumn(1).width = 20;
            ws.getColumn(2).width = 22;
            ws.getColumn(3).width = 40;

            ws.mergeCells('A1:C1');
            const tituloCell = ws.getCell('A1');
            tituloCell.value = `Lista de Precios ${año}`;
            tituloCell.font = { bold: true, size: 14, color: { argb: 'FF1E293B' } };
            tituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
            ws.getRow(1).height = 28;

            const headerRow = ws.getRow(2);
            headerRow.height = 22;
            ['REFERENCIA', 'PRECIO DE VENTA', 'DESCRIPCIÓN'].forEach((h, i) => {
                const cell = headerRow.getCell(i + 1);
                cell.value = h;
                cell.font = { bold: true, size: 11, color: { argb: 'FF475569' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
                    bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
                    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
                    right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
                };
            });

            const sorted = [...fichas].sort((a, b) =>
                a.referencia.localeCompare(b.referencia, undefined, { numeric: true, sensitivity: 'base' })
            );
            sorted.forEach((f, idx) => {
                const row = ws.getRow(3 + idx);
                row.height = 18;
                [f.referencia, f.precioVenta, f.descripcion || ''].forEach((v, i) => {
                    const cell = row.getCell(i + 1);
                    cell.value = v;
                    cell.font = { size: 10, color: { argb: 'FF1E293B' } };
                    cell.alignment = { horizontal: i === 1 ? 'right' : 'left', vertical: 'middle' };
                    if (i === 1) cell.numFmt = '_("$"* #,##0_);_("$"* (#,##0);_("$"* "-"_);_(@_)';
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FF64748B' } },
                        bottom: { style: 'thin', color: { argb: 'FF64748B' } },
                        left: { style: 'thin', color: { argb: 'FF64748B' } },
                        right: { style: 'thin', color: { argb: 'FF64748B' } },
                    };
                });
            });

            const buffer = await wb.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lista-precios-${año}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            alert('Error al generar el archivo Excel.');
        } finally {
            setGenerando(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => onNavigate('home')} className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Lista de Precios</h2>
                        <p className="text-slate-500 font-bold text-xs mt-1">{state.references?.length || 0} referencias</p>
                    </div>
                </div>
                <button onClick={handleGenerar} disabled={generando}
                    className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 uppercase tracking-wider text-xs disabled:opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    {generando ? 'Generando...' : 'Generar Lista de Precios'}
                </button>
            </div>

            {/* ── Formulario pedido manual ── */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-1 shadow-2xl">
                <div className="bg-white rounded-[22px] overflow-hidden">
                    {/* Cabecera del formulario */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-white font-black text-lg tracking-tight">Nuevo Pedido Manual</h3>
                                <p className="text-blue-200 text-xs font-bold">Ingresa todos los datos del pedido</p>
                            </div>
                        </div>
                        <div className="w-64">
                            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1.5 text-center">Campaña</p>
                            <CorreriaAutocomplete
                                value={selectedCorreriaId}
                                correrias={state.correrias}
                                onChange={setSelectedCorreriaId}
                                search={correriaSearch}
                                setSearch={setCorreriaSearch}
                                showDropdown={showCorreriaDropdown}
                                setShowDropdown={setShowCorreriaDropdown}
                                placeholder="Escribe 2 dígitos..."
                            />
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* ── Datos generales ── */}
                        <div className="space-y-5">
                            {/* Fila 1: Cliente (2fr) + Dirección (2fr) + Ciudad (1fr) + Vendedor (1fr) */}
                            <div className="grid gap-5" style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr' }}>

                            {/* Cliente */}
                            <div className="relative">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 text-center">Cliente</label>
                                <input type="text" value={clientSearch}
                                    onChange={e => { setClientSearch(e.target.value); setShowClientResults(true); if (!e.target.value) { setSelectedClientId(''); setSelectedClientInfo(null); } }}
                                    onFocus={() => setShowClientResults(true)}
                                    onBlur={() => setTimeout(() => setShowClientResults(false), 200)}
                                    placeholder="Código o nombre..."
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                />
                                {selectedClientId && (
                                    <div className="absolute right-3 top-9 w-2 h-2 bg-green-500 rounded-full mt-1" />
                                )}
                                {showClientResults && filteredClients.length > 0 && (
                                    <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 max-h-52 overflow-y-auto">
                                        {filteredClients.map(c => (
                                            <button key={c.id} onMouseDown={() => selectClient(c)}
                                                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0">
                                                <p className="font-black text-slate-800 text-sm">{c.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{c.id} · {c.city}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Dirección */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 text-center">Dirección</label>
                                <input type="text" readOnly value={selectedClientInfo?.address || ''}
                                    placeholder="Auto al seleccionar cliente"
                                    className="w-full px-4 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl font-bold text-slate-500 cursor-default text-sm" />
                            </div>

                            {/* Ciudad */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 text-center">Ciudad</label>
                                <input type="text" readOnly value={selectedClientInfo?.city || ''}
                                    placeholder="—"
                                    className="w-full px-4 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl font-bold text-slate-500 cursor-default text-sm text-center" />
                            </div>

                            {/* Vendedor */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 text-center">Vendedor</label>
                                <select value={selectedSellerId} onChange={e => setSelectedSellerId(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all">
                                    <option value="">-- Seleccionar --</option>
                                    {state.sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            </div>

                            {/* Fila 2: Nº pedido + % Oficial + % Remisión + Fecha inicio + Fecha fin */}
                            <div className="grid grid-cols-5 gap-5">

                            {/* Número de pedido */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 text-center">Número de Pedido</label>
                                <input type="number" value={orderNumber} onChange={e => setOrderNumber(e.target.value === '' ? '' : parseInt(e.target.value))}
                                    placeholder="Opcional"
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-center" />
                            </div>                            {/* % Oficial */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 text-center">% Facturación Oficial</label>
                                <input type="number" step="0.01" value={porcentajeOficial} onChange={e => setPorcentajeOficial(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                    placeholder="0.00"
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-center" />
                            </div>

                            {/* % Remisión */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 text-center">% Facturación Remisión</label>
                                <input type="number" step="0.01" value={porcentajeRemision} onChange={e => setPorcentajeRemision(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                    placeholder="0.00"
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-center" />
                            </div>

                            {/* Fecha inicio */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 text-center">Fecha Inicio Despacho</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-center" />
                            </div>

                            {/* Fecha fin */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 text-center">Fecha Fin Despacho</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-center" />
                            </div>
                            </div>
                        </div>

                        {/* ── Tabla de referencias ── */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-black text-slate-700 uppercase tracking-widest text-xs">Referencias del Pedido</h4>
                                <div className="flex items-center gap-3">
                                    {filledItems.length > 0 && (
                                        <div className="flex gap-4 text-xs font-black">
                                            <span className="text-slate-400">{filledItems.length} refs</span>
                                            <span className="text-blue-600">{totalUnits} uds</span>
                                            <span className="text-emerald-600">${totalValue.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <button onClick={addRow}
                                        className="px-4 py-2 bg-blue-50 text-blue-600 font-black rounded-xl hover:bg-blue-100 transition-colors text-xs flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                        Agregar fila
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-2xl border-2 border-slate-100 overflow-hidden">
                                {/* Encabezados */}
                                <div className="grid grid-cols-[2fr_3fr_2fr_2fr_auto] bg-slate-50 border-b-2 border-slate-100">
                                    {['Referencia', 'Descripción', 'Cantidad', 'Precio Venta', ''].map((h, i) => (
                                        <div key={i} className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{h}</div>
                                    ))}
                                </div>

                                {/* Filas */}
                                <div className="divide-y divide-slate-100">
                                    {items.map((item, idx) => (
                                        <div key={idx} className={`grid grid-cols-[2fr_3fr_2fr_2fr_auto] items-center transition-colors ${item.reference ? 'bg-white' : 'bg-slate-50/50'}`}>
                                            {/* Referencia */}
                                            <div className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    value={item.reference}
                                                    onChange={e => updateItem(idx, 'reference', e.target.value)}
                                                    onFocus={e => e.target.select()}
                                                    placeholder={`Ref ${idx + 1}`}
                                                    className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-lg font-black text-sm text-center focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all uppercase"
                                                />
                                            </div>
                                            {/* Descripción */}
                                            <div className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    value={item.description}
                                                    onChange={e => updateItem(idx, 'description', e.target.value)}
                                                    placeholder="Auto-rellena al ingresar ref."
                                                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-lg font-bold text-sm text-slate-500 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                                                />
                                            </div>
                                            {/* Cantidad */}
                                            <div className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={e => updateItem(idx, 'quantity', e.target.value)}
                                                    onFocus={e => e.target.select()}
                                                    placeholder="0"
                                                    className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-lg font-black text-sm text-center focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                                                />
                                            </div>
                                            {/* Precio */}
                                            <div className="px-3 py-2">
                                                <div className="flex items-center bg-white border-2 border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-emerald-100 focus-within:border-emerald-400 transition-all overflow-hidden">
                                                    <span className="pl-3 pr-1 font-black text-slate-400 text-sm select-none">$</span>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={item.salePrice === '' ? '' : Number(item.salePrice).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                                                        onChange={e => {
                                                            const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
                                                            updateItem(idx, 'salePrice', raw);
                                                        }}
                                                        onFocus={e => e.target.select()}
                                                        placeholder="0"
                                                        className="flex-1 pr-3 py-2 bg-transparent font-black text-sm text-right focus:outline-none w-full"
                                                    />
                                                </div>
                                            </div>
                                            {/* Eliminar */}
                                            <div className="px-3 py-2">
                                                <button onClick={() => removeRow(idx)}
                                                    className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer totales — siempre visible */}
                                <div className="grid grid-cols-[2fr_3fr_2fr_2fr_auto] bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-slate-200">
                                    <div className="px-4 py-4 text-base font-black text-slate-600 uppercase tracking-wide text-center">Total</div>
                                    <div className="px-4 py-4 text-base font-black text-slate-500 text-center">{filledItems.length} ref{filledItems.length !== 1 ? 's' : ''}</div>
                                    <div className="px-4 py-4 text-base font-black text-blue-600 text-center">{totalUnits} uds</div>
                                    <div className="px-4 py-4 text-base font-black text-emerald-600 text-center">${totalValue.toLocaleString()}</div>
                                    <div />
                                </div>
                            </div>
                        </div>

                        {/* ── Botones ── */}
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={handleGuardar} disabled={guardando}
                                className="py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xl rounded-2xl shadow-xl hover:shadow-blue-200 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider">
                                {guardando ? 'Guardando...' : 'Asentar Pedido'}
                            </button>
                            <button onClick={handleGenerarPedido}
                                className="py-5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-xl rounded-2xl shadow-xl hover:shadow-emerald-200 hover:scale-[1.01] transition-all uppercase tracking-wider">
                                Generar Pedido
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenerarListaPreciosView;

