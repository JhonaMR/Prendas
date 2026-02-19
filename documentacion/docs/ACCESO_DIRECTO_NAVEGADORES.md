# Crear Acceso Directo - Plow Sistema

Guía para crear un acceso directo en el escritorio que abre Plow como una aplicación independiente en diferentes navegadores.

---

## 📌 Requisitos Previos

- El servidor debe estar corriendo: `npm run dev` (en la carpeta raíz)
- La URL del sistema es: `http://localhost:3000`
- El icono está en: `public/icono.ico`

---

## 🌐 Google Chrome

### Opción 1: Acceso directo manual

1. **Haz clic derecho en el escritorio** → Nuevo → Acceso directo
2. **En "Escriba la ubicación del elemento"**, ingresa:
   ```
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=http://localhost:3000
   ```
3. **Nombre**: `Plow - Sistema`
4. **Finalizar**
5. **Cambiar icono**: Clic derecho → Propiedades → Cambiar icono → Buscar `public/icono.ico`

### Opción 2: Instalación como PWA (Recomendado)

1. Abre `http://localhost:3000` en Chrome
2. Haz clic en el menú (⋮) → "Instalar Plow"
3. Confirma
4. Se creará automáticamente en el escritorio

---

## 🦊 Mozilla Firefox

### Opción 1: Acceso directo manual

1. **Haz clic derecho en el escritorio** → Nuevo → Acceso directo
2. **En "Escriba la ubicación del elemento"**, ingresa:
   ```
   "C:\Program Files\Mozilla Firefox\firefox.exe" -new-window http://localhost:3000
   ```
3. **Nombre**: `Plow - Sistema`
4. **Finalizar**
5. **Cambiar icono**: Clic derecho → Propiedades → Cambiar icono → Buscar `public/icono.ico`

### Opción 2: Instalación como PWA (Recomendado)

1. Abre `http://localhost:3000` en Firefox
2. Haz clic en el menú (☰) → "Instalar aplicación"
3. Confirma
4. Se creará automáticamente en el escritorio

---

## 🔵 Microsoft Edge

### Opción 1: Acceso directo manual

1. **Haz clic derecho en el escritorio** → Nuevo → Acceso directo
2. **En "Escriba la ubicación del elemento"**, ingresa:
   ```
   "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:3000
   ```
3. **Nombre**: `Plow - Sistema`
4. **Finalizar**
5. **Cambiar icono**: Clic derecho → Propiedades → Cambiar icono → Buscar `public/icono.ico`

### Opción 2: Instalación como PWA (Recomendado)

1. Abre `http://localhost:3000` en Edge
2. Haz clic en el menú (⋯) → "Instalar Plow"
3. Confirma
4. Se creará automáticamente en el escritorio

---

## 🎨 Zen Browser

### Opción 1: Acceso directo manual

1. **Haz clic derecho en el escritorio** → Nuevo → Acceso directo
2. **En "Escriba la ubicación del elemento"**, ingresa:
   ```
   "C:\Program Files\Zen Browser\zen.exe" -new-window http://localhost:3000
   ```
   
   **Nota**: Si Zen está instalado en otra ubicación, busca la carpeta de instalación:
   - Abre Zen Browser
   - Haz clic en el menú (☰) → Ayuda → Acerca de Zen
   - Busca la ruta de instalación

3. **Nombre**: `Plow - Sistema`
4. **Finalizar**
5. **Cambiar icono**: Clic derecho → Propiedades → Cambiar icono → Buscar `public/icono.ico`

### Opción 2: Instalación como PWA (Recomendado)

1. Abre `http://localhost:3000` en Zen Browser
2. Haz clic en el menú (☰) → "Instalar aplicación"
3. Confirma
4. Se creará automáticamente en el escritorio

---

## 🔍 Encontrar la ruta de instalación de tu navegador

Si no encuentras la ruta exacta:

### Chrome:
```
C:\Program Files\Google\Chrome\Application\chrome.exe
```
O si está en Program Files (x86):
```
C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
```

### Firefox:
```
C:\Program Files\Mozilla Firefox\firefox.exe
```
O si está en Program Files (x86):
```
C:\Program Files (x86)\Mozilla Firefox\firefox.exe
```

### Edge:
```
C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
```

### Zen Browser:
Busca en:
```
C:\Program Files\Zen Browser\zen.exe
```
O en:
```
C:\Users\[TuUsuario]\AppData\Local\Zen Browser\zen.exe
```

---

## 📝 Cambiar el icono del acceso directo

1. **Haz clic derecho en el acceso directo** → **Propiedades**
2. **En la pestaña "Acceso directo"**, haz clic en **"Cambiar icono"**
3. **Haz clic en "Examinar"** y busca:
   ```
   public/icono.ico
   ```
4. **Selecciona el icono** y haz clic en **Aceptar**
5. **Haz clic en Aplicar** y luego **Aceptar**

---

## ✅ Verificar que funciona

1. **Haz doble clic en el acceso directo**
2. Debería abrirse el navegador en modo "app" sin:
   - ❌ Barra de direcciones
   - ❌ Barra de marcadores
   - ❌ Pestañas
   - ✅ Pantalla completa
   - ✅ Icono personalizado

---

## 🚀 Recomendación Final

**Usa la opción PWA** (Opción 2 en cada navegador) porque:
- ✅ Es más simple
- ✅ Funciona automáticamente
- ✅ Se actualiza automáticamente
- ✅ Funciona offline
- ✅ Mejor experiencia de usuario

---

## 📞 Solución de problemas

### El acceso directo no abre
- Verifica que la ruta del navegador sea correcta
- Asegúrate de que el servidor esté corriendo (`npm run dev`)
- Intenta con la ruta completa entre comillas

### El icono no cambia
- Asegúrate de que `public/icono.ico` existe
- Intenta con un icono diferente
- Reinicia el explorador de archivos

### El navegador abre en pestaña en lugar de ventana independiente
- Usa la opción PWA en su lugar
- O verifica que estés usando el parámetro `--app=` correctamente

---

**Última actualización**: Febrero 2026
