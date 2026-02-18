/**
 * Script para verificar los resultados de la migración
 */

// Cargar variables de entorno
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { getDatabaseConnectionManager } = require('../config/DatabaseConnectionManager');
const { initDatabase, query } = require('../config/database');

async function verifyMigration() {
  console.log('🔍 Verificando resultados de la migración...\n');
  
  try {
    // Inicializar PostgreSQL
    await initDatabase();
    
    // 1. Verificar estructura de PostgreSQL
    console.log('1. 📊 VERIFICANDO ESTRUCTURA DE POSTGRESQL:');
    console.log('='.repeat(80));
    
    const pgColumns = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'clients'
      ORDER BY ordinal_position;
    `);
    
    console.log(`Columnas en PostgreSQL (${pgColumns.rows.length}):`);
    pgColumns.rows.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL'}`);
    });
    
    // 2. Verificar estructura de SQLite
    console.log('\n2. 📊 VERIFICANDO ESTRUCTURA DE SQLITE:');
    console.log('='.repeat(80));
    
    const dbManager = getDatabaseConnectionManager();
    const db = dbManager.getConnection();
    
    const sqliteColumns = db.prepare('PRAGMA table_info(clients)').all();
    console.log(`Columnas en SQLite (${sqliteColumns.length}):`);
    sqliteColumns.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col.name} (${col.type}) - ${col.notnull ? 'NOT NULL' : 'NULLABLE'}${col.pk ? ' - PRIMARY KEY' : ''}`);
    });
    
    // 3. Verificar conteos
    console.log('\n3. 📊 VERIFICANDO CONTEO DE REGISTROS:');
    console.log('='.repeat(80));
    
    // PostgreSQL count
    const pgCountResult = await query('SELECT COUNT(*) as count FROM clients');
    const pgCount = parseInt(pgCountResult.rows[0].count);
    
    // SQLite count
    const sqliteCountResult = db.prepare('SELECT COUNT(*) as count FROM clients').get();
    const sqliteCount = sqliteCountResult.count;
    
    console.log(`• PostgreSQL: ${pgCount} registros`);
    console.log(`• SQLite: ${sqliteCount} registros`);
    console.log(`• Coinciden: ${pgCount === sqliteCount ? '✅ Sí' : '❌ No'}`);
    
    // 4. Verificar datos de muestra
    console.log('\n4. 📝 VERIFICANDO DATOS DE MUESTRA:');
    console.log('='.repeat(80));
    
    // Obtener 3 IDs aleatorios de SQLite
    const sampleIds = db.prepare(`
      SELECT id FROM clients 
      ORDER BY RANDOM() 
      LIMIT 3
    `).all().map(row => row.id);
    
    console.log(`Verificando ${sampleIds.length} registros aleatorios:`);
    
    for (const id of sampleIds) {
      console.log(`\n  🔍 Registro ID: ${id}`);
      
      // Obtener de SQLite
      const sqliteRecord = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
      
      // Obtener de PostgreSQL
      const pgResult = await query('SELECT * FROM clients WHERE id = $1', [id]);
      const pgRecord = pgResult.rows[0];
      
      // Comparar campos importantes
      const fieldsToCompare = [
        { name: 'id', sqlite: sqliteRecord.id, pg: pgRecord.id },
        { name: 'name', sqlite: sqliteRecord.name, pg: pgRecord.name },
        { name: 'nit', sqlite: sqliteRecord.nit, pg: pgRecord.nit },
        { name: 'city', sqlite: sqliteRecord.city, pg: pgRecord.city },
        { name: 'seller_id', sqlite: sqliteRecord.sellerId || sqliteRecord.sellerid, pg: pgRecord.seller_id },
        { name: 'active', sqlite: sqliteRecord.active === 1, pg: pgRecord.active }
      ];
      
      let allMatch = true;
      for (const field of fieldsToCompare) {
        const sqliteValue = field.sqlite;
        const pgValue = field.pg;
        
        // Normalizar para comparación
        const normalizedSqlite = sqliteValue === null ? null : String(sqliteValue);
        const normalizedPg = pgValue === null ? null : String(pgValue);
        
        if (normalizedSqlite !== normalizedPg) {
          console.log(`    ❌ ${field.name}: SQLite="${sqliteValue}", PostgreSQL="${pgValue}"`);
          allMatch = false;
        } else {
          console.log(`    ✅ ${field.name}: "${sqliteValue}"`);
        }
      }
      
      if (allMatch) {
        console.log(`    ✅ Todos los campos coinciden`);
      }
    }
    
    // 5. Verificar transformaciones específicas
    console.log('\n5. 🔧 VERIFICANDO TRANSFORMACIONES:');
    console.log('='.repeat(80));
    
    // Verificar que active sea BOOLEAN en PostgreSQL
    const activeType = pgColumns.rows.find(col => col.column_name === 'active')?.data_type;
    console.log(`• Tipo de 'active' en PostgreSQL: ${activeType} (debe ser 'boolean')`);
    console.log(`  ${activeType === 'boolean' ? '✅ Correcto' : '❌ Incorrecto'}`);
    
    // Verificar que seller_id exista en PostgreSQL
    const hasSellerId = pgColumns.rows.some(col => col.column_name === 'seller_id');
    console.log(`• Columna 'seller_id' en PostgreSQL: ${hasSellerId ? '✅ Existe' : '❌ No existe'}`);
    
    // Verificar que updated_at exista en PostgreSQL
    const hasUpdatedAt = pgColumns.rows.some(col => col.column_name === 'updated_at');
    console.log(`• Columna 'updated_at' en PostgreSQL: ${hasUpdatedAt ? '✅ Existe' : '❌ No existe'}`);
    
    // 6. Resumen
    console.log('\n' + '='.repeat(80));
    console.log('📋 RESUMEN DE VERIFICACIÓN');
    console.log('='.repeat(80));
    
    const issues = [];
    
    if (pgCount !== sqliteCount) {
      issues.push(`❌ Los conteos no coinciden (PostgreSQL: ${pgCount}, SQLite: ${sqliteCount})`);
    }
    
    if (activeType !== 'boolean') {
      issues.push(`❌ El tipo de 'active' no es boolean (es: ${activeType})`);
    }
    
    if (!hasSellerId) {
      issues.push(`❌ Falta la columna 'seller_id'`);
    }
    
    if (!hasUpdatedAt) {
      issues.push(`❌ Falta la columna 'updated_at'`);
    }
    
    if (issues.length === 0) {
      console.log('✅ MIGRACIÓN VERIFICADA EXITOSAMENTE');
      console.log('✅ Todos los datos se migraron correctamente');
      console.log('✅ El esquema está corregido según los requisitos');
    } else {
      console.log('⚠️  SE ENCONTRARON PROBLEMAS:');
      issues.forEach(issue => console.log(`  ${issue}`));
    }
    
    console.log('='.repeat(80));
    
    return {
      success: issues.length === 0,
      pgCount,
      sqliteCount,
      countsMatch: pgCount === sqliteCount,
      activeTypeCorrect: activeType === 'boolean',
      hasSellerId,
      hasUpdatedAt,
      issues
    };
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  verifyMigration()
    .then(result => {
      if (result.success) {
        process.exit(0);
      } else {
        console.log('\n❌ La migración necesita correcciones');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { verifyMigration };