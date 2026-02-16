# 🚀 GUÍA DE INSTALACIÓN DEL BACKEND - Paso a Paso

## 📋 Objetivo

Instalar y configurar el backend Node.js para que esté funcionando correctamente en tu PC servidor.

**Tiempo estimado:** 30-45 minutos  
**Nivel:** Principiante (primera vez con Node.js)

---

## ✅ Pre-requisitos

Antes de empezar, asegúrate de tener:

- [ ] Windows 10/11, Linux, o macOS
- [ ] Conexión a internet (para descargar Node.js)
- [ ] 500 MB de espacio libre en disco
- [ ] Acceso de administrador en tu PC

---

## 📥 PASO 1: Instalar Node.js

### 1.1 Descargar Node.js

1. Abre tu navegador
2. Ve a: **https://nodejs.org/**
3. Descarga la versión **LTS** (recomendada) - NO la "Current"
4. Ejecuta el instalador descargado

### 1.2 Instalación en Windows

1. Doble clic en el archivo `.msi` descargado
2. Click en "Next" → "Next" → "Next"
3. **IMPORTANTE:** Marca la casilla "Automatically install the necessary tools"
4. Click en "Next" → "Install"
5. Espera a que termine (2-3 minutos)
6. Click en "Finish"

### 1.3 Instalación en Linux (Ubuntu/Debian)

```bash
# Actualizar repositorios
sudo apt update

# Instalar Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 1.4 Instalación en macOS

```bash
# Opción 1: Con Homebrew (recomendado)
brew install node@18

# Opción 2: Descargar desde nodejs.org
# Y seguir el instalador gráfico
```

### ✅ CHECKPOINT 1: Verificar Node.js instalado

Abre una **nueva** terminal/cmd y ejecuta:

```bash
node --version
```

**Deberías ver:** `v18.x.x` o `v20.x.x`

```bash
npm --version
```

**Deberías ver:** `9.x.x` o `10.x.x`

**❌ Si ves "command not found" o "no se reconoce":**
- Cierra y abre de nuevo la terminal
- Reinicia tu PC
- Verifica que Node.js se instaló correctamente

---

## 📂 PASO 2: Preparar el Proyecto

### 2.1 Ubicar los archivos

Deberías tener una carpeta llamada `inventario-backend-completo` con esta estructura:

```
inventario-backend-completo/
├── backend/              ← Aquí trabajaremos
├── frontend-integration/
├── docs/
└── README.md
```

### 2.2 Abrir terminal en la carpeta backend

**Windows:**
1. Abre el Explorador de Archivos
2. Navega a la carpeta `inventario-backend-completo/backend`
3. En la barra de direcciones, escribe `cmd` y presiona Enter
4. Se abrirá una terminal en esa ubicación

**Linux/Mac:**
```bash
cd /ruta/donde/descargaste/inventario-backend-completo/backend
```

### ✅ CHECKPOINT 2: Verificar ubicación

En la terminal, ejecuta:

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
package.json
.env.example
src/
database/  (puede que aún no exista)
```

**❌ Si no ves `package.json`:**
- Estás en la carpeta equivocada
- Navega hasta encontrar `backend/`

---

## 📦 PASO 3: Instalar Dependencias

### 3.1 Ejecutar npm install

En la terminal (dentro de `backend/`), ejecuta:

```bash
npm install
```

**Esto tomará 1-3 minutos.** Verás mucho texto en pantalla. Es normal.

### ✅ CHECKPOINT 3: Verificar instalación de dependencias

1. **Verifica que se creó la carpeta `node_modules`:**

   **Windows:**
   ```bash
   dir
   ```

   **Linux/Mac:**
   ```bash
   ls
   ```

   Deberías ver una carpeta llamada `node_modules`

2. **Verifica que no haya errores:**
   
   Al final del proceso deberías ver algo como:
   ```
   added 150 packages in 45s
   ```

**❌ Si ves errores:**

- **Error: "EACCES permission denied"** (Linux/Mac)
  ```bash
  sudo npm install
  ```

- **Error: "Cannot find package.json"**
  - Estás en la carpeta equivocada
  - Asegúrate de estar en `backend/`

- **Error: "network timeout"**
  - Problema de internet
  - Intenta de nuevo: `npm install --verbose`

