# 🔐 Configuración HTTPS para PWA

Este documento explica cómo configurar HTTPS en tu aplicación para que funcione como PWA en Chrome.

## ¿Por qué HTTPS?

Chrome requiere HTTPS para instalar PWAs por razones de seguridad. Los certificados autofirmados funcionan perfectamente en desarrollo local.

## Instalación Rápida

### Opción 1: Script Automático (Recomendado)

**Windows PowerShell:**
```powershell
.\setup-https.ps1
```

**Windows CMD:**
```cmd
setup-https.bat
```

### Opción 2: Manual

1. **Instala OpenSSL** (si no lo tienes):
   - Descarga desde: https://slproweb.com/products/Win32OpenSSL.html
   - O usa Chocolatey: `choco install openssl`

2. **Genera los certificados:**
   ```bash
   cd backend
   npm run generate-ssl
   ```

3. **Verifica que se crearon:**
   - `backend/certs/server.key`
   - `backend/certs/server.crt`

## Uso

### 1. Inicia el backend con HTTPS

```bash
cd backend
npm run dev
```

Deberías ver en la consola:
```
🔒 Protocolo:    HTTPS
📍 URL Local:    https://localhost:3000
```

### 2. Abre en Chrome

1. Ve a `https://localhost:3000`
2. Chrome mostrará una advertencia: "Tu conexión no es privada"
3. Haz clic en "Avanzado"
4. Escribe `thisisunsafe` (sin presionar Enter)
5. Se abrirá automáticamente la página

### 3. Instala la PWA

1. Haz clic en el icono de instalación en la barra de direcciones
2. O ve a Menú → "Instalar aplicación"
3. ¡Listo! La app se instalará como PWA

## Configuración

### Habilitar/Deshabilitar HTTPS

En `backend/.env`:
```env
# true = HTTPS (por defecto)
# false = HTTP
USE_HTTPS=true
```

### URLs Configuradas

**Backend:**
- Desarrollo: `https://localhost:3000`
- Producción: Actualiza `CORS_ORIGIN` en `.env`

**Frontend:**
- Desarrollo: `https://localhost:5173`
- API: `https://localhost:3000/api`

## Solución de Problemas

### "Certificados no encontrados"

```bash
cd backend
npm run generate-ssl
```

### OpenSSL no está instalado

**Windows:**
```powershell
choco install openssl
```

O descarga desde: https://slproweb.com/products/Win32OpenSSL.html

### Chrome no muestra el botón de instalar

1. Verifica que estés en HTTPS (barra de direcciones debe mostrar 🔒)
2. Abre DevTools (F12) → Application → Manifest
3. Verifica que el manifest.json esté cargado correctamente
4. Recarga la página (Ctrl+Shift+R)

### "Mixed Content" error

Asegúrate de que:
- Backend está en HTTPS
- Frontend está en HTTPS
- Las URLs en `.env` usan `https://`

## Certificados Autofirmados

Los certificados generados:
- Son válidos por 365 días
- Solo funcionan en `localhost`
- Son seguros para desarrollo local
- Chrome mostrará una advertencia (normal)

## Para Producción

Cuando despliegues a producción:
1. Obtén certificados SSL reales (Let's Encrypt, etc.)
2. Actualiza `backend/certs/` con los certificados reales
3. Cambia `USE_HTTPS=true` en `.env`
4. Actualiza `CORS_ORIGIN` con tu dominio real

## Más Información

- [PWA en Chrome](https://developer.chrome.com/docs/web-platform/progressive-web-apps/)
- [HTTPS y Seguridad](https://developer.mozilla.org/es/docs/Glossary/https)
- [Certificados SSL](https://www.ssl.com/article/how-ssl-certificates-work/)
