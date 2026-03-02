��--
-- PostgreSQL database dump
--

\restrict EFvgzNZmLxMDiUvQ9uXMEbCkKGthmbIgwAbn7OgdFpQZs74kUkdTdWTrynFl6lW

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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
-- Name: cortes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cortes (
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cortes OWNER TO postgres;

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
    quantity integer NOT NULL
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
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    ficha_costo_id uuid,
    numero_corte integer NOT NULL,
    fecha_corte date,
    cantidad_cortada integer,
    ficha_corte character varying(255),
    materia_prima jsonb DEFAULT '[]'::jsonb,
    mano_obra jsonb DEFAULT '[]'::jsonb,
    insumos_directos jsonb DEFAULT '[]'::jsonb,
    insumos_indirectos jsonb DEFAULT '[]'::jsonb,
    provisiones jsonb DEFAULT '[]'::jsonb,
    total_materia_prima numeric(10,2) DEFAULT 0,
    total_mano_obra numeric(10,2) DEFAULT 0,
    total_insumos_directos numeric(10,2) DEFAULT 0,
    total_insumos_indirectos numeric(10,2) DEFAULT 0,
    total_provisiones numeric(10,2) DEFAULT 0,
    costo_real numeric(10,2) DEFAULT 0,
    precio_venta numeric(10,2) DEFAULT 0,
    rentabilidad numeric(5,2) DEFAULT 0,
    costo_proyectado numeric(10,2) DEFAULT 0,
    diferencia numeric(10,2) DEFAULT 0,
    margen_utilidad numeric(5,2) DEFAULT 0,
    created_by character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
    muestra1 character varying(255),
    muestra2 character varying(255),
    observaciones text,
    foto1 character varying(500),
    foto2 character varying(500),
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
    rentabilidad numeric(5,2) DEFAULT 0,
    margen_ganancia numeric(12,2) DEFAULT 0,
    costo_contabilizar numeric(12,2) DEFAULT 0,
    desc0_precio numeric(12,2) DEFAULT 0,
    desc0_rent numeric(5,2) DEFAULT 0,
    desc5_precio numeric(12,2) DEFAULT 0,
    desc5_rent numeric(5,2) DEFAULT 0,
    desc10_precio numeric(12,2) DEFAULT 0,
    desc10_rent numeric(5,2) DEFAULT 0,
    desc15_precio numeric(12,2) DEFAULT 0,
    desc15_rent numeric(5,2) DEFAULT 0,
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
    muestra1 character varying(255),
    muestra2 character varying(255),
    observaciones text,
    foto1 character varying(500),
    foto2 character varying(500),
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
    id character varying(255) NOT NULL,
    reference_id character varying(255) NOT NULL,
    movement_type character varying(50) NOT NULL,
    quantity integer NOT NULL,
    source character varying(255),
    destination character varying(255),
    created_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.inventory_movements OWNER TO postgres;

--
-- Name: maletas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maletas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(255) NOT NULL,
    correria_id uuid,
    referencias jsonb DEFAULT '[]'::jsonb,
    created_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.maletas OWNER TO postgres;

--
-- Name: maletas_referencias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maletas_referencias (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    maleta_id uuid,
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
    order_number integer
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
    cut integer NOT NULL
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
    created_at character varying(255) NOT NULL
);


ALTER TABLE public.receptions OWNER TO postgres;

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
1	INVERSIONES SURTIMODA SAS	900582506	CALLE 14 #17-70 BARRIO CENTRO	ACACIAS	\N	2026-02-14 06:32:24	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
10	SALAS ASOCIADOS S.A.S	900392405	CL 49 9 44 SEC COMERCIAL	BARRANCABERMEJA	\N	2026-02-14 06:27:55	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
100	TIENDAS MICROEMPRESARIALES LANFER S.A.S.	900118155	CL 9 6 71 BRR CENTRO	CUCUTA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
101	RAYOTEX S.A.S	1800144409	CLL 12 5 49	CUCUTA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
102	INVERSIONES SACHA S.A.S	1900186125	CARRERA 6 N,%�% 8-96	CUNDINAMARCA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
103	RAMIREZ BOTERO ADOLFO JESUS	1066	CRA 15 N,%�% 8 -43 CURUMANI	CURUMANI	\N	2026-02-14 06:27:58	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
104	GALLEGO JOHN JAMIME	5225	AV. SIMON BOLIVAR #38-130  LOCAL 114	DOSQUEBRADAS	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
105	NAVANA MEGATODO S.A.S	2901169855	CRA 17 # 15-22	DUITAMA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
106	INVERSIONES 8A S.A.S N,%�%4	4900137023	CRA 17 # 16 49/59 DUITAMA	DUITAMA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
107	ARISTIZABAL ARISTIBAL DUBIAN DE JESUS	70829130	CL 25 48 71 LC 2 BRR CENTRO	EL CARMEN DE BOLIVAR	\N	2026-02-14 06:27:58	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
108	JIMENEZ MAYORGA MARIA ALEJANDRA	1129574347	CR 50 25 55	EL CARMEN DE BOLIVAR	\N	2026-02-14 06:27:58	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
109	RESTREPO JARAMILLO JULIAN ANDRES	179726416	CRA 12 N,%�% 7 -11 BRR CENTRO	EL CERRITO	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
11	SALAS ASOCIADOS S.A.S	1900392405	CL 49 9 44 SEC COMERCIAL PTO BOYACA	BARRANCABERMEJA	\N	2026-02-14 06:27:55	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
110	SANCHEZ TORRES LILIANA	1117485254	CR 4 # 2 - 29	EL PAUJIL	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
111	REPRESENTACIONES INTERMODA S.A.S	901121571	CLLE 10 # 4-102 ESPINAL TOLIMA	ESPINAL	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
112	INTIMOS ALMA S.A.S N,%�%22	2283003804	CL 7 N,%�% 3 - 65	FACATATIVA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
113	ROJAS FARUK	981	C.C. OROCENTOR LOCAL 1-68	FLORENCIA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
114	RAMIREZ CARDENAS FREDY ALBERTO	70698350	CL 16 11 41 BRR CENTRO	FLORENCIA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
115	RAMIREZ CARDENAS EVER GONZALO	1045019291	CL 16 N,%�% 11-58 BRR CENTRO	FLORENCIA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
116	PINILLA LESMES DIANA CAROLina Pulgarin	1006512762	CL 22 2 A BIS 06 BRR ATALAY	FLORENCIA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
117	INVERSIONES INTERMODA S.A.S	901068621	CLLE 16 #11-33 FLORENCIA	FLORENCIA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
118	ORDO%�EZ ALVAREZ ESTEBAN JAVIER	9336	CLLE 17 # 9-14	FLORENCIA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
119	GONZALES MU%�OZ EVANGELina Pulgarin	40784925	CR 11 # 13-60 BRR CENTRO	FLORENCIA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
12	EL GIGANTE DE LA MODA S.A.S	900646287	CL 49 9 62	BARRANCABERMEJA	\N	2026-02-14 06:27:55	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
120	RAMIREZ VALENCIA CESAR	17915	CRA 12 # 15-17	FLORENCIA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
121	VALENCIA RAMIREZ OMAR	17137	CRA 12 # 15-31	FLORENCIA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
122	RESTREPO JARAMILLO JULIAN ANDRES	379726416	CLLE 9 # 17-24	FLORIDA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
123	COMERCIALIZADORA MGV SAS	1901413624	CL 13 18 33	FONSECA	\N	2026-02-14 06:27:58	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
124	PEDROZO LUZ MERY	792	CRA 116 A N,%�% 15 C -70 APTO 307 TORRE 1	FONTIBON	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
125	DISTRIBUIDORA MUNDO FASHION	900324182	CALLE 4 # 8A -49	FUNDACION	\N	2026-02-14 06:27:58	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
126	CARLOS MARIO SALAZAR ECHEVERRI	70694755	CALLE 6 NRO. 8A-18	FUNDACION	\N	2026-02-14 06:27:58	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
127	COMERCIALIZADORA GIRALDO DEL CARIBE	900454797	CL 4 8A 20	FUNDACION	\N	2026-02-14 06:27:58	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
128	ZULUAGA SALAZAR LEONEL ALBERTO	188210403	CR 8 N,%�% 5-26	FUNDACION	\N	2026-02-14 06:27:58	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
129	DUQUE HOYOS JUAN GONZALO	2104501630	CL 8 N 7 76	FUSAGASUGA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
13	INVERSIONES SOLOMODA BARRANCA S.A.S	900351574	CL 49 9 78	BARRANCABERMEJA	\N	2026-02-14 06:27:55	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
130	INVERSIONES 8A S.A.S N,%�%20	2090013702	CLL 8 # 8-71 EXT 1120	FUSAGASUGA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
131	DUQUE HOYOS JUAN GONZALO	1104501630	CL 7 10 87	GARZON	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
132	INVERSIONES ESTRENATODO S.A.S	900275560	CARRERA 10 #14-47	GIRARDOT	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
133	PANTYJEANS GIRARDOT CIA LTDA	900284812	CR 10 13 52	GIRARDOT	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
134	EL UNIVERSO DE LA MODA ACTUAL S.A.S	900468771	CR 10 14 15	GIRARDOT	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
135	ALMACENES GANE LIMITADA	1890203597	CR 26  37 104	GIRON	\N	2026-02-14 06:27:58	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
136	RUSSI CACERES NESTOR LUIS	91296133	CR 26 # 40 - 20 BRR EL POBLADO	GIRON	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
137	INTIMOS ALMA S.A.S N,%�% 26	2683003804	CL 17 N,%�% 14 - 41 EXT: 1120	GRANADA	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
138	DISTRIBUIDORA DE MODA GRANADA	901619815	CR 15 17 44 BRR CENTRO	GRANADA	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
139	GUTIERREZ FANDI%�O FANNY	52456059	CR 7 3 68 BRR CENTRO	GUACARI	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
14	PALACIO MARIA ALIX	7076	CRA 47 B # 37 A 08	BARRANCABERMEJA	\N	2026-02-14 06:27:55	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
140	GUERRA EDILSON DARIO	4536	CR 7 # 8-07	HORMIGA	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
141	RAMIREZ BOTERO ADOLFO JESUS	70691066	CL 17 2 92 96 98 P5 BRR CENTRO	IBAGUE	\N	2026-02-14 06:27:59	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
142	SURTIDORA EL UNIVERSO DE LA MODA	900023407	CR 3 13 A 29	IBAGUE	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
143	SURTIDORA PANTY JEAN'S DE COLOMBIA SAS	900744578	CR 3 15 90 94 BRR CENTRO	IBAGUE	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
144	INNOVACIONES WIN S.A.S	900835285	CRA 51 # 50- 15 ITAGUI	ITAGUI	\N	2026-02-14 06:27:59	mlia6gb0u2bhftxam	2026-02-19 01:52:18.269	t
145	BOHORQUEZ GALVIS LUTH DARE	49764593	CLL 11 8 78	JAMUNDI	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
146	CARO CARO ANGELA MARIA	29567740	CR 10 11 53	JAMUNDI	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
147	COMPA%�IA REPUBLIC S.A.S EN LIQUIDACION	900385825	CARRERA 4 #14-49 CENTRO	LA DORADA	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
148	ALTA MODA LA DORADA	7507	CLLE 5 # 5-35	LA DORADA	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
149	SALAZAR ZULUAGA MAURICIO ANTONIO	1027	CRA 4 #14-49	LA DORADA	\N	2026-02-14 06:27:59	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
15	HERRERA JOHN FREDY	4065	CALLE 30 #42-04 MEGAMODA	BARRANQUILLA	\N	2026-02-14 06:27:55	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
150	ZULUAGA EDWIN DAVID	6942	CRA 7 # 12-38 MERCADO VIEJO	LA GUAJIRA	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
151	DUQUE HOYOS JUAN GONZALO	1045016303	CL 6 N 3 56	LA PLATA	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
152	GOMEZ HERNANDEZ JUAN DAVID	1010153349	CARRERA 7 # 11-38	LA TEBAIDA	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
153	ARBOLEDA VASQUEZ JULIAN ANDRES	16552144	CARRERA 15 #15-42	LA UNION	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
154	BRABO DUARTE LUZ DARIS	63471107	CL 11 9-15 BRR CENTRO	LEBRIJA	\N	2026-02-14 06:27:59	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
155	CARDOZO AMAYA YOLANDA	65498039	CR 6 # 8 26 BRR CENTRO	LERIDA	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
156	ALIANZA MU%�OZ GOMEZ SAS	901079469	CR 20 2 A 22	LORICA	\N	2026-02-14 06:27:59	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
157	G & G RETAIL S.A.S	901234880	CRA 20 # 2 -34	LORICA	\N	2026-02-14 06:27:59	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
158	JIMENEZ MAYORGA MARIA ALEJANDRA	1112957434	CL DE LAS FLORES 12 24	MAGANGUE	\N	2026-02-14 06:27:59	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
159	ALIANZA MABLE SAS	900638635	CRA 3 B # 3-75	MAGANGUE	\N	2026-02-14 06:27:59	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
16	ALIANZA MAS SAS	900596174	CALLE 34 # 43 147	BARRANQUILLA	\N	2026-02-14 06:27:55	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
160	K-LU DE COLOMBIA SAS	901663086	CL 10 A 13 05 BRR CENTRO	MAICAO	\N	2026-02-14 06:27:59	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
161	LOPEZ HERRERA ANDRES FELIPE	1035912972	CL 12 # 11 60 LC 3	MAICAO	\N	2026-02-14 06:27:59	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
162	LOPEZ HERRERA GILDARDO ALONSO	15173215	CR 12 12 27	MAICAO	\N	2026-02-14 06:27:59	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
163	SALAZAR JARAMILLO CESAR AUGUSTO	16138274	CR 23 # 27 - 28	MANIZALES	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
164	ARIAS GUAPACHA NATALIA	1053799325	CR 23 # 57 - 37	MANIZALES	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
165	CASTRO CARRETERO OSCAR ALFONSO	1814	CRA 23 57 37 BRR LEONORA	MANIZALES	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
166	SANCHEZ SANTAMARIA FLOR MARINA	41642642	CL 19 # 20 - 31 ALMACEN FAS # 1	MANIZALES	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
167	CASTRO CARRETERO OSCAR ALFONSO	55991814	CR 23 57 37 BRR LEONORA	MANIZALES	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
168	COMERCIALIZADORA CENTER S.A.S.	900747073	CALLE 46 # 53 - 05 - AMAZONA CENTER	MEDELLIN	\N	2026-02-14 06:28:00	mlia6gb0u2bhftxam	2026-02-19 01:52:18.269	t
169	INNOVACIONES DE MODA SAS	2900463523	CALLE 48 #51-27  PICHINCHA	MEDELLIN	\N	2026-02-14 06:28:00	mlia6gb0u2bhftxam	2026-02-19 01:52:18.269	t
17	ALIANZA ESTRENO SAS	900593525	CALLE 34 #43-81	BARRANQUILLA	\N	2026-02-14 06:27:56	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
170	INNOVACIONES DE MODA S.A.S	900463523	CARRERA 51 #50-27 P.BERRIO	MEDELLIN	\N	2026-02-14 06:28:00	mlia6gb0u2bhftxam	2026-02-19 01:52:18.269	t
171	INVERSIONES GAFREMOL S.A.S	900532343	CARRERA 52 #48-02 CENTRAL	MEDELLIN	\N	2026-02-14 06:28:00	mlia6gb0u2bhftxam	2026-02-19 01:52:18.269	t
172	INNOVACIONES DE MODA SAS	1900463523	CARRERA 52 #50-50  CARABOBO	MEDELLIN	\N	2026-02-14 06:28:00	mlia6gb0u2bhftxam	2026-02-19 01:52:18.269	t
173	INVERSIONES LA MEDIA NARANJA S.A.S	2900109044	CENTRO COMERCIAL CENTRAL BUENOS AIRES	MEDELLIN	\N	2026-02-14 06:28:00	mlia6gb0u2bhftxam	2026-02-19 01:52:18.269	t
174	INVERSIONES LA MEDIA NARANJA S.A.S	3900109044	CLLE 49 # 49-29 AYACUHO	MEDELLIN	\N	2026-02-14 06:28:00	mlia6gb0u2bhftxam	2026-02-19 01:52:18.269	t
175	INVERSIONES LA MEDIA NARANJA S.A.S	900109044	CRA 53 #48-29 CUNDINAMARCA	MEDELLIN	\N	2026-02-14 06:28:00	mlia6gb0u2bhftxam	2026-02-19 01:52:18.269	t
176	TENDENCIAS FUTURISTAS S.A.S #2	1900314739	CALLE 29 #20-337 LOCAL 169 C.C NUESTRO	MONTERIA	\N	2026-02-14 06:28:00	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
177	COMERCIALIZADORA EL PALACIO DE LA PANTALETA	1901164484	CALLE 35 #2-22	MONTERIA	\N	2026-02-14 06:28:00	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
178	INVERSIONES LA PANTALETA S.A.S	900050852	CARRERA 2 # 32-07	MONTERIA	\N	2026-02-14 06:28:00	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
179	COMERCIALIZADORA EL PALACIO DE LA PANTALETA	901164484	CARRERA 2 #34-12 CENTRO	MONTERIA	\N	2026-02-14 06:28:00	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
18	TRICIA DUARTE	8544	CARRERA 4 # 45 G - 32	BARRANQUILLA	\N	2026-02-14 06:27:56	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
180	TENDENCIAS FUTURISTAS S.A.S #1	900314739	CRA 2 #35-36	MONTERIA	\N	2026-02-14 06:28:00	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
181	GRUPO COMERCIAL INTERMODA S.A.S	900442422	CALLE 8 #3-33	NEIVA	\N	2026-02-14 06:28:00	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
182	GRUPO COMERCIAL INTERMODA S.A.S	3900442422	CLLE 8 # 3-81	NEIVA	\N	2026-02-14 06:28:00	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
183	GRUPO COMERCIAL INTERMODA S.A.S	2900442422	CRA 5 # 8-56	NEIVA	\N	2026-02-14 06:28:00	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
184	GRUPO COMERCIAL INTERMODA S.A.S	4900442422	CRA 5 N,%�% 8-25	NEIVA	\N	2026-02-14 06:28:00	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
185	TIENDAS MICROEMPRESARIALES LANFER S.A.S	1900118155	CR 13 9 52 SECTOR DEL DULCE NOMBRE	OCA%�A	\N	2026-02-14 06:28:00	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
186	INVERSIONES 8A S.A.S N,%�%10	1090013702	CL 25 N,%�% 22 - 18 / LC 1	PAIPA	\N	2026-02-14 06:28:00	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
187	GUERRERO MU%�OZ SANDRA PATRICIA	66776819	CL 33 19 85	PALMIRA	\N	2026-02-14 06:28:00	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
188	GUITIERREZ RESTREPO LAURA	1730	CLLE 30 # 27-15 CENTRO	PALMIRA	\N	2026-02-14 06:28:00	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
189	INVERSIONES BANETY SAS	901580883	CALLE 17 #20 64 BRR CENTRO	PASTO	\N	2026-02-14 06:28:00	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
19	JIMENEZ QUINTERO DECIMO ALEXANDER	7606	CARRERA 41 #30-54	BARRANQUILLA	\N	2026-02-14 06:27:56	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
190	SOTO GOMEZ ELCY BIBIANA	1045017326	CL 18 # 23 - 85 BRR CENTRO	PASTO	\N	2026-02-14 06:28:00	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
191	SOTO FRANCO JHOVANNY	7271	CR 20 A 16 74	PASTO	\N	2026-02-14 06:28:00	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
192	SOTO FRANCO ALEXANDER	70697270	CR 22 # 16 - 80. EL GRAN SURTIDOR	PASTO	\N	2026-02-14 06:28:00	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
193	GOMEZ GOMEZ MARIA MERCEDES	41892604	CR 8 CL 17 ESQ 16 75 CC LA OCTAVA	PEREIRA	\N	2026-02-14 06:28:00	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
194	INVERSIONES LA MEDIA NARANJA S.A.S	1900109044	CRA 8 #17-34	PEREIRA	\N	2026-02-14 06:28:00	mlia6gb0u2bhftxam	2026-02-19 01:52:18.269	t
195	ZULUAGA CEBALLOS John Efrain Bolivar ALEXANDER	14817	CR 26 40 20	PIEDECUESTA	\N	2026-02-14 06:28:00	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
196	ZULUAGA CEBALLOS John Efrain Bolivar ALEXANDER	1033814817	CR 6 # 10 - 88	PIEDECUESTA	\N	2026-02-14 06:28:00	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
197	BARRERA MORA BETURIA	8911	CLLE 7 # 2-34	PITALITO	\N	2026-02-14 06:28:01	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
198	SUPERMODA CIA Y LIMITADA	809010278	CRA 4 # 7 -45 PITALITO	PITALITO	\N	2026-02-14 06:28:01	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
199	VARIEDADES SJ DEL CARIBE S.A.S	901413205	CRA 10 9 31	PIVIJAY	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
2	INVERSIONES AM ACACIAS S.A.S.	901509626	CL 13 # 19 - 79 BRR CENTRO	ACACIAS	\N	2026-02-14 06:27:55	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.268	t
20	ZULUAGA GOMEZ RIGOBERTO	170827090	CL 34 43 70 LC M 5	BARRANQUILLA	\N	2026-02-14 06:27:56	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
200	G & G RETAIL S.A.S	3901234880	CLLE 20 N,%�% 7-41	PLANETA RICA	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
201	RAMIREZ LLERENA LUZ ADRIANA	700082020	CR 15 11-65	PLATO	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
202	ALIANZA HERMANOS JGV	16326	CR 15 12 69	PLATO	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
203	MORCILLO GONZALEZ LEIDY	4000	CALLE 6 #18-48	POPAYAN	\N	2026-02-14 06:28:01	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
204	ARCILA BEATRIZ HELENA	4957	CARRERA 7 #6-26	POPAYAN	\N	2026-02-14 06:28:01	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
205	ZULUAGA ORLANDO	1694	CLLE 6 # 6-43	POPAYAN	\N	2026-02-14 06:28:01	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
206	COMPA%�IA REPUBLIC S.A.S.	1900385825	CL 54 3 00 ESQ	PUERTO BERRIO	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
207	INVERSIONES SOLOMODA BARRANCA S.A.S	2900351574	CR 3 N,%�% 9-18	PUERTO BERRIO	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
208	SANCHEZ TORRES NELSY	40091533	CALLE 5 # 7-33	PUERTO RICO	\N	2026-02-14 06:28:01	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
209	GUERRA EDILSON DARIO	5369	CRA 7 # 8-07	PUTUMAYO	\N	2026-02-14 06:28:01	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
21	ZULUAGA GOMEZ RIGOBERTO	70827090	CL 35 44 18	BARRANQUILLA	\N	2026-02-14 06:27:56	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
210	ALIANZA MAS S.A.S	1900596174	CALLE 15 #18-274 LOC 138 C.C VIVA GUAJIRA	RIOHACHA	\N	2026-02-14 06:28:01	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
211	PASSARELA RIOHACHA S.A.S.	901697930	CR 7 # 12 - 45	RIOHACHA	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
212	RAMIREZ GIRALDO ANDRES FELIPE	700159350	CR 7 12 38	RIOHACHA	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
213	SUPERMODA RIOHACHA S.A.S	901697954	CR 7 12 38	RIOHACHA	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
214	SALAZAR ECHEVERRI LUIS ALBERTO	270693888	CR 7 N 12 28	RIOHACHA	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
215	SUPERMODA SABANALARGA S.A.S	901698678	CR 19 # 20-31	SABANALARGA	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
216	MEDINA MERCHAN YESENIA	1052989202	CL 13 CR 10 60 BRR CENTRO LC 2	SAHAGUN	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
217	G & G RETAIL S.A.S	1901234880	CRA 11 #13-73	SAHAGUN	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
218	INVERSIONES 8A S.A.S N,%�%16	1690013702	CR 9 N,%�% 11 - 36	SAN GIL	\N	2026-02-14 06:28:01	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
219	G & G RETAIL S.A.S	2901234880	CR 24 15 29	SAN MARCOS	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
22	GH ENTERPRISE S.A.S.	901486883	CL 53 46 192 LC 240 CC PORTAL DEL PRADO	BARRANQUILLA	\N	2026-02-14 06:27:56	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
220	DISTRIBUIDORA MUNDO FASHION	2900324182	CALLE 22 #5-37 EDIFICIO ANDINA APTO 202	SANTA MARTA	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
221	INVERSIONES TORRES CA S.A.S.	901155149	CL 11 # 8 - 31 BRR MERCADO	SANTA MARTA	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
222	INVERSIONES RABI SAS	901090933	CLLE 11 # 8 A 23	SANTA MARTA	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
223	ZULUAGA SALAZAR LEONEL ALBERTO	88210403	CR 5 19 08	SANTA MARTA	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
224	INVERSIONES RABI SAS	1901090933	CRA 5 # 21 - 30	SANTA MARTA	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
225	ALIANZA HNOS JGVS SAS	900676326	CRA 5 #18-43	SANTA MARTA	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
226	GUITIERREZ RESTREPO LAURA	2119279173	CLLE 4 # 10-59 CENTRO	SANTANDER DE QUILICHAO	\N	2026-02-14 06:28:01	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
227	TAMAYO JARAMILLO LUZ MARIA	24431638	CLLE 4 # 11-32 CENTRO	SANTANDER DE QUILICHAO	\N	2026-02-14 06:28:01	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
228	ARCILA CARDENAS SANDRA EMILSEN	265	CL 50 # 46 - 27	SANTUARIO	\N	2026-02-14 06:28:01	mlia6gb0u2bhftxam	2026-02-19 01:52:18.269	t
229	SERNA RAMIREZ ANGELA MARIA	19585	CL 50 50 71 IN 101	SANTUARIO	\N	2026-02-14 06:28:02	mlia6gb0u2bhftxam	2026-02-19 01:52:18.269	t
23	ALIANZA ESTRENO SAS	1900593525	CLLE 34 # 43-42	BARRANQUILLA	\N	2026-02-14 06:27:56	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
230	COMERCIALIZADORA MAGOTEX S.A.S #2	1901239802	CALLE 21 #19-12	SINCELEJO	\N	2026-02-14 06:28:02	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
231	MP RETAIL S.A.S	901181807	CALLE 22 #20-68	SINCELEJO	\N	2026-02-14 06:28:02	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
232	PANAMA PLAZA S.A.S	901212878	CALLE 22 N,%�% 21-22	SINCELEJO	\N	2026-02-14 06:28:02	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
233	COMERCIALIZADORA MAGOTEX 1	901239802	CALLE 23 # 20 - 64	SINCELEJO	\N	2026-02-14 06:28:02	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
234	ALIANZA MABLE SAS	1900638635	CL 28 25 B 97 LC 2 318	SINCELEJO	\N	2026-02-14 06:28:02	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
235	INVERSIONES GAFE S.A.S	2900463519	CALLE 36 SUR # 43-31	ENVIGADO	\N	2026-02-14 06:28:02	mlia6gb0u2bhftxam	2026-02-19 01:52:18.269	t
236	INVERSIONES GOBOTEX S A S	1830125982	CALLE 13 N,%Q% 5-63	SOACHA	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
237	NAVANA MEGATODO SOACHA S.A.S	1901169855	CRA 7 # 32-35 LOCAL 207	SOACHA	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
238	ACU%�A MARIA CRISTINA	30205366	CL 10 14 39 BRR CENTRO	SOCORRO	\N	2026-02-14 06:28:02	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
239	VARIMODA SAS	901729900	CR 11 14 91	SOGAMOSO	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
24	COMERCIALIZADORA MGV SAS	901413624	CR 13 104 45	BARRANQUILLA	\N	2026-02-14 06:27:56	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
240	INVERSIONES 8A S.A.S N,%�%7	7900137023	CR 11 N,%�% 13 - 29 SOGAMOSO	SOGAMOSO	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
241	ALIANZA VC S.A.S	900225992	CALLE 20 N,%�% 19-17	SOLEDAD	\N	2026-02-14 06:28:02	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
242	INVERSIONES JBARA S.A.S	901462378	CL 63 14 50	SOLEDAD	\N	2026-02-14 06:28:02	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
243	DUQUE HOYOS JUAN GONZALO	3104501630	CR 19 19 41	SOLEDAD	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
244	ZULAGA GIRALDO HECTOR MAURICIO	70690823	CL 27 24 59 BR CENTRO	TULUA	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
245	DECADA 10 EN TODO S.A.S	900519038	CR 24 27 30 BRR EL CENTRO	TULUA	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
246	QUINTERO ADRIAN ALBERTO	3257	CLL DEL COMERCIO EL PACIFICO DEL BARATON	TUMACO	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
247	NORE%�A MAZUERA ALEXANDER	100	CALLE MERCEDES ALM LISTO MEDELLIN	TUMACO	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
248	INVERSIONES INTERMODA S.A.S	1901068621	CLLE MOSQUERA DIAG A TELECOM	TUMACO	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
249	VARGAS MONTIEL JACKSON FABIAN	9052	CRA 9 # 8 -99	TUMACO	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
25	ZULUAGA GOMEZ EDGAR ALONSO	8778704	CR 41 32 81	BARRANQUILLA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
250	INVERSIONES 8A S.A.S N,%�%19	1990013702	AV UNIVERSITARIA N,%�% 51 21 LC 207 CC VIVA TUNJA	TUNJA	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
251	INVERSIONES 8A S.A.S N,%�%8	8900137023	CL 19 N,%�% 10 - 46	TUNJA	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
252	INVERSIONES 8A S.A.S N,%�%15	1590013702	CR 7 N,%�% 9 - 48	UBATE	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
253	SAJIN AREVALO SAMIR	77038476	CL 16 B 8 45	VALLEDUPAR	\N	2026-02-14 06:28:02	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
254	KHALED BASSAN SAJIN MHANNA	1065629467	CL 16B # 7-39 - Centro	VALLEDUPAR	\N	2026-02-14 06:28:02	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
255	ALIANZA SURTIDORA SAS	901084883	CR 7 16 A 133	VALLEDUPAR	\N	2026-02-14 06:28:03	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
256	DISTRIBUIDORA MUNDO FASHION	3900324182	DIG 10 A N,%�% 6 N 15 CC GUATAPURI LC 215	VALLEDUPAR	\N	2026-02-14 06:28:03	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
257	CIELO MODA S.A.S - AMV LLANO 2	901784502	CALLE 39 #30-40	VILLAVICENCIO	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
258	BARAKI S.A.S	901712681	CALLE 39 N,%�% 30 A 38	VILLAVICENCIO	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
259	AMV LLANO S.A.S	900469068	CARRERA 30 #36-40	VILLAVICENCIO	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
26	ALIANZA VC S.A.S	1900225992	CR 41 37 23	BARRANQUILLA	\N	2026-02-14 06:27:56	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
260	AMV LLANO S.A.S	2900469068	CL 39 30 A 38 BRR CENTRO	VILLAVICENCIO	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
261	MONTOYA VARGAS CENERY	52654284	CRA 5 # 5 23	VILLETA	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
262	MARTINEZ ARANGO DIANA ELISABETH	32564630	CR 19 # 20 - 74	YARUMAL	\N	2026-02-14 06:28:03	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
263	JIMENEZ GOMEZ CARLOS ALCIDES	70694674	CALLE 9 # 19-14	YOPAL	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
264	COL MODA YOPAL SAS	901697458	CL 10 19 52	YOPAL	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
265	RAMIREZ ZULUAGA BLANCA AMELIA	43404158	CR 20 14 31	YOPAL	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
266	INVERSIONES JIMENEZ GOMEZ S.A.S	900960772	CRA 20 N,%�% 14-39 BELLO HORIZONTE	YOPAL	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
267	EPICA DE MODAD SAS	901170874	CL 34 43 109 OF 312	BARRANQUILLA	\N	2026-02-14 06:28:03	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
268	GUTIERREZ FANDI%�O FANNY	152456059	CRA 4 # 6 -03 CENTRA	YUMBO	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
269	VASQUEZ MARIA ORFANIA	29809163	CL 9 11 08	ZARZAL	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
27	ALMACEN Y DISTRIBUIDORA GONZALEZ S.A.S	800160395	CR 42 32 28	BARRANQUILLA	\N	2026-02-14 06:27:56	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
270	AL MUSTAKIM	901812038	CLL 9 # 20 - 59	SAN JOSE DEL GUAVIARE	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
271	JHOJAINNE SULVARAN	1006745382	CR 12 # 13 - 22	MAICAO	\N	2026-02-14 06:28:03	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
272	DISTRIBUIDORA VISTEMODA LTDA	800222200	CL 52 N,%�% 15 A 05	CALI	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
273	CA%�AVERAL NU%�EZ YOLANDA	66677499	CL 9 6 82	ROLDANILLO	\N	2026-02-14 06:28:04	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
274	ARBOLEDA NIETO JOSE ALEJANDRO	14978082	CR 5 9 81 BRR GUADALUPE	CARTAGO	\N	2026-02-14 06:28:04	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
275	GV INFINITE SAS	901523339	CL 12 7 30 LOCAL 1	RIOHACHA	\N	2026-02-14 06:28:04	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
276	VIDAL MARIN INGRIT MALLERLY	3207003070	CRA 25 # 37 - 29	CALARCA	\N	2026-02-14 06:28:04	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
277	SINDY LISADY SAAVEDRA	1045016946	CRA 13 # 8-51	OCA%�A	\N	2026-02-14 06:28:04	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
278	BAYONA BAYONA JORGE LUIS	1094574518	CR 5 # 13 - 87 BRR CENTRO	ABREGO	\N	2026-02-14 06:28:04	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
279	G & G RETAIL S.A.S	6901234880	CRA 15 # 8 - 64 LOC 1	CIENAGA DE ORO	\N	2026-02-14 06:28:04	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
28	ALIANZA MU%�OZ GOMEZ SAS	1901079469	CRA 44 N,%�% 34-31 PISO 6 EDFC COLSEGUROS	BARRANQUILLA	\N	2026-02-14 06:27:56	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
280	EPICA DE MODA SAS	901170874	CALLE 30 # 43-50 LOCAL 296A  CENTRO COMERCIAL ALEGRA	BARRANQUILLA	\N	2026-02-14 06:28:04	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
281	LA PORFIA AM SAS	901891158	CR 43 # 70-05 SUR PORFIA	VILLAVICENCIO	\N	2026-02-14 06:28:04	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
282	SALANEDA INVERSIONES S.A.S.	901800090	CL 49 9 44 SEC COMERCIAL PUERT	BARRANCABERMEJA	\N	2026-02-14 06:28:04	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
283	COMERCIAL BP SAS	901349219	CALLE 17 # 6 - 104 PISO 3	MONTELIBANO	\N	2026-02-14 06:28:04	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
284	COMERCIAL BP SAS	1901349219	CALLE 10 A # 12 - 12 GUADALUPE	PUERTO LIBERTADOR	\N	2026-02-14 06:28:04	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
285	COMERCIAL BP SAS	2901349219	CALLE 20 # 9B - 24	LA PARTADA	\N	2026-02-14 06:28:04	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
286	ALIANZA REDUART S.A.S.	901049593	CL 45 H 4 04	BARRANQUILLA	\N	2026-02-14 06:28:04	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
287	JARAMILLO JARAMILLO SANTIAGO	700159299	CL 10 4 38	CARTAGO	\N	2026-02-14 06:28:04	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
288	JARAMILLO JARAMILLO SANTIAGO	1700159299	CR 5 7 44	CARTAGO	\N	2026-02-14 06:28:04	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
289	JUAN ALEJANDRO JARAMILLO	1002652738	CL 9 16 35	FLORIDA	\N	2026-02-14 06:28:04	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
29	ARIZUL DEL CARIBE S.A.S	900648001	VIA 40 # 85-410	BARRANQUILLA	\N	2026-02-14 06:27:56	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
290	MARTINEZ SAAVEDRA LIGIA MARIA	24661204	CR 23 26 58 BRR CENTRO	TULUA	\N	2026-02-14 06:28:04	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
291	MACHADO ORTEGA JESUS DAVID	88309883	CL 11 19 C 45 BRR GARUPAL  II ETAPA	VALLEDUPAR	\N	2026-02-14 06:28:04	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
292	CLASIC AM S.A.S.	901864953	CR 30 # 36 - 40	VILLAVICENCIO	\N	2026-02-14 06:28:04	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
293	GRUPO EMPRESARIAL EL SURTIDOR SAS	901595448	CLL 8 # 5 - 47 BRR CENTRO	CUCUTA	\N	2026-02-14 06:28:04	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
294	INVERSIONES DUQUE QUINTERO S.A.S.	901324937	AV PEDRO DE HEREDIA CR 27 30 01	CARTAGENA	\N	2026-02-14 06:28:04	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
295	GALVIS RODOLFO	4870	CRA 3A N,%Q% 17-61	CAUCASIA	\N	2026-02-14 06:28:04	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
296	PEREZ ACOSTA CANDY SUSANA	32930941	CR 8 10 26	SANTA ANA	\N	2026-02-14 06:28:04	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
297	RUEDA MIRANDA YERSON OSWALDO	91078808	CR 11 # 12 - 75 P 2	SAN GIL	\N	2026-02-14 06:28:04	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
298	INVERSIONES ASH S.A.S.	900469154	CRA 4 # 24 - 70	QUIBDO	\N	2026-02-14 06:28:04	mlia6gb0u2bhftxam	2026-02-19 01:52:18.269	t
299	LARGACHA CAMPO YUBERNEI	9737771	CR 8 # 4 - 33	CHAPARRAL	\N	2026-02-14 06:28:05	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
3	RAMIREZ BOTERO OSCAR MANUEL	70690518	CL 5  # 13-52	AGUACHICA	\N	2026-02-14 06:27:55	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
30	INVERSIONES GAFE S.A.S	900463519	CARRERA 49 #49-38	BELLO	\N	2026-02-14 06:27:56	mlia6gb0u2bhftxam	2026-02-19 01:52:18.269	t
300	MEDIA NARANJA	-	TODOS LOS ALMACENES	MEDELLIN	\N	2026-02-14 06:28:05	mlia6gb0u2bhftxam	2026-02-19 01:52:18.269	t
301	HERNANDEZ MONTES ANA MILENA	50929792	CL 20 CR 7 ESQU	PLANETA RICA	\N	2026-02-14 06:28:05	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
302	RESTREPO LAURA VALENTINA	1192791730	CL 4 # 10 - 59 CRR EL CENTRO	SANTANDER DE QUILICHAO	\N	2026-02-14 06:28:05	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
303	LONDO%�O MARIA DEL CARMEN	25109415	CR 15 # 16 43 BRR CENTRO	LA UNION	\N	2026-02-14 06:28:05	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
304	YONELBIS ZAMBRANO SUAREZ	6057	CRA 12 # 12 - 27	MAICAO	\N	2026-02-14 06:28:05	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
305	G&G RETAIL S.A.S	7901234880	CLL 15 A # 14 A 41	CERETE	\N	2026-02-14 06:28:05	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
306	VICTOR ANDRES AROCA	1140896249	CL 34 43 129 BG 434 CC COLOMBIA	BARRANQUILLA	\N	2026-02-14 06:28:05	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
307	SANTIAGO JARAMILLO JARAMILLO	2700159299	CRA 8 # 9 - 72 LOCAL 5	CHINCHINA	\N	2026-02-14 06:28:05	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
308	EL SURTIDOR BG SAS NUEVO	2490	AV 5 # 5 - 63 PISO 4	CUCUTA	\N	2026-02-14 06:28:05	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
309	PANTYJEANS GIRARDOT SAS 2	1900284812	CR 10 # 14 - 47 BRR CENTRO	GIRARDOT	\N	2026-02-14 06:28:05	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
31	ALMA BELLA S.A.S	900352713	CL 129 N,%�% 47 - 43 PRADO VERANIEGO	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
32	RESTREPO JARAMILLO JULIAN ANDRES	79726416	CLL 129 B # 91-64 SUBA	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
33	INTIMOS ALMA S.A.S N,%�%11	1183003804	CR 13 N,%�% 59 - 41	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
34	INTIMOS ALMA S.A.S N,%�% 14	1483003804	CR 71D N,%�% 8 - 70 SUR	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
35	INTIMOS ALMA S.A.S N,%�%24	2483003844	CR 80 N,%�% 51 - 03 SUR EXT: 1102	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
36	INTIMOS ALMA S.A.S N,%�% 3	3830038044	CR 88C N,%�% 58D 32 SUR	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
37	GUTIERREZ FANDI%�O FANNY	252456059	CRA 14 # 75 A -51 SUR B/SANTA LIBRADA	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
38	INVERSIONES 8A S.A.S N,%�%6	6900137023	CRA 6 N,%�% 23-40 SUR 20 DE JULIO	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
39	INTIMOS ALMA S.A.S N,%�%2	5830038444	CRA 80 # 51-25 SUR CASA BLANCA	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
4	P & S INVERSIONES ASOCIADOS S.A.S	901195775	CL 5 16 36	AGUACHICA	\N	2026-02-14 06:27:55	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
40	INVERSIONES 8A S.A.S N,%�%17	1790013702	DIAG. 71 B # 96-60 EXT 1117 ALAMOS NORTE	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
41	INTIMOS ALMA S.A.S N,%�%9	9830038044	TRANS.78L #68B -09/15 SUR BOSA PIAMONTE	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
42	INTIMOS ALMA S.A.S N,%�%5	5830038044	TV 4 ESTE N,%�% 37A - 28 SUR	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
43	INTIMOS ALMA S.A.S N,%�%1	1830038444	TV 78 L N,%�% 69 - 23 SUR	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
44	HEGA G B S.A.S	830091761	CALLE 37 SUR # 78 H 21	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
45	INVERSIONES GOBOTEX S A S	2830125982	CALLE 38 SUR N,%Q% 86 A-09	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
46	HEGA G B S.A.S	1830091761	CALLE 42 A #93 C 17 SUR	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
47	INVERSIONES SACHA S.A.S	2900186125	"CALLE 57 D SUR N,%Q% 78H - 14	LOCAL 227"	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
48	INVERSIONES GOBOTEX S A S	3830125982	CLL 13 # 5 - 63	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
49	INVERSIONES GOBOTEX S A S	830125982	CR 100 20 45	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
5	SALAZAR ECHEVERRI LUIS ALBERTO	170693888	CL 5 N 12 81	AGUACHICA	\N	2026-02-14 06:27:55	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
50	INVERSIONES MASSARA S.A.S	901514722	CRA 4 # 14 - 49 (DESPACHO)	LA DORADA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
51	INVERSIONES SACHA S.A.S	900186125	CR 78 B 35 C 14 SUR	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
52	ZULUAGA ARISTIZABAL SANDRA MILENA	52855335	DG 49 A SUR 53 25	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
53	NAVANA MEGATODO BOSA S.A.S	901169855	CRA 88 C # 58 D 31 SUR	BOSA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
54	ZULUAGA RAMIREZ HECTOR EMILIO	70693516	CALLE 18 19 -36	BOSCONIA	\N	2026-02-14 06:27:56	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
55	ZULUAGA GIRALDO MARTA NELLY	52024421	CL 18 18 23 LC3 BRR CENTRO	BOSCONIA	\N	2026-02-14 06:27:56	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
56	CRISTANCHO CRISTANCHO ULICES	1960	CALLE 35 # 17-18	BUCARAMANGA	\N	2026-02-14 06:27:56	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
57	ALMACENES GRAN SAS	890204683	CALLE 52 # 33-20 BARRIO CABECERA	BUCARAMANGA	\N	2026-02-14 06:27:56	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
58	ALMACENES GANE LIMITADA	890203597	CL 35 15 59 BRR CENTRO	BUCARAMANGA	\N	2026-02-14 06:27:56	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
59	COMERCIALIZADORA DE CONFECCIONES S.A.S	901217960	CLLE 35 # 16 - 61 BRR CENTRO	BUCARAMANGA	\N	2026-02-14 06:27:56	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
6	BOUTIQUE EL IMPERIO DE LA MODA DE AGUAZUL	900448728	CRA 16 # 9-48	AGUAZUL	\N	2026-02-14 06:27:55	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
60	JAIMES SUAREZ CESAR ELADIO	13925155	CR 17 34 43 49 BRR CENTRO	BUCARAMANGA	\N	2026-02-14 06:27:56	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
61	JARAMILLO LOPEZ VIVIANA PATRICIA	29231576	CALLE 3 # 36 - 39	BUENAVENTURA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
62	CARVAJAL FRANCY	10897	CARRERA 9 #2-10	BUENAVENTURA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
63	ARBOLEDA MEJIA JANETH	31588477	CL 5 5 14 BRR CENTRO SEC SANANDRESITO	BUENAVENTURA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
64	ALMACENES CRAMAR	1144	CLL 3 # 3-60	BUENAVENTURA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
65	BARRETO HORTUA JOSE IRLEY	16552612	CR 16 10 35 BRR CENTRO	CAICEDONIA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
66	INVERSIONES 8A S.A.S N,%�%21	2190013702	CRA 6 # 3 -45	CAJICA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
67	ARISTIZABAL ARISTIZABAL SANDRA LILIANA	3849	CL 14 # 8 - 50	CALI	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
68	HOYOS RAMIREZ YULIETH	29509965	CL 47 NORTE # 4 B N - 29	CALI	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
69	PARRA SUAREZ ZORAIDA EMILCEN	8528	CLLE 14 CON CRR 7 ESQUINA CC ELITE LOCAL 515	CALI	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
7	INVERSIONES GAFE SAS	1900463519	C.C. NUESTRO URABA KM 1 APARTADO	APARTADO	\N	2026-02-14 06:27:55	mlia6gb0u2bhftxam	2026-02-19 01:52:18.269	t
70	GERMOR CALI SAS	890328800	CRA 8 # 13-24	CALI	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
71	DUQUE RAMIREZ MAURICIO ALBEIRO	70694868	CRA 8 # 13-97	CALI	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
73	GIRALDO GLADYS	5800	CALLE DE LA MONEDA - ALMCN CHISPA DE MODA	CAREPA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
74	G & G RETAIL S.A.S	5901234880	CRA 25 # 48 - 10	CARMEN DE BOLIVAR	\N	2026-02-14 06:27:57	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
75	INVERSIONES SOLO MODAS S.A.S	900298207	AV PEDRO DE HEREDIA CL 30 25 04 BRR CHINO	CARTAGENA	\N	2026-02-14 06:27:57	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
76	KAR-MEL ASOCIADOS S.A.S	900441381	AV PEDRO DE HEREDIA CL 30 25 11 BRR LA QUINTA	CARTAGENA	\N	2026-02-14 06:27:57	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
77	REVOLLO POLO ESTELA BEATRIZ	57415102	AV. PEDRO DE HEREDIA # 26-75	CARTAGENA	\N	2026-02-14 06:27:57	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
78	INVERSIONES EL GIGANTE SAS	900143784	CALLE 30 # 24-58	CARTAGENA	\N	2026-02-14 06:27:57	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
79	ALIANZA M & G S.A	900196158	CALLE DE LA MONEDA # 7-156	CARTAGENA	\N	2026-02-14 06:27:57	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
8	COMERCIALIZADORA MINIMAX S.A.S.	901553853	CLL 17 # 16 - 17	ARMENIA	\N	2026-02-14 06:27:55	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
80	ALMACENES JAMBO LTDA	900266030	CC PASEO DE LA CASTELLANA LC 29 ET SEGUNDA	CARTAGENA	\N	2026-02-14 06:27:57	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
81	MODATEXTIL DEL CARIBE S.A.S.	901783220	CL 31 6535 LC 1 BRR: CHIPRE	CARTAGENA	\N	2026-02-14 06:27:57	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
82	ENERGY FASHION S.A.S.	900236935	TV 54 94 - 31	CARTAGENA	\N	2026-02-14 06:27:57	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
83	GUITIERREZ RESTREPO LAURA	1192791730	CL 10 # 4 38	CARTAGO	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
84	ALIANZA MU%�OZ GOMEZ SAS	2901079469	CRA 3A N,%Q% 17-61	CAUCASIA	\N	2026-02-14 06:27:57	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
85	ELMELAO S.A.S	900663011	CR 11 N,%�% 8 - 82	CHIA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
86	INVERSIONES 8A S.A.S N,%�%13	1390013702	CR 10 N,%�% 17 - 25	CHINQUINQUIRA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
87	DISTRIBUIDORA MUNDO FASHION	1900324182	CALLE 17 # 11-57	CIENAGA	\N	2026-02-14 06:27:57	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
88	SALAZAR ECHEVERRI LUIS ALBERTO	70693888	CL 17 13 29 BRR CENTRO	CIENAGA	\N	2026-02-14 06:27:57	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
89	JIMENEZ BERMUDEZ ALBA DE JESUS	3095	CR 57 A 47 56	CIUDAD BOLIVAR	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
9	INVERSIONES 8A S.A.S N,%�%27	2790013702	CR 9 # 10-68 LC2	BARBOSA	\N	2026-02-14 06:27:55	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
90	G & G RETAIL S.A.S	4901234880	CL 31 25 11 LC 2	COROZAL	\N	2026-02-14 06:27:57	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
91	AMPER GROUP S.A.S.	901341754	AV 8 8 55 LC 21 22 CC SAN ANTONIO BRR CENTRO	CUCUTA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
92	MATIZ VASQUEZ CARLOS JULIO	13505840	AVENIDA 5 N,%�% 7- 04	CUCUTA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
93	EL SURTIDOR BG SAS #2	1901342490	CALLE 8 # 4- 35	CUCUTA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
94	EL SURTIDOR BG SAS	901342490	CALLE 8 # 5- 47	CUCUTA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
95	RAYOTEX S.A.S	2800144409	CL 10 NRO. 0-09	CUCUTA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
97	HENRIQUEZ LOPERA MARY LUZ	60367610	CL 8 4 98 BRR CENTRO	CUCUTA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
98	TIENDAS BUV SAS	901400615	CL 8 5 87 BRR EL CENTRO	CUCUTA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
99	RAYOTEX S.A.S	800144409	CL 9 4 90 BRR CENTRO	CUCUTA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
test-restore-1	Cliente Restore	NIT-RESTORE	Direcci%%n	Ciudad	\N	\N	seller	\N	t
\.


--
-- Data for Name: compras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.compras (id, fecha, referencia, unidades, insumo, cantidad_insumo, precio_unidad, cantidad_total, total, proveedor, fecha_pedido, observacion, factura, created_at) FROM stdin;
\.


--
-- Data for Name: confeccionistas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.confeccionistas (id, name, address, city, phone, score, active, created_at) FROM stdin;
32351275	Eusse Mesa Marielena	CR 61 72 A 36	Bello	3022624809	A	1	2026-02-14 03:04:08
43923482	Gonzalez Quintero Ruby Liliana	CL 21 # 71 - 50 APT 301	Bello	4648291	A	1	2026-02-14 03:04:08
43922752	Jaramillo Jaramillo Judy Liliana (Emma Jaramillo)	AV 45 # 68 A 68 CA	Bello	3025644	AA	1	2026-02-14 03:04:08
8399305	Jaramillo Tabarez Gabriel	AUT 102 # 17 - 82 AP 225	Bello	3144927214	A	1	2026-02-14 03:04:08
43668259	Londo%�%o Lopez Lida Estella	CR 50 A # 37 - 14	Bello	4514914	AAA	1	2026-02-14 03:04:08
700320715	Molero Duran Dorisabet	CL 52 B 62 22	Bello	3042135431	A	1	2026-02-14 03:04:08
43662225	Perez Vasquez Olga Amparo	CR 62 D 74 - 73	Bello	3116896314	A	1	2026-02-14 03:04:08
32476344	Ramirez De Pati%�%o Elizabeth	DG 56 44 125 P2	Bello	3207320382	AA	1	2026-02-14 03:04:08
1035865876	Rico Perez Astrid Yulieth	CR 62 D 74 - 73	Bello	3137303193	A	1	2026-02-14 03:04:08
98579701	Rivera Jaramillo Jesus Euclives	AV 47 A 67 135 P2 BRR NIQUIA	Bello	3184587601	A	1	2026-02-14 03:04:08
39211289	Rojo Gomez Marilu	CL 32 # 57 - 28	Bello	6139046	AA	1	2026-02-14 03:04:08
43917589	Tamayo Mesa Lina Marcela	CR 53 A CL 48 - 25	Bello	4572783	A	1	2026-02-14 03:04:09
32310166	Vasquez Sanguino Nubia Estela	CL 43 A 58 13	Bello	2759779	A	1	2026-02-14 03:04:09
43920964	Zuluaga Arvaez Gloria Patricia	CL 77 CR 66 - 90 AP 101	Bello	322534805	A	1	2026-02-14 03:04:09
43467697	Alzate Cardona Mery Bernarda	CR 64 CL 25 B 42	Itag%]%%�	3090606	AAA	1	2026-02-14 03:04:09
28742199	Buitrago Serna Esperanza	CL 47 # 58-36 BRR EL ROSARIO	Itag%]%%�	3144272388	A	1	2026-02-14 03:04:09
43161076	Estrada Aguirre Angela Yaneth	CR 59 A # 47 A 35	Itag%]%%�	3165098382	A	1	2026-02-14 03:04:09
71279486	Hoyos Hernandez Juan Camilo	CR 52 D # 73 - 65	Itag%]%%�	2818182	A	1	2026-02-14 03:04:09
15927569	Llanez Alzate Pedro Proceso	CL 58 CR 65 - 10	Itag%]%%�	3711095	AAA	1	2026-02-14 03:04:09
1036674143	Lopez Herrera Vanessa	CL 47 # 61 - 81	Itag%]%%�	3147423045	A	1	2026-02-14 03:04:09
42791387	Mu%�%oz Valle Gloria Nelly	CL 49 # 46 - 09 AP 301- ASTURIAS	Itag%]%%�	3183270148	A	1	2026-02-14 03:04:09
43189668	Salazar Panesso Aura Milena	CL 67 B # 55 - 12	Itag%]%%�	3017311430	AAA	1	2026-02-14 03:04:09
17576365	Sierra Salazar Llineska Desiree	CL 13 A SUR # 53 - 112 IN 110	Itag%]%%�	3145128450	A	1	2026-02-14 03:04:09
1082964637	Vergara Bracamonte Lina Marcela	CR 75 # 94 - 18	Itag%]%%�	3011694242	A	1	2026-02-14 03:04:09
1036599696	Zapata Rios Claudia Carolina	CL 35 # 39 - 45 INT 302	Itag%]%%�	3104256640	A	1	2026-02-14 03:04:09
1038405870	Montoya Arcila Laura Yubeidy	AC 35 32 32	Marinilla	3105955757	AA	1	2026-02-14 03:04:09
43796271	Ramirez Restrepo Alba Marleny	CL 31 # 33 - 136	Marinilla	3194979218	AAA	1	2026-02-14 03:04:09
32391893	Zuluaga Gomez Cruz Elena	CL 30 CR 44 - 20	Marinilla	3144820043	A	1	2026-02-14 03:04:09
43188279	Amparo Arias Jaqueline	CALLE 97 # 23-52	Medell%�n	3022204488	A	1	2026-02-14 03:04:09
43619122	Ardila Cano Yakeline	CR 97 A 48 C 16	Medell%�n	4913266	A	1	2026-02-14 03:04:09
32439583	Arenas de Baena Rosa Ines	CL 48 DD # 99 D 95	Medell%�n	3005232060	A	1	2026-02-14 03:04:09
42843342	Arismendy Garcia Claudia Sorany	CL 36 # 92 - 27	Medell%�n	5990211	AAA	1	2026-02-14 03:04:09
1063366292	Bedoya Paternina Paula Andrea	CR 143 A # 56 - 330	Medell%�n	300296581	A	1	2026-02-14 03:04:10
1096244432	Ca%�%averal Martinez Dayan Yulithza	CR 80 # 6 sur 30 AP 302	Medell%�n	3102370621	A	1	2026-02-14 03:04:10
43048297	Casta%�%eda de Ramirez Marleny del Socorro	CR 75 # 94 - 18	Medell%�n	3147438466	A	1	2026-02-14 03:04:10
8104549	Castrillon Cardenas Edwin Alberto	CL 77 DD # 94 A 17	Medell%�n	3012707945	A	1	2026-02-14 03:04:10
1017140262	Chaverra Medina Julieth Alejandra	CR 50 # 95 - 101	Medell%�n	6034239	A	1	2026-02-14 03:04:10
34943965	Cotera Alvarez Aracelis del Carmen	CL 47 A 2 C 65	Medell%�n	3207042688	A	1	2026-02-14 03:04:10
1128444889	De Ossa Bolivar Maria Esperanza	CR 79 B 46 SUR 101 IN 0221	Medell%�n	3017466926	A	1	2026-02-14 03:04:10
43916205	Florez Estrada Claudia Patricia	CR 45 # 111 - 30	Medell%�n	3024186626	AAA	1	2026-02-14 03:04:10
1036600639	Gallego Atehortua Claudia Yaneth	KM 15 CORR SANTA ELEA	Medell%�n	5380752	A	1	2026-02-14 03:04:10
43016242	Gallego Heranndez Martha Oliva	CL 57 SUR 62 B 31	Medell%�n	2868183	A	1	2026-02-14 03:04:10
24368442	Gallego Loaiza Maria Melva	CRA 77 CLL 23-35	Medell%�n	3147774833	A	1	2026-02-14 03:04:10
1128390179	Garcia Castrillon Yuly Paulina	CR 71 # 93 - 57	Medell%�n	3185700973	A	1	2026-02-14 03:04:12
1001003896	Garcia Posada Maria Isabel	CR 112 # 13 - 155 IN 103	Medell%�n	4953405	A	1	2026-02-14 03:04:12
1045017301	Garcia Vergara Carlos Andr%�s (Michel Cano y LiliaA Garcia)	CR 44 A 20	Medell%�n	3234721063	AAA	1	2026-02-14 03:04:12
1036612879	Garnica Linares Andrea Aurora	CL 48 A SUR D 38 AP 20	Medell%�n	5065952	A	1	2026-02-14 03:04:12
39268713	Giraldo Villa Gloria Elena	CL 82 # 72 C 108	Medell%�n	4874554	A	1	2026-02-14 03:04:12
21701184	Gonzalez Palacio Doris Amparo	CR 89 B 89 101 IN 246 TO 7	Medell%�n	3225691506	AA	1	2026-02-14 03:04:12
1035304202	Guisao Miranda Yefferson Andrei	CL 102 B 84 A 109	Medell%�n	3235322458	A	1	2026-02-14 03:04:12
1035414253	Hernandez Rueda Lisceth Tatiana	CR 94 A CL 70 G C 80	Medell%�n	312520319	A	1	2026-02-14 03:04:12
1017162806	Hidalgo Cortes Diego Alberto	CL 56 # 32 - 133	Medell%�n	2168719	A	1	2026-02-14 03:04:12
43561368	Marulanda Guarin Gloria Patricia	CL 82 # 32-44	Medell%�n	3117675970	A	1	2026-02-14 03:04:12
1128430728	Mazo Restrepo Edith Nataly	AC 100 DD # 28 CB - 8 INT 201	Medell%�n	5166082	A	1	2026-02-14 03:04:12
43537983	Medina Migdalia del Socorro	CR 39 B 39 C 30	Medell%�n	6034239	A	1	2026-02-14 03:04:12
1094366162	Meneses FerAndez Tania Paola	CR 70 B 9 A 32 AP 201	Medell%�n	3125379229	A	1	2026-02-14 03:04:12
21896457	Montoya Lopez Dora Liliana	CL 68 # 58-71	Medell%�n	3113926142	A	1	2026-02-14 03:04:12
1007538923	Montoya Valderrama Jeniffer Geraldin	CR 118 CL 39 D 123 IN 110	Medell%�n	31961993	A	1	2026-02-14 03:04:12
32461771	Mu%�%oz Arredondo Maria Elvia Lucia	CR 96 47 A 176	Medell%�n	5855705	AAA	1	2026-02-14 03:04:12
43916106	Mu%�%oz Vargas July Alejandra	CL 110 C 43 A 07	Medell%�n	5221529	A	1	2026-02-14 03:04:12
43202750	Ocampo Villada Luz Aida	CR 47 # 92-89	Medell%�n	3022356712	A	1	2026-02-14 03:04:12
32297720	Olaya Gonzalez Vianeth Mileidy	CL 89 A # 39 - 46	Medell%�n	3142418994	A	1	2026-02-14 03:04:12
1042767669	Perez Waltero Linda Estefany	CR 82 C 104 D D 29	Medell%�n	3155503959	A	1	2026-02-14 03:04:12
43589459	Posada Villegas Ruth Yannet	CL 49 C # 5 - 114	Medell%�n	3024484780	A	1	2026-02-14 03:04:12
42999087	Pulgarin Mejia Josefina del Socorro	CL 80 C 74 - 188	Medell%�n	4418640	AAA	1	2026-02-14 03:04:13
43084268	Quiceno Aguirre Maria Teresa	CR 98 B # 83 B 25	Medell%�n	3002477189	AAA	1	2026-02-14 03:04:13
12435671	Quintero Contreras Edward Sadit	CL 34 # 52 - 44	Medell%�n	2316387	A	1	2026-02-14 03:04:13
43622970	Rico Bermudez Maria Eugenia	CRA 43 # 118B-21	Medell%�n	3246434020	A	1	2026-02-14 03:04:13
27894856	Rivera Chaparro Claudia Liliana	CL 20 B NORTE BRR Par%�s	Medell%�n	4715428	A	1	2026-02-14 03:04:13
1053798633	Rodas Vinasco Yesid Alexander	CL 110 # 46 - 28 IN 197	Medell%�n	3017782338	A	1	2026-02-14 03:04:13
1017157466	Rua Agudelo Cristian Alexis	CR 57 # 42 - 38	Medell%�n	3223965702	A	1	2026-02-14 03:04:13
43014769	Sepulveda Henao Dora Luz	CL 91 AB #84-106 INT 201	Medell%�n	3023695101	A	1	2026-02-14 03:04:13
43272097	Taborda Rend%%n Adriana Maria	CL 110 B 43 AA 16	Medell%�n	5226317	AA	1	2026-02-14 03:04:13
98587077	Toro Cano Hoiber	CL 92 B 56 A 24	Medell%�n	5051560	A	1	2026-02-14 03:04:13
1039079211	Usuga Carmen Yaneth	CR 16 mz 63 BRR LimoAr	Medell%�n	5705186	AAA	1	2026-02-14 03:04:13
43638585	Varela Restrepo Alba Mery	CR 118 # 39 A 50	Medell%�n	3215796407	A	1	2026-02-14 03:04:13
43865445	Vargas Agudelo Sandra Milena	CL 110 C CR 43 A 7	Medell%�n	3117313015	A	1	2026-02-14 03:04:13
1017177916	Vargas Guerra Diana Maria	CL 57 # 19 - 88 AP 204	Medell%�n	3045951934	A	1	2026-02-14 03:04:13
1041205070	Gallego Valencia Astrid Carolina	CR 48 # 49 - 20 AP 302	Santuario	3117920607	AA	1	2026-02-14 03:04:13
43788596	Jimenez Ramirez Deisy Yohana	CR 53 49 N,%�% 73 AP 402	Santuario	5672730	A	1	2026-02-14 03:04:13
1045026047	Lopez Morales Ana Mar%�a	CR 50 CL 45 B 66	Santuario	3172402992	A	1	2026-02-14 03:04:14
1045019585	Serna Ramirez Angela Maria	CL 82 # 32 - 44	Santuario	3117675970	A	1	2026-02-14 03:04:14
43118318	Vasquez Margarita Maria	DG 58 # 42 - 116	Bello	6012336	A	1	2026-02-14 03:04:14
43273110	Correa Zamora Shirley	BRR MANRIQUE CL 83 CR 4331	Medell%�n	3016112549	A	1	2026-02-14 03:04:14
1128459691	Loaiza Correa Yennifer	CRA 69 # 36 SUR 157	Medell%�n	3147080623	A	1	2026-02-14 03:04:14
1128386891	Vasquez Barrientos Leonardo Fabio (Margarita Vasquez)	CR 69 # 78 B 12 IN 310	Medell%�n	3128684424	AAA	1	2026-02-14 03:04:14
43381473	Arcila Valencia Maria Esperanza	CLL 111 F # 64 - 56	Medell%�n	3213763265	A	1	2026-02-14 03:04:14
43097913	Olaya Marta Bibiana	DG 62 AV # 48 B 30 IN 201	Bello	3218855166	AAA	1	2026-02-14 03:04:14
8058195	Araujo Rodriguez Hernan Dario (Aura Rodriguez)	CLL 49 A # 56 A 9 IN 104	Bello	3122821121	AA	1	2026-02-14 03:04:14
43181466	Gil Saldarriaga Erica Astrid	CL 38 SUR 77 10J LOS ANGELES	Itag%]%%�	3046377165	AAA	1	2026-02-14 03:04:14
1046667079	Cardona Valencia Camila	CLL 37 B # SUR 82 D 20	Medell%�n	3017797376	A	1	2026-02-14 03:04:14
1152190746	Graciano Sepulveda Yira Marcela	VDA AGUAS FRIAS BRR BELEN	Medell%�n	2385625	AAA	1	2026-02-14 03:04:14
700469989	Marquez Uribe David Esteban	CRR 58 A 65 # 22 IN 301	Itag%]%%�	3124081795	A	1	2026-02-14 03:04:14
43283514	Vargas Araque Maria Dolly	DG 30 # 33 A SUR 34	Envigado	3105924202	A	1	2026-02-14 03:04:14
1152457615	Lopez Gallego Luz Mary	CALLE 31 # 109-42 BELEN	Medell%�n	3003194787	A	1	2026-02-14 03:04:15
71223381	Restrepo Olaya Elkin Emilio (Nancy Arboleda)	CALLE 14 SUR # 58 B 05	Itag%]%%�	3116940715	AAA	1	2026-02-14 03:04:15
1037886122	Gomez Arcila Leon david	CL 33 # 33 - 19 AP 301	Marinilla	3116642376	A	1	2026-02-14 03:04:15
98514920	Loaiza Saldarriaga Johan Adiel	VDA EL SALADO SEC LA CANDELA	Medell%�n	3136698557	A	1	2026-02-14 03:04:15
1013617204	Cardenas Hernandez Nestor Julian	DG 31 D # 32 SUR 15 APTO 302	Medell%�n	3026033654	AAA	1	2026-02-14 03:04:15
39439040	Arcila Montoya Alba Mirian	CL 33 33 19 AP 301	Marinilla	3104906527	AAA	1	2026-02-14 03:04:15
1038416826	Mu%�%oz Montoya kevin	CL 24 30 44	Marinilla	3235027832	A	1	2026-02-14 03:04:16
1018230626	Berrio Jorge Luis	Cr 81 54 51 AP 101	Medell%�n	3054270414	A	1	2026-02-14 03:04:16
45769944	Bele%�%o Ariza Ebeth Isabel	Cll 45 d 16 30	Medell%�n	3205268697	AA	1	2026-02-14 03:04:16
1020436106	Sanchez Sanchez Evelin Yaheni	DG 55 46 48 BRR Niquia	Bello	3116457499	A	1	2026-02-14 03:04:17
1017159858	Mazo Guerra Jhon Jader	CL 65 Cr 16 DD	Medell%�n	3015703383	A	1	2026-02-14 03:04:17
700530400	Cubillan Contreras Mariu Eugenia	Cl 47 29 39 IN 111	Copacabana	3042872273	AAA	1	2026-02-14 03:04:17
43115930	Amaya Trujillo Adriana Patricia	AV 48 A 65 115	Bello	5979171	AA	1	2026-02-14 03:04:17
43843857	Mu%�%oz Salazar Luz Yenny	CALL 40A SUR #59-40 INT 201	Medell%�n	3026221102	A	1	2026-02-14 03:04:17
1037264064	Correa Piedrahita Diana Andrea	CALL 83 #57-22	Medell%�n	3104665496	AAA	1	2026-02-14 03:04:17
1001686689	Garrido Bartolo Karen  (Maria Isabel Bartolo)	Cr 56 46 37 in 201	Itag%]%%�	3044223445	AA	1	2026-02-14 03:04:17
43429023	Lopera Torres Luz Doris	CALL 55 # 46-21	Bello	3017227142	A	1	2026-02-14 03:04:17
1037325550	Pulgarin Giraldo Didier	Carrera 4 # 2 - 72	Jardin	3217516834	A	1	2026-02-14 03:04:17
1036608419	Casta%�%o Acevedo Jhon Euliser	CL 35 49 37	Itag%]%%�	3122908488	A	1	2026-02-14 03:04:17
43989889	Sierra Claudia Marcela	Cr 46 106 A 28 Ap 302	Medell%�n	3146021287	A	1	2026-02-14 03:04:17
43517753	Cossio Parra Maria Eugenia	Cr 20 A 58 08 MZ 13	Dosquebradas	3015093148	A	1	2026-02-14 03:04:17
1040871321	Ospina Casta%�%eda Paulina	Cr 45 A 20 39	Marinilla	3208067864	A	1	2026-02-14 03:04:18
1234991468	Quiroz Garcia Luisa Fernanda	CARR 59D  #41D SUR 23	Medell%�n	3244399156	A	1	2026-02-14 03:04:18
21713597	Chavarria Chavarria Maria Bernanda	Cll 76 50 14 Santa Maria	Itag%]%%�	3712520	A	1	2026-02-14 03:04:18
43400859	Casta%�%eda Alvarez Laura Shirley	Cll 124 a sur cr 50 b 12	Caldas	3006015843	AA	1	2026-02-14 03:04:18
42897491	Gomez Berrio Lorena Maria	Cll 96 b 50 aa 26	La Estrella	3128743193	AA	1	2026-02-14 03:04:18
71366811	Salazar Blanco Edier Ferley	Cll 118 42 B 54	Medell%�n	3207420013	AA	1	2026-02-14 03:04:18
43115719	Sanchez Espinoza Claudia De Jesus	Cll 94 D 79 A 59 in 201	Medell%�n	3017197220	A	1	2026-02-14 03:04:18
1152447519	Jaramillo Gallego Angelica Maria	Cr 2102 B 49 b 18	Medell%�n	3015588007	A	1	2026-02-14 03:04:18
43818822	Zapata Valencia Eliana Maria	Cr 55 95 A 13 AP 306	Medell%�n	3012608251	AA	1	2026-02-14 03:04:18
1027881749	Cano Acevedo Mary Luz	Cr 55 54 44	Bello	3213192748	A	1	2026-02-14 03:04:18
1037599747	Soto Marulanda Leidy Selene	Cl 55 7 165 In 105	Medell%�n	3108973012	A	1	2026-02-14 03:04:18
43825606	Alzate Pineda Olga Lucia	Cl 34 A 40 42	Itag%]%%�	3043367407	AA	1	2026-02-14 03:04:19
1035862169	Zuluaga Cardona Elisa Maria	Av 35 42 EE 102 ATR	Bello	3193310554	AA	1	2026-02-14 03:04:19
100205983	Tobon Alvarez Laura Micheli	Cl 82 71 a 42	Medell%�n	3145453566	A	1	2026-02-14 03:04:19
1065818962	Carolina Gil Arias Yazmin	Cl 56 58 FF 28 in 201	Itag%]%%�	3122746029	A	1	2026-02-14 03:04:19
1033649051	Montoya Arboleda Ana Isabel	Cl 103 G 64 D 28 101	Medell%�n	3148470510	AAA	1	2026-02-14 03:04:19
43744055	Rivera Higuita Gladys Elena	Cr 47 76 sur 12	Sabaneta	3233305339	AA	1	2026-02-14 03:04:19
43727411	Torres Alvarez Marta Cecilia	Cl 31 D 100 B 33	Medell%�n	3213539701	AA	1	2026-02-14 03:04:19
1017148861	Amaya Macias Yecenia	Cl 96 82 18	Medell%�n	3103751591	A	1	2026-02-14 03:04:19
1128388462	Sierra Garcia Adriana	CR 97 aa 66 55	Medell%�n	3126941601	AA	1	2026-02-14 03:04:19
287890791	Usuga Rojas Teresa De Jesus	Cr 43 108 118 AP 130	Medell%�n	3217035197	AA	1	2026-02-14 03:04:19
55238173	Silvera Arenilla Eileen Jattin	CL 82 CR 50 A in 201	Itag%]%%�	3146681728	A	1	2026-02-14 03:04:19
700308111	Medina de Gonzalez Yezenia Lorena	DG 69 B AV B ap 95	Bello	3249653566	A	1	2026-02-14 03:04:19
1084732805	Fernandez Duran Yalides Maria	CL 62 Cr 109 A 120	Medell%�n	3002550065	AA	1	2026-02-14 03:04:19
35855609	Mausa Cordero Ana Olfiria	Cl 84 50 E 53 Cmapo Valdes	Medell%�n	3145945954	A	1	2026-02-14 03:04:19
3800154	Hinestroza Valencia Norelvis	CL 30 B 114 73	Medell%�n	3046111584	A	1	2026-02-14 03:04:19
1017202088	Mu%�%oz Campi%�%o Natalia Andrea	Cr 38 95 a 33	Medell%�n	3114311083	A	1	2026-02-14 03:04:20
1010208134	Useche Posada Gennifer Natali	DG 31 D 32 sur 15 in 302	Envigado	3507046736	A	1	2026-02-14 03:04:20
70417905	Taborda Garcia Silvio De Jesus	CL 37 aa 40 127 San Jose	Itag%]%%�	3233595147	A	1	2026-02-14 03:04:20
1039464753	Delgado Ramirez Alejandro (Yamile Valencia)	Cr 41 A 86 A 49	Medell%�n	3005534084	AA	1	2026-02-14 03:04:20
1026279312	Vargas Ruiz Daniela	Cl 93 sur 1 H 22 este	Bogota	3133883095	A	1	2026-02-14 03:04:20
21450450	Henao Mira Alba Nelly	Cr 51 Cl 95 in 104	Medell%�n	3233478085	A	1	2026-02-14 03:04:20
1128482429	Zapata Rua Ana Julieta	Cr 53 A 89 53 Aranjuez	Medell%�n	3045832657	AA	1	2026-02-14 03:04:20
\.


