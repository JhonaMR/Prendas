#!/usr/bin/env node

/**
 * Genera certificados SSL autofirmados para desarrollo
 * Crea los certificados en la carpeta certs/
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const certsDir = path.join(__dirname, '../certs');

// Crear carpeta si no existe
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
  console.log('✅ Carpeta certs/ creada');
}

// Verificar si ya existen los certificados
const keyPath = path.join(certsDir, 'dev.key');
const certPath = path.join(certsDir, 'dev.crt');

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  console.log('✅ Certificados SSL ya existen en certs/');
  process.exit(0);
}

console.log('🔐 Generando certificados SSL autofirmados para desarrollo...\n');

try {
  // Generar certificado autofirmado válido por 365 días
  const command = `openssl req -x509 -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/CN=localhost"`;
  
  execSync(command, { stdio: 'inherit' });
  
  console.log('\n✅ Certificados generados exitosamente:');
  console.log(`   📄 Clave privada: ${keyPath}`);
  console.log(`   📄 Certificado: ${certPath}`);
  console.log('\n⚠️  Nota: Estos certificados son autofirmados.');
  console.log('   Tu navegador mostrará una advertencia de seguridad.');
  console.log('   Esto es normal en desarrollo.\n');
  
} catch (error) {
  console.error('❌ Error generando certificados:', error.message);
  console.error('\n💡 Asegúrate de tener OpenSSL instalado:');
  console.error('   Windows: Instala Git Bash o usa WSL');
  console.error('   macOS: brew install openssl');
  console.error('   Linux: sudo apt-get install openssl\n');
  process.exit(1);
}
