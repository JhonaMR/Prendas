/**
 * Script para verificar que los índices se crearon correctamente
 * 
 * Verifica los 4 índices requeridos:
 * 1. idx_clients_seller_id
 * 2. idx_clients_active
 * 3. idx_clients_name
 * 4. idx_clients_nit
 */

// Cargar variables de entorno
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { initDatabase, query } = require('../config/database');

// Índices esperados
const EXPECTED_INDEXES = [
  'idx_clients_seller_id',
  'idx_clients_active',
  'idx_clients_name',
  'idx_clients_nit'
];

async function verifyIndexes() {
  console.log('🔍 Verificando índices de la tabla clients...\n');
  
  try {
    // 1. Inicializar base de datos
    console.log('1. Inicializando conexión...');
    await initDatabase();
    console.log('✅ Conexión establecida\n');
    
    // 2. Obtener índices actuales
    console.log('2. Obteniendo índices actuales...');
    const result = await query(`
      SELECT 
        indexname, 
        indexdef 
      FROM pg_indexes 
      WHERE tablename = 'clients' 
        AND schemaname = 'public'
      ORDER BY indexname;
    `);
    
    const currentIndexes = result.rows;
    console.log(`📊 Índices encontrados: ${currentIndexes.length}\n`);
    
    // 3. Verificar cada índice esperado
    console.log('3. Verificando índices esperados...\n');
    
    const verificationResults = [];
    let allPassed = true;
    
    for (const expectedIndex of EXPECTED_INDEXES) {
      const foundIndex = currentIndexes.find(idx => 
        idx.indexname.toLowerCase() === expectedIndex.toLowerCase()
      );
      
      const passed = !!foundIndex;
      allPassed = allPassed && passed;
      
      verificationResults.push({
        index: expectedIndex,
        passed,
        found: foundIndex ? foundIndex.indexdef : 'NO ENCONTRADO'
      });
      
      const status = passed ? '✅' : '❌';
      console.log(`   ${status} ${expectedIndex}: ${passed ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);
    }
    
    // 4. Mostrar resumen
    console.log('\n' + '='.repeat(80));
    console.log('📋 RESUMEN DE VERIFICACIÓN');
    console.log('='.repeat(80));
    
    const passedCount = verificationResults.filter(r => r.passed).length;
    const failedCount = verificationResults.filter(r => !r.passed).length;
    
    console.log(`✅ Índices verificados: ${EXPECTED_INDEXES.length}`);
    console.log(`✅ Índices encontrados: ${passedCount}`);
    console.log(`❌ Índices faltantes: ${failedCount}`);
    
    if (allPassed) {
      console.log('\n🎉 ¡TODOS LOS ÍNDICES SE CREARON CORRECTAMENTE!');
      console.log('✅ La tarea 5.1 se completó exitosamente');
    } else {
      console.log('\n⚠️  ALGUNOS ÍNDICES NO SE ENCONTRARON:');
      for (const result of verificationResults.filter(r => !r.passed)) {
        console.log(`   • ${result.index}: NO ENCONTRADO`);
      }
    }
    
    // 5. Mostrar detalles técnicos
    console.log('\n🔧 DETALLES TÉCNICOS:');
    for (const index of currentIndexes) {
      console.log(`   • ${index.indexname}: ${index.indexdef.substring(0, 80)}...`);
    }
    
    console.log('\n' + '='.repeat(80));
    
    return {
      success: allPassed,
      totalExpected: EXPECTED_INDEXES.length,
      totalFound: passedCount,
      missing: failedCount,
      results: verificationResults,
      allIndexes: currentIndexes
    };
    
  } catch (error) {
    console.error('\n❌ ERROR EN VERIFICACIÓN:');
    console.error(`Mensaje: ${error.message}`);
    console.log('='.repeat(80));
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  verifyIndexes()
    .then(result => {
      if (result.success) {
        console.log('\n✅ Verificación completada exitosamente');
        process.exit(0);
      } else {
        console.log('\n❌ Verificación falló');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { verifyIndexes };