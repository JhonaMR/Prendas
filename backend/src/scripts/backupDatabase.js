/**
 * Script de Backup Automático de Base de Datos
 * 
 * Realiza backups incrementales con estrategia de retención inteligente:
 * - Últimas 24h: cada 4 horas (6 backups)
 * - Última semana: 1 por día (7 backups)
 * - Último mes: 1 por semana (4 backups)
 * - Último año: 1 por mes (12 backups)
 * 
 * Uso:
 * - node src/scripts/backupDatabase.js (backup manual)
 * - Automático vía PM2 cron
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const googleDriveService = require('../services/GoogleDriveService');

// Configuración desde .env
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'inventory';
const BACKUPS_DIR = path.join(__dirname, '../../backups/database');

/**
 * Crear directorios si no existen
 */
function ensureDirectories() {
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    console.log('✓ Creada carpeta: backend/backups/database');
  }
}

/**
 * Obtener timestamp en formato YYYY-MM-DD-HH-MM-SS
 */
function getTimestamp() {
  const now = new Date();
  return now.toISOString()
    .replace('T', '-')
    .replace(/:/g, '-')
    .split('.')[0];
}

/**
 * Crear backup de la base de datos
 */
function createBackup() {
  try {
    const timestamp = getTimestamp();
    const backupName = `${DB_NAME}-backup-${timestamp}.sql`;
    const backupPath = path.join(BACKUPS_DIR, backupName);
    const compressedPath = `${backupPath}.gz`;

    console.log(`📦 Creando backup de ${DB_NAME}...`);

    // Comando mysqldump
    const mysqldumpCmd = `mysqldump -h ${DB_HOST} -u ${DB_USER} ${DB_PASSWORD ? `-p${DB_PASSWORD}` : ''} ${DB_NAME} > "${backupPath}"`;
    
    execSync(mysqldumpCmd, { stdio: 'inherit' });

    // Comprimir
    console.log('🗜️ Comprimiendo backup...');
    const gzipCmd = process.platform === 'win32'
      ? `gzip "${backupPath}"`
      : `gzip "${backupPath}"`;
    
    execSync(gzipCmd, { stdio: 'inherit' });

    const stats = fs.statSync(compressedPath);
    const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);

    console.log(`✓ Backup completado: ${backupName}.gz (${sizeInMB} MB)`);

    // Aplicar estrategia de retención
    applyRetentionPolicy();

    // Subir a Google Drive
    if (googleDriveService.enabled) {
      uploadToDrive(compressedPath, `${backupName}.gz`);
    }

  } catch (error) {
    console.error('✗ Error al crear backup:', error.message);
    process.exit(1);
  }
}

/**
 * Estrategia de retención de backups
 */
function applyRetentionPolicy() {
  try {
    const now = Date.now();
    const files = fs.readdirSync(BACKUPS_DIR)
      .filter(f => f.startsWith(`${DB_NAME}-backup-`) && f.endsWith('.sql.gz'))
      .map(f => {
        const filePath = path.join(BACKUPS_DIR, f);
        const stats = fs.statSync(filePath);
        return {
          name: f,
          path: filePath,
          mtime: stats.mtime.getTime(),
          age: now - stats.mtime.getTime()
        };
      })
      .sort((a, b) => b.mtime - a.mtime); // Más reciente primero

    const HOUR = 60 * 60 * 1000;
    const DAY = 24 * HOUR;
    const WEEK = 7 * DAY;
    const MONTH = 30 * DAY;

    const toKeep = new Set();
    let last4Hours = null;
    let lastDay = null;
    let lastWeek = null;
    let lastMonth = null;

    files.forEach(file => {
      const age = file.age;

      // Últimas 24 horas: cada 4 horas
      if (age < DAY) {
        const hours4 = Math.floor(age / (4 * HOUR));
        if (last4Hours !== hours4) {
          toKeep.add(file.name);
          last4Hours = hours4;
        }
      }
      // Última semana: 1 por día
      else if (age < WEEK) {
        const day = Math.floor(age / DAY);
        if (lastDay !== day) {
          toKeep.add(file.name);
          lastDay = day;
        }
      }
      // Último mes: 1 por semana
      else if (age < MONTH) {
        const week = Math.floor(age / WEEK);
        if (lastWeek !== week) {
          toKeep.add(file.name);
          lastWeek = week;
        }
      }
      // Último año: 1 por mes
      else if (age < 365 * DAY) {
        const month = Math.floor(age / MONTH);
        if (lastMonth !== month) {
          toKeep.add(file.name);
          lastMonth = month;
        }
      }
      // Más de 1 año: eliminar
    });

    // Eliminar backups que no están en la lista de mantener
    let deletedCount = 0;
    files.forEach(file => {
      if (!toKeep.has(file.name)) {
        fs.unlinkSync(file.path);
        deletedCount++;
      }
    });

    console.log(`✓ Estrategia de retención aplicada`);
    console.log(`  - Backups mantenidos: ${toKeep.size}`);
    console.log(`  - Backups eliminados: ${deletedCount}`);

  } catch (error) {
    console.error('⚠ Error al aplicar estrategia de retención:', error.message);
  }
}

