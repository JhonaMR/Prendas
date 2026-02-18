/**
 * Script de verificación del esquema de la tabla clients
 * Verifica que el esquema corregido sea compatible con clientsService.js
 */

const { query } = require('../config/database');
const logger = require('../controllers/shared/logger');

// Esquema esperado por clientsService.js
const EXPECTED_SCHEMA = {
  columns: [
    { name: 'id', type: 'character varying', required: true },
    { name: 'name', type: 'character varying', required: true },
    { name: 'nit', type: 'character varying', required: false },
    { name: 'address', type: 'text', required: false },
    { name: 'city', type: 'character varying', required: false },
    { name: 'seller_id', type: 'character varying', required: false },
    { name: 'active', type: 'boolean', required: true, defaultValue: true }
  ],
  requiredForClientsService: ['id', 'name', 'seller_id', 'active']
};

/**
 * Verifica que la tabla clients exista
 */
async function verifyTableExists() {
  try {
    const result = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'clients'
      );
    `);
    
    const exists = result.rows[0].exists;
    if (!exists) {
      throw new Error('La tabla clients no existe en la base de datos');
    }
    
    logger.info('✅ Tabla clients existe');
    return true;
  } catch (error) {
    logger.error('❌ Error verificando existencia de tabla:', error);
    throw error;
  }
}

/**
 * Verifica que todas las columnas requeridas existan
 */
async function verifyRequiredColumns() {
  try {
    const result = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'clients'
      ORDER BY ordinal_position;
    `);
    
    const currentColumns = result.rows.map(row => row.column_name);
    const missingColumns = [];
    const columnDetails = {};
    
    // Verificar cada columna esperada
    for (const expectedColumn of EXPECTED_SCHEMA.columns) {
      const columnExists = currentColumns.includes(expectedColumn.name);
      
      if (!columnExists) {
        missingColumns.push(expectedColumn.name);
      } else {
        const columnInfo = result.rows.find(row => row.column_name === expectedColumn.name);
        columnDetails[expectedColumn.name] = {
          type: columnInfo.data_type,
          nullable: columnInfo.is_nullable === 'YES',
          defaultValue: columnInfo.column_default
        };
      }
    }
    
    if (missingColumns.length > 0) {
      throw new Error(`Columnas faltantes: ${missingColumns.join(', ')}`);
    }
    
    logger.info(`✅ Todas las columnas requeridas existen (${currentColumns.length} columnas)`);
    return { success: true, columnDetails, totalColumns: currentColumns.length };
  } catch (error) {
    logger.error('❌ Error verificando columnas:', error);
    throw error;
  }
}

/**
 * Verifica que las columnas requeridas por clientsService.js sean accesibles
 */
async function verifyClientsServiceCompatibility() {
  try {
    // Probar una consulta similar a la que hace clientsService.js
    const testQuery = `
      SELECT id, name, nit, address, city, seller_id, active
      FROM clients
      LIMIT 1
    `;
    
    const result = await query(testQuery);
    
    // Verificar que la consulta no arroje error
    logger.info('✅ Consulta de clientsService.js ejecutada exitosamente');
    
    // Verificar que las columnas estén en el resultado
    if (result.rows.length > 0) {
      const row = result.rows[0];
      const expectedColumns = EXPECTED_SCHEMA.columns.map(col => col.name);
      const actualColumns = Object.keys(row);
      
      const missingInResult = expectedColumns.filter(col => !actualColumns.includes(col));
      
      if (missingInResult.length > 0) {
        throw new Error(`Columnas faltantes en resultado: ${missingInResult.join(', ')}`);
      }
      
      logger.info(`✅ Todas las columnas presentes en resultado (${actualColumns.length} columnas)`);
    }
    
    return { success: true, sampleRow: result.rows[0] || null };
  } catch (error) {
    logger.error('❌ Error verificando compatibilidad con clientsService.js:', error);
    throw error;
  }
}

/**
 * Verifica índices importantes
 */
