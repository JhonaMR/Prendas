# Módulo de Gestión de Vendedores

## Descripción

El módulo de vendedores gestiona el catálogo de vendedores de la empresa. Permite crear, actualizar, eliminar y consultar información de vendedores, incluyendo sus clientes asignados y métricas de desempeño.

---

## Características

- ✅ CRUD completo de vendedores
- ✅ Asignación de clientes
- ✅ Métricas de desempeño
- ✅ Comisiones
- ✅ Historial de ventas

---

## Estructura de Datos

### Vendedor
```typescript
interface Seller {
  id: string;
  name: string;              // Nombre del vendedor
  email?: string;            // Email
  phone?: string;            // Teléfono
  commission: number;        // Porcentaje de comisión
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}
```

### Tabla en BD
```sql
CREATE TABLE sellers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  commission DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sellers_status ON sellers(status);
```

---

## Endpoints API

### Obtener todos los vendedores
```
GET /api/sellers
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Vendedor A",
      "email": "vendedor@example.com",
      "phone": "3001234567",
      "commission": 5.5,
      "status": "active"
    },
    ...
  ]
}
```

### Crear vendedor
```
POST /api/sellers
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nuevo Vendedor",
  "email": "nuevo@example.com",
  "phone": "3009876543",
  "commission": 5.5
}

Response:
{
  "success": true,
  "data": { ... }
}
```

### Actualizar vendedor
```
PUT /api/sellers/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Vendedor Actualizado",
  "commission": 6.0
}

Response:
{
  "success": true,
  "data": { ... }
}
```

### Eliminar vendedor
```
DELETE /api/sellers/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Vendedor eliminado"
}
```

---

## Validación

### Reglas de Validación

```javascript
const validateSeller = (seller) => {
  const errors = [];
  
  // Nombre requerido
  if (!seller.name || seller.name.trim() === '') {
    errors.push('El nombre es requerido');
  }
  
  // Comisión válida (0-100)
  if (seller.commission < 0 || seller.commission > 100) {
    errors.push('La comisión debe estar entre 0 y 100');
  }
  
  // Email válido (opcional)
  if (seller.email && !isValidEmail(seller.email)) {
    errors.push('Email inválido');
  }
  
  return errors;
};
```

---

## Uso en Frontend

### Obtener vendedores
```typescript
const loadSellers = async () => {
  const sellers = await apiService.getSellers();
  setSellers(sellers);
};
```

### Crear vendedor
```typescript
const handleCreateSeller = async (formData) => {
  const response = await apiService.createSeller(formData);
  
  if (response.success) {
    loadSellers();
    showNotification('Vendedor creado');
  } else {
    showError(response.message);
  }
};
```

---

## Relaciones

### Vendedor → Clientes
```
Un vendedor puede tener múltiples clientes
Un cliente está asignado a un vendedor
```

### Vendedor → Pedidos
```
Un vendedor puede tener múltiples pedidos (a través de clientes)
Un pedido pertenece a un cliente de un vendedor
```

---

## Métricas

### Clientes por Vendedor
```sql
SELECT s.id, s.name, COUNT(c.id) as total_clientes
FROM sellers s
LEFT JOIN clients c ON s.id = c.seller_id
WHERE s.status = 'active'
GROUP BY s.id, s.name;
```

### Ventas por Vendedor
```sql
SELECT s.id, s.name, SUM(o.total) as total_ventas
FROM sellers s
LEFT JOIN clients c ON s.id = c.seller_id
LEFT JOIN orders o ON c.id = o.client_id
WHERE s.status = 'active'
GROUP BY s.id, s.name;
```

### Comisión por Vendedor
```sql
SELECT s.id, s.name, s.commission,
       SUM(o.total) * (s.commission / 100) as comision_total
FROM sellers s
LEFT JOIN clients c ON s.id = c.seller_id
LEFT JOIN orders o ON c.id = o.client_id
WHERE s.status = 'active'
GROUP BY s.id, s.name, s.commission;
```

---

## Casos de Uso

### 1. Crear nuevo vendedor
1. Admin ingresa datos del vendedor
2. Sistema valida datos
3. Sistema crea vendedor en BD
4. Vendedor aparece en lista

### 2. Asignar cliente a vendedor
1. Admin selecciona cliente
2. Admin selecciona vendedor
3. Sistema actualiza cliente
4. Cliente aparece en lista del vendedor

### 3. Calcular comisión
1. Sistema obtiene todos los pedidos del vendedor
2. Sistema suma total de ventas
3. Sistema calcula comisión (total * porcentaje)
4. Sistema genera reporte de comisión

---

## Troubleshooting

### Error: "Comisión inválida"
- La comisión debe estar entre 0 y 100
- Verifica que sea un número válido

### Error: "Email inválido"
- El email debe tener formato válido
- Ejemplo: vendedor@example.com

---

## Próximos Pasos

1. Agregar historial de comisiones
2. Implementar bonificaciones
3. Agregar reportes de desempeño
4. Implementar metas de ventas

---

## Referencias

- PostgreSQL: https://www.postgresql.org/docs/
- Express CRUD: https://expressjs.com/en/guide/routing.html
