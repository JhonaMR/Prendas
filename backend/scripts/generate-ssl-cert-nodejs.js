/**
 * Script para generar certificados SSL autofirmados usando Node.js puro
 * No requiere OpenSSL instalado
 * Ejecutar: node backend/scripts/generate-ssl-cert-nodejs.js
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
    // Intentar con OpenSSL primero
    try {
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
        // Si OpenSSL no está disponible, usar alternativa con Node.js
        console.log('⚠️  OpenSSL no encontrado, usando generador alternativo...\n');
        
        // Instalar paquete para generar certificados
        console.log('📦 Instalando paquete de generación de certificados...');
        try {
            execSync('npm install --save-dev selfsigned', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
        } catch (err) {
            console.error('❌ Error instalando paquete:', err.message);
            process.exit(1);
        }
        
        // Usar selfsigned para generar certificados
        const selfsigned = require('selfsigned');
        
        const attrs = [{ name: 'commonName', value: 'localhost' }];
        const pems = selfsigned.generate(attrs, { 
            days: 365,
            keySize: 2048,
            algorithm: 'sha256'
        });
        
        fs.writeFileSync(keyPath, pems.private);
        fs.writeFileSync(certPath, pems.cert);
        
        console.log('\n✅ Certificados generados exitosamente:');
        console.log(`   Key:  ${keyPath}`);
        console.log(`   Cert: ${certPath}`);
        console.log('\n⚠️  IMPORTANTE: Estos certificados son autofirmados.');
        console.log('   Chrome mostrará una advertencia de seguridad, pero puedes continuar.');
        console.log('   Escribe "thisisunsafe" en la página de advertencia para continuar.\n');
    }
} catch (error) {
    console.error('❌ Error generando certificados:', error.message);
    process.exit(1);
}
