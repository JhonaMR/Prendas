#!/usr/bin/env node

/**
 * Script para iniciar el frontend con Vite desde PM2
 * Ejecuta Vite directamente desde la raíz del proyecto
 */

const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.join(__dirname, '..');

console.log('🚀 Iniciando Vite dev server...');

try {
  // Ejecutar vite directamente - esto bloqueará el proceso
  execSync('node node_modules/vite/bin/vite.js', {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });
} catch (error) {
  console.error('❌ Error al ejecutar Vite:', error.message);
  process.exit(1);
}
