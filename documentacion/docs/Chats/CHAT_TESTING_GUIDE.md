# 🧪 Guía de Prueba del Chat

## ✅ Requisitos previos

- ✅ Tablas creadas en PostgreSQL
- ✅ Socket.io instalado
- ✅ Todos los archivos creados
- ✅ Backend y frontend compilando sin errores

---

## 🚀 Pasos para probar

### 1. Iniciar el backend

```bash
cd Prendas/backend
npm run dev
```

Deberías ver:
```
✅ SERVIDOR BACKEND INICIADO
🔌 Socket.io: Activo
✅ El backend está listo para recibir peticiones
```

### 2. Iniciar el frontend

En otra terminal:
```bash
cd Prendas
npm run dev
```

Deberías ver:
```
VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
```

### 3. Abrir dos sesiones

**Sesión 1:**
- Abre http://localhost:5173 en una ventana
- Login con usuario 1 (ej: JAM / 1234)

**Sesión 2:**
- Abre http://localhost:5173 en otra ventana (o incógnito)
- Login con usuario 2 (ej: MAR / 1234)

### 4. Probar el chat

**En Sesión 1:**
1. Busca el botón 💬 en la esquina inferior derecha
2. Haz click → Se abre modal con usuarios activos
3. Deberías ver al usuario 2 con estado 🟢 Online
4. Haz click en el usuario 2 → Se abre ventana de chat
5. Escribe un mensaje y presiona Enter
6. El mensaje debe aparecer en la ventana

**En Sesión 2:**
1. Deberías ver una notificación toast en la esquina superior derecha
2. El botón 💬 debe mostrar un badge rojo con "1"
3. Haz click en el botón → Se abre modal
4. Haz click en usuario 1 → Se abre ventana de chat
5. Deberías ver el mensaje que enviaste desde Sesión 1
6. Responde con un mensaje

**De vuelta en Sesión 1:**
1. Deberías ver el mensaje de respuesta en tiempo real
2. El mensaje debe aparecer automáticamente

---

## 🔍 Qué verificar

### ✅ Funcionalidad básica
- [ ] Botón flotante visible en esquina inferior derecha
- [ ] Modal de contactos se abre al hacer click
- [ ] Usuarios activos aparecen en la lista
- [ ] Indicadores de estado (🟢 🟡 🔴) funcionan
- [ ] Ventana de chat se abre al seleccionar usuario
- [ ] Mensajes se envían y reciben en tiempo real

### ✅ Indicadores visuales
- [ ] Badge rojo en botón cuando hay mensajes no leídos
- [ ] Toast notification aparece cuando llega mensaje
- [ ] Indicador "Está escribiendo..." aparece
- [ ] Animaciones suaves (scale-in, slide-up, slide-in-right)

### ✅ Interacciones
- [ ] Puedo escribir y enviar mensajes
- [ ] Puedo cerrar la ventana de chat con X
- [ ] El botón vuelve a aparecer al cerrar
- [ ] Puedo abrir múltiples chats (uno a la vez)
- [ ] Los mensajes se marcan como leídos

### ✅ Estado de usuarios
- [ ] Usuarios online muestran 🟢
- [ ] Usuarios offline muestran 🔴
- [ ] Al desconectar, el estado cambia a offline
- [ ] Al reconectar, el estado vuelve a online

---

## 🐛 Troubleshooting

### El botón no aparece
- Verifica que ChatProvider esté en App.tsx
- Verifica que los componentes estén importados
- Abre la consola del navegador (F12) y busca errores

### No veo usuarios activos
- Verifica que ambas sesiones estén logueadas
- Verifica que Socket.io esté conectado (consola del navegador)
- Verifica que las tablas existan en PostgreSQL

### Los mensajes no llegan
- Verifica que Socket.io esté activo en el backend
- Verifica que no haya errores en la consola del backend
- Verifica que el token JWT sea válido

### El chat se ve roto
- Verifica que Tailwind esté compilando correctamente
- Limpia el cache: `npm run build` y recarga la página
- Verifica que las animaciones estén en tailwind.config.js

---

## 📊 Logs esperados

### Backend
```
✅ Usuario Juan (ID: 1) conectado
👥 Usuarios activos: 1
💬 Mensaje de Juan a usuario 2
✓ 1 mensajes marcados como leídos
❌ Usuario Juan desconectado
👥 Usuarios activos: 0
```

### Frontend (Consola)
```
✅ Conectado a Socket.io
👤 Usuario online: María
💬 Mensaje recibido: { from: 2, content: "Hola" }
✓ Mensajes leídos por: 1
```

---

## 🎯 Casos de prueba avanzados

### 1. Mensaje mientras usuario está offline
1. Usuario 1 envía mensaje a Usuario 2
2. Usuario 2 se desconecta
3. Usuario 1 envía otro mensaje
4. Usuario 2 se conecta nuevamente
5. Verificar que ve los mensajes no leídos

### 2. Múltiples usuarios
1. Conectar 3+ usuarios
2. Enviar mensajes entre diferentes pares
3. Verificar que cada uno ve solo sus mensajes

### 3. Limpieza nocturna
1. Enviar varios mensajes
2. Esperar a las 23:59 (o ejecutar manualmente)
3. Verificar que los mensajes se eliminan

### 4. Reconexión
1. Desconectar el backend
2. Intentar enviar mensaje (debe fallar gracefully)
3. Reconectar el backend
4. Verificar que Socket.io se reconecta automáticamente

---

## 📝 Notas

- Los mensajes se guardan en BD pero se limpian diariamente
- El estado de usuarios se rastrea en tiempo real
- Las notificaciones desaparecen después de 5 segundos
- El chat es 1-a-1 (no hay grupos)
- Los mensajes no leídos se cuentan por usuario

