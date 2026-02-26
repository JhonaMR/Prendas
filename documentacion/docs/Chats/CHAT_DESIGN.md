# 💬 Diseño Visual del Chat Interno

## 1. BOTÓN FLOTANTE (Chat Button)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                                                             │
│                                                    ┌──────┐ │
│                                                    │ 💬 3 │ │ ← Badge con contador
│                                                    └──────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Posición: Fixed bottom-right (16px from bottom, 16px from right)
Tamaño: 56px x 56px (circular)
Color: Primary brand color (azul/verde según tu tema)
Badge: Rojo con número de mensajes sin leer
Hover: Escala 1.1, sombra más pronunciada
Scroll: Se mantiene visible siempre
```

**Especificaciones técnicas:**
- `position: fixed`
- `bottom: 16px; right: 16px`
- `z-index: 999` (por encima de todo)
- Icono: Chat bubble o message icon
- Badge: Contador de mensajes no leídos
- Animación: Pulse suave cuando hay mensajes nuevos

---

## 2. MODAL DE USUARIOS ACTIVOS (Contacts List)

```
┌─────────────────────────────────────────────────────────────┐
│  Mensajes                                              ✕    │ ← Header
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔍 Buscar usuario...                                       │ ← Search bar
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  👤 Juan Pérez                                    🟢 Online  │ ← Usuario activo
│     Diseñadora                                              │
│                                                             │
│  👤 María García                                  🟢 Online  │
│     Admin                                                   │
│                                                             │
│  👤 Carlos López                                  🟡 Inactivo│ ← Usuario inactivo
│     General                                                 │
│                                                             │
│  👤 Ana Martínez                                 🔴 Offline  │ ← Usuario offline
│     Observer                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Tamaño: 320px ancho x 400px alto
Posición: Centrada en pantalla
Scroll: Interno si hay muchos usuarios
```

**Especificaciones:**
- Modal overlay con fondo semi-transparente (rgba(0,0,0,0.5))
- Animación de entrada: Fade + Scale (0.95 → 1)
- Search en tiempo real (filtra por nombre)
- Indicador de estado: 🟢 Online, 🟡 Inactivo (>5min), 🔴 Offline
- Click en usuario abre la ventana de chat

---

## 3. VENTANA DE CHAT (Chat Window)

```
┌─────────────────────────────────────────────────────────────┐
│  Juan Pérez                                    🟢 Online  ✕  │ ← Header
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Hoy 10:30 AM                                              │ ← Timestamp
│                                                             │
│                                    ┌─────────────────────┐ │
│                                    │ Hola, ¿cómo estás?  │ │ ← Mensaje enviado
│                                    │ 10:30 AM            │ │
│                                    └─────────────────────┘ │
│                                                             │
│  ┌─────────────────────┐                                   │
│  │ Bien, ¿y tú?        │ ← Mensaje recibido               │
│  │ 10:31 AM            │                                   │
│  └─────────────────────┘                                   │
│                                                             │
│                                    ┌─────────────────────┐ │
│                                    │ Todo bien por aquí  │ │
│                                    │ 10:32 AM            │ │
│                                    └─────────────────────┘ │
│                                                             │
│  Juan está escribiendo...                                  │ ← Typing indicator
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  📎  Escribe tu mensaje...                          ➤      │ ← Input
└─────────────────────────────────────────────────────────────┘

Tamaño: 400px ancho x 500px alto
Posición: Centrada en pantalla
Scroll: Automático al último mensaje
```

**Especificaciones:**
- Header con nombre, estado online y botón cerrar
- Área de mensajes con scroll automático
- Mensajes enviados: Alineados derecha, color azul/verde
- Mensajes recibidos: Alineados izquierda, color gris
- Timestamp en cada mensaje
- Indicador "está escribiendo..." en tiempo real
- Input con placeholder
- Botón enviar (icono paper plane)

---

## 4. NOTIFICACIÓN DE MENSAJE NUEVO

### 4.1 Toast Notification (esquina superior derecha)

```
┌──────────────────────────────────────┐
│ 💬 Nuevo mensaje de Juan Pérez       │ ← Toast
│ "Hola, ¿cómo estás?"                 │
│ [Hace 2 segundos]                    │
└──────────────────────────────────────┘

Posición: top-right (16px from top, 16px from right)
Duración: 5 segundos (auto-dismiss)
Click: Abre el chat con ese usuario
Animación: Slide in from right
```

**Especificaciones:**
- Fondo: Color según tipo (info/success)
- Icono: Chat bubble
- Texto: Nombre usuario + preview del mensaje
- Auto-dismiss después de 5 segundos
- Click abre el chat
- Múltiples notificaciones se apilan

### 4.2 Badge en Botón Flotante

```
┌──────────┐
│ 💬    ┌─┐│
│      │3││ ← Badge rojo con número
│      └─┘│
└──────────┘

