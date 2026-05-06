# 🎨 Guía Visual de Docker - Proyecto Prendas

## 1. ¿Qué es Docker? (Analogía Simple)

### Sin Docker (Antes)

```
Tu Computadora
├── PostgreSQL 16 (Instalado)
├── Node.js 20 (Instalado)
├── Python 3.11 (Instalado)
├── Nginx (Instalado)
└── Otros programas...

Otro PC
├── PostgreSQL 15 (Versión diferente) ❌
├── Node.js 18 (Versión diferente) ❌
├── Python 3.9 (Versión diferente) ❌
└── Nginx (Versión diferente) ❌

Resultado: "Funciona en mi PC pero no en el tuyo" 😭
```

### Con Docker (Después)

```
Tu Computadora
├── Docker
│   ├── Contenedor 1 (PostgreSQL 16 + Node.js 20)
│   ├── Contenedor 2 (PostgreSQL 16 + Node.js 20)
│   └── Contenedor 3 (PostgreSQL 16 + Node.js 20)

Otro PC
├── Docker
│   ├── Contenedor 1 (PostgreSQL 16 + Node.js 20) ✅
│   ├── Contenedor 2 (PostgreSQL 16 + Node.js 20) ✅
│   └── Contenedor 3 (PostgreSQL 16 + Node.js 20) ✅

Resultado: "Funciona igual en todos lados" 🎉
```

---

## 2. Estructura de Docker en tu Proyecto

```
┌─────────────────────────────────────────────────────────────┐
│                    DOCKER DESKTOP                           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              CONTENEDOR BACKEND                      │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ Node.js 20 + Express                           │  │  │
│  │  │ Puerto: 3000                                   │  │  │
│  │  │ Código: /app/backend/src                       │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              CONTENEDOR FRONTEND                     │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ Node.js 20 + React + Vite                      │  │  │
│  │  │ Puerto: 3001 (dev) o 3000 (prod)              │  │  │
│  │  │ Código: /app/src                               │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              CONTENEDOR POSTGRESQL                   │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ PostgreSQL 16                                  │  │  │
│  │  │ Puerto: 5432                                   │  │  │
│  │  │ Datos: Volumen prendas_postgres_data           │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              VOLÚMENES (Datos)                       │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ prendas_postgres_data                          │  │  │
│  │  │ ├── Base de datos                              │  │  │
│  │  │ ├── Tablas                                     │  │  │
│  │  │ └── Índices                                    │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         ↓ (Mapeo de Puertos)
┌─────────────────────────────────────────────────────────────┐
│                    TU COMPUTADORA                           │
│  ├── http://localhost:3001  → Frontend                      │
│  ├── http://localhost:3000  → Backend                       │
│  └── localhost:5432         → PostgreSQL                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Flujo de Datos

### Cuando accedes a http://localhost:3001

```
1. Navegador
   ↓
2. http://localhost:3001
   ↓
3. Docker mapea puerto 3001 → Contenedor Frontend (puerto 3000)
   ↓
4. React carga en el navegador
   ↓
5. React hace petición a http://localhost:3000/api
   ↓
6. Docker mapea puerto 3000 → Contenedor Backend (puerto 3000)
   ↓
7. Backend recibe petición
   ↓
8. Backend conecta a PostgreSQL (localhost:5432)
   ↓
9. Docker mapea puerto 5432 → Contenedor PostgreSQL (puerto 5432)
   ↓
10. PostgreSQL retorna datos
    ↓
11. Backend retorna respuesta
    ↓
12. Frontend muestra datos
```

---

## 4. Ciclo de Vida de un Contenedor

```
┌─────────────────────────────────────────────────────────┐
│                    IMAGEN DOCKER                        │
│  (Plano/Plantilla - No cambia)                          │
│  ├── PostgreSQL 16                                      │
│  ├── Configuración                                      │
│  └── Scripts de inicialización                          │
└─────────────────────────────────────────────────────────┘
                        ↓
                   docker-compose up
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  CONTENEDOR CORRIENDO                   │
│  (Instancia en ejecución)                               │
│  ├── PostgreSQL 16 (activo)                             │
│  ├── Volumen montado (datos)                            │
│  └── Puerto mapeado (5432)                              │
└─────────────────────────────────────────────────────────┘
                        ↓
                   docker-compose down
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  CONTENEDOR DETENIDO                    │
│  (Datos persisten en volumen)                           │
│  ├── PostgreSQL 16 (detenido)                           │
│  ├── Volumen montado (datos intactos) ✅                │
│  └── Puerto mapeado (no disponible)                     │
└─────────────────────────────────────────────────────────┘
                        ↓
                   docker-compose down -v
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  CONTENEDOR ELIMINADO                   │
│  (Datos también eliminados) ⚠️                          │
│  ├── PostgreSQL 16 (eliminado)                          │
│  ├── Volumen (eliminado)                                │
│  └── Puerto (no disponible)                             │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Volúmenes (Datos Persistentes)

