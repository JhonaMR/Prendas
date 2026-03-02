# Usuario Soporte - Documentación

## Descripción

El usuario "Soporte" es un usuario especial del sistema con las siguientes características:

- **Rol**: `soporte` (equivalente a admin en permisos)
- **Login Code**: `SOP`
- **PIN**: `3438`
- **Nombre**: `Soporte`
- **Permisos**: Acceso completo (igual a admin)

## Características Especiales

### Restricciones

1. **No se puede crear otro usuario con login code "SOP"**
   - El sistema rechaza intentos de crear usuarios con este código
   - Está reservado exclusivamente para el usuario del sistema

2. **No se puede editar desde Maestras**
   - El botón "Editar" está deshabilitado para este usuario
   - El backend rechaza intentos de actualización

3. **No se puede eliminar desde Maestras**
   - El botón "Eliminar" no aparece para este usuario
   - El backend rechaza intentos de eliminación

4. **Indicador Visual**
   - En la interfaz de Maestras, el usuario Soporte tiene:
     - Fondo amarillo claro
     - Etiqueta "Sistema" en la esquina superior derecha
     - Avatar con gradiente ámbar

## Inicialización

### Opción 1: Script Node.js (Recomendado)

```bash
cd Prendas/backend
node scripts/init-soporte-user.js
```

Este script:
- Verifica si el usuario ya existe
- Genera el hash bcrypt del PIN
- Crea el usuario en la base de datos
- Muestra confirmación con los detalles

### Opción 2: Script SQL

```bash
psql -U usuario -d inventario -f Prendas/backend/scripts/init-soporte-user.sql
```

**Nota**: El script SQL requiere que actualices el hash bcrypt manualmente.

### Opción 3: Generar Hash Manualmente

Si necesitas generar el hash bcrypt del PIN:

```bash
cd Prendas/backend
node scripts/generate-soporte-hash.js
```

Esto mostrará el hash que puedes usar en el script SQL.

## Permisos

El usuario Soporte tiene los siguientes permisos (igual a admin):

- ✅ Acceso a Dashboard
- ✅ Gestión de Usuarios
- ✅ Gestión de Clientes
- ✅ Gestión de Vendedores
- ✅ Gestión de Confeccionistas
- ✅ Gestión de Referencias
- ✅ Gestión de Pedidos
- ✅ Gestión de Fechas de Entrega
- ✅ Ver Auditoría
- ✅ Gestión de Caché

## Cambios en el Código

### Backend

1. **authController.js**
   - `register()`: Rechaza intentos de crear usuario con login code "SOP"
   - `updateUser()`: Rechaza intentos de editar usuario Soporte
   - `deleteUser()`: Rechaza intentos de eliminar usuario Soporte

2. **middleware/auth.js**
   - `verifyAdmin()`: Acepta tanto "admin" como "soporte"
   - `verifyAdminOrObserver()`: Acepta "admin", "observer" y "soporte"

3. **utils/permissions.js**
   - `isSoporte()`: Nueva función para verificar si es usuario Soporte
   - `isSystemSupportUser()`: Verifica si es el usuario del sistema específico
   - Todas las funciones de permisos actualizadas para incluir "soporte"

### Frontend

1. **types.ts**
   - Agregado `SOPORTE = 'soporte'` al enum `UserRole`

2. **context/AuthContext.tsx**
   - Permisos de admin asignados también a rol "soporte"

3. **views/MastersView.tsx**
   - Usuario Soporte tiene indicador visual "Sistema"
   - Botón "Editar" deshabilitado para usuario Soporte
   - Botón "Eliminar" oculto para usuario Soporte
   - Fondo diferenciado (amarillo claro)

## Flujo de Autenticación

1. Usuario ingresa login code "SOP" y PIN "3438"
2. Backend verifica credenciales
3. Si son correctas, genera JWT con rol "soporte"
4. Frontend recibe token y establece usuario con rol "soporte"
5. Todos los permisos de admin se asignan automáticamente

## Seguridad

- El PIN está hasheado con bcrypt (10 rounds)
- No se puede cambiar el login code "SOP"
- No se puede cambiar el rol a otro valor
- No se puede eliminar el usuario
- Todas las operaciones están protegidas en el backend

## Troubleshooting

### El usuario Soporte no aparece en la lista

1. Verifica que el script de inicialización se ejecutó correctamente
2. Comprueba que el usuario existe en la BD:
   ```sql
   SELECT * FROM users WHERE login_code = 'SOP';
   ```

### No puedo hacer login con Soporte

1. Verifica que el PIN es correcto: `3438`
2. Verifica que el login code es: `SOP` (mayúsculas)
3. Comprueba que el usuario está activo en la BD

### El usuario Soporte aparece pero sin permisos

1. Verifica que el rol en la BD es exactamente: `soporte` (minúsculas)
2. Recarga la página o limpia el caché del navegador
3. Verifica que el token JWT contiene el rol correcto

## Notas Importantes

- Este usuario es especial y no debe ser modificado manualmente en la BD
- Si necesitas cambiar el PIN, debes hacerlo a través de la API de cambio de PIN
- El usuario Soporte es singleton: solo existe uno
- No se puede crear otro usuario con el mismo login code "SOP"
