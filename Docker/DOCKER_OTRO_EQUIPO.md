# 🖥️ Mover el Proyecto a Otro Equipo - Guía Completa

## Pregunta 1: "¿Si paso el proyecto a otro equipo, ya va a tener npm instalado con todas las dependencias necesarias, la base de datos y demás ya listo?"

### Respuesta Corta
**Sí, exactamente. Todo está incluido en Docker.**

### Respuesta Larga

Cuando mueves el proyecto a otro equipo con Docker:

```
Equipo A (Actual)
├── Node.js (Instalado)
├── npm (Instalado)
├── PostgreSQL (Instalado)
├── Todas las dependencias
└── Base de datos con datos

    ↓ (Copiar proyecto)

Equipo B (Nuevo)
├── Docker Desktop (solo esto necesita)
└── Proyecto copiado

    ↓ (docker-compose up -d)

Equipo B (Después)
├── Node.js (En contenedor) ✅
├── npm (En contenedor) ✅
├── PostgreSQL (En contenedor) ✅
├── Todas las dependencias (En contenedor) ✅
└── Base de datos (En volumen) ✅
```

### ¿Qué incluye Docker?

```
CONTENEDOR BACKEND:
├── Node.js 20
├── npm 10
├── Express
├── PostgreSQL client
├── Todas las dependencias de backend
└── Tu código

CONTENEDOR FRONTEND:
├── Node.js 20
├── npm 10
├── React 19
├── Vite 6
├── Todas las dependencias de frontend
└── Tu código

CONTENEDOR POSTGRESQL:
├── PostgreSQL 16
├── Tu base de datos
└── Todos tus datos

VOLÚMENES:
├── Datos de BD (persisten)
├── Logs
└── Backups
```

### ¿Qué NO necesita el otro equipo?

```
❌ Node.js (está en Docker)
❌ npm (está en Docker)
❌ PostgreSQL (está en Docker)
❌ Instalar dependencias (ya están en Docker)
❌ Configurar BD (ya está en Docker)

✅ Solo necesita: Docker Desktop
```

### Comparación: Sin Docker vs Con Docker

#### SIN DOCKER (Antes)

```
Equipo A:
├── Node.js 20
├── npm 10
├── PostgreSQL 16
├── Dependencias instaladas
└── BD configurada

Equipo B (Nuevo):
├── ¿Node.js? ¿Qué versión?
├── ¿npm? ¿Qué versión?
├── ¿PostgreSQL? ¿Qué versión?
├── ¿Dependencias? ¿Todas?
└── ¿BD? ¿Cómo la configuro?

Resultado: "No funciona en el otro equipo" 😭
```

#### CON DOCKER (Ahora)

```
Equipo A:
├── Docker Desktop
├── Proyecto con docker-compose.yml
└── Datos en volumen

Equipo B (Nuevo):
├── Docker Desktop (instalar)
├── Proyecto copiado
└── docker-compose up -d

Resultado: "Funciona igual en ambos equipos" 🎉
```

---

## Pregunta 2: "¿Qué tendría que hacer si quiero montarlo en el otro equipo nuevo?"

### Respuesta Corta
**3 pasos simples.**

### Respuesta Larga

### Paso 1: Instalar Docker Desktop en el otro equipo

**Windows/macOS:**
1. Descargar: https://www.docker.com/products/docker-desktop
2. Instalar normalmente
3. Reiniciar computadora

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Paso 2: Copiar el proyecto

Tienes 3 opciones:

#### Opción A: Git (Recomendada)

```bash
# En el equipo nuevo
git clone <tu-repositorio>
cd Prendas
```

**Ventaja**: Fácil, rápido, sincronizado

#### Opción B: Copiar carpeta

```bash
# Copiar toda la carpeta Prendas a otro equipo
# Por USB, email, Google Drive, etc.
```

**Ventaja**: No necesita Git

#### Opción C: Backup de BD + Proyecto

```bash
# En equipo actual
docker-compose exec postgres pg_dump -U postgres inventory > backup.sql

# Copiar:
# - Carpeta Prendas
# - Archivo backup.sql
```

**Ventaja**: Incluye datos

### Paso 3: Levantar Docker

```bash
# En el equipo nuevo
cd Prendas

# Windows
docker-init.bat

# macOS/Linux
./docker-init.sh
```

El script hará todo automáticamente:
- ✅ Verifica Docker
- ✅ Crea configuración
- ✅ Construye imágenes
- ✅ Levanta servicios
- ✅ Verifica que funciona

### Resultado

```bash
# Ver estado
docker-compose ps

# Debe mostrar:
# prendas-postgres   Up
# prendas-backend    Up
# prendas-frontend   Up

# Acceder
# Frontend: http://localhost:3001
# Backend:  http://localhost:3000/api
```

