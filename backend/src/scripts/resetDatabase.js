/**
 * 🔧 SCRIPT PARA RESETEAR LA BASE DE DATOS
 * 
 * Elimina la base de datos antigua y crea una nueva
 * Uso: node src/scripts/resetDatabase.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../database/inventory.db');

console.log('\n' + '='.repeat(60));
console.log('🔧 RESET DE BASE DE DATOS');
console.log('='.repeat(60) + '\n');

try {
    // Eliminar archivo de BD si existe
    if (fs.existsSync(DB_PATH)) {
        fs.unlinkSync(DB_PATH);
        console.log('✅ Base de datos antigua eliminada');
    } else {
        console.log('ℹ️  No había base de datos anterior');
    }

    // Ahora inicializar la nueva
    const { initDatabase } = require('../config/database');
    const dbPath = initDatabase();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ RESET COMPLETADO EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log('\n📊 Nueva base de datos creada');
    console.log('📍 Ubicación:', dbPath);
    console.log('\n👥 Usuarios creados:');
    console.log('   - Admin: ADM / 0000');
    console.log('   - General: JAM / 1234');
    console.log('\n🚀 Ahora puedes iniciar el servidor con: npm start\n');

} catch (error) {
    console.error('\n❌ ERROR AL RESETEAR BASE DE DATOS');
    console.error(error);
    process.exit(1);
}
