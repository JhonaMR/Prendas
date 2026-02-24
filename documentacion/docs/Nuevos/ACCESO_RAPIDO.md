# 🚀 ACCESO RÁPIDO AL SISTEMA

## 🌐 URLs

| Servicio | URL | Estado |
|----------|-----|--------|
| Frontend | http://localhost:5173 | ✅ Corriendo |
| Backend | https://localhost:3000 | ✅ Corriendo |
| Base de Datos | localhost:5433 | ✅ Conectada |

---

## 📝 PASOS PARA ACCEDER

### 1. Abre el Navegador
```
http://localhost:5173
```

### 2. Inicia Sesión
- Usa un usuario **admin** o **general**
- (Los usuarios deben estar creados en la BD)

### 3. Verás la Página de Inicio (HomeView)
Con botones para:
- ✅ Fichas de Diseño
- ✅ Fichas de Costo
- ✅ Maletas

### 4. Haz Clic en Cualquier Botón
Se abrirá la vista correspondiente

---

## 📍 UBICACIÓN DE BOTONES

### En HomeView (Página Principal)
```
┌─────────────────────────────────────┐
│  Dashboard Administrativo           │
├─────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────┐ │
│ │ Fichas   │ │ Fichas   │ │Maletas│ │
│ │ Diseño   │ │ Costo    │ │      │ │
│ └──────────┘ └──────────┘ └──────┘ │
│ ┌──────────┐ ┌──────────┐ ┌──────┐ │
│ │Recepción │ │Devolución│ │...   │ │
│ └──────────┘ └──────────┘ └──────┘ │
└─────────────────────────────────────┘
```

### En Sidebar (Menú Lateral)
```
┌─────────────────────┐
│ SISTEMA DE FICHAS   │
├─────────────────────┤
│ • Fichas de Diseño  │
│ • Fichas de Costo   │
│ • Maletas           │
└─────────────────────┘
```

---

## 🎯 FUNCIONALIDADES DISPONIBLES

### Fichas de Diseño
- ✅ Ver listado en mosaico
- ✅ Crear nueva ficha
- ✅ Editar ficha existente
- ✅ Subir fotos (JPG/PNG, 5MB máx)
- ✅ Agregar conceptos (materia prima, mano de obra, etc.)
- ✅ Ver costo total calculado

### Fichas de Costo
- ✅ Importar desde fichas de diseño
- ✅ Editar precios y rentabilidad
- ✅ Ver descuentos simulados (0%, 5%, 10%, 15%)
- ✅ Crear cortes (hasta 4 por ficha)
- ✅ Analizar utilidad/pérdida

### Maletas
- ✅ Crear maletas
- ✅ Asignar referencias
- ✅ Editar maletas
- ✅ Eliminar maletas

---

## 🔐 PERMISOS POR ROL

| Rol | Fichas Diseño | Fichas Costo | Maletas |
|-----|---------------|--------------|---------|
| Diseñadora | ✅ Crear/Editar | ❌ No | ❌ No |
| Admin | ✅ Ver | ✅ Crear/Editar | ✅ Crear/Editar |
| General | ✅ Ver | ✅ Crear/Editar | ✅ Crear/Editar |
| Observer | ✅ Solo Ver | ✅ Solo Ver | ✅ Solo Ver |

---

## 🐛 TROUBLESHOOTING

### Los botones no aparecen
**Solución:** Presiona F5 para recargar la página

### Error: "No autorizado"
**Solución:** Cierra sesión y vuelve a iniciar con un usuario válido

### Error: "Tabla no existe"
**Solución:** Ejecuta el script SQL para crear las tablas:
```bash
psql -U postgres -d inventory -f Prendas/backend/scripts/create-fichas-tables.sql
```

### Backend no responde
**Solución:** Verifica que esté corriendo:
```bash
npm run dev  # en Prendas/backend/
```

### Frontend no carga
**Solución:** Verifica que esté corriendo:
```bash
npm run dev  # en Prendas/
```

---

## 📊 ESTADO ACTUAL

```
✅ Backend:      Corriendo en https://localhost:3000
✅ Frontend:     Corriendo en http://localhost:5173
✅ Base de Datos: Conectada (PostgreSQL)
✅ Botones:      Agregados en HomeView y Sidebar
⏳ Tablas BD:    Pendiente crear (ejecutar script SQL)
```

---

## 🎉 ¡LISTO PARA USAR!

Solo falta ejecutar el script SQL para crear las tablas, luego puedes acceder a:

**http://localhost:5173**

¡Disfruta! 🚀

