const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: 'inventory_dev'
});

pool.query('DELETE FROM schema_migrations WHERE migration_name = $1', ['022_create_maletas_referencias_recibidas.sql'], (err, res) => {
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } else {
    console.log('✓ Migración fallida eliminada de schema_migrations');
    process.exit(0);
  }
  pool.end();
});
