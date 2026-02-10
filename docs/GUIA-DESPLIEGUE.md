# 🌐 GUÍA DE DESPLIEGUE - Red Local Multi-Usuario

## 📋 Objetivo

Configurar el sistema para que 4-5 personas puedan acceder desde diferentes PCs en la misma red local (oficina/casa).

**Tiempo estimado:** 30-60 minutos  
**Nivel:** Intermedio

---

## ✅ Pre-requisitos

Antes de empezar:

- [ ] Backend funcionando en modo desarrollo
- [ ] Frontend funcionando en modo desarrollo  
- [ ] Integración completa y probada localmente
- [ ] Acceso a configuración del router (para IP estática - opcional)

---

## 🏗️ Arquitectura del Despliegue

```
┌──────────────────────────────────────────────────┐
│           RED LOCAL (192.168.1.x)                │
│                                                  │
│  PC SERVIDOR (192.168.1.100)                    │
│  ┌────────────────────────────────────────────┐ │
│  │                                             │ │
│  │  Backend (Node.js)  ← Puerto 3000          │ │
│  │  Frontend (Build)   ← Servido por Express  │ │
│  │  SQLite Database                            │ │
│  │                                             │ │
│  └────────────────────────────────────────────┘ │
│                      ▲                           │
│                      │                           │
│         ┌────────────┴────────────┐             │
│         │                         │             │
│  ┌──────┴──────┐         ┌───────┴──────┐      │
│  │  PC Cliente 1│         │ PC Cliente 2 │      │
│  │  Navegador   │         │  Navegador   │      │
│  │ 192.168.1.101│         │192.168.1.102 │      │
│  └─────────────┘         └──────────────┘      │
│                                                  │
└──────────────────────────────────────────────────┘

URL de acceso: http://192.168.1.100:3000
```

---

## 📍 PASO 1: Configurar IP Estática (Servidor)

### 1.1 Encontrar tu IP actual

**Windows:**
```bash
ipconfig
```

Busca "IPv4 Address". Ejemplo: `192.168.1.50`

**Linux/Mac:**
```bash
ifconfig
# o
ip addr show
```

Busca la IP en la sección de tu adaptador de red (ej: `192.168.1.50`)

### 1.2 Anotar información de red

Necesitarás:
- **IP actual:** `192.168.1.50` (ejemplo)
- **Máscara de subred:** `255.255.255.0` (común)
- **Gateway (router):** `192.168.1.1` (común)
- **DNS:** `8.8.8.8` (Google) o el de tu router

### 1.3 Configurar IP estática en Windows

1. **Abrir Configuración:**
   - Panel de Control → Centro de redes
   - O: Win+R → `ncpa.cpl` → Enter

2. **Seleccionar tu adaptador:**
   - Click derecho en tu conexión (Wi-Fi o Ethernet)
   - Propiedades

3. **Configurar IPv4:**
   - Doble click en "Protocolo de Internet versión 4 (TCP/IPv4)"
   - Seleccionar "Usar la siguiente dirección IP"
   
4. **Ingresar valores:**
   ```
   Dirección IP:        192.168.1.100  (la que elijas)
   Máscara de subred:   255.255.255.0
   Puerta de enlace:    192.168.1.1    (tu router)
   DNS preferido:       8.8.8.8
   DNS alternativo:     8.8.4.4
   ```

5. **Aceptar y cerrar**

6. **Verificar:**
   ```bash
   ipconfig
   ```
   
   Deberías ver tu nueva IP: `192.168.1.100`

### 1.4 Configurar IP estática en Linux/Mac

**Ubuntu/Debian:**

Editar `/etc/netplan/01-netcfg.yaml`:

```yaml
network:
  version: 2
  ethernets:
    enp0s3:  # Tu interfaz de red
      dhcp4: no
      addresses:
        - 192.168.1.100/24
      gateway4: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
```

Aplicar cambios:
```bash
sudo netplan apply
```

**macOS:**

1. System Preferences → Network
2. Seleccionar tu conexión
3. Configure IPv4: Manually
4. Ingresar IP, Subnet Mask, Router, DNS

### ✅ CHECKPOINT 1: Verificar IP estática

```bash
# Windows
ipconfig

# Linux/Mac
ip addr show
```

**Deberías ver:** Tu nueva IP estática (`192.168.1.100`)

**Prueba de conectividad:**
```bash
ping 8.8.8.8
```

**Deberías ver:** Respuestas exitosas (tiempo en ms)

---

## 🔥 PASO 2: Configurar Firewall

### 2.1 Firewall en Windows

**Opción A: Regla específica (Recomendado)**

