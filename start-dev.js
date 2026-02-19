#!/usr/bin/env node

/**
 * Script para iniciar el frontend con Vite desde PM2
 * Se ejecuta desde la raíz del proyecto
 */

const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('🚀 Iniciando Vite dev server...');
  execSync('npm run dev', {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
