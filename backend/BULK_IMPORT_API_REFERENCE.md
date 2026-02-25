# 📚 REFERENCIA API: IMPORTACIÓN MASIVA

## Endpoints Disponibles

### 1. Importar Referencias
```
POST /api/bulk-import/references
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "data": [
    {
      "codigo": "10210",
      "descripcion": "Camiseta Básica",
      "marca": "Premium",
      "novedad": true,
      "observaciones": "Modelo clásico"
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Importación completada: 1 exitosas, 0 fallidas",
  "results": {
    "success": 1,
    "failed": 0,
    "errors": []
  }
}
```

---

### 2. Importar Fichas de Costo
```
POST /api/bulk-import/cost-sheets
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "data": [
    {
      "referencia": "10210",
      "descripcion": "Camiseta Básica",
      "marca": "Premium",
      "totalMateriaPrima": 5000,
      "totalManoObra": 3000,
      "totalInsumosDirectos": 1000,
      "totalInsumosIndirectos": 500,
      "totalProvisiones": 200,
      "rentabilidad": 49
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Importación completada: 1 exitosas, 0 fallidas",
  "results": {
    "success": 1,
    "failed": 0,
    "errors": []
  }
}
```

---

### 3. Importar Pedidos
```
POST /api/bulk-import/orders
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "data": [
    {
      "numeroOrden": "PED-2026-001",
      "clienteId": 1,
      "fechaPedido": "2026-01-15",
      "fechaEntrega": "2026-02-01",
      "estado": "completado",
      "items": [
        {
          "referencia": "10210",
          "cantidad": 50,
          "precioUnitario": 25000
        }
      ]
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Importación completada: 1 exitosas, 0 fallidas",
  "results": {
    "success": 1,
    "failed": 0,
    "errors": []
  }
}
```

---

### 4. Importar Despachos
```
POST /api/bulk-import/dispatches
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "data": [
    {
      "numeroDespacho": "DESP-2026-001",
      "numeroOrden": "PED-2026-001",
      "fechaDespacho": "2026-02-01",
      "items": [
        {
          "referencia": "10210",
          "cantidad": 50
        }
      ]
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Importación completada: 1 exitosas, 0 fallidas",
  "results": {
    "success": 1,
    "failed": 0,
    "errors": []
  }
}
```

---

### 5. Importar Recepciones
```
POST /api/bulk-import/receptions
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "data": [
    {
      "numeroRecepcion": "REC-2026-001",
      "numeroOrdenCompra": "OC-2026-001",
      "fechaRecepcion": "2026-01-10",
      "items": [
        {
          "referencia": "10210",
          "cantidad": 500,
          "lote": "LOTE-001-2026"
        }
      ]
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Importación completada: 1 exitosas, 0 fallidas",
  "results": {
    "success": 1,
    "failed": 0,
    "errors": []
  }
}
```

---

## Códigos de Error

| Código | Mensaje | Causa |
|--------|---------|-------|
| 400 | "Se requiere un array de referencias" | Body vacío o no es array |
| 401 | Unauthorized | Token inválido o expirado |
| 403 | Forbidden | Usuario no es admin |
| 500 | "Error al importar referencias" | Error interno del servidor |

---

## Ejemplos con cURL

### Importar Referencias
```bash
curl -X POST http://localhost:3000/api/bulk-import/references \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {
        "codigo": "10210",
        "descripcion": "Camiseta Básica",
        "marca": "Premium"
      }
    ]
  }'
```

### Importar Fichas de Costo
```bash
curl -X POST http://localhost:3000/api/bulk-import/cost-sheets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {
        "referencia": "10210",
        "descripcion": "Camiseta Básica",
        "totalMateriaPrima": 5000,
        "totalManoObra": 3000,
        "rentabilidad": 49
      }
    ]
  }'
```

### Importar Pedidos
```bash
curl -X POST http://localhost:3000/api/bulk-import/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {
        "numeroOrden": "PED-2026-001",
        "clienteId": 1,
        "items": [
          {
            "referencia": "10210",
            "cantidad": 50
          }
        ]
      }
    ]
  }'
```

---

## Ejemplos con JavaScript/Fetch

```javascript
// Importar referencias
async function importReferences(data) {
  const response = await fetch('http://localhost:3000/api/bulk-import/references', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data })
  });
  return response.json();
}

// Uso
const referencias = [
  {
    codigo: '10210',
    descripcion: 'Camiseta Básica',
    marca: 'Premium'
  }
];

const result = await importReferences(referencias);
console.log(result);
```

---

## Validaciones por Tipo

### Referencias
- ✅ `codigo` (requerido, string, único)
- ✅ `descripcion` (requerido, string)
- ⚠️ `marca` (opcional, string)
- ⚠️ `novedad` (opcional, boolean)
- ⚠️ `observaciones` (opcional, string)

### Fichas de Costo
- ✅ `referencia` (requerido, debe existir)
- ✅ `descripcion` (requerido, string)
- ⚠️ `marca` (opcional, string)
- ⚠️ `totalMateriaPrima` (opcional, number)
- ⚠️ `totalManoObra` (opcional, number)
- ⚠️ `totalInsumosDirectos` (opcional, number)
- ⚠️ `totalInsumosIndirectos` (opcional, number)
- ⚠️ `totalProvisiones` (opcional, number)
- ⚠️ `rentabilidad` (opcional, number, default 49)

### Pedidos
- ✅ `numeroOrden` (requerido, string, único)
- ✅ `clienteId` (requerido, number, debe existir)
- ✅ `items` (requerido, array no vacío)
- ⚠️ `fechaPedido` (opcional, date YYYY-MM-DD)
- ⚠️ `fechaEntrega` (opcional, date YYYY-MM-DD)
- ⚠️ `estado` (opcional, string)

### Items de Pedido
- ✅ `referencia` (requerido, string)
- ✅ `cantidad` (requerido, number)
- ⚠️ `precioUnitario` (opcional, number)

### Despachos
- ✅ `numeroDespacho` (requerido, string, único)
- ✅ `numeroOrden` (requerido, debe existir)
- ✅ `items` (requerido, array no vacío)
- ⚠️ `fechaDespacho` (opcional, date YYYY-MM-DD)

### Items de Despacho
- ✅ `referencia` (requerido, string)
- ✅ `cantidad` (requerido, number)

### Recepciones
- ✅ `numeroRecepcion` (requerido, string, único)
- ✅ `numeroOrdenCompra` (requerido, string)
- ✅ `items` (requerido, array no vacío)
- ⚠️ `fechaRecepcion` (opcional, date YYYY-MM-DD)

### Items de Recepción
- ✅ `referencia` (requerido, string)
- ✅ `cantidad` (requerido, number)
- ⚠️ `lote` (opcional, string)

---

## Límites

- Máximo 1000 registros por request
- Máximo 10 MB por request
- Timeout: 30 segundos

---

## Autenticación

Todos los endpoints requieren:
1. Token JWT válido en header `Authorization: Bearer <token>`
2. Usuario debe ser admin

---

**Última actualización:** 25 de Febrero de 2026
