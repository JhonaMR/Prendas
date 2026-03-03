# 🎨 Personalizar Iconos PWA

Los iconos PWA se generaron automáticamente, pero puedes personalizarlos con tu propio diseño.

## 📋 Opciones

### Opción 1: Usar Iconos Personalizados (Recomendado)

Si tienes tus propios iconos PNG:

1. **Prepara tus iconos** en estos tamaños:
   - `pwa-192x192.png` (192x192 píxeles)
   - `pwa-512x512.png` (512x512 píxeles)
   - `pwa-maskable-192x192.png` (192x192 píxeles, con espacio para máscara)
   - `pwa-maskable-512x512.png` (512x512 píxeles, con espacio para máscara)

2. **Reemplaza los archivos** en `public/`:
   ```
   public/
   ├── pwa-192x192.png
   ├── pwa-512x512.png
   ├── pwa-maskable-192x192.png
   └── pwa-maskable-512x512.png
   ```

3. **Regenera los screenshots** (opcional):
   - `pwa-screenshot-540x720.png` (540x720 píxeles)
   - `pwa-screenshot-1280x720.png` (1280x720 píxeles)

### Opción 2: Regenerar Iconos Automáticamente

Si quieres cambiar el diseño de los iconos generados:

1. **Edita el script** `scripts/generate-pwa-icons.js`
2. **Modifica las funciones** `createIcon()` y `createScreenshot()`
3. **Ejecuta el script**:
   ```bash
   npm run generate-pwa-icons
   ```

## 🎯 Requisitos de Iconos

### Iconos Estándar
- **Formato**: PNG
- **Tamaños**: 192x192 y 512x512 píxeles
- **Fondo**: Puede ser transparente o sólido
- **Propósito**: `any`

### Iconos Maskable
- **Formato**: PNG
- **Tamaños**: 192x192 y 512x512 píxeles
- **Fondo**: Debe ser sólido (sin transparencia)
- **Diseño**: Debe funcionar con máscara circular
- **Propósito**: `maskable`
- **Nota**: Android puede recortar el icono en forma circular

### Screenshots
- **Formato**: PNG
- **Tamaños**: 
  - Móvil: 540x720 píxeles
  - Desktop: 1280x720 píxeles
- **Contenido**: Captura de pantalla de la app

## 🛠️ Herramientas Recomendadas

### Para Crear Iconos
- **Figma** - Diseño online (gratuito)
- **Photoshop** - Edición profesional
- **GIMP** - Alternativa gratuita a Photoshop
- **Canva** - Diseño simplificado (gratuito)
- **Inkscape** - Diseño vectorial (gratuito)

### Para Convertir Tamaños
- **ImageMagick** - Línea de comandos
- **FFmpeg** - Conversión de medios
- **Online-Convert** - Herramienta online

## 📝 Ejemplo: Cambiar Color del Icono

Si quieres cambiar el color del icono generado:

1. **Abre** `scripts/generate-pwa-icons.js`
2. **Busca** la línea con `#3b82f6` (azul actual)
3. **Reemplaza** con tu color (ej: `#ff6b6b` para rojo)
4. **Ejecuta**:
   ```bash
   npm run generate-pwa-icons
   ```

## 🎨 Colores Recomendados

Usa colores que contrasten bien:

```
Azul:       #3b82f6 (actual)
Rojo:       #ef4444
Verde:      #10b981
Púrpura:    #8b5cf6
Naranja:    #f97316
Rosa:       #ec4899
```

## 📐 Dimensiones Exactas

### Para Iconos PNG
```
192x192 píxeles = 1x (base)
512x512 píxeles = 2.67x (grande)
```

### Para Screenshots
```
Móvil:   540x720 píxeles (3:4)
Desktop: 1280x720 píxeles (16:9)
```

## ✅ Checklist de Iconos

Antes de usar tus iconos personalizados:

- [ ] Todos los PNG tienen el tamaño correcto
- [ ] Los iconos maskable tienen fondo sólido
- [ ] Los iconos se ven bien en diferentes tamaños
- [ ] Los colores contrastan bien
- [ ] Los archivos están en `public/`
- [ ] Los nombres coinciden exactamente
- [ ] Ejecuté `npm run build` sin errores

## 🔄 Actualizar Manifest

Si cambias los nombres de los iconos, actualiza `public/manifest.json`:

```json
{
  "icons": [
    {
      "src": "/tu-icono-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/tu-icono-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ]
}
```

## 🧪 Probar Iconos

1. **Abre DevTools** (F12)
2. **Ve a** Application → Manifest
3. **Verifica** que los iconos se carguen correctamente
4. **Prueba** en un dispositivo real

## 📱 Cómo se Ven los Iconos

### Android
- **Pantalla de inicio**: 192x192 o 512x512 (según dispositivo)
- **Forma**: Puede ser circular (maskable)
- **Fondo**: Se aplica automáticamente

### iOS
- **Pantalla de inicio**: 192x192
- **Forma**: Cuadrada con esquinas redondeadas
- **Fondo**: Se aplica automáticamente

### Desktop
- **Barra de tareas**: 32x32 (escalado automático)
- **Menú de inicio**: 128x128 (escalado automático)
- **Forma**: Cuadrada

## 🚀 Después de Personalizar

1. **Regenera el build**:
   ```bash
   npm run build
   ```

2. **Limpia el caché**:
   - DevTools → Application → Clear storage

3. **Prueba en dispositivos**:
   - Android
   - iOS
   - Desktop

4. **Verifica en Lighthouse**:
   - DevTools → Lighthouse → PWA

## 💡 Tips

- Usa colores vibrantes que se destaquen
- Asegúrate de que el icono sea reconocible en pequeño
- Prueba en diferentes fondos de pantalla
- Mantén consistencia con tu marca
- Usa iconos maskable para mejor compatibilidad con Android

## 🎯 Próximos Pasos

1. Personaliza tus iconos
2. Reemplaza los archivos en `public/`
3. Ejecuta `npm run build`
4. Prueba en tus dispositivos
5. ¡Disfruta tu PWA personalizada!

---

¿Necesitas ayuda? Revisa `PWA_QUICK_START.md` o `PWA_INSTALLATION_GUIDE.md`
