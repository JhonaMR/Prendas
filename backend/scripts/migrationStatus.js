/**
 * Script para ver el estado de las migraciones
 * 
 * Uso:
 * node scripts/migrationStatus.js              # Estado de BD actual
 * node scripts/migrationStatus.js --all        # Estado de todas las BDs
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

// Colores
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
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
    database: 'prendas_dev'
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
 * Obtener todas las migraciones disponibles
 */
function getAllMigrations() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }

  return fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql') && /^\d{3}_/.test(f))
    .sort();
}

/**
 * Obtener migraciones aplicadas
 */
async function getAppliedMigrations(pool) {
  try {
    const result = await pool.query(`
      SELECT 
        migration_name,
        applied_at,
        success,
        error_message,
        execution_time_ms
      FROM schema_migrations 
      ORDER BY migration_name
    `);
    return result.rows;
  } catch (error) {
    return [];
  }
}

/**
 * Mostrar estado de una base de datos
 */
async function showDatabaseStatus(dbName, config) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`${colors.blue}Base de datos: ${dbName.toUpperCase()}${colors.reset}`);
  console.log(`${'='.repeat(70)}`);

  const pool = new Pool(config);

  try {
    // Verificar conexión
    await pool.query('SELECT NOW()');

    // Obtener migraciones
    const allMigrations = getAllMigrations();
    const appliedMigrations = await getAppliedMigrations(pool);
    const appliedNames = appliedMigrations.map(m => m.migration_name);

    if (allMigrations.length === 0) {
      console.log(`${colors.yellow}⚠${colors.reset} No hay archivos de migración`);
      return;
    }

    console.log(`\n${colors.cyan}Total de migraciones:${colors.reset} ${allMigrations.length}`);
    console.log(`${colors.green}Aplicadas:${colors.reset} ${appliedNames.length}`);
    console.log(`${colors.yellow}Pendientes:${colors.reset} ${allMigrations.length - appliedNames.length}\n`);

    // Mostrar cada migración
    console.log('Estado de migraciones:\n');
    
    allMigrations.forEach(migration => {
      const applied = appliedMigrations.find(m => m.migration_name === migration);
      
      if (applied) {
        if (applied.success) {
          const date = new Date(applied.applied_at).toLocaleString();
          const time = applied.execution_time_ms ? `${applied.execution_time_ms}ms` : 'N/A';
          console.log(`${colors.green}✓${colors.reset} ${migration}`);
          console.log(`  ${colors.gray}Aplicada: ${date} (${time})${colors.reset}`);
        } else {
          console.log(`${colors.red}✗${colors.reset} ${migration}`);
          console.log(`  ${colors.red}Error: ${applied.error_message}${colors.reset}`);
        }
      } else {
        console.log(`${colors.yellow}○${colors.reset} ${migration}`);
        console.log(`  ${colors.gray}Pendiente${colors.reset}`);
      }
      console.log();
    });

    // Mostrar últimas migraciones aplicadas
    if (appliedMigrations.length > 0) {
      const successful = appliedMigrations.filter(m => m.success);
      if (successful.length > 0) {
        const last = successful[successful.length - 1];
        console.log(`${colors.cyan}Última migración aplicada:${colors.reset}`);
        console.log(`  ${last.migration_name}`);
        console.log(`  ${new Date(last.applied_at).toLocaleString()}\n`);
      }
    }

  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Error al conectar: ${error.message}`);
  } finally {
    await pool.end();
  }
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  const showAll = args.includes('--all');

  console.log(`\n${'='.repeat(70)}`);
  console.log(`${colors.blue}ESTADO DE MIGRACIONES${colors.reset}`);
  console.log(`${'='.repeat(70)}`);

  if (showAll) {
    // Mostrar todas las bases de datos
    for (const [dbName, config] of Object.entries(dbConfigs)) {
      await showDatabaseStatus(dbName, config);
    }
  } else {
    // Mostrar solo la BD actual (según .env)
    const currentDb = process.env.DB_NAME || 'inventory_plow';
    let dbName = 'plow';
    
    if (currentDb.includes('melas')) {
      dbName = 'melas';
    } else if (currentDb.includes('dev')) {
      dbName = 'dev';
    }

    await showDatabaseStatus(dbName, dbConfigs[dbName]);
  }

  console.log(`${'='.repeat(70)}\n`);
}

// Ejecutar
main().catch(error => {
  console.error(`\n${colors.red}✗ Error fatal:${colors.reset}`, error);
  process.exit(1);
});
