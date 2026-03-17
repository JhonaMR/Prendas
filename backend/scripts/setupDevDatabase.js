/**
 * Script para configurar base de datos de desarrollo
 * Copia datos de producción a desarrollo
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

async function setupDevDatabase() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${colors.cyan}CONFIGURAR BASE DE DATOS DE DESARROLLO${colors.reset}`);
  console.log(`${'='.repeat(60)}\n`);

  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || 5433;
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPassword = process.env.DB_PASSWORD;

  if (!dbPassword) {
    console.error(`${colors.red}✗${colors.reset} DB_PASSWORD no configurada en .env`);
    process.exit(1);
  }

  process.env.PGPASSWORD = dbPassword;

  try {
    // 1. Crear base de datos de desarrollo
    console.log(`${colors.cyan}→${colors.reset} Creando base de datos prendas_dev...`);
    try {
      execSync(
        `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -c "CREATE DATABASE prendas_dev;"`,
        { stdio: 'ignore' }
      );
      console.log(`${colors.green}✓${colors.reset} Base de datos creada`);
    } catch (error) {
      console.log(`${colors.yellow}ℹ${colors.reset} Base de datos ya existe`);
    }

    // 2. Copiar estructura desde Plow
    console.log(`\n${colors.cyan}→${colors.reset} Copiando estructura desde inventory_plow...`);
    const tempFile = path.join(__dirname, '../temp_structure.sql');

    execSync(
      `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d inventory_plow --schema-only -f "${tempFile}"`,
      { stdio: 'inherit' }
    );

    console.log(`${colors.cyan}→${colors.reset} Aplicando estructura a prendas_dev...`);
    execSync(
      `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d prendas_dev -f "${tempFile}"`,
      { stdio: 'inherit' }
    );

    fs.unlinkSync(tempFile);
    console.log(`${colors.green}✓${colors.reset} Estructura copiada`);

    console.log(`\n${colors.green}✓ CONFIGURACIÓN COMPLETADA${colors.reset}`);
    console.log(`\n${colors.cyan}Próximos pasos:${colors.reset}`);
    console.log('  1. Crear archivo backend/.env.dev con DB_NAME=prendas_dev');
    console.log('  2. Ejecutar: node scripts/migrationStatus.js');
    console.log('  3. Crear tu primera migración\n');

  } catch (error) {
    console.error(`\n${colors.red}✗ Error:${colors.reset}`, error.message);
    process.exit(1);
  } finally {
    delete process.env.PGPASSWORD;
  }
}

setupDevDatabase();
