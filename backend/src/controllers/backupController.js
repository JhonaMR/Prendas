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
 * Ejecuta un backup manual inmediato
 */
exports.executeManualBackup = async (req, res) => {
  try {
    const result = await backupExecutionService.executeBackup();

    if (result.success) {
      res.json({
        success: true,
        message: 'Backup ejecutado exitosamente',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error ejecutando backup manual:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