1. **Abrir Firewall:**
   - Win+R → `wf.msc` → Enter
   - O: Panel de Control → Firewall de Windows Defender

2. **Crear regla de entrada:**
   - Click en "Reglas de entrada" (izquierda)
   - Click en "Nueva regla" (derecha)

3. **Configurar regla:**
   - Tipo: "Puerto" → Siguiente
   - Protocolo: TCP
   - Puerto: `3000`
   - Nombre: `Inventario Backend Node.js`
   - Acción: "Permitir la conexión"
   - Perfiles: Marcar todos
   - Siguiente → Finalizar

**Opción B: Desactivar firewall para red privada (Más fácil pero menos seguro)**

1. Panel de Control → Firewall de Windows
2. "Activar o desactivar Firewall de Windows Defender"
3. En "Configuración de red privada" → Desactivar
4. Aceptar

**⚠️ Advertencia:** Solo desactiva el firewall en redes confiables (tu casa/oficina)

### 2.2 Firewall en Linux (UFW)

```bash
# Permitir puerto 3000
sudo ufw allow 3000/tcp

# Verificar
sudo ufw status
```

### 2.3 Firewall en macOS

macOS generalmente permite conexiones salientes por defecto. Si tienes problemas:

1. System Preferences → Security & Privacy → Firewall
2. Click en "Firewall Options"
3. Agregar Node.js o desactivar para aplicaciones firmadas

### ✅ CHECKPOINT 2: Verificar firewall configurado

**Desde el mismo PC (servidor):**

```bash
curl http://192.168.1.100:3000/api/health
```

**Deberías ver:** `{"success":true,...}`

**Desde otro PC en la red:**

1. Abre un navegador en otro PC
2. Ve a: `http://192.168.1.100:3000/api/health`
3. **Deberías ver:** El mismo JSON

**❌ Si no funciona:**
- Verifica que el backend esté corriendo
- Verifica la IP estática
- Verifica el firewall
- Prueba hacer ping desde el otro PC: `ping 192.168.1.100`

---

## 📦 PASO 3: Compilar el Frontend para Producción

### 3.1 Actualizar .env.local del frontend

En tu proyecto React, edita `.env.local`:

**ANTES:**
```env
VITE_API_URL=http://localhost:3000/api
```

**DESPUÉS:**
```env
VITE_API_URL=http://192.168.1.100:3000/api
```

**⚠️ Importante:** Usa la IP estática que configuraste, NO `localhost`

### 3.2 Compilar el frontend

```bash
cd mi-proyecto-react
npm run build
```

**Esto creará una carpeta `dist/` con el frontend compilado.**

Deberías ver algo como:

```
vite v5.x.x building for production...
✓ 150 modules transformed.
dist/index.html                  1.23 kB
dist/assets/index-abc123.js     250.45 kB
✓ built in 3.45s
```

### 3.3 Copiar el build al backend

**Desde la carpeta de tu proyecto React:**

**Windows:**
```bash
xcopy /E /I dist ..\inventario-backend-completo\backend\frontend\dist
```

**Linux/Mac:**
```bash
cp -r dist ../inventario-backend-completo/backend/frontend/dist
```

**Resultado:** El backend ahora tiene el frontend compilado en `backend/frontend/dist/`

### ✅ CHECKPOINT 3: Verificar build copiado

```bash
cd backend/frontend/dist
```

**Windows:**
```bash
dir
```

**Linux/Mac:**
```bash
ls
```

**Deberías ver:**
```
index.html
assets/
favicon.ico
...
```

---

## ⚙️ PASO 4: Configurar Backend para Producción

### 4.1 Actualizar backend/src/server.js

El archivo ya está configurado para servir el frontend, pero verifica:

```javascript
// Línea ~85 aproximadamente
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));
```

**⚠️ Si tu build está en otra ubicación, ajusta la ruta**

### 4.2 Actualizar backend/.env para producción

```env
# ========== PRODUCCIÓN ==========

PORT=3000
NODE_ENV=production

# ⚠️ IMPORTANTE: Cambia este secreto
JWT_SECRET=TU_SECRETO_MUY_SEGURO_Y_ALEATORIO_AQUI

JWT_EXPIRES_IN=24h
DATABASE_PATH=./database/inventory.db

# CORS - Permitir acceso desde cualquier origen de la red
CORS_ORIGIN=http://192.168.1.100:3000,http://localhost:3000

# Escuchar en todas las interfaces
HOST=0.0.0.0
```

### 4.3 Generar un JWT_SECRET seguro

**Opción 1: Con Node.js**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Opción 2: Online**

Ve a: https://www.random.org/strings/

Copia el resultado en `.env`:

```env
JWT_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890abcdef123456
```

### ✅ CHECKPOINT 4: Verificar configuración

