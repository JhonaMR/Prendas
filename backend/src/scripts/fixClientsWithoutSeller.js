/**
 * Script para verificar y asignar vendedor a clientes sin vendedor
 */

require('dotenv').config();
const { Pool } = require('pg');

async function fixClientsWithoutSeller() {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Contrasena14.',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'inventory'
  });

  try {
    // Obtener clientes sin vendedor
    const clientsResult = await pool.query(`
      SELECT id, name, seller_id 
      FROM clients 
      WHERE seller_id IS NULL OR seller_id = ''
    `);

    console.log(`\n📋 Clientes sin vendedor: ${clientsResult.rows.length}`);
    
    if (clientsResult.rows.length > 0) {
      console.log('\nClientes encontrados:');
      clientsResult.rows.forEach(c => {
        console.log(`  - ID: ${c.id}, Nombre: ${c.name}, Vendedor: ${c.seller_id || 'NULL'}`);
      });

      // Obtener primer vendedor disponible
      const sellersResult = await pool.query(`
        SELECT id, name FROM sellers LIMIT 1
      `);

      if (sellersResult.rows.length === 0) {
        console.log('\n❌ No hay vendedores en el sistema. Crea uno primero.');
        await pool.end();
        return;
      }

      const defaultSeller = sellersResult.rows[0];
      console.log(`\n🔧 Asignando vendedor por defecto: ${defaultSeller.name} (${defaultSeller.id})`);

      // Actualizar clientes
      for (const client of clientsResult.rows) {
        await pool.query(`
          UPDATE clients 
          SET seller_id = $1 
          WHERE id = $2
        `, [defaultSeller.id, client.id]);
        console.log(`  ✅ Actualizado: ${client.id}`);
      }

      console.log('\n✅ Todos los clientes han sido actualizados');
    } else {
      console.log('✅ Todos los clientes tienen vendedor asignado');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixClientsWithoutSeller();
