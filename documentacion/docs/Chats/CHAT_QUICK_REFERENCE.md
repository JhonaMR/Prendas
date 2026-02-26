# 📋 Chat - Referencia Rápida

## VISUAL RÁPIDO

### Estado 1: Sin chat abierto
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│                                                    ┌──┐ │
│                                                    │💬3│ │ ← Botón flotante
│                                                    └──┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Estado 2: Modal de contactos abierto
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              ┌──────────────────────┐                   │
│              │ Mensajes         ✕   │                   │
│              ├──────────────────────┤                   │
│              │ 🔍 Buscar...         │                   │
│              ├──────────────────────┤                   │
│              │ 👤 Juan Pérez  🟢    │                   │
│              │ 👤 María García 🟢   │                   │
│              │ 👤 Carlos López 🟡   │                   │
│              └──────────────────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Estado 3: Chat abierto
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              ┌──────────────────────┐                   │
│              │ Juan Pérez  🟢   ✕   │                   │
│              ├──────────────────────┤                   │
│              │              Hola!   │                   │
│              │ ¿Cómo estás?         │                   │
│              │              10:30   │                   │
│              │                      │                   │
│              │ Bien, ¿y tú?         │                   │
│              │ 10:31                │                   │
│              ├──────────────────────┤                   │
│              │ 📎 Escribe...    ➤   │                   │
│              └──────────────────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Estado 4: Notificación de mensaje
```
┌──────────────────────────────────────┐
│ 💬 Juan Pérez                        │
│ "Hola, ¿cómo estás?"                 │
│ Hace 2 segundos                      │
└──────────────────────────────────────┘
```

---

## COMPONENTES

| Componente | Ubicación | Responsabilidad |
|-----------|-----------|-----------------|
| ChatFloatingButton | Fixed bottom-right | Botón flotante + badge |
| ChatContactsModal | Centered overlay | Lista de usuarios activos |
| ChatWindow | Centered overlay | Ventana de chat |
| ChatInput | Bottom of ChatWindow | Input de mensaje |
| MessagesList | Inside ChatWindow | Lista de mensajes |
| Message | Inside MessagesList | Mensaje individual |
| TypingIndicator | Inside ChatWindow | "Está escribiendo..." |
| ChatNotification | Top-right corner | Toast de notificación |

---

## EVENTOS SOCKET.IO

### Enviar
```javascript
// Enviar mensaje
socket.emit('message:send', {
  to: userId,
  content: 'Hola!'
});

// Indicar que está escribiendo
socket.emit('user:typing', {
  to: userId
});

// Marcar como leído
socket.emit('messages:read', {
  from: userId
});
```

### Recibir
```javascript
// Mensaje recibido
socket.on('message:received', (data) => {
  // { from, content, timestamp }
});

// Usuario escribiendo
socket.on('user:typing', (data) => {
  // { from }
});

// Usuario conectado
socket.on('user:online', (data) => {
  // { userId, name, status }
});

// Usuario desconectado
socket.on('user:offline', (data) => {
  // { userId }
});

// Limpieza nocturna
socket.on('messages:cleared', () => {
  // Limpiar mensajes locales
});
```

---

## ENDPOINTS REST

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/chat/active-users | Usuarios conectados |
| GET | /api/chat/messages/:userId | Historial del día |
| POST | /api/chat/messages | Guardar mensaje |
| PUT | /api/chat/messages/:userId/read | Marcar como leído |
| DELETE | /api/chat/messages | Limpiar mensajes |

---

## INDICADORES DE ESTADO

| Icono | Significado | Color |
|-------|------------|-------|
| 🟢 | Online | Verde |
| 🟡 | Inactivo (>5min) | Amarillo |
| 🔴 | Offline | Rojo |

---

## NOTIFICACIONES

### Badge (Botón flotante)
- Visible cuando hay mensajes sin leer
- Muestra número de mensajes
- Pulse animation
- Se oculta al abrir chat

### Toast (Esquina superior derecha)
- Aparece cuando llega mensaje
- Auto-dismiss en 5 segundos
- Click abre el chat
- Muestra nombre + preview

