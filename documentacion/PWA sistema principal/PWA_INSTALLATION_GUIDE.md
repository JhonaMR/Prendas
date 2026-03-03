# 📱 Guía de Instalación de Plow como PWA

Plow ahora es una Progressive Web App (PWA) que se puede instalar en tu tablet o celular como una aplicación nativa.

## ✅ Requisitos

- ✔️ HTTPS habilitado (en producción)
- ✔️ Manifest.json configurado
- ✔️ Service Worker registrado
- ✔️ Iconos PNG en diferentes tamaños
- ✔️ Meta tags de PWA

**Todos estos requisitos ya están configurados en el proyecto.**

## 📲 Instalación en Android

### Opción 1: Chrome (Recomendado)
1. Abre Plow en Chrome
2. Toca el menú (⋮) en la esquina superior derecha
3. Selecciona **"Instalar aplicación"** o **"Agregar a pantalla de inicio"**
4. Confirma la instalación
5. La app aparecerá en tu pantalla de inicio

### Opción 2: Firefox
1. Abre Plow en Firefox
2. Toca el menú (⋮)
3. Selecciona **"Instalar"**
4. Confirma

### Opción 3: Samsung Internet
1. Abre Plow en Samsung Internet
2. Toca el menú (⋮)
3. Selecciona **"Agregar a pantalla de inicio"**

## 🍎 Instalación en iOS (iPad/iPhone)

1. Abre Plow en Safari
2. Toca el botón **Compartir** (cuadro con flecha)
3. Desplázate y selecciona **"Agregar a pantalla de inicio"**
4. Dale un nombre (ej: "Plow")
5. Toca **"Agregar"**
6. La app aparecerá en tu pantalla de inicio

**Nota:** iOS tiene limitaciones con PWA. Algunas características pueden no funcionar igual que en Android.

## 🖥️ Instalación en Desktop (Windows/Mac/Linux)

### Chrome/Edge
1. Abre Plow en el navegador
2. Haz clic en el icono de instalación (⬇️) en la barra de direcciones
3. Haz clic en **"Instalar"**
4. La app se instalará como aplicación de escritorio

### Firefox
1. Abre Plow en Firefox
2. Haz clic en el menú (☰)
3. Selecciona **"Instalar aplicación"**

## 🔄 Actualizaciones Automáticas

El Service Worker se actualiza automáticamente cuando hay cambios en el servidor. Si ves un mensaje de actualización disponible:

1. Recarga la página (Ctrl+R o Cmd+R)
2. La nueva versión se instalará automáticamente

## 📡 Funcionamiento Offline

Una vez instalada, Plow funciona parcialmente sin conexión:

- ✅ Interfaz y navegación funcionan offline
- ✅ Datos en caché se muestran
- ✅ ❌ Las llamadas a API requieren conexión

## 🔧 Desarrollo Local

Para probar la PWA en desarrollo:

```bash
# Generar iconos PWA
npm run generate-pwa-icons

# Iniciar servidor de desarrollo
npm run dev

# Acceder a http://localhost:5173
```

## 🚀 Producción

Para desplegar como PWA en producción:

1. **Asegurar HTTPS**: Requerido para PWA
2. **Generar build**: `npm run build`
3. **Servir con HTTPS**: Usar certificados SSL válidos
4. **Verificar manifest.json**: Debe ser accesible en `/manifest.json`
5. **Verificar Service Worker**: Debe estar registrado correctamente

## 📋 Checklist de PWA

- ✅ manifest.json con iconos PNG
- ✅ Service Worker registrado
- ✅ Meta tags de PWA en HTML
- ✅ HTTPS en producción
- ✅ Iconos en 192x192 y 512x512
- ✅ Iconos maskable para Android
- ✅ Screenshots para app store
- ✅ Caché de recursos estáticos
- ✅ Estrategia de caché para API
- ✅ Soporte offline básico

## 🐛 Solución de Problemas

### "No aparece el botón de instalar"
- Asegúrate de usar HTTPS (en producción)
- Verifica que manifest.json sea válido
- Comprueba que el Service Worker esté registrado
- Abre DevTools (F12) → Application → Manifest

### "La app no funciona offline"
- El Service Worker solo cachea recursos estáticos
- Las llamadas a API necesitan conexión
- Verifica los logs del Service Worker en DevTools

### "Los iconos no se ven"
- Regenera los iconos: `npm run generate-pwa-icons`
- Verifica que los archivos PNG existan en `public/`
- Limpia el caché del navegador

### "No se actualiza la app"
- El Service Worker se actualiza automáticamente
- Si no ves cambios, recarga la página (Ctrl+R)
- En DevTools → Application → Service Workers, haz clic en "Update"

## 📚 Recursos Útiles

- [MDN: Progressive Web Apps](https://developer.mozilla.org/es/docs/Web/Progressive_web_apps)
- [Web.dev: PWA Checklist](https://web.dev/pwa-checklist/)
- [Manifest.json Spec](https://www.w3.org/TR/appmanifest/)
- [Service Worker API](https://developer.mozilla.org/es/docs/Web/API/Service_Worker_API)

## 🎯 Próximos Pasos

Para mejorar aún más la PWA:

1. **Agregar notificaciones push**: Implementar Web Push API
2. **Sincronización en background**: Usar Background Sync API
3. **Acceso a cámara**: Usar Camera API para fotos de productos
4. **Almacenamiento local**: Usar IndexedDB para datos offline
5. **Compartir archivos**: Usar Web Share API

---

¡Tu app Plow está lista para ser instalada como PWA! 🚀
