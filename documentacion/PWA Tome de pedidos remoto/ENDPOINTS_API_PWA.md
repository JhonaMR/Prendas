# 🔌 ENDPOINTS API - PWA VENDEDORES

## 📋 ÍNDICE
1. [Autenticación](#autenticación)
2. [Pedidos Pendientes](#pedidos-pendientes)
3. [Datos Maestros](#datos-maestros)
4. [Ejemplos de Requests](#ejemplos-de-requests)

---

## 🔐 AUTENTICACIÓN

### Login
```
POST /api/auth/login
Content-Type: application/json

Request:
{
  "loginCode": "vendedor_001",
  "pin": "1234"
}

Response (200):
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "loginCode": "vendedor_001",
    "nombre": "Juan Pérez",
    "rol": "vendedor"
  }
}

Response (401):
{
  "success": false,
  "message": "Credenciales inválidas"
}
```

**Nota:** Este endpoint ya existe en tu sistema. PWA lo reutiliza.

---

## 📦 PEDIDOS PENDIENTES

### 1. Crear Pedido Individual
```
POST /api/pedidos-pendientes
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Request:
{
  "clienteId": "cliente_123",
  "correriaId": "correria_456",
  "items": [
    {
      "referencia": "10210",
      "cantidad": 50,
      "precio": 30900
    },
    {
      "referencia": "10211",
      "cantidad": 30,
      "precio": 28900
    }
  ],
  "fechaInicioDespacho": "2024-03-15",
  "fechaFinDespacho": "2024-03-20",
  "observaciones": "Urgente, cliente importante"
}

Response (201):
{
  "success": true,
  "message": "Pedido creado",
  "id": "pedido_uuid_1234",
  "estado": "pendiente"
}

Response (400):
{
  "success": false,
  "message": "Datos inválidos",
  "errors": [
    "Cliente no existe",
    "Referencia 10210 no existe"
  ]
}
```

### 2. Crear Batch de Pedidos (Sincronización)
```
POST /api/pedidos-pendientes/batch
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Request:
{
  "pedidos": [
    {
      "clienteId": "cliente_123",
      "correriaId": "correria_456",
      "items": [
        {
          "referencia": "10210",
          "cantidad": 50,
          "precio": 30900
        }
      ],
      "fechaInicioDespacho": "2024-03-15",
      "fechaFinDespacho": "2024-03-20",
      "observaciones": "Urgente"
    },
    {
      "clienteId": "cliente_789",
      "correriaId": "correria_456",
      "items": [
        {
          "referencia": "10220",
          "cantidad": 100,
          "precio": 25000
        }
      ],
      "fechaInicioDespacho": "2024-03-16",
      "fechaFinDespacho": "2024-03-21",
      "observaciones": ""
    }
  ]
}

Response (200):
{
  "success": true,
  "message": "2 pedidos recibidos",
  "ids": [
    "pedido_uuid_1234",
    "pedido_uuid_5678"
  ],
  "timestamp": "2024-03-02T13:05:00Z"
}

Response (400):
{
  "success": false,
  "message": "Error procesando batch",
  "errors": [
    "Pedido 1: Cliente no existe",
    "Pedido 2: Referencia 10220 no existe"
  ]
}
```

### 3. Listar Pedidos Pendientes (Para Admin)
```
GET /api/pedidos-pendientes?estado=pendiente&limit=50&offset=0
Authorization: Bearer <JWT_TOKEN>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "pedido_uuid_1234",
      "vendedor": {
        "id": "user_123",
        "nombre": "Juan Pérez",
        "loginCode": "vendedor_001"
      },
      "cliente": {
        "id": "cliente_123",
        "nombre": "Almacén La 14",
        "ciudad": "Medellín"
      },
      "correria": {
        "id": "correria_456",
        "nombre": "Verano 2024"
      },
      "items": [
        {
          "referencia": "10210",
          "nombre": "Camiseta Básica",
          "cantidad": 50,
          "precio": 30900,
          "subtotal": 1545000
        }
      ],
      "total": 1545000,
      "fechaInicioDespacho": "2024-03-15",
      "fechaFinDespacho": "2024-03-20",
      "observaciones": "Urgente",
      "estado": "pendiente",
      "createdAt": "2024-03-02T13:05:00Z",
      "sincronizadoEn": "2024-03-02T13:05:30Z"
    }
  ],
  "total": 3,
  "limit": 50,
  "offset": 0
}
```

### 4. Obtener Detalle de Pedido Pendiente
```
GET /api/pedidos-pendientes/:id
Authorization: Bearer <JWT_TOKEN>

Response (200):
{
  "success": true,
  "data": {
    "id": "pedido_uuid_1234",
    "vendedor": { ... },
    "cliente": { ... },
    "correria": { ... },
    "items": [ ... ],
    "total": 1545000,
    "fechaInicioDespacho": "2024-03-15",
    "fechaFinDespacho": "2024-03-20",
    "observaciones": "Urgente",
    "estado": "pendiente",
    "createdAt": "2024-03-02T13:05:00Z"
  }
}

Response (404):
{
  "success": false,
  "message": "Pedido no encontrado"
}
```

### 5. Asentar Pedido (Crear Order)
```
POST /api/pedidos-pendientes/:id/asentar
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Request:
{
  "observacionesAsentamiento": "Revisado y aprobado"
}

Response (200):
{
  "success": true,
  "message": "Pedido asentado",
  "orderId": "order_uuid_9999",
  "pedidoPendienteId": "pedido_uuid_1234",
  "estado": "aprobado"
}

Response (400):
{
  "success": false,
  "message": "No se puede asentar este pedido",
  "reason": "Ya fue asentado"
}
```

### 6. Rechazar Pedido
```
POST /api/pedidos-pendientes/:id/rechazar
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Request:
{
  "razon": "Cliente no tiene crédito disponible"
}

Response (200):
{
  "success": true,
  "message": "Pedido rechazado",
  "pedidoPendienteId": "pedido_uuid_1234",
  "estado": "rechazado"
}
```

### 7. Editar Pedido Pendiente
```
PUT /api/pedidos-pendientes/:id
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Request:
{
  "items": [
    {
      "referencia": "10210",
      "cantidad": 40,  // Cambió de 50 a 40
      "precio": 30900
    }
  ],
  "observaciones": "Cantidad reducida por disponibilidad"
}

Response (200):
{
  "success": true,
  "message": "Pedido actualizado",
  "data": { ... }
}
```

---

## 📊 DATOS MAESTROS

### 1. Listar Clientes (Para PWA)
```
GET /api/clientes?limit=100
Authorization: Bearer <JWT_TOKEN>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "cliente_123",
      "nombre": "Almacén La 14",
      "ciudad": "Medellín",
      "contacto": "Juan García",
      "telefono": "3001234567"
    },
    {
      "id": "cliente_789",
      "nombre": "Almacén 20",
      "ciudad": "Bogotá",
      "contacto": "María López",
      "telefono": "3109876543"
    }
  ],
  "total": 45
}
```

### 2. Listar Correría (Para PWA)
```
GET /api/correrias?activas=true
Authorization: Bearer <JWT_TOKEN>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "correria_456",
      "nombre": "Verano 2024",
      "estado": "activa",
      "fechaInicio": "2024-03-01",
      "fechaFin": "2024-03-31"
    },
    {
      "id": "correria_789",
      "nombre": "Primavera 2024",
      "estado": "activa",
      "fechaInicio": "2024-04-01",
      "fechaFin": "2024-04-30"
    }
  ]
}
```

### 3. Listar Referencias (Para PWA)
```
GET /api/referencias?limit=500
Authorization: Bearer <JWT_TOKEN>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "ref_10210",
      "codigo": "10210",
      "nombre": "Camiseta Básica",
      "descripcion": "Camiseta 100% algodón",
      "precioBase": 25000,
      "precioVenta": 30900,
      "stock": 500
    },
    {
      "id": "ref_10211",
      "codigo": "10211",
      "nombre": "Camiseta Premium",
      "descripcion": "Camiseta 100% algodón premium",
      "precioBase": 28000,
      "precioVenta": 28900,
      "stock": 300
    }
  ],
  "total": 245
}
```

---

## 📝 EJEMPLOS DE REQUESTS

### Ejemplo 1: Vendedor toma pedido (online)

```javascript
// PWA Frontend
const tomarPedido = async (formData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    'https://pedidos.tudominio.com/api/pedidos-pendientes',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        clienteId: formData.cliente.id,
        correriaId: formData.correria.id,
        items: formData.items,
        fechaInicioDespacho: formData.fechaInicio,
        fechaFinDespacho: formData.fechaFin,
        observaciones: formData.observaciones
      })
    }
  );
  
  const result = await response.json();
  
  if (result.success) {
    // Mostrar: "✅ Pedido guardado"
    showNotification('Pedido guardado exitosamente');
  } else {
    // Mostrar errores
    showError(result.errors);
  }
};
```

### Ejemplo 2: Sincronización batch (offline → online)

```javascript
// PWA Service Worker
const sincronizarPedidos = async () => {
  // 1. Obtener pedidos no sincronizados de IndexedDB
  const pedidosLocales = await db.getAll('pedidos', 
    { sincronizado: false }
  );
  
  if (pedidosLocales.length === 0) {
    return { success: true, enviados: 0 };
  }
  
  // 2. Preparar batch
  const batch = {
    pedidos: pedidosLocales.map(p => ({
      clienteId: p.clienteId,
      correriaId: p.correriaId,
      items: p.items,
      fechaInicioDespacho: p.fechaInicio,
      fechaFinDespacho: p.fechaFin,
      observaciones: p.observaciones
    }))
  };
  
  // 3. Enviar a servidor
  try {
    const response = await fetch(
      'https://pedidos.tudominio.com/api/pedidos-pendientes/batch',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(batch)
      }
    );
    
    const result = await response.json();
    
    if (result.success) {
      // 4. Marcar como sincronizados
      for (const id of result.ids) {
        await db.update('pedidos', id, { 
          sincronizado: true,
          sincronizadoEn: new Date().toISOString()
        });
      }
      
      // 5. Notificar
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_SUCCESS',
            count: result.ids.length
          });
        });
      });
      
      return { success: true, enviados: result.ids.length };
    }
  } catch (error) {
    console.error('Error sincronizando:', error);
    return { success: false, error };
  }
};
```

### Ejemplo 3: Admin revisa y asiente

```javascript
// Tu sistema frontend
const asentarPedido = async (pedidoId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `https://admin.tudominio.com/api/pedidos-pendientes/${pedidoId}/asentar`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        observacionesAsentamiento: 'Revisado y aprobado'
      })
    }
  );
  
  const result = await response.json();
  
  if (result.success) {
    // Actualizar UI
    setPedidosPendientes(prev => 
      prev.filter(p => p.id !== pedidoId)
    );
    
    // Mostrar confirmación
    showNotification(`Pedido asentado como Order #${result.orderId}`);
    
    // Actualizar badge
    actualizarBadge();
  }
};
```

---

## 🔄 FLUJO DE DATOS COMPLETO

```
VENDEDOR (PWA)
    ↓
