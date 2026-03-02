# 📊 DIAGRAMAS VISUALES - PWA VENDEDORES

## 1️⃣ ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                │
└─────────────────────────────────────────────────────────────────┘
                              ↑
                              │ HTTPS
                              ↓
                    ┌─────────────────────┐
                    │ Cloudflare Tunnel   │
                    │ (Encriptado)        │
                    └─────────────────────┘
                              ↑
                              │
                ┌─────────────┴─────────────┐
                ↓                           ↓
        ┌──────────────┐          ┌──────────────┐
        │ PWA Vendedor │          │ Tu Sistema   │
        │ (Celular)    │          │ (Desktop)    │
        └──────────────┘          └──────────────┘
                │                           │
                │ (red local)               │ (red local)
                └─────────────┬─────────────┘
                              ↓
                    ┌─────────────────────┐
                    │  Backend (Node.js)  │
                    │  Puerto 3000        │
                    └─────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │  PostgreSQL         │
                    │  Base de datos      │
                    └─────────────────────┘
```

---

## 2️⃣ FLUJO OFFLINE-FIRST

```
VENDEDOR SIN INTERNET
┌─────────────────────────────────────────┐
│ 1. Abre PWA                             │
│    ⚠️ Sin conexión (offline)            │
├─────────────────────────────────────────┤
│ 2. Llena formulario                     │
│    - Cliente: Almacén La 14             │
│    - Referencias: 10210, 10211          │
│    - Precios: $30,900, $28,900          │
├─────────────────────────────────────────┤
│ 3. Click "GUARDAR PEDIDO"               │
│    ↓                                    │
│    Guarda en IndexedDB                  │
│    ↓                                    │
│    ✅ Pedido guardado localmente        │
├─────────────────────────────────────────┤
│ 4. Puede tomar más pedidos (offline)    │
│    📦 Pedidos sin sincronizar: 3        │
└─────────────────────────────────────────┘
                    ↓
        VENDEDOR LLEGA A INTERNET
┌─────────────────────────────────────────┐
│ 1. PWA detecta conexión                 │
│    ✅ Conectado                         │
├─────────────────────────────────────────┤
│ 2. Muestra notificación                 │
│    "⚠️ Tienes 3 pedidos sin sincronizar"│
├─────────────────────────────────────────┤
│ 3. Click "SINCRONIZAR AHORA"            │
│    ↓                                    │
│    Prepara batch de 3 pedidos           │
│    ↓                                    │
│    POST /api/pedidos-pendientes/batch   │
│    ↓                                    │
│    Cloudflare Tunnel → Tu servidor      │
│    ↓                                    │
│    Backend guarda en PostgreSQL         │
│    ↓                                    │
│    Respuesta: 200 OK                    │
│    ↓                                    │
│    Marca como sincronizados             │
├─────────────────────────────────────────┤
│ 4. Confirmación                         │
│    ✅ 3 pedidos sincronizados           │
│    📤 3 pedidos enviados                │
│    💾 0 pedidos locales                 │
└─────────────────────────────────────────┘
```

---

## 3️⃣ FLUJO COMPLETO: VENDEDOR → ADMIN

```
FASE 1: VENDEDOR TOMA PEDIDO (OFFLINE)
┌──────────────────────────────────────────────────────────┐
│ Vendedor en zona rural (sin internet)                   │
│                                                          │
│ 10:00 AM - Abre PWA                                     │
│ 10:05 AM - Toma pedido #1 → Guarda en IndexedDB        │
│ 10:15 AM - Toma pedido #2 → Guarda en IndexedDB        │
│ 10:25 AM - Toma pedido #3 → Guarda en IndexedDB        │
│                                                          │
│ Estado: 3 pedidos sin sincronizar                       │
└──────────────────────────────────────────────────────────┘
                          ↓
