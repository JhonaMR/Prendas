#!/usr/bin/env node

/**
 * Script para ejecutar un backup manual de la base de datos
 * Uso: npm run backup:manual
 */

// Cargar variables de entorno PRIMERO
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const BackupExecutionService = require('../src/services/BackupExecutionService');

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║           BACKUP MANUAL DE BASE DE DATOS                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    const backupService = new BackupExecutionService();
    
    console.log('⏳ Ejecutando backup...\n');
    const result = await backupService.executeBackup();

    if (result.success) {
      console.log('\n✅ ¡Backup completado exitosamente!\n');
      console.log('📊 Detalles:');
      console.log(`   Archivo: ${result.filename}`);
      console.log(`   Tipo: ${result.type}`);
      console.log(`   Tamaño: ${result.sizeInMB} MB`);
      console.log(`   Ruta: ${result.path}`);
      console.log(`   Creado: ${result.createdAt}`);
      
      if (result.stats) {
        console.log('\n📈 Estadísticas de almacenamiento:');
        console.log(`   Total: ${result.stats.totalBackups} backups, ${result.stats.totalSizeInMB} MB`);
        console.log(`   Diarios: ${result.stats.byType.daily.count} (${result.stats.byType.daily.sizeInMB} MB)`);
        console.log(`   Semanales: ${result.stats.byType.weekly.count} (${result.stats.byType.weekly.sizeInMB} MB)`);
        console.log(`   Mensuales: ${result.stats.byType.monthly.count} (${result.stats.byType.monthly.sizeInMB} MB)`);
      }

      if (result.deleted && result.deleted.length > 0) {
        console.log('\n🗑️  Backups eliminados por política de retención:');
        result.deleted.forEach(d => {
          console.log(`   - ${d.filename} (${d.type}): ${d.reason}`);
        });
      }

      console.log('\n');
      process.exit(0);
    } else {
      console.error('\n❌ Error durante el backup:\n');
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
