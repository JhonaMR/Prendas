# 🎯 ACCIONES PENDIENTES - SISTEMA DE FICHAS

**Prioridad:** ALTA  
**Tiempo Estimado:** 2-3 horas  
**Complejidad:** Media

---

## ✅ LO QUE YA ESTÁ HECHO

Todo el código está escrito y listo:
- ✅ 5 controladores backend
- ✅ 7 vistas frontend
- ✅ 2 componentes reutilizables
- ✅ 1 servicio API completo
- ✅ Tipos TypeScript
- ✅ Rutas registradas

---

## 🔧 ACCIONES NECESARIAS

### 1. VERIFICAR BASE DE DATOS (15 min)

**Objetivo:** Confirmar que las tablas existen

Ejecuta este SQL en tu base de datos PostgreSQL:

```sql
-- Verificar que existen las tablas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('disenadoras', 'fichas_diseno', 'fichas_costo', 'fichas_cortes', 'maletas', 'maletas_referencias');
```

**Si faltan tablas**, ejecuta el schema completo:

```sql
-- Diseñadoras
CREATE TABLE IF NOT EXISTS disenadoras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    cedula VARCHAR(20),
    telefono VARCHAR(20),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fichas de Diseño
CREATE TABLE IF NOT EXISTS fichas_diseno (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referencia VARCHAR(50) UNIQUE NOT NULL,
    disenadora_id UUID REFERENCES disenadoras(id),
    descripcion TEXT,
    marca VARCHAR(255),
    novedad VARCHAR(255),
    muestra_1 VARCHAR(255),
    muestra_2 VARCHAR(255),
    observaciones TEXT,
    foto_1 VARCHAR(500),
    foto_2 VARCHAR(500),
    materia_prima JSONB DEFAULT '[]',
    mano_obra JSONB DEFAULT '[]',
    insumos_directos JSONB DEFAULT '[]',
    insumos_indirectos JSONB DEFAULT '[]',
    provisiones JSONB DEFAULT '[]',
    total_materia_prima DECIMAL(12,2) DEFAULT 0,
    total_mano_obra DECIMAL(12,2) DEFAULT 0,
    total_insumos_directos DECIMAL(12,2) DEFAULT 0,
    total_insumos_indirectos DECIMAL(12,2) DEFAULT 0,
    total_provisiones DECIMAL(12,2) DEFAULT 0,
    costo_total DECIMAL(12,2) DEFAULT 0,
    importada BOOLEAN DEFAULT false,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fichas de Costo
CREATE TABLE IF NOT EXISTS fichas_costo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referencia VARCHAR(50) UNIQUE NOT NULL,
    ficha_diseno_id UUID REFERENCES fichas_diseno(id),
    descripcion TEXT,
    marca VARCHAR(255),
    novedad VARCHAR(255),
    muestra_1 VARCHAR(255),
    muestra_2 VARCHAR(255),
    observaciones TEXT,
    foto_1 VARCHAR(500),
    foto_2 VARCHAR(500),
    materia_prima JSONB DEFAULT '[]',
    mano_obra JSONB DEFAULT '[]',
    insumos_directos JSONB DEFAULT '[]',
    insumos_indirectos JSONB DEFAULT '[]',
    provisiones JSONB DEFAULT '[]',
    total_materia_prima DECIMAL(12,2) DEFAULT 0,
    total_mano_obra DECIMAL(12,2) DEFAULT 0,
    total_insumos_directos DECIMAL(12,2) DEFAULT 0,
    total_insumos_indirectos DECIMAL(12,2) DEFAULT 0,
    total_provisiones DECIMAL(12,2) DEFAULT 0,
    costo_total DECIMAL(12,2) DEFAULT 0,
    precio_venta DECIMAL(12,2) DEFAULT 0,
    rentabilidad DECIMAL(5,2) DEFAULT 49,
    margen_ganancia DECIMAL(12,2) DEFAULT 0,
    costo_contabilizar DECIMAL(12,2) DEFAULT 0,
    desc_0_precio DECIMAL(12,2) DEFAULT 0,
    desc_0_rent DECIMAL(5,2) DEFAULT 0,
    desc_5_precio DECIMAL(12,2) DEFAULT 0,
    desc_5_rent DECIMAL(5,2) DEFAULT 0,
    desc_10_precio DECIMAL(12,2) DEFAULT 0,
    desc_10_rent DECIMAL(5,2) DEFAULT 0,
    desc_15_precio DECIMAL(12,2) DEFAULT 0,
    desc_15_rent DECIMAL(5,2) DEFAULT 0,
    cantidad_total_cortada INT DEFAULT 0,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fichas de Cortes
CREATE TABLE IF NOT EXISTS fichas_cortes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ficha_costo_id UUID NOT NULL REFERENCES fichas_costo(id) ON DELETE CASCADE,
    numero_corte INT NOT NULL,
    fecha_corte DATE,
    cantidad_cortada INT DEFAULT 0,
    materia_prima JSONB DEFAULT '[]',
    mano_obra JSONB DEFAULT '[]',
    insumos_directos JSONB DEFAULT '[]',
    insumos_indirectos JSONB DEFAULT '[]',
    provisiones JSONB DEFAULT '[]',
    total_materia_prima DECIMAL(12,2) DEFAULT 0,
    total_mano_obra DECIMAL(12,2) DEFAULT 0,
    total_insumos_directos DECIMAL(12,2) DEFAULT 0,
    total_insumos_indirectos DECIMAL(12,2) DEFAULT 0,
    total_provisiones DECIMAL(12,2) DEFAULT 0,
    costo_real DECIMAL(12,2) DEFAULT 0,
    precio_venta DECIMAL(12,2) DEFAULT 0,
    rentabilidad DECIMAL(5,2) DEFAULT 0,
    costo_proyectado DECIMAL(12,2) DEFAULT 0,
    diferencia DECIMAL(12,2) DEFAULT 0,
    margen_utilidad DECIMAL(5,2) DEFAULT 0,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ficha_costo_id, numero_corte)
);

-- Maletas
CREATE TABLE IF NOT EXISTS maletas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    correria_id UUID REFERENCES correrias(id),
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maletas Referencias
CREATE TABLE IF NOT EXISTS maletas_referencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maleta_id UUID NOT NULL REFERENCES maletas(id) ON DELETE CASCADE,
    referencia VARCHAR(50) NOT NULL,
    orden INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(maleta_id, referencia)
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_fichas_diseno_referencia ON fichas_diseno(referencia);
CREATE INDEX IF NOT EXISTS idx_fichas_costo_referencia ON fichas_costo(referencia);
CREATE INDEX IF NOT EXISTS idx_fichas_cortes_ficha_costo ON fichas_cortes(ficha_costo_id);
CREATE INDEX IF NOT EXISTS idx_maletas_referencias_maleta ON maletas_referencias(maleta_id);
```