---

## ⚙️ PASO 4: Configurar Variables de Entorno

### 4.1 Crear archivo .env

En la carpeta `backend/`, tienes un archivo llamado `.env.example`.  
Necesitas crear una copia llamada `.env`

**Windows (Explorador de Archivos):**
1. Abre la carpeta `backend/`
2. Busca el archivo `.env.example`
3. Haz clic derecho → Copiar
4. Pegar en la misma carpeta
5. Renombra la copia a `.env` (sin "example")

**Windows (Terminal/CMD):**
```bash
copy .env.example .env
```

**Linux/Mac (Terminal):**
```bash
cp .env.example .env
```

### 4.2 Editar el archivo .env

Abre el archivo `.env` con un editor de texto (Notepad, VS Code, etc.)

**CONTENIDO MÍNIMO para desarrollo:**

```env
# Puerto del servidor
PORT=3000

# Entorno
NODE_ENV=development

# Secreto para JWT (⚠️ IMPORTANTE: Cámbialo en producción)
JWT_SECRET=mi_secreto_super_seguro_123456

# Tiempo de expiración del token
JWT_EXPIRES_IN=24h

# Ruta de la base de datos
DATABASE_PATH=./database/inventory.db

# CORS (orígenes permitidos)
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Host (0.0.0.0 para escuchar en todas las interfaces)
HOST=0.0.0.0
```

### ✅ CHECKPOINT 4: Verificar archivo .env creado

En la terminal, ejecuta:

**Windows:**
```bash
type .env
```

**Linux/Mac:**
```bash
cat .env
```

**Deberías ver:** El contenido del archivo .env

**❌ Si dice "No se encuentra el archivo":**
- El archivo no se creó correctamente
- Asegúrate de que se llama exactamente `.env` (con punto al inicio)

---

## 🗄️ PASO 5: Crear la Base de Datos

### 5.1 Ejecutar script de inicialización

En la terminal (dentro de `backend/`), ejecuta:

```bash
npm run init-db
```

### 5.2 Qué esperar

Verás un output similar a este:

```
============================================================
🔧 INICIALIZACIÓN DE BASE DE DATOS
============================================================

📊 Inicializando base de datos...
📁 Ruta de BD: /ruta/backend/database/inventory.db
✅ Carpeta de base de datos creada
✅ Tabla users creada
✅ Tabla references creada
✅ Tabla clients creada
✅ Tabla confeccionistas creada
✅ Tabla sellers creada
✅ Tabla correrias creada
✅ Tablas receptions y reception_items creadas
✅ Tablas dispatches y dispatch_items creadas
✅ Tablas orders y order_items creadas
✅ Tabla production_tracking creada
👤 Creando usuarios por defecto...
   ✅ Usuario creado: Admin Principal (ADM / 0000) - rol: admin
   ✅ Usuario creado: Jhon Montoya (JAM / 1234) - rol: general
📦 Creando referencias de prueba...
   ✅ Referencia creada: 10210 - blusa dama
   ✅ Referencia creada: 12877 - blusa dama
   ✅ Referencia creada: 12871 - buso dama
🏢 Creando clientes de prueba...
   ✅ Cliente creado: 211 - Media naranja
   ✅ Cliente creado: 212 - La pantaleta
👔 Creando confeccionista de prueba...
   ✅ Confeccionista creado: 123 - Taller Alfa
💼 Creando vendedores de prueba...
   ✅ Vendedor creado: s1 - Carlos Vendedor
   ✅ Vendedor creado: s2 - Marta Ventas
📅 Creando correrias de prueba...
   ✅ Correría creada: c1 - Madres 2025
   ✅ Correría creada: c2 - Madres 2024

✅ Base de datos inicializada correctamente!
📍 Ubicación: /ruta/backend/database/inventory.db

============================================================
✅ PROCESO COMPLETADO EXITOSAMENTE
============================================================

📊 La base de datos está lista para usar
📍 Ubicación: /ruta/backend/database/inventory.db

👥 Usuarios creados:
   - Admin: ADM / 0000
   - General: JAM / 1234

🚀 Ahora puedes iniciar el servidor con: npm start
```

### ✅ CHECKPOINT 5: Verificar base de datos creada

