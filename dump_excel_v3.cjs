
const XLSX = require('xlsx');
const fs = require('fs');

const filePath = 'c:\\Users\\luisf\\OneDrive\\Desktop\\Proyecto\\Prendas\\Libro1.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    let output = "";
    
    for(let R = range.s.r; R <= Math.min(range.e.r, 100); ++R) {
        let row = [];
        for(let C = range.s.c; C <= Math.min(range.e.c, 20); ++C) {
            const cell_address = {c:C, r:R};
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            const cell = worksheet[cell_ref];
            row.push(cell ? String(cell.v).replace(/\s+/g, ' ') : '');
        }
        output += `Row ${R+1}: ${JSON.stringify(row)}\n`;
    }
    
    fs.writeFileSync('excel_structure.json', output, 'utf8');
    console.log("Written to excel_structure.json");

} catch (err) {
    console.error("Error reading Excel:", err);
}
