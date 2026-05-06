# 🐳 Docker - Guía Rápida

## Inicio Rápido (Recomendado)

### Windows
```bash
docker-init.bat
```

### macOS / Linux
```bash
chmod +x docker-init.sh
./docker-init.sh
```

Esto automáticamente:
- ✅ Verifica que Docker está instalado
- ✅ Crea `backend/.env` con JWT_SECRET seguro
- ✅ Construye las imágenes
- ✅ Levanta todos los servicios
- ✅ Verifica que todo funciona

## Acceso a la Aplicación

Una vez iniciado:

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health

## Modo Desarrollo (Con Hot-Reload)

Para desarrollo con cambios en tiempo real:

```bash
docker-compose -f docker-compose.dev.yml up
```

Esto:
- Monta los directorios `src/` como volúmenes
- Ejecuta `npm run dev` en backend (nodemon)
- Ejecuta `npm run dev` en frontend (Vite)
- Los cambios se reflejan automáticamente

## Comandos Comunes

```bash
# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Reiniciar un servicio
docker-compose restart backend

# Ejecutar comando en contenedor
docker-compose exec backend npm run backup:manual

# Acceder a PostgreSQL
docker-compose exec postgres psql -U postgres -d inventory
```

## Mover a Otro Equipo

1. **Opción Simple**: Git + Docker
   ```bash
   git clone <repo>
   cd Prendas
   ./docker-init.sh  # o docker-init.bat en Windows
   ```

2. **Opción con Backup de BD**:
   ```bash
   # En equipo actual
   docker-compose exec postgres pg_dump -U postgres inventory > backup.sql
   
   # Copiar proyecto + backup.sql a otro equipo
   # En equipo nuevo
   docker-compose up -d
   docker-compose exec -T postgres psql -U postgres inventory < backup.sql
   ```

## Solución de Problemas

**Puerto en uso:**
```bash
docker-compose down
```

**Base de datos no conecta:**
```bash
docker-compose logs postgres
docker-compose restart postgres
```

**Limpiar todo:**
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Más Información

Lee `DOCKER_SETUP.md` para documentación completa.

---

**¡Listo!** Tu proyecto es completamente portable. 🚀
