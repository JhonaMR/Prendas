#!/usr/bin/env node
/**
 * start-develop.cjs
 * 
 * Arranca el entorno de desarrollo local cuando estás en la branch "develop".
 * - Frontend: npm run dev  → http://localhost:5175
 * - Backend:  npm start    → http://localhost:5000
 * 
 * Uso: node start-develop.cjs
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// ── Verificar branch actual ──────────────────────────────────────────────────
function getCurrentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

const branch = getCurrentBranch();

if (branch !== 'develop') {
  console.error(`\n❌ No estás en la branch "develop". Branch actual: "${branch || 'desconocida'}"`);
  console.error('   Cambia a develop con: git checkout develop\n');
  process.exit(1);
}

console.log(`\n✅ Branch: ${branch}`);
console.log('🚀 Iniciando entorno de desarrollo local...\n');

// ── Copiar .env.dev al .env correspondiente ──────────────────────────────────
const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');

function copyEnvDev(srcDir, label) {
  const src = path.join(srcDir, '.env.dev');
  const dest = path.join(srcDir, '.env');
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`📄 ${label}: .env.dev → .env`);
  } else {
    console.warn(`⚠️  ${label}: no se encontró .env.dev, usando .env existente`);
  }
}

copyEnvDev(rootDir, 'Frontend');
copyEnvDev(backendDir, 'Backend');

// ── Iniciar procesos ─────────────────────────────────────────────────────────
function startProcess(label, command, args, cwd, env = {}) {
  const proc = spawn(command, args, {
    cwd,
    env: { ...process.env, ...env },
    shell: true,
    stdio: 'pipe'
  });

  const prefix = label.padEnd(10);

  proc.stdout.on('data', (data) => {
    data.toString().split('\n').filter(Boolean).forEach(line => {
      console.log(`[${prefix}] ${line}`);
    });
  });

  proc.stderr.on('data', (data) => {
    data.toString().split('\n').filter(Boolean).forEach(line => {
      console.error(`[${prefix}] ${line}`);
    });
  });

  proc.on('close', (code) => {
    if (code !== 0) {
      console.error(`\n❌ [${prefix}] proceso terminó con código ${code}`);
    }
  });

  return proc;
}

console.log('');
console.log('  Backend  → http://localhost:5000');
console.log('  Frontend → http://localhost:5175');
console.log('');
console.log('  Ctrl+C para detener ambos procesos\n');

const backend  = startProcess('Backend',  'npm', ['start'],     backendDir, { NODE_ENV: 'development' });
const frontend = startProcess('Frontend', 'npm', ['run', 'dev'], rootDir, { VITE_PORT: '5175' });

// ── Apagar ambos al salir ────────────────────────────────────────────────────
function shutdown() {
  console.log('\n🛑 Deteniendo procesos...');
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on('SIGINT',  shutdown);
process.on('SIGTERM', shutdown);
