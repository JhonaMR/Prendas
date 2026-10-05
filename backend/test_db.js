const { Pool } = require('pg'); 
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'inventory_dev', password: 'Contrasena14.', port: 5433 }); 
pool.query("SELECT id, referencia, linea FROM fichas_costo WHERE linea IS NOT NULL AND linea != 'Elegir' LIMIT 5")
  .then(res => { console.log('COSTO:', res.rows); pool.end(); })
  .catch(e => { console.error(e); pool.end(); });