POST /api/pedidos-pendientes/batch
    ↓
BACKEND
    ├─ Valida JWT
    ├─ Valida datos
    ├─ Guarda en PostgreSQL (pedidos_pendientes)
    ├─ Emite evento WebSocket
    └─ Retorna 200 OK
    ↓
ADMIN (Tu sistema)
    ├─ Recibe evento WebSocket
    ├─ Actualiza badge
    ├─ Muestra notificación
    └─ Puede revisar
    ↓
ADMIN CLICK "ASENTAR"
    ↓
POST /api/pedidos-pendientes/:id/asentar
    ↓
BACKEND
    ├─ Crea Order en tabla orders
    ├─ Crea OrderItems
    ├─ Marca pedido_pendiente como "aprobado"
    ├─ Emite evento WebSocket
    └─ Retorna 200 OK
    ↓
ADMIN (Tu sistema)
    ├─ Recibe confirmación
    ├─ Actualiza badge
    └─ Muestra: "✅ Pedido asentado"
```

---

## ⚠️ CÓDIGOS DE ERROR

```
200 OK
  Operación exitosa

201 Created
  Recurso creado exitosamente

400 Bad Request
  Datos inválidos o incompletos

401 Unauthorized
  JWT inválido o expirado

403 Forbidden
  No tienes permisos para esta acción

