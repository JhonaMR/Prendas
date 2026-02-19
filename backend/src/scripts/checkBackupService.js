/**
 * Script para verificar el estado del servicio de backups
 */

const fs = require('fs');
const path = require('path');
const BackupRotationService = require('../services/BackupRotationService');

function checkBackupService() {
  try {
    console.log('\n🔍 VERIFICACIÓN DEL SERVICIO DE BACKUPS');
    console.log('='.repeat(70));

    const backupDir = path.join(__dirname, '../../backups');
    const rotationService = new BackupRotationService(backupDir);

    // 1. Verificar que el directorio de backups existe
    console.log('\n1️⃣ Verificando directorio de backups...');
    if (!fs.existsSync(backupDir)) {
      console.log(`   ❌ Directorio no existe: ${backupDir}`);
      return;
    }
    console.log(`   ✅ Directorio existe: ${backupDir}`);

    // 2. Listar todos los backups
    console.log('\n2️⃣ Listando backups disponibles...');
    const backups = rotationService.listAllBackups();
    
    if (backups.length === 0) {
      console.log('   ⚠️ No hay backups disponibles');
    } else {
      console.log(`   Total de backups: ${backups.length}`);
      backups.forEach((backup, index) => {
        console.log(`   ${index + 1}. ${backup.filename}`);
        console.log(`      Tamaño: ${backup.sizeInMB} MB`);
        console.log(`      Creado: ${backup.createdAtISO}`);
        console.log(`      Tipo: ${backup.type}`);
      });
    }

    // 3. Obtener estadísticas
    console.log('\n3️⃣ Estadísticas de almacenamiento...');
    const stats = rotationService.getStorageStats();
    console.log(`   Total de backups: ${stats.totalBackups}`);
    console.log(`   Tamaño total: ${stats.totalSizeInMB} MB`);
    console.log(`   Diarios: ${stats.byType.daily.count} (${stats.byType.daily.sizeInMB} MB)`);
    console.log(`   Semanales: ${stats.byType.weekly.count} (${stats.byType.weekly.sizeInMB} MB)`);
    console.log(`   Mensuales: ${stats.byType.monthly.count} (${stats.byType.monthly.sizeInMB} MB)`);

    // 4. Obtener backups por tipo
    console.log('\n4️⃣ Backups por tipo...');
    const backupsByType = rotationService.getBackupsByType();
    
    console.log('   Diarios:');
    if (backupsByType.daily.length === 0) {
      console.log('      ⚠️ No hay backups diarios');
    } else {
      backupsByType.daily.forEach(b => {
        console.log(`      • ${b.filename} (${b.sizeInMB} MB)`);
      });
    }

    console.log('   Semanales:');
    if (backupsByType.weekly.length === 0) {
      console.log('      ⚠️ No hay backups semanales');
    } else {
      backupsByType.weekly.forEach(b => {
        console.log(`      • ${b.filename} (${b.sizeInMB} MB)`);
      });
    }

    console.log('   Mensuales:');
    if (backupsByType.monthly.length === 0) {
      console.log('      ⚠️ No hay backups mensuales');
    } else {
      backupsByType.monthly.forEach(b => {
        console.log(`      • ${b.filename} (${b.sizeInMB} MB)`);
      });
    }

    // 5. Verificar configuración de variables de entorno
    console.log('\n5️⃣ Configuración de variables de entorno...');
    const dbUser = process.env.DB_USER || 'postgres';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || 5433;
    const dbName = process.env.DB_NAME || 'inventory';
    const dbPassword = process.env.DB_PASSWORD ? '✅ Configurada' : '❌ NO configurada';

    console.log(`   DB_USER: ${dbUser}`);
    console.log(`   DB_HOST: ${dbHost}`);
    console.log(`   DB_PORT: ${dbPort}`);
    console.log(`   DB_NAME: ${dbName}`);
    console.log(`   DB_PASSWORD: ${dbPassword}`);

    // 6. Resumen
    console.log('\n' + '='.repeat(70));
    console.log('✅ VERIFICACIÓN COMPLETADA');
    console.log('='.repeat(70));
    console.log('\n📊 Resumen del servicio de backups:');
    console.log(`   • Estado: ${backups.length > 0 ? '✅ Funcionando' : '⚠️ Sin backups'}`);
    console.log(`   • Backups disponibles: ${backups.length}`);
    console.log(`   • Espacio utilizado: ${stats.totalSizeInMB} MB`);
    console.log(`   • Última copia: ${backups.length > 0 ? backups[0].createdAtISO : 'N/A'}`);
    console.log('\n💡 Para ejecutar un backup manual, usa: POST /api/backups/manual\n');

    return {
      success: true,
      backupCount: backups.length,
      totalSizeInMB: stats.totalSizeInMB,
      stats: stats
    };
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n📝 Stack trace:', error.stack);
    process.exit(1);
  }
}

checkBackupService();
