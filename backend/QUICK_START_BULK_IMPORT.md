# ⚡ INICIO RÁPIDO: IMPORTACIÓN MASIVA

## En 5 minutos

### 1. Preparar datos

Tienes dos opciones:

**Opción A: Usar ejemplos incluidos**
```bash
cd Prendas/backend
# Los archivos de ejemplo ya están en examples/data/
```

**Opción B: Convertir tus CSV**
```bash
node src/scripts/csvToJsonConverter.js tu-archivo.csv tu-archivo.json
```

### 2. Crear configuración

```bash
cat > migration-config.json << EOF
{
  "references": "examples/data/referencias.json",
  "costSheets": "examples/data/fichas-costo.json",
  "orders": "examples/data/pedidos.json",
  "dispatches": "examples/data/despachos.json",
  "receptions": "examples/data/recepciones.json"
}
EOF
```

### 3. Ejecutar migración

```bash
# Asegúrate que el servidor está corriendo
node src/scripts/bulkMigration.js migration-config.json
```

### 4. Ver resultados

Se genera automáticamente `migration-report-TIMESTAMP.json` con:
- ✅ Registros exitosos
- ❌ Registros fallidos
- 📊 Resumen completo

---

## Ejemplos de Datos

### Referencias (10 ejemplos)
```json
[
  {
    "codigo": "10210",
    "descripcion": "Camiseta Básica",
    "marca": "Premium",
    "novedad": true
  }
]
```

### Fichas de Costo (10 ejemplos)
```json
[
  {
    "referencia": "10210",
    "descripcion": "Camiseta Básica",
    "totalMateriaPrima": 5000,
    "totalManoObra": 3000,
    "rentabilidad": 49
  }
]
```

### Pedidos (5 ejemplos)
```json
[
  {
    "numeroOrden": "PED-2026-001",
    "clienteId": 1,
    "fechaPedido": "2026-01-15",
    "items": [
      {
        "referencia": "10210",
        "cantidad": 50,
        "precioUnitario": 25000
      }
    ]
  }
]
```

### Despachos (5 ejemplos)
```json
[
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
```

### Recepciones (5 ejemplos)
```json
[
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
```

---

## Orden Importante

**SIEMPRE seguir este orden:**

1. ✅ Referencias
2. ✅ Fichas de Costo
3. ✅ Pedidos
4. ✅ Despachos
5. ✅ Recepciones

---

## Troubleshooting

### Error: "Referencia no existe"
→ Importa referencias primero

### Error: "Cliente no existe"
→ Verifica que el cliente existe en la BD

### Error: "Orden no existe"
→ Importa pedidos antes de despachos

### Error: "Referencia ya existe"
→ Usa códigos únicos o limpia datos primero

---

## Limpiar Datos (si es necesario)

```bash
# Conectar a PostgreSQL
psql -U usuario -d inventario

# Eliminar todos los datos
DELETE FROM product_references;
DELETE FROM fichas_costo;
DELETE FROM orders;
DELETE FROM dispatches;
DELETE FROM receptions;
```

---

## Más Información

Ver `BULK_IMPORT_GUIDE.md` para documentación completa.

---

**Última actualización:** 25 de Febrero de 2026
