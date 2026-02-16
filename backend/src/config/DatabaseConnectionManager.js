/**
 * 🔌 DATABASE CONNECTION MANAGER
 * 
 * Manages persistent SQLite connection lifecycle.
 * Ensures a single connection is reused throughout the application lifetime.
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class DatabaseConnectionManager {
    constructor(dbPath) {
        this.dbPath = dbPath || process.env.DATABASE_PATH || path.join(__dirname, '../../database/inventory.db');
        this.connection = null;
        this.isConnected = false;
    }

    /**
     * Establish persistent database connection
     */
    connect() {
        if (this.isConnected && this.connection) {
            console.log('✅ Database connection already established');
            return this.connection;
        }

        try {
            // Ensure database directory exists
            const dbDir = path.dirname(this.dbPath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            // Create connection
            this.connection = new Database(this.dbPath);
            
            // Enable foreign keys
            this.connection.pragma('foreign_keys = ON');
            
            // Set connection to persistent mode
            this.connection.pragma('journal_mode = WAL');
            
            this.isConnected = true;
            console.log('✅ Database connection established and persisted');
            return this.connection;
        } catch (error) {
            console.error('❌ Error establishing database connection:', error);
            this.isConnected = false;
            throw error;
        }
    }

    /**
     * Get the persistent connection
     */
    getConnection() {
        if (!this.isConnected || !this.connection) {
            return this.connect();
        }
        return this.connection;
    }

    /**
     * Execute a query using the persistent connection
     */
    query(sql, params = []) {
        const conn = this.getConnection();
        try {
            const stmt = conn.prepare(sql);
            return stmt.all(...params);
        } catch (error) {
            console.error('❌ Query error:', error);
            throw error;
        }
    }

    /**
     * Execute a query and return single result
     */
    queryOne(sql, params = []) {
        const conn = this.getConnection();
        try {
            const stmt = conn.prepare(sql);
            return stmt.get(...params);
        } catch (error) {
            console.error('❌ Query error:', error);
            throw error;
        }
    }

    /**
     * Execute a query that modifies data
     */
    run(sql, params = []) {
        const conn = this.getConnection();
        try {
            const stmt = conn.prepare(sql);
            return stmt.run(...params);
        } catch (error) {
            console.error('❌ Run error:', error);
            throw error;
        }
    }

    /**
     * Gracefully close the persistent connection
     */
    disconnect() {
        if (this.connection && this.isConnected) {
            try {
                this.connection.close();
                this.isConnected = false;
                this.connection = null;
                console.log('✅ Database connection closed gracefully');
            } catch (error) {
                console.error('❌ Error closing database connection:', error);
                throw error;
            }
        }
    }

    /**
     * Check if connection is active
     */
    isActive() {
        return this.isConnected && this.connection !== null;
    }
}

// Create singleton instance
let instance = null;

function getDatabaseConnectionManager(dbPath) {
    if (!instance) {
        instance = new DatabaseConnectionManager(dbPath);
    }
    return instance;
}

module.exports = {
    DatabaseConnectionManager,
    getDatabaseConnectionManager
};
