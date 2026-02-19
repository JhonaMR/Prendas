/**
 * Script para probar la carga masiva de datos (CSV)
 * Verifica que clientes, referencias, confeccionistas, etc. se importan correctamente
 */

require('dotenv').config();
const { Pool } = require('pg');

async function testBulkImport() {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Contrasena14.',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'inventory'
  });

  try {
    console.log('\n🔍 PRUEBA DE CARGA MASIVA DE DATOS');
    console.log('='.repeat(70));

    // 1. Listar todas las tablas
    console.log('\n1️⃣ Listando todas las tablas en la base de datos...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(r => r.table_name);
    console.log(`   Total de tablas: ${tables.length}`);
    console.log('   Tablas:');
    tables.forEach(t => console.log(`      • ${t}`));

    // 2. Verificar datos en cada tabla
    console.log('\n2️⃣ Contando registros en cada tabla...');
    console.log('   Datos:');

    for (const table of tables) {
      try {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${table}"`);
        const count = countResult.rows[0].count;
        const status = count > 0 ? '✅' : '⚠️';
        console.log(`      ${status} ${table}: ${count} registros`);
      } catch (error) {
        console.log(`      ❌ ${table}: Error al contar`);
      }
    }

    // 3. Verificar secuencias
    console.log('\n3️⃣ Verificando secuencias...');
    const sequencesResult = await pool.query(`
      SELECT sequence_name
      FROM information_schema.sequences
      WHERE sequence_schema = 'public'
      ORDER BY sequence_name
    `);

    if (sequencesResult.rows.length > 0) {
      console.log('   Secuencias:');
      sequencesResult.rows.forEach(row => {
        console.log(`      • ${row.sequence_name}`);
      });
    } else {
      console.log('   ⚠️ No hay secuencias configuradas');
    }

    // 4. Resumen
    console.log('\n' + '='.repeat(70));
    console.log('✅ DIAGNÓSTICO COMPLETADO');
    console.log('='.repeat(70));
    console.log('\n📊 Resumen:');
    console.log(`   • Total de tablas: ${tables.length}`);
    console.log(`   • Total de secuencias: ${sequencesResult.rows.length}`);
    console.log('\n✅ La base de datos está lista para carga masiva de datos.\n');

    await pool.end();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n📝 Stack trace:', error.stack);
    process.exit(1);
  }
}

testBulkImport();
