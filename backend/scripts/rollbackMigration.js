/**
 * Script para revertir migraciones
 * 
 * Uso:
 * node scripts/rollbackMigration.js                    # Revertir última migración
 * node scripts/rollbackMigration.js 003_add_email      # Revertir migración específica
 * node scripts/rollbackMigration.js --target=plow      # Revertir en BD específica
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const readline = require('readline');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');
const BACKUPS_DIR = path.join(__dirname, '../backups/migrations');

// Colores
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Configuraciones de base de datos
 */
const dbConfigs = {
  dev: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'inventory_dev'
  },
  plow: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'inventory_plow'
  },
  melas: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'inventory_melas'
  }
};

/**
 * Preguntar confirmación al usuario
 */
function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 's' || answer.toLowerCase() === 'y');
    });
  });
}

/**
 * Obtener migraciones aplicadas
 */
async function getAppliedMigrations(pool) {
  try {
    const result = await pool.query(`
      SELECT migration_name, applied_at 
      FROM schema_migrations 
      WHERE success = true 
      ORDER BY migration_name DESC
    `);
    return result.rows;
  } catch (error) {
    return [];
  }
}

/**
 * Extraer SQL de la sección DOWN
 */
function extractDownSQL(content) {
  const downMatch = content.match(/-- ={10,} DOWN ={10,}([\s\S]*?)$/i);
  if (!downMatch) {
    throw new Error('No se encontró la sección DOWN en la migración');
  }

  // Limpiar comentarios (pero mantener los que tienen SQL comentado)
  const lines = downMatch[1].split('\n');
  const sqlLines = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Si la línea empieza con --, quitamos los -- para ejecutar el SQL
    if (trimmed.startsWith('--')) {
      const uncommented = trimmed.substring(2).trim();
      if (uncommented) {
        sqlLines.push(uncommented);
      }
    } else if (trimmed) {
      sqlLines.push(trimmed);
    }
  }

  const sql = sqlLines.join('\n').trim();

  if (!sql) {
    throw new Error('La sección DOWN está vacía o no tiene SQL ejecutable');
  }

  return sql;
}

/**
 * Crear backup antes de revertir
 */
