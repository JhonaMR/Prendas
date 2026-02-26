/**
 * Controlador para gestión de backups
 */

const BackupExecutionService = require('../services/BackupExecutionService');
const BackupRotationService = require('../services/BackupRotationService');
const path = require('path');

const backupExecutionService = new BackupExecutionService();
const backupRotationService = new BackupRotationService();

/**
 * GET /api/backups
 * Lista todos los backups disponibles
 */
exports.listBackups = (req, res) => {
  try {
    const backups = backupRotationService.listAllBackups();
    const stats = backupRotationService.getStorageStats();

    res.json({
      success: true,
      backups,
      stats,
      count: backups.length
    });
  } catch (error) {
    console.error('Error listando backups:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * GET /api/backups/stats
 * Obtiene estadísticas de almacenamiento
 */
exports.getBackupStats = (req, res) => {
  try {
    const stats = backupRotationService.getStorageStats();
    const backups = backupRotationService.getBackupsByType();

    res.json({
      success: true,
      stats,
      backupsByType: {
        daily: backups.daily.map(b => ({
          filename: b.filename,
          sizeInMB: b.sizeInMB,
          createdAt: b.createdAtISO
        })),
        weekly: backups.weekly.map(b => ({
          filename: b.filename,
          sizeInMB: b.sizeInMB,
          createdAt: b.createdAtISO
        })),
        monthly: backups.monthly.map(b => ({
          filename: b.filename,
          sizeInMB: b.sizeInMB,
          createdAt: b.createdAtISO
        }))
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * POST /api/backups/restore
 * Restaura una base de datos desde un backup
 */
exports.restoreBackup = async (req, res) => {
  try {
    const { backupFilename } = req.body;

    if (!backupFilename) {
      return res.status(400).json({
        success: false,
        error: 'backupFilename es requerido'
      });
    }

    // Validar que el archivo existe
    const backupInfo = backupExecutionService.getBackupInfo(backupFilename);
    if (!backupInfo) {
      return res.status(404).json({
        success: false,
        error: 'Backup no encontrado'
      });
    }

    // Ejecutar restauración
    const result = await backupExecutionService.restoreBackup(backupFilename);

    if (result.success) {
      res.json({
        success: true,
        message: 'Backup restaurado exitosamente',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error restaurando backup:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * GET /api/backups/:filename
 * Obtiene información de un backup específico
 */
exports.getBackupInfo = (req, res) => {
  try {
    const { filename } = req.params;
    const backupInfo = backupExecutionService.getBackupInfo(filename);

    if (!backupInfo) {
      return res.status(404).json({
        success: false,
        error: 'Backup no encontrado'
      });
    }

    res.json({
      success: true,
      backup: backupInfo
    });
  } catch (error) {
    console.error('Error obteniendo información del backup:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * POST /api/backups/manual
 * Ejecuta un backup manual inmediato (BD + Imágenes)
 */
exports.executeManualBackup = async (req, res) => {
  try {
    const { execSync } = require('child_process');
    const fs = require('fs');

    // 1. Backup de Base de Datos
    const dbResult = await backupExecutionService.executeBackup();

    if (!dbResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Error en backup de BD: ' + dbResult.error
      });
    }

    // 2. Backup de Imágenes
    let imagesResult = { success: true, message: 'Sin imágenes para respaldar' };
    
    try {
      const imagesDir = path.join(__dirname, '../../../public/images/references');
      
      if (fs.existsSync(imagesDir)) {
        const files = fs.readdirSync(imagesDir);
        
        if (files.length > 0) {
          const backupsDir = path.join(__dirname, '../../backups/images');
          
          // Crear directorio si no existe
          if (!fs.existsSync(backupsDir)) {
            fs.mkdirSync(backupsDir, { recursive: true });
          }

          // Crear timestamp
          const now = new Date();
          const timestamp = now.toISOString()
            .replace('T', '-')
            .replace(/:/g, '-')
            .split('.')[0];
          
          const backupName = `images-backup-${timestamp}.tar.gz`;
          const backupPath = path.join(backupsDir, backupName);

          // Crear archivo comprimido
          const command = process.platform === 'win32'
            ? `cd "${imagesDir}" && tar -czf "${backupPath}" .`
            : `tar -czf "${backupPath}" -C "${imagesDir}" .`;

          execSync(command, { stdio: 'pipe' });

          const stats = fs.statSync(backupPath);
          const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);

          imagesResult = {
            success: true,
            message: `Backup de imágenes completado: ${backupName} (${sizeInMB} MB)`
          };

          // Limpiar backups antiguos (mantener últimos 30)
          const allBackups = fs.readdirSync(backupsDir)
            .filter(f => f.startsWith('images-backup-') && f.endsWith('.tar.gz'))
            .sort()
            .reverse();

          if (allBackups.length > 30) {
            const filesToDelete = allBackups.slice(30);
            filesToDelete.forEach(file => {
              fs.unlinkSync(path.join(backupsDir, file));
            });
          }
        }
      }
    } catch (imagesError) {
      console.error('Error en backup de imágenes:', imagesError);
      imagesResult = {
        success: false,
        message: 'Error en backup de imágenes: ' + imagesError.message
      };
    }

    // Retornar resultado combinado
    res.json({
      success: true,
      message: 'Backup manual completado',
      data: {
        database: dbResult,
        images: imagesResult
      }
    });
  } catch (error) {
    console.error('Error ejecutando backup manual:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
