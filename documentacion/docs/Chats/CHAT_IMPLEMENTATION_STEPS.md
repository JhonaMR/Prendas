# 🚀 Pasos para Completar la Implementación del Chat

## ✅ Lo que ya está hecho:

1. ✅ **ChatContext** - Contexto global para el estado del chat
2. ✅ **Componentes React**:
   - ChatFloatingButton - Botón flotante
   - ChatContactsModal - Modal de contactos
   - ChatWindow - Ventana de chat
   - ChatInput - Input de mensaje
   - MessagesList - Lista de mensajes
   - Message - Componente de mensaje
   - TypingIndicator - Indicador de escritura
   - ChatNotification - Toast de notificación

3. ✅ **Servicios**:
   - chatService.ts - Llamadas a la API

4. ✅ **Backend**:
   - chatController.js - Controlador con endpoints
   - Rutas agregadas al index.js

5. ✅ **App.tsx** - Integrado con ChatProvider

---

## 📋 Pasos pendientes:

### 1. Crear las tablas en PostgreSQL

```bash
# Ejecutar el script SQL
psql -U postgres -d inventory -f Prendas/backend/scripts/create-chat-tables.sql
```

O ejecutar manualmente en pgAdmin:
```sql
-- Copiar el contenido de Prendas/backend/scripts/create-chat-tables.sql
```

---

### 2. Instalar Socket.io en el backend

```bash
cd Prendas/backend
npm install socket.io
```

---

### 3. Instalar Socket.io-client en el frontend

```bash
cd Prendas
npm install socket.io-client
```

---

### 4. Crear el servicio de Socket.io en el frontend

Crear archivo: `Prendas/src/services/socketService.ts`

```typescript
import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const socketService = {
  connect: (token: string) => {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = 3000;
    const url = `${protocol}//${hostname}:${port}`;

    socket = io(url, {
      auth: {
        token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('✅ Conectado a Socket.io');
    });

    socket.on('disconnect', () => {
      console.log('❌ Desconectado de Socket.io');
    });

    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket: () => socket,

  on: (event: string, callback: (...args: any[]) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  },

  emit: (event: string, data: any) => {
    if (socket) {
      socket.emit(event, data);
    }
  },

  off: (event: string) => {
    if (socket) {
      socket.off(event);
    }
  }
};
```

---

### 5. Configurar Socket.io en el backend

Crear archivo: `Prendas/backend/src/config/socketio.js`

```javascript
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { query } = require('./database');
const logger = require('../utils/logger');

let io = null;
const activeUsers = new Map(); // userId -> { socketId, status, lastActivity }

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true
    }
  });

  // Middleware de autenticación
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Token no proporcionado'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_default');
      socket.userId = decoded.id;
      socket.userName = decoded.name;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  });

  // Conexión
  io.on('connection', async (socket) => {
    logger.info(`✅ Usuario ${socket.userName} conectado (${socket.id})`);

    // Registrar en BD
    try {
      await query(
        'INSERT INTO user_sessions (user_id, socket_id, status, connected_at, last_activity) VALUES ($1, $2, $3, NOW(), NOW())',
        [socket.userId, socket.id, 'online']
      );
    } catch (error) {
      logger.error('Error registrando sesión:', error);
    }

    // Actualizar mapa de usuarios activos
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      status: 'online',
      lastActivity: new Date()
    });

    // Notificar a todos que un usuario está online
    io.emit('user:online', {
      userId: socket.userId,
      name: socket.userName,
      status: 'online'
    });

    // ==================== EVENTOS ====================

    // Enviar mensaje
    socket.on('message:send', async (data) => {
      try {
        const { to, content } = data;

        // Guardar en BD (ya se hace en el endpoint REST)
        // Aquí solo emitimos en tiempo real

        io.to(activeUsers.get(to)?.socketId || '').emit('message:received', {
          from: socket.userId,
          fromName: socket.userName,
          content,
          timestamp: new Date()
        });

        logger.info(`💬 Mensaje de ${socket.userName} a usuario ${to}`);
      } catch (error) {
        logger.error('Error enviando mensaje:', error);
      }
    });

    // Usuario escribiendo
    socket.on('user:typing', (data) => {
      const { to } = data;
      io.to(activeUsers.get(to)?.socketId || '').emit('user:typing', {
        from: socket.userId
      });
    });

    // Marcar como leído
    socket.on('messages:read', (data) => {
      const { from } = data;
      io.to(activeUsers.get(from)?.socketId || '').emit('messages:read', {
        from: socket.userId
      });
    });

    // Desconexión
    socket.on('disconnect', async () => {
      logger.info(`❌ Usuario ${socket.userName} desconectado`);

      // Eliminar de BD
      try {
        await query(
          'DELETE FROM user_sessions WHERE socket_id = $1',
          [socket.id]
        );
      } catch (error) {
        logger.error('Error eliminando sesión:', error);
      }

      // Actualizar mapa
      activeUsers.delete(socket.userId);

      // Notificar a todos
      io.emit('user:offline', {
        userId: socket.userId
      });
    });
  });

  return io;
};

