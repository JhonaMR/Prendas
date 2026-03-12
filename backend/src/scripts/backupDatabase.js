/**
 * Script para hacer backup de la base de datos PostgreSQL
 * Uso: node backend/src/scripts/backupDatabase.js
 */

require('dotenv').config();
const path = require('path');
const BackupExecutionService = require('../services/BackupExecutionService');

async function backupDatabase() {
  const backupService = new BackupExecutionService();
  
  console.log('\n🔄 Iniciando backup manual de la base de datos...');
  
  const result = await backupService.executeBackup();
  
  if (result.success) {
    console.log('\n✅ Backup completado exitosamente');
    console.log(`📁 Archivo: ${result.filename}`);
    console.log(`📦 Tamaño: ${result.sizeInMB} MB`);
    console.log(`🔄 Tipo: ${result.type}`);
    
    if (result.stats) {
      console.log('\n📊 Estadísticas de almacenamiento:');
      console.log(`   Total: ${result.stats.totalBackups} backups, ${result.stats.totalSizeInMB} MB`);
    }
  } else {
    console.error('\n❌ Error en backup:', result.error);
    process.exit(1);
  }
}

backupDatabase()
  .then(() => {
    console.log('\n✨ Proceso finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error.message);
    process.exit(1);
  });
