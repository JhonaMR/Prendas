# Acceso a la Aplicación en Red Local

Este documento explica cómo acceder a la aplicación desde otros PCs en la red local, cómo funciona la detección automática de red, y cómo migrar el proyecto a otro servidor.

---

## Nuevo: Detección Automática de Red

A partir de esta versión, el backend detecta automáticamente la IP correcta de la red y la utiliza para las conexiones a la base de datos. Esto significa que **no necesitas cambiar manualmente la configuración de DB_HOST** cuando accedes desde otro PC.

### Cómo funciona la detección

1. **Al iniciar el backend**, el sistema detecta todas las interfaces de red disponibles
2. **Extrae las direcciones IPv4** de cada interfaz
3. **Filtra las direcciones loopback** (127.0.0.1)
4. **Selecciona la IP primaria** con esta prioridad:
   - Ethernet (si está disponible)
   - WiFi (si está disponible)
   - Otra interfaz de red
5. **Aplica reglas según NODE_ENV**:
   - **development**: usa localhost (127.0.0.1)
   - **production**: usa la IP detectada
   - **staging**: usa la IP detectada con validación relajada

### Mecanismo de fallback

Si la conexión a la IP detectada falla, el sistema automáticamente intenta conectarse a localhost. Esto asegura que la aplicación continúe funcionando incluso si hay problemas de conectividad de red.

### Logs de detección

Cuando el backend inicia, verás logs como estos:

```
[INFO] 🌐 Network Environment Detection:
  - Detected IP: 10.10.0.34
  - Available interfaces: Ethernet, WiFi
  - Selected host: 10.10.0.34

[INFO] 🔧 Configuration Loaded:
  - Database host: 10.10.0.34
  - Database port: 5433
  - Database name: inventory
  - Environment: production
  - Connection pool: min=5, max=20

[INFO] ✅ Database Connection Established:
  - Host: 10.10.0.34:5433
  - Response time: 45ms
  - Pool initialized
```

---

## Caso 1: Acceder desde otro PC en la red local

### Requisitos
- El servidor principal está en: `10.10.0.34`
- El servidor debe estar ejecutándose (backend y frontend en PM2)
- Ambos PCs están en la misma red local
- El backend está configurado con `NODE_ENV=production` para usar la IP detectada

### Paso 1: Acceder a la aplicación

En el otro PC, abre un navegador web y ve a:
```
https://10.10.0.34:5173
```

### Paso 2: Resolver el error de certificado SSL

Verás un error de certificado porque el SSL está generado específicamente para `10.10.0.34`. Para resolver esto, necesitas instalar el certificado raíz de mkcert en el otro PC.

#### Opción A: Instalación automática (Recomendado)

1. **En el PC servidor (10.10.0.34):**
   - Localiza el archivo `rootCA.pem` en la carpeta raíz del proyecto
   - Cópialo a una carpeta compartida de red o a un USB

2. **En el otro PC:**
   - Abre PowerShell como administrador
   - Navega a la carpeta donde copiaste `rootCA.pem`
   - Ejecuta el siguiente comando:
   ```powershell
   certutil -addstore "Root" "C:\ruta\completa\al\rootCA.pem"
   ```
   - Deberías ver el mensaje: `El certificado "mkcert..." se ha agregado al almacén.`

3. **Reinicia el navegador completamente:**
   - Cierra todas las ventanas del navegador
   - Abre una nueva ventana
   - Ve a `https://10.10.0.34:5173`

#### Opción B: Instalación manual

Si el comando anterior no funciona:

1. Copia `rootCA.pem` al otro PC
2. Haz doble clic en el archivo
3. Haz clic en "Instalar certificado"
4. Selecciona "Máquina local"
5. Selecciona "Colocar todos los certificados en el siguiente almacén"
6. Busca y selecciona "Entidades de certificación raíz de confianza"
7. Haz clic en "Siguiente" y luego "Finalizar"

### Paso 3: Acceder a la aplicación

Ahora accede a `https://10.10.0.34:5173` sin errores de certificado.

**Nota importante:** El backend automáticamente usará la IP detectada (10.10.0.34) para conectarse a la base de datos, incluso aunque estés accediendo desde otro PC. No necesitas cambiar ninguna configuración.

### Paso 4: Instalar como PWA (Opcional)

Si deseas instalar la aplicación como PWA en el otro PC:

1. En el navegador, haz clic en el icono de instalación (esquina superior derecha)
2. Haz clic en "Instalar"
3. La aplicación se instalará como una app nativa

---

## Endpoint de Health Check

El backend proporciona un endpoint `/health` que puedes usar para verificar el estado de la conexión a la base de datos:

```bash
curl https://10.10.0.34:3000/health
```

