# 📖 GUÍA DE USUARIO: Validación Automática de Backups

## 🎯 ¿Qué es?

El sistema de validación automática de backups verifica que cada backup creado sea válido y completo. Si hay problemas, te muestra alertas claras indicando qué está mal.

---

## 🚀 CÓMO USAR DESDE EL FRONTEND

### Paso 1: Ir a Gestión de Backups

1. Abre la aplicación
2. Busca la sección "Gestión de Backups"
3. Verás un panel con estadísticas y opciones

### Paso 2: Hacer un Backup Manual

1. Haz click en el botón **"💾 Backup Manual"**
2. Espera a que se complete (normalmente tarda 5-10 segundos)
3. Verás alertas mostrando el resultado

### Paso 3: Interpretar las Alertas

#### 🟢 Alerta Verde (SUCCESS)
```
✅ Backup de BD Exitoso
Backup creado correctamente: inventory-backup-daily-2026-03-02-10-07-30.sql

Detalles:
  • Archivo: inventory-backup-daily-2026-03-02-10-07-30.sql
  • Tamaño: 0.23 MB
  • Tablas: 29
  • Tipo: daily
```

**Significado**: Todo está bien. El backup se creó correctamente y pasó todas las validaciones.

#### 🟡 Alerta Amarilla (WARNING)
```
⚠️ Backup Creado pero con Problemas
El backup se creó pero tiene problemas: Faltan tablas críticas

Detalles:
  • Archivo: inventory-backup-daily-2026-03-02-10-07-30.sql
  • Error: Faltan tablas críticas: return_receptions, return_reception_items
  • Tamaño: 0.23 MB
```

**Significado**: El backup se creó pero le faltan algunas tablas importantes. Contacta al administrador.

#### 🔴 Alerta Roja (ERROR)
```
❌ Error en Backup Manual
No se pudo crear el backup de la base de datos

Detalles:
  • Error: DB_PASSWORD no está configurada
```

**Significado**: Algo salió mal y no se pudo crear el backup. Contacta al administrador.

#### 🔵 Alerta Azul (INFO)
```
ℹ️ Sin Imágenes
No hay imágenes para respaldar
```

**Significado**: Información general, no hay problema.

---

## 📊 ENTENDER LAS ESTADÍSTICAS

En el panel de Gestión de Backups verás:

```
Total de Backups: 7
Almacenamiento Total: 1.45 MB

Diarios: 7 (1.45 MB)
Semanales: 0 (0.00 MB)
Mensuales: 0 (0.00 MB)
```

**Explicación**:
- **Total de Backups**: Cuántos backups tienes guardados
- **Almacenamiento Total**: Cuánto espacio ocupan todos los backups
- **Diarios**: Backups de cada día (máximo 7)
- **Semanales**: Backups de cada domingo (máximo 4)
- **Mensuales**: Backups del primer día del mes (máximo 3)

---

## 🔄 BACKUPS AUTOMÁTICOS

El sistema crea backups automáticamente cada día a las **22:00 (10 PM)**.

**Política de retención**:
- Últimos 7 backups diarios
- Últimos 4 backups semanales (domingos)
- Últimos 3 backups mensuales (primer día del mes)

Los backups antiguos se eliminan automáticamente para ahorrar espacio.

---

## ⚠️ ¿QUÉ PASA SI HAY UN PROBLEMA?

### Si ves una alerta de WARNING o ERROR:

1. **Lee el mensaje**: Te dice exactamente qué está mal
2. **Anota los detalles**: Especialmente el nombre del archivo y el error
3. **Contacta al administrador**: Proporciona la información de la alerta
4. **No intentes restaurar**: Espera a que se resuelva el problema

### Problemas comunes:

**"Faltan tablas críticas"**
- Significa que el backup no incluye todas las tablas necesarias
- Contacta al administrador

**"Archivo contiene caracteres corruptos"**
- El backup se dañó durante la creación
- Se intentará crear uno nuevo automáticamente

**"No contiene CREATE TABLE"**
- El archivo de backup está vacío o corrupto
- Contacta al administrador

---

## 💾 RESTAURAR UN BACKUP

Si necesitas restaurar un backup anterior:

1. Ve a "Gestión de Backups"
2. Busca el backup que quieres restaurar en la lista
3. Haz click en el botón **"↩️ Restaurar"**
4. Confirma que deseas restaurar
5. Espera a que se complete

**Importante**: 
- Se perderán todos los cambios posteriores a la fecha del backup
- Se crea automáticamente un backup de seguridad antes de restaurar
- El proceso tarda algunos minutos

---

## 🔍 MONITOREO AVANZADO

### Ver el archivo de alertas (para administradores)

Las alertas se guardan en:
```
Prendas/backend/logs/backup-alerts/backup-alerts-YYYY-MM-DD.log
```

Ejemplo:
```
[2026-03-02T15:04:12.143Z] [MISSING_TABLES] Backup falta tablas críticas
[2026-03-02T15:07:30.704Z] [SUCCESS] Backup validado correctamente
```

### Ver reporte de validación (para administradores)

```bash
curl http://localhost:3001/api/backups/validation/report \
  -H "Authorization: Bearer <token>"
```

---

## ✅ CHECKLIST DE BUENAS PRÁCTICAS

- [ ] Reviso regularmente el panel de Gestión de Backups
- [ ] Hago un backup manual antes de cambios importantes
- [ ] Verifico que las alertas sean verdes (SUCCESS)
- [ ] Contacto al administrador si veo alertas amarillas o rojas
- [ ] No intento restaurar sin confirmar primero
- [ ] Guardo información de backups importantes

---

## 📞 SOPORTE

Si tienes problemas:

1. **Anota el error exacto** de la alerta
2. **Toma una captura de pantalla** de la alerta
3. **Contacta al administrador** con esta información
4. **Proporciona la hora** en que ocurrió el problema

---

## 🎓 PREGUNTAS FRECUENTES

**P: ¿Qué pasa si no hago backup manual?**
R: El sistema hace backups automáticos cada día a las 22:00. No necesitas hacer nada.

**P: ¿Cuánto espacio ocupan los backups?**
R: Depende del tamaño de la base de datos. Normalmente 0.2-1 MB por backup.

**P: ¿Puedo restaurar un backup de hace un mes?**
R: Sí, si aún existe. El sistema mantiene los últimos 3 backups mensuales.

**P: ¿Qué pasa si se llena el disco?**
R: Los backups antiguos se eliminan automáticamente según la política de retención.

**P: ¿Puedo descargar un backup?**
R: Contacta al administrador. Los backups se guardan en el servidor.

**P: ¿Qué significa "Backup de BD Exitoso"?**
R: Significa que el backup se creó correctamente y pasó todas las validaciones.

---

## 📚 MÁS INFORMACIÓN

Para información técnica detallada, ver:
- `INVESTIGACION_BACKUP_DEVOLUCIONES.md`
- `IMPLEMENTACION_VALIDACION_BACKUPS.md`
- `RESUMEN_VALIDACION_BACKUPS.txt`

