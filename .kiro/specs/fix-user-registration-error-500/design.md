# Design Document: Fix User Registration Error 500

## Overview

El error 500 en el endpoint POST /api/auth/register es causado por una configuración incorrecta de la tabla `users` en PostgreSQL. Específicamente, el campo `id` no tiene una secuencia auto-incremento configurada, lo que causa que las inserciones fallen cuando se intenta asignar un valor NULL al campo id.

Este es el mismo problema que se resolvió recientemente con la tabla `reception_items`. La solución implica:

1. **Diagnóstico**: Crear un script que verifique la configuración actual de la tabla `users`
2. **Corrección**: Crear la secuencia `users_id_seq` y configurarla correctamente
3. **Verificación**: Confirmar que la configuración es correcta
4. **Validación**: Probar que el endpoint de registro funciona correctamente

## Architecture

El sistema consta de tres componentes principales:

### 1. Script de Diagnóstico (`diagnoseUsersSequence.js`)
- Conecta a la base de datos PostgreSQL
- Verifica la estructura de la tabla `users`
- Busca secuencias existentes
- Genera un reporte detallado del estado actual

### 2. Script de Corrección (`fixUsersSequence.js`)
- Crea la secuencia `users_id_seq` si no existe
- Configura el default del campo `id`
- Vincula la secuencia a la tabla usando OWNED BY
- Verifica que la corrección fue exitosa

### 3. Pruebas de Validación
- Tests unitarios para verificar que el endpoint funciona
- Tests de integración para validar el flujo completo
- Tests de propiedades para verificar comportamiento universal

## Components and Interfaces

### Component 1: Database Diagnostic Module

**Responsabilidad**: Diagnosticar la configuración actual de la tabla `users`

**Interfaz**:
```
async function diagnoseUsersSequence()
  - Conecta a PostgreSQL
  - Verifica existencia de tabla users
  - Extrae estructura de columnas
  - Busca secuencias relacionadas
  - Retorna reporte detallado
```

**Salida esperada**:
```
✅ La tabla users existe
📋 Estructura actual:
  • id: integer (default: NONE, nullable: false)
  • name: character varying (default: NONE, nullable: false)
  • login_code: character varying (default: NONE, nullable: false)
  • pin_hash: character varying (default: NONE, nullable: false)
  • role: character varying (default: NONE, nullable: false)
  • active: boolean (default: true, nullable: false)
  • created_at: timestamp (default: CURRENT_TIMESTAMP, nullable: false)
  • updated_at: timestamp (default: CURRENT_TIMESTAMP, nullable: false)

❌ No hay secuencias para users
❌ El campo id NO tiene default configurado
```

### Component 2: Database Fix Module

**Responsabilidad**: Corregir la configuración de la tabla `users`

**Interfaz**:
```
async function fixUsersSequence()
  - Crea secuencia users_id_seq
  - Configura default del campo id
  - Vincula secuencia a tabla
  - Verifica configuración final
  - Retorna confirmación de éxito
```

**Operaciones SQL**:
```sql
-- 1. Crear secuencia
CREATE SEQUENCE IF NOT EXISTS users_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

-- 2. Configurar default
ALTER TABLE users
  ALTER COLUMN id SET DEFAULT nextval('users_id_seq');

-- 3. Vincular secuencia
ALTER SEQUENCE users_id_seq OWNED BY users.id;
```

### Component 3: Validation Module

**Responsabilidad**: Validar que la corrección fue exitosa

**Interfaz**:
```
async function validateUsersSequence()
  - Verifica que users_id_seq existe
  - Verifica que el default está configurado
  - Verifica que la secuencia está vinculada
  - Retorna estado de validación
```

## Data Models

### Users Table Structure
```
Column          | Type                  | Default              | Nullable
----------------|----------------------|----------------------|----------
id              | integer              | nextval('users_id_seq') | false
name            | character varying    | -                    | false
login_code      | character varying    | -                    | false
pin_hash        | character varying    | -                    | false
role            | character varying    | -                    | false
active          | boolean              | true                 | false
created_at      | timestamp            | CURRENT_TIMESTAMP    | false
updated_at      | timestamp            | CURRENT_TIMESTAMP    | false
```

