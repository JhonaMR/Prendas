# ❓ Preguntas Frecuentes - Docker

## 1️⃣ ¿La base de datos va a ser parte del Docker?

**Sí, pero con un matiz importante:**

### ¿Qué significa "parte del Docker"?

La **imagen** de PostgreSQL (el software) está en Docker, pero **los datos NO están en la imagen**.

```
┌─────────────────────────────────────────┐
│         CONTENEDOR DOCKER               │
│  ┌─────────────────────────────────┐    │
│  │  PostgreSQL (Software/Imagen)   │    │
│  └─────────────────────────────────┘    │
│                    ↓                     │
│  ┌─────────────────────────────────┐    │
│  │  VOLUMEN (Datos Persistentes)   │    │
│  │  - Tablas                       │    │
│  │  - Registros                    │    │
│  │  - Índices                      │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### ¿Dónde se guardan los datos?

En un **volumen Docker** llamado `prendas_postgres_data`:

```bash
# Ver volúmenes
docker volume ls

# Ver dónde está el volumen en tu sistema
docker volume inspect prendas_postgres_data
```

En Windows/macOS: Se guarda en la VM de Docker Desktop  
En Linux: Se guarda en `/var/lib/docker/volumes/`

### ¿Qué pasa si elimino el contenedor?

```bash
docker-compose down          # ← Los datos PERSISTEN
docker-compose down -v       # ← Los datos se ELIMINAN
```

**Importante**: `down` sin `-v` = datos seguros ✅  
`down -v` = borra todo ⚠️

---

## 2️⃣ ¿No tengo que ajustar tablas ni nada?

**Correcto, no tienes que hacer nada especial.**

### ¿Por qué?

Porque Docker usa **la misma PostgreSQL** que tienes ahora. Solo que en un contenedor.

### ¿Qué pasa con mis tablas actuales?

Tienes dos opciones:

### Opción A: Migrar datos actuales (Recomendado)

```bash
# 1. Hacer backup de tu BD actual
pg_dump -U postgres inventory > backup-actual.sql

# 2. Levantar Docker
docker-compose up -d

# 3. Restaurar backup en Docker
docker-compose exec -T postgres psql -U postgres inventory < backup-actual.sql

# ✅ Tus tablas están en Docker
```

### Opción B: Empezar con BD vacía

```bash
# 1. Levantar Docker
docker-compose up -d

# 2. Ejecutar scripts de inicialización (si tienes)
docker-compose exec backend npm run init-db

# ✅ BD nueva en Docker
```

### ¿Las tablas se crean automáticamente?

Depende de tu backend:

```javascript
// Si tu backend tiene esto en server.js:
const { initDatabase } = require('./config/database');
await initDatabase();  // ← Crea tablas automáticamente
```

Si lo tienes, las tablas se crean solas. Si no, necesitas:

```bash
docker-compose exec backend npm run init-db
```

---

## 3️⃣ ¿Los backups también van a estar en Docker?

**Sí, pero de forma diferente:**

### ¿Cómo funciona?

```
┌─────────────────────────────────────────┐
│         CONTENEDOR DOCKER               │
│  ┌─────────────────────────────────┐    │
│  │  PostgreSQL                     │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
           ↓ (Backup)
┌─────────────────────────────────────────┐
│  VOLUMEN: backend/backups/              │
│  - inventory-backup-2026-03-03.sql      │
│  - inventory-backup-2026-03-02.sql      │
│  - ...                                  │
└─────────────────────────────────────────┘
```

### Backup Manual

```bash
# Crear backup
docker-compose exec postgres pg_dump -U postgres inventory > backup.sql

# El archivo se guarda en tu computadora (no en Docker)
# Ubicación: Donde ejecutes el comando
```

### Backup Automático

En `docker-compose.yml` hay un volumen:

```yaml
volumes:
  - ./backend/backups:/backups:ro
```

Esto significa:
- Los backups se guardan en `./backend/backups/` (tu computadora)
- Docker puede leerlos (`:ro` = read-only)

### Scripts de Backup

Creé dos scripts para ti:

```bash
# Windows
docker-backup.bat

# macOS/Linux
./docker-backup.sh
```

Estos scripts:
1. Hacen backup automáticamente
2. Lo guardan en `./backups/docker-backups/`
3. Comprimen el archivo
4. Limpian backups antiguos (>7 días)

---

## 4️⃣ ¿De dónde salió ese puerto 127.0.0.1:5432:5432?

**Excelente pregunta. Voy a explicar:**

### Diferencia entre docker-compose.yml y docker-compose.prod.yml

#### docker-compose.yml (Normal/Desarrollo)

```yaml
ports:
  - "5432:5432"
