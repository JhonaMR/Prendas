# Acceso a la Aplicación en Red Local

Este documento explica cómo acceder a la aplicación desde otros PCs en la red local y cómo migrar el proyecto a otro servidor.

---

## Caso 1: Acceder desde otro PC en la red local

### Requisitos
- El servidor principal está en: `10.10.0.34`
- El servidor debe estar ejecutándose (backend y frontend en PM2)
- Ambos PCs están en la misma red local

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

### Paso 4: Instalar como PWA (Opcional)

Si deseas instalar la aplicación como PWA en el otro PC:

1. En el navegador, haz clic en el icono de instalación (esquina superior derecha)
2. Haz clic en "Instalar"
3. La aplicación se instalará como una app nativa

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
PORT=3000
NODE_ENV=production
HOST=0.0.0.0

# JWT Expiration
JWT_EXPIRES_IN=24h

# CORS - ACTUALIZA NUEVA_IP CON LA IP DEL NUEVO SERVIDOR
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,http://NUEVA_IP:5173,https://localhost:3000,https://localhost:5173,https://NUEVA_IP:5173,https://NUEVA_IP:3000

# HTTPS Configuration
USE_HTTPS=true
```

**Importante:** Reemplaza `NUEVA_IP` con la IP real del nuevo servidor.

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
3. Asegúrate de que la IP en `CORS_ORIGIN` sea correcta

### Error: "Mixed Content"

**Causa:** La página está en HTTPS pero intenta acceder a HTTP.

**Solución:** Asegúrate de que `USE_HTTPS=true` en `backend/.env` y que los certificados estén en `backend/certs/`.

### El certificado expira

Los certificados de mkcert expiran en 3 años. Cuando expiren, regenera nuevos certificados siguiendo el Paso 2 de "Caso 2".

---

## Resumen rápido

### Para acceder desde otro PC:
1. Instala `rootCA.pem` en el otro PC
2. Accede a `https://10.10.0.34:5173`

### Para migrar a otro servidor:
1. Copia el proyecto
2. Genera nuevos certificados con mkcert
3. Actualiza `backend/.env` con la nueva IP
4. Instala dependencias: `npm install` y `cd backend && npm install`
5. Compila: `npm run build`
6. Inicia: `pm2 start ecosystem.config.cjs`
7. Distribuye `rootCA.pem` a otros PCs

---

## Contacto y soporte

Si tienes problemas, verifica:
- Que ambos PCs estén en la misma red
- Que el firewall no bloquee los puertos 3000 y 5173
- Que PostgreSQL esté ejecutándose
- Que PM2 esté ejecutando los servicios
