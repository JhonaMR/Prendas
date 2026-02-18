/**
 * Script para examinar la estructura de la tabla clients en SQLite
 * Esto ayudará a entender qué datos necesitan ser migrados
 */

const { getDatabaseConnectionManager } = require('../config/DatabaseConnectionManager');
const path = require('path');

async function examineSqliteClients() {
  console.log('🔍 Examinando tabla clients en SQLite...\n');
  
  try {
    // Conectar a SQLite
    const dbManager = getDatabaseConnectionManager();
    const db = dbManager.getConnection();
    
    // 1. Verificar si la tabla clients existe en SQLite
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='clients'
    `).get();
    
    if (!tableExists) {
      console.log('❌ La tabla clients no existe en SQLite');
      return null;
    }
    
    console.log('✅ Tabla clients encontrada en SQLite');
    
    // 2. Obtener estructura de la tabla
    const tableInfo = db.prepare('PRAGMA table_info(clients)').all();
    console.log('\n📊 ESTRUCTURA DE LA TABLA CLIENTS EN SQLITE:');
    console.log('='.repeat(80));
    tableInfo.forEach((col, index) => {
      console.log(`${index + 1}. ${col.name} (${col.type}) - ${col.notnull ? 'NOT NULL' : 'NULLABLE'}${col.pk ? ' - PRIMARY KEY' : ''}`);
    });
    
    // 3. Obtener conteo de registros
    const countResult = db.prepare('SELECT COUNT(*) as count FROM clients').get();
    console.log(`\n📊 TOTAL DE REGISTROS: ${countResult.count}`);
    
    // 4. Obtener algunos registros de ejemplo
    console.log('\n📝 EJEMPLOS DE REGISTROS (primeros 5):');
    console.log('='.repeat(80));
    const sampleRows = db.prepare('SELECT * FROM clients LIMIT 5').all();
    
    sampleRows.forEach((row, index) => {
      console.log(`\nRegistro ${index + 1}:`);
      Object.entries(row).forEach(([key, value]) => {
        console.log(`  ${key}: ${value === null ? 'NULL' : `"${value}" (${typeof value})`}`);
      });
    });
    
    // 5. Analizar valores NULL en columnas importantes
    console.log('\n📊 ANÁLISIS DE VALORES NULL:');
    console.log('='.repeat(80));
    
    const columnsToAnalyze = tableInfo.map(col => col.name);
    for (const column of columnsToAnalyze) {
      const nullCount = db.prepare(`SELECT COUNT(*) as count FROM clients WHERE ${column} IS NULL`).get();
      const totalCount = countResult.count;
      const nullPercentage = totalCount > 0 ? ((nullCount.count / totalCount) * 100).toFixed(2) : 0;
      
      console.log(`${column}: ${nullCount.count} NULL de ${totalCount} (${nullPercentage}%)`);
    }
    
    // 6. Verificar si hay columnas que necesitan mapeo especial
    console.log('\n🔍 COLUMNAS PARA MAPEO:');
    console.log('='.repeat(80));
    
    // Buscar columnas que puedan mapearse a nit (email, nit, identification, etc.)
    const possibleNitColumns = tableInfo.filter(col => 
      col.name.toLowerCase().includes('email') || 
      col.name.toLowerCase().includes('nit') ||
      col.name.toLowerCase().includes('identification') ||
      col.name.toLowerCase().includes('id_number')
    );
    
    if (possibleNitColumns.length > 0) {
      console.log('Columnas candidatas para mapeo a "nit" en PostgreSQL:');
      possibleNitColumns.forEach(col => {
        console.log(`  • ${col.name} (${col.type})`);
      });
    } else {
      console.log('⚠️  No se encontraron columnas obvias para mapear a "nit"');
      console.log('   Se usará NULL para la columna nit en PostgreSQL');
    }
    
    // 7. Verificar columnas para seller_id
    const possibleSellerColumns = tableInfo.filter(col => 
      col.name.toLowerCase().includes('seller') ||
      col.name.toLowerCase().includes('vendedor') ||
      col.name.toLowerCase().includes('salesman')
    );
    
    if (possibleSellerColumns.length > 0) {
      console.log('\nColumnas candidatas para mapeo a "seller_id":');
      possibleSellerColumns.forEach(col => {
        console.log(`  • ${col.name} (${col.type})`);
      });
    } else {
      console.log('\n⚠️  No se encontraron columnas para mapear a "seller_id"');
      console.log('   Se usará NULL para la columna seller_id en PostgreSQL');
    }
    
    return {
      tableInfo,
      sampleRows,
      totalCount: countResult.count,
      hasEmailColumn: tableInfo.some(col => col.name.toLowerCase() === 'email'),
      hasSellerColumn: possibleSellerColumns.length > 0
    };
    
  } catch (error) {
    console.error('❌ Error examinando SQLite:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  examineSqliteClients()
    .then(result => {
      if (result) {
        console.log('\n' + '='.repeat(80));
        console.log('✅ Análisis completado exitosamente');
        console.log('='.repeat(80));
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { examineSqliteClients };