/**
 * Script para verificar si la tabla sellers existe en PostgreSQL
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { initDatabase, query } = require('../config/database');

async function checkSellersTable() {
  try {
    console.log('🔍 Verificando tabla sellers...');
    await initDatabase();
    
    // Verificar si la tabla existe
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sellers'
      );
    `);
    
    const exists = tableCheck.rows[0].exists;
    console.log(`📊 Tabla 'sellers' existe: ${exists ? '✅ Sí' : '❌ No'}`);
    
    if (exists) {
      // Verificar estructura
      const columns = await query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = 'sellers'
        ORDER BY ordinal_position;
      `);
      
      console.log(`\n📊 Columnas en tabla sellers: ${columns.rows.length}`);
      columns.rows.forEach((col, index) => {
        console.log(`  ${index + 1}. ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL'}`);
      });
      
      // Verificar datos
      const sellers = await query('SELECT id, name FROM sellers LIMIT 5');
      console.log(`\n📊 Muestra de vendedores (${sellers.rows.length}):`);
      sellers.rows.forEach((seller, index) => {
        console.log(`  ${index + 1}. ${seller.id} - ${seller.name || 'Sin nombre'}`);
      });
      
      const count = await query('SELECT COUNT(*) as total FROM sellers');
      console.log(`\n📊 Total de vendedores: ${count.rows[0].total}`);
    } else {
      console.log('\n⚠️  La tabla sellers no existe en PostgreSQL.');
      console.log('   Esto causará errores en createClient() y updateClient()');
      console.log('   cuando se valide seller_id.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkSellersTable();
}

module.exports = { checkSellersTable };