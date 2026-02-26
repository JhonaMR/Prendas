/**
 * Script de prueba para verificar que el backup de imágenes funciona
 * 
 * Uso: node test-images-backup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verificando sistema de backup de imágenes...\n');

// Verificar estructura
const checks = [
  {
    name: 'Script de backup existe',
    path: 'src/scripts/backupImages.js'
  },
  {
    name: 'Carpeta de imágenes',
    path: 'public/images/references'
  },
  {
    name: 'Carpeta de backups',
    path: 'backups/images'
  },
  {
    name: 'Configuración PM2',
    path: 'ecosystem.config.js'
  }
];

let allGood = true;

checks.forEach(check => {
  const fullPath = path.join(__dirname, check.path);
  const exists = fs.existsSync(fullPath);
  const status = exists ? '✓' : '✗';
  const color = exists ? '\x1b[32m' : '\x1b[31m';
  
  console.log(`${color}${status}\x1b[0m ${check.name}`);
  
  if (!exists) allGood = false;
});

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('\n✓ Todo está configurado correctamente\n');
  console.log('Próximos pasos:');
  console.log('1. Agregar fotos a: backend/public/images/references/');
  console.log('2. Ejecutar backup manual: node src/scripts/backupImages.js');
  console.log('3. Ver backups: node src/scripts/backupImages.js list');
  console.log('4. Iniciar PM2: npm run pm2:start\n');
} else {
  console.log('\n✗ Hay problemas en la configuración\n');
  console.log('Ejecuta desde la carpeta backend/\n');
}
