/**
 * Script de migración: Mapear nombres de vendedores a IDs
 * 
 * Este script migra los datos existentes de clientes que tienen
 * nombres de vendedores en texto libre a IDs de vendedores.
 * 
 * Uso: node backend/src/scripts/migrateSellersToIds.js
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../database/inventory.db');

function migrateSellersToIds() {
  console.log('🔄 Iniciando migración de vendedores...');
  console.log('📁 Base de datos:', DB_PATH);

  try {
    const db = new Database(DB_PATH);
    db.pragma('foreign_keys = ON');

    // Obtener todos los vendedores
    const sellers = db.prepare('SELECT id, name FROM sellers').all();
    console.log(`\n📊 Vendedores encontrados: ${sellers.length}`);
    sellers.forEach(s => console.log(`   - ${s.id}: ${s.name}`));

    // Obtener todos los clientes con nombres de vendedores
    const clients = db.prepare('SELECT id, name, seller FROM clients WHERE seller IS NOT NULL').all();
    console.log(`\n👥 Clientes con vendedores: ${clients.length}`);

    const migrationResult = {
      totalClients: clients.length,
      migratedClients: 0,
      unmatchedClients: [],
      errors: []
    };

    // Iniciar transacción
    db.prepare('BEGIN').run();

    try {
      // Para cada cliente, buscar el vendedor correspondiente
      for (const client of clients) {
        const sellerName = client.seller.trim();
        
        // Buscar vendedor por nombre (case-insensitive)
        const matchedSeller = sellers.find(s => 
          s.name.toLowerCase() === sellerName.toLowerCase()
        );

        if (matchedSeller) {
          // Actualizar cliente con sellerId
          db.prepare('UPDATE clients SET sellerId = ? WHERE id = ?')
            .run(matchedSeller.id, client.id);
          
          migrationResult.migratedClients++;
          console.log(`✅ Cliente ${client.id} (${client.name}) → Vendedor ${matchedSeller.id} (${matchedSeller.name})`);
        } else {
          // Registrar cliente sin coincidencia
          migrationResult.unmatchedClients.push({
            clientId: client.id,
            clientName: client.name,
            sellerName: sellerName
          });
          console.log(`⚠️  Cliente ${client.id} (${client.name}) → Vendedor NO ENCONTRADO: "${sellerName}"`);
        }
      }

      // Confirmar transacción
      db.prepare('COMMIT').run();

    } catch (error) {
      db.prepare('ROLLBACK').run();
      throw error;
    }

    // Mostrar resumen
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMEN DE MIGRACIÓN');
    console.log('='.repeat(60));
    console.log(`Total de clientes: ${migrationResult.totalClients}`);
    console.log(`Clientes migrados: ${migrationResult.migratedClients}`);
    console.log(`Clientes sin coincidencia: ${migrationResult.unmatchedClients.length}`);

    if (migrationResult.unmatchedClients.length > 0) {
      console.log('\n⚠️  CLIENTES SIN COINCIDENCIA (requieren revisión manual):');
      migrationResult.unmatchedClients.forEach(client => {
        console.log(`   - ${client.clientId} (${client.clientName}): "${client.sellerName}"`);
      });
    }

    // Verificar resultados
    const clientsWithSellerId = db.prepare('SELECT COUNT(*) as count FROM clients WHERE sellerId IS NOT NULL').get();
    const clientsWithoutSellerId = db.prepare('SELECT COUNT(*) as count FROM clients WHERE sellerId IS NULL AND seller IS NOT NULL').get();

    console.log('\n✅ VERIFICACIÓN POST-MIGRACIÓN:');
    console.log(`   Clientes con sellerId: ${clientsWithSellerId.count}`);
    console.log(`   Clientes sin sellerId (pero con seller): ${clientsWithoutSellerId.count}`);

    db.close();

    console.log('\n✅ Migración completada exitosamente!');
    return migrationResult;

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
migrateSellersToIds();
