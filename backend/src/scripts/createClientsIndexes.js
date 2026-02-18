/**
 * Script para crear índices en la tabla clients
 * 
 * Este script crea los siguientes índices:
 * 1. Índice en `seller_id` para búsquedas por vendedor
 * 2. Índice en `active` para filtrar clientes activos
 * 3. Índice en `name` para búsquedas por nombre
 * 4. Índice en `nit` para búsquedas por NIT
 * 
 * Requisito: 4.1 - Garantizar rendimiento y escalabilidad
 */

// Cargar variables de entorno
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { initDatabase, query } = require('../config/database');
const logger = require('../controllers/shared/logger');

// Definición de índices a crear
const INDEXES_TO_CREATE = [
  {
    name: 'idx_clients_seller_id',
    columns: ['seller_id'],
    description: 'Índice para búsquedas por vendedor'
  },
  {
    name: 'idx_clients_active',
    columns: ['active'],
    description: 'Índice para filtrar clientes activos'
  },
  {
    name: 'idx_clients_name',
    columns: ['name'],
    description: 'Índice para búsquedas por nombre'
  },
  {
    name: 'idx_clients_nit',
    columns: ['nit'],
    description: 'Índice para búsquedas por NIT'
  }
];

/**
 * Verifica si un índice ya existe
 */
async function indexExists(indexName) {
  try {
    const normalizedIndexName = indexName.toLowerCase();
    const result = await query(`
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'clients' 
        AND indexname = $1
    `, [normalizedIndexName]);
    
    return result.rows.length > 0;
  } catch (error) {
    logger.error(`Error verificando existencia del índice ${indexName}:`, error);
    throw error;
  }
}

/**
 * Crea un índice si no existe
 */
async function createIndex(indexName, columns, description = '') {
  try {
    const normalizedIndexName = indexName.toLowerCase();
    
    // Verificar si el índice ya existe
    const exists = await indexExists(normalizedIndexName);
    
    if (exists) {
      logger.info(`ℹ️  Índice ${normalizedIndexName} ya existe (${description})`);
      return { created: false, indexName: normalizedIndexName };
    }
    
    // Crear el índice
    const columnsStr = columns.join(', ');
    await query(`CREATE INDEX ${normalizedIndexName} ON clients (${columnsStr})`);
    
    logger.info(`✅ Índice ${normalizedIndexName} creado en columnas: ${columnsStr} (${description})`);
    return { created: true, indexName: normalizedIndexName };
  } catch (error) {
    logger.error(`Error creando índice ${indexName}:`, error);
    throw error;
  }
}

/**
 * Verifica si la tabla clients existe
 */
async function tableExists() {
  try {
    const result = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'clients'
      );
    `);
    return result.rows[0].exists;
  } catch (error) {
    logger.error('Error verificando existencia de tabla clients:', error);
    throw error;
  }
}

/**
 * Obtiene los índices actuales de la tabla clients
 */
async function getCurrentIndexes() {
  try {
    const result = await query(`
      SELECT 
        indexname, 
        indexdef 
      FROM pg_indexes 
      WHERE tablename = 'clients' 
        AND schemaname = 'public'
      ORDER BY indexname;
    `);
    return result.rows;
  } catch (error) {
    logger.error('Error obteniendo índices:', error);
    throw error;
  }
}

/**
 * Función principal para crear índices
 */
async function createClientsIndexes() {
  console.log('🔧 Iniciando creación de índices para tabla clients...\n');
  
  try {
    // 1. Inicializar base de datos
    console.log('1. Inicializando conexión a PostgreSQL...');
    await initDatabase();
    console.log('✅ Conexión establecida\n');
    
    // 2. Verificar si la tabla existe
    console.log('2. Verificando existencia de tabla clients...');
    const tableExistsResult = await tableExists();
    
    if (!tableExistsResult) {
      console.error('❌ ERROR: La tabla clients no existe');
      console.error('   Ejecute primero el script fixClientsSchema.js para crear la tabla');
      return { success: false, error: 'Tabla clients no existe' };
    }
    console.log('✅ Tabla clients existe\n');
    
    // 3. Obtener índices actuales
    console.log('3. Obteniendo índices actuales...');
    const currentIndexes = await getCurrentIndexes();
    console.log(`📊 Índices actuales: ${currentIndexes.length}\n`);
    
    // 4. Crear índices faltantes
    console.log('4. Creando índices faltantes...\n');
    const results = [];
    
    for (const indexDef of INDEXES_TO_CREATE) {
      console.log(`   • ${indexDef.name}: ${indexDef.description}`);
      const result = await createIndex(
        indexDef.name,
        indexDef.columns,
        indexDef.description
      );
      results.push(result);
    }
    
    // 5. Resumen
    console.log('\n' + '='.repeat(80));
    console.log('📋 RESUMEN DE CREACIÓN DE ÍNDICES');
    console.log('='.repeat(80));
    
    const createdCount = results.filter(r => r.created).length;
    const existingCount = results.filter(r => !r.created).length;
    
    console.log(`✅ Índices creados: ${createdCount}`);
    console.log(`ℹ️  Índices ya existentes: ${existingCount}`);
    console.log(`📊 Total de índices: ${INDEXES_TO_CREATE.length}`);
    
    // Mostrar detalles
    console.log('\n📝 DETALLES:');
    for (const result of results) {
      const indexDef = INDEXES_TO_CREATE.find(idx => idx.name.toLowerCase() === result.indexName);
      const status = result.created ? '✅ CREADO' : 'ℹ️  YA EXISTÍA';
      console.log(`   ${status} ${result.indexName} (${indexDef?.description || 'sin descripción'})`);
    }
    
    // 6. Verificar índices finales
    console.log('\n🔍 VERIFICANDO ÍNDICES FINALES...');
    const finalIndexes = await getCurrentIndexes();
    console.log(`📊 Total de índices en tabla clients: ${finalIndexes.length}`);
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ CREACIÓN DE ÍNDICES COMPLETADA EXITOSAMENTE');
    console.log('='.repeat(80));
    
    return {
      success: true,
      created: createdCount,
      existing: existingCount,
      total: INDEXES_TO_CREATE.length,
      results: results
    };
    
  } catch (error) {
    console.error('\n❌ ERROR CREANDO ÍNDICES:');
    console.error(`Mensaje: ${error.message}`);
    console.error('\nPosibles causas:');
    console.error('1. PostgreSQL no está ejecutándose');
    console.error('2. Credenciales incorrectas en .env');
    console.error('3. La tabla clients no existe');
    console.error('4. Permisos insuficientes para crear índices');
    console.log('='.repeat(80));
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createClientsIndexes()
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

module.exports = {
  createClientsIndexes,
  INDEXES_TO_CREATE
};