/**
 * Servicio para ejecutar backups de PostgreSQL
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const BackupRotationService = require('./BackupRotationService');
const BackupValidationService = require('./BackupValidationService');
const googleDriveService = require('./GoogleDriveService');

const execAsync = promisify(exec);

/**
 * Limpia logs de backup más antiguos de 30 días
 */
function cleanOldBackupLogs() {
  const logsDir = path.join(__dirname, '../../logs');
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  const logFiles = [
    'backup-out.log',
    'backup-error.log',
    'out.log',
    'error.log'
  ];

  logFiles.forEach(logFile => {
    const logPath = path.join(logsDir, logFile);
    if (fs.existsSync(logPath)) {
      const stats = fs.statSync(logPath);
      if (stats.mtimeMs < thirtyDaysAgo) {
        try {
          fs.unlinkSync(logPath);
          console.log(`🗑️  Log antiguo eliminado: ${logFile}`);
        } catch (error) {
          console.warn(`⚠️  No se pudo eliminar log: ${logFile} - ${error.message}`);
        }
      }
    }
  });
}

class BackupExecutionService {
  constructor(backupDir = null) {
    // Si no se proporciona backupDir, determinar basado en DB_NAME
    if (!backupDir) {
      const dbName = process.env.DB_NAME || 'inventory';
      const instanceName = dbName.includes('melas') ? 'melas' : 'plow';
      backupDir = path.join(__dirname, '../../backups', instanceName);
    }
    
    this.backupDir = backupDir;
    this.instanceName = this.extractInstanceName();
    this.rotationService = new BackupRotationService(backupDir);
    this.validationService = new BackupValidationService(backupDir);
  }

  /**
   * Extrae el nombre de la instancia del backupDir
   */
  extractInstanceName() {
    const parts = this.backupDir.split(path.sep);
    const lastPart = parts[parts.length - 1];
    return lastPart === 'plow' || lastPart === 'melas' ? lastPart : 'plow';
  }

  /**
   * Ejecuta un backup de la base de datos
   */
  async executeBackup() {
    try {
      // Limpiar logs antiguos (más de 30 días)
      cleanOldBackupLogs();

      // Determinar tipo de backup
      const backupType = this.rotationService.getBackupType();
      const filename = this.rotationService.generateBackupFilename(backupType);
      const backupPath = path.join(this.backupDir, filename);

      // Credenciales de BD
      const dbUser = process.env.DB_USER || 'postgres';
      const dbPassword = process.env.DB_PASSWORD;
      const dbHost = process.env.DB_HOST || 'localhost';
      const dbPort = process.env.DB_PORT || 5433;
      const dbName = process.env.DB_NAME || 'inventory';

      if (!dbPassword) {
        throw new Error('DB_PASSWORD no está configurada en variables de entorno');
      }

      // Comando pg_dump - respalda toda la BD con todas las tablas
      // Opciones:
      // --encoding=UTF8: Especifica codificación UTF-8 explícitamente
      // --clean: Incluye DROP TABLE para limpiar antes de restaurar
      // --if-exists: Evita errores si las tablas no existen
      // --create: Incluye CREATE DATABASE (útil para restauración completa)
      // --no-password: No pide contraseña (usa PGPASSWORD)
      // -F p: Formato plano (SQL)
      // -f: Archivo de salida (mejor que redirección en Windows)
      // -v: Verbose para ver qué está pasando
      // 
      // NOTA: --clean es seguro aquí porque solo afecta al RESTAURAR, no al hacer backup
      const command = `pg_dump --encoding=UTF8 --clean --if-exists --create --no-password -U ${dbUser} -h ${dbHost} -p ${dbPort} -d ${dbName} -F p -v -f "${backupPath}"`;

      console.log(`\n🔄 [${new Date().toISOString()}] Iniciando backup ${backupType}...`);
      console.log(`📁 Archivo: ${filename}`);
      console.log(`🗄️  Base de datos: ${dbName}`);
      console.log(`🖥️  Host: ${dbHost}:${dbPort}`);
      console.log(`📊 Incluye: Todas las tablas (clientes, referencias, pedidos, despachos, recepciones, compras, fichas, movimientos, auditoría, etc.)`);

      // Ejecutar backup
      const env = { ...process.env, PGPASSWORD: dbPassword };
      await execAsync(command, { env, maxBuffer: 10 * 1024 * 1024 });

      // Verificar que el archivo se creó
      if (!fs.existsSync(backupPath)) {
        throw new Error('El archivo de backup no se creó');
      }

      const stats = fs.statSync(backupPath);
      const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);

      console.log(`✅ Backup ${backupType} completado`);
      console.log(`📦 Tamaño: ${sizeInMB} MB`);

      // Validar integridad del backup
      console.log(`🔍 Validando integridad del backup...`);
      const validation = this.validationService.validateBackup(backupPath);
      
      if (!validation.valid) {
        console.warn(`⚠️  ADVERTENCIA: El backup puede estar corrupto: ${validation.error}`);
        console.warn(`   Intenta ejecutar: node scripts/validate-and-clean-backups.js`);
      } else {
        console.log(`✅ Backup validado correctamente (${validation.tableCount} tablas)`);
      }

      // Rotar backups antiguos
      const deleted = this.rotationService.rotateBackups();
      if (deleted.length > 0) {
        console.log(`🗑️  Backups eliminados por política de retención:`);
        deleted.forEach(d => {
          console.log(`   - ${d.filename} (${d.type}): ${d.reason}`);
        });
      }

      // Mostrar estadísticas
      const stats_info = this.rotationService.getStorageStats();
      console.log(`\n📊 Estadísticas de almacenamiento:`);
      console.log(`   Total: ${stats_info.totalBackups} backups, ${stats_info.totalSizeInMB} MB`);
      console.log(`   Diarios: ${stats_info.byType.daily.count} (${stats_info.byType.daily.sizeInMB} MB)`);
      console.log(`   Semanales: ${stats_info.byType.weekly.count} (${stats_info.byType.weekly.sizeInMB} MB)`);
      console.log(`   Mensuales: ${stats_info.byType.monthly.count} (${stats_info.byType.monthly.sizeInMB} MB)\n`);

      // SUBIR A GOOGLE DRIVE
      if (googleDriveService.enabled) {
        try {
          const mainFolderId = process.env[`GOOGLE_DRIVE_FOLDER_ID_${this.instanceName.toUpperCase()}`];
          if (mainFolderId) {
            console.log(`☁️ Iniciando subida a Google Drive (${this.instanceName})...`);
            const dbFolderId = await googleDriveService.getOrCreateFolder('Database', mainFolderId);
            await googleDriveService.uploadFile(backupPath, filename, dbFolderId);
          } else {
            console.warn(`⚠️ No se encontró GOOGLE_DRIVE_FOLDER_ID_${this.instanceName.toUpperCase()} en .env`);
          }
        } catch (driveError) {
          console.error(`❌ Error al subir a Google Drive: ${driveError.message}`);
        }
      }

      return {
        success: true,
        filename,
        type: backupType,
        path: backupPath,
        sizeInMB,
        createdAt: new Date().toISOString(),
        deleted,
        stats: stats_info,
        instance: this.instanceName
      };
    } catch (error) {
      console.error(`❌ Error durante backup: ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Restaura una base de datos desde un backup
   */
  async restoreBackup(backupFilename) {
    try {
      const backupPath = path.join(this.backupDir, backupFilename);

      // Validar que el archivo existe
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Archivo de backup no encontrado: ${backupFilename}`);
      }