Respuesta exitosa (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "database": {
    "connected": true,
    "host": "10.10.0.34",
    "port": 5433,
    "database": "inventory",
    "responseTime": 45
  },
  "environment": {
    "nodeEnv": "production",
    "detectedIP": "10.10.0.34",
    "fallbackUsed": false
  },
  "pool": {
    "totalConnections": 20,
    "idleConnections": 18,
    "waitingRequests": 0
  }
}
```

Respuesta cuando la BD no está disponible (503 Service Unavailable):
```json
{
  "status": "unhealthy",
  "message": "Database not ready",
  "error": "Connection refused"
}
```

---

## Caso 2: Migrar el proyecto a otro PC servidor

Este caso es para cuando quieres mover todo el proyecto a un servidor diferente.

### Requisitos previos

- Node.js 18+ instalado
- PostgreSQL 13+ instalado y ejecutándose
- PowerShell como administrador
- mkcert instalado (si no lo tienes, instálalo con: `choco install mkcert` o descárgalo desde https://github.com/FiloSottile/mkcert)

### Paso 1: Preparar el nuevo servidor

#### 1.1 Copiar el proyecto

Copia toda la carpeta del proyecto al nuevo PC. Puedes usar:
- USB
- Carpeta compartida de red
- Git (si tienes repositorio)

#### 1.2 Obtener la nueva IP del servidor

En PowerShell, ejecuta:
```powershell
ipconfig
```

Busca la sección "Adaptador de Ethernet" y anota la dirección IPv4. Por ejemplo: `192.168.1.100`

**Nota:** El backend detectará automáticamente esta IP al iniciar, así que no necesitas configurarla manualmente en la mayoría de los casos.

### Paso 2: Generar nuevos certificados SSL

Los certificados SSL están vinculados a la IP específica. Necesitas generar nuevos para la nueva IP.

#### 2.1 Instalar la autoridad de certificación local

En PowerShell como administrador, ejecuta:
```powershell
mkcert -install
```

Deberías ver: `The local CA is now installed in the system trust store! ⚡️`

#### 2.2 Generar certificados para la nueva IP

Reemplaza `NUEVA_IP` con la IP que obtuviste en el paso 1.2:

```powershell
mkcert NUEVA_IP localhost 127.0.0.1 ::1
```

Esto generará dos archivos:
- `NUEVA_IP+2.pem` (certificado)
- `NUEVA_IP+2-key.pem` (clave privada)

#### 2.3 Copiar certificados a la carpeta correcta

```powershell
Copy-Item "NUEVA_IP+2.pem" "backend/certs/server.crt"
Copy-Item "NUEVA_IP+2-key.pem" "backend/certs/server.key"
```

### Paso 3: Configurar variables de entorno

Abre `backend/.env` y actualiza:

```env
# PostgreSQL Configuration
# NOTE: DB_HOST is automatically detected based on NODE_ENV and network interfaces
# - In development mode: uses localhost (127.0.0.1)
# - In production/staging mode: uses detected network IP (e.g., 10.10.0.34)
# - If no non-loopback IP is found: falls back to localhost
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=Contrasena14.
DB_NAME=inventory

# Connection Pool
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=5000

# SSL (false for development, true for production)
DB_SSL=false

# JWT Security
JWT_SECRET=mi_secreto_super_seguro_para_jwt_123456

# Server Configuration
# NODE_ENV controls network detection behavior:
# - development: uses localhost for database connections
# - production: uses detected network IP for database connections
# - staging: uses detected network IP with relaxed validation
PORT=3000
NODE_ENV=production
HOST=0.0.0.0

# JWT Expiration
JWT_EXPIRES_IN=24h

# CORS - ACTUALIZA NUEVA_IP CON LA IP DEL NUEVO SERVIDOR
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,http://NUEVA_IP:5173,https://localhost:3000,https://localhost:5173,https://NUEVA_IP:5173,https://NUEVA_IP:3000

# HTTPS Configuration
USE_HTTPS=true

# Network Detection Configuration
# The system automatically detects available network interfaces and selects the appropriate IP
# Priority: Ethernet > WiFi > Other
# Fallback: localhost if no non-loopback addresses are available
```

**Importante:** 
- Reemplaza `NUEVA_IP` con la IP real del nuevo servidor
- El backend detectará automáticamente esta IP al iniciar
- Si `NODE_ENV=production`, el backend usará la IP detectada para la base de datos

### Paso 4: Instalar dependencias

En PowerShell, navega a la carpeta del proyecto y ejecuta:

```powershell
# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd backend
npm install
cd ..
```

### Paso 5: Compilar el frontend

```powershell
npm run build
```

Esto generará la carpeta `dist/` con el frontend compilado.

### Paso 6: Iniciar los servicios con PM2

```powershell
# Iniciar los servicios
pm2 start ecosystem.config.cjs

