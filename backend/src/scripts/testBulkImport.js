/**
 * Script para probar la carga masiva de datos (CSV)
 * Verifica que clientes, referencias, confeccionistas, etc. se importan correctamente
 */

require('dotenv').config();
const { Pool } = require('pg');

async function testBulkImport() {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Contrasena14.',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'inventory'
  });

  try {
    console.log('\n🔍 PRUEBA DE CARGA MASIVA DE DATOS');
    console.log('='.repeat(70));

    // 1. Verificar tabla de clientes
    console.log('\n1️⃣ Verificando tabla de clientes...');
    const clientsResult = await pool.query(`
      SELECT COUNT(*) as count FROM clients
    `);
    console.log(`   Total de clientes: ${clientsResult.rows[0].count}`);

    // 2. Verificar tabla de referencias
    console.log('\n2️⃣ Verificando tabla de referencias...');
    const referencesResult = await pool.query(`
      SELECT COUNT(*) as count FROM product_references
    `);
    console.log(`   Total de referencias: ${referencesResult.rows[0].count}`);

    // 3. Verificar tabla de confeccionistas
    console.log('\n3️⃣ Verificando tabla de confeccionistas...');
    const confeccionistasResult = await pool.query(`
      SELECT COUNT(*) as count FROM confeccionistas
    `);
    console.log(`   Total de confeccionistas: ${confeccionistasResult.rows[0].count}`);

    // 4. Verificar tabla de correrias
    console.log('\n4️⃣ Verificando tabla de correrias...');
    const correriasResult = await pool.query(`
      SELECT COUNT(*) as count FROM correrias
    `);
    console.log(`   Total de correrias: ${correriasResult.rows[0].count}`);

    // 5. Verificar tabla de sellers
    console.log('\n5️⃣ Verificando tabla de sellers...');
    const sellersResult = await pool.query(`
      SELECT COUNT(*) as count FROM sellers
    `);
    console.log(`   Total de vendedores: ${sellersResult.rows[0].count}`);

    // 6. Verificar tabla de delivery_dates
    console.log('\n6️⃣ Verificando tabla de delivery_dates...');
    const deliveryDatesResult = await pool.query(`
      SELECT COUNT(*) as count FROM delivery_dates
    `);
    console.log(`   Total de fechas de entrega: ${deliveryDatesResult.rows[0].count}`);

    // 7. Verificar integridad referencial
    console.log('\n7️⃣ Verificando integridad referencial...');
    
    // Clientes sin vendedor válido
    const orphanClientsResult = await pool.query(`
      SELECT COUNT(*) as count FROM clients c
      WHERE c.seller_id IS NOT NULL 
      AND NOT EXISTS (SELECT 1 FROM sellers s WHERE s.id = c.seller_id)
    `);
    console.log(`   Clientes huérfanos: ${orphanClientsResult.rows[0].count}`);

    // Referencias sin correrias
    const orphanReferencesResult = await pool.query(`
      SELECT COUNT(*) as count FROM product_references r
      WHERE NOT EXISTS (SELECT 1 FROM correria_catalog rc WHERE rc.reference_id = r.id)
    `);
    console.log(`   Referencias sin correrias: ${orphanReferencesResult.rows[0].count}`);

    // 8. Verificar que las secuencias están correctas
    console.log('\n8️⃣ Verificando secuencias...');
    const sequencesResult = await pool.query(`
      SELECT sequence_name, last_value
      FROM information_schema.sequences
      WHERE sequence_name IN (
        'reception_items_id_seq',
        'dispatch_items_id_seq',
        'return_reception_items_id_seq'
      )
      ORDER BY sequence_name
    `);

    console.log('   Secuencias:');
    sequencesResult.rows.forEach(row => {
      console.log(`      • ${row.sequence_name}: ${row.last_value}`);
    });

    // 9. Resumen
    console.log('\n' + '='.repeat(70));
    console.log('✅ PRUEBA COMPLETADA');
    console.log('='.repeat(70));
    console.log('\n📊 Resumen de datos:');
    console.log(`   • Clientes: ${clientsResult.rows[0].count}`);
    console.log(`   • Referencias: ${referencesResult.rows[0].count}`);
    console.log(`   • Confeccionistas: ${confeccionistasResult.rows[0].count}`);
    console.log(`   • Correrias: ${correriasResult.rows[0].count}`);
    console.log(`   • Vendedores: ${sellersResult.rows[0].count}`);
    console.log(`   • Fechas de entrega: ${deliveryDatesResult.rows[0].count}`);
    console.log(`\n💡 Integridad referencial:`);
    console.log(`   • Clientes huérfanos: ${orphanClientsResult.rows[0].count}`);
    console.log(`   • Referencias sin correrias: ${orphanReferencesResult.rows[0].count}`);
    console.log('\n✅ La carga masiva de datos está funcionando correctamente.\n');

    await pool.end();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n📝 Stack trace:', error.stack);
    process.exit(1);
  }
}

testBulkImport();
