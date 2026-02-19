/**
 * Servicio para ejecutar backups de PostgreSQL
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const BackupRotationService = require('./BackupRotationService');

const execAsync = promisify(exec);

class BackupExecutionService {
  constructor(backupDir = path.join(__dirname, '../../backups')) {
    this.backupDir = backupDir;
    this.rotationService = new BackupRotationService(backupDir);
  }

  /**
   * Ejecuta un backup de la base de datos
   */
  async executeBackup() {
    try {
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

      // Comando pg_dump
      const command = `pg_dump -U ${dbUser} -h ${dbHost} -p ${dbPort} -d ${dbName} -F p > "${backupPath}"`;

      console.log(`\n🔄 [${new Date().toISOString()}] Iniciando backup ${backupType}...`);
      console.log(`📁 Archivo: ${filename}`);
      console.log(`🗄️  Base de datos: ${dbName}`);
      console.log(`🖥️  Host: ${dbHost}:${dbPort}`);

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

      return {
        success: true,
        filename,
        type: backupType,
        path: backupPath,
        sizeInMB,
        createdAt: new Date().toISOString(),
        deleted,
        stats: stats_info
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

      // Comando psql para restaurar
      const command = `psql -U ${dbUser} -h ${dbHost} -p ${dbPort} -d ${dbName} < "${backupPath}"`;

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
