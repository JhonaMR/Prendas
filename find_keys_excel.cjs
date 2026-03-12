
const XLSX = require('xlsx');
const path = require('path');

const filePath = 'c:\\Users\\luisf\\OneDrive\\Desktop\\Proyecto\\Prendas\\Libro1.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    let findings = [];
    
    for(let R = range.s.r; R <= range.e.r; ++R) {
        for(let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = {c:C, r:R};
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            const cell = worksheet[cell_ref];
            if (cell && cell.v) {
                const val = String(cell.v).toUpperCase().trim();
                if (val === 'REFERENCIA' || val === 'REFERENCIA:' || val.includes('REFERENCIA')) {
                    findings.push(`Found REF-like at ${cell_ref}: "${cell.v}"`);
                    // Check next cell
                    const next_ref = XLSX.utils.encode_cell({c:C+1, r:R});
                    const next_cell = worksheet[next_ref];
                    if (next_cell) findings.push(`  Next cell (${next_ref}): "${next_cell.v}"`);
                }
                if (val === 'COLECCIÓN' || val === 'COLECCION' || val === 'CORRERÍA' || val === 'CORRERIA') {
                    findings.push(`Found COLECCION-like at ${cell_ref}: "${cell.v}"`);
                    const next_ref = XLSX.utils.encode_cell({c:C+1, r:R});
                    const next_cell = worksheet[next_ref];
                    if (next_cell) findings.push(`  Next cell (${next_ref}): "${next_cell.v}"`);
                }
                if (val === 'MATERIA PRIMA' || val.includes('MATERIA PRIMA')) {
                    findings.push(`Found MATERIA PRIMA section start at ${cell_ref}: "${cell.v}"`);
                }
                if (val === 'MANO DE OBRA' || val.includes('MANO DE OBRA')) {
                    findings.push(`Found MANO DE OBRA section start at ${cell_ref}: "${cell.v}"`);
                }
            }
        }
    }
    
    console.log(findings.join('\n'));

} catch (err) {
    console.error("Error reading Excel:", err);
}
