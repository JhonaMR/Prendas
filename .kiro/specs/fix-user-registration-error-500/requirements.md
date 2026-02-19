# Requirements Document: Fix User Registration Error 500

## Introduction

El endpoint POST /api/auth/register está retornando error 500 cuando se intenta crear un nuevo usuario desde el login. Este problema es idéntico al que se resolvió recientemente con la tabla `reception_items`: la tabla `users` no tiene la secuencia auto-incremento configurada correctamente en el campo `id`. Cuando el código intenta insertar un usuario con un ID generado manualmente, la base de datos falla porque el campo `id` no tiene un valor por defecto válido.

## Glossary

- **Secuencia (Sequence)**: Objeto de PostgreSQL que genera números únicos e incrementales automáticamente
- **Auto-incremento**: Mecanismo que asigna automáticamente un valor único a un campo cuando se inserta un registro
- **Constraint**: Restricción de integridad en la base de datos
- **users table**: Tabla que almacena información de usuarios del sistema
- **id field**: Campo identificador único de la tabla users
- **Error 500**: Error interno del servidor que indica un fallo no controlado en la aplicación

## Requirements

### Requirement 1: Diagnosticar la configuración actual de la tabla users

**User Story:** Como desarrollador, quiero diagnosticar la configuración actual de la tabla `users`, para entender por qué el campo `id` no está generando valores automáticamente.

#### Acceptance Criteria

1. WHEN se ejecuta el script de diagnóstico, THE System SHALL verificar si la tabla `users` existe en la base de datos
2. WHEN se ejecuta el script de diagnóstico, THE System SHALL mostrar la estructura actual de la tabla `users` incluyendo todas las columnas, tipos de datos y valores por defecto
3. WHEN se ejecuta el script de diagnóstico, THE System SHALL verificar si existe una secuencia para el campo `id` de la tabla `users`
4. WHEN se ejecuta el script de diagnóstico, THE System SHALL mostrar el estado actual del campo `id` (si tiene default configurado o no)
5. WHEN se ejecuta el script de diagnóstico, THE System SHALL generar un reporte claro indicando qué está faltando o mal configurado

### Requirement 2: Crear la secuencia para el campo id de users

**User Story:** Como desarrollador, quiero crear la secuencia auto-incremento para la tabla `users`, para que el campo `id` genere valores automáticamente.

#### Acceptance Criteria

1. WHEN se ejecuta el script de corrección, THE System SHALL crear una secuencia llamada `users_id_seq` si no existe
2. WHEN se crea la secuencia, THE System SHALL configurarla para comenzar en 1 e incrementar de 1 en 1
3. WHEN se crea la secuencia, THE System SHALL vincularla a la tabla `users` usando OWNED BY
4. WHEN se configura la secuencia, THE System SHALL establecer el default del campo `id` para usar `nextval('users_id_seq')`

### Requirement 3: Verificar la configuración final

**User Story:** Como desarrollador, quiero verificar que la secuencia está correctamente configurada, para asegurar que el registro de usuarios funcionará sin errores.

#### Acceptance Criteria

1. WHEN se completa la corrección, THE System SHALL verificar que el campo `id` tiene un default válido
2. WHEN se completa la corrección, THE System SHALL verificar que la secuencia `users_id_seq` existe y está vinculada
3. WHEN se completa la corrección, THE System SHALL mostrar un reporte final confirmando que la configuración es correcta
4. WHEN se completa la corrección, THE System SHALL proporcionar instrucciones sobre cómo probar que el registro de usuarios funciona correctamente

### Requirement 4: Resolver el error 500 en el endpoint de registro

**User Story:** Como usuario, quiero poder registrar un nuevo usuario desde el login sin recibir un error 500, para que el sistema funcione correctamente.

#### Acceptance Criteria

1. WHEN se envía una solicitud POST a /api/auth/register con datos válidos, THE System SHALL crear el usuario exitosamente
2. WHEN se crea un usuario exitosamente, THE System SHALL retornar un código de estado 201 (Created)
3. WHEN se crea un usuario exitosamente, THE System SHALL retornar los datos del usuario creado incluyendo el id generado automáticamente
4. WHEN se intenta crear un usuario con datos inválidos, THE System SHALL retornar un error 400 (Bad Request) con un mensaje descriptivo
5. WHEN se intenta crear un usuario con un login_code duplicado, THE System SHALL retornar un error 409 (Conflict) con un mensaje descriptivo

### Requirement 5: Documentar la solución para futuras referencias

**User Story:** Como desarrollador, quiero documentar cómo se resolvió este problema, para que en el futuro se pueda aplicar la misma solución a otras tablas si es necesario.

#### Acceptance Criteria

1. WHEN se completa la corrección, THE System SHALL crear un documento explicando el problema y la solución
2. WHEN se documenta la solución, THE System SHALL incluir los pasos exactos que se ejecutaron
3. WHEN se documenta la solución, THE System SHALL incluir referencias al problema anterior con `reception_items` para mostrar el patrón
4. WHEN se documenta la solución, THE System SHALL incluir instrucciones para prevenir este problema en futuras tablas
