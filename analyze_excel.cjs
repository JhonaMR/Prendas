
const XLSX = require('xlsx');
const path = require('path');

const filePath = 'c:\\Users\\luisf\\OneDrive\\Desktop\\Proyecto\\Prendas\\Libro1.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Get headers (first row)
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log("Sheet Name:", sheetName);
    console.log("Headers:", data[0]);
    console.log("Sample Data (Row 2):", data[1]);
    console.log("Sample Data (Row 3):", data[2]);
    console.log("Sample Data (Row 4):", data[3]);
    
    // Check for celdas calculadas o estructura compleja
    console.log("\nFull sheet dump (first 10 rows):");
    console.log(data.slice(0, 10));

} catch (err) {
    console.error("Error reading Excel:", err);
}
