# Setup de Preferencias de Vistas de Usuario

## Descripción
Este documento explica cómo configurar la tabla de preferencias de vistas de usuario en la base de datos PostgreSQL.

## Pasos para ejecutar

### 1. Ejecutar el script SQL
Ejecuta el siguiente comando en tu terminal (desde la carpeta `Prendas/backend`):

```bash
psql -U postgres -d inventory -f scripts/create-user-view-preferences-table.sql
```

O si tienes PostgreSQL en tu PATH:

```powershell
# En PowerShell
psql -U postgres -d inventory -f scripts/create-user-view-preferences-table.sql
```

### 2. Verificar que la tabla se creó correctamente

Conectate a la base de datos y verifica:

```sql
-- Conectarse a la BD
psql -U postgres -d inventory

-- Verificar que la tabla existe
\dt user_view_preferences

-- Ver la estructura de la tabla
\d user_view_preferences

-- Ver los índices
\di user_view_preferences*
```

## Qué hace el script

1. **Crea la tabla `user_view_preferences`** con:
   - `id`: ID único (PRIMARY KEY)
   - `user_id`: ID del usuario (UNIQUE, FOREIGN KEY)
   - `view_order`: Array JSON con el orden de vistas
   - `created_at`: Timestamp de creación
   - `updated_at`: Timestamp de última actualización

2. **Crea un índice** para búsquedas rápidas por `user_id`

3. **Crea un trigger** que actualiza automáticamente `updated_at` cuando se modifica un registro

## Endpoints disponibles

Una vez ejecutado el script, los siguientes endpoints estarán disponibles:

### GET /api/user/preferences
Obtiene las preferencias del usuario autenticado

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "viewOrder": ["fichas-diseno", "fichas-costo", "maletas", ...]
  }
}
```

### POST /api/user/preferences
Guarda las preferencias del usuario autenticado

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "viewOrder": ["fichas-diseno", "fichas-costo", "maletas", "inventory", "orders"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Preferencias guardadas correctamente",
  "data": {
    "viewOrder": ["fichas-diseno", "fichas-costo", "maletas", "inventory", "orders"]
  }
}
```

## Notas importantes

- Si un usuario no tiene preferencias guardadas, el endpoint GET retorna un array vacío
- El frontend usará el orden por defecto si no hay preferencias guardadas
- Las preferencias se guardan automáticamente cuando el usuario personaliza el orden
- Cada usuario tiene sus propias preferencias (UNIQUE constraint en user_id)
