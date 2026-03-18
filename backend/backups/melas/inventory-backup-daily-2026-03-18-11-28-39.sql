--
-- PostgreSQL database dump
--

\restrict FhYs7gegWPzHaEp4UHGIysYb7cH0eFvPyJBrA9MqWlhp88Ba2EWHn9lD3EAn4G3

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

-- Started on 2026-03-18 11:28:39

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

DROP DATABASE IF EXISTS inventory_melas;
--
-- TOC entry 5406 (class 1262 OID 18556)
-- Name: inventory_melas; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE inventory_melas WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C';


ALTER DATABASE inventory_melas OWNER TO postgres;

\unrestrict FhYs7gegWPzHaEp4UHGIysYb7cH0eFvPyJBrA9MqWlhp88Ba2EWHn9lD3EAn4G3
\connect inventory_melas
\restrict FhYs7gegWPzHaEp4UHGIysYb7cH0eFvPyJBrA9MqWlhp88Ba2EWHn9lD3EAn4G3

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
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 5407 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 257 (class 1255 OID 18557)
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
-- TOC entry 219 (class 1259 OID 18558)
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
-- TOC entry 220 (class 1259 OID 18567)
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
-- TOC entry 221 (class 1259 OID 18578)
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
-- TOC entry 222 (class 1259 OID 18595)
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
-- TOC entry 223 (class 1259 OID 18607)
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
-- TOC entry 224 (class 1259 OID 18615)
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
-- TOC entry 225 (class 1259 OID 18624)
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
-- TOC entry 226 (class 1259 OID 18636)
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
-- TOC entry 227 (class 1259 OID 18645)
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
-- TOC entry 228 (class 1259 OID 18646)
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
-- TOC entry 229 (class 1259 OID 18657)
-- Name: dispatches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dispatches (
    id character varying(255) NOT NULL,
    client_id character varying(255) NOT NULL,
    correria_id character varying(255) NOT NULL,
    invoice_no character varying(255) NOT NULL,
    remission_no character varying(255) NOT NULL,
    dispatched_by character varying(255) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    checked_by character varying(255) DEFAULT '0'::character varying
);


ALTER TABLE public.dispatches OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 18669)
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
-- TOC entry 231 (class 1259 OID 18696)
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
-- TOC entry 232 (class 1259 OID 18730)
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
-- TOC entry 233 (class 1259 OID 18752)
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
-- TOC entry 234 (class 1259 OID 18768)
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
-- TOC entry 235 (class 1259 OID 18778)
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
-- TOC entry 236 (class 1259 OID 18787)
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
-- TOC entry 237 (class 1259 OID 18799)
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
-- TOC entry 5409 (class 0 OID 0)
-- Dependencies: 237
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- TOC entry 238 (class 1259 OID 18800)
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
-- TOC entry 239 (class 1259 OID 18810)
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
-- TOC entry 240 (class 1259 OID 18822)
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
-- TOC entry 241 (class 1259 OID 18832)
-- Name: production_tracking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.production_tracking (
    ref_id character varying(255) NOT NULL,
    correria_id character varying(255) NOT NULL,
    programmed integer NOT NULL,
    cut integer NOT NULL,
    inventory integer DEFAULT 0,
    novedades text
);


ALTER TABLE public.production_tracking OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 18842)
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
-- TOC entry 243 (class 1259 OID 18851)
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
-- TOC entry 5410 (class 0 OID 0)
-- Dependencies: 243
-- Name: reception_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reception_items_id_seq OWNED BY public.reception_items.id;


--
-- TOC entry 244 (class 1259 OID 18852)
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
    bag_quantity integer DEFAULT 0,
    arrival_date date DEFAULT '2026-01-01'::date NOT NULL
);


ALTER TABLE public.receptions OWNER TO postgres;

--
-- TOC entry 5411 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN receptions.affects_inventory; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receptions.affects_inventory IS 'Controls whether this reception impacts the inventory. Set to FALSE for partial receptions that are part of a larger batch.';


--
-- TOC entry 245 (class 1259 OID 18864)
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
-- TOC entry 246 (class 1259 OID 18873)
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
-- TOC entry 5412 (class 0 OID 0)
-- Dependencies: 246
-- Name: return_reception_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.return_reception_items_id_seq OWNED BY public.return_reception_items.id;


--
-- TOC entry 247 (class 1259 OID 18874)
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
-- TOC entry 256 (class 1259 OID 19166)
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
-- TOC entry 255 (class 1259 OID 19165)
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
-- TOC entry 5413 (class 0 OID 0)
-- Dependencies: 255
-- Name: schema_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.schema_migrations_id_seq OWNED BY public.schema_migrations.id;


--
-- TOC entry 248 (class 1259 OID 18884)
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
-- TOC entry 249 (class 1259 OID 18892)
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
-- TOC entry 250 (class 1259 OID 18903)
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
-- TOC entry 5414 (class 0 OID 0)
-- Dependencies: 250
-- Name: user_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_sessions_id_seq OWNED BY public.user_sessions.id;


--
-- TOC entry 251 (class 1259 OID 18904)
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
-- TOC entry 252 (class 1259 OID 18915)
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
-- TOC entry 5415 (class 0 OID 0)
-- Dependencies: 252
-- Name: user_view_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_view_preferences_id_seq OWNED BY public.user_view_preferences.id;


--
-- TOC entry 253 (class 1259 OID 18916)
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
-- TOC entry 254 (class 1259 OID 18927)
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
-- TOC entry 5416 (class 0 OID 0)
-- Dependencies: 254
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 5063 (class 2604 OID 18928)
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- TOC entry 5068 (class 2604 OID 18929)
-- Name: reception_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reception_items ALTER COLUMN id SET DEFAULT nextval('public.reception_items_id_seq'::regclass);


--
-- TOC entry 5074 (class 2604 OID 18930)
-- Name: return_reception_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_reception_items ALTER COLUMN id SET DEFAULT nextval('public.return_reception_items_id_seq'::regclass);


--
-- TOC entry 5084 (class 2604 OID 19169)
-- Name: schema_migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schema_migrations ALTER COLUMN id SET DEFAULT nextval('public.schema_migrations_id_seq'::regclass);


--
-- TOC entry 5075 (class 2604 OID 18931)
-- Name: user_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions ALTER COLUMN id SET DEFAULT nextval('public.user_sessions_id_seq'::regclass);


--
-- TOC entry 5079 (class 2604 OID 18932)
-- Name: user_view_preferences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_view_preferences ALTER COLUMN id SET DEFAULT nextval('public.user_view_preferences_id_seq'::regclass);


