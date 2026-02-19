/**
 * Script para diagnosticar y corregir la secuencia auto-incremento en users.id
 * 
 * Problema: El error "null value in column "id" of relation "users" violates not-null constraint"
 * ocurre porque la tabla users no tiene la secuencia configurada correctamente.
 * 
 * Solución: Este script crea la secuencia y la vincula al campo id.
 */

require('dotenv').config();
const { Pool } = require('pg');

async function fixUsersSequence() {
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

    // 5. Proceder con la corrección
    console.log('\n' + '='.repeat(60));
    console.log('🔧 APLICANDO CORRECCIONES');
    console.log('='.repeat(60));

    // Crear secuencia si no existe
    console.log('\n1️⃣ Creando secuencia users_id_seq...');
    try {
      await pool.query(`
        CREATE SEQUENCE IF NOT EXISTS users_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1
      `);
      console.log('✅ Secuencia creada/verificada: users_id_seq');
    } catch (error) {
      console.error('❌ Error creando secuencia:', error.message);
      throw error;
    }

    // Establecer el default en la columna id
    console.log('\n2️⃣ Configurando default para users.id...');
    try {
      await pool.query(`
        ALTER TABLE users
        ALTER COLUMN id SET DEFAULT nextval('users_id_seq')
      `);
      console.log('✅ Default establecido: nextval(\'users_id_seq\')');
    } catch (error) {
      console.error('❌ Error configurando default:', error.message);
      throw error;
    }

    // Vincular la secuencia a la tabla (OWNED BY)
    console.log('\n3️⃣ Vinculando secuencia a la tabla...');
    try {
      await pool.query(`
        ALTER SEQUENCE users_id_seq OWNED BY users.id
      `);
      console.log('✅ Secuencia vinculada a users.id');
    } catch (error) {
      // Este error es normal si ya está vinculada
      if (error.message.includes('already owned')) {
        console.log('ℹ️ La secuencia ya estaba vinculada');
      } else {
        console.error('❌ Error vinculando secuencia:', error.message);
        throw error;
      }
    }

    // 6. Verificar la configuración final
    console.log('\n' + '='.repeat(60));
    console.log('✅ VERIFICACIÓN FINAL');
    console.log('='.repeat(60));

    const finalStructure = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Estructura final de users:');
    finalStructure.rows.forEach(row => {
      const defaultValue = row.column_default || 'NONE';
      const status = row.column_name === 'id' && row.column_default ? '✅' : '  ';
      console.log(`${status} ${row.column_name}: ${row.data_type} (default: ${defaultValue}, nullable: ${row.is_nullable})`);
    });

    // 7. Verificar secuencias finales
    console.log('\n📋 Secuencias configuradas:');
    const finalSequences = await pool.query(`
      SELECT sequence_name, data_type
      FROM information_schema.sequences 
      WHERE sequence_name LIKE '%users%'
    `);

    if (finalSequences.rows.length > 0) {
      finalSequences.rows.forEach(row => {
        console.log(`  ✅ ${row.sequence_name}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ CORRECCIÓN COMPLETADA EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log('\n💡 Ahora puedes insertar en users sin especificar el id:');
    console.log('   INSERT INTO users (name, login_code, pin_hash, role, active)');
    console.log('   VALUES ($1, $2, $3, $4, $5)');
    console.log('\nEl id se auto-generará automáticamente.\n');

    await pool.end();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n📝 Stack trace:', error.stack);
    process.exit(1);
  }
}

fixUsersSequence();