---

## Pregunta 3: "Para usarlo como PWA como lo estoy usando en este momento, ¿qué debería de hacer?"

### Respuesta Corta
**Nada especial. PWA funciona igual en Docker.**

### Respuesta Larga

Tu aplicación ya es PWA. Docker no cambia eso.

### ¿Qué es PWA?

```
PWA = Progressive Web App

Características:
├── Funciona offline
├── Se instala como app
├── Acceso rápido
├── Notificaciones
└── Sincronización en background
```

### ¿Cómo funciona PWA en Docker?

```
Equipo A (Actual):
├── Accedes a http://localhost:5173
├── Ves opción "Instalar"
├── Instalas como app
└── Funciona offline

Equipo B (Con Docker):
├── Accedes a http://localhost:3001
├── Ves opción "Instalar"
├── Instalas como app
└── Funciona offline

Resultado: Exactamente igual ✅
```

### ¿Qué necesitas hacer?

**Nada especial.** Solo:

1. **Levantar Docker**
   ```bash
   docker-compose up -d
   ```

2. **Acceder a la aplicación**
   ```
   http://localhost:3001
   ```

3. **Instalar como PWA**
   - Navegador Chrome/Edge: Click en "Instalar"
   - O: Menú → "Instalar aplicación"

4. **Usar como app**
   - Aparece en tu escritorio
   - Funciona offline
   - Sincroniza cuando hay conexión

### Configuración PWA (Ya está hecha)

Tu `vite.config.ts` ya tiene:

```javascript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Plow - Gestión de Inventarios',
    short_name: 'Plow',
    description: 'Sistema de gestión de inventarios...',
    icons: [
      { src: 'pwa-512x512.png', sizes: '512x512' },
      { src: 'pwa-192x192.png', sizes: '192x192' }
    ]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    runtimeCaching: [
      {
        urlPattern: /\/api\/.*/i,
        handler: 'NetworkFirst'
      }
    ]
  }
})
```

**Esto significa:**
- ✅ Service Worker configurado
- ✅ Caché automático
- ✅ Funciona offline
- ✅ Sincronización en background

### ¿Qué pasa en el otro equipo?

```
Equipo B (Nuevo):
├── Docker levantado
├── Frontend compilado
├── Service Worker registrado
├── PWA lista para instalar
└── Funciona offline ✅
```

### Pasos para Instalar PWA en Otro Equipo

1. **Levantar Docker**
   ```bash
   docker-compose up -d
   ```

2. **Abrir navegador**
   ```
   http://localhost:3001
   ```

3. **Esperar a que cargue**
   - El Service Worker se registra automáticamente
   - Verás un ícono de instalación

4. **Instalar**
   - Chrome/Edge: Click en ícono de instalación
   - O: Menú → "Instalar aplicación"

5. **Usar como app**
   - Aparece en escritorio/inicio
   - Funciona offline
   - Sincroniza automáticamente

### Verificar que PWA funciona

```bash
# Abrir DevTools (F12)
# Ir a: Application → Service Workers

# Debe mostrar:
# ✅ Service Worker registrado
# ✅ Scope: http://localhost:3001/
# ✅ Status: activated and running
```

### Offline en Otro Equipo

```
Equipo B (Con Docker):
├── Desconectar internet
├── Abrir app PWA
├── Funciona offline ✅
├── Reconectar internet
└── Sincroniza automáticamente ✅
```

---

## 📊 Resumen Visual

### Flujo Completo: Equipo A → Equipo B

```
EQUIPO A (Actual)
├── Proyecto funcionando
├── Docker levantado
└── Datos en BD

    ↓ (Opción 1: Git)
    git push

    ↓ (Opción 2: Copiar carpeta)
    Copiar Prendas/

    ↓ (Opción 3: Backup + Proyecto)
    Copiar Prendas/ + backup.sql

EQUIPO B (Nuevo)
├── Instalar Docker Desktop
├── Clonar/Copiar proyecto
└── docker-compose up -d

    ↓

EQUIPO B (Después)
├── Docker levantado
├── Servicios corriendo
├── BD lista
├── Frontend compilado
├── PWA registrada
└── ¡Listo para usar! ✅
```

---

## 🎯 Checklist: Mover a Otro Equipo

### Equipo A (Actual)

- [ ] Proyecto funcionando
- [ ] Docker levantado
- [ ] Datos en BD
- [ ] Hacer backup (opcional)
  ```bash
  docker-compose exec postgres pg_dump -U postgres inventory > backup.sql
  ```

### Equipo B (Nuevo)