async function verifyIndexes() {
  try {
    const result = await query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'clients' 
        AND schemaname = 'public'
      ORDER BY indexname;
    `);
    
    const indexes = result.rows;
    const importantIndexes = ['seller_id', 'active'];
    const foundIndexes = [];
    
    for (const index of indexes) {
      for (const important of importantIndexes) {
        if (index.indexdef.toLowerCase().includes(important.toLowerCase())) {
          foundIndexes.push(important);
        }
      }
    }
    
    const missingIndexes = importantIndexes.filter(idx => !foundIndexes.includes(idx));
    
    if (missingIndexes.length > 0) {
      logger.warn(`⚠️  Índices recomendados faltantes: ${missingIndexes.join(', ')}`);
    } else {
      logger.info(`✅ Índices importantes encontrados (${foundIndexes.length} de ${importantIndexes.length})`);
    }
    
    return { 
      success: missingIndexes.length === 0, 
      indexes: indexes.map(idx => idx.indexname),
      missingIndexes 
    };
  } catch (error) {
    logger.error('❌ Error verificando índices:', error);
    throw error;
  }
}

/**
 * Verifica foreign keys
 */
async function verifyForeignKeys() {
  try {
    const result = await query(`
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'clients'
        AND tc.table_schema = 'public';
    `);
    
    const foreignKeys = result.rows;
    const sellerForeignKey = foreignKeys.find(fk => 
      fk.column_name === 'seller_id' && fk.foreign_table_name === 'sellers'
    );
    
    if (!sellerForeignKey) {
      logger.warn('⚠️  No se encontró foreign key para seller_id → sellers(id)');
    } else {
      logger.info('✅ Foreign key seller_id → sellers(id) encontrada');
    }
    
    return { 
      success: sellerForeignKey !== undefined, 
      foreignKeys: foreignKeys.map(fk => fk.constraint_name),
      hasSellerForeignKey: !!sellerForeignKey 
    };
  } catch (error) {
    logger.error('❌ Error verificando foreign keys:', error);
    throw error;
  }
}

/**
 * Prueba operaciones CRUD básicas
 */
async function testCRUDOperations() {
  try {
    const testId = `test_${Date.now()}`;
    const testData = {
      id: testId,
      name: 'Cliente de Prueba',
      nit: '123456789',
      address: 'Dirección de prueba',
      city: 'Ciudad de prueba',
      seller_id: null, // NULL para prueba
      active: true
    };
    
    logger.info('🧪 Probando operaciones CRUD...');
    
    // 1. CREATE
    await query(`
      INSERT INTO clients (id, name, nit, address, city, seller_id, active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [testData.id, testData.name, testData.nit, testData.address, 
        testData.city, testData.seller_id, testData.active]);
    
    logger.info('✅ CREATE: Cliente insertado exitosamente');
    
    // 2. READ
    const readResult = await query(`
      SELECT id, name, nit, address, city, seller_id, active
      FROM clients
      WHERE id = $1
    `, [testId]);
    
    if (readResult.rows.length === 0) {
      throw new Error('No se pudo leer el cliente recién creado');
    }
    
    logger.info('✅ READ: Cliente leído exitosamente');
    
    // 3. UPDATE
    await query(`
      UPDATE clients 
      SET name = $1, active = $2
      WHERE id = $3
    `, ['Cliente Actualizado', false, testId]);
    
    logger.info('✅ UPDATE: Cliente actualizado exitosamente');
    
    // 4. DELETE
    await query('DELETE FROM clients WHERE id = $1', [testId]);
    
    logger.info('✅ DELETE: Cliente eliminado exitosamente');
    
    // Verificar que fue eliminado
    const verifyDelete = await query('SELECT id FROM clients WHERE id = $1', [testId]);
    if (verifyDelete.rows.length > 0) {
      throw new Error('El cliente no fue eliminado correctamente');
    }
    
    logger.info('✅ Verificación: Cliente eliminado correctamente');
    
    return { success: true, message: 'Todas las operaciones CRUD funcionan correctamente' };
  } catch (error) {
    logger.error('❌ Error en pruebas CRUD:', error);
    
    // Intentar limpiar en caso de error
    try {
      await query('DELETE FROM clients WHERE id LIKE $1', ['test_%']);
    } catch (cleanupError) {
      logger.warn('No se pudo limpiar datos de prueba:', cleanupError);
    }
    
    throw error;
  }
}

/**
 * Función principal de verificación
 */
