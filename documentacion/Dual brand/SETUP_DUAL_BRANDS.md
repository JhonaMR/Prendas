# 🚀 CONFIGURACIÓN DUAL: PRENDAS + MELAS

## Resumen

Este proyecto ahora soporta **dos marcas independientes** corriendo simultáneamente en el mismo servidor:

- **PRENDAS**: Puerto 3000 (backend) + 5173 (frontend)
- **MELAS**: Puerto 3001 (backend) + 5174 (frontend)

Cada marca tiene su propia base de datos PostgreSQL independiente.

---

## 📁 Estructura de Archivos

```
Prendas/
├── backend/
│   ├── .env.prendas          ← Configuración PRENDAS
│   ├── .env.melas            ← Configuración MELAS
│   ├── ecosystem.config.js   ← Configuración PM2 (ambas marcas)
│   ├── start-pm2.bat         ← Inicia ambas marcas
│   ├── stop-pm2.bat          ← Detiene ambas marcas
│   ├── restart-pm2.bat       ← Reinicia ambas marcas
│   ├── status-pm2.bat        ← Ver estado de procesos
│   ├── logs-pm2.bat          ← Ver logs en tiempo real
│   ├── init-databases.bat    ← Inicializar BDs
│   └── src/
│       └── server.js         ← Lee puerto del .env
├── .env.prendas              ← Configuración raíz PRENDAS
├── .env.melas                ← Configuración raíz MELAS
├── public/
│   └── config.js             ← Detecta marca por puerto
└── src/
    └── services/
        └── api.ts            ← Usa window.API_CONFIG
```

---

## 🗄️ Bases de Datos

Ambas marcas usan el **mismo servidor PostgreSQL** pero **bases de datos diferentes**:

```sql
-- PRENDAS
CREATE DATABASE inventory_prendas;

-- MELAS
CREATE DATABASE inventory_melas;
```

**Credenciales (iguales para ambas)**:
- Host: localhost
- Puerto: 5433
- Usuario: postgres
- Contraseña: Contrasena14.

---

## 🎯 Puertos

| Componente | PRENDAS | MELAS |
|-----------|---------|-------|
| Backend | 3000 | 3001 |
| Frontend | 5173 | 5174 |
| BD | 5433 | 5433 |

---

## 🚀 Cómo Iniciar

### Opción 1: Script automático (Recomendado)

```bash
# Desde C:\Users\luisf\OneDrive\Desktop\Proyecto\Prendas\backend\

start-pm2.bat
```

Esto:
1. Detiene procesos anteriores
2. Inicia 8 procesos (4 por marca):
   - Backend PRENDAS (puerto 3000)
   - Frontend PRENDAS (puerto 5173)
   - Backup scheduler PRENDAS (22:00)
   - Backup imágenes PRENDAS (23:00)
   - Backend MELAS (puerto 3001)
   - Frontend MELAS (puerto 5174)
   - Backup scheduler MELAS (22:00)
   - Backup imágenes MELAS (23:00)
3. Guarda la configuración para reinicio automático

### Opción 2: Comandos manuales

```bash
# Desde la raíz del proyecto (C:\Users\luisf\OneDrive\Desktop\Proyecto\Prendas\)

# Iniciar
pm2 start backend/ecosystem.config.js

# Ver estado
pm2 status

# Ver logs
pm2 logs

# Reiniciar
pm2 restart all

# Detener
pm2 stop all
pm2 delete all
```

---

## 🔧 Configuración de Bases de Datos

### Inicializar BDs por primera vez

```bash
# Desde C:\Users\luisf\OneDrive\Desktop\Proyecto\Prendas\backend\

init-databases.bat
```

O manualmente:

```bash
# PRENDAS
set NODE_ENV=development
node -e "require('dotenv').config({path: '.env.prendas'}); require('./src/scripts/initDatabase.js')"

# MELAS
node -e "require('dotenv').config({path: '.env.melas'}); require('./src/scripts/initDatabase.js')"
```

---

## 📊 Variables de Entorno

### PRENDAS (.env.prendas)

```env
PORT=3000
DB_NAME=inventory_prendas
JWT_SECRET=tu_secreto_super_seguro_cambialo_123456
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,http://10.10.0.34:5173
```

### MELAS (.env.melas)

```env
PORT=3001
DB_NAME=inventory_melas
JWT_SECRET=tu_secreto_super_seguro_cambialo_123456_melas
CORS_ORIGIN=http://localhost:5174,http://localhost:3001,http://10.10.0.34:5174
```

---

## 🌐 Acceso a las Aplicaciones

