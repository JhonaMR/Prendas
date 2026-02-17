/**
 * Script de migración para actualizar la tabla clients
 * Permite NULL en la columna seller y asegura que sellerId sea el campo principal
 */

const { getDatabase } = require('../config/database');

console.log('🔄 Iniciando migración de tabla clients...\n');

try {
  const db = getDatabase();

  // Desactivar foreign keys temporalmente
  db.pragma('foreign_keys = OFF');

  // Verificar estructura actual
  const tableInfo = db.prepare("PRAGMA table_info(clients)").all();
  console.log('📋 Estructura actual de la tabla clients:');
  tableInfo.forEach(col => {
    console.log(`   - ${col.name}: ${col.type} ${col.notnull ? '(NOT NULL)' : '(nullable)'}`);
  });

  // Limpiar tabla temporal si existe
  try {
    db.exec('DROP TABLE IF EXISTS clients_new');
  } catch (e) {
    // Ignorar si no existe
  }

  // Crear tabla temporal con la nueva estructura
  console.log('\n🔧 Creando tabla temporal...');
  db.exec(`
    CREATE TABLE clients_new (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      nit TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      seller TEXT,
      sellerId TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sellerId) REFERENCES sellers(id)
    )
  `);

  // Copiar datos
  console.log('📦 Copiando datos...');
  db.exec(`
    INSERT INTO clients_new (id, name, nit, address, city, seller, sellerId, active, created_at)
    SELECT id, name, nit, address, city, seller, sellerId, active, created_at FROM clients
  `);

  // Eliminar tabla antigua
  console.log('🗑️  Eliminando tabla antigua...');
  db.exec('DROP TABLE clients');

  // Renombrar tabla nueva
  console.log('✏️  Renombrando tabla...');
  db.exec('ALTER TABLE clients_new RENAME TO clients');

  // Reactivar foreign keys
  db.pragma('foreign_keys = ON');

  console.log('\n✅ Migración completada exitosamente!');
  
  // Verificar nueva estructura
  const newTableInfo = db.prepare("PRAGMA table_info(clients)").all();
  console.log('\n📋 Nueva estructura de la tabla clients:');
  newTableInfo.forEach(col => {
    console.log(`   - ${col.name}: ${col.type} ${col.notnull ? '(NOT NULL)' : '(nullable)'}`);
  });

  db.close();
  process.exit(0);
} catch (error) {
  console.error('❌ Error durante la migración:', error);
  process.exit(1);
}
