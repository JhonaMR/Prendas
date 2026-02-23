# ✅ Script de Migración Corregido

## 🔧 Cambio Realizado

El script de migración ha sido corregido para crear su propia conexión a PostgreSQL, sin depender del pool global.

## 🚀 Ejecutar la Migración

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

## ⚙️ Variables de Entorno

El script usa estas variables de entorno (con valores por defecto):

```
DB_USER = postgres
DB_PASSWORD = postgres
DB_HOST = localhost
DB_PORT = 5432
DB_NAME = inventory
```

Si tus credenciales son diferentes, asegúrate de que estén en tu archivo `.env`.

## 🔄 Después de la Migración

1. **Reinicia el backend:**
   ```bash
   pm2 restart all
   ```

2. **Recarga el frontend:**
   - Ctrl+Shift+Delete (limpiar caché)
   - F5 (recargar)

3. **Prueba:**
   - Edita una recepción
   - Haz clic en "GUARDAR RECEPCIÓN"
   - ✅ Debe guardar sin errores

---

**Estado**: ✅ LISTO PARA USAR