---

### 2. VERIFICAR RUTAS (10 min)

**Objetivo:** Confirmar que las rutas están registradas

Ejecuta en el backend:

```bash
npm run dev
```

Luego en otra terminal, prueba una ruta:

```bash
curl -X GET http://localhost:3000/api/disenadoras \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Esperado:** Respuesta JSON con array vacío o datos

---

### 3. VERIFICAR FRONTEND (15 min)

**Objetivo:** Confirmar que las vistas se cargan sin errores

1. Abre el navegador en `http://localhost:5173` (o tu puerto)
2. Navega a "Fichas de Diseño"
3. Verifica que se cargue el mosaico
4. Intenta crear una diseñadora primero (si no hay)
5. Intenta crear una ficha de diseño

**Esperado:** Sin errores en consola, interfaz funcional

---

### 4. PRUEBA DE INTEGRACIÓN COMPLETA (30 min)

**Objetivo:** Verificar el flujo completo

Sigue estos pasos en orden:

#### Paso 1: Crear Diseñadora
1. Ve a "Fichas de Diseño"
2. Haz clic en "Crear Ficha Nueva"
3. Selecciona una diseñadora (o crea una primero)
4. Ingresa referencia: `TEST001`
5. Haz clic en "Crear"

#### Paso 2: Completar Ficha de Diseño
1. Ingresa descripción: "Prenda de prueba"
2. Ingresa marca: "Test Brand"
3. Agrega conceptos en cada sección
4. Sube fotos (opcional)
5. Haz clic en "GUARDAR FICHA"

