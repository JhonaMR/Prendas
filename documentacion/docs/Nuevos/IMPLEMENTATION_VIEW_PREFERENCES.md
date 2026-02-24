# Implementación: Selector de Orden de Vistas por Usuario

## Resumen
Se ha implementado un sistema completo que permite a cada usuario personalizar el orden de las vistas en su homeview. Cada rol (Admin, GeneralUser, Diseñadora) tiene su propio conjunto de vistas y colores.

## Archivos Creados

### Backend

#### 1. Script SQL
- **Archivo:** `Prendas/backend/scripts/create-user-view-preferences-table.sql`
- **Descripción:** Crea la tabla `user_view_preferences` con:
  - Almacenamiento de orden de vistas en formato JSON
  - Índice para búsquedas rápidas
  - Trigger para actualizar timestamp automáticamente

#### 2. Controlador
- **Archivo:** `Prendas/backend/src/controllers/userPreferencesController.js`
- **Funciones:**
  - `getUserPreferences`: GET /api/user/preferences
  - `saveUserPreferences`: POST /api/user/preferences

#### 3. Rutas
- **Archivo:** `Prendas/backend/src/routes/index.js` (modificado)
- **Endpoints agregados:**
  - `GET /api/user/preferences` - Obtener preferencias
  - `POST /api/user/preferences` - Guardar preferencias

### Frontend

#### 1. Hook personalizado
- **Archivo:** `Prendas/src/hooks/useViewPreferences.ts`
- **Funcionalidad:**
  - Obtiene preferencias del usuario
  - Guarda preferencias en la BD
  - Maneja loading y errores

#### 2. Componente Modal
- **Archivo:** `Prendas/src/components/HomeView/ViewOrderModal.tsx`
- **Características:**
  - Drag-and-drop para reordenar vistas
  - Soporte para 3 esquemas de color (pink, blue, green)
  - Indicador de posición
  - Botones de guardar/cancelar

#### 3. Layouts Actualizados
- **AdminLayout.tsx** - Color rosa (pink)
- **GeneralUserLayout.tsx** - Color azul (blue)
- **DiseñadoraLayout.tsx** - Color verde (green)

**Cambios en cada layout:**
- Botón "Personalizar" en la esquina superior derecha
- Vistas reordenadas según preferencias guardadas
- Modal integrado para personalización

## Flujo de Funcionamiento

### Primera vez que el usuario entra:
1. El hook `useViewPreferences` obtiene preferencias (array vacío si no existen)
2. Las vistas se muestran en orden por defecto
3. Usuario hace click en "Personalizar"
4. Se abre el modal con todas las vistas disponibles

### Cuando el usuario personaliza:
1. Usuario arrastra vistas para reordenarlas
2. Hace click en "Guardar Orden"
3. El hook envía el nuevo orden al backend
4. Backend guarda en la BD
5. Las vistas se reordenan inmediatamente en el frontend

### Próximas veces que entra:
1. El hook obtiene las preferencias guardadas
2. Las vistas se muestran en el orden personalizado

## Características por Rol

### Admin (AdminLayout)
- **Color:** Rosa (pink)
- **Vistas:** 17 opciones (fichas, recepciones, despachos, inventario, etc.)
- **Botón:** Rosa con ícono de personalización

### Usuario General (GeneralUserLayout)
- **Color:** Azul (blue)
- **Vistas:** 13 opciones (recepción, despachos, inventario, pedidos, etc.)
- **Botón:** Azul con ícono de personalización

### Diseñadora (DiseñadoraLayout)
- **Color:** Verde (green)
- **Vistas:** 6 opciones (fichas de diseño, fichas de costo, maletas, etc.)
- **Botón:** Verde con ícono de personalización

## Instalación y Setup

### 1. Ejecutar script SQL
```bash
cd Prendas/backend
psql -U postgres -d inventory -f scripts/create-user-view-preferences-table.sql
```

### 2. Reiniciar el backend
El backend automáticamente cargará las nuevas rutas.

### 3. Verificar en el frontend
- Ir a la página de inicio (HomeView)
- Debería aparecer el botón "Personalizar" en la esquina superior derecha
- Hacer click para abrir el modal

## Detalles Técnicos

### Base de Datos
- **Tabla:** `user_view_preferences`
- **Campos:**
  - `id` (SERIAL PRIMARY KEY)
  - `user_id` (INTEGER UNIQUE, FOREIGN KEY)
  - `view_order` (JSONB) - Array de IDs de vistas
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)

### API
- **Autenticación:** JWT (Bearer token)
- **Formato:** JSON
- **Errores:** Manejo completo con mensajes descriptivos

### Frontend
- **Estado:** Manejado con hooks de React
- **Persistencia:** LocalStorage + Backend
- **Drag-and-drop:** Implementado con eventos nativos de HTML5

## Notas Importantes

1. **Cada usuario tiene sus propias preferencias** - No afecta a otros usuarios
2. **Orden por defecto** - Si no hay preferencias guardadas, se usa el orden por defecto
3. **Colores consistentes** - El modal usa el mismo color que el layout del usuario
4. **Responsive** - Funciona en desktop y mobile
5. **Accesibilidad** - Botón visible y fácil de encontrar

## Próximas Mejoras (Opcionales)

- Agregar presets de orden (ej: "Más usado", "Alfabético")
- Permitir ocultar vistas
- Sincronización en tiempo real entre dispositivos
- Historial de cambios
- Exportar/importar configuración
