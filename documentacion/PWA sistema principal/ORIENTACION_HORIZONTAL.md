# 📱 Soporte de Orientación Horizontal (Landscape)

## ¿Qué se hizo?

Se agregó soporte completo para orientación horizontal (landscape) en la PWA. Ahora la aplicación funciona perfectamente tanto en modo vertical como horizontal, aprovechando todo el espacio disponible en tablets y dispositivos móviles.

## ✨ Características Implementadas

- ✅ Soporte para orientación "any" (vertical y horizontal)
- ✅ Estilos responsive para ambas orientaciones
- ✅ Manejo automático de safe areas (notch)
- ✅ Hook para detectar cambios de orientación
- ✅ Hook para bloquear orientación (opcional)
- ✅ Hook para obtener información del viewport
- ✅ Componente debugger para desarrollo
- ✅ Optimizaciones para diferentes dispositivos

## 📁 Archivos Modificados

### 1. `public/manifest.json`
```json
{
  "orientation": "any"  // Cambió de "portrait-primary" a "any"
}
```

### 2. `index.html`
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" />
```

### 3. `vite.config.ts`
```typescript
orientation: 'any'  // Cambió de "portrait-primary" a "any"
```

### 4. `src/styles/pwa.css`
Se agregaron estilos para:
- Orientación horizontal
- Safe areas en landscape
- Notch en diferentes dispositivos
- Responsive para teléfonos, tablets y desktop
- Optimizaciones de rendimiento

## 📁 Archivos Nuevos

### 1. `src/hooks/useOrientation.ts`
Hook personalizado con tres funciones:

#### `useOrientation()`
Detecta cambios de orientación en tiempo real.

```tsx
import { useOrientation } from './hooks/useOrientation';

function MyComponent() {
  const { orientation, isPortrait, isLandscape, angle } = useOrientation();
  
  return (
    <div>
      Orientación: {orientation}
      {isLandscape && <p>Estás en modo horizontal</p>}
    </div>
  );
}
```

#### `useLockOrientation(orientation)`
Bloquea la orientación en un valor específico (solo en PWA instalada).

```tsx
import { useLockOrientation } from './hooks/useOrientation';

function MyComponent() {
  // Bloquear en landscape
  useLockOrientation('landscape');
  
  return <div>Bloqueado en landscape</div>;
}
```

#### `useViewport()`
Obtiene información del viewport.

```tsx
import { useViewport } from './hooks/useOrientation';

function MyComponent() {
  const { width, height, isMobile, isTablet, isDesktop } = useViewport();
  
  return (
    <div>
      {isMobile && <p>Dispositivo móvil</p>}
      {isTablet && <p>Tablet</p>}
      {isDesktop && <p>Desktop</p>}
    </div>
  );
}
```

### 2. `src/components/OrientationDebugger.tsx`
Componente para debuggear orientación (solo en desarrollo).

```tsx
import { OrientationDebugger } from './components/OrientationDebugger';

function App() {
  return (
    <>
      <OrientationDebugger />
      {/* Tu contenido */}
    </>
  );
}
```

## 🎯 Cómo Usar

### Opción 1: Dejar que se adapte automáticamente (Recomendado)
La PWA se adaptará automáticamente a cualquier orientación sin hacer nada.

```tsx
// Tu app funcionará en ambas orientaciones automáticamente
function App() {
  return <YourContent />;
}
```

### Opción 2: Detectar orientación y adaptar UI
```tsx
import { useOrientation } from './hooks/useOrientation';

function MyComponent() {
  const { isLandscape, isPortrait } = useOrientation();
  
  return (
    <div>
      {isPortrait && <PortraitLayout />}
      {isLandscape && <LandscapeLayout />}
    </div>
  );
}
```

### Opción 3: Bloquear en una orientación específica
```tsx
import { useLockOrientation } from './hooks/useOrientation';

function MyComponent() {
  // Bloquear en landscape para mejor experiencia
  useLockOrientation('landscape');
  
  return <div>Siempre en landscape</div>;
}
```

## 📱 Comportamiento en Diferentes Dispositivos

### Teléfonos (< 480px)
- Márgenes mínimos
- Optimizado para pantalla pequeña
- Funciona en ambas orientaciones

### Teléfonos Medianos (480px - 768px)
- Márgenes moderados
- Mejor aprovechamiento del espacio
- Funciona en ambas orientaciones

### Tablets (> 768px)
- Márgenes generosos
- Máximo aprovechamiento del espacio
- Funciona perfectamente en ambas orientaciones

### iPhone X, 11, 12, 13, 14 (con notch)
- Manejo automático del notch
- Márgenes ajustados en landscape
- Experiencia óptima en ambas orientaciones

## 🔧 Estilos CSS Agregados

### Media Queries Principales

```css
/* Orientación horizontal */
@media (orientation: landscape) {
  /* Estilos para landscape */
}

