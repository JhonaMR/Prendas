/**
 * Script para diagnosticar secuencias en todas las tablas de items
 */

require('dotenv').config();
const { Pool } = require('pg');

async function checkAllSequences() {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Contrasena14.',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'inventory'
  });

  try {
    console.log('\n🔍 DIAGNÓSTICO DE SECUENCIAS EN TODAS LAS TABLAS');
    console.log('='.repeat(70));

    const tables = [
      'reception_items',
      'dispatch_items',
      'return_reception_items',
      'return_dispatch_items'
    ];

    for (const table of tables) {
      console.log(`\n📋 Tabla: ${table}`);
      console.log('-'.repeat(70));

      // Verificar si la tabla existe
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [table]);

      if (!tableCheck.rows[0].exists) {
        console.log(`   ⚠️ La tabla NO existe`);
        continue;
      }

      // Ver estructura
      const structureResult = await pool.query(`
        SELECT column_name, data_type, column_default, is_nullable
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);

      console.log(`   Columnas:`);
      structureResult.rows.forEach(row => {
        const defaultValue = row.column_default || 'NONE';
        const status = row.column_name === 'id' && !row.column_default ? '❌' : '  ';
        console.log(`   ${status} ${row.column_name}: ${row.data_type} (default: ${defaultValue})`);
      });

      // Verificar secuencias
      const sequenceCheck = await pool.query(`
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_name LIKE $1
      `, [`%${table}%`]);

      if (sequenceCheck.rows.length > 0) {
        console.log(`   ✅ Secuencias:`);
        sequenceCheck.rows.forEach(row => {
          console.log(`      • ${row.sequence_name}`);
        });
      } else {
        console.log(`   ❌ NO hay secuencias configuradas`);
      }

      // Obtener max id
      const maxIdResult = await pool.query(`
        SELECT COALESCE(MAX(id), 0) as max_id FROM ${table}
      `);
      console.log(`   Máximo id actual: ${maxIdResult.rows[0].max_id}`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ DIAGNÓSTICO COMPLETADO');
    console.log('='.repeat(70) + '\n');

    await pool.end();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n📝 Stack trace:', error.stack);
    process.exit(1);
  }
}

checkAllSequences();
