# 🚀 Guía de Implementación del Chat

## RESUMEN VISUAL RÁPIDO

### 1️⃣ BOTÓN FLOTANTE (Siempre visible)
```
Esquina inferior derecha
┌─────────┐
│  💬  ⭕ │  ← Badge rojo con número
│         │
└─────────┘
- Fixed position
- 56x56px circular
- Pulse animation cuando hay mensajes
- Z-index: 999
```

### 2️⃣ MODAL DE CONTACTOS (Al hacer click)
```
┌─────────────────────────┐
│ Mensajes            ✕   │
├─────────────────────────┤
│ 🔍 Buscar...            │
├─────────────────────────┤
│ 👤 Juan Pérez  🟢 Online│
│ 👤 María García 🟢 Online│
│ 👤 Carlos López 🟡 Inact│
│ 👤 Ana Martínez 🔴 Offli│
└─────────────────────────┘
- 320x400px
- Centrado en pantalla
- Overlay semi-transparente
- Scroll interno
```

### 3️⃣ VENTANA DE CHAT (Al seleccionar contacto)
```
┌─────────────────────────────┐
│ Juan Pérez  🟢 Online   ✕   │
├─────────────────────────────┤
│                             │
│              ┌────────────┐ │
│              │ Hola! 10:30│ │ ← Enviado (derecha)
│              └────────────┘ │
│                             │
│ ┌────────────┐              │
│ │ Hola! 10:31│              │ ← Recibido (izquierda)
│ └────────────┘              │
│                             │
│ Juan está escribiendo...    │
├─────────────────────────────┤
│ 📎 Escribe tu mensaje...  ➤ │
└─────────────────────────────┘
- 400x500px
- Centrado en pantalla
- Auto-scroll al último mensaje
```

### 4️⃣ NOTIFICACIÓN (Cuando llega mensaje)
```
┌──────────────────────────────┐
│ 💬 Juan Pérez                │
│ "Hola, ¿cómo estás?"         │
│ Hace 2 segundos              │
└──────────────────────────────┘
- Top-right corner
- Auto-dismiss en 5 segundos
- Click abre el chat
```

---

## FLUJO DE USUARIO

```
1. Usuario ve botón 💬 en esquina inferior derecha
   ↓
2. Hace click → Se abre modal con usuarios activos
   ↓
3. Selecciona un usuario → Se abre ventana de chat
   ↓
4. Escribe mensaje → Presiona Enter o click en ➤
   ↓
5. Mensaje aparece en tiempo real (WebSocket)
   ↓
6. Si cierra chat y recibe mensaje → Toast notification
   ↓
7. Badge del botón muestra contador de no leídos
```

---

## INDICADORES DE ESTADO

| Estado | Icono | Color | Significado |
|--------|-------|-------|-------------|
| Online | 🟢 | Verde | Conectado ahora |
| Inactivo | 🟡 | Amarillo | Sin actividad >5min |
| Offline | 🔴 | Rojo | No conectado |

---

## NOTIFICACIONES

### Cuando hay mensajes sin leer:
1. **Badge en botón**: Número rojo
2. **Pulse animation**: Botón parpadea
3. **Toast**: Aparece en esquina superior derecha
4. **Indicador en lista**: Punto rojo junto al nombre

### Cuando abre el chat:
1. Mensajes se marcan como leídos
2. Badge desaparece
3. Toast se cierra

---

## LIMPIEZA AUTOMÁTICA

**Cada noche a las 23:59:**
- ❌ Borrar todos los mensajes del día
- ❌ Resetear contadores
- ✅ Mantener estado de usuarios
- ✅ Mantener historial de conexiones (para auditoría)

---

## COMPONENTES A CREAR

```
src/components/Chat/
├── ChatFloatingButton.tsx      ← Botón flotante
├── ChatContactsModal.tsx       ← Modal de usuarios
├── ChatWindow.tsx              ← Ventana de chat
├── ChatNotification.tsx        ← Toast notification
├── ChatInput.tsx               ← Input de mensaje
├── MessagesList.tsx            ← Lista de mensajes
├── Message.tsx                 ← Componente de mensaje
├── TypingIndicator.tsx         ← "Está escribiendo..."
└── ChatContext.tsx             ← Context para estado

src/services/
├── chatService.ts              ← API calls
└── socketService.ts            ← WebSocket (Socket.io)

src/hooks/
└── useChat.ts                  ← Custom hook
```

---

## TECNOLOGÍAS

**Backend:**
- Socket.io (WebSocket)
- PostgreSQL (tabla messages)
- Node-cron (limpieza diaria)

**Frontend:**
- React Context (estado)
- Socket.io-client (WebSocket)
- Tailwind CSS (estilos)

