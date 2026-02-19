/**
 * Script de backup programado para PM2
 * Se ejecuta diariamente a las 22:00 (10pm)
 * 
 * Uso: pm2 start ecosystem.config.js
 */

require('dotenv').config();
const BackupExecutionService = require('../services/BackupExecutionService');

const backupService = new BackupExecutionService();

/**
 * Ejecuta el backup
 */
async function runBackup() {
  console.log('\n' + '='.repeat(60));
  console.log(`🔄 Backup programado iniciado: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  const result = await backupService.executeBackup();

  if (result.success) {
    console.log('\n✅ Backup programado completado exitosamente');
    console.log(`📁 Archivo: ${result.filename}`);
    console.log(`📦 Tamaño: ${result.sizeInMB} MB`);
    console.log(`🔄 Tipo: ${result.type}`);
  } else {
    console.error('\n❌ Error en backup programado:', result.error);
  }

  console.log('='.repeat(60) + '\n');
}

// Ejecutar inmediatamente al iniciar
runBackup().catch(error => {
  console.error('Error fatal en backup programado:', error);
  process.exit(1);
});
