# Módulo de Gestión de Pedidos

## Descripción

El módulo de pedidos gestiona la creación, seguimiento y gestión de pedidos de clientes. Incluye detalles de líneas de pedido, estados y seguimiento de producción.

---

## Características

- ✅ Creación de pedidos
- ✅ Detalles de líneas
- ✅ Estados de pedido
- ✅ Seguimiento de producción
- ✅ Historial de cambios

---

## Estructura de Datos

### Pedido
```typescript
interface Order {
  id: string;
  clientId: string;          // Cliente que hace el pedido
  orderDate: Date;           // Fecha del pedido
  deliveryDate: Date;        // Fecha de entrega esperada
  status: 'pending' | 'in_production' | 'ready' | 'delivered' | 'cancelled';
  total: number;             // Total del pedido
  notes?: string;            // Notas adicionales
  createdAt: Date;
  updatedAt: Date;
}

interface OrderLine {
  id: string;
  orderId: string;           // Pedido al que pertenece
  referenceId: string;       // Referencia del producto
  quantity: number;          // Cantidad
  unitPrice: number;         // Precio unitario
  total: number;             // Total de la línea
  status: 'pending' | 'in_production' | 'ready' | 'delivered';
  confeccionistaId?: string; // Confeccionista asignado
  createdAt: Date;
  updatedAt: Date;
}
```

### Tablas en BD
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivery_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',
  total DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_lines (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  reference_id INTEGER NOT NULL REFERENCES references(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2),
  total DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending',
  confeccionista_id INTEGER REFERENCES confeccionistas(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_lines_order_id ON order_lines(order_id);
CREATE INDEX idx_order_lines_status ON order_lines(status);
```

---

## Estados de Pedido

```
pending (Pendiente)
  ↓
in_production (En Producción)
  ↓
ready (Listo)
  ↓
delivered (Entregado)

O

cancelled (Cancelado) - desde cualquier estado
```

---

## Endpoints API

### Obtener todos los pedidos
```
GET /api/orders
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "1",
      "clientId": "1",
      "orderDate": "2026-02-19T10:00:00Z",
      "deliveryDate": "2026-02-26T10:00:00Z",
      "status": "in_production",
      "total": 5000000,
      "notes": "Pedido urgente"
    },
    ...
  ]
}
```

### Crear pedido
```
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "clientId": "1",
  "deliveryDate": "2026-02-26T10:00:00Z",
  "notes": "Pedido urgente",
  "lines": [
    {
      "referenceId": "1",
      "quantity": 10,
      "unitPrice": 50000
    },
    {
      "referenceId": "2",
      "quantity": 5,
      "unitPrice": 75000
    }
  ]
}

Response:
{
  "success": true,
  "data": {
    "id": "1",
    "clientId": "1",
    "status": "pending",
    "total": 875000,
    "lines": [ ... ]
  }
}
```

### Actualizar estado de pedido
```
PUT /api/orders/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "in_production"
}

Response:
{
  "success": true,
  "data": { ... }
}
```

### Obtener detalles de pedido
```
GET /api/orders/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": "1",
    "client": { ... },
    "lines": [
      {
        "id": "1",
        "reference": { ... },
        "quantity": 10,
        "unitPrice": 50000,
        "total": 500000,
        "status": "in_production",
        "confeccionista": { ... }
      },
      ...
    ],
    "total": 875000,
    "status": "in_production"
  }
}
```

---

## Validación

### Reglas de Validación

```javascript
const validateOrder = (order) => {
  const errors = [];
  
  // Cliente requerido
  if (!order.clientId) {
    errors.push('El cliente es requerido');
  }
  
  // Líneas requeridas
  if (!order.lines || order.lines.length === 0) {
    errors.push('El pedido debe tener al menos una línea');
  }
  
  // Validar cada línea
  order.lines.forEach((line, index) => {
    if (!line.referenceId) {
      errors.push(`Línea ${index + 1}: Referencia requerida`);
    }
    if (line.quantity <= 0) {
      errors.push(`Línea ${index + 1}: Cantidad debe ser mayor a 0`);
    }
    if (line.unitPrice <= 0) {
      errors.push(`Línea ${index + 1}: Precio debe ser mayor a 0`);
    }
  });
  
  return errors;
};
```

---

## Uso en Frontend

### Crear pedido
```typescript
const handleCreateOrder = async (formData) => {
  const response = await apiService.createOrder(formData);
  
  if (response.success) {
    showNotification('Pedido creado');
    navigate(`/orders/${response.data.id}`);
  } else {
    showError(response.message);
  }
};
```

### Actualizar estado
```typescript
const handleUpdateStatus = async (orderId, newStatus) => {
  const response = await apiService.updateOrder(orderId, {
    status: newStatus
  });
  
  if (response.success) {
    loadOrder(orderId);
    showNotification('Estado actualizado');
  } else {
    showError(response.message);
  }
};
```

---

## Relaciones

### Pedido → Cliente
```
Un pedido pertenece a un cliente
Un cliente puede tener múltiples pedidos
```

### Pedido → Líneas
```
Un pedido tiene múltiples líneas
Una línea pertenece a un pedido
```

### Línea → Referencia
```
Una línea contiene una referencia (producto)
Una referencia puede estar en múltiples líneas
```

### Línea → Confeccionista
```
Una línea puede asignarse a un confeccionista
Un confeccionista puede tener múltiples líneas
```

### Pedido → Despacho
```
Un pedido puede generar múltiples despachos
Un despacho contiene líneas de uno o más pedidos
```

---

## Flujo de Pedido

```
1. Crear Pedido
   - Cliente hace pedido
   - Se crean líneas de pedido
   - Estado: pending

2. Asignar a Confeccionistas
   - Cada línea se asigna a un confeccionista
   - Estado línea: pending

3. Producción
   - Confeccionista produce
   - Estado línea: in_production

4. Listo
   - Confeccionista termina
   - Estado línea: ready

5. Despacho
   - Se crea despacho
   - Se asigna a correría
   - Estado línea: delivered

6. Entregado
   - Cliente recibe
   - Estado pedido: delivered
```

---

## Reportes

### Pedidos por Estado
```sql
SELECT status, COUNT(*) as total
FROM orders
GROUP BY status;
```

### Pedidos por Cliente
```sql
SELECT c.name, COUNT(o.id) as total_pedidos, SUM(o.total) as total_ventas
FROM clients c
LEFT JOIN orders o ON c.id = o.client_id
GROUP BY c.id, c.name
ORDER BY total_ventas DESC;
```

### Pedidos Vencidos
```sql
SELECT o.id, c.name, o.delivery_date, o.status
FROM orders o
JOIN clients c ON o.client_id = c.id
WHERE o.delivery_date < NOW() AND o.status != 'delivered';
```

---

## Troubleshooting

### Error: "Cliente no existe"
- Verifica que el cliente esté creado
- Verifica que el clientId sea válido

### Error: "Referencia no existe"
- Verifica que la referencia esté creada
- Verifica que el referenceId sea válido

### Error: "Cantidad inválida"
- La cantidad debe ser mayor a 0
- Verifica que sea un número entero

---

## Próximos Pasos

1. Agregar búsqueda avanzada
2. Implementar paginación
3. Agregar filtros por estado
4. Implementar generación de PDF
5. Agregar notificaciones de cambio de estado

---

## Referencias

- PostgreSQL: https://www.postgresql.org/docs/
- Express CRUD: https://expressjs.com/en/guide/routing.html
