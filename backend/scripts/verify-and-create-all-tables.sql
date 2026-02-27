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
-- 17. TABLA: inventory_movements (Tabla mejorada)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    insumo character varying(255) NOT NULL,
    cantidad numeric(10,2) NOT NULL,
    valor_unitario numeric(12,2) NOT NULL,
    valor_total numeric(12,2) NOT NULL,
    proveedor character varying(255),
    referencia_destino character varying(255),
    remision_factura character varying(255),
    movimiento character varying(50) NOT NULL,
    compra_id character varying(50),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT inventory_movements_compra_id_fkey FOREIGN KEY (compra_id) REFERENCES public.compras(id) ON DELETE SET NULL,
    CONSTRAINT inventory_movements_movimiento_check CHECK (movimiento IN ('Entrada', 'Salida'))
);

-- ============================================================================
-- 18. TABLA: delivery_dates
-- ============================================================================
-- NOTA: confeccionista_id y reference_id son texto libre (sin restricción de clave foránea)
-- Esto permite guardar confeccionistas y referencias como texto sin que existan en las tablas maestras
CREATE TABLE IF NOT EXISTS public.delivery_dates (
    id character varying(255) NOT NULL,
    confeccionista_id character varying(255) NOT NULL,
    reference_id character varying(255) NOT NULL,
    quantity integer NOT NULL,
    send_date character varying(255) NOT NULL,
    expected_date character varying(255) NOT NULL,
    delivery_date character varying(255),
    process character varying(255),
    observation character varying(255),
    created_by character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT delivery_dates_pkey PRIMARY KEY (id)
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
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    referencia character varying(50) NOT NULL UNIQUE,
    disenadora_id character varying(255),
    descripcion text,
    marca character varying(255),
    novedad character varying(255),
    muestra_1 character varying(500),
    muestra_2 character varying(500),
    observaciones text,
    foto_1 character varying(500),
    foto_2 character varying(500),
    materia_prima jsonb DEFAULT '[]'::jsonb,
    mano_obra jsonb DEFAULT '[]'::jsonb,
    insumos_directos jsonb DEFAULT '[]'::jsonb,
    insumos_indirectos jsonb DEFAULT '[]'::jsonb,
    provisiones jsonb DEFAULT '[]'::jsonb,
    total_materia_prima numeric(12,2) DEFAULT 0,
    total_mano_obra numeric(12,2) DEFAULT 0,
    total_insumos_directos numeric(12,2) DEFAULT 0,
    total_insumos_indirectos numeric(12,2) DEFAULT 0,
    total_provisiones numeric(12,2) DEFAULT 0,
    costo_total numeric(12,2) DEFAULT 0,
    importada boolean DEFAULT false,
    created_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fichas_diseno_disenadora_id_fkey FOREIGN KEY (disenadora_id) REFERENCES public.disenadoras(id) ON DELETE SET NULL
);

-- ============================================================================
-- 21. TABLA: fichas_costo
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.fichas_costo (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    referencia character varying(50) NOT NULL UNIQUE,
    ficha_diseno_id uuid,
    descripcion text,
    marca character varying(255),
    novedad character varying(255),
    muestra_1 character varying(500),
    muestra_2 character varying(500),
    observaciones text,
    foto_1 character varying(500),
    foto_2 character varying(500),
    materia_prima jsonb DEFAULT '[]'::jsonb,
    mano_obra jsonb DEFAULT '[]'::jsonb,
    insumos_directos jsonb DEFAULT '[]'::jsonb,
    insumos_indirectos jsonb DEFAULT '[]'::jsonb,
    provisiones jsonb DEFAULT '[]'::jsonb,
    total_materia_prima numeric(12,2) DEFAULT 0,
    total_mano_obra numeric(12,2) DEFAULT 0,
    total_insumos_directos numeric(12,2) DEFAULT 0,
    total_insumos_indirectos numeric(12,2) DEFAULT 0,
    total_provisiones numeric(12,2) DEFAULT 0,
    costo_total numeric(12,2) DEFAULT 0,
    precio_venta numeric(12,2) DEFAULT 0,
    rentabilidad numeric(5,2) DEFAULT 49,
    margen_ganancia numeric(12,2) DEFAULT 0,
    costo_contabilizar numeric(12,2) DEFAULT 0,
    desc_0_precio numeric(12,2) DEFAULT 0,
    desc_0_rent numeric(5,2) DEFAULT 0,
    desc_5_precio numeric(12,2) DEFAULT 0,
    desc_5_rent numeric(5,2) DEFAULT 0,
    desc_10_precio numeric(12,2) DEFAULT 0,
    desc_10_rent numeric(5,2) DEFAULT 0,
    desc_15_precio numeric(12,2) DEFAULT 0,
    desc_15_rent numeric(5,2) DEFAULT 0,
    cantidad_total_cortada integer DEFAULT 0,
    created_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fichas_costo_ficha_diseno_id_fkey FOREIGN KEY (ficha_diseno_id) REFERENCES public.fichas_diseno(id) ON DELETE SET NULL
);

