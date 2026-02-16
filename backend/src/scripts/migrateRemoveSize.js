/**
 * Script para migrar la base de datos y remover la columna 'size' de las tablas
 * Ejecutar: node backend/src/scripts/migrateRemoveSize.js
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../database/inventory.db');
const db = new Database(dbPath);

console.log('🔄 Iniciando migración para remover columna size...\n');

try {
  // Habilitar foreign keys
  db.pragma('foreign_keys = ON');

  // ==================== DISPATCH_ITEMS ====================
  console.log('📝 Migrando tabla dispatch_items...');
  
  // Crear tabla temporal
  db.exec(`
    CREATE TABLE dispatch_items_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dispatch_id TEXT NOT NULL,
      reference TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (dispatch_id) REFERENCES dispatches(id)
    )
  `);

  // Copiar datos (sin size)
  db.exec(`
    INSERT INTO dispatch_items_new (dispatch_id, reference, quantity)
    SELECT dispatch_id, reference, quantity FROM dispatch_items
  `);

  // Eliminar tabla antigua y renombrar
  db.exec(`
    DROP TABLE dispatch_items;
    ALTER TABLE dispatch_items_new RENAME TO dispatch_items;
  `);

  console.log('✅ dispatch_items migrada\n');

  // ==================== RECEPTION_ITEMS ====================
  console.log('📝 Migrando tabla reception_items...');
  
  db.exec(`
    CREATE TABLE reception_items_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reception_id TEXT NOT NULL,
      reference TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (reception_id) REFERENCES receptions(id)
    )
  `);

  db.exec(`
    INSERT INTO reception_items_new (reception_id, reference, quantity)
    SELECT reception_id, reference, quantity FROM reception_items
  `);

  db.exec(`
    DROP TABLE reception_items;
    ALTER TABLE reception_items_new RENAME TO reception_items;
  `);

  console.log('✅ reception_items migrada\n');

  // ==================== RETURN_RECEPTION_ITEMS ====================
  console.log('📝 Migrando tabla return_reception_items...');
  
  db.exec(`
    CREATE TABLE return_reception_items_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      return_reception_id TEXT NOT NULL,
      reference TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL DEFAULT 0,
      FOREIGN KEY (return_reception_id) REFERENCES return_receptions(id)
    )
  `);

  db.exec(`
    INSERT INTO return_reception_items_new (return_reception_id, reference, quantity, unit_price)
    SELECT return_reception_id, reference, quantity, unit_price FROM return_reception_items
  `);

  db.exec(`
    DROP TABLE return_reception_items;
    ALTER TABLE return_reception_items_new RENAME TO return_reception_items;
  `);

  console.log('✅ return_reception_items migrada\n');

  // ==================== ORDER_ITEMS ====================
  console.log('📝 Migrando tabla order_items...');
  
  db.exec(`
    CREATE TABLE order_items_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      reference TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);

  db.exec(`
    INSERT INTO order_items_new (order_id, reference, quantity)
    SELECT order_id, reference, quantity FROM order_items
  `);

  db.exec(`
    DROP TABLE order_items;
    ALTER TABLE order_items_new RENAME TO order_items;
  `);

  console.log('✅ order_items migrada\n');

  console.log('✅ ¡Migración completada exitosamente!');
  console.log('📊 Todas las columnas "size" han sido removidas de las tablas de items');

} catch (error) {
  console.error('❌ Error durante la migración:', error.message);
  process.exit(1);
} finally {
  db.close();
}
