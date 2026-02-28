/**
 * Script para agregar un usuario de prueba con rol DISEÑADORA
 */

require('dotenv').config();
const postgres = require('../config/postgres');
const configurationManager = require('../config/configurationManager');
const bcrypt = require('bcryptjs');

async function addTestUser() {
  try {
    console.log('🔧 Inicializando configuración...');
    await configurationManager.initializeConfiguration();
    
    console.log('🔧 Inicializando pool de conexiones...');
    await postgres.initPoolWithFallback();
    
    const db = postgres.getPool();
    
    console.log('👤 Agregando usuario de prueba...');
    
    // Hash the PIN
    const hashedPin = await bcrypt.hash('1234', 10);
    
    // Check if user already exists
    const checkResult = await db.query(
      'SELECT id FROM users WHERE login_code = $1',
      ['DIS']
    );
    
    if (checkResult.rows.length === 0) {
      const result = await db.query(
        `INSERT INTO users (login_code, pin, name, role, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING id, login_code, name, role`,
        ['DIS', hashedPin, 'Diseñadora Test', 'diseñadora']
      );
      
      const user = result.rows[0];
      console.log('✅ Usuario agregado:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Login Code: ${user.login_code}`);
      console.log(`   Nombre: ${user.name}`);
      console.log(`   Rol: ${user.role}`);
      console.log(`\n📝 Credenciales de prueba:`);
      console.log(`   Login Code: DIS`);
      console.log(`   PIN: 1234`);
    } else {
      console.log('ℹ️  Usuario ya existe');
      const user = checkResult.rows[0];
      const fullResult = await db.query(
        'SELECT id, login_code, name, role FROM users WHERE id = $1',
        [user.id]
      );
      const fullUser = fullResult.rows[0];
      console.log(`   ID: ${fullUser.id}`);
      console.log(`   Login Code: ${fullUser.login_code}`);
      console.log(`   Nombre: ${fullUser.name}`);
      console.log(`   Rol: ${fullUser.role}`);
      console.log(`\n📝 Credenciales de prueba:`);
      console.log(`   Login Code: DIS`);
      console.log(`   PIN: 1234`);
    }
    
    console.log('\n✅ Listo para probar');
    
    await postgres.closePool();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addTestUser();
