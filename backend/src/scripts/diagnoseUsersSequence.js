/**
 * Script para diagnosticar la configuración de la tabla users
 * 
 * Problema: El error "null value in column "id" of relation "users" violates not-null constraint"
 * ocurre porque la tabla users no tiene la secuencia configurada correctamente.
 * 
 * Este script verifica:
 * 1. Si la tabla users existe
 * 2. La estructura actual de la tabla
 * 3. Si existe una secuencia para el campo id
 * 4. Si el campo id tiene un default configurado
 */

require('dotenv').config();
const { Pool } = require('pg');

async function diagnoseUsersSequence() {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Contrasena14.',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'inventory'
  });

  try {
    console.log('\n🔍 DIAGNÓSTICO DE TABLA users');
    console.log('='.repeat(60));

    // 1. Verificar si la tabla existe
    console.log('\n1️⃣ Verificando si la tabla users existe...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'users'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ La tabla users NO existe');
      console.log('⚠️ Necesitas crear la tabla primero con el esquema correcto');
      await pool.end();
      return;
    }
    console.log('✅ La tabla users existe');

    // 2. Ver la estructura actual de la tabla
    console.log('\n2️⃣ Estructura actual de users:');
    const structureResult = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('📋 Columnas:');
    structureResult.rows.forEach(row => {
      const defaultValue = row.column_default || 'NONE';
      console.log(`  • ${row.column_name}: ${row.data_type} (default: ${defaultValue}, nullable: ${row.is_nullable})`);
    });

    // 3. Verificar si existe la secuencia
    console.log('\n3️⃣ Verificando secuencias existentes...');
    const sequenceCheck = await pool.query(`
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_name LIKE '%users%'
    `);

    if (sequenceCheck.rows.length > 0) {
      console.log('✅ Secuencias encontradas:');
      sequenceCheck.rows.forEach(row => {
        console.log(`  • ${row.sequence_name}`);
      });
    } else {
      console.log('❌ No hay secuencias para users');
    }

    // 4. Verificar el default del campo id
    const idDefault = structureResult.rows.find(r => r.column_name === 'id');
    if (idDefault && idDefault.column_default) {
      console.log(`\n✅ El campo id tiene default: ${idDefault.column_default}`);
    } else {
      console.log('\n❌ El campo id NO tiene default configurado');
    }

    // 5. Resumen del diagnóstico
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DEL DIAGNÓSTICO');
    console.log('='.repeat(60));

    const hasSequence = sequenceCheck.rows.length > 0;
    const hasDefault = idDefault && idDefault.column_default;

    if (hasSequence && hasDefault) {
      console.log('\n✅ La tabla users está correctamente configurada');
      console.log('   La secuencia existe y el campo id tiene un default válido');
    } else {
      console.log('\n❌ La tabla users NECESITA CORRECCIÓN');
      if (!hasSequence) {
        console.log('   • Falta crear la secuencia users_id_seq');
      }
      if (!hasDefault) {
        console.log('   • Falta configurar el default del campo id');
      }
      console.log('\n💡 Ejecuta: node backend/src/scripts/fixUsersSequence.js');
    }

    console.log('\n' + '='.repeat(60) + '\n');

    await pool.end();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n📝 Stack trace:', error.stack);
    process.exit(1);
  }
}

diagnoseUsersSequence();
