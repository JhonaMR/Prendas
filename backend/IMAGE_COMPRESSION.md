# Compresión de Imágenes en Fichas de Diseño

## 📋 Descripción

Se agregó compresión automática y leve de imágenes al cargar fotos en las Fichas de Diseño. La compresión mantiene excelente calidad visual mientras reduce el tamaño del archivo.

## 🎯 Características

### Compresión Leve (Mantiene Buena Calidad)

**JPG/JPEG:**
- Calidad: 85% (escala 0-100)
- Progresivo: Sí (carga gradual)
- Reducción típica: 30-50% del tamaño original

**PNG:**
- Compresión: Nivel 8 de 9 (máximo sin perder calidad)
- Reducción típica: 20-40% del tamaño original

### Ventajas

✅ Reduce tamaño de almacenamiento  
✅ Acelera carga de imágenes en el frontend  
✅ Mantiene excelente calidad visual  
✅ Automático - sin intervención del usuario  
✅ Compatible con todos los formatos (JPG, JPEG, PNG)

## 🔧 Implementación Técnica

### Dependencias

Se agregó `sharp` (v0.33.1) al `package.json`:
```bash
npm install sharp
```

### Función de Compresión

```javascript
const compressImage = async (filePath) => {
    // Detecta formato y aplica compresión leve
    // PNG: compressionLevel 8
    // JPG: quality 85, progressive
}
```

### Flujo de Carga

1. Usuario sube imagen desde Ficha de Diseño
2. Multer valida formato (JPG, JPEG, PNG)
3. Imagen se guarda temporalmente
4. `compressImage()` comprime la imagen
5. Archivo comprimido reemplaza el original
6. Ruta se devuelve al frontend

## 📊 Ejemplo de Reducción

| Formato | Original | Comprimido | Reducción |
|---------|----------|-----------|-----------|
| JPG 5MB | 5.0 MB | 2.5 MB | 50% |
| PNG 3MB | 3.0 MB | 2.1 MB | 30% |
| JPG 2MB | 2.0 MB | 1.2 MB | 40% |

## ⚙️ Configuración

### Parámetros Actuales

```javascript
// JPG: 85% de calidad (leve compresión)
.jpeg({ quality: 85, progressive: true })

// PNG: Nivel 8 de 9 (máximo sin perder calidad)
.png({ compressionLevel: 8 })
```

### Cómo Ajustar

Si necesitas más o menos compresión, edita `fichasDisenoController.js`:

```javascript
// Más compresión (menor calidad):
.jpeg({ quality: 75, progressive: true })  // 75% calidad

// Menos compresión (mayor calidad):
.jpeg({ quality: 90, progressive: true })  // 90% calidad
```

## 🚀 Uso

No requiere cambios en el frontend. El proceso es automático:

1. Abre Ficha de Diseño
2. Carga foto normalmente
3. La imagen se comprime automáticamente
4. Se guarda comprimida en el servidor

## 📝 Logs

Cuando se carga una imagen, verás en los logs:

```
✅ Imagen comprimida: foto_diseño.jpg
```

Si hay error en compresión (raro), continúa con imagen original:

```
⚠️  No se pudo comprimir imagen: [error]
```

## 🔒 Seguridad

- Solo formatos permitidos: JPG, JPEG, PNG
- Límite de tamaño: 5 MB (antes de compresión)
- Validación de MIME type
- Compresión no afecta seguridad

## 📦 Instalación

Después de actualizar el código:

```bash
cd backend
npm install
npm run pm2:restart
```

## ✅ Verificación

Para verificar que funciona:

1. Carga una imagen en Ficha de Diseño
2. Revisa los logs: `npm run pm2:logs`
3. Busca mensaje: "Imagen comprimida"
4. Verifica que la imagen se ve bien en el frontend

## 🎨 Calidad Visual

La compresión es **imperceptible al ojo humano**:
- JPG 85%: Prácticamente idéntica al original
- PNG nivel 8: Sin pérdida de calidad

Ideal para:
- Fotos de prendas
- Diseños
- Muestras
- Cualquier imagen de referencia

## 📞 Soporte

Si una imagen no se comprime correctamente:
1. Verifica que sea JPG, JPEG o PNG
2. Verifica que sea menor a 5 MB
3. Revisa los logs para errores
4. La imagen se guardará sin comprimir si hay error