FASE 2: VENDEDOR SINCRONIZA (CON INTERNET)
┌──────────────────────────────────────────────────────────┐
│ Vendedor llega a hotel con WiFi                         │
│                                                          │
│ 1:00 PM - Abre PWA                                      │
│ 1:05 PM - Click "SINCRONIZAR"                           │
│           ↓                                              │
│           Envía 3 pedidos a servidor                    │
│           ↓                                              │
│           Backend recibe y guarda                       │
│           ↓                                              │
│           Emite evento WebSocket                        │
│           ↓                                              │
│ 1:06 PM - Confirmación: "✅ 3 sincronizados"           │
└──────────────────────────────────────────────────────────┘
                          ↓
FASE 3: ADMIN REVISA Y ASIENTE
┌──────────────────────────────────────────────────────────┐
│ Tu sistema (desktop)                                    │
│                                                          │
│ 1:06 PM - Recibes notificación                          │
│           "🔔 3 pedidos pendientes"                     │
│           ↓                                              │
│           Badge actualiza: "Pedidos Pendientes (3)"     │
│           ↓                                              │
│ 1:10 PM - Click en badge                               │
│           ↓                                              │
│           Ves lista de 3 pedidos                        │
│           ↓                                              │
│ 1:15 PM - Click en pedido #1                           │
│           ↓                                              │
│           Modal muestra detalles                        │
│           ↓                                              │
│ 1:20 PM - Click "ASENTAR"                              │
│           ↓                                              │
│           Backend crea Order                           │
│           ↓                                              │
│           Marca pedido_pendiente como "aprobado"       │
│           ↓                                              │
│ 1:21 PM - Confirmación: "✅ Pedido asentado"           │
│           Badge: "Pedidos Pendientes (2)"              │
│           ↓                                              │
│ 1:25 PM - Repite con pedidos #2 y #3                  │
│           ↓                                              │
│ 1:30 PM - Todos asentados                              │
│           Badge: "Pedidos Pendientes (0)"              │
└──────────────────────────────────────────────────────────┘
```

---

## 4️⃣ SINCRONIZACIÓN AUTOMÁTICA

```
DETECCIÓN DE CONEXIÓN
┌─────────────────────────────────────────┐
│ Service Worker monitorea conexión       │
│                                         │
│ window.addEventListener('online', ...) │
│ window.addEventListener('offline', ...) │
└─────────────────────────────────────────┘
                    ↓
        ¿HAY INTERNET?
        ↙           ↘
      SÍ             NO
      ↓              ↓
   SINCRONIZAR    ESPERAR
      ↓              ↓
   Obtener        Mostrar
   pedidos        "⚠️ Sin
   locales        conexión"
      ↓
   Preparar
   batch
      ↓
   POST a
   servidor
      ↓
   ¿Éxito?
   ↙     ↘
  SÍ      NO
  ↓       ↓
Marcar  Reintentar
como    (backoff
sincr.  exponencial)
  ↓       ↓
Notif.  Esperar
"✅"    internet
```

---

## 5️⃣ ESTRUCTURA DE DATOS

```
INDEXEDDB (Navegador del vendedor)
┌─────────────────────────────────────────┐
│ Tabla: pedidos                          │
├─────────────────────────────────────────┤
│ {                                       │
│   id: "uuid-1234",                      │
│   vendedorId: "vendedor_001",           │
│   clienteId: "cliente_123",             │
│   correriaId: "correria_456",           │
│   items: [                              │
│     {                                   │
│       referencia: "10210",              │
│       cantidad: 50,                     │
│       precio: 30900                     │
│     }                                   │
│   ],                                    │
│   total: 1545000,                       │
│   fechaInicioDespacho: "2024-03-15",   │
│   fechaFinDespacho: "2024-03-20",      │
│   observaciones: "Urgente",             │
│   sincronizado: false,                  │
│   createdAt: "2024-03-02T10:00:00Z"    │
│ }                                       │
└─────────────────────────────────────────┘
                    ↓
        SINCRONIZACIÓN
                    ↓
POSTGRESQL (Tu servidor)
┌─────────────────────────────────────────┐
│ Tabla: pedidos_pendientes               │
├─────────────────────────────────────────┤
│ id | vendedor_id | cliente_id | items   │
│ ... (mismo contenido)                   │
│ estado: 'pendiente'                     │
│ created_at: timestamp                   │
└─────────────────────────────────────────┘
                    ↓
        CUANDO APRUEBAS
                    ↓