1. **Verifica que se creó la carpeta `database/`:**

   ```bash
   # Windows
   dir database

   # Linux/Mac
   ls database/
   ```

   Deberías ver: `inventory.db`

2. **Verifica el tamaño del archivo:**

   El archivo `inventory.db` debe pesar al menos 20-30 KB (tiene datos de prueba)

**❌ Si no se creó la carpeta `database/`:**
- Revisa que el archivo `.env` tenga `DATABASE_PATH=./database/inventory.db`
- Intenta ejecutar de nuevo: `npm run init-db`

**❌ Si ves errores:**
- Lee el mensaje de error
- Puede ser un problema de permisos
- Intenta ejecutar como administrador

---

## 🚀 PASO 6: Iniciar el Servidor

### 6.1 Iniciar en modo normal

En la terminal, ejecuta:

```bash
npm start
```

### 6.2 Qué esperar

Verás algo como esto:

```
============================================================
🚀 SERVIDOR BACKEND INICIADO
============================================================
📍 URL Local:    http://localhost:3000
📍 URL Red:      http://192.168.1.XXX:3000
📁 Entorno:      development
🔐 CORS habilitado para: http://localhost:5173, http://localhost:3000
============================================================

✅ El backend está listo para recibir peticiones
📝 Los logs de peticiones aparecerán abajo:
```

### ✅ CHECKPOINT 6: Verificar servidor corriendo

**El servidor está corriendo cuando:**
- Ves el mensaje "SERVIDOR BACKEND INICIADO"
- La terminal se queda esperando (no vuelve al prompt)
- No hay mensajes de error en rojo

**⚠️ IMPORTANTE:** NO cierres esta terminal. El servidor debe seguir corriendo.

**❌ Si ves errores:**

- **"Error: listen EADDRINUSE"** (Puerto ocupado)
  ```
  Otro programa está usando el puerto 3000
  
  Solución 1: Cerrar el otro programa
  Solución 2: Cambiar puerto en .env
  PORT=3001
  ```

- **"Cannot find module"**
  ```bash
  npm install
  ```

- **"Database is locked"**
  ```
  Cierra todas las ventanas del servidor
  Reinicia
  ```

---

## 🧪 PASO 7: Probar el Backend

### 7.1 Prueba manual con curl (Opcional)

Abre **otra terminal nueva** (no cierres la del servidor) y ejecuta:

```bash
curl http://localhost:3000/api/health
```

**Deberías ver:**
```json
{"success":true,"message":"Backend funcionando correctamente","timestamp":"2024-..."}
```

### 7.2 Prueba manual con navegador

Abre tu navegador y ve a:

```
http://localhost:3000/api/health
```

**Deberías ver:** El mismo JSON de arriba

### 7.3 Prueba de login con curl

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"loginCode\":\"ADM\",\"pin\":\"0000\"}"
```

**Deberías ver:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "name": "Admin Principal",
      "loginCode": "ADM",
      "role": "admin"
    }
  }
}
```

### 7.4 Prueba automática con script

Abre **otra terminal nueva** y ejecuta:

```bash
npm test
```

Esto ejecutará el script `testEndpoints.js` que prueba todos los endpoints.

**Deberías ver:**
```
============================================================
🧪 TESTING DE ENDPOINTS
============================================================

📍 TEST 1: Health Check
   ✅ PASS - Servidor funcionando

📍 TEST 2: Login con usuario existente (ADM/0000)
   ✅ PASS - Login exitoso

📍 TEST 3: Login con credenciales incorrectas
   ✅ PASS - Login rechazado correctamente

📍 TEST 4: Obtener referencias
   ✅ PASS - 3 referencias obtenidas

📍 TEST 5: Crear referencia
   ✅ PASS - Referencia creada exitosamente

📍 TEST 6: Obtener clientes
   ✅ PASS - 2 clientes obtenidos

📍 TEST 7: Obtener confeccionistas
   ✅ PASS - 1 confeccionistas obtenidos

📍 TEST 8: Obtener vendedores
   ✅ PASS - 2 vendedores obtenidos

📍 TEST 9: Intentar acceder sin token
   ✅ PASS - Acceso denegado correctamente

============================================================
📊 RESUMEN DE TESTS
============================================================
✅ Tests exitosos: 9
❌ Tests fallidos: 0
📈 Total: 9
============================================================

🎉 ¡TODOS LOS TESTS PASARON! El backend está funcionando correctamente.
```

