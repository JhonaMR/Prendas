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
 * GET /api/backups/validation/report
 * Obtiene el reporte de validación de backups
 */
exports.getValidationReport = (req, res) => {
  try {
    const report = backupExecutionService.validationService.generateReport();
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error obteniendo reporte de validación:', error);
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
 * Incluye validación automática del backup
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
        error: 'Error en backup de BD: ' + dbResult.error,
        alert: {
          type: 'ERROR',
          title: '❌ Error en Backup',
          message: 'No se pudo crear el backup de la base de datos',
          details: dbResult.error
        }
      });
    }

    // Validar el backup creado
    const backupPath = path.join(__dirname, '../../backups', dbResult.filename);
    const validationService = backupExecutionService.validationService;
    const validation = validationService.validateBackup(backupPath);

    let dbAlert = null;
    if (!validation.valid) {
      dbAlert = {
        type: 'WARNING',
        title: '⚠️ Backup Creado pero con Problemas',
        message: `El backup se creó pero tiene problemas: ${validation.error}`,
        details: {
          filename: dbResult.filename,
          error: validation.error,
          sizeInMB: validation.sizeInMB
        }
      };
    } else {
      dbAlert = {
        type: 'SUCCESS',
        title: '✅ Backup de BD Exitoso',
        message: `Backup creado correctamente: ${dbResult.filename}`,
        details: {
          filename: dbResult.filename,
          sizeInMB: dbResult.sizeInMB,
          tableCount: validation.tableCount,
          type: dbResult.type
        }
      };
    }

    // 2. Backup de Imágenes
    let imagesResult = { success: true, message: 'Sin imágenes para respaldar' };
    let imagesAlert = null;
    
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
            message: `Backup de imágenes completado: ${backupName} (${sizeInMB} MB)`,
            filename: backupName,
            sizeInMB
          };

          imagesAlert = {
            type: 'SUCCESS',
            title: '✅ Backup de Imágenes Exitoso',
            message: `${files.length} imágenes respaldadas correctamente`,
            details: {
              filename: backupName,
              sizeInMB,
              imageCount: files.length
            }
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
        } else {
          imagesAlert = {
            type: 'INFO',
            title: 'ℹ️ Sin Imágenes',
            message: 'No hay imágenes para respaldar',
            details: {}
          };
        }
      } else {
        imagesAlert = {
          type: 'INFO',
          title: 'ℹ️ Directorio de Imágenes No Encontrado',
          message: 'El directorio de imágenes no existe',
          details: {}
        };
      }
    } catch (imagesError) {
      console.error('Error en backup de imágenes:', imagesError);
      imagesResult = {
        success: false,
        message: 'Error en backup de imágenes: ' + imagesError.message
      };
      imagesAlert = {
        type: 'WARNING',
        title: '⚠️ Error en Backup de Imágenes',
        message: 'No se pudo completar el backup de imágenes',
        details: {
          error: imagesError.message
        }
      };
    }

    // Retornar resultado combinado con alertas
    res.json({
      success: validation.valid && imagesResult.success,
      message: 'Backup manual completado',
      data: {
        database: {
          ...dbResult,
          validation: {
            valid: validation.valid,
            tableCount: validation.tableCount,
            sizeInMB: validation.sizeInMB
          }
        },
        images: imagesResult
      },
      alerts: [
        dbAlert,
        imagesAlert
      ].filter(a => a !== null)
    });
  } catch (error) {
    console.error('Error ejecutando backup manual:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      alert: {
        type: 'ERROR',
        title: '❌ Error en Backup Manual',
        message: 'Ocurrió un error inesperado durante el backup',
        details: error.message
      }
    });
  }
};
