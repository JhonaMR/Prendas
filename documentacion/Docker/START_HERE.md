# 🚀 COMIENZA AQUÍ - Docker Prendas

## ¡Bienvenido! 👋

Tu proyecto está completamente dockerizado. Este archivo te guiará en los primeros pasos.

---

## ⚡ Inicio Rápido (2 minutos)

### Paso 1: Ejecuta el Script de Inicio

**Si estás en Windows:**
```bash
docker-init.bat
```

**Si estás en macOS o Linux:**
```bash
chmod +x docker-init.sh
./docker-init.sh
```

El script hará todo automáticamente:
- ✅ Verifica Docker
- ✅ Crea configuración
- ✅ Construye imágenes
- ✅ Levanta servicios

### Paso 2: Espera ~30 segundos

El script te dirá cuando esté listo.

### Paso 3: Abre tu navegador

- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:3000/api

¡Listo! 🎉

---

## ❓ Tengo Preguntas

### "¿Qué es Docker?"
Lee: [DOCKER_VISUAL_GUIDE.md](DOCKER_VISUAL_GUIDE.md) - Tiene diagramas

### "¿Cómo funciona la BD?"
Lee: [DOCKER_FAQ.md](DOCKER_FAQ.md) - Responde tus 5 preguntas

### "¿Cómo hago backup?"
Lee: [DOCKER_CHEATSHEET.md](DOCKER_CHEATSHEET.md#backup-y-restauración)

### "¿Cómo despliego en producción?"
Lee: [DEPLOYMENT.md](DEPLOYMENT.md)

### "¿Cómo muevo a otro equipo?"
Lee: [DOCKER_OTRO_EQUIPO.md](DOCKER_OTRO_EQUIPO.md) - Guía completa

### "¿Qué necesita el otro equipo?"
Lee: [DOCKER_OTRO_EQUIPO.md](DOCKER_OTRO_EQUIPO.md#pregunta-1-si-paso-el-proyecto-a-otro-equipo-ya-va-a-tener-npm-instalado-con-todas-las-dependencias-necesarias-la-base-de-datos-y-demás-ya-listo)

### "¿Cómo funciona PWA en Docker?"
Lee: [DOCKER_OTRO_EQUIPO.md](DOCKER_OTRO_EQUIPO.md#pregunta-3-para-usarlo-como-pwa-como-lo-estoy-usando-en-este-momento-qué-debería-de-hacer)

---

## 📚 Documentación Disponible

| Archivo | Para Qué | Tiempo |
|---------|----------|--------|
| **[DOCKER_FAQ.md](DOCKER_FAQ.md)** | Entender conceptos | 10 min |
| **[DOCKER_VISUAL_GUIDE.md](DOCKER_VISUAL_GUIDE.md)** | Ver diagramas | 15 min |
| **[README_DOCKER.md](README_DOCKER.md)** | Guía rápida | 5 min |
| **[DOCKER_CHEATSHEET.md](DOCKER_CHEATSHEET.md)** | Referencia de comandos | Consulta |
| **[DOCKER_SETUP.md](DOCKER_SETUP.md)** | Documentación completa | 30 min |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Desplegar en servidor | 45 min |
| **[DOCKER_OTRO_EQUIPO.md](DOCKER_OTRO_EQUIPO.md)** | Mover a otro equipo | 15 min |
| **[DOCKER_COMPLETE_SETUP.md](DOCKER_COMPLETE_SETUP.md)** | Resumen de todo | 10 min |

---

## 🎯 Próximos Pasos Recomendados

### Hoy (Ahora)
1. ✅ Ejecuta `docker-init.sh` o `docker-init.bat`
2. ✅ Verifica que funciona: http://localhost:3001
3. ✅ Lee [DOCKER_FAQ.md](DOCKER_FAQ.md) (10 minutos)

### Mañana
1. Lee [DOCKER_VISUAL_GUIDE.md](DOCKER_VISUAL_GUIDE.md) (15 minutos)
2. Aprende comandos: [DOCKER_CHEATSHEET.md](DOCKER_CHEATSHEET.md)
3. Haz un backup: `docker-backup.sh` o `docker-backup.bat`

### Esta Semana
1. Lee [DOCKER_SETUP.md](DOCKER_SETUP.md) (documentación completa)
2. Migra tus datos (si quieres)
3. Prueba en otro equipo

---

## 🔧 Comandos Básicos

```bash
# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Reiniciar
docker-compose restart

# Hacer backup
docker-compose exec postgres pg_dump -U postgres inventory > backup.sql
```

Más comandos en: [DOCKER_CHEATSHEET.md](DOCKER_CHEATSHEET.md)

---

## ✅ Verificación Rápida

Después de ejecutar `docker-init.sh`:

```bash
# Verificar que los 3 servicios están corriendo
docker-compose ps

# Debe mostrar:
# prendas-postgres   Up
# prendas-backend    Up
# prendas-frontend   Up
```

Si ves los 3 servicios "Up", ¡todo está bien! ✅

---

## 🆘 Algo No Funciona

### "No puedo ejecutar docker-init.sh"

```bash
# Asegúrate de que es ejecutable
chmod +x docker-init.sh

# Luego ejecuta
./docker-init.sh
```

### "Docker no está instalado"

Descarga: https://www.docker.com/products/docker-desktop

### "Puerto 3000 en uso"

```bash
# Detén los servicios
docker-compose down

# Luego levanta de nuevo
docker-compose up -d
```

### "Base de datos no conecta"

```bash
# Ver logs
docker-compose logs postgres

# Reiniciar
docker-compose restart postgres
```

Más soluciones en: [DOCKER_CHEATSHEET.md](DOCKER_CHEATSHEET.md#solución-de-problemas)

---

## 📖 Índice Completo

Para ver toda la documentación disponible:
→ [DOCKER_INDEX.md](DOCKER_INDEX.md)

---

## 💡 Consejos

- **Desarrollo**: Usa `docker-compose.dev.yml` para hot-reload
- **Producción**: Usa `docker-compose.prod.yml` para seguridad
- **Backups**: Haz backup regularmente
- **Logs**: Revisa logs si algo no funciona

---

## 🎓 Aprende Más

### Conceptos Básicos
- [DOCKER_FAQ.md](DOCKER_FAQ.md) - Preguntas frecuentes
- [DOCKER_VISUAL_GUIDE.md](DOCKER_VISUAL_GUIDE.md) - Diagramas visuales

### Uso Diario
- [DOCKER_CHEATSHEET.md](DOCKER_CHEATSHEET.md) - Comandos útiles
- [README_DOCKER.md](README_DOCKER.md) - Guía rápida

### Profundo
- [DOCKER_SETUP.md](DOCKER_SETUP.md) - Documentación completa
- [DEPLOYMENT.md](DEPLOYMENT.md) - Despliegue en producción

---

## 🚀 ¡Listo!

```bash
# Ejecuta esto ahora:
./docker-init.sh  # macOS/Linux
# o
docker-init.bat   # Windows
```

Luego abre: **http://localhost:3001**

---

## 📞 Preguntas Frecuentes

**P: ¿Dónde están mis datos?**  
R: En un volumen Docker. Persisten aunque reinicies.

**P: ¿Puedo usar mi BD actual?**  
R: Sí, con backup/restore. Ver [DOCKER_FAQ.md](DOCKER_FAQ.md)

**P: ¿Cómo muevo a otro equipo?**  
R: Con Git o backup. Ver [DOCKER_OTRO_EQUIPO.md](DOCKER_OTRO_EQUIPO.md)

**P: ¿Es seguro para producción?**  
R: Sí, usa `docker-compose.prod.yml`. Ver [DEPLOYMENT.md](DEPLOYMENT.md)

---

**¡Bienvenido a Docker!** 🐳

Cualquier pregunta, consulta [DOCKER_FAQ.md](DOCKER_FAQ.md)
