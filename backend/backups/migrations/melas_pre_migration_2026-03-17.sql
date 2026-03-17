--
-- PostgreSQL database dump
--

\restrict Ng8muxq0gCAURHnTJBFGgNFMryuCcKIhLkOlkXHQkzuxzgCKA1o2mvKivclHaXC

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: update_user_view_preferences_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_user_view_preferences_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    NEW.updated_at = CURRENT_TIMESTAMP;

    RETURN NEW;

END;

$$;


ALTER FUNCTION public.update_user_view_preferences_timestamp() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_log (
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
    created_at timestamp without time zone
);


ALTER TABLE public.audit_log OWNER TO postgres;

--
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    nit character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    city character varying(255) NOT NULL,
    seller character varying(255),
    created_at timestamp without time zone,
    seller_id character varying(255),
    updated_at timestamp without time zone,
    active boolean DEFAULT true
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- Name: compras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compras (
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
    precio_real_insumo_und character varying(50) DEFAULT 'pendiente'::character varying,
    afecta_inventario boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.compras OWNER TO postgres;

--
-- Name: confeccionistas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.confeccionistas (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    city character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    score character varying(255) NOT NULL,
    active integer NOT NULL,
    created_at timestamp without time zone
);


ALTER TABLE public.confeccionistas OWNER TO postgres;

--
-- Name: correria_catalog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.correria_catalog (
    id character varying(255) NOT NULL,
    correria_id character varying(255) NOT NULL,
    reference_id character varying(255) NOT NULL,
    added_at timestamp without time zone
);


ALTER TABLE public.correria_catalog OWNER TO postgres;

--
-- Name: correrias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.correrias (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    year character varying(255) NOT NULL,
    active integer NOT NULL,
    created_at timestamp without time zone
);


ALTER TABLE public.correrias OWNER TO postgres;

--
-- Name: delivery_dates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.delivery_dates (
    id character varying(255) NOT NULL,
    confeccionista_id character varying(255) NOT NULL,
    reference_id character varying(255) NOT NULL,
    quantity integer NOT NULL,
    send_date character varying(255) NOT NULL,
    expected_date character varying(255) NOT NULL,
    delivery_date character varying(255),
    process character varying(255),
    observation character varying(255),
    created_at timestamp without time zone,
    created_by character varying(255) NOT NULL
);


ALTER TABLE public.delivery_dates OWNER TO postgres;

--
-- Name: disenadoras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.disenadoras (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(255) NOT NULL,
    cedula character varying(20),
    telefono character varying(20),
    activa boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.disenadoras OWNER TO postgres;

--
-- Name: dispatch_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dispatch_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dispatch_items_id_seq OWNER TO postgres;

--
-- Name: dispatch_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dispatch_items (
    id integer DEFAULT nextval('public.dispatch_items_id_seq'::regclass) NOT NULL,
    dispatch_id character varying(255) NOT NULL,
    reference character varying(255) NOT NULL,
    quantity integer NOT NULL,
    sale_price numeric(10,2) DEFAULT 0
);


ALTER TABLE public.dispatch_items OWNER TO postgres;

--
-- Name: dispatches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dispatches (
    id character varying(255) NOT NULL,
    client_id character varying(255) NOT NULL,
    correria_id character varying(255) NOT NULL,
    invoice_no character varying(255) NOT NULL,
    remission_no character varying(255) NOT NULL,
    dispatched_by character varying(255) NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.dispatches OWNER TO postgres;

--
-- Name: fichas_cortes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fichas_cortes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
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
    ficha_corte character varying(255)
);


ALTER TABLE public.fichas_cortes OWNER TO postgres;

--
-- Name: fichas_costo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fichas_costo (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    referencia character varying(50) NOT NULL,
    ficha_diseno_id uuid,
    descripcion text,
    marca character varying(255),
    novedad character varying(255),
    muestra_1 character varying(255),
    muestra_2 character varying(255),
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
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.fichas_costo OWNER TO postgres;

--
-- Name: fichas_diseno; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fichas_diseno (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    referencia character varying(50) NOT NULL,
    disenadora_id uuid,
    descripcion text,
    marca character varying(255),
    novedad character varying(255),
    muestra_1 character varying(255),
    muestra_2 character varying(255),
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
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.fichas_diseno OWNER TO postgres;

--
-- Name: inventory_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_movements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
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
    CONSTRAINT inventory_movements_movimiento_check CHECK (((movimiento)::text = ANY (ARRAY[('Entrada'::character varying)::text, ('Salida'::character varying)::text])))
);


ALTER TABLE public.inventory_movements OWNER TO postgres;

--
-- Name: maletas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maletas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(255) NOT NULL,
    correria_id character varying(255),
    created_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.maletas OWNER TO postgres;

--
-- Name: maletas_referencias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maletas_referencias (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    maleta_id uuid NOT NULL,
    referencia character varying(50) NOT NULL,
    orden integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.maletas_referencias OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    sender_id character varying(255) NOT NULL,
    receiver_id character varying(255) NOT NULL,
    content text NOT NULL,
    read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT check_different_users CHECK (((sender_id)::text <> (receiver_id)::text))
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    order_id character varying(255) NOT NULL,
    reference character varying(255) NOT NULL,
    quantity integer NOT NULL,
    sale_price numeric(10,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id character varying(255) NOT NULL,
    client_id character varying(255) NOT NULL,
    seller_id character varying(255) NOT NULL,
    correria_id character varying(255) NOT NULL,
    total_value numeric(10,2) NOT NULL,
    created_at character varying(255) NOT NULL,
    settled_by character varying(255) NOT NULL,
    order_number integer,
    start_date date,
    end_date date,
    porcentaje_oficial numeric(5,2),
    porcentaje_remision numeric(5,2)
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: product_references; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_references (
    id character varying(255) NOT NULL,
    description character varying(255) NOT NULL,
    price numeric(10,2) NOT NULL,
    designer character varying(255) NOT NULL,
    cloth1 character varying(255),
    avg_cloth1 numeric(10,2),
    cloth2 character varying(255),
    avg_cloth2 numeric(10,2),
    active integer NOT NULL,
    created_at timestamp without time zone
);


ALTER TABLE public.product_references OWNER TO postgres;

--
-- Name: production_tracking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.production_tracking (
    ref_id character varying(255) NOT NULL,
    correria_id character varying(255) NOT NULL,
    programmed integer NOT NULL,
    cut integer NOT NULL,
    inventory integer DEFAULT 0
);


ALTER TABLE public.production_tracking OWNER TO postgres;

--
-- Name: reception_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reception_items (
    id integer NOT NULL,
    reception_id character varying(255) NOT NULL,
    reference character varying(255) NOT NULL,
    quantity integer NOT NULL
);


ALTER TABLE public.reception_items OWNER TO postgres;

--
-- Name: reception_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reception_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reception_items_id_seq OWNER TO postgres;

--
-- Name: reception_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reception_items_id_seq OWNED BY public.reception_items.id;


--
-- Name: receptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.receptions (
    id character varying(255) NOT NULL,
    batch_code character varying(255) NOT NULL,
    confeccionista character varying(255) NOT NULL,
    has_seconds integer,
    charge_type character varying(255),
    charge_units integer NOT NULL,
    received_by character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL,
    affects_inventory boolean DEFAULT true,
    incomplete_units integer DEFAULT 0,
    is_packed boolean DEFAULT false,
    bag_quantity integer DEFAULT 0
);


ALTER TABLE public.receptions OWNER TO postgres;

--
-- Name: COLUMN receptions.affects_inventory; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receptions.affects_inventory IS 'Controls whether this reception impacts the inventory. Set to FALSE for partial receptions that are part of a larger batch.';


--
-- Name: return_reception_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.return_reception_items (
    id integer NOT NULL,
    return_reception_id character varying(255) NOT NULL,
    reference character varying(255) NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2)
);


ALTER TABLE public.return_reception_items OWNER TO postgres;

--
-- Name: return_reception_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.return_reception_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.return_reception_items_id_seq OWNER TO postgres;

--
-- Name: return_reception_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.return_reception_items_id_seq OWNED BY public.return_reception_items.id;


--
-- Name: return_receptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.return_receptions (
    id character varying(255) NOT NULL,
    client_id character varying(255) NOT NULL,
    credit_note_number character varying(255),
    total_value numeric(10,2) NOT NULL,
    received_by character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL
);


ALTER TABLE public.return_receptions OWNER TO postgres;

--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schema_migrations (
    id integer NOT NULL,
    migration_name character varying(255) NOT NULL,
    applied_at timestamp without time zone DEFAULT now(),
    success boolean DEFAULT true,
    error_message text,
    execution_time_ms integer
);


ALTER TABLE public.schema_migrations OWNER TO postgres;

--
-- Name: schema_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.schema_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.schema_migrations_id_seq OWNER TO postgres;

--
-- Name: schema_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.schema_migrations_id_seq OWNED BY public.schema_migrations.id;


--
-- Name: sellers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sellers (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    active integer NOT NULL,
    created_at timestamp without time zone
);


ALTER TABLE public.sellers OWNER TO postgres;

--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_sessions (
    id integer NOT NULL,
    user_id character varying(255) NOT NULL,
    socket_id character varying(255) NOT NULL,
    status character varying(20) DEFAULT 'online'::character varying,
    connected_at timestamp without time zone DEFAULT now(),
    last_activity timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_sessions OWNER TO postgres;

--
-- Name: user_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_sessions_id_seq OWNER TO postgres;

--
-- Name: user_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_sessions_id_seq OWNED BY public.user_sessions.id;


--
-- Name: user_view_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_view_preferences (
    id integer NOT NULL,
    user_id character varying(255) NOT NULL,
    view_order jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_view_preferences OWNER TO postgres;

--
-- Name: user_view_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_view_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_view_preferences_id_seq OWNER TO postgres;

--
-- Name: user_view_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_view_preferences_id_seq OWNED BY public.user_view_preferences.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    login_code character varying(255) NOT NULL,
    pin_hash character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    active integer NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: reception_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reception_items ALTER COLUMN id SET DEFAULT nextval('public.reception_items_id_seq'::regclass);


--
-- Name: return_reception_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_reception_items ALTER COLUMN id SET DEFAULT nextval('public.return_reception_items_id_seq'::regclass);


--
-- Name: schema_migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schema_migrations ALTER COLUMN id SET DEFAULT nextval('public.schema_migrations_id_seq'::regclass);


--
-- Name: user_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions ALTER COLUMN id SET DEFAULT nextval('public.user_sessions_id_seq'::regclass);


--
-- Name: user_view_preferences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_view_preferences ALTER COLUMN id SET DEFAULT nextval('public.user_view_preferences_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_log (id, entity_type, entity_id, user_id, action, old_values, new_values, changes, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (id, name, nit, address, city, seller, created_at, seller_id, updated_at, active) FROM stdin;
\.


--
-- Data for Name: compras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.compras (id, fecha, referencia, unidades, insumo, cantidad_insumo, precio_unidad, cantidad_total, total, proveedor, fecha_pedido, observacion, factura, precio_real_insumo_und, afecta_inventario, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: confeccionistas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.confeccionistas (id, name, address, city, phone, score, active, created_at) FROM stdin;
43806885	Claudia Patricia Pati�o Martinez	CLL 75B SUR 35 250	Sabaneta	3146317522	A	1	\N
1037617166	Maria Alejandra Aguirre paniagua	CRA 37 B # 107 A 12 INT 102	Medell�n	3046482878	A	1	\N
43988597	Marisol Bustos Jimenez	CRA 91A CLL 78A - 56	Robledo	3013613656	A	1	\N
43756956	Bellaflor Ramos Suarez	CRA 91 # 78 A 56 PISO 302	Robledo	3145155697	A	1	\N
43710368	Maria de los Angeles Tabarez Serna	CRA 46 A # 95 A 30	Aranajuez	3217056823	A	1	\N
43841705	Clara Ines Cano Sanchez	CR 66 # 29 - 34	San Antonio de Prado	3011481011	S	1	\N
43164208	Maria Jhannet Ospina Pineda	CLLE 69 B # 60-145 INT 2016	Itag��	3243248027	A	1	\N
35478587	Olga Lucia Arias Escobar	VDA VARGAS CEC RAMAL 4	Marinilla	3044917929	A	1	\N
32390147	Luz Angela Ramirez Buitrago	CL 20 # 18 - 29 P1	Cocorna	3126467374	A	1	\N
1017140262	Julieth Alejandra Chaverra Medina	CLL 25 # 65 A 50	Medell�n	3148683039	A	1	\N
43288659	Adriana Maria Restrepo Jimenez	CRA 92 A # 78 A 42 PISO 3	Robledo	3017463350	A	1	\N
32393362	Martha Lida Casta�o Calle	CR 23 # 15 - 21	Cocorna	3146268464	A	1	\N
21713597	Maria Bernarda Chavarria Chavarria	CL 76#  50 - 14 INT 201	Itag��	3105266558	A	1	\N
42941830	Gloria del Pilar Hernandez Vallejo	BARRIO EL TRAPICHE	Moravia	3207130439	A	1	\N
43686396	Liliana Maria Espinoza Ramirez	CR 63 33 60	ITAGUI	3234057968	A	1	\N
43161179	Aura Angelica Ospina Henao	CLL 75 # 49 - 111 PISO 01	Medellin	3136483932	A	1	\N
\.


--
-- Data for Name: correria_catalog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.correria_catalog (id, correria_id, reference_id, added_at) FROM stdin;
\.


--
-- Data for Name: correrias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.correrias (id, name, year, active, created_at) FROM stdin;
hyzlk69gl	Inicio de año	2026	1	\N
\.


--
-- Data for Name: delivery_dates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.delivery_dates (id, confeccionista_id, reference_id, quantity, send_date, expected_date, delivery_date, process, observation, created_at, created_by) FROM stdin;
\.


--
-- Data for Name: disenadoras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.disenadoras (id, nombre, cedula, telefono, activa, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: dispatch_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dispatch_items (id, dispatch_id, reference, quantity, sale_price) FROM stdin;
\.


--
-- Data for Name: dispatches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dispatches (id, client_id, correria_id, invoice_no, remission_no, dispatched_by, created_at) FROM stdin;
\.


--
-- Data for Name: fichas_cortes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fichas_cortes (id, ficha_costo_id, numero_corte, fecha_corte, cantidad_cortada, materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones, total_materia_prima, total_mano_obra, total_insumos_directos, total_insumos_indirectos, total_provisiones, costo_real, precio_venta, rentabilidad, costo_proyectado, diferencia, margen_utilidad, created_by, created_at, ficha_corte) FROM stdin;
\.


--
-- Data for Name: fichas_costo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fichas_costo (id, referencia, ficha_diseno_id, descripcion, marca, novedad, muestra_1, muestra_2, observaciones, foto_1, foto_2, materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones, total_materia_prima, total_mano_obra, total_insumos_directos, total_insumos_indirectos, total_provisiones, costo_total, precio_venta, rentabilidad, margen_ganancia, costo_contabilizar, desc_0_precio, desc_0_rent, desc_5_precio, desc_5_rent, desc_10_precio, desc_10_rent, desc_15_precio, desc_15_rent, cantidad_total_cortada, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: fichas_diseno; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fichas_diseno (id, referencia, disenadora_id, descripcion, marca, novedad, muestra_1, muestra_2, observaciones, foto_1, foto_2, materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones, total_materia_prima, total_mano_obra, total_insumos_directos, total_insumos_indirectos, total_provisiones, costo_total, importada, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: inventory_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_movements (id, insumo, cantidad, valor_unitario, valor_total, proveedor, referencia_destino, remision_factura, movimiento, compra_id, fecha_creacion, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: maletas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maletas (id, nombre, correria_id, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: maletas_referencias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maletas_referencias (id, maleta_id, referencia, orden, created_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, sender_id, receiver_id, content, read, created_at) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (order_id, reference, quantity, sale_price) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, client_id, seller_id, correria_id, total_value, created_at, settled_by, order_number, start_date, end_date, porcentaje_oficial, porcentaje_remision) FROM stdin;
\.


--
-- Data for Name: product_references; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_references (id, description, price, designer, cloth1, avg_cloth1, cloth2, avg_cloth2, active, created_at) FROM stdin;
\.


--
-- Data for Name: production_tracking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.production_tracking (ref_id, correria_id, programmed, cut, inventory) FROM stdin;
\.


--
-- Data for Name: reception_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reception_items (id, reception_id, reference, quantity) FROM stdin;
\.


--
-- Data for Name: receptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.receptions (id, batch_code, confeccionista, has_seconds, charge_type, charge_units, received_by, created_at, affects_inventory, incomplete_units, is_packed, bag_quantity) FROM stdin;
\.


--
-- Data for Name: return_reception_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return_reception_items (id, return_reception_id, reference, quantity, unit_price) FROM stdin;
\.


--
-- Data for Name: return_receptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return_receptions (id, client_id, credit_note_number, total_value, received_by, created_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schema_migrations (id, migration_name, applied_at, success, error_message, execution_time_ms) FROM stdin;
\.


--
-- Data for Name: sellers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sellers (id, name, active, created_at) FROM stdin;
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_sessions (id, user_id, socket_id, status, connected_at, last_activity) FROM stdin;
411	mmc6rtuqnu4p7lxlx	QsCYxiROPGzsCGJTAANF	online	2026-03-04 11:49:48.584596	2026-03-04 11:49:48.584596
412	mmc6rtuqnu4p7lxlx	I_L2MsAYeoTWeA3CAANH	online	2026-03-04 11:49:48.654275	2026-03-04 11:49:48.654275
413	mmc6rtuqnu4p7lxlx	hWcYg5Ew3U-QvwSLAANJ	online	2026-03-04 11:49:48.750678	2026-03-04 11:49:48.750678
414	mmc6rtuqnu4p7lxlx	788UDbUeOqKEEaPEAANL	online	2026-03-04 11:49:48.768622	2026-03-04 11:49:48.768622
415	mmc6rtuqnu4p7lxlx	CkwWwwl3iMyeb8FfAANN	online	2026-03-04 11:49:48.791137	2026-03-04 11:49:48.791137
426	mmc6rtuqnu4p7lxlx	Vva4eWAShepHSp8DAAAV	online	2026-03-04 12:39:18.460242	2026-03-04 12:39:18.460242
427	mmc6rtuqnu4p7lxlx	CtD_ov1znu8AG-rBAAAX	online	2026-03-04 12:39:18.510301	2026-03-04 12:39:18.510301
428	mmc6rtuqnu4p7lxlx	xRlu9YQwfvrsO62RAAAZ	online	2026-03-04 12:39:18.580429	2026-03-04 12:39:18.580429
429	mmc6rtuqnu4p7lxlx	rgLOmNbRKzJ3Q8xWAAAb	online	2026-03-04 12:39:18.625806	2026-03-04 12:39:18.625806
430	mmc6rtuqnu4p7lxlx	UuGOidRRu3q30bBmAAAd	online	2026-03-04 12:39:18.661589	2026-03-04 12:39:18.661589
441	mmc6rtuqnu4p7lxlx	seCRMJPUn_PdJxUCAAAV	online	2026-03-04 12:48:54.229258	2026-03-04 12:48:54.229258
442	mmc6rtuqnu4p7lxlx	V0JbEjem-r0u0coEAAAX	online	2026-03-04 12:48:54.281423	2026-03-04 12:48:54.281423
443	mmc6rtuqnu4p7lxlx	FCuUU7X7fvKf8m_3AAAZ	online	2026-03-04 12:48:54.406818	2026-03-04 12:48:54.406818
444	mmc6rtuqnu4p7lxlx	yvSttoeQYBgWw-7zAAAb	online	2026-03-04 12:48:54.425931	2026-03-04 12:48:54.425931
445	mmc6rtuqnu4p7lxlx	M2h6rgo6oJviF8RHAAAd	online	2026-03-04 12:48:54.441257	2026-03-04 12:48:54.441257
571	mmc6rtuqnu4p7lxlx	CaRwTRzU8wzWTCwgAAAV	online	2026-03-06 09:16:16.521081	2026-03-06 09:16:16.521081
572	mmc6rtuqnu4p7lxlx	zrzMwkkMIfvJrDIXAAAX	online	2026-03-06 09:16:16.536214	2026-03-06 09:16:16.536214
573	mmc6rtuqnu4p7lxlx	tMO_CAIHjkm1WGYeAAAZ	online	2026-03-06 09:16:16.597839	2026-03-06 09:16:16.597839
574	mmc6rtuqnu4p7lxlx	58BB5pXxvf2ONyOWAAAb	online	2026-03-06 09:16:16.613051	2026-03-06 09:16:16.613051
575	mmc6rtuqnu4p7lxlx	MLTFCOI_yjD97gxlAAAd	online	2026-03-06 09:16:16.626959	2026-03-06 09:16:16.626959
601	mmc6rtuqnu4p7lxlx	b3i1mEqoBFkdfJxZAAAz	online	2026-03-06 09:21:06.0939	2026-03-06 09:21:06.0939
602	mmc6rtuqnu4p7lxlx	EprxvovdniLJ3kKgAAA1	online	2026-03-06 09:21:06.110117	2026-03-06 09:21:06.110117
603	mmc6rtuqnu4p7lxlx	fkjQOif0UPuymkBQAAA3	online	2026-03-06 09:21:06.159083	2026-03-06 09:21:06.159083
604	mmc6rtuqnu4p7lxlx	PK5rNvp68tqZBGgyAAA5	online	2026-03-06 09:21:06.172121	2026-03-06 09:21:06.172121
605	mmc6rtuqnu4p7lxlx	j_EFiL4pBZJ7ahMoAAA7	online	2026-03-06 09:21:06.188987	2026-03-06 09:21:06.188987
\.


--
-- Data for Name: user_view_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_view_preferences (id, user_id, view_order, created_at, updated_at) FROM stdin;
1	mmc6rtuqnu4p7lxlx	["salesReport", "settle", "dispatch", "orders", "fichas-costo", "fichas-diseno", "reception", "returnReception", "maletas", "inventory", "orderHistory", "dispatchControl", "deliveryDates", "reports", "masters", "compras"]	2026-03-04 14:11:31.442388	2026-03-04 14:11:31.442388
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, login_code, pin_hash, role, active, created_at, updated_at) FROM stdin;
mmceztampsosqrnq8	MARIA MERCEDES	MMB	$2b$10$BJJPq.GzQGoh/APAG9ISUOk11HJ3aHVm3bYM38Qeukhmgrec9Dvr.	admin	1	\N	2026-03-04 14:14:22.52532
mmc6rtuqnu4p7lxlx	Jhon Montoya	JAM	$2b$10$ToUkDyTmUoXIEta/vsdGz.v90oZWLdJspRVap6WQPlPGRnoOPUGt.	admin	1	\N	2026-03-13 12:05:53.857026
\.


--
-- Name: dispatch_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dispatch_items_id_seq', 1, false);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: reception_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reception_items_id_seq', 1, false);


--
-- Name: return_reception_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.return_reception_items_id_seq', 1, false);


--
-- Name: schema_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.schema_migrations_id_seq', 1, false);


--
-- Name: user_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_sessions_id_seq', 678, true);


--
-- Name: user_view_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_view_preferences_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: compras compras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT compras_pkey PRIMARY KEY (id);


--
-- Name: confeccionistas confeccionistas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.confeccionistas
    ADD CONSTRAINT confeccionistas_pkey PRIMARY KEY (id);


--
-- Name: correria_catalog correria_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.correria_catalog
    ADD CONSTRAINT correria_catalog_pkey PRIMARY KEY (id);


--
-- Name: correrias correrias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.correrias
    ADD CONSTRAINT correrias_pkey PRIMARY KEY (id);


--
-- Name: delivery_dates delivery_dates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_dates
    ADD CONSTRAINT delivery_dates_pkey PRIMARY KEY (id);


--
-- Name: disenadoras disenadoras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disenadoras
    ADD CONSTRAINT disenadoras_pkey PRIMARY KEY (id);


--
-- Name: dispatch_items dispatch_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispatch_items
    ADD CONSTRAINT dispatch_items_pkey PRIMARY KEY (id);


--
-- Name: dispatches dispatches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispatches
    ADD CONSTRAINT dispatches_pkey PRIMARY KEY (id);


--
-- Name: fichas_cortes fichas_cortes_ficha_costo_id_numero_corte_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_cortes
    ADD CONSTRAINT fichas_cortes_ficha_costo_id_numero_corte_key UNIQUE (ficha_costo_id, numero_corte);


--
-- Name: fichas_cortes fichas_cortes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_cortes
    ADD CONSTRAINT fichas_cortes_pkey PRIMARY KEY (id);


--
-- Name: fichas_costo fichas_costo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_costo
    ADD CONSTRAINT fichas_costo_pkey PRIMARY KEY (id);


--
-- Name: fichas_costo fichas_costo_referencia_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_costo
    ADD CONSTRAINT fichas_costo_referencia_key UNIQUE (referencia);


--
-- Name: fichas_diseno fichas_diseno_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_diseno
    ADD CONSTRAINT fichas_diseno_pkey PRIMARY KEY (id);


--
-- Name: fichas_diseno fichas_diseno_referencia_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_diseno
    ADD CONSTRAINT fichas_diseno_referencia_key UNIQUE (referencia);


--
-- Name: inventory_movements inventory_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_pkey PRIMARY KEY (id);


--
-- Name: maletas maletas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maletas
    ADD CONSTRAINT maletas_pkey PRIMARY KEY (id);


--
-- Name: maletas_referencias maletas_referencias_maleta_id_referencia_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maletas_referencias
    ADD CONSTRAINT maletas_referencias_maleta_id_referencia_key UNIQUE (maleta_id, referencia);


--
-- Name: maletas_referencias maletas_referencias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maletas_referencias
    ADD CONSTRAINT maletas_referencias_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: product_references product_references_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_references
    ADD CONSTRAINT product_references_pkey PRIMARY KEY (id);


--
-- Name: production_tracking production_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_tracking
    ADD CONSTRAINT production_tracking_pkey PRIMARY KEY (ref_id, correria_id);


--
-- Name: reception_items reception_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reception_items
    ADD CONSTRAINT reception_items_pkey PRIMARY KEY (id);


--
-- Name: receptions receptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receptions
    ADD CONSTRAINT receptions_pkey PRIMARY KEY (id);


--
-- Name: return_reception_items return_reception_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_reception_items
    ADD CONSTRAINT return_reception_items_pkey PRIMARY KEY (id);


--
-- Name: return_receptions return_receptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_receptions
    ADD CONSTRAINT return_receptions_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_migration_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_migration_name_key UNIQUE (migration_name);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (id);


--
-- Name: sellers sellers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sellers
    ADD CONSTRAINT sellers_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_user_id_socket_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_socket_id_key UNIQUE (user_id, socket_id);


--
-- Name: user_view_preferences user_view_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_view_preferences
    ADD CONSTRAINT user_view_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_view_preferences user_view_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_view_preferences
    ADD CONSTRAINT user_view_preferences_user_id_key UNIQUE (user_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_clients_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_active ON public.clients USING btree (active);


--
-- Name: idx_clients_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_name ON public.clients USING btree (name);


--
-- Name: idx_clients_nit; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_nit ON public.clients USING btree (nit);


--
-- Name: idx_clients_seller_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_seller_id ON public.clients USING btree (seller_id);


--
-- Name: idx_compras_afecta_inventario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_compras_afecta_inventario ON public.compras USING btree (afecta_inventario);


--
-- Name: idx_compras_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_compras_fecha ON public.compras USING btree (fecha);


--
-- Name: idx_compras_insumo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_compras_insumo ON public.compras USING btree (insumo);


--
-- Name: idx_compras_proveedor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_compras_proveedor ON public.compras USING btree (proveedor);


--
-- Name: idx_delivery_dates_confeccionista_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_dates_confeccionista_id ON public.delivery_dates USING btree (confeccionista_id);


--
-- Name: idx_delivery_dates_reference_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_dates_reference_id ON public.delivery_dates USING btree (reference_id);


--
-- Name: idx_dispatch_items_dispatch_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dispatch_items_dispatch_id ON public.dispatch_items USING btree (dispatch_id);


--
-- Name: idx_dispatch_items_reference; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dispatch_items_reference ON public.dispatch_items USING btree (reference);


--
-- Name: idx_dispatches_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dispatches_client_id ON public.dispatches USING btree (client_id);


--
-- Name: idx_dispatches_correria_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dispatches_correria_id ON public.dispatches USING btree (correria_id);


--
-- Name: idx_dispatches_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dispatches_created_at ON public.dispatches USING btree (created_at);


--
-- Name: idx_fichas_cortes_ficha_costo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fichas_cortes_ficha_costo ON public.fichas_cortes USING btree (ficha_costo_id);


--
-- Name: idx_fichas_costo_referencia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fichas_costo_referencia ON public.fichas_costo USING btree (referencia);


--
-- Name: idx_fichas_diseno_referencia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fichas_diseno_referencia ON public.fichas_diseno USING btree (referencia);


--
-- Name: idx_inventory_movements_compra_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_movements_compra_id ON public.inventory_movements USING btree (compra_id);


--
-- Name: idx_inventory_movements_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_movements_created_at ON public.inventory_movements USING btree (created_at);


--
-- Name: idx_inventory_movements_insumo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_movements_insumo ON public.inventory_movements USING btree (lower((insumo)::text));


--
-- Name: idx_inventory_movements_movimiento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_movements_movimiento ON public.inventory_movements USING btree (movimiento);


--
-- Name: idx_inventory_movements_referencia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_movements_referencia ON public.inventory_movements USING btree (lower((referencia_destino)::text));


--
-- Name: idx_maletas_referencias_maleta; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maletas_referencias_maleta ON public.maletas_referencias USING btree (maleta_id);


--
-- Name: idx_maletas_referencias_maleta_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maletas_referencias_maleta_id ON public.maletas_referencias USING btree (maleta_id);


--
-- Name: idx_messages_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at);


--
-- Name: idx_messages_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_read ON public.messages USING btree (read);


--
-- Name: idx_messages_receiver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_receiver ON public.messages USING btree (receiver_id);


--
-- Name: idx_messages_sender_receiver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_sender_receiver ON public.messages USING btree (sender_id, receiver_id);


--
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: idx_orders_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_client_id ON public.orders USING btree (client_id);


--
-- Name: idx_orders_correria_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_correria_id ON public.orders USING btree (correria_id);


--
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at);


--
-- Name: idx_orders_end_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_end_date ON public.orders USING btree (end_date);


--
-- Name: idx_orders_seller_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_seller_id ON public.orders USING btree (seller_id);


--
-- Name: idx_orders_start_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_start_date ON public.orders USING btree (start_date);


--
-- Name: idx_production_tracking_correria_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_production_tracking_correria_id ON public.production_tracking USING btree (correria_id);


--
-- Name: idx_reception_items_reception_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reception_items_reception_id ON public.reception_items USING btree (reception_id);


--
-- Name: idx_receptions_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receptions_created_at ON public.receptions USING btree (created_at);


--
-- Name: idx_user_sessions_last_activity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_last_activity ON public.user_sessions USING btree (last_activity);


--
-- Name: idx_user_sessions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_status ON public.user_sessions USING btree (status);


--
-- Name: idx_user_sessions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions USING btree (user_id);


--
-- Name: idx_user_view_preferences_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_view_preferences_user_id ON public.user_view_preferences USING btree (user_id);


--
-- Name: idx_users_login_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_login_code ON public.users USING btree (login_code);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: user_view_preferences trigger_update_user_view_preferences_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_user_view_preferences_timestamp BEFORE UPDATE ON public.user_view_preferences FOR EACH ROW EXECUTE FUNCTION public.update_user_view_preferences_timestamp();


--
-- Name: fichas_cortes fichas_cortes_ficha_costo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_cortes
    ADD CONSTRAINT fichas_cortes_ficha_costo_id_fkey FOREIGN KEY (ficha_costo_id) REFERENCES public.fichas_costo(id) ON DELETE CASCADE;


--
-- Name: fichas_costo fichas_costo_ficha_diseno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_costo
    ADD CONSTRAINT fichas_costo_ficha_diseno_id_fkey FOREIGN KEY (ficha_diseno_id) REFERENCES public.fichas_diseno(id);


--
-- Name: fichas_diseno fichas_diseno_disenadora_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_diseno
    ADD CONSTRAINT fichas_diseno_disenadora_id_fkey FOREIGN KEY (disenadora_id) REFERENCES public.disenadoras(id);


--
-- Name: dispatch_items fk_dispatch_items_dispatch; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispatch_items
    ADD CONSTRAINT fk_dispatch_items_dispatch FOREIGN KEY (dispatch_id) REFERENCES public.dispatches(id);


--
-- Name: inventory_movements inventory_movements_compra_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_compra_id_fkey FOREIGN KEY (compra_id) REFERENCES public.compras(id) ON DELETE SET NULL;


--
-- Name: maletas maletas_correria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maletas
    ADD CONSTRAINT maletas_correria_id_fkey FOREIGN KEY (correria_id) REFERENCES public.correrias(id);


--
-- Name: maletas_referencias maletas_referencias_maleta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maletas_referencias
    ADD CONSTRAINT maletas_referencias_maleta_id_fkey FOREIGN KEY (maleta_id) REFERENCES public.maletas(id) ON DELETE CASCADE;


--
-- Name: user_view_preferences user_view_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_view_preferences
    ADD CONSTRAINT user_view_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict Ng8muxq0gCAURHnTJBFGgNFMryuCcKIhLkOlkXHQkzuxzgCKA1o2mvKivclHaXC

