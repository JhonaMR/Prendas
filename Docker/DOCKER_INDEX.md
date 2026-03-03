# 📚 Índice de Documentación Docker

## 🚀 Comienza Aquí

### Para Empezar Rápido
1. **[README_DOCKER.md](README_DOCKER.md)** - Guía de inicio en 5 minutos
2. **[DOCKER_SUMMARY.md](DOCKER_SUMMARY.md)** - Resumen de lo que se hizo
3. **[DOCKER_FAQ.md](DOCKER_FAQ.md)** - Preguntas frecuentes (¡Lee esto primero si tienes dudas!)

### Scripts de Inicio
- **Windows**: `docker-init.bat` - Ejecuta esto primero
- **macOS/Linux**: `./docker-init.sh` - Ejecuta esto primero

---

## 📖 Documentación Completa

### Guías Principales

| Documento | Propósito | Audiencia |
|-----------|-----------|-----------|
| **[DOCKER_FAQ.md](DOCKER_FAQ.md)** | Preguntas frecuentes y conceptos | Principiantes |
| **[DOCKER_SETUP.md](DOCKER_SETUP.md)** | Documentación completa y detallada | Todos |
| **[DOCKER_CHEATSHEET.md](DOCKER_CHEATSHEET.md)** | Referencia rápida de comandos | Desarrolladores |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Guía de despliegue en producción | DevOps/Administradores |
| **[DOCKER_VERIFICATION.md](DOCKER_VERIFICATION.md)** | Checklist de verificación | Todos |

---

## 🔧 Archivos de Configuración

### Docker Compose

| Archivo | Uso | Cuándo Usar |
|---------|-----|-----------|
| **docker-compose.yml** | Configuración normal | Producción estándar |
| **docker-compose.dev.yml** | Desarrollo con hot-reload | Desarrollo local |
| **docker-compose.prod.yml** | Optimizado para producción | Servidor de producción |

### Dockerfiles

| Archivo | Propósito |
|---------|-----------|
| **Dockerfile.backend** | Imagen del backend (Node.js) |
| **Dockerfile.frontend** | Imagen del frontend compilado |
| **Dockerfile.frontend.dev** | Imagen del frontend en desarrollo |

### Variables de Entorno

| Archivo | Propósito |
|---------|-----------|
| **.env.docker.example** | Ejemplo para Docker |
| **.env.prod.example** | Ejemplo para producción |
| **backend/.env** | Configuración real (no versionado) |

### Otros

| Archivo | Propósito |
|---------|-----------|
| **.dockerignore** | Archivos a ignorar en imagen |
| **nginx.conf.example** | Configuración Nginx como reverse proxy |

---

## 🚀 Scripts Útiles

### Inicio

| Script | Sistema | Propósito |
|--------|---------|-----------|
| **docker-init.bat** | Windows | Inicialización automática |
| **docker-init.sh** | macOS/Linux | Inicialización automática |

### Backup

| Script | Sistema | Propósito |
|--------|---------|-----------|
| **docker-backup.bat** | Windows | Backup de base de datos |
| **docker-backup.sh** | macOS/Linux | Backup de base de datos |

---

## 📋 Guías por Caso de Uso

### 👨‍💻 Desarrollo Local

1. Leer: [README_DOCKER.md](README_DOCKER.md)
2. Ejecutar: `./docker-init.sh` o `docker-init.bat`
3. Usar: `docker-compose -f docker-compose.dev.yml up`
4. Referencia: [DOCKER_CHEATSHEET.md](DOCKER_CHEATSHEET.md)

### 🚀 Despliegue en Producción

1. Leer: [DEPLOYMENT.md](DEPLOYMENT.md)
2. Preparar servidor: Seguir pasos en DEPLOYMENT.md
3. Usar: `docker-compose -f docker-compose.prod.yml up -d`
4. Monitorear: Ver sección de monitoreo en DEPLOYMENT.md

### 🔄 Mover a Otro Equipo

