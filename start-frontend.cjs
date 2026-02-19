#!/usr/bin/env node

/**
 * Script para iniciar el frontend con Vite
 * Usado por PM2 para ejecutar npm run dev
 */

const { spawn } = require('child_process');
const path = require('path');

const frontend = spawn('npm.cmd', ['run', 'dev'], {
  cwd: path.join(__dirname),
  stdio: 'inherit',
  shell: false
});

frontend.on('error', (err) => {
  console.error('Error al iniciar frontend:', err);
  process.exit(1);
});

frontend.on('exit', (code) => {
  console.log(`Frontend terminó con código ${code}`);
  process.exit(code);
});
