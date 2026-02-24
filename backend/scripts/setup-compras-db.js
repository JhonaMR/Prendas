/**
 * Script para crear la tabla de Compras en PostgreSQL
 * Ejecutar: node scripts/setup-compras-db.js
 */

const { initializeConfiguration } = require('../src/config/configurationManager');
const { initPool, query, closePool } = require('../src/config/postgres');
const logger = require('../src/controllers/shared/logger');

async function setupComprasTable() {
  try {
    logger.info('🔄 Inicializando configuración...');
    await initializeConfiguration();
    logger.info('✅ Configuración inicializada');

    logger.info('🔄 Inicializando conexión a BD...');
    await initPool();
    logger.info('✅ Conexión establecida');

    logger.info('🔄 Creando tabla de Compras...');

    // Crear tabla
    await query(`
      CREATE TABLE IF NOT EXISTS compras (
        id VARCHAR(50) PRIMARY KEY,
        fecha DATE NOT NULL,
        referencia VARCHAR(255),
        unidades INTEGER,
        insumo VARCHAR(255) NOT NULL,
        cantidad_insumo DECIMAL(10, 2) NOT NULL,
        precio_unidad DECIMAL(10, 2) NOT NULL,
        cantidad_total DECIMAL(10, 2) NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        proveedor VARCHAR(255) NOT NULL,
        fecha_pedido DATE,
        observacion TEXT,
        factura VARCHAR(255),
        precio_real_insumo_und VARCHAR(50) DEFAULT 'pendiente',
        afecta_inventario BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    logger.info('✅ Tabla compras creada exitosamente');

    // Crear índices
    await query(`CREATE INDEX IF NOT EXISTS idx_compras_fecha ON compras(fecha)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_compras_proveedor ON compras(proveedor)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_compras_insumo ON compras(insumo)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_compras_afecta_inventario ON compras(afecta_inventario)`);

    logger.info('✅ Índices creados exitosamente');
    logger.info('✅ Setup de Compras completado');

    await closePool();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error en setup de Compras:', error);
    await closePool();
    process.exit(1);
  }
}

setupComprasTable();
