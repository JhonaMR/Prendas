/**
 * Script de prueba para verificar conexión a PostgreSQL
 * y crear la tabla clients si no existe
 */

// Cargar variables de entorno
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { initDatabase, query } = require('../config/database');
const logger = require('../controllers/shared/logger');

async function testPostgresConnection() {
  console.log('🔌 Probando conexión a PostgreSQL...\n');
  
  try {
    // 1. Inicializar conexión
    console.log('1. Inicializando base de datos...');
    await initDatabase();
    console.log('✅ Conexión a PostgreSQL inicializada\n');
    
    // 2. Verificar conexión con una consulta simple
    console.log('2. Probando consulta simple...');
    const result = await query('SELECT NOW() as current_time');
    console.log(`✅ PostgreSQL responde: ${result.rows[0].current_time}\n`);
    
    // 3. Verificar si la tabla clients existe
    console.log('3. Verificando tabla clients...');
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'clients'
      );
    `);
    
    const exists = tableExists.rows[0].exists;
    console.log(`📊 Tabla 'clients' existe: ${exists ? '✅ Sí' : '❌ No'}\n`);
    
    if (!exists) {
      console.log('4. Creando tabla clients...');
      await query(`
        CREATE TABLE IF NOT EXISTS clients (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          nit VARCHAR(50),
          address TEXT,
          city VARCHAR(100),
          seller_id VARCHAR(255),
          active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (seller_id) REFERENCES sellers(id)
        );
      `);
      console.log('✅ Tabla clients creada\n');
    }
    
    // 4. Verificar estructura de la tabla
    console.log('5. Verificando estructura de la tabla...');
    const columns = await query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'clients'
      ORDER BY ordinal_position;
    `);
    
    console.log(`📊 Columnas en tabla clients: ${columns.rows.length}`);
    columns.rows.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL'}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ PRUEBA COMPLETADA EXITOSAMENTE');
    console.log('✅ PostgreSQL está configurado correctamente');
    console.log('✅ La tabla clients está lista para migración');
    console.log('='.repeat(80));
    
    return {
      success: true,
      tableExists: exists,
      columnCount: columns.rows.length,
      columns: columns.rows
    };
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:');
    console.error(`Mensaje: ${error.message}`);
    console.error('\nPosibles causas:');
    console.error('1. PostgreSQL no está ejecutándose');
    console.error('2. Credenciales incorrectas en .env');
    console.error('3. Puerto incorrecto (configurado como 5433)');
    console.error('4. La base de datos "inventory" no existe');
    console.error('\nSolución:');
    console.error('1. Asegúrate que PostgreSQL esté ejecutándose en el puerto 5433');
    console.error('2. Verifica las credenciales en backend/.env');
    console.error('3. Crea la base de datos: createdb -U postgres -p 5433 inventory');
    console.error('='.repeat(80));
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testPostgresConnection()
    .then(result => {
      if (result.success) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { testPostgresConnection };