```bash
# Ver contenido de .env
# Windows
type .env

# Linux/Mac
cat .env
```

**Deberías ver:**
- `NODE_ENV=production`
- `JWT_SECRET=` con un valor largo y aleatorio
- `HOST=0.0.0.0`

---

## 🚀 PASO 5: Iniciar en Modo Producción

### 5.1 Detener modo desarrollo

Si tienes el backend corriendo, presiona `Ctrl+C` para detenerlo.

### 5.2 Iniciar en producción

```bash
cd backend
npm start
```

**Deberías ver:**

```
============================================================
🚀 SERVIDOR BACKEND INICIADO
============================================================
📍 URL Local:    http://localhost:3000
📍 URL Red:      http://192.168.1.100:3000
📁 Entorno:      production
🔐 CORS habilitado para: http://192.168.1.100:3000
============================================================

✅ El backend está listo para recibir peticiones
```

### ✅ CHECKPOINT 5: Verificar servidor en producción

**Desde el servidor (localhost):**

1. Abre navegador
2. Ve a: `http://localhost:3000`
3. **Deberías ver:** Tu aplicación React (NO "Cannot GET /")

**Desde otro PC en la red:**

1. Abre navegador
2. Ve a: `http://192.168.1.100:3000`
3. **Deberías ver:** La misma aplicación

**❌ Si ves "Cannot GET /":**
- El frontend no está compilado correctamente
- La ruta en `server.js` es incorrecta
- Verifica que `backend/frontend/dist/index.html` existe

---

## 👥 PASO 6: Probar Multi-Usuario

### 6.1 Preparar usuarios de prueba

Ya tienes 2 usuarios por defecto:
- ADM / 0000 (admin)
- JAM / 1234 (general)

**Opcional:** Crear más usuarios

Desde cualquier navegador:

1. Ve a `http://192.168.1.100:3000`
2. Click en "Registrarse"
3. Crear usuario:
   - Nombre: `Pedro Pérez`
   - Login Code: `PPE`
   - PIN: `5678`

### 6.2 Prueba desde múltiples PCs

**PC 1:**
1. Abre navegador
2. Ve a `http://192.168.1.100:3000`
3. Login con: `ADM / 0000`
4. Crea una referencia nueva: `MULTI1`

**PC 2:**
1. Abre navegador
2. Ve a `http://192.168.1.100:3000`
3. Login con: `JAM / 1234`
4. Ve a Referencias
5. **Deberías ver:** La referencia `MULTI1` que creó PC 1

**PC 3:**
1. Login con `PPE / 5678`
2. Crea un cliente nuevo
3. **Los otros PCs deberían poder ver este cliente (después de recargar)**

### ✅ CHECKPOINT 6: Verificar multi-usuario funcionando

- [ ] Varios PCs pueden acceder a la misma URL
- [ ] Cada usuario puede hacer login con sus credenciales
- [ ] Los datos creados por un usuario son visibles para otros
- [ ] No hay errores en las consolas

---

## 🔄 PASO 7: Configurar Inicio Automático (Opcional)

### 7.1 Windows - Tarea Programada

1. **Crear script de inicio:**

   Crea `backend/start.bat`:
   ```bat
   @echo off
   cd C:\ruta\completa\a\backend
   npm start
   ```

2. **Crear tarea programada:**
   - Win+R → `taskschd.msc` → Enter
   - Acción → Crear tarea básica
   - Nombre: "Inventario Backend"
   - Desencadenador: "Al iniciar el equipo"
   - Acción: "Iniciar un programa"
   - Programa: `C:\ruta\a\backend\start.bat`
   - Finalizar

### 7.2 Linux - systemd

Crear `/etc/systemd/system/inventario.service`:

```ini
[Unit]
Description=Inventario Backend
After=network.target

[Service]
Type=simple
User=tu_usuario
WorkingDirectory=/ruta/a/backend
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Activar:

```bash
sudo systemctl enable inventario
sudo systemctl start inventario
sudo systemctl status inventario
```

### 7.3 macOS - LaunchAgent

Similar a Linux, usar `launchd`

---

## 📊 PASO 8: Monitoreo y Mantenimiento

### 8.1 Ver logs del servidor

Los logs aparecen en la terminal donde ejecutaste `npm start`

**Para guardar logs en archivo:**

**Windows:**
```bash
npm start > logs.txt 2>&1
```

**Linux/Mac:**
```bash
npm start > logs.txt 2>&1 &
```

### 8.2 Backup de la base de datos

**Manual:**

```bash
# Windows
copy database\inventory.db database\inventory-backup-2024-02-09.db

