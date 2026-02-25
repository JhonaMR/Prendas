-- ============================================================================
-- SCRIPT DE VERIFICACIÓN Y CREACIÓN DE TABLAS - INVENTARIO
-- ============================================================================
-- Este script verifica que todas las tablas, índices y constraints existan
-- Si algo no existe, lo crea automáticamente
-- Útil para sincronizar la BD entre diferentes máquinas
-- ============================================================================

-- ============================================================================
-- 1. TABLA: users
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    login_code character varying(3) NOT NULL,
    pin_hash character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    active boolean DEFAULT true,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_login_code_key UNIQUE (login_code)
);

-- ============================================================================
-- 2. TABLA: sellers
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sellers (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT sellers_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- 3. TABLA: clients
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.clients (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    nit character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    city character varying(255) NOT NULL,
    seller character varying(255),
    seller_id character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone,
    active boolean DEFAULT true,
    CONSTRAINT clients_pkey PRIMARY KEY (id),
    CONSTRAINT clients_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.sellers(id) ON DELETE SET NULL
);

-- ============================================================================
-- 4. TABLA: confeccionistas
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.confeccionistas (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    address character varying(255),
    city character varying(255),
    phone character varying(255),
    score character varying(10),
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT confeccionistas_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- 5. TABLA: correrias
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.correrias (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    year character varying(4),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT correrias_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- 6. TABLA: correria_catalog
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.correria_catalog (
    id character varying(255) NOT NULL,
    correria_id character varying(255) NOT NULL,
    reference_id character varying(255) NOT NULL,
    added_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT correria_catalog_pkey PRIMARY KEY (id),
    CONSTRAINT correria_catalog_correria_id_fkey FOREIGN KEY (correria_id) REFERENCES public.correrias(id) ON DELETE CASCADE
);

-- ============================================================================
-- 7. TABLA: product_references
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.product_references (
    id character varying(255) NOT NULL,
    description character varying(255) NOT NULL,
    price numeric(10,2),
    designer character varying(255),
    cloth1 character varying(255),
    avg_cloth1 numeric(10,2),
    cloth2 character varying(255),
    avg_cloth2 numeric(10,2),
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT product_references_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- 8. TABLA: receptions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.receptions (
    id character varying(255) NOT NULL,
    batch_code character varying(255) NOT NULL,
    confeccionista_id character varying(255),
    has_seconds boolean,
    charge_type character varying(50),
    charge_units integer,
    received_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    affects_inventory boolean DEFAULT true,
    CONSTRAINT receptions_pkey PRIMARY KEY (id),
    CONSTRAINT receptions_confeccionista_id_fkey FOREIGN KEY (confeccionista_id) REFERENCES public.confeccionistas(id) ON DELETE SET NULL
);

-- ============================================================================
-- 9. TABLA: reception_items
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reception_items (
    id character varying(255) NOT NULL,
    reception_id character varying(255) NOT NULL,
    reference_id character varying(255) NOT NULL,
    quantity integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reception_items_pkey PRIMARY KEY (id),
    CONSTRAINT reception_items_reception_id_fkey FOREIGN KEY (reception_id) REFERENCES public.receptions(id) ON DELETE CASCADE
);

-- ============================================================================
-- 10. TABLA: return_receptions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.return_receptions (
    id character varying(255) NOT NULL,
    client_id character varying(255),
    credit_note_number character varying(255),
    total_value numeric(10,2),
    received_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT return_receptions_pkey PRIMARY KEY (id),
    CONSTRAINT return_receptions_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL
);

-- ============================================================================
-- 11. TABLA: return_reception_items
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.return_reception_items (
    id character varying(255) NOT NULL,
    return_reception_id character varying(255) NOT NULL,
    reference character varying(255) NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT return_reception_items_pkey PRIMARY KEY (id),
    CONSTRAINT return_reception_items_return_reception_id_fkey FOREIGN KEY (return_reception_id) REFERENCES public.return_receptions(id) ON DELETE CASCADE
);

-- ============================================================================
-- 12. TABLA: dispatches
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.dispatches (
    id character varying(255) NOT NULL,
    client_id character varying(255),
    correria_id character varying(255),
    invoice_no character varying(255),
    remission_no character varying(255),
    dispatched_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT dispatches_pkey PRIMARY KEY (id),
    CONSTRAINT dispatches_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL,
    CONSTRAINT dispatches_correria_id_fkey FOREIGN KEY (correria_id) REFERENCES public.correrias(id) ON DELETE SET NULL
);

-- ============================================================================
-- 13. TABLA: dispatch_items
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.dispatch_items (
    id character varying(255) NOT NULL,
    dispatch_id character varying(255) NOT NULL,
    reference_id character varying(255) NOT NULL,
    quantity integer NOT NULL,
    sale_price numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT dispatch_items_pkey PRIMARY KEY (id),
    CONSTRAINT dispatch_items_dispatch_id_fkey FOREIGN KEY (dispatch_id) REFERENCES public.dispatches(id) ON DELETE CASCADE
);

-- ============================================================================
-- 14. TABLA: orders
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id character varying(255) NOT NULL,
    client_id character varying(255),
    seller_id character varying(255),
    correria_id character varying(255),
    total_value numeric(10,2),
    settled_by character varying(255),
    order_number integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT orders_pkey PRIMARY KEY (id),
    CONSTRAINT orders_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL,
    CONSTRAINT orders_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.sellers(id) ON DELETE SET NULL,
    CONSTRAINT orders_correria_id_fkey FOREIGN KEY (correria_id) REFERENCES public.correrias(id) ON DELETE SET NULL
);

-- ============================================================================
-- 15. TABLA: order_items
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id character varying(255) NOT NULL,
    order_id character varying(255) NOT NULL,
    reference_id character varying(255) NOT NULL,
    quantity integer NOT NULL,
    sale_price numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT order_items_pkey PRIMARY KEY (id),
    CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE
);

-- ============================================================================
-- 16. TABLA: production_tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.production_tracking (
    id character varying(255) NOT NULL,
    ref_id character varying(255) NOT NULL,
    correria_id character varying(255),
    programmed integer DEFAULT 0,
    cut integer DEFAULT 0,
    inventory integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT production_tracking_pkey PRIMARY KEY (id),
    CONSTRAINT production_tracking_correria_id_fkey FOREIGN KEY (correria_id) REFERENCES public.correrias(id) ON DELETE SET NULL
);

-- ============================================================================
-- 17. TABLA: inventory_movements
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id character varying(255) NOT NULL,
    reference_id character varying(255) NOT NULL,
    movement_type character varying(50) NOT NULL,
    quantity integer NOT NULL,
    source character varying(255),
    destination character varying(255),
    created_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT inventory_movements_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- 18. TABLA: delivery_dates
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.delivery_dates (
    id character varying(255) NOT NULL,
    confeccionista_id character varying(255),
    reference_id character varying(255),
    quantity integer,
    send_date date,
    expected_date date,
    delivery_date date,
    process character varying(255),
    observation text,
    created_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT delivery_dates_pkey PRIMARY KEY (id),
    CONSTRAINT delivery_dates_confeccionista_id_fkey FOREIGN KEY (confeccionista_id) REFERENCES public.confeccionistas(id) ON DELETE SET NULL
);

-- ============================================================================
-- 19. TABLA: disenadoras
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.disenadoras (
    id character varying(255) NOT NULL,
    nombre character varying(255) NOT NULL,
    cedula character varying(255),
    telefono character varying(255),
    activa boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT disenadoras_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- 20. TABLA: fichas_diseno
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.fichas_diseno (
    referencia character varying(255) NOT NULL,
    disenadora_id character varying(255),
    descripcion text,
    marca character varying(255),
    novedad character varying(255),
    muestra_1 character varying(500),
    muestra_2 character varying(500),
    observaciones text,
    foto_1 character varying(500),
    foto_2 character varying(500),
    materia_prima text,
    mano_obra text,
    insumos_directos text,
    insumos_indirectos text,
    provisiones text,
    total_materia_prima numeric(10,2),
    total_mano_obra numeric(10,2),
    total_insumos_directos numeric(10,2),
    total_insumos_indirectos numeric(10,2),
    total_provisiones numeric(10,2),
    costo_total numeric(10,2),
    importada boolean DEFAULT false,
    created_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fichas_diseno_pkey PRIMARY KEY (referencia),
    CONSTRAINT fichas_diseno_disenadora_id_fkey FOREIGN KEY (disenadora_id) REFERENCES public.disenadoras(id) ON DELETE SET NULL
);

-- ============================================================================
-- 21. TABLA: fichas_costo
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.fichas_costo (
    referencia character varying(255) NOT NULL,
    ficha_diseno_id character varying(255),
    descripcion text,
    marca character varying(255),
    novedad character varying(255),
    muestra_1 character varying(500),
    muestra_2 character varying(500),
    observaciones text,
    foto_1 character varying(500),
    foto_2 character varying(500),
    materia_prima text,
    mano_obra text,
    insumos_directos text,
    insumos_indirectos text,
    provisiones text,
    total_materia_prima numeric(10,2),
    total_mano_obra numeric(10,2),
    total_insumos_directos numeric(10,2),
    total_insumos_indirectos numeric(10,2),
    total_provisiones numeric(10,2),
    costo_total numeric(10,2),
    precio_venta numeric(10,2),
    rentabilidad numeric(10,2),
    margen_ganancia numeric(5,2),
    costo_contabilizar numeric(10,2),
    desc_0_precio numeric(10,2),
    desc_0_rent numeric(10,2),
    desc_5_precio numeric(10,2),
    desc_5_rent numeric(10,2),
    desc_10_precio numeric(10,2),
    desc_10_rent numeric(10,2),
    desc_15_precio numeric(10,2),
    desc_15_rent numeric(10,2),
    cantidad_total_cortada integer,
    created_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fichas_costo_pkey PRIMARY KEY (referencia),
    CONSTRAINT fichas_costo_ficha_diseno_id_fkey FOREIGN KEY (ficha_diseno_id) REFERENCES public.fichas_diseno(referencia) ON DELETE SET NULL
);

-- ============================================================================
-- 22. TABLA: fichas_cortes
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.fichas_cortes (
    id character varying(255) NOT NULL,
    ficha_costo_id character varying(255),
    numero_corte integer,
    ficha_corte character varying(255),
    fecha_corte date,
    cantidad_cortada integer,
    materia_prima text,
    mano_obra text,
    insumos_directos text,
    insumos_indirectos text,
    provisiones text,
    total_materia_prima numeric(10,2),
    total_mano_obra numeric(10,2),
    total_insumos_directos numeric(10,2),
    total_insumos_indirectos numeric(10,2),
    total_provisiones numeric(10,2),
    costo_real numeric(10,2),
    precio_venta numeric(10,2),
    rentabilidad numeric(10,2),
    costo_proyectado numeric(10,2),
    diferencia numeric(10,2),
    margen_utilidad numeric(5,2),
    created_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fichas_cortes_pkey PRIMARY KEY (id),
    CONSTRAINT fichas_cortes_ficha_costo_id_fkey FOREIGN KEY (ficha_costo_id) REFERENCES public.fichas_costo(referencia) ON DELETE CASCADE
);

-- ============================================================================
-- 23. TABLA: maletas
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.maletas (
    id character varying(255) NOT NULL,
    nombre character varying(255) NOT NULL,
    correria_id character varying(255),
    created_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT maletas_pkey PRIMARY KEY (id),
    CONSTRAINT maletas_correria_id_fkey FOREIGN KEY (correria_id) REFERENCES public.correrias(id) ON DELETE SET NULL
);

-- ============================================================================
-- 24. TABLA: maletas_referencias
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.maletas_referencias (
    id character varying(255) NOT NULL,
    maleta_id character varying(255) NOT NULL,
    referencia character varying(255) NOT NULL,
    cantidad integer DEFAULT 1,
    orden integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT maletas_referencias_pkey PRIMARY KEY (id),
    CONSTRAINT maletas_referencias_maleta_id_fkey FOREIGN KEY (maleta_id) REFERENCES public.maletas(id) ON DELETE CASCADE
);

-- ============================================================================
-- 25. TABLA: compras
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.compras (
    id character varying(50) NOT NULL,
    fecha date NOT NULL,
    referencia character varying(255),
    unidades integer,
    insumo character varying(255) NOT NULL,
    cantidad_insumo numeric(10,2) NOT NULL,
    precio_unidad numeric(10,2) NOT NULL,
    cantidad_total numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    proveedor character varying(255) NOT NULL,
    fecha_pedido date,
    observacion text,
    factura character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT compras_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- 26. TABLA: audit_log
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
    id integer NOT NULL,
    entity_type character varying(255) NOT NULL,
    entity_id character varying(255) NOT NULL,
    user_id character varying(255),
    action character varying(255) NOT NULL,
    old_values character varying(255),
    new_values character varying(255),
    changes character varying(255),
    ip_address character varying(255),
    user_agent character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT audit_log_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- 27. TABLA: user_view_preferences
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_view_preferences (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    view_order JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- ÍNDICES
-- ============================================================================

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_login_code ON public.users(login_code);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Índices para clients
CREATE INDEX IF NOT EXISTS idx_clients_seller_id ON public.clients(seller_id);
CREATE INDEX IF NOT EXISTS idx_clients_active ON public.clients(active);

-- Índices para receptions
CREATE INDEX IF NOT EXISTS idx_receptions_confeccionista_id ON public.receptions(confeccionista_id);
CREATE INDEX IF NOT EXISTS idx_receptions_created_at ON public.receptions(created_at);

-- Índices para reception_items
CREATE INDEX IF NOT EXISTS idx_reception_items_reception_id ON public.reception_items(reception_id);

-- Índices para dispatches
CREATE INDEX IF NOT EXISTS idx_dispatches_client_id ON public.dispatches(client_id);
CREATE INDEX IF NOT EXISTS idx_dispatches_correria_id ON public.dispatches(correria_id);
CREATE INDEX IF NOT EXISTS idx_dispatches_created_at ON public.dispatches(created_at);

-- Índices para dispatch_items
CREATE INDEX IF NOT EXISTS idx_dispatch_items_dispatch_id ON public.dispatch_items(dispatch_id);

-- Índices para orders
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON public.orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_correria_id ON public.orders(correria_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- Índices para order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- Índices para production_tracking
CREATE INDEX IF NOT EXISTS idx_production_tracking_correria_id ON public.production_tracking(correria_id);
CREATE INDEX IF NOT EXISTS idx_production_tracking_ref_id ON public.production_tracking(ref_id);

-- Índices para inventory_movements
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON public.inventory_movements(created_at);

-- Índices para delivery_dates
CREATE INDEX IF NOT EXISTS idx_delivery_dates_confeccionista_id ON public.delivery_dates(confeccionista_id);

-- Índices para fichas_diseno
CREATE INDEX IF NOT EXISTS idx_fichas_diseno_disenadora_id ON public.fichas_diseno(disenadora_id);

-- Índices para fichas_cortes
CREATE INDEX IF NOT EXISTS idx_fichas_cortes_ficha_costo_id ON public.fichas_cortes(ficha_costo_id);

-- Índices para maletas_referencias
CREATE INDEX IF NOT EXISTS idx_maletas_referencias_maleta_id ON public.maletas_referencias(maleta_id);
CREATE INDEX IF NOT EXISTS idx_maletas_correria_id ON public.maletas(correria_id);

-- Índices para user_view_preferences
CREATE INDEX IF NOT EXISTS idx_user_view_preferences_user_id ON public.user_view_preferences(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger para actualizar updated_at en user_view_preferences
CREATE OR REPLACE FUNCTION update_user_view_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_view_preferences_timestamp ON public.user_view_preferences;
CREATE TRIGGER trigger_update_user_view_preferences_timestamp
BEFORE UPDATE ON public.user_view_preferences
FOR EACH ROW
EXECUTE FUNCTION update_user_view_preferences_timestamp();

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Mostrar resumen de tablas creadas
SELECT 
    'VERIFICACIÓN COMPLETADA' as status,
    COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Mostrar todas las tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
