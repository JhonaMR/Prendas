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
        // Index 1: delivery_dates (confeccionista_id, reference_id, send_date)
        console.log('Creating index on delivery_dates...');
        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_delivery_dates_confeccionista_reference_date 
            ON delivery_dates(confeccionista_id, reference_id, send_date)
        `);
        console.log('✅ Index created: idx_delivery_dates_confeccionista_reference_date');

        // Index 2: dispatch_items (reference_id)
        console.log('Creating index on dispatch_items...');
        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_dispatch_items_reference 
            ON dispatch_items(reference_id)
        `);
        console.log('✅ Index created: idx_dispatch_items_reference');

        // Index 3: reception_items (reference_id)
        console.log('Creating index on reception_items...');
        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_reception_items_reference 
            ON reception_items(reference_id)
        `);
        console.log('✅ Index created: idx_reception_items_reference');

        // Index 4: orders (correria_id, client_id)
        console.log('Creating index on orders...');
        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_orders_correria_client 
            ON orders(correria_id, client_id)
        `);
        console.log('✅ Index created: idx_orders_correria_client');

        // Additional useful indexes
        console.log('Creating additional indexes...');
        
        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_delivery_dates_confeccionista 
            ON delivery_dates(confeccionista_id)
        `);
        console.log('✅ Index created: idx_delivery_dates_confeccionista');

        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_delivery_dates_reference 
            ON delivery_dates(reference_id)
        `);
        console.log('✅ Index created: idx_delivery_dates_reference');

        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_dispatch_items_dispatch 
            ON dispatch_items(dispatch_id)
        `);
        console.log('✅ Index created: idx_dispatch_items_dispatch');

        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_reception_items_reception 
            ON reception_items(reception_id)
        `);
        console.log('✅ Index created: idx_reception_items_reception');

        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_orders_client 
            ON orders(client_id)
        `);
        console.log('✅ Index created: idx_orders_client');

        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_orders_correria 
            ON orders(correria_id)
        `);
        console.log('✅ Index created: idx_orders_correria');

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
