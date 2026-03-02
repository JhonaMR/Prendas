# 📱 ARQUITECTURA: PWA VENDEDORES + OFFLINE-FIRST

## 📋 ÍNDICE
1. [Visión General](#visión-general)
2. [Flujo Completo](#flujo-completo)
3. [Componentes Técnicos](#componentes-técnicos)
4. [Base de Datos](#base-de-datos)
5. [Cloudflare Tunnel](#cloudflare-tunnel)
6. [PWA Offline-First](#pwa-offline-first)
7. [Sincronización](#sincronización)
8. [Notificaciones](#notificaciones)
9. [Revisión y Asentamiento](#revisión-y-asentamiento)

---

## 🎯 VISIÓN GENERAL

### Objetivo
Permitir que vendedores tomen pedidos desde celular sin internet, y que se sincronicen automáticamente cuando tengan conexión. Tú revisas y apruebas antes de asentar en el sistema.

### Actores
- **Vendedores**: Toman pedidos en PWA (celular, sin internet)
- **Tú (Admin)**: Revisas pedidos en tu sistema desktop
- **Sistema**: Backend + Base de datos + Cloudflare Tunnel

### Flujo de Alto Nivel
```
Vendedor (sin internet)
    ↓ Toma pedido
    ↓ Guarda en IndexedDB (navegador)
    ↓ Muestra: "Guardado localmente"
    ↓
Vendedor (con internet)
    ↓ PWA detecta conexión
    ↓ Sincroniza automáticamente
    ↓ Envía a tu servidor
    ↓
Tu Sistema
    ↓ Recibe notificación: "3 pedidos pendientes"
    ↓ Revisas uno por uno
    ↓ Apruebas → Se asientan en Orders
```

---

## 🔄 FLUJO COMPLETO (PASO A PASO)

### FASE 1: VENDEDOR TOMA PEDIDO (SIN INTERNET)

**Hora: 10:00 AM - Vendedor en zona rural**

```
Vendedor abre PWA
    ↓
Pantalla: "⚠️ Sin conexión (offline)"
    ↓
Llena formulario:
  - Cliente: "Almacén La 14"
  - Correría: "Verano 2024"
  - Referencias: 10210 (50 unidades, $30,900)
  - Fecha inicio: 15/03/2024
  - Fecha fin: 20/03/2024
  - Observaciones: "Urgente"
    ↓
Click "GUARDAR PEDIDO"
    ↓
PWA guarda en IndexedDB:
{
  id: "uuid-1234",
  vendedor: "vendedor_001",
  cliente: "almacen_14",
  correria: "verano_2024",
  items: [
    { ref: "10210", cantidad: 50, precio: 30900 }
  ],
  fechaInicio: "2024-03-15",
  fechaFin: "2024-03-20",
  observaciones: "Urgente",
  estado: "local",  // No sincronizado
  createdAt: "2024-03-02T10:00:00Z"
}
    ↓
Pantalla muestra:
  ✅ Pedido guardado localmente
  📦 Pedidos sin sincronizar: 1
    ↓
Vendedor puede tomar más pedidos (offline)
```

**Hora: 10:30 AM - Toma otro pedido**

```
Repite el proceso
    ↓
IndexedDB ahora tiene 2 pedidos
    ↓
Pantalla: "📦 Pedidos sin sincronizar: 2"
```

---

### FASE 2: VENDEDOR LLEGA A INTERNET

**Hora: 1:00 PM - Vendedor en hotel con WiFi**

```
PWA detecta conexión (evento "online")
    ↓
Service Worker se activa
    ↓
Muestra notificación:
  "⚠️ Tienes 2 pedidos sin sincronizar"
  [SINCRONIZAR AHORA]
    ↓
Vendedor click "SINCRONIZAR AHORA"
    ↓
PWA prepara batch:
{
  pedidos: [
    { id: "uuid-1234", cliente: "almacen_14", ... },
    { id: "uuid-5678", cliente: "almacen_20", ... }
  ]
}
    ↓
Envía POST a:
https://pedidos.tudominio.com/api/pedidos-pendientes/batch
    ↓
(Cloudflare Tunnel → Tu servidor local)
    ↓
Backend recibe y guarda en PostgreSQL
    ↓
Respuesta: 200 OK
{
  success: true,
  message: "2 pedidos recibidos",
  ids: ["uuid-1234", "uuid-5678"]
}
    ↓
PWA marca como sincronizados en IndexedDB
    ↓
Pantalla muestra:
  ✅ Sincronización exitosa
  📤 2 pedidos enviados
  💾 0 pedidos locales
```

---

### FASE 3: TÚ REVISAS EN TU SISTEMA

**Hora: 1:05 PM - Tu sistema desktop**

```
Tu navegador recibe notificación:
  "🔔 2 pedidos pendientes por revisar"
    ↓
Badge en menú: "Pedidos Pendientes (2)"
    ↓
Click en "Pedidos Pendientes"
    ↓
Ves lista:
  1. Almacén La 14 - 1 referencia - $30,900
  2. Almacén 20 - 2 referencias - $85,000
    ↓
Click en pedido #1
    ↓
Modal muestra detalles:
  Cliente: Almacén La 14
  Correría: Verano 2024
  Vendedor: vendedor_001
  
  REFERENCIAS:
  - 10210: 50 unidades @ $30,900 = $1,545,000
  
  Fecha inicio: 15/03/2024
  Fecha fin: 20/03/2024
  Observaciones: Urgente
  
  [ASENTAR] [RECHAZAR] [EDITAR]
    ↓
Click "ASENTAR"
    ↓
Backend:
  1. Crea Order en tabla orders
  2. Crea OrderItems
  3. Marca pedido_pendiente como "aprobado"
  4. Responde: 200 OK
    ↓
Tu pantalla:
  ✅ Pedido asentado
  Badge actualiza: "Pedidos Pendientes (1)"
```

---

## 🏗️ COMPONENTES TÉCNICOS

### 1. CLOUDFLARE TUNNEL (Conexión segura)

```
Tu servidor local (192.168.1.100:3000)
    ↓
Cloudflare Tunnel (encriptado)
    ↓
URL pública: https://pedidos.tudominio.com
    ↓
Vendedor en carretera accede sin problemas
```

**Ventajas:**
- ✅ HTTPS automático (Let's Encrypt)
- ✅ No expones tu red
- ✅ Gratis
- ✅ Funciona siempre (aunque tu IP cambie)

### 2. PWA (Progressive Web App)

```
Proyecto separado: pwa-vendedores/
    ↓
Tecnología: React + Vite + TypeScript
    ↓
Tamaño: ~300 KB (muy ligera)
    ↓
Funcionalidades:
  - Login (reutiliza tu auth)
  - Formulario tomar pedido
  - Lista de pedidos locales
  - Sincronización automática
  - Modo offline
```

### 3. SERVICE WORKER (Magia offline)

```
Service Worker (archivo: sw.js)
    ↓
Responsabilidades:
  1. Cachear archivos de la PWA
  2. Detectar conexión (online/offline)
  3. Sincronizar cuando hay internet
  4. Mostrar notificaciones
```

### 4. INDEXEDDB (Base de datos local)

```
IndexedDB (en navegador del celular)
    ↓
Almacena:
  - Pedidos sin sincronizar
  - Datos de cliente/referencias (caché)
  - Historial de sincronización
    ↓
Ventajas:
  - Persiste aunque cierres navegador
  - Capacidad: 50+ MB
  - Muy rápido
  - Seguro (no se borra fácilmente)
```

---

## 💾 BASE DE DATOS

### Nueva tabla: `pedidos_pendientes`

```sql
CREATE TABLE pedidos_pendientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información del vendedor
  vendedor_id VARCHAR(50) NOT NULL,
  
  -- Información del pedido
  cliente_id VARCHAR(50) NOT NULL,
  correria_id VARCHAR(50),
  
  -- Items del pedido (JSON)
  items JSONB NOT NULL,  -- [{ref, cantidad, precio}, ...]
  total DECIMAL(10,2),
  
  -- Fechas de despacho
  fecha_inicio_despacho DATE,
  fecha_fin_despacho DATE,
  
  -- Observaciones
  observaciones TEXT,
  
  -- Estado del pedido
  estado VARCHAR(20) DEFAULT 'pendiente',  -- pendiente, aprobado, rechazado
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by VARCHAR(50),
  
  -- Sincronización
  sincronizado_en TIMESTAMP,
  
  FOREIGN KEY (vendedor_id) REFERENCES users(login_code),
  FOREIGN KEY (cliente_id) REFERENCES clients(id)
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_pedidos_pendientes_estado ON pedidos_pendientes(estado);
CREATE INDEX idx_pedidos_pendientes_vendedor ON pedidos_pendientes(vendedor_id);
CREATE INDEX idx_pedidos_pendientes_created ON pedidos_pendientes(created_at DESC);
```

### Relación con tabla `orders` existente

```
pedidos_pendientes (temporal)
    ↓
Cuando apruebas:
    ↓
orders (definitivo)
    ↓
order_items
```

---

## 🌐 CLOUDFLARE TUNNEL

### Setup (una sola vez)

```bash
# 1. Instalar Cloudflare Tunnel
npm install -g cloudflared

# 2. Login (abre navegador)
cloudflared tunnel login

# 3. Crear túnel
cloudflared tunnel create sistema-plow

# 4. Configurar (crear archivo config.yml)
tunnel: <ID_DEL_TUNEL>
credentials-file: /ruta/credentials.json

ingress:
  - hostname: pedidos.tudominio.com
    service: http://localhost:3000
  - service: http_status:404

# 5. Ejecutar (dejar corriendo 24/7)
cloudflared tunnel run sistema-plow
```

### URLs finales

```
Tu sistema (solo red local):
http://192.168.1.100:3000

Tu sistema (desde internet):
https://admin.tudominio.com  (con Cloudflare Tunnel)

PWA Vendedores:
https://pedidos.tudominio.com  (con Cloudflare Tunnel)
```

---

## 📱 PWA OFFLINE-FIRST

### Estructura de carpetas

```
pwa-vendedores/
├── src/
│   ├── views/
│   │   ├── LoginView.tsx          (login simple)
│   │   ├── TomarPedidoView.tsx    (formulario grande)
│   │   └── MisPedidosView.tsx     (lista de pedidos locales)
│   ├── components/
│   │   ├── FormPedido.tsx         (formulario reutilizable)
│   │   ├── ListaPedidos.tsx       (lista de pedidos)
│   │   └── NotificacionSync.tsx   (notificación de sincronización)
│   ├── services/
│   │   ├── api.ts                 (llamadas al backend)
│   │   ├── offlineSync.ts         (lógica de sincronización)
│   │   └── indexedDB.ts           (operaciones con BD local)
│   ├── hooks/
│   │   ├── useOnlineStatus.ts     (detecta conexión)
│   │   └── usePedidosLocales.ts   (gestiona pedidos locales)
│   ├── sw.js                      (service worker)
│   ├── App.tsx                    (rutas principales)
│   └── index.tsx
├── public/
│   ├── manifest.json              (configuración PWA)
│   └── icons/                     (iconos para instalar)
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Flujo de datos (offline-first)

```
Usuario llena formulario
    ↓
Click "Guardar Pedido"
    ↓
¿Hay internet?
    ├─ SÍ → Envía a servidor + guarda local
    └─ NO → Guarda solo en IndexedDB
    ↓
Muestra confirmación
    ↓
Marca como "pendiente de sincronizar"
```

---

## 🔄 SINCRONIZACIÓN

### Cuándo se sincroniza

```
1. Automático cuando detecta internet
   window.addEventListener('online', sincronizar)

2. Manual: Click en botón "Sincronizar"

3. Periódico: Cada 5 minutos si hay internet
```

### Proceso de sincronización

```
1. Obtener pedidos no sincronizados de IndexedDB
   SELECT * FROM pedidos WHERE sincronizado = false

2. Preparar batch
   {
     pedidos: [
       { id, cliente, items, ... },
       { id, cliente, items, ... }
     ]
   }

3. Enviar POST a backend
   POST https://pedidos.tudominio.com/api/pedidos-pendientes/batch
   Authorization: Bearer <JWT_TOKEN>

4. Backend procesa
   - Valida datos
   - Guarda en PostgreSQL
   - Retorna IDs guardados

5. PWA marca como sincronizados
   UPDATE pedidos SET sincronizado = true WHERE id IN (...)

6. Muestra confirmación
   "✅ 3 pedidos sincronizados"
```

### Manejo de errores

```
¿Falla la sincronización?
    ↓
Reintenta cada 30 segundos (máximo 5 intentos)
    ↓
¿Sigue fallando?
    ↓
Muestra: "⚠️ Error sincronizando. Reintentaremos cuando haya conexión"
    ↓
Pedidos siguen en IndexedDB (seguros)
    ↓
Cuando vuelve internet → Reintenta automáticamente
```

---

## 🔔 NOTIFICACIONES

### Notificación al Vendedor

```
Cuando sincroniza exitosamente:
    ↓
Toast/Notificación: "✅ 3 pedidos sincronizados"
    ↓
Desaparece en 3 segundos
```

### Notificación a Ti (Admin)

```
Backend recibe pedidos
    ↓
Incrementa contador: pedidos_pendientes_count++
    ↓
Envía evento WebSocket a tu sistema
    {
      type: "PEDIDOS_NUEVOS",
      count: 3,
      timestamp: "2024-03-02T13:05:00Z"
    }
    ↓
Tu sistema recibe evento
    ↓
Actualiza badge: "Pedidos Pendientes (3)"
    ↓
Muestra notificación: "🔔 3 pedidos pendientes por revisar"
    ↓
Sonido (opcional)
```

### Implementación técnica

```javascript
// Backend (Node.js)
const io = require('socket.io')(server);

app.post('/api/pedidos-pendientes/batch', (req, res) => {
  // ... guardar pedidos ...
  
  // Notificar a admin
  io.emit('PEDIDOS_NUEVOS', {
    count: pedidos.length,
    timestamp: new Date()
  });
  
  res.json({ success: true });
});

// Frontend (Tu sistema)
const socket = io();

socket.on('PEDIDOS_NUEVOS', (data) => {
  // Actualizar badge
  setBadgeCount(data.count);
  
  // Mostrar notificación
  showNotification(`${data.count} pedidos pendientes`);
  
  // Sonido
  playSound('notification.mp3');
});
```

---

## ✅ REVISIÓN Y ASENTAMIENTO

### Flujo en tu sistema

```
1. VES BADGE: "Pedidos Pendientes (3)"
    ↓
2. CLICK EN BADGE
    ↓
3. VES LISTA:
   - Almacén La 14 (1 ref, $1.5M)
   - Almacén 20 (2 refs, $2.1M)
   - Almacén 30 (1 ref, $800K)
    ↓
4. CLICK EN PEDIDO #1
    ↓
5. MODAL CON DETALLES:
   Cliente: Almacén La 14
   Vendedor: Juan Pérez
   Correría: Verano 2024
   
   REFERENCIAS:
   - 10210: 50 unidades @ $30,900 = $1,545,000
   
   Fecha inicio: 15/03/2024
   Fecha fin: 20/03/2024
   Observaciones: Urgente
   
   [ASENTAR] [RECHAZAR] [EDITAR]
    ↓
6. CLICK "ASENTAR"
    ↓
7. BACKEND PROCESA:
   - Crea Order en tabla orders
   - Crea OrderItems
   - Marca pedido_pendiente como "aprobado"
   - Actualiza badge
    ↓
8. TU PANTALLA:
   ✅ Pedido asentado
   Badge: "Pedidos Pendientes (2)"
```

### Opciones de revisión

```
[ASENTAR]
  → Crea Order definitivo
  → Marca como "aprobado"
  → Mueve a historial

[RECHAZAR]
  → Marca como "rechazado"
  → Notifica al vendedor (opcional)
  → Mueve a historial

[EDITAR]
  → Abre formulario
  → Permite cambiar datos
  → Guarda cambios
  → Luego [ASENTAR]
```

---

## 📊 RESUMEN TÉCNICO

| Componente | Tecnología | Propósito |
|-----------|-----------|----------|
| **PWA** | React + Vite + TS | Interfaz vendedores |
| **Offline** | IndexedDB + Service Worker | Guardar pedidos sin internet |
| **Sincronización** | Fetch API + WebSocket | Enviar pedidos y notificaciones |
| **Backend** | Node.js + Express | Recibir y procesar pedidos |
| **Base de datos** | PostgreSQL | Almacenar pedidos_pendientes |
| **Conexión remota** | Cloudflare Tunnel | Acceso desde internet |
| **HTTPS** | Let's Encrypt (Cloudflare) | Seguridad y PWA |
| **Notificaciones** | Socket.io | Tiempo real |

---

## 🔐 SEGURIDAD

### Autenticación

```
Vendedor login en PWA
    ↓
Envía credenciales a backend
    ↓
Backend valida y retorna JWT
    ↓
PWA guarda JWT en localStorage
    ↓
Cada request incluye JWT
    ↓
Backend valida JWT antes de procesar
```

### Validación

```
PWA valida:
  - Cliente existe
  - Referencias existen
  - Cantidades > 0
  - Precios válidos

Backend valida (de nuevo):
  - JWT válido
  - Vendedor existe
  - Cliente existe
  - Referencias existen
  - Datos completos
```

### Encriptación

```
Cloudflare Tunnel:
  - Tráfico encriptado end-to-end
  - HTTPS automático
  - No expone tu red local
```

---

## 📈 ESCALABILIDAD

### Cuántos vendedores soporta

```
Con tu internet actual (estimado 10 Mbps):
  - 50+ vendedores simultáneos
  - 1000+ pedidos/día
  - Sin problemas de rendimiento
```

### Crecimiento futuro

```
Si crece mucho:
  - Agregar backend en cloud (Railway, Heroku)
  - Sincronización bidireccional
  - Caché distribuido
  - CDN para PWA
```

---

## ⚠️ CONSIDERACIONES

### Limitaciones

```
1. Offline-first requiere que vendedor tenga WiFi
   para sincronizar (no funciona con datos móviles
   si no tiene plan)

2. IndexedDB tiene límite de ~50 MB
   (suficiente para miles de pedidos)

3. Si vendedor limpia datos del navegador,
   pierde pedidos locales (pero raro)
```

### Soluciones

```
1. Educación: Explicar que necesita WiFi para sincronizar

2. Backup: Guardar en múltiples lugares (IndexedDB + LocalStorage)

3. Confirmación: Pedir confirmación antes de limpiar datos
```

---

## 🚀 PRÓXIMOS PASOS

1. **Aprobación de arquitectura** ← Estamos aquí
2. Setup Cloudflare Tunnel
3. Crear tabla pedidos_pendientes
4. Endpoints backend
5. PWA estructura base
6. Formulario móvil
7. Service Worker
8. Vista de revisión
9. Testing
10. Deploy

¿Preguntas sobre esta arquitectura?
