/**
 * Genera certificados SSL autofirmados usando Node.js crypto
 * No requiere OpenSSL externo
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const certDir = path.join(__dirname, '../certs');

// Crear directorio de certificados si no existe
if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
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

// Instalar selfsigned si no está disponible
try {
    require.resolve('selfsigned');
} catch (e) {
    console.log('📦 Instalando paquete selfsigned...');
    try {
        execSync('npm install --save-dev selfsigned', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    } catch (err) {
        console.error('❌ Error instalando paquete:', err.message);
        process.exit(1);
    }
}

const selfsigned = require('selfsigned');

try {
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const pems = selfsigned.generate(attrs, {
        days: 365,
        keySize: 2048,
        algorithm: 'sha256'
    });

    fs.writeFileSync(keyPath, pems.private);
    fs.writeFileSync(certPath, pems.cert);

    console.log('✅ Certificados generados exitosamente:');
    console.log(`   Key:  ${keyPath}`);
    console.log(`   Cert: ${certPath}`);
    console.log('\n⚠️  IMPORTANTE: Estos certificados son autofirmados.');
    console.log('   Chrome mostrará una advertencia de seguridad, pero puedes continuar.');
    console.log('   Escribe "thisisunsafe" en la página de advertencia para continuar.\n');
} catch (error) {
    console.error('❌ Error generando certificados:', error.message);
    process.exit(1);
}
