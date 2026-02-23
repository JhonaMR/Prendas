# ⚠️ URGENTE: Ejecutar Migración de Base de Datos

## 🔴 Problema

El error 500 ocurre porque la columna `affects_inventory` **no existe en la base de datos**.

Cuando intentas actualizar una recepción, el backend intenta actualizar esa columna pero no existe, causando un error SQL.

## ✅ Solución

### Paso 1: Ejecutar la Migración

Abre una terminal en la carpeta del backend y ejecuta:

```bash
cd Prendas/backend
node scripts/migrate-affects-inventory.js
```

**Salida esperada:**
```
🔄 Starting migration: Adding affects_inventory column...
✅ Column affects_inventory added successfully
✅ Migration completed successfully!
📝 All existing receptions will have affects_inventory = TRUE by default
```

### Paso 2: Reiniciar el Backend

Después de ejecutar la migración, reinicia el backend:

```bash
pm2 restart all
```

O si ejecutas manualmente:
1. Presiona `Ctrl+C` en la terminal del backend
2. Ejecuta `npm start` nuevamente

### Paso 3: Probar

1. Recarga el frontend (Ctrl+Shift+Delete + F5)
2. Edita una recepción
3. Haz clic en "GUARDAR RECEPCIÓN"
4. ✅ Debe guardar sin errores

---

## 🆘 Si la Migración Falla

Si el script de migración falla, ejecuta manualmente el SQL:

```sql
ALTER TABLE public.receptions
ADD COLUMN affects_inventory BOOLEAN DEFAULT TRUE;
```

Luego reinicia el backend.

---

**IMPORTANTE**: Sin esta migración, no funcionará la edición de recepciones.