POSTGRESQL
┌─────────────────────────────────────────┐
│ Tabla: orders                           │
├─────────────────────────────────────────┤
│ id | cliente_id | total | created_at    │
│ ... (nuevo Order)                       │
└─────────────────────────────────────────┘
                    +
┌─────────────────────────────────────────┐
│ Tabla: order_items                      │
├─────────────────────────────────────────┤
│ id | order_id | ref | qty | price       │
│ ... (items del Order)                   │
└─────────────────────────────────────────┘
```

---

## 6️⃣ NOTIFICACIONES EN TIEMPO REAL

```
BACKEND (Node.js)
┌──────────────────────────────────────────┐
│ POST /api/pedidos-pendientes/batch       │
│                                          │
│ 1. Recibe batch de 3 pedidos             │
│ 2. Valida datos                          │
│ 3. Guarda en PostgreSQL                  │
│ 4. Emite evento WebSocket:               │
│    {                                     │
│      type: 'PEDIDOS_NUEVOS',             │
│      count: 3,                           │
│      timestamp: '2024-03-02T13:05:00Z'   │
│    }                                     │
│ 5. Retorna 200 OK                        │
└──────────────────────────────────────────┘
                    ↓
            WEBSOCKET
                    ↓
TU SISTEMA (Frontend)
┌──────────────────────────────────────────┐
│ socket.on('PEDIDOS_NUEVOS', (data) => {  │
│                                          │
│ 1. Recibe evento                         │
│ 2. Actualiza badge: "Pedidos (3)"        │
│ 3. Muestra notificación:                 │
│    "🔔 3 pedidos pendientes"             │
│ 4. Reproduce sonido (opcional)           │
│ 5. Envía email (opcional)                │
│                                          │
│ })                                       │
└──────────────────────────────────────────┘
```

---

## 7️⃣ CLOUDFLARE TUNNEL

```
TU SERVIDOR LOCAL
┌─────────────────────────────────────────┐
│ http://192.168.1.100:3000               │
│ (solo accesible en red local)            │
└─────────────────────────────────────────┘
                    ↑
                    │ Conexión encriptada
                    │ (Cloudflare Tunnel)
                    ↓
