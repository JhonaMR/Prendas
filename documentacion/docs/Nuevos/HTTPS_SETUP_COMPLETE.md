# ✅ Configuración HTTPS Completada

Tu aplicación está lista para funcionar como PWA con HTTPS. Aquí está lo que se configuró:

## 📋 Cambios Realizados

### Backend (Node.js/Express)
- ✅ Servidor configurado para usar HTTPS
- ✅ Certificados SSL autofirmados generados
- ✅ CORS actualizado para HTTPS
- ✅ Variable de entorno `USE_HTTPS=true` en `.env`

### Frontend (React/Vite)
- ✅ API URL actualizada a `https://localhost:3000/api`
- ✅ Variable de entorno `VITE_API_URL` configurada

### Certificados
- ✅ Ubicación: `backend/certs/`
- ✅ Válidos por 365 días
- ✅ Generados con node-forge (sin necesidad de OpenSSL)

## 🚀 Cómo Usar

### Opción 1: Script Automático (Recomendado)

**Windows PowerShell:**
```powershell
.\start-https.ps1
```

**Windows CMD:**
```cmd
start-https.bat
```

### Opción 2: Manual

```bash
# Generar certificados (si no existen)
node backend/scripts/generate-ssl-manual.js

# Iniciar backend
cd backend
npm run dev
```

## 🌐 Acceder a la Aplicación

1. **Abre en Chrome:** `https://localhost:3000`

2. **Chrome mostrará advertencia:**
   - Haz clic en "Avanzado"
   - Escribe `thisisunsafe` (sin presionar Enter)
   - Se abrirá automáticamente

3. **Instala la PWA:**
   - Haz clic en el icono de instalación (barra de direcciones)
   - O ve a Menú → "Instalar aplicación"

## 📁 Archivos Creados/Modificados

### Nuevos Archivos
- `backend/scripts/generate-ssl-manual.js` - Generador de certificados
- `backend/certs/server.key` - Clave privada SSL
- `backend/certs/server.crt` - Certificado SSL
- `start-https.bat` - Script de inicio (Windows CMD)
- `start-https.ps1` - Script de inicio (Windows PowerShell)
- `HTTPS_PWA_SETUP.md` - Documentación completa

### Archivos Modificados
- `backend/src/server.js` - Agregado soporte HTTPS
- `backend/.env` - Agregado `USE_HTTPS=true`
- `backend/package.json` - Agregado script `generate-ssl`
- `src/services/api.ts` - URL actualizada a HTTPS
- `.env` - Agregado `VITE_API_URL`

## ⚙️ Configuración

### Habilitar/Deshabilitar HTTPS

En `backend/.env`:
```env
USE_HTTPS=true   # HTTPS (por defecto)
USE_HTTPS=false  # HTTP
```

### URLs Configuradas

**Desarrollo:**
- Backend: `https://localhost:3000`
- Frontend: `https://localhost:5173`
- API: `https://localhost:3000/api`

**CORS:**
- `https://localhost:3000`
- `https://localhost:5173`

## 🔒 Seguridad

- Los certificados son autofirmados (solo para desarrollo)
- Chrome mostrará una advertencia (normal)
- Los certificados son válidos por 365 días
- Para producción, usa certificados reales (Let's Encrypt, etc.)

## 🐛 Solución de Problemas

### "Certificados no encontrados"
```bash
node backend/scripts/generate-ssl-manual.js
```

### Chrome no muestra botón de instalar
1. Verifica que estés en HTTPS (🔒 en barra de direcciones)
2. Recarga la página (Ctrl+Shift+R)
3. Abre DevTools (F12) → Application → Manifest
4. Verifica que manifest.json esté cargado

### "Mixed Content" error
- Asegúrate de que backend está en HTTPS
- Verifica que las URLs en `.env` usan `https://`

## 📚 Documentación

Para más detalles, consulta: `HTTPS_PWA_SETUP.md`

## ✨ Próximos Pasos

1. Inicia el backend: `npm run dev` (en carpeta backend)
2. Abre `https://localhost:3000` en Chrome
3. Instala la PWA
4. ¡Disfruta tu aplicación!

---

**Nota:** Los certificados autofirmados son seguros para desarrollo local. Para producción, obtén certificados SSL reales.
