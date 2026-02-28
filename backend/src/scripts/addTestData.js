/**
 * Script para agregar datos de prueba
 */

require('dotenv').config();
const postgres = require('../config/postgres');
const configurationManager = require('../config/configurationManager');

async function addTestData() {
  try {
    console.log('🔧 Inicializando configuración...');
    await configurationManager.initializeConfiguration();
    
    console.log('🔧 Inicializando pool de conexiones...');
    await postgres.initPoolWithFallback();
    
    const db = postgres.getPool();
    
    console.log('📋 Agregando diseñadoras de prueba...');
    
    // Add designers
    const designers = [
      { nombre: 'María García', cedula: '1234567890', telefono: '3001234567' },
      { nombre: 'Ana Rodríguez', cedula: '0987654321', telefono: '3009876543' },
      { nombre: 'Carmen López', cedula: '1122334455', telefono: '3005555555' }
    ];
    
    const designerIds = [];
    for (const designer of designers) {
      // Check if designer already exists
      const checkResult = await db.query(
        'SELECT id FROM disenadoras WHERE nombre = $1',
        [designer.nombre]
      );
      
      if (checkResult.rows.length === 0) {
        const result = await db.query(
          `INSERT INTO disenadoras (nombre, cedula, telefono, activa) 
           VALUES ($1, $2, $3, true)
           RETURNING id`,
          [designer.nombre, designer.cedula, designer.telefono]
        );
        designerIds.push(result.rows[0].id);
        console.log(`✅ Diseñadora agregada: ${designer.nombre}`);
      } else {
        designerIds.push(checkResult.rows[0].id);
        console.log(`ℹ️  Diseñadora ya existe: ${designer.nombre}`);
      }
    }
    
    // Get all designer IDs
    const allDesignersResult = await db.query('SELECT id, nombre FROM disenadoras ORDER BY nombre');
    console.log(`✅ Total de diseñadoras en BD: ${allDesignersResult.rows.length}`);
    
    // Add test fichas
    if (allDesignersResult.rows.length > 0) {
      console.log('📋 Agregando fichas de diseño de prueba...');
      
      const fichas = [
        { referencia: 'REF001', descripcion: 'Blusa de algodón', marca: 'Premium', costo: 50000 },
        { referencia: 'REF002', descripcion: 'Pantalón de denim', marca: 'Classic', costo: 75000 },
        { referencia: 'REF003', descripcion: 'Vestido casual', marca: 'Casual', costo: 85000 }
      ];
      
      for (let i = 0; i < fichas.length; i++) {
        const ficha = fichas[i];
        const designer = allDesignersResult.rows[i % allDesignersResult.rows.length];
        
        // Check if ficha already exists
        const checkResult = await db.query(
          'SELECT id FROM fichas_diseno WHERE referencia = $1',
          [ficha.referencia]
        );
        
        if (checkResult.rows.length === 0) {
          const result = await db.query(
            `INSERT INTO fichas_diseno (referencia, disenadora_id, descripcion, marca, costo_total, created_by, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
             RETURNING id`,
            [ficha.referencia, designer.id, ficha.descripcion, ficha.marca, ficha.costo, '00000000-0000-0000-0000-000000000001']
          );
          
          console.log(`✅ Ficha agregada: ${ficha.referencia} (Diseñadora: ${designer.nombre})`);
        } else {
          console.log(`ℹ️  Ficha ya existe: ${ficha.referencia}`);
        }
      }
    }
    
    console.log('\n✅ Datos de prueba agregados exitosamente');
    
    await postgres.closePool();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addTestData();
