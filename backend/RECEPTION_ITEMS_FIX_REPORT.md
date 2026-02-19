# 📋 Reporte de Corrección: reception_items Sequence

## Problema Identificado

El usuario recibía el error:
```
el valor nulo en la columna «id» de la relación «reception_items» 
viola la restricción not-null
```

### Causa Raíz

La tabla `reception_items` tenía la columna `id` definida como `SERIAL PRIMARY KEY`, pero **no tenía la secuencia configurada correctamente**. Esto causaba que los inserts fallaran porque no había un valor por defecto para auto-generar el id.

## Diagnóstico Realizado

Se ejecutó el script `backend/src/scripts/fixReceptionItemsSequence.js` que reveló:

### Estado Inicial
```
📋 Estructura de reception_items:
  • id: integer (default: NONE, nullable: NO)  ❌ SIN DEFAULT
  • reception_id: character varying (default: NONE, nullable: NO)
  • reference: character varying (default: NONE, nullable: NO)
  • quantity: integer (default: NONE, nullable: NO)

❌ No hay secuencias para reception_items
```

## Correcciones Aplicadas

Se ejecutaron los siguientes comandos SQL:

### 1. Crear la Secuencia
```sql
CREATE SEQUENCE IF NOT EXISTS reception_items_id_seq
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;
```

### 2. Configurar el Default en la Columna id
```sql
ALTER TABLE reception_items
ALTER COLUMN id SET DEFAULT nextval('reception_items_id_seq');
```

### 3. Vincular la Secuencia a la Tabla
```sql
ALTER SEQUENCE reception_items_id_seq OWNED BY reception_items.id;
```

## Estado Final

```
✅ Estructura final de reception_items:
  ✅ id: integer (default: nextval('reception_items_id_seq'::regclass), nullable: NO)
     reception_id: character varying (default: NONE, nullable: NO)
     reference: character varying (default: NONE, nullable: NO)
     quantity: integer (default: NONE, nullable: NO)

✅ Secuencias configuradas:
  ✅ reception_items_id_seq
```

## Verificación

Ahora el código en `ReceptionService.js` funciona correctamente:

```javascript
// Este INSERT ahora funciona sin especificar el id
await client.query(
    `INSERT INTO reception_items (reception_id, reference, quantity)
    VALUES ($1, $2, $3)`,
    [receptionData.id, item.reference, item.quantity]
);
```

El id se auto-genera automáticamente usando la secuencia.

## Cómo Ejecutar la Corrección

Si necesitas aplicar esta corrección nuevamente en otra base de datos:

```bash
node backend/src/scripts/fixReceptionItemsSequence.js
```

El script:
1. Verifica si la tabla existe
2. Diagnostica el estado actual
3. Crea la secuencia si no existe
4. Configura el default
5. Vincula la secuencia
6. Verifica la configuración final

## Notas Importantes

- ✅ La corrección se aplicó exitosamente
- ✅ No se perdieron datos existentes
- ✅ La secuencia está correctamente vinculada a la tabla
- ✅ Los inserts futuros funcionarán sin problemas

## Fecha de Corrección

- **Fecha**: 2026-02-19
- **Script**: `backend/src/scripts/fixReceptionItemsSequence.js`
- **Estado**: ✅ COMPLETADO
