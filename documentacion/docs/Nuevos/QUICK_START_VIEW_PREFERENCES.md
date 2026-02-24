# Quick Start - Selector de Orden de Vistas

## Pasos para activar la funcionalidad

### 1. Ejecutar el script SQL (Backend)
```bash
cd Prendas/backend
psql -U postgres -d inventory -f scripts/create-user-view-preferences-table.sql
```

Si tienes problemas con el comando, intenta:
```powershell
# PowerShell
psql -U postgres -d inventory -f scripts/create-user-view-preferences-table.sql
```

### 2. Reiniciar el backend
El backend cargará automáticamente las nuevas rutas.

### 3. Verificar en el frontend
- Abre la aplicación
- Ve a la página de inicio (HomeView)
- Deberías ver un botón "Personalizar" en la esquina superior derecha
- Haz click para abrir el modal

## Cómo usar

1. **Abre el modal:** Click en el botón "Personalizar"
2. **Arrastra las vistas:** Usa drag-and-drop para reordenarlas
3. **Guarda:** Click en "Guardar Orden"
4. **Listo:** Las vistas se mostrarán en tu orden personalizado

## Características

✅ Cada usuario tiene su propio orden personalizado
✅ Drag-and-drop intuitivo
✅ Colores según el rol del usuario
✅ Persiste en la base de datos
✅ Funciona en desktop y mobile

## Archivos Modificados

- `Prendas/backend/src/routes/index.js` - Agregadas rutas de preferencias
- `Prendas/src/components/HomeView/AdminLayout.tsx` - Botón y modal
- `Prendas/src/components/HomeView/GeneralUserLayout.tsx` - Botón y modal
- `Prendas/src/components/HomeView/DiseñadoraLayout.tsx` - Botón y modal

## Archivos Creados

- `Prendas/backend/scripts/create-user-view-preferences-table.sql` - Script SQL
- `Prendas/backend/src/controllers/userPreferencesController.js` - Controlador
- `Prendas/src/hooks/useViewPreferences.ts` - Hook personalizado
- `Prendas/src/components/HomeView/ViewOrderModal.tsx` - Componente modal

## Troubleshooting

### El botón "Personalizar" no aparece
- Verifica que el script SQL se ejecutó correctamente
- Recarga la página
- Abre la consola del navegador para ver errores

### El modal no guarda los cambios
- Verifica que el backend está corriendo
- Abre la consola del navegador para ver errores de red
- Verifica que tienes un token JWT válido

### Las vistas no se reordenan
- Verifica que el script SQL se ejecutó
- Intenta recargar la página
- Limpia el cache del navegador

## Documentación Completa

Ver `Prendas/IMPLEMENTATION_VIEW_PREFERENCES.md` para más detalles técnicos.
