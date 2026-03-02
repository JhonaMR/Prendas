# 🌐 CLOUDFLARE TUNNEL: SETUP COMPLETO

## 📋 ÍNDICE
1. [Conceptos](#conceptos)
2. [Instalación](#instalación)
3. [Configuración](#configuración)
4. [Verificación](#verificación)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 CONCEPTOS

### ¿Qué es Cloudflare Tunnel?

```
Es un túnel seguro que expone tu servidor local a internet:

Tu servidor local (192.168.1.100:3000)
    ↓ (conexión encriptada)
Cloudflare Tunnel
    ↓ (HTTPS automático)
Internet público
    ↓
Vendedor en carretera accede sin problemas
```

### Ventajas

```
✅ HTTPS automático (Let's Encrypt)
✅ No expones tu red (no port forwarding)
✅ Gratis (plan Free de Cloudflare)
✅ Funciona aunque tu IP cambie
✅ DDoS protection incluido
✅ Muy fácil de configurar
✅ No requiere certificados en celulares
```

### Comparación con alternativas

```
                    Cloudflare    Port Forward    VPN
HTTPS               ✅ Automático  ❌ Manual       ✅ Sí
Costo               $0             $20-30/mes     $0-5
Complejidad         Muy fácil      Difícil        Media
Seguridad           Muy alta       Media          Alta
PWA en celular      ✅ Funciona    ⚠️ Problemas   ✅ Funciona
Mantenimiento       Nulo           Manual         Manual
```

---

## 💻 INSTALACIÓN

### Paso 1: Instalar Cloudflared

**Windows (PowerShell como Admin):**

```powershell
# Opción 1: Descargar ejecutable
$url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
$output = "C:\Program Files\cloudflared.exe"
Invoke-WebRequest -Uri $url -OutFile $output

# Opción 2: Usar Chocolatey (si lo tienes)
choco install cloudflare-warp

# Verificar instalación
cloudflared --version
```

**Linux/Mac:**

```bash
# Descargar
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared

# Hacer ejecutable
chmod +x cloudflared

# Mover a PATH
sudo mv cloudflared /usr/local/bin/

# Verificar
cloudflared --version
```

### Paso 2: Login en Cloudflare

```bash
# Ejecutar comando
cloudflared tunnel login

# Se abrirá navegador
# 1. Selecciona tu dominio (o crea uno gratis)
# 2. Autoriza
# 3. Se guardará credencial en:
#    Windows: C:\Users\<usuario>\.cloudflared\cert.pem
#    Linux/Mac: ~/.cloudflared/cert.pem
```

### Paso 3: Crear Túnel

```bash
# Crear túnel con nombre
cloudflared tunnel create sistema-plow

# Salida:
# Tunnel UUID: 12345678-1234-1234-1234-123456789012
# Tunnel credentials file: C:\Users\<usuario>\.cloudflared\12345678-1234-1234-1234-123456789012.json
# Created tunnel sistema-plow
```

**Guarda el UUID, lo necesitarás después.**

---

## ⚙️ CONFIGURACIÓN

### Paso 1: Crear archivo config.yml

**Ubicación:**
```
Windows: C:\Users\<usuario>\.cloudflared\config.yml
Linux/Mac: ~/.cloudflared/config.yml
```

**Contenido:**

```yaml
# Configuración de Cloudflare Tunnel

# UUID del túnel (reemplaza con el tuyo)
tunnel: 12345678-1234-1234-1234-123456789012

# Archivo de credenciales
credentials-file: /Users/<usuario>/.cloudflared/12345678-1234-1234-1234-123456789012.json

# Rutas de ingreso
ingress:
  # PWA Vendedores
  - hostname: pedidos.tudominio.com
    service: http://localhost:3000
    
  # Sistema Admin (opcional)
  - hostname: admin.tudominio.com
    service: http://localhost:3000
    
  # Fallback (debe ser último)
  - service: http_status:404
```

**Notas:**
- Reemplaza `12345678-1234-1234-1234-123456789012` con tu UUID
- Reemplaza `<usuario>` con tu usuario de Windows/Linux
- Si no tienes dominio, Cloudflare te da uno gratis: `sistema-plow.trycloudflare.com`

### Paso 2: Asociar Dominio (Opcional)

Si tienes dominio propio:

```bash
# Crear DNS record
cloudflared tunnel route dns sistema-plow pedidos.tudominio.com

# Salida:
# Created DNS record pedidos.tudominio.com -> sistema-plow.cfargotunnel.com
```

Si no tienes dominio, usa el subdominio gratis:

```bash
# Cloudflare te da automáticamente:
# https://sistema-plow.trycloudflare.com
```

### Paso 3: Ejecutar Túnel

```bash
# Ejecutar en foreground (para probar)
cloudflared tunnel run sistema-plow

# Salida:
# 2024-03-02T10:00:00Z INF Starting tunnel
# 2024-03-02T10:00:01Z INF Registered tunnel connection
# 2024-03-02T10:00:02Z INF Tunnel running
```

**Mantén esta ventana abierta.**

---

## 🚀 EJECUTAR EN BACKGROUND (PRODUCCIÓN)

### Opción 1: Windows Service

```powershell
# Instalar como servicio
cloudflared service install

# Iniciar servicio
Start-Service cloudflared

# Verificar estado
Get-Service cloudflared

# Ver logs
Get-EventLog -LogName Application -Source cloudflared -Newest 10
```

### Opción 2: PM2 (Node.js)

```bash
# Instalar PM2
npm install -g pm2

# Crear archivo pm2-cloudflare.config.js
cat > pm2-cloudflare.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'cloudflared',
      script: 'cloudflared',
      args: 'tunnel run sistema-plow',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/cloudflare-error.log',
      out_file: './logs/cloudflare-out.log'
    }
  ]
};
EOF

# Iniciar con PM2
pm2 start pm2-cloudflare.config.js

# Guardar configuración
pm2 save

# Hacer que inicie con el sistema
pm2 startup
```

### Opción 3: Script Batch (Windows)

```batch
@echo off
REM start-cloudflare.bat

cd C:\Users\<usuario>\.cloudflared\
cloudflared tunnel run sistema-plow

REM Para ejecutar en background:
REM start /B cloudflared tunnel run sistema-plow
```

---

## ✅ VERIFICACIÓN

### Paso 1: Verificar que funciona

```bash
# En otra terminal, prueba la URL
curl https://pedidos.tudominio.com

# Deberías ver tu aplicación
```

### Paso 2: Verificar desde celular

```
1. Abre navegador en celular
2. Ve a: https://pedidos.tudominio.com
3. Deberías ver tu PWA
4. Chrome pregunta: "¿Instalar app?"
5. Click "Instalar"
```

### Paso 3: Verificar HTTPS

```
1. Abre DevTools (F12)
2. Ve a "Security"
3. Deberías ver: "Secure" con candado verde
4. Certificado: Let's Encrypt (Cloudflare)
```

### Paso 4: Verificar desde internet

```
1. Usa VPN o móvil con datos
2. Ve a: https://pedidos.tudominio.com
3. Deberías acceder sin problemas
```

---

## 🔍 TROUBLESHOOTING

### Problema 1: "Tunnel not found"

```
Error: Tunnel not found

Solución:
1. Verifica que el UUID sea correcto en config.yml
2. Verifica que el archivo de credenciales exista
3. Intenta crear un nuevo túnel:
   cloudflared tunnel create sistema-plow-2
```

### Problema 2: "Connection refused"

```
Error: Connection refused (127.0.0.1:3000)

Solución:
1. Verifica que tu servidor esté corriendo en puerto 3000
2. Verifica que sea accesible localmente:
   curl http://localhost:3000
3. Cambia puerto en config.yml si es necesario
```

### Problema 3: "Certificate error"

```
Error: Certificate verification failed

Solución:
1. Espera 5 minutos (Let's Encrypt tarda)
2. Limpia caché del navegador
3. Intenta en navegador privado
4. Verifica que el dominio esté correcto
```

### Problema 4: "Timeout"

```
Error: Request timeout

Solución:
1. Verifica tu conexión a internet
2. Verifica que Cloudflare esté corriendo
3. Aumenta timeout en config.yml:
   timeout: 30s
```

### Problema 5: "PWA no se instala"

```
Error: "Install" button no aparece

Solución:
1. Verifica que sea HTTPS (debe tener candado)
2. Verifica que manifest.json esté correcto
3. Verifica que service worker esté registrado
4. Intenta en navegador privado
5. Limpia caché y cookies
```

---

## 📊 MONITOREO

### Ver logs en tiempo real

```bash
# Ver logs del túnel
cloudflared tunnel logs sistema-plow

# Salida:
# 2024-03-02T10:00:00Z INF Tunnel running
# 2024-03-02T10:00:05Z INF Request from 203.0.113.45
# 2024-03-02T10:00:10Z INF Request from 203.0.113.46
```

### Ver estadísticas

```bash
# Acceder a dashboard
# https://dash.cloudflare.com/

# 1. Login con tu cuenta
# 2. Ve a "Tunnels"
# 3. Selecciona "sistema-plow"
# 4. Ves estadísticas en tiempo real
```

### Alertas

```
Cloudflare te notifica si:
- Túnel se desconecta
- Hay mucho tráfico
- Hay ataques DDoS
```

---

## 🔐 SEGURIDAD

### Autenticación

```yaml
# Agregar autenticación en config.yml
ingress:
  - hostname: pedidos.tudominio.com
    service: http://localhost:3000
    # Requiere login con Cloudflare
    originRequest:
      access:
        team: "tu-equipo"
        audit_ssh: true
```

### Rate Limiting

```yaml
# Limitar requests
ingress:
  - hostname: pedidos.tudominio.com
    service: http://localhost:3000
    originRequest:
      http2Origin: true
      # Cloudflare maneja rate limiting automáticamente
```

### WAF (Web Application Firewall)

```
Cloudflare incluye WAF gratis que protege contra:
- SQL Injection
- XSS
- DDoS
- Bots maliciosos
```

---

## 📈 ESCALABILIDAD

### Múltiples servidores

```yaml
# Si tienes múltiples servidores
ingress:
  - hostname: pedidos.tudominio.com
    service: http://localhost:3000
    
  - hostname: api.tudominio.com
    service: http://localhost:3001
    
  - hostname: admin.tudominio.com
    service: http://localhost:3002
```

### Load Balancing

```yaml
# Cloudflare distribuye automáticamente
# entre múltiples conexiones del túnel
ingress:
  - hostname: pedidos.tudominio.com
    service: http://localhost:3000
    # Cloudflare balancea automáticamente
```

---

## 🔄 ACTUALIZAR CONFIGURACIÓN

### Cambiar puerto

```yaml
# Cambiar de puerto 3000 a 5000
ingress:
  - hostname: pedidos.tudominio.com
    service: http://localhost:5000  # Cambiar aquí
```

Luego:
```bash
# Reiniciar túnel
cloudflared tunnel run sistema-plow
```

### Agregar nuevo dominio

```yaml
# Agregar nuevo dominio
ingress:
  - hostname: pedidos.tudominio.com
    service: http://localhost:3000
    
  - hostname: nuevo.tudominio.com  # Nuevo
    service: http://localhost:3000
```

Luego:
```bash
# Asociar dominio
cloudflared tunnel route dns sistema-plow nuevo.tudominio.com

# Reiniciar
cloudflared tunnel run sistema-plow
```

---

## 📋 CHECKLIST DE SETUP

```
□ Instalar cloudflared
□ Login en Cloudflare
□ Crear túnel
□ Crear config.yml
□ Asociar dominio (opcional)
□ Ejecutar túnel
□ Verificar desde navegador
□ Verificar desde celular
□ Verificar HTTPS
□ Configurar para ejecutar en background
□ Probar desde internet
□ Verificar PWA se instala
□ Configurar notificaciones (opcional)
□ Documentar URLs finales
```

---

## 📝 URLS FINALES

```
Tu sistema (red local):
http://192.168.1.100:3000

Tu sistema (desde internet):
https://admin.tudominio.com

PWA Vendedores:
https://pedidos.tudominio.com

O si usas subdominio gratis:
https://sistema-plow.trycloudflare.com
```

---

## 🆘 SOPORTE

### Documentación oficial
- https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/

### Comunidad
- https://community.cloudflare.com/

### Contacto
- support@cloudflare.com

¿Preguntas sobre Cloudflare Tunnel?
