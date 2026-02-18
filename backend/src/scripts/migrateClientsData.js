/**
 * Script de migración de datos de clients desde SQLite a PostgreSQL
 * 
 * Este script:
 * 1. Lee datos de la tabla `clients` desde SQLite
 * 2. Transforma tipos de datos y mapea columnas
 * 3. Maneja valores NULL apropiadamente
 * 4. Inserta datos en PostgreSQL con el esquema corregido
 * 
 * Requirements: 1.4, 3.1, 3.2, 3.3
 */

// Cargar variables de entorno
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { getDatabaseConnectionManager } = require('../config/DatabaseConnectionManager');
const { initDatabase, query, transaction } = require('../config/database');
const logger = require('../controllers/shared/logger');

// Configuración de migración
const MIGRATION_CONFIG = {
  batchSize: 100, // Tamaño del lote para inserción
  maxRetries: 3,  // Intentos máximos por lote
  retryDelay: 1000 // Retardo entre reintentos (ms)
};

/**
 * Transforma un registro de SQLite al formato de PostgreSQL
 */
function transformClientRecord(sqliteRecord) {
  // Mapeo de columnas y transformación de tipos
  // Manejo case-insensitive para sellerId
  const sellerIdValue = sqliteRecord.sellerId !== undefined ? sqliteRecord.sellerId : 
                       sqliteRecord.sellerid !== undefined ? sqliteRecord.sellerid : 
                       null;
  
  return {
    id: sqliteRecord.id,
    name: sqliteRecord.name,
    nit: sqliteRecord.nit,
    address: sqliteRecord.address,
    city: sqliteRecord.city,
    seller_id: sellerIdValue, // Mapeo: sellerId/sellerid → seller_id
    active: sqliteRecord.active === 1, // Transformación: INTEGER → BOOLEAN (1=true, 0=false)
    created_at: sqliteRecord.created_at,
    updated_at: new Date().toISOString() // Valor por defecto
  };
}

/**
 * Valida un registro transformado
 */
