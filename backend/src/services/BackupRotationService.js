/**
 * Servicio de rotación de backups con estrategia mixta
 * - Últimos 7 backups diarios
 * - 4 backups semanales (domingos)
 * - 3 backups mensuales (primer día del mes)
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class BackupRotationService {
  constructor(backupDir = path.join(__dirname, '../../backups')) {
    this.backupDir = backupDir;
    this.ensureBackupDir();
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Genera nombre de archivo con tipo de backup
   */
  generateBackupFilename(type = 'daily') {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0];
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    
    let prefix = 'daily';
    if (type === 'weekly') prefix = 'weekly';
    if (type === 'monthly') prefix = 'monthly';
    
    return `inventory-backup-${prefix}-${timestamp}-${time}.sql`;
  }

  /**
   * Determina el tipo de backup que debe hacerse hoy
   */
  getBackupType() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = domingo
    const dayOfMonth = now.getDate();

    // Primer día del mes = backup mensual
    if (dayOfMonth === 1) {
      return 'monthly';
    }

    // Domingo = backup semanal
    if (dayOfWeek === 0) {
      return 'weekly';
    }

    // Resto de días = backup diario
    return 'daily';
  }

  /**
   * Obtiene todos los backups agrupados por tipo
   */
  getBackupsByType() {
    const files = fs.readdirSync(this.backupDir);
    const backups = {
      daily: [],
      weekly: [],
      monthly: []
    };

    files.forEach(file => {
      if (!file.startsWith('inventory-backup-')) return;

      const fullPath = path.join(this.backupDir, file);
      const stats = fs.statSync(fullPath);

      const backup = {
        filename: file,
        path: fullPath,
        size: stats.size,
        sizeInMB: (stats.size / 1024 / 1024).toFixed(2),
        createdAt: stats.birthtime,
        createdAtISO: stats.birthtime.toISOString()
      };

      if (file.includes('-daily-')) {
        backups.daily.push(backup);
      } else if (file.includes('-weekly-')) {
        backups.weekly.push(backup);
      } else if (file.includes('-monthly-')) {
        backups.monthly.push(backup);
      }
    });

    // Ordenar por fecha descendente (más recientes primero)
    Object.keys(backups).forEach(type => {
      backups[type].sort((a, b) => b.createdAt - a.createdAt);
    });

    return backups;
  }

  /**
   * Elimina backups antiguos según la política de retención
   */
  rotateBackups() {
    const backups = this.getBackupsByType();
    const deleted = [];

    // Mantener máximo 7 backups diarios
    if (backups.daily.length > 7) {
      const toDelete = backups.daily.slice(7);
      toDelete.forEach(backup => {
        fs.unlinkSync(backup.path);
        deleted.push({
          filename: backup.filename,
          type: 'daily',
          reason: 'Excede límite de 7 backups diarios'
        });
      });
    }

    // Mantener máximo 4 backups semanales
    if (backups.weekly.length > 4) {
      const toDelete = backups.weekly.slice(4);
      toDelete.forEach(backup => {
        fs.unlinkSync(backup.path);
        deleted.push({
          filename: backup.filename,
          type: 'weekly',
          reason: 'Excede límite de 4 backups semanales'
        });
      });
    }

    // Mantener máximo 3 backups mensuales
    if (backups.monthly.length > 3) {
      const toDelete = backups.monthly.slice(3);
      toDelete.forEach(backup => {
        fs.unlinkSync(backup.path);
        deleted.push({
          filename: backup.filename,
          type: 'monthly',
          reason: 'Excede límite de 3 backups mensuales'
        });
      });
    }

    return deleted;
  }

  /**
   * Obtiene estadísticas de almacenamiento
   */
  getStorageStats() {
    const backups = this.getBackupsByType();
    let totalSize = 0;
    let totalCount = 0;

    Object.values(backups).forEach(typeBackups => {
      typeBackups.forEach(backup => {
        totalSize += backup.size;
        totalCount++;
      });
    });

    return {
      totalBackups: totalCount,
      totalSizeInMB: (totalSize / 1024 / 1024).toFixed(2),
      totalSizeInGB: (totalSize / 1024 / 1024 / 1024).toFixed(3),
      byType: {
        daily: {
          count: backups.daily.length,
          sizeInMB: (backups.daily.reduce((sum, b) => sum + b.size, 0) / 1024 / 1024).toFixed(2)
        },
        weekly: {
          count: backups.weekly.length,
          sizeInMB: (backups.weekly.reduce((sum, b) => sum + b.size, 0) / 1024 / 1024).toFixed(2)
        },
        monthly: {
          count: backups.monthly.length,
          sizeInMB: (backups.monthly.reduce((sum, b) => sum + b.size, 0) / 1024 / 1024).toFixed(2)
        }
      }
    };
  }

  /**
   * Lista todos los backups disponibles
   */
  listAllBackups() {
    const backups = this.getBackupsByType();
    const all = [];

    Object.entries(backups).forEach(([type, typeBackups]) => {
      typeBackups.forEach(backup => {
        all.push({
          ...backup,
          type
        });
      });
    });

    return all.sort((a, b) => b.createdAt - a.createdAt);
  }
}

module.exports = BackupRotationService;
