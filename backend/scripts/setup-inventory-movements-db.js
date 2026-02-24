/**
 * Script para crear la tabla de inventory_movements en PostgreSQL
 * Ejecutar: node scripts/setup-inventory-movements-db.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { initializeConfiguration } = require('../src/config/configurationManager');
const { initDatabase, query, closePool } = require('../src/config/database');

async function setupInventoryMovementsTable() {
  try {
    console.log('⚙️ Inicializando configuración...');
    await initializeConfiguration();

    console.log('🔌 Inicializando conexión a la base de datos...');
    await initDatabase();

    console.log('📋 Leyendo script SQL...');
    const sqlPath = path.join(__dirname, 'create-inventory-movements-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🔄 Ejecutando script SQL...');
    await query(sql);

    console.log('✅ Tabla inventory_movements creada exitosamente');
    await closePool();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando tabla:', error.message);
    await closePool();
    process.exit(1);
  }
}

setupInventoryMovementsTable();
