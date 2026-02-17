/**
 * Script para poblar la tabla de vendedores desde los clientes existentes
 * 
 * Este script extrae todos los nombres de vendedores únicos de la tabla de clientes
 * y los inserta en la tabla de vendedores si no existen.
 * 
 * Uso: node backend/src/scripts/populateSellersFromClients.js
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../database/inventory.db');

function generateId() {
  return 'S' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

function populateSellersFromClients() {
  console.log('🔄 Iniciando población de vendedores desde clientes...');
  console.log('📁 Base de datos:', DB_PATH);

  try {
    const db = new Database(DB_PATH);
    db.pragma('foreign_keys = ON');

    // Obtener todos los vendedores existentes
    const existingSellers = db.prepare('SELECT id, name FROM sellers').all();
    console.log(`\n📊 Vendedores existentes: ${existingSellers.length}`);
    existingSellers.forEach(s => console.log(`   - ${s.id}: ${s.name}`));

    // Obtener todos los nombres de vendedores únicos de clientes
    const clientSellers = db.prepare(`
      SELECT DISTINCT TRIM(seller) as seller_name 
      FROM clients 
      WHERE seller IS NOT NULL AND seller != ''
      ORDER BY seller_name
    `).all();

    console.log(`\n👥 Nombres de vendedores únicos en clientes: ${clientSellers.length}`);
    clientSellers.forEach(s => console.log(`   - ${s.seller_name}`));

    const result = {
      totalUniqueSellers: clientSellers.length,
      newSellersCreated: 0,
      sellersAlreadyExist: 0,
      createdSellers: [],
      errors: []
    };

    // Iniciar transacción
    db.prepare('BEGIN').run();

    try {
      // Para cada nombre de vendedor único, verificar si existe
      for (const clientSeller of clientSellers) {
        const sellerName = clientSeller.seller_name;

        // Buscar si ya existe un vendedor con este nombre (case-insensitive)
        const existingSeller = existingSellers.find(s => 
          s.name.toLowerCase() === sellerName.toLowerCase()
        );

        if (existingSeller) {
          result.sellersAlreadyExist++;
          console.log(`✅ Vendedor ya existe: ${existingSeller.id} - ${existingSeller.name}`);
        } else {
          // Crear nuevo vendedor
          const newSellerId = generateId();
          db.prepare('INSERT INTO sellers (id, name, active) VALUES (?, ?, 1)')
            .run(newSellerId, sellerName);
          
          result.newSellersCreated++;
          result.createdSellers.push({ id: newSellerId, name: sellerName });
          console.log(`✨ Nuevo vendedor creado: ${newSellerId} - ${sellerName}`);
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
    console.log('📋 RESUMEN DE POBLACIÓN DE VENDEDORES');
    console.log('='.repeat(60));
    console.log(`Total de nombres únicos: ${result.totalUniqueSellers}`);
    console.log(`Vendedores nuevos creados: ${result.newSellersCreated}`);
    console.log(`Vendedores que ya existían: ${result.sellersAlreadyExist}`);

    if (result.createdSellers.length > 0) {
      console.log('\n✨ VENDEDORES CREADOS:');
      result.createdSellers.forEach(seller => {
        console.log(`   - ${seller.id}: ${seller.name}`);
      });
    }

    // Verificar resultados finales
    const totalSellers = db.prepare('SELECT COUNT(*) as count FROM sellers').get();
    console.log(`\n✅ Total de vendedores en la base de datos: ${totalSellers.count}`);

    db.close();

    console.log('\n✅ Población de vendedores completada exitosamente!');
    return result;

  } catch (error) {
    console.error('❌ Error durante la población de vendedores:', error);
    process.exit(1);
  }
}

// Ejecutar población
populateSellersFromClients();
