# Inicio Rápido - Usuario Soporte

## 🚀 En 3 Pasos

### Paso 1: Crear el Usuario Soporte

```bash
cd Prendas/backend
node scripts/init-soporte-user.js
```

**Resultado esperado:**
```
✅ Usuario Soporte creado exitosamente:
   ID: [uuid]
   Nombre: Soporte
   Login Code: SOP
   PIN: 3438
   Rol: soporte
   Activo: true
```

### Paso 2: Verificar en Base de Datos

```bash
psql -U usuario -d inventario -c "SELECT * FROM users WHERE login_code = 'SOP';"
```

Deberías ver una fila con el usuario Soporte.

### Paso 3: Probar Login

1. Abre la aplicación
2. Ingresa:
   - **Login Code**: `SOP`
   - **PIN**: `3438`
3. ✅ Deberías tener acceso completo

---

## 📋 Credenciales

| Campo | Valor |
|-------|-------|
| **Nombre** | Soporte |
| **Login Code** | SOP |
| **PIN** | 3438 |
| **Rol** | soporte |
| **Permisos** | Admin (acceso completo) |

---

## ✅ Verificación Rápida

### En Maestras → Usuarios

- ✅ Usuario "Soporte" aparece en la lista
- ✅ Tiene etiqueta "Sistema" (amarilla)
- ✅ Botón "Editar" está deshabilitado
- ✅ Botón "Eliminar" no aparece
- ✅ Avatar es ámbar

### Permisos

- ✅ Acceso a Dashboard
- ✅ Acceso a Maestras
- ✅ Acceso a Usuarios
- ✅ Acceso a Clientes
- ✅ Acceso a Vendedores
- ✅ Acceso a Confeccionistas
- ✅ Acceso a Referencias
- ✅ Acceso a Pedidos
- ✅ Acceso a Fechas de Entrega

---

## 🔒 Protecciones

### No se puede:
- ❌ Crear otro usuario con login code "SOP"
- ❌ Editar el usuario Soporte desde maestras
- ❌ Eliminar el usuario Soporte desde maestras

### Se puede:
- ✅ Hacer login con SOP / 3438
- ✅ Acceder a todas las secciones
- ✅ Gestionar otros usuarios
- ✅ Cambiar PIN (si es necesario)

---

## 🆘 Problemas Comunes

### "El usuario Soporte no aparece"
```bash
# Ejecuta el script nuevamente
node scripts/init-soporte-user.js
```

### "No puedo hacer login"
- Verifica PIN: `3438`
- Verifica Login Code: `SOP` (mayúsculas)

### "No tengo permisos de admin"
- Recarga la página
- Limpia el caché del navegador

---

## 📚 Documentación Completa

Para más detalles, consulta:
- `USUARIO_SOPORTE_README.md` - Documentación completa
- `IMPLEMENTACION_USUARIO_SOPORTE.md` - Cambios realizados
- `VERIFICACION_USUARIO_SOPORTE.md` - Checklist de verificación

---

## ✨ ¡Listo!

El usuario Soporte está configurado y listo para usar.

**Login**: SOP / 3438
