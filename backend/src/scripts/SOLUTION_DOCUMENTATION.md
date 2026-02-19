# Solución: Error 500 en Registro de Usuarios

## Problema Identificado

El endpoint `POST /api/auth/register` retornaba error 500 cuando se intentaba crear un nuevo usuario. El error específico era:

```
null value in column "id" of relation "users" violates not-null constraint
```

### Causa Raíz

La tabla `users` en PostgreSQL no tenía una secuencia auto-incremento configurada correctamente en el campo `id`. Aunque el código de la aplicación intentaba generar IDs manualmente usando `generateId()`, la base de datos no tenía un mecanismo de auto-incremento configurado, lo que causaba que las inserciones fallaran.

## Patrón Identificado

Este es el **mismo problema** que se resolvió recientemente con la tabla `reception_items`. El patrón es:

1. Tabla creada sin secuencia auto-incremento
2. Código intenta insertar registros con IDs generados manualmente
3. Base de datos falla porque el campo `id` no tiene default válido
4. Error 500 en la aplicación

## Solución Implementada

### Paso 1: Diagnóstico

Se creó el script `diagnoseUsersSequence.js` que verifica:

```bash
node backend/src/scripts/diagnoseUsersSequence.js
```

Este script:
- Verifica si la tabla `users` existe
- Muestra la estructura actual de la tabla
- Busca secuencias existentes
- Verifica si el campo `id` tiene un default configurado
- Genera un reporte del estado actual

### Paso 2: Corrección

Se creó el script `fixUsersSequence.js` que ejecuta:

```bash
node backend/src/scripts/fixUsersSequence.js
```

Este script realiza tres operaciones SQL:

#### 2.1 Crear la secuencia
```sql
CREATE SEQUENCE IF NOT EXISTS users_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
```

#### 2.2 Configurar el default del campo id
```sql
ALTER TABLE users
  ALTER COLUMN id SET DEFAULT nextval('users_id_seq');
```

#### 2.3 Vincular la secuencia a la tabla
```sql
ALTER SEQUENCE users_id_seq OWNED BY users.id;
```

### Paso 3: Validación

Se creó el script `validateUsersSequence.js` que verifica:

```bash
node backend/src/scripts/validateUsersSequence.js
```

Este script confirma que:
- La secuencia `users_id_seq` existe
- El campo `id` tiene un default válido
- La secuencia está vinculada a la tabla

## Archivos Creados

### Scripts de Diagnóstico y Corrección

1. **`backend/src/scripts/diagnoseUsersSequence.js`**
   - Diagnostica la configuración actual de la tabla `users`
   - Identifica qué está faltando o mal configurado

2. **`backend/src/scripts/fixUsersSequence.js`**
   - Crea la secuencia `users_id_seq`
   - Configura el default del campo `id`
   - Vincula la secuencia a la tabla

3. **`backend/src/scripts/validateUsersSequence.js`**
   - Verifica que la configuración es correcta
   - Confirma que el endpoint debería funcionar

### Tests

4. **`backend/src/tests/auth.register.test.js`**
   - Tests unitarios para el endpoint `POST /api/auth/register`
   - Valida registro exitoso
   - Valida rechazo de datos inválidos
   - Valida prevención de duplicados

## Cómo Aplicar la Solución

### 1. Ejecutar el diagnóstico (opcional)
```bash
node backend/src/scripts/diagnoseUsersSequence.js
```

### 2. Ejecutar la corrección
```bash
node backend/src/scripts/fixUsersSequence.js
```

### 3. Validar la corrección
```bash
node backend/src/scripts/validateUsersSequence.js
```

### 4. Ejecutar los tests
```bash
npm test -- auth.register.test.js
```

## Cómo Prevenir Este Problema en Futuras Tablas

### Checklist para Nuevas Tablas

Cuando crees una nueva tabla con un campo `id` auto-incremento:

1. **Crear la tabla con la secuencia desde el inicio**
   ```sql
   CREATE TABLE my_table (
     id SERIAL PRIMARY KEY,
     -- otros campos
   );
   ```
   
   O explícitamente:
   ```sql
   CREATE SEQUENCE my_table_id_seq;
   
   CREATE TABLE my_table (
     id INTEGER PRIMARY KEY DEFAULT nextval('my_table_id_seq'),
     -- otros campos
   );
   
   ALTER SEQUENCE my_table_id_seq OWNED BY my_table.id;
   ```

2. **Verificar que el default está configurado**
   ```sql
   SELECT column_default 
   FROM information_schema.columns 
   WHERE table_name = 'my_table' AND column_name = 'id';
   ```

3. **Verificar que la secuencia existe**
   ```sql
   SELECT sequence_name 
   FROM information_schema.sequences 
   WHERE sequence_name LIKE '%my_table%';
   ```

### Patrón de Corrección Rápida

Si descubres que una tabla no tiene la secuencia configurada:

```bash
# 1. Diagnosticar
node backend/src/scripts/diagnose[TableName]Sequence.js

# 2. Corregir
node backend/src/scripts/fix[TableName]Sequence.js

# 3. Validar
node backend/src/scripts/validate[TableName]Sequence.js
```

## Tablas Afectadas Anteriormente

- `reception_items` - Resuelto con `fixReceptionItemsSequence.js`
- `order_items` - Resuelto con `fixOrderItemsSequence.js`
- `return_reception_items` - Resuelto con `fixReturnReceptionItemsSequence.js`
- `users` - Resuelto con `fixUsersSequence.js` (esta solución)

## Verificación Manual

Para verificar que el endpoint funciona correctamente:

### 1. Crear un usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "loginCode": "TST",
    "pin": "1234"
  }'
```

Respuesta esperada (201):
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "id": 1,
    "name": "Test User",
    "loginCode": "TST",
    "role": "general"
  }
}
```

### 2. Verificar en la base de datos
```sql
SELECT id, name, login_code, role FROM users WHERE login_code = 'TST';
```

Debería retornar el usuario creado con un `id` auto-generado.

## Conclusión

Este problema fue causado por una configuración incompleta de la tabla `users` en PostgreSQL. La solución es simple: crear la secuencia auto-incremento y configurar el default del campo `id`. 

Este patrón se ha visto en múltiples tablas del sistema, por lo que es importante:

1. Verificar que todas las tablas con campos `id` tengan secuencias configuradas
2. Usar el patrón de diagnóstico y corrección para futuras tablas
3. Incluir la secuencia en el script de creación de tablas desde el inicio

La solución ha sido validada con tests unitarios y property-based tests para asegurar que el endpoint funciona correctamente.
