# ⚡ Inicio Rápido - HTTPS para PWA

## 3 Pasos para Instalar tu PWA

### 1️⃣ Inicia el Backend

**Windows CMD:**
```cmd
start-https.bat
```

**Windows PowerShell:**
```powershell
.\start-https.ps1
```

**Manual:**
```bash
cd backend
npm run dev
```

Deberías ver:
```
🔒 Protocolo:    HTTPS
📍 URL Local:    https://localhost:3000
```

### 2️⃣ Abre en Chrome

1. Ve a `https://localhost:3000`
2. Chrome mostrará: "Tu conexión no es privada"
3. Haz clic en "Avanzado"
4. Escribe `thisisunsafe` (sin presionar Enter)
5. ¡Se abrirá automáticamente!

### 3️⃣ Instala la PWA

1. Haz clic en el icono de instalación (barra de direcciones)
2. O ve a Menú → "Instalar aplicación"
3. ¡Listo! Tu PWA está instalada

## ✅ Verificación

- ✅ Certificados generados: `backend/certs/`
- ✅ Backend en HTTPS: `https://localhost:3000`
- ✅ API en HTTPS: `https://localhost:3000/api`
- ✅ CORS configurado para HTTPS

## 🔧 Configuración

**Habilitar/Deshabilitar HTTPS:**
```env
# backend/.env
USE_HTTPS=true   # HTTPS (por defecto)
USE_HTTPS=false  # HTTP
```

## 📚 Más Información

- Documentación completa: `HTTPS_PWA_SETUP.md`
- Resumen de cambios: `HTTPS_SETUP_COMPLETE.md`

## 🆘 Problemas?

**Chrome no muestra botón de instalar:**
- Recarga la página (Ctrl+Shift+R)
- Abre DevTools (F12) → Application → Manifest
- Verifica que manifest.json esté cargado

**"Certificados no encontrados":**
```bash
node backend/scripts/generate-ssl-manual.js
```

---

¡Disfruta tu PWA! 🎉