async function verifyClientsSchema() {
  const verificationReport = {
    timestamp: new Date().toISOString(),
    checks: {},
    overallStatus: 'PASS',
    issues: []
  };
  
  try {
    logger.info('🔍 Iniciando verificación del esquema de clients...\n');
    
    // 1. Verificar que la tabla exista
    verificationReport.checks.tableExists = await verifyTableExists();
    
    // 2. Verificar columnas requeridas
    const columnsResult = await verifyRequiredColumns();
    verificationReport.checks.requiredColumns = columnsResult;
    
    // 3. Verificar compatibilidad con clientsService.js
    const compatibilityResult = await verifyClientsServiceCompatibility();
    verificationReport.checks.clientsServiceCompatibility = compatibilityResult;
    
    // 4. Verificar índices
    const indexesResult = await verifyIndexes();
    verificationReport.checks.indexes = indexesResult;
    
    // 5. Verificar foreign keys
    const foreignKeysResult = await verifyForeignKeys();
    verificationReport.checks.foreignKeys = foreignKeysResult;
    
    // 6. Probar operaciones CRUD
    const crudResult = await testCRUDOperations();
    verificationReport.checks.crudOperations = crudResult;
    
    // Determinar estado general
    const allChecks = [
      verificationReport.checks.tableExists,
      verificationReport.checks.requiredColumns.success,
      verificationReport.checks.clientsServiceCompatibility.success,
      verificationReport.checks.crudOperations.success
    ];
    
    verificationReport.overallStatus = allChecks.every(check => check === true) ? 'PASS' : 'FAIL';
    
    // Generar reporte
    console.log('\n' + '='.repeat(80));
    console.log('📋 REPORTE DE VERIFICACIÓN - TABLA CLIENTS');
    console.log('='.repeat(80));
    console.log(`📅 Fecha: ${verificationReport.timestamp}`);
    console.log(`📊 Estado general: ${verificationReport.overallStatus === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
    
    console.log('\n' + '-'.repeat(80));
    console.log('🔍 RESULTADOS DE VERIFICACIÓN:');
    console.log(`1. Tabla existe: ${verificationReport.checks.tableExists ? '✅ Sí' : '❌ No'}`);
    console.log(`2. Columnas requeridas: ${verificationReport.checks.requiredColumns.success ? `✅ ${verificationReport.checks.requiredColumns.totalColumns} columnas` : '❌ Faltan columnas'}`);
    console.log(`3. Compatibilidad con clientsService.js: ${verificationReport.checks.clientsServiceCompatibility.success ? '✅ Sí' : '❌ No'}`);
    console.log(`4. Índices: ${verificationReport.checks.indexes.success ? '✅ Completos' : `⚠️  Faltan: ${verificationReport.checks.indexes.missingIndexes.join(', ')}`}`);
    console.log(`5. Foreign keys: ${verificationReport.checks.foreignKeys.hasSellerForeignKey ? '✅ seller_id → sellers(id) encontrada' : '⚠️  No encontrada'}`);
    console.log(`6. Operaciones CRUD: ${verificationReport.checks.crudOperations.success ? '✅ Todas funcionan' : '❌ Fallaron'}`);
    
    if (verificationReport.checks.indexes.missingIndexes.length > 0) {
      console.log('\n' + '⚠️  RECOMENDACIONES:');
      console.log(`   • Crear índices para: ${verificationReport.checks.indexes.missingIndexes.join(', ')}`);
    }
    
    if (!verificationReport.checks.foreignKeys.hasSellerForeignKey) {
      console.log(`   • Agregar FOREIGN KEY constraint: seller_id → sellers(id)`);
    }
    
    console.log('\n' + '='.repeat(80));
    
    if (verificationReport.overallStatus === 'FAIL') {
      console.log('❌ Se encontraron problemas que deben resolverse antes de continuar.');
      process.exit(1);
    } else {
      console.log('✅ El esquema de la tabla clients está correcto y compatible con clientsService.js');
      console.log('✅ Puede proceder con las siguientes tareas del plan de implementación.');
    }
    
    return verificationReport;
    
  } catch (error) {
    console.error('\n❌ Error durante la verificación:', error.message);
    console.error('❌ El esquema no está listo para producción.');
    process.exit(1);
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  verifyClientsSchema()
    .then(report => {
      if (report.overallStatus === 'PASS') {
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
  verifyClientsSchema,
  verifyTableExists,
  verifyRequiredColumns,
  verifyClientsServiceCompatibility,
  verifyIndexes,
  verifyForeignKeys,
  testCRUDOperations
};