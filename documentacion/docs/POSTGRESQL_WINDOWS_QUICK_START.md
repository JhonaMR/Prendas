# PostgreSQL Windows - Quick Start

## ✅ Tu Situación Actual

- ✅ PostgreSQL 18.2 está instalado
- ❌ `psql` no está en el PATH
- ❌ No puedes ejecutar `psql --version`

## 🚀 Solución Rápida (2 minutos)

### Paso 1: Abre Command Prompt como Administrador

1. Presiona `Win + R`
2. Escribe: `cmd`
3. Presiona `Ctrl + Shift + Enter` (para ejecutar como Administrador)
4. Haz click en "Yes" si te pide confirmación

### Paso 2: Ejecuta el script de setup

```bash
cd tu-proyecto-react
backend\scripts\setup-postgres-windows.bat
```

### Paso 3: Reinicia Command Prompt

- Cierra la ventana actual
- Abre una nueva ventana de Command Prompt (no necesita ser Administrador)

### Paso 4: Verifica que funciona

```bash
psql --version
```

Deberías ver:
```
psql (PostgreSQL) 18.2
```

## ✅ Si todo funciona, continúa:

### Crear las bases de datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# Cuando te pida contraseña, usa la que estableciste en la instalación
```

Una vez conectado (verás el prompt `postgres=#`):

```sql
-- Crear base de datos de producción
CREATE DATABASE inventory;

-- Crear base de datos de pruebas
CREATE DATABASE inventory_test;

-- Listar bases de datos para verificar
\l

-- Salir
\q
```

### Verificar la configuración

```bash
node backend/src/scripts/verifyPostgresSetup.js
```

## ❌ Si algo no funciona:

### Problema: "Access Denied" al ejecutar el script

**Solución**: 
1. Abre Command Prompt como Administrador (ver Paso 1)
2. Intenta de nuevo

### Problema: "psql: command not found" después de reiniciar

**Solución**:
1. Cierra TODAS las ventanas de Command Prompt y PowerShell
2. Abre una nueva ventana
3. Intenta de nuevo

### Problema: "password authentication failed"

**Solución**:
- Usa la contraseña que estableciste durante la instalación de PostgreSQL
- Si la olvidaste, necesitas reinstalar PostgreSQL

### Problema: "could not connect to server"

**Solución**: PostgreSQL no está corriendo. En Command Prompt (como Administrador):

```bash
net start postgresql-x64-18
```

## 📝 Alternativa Manual (si el script no funciona)

Si el script no funciona, agrega PostgreSQL al PATH manualmente:

1. Presiona `Win + X`
2. Selecciona "System"
3. Click en "Advanced system settings"
4. Click en "Environment Variables"
5. En "System variables", busca "Path"
6. Click en "Edit"
7. Click en "New"
8. Agrega: `C:\Program Files\PostgreSQL\18\bin`
9. Click en "OK" en todos los diálogos
10. Reinicia Command Prompt

## 🎯 Próximo Paso

Una vez que `psql --version` funcione, ejecuta:

```bash
node backend/src/scripts/verifyPostgresSetup.js
```

Esto verificará que todo está listo para la migración a PostgreSQL.

## 📚 Documentación Completa

Para más detalles, ver: `docs/POSTGRESQL_WINDOWS_SETUP.md`
