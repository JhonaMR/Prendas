import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Order, Client, Seller, Reference } from '../types';

const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    const [year, month, day] = dateStr.split('T')[0].split('-');
    if (year && month && day) return `${day}/${month}/${year}`;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const fmt = (n: number) => `$${n.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;

export const exportOrderToPdf = async (
    order: Order & { items: any[] },
    client: Client | undefined,
    seller: Seller | undefined,
    referencesContext: Reference[],
    isMelas: boolean
) => {
    const brandColor = isMelas ? '#dc2626' : '#2563eb';
    const brandName = isMelas ? 'MELAS' : 'PLOW';
    const logoSrc = isMelas ? '/logos/melas-192x192.png' : '/logos/plow-192x192.png';
    const sellerFirst = (seller?.name || '').split(' ')[0].toUpperCase();
    const hasSizes = order.items.some((i: any) => i.sizes);

    const totalUnits = order.items.reduce((a: number, i: any) => a + (Number(i.quantity) || 0), 0);
    const totalValue = order.items.reduce((a: number, i: any) => a + (Number(i.quantity) || 0) * (Number(i.salePrice) || 0), 0);

    // ── Filas de items ──
    const itemRows = order.items.map((item: any) => {
        const ref = referencesContext.find(r => r.id === item.reference);
        const qty = Number(item.quantity) || 0;
        const price = Number(item.salePrice) || 0;
        return { ...item, description: ref?.description || item.description || '', qty, price, subtotal: qty * price };
    });

    // ── Construir HTML ──
    const sizeHeaders = hasSizes
        ? `<th style="width:40px">S</th><th style="width:40px">M</th><th style="width:40px">L</th><th style="width:40px">XL</th>`
        : '';
    const sizeCols = hasSizes ? `<col style="width:40px"/><col style="width:40px"/><col style="width:40px"/><col style="width:40px"/>` : '';

    const itemRowsHtml = itemRows.map((item, i) => {
        const sizeCells = hasSizes
            ? `<td style="padding:6px 6px;text-align:center">${item.sizes?.S || ''}</td><td style="padding:6px 6px;text-align:center">${item.sizes?.M || ''}</td><td style="padding:6px 6px;text-align:center">${item.sizes?.L || ''}</td><td style="padding:6px 6px;text-align:center">${item.sizes?.XL || ''}</td>`
            : '';
        const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
        return `<tr style="background:${bg};vertical-align:middle">
            <td style="text-align:center;font-weight:700;padding:6px 6px">${item.reference}</td>
            <td style="padding:6px 6px">${item.description}</td>
            ${sizeCells}
            <td style="text-align:center;padding:6px 6px">${item.qty}</td>
            <td style="padding:6px 6px">${(item as any).novedad || ''}</td>
            <td style="text-align:right;padding:6px 6px">${fmt(item.price)}</td>
            <td style="text-align:right;font-weight:600;padding:6px 6px">${fmt(item.subtotal)}</td>
        </tr>`;
    }).join('');

    const html = `
<div id="pdf-order" style="
    font-family: Arial, sans-serif;
    font-size: 11px;
    color: #1e293b;
    width: 900px;
    padding: 0;
    background: #fff;
