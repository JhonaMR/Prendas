#!/usr/bin/env node

/**
 * Script para generar iconos PWA
 * Genera iconos PNG en diferentes tamaños usando canvas
 */

import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';

const publicDir = path.join(process.cwd(), 'public');

// Crear directorio si no existe
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Función para crear un icono con gradiente y texto
function createIcon(size, isMaskable = false) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Fondo
  if (isMaskable) {
    // Para maskable, usar fondo sólido
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(0, 0, size, size);
  } else {
    // Gradiente para iconos normales
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#1e40af');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  // Dibujar "P" (primera letra de Plow)
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.floor(size * 0.5)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('P', size / 2, size / 2);

  return canvas.toBuffer('image/png');
}

// Función para crear screenshot
function createScreenshot(width, height) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fondo
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f8fafc');
  gradient.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Header
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(0, 0, width, Math.floor(height * 0.15));

  // Título
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.floor(height * 0.08)}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText('Plow', width / 2, Math.floor(height * 0.08));

  // Contenido simulado
  ctx.fillStyle = '#1e293b';
  ctx.font = `${Math.floor(height * 0.04)}px Arial`;
  ctx.textAlign = 'left';
  
  const lineHeight = Math.floor(height * 0.06);
  let y = Math.floor(height * 0.2);
  
  const lines = [
    'Gestión de Inventarios',
    'Ventas y Producción',
    'Sistema Integrado'
  ];
  
  lines.forEach(line => {
    ctx.fillText(line, Math.floor(width * 0.05), y);
    y += lineHeight;
  });

  return canvas.toBuffer('image/png');
}

try {
  console.log('🎨 Generando iconos PWA...');

  // Generar iconos
  const icons = [
    { size: 192, maskable: false, name: 'pwa-192x192.png' },
    { size: 512, maskable: false, name: 'pwa-512x512.png' },
    { size: 192, maskable: true, name: 'pwa-maskable-192x192.png' },
    { size: 512, maskable: true, name: 'pwa-maskable-512x512.png' }
  ];

  icons.forEach(({ size, maskable, name }) => {
    const buffer = createIcon(size, maskable);
    const filePath = path.join(publicDir, name);
    fs.writeFileSync(filePath, buffer);
    console.log(`✅ ${name} (${size}x${size})`);
  });

  // Generar screenshots
  const screenshots = [
    { width: 540, height: 720, name: 'pwa-screenshot-540x720.png' },
    { width: 1280, height: 720, name: 'pwa-screenshot-1280x720.png' }
  ];

  screenshots.forEach(({ width, height, name }) => {
    const buffer = createScreenshot(width, height);
    const filePath = path.join(publicDir, name);
    fs.writeFileSync(filePath, buffer);
    console.log(`✅ ${name} (${width}x${height})`);
  });

  console.log('\n✨ Iconos PWA generados exitosamente en public/');
} catch (error) {
  console.error('❌ Error generando iconos:', error.message);
  process.exit(1);
}
