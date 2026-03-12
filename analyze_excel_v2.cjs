
const XLSX = require('xlsx');
const path = require('path');

const filePath = 'c:\\Users\\luisf\\OneDrive\\Desktop\\Proyecto\\Prendas\\Libro1.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    console.log("Sheet Name:", sheetName);
    console.log("Range:", worksheet['!ref']);
    
    for(let R = range.s.r; R <= Math.min(range.e.r, 50); ++R) {
        let row = [];
        for(let C = range.s.c; C <= Math.min(range.e.c, 15); ++C) {
            const cell_address = {c:C, r:R};
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            const cell = worksheet[cell_ref];
            row.push(cell ? cell.v : '');
        }
        if (row.some(c => c !== '')) {
            console.log(`Row ${R+1}:`, JSON.stringify(row));
        }
    }

} catch (err) {
    console.error("Error reading Excel:", err);
}
