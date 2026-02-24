# 🔧 Bugfix - Token Issue en Preferencias de Vistas

## Problema
El botón "Guardar" no hacía nada. El modal se quedaba quieto sin responder.

## Causa Raíz
El hook `useViewPreferences` estaba recibiendo `user.token` como parámetro, pero el tipo `User` no tiene la propiedad `token`. Por lo tanto, siempre recibía `null` y no podía autenticarse con el backend.

## Solución
Cambiar el hook para obtener el token directamente de `localStorage.getItem('auth_token')` en lugar de recibirlo como parámetro.

## Cambios Realizados

### 1. Hook useViewPreferences.ts
```typescript
// Antes: Recibía token como parámetro
export const useViewPreferences = (token: string | null) => {
  // ...
}

// Después: Obtiene token de localStorage
export const useViewPreferences = () => {
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  };
  // ...
}
```

### 2. Layouts Actualizados
- AdminLayout.tsx
- GeneralUserLayout.tsx
- DiseñadoraLayout.tsx

Cambio en todos:
```typescript
// Antes
const { preferences, savePreferences, loading: preferencesLoading } = useViewPreferences(user.token || null);

// Después
const { preferences, savePreferences, loading: preferencesLoading } = useViewPreferences();
```

## Cómo Funciona Ahora

1. Usuario hace click en "Personalizar"
2. Se abre el modal
3. Usuario arrastra para reordenar
4. Usuario hace click en "Guardar Orden"
5. El hook obtiene el token de localStorage
6. Envía la solicitud al backend con autenticación
7. Backend guarda en la BD
8. Modal se cierra
9. Las vistas se muestran en el nuevo orden

## Verificación

Para verificar que funciona:

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Personaliza el orden de vistas
4. Haz click en "Guardar Orden"
5. Deberías ver logs como:
   - "Enviando preferencias al servidor: [...]"
   - "Respuesta del servidor: 200"
   - "Datos recibidos: {...}"
6. El modal se cerrará
7. Recarga la página (F5)
8. El orden debería mantenerse

## Archivos Modificados

- ✅ `Prendas/src/hooks/useViewPreferences.ts` - Reescrito para obtener token de localStorage
- ✅ `Prendas/src/components/HomeView/AdminLayout.tsx` - Actualizado
- ✅ `Prendas/src/components/HomeView/GeneralUserLayout.tsx` - Actualizado
- ✅ `Prendas/src/components/HomeView/DiseñadoraLayout.tsx` - Actualizado

## Estado

✅ **CORREGIDO** - El botón "Guardar" ahora funciona correctamente

---

**Fecha de corrección:** 2026-02-24