/**
 * Subir a Google Drive
 */
async function uploadToDrive(backupPath, filename) {
  try {
    const instanceName = DB_NAME.includes('melas') ? 'melas' : 'plow';
    const mainFolderId = process.env[`GOOGLE_DRIVE_FOLDER_ID_${instanceName.toUpperCase()}`];

    if (!mainFolderId) {
      console.warn(`⚠️ No se encontró GOOGLE_DRIVE_FOLDER_ID_${instanceName.toUpperCase()} en .env`);
      return;
    }

    console.log(`☁️ Subiendo a Google Drive (${instanceName})...`);
    const dbFolderId = await googleDriveService.getOrCreateFolder('Database', mainFolderId);
    await googleDriveService.uploadFile(backupPath, filename, dbFolderId);
    console.log('✓ Subida completada');

  } catch (error) {
    console.error(`❌ Error al subir a Google Drive: ${error.message}`);
  }
}

/**
 * Listar backups disponibles
 */
function listBackups() {
  try {
    if (!fs.existsSync(BACKUPS_DIR)) {
      console.log('No hay backups aún');
      return;
    }

    const files = fs.readdirSync(BACKUPS_DIR)
      .filter(f => f.startsWith(`${DB_NAME}-backup-`) && f.endsWith('.sql.gz'))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.log('No hay backups disponibles');
      return;
    }

    console.log('\n📋 Backups disponibles:\n');
    files.forEach((file, index) => {
      const filePath = path.join(BACKUPS_DIR, file);
      const stats = fs.statSync(filePath);
      const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
      const date = new Date(stats.mtime).toLocaleString();
      const age = Date.now() - stats.mtime.getTime();
      const ageStr = age < 86400000 
        ? `${Math.floor(age / 3600000)}h` 
        : `${Math.floor(age / 86400000)}d`;
      console.log(`${index + 1}. ${file} (${sizeInMB} MB) - ${date} (${ageStr})`);
    });
    console.log();
  } catch (error) {
    console.error('Error al listar backups:', error.message);
  }
}

/**
 * Restaurar backup
 */
function restoreBackup(backupFile) {
  try {
    const backupPath = path.join(BACKUPS_DIR, backupFile);
    
    if (!fs.existsSync(backupPath)) {
      console.error(`✗ Backup no encontrado: ${backupFile}`);
      process.exit(1);
    }

    console.log(`⚠️  ADVERTENCIA: Esto sobrescribirá la base de datos ${DB_NAME}`);
    console.log('Presiona Ctrl+C para cancelar...');
    
    // Descomprimir
    const sqlPath = backupPath.replace('.gz', '');
    console.log('🗜️ Descomprimiendo...');
    execSync(`gunzip -c "${backupPath}" > "${sqlPath}"`, { stdio: 'inherit' });

    // Restaurar
    console.log('📥 Restaurando base de datos...');
    const restoreCmd = `mysql -h ${DB_HOST} -u ${DB_USER} ${DB_PASSWORD ? `-p${DB_PASSWORD}` : ''} ${DB_NAME} < "${sqlPath}"`;
    execSync(restoreCmd, { stdio: 'inherit' });

    // Limpiar archivo descomprimido
    fs.unlinkSync(sqlPath);

    console.log('✓ Restauración completada');

  } catch (error) {
    console.error('✗ Error al restaurar backup:', error.message);
    process.exit(1);
  }
}

// Ejecutar
ensureDirectories();

const command = process.argv[2];
const arg = process.argv[3];

if (command === 'list') {
  listBackups();
} else if (command === 'restore' && arg) {
  restoreBackup(arg);
} else if (command === 'restore') {
  console.log('Uso: node backupDatabase.js restore <nombre-archivo>');
  listBackups();
} else {
  createBackup();
}
