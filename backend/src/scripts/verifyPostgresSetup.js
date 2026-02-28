#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

console.log('\n🔍 Verificando configuración de PostgreSQL...\n');

// 1. Verificar que psql está en el PATH
console.log('1️⃣  Verificando que psql está disponible...');
try {
  const version = execSync('psql --version', { encoding: 'utf-8' });
  console.log(`   ✅ ${version.trim()}`);
} catch (error) {
  console.log('   ❌ psql no está en el PATH');
  console.log('   💡 Ejecuta: backend\\scripts\\setup-postgres-windows.bat');
  process.exit(1);
}

// 2. Verificar archivo .env
console.log('\n2️⃣  Verificando archivo .env...');
const envPath = path.join(__dirname, '../../.env');
if (!fs.existsSync(envPath)) {
  console.log('   ❌ Archivo .env no encontrado');
  process.exit(1);
}
console.log('   ✅ Archivo .env existe');

// 3. Verificar variables de entorno
console.log('\n3️⃣  Verificando variables de entorno...');
require('dotenv').config({ path: envPath });

const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
let allVarsPresent = true;

requiredVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`   ✅ ${varName} = ${varName === 'DB_PASSWORD' ? '***' : process.env[varName]}`);
  } else {
    console.log(`   ❌ ${varName} no está definido`);
    allVarsPresent = false;
  }
});

if (!allVarsPresent) {
  console.log('\n   💡 Completa las variables en backend/.env');
  process.exit(1);
}

// 4. Verificar conexión a PostgreSQL
console.log('\n4️⃣  Verificando conexión a PostgreSQL...');
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/postgres`;

try {
  const psqlCmd = `psql -U ${process.env.DB_USER} -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -c "SELECT version();"`;
  const result = execSync(psqlCmd, { 
    encoding: 'utf-8',
    env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD }
  });
  console.log('   ✅ Conexión exitosa a PostgreSQL');
} catch (error) {
  console.log('   ❌ No se puede conectar a PostgreSQL');
  console.log('   💡 Asegúrate que PostgreSQL esté ejecutándose:');
  console.log('      net start postgresql-x64-18');
  process.exit(1);
}

// 5. Verificar que la base de datos existe
console.log('\n5️⃣  Verificando base de datos...');
try {
  const dbCheckCmd = `psql -U ${process.env.DB_USER} -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -lqt`;
  const databases = execSync(dbCheckCmd, {
    encoding: 'utf-8',
    env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD }
  });
  
  if (databases.includes(process.env.DB_NAME)) {
    console.log(`   ✅ Base de datos "${process.env.DB_NAME}" existe`);
  } else {
    console.log(`   ⚠️  Base de datos "${process.env.DB_NAME}" no existe`);
    console.log('   💡 Créala con:');
    console.log(`      createdb -U ${process.env.DB_USER} -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} ${process.env.DB_NAME}`);
  }
} catch (error) {
  console.log('   ❌ Error verificando bases de datos');
}

console.log('\n✅ Verificación completada\n');
