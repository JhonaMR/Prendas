const XLSX = require("xlsx");
const path = require("path");

// Crear un nuevo workbook
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet([]);

// Establecer valores en celdas específicas
ws["M4"] = { v: 9, t: "n" };  // Número de pedido
ws["N9"] = { v: "081", t: "s" };  // Código cliente

// Encabezados en fila 19
ws["B19"] = { v: "REFERENCIA", t: "s" };
ws["C19"] = { v: "DESCRIPCION", t: "s" };
ws["L19"] = { v: "CANTIDAD", t: "s" };
ws["M19"] = { v: "PRECIO", t: "s" };

// Datos de ejemplo desde fila 20
const ejemplos = [
  ["12366", "CROP TOP SBL", 24, 19900],
  ["12871", "CAMISILLA RAYAS APLIQUE", 24, 19900],
  ["12922", "BLUSA DAMA FRANJA Y MOÑO", 24, 21900],
  ["12860", "BLUSA MGA SISA CORAZON", 24, 16900],
  ["12888", "CAMISILLA CORAZONES", 24, 19900],
];

ejemplos.forEach((row, idx) => {
  const rowNum = 20 + idx;
  ws[`B${rowNum}`] = { v: row[0], t: "s" };
  ws[`C${rowNum}`] = { v: row[1], t: "s" };
  ws[`L${rowNum}`] = { v: row[2], t: "n" };
  ws[`M${rowNum}`] = { v: row[3], t: "n" };
});

// Establecer ancho de columnas
ws["!cols"] = [
  { wch: 12 },  // A
  { wch: 12 },  // B
  { wch: 30 },  // C
  { wch: 8 },   // D-K
  { wch: 8 },   // L
  { wch: 12 },  // M
  { wch: 12 },  // N
];

XLSX.utils.book_append_sheet(wb, ws, "Pedido");
const outputPath = path.join(__dirname, "../../public/ejemplo_pedidos.xlsx");
XLSX.writeFile(wb, outputPath);
console.log(" Archivo creado: " + outputPath);
