/**
 * Script para crear nuevas migraciones
 * 
 * Uso:
 * node scripts/createMigration.js "descripcion_del_cambio"
 * 
 * Ejemplo:
 * node scripts/createMigration.js "add_email_to_clients"
 */

const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

/**
 * Obtener el siguiente número de migración
 */
function getNextMigrationNumber() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
    return '001';
  }

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql') && /^\d{3}_/.test(f));

  if (files.length === 0) {
    return '001';
  }

  const numbers = files.map(f => parseInt(f.substring(0, 3)));
  const maxNumber = Math.max(...numbers);
  return String(maxNumber + 1).padStart(3, '0');
}

/**
 * Crear archivo de migración
 */
function createMigration(description) {
  if (!description) {
    console.error('❌ Error: Debes proporcionar una descripción');
    console.log('\nUso: node scripts/createMigration.js "descripcion_del_cambio"');
    console.log('Ejemplo: node scripts/createMigration.js "add_email_to_clients"');
    process.exit(1);
  }

  // Limpiar descripción
  const cleanDescription = description
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const migrationNumber = getNextMigrationNumber();
  const filename = `${migrationNumber}_${cleanDescription}.sql`;
  const filepath = path.join(MIGRATIONS_DIR, filename);

  // Obtener fecha actual
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  // Template de migración
  const template = `-- migrations/${filename}
-- Descripción: ${description}
-- Fecha: ${dateStr}
-- Autor: ${process.env.USER || process.env.USERNAME || 'Developer'}

-- ==================== UP ====================
-- Escribe aquí los cambios a aplicar

-- Ejemplo: Agregar columna
-- ALTER TABLE tabla_nombre ADD COLUMN nueva_columna VARCHAR(255);

-- Ejemplo: Crear tabla
-- CREATE TABLE nueva_tabla (
--   id SERIAL PRIMARY KEY,
--   nombre VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP DEFAULT NOW()
-- );

-- Ejemplo: Crear índice
-- CREATE INDEX idx_tabla_columna ON tabla_nombre(columna);

-- Ejemplo: Modificar datos
-- UPDATE tabla_nombre SET columna = 'valor' WHERE condicion;


-- ==================== DOWN ====================
-- Escribe aquí cómo revertir los cambios (comentado por seguridad)

-- Ejemplo: Eliminar columna
-- ALTER TABLE tabla_nombre DROP COLUMN nueva_columna;

-- Ejemplo: Eliminar tabla
-- DROP TABLE nueva_tabla;

-- Ejemplo: Eliminar índice
-- DROP INDEX idx_tabla_columna;

-- Ejemplo: Revertir datos
-- UPDATE tabla_nombre SET columna = 'valor_anterior' WHERE condicion;
`;

  // Crear archivo
  fs.writeFileSync(filepath, template, 'utf8');

  console.log('✅ Migración creada exitosamente\n');
  console.log(`📁 Archivo: ${filename}`);
  console.log(`📍 Ruta: ${filepath}\n`);
  console.log('📝 Próximos pasos:');
  console.log('   1. Edita el archivo y agrega tu SQL');
  console.log('   2. Aplica la migración: node scripts/applyMigrations.js --env=dev');
  console.log('   3. Prueba que funciona');
  console.log('   4. Commit: git add migrations/' + filename);
}

// Ejecutar
const description = process.argv[2];
createMigration(description);
