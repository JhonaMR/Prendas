/**
 * Script de Backup Automático de Imágenes
 * 
 * Realiza backup diario de las imágenes en backend/public/images/references
 * Comprime los archivos en formato .tar.gz con timestamp
 * 
 * Uso:
 * - node src/scripts/backupImages.js (backup manual)
 * - Automático vía PM2 cron (ver ecosystem.config.js)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuración
const IMAGES_DIR = path.join(__dirname, '../../../public/images/references');
const BACKUPS_DIR = path.join(__dirname, '../../backups/images');
const MAX_BACKUPS = 30; // Mantener últimos 30 backups

/**
 * Crear directorios si no existen
 */
function ensureDirectories() {
  if (!fs.existsSync(path.join(__dirname, '../../../public/images'))) {
    fs.mkdirSync(path.join(__dirname, '../../../public/images'), { recursive: true });
    console.log('✓ Creada carpeta: public/images');
  }

  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log('✓ Creada carpeta: public/images/references');
  }

  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    console.log('✓ Creada carpeta: backend/backups/images');
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
 * Crear backup comprimido
 */
function createBackup() {
  try {
    // Verificar si hay imágenes para respaldar
    if (!fs.existsSync(IMAGES_DIR)) {
      console.log('⚠ Carpeta de imágenes no existe aún. Creando estructura...');
      ensureDirectories();
      return;
    }

    const files = fs.readdirSync(IMAGES_DIR);
    
    if (files.length === 0) {
      console.log('ℹ No hay imágenes para respaldar');
      return;
    }

    const timestamp = getTimestamp();
    const backupName = `images-backup-${timestamp}.tar.gz`;
    const backupPath = path.join(BACKUPS_DIR, backupName);

    // Crear archivo comprimido
    console.log(`📦 Creando backup: ${backupName}`);
    
    // Comando para comprimir (compatible con Windows y Linux)
    const command = process.platform === 'win32'
      ? `cd "${IMAGES_DIR}" && tar -czf "${backupPath}" .`
      : `tar -czf "${backupPath}" -C "${IMAGES_DIR}" .`;

    execSync(command, { stdio: 'inherit' });

    const stats = fs.statSync(backupPath);
    const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);

    console.log(`✓ Backup completado: ${backupName} (${sizeInMB} MB)`);

    // Limpiar backups antiguos
    cleanOldBackups();

  } catch (error) {
    console.error('✗ Error al crear backup:', error.message);
    process.exit(1);
  }
}

/**
 * Eliminar backups antiguos (mantener solo los últimos MAX_BACKUPS)
 */
function cleanOldBackups() {
  try {
    const files = fs.readdirSync(BACKUPS_DIR)
      .filter(f => f.startsWith('images-backup-') && f.endsWith('.tar.gz'))
      .sort()
      .reverse();

    if (files.length > MAX_BACKUPS) {
      const filesToDelete = files.slice(MAX_BACKUPS);
      
      filesToDelete.forEach(file => {
        const filePath = path.join(BACKUPS_DIR, file);
        fs.unlinkSync(filePath);
        console.log(`🗑 Eliminado backup antiguo: ${file}`);
      });

      console.log(`✓ Limpieza completada. Backups mantenidos: ${MAX_BACKUPS}`);
    }
  } catch (error) {
    console.error('⚠ Error al limpiar backups antiguos:', error.message);
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
      .filter(f => f.startsWith('images-backup-') && f.endsWith('.tar.gz'))
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
      console.log(`${index + 1}. ${file} (${sizeInMB} MB) - ${date}`);
    });
    console.log();
  } catch (error) {
    console.error('Error al listar backups:', error.message);
  }
}

// Ejecutar
ensureDirectories();

const command = process.argv[2];
if (command === 'list') {
  listBackups();
} else {
  createBackup();
}