### PRENDAS
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Base de datos**: inventory_prendas

### MELAS
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3001/api
- **Base de datos**: inventory_melas

---

## 📱 PWA (Progressive Web App)

Ambas marcas se pueden instalar como aplicaciones web independientes:

1. Abre http://localhost:5173 (PRENDAS) o http://localhost:5174 (MELAS)
2. Haz clic en el ícono de instalación en la barra de direcciones
3. Selecciona "Instalar"

Cada una se instalará como una app separada con su propio acceso a datos.

---

## 🔄 Cómo Funciona la Detección de Marca

El archivo `public/config.js` detecta automáticamente cuál marca es según el **puerto del frontend**:

```javascript
// Si accedes a http://localhost:5173 → PRENDAS (puerto 3000)
// Si accedes a http://localhost:5174 → MELAS (puerto 3001)
```

El frontend usa `window.API_CONFIG.getApiUrl()` para obtener la URL correcta del backend.

---

## 📋 Scripts Disponibles

### En `Prendas/backend/`

| Script | Función |
|--------|---------|
| `start-pm2.bat` | Inicia ambas marcas |
| `stop-pm2.bat` | Detiene ambas marcas |
| `restart-pm2.bat` | Reinicia ambas marcas |
| `status-pm2.bat` | Ver estado de procesos |
| `logs-pm2.bat` | Ver logs en tiempo real |
| `init-databases.bat` | Inicializar BDs |

---

## 🔐 Seguridad

### Certificados SSL

Actualmente ambas marcas usan los mismos certificados. Si necesitas certificados separados:

1. Genera certificados para cada puerto
2. Actualiza `backend/src/server.js` para leer certificados según el puerto

### JWT Secrets

Cada marca tiene su propio JWT_SECRET:
- PRENDAS: `tu_secreto_super_seguro_cambialo_123456`
- MELAS: `tu_secreto_super_seguro_cambialo_123456_melas`

**⚠️ IMPORTANTE**: Cambia estos valores en producción.

---

## 📊 Monitoreo

### Ver estado de procesos

```bash
pm2 status
```

### Ver logs en tiempo real

```bash
pm2 logs
```

### Monitor interactivo

```bash
pm2 monit
```

### Ver logs de una marca específica

```bash
pm2 logs prendas-backend
pm2 logs melas-backend
pm2 logs prendas-frontend
pm2 logs melas-frontend
```

---

## 🔄 Backups Automáticos

Cada marca tiene sus propios backups programados:

- **PRENDAS**: 22:00 (BD) y 23:00 (imágenes)
- **MELAS**: 22:00 (BD) y 23:00 (imágenes)

Los backups se guardan en:
- `backend/backups/` (compartido, pero con nombres diferentes por marca)

---

## 🐛 Troubleshooting

### Los procesos no inician

```bash
# Verificar que PM2 está instalado
pm2 --version

# Si no está instalado
npm install -g pm2
```

### Puerto ya en uso

```bash
# Encontrar qué proceso usa el puerto
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# Matar el proceso (reemplaza PID)
taskkill /PID <PID> /F
```

### BD no se conecta

```bash
# Verificar que PostgreSQL está corriendo
# En Windows, verifica en Servicios (services.msc)

# Verificar credenciales en .env.prendas y .env.melas
```

### Frontend no encuentra el backend

```bash
# Verificar que config.js se cargó
# Abre la consola del navegador (F12)
# Deberías ver: "[Config] Marca detectada: Prendas" o "Melas"
```

---

## 📝 Notas Importantes

1. **Ambas marcas corren simultáneamente** - No necesitas detener una para usar la otra
2. **Datos independientes** - Cada marca tiene su propia BD, usuarios, inventario, etc.
3. **Certificados compartidos** - Ambas usan los mismos certificados SSL (puedes cambiar esto)
4. **Logs separados** - Cada marca tiene sus propios logs en `backend/logs/`
5. **Backups independientes** - Cada marca hace sus propios backups

---

## 🚀 Próximos Pasos

1. Ejecuta `start-pm2.bat` para iniciar ambas marcas
2. Accede a http://localhost:5173 (PRENDAS) y http://localhost:5174 (MELAS)
3. Verifica que ambas funcionan correctamente
4. Configura los usuarios y datos para cada marca
5. Prueba los backups automáticos

---

## 📞 Soporte

Si algo no funciona:

1. Revisa los logs: `pm2 logs`
2. Verifica los puertos: `netstat -ano | findstr :3000`
3. Verifica las BDs: `psql -U postgres -l`
4. Revisa los archivos `.env.prendas` y `.env.melas`

