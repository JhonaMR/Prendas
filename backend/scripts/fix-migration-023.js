const pg = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new pg.Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  database: 'inventory_dev'
});

(async () => {
  try {
    const result = await pool.query(
      'DELETE FROM schema_migrations WHERE migration_name = $1',
      ['023_add_fecha_inicio_fin_to_correrias.sql']
    );
    console.log('✓ Registro fallido eliminado:', result.rowCount, 'fila(s)');
    await pool.end();
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
})();
