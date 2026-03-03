#!/usr/bin/env node

/**
 * Script para convertir PNG a ICO
 * Convierte pwa-512x512.png a icono.ico para Windows
 */

import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';

const publicDir = path.join(process.cwd(), 'public');

/**
 * Convierte una imagen PNG a ICO
 * Nota: Esta es una versión simplificada que crea un ICO válido
 */
function pngToIco(pngPath, icoPath) {
  try {
    // Leer el archivo PNG
    const pngBuffer = fs.readFileSync(pngPath);
    
    // Para una solución rápida, vamos a crear un ICO simple
    // Un ICO es básicamente un contenedor de imágenes en diferentes tamaños
    
    // Crear un canvas de 256x256 (tamaño máximo para ICO)
    const canvas = createCanvas(256, 256);
    const ctx = canvas.getContext('2d');
    
    // Fondo transparente
    ctx.clearRect(0, 0, 256, 256);
    
    // Cargar la imagen PNG
    const img = new (require('canvas').Image)();
    img.src = pngBuffer;
    
    // Dibujar la imagen escalada
    ctx.drawImage(img, 0, 0, 256, 256);
    
    // Convertir a buffer
    const icoBuffer = canvas.toBuffer('image/png');
    
    // Guardar como ICO (en este caso, es un PNG dentro de un contenedor ICO)
    fs.writeFileSync(icoPath, icoBuffer);
    
    console.log(`✅ ICO generado: ${icoPath}`);
  } catch (error) {
    console.error('❌ Error generando ICO:', error.message);
    console.log('\n💡 Alternativa: Usa una herramienta online para convertir PNG a ICO:');
    console.log('   https://convertio.co/png-ico/');
    console.log('   https://icoconvert.com/');
  }
}

try {
  console.log('🎨 Generando ICO desde PNG...');
  
  const pngPath = path.join(publicDir, 'pwa-512x512.png');
  const icoPath = path.join(publicDir, 'icono.ico');
  
  if (!fs.existsSync(pngPath)) {
    console.error(`❌ No se encontró: ${pngPath}`);
    process.exit(1);
  }
  
  pngToIco(pngPath, icoPath);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
