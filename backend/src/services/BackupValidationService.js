/**
 * Servicio para validar integridad de backups
 * Se ejecuta automáticamente después de cada backup
 */

const fs = require('fs');
const path = require('path');

class BackupValidationService {
  constructor(backupDir = path.join(__dirname, '../../backups')) {
    this.backupDir = backupDir;
    this.CORRUPTION_PATTERNS = [
      /\\restrict/,
      /[\x00-\x08\x0B-\x0C\x0E-\x1F]/g,
    ];
  }

  /**
   * Valida un archivo de backup
   */
  validateBackup(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return {
          valid: false,
          error: 'Archivo no encontrado',
          filePath
        };
      }

      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8');

      // Verificar corrupción - SOLO si el archivo es grande
      // Archivos pequeños (<1MB) pueden ser válidos si tienen pocos datos
      if (stats.size > 1024 * 1024) {
        for (const pattern of this.CORRUPTION_PATTERNS) {
          if (pattern.test(content)) {
            return {
              valid: false,
              error: 'Archivo contiene caracteres corruptos',
              filePath,
              sizeInMB: (stats.size / 1024 / 1024).toFixed(2)
            };
          }
        }
      }

      // Verificar estructura SQL
      if (!content.includes('CREATE TABLE')) {
        return {
          valid: false,
          error: 'No contiene CREATE TABLE',
          filePath,
          sizeInMB: (stats.size / 1024 / 1024).toFixed(2)
        };
      }

      if (!content.includes('PRIMARY KEY')) {
        return {
          valid: false,
          error: 'No contiene PRIMARY KEY',
          filePath,
          sizeInMB: (stats.size / 1024 / 1024).toFixed(2)
        };
      }

      // Contar tablas
      const tableMatches = content.match(/CREATE TABLE/g) || [];
      const tableCount = tableMatches.length;

      return {
        valid: true,
        filePath,
        sizeInMB: (stats.size / 1024 / 1024).toFixed(2),
        tableCount,
        createdAt: stats.birthtime.toISOString()
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        filePath
      };
    }
  }

  /**
   * Valida todos los backups en el directorio
   */
  validateAllBackups() {
    try {
      if (!fs.existsSync(this.backupDir)) {
        return {
          success: false,
          error: 'Directorio de backups no encontrado',
          backupDir: this.backupDir
        };
      }

      const files = fs.readdirSync(this.backupDir)
        .filter(f => f.endsWith('.sql'))
        .sort((a, b) => {
          const pathA = path.join(this.backupDir, a);
          const pathB = path.join(this.backupDir, b);
          return fs.statSync(pathB).mtime - fs.statSync(pathA).mtime;
        });

      const results = {
        total: files.length,
        valid: [],
        invalid: [],
        summary: {
          validCount: 0,
          invalidCount: 0,
          totalSizeInMB: 0
        }
      };

      for (const file of files) {
        const filePath = path.join(this.backupDir, file);
        const validation = this.validateBackup(filePath);

        if (validation.valid) {
          results.valid.push(validation);
          results.summary.validCount++;
          results.summary.totalSizeInMB += parseFloat(validation.sizeInMB);
        } else {
          results.invalid.push(validation);
          results.summary.invalidCount++;
        }
      }

      results.summary.totalSizeInMB = results.summary.totalSizeInMB.toFixed(2);

      return {
        success: true,
        ...results
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene el backup más reciente válido
   */
  getLatestValidBackup() {
    try {
      const validation = this.validateAllBackups();

      if (!validation.success || validation.valid.length === 0) {
        return null;
      }

      // El primero en la lista es el más reciente (ordenados por mtime descendente)
      return validation.valid[0];
    } catch (error) {
      console.error('Error al obtener backup más reciente:', error.message);
      return null;
    }
  }

  /**
   * Genera reporte de validación
   */
  generateReport() {
    const validation = this.validateAllBackups();

    if (!validation.success) {
      return {
        status: 'ERROR',
        message: validation.error,
        timestamp: new Date().toISOString()
      };
    }

    const report = {
      timestamp: new Date().toISOString(),
      status: validation.summary.invalidCount === 0 ? 'OK' : 'WARNING',
      summary: {
        totalBackups: validation.total,
        validBackups: validation.summary.validCount,
        invalidBackups: validation.summary.invalidCount,
        totalSizeInMB: validation.summary.totalSizeInMB
      },
      validBackups: validation.valid.map(b => ({
        filename: path.basename(b.filePath),
        sizeInMB: b.sizeInMB,
        tableCount: b.tableCount,
        createdAt: b.createdAt
      })),
      invalidBackups: validation.invalid.map(b => ({
        filename: path.basename(b.filePath),
        error: b.error,
        sizeInMB: b.sizeInMB
      }))
    };

    return report;
  }

  /**
   * Limpia un archivo de backup corrupto
   */
  cleanCorruptedBackup(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalSize = content.length;

      // Remover líneas con \restrict
      content = content.replace(/\\restrict.*?\n/g, '');

      // Remover caracteres de control inválidos
      content = content.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, '');

      // Asegurar que termina con newline
      if (!content.endsWith('\n')) {
        content += '\n';
      }

      fs.writeFileSync(filePath, content, 'utf8');

      const newSize = content.length;
      const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(2);

      return {
        success: true,
        originalSize,
        newSize,
        reduction: `${reduction}%`,
        filePath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        filePath
      };
    }
  }
}

module.exports = BackupValidationService;
