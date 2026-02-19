/**
 * Script para diagnosticar y corregir la secuencia auto-incremento en return_reception_items.id
 */

require('dotenv').config();
const { Pool } = require('pg');

async function fixReturnReceptionItemsSequence() {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Contrasena14.',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'inventory'
  });

  try {
    console.log('\n🔍 DIAGNÓSTICO DE TABLA return_reception_items');
    console.log('='.repeat(60));

    // 1. Verificar si la tabla existe
    console.log('\n1️⃣ Verificando si la tabla return_reception_items existe...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'return_reception_items'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ La tabla return_reception_items NO existe');
      await pool.end();
      return;
    }
    console.log('✅ La tabla return_reception_items existe');

    // 2. Ver la estructura actual
    console.log('\n2️⃣ Estructura actual de return_reception_items:');
    const structureResult = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'return_reception_items'
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
      WHERE sequence_name LIKE '%return_reception_items%'
    `);

    if (sequenceCheck.rows.length > 0) {
      console.log('✅ Secuencias encontradas:');
      sequenceCheck.rows.forEach(row => {
        console.log(`  • ${row.sequence_name}`);
      });
    } else {
      console.log('❌ No hay secuencias para return_reception_items');
    }

    // 4. Obtener el máximo id actual
    console.log('\n4️⃣ Obteniendo máximo id actual...');
    const maxIdResult = await pool.query(`
      SELECT COALESCE(MAX(id), 0) as max_id FROM return_reception_items
    `);
    const maxId = maxIdResult.rows[0].max_id;
    const nextId = maxId + 1;
    console.log(`   Máximo id actual: ${maxId}`);
    console.log(`   Próximo id será: ${nextId}`);

    // 5. Proceder con la corrección
    console.log('\n' + '='.repeat(60));
    console.log('🔧 APLICANDO CORRECCIONES');
    console.log('='.repeat(60));

    // Crear secuencia si no existe
    console.log('\n1️⃣ Creando secuencia return_reception_items_id_seq...');
    try {
      await pool.query(`
        CREATE SEQUENCE IF NOT EXISTS return_reception_items_id_seq
        START WITH ${nextId}
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1
      `);
      console.log('✅ Secuencia creada: return_reception_items_id_seq');
    } catch (error) {
      console.error('❌ Error creando secuencia:', error.message);
      throw error;
    }

    // Establecer el default en la columna id
    console.log('\n2️⃣ Configurando default para return_reception_items.id...');
    try {
      await pool.query(`
        ALTER TABLE return_reception_items
        ALTER COLUMN id SET DEFAULT nextval('return_reception_items_id_seq')
      `);
      console.log('✅ Default establecido: nextval(\'return_reception_items_id_seq\')');
    } catch (error) {
      console.error('❌ Error configurando default:', error.message);
      throw error;
    }

    // Vincular la secuencia a la tabla (OWNED BY)
    console.log('\n3️⃣ Vinculando secuencia a la tabla...');
    try {
      await pool.query(`
        ALTER SEQUENCE return_reception_items_id_seq OWNED BY return_reception_items.id
      `);
      console.log('✅ Secuencia vinculada a return_reception_items.id');
    } catch (error) {
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
      WHERE table_name = 'return_reception_items'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Estructura final de return_reception_items:');
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
      WHERE sequence_name LIKE '%return_reception_items%'
    `);

    if (finalSequences.rows.length > 0) {
      finalSequences.rows.forEach(row => {
        console.log(`  ✅ ${row.sequence_name}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ CORRECCIÓN COMPLETADA EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log('\n💡 Ahora puedes insertar en return_reception_items sin especificar el id.\n');

    await pool.end();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n📝 Stack trace:', error.stack);
    process.exit(1);
  }
}

fixReturnReceptionItemsSequence();
