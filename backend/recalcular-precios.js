/**
 * ⚡ recalcular-precios.js
 * 
 * Script para corregir los precios de venta en los despachos antiguos que quedaron con valor 0.
 * Cruza los ítems de despacho con los pedidos reales del mismo cliente en la misma correría.
 */

process.env.TZ = 'America/Bogota';

const path = require('path');
const fs = require('fs');

// Determinar cuál archivo .env cargar
let envFile = '.env';
if (process.env.ENV_FILE) {
  envFile = process.env.ENV_FILE;
} else if (process.env.NODE_ENV === 'development' && fs.existsSync(path.join(__dirname, '.env.dev'))) {
  envFile = '.env.dev';
} else if (fs.existsSync(path.join(__dirname, '.env.prendas')) && fs.existsSync(path.join(__dirname, '.env.melas'))) {
  // Por defecto usar .env.prendas (Plow)
  envFile = '.env.prendas';
} else if (fs.existsSync(path.join(__dirname, '.env.prendas'))) {
  envFile = '.env.prendas';
} else if (fs.existsSync(path.join(__dirname, '.env.melas'))) {
  envFile = '.env.melas';
}

console.log(`📄 Archivo de configuración seleccionado: ${envFile}`);
require('dotenv').config({ path: path.join(__dirname, envFile) });

const { initializeConfiguration } = require('./src/config/configurationManager');
const { initDatabase, query, closePool } = require('./src/config/database');

async function run() {
  try {
    console.log('🔧 Inicializando variables de entorno y configuración...');
    await initializeConfiguration();

    console.log('🔄 Conectando a la base de datos PostgreSQL...');
    await initDatabase();
    
    const sqlPedidos = `
      UPDATE dispatch_items di
      SET sale_price = oi.sale_price
      FROM dispatches d
      JOIN orders o ON o.client_id = d.client_id AND o.correria_id = d.correria_id
      JOIN order_items oi ON oi.order_id = o.id
      WHERE di.dispatch_id = d.id
        AND di.reference = oi.reference
        AND di.sale_price = 0
        AND oi.sale_price > 0;
    `;
    const resultPedidos = await query(sqlPedidos);
    console.log(`\n✅ ¡Completado exitosamente!`);
    console.log(`📊 Se actualizaron ${resultPedidos.rowCount} registros en dispatch_items que estaban en 0.`);
  } catch (error) {
    console.error('❌ Error al actualizar los precios:', error);
  } finally {
    await closePool();
    console.log('🔌 Conexión cerrada.');
  }
}

run();