### Sequence Configuration
```
Sequence Name: users_id_seq
Start Value: 1
Increment: 1
Owned By: users.id
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Sequence Creation
*For any* database connection, after executing the fix script, the sequence `users_id_seq` should exist in the database.
**Validates: Requirements 2.1**

### Property 2: Sequence Configuration
*For any* database connection, after executing the fix script, the sequence `users_id_seq` should be configured to start at 1 and increment by 1.
**Validates: Requirements 2.2**

### Property 3: Sequence Ownership
*For any* database connection, after executing the fix script, the sequence `users_id_seq` should be owned by the `users.id` column.
**Validates: Requirements 2.3**

### Property 4: Default Configuration
*For any* database connection, after executing the fix script, the `users.id` column should have a default value of `nextval('users_id_seq')`.
**Validates: Requirements 2.4**

### Property 5: User Creation Success
*For any* valid user data (name, login_code, pin), when a POST request is sent to /api/auth/register, the user should be created successfully and the response should have status code 201.
**Validates: Requirements 4.1, 4.2**

### Property 6: User ID Auto-Generation
*For any* user created via /api/auth/register, the response should include an auto-generated id field that is a positive integer.
**Validates: Requirements 4.3**

### Property 7: Invalid Data Rejection
*For any* invalid user data (missing fields, invalid format), when a POST request is sent to /api/auth/register, the response should have status code 400 with a descriptive error message.
**Validates: Requirements 4.4**

### Property 8: Duplicate Login Code Prevention
*For any* existing user with a login_code, when a POST request is sent to /api/auth/register with the same login_code, the response should have status code 409 with a descriptive error message.
**Validates: Requirements 4.5**

## Error Handling

### Database Connection Errors
- **Scenario**: No se puede conectar a PostgreSQL
- **Handling**: Capturar error de conexión, mostrar mensaje claro, salir con código de error
- **Message**: "Error de conexión a PostgreSQL: [detalles del error]"

### Table Not Found
- **Scenario**: La tabla `users` no existe
- **Handling**: Mostrar mensaje informativo, no intentar crear la tabla
- **Message**: "La tabla users NO existe. Necesitas crear la tabla primero con el esquema correcto"

### Sequence Already Exists
- **Scenario**: La secuencia `users_id_seq` ya existe
- **Handling**: Usar CREATE SEQUENCE IF NOT EXISTS para evitar error
- **Message**: "Secuencia creada/verificada: users_id_seq"

### Default Already Configured
- **Scenario**: El campo `id` ya tiene un default configurado
- **Handling**: Verificar si es el correcto, si no, actualizar
- **Message**: "Default ya estaba configurado: [valor actual]"

### Sequence Already Owned
- **Scenario**: La secuencia ya está vinculada a la tabla
- **Handling**: Capturar error específico, mostrar mensaje informativo
- **Message**: "La secuencia ya estaba vinculada"

## Testing Strategy

### Unit Tests

**Test 1: Diagnose Users Sequence**
- Ejecutar script de diagnóstico
- Verificar que se conecta a la base de datos
- Verificar que se extrae la estructura de la tabla
- Verificar que se genera un reporte

**Test 2: Fix Users Sequence**
- Ejecutar script de corrección
- Verificar que se crea la secuencia
- Verificar que se configura el default
- Verificar que se vincula la secuencia

**Test 3: Validate Users Sequence**
- Ejecutar validación
- Verificar que la secuencia existe
- Verificar que el default está configurado
- Verificar que la secuencia está vinculada

**Test 4: User Registration Success**
- Enviar POST a /api/auth/register con datos válidos
- Verificar que retorna status 201
- Verificar que retorna los datos del usuario
- Verificar que el id es un número positivo

**Test 5: User Registration Invalid Data**
- Enviar POST a /api/auth/register con datos inválidos
- Verificar que retorna status 400
- Verificar que retorna un mensaje de error descriptivo

**Test 6: User Registration Duplicate Login Code**
- Crear un usuario
- Intentar crear otro con el mismo login_code
- Verificar que retorna status 409
- Verificar que retorna un mensaje de error descriptivo

### Property-Based Tests

**Property Test 1: Sequence Creation**
- **Feature**: fix-user-registration-error-500, Property 1: Sequence Creation
- Ejecutar fix script múltiples veces
- Verificar que la secuencia siempre existe después

**Property Test 2: User Creation Round Trip**
- **Feature**: fix-user-registration-error-500, Property 5: User Creation Success
- Generar datos de usuario aleatorios válidos
- Crear usuario via API
- Verificar que se retorna status 201
- Verificar que el usuario existe en la base de datos

**Property Test 3: Invalid Data Rejection**
- **Feature**: fix-user-registration-error-500, Property 7: Invalid Data Rejection
- Generar datos inválidos aleatorios
- Enviar POST a /api/auth/register
- Verificar que retorna status 400

**Property Test 4: Duplicate Prevention**
- **Feature**: fix-user-registration-error-500, Property 8: Duplicate Login Code Prevention
- Crear usuario con login_code X
- Intentar crear otro con login_code X
- Verificar que retorna status 409

### Testing Configuration

- Mínimo 100 iteraciones por property test
- Usar biblioteca de property-based testing apropiada (fast-check para JavaScript)
- Cada test debe ser independiente y no afectar otros tests
- Usar transacciones para limpiar datos después de cada test
