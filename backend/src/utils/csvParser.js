/**
 * Parser CSV simple para importación de datos
 */

/**
 * Parsea un string CSV a un array de objetos
 * @param {string} csvContent - Contenido del archivo CSV
 * @param {Array<string>} expectedHeaders - Headers esperados (opcional)
 * @returns {Object} { success: boolean, data: Array, error: string }
 */
function parseCSV(csvContent, expectedHeaders = null) {
  try {
    const lines = csvContent.trim().split('\n');
    
    if (lines.length < 2) {
      return {
        success: false,
        data: [],
        error: 'El archivo CSV debe contener al menos un header y una fila de datos'
      };
    }

    // Parsear header
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine);

    if (headers.length === 0) {
      return {
        success: false,
        data: [],
        error: 'No se encontraron headers en el CSV'
      };
    }

    // Validar headers esperados si se proporcionan
    if (expectedHeaders) {
      const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        return {
          success: false,
          data: [],
          error: `Headers faltantes: ${missingHeaders.join(', ')}`
        };
      }
    }

    // Parsear datos
    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '') continue; // Saltar líneas vacías

      const values = parseCSVLine(line);
      
      if (values.length !== headers.length) {
        return {
          success: false,
          data: [],
          error: `Fila ${i + 1}: número de columnas no coincide con el header (esperado: ${headers.length}, encontrado: ${values.length})`
        };
      }

      const record = {};
      headers.forEach((header, index) => {
        record[header.toLowerCase()] = values[index];
      });

      records.push(record);
    }

    return {
      success: true,
      data: records,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: `Error al parsear CSV: ${error.message}`
    };
  }
}

/**
 * Parsea una línea CSV respetando comillas
 * @param {string} line - Línea CSV
 * @returns {Array<string>} Array de valores
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Comilla escapada
        current += '"';
        i++; // Saltar siguiente comilla
      } else {
        // Toggle de comillas
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // Separador de columna
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Agregar último valor
  values.push(current.trim());

  return values;
}

module.exports = {
  parseCSV,
  parseCSVLine
};
