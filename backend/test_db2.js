const { Pool } = require('pg'); 
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'inventory_dev', password: 'Contrasena14.', port: 5433 }); 
pool.query(`
    SELECT
        fc.id, fc.referencia, fc.linea,
        fd.disenadora_id,
        fd.linea as disenadora_linea
    FROM fichas_costo fc
    LEFT JOIN fichas_diseno fd ON (fc.referencia = fd.referencia OR fc.ficha_diseno_id = fd.id)
    WHERE fc.referencia = '13448'
`).then(res => { console.log('QUERY:', res.rows); pool.end(); })
  .catch(e => { console.error(e); pool.end(); });
