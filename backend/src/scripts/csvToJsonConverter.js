// ============================================
// HERRAMIENTA: Convertidor CSV a JSON
// Para preparar datos de migración
// ============================================

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class CSVToJsonConverter {
  /**
   * Convierte un archivo CSV a JSON
   * @param {string} csvFilePath - Ruta del archivo CSV
   * @param {string} outputPath - Ruta de salida JSON
   * @param {object} options - Opciones de conversión
   */
  static async convertFile(csvFilePath, outputPath, options = {}) {
    const {
      delimiter = ',',
      hasHeader = true,
      encoding = 'utf8'
    } = options;

    return new Promise((resolve, reject) => {
      const fileStream = fs.createReadStream(csvFilePath, { encoding });
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });

      const data = [];
      let headers = [];
      let lineNumber = 0;

      rl.on('line', (line) => {
        lineNumber++;
        const values = this.parseCSVLine(line, delimiter);

        if (hasHeader && lineNumber === 1) {
          headers = values;
          return;
        }

        if (headers.length === 0) {
          reject(new Error('No headers found'));
          return;
        }

        const obj = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = values[index]?.trim() || '';
        });

        data.push(obj);
      });

      rl.on('close', () => {
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
        resolve({
          success: true,
          message: `Convertido: ${lineNumber - 1} registros`,
          outputPath,
          recordCount: data.length
        });
      });

      rl.on('error', reject);
    });
  }

  /**
   * Parsea una línea CSV respetando comillas
   */
  static parseCSVLine(line, delimiter = ',') {
    const result = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }

  /**
   * Convierte múltiples archivos CSV
   */
  static async convertMultiple(csvFiles, outputDir) {
    const results = [];

    for (const csvFile of csvFiles) {
      try {
        const fileName = path.basename(csvFile, '.csv');
        const outputPath = path.join(outputDir, `${fileName}.json`);

        const result = await this.convertFile(csvFile, outputPath);
        results.push({ file: csvFile, ...result });
      } catch (error) {
        results.push({ file: csvFile, success: false, error: error.message });
      }
    }

    return results;
  }
}

// ============ EXPORTAR ============

module.exports = CSVToJsonConverter;

// ============ USO DESDE CLI ============

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
Uso: node csvToJsonConverter.js <input.csv> <output.json>

Ejemplo:
  node csvToJsonConverter.js referencias.csv referencias.json
    `);
    process.exit(1);
  }

  const [inputFile, outputFile] = args;

  CSVToJsonConverter.convertFile(inputFile, outputFile)
    .then(result => {
      console.log('✅ Conversión exitosa:', result);
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}
