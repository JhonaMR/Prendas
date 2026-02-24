# 🔧 CREAR BASE DE DATOS MANUALMENTE

## ⚠️ IMPORTANTE

La base de datos `inventory` no existe aún. Necesitas crearla manualmente.

---

## OPCIÓN 1: Usando pgAdmin (Recomendado)

### Paso 1: Abre pgAdmin
- URL: `http://localhost:5050`
- Usuario: `postgres`
- Contraseña: Tu contraseña de PostgreSQL

### Paso 2: Crea la base de datos
1. Click derecho en "Databases"
2. Selecciona "Create" → "Database"
3. Nombre: `inventory`
4. Haz clic en "Save"

### Paso 3: Ejecuta el script SQL
1. Selecciona la BD `inventory`
2. Abre "Query Tool" (Tools → Query Tool)
3. Copia el contenido de: `Prendas/backend/scripts/create-fichas-tables.sql`
4. Pega en Query Tool
5. Presiona F5 o haz clic en "Execute"

---

## OPCIÓN 2: Usando línea de comandos

### Paso 1: Crea la BD
```bash
$env:PGPASSWORD='postgres'; psql -U postgres -c "CREATE DATABASE inventory;"
```

### Paso 2: Ejecuta el script
```bash
$env:PGPASSWORD='postgres'; psql -U postgres -d inventory -f Prendas/backend/scripts/create-fichas-tables.sql
```

---

## OPCIÓN 3: Usando DBeaver

### Paso 1: Abre DBeaver
- Conecta a PostgreSQL

### Paso 2: Crea la BD
1. Click derecho en "Databases"
2. "Create New Database"
3. Nombre: `inventory`
4. Haz clic en "Create"

### Paso 3: Ejecuta el script
1. Abre archivo: `Prendas/backend/scripts/create-fichas-tables.sql`
2. Presiona Ctrl+Enter para ejecutar

---

## VERIFICACIÓN

Una vez creada la BD, ejecuta esta query para verificar:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('disenadoras', 'fichas_diseno', 'fichas_costo', 'fichas_cortes', 'maletas', 'maletas_referencias')
ORDER BY table_name;
```

**Deberías ver 6 tablas:**
1. disenadoras
2. fichas_cortes
3. fichas_costo
4. fichas_diseno
5. maletas
6. maletas_referencias

---

## 📝 NOTAS

- La contraseña por defecto de PostgreSQL es: `postgres`
- Si cambió la contraseña, usa la tuya
- El usuario por defecto es: `postgres`
- El puerto por defecto es: `5432`

---

## ✅ Una vez hecho

Después de crear la BD y ejecutar el script:

1. Instala dependencias: `npm install` en `Prendas/backend`
2. Inicia backend: `npm run dev` en `Prendas/backend`
3. Inicia frontend: `npm run dev` en `Prendas`
4. Abre `http://localhost:5173` en tu navegador

¡Listo! 🚀
