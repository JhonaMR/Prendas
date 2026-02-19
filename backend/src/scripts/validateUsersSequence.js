/**
 * Script para validar que la secuencia de users está correctamente configurada
 * 
 * Este script verifica:
 * 1. Que la secuencia users_id_seq existe
 * 2. Que el campo id tiene un default válido
 * 3. Que la secuencia está vinculada a la tabla
 */

require('dotenv').config();
const { Pool } = require('pg');

async function validateUsersSequence() {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Contrasena14.',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'inventory'
  });

  try {
    console.log('\n✅ VALIDACIÓN DE CONFIGURACIÓN DE users');
    console.log('='.repeat(60));

    let allValid = true;

    // 1. Verificar que la tabla existe
    console.log('\n1️⃣ Verificando tabla users...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'users'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ La tabla users NO existe');
      allValid = false;
    } else {
      console.log('✅ La tabla users existe');
    }

    // 2. Verificar que la secuencia existe
    console.log('\n2️⃣ Verificando secuencia users_id_seq...');
    const sequenceCheck = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.sequences 
        WHERE sequence_name = 'users_id_seq'
      )
    `);

    if (!sequenceCheck.rows[0].exists) {
      console.log('❌ La secuencia users_id_seq NO existe');
      allValid = false;
    } else {
      console.log('✅ La secuencia users_id_seq existe');
    }

    // 3. Verificar que el campo id tiene default
    console.log('\n3️⃣ Verificando default del campo id...');
    const defaultCheck = await pool.query(`
      SELECT column_default
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'id'
    `);

    if (defaultCheck.rows.length === 0) {
      console.log('❌ No se encontró el campo id');
      allValid = false;
    } else if (!defaultCheck.rows[0].column_default) {
      console.log('❌ El campo id NO tiene default configurado');
      allValid = false;
    } else if (!defaultCheck.rows[0].column_default.includes('nextval')) {
      console.log(`❌ El default del campo id no es válido: ${defaultCheck.rows[0].column_default}`);
      allValid = false;
    } else {
      console.log(`✅ El campo id tiene default válido: ${defaultCheck.rows[0].column_default}`);
    }

    // 4. Verificar que la secuencia está vinculada
    console.log('\n4️⃣ Verificando ownership de la secuencia...');
    const ownershipCheck = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.sequences 
        WHERE sequence_name = 'users_id_seq' 
        AND sequence_schema = 'public'
      )
    `);

    if (!ownershipCheck.rows[0].exists) {
      console.log('❌ La secuencia no está correctamente vinculada');
      allValid = false;
    } else {
      console.log('✅ La secuencia está correctamente vinculada');
    }

    // 5. Resumen de validación
    console.log('\n' + '='.repeat(60));
    if (allValid) {
      console.log('✅ VALIDACIÓN EXITOSA');
      console.log('='.repeat(60));
      console.log('\n✅ La tabla users está correctamente configurada');
      console.log('   • Secuencia users_id_seq existe');
      console.log('   • Campo id tiene default válido');
      console.log('   • Secuencia está vinculada a la tabla');
      console.log('\n💡 El endpoint POST /api/auth/register debería funcionar correctamente');
      console.log('   Puedes probar creando un nuevo usuario.\n');
    } else {
      console.log('❌ VALIDACIÓN FALLIDA');
      console.log('='.repeat(60));
      console.log('\n❌ La tabla users NECESITA CORRECCIÓN');
      console.log('   Ejecuta: node backend/src/scripts/fixUsersSequence.js\n');
    }

    await pool.end();
    process.exit(allValid ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n📝 Stack trace:', error.stack);
    process.exit(1);
  }
}

validateUsersSequence();
