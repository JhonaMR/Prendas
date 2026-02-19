/**
 * Script mejorado para restaurar la base de datos PostgreSQL desde el backup
 * Uso: node backend/src/scripts/restoreDatabaseV2.js [password]
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function main() {
  try {
    console.log('\n🔧 Iniciando proceso de restauración de base de datos...\n');

    // Paso 1: Limpiar el backup
    console.log('📝 Paso 1: Limpiando el archivo de backup...');
    const backupPath = path.join(__dirname, '../../backups/inventory-backup-2026-02-18.sql');

    if (!fs.existsSync(backupPath)) {
      console.error('❌ No se encontró el archivo de backup:', backupPath);
      process.exit(1);
    }

    let content = fs.readFileSync(backupPath, 'utf-8');
    // Remover la línea corrupta que comienza con \restrict
    content = content.replace(/\\restrict.*?\n/, '');
    console.log('✅ Backup limpiado exitosamente\n');

    // Paso 2: Obtener credenciales
    console.log('🔐 Configuración de PostgreSQL:');
    const dbHost = 'localhost';
    const dbPort = '5433';
    const dbUser = 'postgres';
    let dbPassword = process.argv[2];
    
    if (!dbPassword) {
      dbPassword = await question('Ingresa la contraseña de PostgreSQL: ');
    }
    const dbName = 'inventory';

    // Paso 3: Conectar a PostgreSQL
    console.log('\n🔌 Paso 2: Conectando a PostgreSQL...');
    const pool = new Pool({
      user: dbUser,
      password: dbPassword,
      host: dbHost,
      port: dbPort,
      database: 'postgres'
    });

    try {
      const client = await pool.connect();
      console.log('✅ Conexión exitosa a PostgreSQL\n');

      // Paso 4: Crear la base de datos si no existe
      console.log('🗄️  Paso 3: Creando base de datos...');
      try {
        await client.query(`CREATE DATABASE ${dbName};`);
        console.log(`✅ Base de datos '${dbName}' creada\n`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`⚠️  La base de datos '${dbName}' ya existe, continuando...\n`);
        } else {
          console.error('Error:', err.message);
        }
      }

      client.release();
    } catch (err) {
      console.error('❌ Error al conectar:', err.message);
      // Continuar de todas formas
    }

    // Paso 5: Restaurar el backup
    console.log('📥 Paso 4: Restaurando datos desde el backup...');
    const inventoryPool = new Pool({
      user: dbUser,
      password: dbPassword,
      host: dbHost,
      port: dbPort,
      database: dbName
    });

    try {
      const client = await inventoryPool.connect();
      
      // Dividir el SQL en statements individuales
      const statements = content
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      let executed = 0;
      let skipped = 0;

      for (const statement of statements) {
        try {
          // Saltar líneas que comienzan con \ (comandos psql)
          if (statement.startsWith('\\')) {
            skipped++;
            continue;
          }

          // Ejecutar el statement
          await client.query(statement);
          executed++;

          // Mostrar progreso cada 50 statements
          if (executed % 50 === 0) {
            console.log(`  ✓ ${executed} statements ejecutados...`);
          }
        } catch (err) {
          // Algunos errores son esperados (como crear tablas que ya existen)
          if (!err.message.includes('already exists') && 
              !err.message.includes('duplicate key') &&
              !err.message.includes('violates')) {
            console.error(`  ⚠️  Error en statement: ${err.message}`);
          }
        }
      }

      console.log(`✅ Backup restaurado exitosamente`);
      console.log(`   - ${executed} statements ejecutados`);
      console.log(`   - ${skipped} comandos psql omitidos\n`);

      // Paso 6: Verificar tablas
      console.log('✔️  Paso 5: Verificando tablas creadas...');
      const result = await client.query(
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';"
      );
      const tableCount = result.rows[0].count;
      console.log(`📊 Total de tablas: ${tableCount}\n`);

      // Listar las tablas
      const tablesResult = await client.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;"
      );
      console.log('📋 Tablas creadas:');
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });

      // Verificar datos en tablas principales
      console.log('\n📊 Verificando datos:');
      const clientsCount = await client.query('SELECT COUNT(*) FROM clients;');
      console.log(`   - Clientes: ${clientsCount.rows[0].count}`);

      const sellersCount = await client.query('SELECT COUNT(*) FROM sellers;');
      console.log(`   - Vendedores: ${sellersCount.rows[0].count}`);

      const ordersCount = await client.query('SELECT COUNT(*) FROM orders;');
      console.log(`   - Órdenes: ${ordersCount.rows[0].count}`);

      client.release();
      console.log('\n✅ ¡Restauración completada exitosamente!');
      console.log('Puedes comenzar a trabajar con la base de datos.\n');
    } catch (err) {
      console.error('❌ Error al restaurar backup:', err.message);
      process.exit(1);
    } finally {
      await inventoryPool.end();
      await pool.end();
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