┌─────────────────────────────────────────┐
│ Cloudflare CDN                          │
│ (HTTPS automático)                      │
│ (Let's Encrypt)                         │
│ (DDoS protection)                       │
└─────────────────────────────────────────┘
                    ↑
                    │ HTTPS
                    │
        ┌───────────┴───────────┐
        ↓                       ↓
    VENDEDOR              ADMIN
    (Celular)             (Desktop)
    
https://pedidos.tudominio.com
https://admin.tudominio.com
```

---

## 8️⃣ FLUJO DE AUTENTICACIÓN

```
VENDEDOR
┌──────────────────────────────────────────┐
│ 1. Abre PWA                              │
│ 2. Ingresa usuario y PIN                 │
│ 3. Click "INGRESAR"                      │
└──────────────────────────────────────────┘
                    ↓
            POST /api/auth/login
                    ↓
BACKEND
┌──────────────────────────────────────────┐
│ 1. Valida credenciales                   │
│ 2. Genera JWT token                      │
│ 3. Retorna token + datos usuario         │
└──────────────────────────────────────────┘
                    ↓
VENDEDOR
┌──────────────────────────────────────────┐
│ 1. Recibe token                          │
│ 2. Guarda en localStorage                │
│ 3. Accede a PWA                          │
│                                          │
│ Cada request incluye:                    │
│ Authorization: Bearer <JWT_TOKEN>        │
└──────────────────────────────────────────┘
                    ↓
BACKEND
┌──────────────────────────────────────────┐
│ 1. Valida JWT en cada request            │
│ 2. Verifica que no esté expirado         │
│ 3. Procesa request si es válido          │
│ 4. Rechaza si es inválido                │
└──────────────────────────────────────────┘
```

---

## 9️⃣ CICLO DE VIDA DEL PEDIDO

```
ESTADO: PENDIENTE (En IndexedDB del vendedor)
┌──────────────────────────────────────────┐
│ Vendedor toma pedido                     │
│ Guarda en IndexedDB                      │
│ Estado: "local"                          │
└──────────────────────────────────────────┘
                    ↓
ESTADO: SINCRONIZADO (En PostgreSQL)
┌──────────────────────────────────────────┐
│ Vendedor sincroniza                      │
│ Llega a servidor                         │
│ Guarda en pedidos_pendientes              │
│ Estado: "pendiente"                      │
└──────────────────────────────────────────┘
                    ↓
ESTADO: REVISIÓN (En tu sistema)
┌──────────────────────────────────────────┐
│ Tú ves notificación                      │
│ Revisas detalles                         │
│ Decides: Asentar, Rechazar o Editar      │
└──────────────────────────────────────────┘
                    ↓
        ┌───────────┼───────────┐
        ↓           ↓           ↓
    ASENTAR    RECHAZAR    EDITAR
        ↓           ↓           ↓
    APROBADO   RECHAZADO   EDITADO
        ↓           ↓           ↓
    Crea Order  Marca como  Guarda
    en orders   rechazado   cambios
        ↓           ↓           ↓
    FINALIZADO  FINALIZADO  PENDIENTE
                                ↓
                            (Vuelve a
                             revisión)
```

---

## 🔟 ESCALABILIDAD

```
CAPACIDAD ACTUAL (Tu internet 10 Mbps)
┌──────────────────────────────────────────┐
│ Vendedores simultáneos: 50+              │
│ Pedidos/día: 1000+                       │
│ Sincronización: <1 segundo               │
│ Usuarios en sistema: Ilimitados          │
│ Costo: $0/mes                            │
└──────────────────────────────────────────┘
                    ↓
        CRECE A 100+ VENDEDORES
                    ↓
MEJORAS NECESARIAS
┌──────────────────────────────────────────┐
│ 1. Backend en cloud (Railway, Heroku)    │
│ 2. Base de datos replicada               │
│ 3. CDN para PWA                          │
│ 4. Load balancing                        │
│ 5. Caché distribuido                     │
│                                          │
│ Costo: $50-200/mes                       │
└──────────────────────────────────────────┘
```

---

## 1️⃣1️⃣ COMPARACIÓN: ANTES vs DESPUÉS

```
ANTES (Sistema actual)
┌──────────────────────────────────────────┐
│ 1. Vendedor toma pedido en Excel         │
│ 2. Envía por WhatsApp                    │
│ 3. Tú descargas archivo                  │
│ 4. Importas en sistema                   │
│ 5. Asientas manualmente                  │
│                                          │
│ Tiempo: 30-60 minutos por lote           │
│ Errores: Altos (manual)                  │
│ Costo: Tiempo tuyo                       │
└──────────────────────────────────────────┘

DESPUÉS (Con PWA)
┌──────────────────────────────────────────┐
│ 1. Vendedor toma pedido en PWA           │
│ 2. Sincroniza automáticamente            │
│ 3. Tú recibes notificación               │
│ 4. Revisas en tu sistema                 │
│ 5. Apruebas con 1 click                  │
│                                          │
│ Tiempo: 5-10 minutos por lote            │
│ Errores: Bajos (validación automática)   │
│ Costo: $0 (Cloudflare gratis)            │
└──────────────────────────────────────────┘
```

---

## 1️⃣2️⃣ MATRIZ DE DECISIÓN

```
                    CLOUDFLARE    PORT FORWARD    VPN
HTTPS               ✅ Auto       ❌ Manual       ✅ Sí
Costo               $0            $20-30/mes     $0-5
Complejidad         Muy fácil     Difícil        Media
Seguridad           Muy alta      Media          Alta
PWA en celular      ✅ Funciona   ⚠️ Problemas   ✅ Funciona
Mantenimiento       Nulo          Manual         Manual
Escalabilidad       Excelente     Limitada       Media
Recomendación       ⭐⭐⭐⭐⭐    ⭐⭐           ⭐⭐⭐
```

¿Preguntas sobre los diagramas?
