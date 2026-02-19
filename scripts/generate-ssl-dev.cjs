#!/usr/bin/env node

/**
 * Genera certificados SSL autofirmados para desarrollo usando Node.js
 * No requiere OpenSSL instalado
 */

const fs = require('fs');
const path = require('path');

// Intentar usar el módulo crypto de Node.js
let pem;
try {
  pem = require('pem');
} catch (e) {
  // Si no está instalado, intentar con selfsigned
  try {
    const selfsigned = require('selfsigned');
    return generateWithSelfsigned(selfsigned);
  } catch (e2) {
    console.error('❌ Error: Necesitas instalar un paquete para generar certificados');
    console.error('\nEjecuta uno de estos comandos:\n');
    console.error('  npm install pem');
    console.error('  o');
    console.error('  npm install selfsigned\n');
    process.exit(1);
  }
}

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

pem.createCertificate({ days: 365, selfSigned: true }, (err, keys) => {
  if (err) {
    console.error('❌ Error generando certificados:', err.message);
    process.exit(1);
  }

  fs.writeFileSync(keyPath, keys.serviceKey);
  fs.writeFileSync(certPath, keys.certificate);

  console.log('✅ Certificados generados exitosamente:');
  console.log(`   📄 Clave privada: ${keyPath}`);
  console.log(`   📄 Certificado: ${certPath}`);
  console.log('\n⚠️  Nota: Estos certificados son autofirmados.');
  console.log('   Tu navegador mostrará una advertencia de seguridad.');
  console.log('   Esto es normal en desarrollo.\n');
});

function generateWithSelfsigned(selfsigned) {
  const attrs = [{ name: 'commonName', value: 'localhost' }];
  const pems = selfsigned.generate(attrs, { days: 365 });

  fs.writeFileSync(keyPath, pems.private);
  fs.writeFileSync(certPath, pems.cert);

  console.log('✅ Certificados generados exitosamente:');
  console.log(`   📄 Clave privada: ${keyPath}`);
  console.log(`   📄 Certificado: ${certPath}`);
  console.log('\n⚠️  Nota: Estos certificados son autofirmados.');
  console.log('   Tu navegador mostrará una advertencia de seguridad.');
  console.log('   Esto es normal en desarrollo.\n');
}
