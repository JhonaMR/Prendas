/**
 * Controlador para gestión de backups
 */

const BackupExecutionService = require('../services/BackupExecutionService');
const BackupRotationService = require('../services/BackupRotationService');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const multer = require('multer');

// Multer: almacenamiento temporal en memoria para dumps subidos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB máximo
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.sql')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos .sql'));
    }
  }
});

// Inicializar servicios - detectan automáticamente la instancia
const backupExecutionService = new BackupExecutionService();

// BackupRotationService necesita la misma carpeta que BackupExecutionService
const backupRotationService = new BackupRotationService(backupExecutionService.backupDir);

/**
 * GET /api/backups/instance/current
 * Obtiene la instancia actual (plow o melas)
 */
exports.getCurrentInstance = (req, res) => {
  try {
    const instance = backupExecutionService.instanceName;
    const dbName = process.env.DB_NAME || 'inventory';

    res.json({
      success: true,
      instance,
      dbName,
      port: process.env.PORT || 3000
    });
  } catch (error) {
    console.error('Error obteniendo instancia actual:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * GET /api/backups
 * Lista todos los backups disponibles
 */
exports.listBackups = (req, res) => {
  try {
    const backups = backupRotationService.listAllBackups();
    const stats = backupRotationService.getStorageStats();
    const instance = backupExecutionService.instanceName;

    res.json({
      success: true,
      instance,
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
    const instance = backupExecutionService.instanceName;

    res.json({
      success: true,
      instance,
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
 * POST /api/backups/full-dump
 * Genera un dump completo de la BD (schema + datos + índices + todo)
 * Solo disponible para usuario Soporte
 */
exports.executeFullDump = async (req, res) => {
  try {
    const dbUser     = process.env.DB_USER     || 'postgres';
    const dbPassword = process.env.DB_PASSWORD;
    const dbHost     = process.env.DB_HOST     || 'localhost';
    const dbPort     = process.env.DB_PORT     || 5433;
    const dbName     = process.env.DB_NAME     || 'inventory';

    if (!dbPassword) {
      return res.status(500).json({ success: false, error: 'DB_PASSWORD no configurada' });
    }

    const instanceName = backupExecutionService.instanceName; // 'plow' o 'melas'

    // Carpeta: backups/{instancia}/full-dumps/
    const fullDumpsDir = path.join(
      __dirname, '../../backups', instanceName,
      `full-dump-${instanceName}`
    );

    if (!fs.existsSync(fullDumpsDir)) {
      fs.mkdirSync(fullDumpsDir, { recursive: true });
    }

    // Nombre del archivo con timestamp
    const now = new Date();
    const timestamp = now.toISOString()
      .replace('T', '-')
      .replace(/:/g, '-')
      .split('.')[0];

    const filename = `full-dump-${instanceName}-${timestamp}.sql`;
    const dumpPath = path.join(fullDumpsDir, filename);

    // pg_dump completo: schema + datos + índices + secuencias + triggers + funciones
    // --clean --if-exists: genera DROP TABLE IF EXISTS antes de cada CREATE TABLE,
    // garantizando que al restaurar se reescriba toda la BD desde cero sin conflictos
    // de primary key ni datos residuales de tablas que ya existían.
    const command = [
      'pg_dump',
      '--encoding=UTF8',
      '--no-password',
      '--verbose',
      '--format=plain',        // SQL plano, legible y portable
      '--clean',               // Incluye DROP TABLE IF EXISTS antes de cada CREATE
      '--if-exists',           // Evita errores si la tabla no existe al hacer DROP
      '--no-owner',            // No incluir SET OWNER (evita errores de roles)
      '--no-acl',              // No incluir GRANT/REVOKE
      `-U ${dbUser}`,
      `-h ${dbHost}`,
      `-p ${dbPort}`,
      `-d ${dbName}`,
      `-f "${dumpPath}"`
    ].join(' ');

    const env = { ...process.env, PGPASSWORD: dbPassword };
    await execAsync(command, { env, maxBuffer: 50 * 1024 * 1024 });

    if (!fs.existsSync(dumpPath)) {
      throw new Error('El archivo de dump no se creó');
    }

    const stats = fs.statSync(dumpPath);
    const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);

    console.log(`✅ Full dump generado: ${filename} (${sizeInMB} MB)`);

    res.json({
      success: true,
      message: `Full dump generado correctamente`,
      filename,
      sizeInMB,
      instance: instanceName,
      path: dumpPath,
      createdAt: now.toISOString()
    });
  } catch (error) {
    console.error('Error generando full dump:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/backups/full-dumps/list
 * Lista los full dumps disponibles para la instancia actual
 */
exports.listFullDumps = (req, res) => {
  try {
    const instanceName = backupExecutionService.instanceName;
    const fullDumpsDir = path.join(
      __dirname, '../../backups', instanceName,
      `full-dump-${instanceName}`
    );

    if (!fs.existsSync(fullDumpsDir)) {
      return res.json({ success: true, dumps: [], instance: instanceName });
    }

    const dumps = fs.readdirSync(fullDumpsDir)
      .filter(f => f.endsWith('.sql'))
      .map(f => {
        const filePath = path.join(fullDumpsDir, f);
        const stats = fs.statSync(filePath);
        return {
          filename: f,
          sizeInMB: (stats.size / 1024 / 1024).toFixed(2),
          createdAt: stats.birthtime.toISOString(),
          createdAtISO: stats.birthtime.toISOString()
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ success: true, dumps, instance: instanceName });
  } catch (error) {
    console.error('Error listando full dumps:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/backups/upload-dump
 * Recibe un archivo .sql, hace backup de seguridad y lo carga en la BD actual
 * Solo disponible para usuario Soporte
 */
exports.uploadDump = [
  upload.single('dumpFile'),
  async (req, res) => {
    let tempFilePath = null;

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No se recibió ningún archivo' });
      }

      const dbUser     = process.env.DB_USER     || 'postgres';
      const dbPassword = process.env.DB_PASSWORD;
      const dbHost     = process.env.DB_HOST     || 'localhost';
      const dbPort     = process.env.DB_PORT     || 5433;
      const dbName     = process.env.DB_NAME     || 'inventory';

      if (!dbPassword) {
        return res.status(500).json({ success: false, error: 'DB_PASSWORD no configurada' });
      }

      // Guardar el buffer en un archivo temporal
      const os = require('os');
      const tempDir = os.tmpdir();
      const tempFilename = `upload-dump-${Date.now()}.sql`;
      tempFilePath = path.join(tempDir, tempFilename);
      fs.writeFileSync(tempFilePath, req.file.buffer);

      console.log(`📥 Dump recibido: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)} MB)`);

      // 1. Backup de seguridad automático antes de cargar
      console.log('💾 Creando backup de seguridad antes de cargar dump...');
      const securityBackup = await backupExecutionService.executeBackup();
      if (!securityBackup.success) {
        return res.status(500).json({
          success: false,
          error: 'No se pudo crear backup de seguridad previo: ' + securityBackup.error
        });
      }
      console.log(`✅ Backup de seguridad creado: ${securityBackup.filename}`);

      // 2. Cargar el dump en la BD actual
      // -v ON_ERROR_STOP=1: detiene la ejecución ante el primer error real y
      //   retorna exit code != 0, permitiendo detectar fallos correctamente.
      // --single-transaction: envuelve todo en una transacción; si algo falla
      //   hace rollback completo en lugar de dejar la BD en estado parcial.
      const command = [
        'psql',
        '--no-password',
        '-v ON_ERROR_STOP=1',
        '--single-transaction',
        `-U ${dbUser}`,
        `-h ${dbHost}`,
        `-p ${dbPort}`,
        `-d ${dbName}`,
        `-f "${tempFilePath}"`
      ].join(' ');

      const env = { ...process.env, PGPASSWORD: dbPassword };

      console.log(`🔄 Cargando dump en BD: ${dbName}...`);
      let psqlStdout = '';
      let psqlStderr = '';
      try {
        const result = await execAsync(command, {
          env,
          maxBuffer: 50 * 1024 * 1024,
          timeout: 10 * 60 * 1000 // 10 minutos máximo
        });
        psqlStdout = result.stdout || '';
        psqlStderr = result.stderr || '';
      } catch (psqlError) {
        // execAsync lanza error cuando exit code != 0 (ON_ERROR_STOP activado)
        const errorDetail = psqlError.stderr || psqlError.message || 'Error desconocido en psql';
        console.error('❌ Error al cargar dump:', errorDetail);
        return res.status(500).json({
          success: false,
          error: `Error al ejecutar el dump: ${errorDetail}`
        });
      }

      console.log('✅ Dump cargado exitosamente');

      res.json({
        success: true,
        message: 'Dump cargado exitosamente en la base de datos',
        originalFile: req.file.originalname,
        sizeInMB: (req.file.size / 1024 / 1024).toFixed(2),
        securityBackup: securityBackup.filename,
        instance: backupExecutionService.instanceName
      });
    } catch (error) {
      console.error('Error cargando dump:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error desconocido al cargar el dump'
      });
    } finally {
      // Limpiar archivo temporal siempre
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try { fs.unlinkSync(tempFilePath); } catch (_) {}
      }
    }
  }
];
exports.getBackupInfo = (req, res) => {
  try {
    const { filename } = req.params;
    const backupInfo = backupExecutionService.getBackupInfo(filename);
    const instance = backupExecutionService.instanceName;

    if (!backupInfo) {
      return res.status(404).json({
        success: false,
        error: 'Backup no encontrado'
      });
    }

    res.json({
      success: true,
      instance,
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
    const backupPath = path.join(__dirname, '../../backups', backupExecutionService.instanceName, dbResult.filename);
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
      const instanceName = backupExecutionService.instanceName;
      
      if (fs.existsSync(imagesDir)) {
        const files = fs.readdirSync(imagesDir);
        
        if (files.length > 0) {
          const backupsDir = path.join(__dirname, '../../backups', instanceName, 'images');
          
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
      instance: backupExecutionService.instanceName,
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
