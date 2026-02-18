/**
 * Script de diagnóstico para verificar el esquema de la tabla clients en PostgreSQL
 * 
 * Este script verifica:
 * 1. Si la tabla clients existe
 * 2. Qué columnas tiene actualmente
 * 3. Compara con el esquema esperado
 * 4. Reporta diferencias
 */

// Cargar variables de entorno
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { initDatabase, query } = require('../config/database');
const logger = require('../controllers/shared/logger');

// Esquema esperado basado en clientsService.js
const EXPECTED_SCHEMA = {
  columns: [
    { name: 'id', type: 'character varying', nullable: false, isPrimary: true },
    { name: 'name', type: 'character varying', nullable: false },
    { name: 'nit', type: 'character varying', nullable: true },
    { name: 'address', type: 'text', nullable: true },
    { name: 'city', type: 'character varying', nullable: true },
    { name: 'seller_id', type: 'character varying', nullable: true },
    { name: 'active', type: 'boolean', nullable: false, defaultValue: true }
  ],
  indexes: [
    { name: 'idx_clients_seller_id', columns: ['seller_id'] },
    { name: 'idx_clients_active', columns: ['active'] }
  ],
  foreignKeys: [
    { column: 'seller_id', referencesTable: 'sellers', referencesColumn: 'id' }
  ]
};

async function checkTableExists() {
  try {
    const result = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'clients'
      );
    `);
    
    const exists = result.rows[0].exists;
    logger.info(`📊 Tabla 'clients' existe: ${exists}`);
    return exists;
  } catch (error) {
    logger.error('❌ Error al verificar existencia de tabla:', error);
    throw error;
  }
}

async function getCurrentColumns() {
  try {
    const result = await query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'clients'
      ORDER BY ordinal_position;
    `);
    
    logger.info(`📊 Columnas actuales en tabla 'clients': ${result.rows.length}`);
    return result.rows;
  } catch (error) {
    logger.error('❌ Error al obtener columnas:', error);
    throw error;
  }
}

async function getCurrentIndexes() {
  try {
    const result = await query(`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename = 'clients'
        AND schemaname = 'public';
    `);
    
    logger.info(`📊 Índices actuales en tabla 'clients': ${result.rows.length}`);
    return result.rows;
  } catch (error) {
    logger.error('❌ Error al obtener índices:', error);
    throw error;
  }
}

