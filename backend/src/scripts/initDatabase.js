/**
 * 🔧 SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS
 * 
 * Ejecuta este script para crear la base de datos y las tablas
 * Uso: node src/scripts/initDatabase.js
 */

require('dotenv').config();
const { initDatabase } = require('../config/database');

console.log('\n' + '='.repeat(60));
console.log('🔧 INICIALIZACIÓN DE BASE DE DATOS');
console.log('='.repeat(60) + '\n');

try {
    const dbPath = initDatabase();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ PROCESO COMPLETADO EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log('\n📊 La base de datos está lista para usar');
    console.log('📍 Ubicación:', dbPath);
    console.log('\n👥 Usuarios creados:');
    console.log('   - Admin: ADM / 0000');
    console.log('   - General: JAM / 1234');
    console.log('\n🚀 Ahora puedes iniciar el servidor con: npm start\n');

} catch (error) {
    console.error('\n❌ ERROR AL INICIALIZAR BASE DE DATOS');
    console.error(error);
    process.exit(1);
}
