# 🆘 GUÍA DE SOLUCIÓN DE PROBLEMAS

## 📋 Objetivo

Resolver los problemas más comunes que puedes encontrar durante la instalación, integración y despliegue del sistema.

---

## 🔍 Cómo Usar Esta Guía

1. **Identifica tu problema** en el índice
2. **Sigue el diagnóstico** paso a paso
3. **Aplica la solución** correspondiente
4. **Verifica** que el problema se resolvió

---

## 📑 Índice de Problemas

### Instalación del Backend
- [Node.js no se instala](#problema-1-nodejs-no-se-instala)
- [npm install falla](#problema-2-npm-install-falla)
- [Base de datos no se crea](#problema-3-base-de-datos-no-se-crea)
- [Servidor no inicia](#problema-4-servidor-no-inicia)

### Integración Frontend
- [Error "Failed to fetch"](#problema-5-error-failed-to-fetch)
- [CORS error](#problema-6-cors-error)
- [Login no funciona](#problema-7-login-no-funciona)
- [401 Unauthorized](#problema-8-401-unauthorized)
- [Datos no se cargan](#problema-9-datos-no-se-cargan)

### Despliegue
- [No se puede acceder desde otro PC](#problema-10-no-se-puede-acceder-desde-otro-pc)
- [Firewall bloquea conexiones](#problema-11-firewall-bloquea-conexiones)
- [IP estática no funciona](#problema-12-ip-estática-no-funciona)

### Operación
- [Servidor se cae](#problema-13-servidor-se-cae)
- [Base de datos corrupta](#problema-14-base-de-datos-corrupta)
- [Performance lento](#problema-15-performance-lento)

---

## 🔧 PROBLEMAS DE INSTALACIÓN

### Problema 1: Node.js no se instala

**Síntomas:**
- El instalador de Node.js da error
- `node --version` no funciona después de instalar

**Diagnóstico:**

```bash
# Verificar si ya está instalado
node --version

# Verificar PATH
# Windows
echo %PATH%

# Linux/Mac
echo $PATH
```

**Soluciones:**

**Solución A: Desinstalar e instalar de nuevo**

1. Panel de Control → Programas → Desinstalar
2. Buscar "Node.js" y desinstalar
3. Reiniciar PC
4. Descargar versión LTS de nodejs.org
5. Instalar de nuevo

**Solución B: Usar nvm (Node Version Manager)**

**Windows:**
```bash
# Descargar de: https://github.com/coreybutler/nvm-windows/releases
# Instalar nvm-setup.zip
# Luego:
nvm install 18
nvm use 18
```

**Linux/Mac:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

**Solución C: Verificar permisos (Linux/Mac)**

```bash
# Dar permisos al directorio de npm
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

---

### Problema 2: npm install falla

**Síntomas:**
- Errores al ejecutar `npm install`
- "EACCES permission denied"
- "network timeout"

**Diagnóstico:**

```bash
# Ver error detallado
npm install --verbose

# Verificar conexión a internet
ping registry.npmjs.org
```

**Soluciones:**

**Solución A: Limpiar cache de npm**

```bash
npm cache clean --force
rm -rf node_modules
rm package-lock.json
npm install
```

**Solución B: Permisos (Linux/Mac)**

```bash
sudo npm install --unsafe-perm
```

**Solución C: Proxy/Firewall corporativo**

```bash
# Configurar proxy
npm config set proxy http://proxy.empresa.com:8080
npm config set https-proxy http://proxy.empresa.com:8080

# O desactivar SSL
npm config set strict-ssl false
```

**Solución D: Usar otro registro**

```bash
npm config set registry https://registry.npmmirror.com
npm install
```

---

### Problema 3: Base de datos no se crea

**Síntomas:**
- `npm run init-db` da error
- No se crea la carpeta `database/`
- "SQLITE_CANTOPEN"

**Diagnóstico:**

```bash
# Verificar permisos en la carpeta
# Windows
icacls backend

# Linux/Mac
ls -la backend/
```

**Soluciones:**

**Solución A: Crear carpeta manualmente**

```bash
cd backend
mkdir database
npm run init-db
```

**Solución B: Permisos (Linux/Mac)**

```bash
cd backend
chmod 755 .
chmod 755 database
npm run init-db
```

**Solución C: Verificar .env**

```bash
# Verificar que DATABASE_PATH esté correcta
cat .env | grep DATABASE_PATH

# Debe ser:
# DATABASE_PATH=./database/inventory.db
```

**Solución D: Eliminar BD corrupta y recrear**

```bash
cd backend
rm -rf database/
npm run init-db
```

---

### Problema 4: Servidor no inicia

**Síntomas:**
- `npm start` da error
- "Error: listen EADDRINUSE"
- "Cannot find module"

**Diagnóstico:**

```bash
# Ver qué está usando el puerto 3000
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Verificar que node_modules existe
ls node_modules/
```

**Soluciones:**

**Solución A: Puerto ocupado**

```bash
# Opción 1: Matar el proceso que usa el puerto
# Windows (reemplazar PID por el número que viste)
taskkill /PID 1234 /F

# Linux/Mac
kill -9 PID

# Opción 2: Cambiar puerto en .env
# Editar .env y cambiar:
PORT=3001
```

**Solución B: Módulos faltantes**

```bash
npm install
npm start
```

**Solución C: .env no existe**

```bash
cp .env.example .env
npm start
```

**Solución D: Error de sintaxis**

```bash
# Ver log de error completo
npm start 2>&1 | tee error.log

# Buscar línea con "SyntaxError"
# Verificar el archivo y línea indicados
```

---

## 🔗 PROBLEMAS DE INTEGRACIÓN

### Problema 5: Error "Failed to fetch"

**Síntomas:**
- En consola del navegador: "Failed to fetch"
- "TypeError: NetworkError when attempting to fetch resource"

**Diagnóstico:**

```bash
# 1. Verificar que backend esté corriendo
curl http://localhost:3000/api/health

# 2. Ver consola del navegador (F12)
# Network tab → Ver la petición fallida

# 3. Verificar URL en api.ts
cat src/services/api.ts | grep API_BASE_URL
```

**Soluciones:**

**Solución A: Backend no está corriendo**

```bash
# Terminal 1
cd backend
npm start

# Esperar a que diga "SERVIDOR INICIADO"
```

**Solución B: URL incorrecta**

En `src/services/api.ts`:

```typescript
// Debe ser:
const API_BASE_URL = 'http://localhost:3000/api';

// NO:
const API_BASE_URL = 'https://localhost:3000/api';  // ❌ https
const API_BASE_URL = 'localhost:3000/api';           // ❌ sin http://
const API_BASE_URL = 'http://localhost:3000';        // ❌ sin /api
```

**Solución C: .env.local mal configurado**

```env
# En .env.local debe ser:
VITE_API_URL=http://localhost:3000/api

# Después de cambiar, reiniciar frontend:
# Ctrl+C
npm run dev
```

---

### Problema 6: CORS error

**Síntomas:**
- "Access to fetch blocked by CORS policy"
- "No 'Access-Control-Allow-Origin' header"

**Diagnóstico:**

```bash
# Verificar CORS_ORIGIN en backend/.env
cat backend/.env | grep CORS_ORIGIN

# Ver headers en navegador
# F12 → Network → Click en petición → Headers
```

**Soluciones:**

**Solución A: Agregar origen al backend**

En `backend/.env`:

```env
# Para desarrollo
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Para producción (agregar IP del servidor)
CORS_ORIGIN=http://192.168.1.100:3000,http://localhost:5173
```

**Reiniciar backend** después de cambiar.

**Solución B: Verificar que cors está instalado**

```bash
cd backend
npm list cors

# Si no aparece:
npm install cors
```

---

### Problema 7: Login no funciona

**Síntomas:**
- Botón se queda en "Procesando..."
- Error "Credenciales inválidas" con datos correctos
- No redirige después de login

**Diagnóstico:**

```bash
# 1. Probar login con curl
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"loginCode":"ADM","pin":"0000"}'

# Debería retornar token

# 2. Ver consola del navegador (F12)
# 3. Ver logs del backend (terminal)
```

**Soluciones:**

**Solución A: Credenciales incorrectas**

Usuarios por defecto:
- `ADM / 0000`
- `JAM / 1234`

**Nota:** Login code es case-insensitive, pero PIN debe ser exacto.

**Solución B: Función handleSubmit no es async**

En `LoginView.tsx`:

```typescript
// Debe ser:
const handleSubmit = async (e: React.FormEvent) => {
  // ...
  await api.login(code, pin);
}

// NO:
const handleSubmit = (e: React.FormEvent) => {  // ❌ falta async
  api.login(code, pin);  // ❌ falta await
}
```

**Solución C: Token no se guarda**

En `src/services/api.ts`, verificar que después de login exitoso:

```typescript
if (data.success && data.data) {
  localStorage.setItem('auth_token', data.data.token);
  localStorage.setItem('current_user', JSON.stringify(data.data.user));
}
```

**Solución D: Base de datos sin usuarios**

```bash
cd backend
npm run init-db
```

---

### Problema 8: 401 Unauthorized

**Síntomas:**
- Todas las peticiones después de login dan 401
- "No se proporcionó token de autenticación"

**Diagnóstico:**

```bash
# 1. Verificar localStorage en navegador
# F12 → Application → Local Storage
# Debe haber una key "auth_token"

# 2. Verificar headers en Network tab
# F12 → Network → Click en petición → Headers
# Debe tener: Authorization: Bearer eyJhbGc...
```

**Soluciones:**

**Solución A: Token no se envía**

En `src/services/api.ts`, verificar método `getAuthHeaders()`:

```typescript
private getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}
```

Y que se use en todas las peticiones:

```typescript
const response = await fetch(`${API_BASE_URL}/references`, {
  headers: this.getAuthHeaders()  // ← IMPORTANTE
});
```

**Solución B: JWT_SECRET diferente**

Si cambiaste `JWT_SECRET` en `backend/.env` después de hacer login:

1. Logout
2. Volver a hacer login
3. O mantener el mismo `JWT_SECRET`

**Solución C: Token expirado**

Los tokens duran 24h por defecto. Si pasó ese tiempo:

1. Hacer login de nuevo
2. O aumentar `JWT_EXPIRES_IN` en `backend/.env`

---

### Problema 9: Datos no se cargan

**Síntomas:**
- Login funciona pero no se ven referencias, clientes, etc.
- Pantalla en blanco después de login

**Diagnóstico:**

```bash
# 1. Ver consola del navegador (F12)
# Buscar errores

# 2. Ver Network tab
# ¿Se hacen las peticiones GET?

# 3. Ver logs del backend
# ¿Llegan las peticiones?
```

**Soluciones:**

**Solución A: useEffect no se ejecuta**

En `App.tsx`:

```typescript
useEffect(() => {
  const loadData = async () => {
    // ... código de carga
  };

  if (currentUser) {  // ← IMPORTANTE: solo si hay usuario
    loadData();
  }
}, [currentUser]);  // ← IMPORTANTE: dependencia de currentUser
```

**Solución B: Error en la carga**

Agregar try/catch y console.log:

```typescript
const loadData = async () => {
  try {
    console.log('🔄 Cargando datos...');
    const references = await api.getReferences();
    console.log('✅ Referencias cargadas:', references.length);
    setReferences(references);
  } catch (error) {
    console.error('❌ Error:', error);
  }
};
```

**Solución C: Base de datos vacía**

```bash
cd backend
npm run init-db
```

---

## 🌐 PROBLEMAS DE DESPLIEGUE

### Problema 10: No se puede acceder desde otro PC

**Síntomas:**
- `http://192.168.1.100:3000` no carga desde otro PC
- Funciona en el servidor pero no en la red

**Diagnóstico:**

```bash
# 1. Desde el otro PC, hacer ping
ping 192.168.1.100

# 2. Ver si el puerto responde
telnet 192.168.1.100 3000

# 3. Verificar IP del servidor
ipconfig  # Windows
ip addr   # Linux/Mac
```

**Soluciones:**

**Solución A: Firewall bloqueando**

**Windows:**
1. Panel de Control → Firewall
2. Configuración avanzada
3. Nueva regla de entrada para puerto 3000
4. O temporalmente desactivar firewall

**Linux:**
```bash
sudo ufw allow 3000/tcp
sudo ufw reload
```

**Solución B: HOST incorrecto en .env**

En `backend/.env`:

```env
# Debe ser:
HOST=0.0.0.0

# NO:
HOST=localhost  # ❌ solo escucha localmente
HOST=127.0.0.1  # ❌ solo escucha localmente
```

Reiniciar backend después.

**Solución C: IP estática no configurada**

Ver [GUIA-DESPLIEGUE.md](GUIA-DESPLIEGUE.md) paso 1.

**Solución D: Router con aislamiento AP**

Algunos routers tienen "AP Isolation" que impide comunicación entre dispositivos.

1. Acceder al router (usualmente 192.168.1.1)
2. Buscar "AP Isolation" o "Client Isolation"
3. Desactivarlo

---

### Problema 11: Firewall bloquea conexiones

**Síntomas:**
- "Connection refused"
- Ping funciona pero navegador no carga

**Diagnóstico:**

```bash
# Probar sin firewall temporalmente
# Windows: Desactivar en Panel de Control
# Linux:
sudo ufw disable
# Probar acceso
# Volver a activar:
sudo ufw enable
```

**Soluciones:**

Ver [GUIA-DESPLIEGUE.md](GUIA-DESPLIEGUE.md) Paso 2.

---

### Problema 12: IP estática no funciona

**Síntomas:**
- No hay internet después de configurar IP estática
- Otros PCs no pueden hacer ping

**Diagnóstico:**

```bash
# Verificar configuración de red
ipconfig /all  # Windows
ip addr show   # Linux/Mac

# Verificar gateway
ping 192.168.1.1  # Tu router
ping 8.8.8.8      # Internet
```

**Soluciones:**

**Solución A: Gateway incorrecto**

Verificar que el gateway sea la IP de tu router (usualmente 192.168.1.1)

**Solución B: DNS incorrecto**

Usar DNS públicos:
- Primario: `8.8.8.8`
- Secundario: `8.8.4.4`

**Solución C: Conflicto de IP**

La IP estática que elegiste puede estar siendo usada por otro dispositivo:

1. Escanear red para ver IPs usadas
2. Elegir otra IP (ej: 192.168.1.150)

**Solución D: Volver a DHCP temporalmente**

Cambiar de "IP estática" a "Obtener IP automáticamente" para recuperar internet.

---

## ⚙️ PROBLEMAS DE OPERACIÓN

### Problema 13: Servidor se cae

**Síntomas:**
- Backend se detiene solo después de un tiempo
- "Error: ECONNRESET"
- Usuarios reportan desconexiones

**Diagnóstico:**

```bash
# Ver logs antes del crash
npm start 2>&1 | tee server.log

# Monitorear uso de memoria
# Windows: Task Manager
# Linux: top o htop
```

**Soluciones:**

**Solución A: Error no manejado**

Revisar el log antes del crash. Buscar:
- "UnhandledPromiseRejection"
- "SyntaxError"
- Stack trace

Corregir el error en el código.

**Solución B: Falta de memoria**

Si el servidor tiene poca RAM (<2GB):

1. Cerrar otros programas
2. Aumentar swap (Linux)
3. Reiniciar servidor periódicamente

**Solución C: PC se suspende**

Configurar PC servidor para no suspenderse:

**Windows:**
Panel de Control → Opciones de energía → Nunca suspender

**Linux:**
```bash
sudo systemctl mask sleep.target suspend.target
```

**Solución D: Usar PM2 para auto-restart**

```bash
npm install -g pm2
cd backend
pm2 start src/server.js --name inventario
pm2 startup
pm2 save
```

---

### Problema 14: Base de datos corrupta

**Síntomas:**
- "database disk image is malformed"
- "SQLITE_CORRUPT"
- Datos se pierden

**Diagnóstico:**

```bash
# Verificar integridad de la BD
cd backend
sqlite3 database/inventory.db "PRAGMA integrity_check;"
```

**Soluciones:**

**Solución A: Restaurar backup**

```bash
cd backend
# Renombrar corrupta
mv database/inventory.db database/inventory-corrupta.db
# Restaurar backup
cp database/inventory-backup-2024-02-09.db database/inventory.db
# Reiniciar
npm start
```

**Solución B: Intentar recuperar datos**

```bash
# Exportar datos rescatables
sqlite3 database/inventory.db ".dump" > dump.sql

# Crear nueva BD
rm database/inventory.db
npm run init-db

# Importar datos (puede dar errores, ignóralos)
sqlite3 database/inventory.db < dump.sql
```

**Solución C: Empezar de cero**

```bash
cd backend
rm database/inventory.db
npm run init-db
```

**⚠️ Prevención:** Hacer backups regulares (ver siguiente problema)

---

### Problema 15: Performance lento

**Síntomas:**
- Aplicación responde lento
- Peticiones toman mucho tiempo
- Base de datos crece mucho

**Diagnóstico:**

```bash
# Ver tamaño de BD
ls -lh backend/database/inventory.db

# Contar registros
sqlite3 backend/database/inventory.db "SELECT COUNT(*) FROM references;"

# Ver procesos
# Windows: Task Manager
# Linux: top
```

**Soluciones:**

**Solución A: Optimizar base de datos**

```bash
cd backend
sqlite3 database/inventory.db "VACUUM;"
sqlite3 database/inventory.db "ANALYZE;"
```

**Solución B: Limpiar datos antiguos**

Eliminar recepciones/despachos muy antiguos (soft delete mantiene integridad).

**Solución C: Índices**

Ya hay índices creados, pero si agregas tablas nuevas, crear índices:

```sql
CREATE INDEX idx_nombre ON tabla(campo);
```

**Solución D: Más RAM/CPU**

Si el servidor es muy antiguo, considerar:
- Agregar más RAM
- Cerrar programas innecesarios
- Usar SSD en lugar de HDD

---

## 🔧 HERRAMIENTAS ÚTILES

### Logs y Debugging

**Ver logs del backend:**
```bash
npm start 2>&1 | tee logs.txt
```

**Ver logs del frontend:**
```
F12 → Console
```

**Ver peticiones HTTP:**
```
F12 → Network
```

### Testing

**Probar endpoint específico:**
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"loginCode":"ADM","pin":"0000"}'

# Get con token
TOKEN="tu_token_aqui"
curl http://localhost:3000/api/references \
  -H "Authorization: Bearer $TOKEN"
```

**Probar todos los endpoints:**
```bash
cd backend
npm test
```

### Database

**Explorar base de datos:**
```bash
sqlite3 backend/database/inventory.db

# Comandos útiles:
.tables              # Ver tablas
.schema users        # Ver estructura de tabla
SELECT * FROM users; # Ver datos
.quit               # Salir
```

**Backup:**
```bash
# Crear backup
cp database/inventory.db database/backup-$(date +%Y%m%d).db

# Restaurar backup
cp database/backup-20240209.db database/inventory.db
```

---

## 📞 Checklist de Diagnóstico

Cuando tengas un problema, sigue este checklist:

### Backend
- [ ] ¿Backend está corriendo? (`ps aux | grep node` en Linux/Mac)
- [ ] ¿Puerto 3000 libre? (`netstat -ano | findstr :3000`)
- [ ] ¿.env existe y está configurado?
- [ ] ¿Base de datos existe? (`ls database/inventory.db`)
- [ ] ¿Hay errores en logs? (revisar terminal)

### Frontend
- [ ] ¿Frontend corriendo? (http://localhost:5173)
- [ ] ¿Consola tiene errores? (F12)
- [ ] ¿API_BASE_URL correcta? (ver api.ts)
- [ ] ¿Token guardado? (F12 → Application → Local Storage)

### Red
- [ ] ¿Firewall permite puerto 3000?
- [ ] ¿IP estática configurada?
- [ ] ¿Ping funciona? (`ping 192.168.1.100`)
- [ ] ¿Puerto abierto? (`telnet 192.168.1.100 3000`)

---

## 🆘 Último Recurso

Si nada funciona:

### Empezar de Cero

```bash
# 1. Backup de datos importantes
cp backend/database/inventory.db ~/backup-inventory.db

# 2. Eliminar todo
rm -rf backend/node_modules
rm -rf backend/database

# 3. Reinstalar
cd backend
npm install
npm run init-db
npm start

# 4. Probar
npm test
```

### Pedir Ayuda

Si pides ayuda, proporciona:

1. **Sistema operativo:** Windows/Linux/Mac + versión
2. **Versión de Node:** `node --version`
3. **Paso exacto donde falla**
4. **Mensaje de error completo** (screenshot o copiar/pegar)
5. **Logs del backend y frontend**
6. **¿Qué ya intentaste?**

---

## ✅ Guías Relacionadas

- [GUIA-INSTALACION-BACKEND.md](GUIA-INSTALACION-BACKEND.md)
- [GUIA-INTEGRACION-FRONTEND.md](GUIA-INTEGRACION-FRONTEND.md)
- [GUIA-DESPLIEGUE.md](GUIA-DESPLIEGUE.md)
- [README.md](../README.md)

---

¡No te rindas! Todos estos problemas tienen solución. 💪
