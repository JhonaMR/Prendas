/**
 * Script de validación de migración de datos
 * 
 * Este script valida que la migración de datos de SQLite a PostgreSQL
 * se haya realizado correctamente.
 * 
 * Validaciones:
 * 1. Conteo de registros coincide entre SQLite y PostgreSQL
 * 2. Integridad de datos (todos los campos transformados correctamente)
 * 3. Relaciones preservadas (claves foráneas, integridad referencial)
 * 4. Transformación de tipos de datos correcta
 * 
 * Requirements: 3.3, 3.5
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const { getDatabaseConnectionManager } = require('../config/DatabaseConnectionManager');
const { query } = require('../config/database');
const logger = require('../controllers/shared/logger');

class MigrationValidator {
  constructor() {
    this.validationResults = {
      timestamp: new Date().toISOString(),
      passed: true,
      errors: [],
      warnings: [],
      details: {}
    };
  }

  /**
   * Obtener conexión a SQLite
   */
  getSqliteConnection() {
    const dbManager = getDatabaseConnectionManager();
    return dbManager.getConnection();
  }

  /**
   * Validar conteo de registros entre SQLite y PostgreSQL
   */
  async validateRecordCounts() {
    const validation = {
      step: 'Conteo de registros',
      passed: true,
      details: {}
    };

    try {
      // Conteo en SQLite
      const db = this.getSqliteConnection();
      const sqliteCountResult = db.prepare('SELECT COUNT(*) as count FROM clients').get();
      const sqliteCount = sqliteCountResult.count;
      
      // Conteo en PostgreSQL
      const pgCountResult = await query('SELECT COUNT(*) as count FROM clients');
      const pgCount = parseInt(pgCountResult.rows[0].count);
      
      validation.details = {
        sqliteCount: sqliteCount,
        postgresCount: pgCount,
        match: sqliteCount === pgCount
      };
      
      if (sqliteCount !== pgCount) {
        validation.passed = false;
        validation.error = `Los conteos no coinciden: SQLite=${sqliteCount}, PostgreSQL=${pgCount}`;
        this.validationResults.passed = false;
        this.validationResults.errors.push(`Conteo de registros no coincide: SQLite=${sqliteCount}, PostgreSQL=${pgCount}`);
      }
      
      this.validationResults.details.recordCounts = validation;
      return validation;
      
    } catch (error) {
      validation.passed = false;
      validation.error = error.message;
      this.validationResults.passed = false;
      this.validationResults.errors.push(`Error en conteo de registros: ${error.message}`);
      return validation;
    }
  }

  /**
   * Validar integridad de datos de una muestra de registros
   */
  async validateDataIntegrity(sampleSize = 20) {
    const validation = {
      step: 'Integridad de datos',
      passed: true,
      details: { checked: 0, errors: [] }
    };
    
    try {
      const db = this.getSqliteConnection();
      
      // Obtener muestra aleatoria de registros de SQLite
      const sampleRecords = db.prepare(`
        SELECT * FROM clients 
        ORDER BY RANDOM() 
        LIMIT ?
      `).all(sampleSize);
      
      validation.details.checked = sampleRecords.length;
      validation.details.errors = [];
      
      for (const sqliteRecord of sampleRecords) {
        try {
          // Buscar el mismo registro en PostgreSQL
          const pgResult = await query(
            'SELECT * FROM clients WHERE id = $1',
            [sqliteRecord.id]
          );
          
          if (pgResult.rows.length === 0) {
            validation.details.errors.push({
              id: sqliteRecord.id,
              error: 'Registro no encontrado en PostgreSQL'
            });
            validation.passed = false;
            continue;
          }
          
          const pgRecord = pgResult.rows[0];
          
          // Validar campos transformados
          const transformed = this.transformSqliteRecord(sqliteRecord);
          const errors = this.compareRecords(transformed, pgRecord);
          
          if (errors.length > 0) {
            validation.details.errors.push({
              id: sqliteRecord.id,
              errors: errors
            });
            validation.passed = false;
          }
          
        } catch (error) {
          validation.details.errors.push({
            id: sqliteRecord.id,
            error: error.message
          });
          validation.passed = false;
        }
      }
      
      if (validation.details.errors.length > 0) {
        validation.passed = false;
        this.validationResults.passed = false;
        this.validationResults.errors.push(
          `Errores en integridad de datos: ${validation.details.errors.length} errores encontrados`
        );
      }
      
    } catch (error) {
      validation.passed = false;
      validation.error = error.message;
      this.validationResults.passed = false;
    }
    
    this.validationResults.details.dataIntegrity = validation;
    return validation;
  }

  /**
   * Validar relaciones y claves foráneas
   */
  async validateRelationships() {
    const validation = {
      step: 'Validación de relaciones',
      passed: true,
      details: { foreignKeys: [], missingRelations: [] }
    };
    
    try {
      // Verificar que seller_id apunte a vendedores existentes
      const invalidSellers = await query(`
        SELECT c.id, c.seller_id 
        FROM clients c 
        WHERE c.seller_id IS NOT NULL 
        AND c.seller_id != ''
        AND NOT EXISTS (
          SELECT 1 FROM sellers s 
          WHERE s.id = c.seller_id
        )
      `);
      
      if (invalidSellers.rows.length > 0) {
        validation.passed = false;
        validation.details.foreignKeys = invalidSellers.rows;
        this.validationResults.errors.push(
          `Se encontraron ${invalidSellers.rows.length} referencias a vendedores inexistentes`
        );
      }
      
      // Verificar integridad de datos referencial
      const orphanedRecords = await query(`
        SELECT c.id, c.seller_id 
        FROM clients c
        WHERE c.seller_id IS NOT NULL 
        AND c.seller_id != ''
        AND NOT EXISTS (
          SELECT 1 FROM sellers s 
          WHERE s.id = c.seller_id
        )
      `);
      
      if (orphanedRecords.rows.length > 0) {
        validation.details.orphaned = orphanedRecords.rows;
        validation.passed = false;
      }
      
    } catch (error) {
      validation.passed = false;
      validation.error = error.message;
    }
    
    this.validationResults.details.relationships = validation;
    return validation;
  }

  /**
   * Validar transformación de tipos de datos
   */
  async validateDataTypes() {
    const validation = {
      step: 'Validación de tipos de datos',
      passed: true,
      details: { typeMismatches: [] }
    };
    
    try {
      // Verificar tipos de columnas en PostgreSQL
      const columnTypes = await query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'clients'
        AND table_schema = 'public'
      `);
      
      const expectedTypes = {
        'id': 'character varying',
        'name': 'character varying',
        'nit': 'character varying',
        'address': 'text',
        'city': 'character varying',
        'seller_id': 'character varying',
        'active': 'boolean',
        'created_at': 'timestamp without time zone',
        'updated_at': 'timestamp without time zone'
      };
      
      for (const col of columnTypes.rows) {
        const expectedType = expectedTypes[col.column_name];
        if (expectedType && col.data_type !== expectedType) {
          validation.details.typeMismatches.push({
            column: col.column_name,
            expected: expectedType,
            actual: col.data_type
          });
          validation.passed = false;
        }
      }
      
    } catch (error) {
      validation.passed = false;
      validation.error = error.message;
    }
    
    this.validationResults.details.dataTypes = validation;
    return validation;
  }

  /**
   * Transformar registro de SQLite al formato PostgreSQL
   */
  transformSqliteRecord(record) {
    return {
      id: record.id,
      name: record.name,
      nit: record.nit || null,
      address: record.address || null,
      city: record.city || null,
      seller_id: record.seller_id || record.sellerId || null,
      active: record.active === 1 || record.active === true || record.active === 'true',
      created_at: record.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Comparar dos registros
   */
  compareRecords(transformed, pgRecord) {
    const errors = [];
    const fields = ['id', 'name', 'nit', 'city', 'seller_id'];
    
    for (const field of fields) {
      const transformedVal = transformed[field];
      const pgVal = pgRecord[field];
      
      // Normalizar valores para comparación
      const transformedNormalized = transformedVal === null || transformedVal === undefined ? null : String(transformedVal).trim();
      const pgNormalized = pgVal === null || pgVal === undefined ? null : String(pgVal).trim();
      
      if (transformedNormalized !== pgNormalized) {
        errors.push({
          field,
          expected: transformedNormalized,
          actual: pgNormalized
        });
      }
    }
    
    return errors;
  }

  /**
   * Ejecutar todas las validaciones
   */
  async validateAll() {
    this.validationResults = {
      timestamp: new Date().toISOString(),
      passed: true,
      errors: [],
      warnings: [],
      details: {}
    };
    
    logger.info('Iniciando validación de migración...');
    
    // Ejecutar validaciones
    const validations = [
      this.validateRecordCounts(),
      this.validateDataIntegrity(50), // Muestra de 50 registros
      this.validateRelationships(),
      this.validateDataTypes()
    ];
    
    const results = await Promise.all(validations);
    
    // Resumen
    this.validationResults.summary = {
      totalValidations: results.length,
      passedValidations: results.filter(v => v.passed).length,
      failedValidations: results.filter(v => !v.passed).length,
      timestamp: new Date().toISOString()
    };
    
    return this.validationResults;
  }

  /**
   * Generar reporte de validación
   */
  generateReport() {
    const report = {
      timestamp: this.validationResults.timestamp,
      passed: this.validationResults.passed,
      summary: this.validationResults.summary,
      details: this.validationResults.details,
      errors: this.validationResults.errors,
      warnings: this.validationResults.warnings
    };
    
    // Imprimir reporte
    console.log('\n' + '='.repeat(80));
    console.log('REPORTE DE VALIDACIÓN DE MIGRACIÓN');
    console.log('='.repeat(80));
    console.log(`Fecha: ${report.timestamp}`);
    console.log(`Estado: ${report.passed ? '✅ APROBADO' : '❌ FALLIDO'}`);
    console.log(`Validaciones pasadas: ${report.summary.passedValidations}/${report.summary.totalValidations}`);
    
    if (report.errors && report.errors.length > 0) {
      console.log('\n❌ ERRORES ENCONTRADOS:');
      report.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }
    
    if (report.warnings && report.warnings.length > 0) {
      console.log('\n⚠️  ADVERTENCIAS:');
      report.warnings.forEach((warning, i) => {
        console.log(`  ${i + 1}. ${warning}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    
    return report;
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  (async () => {
    try {
      const validator = new MigrationValidator();
      const results = await validator.validateAll();
      const report = validator.generateReport();
      
      if (report.passed) {
        console.log('✅ Validación completada exitosamente');
        process.exit(0);
      } else {
        console.error('❌ La validación encontró errores');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error durante la validación:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = { MigrationValidator };