async function getForeignKeys() {
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
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = 'clients';
    `);
    
    logger.info(`📊 Foreign keys en tabla 'clients': ${result.rows.length}`);
    return result.rows;
  } catch (error) {
    logger.error('❌ Error al obtener foreign keys:', error);
    throw error;
  }
}

function compareSchemas(currentColumns, expectedColumns) {
  const missingColumns = [];
  const typeMismatches = [];
  const nullableMismatches = [];
  
  // Verificar columnas esperadas vs actuales
  for (const expected of expectedColumns) {
    const current = currentColumns.find(c => c.column_name === expected.name);
    
    if (!current) {
      missingColumns.push({
        column: expected.name,
        expectedType: expected.type,
        reason: 'Columna no existe'
      });
      continue;
    }
    
    // Verificar tipo de dato (simplificado)
    const currentType = current.data_type;
    const expectedType = expected.type;
    
    if (!typesMatch(currentType, expectedType)) {
      typeMismatches.push({
        column: expected.name,
        currentType,
        expectedType
      });
    }
    
    // Verificar nullable
    const currentNullable = current.is_nullable === 'YES';
    const expectedNullable = expected.nullable;
    
    if (currentNullable !== expectedNullable) {
      nullableMismatches.push({
        column: expected.name,
        currentNullable,
        expectedNullable
      });
    }
  }
  
  // Verificar columnas extra (no esperadas)
  const extraColumns = currentColumns.filter(current => 
    !expectedColumns.some(expected => expected.name === current.column_name)
  ).map(c => ({
    column: c.column_name,
    type: c.data_type,
    nullable: c.is_nullable === 'YES'
  }));
  
  return {
    missingColumns,
    typeMismatches,
    nullableMismatches,
    extraColumns
  };
}

function typesMatch(currentType, expectedType) {
  // Mapeo simplificado de tipos PostgreSQL
  const typeMapping = {
    'character varying': ['varchar', 'text', 'character varying'],
    'text': ['text', 'character varying', 'varchar'],
    'boolean': ['boolean', 'bool'],
    'integer': ['integer', 'int', 'smallint', 'bigint'],
    'numeric': ['numeric', 'decimal']
  };
  
  const currentNormalized = currentType.toLowerCase();
  const expectedNormalized = expectedType.toLowerCase();
  
  // Si los tipos son exactamente iguales
  if (currentNormalized === expectedNormalized) {
    return true;
  }
  
  // Verificar si son tipos compatibles según el mapeo
  for (const [key, compatibleTypes] of Object.entries(typeMapping)) {
    if (key === expectedNormalized && compatibleTypes.includes(currentNormalized)) {
      return true;
    }
    if (key === currentNormalized && compatibleTypes.includes(expectedNormalized)) {
      return true;
    }
  }
  
  return false;
}

function generateReport(tableExists, currentColumns, currentIndexes, foreignKeys, schemaComparison) {
  const report = {
    timestamp: new Date().toISOString(),
    tableExists,
    currentColumnCount: currentColumns ? currentColumns.length : 0,
    currentIndexCount: currentIndexes ? currentIndexes.length : 0,
    foreignKeyCount: foreignKeys ? foreignKeys.length : 0,
    issues: {
      critical: [],
      warnings: [],
      info: []
    },
    recommendations: []
  };
  
  if (!tableExists) {
    report.issues.critical.push('❌ La tabla "clients" no existe en la base de datos');
    report.recommendations.push('Crear la tabla "clients" con el esquema completo');
  } else {
    // Analizar columnas faltantes
    if (schemaComparison.missingColumns.length > 0) {
      for (const missing of schemaComparison.missingColumns) {
        report.issues.critical.push(`❌ Columna faltante: "${missing.column}" (tipo esperado: ${missing.expectedType})`);
      }
      report.recommendations.push('Agregar las columnas faltantes usando ALTER TABLE');
    }
    
    // Analizar discrepancias de tipo
    if (schemaComparison.typeMismatches.length > 0) {
      for (const mismatch of schemaComparison.typeMismatches) {
        report.issues.warnings.push(`⚠️  Discrepancia de tipo en columna "${mismatch.column}": actual=${mismatch.currentType}, esperado=${mismatch.expectedType}`);
      }
    }
    
    // Analizar discrepancias de nullable
    if (schemaComparison.nullableMismatches.length > 0) {
      for (const mismatch of schemaComparison.nullableMismatches) {
        report.issues.warnings.push(`⚠️  Discrepancia de nullable en columna "${mismatch.column}": actual=${mismatch.currentNullable}, esperado=${mismatch.expectedNullable}`);
      }
    }
    
    // Analizar columnas extra
    if (schemaComparison.extraColumns.length > 0) {
      for (const extra of schemaComparison.extraColumns) {
        report.issues.info.push(`ℹ️  Columna extra: "${extra.column}" (tipo: ${extra.type}, nullable: ${extra.nullable})`);
      }
    }
    
    // Verificar índices
    const hasSellerIdIndex = currentIndexes.some(idx => 
      idx.indexdef.toLowerCase().includes('seller_id')
    );
    if (!hasSellerIdIndex) {
      report.issues.warnings.push('⚠️  No hay índice en la columna seller_id');
      report.recommendations.push('Crear índice en seller_id para optimizar búsquedas');
    }
    
    const hasActiveIndex = currentIndexes.some(idx => 
      idx.indexdef.toLowerCase().includes('active')
    );
    if (!hasActiveIndex) {
      report.issues.info.push('ℹ️  No hay índice en la columna active');
      report.recommendations.push('Considerar crear índice en active si se filtra frecuentemente por estado');
    }
    
    // Verificar foreign key
    const hasSellerForeignKey = foreignKeys.some(fk => 
      fk.column_name === 'seller_id' && fk.foreign_table_name === 'sellers'
    );
    if (!hasSellerForeignKey) {
      report.issues.warnings.push('⚠️  No hay foreign key constraint en seller_id → sellers(id)');
      report.recommendations.push('Agregar FOREIGN KEY constraint para mantener integridad referencial');
    }
  }
  
  // Resumen
  if (report.issues.critical.length === 0 && report.issues.warnings.length === 0) {
    report.summary = '✅ El esquema de la tabla clients es correcto';
  } else if (report.issues.critical.length > 0) {
    report.summary = `❌ Hay ${report.issues.critical.length} problemas críticos que deben resolverse`;
  } else {
    report.summary = `⚠️  Hay ${report.issues.warnings.length} advertencias que deberían revisarse`;
  }
  
  return report;
}

async function diagnoseClientsSchema() {
  logger.info('🔍 Iniciando diagnóstico del esquema de tabla clients...');
  
  try {
    // 0. Inicializar base de datos
    await initDatabase();
    
    // 1. Verificar si la tabla existe
    const tableExists = await checkTableExists();
    
    let currentColumns = [];
    let currentIndexes = [];
    let foreignKeys = [];
    let schemaComparison = { missingColumns: [], typeMismatches: [], nullableMismatches: [], extraColumns: [] };
    
    if (tableExists) {
      // 2. Obtener columnas actuales
      currentColumns = await getCurrentColumns();
      
      // 3. Obtener índices actuales
      currentIndexes = await getCurrentIndexes();
      
      // 4. Obtener foreign keys
      foreignKeys = await getForeignKeys();
      
      // 5. Comparar con esquema esperado
      schemaComparison = compareSchemas(currentColumns, EXPECTED_SCHEMA.columns);
    }
    
    // 6. Generar reporte
    const report = generateReport(tableExists, currentColumns, currentIndexes, foreignKeys, schemaComparison);
    
    // 7. Imprimir reporte
    console.log('\n' + '='.repeat(80));
    console.log('📋 REPORTE DE DIAGNÓSTICO - TABLA CLIENTS');
    console.log('='.repeat(80));
    console.log(`📅 Fecha: ${report.timestamp}`);
    console.log(`📊 Tabla existe: ${report.tableExists ? '✅ Sí' : '❌ No'}`);
    
    if (tableExists) {
      console.log(`📊 Columnas: ${report.currentColumnCount}`);
      console.log(`📊 Índices: ${report.currentIndexCount}`);
      console.log(`📊 Foreign Keys: ${report.foreignKeyCount}`);
    }
    
    console.log('\n' + '-'.repeat(80));
    console.log('📝 RESUMEN:');
    console.log(report.summary);
    
    if (report.issues.critical.length > 0) {
      console.log('\n' + '🚨 PROBLEMAS CRÍTICOS:');
      report.issues.critical.forEach(issue => console.log(`  ${issue}`));
    }
    
    if (report.issues.warnings.length > 0) {
      console.log('\n' + '⚠️  ADVERTENCIAS:');
      report.issues.warnings.forEach(issue => console.log(`  ${issue}`));
    }
    
    if (report.issues.info.length > 0) {
      console.log('\n' + 'ℹ️  INFORMACIÓN:');
      report.issues.info.forEach(issue => console.log(`  ${issue}`));
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n' + '💡 RECOMENDACIONES:');
      report.recommendations.forEach(rec => console.log(`  • ${rec}`));
    }
    
    console.log('\n' + '='.repeat(80));
    
    // Retornar reporte para uso programático
    return report;
    
  } catch (error) {
    logger.error('❌ Error durante el diagnóstico:', error);
    console.error('❌ Error durante el diagnóstico:', error.message);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  diagnoseClientsSchema()
    .then(report => {
      if (report.issues.critical.length > 0) {
        process.exit(1); // Salir con error si hay problemas críticos
      } else {
        process.exit(0); // Salir exitosamente
      }
    })
    .catch(error => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = {
  diagnoseClientsSchema,
  EXPECTED_SCHEMA
};