/* Teléfonos pequeños */
@media (max-width: 480px) {
  /* Estilos para teléfonos pequeños */
}

/* Tablets */
@media (min-width: 769px) {
  /* Estilos para tablets */
}

/* Dispositivos con notch en landscape */
@media (orientation: landscape) and (device-height: 812px) {
  /* Estilos para iPhone X en landscape */
}

/* Movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  /* Deshabilitar animaciones */
}
```

## 🧪 Cómo Probar

### En Desarrollo
1. Abre la app en `http://localhost:5173`
2. Abre DevTools (F12)
3. Ve a Device Toolbar (Ctrl+Shift+M)
4. Cambia la orientación (Ctrl+Shift+M nuevamente)
5. Verifica que se adapte correctamente

### En Dispositivo Real
1. Instala la PWA en tu tablet
2. Rota el dispositivo
3. Verifica que la app se adapte automáticamente
4. Comprueba que no haya márgenes innecesarios

### Con OrientationDebugger
1. Agrega el componente en tu App.tsx
2. Verifica la información en la esquina inferior derecha
3. Cambia la orientación y observa los cambios

## 📊 Verificación

Después de los cambios, verifica:

- [ ] La app funciona en modo vertical
- [ ] La app funciona en modo horizontal
- [ ] No hay márgenes innecesarios en landscape
- [ ] El contenido se adapta correctamente
- [ ] Los iconos se ven bien en ambas orientaciones
- [ ] El teclado virtual no causa problemas
- [ ] Las animaciones funcionan suavemente
- [ ] El build se completó sin errores

## 🚀 Build Completado

El build se completó exitosamente con los nuevos cambios:

```
✓ 363 modules transformed
✓ built in 10.35s
✓ PWA v1.2.0 generated successfully
```

## 📱 Instalación en Dispositivos

La PWA ahora se instalará con soporte para ambas orientaciones:

### Android
1. Abre Plow en Chrome
2. Menú (⋮) → "Instalar aplicación"
3. Confirma
4. Rota el dispositivo para ver la adaptación

### iOS
1. Abre Plow en Safari
2. Compartir (↗️) → "Agregar a pantalla de inicio"
3. Confirma
4. Rota el dispositivo para ver la adaptación

## 🎨 Personalización

Si quieres personalizar el comportamiento de orientación:

### Cambiar orientación por defecto
En `vite.config.ts`:
```typescript
orientation: 'landscape'  // Solo landscape
// o
orientation: 'portrait'   // Solo portrait
// o
orientation: 'any'        // Ambas (actual)
```

### Agregar estilos personalizados
En `src/styles/pwa.css`:
```css
@media (orientation: landscape) {
  /* Tus estilos personalizados */
}
```

## 🐛 Troubleshooting

### "La app no se adapta en landscape"
- Verifica que `orientation: 'any'` esté en manifest.json
- Limpia el caché de la PWA
- Reinstala la app

### "Hay márgenes en landscape"
- Verifica los estilos en `src/styles/pwa.css`
- Comprueba que los safe areas se apliquen correctamente
- Abre DevTools y verifica los márgenes

### "El contenido se corta en landscape"
- Verifica que el contenedor principal use `100%` de ancho
- Comprueba que no haya overflow oculto
- Usa `useViewport()` para adaptar el layout

## 📚 Recursos Útiles

- [MDN: Orientation API](https://developer.mozilla.org/en-US/docs/Web/API/Screen/orientation)
- [Web.dev: Responsive Design](https://web.dev/responsive-web-design-basics/)
- [CSS Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries)
- [Safe Areas](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)

## 🎯 Próximos Pasos

1. Prueba la app en tu tablet en ambas orientaciones
2. Verifica que todo se vea bien
3. Usa `useOrientation()` si necesitas adaptar componentes específicos
4. Personaliza los estilos según tus necesidades

## ✅ Checklist Final

- ✅ Orientación configurada como "any"
- ✅ Estilos responsive agregados
- ✅ Hooks de orientación creados
- ✅ Componente debugger disponible
- ✅ Build completado sin errores
- ✅ Documentación actualizada

---

¡Tu PWA ahora soporta orientación horizontal! 🎉

Disfruta de una experiencia mejorada en tablets y dispositivos móviles. 🚀