### ¿Qué es un Volumen?

```
CONTENEDOR (Temporal)
├── Código
├── Configuración
└── Procesos en ejecución

    ↓ (Monta)

VOLUMEN (Permanente)
├── Base de datos
├── Archivos
└── Datos importantes

    ↓ (Almacena en)

TU COMPUTADORA
├── Windows: C:\Users\...\AppData\Docker\volumes\
├── macOS: ~/Library/Containers/com.docker.docker/Data/
└── Linux: /var/lib/docker/volumes/
```

### Ciclo de Vida del Volumen

```
docker-compose up
    ↓
Volumen creado (si no existe)
    ↓
Datos guardados en volumen
    ↓
docker-compose down
    ↓
Volumen persiste ✅
    ↓
docker-compose up
    ↓
Datos recuperados del volumen ✅
```

---

## 6. Puertos Mapeados

### Mapeo Normal (Desarrollo)

```
docker-compose.yml:
ports:
  - "5432:5432"

Tu Computadora          Contenedor
┌──────────────┐       ┌──────────────┐
│ Puerto 5432  │ ←───→ │ Puerto 5432  │
│ (Abierto)    │       │ (PostgreSQL) │
└──────────────┘       └──────────────┘

Resultado: Cualquiera en tu red puede conectarse
```

### Mapeo Seguro (Producción)

```
docker-compose.prod.yml:
ports:
  - "127.0.0.1:5432:5432"

Tu Computadora          Contenedor
┌──────────────┐       ┌──────────────┐
│ 127.0.0.1    │ ←───→ │ Puerto 5432  │
│ Puerto 5432  │       │ (PostgreSQL) │
│ (Cerrado)    │       │              │
└──────────────┘       └──────────────┘

Resultado: Solo tú puedes conectarte desde localhost
```

---

## 7. Migración de Datos (Tu Caso)

### Situación Actual

```
Tu Computadora
├── PostgreSQL (Instalado)
│   ├── Puerto: 5433
│   ├── BD: inventory
│   └── Datos: C:\Program Files\...
└── Aplicación (Conectada a 5433)
```

### Después de Dockerizar

```
Tu Computadora
├── PostgreSQL (Instalado) - ANTIGUO
│   ├── Puerto: 5433
│   ├── BD: inventory
│   └── Datos: C:\Program Files\...
│
└── Docker
    └── PostgreSQL (Contenedor) - NUEVO
        ├── Puerto: 5432
        ├── BD: inventory (vacía)
        └── Datos: Volumen Docker
```

### Migración de Datos

```
Paso 1: Backup de BD antigua
┌──────────────────────────────┐
│ PostgreSQL (5433)            │
│ ├── Tabla: users             │
│ ├── Tabla: products          │
│ └── Tabla: orders            │
└──────────────────────────────┘
         ↓ (pg_dump)
┌──────────────────────────────┐
│ backup.sql                   │
│ (Archivo con todos los datos)│
└──────────────────────────────┘

Paso 2: Restaurar en Docker
┌──────────────────────────────┐
│ backup.sql                   │
└──────────────────────────────┘
         ↓ (psql)
┌──────────────────────────────┐
│ PostgreSQL (Docker - 5432)   │
│ ├── Tabla: users             │
│ ├── Tabla: products          │
│ └── Tabla: orders            │
└──────────────────────────────┘
```

---

## 8. Backups

### Backup Manual

```
docker-compose exec postgres pg_dump -U postgres inventory > backup.sql

PostgreSQL (Contenedor)
    ↓ (Exporta)
backup.sql (Tu Computadora)
    ↓ (Guardado en)
./backups/docker-backups/inventory-backup-2026-03-03.sql
```

### Backup Automático (Producción)

```
Cada día a las 22:00
    ↓
Script de backup ejecuta
    ↓
PostgreSQL (Contenedor)
    ↓ (Exporta)
./backend/backups/inventory-backup-YYYY-MM-DD.sql
    ↓ (Comprimido)
./backend/backups/inventory-backup-YYYY-MM-DD.sql.gz
```

---

## 9. Desarrollo vs Producción

### Desarrollo (docker-compose.dev.yml)

