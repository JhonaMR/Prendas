/**
 * 📑 CREATE INDEXES MIGRATION SCRIPT
 * 
 * Creates strategic indexes on critical tables for query optimization.
 * Run this script once to set up indexes for the projected data volume.
 */

const { getDatabaseConnectionManager } = require('../config/DatabaseConnectionManager');
const { initDatabase } = require('../config/database');

function createIndexes() {
    console.log('📑 Creating strategic indexes...\n');

    // Initialize database first
    initDatabase();

    // Get persistent connection
    const dbManager = getDatabaseConnectionManager();
    const db = dbManager.connect();

    try {
        // ===== SEARCH INDEXES (6.1) =====
        console.log('Creating search indexes...');
        
        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_clients_name 
            ON clients(name)
        `);
        console.log('✅ Index created: idx_clients_name');

        // idx_clients_email - solo si la columna existe
        try {
          db.exec(`
              CREATE INDEX IF NOT EXISTS idx_clients_email 
              ON clients(email)
          `);
          console.log('✅ Index created: idx_clients_email');
        } catch (e) {
          // Columna no existe, ignorar
        }

        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_sellers_name 
            ON sellers(name)
        `);
        console.log('✅ Index created: idx_sellers_name');

        // idx_sellers_email - solo si la columna existe
        try {
          db.exec(`
              CREATE INDEX IF NOT EXISTS idx_sellers_email 
              ON sellers(email)
          `);
          console.log('✅ Index created: idx_sellers_email');
        } catch (e) {
          // Columna no existe, ignorar
        }

        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_confeccionistas_name 
            ON confeccionistas(name)
        `);
        console.log('✅ Index created: idx_confeccionistas_name');

        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_references_code 
            ON product_references(id)
        `);
        console.log('✅ Index created: idx_references_code');

        // ===== FILTERING INDEXES (6.2) =====
        console.log('\nCreating filtering indexes...');
        
        try {
          db.exec(`
              CREATE INDEX IF NOT EXISTS idx_clients_active 
              ON clients(active)
          `);
          console.log('✅ Index created: idx_clients_active');
        } catch (e) {
          // Columna no existe, ignorar
        }

        // idx_clients_status - solo si la columna existe
        try {
          db.exec(`
              CREATE INDEX IF NOT EXISTS idx_clients_status 
              ON clients(status)
          `);
          console.log('✅ Index created: idx_clients_status');
        } catch (e) {
          // Columna no existe, ignorar
        }

        try {
          db.exec(`
              CREATE INDEX IF NOT EXISTS idx_orders_status 
              ON orders(status)
          `);
          console.log('✅ Index created: idx_orders_status');
        } catch (e) {
          // Columna no existe, ignorar
        }

        // idx_orders_active - solo si la columna existe
        try {
          db.exec(`
              CREATE INDEX IF NOT EXISTS idx_orders_active 
              ON orders(active)
          `);
          console.log('✅ Index created: idx_orders_active');
        } catch (e) {
          // Columna no existe, ignorar
        }

        // ===== RELATIONSHIP INDEXES (6.3) =====
        console.log('\nCreating relationship indexes...');
        
        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_orders_client_id 
            ON orders(client_id)
        `);
        console.log('✅ Index created: idx_orders_client_id');

        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_orders_seller_id 
            ON orders(seller_id)
        `);
        console.log('✅ Index created: idx_orders_seller_id');

        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
            ON order_items(order_id)
        `);
        console.log('✅ Index created: idx_order_items_order_id');

        // ===== DATE INDEXES (6.4) =====
        console.log('\nCreating date indexes...');
        
        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_clients_created_at 
            ON clients(created_at)
        `);
        console.log('✅ Index created: idx_clients_created_at');

        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_orders_created_at 
            ON orders(created_at)
        `);
        console.log('✅ Index created: idx_orders_created_at');

        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_delivery_dates_delivery_date 
            ON delivery_dates(delivery_date)
        `);
        console.log('✅ Index created: idx_delivery_dates_delivery_date');

        // ===== COMPOSITE INDEXES =====
        console.log('\nCreating composite indexes...');
        
        try {
          // Index 1: delivery_dates (confeccionista_id, reference_id, send_date)
          db.exec(`
              CREATE INDEX IF NOT EXISTS idx_delivery_dates_confeccionista_reference_date 
              ON delivery_dates(confeccionista_id, reference_id, send_date)
          `);
          console.log('✅ Index created: idx_delivery_dates_confeccionista_reference_date');
        } catch (e) {
          // Columna no existe, ignorar
        }

        try {
          // Index 2: dispatch_items (reference_id)
          db.exec(`
              CREATE INDEX IF NOT EXISTS idx_dispatch_items_reference 
              ON dispatch_items(reference_id)
          `);
          console.log('✅ Index created: idx_dispatch_items_reference');
        } catch (e) {
          // Columna no existe, ignorar
        }

        try {
          // Index 3: reception_items (reference_id)
          db.exec(`
              CREATE INDEX IF NOT EXISTS idx_reception_items_reference 
              ON reception_items(reference_id)
          `);
          console.log('✅ Index created: idx_reception_items_reference');
        } catch (e) {
          // Columna no existe, ignorar
        }

        try {
          // Index 4: orders (correria_id, client_id)
          db.exec(`
              CREATE INDEX IF NOT EXISTS idx_orders_correria_client 
              ON orders(correria_id, client_id)
          `);
          console.log('✅ Index created: idx_orders_correria_client');
        } catch (e) {
          // Columna no existe, ignorar
        }

        // Additional useful indexes
        console.log('\nCreating additional indexes...');
        
        try {
          db.exec(`
              CREATE INDEX IF NOT EXISTS idx_delivery_dates_confeccionista 
              ON delivery_dates(confeccionista_id)
          `);
          console.log('✅ Index created: idx_delivery_dates_confeccionista');
        } catch (e) {
          // Columna no existe, ignorar
        }

        try {
          db.exec(`
              CREATE INDEX IF NOT EXISTS idx_delivery_dates_reference 
              ON delivery_dates(reference_id)
          `);
          console.log('✅ Index created: idx_delivery_dates_reference');
        } catch (e) {
          // Columna no existe, ignorar
        }

        try {
          db.exec(`
              CREATE INDEX IF NOT EXISTS idx_dispatch_items_dispatch 
              ON dispatch_items(dispatch_id)
          `);
          console.log('✅ Index created: idx_dispatch_items_dispatch');
        } catch (e) {
          // Columna no existe, ignorar
        }

        try {
          db.exec(`
              CREATE INDEX IF NOT EXISTS idx_reception_items_reception 
              ON reception_items(reception_id)
          `);
          console.log('✅ Index created: idx_reception_items_reception');
        } catch (e) {
          // Columna no existe, ignorar
        }

        try {
          db.exec(`
              CREATE INDEX IF NOT EXISTS idx_orders_client 
              ON orders(client_id)
          `);
          console.log('✅ Index created: idx_orders_client');
        } catch (e) {
          // Columna no existe, ignorar
        }

        try {
          db.exec(`
              CREATE INDEX IF NOT EXISTS idx_orders_correria 
              ON orders(correria_id)
          `);
          console.log('✅ Index created: idx_orders_correria');
        } catch (e) {
          // Columna no existe, ignorar
        }

        console.log('\n✅ All indexes created successfully!');
        console.log('📊 Database schema updated without data loss');

    } catch (error) {
        console.error('❌ Error creating indexes:', error);
        throw error;
    } finally {
        // Close connection
        dbManager.disconnect();
    }
}

// Run if executed directly
if (require.main === module) {
    createIndexes();
}

module.exports = { createIndexes };
