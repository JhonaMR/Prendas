/**
 * Script para aplicar migraciones pendientes
 * 
 * Uso:
 * node scripts/applyMigrations.js --env=dev        # Tu PC (BD desarrollo)
 * node scripts/applyMigrations.js --env=prod       # Servidor (Plow y Melas)
 * node scripts/applyMigrations.js --target=plow    # Solo Plow
 * node scripts/applyMigrations.js --target=melas   # Solo Melas
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');
const BACKUPS_DIR = path.join(__dirname, '../backups/migrations');

// Colores para consola
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
    database: 'prendas_dev' // BD de desarrollo
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
 * Crear directorios necesarios
 */
function ensureDirectories() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
  }
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }
}

/**
 * Crear tabla de control de migraciones
 */
async function createMigrationsTable(pool) {
  const query = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      migration_name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT NOW(),
      success BOOLEAN DEFAULT TRUE,
      error_message TEXT,
      execution_time_ms INTEGER
    );
  `;
  await pool.query(query);
}

/**
 * Obtener migraciones aplicadas
 */
async function getAppliedMigrations(pool) {
  try {
    const result = await pool.query(
      'SELECT migration_name FROM schema_migrations WHERE success = true ORDER BY migration_name'
    );
    return result.rows.map(row => row.migration_name);
  } catch (error) {
    return [];
  }
}

/**
 * Obtener migraciones pendientes
 */
function getPendingMigrations(appliedMigrations) {
  const allMigrations = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql') && /^\d{3}_/.test(f))
    .sort();

  return allMigrations.filter(m => !appliedMigrations.includes(m));
}

/**
 * Extraer SQL de la sección UP
 */
function extractUpSQL(content) {
  const upMatch = content.match(/-- ={10,} UP ={10,}([\s\S]*?)(?:-- ={10,} DOWN ={10,}|$)/i);
  if (!upMatch) {
    throw new Error('No se encontró la sección UP en la migración');
  }

  // Limpiar comentarios y líneas vacías
  const sql = upMatch[1]
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('--');
    })
    .join('\n')
    .trim();

  if (!sql) {
    throw new Error('La sección UP está vacía');
  }

  return sql;
}

/**
 * Crear backup antes de aplicar migración
 */
async function createBackup(dbName) {
  const { execSync } = require('child_process');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const backupFile = path.join(BACKUPS_DIR, `${dbName}_pre_migration_${timestamp}.sql`);

  try {
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
 * Aplicar una migración
 */
async function applyMigration(pool, migrationFile, dbName) {
  const filepath = path.join(MIGRATIONS_DIR, migrationFile);
  const content = fs.readFileSync(filepath, 'utf8');

  console.log(`\n${colors.cyan}→${colors.reset} Aplicando: ${migrationFile} a ${dbName}`);

  const startTime = Date.now();

  try {
    // Extraer SQL de la sección UP
    const sql = extractUpSQL(content);

    // Ejecutar en transacción
    await pool.query('BEGIN');
    await pool.query(sql);

    // Registrar migración
    const executionTime = Date.now() - startTime;
    await pool.query(
      'INSERT INTO schema_migrations (migration_name, success, execution_time_ms) VALUES ($1, $2, $3)',
      [migrationFile, true, executionTime]
    );

    await pool.query('COMMIT');

    console.log(`${colors.green}✓${colors.reset} Completada en ${executionTime}ms`);
    return { success: true, executionTime };

  } catch (error) {
    await pool.query('ROLLBACK');

    // Registrar error
    try {
      await pool.query(
        'INSERT INTO schema_migrations (migration_name, success, error_message) VALUES ($1, $2, $3)',
        [migrationFile, false, error.message]
      );
    } catch (e) {
      // Ignorar si no se puede registrar el error
    }

    console.error(`${colors.red}✗${colors.reset} Error: ${error.message}`);
    throw error;
  }
}

/**
 * Aplicar migraciones a una base de datos
 */
async function applyMigrationsToDatabase(dbName, config) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${colors.blue}Base de datos: ${dbName.toUpperCase()}${colors.reset}`);
  console.log(`${'='.repeat(60)}`);

  const pool = new Pool(config);

  try {
    // Verificar conexión
    await pool.query('SELECT NOW()');
    console.log(`${colors.green}✓${colors.reset} Conexión establecida`);

    // Crear tabla de migraciones
    await createMigrationsTable(pool);

    // Obtener migraciones aplicadas y pendientes
    const appliedMigrations = await getAppliedMigrations(pool);
    const pendingMigrations = getPendingMigrations(appliedMigrations);

    if (pendingMigrations.length === 0) {
      console.log(`${colors.yellow}ℹ${colors.reset} No hay migraciones pendientes`);
      return { applied: 0, total: appliedMigrations.length };
    }

    console.log(`${colors.cyan}ℹ${colors.reset} Migraciones aplicadas: ${appliedMigrations.length}`);
    console.log(`${colors.cyan}ℹ${colors.reset} Migraciones pendientes: ${pendingMigrations.length}`);

    // Crear backup
    await createBackup(dbName);

    // Aplicar migraciones pendientes
    let appliedCount = 0;
    for (const migration of pendingMigrations) {
      await applyMigration(pool, migration, dbName);
      appliedCount++;
    }

    console.log(`\n${colors.green}✓${colors.reset} ${appliedCount} migración(es) aplicada(s) exitosamente`);
    return { applied: appliedCount, total: appliedMigrations.length + appliedCount };

  } catch (error) {
    console.error(`\n${colors.red}✗${colors.reset} Error al aplicar migraciones: ${error.message}`);
    throw error;
  } finally {
    await pool.end();
  }
}

