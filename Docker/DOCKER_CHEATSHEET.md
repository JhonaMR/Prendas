# 🐳 Docker - Hoja de Referencia Rápida

## Inicio Rápido

```bash
# Windows
docker-init.bat

# macOS / Linux
./docker-init.sh
```

## Acceso

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3001 |
| Backend | http://localhost:3000/api |
| Health | http://localhost:3000/api/health |

## Comandos Esenciales

### Estado y Logs

```bash
# Ver estado de servicios
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f frontend

# Ver últimas 100 líneas
docker-compose logs --tail=100
```

### Control de Servicios

```bash
# Iniciar
docker-compose up -d

# Detener
docker-compose down

# Reiniciar todo
docker-compose restart

# Reiniciar un servicio
docker-compose restart backend

# Reconstruir imágenes
docker-compose build

# Reconstruir sin caché
docker-compose build --no-cache
```

### Base de Datos

```bash
# Acceder a PostgreSQL
docker-compose exec postgres psql -U postgres -d inventory

# Hacer backup
docker-compose exec postgres pg_dump -U postgres inventory > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U postgres inventory < backup.sql

# Ver tamaño de la BD
docker-compose exec postgres psql -U postgres -d inventory -c "SELECT pg_size_pretty(pg_database_size('inventory'));"
```

### Ejecución de Comandos

```bash
# Ejecutar comando en backend
docker-compose exec backend npm run backup:manual

# Ejecutar comando en frontend
docker-compose exec frontend npm run build

# Ejecutar bash en un contenedor
docker-compose exec backend sh
```

### Desarrollo

```bash
# Modo desarrollo con hot-reload
docker-compose -f docker-compose.dev.yml up

# Modo producción
docker-compose -f docker-compose.prod.yml up -d

# Modo normal
docker-compose up -d
```

### Limpieza

```bash
# Detener y eliminar contenedores
docker-compose down

# Detener, eliminar contenedores y volúmenes (⚠️ borra BD)
docker-compose down -v

# Eliminar imágenes
docker rmi prendas-backend prendas-frontend

# Limpiar todo (contenedores, volúmenes, imágenes)
docker-compose down -v
docker rmi prendas-backend prendas-frontend
```

## Backup y Restauración

### Backup Automático

```bash
# Linux/macOS
chmod +x docker-backup.sh
./docker-backup.sh

# Windows
docker-backup.bat
```

### Backup Manual

```bash
# Crear backup
docker-compose exec postgres pg_dump -U postgres inventory > backup-$(date +%Y%m%d-%H%M%S).sql

# Restaurar
docker-compose exec -T postgres psql -U postgres inventory < backup.sql
```

## Solución de Problemas

### Puerto en uso

```bash
# Detener servicios
docker-compose down

# O cambiar puerto en docker-compose.yml
```

### Base de datos no conecta

```bash
# Ver logs de PostgreSQL
docker-compose logs postgres

# Reiniciar PostgreSQL
docker-compose restart postgres

# Verificar conexión
docker-compose exec postgres pg_isready -U postgres
```

### Frontend no se conecta al backend

```bash
# Verificar CORS_ORIGIN en backend/.env
# Debe incluir la URL del frontend

# Reiniciar backend
docker-compose restart backend
```

### Limpiar y empezar de cero

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Ver uso de recursos

```bash
docker stats
```

## Configuración

### Variables de Entorno

Editar `backend/.env`:

```env
JWT_SECRET=tu_secreto_seguro
DB_PASSWORD=tu_contraseña
CORS_ORIGIN=http://localhost:3001
```

### Puertos

Cambiar en `docker-compose.yml`:

```yaml
ports:
  - "3000:3000"  # Cambiar primer número
```

## Mover a Otro Equipo

### Opción 1: Git (Recomendado)

```bash
git clone <repo>
cd Prendas
./docker-init.sh
```

### Opción 2: Con Backup de BD

```bash
# Equipo actual
docker-compose exec postgres pg_dump -U postgres inventory > backup.sql

# Copiar proyecto + backup.sql

# Equipo nuevo
docker-compose up -d
docker-compose exec -T postgres psql -U postgres inventory < backup.sql
```

### Opción 3: Exportar Imágenes

```bash
# Equipo actual
docker save prendas-backend:latest > backend.tar
docker save prendas-frontend:latest > frontend.tar

# Equipo nuevo
docker load < backend.tar
docker load < frontend.tar
docker-compose up -d
```

## Producción

```bash
# Usar configuración de producción
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Hacer backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres inventory > backup.sql
```

## Monitoreo

```bash
# Ver estadísticas en tiempo real
docker stats

# Ver eventos
docker events

# Inspeccionar contenedor
docker inspect prendas-backend

# Ver volúmenes
docker volume ls
docker volume inspect prendas_postgres_data
```

## Recursos Útiles

- 📖 [Documentación Completa](DOCKER_SETUP.md)
- 🚀 [Guía de Inicio Rápido](README_DOCKER.md)
- 🔧 [Configuración de Producción](docker-compose.prod.yml)
- 🔐 [Configuración Nginx](nginx.conf.example)

---

**Más comandos:** `docker-compose --help`