### Indicador en lista
- Punto rojo junto al nombre
- Número de mensajes sin leer
- Se actualiza en tiempo real

---

## LIMPIEZA AUTOMÁTICA

**Cada noche a las 23:59:**
- ❌ DELETE FROM messages WHERE DATE(created_at) < CURRENT_DATE
- ✅ Mantener estado de usuarios
- ✅ Mantener auditoría

---

## FLUJOS PRINCIPALES

### 1. Enviar mensaje
```
Input → Enter → Socket.emit → Backend → BD → Socket.broadcast → Recibir
```

### 2. Recibir mensaje (chat abierto)
```
Socket.on → ChatContext → MessagesList → Auto-scroll → Marcar leído
```

### 3. Recibir mensaje (chat cerrado)
```
Socket.on → Badge++ → Toast → Indicador en lista
```

### 4. Abrir chat
```
Click contacto → Fetch historial → ChatWindow → Marcar leído → Socket.emit
```

### 5. Escribiendo
```
onChange → Socket.emit → Backend → Socket.broadcast → TypingIndicator
```

---

## ESTILOS TAILWIND

```css
/* Botón flotante */
.chat-button {
  @apply fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full
         bg-blue-500 hover:bg-blue-600 text-white shadow-lg
         flex items-center justify-center transition-all
         duration-200 hover:scale-110;
}

/* Badge */
.chat-badge {
  @apply absolute -top-2 -right-2 bg-red-500 text-white
         rounded-full w-6 h-6 flex items-center justify-center
         text-xs font-bold animate-bounce;
}

/* Modal */
.chat-modal {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center
         justify-center z-40;
}

.chat-modal-content {
  @apply bg-white rounded-lg shadow-xl w-80 h-96 flex flex-col
         animate-scale-in;
}

/* Mensaje enviado */
.message-sent {
  @apply bg-blue-500 text-white rounded-lg rounded-br-none
         px-4 py-2 max-w-xs;
}

/* Mensaje recibido */
.message-received {
  @apply bg-gray-200 text-gray-900 rounded-lg rounded-bl-none
         px-4 py-2 max-w-xs;
}

/* Toast */
.chat-toast {
  @apply fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg
         p-4 max-w-sm cursor-pointer hover:shadow-xl
         transition-shadow animate-slide-in-right;
}
```

---

## ANIMACIONES

```javascript
// tailwind.config.js
animation: {
  'pulse-on-message': 'pulse-message 2s infinite',
  'scale-in': 'scale-in 0.3s ease-out',
  'slide-up': 'slide-up 0.3s ease-out',
  'slide-in-right': 'slide-in-right 0.3s ease-out',
}

keyframes: {
  'pulse-message': {
    '0%, 100%': { transform: 'scale(1)', opacity: '1' },
    '50%': { transform: 'scale(1.1)', opacity: '0.8' },
  },
  'scale-in': {
    '0%': { transform: 'scale(0.95)', opacity: '0' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  },
  'slide-up': {
    '0%': { transform: 'translateY(20px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  'slide-in-right': {
    '0%': { transform: 'translateX(400px)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' },
  },
}
```

---

## CHECKLIST DE IMPLEMENTACIÓN

- [ ] Crear tabla `messages` en PostgreSQL
- [ ] Crear tabla `user_sessions` en PostgreSQL
- [ ] Instalar Socket.io en backend
- [ ] Instalar Socket.io-client en frontend
- [ ] Crear ChatContext
- [ ] Crear ChatFloatingButton
- [ ] Crear ChatContactsModal
- [ ] Crear ChatWindow
- [ ] Crear ChatInput
- [ ] Crear MessagesList
- [ ] Crear Message
- [ ] Crear TypingIndicator
- [ ] Crear ChatNotification
- [ ] Crear socketService
- [ ] Crear chatService (API)
- [ ] Crear useChat hook
- [ ] Implementar Socket.io en backend
- [ ] Implementar endpoints REST
- [ ] Implementar limpieza automática (cron)
- [ ] Agregar animaciones Tailwind
- [ ] Testear flujos principales
- [ ] Testear notificaciones
- [ ] Testear limpieza nocturna