async function createBackup(dbName) {
  const { execSync } = require('child_process');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUPS_DIR, `${dbName}_pre_rollback_${timestamp}.sql`);

  try {
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }

    const config = dbConfigs[dbName === 'prendas_dev' ? 'dev' : dbName];
    const command = `pg_dump -h ${config.host} -p ${config.port} -U ${config.user} -d ${config.database} -f "${backupFile}"`;
    
    process.env.PGPASSWORD = config.password;
    execSync(command, { stdio: 'ignore' });
    delete process.env.PGPASSWORD;

    const stats = fs.statSync(backupFile);
    const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log(`${colors.green}✓${colors.reset} Backup creado: ${path.basename(backupFile)} (${sizeInMB} MB)`);
    return backupFile;
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Error al crear backup: ${error.message}`);
    throw error;
  }
}

/**
 * Revertir una migración
 */
async function rollbackMigration(pool, migrationFile, dbName) {
  const filepath = path.join(MIGRATIONS_DIR, migrationFile);
  
  if (!fs.existsSync(filepath)) {
    throw new Error(`Archivo de migración no encontrado: ${migrationFile}`);
  }

  const content = fs.readFileSync(filepath, 'utf8');

  console.log(`\n${colors.cyan}→${colors.reset} Revirtiendo: ${migrationFile} en ${dbName}`);

  const startTime = Date.now();

  try {
    // Extraer SQL de la sección DOWN
    const sql = extractDownSQL(content);

    console.log(`\n${colors.yellow}SQL a ejecutar:${colors.reset}`);
    console.log(colors.gray + sql.substring(0, 500) + (sql.length > 500 ? '...' : '') + colors.reset);
    console.log();

    const confirmed = await askConfirmation(
      `${colors.yellow}⚠${colors.reset} ¿Estás seguro de revertir esta migración? (s/n): `
    );

    if (!confirmed) {
      console.log(`${colors.yellow}✗${colors.reset} Rollback cancelado`);
      return { success: false, cancelled: true };
    }

    // Crear backup
    await createBackup(dbName);

    // Ejecutar en transacción
    await pool.query('BEGIN');
    await pool.query(sql);

    // Eliminar registro de migración
    await pool.query(
      'DELETE FROM schema_migrations WHERE migration_name = $1',
      [migrationFile]
    );

    await pool.query('COMMIT');

    const executionTime = Date.now() - startTime;
    console.log(`${colors.green}✓${colors.reset} Revertida en ${executionTime}ms`);
    return { success: true, executionTime };

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(`${colors.red}✗${colors.reset} Error: ${error.message}`);
    throw error;
  }
}

/**
 * Revertir en una base de datos
 */
async function rollbackInDatabase(dbName, config, migrationName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${colors.blue}Base de datos: ${dbName.toUpperCase()}${colors.reset}`);
  console.log(`${'='.repeat(60)}`);

  const pool = new Pool(config);

  try {
    // Verificar conexión
    await pool.query('SELECT NOW()');
    console.log(`${colors.green}✓${colors.reset} Conexión establecida`);

    // Obtener migraciones aplicadas
    const appliedMigrations = await getAppliedMigrations(pool);

    if (appliedMigrations.length === 0) {
      console.log(`${colors.yellow}ℹ${colors.reset} No hay migraciones aplicadas para revertir`);
      return { reverted: 0 };
    }

    // Determinar qué migración revertir
    let migrationToRollback;

    if (migrationName) {
      // Buscar migración específica
      migrationToRollback = appliedMigrations.find(m => 
        m.migration_name === migrationName || 
        m.migration_name.includes(migrationName)
      );

      if (!migrationToRollback) {
        console.log(`${colors.red}✗${colors.reset} Migración no encontrada o no aplicada: ${migrationName}`);
        console.log(`\n${colors.cyan}Migraciones aplicadas:${colors.reset}`);
        appliedMigrations.forEach(m => {
          console.log(`  - ${m.migration_name}`);
        });
        return { reverted: 0 };
      }
    } else {
      // Revertir última migración
      migrationToRollback = appliedMigrations[0];
    }

    console.log(`${colors.cyan}ℹ${colors.reset} Migración a revertir: ${migrationToRollback.migration_name}`);
    console.log(`${colors.cyan}ℹ${colors.reset} Aplicada: ${new Date(migrationToRollback.applied_at).toLocaleString()}`);

    // Revertir
    const result = await rollbackMigration(pool, migrationToRollback.migration_name, dbName);

    if (result.success) {
      console.log(`\n${colors.green}✓${colors.reset} Rollback completado exitosamente`);
      return { reverted: 1 };
    } else if (result.cancelled) {
      return { reverted: 0 };
    }

  } catch (error) {
    console.error(`\n${colors.red}✗${colors.reset} Error al revertir migración: ${error.message}`);
    throw error;
  } finally {
    await pool.end();
  }
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  const targetArg = args.find(arg => arg.startsWith('--target='));
  const migrationName = args.find(arg => !arg.startsWith('--'));

  // Determinar base de datos
  let dbName = 'dev';
  if (targetArg) {
    const target = targetArg.split('=')[1];
    if (['dev', 'plow', 'melas'].includes(target)) {
      dbName = target;
    } else {
      console.error(`${colors.red}✗${colors.reset} Target inválido: ${target}`);
      process.exit(1);
    }
  } else {
    // Usar BD actual según .env
    const currentDb = process.env.DB_NAME || 'inventory_plow';
    if (currentDb.includes('melas')) {
      dbName = 'melas';
    } else if (currentDb.includes('dev')) {
      dbName = 'dev';
    } else {
      dbName = 'plow';
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`${colors.blue}REVERTIR MIGRACIÓN${colors.reset}`);
  console.log(`${'='.repeat(60)}`);

  try {
    await rollbackInDatabase(dbName, dbConfigs[dbName], migrationName);
  } catch (error) {
    console.error(`\n${colors.red}✗${colors.reset} Falló el rollback`);
    process.exit(1);
  }

  console.log(`\n${'='.repeat(60)}\n`);
}

// Ejecutar
main().catch(error => {
  console.error(`\n${colors.red}✗ Error fatal:${colors.reset}`, error);
  process.exit(1);
});
