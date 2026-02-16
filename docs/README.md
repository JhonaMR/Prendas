# 📦 Sistema de Inventario de Prendas - Backend + Frontend

## 🎯 ¿Qué es este proyecto?

Un sistema completo de gestión de inventario y ventas de prendas con:

- **Backend:** Node.js + Express + SQLite (centralizado)
- **Frontend:** React + TypeScript (navegador web)
- **Multi-usuario:** 4-5 personas simultáneas
- **Base de datos:** SQLite en un solo archivo

---

## 📂 Estructura del Proyecto

```
inventario-sistema/
│
├── backend/                    # Servidor Node.js (API REST)
│   ├── database/              # Base de datos SQLite (se crea automático)
│   │   └── inventory.db
│   │
│   ├── src/
│   │   ├── config/            # Configuración de BD
│   │   ├── controllers/       # Lógica del negocio
│   │   ├── middleware/        # Autenticación JWT
│   │   ├── routes/            # Endpoints del API
│   │   ├── scripts/           # Scripts útiles
│   │   └── server.js          # Servidor principal
│   │
│   ├── package.json
│   ├── .env.example
│   └── .env                   # ⚠️ Crear este archivo
│
└── frontend/                   # Tu código React
    ├── src/
    │   ├── services/
    │   │   └── api.ts         # ⭐ Servicio de API (nuevo)
    │   ├── views/
    │   ├── types.ts
    │   └── App.tsx
    ├── dist/                  # Compilado (npm run build)
    └── package.json
```

---

## 🚀 Inicio Rápido (Resumen)

### 1️⃣ Backend (10 minutos)

```bash
# 1. Ir a carpeta backend
cd backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env si es necesario

# 4. Crear base de datos
npm run init-db

# 5. Iniciar servidor
npm start
```

### 2️⃣ Frontend (5 minutos)

```bash
# 1. Copiar servicio de API
cp frontend-integration/api.ts tu-frontend/src/services/

# 2. Actualizar LoginView y App.tsx (ver guía)

# 3. Instalar y ejecutar
cd frontend
npm install
npm run dev
```

### 3️⃣ Probar (2 minutos)

```
1. Abrir navegador: http://localhost:5173
2. Login con: ADM / 0000
3. ¡Listo!
```

---

## 📚 Documentación Completa

Lee estas guías en orden:

### 🟢 Para Empezar (Primera Vez)

1. **[GUIA-INSTALACION-BACKEND.md](docs/GUIA-INSTALACION-BACKEND.md)**
   - Instalación paso a paso del backend
   - Checkpoints para verificar que funciona
   - Solución de problemas comunes
   - **Tiempo:** 30-45 minutos

2. **[GUIA-INTEGRACION-FRONTEND.md](docs/GUIA-INTEGRACION-FRONTEND.md)**
   - Cómo conectar tu React con el backend
   - Cambios necesarios en tu código
   - Ejemplos de antes/después
   - **Tiempo:** 30-45 minutos

### 🟡 Para Despliegue (Producción)

3. **[GUIA-DESPLIEGUE.md](docs/GUIA-DESPLIEGUE.md)**
   - Configurar servidor en red local
   - IP estática y firewall
   - Acceso desde otros PCs
   - **Tiempo:** 30-60 minutos

### 🔴 Si Algo Falla

4. **[SOLUCION-PROBLEMAS.md](docs/SOLUCION-PROBLEMAS.md)**
   - Errores comunes y cómo resolverlos
   - Logs y debugging
   - Preguntas frecuentes

---

## 🎓 Conceptos Básicos

### ¿Cómo funciona?