-- ============================================================================
-- 22. TABLA: fichas_cortes
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.fichas_cortes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ficha_costo_id uuid NOT NULL,
    numero_corte integer NOT NULL,
    fecha_corte date,
    cantidad_cortada integer DEFAULT 0,
    materia_prima jsonb DEFAULT '[]'::jsonb,
    mano_obra jsonb DEFAULT '[]'::jsonb,
    insumos_directos jsonb DEFAULT '[]'::jsonb,
    insumos_indirectos jsonb DEFAULT '[]'::jsonb,
    provisiones jsonb DEFAULT '[]'::jsonb,
    total_materia_prima numeric(12,2) DEFAULT 0,
    total_mano_obra numeric(12,2) DEFAULT 0,
    total_insumos_directos numeric(12,2) DEFAULT 0,
    total_insumos_indirectos numeric(12,2) DEFAULT 0,
    total_provisiones numeric(12,2) DEFAULT 0,
    costo_real numeric(12,2) DEFAULT 0,
    precio_venta numeric(12,2) DEFAULT 0,
    rentabilidad numeric(5,2) DEFAULT 0,
    costo_proyectado numeric(12,2) DEFAULT 0,
    diferencia numeric(12,2) DEFAULT 0,
    margen_utilidad numeric(5,2) DEFAULT 0,
    created_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fichas_cortes_ficha_costo_id_fkey FOREIGN KEY (ficha_costo_id) REFERENCES public.fichas_costo(id) ON DELETE CASCADE,
    CONSTRAINT fichas_cortes_unique_numero UNIQUE (ficha_costo_id, numero_corte)
);

-- ============================================================================
-- 23. TABLA: maletas
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.maletas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre character varying(255) NOT NULL,
    correria_id character varying(255),
    created_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT maletas_correria_id_fkey FOREIGN KEY (correria_id) REFERENCES public.correrias(id) ON DELETE SET NULL
);

-- ============================================================================
-- 24. TABLA: maletas_referencias
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.maletas_referencias (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    maleta_id uuid NOT NULL,
    referencia character varying(50) NOT NULL,
    cantidad integer DEFAULT 1,
    orden integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT maletas_referencias_maleta_id_fkey FOREIGN KEY (maleta_id) REFERENCES public.maletas(id) ON DELETE CASCADE,
    CONSTRAINT maletas_referencias_unique UNIQUE (maleta_id, referencia)
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
    id SERIAL PRIMARY KEY,
    entity_type character varying(255) NOT NULL,
    entity_id character varying(255) NOT NULL,
    user_id character varying(255),
    action character varying(255) NOT NULL,
    old_values character varying(255),
    new_values character varying(255),
    changes character varying(255),
    ip_address character varying(255),
    user_agent character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 27. TABLA: user_view_preferences
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_view_preferences (
    id SERIAL PRIMARY KEY,
    user_id character varying(255) NOT NULL UNIQUE,
    view_order jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_view_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- ============================================================================
-- 28. TABLA: messages
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id SERIAL PRIMARY KEY,
    sender_id character varying(255) NOT NULL,
    receiver_id character varying(255) NOT NULL,
    content text NOT NULL,
    read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT messages_check_different_users CHECK (sender_id != receiver_id)
);

-- ============================================================================
-- 29. TABLA: user_sessions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id SERIAL PRIMARY KEY,
    user_id character varying(255) NOT NULL,
    socket_id character varying(255) NOT NULL,
    status character varying(20) DEFAULT 'online'::character varying,
    connected_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_activity timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT user_sessions_user_socket_unique UNIQUE (user_id, socket_id)
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
CREATE INDEX IF NOT EXISTS idx_inventory_movements_insumo ON public.inventory_movements(LOWER(insumo));
CREATE INDEX IF NOT EXISTS idx_inventory_movements_referencia ON public.inventory_movements(LOWER(referencia_destino));
CREATE INDEX IF NOT EXISTS idx_inventory_movements_movimiento ON public.inventory_movements(movimiento);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_compra_id ON public.inventory_movements(compra_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON public.inventory_movements(created_at);

-- Índices para delivery_dates
CREATE INDEX IF NOT EXISTS idx_delivery_dates_confeccionista_id ON public.delivery_dates(confeccionista_id);
CREATE INDEX IF NOT EXISTS idx_delivery_dates_reference_id ON public.delivery_dates(reference_id);
CREATE INDEX IF NOT EXISTS idx_delivery_dates_send_date ON public.delivery_dates(send_date);
CREATE INDEX IF NOT EXISTS idx_delivery_dates_expected_date ON public.delivery_dates(expected_date);

-- Índices para fichas_diseno
CREATE INDEX IF NOT EXISTS idx_fichas_diseno_disenadora_id ON public.fichas_diseno(disenadora_id);
CREATE INDEX IF NOT EXISTS idx_fichas_diseno_referencia ON public.fichas_diseno(referencia);

-- Índices para fichas_costo
CREATE INDEX IF NOT EXISTS idx_fichas_costo_referencia ON public.fichas_costo(referencia);
CREATE INDEX IF NOT EXISTS idx_fichas_costo_ficha_diseno_id ON public.fichas_costo(ficha_diseno_id);

-- Índices para fichas_cortes
CREATE INDEX IF NOT EXISTS idx_fichas_cortes_ficha_costo_id ON public.fichas_cortes(ficha_costo_id);

-- Índices para maletas
CREATE INDEX IF NOT EXISTS idx_maletas_correria_id ON public.maletas(correria_id);

-- Índices para maletas_referencias
CREATE INDEX IF NOT EXISTS idx_maletas_referencias_maleta_id ON public.maletas_referencias(maleta_id);

-- Índices para user_view_preferences
CREATE INDEX IF NOT EXISTS idx_user_view_preferences_user_id ON public.user_view_preferences(user_id);

-- Índices para messages
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_read ON public.messages(read);

-- Índices para user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_status ON public.user_sessions(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON public.user_sessions(last_activity);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger para actualizar updated_at en user_view_preferences
CREATE OR REPLACE FUNCTION public.update_user_view_preferences_timestamp()
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
EXECUTE FUNCTION public.update_user_view_preferences_timestamp();

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Mostrar resumen de tablas creadas
SELECT 
    'VERIFICACIÓN COMPLETADA' as status,
    COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Mostrar todas las tablas (debe haber 29 tablas)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