1. Opción 1 (Recomendada): Git + `docker-init.sh`
2. Opción 2: Backup de BD + copiar proyecto
3. Opción 3: Exportar imágenes Docker
4. Ver detalles en: [DOCKER_SETUP.md](DOCKER_SETUP.md#mover-el-proyecto-a-otro-equipo)

### 💾 Backup y Restauración

1. Backup manual: `docker-compose exec postgres pg_dump -U postgres inventory > backup.sql`
2. Backup automático: Ver [DEPLOYMENT.md](DEPLOYMENT.md#backups-automáticos)
3. Restaurar: `docker-compose exec -T postgres psql -U postgres inventory < backup.sql`
4. Más detalles: [DOCKER_CHEATSHEET.md](DOCKER_CHEATSHEET.md#backup-y-restauración)

### 🔍 Solución de Problemas

1. Ver logs: `docker-compose logs -f`
2. Consultar: [DOCKER_CHEATSHEET.md](DOCKER_CHEATSHEET.md#solución-de-problemas)
3. Limpiar: `docker-compose down -v && docker-compose build --no-cache`
4. Verificar: [DOCKER_VERIFICATION.md](DOCKER_VERIFICATION.md)

---

## 🎯 Comandos Rápidos

### Inicio y Control

```bash
# Iniciar (automático)
./docker-init.sh          # macOS/Linux
docker-init.bat           # Windows

# Iniciar (manual)
docker-compose up -d

# Ver estado
docker-compose ps

# Detener
docker-compose down

# Reiniciar
docker-compose restart
```

### Logs y Debugging

```bash
# Ver todos los logs
docker-compose logs -f

# Ver logs de un servicio
docker-compose logs -f backend

# Ver últimas líneas
docker-compose logs --tail=100
```

### Base de Datos

```bash
# Acceder a PostgreSQL
docker-compose exec postgres psql -U postgres -d inventory

# Hacer backup
docker-compose exec postgres pg_dump -U postgres inventory > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U postgres inventory < backup.sql
```

### Desarrollo

```bash
# Modo desarrollo con hot-reload
docker-compose -f docker-compose.dev.yml up

# Modo producción
docker-compose -f docker-compose.prod.yml up -d

# Reconstruir imágenes
docker-compose build --no-cache
```

---

## 📊 Estructura del Proyecto

```
Prendas/
├── 📚 DOCUMENTACIÓN
│   ├── DOCKER_INDEX.md              ← Estás aquí
│   ├── README_DOCKER.md             ← Inicio rápido
│   ├── DOCKER_SUMMARY.md            ← Resumen
│   ├── DOCKER_SETUP.md              ← Documentación completa
│   ├── DOCKER_CHEATSHEET.md         ← Referencia de comandos
│   ├── DEPLOYMENT.md                ← Despliegue en producción
│   └── DOCKER_VERIFICATION.md       ← Checklist de verificación
│
├── 🐳 CONFIGURACIÓN DOCKER
│   ├── docker-compose.yml           ← Normal
│   ├── docker-compose.dev.yml       ← Desarrollo
│   ├── docker-compose.prod.yml      ← Producción
│   ├── Dockerfile.backend           ← Backend
│   ├── Dockerfile.frontend          ← Frontend (prod)
│   ├── Dockerfile.frontend.dev      ← Frontend (dev)
│   └── .dockerignore                ← Archivos a ignorar
│
├── 🚀 SCRIPTS
│   ├── docker-init.sh               ← Inicio (Linux/macOS)
│   ├── docker-init.bat              ← Inicio (Windows)
│   ├── docker-backup.sh             ← Backup (Linux/macOS)
│   └── docker-backup.bat            ← Backup (Windows)
│
├── ⚙️ CONFIGURACIÓN
│   ├── .env.docker.example          ← Variables (Docker)
│   ├── .env.prod.example            ← Variables (Producción)
│   ├── nginx.conf.example           ← Nginx
│   └── backend/.env                 ← Configuración real
│
├── 🔄 CI/CD
│   └── .github/workflows/docker-build.yml
│
└── 📁 PROYECTO
    ├── backend/                     ← Backend Node.js
    ├── src/                         ← Frontend React
    ├── public/                      ← Archivos estáticos
    └── ...
```

---

## 🎓 Flujo de Aprendizaje Recomendado

### Nivel 1: Principiante
1. Leer [DOCKER_FAQ.md](DOCKER_FAQ.md) - Entiende los conceptos
2. Leer [README_DOCKER.md](README_DOCKER.md) - Guía rápida
3. Ejecutar `docker-init.sh` o `docker-init.bat`
4. Acceder a http://localhost:3001
5. Explorar la interfaz

### Nivel 2: Intermedio
1. Leer [DOCKER_SETUP.md](DOCKER_SETUP.md)
2. Aprender comandos en [DOCKER_CHEATSHEET.md](DOCKER_CHEATSHEET.md)
3. Hacer backups y restauraciones
4. Cambiar configuración en `.env`

### Nivel 3: Avanzado
1. Leer [DEPLOYMENT.md](DEPLOYMENT.md)
2. Desplegar en servidor Linux
3. Configurar Nginx y SSL
4. Configurar backups automáticos
5. Monitorear en producción

---

## 🔗 Enlaces Útiles

### Documentación Oficial
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)

### Herramientas Recomendadas
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Portainer](https://www.portainer.io/) - Interfaz web para Docker
- [Let's Encrypt](https://letsencrypt.org/) - Certificados SSL gratuitos

### Tutoriales
- [Docker Tutorial](https://docs.docker.com/get-started/)
- [Docker Compose Tutorial](https://docs.docker.com/compose/gettingstarted/)

---

## ❓ Preguntas Frecuentes

**¿Tienes dudas sobre Docker?** Lee [DOCKER_FAQ.md](DOCKER_FAQ.md)

Incluye respuestas a:
- ¿La BD va a ser parte del Docker?
- ¿Tengo que ajustar tablas?
- ¿Los backups van en Docker?
- ¿De dónde salió ese puerto 127.0.0.1?
- ¿Mi BD está en 5433, pero Docker usa 5432?
- Y muchas más...

### Preguntas Rápidas

### ¿Por dónde empiezo?
Ejecuta `docker-init.sh` (macOS/Linux) o `docker-init.bat` (Windows)

### ¿Cómo veo los logs?
`docker-compose logs -f`

### ¿Cómo hago backup?
`docker-compose exec postgres pg_dump -U postgres inventory > backup.sql`

### ¿Cómo restauro un backup?
`docker-compose exec -T postgres psql -U postgres inventory < backup.sql`

### ¿Cómo despliego en producción?
Lee [DEPLOYMENT.md](DEPLOYMENT.md)

### ¿Cómo muevo el proyecto a otro equipo?
Lee sección "Mover a Otro Equipo" en [DOCKER_SETUP.md](DOCKER_SETUP.md)

---

## 📞 Soporte

Si tienes problemas:

1. **Consulta los logs**: `docker-compose logs -f`
2. **Revisa [DOCKER_CHEATSHEET.md](DOCKER_CHEATSHEET.md)**: Solución de problemas
3. **Lee [DOCKER_SETUP.md](DOCKER_SETUP.md)**: Documentación completa
4. **Verifica [DOCKER_VERIFICATION.md](DOCKER_VERIFICATION.md)**: Checklist

---

## ✅ Checklist de Inicio

- [ ] Docker Desktop instalado
- [ ] Proyecto clonado
- [ ] Ejecuté `docker-init.sh` o `docker-init.bat`
- [ ] Todos los servicios están corriendo (`docker-compose ps`)
- [ ] Puedo acceder a http://localhost:3001
- [ ] Health check pasa (`curl http://localhost:3000/api/health`)
- [ ] Leí [README_DOCKER.md](README_DOCKER.md)

---

**¡Listo para empezar!** 🚀

Comienza con: `./docker-init.sh` (o `docker-init.bat` en Windows)