/**
 * Main
 */
async function main() {
  ensureDirectories();

  // Parsear argumentos
  const args = process.argv.slice(2);
  const envArg = args.find(arg => arg.startsWith('--env='));
  const targetArg = args.find(arg => arg.startsWith('--target='));

  let targets = [];

  if (envArg) {
    const env = envArg.split('=')[1];
    if (env === 'dev') {
      targets = ['dev'];
    } else if (env === 'prod') {
      targets = ['plow', 'melas'];
    } else {
      console.error(`${colors.red}✗${colors.reset} Entorno inválido: ${env}`);
      console.log('\nUso:');
      console.log('  node scripts/applyMigrations.js --env=dev');
      console.log('  node scripts/applyMigrations.js --env=prod');
      console.log('  node scripts/applyMigrations.js --target=plow');
      console.log('  node scripts/applyMigrations.js --target=melas');
      process.exit(1);
    }
  } else if (targetArg) {
    const target = targetArg.split('=')[1];
    if (['dev', 'plow', 'melas'].includes(target)) {
      targets = [target];
    } else {
      console.error(`${colors.red}✗${colors.reset} Target inválido: ${target}`);
      process.exit(1);
    }
  } else {
    console.error(`${colors.red}✗${colors.reset} Debes especificar --env o --target`);
    console.log('\nUso:');
    console.log('  node scripts/applyMigrations.js --env=dev');
    console.log('  node scripts/applyMigrations.js --env=prod');
    console.log('  node scripts/applyMigrations.js --target=plow');
    console.log('  node scripts/applyMigrations.js --target=melas');
    process.exit(1);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`${colors.blue}SISTEMA DE MIGRACIONES${colors.reset}`);
  console.log(`${'='.repeat(60)}`);

  let totalApplied = 0;
  let hasErrors = false;

  for (const target of targets) {
    try {
      const result = await applyMigrationsToDatabase(target, dbConfigs[target]);
      totalApplied += result.applied;
    } catch (error) {
      hasErrors = true;
      console.error(`\n${colors.red}✗${colors.reset} Falló la aplicación de migraciones en ${target}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  if (hasErrors) {
    console.log(`${colors.red}✗ COMPLETADO CON ERRORES${colors.reset}`);
    console.log(`${colors.yellow}⚠${colors.reset} Revisa los logs arriba para más detalles`);
    process.exit(1);
  } else {
    console.log(`${colors.green}✓ COMPLETADO EXITOSAMENTE${colors.reset}`);
    console.log(`${colors.cyan}ℹ${colors.reset} Total de migraciones aplicadas: ${totalApplied}`);
  }
  console.log(`${'='.repeat(60)}\n`);
}

// Ejecutar
main().catch(error => {
  console.error(`\n${colors.red}✗ Error fatal:${colors.reset}`, error);
  process.exit(1);
});
