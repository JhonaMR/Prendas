-- ============================================================================
-- SCRIPT DE VERIFICACIÓN Y CREACIÓN DE TABLAS - INVENTARIO
-- ============================================================================
-- Este script verifica que todas las tablas, índices y constraints existan
-- Si algo no existe, lo crea automáticamente
-- Útil para sincronizar la BD entre diferentes máquinas
-- Actualizado: 2026-05-19 - Incluye todas las tablas e índices actuales
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
    active integer,
    fecha_inicio date,
    fecha_fin date,
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
    incomplete_units integer DEFAULT 0,
    is_packed boolean DEFAULT false,
    bag_quantity integer DEFAULT 0,
    received_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    affects_inventory boolean DEFAULT true,
    arrival_date date NOT NULL DEFAULT '2026-01-01',
    observacion text DEFAULT NULL,
    has_muestra boolean NOT NULL DEFAULT false,
    CONSTRAINT receptions_pkey PRIMARY KEY (id),
    CONSTRAINT receptions_confeccionista_id_fkey FOREIGN KEY (confeccionista_id) REFERENCES public.confeccionistas(id) ON DELETE SET NULL
);

-- Columnas agregadas por migraciones (por si la tabla ya existe sin ellas)
ALTER TABLE public.receptions ADD COLUMN IF NOT EXISTS arrival_date date NOT NULL DEFAULT '2026-01-01';
ALTER TABLE public.receptions ADD COLUMN IF NOT EXISTS observacion text DEFAULT NULL;
ALTER TABLE public.receptions ADD COLUMN IF NOT EXISTS has_muestra boolean NOT NULL DEFAULT false;
ALTER TABLE public.receptions ADD COLUMN IF NOT EXISTS segundas_units integer DEFAULT 0;

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
    id integer NOT NULL,
    return_reception_id character varying(255) NOT NULL,
    reference character varying(255) NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT return_reception_items_pkey PRIMARY KEY (id),
    CONSTRAINT return_reception_items_return_reception_id_fkey FOREIGN KEY (return_reception_id) REFERENCES public.return_receptions(id) ON DELETE CASCADE
);

-- Create sequence for return_reception_items.id
CREATE SEQUENCE IF NOT EXISTS public.return_reception_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.return_reception_items_id_seq OWNED BY public.return_reception_items.id;
ALTER TABLE public.return_reception_items ALTER COLUMN id SET DEFAULT nextval('public.return_reception_items_id_seq'::regclass);

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
    checked_by character varying(255) DEFAULT '0',
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
    start_date date,
    end_date date,
    porcentaje_oficial numeric(5,2),
    porcentaje_remision numeric(5,2),
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
    novedades text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT production_tracking_pkey PRIMARY KEY (id),
    CONSTRAINT production_tracking_correria_id_fkey FOREIGN KEY (correria_id) REFERENCES public.correrias(id) ON DELETE SET NULL
);

-- Columna agregada por migración (por si la tabla ya existe sin ella)
ALTER TABLE public.production_tracking ADD COLUMN IF NOT EXISTS novedades text;

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
    estado_revision character varying(10) DEFAULT NULL,
    created_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fichas_costo_ficha_diseno_id_fkey FOREIGN KEY (ficha_diseno_id) REFERENCES public.fichas_diseno(id) ON DELETE SET NULL
);

-- Columna agregada por migración (por si la tabla ya existe sin ella)
ALTER TABLE public.fichas_costo ADD COLUMN IF NOT EXISTS estado_revision character varying(10) DEFAULT NULL;

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
CREATE INDEX IF NOT EXISTS idx_receptions_arrival_date ON public.receptions(arrival_date);

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
CREATE INDEX IF NOT EXISTS idx_orders_start_date ON public.orders(start_date);
CREATE INDEX IF NOT EXISTS idx_orders_end_date ON public.orders(end_date);

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

-- ============================================================================
-- 30. TABLA: correria_novedades
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.correria_novedades (
    id SERIAL PRIMARY KEY,
    correria_id character varying(255) NOT NULL,
    contenido text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT correria_novedades_correria_id_fkey FOREIGN KEY (correria_id) REFERENCES public.correrias(id) ON DELETE CASCADE
);

