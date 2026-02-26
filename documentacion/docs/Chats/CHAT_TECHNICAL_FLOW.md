# 🔧 Flujo Técnico del Chat

## ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ChatContext (Estado global del chat)                │   │
│  │ - currentChat                                        │   │
│  │ - messages                                           │   │
│  │ - activeUsers                                        │   │
│  │ - unreadCount                                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↕                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Socket.io Client (Tiempo real)                       │   │
│  │ - Conectar/desconectar                               │   │
│  │ - Enviar mensaje                                     │   │
│  │ - Recibir mensaje                                    │   │
│  │ - Escribiendo...                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↕ WebSocket
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Socket.io Server                                     │   │
│  │ - Gestionar conexiones                               │   │
│  │ - Broadcast de mensajes                              │   │
│  │ - Tracking de usuarios activos                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↕                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Chat Controller                                      │   │
│  │ - POST /api/chat/messages (guardar)                  │   │
│  │ - GET /api/chat/messages/:userId (historial)        │   │
│  │ - GET /api/chat/active-users (usuarios conectados)  │   │
│  │ - DELETE /api/chat/messages (limpieza)              │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↕                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ PostgreSQL                                           │   │
│  │ - Tabla: messages                                    │   │
│  │ - Tabla: user_sessions (usuarios activos)           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## FLUJO 1: USUARIO ENVÍA MENSAJE

```
1. Usuario escribe en input
   ↓
2. Presiona Enter o click en ➤
   ↓
3. ChatInput.tsx → onSendMessage()
   ↓
4. ChatContext.sendMessage()
   ↓
5. Socket.io emit('message:send', { to, content })
   ↓
6. Backend recibe en socket.on('message:send')
   ↓
7. Valida usuario autenticado
   ↓
8. Guarda en BD: INSERT INTO messages (sender_id, receiver_id, content, created_at)
   ↓
9. Socket.io emit('message:received', { from, content, timestamp })
   ↓
10. Frontend recibe en socket.on('message:received')
    ↓
11. ChatContext actualiza messages[]
    ↓
12. MessagesList.tsx re-renderiza
    ↓
13. Mensaje aparece en pantalla
```

---

## FLUJO 2: USUARIO RECIBE MENSAJE (CHAT ABIERTO)

```
1. Otro usuario envía mensaje (Flujo 1)
   ↓
2. Backend guarda en BD
   ↓
3. Backend emite 'message:received' al receptor
   ↓
4. Frontend recibe en socket.on('message:received')
   ↓
5. ChatContext actualiza messages[]
   ↓
6. Marca automáticamente como leído
   ↓
7. MessagesList.tsx re-renderiza
   ↓
8. Mensaje aparece en pantalla
   ↓
9. Auto-scroll al último mensaje
```

---

## FLUJO 3: USUARIO RECIBE MENSAJE (CHAT CERRADO)

```
1. Otro usuario envía mensaje (Flujo 1)
   ↓
2. Backend guarda en BD
   ↓
3. Backend emite 'message:received' al receptor
   ↓
4. Frontend recibe en socket.on('message:received')
   ↓
5. ChatContext incrementa unreadCount
   ↓
6. ChatNotification.tsx muestra toast
   ↓
7. Badge en ChatFloatingButton se actualiza
   ↓
8. Indicador en lista de contactos se actualiza
   ↓
9. Usuario puede hacer click en toast para abrir chat
```

---

## FLUJO 4: USUARIO ABRE CHAT

```
1. Usuario hace click en contacto
   ↓
2. ChatContactsModal.tsx → openChat(userId)
   ↓
3. ChatContext.openChat(userId)
   ↓
4. Fetch GET /api/chat/messages/:userId (historial del día)
   ↓
5. ChatContext actualiza messages[]
   ↓
6. ChatWindow.tsx se renderiza
   ↓
7. Marca todos los mensajes como leídos
   ↓
8. Socket.io emit('messages:read', { from: userId })
   ↓
9. Backend actualiza BD: UPDATE messages SET read = true
   ↓
10. Badge desaparece
    ↓
11. Indicador en lista se actualiza
```

---

## FLUJO 5: USUARIO ESCRIBE (TYPING INDICATOR)

```
1. Usuario empieza a escribir en input
   ↓
2. ChatInput.tsx detecta onChange
   ↓
3. Socket.io emit('user:typing', { to: userId })
   ↓
4. Backend recibe y emite a receptor
   ↓
5. Frontend recibe en socket.on('user:typing')
   ↓
6. ChatContext actualiza isTyping = true
   ↓
7. TypingIndicator.tsx aparece
   ↓
8. Después de 3 segundos sin escribir, desaparece
```

