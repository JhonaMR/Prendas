/**
 * Script para generar certificados SSL autofirmados para desarrollo local
 * Ejecutar: node backend/scripts/generate-ssl-cert.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const certDir = path.join(__dirname, '../certs');

// Crear directorio de certificados si no existe
if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
    console.log(`✅ Directorio de certificados creado: ${certDir}`);
}

const keyPath = path.join(certDir, 'server.key');
const certPath = path.join(certDir, 'server.crt');

// Verificar si ya existen certificados
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    console.log('✅ Los certificados SSL ya existen');
    console.log(`   Key:  ${keyPath}`);
    console.log(`   Cert: ${certPath}`);
    process.exit(0);
}

console.log('🔐 Generando certificados SSL autofirmados...\n');

try {
    // Comando para generar certificado autofirmado válido por 365 días
    const command = `openssl req -x509 -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/CN=localhost"`;
    
    execSync(command, { stdio: 'inherit' });
    
    console.log('\n✅ Certificados generados exitosamente:');
    console.log(`   Key:  ${keyPath}`);
    console.log(`   Cert: ${certPath}`);
    console.log('\n⚠️  IMPORTANTE: Estos certificados son autofirmados.');
    console.log('   Chrome mostrará una advertencia de seguridad, pero puedes continuar.');
    console.log('   Escribe "thisisunsafe" en la página de advertencia para continuar.\n');
    
} catch (error) {
    console.error('❌ Error generando certificados:', error.message);
    console.error('\n⚠️  Asegúrate de tener OpenSSL instalado:');
    console.error('   Windows: Descarga desde https://slproweb.com/products/Win32OpenSSL.html');
    console.error('   O usa: choco install openssl (si tienes Chocolatey)');
    process.exit(1);
}
