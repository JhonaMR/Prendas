# 🪟 Icono .ICO para Windows

## El Problema

Windows está usando el archivo `icono.ico` en lugar del PNG del manifest. Por eso ves esquinas sólidas en Windows aunque el PNG tenga esquinas transparentes.

## ✅ Solución

Necesitas reemplazar `public/icono.ico` con un archivo .ico que tenga esquinas transparentes, igual que tu PNG.

## 🔧 Cómo Hacer

### Opción 1: Convertir tu PNG a ICO (Recomendado)

#### Paso 1: Usar una herramienta online

1. Ve a: https://convertio.co/png-ico/
2. Sube tu archivo `pwa-512x512.png`
3. Descarga el archivo `.ico`
4. Reemplaza `public/icono.ico` con el nuevo archivo

**Otras herramientas:**
- https://icoconvert.com/
- https://online-convert.com/
- https://cloudconvert.com/

#### Paso 2: Hacer el build

```bash
npm run build
```

#### Paso 3: Desinstalar y reinstalar

- Desinstala la PWA de Windows
- Limpia el caché del navegador
- Reinstala la PWA

### Opción 2: Usar ImageMagick (Línea de comandos)

Si tienes ImageMagick instalado:

```bash
# Convertir PNG a ICO
magick convert pwa-512x512.png -define icon:auto-resize=256,128,96,64,48,32,16 icono.ico
```

### Opción 3: Usar Python

Si tienes Python instalado:

```bash
pip install pillow

# Crear un script convert.py
```

```python
from PIL import Image

# Abrir la imagen PNG
img = Image.open('public/pwa-512x512.png')

# Convertir a ICO
img.save('public/icono.ico', format='ICO', sizes=[(256, 256), (128, 128), (64, 64), (32, 32), (16, 16)])

print("✅ ICO generado correctamente")
```

Luego ejecutar:
```bash
python convert.py
```

## 📋 Requisitos del Archivo .ICO

- **Formato**: ICO (Windows Icon)
- **Tamaños**: 256x256, 128x128, 64x64, 32x32, 16x16 (múltiples tamaños)
- **Fondo**: Transparente (como tu PNG)
- **Esquinas**: Redondeadas (como tu PNG)

## 🎯 Pasos Finales

1. **Convierte tu PNG a ICO** usando una de las opciones arriba
2. **Reemplaza** `public/icono.ico` con el nuevo archivo
3. **Haz el build**: `npm run build`
4. **Desinstala la PWA** de Windows
5. **Limpia el caché** del navegador
6. **Reinstala la PWA**

## ✨ Resultado Esperado

**En Windows:**
- Icono con esquinas redondeadas
- Sin fondo sólido
- Exactamente como tu PNG
- Como el resto de aplicaciones

## 📝 Archivos Involucrados

```
public/
├── icono.ico              ← Reemplaza este
├── pwa-192x192.png        ← Tu icono PNG
├── pwa-512x512.png        ← Tu icono PNG
└── manifest.json          ← Ya está configurado
```

## 🔗 Referencias

- [Wikipedia: ICO (file format)](https://en.wikipedia.org/wiki/ICO_(file_format))
- [Microsoft: App icons and logos](https://docs.microsoft.com/en-us/windows/apps/design/style/iconography/app-icons-and-logos)

## ❓ Preguntas Frecuentes

### ¿Por qué Windows usa .ico y no PNG?
Porque Windows busca primero el archivo `favicon.ico` o `icono.ico` en la raíz del sitio. Es un estándar antiguo de Windows.

### ¿Necesito ambos (PNG e ICO)?
Sí, porque:
- PNG: Lo usa el manifest.json (Android, iOS, navegadores modernos)
- ICO: Lo usa Windows para el icono de la app instalada

### ¿Qué pasa si no reemplazo el .ico?
Windows seguirá usando el .ico antiguo con fondo sólido.

### ¿El .ico debe tener el mismo tamaño que el PNG?
No necesariamente. El .ico puede tener múltiples tamaños (256, 128, 64, 32, 16). Windows elige el que mejor se adapte.

---

¡Listo! Ahora sabes por qué Windows mostraba esquinas sólidas. 🎉
