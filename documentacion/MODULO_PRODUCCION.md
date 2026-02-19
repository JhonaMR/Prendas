# Módulo de Seguimiento de Producción

## Descripción

El módulo de producción gestiona el seguimiento del estado de producción de las líneas de pedido. Permite asignar líneas a confeccionistas, registrar avances y cambiar estados.

---

## Características

- ✅ Asignación de líneas a confeccionistas
- ✅ Seguimiento de avance
- ✅ Cambio de estados
- ✅ Historial de cambios
- ✅ Reportes de producción

---

## Estructura de Datos

### Seguimiento de Producción
```typescript
interface ProductionTracking {
  id: string;
  orderLineId: string;       // Línea de pedido
  confeccionistaId: string;  // Confeccionista asignado
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  percentComplete: number;   // Porcentaje completado (0-100)
  startDate?: Date;          // Fecha de inicio
  endDate?: Date;            // Fecha de finalización
  notes?: string;            // Notas
  createdAt: Date;
  updatedAt: Date;
}
```

### Tabla en BD
```sql
CREATE TABLE production_tracking (
  id SERIAL PRIMARY KEY,
  order_line_id INTEGER NOT NULL REFERENCES order_lines(id),
  confeccionista_id INTEGER NOT NULL REFERENCES confeccionistas(id),
  status VARCHAR(20) DEFAULT 'pending',
  percent_complete INTEGER DEFAULT 0,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_production_confeccionista ON production_tracking(confeccionista_id);
CREATE INDEX idx_production_status ON production_tracking(status);
```

---

## Estados de Producción

```
pending (Pendiente)
  ↓
in_progress (En Progreso)
  ↓
completed (Completado)

O

on_hold (En Espera) - desde cualquier estado
```

---

## Endpoints API

### Obtener seguimiento de producción
```
GET /api/production
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "1",
      "orderLineId": "1",
      "confeccionistaId": "1",
      "status": "in_progress",
      "percentComplete": 50,
      "startDate": "2026-02-19T10:00:00Z"
    },
    ...
  ]
}
```

### Actualizar seguimiento
```
POST /api/production
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderLineId": "1",
  "confeccionistaId": "1",
  "status": "in_progress",
  "percentComplete": 50,
  "notes": "En proceso de confección"
}

Response:
{
  "success": true,
  "data": { ... }
}
```

### Guardar múltiples registros (batch)
```
POST /api/production/batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "trackingData": [
    {
      "orderLineId": "1",
      "confeccionistaId": "1",
      "status": "in_progress",
      "percentComplete": 50
    },
    {
      "orderLineId": "2",
      "confeccionistaId": "2",
      "status": "completed",
      "percentComplete": 100
    }
  ]
}

Response:
{
  "success": true,
  "message": "2 registros guardados"
}
```

---

## Validación

### Reglas de Validación

```javascript
const validateProduction = (tracking) => {
  const errors = [];
  
  // Línea requerida
  if (!tracking.orderLineId) {
    errors.push('La línea de pedido es requerida');
  }
  
  // Confeccionista requerido
  if (!tracking.confeccionistaId) {
    errors.push('El confeccionista es requerido');
  }
  
  // Porcentaje válido (0-100)
  if (tracking.percentComplete < 0 || tracking.percentComplete > 100) {
    errors.push('El porcentaje debe estar entre 0 y 100');
  }
  
  // Si status es completed, percentComplete debe ser 100
  if (tracking.status === 'completed' && tracking.percentComplete !== 100) {
    errors.push('Si está completado, el porcentaje debe ser 100');
  }
  
  return errors;
};
```

---

## Uso en Frontend

### Actualizar producción
```typescript
const handleUpdateProduction = async (trackingData) => {
  const response = await apiService.updateProductionTracking(trackingData);
  
  if (response.success) {
    showNotification('Producción actualizada');
    loadProduction();
  } else {
    showError(response.message);
  }
};
```

### Guardar múltiples registros
```typescript
const handleSaveProductionBatch = async (trackingDataArray) => {
  const response = await apiService.saveProductionBatch(trackingDataArray);
  
  if (response.success) {
    showNotification(`${trackingDataArray.length} registros guardados`);
    loadProduction();
  } else {
    showError(response.message);
  }
};
```