# Linux/Mac
cp database/inventory.db database/inventory-backup-$(date +%Y-%m-%d).db
```

**Automático (Linux/Mac con cron):**

```bash
# Abrir crontab
crontab -e

# Agregar línea (backup diario a las 2 AM)
0 2 * * * cp /ruta/backend/database/inventory.db /ruta/backups/inventory-$(date +\%Y-\%m-\%d).db
```

### 8.3 Restaurar backup

```bash
# Detener servidor (Ctrl+C)

# Windows
copy database\inventory-backup-2024-02-09.db database\inventory.db

# Linux/Mac
cp database/inventory-backup-2024-02-09.db database/inventory.db

# Reiniciar servidor
npm start
```

---

## 🔒 PASO 9: Seguridad Adicional (Recomendado)

### 9.1 Cambiar usuarios por defecto

Los PINs de ADM y JAM son conocidos. Cámbialos:

1. Login como ADM
2. Ve a tu perfil
3. Cambiar PIN
4. Nuevo PIN: (uno que solo tú conozcas)

### 9.2 Backup regular

- Hacer backup de `database/inventory.db` semanalmente
- Guardar en ubicación segura (USB, nube, otro disco)

### 9.3 Acceso físico

- El PC servidor debe estar en ubicación segura
- Solo administradores deben tener acceso físico

---

## ✅ Checklist Final

Antes de dar por terminado el despliegue:

- [ ] IP estática configurada en servidor
- [ ] Firewall permite puerto 3000
- [ ] Frontend compilado y copiado al backend
- [ ] Backend configurado para producción (.env actualizado)
- [ ] JWT_SECRET cambiado a uno seguro
- [ ] Servidor inicia sin errores
- [ ] Accesible desde servidor: `http://localhost:3000`
- [ ] Accesible desde red: `http://192.168.1.100:3000`
- [ ] Login funciona desde diferentes PCs
- [ ] Multi-usuario probado (datos compartidos)
- [ ] Backup inicial creado
- [ ] Inicio automático configurado (opcional)
- [ ] PINs de usuarios por defecto cambiados

**✅ Si marcaste todas:** ¡Despliegue completo exitoso!

---

## 📝 Información para Usuarios

Comparte esta información con tus 4-5 usuarios:

```
==================================================
  ACCESO AL SISTEMA DE INVENTARIO
==================================================

URL de acceso:
  http://192.168.1.100:3000

Usuarios:
  - Administrador: ADM / [PIN cambiado]
  - General: JAM / [PIN cambiado]
  - Puedes crear tu propio usuario

Navegadores compatibles:
  - Google Chrome (recomendado)
  - Microsoft Edge
  - Firefox
  - Safari

Requisitos:
  - Estar conectado a la red local
  - Tener navegador actualizado

Soporte:
  - En caso de problemas, contactar a [TU NOMBRE]

==================================================
```

---

## 🆘 Problemas Comunes

### No puedo acceder desde otro PC

**Síntomas:** `http://192.168.1.100:3000` no carga

**Diagnóstico:**

1. **Ping desde el otro PC:**
   ```bash
   ping 192.168.1.100
   ```
   
   - ✅ Si responde: Problema de firewall o puerto
   - ❌ Si no responde: Problema de red/IP

2. **Verificar firewall:**
   - Temporalmente desactiva el firewall del servidor
   - ¿Funciona ahora? → Configurar regla correcta

3. **Verificar que el servidor esté corriendo:**
   ```bash
   curl http://localhost:3000/api/health
   ```

### Datos no se sincronizan entre usuarios

**Síntoma:** Usuario A crea algo, Usuario B no lo ve

**Causas:**
1. No están conectados al mismo backend
2. Usan localStorage en lugar del backend
3. Falta recargar la página

**Solución:**
1. Ambos deben usar `http://192.168.1.100:3000`
2. Verificar que el código use `api` del backend
3. Recargar la página (F5)

### El servidor se cae después de un tiempo

**Causas:**
1. Error no manejado en el código
2. PC servidor se apaga/suspende

**Solución:**
1. Revisar logs del servidor
2. Configurar PC servidor para no suspenderse
3. Usar PM2 para auto-restart (avanzado)

---

## 📖 Siguiente Paso

Si hay problemas, consulta: **[SOLUCION-PROBLEMAS.md](SOLUCION-PROBLEMAS.md)**

---

## 💡 Consejos Finales

1. **Anota la IP** del servidor en un lugar visible
2. **Documenta los usuarios** y sus roles
3. **Haz backups** semanales de la base de datos
4. **Monitorea el espacio en disco** del servidor
5. **Reinicia el servidor** si se vuelve lento (una vez por semana)

¡Tu sistema multi-usuario está listo! 🎉
