/**
 * Servicio para validar integridad de backups
 * Se ejecuta automáticamente después de cada backup
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class BackupValidationService {
  constructor(backupDir = path.join(__dirname, '../../backups')) {
    this.backupDir = backupDir;
    this.CORRUPTION_PATTERNS = [
      /[\x00-\x08\x0B-\x0C\x0E-\x1F]/g,
    ];
    this.alertsDir = path.join(__dirname, '../../logs/backup-alerts');
    this.ensureAlertsDir();
  }

  /**
   * Asegura que el directorio de alertas existe
   */
  ensureAlertsDir() {
    if (!fs.existsSync(this.alertsDir)) {
      fs.mkdirSync(this.alertsDir, { recursive: true });
    }
  }

  /**
   * Registra una alerta de validación
   */
  logAlert(alertType, message, details = {}) {
    const timestamp = new Date().toISOString();
    const alertFile = path.join(this.alertsDir, `backup-alerts-${new Date().toISOString().split('T')[0]}.log`);
    
    const alertEntry = {
      timestamp,
      type: alertType,
      message,
      details
    };

    const logLine = `[${timestamp}] [${alertType}] ${message} ${Object.keys(details).length > 0 ? JSON.stringify(details) : ''}\n`;
    
    try {
      fs.appendFileSync(alertFile, logLine, 'utf8');
      logger.warn(`🚨 ALERTA DE BACKUP: ${alertType} - ${message}`);
    } catch (error) {
      console.error('Error registrando alerta:', error.message);
    }

    return alertEntry;
  }

  /**
   * Valida un archivo de backup
   */
  validateBackup(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        const alert = this.logAlert('VALIDATION_ERROR', 'Archivo de backup no encontrado', { filePath });
        return {
          valid: false,
          error: 'Archivo no encontrado',
          filePath,
          alert
        };
      }

      const stats = fs.statSync(filePath);
      const filename = path.basename(filePath);
      const content = fs.readFileSync(filePath, 'utf8');

      // Verificar corrupción - SOLO si el archivo es grande
      // Archivos pequeños (<1MB) pueden ser válidos si tienen pocos datos
      if (stats.size > 1024 * 1024) {
        for (const pattern of this.CORRUPTION_PATTERNS) {
          if (pattern.test(content)) {
            const alert = this.logAlert('CORRUPTION_DETECTED', `Backup corrupto detectado: ${filename}`, {
              filePath,
              sizeInMB: (stats.size / 1024 / 1024).toFixed(2),
              pattern: pattern.toString()
            });
            return {
              valid: false,
              error: 'Archivo contiene caracteres corruptos',
              filePath,
              sizeInMB: (stats.size / 1024 / 1024).toFixed(2),
              alert
            };
          }
        }
      }

      // Verificar estructura SQL
      if (!content.includes('CREATE TABLE')) {
        const alert = this.logAlert('INVALID_STRUCTURE', `Backup sin CREATE TABLE: ${filename}`, { filePath });
        return {
          valid: false,
          error: 'No contiene CREATE TABLE',
          filePath,
          sizeInMB: (stats.size / 1024 / 1024).toFixed(2),
          alert
        };
      }

      if (!content.includes('PRIMARY KEY')) {
        const alert = this.logAlert('INVALID_STRUCTURE', `Backup sin PRIMARY KEY: ${filename}`, { filePath });
        return {
          valid: false,
          error: 'No contiene PRIMARY KEY',
          filePath,
          sizeInMB: (stats.size / 1024 / 1024).toFixed(2),
          alert
        };
      }

      // Contar tablas
      const tableMatches = content.match(/CREATE TABLE/g) || [];
      const tableCount = tableMatches.length;

      // Verificar que tiene tablas críticas
      const criticalTables = [
        'return_receptions',
        'return_reception_items',
        'product_references',
        'clients',
        'users'
      ];

      const missingTables = criticalTables.filter(table => !content.includes(`CREATE TABLE public.${table}`));
      
      if (missingTables.length > 0) {
        const alert = this.logAlert('MISSING_TABLES', `Backup falta tablas críticas: ${filename}`, {
          filePath,
          missingTables
        });
        return {
          valid: false,
          error: `Faltan tablas críticas: ${missingTables.join(', ')}`,
          filePath,
          sizeInMB: (stats.size / 1024 / 1024).toFixed(2),
          alert
        };
      }

      return {
        valid: true,
        filePath,
        sizeInMB: (stats.size / 1024 / 1024).toFixed(2),
        tableCount,
        createdAt: stats.birthtime.toISOString()
      };
    } catch (error) {
      const alert = this.logAlert('VALIDATION_ERROR', `Error validando backup: ${error.message}`, { filePath });
      return {
        valid: false,
        error: error.message,
        filePath,
        alert
      };
    }
  }

  /**
   * Valida todos los backups en el directorio
   */
  validateAllBackups() {
    try {
      if (!fs.existsSync(this.backupDir)) {
        this.logAlert('DIRECTORY_ERROR', 'Directorio de backups no encontrado', { backupDir: this.backupDir });
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

      // Registrar alerta si hay backups inválidos
      if (results.summary.invalidCount > 0) {
        this.logAlert('INVALID_BACKUPS_FOUND', `Se encontraron ${results.summary.invalidCount} backups inválidos`, {
          totalBackups: results.total,
          validCount: results.summary.validCount,
          invalidCount: results.summary.invalidCount,
          invalidFiles: results.invalid.map(b => ({ filename: path.basename(b.filePath), error: b.error }))
        });
      }

      return {
        success: true,
        ...results
      };
    } catch (error) {
      this.logAlert('VALIDATION_ERROR', `Error validando todos los backups: ${error.message}`, {});
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
      this.logAlert('REPORT_ERROR', `Error generando reporte: ${validation.error}`, {});
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

    // Registrar reporte en logs
    if (report.status === 'WARNING') {
      this.logAlert('BACKUP_REPORT', `Reporte de validación: ${report.summary.validBackups} válidos, ${report.summary.invalidBackups} inválidos`, {
        summary: report.summary
      });
    }

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