### ✅ CHECKPOINT 7: Verificar que todos los tests pasan

**✅ Si todos los tests pasan:**
- ¡Felicitaciones! El backend está funcionando perfectamente
- Puedes continuar con la integración del frontend

**❌ Si algunos tests fallan:**
- Lee el mensaje de error
- Verifica que el servidor esté corriendo
- Revisa [SOLUCION-PROBLEMAS.md](SOLUCION-PROBLEMAS.md)

---

## 📝 PASO 8: Entender los Logs

Cuando el servidor está corriendo, verás logs de cada petición:

```
[2024-02-09T10:30:45.123Z] POST /api/auth/login
[2024-02-09T10:30:50.456Z] GET /api/references
[2024-02-09T10:31:00.789Z] POST /api/clients
```

**Esto es normal y útil para debugging.**

---

## 🎯 Resumen - ¿Qué lograste?

✅ Node.js instalado y funcionando  
✅ Dependencias instaladas  
✅ Variables de entorno configuradas  
✅ Base de datos creada con datos de prueba  
✅ Servidor backend corriendo en http://localhost:3000  
✅ Todos los endpoints probados y funcionando  

---

## 🔄 Comandos para Recordar

```bash
# Iniciar servidor (modo normal)
npm start

# Iniciar servidor (modo desarrollo - auto-reinicio)
npm run dev

# Recrear base de datos (⚠️ BORRA TODOS LOS DATOS)
npm run init-db

# Probar endpoints
npm test

# Instalar dependencias
npm install

# Ver ayuda
npm run
```

---

## 🚨 Problemas Comunes

### El servidor no inicia

**Síntoma:** Error al ejecutar `npm start`

**Soluciones:**
1. Verifica que `node_modules` existe: `npm install`
2. Verifica que `.env` existe
3. Verifica que el puerto 3000 está libre
4. Revisa los logs de error en detalle

### No puedo acceder desde el navegador

**Síntoma:** `localhost:3000` no carga

**Soluciones:**
1. Verifica que el servidor esté corriendo (no cerres la terminal)
2. Usa `http://` no `https://`
3. Verifica el puerto en la URL
4. Prueba con `127.0.0.1:3000` en lugar de `localhost`

### Los tests fallan

**Síntoma:** `npm test` muestra errores

**Soluciones:**
1. Asegúrate de que el servidor esté corriendo en otra terminal
2. Verifica que la base de datos se haya creado
3. Espera 5 segundos después de iniciar el servidor antes de ejecutar tests

---

## ✅ Checklist Final

Antes de continuar con la integración del frontend, verifica:

- [ ] Node.js instalado (`node --version` funciona)
- [ ] Carpeta `node_modules` existe
- [ ] Archivo `.env` creado y configurado
- [ ] Carpeta `database/` existe con `inventory.db`
- [ ] Servidor inicia sin errores (`npm start`)
- [ ] Tests pasan (`npm test` - 9/9 exitosos)
- [ ] Puedes acceder a http://localhost:3000/api/health

**✅ Si marcaste todas:** ¡Listo para integrar el frontend!

---

## 📖 Siguiente Paso

**[GUIA-INTEGRACION-FRONTEND.md](GUIA-INTEGRACION-FRONTEND.md)** - Conectar tu React con el backend

---

## 💡 Consejos Finales

1. **No cierres la terminal del servidor** mientras trabajas
2. **Guarda los cambios en .env** antes de reiniciar
3. **Usa `npm run dev`** durante desarrollo (auto-reinicia al cambiar código)
4. **Revisa los logs** cuando algo falle
5. **Haz backup de `database/`** antes de cambios grandes

---

## 🆘 ¿Necesitas Ayuda?

Si algo no funciona:

1. ✅ Revisa que seguiste TODOS los pasos en orden
2. ✅ Lee los mensajes de error completos
3. ✅ Consulta [SOLUCION-PROBLEMAS.md](SOLUCION-PROBLEMAS.md)
4. ✅ Verifica los checkpoints uno por uno

¡No te rindas! Es normal tener problemas la primera vez. 🚀
