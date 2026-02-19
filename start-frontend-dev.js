#!/usr/bin/env node

/**
 * Script para iniciar el frontend en modo desarrollo
 * Usado por PM2 para ejecutar Vite
 */

const { spawn } = require('child_process');
const path = require('path');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

const child = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname),
  stdio: 'inherit',
  shell: isWindows
});

child.on('error', (err) => {
  console.error('Error iniciando frontend:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code);
});
