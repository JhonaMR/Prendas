/**
 * Script para verificar e implementar usuario diseñadora
 * Ejecutar: node backend/src/scripts/setupDesignerUser.js
 * 
 * Este script:
 * 1. Verifica si el usuario diseñadora ya existe
 * 2. Si no existe, lo crea con el rol 'diseñadora'
 * 3. Muestra información del usuario
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { initializeConfiguration } = require('../config/configurationManager');
const { initDatabase, query } = require('../config/database');
const logger = require('../controllers/shared/logger');
const bcrypt = require('bcrypt');

async function setupDesignerUser() {
  try {
    logger.info('🔄 Verificando usuario diseñadora...');

    // Inicializar configuración
    await initializeConfiguration();

    // Inicializar base de datos
    await initDatabase();

    // Verificar si el usuario ya existe
    const checkUser = await query(`
      SELECT id, name, login_code, role, active
      FROM users 
      WHERE UPPER(login_code) = 'DISEÑADORA'
    `);

    if (checkUser.rows.length > 0) {
      const user = checkUser.rows[0];
      logger.info('✅ El usuario diseñadora ya existe');
      logger.info(`   ID: ${user.id}`);
      logger.info(`   Nombre: ${user.name}`);
      logger.info(`   Login Code: ${user.login_code}`);
      logger.info(`   Rol: ${user.role}`);
      logger.info(`   Activo: ${user.active}`);
      
      // Verificar si el rol es correcto
      if (user.role.toLowerCase() !== 'diseñadora') {
        logger.warn('⚠️  El usuario existe pero el rol no es "diseñadora"');
        logger.info(`   Rol actual: ${user.role}`);
        logger.info('   Considera actualizar el rol manualmente desde Maestros');
      }
      
      return;
    }

    // Crear usuario diseñadora
    logger.info('📝 Creando usuario diseñadora...');
    
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    const loginCode = 'DISEÑADORA';
    const name = 'Diseñadora';
    const pin = '1234'; // PIN por defecto
    const pinHash = await bcrypt.hash(pin, 10);
    const role = 'diseñadora'; // Rol específico para diseñadora

    await query(`
      INSERT INTO users (id, name, login_code, pin_hash, role, active)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [id, name, loginCode, pinHash, role, 1]);

    logger.info('✅ Usuario diseñadora creado exitosamente');
    logger.info(`   ID: ${id}`);
    logger.info(`   Nombre: ${name}`);
    logger.info(`   Login Code: ${loginCode}`);
    logger.info(`   PIN: ${pin}`);
    logger.info(`   Rol: ${role}`);
    logger.info('');
    logger.info('📋 Permisos del usuario diseñadora:');
    logger.info('   ✅ Inventario');
    logger.info('   ✅ Pedidos');
    logger.info('   ✅ Fechas de Entrega');
    logger.info('   ❌ Recepción de Lotes');
    logger.info('   ❌ Devolución de Mercancía');
    logger.info('   ❌ Despachos');
    logger.info('   ❌ Asentar Ventas');
    logger.info('   ❌ Informe de Ventas');
    logger.info('   ❌ Historial de Pedidos');
    logger.info('   ❌ Maestros');
    logger.info('   ❌ Backups');

  } catch (error) {
    logger.error('❌ Error al configurar usuario diseñadora:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupDesignerUser()
    .then(() => {
      logger.info('✅ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Proceso fallido:', error);
      process.exit(1);
    });
}

module.exports = { setupDesignerUser };