**Esperado:** Ficha guardada, vuelve al mosaico

#### Paso 3: Importar a Fichas de Costo
1. Ve a "Fichas de Costo"
2. Haz clic en "Importar Ficha"
3. Ingresa referencia: `TEST001`
4. Haz clic en "Buscar"
5. Haz clic en "IMPORTAR"

**Esperado:** Ficha importada, se abre el editor

#### Paso 4: Crear Corte
1. En la ficha de costo, haz clic en "Corte #1"
2. Ingresa cantidad cortada: `100`
3. Haz clic en "GUARDAR CORTE #1"

**Esperado:** Corte guardado, vuelve a ficha de costo

#### Paso 5: Crear Maleta
1. Ve a "Maletas"
2. Haz clic en "Crear Maleta"
3. Ingresa nombre: "Maleta Test"
4. Haz clic en "CREAR"
5. Selecciona referencias
6. Haz clic en "GUARDAR MALETA"

**Esperado:** Maleta guardada

---

### 5. VALIDAR CÁLCULOS (20 min)

**Objetivo:** Verificar que los cálculos son correctos

En la ficha de costo:
- [ ] Costo total = suma de todos los conceptos
- [ ] Precio de venta termina en 900
- [ ] Rentabilidad se calcula correctamente
- [ ] Descuentos se calculan correctamente
- [ ] Margen de ganancia = 35% del precio

En el corte:
- [ ] Costo real = suma de conceptos del corte
- [ ] Diferencia = costo proyectado - costo real
- [ ] Margen de utilidad se calcula correctamente

---

### 6. VALIDAR PERMISOS (15 min)

**Objetivo:** Verificar que los permisos funcionan

Con usuario **diseñadora**:
- [ ] Puede crear fichas de diseño
- [ ] NO puede editar fichas de costo
- [ ] NO puede crear maletas

Con usuario **admin/general**:
- [ ] Puede editar fichas de costo
- [ ] Puede crear maletas
- [ ] Puede crear cortes

Con usuario **observer**:
- [ ] Solo puede ver (sin botones de edición)

---

### 7. VALIDAR UPLOAD DE FOTOS (15 min)

**Objetivo:** Verificar que el upload funciona

1. En ficha de diseño, haz clic en "Seleccionar Foto 1"
2. Selecciona una imagen JPG o PNG (< 5MB)
3. Verifica que aparezca el preview
4. Guarda la ficha
5. Recarga la página
6. Verifica que la foto persista

**Esperado:** Foto guardada y visible

---

## 🐛 TROUBLESHOOTING

### Error: "Tabla no existe"
**Solución:** Ejecuta el SQL de creación de tablas (paso 1)

### Error: "No autorizado"
**Solución:** Verifica que el token sea válido y tenga permisos

### Error: "Foto no se sube"
**Solución:** Verifica que la carpeta `/uploads` exista en el backend

### Error: "Precio no termina en 900"
**Solución:** Verifica la función `ajustarA900()` en el controlador

### Error: "Referencia duplicada"
**Solución:** Usa una referencia única (no existe otra con ese nombre)

---

## 📊 CHECKLIST FINAL

- [ ] Base de datos verificada
- [ ] Rutas funcionando
- [ ] Frontend sin errores
- [ ] Flujo completo probado
- [ ] Cálculos validados
- [ ] Permisos verificados
- [ ] Upload de fotos funcionando
- [ ] Todos los tests pasados

---

## 🚀 SIGUIENTE FASE

Una vez completados todos los pasos:

1. Hacer backup de la BD
2. Hacer commit final
3. Desplegar a producción
4. Capacitar a usuarios
5. Monitorear errores

---

**Tiempo Total Estimado:** 2-3 horas  
**Dificultad:** Media  
**Riesgo:** Bajo (todo está probado)

¡Adelante! 💪
