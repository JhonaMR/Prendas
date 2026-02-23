/**
 * Migration Script: Add affects_inventory column to receptions table
 * Run this script to add the new column to your database
 * 
 * Usage: node scripts/migrate-affects-inventory.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('pg');
const logger = require('../src/utils/logger');

const migrate = async () => {
    // Crear pool de conexión con variables de entorno
    const pool = new Pool({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME
    });

    try {
        logger.info('🔄 Starting migration: Adding affects_inventory column...');
        logger.info(`📍 Connecting to ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

        // Check if column already exists
        const checkResult = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'receptions' AND column_name = 'affects_inventory'
        `);

        if (checkResult.rows.length > 0) {
            logger.info('✅ Column affects_inventory already exists. Migration skipped.');
            await pool.end();
            process.exit(0);
        }

        // Add the column
        await pool.query(`
            ALTER TABLE public.receptions
            ADD COLUMN affects_inventory BOOLEAN DEFAULT TRUE
        `);

        logger.info('✅ Column affects_inventory added successfully');

        // Add comment
        await pool.query(`
            COMMENT ON COLUMN public.receptions.affects_inventory IS 'Controls whether this reception impacts the inventory. Set to FALSE for partial receptions that are part of a larger batch.'
        `);

        logger.info('✅ Migration completed successfully!');
        logger.info('📝 All existing receptions will have affects_inventory = TRUE by default');
        
        await pool.end();
        process.exit(0);

    } catch (error) {
        logger.error('❌ Migration failed:', error.message);
        await pool.end();
        process.exit(1);
    }
};

migrate();
