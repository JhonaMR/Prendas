# ⚡ INICIO RÁPIDO - PRENDAS + MELAS

## 🎯 En 5 minutos

### Paso 1: Verificar instalación (1 min)

```bash
cd C:\Users\luisf\OneDrive\Desktop\Proyecto\Prendas\backend
verify-setup.bat
```

Debe mostrar ✅ en todo. Si algo falla, instálalo.

### Paso 2: Crear bases de datos (1 min)

```bash
create-databases.bat
```

Esto crea:
- `inventory_prendas`
- `inventory_melas`

### Paso 3: Inicializar tablas (1 min)

```bash
init-databases.bat
```

Esto crea las tablas en ambas BDs.

### Paso 4: Iniciar ambas marcas (1 min)

```bash
start-pm2.bat
```

Verás:
```
✅ Procesos iniciados correctamente

PRENDAS:
  - Backend: http://localhost:3000
  - Frontend: http://localhost:5173

MELAS:
  - Backend: http://localhost:3001
  - Frontend: http://localhost:5174
```

### Paso 5: Acceder a las aplicaciones (1 min)

Abre en tu navegador:
- **PRENDAS**: http://localhost:5173
- **MELAS**: http://localhost:5174

---

## 📊 Verificar que todo funciona

```bash
# Ver estado de procesos
pm2 status

# Ver logs en tiempo real
pm2 logs

# Monitor interactivo
pm2 monit
```

---

## 🛑 Detener todo

```bash
stop-pm2.bat
```

---

## 🔄 Reiniciar todo

```bash
restart-pm2.bat
```

---

## 📋 Comandos útiles

| Comando | Función |
|---------|---------|
| `start-pm2.bat` | Inicia ambas marcas |
| `stop-pm2.bat` | Detiene ambas marcas |
| `restart-pm2.bat` | Reinicia ambas marcas |
| `status-pm2.bat` | Ver estado |
| `logs-pm2.bat` | Ver logs |
| `verify-setup.bat` | Verificar instalación |
| `create-databases.bat` | Crear BDs |
| `init-databases.bat` | Inicializar tablas |

---

## ⚠️ Si algo falla

### Los procesos no inician

```bash
# Verificar que PM2 está instalado
pm2 --version

# Si no está, instálalo
npm install -g pm2
```

### Puerto ya en uso

```bash
# Encontrar qué usa el puerto
netstat -ano | findstr :3000

# Matar el proceso (reemplaza PID)
taskkill /PID <PID> /F
```

### BD no se conecta

```bash
# Verificar que PostgreSQL está corriendo
# En Windows: Servicios (services.msc) → PostgreSQL

# Verificar credenciales en .env.prendas y .env.melas
```

---

## 📚 Documentación completa

Ver `SETUP_DUAL_BRANDS.md` para más detalles.