```

Significa:
- **Primer 5432**: Puerto en tu computadora (accesible desde cualquier lugar)
- **Segundo 5432**: Puerto dentro del contenedor

**Resultado**: Cualquiera en tu red puede conectarse a `tu-ip:5432`

#### docker-compose.prod.yml (Producción)

```yaml
ports:
  - "127.0.0.1:5432:5432"
```

Significa:
- **127.0.0.1**: Solo accesible desde localhost (tu máquina)
- **Primer 5432**: Puerto en tu computadora
- **Segundo 5432**: Puerto dentro del contenedor

**Resultado**: Solo tú puedes conectarte a `localhost:5432`

### ¿Por qué la diferencia?

```
DESARROLLO (docker-compose.yml)
┌─────────────────────────────────┐
│  Tu Computadora                 │
│  ┌─────────────────────────────┐│
│  │ PostgreSQL en Docker        ││
│  │ Puerto: 5432 (abierto)      ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
         ↑ Accesible desde cualquier lugar
    (Otros PCs de la red pueden conectarse)

PRODUCCIÓN (docker-compose.prod.yml)
┌─────────────────────────────────┐
│  Servidor Linux                 │
│  ┌─────────────────────────────┐│
│  │ PostgreSQL en Docker        ││
│  │ Puerto: 5432 (cerrado)      ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
         ↑ Solo accesible localmente
    (Otros PCs NO pueden conectarse)
```

### ¿Cuál debo usar?

- **Desarrollo**: `docker-compose.yml` (normal)
- **Producción**: `docker-compose.prod.yml` (seguro)

---

## 5️⃣ ¿Mi BD está en 5433, pero Docker usa 5432?

**Excelente observación. Aquí está la solución:**

### ¿Por qué 5433 en tu BD actual?

Probablemente porque ya tenías PostgreSQL instalado en tu máquina en el puerto 5432, así que lo pusiste en 5433.

### ¿Qué pasa con Docker?

Docker crea una **BD completamente nueva** en un contenedor separado. No interfiere con tu PostgreSQL actual.

```
Tu Máquina Actual:
┌─────────────────────────────────┐
│ PostgreSQL (Instalado)          │
│ Puerto: 5433                    │
│ Datos: C:\Program Files\...     │
└─────────────────────────────────┘

Docker (Nuevo):
┌─────────────────────────────────┐
│ PostgreSQL (Contenedor)         │
│ Puerto: 5432                    │
│ Datos: Volumen Docker           │
└─────────────────────────────────┘
```

### ¿Puedo cambiar el puerto de Docker a 5433?

**Sí, pero NO lo recomiendo.** Aquí está por qué:

#### Opción 1: Cambiar puerto en docker-compose.yml (NO recomendado)

```yaml
postgres:
  ports:
    - "5433:5432"  # ← Cambiar aquí
```

**Problema**: Confunde a otros desarrolladores. El puerto estándar de PostgreSQL es 5432.

#### Opción 2: Usar ambas BDs (Recomendado)

Mantén ambas:
- Tu BD actual en 5433 (para migración)
- Docker en 5432 (para producción)

```bash
# Conectar a tu BD actual
psql -h localhost -p 5433 -U postgres

# Conectar a Docker
psql -h localhost -p 5432 -U postgres
```

#### Opción 3: Migrar y eliminar la antigua (Mejor)

```bash
# 1. Hacer backup de BD actual (5433)
pg_dump -h localhost -p 5433 -U postgres inventory > backup.sql

# 2. Levantar Docker (5432)
docker-compose up -d

# 3. Restaurar en Docker
docker-compose exec -T postgres psql -U postgres inventory < backup.sql

# 4. Desinstalar PostgreSQL antiguo (opcional)
# Así liberas puerto 5433 y evitas confusiones
```

### ¿Qué recomiendo?

1. **Mantén tu BD actual en 5433** (por ahora)
2. **Levanta Docker en 5432** (nuevo)
3. **Migra datos** con backup/restore
4. **Desinstala PostgreSQL antiguo** cuando todo funcione

---

## 📊 Resumen Visual

### Antes (Sin Docker)

```
Tu Computadora
├── PostgreSQL (Instalado)
│   ├── Puerto: 5433
│   ├── Datos: C:\Program Files\...
│   └── BD: inventory
├── Node.js (Instalado)
│   ├── Backend corriendo
│   └── Frontend corriendo
└── Problemas:
    ├── Dependencias diferentes en otro PC
    ├── Versiones incompatibles
    └── Configuración manual en cada equipo
