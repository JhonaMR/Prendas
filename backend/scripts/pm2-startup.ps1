# Script para configurar PM2 en Windows
# Ejecutar como administrador

# Instalar PM2 como servicio de Windows
pm2 install pm2-windows-startup

# Guardar la configuración actual de PM2
pm2 save

# Crear el servicio de Windows
pm2-windows-startup install

Write-Host "PM2 ha sido configurado como servicio de Windows"
Write-Host "El servicio se iniciará automáticamente al reiniciar"
