/**
 * Script para hacer backup de la base de datos PostgreSQL
 * Uso: node backend/src/scripts/backupDatabase.js
 */

require('dotenv').config();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const backupDir = path.join(__dirname, '../../backups');
  const backupFile = path.join(backupDir, `inventory-backup-${timestamp}.sql`);

  // Crear directorio de backups si no existe
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const dbUser = process.env.DB_USER || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || 'Contrasena14.';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || 5433;
  const dbName = process.env.DB_NAME || 'inventory';

  // Comando pg_dump
  const command = `pg_dump -U ${dbUser} -h ${dbHost} -p ${dbPort} -d ${dbName} -F p > "${backupFile}"`;

  console.log('\n🔄 Iniciando backup de la base de datos...');
  console.log(`📁 Archivo: ${backupFile}`);
  console.log(`🗄️  Base de datos: ${dbName}`);
  console.log(`🖥️  Host: ${dbHost}:${dbPort}\n`);

  return new Promise((resolve, reject) => {
    // Establecer variable de entorno para la contraseña
    const env = { ...process.env, PGPASSWORD: dbPassword };

    exec(command, { env }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error durante el backup:', error.message);
        reject(error);
        return;
      }

      if (stderr && !stderr.includes('Password')) {
        console.error('⚠️  Advertencia:', stderr);
      }

      // Verificar que el archivo se creó
      if (fs.existsSync(backupFile)) {
        const stats = fs.statSync(backupFile);
        const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`✅ Backup completado exitosamente`);
        console.log(`📦 Tamaño: ${sizeInMB} MB`);
        console.log(`📍 Ubicación: ${backupFile}`);
        console.log('\n💡 Para restaurar en otra máquina:');
        console.log(`   psql -U ${dbUser} -h ${dbHost} -p ${dbPort} -d ${dbName} < ${path.basename(backupFile)}`);
        resolve(backupFile);
      } else {
        reject(new Error('El archivo de backup no se creó'));
      }
    });
  });
}

backupDatabase()
  .then(() => {
    console.log('\n✨ Backup listo para llevar a casa');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
