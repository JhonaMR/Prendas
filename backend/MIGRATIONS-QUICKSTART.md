# 🚀 Quick Start - Sistema de Migraciones

## Configuración Inicial (Solo una vez)

### 1. Crear base de datos de desarrollo
```bash
cd backend
node scripts/setupDevDatabase.js
```

### 2. Verificar instalación
```bash
node scripts/migrationStatus.js --all
```

---

## Uso Diario

### Crear nueva migración
```bash
node scripts/createMigration.js "descripcion_del_cambio"
```

### Aplicar en desarrollo
```bash
node scripts/applyMigrations.js --env=dev
```

### Ver estado
```bash
node scripts/migrationStatus.js
```

---

## Aplicar en Producción

```bash
# En el servidor
cd /ruta/proyecto
git pull origin main
node scripts/applyMigrations.js --env=prod
pm2 restart all
```

---

## Comandos Útiles

```bash
# Ver todas las BDs
node scripts/migrationStatus.js --all

# Aplicar solo a Plow
node scripts/applyMigrations.js --target=plow

# Aplicar solo a Melas
node scripts/applyMigrations.js --target=melas

# Revertir última migración
node scripts/rollbackMigration.js
```

---

## 📚 Documentación Completa

- [Guía Completa de Migraciones](../../documentacion/GUIA-MIGRACIONES.md)
- [README de Migraciones](../migrations/README.md)

---

## 🆘 Ayuda Rápida

**¿Migración falló?**
- El sistema hace rollback automático
- Corrige el SQL y vuelve a aplicar

**¿Olvidé crear migración?**
- Crea la migración ahora
- Aplica en producción

**¿Bases desincronizadas?**
```bash
node scripts/migrationStatus.js --all
node scripts/applyMigrations.js --target=<bd_que_falta>
```