```
┌─────────────────────────────────────────┐
│         CONTENEDOR BACKEND              │
│  ┌───────────────────────────────────┐  │
│  │ npm run dev (nodemon)             │  │
│  │ ├── Reinicia automáticamente      │  │
│  │ ├── Logs detallados               │  │
│  │ └── Hot-reload                    │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         CONTENEDOR FRONTEND             │
│  ┌───────────────────────────────────┐  │
│  │ npm run dev (Vite)                │  │
│  │ ├── Reinicia automáticamente      │  │
│  │ ├── Hot Module Replacement        │  │
│  │ └── Cambios en tiempo real        │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

Ventaja: Desarrollo rápido y fácil debugging
```

### Producción (docker-compose.prod.yml)

```
┌─────────────────────────────────────────┐
│         CONTENEDOR BACKEND              │
│  ┌───────────────────────────────────┐  │
│  │ node src/server.js                │  │
│  │ ├── Optimizado para rendimiento   │  │
│  │ ├── Logs estructurados            │  │
│  │ └── Límites de recursos           │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         CONTENEDOR FRONTEND             │
│  ┌───────────────────────────────────┐  │
│  │ serve -s dist                     │  │
│  │ ├── Código compilado              │  │
│  │ ├── Caché optimizado              │  │
│  │ └── Compresión gzip               │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

Ventaja: Rendimiento y seguridad
```

---

## 10. Mover a Otro Equipo

### Opción 1: Git (Recomendada)

```
Equipo A (Actual)
├── Proyecto en Git
├── docker-compose.yml
├── Dockerfiles
└── backend/.env

    ↓ (git push)

GitHub/GitLab

    ↓ (git clone)

Equipo B (Nuevo)
├── Proyecto clonado
├── docker-compose.yml
├── Dockerfiles
└── backend/.env

    ↓ (docker-compose up -d)

Servicios corriendo en Equipo B ✅
```

### Opción 2: Backup de BD

```
Equipo A (Actual)
├── PostgreSQL (Contenedor)
│   └── BD: inventory
└── backup.sql

    ↓ (Copiar archivos)

Equipo B (Nuevo)
├── Proyecto
├── docker-compose up -d
└── Restaurar backup.sql

    ↓

PostgreSQL (Contenedor)
└── BD: inventory (con datos) ✅
```

---

## 11. Seguridad

### Desarrollo (Abierto)

```
┌─────────────────────────────────────────┐
│         TU RED LOCAL                    │
│  ├── Tu PC: 192.168.1.100               │
│  ├── Otro PC: 192.168.1.101             │
│  └── Otro PC: 192.168.1.102             │
└─────────────────────────────────────────┘
         ↓ (Pueden conectarse)
┌─────────────────────────────────────────┐
│    PostgreSQL (Puerto 5432 abierto)     │
│    ├── Otro PC puede conectarse ⚠️      │
│    └── No es seguro para producción     │
└─────────────────────────────────────────┘
```

### Producción (Cerrado)

```
┌─────────────────────────────────────────┐
│         SERVIDOR LINUX                  │
│  ├── Firewall habilitado                │
│  ├── SSL/TLS configurado                │
│  └── Acceso restringido                 │
└─────────────────────────────────────────┘
         ↓ (Solo localhost)
┌─────────────────────────────────────────┐
│    PostgreSQL (127.0.0.1:5432)          │
│    ├── Solo acceso local ✅             │
│    └── Seguro para producción           │
└─────────────────────────────────────────┘
```

---

## 12. Resumen Visual

```
ANTES (Sin Docker)
┌─────────────────────────────────────────┐
│ Tu PC                                   │
│ ├── PostgreSQL 16 (Instalado)           │
│ ├── Node.js 20 (Instalado)              │
│ ├── Nginx (Instalado)                   │
│ └── Otros programas...                  │
│                                         │
│ Otro PC                                 │
│ ├── PostgreSQL 15 (Diferente) ❌        │
│ ├── Node.js 18 (Diferente) ❌           │
│ └── Nginx (Diferente) ❌                │
│                                         │
│ Resultado: "No funciona en otro PC" 😭  │
└─────────────────────────────────────────┘

DESPUÉS (Con Docker)
┌─────────────────────────────────────────┐
│ Tu PC                                   │
│ └── Docker                              │
│     ├── Contenedor 1 (PostgreSQL 16)    │
│     ├── Contenedor 2 (Node.js 20)       │
│     └── Contenedor 3 (Nginx)            │
│                                         │
│ Otro PC                                 │
│ └── Docker                              │
│     ├── Contenedor 1 (PostgreSQL 16) ✅ │
│     ├── Contenedor 2 (Node.js 20) ✅    │
│     └── Contenedor 3 (Nginx) ✅         │
│                                         │
│ Resultado: "Funciona igual en todos" 🎉 │
└─────────────────────────────────────────┘
```

---

**¡Ahora entiendes cómo funciona Docker!** 🚀

Próximo paso: Ejecuta `docker-init.sh` o `docker-init.bat`