function validateTransformedRecord(record) {
  const errors = [];
  
  // Validaciones requeridas
  if (!record.id) {
    errors.push('id es requerido');
  }
  
  if (!record.name) {
    errors.push('name es requerido');
  }
  
  // Validar tipos
  if (typeof record.active !== 'boolean') {
    errors.push('active debe ser booleano');
  }
  
  // Validar longitud máxima (prevención de errores)
  if (record.id && record.id.length > 255) {
    errors.push('id excede longitud máxima (255)');
  }
  
  if (record.name && record.name.length > 255) {
    errors.push('name excede longitud máxima (255)');
  }
  
  if (record.nit && record.nit.length > 50) {
    errors.push('nit excede longitud máxima (50)');
  }
  
  if (record.city && record.city.length > 100) {
    errors.push('city excede longitud máxima (100)');
  }
  
  if (record.seller_id && record.seller_id.length > 255) {
    errors.push('seller_id excede longitud máxima (255)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Lee todos los registros de clients desde SQLite
 */
async function readSqliteClients() {
  logger.info('📖 Leyendo datos de clients desde SQLite...');
  
  try {
    const dbManager = getDatabaseConnectionManager();
    const db = dbManager.getConnection();
    
    // Verificar que la tabla existe
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='clients'
    `).get();
    
    if (!tableExists) {
      throw new Error('La tabla clients no existe en SQLite');
    }
    
    // Obtener conteo total
    const countResult = db.prepare('SELECT COUNT(*) as count FROM clients').get();
    const totalRecords = countResult.count;
    logger.info(`📊 Total de registros en SQLite: ${totalRecords}`);
    
    // Leer todos los registros
    const sqliteRecords = db.prepare('SELECT * FROM clients').all();
    
    logger.info(`✅ ${sqliteRecords.length} registros leídos de SQLite`);
    return sqliteRecords;
    
  } catch (error) {
    logger.error('❌ Error leyendo datos de SQLite:', error);
    throw error;
  }
}

/**
 * Inserta un lote de registros en PostgreSQL
 */
async function insertBatchToPostgres(batch, batchNumber) {
  const client = await require('../config/postgres').getPool().connect();
  
  try {
    logger.debug(`📝 Insertando lote ${batchNumber} (${batch.length} registros)...`);
    
    // Construir query de inserción masiva
    const columns = ['id', 'name', 'nit', 'address', 'city', 'seller_id', 'active', 'created_at', 'updated_at'];
    const placeholders = batch.map((_, rowIndex) => 
      `(${columns.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`).join(', ')})`
    ).join(', ');
    
    const values = batch.flatMap(record => [
      record.id,
      record.name,
      record.nit,
      record.address,
      record.city,
      record.seller_id,
      record.active,
      record.created_at,
      record.updated_at
    ]);
    
    const sql = `
      INSERT INTO clients (${columns.join(', ')})
      VALUES ${placeholders}
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        nit = EXCLUDED.nit,
        address = EXCLUDED.address,
        city = EXCLUDED.city,
        seller_id = EXCLUDED.seller_id,
        active = EXCLUDED.active,
        updated_at = EXCLUDED.updated_at
    `;
    
    await client.query(sql, values);
    
    logger.debug(`✅ Lote ${batchNumber} insertado exitosamente`);
    return batch.length;
    
  } catch (error) {
    logger.error(`❌ Error insertando lote ${batchNumber}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Valida que la migración fue exitosa
 */
async function validateMigration() {
  logger.info('🔍 Validando migración...');
  
  try {
    // Usar el nuevo MigrationValidator para validación completa
    const { MigrationValidator } = require('./validateMigration');
    const validator = new MigrationValidator();
    
    const validationResults = await validator.validateAll();
    
    if (!validationResults.passed) {
      const errorMessages = validationResults.errors.join(', ');
      throw new Error(`Validación falló: ${errorMessages}`);
    }
    
    logger.info('✅ Validación completada exitosamente');
    return {
      success: true,
      sqliteCount: validationResults.details.recordCounts?.details?.sqliteCount || 0,
      pgCount: validationResults.details.recordCounts?.details?.postgresCount || 0,
      matches: validationResults.details.recordCounts?.details?.match || false,
      validationResults: validationResults
    };
    
  } catch (error) {
    logger.error('❌ Error en validación:', error);
    throw error;
  }
}

/**
 * Prepara el esquema de PostgreSQL para la migración
 * Asegura que la tabla tenga la estructura correcta
 */
async function preparePostgresSchema() {
  logger.info('🔧 Preparando esquema de PostgreSQL...');
  
  try {
    // 1. Verificar si la tabla existe
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'clients'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      logger.info('📋 Creando tabla clients con esquema corregido...');
      await query(`
        CREATE TABLE clients (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          nit VARCHAR(50),
          address TEXT,
          city VARCHAR(100),
          seller_id VARCHAR(255),
          active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      logger.info('✅ Tabla clients creada con esquema corregido');
      return { created: true, altered: false };
    }
    
    // 2. Verificar y corregir columnas
    logger.info('📋 Verificando estructura de la tabla...');
    const currentColumns = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'clients'
      ORDER BY ordinal_position;
    `);
    
    const columnNames = currentColumns.rows.map(row => row.column_name.toLowerCase());
    let alterations = [];
    
    // Primero manejar renames/copies de columnas problemáticas
    const hasSellerId = columnNames.includes('seller_id');
    const hasSellerid = columnNames.includes('sellerid');
    const hasSeller = columnNames.includes('seller');
    
    if (hasSellerid && !hasSellerId) {
      // Caso 1: sellerid existe, seller_id no existe → renombrar
      logger.info('🔄 Renombrando columna sellerid → seller_id');
      await query(`ALTER TABLE clients RENAME COLUMN sellerid TO seller_id`);
      alterations.push('RENAME sellerid → seller_id');
      // Actualizar lista de columnas
      columnNames[columnNames.indexOf('sellerid')] = 'seller_id';
    } else if (hasSellerid && hasSellerId) {
      // Caso 2: ambas columnas existen → copiar datos y eliminar sellerid
      logger.info('📋 Copiando datos de sellerid a seller_id...');
      await query(`UPDATE clients SET seller_id = sellerid WHERE seller_id IS NULL AND sellerid IS NOT NULL`);
      logger.info('🗑️  Eliminando columna sellerid');
      await query(`ALTER TABLE clients DROP COLUMN sellerid`);
      alterations.push('COPY sellerid → seller_id, DROP sellerid');
      // Actualizar lista de columnas
      columnNames.splice(columnNames.indexOf('sellerid'), 1);
    } else if (hasSeller && !hasSellerId && !hasSellerid) {
      // Caso 3: seller existe, seller_id no existe → renombrar
      logger.info('🔄 Renombrando columna seller → seller_id');
      await query(`ALTER TABLE clients RENAME COLUMN seller TO seller_id`);
      alterations.push('RENAME seller → seller_id');
      // Actualizar lista de columnas
      columnNames[columnNames.indexOf('seller')] = 'seller_id';
    }
    
    // Verificar columnas requeridas (después de manejar renames)
    const requiredColumns = [
      { name: 'id', type: 'VARCHAR(255)', nullable: 'NO' },
      { name: 'name', type: 'VARCHAR(255)', nullable: 'NO' },
      { name: 'nit', type: 'VARCHAR(50)', nullable: 'YES' },
      { name: 'address', type: 'TEXT', nullable: 'YES' },
      { name: 'city', type: 'VARCHAR(100)', nullable: 'YES' },
      { name: 'seller_id', type: 'VARCHAR(255)', nullable: 'YES' },
      { name: 'active', type: 'BOOLEAN', nullable: 'NO' },
      { name: 'created_at', type: 'TIMESTAMP', nullable: 'YES' },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: 'YES' }
    ];
    
    for (const required of requiredColumns) {
      const exists = columnNames.includes(required.name.toLowerCase());
      
      if (!exists) {
        logger.info(`➕ Agregando columna faltante: ${required.name}`);
        await query(`ALTER TABLE clients ADD COLUMN ${required.name} ${required.type} ${required.nullable === 'NO' ? 'NOT NULL' : ''}`);
        alterations.push(`ADD ${required.name}`);
      }
    }
    
    // Convertir active de INTEGER a BOOLEAN si es necesario
    const activeColumn = currentColumns.rows.find(col => col.column_name.toLowerCase() === 'active');
    if (activeColumn && activeColumn.data_type === 'integer') {
      logger.info('🔄 Convirtiendo active de INTEGER a BOOLEAN');
      // Primero agregar columna temporal
      await query(`ALTER TABLE clients ADD COLUMN active_temp BOOLEAN`);
      // Actualizar valores: 1 → true, 0 → false, NULL → true (default)
      await query(`UPDATE clients SET active_temp = CASE WHEN active = 1 THEN true WHEN active = 0 THEN false ELSE true END`);
      // Eliminar columna original
      await query(`ALTER TABLE clients DROP COLUMN active`);
      // Renombrar temporal a original
      await query(`ALTER TABLE clients RENAME COLUMN active_temp TO active`);
      // Agregar default
      await query(`ALTER TABLE clients ALTER COLUMN active SET DEFAULT true`);
      alterations.push('CONVERT active INTEGER → BOOLEAN');
    }
    
    if (alterations.length > 0) {
      logger.info(`✅ Esquema corregido: ${alterations.length} cambios aplicados`);
      return { created: false, altered: true, alterations };
    } else {
      logger.info('✅ Esquema ya está correcto');
      return { created: false, altered: false };
    }
    
  } catch (error) {
    logger.error('❌ Error preparando esquema:', error);
    throw error;
  }
}

/**
 * Función principal de migración
 */
async function migrateClientsData() {
  const migrationReport = {
    timestamp: new Date().toISOString(),
    steps: {},
    statistics: {},
    errors: []
  };
  
  try {
    logger.info('🚀 Iniciando migración de datos de clients...\n');
    
    // Paso 0: Inicializar base de datos PostgreSQL
    migrationReport.steps.initPostgres = { start: new Date().toISOString() };
    logger.info('📊 Inicializando conexión a PostgreSQL...');
    await initDatabase();
    migrationReport.steps.initPostgres.end = new Date().toISOString();
    logger.info('✅ Conexión a PostgreSQL inicializada');
    
    // Paso 0.5: Preparar esquema de PostgreSQL
    migrationReport.steps.prepareSchema = { start: new Date().toISOString() };
    const schemaResult = await preparePostgresSchema();
    migrationReport.steps.prepareSchema.end = new Date().toISOString();
    migrationReport.steps.prepareSchema.result = schemaResult;
    
    // Paso 1: Leer datos de SQLite
    migrationReport.steps.readSqlite = { start: new Date().toISOString() };
    const sqliteRecords = await readSqliteClients();
    migrationReport.steps.readSqlite.end = new Date().toISOString();
    migrationReport.steps.readSqlite.recordCount = sqliteRecords.length;
    
    // Paso 2: Transformar datos
    migrationReport.steps.transform = { start: new Date().toISOString() };
    const transformedRecords = [];
    const validationErrors = [];
    
    for (const sqliteRecord of sqliteRecords) {
      try {
        const transformed = transformClientRecord(sqliteRecord);
        const validation = validateTransformedRecord(transformed);
        
        if (validation.isValid) {
          transformedRecords.push(transformed);
        } else {
          validationErrors.push({
            id: sqliteRecord.id,
            errors: validation.errors
          });
          logger.warn(`⚠️  Registro ${sqliteRecord.id} tiene errores: ${validation.errors.join(', ')}`);
        }
      } catch (error) {
        validationErrors.push({
          id: sqliteRecord.id,
          errors: [error.message]
        });
        logger.error(`❌ Error transformando registro ${sqliteRecord.id}:`, error);
      }
    }
    
    migrationReport.steps.transform.end = new Date().toISOString();
    migrationReport.steps.transform.transformedCount = transformedRecords.length;
    migrationReport.steps.transform.errorCount = validationErrors.length;
    migrationReport.statistics.validationErrors = validationErrors;
    
    if (validationErrors.length > 0) {
      logger.warn(`⚠️  ${validationErrors.length} registros tienen errores de validación`);
    }
    
    // Paso 3: Insertar datos en PostgreSQL (por lotes)
    migrationReport.steps.insert = { start: new Date().toISOString() };
    const batches = [];
    const batchCount = Math.ceil(transformedRecords.length / MIGRATION_CONFIG.batchSize);
    
    logger.info(`📦 Procesando ${transformedRecords.length} registros en ${batchCount} lotes...`);
    
    let totalInserted = 0;
    let batchErrors = [];
    
    for (let i = 0; i < batchCount; i++) {
      const start = i * MIGRATION_CONFIG.batchSize;
      const end = start + MIGRATION_CONFIG.batchSize;
      const batch = transformedRecords.slice(start, end);
      const batchNumber = i + 1;
      
      let retryCount = 0;
      let batchSuccess = false;
      
      while (retryCount < MIGRATION_CONFIG.maxRetries && !batchSuccess) {
        try {
          if (retryCount > 0) {
            logger.warn(`🔄 Reintentando lote ${batchNumber} (intento ${retryCount + 1})...`);
            await new Promise(resolve => setTimeout(resolve, MIGRATION_CONFIG.retryDelay));
          }
          
          const inserted = await insertBatchToPostgres(batch, batchNumber);
          totalInserted += inserted;
          batchSuccess = true;
          batches.push({ batchNumber, success: true, recordCount: batch.length });
          
        } catch (error) {
          retryCount++;
          if (retryCount === MIGRATION_CONFIG.maxRetries) {
            logger.error(`❌ Lote ${batchNumber} falló después de ${MIGRATION_CONFIG.maxRetries} intentos:`, error);
            batchErrors.push({
              batchNumber,
              error: error.message,
              recordCount: batch.length
            });
            batches.push({ batchNumber, success: false, error: error.message });
          }
        }
      }
    }
    
    migrationReport.steps.insert.end = new Date().toISOString();
    migrationReport.steps.insert.batchCount = batches.length;
    migrationReport.steps.insert.successfulBatches = batches.filter(b => b.success).length;
    migrationReport.steps.insert.failedBatches = batches.filter(b => !b.success).length;
    migrationReport.steps.insert.totalInserted = totalInserted;
    migrationReport.statistics.batchErrors = batchErrors;
    
    if (batchErrors.length > 0) {
      logger.error(`❌ ${batchErrors.length} lotes fallaron durante la inserción`);
    }
    
    // Paso 4: Validar migración
    migrationReport.steps.validate = { start: new Date().toISOString() };
    const validationResult = await validateMigration();
    migrationReport.steps.validate.end = new Date().toISOString();
    migrationReport.steps.validate.result = validationResult;
    
    // Generar reporte
    console.log('\n' + '='.repeat(80));
    console.log('📋 REPORTE DE MIGRACIÓN - TABLA CLIENTS');
    console.log('='.repeat(80));
    console.log(`📅 Fecha: ${migrationReport.timestamp}`);
    console.log(`🚀 Estado: ${batchErrors.length === 0 ? '✅ COMPLETADO' : '⚠️  CON ERRORES'}`);
    
    console.log('\n' + '-'.repeat(80));
    console.log('📊 ESTADÍSTICAS:');
    console.log(`• Registros en SQLite: ${sqliteRecords.length}`);
    console.log(`• Registros transformados: ${transformedRecords.length}`);
    console.log(`• Errores de validación: ${validationErrors.length}`);
    console.log(`• Lotes procesados: ${batches.length}`);
    console.log(`• Lotes exitosos: ${batches.filter(b => b.success).length}`);
    console.log(`• Lotes fallidos: ${batches.filter(b => !b.success).length}`);
    console.log(`• Registros insertados: ${totalInserted}`);
    
    if (validationResult.matches) {
      console.log(`• Validación: ✅ Los conteos coinciden (${validationResult.sqliteCount} registros)`);
    } else {
      console.log(`• Validación: ❌ Los conteos NO coinciden`);
    }
    
    if (validationErrors.length > 0) {
      console.log('\n' + '⚠️  ERRORES DE VALIDACIÓN:');
      validationErrors.slice(0, 5).forEach(error => {
        console.log(`  • ${error.id}: ${error.errors.join(', ')}`);
      });
      if (validationErrors.length > 5) {
        console.log(`  ... y ${validationErrors.length - 5} más`);
      }
    }
    
    if (batchErrors.length > 0) {
      console.log('\n' + '❌ ERRORES EN LOTES:');
      batchErrors.forEach(error => {
        console.log(`  • Lote ${error.batchNumber}: ${error.error}`);
      });
    }
    
    console.log('\n' + '-'.repeat(80));
    console.log('⏱️  TIEMPOS DE EJECUCIÓN:');
    const steps = migrationReport.steps;
    const stepOrder = ['initPostgres', 'prepareSchema', 'readSqlite', 'transform', 'insert', 'validate'];
    for (const stepName of stepOrder) {
      const stepData = steps[stepName];
      if (stepData && stepData.start && stepData.end) {
        const start = new Date(stepData.start);
        const end = new Date(stepData.end);
        const duration = (end - start) / 1000;
        const stepDisplayName = {
          initPostgres: 'Inicializar PostgreSQL',
          prepareSchema: 'Preparar esquema',
          readSqlite: 'Leer SQLite',
          transform: 'Transformar datos',
          insert: 'Insertar en PostgreSQL',
          validate: 'Validar migración'
        }[stepName] || stepName;
        console.log(`• ${stepDisplayName}: ${duration.toFixed(2)}s`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    
    if (batchErrors.length > 0) {
      console.log('❌ La migración completó con errores. Revise el reporte anterior.');
      process.exit(1);
    } else {
      console.log('✅ Migración completada exitosamente!');
      console.log('✅ Los datos de clients han sido migrados de SQLite a PostgreSQL.');
      console.log('✅ Puede proceder con las siguientes tareas del plan de implementación.');
    }
    
    return migrationReport;
    
  } catch (error) {
    logger.error('❌ Error fatal durante la migración:', error);
    console.error('\n❌ MIGRACIÓN FALLIDA:', error.message);
    console.error('❌ Revise los logs para más detalles.');
    process.exit(1);
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  migrateClientsData()
    .then(report => {
      if (report.statistics.batchErrors && report.statistics.batchErrors.length > 0) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = {
  migrateClientsData,
  transformClientRecord,
  validateTransformedRecord,
  readSqliteClients,
  insertBatchToPostgres,
  validateMigration
};