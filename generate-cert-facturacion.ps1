# Script para generar certificado SSL para hostname "Facturacion"
# Ejecutar como Administrador

$certName = "Facturacion"
$dnsNames = @("Facturacion", "facturacion", "localhost")
$ipAddresses = @("10.10.0.34", "127.0.0.1")

# Crear el certificado
$cert = New-SelfSignedCertificate `
    -Subject "CN=$certName" `
    -DnsName $dnsNames `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -KeyExportPolicy Exportable `
    -KeySpec Signature `
    -KeyLength 4096 `
    -KeyAlgorithm RSA `
    -HashAlgorithm SHA256 `
    -NotAfter (Get-Date).AddDays(365)

Write-Host "Certificado creado con Thumbprint: $($cert.Thumbprint)" -ForegroundColor Green

# Exportar el certificado y la clave privada
$certPath = ".\Facturacion.pem"
$keyPath = ".\Facturacion-key.pem"
$pfxPath = ".\Facturacion.pfx"
$password = ConvertTo-SecureString -String "temp" -Force -AsPlainText

# Exportar a PFX primero
Export-PfxCertificate -Cert "Cert:\CurrentUser\My\$($cert.Thumbprint)" -FilePath $pfxPath -Password $password | Out-Null

Write-Host "Convirtiendo certificado a formato PEM..." -ForegroundColor Yellow

# Instrucciones para convertir a PEM
Write-Host "`nPara completar la conversión a PEM, ejecuta estos comandos:" -ForegroundColor Cyan
Write-Host "1. Instala OpenSSL desde: https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor White
Write-Host "   O usa Git Bash si tienes Git instalado" -ForegroundColor White
Write-Host "`n2. Luego ejecuta:" -ForegroundColor White
Write-Host "   openssl pkcs12 -in Facturacion.pfx -nocerts -out Facturacion-key.pem -nodes -passin pass:temp" -ForegroundColor Yellow
Write-Host "   openssl pkcs12 -in Facturacion.pfx -nokeys -out Facturacion.pem -passin pass:temp" -ForegroundColor Yellow

Write-Host "`nAlternativamente, puedes usar el archivo PFX directamente en Node.js" -ForegroundColor Cyan
Write-Host "Certificado PFX guardado en: $pfxPath" -ForegroundColor Green
Write-Host "Password del PFX: temp" -ForegroundColor Green

# Limpiar el certificado del store
Remove-Item "Cert:\CurrentUser\My\$($cert.Thumbprint)"

Write-Host "`n¡Listo! Ahora los otros equipos pueden acceder usando: https://Facturacion:3000" -ForegroundColor Green
