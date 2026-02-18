/**
 * Script para crear secuencia auto-incremento en order_items.id
 */

require('dotenv').config();
const { Pool } = require('pg');

async function fixOrderItemsSequence() {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Contrasena14.',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'inventory'
  });

  try {
    console.log('\n🔧 Creando secuencia para order_items.id...');

    // Crear secuencia
    await pool.query(`
      CREATE SEQUENCE IF NOT EXISTS order_items_id_seq
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1
    `);
    console.log('✅ Secuencia creada: order_items_id_seq');

    // Establecer el default
    await pool.query(`
      ALTER TABLE order_items
      ALTER COLUMN id SET DEFAULT nextval('order_items_id_seq')
    `);
    console.log('✅ Default establecido para order_items.id');

    // Verificar la estructura
    const result = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'order_items'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Estructura de order_items:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (default: ${row.column_default || 'NONE'}, nullable: ${row.is_nullable})`);
    });

    console.log('\n✅ Secuencia configurada correctamente');
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixOrderItemsSequence();