--
-- Data for Name: correria_catalog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.correria_catalog (id, correria_id, reference_id, added_at) FROM stdin;
mll8jdc40al25ozf8	mljjqn48zbxhtg0yw	12129	2026-02-13 18:42:49
mllajapdkd3lljisc	mljjqn48zbxhtg0yw	12366	2026-02-13 19:38:45
mllajapkz4rq68f0k	mljjqn48zbxhtg0yw	12395	2026-02-13 19:38:45
mllajapsytmtzvuhc	mljjqn48zbxhtg0yw	12431	2026-02-13 19:38:45
mllajapyfv97bi46l	mljjqn48zbxhtg0yw	12442	2026-02-13 19:38:45
mllajaq6txcpnvcmt	mljjqn48zbxhtg0yw	12463	2026-02-13 19:38:45
mllajaqd4rqbj1gh1	mljjqn48zbxhtg0yw	12473	2026-02-13 19:38:45
mllajaqk9wjt4b4xi	mljjqn48zbxhtg0yw	12574	2026-02-13 19:38:45
mllajaqsbk29euyg3	mljjqn48zbxhtg0yw	12581	2026-02-13 19:38:45
mllajar2jqn33017q	mljjqn48zbxhtg0yw	12617	2026-02-13 19:38:45
mllajare5gcg75dgp	mljjqn48zbxhtg0yw	12640	2026-02-13 19:38:45
mllajaroe3tu2htwb	mljjqn48zbxhtg0yw	12644	2026-02-13 19:38:45
mllajarum89y5q2bf	mljjqn48zbxhtg0yw	12665	2026-02-13 19:38:45
mllajas29ahb2axyr	mljjqn48zbxhtg0yw	12679	2026-02-13 19:38:45
mllajas9ghekj18d2	mljjqn48zbxhtg0yw	12680	2026-02-13 19:38:45
mllajasg5bgp2zf7o	mljjqn48zbxhtg0yw	12692	2026-02-13 19:38:45
mllajason396ns0wf	mljjqn48zbxhtg0yw	12693	2026-02-13 19:38:45
mllajasu43myq8szj	mljjqn48zbxhtg0yw	12694	2026-02-13 19:38:45
mllajat2hsgkqgrce	mljjqn48zbxhtg0yw	12698	2026-02-13 19:38:45
mllajat9ezn7md618	mljjqn48zbxhtg0yw	12699	2026-02-13 19:38:45
mllajathkriirotsx	mljjqn48zbxhtg0yw	12704	2026-02-13 19:38:45
mllajato8txpoy6ha	mljjqn48zbxhtg0yw	12708	2026-02-13 19:38:45
mllajatxamly1v3bg	mljjqn48zbxhtg0yw	12737	2026-02-13 19:38:45
mllajau36jpufdspl	mljjqn48zbxhtg0yw	12744	2026-02-13 19:38:45
mllajau9kom60nljz	mljjqn48zbxhtg0yw	12747	2026-02-13 19:38:45
mllajauhh99322xpq	mljjqn48zbxhtg0yw	12754	2026-02-13 19:38:45
mllajauorzs6xwgdt	mljjqn48zbxhtg0yw	12771	2026-02-13 19:38:45
mllajauyv4hx50dpw	mljjqn48zbxhtg0yw	12777	2026-02-13 19:38:45
mllajav5xa5mklas7	mljjqn48zbxhtg0yw	12782	2026-02-13 19:38:45
mllajavdidw1fyqoq	mljjqn48zbxhtg0yw	12783	2026-02-13 19:38:45
mllajavkn7kij9761	mljjqn48zbxhtg0yw	12805	2026-02-13 19:38:45
mllajavsslhwtwu7b	mljjqn48zbxhtg0yw	12809	2026-02-13 19:38:45
mllajavz0bhnhabsd	mljjqn48zbxhtg0yw	12817	2026-02-13 19:38:45
mllajaw7sf484e80j	mljjqn48zbxhtg0yw	12818	2026-02-13 19:38:45
mllajaweizi45ou9f	mljjqn48zbxhtg0yw	12820	2026-02-13 19:38:45
mllajawm0j335r533	mljjqn48zbxhtg0yw	12821	2026-02-13 19:38:45
mllajawtur7a3p5h8	mljjqn48zbxhtg0yw	12823	2026-02-13 19:38:45
mllajawz3vumz5mb5	mljjqn48zbxhtg0yw	12825	2026-02-13 19:38:45
mllajax88bu62rxyf	mljjqn48zbxhtg0yw	12828	2026-02-13 19:38:45
mllajaxewrm28bivm	mljjqn48zbxhtg0yw	12831	2026-02-13 19:38:45
mllajaxl2mbcevzwi	mljjqn48zbxhtg0yw	12834	2026-02-13 19:38:45
mllajaxsdfj4x4e4y	mljjqn48zbxhtg0yw	12835	2026-02-13 19:38:45
mllajay0fhhdbcx40	mljjqn48zbxhtg0yw	12836	2026-02-13 19:38:45
mllajay8gca15ouj1	mljjqn48zbxhtg0yw	12837	2026-02-13 19:38:45
mllajaygp75kqv1wu	mljjqn48zbxhtg0yw	12840	2026-02-13 19:38:45
mllajayoccnnhb9hr	mljjqn48zbxhtg0yw	12841	2026-02-13 19:38:45
mllajayuf75ianpl4	mljjqn48zbxhtg0yw	12855	2026-02-13 19:38:45
mllajaz3lyeypcm4q	mljjqn48zbxhtg0yw	12860	2026-02-13 19:38:45
mllajaz9x5pehtvyk	mljjqn48zbxhtg0yw	12861	2026-02-13 19:38:45
mllajazhpekit02qq	mljjqn48zbxhtg0yw	12862	2026-02-13 19:38:45
mllajaznixbyoy974	mljjqn48zbxhtg0yw	12864	2026-02-13 19:38:45
mllajazww81x1twu4	mljjqn48zbxhtg0yw	12865	2026-02-13 19:38:45
mllajb04rmg5cexvw	mljjqn48zbxhtg0yw	12866	2026-02-13 19:38:45
mllajb0bg5r5fjt84	mljjqn48zbxhtg0yw	12868	2026-02-13 19:38:45
mllajb0iewad2xygh	mljjqn48zbxhtg0yw	12870	2026-02-13 19:38:45
mllajb0oqrfztmnps	mljjqn48zbxhtg0yw	12871	2026-02-13 19:38:45
mllajb0xvofefsf2d	mljjqn48zbxhtg0yw	12872	2026-02-13 19:38:45
mllajb13n33z959qj	mljjqn48zbxhtg0yw	12873	2026-02-13 19:38:45
mllajb1b9zjfr23hs	mljjqn48zbxhtg0yw	12875	2026-02-13 19:38:45
mllajb1hj846kimpt	mljjqn48zbxhtg0yw	12876	2026-02-13 19:38:45
mllajb1ma39bw54z7	mljjqn48zbxhtg0yw	12877	2026-02-13 19:38:45
mllajb1u4ab5blhjs	mljjqn48zbxhtg0yw	12878	2026-02-13 19:38:45
mllajb21a1s3g5n8h	mljjqn48zbxhtg0yw	12879	2026-02-13 19:38:45
mllajb28o9mvt5o26	mljjqn48zbxhtg0yw	12880	2026-02-13 19:38:45
mllajb2f0l0pd53sb	mljjqn48zbxhtg0yw	12881	2026-02-13 19:38:45
mllajb2mzcc0tjxr7	mljjqn48zbxhtg0yw	12882	2026-02-13 19:38:45
mllajb2umnw3oou6r	mljjqn48zbxhtg0yw	12883	2026-02-13 19:38:45
mllajb32zmv64r206	mljjqn48zbxhtg0yw	12884	2026-02-13 19:38:45
mllajb3ahb8b0w49f	mljjqn48zbxhtg0yw	12885	2026-02-13 19:38:45
mllajb3ln9nquw8yr	mljjqn48zbxhtg0yw	12888	2026-02-13 19:38:45
mllajb3rc736j9602	mljjqn48zbxhtg0yw	12889	2026-02-13 19:38:45
mllajb3xg5vg8pvv1	mljjqn48zbxhtg0yw	12892	2026-02-13 19:38:45
mllajb45mxi3yt5ky	mljjqn48zbxhtg0yw	12893	2026-02-13 19:38:45
mllajb4btawy78ch0	mljjqn48zbxhtg0yw	12897	2026-02-13 19:38:45
mllajb4jojzapnr95	mljjqn48zbxhtg0yw	12898	2026-02-13 19:38:45
mllajb4qtvlkytzo6	mljjqn48zbxhtg0yw	12905	2026-02-13 19:38:45
mllajb4yuzm2gbo3b	mljjqn48zbxhtg0yw	12906	2026-02-13 19:38:45
mllajb55jzte2wqbe	mljjqn48zbxhtg0yw	12907	2026-02-13 19:38:45
mllajb5cvj1xogqzp	mljjqn48zbxhtg0yw	12908	2026-02-13 19:38:45
mllajb5lfdt3x4wsz	mljjqn48zbxhtg0yw	12909	2026-02-13 19:38:45
mllajb5rxdxzzoz1c	mljjqn48zbxhtg0yw	12910	2026-02-13 19:38:45
mllajb5zh4txfnvxa	mljjqn48zbxhtg0yw	12911	2026-02-13 19:38:45
mllajb65jyr68sbco	mljjqn48zbxhtg0yw	12912	2026-02-13 19:38:45
mllajb6c9tv8zx8ts	mljjqn48zbxhtg0yw	12913	2026-02-13 19:38:45
mllajb6kmxt4lbhwm	mljjqn48zbxhtg0yw	12914	2026-02-13 19:38:45
mllajb6sra4u1j1dw	mljjqn48zbxhtg0yw	12915	2026-02-13 19:38:45
mllajb71fx6187hmh	mljjqn48zbxhtg0yw	12916	2026-02-13 19:38:45
mllajb78y92b975mo	mljjqn48zbxhtg0yw	12917	2026-02-13 19:38:46
mllajb7fj7v04cumh	mljjqn48zbxhtg0yw	12918	2026-02-13 19:38:46
mllajb7lbiwpptn35	mljjqn48zbxhtg0yw	12919	2026-02-13 19:38:46
mllajb7simxcl2rf9	mljjqn48zbxhtg0yw	12920	2026-02-13 19:38:46
mllajb7yunlcrh87f	mljjqn48zbxhtg0yw	12921	2026-02-13 19:38:46
mllajb832w918soc8	mljjqn48zbxhtg0yw	12922	2026-02-13 19:38:46
mllajb8dtrlaedtq0	mljjqn48zbxhtg0yw	12923	2026-02-13 19:38:46
mllajb8jyms7ape7o	mljjqn48zbxhtg0yw	12924	2026-02-13 19:38:46
mllajb8rphe3hnotx	mljjqn48zbxhtg0yw	12926	2026-02-13 19:38:46
mllajb8xjis81bqa9	mljjqn48zbxhtg0yw	12931	2026-02-13 19:38:46
mllajb95am775w3cm	mljjqn48zbxhtg0yw	12933	2026-02-13 19:38:46
mllajb9cfucyg6nji	mljjqn48zbxhtg0yw	12934	2026-02-13 19:38:46
mllajb9ic23b0dr6m	mljjqn48zbxhtg0yw	12935	2026-02-13 19:38:46
mllajb9rdcaqk8s6d	mljjqn48zbxhtg0yw	12936	2026-02-13 19:38:46
mllajb9y67tnllz17	mljjqn48zbxhtg0yw	12937	2026-02-13 19:38:46
mllajba6ikbxifg0w	mljjqn48zbxhtg0yw	12939	2026-02-13 19:38:46
mllajbaq4ozkbkxaf	mljjqn48zbxhtg0yw	12940	2026-02-13 19:38:46
mllajbb4p3kke6gon	mljjqn48zbxhtg0yw	12941	2026-02-13 19:38:46
mllajbbj9ojj1jpwa	mljjqn48zbxhtg0yw	12942	2026-02-13 19:38:46
mllajbbuznk9tuwyb	mljjqn48zbxhtg0yw	12943	2026-02-13 19:38:46
mllajbc4on70ge4pd	mljjqn48zbxhtg0yw	12945	2026-02-13 19:38:46
mllajbcd8lh3ut6w2	mljjqn48zbxhtg0yw	12946	2026-02-13 19:38:46
mllajbcrhwjpqlpyw	mljjqn48zbxhtg0yw	12950	2026-02-13 19:38:46
mllajbd3fv2467ipm	mljjqn48zbxhtg0yw	12951	2026-02-13 19:38:46
mllajbdccd6wth8ev	mljjqn48zbxhtg0yw	12952	2026-02-13 19:38:46
mllajbdjtgqy4a9hf	mljjqn48zbxhtg0yw	12953	2026-02-13 19:38:46
mllajbdrvlsi80xcf	mljjqn48zbxhtg0yw	12955	2026-02-13 19:38:46
mllajbe0lbjb25ijw	mljjqn48zbxhtg0yw	12956	2026-02-13 19:38:46
mllajbe8wcogyipkx	mljjqn48zbxhtg0yw	12957	2026-02-13 19:38:46
mllajbefoq2of56hf	mljjqn48zbxhtg0yw	12958	2026-02-13 19:38:46
mllajbem5jycd4ubm	mljjqn48zbxhtg0yw	12959	2026-02-13 19:38:46
mllajbev5r9kahmvf	mljjqn48zbxhtg0yw	12960	2026-02-13 19:38:46
mllajbf3jpf1h8tmi	mljjqn48zbxhtg0yw	12961	2026-02-13 19:38:46
\.