- [ ] Docker Desktop instalado
- [ ] Proyecto clonado/copiado
- [ ] Archivo `backend/.env` existe
- [ ] Ejecutar `docker-init.sh` o `docker-init.bat`
- [ ] Esperar ~30 segundos
- [ ] Verificar: `docker-compose ps`
- [ ] Acceder: http://localhost:3001
- [ ] Restaurar backup (si tienes)
  ```bash
  docker-compose exec -T postgres psql -U postgres inventory < backup.sql
  ```
- [ ] Instalar como PWA
- [ ] Probar offline

---

## 💡 Consejos Importantes

### Para Mover Datos

```bash
# Opción 1: Backup/Restore (Recomendado)
# Equipo A
docker-compose exec postgres pg_dump -U postgres inventory > backup.sql

# Equipo B
docker-compose up -d
docker-compose exec -T postgres psql -U postgres inventory < backup.sql

# Opción 2: Volumen Docker (Avanzado)
# Exportar volumen
docker run --rm -v prendas_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-data.tar.gz -C /data .

# Importar volumen
docker run --rm -v prendas_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-data.tar.gz -C /data
```

### Para PWA

```bash
# Verificar Service Worker
# DevTools → Application → Service Workers

# Verificar Manifest
# DevTools → Application → Manifest

# Probar offline
# DevTools → Network → Offline
# Recargar página
# Debe funcionar ✅
```

### Para Seguridad

```bash
# Cambiar JWT_SECRET en backend/.env
JWT_SECRET=nuevo_secreto_unico

# Cambiar DB_PASSWORD en backend/.env
DB_PASSWORD=nueva_contraseña_fuerte

# Reiniciar
docker-compose restart
```

---

## 🚀 Ejemplo Práctico: Paso a Paso

### Equipo A (Actual)

```bash
# 1. Hacer backup
docker-compose exec postgres pg_dump -U postgres inventory > backup.sql

# 2. Copiar proyecto
# Copiar carpeta Prendas/ a USB/Drive/Email

# 3. Copiar backup
# Copiar backup.sql a USB/Drive/Email
```

### Equipo B (Nuevo)

```bash
# 1. Instalar Docker Desktop
# Descargar e instalar desde https://www.docker.com/products/docker-desktop

# 2. Copiar proyecto
# Pegar carpeta Prendas/ en C:\Users\tu-usuario\
# O en /Users/tu-usuario/ (macOS)
# O en /home/tu-usuario/ (Linux)

# 3. Copiar backup
# Pegar backup.sql en Prendas/

# 4. Levantar Docker
cd Prendas
docker-init.bat  # o ./docker-init.sh

# 5. Esperar ~30 segundos

# 6. Restaurar backup
docker-compose exec -T postgres psql -U postgres inventory < backup.sql

# 7. Verificar
docker-compose ps
curl http://localhost:3000/api/health

# 8. Acceder
# Abrir http://localhost:3001

# 9. Instalar PWA
# Click en ícono de instalación
# O: Menú → Instalar aplicación

# 10. Usar offline
# Desconectar internet
# Abrir app PWA
# Debe funcionar ✅
```

---

## ❓ Preguntas Frecuentes

### "¿Necesito instalar Node.js en el otro equipo?"
**No, está en Docker.**

### "¿Necesito instalar PostgreSQL en el otro equipo?"
**No, está en Docker.**

### "¿Necesito instalar npm en el otro equipo?"
**No, está en Docker.**

### "¿Necesito hacer algo especial para PWA?"
**No, funciona automáticamente.**

### "¿Qué pasa si no tengo backup?"
**La BD estará vacía. Puedes empezar de cero o migrar datos después.**

### "¿Puedo tener ambas BDs (equipo A y B) simultáneamente?"
**Sí, son completamente independientes.**

### "¿Qué pasa si cambio código en equipo B?"
**Los cambios están en equipo B. Usa Git para sincronizar.**

### "¿Puedo usar PWA sin internet?"
**Sí, funciona offline. Sincroniza cuando hay conexión.**

---

## 📞 Resumen Final

### Pregunta 1: ¿Todo incluido en Docker?
**Sí, todo: Node.js, npm, PostgreSQL, dependencias, BD.**

### Pregunta 2: ¿Qué hacer en otro equipo?
**3 pasos: Instalar Docker → Copiar proyecto → docker-compose up -d**

### Pregunta 3: ¿PWA en otro equipo?
**Funciona igual. Nada especial que hacer.**

---

## 🎉 ¡Listo!

Tu proyecto es completamente portable. Puedes moverlo a cualquier equipo con Docker y funcionará exactamente igual, incluyendo PWA.

```bash
# En equipo nuevo:
docker-init.sh  # o docker-init.bat

# Luego:
http://localhost:3001
```

¡Eso es todo! 🚀