# Verificar que estén corriendo
pm2 list

# Ver logs
pm2 logs
```

Deberías ver algo como:
```
[INFO] 🌐 Network Environment Detection:
  - Detected IP: NUEVA_IP
  - Available interfaces: Ethernet
  - Selected host: NUEVA_IP

[INFO] ✅ Database Connection Established:
  - Host: NUEVA_IP:5433
  - Response time: 45ms
  - Pool initialized

✅ El backend está listo para recibir peticiones
✅ Frontend servido con HTTPS en https://0.0.0.0:5173
```

### Paso 7: Distribuir el certificado raíz a otros PCs

Ahora otros PCs necesitan el nuevo certificado raíz.

#### 7.1 Localizar el certificado raíz

En el nuevo servidor, abre PowerShell y ejecuta:
```powershell
$env:APPDATA + "\Local\mkcert"
```

Esto te mostrará la ruta. Navega a esa carpeta y busca `rootCA.pem`.

#### 7.2 Copiar a otros PCs

Copia `rootCA.pem` a cada PC que vaya a acceder a la aplicación.

#### 7.3 Instalar en otros PCs

En cada PC, abre PowerShell como administrador y ejecuta:
```powershell
certutil -addstore "Root" "C:\ruta\al\rootCA.pem"
```

### Paso 8: Acceder desde otros PCs

Ahora en otros PCs, accede a:
```
https://NUEVA_IP:5173
```

Reemplaza `NUEVA_IP` con la IP del nuevo servidor.

---

## Solución de problemas

### Error: "Este sitio web no puede proporcionar una conexión segura"

**Causa:** El certificado SSL no está instalado en el PC cliente.

**Solución:** Sigue el Paso 2 de "Caso 1" para instalar el certificado raíz.

### Error: "Failed to fetch"

**Causa:** El backend no está ejecutándose o hay un problema de CORS.

**Solución:**
1. Verifica que PM2 esté ejecutando los servicios: `pm2 list`
2. Verifica los logs: `pm2 logs inventario-backend`
3. Verifica el endpoint de health: `curl https://NUEVA_IP:3000/health`
4. Asegúrate de que la IP en `CORS_ORIGIN` sea correcta

### Error: "Mixed Content"

**Causa:** La página está en HTTPS pero intenta acceder a HTTP.

**Solución:** Asegúrate de que `USE_HTTPS=true` en `backend/.env` y que los certificados estén en `backend/certs/`.

### Error: "Database connection refused"

**Causa:** El backend no puede conectarse a la base de datos usando la IP detectada.

**Solución:**
1. Verifica los logs del backend: `pm2 logs inventario-backend`
2. Busca mensajes de "Fallback Connection Used" o "Critical Connection Failure"
3. Verifica que PostgreSQL esté ejecutándose
4. Verifica que la IP detectada sea correcta usando el endpoint `/health`
5. Si el fallback está siendo usado, verifica la conectividad de red

### El certificado expira

Los certificados de mkcert expiran en 3 años. Cuando expiren, regenera nuevos certificados siguiendo el Paso 2 de "Caso 2".

### La IP detectada es incorrecta

Si el backend detecta una IP incorrecta:

1. Verifica las interfaces de red disponibles: `ipconfig`
2. Revisa los logs del backend para ver qué IP fue detectada
3. Si necesitas forzar una IP específica, puedes:
   - Cambiar `NODE_ENV` a `development` (usa localhost)
   - O modificar manualmente `DB_HOST` en `backend/.env` (no recomendado)

---

## Resumen rápido

### Para acceder desde otro PC:
1. Instala `rootCA.pem` en el otro PC
2. Accede a `https://10.10.0.34:5173`
3. El backend automáticamente usa la IP detectada para la BD

### Para migrar a otro servidor:
1. Copia el proyecto
2. Genera nuevos certificados con mkcert
3. Actualiza `backend/.env` con la nueva IP en CORS_ORIGIN
4. Instala dependencias: `npm install` y `cd backend && npm install`
5. Compila: `npm run build`
6. Inicia: `pm2 start ecosystem.config.cjs`
7. Distribuye `rootCA.pem` a otros PCs
8. El backend detectará automáticamente la IP correcta

---

## Contacto y soporte

Si tienes problemas, verifica:
- Que ambos PCs estén en la misma red
- Que el firewall no bloquee los puertos 3000 y 5173
- Que PostgreSQL esté ejecutándose
- Que PM2 esté ejecutando los servicios
- Que el endpoint `/health` retorne estado "healthy"
- Los logs del backend para mensajes de detección de red