---

## Relaciones

### Producción → Línea de Pedido
```
Un seguimiento pertenece a una línea de pedido
Una línea puede tener un seguimiento
```

### Producción → Confeccionista
```
Un seguimiento está asignado a un confeccionista
Un confeccionista puede tener múltiples seguimientos
```

---

## Flujo de Producción

```
1. Crear Línea de Pedido
   - Se crea línea en pedido
   - Estado: pending

2. Asignar a Confeccionista
   - Se crea seguimiento
   - Se asigna confeccionista
   - Estado: pending

3. Iniciar Producción
   - Confeccionista inicia trabajo
   - Estado: in_progress
   - Se registra startDate

4. Actualizar Avance
   - Confeccionista actualiza porcentaje
   - Se registran cambios

5. Completar
   - Confeccionista termina
   - Estado: completed
   - percentComplete: 100
   - Se registra endDate

6. Listo para Despacho
   - Línea pasa a estado ready
   - Se prepara para envío
```

---

## Reportes

### Producción por Confeccionista
```sql
SELECT c.name, COUNT(pt.id) as total_lineas,
       SUM(pt.percent_complete) / COUNT(pt.id) as promedio_avance
FROM confeccionistas c
LEFT JOIN production_tracking pt ON c.id = pt.confeccionista_id
WHERE pt.status != 'completed'
GROUP BY c.id, c.name;
```

### Líneas Completadas
```sql
SELECT o.id as order_id, c.name as cliente, COUNT(pt.id) as lineas_completadas
FROM orders o
JOIN clients c ON o.client_id = c.id
JOIN order_lines ol ON o.id = ol.order_id
JOIN production_tracking pt ON ol.id = pt.order_line_id
WHERE pt.status = 'completed'
GROUP BY o.id, c.name;
```

### Líneas en Espera
```sql
SELECT ol.id, o.id as order_id, c.name as cliente, conf.name as confeccionista
FROM order_lines ol
JOIN orders o ON ol.order_id = o.id
JOIN clients c ON o.client_id = c.id
JOIN production_tracking pt ON ol.id = pt.order_line_id
JOIN confeccionistas conf ON pt.confeccionista_id = conf.id
WHERE pt.status = 'on_hold';
```

---

## Métricas

### Tiempo Promedio de Producción
```sql
SELECT c.name, 
       AVG(EXTRACT(DAY FROM (pt.end_date - pt.start_date))) as dias_promedio
FROM confeccionistas c
JOIN production_tracking pt ON c.id = pt.confeccionista_id
WHERE pt.status = 'completed' AND pt.end_date IS NOT NULL
GROUP BY c.id, c.name;
```

### Eficiencia por Confeccionista
```sql
SELECT c.name,
       COUNT(CASE WHEN pt.status = 'completed' THEN 1 END) as completadas,
       COUNT(CASE WHEN pt.status = 'on_hold' THEN 1 END) as en_espera,
       COUNT(CASE WHEN pt.status = 'in_progress' THEN 1 END) as en_progreso
FROM confeccionistas c
LEFT JOIN production_tracking pt ON c.id = pt.confeccionista_id
GROUP BY c.id, c.name;
```

---

## Troubleshooting

### Error: "Confeccionista no existe"
- Verifica que el confeccionista esté creado
- Verifica que el confeccionistaId sea válido

### Error: "Línea no existe"
- Verifica que la línea de pedido esté creada
- Verifica que el orderLineId sea válido

### Error: "Porcentaje inválido"
- El porcentaje debe estar entre 0 y 100
- Si está completado, debe ser 100

---

## Próximos Pasos

1. Agregar notificaciones de cambio de estado
2. Implementar alertas de retrasos
3. Agregar gráficos de progreso
4. Implementar predicción de finalización
5. Agregar historial detallado de cambios

---

## Referencias

- PostgreSQL: https://www.postgresql.org/docs/
- Express CRUD: https://expressjs.com/en/guide/routing.html
