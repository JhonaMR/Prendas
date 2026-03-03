# ✅ Checklist de Verificación Docker

## Pre-Requisitos

- [ ] Docker Desktop instalado
- [ ] Docker Compose disponible
- [ ] Git instalado (para clonar)
- [ ] Puertos 3000, 3001, 5432 disponibles

## Instalación Inicial

- [ ] Proyecto clonado o descargado
- [ ] Estás en el directorio `Prendas/`
- [ ] Archivo `docker-init.sh` o `docker-init.bat` existe

## Ejecución del Script de Inicio

### Windows
```bash
docker-init.bat
```

Verificar:
- [ ] Script ejecutado sin errores
- [ ] `backend/.env` creado
- [ ] JWT_SECRET generado
- [ ] Imágenes construidas
- [ ] Servicios levantados

### macOS / Linux
```bash
chmod +x docker-init.sh
./docker-init.sh
```

Verificar:
- [ ] Script ejecutado sin errores
- [ ] `backend/.env` creado
- [ ] JWT_SECRET generado
- [ ] Imágenes construidas
- [ ] Servicios levantados

## Verificación de Servicios

```bash
docker-compose ps
```

Verificar que todos los servicios están `Up`:
- [ ] `prendas-postgres` - Up
- [ ] `prendas-backend` - Up
- [ ] `prendas-frontend` - Up

## Verificación de Conectividad

### Health Check del Backend

```bash
curl http://localhost:3000/api/health
```

Debe retornar:
```json
{
  "success": true,
  "message": "Servidor activo",
  "timestamp": "2026-03-03T..."
}
```

- [ ] Health check retorna 200 OK
- [ ] Mensaje "Servidor activo"

### Acceso a Frontend

Abrir en navegador:
- [ ] http://localhost:3001 - Carga correctamente
- [ ] Interfaz visible
- [ ] Sin errores en consola

### Acceso a Backend API

Abrir en navegador:
- [ ] http://localhost:3000/api - Retorna JSON
- [ ] Sin errores de conexión

## Verificación de Base de Datos

```bash
docker-compose exec postgres psql -U postgres -d inventory -c "SELECT 1;"
```

- [ ] Conexión exitosa
- [ ] Retorna `1`

### Verificar Tablas

```bash
docker-compose exec postgres psql -U postgres -d inventory -c "\dt"
```

- [ ] Tablas existen
- [ ] Estructura correcta

## Verificación de Logs

```bash
docker-compose logs -f backend
```

Verificar:
- [ ] Backend iniciado correctamente
- [ ] Conectado a PostgreSQL
- [ ] Sin errores críticos

```bash
docker-compose logs -f postgres
```

Verificar:
- [ ] PostgreSQL iniciado
- [ ] Base de datos lista
- [ ] Sin errores

```bash
docker-compose logs -f frontend
```

Verificar:
- [ ] Frontend compilado
- [ ] Servidor corriendo
- [ ] Sin errores

## Verificación de Volúmenes

```bash
docker volume ls
```

Verificar que existen:
- [ ] `prendas_postgres_data` - Volumen de BD

```bash
docker volume inspect prendas_postgres_data
```

- [ ] Volumen tiene datos
- [ ] Ruta correcta

## Verificación de Configuración

Verificar `backend/.env`:
- [ ] `NODE_ENV=production` o `development`
- [ ] `JWT_SECRET` tiene valor
- [ ] `DB_HOST=postgres`
- [ ] `DB_PASSWORD` configurado
- [ ] `CORS_ORIGIN` incluye localhost

## Verificación de Funcionalidad

### Login

1. Abrir http://localhost:3001
2. Intentar login con credenciales
3. Verificar:
   - [ ] Formulario funciona
   - [ ] Petición llega al backend
   - [ ] Respuesta correcta

### Operaciones CRUD

1. Crear un registro
2. Leer registros
3. Actualizar registro
4. Eliminar registro

Verificar:
- [ ] Todas las operaciones funcionan
- [ ] Base de datos se actualiza
- [ ] Sin errores en logs

### Backups

```bash
docker-compose exec postgres pg_dump -U postgres inventory > test-backup.sql
```

Verificar:
- [ ] Archivo creado
- [ ] Contiene datos
- [ ] Tamaño razonable

## Verificación de Rendimiento

```bash
docker stats
```

Verificar:
- [ ] CPU < 50%
- [ ] Memoria < 1GB
- [ ] Sin picos anormales

## Verificación de Seguridad

- [ ] JWT_SECRET es único (no el por defecto)
- [ ] DB_PASSWORD es fuerte
- [ ] CORS_ORIGIN es específico
- [ ] No hay credenciales en logs
- [ ] .env no está en Git

## Verificación de Portabilidad

### Backup y Restauración

```bash
# Hacer backup
docker-compose exec postgres pg_dump -U postgres inventory > backup.sql

# Detener servicios
docker-compose down -v

# Levantar nuevamente
docker-compose up -d

# Restaurar backup
docker-compose exec -T postgres psql -U postgres inventory < backup.sql
```

Verificar:
- [ ] Backup creado exitosamente
- [ ] Servicios se detienen correctamente
- [ ] Servicios se levantan nuevamente
- [ ] Backup se restaura correctamente
- [ ] Datos intactos después de restaurar

## Verificación de Desarrollo

```bash
docker-compose -f docker-compose.dev.yml up
```

Verificar:
- [ ] Servicios levantados en modo desarrollo
- [ ] Hot-reload funciona (cambiar archivo y ver cambios)
- [ ] Logs detallados disponibles
- [ ] Sin errores

## Verificación de Producción

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Verificar:
- [ ] Servicios levantados en modo producción
- [ ] Límites de recursos aplicados
- [ ] Logging estructurado
- [ ] Backups configurados

## Checklist Final

- [ ] Todos los servicios corriendo
- [ ] Health check pasando
- [ ] Frontend accesible
- [ ] Backend accesible
- [ ] Base de datos conectada
- [ ] Funcionalidad básica funcionando
- [ ] Logs sin errores críticos
- [ ] Volúmenes persistentes
- [ ] Backup/Restauración funcionando
- [ ] Seguridad verificada
- [ ] Rendimiento aceptable

## Próximos Pasos

Si todo está ✅:

1. **Desarrollo**: Usa `docker-compose.dev.yml` para desarrollo
2. **Producción**: Usa `docker-compose.prod.yml` para producción
3. **Backups**: Configura backups automáticos
4. **Monitoreo**: Configura monitoreo de logs
5. **Documentación**: Lee `DOCKER_SETUP.md` para más detalles

## Troubleshooting

Si algo no funciona:

1. Ver logs: `docker-compose logs -f`
2. Reiniciar servicios: `docker-compose restart`
3. Limpiar todo: `docker-compose down -v && docker-compose build --no-cache && docker-compose up -d`
4. Consultar `DOCKER_CHEATSHEET.md`

---

**¡Verificación completada!** ✅

Tu proyecto Docker está listo para usar. 🚀