      // Credenciales de BD
      const dbUser = process.env.DB_USER || 'postgres';
      const dbPassword = process.env.DB_PASSWORD;
      const dbHost = process.env.DB_HOST || 'localhost';
      const dbPort = process.env.DB_PORT || 5433;
      const dbName = process.env.DB_NAME || 'inventory';

      if (!dbPassword) {
        throw new Error('DB_PASSWORD no está configurada en variables de entorno');
      }

      console.log(`\n🔄 Iniciando restauración desde: ${backupFilename}`);
      console.log(`🗄️  Base de datos: ${dbName}`);

      // Primero, hacer backup de seguridad del estado actual
      console.log(`💾 Creando backup de seguridad del estado actual...`);
      const securityBackupResult = await this.executeBackup();
      if (!securityBackupResult.success) {
        throw new Error('No se pudo crear backup de seguridad: ' + securityBackupResult.error);
      }
      console.log(`✅ Backup de seguridad creado: ${securityBackupResult.filename}`);

      // Comando psql para restaurar - usar -f en lugar de stdin
      // Esto es más confiable en Windows
      const command = `psql --no-password -U ${dbUser} -h ${dbHost} -p ${dbPort} -d ${dbName} -f "${backupPath}"`;

      const env = { ...process.env, PGPASSWORD: dbPassword };
      const { stdout, stderr } = await execAsync(command, { env, maxBuffer: 10 * 1024 * 1024 });

      console.log(`✅ Restauración completada exitosamente`);

      return {
        success: true,
        restoredFrom: backupFilename,
        securityBackup: securityBackupResult.filename,
        restoredAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ Error durante restauración: ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene información de un backup específico
   */
  getBackupInfo(backupFilename) {
    const backupPath = path.join(this.backupDir, backupFilename);

    if (!fs.existsSync(backupPath)) {
      return null;
    }

    const stats = fs.statSync(backupPath);
    return {
      filename: backupFilename,
      path: backupPath,
      size: stats.size,
      sizeInMB: (stats.size / 1024 / 1024).toFixed(2),
      createdAt: stats.birthtime,
      createdAtISO: stats.birthtime.toISOString()
    };
  }
}

module.exports = BackupExecutionService;
