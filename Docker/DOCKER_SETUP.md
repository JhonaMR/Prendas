# 🐳 Guía de Dockerización - Proyecto Prendas

## Descripción General

Este proyecto está completamente dockerizado para que puedas moverlo entre equipos sin problemas. Incluye:

- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React + Vite compilado
- **Base de Datos**: PostgreSQL 16
- **Orquestación**: Docker Compose

## Requisitos Previos

1. **Docker Desktop** instalado ([descargar](https://www.docker.com/products/docker-desktop))
2. **Docker Compose** (incluido en Docker Desktop)
3. **Git** para clonar el repositorio

## Instalación Rápida

### 1. Preparar Variables de Entorno

```bash
# En la raíz del proyecto (Prendas/)
cp backend/.env.example backend/.env
```

Edita `backend/.env` con tus valores:

```env
# Seguridad
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRES_IN=24h

# Base de Datos
DB_USER=postgres
DB_PASSWORD=tu_contraseña_segura
DB_NAME=inventory

# CORS (ajusta según tu entorno)
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Entorno
NODE_ENV=production
LOG_LEVEL=info
```

### 2. Construir y Levantar los Contenedores

```bash
# Desde la raíz del proyecto (Prendas/)
docker-compose up -d
```

Esto:
- Descarga las imágenes base
- Construye las imágenes del backend y frontend
- Crea los contenedores
- Inicia todos los servicios

### 3. Verificar que Todo Funciona

```bash
# Ver estado de los contenedores
docker-compose ps

# Ver logs del backend
docker-compose logs -f backend

# Ver logs de la base de datos
docker-compose logs -f postgres

# Ver logs del frontend
docker-compose logs -f frontend
```

### 4. Acceder a la Aplicación

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health

## Comandos Útiles

### Gestión de Contenedores

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ borra la BD)
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart backend

# Reconstruir imágenes
docker-compose build --no-cache

# Ver logs en tiempo real
docker-compose logs -f

# Ejecutar comando en un contenedor
docker-compose exec backend npm run backup:manual
```

### Acceso a la Base de Datos

```bash
# Conectar a PostgreSQL desde el contenedor
docker-compose exec postgres psql -U postgres -d inventory

# Hacer backup de la BD
docker-compose exec postgres pg_dump -U postgres inventory > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U postgres inventory < backup.sql
```

### Desarrollo

```bash
# Reconstruir después de cambios en código
docker-compose build

# Reiniciar servicios después de cambios
docker-compose restart backend frontend

# Ver logs detallados
docker-compose logs --tail=100 backend
```

## Estructura de Volúmenes

Los datos persistentes se guardan en volúmenes Docker:

```
postgres_data/          → Base de datos PostgreSQL
backend/logs/           → Logs de la aplicación
backend/backups/        → Backups automáticos
backend/database/       → Base de datos SQLite (si aplica)
```

Para ver dónde están los volúmenes en tu sistema:

```bash
docker volume inspect prendas_postgres_data
```

## Mover el Proyecto a Otro Equipo

### Opción 1: Con Git (Recomendado)

```bash
# En el equipo nuevo
git clone <tu-repositorio>
cd Prendas

# Configurar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con tus valores

# Levantar
docker-compose up -d
```

### Opción 2: Exportar/Importar Volúmenes

```bash
# En el equipo actual - Hacer backup de la BD
docker-compose exec postgres pg_dump -U postgres inventory > inventory-backup.sql

# Copiar el proyecto y el backup a otro equipo
# En el equipo nuevo
docker-compose up -d

# Restaurar la BD
docker-compose exec -T postgres psql -U postgres inventory < inventory-backup.sql
```

### Opción 3: Exportar Imágenes Docker

```bash
# En el equipo actual
docker save prendas-backend:latest > backend.tar
docker save prendas-frontend:latest > frontend.tar

# Copiar archivos a otro equipo
# En el equipo nuevo
docker load < backend.tar
docker load < frontend.tar

docker-compose up -d
```

## Solución de Problemas

### "Port 3000 is already in use"

```bash
# Cambiar puerto en docker-compose.yml
# O detener el servicio que usa el puerto
docker-compose down
```

### "Cannot connect to database"

```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps postgres

# Ver logs de PostgreSQL
docker-compose logs postgres

# Reiniciar PostgreSQL
docker-compose restart postgres
```

### "Frontend no se conecta al backend"

Verifica que `CORS_ORIGIN` en `backend/.env` incluya la URL del frontend:

```env
CORS_ORIGIN=http://localhost:3001,http://localhost:3000
```

### Limpiar todo y empezar de cero

```bash
# Detener y eliminar todo
docker-compose down -v

# Eliminar imágenes
docker rmi prendas-backend prendas-frontend

# Reconstruir
docker-compose build --no-cache

# Levantar
docker-compose up -d
```

## Configuración para Producción

### En un servidor Linux

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clonar proyecto
git clone <tu-repositorio>
cd Prendas

# Configurar variables de entorno
cp backend/.env.example backend/.env
nano backend/.env  # Editar con valores de producción

# Levantar
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### Configuración de Nginx (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoreo

### Ver uso de recursos

```bash
docker stats
```

### Logs persistentes

Los logs se guardan en `backend/logs/` y son accesibles desde el host.

## Seguridad

⚠️ **Importante para Producción:**

1. Cambiar `JWT_SECRET` a un valor único y seguro
2. Cambiar `DB_PASSWORD` a una contraseña fuerte
3. Usar HTTPS (configurar certificados SSL)
4. Limitar acceso a puertos (firewall)
5. Usar variables de entorno seguras (no en .env)
6. Hacer backups regulares de la BD

## Soporte

Si tienes problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica que Docker está corriendo: `docker ps`
3. Asegúrate de que los puertos no están en uso: `netstat -an | grep 3000`
4. Reconstruye las imágenes: `docker-compose build --no-cache`

---

**¡Listo!** Tu proyecto ahora es completamente portable entre equipos. 🚀