```
┌─────────────────────────────────────────────────────┐
│              RED LOCAL (Oficina/Casa)               │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐│
│  │   PC 1       │  │   PC 2       │  │   PC 3    ││
│  │              │  │              │  │           ││
│  │  Navegador   │  │  Navegador   │  │ Navegador ││
│  │    Chrome    │  │    Chrome    │  │   Chrome  ││
│  │              │  │              │  │           ││
│  │ localhost:   │  │ 192.168.1.   │  │192.168.1. ││
│  │  5173        │  │  100:3000    │  │ 100:3000  ││
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘│
│         │                 │                 │      │
│         └─────────────────┼─────────────────┘      │
│                           │                        │
│                  ┌────────▼──────────┐             │
│                  │  SERVIDOR (PC 1)  │             │
│                  │  192.168.1.100    │             │
│                  │                   │             │
│                  │  ┌─────────────┐  │             │
│                  │  │  Backend    │  │             │
│                  │  │  Node.js    │  │             │
│                  │  │  Port 3000  │  │             │
│                  │  └──────┬──────┘  │             │
│                  │         │         │             │
│                  │  ┌──────▼──────┐  │             │
│                  │  │  SQLite DB  │  │             │
│                  │  │ inventory.db│  │             │
│                  │  └─────────────┘  │             │
│                  └───────────────────┘             │
└─────────────────────────────────────────────────────┘
```

**Flujo de datos:**
1. Usuario abre navegador → `http://192.168.1.100:3000`
2. Frontend React se carga en el navegador
3. Usuario hace login → Frontend envía petición al Backend
4. Backend verifica en SQLite → Devuelve token JWT
5. Frontend guarda token y hace peticiones autenticadas
6. Todos los usuarios acceden a la misma base de datos

### ¿Qué es cada cosa?

- **Backend (Node.js + Express):** Servidor que maneja la lógica y la base de datos
- **Frontend (React):** Interfaz de usuario que corre en el navegador
- **SQLite:** Base de datos en un archivo (inventory.db)
- **API REST:** Forma de comunicación entre frontend y backend
- **JWT:** Token de autenticación (como una llave temporal)

---

## 🔐 Usuarios por Defecto

| Usuario | Login Code | PIN | Rol | Descripción |
|---------|-----------|-----|-----|-------------|
| Admin Principal | `ADM` | `0000` | admin | Acceso total |
| Jhon Montoya | `JAM` | `1234` | general | Usuario normal |

---

## 📊 Base de Datos

### Tablas Creadas Automáticamente

1. **users** - Usuarios del sistema
2. **references** - Referencias/productos
3. **clients** - Clientes
4. **confeccionistas** - Proveedores
5. **sellers** - Vendedores
6. **correrias** - Campañas de ventas
7. **receptions** + **reception_items** - Recepciones de mercancía
8. **dispatches** + **dispatch_items** - Despachos
9. **orders** + **order_items** - Pedidos
10. **production_tracking** - Seguimiento de producción

### Ubicación de la Base de Datos

```
backend/database/inventory.db
```

Es un solo archivo que contiene toda la información.

---

## 🛠️ Comandos Útiles

### Backend

```bash
# Instalar dependencias
npm install

# Crear/reiniciar base de datos
npm run init-db

# Iniciar servidor (modo normal)
npm start

# Iniciar servidor (modo desarrollo - auto-reinicio)
npm run dev

# Probar endpoints del API
npm test
```

### Frontend

```bash
# Instalar dependencias
npm install

# Desarrollo (hot reload)
npm run dev

# Compilar para producción
npm run build

# Vista previa de build
npm run preview
```

---

## 🔍 Endpoints del API

Todos los endpoints empiezan con `/api`

### Públicos (No requieren autenticación)

```
POST   /api/auth/login         - Login
POST   /api/auth/register      - Registro
GET    /api/health             - Estado del servidor
```

### Protegidos (Requieren token JWT)

