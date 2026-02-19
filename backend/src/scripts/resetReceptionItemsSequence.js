/**
 * Script para resetear la secuencia de reception_items al valor correcto
 */

require('dotenv').config();
const { Pool } = require('pg');

async function resetReceptionItemsSequence() {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Contrasena14.',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'inventory'
  });

  try {
    console.log('\n🔍 RESETEANDO SECUENCIA DE reception_items');
    console.log('='.repeat(60));

    // 1. Obtener el máximo id actual
    console.log('\n1️⃣ Obteniendo el máximo id actual en reception_items...');
    const maxIdResult = await pool.query(`
      SELECT COALESCE(MAX(id), 0) as max_id FROM reception_items
    `);
    
    const maxId = maxIdResult.rows[0].max_id;
    const nextId = maxId + 1;
    
    console.log(`   Máximo id actual: ${maxId}`);
    console.log(`   Próximo id será: ${nextId}`);

    // 2. Resetear la secuencia
    console.log('\n2️⃣ Reseteando la secuencia...');
    await pool.query(`
      ALTER SEQUENCE reception_items_id_seq RESTART WITH ${nextId}
    `);
    console.log(`✅ Secuencia reseteada a ${nextId}`);

    // 3. Verificar
    console.log('\n3️⃣ Verificando la secuencia...');
    const seqResult = await pool.query(`
      SELECT last_value FROM reception_items_id_seq
    `);
    
    console.log(`✅ Valor actual de la secuencia: ${seqResult.rows[0].last_value}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ SECUENCIA RESETEADA EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log('\n💡 Ahora los nuevos inserts funcionarán correctamente.\n');

    await pool.end();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n📝 Stack trace:', error.stack);
    process.exit(1);
  }
}

resetReceptionItemsSequence();
