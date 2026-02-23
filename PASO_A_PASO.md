# 📖 PASO A PASO - PARA ENTRAR A LAS VISTAS

## 🎯 OBJETIVO
Que puedas entrar a las vistas de fichas y verlas funcionando

---

## ⏱️ TIEMPO TOTAL: ~15 minutos

---

## PASO 1: CREAR TABLAS EN BD (5 minutos)

### Opción A: pgAdmin (Más fácil)

1. **Abre pgAdmin**
   - URL: `http://localhost:5050` (o donde tengas pgAdmin)
   - Usuario: `postgres`
   - Contraseña: Tu contraseña de PostgreSQL

2. **Navega a la BD**
   - Servidores → PostgreSQL → Bases de datos → `inventory`

3. **Abre Query Tool**
   - Click derecho en `inventory` → Query Tool
   - O: Tools → Query Tool

4. **Copia el script SQL**
   - Abre: `Prendas/backend/scripts/create-fichas-tables.sql`
   - Copia TODO el contenido

5. **Pega en Query Tool**
   - Ctrl+A (selecciona todo en Query Tool)
   - Ctrl+V (pega el script)

6. **Ejecuta**
   - Presiona F5 o haz clic en botón "Execute"
   - Espera a que termine

7. **Verifica**
   - Deberías ver: "Tablas creadas exitosamente"
   - En la sección "Messages" abajo

---

## PASO 2: INSTALAR DEPENDENCIAS (3 minutos)

### En tu terminal:

```bash
cd Prendas/backend
npm install
```

**Espera a que termine** (verás muchas líneas de instalación)

---

## PASO 3: INICIAR BACKEND (1 minuto)

### En la misma terminal:

```bash
npm run dev
```

**Esperado:**
```
✅ Base de datos inicializada correctamente
🚀 Servidor corriendo en http://localhost:3000
```

**Deja esta terminal abierta**

---

## PASO 4: INICIAR FRONTEND (1 minuto)

### Abre OTRA terminal nueva:

```bash
cd Prendas
npm run dev
```

**Esperado:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

**Deja esta terminal abierta**

---

## PASO 5: ABRIR EN NAVEGADOR (1 minuto)

1. **Abre tu navegador**
   - Chrome, Firefox, Edge, etc.

2. **Ve a:**
   ```
   http://localhost:5173
   ```

3. **Inicia sesión**
   - Usuario: admin (o cualquier usuario admin/general)
   - PIN: Tu PIN

---

## PASO 6: VER LOS BOTONES (1 minuto)

### En la página de inicio (HomeView) deberías ver:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Dashboard Administrativo                           │
│  Selecciona una opción para continuar               │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ 📄 Fichas    │  │ 💵 Fichas    │  │ 🎒 Maletas│ │
│  │    Diseño    │  │    Costo     │  │          │ │
│  └──────────────┘  └──────────────┘  └──────────┘ │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ 📦 Recepción │  │ ↩️ Devolución│  │ 📤 Despachos│
│  └──────────────┘  └──────────────┘  └──────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## PASO 7: ENTRAR A FICHAS DE DISEÑO (1 minuto)

1. **Haz clic en el botón "Fichas de Diseño"** (rosa)

2. **Deberías ver:**
   - Título: "Fichas de Diseño"
   - Contador: "0 fichas"
   - Botón: "Crear Ficha Nueva"
   - Mensaje: "No hay fichas de diseño"

3. **¡Estás dentro!** ✅

---

## PASO 8: ENTRAR A FICHAS DE COSTO (1 minuto)

1. **Vuelve atrás** (botón atrás o click en "Inicio")

2. **Haz clic en el botón "Fichas de Costo"** (azul)

3. **Deberías ver:**
   - Título: "Fichas de Costo"
   - Contador: "0 fichas"
   - Botón: "Importar Ficha"
   - Mensaje: "No hay fichas de costo"

4. **¡Estás dentro!** ✅

---

## PASO 9: ENTRAR A MALETAS (1 minuto)

1. **Vuelve atrás**

2. **Haz clic en el botón "Maletas"** (púrpura)

3. **Deberías ver:**
   - Título: "Maletas"
   - Contador: "0 maletas"
   - Botón: "Crear Maleta"
   - Mensaje: "No hay maletas creadas"

4. **¡Estás dentro!** ✅

---

## PASO 10: VERIFICAR EN SIDEBAR (1 minuto)

1. **Haz clic en el botón de menú** (arriba a la izquierda)

2. **Deberías ver una nueva sección:**
   ```
   SISTEMA DE FICHAS
   ├─ Fichas de Diseño
   ├─ Fichas de Costo
   └─ Maletas
   ```

3. **Haz clic en cualquiera** para navegar

4. **¡Todo funciona!** ✅

---

## ✅ CHECKLIST FINAL

- [ ] Ejecuté el script SQL
- [ ] Instalé dependencias (`npm install`)
- [ ] Backend corriendo en puerto 3000
- [ ] Frontend corriendo en puerto 5173
- [ ] Puedo ver los botones en HomeView
- [ ] Puedo entrar a Fichas de Diseño
- [ ] Puedo entrar a Fichas de Costo
- [ ] Puedo entrar a Maletas
- [ ] Veo la sección en Sidebar
- [ ] Todo funciona sin errores

---

## 🐛 SI ALGO NO FUNCIONA

### Error: "Tabla no existe"
- Ejecuta el script SQL nuevamente
- Verifica que PostgreSQL esté corriendo

### Error: "Cannot find module"
- Ejecuta `npm install` en `Prendas/backend`

### Los botones no aparecen
- Presiona F5 en el navegador
- Cierra sesión y vuelve a iniciar

### Error de conexión
- Verifica que backend esté corriendo (terminal 1)
- Verifica que frontend esté corriendo (terminal 2)

### Error: "No autorizado"
- Cierra sesión
- Vuelve a iniciar con usuario admin o general

---

## 🎉 ¡LISTO!

Ya puedes ver las vistas de fichas funcionando.

**Próximo paso:** Crear datos de prueba (diseñadoras, fichas, etc.)

---

## 📞 NOTAS

- Las vistas están vacías (sin datos)
- Puedes crear datos desde las vistas
- Los cálculos se hacen automáticamente
- Las fotos se suben al servidor
- Todo está guardado en la BD

¡Adelante! 🚀
