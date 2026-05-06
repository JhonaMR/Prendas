# ✅ MONTAJE COMPLETADO - PRENDAS + MELAS

## 🎉 ¿Qué se hizo?

Se configuró el proyecto para que **ambas marcas (PRENDAS y MELAS) corran simultáneamente** en el mismo servidor con:

- ✅ Bases de datos independientes
- ✅ Puertos diferentes
- ✅ Procesos PM2 separados
- ✅ Configuración automática por puerto
- ✅ Scripts de inicio/parada
- ✅ Documentación completa

---

## 📁 Archivos Creados

### Configuración de Entorno

```
Prendas/
├── .env.prendas                    ← Configuración PRENDAS (raíz)
├── .env.melas                      ← Configuración MELAS (raíz)
├── backend/
│   ├── .env.prendas                ← Configuración PRENDAS (backend)
│   ├── .env.melas                  ← Configuración MELAS (backend)
│   └── ecosystem.config.js         ← PM2 con 8 procesos (actualizado)
└── public/
    └── config.js                   ← Detección automática de marca
```

### Scripts de Control

```
Prendas/backend/
├── start-pm2.bat                   ← Inicia ambas marcas ⭐
├── stop-pm2.bat                    ← Detiene ambas marcas
├── restart-pm2.bat                 ← Reinicia ambas marcas
├── status-pm2.bat                  ← Ver estado de procesos
├── logs-pm2.bat                    ← Ver logs en tiempo real
├── verify-setup.bat                ← Verificar instalación
├── create-databases.bat            ← Crear BDs en PostgreSQL
├── init-databases.bat              ← Inicializar tablas
└── init-databases.sql              ← Script SQL para BDs
```

### Documentación

```
Prendas/
├── SETUP_DUAL_BRANDS.md            ← Documentación completa
├── QUICK_START.md                  ← Inicio rápido (5 minutos)
├── MONTAJE_COMPLETADO.md           ← Este archivo
└── backend/
    └── AUTOSTART_SETUP.md          ← Configurar inicio automático
```

---

## 🚀 Cómo Empezar

### 1️⃣ Verificar instalación (1 minuto)

```bash
cd C:\Users\luisf\OneDrive\Desktop\Proyecto\Prendas\backend
verify-setup.bat
```

Debe mostrar ✅ en todo.

### 2️⃣ Crear bases de datos (1 minuto)

```bash
create-databases.bat
```

Crea:
- `inventory_prendas`
- `inventory_melas`

### 3️⃣ Inicializar tablas (1 minuto)

```bash
init-databases.bat
```

### 4️⃣ Iniciar ambas marcas (1 minuto)

```bash
start-pm2.bat
```

### 5️⃣ Acceder a las aplicaciones

- **PRENDAS**: http://localhost:5173
- **MELAS**: http://localhost:5174

---

## 📊 Configuración Resultante

### PRENDAS

| Componente | Valor |
|-----------|-------|
| Backend | http://localhost:3000 |
| Frontend | http://localhost:5173 |
| Base de datos | inventory_prendas |
| JWT Secret | tu_secreto_super_seguro_cambialo_123456 |

### MELAS

| Componente | Valor |
|-----------|-------|
| Backend | http://localhost:3001 |
| Frontend | http://localhost:5174 |
| Base de datos | inventory_melas |
| JWT Secret | tu_secreto_super_seguro_cambialo_123456_melas |

### PostgreSQL (Compartido)

| Parámetro | Valor |
|-----------|-------|
| Host | localhost |
| Puerto | 5433 |
| Usuario | postgres |
| Contraseña | Contrasena14. |

---

## 🔄 Procesos PM2 (8 total)

```
PRENDAS:
  1. prendas-backend              (puerto 3000)
  2. prendas-frontend             (puerto 5173)
  3. prendas-backup-scheduler     (22:00 cada día)
  4. prendas-images-backup-scheduler (23:00 cada día)

MELAS:
  5. melas-backend                (puerto 3001)
  6. melas-frontend               (puerto 5174)
  7. melas-backup-scheduler       (22:00 cada día)
  8. melas-images-backup-scheduler (23:00 cada día)
```

---

## 🎯 Características Implementadas

### ✅ Detección Automática de Marca

El frontend detecta automáticamente cuál marca es según el puerto:

```javascript
// http://localhost:5173 → PRENDAS (backend 3000)
// http://localhost:5174 → MELAS (backend 3001)
```

### ✅ Bases de Datos Independientes

Cada marca tiene su propia BD con los mismos campos y tablas:

```sql
inventory_prendas  -- Datos de PRENDAS
inventory_melas    -- Datos de MELAS
```

### ✅ Procesos Independientes

Cada marca tiene sus propios procesos PM2:

```bash
pm2 logs prendas-backend    # Logs de PRENDAS
pm2 logs melas-backend      # Logs de MELAS
```

### ✅ Backups Independientes

Cada marca hace sus propios backups:

```
backend/logs/prendas-backup-error.log
backend/logs/melas-backup-error.log
```

### ✅ PWA Independientes

Cada marca se puede instalar como app web separada:

```
Prendas PWA → http://localhost:5173
Melas PWA   → http://localhost:5174
```

---

## 📋 Comandos Disponibles

### Iniciar/Detener

```bash
start-pm2.bat       # Inicia ambas marcas
stop-pm2.bat        # Detiene ambas marcas
restart-pm2.bat     # Reinicia ambas marcas
```

