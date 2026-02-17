/**
 * Script para agregar la columna sellerId a la tabla clients
 * 
 * Uso: node backend/src/scripts/addSellerIdColumn.js
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../database/inventory.db');

function addSellerIdColumn() {
  console.log('🔄 Agregando columna sellerId a tabla clients...');
  console.log('📁 Base de datos:', DB_PATH);

  try {
    const db = new Database(DB_PATH);
    db.pragma('foreign_keys = ON');

    // Verificar si la columna ya existe
    const columns = db.prepare("PRAGMA table_info(clients)").all();
    const hasSellerIdColumn = columns.some(col => col.name === 'sellerId');

    if (hasSellerIdColumn) {
      console.log('✅ La columna sellerId ya existe');
      db.close();
      return;
    }

    // Agregar la columna
    console.log('➕ Agregando columna sellerId...');
    db.exec(`
      ALTER TABLE clients ADD COLUMN sellerId TEXT
    `);

    console.log('✅ Columna sellerId agregada exitosamente');

    db.close();
    console.log('\n✅ Migración completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

addSellerIdColumn();