const getIO = () => io;

module.exports = {
  initializeSocket,
  getIO
};
```

---

### 6. Integrar Socket.io en el servidor

Actualizar `Prendas/backend/src/server.js`:

```javascript
// Agregar al inicio
const https = require('https');
const { initializeSocket } = require('./config/socketio');

// Cambiar la creación del servidor
let server;
if (USE_HTTPS) {
  server = https.createServer({
    key: fs.readFileSync(path.join(__dirname, '../certs/server.key')),
    cert: fs.readFileSync(path.join(__dirname, '../certs/server.crt'))
  }, app);
} else {
  server = require('http').createServer(app);
}

// Inicializar Socket.io
initializeSocket(server);

// Iniciar servidor
server.listen(PORT, HOST, () => {
  logger.info(`🚀 Servidor escuchando en ${HOST}:${PORT}`);
});
```

---

### 7. Conectar Socket.io en el frontend

Actualizar `Prendas/src/App.tsx` en el useEffect de login:

```typescript
useEffect(() => {
  if (user) {
    // Conectar Socket.io
    const token = localStorage.getItem('auth_token');
    if (token) {
      socketService.connect(token);

      // Escuchar eventos
      socketService.on('user:online', (data) => {
        // Actualizar lista de usuarios
      });

      socketService.on('message:received', (data) => {
        // Mostrar notificación
      });
    }
  }

  return () => {
    // Desconectar al logout
    socketService.disconnect();
  };
}, [user]);
```

---

### 8. Crear scheduler para limpiar mensajes

Crear archivo: `Prendas/backend/src/jobs/cleanupMessagesJob.js`

```javascript
const cron = require('node-cron');
const { query } = require('../config/database');
const logger = require('../utils/logger');

// Ejecutar cada día a las 23:59
const cleanupMessagesJob = cron.schedule('59 23 * * *', async () => {
  try {
    logger.info('🧹 Iniciando limpieza de mensajes antiguos...');

    const result = await query(`
      DELETE FROM messages
      WHERE DATE(created_at) < CURRENT_DATE
    `);

    logger.info(`✅ ${result.rowCount} mensajes eliminados`);
  } catch (error) {
    logger.error('❌ Error limpiando mensajes:', error);
  }
});

module.exports = cleanupMessagesJob;
```

Agregar al `server.js`:
```javascript
require('./jobs/cleanupMessagesJob');
```

---

### 9. Instalar node-cron

```bash
cd Prendas/backend
npm install node-cron
```

---

### 10. Agregar animaciones a Tailwind

Actualizar `Prendas/tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      animation: {
        'scale-in': 'scale-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
      },
      keyframes: {
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
      },
    },
  },
};
```

---

## 🧪 Pruebas

1. Crear las tablas en BD
2. Instalar dependencias
3. Iniciar backend: `npm run dev`
4. Iniciar frontend: `npm run dev`
5. Hacer login con dos usuarios diferentes
6. Abrir chat y enviar mensajes
7. Verificar que aparecen en tiempo real

---

## 📝 Checklist Final

- [ ] Tablas creadas en PostgreSQL
- [ ] Socket.io instalado en backend
- [ ] Socket.io-client instalado en frontend
- [ ] socketService.ts creado
- [ ] socketio.js configurado
- [ ] server.js actualizado
- [ ] cleanupMessagesJob.js creado
- [ ] node-cron instalado
- [ ] Animaciones agregadas a Tailwind
- [ ] Pruebas completadas
- [ ] Chat funcionando en tiempo real