### Monitoreo

```bash
status-pm2.bat      # Ver estado de procesos
logs-pm2.bat        # Ver logs en tiempo real
pm2 monit           # Monitor interactivo
```

### Configuración

```bash
verify-setup.bat    # Verificar instalación
create-databases.bat # Crear BDs
init-databases.bat  # Inicializar tablas
```

---

## 🔐 Seguridad

### JWT Secrets

Cada marca tiene su propio JWT secret:

- PRENDAS: `tu_secreto_super_seguro_cambialo_123456`
- MELAS: `tu_secreto_super_seguro_cambialo_123456_melas`

**⚠️ IMPORTANTE**: Cambia estos valores en producción.

### CORS

Cada marca tiene su propio CORS configurado:

- PRENDAS: `http://localhost:5173,http://localhost:3000,http://10.10.0.34:5173`
- MELAS: `http://localhost:5174,http://localhost:3001,http://10.10.0.34:5174`

### Certificados SSL

Ambas marcas usan los mismos certificados (puedes cambiar esto si lo necesitas).

---

## 📱 Acceso a las Aplicaciones

### Desde la misma computadora

- PRENDAS: http://localhost:5173
- MELAS: http://localhost:5174

### Desde otra computadora en la red

- PRENDAS: http://10.10.0.34:5173
- MELAS: http://10.10.0.34:5174

### Instalar como PWA

1. Abre la URL en el navegador
2. Haz clic en el ícono de instalación
3. Selecciona "Instalar"

Cada marca se instalará como una app separada.

---

## 🔄 Flujo de Datos

```
Usuario PRENDAS
    ↓
http://localhost:5173 (Frontend PRENDAS)
    ↓
http://localhost:3000/api (Backend PRENDAS)
    ↓
inventory_prendas (BD PRENDAS)

Usuario MELAS
    ↓
http://localhost:5174 (Frontend MELAS)
    ↓
http://localhost:3001/api (Backend MELAS)
    ↓
inventory_melas (BD MELAS)
```

---

## 📊 Monitoreo

### Ver estado de procesos

```bash
pm2 status
```

Mostrará algo como:

```
id │ name                          │ mode │ ↺ │ status │ ↻ │ uptime
───┼───────────────────────────────┼──────┼───┼────────┼───┼──────────
0  │ prendas-backend               │ fork │ 0 │ online │ 0 │ 2m
1  │ prendas-frontend              │ fork │ 0 │ online │ 0 │ 2m
2  │ prendas-backup-scheduler      │ fork │ 0 │ online │ 0 │ 2m
3  │ prendas-images-backup-scheduler│fork │ 0 │ online │ 0 │ 2m
4  │ melas-backend                 │ fork │ 0 │ online │ 0 │ 2m
5  │ melas-frontend                │ fork │ 0 │ online │ 0 │ 2m
6  │ melas-backup-scheduler        │ fork │ 0 │ online │ 0 │ 2m
7  │ melas-images-backup-scheduler │ fork │ 0 │ online │ 0 │ 2m
```

### Ver logs

```bash
pm2 logs                    # Todos los logs
pm2 logs prendas-backend    # Solo PRENDAS backend
pm2 logs melas-backend      # Solo MELAS backend
```

---

## 🛑 Detener Todo

```bash
stop-pm2.bat
```

O manualmente:

```bash
pm2 stop all
pm2 delete all
```

---

## 🔄 Reiniciar Todo

```bash
restart-pm2.bat
```

O manualmente:

```bash
pm2 restart all
```

---

## 📚 Documentación

- **SETUP_DUAL_BRANDS.md**: Documentación completa y detallada
- **QUICK_START.md**: Guía rápida de 5 minutos
- **AUTOSTART_SETUP.md**: Configurar inicio automático en Windows

---

## ⚠️ Notas Importantes

1. **Ambas marcas corren simultáneamente** - No necesitas detener una para usar la otra
2. **Datos independientes** - Cada marca tiene su propia BD, usuarios, inventario, etc.
3. **Certificados compartidos** - Ambas usan los mismos certificados SSL
4. **Logs separados** - Cada marca tiene sus propios logs
5. **Backups independientes** - Cada marca hace sus propios backups

---

## 🚀 Próximos Pasos

1. ✅ Ejecuta `verify-setup.bat` para verificar la instalación
2. ✅ Ejecuta `create-databases.bat` para crear las BDs
3. ✅ Ejecuta `start-pm2.bat` para iniciar ambas marcas
4. ✅ Accede a http://localhost:5173 (PRENDAS) y http://localhost:5174 (MELAS)
5. ✅ Configura los usuarios y datos para cada marca
6. ✅ Prueba los backups automáticos
7. ✅ Configura el inicio automático (opcional, ver AUTOSTART_SETUP.md)

---

## 📞 Soporte

Si algo no funciona:

1. Revisa los logs: `pm2 logs`
2. Verifica los puertos: `netstat -ano | findstr :3000`
3. Verifica las BDs: `psql -U postgres -l`
4. Revisa los archivos `.env.prendas` y `.env.melas`
5. Consulta la documentación en `SETUP_DUAL_BRANDS.md`

---

## ✨ ¡Listo!

El montaje está completado. Ambas marcas están listas para funcionar simultáneamente.

**Ejecuta `start-pm2.bat` para comenzar.**

