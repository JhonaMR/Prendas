#!/usr/bin/env node

/**
 * Script para probar el sistema de validación de backups
 * Crea un backup corrupto de prueba y verifica que se detecte
 */

const path = require('path');
const fs = require('fs');
const BackupValidationService = require('../src/services/BackupValidationService');

const backupDir = path.join(__dirname, '../backups');
const validationService = new BackupValidationService(backupDir);

async function testBackupValidation() {
  console.log('\n🧪 PRUEBA DE VALIDACIÓN DE BACKUPS\n');

  // 1. Crear un backup corrupto de prueba
  console.log('1️⃣  Creando backup corrupto de prueba...\n');
  
  const testBackupPath = path.join(backupDir, 'test-corrupted-backup.sql');
  const corruptedContent = `\\restrict ykxEyH4ZP0aV3Bk1H9xwLh61tAtgZC3HG3X7NB7MPrccOJb709xiuflg3FEtIRD
-- PostgreSQL database dump
SET statement_timeout = 0;
CREATE TABLE public.test_table (
    id integer NOT NULL PRIMARY KEY,
    name character varying(255)
);
COPY public.test_table (id, name) FROM stdin;
1	Test
\\.
`;

  fs.writeFileSync(testBackupPath, corruptedContent, 'utf8');
  console.log(`   ✅ Archivo creado: test-corrupted-backup.sql\n`);

  // 2. Validar el backup corrupto
  console.log('2️⃣  Validando backup corrupto...\n');
  
  const validation = validationService.validateBackup(testBackupPath);
  
  if (!validation.valid) {
    console.log(`   ✅ Corrupción detectada correctamente`);
    console.log(`   Error: ${validation.error}\n`);
  } else {
    console.log(`   ❌ No se detectó la corrupción\n`);
  }

  // 3. Verificar que se registró la alerta
  console.log('3️⃣  Verificando alertas registradas...\n');
  
  const alertsDir = path.join(__dirname, '../logs/backup-alerts');
  const today = new Date().toISOString().split('T')[0];
  const alertFile = path.join(alertsDir, `backup-alerts-${today}.log`);
  
  if (fs.existsSync(alertFile)) {
    const alertContent = fs.readFileSync(alertFile, 'utf8');
    console.log(`   ✅ Archivo de alertas encontrado: backup-alerts-${today}.log`);
    console.log(`   Contenido:\n`);
    console.log(alertContent);
  } else {
    console.log(`   ⚠️  No se encontró archivo de alertas\n`);
  }

  // 4. Limpiar el backup de prueba
  console.log('4️⃣  Limpiando backup de prueba...\n');
  
  const cleanResult = validationService.cleanCorruptedBackup(testBackupPath);
  
  if (cleanResult.success) {
    console.log(`   ✅ Backup limpiado`);
    console.log(`   Reducción: ${cleanResult.reduction}\n`);
  } else {
    console.log(`   ❌ Error: ${cleanResult.error}\n`);
  }

  // 5. Validar nuevamente
  console.log('5️⃣  Validando backup después de limpiar...\n');
  
  const revalidation = validationService.validateBackup(testBackupPath);
  
  if (revalidation.valid) {
    console.log(`   ✅ Backup ahora es válido\n`);
  } else {
    console.log(`   ⚠️  Backup aún tiene problemas: ${revalidation.error}\n`);
  }

  // 6. Eliminar el archivo de prueba
  console.log('6️⃣  Eliminando archivo de prueba...\n');
  
  fs.unlinkSync(testBackupPath);
  console.log(`   ✅ Archivo eliminado\n`);

  // 7. Generar reporte final
  console.log('7️⃣  Generando reporte de validación...\n');
  
  const report = validationService.generateReport();
  
  console.log(`   📊 Estado: ${report.status}`);
  console.log(`   Total: ${report.summary.totalBackups} backups`);
  console.log(`   ✅ Válidos: ${report.summary.validBackups}`);
  console.log(`   ❌ Inválidos: ${report.summary.invalidBackups}`);
  console.log(`   Tamaño total: ${report.summary.totalSizeInMB} MB\n`);

  console.log('✅ ¡Prueba completada!\n');
}

testBackupValidation().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
