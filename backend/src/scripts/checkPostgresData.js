/**
 * Script para verificar datos en PostgreSQL
 */

// Cargar variables de entorno
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { initDatabase, query } = require('../config/database');

async function checkPostgresData() {
  console.log('🔍 Verificando datos en PostgreSQL...\n');
  
  try {
    // Inicializar base de datos
    await initDatabase();
    
    // 1. Verificar conteo
    const countResult = await query('SELECT COUNT(*) as count FROM clients');
    const recordCount = parseInt(countResult.rows[0].count);
    console.log(`📊 Total de registros en PostgreSQL: ${recordCount}`);
    
    if (recordCount === 0) {
      console.log('✅ La tabla clients está vacía, lista para migración');
      return { recordCount, hasData: false };
    }
    
    // 2. Mostrar muestra de datos
    console.log('\n📝 Muestra de registros (primeros 5):');
    const sampleResult = await query(`
      SELECT id, name, seller_id, active, created_at
      FROM clients 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    sampleResult.rows.forEach((row, index) => {
      console.log(`\nRegistro ${index + 1}:`);
      console.log(`  ID: ${row.id}`);
      console.log(`  Nombre: ${row.name}`);
      console.log(`  Seller ID: ${row.seller_id || 'NULL'}`);
      console.log(`  Activo: ${row.active}`);
      console.log(`  Creado: ${row.created_at}`);
    });
    
    // 3. Verificar estructura
    console.log('\n🔍 Verificando estructura de la tabla...');
    const columnsResult = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'clients'
      ORDER BY ordinal_position;
    `);
    
    console.log(`📊 Columnas (${columnsResult.rows.length}):`);
    columnsResult.rows.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL'}`);
    });
    
    return {
      recordCount,
      hasData: recordCount > 0,
      sample: sampleResult.rows,
      columns: columnsResult.rows
    };
    
  } catch (error) {
    console.error('❌ Error verificando datos:', error.message);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkPostgresData()
    .then(result => {
      console.log('\n' + '='.repeat(80));
      if (result.hasData) {
        console.log(`⚠️  ADVERTENCIA: PostgreSQL ya tiene ${result.recordCount} registros`);
        console.log('   La migración usará UPSERT (INSERT ... ON CONFLICT DO UPDATE)');
        console.log('   para evitar duplicados y actualizar registros existentes.');
      } else {
        console.log('✅ PostgreSQL está listo para migración');
      }
      console.log('='.repeat(80));
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { checkPostgresData };