404 Not Found
  Recurso no encontrado

409 Conflict
  Pedido ya fue asentado/rechazado

500 Internal Server Error
  Error en el servidor
```

---

## 🔐 HEADERS REQUERIDOS

```
Todos los requests (excepto login) requieren:

Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Ejemplo:
GET /api/pedidos-pendientes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## 📊 PAGINACIÓN

```
GET /api/pedidos-pendientes?limit=50&offset=0

Parámetros:
- limit: Cantidad de registros (default: 50, máximo: 100)
- offset: Desde qué registro (default: 0)

Response:
{
  "data": [ ... ],
  "total": 150,
  "limit": 50,
  "offset": 0,
  "hasMore": true
}
```

---

## 🔍 FILTROS

```
GET /api/pedidos-pendientes?estado=pendiente&vendedor=vendedor_001&desde=2024-03-01&hasta=2024-03-31

Parámetros:
- estado: pendiente, aprobado, rechazado
- vendedor: login_code del vendedor
- desde: Fecha inicio (YYYY-MM-DD)
- hasta: Fecha fin (YYYY-MM-DD)
- cliente: ID del cliente
```

---

## 📈 RATE LIMITING

```
Para evitar abuso:

- 100 requests/minuto por usuario
- 1000 requests/minuto por IP

Si excedes:
  429 Too Many Requests
  Retry-After: 60 (segundos)
```

¿Preguntas sobre los endpoints?
