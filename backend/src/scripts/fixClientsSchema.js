/**
 * Script para corregir el esquema de la tabla clients
 * Este script crea o modifica la tabla clients para que coincida
 * con lo que espera el código en clientsService.js
 */

const { query, transaction } = require('../config/database');
const logger = require('../controllers/shared/logger');

// Esquema esperado de la tabla clients
const EXPECTED_SCHEMA = {
  tableName: 'clients',
  columns: [
    { name: 'id', type: 'VARCHAR(255) PRIMARY KEY' },
    { name: 'name', type: 'VARCHAR(255) NOT NULL' },
    { name: 'nit', type: 'VARCHAR(50)' },
    { name: 'address', type: 'TEXT' },
    { name: 'city', type: 'VARCHAR(100)' },
    { name: 'seller_id', type: 'VARCHAR(255)' },
    { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
  ],
  indexes: [
    { name: 'idx_clients_seller_id', columns: ['seller_id'] },
    { name: 'idx_clients_name', columns: ['name'] },
    { name: 'idx_clients_nit', columns: ['nit'] }
  ],
  foreignKeys: [
    { 
      column: 'seller_id', 
      references: { 
        table: 'sellers', 
        column: 'id' 
      },
      constraintName: 'fk_clients_seller_id'
    }
  ]
};

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
 * Obtiene las columnas actuales de la tabla clients
 */
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
    return result.rows;
  } catch (error) {
    logger.error('Error obteniendo columnas de la tabla:', error);
    throw error;
  }
}

/**
 * Obtiene los índices actuales de la tabla
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
 * Obtiene las foreign keys actuales
 */
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
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'clients'
        AND tc.table_schema = 'public';
    `);
    return result.rows;
  } catch (error) {
    logger.error('Error obteniendo foreign keys:', error);
    throw error;
  }
}

/**
 * Crea la tabla clients si no existe
 */
async function createTable() {
  try {
    logger.info('Creando tabla clients...');
    
    // Crear la tabla
    await query(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        nit VARCHAR(50),
        address TEXT,
        city VARCHAR(100),
        seller_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES sellers(id)
      );
    `);
    
    logger.info('✅ Tabla clients creada exitosamente');
    return true;
  } catch (error) {
    logger.error('Error creando tabla clients:', error);
    throw error;
  }
}

/**
 * Agrega una columna si no existe
 */
async function addColumnIfNotExists(columnName, columnDefinition) {
  try {
    // Verificar si la columna ya existe
    const checkResult = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'clients' 
        AND column_name = $1
    `, [columnName]);
    
    if (checkResult.rows.length === 0) {
      await query(`ALTER TABLE clients ADD COLUMN ${columnName} ${columnDefinition}`);
      logger.info(`✅ Columna ${columnName} agregada`);
      return true;
    } else {
      logger.info(`Columna ${columnName} ya existe`);
      return false;
    }
  } catch (error) {
    logger.error(`Error agregando columna ${columnName}:`, error);
    throw error;
  }
}

/**
 * Crea un índice si no existe
 */
async function createIndexIfNotExists(indexName, columns, isUnique = false) {
  try {
    const normalizedIndexName = indexName.toLowerCase();
    
    // Verificar si el índice ya existe
    const checkResult = await query(`
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'clients' 
        AND indexname = $1
    `, [normalizedIndexName]);
    
    if (checkResult.rows.length === 0) {
      const columnsStr = columns.join(', ');
      await query(`CREATE ${isUnique ? 'UNIQUE ' : ''}INDEX ${normalizedIndexName} ON clients (${columnsStr})`);
      logger.info(`✅ Índice ${normalizedIndexName} creado en columnas: ${columns.join(', ')}`);
      return true;
    } else {
      logger.info(`Índice ${normalizedIndexName} ya existe`);
      return false;
    }
  } catch (error) {
    logger.error(`Error creando índice ${indexName}:`, error);
    throw error;
  }
}

/**
 * Agrega una foreign key si no existe
 */
async function addForeignKeyIfNotExists(constraintName, column, refTable, refColumn) {
  try {
    // Verificar si la foreign key ya existe
    const checkResult = await query(`
      SELECT 1 
      FROM information_schema.table_constraints 
      WHERE constraint_name = $1
    `, [constraintName]);
    
    if (checkResult.rows.length === 0) {
      await query(`
        ALTER TABLE clients 
        ADD CONSTRAINT ${constraintName} 
        FOREIGN KEY (${column}) 
        REFERENCES ${refTable}(${refColumn})
      `);
      logger.info(`✅ Foreign key ${constraintName} creada`);
      return true;
    } else {
      logger.info(`Foreign key ${constraintName} ya existe`);
      return false;
    }
  } catch (error) {
    logger.error(`Error creando foreign key ${constraintName}:`, error);
    throw error;
  }
}

/**
 * Función principal para corregir el esquema
 */
async function fixClientsSchema() {
  try {
    logger.info('🔧 Iniciando corrección del esquema de la tabla clients...');
    
    // Verificar si la tabla existe
    const tableExistsResult = await tableExists();
    
    if (!tableExistsResult) {
      logger.info('La tabla clients no existe. Creando...');
      await createTable();
    } else {
      logger.info('La tabla clients ya existe. Verificando estructura...');
      
      // Obtener columnas actuales
      const currentColumns = await getCurrentColumns();
      const currentIndexes = await getCurrentIndexes();
      const currentForeignKeys = await getForeignKeys();
      
      logger.info(`Columnas actuales: ${currentColumns.length} columnas encontradas`);
      logger.info(`Índices actuales: ${currentIndexes.length} índices encontrados`);
      logger.info(`Foreign keys: ${currentForeignKeys.length} foreign keys encontradas`);
      
      // Verificar y agregar columnas faltantes
      for (const columnDef of EXPECTED_SCHEMA.columns) {
        const columnExists = currentColumns.some(col => 
          col.column_name === columnDef.name
        );
        
        if (!columnExists) {
          logger.info(`Agregando columna faltante: ${columnDef.name}`);
          await addColumnIfNotExists(columnDef.name, columnDef.type);
        }
      }
      
      // Verificar y crear índices faltantes
      for (const indexDef of EXPECTED_SCHEMA.indexes) {
        const indexExists = currentIndexes.some(idx => 
          idx.indexname === indexDef.name
        );
        
        if (!indexExists) {
          await createIndexIfNotExists(
            indexDef.name, 
            indexDef.columns, 
            indexDef.unique || false
          );
        }
      }
      
      // Verificar y agregar foreign keys faltantes
      for (const fkDef of EXPECTED_SCHEMA.foreignKeys) {
        const fkExists = currentForeignKeys.some(fk => 
          fk.constraint_name === fkDef.constraintName
        );
        
        if (!fkExists) {
          await addForeignKeyIfNotExists(
            fkDef.constraintName,
            fkDef.column,
            fkDef.references.table,
            fkDef.references.column
          );
        }
      }
    }
    
    logger.info('✅ Esquema de la tabla clients verificado y corregido exitosamente');
    return { success: true, message: 'Esquema corregido exitosamente' };
    
  } catch (error) {
    logger.error('❌ Error corrigiendo el esquema:', error);
    throw error;
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  fixClientsSchema()
    .then(result => {
      console.log('✅ Esquema corregido exitosamente');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error corrigiendo esquema:', error);
      process.exit(1);
    });
}

module.exports = {
  fixClientsSchema,
  tableExists,
  getCurrentColumns,
  getCurrentIndexes,
  getForeignKeys
};