--
-- TOC entry 5083 (class 2604 OID 18933)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5363 (class 0 OID 18558)
-- Dependencies: 219
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_log (id, entity_type, entity_id, user_id, action, old_values, new_values, changes, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- TOC entry 5364 (class 0 OID 18567)
-- Dependencies: 220
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (id, name, nit, address, city, seller, created_at, seller_id, updated_at, active) FROM stdin;
1	INVERSIONES SURTIMODA SAS	900582506	CALLE 14 #17-70 BARRIO CENTRO	ACACIAS	\N	\N	f9fl49sb9	\N	t
2	INVERSIONES AM ACACIAS S.A.S.	901509626	CL 13 # 19 - 79 BRR CENTRO	ACACIAS	\N	\N	f9fl49sb9	\N	t
3	RAMIREZ BOTERO OSCAR MANUEL	70690518	CL 5  # 13-52	AGUACHICA	\N	\N	t47okzgix	\N	t
4	P & S INVERSIONES ASOCIADOS S.A.S	901195775	CL 5 16 36	AGUACHICA	\N	\N	t47okzgix	\N	t
5	SALAZAR ECHEVERRI LUIS ALBERTO	170693888	CL 5 N 12 81	AGUACHICA	\N	\N	t47okzgix	\N	t
6	BOUTIQUE EL IMPERIO DE LA MODA DE AGUAZUL	900448728	CRA 16 # 9-48	AGUAZUL	\N	\N	f9fl49sb9	\N	t
7	INVERSIONES GAFE SAS	1900463519	C.C. NUESTRO URABA KM 1 APARTADO	APARTADO	\N	\N	t47okzgix	\N	t
8	COMERCIALIZADORA MINIMAX S.A.S.	901553853	CLL 17 # 16 - 17	ARMENIA	\N	\N	f9fl49sb9	\N	t
9	INVERSIONES 8A S.A.S N°27	2790013702	CR 9 # 10-68 LC2	BARBOSA	\N	\N	f9fl49sb9	\N	t
10	SALAS ASOCIADOS S.A.S	900392405	CL 49 9 44 SEC COMERCIAL	BARRANCABERMEJA	\N	\N	t47okzgix	\N	t
11	SALAS ASOCIADOS S.A.S	1900392405	CL 49 9 44 SEC COMERCIAL PTO BOYACA	BARRANCABERMEJA	\N	\N	t47okzgix	\N	t
12	EL GIGANTE DE LA MODA S.A.S	900646287	CL 49 9 62	BARRANCABERMEJA	\N	\N	t47okzgix	\N	t
13	INVERSIONES SOLOMODA BARRANCA S.A.S	900351574	CL 49 9 78	BARRANCABERMEJA	\N	\N	t47okzgix	\N	t
14	PALACIO MARIA ALIX	7076	CRA 47 B # 37 A 08	BARRANCABERMEJA	\N	\N	f9fl49sb9	\N	t
15	HERRERA JOHN FREDY	4065	CALLE 30 #42-04 MEGAMODA	BARRANQUILLA	\N	\N	f9fl49sb9	\N	t
16	ALIANZA MAS SAS	900596174	CALLE 34 # 43 147	BARRANQUILLA	\N	\N	t47okzgix	\N	t
17	ALIANZA ESTRENO SAS	900593525	CALLE 34 #43-81	BARRANQUILLA	\N	\N	t47okzgix	\N	t
18	TRICIA DUARTE	8544	CARRERA 4 # 45 G - 32	BARRANQUILLA	\N	\N	t47okzgix	\N	t
19	JIMENEZ QUINTERO DECIMO ALEXANDER	7606	CARRERA 41 #30-54	BARRANQUILLA	\N	\N	t47okzgix	\N	t
20	ZULUAGA GOMEZ RIGOBERTO	170827090	CL 34 43 70 LC M 5	BARRANQUILLA	\N	\N	t47okzgix	\N	t
21	ZULUAGA GOMEZ RIGOBERTO	70827090	CL 35 44 18	BARRANQUILLA	\N	\N	t47okzgix	\N	t
22	GH ENTERPRISE S.A.S.	901486883	CL 53 46 192 LC 240 CC PORTAL DEL PRADO	BARRANQUILLA	\N	\N	t47okzgix	\N	t
23	ALIANZA ESTRENO SAS	1900593525	CLLE 34 # 43-42	BARRANQUILLA	\N	\N	t47okzgix	\N	t
24	COMERCIALIZADORA MGV SAS	901413624	CR 13 104 45	BARRANQUILLA	\N	\N	t47okzgix	\N	t
25	ZULUAGA GOMEZ EDGAR ALONSO	8778704	CR 41 32 81	BARRANQUILLA	\N	\N	f9fl49sb9	\N	t
26	ALIANZA VC S.A.S	1900225992	CR 41 37 23	BARRANQUILLA	\N	\N	t47okzgix	\N	t
27	ALMACEN Y DISTRIBUIDORA GONZALEZ S.A.S	800160395	CR 42 32 28	BARRANQUILLA	\N	\N	t47okzgix	\N	t
28	ALIANZA MUÑOZ GOMEZ SAS	1901079469	CRA 44 N° 34-31 PISO 6 EDFC COLSEGUROS	BARRANQUILLA	\N	\N	t47okzgix	\N	t
29	ARIZUL DEL CARIBE S.A.S	900648001	VIA 40 # 85-410	BARRANQUILLA	\N	\N	t47okzgix	\N	t
30	INVERSIONES GAFE S.A.S	900463519	CARRERA 49 #49-38	BELLO	\N	\N	t47okzgix	\N	t
31	ALMA BELLA S.A.S	900352713	CL 129 N° 47 - 43 PRADO VERANIEGO	BOGOTA	\N	\N	f9fl49sb9	\N	t
32	RESTREPO JARAMILLO JULIAN ANDRES	79726416	CLL 129 B # 91-64 SUBA	BOGOTA	\N	\N	f9fl49sb9	\N	t
33	INTIMOS ALMA S.A.S N°11	1183003804	CR 13 N° 59 - 41	BOGOTA	\N	\N	f9fl49sb9	\N	t
34	INTIMOS ALMA S.A.S N° 14	1483003804	CR 71D N° 8 - 70 SUR	BOGOTA	\N	\N	f9fl49sb9	\N	t
35	INTIMOS ALMA S.A.S N°24	2483003844	CR 80 N° 51 - 03 SUR EXT: 1102	BOGOTA	\N	\N	f9fl49sb9	\N	t
36	INTIMOS ALMA S.A.S N° 3	3830038044	CR 88C N° 58D 32 SUR	BOGOTA	\N	\N	f9fl49sb9	\N	t
37	GUTIERREZ FANDIÑO FANNY	252456059	CRA 14 # 75 A -51 SUR B/SANTA LIBRADA	BOGOTA	\N	\N	f9fl49sb9	\N	t
38	INVERSIONES 8A S.A.S N°6	6900137023	CRA 6 N° 23-40 SUR 20 DE JULIO	BOGOTA	\N	\N	f9fl49sb9	\N	t
39	INTIMOS ALMA S.A.S N°2	5830038444	CRA 80 # 51-25 SUR CASA BLANCA	BOGOTA	\N	\N	f9fl49sb9	\N	t
40	INVERSIONES 8A S.A.S N°17	1790013702	DIAG. 71 B # 96-60 EXT 1117 ALAMOS NORTE	BOGOTA	\N	\N	f9fl49sb9	\N	t
41	INTIMOS ALMA S.A.S N°9	9830038044	TRANS.78L #68B -09/15 SUR BOSA PIAMONTE	BOGOTA	\N	\N	f9fl49sb9	\N	t
42	INTIMOS ALMA S.A.S N°5	5830038044	TV 4 ESTE N° 37A - 28 SUR	BOGOTA	\N	\N	f9fl49sb9	\N	t
43	INTIMOS ALMA S.A.S N°1	1830038444	TV 78 L N° 69 - 23 SUR	BOGOTA	\N	\N	f9fl49sb9	\N	t
44	HEGA G B S.A.S	830091761	CALLE 37 SUR # 78 H 21	BOGOTA	\N	\N	f9fl49sb9	\N	t
45	INVERSIONES GOBOTEX S A S	2830125982	CALLE 38 SUR Nº 86 A-09	BOGOTA	\N	\N	f9fl49sb9	\N	t
46	HEGA G B S.A.S	1830091761	CALLE 42 A #93 C 17 SUR	BOGOTA	\N	\N	f9fl49sb9	\N	t
47	INVERSIONES SACHA S.A.S	2900186125	CALLE 57 D SUR Nº 78H - 14, LOCAL 227	BOGOTA	\N	\N	f9fl49sb9	\N	t
48	INVERSIONES GOBOTEX S A S	3830125982	CLL 13 # 5 - 63	BOGOTA	\N	\N	f9fl49sb9	\N	t
49	INVERSIONES GOBOTEX S A S	830125982	CR 100 20 45	BOGOTA	\N	\N	f9fl49sb9	\N	t
50	INVERSIONES MASSARA S.A.S	901514722	CRA 4 # 14 - 49 (DESPACHO)	LA DORADA	\N	\N	f9fl49sb9	\N	t
51	INVERSIONES SACHA S.A.S	900186125	CR 78 B 35 C 14 SUR	BOGOTA	\N	\N	f9fl49sb9	\N	t
52	ZULUAGA ARISTIZABAL SANDRA MILENA	52855335	DG 49 A SUR 53 25	BOGOTA	\N	\N	f9fl49sb9	\N	t
53	NAVANA MEGATODO BOSA S.A.S	901169855	CRA 88 C # 58 D 31 SUR	BOSA	\N	\N	f9fl49sb9	\N	t
54	ZULUAGA RAMIREZ HECTOR EMILIO	70693516	CALLE 18 19 -36	BOSCONIA	\N	\N	t47okzgix	\N	t
55	ZULUAGA GIRALDO MARTA NELLY	52024421	CL 18 18 23 LC3 BRR CENTRO	BOSCONIA	\N	\N	t47okzgix	\N	t
56	CRISTANCHO CRISTANCHO ULICES	1960	CALLE 35 # 17-18	BUCARAMANGA	\N	\N	t47okzgix	\N	t
57	ALMACENES GRAN SAS	890204683	CALLE 52 # 33-20 BARRIO CABECERA	BUCARAMANGA	\N	\N	t47okzgix	\N	t
58	ALMACENES GANE LIMITADA	890203597	CL 35 15 59 BRR CENTRO	BUCARAMANGA	\N	\N	t47okzgix	\N	t
59	COMERCIALIZADORA DE CONFECCIONES S.A.S	901217960	CLLE 35 # 16 - 61 BRR CENTRO	BUCARAMANGA	\N	\N	t47okzgix	\N	t
60	JAIMES SUAREZ CESAR ELADIO	13925155	CR 17 34 43 49 BRR CENTRO	BUCARAMANGA	\N	\N	t47okzgix	\N	t
61	JARAMILLO LOPEZ VIVIANA PATRICIA	29231576	CALLE 3 # 36 - 39	BUENAVENTURA	\N	\N	f9fl49sb9	\N	t
62	CARVAJAL FRANCY	10897	CARRERA 9 #2-10	BUENAVENTURA	\N	\N	f9fl49sb9	\N	t
63	ARBOLEDA MEJIA JANETH	31588477	CL 5 5 14 BRR CENTRO SEC SANANDRESITO	BUENAVENTURA	\N	\N	f9fl49sb9	\N	t
64	ALMACENES CRAMAR	1144	CLL 3 # 3-60	BUENAVENTURA	\N	\N	f9fl49sb9	\N	t
65	BARRETO HORTUA JOSE IRLEY	16552612	CR 16 10 35 BRR CENTRO	CAICEDONIA	\N	\N	f9fl49sb9	\N	t
66	INVERSIONES 8A S.A.S N°21	2190013702	CRA 6 # 3 -45	CAJICA	\N	\N	f9fl49sb9	\N	t
67	ARISTIZABAL ARISTIZABAL SANDRA LILIANA	3849	CL 14 # 8 - 50	CALI	\N	\N	f9fl49sb9	\N	t
68	HOYOS RAMIREZ YULIETH	29509965	CL 47 NORTE # 4 B N - 29	CALI	\N	\N	f9fl49sb9	\N	t
69	PARRA SUAREZ ZORAIDA EMILCEN	8528	CLLE 14 CON CRR 7 ESQUINA CC ELITE LOCAL 515	CALI	\N	\N	f9fl49sb9	\N	t
70	GERMOR CALI SAS	890328800	CRA 8 # 13-24	CALI	\N	\N	f9fl49sb9	\N	t
71	DUQUE RAMIREZ MAURICIO ALBEIRO	70694868	CRA 8 # 13-97	CALI	\N	\N	f9fl49sb9	\N	t
73	GIRALDO GLADYS	5800	CALLE DE LA MONEDA - ALMCN CHISPA DE MODA	CAREPA	\N	\N	f9fl49sb9	\N	t
74	G & G RETAIL S.A.S	5901234880	CRA 25 # 48 - 10	CARMEN DE BOLIVAR	\N	\N	t47okzgix	\N	t
75	INVERSIONES SOLO MODAS S.A.S	900298207	AV PEDRO DE HEREDIA CL 30 25 04 BRR CHINO	CARTAGENA	\N	\N	t47okzgix	\N	t
76	KAR-MEL ASOCIADOS S.A.S	900441381	AV PEDRO DE HEREDIA CL 30 25 11 BRR LA QUINTA	CARTAGENA	\N	\N	t47okzgix	\N	t
77	REVOLLO POLO ESTELA BEATRIZ	57415102	AV. PEDRO DE HEREDIA # 26-75	CARTAGENA	\N	\N	t47okzgix	\N	t
78	INVERSIONES EL GIGANTE SAS	900143784	CALLE 30 # 24-58	CARTAGENA	\N	\N	t47okzgix	\N	t
79	ALIANZA M & G S.A	900196158	CALLE DE LA MONEDA # 7-156	CARTAGENA	\N	\N	t47okzgix	\N	t
80	ALMACENES JAMBO LTDA	900266030	CC PASEO DE LA CASTELLANA LC 29 ET SEGUNDA	CARTAGENA	\N	\N	t47okzgix	\N	t
81	MODATEXTIL DEL CARIBE S.A.S.	901783220	CL 31 6535 LC 1 BRR: CHIPRE	CARTAGENA	\N	\N	t47okzgix	\N	t
82	ENERGY FASHION S.A.S.	900236935	TV 54 94 - 31	CARTAGENA	\N	\N	t47okzgix	\N	t
83	GUITIERREZ RESTREPO LAURA	1192791730	CL 10 # 4 38	CARTAGO	\N	\N	f9fl49sb9	\N	t
84	ALIANZA MUÑOZ GOMEZ SAS	2901079469	CRA 3A Nº 17-61	CAUCASIA	\N	\N	t47okzgix	\N	t
85	ELMELAO S.A.S	900663011	CR 11 N° 8 - 82	CHIA	\N	\N	f9fl49sb9	\N	t
86	INVERSIONES 8A S.A.S N°13	1390013702	CR 10 N° 17 - 25	CHINQUINQUIRA	\N	\N	f9fl49sb9	\N	t
87	DISTRIBUIDORA MUNDO FASHION	1900324182	CALLE 17 # 11-57	CIENAGA	\N	\N	t47okzgix	\N	t
88	SALAZAR ECHEVERRI LUIS ALBERTO	70693888	CL 17 13 29 BRR CENTRO	CIENAGA	\N	\N	t47okzgix	\N	t
89	JIMENEZ BERMUDEZ ALBA DE JESUS	3095	CR 57 A 47 56	CIUDAD BOLIVAR	\N	\N	f9fl49sb9	\N	t
90	G & G RETAIL S.A.S	4901234880	CL 31 25 11 LC 2	COROZAL	\N	\N	t47okzgix	\N	t
91	AMPER GROUP S.A.S.	901341754	AV 8 8 55 LC 21 22 CC SAN ANTONIO BRR CENTRO	CUCUTA	\N	\N	f9fl49sb9	\N	t
92	MATIZ VASQUEZ CARLOS JULIO	13505840	AVENIDA 5 N° 7- 04	CUCUTA	\N	\N	f9fl49sb9	\N	t
93	EL SURTIDOR BG SAS #2	1901342490	CALLE 8 # 4- 35	CUCUTA	\N	\N	f9fl49sb9	\N	t
94	EL SURTIDOR BG SAS	901342490	CALLE 8 # 5- 47	CUCUTA	\N	\N	f9fl49sb9	\N	t
95	RAYOTEX S.A.S	2800144409	CL 10 NRO. 0-09	CUCUTA	\N	\N	f9fl49sb9	\N	t
97	HENRIQUEZ LOPERA MARY LUZ	60367610	CL 8 4 98 BRR CENTRO	CUCUTA	\N	\N	f9fl49sb9	\N	t
98	TIENDAS BUV SAS	901400615	CL 8 5 87 BRR EL CENTRO	CUCUTA	\N	\N	f9fl49sb9	\N	t
99	RAYOTEX S.A.S	800144409	CL 9 4 90 BRR CENTRO	CUCUTA	\N	\N	f9fl49sb9	\N	t
100	TIENDAS MICROEMPRESARIALES LANFER S.A.S.	900118155	CL 9 6 71 BRR CENTRO	CUCUTA	\N	\N	f9fl49sb9	\N	t
101	RAYOTEX S.A.S	1800144409	CLL 12 5 49	CUCUTA	\N	\N	f9fl49sb9	\N	t
102	INVERSIONES SACHA S.A.S	1900186125	CARRERA 6 N° 8-96	CUNDINAMARCA	\N	\N	f9fl49sb9	\N	t
103	RAMIREZ BOTERO ADOLFO JESUS	1066	CRA 15 N° 8 -43 CURUMANI	CURUMANI	\N	\N	t47okzgix	\N	t
104	GALLEGO JOHN JAMIME	5225	AV. SIMON BOLIVAR #38-130  LOCAL 114	DOSQUEBRADAS	\N	\N	f9fl49sb9	\N	t
105	NAVANA MEGATODO S.A.S	2901169855	CRA 17 # 15-22	DUITAMA	\N	\N	f9fl49sb9	\N	t
106	INVERSIONES 8A S.A.S N°4	4900137023	CRA 17 # 16 49/59 DUITAMA	DUITAMA	\N	\N	f9fl49sb9	\N	t
107	ARISTIZABAL ARISTIBAL DUBIAN DE JESUS	70829130	CL 25 48 71 LC 2 BRR CENTRO	EL CARMEN DE BOLIVAR	\N	\N	t47okzgix	\N	t
108	JIMENEZ MAYORGA MARIA ALEJANDRA	1129574347	CR 50 25 55	EL CARMEN DE BOLIVAR	\N	\N	t47okzgix	\N	t
109	RESTREPO JARAMILLO JULIAN ANDRES	179726416	CRA 12 N° 7 -11 BRR CENTRO	EL CERRITO	\N	\N	f9fl49sb9	\N	t
110	SANCHEZ TORRES LILIANA	1117485254	CR 4 # 2 - 29	EL PAUJIL	\N	\N	f9fl49sb9	\N	t
111	REPRESENTACIONES INTERMODA S.A.S	901121571	CLLE 10 # 4-102 ESPINAL TOLIMA	ESPINAL	\N	\N	f9fl49sb9	\N	t
112	INTIMOS ALMA S.A.S N°22	2283003804	CL 7 N° 3 - 65	FACATATIVA	\N	\N	f9fl49sb9	\N	t
113	ROJAS FARUK	981	C.C. OROCENTOR LOCAL 1-68	FLORENCIA	\N	\N	f9fl49sb9	\N	t
114	RAMIREZ CARDENAS FREDY ALBERTO	70698350	CL 16 11 41 BRR CENTRO	FLORENCIA	\N	\N	f9fl49sb9	\N	t
115	RAMIREZ CARDENAS EVER GONZALO	1045019291	CL 16 N° 11-58 BRR CENTRO	FLORENCIA	\N	\N	f9fl49sb9	\N	t
116	PINILLA LESMES DIANA CAROLina Pulgarin	1006512762	CL 22 2 A BIS 06 BRR ATALAY	FLORENCIA	\N	\N	f9fl49sb9	\N	t
117	INVERSIONES INTERMODA S.A.S	901068621	CLLE 16 #11-33 FLORENCIA	FLORENCIA	\N	\N	f9fl49sb9	\N	t
118	ORDOÑEZ ALVAREZ ESTEBAN JAVIER	9336	CLLE 17 # 9-14	FLORENCIA	\N	\N	f9fl49sb9	\N	t
119	GONZALES MUÑOZ EVANGELina Pulgarin	40784925	CR 11 # 13-60 BRR CENTRO	FLORENCIA	\N	\N	f9fl49sb9	\N	t
120	RAMIREZ VALENCIA CESAR	17915	CRA 12 # 15-17	FLORENCIA	\N	\N	f9fl49sb9	\N	t
121	VALENCIA RAMIREZ OMAR	17137	CRA 12 # 15-31	FLORENCIA	\N	\N	f9fl49sb9	\N	t
122	RESTREPO JARAMILLO JULIAN ANDRES	379726416	CLLE 9 # 17-24	FLORIDA	\N	\N	f9fl49sb9	\N	t
123	COMERCIALIZADORA MGV SAS	1901413624	CL 13 18 33	FONSECA	\N	\N	t47okzgix	\N	t
124	PEDROZO LUZ MERY	792	CRA 116 A N° 15 C -70 APTO 307 TORRE 1	FONTIBON	\N	\N	f9fl49sb9	\N	t
125	DISTRIBUIDORA MUNDO FASHION	900324182	CALLE 4 # 8A -49	FUNDACION	\N	\N	t47okzgix	\N	t
126	CARLOS MARIO SALAZAR ECHEVERRI	70694755	CALLE 6 NRO. 8A-18	FUNDACION	\N	\N	t47okzgix	\N	t
127	COMERCIALIZADORA GIRALDO DEL CARIBE	900454797	CL 4 8A 20	FUNDACION	\N	\N	t47okzgix	\N	t
128	ZULUAGA SALAZAR LEONEL ALBERTO	188210403	CR 8 N° 5-26	FUNDACION	\N	\N	t47okzgix	\N	t
129	DUQUE HOYOS JUAN GONZALO	2104501630	CL 8 N 7 76	FUSAGASUGA	\N	\N	f9fl49sb9	\N	t
130	INVERSIONES 8A S.A.S N°20	2090013702	CLL 8 # 8-71 EXT 1120	FUSAGASUGA	\N	\N	f9fl49sb9	\N	t
131	DUQUE HOYOS JUAN GONZALO	1104501630	CL 7 10 87	GARZON	\N	\N	f9fl49sb9	\N	t
132	INVERSIONES ESTRENATODO S.A.S	900275560	CARRERA 10 #14-47	GIRARDOT	\N	\N	f9fl49sb9	\N	t
133	PANTYJEANS GIRARDOT CIA LTDA	900284812	CR 10 13 52	GIRARDOT	\N	\N	f9fl49sb9	\N	t
134	EL UNIVERSO DE LA MODA ACTUAL S.A.S	900468771	CR 10 14 15	GIRARDOT	\N	\N	f9fl49sb9	\N	t
135	ALMACENES GANE LIMITADA	1890203597	CR 26  37 104	GIRON	\N	\N	t47okzgix	\N	t
136	RUSSI CACERES NESTOR LUIS	91296133	CR 26 # 40 - 20 BRR EL POBLADO	GIRON	\N	\N	f9fl49sb9	\N	t
137	INTIMOS ALMA S.A.S N° 26	2683003804	CL 17 N° 14 - 41 EXT: 1120	GRANADA	\N	\N	f9fl49sb9	\N	t
138	DISTRIBUIDORA DE MODA GRANADA	901619815	CR 15 17 44 BRR CENTRO	GRANADA	\N	\N	f9fl49sb9	\N	t
139	GUTIERREZ FANDIÑO FANNY	52456059	CR 7 3 68 BRR CENTRO	GUACARI	\N	\N	f9fl49sb9	\N	t
140	GUERRA EDILSON DARIO	4536	CR 7 # 8-07	HORMIGA	\N	\N	f9fl49sb9	\N	t
141	RAMIREZ BOTERO ADOLFO JESUS	70691066	CL 17 2 92 96 98 P5 BRR CENTRO	IBAGUE	\N	\N	t47okzgix	\N	t
142	SURTIDORA EL UNIVERSO DE LA MODA	900023407	CR 3 13 A 29	IBAGUE	\N	\N	f9fl49sb9	\N	t
143	SURTIDORA PANTY JEAN'S DE COLOMBIA SAS	900744578	CR 3 15 90 94 BRR CENTRO	IBAGUE	\N	\N	f9fl49sb9	\N	t
144	INNOVACIONES WIN S.A.S	900835285	CRA 51 # 50- 15 ITAGUI	ITAGUI	\N	\N	t47okzgix	\N	t
145	BOHORQUEZ GALVIS LUTH DARE	49764593	CLL 11 8 78	JAMUNDI	\N	\N	f9fl49sb9	\N	t
146	CARO CARO ANGELA MARIA	29567740	CR 10 11 53	JAMUNDI	\N	\N	f9fl49sb9	\N	t
147	COMPAÑIA REPUBLIC S.A.S EN LIQUIDACION	900385825	CARRERA 4 #14-49 CENTRO	LA DORADA	\N	\N	f9fl49sb9	\N	t
148	ALTA MODA LA DORADA	7507	CLLE 5 # 5-35	LA DORADA	\N	\N	f9fl49sb9	\N	t
149	SALAZAR ZULUAGA MAURICIO ANTONIO	1027	CRA 4 #14-49	LA DORADA	\N	\N	t47okzgix	\N	t
150	ZULUAGA EDWIN DAVID	6942	CRA 7 # 12-38 MERCADO VIEJO	LA GUAJIRA	\N	\N	f9fl49sb9	\N	t
151	DUQUE HOYOS JUAN GONZALO	1045016303	CL 6 N 3 56	LA PLATA	\N	\N	f9fl49sb9	\N	t
152	GOMEZ HERNANDEZ JUAN DAVID	1010153349	CARRERA 7 # 11-38	LA TEBAIDA	\N	\N	f9fl49sb9	\N	t
153	ARBOLEDA VASQUEZ JULIAN ANDRES	16552144	CARRERA 15 #15-42	LA UNION	\N	\N	f9fl49sb9	\N	t
154	BRABO DUARTE LUZ DARIS	63471107	CL 11 9-15 BRR CENTRO	LEBRIJA	\N	\N	t47okzgix	\N	t
155	CARDOZO AMAYA YOLANDA	65498039	CR 6 # 8 26 BRR CENTRO	LERIDA	\N	\N	f9fl49sb9	\N	t
156	ALIANZA MUÑOZ GOMEZ SAS	901079469	CR 20 2 A 22	LORICA	\N	\N	t47okzgix	\N	t
157	G & G RETAIL S.A.S	901234880	CRA 20 # 2 -34	LORICA	\N	\N	t47okzgix	\N	t
158	JIMENEZ MAYORGA MARIA ALEJANDRA	1112957434	CL DE LAS FLORES 12 24	MAGANGUE	\N	\N	t47okzgix	\N	t
159	ALIANZA MABLE SAS	900638635	CRA 3 B # 3-75	MAGANGUE	\N	\N	t47okzgix	\N	t
160	K-LU DE COLOMBIA SAS	901663086	CL 10 A 13 05 BRR CENTRO	MAICAO	\N	\N	t47okzgix	\N	t
161	LOPEZ HERRERA ANDRES FELIPE	1035912972	CL 12 # 11 60 LC 3	MAICAO	\N	\N	t47okzgix	\N	t
162	LOPEZ HERRERA GILDARDO ALONSO	15173215	CR 12 12 27	MAICAO	\N	\N	t47okzgix	\N	t
163	SALAZAR JARAMILLO CESAR AUGUSTO	16138274	CR 23 # 27 - 28	MANIZALES	\N	\N	f9fl49sb9	\N	t
164	ARIAS GUAPACHA NATALIA	1053799325	CR 23 # 57 - 37	MANIZALES	\N	\N	f9fl49sb9	\N	t
165	CASTRO CARRETERO OSCAR ALFONSO	1814	CRA 23 57 37 BRR LEONORA	MANIZALES	\N	\N	f9fl49sb9	\N	t
166	SANCHEZ SANTAMARIA FLOR MARINA	41642642	CL 19 # 20 - 31 ALMACEN FAS # 1	MANIZALES	\N	\N	f9fl49sb9	\N	t
167	CASTRO CARRETERO OSCAR ALFONSO	55991814	CR 23 57 37 BRR LEONORA	MANIZALES	\N	\N	f9fl49sb9	\N	t
168	COMERCIALIZADORA CENTER S.A.S.	900747073	CALLE 46 # 53 - 05 - AMAZONA CENTER	MEDELLIN	\N	\N	t47okzgix	\N	t
169	INNOVACIONES DE MODA SAS	2900463523	CALLE 48 #51-27  PICHINCHA	MEDELLIN	\N	\N	t47okzgix	\N	t
170	INNOVACIONES DE MODA S.A.S	900463523	CARRERA 51 #50-27 P.BERRIO	MEDELLIN	\N	\N	t47okzgix	\N	t
171	INVERSIONES GAFREMOL S.A.S	900532343	CARRERA 52 #48-02 CENTRAL	MEDELLIN	\N	\N	t47okzgix	\N	t
172	INNOVACIONES DE MODA SAS	1900463523	CARRERA 52 #50-50  CARABOBO	MEDELLIN	\N	\N	t47okzgix	\N	t
173	INVERSIONES LA MEDIA NARANJA S.A.S	2900109044	CENTRO COMERCIAL CENTRAL BUENOS AIRES	MEDELLIN	\N	\N	t47okzgix	\N	t
174	INVERSIONES LA MEDIA NARANJA S.A.S	3900109044	CLLE 49 # 49-29 AYACUHO	MEDELLIN	\N	\N	t47okzgix	\N	t
175	INVERSIONES LA MEDIA NARANJA S.A.S	900109044	CRA 53 #48-29 CUNDINAMARCA	MEDELLIN	\N	\N	t47okzgix	\N	t
176	TENDENCIAS FUTURISTAS S.A.S #2	1900314739	CALLE 29 #20-337 LOCAL 169 C.C NUESTRO	MONTERIA	\N	\N	t47okzgix	\N	t
177	COMERCIALIZADORA EL PALACIO DE LA PANTALETA	1901164484	CALLE 35 #2-22	MONTERIA	\N	\N	t47okzgix	\N	t
178	INVERSIONES LA PANTALETA S.A.S	900050852	CARRERA 2 # 32-07	MONTERIA	\N	\N	t47okzgix	\N	t
179	COMERCIALIZADORA EL PALACIO DE LA PANTALETA	901164484	CARRERA 2 #34-12 CENTRO	MONTERIA	\N	\N	t47okzgix	\N	t
180	TENDENCIAS FUTURISTAS S.A.S #1	900314739	CRA 2 #35-36	MONTERIA	\N	\N	t47okzgix	\N	t
181	GRUPO COMERCIAL INTERMODA S.A.S	900442422	CALLE 8 #3-33	NEIVA	\N	\N	f9fl49sb9	\N	t
182	GRUPO COMERCIAL INTERMODA S.A.S	3900442422	CLLE 8 # 3-81	NEIVA	\N	\N	f9fl49sb9	\N	t
183	GRUPO COMERCIAL INTERMODA S.A.S	2900442422	CRA 5 # 8-56	NEIVA	\N	\N	f9fl49sb9	\N	t
184	GRUPO COMERCIAL INTERMODA S.A.S	4900442422	CRA 5 N° 8-25	NEIVA	\N	\N	f9fl49sb9	\N	t
185	TIENDAS MICROEMPRESARIALES LANFER S.A.S	1900118155	CR 13 9 52 SECTOR DEL DULCE NOMBRE	OCAÑA	\N	\N	f9fl49sb9	\N	t
186	INVERSIONES 8A S.A.S N°10	1090013702	CL 25 N° 22 - 18 / LC 1	PAIPA	\N	\N	f9fl49sb9	\N	t
187	GUERRERO MUÑOZ SANDRA PATRICIA	66776819	CL 33 19 85	PALMIRA	\N	\N	f9fl49sb9	\N	t
188	GUITIERREZ RESTREPO LAURA	1730	CLLE 30 # 27-15 CENTRO	PALMIRA	\N	\N	f9fl49sb9	\N	t
189	INVERSIONES BANETY SAS	901580883	CALLE 17 #20 64 BRR CENTRO	PASTO	\N	\N	f9fl49sb9	\N	t
190	SOTO GOMEZ ELCY BIBIANA	1045017326	CL 18 # 23 - 85 BRR CENTRO	PASTO	\N	\N	f9fl49sb9	\N	t
191	SOTO FRANCO JHOVANNY	7271	CR 20 A 16 74	PASTO	\N	\N	f9fl49sb9	\N	t
192	SOTO FRANCO ALEXANDER	70697270	CR 22 # 16 - 80. EL GRAN SURTIDOR	PASTO	\N	\N	f9fl49sb9	\N	t
193	GOMEZ GOMEZ MARIA MERCEDES	41892604	CR 8 CL 17 ESQ 16 75 CC LA OCTAVA	PEREIRA	\N	\N	f9fl49sb9	\N	t
194	INVERSIONES LA MEDIA NARANJA S.A.S	1900109044	CRA 8 #17-34	PEREIRA	\N	\N	t47okzgix	\N	t
195	ZULUAGA CEBALLOS John Efrain Bolivar ALEXANDER	14817	CR 26 40 20	PIEDECUESTA	\N	\N	f9fl49sb9	\N	t
196	ZULUAGA CEBALLOS John Efrain Bolivar ALEXANDER	1033814817	CR 6 # 10 - 88	PIEDECUESTA	\N	\N	f9fl49sb9	\N	t
197	BARRERA MORA BETURIA	8911	CLLE 7 # 2-34	PITALITO	\N	\N	f9fl49sb9	\N	t
198	SUPERMODA CIA Y LIMITADA	809010278	CRA 4 # 7 -45 PITALITO	PITALITO	\N	\N	f9fl49sb9	\N	t
199	VARIEDADES SJ DEL CARIBE S.A.S	901413205	CRA 10 9 31	PIVIJAY	\N	\N	t47okzgix	\N	t
200	G & G RETAIL S.A.S	3901234880	CLLE 20 N° 7-41	PLANETA RICA	\N	\N	t47okzgix	\N	t
201	RAMIREZ LLERENA LUZ ADRIANA	700082020	CR 15 11-65	PLATO	\N	\N	t47okzgix	\N	t
202	ALIANZA HERMANOS JGV	16326	CR 15 12 69	PLATO	\N	\N	t47okzgix	\N	t
203	MORCILLO GONZALEZ LEIDY	4000	CALLE 6 #18-48	POPAYAN	\N	\N	f9fl49sb9	\N	t
204	ARCILA BEATRIZ HELENA	4957	CARRERA 7 #6-26	POPAYAN	\N	\N	f9fl49sb9	\N	t
205	ZULUAGA ORLANDO	1694	CLLE 6 # 6-43	POPAYAN	\N	\N	f9fl49sb9	\N	t
206	COMPAÑIA REPUBLIC S.A.S.	1900385825	CL 54 3 00 ESQ	PUERTO BERRIO	\N	\N	t47okzgix	\N	t
207	INVERSIONES SOLOMODA BARRANCA S.A.S	2900351574	CR 3 N° 9-18	PUERTO BERRIO	\N	\N	t47okzgix	\N	t
208	SANCHEZ TORRES NELSY	40091533	CALLE 5 # 7-33	PUERTO RICO	\N	\N	f9fl49sb9	\N	t
209	GUERRA EDILSON DARIO	5369	CRA 7 # 8-07	PUTUMAYO	\N	\N	f9fl49sb9	\N	t
210	ALIANZA MAS S.A.S	1900596174	CALLE 15 #18-274 LOC 138 C.C VIVA GUAJIRA	RIOHACHA	\N	\N	f9fl49sb9	\N	t
211	PASSARELA RIOHACHA S.A.S.	901697930	CR 7 # 12 - 45	RIOHACHA	\N	\N	t47okzgix	\N	t
212	RAMIREZ GIRALDO ANDRES FELIPE	700159350	CR 7 12 38	RIOHACHA	\N	\N	t47okzgix	\N	t
213	SUPERMODA RIOHACHA S.A.S	901697954	CR 7 12 38	RIOHACHA	\N	\N	t47okzgix	\N	t
214	SALAZAR ECHEVERRI LUIS ALBERTO	270693888	CR 7 N 12 28	RIOHACHA	\N	\N	t47okzgix	\N	t
215	SUPERMODA SABANALARGA S.A.S	901698678	CR 19 # 20-31	SABANALARGA	\N	\N	t47okzgix	\N	t
216	MEDINA MERCHAN YESENIA	1052989202	CL 13 CR 10 60 BRR CENTRO LC 2	SAHAGUN	\N	\N	t47okzgix	\N	t
217	G & G RETAIL S.A.S	1901234880	CRA 11 #13-73	SAHAGUN	\N	\N	t47okzgix	\N	t
218	INVERSIONES 8A S.A.S N°16	1690013702	CR 9 N° 11 - 36	SAN GIL	\N	\N	f9fl49sb9	\N	t
219	G & G RETAIL S.A.S	2901234880	CR 24 15 29	SAN MARCOS	\N	\N	t47okzgix	\N	t
220	DISTRIBUIDORA MUNDO FASHION	2900324182	CALLE 22 #5-37 EDIFICIO ANDINA APTO 202	SANTA MARTA	\N	\N	t47okzgix	\N	t
221	INVERSIONES TORRES CA S.A.S.	901155149	CL 11 # 8 - 31 BRR MERCADO	SANTA MARTA	\N	\N	t47okzgix	\N	t
222	INVERSIONES RABI SAS	901090933	CLLE 11 # 8 A 23	SANTA MARTA	\N	\N	t47okzgix	\N	t
223	ZULUAGA SALAZAR LEONEL ALBERTO	88210403	CR 5 19 08	SANTA MARTA	\N	\N	t47okzgix	\N	t
224	INVERSIONES RABI SAS	1901090933	CRA 5 # 21 - 30	SANTA MARTA	\N	\N	t47okzgix	\N	t
225	ALIANZA HNOS JGVS SAS	900676326	CRA 5 #18-43	SANTA MARTA	\N	\N	t47okzgix	\N	t
226	GUITIERREZ RESTREPO LAURA	2119279173	CLLE 4 # 10-59 CENTRO	SANTANDER DE QUILICHAO	\N	\N	f9fl49sb9	\N	t
227	TAMAYO JARAMILLO LUZ MARIA	24431638	CLLE 4 # 11-32 CENTRO	SANTANDER DE QUILICHAO	\N	\N	f9fl49sb9	\N	t
228	ARCILA CARDENAS SANDRA EMILSEN	265	CL 50 # 46 - 27	SANTUARIO	\N	\N	t47okzgix	\N	t
229	SERNA RAMIREZ ANGELA MARIA	19585	CL 50 50 71 IN 101	SANTUARIO	\N	\N	t47okzgix	\N	t
230	COMERCIALIZADORA MAGOTEX S.A.S #2	1901239802	CALLE 21 #19-12	SINCELEJO	\N	\N	t47okzgix	\N	t
231	MP RETAIL S.A.S	901181807	CALLE 22 #20-68	SINCELEJO	\N	\N	t47okzgix	\N	t
232	PANAMA PLAZA S.A.S	901212878	CALLE 22 N° 21-22	SINCELEJO	\N	\N	t47okzgix	\N	t
233	COMERCIALIZADORA MAGOTEX 1	901239802	CALLE 23 # 20 - 64	SINCELEJO	\N	\N	t47okzgix	\N	t
234	ALIANZA MABLE SAS	1900638635	CL 28 25 B 97 LC 2 318	SINCELEJO	\N	\N	t47okzgix	\N	t
235	INVERSIONES GAFE S.A.S	2900463519	CALLE 36 SUR # 43-31	ENVIGADO	\N	\N	t47okzgix	\N	t
236	INVERSIONES GOBOTEX S A S	1830125982	CALLE 13 Nº 5-63	SOACHA	\N	\N	f9fl49sb9	\N	t
237	NAVANA MEGATODO SOACHA S.A.S	1901169855	CRA 7 # 32-35 LOCAL 207	SOACHA	\N	\N	f9fl49sb9	\N	t
238	ACUÑA MARIA CRISTINA	30205366	CL 10 14 39 BRR CENTRO	SOCORRO	\N	\N	t47okzgix	\N	t
239	VARIMODA SAS	901729900	CR 11 14 91	SOGAMOSO	\N	\N	f9fl49sb9	\N	t
240	INVERSIONES 8A S.A.S N°7	7900137023	CR 11 N° 13 - 29 SOGAMOSO	SOGAMOSO	\N	\N	f9fl49sb9	\N	t
241	ALIANZA VC S.A.S	900225992	CALLE 20 N° 19-17	SOLEDAD	\N	\N	t47okzgix	\N	t
242	INVERSIONES JBARA S.A.S	901462378	CL 63 14 50	SOLEDAD	\N	\N	t47okzgix	\N	t
243	DUQUE HOYOS JUAN GONZALO	3104501630	CR 19 19 41	SOLEDAD	\N	\N	f9fl49sb9	\N	t
244	ZULAGA GIRALDO HECTOR MAURICIO	70690823	CL 27 24 59 BR CENTRO	TULUA	\N	\N	f9fl49sb9	\N	t
245	DECADA 10 EN TODO S.A.S	900519038	CR 24 27 30 BRR EL CENTRO	TULUA	\N	\N	f9fl49sb9	\N	t
246	QUINTERO ADRIAN ALBERTO	3257	CLL DEL COMERCIO EL PACIFICO DEL BARATON	TUMACO	\N	\N	f9fl49sb9	\N	t
247	NOREÑA MAZUERA ALEXANDER	100	CALLE MERCEDES ALM LISTO MEDELLIN	TUMACO	\N	\N	f9fl49sb9	\N	t
248	INVERSIONES INTERMODA S.A.S	1901068621	CLLE MOSQUERA DIAG A TELECOM	TUMACO	\N	\N	f9fl49sb9	\N	t
249	VARGAS MONTIEL JACKSON FABIAN	9052	CRA 9 # 8 -99	TUMACO	\N	\N	f9fl49sb9	\N	t
250	INVERSIONES 8A S.A.S N°19	1990013702	AV UNIVERSITARIA N° 51 21 LC 207 CC VIVA TUNJA	TUNJA	\N	\N	f9fl49sb9	\N	t
251	INVERSIONES 8A S.A.S N°8	8900137023	CL 19 N° 10 - 46	TUNJA	\N	\N	f9fl49sb9	\N	t
252	INVERSIONES 8A S.A.S N°15	1590013702	CR 7 N° 9 - 48	UBATE	\N	\N	f9fl49sb9	\N	t
253	SAJIN AREVALO SAMIR	77038476	CL 16 B 8 45	VALLEDUPAR	\N	\N	t47okzgix	\N	t
254	KHALED BASSAN SAJIN MHANNA	1065629467	CL 16B # 7-39 - Centro	VALLEDUPAR	\N	\N	t47okzgix	\N	t
255	ALIANZA SURTIDORA SAS	901084883	CR 7 16 A 133	VALLEDUPAR	\N	\N	t47okzgix	\N	t
256	DISTRIBUIDORA MUNDO FASHION	3900324182	DIG 10 A N° 6 N 15 CC GUATAPURI LC 215	VALLEDUPAR	\N	\N	t47okzgix	\N	t
257	CIELO MODA S.A.S - AMV LLANO 2	901784502	CALLE 39 #30-40	VILLAVICENCIO	\N	\N	f9fl49sb9	\N	t
258	BARAKI S.A.S	901712681	CALLE 39 N° 30 A 38	VILLAVICENCIO	\N	\N	f9fl49sb9	\N	t
259	AMV LLANO S.A.S	900469068	CARRERA 30 #36-40	VILLAVICENCIO	\N	\N	f9fl49sb9	\N	t
260	AMV LLANO S.A.S	2900469068	CL 39 30 A 38 BRR CENTRO	VILLAVICENCIO	\N	\N	f9fl49sb9	\N	t
261	MONTOYA VARGAS CENERY	52654284	CRA 5 # 5 23	VILLETA	\N	\N	f9fl49sb9	\N	t
262	MARTINEZ ARANGO DIANA ELISABETH	32564630	CR 19 # 20 - 74	YARUMAL	\N	\N	t47okzgix	\N	t
263	JIMENEZ GOMEZ CARLOS ALCIDES	70694674	CALLE 9 # 19-14	YOPAL	\N	\N	f9fl49sb9	\N	t
264	COL MODA YOPAL SAS	901697458	CL 10 19 52	YOPAL	\N	\N	f9fl49sb9	\N	t
265	RAMIREZ ZULUAGA BLANCA AMELIA	43404158	CR 20 14 31	YOPAL	\N	\N	f9fl49sb9	\N	t
266	INVERSIONES JIMENEZ GOMEZ S.A.S	900960772	CRA 20 N° 14-39 BELLO HORIZONTE	YOPAL	\N	\N	f9fl49sb9	\N	t
268	GUTIERREZ FANDIÑO FANNY	152456059	CRA 4 # 6 -03 CENTRA	YUMBO	\N	\N	f9fl49sb9	\N	t
269	VASQUEZ MARIA ORFANIA	29809163	CL 9 11 08	ZARZAL	\N	\N	f9fl49sb9	\N	t
270	AL MUSTAKIM	901812038	CLL 9 # 20 - 59	SAN JOSE DEL GUAVIARE	\N	\N	f9fl49sb9	\N	t
267	EPICA DE MODAD SAS	901170874	CL 34 43 109 OF 312	BARRANQUILLA	\N	\N	t47okzgix	\N	t
271	JHOJAINNE SULVARAN	1006745382	CR 12 # 13 - 22	MAICAO	\N	\N	t47okzgix	\N	t
272	DISTRIBUIDORA VISTEMODA LTDA	800222200	CL 52 N° 15 A 05	CALI	\N	\N	f9fl49sb9	\N	t
273	CAÑAVERAL NUÑEZ YOLANDA	66677499	CL 9 6 82	ROLDANILLO	\N	\N	f9fl49sb9	\N	t
274	ARBOLEDA NIETO JOSE ALEJANDRO	14978082	CR 5 9 81 BRR GUADALUPE	CARTAGO	\N	\N	f9fl49sb9	\N	t
275	GV INFINITE SAS	901523339	CL 12 7 30 LOCAL 1	RIOHACHA	\N	\N	t47okzgix	\N	t
276	VIDAL MARIN INGRIT MALLERLY	3207003070	CRA 25 # 37 - 29	CALARCA	\N	\N	f9fl49sb9	\N	t
277	SINDY LISADY SAAVEDRA	1045016946	CRA 13 # 8-51	OCAÑA	\N	\N	f9fl49sb9	\N	t
278	BAYONA BAYONA JORGE LUIS	1094574518	CR 5 # 13 - 87 BRR CENTRO	ABREGO	\N	\N	f9fl49sb9	\N	t
279	G & G RETAIL S.A.S	6901234880	CRA 15 # 8 - 64 LOC 1	CIENAGA DE ORO	\N	\N	t47okzgix	\N	t
280	EPICA DE MODA SAS	901170874	CALLE 30 # 43-50 LOCAL 296A  CENTRO COMERCIAL ALEGRA	BARRANQUILLA	\N	\N	t47okzgix	\N	t
281	LA PORFIA AM SAS	901891158	CR 43 # 70-05 SUR PORFIA	VILLAVICENCIO	\N	\N	f9fl49sb9	\N	t
282	SALANEDA INVERSIONES S.A.S.	901800090	CL 49 9 44 SEC COMERCIAL PUERT	BARRANCABERMEJA	\N	\N	t47okzgix	\N	t
283	COMERCIAL BP SAS	901349219	CALLE 17 # 6 - 104 PISO 3	MONTELIBANO	\N	\N	t47okzgix	\N	t
284	COMERCIAL BP SAS	1901349219	CALLE 10 A # 12 - 12 GUADALUPE	PUERTO LIBERTADOR	\N	\N	t47okzgix	\N	t
285	COMERCIAL BP SAS	2901349219	CALLE 20 # 9B - 24	LA PARTADA	\N	\N	t47okzgix	\N	t
286	ALIANZA REDUART S.A.S.	901049593	CL 45 H 4 04	BARRANQUILLA	\N	\N	t47okzgix	\N	t
287	JARAMILLO JARAMILLO SANTIAGO	700159299	CL 10 4 38	CARTAGO	\N	\N	f9fl49sb9	\N	t
288	JARAMILLO JARAMILLO SANTIAGO	1700159299	CR 5 7 44	CARTAGO	\N	\N	f9fl49sb9	\N	t
289	JUAN ALEJANDRO JARAMILLO	1002652738	CL 9 16 35	FLORIDA	\N	\N	f9fl49sb9	\N	t
290	MARTINEZ SAAVEDRA LIGIA MARIA	24661204	CR 23 26 58 BRR CENTRO	TULUA	\N	\N	f9fl49sb9	\N	t
291	MACHADO ORTEGA JESUS DAVID	88309883	CL 11 19 C 45 BRR GARUPAL  II ETAPA	VALLEDUPAR	\N	\N	t47okzgix	\N	t
292	CLASIC AM S.A.S.	901864953	CR 30 # 36 - 40	VILLAVICENCIO	\N	\N	f9fl49sb9	\N	t
293	GRUPO EMPRESARIAL EL SURTIDOR SAS	901595448	CLL 8 # 5 - 47 BRR CENTRO	CUCUTA	\N	\N	f9fl49sb9	\N	t
294	INVERSIONES DUQUE QUINTERO S.A.S.	901324937	AV PEDRO DE HEREDIA CR 27 30 01	CARTAGENA	\N	\N	t47okzgix	\N	t
295	GALVIS RODOLFO	4870	CRA 3A Nº 17-61	CAUCASIA	\N	\N	t47okzgix	\N	t
296	PEREZ ACOSTA CANDY SUSANA	32930941	CR 8 10 26	SANTA ANA	\N	\N	t47okzgix	\N	t
297	RUEDA MIRANDA YERSON OSWALDO	91078808	CR 11 # 12 - 75 P 2	SAN GIL	\N	\N	f9fl49sb9	\N	t
298	INVERSIONES ASH S.A.S.	900469154	CRA 4 # 24 - 70	QUIBDO	\N	\N	ye3j7ykci	\N	t
299	LARGACHA CAMPO YUBERNEI	9737771	CR 8 # 4 - 33	CHAPARRAL	\N	\N	f9fl49sb9	\N	t
300	MEDIA NARANJA	-	TODOS LOS ALMACENES	MEDELLIN	\N	\N	t47okzgix	\N	t
301	HERNANDEZ MONTES ANA MILENA	50929792	CL 20 CR 7 ESQU	PLANETA RICA	\N	\N	t47okzgix	\N	t
302	RESTREPO LAURA VALENTINA	1192791730	CL 4 # 10 - 59 CRR EL CENTRO	SANTANDER DE QUILICHAO	\N	\N	f9fl49sb9	\N	t
303	LONDOÑO MARIA DEL CARMEN	25109415	CR 15 # 16 43 BRR CENTRO	LA UNION	\N	\N	f9fl49sb9	\N	t
304	YONELBIS ZAMBRANO SUAREZ	6057	CRA 12 # 12 - 27	MAICAO	\N	\N	t47okzgix	\N	t
305	G&G RETAIL S.A.S	7901234880	CLL 15 A # 14 A 41	CERETE	\N	\N	t47okzgix	\N	t
306	VICTOR ANDRES AROCA	1140896249	CL 34 43 129 BG 434 CC COLOMBIA	BARRANQUILLA	\N	\N	t47okzgix	\N	t
307	SANTIAGO JARAMILLO JARAMILLO	2700159299	CRA 8 # 9 - 72 LOCAL 5	CHINCHINA	\N	\N	f9fl49sb9	\N	t
308	EL SURTIDOR BG SAS NUEVO	2490	AV 5 # 5 - 63 PISO 4	CUCUTA	\N	\N	f9fl49sb9	\N	t
309	PANTYJEANS GIRARDOT SAS 2	1900284812	CR 10 # 14 - 47 BRR CENTRO	GIRARDOT	\N	\N	f9fl49sb9	\N	t
310	ALIANZA VC S.A.S	900225992	CRA 3A Nº 17-61	CAUCASIA	\N	\N	t47okzgix	\N	t
311	ANTEXTIL S.A.S.	901170873	AV PEDRO HEREDIA 26 - 75	CARTAGENA	\N	\N	t47okzgix	\N	t
\.


--
-- TOC entry 5365 (class 0 OID 18578)
-- Dependencies: 221
-- Data for Name: compras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.compras (id, fecha, referencia, unidades, insumo, cantidad_insumo, precio_unidad, cantidad_total, total, proveedor, fecha_pedido, observacion, factura, precio_real_insumo_und, afecta_inventario, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5366 (class 0 OID 18595)
-- Dependencies: 222
-- Data for Name: confeccionistas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.confeccionistas (id, name, address, city, phone, score, active, created_at) FROM stdin;
43806885	Claudia Patricia Pati�o Martinez	CLL 75B SUR 35 250	Sabaneta	3146317522	A	1	\N
1037617166	Maria Alejandra Aguirre paniagua	CRA 37 B # 107 A 12 INT 102	Medell�n	3046482878	A	1	\N
43988597	Marisol Bustos Jimenez	CRA 91A CLL 78A - 56	Robledo	3013613656	A	1	\N
43756956	Bellaflor Ramos Suarez	CRA 91 # 78 A 56 PISO 302	Robledo	3145155697	A	1	\N
43710368	Maria de los Angeles Tabarez Serna	CRA 46 A # 95 A 30	Aranajuez	3217056823	A	1	\N
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
43841705	Clara Ines Cano Sanchez	CR 66 # 29 - 34	San Antonio de Prado	3011481011	A	1	\N
\.


--
-- TOC entry 5367 (class 0 OID 18607)
-- Dependencies: 223
-- Data for Name: correria_catalog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.correria_catalog (id, correria_id, reference_id, added_at) FROM stdin;
1005_hyzlk69gl_1773776146679	hyzlk69gl	1005	\N
1007_hyzlk69gl_1773776146683	hyzlk69gl	1007	\N
1008_hyzlk69gl_1773776146686	hyzlk69gl	1008	\N
1009_hyzlk69gl_1773776146695	hyzlk69gl	1009	\N
1010_hyzlk69gl_1773776146702	hyzlk69gl	1010	\N
1011_hyzlk69gl_1773776146706	hyzlk69gl	1011	\N
1012_hyzlk69gl_1773776146714	hyzlk69gl	1012	\N
1013_hyzlk69gl_1773776146715	hyzlk69gl	1013	\N
1014_hyzlk69gl_1773776146717	hyzlk69gl	1014	\N
1015_hyzlk69gl_1773776146718	hyzlk69gl	1015	\N
1016_hyzlk69gl_1773776146719	hyzlk69gl	1016	\N
1017_hyzlk69gl_1773776146725	hyzlk69gl	1017	\N
1018_hyzlk69gl_1773776146730	hyzlk69gl	1018	\N
1019_hyzlk69gl_1773776146732	hyzlk69gl	1019	\N
1020_hyzlk69gl_1773776146734	hyzlk69gl	1020	\N
1197_hyzlk69gl_1773776146735	hyzlk69gl	1197	\N
1258_hyzlk69gl_1773776146737	hyzlk69gl	1258	\N
1278_hyzlk69gl_1773776146742	hyzlk69gl	1278	\N
1500_hyzlk69gl_1773776146747	hyzlk69gl	1500	\N
1502_hyzlk69gl_1773776146750	hyzlk69gl	1502	\N
2005_hyzlk69gl_1773776146751	hyzlk69gl	2005	\N
2006_hyzlk69gl_1773776146753	hyzlk69gl	2006	\N
2007_hyzlk69gl_1773776146757	hyzlk69gl	2007	\N
2008_hyzlk69gl_1773776146762	hyzlk69gl	2008	\N
2009_hyzlk69gl_1773776146764	hyzlk69gl	2009	\N
2010_hyzlk69gl_1773776146765	hyzlk69gl	2010	\N
2011_hyzlk69gl_1773776146766	hyzlk69gl	2011	\N
2012_hyzlk69gl_1773776146768	hyzlk69gl	2012	\N
3002_hyzlk69gl_1773776146770	hyzlk69gl	3002	\N
3007_hyzlk69gl_1773776146774	hyzlk69gl	3007	\N
3008_hyzlk69gl_1773776146779	hyzlk69gl	3008	\N
3009_hyzlk69gl_1773776146781	hyzlk69gl	3009	\N
3010_hyzlk69gl_1773776146782	hyzlk69gl	3010	\N
3011_hyzlk69gl_1773776146784	hyzlk69gl	3011	\N
3012_hyzlk69gl_1773776146786	hyzlk69gl	3012	\N
3013_hyzlk69gl_1773776146791	hyzlk69gl	3013	\N
4000_hyzlk69gl_1773776146796	hyzlk69gl	4000	\N
4001_hyzlk69gl_1773776146798	hyzlk69gl	4001	\N
1000_jq5do8iqv_1773778218329	jq5do8iqv	1000	\N
1003_jq5do8iqv_1773778218336	jq5do8iqv	1003	\N
1004_jq5do8iqv_1773778218343	jq5do8iqv	1004	\N
1005_jq5do8iqv_1773778218351	jq5do8iqv	1005	\N
1006_jq5do8iqv_1773778218353	jq5do8iqv	1006	\N
1007_jq5do8iqv_1773778218355	jq5do8iqv	1007	\N
1008_jq5do8iqv_1773778218360	jq5do8iqv	1008	\N
1009_jq5do8iqv_1773778218364	jq5do8iqv	1009	\N
1010_jq5do8iqv_1773778218365	jq5do8iqv	1010	\N
1011_jq5do8iqv_1773778218367	jq5do8iqv	1011	\N
1012_jq5do8iqv_1773778218368	jq5do8iqv	1012	\N
1013_jq5do8iqv_1773778218370	jq5do8iqv	1013	\N
1014_jq5do8iqv_1773778218373	jq5do8iqv	1014	\N
1015_jq5do8iqv_1773778218378	jq5do8iqv	1015	\N
1016_jq5do8iqv_1773778218381	jq5do8iqv	1016	\N
1017_jq5do8iqv_1773778218382	jq5do8iqv	1017	\N
1018_jq5do8iqv_1773778218383	jq5do8iqv	1018	\N
1019_jq5do8iqv_1773778218385	jq5do8iqv	1019	\N
1020_jq5do8iqv_1773778218387	jq5do8iqv	1020	\N
1023_jq5do8iqv_1773778218391	jq5do8iqv	1023	\N
1197_jq5do8iqv_1773778218397	jq5do8iqv	1197	\N
1258_jq5do8iqv_1773778218398	jq5do8iqv	1258	\N
1278_jq5do8iqv_1773778218400	jq5do8iqv	1278	\N
1500_jq5do8iqv_1773778218401	jq5do8iqv	1500	\N
1501_jq5do8iqv_1773778218402	jq5do8iqv	1501	\N
1502_jq5do8iqv_1773778218403	jq5do8iqv	1502	\N
1503_jq5do8iqv_1773778218407	jq5do8iqv	1503	\N
1504_jq5do8iqv_1773778218411	jq5do8iqv	1504	\N
1505_jq5do8iqv_1773778218414	jq5do8iqv	1505	\N
1506_jq5do8iqv_1773778218415	jq5do8iqv	1506	\N
1800_jq5do8iqv_1773778218416	jq5do8iqv	1800	\N
1801_jq5do8iqv_1773778218417	jq5do8iqv	1801	\N
1802_jq5do8iqv_1773778218418	jq5do8iqv	1802	\N
1850_jq5do8iqv_1773778218419	jq5do8iqv	1850	\N
1851_jq5do8iqv_1773778218420	jq5do8iqv	1851	\N
1852_jq5do8iqv_1773778218425	jq5do8iqv	1852	\N
2005_jq5do8iqv_1773778218430	jq5do8iqv	2005	\N
2006_jq5do8iqv_1773778218431	jq5do8iqv	2006	\N
2007_jq5do8iqv_1773778218433	jq5do8iqv	2007	\N
2008_jq5do8iqv_1773778218434	jq5do8iqv	2008	\N
2009_jq5do8iqv_1773778218435	jq5do8iqv	2009	\N
2010_jq5do8iqv_1773778218436	jq5do8iqv	2010	\N
2011_jq5do8iqv_1773778218437	jq5do8iqv	2011	\N
2012_jq5do8iqv_1773778218441	jq5do8iqv	2012	\N
2013_jq5do8iqv_1773778218445	jq5do8iqv	2013	\N
2014_jq5do8iqv_1773778218446	jq5do8iqv	2014	\N
2015_jq5do8iqv_1773778218447	jq5do8iqv	2015	\N
2016_jq5do8iqv_1773778218449	jq5do8iqv	2016	\N
2017_jq5do8iqv_1773778218450	jq5do8iqv	2017	\N
2140_jq5do8iqv_1773778218451	jq5do8iqv	2140	\N
2203_jq5do8iqv_1773778218452	jq5do8iqv	2203	\N
2204_jq5do8iqv_1773778218454	jq5do8iqv	2204	\N
2218_jq5do8iqv_1773778218457	jq5do8iqv	2218	\N
2218P_jq5do8iqv_1773778218463	jq5do8iqv	2218P	\N
2221_jq5do8iqv_1773778218465	jq5do8iqv	2221	\N
3002_jq5do8iqv_1773778218467	jq5do8iqv	3002	\N
3007_jq5do8iqv_1773778218468	jq5do8iqv	3007	\N
3008_jq5do8iqv_1773778218470	jq5do8iqv	3008	\N
3009_jq5do8iqv_1773778218472	jq5do8iqv	3009	\N
3010_jq5do8iqv_1773778218478	jq5do8iqv	3010	\N
3011_jq5do8iqv_1773778218480	jq5do8iqv	3011	\N
3012_jq5do8iqv_1773778218481	jq5do8iqv	3012	\N
3013_jq5do8iqv_1773778218482	jq5do8iqv	3013	\N
3014_jq5do8iqv_1773778218483	jq5do8iqv	3014	\N
3015_jq5do8iqv_1773778218484	jq5do8iqv	3015	\N
3016_jq5do8iqv_1773778218485	jq5do8iqv	3016	\N
3017_jq5do8iqv_1773778218486	jq5do8iqv	3017	\N
3018_jq5do8iqv_1773778218488	jq5do8iqv	3018	\N
3019_jq5do8iqv_1773778218490	jq5do8iqv	3019	\N
3500_jq5do8iqv_1773778218492	jq5do8iqv	3500	\N
3501_jq5do8iqv_1773778218495	jq5do8iqv	3501	\N
3502_jq5do8iqv_1773778218496	jq5do8iqv	3502	\N
4000_jq5do8iqv_1773778218497	jq5do8iqv	4000	\N
4001_jq5do8iqv_1773778218498	jq5do8iqv	4001	\N
4002_jq5do8iqv_1773778218499	jq5do8iqv	4002	\N
4013_jq5do8iqv_1773778218500	jq5do8iqv	4013	\N
5000_jq5do8iqv_1773778218500	jq5do8iqv	5000	\N
5001_jq5do8iqv_1773778218501	jq5do8iqv	5001	\N
5002_jq5do8iqv_1773778218503	jq5do8iqv	5002	\N
\.


--
-- TOC entry 5368 (class 0 OID 18615)
-- Dependencies: 224
-- Data for Name: correrias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.correrias (id, name, year, active, created_at) FROM stdin;
hyzlk69gl	Inicio de año	2026	1	\N
jq5do8iqv	Madres	2026	1	\N
\.


--
-- TOC entry 5369 (class 0 OID 18624)
-- Dependencies: 225
-- Data for Name: delivery_dates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.delivery_dates (id, confeccionista_id, reference_id, quantity, send_date, expected_date, delivery_date, process, observation, created_at, created_by) FROM stdin;
\.


--
-- TOC entry 5370 (class 0 OID 18636)
-- Dependencies: 226
-- Data for Name: disenadoras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.disenadoras (id, nombre, cedula, telefono, activa, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5372 (class 0 OID 18646)
-- Dependencies: 228
-- Data for Name: dispatch_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dispatch_items (id, dispatch_id, reference, quantity, sale_price) FROM stdin;
1	mmv4xbw60638hsbkh	3008	18	25000.00
2	mmv4xbw60638hsbkh	1005	18	31000.00
3	mmv4xbw60638hsbkh	1500	16	32000.00
4	mmv4xbw60638hsbkh	4013	12	40000.00
5	mmvzw7im05u6elhrp	1020	24	40900.00
6	mmvzw7im05u6elhrp	1258	24	38900.00
7	mmvzw7im05u6elhrp	1502	24	34900.00
8	mmvzw7im05u6elhrp	4013	18	40900.00
9	mmw04mnfks2yvl34o	3012	9	30900.00
10	mmw04mnfks2yvl34o	3002	9	36900.00
11	mmw04mnfks2yvl34o	1197	9	36900.00
12	mmw04mnfks2yvl34o	1009	9	30900.00
13	mmw04mnfks2yvl34o	1500	9	32900.00
14	mmw05jvqwra8t0y4i	3009	9	28900.00
15	mmw05jvqwra8t0y4i	3010	9	36900.00
16	mmw05jvqwra8t0y4i	1258	9	38900.00
17	mmw05jvqwra8t0y4i	1278	9	42900.00
18	mmw07eq1miyor6a85	1502	24	30900.00
19	mmw07eq1miyor6a85	1005	24	31900.00
20	mmw07eq1miyor6a85	1197	24	36900.00
21	mmw07eq1miyor6a85	1011	21	26900.00
22	mmw07wtdhl23e9cmg	1278	24	42900.00
23	mmw08fggxfmu3ifjw	3012	24	30900.00
24	mmw09enwzra81qha8	1009	9	30900.00
25	mmw09zt56po752uci	1197	9	36900.00
26	mmw09zt56po752uci	1011	10	26900.00
27	mmw0ahkndepnr88f5	3010	9	36900.00
28	mmw0cf7qs7o0yuar8	1500	6	32900.00
29	mmw0cf7qs7o0yuar8	3002	6	36900.00
30	mmw0dmzd6amtfekv9	1005	6	31900.00
31	mmw0dmzd6amtfekv9	1197	6	36900.00
32	mmw0dmzd6amtfekv9	1502	6	30900.00
33	mmw0e2t0rqdq6jgpg	1009	6	30900.00
34	mmw0f69x8tapoy1iq	3012	12	30900.00
35	mmw0f69x8tapoy1iq	1502	6	30900.00
36	mmw0fk4wr4gxllpl6	1278	6	42900.00
37	mmw0hcsmz1fxv9bcu	3010	11	36900.00
38	mmw0hcsmz1fxv9bcu	3009	12	28900.00
39	mmw0hcsmz1fxv9bcu	1014	12	28900.00
40	mmw0i1ce8qh9clg7j	3008	12	25900.00
41	mmw0i1ce8qh9clg7j	1502	12	30900.00
42	mmw0i1ce8qh9clg7j	1197	12	36900.00
46	mmw0kghlp17m9a9wd	1278	12	42900.00
47	mmw0kghlp17m9a9wd	1500	12	32900.00
48	mmw0kghlp17m9a9wd	1197	12	36900.00
49	mmw0oc00vmz2yoh9e	1009	12	30900.00
50	mmw0oc00vmz2yoh9e	1011	14	26900.00
51	mmw0paxy9jnhahdgl	1014	12	28900.00
52	mmw0ry5von2svzwrb	1502	12	30900.00
53	mmw0ry5von2svzwrb	1197	12	36900.00
54	mmw0ry5von2svzwrb	1011	12	26900.00
55	mmw0ry5von2svzwrb	3002	12	36900.00
56	mmw0sey0ahranru8z	1014	12	28900.00
57	mmw0tbo8bw0lbq9ae	1197	13	34900.00
58	mmw0uc5ku01cw6nqo	1258	13	38900.00
59	mmw0uc5ku01cw6nqo	1014	13	28900.00
60	mmw0uc5ku01cw6nqo	3009	13	28900.00
61	mmw0uzzkepwp0t83u	1009	11	30900.00
62	mmw0yixj573uuqecs	1197	11	34900.00
63	mmw0yixj573uuqecs	1258	11	38900.00
64	mmw0yixj573uuqecs	1009	9	30900.00
65	mmw0z033ul8hj5rp4	1014	11	28900.00
66	mmw0z033ul8hj5rp4	3009	11	28900.00
67	mmw0zw5vh9be4cqqv	1197	11	34900.00
68	mmw10jebgc0a6un4w	1258	11	38900.00
69	mmw10jebgc0a6un4w	1014	11	28900.00
70	mmw10jebgc0a6un4w	3009	11	28900.00
71	mmw10wmj0hikzh03u	1009	9	30900.00
72	mmw187p8w2vplc4bs	1278	12	42900.00
73	mmw187p8w2vplc4bs	3009	24	28900.00
74	mmw187p8w2vplc4bs	3010	18	36900.00
75	mmw18sinnmxtj08e3	1502	12	30900.00
76	mmw18sinnmxtj08e3	1009	24	30900.00
77	mmw19bt6y3t7fxbps	3011	24	38900.00
78	mmw19bt6y3t7fxbps	3012	24	30900.00
79	mmw1akhbbii7z29gv	1009	12	30900.00
80	mmw1b0fajclialu8l	1197	12	36900.00
81	mmw1b0fajclialu8l	1005	12	31900.00
82	mmw1g6nqmafbyn8cj	1258	132	38000.00
83	mmw1g6nqmafbyn8cj	1278	138	43000.00
84	mmw1g6nqmafbyn8cj	1500	126	32000.00
85	mmw1g6nqmafbyn8cj	1502	126	32000.00
86	mmw1g6nqmafbyn8cj	3002	96	37000.00
87	mmw1g6nqmafbyn8cj	3011	96	39000.00
\.


--
-- TOC entry 5373 (class 0 OID 18657)
-- Dependencies: 229
-- Data for Name: dispatches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dispatches (id, client_id, correria_id, invoice_no, remission_no, dispatched_by, created_at, checked_by) FROM stdin;
mmv4xbw60638hsbkh	232	jq5do8iqv	FE-358	RM-272	Jhon Montoya	2026-03-17 21:39:06.487	-
mmvzw7im05u6elhrp	298	jq5do8iqv	FE-353	RM-266	Jhon Montoya	2026-03-18 12:06:02.256	-
mmw04mnfks2yvl34o	50	hyzlk69gl	FE-326	RM-244	Jhon Montoya	2026-03-18 12:12:35.116	-
mmw05jvqwra8t0y4i	50	hyzlk69gl	FE-349	RM-261	Jhon Montoya	2026-03-18 12:13:18.184	-
mmw07eq1miyor6a85	59	hyzlk69gl	FE-310	RM-232	Jhon Montoya	2026-03-18 12:14:44.811	-
mmw07wtdhl23e9cmg	59	hyzlk69gl	FE-347	RM-259	Jhon Montoya	2026-03-18 12:15:08.258	-
mmw08fggxfmu3ifjw	59	hyzlk69gl	FE-325	RM-243	Jhon Montoya	2026-03-18 12:15:32.417	-
mmw09enwzra81qha8	107	hyzlk69gl	FE-329	RM-246	Jhon Montoya	2026-03-18 12:16:18.046	-
mmw09zt56po752uci	107	hyzlk69gl	FE-303	RM-225	Jhon Montoya	2026-03-18 12:16:45.45	-
mmw0ahkndepnr88f5	107	hyzlk69gl	FE-352	RM-265	Jhon Montoya	2026-03-18 12:17:08.472	-
mmw0cf7qs7o0yuar8	296	hyzlk69gl	 -	RM-263	Jhon Montoya	2026-03-18 12:18:38.728	-
mmw0dmzd6amtfekv9	158	hyzlk69gl	FE-300	 -	Jhon Montoya	2026-03-18 12:19:35.449	-
mmw0e2t0rqdq6jgpg	158	hyzlk69gl	FE-311	 -	Jhon Montoya	2026-03-18 12:19:55.958	-
mmw0f69x8tapoy1iq	264	hyzlk69gl	FE-328	RM-245	Jhon Montoya	2026-03-18 12:20:47.113	-
mmw0fk4wr4gxllpl6	264	hyzlk69gl	FE-350	RM-262	Jhon Montoya	2026-03-18 12:21:05.074	-
mmw0hcsmz1fxv9bcu	138	hyzlk69gl	FE-351	RM-264	Jhon Montoya	2026-03-18 12:22:28.871	-
mmw0i1ce8qh9clg7j	138	hyzlk69gl	FE-302	RM-224	Jhon Montoya	2026-03-18 12:23:00.687	-
mmw0kghlp17m9a9wd	270	hyzlk69gl	FE-292	 -	Jhon Montoya	2026-03-18 12:24:53.628	-
mmw0oc00vmz2yoh9e	270	hyzlk69gl	FE-312	 -	Jhon Montoya	2026-03-18 12:27:54.433	-
mmw0paxy9jnhahdgl	270	hyzlk69gl	FE-345	 -	Jhon Montoya	2026-03-18 12:28:39.719	-
mmw0ry5von2svzwrb	258	hyzlk69gl	FE-301	 -	Jhon Montoya	2026-03-18 12:30:43.124	-
mmw0sey0ahranru8z	258	hyzlk69gl	FE-346	 -	Jhon Montoya	2026-03-18 12:31:04.874	-
mmw0tbo8bw0lbq9ae	231	hyzlk69gl	FE-298	 -	Jhon Montoya	2026-03-18 12:31:47.288	-
mmw0uc5ku01cw6nqo	231	hyzlk69gl	FE-343	 -	Jhon Montoya	2026-03-18 12:32:34.569	-
mmw0uzzkepwp0t83u	231	hyzlk69gl	FE-323	 -	Jhon Montoya	2026-03-18 12:33:05.458	-
mmw0yixj573uuqecs	200	hyzlk69gl	FE-327	 -	Jhon Montoya	2026-03-18 12:35:49.976	-
mmw0z033ul8hj5rp4	200	hyzlk69gl	FE-342	 -	Jhon Montoya	2026-03-18 12:36:12.208	-
mmw0zw5vh9be4cqqv	305	hyzlk69gl	FE-299	 -	Jhon Montoya	2026-03-18 12:36:53.782	-
mmw10jebgc0a6un4w	305	hyzlk69gl	FE-344	 -	Jhon Montoya	2026-03-18 12:37:23.893	-
mmw10wmj0hikzh03u	305	hyzlk69gl	FE-324	 -	Jhon Montoya	2026-03-18 12:37:41.036	-
mmw187p8w2vplc4bs	232	hyzlk69gl	FE-348	RM-260	Jhon Montoya	2026-03-18 12:43:21.982	-
mmw18sinnmxtj08e3	232	hyzlk69gl	FE-314	RM-234	Jhon Montoya	2026-03-18 12:43:48.96	-
mmw19bt6y3t7fxbps	232	hyzlk69gl	FE-330	RM-247	Jhon Montoya	2026-03-18 12:44:13.964	-
mmw1akhbbii7z29gv	179	hyzlk69gl	FE-313	RM-233	Jhon Montoya	2026-03-18 12:45:11.856	-
mmw1b0fajclialu8l	179	hyzlk69gl	FE-290	RM-218	Jhon Montoya	2026-03-18 12:45:32.518	-
mmw1g6nqmafbyn8cj	300	hyzlk69gl	 -	 -	Jhon Montoya	2026-03-18 12:49:33.878	-
\.


--
-- TOC entry 5374 (class 0 OID 18669)
-- Dependencies: 230
-- Data for Name: fichas_cortes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fichas_cortes (id, ficha_costo_id, numero_corte, fecha_corte, cantidad_cortada, materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones, total_materia_prima, total_mano_obra, total_insumos_directos, total_insumos_indirectos, total_provisiones, costo_real, precio_venta, rentabilidad, costo_proyectado, diferencia, margen_utilidad, created_by, created_at, ficha_corte) FROM stdin;
\.


--
-- TOC entry 5375 (class 0 OID 18696)
-- Dependencies: 231
-- Data for Name: fichas_costo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fichas_costo (id, referencia, ficha_diseno_id, descripcion, marca, novedad, muestra_1, muestra_2, observaciones, foto_1, foto_2, materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones, total_materia_prima, total_mano_obra, total_insumos_directos, total_insumos_indirectos, total_provisiones, costo_total, precio_venta, rentabilidad, margen_ganancia, costo_contabilizar, desc_0_precio, desc_0_rent, desc_5_precio, desc_5_rent, desc_10_precio, desc_10_rent, desc_15_precio, desc_15_rent, cantidad_total_cortada, created_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5376 (class 0 OID 18730)
-- Dependencies: 232
-- Data for Name: fichas_diseno; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fichas_diseno (id, referencia, disenadora_id, descripcion, marca, novedad, muestra_1, muestra_2, observaciones, foto_1, foto_2, materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones, total_materia_prima, total_mano_obra, total_insumos_directos, total_insumos_indirectos, total_provisiones, costo_total, importada, created_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5377 (class 0 OID 18752)
-- Dependencies: 233
-- Data for Name: inventory_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_movements (id, insumo, cantidad, valor_unitario, valor_total, proveedor, referencia_destino, remision_factura, movimiento, compra_id, fecha_creacion, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5378 (class 0 OID 18768)
-- Dependencies: 234
-- Data for Name: maletas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maletas (id, nombre, correria_id, created_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5379 (class 0 OID 18778)
-- Dependencies: 235
-- Data for Name: maletas_referencias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maletas_referencias (id, maleta_id, referencia, orden, created_at) FROM stdin;
\.


--
-- TOC entry 5380 (class 0 OID 18787)
-- Dependencies: 236
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, sender_id, receiver_id, content, read, created_at) FROM stdin;
\.


--
-- TOC entry 5382 (class 0 OID 18800)
-- Dependencies: 238
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (order_id, reference, quantity, sale_price) FROM stdin;
mmv0vumoozd214ipq	1009	12	30900.00
mmv0vumoozd214ipq	1197	12	36900.00
mmv0vumoozd214ipq	1005	12	31900.00
mmv105uomns56lt27	1278	12	42900.00
mmv105uomns56lt27	1502	12	30900.00
mmv105uomns56lt27	3011	24	38900.00
mmv105uomns56lt27	1015	24	30900.00
mmv105uomns56lt27	3009	24	28900.00
mmv105uomns56lt27	3012	24	30900.00
mmv105uomns56lt27	3010	24	36900.00
mmv105uomns56lt27	1018	24	35900.00
mmv105uomns56lt27	1009	24	30900.00
mmv116yil951jzbwg	1197	11	34900.00
mmv116yil951jzbwg	1258	11	38900.00
mmv116yil951jzbwg	1009	9	30900.00
mmv116yil951jzbwg	1014	11	28900.00
mmv116yil951jzbwg	3009	11	28900.00
mmv13mdyq31nbijwg	1197	11	34900.00
mmv13mdyq31nbijwg	1258	11	38900.00
mmv13mdyq31nbijwg	1009	9	30900.00
mmv13mdyq31nbijwg	1014	11	28900.00
mmv13mdyq31nbijwg	3009	11	28900.00
mmv14ao5crgx8dyj9	1197	13	34900.00
mmv14ao5crgx8dyj9	1258	13	38900.00
mmv14ao5crgx8dyj9	1009	11	30900.00
mmv14ao5crgx8dyj9	1014	13	28900.00
mmv14ao5crgx8dyj9	3009	13	28900.00
mmv14y0qt60j86ha8	1502	12	30900.00
mmv14y0qt60j86ha8	1197	12	36900.00
mmv14y0qt60j86ha8	1014	12	28900.00
mmv14y0qt60j86ha8	3012	12	30900.00
mmv14y0qt60j86ha8	1011	12	26900.00
mmv14y0qt60j86ha8	3002	12	36900.00
mmv15jv7m1osl8stc	4001	8	80900.00
mmv15jv7m1osl8stc	1020	12	29900.00
mmv15jv7m1osl8stc	1278	12	42900.00
mmv15jv7m1osl8stc	1500	12	32900.00
mmv15jv7m1osl8stc	1008	12	38900.00
mmv15jv7m1osl8stc	1017	12	29900.00
mmv15jv7m1osl8stc	1015	12	30900.00
mmv15jv7m1osl8stc	1009	12	30900.00
mmv15jv7m1osl8stc	1014	12	28900.00
mmv15jv7m1osl8stc	1197	12	36900.00
mmv15jv7m1osl8stc	1011	12	26900.00
mmv16fmddzdun1uoz	3012	12	30900.00
mmv16fmddzdun1uoz	3010	12	36900.00
mmv16fmddzdun1uoz	3009	12	28900.00
mmv16fmddzdun1uoz	3008	12	25900.00
mmv16fmddzdun1uoz	1502	12	30900.00
mmv16fmddzdun1uoz	1014	12	28900.00
mmv16fmddzdun1uoz	1197	12	36900.00
mmv172yvzyheqq376	1018	12	35900.00
mmv172yvzyheqq376	3012	12	30900.00
mmv172yvzyheqq376	1278	6	42900.00
mmv172yvzyheqq376	1502	6	30900.00
mmv17ldsc0pixq98y	1005	6	31900.00
mmv17ldsc0pixq98y	1009	6	30900.00
mmv17ldsc0pixq98y	1197	6	36900.00
mmv17ldsc0pixq98y	1502	6	30900.00
mmv19yy4s4dese5dd	1500	6	32900.00
mmv19yy4s4dese5dd	1008	6	38900.00
mmv19yy4s4dese5dd	3007	6	38900.00
mmv19yy4s4dese5dd	3002	6	36900.00
mmv1asw81aky9depm	3007	8	38900.00
mmv1asw81aky9depm	1009	9	30900.00
mmv1asw81aky9depm	1197	9	36900.00
mmv1asw81aky9depm	3010	9	36900.00
mmv1asw81aky9depm	1011	10	26900.00
mmv1bczsfwkg2t76q	1502	24	30900.00
mmv1bczsfwkg2t76q	1278	24	42900.00
mmv1bczsfwkg2t76q	1008	24	38900.00
mmv1bczsfwkg2t76q	1005	24	31900.00
mmv1bczsfwkg2t76q	1197	24	36900.00
mmv1bczsfwkg2t76q	1011	24	26900.00
mmv1bczsfwkg2t76q	3012	24	30900.00
mmv1bczsfwkg2t76q	1018	24	35900.00
mmv1c0j8ajy986jrc	3012	9	30900.00
mmv1c0j8ajy986jrc	3007	9	38900.00
mmv1c0j8ajy986jrc	3002	9	36900.00
mmv1c0j8ajy986jrc	3009	9	28900.00
mmv1c0j8ajy986jrc	3010	9	36900.00
mmv1c0j8ajy986jrc	1197	9	36900.00
mmv1c0j8ajy986jrc	1015	9	30900.00
mmv1c0j8ajy986jrc	1009	9	30900.00
mmv1c0j8ajy986jrc	1011	9	26900.00
mmv1c0j8ajy986jrc	1258	9	38900.00
mmv1c0j8ajy986jrc	1500	9	32900.00
mmv1c0j8ajy986jrc	1278	9	42900.00
mmv1hh58mxwsi4o7m	1258	132	38000.00
mmv1hh58mxwsi4o7m	1278	138	43000.00
mmv1hh58mxwsi4o7m	1500	126	32000.00
mmv1hh58mxwsi4o7m	1502	126	32000.00
mmv1hh58mxwsi4o7m	3002	96	37000.00
mmv1hh58mxwsi4o7m	3011	96	39000.00
mmv1trpz3mugnk3a0	4001	108	65900.00
mmv1trpz3mugnk3a0	5000	132	36900.00
mmv1trpz3mugnk3a0	2005	84	51900.00
mmv1trpz3mugnk3a0	2009	84	61900.00
mmv1trpz3mugnk3a0	2008	72	47900.00
mmv1trpz3mugnk3a0	3015	84	39900.00
mmv1trpz3mugnk3a0	3012	84	30900.00
mmv1trpz3mugnk3a0	3002	84	36900.00
mmv1trpz3mugnk3a0	2221	84	43900.00
mmv1trpz3mugnk3a0	2203	72	54900.00
mmv1trpz3mugnk3a0	2140	84	48900.00
mmv1trpz3mugnk3a0	2218	84	62900.00
mmv1trpz3mugnk3a0	1502	72	34900.00
mmv1trpz3mugnk3a0	1505	84	32900.00
mmv1trpz3mugnk3a0	1504	72	35900.00
mmv1trpz3mugnk3a0	1503	72	30900.00
mmv1trpz3mugnk3a0	3500	96	46900.00
mmv1trpz3mugnk3a0	1850	84	38900.00
mmv23l0yfzz7lmsv0	1020	24	40900.00
mmv23l0yfzz7lmsv0	1258	24	38900.00
mmv23l0yfzz7lmsv0	1197	24	36900.00
mmv23l0yfzz7lmsv0	3500	24	46900.00
mmv23l0yfzz7lmsv0	1278	24	42900.00
mmv23l0yfzz7lmsv0	1502	24	34900.00
mmv23l0yfzz7lmsv0	1852	24	42900.00
mmv23l0yfzz7lmsv0	1851	24	47900.00
mmv23l0yfzz7lmsv0	4013	18	40900.00
mmv246l671f6d0n5c	2014	12	52900.00
mmv246l671f6d0n5c	2015	12	55900.00
mmv246l671f6d0n5c	4002	12	74900.00
mmv246l671f6d0n5c	2140	12	48900.00
mmv246l671f6d0n5c	2221	12	43900.00
mmv25gam66bzmg4bm	1850	9	38900.00
mmv25gam66bzmg4bm	1502	9	34900.00
mmv25gam66bzmg4bm	3500	9	46900.00
mmv25gam66bzmg4bm	1800	9	30900.00
mmv25gam66bzmg4bm	1014	9	28900.00
mmv25gam66bzmg4bm	1801	9	29900.00
mmv25gam66bzmg4bm	2218P	6	67900.00
mmv25gam66bzmg4bm	2218	6	62900.00
mmv26gdsutvnbw8wd	5000	12	36900.00
mmv26gdsutvnbw8wd	2005	12	51900.00
mmv26gdsutvnbw8wd	2009	12	61900.00
mmv26gdsutvnbw8wd	1197	12	36900.00
mmv26gdsutvnbw8wd	1020	12	29900.00
mmv26gdsutvnbw8wd	1258	12	38900.00
mmv26gdsutvnbw8wd	3002	12	36900.00
mmv26gdsutvnbw8wd	3012	12	30900.00
mmv26gdsutvnbw8wd	1802	12	46900.00
mmv26gdsutvnbw8wd	3008	12	25900.00
mmv26gdsutvnbw8wd	1005	12	31900.00
mmv26gdsutvnbw8wd	3014	12	31900.00
mmv26gdsutvnbw8wd	3016	12	28900.00
mmv26gdsutvnbw8wd	3017	12	33900.00
mmv26gdsutvnbw8wd	1000	12	38900.00
mmv26gdsutvnbw8wd	2221	12	43900.00
mmv26gdsutvnbw8wd	1851	12	47900.00
mmv26gdsutvnbw8wd	1850	12	38900.00
mmv26gdsutvnbw8wd	1852	12	42900.00
mmv26gdsutvnbw8wd	1503	12	30900.00
mmv26gdsutvnbw8wd	1506	12	33900.00
mmv26gdsutvnbw8wd	3500	12	46900.00
mmv26gdsutvnbw8wd	1500	12	32900.00
mmv26gdsutvnbw8wd	1278	12	42900.00
mmv26gdsutvnbw8wd	1504	12	35900.00
mmv26gdsutvnbw8wd	3502	12	37900.00
mmv271g7gsaqgclgc	2203	3	54900.00
mmv271g7gsaqgclgc	2221	3	43900.00
mmv271g7gsaqgclgc	1008	5	38900.00
mmv271g7gsaqgclgc	1014	5	28900.00
mmv271g7gsaqgclgc	1197	5	36900.00
mmv271g7gsaqgclgc	3002	5	36900.00
mmv271g7gsaqgclgc	3017	5	33900.00
mmv292h6i1599nhjx	3012	21	30900.00
mmv292h6i1599nhjx	1197	18	36900.00
mmv292h6i1599nhjx	1003	18	29900.00
mmv292h6i1599nhjx	1258	18	38900.00
mmv292h6i1599nhjx	3014	18	31900.00
mmv292h6i1599nhjx	3002	18	36900.00
mmv292h6i1599nhjx	1504	18	35900.00
mmv292h6i1599nhjx	1278	18	42900.00
mmv292h6i1599nhjx	1850	18	38900.00
mmv292h6i1599nhjx	1851	18	47900.00
mmv29oiyq98te9e4g	3017	18	33900.00
mmv29oiyq98te9e4g	3012	18	30900.00
mmv29oiyq98te9e4g	3002	18	36900.00
mmv29oiyq98te9e4g	1850	18	38900.00
mmv29oiyq98te9e4g	1851	18	47900.00
mmv29oiyq98te9e4g	1005	18	31900.00
mmv29oiyq98te9e4g	1801	18	29900.00
mmv2abjltvvfj5nkn	3002	18	36900.00
mmv2abjltvvfj5nkn	3017	18	33900.00
mmv2abjltvvfj5nkn	3012	18	30900.00
mmv2bi3xmuhdu1ew4	2005	3	51900.00
mmv2bi3xmuhdu1ew4	2140	3	48900.00
mmv2bi3xmuhdu1ew4	2221	3	43900.00
mmv2bi3xmuhdu1ew4	2203	3	54900.00
mmv2bi3xmuhdu1ew4	1197	3	36900.00
mmv2bi3xmuhdu1ew4	3017	3	33900.00
mmv2bi3xmuhdu1ew4	3012	3	30900.00
mmv2bi3xmuhdu1ew4	1005	3	31900.00
mmv2bi3xmuhdu1ew4	1000	3	38900.00
mmv2bi3xmuhdu1ew4	1008	3	38900.00
mmv2bi3xmuhdu1ew4	1502	3	30900.00
mmv2bi3xmuhdu1ew4	1278	3	42900.00
mmv2bi3xmuhdu1ew4	3500	3	46900.00
mmv2c35if8blphzs6	2005	12	51000.00
mmv2c35if8blphzs6	1801	18	29000.00
mmv2c35if8blphzs6	3016	18	28000.00
mmv2c35if8blphzs6	3008	18	25000.00
mmv2c35if8blphzs6	1014	18	28000.00
mmv2c35if8blphzs6	3002	18	36000.00
mmv2c35if8blphzs6	1197	18	36000.00
mmv2c35if8blphzs6	1800	18	30000.00
mmv2c35if8blphzs6	3012	18	30000.00
mmv2c35if8blphzs6	1020	18	30000.00
mmv2c35if8blphzs6	1005	18	31000.00
mmv2c35if8blphzs6	2140	12	48000.00
mmv2c35if8blphzs6	2221	12	43000.00
mmv2c35if8blphzs6	1500	18	32000.00
mmv2c35if8blphzs6	1278	18	42000.00
mmv2c35if8blphzs6	4000	12	69000.00
mmv2c35if8blphzs6	4013	12	40000.00
mmv2c35if8blphzs6	2006	12	58000.00
mmv2ctoevbxb83sz9	1010	12	36900.00
mmv2ctoevbxb83sz9	1005	12	31900.00
mmv2ctoevbxb83sz9	1014	12	28900.00
mmv2ctoevbxb83sz9	1197	12	36900.00
mmv2ctoevbxb83sz9	1801	12	29900.00
mmv2ctoevbxb83sz9	1800	12	30900.00
mmv2ctoevbxb83sz9	3012	12	30900.00
mmv2ctoevbxb83sz9	3017	12	33900.00
mmv2ctoevbxb83sz9	3002	12	36900.00
mmv2ctoevbxb83sz9	3014	12	31900.00
mmv2ctoevbxb83sz9	1503	12	30900.00
mmv2ctoevbxb83sz9	1278	12	42900.00
mmv2ctoevbxb83sz9	1504	12	35900.00
mmv2ctoevbxb83sz9	3500	12	46900.00
mmv2ctoevbxb83sz9	1850	12	38900.00
mmv2ctoevbxb83sz9	1852	12	42900.00
mmv2dnzzshic9n3oy	2005	6	51900.00
mmv2dnzzshic9n3oy	2221	8	43900.00
mmv2dnzzshic9n3oy	1800	12	30900.00
mmv2dnzzshic9n3oy	1801	15	29900.00
mmv2dnzzshic9n3oy	3017	10	33900.00
mmv2dnzzshic9n3oy	1014	12	28900.00
mmv2dnzzshic9n3oy	1197	12	36900.00
mmv2dnzzshic9n3oy	1013	3	34900.00
mmv2dnzzshic9n3oy	1008	12	38900.00
mmv2dnzzshic9n3oy	1502	12	34900.00
mmv2dnzzshic9n3oy	1278	12	42900.00
mmv2dnzzshic9n3oy	1851	18	47900.00
mmv2eae0zaqd5x656	1008	9	37900.00
mmv2eae0zaqd5x656	1197	9	35900.00
mmv2eae0zaqd5x656	3002	9	36900.00
mmv2eae0zaqd5x656	1014	9	28900.00
mmv2eae0zaqd5x656	3500	12	45900.00
mmv2eae0zaqd5x656	1506	12	33900.00
mmv2eae0zaqd5x656	1504	12	34900.00
mmv2eae0zaqd5x656	1500	12	31900.00
mmv2eae0zaqd5x656	1278	12	40900.00
mmv2eae0zaqd5x656	1502	12	29900.00
mmv2eae0zaqd5x656	1505	12	31900.00
mmv2eae0zaqd5x656	1851	12	46900.00
mmv2eae0zaqd5x656	1850	12	37900.00
mmv2eae0zaqd5x656	2203	12	53900.00
mmv2eae0zaqd5x656	2221	12	42900.00
mmv2eae0zaqd5x656	2140	12	46900.00
mmv2eae0zaqd5x656	4002	6	72900.00
mmv2euzjiswe2s8x5	1010	12	36900.00
mmv2euzjiswe2s8x5	1005	12	31900.00
mmv2euzjiswe2s8x5	1014	12	28900.00
mmv2euzjiswe2s8x5	1197	12	36900.00
mmv2euzjiswe2s8x5	1801	12	29900.00
mmv2euzjiswe2s8x5	1800	12	30900.00
mmv2euzjiswe2s8x5	3012	12	30900.00
mmv2euzjiswe2s8x5	3017	12	33900.00
mmv2euzjiswe2s8x5	3002	12	36900.00
mmv2euzjiswe2s8x5	3014	12	34900.00
mmv2euzjiswe2s8x5	1503	12	30900.00
mmv2euzjiswe2s8x5	1278	12	41900.00
mmv2euzjiswe2s8x5	1504	12	35900.00
mmv2euzjiswe2s8x5	3500	12	45900.00
mmv2euzjiswe2s8x5	1850	12	38900.00
mmv2euzjiswe2s8x5	1852	12	42900.00
mmv2fjl3wvdbe8qv1	1003	6	41900.00
mmv2fjl3wvdbe8qv1	3008	6	25900.00
mmv2fjl3wvdbe8qv1	1197	6	36900.00
mmv2fjl3wvdbe8qv1	1014	6	28900.00
mmv2fjl3wvdbe8qv1	1258	6	38900.00
mmv2fjl3wvdbe8qv1	3002	6	36900.00
mmv2fjl3wvdbe8qv1	1504	6	35900.00
mmv2fjl3wvdbe8qv1	3502	6	37900.00
mmv2fjl3wvdbe8qv1	1851	3	47900.00
mmv2fjl3wvdbe8qv1	1802	3	46900.00
mmv2fjl3wvdbe8qv1	3017	1	33900.00
mmv2g61x9cp8m3nxi	2008	9	46900.00
mmv2g61x9cp8m3nxi	2203	9	53900.00
mmv2g61x9cp8m3nxi	2221	9	42900.00
mmv2g61x9cp8m3nxi	3015	9	38900.00
mmv2g61x9cp8m3nxi	1009	9	29900.00
mmv2g61x9cp8m3nxi	3012	9	29900.00
mmv2g61x9cp8m3nxi	1010	9	35900.00
mmv2g61x9cp8m3nxi	1008	9	37900.00
mmv2g61x9cp8m3nxi	1258	9	37900.00
mmv2g61x9cp8m3nxi	3017	9	32900.00
mmv2g61x9cp8m3nxi	3002	9	35900.00
mmv2g61x9cp8m3nxi	1014	9	27900.00
mmv2g61x9cp8m3nxi	3008	9	24900.00
mmv2g61x9cp8m3nxi	1197	9	35900.00
mmv2g61x9cp8m3nxi	1800	9	29900.00
mmv2g61x9cp8m3nxi	1801	9	28900.00
mmv2g61x9cp8m3nxi	1802	9	45900.00
mmv2g61x9cp8m3nxi	1850	9	38900.00
mmv2g61x9cp8m3nxi	1852	9	41900.00
mmv2g61x9cp8m3nxi	1851	9	46900.00
mmv2g61x9cp8m3nxi	1504	9	34900.00
mmv2g61x9cp8m3nxi	3500	9	45900.00
mmv2g61x9cp8m3nxi	1502	9	29900.00
mmv2g61x9cp8m3nxi	1501	9	36900.00
mmv2g61x9cp8m3nxi	1503	9	29900.00
mmv2g61x9cp8m3nxi	1506	9	32900.00
mmv2hibb54tbm3byx	3017	18	33900.00
mmv2hibb54tbm3byx	3012	18	30900.00
mmv2i2a8wup6a3qlk	5000	36	36900.00
mmv2i2a8wup6a3qlk	1801	30	29900.00
mmv2i2a8wup6a3qlk	2006	30	58900.00
mmv2i2a8wup6a3qlk	1197	30	36900.00
mmv2i2a8wup6a3qlk	2221	30	43900.00
mmv2i2a8wup6a3qlk	2005	30	51900.00
mmv2i2a8wup6a3qlk	4000	30	65900.00
mmv2i2a8wup6a3qlk	2140	30	48900.00
\.


--
-- TOC entry 5383 (class 0 OID 18810)
-- Dependencies: 239
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, client_id, seller_id, correria_id, total_value, created_at, settled_by, order_number, start_date, end_date, porcentaje_oficial, porcentaje_remision) FROM stdin;
mmv0vumoozd214ipq	179	t47okzgix	hyzlk69gl	1196400.00	2026-03-17T19:45:58.992Z	Jhon Montoya	1	2026-01-15	\N	50.00	50.00
mmv105uomns56lt27	232	t47okzgix	hyzlk69gl	6484800.00	2026-03-17T19:49:20.160Z	Jhon Montoya	2	2026-01-15	\N	50.00	50.00
mmv116yil951jzbwg	305	t47okzgix	hyzlk69gl	1725700.00	2026-03-17T19:50:08.250Z	Jhon Montoya	3	2026-01-15	2026-02-28	100.00	0.00
mmv13mdyq31nbijwg	200	t47okzgix	hyzlk69gl	1725700.00	2026-03-17T19:52:01.558Z	Jhon Montoya	4	2026-01-15	2026-02-28	100.00	0.00
mmv14ao5crgx8dyj9	231	t47okzgix	hyzlk69gl	2050700.00	2026-03-17T19:52:33.029Z	Jhon Montoya	5	2026-01-15	2026-02-28	100.00	0.00
mmv14y0qt60j86ha8	258	f9fl49sb9	hyzlk69gl	2296800.00	2026-03-17T19:53:03.290Z	Jhon Montoya	6	2026-01-20	\N	100.00	0.00
mmv15jv7m1osl8stc	270	f9fl49sb9	hyzlk69gl	4595200.00	2026-03-17T19:53:31.603Z	Jhon Montoya	7	2026-01-22	\N	100.00	0.00
mmv16fmddzdun1uoz	138	f9fl49sb9	hyzlk69gl	2631600.00	2026-03-17T19:54:12.757Z	Jhon Montoya	8	2026-02-04	\N	50.00	50.00
mmv172yvzyheqq376	264	f9fl49sb9	hyzlk69gl	1244400.00	2026-03-17T19:54:43.015Z	Jhon Montoya	9	2026-02-05	\N	50.00	50.00
mmv17ldsc0pixq98y	158	t47okzgix	hyzlk69gl	783600.00	2026-03-17T19:55:06.880Z	Jhon Montoya	10	\N	\N	100.00	0.00
mmv19yy4s4dese5dd	296	t47okzgix	hyzlk69gl	885600.00	2026-03-17T19:56:57.772Z	Jhon Montoya	11	2026-03-01	\N	0.00	100.00
mmv1asw81aky9depm	107	t47okzgix	hyzlk69gl	1522500.00	2026-03-17T19:57:36.584Z	Jhon Montoya	12	2026-02-05	\N	50.00	50.00
mmv1bczsfwkg2t76q	59	t47okzgix	hyzlk69gl	6604800.00	2026-03-17T19:58:02.632Z	Jhon Montoya	13	2026-02-09	\N	10.00	90.00
mmv1c0j8ajy986jrc	50	f9fl49sb9	hyzlk69gl	3715200.00	2026-03-17T19:58:33.140Z	Jhon Montoya	14	2026-02-11	\N	50.00	50.00
mmv1hh58mxwsi4o7m	300	t47okzgix	hyzlk69gl	26310000.00	2026-03-17T20:02:47.948Z	Jhon Montoya	1	2026-01-14	2026-02-19	50.00	50.00
mmv1trpz3mugnk3a0	300	t47okzgix	jq5do8iqv	68930400.00	2026-03-17T20:12:21.527Z	Jhon Montoya	1	2026-04-01	2026-06-04	50.00	50.00
mmv23l0yfzz7lmsv0	298	ye3j7ykci	jq5do8iqv	8709000.00	2026-03-17T20:19:59.410Z	Jhon Montoya	1	2026-03-06	\N	20.00	80.00
mmv246l671f6d0n5c	193	f9fl49sb9	jq5do8iqv	3318000.00	2026-03-17T20:20:27.354Z	Jhon Montoya	2	2026-03-20	\N	100.00	0.00
mmv25gam66bzmg4bm	276	f9fl49sb9	jq5do8iqv	2678400.00	2026-03-17T20:21:26.590Z	Jhon Montoya	3	2026-04-10	\N	30.00	70.00
mmv26gdsutvnbw8wd	310	t47okzgix	jq5do8iqv	11968800.00	2026-03-17T20:22:13.360Z	Jhon Montoya	4	2026-03-10	\N	50.00	50.00
mmv271g7gsaqgclgc	283	t47okzgix	jq5do8iqv	1173900.00	2026-03-17T20:22:40.663Z	Jhon Montoya	5	2026-03-10	\N	100.00	0.00
mmv292h6i1599nhjx	114	f9fl49sb9	jq5do8iqv	6770700.00	2026-03-17T20:24:15.306Z	Jhon Montoya	6	2026-03-11	2026-04-30	100.00	0.00
mmv29oiyq98te9e4g	179	t47okzgix	jq5do8iqv	4505400.00	2026-03-17T20:24:43.882Z	Jhon Montoya	7	2026-03-11	\N	50.00	50.00
mmv2abjltvvfj5nkn	177	t47okzgix	jq5do8iqv	1830600.00	2026-03-17T20:25:13.713Z	Jhon Montoya	8	2026-03-11	\N	50.00	50.00
mmv2bi3xmuhdu1ew4	216	t47okzgix	jq5do8iqv	1595100.00	2026-03-17T20:26:08.877Z	Jhon Montoya	9	2026-03-12	\N	20.00	80.00
mmv2c35if8blphzs6	232	t47okzgix	jq5do8iqv	10494000.00	2026-03-17T20:26:36.150Z	Jhon Montoya	10	2026-03-12	\N	50.00	50.00
mmv2ctoevbxb83sz9	159	t47okzgix	jq5do8iqv	6808800.00	2026-03-17T20:27:10.526Z	Jhon Montoya	11	2026-03-13	2026-04-20	50.00	50.00
mmv2dnzzshic9n3oy	296	t47okzgix	jq5do8iqv	4977800.00	2026-03-17T20:27:49.823Z	Jhon Montoya	12	2026-03-14	\N	50.00	50.00
mmv2eae0zaqd5x656	233	t47okzgix	jq5do8iqv	7427400.00	2026-03-17T20:28:18.840Z	Jhon Montoya	13	2026-03-13	2026-04-20	50.00	50.00
mmv2euzjiswe2s8x5	230	t47okzgix	jq5do8iqv	6820800.00	2026-03-17T20:28:45.535Z	Jhon Montoya	14	2026-03-13	2026-04-20	50.00	50.00
mmv2fjl3wvdbe8qv1	201	t47okzgix	jq5do8iqv	2017500.00	2026-03-17T20:29:17.415Z	Jhon Montoya	15	2026-03-15	\N	100.00	0.00
mmv2g61x9cp8m3nxi	80	t47okzgix	jq5do8iqv	8589600.00	2026-03-17T20:29:46.533Z	Jhon Montoya	16	2026-04-15	\N	100.00	0.00
mmv2hibb54tbm3byx	100	f9fl49sb9	jq5do8iqv	1166400.00	2026-03-17T20:30:49.079Z	Jhon Montoya	17	2026-04-01	\N	50.00	50.00
mmv2i2a8wup6a3qlk	311	t47okzgix	jq5do8iqv	11417400.00	2026-03-17T20:31:14.960Z	Jhon Montoya	18	2026-03-17	\N	50.00	50.00
\.


--
-- TOC entry 5384 (class 0 OID 18822)
-- Dependencies: 240
-- Data for Name: product_references; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_references (id, description, price, designer, cloth1, avg_cloth1, cloth2, avg_cloth2, active, created_at) FROM stdin;
1000	SHORT FRANJA BOTA	38900.00	N/A	NOCHES DE VIENA	0.70		0.00	1	\N
1003	SHORT BRILLO LINO	41900.00	N/A		0.00		0.00	1	\N
1004	SHORT BRILLO NOCHES DE VIENA	41900.00	N/A		0.00		0.00	1	\N
1005	SHORT D.	31900.00	N/A	LINO NATURAL	0.70		0.00	1	\N
1006	SHORT DORADO	24900.00	N/A		0.00		0.00	1	\N
1007	SHORT DE VIVOS Y HEBILLA	37900.00	N/A	NOCHES DE VIENA	0.69		0.00	1	\N
1008	SHORT DE CORREA FORRADA	38900.00	N/A	LINO NATURAL	0.69		0.00	1	\N
1009	SHORT DE PRETINA BOTONES LATERAL	30900.00	N/A	NOCHES DE VIENA	0.64		0.00	1	\N
1010	SHORT D. HEBILLA FLOR	36900.00	N/A	NOCHES DE VIENA	0.65		0.00	1	\N
1011	SHORT D.	26900.00	N/A	LINO CREPE	0.63		0.00	1	\N
1012	SHORT D.	22900.00	N/A	BENGALINA	0.45		0.00	1	\N
1013	SHORT D. BOTONES LATERALES	34900.00	N/A	BOSSE	0.55		0.00	1	\N
1014	SHORT D. BOTONES LATERALES	28900.00	N/A	NOCHES DE VIENA	0.67		0.00	1	\N
1015	SHORT D. BOLSILLO LATERAL	30900.00	N/A	RIB TOP CREPE	0.55		0.00	1	\N
1016	SHORT D. CIERRE DECORATIVO	28900.00	N/A	BENGALINA	0.60		0.00	1	\N
1017	SHORT D. NUDO LATERAL	29900.00	N/A	RAYON COOL	0.58		0.00	1	\N
1018	SHORT D. PRENSES	35900.00	N/A	DRIL LENOVA	0.62		0.00	1	\N
1019	SHORT D. BOTONES	33900.00	N/A	NOCHES DE VIENA	0.51		0.00	1	\N
1020	SHORT D. PRETINA ANCHA	40900.00	N/A	DRIL ROYAL	0.77		0.00	1	\N
1023	SHORT RAYAS CON HEBILLA FORRADA	34900.00	N/A	RU KIOTO	0.71		0.00	1	\N
1197	SHORT D. CLASICO	36900.00	N/A	NOCHES DE VIENA	0.75		0.00	1	\N
1258	SHORT D. BOLSILLOS LATERALES	38900.00	N/A	DRIL ROYAL	0.68	DRIL NEW YORK	0.00	1	\N
1278	SHORT D. PLUS CLASICO	42900.00	N/A	MIKONOS	0.83		0.00	1	\N
1500	SHORT D.PLUSS TEXTURA	32900.00	N/A	MAUI	0.81		0.00	1	\N
1501	SHORT PLUSS BRILLO	37900.00	N/A		0.00		0.00	1	\N
1502	SHORT D. PLUS CLASICO	34900.00	N/A	NOCHES DE VIENA	0.79		0.00	1	\N
1503	SHORT PLUSS PESTAÑA DEL. CINTURON	30900.00	N/A	RAYON TWILL	0.84		0.00	1	\N
1504	SHORT PLUSS CORREA HEBILLA PLATA	35900.00	N/A	NOCHES DE VIENA	0.81		0.00	1	\N
1505	SHORT PLUSS MULTIUSOS	32900.00	N/A	MOMMA	0.76		0.00	1	\N
1506	SHORT PLUSS GRIPIUR EN BOTA	33900.00	N/A	RAYON TWILL PUNTO	0.73		0.00	1	\N
1800	BERMUDA BOTON TEÑIDO	30900.00	N/A	NOCHES DE VIENA	0.73		0.00	1	\N
1801	BERMUDA BOTON TEÑIDO	29900.00	N/A	BENGALINA	0.67		0.00	1	\N
1802	BERMUDA 5 BOLSILLOS	46900.00	N/A	DRILL LENOVO	0.88		0.00	1	\N
1850	BERMUDA PLUSS BOLS FRENTE INCRUSTADO EN COSTADOS	38900.00	N/A	LINO CREPE	1.00		0.00	1	\N
1851	BERMUDA PLUS HEBILLA 5	47900.00	N/A	DRILL NEW YORK	1.00		0.00	1	\N
1852	BERMUDA PLUSS3 BOTONES COSTADO IZQ	42900.00	N/A	RAYON COOL TOUCH	0.89		0.00	1	\N
2005	PANTALON D. CLASICO	51900.00	N/A	LINO NATURAL	1.32		0.00	1	\N
2006	PANTALON D. BOTA CAMPANA	58900.00	N/A	MOMA	1.95	PIEL DE DURAZNO	0.35	1	\N
2007	PANTALON D. ELASTICO DECORATIVO	59900.00	N/A	LINO OPERA	1.23		0.00	1	\N
2008	PANTALON D. BOLSILLO LATERAL	47900.00	N/A	NOCHES DE VIENA	1.32		0.00	1	\N
2009	PANTALON D. CARGO	61900.00	N/A	LINO NATURAL	1.40		0.00	1	\N
2010	PANTALON D. PAÑUELETA	44900.00	N/A	RAYON TWILL	1.32		0.00	1	\N
2011	PANTALON D. ABIERTO	45900.00	N/A	CHALIS DIAGONAL	1.34		0.00	1	\N
2012	PANTALON D. ESTAMPADO	52900.00	N/A	LINO ESTAMPADO	1.24		0.00	1	\N
2013	PANTALON CORTES	74900.00	N/A	PUNTI ROMA	1.40		0.00	1	\N
2014	PANTALON GLOBO	52900.00	N/A	LULULEMON PANT	1.57		0.00	1	\N
2015	PANTALON CON TEXTURA	55900.00	N/A	FLOR DE JAMAICA	1.35	LYCRA ALGODÓN	0.35	1	\N
2016	PANTALON RAYAS	61900.00	N/A	RAYAS	1.51		0.00	1	\N
2017	LEGGIS	29900.00	N/A	DESTELLANTE	0.81		0.00	1	\N
2140	PANTALON PLUSS RESORTADO	48900.00	N/A	MOMMA	1.33		0.00	1	\N
2203	PANTALON PLUSS CHARRETERA CON HEBILLA Y VENA	54900.00	N/A	NOCHES DE VIENA	1.61		0.00	1	\N
2204	PANTALON PLUSS ESTAMPADO	44900.00	N/A	ACAPULCO	1.38		0.00	1	\N
2218	PANTALON BOLSILLOS CARGO CON TAPA	62900.00	N/A	DRILL ROYAL	1.40		0.00	1	\N
2218P	PANTALON PLUSS BOLSILLO CARGO CON TAPA	67900.00	N/A		0.00		0.00	1	\N
2221	PANTALON PLUSS CON GRIPIUR BOLSILLOS	43900.00	N/A	LINO MIXED	1.56		0.00	1	\N
3002	FALDASHORT D.	36900.00	N/A	NOCHES DE VIENA	0.65		0.00	1	\N
3007	FALDASHORT D. HEBILLA REDONDA	38900.00	N/A	LINO NATURAL	0.70		0.00	1	\N
3008	FALDASHORT D. CORBATIN	25900.00	N/A	BENGALINA	0.57		0.00	1	\N
3009	FALDASHORT D. CORBATIN	28900.00	N/A	NOCHES DE VIENA	0.62		0.00	1	\N
3010	FALDASHORT D. NUDO	36900.00	N/A	NOCHES DE VIENA	0.62		0.00	1	\N
3011	FALDASHORT D. BOLSILLO LATERAL	38900.00	N/A	LULULEMON	0.54	LYCRA	0.29	1	\N
3012	FALDASHORT D. TABLAS	30900.00	N/A	BENGALINA	0.96		0.00	1	\N
3013	FALDASHORT D. TABLAS	36900.00	N/A	BENGALINA	0.93		0.00	1	\N
3014	FALDASHORT BOLSILLOS CON TAPA	31900.00	N/A	RAYON TWILL PUNTO	0.80		0.00	1	\N
3015	FALDASHORT ABERTURA PIERNA	39900.00	N/A	PUNTI ROMA	0.51		0.00	1	\N
3016	FALDASHORT MOÑO	28900.00	N/A	RAYON BROKEN	0.75		0.00	1	\N
3017	FALDASHORT 2 TAPAS CON GRIPIUR	33900.00	N/A	LINO MIXED	0.74		0.00	1	\N
3018	FALDASHORT CAPAS	45900.00	N/A	CROCHET AP	0.97	LYCRA	0.38	1	\N
3019	FALDASHORT RAYA CON FRANJA	37900.00	N/A	RAYAS	0.63		0.00	1	\N
3500	FALDASHORT PLUSS	46900.00	N/A	RIB STOP CREPE	0.85		0.00	1	\N
4000	CONJUNTO MOMA BLUSON MANGA LARGA	69900.00	N/A	MOMA	2.15		0.00	1	\N
4001	CONJUNTO MOMA BLUSON MANGA CORTA	65900.00	N/A	MOMA	1.95		0.00	1	\N
3501	FALDASHORT PLUSS CORREA CADENA	38900.00	N/A	BENGALINA HEAVY	0.77		0.00	1	\N
3502	FALDASHORT PLUSS HEBILLA Y FRANJA	37900.00	N/A	NOCHES DE VIENA	0.75		0.00	1	\N
4002	CONJUNTO  BLUSON MC	74900.00	N/A	SOMOSA	1.95		0.00	1	\N
4013	ENTERIZO	40900.00	N/A	LINO NATURAL	1.75		0.00	1	\N
5000	FALDA RESORTADA DESESTRUTURADA	36900.00	N/A	MOMMA	1.90		0.00	1	\N
5001	FALDA CORSETERA	36900.00	N/A	SATIN LYCRADO	0.75		0.00	1	\N
5002	FALDA ESTAMPADA	47900.00	N/A	LINO ESTAMPADO	1.09		0.00	1	\N
\.


--
-- TOC entry 5385 (class 0 OID 18832)
-- Dependencies: 241
-- Data for Name: production_tracking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.production_tracking (ref_id, correria_id, programmed, cut, inventory, novedades) FROM stdin;
1009	hyzlk69gl	5	3	2	\N
1197	hyzlk69gl	5	3	2	\N
1005	hyzlk69gl	5	3	2	\N
4013	jq5do8iqv	0	0	95	\N
4001	jq5do8iqv	0	150	0	\N
1003	jq5do8iqv	0	0	269	\N
1004	jq5do8iqv	0	0	70	\N
1005	jq5do8iqv	0	0	23	\N
1009	jq5do8iqv	0	0	54	\N
1020	jq5do8iqv	0	0	47	\N
1197	jq5do8iqv	0	120	4	\N
1278	jq5do8iqv	0	0	41	\N
1258	jq5do8iqv	0	0	106	\N
1500	jq5do8iqv	0	0	160	\N
1502	jq5do8iqv	0	0	111	\N
1505	jq5do8iqv	0	120	0	\N
2140	jq5do8iqv	0	120	0	\N
2203	jq5do8iqv	0	120	0	\N
3002	jq5do8iqv	0	120	75	\N
3008	jq5do8iqv	0	0	48	\N
\.


--
-- TOC entry 5386 (class 0 OID 18842)
-- Dependencies: 242
-- Data for Name: reception_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reception_items (id, reception_id, reference, quantity) FROM stdin;
\.


--
-- TOC entry 5388 (class 0 OID 18852)
-- Dependencies: 244
-- Data for Name: receptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.receptions (id, batch_code, confeccionista, has_seconds, charge_type, charge_units, received_by, created_at, affects_inventory, incomplete_units, is_packed, bag_quantity, arrival_date) FROM stdin;
\.


--
-- TOC entry 5389 (class 0 OID 18864)
-- Dependencies: 245
-- Data for Name: return_reception_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return_reception_items (id, return_reception_id, reference, quantity, unit_price) FROM stdin;
\.


--
-- TOC entry 5391 (class 0 OID 18874)
-- Dependencies: 247
-- Data for Name: return_receptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return_receptions (id, client_id, credit_note_number, total_value, received_by, created_at) FROM stdin;
\.


--
-- TOC entry 5400 (class 0 OID 19166)
-- Dependencies: 256
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schema_migrations (id, migration_name, applied_at, success, error_message, execution_time_ms) FROM stdin;
1	001_add_arrival_date_to_receptions.sql	2026-03-17 09:40:53.510984	t	\N	4
2	002_add_checked_by_column_to_dispatches_melas.sql	2026-03-17 16:26:39.408152	t	\N	42
3	003_add_novedades_column_to_production_tracking_melas.sql	2026-03-17 16:45:06.948429	t	\N	14
\.


--
-- TOC entry 5392 (class 0 OID 18884)
-- Dependencies: 248
-- Data for Name: sellers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sellers (id, name, active, created_at) FROM stdin;
f9fl49sb9	Raul Gonzalez	1	\N
t47okzgix	Lina Pulgarin	1	\N
ye3j7ykci	Bodega	1	\N
\.


--
-- TOC entry 5393 (class 0 OID 18892)
-- Dependencies: 249
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
759	mmc6rtuqnu4p7lxlx	3RqLFypqo9g9yxq4AAAf	online	2026-03-17 16:43:24.88113	2026-03-17 16:43:24.88113
760	mmc6rtuqnu4p7lxlx	9llKGDuQ250By-WRAAAh	online	2026-03-17 16:43:24.881532	2026-03-17 16:43:24.881532
761	mmc6rtuqnu4p7lxlx	XwLmCViGnbxt2v01AAAj	online	2026-03-17 16:43:24.991543	2026-03-17 16:43:24.991543
762	mmc6rtuqnu4p7lxlx	kCiRe9Avoe6Si8sjAAAl	online	2026-03-17 16:43:25.039437	2026-03-17 16:43:25.039437
763	mmc6rtuqnu4p7lxlx	ZOotUKfdu0xwYYXkAAAn	online	2026-03-17 16:43:25.059232	2026-03-17 16:43:25.059232
441	mmc6rtuqnu4p7lxlx	seCRMJPUn_PdJxUCAAAV	online	2026-03-04 12:48:54.229258	2026-03-04 12:48:54.229258
442	mmc6rtuqnu4p7lxlx	V0JbEjem-r0u0coEAAAX	online	2026-03-04 12:48:54.281423	2026-03-04 12:48:54.281423
443	mmc6rtuqnu4p7lxlx	FCuUU7X7fvKf8m_3AAAZ	online	2026-03-04 12:48:54.406818	2026-03-04 12:48:54.406818
444	mmc6rtuqnu4p7lxlx	yvSttoeQYBgWw-7zAAAb	online	2026-03-04 12:48:54.425931	2026-03-04 12:48:54.425931
445	mmc6rtuqnu4p7lxlx	M2h6rgo6oJviF8RHAAAd	online	2026-03-04 12:48:54.441257	2026-03-04 12:48:54.441257
839	mmc6rtuqnu4p7lxlx	_HXJocjS5HZsF0HoAAAL	online	2026-03-18 11:28:36.293466	2026-03-18 11:28:36.293466
840	mmc6rtuqnu4p7lxlx	jnECvW5UR0fioY6ZAAAN	online	2026-03-18 11:28:36.294111	2026-03-18 11:28:36.294111
841	mmc6rtuqnu4p7lxlx	Zx8kkRJpB7KL7iFfAAAP	online	2026-03-18 11:28:36.42707	2026-03-18 11:28:36.42707
842	mmc6rtuqnu4p7lxlx	kGmSD0l0gAwxwTRrAAAR	online	2026-03-18 11:28:36.473773	2026-03-18 11:28:36.473773
843	mmc6rtuqnu4p7lxlx	x-FqweobP8dSolJvAAAT	online	2026-03-18 11:28:36.505597	2026-03-18 11:28:36.505597
571	mmc6rtuqnu4p7lxlx	CaRwTRzU8wzWTCwgAAAV	online	2026-03-06 09:16:16.521081	2026-03-06 09:16:16.521081
572	mmc6rtuqnu4p7lxlx	zrzMwkkMIfvJrDIXAAAX	online	2026-03-06 09:16:16.536214	2026-03-06 09:16:16.536214
573	mmc6rtuqnu4p7lxlx	tMO_CAIHjkm1WGYeAAAZ	online	2026-03-06 09:16:16.597839	2026-03-06 09:16:16.597839
574	mmc6rtuqnu4p7lxlx	58BB5pXxvf2ONyOWAAAb	online	2026-03-06 09:16:16.613051	2026-03-06 09:16:16.613051
575	mmc6rtuqnu4p7lxlx	MLTFCOI_yjD97gxlAAAd	online	2026-03-06 09:16:16.626959	2026-03-06 09:16:16.626959
779	mmc6rtuqnu4p7lxlx	6ACITI6-irrdtbbnAAAh	online	2026-03-17 16:52:21.435583	2026-03-17 16:52:21.435583
780	mmc6rtuqnu4p7lxlx	yxMBm8mjvrxnyxlNAAAf	online	2026-03-17 16:52:21.442178	2026-03-17 16:52:21.442178
781	mmc6rtuqnu4p7lxlx	Hzpqs_EbIcsjStGXAAAj	online	2026-03-17 16:52:21.574109	2026-03-17 16:52:21.574109
782	mmc6rtuqnu4p7lxlx	e9G-WgtxmSyGsjRnAAAl	online	2026-03-17 16:52:21.624656	2026-03-17 16:52:21.624656
783	mmc6rtuqnu4p7lxlx	MLN7lrQfuYeo-hCTAAAn	online	2026-03-17 16:52:21.660976	2026-03-17 16:52:21.660976
601	mmc6rtuqnu4p7lxlx	b3i1mEqoBFkdfJxZAAAz	online	2026-03-06 09:21:06.0939	2026-03-06 09:21:06.0939
602	mmc6rtuqnu4p7lxlx	EprxvovdniLJ3kKgAAA1	online	2026-03-06 09:21:06.110117	2026-03-06 09:21:06.110117
603	mmc6rtuqnu4p7lxlx	fkjQOif0UPuymkBQAAA3	online	2026-03-06 09:21:06.159083	2026-03-06 09:21:06.159083
604	mmc6rtuqnu4p7lxlx	PK5rNvp68tqZBGgyAAA5	online	2026-03-06 09:21:06.172121	2026-03-06 09:21:06.172121
605	mmc6rtuqnu4p7lxlx	j_EFiL4pBZJ7ahMoAAA7	online	2026-03-06 09:21:06.188987	2026-03-06 09:21:06.188987
739	mmc6rtuqnu4p7lxlx	LvnkRgF2d5gfPpUCAACN	online	2026-03-17 16:18:32.141345	2026-03-17 16:18:32.141345
740	mmc6rtuqnu4p7lxlx	0y083X6q3BC_0Fl1AACP	online	2026-03-17 16:18:32.305523	2026-03-17 16:18:32.305523
741	mmc6rtuqnu4p7lxlx	m_zFPZGB59OxsFTKAACR	online	2026-03-17 16:18:32.437581	2026-03-17 16:18:32.437581
742	mmc6rtuqnu4p7lxlx	2T1VzFYdUYfiik3IAACT	online	2026-03-17 16:18:32.463748	2026-03-17 16:18:32.463748
743	mmc6rtuqnu4p7lxlx	Is05NkM66YmJ-NaJAACV	online	2026-03-17 16:18:32.520382	2026-03-17 16:18:32.520382
\.


--
-- TOC entry 5395 (class 0 OID 18904)
-- Dependencies: 251
-- Data for Name: user_view_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_view_preferences (id, user_id, view_order, created_at, updated_at) FROM stdin;
2	mmceztampsosqrnq8	["settle", "orders", "salesReport", "fichas-diseno", "fichas-costo", "reception", "returnReception", "maletas", "dispatch", "inventory", "orderHistory", "dispatchControl", "deliveryDates", "reports", "masters", "compras", "comparativeDashboard"]	2026-03-17 15:59:11.16347	2026-03-17 15:59:11.16347
1	mmc6rtuqnu4p7lxlx	["orders", "settle", "dispatch", "reports", "comparativeDashboard", "salesReport", "fichas-costo", "fichas-diseno", "reception", "returnReception", "maletas", "inventory", "orderHistory", "dispatchControl", "deliveryDates", "masters", "compras"]	2026-03-04 14:11:31.442388	2026-03-18 07:18:04.77564
\.


--
-- TOC entry 5397 (class 0 OID 18916)
-- Dependencies: 253
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, login_code, pin_hash, role, active, created_at, updated_at) FROM stdin;
mmc6rtuqnu4p7lxlx	Jhon Montoya	JAM	$2b$10$ToUkDyTmUoXIEta/vsdGz.v90oZWLdJspRVap6WQPlPGRnoOPUGt.	admin	1	\N	2026-03-17 14:35:34.897302
mmceztampsosqrnq8	MARIA MERCEDES	MMB	$2b$10$BJJPq.GzQGoh/APAG9ISUOk11HJ3aHVm3bYM38Qeukhmgrec9Dvr.	admin	1	\N	2026-03-17 15:57:12.641037
\.


--
-- TOC entry 5417 (class 0 OID 0)
-- Dependencies: 227
-- Name: dispatch_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dispatch_items_id_seq', 87, true);


--
-- TOC entry 5418 (class 0 OID 0)
-- Dependencies: 237
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- TOC entry 5419 (class 0 OID 0)
-- Dependencies: 243
-- Name: reception_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reception_items_id_seq', 1, false);


--
-- TOC entry 5420 (class 0 OID 0)
-- Dependencies: 246
-- Name: return_reception_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.return_reception_items_id_seq', 1, false);


--
-- TOC entry 5421 (class 0 OID 0)
-- Dependencies: 255
-- Name: schema_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.schema_migrations_id_seq', 3, true);


--
-- TOC entry 5422 (class 0 OID 0)
-- Dependencies: 250
-- Name: user_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_sessions_id_seq', 843, true);


--
-- TOC entry 5423 (class 0 OID 0)
-- Dependencies: 252
-- Name: user_view_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_view_preferences_id_seq', 2, true);


--
-- TOC entry 5424 (class 0 OID 0)
-- Dependencies: 254
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- TOC entry 5090 (class 2606 OID 18935)
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- TOC entry 5092 (class 2606 OID 18937)
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- TOC entry 5098 (class 2606 OID 18939)
-- Name: compras compras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT compras_pkey PRIMARY KEY (id);


--
-- TOC entry 5104 (class 2606 OID 18941)
-- Name: confeccionistas confeccionistas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.confeccionistas
    ADD CONSTRAINT confeccionistas_pkey PRIMARY KEY (id);


--
-- TOC entry 5106 (class 2606 OID 18943)
-- Name: correria_catalog correria_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.correria_catalog
    ADD CONSTRAINT correria_catalog_pkey PRIMARY KEY (id);


--
-- TOC entry 5108 (class 2606 OID 18945)
-- Name: correrias correrias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.correrias
    ADD CONSTRAINT correrias_pkey PRIMARY KEY (id);


--
-- TOC entry 5110 (class 2606 OID 18947)
-- Name: delivery_dates delivery_dates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_dates
    ADD CONSTRAINT delivery_dates_pkey PRIMARY KEY (id);


--
-- TOC entry 5114 (class 2606 OID 18949)
-- Name: disenadoras disenadoras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disenadoras
    ADD CONSTRAINT disenadoras_pkey PRIMARY KEY (id);


--
-- TOC entry 5116 (class 2606 OID 18951)
-- Name: dispatch_items dispatch_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispatch_items
    ADD CONSTRAINT dispatch_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5120 (class 2606 OID 18953)
-- Name: dispatches dispatches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispatches
    ADD CONSTRAINT dispatches_pkey PRIMARY KEY (id);


--
-- TOC entry 5125 (class 2606 OID 18955)
-- Name: fichas_cortes fichas_cortes_ficha_costo_id_numero_corte_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_cortes
    ADD CONSTRAINT fichas_cortes_ficha_costo_id_numero_corte_key UNIQUE (ficha_costo_id, numero_corte);


--
-- TOC entry 5127 (class 2606 OID 18957)
-- Name: fichas_cortes fichas_cortes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_cortes
    ADD CONSTRAINT fichas_cortes_pkey PRIMARY KEY (id);


--
-- TOC entry 5130 (class 2606 OID 18959)
-- Name: fichas_costo fichas_costo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_costo
    ADD CONSTRAINT fichas_costo_pkey PRIMARY KEY (id);


--
-- TOC entry 5132 (class 2606 OID 18961)
-- Name: fichas_costo fichas_costo_referencia_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_costo
    ADD CONSTRAINT fichas_costo_referencia_key UNIQUE (referencia);


--
-- TOC entry 5135 (class 2606 OID 18963)
-- Name: fichas_diseno fichas_diseno_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_diseno
    ADD CONSTRAINT fichas_diseno_pkey PRIMARY KEY (id);


--
-- TOC entry 5137 (class 2606 OID 18965)
-- Name: fichas_diseno fichas_diseno_referencia_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_diseno
    ADD CONSTRAINT fichas_diseno_referencia_key UNIQUE (referencia);


--
-- TOC entry 5145 (class 2606 OID 18967)
-- Name: inventory_movements inventory_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_pkey PRIMARY KEY (id);


--
-- TOC entry 5147 (class 2606 OID 18969)
-- Name: maletas maletas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maletas
    ADD CONSTRAINT maletas_pkey PRIMARY KEY (id);


--
-- TOC entry 5151 (class 2606 OID 18971)
-- Name: maletas_referencias maletas_referencias_maleta_id_referencia_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maletas_referencias
    ADD CONSTRAINT maletas_referencias_maleta_id_referencia_key UNIQUE (maleta_id, referencia);


--
-- TOC entry 5153 (class 2606 OID 18973)
-- Name: maletas_referencias maletas_referencias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maletas_referencias
    ADD CONSTRAINT maletas_referencias_pkey PRIMARY KEY (id);


--
-- TOC entry 5159 (class 2606 OID 18975)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 5168 (class 2606 OID 18977)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 5170 (class 2606 OID 18979)
-- Name: product_references product_references_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_references
    ADD CONSTRAINT product_references_pkey PRIMARY KEY (id);


--
-- TOC entry 5173 (class 2606 OID 18981)
-- Name: production_tracking production_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_tracking
    ADD CONSTRAINT production_tracking_pkey PRIMARY KEY (ref_id, correria_id);


--
-- TOC entry 5176 (class 2606 OID 18983)
-- Name: reception_items reception_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reception_items
    ADD CONSTRAINT reception_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5180 (class 2606 OID 18985)
-- Name: receptions receptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receptions
    ADD CONSTRAINT receptions_pkey PRIMARY KEY (id);


--
-- TOC entry 5182 (class 2606 OID 18987)
-- Name: return_reception_items return_reception_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_reception_items
    ADD CONSTRAINT return_reception_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5184 (class 2606 OID 18989)
-- Name: return_receptions return_receptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_receptions
    ADD CONSTRAINT return_receptions_pkey PRIMARY KEY (id);


--
-- TOC entry 5204 (class 2606 OID 19179)
-- Name: schema_migrations schema_migrations_migration_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_migration_name_key UNIQUE (migration_name);


--
-- TOC entry 5206 (class 2606 OID 19177)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5186 (class 2606 OID 18991)
-- Name: sellers sellers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sellers
    ADD CONSTRAINT sellers_pkey PRIMARY KEY (id);


--
-- TOC entry 5191 (class 2606 OID 18993)
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 5193 (class 2606 OID 18995)
-- Name: user_sessions user_sessions_user_id_socket_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_socket_id_key UNIQUE (user_id, socket_id);


--
-- TOC entry 5196 (class 2606 OID 18997)
-- Name: user_view_preferences user_view_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_view_preferences
    ADD CONSTRAINT user_view_preferences_pkey PRIMARY KEY (id);


--
-- TOC entry 5198 (class 2606 OID 18999)
-- Name: user_view_preferences user_view_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_view_preferences
    ADD CONSTRAINT user_view_preferences_user_id_key UNIQUE (user_id);


--
-- TOC entry 5202 (class 2606 OID 19001)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5093 (class 1259 OID 19002)
-- Name: idx_clients_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_active ON public.clients USING btree (active);


--
-- TOC entry 5094 (class 1259 OID 19003)
-- Name: idx_clients_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_name ON public.clients USING btree (name);


--
-- TOC entry 5095 (class 1259 OID 19004)
-- Name: idx_clients_nit; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_nit ON public.clients USING btree (nit);


--
-- TOC entry 5096 (class 1259 OID 19005)
-- Name: idx_clients_seller_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_seller_id ON public.clients USING btree (seller_id);


--
-- TOC entry 5099 (class 1259 OID 19006)
-- Name: idx_compras_afecta_inventario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_compras_afecta_inventario ON public.compras USING btree (afecta_inventario);


--
-- TOC entry 5100 (class 1259 OID 19007)
-- Name: idx_compras_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_compras_fecha ON public.compras USING btree (fecha);


--
-- TOC entry 5101 (class 1259 OID 19008)
-- Name: idx_compras_insumo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_compras_insumo ON public.compras USING btree (insumo);


--
-- TOC entry 5102 (class 1259 OID 19009)
-- Name: idx_compras_proveedor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_compras_proveedor ON public.compras USING btree (proveedor);


--
-- TOC entry 5111 (class 1259 OID 19010)
-- Name: idx_delivery_dates_confeccionista_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_dates_confeccionista_id ON public.delivery_dates USING btree (confeccionista_id);


--
-- TOC entry 5112 (class 1259 OID 19011)
-- Name: idx_delivery_dates_reference_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_dates_reference_id ON public.delivery_dates USING btree (reference_id);


--
-- TOC entry 5117 (class 1259 OID 19012)
-- Name: idx_dispatch_items_dispatch_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dispatch_items_dispatch_id ON public.dispatch_items USING btree (dispatch_id);


--
-- TOC entry 5118 (class 1259 OID 19013)
-- Name: idx_dispatch_items_reference; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dispatch_items_reference ON public.dispatch_items USING btree (reference);


--
-- TOC entry 5121 (class 1259 OID 19014)
-- Name: idx_dispatches_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dispatches_client_id ON public.dispatches USING btree (client_id);


--
-- TOC entry 5122 (class 1259 OID 19015)
-- Name: idx_dispatches_correria_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dispatches_correria_id ON public.dispatches USING btree (correria_id);


--
-- TOC entry 5123 (class 1259 OID 19016)
-- Name: idx_dispatches_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dispatches_created_at ON public.dispatches USING btree (created_at);


--
-- TOC entry 5128 (class 1259 OID 19017)
-- Name: idx_fichas_cortes_ficha_costo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fichas_cortes_ficha_costo ON public.fichas_cortes USING btree (ficha_costo_id);


--
-- TOC entry 5133 (class 1259 OID 19018)
-- Name: idx_fichas_costo_referencia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fichas_costo_referencia ON public.fichas_costo USING btree (referencia);


--
-- TOC entry 5138 (class 1259 OID 19019)
-- Name: idx_fichas_diseno_referencia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fichas_diseno_referencia ON public.fichas_diseno USING btree (referencia);


--
-- TOC entry 5139 (class 1259 OID 19020)
-- Name: idx_inventory_movements_compra_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_movements_compra_id ON public.inventory_movements USING btree (compra_id);


--
-- TOC entry 5140 (class 1259 OID 19021)
-- Name: idx_inventory_movements_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_movements_created_at ON public.inventory_movements USING btree (created_at);


--
-- TOC entry 5141 (class 1259 OID 19022)
-- Name: idx_inventory_movements_insumo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_movements_insumo ON public.inventory_movements USING btree (lower((insumo)::text));


--
-- TOC entry 5142 (class 1259 OID 19023)
-- Name: idx_inventory_movements_movimiento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_movements_movimiento ON public.inventory_movements USING btree (movimiento);


--
-- TOC entry 5143 (class 1259 OID 19024)
-- Name: idx_inventory_movements_referencia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_movements_referencia ON public.inventory_movements USING btree (lower((referencia_destino)::text));


--
-- TOC entry 5148 (class 1259 OID 19025)
-- Name: idx_maletas_referencias_maleta; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maletas_referencias_maleta ON public.maletas_referencias USING btree (maleta_id);


--
-- TOC entry 5149 (class 1259 OID 19026)
-- Name: idx_maletas_referencias_maleta_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maletas_referencias_maleta_id ON public.maletas_referencias USING btree (maleta_id);


--
-- TOC entry 5154 (class 1259 OID 19027)
-- Name: idx_messages_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at);


--
-- TOC entry 5155 (class 1259 OID 19028)
-- Name: idx_messages_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_read ON public.messages USING btree (read);


--
-- TOC entry 5156 (class 1259 OID 19029)
-- Name: idx_messages_receiver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_receiver ON public.messages USING btree (receiver_id);


--
-- TOC entry 5157 (class 1259 OID 19030)
-- Name: idx_messages_sender_receiver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_sender_receiver ON public.messages USING btree (sender_id, receiver_id);


--
-- TOC entry 5160 (class 1259 OID 19031)
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- TOC entry 5161 (class 1259 OID 19032)
-- Name: idx_orders_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_client_id ON public.orders USING btree (client_id);


--
-- TOC entry 5162 (class 1259 OID 19033)
-- Name: idx_orders_correria_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_correria_id ON public.orders USING btree (correria_id);


--
-- TOC entry 5163 (class 1259 OID 19034)
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at);


--
-- TOC entry 5164 (class 1259 OID 19035)
-- Name: idx_orders_end_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_end_date ON public.orders USING btree (end_date);


--
-- TOC entry 5165 (class 1259 OID 19036)
-- Name: idx_orders_seller_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_seller_id ON public.orders USING btree (seller_id);


--
-- TOC entry 5166 (class 1259 OID 19037)
-- Name: idx_orders_start_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_start_date ON public.orders USING btree (start_date);


--
-- TOC entry 5171 (class 1259 OID 19038)
-- Name: idx_production_tracking_correria_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_production_tracking_correria_id ON public.production_tracking USING btree (correria_id);


--
-- TOC entry 5174 (class 1259 OID 19039)
-- Name: idx_reception_items_reception_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reception_items_reception_id ON public.reception_items USING btree (reception_id);


--
-- TOC entry 5177 (class 1259 OID 19182)
-- Name: idx_receptions_arrival_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receptions_arrival_date ON public.receptions USING btree (arrival_date);


--
-- TOC entry 5178 (class 1259 OID 19040)
-- Name: idx_receptions_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receptions_created_at ON public.receptions USING btree (created_at);


--
-- TOC entry 5187 (class 1259 OID 19041)
-- Name: idx_user_sessions_last_activity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_last_activity ON public.user_sessions USING btree (last_activity);


--
-- TOC entry 5188 (class 1259 OID 19042)
-- Name: idx_user_sessions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_status ON public.user_sessions USING btree (status);


--
-- TOC entry 5189 (class 1259 OID 19043)
-- Name: idx_user_sessions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions USING btree (user_id);


--
-- TOC entry 5194 (class 1259 OID 19044)
-- Name: idx_user_view_preferences_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_view_preferences_user_id ON public.user_view_preferences USING btree (user_id);


--
-- TOC entry 5199 (class 1259 OID 19045)
-- Name: idx_users_login_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_login_code ON public.users USING btree (login_code);


--
-- TOC entry 5200 (class 1259 OID 19046)
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- TOC entry 5215 (class 2620 OID 19047)
-- Name: user_view_preferences trigger_update_user_view_preferences_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_user_view_preferences_timestamp BEFORE UPDATE ON public.user_view_preferences FOR EACH ROW EXECUTE FUNCTION public.update_user_view_preferences_timestamp();


--
-- TOC entry 5208 (class 2606 OID 19048)
-- Name: fichas_cortes fichas_cortes_ficha_costo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_cortes
    ADD CONSTRAINT fichas_cortes_ficha_costo_id_fkey FOREIGN KEY (ficha_costo_id) REFERENCES public.fichas_costo(id) ON DELETE CASCADE;


--
-- TOC entry 5209 (class 2606 OID 19053)
-- Name: fichas_costo fichas_costo_ficha_diseno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_costo
    ADD CONSTRAINT fichas_costo_ficha_diseno_id_fkey FOREIGN KEY (ficha_diseno_id) REFERENCES public.fichas_diseno(id);


--
-- TOC entry 5210 (class 2606 OID 19058)
-- Name: fichas_diseno fichas_diseno_disenadora_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_diseno
    ADD CONSTRAINT fichas_diseno_disenadora_id_fkey FOREIGN KEY (disenadora_id) REFERENCES public.disenadoras(id);


--
-- TOC entry 5207 (class 2606 OID 19063)
-- Name: dispatch_items fk_dispatch_items_dispatch; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispatch_items
    ADD CONSTRAINT fk_dispatch_items_dispatch FOREIGN KEY (dispatch_id) REFERENCES public.dispatches(id);


--
-- TOC entry 5211 (class 2606 OID 19068)
-- Name: inventory_movements inventory_movements_compra_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_compra_id_fkey FOREIGN KEY (compra_id) REFERENCES public.compras(id) ON DELETE SET NULL;


--
-- TOC entry 5212 (class 2606 OID 19073)
-- Name: maletas maletas_correria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maletas
    ADD CONSTRAINT maletas_correria_id_fkey FOREIGN KEY (correria_id) REFERENCES public.correrias(id);


--
-- TOC entry 5213 (class 2606 OID 19078)
-- Name: maletas_referencias maletas_referencias_maleta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maletas_referencias
    ADD CONSTRAINT maletas_referencias_maleta_id_fkey FOREIGN KEY (maleta_id) REFERENCES public.maletas(id) ON DELETE CASCADE;


--
-- TOC entry 5214 (class 2606 OID 19083)
-- Name: user_view_preferences user_view_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_view_preferences
    ADD CONSTRAINT user_view_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5408 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-03-18 11:28:40

--
-- PostgreSQL database dump complete
--

\unrestrict FhYs7gegWPzHaEp4UHGIysYb7cH0eFvPyJBrA9MqWlhp88Ba2EWHn9lD3EAn4G3

