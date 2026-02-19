# Módulo de Gestión de Clientes

## Descripción

El módulo de clientes gestiona el catálogo de clientes de la empresa. Permite crear, actualizar, eliminar y consultar información de clientes, incluyendo su asociación con vendedores.

---

## Características

- ✅ CRUD completo de clientes
- ✅ Asociación con vendedores
- ✅ Validación de datos
- ✅ Búsqueda y filtrado
- ✅ Historial de cambios

---

## Estructura de Archivos

```
backend/src/
├── controllers/entities/clients/
│   ├── clientsController.js       # Controlador
│   ├── clientsService.js          # Lógica de negocio
│   └── clientsValidator.js        # Validación
└── routes/
    └── clients.js                 # Rutas

frontend/src/
├── pages/
│   └── Clients.tsx                # Página de clientes
└── services/
    └── api.ts                     # Métodos de API
```

---

## Estructura de Datos

### Cliente
```typescript
interface Client {
  id: string;
  name: string;              // Nombre del cliente
  nit: string;               // NIT (identificación)
  address: string;           // Dirección
  city: string;              // Ciudad
  sellerId: string;          // ID del vendedor asignado
  phone?: string;            // Teléfono
  email?: string;            // Email
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}
```

### Tabla en BD
```sql
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  nit VARCHAR(50) UNIQUE NOT NULL,
  address VARCHAR(500),
  city VARCHAR(100),
  seller_id INTEGER REFERENCES sellers(id),
  phone VARCHAR(20),
  email VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clients_seller_id ON clients(seller_id);
CREATE INDEX idx_clients_nit ON clients(nit);
```

---

## Endpoints API

### Obtener todos los clientes
```
GET /api/clients
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Cliente A",
      "nit": "123456789",
      "address": "Calle 1 #123",
      "city": "Bogotá",
      "sellerId": "1"
    },
    ...
  ]
}
```

### Obtener cliente por ID
```
GET /api/clients/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Cliente A",
    "nit": "123456789",
    "address": "Calle 1 #123",
    "city": "Bogotá",
    "sellerId": "1"
  }
}
```

### Crear cliente
```
POST /api/clients
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nuevo Cliente",
  "nit": "987654321",
  "address": "Calle 2 #456",
  "city": "Medellín",
  "sellerId": "1"
}

Response:
{
  "success": true,
  "data": {
    "id": "2",
    "name": "Nuevo Cliente",
    "nit": "987654321",
    "address": "Calle 2 #456",
    "city": "Medellín",
    "sellerId": "1"
  }
}
```

### Actualizar cliente
```
PUT /api/clients/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Cliente Actualizado",
  "city": "Cali"
}

Response:
{
  "success": true,
  "data": { ... }
}
```

### Eliminar cliente
```
DELETE /api/clients/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Cliente eliminado"
}
```

---

## Validación

### Reglas de Validación

```javascript
const validateClient = (client) => {
  const errors = [];
  
  // Nombre requerido
  if (!client.name || client.name.trim() === '') {
    errors.push('El nombre es requerido');
  }
  
  // NIT requerido y único
  if (!client.nit || client.nit.trim() === '') {
    errors.push('El NIT es requerido');
  }
  
  // Dirección requerida
  if (!client.address || client.address.trim() === '') {
    errors.push('La dirección es requerida');
  }
  
  // Ciudad requerida
  if (!client.city || client.city.trim() === '') {
    errors.push('La ciudad es requerida');
  }
  
  // Vendedor debe existir
  if (client.sellerId && !sellerExists(client.sellerId)) {
    errors.push('El vendedor no existe');
  }
  
  return errors;
};
```

---

## Uso en Frontend

### Obtener clientes
```typescript
import { apiService } from '@/services/api';

const loadClients = async () => {
  const clients = await apiService.getClients();
  setClients(clients);
};
```

### Crear cliente
```typescript
const handleCreateClient = async (formData) => {
  const response = await apiService.createClient(formData);
  
  if (response.success) {
    // Recargar lista
    loadClients();
    // Mostrar éxito
    showNotification('Cliente creado');
  } else {
    showError(response.message);
  }
};
```