Color: Rojo (#EF4444)
Tamaño: 20px x 20px
Posición: Top-right del botón
Animación: Pulse cuando llega mensaje nuevo
```

### 4.3 Indicador en Lista de Usuarios

```
👤 Juan Pérez                                    🟢 Online
   Diseñadora                                    ⭐ 1 mensaje
   
Cuando hay mensajes sin leer de ese usuario
```

---

## 5. FLUJO DE INTERACCIÓN

### Paso 1: Usuario hace click en botón flotante
```
[Usuario hace click en 💬]
         ↓
[Se abre modal de usuarios activos]
         ↓
[Usuario ve lista de contactos con estado]
```

### Paso 2: Usuario selecciona un contacto
```
[Usuario hace click en "Juan Pérez"]
         ↓
[Se cierra modal de usuarios]
         ↓
[Se abre ventana de chat con Juan]
         ↓
[Se marca como leído]
```

### Paso 3: Recibe mensaje mientras está en chat
```
[Juan envía mensaje]
         ↓
[Llega en tiempo real (WebSocket)]
         ↓
[Se muestra en la ventana de chat]
         ↓
[Se marca automáticamente como leído]
```

### Paso 4: Recibe mensaje mientras NO está en chat
```
[Juan envía mensaje]
         ↓
[Llega en tiempo real (WebSocket)]
         ↓
[Se incrementa badge del botón flotante]
         ↓
[Se muestra toast notification]
         ↓
[Se marca como no leído en lista de usuarios]
```

---

## 6. ESTADOS VISUALES

### Estado: Sin mensajes nuevos
- Badge: Oculto
- Botón: Color normal
- Animación: Ninguna

### Estado: Mensajes nuevos
- Badge: Visible con número
- Botón: Pulse animation
- Toast: Aparece en esquina

### Estado: Chat abierto
- Ventana: Visible
- Mensajes: Se marcan como leídos
- Badge: Se oculta
- Input: Enfocado

### Estado: Escribiendo
- Indicador: "Juan está escribiendo..."
- Animación: Puntos parpadeantes

---

## 7. COLORES Y ESTILOS

```
Botón flotante:
  - Background: Primary color (azul/verde)
  - Hover: Más oscuro
  - Shadow: 0 4px 12px rgba(0,0,0,0.15)

Mensajes enviados:
  - Background: Primary color
  - Text: Blanco
  - Border-radius: 12px

Mensajes recibidos:
  - Background: #E5E7EB (gris claro)
  - Text: #1F2937 (gris oscuro)
  - Border-radius: 12px

Badge:
  - Background: #EF4444 (rojo)
  - Text: Blanco
  - Font-size: 12px
  - Font-weight: bold

Indicadores de estado:
  - 🟢 Online: #10B981 (verde)
  - 🟡 Inactivo: #F59E0B (amarillo)
  - 🔴 Offline: #EF4444 (rojo)
```

---

## 8. RESPONSIVE DESIGN

### Desktop (>1024px)
- Modal: 320px x 400px
- Chat: 400px x 500px
- Botón: 56px x 56px

### Tablet (768px - 1024px)
- Modal: 280px x 350px
- Chat: 350px x 450px
- Botón: 48px x 48px

### Mobile (<768px)
- Modal: 90vw x 80vh (fullscreen casi)
- Chat: 90vw x 80vh (fullscreen casi)
- Botón: 48px x 48px
- Posición: bottom: 12px; right: 12px

---

## 9. ANIMACIONES

### Entrada del modal
```
Duración: 300ms
Easing: ease-out
Transformación: 
  - Opacity: 0 → 1
  - Scale: 0.95 → 1
```

### Entrada del chat
```
Duración: 300ms
Easing: ease-out
Transformación:
  - Opacity: 0 → 1
  - TranslateY: 20px → 0
```

### Pulse del botón (cuando hay mensajes)
```
Duración: 2s
Repetición: infinite
Transformación:
  - Scale: 1 → 1.1 → 1
  - Opacity: 1 → 0.8 → 1
```

### Toast notification
```
Entrada:
  - Duración: 300ms
  - TranslateX: 400px → 0
  
Salida:
  - Duración: 300ms
  - TranslateX: 0 → 400px
```

---

## 10. ESTRUCTURA DE COMPONENTES REACT

```
App.tsx
├── ChatFloatingButton
│   ├── Badge (contador)
│   └── Icon (chat bubble)
│
├── ChatContactsModal
│   ├── SearchBar
│   ├── ContactsList
│   │   └── ContactItem (x N)
│   │       ├── Avatar
│   │       ├── Name
│   │       ├── Role
│   │       ├── Status indicator
│   │       └── Unread badge
│   └── Close button
│
├── ChatWindow
│   ├── ChatHeader
│   │   ├── Name
│   │   ├── Status
│   │   └── Close button
│   ├── MessagesList
│   │   └── Message (x N)
│   │       ├── Avatar
│   │       ├── Content
│   │       ├── Timestamp
│   │       └── Read indicator
│   ├── TypingIndicator
│   └── ChatInput
│       ├── Input field
│       └── Send button
│
└── ChatNotification (Toast)
    ├── Icon
    ├── Message preview
    └── Close button
```

---

## 11. DATOS QUE NECESITAMOS

### Usuario conectado
```typescript
{
  id: string;
  name: string;
  role: UserRole;
  status: 'online' | 'inactive' | 'offline';
  lastSeen: Date;
  unreadCount: number;
}
```

### Mensaje
```typescript
{
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}
```

### Chat (conversación)
```typescript
{
  id: string;
  userId1: string;
  userId2: string;
  messages: Message[];
  lastMessage: Message;
  unreadCount: number;
}
```

---

## 12. LIMPIEZA AUTOMÁTICA

**Cada noche a las 23:59:**
- Borrar todos los mensajes del día anterior
- Resetear contadores de no leídos
- Limpiar conversaciones vacías
- Mantener solo el estado de usuarios conectados

