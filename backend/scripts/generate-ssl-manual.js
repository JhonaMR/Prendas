/**
 * Genera certificados SSL autofirmados manualmente
 * Usando crypto de Node.js
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

// Intentar con OpenSSL primero
try {
    execSync('openssl version', { stdio: 'ignore' });
    
    // OpenSSL está disponible
    const command = `openssl req -x509 -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/CN=localhost"`;
    execSync(command, { stdio: 'inherit' });
    
    console.log('\n✅ Certificados generados exitosamente con OpenSSL:');
    console.log(`   Key:  ${keyPath}`);
    console.log(`   Cert: ${certPath}`);
    console.log('\n⚠️  IMPORTANTE: Estos certificados son autofirmados.');
    console.log('   Chrome mostrará una advertencia de seguridad, pero puedes continuar.');
    console.log('   Escribe "thisisunsafe" en la página de advertencia para continuar.\n');
    process.exit(0);
} catch (e) {
    // OpenSSL no está disponible, usar alternativa
    console.log('⚠️  OpenSSL no encontrado, usando generador alternativo...\n');
}

// Usar forge como alternativa
try {
    require.resolve('node-forge');
} catch (e) {
    console.log('📦 Instalando paquete node-forge...');
    try {
        execSync('npm install --save-dev node-forge', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    } catch (err) {
        console.error('❌ Error instalando paquete:', err.message);
        process.exit(1);
    }
}

const forge = require('node-forge');

try {
    // Generar par de claves
    console.log('Generando par de claves RSA...');
    const keys = forge.pki.rsa.generateKeyPair(2048);

    // Crear certificado autofirmado
    console.log('Creando certificado autofirmado...');
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 1);

    const attrs = [
        { name: 'commonName', value: 'localhost' },
        { name: 'organizationName', value: 'Development' }
    ];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.setExtensions([
        {
            name: 'basicConstraints',
            cA: true
        },
        {
            name: 'keyUsage',
            keyCertSign: true,
            digitalSignature: true,
            nonRepudiation: true,
            keyEncipherment: true,
            dataEncipherment: true
        },
        {
            name: 'extKeyUsage',
            serverAuth: true,
            clientAuth: true,
            codeSigning: true,
            emailProtection: true,
            timeStamping: true
        },
        {
            name: 'subjectAltName',
            altNames: [
                { type: 2, value: 'localhost' },
                { type: 2, value: '*.localhost' },
                { type: 7, ip: '127.0.0.1' }
            ]
        }
    ]);

    // Auto-firmar el certificado
    cert.sign(keys.privateKey, forge.md.sha256.create());

    // Convertir a PEM
    const pem = forge.pki.certificateToPem(cert);
    const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);

    // Guardar archivos
    fs.writeFileSync(keyPath, privateKeyPem);
    fs.writeFileSync(certPath, pem);

    console.log('\n✅ Certificados generados exitosamente:');
    console.log(`   Key:  ${keyPath}`);
    console.log(`   Cert: ${certPath}`);
    console.log('\n⚠️  IMPORTANTE: Estos certificados son autofirmados.');
    console.log('   Chrome mostrará una advertencia de seguridad, pero puedes continuar.');
    console.log('   Escribe "thisisunsafe" en la página de advertencia para continuar.\n');
} catch (error) {
    console.error('❌ Error generando certificados:', error.message);
    process.exit(1);
}
