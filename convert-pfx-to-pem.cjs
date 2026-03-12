// Script para convertir PFX a PEM usando Node.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pfxPath = path.join(__dirname, 'Facturacion.pfx');
const keyPath = path.join(__dirname, 'Facturacion-key.pem');
const certPath = path.join(__dirname, 'Facturacion.pem');

console.log('🔄 Convirtiendo certificado PFX a formato PEM...\n');

try {
    // Verificar si existe el archivo PFX
    if (!fs.existsSync(pfxPath)) {
        console.error('❌ No se encontró el archivo Facturacion.pfx');
        console.error('   Ejecuta primero: powershell -ExecutionPolicy Bypass -File generate-cert-facturacion.ps1');
        process.exit(1);
    }

    // Intentar usar openssl si está disponible
    try {
        // Extraer la clave privada
        execSync(`openssl pkcs12 -in "${pfxPath}" -nocerts -out "${keyPath}" -nodes -passin pass:temp`, {
            stdio: 'inherit'
        });
        
        // Extraer el certificado
        execSync(`openssl pkcs12 -in "${pfxPath}" -nokeys -out "${certPath}" -passin pass:temp`, {
            stdio: 'inherit'
        });
        
        console.log('\n✅ Certificados convertidos exitosamente:');
        console.log(`   📄 Certificado: ${certPath}`);
        console.log(`   🔑 Clave privada: ${keyPath}`);
        console.log('\n📋 Ahora copia estos archivos a la carpeta de certificados del backend:');
        console.log(`   copy "${certPath}" "backend\\certs\\server.crt"`);
        console.log(`   copy "${keyPath}" "backend\\certs\\server.key"`);
        console.log('\n🌐 Los otros equipos podrán acceder usando: https://Facturacion:3000');
        
    } catch (error) {
        console.error('\n❌ OpenSSL no está disponible en tu sistema');
        console.error('\n📥 Opciones para instalar OpenSSL:');
        console.error('   1. Descargar desde: https://slproweb.com/products/Win32OpenSSL.html');
        console.error('   2. Instalar Git for Windows (incluye OpenSSL): https://git-scm.com/download/win');
        console.error('   3. Usar Chocolatey: choco install openssl');
        console.error('\n💡 Después de instalar, ejecuta este script nuevamente.');
        process.exit(1);
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
