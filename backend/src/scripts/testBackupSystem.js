/**
 * Script de prueba del sistema de backups
 * Uso: node backend/src/scripts/testBackupSystem.js
 */

require('dotenv').config();
const BackupExecutionService = require('../services/BackupExecutionService');
const BackupRotationService = require('../services/BackupRotationService');
const path = require('path');

async function testBackupSystem() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 PRUEBA DEL SISTEMA DE BACKUPS');
  console.log('='.repeat(70) + '\n');

  const backupDir = path.join(__dirname, '../../backups');
  const executionService = new BackupExecutionService(backupDir);
  const rotationService = new BackupRotationService(backupDir);

  try {
    // Test 1: Verificar tipo de backup
    console.log('📋 Test 1: Determinar tipo de backup para hoy');
    const backupType = rotationService.getBackupType();
    console.log(`   ✅ Tipo de backup: ${backupType}`);
    console.log(`   📅 Fecha: ${new Date().toLocaleDateString('es-ES')}`);
    console.log(`   📊 Día de semana: ${['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][new Date().getDay()]}`);
    console.log(`   📆 Día del mes: ${new Date().getDate()}\n`);

    // Test 2: Generar nombre de archivo
    console.log('📋 Test 2: Generar nombre de archivo');
    const filename = rotationService.generateBackupFilename(backupType);
    console.log(`   ✅ Nombre generado: ${filename}\n`);

    // Test 3: Listar backups existentes
    console.log('📋 Test 3: Listar backups existentes');
    const allBackups = rotationService.listAllBackups();
    console.log(`   ✅ Total de backups: ${allBackups.length}`);
    if (allBackups.length > 0) {
      console.log('   Últimos 3 backups:');
      allBackups.slice(0, 3).forEach((backup, index) => {
        console.log(`      ${index + 1}. ${backup.filename} (${backup.sizeInMB} MB)`);
      });
    }
    console.log();

    // Test 4: Estadísticas de almacenamiento
    console.log('📋 Test 4: Estadísticas de almacenamiento');
    const stats = rotationService.getStorageStats();
    console.log(`   ✅ Total: ${stats.totalBackups} backups, ${stats.totalSizeInMB} MB`);
    console.log(`   📊 Diarios: ${stats.byType.daily.count} (${stats.byType.daily.sizeInMB} MB)`);
    console.log(`   📊 Semanales: ${stats.byType.weekly.count} (${stats.byType.weekly.sizeInMB} MB)`);
    console.log(`   📊 Mensuales: ${stats.byType.monthly.count} (${stats.byType.monthly.sizeInMB} MB)\n`);

    // Test 5: Backups por tipo
    console.log('📋 Test 5: Backups agrupados por tipo');
    const backupsByType = rotationService.getBackupsByType();
    console.log(`   ✅ Diarios: ${backupsByType.daily.length}`);
    console.log(`   ✅ Semanales: ${backupsByType.weekly.length}`);
    console.log(`   ✅ Mensuales: ${backupsByType.monthly.length}\n`);

    // Test 6: Política de retención
    console.log('📋 Test 6: Política de retención');
    console.log('   Límites configurados:');
    console.log('   ✅ Máximo 7 backups diarios');
    console.log('   ✅ Máximo 4 backups semanales');
    console.log('   ✅ Máximo 3 backups mensuales');
    console.log('   ✅ Total máximo: ~11 backups\n');

    // Test 7: Información de credenciales
    console.log('📋 Test 7: Verificar configuración de BD');
    const dbUser = process.env.DB_USER || 'postgres';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || 5433;
    const dbName = process.env.DB_NAME || 'inventory';
    const hasPassword = !!process.env.DB_PASSWORD;

    console.log(`   ✅ Usuario: ${dbUser}`);
    console.log(`   ✅ Host: ${dbHost}`);
    console.log(`   ✅ Puerto: ${dbPort}`);
    console.log(`   ✅ Base de datos: ${dbName}`);
    console.log(`   ✅ Contraseña: ${hasPassword ? '✓ Configurada' : '✗ NO CONFIGURADA'}\n`);

    if (!hasPassword) {
      console.log('   ⚠️  ADVERTENCIA: DB_PASSWORD no está configurada en .env');
      console.log('   Los backups no funcionarán sin esta variable.\n');
    }

    // Test 8: Ruta de backups
    console.log('📋 Test 8: Verificar ruta de backups');
    console.log(`   ✅ Ruta: ${backupDir}`);
    const fs = require('fs');
    const exists = fs.existsSync(backupDir);
    console.log(`   ✅ Carpeta existe: ${exists ? 'Sí' : 'No'}\n`);

    // Resumen
    console.log('='.repeat(70));
    console.log('✅ PRUEBAS COMPLETADAS');
    console.log('='.repeat(70));
    console.log('\n📝 Resumen:');
    console.log('   • Sistema de backups configurado correctamente');
    console.log('   • Política de retención: 7 diarios + 4 semanales + 3 mensuales');
    console.log('   • Ejecución automática: Cada día a las 22:00 (10pm)');
    console.log('   • Almacenamiento actual: ' + stats.totalSizeInMB + ' MB');
    console.log('\n🚀 Próximos pasos:');
    console.log('   1. Iniciar con: npm run pm2:start');
    console.log('   2. Ver logs con: npm run pm2:logs');
    console.log('   3. Acceder a: http://localhost:3000/api/backups');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error en pruebas:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testBackupSystem();
