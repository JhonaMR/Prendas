#!/usr/bin/env node

/**
 * Script para probar la restauración de un backup
 * Uso: npm run test:restore
 */

// Cargar variables de entorno PRIMERO
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const BackupExecutionService = require('../src/services/BackupExecutionService');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║           PRUEBA DE RESTAURACIÓN DE BACKUP                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    const backupService = new BackupExecutionService();
    
    // Obtener el backup más reciente
    const backupDir = path.join(__dirname, '../backups');
    const files = fs.readdirSync(backupDir)
      .filter(f => f.endsWith('.sql') && f.startsWith('inventory-backup-daily'))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.error('❌ No hay backups disponibles para restaurar');
      process.exit(1);
    }

    const backupToRestore = files[0];
    console.log(`📁 Backup a restaurar: ${backupToRestore}\n`);

    console.log('⏳ Iniciando restauración...\n');
    const result = await backupService.restoreBackup(backupToRestore);

    if (result.success) {
      console.log('\n✅ ¡Restauración completada exitosamente!\n');
      console.log('📊 Detalles:');
      console.log(`   Restaurado desde: ${result.restoredFrom}`);
      console.log(`   Backup de seguridad: ${result.securityBackup}`);
      console.log(`   Hora: ${result.restoredAt}`);
      console.log('\n');
      process.exit(0);
    } else {
      console.error('\n❌ Error durante la restauración:\n');
      console.error(`   ${result.error}`);
      console.error('\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error inesperado:\n');
    console.error(`   ${error.message}`);
    console.error('\n');
    process.exit(1);
  }
}

main();
