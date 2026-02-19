#!/usr/bin/env node

/**
 * Script para iniciar el frontend con Vite desde PM2
 * Ejecuta Vite directamente desde la raíz del proyecto
 * 
 * Nota: Este archivo es .cjs (CommonJS) porque el proyecto raíz usa "type": "module"
 */

const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.join(__dirname, '..');

console.log('🚀 Iniciando Vite dev server...');

// Ejecutar vite directamente desde node_modules
// Usar 'ignore' para stdin y 'pipe' para stdout/stderr para evitar que bloquee
const vite = spawn('node', ['node_modules/vite/bin/vite.js'], {
  cwd: rootDir,
  stdio: ['ignore', 'ignore', 'ignore'],
  detached: true,
  shell: false
});

// Desanclar el proceso para que no bloquee a PM2
vite.unref();

// Salir inmediatamente sin esperar a que Vite termine
console.log('✅ Vite iniciado en background (PID: ' + vite.pid + ')');
process.exit(0);
