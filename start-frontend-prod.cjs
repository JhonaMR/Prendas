#!/usr/bin/env node

/**
 * Script para servir el frontend compilado con HTTPS
 * Usado por PM2 para ejecutar el servidor de producción
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');

const app = express();
const PORT = 5173;

// Servir archivos estáticos desde dist/
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback - servir index.html para todas las rutas
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Leer certificados de mkcert
const keyPath = path.join(__dirname, 'certs/dev.key');
const certPath = path.join(__dirname, 'certs/dev.crt');

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error('❌ Certificados SSL no encontrados en certs/');
  console.error('   Asegúrate de que existen: certs/dev.key y certs/dev.crt');
  process.exit(1);
}

const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
};

// Crear servidor HTTPS
https.createServer(options, app).listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Frontend servido con HTTPS en https://0.0.0.0:${PORT}`);
  console.log(`📍 Accede desde: https://10.10.0.34:${PORT}`);
  console.log(`🔒 HTTPS habilitado con certificados de mkcert\n`);
});