```
# Autenticación
POST   /api/auth/change-pin    - Cambiar PIN
GET    /api/auth/users         - Listar usuarios (admin)

# Referencias
GET    /api/references         - Obtener todas
POST   /api/references         - Crear nueva
PUT    /api/references/:id     - Actualizar
DELETE /api/references/:id     - Eliminar

# Clientes
GET    /api/clients            - Obtener todos
POST   /api/clients            - Crear nuevo
PUT    /api/clients/:id        - Actualizar
DELETE /api/clients/:id        - Eliminar

# Confeccionistas
GET    /api/confeccionistas    - Obtener todos
POST   /api/confeccionistas    - Crear nuevo
PUT    /api/confeccionistas/:id - Actualizar
DELETE /api/confeccionistas/:id - Eliminar

# Vendedores
GET    /api/sellers            - Obtener todos
POST   /api/sellers            - Crear nuevo

# Correrias
GET    /api/correrias          - Obtener todas
POST   /api/correrias          - Crear nueva

# Recepciones
GET    /api/receptions         - Obtener todas
POST   /api/receptions         - Crear nueva

# Despachos
GET    /api/dispatches         - Obtener todos
POST   /api/dispatches         - Crear nuevo

# Pedidos
GET    /api/orders             - Obtener todos
POST   /api/orders             - Crear nuevo

# Producción
GET    /api/production         - Obtener tracking
POST   /api/production         - Actualizar tracking
```

---

## 🧪 Cómo Probar que Funciona

### Checkpoint 1: Backend corriendo

```bash
# Terminal 1
cd backend
npm start

# Deberías ver:
# 🚀 SERVIDOR BACKEND INICIADO
# 📍 URL Local: http://localhost:3000
```

### Checkpoint 2: Health check

```bash
# Terminal 2
curl http://localhost:3000/api/health

# Deberías ver:
# {"success":true,"message":"Backend funcionando correctamente"}
```

### Checkpoint 3: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"loginCode":"ADM","pin":"0000"}'

# Deberías ver:
# {"success":true,"message":"Login exitoso","data":{"token":"...","user":{...}}}
```

### Checkpoint 4: Frontend + Backend

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev

# Navegador: http://localhost:5173
# Login: ADM / 0000
# Deberías entrar al sistema
```

---

## 🆘 Problemas Comunes

### "No se puede conectar al servidor"

```bash
# 1. Verificar que el backend esté corriendo
cd backend
npm start

# 2. Verificar que el puerto 3000 esté libre
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

### "Error: Cannot find module"

```bash
# Reinstalar dependencias
cd backend
rm -rf node_modules
npm install
```

### "Database locked"

```bash
# Cerrar todas las instancias del servidor
# Reiniciar
npm start
```

### "CORS error"

```bash
# Verificar que .env tenga:
# CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

---

## 📈 Próximos Pasos

1. ✅ Leer README.md (este archivo) ← Estás aquí
2. 📖 Seguir [GUIA-INSTALACION-BACKEND.md](docs/GUIA-INSTALACION-BACKEND.md)
3. 📖 Seguir [GUIA-INTEGRACION-FRONTEND.md](docs/GUIA-INTEGRACION-FRONTEND.md)
4. 🚀 Desplegar con [GUIA-DESPLIEGUE.md](docs/GUIA-DESPLIEGUE.md)

---

## 💡 Consejos

- **Primera vez:** Sigue las guías paso a paso, no te saltes checkpoints
- **Problemas:** Revisa [SOLUCION-PROBLEMAS.md](docs/SOLUCION-PROBLEMAS.md) antes de preguntar
- **Testing:** Ejecuta `npm test` en el backend para verificar endpoints
- **Desarrollo:** Usa `npm run dev` para auto-reinicio al hacer cambios
- **Producción:** Siempre usa `npm start` y cambia JWT_SECRET en .env

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs en la terminal del backend
2. Abre DevTools en el navegador (F12) y revisa la consola
3. Lee [SOLUCION-PROBLEMAS.md](docs/SOLUCION-PROBLEMAS.md)
4. Verifica que seguiste todos los pasos en orden

---

## 🎉 ¡Éxito!

Si llegaste hasta aquí y todo funciona, ¡felicitaciones! Tienes un sistema completo de inventario funcionando.

**Próximo paso:** [GUIA-INSTALACION-BACKEND.md](docs/GUIA-INSTALACION-BACKEND.md)
