/**
 * Script para agregar una diseñadora de prueba
 */

require('dotenv').config();
const postgres = require('../config/postgres');
const configurationManager = require('../config/configurationManager');

async function addTestDesigner() {
  try {
    console.log('🔧 Inicializando configuración...');
    await configurationManager.initializeConfiguration();
    
    console.log('🔧 Inicializando pool de conexiones...');
    await postgres.initPoolWithFallback();
    
    const db = postgres.getPool();
    
    console.log('👩 Agregando diseñadora de prueba...');
    
    // Check if designer already exists
    const checkResult = await db.query(
      'SELECT id FROM disenadoras WHERE nombre = $1',
      ['Diseñadora Prueba']
    );
    
    if (checkResult.rows.length === 0) {
      const result = await db.query(
        `INSERT INTO disenadoras (nombre, cedula, telefono, activa) 
         VALUES ($1, $2, $3, true)
         RETURNING id, nombre, cedula, telefono, activa`,
        ['Diseñadora Prueba', '9999999999', '3009999999']
      );
      
      const designer = result.rows[0];
      console.log('✅ Diseñadora agregada:');
      console.log(`   ID: ${designer.id}`);
      console.log(`   Nombre: ${designer.nombre}`);
      console.log(`   Cédula: ${designer.cedula}`);
      console.log(`   Teléfono: ${designer.telefono}`);
      console.log(`   Activa: ${designer.activa}`);
    } else {
      console.log('ℹ️  Diseñadora ya existe');
      const designer = checkResult.rows[0];
      const fullResult = await db.query(
        'SELECT * FROM disenadoras WHERE id = $1',
        [designer.id]
      );
      const fullDesigner = fullResult.rows[0];
      console.log(`   ID: ${fullDesigner.id}`);
      console.log(`   Nombre: ${fullDesigner.nombre}`);
      console.log(`   Cédula: ${fullDesigner.cedula}`);
      console.log(`   Teléfono: ${fullDesigner.telefono}`);
      console.log(`   Activa: ${fullDesigner.activa}`);
    }
    
    console.log('\n✅ Listo para probar');
    
    await postgres.closePool();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addTestDesigner();
