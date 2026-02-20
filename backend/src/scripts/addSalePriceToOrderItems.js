/**
 * Script para agregar columna sale_price a la tabla order_items
 * Ejecutar: node backend/src/scripts/addSalePriceToOrderItems.js
 */

// Cargar variables de entorno
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { initializeConfiguration } = require('../config/configurationManager');
const { initDatabase, query } = require('../config/database');
const logger = require('../controllers/shared/logger');

async function addSalePriceColumn() {
  try {
    logger.info('🔄 Iniciando migración: agregar columna sale_price a order_items...');

    // Inicializar configuración
    await initializeConfiguration();

    // Inicializar base de datos
    await initDatabase();

    // Verificar si la columna ya existe
    const checkColumn = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'order_items' AND column_name = 'sale_price'
    `);

    if (checkColumn.rows.length > 0) {
      logger.info('✅ La columna sale_price ya existe en order_items');
      return;
    }

    // Agregar la columna
    await query(`
      ALTER TABLE order_items 
      ADD COLUMN sale_price NUMERIC(10, 2) NOT NULL DEFAULT 0
    `);

    logger.info('✅ Columna sale_price agregada exitosamente a order_items');

  } catch (error) {
    logger.error('❌ Error al agregar columna sale_price:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addSalePriceColumn()
    .then(() => {
      logger.info('✅ Migración completada');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Migración fallida:', error);
      process.exit(1);
    });
}

module.exports = { addSalePriceColumn };