---

## FLUJO 6: LIMPIEZA AUTOMÁTICA (NIGHTLY)

```
Cada día a las 23:59:00
   ↓
1. Node-cron dispara el job
   ↓
2. Backend ejecuta cleanupOldMessages()
   ↓
3. DELETE FROM messages WHERE DATE(created_at) < CURRENT_DATE
   ↓
4. Todos los clientes conectados reciben 'messages:cleared'
   ↓
5. Frontend limpia ChatContext.messages[]
   ↓
6. Conversaciones se resetean
   ↓
7. Usuarios siguen conectados
```

---

## FLUJO 7: USUARIO SE CONECTA

```
1. Usuario hace login
   ↓
2. Frontend obtiene token JWT
   ↓
3. Socket.io conecta con token en headers
   ↓
4. Backend verifica token en middleware
   ↓
5. Backend registra usuario en user_sessions
   ↓
6. Backend emite 'user:online' a todos
   ↓
7. Todos los clientes reciben 'user:online'
   ↓
8. ChatContext actualiza activeUsers[]
   ↓
9. Indicador 🟢 aparece en lista de contactos
```

---

## FLUJO 8: USUARIO SE DESCONECTA

```
1. Usuario cierra sesión o se desconecta
   ↓
2. Socket.io dispara 'disconnect'
   ↓
3. Backend elimina de user_sessions
   ↓
4. Backend emite 'user:offline' a todos
   ↓
5. Todos los clientes reciben 'user:offline'
   ↓
6. ChatContext actualiza activeUsers[]
   ↓
7. Indicador 🔴 aparece en lista de contactos
   ↓
8. Si chat estaba abierto, se cierra automáticamente
```

---

## ESTRUCTURA DE DATOS

### Tabla: messages
```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id INT NOT NULL REFERENCES users(id),
  receiver_id INT NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_sender_receiver (sender_id, receiver_id),
  INDEX idx_created_at (created_at)
);
```

### Tabla: user_sessions
```sql
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  socket_id VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'online', -- online, inactive, offline
  last_activity TIMESTAMP DEFAULT NOW(),
  connected_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, socket_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);
```

### Socket Events

**Cliente → Servidor:**
```
- 'message:send' { to: userId, content: string }
- 'user:typing' { to: userId }
- 'messages:read' { from: userId }
- 'user:disconnect'
```

**Servidor → Cliente:**
```
- 'message:received' { from: userId, content: string, timestamp: Date }
- 'user:typing' { from: userId }
- 'user:online' { userId, name, status }
- 'user:offline' { userId }
- 'messages:cleared' (limpieza nocturna)
```

---

## ENDPOINTS REST

### GET /api/chat/active-users
```
Retorna lista de usuarios conectados
Response: {
  success: true,
  data: [
    { id, name, role, status, lastSeen, unreadCount }
  ]
}
```

### GET /api/chat/messages/:userId
```
Retorna historial de mensajes del día con ese usuario
Response: {
  success: true,
  data: [
    { id, senderId, content, timestamp, read }
  ]
}
```

### POST /api/chat/messages
```
Guarda un mensaje (respaldo en BD)
Body: { receiverId, content }
Response: {
  success: true,
  data: { id, timestamp }
}
```

### PUT /api/chat/messages/:userId/read
```
Marca mensajes como leídos
Response: {
  success: true,
  message: 'Mensajes marcados como leídos'
}
```

### DELETE /api/chat/messages
```
Limpia mensajes antiguos (admin/cron)
Query: ?days=1 (por defecto 1 día)
Response: {
  success: true,
  message: 'X mensajes eliminados'
}
```

---

## SEGURIDAD

### Autenticación
- JWT token en headers
- Socket.io verifica token en conexión
- Middleware verifyToken en todos los endpoints

### Autorización
- Usuario solo puede ver sus propios mensajes
- Usuario solo puede enviar a usuarios activos
- Admin puede ver/limpiar todos los mensajes

### Validación
- Contenido del mensaje: max 1000 caracteres
- Receptor debe existir y estar activo
- Timestamp validado en servidor

### Rate Limiting
- Max 10 mensajes por minuto por usuario
- Max 5 conexiones simultáneas por usuario

---

## PERFORMANCE

### Optimizaciones
- Mensajes cargados bajo demanda (solo del día)
- Índices en BD para queries rápidas
- Socket.io con compresión
- Lazy loading de usuarios activos
- Caché de usuarios en frontend

### Escalabilidad
- Socket.io adapter para múltiples servidores
- Redis para sesiones compartidas
- Particionamiento de tabla messages por fecha

