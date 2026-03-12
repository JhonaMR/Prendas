import ExcelJS from 'exceljs';
import { Order, Client, Seller, Reference } from '../types';

export const exportOrderToExcel = async (
    order: Order,
    client: Client | undefined,
    seller: Seller | undefined,
    referencesContext: Reference[],
    isMelas: boolean
) => {
    try {
        const formatName = isMelas ? 'FormatoPedidosMelas.xlsx' : 'FormatoPedidosPlow.xlsx';

        // Fetch base excel file from public format
        const response = await fetch(`/formats/${formatName}`);
        if (!response.ok) throw new Error('No se pudo encontrar el formato de excel');

        const arrayBuffer = await response.arrayBuffer();

        // Load to ExcelJS
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        // Obtener la hoja principal
        const worksheet = workbook.worksheets[0];

        // CABECERA
        worksheet.getCell('M4').value = order.orderNumber || order.id?.slice(0, 6) || ''; // número del pedido
        worksheet.getCell('M7').value = seller?.name || ''; // vendedor
        worksheet.getCell('N9').value = client?.id || ''; // codigo cliente
        worksheet.getCell('C9').value = client?.name || ''; // nombre cliente
        worksheet.getCell('C11').value = client?.address || ''; // direccion 
        worksheet.getCell('K11').value = client?.nit || ''; // NIT
        worksheet.getCell('K13').value = client?.city || ''; // ciudad

        const formatDate = (dateStr?: string | null) => {
            if (!dateStr) return " - ";
            // Convertir fechas a DD/MM/AAAA
            const [year, month, day] = dateStr.split('T')[0].split('-');
            if (year && month && day) return `${day}/${month}/${year}`;

            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return " - ";
            return d.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
        };

        worksheet.getCell('N13').value = formatDate(order.createdAt);
        worksheet.getCell('N15').value = formatDate(order.startDate);
        worksheet.getCell('N16').value = formatDate(order.endDate);
        
        // PORCENTAJES
        worksheet.getCell('J3').value = order.porcentajeOficial || 0;
        worksheet.getCell('K3').value = order.porcentajeRemision || 0;

        // REFERENCIAS
        const ITEMS_START_ROW = 20;
        const TOTAL_FORMAT_ROWS = 18;
        const items = order.items || [];

        // Si tenemos más de 18 ítems, clonamos la última fila del rango (la 37) para hacer espacio
        // exceljs spliceRows inserta filas vacías, y podemos llenarlas.
        if (items.length > TOTAL_FORMAT_ROWS) {
            const extraRows = items.length - TOTAL_FORMAT_ROWS;
            worksheet.spliceRows(ITEMS_START_ROW + TOTAL_FORMAT_ROWS, 0, ...Array(extraRows).fill([]));

            // Aplicar el mismo estilo/altura de la última fila (37)
            const templateRow = worksheet.getRow(ITEMS_START_ROW + TOTAL_FORMAT_ROWS - 1);
            for (let i = 0; i < extraRows; i++) {
                const newRow = worksheet.getRow(ITEMS_START_ROW + TOTAL_FORMAT_ROWS + i);
                newRow.height = templateRow.height;
                templateRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    const newCell = newRow.getCell(colNumber);
                    newCell.style = Object.assign({}, cell.style);
                });
            }
        } else if (items.length < TOTAL_FORMAT_ROWS) {
            // Necesitamos remover filas para no dejar espacios en blanco vacíos antes de los totales
            const rowsToRemove = TOTAL_FORMAT_ROWS - items.length;
            if (rowsToRemove > 0) {
                worksheet.spliceRows(ITEMS_START_ROW + items.length, rowsToRemove);
            }
        }

        // Rellenamos
        items.forEach((item, index) => {
            const rowNum = ITEMS_START_ROW + index;
            const refDetail = referencesContext.find(r => r.id === item.reference);

            const row = worksheet.getRow(rowNum);

            // Referencia como número si es posible
            const refAsNumber = Number(item.reference);
            row.getCell('B').value = isNaN(refAsNumber) ? item.reference : refAsNumber;
            row.getCell('C').value = refDetail?.description || '';
            row.getCell('L').value = item.quantity;

            const salePrice = item.salePrice !== undefined ? item.salePrice : refDetail?.price || 0;
            const priceCell = row.getCell('M');
            priceCell.value = salePrice;
            priceCell.numFmt = '"$"#,##0'; // Contabilidad sin decimales

            // Asegurarnos de que N tenga la fórmula del subtotal (Cantidad * Precio) si fue clonada o es nueva
            const subtotalCell = row.getCell('N');
            subtotalCell.value = { formula: `L${rowNum}*M${rowNum}`, result: item.quantity * salePrice };
            subtotalCell.numFmt = '"$"#,##0';

            row.commit();
        });

        // FILA DE TOTALES FINAL (La última fila de las dos del fondo)
        // La penúltima está en (ITEMS_START_ROW + items.length)
        // La última está en (ITEMS_START_ROW + items.length + 1)
        const lastRecRow = ITEMS_START_ROW + items.length > ITEMS_START_ROW ? ITEMS_START_ROW + items.length - 1 : ITEMS_START_ROW;
        const finalTotalsRow = worksheet.getRow(ITEMS_START_ROW + items.length + 1);

        // Sumatoria de unidades en L
        const totalUnitsCell = finalTotalsRow.getCell('L');
        totalUnitsCell.value = { formula: `SUM(L20:L${lastRecRow})` };

        // Sumatoria de valores totales en N
        const totalValueCell = finalTotalsRow.getCell('N');
        totalValueCell.value = { formula: `SUM(N20:N${lastRecRow})` };
        totalValueCell.numFmt = '"$"#,##0';

        // Fix merge issue para Totales (B a K) cuando se eliminan filas
        const finalTotalsRowNum = ITEMS_START_ROW + items.length + 1;
        try {
            // Asegurarnos de que no esté merged antes de mergear para evitar errores
            worksheet.unMergeCells(`B${finalTotalsRowNum}:K${finalTotalsRowNum}`);
        } catch (e) {
            // Si no estaba merged, ignoramos
        }
        worksheet.mergeCells(`B${finalTotalsRowNum}:K${finalTotalsRowNum}`);

        finalTotalsRow.commit();

        // Exportar blob
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Generar URL y forzar descarga
        const orderRef = order.orderNumber || order.id.slice(0, 6);
        const fileName = `Pedido_${orderRef}_${client?.name || 'Cliente'}.xlsx`;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Error exportando pedido Excel:", error);
        alert("Hubo un error al generar el pedido Excel. Por favor intenta de nuevo.");
    }
};
