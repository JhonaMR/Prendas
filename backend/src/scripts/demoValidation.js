/**
 * Script de demostración de validación de migración
 * 
 * Este script muestra cómo usar el MigrationValidator para validar
 * que la migración de datos se realizó correctamente.
 * 
 * Requirements: 3.3, 3.5
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const { MigrationValidator } = require('./validateMigration');

async function demonstrateValidation() {
  console.log('🚀 DEMOSTRACIÓN DE VALIDACIÓN DE MIGRACIÓN');
  console.log('='.repeat(60));
  
  try {
    const validator = new MigrationValidator();
    
    console.log('\n🔍 Ejecutando validaciones...');
    console.log('='.repeat(60));
    
    const results = await validator.validateAll();
    
    console.log('\n📋 RESULTADOS DE VALIDACIÓN:');
    console.log('='.repeat(60));
    console.log(`✅ Estado: ${results.passed ? 'APROBADO' : 'FALLIDO'}`);
    console.log(`📅 Fecha: ${results.timestamp}`);
    console.log(`📊 Validaciones totales: ${results.summary.totalValidations}`);
    console.log(`✅ Validaciones pasadas: ${results.summary.passedValidations}`);
    console.log(`❌ Validaciones fallidas: ${results.summary.failedValidations}`);
    
    if (results.errors && results.errors.length > 0) {
      console.log('\n❌ ERRORES DETECTADOS:');
      results.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }
    
    if (results.warnings && results.warnings.length > 0) {
      console.log('\n⚠️  ADVERTENCIAS:');
      results.warnings.forEach((warning, i) => {
        console.log(`  ${i + 1}. ${warning}`);
      });
    }
    
    // Mostrar detalles de cada validación
    console.log('\n🔍 DETALLES POR VALIDACIÓN:');
    console.log('='.repeat(60));
    
    if (results.details.recordCounts) {
      const rc = results.details.recordCounts;
      console.log(`\n1. Conteo de registros: ${rc.passed ? '✅' : '❌'}`);
      console.log(`   • SQLite: ${rc.details.sqliteCount || 'N/A'}`);
      console.log(`   • PostgreSQL: ${rc.details.postgresCount || 'N/A'}`);
      console.log(`   • Coinciden: ${rc.details.match ? 'Sí' : 'No'}`);
    }
    
    if (results.details.dataIntegrity) {
      const di = results.details.dataIntegrity;
      console.log(`\n2. Integridad de datos: ${di.passed ? '✅' : '❌'}`);
      console.log(`   • Registros verificados: ${di.details.checked || 0}`);
      console.log(`   • Errores encontrados: ${di.details.errors?.length || 0}`);
    }
    
    if (results.details.relationships) {
      const rel = results.details.relationships;
      console.log(`\n3. Validación de relaciones: ${rel.passed ? '✅' : '❌'}`);
      if (rel.details.foreignKeys && rel.details.foreignKeys.length > 0) {
        console.log(`   • Referencias inválidas: ${rel.details.foreignKeys.length}`);
      }
      if (rel.details.orphaned && rel.details.orphaned.length > 0) {
        console.log(`   • Registros huérfanos: ${rel.details.orphaned.length}`);
      }
    }
    
    if (results.details.dataTypes) {
      const dt = results.details.dataTypes;
      console.log(`\n4. Validación de tipos de datos: ${dt.passed ? '✅' : '❌'}`);
      console.log(`   • Tipos incorrectos: ${dt.details.typeMismatches?.length || 0}`);
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (results.passed) {
      console.log('🎉 ¡Todas las validaciones pasaron exitosamente!');
      console.log('✅ La migración de datos se realizó correctamente.');
      console.log('✅ Los datos están completos y las relaciones preservadas.');
    } else {
      console.log('⚠️  Se encontraron problemas en la validación.');
      console.log('❌ Revise los errores detallados arriba.');
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Error durante la demostración:', error.message);
    console.error('❌ Detalles:', error);
    throw error;
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  demonstrateValidation()
    .then(results => {
      if (results.passed) {
        console.log('\n✅ Demostración completada exitosamente');
        process.exit(0);
      } else {
        console.log('\n⚠️  Demostración completada con advertencias');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n❌ Error fatal durante la demostración:', error.message);
      process.exit(1);
    });
}

module.exports = { demonstrateValidation };