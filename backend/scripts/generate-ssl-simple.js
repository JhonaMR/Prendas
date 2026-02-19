/**
 * Script para generar certificados SSL autofirmados
 * Usa el paquete 'pem' que es más confiable
 */

const fs = require('fs');
const path = require('path');
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

// Instalar pem si no está disponible
try {
    require.resolve('pem');
} catch (e) {
    console.log('📦 Instalando paquete pem...');
    execSync('npm install --save-dev pem', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
}

const pem = require('pem');

pem.createCertificate({
    days: 365,
    selfSigned: true,
    commonName: 'localhost'
}, (err, keys) => {
    if (err) {
        console.error('❌ Error generando certificados:', err.message);
        process.exit(1);
    }

    fs.writeFileSync(keyPath, keys.serviceKey);
    fs.writeFileSync(certPath, keys.certificate);

    console.log('✅ Certificados generados exitosamente:');
    console.log(`   Key:  ${keyPath}`);
    console.log(`   Cert: ${certPath}`);
    console.log('\n⚠️  IMPORTANTE: Estos certificados son autofirmados.');
    console.log('   Chrome mostrará una advertencia de seguridad, pero puedes continuar.');
    console.log('   Escribe "thisisunsafe" en la página de advertencia para continuar.\n');
});