">
    <!-- HEADER -->
    <div style="background:${brandColor};padding:16px 24px;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:12px">
            <img src="${logoSrc}" style="width:48px;height:48px;border-radius:8px;background:#fff;padding:4px" crossorigin="anonymous"/>
            <div>
                <div style="color:#fff;font-size:20px;font-weight:900;letter-spacing:2px">${brandName}</div>
                <div style="color:rgba(255,255,255,0.8);font-size:10px">Formato de Pedido</div>
            </div>
        </div>
        <div style="text-align:right;color:#fff">
            <div style="font-size:10px;opacity:0.8">N° Pedido</div>
            <div style="font-size:22px;font-weight:900">${order.orderNumber ?? '—'}</div>
        </div>
    </div>

    <!-- INFO PEDIDO -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;border-bottom:2px solid #e2e8f0">
        <div style="padding:12px 24px;border-right:1px solid #e2e8f0">
            <table style="width:100%;border-collapse:collapse">
                <tr><td style="color:#64748b;width:110px;padding:3px 0;font-size:10px">CLIENTE</td><td style="font-weight:700">${client?.name || '—'}</td></tr>
                <tr><td style="color:#64748b;font-size:10px">CÓDIGO</td><td>${client?.id || '—'}</td></tr>
                <tr><td style="color:#64748b;font-size:10px">DIRECCIÓN</td><td>${client?.address || '—'}</td></tr>
                <tr><td style="color:#64748b;font-size:10px">CIUDAD</td><td>${client?.city || '—'}</td></tr>
                <tr><td style="color:#64748b;font-size:10px">NIT</td><td>${(client as any)?.nit || '—'}</td></tr>
            </table>
        </div>
        <div style="padding:12px 24px">
            <table style="width:100%;border-collapse:collapse">
                <tr><td style="color:#64748b;width:130px;padding:3px 0;font-size:10px">VENDEDOR</td><td style="font-weight:700">${sellerFirst}</td></tr>
                <tr><td style="color:#64748b;font-size:10px">FECHA PEDIDO</td><td>${formatDate(order.createdAt)}</td></tr>
                <tr><td style="color:#64748b;font-size:10px">INICIO DESPACHO</td><td>${formatDate(order.startDate)}</td></tr>
                <tr><td style="color:#64748b;font-size:10px">FIN DESPACHO</td><td>${formatDate(order.endDate)}</td></tr>
                <tr><td style="color:#64748b;font-size:10px">% OFICIAL / REMISIÓN</td><td>${order.porcentajeOficial ?? '—'} / ${order.porcentajeRemision ?? '—'}</td></tr>
            </table>
        </div>
    </div>

    <!-- TABLA REFERENCIAS -->
    <table style="width:100%;border-collapse:collapse;font-size:10.5px">
        <colgroup>
            <col style="width:80px"/>
            <col/>
            ${sizeCols}
            <col style="width:55px"/>
            <col style="width:90px"/>
            <col style="width:90px"/>
        </colgroup>
        <thead>
            <tr style="background:#e2e8f0;color:#475569;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">
                <th style="padding:8px 6px;text-align:center">Referencia</th>
                <th style="padding:8px 6px;text-align:left">Descripción</th>
                ${sizeHeaders}
                <th style="padding:8px 6px;text-align:center">Cant.</th>
                <th style="padding:8px 6px;text-align:left">Novedad</th>
                <th style="padding:8px 6px;text-align:right">Precio</th>
                <th style="padding:8px 6px;text-align:right">Subtotal</th>
            </tr>
        </thead>
        <tbody style="border:1px solid #e2e8f0">
            ${itemRowsHtml}
        </tbody>
        <tfoot>
            <tr style="background:#f1f5f9;font-weight:700;border-top:2px solid #cbd5e1">
                <td colspan="${hasSizes ? 6 : 2}" style="padding:8px 6px;text-align:right;color:#475569;text-transform:uppercase;font-size:10px">
                    ${itemRows.length} referencia${itemRows.length !== 1 ? 's' : ''}
                </td>
                <td style="padding:8px 6px;text-align:center;color:#2563eb">${totalUnits}</td>
                <td style="padding:8px 6px;text-align:left;color:#475569"></td>
                <td style="padding:8px 6px;text-align:right;color:#475569">Total</td>
                <td style="padding:8px 6px;text-align:right;color:#16a34a">${fmt(totalValue)}</td>
            </tr>
        </tfoot>
    </table>

    ${((order as any).observaciones || []).filter((o: string) => o.trim()).length > 0 ? `
    <!-- OBSERVACIONES -->
    <div style="margin:0;padding:8px 24px;background:#fff5f5;border-top:2px solid #fecaca">
        <div style="font-size:9px;font-weight:700;color:#f87171;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">Observaciones</div>
        ${((order as any).observaciones as string[]).filter(o => o.trim()).map((o, i) => `
        <div style="font-size:10px;color:#374151;padding:2px 0">${i + 1}. ${o}</div>`).join('')}
    </div>` : ''}

    <!-- FOOTER -->
    <div style="padding:10px 24px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;color:#94a3b8;font-size:9px;margin-top:4px">
        <span>Generado por: ${(order as any).settledBy || '—'}</span>
        <span>${new Date().toLocaleString('es-CO')}</span>
    </div>
</div>`;

    // ── Montar en DOM oculto, capturar y generar PDF ──
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;z-index:-1';
    container.innerHTML = html;
    document.body.appendChild(container);

    try {
        const el = container.querySelector('#pdf-order') as HTMLElement;
        const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');

        const pdfW = 297; // A4 landscape mm
        const pdfH = 210;
        const ratio = canvas.width / canvas.height;
        const imgH = pdfW / ratio;

        let pdf: jsPDF;
        if (imgH <= pdfH) {
            // Cabe en una hoja landscape
            pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            pdf.addImage(imgData, 'PNG', 0, 0, pdfW, imgH);
        } else {
            // Múltiples páginas portrait
            pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageW = 210;
            const pageH = 297;
            const scale = pageW / canvas.width;
            const totalH = canvas.height * scale;
            let yOffset = 0;
            while (yOffset < totalH) {
                if (yOffset > 0) pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, -yOffset, pageW, totalH);
                yOffset += pageH;
            }
        }

        const fileName = `pedido-${client?.name || 'cliente'}.pdf`;
        pdf.save(fileName);
    } finally {
        document.body.removeChild(container);
    }
};