-- Índices para user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_status ON public.user_sessions(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON public.user_sessions(last_activity);

-- Índices para correria_novedades
CREATE INDEX IF NOT EXISTS idx_correria_novedades_correria_id ON public.correria_novedades(correria_id);
CREATE INDEX IF NOT EXISTS idx_correria_novedades_created_at ON public.correria_novedades(created_at);

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
-- 31. TABLA: cuentas_bancarias
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cuentas_bancarias (
    id         serial PRIMARY KEY,
    cedula     character varying(50),
    nombre     character varying(255) NOT NULL,
    cuenta     character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cuentas_bancarias_nombre ON public.cuentas_bancarias(LOWER(nombre));
CREATE INDEX IF NOT EXISTS idx_cuentas_bancarias_cedula ON public.cuentas_bancarias(cedula);

-- ============================================================================
-- 32. TABLA: pagos_programados
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pagos_programados (
    id                 serial PRIMARY KEY,
    fecha              date          NOT NULL,
    fecha_original     date,
    cuenta_bancaria_id integer REFERENCES public.cuentas_bancarias(id) ON DELETE SET NULL,
    cedula             character varying(50)  NOT NULL,
    nombre             character varying(255) NOT NULL,
    cuenta             character varying(255) NOT NULL,
    detalle_inicial    character varying(500),
    bruto_of           numeric(15,2) NOT NULL DEFAULT 0,
    bruto_ml           numeric(15,2) NOT NULL DEFAULT 0,
    orden              integer       NOT NULL DEFAULT 0,
    created_at         timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at         timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pagos_programados_fecha             ON public.pagos_programados(fecha);
CREATE INDEX IF NOT EXISTS idx_pagos_programados_nombre            ON public.pagos_programados(LOWER(nombre));
CREATE INDEX IF NOT EXISTS idx_pagos_programados_cuenta_bancaria_id ON public.pagos_programados(cuenta_bancaria_id);

-- ============================================================================
-- 33. TABLA: descuentos_pago
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.descuentos_pago (
    id         serial PRIMARY KEY,
    pago_id    integer NOT NULL REFERENCES public.pagos_programados(id) ON DELETE CASCADE,
    tipo       character varying(2)   NOT NULL CHECK (tipo IN ('OF', 'ML')),
    etiqueta   character varying(255) NOT NULL DEFAULT '',
    monto      numeric(15,2)          NOT NULL DEFAULT 0,
    orden      integer                NOT NULL DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_descuentos_pago_pago_id ON public.descuentos_pago(pago_id);
CREATE INDEX IF NOT EXISTS idx_descuentos_pago_tipo    ON public.descuentos_pago(tipo);

-- ============================================================================
-- 34. TABLA: pago_lotes_config
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pago_lotes_config (
    id          serial PRIMARY KEY,
    clave       character varying(100) NOT NULL UNIQUE,
    valor       numeric(15,2) NOT NULL,
    descripcion character varying(255),
    updated_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by  character varying(255)
);

INSERT INTO public.pago_lotes_config (clave, valor, descripcion) VALUES
    ('pct_of',       40,      'Porcentaje del pago que va al banco OF'),
    ('pct_ml',       60,      'Porcentaje del pago que va al banco ML'),
    ('base_rte_fte', 105000,  'Base mínima para aplicar retención en la fuente (6%)')
ON CONFLICT (clave) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_pago_lotes_config_clave ON public.pago_lotes_config(clave);

-- ============================================================================
-- 35. TABLA: producto_en_proceso
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.producto_en_proceso (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    confeccionista   character varying(255) NOT NULL DEFAULT '',
    remision         character varying(100) NOT NULL DEFAULT '',
    ref              character varying(100) NOT NULL DEFAULT '',
    salida           numeric(10,2),
    fecha_remision   date,
    entrega          numeric(10,2),
    segundas         numeric(10,2),
    vta              numeric(10,2),
    cobrado          numeric(10,2),
    incompleto       numeric(10,2),
    fecha_llegada    date,
    talegos_salida   numeric(10,2),
    talegos_entrega  numeric(10,2),
    muestras_salida  numeric(10,2),
    muestras_entrega numeric(10,2),
    row_highlight    character varying(10),
    cell_highlights  jsonb NOT NULL DEFAULT '{}'::jsonb,
    cell_comments    jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_by       character varying(255),
    created_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT producto_en_proceso_row_highlight_check
        CHECK (row_highlight IN ('yellow', 'red') OR row_highlight IS NULL)
);

CREATE INDEX IF NOT EXISTS idx_pep_confeccionista ON public.producto_en_proceso(LOWER(confeccionista));
CREATE INDEX IF NOT EXISTS idx_pep_ref            ON public.producto_en_proceso(ref);
CREATE INDEX IF NOT EXISTS idx_pep_remision       ON public.producto_en_proceso(remision);
CREATE INDEX IF NOT EXISTS idx_pep_fecha_remision ON public.producto_en_proceso(fecha_remision);
CREATE INDEX IF NOT EXISTS idx_pep_fecha_llegada  ON public.producto_en_proceso(fecha_llegada);
CREATE INDEX IF NOT EXISTS idx_pep_pendientes     ON public.producto_en_proceso(fecha_llegada) WHERE fecha_llegada IS NULL;
CREATE INDEX IF NOT EXISTS idx_pep_conf_llegada   ON public.producto_en_proceso(confeccionista, fecha_llegada);

-- ============================================================================
-- 36. TABLA: transportistas
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.transportistas (
    id          character varying(50)  PRIMARY KEY,
    nombre      character varying(255) NOT NULL,
    celular     character varying(50)  NOT NULL DEFAULT '',
    picoyplaca  character varying(50)  NOT NULL DEFAULT '',
    color_key   character varying(30)  NOT NULL DEFAULT 'red',
    created_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transportistas_nombre ON public.transportistas(LOWER(nombre));

-- ============================================================================
-- 37. TABLA: talleres
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.talleres (
    id          character varying(50)  PRIMARY KEY,
    nombre      character varying(255) NOT NULL,
    celular     character varying(50)  NOT NULL DEFAULT '',
    direccion   character varying(255) NOT NULL DEFAULT '',
    sector      character varying(100) NOT NULL DEFAULT '',
    estado      character varying(20)  NOT NULL DEFAULT 'activo',
    created_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_talleres_nombre ON public.talleres(LOWER(nombre));
CREATE INDEX IF NOT EXISTS idx_talleres_estado ON public.talleres(estado);

-- ============================================================================
-- 38. TABLA: rutas_transporte
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rutas_transporte (
    id               character varying(50) PRIMARY KEY,
    fecha            date        NOT NULL,
    transportista_id character varying(50) NOT NULL REFERENCES public.transportistas(id) ON DELETE CASCADE,
    created_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rutas_transporte_fecha         ON public.rutas_transporte(fecha);
CREATE INDEX IF NOT EXISTS idx_rutas_transporte_transportista ON public.rutas_transporte(transportista_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rutas_transporte_unique ON public.rutas_transporte(fecha, transportista_id);

-- ============================================================================
-- 39. TABLA: rutas_transporte_items
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rutas_transporte_items (
    id          character varying(50)  PRIMARY KEY,
    ruta_id     character varying(50)  NOT NULL REFERENCES public.rutas_transporte(id) ON DELETE CASCADE,
    taller      character varying(255) NOT NULL DEFAULT '',
    celular     character varying(50)  NOT NULL DEFAULT '',
    direccion   character varying(255) NOT NULL DEFAULT '',
    sector      character varying(100) NOT NULL DEFAULT '',
    detalle     character varying(500) NOT NULL DEFAULT '',
    servicio    character varying(255) NOT NULL DEFAULT '',
    created_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rutas_transporte_items_ruta ON public.rutas_transporte_items(ruta_id);

-- ============================================================================
-- 40. TABLA: control_telas_produccion
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.control_telas_produccion (
    id                  uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    tela                varchar(255) NOT NULL DEFAULT '',
    color               varchar(255) NOT NULL DEFAULT '',
    und_medida          varchar(1)   NOT NULL DEFAULT 'M' CHECK (und_medida IN ('M','K')),
    rdmto               numeric(10,4),
    subtotal            numeric(14,4),
    iva                 numeric(14,4),
    precio_total_kilos  numeric(14,4),
    precio_total_metros numeric(14,4),
    proveedor           varchar(255) NOT NULL DEFAULT '',
    fecha_compra        date,
    iva_incluido        varchar(2)   NOT NULL DEFAULT 'S' CHECK (iva_incluido IN ('S','N')),
    fe_or_rm            varchar(100) NOT NULL DEFAULT '',
    created_by          varchar(255),
    created_at          timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 41. TABLA: control_telas_muestras
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.control_telas_muestras (
    id                  uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    tela                varchar(255) NOT NULL DEFAULT '',
    color               varchar(255) NOT NULL DEFAULT '',
    und_medida          varchar(1)   NOT NULL DEFAULT 'M' CHECK (und_medida IN ('M','K')),
    rdmto               numeric(10,4),
    subtotal            numeric(14,4),
    iva                 numeric(14,4),
    total_precio_kilos  numeric(14,4),
    total_precio_metros numeric(14,4),
    proveedor           varchar(255) NOT NULL DEFAULT '',
    fecha_compra        date,
    factura_no          varchar(100) NOT NULL DEFAULT '',
    solicita_recibe     varchar(255) NOT NULL DEFAULT '',
    usada_en_produccion varchar(255) NOT NULL DEFAULT '',
    created_by          varchar(255),
    created_at          timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 42. TABLA: corte_registros
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.corte_registros (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_ficha      varchar(50) NOT NULL UNIQUE,
    fecha_corte       date NOT NULL,
    referencia        varchar(50) NOT NULL,
    descripcion       varchar(255),
    cantidad_cortada  integer NOT NULL DEFAULT 0,
    created_by        varchar(255),
    updated_by        varchar(255),
    created_at        timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at        timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 43. TABLA: salidas_bodega
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.salidas_bodega (
    id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha            date         NOT NULL DEFAULT CURRENT_DATE,
    referencia       varchar(100) NOT NULL,
    cantidad         integer      NOT NULL CHECK (cantidad > 0),
    talla            varchar(10)  NOT NULL DEFAULT '' CHECK (talla IN ('','2-4','6-8','10-12','14-16','S','M','L','XL','XXL','XXXL')),
    quien_recibe     varchar(255) NOT NULL DEFAULT '',
    fecha_devolucion date,
    created_by       varchar(255),
    created_at       timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 44. TABLA: order_notes
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.order_notes (
    order_id    varchar(255) PRIMARY KEY REFERENCES public.orders(id) ON DELETE CASCADE,
    contacto    varchar(255),
    novedad     text,
    updated_at  timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by  varchar(255)
);

-- ============================================================================
-- 45. TABLA: fichas_confeccion
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.fichas_confeccion (
    id                  varchar(50)  PRIMARY KEY,
    referencia          varchar(100) NOT NULL,
    fecha_envio         varchar(50),
    fecha_entrega       varchar(50),
    n_corte             varchar(100),
    cantidad            varchar(50),
    ficha_realizada_por varchar(255),
    descripcion         text,
    precio_confeccion   varchar(50),
    precio_empaque      varchar(50),
    empaque_activo      boolean         NOT NULL DEFAULT true,
    precio_manualidad   varchar(50),
    foto_seleccionada   smallint        NOT NULL DEFAULT 1,
    texto_piezas        varchar(500),
    talla1              varchar(20)     NOT NULL DEFAULT 'S',
    talla2              varchar(20)     NOT NULL DEFAULT 'M',
    talla3              varchar(20)     NOT NULL DEFAULT 'L',
    filas_medidas       jsonb,
    combinacion_colores text,
    confeccion          text,
    nota_verificar      text,
    consumo_sesgo       text,
    nota_final          text,
    created_by          varchar(255),
    created_at          timestamp       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          timestamp       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 46. TABLA: maletas_referencias_recibidas
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.maletas_referencias_recibidas (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    maleta_id uuid NOT NULL REFERENCES public.maletas(id) ON DELETE CASCADE,
    referencia character varying(255) NOT NULL,
    recibido_por character varying(255),
    fecha_recepcion timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(maleta_id, referencia)
);

-- ============================================================================
-- ACTUALIZACIÓN DE COLUMNAS EN TABLAS EXISTENTES
-- ============================================================================

-- Agregar columnas a confeccionistas si no existen
ALTER TABLE public.confeccionistas ADD COLUMN IF NOT EXISTS "ConsecRem" INTEGER NOT NULL DEFAULT 0;

-- Agregar columnas a talleres si no existen
ALTER TABLE public.talleres ADD COLUMN IF NOT EXISTS "PrecioCarro" VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE public.talleres ADD COLUMN IF NOT EXISTS "PrecioMoto"  VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE public.talleres ADD COLUMN IF NOT EXISTS tipo_vehiculo VARCHAR(20) NOT NULL DEFAULT 'carro';

-- Agregar columnas a transportistas si no existen
ALTER TABLE public.transportistas ADD COLUMN IF NOT EXISTS tipo_vehiculo VARCHAR(20) NOT NULL DEFAULT 'carro';

-- Agregar columnas a maletas si no existen
ALTER TABLE public.maletas ADD COLUMN IF NOT EXISTS estado character varying(50) DEFAULT 'enviada';
ALTER TABLE public.maletas ADD COLUMN IF NOT EXISTS recibido_por character varying(255);
ALTER TABLE public.maletas ADD COLUMN IF NOT EXISTS fecha_recepcion timestamp without time zone;
ALTER TABLE public.maletas ADD COLUMN IF NOT EXISTS num_referencias_recibidas integer DEFAULT 0;

-- Agregar columnas a clients si no existen
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS cod_of varchar(255);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS cod_rm varchar(255);

-- Agregar columnas a fichas_diseno si no existen
ALTER TABLE public.fichas_diseno ADD COLUMN IF NOT EXISTS foto_3      varchar(500);
ALTER TABLE public.fichas_diseno ADD COLUMN IF NOT EXISTS archivo_psd varchar(500);

-- Agregar columnas a fichas_costo si no existen
ALTER TABLE public.fichas_costo ADD COLUMN IF NOT EXISTS foto_3      varchar(500);
ALTER TABLE public.fichas_costo ADD COLUMN IF NOT EXISTS archivo_psd varchar(500);

-- Agregar columnas a correrias si no existen
ALTER TABLE public.correrias ADD COLUMN IF NOT EXISTS fecha_inicio DATE;
ALTER TABLE public.correrias ADD COLUMN IF NOT EXISTS fecha_fin DATE;

-- ============================================================================
-- ÍNDICES ADICIONALES
-- ============================================================================

-- Índices para control_telas_produccion
CREATE INDEX IF NOT EXISTS idx_ctp_tela      ON public.control_telas_produccion(LOWER(tela));
CREATE INDEX IF NOT EXISTS idx_ctp_prov      ON public.control_telas_produccion(LOWER(proveedor));
CREATE INDEX IF NOT EXISTS idx_ctp_fecha     ON public.control_telas_produccion(fecha_compra);

-- Índices para control_telas_muestras
CREATE INDEX IF NOT EXISTS idx_ctm_tela      ON public.control_telas_muestras(LOWER(tela));
CREATE INDEX IF NOT EXISTS idx_ctm_prov      ON public.control_telas_muestras(LOWER(proveedor));
CREATE INDEX IF NOT EXISTS idx_ctm_fecha     ON public.control_telas_muestras(fecha_compra);

-- Índices para corte_registros
CREATE INDEX IF NOT EXISTS idx_corte_referencia    ON public.corte_registros(referencia);
CREATE INDEX IF NOT EXISTS idx_corte_numero_ficha  ON public.corte_registros(numero_ficha);
CREATE INDEX IF NOT EXISTS idx_corte_fecha_corte   ON public.corte_registros(fecha_corte);
CREATE INDEX IF NOT EXISTS idx_corte_created_at    ON public.corte_registros(created_at DESC);

-- Índices para salidas_bodega
CREATE INDEX IF NOT EXISTS idx_sb_referencia  ON public.salidas_bodega(LOWER(referencia));
CREATE INDEX IF NOT EXISTS idx_sb_fecha       ON public.salidas_bodega(fecha);
CREATE INDEX IF NOT EXISTS idx_sb_devolucion  ON public.salidas_bodega(fecha_devolucion);
CREATE INDEX IF NOT EXISTS idx_sb_quien       ON public.salidas_bodega(LOWER(quien_recibe));

-- Índices para order_notes
CREATE INDEX IF NOT EXISTS idx_order_notes_order_id ON public.order_notes(order_id);

-- Índices para fichas_confeccion
CREATE INDEX IF NOT EXISTS idx_fichas_confeccion_referencia ON public.fichas_confeccion(referencia);

-- Índices para maletas_referencias_recibidas
CREATE INDEX IF NOT EXISTS idx_maletas_referencias_recibidas_maleta_id ON public.maletas_referencias_recibidas(maleta_id);
CREATE INDEX IF NOT EXISTS idx_maletas_referencias_recibidas_referencia ON public.maletas_referencias_recibidas(referencia);

-- Índices adicionales para transportistas
CREATE INDEX IF NOT EXISTS idx_transportistas_tipo_vehiculo ON public.transportistas(tipo_vehiculo);

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Mostrar resumen de tablas creadas
SELECT 
    'VERIFICACIÓN COMPLETADA' as status,
    COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Mostrar todas las tablas (debe haber 46 tablas)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