--
-- Data for Name: correrias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.correrias (id, name, year, active, created_at) FROM stdin;
mljjqn48zbxhtg0yw	Inicio de a%�%o	2026	1	2026-02-12 14:20:52
mljjrcujmtckild4r	Madres	2026	1	2026-02-12 14:21:25
\.


--
-- Data for Name: cortes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cortes (id, ficha_costo_id, numero_corte, fecha_corte, cantidad_cortada, materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones, total_materia_prima, total_mano_obra, total_insumos_directos, total_insumos_indirectos, total_provisiones, costo_real, precio_venta, rentabilidad, costo_proyectado, diferencia, margen_utilidad, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: delivery_dates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.delivery_dates (id, confeccionista_id, reference_id, quantity, send_date, expected_date, delivery_date, process, observation, created_at, created_by) FROM stdin;
mlpc8c2cnhamwad90	15927569	12877	150	2026-01-15	2026-02-01	\N	\N	\N	2026-02-16 15:36:08.637	Admin Principal
\.


--
-- Data for Name: disenadoras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.disenadoras (id, nombre, cedula, telefono, activa, created_at, updated_at) FROM stdin;
75170dd2-7749-4e0b-9aef-835c5bc0bf08	Dise%�%adora Prueba	9999999999	3009999999	t	2026-02-21 23:15:29.148352	2026-02-21 23:15:29.148352
8c6e8684-fc82-4cbc-993a-c4e6c42fafdb	Mar%�,%�a Garc%�,%�a	1234567890	3001234567	t	2026-02-25 16:02:21.212694	2026-02-25 16:02:21.212694
\.


--
-- Data for Name: dispatch_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dispatch_items (id, dispatch_id, reference, quantity) FROM stdin;
\.


--
-- Data for Name: dispatches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dispatches (id, client_id, correria_id, invoice_no, remission_no, dispatched_by, created_at) FROM stdin;
test-id	300	mljjqn48zbxhtg0yw	-	-	Admin	2026-02-26 23:38:52.694915
\.


--
-- Data for Name: fichas_cortes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fichas_cortes (id, ficha_costo_id, numero_corte, fecha_corte, cantidad_cortada, ficha_corte, materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones, total_materia_prima, total_mano_obra, total_insumos_directos, total_insumos_indirectos, total_provisiones, costo_real, precio_venta, rentabilidad, costo_proyectado, diferencia, margen_utilidad, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: fichas_costo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fichas_costo (id, referencia, ficha_diseno_id, descripcion, marca, novedad, muestra1, muestra2, observaciones, foto1, foto2, materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones, total_materia_prima, total_mano_obra, total_insumos_directos, total_insumos_indirectos, total_provisiones, costo_total, precio_venta, rentabilidad, margen_ganancia, costo_contabilizar, desc0_precio, desc0_rent, desc5_precio, desc5_rent, desc10_precio, desc10_rent, desc15_precio, desc15_rent, cantidad_total_cortada, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: fichas_diseno; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fichas_diseno (id, referencia, disenadora_id, descripcion, marca, novedad, muestra1, muestra2, observaciones, foto1, foto2, materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones, total_materia_prima, total_mano_obra, total_insumos_directos, total_insumos_indirectos, total_provisiones, costo_total, importada, created_by, created_at, updated_at) FROM stdin;
941c12b2-aeee-432c-adf1-f8e7fab0861a	10210	75170dd2-7749-4e0b-9aef-835c5bc0bf08							\N	\N	[]	[]	[]	[]	[]	0.00	0.00	0.00	0.00	0.00	0.00	f	mlvq40fm4ulz5ydor	2026-02-21 23:16:09.070406	2026-02-21 23:16:09.070406
8f4e0fab-1f58-4aca-8ce6-6d334b0a6660	12364	75170dd2-7749-4e0b-9aef-835c5bc0bf08							\N	\N	[]	[]	[]	[]	[]	0.00	0.00	0.00	0.00	0.00	0.00	f	mlvq40fm4ulz5ydor	2026-02-21 23:18:19.548525	2026-02-21 23:18:19.548525
\.


--
-- Data for Name: inventory_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_movements (id, reference_id, movement_type, quantity, source, destination, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: maletas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maletas (id, nombre, correria_id, referencias, created_by, created_at, updated_at) FROM stdin;
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
mlsknr6ze3ghsw5lh	12923	18	0.00
mlsknr6ze3ghsw5lh	12882	18	0.00
mlsknr6ze3ghsw5lh	12909	18	0.00
mlsknr6ze3ghsw5lh	12872	18	0.00
mlsknr6ze3ghsw5lh	12911	18	0.00
mlsknr6ze3ghsw5lh	12919	18	0.00
mlsknr6ze3ghsw5lh	12926	18	0.00
mlsknr6ze3ghsw5lh	12835	12	0.00
mlsknr6ze3ghsw5lh	12831	12	0.00
mlsknr6ze3ghsw5lh	12836	12	0.00
mlsknr6ze3ghsw5lh	12855	12	0.00
mlsknr6ze3ghsw5lh	12129	12	0.00
mlsknr6ze3ghsw5lh	12841	12	0.00
mlsknr6ze3ghsw5lh	12834	12	0.00
mlsknr6ze3ghsw5lh	12825	12	0.00
mlsknr6ze3ghsw5lh	12818	12	0.00
mlsknr6ze3ghsw5lh	12821	12	0.00
mlsknr6ze3ghsw5lh	12840	12	0.00
mlsknr6ze3ghsw5lh	12923	18	0.00
mlsknr6ze3ghsw5lh	12882	18	0.00
mlsknr6ze3ghsw5lh	12909	18	0.00
mlsknr6ze3ghsw5lh	12872	18	0.00
mlsknr6ze3ghsw5lh	12911	18	0.00
mlsknr6ze3ghsw5lh	12919	18	0.00
mlsknr6ze3ghsw5lh	12926	18	0.00
mlsknr6ze3ghsw5lh	12835	12	0.00
mlsknr6ze3ghsw5lh	12831	12	0.00
mlsknr6ze3ghsw5lh	12836	12	0.00
mlsknr6ze3ghsw5lh	12855	12	0.00
mlsknr6ze3ghsw5lh	12129	12	0.00
mlsknr6ze3ghsw5lh	12841	12	0.00
mlsknr6ze3ghsw5lh	12834	12	0.00
mlsknr6ze3ghsw5lh	12825	12	0.00
mlsknr6ze3ghsw5lh	12818	12	0.00
mlsknr6ze3ghsw5lh	12821	12	0.00
mlsknr6ze3ghsw5lh	12840	12	0.00
mlvqvvv4xeps9sa84	12877	45	10900.00
mlvqvvv4xeps9sa84	12871	100	10000.00
mlsknr6ze3ghsw5lh	12923	18	0.00
mlsknr6ze3ghsw5lh	12882	18	0.00
mlsknr6ze3ghsw5lh	12909	18	0.00
mlsknr6ze3ghsw5lh	12872	18	0.00
mlsknr6ze3ghsw5lh	12911	18	0.00
mlsknr6ze3ghsw5lh	12919	18	0.00
mlsknr6ze3ghsw5lh	12926	18	0.00
mlsknr6ze3ghsw5lh	12835	12	0.00
mlsknr6ze3ghsw5lh	12831	12	0.00
mlsknr6ze3ghsw5lh	12836	12	0.00
mlsknr6ze3ghsw5lh	12855	12	0.00
mlsknr6ze3ghsw5lh	12129	12	0.00
mlsknr6ze3ghsw5lh	12841	12	0.00
mlsknr6ze3ghsw5lh	12834	12	0.00
mlsknr6ze3ghsw5lh	12825	12	0.00
mlsknr6ze3ghsw5lh	12818	12	0.00
mlsknr6ze3ghsw5lh	12821	12	0.00
mlsknr6ze3ghsw5lh	12840	12	0.00
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, client_id, seller_id, correria_id, total_value, created_at, settled_by, order_number) FROM stdin;
mlsknr6ze3ghsw5lh	179	mlia6sxbdfmbvlex0	mljjqn48zbxhtg0yw	6616200.00	2026-02-18T21:56:32.747Z	Admin Principal	1
mlvqvvv4xeps9sa84	157	mlia6sxbdfmbvlex0	mljjqn48zbxhtg0yw	1490500.00	2026-02-21T03:14:08.272Z	Admin Principal	3
\.


--
-- Data for Name: product_references; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_references (id, description, price, designer, cloth1, avg_cloth1, cloth2, avg_cloth2, active, created_at) FROM stdin;
12129	CROPTO MULTICOLORES	27900.00	JACKELINE PEREA	BENGALINA SUBLIMAR	0.47	\N	\N	1	2026-02-13 15:45:42
12366	CROP TOP SRL	19900.00	CATALINA CASTRO	RUSTIQUE	0.30	\N	\N	1	2026-02-13 15:45:42
12395	CAMISETA ASIMETRICO BOLEROS POPELINA	32900.00	MARTHA RAMIREZ	RIB GATO	0.86	POPELINA	0.29	1	2026-02-13 15:45:42
12431	TUBULAR APLIQUE FASHION	14900.00	JENNIFER QUINTERO	TH	0.48	\N	\N	1	2026-02-13 15:45:42
12442	CONJUNTO LINO ENVIVADO MANGA SISA	42900.00	MARTHA RAMIREZ	LINO PRAGA	1.24	\N	\N	1	2026-02-13 15:45:42
12463	BUSO TEXTURA	24900.00	CATALINA CASTRO	KROLGE	0.59	\N	\N	1	2026-02-13 15:45:42
12473	TOP CON AMARRE Y BRILLOS	29900.00	JENNIFER QUINTERO	FLATY	0.39	\N	\N	1	2026-02-13 15:45:42
12574	TOP ESCOTE CON BRILLOS	25900.00	JENNIFER QUINTERO	AMORELA	0.38	\N	\N	1	2026-02-13 15:45:42
12581	DUO BODY CON TOP	32900.00	JENNIFER QUINTERO	KENIA	0.72	AMELIA	0.20	1	2026-02-13 15:45:42
12617	BODY CON CORTES FORRADO	35900.00	JENNIFER QUINTERO	LYCRAMATE	0.94	\N	\N	1	2026-02-13 15:45:42
12640	CAMISILLA APLIQUE PIEDRAS FTE	24900.00	MARTHA RAMIREZ	RIB	0.48	\N	\N	1	2026-02-13 15:45:42
12644	CAMISETA CORPI%�O PEIDRAS	37900.00	MARTHA RAMIREZ	LYCRA PRAGA	0.67	\N	\N	1	2026-02-13 15:45:43
12665	CAMISETA LARGA BASICA SMILE	19900.00	MARIA MERCEDES	LYCRA PRAGA	0.52	\N	\N	1	2026-02-13 15:45:43
12679	BUSTIER CON MALLA	23900.00	MARIANA OCAMPO	MALLA	0.27	AMELIA	0.22	1	2026-02-13 15:45:43
12680	BLUSA TIRAS BRILLANTES	16900.00	MARIANA OCAMPO	RIB	0.30	\N	\N	1	2026-02-13 15:45:43
12692	BASICA CON BRILLO NEGRO	21900.00	MARIANA OCAMPO	PUNTO ROMA	0.34	\N	\N	1	2026-02-13 15:45:43
12693	BUSTIER EN RIB	25900.00	MARIANA OCAMPO	RIB	0.37	\N	\N	1	2026-02-13 15:45:43
12694	BLUSA CON AMARRE ESPALDA	24900.00	MARIANA OCAMPO	LENTEJUELAS	0.31	AMELIA	0.13	1	2026-02-13 15:45:43
12698	BUSTIER ESTRAPLE	21900.00	MARIANA OCAMPO	BENGALINA BLUZZ	0.31	\N	\N	1	2026-02-13 15:45:43
12699	CAMISETA SOBREPUESTOCORSET	24900.00	MARTHA RAMIREZ	LYCRA PRAGA	0.43	BLONDA	0.17	1	2026-02-13 15:45:43
12704	CHALECO CUELLO HALTER	29900.00	MARIANA OCAMPO	BENGALINA PANA	0.56	\N	\N	1	2026-02-13 15:45:43
12708	CAMISETA CON MANGA EN OJALILLO	24900.00	MARIANA OCAMPO	LYCRA PRAGA	0.59	OJALILLO	0.21	1	2026-02-13 15:45:43
12737	BUSTIER CORTES	22900.00	MARIANA OCAMPO	PUNTO ROMA	0.29	\N	\N	1	2026-02-13 15:45:43
12744	BODY RECOGIDO	19900.00	MARIANA OCAMPO	AMELIA	0.48	\N	\N	1	2026-02-13 15:45:43
12747	CAMISETA MAGA REDOBLADA CON CHISPIADO Y APLIQUE	31900.00	MARTHA RAMIREZ	LYCRA PRAGA	0.52	\N	\N	1	2026-02-13 15:45:43
12754	BLUSA PERILLA BOTONES Y BOLERO INFERIOR	16900.00	MARTHA RAMIREZ	RIB	0.33	\N	\N	1	2026-02-13 15:45:43
12771	CAMISILLA CRUZADA BOTON	16900.00	MARTHA RAMIREZ	RIB	0.36	\N	\N	1	2026-02-13 15:45:43
12777	TOP SURSIDO TELA ROSI	14900.00	ZIVIS PACHECO	ROSI	0.15	AMELIA	0.24	1	2026-02-13 15:45:43
12782	CAMISILLA A RAYAS CON LETRERO EN ALTA	17900.00	MARTHA RAMIREZ	RIB	0.42	\N	\N	1	2026-02-13 15:45:43
12783	CAMISILLA ESTAMPADO ALTA	17900.00	MARIANA OCAMPO	VERONARAYON	0.61	\N	\N	1	2026-02-13 15:45:43
12805	BLUSA CON LAGRIMA	19900.00	MARIANA OCAMPO	VERONARAYON	0.56	\N	\N	1	2026-02-13 15:45:43
12809	DUO BL MAN SIS Y TUNEL	58900.00	JACKELINE PEREA	LINO PRAGA	1.23	\N	\N	1	2026-02-13 15:45:43
12817	DUO CARNAVAL TOP	36900.00	MARTHA RAMIREZ	NEW COQUET S	0.69	POLY LYCRA	0.30	1	2026-02-13 15:45:43
12818	BLUSA CARNAVAL MGA BOMBA	41900.00	MARTHA RAMIREZ	LINO LIMPO S	1.03	\N	\N	1	2026-02-13 15:45:43
12820	BLUSON RECOGIDO A RAYAS MULTICOLOR	23900.00	MARTHA RAMIREZ	POLYLYCRA S	0.55	\N	\N	1	2026-02-13 15:45:43
12821	CAMISERA BOLERO FLORES SOMBREROS	34900.00	MARTHA RAMIREZ	NEW COQUET S	0.89	\N	\N	1	2026-02-13 15:45:43
12823	BLUSA  SOMBREROS Y FLORES CON CARGDERAS RECOGIDAS	22900.00	MARTHA RAMIREZ	MATAYEX S	0.39	MAYATEX	0.23	1	2026-02-13 15:45:43
12825	DUO CARNAVAL	22900.00	MARIANA OCAMPO	CAPRIATI	0.51	LYCRA ALGOD%�N	0.18	1	2026-02-13 15:45:43
12828	ESQUELETO COLORES	14900.00	MARIANA OCAMPO	AMELIA	0.28	\N	\N	1	2026-02-13 15:45:44
12831	CROP TOP GEOMETRICO RESORTADO	24900.00	MARTHA RAMIREZ	NEW COQUET S	0.43	\N	\N	1	2026-02-13 15:45:44
12834	CAMISETA CON MARIMONDA	17900.00	MARIANA OCAMPO	AMELIA	0.56	\N	\N	1	2026-02-13 15:45:44
12835	ESQUELETO LENTEJUELAS	20900.00	MARIANA OCAMPO	LENTEJUELAS	0.18	AMELIA	0.29	1	2026-02-13 15:45:44
12836	TOP ESTAMPADO NEON	21900.00	MARTHA RAMIREZ	BENGALINA PANA	0.31	\N	\N	1	2026-02-13 15:45:44
12837	CAMISETA RECOGIDA	27900.00	MARIANA OCAMPO	VALIANA	0.77	\N	\N	1	2026-02-13 15:45:44
12840	BLUSON GANADERIA	36900.00	MARTHA RAMIREZ	LINO LIMPO S	0.75	\N	\N	1	2026-02-13 15:45:44
12841	TOP AMARRE	20900.00	MARIANA OCAMPO	AMELIA SUBLIMADA	0.30	\N	\N	1	2026-02-13 15:45:44
12855	CORPI%�O MASCARAS ESTRELLAS	24900.00	MARTHA RAMIREZ	BENGALINA SUBLIMAR	0.26	BENGALINA	0.12	1	2026-02-13 15:45:44
12860	BLUSA MGA SISA CORAZON	16900.00	MARTHA RAMIREZ	MINIWAFER	0.33	\N	\N	1	2026-02-13 15:45:44
12861	CAMISETA MGA CORTA	19900.00	MARTHA RAMIREZ	MINIWAFER	0.45	\N	\N	1	2026-02-13 15:45:44
12862	BLUSON FLORES	23900.00	MARTHA RAMIREZ	MINIWAFER	0.50	\N	\N	1	2026-02-13 15:45:44
12864	CAMISILLA SISA ENTRADA	19900.00	MARTHA RAMIREZ	FLATY	0.53	\N	\N	1	2026-02-13 15:45:44
12865	TOP CARGADERA GRUESA BOTONES	16900.00	MARTHA RAMIREZ	FLATY	0.33	\N	\N	1	2026-02-13 15:45:44
12866	CAMISILLA ACANALADA ESTRELLA	19900.00	MARTHA RAMIREZ	SUPER JACK	0.45	\N	\N	1	2026-02-13 15:45:44
12868	DUO CON CROPTO Y AMARRE ESP	69900.00	JACKELINE PEREA	FAIRI RAYON	1.44	\N	\N	1	2026-02-13 15:45:44
12870	BODY ARGOLLA	35900.00	JACKELINE PEREA	ISLANDIA	0.83	\N	\N	1	2026-02-13 15:45:44
12871	CAMISILLA RAYAS APLIQUE	19900.00	MARTHA RAMIREZ	BURDA	0.33	RIB	0.10	1	2026-02-13 15:45:44
12872	CAMISETA MGA REDOBLADA ESCORPION	24900.00	MARTHA RAMIREZ	BURDA	0.56	\N	\N	1	2026-02-13 15:45:44
12873	CAMISETA CORTA A RAYAS	22900.00	MARTHA RAMIREZ	BURDA	0.42	\N	\N	1	2026-02-13 15:45:44
12875	BLUSA CRUZADA CON HERRAJE	19900.00	MARTHA RAMIREZ	PIEL DE DURASNO	0.48	\N	\N	1	2026-02-13 15:45:44
12876	CROPT STRAP EST	19900.00	JACKELINE PEREA	RIB	0.35	\N	\N	1	2026-02-13 15:45:44
12877	CAMISILLA PUNTILLA CUELLO	19900.00	MARTHA RAMIREZ	RIB	0.40	\N	\N	1	2026-02-13 15:45:44
12878	DUO CON TOP	64900.00	JACKELINE PEREA	ARIDA	1.24	LYCRA ALGOD%�N	0.25	1	2026-02-13 15:45:44
12879	BL CUE PERI	38900.00	JACKELINE PEREA	ARUBA	0.69	\N	\N	1	2026-02-13 15:45:44
12880	BLU CORT LAT Y CUELL	24900.00	JACKELINE PEREA	RIB	0.59	RIB	0.07	1	2026-02-13 15:45:44
12881	BODY BAS MANG	33900.00	JACKELINE PEREA	ISLANDIA	0.98	\N	\N	1	2026-02-13 15:45:44
12882	BLMAMC FONDE CORAZO	23900.00	JACKELINE PEREA	RIB	0.55	RIB	0.07	1	2026-02-13 15:45:44
12883	BL APLIQ FLORES	24900.00	JACKELINE PEREA	RIB	0.48	\N	\N	1	2026-02-13 15:45:44
12884	BL SIS CON VIVO	21900.00	JACKELINE PEREA	RIB	0.50	\N	\N	1	2026-02-13 15:45:45
12885	BL SES COMBINA	23900.00	JACKELINE PEREA	RIB	0.48	RIB SESGO CUE	0.04	1	2026-02-13 15:45:45
12888	CAMISILLA CORAZONES	19900.00	MARTHA RAMIREZ	RIB	0.54	\N	\N	1	2026-02-13 15:45:45
12889	BODY SESG COMBI	28900.00	JACKELINE PEREA	RIB	0.57	\N	\N	1	2026-02-13 15:45:45
12892	BL ESTAM CON AMARRE FRENT	24900.00	JACKELINE PEREA	LYCRA PRAGA	0.40	\N	\N	1	2026-02-13 15:45:45
12893	BLUS BAND ENCAJE	24900.00	JACKELINE PEREA	RIB	0.40	\N	\N	1	2026-02-13 15:45:45
12897	STRAPLE AMERR FRENT	19900.00	JACKELINE PEREA	FLATY	0.32	\N	\N	1	2026-02-13 15:45:45
12898	LEMSERO EN MAYATEX	24900.00	JACKELINE PEREA	MAYATEX PUNTO	0.30	LICRA FRIA	0.12	1	2026-02-13 15:45:45
12905	BODY ESPALDA DESTAPADA FORRADO	34900.00	MARTHA RAMIREZ	LYCRA PRAGA	0.85	\N	\N	1	2026-02-13 15:45:45
12906	BODY HOLTER	28900.00	JACKELINE PEREA	DESTELLANTE	0.62	\N	\N	1	2026-02-13 15:45:45
12907	BODY CUADRADO	28900.00	JACKELINE PEREA	ISLANDIA	0.84	\N	\N	1	2026-02-13 15:45:45
12908	BODY BASIC	28900.00	JACKELINE PEREA	ISLANDIA	0.83	\N	\N	1	2026-02-13 15:45:45
12909	CAMISETA MGA CORTA A RAYAS	23900.00	MARTHA RAMIREZ	VICTIRIA RAYA 1	0.44	\N	\N	1	2026-02-13 15:45:45
12910	CAMISILLA CORTE SUPERIOR OJALETES	22900.00	MARTHA RAMIREZ	RIB	0.45	\N	\N	1	2026-02-13 15:45:45
12911	CAMISETA MGA DOBLE TEXTURA	18900.00	MARTHA RAMIREZ	JAKAR	0.43	\N	\N	1	2026-02-13 15:45:45
12912	BASI RIB N 23	18900.00	JACKELINE PEREA	RIB	0.35	\N	\N	1	2026-02-13 15:45:45
12913	BL MANG COMB	29900.00	JACKELINE PEREA	RIB	0.40	VICTORIA RAYA1	0.22	1	2026-02-13 15:45:45
12914	BL CUELL TEJIDO	33900.00	JACKELINE PEREA	NOA	0.64	\N	\N	1	2026-02-13 15:45:45
12915	BL SIS APLIQ P	28900.00	JACKELINE PEREA	NOA N1	0.55	\N	\N	1	2026-02-13 15:45:45
12916	CROPTO SESGO	20900.00	JACKELINE PEREA	RIB	0.42	\N	\N	1	2026-02-13 15:45:45
12917	CROP TOP TELA MANTEYA DOS BOTONES	19900.00	JACKELINE PEREA	MANTEYA-CREMA197	0.20	\N	\N	1	2026-02-13 15:45:45
12918	TOP ESTAMPAT PL	19900.00	JACKELINE PEREA	RIB	0.24	RIB	0.07	1	2026-02-13 15:45:45
12919	CAM FOND ALT FLOR	25900.00	JACKELINE PEREA	BURDA	0.56	\N	\N	1	2026-02-13 15:45:45
12920	LENCERO BOTONES	21900.00	JACKELINE PEREA	LYCRA FRIA	0.23	\N	\N	1	2026-02-13 15:45:45
12921	CAMSILLA FRANJA LATERAL	24900.00	MARTHA RAMIREZ	RIB	0.39	\N	\N	1	2026-02-13 15:45:45
12922	BLUSA DAMA FRANJA Y MO%�O	21900.00	MARTHA RAMIREZ	LYCRA FRIA	0.33	\N	\N	1	2026-02-13 15:45:46
12923	CAMISETA MGAS BLONDA	24900.00	MARTHA RAMIREZ	LYCRA FRIA	0.45	\N	\N	1	2026-02-13 15:45:46
12924	CAMISILLA GUIPIUR	21900.00	MARTHA RAMIREZ	RIB	0.38	\N	\N	1	2026-02-13 15:45:46
12926	CAMISETA DOBLE FLOR ALTA	27900.00	MARTHA RAMIREZ	LYC PRAGA O F	0.61	\N	\N	1	2026-02-13 15:45:46
12931	BLUSA DOBLE BOLERO AMARRE ESPALDA	29900.00	MARTHA RAMIREZ	BOUTIPUNTI	0.52	\N	\N	1	2026-02-13 15:45:46
12933	BODY TIRAS	34900.00	JACKELINE PEREA	ISLANDIA	0.56	\N	\N	1	2026-02-13 15:45:46
12934	CROPTOP DESTELLANTE CON ENCAJE	24900.00	JACKELINE PEREA	DESTELLANTE	0.23	\N	\N	1	2026-02-13 15:45:46
12935	BODY CUELL ALT LAGRI SP	35900.00	JACKELINE PEREA	DESTELLANTE	0.83	\N	\N	1	2026-02-13 15:45:46
12936	BLUSA CUELLO HR FONDEO FLORES ALTA	14900.00	MARTHA RAMIREZ	PIEL DE DURASNO	0.37	\N	\N	1	2026-02-13 15:45:46
12937	CAMISETA SMILE ALTA	14900.00	MARTHA RAMIREZ	PIEL DE DURASNO	0.42	\N	\N	1	2026-02-13 15:45:46
12939	CAMISETA MGA DOBLE TEXTURA	20900.00	MARTHA RAMIREZ	JACQUARD	0.38	\N	\N	1	2026-02-13 15:45:46
12940	CAMISILLA 05 CUELLO COMBINADO	19900.00	MARTHA RAMIREZ	RIB	0.39	RIB	0.04	1	2026-02-13 15:45:46
12941	CAMISETA MGA CORTA AMORE	20900.00	MARTHA RAMIREZ	RIB	0.50	\N	\N	1	2026-02-13 15:45:46
12942	BLUSON CORTES CENTROS MGA CASQUITO APLIQUE	24900.00	MARTHA RAMIREZ	LYCRA PRAGA	0.34	MALLA GATO	0.08	1	2026-02-13 15:45:46
12943	TOP LENCERIA DAMA	19900.00	MARTHA RAMIREZ	LYCRA FRIA	0.25	\N	\N	1	2026-02-13 15:45:46
12945	ESTRAPLE AMARRE LATERAL	19900.00	MARTHA RAMIREZ	FLATY	0.36	\N	\N	1	2026-02-13 15:45:46
12946	CAMISETA CORTE FTE	21900.00	MARTHA RAMIREZ	FRIA O PRAGA	0.45	\N	\N	1	2026-02-13 15:45:46
12950	CROPT EST CIER	27900.00	JACKELINE PEREA	LICRA PRAGA	0.42	\N	\N	1	2026-02-13 15:45:46
12951	CAMISE LATERA EN ENCAJE	27900.00	JACKELINE PEREA	LCRA FRIA	0.56	\N	\N	1	2026-02-13 15:45:46
12952	CAMISERTA PICO ENCAJE	26900.00	MARTHA RAMIREZ	LYCRA FRIA	0.36	MAYA	0.26	1	2026-02-13 15:45:46
12953	BLUSA MGA MU%�ECA PUNTOS	24900.00	MARTHA RAMIREZ	FLATY	0.50	\N	\N	1	2026-02-13 15:45:46
12955	BUSO ASIMETRICO TRANSPARENCIA	22900.00	MARTHA RAMIREZ	MAYA GRABAD	0.71	PIELDE DURAS	0.12	1	2026-02-13 15:45:46
12956	CAMISILLA ENCAJE	24900.00	MARTHA RAMIREZ	RIB	0.62	\N	\N	1	2026-02-13 15:45:46
12957	BLUSA CUELLO BANDEJA ASIMETRICO	35900.00	MARTHA RAMIREZ	LYCRA FRIA	0.82	\N	\N	1	2026-02-13 15:45:46
12958	CMISETA MGA REDOBLADA EST BAMBI	39900.00	MARTHA RAMIREZ	LYCRA FRIA	0.93	\N	\N	1	2026-02-13 15:45:46
12959	CAMISETA BOLSILLO ENCAGE	37900.00	MARTHA RAMIREZ	LYCRA FRIA	0.92	\N	\N	1	2026-02-13 15:45:46
12960	CAMISETA ENCAJE FTE	39900.00	MARTHA RAMIREZ	LYCRA FRIA	0.91	\N	\N	1	2026-02-13 15:45:46
12961	CAMSILLA ENCEGE CORAZON	29900.00	MARTHA RAMIREZ	RIB	0.63	\N	\N	1	2026-02-13 15:45:46
12000	CONJUN  CHAMPION B	49900.00	JACKELINE PEREA	QUIMBAYA	1.05	\N	\N	1	2026-02-16 18:11:38
\.


--
-- Data for Name: production_tracking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.production_tracking (ref_id, correria_id, programmed, cut) FROM stdin;
\.


--
-- Data for Name: reception_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reception_items (id, reception_id, reference, quantity) FROM stdin;
1	mlppazj3deng1o52k	12864	99
2	mlpq1t8tghc8ho5zk	12871	150
3	mlpq28wsw17qn7i96	12881	66
4	mlpq2jikm4ktl92mu	12908	66
5	mlpq36ok0o0reoka8	12911	171
6	mlpq3opu4aqypg2fi	12919	150
7	mlpq4a58vzx56uhl4	12945	264
8	mlpq4k9klzrr8aie5	12924	90
9	mlpq57f0zjzbhjfnv	12860	132
10	mlqzzgck5ph970165	12951	90
11	mlr00c6d4f6tfcc5q	12933	60
12	mlr00pbqb05frdbp6	12870	60
13	mlr017j7mypl7s326	12907	42
14	mlr01i6d0g5qluf2h	12906	60
\.


--
-- Data for Name: receptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.receptions (id, batch_code, confeccionista, has_seconds, charge_type, charge_units, received_by, created_at) FROM stdin;
mlppazj3deng1o52k	7695	43189668	\N	\N	0	Admin Principal	2026-02-16T21:43:16.575Z
mlpq1t8tghc8ho5zk	7707	98587077	\N	\N	0	Admin Principal	2026-02-16T22:04:08.141Z
mlpq28wsw17qn7i96	7701	32461771	\N	\N	0	Admin Principal	2026-02-16T22:04:28.444Z
mlpq2jikm4ktl92mu	7702	42843342	\N	\N	0	Admin Principal	2026-02-16T22:04:42.188Z
mlpq36ok0o0reoka8	7668	39439040	\N	\N	0	Admin Principal	2026-02-16T22:05:12.213Z
mlpq3opu4aqypg2fi	7688	1045017301	\N	\N	0	Admin Principal	2026-02-16T22:05:35.586Z
mlpq4a58vzx56uhl4	7673	43097913	\N	\N	0	Admin Principal	2026-02-16T22:06:03.356Z
mlpq4k9klzrr8aie5	7690	71223381	\N	\N	0	Admin Principal	2026-02-16T22:06:16.472Z
mlpq57f0zjzbhjfnv	7711	700530400	1	\N	0	Admin Principal	2026-02-16T22:06:46.476Z
mlqzzgck5ph970165	7717	42999087	\N	\N	0	Admin Principal	2026-02-17T19:30:00.452Z
mlr00c6d4f6tfcc5q	7716	32461771	\N	\N	0	Admin Principal	2026-02-17T19:30:41.701Z
mlr00pbqb05frdbp6	7703	43668259	\N	\N	0	Admin Principal	2026-02-17T19:30:58.742Z
mlr017j7mypl7s326	7704	43668259	\N	\N	0	Admin Principal	2026-02-17T19:31:22.339Z
mlr01i6d0g5qluf2h	7722	42843342	\N	\N	0	Admin Principal	2026-02-17T19:31:36.133Z
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
-- Data for Name: sellers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sellers (id, name, active, created_at) FROM stdin;
mlia6gb0u2bhftxam	John Efrain Bolivar	1	2026-02-11 17:05:27
mlia6sxbdfmbvlex0	Lina Pulgarin	1	2026-02-11 17:05:43
mlia7rpjfmtwhg66q	Raul Gonzalez	1	2026-02-11 17:06:28
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_sessions (id, user_id, socket_id, status, connected_at, last_activity) FROM stdin;
\.


--
-- Data for Name: user_view_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_view_preferences (id, user_id, view_order, created_at, updated_at) FROM stdin;
1	mlgqup29zlzugg8qk	["orders", "settle", "fichas-costo", "fichas-diseno", "reception", "returnReception", "maletas", "dispatch", "inventory", "salesReport", "orderHistory", "dispatchControl", "deliveryDates", "reports", "masters", "compras"]	2026-02-24 15:55:37.7692	2026-02-24 16:20:29.657359
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, login_code, pin_hash, role, active, created_at, updated_at) FROM stdin;
mlqz2ojzlx02dlkz1	Observer	AAA	$2b$10$ub6PCY10zsjpdxxlx04hWuFgjTAysRpTos5SdylkhUnO0keI/JQ8G	observer	1	2026-02-17 19:04:31	2026-02-18 19:39:06.585822
mlgqup2eyhdq1lkxm	Jhon Montoya	JAM	$2b$10$rrMgIQCgsyf9NVjdYzBgi.8UiRCTn/7TmvCXMKsrLyLM.pg8JUrri	general	1	2026-02-10 15:16:40	2026-02-21 10:49:54.097978
mlgqup29zlzugg8qk	Admin Principal	ADM	$2b$10$9/LcENOQ.zwF4SD3grFiluKlnqD6sGE3bqr3Pkp.I.5AqWUkUQ8HG	admin	1	2026-02-10 15:16:40	2026-02-25 20:18:21.60082
mlvq40fm4ulz5ydor	prueba	BBB	$2b$10$5xLpC7NIkhxGrDCO26DKUOdZS1XSCBPls00dJoE7LTpTwOH6LQjPW	dise%�%adora	1	\N	2026-02-21 23:26:24.642474
\.


--
-- Name: dispatch_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dispatch_items_id_seq', 30, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: reception_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reception_items_id_seq', 16, true);


--
-- Name: return_reception_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.return_reception_items_id_seq', 1, false);


--
-- Name: user_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_sessions_id_seq', 1, false);


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
-- Name: cortes cortes_ficha_costo_id_numero_corte_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cortes
    ADD CONSTRAINT cortes_ficha_costo_id_numero_corte_key UNIQUE (ficha_costo_id, numero_corte);


--
-- Name: cortes cortes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cortes
    ADD CONSTRAINT cortes_pkey PRIMARY KEY (id);


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
-- Name: sellers sellers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sellers
    ADD CONSTRAINT sellers_pkey PRIMARY KEY (id);


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
-- Name: idx_cortes_ficha_costo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cortes_ficha_costo ON public.cortes USING btree (ficha_costo_id);


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
-- Name: idx_fichas_cortes_ficha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fichas_cortes_ficha ON public.fichas_cortes USING btree (ficha_costo_id);


--
-- Name: idx_fichas_cortes_ficha_costo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fichas_cortes_ficha_costo ON public.fichas_cortes USING btree (ficha_costo_id);


--
-- Name: idx_fichas_cortes_ficha_costo_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fichas_cortes_ficha_costo_id ON public.fichas_cortes USING btree (ficha_costo_id);


--
-- Name: idx_fichas_cortes_numero; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fichas_cortes_numero ON public.fichas_cortes USING btree (ficha_costo_id, numero_corte);


--
-- Name: idx_fichas_costo_ficha_diseno_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fichas_costo_ficha_diseno_id ON public.fichas_costo USING btree (ficha_diseno_id);


--
-- Name: idx_fichas_costo_referencia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fichas_costo_referencia ON public.fichas_costo USING btree (referencia);


--
-- Name: idx_fichas_diseno_disenadora_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fichas_diseno_disenadora_id ON public.fichas_diseno USING btree (disenadora_id);


--
-- Name: idx_fichas_diseno_referencia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fichas_diseno_referencia ON public.fichas_diseno USING btree (referencia);


--
-- Name: idx_inventory_movements_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_movements_created_at ON public.inventory_movements USING btree (created_at);


--
-- Name: idx_maletas_correria_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maletas_correria_id ON public.maletas USING btree (correria_id);


--
-- Name: idx_maletas_nombre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maletas_nombre ON public.maletas USING btree (nombre);


--
-- Name: idx_maletas_ref; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maletas_ref ON public.maletas_referencias USING btree (maleta_id);


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
-- Name: idx_orders_seller_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_seller_id ON public.orders USING btree (seller_id);


--
-- Name: idx_production_tracking_correria_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_production_tracking_correria_id ON public.production_tracking USING btree (correria_id);


--
-- Name: idx_production_tracking_ref_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_production_tracking_ref_id ON public.production_tracking USING btree (ref_id);


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
-- Name: cortes cortes_ficha_costo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cortes
    ADD CONSTRAINT cortes_ficha_costo_id_fkey FOREIGN KEY (ficha_costo_id) REFERENCES public.fichas_costo(id);


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

\unrestrict EFvgzNZmLxMDiUvQ9uXMEbCkKGthmbIgwAbn7OgdFpQZs74kUkdTdWTrynFl6lW