```

### Después (Con Docker)

```
Tu Computadora
├── Docker Desktop
│   ├── Contenedor PostgreSQL
│   │   ├── Puerto: 5432
│   │   ├── Datos: Volumen Docker
│   │   └── BD: inventory
│   ├── Contenedor Backend
│   │   ├── Puerto: 3000
│   │   └── Node.js incluido
│   └── Contenedor Frontend
│       ├── Puerto: 3001
│       └── Node.js incluido
└── Ventajas:
    ├── Mismo entorno en cualquier PC
    ├── Versiones garantizadas
    └── Un comando para todo: docker-compose up -d
```

---

## 🎯 Flujo Recomendado para Ti

### Paso 1: Mantén tu BD actual (5433)

```bash
# No hagas nada, déjala como está
```

### Paso 2: Levanta Docker (5432)

```bash
./docker-init.sh  # o docker-init.bat
```

### Paso 3: Migra datos (opcional)

```bash
# Backup de BD actual
pg_dump -h localhost -p 5433 -U postgres inventory > backup.sql

# Restaurar en Docker
docker-compose exec -T postgres psql -U postgres inventory < backup.sql
```

### Paso 4: Verifica que funciona

```bash
# Conectar a Docker
docker-compose exec postgres psql -U postgres -d inventory -c "SELECT COUNT(*) FROM users;"
```

### Paso 5: Cuando todo funcione, desinstala PostgreSQL antiguo

```bash
# Windows: Panel de Control → Desinstalar programas
# macOS: brew uninstall postgresql
# Linux: sudo apt remove postgresql
```

---

## 💡 Conceptos Clave

### Imagen vs Contenedor

```
IMAGEN (Plano)
├── PostgreSQL 16
├── Node.js 20
└── Configuración

CONTENEDOR (Instancia en ejecución)
├── Copia de la imagen
├── Datos persistentes (volúmenes)
└── Puertos mapeados
```

### Volumen (Datos Persistentes)

```
Contenedor (Temporal)
    ↓
Volumen (Permanente)
    ↓
Tu Computadora (Seguro)
```

Si eliminas el contenedor, los datos en el volumen persisten.

### Puerto Mapeado

```
Tu Computadora: 5432
    ↓ (Mapeo)
Contenedor: 5432
```

Cuando conectas a `localhost:5432`, Docker redirige a `5432` dentro del contenedor.

---

## ❓ Más Preguntas Comunes

### ¿Qué pasa si reinicio mi computadora?

```bash
# Los datos persisten en volúmenes
# Solo necesitas:
docker-compose up -d
```

### ¿Puedo tener múltiples versiones de PostgreSQL?

**Sí**, cada contenedor es independiente:

```bash
# Contenedor 1: PostgreSQL 16
# Contenedor 2: PostgreSQL 15
# Ambos pueden correr simultáneamente
```

### ¿Qué pasa si quiero cambiar la contraseña de BD?

```bash
# Editar backend/.env
DB_PASSWORD=nueva_contraseña

# Reiniciar
docker-compose restart postgres
```

### ¿Puedo acceder a la BD desde otra aplicación?

**Sí**, como si fuera una BD normal:

```bash
# Desde cualquier cliente PostgreSQL
Host: localhost
Port: 5432
User: postgres
Password: (la que configuraste)
Database: inventory
```

### ¿Los backups se hacen automáticamente?

**En desarrollo**: No  
**En producción**: Sí (diarios a las 22:00)

Para desarrollo, usa:

```bash
./docker-backup.sh  # o docker-backup.bat
```

---

## 🚀 Próximos Pasos

1. **Ejecuta**: `./docker-init.sh` (o `docker-init.bat`)
2. **Verifica**: `docker-compose ps`
3. **Accede**: http://localhost:3001
4. **Migra datos** (si quieres)
5. **Lee**: [DOCKER_SETUP.md](DOCKER_SETUP.md) para más detalles

---

**¿Tienes más preguntas?** Pregunta sin miedo, es tu primera vez dockerizando. 🚀
