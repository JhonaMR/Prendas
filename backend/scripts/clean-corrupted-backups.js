#!/usr/bin/env node

/**
 * Script para limpiar backups corruptos
 * Uso: node scripts/clean-corrupted-backups.js
 */

const path = require('path');
const BackupValidationService = require('../src/services/BackupValidationService');

const backupDir = path.join(__dirname, '../backups');
const validationService = new BackupValidationService(backupDir);

async function cleanCorruptedBackups() {
  console.log('\n🔍 Analizando backups...\n');

  const validation = validationService.validateAllBackups();

  if (!validation.success) {
    console.error('❌ Error:', validation.error);
    process.exit(1);
  }

  console.log(`📊 Resumen:`);
  console.log(`   Total: ${validation.total} backups`);
  console.log(`   ✅ Válidos: ${validation.summary.validCount}`);
  console.log(`   ❌ Inválidos: ${validation.summary.invalidCount}\n`);

  if (validation.summary.invalidCount === 0) {
    console.log('✅ Todos los backups están en buen estado. No hay nada que limpiar.\n');
    process.exit(0);
  }

  console.log('🧹 Limpiando backups corruptos...\n');

  let cleanedCount = 0;
  let totalReduction = 0;

  for (const invalid of validation.invalid) {
    const filename = path.basename(invalid.filePath);
    console.log(`📄 ${filename}`);
    console.log(`   Error: ${invalid.error}`);

    const cleanResult = validationService.cleanCorruptedBackup(invalid.filePath);

    if (cleanResult.success) {
      console.log(`   ✅ Limpiado`);
      console.log(`   📉 Reducción: ${cleanResult.reduction}`);
      cleanedCount++;
      totalReduction += parseFloat(cleanResult.reduction);
    } else {
      console.log(`   ❌ Error: ${cleanResult.error}`);
    }

    console.log();
  }

  console.log(`\n📊 Resultado:`);
  console.log(`   Archivos limpiados: ${cleanedCount}/${validation.summary.invalidCount}`);
  console.log(`   Reducción promedio: ${(totalReduction / cleanedCount).toFixed(2)}%\n`);

  // Validar nuevamente
  console.log('🔍 Validando nuevamente...\n');
  const revalidation = validationService.validateAllBackups();

  console.log(`📊 Nuevo resumen:`);
  console.log(`   ✅ Válidos: ${revalidation.summary.validCount}`);
  console.log(`   ❌ Inválidos: ${revalidation.summary.invalidCount}\n`);

  if (revalidation.summary.invalidCount === 0) {
    console.log('✅ ¡Todos los backups están limpios!\n');
  } else {
    console.log(`⚠️  Aún hay ${revalidation.summary.invalidCount} backups con problemas.\n`);
  }
}

cleanCorruptedBackups().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
