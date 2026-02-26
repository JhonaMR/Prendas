# 🔧 Troubleshooting Socket.io

## Error: WebSocket connection failed

```
WebSocket connection to 'wss://10.10.0.34:3000/socket.io/?EIO=4&transport=websocket' failed
```

### Causas posibles:

1. **Socket.io no está escuchando en el puerto 3000**
2. **Certificados SSL no están configurados correctamente**
3. **CORS no está permitiendo la conexión**
4. **El servidor no está respondiendo en esa dirección IP**

---

## 🔍 Diagnóstico paso a paso

### 1. Verificar que el backend está corriendo

```bash
# Terminal 1
cd Prendas/backend
npm run dev
```

Deberías ver:
```
✅ SERVIDOR BACKEND INICIADO
🔌 Socket.io: Activo
✅ El backend está listo para recibir peticiones
```

### 2. Verificar que Socket.io se inicializó

En los logs del backend, deberías ver:
```
🔌 Inicializando Socket.io...
✅ Socket.io configurado
```

### 3. Probar la conexión HTTP primero

Abre en el navegador:
```
https://10.10.0.34:3000/api/health
```

Deberías ver:
```json
{
  "success": true,
  "message": "Servidor activo",
  "timestamp": "2026-02-26T..."
}
```

Si esto falla, el problema es que el servidor no está escuchando en esa dirección.

### 4. Verificar los certificados SSL

```bash
ls -la Prendas/backend/certs/
```

Deberías ver:
```
server.crt
server.key
```

Si no existen, ejecuta:
```bash
cd Prendas/backend
node scripts/generate-ssl-cert.js
```

### 5. Verificar CORS en Socket.io

En `Prendas/backend/src/config/socketio.js`, verifica que CORS incluya tu dominio:

```javascript
cors: {
  origin: ['https://10.10.0.34:3000', 'http://localhost:5173'],
  credentials: true
}
```

### 6. Verificar que el puerto 3000 está abierto

```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

Deberías ver que Node.js está escuchando en el puerto 3000.

---

## 🛠️ Soluciones

### Solución 1: Usar localhost en lugar de IP

Si estás en desarrollo, usa `localhost` en lugar de la IP:

1. Abre http://localhost:5173 en lugar de https://10.10.0.34:5173
2. El backend se conectará a localhost:3000

### Solución 2: Configurar CORS correctamente

Actualiza `Prendas/backend/src/config/socketio.js`:

```javascript
const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://localhost:3000',
        'https://10.10.0.34:3000',
        'https://10.10.0.34:5173'
      ],
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  });
```

### Solución 3: Regenerar certificados SSL

```bash
cd Prendas/backend
rm -rf certs/
node scripts/generate-ssl-cert.js
npm run dev
```

### Solución 4: Desactivar HTTPS en desarrollo

En `Prendas/backend/.env`:

```
USE_HTTPS=false
```

Luego reinicia el backend.

---

## 📋 Checklist de verificación

- [ ] Backend está corriendo (`npm run dev`)
- [ ] Socket.io está inicializado (ver logs)
- [ ] Certificados SSL existen
- [ ] Puerto 3000 está abierto
- [ ] CORS está configurado correctamente
- [ ] Frontend puede acceder a `/api/health`
- [ ] Frontend está en la misma red que el backend

---

## 🔗 URLs correctas

**Desarrollo (localhost):**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Socket.io: ws://localhost:3000

**Producción (IP):**
- Frontend: https://10.10.0.34:5173
- Backend: https://10.10.0.34:3000
- Socket.io: wss://10.10.0.34:3000

---

## 📝 Logs útiles

### Backend - Conexión exitosa:
```
🔌 Inicializando Socket.io...
✅ Socket.io configurado
✅ Nueva conexión Socket.io: abc123...
👤 Usuario: Juan (ID: 1)
👥 Usuarios activos: 1
```

### Frontend - Conexión exitosa:
```
🔌 Conectando a Socket.io en https://10.10.0.34:3000
✅ Conectado a Socket.io
```

### Frontend - Error de conexión:
```
🔌 Conectando a Socket.io en https://10.10.0.34:3000
❌ Error de conexión Socket.io: websocket error
```

---

## 🆘 Si nada funciona

1. Reinicia ambos servidores (backend y frontend)
2. Limpia el cache del navegador (Ctrl+Shift+Delete)
3. Abre las DevTools (F12) y revisa la consola
4. Verifica que no hay firewall bloqueando el puerto 3000
5. Intenta con `localhost` en lugar de la IP