### Actualizar cliente
```typescript
const handleUpdateClient = async (id, formData) => {
  const response = await apiService.updateClient(id, formData);
  
  if (response.success) {
    loadClients();
    showNotification('Cliente actualizado');
  } else {
    showError(response.message);
  }
};
```

### Eliminar cliente
```typescript
const handleDeleteClient = async (id) => {
  if (confirm('¿Estás seguro?')) {
    const response = await apiService.deleteClient(id);
    
    if (response.success) {
      loadClients();
      showNotification('Cliente eliminado');
    } else {
      showError(response.message);
    }
  }
};
```

---

## Uso en Backend

### Controlador
```javascript
// controllers/entities/clients/clientsController.js

const getClients = async (req, res) => {
  try {
    const clients = await clientsService.getAll();
    res.json({
      success: true,
      data: clients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createClient = async (req, res) => {
  try {
    const { name, nit, address, city, sellerId } = req.body;
    
    // Validar
    const errors = clientsValidator.validate({ name, nit, address, city, sellerId });
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0]
      });
    }
    
    // Crear
    const client = await clientsService.create({
      name, nit, address, city, sellerId
    });
    
    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

### Servicio
```javascript
// controllers/entities/clients/clientsService.js

const getAll = async () => {
  const query = `
    SELECT c.*, s.name as seller_name
    FROM clients c
    LEFT JOIN sellers s ON c.seller_id = s.id
    WHERE c.status = 'active'
    ORDER BY c.name
  `;
  
  const result = await pool.query(query);
  return result.rows;
};

const create = async (clientData) => {
  const { name, nit, address, city, sellerId } = clientData;
  
  const query = `
    INSERT INTO clients (name, nit, address, city, seller_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  
  const result = await pool.query(query, [name, nit, address, city, sellerId]);
  return result.rows[0];
};
```

---

## Relaciones

### Cliente → Vendedor
```
Un cliente está asignado a un vendedor
Un vendedor puede tener múltiples clientes
```

### Cliente → Pedidos
```
Un cliente puede tener múltiples pedidos
Un pedido pertenece a un cliente
```

### Cliente → Despachos
```
Un cliente recibe múltiples despachos
Un despacho es para un cliente
```

---

## Casos de Uso

### 1. Crear nuevo cliente
1. Vendedor ingresa datos del cliente
2. Sistema valida datos
3. Sistema crea cliente en BD
4. Sistema asigna vendedor
5. Cliente aparece en lista

### 2. Actualizar información de cliente
1. Vendedor selecciona cliente
2. Vendedor modifica datos
3. Sistema valida cambios
4. Sistema actualiza BD
5. Cambios se reflejan en lista

### 3. Eliminar cliente
1. Admin selecciona cliente
2. Admin confirma eliminación
3. Sistema marca cliente como inactivo
4. Cliente desaparece de lista activa

---

## Reportes

### Clientes por Vendedor
```sql
SELECT s.name as vendedor, COUNT(c.id) as total_clientes
FROM sellers s
LEFT JOIN clients c ON s.id = c.seller_id
GROUP BY s.id, s.name
ORDER BY total_clientes DESC;
```

### Clientes por Ciudad
```sql
SELECT city, COUNT(*) as total
FROM clients
WHERE status = 'active'
GROUP BY city
ORDER BY total DESC;
```

---

## Troubleshooting

### Error: "NIT ya existe"
- El NIT debe ser único
- Verifica que no haya otro cliente con el mismo NIT

### Error: "Vendedor no existe"
- El vendedor debe estar creado en el sistema
- Verifica que el sellerId sea válido

### Error: "Datos incompletos"
- Todos los campos requeridos deben estar completos
- Verifica que no haya campos vacíos

---

## Próximos Pasos

1. Agregar búsqueda avanzada
2. Implementar paginación
3. Agregar filtros por vendedor
4. Implementar importación masiva desde CSV
5. Agregar historial de cambios

---

## Referencias

- PostgreSQL: https://www.postgresql.org/docs/
- Express CRUD: https://expressjs.com/en/guide/routing.html
