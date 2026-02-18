/**
 * Script para verificar que los índices están funcionando correctamente
 */

// Cargar variables de entorno
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { initDatabase, query } = require('../config/database');

async function testIndexes() {
  console.log('🔍 Probando índices de la tabla clients...\n');
  
  try {
    // 1. Inicializar base de datos
    console.log('1. Inicializando conexión a la base de datos...');
    await initDatabase();
    console.log('✅ Conexión establecida\n');
    
    // 2. Verificar que los índices existen
    console.log('2. Verificando índices existentes...');
    const indexesResult = await query(`
      SELECT 
        indexname, 
        indexdef,
        tablename
      FROM pg_indexes 
      WHERE tablename = 'clients'
      ORDER BY indexname;
    `);
    
    console.log(`📊 Índices encontrados: ${indexesResult.rows.length}`);
    indexesResult.rows.forEach((idx, i) => {
      console.log(`   ${i+1}. ${idx.indexname}: ${idx.indexdef.substring(0, 80)}...`);
    });
    
    // 3. Verificar que los índices esperados existen
    console.log('\n3. Verificando índices requeridos...');
    const expectedIndexes = [
      'idx_clients_seller_id',
      'idx_clients_active', 
      'idx_clients_name',
      'idx_clients_nit'
    ];
    
    const existingIndexes = indexesResult.rows.map(idx => idx.indexname);
    console.log('Índices encontrados:', existingIndexes);
    
    let allFound = true;
    for (const expected of expectedIndexes) {
      const exists = existingIndexes.includes(expected);
      const status = exists ? '✅' : '❌';
      console.log(`   ${status} ${expected}: ${exists ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);
      if (!exists) allFound = false;
    }
    
    // 4. Probar consultas que deberían usar los índices
    console.log('\n4. Probando consultas con índices...');
    
    // Consulta que debería usar el índice en seller_id
    console.log('   • Probando consulta con seller_id (usando idx_clients_seller_id)...');
    const sellerQuery = await query(`
      EXPLAIN ANALYZE 
      SELECT * FROM clients 
      WHERE seller_id = 'test-seller-123' 
      LIMIT 10;
    `);
    console.log('   ✅ Consulta con seller_id ejecutada');
    
    // Consulta que debería usar el índice en active
    console.log('   • Probando consulta con filtro por active...');
    const activeQuery = await query(`
      EXPLAIN ANALYZE 
      SELECT * FROM clients 
      WHERE active = true 
      LIMIT 10;
    `);
    console.log('   ✅ Consulta con filtro active ejecutada');
    
    // Consulta que debería usar el índice en name
    console.log('   • Probando búsqueda por nombre...');
    const nameQuery = await query(`
      EXPLAIN ANALYZE 
      SELECT * FROM clients 
      WHERE name LIKE 'Test%' 
      LIMIT 10;
    `);
    console.log('   ✅ Consulta con búsqueda por nombre ejecutada');
    
    // 5. Verificar rendimiento
    console.log('\n5. Verificando rendimiento...');
    const performanceTest = await query(`
      EXPLAIN (ANALYZE, BUFFERS) 
      SELECT * FROM clients 
      WHERE seller_id IS NOT NULL 
      ORDER BY created_at DESC 
      LIMIT 100;
    `);
    console.log('   ✅ Prueba de rendimiento completada');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ VERIFICACIÓN DE ÍNDICES COMPLETADA');
    console.log('='.repeat(60));
    console.log(`Índices encontrados: ${indexesResult.rows.length}`);
    console.log(`Índices requeridos encontrados: ${allFound ? '✅ TODOS' : '❌ FALTAN ALGUNOS'}`);
    console.log('='.repeat(60));
    
    if (allFound) {
      console.log('\n🎉 ¡Todos los índices se crearon correctamente!');
      console.log('Los índices mejorarán el rendimiento de las consultas:');
      console.log('  • idx_clients_seller_id: Optimiza búsquedas por vendedor');
      console.log('  • idx_clients_active: Optimiza filtros por estado activo');
      console.log('  • idx_clients_name: Optimiza búsquedas por nombre');
      console.log('  • idx_clients_nit: Optimiza búsquedas por NIT');
    } else {
      console.log('\n⚠️  Algunos índices no se encontraron');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testIndexes();
}

module.exports = { testIndexes };