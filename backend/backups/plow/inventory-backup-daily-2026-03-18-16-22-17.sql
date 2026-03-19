--
-- PostgreSQL database dump
--

\restrict MvKVOryrqEJEboCxjgWqnJDdjpkSZvqKVQPiw4mgJ2pbC9DlZLCcLU6Wqu3Q2AR

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

-- Started on 2026-03-18 16:22:17

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

DROP DATABASE IF EXISTS inventory_plow;
--
-- TOC entry 5267 (class 1262 OID 16387)
-- Name: inventory_plow; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE inventory_plow WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Spanish_Colombia.1252';


ALTER DATABASE inventory_plow OWNER TO postgres;

\unrestrict MvKVOryrqEJEboCxjgWqnJDdjpkSZvqKVQPiw4mgJ2pbC9DlZLCcLU6Wqu3Q2AR
\connect inventory_plow
\restrict MvKVOryrqEJEboCxjgWqnJDdjpkSZvqKVQPiw4mgJ2pbC9DlZLCcLU6Wqu3Q2AR

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
-- TOC entry 5268 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 259 (class 1255 OID 16390)
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
-- TOC entry 219 (class 1259 OID 16391)
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
-- TOC entry 220 (class 1259 OID 16400)
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
-- TOC entry 221 (class 1259 OID 16411)
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
-- TOC entry 222 (class 1259 OID 16428)
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
-- TOC entry 223 (class 1259 OID 16440)
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
-- TOC entry 224 (class 1259 OID 16448)
-- Name: correria_novedades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.correria_novedades (
    id integer NOT NULL,
    correria_id character varying(255) NOT NULL,
    contenido text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.correria_novedades OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16457)
-- Name: correria_novedades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.correria_novedades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.correria_novedades_id_seq OWNER TO postgres;

--
-- TOC entry 5270 (class 0 OID 0)
-- Dependencies: 225
-- Name: correria_novedades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.correria_novedades_id_seq OWNED BY public.correria_novedades.id;


--
-- TOC entry 226 (class 1259 OID 16458)
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
-- TOC entry 227 (class 1259 OID 16467)
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
-- TOC entry 228 (class 1259 OID 16479)
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
-- TOC entry 229 (class 1259 OID 16488)
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
-- TOC entry 230 (class 1259 OID 16489)
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
-- TOC entry 231 (class 1259 OID 16500)
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
-- TOC entry 232 (class 1259 OID 16513)
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
-- TOC entry 233 (class 1259 OID 16540)
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
-- TOC entry 234 (class 1259 OID 16574)
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
-- TOC entry 235 (class 1259 OID 16596)
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
-- TOC entry 236 (class 1259 OID 16612)
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
-- TOC entry 237 (class 1259 OID 16622)
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
-- TOC entry 238 (class 1259 OID 16631)
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
-- TOC entry 239 (class 1259 OID 16643)
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
-- TOC entry 5271 (class 0 OID 0)
-- Dependencies: 239
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- TOC entry 240 (class 1259 OID 16644)
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
-- TOC entry 241 (class 1259 OID 16654)
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
-- TOC entry 242 (class 1259 OID 16666)
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
-- TOC entry 243 (class 1259 OID 16676)
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
-- TOC entry 244 (class 1259 OID 16686)
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
-- TOC entry 245 (class 1259 OID 16695)
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
-- TOC entry 5272 (class 0 OID 0)
-- Dependencies: 245
-- Name: reception_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reception_items_id_seq OWNED BY public.reception_items.id;


--
-- TOC entry 246 (class 1259 OID 16696)
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
-- TOC entry 5273 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN receptions.affects_inventory; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receptions.affects_inventory IS 'Controls whether this reception impacts the inventory. Set to FALSE for partial receptions that are part of a larger batch.';


--
-- TOC entry 247 (class 1259 OID 16713)
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
-- TOC entry 248 (class 1259 OID 16722)
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
-- TOC entry 5274 (class 0 OID 0)
-- Dependencies: 248
-- Name: return_reception_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.return_reception_items_id_seq OWNED BY public.return_reception_items.id;


--
-- TOC entry 249 (class 1259 OID 16723)
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
-- TOC entry 250 (class 1259 OID 16733)
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
-- TOC entry 251 (class 1259 OID 16742)
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
-- TOC entry 5275 (class 0 OID 0)
-- Dependencies: 251
-- Name: schema_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.schema_migrations_id_seq OWNED BY public.schema_migrations.id;


--
-- TOC entry 252 (class 1259 OID 16743)
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
-- TOC entry 253 (class 1259 OID 16751)
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
-- TOC entry 254 (class 1259 OID 16762)
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
-- TOC entry 5276 (class 0 OID 0)
-- Dependencies: 254
-- Name: user_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_sessions_id_seq OWNED BY public.user_sessions.id;


--
-- TOC entry 255 (class 1259 OID 16763)
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
-- TOC entry 256 (class 1259 OID 16774)
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
-- TOC entry 5277 (class 0 OID 0)
-- Dependencies: 256
-- Name: user_view_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_view_preferences_id_seq OWNED BY public.user_view_preferences.id;


--
-- TOC entry 257 (class 1259 OID 16775)
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
-- TOC entry 258 (class 1259 OID 16786)
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
-- TOC entry 5278 (class 0 OID 0)
-- Dependencies: 258
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4838 (class 2604 OID 16787)
-- Name: correria_novedades id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.correria_novedades ALTER COLUMN id SET DEFAULT nextval('public.correria_novedades_id_seq'::regclass);


--
-- TOC entry 4918 (class 2604 OID 16788)
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- TOC entry 4923 (class 2604 OID 16789)
-- Name: reception_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reception_items ALTER COLUMN id SET DEFAULT nextval('public.reception_items_id_seq'::regclass);


--
-- TOC entry 4929 (class 2604 OID 16790)
-- Name: return_reception_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_reception_items ALTER COLUMN id SET DEFAULT nextval('public.return_reception_items_id_seq'::regclass);


--
-- TOC entry 4930 (class 2604 OID 16791)
-- Name: schema_migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schema_migrations ALTER COLUMN id SET DEFAULT nextval('public.schema_migrations_id_seq'::regclass);


--
-- TOC entry 4933 (class 2604 OID 16792)
-- Name: user_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions ALTER COLUMN id SET DEFAULT nextval('public.user_sessions_id_seq'::regclass);


--
-- TOC entry 4937 (class 2604 OID 16793)
-- Name: user_view_preferences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_view_preferences ALTER COLUMN id SET DEFAULT nextval('public.user_view_preferences_id_seq'::regclass);


--
-- TOC entry 4941 (class 2604 OID 16794)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5222 (class 0 OID 16391)
-- Dependencies: 219
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_log (id, entity_type, entity_id, user_id, action, old_values, new_values, changes, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- TOC entry 5223 (class 0 OID 16400)
-- Dependencies: 220
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (id, name, nit, address, city, seller, created_at, seller_id, updated_at, active) FROM stdin;
1	INVERSIONES SURTIMODA SAS	900582506	CALLE 14 #17-70 BARRIO CENTRO	ACACIAS	\N	2026-02-14 06:32:24	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
10	SALAS ASOCIADOS S.A.S	900392405	CL 49 9 44 SEC COMERCIAL	BARRANCABERMEJA	\N	2026-02-14 06:27:55	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
100	TIENDAS MICROEMPRESARIALES LANFER S.A.S.	900118155	CL 9 6 71 BRR CENTRO	CUCUTA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
101	RAYOTEX S.A.S	1800144409	CLL 12 5 49	CUCUTA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
102	INVERSIONES SACHA S.A.S	1900186125	CARRERA 6 N° 8-96	CUNDINAMARCA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
103	RAMIREZ BOTERO ADOLFO JESUS	1066	CRA 15 N° 8 -43 CURUMANI	CURUMANI	\N	2026-02-14 06:27:58	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
104	GALLEGO JOHN JAMIME	5225	AV. SIMON BOLIVAR #38-130  LOCAL 114	DOSQUEBRADAS	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
105	NAVANA MEGATODO S.A.S	2901169855	CRA 17 # 15-22	DUITAMA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
106	INVERSIONES 8A S.A.S N°4	4900137023	CRA 17 # 16 49/59 DUITAMA	DUITAMA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
107	ARISTIZABAL ARISTIBAL DUBIAN DE JESUS	70829130	CL 25 48 71 LC 2 BRR CENTRO	EL CARMEN DE BOLIVAR	\N	2026-02-14 06:27:58	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
108	JIMENEZ MAYORGA MARIA ALEJANDRA	1129574347	CR 50 25 55	EL CARMEN DE BOLIVAR	\N	2026-02-14 06:27:58	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
109	RESTREPO JARAMILLO JULIAN ANDRES	179726416	CRA 12 N° 7 -11 BRR CENTRO	EL CERRITO	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
11	SALAS ASOCIADOS S.A.S	1900392405	CL 49 9 44 SEC COMERCIAL PTO BOYACA	BARRANCABERMEJA	\N	2026-02-14 06:27:55	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
110	SANCHEZ TORRES LILIANA	1117485254	CR 4 # 2 - 29	EL PAUJIL	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
111	REPRESENTACIONES INTERMODA S.A.S	901121571	CLLE 10 # 4-102 ESPINAL TOLIMA	ESPINAL	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
112	INTIMOS ALMA S.A.S N°22	2283003804	CL 7 N° 3 - 65	FACATATIVA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
113	ROJAS FARUK	981	C.C. OROCENTOR LOCAL 1-68	FLORENCIA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
114	RAMIREZ CARDENAS FREDY ALBERTO	70698350	CL 16 11 41 BRR CENTRO	FLORENCIA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
115	RAMIREZ CARDENAS EVER GONZALO	1045019291	CL 16 N° 11-58 BRR CENTRO	FLORENCIA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
116	PINILLA LESMES DIANA CAROLina Pulgarin	1006512762	CL 22 2 A BIS 06 BRR ATALAY	FLORENCIA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
117	INVERSIONES INTERMODA S.A.S	901068621	CLLE 16 #11-33 FLORENCIA	FLORENCIA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
118	ORDOÑEZ ALVAREZ ESTEBAN JAVIER	9336	CLLE 17 # 9-14	FLORENCIA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
119	GONZALES MUÑOZ EVANGELina Pulgarin	40784925	CR 11 # 13-60 BRR CENTRO	FLORENCIA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
12	EL GIGANTE DE LA MODA S.A.S	900646287	CL 49 9 62	BARRANCABERMEJA	\N	2026-02-14 06:27:55	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
120	RAMIREZ VALENCIA CESAR	17915	CRA 12 # 15-17	FLORENCIA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
121	VALENCIA RAMIREZ OMAR	17137	CRA 12 # 15-31	FLORENCIA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
122	RESTREPO JARAMILLO JULIAN ANDRES	379726416	CLLE 9 # 17-24	FLORIDA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
123	COMERCIALIZADORA MGV SAS	1901413624	CL 13 18 33	FONSECA	\N	2026-02-14 06:27:58	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
124	PEDROZO LUZ MERY	792	CRA 116 A N° 15 C -70 APTO 307 TORRE 1	FONTIBON	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
125	DISTRIBUIDORA MUNDO FASHION	900324182	CALLE 4 # 8A -49	FUNDACION	\N	2026-02-14 06:27:58	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
126	CARLOS MARIO SALAZAR ECHEVERRI	70694755	CALLE 6 NRO. 8A-18	FUNDACION	\N	2026-02-14 06:27:58	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
127	COMERCIALIZADORA GIRALDO DEL CARIBE	900454797	CL 4 8A 20	FUNDACION	\N	2026-02-14 06:27:58	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
128	ZULUAGA SALAZAR LEONEL ALBERTO	188210403	CR 8 N° 5-26	FUNDACION	\N	2026-02-14 06:27:58	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
129	DUQUE HOYOS JUAN GONZALO	2104501630	CL 8 N 7 76	FUSAGASUGA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
13	INVERSIONES SOLOMODA BARRANCA S.A.S	900351574	CL 49 9 78	BARRANCABERMEJA	\N	2026-02-14 06:27:55	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
130	INVERSIONES 8A S.A.S N°20	2090013702	CLL 8 # 8-71 EXT 1120	FUSAGASUGA	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
131	DUQUE HOYOS JUAN GONZALO	1104501630	CL 7 10 87	GARZON	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
132	INVERSIONES ESTRENATODO S.A.S	900275560	CARRERA 10 #14-47	GIRARDOT	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
133	PANTYJEANS GIRARDOT CIA LTDA	900284812	CR 10 13 52	GIRARDOT	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
134	EL UNIVERSO DE LA MODA ACTUAL S.A.S	900468771	CR 10 14 15	GIRARDOT	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
135	ALMACENES GANE LIMITADA	1890203597	CR 26  37 104	GIRON	\N	2026-02-14 06:27:58	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
136	RUSSI CACERES NESTOR LUIS	91296133	CR 26 # 40 - 20 BRR EL POBLADO	GIRON	\N	2026-02-14 06:27:58	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
137	INTIMOS ALMA S.A.S N° 26	2683003804	CL 17 N° 14 - 41 EXT: 1120	GRANADA	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
138	DISTRIBUIDORA DE MODA GRANADA	901619815	CR 15 17 44 BRR CENTRO	GRANADA	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
139	GUTIERREZ FANDIÑO FANNY	52456059	CR 7 3 68 BRR CENTRO	GUACARI	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
14	PALACIO MARIA ALIX	7076	CRA 47 B # 37 A 08	BARRANCABERMEJA	\N	2026-02-14 06:27:55	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
140	GUERRA EDILSON DARIO	4536	CR 7 # 8-07	HORMIGA	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
141	RAMIREZ BOTERO ADOLFO JESUS	70691066	CL 17 2 92 96 98 P5 BRR CENTRO	IBAGUE	\N	2026-02-14 06:27:59	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
142	SURTIDORA EL UNIVERSO DE LA MODA	900023407	CR 3 13 A 29	IBAGUE	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
143	SURTIDORA PANTY JEAN'S DE COLOMBIA SAS	900744578	CR 3 15 90 94 BRR CENTRO	IBAGUE	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
144	INNOVACIONES WIN S.A.S	900835285	CRA 51 # 50- 15 ITAGUI	ITAGUI	\N	2026-02-14 06:27:59	mlia6gb0u2bhftxam	2026-02-19 01:52:18.269	t
145	BOHORQUEZ GALVIS LUTH DARE	49764593	CLL 11 8 78	JAMUNDI	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
146	CARO CARO ANGELA MARIA	29567740	CR 10 11 53	JAMUNDI	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
147	COMPAÑIA REPUBLIC S.A.S EN LIQUIDACION	900385825	CARRERA 4 #14-49 CENTRO	LA DORADA	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
148	ALTA MODA LA DORADA	7507	CLLE 5 # 5-35	LA DORADA	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
149	SALAZAR ZULUAGA MAURICIO ANTONIO	1027	CRA 4 #14-49	LA DORADA	\N	2026-02-14 06:27:59	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
15	HERRERA JOHN FREDY	4065	CALLE 30 #42-04 MEGAMODA	BARRANQUILLA	\N	2026-02-14 06:27:55	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
150	ZULUAGA EDWIN DAVID	6942	CRA 7 # 12-38 MERCADO VIEJO	LA GUAJIRA	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
151	DUQUE HOYOS JUAN GONZALO	1045016303	CL 6 N 3 56	LA PLATA	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
152	GOMEZ HERNANDEZ JUAN DAVID	1010153349	CARRERA 7 # 11-38	LA TEBAIDA	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
153	ARBOLEDA VASQUEZ JULIAN ANDRES	16552144	CARRERA 15 #15-42	LA UNION	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
154	BRABO DUARTE LUZ DARIS	63471107	CL 11 9-15 BRR CENTRO	LEBRIJA	\N	2026-02-14 06:27:59	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
155	CARDOZO AMAYA YOLANDA	65498039	CR 6 # 8 26 BRR CENTRO	LERIDA	\N	2026-02-14 06:27:59	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
156	ALIANZA MUÑOZ GOMEZ SAS	901079469	CR 20 2 A 22	LORICA	\N	2026-02-14 06:27:59	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
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
184	GRUPO COMERCIAL INTERMODA S.A.S	4900442422	CRA 5 N° 8-25	NEIVA	\N	2026-02-14 06:28:00	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
185	TIENDAS MICROEMPRESARIALES LANFER S.A.S	1900118155	CR 13 9 52 SECTOR DEL DULCE NOMBRE	OCAÑA	\N	2026-02-14 06:28:00	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
186	INVERSIONES 8A S.A.S N°10	1090013702	CL 25 N° 22 - 18 / LC 1	PAIPA	\N	2026-02-14 06:28:00	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
187	GUERRERO MUÑOZ SANDRA PATRICIA	66776819	CL 33 19 85	PALMIRA	\N	2026-02-14 06:28:00	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
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
200	G & G RETAIL S.A.S	3901234880	CLLE 20 N° 7-41	PLANETA RICA	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
201	RAMIREZ LLERENA LUZ ADRIANA	700082020	CR 15 11-65	PLATO	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
202	ALIANZA HERMANOS JGV	16326	CR 15 12 69	PLATO	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
203	MORCILLO GONZALEZ LEIDY	4000	CALLE 6 #18-48	POPAYAN	\N	2026-02-14 06:28:01	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
204	ARCILA BEATRIZ HELENA	4957	CARRERA 7 #6-26	POPAYAN	\N	2026-02-14 06:28:01	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
205	ZULUAGA ORLANDO	1694	CLLE 6 # 6-43	POPAYAN	\N	2026-02-14 06:28:01	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
206	COMPAÑIA REPUBLIC S.A.S.	1900385825	CL 54 3 00 ESQ	PUERTO BERRIO	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
207	INVERSIONES SOLOMODA BARRANCA S.A.S	2900351574	CR 3 N° 9-18	PUERTO BERRIO	\N	2026-02-14 06:28:01	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
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
218	INVERSIONES 8A S.A.S N°16	1690013702	CR 9 N° 11 - 36	SAN GIL	\N	2026-02-14 06:28:01	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
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
232	PANAMA PLAZA S.A.S	901212878	CALLE 22 N° 21-22	SINCELEJO	\N	2026-02-14 06:28:02	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
233	COMERCIALIZADORA MAGOTEX 1	901239802	CALLE 23 # 20 - 64	SINCELEJO	\N	2026-02-14 06:28:02	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
234	ALIANZA MABLE SAS	1900638635	CL 28 25 B 97 LC 2 318	SINCELEJO	\N	2026-02-14 06:28:02	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
235	INVERSIONES GAFE S.A.S	2900463519	CALLE 36 SUR # 43-31	ENVIGADO	\N	2026-02-14 06:28:02	mlia6gb0u2bhftxam	2026-02-19 01:52:18.269	t
236	INVERSIONES GOBOTEX S A S	1830125982	CALLE 13 Nº 5-63	SOACHA	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
237	NAVANA MEGATODO SOACHA S.A.S	1901169855	CRA 7 # 32-35 LOCAL 207	SOACHA	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
238	ACUÑA MARIA CRISTINA	30205366	CL 10 14 39 BRR CENTRO	SOCORRO	\N	2026-02-14 06:28:02	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
239	VARIMODA SAS	901729900	CR 11 14 91	SOGAMOSO	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
24	COMERCIALIZADORA MGV SAS	901413624	CR 13 104 45	BARRANQUILLA	\N	2026-02-14 06:27:56	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
240	INVERSIONES 8A S.A.S N°7	7900137023	CR 11 N° 13 - 29 SOGAMOSO	SOGAMOSO	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
241	ALIANZA VC S.A.S	900225992	CALLE 20 N° 19-17	SOLEDAD	\N	2026-02-14 06:28:02	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
242	INVERSIONES JBARA S.A.S	901462378	CL 63 14 50	SOLEDAD	\N	2026-02-14 06:28:02	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
243	DUQUE HOYOS JUAN GONZALO	3104501630	CR 19 19 41	SOLEDAD	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
244	ZULAGA GIRALDO HECTOR MAURICIO	70690823	CL 27 24 59 BR CENTRO	TULUA	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
245	DECADA 10 EN TODO S.A.S	900519038	CR 24 27 30 BRR EL CENTRO	TULUA	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
246	QUINTERO ADRIAN ALBERTO	3257	CLL DEL COMERCIO EL PACIFICO DEL BARATON	TUMACO	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
247	NOREÑA MAZUERA ALEXANDER	100	CALLE MERCEDES ALM LISTO MEDELLIN	TUMACO	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
248	INVERSIONES INTERMODA S.A.S	1901068621	CLLE MOSQUERA DIAG A TELECOM	TUMACO	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
249	VARGAS MONTIEL JACKSON FABIAN	9052	CRA 9 # 8 -99	TUMACO	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
25	ZULUAGA GOMEZ EDGAR ALONSO	8778704	CR 41 32 81	BARRANQUILLA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
250	INVERSIONES 8A S.A.S N°19	1990013702	AV UNIVERSITARIA N° 51 21 LC 207 CC VIVA TUNJA	TUNJA	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
251	INVERSIONES 8A S.A.S N°8	8900137023	CL 19 N° 10 - 46	TUNJA	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
252	INVERSIONES 8A S.A.S N°15	1590013702	CR 7 N° 9 - 48	UBATE	\N	2026-02-14 06:28:02	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
253	SAJIN AREVALO SAMIR	77038476	CL 16 B 8 45	VALLEDUPAR	\N	2026-02-14 06:28:02	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
254	KHALED BASSAN SAJIN MHANNA	1065629467	CL 16B # 7-39 - Centro	VALLEDUPAR	\N	2026-02-14 06:28:02	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
255	ALIANZA SURTIDORA SAS	901084883	CR 7 16 A 133	VALLEDUPAR	\N	2026-02-14 06:28:03	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
256	DISTRIBUIDORA MUNDO FASHION	3900324182	DIG 10 A N° 6 N 15 CC GUATAPURI LC 215	VALLEDUPAR	\N	2026-02-14 06:28:03	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
257	CIELO MODA S.A.S - AMV LLANO 2	901784502	CALLE 39 #30-40	VILLAVICENCIO	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
258	BARAKI S.A.S	901712681	CALLE 39 N° 30 A 38	VILLAVICENCIO	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
259	AMV LLANO S.A.S	900469068	CARRERA 30 #36-40	VILLAVICENCIO	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
26	ALIANZA VC S.A.S	1900225992	CR 41 37 23	BARRANQUILLA	\N	2026-02-14 06:27:56	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
260	AMV LLANO S.A.S	2900469068	CL 39 30 A 38 BRR CENTRO	VILLAVICENCIO	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
261	MONTOYA VARGAS CENERY	52654284	CRA 5 # 5 23	VILLETA	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
262	MARTINEZ ARANGO DIANA ELISABETH	32564630	CR 19 # 20 - 74	YARUMAL	\N	2026-02-14 06:28:03	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
263	JIMENEZ GOMEZ CARLOS ALCIDES	70694674	CALLE 9 # 19-14	YOPAL	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
264	COL MODA YOPAL SAS	901697458	CL 10 19 52	YOPAL	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
265	RAMIREZ ZULUAGA BLANCA AMELIA	43404158	CR 20 14 31	YOPAL	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
266	INVERSIONES JIMENEZ GOMEZ S.A.S	900960772	CRA 20 N° 14-39 BELLO HORIZONTE	YOPAL	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
267	EPICA DE MODAD SAS	901170874	CL 34 43 109 OF 312	BARRANQUILLA	\N	2026-02-14 06:28:03	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
268	GUTIERREZ FANDIÑO FANNY	152456059	CRA 4 # 6 -03 CENTRA	YUMBO	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
269	VASQUEZ MARIA ORFANIA	29809163	CL 9 11 08	ZARZAL	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
27	ALMACEN Y DISTRIBUIDORA GONZALEZ S.A.S	800160395	CR 42 32 28	BARRANQUILLA	\N	2026-02-14 06:27:56	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
270	AL MUSTAKIM	901812038	CLL 9 # 20 - 59	SAN JOSE DEL GUAVIARE	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
271	JHOJAINNE SULVARAN	1006745382	CR 12 # 13 - 22	MAICAO	\N	2026-02-14 06:28:03	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
272	DISTRIBUIDORA VISTEMODA LTDA	800222200	CL 52 N° 15 A 05	CALI	\N	2026-02-14 06:28:03	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
273	CAÑAVERAL NUÑEZ YOLANDA	66677499	CL 9 6 82	ROLDANILLO	\N	2026-02-14 06:28:04	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
274	ARBOLEDA NIETO JOSE ALEJANDRO	14978082	CR 5 9 81 BRR GUADALUPE	CARTAGO	\N	2026-02-14 06:28:04	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
275	GV INFINITE SAS	901523339	CL 12 7 30 LOCAL 1	RIOHACHA	\N	2026-02-14 06:28:04	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
276	VIDAL MARIN INGRIT MALLERLY	3207003070	CRA 25 # 37 - 29	CALARCA	\N	2026-02-14 06:28:04	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
277	SINDY LISADY SAAVEDRA	1045016946	CRA 13 # 8-51	OCAÑA	\N	2026-02-14 06:28:04	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
278	BAYONA BAYONA JORGE LUIS	1094574518	CR 5 # 13 - 87 BRR CENTRO	ABREGO	\N	2026-02-14 06:28:04	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
279	G & G RETAIL S.A.S	6901234880	CRA 15 # 8 - 64 LOC 1	CIENAGA DE ORO	\N	2026-02-14 06:28:04	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
28	ALIANZA MUÑOZ GOMEZ SAS	1901079469	CRA 44 N° 34-31 PISO 6 EDFC COLSEGUROS	BARRANQUILLA	\N	2026-02-14 06:27:56	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
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
295	GALVIS RODOLFO	4870	CRA 3A Nº 17-61	CAUCASIA	\N	2026-02-14 06:28:04	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
296	PEREZ ACOSTA CANDY SUSANA	32930941	CR 8 10 26	SANTA ANA	\N	2026-02-14 06:28:04	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
297	RUEDA MIRANDA YERSON OSWALDO	91078808	CR 11 # 12 - 75 P 2	SAN GIL	\N	2026-02-14 06:28:04	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
298	INVERSIONES ASH S.A.S.	900469154	CRA 4 # 24 - 70	QUIBDO	\N	2026-02-14 06:28:04	mlia6gb0u2bhftxam	2026-02-19 01:52:18.269	t
299	LARGACHA CAMPO YUBERNEI	9737771	CR 8 # 4 - 33	CHAPARRAL	\N	2026-02-14 06:28:05	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
3	RAMIREZ BOTERO OSCAR MANUEL	70690518	CL 5  # 13-52	AGUACHICA	\N	2026-02-14 06:27:55	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
30	INVERSIONES GAFE S.A.S	900463519	CARRERA 49 #49-38	BELLO	\N	2026-02-14 06:27:56	mlia6gb0u2bhftxam	2026-02-19 01:52:18.269	t
300	MEDIA NARANJA	-	TODOS LOS ALMACENES	MEDELLIN	\N	2026-02-14 06:28:05	mlia6gb0u2bhftxam	2026-02-19 01:52:18.269	t
301	HERNANDEZ MONTES ANA MILENA	50929792	CL 20 CR 7 ESQU	PLANETA RICA	\N	2026-02-14 06:28:05	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
302	RESTREPO LAURA VALENTINA	1192791730	CL 4 # 10 - 59 CRR EL CENTRO	SANTANDER DE QUILICHAO	\N	2026-02-14 06:28:05	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
303	LONDOÑO MARIA DEL CARMEN	25109415	CR 15 # 16 43 BRR CENTRO	LA UNION	\N	2026-02-14 06:28:05	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
304	YONELBIS ZAMBRANO SUAREZ	6057	CRA 12 # 12 - 27	MAICAO	\N	2026-02-14 06:28:05	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
305	G&G RETAIL S.A.S	7901234880	CLL 15 A # 14 A 41	CERETE	\N	2026-02-14 06:28:05	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
306	VICTOR ANDRES AROCA	1140896249	CL 34 43 129 BG 434 CC COLOMBIA	BARRANQUILLA	\N	2026-02-14 06:28:05	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
307	SANTIAGO JARAMILLO JARAMILLO	2700159299	CRA 8 # 9 - 72 LOCAL 5	CHINCHINA	\N	2026-02-14 06:28:05	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
308	EL SURTIDOR BG SAS NUEVO	2490	AV 5 # 5 - 63 PISO 4	CUCUTA	\N	2026-02-14 06:28:05	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
309	PANTYJEANS GIRARDOT SAS 2	1900284812	CR 10 # 14 - 47 BRR CENTRO	GIRARDOT	\N	2026-02-14 06:28:05	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
31	ALMA BELLA S.A.S	900352713	CL 129 N° 47 - 43 PRADO VERANIEGO	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
32	RESTREPO JARAMILLO JULIAN ANDRES	79726416	CLL 129 B # 91-64 SUBA	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
33	INTIMOS ALMA S.A.S N°11	1183003804	CR 13 N° 59 - 41	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
34	INTIMOS ALMA S.A.S N° 14	1483003804	CR 71D N° 8 - 70 SUR	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
35	INTIMOS ALMA S.A.S N°24	2483003844	CR 80 N° 51 - 03 SUR EXT: 1102	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
36	INTIMOS ALMA S.A.S N° 3	3830038044	CR 88C N° 58D 32 SUR	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
37	GUTIERREZ FANDIÑO FANNY	252456059	CRA 14 # 75 A -51 SUR B/SANTA LIBRADA	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
38	INVERSIONES 8A S.A.S N°6	6900137023	CRA 6 N° 23-40 SUR 20 DE JULIO	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
39	INTIMOS ALMA S.A.S N°2	5830038444	CRA 80 # 51-25 SUR CASA BLANCA	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
4	P & S INVERSIONES ASOCIADOS S.A.S	901195775	CL 5 16 36	AGUACHICA	\N	2026-02-14 06:27:55	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
40	INVERSIONES 8A S.A.S N°17	1790013702	DIAG. 71 B # 96-60 EXT 1117 ALAMOS NORTE	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
41	INTIMOS ALMA S.A.S N°9	9830038044	TRANS.78L #68B -09/15 SUR BOSA PIAMONTE	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
42	INTIMOS ALMA S.A.S N°5	5830038044	TV 4 ESTE N° 37A - 28 SUR	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
43	INTIMOS ALMA S.A.S N°1	1830038444	TV 78 L N° 69 - 23 SUR	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
44	HEGA G B S.A.S	830091761	CALLE 37 SUR # 78 H 21	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
45	INVERSIONES GOBOTEX S A S	2830125982	CALLE 38 SUR Nº 86 A-09	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
46	HEGA G B S.A.S	1830091761	CALLE 42 A #93 C 17 SUR	BOGOTA	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
47	INVERSIONES SACHA S.A.S	2900186125	"CALLE 57 D SUR Nº 78H - 14	LOCAL 227"	\N	2026-02-14 06:27:56	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
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
66	INVERSIONES 8A S.A.S N°21	2190013702	CRA 6 # 3 -45	CAJICA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
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
84	ALIANZA MUÑOZ GOMEZ SAS	2901079469	CRA 3A Nº 17-61	CAUCASIA	\N	2026-02-14 06:27:57	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
85	ELMELAO S.A.S	900663011	CR 11 N° 8 - 82	CHIA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
86	INVERSIONES 8A S.A.S N°13	1390013702	CR 10 N° 17 - 25	CHINQUINQUIRA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
87	DISTRIBUIDORA MUNDO FASHION	1900324182	CALLE 17 # 11-57	CIENAGA	\N	2026-02-14 06:27:57	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
88	SALAZAR ECHEVERRI LUIS ALBERTO	70693888	CL 17 13 29 BRR CENTRO	CIENAGA	\N	2026-02-14 06:27:57	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
89	JIMENEZ BERMUDEZ ALBA DE JESUS	3095	CR 57 A 47 56	CIUDAD BOLIVAR	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
9	INVERSIONES 8A S.A.S N°27	2790013702	CR 9 # 10-68 LC2	BARBOSA	\N	2026-02-14 06:27:55	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
90	G & G RETAIL S.A.S	4901234880	CL 31 25 11 LC 2	COROZAL	\N	2026-02-14 06:27:57	mlia6sxbdfmbvlex0	2026-02-19 01:52:18.269	t
91	AMPER GROUP S.A.S.	901341754	AV 8 8 55 LC 21 22 CC SAN ANTONIO BRR CENTRO	CUCUTA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
92	MATIZ VASQUEZ CARLOS JULIO	13505840	AVENIDA 5 N° 7- 04	CUCUTA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
93	EL SURTIDOR BG SAS #2	1901342490	CALLE 8 # 4- 35	CUCUTA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
94	EL SURTIDOR BG SAS	901342490	CALLE 8 # 5- 47	CUCUTA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
95	RAYOTEX S.A.S	2800144409	CL 10 NRO. 0-09	CUCUTA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
97	HENRIQUEZ LOPERA MARY LUZ	60367610	CL 8 4 98 BRR CENTRO	CUCUTA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
98	TIENDAS BUV SAS	901400615	CL 8 5 87 BRR EL CENTRO	CUCUTA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
99	RAYOTEX S.A.S	800144409	CL 9 4 90 BRR CENTRO	CUCUTA	\N	2026-02-14 06:27:57	mlia7rpjfmtwhg66q	2026-02-19 01:52:18.269	t
test-restore-1	Cliente Restore	NIT-RESTORE	Dirección	Ciudad	\N	\N	seller	\N	t
310	ALIANZA VC SAS	900225992	CRA 3A # 17 - 61	CAUCASIA	\N	\N	mlia6sxbdfmbvlex0	\N	t
311	ANTEXTIL S.A.S.	901170873	AV PEDRO HEREDIA 26 - 75	CARTAGENA	\N	\N	mlia6sxbdfmbvlex0	\N	t
\.


--
-- TOC entry 5224 (class 0 OID 16411)
-- Dependencies: 221
-- Data for Name: compras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.compras (id, fecha, referencia, unidades, insumo, cantidad_insumo, precio_unidad, cantidad_total, total, proveedor, fecha_pedido, observacion, factura, precio_real_insumo_und, afecta_inventario, created_at, updated_at) FROM stdin;
mmapjhr4xh6p24ut0	2026-02-24	12920	225	BOTON	3.00	89.00	675.00	60075.00	SOTEXCO	\N	\N	RM S4860	ok	f	2026-03-03 09:33:03.137023	2026-03-03 09:35:25.822165
mmapjhr5vjchtba66	2026-02-24	12935	60	BOTON	2.00	89.00	120.00	10680.00	SOTEXCO	\N	\N	RM S4860	ok	f	2026-03-03 09:33:03.137806	2026-03-03 09:35:31.951658
mmapjhr6kdameh4f1	2026-02-24	12869	120	HERRAJE	1.00	2800.00	120.00	336000.00	SOTEXCO	\N	\N	RM S4862	ok	f	2026-03-03 09:33:03.138573	2026-03-03 09:35:36.759897
mmapjhr7yxp8q2yt4	2026-02-24	13013	195	ANGELITA	1.85	1300.00	360.75	468975.00	INSUMOS CORSETERO	\N	\N	RM	ok	f	2026-03-03 09:33:03.139343	2026-03-03 09:35:40.97992
mmapjhr76wpj5g0l1	2026-02-24	13010	120	FRNJA DE 17 CMT	0.85	2500.00	102.00	255000.00	BOMBAY - INSUMOS CORSETEROS	\N	2395	X169299	diferencia	f	2026-03-03 09:33:03.140155	2026-03-03 09:35:45.82223
mmapjhr8a4s117b3c	2026-02-24	13012	120	PUNTERAS	2.00	343.00	240.00	82320.00	BOMBAY	\N	\N	X1169299	ok	f	2026-03-03 09:33:03.140905	2026-03-03 09:35:49.756726
mmapjhr99ada03dv3	2026-02-24	13011	120	PUNTILLA	0.25	1421.00	30.00	42630.00	BOMBAY	\N	\N	X169299	ok	f	2026-03-03 09:33:03.141682	2026-03-03 09:35:53.347147
mmapjhratar0bud4x	2026-02-24	13011	120	BOLILLO  FLOR	0.24	3900.00	28.80	112320.00	INSUTEX	\N	\N	FVI20436	ok	f	2026-03-03 09:33:03.142446	2026-03-03 09:35:56.910397
mmapjhrbecdas9tgy	2026-02-24	12962	117	HERRAJE	1.00	2285.00	117.00	267345.00	BOMBAY	\N	2380	X169299	diferencia	f	2026-03-03 09:33:03.143764	2026-03-03 09:36:01.830124
mmapjhqzvpe6x1ehe	2026-02-17	12875	60	HER PASADOR	1.00	2200.00	60.00	132000.00	THE FASHION	\N	\N	FE25844	ok	f	2026-03-03 09:33:03.131642	2026-03-03 09:36:31.514918
mmapjhr0yt5sqyztn	2026-02-17	13002	120	MAXI BOTONES	1.00	1330.00	120.00	159600.00	THE FASHION	\N	\N	FE25844	ok	f	2026-03-03 09:33:03.132583	2026-03-03 09:36:36.223396
mmapjhr221ug4gwwk	2026-02-17	13002	120	MAXI BOTONES	1.00	1084.00	120.00	130080.00	THE FASHION	\N	\N	FE25844	ok	f	2026-03-03 09:33:03.134366	2026-03-03 09:36:40.590423
mmapjhr12gv63q5az	2026-02-17	13002	120	MAXI BOTONES	1.00	1330.00	120.00	159600.00	THE FASHION	\N	\N	FE25844	ok	f	2026-03-03 09:33:03.133468	2026-03-03 09:36:45.103692
mmapjhr47tbgla71z	2026-02-17	12935	60	ABROCHADURAS	1.00	400.00	60.00	24000.00	BOMBAY	\N	\N	FR592062	ok	f	2026-03-03 09:33:03.136228	2026-03-03 09:36:58.832103
mmapjhqsaeb5fx9b9	2026-02-11	12898	60	FRANJA DE 4CMT	0.76	900.00	45.60	41040.00	GALERIAS DE AYACUCHO	\N	\N	RM	ok	f	2026-03-03 09:33:03.125148	2026-03-03 09:37:05.434091
mmapjhqrk6xkuz5aa	2026-02-11	12921	60	FRANJA DE 4CMT	0.60	700.00	36.00	25200.00	GALERIAS DE AYACUCHO	\N	\N	RM	ok	f	2026-03-03 09:33:03.124114	2026-03-03 09:37:11.386712
mmapjhqr9c4n6h31j	2026-02-11	12923	60	FRANJA SOLEDAD	0.80	2000.00	48.00	96000.00	INSUMOS CORSETERO	\N	\N	RM	ok	f	2026-03-03 09:33:03.123237	2026-03-03 09:37:16.047415
mmapjhqtg0sj22aze	2026-02-11	12922	60	MOÑOS	1.00	250.00	60.00	15000.00	LA CINTERIA	\N	\N	RM	ok	f	2026-03-03 09:33:03.126129	2026-03-03 09:37:23.456773
mmapjhqvdibjqk1z9	2026-02-11	12934	60	FRANJA SOLEDAD	0.64	2000.00	38.40	76800.00	INSUMOS CORSETERO	\N	\N	RM	ok	f	2026-03-03 09:33:03.127702	2026-03-03 09:37:29.827744
mmapjhqwqqw9tw9zz	2026-02-11	12893	150	FRANJA SAUDY	0.73	2500.00	109.50	273750.00	INSUMOS CORSETERO	\N	\N	RM	ok	f	2026-03-03 09:33:03.128812	2026-03-03 09:37:34.687723
mmapjhqxoa0ogu4fe	2026-02-11	12920	225	FRANJA ANGELITA	0.60	1200.00	135.00	162000.00	INSUMOS CORSETERO	\N	\N	RM	ok	f	2026-03-03 09:33:03.129728	2026-03-03 09:37:39.451506
mmapjhqpncu8h5wew	2026-02-04	12951	90	FARNJA ANGELITA	0.80	1200.00	72.00	86400.00	INSUMOS CORSETERO	2026-02-04	\N	RM	ok	f	2026-03-03 09:33:03.121371	2026-03-03 09:37:45.502131
mmapjhqqn66cxuegc	2025-02-11	12922	60	FRANJA ANGELITA	1.10	1200.00	66.00	79200.00	INSUMOS CORSETERO	\N	\N	RM	ok	f	2026-03-03 09:33:03.122299	2026-03-03 09:37:51.275289
mmapjhqlhegd9dnjl	2026-02-04	12959	114	FRANJA	0.08	1750.00	9.12	15960.00	INSUMOS CORSETERO	2026-02-04	\N	RM	ok	f	2026-03-03 09:33:03.1182	2026-03-03 09:37:56.640734
mmapjhqncehaqqeak	2026-02-04	12960	114	FRANJA	0.48	1750.00	54.72	95760.00	INSUMOS CORSETERO	2026-02-04	\N	RM	ok	f	2026-03-03 09:33:03.11942	2026-03-03 09:38:01.925503
mmapjhqanurctocan	2026-01-26	12877	150	BOLILLO	0.36	1440.00	54.00	77760.00	SOTEXCO	2026-01-26	\N	S4688	ok	f	2026-03-03 09:33:03.107964	2026-03-03 09:38:07.407581
mmapjhqo0bx08uck6	2026-02-04	12943	252	FRANJA	0.80	1750.00	201.60	352800.00	INSUMOS CORSETERO	2026-02-04	\N	RM	ok	f	2026-03-03 09:33:03.120387	2026-03-03 09:38:12.742746
mmapjhpz5a4pty244	2026-01-26	12924	90	GUIPURE	0.36	4340.00	32.40	140616.00	BOMBAY	2026-01-26	\N	X3-247396	ok	f	2026-03-03 09:33:03.09615	2026-03-03 09:38:18.335211
mmapjhqyr9c07hnyw	2025-02-13	12950	90	CIERRES SEPARABLES	1.00	1500.00	90.00	135000.00	QUERUBIN	\N	\N	RM	ok	f	2026-03-03 09:33:03.130754	2026-03-03 09:38:24.523856
mmapjhr3vfzfej7hg	2026-02-17	12970	138	GUIPURE	1.68	2500.00	231.84	579600.00	BOMBAY	\N	2422	FR592062	ok	f	2026-03-03 09:33:03.1353	2026-03-03 16:32:33.224617
\.


--
-- TOC entry 5225 (class 0 OID 16428)
-- Dependencies: 222
-- Data for Name: confeccionistas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.confeccionistas (id, name, address, city, phone, score, active, created_at) FROM stdin;
32351275	Eusse Mesa Marielena	CR 61 72 A 36	Bello	3022624809	A	1	2026-02-14 03:04:08
43923482	Gonzalez Quintero Ruby Liliana	CL 21 # 71 - 50 APT 301	Bello	4648291	A	1	2026-02-14 03:04:08
43922752	Jaramillo Jaramillo Judy Liliana (Emma Jaramillo)	AV 45 # 68 A 68 CA	Bello	3025644	AA	1	2026-02-14 03:04:08
8399305	Jaramillo Tabarez Gabriel	AUT 102 # 17 - 82 AP 225	Bello	3144927214	A	1	2026-02-14 03:04:08
43668259	Londoño Lopez Lida Estella	CR 50 A # 37 - 14	Bello	4514914	AAA	1	2026-02-14 03:04:08
700320715	Molero Duran Dorisabet	CL 52 B 62 22	Bello	3042135431	A	1	2026-02-14 03:04:08
43662225	Perez Vasquez Olga Amparo	CR 62 D 74 - 73	Bello	3116896314	A	1	2026-02-14 03:04:08
32476344	Ramirez De Patiño Elizabeth	DG 56 44 125 P2	Bello	3207320382	AA	1	2026-02-14 03:04:08
1035865876	Rico Perez Astrid Yulieth	CR 62 D 74 - 73	Bello	3137303193	A	1	2026-02-14 03:04:08
98579701	Rivera Jaramillo Jesus Euclives	AV 47 A 67 135 P2 BRR NIQUIA	Bello	3184587601	A	1	2026-02-14 03:04:08
39211289	Rojo Gomez Marilu	CL 32 # 57 - 28	Bello	6139046	AA	1	2026-02-14 03:04:08
43917589	Tamayo Mesa Lina Marcela	CR 53 A CL 48 - 25	Bello	4572783	A	1	2026-02-14 03:04:09
32310166	Vasquez Sanguino Nubia Estela	CL 43 A 58 13	Bello	2759779	A	1	2026-02-14 03:04:09
43920964	Zuluaga Arvaez Gloria Patricia	CL 77 CR 66 - 90 AP 101	Bello	322534805	A	1	2026-02-14 03:04:09
43467697	Alzate Cardona Mery Bernarda	CR 64 CL 25 B 42	Itagüí	3090606	AAA	1	2026-02-14 03:04:09
28742199	Buitrago Serna Esperanza	CL 47 # 58-36 BRR EL ROSARIO	Itagüí	3144272388	A	1	2026-02-14 03:04:09
43161076	Estrada Aguirre Angela Yaneth	CR 59 A # 47 A 35	Itagüí	3165098382	A	1	2026-02-14 03:04:09
71279486	Hoyos Hernandez Juan Camilo	CR 52 D # 73 - 65	Itagüí	2818182	A	1	2026-02-14 03:04:09
15927569	Llanez Alzate Pedro Proceso	CL 58 CR 65 - 10	Itagüí	3711095	AAA	1	2026-02-14 03:04:09
1036674143	Lopez Herrera Vanessa	CL 47 # 61 - 81	Itagüí	3147423045	A	1	2026-02-14 03:04:09
42791387	Muñoz Valle Gloria Nelly	CL 49 # 46 - 09 AP 301- ASTURIAS	Itagüí	3183270148	A	1	2026-02-14 03:04:09
43189668	Salazar Panesso Aura Milena	CL 67 B # 55 - 12	Itagüí	3017311430	AAA	1	2026-02-14 03:04:09
17576365	Sierra Salazar Llineska Desiree	CL 13 A SUR # 53 - 112 IN 110	Itagüí	3145128450	A	1	2026-02-14 03:04:09
1082964637	Vergara Bracamonte Lina Marcela	CR 75 # 94 - 18	Itagüí	3011694242	A	1	2026-02-14 03:04:09
1036599696	Zapata Rios Claudia Carolina	CL 35 # 39 - 45 INT 302	Itagüí	3104256640	A	1	2026-02-14 03:04:09
1038405870	Montoya Arcila Laura Yubeidy	AC 35 32 32	Marinilla	3105955757	AA	1	2026-02-14 03:04:09
43796271	Ramirez Restrepo Alba Marleny	CL 31 # 33 - 136	Marinilla	3194979218	AAA	1	2026-02-14 03:04:09
32391893	Zuluaga Gomez Cruz Elena	CL 30 CR 44 - 20	Marinilla	3144820043	A	1	2026-02-14 03:04:09
43188279	Amparo Arias Jaqueline	CALLE 97 # 23-52	Medellín	3022204488	A	1	2026-02-14 03:04:09
43619122	Ardila Cano Yakeline	CR 97 A 48 C 16	Medellín	4913266	A	1	2026-02-14 03:04:09
32439583	Arenas de Baena Rosa Ines	CL 48 DD # 99 D 95	Medellín	3005232060	A	1	2026-02-14 03:04:09
42843342	Arismendy Garcia Claudia Sorany	CL 36 # 92 - 27	Medellín	5990211	AAA	1	2026-02-14 03:04:09
1063366292	Bedoya Paternina Paula Andrea	CR 143 A # 56 - 330	Medellín	300296581	A	1	2026-02-14 03:04:10
1096244432	Cañaveral Martinez Dayan Yulithza	CR 80 # 6 sur 30 AP 302	Medellín	3102370621	A	1	2026-02-14 03:04:10
43048297	Castañeda de Ramirez Marleny del Socorro	CR 75 # 94 - 18	Medellín	3147438466	A	1	2026-02-14 03:04:10
8104549	Castrillon Cardenas Edwin Alberto	CL 77 DD # 94 A 17	Medellín	3012707945	A	1	2026-02-14 03:04:10
1017140262	Chaverra Medina Julieth Alejandra	CR 50 # 95 - 101	Medellín	6034239	A	1	2026-02-14 03:04:10
34943965	Cotera Alvarez Aracelis del Carmen	CL 47 A 2 C 65	Medellín	3207042688	A	1	2026-02-14 03:04:10
1128444889	De Ossa Bolivar Maria Esperanza	CR 79 B 46 SUR 101 IN 0221	Medellín	3017466926	A	1	2026-02-14 03:04:10
43916205	Florez Estrada Claudia Patricia	CR 45 # 111 - 30	Medellín	3024186626	AAA	1	2026-02-14 03:04:10
1036600639	Gallego Atehortua Claudia Yaneth	KM 15 CORR SANTA ELEA	Medellín	5380752	A	1	2026-02-14 03:04:10
43016242	Gallego Heranndez Martha Oliva	CL 57 SUR 62 B 31	Medellín	2868183	A	1	2026-02-14 03:04:10
24368442	Gallego Loaiza Maria Melva	CRA 77 CLL 23-35	Medellín	3147774833	A	1	2026-02-14 03:04:10
1128390179	Garcia Castrillon Yuly Paulina	CR 71 # 93 - 57	Medellín	3185700973	A	1	2026-02-14 03:04:12
1001003896	Garcia Posada Maria Isabel	CR 112 # 13 - 155 IN 103	Medellín	4953405	A	1	2026-02-14 03:04:12
1045017301	Garcia Vergara Carlos Andrés (Michel Cano y LiliaA Garcia)	CR 44 A 20	Medellín	3234721063	AAA	1	2026-02-14 03:04:12
1036612879	Garnica Linares Andrea Aurora	CL 48 A SUR D 38 AP 20	Medellín	5065952	A	1	2026-02-14 03:04:12
39268713	Giraldo Villa Gloria Elena	CL 82 # 72 C 108	Medellín	4874554	A	1	2026-02-14 03:04:12
21701184	Gonzalez Palacio Doris Amparo	CR 89 B 89 101 IN 246 TO 7	Medellín	3225691506	AA	1	2026-02-14 03:04:12
1035304202	Guisao Miranda Yefferson Andrei	CL 102 B 84 A 109	Medellín	3235322458	A	1	2026-02-14 03:04:12
1035414253	Hernandez Rueda Lisceth Tatiana	CR 94 A CL 70 G C 80	Medellín	312520319	A	1	2026-02-14 03:04:12
1017162806	Hidalgo Cortes Diego Alberto	CL 56 # 32 - 133	Medellín	2168719	A	1	2026-02-14 03:04:12
43561368	Marulanda Guarin Gloria Patricia	CL 82 # 32-44	Medellín	3117675970	A	1	2026-02-14 03:04:12
1128430728	Mazo Restrepo Edith Nataly	AC 100 DD # 28 CB - 8 INT 201	Medellín	5166082	A	1	2026-02-14 03:04:12
43537983	Medina Migdalia del Socorro	CR 39 B 39 C 30	Medellín	6034239	A	1	2026-02-14 03:04:12
1094366162	Meneses FerAndez Tania Paola	CR 70 B 9 A 32 AP 201	Medellín	3125379229	A	1	2026-02-14 03:04:12
21896457	Montoya Lopez Dora Liliana	CL 68 # 58-71	Medellín	3113926142	A	1	2026-02-14 03:04:12
1007538923	Montoya Valderrama Jeniffer Geraldin	CR 118 CL 39 D 123 IN 110	Medellín	31961993	A	1	2026-02-14 03:04:12
32461771	Muñoz Arredondo Maria Elvia Lucia	CR 96 47 A 176	Medellín	5855705	AAA	1	2026-02-14 03:04:12
43916106	Muñoz Vargas July Alejandra	CL 110 C 43 A 07	Medellín	5221529	A	1	2026-02-14 03:04:12
43202750	Ocampo Villada Luz Aida	CR 47 # 92-89	Medellín	3022356712	A	1	2026-02-14 03:04:12
32297720	Olaya Gonzalez Vianeth Mileidy	CL 89 A # 39 - 46	Medellín	3142418994	A	1	2026-02-14 03:04:12
1042767669	Perez Waltero Linda Estefany	CR 82 C 104 D D 29	Medellín	3155503959	A	1	2026-02-14 03:04:12
43589459	Posada Villegas Ruth Yannet	CL 49 C # 5 - 114	Medellín	3024484780	A	1	2026-02-14 03:04:12
42999087	Pulgarin Mejia Josefina del Socorro	CL 80 C 74 - 188	Medellín	4418640	AAA	1	2026-02-14 03:04:13
43084268	Quiceno Aguirre Maria Teresa	CR 98 B # 83 B 25	Medellín	3002477189	AAA	1	2026-02-14 03:04:13
12435671	Quintero Contreras Edward Sadit	CL 34 # 52 - 44	Medellín	2316387	A	1	2026-02-14 03:04:13
43622970	Rico Bermudez Maria Eugenia	CRA 43 # 118B-21	Medellín	3246434020	A	1	2026-02-14 03:04:13
27894856	Rivera Chaparro Claudia Liliana	CL 20 B NORTE BRR París	Medellín	4715428	A	1	2026-02-14 03:04:13
1053798633	Rodas Vinasco Yesid Alexander	CL 110 # 46 - 28 IN 197	Medellín	3017782338	A	1	2026-02-14 03:04:13
1017157466	Rua Agudelo Cristian Alexis	CR 57 # 42 - 38	Medellín	3223965702	A	1	2026-02-14 03:04:13
43014769	Sepulveda Henao Dora Luz	CL 91 AB #84-106 INT 201	Medellín	3023695101	A	1	2026-02-14 03:04:13
43272097	Taborda Rendón Adriana Maria	CL 110 B 43 AA 16	Medellín	5226317	AA	1	2026-02-14 03:04:13
98587077	Toro Cano Hoiber	CL 92 B 56 A 24	Medellín	5051560	A	1	2026-02-14 03:04:13
1039079211	Usuga Carmen Yaneth	CR 16 mz 63 BRR LimoAr	Medellín	5705186	AAA	1	2026-02-14 03:04:13
43638585	Varela Restrepo Alba Mery	CR 118 # 39 A 50	Medellín	3215796407	A	1	2026-02-14 03:04:13
43865445	Vargas Agudelo Sandra Milena	CL 110 C CR 43 A 7	Medellín	3117313015	A	1	2026-02-14 03:04:13
1017177916	Vargas Guerra Diana Maria	CL 57 # 19 - 88 AP 204	Medellín	3045951934	A	1	2026-02-14 03:04:13
1041205070	Gallego Valencia Astrid Carolina	CR 48 # 49 - 20 AP 302	Santuario	3117920607	AA	1	2026-02-14 03:04:13
43788596	Jimenez Ramirez Deisy Yohana	CR 53 49 N° 73 AP 402	Santuario	5672730	A	1	2026-02-14 03:04:13
1045026047	Lopez Morales Ana María	CR 50 CL 45 B 66	Santuario	3172402992	A	1	2026-02-14 03:04:14
1045019585	Serna Ramirez Angela Maria	CL 82 # 32 - 44	Santuario	3117675970	A	1	2026-02-14 03:04:14
43118318	Vasquez Margarita Maria	DG 58 # 42 - 116	Bello	6012336	A	1	2026-02-14 03:04:14
43273110	Correa Zamora Shirley	BRR MANRIQUE CL 83 CR 4331	Medellín	3016112549	A	1	2026-02-14 03:04:14
1128459691	Loaiza Correa Yennifer	CRA 69 # 36 SUR 157	Medellín	3147080623	A	1	2026-02-14 03:04:14
1128386891	Vasquez Barrientos Leonardo Fabio (Margarita Vasquez)	CR 69 # 78 B 12 IN 310	Medellín	3128684424	AAA	1	2026-02-14 03:04:14
43381473	Arcila Valencia Maria Esperanza	CLL 111 F # 64 - 56	Medellín	3213763265	A	1	2026-02-14 03:04:14
43097913	Olaya Marta Bibiana	DG 62 AV # 48 B 30 IN 201	Bello	3218855166	AAA	1	2026-02-14 03:04:14
8058195	Araujo Rodriguez Hernan Dario (Aura Rodriguez)	CLL 49 A # 56 A 9 IN 104	Bello	3122821121	AA	1	2026-02-14 03:04:14
43181466	Gil Saldarriaga Erica Astrid	CL 38 SUR 77 10J LOS ANGELES	Itagüí	3046377165	AAA	1	2026-02-14 03:04:14
1046667079	Cardona Valencia Camila	CLL 37 B # SUR 82 D 20	Medellín	3017797376	A	1	2026-02-14 03:04:14
1152190746	Graciano Sepulveda Yira Marcela	VDA AGUAS FRIAS BRR BELEN	Medellín	2385625	AAA	1	2026-02-14 03:04:14
700469989	Marquez Uribe David Esteban	CRR 58 A 65 # 22 IN 301	Itagüí	3124081795	A	1	2026-02-14 03:04:14
43283514	Vargas Araque Maria Dolly	DG 30 # 33 A SUR 34	Envigado	3105924202	A	1	2026-02-14 03:04:14
1152457615	Lopez Gallego Luz Mary	CALLE 31 # 109-42 BELEN	Medellín	3003194787	A	1	2026-02-14 03:04:15
71223381	Restrepo Olaya Elkin Emilio (Nancy Arboleda)	CALLE 14 SUR # 58 B 05	Itagüí	3116940715	AAA	1	2026-02-14 03:04:15
1037886122	Gomez Arcila Leon david	CL 33 # 33 - 19 AP 301	Marinilla	3116642376	A	1	2026-02-14 03:04:15
98514920	Loaiza Saldarriaga Johan Adiel	VDA EL SALADO SEC LA CANDELA	Medellín	3136698557	A	1	2026-02-14 03:04:15
1013617204	Cardenas Hernandez Nestor Julian	DG 31 D # 32 SUR 15 APTO 302	Medellín	3026033654	AAA	1	2026-02-14 03:04:15
39439040	Arcila Montoya Alba Mirian	CL 33 33 19 AP 301	Marinilla	3104906527	AAA	1	2026-02-14 03:04:15
1038416826	Muñoz Montoya kevin	CL 24 30 44	Marinilla	3235027832	A	1	2026-02-14 03:04:16
1018230626	Berrio Jorge Luis	Cr 81 54 51 AP 101	Medellín	3054270414	A	1	2026-02-14 03:04:16
45769944	Beleño Ariza Ebeth Isabel	Cll 45 d 16 30	Medellín	3205268697	AA	1	2026-02-14 03:04:16
1020436106	Sanchez Sanchez Evelin Yaheni	DG 55 46 48 BRR Niquia	Bello	3116457499	A	1	2026-02-14 03:04:17
1017159858	Mazo Guerra Jhon Jader	CL 65 Cr 16 DD	Medellín	3015703383	A	1	2026-02-14 03:04:17
700530400	Cubillan Contreras Mariu Eugenia	Cl 47 29 39 IN 111	Copacabana	3042872273	AAA	1	2026-02-14 03:04:17
43115930	Amaya Trujillo Adriana Patricia	AV 48 A 65 115	Bello	5979171	AA	1	2026-02-14 03:04:17
43843857	Muñoz Salazar Luz Yenny	CALL 40A SUR #59-40 INT 201	Medellín	3026221102	A	1	2026-02-14 03:04:17
1037264064	Correa Piedrahita Diana Andrea	CALL 83 #57-22	Medellín	3104665496	AAA	1	2026-02-14 03:04:17
1001686689	Garrido Bartolo Karen  (Maria Isabel Bartolo)	Cr 56 46 37 in 201	Itagüí	3044223445	AA	1	2026-02-14 03:04:17
43429023	Lopera Torres Luz Doris	CALL 55 # 46-21	Bello	3017227142	A	1	2026-02-14 03:04:17
1037325550	Pulgarin Giraldo Didier	Carrera 4 # 2 - 72	Jardin	3217516834	A	1	2026-02-14 03:04:17
1036608419	Castaño Acevedo Jhon Euliser	CL 35 49 37	Itagüí	3122908488	A	1	2026-02-14 03:04:17
43989889	Sierra Claudia Marcela	Cr 46 106 A 28 Ap 302	Medellín	3146021287	A	1	2026-02-14 03:04:17
43517753	Cossio Parra Maria Eugenia	Cr 20 A 58 08 MZ 13	Dosquebradas	3015093148	A	1	2026-02-14 03:04:17
1040871321	Ospina Castañeda Paulina	Cr 45 A 20 39	Marinilla	3208067864	A	1	2026-02-14 03:04:18
1234991468	Quiroz Garcia Luisa Fernanda	CARR 59D  #41D SUR 23	Medellín	3244399156	A	1	2026-02-14 03:04:18
21713597	Chavarria Chavarria Maria Bernanda	Cll 76 50 14 Santa Maria	Itagüí	3712520	A	1	2026-02-14 03:04:18
43400859	Castañeda Alvarez Laura Shirley	Cll 124 a sur cr 50 b 12	Caldas	3006015843	AA	1	2026-02-14 03:04:18
42897491	Gomez Berrio Lorena Maria	Cll 96 b 50 aa 26	La Estrella	3128743193	AA	1	2026-02-14 03:04:18
71366811	Salazar Blanco Edier Ferley	Cll 118 42 B 54	Medellín	3207420013	AA	1	2026-02-14 03:04:18
43115719	Sanchez Espinoza Claudia De Jesus	Cll 94 D 79 A 59 in 201	Medellín	3017197220	A	1	2026-02-14 03:04:18
1152447519	Jaramillo Gallego Angelica Maria	Cr 2102 B 49 b 18	Medellín	3015588007	A	1	2026-02-14 03:04:18
43818822	Zapata Valencia Eliana Maria	Cr 55 95 A 13 AP 306	Medellín	3012608251	AA	1	2026-02-14 03:04:18
1027881749	Cano Acevedo Mary Luz	Cr 55 54 44	Bello	3213192748	A	1	2026-02-14 03:04:18
1037599747	Soto Marulanda Leidy Selene	Cl 55 7 165 In 105	Medellín	3108973012	A	1	2026-02-14 03:04:18
43825606	Alzate Pineda Olga Lucia	Cl 34 A 40 42	Itagüí	3043367407	AA	1	2026-02-14 03:04:19
1035862169	Zuluaga Cardona Elisa Maria	Av 35 42 EE 102 ATR	Bello	3193310554	AA	1	2026-02-14 03:04:19
100205983	Tobon Alvarez Laura Micheli	Cl 82 71 a 42	Medellín	3145453566	A	1	2026-02-14 03:04:19
1065818962	Carolina Gil Arias Yazmin	Cl 56 58 FF 28 in 201	Itagüí	3122746029	A	1	2026-02-14 03:04:19
1033649051	Montoya Arboleda Ana Isabel	Cl 103 G 64 D 28 101	Medellín	3148470510	AAA	1	2026-02-14 03:04:19
43744055	Rivera Higuita Gladys Elena	Cr 47 76 sur 12	Sabaneta	3233305339	AA	1	2026-02-14 03:04:19
43727411	Torres Alvarez Marta Cecilia	Cl 31 D 100 B 33	Medellín	3213539701	AA	1	2026-02-14 03:04:19
1017148861	Amaya Macias Yecenia	Cl 96 82 18	Medellín	3103751591	A	1	2026-02-14 03:04:19
1128388462	Sierra Garcia Adriana	CR 97 aa 66 55	Medellín	3126941601	AA	1	2026-02-14 03:04:19
287890791	Usuga Rojas Teresa De Jesus	Cr 43 108 118 AP 130	Medellín	3217035197	AA	1	2026-02-14 03:04:19
55238173	Silvera Arenilla Eileen Jattin	CL 82 CR 50 A in 201	Itagüí	3146681728	A	1	2026-02-14 03:04:19
700308111	Medina de Gonzalez Yezenia Lorena	DG 69 B AV B ap 95	Bello	3249653566	A	1	2026-02-14 03:04:19
1084732805	Fernandez Duran Yalides Maria	CL 62 Cr 109 A 120	Medellín	3002550065	AA	1	2026-02-14 03:04:19
35855609	Mausa Cordero Ana Olfiria	Cl 84 50 E 53 Cmapo Valdes	Medellín	3145945954	A	1	2026-02-14 03:04:19
3800154	Hinestroza Valencia Norelvis	CL 30 B 114 73	Medellín	3046111584	A	1	2026-02-14 03:04:19
1017202088	Muñoz Campiño Natalia Andrea	Cr 38 95 a 33	Medellín	3114311083	A	1	2026-02-14 03:04:20
1010208134	Useche Posada Gennifer Natali	DG 31 D 32 sur 15 in 302	Envigado	3507046736	A	1	2026-02-14 03:04:20
70417905	Taborda Garcia Silvio De Jesus	CL 37 aa 40 127 San Jose	Itagüí	3233595147	A	1	2026-02-14 03:04:20
1039464753	Delgado Ramirez Alejandro (Yamile Valencia)	Cr 41 A 86 A 49	Medellín	3005534084	AA	1	2026-02-14 03:04:20
1026279312	Vargas Ruiz Daniela	Cl 93 sur 1 H 22 este	Bogota	3133883095	A	1	2026-02-14 03:04:20
21450450	Henao Mira Alba Nelly	Cr 51 Cl 95 in 104	Medellín	3233478085	A	1	2026-02-14 03:04:20
1128482429	Zapata Rua Ana Julieta	Cr 53 A 89 53 Aranjuez	Medellín	3045832657	AA	1	2026-02-14 03:04:20
\.


--
-- TOC entry 5226 (class 0 OID 16440)
-- Dependencies: 223
-- Data for Name: correria_catalog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.correria_catalog (id, correria_id, reference_id, added_at) FROM stdin;
mll8jdc40al25ozf8	mljjqn48zbxhtg0yw	12129	2026-02-13 18:42:49
mllajapdkd3lljisc	mljjqn48zbxhtg0yw	12366	2026-02-13 19:38:45
mllajaq6txcpnvcmt	mljjqn48zbxhtg0yw	12463	2026-02-13 19:38:45
mllajarum89y5q2bf	mljjqn48zbxhtg0yw	12665	2026-02-13 19:38:45
mllajas29ahb2axyr	mljjqn48zbxhtg0yw	12679	2026-02-13 19:38:45
mllajas9ghekj18d2	mljjqn48zbxhtg0yw	12680	2026-02-13 19:38:45
mllajat9ezn7md618	mljjqn48zbxhtg0yw	12699	2026-02-13 19:38:45
mllajato8txpoy6ha	mljjqn48zbxhtg0yw	12708	2026-02-13 19:38:45
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
mllajb04rmg5cexvw	mljjqn48zbxhtg0yw	12866	2026-02-13 19:38:45
mllajb0bg5r5fjt84	mljjqn48zbxhtg0yw	12868	2026-02-13 19:38:45
mllajb0iewad2xygh	mljjqn48zbxhtg0yw	12870	2026-02-13 19:38:45
mllajb0oqrfztmnps	mljjqn48zbxhtg0yw	12871	2026-02-13 19:38:45
mllajb0xvofefsf2d	mljjqn48zbxhtg0yw	12872	2026-02-13 19:38:45
mllajb13n33z959qj	mljjqn48zbxhtg0yw	12873	2026-02-13 19:38:45
mllajb1b9zjfr23hs	mljjqn48zbxhtg0yw	12875	2026-02-13 19:38:45
mllajb1hj846kimpt	mljjqn48zbxhtg0yw	12876	2026-02-13 19:38:45
mllajb1u4ab5blhjs	mljjqn48zbxhtg0yw	12878	2026-02-13 19:38:45
mllajb21a1s3g5n8h	mljjqn48zbxhtg0yw	12879	2026-02-13 19:38:45
mllajb28o9mvt5o26	mljjqn48zbxhtg0yw	12880	2026-02-13 19:38:45
mllajb2mzcc0tjxr7	mljjqn48zbxhtg0yw	12882	2026-02-13 19:38:45
mllajb3xg5vg8pvv1	mljjqn48zbxhtg0yw	12892	2026-02-13 19:38:45
mllajb45mxi3yt5ky	mljjqn48zbxhtg0yw	12893	2026-02-13 19:38:45
mllajb4btawy78ch0	mljjqn48zbxhtg0yw	12897	2026-02-13 19:38:45
mllajb4jojzapnr95	mljjqn48zbxhtg0yw	12898	2026-02-13 19:38:45
mllajb4yuzm2gbo3b	mljjqn48zbxhtg0yw	12906	2026-02-13 19:38:45
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
mllajb7yunlcrh87f	mljjqn48zbxhtg0yw	12921	2026-02-13 19:38:46
mllajb832w918soc8	mljjqn48zbxhtg0yw	12922	2026-02-13 19:38:46
mllajb8dtrlaedtq0	mljjqn48zbxhtg0yw	12923	2026-02-13 19:38:46
mllajb8jyms7ape7o	mljjqn48zbxhtg0yw	12924	2026-02-13 19:38:46
mllajb8rphe3hnotx	mljjqn48zbxhtg0yw	12926	2026-02-13 19:38:46
mllajb95am775w3cm	mljjqn48zbxhtg0yw	12933	2026-02-13 19:38:46
mllajb9cfucyg6nji	mljjqn48zbxhtg0yw	12934	2026-02-13 19:38:46
mllajb9rdcaqk8s6d	mljjqn48zbxhtg0yw	12936	2026-02-13 19:38:46
mllajb9y67tnllz17	mljjqn48zbxhtg0yw	12937	2026-02-13 19:38:46
mllajba6ikbxifg0w	mljjqn48zbxhtg0yw	12939	2026-02-13 19:38:46
mllajbaq4ozkbkxaf	mljjqn48zbxhtg0yw	12940	2026-02-13 19:38:46
mllajbb4p3kke6gon	mljjqn48zbxhtg0yw	12941	2026-02-13 19:38:46
mllajbbj9ojj1jpwa	mljjqn48zbxhtg0yw	12942	2026-02-13 19:38:46
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
mllajbf3jpf1h8tmi	mljjqn48zbxhtg0yw	12961	2026-02-13 19:38:46
12000_mljjqn48zbxhtg0yw_1772036252089	mljjqn48zbxhtg0yw	12000	\N
12460_mljjrcujmtckild4r_1773440476711	mljjrcujmtckild4r	12460	\N
12473_mljjrcujmtckild4r_1773440476712	mljjrcujmtckild4r	12473	\N
12498_mljjrcujmtckild4r_1773440476715	mljjrcujmtckild4r	12498	\N
12565_mljjrcujmtckild4r_1773440571179	mljjrcujmtckild4r	12565	\N
12574_mljjrcujmtckild4r_1773440571187	mljjrcujmtckild4r	12574	\N
12576_mljjrcujmtckild4r_1773440571190	mljjrcujmtckild4r	12576	\N
12579_mljjrcujmtckild4r_1773440571191	mljjrcujmtckild4r	12579	\N
12581_mljjrcujmtckild4r_1773440571194	mljjrcujmtckild4r	12581	\N
12600_mljjrcujmtckild4r_1773440571196	mljjrcujmtckild4r	12600	\N
12609_mljjrcujmtckild4r_1773440571200	mljjrcujmtckild4r	12609	\N
12617_mljjrcujmtckild4r_1773440571202	mljjrcujmtckild4r	12617	\N
12623_mljjrcujmtckild4r_1773440571204	mljjrcujmtckild4r	12623	\N
12640_mljjrcujmtckild4r_1773440571206	mljjrcujmtckild4r	12640	\N
12644_mljjrcujmtckild4r_1773440571208	mljjrcujmtckild4r	12644	\N
12652_mljjrcujmtckild4r_1773440571209	mljjrcujmtckild4r	12652	\N
12671_mljjrcujmtckild4r_1773440571212	mljjrcujmtckild4r	12671	\N
12683_mljjrcujmtckild4r_1773440571215	mljjrcujmtckild4r	12683	\N
12685_mljjrcujmtckild4r_1773440571217	mljjrcujmtckild4r	12685	\N
12686_mljjrcujmtckild4r_1773440571219	mljjrcujmtckild4r	12686	\N
12692_mljjrcujmtckild4r_1773440571220	mljjrcujmtckild4r	12692	\N
12694_mljjrcujmtckild4r_1773440571222	mljjrcujmtckild4r	12694	\N
12698_mljjrcujmtckild4r_1773440571223	mljjrcujmtckild4r	12698	\N
12704_mljjrcujmtckild4r_1773440571225	mljjrcujmtckild4r	12704	\N
12709_mljjrcujmtckild4r_1773440571226	mljjrcujmtckild4r	12709	\N
12712_mljjrcujmtckild4r_1773440571227	mljjrcujmtckild4r	12712	\N
12737_mljjrcujmtckild4r_1773440571229	mljjrcujmtckild4r	12737	\N
12744_mljjrcujmtckild4r_1773440571231	mljjrcujmtckild4r	12744	\N
12747_mljjrcujmtckild4r_1773440571235	mljjrcujmtckild4r	12747	\N
12754_mljjrcujmtckild4r_1773440571236	mljjrcujmtckild4r	12754	\N
12771_mljjrcujmtckild4r_1773440571239	mljjrcujmtckild4r	12771	\N
12777_mljjrcujmtckild4r_1773440571240	mljjrcujmtckild4r	12777	\N
12782_mljjrcujmtckild4r_1773440571242	mljjrcujmtckild4r	12782	\N
12783_mljjrcujmtckild4r_1773440571243	mljjrcujmtckild4r	12783	\N
12862_mljjrcujmtckild4r_1773440571245	mljjrcujmtckild4r	12862	\N
12864_mljjrcujmtckild4r_1773440571250	mljjrcujmtckild4r	12864	\N
12865_mljjrcujmtckild4r_1773440571252	mljjrcujmtckild4r	12865	\N
12869_mljjrcujmtckild4r_1773440571253	mljjrcujmtckild4r	12869	\N
12877_mljjrcujmtckild4r_1773440571254	mljjrcujmtckild4r	12877	\N
12881_mljjrcujmtckild4r_1773440571256	mljjrcujmtckild4r	12881	\N
12883_mljjrcujmtckild4r_1773440571258	mljjrcujmtckild4r	12883	\N
12884_mljjrcujmtckild4r_1773440571259	mljjrcujmtckild4r	12884	\N
12885_mljjrcujmtckild4r_1773440571261	mljjrcujmtckild4r	12885	\N
12889_mljjrcujmtckild4r_1773440571263	mljjrcujmtckild4r	12889	\N
12895_mljjrcujmtckild4r_1773440571265	mljjrcujmtckild4r	12895	\N
12905_mljjrcujmtckild4r_1773440571266	mljjrcujmtckild4r	12905	\N
12907_mljjrcujmtckild4r_1773440571268	mljjrcujmtckild4r	12907	\N
12908_mljjrcujmtckild4r_1773440571269	mljjrcujmtckild4r	12908	\N
12909_mljjrcujmtckild4r_1773440571271	mljjrcujmtckild4r	12909	\N
12920_mljjrcujmtckild4r_1773440571272	mljjrcujmtckild4r	12920	\N
12931_mljjrcujmtckild4r_1773440571274	mljjrcujmtckild4r	12931	\N
12943_mljjrcujmtckild4r_1773440571276	mljjrcujmtckild4r	12943	\N
12959_mljjrcujmtckild4r_1773440571277	mljjrcujmtckild4r	12959	\N
12960_mljjrcujmtckild4r_1773440571280	mljjrcujmtckild4r	12960	\N
12962_mljjrcujmtckild4r_1773440571282	mljjrcujmtckild4r	12962	\N
12963_mljjrcujmtckild4r_1773440571284	mljjrcujmtckild4r	12963	\N
12964_mljjrcujmtckild4r_1773440571285	mljjrcujmtckild4r	12964	\N
12965_mljjrcujmtckild4r_1773440571287	mljjrcujmtckild4r	12965	\N
12966_mljjrcujmtckild4r_1773440571288	mljjrcujmtckild4r	12966	\N
12967_mljjrcujmtckild4r_1773440571290	mljjrcujmtckild4r	12967	\N
12968_mljjrcujmtckild4r_1773440571291	mljjrcujmtckild4r	12968	\N
12969_mljjrcujmtckild4r_1773440571293	mljjrcujmtckild4r	12969	\N
12970_mljjrcujmtckild4r_1773440571294	mljjrcujmtckild4r	12970	\N
12971_mljjrcujmtckild4r_1773440571298	mljjrcujmtckild4r	12971	\N
12972_mljjrcujmtckild4r_1773440571300	mljjrcujmtckild4r	12972	\N
12973_mljjrcujmtckild4r_1773440571303	mljjrcujmtckild4r	12973	\N
12974_mljjrcujmtckild4r_1773440571308	mljjrcujmtckild4r	12974	\N
12975_mljjrcujmtckild4r_1773440571310	mljjrcujmtckild4r	12975	\N
12976_mljjrcujmtckild4r_1773440571316	mljjrcujmtckild4r	12976	\N
12980_mljjrcujmtckild4r_1773440571324	mljjrcujmtckild4r	12980	\N
12984_mljjrcujmtckild4r_1773440571326	mljjrcujmtckild4r	12984	\N
12986_mljjrcujmtckild4r_1773440571328	mljjrcujmtckild4r	12986	\N
12987_mljjrcujmtckild4r_1773440571330	mljjrcujmtckild4r	12987	\N
12990_mljjrcujmtckild4r_1773440571335	mljjrcujmtckild4r	12990	\N
13001_mljjrcujmtckild4r_1773440571343	mljjrcujmtckild4r	13001	\N
13002_mljjrcujmtckild4r_1773440571345	mljjrcujmtckild4r	13002	\N
13003_mljjrcujmtckild4r_1773440571350	mljjrcujmtckild4r	13003	\N
13004_mljjrcujmtckild4r_1773440571352	mljjrcujmtckild4r	13004	\N
13005_mljjrcujmtckild4r_1773440571357	mljjrcujmtckild4r	13005	\N
13008_mljjrcujmtckild4r_1773440571362	mljjrcujmtckild4r	13008	\N
13010_mljjrcujmtckild4r_1773440571372	mljjrcujmtckild4r	13010	\N
13011_mljjrcujmtckild4r_1773440571376	mljjrcujmtckild4r	13011	\N
13012_mljjrcujmtckild4r_1773440571378	mljjrcujmtckild4r	13012	\N
13013_mljjrcujmtckild4r_1773440571382	mljjrcujmtckild4r	13013	\N
13014_mljjrcujmtckild4r_1773440571384	mljjrcujmtckild4r	13014	\N
13015_mljjrcujmtckild4r_1773440571387	mljjrcujmtckild4r	13015	\N
13016_mljjrcujmtckild4r_1773440571392	mljjrcujmtckild4r	13016	\N
13023_mljjrcujmtckild4r_1773440571394	mljjrcujmtckild4r	13023	\N
13027_mljjrcujmtckild4r_1773440571396	mljjrcujmtckild4r	13027	\N
13028_mljjrcujmtckild4r_1773440571402	mljjrcujmtckild4r	13028	\N
13029_mljjrcujmtckild4r_1773440571408	mljjrcujmtckild4r	13029	\N
13033_mljjrcujmtckild4r_1773440571411	mljjrcujmtckild4r	13033	\N
13035_mljjrcujmtckild4r_1773440571413	mljjrcujmtckild4r	13035	\N
13036_mljjrcujmtckild4r_1773440571417	mljjrcujmtckild4r	13036	\N
13039_mljjrcujmtckild4r_1773440571419	mljjrcujmtckild4r	13039	\N
13040_mljjrcujmtckild4r_1773440571424	mljjrcujmtckild4r	13040	\N
13041_mljjrcujmtckild4r_1773440571425	mljjrcujmtckild4r	13041	\N
13042_mljjrcujmtckild4r_1773440571427	mljjrcujmtckild4r	13042	\N
13043_mljjrcujmtckild4r_1773440571428	mljjrcujmtckild4r	13043	\N
13045_mljjrcujmtckild4r_1773440571433	mljjrcujmtckild4r	13045	\N
13046_mljjrcujmtckild4r_1773440571435	mljjrcujmtckild4r	13046	\N
13047_mljjrcujmtckild4r_1773440571440	mljjrcujmtckild4r	13047	\N
13048_mljjrcujmtckild4r_1773440571441	mljjrcujmtckild4r	13048	\N
13055_mljjrcujmtckild4r_1773440571445	mljjrcujmtckild4r	13055	\N
13057_mljjrcujmtckild4r_1773440571449	mljjrcujmtckild4r	13057	\N
13058_mljjrcujmtckild4r_1773440571450	mljjrcujmtckild4r	13058	\N
13064_mljjrcujmtckild4r_1773440571454	mljjrcujmtckild4r	13064	\N
13065_mljjrcujmtckild4r_1773440571455	mljjrcujmtckild4r	13065	\N
13066_mljjrcujmtckild4r_1773440571457	mljjrcujmtckild4r	13066	\N
13067_mljjrcujmtckild4r_1773440571458	mljjrcujmtckild4r	13067	\N
13068_mljjrcujmtckild4r_1773440571459	mljjrcujmtckild4r	13068	\N
13073_mljjrcujmtckild4r_1773440571461	mljjrcujmtckild4r	13073	\N
13074_mljjrcujmtckild4r_1773440571464	mljjrcujmtckild4r	13074	\N
13076_mljjrcujmtckild4r_1773440571465	mljjrcujmtckild4r	13076	\N
13077_mljjrcujmtckild4r_1773440571466	mljjrcujmtckild4r	13077	\N
13078_mljjrcujmtckild4r_1773440571468	mljjrcujmtckild4r	13078	\N
13079_mljjrcujmtckild4r_1773440571469	mljjrcujmtckild4r	13079	\N
13081_mljjrcujmtckild4r_1773440571471	mljjrcujmtckild4r	13081	\N
13083_mljjrcujmtckild4r_1773440571473	mljjrcujmtckild4r	13083	\N
13084_mljjrcujmtckild4r_1773440571474	mljjrcujmtckild4r	13084	\N
13086_mljjrcujmtckild4r_1773440571476	mljjrcujmtckild4r	13086	\N
13090_mljjrcujmtckild4r_1773440571479	mljjrcujmtckild4r	13090	\N
13091_mljjrcujmtckild4r_1773440571481	mljjrcujmtckild4r	13091	\N
13093_mljjrcujmtckild4r_1773440571483	mljjrcujmtckild4r	13093	\N
13094_mljjrcujmtckild4r_1773440571484	mljjrcujmtckild4r	13094	\N
13095_mljjrcujmtckild4r_1773440571486	mljjrcujmtckild4r	13095	\N
13096_mljjrcujmtckild4r_1773440571488	mljjrcujmtckild4r	13096	\N
13097_mljjrcujmtckild4r_1773440571489	mljjrcujmtckild4r	13097	\N
13098_mljjrcujmtckild4r_1773440571491	mljjrcujmtckild4r	13098	\N
13100_mljjrcujmtckild4r_1773440571493	mljjrcujmtckild4r	13100	\N
13101_mljjrcujmtckild4r_1773440571494	mljjrcujmtckild4r	13101	\N
13102_mljjrcujmtckild4r_1773440571495	mljjrcujmtckild4r	13102	\N
13103_mljjrcujmtckild4r_1773440571497	mljjrcujmtckild4r	13103	\N
13104_mljjrcujmtckild4r_1773440571498	mljjrcujmtckild4r	13104	\N
13105_mljjrcujmtckild4r_1773440571499	mljjrcujmtckild4r	13105	\N
13106_mljjrcujmtckild4r_1773440571501	mljjrcujmtckild4r	13106	\N
13107_mljjrcujmtckild4r_1773440571502	mljjrcujmtckild4r	13107	\N
13109_mljjrcujmtckild4r_1773440571504	mljjrcujmtckild4r	13109	\N
13110_mljjrcujmtckild4r_1773440571506	mljjrcujmtckild4r	13110	\N
13112_mljjrcujmtckild4r_1773440571507	mljjrcujmtckild4r	13112	\N
13113_mljjrcujmtckild4r_1773440571508	mljjrcujmtckild4r	13113	\N
13115_mljjrcujmtckild4r_1773440571511	mljjrcujmtckild4r	13115	\N
13116_mljjrcujmtckild4r_1773440571512	mljjrcujmtckild4r	13116	\N
13117_mljjrcujmtckild4r_1773440571513	mljjrcujmtckild4r	13117	\N
13118_mljjrcujmtckild4r_1773440571514	mljjrcujmtckild4r	13118	\N
13119_mljjrcujmtckild4r_1773440571515	mljjrcujmtckild4r	13119	\N
13120_mljjrcujmtckild4r_1773440571517	mljjrcujmtckild4r	13120	\N
13121_mljjrcujmtckild4r_1773440571518	mljjrcujmtckild4r	13121	\N
13122_mljjrcujmtckild4r_1773440571519	mljjrcujmtckild4r	13122	\N
13123_mljjrcujmtckild4r_1773440571521	mljjrcujmtckild4r	13123	\N
13128_mljjrcujmtckild4r_1773440571527	mljjrcujmtckild4r	13128	\N
13129_mljjrcujmtckild4r_1773440571529	mljjrcujmtckild4r	13129	\N
13131_mljjrcujmtckild4r_1773440571530	mljjrcujmtckild4r	13131	\N
13254_mljjrcujmtckild4r_1773440571532	mljjrcujmtckild4r	13254	\N
12395_mljjrcujmtckild4r_1773686696991	mljjrcujmtckild4r	12395	\N
12395_mljjqn48zbxhtg0yw_1773686696999	mljjqn48zbxhtg0yw	12395	\N
12402_mljjrcujmtckild4r_1773686753358	mljjrcujmtckild4r	12402	\N
12412_mljjrcujmtckild4r_1773686763502	mljjrcujmtckild4r	12412	\N
12416_mljjrcujmtckild4r_1773686768092	mljjrcujmtckild4r	12416	\N
12431_mljjrcujmtckild4r_1773687293194	mljjrcujmtckild4r	12431	\N
12431_mljjqn48zbxhtg0yw_1773687293194	mljjqn48zbxhtg0yw	12431	\N
12442_mljjrcujmtckild4r_1773687310413	mljjrcujmtckild4r	12442	\N
12442_mljjqn48zbxhtg0yw_1773687310413	mljjqn48zbxhtg0yw	12442	\N
12473_mljjqn48zbxhtg0yw_1773688064339	mljjqn48zbxhtg0yw	12473	\N
12574_mljjqn48zbxhtg0yw_1773688064344	mljjqn48zbxhtg0yw	12574	\N
12581_mljjqn48zbxhtg0yw_1773688111763	mljjqn48zbxhtg0yw	12581	\N
12617_mljjqn48zbxhtg0yw_1773688111768	mljjqn48zbxhtg0yw	12617	\N
12640_mljjqn48zbxhtg0yw_1773688111769	mljjqn48zbxhtg0yw	12640	\N
12644_mljjqn48zbxhtg0yw_1773688111771	mljjqn48zbxhtg0yw	12644	\N
12692_mljjqn48zbxhtg0yw_1773688111785	mljjqn48zbxhtg0yw	12692	\N
12694_mljjqn48zbxhtg0yw_1773688111789	mljjqn48zbxhtg0yw	12694	\N
12698_mljjqn48zbxhtg0yw_1773688111795	mljjqn48zbxhtg0yw	12698	\N
12704_mljjqn48zbxhtg0yw_1773688111803	mljjqn48zbxhtg0yw	12704	\N
12737_mljjqn48zbxhtg0yw_1773688111815	mljjqn48zbxhtg0yw	12737	\N
12744_mljjqn48zbxhtg0yw_1773688111819	mljjqn48zbxhtg0yw	12744	\N
12747_mljjqn48zbxhtg0yw_1773688111821	mljjqn48zbxhtg0yw	12747	\N
12754_mljjqn48zbxhtg0yw_1773688111823	mljjqn48zbxhtg0yw	12754	\N
12771_mljjqn48zbxhtg0yw_1773688111831	mljjqn48zbxhtg0yw	12771	\N
12777_mljjqn48zbxhtg0yw_1773688111833	mljjqn48zbxhtg0yw	12777	\N
12782_mljjqn48zbxhtg0yw_1773688111835	mljjqn48zbxhtg0yw	12782	\N
12783_mljjqn48zbxhtg0yw_1773688111837	mljjqn48zbxhtg0yw	12783	\N
12862_mljjqn48zbxhtg0yw_1773688111887	mljjqn48zbxhtg0yw	12862	\N
12864_mljjqn48zbxhtg0yw_1773688111888	mljjqn48zbxhtg0yw	12864	\N
12865_mljjqn48zbxhtg0yw_1773688111893	mljjqn48zbxhtg0yw	12865	\N
12877_mljjqn48zbxhtg0yw_1773688111904	mljjqn48zbxhtg0yw	12877	\N
12881_mljjqn48zbxhtg0yw_1773688111910	mljjqn48zbxhtg0yw	12881	\N
12883_mljjqn48zbxhtg0yw_1773688111912	mljjqn48zbxhtg0yw	12883	\N
12884_mljjqn48zbxhtg0yw_1773688111913	mljjqn48zbxhtg0yw	12884	\N
12885_mljjqn48zbxhtg0yw_1773688111915	mljjqn48zbxhtg0yw	12885	\N
12889_mljjqn48zbxhtg0yw_1773688111918	mljjqn48zbxhtg0yw	12889	\N
12905_mljjqn48zbxhtg0yw_1773688111925	mljjqn48zbxhtg0yw	12905	\N
12907_mljjqn48zbxhtg0yw_1773688111927	mljjqn48zbxhtg0yw	12907	\N
12908_mljjqn48zbxhtg0yw_1773688111929	mljjqn48zbxhtg0yw	12908	\N
12909_mljjqn48zbxhtg0yw_1773688111930	mljjqn48zbxhtg0yw	12909	\N
12920_mljjqn48zbxhtg0yw_1773688111943	mljjqn48zbxhtg0yw	12920	\N
12931_mljjqn48zbxhtg0yw_1773688111950	mljjqn48zbxhtg0yw	12931	\N
12943_mljjqn48zbxhtg0yw_1773688111962	mljjqn48zbxhtg0yw	12943	\N
12959_mljjqn48zbxhtg0yw_1773688111973	mljjqn48zbxhtg0yw	12959	\N
12960_mljjqn48zbxhtg0yw_1773688111974	mljjqn48zbxhtg0yw	12960	\N
12888_mljjqn48zbxhtg0yw_1773693752916	mljjqn48zbxhtg0yw	12888	\N
12888_mljjrcujmtckild4r_1773693752930	mljjrcujmtckild4r	12888	\N
12935_mljjqn48zbxhtg0yw_1773693789605	mljjqn48zbxhtg0yw	12935	\N
12935_mljjrcujmtckild4r_1773693789606	mljjrcujmtckild4r	12935	\N
12693_mljjqn48zbxhtg0yw_1773754949463	mljjqn48zbxhtg0yw	12693	\N
12693_mljjrcujmtckild4r_1773754949477	mljjrcujmtckild4r	12693	\N
\.


--
-- TOC entry 5227 (class 0 OID 16448)
-- Dependencies: 224
-- Data for Name: correria_novedades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.correria_novedades (id, correria_id, contenido, created_at) FROM stdin;
1	mljjqn48zbxhtg0yw	Pedido de Yubernei Largacha de Raul no se despacho porque no se autorizó nunca el despacho por parte del vendedor.	2026-03-13 15:18:34.368158
\.


--
-- TOC entry 5229 (class 0 OID 16458)
-- Dependencies: 226
-- Data for Name: correrias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.correrias (id, name, year, active, created_at) FROM stdin;
mljjqn48zbxhtg0yw	Inicio de año	2026	1	2026-02-12 14:20:52
mljjrcujmtckild4r	Madres	2026	1	2026-02-12 14:21:25
\.


--
-- TOC entry 5230 (class 0 OID 16467)
-- Dependencies: 227
-- Data for Name: delivery_dates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.delivery_dates (id, confeccionista_id, reference_id, quantity, send_date, expected_date, delivery_date, process, observation, created_at, created_by) FROM stdin;
\.


--
-- TOC entry 5231 (class 0 OID 16479)
-- Dependencies: 228
-- Data for Name: disenadoras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.disenadoras (id, nombre, cedula, telefono, activa, created_at, updated_at) FROM stdin;
23e36d4f-0002-41d8-b861-99e68b9992e3	prueba	121231	321311	t	2026-02-23 11:02:26.428689	2026-02-23 11:02:26.428689
d7b10d30-2d16-40b1-890a-3c1543ddbc8a	Martha Ramirez	43556171	3203837430	t	2026-03-11 16:48:48.049875	2026-03-11 16:48:48.049875
2b241a44-34aa-4493-bfd1-78ad575ecbcc	Isabel Montoya	1033649051	3148470510	t	2026-03-11 16:50:53.79764	2026-03-11 16:50:53.79764
ce75694c-000d-4b9a-a5fe-0ff716248e08	Jackeline Perea	43925256	3116142944	t	2026-03-11 16:51:51.767929	2026-03-11 16:51:51.767929
0caa8b4b-dc19-4a79-a01d-468b050fa1bd	Maria Mercedes	21527566	3148577341	t	2026-03-11 16:52:37.01113	2026-03-11 16:52:37.01113
\.


--
-- TOC entry 5233 (class 0 OID 16489)
-- Dependencies: 230
-- Data for Name: dispatch_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dispatch_items (id, dispatch_id, reference, quantity, sale_price) FROM stdin;
60	mm2cqrwaubyqhh3is	12945	168	14000.00
61	mm2cqrwaubyqhh3is	12860	168	14000.00
62	mm2cqrwaubyqhh3is	12665	54	14000.00
63	mm2cqrwaubyqhh3is	12897	138	16000.00
64	mm2cqrwaubyqhh3is	12876	168	16000.00
65	mm3i59dj2t7a7x8dy	12877	168	16000.00
66	mm3i59dj2t7a7x8dy	12864	125	16000.00
67	mm3i59dj2t7a7x8dy	12888	168	16000.00
68	mm3i59dj2t7a7x8dy	12871	135	16000.00
69	mm3i59dj2t7a7x8dy	12911	168	16000.00
70	mm3i59dj2t7a7x8dy	12861	108	16000.00
71	mm3i59dj2t7a7x8dy	12924	47	19000.00
72	mm3i59dj2t7a7x8dy	12955	37	19000.00
73	mm3i59dj2t7a7x8dy	12919	48	19000.00
74	mm3i59dj2t7a7x8dy	12960	60	35000.00
820	mmv30yndburn5c2fs	12877	17	18900.00
821	mmv30yndburn5c2fs	12920	18	20900.00
822	mmv30yndburn5c2fs	13013	18	22900.00
823	mmv30yndburn5c2fs	12609	15	23900.00
824	mmv30yndburn5c2fs	12888	17	18900.00
825	mmv30yndburn5c2fs	12579	12	39900.00
826	mmv30yndburn5c2fs	13104	12	35900.00
847	mmw9ing3b51mv35fc	12884	18	19900.00
848	mmw9ing3b51mv35fc	13010	18	27900.00
849	mmw9ing3b51mv35fc	13013	18	21900.00
88	mm3ia6pyad0jlmyz1	12909	18	23900.00
89	mm3ia6pyad0jlmyz1	12911	18	18900.00
90	mm3ia6pyad0jlmyz1	12919	18	24900.00
671	mm3jxvg8709ja27ly	12805	6	19900.00
672	mm3jxvg8709ja27ly	12744	6	19900.00
673	mm3jxvg8709ja27ly	12913	6	29900.00
674	mm3jxvg8709ja27ly	12872	6	24900.00
675	mm3jzc1nv1zmxutin	12909	9	23900.00
676	mm3jzc1nv1zmxutin	12873	8	22900.00
677	mm3jzc1nv1zmxutin	12883	9	24900.00
678	mm3jsyw9y49qmhcwt	12698	12	21900.00
679	mm3jsyw9y49qmhcwt	12737	12	22900.00
680	mm3jsyw9y49qmhcwt	12754	12	16900.00
681	mm3jsyw9y49qmhcwt	12876	12	19900.00
682	mm3jsyw9y49qmhcwt	12805	6	19900.00
683	mm3jsyw9y49qmhcwt	12744	12	19900.00
684	mm3jq8fsf12q2vqq1	12698	12	21900.00
685	mm3jq8fsf12q2vqq1	12771	12	16900.00
133	mm3j0wiiw8hw96kht	12952	26	26900.00
134	mm3j0wiiw8hw96kht	12893	15	24900.00
135	mm3j0wiiw8hw96kht	12934	12	24900.00
136	mm3j0wiiw8hw96kht	12898	16	24900.00
137	mm3j37hjo83f6f3qp	12129	11	27900.00
138	mm3j37hjo83f6f3qp	12694	11	24900.00
139	mm3j37hjo83f6f3qp	12825	7	22900.00
140	mm3j37hjo83f6f3qp	12828	11	14900.00
141	mm3j37hjo83f6f3qp	12834	6	17900.00
142	mm3j37hjo83f6f3qp	12835	11	20900.00
143	mm3j37hjo83f6f3qp	12836	8	21900.00
144	mm3j37hjo83f6f3qp	12837	11	27900.00
145	mm3j37hjo83f6f3qp	12841	13	20900.00
686	mm3jq8fsf12q2vqq1	12877	12	19900.00
687	mm3jq8fsf12q2vqq1	12704	12	29900.00
688	mm3jq8fsf12q2vqq1	12754	12	16900.00
156	mm3j5ydlutatddpm6	12870	9	35900.00
157	mm3j5ydlutatddpm6	12907	9	28900.00
827	mmv32fx8q93ahsptc	13013	18	23900.00
828	mmv32fx8q93ahsptc	13010	18	29900.00
689	mm3jq8fsf12q2vqq1	12865	12	16900.00
690	mm3jq8fsf12q2vqq1	12805	6	19900.00
691	mm3jq8fsf12q2vqq1	12644	12	24900.00
692	mm3jq8fsf12q2vqq1	12883	12	24900.00
693	mm3jq8fsf12q2vqq1	12909	12	23900.00
694	mm3jq8fsf12q2vqq1	12744	12	19900.00
829	mmv32fx8q93ahsptc	12884	18	21900.00
830	mmv339lkirv0jhd36	12962	9	43900.00
831	mmv339lkirv0jhd36	13107	9	28900.00
832	mmv339lkirv0jhd36	13013	9	22900.00
833	mmv339lkirv0jhd36	12609	9	23900.00
834	mmv349hes2rmnigca	12579	24	38000.00
835	mmv349hes2rmnigca	12712	24	26900.00
836	mmv349hes2rmnigca	12971	24	35000.00
837	mmv349hes2rmnigca	12969	24	21900.00
838	mmv349hes2rmnigca	12777	24	13900.00
839	mmv349hes2rmnigca	13013	24	22000.00
840	mmv35pslnzffrk5er	12962	12	43900.00
841	mmv35pslnzffrk5er	13107	12	28900.00
842	mmv35pslnzffrk5er	13013	12	22900.00
843	mmv35pslnzffrk5er	12609	12	23900.00
759	mm3j459dl23fwhf8a	12704	10	29900.00
760	mm3j459dl23fwhf8a	12782	10	17900.00
761	mm3j459dl23fwhf8a	12880	10	24900.00
762	mm3j459dl23fwhf8a	12882	10	23900.00
763	mm3igu5qlp2m14s7a	12708	30	24900.00
208	mm3js04fr6s6gkh2a	12945	12	19900.00
209	mm3js04fr6s6gkh2a	12924	12	21900.00
210	mm3js04fr6s6gkh2a	12860	12	16900.00
211	mm3js04fr6s6gkh2a	12911	12	18900.00
212	mm3js04fr6s6gkh2a	12908	12	28900.00
764	mm3igu5qlp2m14s7a	12882	24	23900.00
765	mm3igu5qlp2m14s7a	12883	24	24900.00
766	mm3igu5qlp2m14s7a	12704	24	29900.00
222	mm3jx4y9rjzbowh51	12909	4	23900.00
223	mm3jx4y9rjzbowh51	12911	4	18900.00
224	mm3jx4y9rjzbowh51	12882	4	23900.00
225	mm3jx4y9rjzbowh51	12885	4	23900.00
226	mm3jx4y9rjzbowh51	12782	4	17900.00
227	mm3jx4y9rjzbowh51	12871	4	19900.00
228	mm3jx4y9rjzbowh51	12876	4	19900.00
229	mm3jx4y9rjzbowh51	12945	4	19900.00
230	mm3jx4y9rjzbowh51	12919	4	25900.00
231	mm3jx4y9rjzbowh51	12880	4	24900.00
232	mm3jx4y9rjzbowh51	12913	4	29900.00
233	mm3jx4y9rjzbowh51	12699	4	24900.00
234	mm3jx4y9rjzbowh51	12744	4	19900.00
235	mm3jx4y9rjzbowh51	12889	4	28900.00
236	mm3jx4y9rjzbowh51	12897	4	19900.00
767	mm3igu5qlp2m14s7a	12366	24	19900.00
768	mm3igu5qlp2m14s7a	12754	24	16900.00
769	mm3igu5qlp2m14s7a	12000	27	49900.00
770	mm3igu5qlp2m14s7a	12771	24	16900.00
771	mm3igu5qlp2m14s7a	12574	24	25900.00
772	mm3igu5qlp2m14s7a	12680	24	16900.00
773	mm3i94vqmdl6g4qmc	12882	18	23900.00
774	mm3i94vqmdl6g4qmc	12872	18	23900.00
775	mm3i94vqmdl6g4qmc	12835	12	19900.00
776	mm3i94vqmdl6g4qmc	12831	12	23900.00
777	mm3i94vqmdl6g4qmc	12836	12	20900.00
778	mm3i94vqmdl6g4qmc	12855	15	23900.00
779	mm3i94vqmdl6g4qmc	12129	12	26900.00
780	mm3i94vqmdl6g4qmc	12841	12	19900.00
781	mm3i94vqmdl6g4qmc	12834	12	16900.00
782	mm3i94vqmdl6g4qmc	12825	12	21900.00
783	mm3i94vqmdl6g4qmc	12818	15	40900.00
784	mm3i94vqmdl6g4qmc	12821	9	33900.00
785	mm3i94vqmdl6g4qmc	12840	13	33900.00
786	mm3idufo09vdzxxlh	12882	18	23900.00
787	mm3idufo09vdzxxlh	12872	18	23900.00
788	mm3idufo09vdzxxlh	12835	12	19900.00
789	mm3idufo09vdzxxlh	12831	12	23900.00
790	mm3idufo09vdzxxlh	12836	12	20900.00
791	mm3idufo09vdzxxlh	12855	15	23900.00
792	mm3idufo09vdzxxlh	12129	12	26900.00
793	mm3idufo09vdzxxlh	12841	12	19900.00
794	mm3idufo09vdzxxlh	12834	12	16900.00
795	mm3idufo09vdzxxlh	12825	12	21900.00
796	mm3idufo09vdzxxlh	12818	14	40900.00
797	mm3idufo09vdzxxlh	12821	9	33900.00
798	mm3idufo09vdzxxlh	12840	14	33900.00
799	mmfa8vvx6ednbbcwh	12950	12	27900.00
800	mmfa8vvx6ednbbcwh	12907	18	28900.00
801	mmfa8vvx6ednbbcwh	12908	18	28900.00
818	mmez59uz9h97ig6en	12881	12	33900.00
280	mm3k88u9mvxzqlh7r	12908	24	28900.00
281	mm3k88u9mvxzqlh7r	12919	24	25900.00
282	mm3k88u9mvxzqlh7r	12860	24	16900.00
283	mm3k88u9mvxzqlh7r	12924	12	21900.00
819	mmez59uz9h97ig6en	12905	12	34900.00
695	mm3jaxcw505c4h0ex	12885	12	23900.00
696	mm3jaxcw505c4h0ex	12889	12	28900.00
697	mm3jaxcw505c4h0ex	12909	12	23900.00
698	mm3j4tv3kyetvp56u	12885	10	23900.00
320	mm3kj9q05uf3ux0v7	12922	12	21900.00
321	mm3kj9q05uf3ux0v7	12926	12	27900.00
322	mm3kj9q05uf3ux0v7	12881	9	33900.00
323	mm3kj9q05uf3ux0v7	12933	14	34900.00
324	mm3kj9q05uf3ux0v7	12870	15	35900.00
699	mm3j4tv3kyetvp56u	12889	10	28900.00
700	mm3j4tv3kyetvp56u	12909	10	23900.00
701	mm3kkpucu97l4e3en	12782	24	17900.00
702	mm3kkpucu97l4e3en	12883	24	24900.00
703	mm3kkpucu97l4e3en	12873	24	22900.00
704	mm3khai0anlcogdc3	12865	12	16900.00
705	mm3khai0anlcogdc3	12871	12	19900.00
706	mm3khai0anlcogdc3	12889	18	28900.00
707	mm3iwuz4mqe8jnigt	12889	24	28900.00
708	mm3iwuz4mqe8jnigt	12862	24	23900.00
709	mm3iwuz4mqe8jnigt	12880	24	24900.00
710	mm3iwuz4mqe8jnigt	12885	24	23900.00
711	mm3joefqjz2omk117	12880	12	24900.00
712	mm3joefqjz2omk117	12693	12	25900.00
342	mm3l0uxit5mxrenqh	12805	4	19900.00
343	mm3l0uxit5mxrenqh	12943	4	19900.00
344	mm3l0uxit5mxrenqh	12898	4	24900.00
345	mm3l0uxit5mxrenqh	12951	4	27900.00
346	mm3l0uxit5mxrenqh	12952	4	26900.00
347	mm3l0uxit5mxrenqh	12937	4	14900.00
348	mm3l0uxit5mxrenqh	12873	4	22900.00
349	mm3l0uxit5mxrenqh	12906	4	28900.00
713	mm3joefqjz2omk117	12698	12	21900.00
714	mm3kgq0sujpkt8b1y	12885	12	23900.00
715	mm3kgq0sujpkt8b1y	12883	12	24900.00
716	mm3kgq0sujpkt8b1y	12699	12	24900.00
717	mm3kgq0sujpkt8b1y	12882	12	23900.00
718	mm3kgq0sujpkt8b1y	12873	12	22900.00
719	mm3kgq0sujpkt8b1y	12884	12	21900.00
720	mm3kgq0sujpkt8b1y	12640	12	24900.00
358	mm56exk9xgk5t4yyu	12943	138	16000.00
359	mm56exk9xgk5t4yyu	12893	48	19000.00
360	mm56exk9xgk5t4yyu	12959	60	35000.00
721	mm3kgq0sujpkt8b1y	12617	18	35900.00
722	mm3kgq0sujpkt8b1y	12581	18	32900.00
723	mm3kgq0sujpkt8b1y	12744	18	19900.00
724	mm3kexsia9bys3xsw	12698	12	21900.00
725	mm3kexsia9bys3xsw	12777	12	14900.00
726	mm3kexsia9bys3xsw	12679	12	23900.00
727	mm3kexsia9bys3xsw	12737	12	22900.00
728	mm3kexsia9bys3xsw	12704	12	29900.00
729	mm3kexsia9bys3xsw	12694	12	24900.00
730	mm3kexsia9bys3xsw	12574	12	25900.00
731	mm3kexsia9bys3xsw	12754	12	16900.00
732	mm3kexsia9bys3xsw	12805	12	19900.00
733	mm3kexsia9bys3xsw	12747	12	31900.00
734	mm3j7hupgo2gu8l94	12129	12	27900.00
735	mm3j7hupgo2gu8l94	12694	12	24900.00
736	mm3j7hupgo2gu8l94	12825	7	22900.00
737	mm3j7hupgo2gu8l94	12828	12	14900.00
738	mm3j7hupgo2gu8l94	12834	7	17900.00
739	mm3j7hupgo2gu8l94	12835	12	20900.00
740	mm3j7hupgo2gu8l94	12836	8	21900.00
741	mm3j7hupgo2gu8l94	12837	12	27900.00
742	mm3j7hupgo2gu8l94	12841	14	20900.00
743	mm3j98byzgb52xmth	12129	11	27900.00
744	mm3j98byzgb52xmth	12694	11	24900.00
745	mm3j98byzgb52xmth	12825	6	22900.00
386	mmanudpdqkcpojxyy	12951	4	27900.00
387	mmanudpdqkcpojxyy	12909	4	23900.00
388	mmanudpdqkcpojxyy	12747	4	31900.00
389	mmanudpdqkcpojxyy	12872	6	24900.00
390	mmanudpdqkcpojxyy	12926	4	27900.00
391	mmanudpdqkcpojxyy	12919	4	25900.00
392	mmanudpdqkcpojxyy	12873	4	22900.00
393	mmanudpdqkcpojxyy	12923	4	24900.00
394	mmanudpdqkcpojxyy	12862	4	23900.00
395	mmanudpdqkcpojxyy	12952	4	26900.00
396	mmanudpdqkcpojxyy	12911	4	18900.00
397	mmanudpdqkcpojxyy	12937	4	14900.00
398	mmanudpdqkcpojxyy	12885	4	23900.00
399	mmanudpdqkcpojxyy	12883	4	24900.00
400	mmanudpdqkcpojxyy	12877	4	19900.00
401	mmanudpdqkcpojxyy	12898	4	24900.00
402	mmanudpdqkcpojxyy	12945	4	19900.00
403	mmanudpdqkcpojxyy	12934	4	24900.00
404	mmanudpdqkcpojxyy	12897	4	19900.00
405	mmanudpdqkcpojxyy	12870	4	35900.00
406	mmanudpdqkcpojxyy	12924	4	21900.00
407	mmanudpdqkcpojxyy	12860	4	16900.00
408	mmanudpdqkcpojxyy	12884	4	21900.00
409	mmanudpdqkcpojxyy	12640	4	24900.00
410	mmanudpdqkcpojxyy	12921	4	24900.00
411	mmanudpdqkcpojxyy	12692	4	21900.00
412	mmanudpdqkcpojxyy	12783	4	17900.00
413	mmanudpdqkcpojxyy	12871	4	19900.00
746	mm3j98byzgb52xmth	12828	11	14900.00
747	mm3j98byzgb52xmth	12834	7	17900.00
748	mm3j98byzgb52xmth	12835	11	20900.00
749	mm3j98byzgb52xmth	12836	8	21900.00
750	mm3j98byzgb52xmth	12837	11	27900.00
751	mm3j98byzgb52xmth	12841	13	20900.00
802	mmfa88e80moomiaw5	12937	15	14900.00
803	mmfa88e80moomiaw5	12926	8	27900.00
804	mmfa88e80moomiaw5	12920	8	21900.00
805	mmfa88e80moomiaw5	12893	9	24900.00
806	mmez5wvax2e5v4v5w	12908	12	28900.00
807	mmez5wvax2e5v4v5w	12910	12	22900.00
808	mmez5wvax2e5v4v5w	12921	12	24900.00
809	mmez59uz9h97ig6en	12921	12	24900.00
810	mmez59uz9h97ig6en	12871	12	19900.00
811	mmez59uz9h97ig6en	12943	12	19900.00
812	mmez59uz9h97ig6en	12934	12	24900.00
813	mmez59uz9h97ig6en	12951	12	27900.00
814	mmez59uz9h97ig6en	12875	12	19900.00
815	mmez59uz9h97ig6en	12937	12	14900.00
816	mmez59uz9h97ig6en	12870	12	35900.00
817	mmez59uz9h97ig6en	12906	9	28900.00
460	mmt9ykh24jhmy9wyh	12959	24	37900.00
461	mmt9ykh24jhmy9wyh	13002	24	41900.00
462	mmt9ykh24jhmy9wyh	12498	24	21900.00
463	mmt9ykh24jhmy9wyh	12617	36	35900.00
464	mmt9ykh24jhmy9wyh	12581	36	32900.00
465	mmt9ykh24jhmy9wyh	12986	36	34900.00
466	mmta7tip2lfo08rya	13103	3	45900.00
467	mmta7tip2lfo08rya	12884	6	21900.00
468	mmta7tip2lfo08rya	12671	6	24900.00
469	mmta7tip2lfo08rya	12877	6	19900.00
470	mmta7tip2lfo08rya	12609	6	24900.00
471	mmta7tip2lfo08rya	12905	6	34900.00
472	mmta7tip2lfo08rya	12986	6	34900.00
473	mmta93e6euv4vooz6	12960	12	39900.00
474	mmta93e6euv4vooz6	13103	12	45900.00
475	mmta93e6euv4vooz6	12747	12	31900.00
476	mmta93e6euv4vooz6	12576	12	19900.00
477	mmta93e6euv4vooz6	12574	12	25900.00
483	mmtacllg4b8yja0ll	12692	20	21900.00
484	mmtacllg4b8yja0ll	12617	15	35900.00
485	mmtacllg4b8yja0ll	12579	12	39900.00
486	mmtacllg4b8yja0ll	12747	12	31900.00
487	mmtacllg4b8yja0ll	12771	15	16900.00
488	mmtacllg4b8yja0ll	12754	14	16900.00
489	mmtabn5b2psw6c7zw	12892	4	24900.00
490	mmtabn5b2psw6c7zw	12920	4	21900.00
491	mmtabn5b2psw6c7zw	12923	4	24900.00
492	mmtabn5b2psw6c7zw	12907	3	28900.00
493	mmtabn5b2psw6c7zw	12875	4	19900.00
494	mmtda7cyeig9hfibn	12771	36	14000.00
495	mmtda7cyeig9hfibn	12683	36	14000.00
496	mmtda7cyeig9hfibn	12782	36	14000.00
497	mmtda7cyeig9hfibn	12783	82	14000.00
498	mmtdrclsjox4t16qn	12864	48	16000.00
499	mmtdrclsjox4t16qn	12686	30	16000.00
500	mmtdrclsjox4t16qn	12909	48	16000.00
501	mmtdrclsjox4t16qn	12737	36	19000.00
502	mmtdrclsjox4t16qn	12692	36	19000.00
503	mmtdrclsjox4t16qn	12640	36	19000.00
504	mmtdrclsjox4t16qn	12885	15	19000.00
505	mmtdrclsjox4t16qn	12883	29	19000.00
506	mmtdrclsjox4t16qn	12862	36	19000.00
507	mmtdrclsjox4t16qn	13013	36	21000.00
508	mmtdrclsjox4t16qn	12704	36	21000.00
509	mmtdrclsjox4t16qn	12685	48	24000.00
510	mmtdrclsjox4t16qn	12644	48	24000.00
511	mmtdrclsjox4t16qn	12889	24	27000.00
512	mmtdrclsjox4t16qn	12747	36	29000.00
513	mmtdrclsjox4t16qn	12986	48	29900.00
514	mmtdrclsjox4t16qn	12581	36	29900.00
515	mmtdrclsjox4t16qn	12962	54	42000.00
516	mmtdrclsjox4t16qn	13002	54	42000.00
517	mmp5xs1boqtd6rt1k	12917	12	19900.00
518	mmp5xs1boqtd6rt1k	12920	12	21900.00
519	mmp5xs1boqtd6rt1k	12907	12	28900.00
520	mmp5yry490dshtc0p	12918	24	19900.00
521	mmp5zauvt5433mdr7	12950	12	27900.00
522	mmnwdji5xsoxrx2vo	12920	24	21900.00
523	mmnwdji5xsoxrx2vo	12917	24	19900.00
524	mmnwdji5xsoxrx2vo	12950	24	27900.00
525	mmnwchbgrjjvkeo0r	12908	12	28900.00
526	mmnwchbgrjjvkeo0r	12935	12	35900.00
527	mmnwaxiqtq70m7347	12950	18	27900.00
528	mmnwaxiqtq70m7347	12917	24	19900.00
529	mmnwaxiqtq70m7347	12920	24	21900.00
530	mmnw9o9s4phcont8a	12920	24	21900.00
531	mmnw9o9s4phcont8a	12907	24	28900.00
532	mmnw9o9s4phcont8a	12935	24	35900.00
533	mmnw9o9s4phcont8a	12917	24	19900.00
534	mmnw7t5wukrha2k1l	12920	12	21900.00
535	mmnw7t5wukrha2k1l	12892	12	24900.00
536	mmnw7t5wukrha2k1l	12917	12	19900.00
537	mmnw5uz5ynb1tc4j1	12892	24	24900.00
538	mmnw5uz5ynb1tc4j1	12918	28	19900.00
539	mmb0ntcjd88mt5c1a	12910	24	22900.00
540	mmb0ntcjd88mt5c1a	12950	24	27900.00
541	mmb0ntcjd88mt5c1a	12921	18	24900.00
542	mmancmbo8qna7ulnq	12937	24	14900.00
543	mmancmbo8qna7ulnq	12943	25	19900.00
544	mmancmbo8qna7ulnq	12921	13	24900.00
545	mm9fosxvx68nv1mo0	12905	10	34900.00
546	mm9fosxvx68nv1mo0	12937	10	14900.00
547	mm9fosxvx68nv1mo0	12910	10	22900.00
548	mm9fphsult009cvdr	12905	12	34900.00
549	mm9fphsult009cvdr	12937	12	14900.00
550	mm9fphsult009cvdr	12910	12	22900.00
551	mm9bjim16d7qqck29	12923	14	23900.00
552	mm9bjim16d7qqck29	12926	18	26900.00
553	mm9bijuzmofqzb41u	12923	14	23900.00
554	mm9bijuzmofqzb41u	12926	18	26900.00
555	mm9bhcaasyq4ggxoq	12943	24	19900.00
556	mm9bhcaasyq4ggxoq	12923	24	24900.00
557	mm9bhcaasyq4ggxoq	12875	24	19900.00
558	mm9bhcaasyq4ggxoq	12937	24	14900.00
559	mm9blqhknb861bm2v	12943	25	19900.00
560	mm9blqhknb861bm2v	12875	24	19900.00
561	mm9blqhknb861bm2v	12937	24	14900.00
562	mm9bkdst6k21tswkd	12934	12	24900.00
563	mm9bkdst6k21tswkd	12898	12	24900.00
564	mm9bkdst6k21tswkd	12943	12	19900.00
565	mm9bkdst6k21tswkd	12893	12	24900.00
566	mm9bkdst6k21tswkd	12875	12	19900.00
567	mm3kx4lr1n8azuu6v	12943	12	19900.00
568	mm3kx4lr1n8azuu6v	12922	12	21900.00
569	mm3kx4lr1n8azuu6v	12893	12	24900.00
570	mm3l1t5hjgali24ts	12893	12	24900.00
571	mm3l3zvlu15hgpefm	12898	6	24900.00
572	mm3l3zvlu15hgpefm	12934	6	24900.00
573	mm3l3zvlu15hgpefm	12906	6	28900.00
574	mm3l3zvlu15hgpefm	12881	6	33900.00
575	mm3l3zvlu15hgpefm	12937	6	14900.00
576	mm3l3zvlu15hgpefm	12952	6	26900.00
577	mm3l3zvlu15hgpefm	12926	6	27900.00
578	mm3kn639neyfsmx9p	12922	24	21900.00
579	mm3kn639neyfsmx9p	12893	16	24900.00
580	mm3kn639neyfsmx9p	12926	23	27900.00
581	mm3kn639neyfsmx9p	12952	26	26900.00
582	mm3kagls891rwl801	12934	14	24900.00
583	mm3kagls891rwl801	12898	18	24900.00
584	mm3kagls891rwl801	12952	24	26900.00
585	mm3kagls891rwl801	12893	24	24900.00
586	mm3jcfl13krxay0mi	12870	11	35900.00
587	mm3jcfl13krxay0mi	12907	11	28900.00
588	mm3jnr1m8ekxcb7co	12906	12	28900.00
589	mm3jnr1m8ekxcb7co	12881	12	33900.00
590	mm3juel6d3ouyxaax	12911	12	18900.00
591	mm3juel6d3ouyxaax	12933	12	34900.00
592	mm3juel6d3ouyxaax	12907	12	28900.00
593	mm3k04cmn5mhk6of4	12951	9	27900.00
594	mm3k04cmn5mhk6of4	12919	8	25900.00
595	mm3k04cmn5mhk6of4	12924	9	21900.00
596	mm3k04cmn5mhk6of4	12871	8	19900.00
597	mm3j02cd9yncqs1er	12906	11	28900.00
598	mm3j02cd9yncqs1er	12933	9	34900.00
599	mm3j02cd9yncqs1er	12951	17	27900.00
600	mm3kmeo0pz35brof4	12366	27	19900.00
601	mm3kmeo0pz35brof4	12871	12	19900.00
602	mm3kmeo0pz35brof4	12951	20	27900.00
603	mm3kmeo0pz35brof4	12911	24	18900.00
604	mm3k9fjiwkoe2ewy2	12881	18	33900.00
605	mm3k9fjiwkoe2ewy2	12933	12	34900.00
606	mm3k9fjiwkoe2ewy2	12906	18	28900.00
607	mm3k9fjiwkoe2ewy2	12951	24	27900.00
608	mm3k9fjiwkoe2ewy2	12871	12	19900.00
609	mm3k2akfj3mwhs0n7	12933	12	34900.00
610	mm3k2akfj3mwhs0n7	12870	9	35900.00
611	mm3k2akfj3mwhs0n7	12881	9	33900.00
612	mm3k2akfj3mwhs0n7	12871	12	19900.00
613	mm3j5fgz6li57ahwu	12871	10	19900.00
614	mm3j5fgz6li57ahwu	12876	10	19900.00
615	mm3j5fgz6li57ahwu	12908	10	28900.00
616	mm3jbrhedvyia6ukq	12871	12	19900.00
617	mm3jbrhedvyia6ukq	12876	12	19900.00
618	mm3jbrhedvyia6ukq	12908	12	28900.00
619	mm3jykw3cwsyjtm43	12945	6	19900.00
620	mm3jykw3cwsyjtm43	12908	6	28900.00
621	mm3jykw3cwsyjtm43	12924	6	21900.00
622	mm3jykw3cwsyjtm43	12911	6	18900.00
623	mm3jykw3cwsyjtm43	12919	6	25900.00
624	mm3iemt6169b0qj3d	12909	18	23900.00
625	mm3iemt6169b0qj3d	12911	18	18900.00
626	mm3iemt6169b0qj3d	12919	18	24900.00
627	mm3izdvp8plxj7r59	12919	20	25900.00
628	mm3izdvp8plxj7r59	12911	24	18900.00
629	mm3izdvp8plxj7r59	12860	24	16900.00
630	mm3izdvp8plxj7r59	12945	24	19900.00
631	mm3k1kkgx2kxtlfzm	12640	12	24900.00
632	mm3k1kkgx2kxtlfzm	12884	12	21900.00
633	mm3k1kkgx2kxtlfzm	12888	12	19900.00
634	mm3k1kkgx2kxtlfzm	12877	12	19900.00
635	mm3k1kkgx2kxtlfzm	12771	12	16900.00
636	mm3kieed1nuu0hmrq	12955	12	22900.00
637	mm3kieed1nuu0hmrq	12909	12	23900.00
638	mm3kieed1nuu0hmrq	12911	12	18900.00
639	mm3kieed1nuu0hmrq	12860	12	16900.00
640	mm3klig50tmfwbi42	12860	24	16900.00
641	mm3klig50tmfwbi42	12888	24	19900.00
642	mm3klig50tmfwbi42	12913	25	29900.00
643	mm3k76zavwgz9j0j8	12679	24	23900.00
644	mm3k76zavwgz9j0j8	12680	18	16900.00
645	mm3k76zavwgz9j0j8	12877	24	19900.00
646	mm3k76zavwgz9j0j8	12889	24	28900.00
647	mm3k76zavwgz9j0j8	12747	24	31900.00
648	mm3k76zavwgz9j0j8	12872	21	24900.00
649	mm3k76zavwgz9j0j8	12909	24	23900.00
650	mm3k76zavwgz9j0j8	12913	19	29900.00
651	mm3k76zavwgz9j0j8	12862	24	23900.00
652	mm3k76zavwgz9j0j8	12880	24	24900.00
653	mm3k76zavwgz9j0j8	12873	22	22900.00
654	mm3k76zavwgz9j0j8	12882	20	23900.00
655	mm3k76zavwgz9j0j8	12885	24	23900.00
656	mm3k76zavwgz9j0j8	12884	24	21900.00
657	mm3k76zavwgz9j0j8	12782	24	17900.00
658	mm3k76zavwgz9j0j8	12783	24	17900.00
659	mm3k76zavwgz9j0j8	12888	24	19900.00
660	mm3k76zavwgz9j0j8	12876	24	19900.00
661	mm3iyf5g04b2whmjn	12913	24	29900.00
662	mm3iyf5g04b2whmjn	12888	24	19900.00
663	mm3iyf5g04b2whmjn	12876	24	19900.00
664	mm3iyf5g04b2whmjn	12877	24	19900.00
665	mm3iyf5g04b2whmjn	12897	24	19900.00
666	mm3jr8ox2i4kj6bgs	12897	12	19900.00
667	mm3jr8ox2i4kj6bgs	12876	12	19900.00
668	mm3jr8ox2i4kj6bgs	12884	12	21900.00
669	mm3jr8ox2i4kj6bgs	12880	12	24900.00
670	mm3jr8ox2i4kj6bgs	12913	12	29900.00
752	mm3ja6nt56tf7nb5q	12782	12	17900.00
753	mm3ja6nt56tf7nb5q	12880	12	24900.00
754	mm3ja6nt56tf7nb5q	12882	12	23900.00
850	mmwhw5qxrb4bmldh5	12712	24	25900.00
851	mmwhw5qxrb4bmldh5	12960	13	39900.00
852	mmwhw5qxrb4bmldh5	13104	36	35900.00
853	mmwhw5qxrb4bmldh5	13103	41	39900.00
854	mmwhw5qxrb4bmldh5	12969	36	21900.00
855	mmwhw5qxrb4bmldh5	12920	36	21900.00
856	mmwhxo6dzulrjzrj5	13107	12	29900.00
857	mmwhxo6dzulrjzrj5	12652	24	29900.00
858	mmwhxo6dzulrjzrj5	12579	24	39900.00
859	mmwhxo6dzulrjzrj5	13014	24	29900.00
860	mmwhxo6dzulrjzrj5	13011	24	29900.00
861	mmwhxo6dzulrjzrj5	12905	18	34900.00
862	mmwhxo6dzulrjzrj5	12971	24	36900.00
\.


--
-- TOC entry 5234 (class 0 OID 16500)
-- Dependencies: 231
-- Data for Name: dispatches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dispatches (id, client_id, correria_id, invoice_no, remission_no, dispatched_by, created_at, checked_by) FROM stdin;
mm2cqrwaubyqhh3is	300	mljjqn48zbxhtg0yw	 -	 -	Admin Principal	2026-02-25 18:12:38.461	0
mm3i59dj2t7a7x8dy	300	mljjqn48zbxhtg0yw	 -	 -	Admin Principal	2026-02-26 13:31:38.554	0
mm3ia6pyad0jlmyz1	179	mljjqn48zbxhtg0yw	FE-7205	RM-7643	Admin Principal	2026-02-26 13:35:28.391	0
mm3j0wiiw8hw96kht	232	mljjqn48zbxhtg0yw	FE-7232	RM-7687	Jhon Montoya	2026-02-26 13:56:14.876	0
mm3j37hjo83f6f3qp	74	mljjqn48zbxhtg0yw	FE-7162	 -	Jhon Montoya	2026-02-26 13:58:02.408	0
mm3j5ydlutatddpm6	305	mljjqn48zbxhtg0yw	FE-7229	 -	Jhon Montoya	2026-02-26 14:00:10.572	0
mm3js04fr6s6gkh2a	138	mljjqn48zbxhtg0yw	FE-7203	RM-7641	Jhon Montoya	2026-02-26 14:17:19.264	0
mm3jx4y9rjzbowh51	216	mljjqn48zbxhtg0yw	 -	RM-7663	Jhon Montoya	2026-02-26 14:21:18.802	0
mm3k88u9mvxzqlh7r	59	mljjqn48zbxhtg0yw	FE-7201	RM-7639	Jhon Montoya	2026-02-26 14:29:57.06	0
mm3kj9q05uf3ux0v7	270	mljjqn48zbxhtg0yw	FE-7227	 -	Jhon Montoya	2026-02-26 14:38:31.417	0
mm3l0uxit5mxrenqh	216	mljjqn48zbxhtg0yw	 -	RM-7695	Jhon Montoya	2026-02-26 14:52:12.055	0
mm56exk9xgk5t4yyu	300	mljjqn48zbxhtg0yw	 -	 -	Jhon Montoya	2026-02-27 17:38:46.762	0
mmanudpdqkcpojxyy	296	mljjqn48zbxhtg0yw	 -	RM-7701	Jhon Montoya	2026-03-03 13:45:31.873	0
mmp5zauvt5433mdr7	258	mljjqn48zbxhtg0yw	FE-7272	 -	Jhon Montoya	2026-03-13 17:22:01.016	JHON - NURY
mmnwdji5xsoxrx2vo	81	mljjqn48zbxhtg0yw	FE-7264	FE-7265	Jhon Montoya	2026-03-12 20:05:23.07	JHON - NURY
mmnwchbgrjjvkeo0r	264	mljjqn48zbxhtg0yw	FE-7263	RM-7721	Jhon Montoya	2026-03-12 20:04:33.581	JHON - NURY
mmnwaxiqtq70m7347	232	mljjqn48zbxhtg0yw	FE-7261	RM-7719	Jhon Montoya	2026-03-12 20:03:21.267	JHON - NURY
mmnw9o9s4phcont8a	59	mljjqn48zbxhtg0yw	FE-7262	RM-7720	Jhon Montoya	2026-03-12 20:02:22.624	JHON - NURY
mmnw5uz5ynb1tc4j1	232	mljjqn48zbxhtg0yw	FE-7270	RM-7732	Jhon Montoya	2026-03-12 19:59:24.691	NURY - SANDRA
mmb0ntcjd88mt5c1a	59	mljjqn48zbxhtg0yw	FE-7251	RM-7703	Jhon Montoya	2026-03-03 19:44:20.564	JHON - NURY
mmancmbo8qna7ulnq	232	mljjqn48zbxhtg0yw	FE-7250	RM-7702	Jhon Montoya	2026-03-03 13:31:43.238	NURY - JAIME
mm9fosxvx68nv1mo0	305	mljjqn48zbxhtg0yw	FE-7249	 -	Jhon Montoya	2026-03-02 17:09:28.582	NURY - DAVID
mm9fphsult009cvdr	231	mljjqn48zbxhtg0yw	FE-7248	 -	Jhon Montoya	2026-03-02 17:10:00.799	NURY - DAVID
mm9bijuzmofqzb41u	177	mljjqn48zbxhtg0yw	FE-7246	RM-7699	Jhon Montoya	2026-03-02 15:12:38.412	NURY - DAVID
mm9bhcaasyq4ggxoq	59	mljjqn48zbxhtg0yw	FE-7245	RM-7698	Jhon Montoya	2026-03-02 15:11:41.941	NURY - DAVID
mm9blqhknb861bm2v	81	mljjqn48zbxhtg0yw	FE-7243	FE-7244	Jhon Montoya	2026-03-02 15:15:06.97	NURY - DAVID
mm9bkdst6k21tswkd	270	mljjqn48zbxhtg0yw	FE-7242	 -	Jhon Montoya	2026-03-02 15:14:03.87	NURY - DAVID
mm3kx4lr1n8azuu6v	50	mljjqn48zbxhtg0yw	FE-7241	RM-7697	Jhon Montoya	2026-02-26 14:49:17.968	NURY - FELIPE
mm3l3zvlu15hgpefm	158	mljjqn48zbxhtg0yw	FE-7239	 -	Jhon Montoya	2026-02-26 14:54:38.434	NURY - FELIPE
mm3kn639neyfsmx9p	81	mljjqn48zbxhtg0yw	FE-7231	FE-7234	Jhon Montoya	2026-02-26 14:41:33.334	NURY - JAIME
mm3kagls891rwl801	59	mljjqn48zbxhtg0yw	FE-7233	RM-7688	Jhon Montoya	2026-02-26 14:31:40.432	NURY - JAIME
mm3jcfl13krxay0mi	231	mljjqn48zbxhtg0yw	FE-7228	 -	Jhon Montoya	2026-02-26 14:05:12.806	NURY - JAIME
mm3jnr1m8ekxcb7co	258	mljjqn48zbxhtg0yw	FE-7226	 -	Jhon Montoya	2026-02-26 14:14:00.875	NURY - FELIPE
mm3k04cmn5mhk6of4	107	mljjqn48zbxhtg0yw	FE-7220	RM-7670	Jhon Montoya	2026-02-26 14:23:37.994	NURY - JAIME
mm3j02cd9yncqs1er	232	mljjqn48zbxhtg0yw	FE-7219	RM-7669	Jhon Montoya	2026-02-26 13:55:35.775	NURY - JAIME
mm3kmeo0pz35brof4	81	mljjqn48zbxhtg0yw	FE-7217	FE-7218	Jhon Montoya	2026-02-26 14:40:57.793	NURY - FELIPE
mm3k9fjiwkoe2ewy2	59	mljjqn48zbxhtg0yw	FE-7216	RM-7666	Jhon Montoya	2026-02-26 14:30:52.4	NURY - FELIPE
mm3k2akfj3mwhs0n7	50	mljjqn48zbxhtg0yw	FE-7215	RM-7665	Jhon Montoya	2026-02-26 14:25:19.36	NURY - FELIPE
mm3j5fgz6li57ahwu	305	mljjqn48zbxhtg0yw	FE-7214	 -	Jhon Montoya	2026-02-26 13:59:46.068	NURY - FELIPE
mm3jykw3cwsyjtm43	158	mljjqn48zbxhtg0yw	FE-7207	 -	Jhon Montoya	2026-02-26 14:22:26.117	NURY - JAIME
mm3iemt6169b0qj3d	177	mljjqn48zbxhtg0yw	FE-7206	RM-7644	Admin Principal	2026-02-26 13:38:55.867	NURY - FELIPE
mm3izdvp8plxj7r59	232	mljjqn48zbxhtg0yw	FE-7204	RM-7642	Jhon Montoya	2026-02-26 13:55:04.07	NURY - FELIPE
mm3k1kkgx2kxtlfzm	50	mljjqn48zbxhtg0yw	FE-7202	RM-7640	Jhon Montoya	2026-02-26 14:24:45.665	NURY - FELIPE
mm3kieed1nuu0hmrq	270	mljjqn48zbxhtg0yw	FE-7200	 -	Jhon Montoya	2026-02-26 14:37:50.824	NURY - FELIPE
mm3k76zavwgz9j0j8	59	mljjqn48zbxhtg0yw	FE-7192	RM-7626	Jhon Montoya	2026-02-26 14:29:07.991	NURY - FELIPE
mm3iyf5g04b2whmjn	232	mljjqn48zbxhtg0yw	FE-7191	RM-7625	Jhon Montoya	2026-02-26 13:54:19.062	NURY - FELIPE
mm3jr8ox2i4kj6bgs	138	mljjqn48zbxhtg0yw	FE-7190	RM-7624	Jhon Montoya	2026-02-26 14:16:43.714	NURY - FELIPE
mm3jxvg8709ja27ly	158	mljjqn48zbxhtg0yw	FE-7189	 -	Jhon Montoya	2026-02-26 14:21:53.145	NURY - FELIPE
mm3jzc1nv1zmxutin	107	mljjqn48zbxhtg0yw	FE-7188	RM-7623	Jhon Montoya	2026-02-26 14:23:01.309	NURY - FELIPE
mm3jq8fsf12q2vqq1	138	mljjqn48zbxhtg0yw	FE-7185	RM-7619	Jhon Montoya	2026-02-26 14:15:56.729	NURY - FELIPE
mm3jaxcw505c4h0ex	231	mljjqn48zbxhtg0yw	FE-7183	 -	Jhon Montoya	2026-02-26 14:04:02.529	NURY - FELIPE
mm3j4tv3kyetvp56u	305	mljjqn48zbxhtg0yw	FE-7182	 -	Jhon Montoya	2026-02-26 13:59:18.063	NURY - FELIPE
mm3kkpucu97l4e3en	81	mljjqn48zbxhtg0yw	FE-7177	FE-7178	Jhon Montoya	2026-02-26 14:39:38.965	NURY - FELIPE
mm3khai0anlcogdc3	270	mljjqn48zbxhtg0yw	FE-7176	 -	Jhon Montoya	2026-02-26 14:36:59.113	NURY - JAIME
mm3joefqjz2omk117	258	mljjqn48zbxhtg0yw	FE-7171	 -	Jhon Montoya	2026-02-26 14:14:31.191	MARIA M - JHON
mm3kgq0sujpkt8b1y	270	mljjqn48zbxhtg0yw	FE-7170	 -	Jhon Montoya	2026-02-26 14:36:32.573	MARIA M - JHON
mm3kexsia9bys3xsw	270	mljjqn48zbxhtg0yw	FE-7169	 -	Jhon Montoya	2026-02-26 14:35:09.331	MARIA M - JHON
mm3j7hupgo2gu8l94	90	mljjqn48zbxhtg0yw	FE-7163	 -	Jhon Montoya	2026-02-26 14:01:22.466	MARIA M - JHON - FELIPE
mm3j98byzgb52xmth	217	mljjqn48zbxhtg0yw	FE-7161	 -	Jhon Montoya	2026-02-26 14:02:43.439	MARIA M - JHON - FELIPE
mm3igu5qlp2m14s7a	232	mljjqn48zbxhtg0yw	FE-7158	RM-7584	Admin Principal	2026-02-26 13:40:38.704	NURY - FELIPE
mm3j459dl23fwhf8a	305	mljjqn48zbxhtg0yw	FE-7159	 -	Jhon Montoya	2026-02-26 13:58:46.178	MARIA M - FELIPE - JHON
mm3i94vqmdl6g4qmc	179	mljjqn48zbxhtg0yw	FE-7157	RM-7581	Admin Principal	2026-02-26 13:34:39.351	NURY - FELIPE
mm3idufo09vdzxxlh	177	mljjqn48zbxhtg0yw	FE-7156	RM-7580	Admin Principal	2026-02-26 13:38:19.092	NURY - FELIPE
mmfa88e80moomiaw5	107	mljjqn48zbxhtg0yw	FE-7257	RM-7715	Jhon Montoya	2026-03-06 19:23:14.437	NURY - DAVID
mmez5wvax2e5v4v5w	50	mljjqn48zbxhtg0yw	FE-7256	RM-7709	Jhon Montoya	2026-03-06 14:13:30.407	NURY - RAUL
mmez59uz9h97ig6en	138	mljjqn48zbxhtg0yw	FE-7255	RM-7708	Jhon Montoya	2026-03-06 14:13:00.587	NURY - RAUL
mmt9ykh24jhmy9wyh	298	mljjrcujmtckild4r	FE-7266	RM-7724	Jhon Montoya	2026-03-16 14:24:29.99	NURY - SANDRA
mmta7tip2lfo08rya	283	mljjrcujmtckild4r	FE-7267	 -	Jhon Montoya	2026-03-16 14:31:41.617	NURY - SANDRA
mmta93e6euv4vooz6	310	mljjrcujmtckild4r	FE-7268	RM-7729	Jhon Montoya	2026-03-16 14:32:41.07	NURY - SANDRA
mmtacllg4b8yja0ll	114	mljjrcujmtckild4r	FE-7271	 -	Jhon Montoya	2026-03-16 14:35:24.628	NURY - SANDRA
mmtabn5b2psw6c7zw	216	mljjqn48zbxhtg0yw	 -	RM-7730	Jhon Montoya	2026-03-16 14:34:39.984	NURY - SANDRA
mmtda7cyeig9hfibn	300	mljjrcujmtckild4r	 -	 -	Jhon Montoya	2026-03-16 15:57:31.715	JHON - NURY
mmtdrclsjox4t16qn	300	mljjrcujmtckild4r	 -	 -	Jhon Montoya	2026-03-16 16:10:51.665	NURY - JAIME
mmp5xs1boqtd6rt1k	138	mljjqn48zbxhtg0yw	FE-7274	RM-7735	Jhon Montoya	2026-03-13 17:20:49.972	JHON - NURY
mmp5yry490dshtc0p	59	mljjqn48zbxhtg0yw	FE-7273	RM-7734	Jhon Montoya	2026-03-13 17:21:36.508	JHON - NURY
mmnw7t5wukrha2k1l	50	mljjqn48zbxhtg0yw	FE-7269	RM-7731	Jhon Montoya	2026-03-12 20:00:55.653	NURY - SANDRA
mm9bjim16d7qqck29	179	mljjqn48zbxhtg0yw	FE-7247	RM-7700	Jhon Montoya	2026-03-02 15:13:23.45	NURY - DAVID
mm3l1t5hjgali24ts	264	mljjqn48zbxhtg0yw	FE-7240	RM-7696	Jhon Montoya	2026-02-26 14:52:56.406	NURY - FELIPE
mm3juel6d3ouyxaax	264	mljjqn48zbxhtg0yw	FE-7221	RM-7671	Jhon Montoya	2026-02-26 14:19:11.323	NURY - JAIME
mm3jbrhedvyia6ukq	231	mljjqn48zbxhtg0yw	FE-7213	 -	Jhon Montoya	2026-02-26 14:04:41.572	NURY - FELIPE
mm3klig50tmfwbi42	81	mljjqn48zbxhtg0yw	FE-7198	FE-7199	Jhon Montoya	2026-02-26 14:40:16.038	NURY - FELIPE
mm3jsyw9y49qmhcwt	264	mljjqn48zbxhtg0yw	FE-7186	RM-7620	Jhon Montoya	2026-02-26 14:18:04.33	NURY - FELIPE
mm3iwuz4mqe8jnigt	232	mljjqn48zbxhtg0yw	FE-7175	RM-7611	Jhon Montoya	2026-02-26 13:53:06.26	NURY - JAIME
mm3ja6nt56tf7nb5q	231	mljjqn48zbxhtg0yw	FE-7160	 -	Jhon Montoya	2026-02-26 14:03:27.93	MARIA M - FELIPE - JHON
mmfa8vvx6ednbbcwh	270	mljjqn48zbxhtg0yw	FE-7258	 -	Jhon Montoya	2026-03-06 19:23:44.878	NURY - DAVID
mmv30yndburn5c2fs	233	mljjrcujmtckild4r	FE-7280	RM-7745	Jhon Montoya	2026-03-17 20:45:56.713	JHON - NURY
mmv32fx8q93ahsptc	179	mljjrcujmtckild4r	FE-7281	RM-7746	Jhon Montoya	2026-03-17 20:47:05.756	JHON - NURY
mmv339lkirv0jhd36	230	mljjrcujmtckild4r	FE-7284	RM-7749	Jhon Montoya	2026-03-17 20:47:44.217	JHON - NURY
mmv349hes2rmnigca	232	mljjrcujmtckild4r	FE-7283	RM-7748	Jhon Montoya	2026-03-17 20:48:30.722	JHON - NURY
mmv35pslnzffrk5er	159	mljjrcujmtckild4r	FE-7285	RM-7750	Jhon Montoya	2026-03-17 20:49:38.517	JHON - NURY
mmw9ing3b51mv35fc	177	mljjrcujmtckild4r	7282	7747	M@R!@ M	2026-03-18 16:35:25.876	Nury-Jhon Anderson
mmwhw5qxrb4bmldh5	311	mljjrcujmtckild4r	FE-7287	RM-7753	Jhon Montoya	2026-03-18 20:29:53.05	NURY - LUISA
mmwhxo6dzulrjzrj5	311	mljjrcujmtckild4r	FE-7287	RM-7753	Jhon Montoya	2026-03-18 20:31:03.59	NURY - LUISA
\.


--
-- TOC entry 5235 (class 0 OID 16513)
-- Dependencies: 232
-- Data for Name: fichas_cortes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fichas_cortes (id, ficha_costo_id, numero_corte, fecha_corte, cantidad_cortada, materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones, total_materia_prima, total_mano_obra, total_insumos_directos, total_insumos_indirectos, total_provisiones, costo_real, precio_venta, rentabilidad, costo_proyectado, diferencia, margen_utilidad, created_by, created_at, ficha_corte) FROM stdin;
\.


--
-- TOC entry 5236 (class 0 OID 16540)
-- Dependencies: 233
-- Data for Name: fichas_costo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fichas_costo (id, referencia, ficha_diseno_id, descripcion, marca, novedad, muestra_1, muestra_2, observaciones, foto_1, foto_2, materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones, total_materia_prima, total_mano_obra, total_insumos_directos, total_insumos_indirectos, total_provisiones, costo_total, precio_venta, rentabilidad, margen_ganancia, costo_contabilizar, desc_0_precio, desc_0_rent, desc_5_precio, desc_5_rent, desc_10_precio, desc_10_rent, desc_15_precio, desc_15_rent, cantidad_total_cortada, created_by, created_at, updated_at) FROM stdin;
b4c4050d-29e3-4b6f-a0d5-25bc7d5e38da	10210	760c19e6-0089-4b3d-8712-a45900529e38	BLUSA BASICA	PLOW	MADRES	10210-1	10210-2	BLUSA DAMA CON TIRAS 	/images/references/10210.jpg	/images/references/10210-2.jpg	[{"um": "METRO", "cant": 0.4, "tipo": "TELA", "total": 6000, "concepto": "BURDA ", "vlr_unit": 15000}]	[{"um": "UNIDAD", "cant": 1, "total": 2500, "concepto": "ESTAMPADO CAMILO", "vlr_unit": 2500}, {"um": "UNIDAD", "cant": 1, "total": 2500, "concepto": "CONFECCION BLUSA", "vlr_unit": 2500}, {"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "EMPAQUE", "vlr_unit": 200}, {"um": "UNIDAD", "cant": 1, "total": 500, "concepto": "CORTE", "vlr_unit": 500}]	[]	[{"um": "UNIDAD", "cant": 1, "total": 2400, "concepto": "INSUMOS ", "vlr_unit": 2400}]	[{"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "SERVICIOS CONFECCIONISTA", "vlr_unit": 200}, {"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "CARTERA", "vlr_unit": 200}]	6000.00	5700.00	0.00	2400.00	400.00	14500.00	20900.00	44.14	28900.00	14100.00	20900.00	44.14	19900.00	37.24	18900.00	30.34	17900.00	23.45	0	Admin Principal	2026-02-24 10:37:43.646101	2026-02-24 10:37:43.646101
7ef92f0b-ce02-4a10-915e-3b561324ffb7	12963	0b99a3d1-8812-48fd-803e-adb9f1f91e03	BLUSA BOLER MANG ESTA	Plow	Madres pluss	12031-1		TRACE 145\nCUELLO ESP 38 CM \nDE UNA TIRA DE SESGO ME SALEN 3 ESPALDAS\n\n\nESTAMPAR FONDEO DE MANGA\n	/images/references/12963.jPG	\N	[{"um": "UNIDAD", "cant": 0.99, "tipo": "TELA", "total": 14850, "concepto": "LINO PRAGA", "vlr_unit": 15000}, {"um": "UNIDAD", "cant": 0.011, "tipo": "SESGO", "total": 165, "concepto": "LINO PRAGA", "vlr_unit": 15000}]	[{"um": "UNIDAD", "cant": 1, "total": 1800, "concepto": "ESTAMPADO-HERNAN-ESTAMPAR FONDEO DE MANGA", "vlr_unit": 1800}, {"um": "UNIDAD", "cant": 1, "total": 4000, "concepto": "CONFECCION BLUSA", "vlr_unit": 4000}, {"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "EMPAQUE", "vlr_unit": 200}, {"um": "UNIDAD", "cant": 1, "total": 500, "concepto": "CORTE", "vlr_unit": 500}]	[{"um": "UNIDAD", "cant": 1, "total": 70, "concepto": "MARQUILLA", "vlr_unit": 70}, {"um": "UNIDAD", "cant": 1, "total": 10, "concepto": "MARQUILLA TECNICA", "vlr_unit": 10}, {"um": "UNIDAD", "cant": 1, "total": 130, "concepto": "ETIQUETA", "vlr_unit": 130}, {"um": "UNIDAD", "cant": 2, "total": 20, "concepto": "CODIGO BARRAS", "vlr_unit": 10}, {"um": "UNIDAD", "cant": 1, "total": 94, "concepto": "BOLSA", "vlr_unit": 94}]	[]	[{"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "PROV. CARTERA", "vlr_unit": 200}, {"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "SERVICIOS CONFECCIONISTAS", "vlr_unit": 200}, {"um": "UNIDAD", "cant": 1, "total": 0, "concepto": "TRANSPORTE", "vlr_unit": 0}, {"um": "UNIDAD", "cant": 1, "total": 3921, "concepto": "PROV. DSCTO CCIAL", "vlr_unit": 3921}]	15015.00	6500.00	324.00	0.00	4321.00	26160.00	40900.00	36.04	55900.00	21839.00	40900.00	36.04	38900.00	32.75	36900.00	29.11	34900.00	25.04	0	Admin Principal	2026-02-24 10:23:00.790495	2026-02-24 10:23:00.790495
b1d92185-e33e-4b73-a2dd-a4fbe7299bdb	13032	00f0330d-8f07-44dd-8eeb-805f7e3f0af6	BUSO DE CIERRE	PLOW	CIERRE	12890		CIERRE  TALLA S  \t34\tTALLA M 34\tTALLA L36\n\t\t\t\n\t\t\t\n\t\t\t\nTRACE 112\t\t\t\n	/images/references/13032.jpg	\N	[{"um": "METRO", "cant": 0.74, "tipo": "TELA", "total": 8510, "concepto": "RIB", "vlr_unit": 11500}]	[{"um": "UNIDAD", "cant": 1, "total": 1500, "concepto": "ESTAMPADO   CAMILO  MANGA", "vlr_unit": 1500}, {"um": "UNIDAD", "cant": 1, "total": 1700, "concepto": "PEGADA  ALEJANDRA 10 PERLAS POR MANGA ", "vlr_unit": 1700}, {"um": "UNIDAD", "cant": 1, "total": 3000, "concepto": "CONFECCION BLUSA", "vlr_unit": 3000}, {"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "EMPAQUE", "vlr_unit": 200}, {"um": "UNIDAD", "cant": 1, "total": 500, "concepto": "CORTE", "vlr_unit": 500}]	[{"um": "UNIDAD", "cant": 1, "total": 70, "concepto": "MARQUILLA", "vlr_unit": 70}, {"um": "UNIDAD", "cant": 1, "total": 10, "concepto": "MARQUILLA TECNICA", "vlr_unit": 10}, {"um": "UNIDAD", "cant": 1, "total": 130, "concepto": "ETIQUETA", "vlr_unit": 130}, {"um": "UNIDAD", "cant": 2, "total": 20, "concepto": "CODIGO BARRAS", "vlr_unit": 10}, {"um": "UNIDAD", "cant": 1, "total": 94, "concepto": "BOLSA", "vlr_unit": 94}]	[{"um": "UNIDAD", "cant": 1, "total": 3000, "concepto": "CIERRE  QUERUBIN CON DOBLE CREMALLERA", "vlr_unit": 3000}]	[{"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "PROV. CARTERA", "vlr_unit": 200}, {"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "SERVICIOS CONFECCIONISTAS", "vlr_unit": 200}, {"um": "UNIDAD", "cant": 1, "total": 0, "concepto": "TRANSPORTE", "vlr_unit": 0}, {"um": "UNIDAD", "cant": 1, "total": 3364, "concepto": "PROV. DSCTO CCIAL", "vlr_unit": 3364}]	8510.00	6900.00	324.00	3000.00	3764.00	22498.00	34900.00	35.54	47900.00	18734.00	34900.00	35.54	33900.00	33.63	31900.00	29.47	29900.00	24.76	0	Jhon Montoya	2026-02-27 09:30:42.835315	2026-02-27 09:30:42.835315
\.


--
-- TOC entry 5237 (class 0 OID 16574)
-- Dependencies: 234
-- Data for Name: fichas_diseno; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fichas_diseno (id, referencia, disenadora_id, descripcion, marca, novedad, muestra_1, muestra_2, observaciones, foto_1, foto_2, materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones, total_materia_prima, total_mano_obra, total_insumos_directos, total_insumos_indirectos, total_provisiones, costo_total, importada, created_by, created_at, updated_at) FROM stdin;
0b99a3d1-8812-48fd-803e-adb9f1f91e03	12963	23e36d4f-0002-41d8-b861-99e68b9992e3	BLUSA BOLER MANG ESTA	Plow	Madres pluss	12031-1		TRACE 145\nCUELLO ESP 38 CM \nDE UNA TIRA DE SESGO ME SALEN 3 ESPALDAS\n\n\nESTAMPAR FONDEO DE MANGA\n	/images/references/12963.jPG	\N	[{"um": "UNIDAD", "cant": 0.99, "tipo": "TELA", "total": 0, "concepto": "LINO PRAGA", "vlr_unit": 0}, {"um": "UNIDAD", "cant": 0.011, "tipo": "SESGO", "total": 0, "concepto": "LINO PRAGA", "vlr_unit": 0}]	[{"um": "UNIDAD", "cant": 1, "total": 1800, "concepto": "ESTAMPADO-HERNAN-ESTAMPAR FONDEO DE MANGA", "vlr_unit": 1800}, {"um": "UNIDAD", "cant": 1, "total": 4000, "concepto": "CONFECCION BLUSA", "vlr_unit": 4000}, {"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "EMPAQUE", "vlr_unit": 200}, {"um": "UNIDAD", "cant": 1, "total": 500, "concepto": "CORTE", "vlr_unit": 500}]	[{"um": "UNIDAD", "cant": 1, "total": 70, "concepto": "MARQUILLA", "vlr_unit": 70}, {"um": "UNIDAD", "cant": 1, "total": 10, "concepto": "MARQUILLA TECNICA", "vlr_unit": 10}, {"um": "UNIDAD", "cant": 1, "total": 130, "concepto": "ETIQUETA", "vlr_unit": 130}, {"um": "UNIDAD", "cant": 2, "total": 20, "concepto": "CODIGO BARRAS", "vlr_unit": 10}, {"um": "UNIDAD", "cant": 1, "total": 94, "concepto": "BOLSA", "vlr_unit": 94}]	[]	[{"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "PROV. CARTERA", "vlr_unit": 200}, {"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "SERVICIOS CONFECCIONISTAS", "vlr_unit": 200}, {"um": "UNIDAD", "cant": 1, "total": 0, "concepto": "TRANSPORTE", "vlr_unit": 0}, {"um": "UNIDAD", "cant": 1, "total": 1225, "concepto": "PROV. DSCTO CCIAL", "vlr_unit": 1225}]	0.00	6500.00	324.00	0.00	1625.00	8449.00	t	PRUEBA	2026-02-23 15:12:59.222394	2026-02-23 15:12:59.222394
760c19e6-0089-4b3d-8712-a45900529e38	10210	23e36d4f-0002-41d8-b861-99e68b9992e3	BLUSA BASICA	PLOW	MADRES	10210-1	10210-2	BLUSA DAMA CON TIRAS 	/images/references/10210.jpg	/images/references/10210-2.jpg	[{"um": "METRO", "cant": 0.4, "tipo": "TELA", "total": 6000, "concepto": "BURDA ", "vlr_unit": 15000}]	[{"um": "UNIDAD", "cant": 1, "total": 2500, "concepto": "ESTAMPADO CAMILO", "vlr_unit": 2500}, {"um": "UNIDAD", "cant": 1, "total": 2500, "concepto": "CONFECCION BLUSA", "vlr_unit": 2500}, {"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "EMPAQUE", "vlr_unit": 200}, {"um": "UNIDAD", "cant": 1, "total": 500, "concepto": "CORTE", "vlr_unit": 500}]	[]	[{"um": "UNIDAD", "cant": 1, "total": 1400, "concepto": "INSUMOS ", "vlr_unit": 1400}]	[{"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "SERVICIOS CONFECCIONISTA", "vlr_unit": 200}, {"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "CARTERA", "vlr_unit": 200}]	6000.00	5700.00	0.00	1400.00	400.00	13500.00	t	PRUEBA	2026-02-23 11:09:05.097294	2026-02-23 11:09:05.097294
1aae080c-0db1-4202-ab8d-559dce0d3bcf	12976	23e36d4f-0002-41d8-b861-99e68b9992e3	BUS SUB EN PUNT	Plow	MADRES 	12003-1		SESGO 4 CM TRACE 145\nTIRA DE SISAS CON GARDERA LIBRE 60 CM  DE UNA TIRA LIBRE ME SALE LA S SISAS COMPLETA Y CUELLO \nSESGO ESCOTE FRENTE 32 CM \nSESGO ESCOTE ESPALDA 32 CM \n\nELASTICO DE 1 CM  PARA LAS MANGA \nTALLA SY M DE 18 CM  Y PARA L DE 19 CM MANGAS EN CENTRO PARA RECOGIDO	/images/references/12976.jpg	\N	[{"um": "UNIDAD", "cant": 0.4, "tipo": "RESORTE", "total": 100, "concepto": "ELASTICO DE 1", "vlr_unit": 250}, {"um": "UNIDAD", "cant": 0.72, "tipo": "TELA", "total": 0, "concepto": "MAYATEX", "vlr_unit": 0}, {"um": "UNIDAD", "cant": 0.24, "tipo": "TELA", "total": 0, "concepto": "POLILICRA", "vlr_unit": 0}, {"um": "UNIDAD", "cant": 0.046, "tipo": "SESGO", "total": 0, "concepto": "POLILICRA", "vlr_unit": 0}]	[{"um": "UNIDAD", "cant": 0.72, "total": 4608, "concepto": "ESTAMPADO GLOQUI SUBLIMACION", "vlr_unit": 6400}, {"um": "UNIDAD", "cant": 1, "total": 3000, "concepto": "CONFECCION BLUSA", "vlr_unit": 3000}, {"um": "UNIDAD", "cant": 1, "total": 1200, "concepto": "CONFECCIÓN TOP", "vlr_unit": 1200}, {"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "EMPAQUE", "vlr_unit": 200}, {"um": "UNIDAD", "cant": 1, "total": 780, "concepto": "CORTE", "vlr_unit": 780}]	[{"um": "UNIDAD", "cant": 1, "total": 70, "concepto": "MARQUILLA", "vlr_unit": 70}, {"um": "UNIDAD", "cant": 1, "total": 10, "concepto": "MARQUILLA TECNICA", "vlr_unit": 10}, {"um": "UNIDAD", "cant": 1, "total": 130, "concepto": "ETIQUETA", "vlr_unit": 130}, {"um": "UNIDAD", "cant": 2, "total": 20, "concepto": "CODIGO BARRAS", "vlr_unit": 10}, {"um": "UNIDAD", "cant": 1, "total": 94, "concepto": "BOLSA", "vlr_unit": 94}]	[{"um": "UNIDAD", "cant": 0.08, "total": 16, "concepto": "FRAMILÓN", "vlr_unit": 200}, {"um": "UNIDAD", "cant": 1, "total": 2800, "concepto": "COLLAR YAQUELINE MANUALIDAD CON BOLSA Y PICO LORO", "vlr_unit": 2800}]	[{"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "PROV. CARTERA", "vlr_unit": 200}, {"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "SERVICIOS CONFECCIONISTAS", "vlr_unit": 200}, {"um": "UNIDAD", "cant": 1, "total": 0, "concepto": "TRANSPORTE", "vlr_unit": 0}, {"um": "UNIDAD", "cant": 1, "total": 2339, "concepto": "PROV. DSCTO CCIAL", "vlr_unit": 2339}]	100.00	9788.00	324.00	2816.00	2739.00	15767.00	f	Admin Principal	2026-02-25 15:08:12.798511	2026-02-25 15:08:12.798511
00f0330d-8f07-44dd-8eeb-805f7e3f0af6	13032	23e36d4f-0002-41d8-b861-99e68b9992e3	BUSO DE CIERRE	PLOW	CIERRE	12890		CIERRE  TALLA S  \t34\tTALLA M 34\tTALLA L36\n\t\t\t\n\t\t\t\n\t\t\t\nTRACE 112\t\t\t\n	/images/references/13032.jpg	\N	[{"um": "METRO", "cant": 0.74, "tipo": "TELA", "total": 0, "concepto": "RIB", "vlr_unit": 0}]	[{"um": "UNIDAD", "cant": 1, "total": 1500, "concepto": "ESTAMPADO   CAMILO  MANGA", "vlr_unit": 1500}, {"um": "UNIDAD", "cant": 1, "total": 1700, "concepto": "PEGADA  ALEJANDRA 10 PERLAS POR MANGA ", "vlr_unit": 1700}, {"um": "UNIDAD", "cant": 1, "total": 3000, "concepto": "CONFECCION BLUSA", "vlr_unit": 3000}, {"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "EMPAQUE", "vlr_unit": 200}, {"um": "UNIDAD", "cant": 1, "total": 500, "concepto": "CORTE", "vlr_unit": 500}]	[{"um": "UNIDAD", "cant": 1, "total": 70, "concepto": "MARQUILLA", "vlr_unit": 70}, {"um": "UNIDAD", "cant": 1, "total": 10, "concepto": "MARQUILLA TECNICA", "vlr_unit": 10}, {"um": "UNIDAD", "cant": 1, "total": 130, "concepto": "ETIQUETA", "vlr_unit": 130}, {"um": "UNIDAD", "cant": 2, "total": 20, "concepto": "CODIGO BARRAS", "vlr_unit": 10}, {"um": "UNIDAD", "cant": 1, "total": 94, "concepto": "BOLSA", "vlr_unit": 94}]	[{"um": "UNIDAD", "cant": 1, "total": 3000, "concepto": "CIERRE  QUERUBIN CON DOBLE CREMALLERA", "vlr_unit": 3000}]	[{"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "PROV. CARTERA", "vlr_unit": 200}, {"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "SERVICIOS CONFECCIONISTAS", "vlr_unit": 200}, {"um": "UNIDAD", "cant": 1, "total": 0, "concepto": "TRANSPORTE", "vlr_unit": 0}, {"um": "UNIDAD", "cant": 1, "total": 1836, "concepto": "PROV. DSCTO CCIAL", "vlr_unit": 1836}]	0.00	6900.00	324.00	3000.00	2236.00	12460.00	t	PRUEBA	2026-02-27 09:30:20.538307	2026-02-27 09:30:20.538307
9d46b84e-ccbd-4f42-92bb-34e8a742c962	12878	ce75694c-000d-4b9a-a5fe-0ff716248e08	DUO CON TOP	PLOW	MEDIA MODA	11939-1		TELA  ARIDA ANCHO DE  140 DE UNA TIRA DE SESGO ME SALEN 4 ESCOTES ES DECIR 2 BLUSAS Y DE UNA TIRA SESGAR SISAS Y TIRA LIBRE DE 27 CM PARA LA TALLA M Y DE 28 PARA L	\N	\N	[{"um": "METRO", "cant": 1.24, "total": 17980, "concepto": "ARIDA", "vlr_unit": 14500}, {"um": "METRO", "cant": 0.25, "total": 2750, "concepto": "LYCRA ALGODÓN", "vlr_unit": 11000}, {"um": "METRO", "cant": 0.053, "total": 583, "concepto": "SESGO 1 LYCRA ALGODÓN", "vlr_unit": 11000}, {"um": "METRO", "cant": 0.8, "total": 360, "concepto": "ELASTICO ( 4 ) CMS", "vlr_unit": 450}]	[{"um": "PRENDA", "cant": 1, "total": 1035, "concepto": "FUSION DE CUELLO Y PERILLA", "vlr_unit": 1035}, {"um": "UNIDAD", "cant": 4, "total": 360, "concepto": "BOTONADA", "vlr_unit": 90}, {"um": "UNIDAD", "cant": 4, "total": 360, "concepto": "OJALADA", "vlr_unit": 90}, {"um": "UNIDAD", "cant": 1, "total": 4500, "concepto": "CONFECCION BLUSA / CAMISETA", "vlr_unit": 4500}, {"um": "UNIDAD", "cant": 1, "total": 1100, "concepto": "CONFECCIÓN TOP / CROPTOP", "vlr_unit": 1100}, {"um": "UNIDAD", "cant": 1, "total": 4000, "concepto": "CONFECCIÓN SHORT / FALDA", "vlr_unit": 4000}, {"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "EMPAQUE", "vlr_unit": 200}, {"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "PEGADA DE PLACA", "vlr_unit": 200}, {"um": "PRENDA", "cant": 1, "total": 1000, "concepto": "CORTE", "vlr_unit": 1000}]	[{"um": "UNIDAD", "cant": 1, "total": 70, "concepto": "MARQUILLA", "vlr_unit": 70}, {"um": "UNIDAD", "cant": 1, "total": 10, "concepto": "MARQUILLA TECNICA", "vlr_unit": 10}, {"um": "UNIDAD", "cant": 1, "total": 130, "concepto": "ETIQUETA", "vlr_unit": 130}, {"um": "UNIDAD", "cant": 2, "total": 20, "concepto": "CODIGO BARRAS/STIKERS", "vlr_unit": 10}, {"um": "UNIDAD", "cant": 1, "total": 94, "concepto": "BOLSA 20 * 30", "vlr_unit": 94}]	[{"um": "UNIDAD", "cant": 1, "total": 0, "concepto": "APLIQUE", "vlr_unit": 0}, {"um": "UNIDAD", "cant": 4, "total": 880, "concepto": "BROCHE", "vlr_unit": 220}, {"um": "UNIDAD", "cant": 1, "total": 700, "concepto": "PLACA PLOW", "vlr_unit": 700}]	[{"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "PROV. CARTERA", "vlr_unit": 200}, {"um": "UNIDAD", "cant": 1, "total": 200, "concepto": "SERVICIOS CONFECCIONISTAS", "vlr_unit": 200}, {"um": "UNIDAD", "cant": 1, "total": 6523, "concepto": "PROV. DSCTO CCIAL", "vlr_unit": 6523}]	21673.00	12755.00	324.00	1580.00	6923.00	43255.00	f	Soporte	2026-03-12 14:47:42.148694	2026-03-12 14:47:42.148694
\.


--
-- TOC entry 5238 (class 0 OID 16596)
-- Dependencies: 235
-- Data for Name: inventory_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_movements (id, insumo, cantidad, valor_unitario, valor_total, proveedor, referencia_destino, remision_factura, movimiento, compra_id, fecha_creacion, created_at, updated_at) FROM stdin;
40e80fa8-cb12-411c-9f80-45cff399ef61	Etiquetas gomitas	800.00	110.00	88000.00	Punto marquilla	6040	\N	Salida	\N	2026-02-24 15:14:39.853376	2026-02-24 15:14:39.853376	2026-02-24 15:14:39.853376
68ec0466-b585-4b84-844c-5a74bdc822d0	Etiquetas gomitas	30000.00	110.00	3300000.00	Punto marquilla	\N	\N	Entrada	\N	2026-02-24 14:43:53.598693	2026-02-24 14:43:53.598693	2026-02-24 14:43:53.598693
\.


--
-- TOC entry 5239 (class 0 OID 16612)
-- Dependencies: 236
-- Data for Name: maletas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maletas (id, nombre, correria_id, created_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5240 (class 0 OID 16622)
-- Dependencies: 237
-- Data for Name: maletas_referencias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maletas_referencias (id, maleta_id, referencia, orden, created_at) FROM stdin;
\.


--
-- TOC entry 5241 (class 0 OID 16631)
-- Dependencies: 238
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, sender_id, receiver_id, content, read, created_at) FROM stdin;
1	mlgqup29zlzugg8qk	mlgqup2eyhdq1lkxm	aaaaaaaa	f	2026-02-26 14:27:48.585249
2	mlgqup29zlzugg8qk	mlgqup2eyhdq1lkxm	aaaaaaa	f	2026-02-26 14:28:12.964014
3	mlgqup2eyhdq1lkxm	mlgqup29zlzugg8qk	aaaaaaaaaaaaa	f	2026-02-26 14:36:45.690516
4	mlgqup29zlzugg8qk	mlgqup2eyhdq1lkxm	aaaaaaaaaaaa	f	2026-02-26 14:40:13.332692
5	mlgqup29zlzugg8qk	mlgqup2eyhdq1lkxm	aaaaaaaaaaaaaaaaa	f	2026-02-26 14:43:25.179993
6	mlgqup2eyhdq1lkxm	mlgqup29zlzugg8qk	aaaaaaaa	f	2026-02-26 14:43:53.153267
7	mlgqup29zlzugg8qk	mlgqup2eyhdq1lkxm	aaaaaa	f	2026-02-26 14:44:05.037576
8	mlgqup2eyhdq1lkxm	mlgqup29zlzugg8qk	b	f	2026-02-26 14:44:14.080908
9	mlgqup2eyhdq1lkxm	mlgqup29zlzugg8qk	abc	f	2026-02-26 14:51:35.569786
10	mlgqup29zlzugg8qk	mlgqup2eyhdq1lkxm	123123	f	2026-02-26 14:53:13.197181
11	mlgqup2eyhdq1lkxm	mlgqup29zlzugg8qk	456456	f	2026-02-26 14:53:27.68156
12	mlgqup29zlzugg8qk	mlgqup2eyhdq1lkxm	123	f	2026-02-26 14:57:01.006756
13	mlgqup2eyhdq1lkxm	mlgqup29zlzugg8qk	123	f	2026-02-26 14:57:09.310238
14	mlgqup29zlzugg8qk	mlgqup2eyhdq1lkxm	12312331	f	2026-02-26 14:57:33.343687
15	mlgqup2eyhdq1lkxm	mlgqup29zlzugg8qk	13131	f	2026-02-26 14:57:45.581003
16	mlgqup29zlzugg8qk	mm3wcdhk7ksjtfh97	Holaaaaaaaaaa	f	2026-02-26 15:10:09.139626
17	mm3wcdhk7ksjtfh97	mlgqup29zlzugg8qk	:(	f	2026-02-26 15:10:32.240156
18	mm3wcdhk7ksjtfh97	mlgqup29zlzugg8qk	Anderson	f	2026-02-26 15:11:37.666752
19	mm3x7j6m4p6s4g2zz	mm3wcdhk7ksjtfh97	HOLAAAAA	f	2026-02-27 09:02:19.300223
20	mm3wcdhk7ksjtfh97	mm3x7j6m4p6s4g2zz	:(	f	2026-02-27 09:02:35.732443
21	mm3wcdhk7ksjtfh97	mm3x7j6m4p6s4g2zz	quiero emogis	f	2026-02-27 09:07:07.138758
22	mm3wcdhk7ksjtfh97	mm3x7j6m4p6s4g2zz	quiero emogis	f	2026-02-27 09:07:11.992554
23	mm3wcdhk7ksjtfh97	mm3x7j6m4p6s4g2zz	quiero emogis	f	2026-02-27 09:07:15.304012
24	mltycdim2me5704rt	mm3x7j6m4p6s4g2zz	🙂🙃	f	2026-02-27 09:47:38.51916
25	mm3x7j6m4p6s4g2zz	mm3wcdhk7ksjtfh97	😃😃😃	f	2026-02-27 09:48:42.764565
26	mm3wcdhk7ksjtfh97	mm3x7j6m4p6s4g2zz	🥳	f	2026-02-27 09:49:07.604754
27	mm3wcdhk7ksjtfh97	mm3x7j6m4p6s4g2zz	👩🏻	f	2026-02-27 09:52:48.924169
28	mm3wcdhk7ksjtfh97	mm3x7j6m4p6s4g2zz	🤡	f	2026-02-27 09:53:12.33012
29	mm3x7j6m4p6s4g2zz	mm9a66x3tqtxja160	Aaaaa	f	2026-03-02 11:48:40.259607
30	mm9a66x3tqtxja160	mm3x7j6m4p6s4g2zz	aaaa	f	2026-03-02 11:48:49.688345
31	mm3wcdhk7ksjtfh97	mm3x7j6m4p6s4g2zz	🥳	f	2026-03-03 12:26:28.975421
32	mm3x7j6m4p6s4g2zz	mmcek5ivcck8np2xg	Hola	f	2026-03-04 14:04:47.414175
33	mmcek5ivcck8np2xg	mm3x7j6m4p6s4g2zz	😝	f	2026-03-04 14:05:13.501822
34	mm3x7j6m4p6s4g2zz	mm3wcdhk7ksjtfh97	Llega mensaje normal?	f	2026-03-05 07:44:42.476576
35	mm3wcdhk7ksjtfh97	mm3x7j6m4p6s4g2zz	🙃	f	2026-03-05 07:44:53.933215
36	mm3wcdhk7ksjtfh97	mm3x7j6m4p6s4g2zz	HOLA	f	2026-03-12 13:20:39.91177
37	mm3x7j6m4p6s4g2zz	mm3wcdhk7ksjtfh97	Holi	f	2026-03-12 13:21:59.115217
38	mm9a66x3tqtxja160	mm3x7j6m4p6s4g2zz	🔥	f	2026-03-12 14:51:08.786641
39	mm3x7j6m4p6s4g2zz	mm9a66x3tqtxja160	aaaaa	f	2026-03-12 14:51:48.531408
40	mm3x7j6m4p6s4g2zz	mm9a66x3tqtxja160	aaaa	f	2026-03-12 14:51:51.87783
41	mm3x7j6m4p6s4g2zz	mm9a66x3tqtxja160	aaaaa	f	2026-03-12 14:51:55.574147
42	mm3x7j6m4p6s4g2zz	mm9a66x3tqtxja160	aaaaa	f	2026-03-12 14:51:57.589917
43	mm3x7j6m4p6s4g2zz	mm9a66x3tqtxja160	aaaaa	f	2026-03-12 14:51:59.473355
44	mm3x7j6m4p6s4g2zz	mm9a66x3tqtxja160	aaaaa	f	2026-03-12 14:52:01.797956
45	mm3x7j6m4p6s4g2zz	mm9a66x3tqtxja160	aaaa	f	2026-03-12 14:53:46.464012
46	mm3x7j6m4p6s4g2zz	mm9a66x3tqtxja160	aaaa	f	2026-03-12 14:53:48.988092
47	mm3x7j6m4p6s4g2zz	mm9a66x3tqtxja160	aaaa	f	2026-03-12 14:53:51.370443
48	mm3x7j6m4p6s4g2zz	mm9a66x3tqtxja160	👍	f	2026-03-12 14:53:53.755588
49	mm3x7j6m4p6s4g2zz	mm9a66x3tqtxja160	🔥	f	2026-03-12 14:53:54.661442
50	mm3x7j6m4p6s4g2zz	mm9a66x3tqtxja160	👏	f	2026-03-12 14:53:54.991657
51	mm3x7j6m4p6s4g2zz	mm9a66x3tqtxja160	😂	f	2026-03-12 14:53:55.616041
52	mm3x7j6m4p6s4g2zz	mm9a66x3tqtxja160	👍	f	2026-03-12 14:53:56.442632
53	mm3x7j6m4p6s4g2zz	mm9a66x3tqtxja160	❤️	f	2026-03-12 14:53:56.772438
54	mm3x7j6m4p6s4g2zz	mm9a66x3tqtxja160	😂	f	2026-03-12 14:53:57.092754
55	mm3wcdhk7ksjtfh97	mm3x7j6m4p6s4g2zz	❤️	f	2026-03-13 16:07:29.207186
56	mm3wcdhk7ksjtfh97	mm3x7j6m4p6s4g2zz	🔥	f	2026-03-13 16:20:27.869201
57	mm3wcdhk7ksjtfh97	mm3x7j6m4p6s4g2zz	👏	f	2026-03-13 16:20:29.506624
58	mm3wcdhk7ksjtfh97	mm3x7j6m4p6s4g2zz	👍	f	2026-03-13 16:20:44.751228
59	mm3x7j6m4p6s4g2zz	mm3wcdhk7ksjtfh97	😒🙄	f	2026-03-13 16:21:09.198549
60	mm3wcdhk7ksjtfh97	mm3x7j6m4p6s4g2zz	helo	f	2026-03-13 16:21:29.926028
61	mm3wcdhk7ksjtfh97	mm3x7j6m4p6s4g2zz	hello	f	2026-03-13 16:21:33.385183
62	mm3x7j6m4p6s4g2zz	mm3wcdhk7ksjtfh97	🥟 de cocorollo	f	2026-03-13 16:23:19.637504
63	mm3wcdhk7ksjtfh97	mm3x7j6m4p6s4g2zz	😓	f	2026-03-13 16:23:21.07226
64	mm3wcdhk7ksjtfh97	mm3x7j6m4p6s4g2zz	😡	f	2026-03-13 16:23:33.676135
65	mm3wcdhk7ksjtfh97	mm3x7j6m4p6s4g2zz	😂	f	2026-03-13 16:25:01.258
66	mm3x7j6m4p6s4g2zz	mm3wcdhk7ksjtfh97	🙈	f	2026-03-13 16:25:36.925353
67	mm3x7j6m4p6s4g2zz	mm3wcdhk7ksjtfh97	🙈🙉🙊	f	2026-03-13 16:25:54.42658
68	mm3x7j6m4p6s4g2zz	mm3wcdhk7ksjtfh97	mensaje	f	2026-03-13 16:28:59.364416
69	mm3wcdhk7ksjtfh97	mm3x7j6m4p6s4g2zz	😡	f	2026-03-16 13:18:07.822905
70	mm3x7j6m4p6s4g2zz	mm3wcdhk7ksjtfh97	Holi	f	2026-03-16 16:33:07.290195
71	mm3x7j6m4p6s4g2zz	mm3wcdhk7ksjtfh97	zumbido	f	2026-03-16 16:33:16.70018
72	mm3x7j6m4p6s4g2zz	mmtovpuh0hhrz20qp	Holi, recibes mensajes?	f	2026-03-17 08:20:48.763735
73	mmtovpuh0hhrz20qp	mm3x7j6m4p6s4g2zz	sii	f	2026-03-17 08:21:17.359974
74	mmtovpuh0hhrz20qp	mm3x7j6m4p6s4g2zz	ya le aparece es de melva? , yo no veo que me halla quedado guardado	f	2026-03-17 08:31:49.078552
75	mm3x7j6m4p6s4g2zz	mmtovpuh0hhrz20qp	Nada, no lo veo, subo y lo hacemos a ver qué pasA?	f	2026-03-17 08:32:24.473519
76	mmtovpuh0hhrz20qp	mm3x7j6m4p6s4g2zz	sii por  fa	f	2026-03-17 08:38:14.163696
77	mm3wcdhk7ksjtfh97	mmtovpuh0hhrz20qp	❤️	f	2026-03-17 08:49:28.064702
78	mmtovpuh0hhrz20qp	mm3wcdhk7ksjtfh97	🤪	f	2026-03-17 08:49:54.810091
79	mm3wcdhk7ksjtfh97	mm3x7j6m4p6s4g2zz	❤️	f	2026-03-17 08:59:05.757306
80	mm3wcdhk7ksjtfh97	mm3x7j6m4p6s4g2zz	ZUMBIDOOOOOOOOOOOOOOOOOOOOOOOO	f	2026-03-17 15:29:27.877017
81	mmtovpuh0hhrz20qp	mm3x7j6m4p6s4g2zz	lo logre😀	f	2026-03-17 15:48:58.173899
82	mm3x7j6m4p6s4g2zz	mmtovpuh0hhrz20qp	Esoooo	f	2026-03-17 15:49:07.298509
\.


--
-- TOC entry 5243 (class 0 OID 16644)
-- Dependencies: 240
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (order_id, reference, quantity, sale_price) FROM stdin;
mm25qs8bzb9btrgvw	12923	18	23900.00
mm25qs8bzb9btrgvw	12882	18	23900.00
mm25qs8bzb9btrgvw	12909	18	23900.00
mm25qs8bzb9btrgvw	12872	18	23900.00
mm25qs8bzb9btrgvw	12911	18	18900.00
mm25qs8bzb9btrgvw	12919	18	24900.00
mm25qs8bzb9btrgvw	12926	18	26900.00
mm25qs8bzb9btrgvw	12835	12	19900.00
mm25qs8bzb9btrgvw	12831	12	23900.00
mm25qs8bzb9btrgvw	12836	12	20900.00
mm25qs8bzb9btrgvw	12855	12	23900.00
mm25qs8bzb9btrgvw	12129	12	26900.00
mm25qs8bzb9btrgvw	12841	12	19900.00
mm25qs8bzb9btrgvw	12834	12	16900.00
mm25qs8bzb9btrgvw	12825	12	21900.00
mm25qs8bzb9btrgvw	12818	12	40900.00
mm25qs8bzb9btrgvw	12821	12	33900.00
mm25qs8bzb9btrgvw	12840	12	33900.00
mmpgxr0cmqouvxsuz	13118	24	21900.00
mmph0ntzrz5dgbf7e	12990	6	32400.00
mmph0ntzrz5dgbf7e	13012	6	39400.00
mmph0ntzrz5dgbf7e	13103	6	45400.00
mmph0ntzrz5dgbf7e	12964	6	46400.00
mmph0ntzrz5dgbf7e	12959	6	37400.00
mmph0ntzrz5dgbf7e	12960	6	39400.00
mmph0ntzrz5dgbf7e	13076	6	27400.00
mmph0ntzrz5dgbf7e	13113	6	49400.00
mmph0ntzrz5dgbf7e	13102	6	29400.00
mmph0ntzrz5dgbf7e	13016	6	32400.00
mmph0ntzrz5dgbf7e	13077	6	42400.00
mmph0ntzrz5dgbf7e	13112	6	37400.00
mmph0ntzrz5dgbf7e	13002	6	41400.00
mmph0ntzrz5dgbf7e	13055	6	29400.00
mmph0ntzrz5dgbf7e	13117	6	23400.00
mmph0ntzrz5dgbf7e	13116	6	21400.00
mmph0ntzrz5dgbf7e	13118	6	21400.00
mmph0ntzrz5dgbf7e	13094	6	21400.00
mmph0ntzrz5dgbf7e	12709	6	19400.00
mmph0ntzrz5dgbf7e	13068	6	21400.00
mmph0ntzrz5dgbf7e	13008	6	33400.00
mmph0ntzrz5dgbf7e	13036	6	29400.00
mmph0ntzrz5dgbf7e	13100	6	25400.00
mmph0ntzrz5dgbf7e	12747	6	31400.00
mmph0ntzrz5dgbf7e	12783	6	17400.00
mmph0ntzrz5dgbf7e	13079	6	19400.00
mmph0ntzrz5dgbf7e	12968	6	44400.00
mmph0ntzrz5dgbf7e	13014	6	29400.00
mmph0ntzrz5dgbf7e	13015	6	37400.00
mmph0ntzrz5dgbf7e	12973	6	42400.00
mmph0ntzrz5dgbf7e	13023	6	34400.00
mmph0ntzrz5dgbf7e	13254	6	34400.00
mmph0ntzrz5dgbf7e	12966	6	43400.00
mmph224zawpf1wfbp	13023	6	34400.00
mmph224zawpf1wfbp	13254	6	34400.00
mmph224zawpf1wfbp	12966	6	43400.00
mmph2vwqtgig74spi	13002	12	41900.00
mmph2vwqtgig74spi	12960	12	39900.00
mmt9cg4gbu5dnloup	13066	12	45900.00
mmt9cg4gbu5dnloup	12990	12	32900.00
mmt9cg4gbu5dnloup	12960	12	39900.00
mmt9cg4gbu5dnloup	13103	12	45900.00
mmt9cg4gbu5dnloup	12972	12	48900.00
mmt9cg4gbu5dnloup	12747	12	31900.00
mmt9cg4gbu5dnloup	13033	12	29900.00
mmt9cg4gbu5dnloup	13010	12	29900.00
mmt9cg4gbu5dnloup	13100	12	25900.00
mmt9cg4gbu5dnloup	13068	12	21900.00
mmt9cg4gbu5dnloup	13005	12	20900.00
mmt9cg4gbu5dnloup	12980	12	22900.00
mmt9cg4gbu5dnloup	13074	12	19900.00
mmt9cg4gbu5dnloup	13118	12	21900.00
mmt9cg4gbu5dnloup	13079	12	19900.00
mmt9cg4gbu5dnloup	12576	12	19900.00
mmt9cg4gbu5dnloup	13043	12	34900.00
mmt9cg4gbu5dnloup	13040	12	32900.00
mmt9cg4gbu5dnloup	12574	12	25900.00
mmt9cg4gbu5dnloup	12943	12	19900.00
mmt9f0zv75r8qf1g9	13012	6	39900.00
mmt9f0zv75r8qf1g9	12963	6	35900.00
mmt9f0zv75r8qf1g9	13103	3	45900.00
mmt9f0zv75r8qf1g9	12972	3	48900.00
mmt9f0zv75r8qf1g9	12980	6	22900.00
mmt9f0zv75r8qf1g9	13008	6	33900.00
mmt9f0zv75r8qf1g9	13128	6	23900.00
mmt9f0zv75r8qf1g9	13123	6	19900.00
mmt9f0zv75r8qf1g9	13079	6	19900.00
mmt9f0zv75r8qf1g9	12884	6	21900.00
mmt9f0zv75r8qf1g9	13094	6	21900.00
mmt9f0zv75r8qf1g9	13118	6	21900.00
mmt9f0zv75r8qf1g9	13055	6	29900.00
mmt9f0zv75r8qf1g9	13129	6	22900.00
mmt9f0zv75r8qf1g9	12973	6	42900.00
mmt9f0zv75r8qf1g9	12895	6	30900.00
mmt9f0zv75r8qf1g9	12671	6	24900.00
mmt9f0zv75r8qf1g9	12970	6	34900.00
mmt9f0zv75r8qf1g9	13042	6	29900.00
mmt9f0zv75r8qf1g9	12943	6	19900.00
mmt9f0zv75r8qf1g9	13131	6	19900.00
mmt9f0zv75r8qf1g9	13040	6	32900.00
mmt9f0zv75r8qf1g9	13122	6	18900.00
mmt9f0zv75r8qf1g9	13120	6	18900.00
mmt9f0zv75r8qf1g9	12877	6	19900.00
mmpgtfe31h7o4pg3g	12771	36	14000.00
mmpgtfe31h7o4pg3g	12683	36	14000.00
mmpgtfe31h7o4pg3g	13095	108	14000.00
mmpgtfe31h7o4pg3g	12782	108	14000.00
mmpgtfe31h7o4pg3g	12783	108	14000.00
mmpgtfe31h7o4pg3g	12877	126	16000.00
mmpgtfe31h7o4pg3g	13091	204	16000.00
mmpgtfe31h7o4pg3g	13074	204	16000.00
mmpgtfe31h7o4pg3g	12864	204	16000.00
mmpgtfe31h7o4pg3g	13083	204	16000.00
mmpgtfe31h7o4pg3g	13079	204	16000.00
mmpgtfe31h7o4pg3g	12686	204	16000.00
mmpgtfe31h7o4pg3g	13005	204	16000.00
mmpgtfe31h7o4pg3g	12909	204	16000.00
mmpgtfe31h7o4pg3g	13081	204	16000.00
mmpgtfe31h7o4pg3g	13098	36	19000.00
mmpgtfe31h7o4pg3g	12737	36	19000.00
mmpgtfe31h7o4pg3g	13093	36	19000.00
mmpgtfe31h7o4pg3g	12692	36	19000.00
mmpgtfe31h7o4pg3g	12640	36	19000.00
mmpgtfe31h7o4pg3g	13094	36	19000.00
mmpgtfe31h7o4pg3g	12885	36	19000.00
mmpgtfe31h7o4pg3g	12883	36	19000.00
mmpgtfe31h7o4pg3g	13086	36	19000.00
mm25z1dbniegbh1m6	12909	4	23900.00
mm25z1dbniegbh1m6	12911	4	18900.00
mm25z1dbniegbh1m6	12882	4	23900.00
mm25z1dbniegbh1m6	12941	4	20900.00
mm25z1dbniegbh1m6	12885	4	23900.00
mm25z1dbniegbh1m6	12782	4	17900.00
mm25z1dbniegbh1m6	12871	4	19900.00
mm25z1dbniegbh1m6	12931	4	29900.00
mm25z1dbniegbh1m6	12805	4	19900.00
mm25z1dbniegbh1m6	12892	4	24900.00
mm25z1dbniegbh1m6	12876	4	19900.00
mm25z1dbniegbh1m6	12945	4	19900.00
mm25z1dbniegbh1m6	12897	4	19900.00
mm25z1dbniegbh1m6	12943	4	19900.00
mm25z1dbniegbh1m6	12920	4	21900.00
mm25z1dbniegbh1m6	12898	4	24900.00
mm25z1dbniegbh1m6	12951	4	27900.00
mm25z1dbniegbh1m6	12952	4	26900.00
mm25z1dbniegbh1m6	12919	4	25900.00
mm25z1dbniegbh1m6	12880	4	24900.00
mm25z1dbniegbh1m6	12937	4	14900.00
mm25z1dbniegbh1m6	12873	4	22900.00
mm25z1dbniegbh1m6	12923	4	24900.00
mm25z1dbniegbh1m6	12913	4	29900.00
mm25z1dbniegbh1m6	12699	4	24900.00
mm25z1dbniegbh1m6	12744	4	19900.00
mm25z1dbniegbh1m6	12907	4	28900.00
mm25z1dbniegbh1m6	12906	4	28900.00
mm25z1dbniegbh1m6	12889	4	28900.00
mm25z1dbniegbh1m6	12875	4	19900.00
mm25yurfvl3ytrp78	12366	24	19900.00
mm25yurfvl3ytrp78	12871	24	19900.00
mm25yurfvl3ytrp78	12922	24	21900.00
mm25yurfvl3ytrp78	12860	24	16900.00
mm25yurfvl3ytrp78	12888	24	19900.00
mm25yurfvl3ytrp78	12782	24	17900.00
mm25yurfvl3ytrp78	12893	24	24900.00
mm25yurfvl3ytrp78	12920	24	21900.00
mm25yurfvl3ytrp78	12917	24	19900.00
mm25yurfvl3ytrp78	12943	24	19900.00
mm25yurfvl3ytrp78	12950	24	27900.00
mm25yurfvl3ytrp78	12883	24	24900.00
mm25yurfvl3ytrp78	12913	24	29900.00
mm25yurfvl3ytrp78	12873	24	22900.00
mm25yurfvl3ytrp78	12951	24	27900.00
mm25yurfvl3ytrp78	12926	24	27900.00
mm25yurfvl3ytrp78	12875	24	19900.00
mm25yurfvl3ytrp78	12911	24	18900.00
mm25yurfvl3ytrp78	12952	24	26900.00
mm25yurfvl3ytrp78	12937	24	14900.00
mm25x0trsopvohrgo	12782	12	17900.00
mm25x0trsopvohrgo	12870	11	35900.00
mm25x0trsopvohrgo	12871	12	19900.00
mm25x0trsopvohrgo	12876	12	19900.00
mm25x0trsopvohrgo	12880	12	24900.00
mm25x0trsopvohrgo	12882	12	23900.00
mm25x0trsopvohrgo	12885	12	23900.00
mm25x0trsopvohrgo	12889	12	28900.00
mm25x0trsopvohrgo	12905	12	34900.00
mm25x0trsopvohrgo	12907	11	28900.00
mm25x0trsopvohrgo	12908	12	28900.00
mm25x0trsopvohrgo	12909	12	23900.00
mm25x0trsopvohrgo	12910	12	22900.00
mm25x0trsopvohrgo	12916	12	20900.00
mm25x0trsopvohrgo	12931	12	29900.00
mm25x0trsopvohrgo	12937	12	14900.00
mm25wkgeaqmr6b8un	12129	11	27900.00
mm25wkgeaqmr6b8un	12694	11	24900.00
mm25wkgeaqmr6b8un	12825	11	22900.00
mm25wkgeaqmr6b8un	12828	11	14900.00
mm25wkgeaqmr6b8un	12834	11	17900.00
mm25wkgeaqmr6b8un	12835	11	20900.00
mm25wkgeaqmr6b8un	12836	11	21900.00
mm25wkgeaqmr6b8un	12837	11	27900.00
mm25wkgeaqmr6b8un	12841	13	20900.00
mm25wans5fy2ikncb	12129	12	27900.00
mm25wans5fy2ikncb	12694	12	24900.00
mm25wans5fy2ikncb	12825	12	22900.00
mm25wans5fy2ikncb	12828	12	14900.00
mm25wans5fy2ikncb	12834	12	17900.00
mm25wans5fy2ikncb	12835	12	20900.00
mm25wans5fy2ikncb	12836	11	21900.00
mm25wans5fy2ikncb	12837	12	27900.00
mm25wans5fy2ikncb	12841	14	20900.00
mm25v4aqgkqzh9j40	12704	10	29900.00
mm25v4aqgkqzh9j40	12782	10	17900.00
mm25v4aqgkqzh9j40	12870	9	35900.00
mm25v4aqgkqzh9j40	12871	10	19900.00
mm25v4aqgkqzh9j40	12876	10	19900.00
mm25v4aqgkqzh9j40	12880	10	24900.00
mm25v4aqgkqzh9j40	12882	10	23900.00
mm25v4aqgkqzh9j40	12885	10	23900.00
mm25v4aqgkqzh9j40	12889	10	28900.00
mm25v4aqgkqzh9j40	12905	10	34900.00
mm25v4aqgkqzh9j40	12907	9	28900.00
mm25v4aqgkqzh9j40	12908	10	28900.00
mm25v4aqgkqzh9j40	12909	10	23900.00
mm25v4aqgkqzh9j40	12910	10	22900.00
mm25v4aqgkqzh9j40	12916	10	20900.00
mm25v4aqgkqzh9j40	12931	10	29900.00
mm25v4aqgkqzh9j40	12937	10	14900.00
mm25teuw5s5a06njw	12129	11	27900.00
mm25teuw5s5a06njw	12694	11	24900.00
mm25teuw5s5a06njw	12825	11	22900.00
mm25teuw5s5a06njw	12828	11	14900.00
mm25teuw5s5a06njw	12834	11	17900.00
mm25teuw5s5a06njw	12835	11	20900.00
mm25teuw5s5a06njw	12836	11	21900.00
mm25teuw5s5a06njw	12837	11	27900.00
mm25teuw5s5a06njw	12841	13	20900.00
mm2c7uonjxqwkjpf5	12945	168	14000.00
mm2c7uonjxqwkjpf5	12860	168	14000.00
mm2c7uonjxqwkjpf5	12665	168	14000.00
mm2c7uonjxqwkjpf5	12897	138	16000.00
mm2c7uonjxqwkjpf5	12876	168	16000.00
mm2c7uonjxqwkjpf5	12943	138	16000.00
mm2c7uonjxqwkjpf5	12877	168	16000.00
mm2c7uonjxqwkjpf5	12864	138	16000.00
mm2c7uonjxqwkjpf5	12888	168	16000.00
mm2c7uonjxqwkjpf5	12871	138	16000.00
mm2c7uonjxqwkjpf5	12911	168	16000.00
mm2c7uonjxqwkjpf5	12861	168	16000.00
mm2c7uonjxqwkjpf5	12920	48	19000.00
mm2c7uonjxqwkjpf5	12893	48	19000.00
mm2c7uonjxqwkjpf5	12924	48	19000.00
mm2c7uonjxqwkjpf5	12955	48	19000.00
mm2c7uonjxqwkjpf5	12919	48	19000.00
mm2c7uonjxqwkjpf5	12959	60	35000.00
mm2c7uonjxqwkjpf5	12960	60	35000.00
mmpgtfe31h7o4pg3g	13100	36	19000.00
mmpgtfe31h7o4pg3g	13090	36	19000.00
mmpgtfe31h7o4pg3g	12862	36	19000.00
mmpgtfe31h7o4pg3g	13096	36	21000.00
mmpgtfe31h7o4pg3g	13013	36	21000.00
mmpgtfe31h7o4pg3g	12704	36	21000.00
mmpgtfe31h7o4pg3g	12685	48	24000.00
mmpgtfe31h7o4pg3g	12644	48	24000.00
mmpgtfe31h7o4pg3g	13033	36	24000.00
mmpgtfe31h7o4pg3g	12889	48	27000.00
mmpgtfe31h7o4pg3g	13003	36	29000.00
mmpgtfe31h7o4pg3g	13084	48	29000.00
mmpgtfe31h7o4pg3g	12747	48	29000.00
mmpgtfe31h7o4pg3g	13010	36	29000.00
mmpgtfe31h7o4pg3g	13036	36	29000.00
mmpgtfe31h7o4pg3g	13067	48	32000.00
mmpgtfe31h7o4pg3g	13065	48	35000.00
mmpgtfe31h7o4pg3g	13058	48	30000.00
mmpgtfe31h7o4pg3g	12976	48	35000.00
mmpgtfe31h7o4pg3g	12986	48	29900.00
mmpgtfe31h7o4pg3g	13029	48	29900.00
mmpgtfe31h7o4pg3g	12581	36	29900.00
mmpgtfe31h7o4pg3g	13076	54	28000.00
mmpgtfe31h7o4pg3g	13101	54	35000.00
mmpgtfe31h7o4pg3g	13064	54	33000.00
mmpgtfe31h7o4pg3g	12869	54	32000.00
mmpgtfe31h7o4pg3g	12962	54	42000.00
mmpgtfe31h7o4pg3g	13077	54	42000.00
mmpgtfe31h7o4pg3g	13109	54	32000.00
mm261ih80nzxoq1lv	12698	12	21900.00
mm261ih80nzxoq1lv	12936	12	14900.00
mm261ih80nzxoq1lv	12917	12	19900.00
mm261ih80nzxoq1lv	12950	12	27900.00
mm261ih80nzxoq1lv	12777	12	14900.00
mm261ih80nzxoq1lv	12679	12	23900.00
mm261ih80nzxoq1lv	12737	12	22900.00
mm261ih80nzxoq1lv	12704	12	29900.00
mm261ih80nzxoq1lv	12694	12	24900.00
mm261ih80nzxoq1lv	12915	12	28900.00
mm261ih80nzxoq1lv	12934	12	24900.00
mm261ih80nzxoq1lv	12574	12	25900.00
mm261ih80nzxoq1lv	12920	12	21900.00
mm261ih80nzxoq1lv	12898	12	24900.00
mm261ih80nzxoq1lv	12754	12	16900.00
mm261ih80nzxoq1lv	12865	12	16900.00
mm261ih80nzxoq1lv	12922	12	21900.00
mm261ih80nzxoq1lv	12943	12	19900.00
mm261ih80nzxoq1lv	12805	12	19900.00
mm261ih80nzxoq1lv	12893	12	24900.00
mm261ih80nzxoq1lv	12747	12	31900.00
mm261ih80nzxoq1lv	12926	12	27900.00
mm261ih80nzxoq1lv	12955	12	22900.00
mm261ih80nzxoq1lv	12914	12	33900.00
mm261ih80nzxoq1lv	12885	12	23900.00
mm261ih80nzxoq1lv	12883	12	24900.00
mm261ih80nzxoq1lv	12699	12	24900.00
mm261ih80nzxoq1lv	12909	12	23900.00
mm261ih80nzxoq1lv	12911	12	18900.00
mm261ih80nzxoq1lv	12882	12	23900.00
mm261ih80nzxoq1lv	12875	12	19900.00
mm261ih80nzxoq1lv	12873	12	22900.00
mm261ih80nzxoq1lv	12871	12	19900.00
mm261ih80nzxoq1lv	12860	12	16900.00
mm261ih80nzxoq1lv	12884	12	21900.00
mm261ih80nzxoq1lv	12939	12	20900.00
mm261ih80nzxoq1lv	12640	12	24900.00
mm261ih80nzxoq1lv	12868	8	69900.00
mm261ih80nzxoq1lv	12878	8	64900.00
mm261ih80nzxoq1lv	12881	18	33900.00
mm261ih80nzxoq1lv	12907	18	28900.00
mm261ih80nzxoq1lv	12908	18	28900.00
mm261ih80nzxoq1lv	12581	18	32900.00
mm261ih80nzxoq1lv	12933	18	34900.00
mm261ih80nzxoq1lv	12744	18	19900.00
mm261ih80nzxoq1lv	12617	18	35900.00
mm261ih80nzxoq1lv	12870	18	35900.00
mm261ih80nzxoq1lv	12889	18	28900.00
mm261bh9kjzjbs3n3	12906	12	28900.00
mm261bh9kjzjbs3n3	12881	12	33900.00
mm261bh9kjzjbs3n3	12880	12	24900.00
mm261bh9kjzjbs3n3	12950	12	27900.00
mm261bh9kjzjbs3n3	12693	12	25900.00
mm261bh9kjzjbs3n3	12698	12	21900.00
mm261bh9kjzjbs3n3	12936	12	14900.00
mm25zlnrm0l8pxyk3	12679	24	23900.00
mm25zlnrm0l8pxyk3	12918	24	19900.00
mm25zlnrm0l8pxyk3	12680	24	16900.00
mm25zlnrm0l8pxyk3	12943	24	19900.00
mm25zlnrm0l8pxyk3	12936	24	14900.00
mm25zlnrm0l8pxyk3	12877	24	19900.00
mm25zlnrm0l8pxyk3	12920	24	21900.00
mm25zlnrm0l8pxyk3	12934	24	24900.00
mm25zlnrm0l8pxyk3	12898	24	24900.00
mm25zlnrm0l8pxyk3	12881	24	33900.00
mm25zlnrm0l8pxyk3	12907	24	28900.00
mm25zlnrm0l8pxyk3	12933	24	34900.00
mm25zlnrm0l8pxyk3	12906	24	28900.00
mm25zlnrm0l8pxyk3	12935	24	35900.00
mm25zlnrm0l8pxyk3	12908	24	28900.00
mm25zlnrm0l8pxyk3	12889	24	28900.00
mm25zlnrm0l8pxyk3	12747	24	31900.00
mm25zlnrm0l8pxyk3	12872	24	24900.00
mm25zlnrm0l8pxyk3	12919	24	25900.00
mm25zlnrm0l8pxyk3	12951	24	27900.00
mm25zlnrm0l8pxyk3	12909	24	23900.00
mm25zlnrm0l8pxyk3	12913	24	29900.00
mm25zlnrm0l8pxyk3	12942	24	24900.00
mm25zlnrm0l8pxyk3	12923	24	24900.00
mm25zlnrm0l8pxyk3	12862	24	23900.00
mm25zlnrm0l8pxyk3	12941	24	20900.00
mm25zlnrm0l8pxyk3	12875	24	19900.00
mm25zlnrm0l8pxyk3	12879	24	38900.00
mm25zlnrm0l8pxyk3	12914	24	33900.00
mm25zlnrm0l8pxyk3	12880	24	24900.00
mm25zlnrm0l8pxyk3	12873	24	22900.00
mm25zlnrm0l8pxyk3	12882	24	23900.00
mm25zlnrm0l8pxyk3	12952	24	26900.00
mm25zlnrm0l8pxyk3	12937	24	14900.00
mm25zlnrm0l8pxyk3	12893	24	24900.00
mm25shroo1oy81pds	12906	24	28900.00
mm25shroo1oy81pds	12933	24	34900.00
mm25shroo1oy81pds	12889	24	28900.00
mm25shroo1oy81pds	12708	24	24900.00
mm25shroo1oy81pds	12919	24	25900.00
mm25shroo1oy81pds	12951	24	27900.00
mm25shroo1oy81pds	12937	24	14900.00
mm25shroo1oy81pds	12862	24	23900.00
mm25shroo1oy81pds	12911	24	18900.00
mm25shroo1oy81pds	12882	24	23900.00
mm25shroo1oy81pds	12952	24	26900.00
mm25shroo1oy81pds	12913	24	29900.00
mm25shroo1oy81pds	12880	24	24900.00
mm25shroo1oy81pds	12883	24	24900.00
mm25shroo1oy81pds	12885	24	23900.00
mm25shroo1oy81pds	12892	24	24900.00
mm25shroo1oy81pds	12704	24	29900.00
mm25shroo1oy81pds	12888	24	19900.00
mm25shroo1oy81pds	12939	24	20900.00
mm25shroo1oy81pds	12366	24	19900.00
mm25shroo1oy81pds	12893	24	24900.00
mm25shroo1oy81pds	12921	24	24900.00
mm25shroo1oy81pds	12860	24	16900.00
mm25shroo1oy81pds	12754	24	16900.00
mm25shroo1oy81pds	12000	24	49900.00
mm25shroo1oy81pds	12771	24	16900.00
mm25shroo1oy81pds	12574	24	25900.00
mm25shroo1oy81pds	12876	24	19900.00
mm25shroo1oy81pds	12950	24	27900.00
mm25shroo1oy81pds	12877	24	19900.00
mm25shroo1oy81pds	12917	24	19900.00
mm25shroo1oy81pds	12680	24	16900.00
mm25shroo1oy81pds	12897	24	19900.00
mm25shroo1oy81pds	12945	24	19900.00
mm25shroo1oy81pds	12918	24	19900.00
mm25zlnrm0l8pxyk3	12885	24	23900.00
mm25zlnrm0l8pxyk3	12884	24	21900.00
mm25zlnrm0l8pxyk3	12860	24	16900.00
mm25zlnrm0l8pxyk3	12910	24	22900.00
mm25zlnrm0l8pxyk3	12782	24	17900.00
mm25zlnrm0l8pxyk3	12915	24	28900.00
mm25zlnrm0l8pxyk3	12783	24	17900.00
mm25zlnrm0l8pxyk3	12921	24	24900.00
mm25zlnrm0l8pxyk3	12924	24	21900.00
mm25zlnrm0l8pxyk3	12888	24	19900.00
mm25zlnrm0l8pxyk3	12939	24	20900.00
mm25zlnrm0l8pxyk3	12871	24	19900.00
mm25zlnrm0l8pxyk3	12931	24	29900.00
mm25zlnrm0l8pxyk3	12950	24	27900.00
mm25zlnrm0l8pxyk3	12912	24	18900.00
mm25zlnrm0l8pxyk3	12876	24	19900.00
mm25zlnrm0l8pxyk3	12917	24	19900.00
mm25shroo1oy81pds	12920	24	21900.00
mm25shroo1oy81pds	12934	24	24900.00
mm25zgt5curej417m	12951	9	27900.00
mm25zgt5curej417m	12909	9	23900.00
mm25zgt5curej417m	12926	8	27900.00
mm25zgt5curej417m	12919	8	25900.00
mm25zgt5curej417m	12873	8	22900.00
mm25zgt5curej417m	12937	15	14900.00
mm25zgt5curej417m	12893	9	24900.00
mm25zgt5curej417m	12883	9	24900.00
mm25zgt5curej417m	12924	9	21900.00
mm25zgt5curej417m	12871	8	19900.00
mm25zgt5curej417m	12931	8	29900.00
mm25zgt5curej417m	12920	8	21900.00
mm25shroo1oy81pds	12943	24	19900.00
mm25shroo1oy81pds	12898	24	24900.00
mm25rzt79inviirmd	12923	18	23900.00
mm25rzt79inviirmd	12882	18	23900.00
mm25rzt79inviirmd	12909	18	23900.00
mm25rzt79inviirmd	12872	18	23900.00
mm261zsok2g1m5dod	12640	8	24900.00
mm261zsok2g1m5dod	12884	8	21900.00
mm261zsok2g1m5dod	12783	8	17900.00
mm261zsok2g1m5dod	12860	8	16900.00
mm261zsok2g1m5dod	12692	8	21900.00
mm261zsok2g1m5dod	12918	8	19900.00
mm261zsok2g1m5dod	12912	8	18900.00
mm261zsok2g1m5dod	12754	8	16900.00
mm261zsok2g1m5dod	12907	6	28900.00
mm261zsok2g1m5dod	12908	6	28900.00
mm261zsok2g1m5dod	12935	6	35900.00
mm261zsok2g1m5dod	12744	6	19900.00
mm261zsok2g1m5dod	12885	8	23900.00
mm261zsok2g1m5dod	12909	8	23900.00
mm261zsok2g1m5dod	12914	8	33900.00
mm261zsok2g1m5dod	12911	8	18900.00
mm261zsok2g1m5dod	12880	8	24900.00
mm261zsok2g1m5dod	12937	8	14900.00
mm25rzt79inviirmd	12911	18	18900.00
mm25rzt79inviirmd	12919	18	24900.00
mm25rzt79inviirmd	12926	18	26900.00
mm25rzt79inviirmd	12835	12	19900.00
mm25rzt79inviirmd	12831	12	23900.00
mm25rzt79inviirmd	12836	12	20900.00
mm25rzt79inviirmd	12855	12	23900.00
mm25rzt79inviirmd	12129	12	26900.00
mm25rzt79inviirmd	12841	12	19900.00
mm25rzt79inviirmd	12834	12	16900.00
mm25rzt79inviirmd	12825	12	21900.00
mm25rzt79inviirmd	12818	12	40900.00
mm25rzt79inviirmd	12821	12	33900.00
mm25rzt79inviirmd	12840	12	33900.00
mmpgtfe31h7o4pg3g	13016	54	32000.00
mmpgtfe31h7o4pg3g	13002	54	42000.00
mmpgtfe31h7o4pg3g	13015	54	35000.00
mmph224zawpf1wfbp	12990	6	32400.00
mm261wafiiiwwshld	12933	12	34900.00
mm261wafiiiwwshld	12908	12	28900.00
mm261wafiiiwwshld	12870	12	35900.00
mm261wafiiiwwshld	12881	12	33900.00
mm261wafiiiwwshld	12920	12	21900.00
mm261wafiiiwwshld	12892	12	24900.00
mm261wafiiiwwshld	12943	12	19900.00
mm261wafiiiwwshld	12640	12	24900.00
mm261wafiiiwwshld	12910	12	22900.00
mm261wafiiiwwshld	12922	12	21900.00
mm261wafiiiwwshld	12921	12	24900.00
mm261wafiiiwwshld	12884	12	21900.00
mm261wafiiiwwshld	12871	12	19900.00
mm261wafiiiwwshld	12888	12	19900.00
mm261wafiiiwwshld	12917	12	19900.00
mm261wafiiiwwshld	12771	12	16900.00
mm261wafiiiwwshld	12877	12	19900.00
mm261wafiiiwwshld	12893	12	24900.00
mm261sicytqircpx5	12698	12	21900.00
mm261sicytqircpx5	12737	12	22900.00
mm261sicytqircpx5	12754	12	16900.00
mm261sicytqircpx5	12876	12	19900.00
mm261sicytqircpx5	12805	12	19900.00
mm261sicytqircpx5	12893	12	24900.00
mm261sicytqircpx5	12931	12	29900.00
mm261sicytqircpx5	12911	12	18900.00
mm261sicytqircpx5	12908	12	28900.00
mm261sicytqircpx5	12933	12	34900.00
mm261sicytqircpx5	12744	12	19900.00
mm261sicytqircpx5	12907	12	28900.00
mm261sicytqircpx5	12935	12	35900.00
mmph224zawpf1wfbp	13012	6	39400.00
mmph224zawpf1wfbp	13103	6	45400.00
mmph224zawpf1wfbp	12964	6	46400.00
mmph224zawpf1wfbp	12959	6	37400.00
mmph224zawpf1wfbp	12960	6	39400.00
mmph224zawpf1wfbp	13076	6	27400.00
mmph224zawpf1wfbp	13113	6	49400.00
mmph224zawpf1wfbp	13102	6	29400.00
mmph224zawpf1wfbp	13016	6	32400.00
mmph224zawpf1wfbp	13077	6	42400.00
mmph224zawpf1wfbp	13112	6	37400.00
mmph224zawpf1wfbp	13002	6	41400.00
mmph224zawpf1wfbp	13055	6	29400.00
mmph224zawpf1wfbp	13117	6	23400.00
mmph224zawpf1wfbp	13116	6	21400.00
mmph224zawpf1wfbp	13118	6	21400.00
mmph224zawpf1wfbp	13094	6	21400.00
mmph224zawpf1wfbp	12709	6	19400.00
mmph224zawpf1wfbp	13068	6	21400.00
mmph224zawpf1wfbp	13008	6	33400.00
mmph224zawpf1wfbp	13036	6	29400.00
mmph224zawpf1wfbp	13100	6	25400.00
mmph224zawpf1wfbp	12747	6	31400.00
mmph224zawpf1wfbp	12783	6	17400.00
mmph224zawpf1wfbp	13079	6	19400.00
mmph224zawpf1wfbp	12968	6	44400.00
mmph224zawpf1wfbp	13014	6	29400.00
mmph224zawpf1wfbp	13015	6	37400.00
mmph224zawpf1wfbp	12973	6	42400.00
mm25zbho4eabh3lh4	12951	4	27900.00
mm25zbho4eabh3lh4	12909	4	23900.00
mm25zbho4eabh3lh4	12747	4	31900.00
mm25zbho4eabh3lh4	12872	6	24900.00
mm25zbho4eabh3lh4	12926	4	27900.00
mm25zbho4eabh3lh4	12919	4	25900.00
mm25zbho4eabh3lh4	12873	4	22900.00
mm25zbho4eabh3lh4	12923	4	24900.00
mm25zbho4eabh3lh4	12882	4	23900.00
mm25zbho4eabh3lh4	12862	4	23900.00
mm25zbho4eabh3lh4	12952	4	26900.00
mm25zbho4eabh3lh4	12911	4	18900.00
mm261ny1d0yfufg6p	12878	6	64900.00
mm261ny1d0yfufg6p	12868	6	69900.00
mm261ny1d0yfufg6p	12698	12	21900.00
mm261ny1d0yfufg6p	12936	12	14900.00
mm261ny1d0yfufg6p	12917	12	19900.00
mm261ny1d0yfufg6p	12897	12	19900.00
mm261ny1d0yfufg6p	12876	12	19900.00
mm261ny1d0yfufg6p	12945	12	19900.00
mm261ny1d0yfufg6p	12771	12	16900.00
mm261ny1d0yfufg6p	12912	12	18900.00
mm261ny1d0yfufg6p	12877	12	19900.00
mm261ny1d0yfufg6p	12704	12	29900.00
mm261ny1d0yfufg6p	12754	12	16900.00
mm261ny1d0yfufg6p	12865	12	16900.00
mm261ny1d0yfufg6p	12805	12	19900.00
mm261ny1d0yfufg6p	12921	12	24900.00
mm261ny1d0yfufg6p	12924	12	21900.00
mm261ny1d0yfufg6p	12884	12	21900.00
mm261ny1d0yfufg6p	12860	12	16900.00
mm261ny1d0yfufg6p	12871	12	19900.00
mm261ny1d0yfufg6p	12943	12	19900.00
mm261ny1d0yfufg6p	12934	12	24900.00
mm261ny1d0yfufg6p	12920	12	21900.00
mm261ny1d0yfufg6p	12644	12	24900.00
mm261ny1d0yfufg6p	12951	12	27900.00
mm261ny1d0yfufg6p	12882	12	23900.00
mm261ny1d0yfufg6p	12880	12	24900.00
mm261ny1d0yfufg6p	12913	12	29900.00
mm261ny1d0yfufg6p	12911	12	18900.00
mm261ny1d0yfufg6p	12883	12	24900.00
mm261ny1d0yfufg6p	12909	12	23900.00
mm261ny1d0yfufg6p	12875	12	19900.00
mm261ny1d0yfufg6p	12937	12	14900.00
mm261ny1d0yfufg6p	12879	12	38900.00
mm261ny1d0yfufg6p	12870	12	35900.00
mm261ny1d0yfufg6p	12906	12	28900.00
mm261ny1d0yfufg6p	12744	12	19900.00
mm261ny1d0yfufg6p	12907	12	28900.00
mm261ny1d0yfufg6p	12881	12	33900.00
mm261ny1d0yfufg6p	12905	12	34900.00
mm261ny1d0yfufg6p	12908	12	28900.00
mm25zbho4eabh3lh4	12937	4	14900.00
mm25zbho4eabh3lh4	12941	4	20900.00
mm25zbho4eabh3lh4	12885	4	23900.00
mm25zbho4eabh3lh4	12883	4	24900.00
mm25zbho4eabh3lh4	12877	4	19900.00
mm25zbho4eabh3lh4	12898	4	24900.00
mm25zbho4eabh3lh4	12920	4	21900.00
mm25zbho4eabh3lh4	12945	4	19900.00
mm25zbho4eabh3lh4	12934	4	24900.00
mm25zbho4eabh3lh4	12936	4	14900.00
mm25zbho4eabh3lh4	12897	4	19900.00
mm25zbho4eabh3lh4	12870	4	35900.00
mm25zbho4eabh3lh4	12805	4	19900.00
mm25zbho4eabh3lh4	12892	4	24900.00
mm25zbho4eabh3lh4	12931	4	29900.00
mm25zbho4eabh3lh4	12924	4	21900.00
mm25zbho4eabh3lh4	12860	4	16900.00
mm25zbho4eabh3lh4	12884	4	21900.00
mm25zbho4eabh3lh4	12640	4	24900.00
mm25zbho4eabh3lh4	12921	4	24900.00
mm25zbho4eabh3lh4	12692	4	21900.00
mm25zbho4eabh3lh4	12871	4	19900.00
mm25zbho4eabh3lh4	12783	4	17900.00
mm25z6898ea5cmw0f	12898	6	24900.00
mm25z6898ea5cmw0f	12920	6	21900.00
mm25z6898ea5cmw0f	12945	6	19900.00
mm25z6898ea5cmw0f	12934	6	24900.00
mm25z6898ea5cmw0f	12805	6	19900.00
mm25z6898ea5cmw0f	12907	6	28900.00
mm25z6898ea5cmw0f	12744	6	19900.00
mm25z6898ea5cmw0f	12906	6	28900.00
mm25z6898ea5cmw0f	12935	6	35900.00
mm25z6898ea5cmw0f	12908	6	28900.00
mm25z6898ea5cmw0f	12881	6	33900.00
mm25z6898ea5cmw0f	12924	6	21900.00
mm25z6898ea5cmw0f	12937	6	14900.00
mm25z6898ea5cmw0f	12913	6	29900.00
mm25z6898ea5cmw0f	12911	6	18900.00
mm25z6898ea5cmw0f	12952	6	26900.00
mm25z6898ea5cmw0f	12919	6	25900.00
mm25z6898ea5cmw0f	12926	6	27900.00
mm25z6898ea5cmw0f	12872	6	24900.00
mmpgxr0cmqouvxsuz	13023	24	34900.00
mmpgxr0cmqouvxsuz	12959	24	37900.00
mmpgxr0cmqouvxsuz	13002	24	41900.00
mmpgxr0cmqouvxsuz	12498	24	21900.00
mmpgxr0cmqouvxsuz	13067	24	39900.00
mmpgxr0cmqouvxsuz	12617	36	35900.00
mmpgxr0cmqouvxsuz	12975	36	34900.00
mmpgxr0cmqouvxsuz	12581	36	32900.00
mmpgxr0cmqouvxsuz	13028	36	35900.00
mmpgxr0cmqouvxsuz	12984	36	24900.00
mmpgxr0cmqouvxsuz	13029	36	32900.00
mmpgxr0cmqouvxsuz	12986	36	34900.00
mmpgxr0cmqouvxsuz	13039	24	30900.00
mmpgxr0cmqouvxsuz	13055	24	29900.00
mmpgxr0cmqouvxsuz	13100	24	25900.00
mmpgxr0cmqouvxsuz	13033	24	29900.00
mmpgxr0cmqouvxsuz	13010	24	29900.00
mmpgxr0cmqouvxsuz	12909	24	23900.00
mmpgxr0cmqouvxsuz	13116	24	21900.00
mmpgxr0cmqouvxsuz	12980	24	20900.00
mmpgxr0cmqouvxsuz	13110	24	19900.00
mmpgxr0cmqouvxsuz	13083	24	19900.00
mmpgxr0cmqouvxsuz	13079	24	19900.00
mmpgxr0cmqouvxsuz	13091	24	18900.00
mmpgxr0cmqouvxsuz	13121	24	22900.00
mmt9f0zv75r8qf1g9	13098	6	22900.00
mmt9f0zv75r8qf1g9	13013	6	23900.00
mmt9f0zv75r8qf1g9	12609	6	24900.00
mmt9f0zv75r8qf1g9	13029	3	32900.00
mmt9f0zv75r8qf1g9	12905	6	34900.00
mmt9f0zv75r8qf1g9	12881	6	33900.00
mmt9f0zv75r8qf1g9	12907	6	28900.00
mmt9f0zv75r8qf1g9	12986	6	34900.00
mmt9f0zv75r8qf1g9	12908	6	28900.00
mmt9gf24g1f0g2km0	12692	21	21900.00
mmt9gf24g1f0g2km0	13029	9	32900.00
mmt9gf24g1f0g2km0	12617	15	35900.00
mmt9gf24g1f0g2km0	12907	15	28900.00
mmt9gf24g1f0g2km0	13047	8	25900.00
mmt9gf24g1f0g2km0	12579	12	39900.00
mmt9gf24g1f0g2km0	13077	8	42900.00
mmt9gf24g1f0g2km0	13094	24	21900.00
mmt9gf24g1f0g2km0	12931	8	29900.00
mmt9gf24g1f0g2km0	12971	10	36900.00
mmt9gf24g1f0g2km0	13116	15	21900.00
mmt9gf24g1f0g2km0	13128	30	23900.00
mmt9gf24g1f0g2km0	12747	12	31900.00
mmt9gf24g1f0g2km0	13068	12	21900.00
mmt9gf24g1f0g2km0	13110	12	19900.00
mmt9gf24g1f0g2km0	12943	9	19900.00
mmt9gf24g1f0g2km0	13120	15	17900.00
mmt9gf24g1f0g2km0	13081	27	19900.00
mmt9gf24g1f0g2km0	12877	18	19900.00
mmt9gf24g1f0g2km0	12771	15	16900.00
mmt9gf24g1f0g2km0	13122	6	18900.00
mmt9gf24g1f0g2km0	12754	21	16900.00
mmt9gf24g1f0g2km0	13079	15	19900.00
mmt9gf24g1f0g2km0	12909	18	19900.00
mmt9gf24g1f0g2km0	12972	6	48900.00
mmt9gf24g1f0g2km0	13067	12	39900.00
mmt9hjj6xd4mpipig	13122	18	18900.00
mmt9hjj6xd4mpipig	13078	18	22900.00
mmt9hjj6xd4mpipig	13096	18	24900.00
mmt9hjj6xd4mpipig	13047	18	27900.00
mmt9hjj6xd4mpipig	12965	18	27900.00
mmt9hjj6xd4mpipig	13119	18	19900.00
mmt9hjj6xd4mpipig	13013	18	23900.00
mmt9hjj6xd4mpipig	13036	18	29900.00
mmt9hjj6xd4mpipig	13033	18	29900.00
mmt9hjj6xd4mpipig	13010	18	29900.00
mmt9hjj6xd4mpipig	13100	18	25900.00
mmt9hjj6xd4mpipig	13116	18	21900.00
mmt9hjj6xd4mpipig	13117	18	24900.00
mmt9hjj6xd4mpipig	13091	18	18900.00
mmt9hjj6xd4mpipig	13121	18	22900.00
mmt9hjj6xd4mpipig	13110	18	19900.00
mmt9hjj6xd4mpipig	13129	18	22900.00
mmt9hjj6xd4mpipig	13079	18	19900.00
mmt9hjj6xd4mpipig	12884	18	21900.00
mmt9hjj6xd4mpipig	13094	18	21900.00
mmt9hjj6xd4mpipig	12895	18	30900.00
mmt9ijwvjz21wl7nq	13074	18	19900.00
mmt9ijwvjz21wl7nq	13091	18	19900.00
mmt9ijwvjz21wl7nq	13121	18	19900.00
mmt9ijwvjz21wl7nq	13110	18	19900.00
mmt9ijwvjz21wl7nq	13129	18	19900.00
mmt9ijwvjz21wl7nq	13079	18	19900.00
mmt9ijwvjz21wl7nq	12884	18	19900.00
mmt9ijwvjz21wl7nq	13094	18	19900.00
mmt9ijwvjz21wl7nq	13068	18	21900.00
mmt9ijwvjz21wl7nq	13116	18	21900.00
mmt9ijwvjz21wl7nq	13117	18	21900.00
mmt9ijwvjz21wl7nq	13100	18	24900.00
mmt9ijwvjz21wl7nq	13011	18	27900.00
mmt9ijwvjz21wl7nq	13036	18	27900.00
mmt9ijwvjz21wl7nq	13033	18	27900.00
mmt9ijwvjz21wl7nq	13010	18	27900.00
mmt9ijwvjz21wl7nq	13013	18	21900.00
mmt9ijwvjz21wl7nq	13004	18	19900.00
mmt9ijwvjz21wl7nq	12943	18	19900.00
mmt9ijwvjz21wl7nq	13119	18	19900.00
mmt9ijwvjz21wl7nq	13131	18	19900.00
mmt9ijwvjz21wl7nq	13047	18	27900.00
mmt9ijwvjz21wl7nq	12965	18	27900.00
mmt9ijwvjz21wl7nq	13041	18	29900.00
mmt9ijwvjz21wl7nq	13028	18	34900.00
mmt9ijwvjz21wl7nq	13027	18	33900.00
mmt9ijwvjz21wl7nq	12974	18	34900.00
mmt9ka1qt9uumiqoj	13002	8	41900.00
mmt9ka1qt9uumiqoj	12402	8	39900.00
mmt9ka1qt9uumiqoj	13102	8	29900.00
mmt9ka1qt9uumiqoj	13113	8	49900.00
mmt9ka1qt9uumiqoj	12692	12	22900.00
mmt9ka1qt9uumiqoj	12869	8	31900.00
mmt9ka1qt9uumiqoj	13104	8	39900.00
mmt9ka1qt9uumiqoj	12969	12	21900.00
mmt9ka1qt9uumiqoj	12704	8	29900.00
mmt9ka1qt9uumiqoj	12971	8	36900.00
mmt9ka1qt9uumiqoj	13039	8	30900.00
mmt9ka1qt9uumiqoj	12744	12	19900.00
mmt9ka1qt9uumiqoj	12986	8	34900.00
mmt9ka1qt9uumiqoj	13094	12	21900.00
mmt9ka1qt9uumiqoj	13117	12	23900.00
mmt9ka1qt9uumiqoj	12965	8	27900.00
mmt9ka1qt9uumiqoj	13040	8	32900.00
mmt9ka1qt9uumiqoj	13048	8	25900.00
mmt9ka1qt9uumiqoj	13013	12	23900.00
mmt9ka1qt9uumiqoj	12623	8	29900.00
mmt9ka1qt9uumiqoj	12909	12	19900.00
mmt9ka1qt9uumiqoj	12877	12	19900.00
mmt9ka1qt9uumiqoj	12771	12	16900.00
mmt9ka1qt9uumiqoj	13120	12	17900.00
mmt9ka1qt9uumiqoj	13110	12	19900.00
mmt9ka1qt9uumiqoj	12943	12	19900.00
mmt9ka1qt9uumiqoj	13131	12	19900.00
mmt9ka1qt9uumiqoj	13091	12	18900.00
mmt9nlw0bj2eouw27	13103	5	45900.00
mmt9nlw0bj2eouw27	12972	5	48900.00
mmt9nlw0bj2eouw27	12966	5	43900.00
mmt9nlw0bj2eouw27	13104	5	39900.00
mmt9nlw0bj2eouw27	12964	5	46900.00
mmt9nlw0bj2eouw27	12412	5	34900.00
mmt9nlw0bj2eouw27	13002	5	41900.00
mmt9nlw0bj2eouw27	13065	5	32900.00
mmt9nlw0bj2eouw27	13076	5	27900.00
mmt9nlw0bj2eouw27	13064	5	32900.00
mmt9nlw0bj2eouw27	13102	5	29900.00
mmt9nlw0bj2eouw27	13077	5	42900.00
mmt9nlw0bj2eouw27	12990	5	32900.00
mmt9nlw0bj2eouw27	12963	5	35900.00
mmt9nlw0bj2eouw27	13015	5	37900.00
mmt9nlw0bj2eouw27	13115	5	49900.00
mmt9nlw0bj2eouw27	13035	5	38900.00
mmt9nlw0bj2eouw27	13036	5	29900.00
mmt9nlw0bj2eouw27	13117	5	24900.00
mmt9nlw0bj2eouw27	13116	5	21900.00
mmt9nlw0bj2eouw27	13094	5	21900.00
mmt9nlw0bj2eouw27	13129	5	22900.00
mmt9nlw0bj2eouw27	13110	5	19900.00
mmt9nlw0bj2eouw27	13078	5	22900.00
mmt9nlw0bj2eouw27	13119	5	19900.00
mmt9nlw0bj2eouw27	13073	5	15900.00
mmt9nlw0bj2eouw27	13131	5	19900.00
mmt9nlw0bj2eouw27	13041	5	29900.00
mmt9nlw0bj2eouw27	13047	5	27900.00
mmt9nlw0bj2eouw27	13120	5	18900.00
mmt9nlw0bj2eouw27	13042	5	29900.00
mmt9nlw0bj2eouw27	12969	5	21900.00
mmt9nlw0bj2eouw27	13084	5	29900.00
mmt9nlw0bj2eouw27	13043	5	34900.00
mmt9nlw0bj2eouw27	12895	5	30900.00
mmt9nlw0bj2eouw27	12967	5	24900.00
mmt9nlw0bj2eouw27	13001	5	32900.00
mmt9nlw0bj2eouw27	13040	5	32900.00
mmt9nlw0bj2eouw27	12709	5	19900.00
mmt9nlw0bj2eouw27	12976	5	37900.00
mmt9nlw0bj2eouw27	12987	5	27900.00
mmt9nlw0bj2eouw27	12975	5	34900.00
mmt9nlw0bj2eouw27	12986	5	34900.00
mmt9nlw0bj2eouw27	12965	5	34900.00
mmt9nlw0bj2eouw27	12984	5	24900.00
mmt9nlw0bj2eouw27	12744	5	19900.00
mmt9nlw0bj2eouw27	13029	5	32900.00
mmt9omzsn8q7wdcw0	13014	24	30000.00
mmt9omzsn8q7wdcw0	12579	24	38000.00
mmt9omzsn8q7wdcw0	13112	24	36000.00
mmt9omzsn8q7wdcw0	12976	24	36000.00
mmt9omzsn8q7wdcw0	12975	24	33000.00
mmt9omzsn8q7wdcw0	13048	24	23000.00
mmt9omzsn8q7wdcw0	13039	24	29000.00
mmt9omzsn8q7wdcw0	12973	24	41000.00
mmt9omzsn8q7wdcw0	12970	24	34900.00
mmt9omzsn8q7wdcw0	12712	24	26900.00
mmt9omzsn8q7wdcw0	13057	24	23000.00
mmt9omzsn8q7wdcw0	13042	24	28000.00
mmt9omzsn8q7wdcw0	13047	24	26000.00
mmt9omzsn8q7wdcw0	12965	24	26000.00
mmt9omzsn8q7wdcw0	12971	24	35000.00
mmt9omzsn8q7wdcw0	12969	24	21900.00
mmt9omzsn8q7wdcw0	12895	24	29900.00
mmt9omzsn8q7wdcw0	13040	24	31000.00
mmt9omzsn8q7wdcw0	13078	24	21000.00
mmt9omzsn8q7wdcw0	13121	24	21000.00
mmt9omzsn8q7wdcw0	13074	24	18000.00
mmt9omzsn8q7wdcw0	13094	24	20000.00
mmt9omzsn8q7wdcw0	13091	24	18000.00
mmt9omzsn8q7wdcw0	13129	24	21000.00
mmt9omzsn8q7wdcw0	13083	24	19000.00
mmt9omzsn8q7wdcw0	13118	24	20000.00
mmt9omzsn8q7wdcw0	13131	24	19000.00
mmt9omzsn8q7wdcw0	13120	24	17000.00
mmt9omzsn8q7wdcw0	12777	24	13900.00
mmt9omzsn8q7wdcw0	13013	24	22000.00
mmt9omzsn8q7wdcw0	13116	24	20000.00
mmt9omzsn8q7wdcw0	12909	24	22000.00
mmt9omzsn8q7wdcw0	13077	24	41000.00
mmt9omzsn8q7wdcw0	12963	24	34000.00
mmt9omzsn8q7wdcw0	13115	24	48000.00
mmt9pnknmcc4u2twt	12964	6	46900.00
mmt9pnknmcc4u2twt	13002	6	41900.00
mmt9pnknmcc4u2twt	13115	6	49900.00
mmt9pnknmcc4u2twt	13112	6	37900.00
mmt9pnknmcc4u2twt	13036	6	29900.00
mmt9pnknmcc4u2twt	12980	6	22900.00
mmt9pnknmcc4u2twt	13067	6	33900.00
mmt9pnknmcc4u2twt	13117	6	24900.00
mmt9pnknmcc4u2twt	13033	6	29900.00
mmt9pnknmcc4u2twt	13128	6	23900.00
mmt9pnknmcc4u2twt	12909	6	19900.00
mmt9pnknmcc4u2twt	13095	6	17900.00
mmt9pnknmcc4u2twt	13094	6	21900.00
mmt9pnknmcc4u2twt	13042	6	29900.00
mmt9pnknmcc4u2twt	12973	6	42900.00
mmt9pnknmcc4u2twt	13043	6	34900.00
mmt9pnknmcc4u2twt	13254	6	34900.00
mmt9pnknmcc4u2twt	13058	6	29900.00
mmt9pnknmcc4u2twt	13055	6	29900.00
mmt9pnknmcc4u2twt	12965	6	27900.00
mmt9pnknmcc4u2twt	12976	6	37900.00
mmt9pnknmcc4u2twt	12987	6	27900.00
mmt9pnknmcc4u2twt	12975	6	34900.00
mmt9pnknmcc4u2twt	13028	6	35900.00
mmt9pnknmcc4u2twt	12744	6	19900.00
mmt9pnknmcc4u2twt	12935	6	35900.00
mmt9pnknmcc4u2twt	12986	6	34900.00
mmt9qjskej5ms6x1x	12895	18	29900.00
mmt9qjskej5ms6x1x	12965	18	26900.00
mmt9qjskej5ms6x1x	13048	18	23900.00
mmt9qjskej5ms6x1x	12967	18	23900.00
mmt9qjskej5ms6x1x	13045	18	24900.00
mmt9qjskej5ms6x1x	13096	18	23900.00
mmt9qjskej5ms6x1x	12987	12	26900.00
mmt9qjskej5ms6x1x	12744	18	18900.00
mmt9qjskej5ms6x1x	12984	18	24900.00
mmt9qjskej5ms6x1x	12907	18	28900.00
mmt9qjskej5ms6x1x	12877	18	18900.00
mmt9qjskej5ms6x1x	13097	18	23900.00
mmt9qjskej5ms6x1x	12920	18	20900.00
mmt9qjskej5ms6x1x	13013	18	22900.00
mmt9qjskej5ms6x1x	12609	18	23900.00
mmt9qjskej5ms6x1x	12888	18	18900.00
mmt9qjskej5ms6x1x	13094	18	20900.00
mmt9qjskej5ms6x1x	13083	18	18900.00
mmt9qjskej5ms6x1x	13129	18	21900.00
mmt9qjskej5ms6x1x	12909	12	19900.00
mmt9qjskej5ms6x1x	13068	12	21900.00
mmt9qjskej5ms6x1x	13116	12	21900.00
mmt9qjskej5ms6x1x	13128	12	22900.00
mmt9qjskej5ms6x1x	13033	12	28900.00
mmt9qjskej5ms6x1x	13014	12	31900.00
mmt9qjskej5ms6x1x	12579	12	39900.00
mmt9qjskej5ms6x1x	13104	12	35900.00
mmt9qjskej5ms6x1x	12972	12	46900.00
mmt9qjskej5ms6x1x	12869	12	31900.00
mmt9qjskej5ms6x1x	13112	12	36900.00
mmt9qjskej5ms6x1x	12990	12	37900.00
mmt9r6b2q007ajtnt	13102	6	29900.00
mmt9r6b2q007ajtnt	12959	6	37900.00
mmt9r6b2q007ajtnt	13023	6	34900.00
mmt9r6b2q007ajtnt	13077	4	42900.00
mmt9r6b2q007ajtnt	13113	4	49900.00
mmt9r6b2q007ajtnt	13115	4	49900.00
mmt9r6b2q007ajtnt	13014	4	29900.00
mmt9r6b2q007ajtnt	12964	4	46900.00
mmt9r6b2q007ajtnt	12966	4	43900.00
mmt9r6b2q007ajtnt	13033	4	29900.00
mmt9r6b2q007ajtnt	13100	4	25900.00
mmt9r6b2q007ajtnt	12909	6	19900.00
mmt9r6b2q007ajtnt	12671	4	29900.00
mmt9r6b2q007ajtnt	13040	4	32900.00
mmt9r6b2q007ajtnt	12895	4	30900.00
mmt9r6b2q007ajtnt	12609	4	24900.00
mmt9r6b2q007ajtnt	12965	4	27900.00
mmt9r6b2q007ajtnt	13058	4	29900.00
mmt9r6b2q007ajtnt	12973	4	42900.00
mmt9r6b2q007ajtnt	13042	4	29900.00
mmt9r6b2q007ajtnt	13013	4	23900.00
mmt9r6b2q007ajtnt	13097	4	24900.00
mmt9s8xtkyhxxqxvt	13077	12	41900.00
mmt9s8xtkyhxxqxvt	13076	12	26900.00
mmt9s8xtkyhxxqxvt	12963	12	34900.00
mmt9s8xtkyhxxqxvt	12962	12	43900.00
mmt9s8xtkyhxxqxvt	13113	12	48900.00
mmt9s8xtkyhxxqxvt	13065	12	31900.00
mmt9s8xtkyhxxqxvt	13120	12	17900.00
mmt9s8xtkyhxxqxvt	13119	12	18900.00
mmt9s8xtkyhxxqxvt	12964	12	45900.00
mmt9s8xtkyhxxqxvt	13055	12	28900.00
mmt9s8xtkyhxxqxvt	13046	12	26900.00
mmt9s8xtkyhxxqxvt	12931	12	28900.00
mmt9s8xtkyhxxqxvt	13001	12	31900.00
mmt9s8xtkyhxxqxvt	13028	12	34900.00
mmt9s8xtkyhxxqxvt	13029	12	31900.00
mmt9s8xtkyhxxqxvt	12972	12	46900.00
mmt9s8xtkyhxxqxvt	13107	12	28900.00
mmt9s8xtkyhxxqxvt	13014	12	31900.00
mmt9s8xtkyhxxqxvt	13013	12	22900.00
mmt9s8xtkyhxxqxvt	12967	12	23900.00
mmt9s8xtkyhxxqxvt	13048	12	23900.00
mmt9s8xtkyhxxqxvt	12895	12	29900.00
mmt9s8xtkyhxxqxvt	12609	12	23900.00
mmt9s8xtkyhxxqxvt	13045	12	24900.00
mmt9s8xtkyhxxqxvt	12908	12	28900.00
mmt9s8xtkyhxxqxvt	12984	12	24900.00
mmt9s8xtkyhxxqxvt	12744	12	18900.00
mmt9s8xtkyhxxqxvt	12987	12	26900.00
mmt9tei8ytk1h00vz	13077	9	41900.00
mmt9tei8ytk1h00vz	13076	6	26900.00
mmt9tei8ytk1h00vz	12963	9	34900.00
mmt9tei8ytk1h00vz	12962	9	43900.00
mmt9tei8ytk1h00vz	13113	9	48900.00
mmt9tei8ytk1h00vz	13065	9	31900.00
mmt9tei8ytk1h00vz	12964	9	45900.00
mmt9tei8ytk1h00vz	12972	9	46900.00
mmt9tei8ytk1h00vz	13107	9	28900.00
mmt9tei8ytk1h00vz	13014	9	31900.00
mmt9tei8ytk1h00vz	13119	12	18900.00
mmt9tei8ytk1h00vz	13120	12	17900.00
mmt9tei8ytk1h00vz	13001	9	31900.00
mmt9tei8ytk1h00vz	13013	9	22900.00
mmt9tei8ytk1h00vz	12967	9	23900.00
mmt9tei8ytk1h00vz	13048	9	23900.00
mmt9tei8ytk1h00vz	12895	9	29900.00
mmt9tei8ytk1h00vz	12609	9	23900.00
mmt9tei8ytk1h00vz	13045	9	24900.00
mmt9tei8ytk1h00vz	13046	9	26900.00
mmt9tei8ytk1h00vz	12931	9	28900.00
mmt9tei8ytk1h00vz	13055	6	28900.00
mmt9tei8ytk1h00vz	12908	9	28900.00
mmt9tei8ytk1h00vz	12984	9	24900.00
mmt9tei8ytk1h00vz	12744	9	18900.00
mmt9tei8ytk1h00vz	13028	9	34900.00
mmt9tei8ytk1h00vz	13029	9	31900.00
mmt9tei8ytk1h00vz	12987	9	26900.00
mmt9ud7lqklo7j0pc	12964	6	45900.00
mmt9ud7lqklo7j0pc	13055	6	29900.00
mmt9ud7lqklo7j0pc	13254	6	34900.00
mmt9ud7lqklo7j0pc	13058	6	29900.00
mmt9ud7lqklo7j0pc	13078	6	22900.00
mmt9ud7lqklo7j0pc	13129	6	22900.00
mmt9ud7lqklo7j0pc	13094	6	21900.00
mmt9ud7lqklo7j0pc	13067	6	33900.00
mmt9ud7lqklo7j0pc	12980	6	22900.00
mmt9ud7lqklo7j0pc	12909	6	19900.00
mmt9ud7lqklo7j0pc	13116	6	21900.00
mmt9ud7lqklo7j0pc	13013	6	23900.00
mmt9ud7lqklo7j0pc	12920	6	21900.00
mmt9ud7lqklo7j0pc	12744	6	19900.00
mmun9a0vcpsv8yiiw	12959	6	36900.00
mmun9a0vcpsv8yiiw	13002	6	40900.00
mmun9a0vcpsv8yiiw	13115	6	48900.00
mmun9a0vcpsv8yiiw	13104	6	35900.00
mmun9a0vcpsv8yiiw	13103	6	39900.00
mmun9a0vcpsv8yiiw	12972	6	47900.00
mmun9a0vcpsv8yiiw	12964	6	45900.00
mmun9a0vcpsv8yiiw	13036	6	28900.00
mmun9a0vcpsv8yiiw	13011	6	28900.00
mmun9a0vcpsv8yiiw	13068	6	20900.00
mmun9a0vcpsv8yiiw	13040	6	31900.00
mmun9a0vcpsv8yiiw	12973	6	41900.00
mmun9a0vcpsv8yiiw	13042	6	28900.00
mmun9a0vcpsv8yiiw	12965	6	26900.00
mmun9a0vcpsv8yiiw	12671	6	23900.00
mmun9a0vcpsv8yiiw	13003	6	31900.00
mmun9a0vcpsv8yiiw	13094	6	20900.00
mmun9a0vcpsv8yiiw	13120	6	18900.00
mmun9a0vcpsv8yiiw	13041	6	28900.00
mmun9a0vcpsv8yiiw	12693	6	24900.00
mmun9a0vcpsv8yiiw	12943	6	18900.00
mmun9a0vcpsv8yiiw	12905	6	33900.00
mmun9a0vcpsv8yiiw	12881	6	32900.00
mmun9a0vcpsv8yiiw	12935	6	34900.00
mmun9a0vcpsv8yiiw	12907	6	28900.00
mmun9a0vcpsv8yiiw	12744	6	19900.00
mmuz2vh288k4e59ve	13041	12	29900.00
mmuz2vh288k4e59ve	13001	12	32900.00
mmuz2vh288k4e59ve	13107	12	29900.00
mmuz2vh288k4e59ve	12972	12	48900.00
mmuz2vh288k4e59ve	13002	24	41900.00
mmuz2vh288k4e59ve	12652	24	29900.00
mmuz2vh288k4e59ve	12579	24	39900.00
mmuz2vh288k4e59ve	12968	24	44900.00
mmuz2vh288k4e59ve	13014	24	29900.00
mmuz2vh288k4e59ve	13068	24	21900.00
mmuz2vh288k4e59ve	13011	24	29900.00
mmuz2vh288k4e59ve	13036	24	29900.00
mmuz2vh288k4e59ve	13086	24	24900.00
mmuz2vh288k4e59ve	13116	24	21900.00
mmuz2vh288k4e59ve	13120	24	17900.00
mmuz2vh288k4e59ve	13029	24	32900.00
mmuz2vh288k4e59ve	12907	24	28900.00
mmuz2vh288k4e59ve	12986	24	34900.00
mmuz2vh288k4e59ve	12744	24	19900.00
mmuz2vh288k4e59ve	12984	24	24900.00
mmuz2vh288k4e59ve	12881	24	33900.00
mmuz2vh288k4e59ve	12905	24	34900.00
mmuz2vh288k4e59ve	12908	24	28900.00
mmuz2vh288k4e59ve	12935	24	35900.00
mmuz2vh288k4e59ve	12987	24	27900.00
mmuz2vh288k4e59ve	13042	24	29900.00
mmuz2vh288k4e59ve	13003	24	32900.00
mmuz2vh288k4e59ve	12965	24	27900.00
mmuz2vh288k4e59ve	13047	24	25900.00
mmuz2vh288k4e59ve	12971	24	36900.00
mmuz2vh288k4e59ve	13040	24	32900.00
mmuz2vh288k4e59ve	12712	24	25900.00
mmuz2vh288k4e59ve	13098	24	22900.00
mmuz2vh288k4e59ve	13129	24	22900.00
mmuz2vh288k4e59ve	13122	24	18900.00
mmuz2vh288k4e59ve	12963	24	35900.00
mmuz2vh288k4e59ve	13015	24	37900.00
mmuz2vh288k4e59ve	13023	24	34900.00
mmuz2vh288k4e59ve	13012	24	39900.00
mmuz2vh288k4e59ve	13016	24	32900.00
mmuz2vh288k4e59ve	12990	24	32900.00
mmuz2vh288k4e59ve	12869	24	31900.00
mmuz2vh288k4e59ve	13115	24	49900.00
mmuz2vh288k4e59ve	13102	36	29900.00
mmuz2vh288k4e59ve	12960	36	39900.00
mmuz2vh288k4e59ve	12962	36	44900.00
mmuz2vh288k4e59ve	13065	36	32900.00
mmuz2vh288k4e59ve	13104	36	35900.00
mmuz2vh288k4e59ve	13103	36	39900.00
mmuz2vh288k4e59ve	13100	36	25900.00
mmuz2vh288k4e59ve	13117	36	23900.00
mmuz2vh288k4e59ve	13090	36	21900.00
mmuz2vh288k4e59ve	13110	36	19900.00
mmuz2vh288k4e59ve	13074	36	19900.00
mmuz2vh288k4e59ve	13118	36	21900.00
mmuz2vh288k4e59ve	13094	36	21900.00
mmuz2vh288k4e59ve	13079	36	19900.00
mmuz2vh288k4e59ve	13078	36	22900.00
mmuz2vh288k4e59ve	13084	36	29900.00
mmuz2vh288k4e59ve	12969	36	21900.00
mmuz2vh288k4e59ve	12920	36	21900.00
mmuz2vh288k4e59ve	13013	36	23900.00
mmuz2vh288k4e59ve	12877	36	19900.00
mmuz2vh288k4e59ve	13097	36	24900.00
mmuz2vh288k4e59ve	12943	36	19900.00
mmuz3v4f45k1zx63o	12395	18	29900.00
mmuz3v4f45k1zx63o	12402	18	39900.00
mmuz3v4f45k1zx63o	13002	18	41900.00
mmuz3v4f45k1zx63o	13090	18	21900.00
mmuz3v4f45k1zx63o	13116	18	21900.00
mmuz3v4f45k1zx63o	12980	18	20900.00
mmuz3v4f45k1zx63o	13055	18	29900.00
mmuz3v4f45k1zx63o	13254	18	34900.00
mmuz3v4f45k1zx63o	13039	18	30900.00
mmuz3v4f45k1zx63o	13118	18	21900.00
mmuz3v4f45k1zx63o	13091	18	18900.00
mmuz3v4f45k1zx63o	13110	18	19900.00
mmuz3v4f45k1zx63o	13121	18	22900.00
mmuz3v4f45k1zx63o	12771	18	16900.00
mmuz3v4f45k1zx63o	12877	18	19900.00
mmuz3v4f45k1zx63o	13122	18	18900.00
mmuz3v4f45k1zx63o	12943	18	19900.00
mmuz3v4f45k1zx63o	12895	18	30900.00
mmuz3v4f45k1zx63o	13084	18	29900.00
mmwi1or2y1lmz89j1	13117	36	22900.00
mmwi1or2y1lmz89j1	13100	36	24900.00
mmwi1or2y1lmz89j1	13094	36	19900.00
mmwi1or2y1lmz89j1	13013	36	21900.00
mmwi1or2y1lmz89j1	12877	36	19900.00
mmwi1or2y1lmz89j1	13097	36	22900.00
mmwi1or2y1lmz89j1	12943	36	18900.00
mmwi1or2y1lmz89j1	12881	36	29900.00
mmwi1or2y1lmz89j1	12907	36	28900.00
mmwi22ybmtlp3xmn4	13117	18	22900.00
mmwi22ybmtlp3xmn4	13100	18	24900.00
mmwi22ybmtlp3xmn4	13094	18	19900.00
mmwi22ybmtlp3xmn4	13013	18	21900.00
mmwi22ybmtlp3xmn4	12877	18	19900.00
mmwi22ybmtlp3xmn4	13097	18	22900.00
mmwi22ybmtlp3xmn4	12943	18	18900.00
mmwi22ybmtlp3xmn4	12881	18	29900.00
mmwi22ybmtlp3xmn4	12907	18	28900.00
mmwi2g8gthkv4t76s	13117	18	22900.00
mmwi2g8gthkv4t76s	13100	18	24900.00
mmwi2g8gthkv4t76s	13094	18	19900.00
mmwi2g8gthkv4t76s	13013	18	21900.00
mmwi2g8gthkv4t76s	12877	18	19900.00
mmwi2g8gthkv4t76s	13097	18	22900.00
mmwi2g8gthkv4t76s	12943	18	18900.00
mmwi2g8gthkv4t76s	12881	18	29900.00
mmwi2g8gthkv4t76s	12907	18	28900.00
mmwi2xc7yi4fpkkkm	13117	12	22900.00
mmwi2xc7yi4fpkkkm	13094	12	19900.00
mmwi2xc7yi4fpkkkm	13013	12	21900.00
mmwi2xc7yi4fpkkkm	12877	12	19900.00
mmwi2xc7yi4fpkkkm	13097	12	22900.00
mmwi2xc7yi4fpkkkm	12881	12	29900.00
mmwi2xc7yi4fpkkkm	12907	12	28900.00
mmwi4lq7py8arrw07	13117	36	22900.00
mmwi4lq7py8arrw07	13100	36	25900.00
mmwi4lq7py8arrw07	12909	36	19900.00
mmwi4lq7py8arrw07	13094	36	19900.00
mmwi4lq7py8arrw07	13013	36	21900.00
mmwi4lq7py8arrw07	12877	36	19900.00
mmwi4lq7py8arrw07	13097	36	22900.00
mmwi4lq7py8arrw07	12943	36	18900.00
mmwi4lq7py8arrw07	12965	36	25900.00
mmwi4lq7py8arrw07	12969	36	20900.00
mmwi4lq7py8arrw07	12973	36	39900.00
mmwi4lq7py8arrw07	12881	36	29900.00
mmwi4lq7py8arrw07	12907	36	28900.00
mmwi4lq7py8arrw07	12744	36	18900.00
\.


--
-- TOC entry 5244 (class 0 OID 16654)
-- Dependencies: 241
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, client_id, seller_id, correria_id, total_value, created_at, settled_by, order_number, start_date, end_date, porcentaje_oficial, porcentaje_remision) FROM stdin;
mm2c7uonjxqwkjpf5	300	mlia6gb0u2bhftxam	mljjqn48zbxhtg0yw	38088000.00	2026-02-25T17:57:55.607Z	Admin Principal	1	2026-02-14	2026-02-26	50.00	50.00
mm261zsok2g1m5dod	299	mlia7rpjfmtwhg66q	mljjqn48zbxhtg0yw	3078400.00	2026-02-25T15:05:24.600Z	Admin Principal	6	2026-03-01	\N	0.00	0.00
mm261wafiiiwwshld	50	mlia7rpjfmtwhg66q	mljjqn48zbxhtg0yw	5258400.00	2026-02-25T15:05:20.055Z	Admin Principal	5	2026-02-11	\N	0.00	0.00
mm261sicytqircpx5	264	mlia7rpjfmtwhg66q	mljjqn48zbxhtg0yw	3884400.00	2026-02-25T15:05:15.156Z	Admin Principal	4	2026-02-04	\N	0.00	0.00
mm261ny1d0yfufg6p	138	mlia7rpjfmtwhg66q	mljjqn48zbxhtg0yw	11754000.00	2026-02-25T15:05:09.241Z	Admin Principal	3	2026-02-04	\N	0.00	0.00
mm261ih80nzxoq1lv	270	mlia7rpjfmtwhg66q	mljjqn48zbxhtg0yw	16347800.00	2026-02-25T15:05:02.156Z	Admin Principal	2	2026-01-22	\N	0.00	0.00
mm261bh9kjzjbs3n3	258	mlia7rpjfmtwhg66q	mljjqn48zbxhtg0yw	2139600.00	2026-02-25T15:04:53.085Z	Admin Principal	1	2026-01-20	\N	0.00	0.00
mm25zlnrm0l8pxyk3	59	mlia6sxbdfmbvlex0	mljjqn48zbxhtg0yw	30523200.00	2026-02-25T15:03:32.967Z	Admin Principal	14	2026-02-09	\N	0.00	0.00
mm25zgt5curej417m	107	mlia6sxbdfmbvlex0	mljjqn48zbxhtg0yw	2522200.00	2026-02-25T15:03:26.681Z	Admin Principal	13	2026-02-05	\N	0.00	0.00
mm25zbho4eabh3lh4	296	mlia6sxbdfmbvlex0	mljjqn48zbxhtg0yw	3311800.00	2026-02-25T15:03:19.788Z	Admin Principal	12	2026-03-01	\N	0.00	0.00
mm25z6898ea5cmw0f	158	mlia6sxbdfmbvlex0	mljjqn48zbxhtg0yw	2874600.00	2026-02-25T15:03:12.969Z	Admin Principal	11	2026-02-02	\N	0.00	0.00
mm25z1dbniegbh1m6	216	mlia6sxbdfmbvlex0	mljjqn48zbxhtg0yw	2800000.00	2026-02-25T15:03:06.671Z	Admin Principal	10	2026-02-15	\N	0.00	0.00
mm25yurfvl3ytrp78	81	mlia6sxbdfmbvlex0	mljjqn48zbxhtg0yw	10680000.00	2026-02-25T15:02:58.107Z	Admin Principal	9	2026-02-01	\N	0.00	0.00
mm25x0trsopvohrgo	231	mlia6sxbdfmbvlex0	mljjqn48zbxhtg0yw	4740000.00	2026-02-25T15:01:32.655Z	Admin Principal	8	2026-02-16	2026-02-28	0.00	0.00
mm25wkgeaqmr6b8un	217	mlia6sxbdfmbvlex0	mljjqn48zbxhtg0yw	2242900.00	2026-02-25T15:01:11.438Z	Admin Principal	7	2026-02-16	2026-02-28	0.00	0.00
mm25wans5fy2ikncb	90	mlia6sxbdfmbvlex0	mljjqn48zbxhtg0yw	2421100.00	2026-02-25T15:00:58.744Z	Admin Principal	6	2026-02-16	2026-02-28	0.00	0.00
mm25v4aqgkqzh9j40	305	mlia6sxbdfmbvlex0	mljjqn48zbxhtg0yw	4238200.00	2026-02-25T15:00:03.842Z	Admin Principal	5	2026-02-16	2026-02-28	0.00	0.00
mm25teuw5s5a06njw	74	mlia6sxbdfmbvlex0	mljjqn48zbxhtg0yw	2242900.00	2026-02-25T14:58:44.216Z	Admin Principal	4	2026-02-16	2026-02-28	0.00	0.00
mm25shroo1oy81pds	232	mlia6sxbdfmbvlex0	mljjqn48zbxhtg0yw	22346400.00	2026-02-25T14:58:01.332Z	Admin Principal	3	2026-01-15	\N	0.00	0.00
mm25rzt79inviirmd	177	mlia6sxbdfmbvlex0	mljjqn48zbxhtg0yw	6388200.00	2026-02-25T14:57:38.059Z	Admin Principal	2	2026-02-14	\N	0.00	0.00
mm25qs8bzb9btrgvw	179	mlia6sxbdfmbvlex0	mljjqn48zbxhtg0yw	6388200.00	2026-02-25T14:56:41.580Z	Admin Principal	1	2026-02-14	\N	0.00	0.00
mmpgtfe31h7o4pg3g	300	mlia6gb0u2bhftxam	mljjrcujmtckild4r	87136800.00	2026-03-13T22:25:22.731Z	Jhon Montoya	\N	2026-03-16	2026-06-04	50.00	50.00
mmpgxr0cmqouvxsuz	298	mlia6gb0u2bhftxam	mljjrcujmtckild4r	20677200.00	2026-03-13T22:28:44.412Z	Jhon Montoya	1	2026-03-06	\N	20.00	80.00
mmph0ntzrz5dgbf7e	276	mlia7rpjfmtwhg66q	mljjrcujmtckild4r	6481200.00	2026-03-13T22:31:00.263Z	Jhon Montoya	1	2026-04-10	\N	30.00	70.00
mmph224zawpf1wfbp	152	mlia7rpjfmtwhg66q	mljjrcujmtckild4r	6481200.00	2026-03-13T22:32:05.459Z	Jhon Montoya	2	2026-04-10	\N	30.00	70.00
mmph2vwqtgig74spi	193	mlia7rpjfmtwhg66q	mljjrcujmtckild4r	981600.00	2026-03-13T22:32:44.042Z	Jhon Montoya	3	2026-03-20	\N	100.00	0.00
mmt9cg4gbu5dnloup	310	mlia6sxbdfmbvlex0	mljjrcujmtckild4r	7104000.00	2026-03-16T14:07:17.920Z	Jhon Montoya	1	2026-03-10	\N	50.00	50.00
mmt9f0zv75r8qf1g9	283	mlia6sxbdfmbvlex0	mljjrcujmtckild4r	5434500.00	2026-03-16T14:09:18.283Z	Jhon Montoya	2	2026-03-11	\N	100.00	0.00
mmt9gf24g1f0g2km0	114	mlia7rpjfmtwhg66q	mljjrcujmtckild4r	9314700.00	2026-03-16T14:10:23.164Z	Jhon Montoya	4	2026-03-11	2026-04-30	100.00	0.00
mmt9hjj6xd4mpipig	179	mlia6sxbdfmbvlex0	mljjrcujmtckild4r	9142200.00	2026-03-16T14:11:15.618Z	Jhon Montoya	3	2026-03-11	\N	50.00	50.00
mmt9ijwvjz21wl7nq	177	mlia6sxbdfmbvlex0	mljjrcujmtckild4r	11741400.00	2026-03-16T14:12:02.767Z	Jhon Montoya	4	2026-03-11	\N	50.00	50.00
mmt9ka1qt9uumiqoj	115	mlia7rpjfmtwhg66q	mljjrcujmtckild4r	7312000.00	2026-03-16T14:13:23.294Z	Jhon Montoya	5	2026-04-10	\N	50.00	50.00
mmt9nlw0bj2eouw27	216	mlia6sxbdfmbvlex0	mljjrcujmtckild4r	7336500.00	2026-03-16T14:15:58.609Z	Jhon Montoya	5	2026-03-20	\N	20.00	80.00
mmt9omzsn8q7wdcw0	232	mlia6sxbdfmbvlex0	mljjrcujmtckild4r	22644000.00	2026-03-16T14:16:46.696Z	Jhon Montoya	6	2026-03-12	\N	50.00	50.00
mmt9pnknmcc4u2twt	158	mlia6sxbdfmbvlex0	mljjrcujmtckild4r	5155800.00	2026-03-16T14:17:34.103Z	Jhon Montoya	7	2026-04-01	\N	100.00	0.00
mmt9qjskej5ms6x1x	233	mlia6sxbdfmbvlex0	mljjrcujmtckild4r	12354000.00	2026-03-16T14:18:15.860Z	Jhon Montoya	8	2026-03-13	2026-04-20	50.00	50.00
mmt9r6b2q007ajtnt	296	mlia6sxbdfmbvlex0	mljjrcujmtckild4r	3204400.00	2026-03-16T14:18:45.038Z	Jhon Montoya	9	\N	\N	0.00	100.00
mmt9s8xtkyhxxqxvt	159	mlia6sxbdfmbvlex0	mljjrcujmtckild4r	10214400.00	2026-03-16T14:19:35.105Z	Jhon Montoya	10	2026-03-14	2026-04-20	50.00	50.00
mmt9tei8ytk1h00vz	230	mlia6sxbdfmbvlex0	mljjrcujmtckild4r	7603800.00	2026-03-16T14:20:28.976Z	Jhon Montoya	11	2026-03-14	2026-04-20	50.00	50.00
mmt9ud7lqklo7j0pc	201	mlia6sxbdfmbvlex0	mljjrcujmtckild4r	2235600.00	2026-03-16T14:21:13.953Z	Jhon Montoya	12	2026-03-15	\N	0.00	100.00
mmun9a0vcpsv8yiiw	80	mlia6sxbdfmbvlex0	mljjrcujmtckild4r	4940400.00	2026-03-17T13:24:30.847Z	Maria Mercedes	13	2026-04-15	\N	100.00	0.00
mmuz2vh288k4e59ve	311	mlia6sxbdfmbvlex0	mljjrcujmtckild4r	51734400.00	2026-03-17T18:55:27.446Z	Jhon Montoya	14	2026-03-17	\N	50.00	50.00
mmuz3v4f45k1zx63o	100	mlia7rpjfmtwhg66q	mljjrcujmtckild4r	8857800.00	2026-03-17T18:56:13.647Z	Jhon Montoya	6	2026-04-01	\N	50.00	50.00
mmwi1or2y1lmz89j1	255	mlia6sxbdfmbvlex0	mljjrcujmtckild4r	7563600.00	2026-03-18T20:34:10.958Z	Jhon Montoya	15	2026-03-18	\N	50.00	50.00
mmwi22ybmtlp3xmn4	225	mlia6sxbdfmbvlex0	mljjrcujmtckild4r	3781800.00	2026-03-18T20:34:29.363Z	Jhon Montoya	16	2026-03-18	\N	50.00	50.00
mmwi2g8gthkv4t76s	28	mlia6sxbdfmbvlex0	mljjrcujmtckild4r	3781800.00	2026-03-18T20:34:46.576Z	Jhon Montoya	17	2026-03-18	\N	50.00	50.00
mmwi2xc7yi4fpkkkm	310	mlia6sxbdfmbvlex0	mljjrcujmtckild4r	1995600.00	2026-03-18T20:35:08.744Z	Jhon Montoya	18	2026-03-18	\N	50.00	50.00
mmwi4lq7py8arrw07	17	mlia6sxbdfmbvlex0	mljjrcujmtckild4r	12117600.00	2026-03-18T20:36:27.007Z	Jhon Montoya	19	2026-03-18	\N	50.00	50.00
\.


--
-- TOC entry 5245 (class 0 OID 16666)
-- Dependencies: 242
-- Data for Name: product_references; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_references (id, description, price, designer, cloth1, avg_cloth1, cloth2, avg_cloth2, active, created_at) FROM stdin;
12574	TOP ESCOTE CON BRILLOS	25900.00	JENNIFER QUINTERO	AMORELA	0.40		0.00	1	2026-02-13 15:45:42
12366	CROP TOP SRL	19900.00	CATALINA CASTRO	RUSTIQUE	0.83		0.00	1	2026-02-13 15:45:42
12617	BODY CON CORTES FORRADO	35900.00	JENNIFER QUINTERO	LYCRAMATE	0.95		0.00	1	2026-02-13 15:45:42
12640	CAMISILLA APLIQUE PIEDRAS FTE	24900.00	MARTHA RAMIREZ	RIB	0.48		0.00	1	2026-02-13 15:45:42
12644	CAMISETA CORPIÑO PEIDRAS	37900.00	MARTHA RAMIREZ	LYCRA PRAGA	0.67		0.00	1	2026-02-13 15:45:43
12692	BASICA CON BRILLO NEGRO	22900.00	MARIANA OCAMPO	PUNTO ROMA	0.39		0.00	1	2026-02-13 15:45:43
12665	CAMISETA LARGA BASICA SMILE	19900.00	MARIA MEREDES	LYCRA PRAGA	0.72		0.00	1	2026-02-13 15:45:43
12704	CHALECO CUELLO HALTER	29900.00	MARIANA OCAMPO	BENGALINA PANA	0.56		0.00	1	2026-02-13 15:45:43
12699	CAMISETA SOBREPUESTOCORSET	24900.00	MARTA RAMIREZ	LYCRA PRAGA	0.75	BLONDA	0.17	1	2026-02-13 15:45:43
12708	CAMISETA CON MANGA EN OJALILLO	24900.00	MARIANA OCAMPO	LYCRA PRGA	0.51	OJALILLO	0.21	1	2026-02-13 15:45:43
12747	CAMISETA MAGA REDOBLADA CON CHISPIADO Y APLIQUE	31900.00	MARTHA RAMIREZ	LYCRA PRAGA	0.52		0.00	1	2026-02-13 15:45:43
12754	BLUSA PERILLA BOTONES Y BOLERO INFERIOR	16900.00	MARTHA RAMIREZ	RIB	0.38		0.00	1	2026-02-13 15:45:43
12771	CAMISILLA CRUZADA BOTON	16900.00	MARTHA RAMIREZ	RIB	0.40		0.00	1	2026-02-13 15:45:43
12777	TOP SURSIDO TELA ROSI	14900.00	ZIVIS PACHECO	ROSI	0.15	AMELIA	0.24	1	2026-02-13 15:45:43
12782	CAMISILLA A RAYAS CON LETRERO EN ALTA	17900.00	MARTHA RAMIREZ	RIB	0.50		0.00	1	2026-02-13 15:45:43
12783	CAMISILLA ESTAMPADO ALTA	17900.00	MARTHA RAMIREZ	RIB	0.51		0.00	1	2026-02-13 15:45:43
12862	BLUSON FLORES	23900.00	MARTHA RAMIREZ	MINIWAFER	0.50		0.00	1	2026-02-13 15:45:44
12805	BLUSA CON LAGRIMA	19900.00	MARIANA OCAMPO	VERONARAYON	0.30		0.00	1	2026-02-13 15:45:43
12865	TOP CARGADERA GRUESA BOTONES	16900.00	MARTHA RAMIREZ	FLATY	0.33		0.00	1	2026-02-13 15:45:44
12877	CAMISILLA PUNTILLA CUELLO	19900.00	MARTHA RAMIREZ	RIB	0.45		0.00	1	2026-02-13 15:45:44
12866	CAMISILLA ACANALADA ESTRELLA	19900.00	MARTHA RAMIREZ	SUPER JACK	0.44		0.00	1	2026-02-13 15:45:44
12878	DUO CON TOP	64900.00	JACKELINE PEREA	ARIDA	0.23	LYCRA ALGODÓN	0.25	1	2026-02-13 15:45:44
12882	BLMAMC FONDE CORAZO	23900.00	JACKELINE PEREA	RIB	0.55	RIB	0.07	1	2026-02-13 15:45:44
12693	BUSTIER EN RIB	25900.00	MARIANA OCAMPO	RIB	0.15	\N	\N	1	2026-02-13 15:45:43
12431	TUBULAR APLIQUE FASHION	14900.00	JENNIFER QUINTERO	TH	0.56		0.00	1	2026-02-13 15:45:42
12463	BUSO DAMA TEXTURA	24900.00	CATALINA CASTRO	KROLGE	0.41		0.00	1	2026-02-13 15:45:42
12129	CROPTO MULTICOLORES	27900.00	JACKELINE PEREA	BENGALINA SUBLIMAR	0.87		0.00	1	2026-02-13 15:45:42
12442	CONJUNTO LINO ENVIVADO MANGA SISA	42900.00	MARTHA RAMIREZ	LINO PRAGA	1.26		0.00	1	2026-02-13 15:45:42
12473	TOP CON AMARRE Y BRILLOS	29900.00	JENNIFER QUINTERO	FLATY	0.39		0.00	1	2026-02-13 15:45:42
12581	DUO BODY CON TOP	32900.00	JENNIFER QUINTERO	KENIA	0.72	AMELIA	0.20	1	2026-02-13 15:45:42
12679	BUSTIER CON MALLA	23900.00	MARIANA OCAMPO	MALLA	0.58	AMELIA	0.22	1	2026-02-13 15:45:43
12680	BLUSA TIRAS BRILLANTES	16900.00	MARIANA OCAMPO	RIB	0.28		0.00	1	2026-02-13 15:45:43
12694	BLUSA CON AMARRE ESPALDA	24900.00	MARIANA OCAMPO	LENTEJUELAS	0.31	AMELIA	0.13	1	2026-02-13 15:45:43
12698	BUSTIER ESTRAPLE	21900.00	MARIANA OCAMPO	BENGALINA BLUZZ	0.31		0.00	1	2026-02-13 15:45:43
12737	BUSTIER CORTES	22900.00	MARIANA OCAMPO	PUNTO ROMA	0.30		0.00	1	2026-02-13 15:45:43
12744	BODY RECOGIDO	19900.00	MARIANA OCAMPO	AMELIA	0.48		0.00	1	2026-02-13 15:45:43
12809	DUO BL MAN SIS Y TUNEL	58900.00	JACKELINE PEREA	LINO PRAGA	0.48		0.00	1	2026-02-13 15:45:43
12817	DUO CARNAVAL TOP	36900.00	MARTHA RAMIREZ	NEW COQUET S	0.52	POLY LYCRA	0.30	1	2026-02-13 15:45:43
12818	BLUSA CARNAVAL MGA BOMBA	41900.00	MARTHA RAMIREZ	LINO LIMPO S	0.38		0.00	1	2026-02-13 15:45:43
12820	BLUSON RECOGIDO A RAYAS MULTICOLOR	23900.00	MARTHA RAMIREZ	POLYLYCRA S	0.40		0.00	1	2026-02-13 15:45:43
12821	CAMISERA BOLERO FLORES SOMBREROS	34900.00	MARTHA RAMIREZ	NEW COQUET S	0.15		0.00	1	2026-02-13 15:45:43
12823	BLUSA  SOMBREROS Y FLORES CON CARGDERAS RECOGIDAS	22900.00	MARTHA RAMIREZ	MATAYEX S	0.50	MAYATEX	0.23	1	2026-02-13 15:45:43
12825	DUO CARNAVAL	22900.00	MARIANA OCAMPO	CAPRIATI	0.51	LYCRA ALGODÓN	0.18	1	2026-02-13 15:45:43
12828	ESQUELETO COLORES	14900.00	MARIANA OCAMPO	AMELIA	0.50		0.00	1	2026-02-13 15:45:44
12831	CROP TOP GEOMETRICO RESORTADO	24900.00	MARTHA RAMIREZ	NEW COQUET S	0.53		0.00	1	2026-02-13 15:45:44
12834	CAMISETA CON MARIMONDA	17900.00	MARIANA OCAMPO	AMELIA	0.33		0.00	1	2026-02-13 15:45:44
12835	ESQUELETO LENTEJUELAS	20900.00	MARIANA OCAMPO	LENTEJUELAS	0.69	AMELIA	0.29	1	2026-02-13 15:45:44
12836	TOP ESTAMPADO NEON	21900.00	MARTHA RAMIREZ	BENGALINA PANA	0.45		0.00	1	2026-02-13 15:45:44
12837	CAMISETA RECOGIDA	27900.00	MARIANA OCAMPO	VALIANA	0.98		0.00	1	2026-02-13 15:45:44
12840	BLUSON GANADERIA	36900.00	MARTHA RAMIREZ	LINO LIMPO S	0.48		0.00	1	2026-02-13 15:45:44
12841	TOP AMARRE	20900.00	MARIANA OCAMPO	AMELIA SUBLIMADA	0.50		0.00	1	2026-02-13 15:45:44
12855	CORPIÑO MASCARAS ESTRELLAS	24900.00	MARTHA RAMIREZ	BENGALINA S	0.48	BENGALINA	0.12	1	2026-02-13 15:45:44
12860	BLUSA MGA SISA CORAZON	16900.00	MARTHA RAMIREZ	MINIWAFER	0.61		0.00	1	2026-02-13 15:45:44
12861	CAMISETA MGA CORTA	19900.00	MARTHA RAMIREZ	MINIWAFER	0.49		0.00	1	2026-02-13 15:45:44
12864	CAMISILLA SISA ENTRADA	19900.00	MARTHA RAMIREZ	FLATY	0.53		0.00	1	2026-02-13 15:45:44
12868	DUO CON CROPTO Y AMARRE ESP	69900.00	JACKELINE PEREA	FAIRI RAYON	0.23		0.00	1	2026-02-13 15:45:44
12870	BODY ARGOLLA	35900.00	JACKELINE PEREA	ISLANDIA	0.59		0.00	1	2026-02-13 15:45:44
12871	CAMISILLA RAYAS APLIQUE	19900.00	MARTHA RAMIREZ	BURDA	0.29	RIB	0.10	1	2026-02-13 15:45:44
12872	CAMISETA MGA REDOBLADA ESCORPION	24900.00	MARTHA RAMIREZ	BURDA	0.92		0.00	1	2026-02-13 15:45:44
12873	CAMISETA CORTA A RAYAS	22900.00	MARTHA RAMIREZ	BURDA	0.91		0.00	1	2026-02-13 15:45:44
12875	BLUSA CRUZADA CON HERRAJE	19900.00	MARTHA RAMIREZ	PIEL DE DURAZNO	1.10		0.00	1	2026-02-13 15:45:44
12876	CROPT STRAP EST	19900.00	JACKELINE PEREA	RIB	1.00		0.00	1	2026-02-13 15:45:44
12881	BODY BAS MANG	33900.00	JACKELINE PEREA	ISLANDIA	0.98		0.00	1	2026-02-13 15:45:44
12879	BL CUE PERI	38900.00	JACKELINE PEREA	ARUBA	1.01		0.00	1	2026-02-13 15:45:44
12880	BLU CORT LAT Y CUELL	24900.00	JACKELINE PEREA	RIB	0.32	RIB	0.07	1	2026-02-13 15:45:44
12883	BL APLIQ FLORES	24900.00	JACKELINE PEREA	RIB	0.48		0.00	1	2026-02-13 15:45:44
12884	BL SIS CON VIVO	21900.00	JACKELINE PEREA	RIB	0.50		0.00	1	2026-02-13 15:45:45
10210	BLUSA BASICA	20900.00	prueba	BURDA 	0.40	\N	\N	1	\N
12416	CAMISERA ENVIVADA BOTONES NEGROS	44900.00	MARTHA RAMIREZ	LINO AMORINO	0.88	POPELINA	0.06	1	\N
12576	BASICA LOVELY	19900.00	JENNIFER QUINTERO	LICRA FRIA	0.30		0.00	1	\N
12000	CONJUN  CHAMPION B	49900.00	JACKELINE PEREA	QUIMBAYA	0.86		0.00	1	2026-02-16 18:11:38
12906	BODY HOLTER	28900.00	JACKELINE PEREA	DESTELLANTE	0.75		0.00	1	2026-02-13 15:45:45
12920	LENCERO BOTONES	21900.00	JACKELINE PEREA	LYCRA FRIA	0.23		0.00	1	2026-02-13 15:45:45
12910	CAMISILLA CORTE SUPERIOR OJALETES	22900.00	MARTHA RAMIREZ	RIB	0.65		0.00	1	2026-02-13 15:45:45
12921	CAMSILLA FRANJA LATERAL	24900.00	MARTHA RAMIREZ	RIB	0.52		0.00	1	2026-02-13 15:45:45
12933	BODY TIRAS	34900.00	JACKELINE PEREA	ISLANDIA	0.56		0.00	1	2026-02-13 15:45:46
12945	ESTRAPLE AMARRE LATERAL	19900.00	MARTHA RAMIREZ	FLATY	0.62		0.00	1	2026-02-13 15:45:46
12963	BLUSA BOLER MANG ESTA	35900.00	JACKELINE PEREA	LINO CREPE	1.00		0.00	1	\N
12961	CAMSILLA ENCEGE CORAZON	29900.00	MARTHA RAMIREZ	RIB	0.88		0.00	1	2026-02-13 15:45:46
13032	BUSO DE CIERRE	34900.00	JACKELINE PEREA	RIB	0.74		0.00	1	\N
12888	CAMISILLA CORAZONES	19900.00	MARTHA RAMIREZ	RIB	0.51	\N	\N	1	2026-02-13 15:45:45
12460	CROP TOP OJA/RIB	19900.00	CATALINA CASTRO	RIB	0.41	OJALILLO	0.17	1	\N
12579	CAMISERA EFECTO BORDADO	39900.00	JENNIFER QUINTERO	KLOSS	1.03		0.00	1	\N
12600	DUO BUSO CON MALLA Y AMARRE	24900.00	JENNIFER QUINTERO	MALLATEX ESTAMPADO	0.58	AMELIA	0.20	1	\N
12609	CROP TOP CON APLIQUE DE FLOR	24900.00	JENNIFER QUINTERO	LICRA DESTELLANTE	0.28		0.00	1	\N
12623	BUSTIER DE MALLA CON PIEDRAS	29900.00	JENNIFER QUINTERO	AMELIA	0.15	MAYATEX	0.17	1	\N
12652	CAMISERA AMARRE FTE HEBILLA ESTAMPADO FLORES	29900.00	MARTHA RAMIREZ	LINO MILAN	0.75		0.00	1	\N
12889	BODY SESG COMBI	28900.00	JACKELINE PEREA	RIB	0.61		0.00	1	2026-02-13 15:45:45
12892	BL ESTAM CON AMARRE FRENT	24900.00	JACKELINE PEREA	LYCRA PRAGA	0.80		0.00	1	2026-02-13 15:45:45
12402	BLUSON HOMBRO CAIDO PRENDEDOR	49900.00	MARTHA RAMIREZ	EVEREST	0.87		0.00	1	\N
12412	BLUSA CUELLO CRUZADA OJALILLO	34900.00	MARTHA RAMIREZ	LINO AMORINO	0.83		0.00	1	\N
12935	BODY CUELL ALT LAGRI SP	35900.00	JACKELINE PEREA	DESTELLANTE	0.74	\N	\N	1	2026-02-13 15:45:46
12905	BODY ESPALDA DESTAPADA FORRADO	34900.00	MARTHA RAMIREZ	LYCRA PRAGA	0.86		0.00	1	2026-02-13 15:45:45
12893	BLUS BAND ENCAJE	24900.00	JACKELINE PEREA	RIB	0.72		0.00	1	2026-02-13 15:45:45
12897	STRAPLE AMERR FRENT	19900.00	JACKELINE PEREA	FLATY	0.37		0.00	1	2026-02-13 15:45:45
12898	LEMSERO EN MAYATEX	24900.00	JACKELINE PEREA	MAYATEX PUNTO	0.58	LICRA FRIA	0.12	1	2026-02-13 15:45:45
12907	BODY CUADRADO	28900.00	JACKELINE PEREA	ISLANDIA	0.84		0.00	1	2026-02-13 15:45:45
12908	BODY BASIC	28900.00	JACKELINE PEREA	ISLANDIA	0.83		0.00	1	2026-02-13 15:45:45
12911	CAMISETA MGA DOBLE TEXTURA	18900.00	MARTHA RAMIREZ	JAKAR	0.81		0.00	1	2026-02-13 15:45:45
12912	BASI RIB N 23	18900.00	JACKELINE PEREA	RIB	0.50		0.00	1	2026-02-13 15:45:45
12913	BL MANG COMB	29900.00	JACKELINE PEREA	RIB	0.23	VICTORIA RAYA1	0.22	1	2026-02-13 15:45:45
12914	BL CUELL TEJIDO	33900.00	JACKELINE PEREA	NOA	0.48		0.00	1	2026-02-13 15:45:45
12915	BL SIS APLIQ P	28900.00	JACKELINE PEREA	NOA N1	0.31		0.00	1	2026-02-13 15:45:45
12916	CROPTO SESGO	20900.00	JACKELINE PEREA	RIB	0.59		0.00	1	2026-02-13 15:45:45
12917	CROP TOP TELA MANTEYA DOS BOTONES	19900.00	JACKELINE PEREA	MANTEYA-CREMA197	0.50		0.00	1	2026-02-13 15:45:45
12918	TOP ESTAMPAT PL	19900.00	JACKELINE PEREA	RIB	0.40	RIB	0.07	1	2026-02-13 15:45:45
12919	CAM FOND ALT FLOR	25900.00	JACKELINE PEREA	BURDA	0.56		0.00	1	2026-02-13 15:45:45
12931	BLUSA DOBLE BOLERO AMARRE ESPALDA	29900.00	MARTHA RAMIREZ	BOUTIPUNTI	0.59		0.00	1	2026-02-13 15:45:46
12922	BLUSA DAMA FRANJA Y MOÑO	21900.00	MARTHA RAMIREZ	LYCRA FRIA	0.91		0.00	1	2026-02-13 15:45:46
12923	CAMISETA MGAS BLONDA	24900.00	MARTHA RAMIREZ	LYCRA FRIA	0.63		0.00	1	2026-02-13 15:45:46
12924	CAMISILLA GUIPIUR	21900.00	MARTHA RAMIREZ	RIB	0.82		0.00	1	2026-02-13 15:45:46
12926	CAMISETA DOBLE FLOR ALTA	27900.00	MARTHA RAMIREZ	LYC PRAGA O F	0.74		0.00	1	2026-02-13 15:45:46
12943	TOP LENCERIA DAMA	19900.00	MARTHA RAMIREZ	LYCRA FRIA	0.29		0.00	1	2026-02-13 15:45:46
12934	BLUSA DESTELLANTE ENCAJE	24900.00	JACKELINE PEREA	DESTELLANTE	0.58		0.00	1	2026-02-13 15:45:46
12936	BLUSA CUELLO HR FONDEO FLORES ALTA	14900.00	MARTHA RAMIREZ	PIEL DE DURAZNO	0.57		0.00	1	2026-02-13 15:45:46
12937	CAMISETA SMILE ALTA	14900.00	MARTHA RAMIREZ	PIEL DE DURAZNO	0.59		0.00	1	2026-02-13 15:45:46
12939	CAMISETA MGA DOBLE TEXTURA	20900.00	MARTHA RAMIREZ	JACQUARD	0.63		0.00	1	2026-02-13 15:45:46
12940	CAMISILLA 05 CUELLO COMBINADO	19900.00	MARTHA RAMIREZ	RIB	0.72	RIB	0.04	1	2026-02-13 15:45:46
12941	CAMISETA MGA CORTA AMORE	20900.00	MARTHA RAMIREZ	RIB	0.47		0.00	1	2026-02-13 15:45:46
12942	BLUSON CORTES CENTROS MGA CASQUITO APLIQUE	24900.00	MARTHA RAMIREZ	LYCRA PRAGA	0.32	MALLA GATO	0.08	1	2026-02-13 15:45:46
12959	CAMISETA BOLSILLO ENCAGE	37900.00	MARTHA RAMIREZ	LYCRA FRIA	0.92		0.00	1	2026-02-13 15:45:46
12946	CAMISETA CORTE FTE	21900.00	MARTHA RAMIREZ	FRIA O PRAGA	0.42		0.00	1	2026-02-13 15:45:46
12950	CROPT EST CIER	27900.00	JACKELINE PEREA	LICRA PRAGA	0.63		0.00	1	2026-02-13 15:45:46
12951	CAMISE LATERA EN ENCAJE	27900.00	JACKELINE PEREA	LCRA FRIA	0.42		0.00	1	2026-02-13 15:45:46
12952	CAMISERTA PICO ENCAJE	26900.00	MARTHA RAMIREZ	LYCRA FRIA	0.42	MAYA CHOCHE	0.26	1	2026-02-13 15:45:46
12953	BLUSA MGA MUÑECA PUNTOS	24900.00	MARTHA RAMIREZ	FLATY	0.40		0.00	1	2026-02-13 15:45:46
12955	BUSO ASIMETRICO TRANSPARENCIA	22900.00	MARTHA RAMIREZ	MAYA GRABAD	0.40	PIELDE DURAS	0.12	1	2026-02-13 15:45:46
12956	CAMISILLA ENCAJE	24900.00	MARTHA RAMIREZ	RIB	0.32		0.00	1	2026-02-13 15:45:46
12957	BLUSA CUELLO BANDEJA ASIMETRICO	35900.00	MARTHA RAMIREZ	LYCRA FRIA	0.31		0.00	1	2026-02-13 15:45:46
12958	CMISETA MGA REDOBLADA EST BAMBI	39900.00	MARTHA RAMIREZ	LYCRA FRIA	0.34		0.00	1	2026-02-13 15:45:46
12960	CAMISETA ENCAJE FTE	39900.00	MARTHA RAMIREZ	LYCRA FRIA	0.91		0.00	1	2026-02-13 15:45:46
12395	CAMISETA ASIMETRICO BOLEROS POPELINA	32900.00	MARTHA RAMIREZ	RIB GATO	0.86	POPELINA	0.29	1	2026-02-13 15:45:42
12498	BODY RIB ENVIVADO	21900.00	MARTHA RAMIREZ	RIB	0.84		0.00	1	\N
12565	CHALECO CON TACHES	34900.00	JENNIFER QUINTERO	KLOSS	0.63		0.00	1	\N
12685	BUSO PIEDRA	29900.00	MARTHA RAMIREZ	MAYATEX	0.50	AMELIA	0.25	1	\N
12686	BUSO RECOGIDO MAYATEX	19900.00	MARTHA RAMIREZ	MAYATEX	0.79		0.00	1	\N
12709	BLUSA HOLGADA	19900.00	MARIANA OCAMPO	ROSI	0.72		0.00	1	\N
12712	BLUSA RECOGIDA MANGAS	25900.00	MARTHA RAMIREZ	BENGALINA PANA	0.50		0.00	1	\N
12869	BLS MAN BOLE	31900.00	JACKELINE PEREA	LYCRA PRAGA	0.69		0.00	1	\N
12885	BL SES COMBINA	23900.00	JACKELINE PEREA	RIB	0.48	RIB SESGO CUELLO	0.04	1	2026-02-13 15:45:45
12683	CHALEO ESTAMPADO	19900.00	MARTHA RAMIREZ	RIB	0.51		0.00	1	\N
12962	BLUSA ASIMETRICA HERRAJE	44900.00	MARTHA RAMIREZ	RIB LUCA	1.10		0.00	1	\N
12964	CAMISA - ALMILLA	46900.00	ISABEL MONTOYA	SOPIHIA	0.49	LORD	0.60	1	\N
12967	TOP FLORES	24900.00	ISABEL MONTOYA	MALLATEX	0.32	AMELIA	0.12	1	\N
12968	CAMISERA MGA BOMBA ESTAMPADO CENEFA FTE	44900.00	MARTHA RAMIREZ	GEN BASICFROZ	1.29		0.00	1	\N
12969	BLUSA STRAPLE	21900.00	ISABEL MONTOYA	ISLANDIA	0.55		0.00	1	\N
12970	BLS CON GRIP EN FRNT	34900.00	JACKELINE PEREA	MAUI	0.57		0.00	1	\N
12971	BL DE AMARRE ESP	36900.00	JACKELINE PEREA	LIANGEN	0.73		0.00	1	\N
12972	CAMISE BOL FLOR GRIPIUR	48900.00	JACKELINE PEREA	LOOJSTYLE PRETEÑIDO	0.94		0.00	1	\N
12973	DUO CHALECO	42900.00	ISABEL MONTOYA	VERONA	0.51	PIEL DE DURAZNO	0.16	1	\N
12974	BODY CONCHAS	35900.00	ISABEL MONTOYA	DESTELLANTE	0.82		0.00	1	\N
12975	BODY CUELL BANDEJ Y MANG APART	34900.00	JACKELINE PEREA	DESTELLANTE	0.80		0.00	1	\N
12976	BUS SUB EN PUNT	37900.00	JACKELINE PEREA	MAYATEX	0.72	POLILICRA	0.24	1	\N
12979	STRAPLE FLORES CIERR	29900.00	JACKELINE PEREA	BENGALINA	0.37		0.00	1	\N
12980	BL BOL CUELLO ESTAM RAYA	20900.00	JACKELINE PEREA	RIB	0.58		0.00	1	\N
12984	BODY COP FRNA	24900.00	JACKELINE PEREA	DESTELLANTE	0.38		0.00	1	\N
12986	BODY DECORATIVO	34900.00	ISABEL MONTOYA	DESTELLANTE	0.75		0.00	1	\N
12987	BODY FLORES	27900.00	ISABEL MONTOYA	MALLATEX	0.70		0.00	1	\N
12990	BLUSA PLUSS	32900.00	MARTHA RAMIREZ	MAUI	0.82		0.00	1	\N
12991	BL PLUS CORTE	32900.00	JACKELINE PEREA	RIB	0.77		0.00	1	\N
13001	BLUSA RAYAS CORBATA	32900.00	MARTHA RAMIREZ	CHIPRE GUMS003	0.65		0.00	1	\N
13002	CAMISETA CORTE LATERAL BOTONES DECORATIVOS	41900.00	MARTHA RAMIREZ	BURDA	0.81		0.00	1	\N
13003	BLUSA VIENA	32900.00	ISABEL MONTOYA	NOCHES DE VIENA	0.50		0.00	1	\N
13004	CAMISILLA FLOR	19900.00	ISABEL MONTOYA	DUVAL	0.23		0.00	1	\N
13005	CAMISETA JAMAICA	20900.00	ISABEL MONTOYA	FLOR DE JAMAICA	0.48		0.00	1	\N
13008	CAMISETA 1987	33900.00	ISABEL MONTOYA	BAIRON	0.59		0.00	1	\N
13009	BLU SUBL RAYA CUELLO	27900.00	JACKELINE PEREA	PIEL DURAZNO	0.50	BENGALINA	0.13	1	\N
13010	BLU ENCAJE EN CONTRASTE	29900.00	JACKELINE PEREA	BURDA FRIA	0.40		0.00	1	\N
13011	BLUSA EN GRIPIU	29900.00	JACKELINE PEREA	BURDA FRIA	0.56		0.00	1	\N
13012	BLUS CUELL NERU PLUSS	39900.00	JACKELINE PEREA	ARIDA	1.10		0.00	1	\N
13013	BL AMARR ANGELIT	23900.00	JACKELINE PEREA	RIB	0.52		0.00	1	\N
13014	BL AMARR	29900.00	MARTHA RAMIREZ	MAUI	0.91		0.00	1	\N
13015	CAMISETA PLUSS COMBINADA CROCHET	37900.00	MARTHA RAMIREZ	L.FRIA FRANK	0.63	CROCHET	0.33	1	\N
13016	CAMISILLA PLUSS PEDRERIA	32900.00	MARTHA RAMIREZ	RIB	0.82		0.00	1	\N
13023	CAMISETA PLUS CORTE ESPALDA FLOR	34900.00	MARTHA RAMIREZ	POLO RIB	0.74		0.00	1	\N
13027	BODY ISLA	33900.00	ISABEL MONTOYA	ISLANDIA	0.93		0.00	1	\N
13028	BODY RIO	35900.00	ISABEL MONTOYA	RIO	0.56		0.00	1	\N
13029	BODY COR MAN CASQ	32900.00	JACKELINE PEREA	PICOT	0.58	POLILICRA	0.25	1	\N
13033	CAMISETA MARGARITA	29900.00	ISABEL MONTOYA	BURDA FRIA	0.57		0.00	1	\N
13035	CAMISETA  ESPALDA Y PUÑOS BLONDA	38900.00	MARTHA RAMIREZ	BURDA	0.59	CATTLEYA	0.30	1	\N
13039	BLU PEPLUT	30900.00	JACKELINE PEREA	BENGALINA PANA	0.72		0.00	1	\N
13040	BL STRAP CON HERRAJE	32900.00	JACKELINE PEREA	BENGALINA PANA	0.47		0.00	1	\N
13041	STRAP FLOR MAX	29900.00	JACKELINE PEREA	CORTEZA	0.32		0.00	1	\N
13042	BL MANG BOLE ARABEZC	29900.00	JACKELINE PEREA	PARIS	0.33	LINO MILAN	0.26	1	\N
13043	BL EST BOLA Y CORBATIN	34900.00	JACKELINE PEREA	LINO LIMPO	0.62		0.00	1	\N
13044	CORSER LUZA	29900.00	ISABEL MONTOYA	LUZA	0.42		0.00	1	\N
13045	BLUSA LENCERA DAMA	25900.00	MARTHA RAMIREZ	LORD	0.63		0.00	1	\N
13046	LENCERA ESTRA	27900.00	JACKELINE PEREA	DESTELLANTE	0.42		0.00	1	\N
13047	BLUSA COPAS	25900.00	ISABEL MONTOYA	OJALILLO ELIOT	0.42	PIEL DE DURAZNO	0.11	1	\N
13048	BL ALFORZ FRENT	25900.00	JACKELINE PEREA	BENGALINA	0.40		0.00	1	\N
13050	BL APERT FRENTE Y GRIPIUR EN SESG	29900.00	JACKELINE PEREA	BENGALINA BLUZZ	0.40		0.00	1	\N
13052	BLUSA ENCAJE SISA ENTRADA PLACA	21900.00	MARTHA RAMIREZ	CATTLEY002	0.32	PIEL DURASNO	0.16	1	\N
13055	CHALECO LANA	29900.00	ISABEL MONTOYA	HAWAI # 1	0.31	RIB	0.19	1	\N
13057	BLUSA COPA GUIPIUR	24900.00	MARTHA RAMIREZ	HAWAI	0.34		0.00	1	\N
13058	BL RAYA SI BOTO	29900.00	JACKELINE PEREA	HAWAY RAYAS	0.39		0.00	1	\N
13059	CAMISA BOLSILLO	39900.00	ISABEL MONTOYA	RULOCO016	0.88	PICOT094	0.03	1	\N
13063	BLUSON PLUSS BOLERO FLOR	32900.00	MARTHA RAMIREZ	LULULEMON YOGA	0.88		0.00	1	\N
13064	BLUSA PLUSS LENCERA	32900.00	MARTHA RAMIREZ	LORD	0.94		0.00	1	\N
13065	BLUSA COPAS FRANJA PLUSS	32900.00	MARTHA RAMIREZ	CORTEZA	0.53		0.00	1	\N
13066	CAMISERA LINO FLOR PAPEL FULL	45900.00	MARTHA RAMIREZ	LINO MILANES	1.01		0.00	1	\N
13067	BLUSA MALLA	39900.00	ISABEL MONTOYA	GITANILLA 5	0.61		0.00	1	\N
12895	CORPIÑO A RAYAS BOLERO	30900.00	MARTHA RAMIREZ	SUCKY SUIZA	0.49		0.00	1	\N
13069	CAMISILLA SISA ENTRADA PUNTOS ALTA TEXTO	17900.00	MARTHA RAMIREZ	RIB	0.48		0.00	1	\N
13076	TOP EN AMELIA Y MAYATEX	27900.00	ISABEL MONTOYA	MALLATEX	0.50	AMELIA	0.24	1	\N
13077	DUO CHALECO TELA SOPHIA	42900.00	ISABEL MONTOYA	SOPHIA #7	0.57	LICRAFRIA	0.27	1	\N
13078	BL BAND ESTA	22900.00	JACKELINE PEREA	RIB	0.44		0.00	1	\N
13079	CAMISILLA PRENDEDOR BABY	19900.00	MARTHA RAMIREZ	POLORIB	0.34		0.00	1	\N
13081	CAMISETA MGA CORTA TEXTO ALTA CON MIRELLA	19900.00	MARTHA RAMIREZ	LYCRA PRAGA	0.44		0.00	1	\N
13082	ESTRAPLE RAYAS	24900.00	MARTHA RAMIREZ	RIB VICTORIA	0.43		0.00	1	\N
13083	TOP ALWAIS	19900.00	ISABEL MONTOYA	DUVAL	0.33		0.00	1	\N
13084	TOP BOTONES	29900.00	ISABEL MONTOYA	BYRON	0.40		0.00	1	\N
13086	CAMISETA RECOGIDO MANGAS	24900.00	ISABEL MONTOYA	ECONOMICO MADRES	0.58		0.00	1	\N
13088	CAMISETA OVERSAY	35900.00	MARTHA RAMIREZ	TELA FRANK	0.64		0.00	1	\N
13090	BLUSA BELIVE	21900.00	ISABEL MONTOYA	RIB	0.59		0.00	1	\N
13091	TOP 1981	18900.00	ISABEL MONTOYA	RIB	0.45		0.00	1	\N
13093	BL CUELL ESTA BOLA	23900.00	JACKELINE PEREA	BURDA FRIA	0.37		0.00	1	\N
13094	BL SIS ESTAM FLOR	21900.00	JACKELINE PEREA	RIB	0.52		0.00	1	\N
13095	BL CORT LAT BOTONE	17900.00	JACKELINE PEREA	RIB	0.50		0.00	1	\N
13096	BL EST PUNTOS	24900.00	JACKELINE PEREA	RIB	0.49		0.00	1	\N
13097	BL ALFO FRENTE Y NGELIA	24900.00	JACKELINE PEREA	LICRA PRAGA	0.37		0.00	1	\N
13098	STRA ESTAP	22900.00	JACKELINE PEREA	BURDA FRIA	0.34		0.00	1	\N
13100	BL STAM GOOD	25900.00	JACKELINE PEREA	LICRA FRIA	0.57		0.00	1	\N
13101	BLUSA PLUSS CORPIÑO BOLERO	35900.00	MARTHA RAMIREZ	BENGAL PANA	0.70		0.00	1	\N
13102	BLUSA PLUSS ARGOLLA HOMBRO ASIMETRICA	29900.00	MARTHA RAMIREZ	LULOLEMON	0.71		0.00	1	\N
13103	CAMISERA TAPA PERLAS	43900.00	MARTHA RAMIREZ	LINO CREPE	0.74		0.00	1	\N
13104	CAMISERA BOLSILLOS INCRUSTADOS	39900.00	MARTHA RAMIREZ	LINO CREPE	0.85		0.00	1	\N
13105	CAMISERA  SUBLIMADO RAYAS	38900.00	MARTHA RAMIREZ	LINO MILAN	0.96		0.00	1	\N
13106	CAMISERA CORTES APLIQUE PIEDRAS	45900.00	MARTHA RAMIREZ	LINO CREPE	0.89		0.00	1	\N
13107	CAMISERA NUDO FTE	29900.00	MARTHA RAMIREZ	MOMA	1.07		0.00	1	\N
13108	CAMISERA CREPE BORADADO	49900.00	MARTHA RAMIREZ	CREP BORD	0.91		0.00	1	\N
13109	BLUSA PLUSS MANGA SISA RAYAS	30900.00	ISABEL MONTOYA	LYCRA FRIA FRANK	0.57		0.00	1	\N
13110	CAMISILLA BURDA CUELLO Y SISA EN RIB CORAZON	19900.00	MARTHA RAMIREZ	BURDA	0.34	RIB	0.09	1	\N
13112	BLU RAYA PLUSS	37900.00	JACKELINE PEREA	HAWAY	0.55		0.00	1	\N
13113	BL ESTM BOTO	49900.00	JACKELINE PEREA	BENGALINA PANA	1.20		0.00	1	\N
13114	BLUS RAYA SUB	39900.00	JACKELINE PEREA	PIEL DURAZNO	0.89		0.00	1	\N
13115	BL PLUSS MANG BOLE	49900.00	JACKELINE PEREA	FAIRI RAYON BORDADO	1.00		0.00	1	\N
13116	CAMISETA FONDEO CORAZONES	21900.00	MARTHA RAMIREZ	BURDA	0.40	BURDA	0.03	1	\N
13117	BLUSON RAYAS FLORES	23900.00	MARTHA RAMIREZ	BURDA	0.44		0.00	1	\N
13118	CAMISILLA RAYA EST PUNTO CORAZON	21900.00	MARTHA RAMIREZ	RIB	0.49		0.00	1	\N
13119	CROP TOP PUNTOS	19900.00	MARTHA RAMIREZ	RIB	0.40		0.00	1	\N
13120	ESTRAPLE BOLERO	17900.00	MARTHA RAMIREZ	RIB	0.37		0.00	1	\N
13121	CAMISILLA RAYA	22900.00	MARTHA RAMIREZ	RIB VICTORIA	0.34	RIB	0.12	1	\N
13122	CAMISILLA RAYA DOBLE	18900.00	MARTHA RAMIREZ	RIB	0.44		0.00	1	\N
13123	CAMISILLA TEXTO TONO ATONO	19900.00	MARTHA RAMIREZ	RIB	0.52		0.00	1	\N
13124	BLUSA RIB DOS COLORES	17900.00	ISABEL MONTOYA	RIB	0.33	RIB	0.10	1	\N
13125	TOP ROMANTIC	21900.00	ISABEL MONTOYA	RIB	0.45	RIB	0.08	1	\N
13126	BL D TI ESTASM Y BOT	21900.00	JACKELINE PEREA	LICRA PRAGA	0.36		0.00	1	\N
13127	BL ESTAN ESC	19900.00	JACKELINE PEREA	RIB	0.52		0.00	1	\N
13128	BL CENTO BOTON	23900.00	JACKELINE PEREA	RIB	0.57		0.00	1	\N
13129	TOP THE BESTIS	22900.00	ISABEL MONTOYA	RAYA VICTORIA #1	0.28		0.00	1	\N
13131	BL  EST  EN CENEFA	19900.00	JACKELINE PEREA	LICRA PRAGA	0.30		0.00	1	\N
13132	BL APLIE HELLO	21900.00	JACKELINE PEREA	RIB	0.48		0.00	1	\N
13254	BLU ESTA BOT FRENT	34900.00	JACKELINE PEREA	BENGALINA PANA	0.62		0.00	1	\N
13006	BLUSA FLOR HERRAGE	23900.00	ISABEL MONTOYA	LYCRA POP	0.31		0.00	1	\N
12671	CHALECO FLORES TONO A TONO	29900.00	MARTHA RAMIREZ	LINO CREPE	0.69		0.00	1	\N
12909	CAMISETA MGA CORTA A RAYAS	19900.00	MARTHA RAMIREZ	VICTIRIA RAYA 1	0.44		0.00	1	2026-02-13 15:45:45
12965	CORPIÑO AMARRE ESPALDA	27900.00	MARTHA RAMIREZ	VERONA	0.23	LINO CREPE	0.37	1	\N
12966	BLUSA AMARRES MILAN VERAMIENTNIC	43900.00	MARTHA RAMIREZ	L.MILAN VERA	1.01		0.00	1	\N
13036	CAMISETA ESPALDA CON APLIQUES YB APLIQUE PUNTO CORAZON	29900.00	MARTHA RAMIREZ	LYCRA PRAGA	0.63		0.00	1	\N
13068	CAMISETA MANGA CORATA FONDEADA FLORES TEXTO	21900.00	MARTHA RAMIREZ	BURDA	0.42		0.00	1	\N
13073	BLUSA LAGRIMA FTAE CUELLO HALTER	15900.00	MARTHA RAMIREZ	CORTEZA	0.22		0.00	1	\N
13074	CAMISILLA COMBINADOA BURDA BOLAS TEXTO	19900.00	MARTHA RAMIREZ	BURDA JEFE	0.34	BURDA JEFE	0.07	1	\N
\.


--
-- TOC entry 5246 (class 0 OID 16676)
-- Dependencies: 243
-- Data for Name: production_tracking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.production_tracking (ref_id, correria_id, programmed, cut, inventory, novedades) FROM stdin;
12907	mljjqn48zbxhtg0yw	60	42	0	\N
12908	mljjqn48zbxhtg0yw	60	66	0	\N
12870	mljjqn48zbxhtg0yw	0	60	0	\N
12960	mljjqn48zbxhtg0yw	0	114	0	\N
12959	mljjqn48zbxhtg0yw	0	114	0	\N
12952	mljjqn48zbxhtg0yw	0	90	0	\N
12950	mljjqn48zbxhtg0yw	0	90	0	\N
12951	mljjqn48zbxhtg0yw	0	90	0	\N
12943	mljjqn48zbxhtg0yw	0	252	0	\N
12945	mljjqn48zbxhtg0yw	0	264	0	\N
12937	mljjqn48zbxhtg0yw	0	180	0	\N
12933	mljjqn48zbxhtg0yw	0	60	0	\N
12934	mljjqn48zbxhtg0yw	0	60	0	\N
12935	mljjqn48zbxhtg0yw	0	60	0	\N
12936	mljjqn48zbxhtg0yw	0	60	0	\N
12926	mljjqn48zbxhtg0yw	0	90	0	\N
12924	mljjqn48zbxhtg0yw	0	90	0	\N
12917	mljjqn48zbxhtg0yw	0	126	0	\N
12919	mljjqn48zbxhtg0yw	0	150	0	\N
12920	mljjqn48zbxhtg0yw	0	225	0	\N
12918	mljjqn48zbxhtg0yw	0	60	0	\N
12921	mljjqn48zbxhtg0yw	0	60	0	\N
12922	mljjqn48zbxhtg0yw	0	60	0	\N
12923	mljjqn48zbxhtg0yw	0	60	0	\N
12913	mljjqn48zbxhtg0yw	0	90	0	\N
12905	mljjqn48zbxhtg0yw	0	60	0	\N
12906	mljjqn48zbxhtg0yw	0	60	0	\N
12909	mljjqn48zbxhtg0yw	0	198	0	\N
12910	mljjqn48zbxhtg0yw	0	60	0	\N
12911	mljjqn48zbxhtg0yw	0	342	0	\N
12897	mljjqn48zbxhtg0yw	0	198	0	\N
12898	mljjqn48zbxhtg0yw	0	60	0	\N
12892	mljjqn48zbxhtg0yw	0	60	0	\N
12893	mljjqn48zbxhtg0yw	0	150	0	\N
12881	mljjqn48zbxhtg0yw	0	66	0	\N
12875	mljjqn48zbxhtg0yw	0	90	0	\N
12000	mljjqn48zbxhtg0yw	0	0	29	\N
12129	mljjqn48zbxhtg0yw	0	0	101	\N
12366	mljjqn48zbxhtg0yw	0	0	40	\N
12860	mljjqn48zbxhtg0yw	0	132	156	\N
12864	mljjqn48zbxhtg0yw	0	99	90	\N
12888	mljjqn48zbxhtg0yw	0	150	129	\N
12876	mljjqn48zbxhtg0yw	0	150	120	\N
12877	mljjqn48zbxhtg0yw	0	150	120	\N
12871	mljjqn48zbxhtg0yw	0	150	84	\N
12395	mljjqn48zbxhtg0yw	0	0	185	\N
12431	mljjqn48zbxhtg0yw	0	0	54	\N
12442	mljjqn48zbxhtg0yw	0	0	39	\N
12473	mljjqn48zbxhtg0yw	0	0	77	\N
12574	mljjqn48zbxhtg0yw	0	0	92	\N
12581	mljjqn48zbxhtg0yw	0	0	113	\N
12617	mljjqn48zbxhtg0yw	0	0	122	\N
12640	mljjqn48zbxhtg0yw	0	0	148	\N
12644	mljjqn48zbxhtg0yw	0	0	171	\N
12665	mljjqn48zbxhtg0yw	0	0	54	\N
12679	mljjqn48zbxhtg0yw	0	0	52	\N
12680	mljjqn48zbxhtg0yw	0	0	20	\N
12692	mljjqn48zbxhtg0yw	0	0	97	\N
12693	mljjqn48zbxhtg0yw	0	0	37	\N
12694	mljjqn48zbxhtg0yw	0	0	188	\N
12698	mljjqn48zbxhtg0yw	0	0	66	\N
12699	mljjqn48zbxhtg0yw	0	0	24	\N
12704	mljjqn48zbxhtg0yw	0	0	124	\N
12708	mljjqn48zbxhtg0yw	0	0	24	\N
12737	mljjqn48zbxhtg0yw	0	0	67	\N
12744	mljjqn48zbxhtg0yw	0	0	76	\N
12747	mljjqn48zbxhtg0yw	0	0	142	\N
12754	mljjqn48zbxhtg0yw	0	0	120	\N
12771	mljjqn48zbxhtg0yw	0	0	103	\N
12777	mljjqn48zbxhtg0yw	0	0	210	\N
12782	mljjqn48zbxhtg0yw	0	0	134	\N
12783	mljjqn48zbxhtg0yw	0	0	120	\N
12805	mljjqn48zbxhtg0yw	0	0	33	\N
12817	mljjqn48zbxhtg0yw	0	0	55	\N
12818	mljjqn48zbxhtg0yw	0	0	22	\N
12820	mljjqn48zbxhtg0yw	0	0	84	\N
12821	mljjqn48zbxhtg0yw	0	0	22	\N
12823	mljjqn48zbxhtg0yw	0	0	95	\N
12825	mljjqn48zbxhtg0yw	0	0	41	\N
12828	mljjqn48zbxhtg0yw	0	0	69	\N
12831	mljjqn48zbxhtg0yw	0	0	80	\N
12834	mljjqn48zbxhtg0yw	0	0	37	\N
12835	mljjqn48zbxhtg0yw	0	0	78	\N
12836	mljjqn48zbxhtg0yw	0	0	31	\N
12837	mljjqn48zbxhtg0yw	0	0	84	\N
12840	mljjqn48zbxhtg0yw	0	0	21	\N
12841	mljjqn48zbxhtg0yw	0	0	114	\N
12855	mljjqn48zbxhtg0yw	0	0	24	\N
12861	mljjqn48zbxhtg0yw	0	0	111	\N
12862	mljjqn48zbxhtg0yw	0	0	147	\N
12865	mljjqn48zbxhtg0yw	0	0	90	\N
12872	mljjqn48zbxhtg0yw	0	0	84	\N
12873	mljjqn48zbxhtg0yw	0	0	84	\N
12880	mljjqn48zbxhtg0yw	0	0	120	\N
12882	mljjqn48zbxhtg0yw	0	0	120	\N
12883	mljjqn48zbxhtg0yw	0	0	120	\N
12884	mljjqn48zbxhtg0yw	0	0	120	\N
12885	mljjqn48zbxhtg0yw	0	0	117	\N
12889	mljjqn48zbxhtg0yw	0	0	117	\N
12402	mljjrcujmtckild4r	0	0	27	Sale de maleta agotada
12955	mljjqn48zbxhtg0yw	0	48	0	Tela inventario
12395	mljjrcujmtckild4r	0	0	244	\N
12412	mljjrcujmtckild4r	0	0	31	\N
12416	mljjrcujmtckild4r	0	0	26	\N
12431	mljjrcujmtckild4r	0	0	56	\N
12442	mljjrcujmtckild4r	0	0	39	\N
12473	mljjrcujmtckild4r	0	0	77	\N
12565	mljjrcujmtckild4r	0	0	53	\N
12574	mljjrcujmtckild4r	0	0	92	\N
12576	mljjrcujmtckild4r	0	0	58	\N
12579	mljjrcujmtckild4r	0	0	86	\N
12600	mljjrcujmtckild4r	0	0	38	\N
12609	mljjrcujmtckild4r	0	0	87	\N
12617	mljjrcujmtckild4r	0	0	106	\N
12623	mljjrcujmtckild4r	0	0	30	\N
12498	mljjrcujmtckild4r	0	0	33	Salio de la maleta
12581	mljjrcujmtckild4r	0	0	96	Salio de la maleta
12640	mljjrcujmtckild4r	0	0	159	\N
12644	mljjrcujmtckild4r	0	0	188	\N
12652	mljjrcujmtckild4r	0	0	70	\N
12671	mljjrcujmtckild4r	0	0	29	\N
12683	mljjrcujmtckild4r	0	0	36	\N
12692	mljjrcujmtckild4r	0	0	103	\N
12694	mljjrcujmtckild4r	0	0	173	\N
12698	mljjrcujmtckild4r	0	0	30	\N
12704	mljjrcujmtckild4r	0	0	90	\N
12709	mljjrcujmtckild4r	0	0	33	\N
12712	mljjrcujmtckild4r	0	0	110	\N
12737	mljjrcujmtckild4r	0	0	53	\N
12747	mljjrcujmtckild4r	0	0	142	\N
12754	mljjrcujmtckild4r	0	0	63	\N
12777	mljjrcujmtckild4r	0	0	198	\N
12862	mljjrcujmtckild4r	0	0	88	\N
12865	mljjrcujmtckild4r	0	0	66	\N
12869	mljjrcujmtckild4r	0	240	0	\N
12908	mljjrcujmtckild4r	0	0	7	\N
12920	mljjrcujmtckild4r	0	0	217	\N
12931	mljjrcujmtckild4r	0	138	0	\N
12935	mljjrcujmtckild4r	0	0	28	\N
12959	mljjrcujmtckild4r	0	0	54	\N
12960	mljjrcujmtckild4r	0	0	54	\N
13104	mljjrcujmtckild4r	0	0	159	\N
13105	mljjrcujmtckild4r	0	0	117	\N
13106	mljjrcujmtckild4r	0	0	281	\N
13107	mljjrcujmtckild4r	0	0	157	\N
12963	mljjrcujmtckild4r	0	120	0	\N
12964	mljjrcujmtckild4r	0	120	0	\N
12966	mljjrcujmtckild4r	0	120	0	\N
12968	mljjrcujmtckild4r	0	117	0	\N
12970	mljjrcujmtckild4r	0	138	0	\N
12975	mljjrcujmtckild4r	120	0	0	\N
12980	mljjrcujmtckild4r	0	195	0	\N
12986	mljjrcujmtckild4r	0	120	0	\N
13010	mljjrcujmtckild4r	0	210	0	\N
13011	mljjrcujmtckild4r	0	120	0	\N
13012	mljjrcujmtckild4r	0	120	0	\N
13014	mljjrcujmtckild4r	0	123	0	\N
13015	mljjrcujmtckild4r	0	201	0	\N
13028	mljjrcujmtckild4r	120	0	0	\N
13036	mljjrcujmtckild4r	0	120	0	\N
13055	mljjrcujmtckild4r	120	0	0	\N
13058	mljjrcujmtckild4r	0	138	0	\N
13067	mljjrcujmtckild4r	0	258	0	\N
13086	mljjrcujmtckild4r	0	120	0	\N
13090	mljjrcujmtckild4r	0	252	0	\N
13093	mljjrcujmtckild4r	0	120	0	\N
13095	mljjrcujmtckild4r	0	300	0	\N
13096	mljjrcujmtckild4r	0	201	0	\N
13098	mljjrcujmtckild4r	120	0	0	\N
13101	mljjrcujmtckild4r	120	0	0	\N
13109	mljjrcujmtckild4r	0	201	0	\N
13131	mljjrcujmtckild4r	90	0	0	\N
12971	mljjrcujmtckild4r	0	102	0	\N
12973	mljjrcujmtckild4r	0	135	0	\N
13016	mljjrcujmtckild4r	0	120	0	\N
12685	mljjrcujmtckild4r	0	0	56	Salio de la maleta
12782	mljjrcujmtckild4r	0	54	24	Salio de maleta media
12783	mljjrcujmtckild4r	0	0	123	Salio de maleta media
12864	mljjrcujmtckild4r	0	279	58	OK tela media
12883	mljjrcujmtckild4r	0	0	29	Salio de maleta media
12884	mljjrcujmtckild4r	0	0	50	Sale de maleta agotada
13047	mljjrcujmtckild4r	150	0	0	\N
13048	mljjrcujmtckild4r	120	0	0	\N
13068	mljjrcujmtckild4r	150	0	0	\N
13110	mljjrcujmtckild4r	250	0	0	\N
13116	mljjrcujmtckild4r	0	201	0	\N
13117	mljjrcujmtckild4r	150	0	0	\N
13119	mljjrcujmtckild4r	120	0	0	\N
13120	mljjrcujmtckild4r	180	0	0	\N
13103	mljjrcujmtckild4r	0	0	82	Sale de maleta agotada
12771	mljjrcujmtckild4r	0	0	80	Sale de maleta agotada
12905	mljjrcujmtckild4r	0	0	26	Sale de maleta agotada
12962	mljjrcujmtckild4r	0	117	0	Sale de maleta agotada
12965	mljjrcujmtckild4r	0	135	0	Sale de maleta agotada
12972	mljjrcujmtckild4r	99	0	0	Tela pedida
12686	mljjrcujmtckild4r	180	0	38	Ok tela
12885	mljjrcujmtckild4r	0	0	22	Salio de maleta media
12888	mljjrcujmtckild4r	0	0	23	\N
12889	mljjrcujmtckild4r	0	0	24	Salio de maleta media
12895	mljjrcujmtckild4r	150	0	0	\N
12976	mljjrcujmtckild4r	0	111	0	Tela en sublimación
13002	mljjrcujmtckild4r	0	240	0	OK tela
13005	mljjrcujmtckild4r	0	168	0	Salio de la maleta
13029	mljjrcujmtckild4r	180	0	0	Reemplazar tela
13033	mljjrcujmtckild4r	180	0	0	X definir tela
13064	mljjrcujmtckild4r	0	180	0	Tela pedida
13076	mljjrcujmtckild4r	120	0	0	Tela en sublimación
13077	mljjrcujmtckild4r	0	123	0	OK corte
13079	mljjrcujmtckild4r	400	0	0	X definir tela
13084	mljjrcujmtckild4r	0	150	0	OK
12693	mljjrcujmtckild4r	0	0	28	\N
13074	mljjrcujmtckild4r	0	321	0	Tela pedida
13081	mljjrcujmtckild4r	0	303	0	OK tela
13083	mljjrcujmtckild4r	0	282	0	Tela pedida
13118	mljjrcujmtckild4r	150	0	0	Tela pedida
12990	mljjrcujmtckild4r	0	111	0	\N
13123	mljjrcujmtckild4r	0	0	0	Sale de maleta
13073	mljjrcujmtckild4r	0	0	0	Sale de maleta
12744	mljjrcujmtckild4r	150	0	24	\N
12907	mljjrcujmtckild4r	250	0	16	\N
13013	mljjrcujmtckild4r	200	195	0	\N
13066	mljjrcujmtckild4r	0	0	0	Sale de maleta
13057	mljjrcujmtckild4r	0	0	0	Sale de maleta
13035	mljjrcujmtckild4r	0	0	0	Sale de maleta
13027	mljjrcujmtckild4r	0	0	0	Sale de maleta
13004	mljjrcujmtckild4r	0	0	0	Sale de maleta
13008	mljjrcujmtckild4r	0	0	0	Sale de maleta
12974	mljjrcujmtckild4r	0	0	0	Sale de maleta
13121	mljjrcujmtckild4r	0	81	0	\N
13129	mljjrcujmtckild4r	0	81	0	\N
12909	mljjrcujmtckild4r	0	162	63	OK tela
12969	mljjrcujmtckild4r	0	0	111	SALE DE LA MALETA
13065	mljjrcujmtckild4r	150	0	0	\N
13091	mljjrcujmtckild4r	120	252	0	\N
13094	mljjrcujmtckild4r	250	201	0	\N
12984	mljjrcujmtckild4r	150	0	0	\N
13100	mljjrcujmtckild4r	150	180	0	OK
12881	mljjrcujmtckild4r	200	0	0	\N
12943	mljjrcujmtckild4r	300	0	0	\N
12987	mljjrcujmtckild4r	120	0	0	\N
13003	mljjrcujmtckild4r	90	0	0	\N
13039	mljjrcujmtckild4r	120	0	0	\N
13040	mljjrcujmtckild4r	120	0	0	\N
13042	mljjrcujmtckild4r	120	0	0	\N
13078	mljjrcujmtckild4r	150	0	0	\N
13097	mljjrcujmtckild4r	250	0	0	\N
13102	mljjrcujmtckild4r	120	0	0	\N
13122	mljjrcujmtckild4r	120	0	0	\N
12877	mljjrcujmtckild4r	180	192	25	Sale de maleta agotada
13115	mljjrcujmtckild4r	120	0	0	\N
\.


--
-- TOC entry 5247 (class 0 OID 16686)
-- Dependencies: 244
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
15	mlttcu00vutreommn	12959	114
16	mlty1yl4a6ry302z0	12960	114
17	mmao4q01lxfht7ff2	12969	174
18	mmao5su5kugcx7xv7	12921	60
19	mmao6whwa2xbw9p4p	12923	60
20	mmao79naem9n1qbe9	12917	126
21	mmao8x1be6xx3btxl	13002	90
22	mmao9do8m0lg17fr6	12875	90
23	mmao9p3nebiokex9t	12937	180
24	mmaoa0azmws6s54a	12943	252
25	mmaoajr4ipuno6hl8	12893	150
26	mmaoayvt347s1m4kf	12952	90
27	mmaob8i7q5d7katdw	12934	60
28	mmaobjlpzuoylcaag	12905	60
29	mmaocgw2h81nskfgj	12898	60
30	mmaocta0d700oicjj	12922	60
31	mmaod67lqfxnpyn4d	12926	90
32	mmaodgh2kf28twwgc	12910	60
33	mmaoeh09ca7gtrvca	12911	171
34	mmaoeq2wmo7gj6j6p	12897	198
35	mmaof79qqdg6kd5pj	12876	150
36	mmaofh4i892efv0o1	12913	90
37	mmaofx1h06n1546ur	12877	150
38	mmaogbltgoe8rv8ri	12888	150
39	mmaohu58qvu5328vx	12955	48
40	mmaoi9xpijfoza3p6	12909	198
41	mmaoipiizi4ze0tjc	12896	60
42	mmaok0r0kw9pb5szb	12890	105
43	mmaokbqe7lbt1eszq	12894	317
44	mmaon9lzzmjumgs7e	12888	129
45	mmaoo6u5e2m5f4e7b	12877	120
46	mmaootlnq6jt4ayyb	12871	84
47	mmaoprvdbmx0vuvoc	12860	156
48	mmaor9v5w9x81d2uf	12876	120
49	mmatdii6pijgxundn	12950	90
50	mmtkptc0epwlcqmxv	12935	60
51	mmtkqhp1d1x0k0vz4	12908	60
52	mmtkrqo8uztc861vm	12920	224
53	mmtksjkyneo9y28m9	12907	54
54	mmtkt91os8d9s4699	12986	119
55	mmtktv9awnd5r5fr4	12918	60
56	mmtkulxysfu621goy	12962	117
57	mmtkv4mz2ig8vt28w	12892	60
58	mmtkvmpihcbzv09lu	13011	120
59	mmtkw7eh639ljr8uh	12980	195
60	mmtkwoxetz288gyck	12971	102
61	mmtkx8pcpn0utjkhp	13013	195
62	mmtp19eox7u0he5w4	13010	90
63	mmuo4hmspea34ibjf	13095	300
64	mmv33njzk0f3az1dt	12964	122
65	mmw7x9dnktu9qpyh9	13014	123
\.


--
-- TOC entry 5249 (class 0 OID 16696)
-- Dependencies: 246
-- Data for Name: receptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.receptions (id, batch_code, confeccionista, has_seconds, charge_type, charge_units, received_by, created_at, affects_inventory, incomplete_units, is_packed, bag_quantity, arrival_date) FROM stdin;
mlpq1t8tghc8ho5zk	7707	98587077	\N	\N	0	Admin Principal	2026-02-16T22:04:08.141Z	t	0	t	1	2026-01-01
mlpq28wsw17qn7i96	7701	32461771	\N	\N	0	Admin Principal	2026-02-16T22:04:28.444Z	t	0	t	1	2026-01-01
mlpq2jikm4ktl92mu	7702	42843342	\N	\N	0	Admin Principal	2026-02-16T22:04:42.188Z	t	0	t	1	2026-01-01
mlpq36ok0o0reoka8	7668	39439040	\N	\N	0	Admin Principal	2026-02-16T22:05:12.213Z	t	0	t	1	2026-01-01
mlpq3opu4aqypg2fi	7688	1045017301	\N	\N	0	Admin Principal	2026-02-16T22:05:35.586Z	t	0	t	1	2026-01-01
mlpq4a58vzx56uhl4	7673	43097913	\N	\N	0	Admin Principal	2026-02-16T22:06:03.356Z	t	0	t	1	2026-01-01
mlpq4k9klzrr8aie5	7690	71223381	\N	\N	0	Admin Principal	2026-02-16T22:06:16.472Z	t	0	t	1	2026-01-01
mlpq57f0zjzbhjfnv	7711	700530400	1	\N	0	Admin Principal	2026-02-16T22:06:46.476Z	t	0	t	1	2026-01-01
mlqzzgck5ph970165	7717	42999087	\N	\N	0	Admin Principal	2026-02-17T19:30:00.452Z	t	0	t	1	2026-01-01
mlr00c6d4f6tfcc5q	7716	32461771	\N	\N	0	Admin Principal	2026-02-17T19:30:41.701Z	t	0	t	1	2026-01-01
mlr00pbqb05frdbp6	7703	43668259	\N	\N	0	Admin Principal	2026-02-17T19:30:58.742Z	t	0	t	1	2026-01-01
mlr017j7mypl7s326	7704	43668259	\N	\N	0	Admin Principal	2026-02-17T19:31:22.339Z	t	0	t	1	2026-01-01
mlr01i6d0g5qluf2h	7722	42843342	\N	\N	0	Admin Principal	2026-02-17T19:31:36.133Z	t	0	t	1	2026-01-01
mlttcu00vutreommn	7705	24368442	0	\N	0	Admin Principal	2026-02-19T13:47:45.889-05:00	t	0	t	1	2026-01-01
mlty1yl4a6ry302z0	7706	24368442	1	\N	0	Admin Principal	2026-02-19T15:59:16.697-05:00	t	0	t	1	2026-01-01
mlppazj3deng1o52k	7695	43189668	0	\N	0	Admin Principal	2026-02-16T21:43:16.575Z	f	0	t	1	2026-01-01
mmao4q01lxfht7ff2	7760	700530400	1	\N	0	Jhon Montoya	2026-03-03T08:53:34.370-05:00	t	0	t	1	2026-01-01
mmao5su5kugcx7xv7	7758	71223381	1	\N	0	Jhon Montoya	2026-03-03T08:54:24.702-05:00	t	0	t	1	2026-01-01
mmao6whwa2xbw9p4p	7761	1037264064	0	\N	0	Jhon Montoya	2026-03-03T08:55:16.100-05:00	t	0	t	1	2026-01-01
mmao79naem9n1qbe9	7742	43668259	0	\N	0	Jhon Montoya	2026-03-03T08:55:33.143-05:00	t	0	t	1	2026-01-01
mmao8x1be6xx3btxl	7740	42999087	0	\N	0	Jhon Montoya	2026-03-03T08:56:50.112-05:00	t	0	t	1	2026-01-01
mmao9do8m0lg17fr6	7744	15927569	0	\N	0	Jhon Montoya	2026-03-03T08:57:11.672-05:00	t	0	t	1	2026-01-01
mmao9p3nebiokex9t	7737	1045017301	0	\N	0	Jhon Montoya	2026-03-03T08:57:26.484-05:00	t	0	t	1	2026-01-01
mmaoa0azmws6s54a	7709	43048297	0	\N	0	Jhon Montoya	2026-03-03T08:57:41.003-05:00	t	0	t	1	2026-01-01
mmaoajr4ipuno6hl8	7720	700530400	1	\N	0	Jhon Montoya	2026-03-03T08:58:06.210-05:00	t	0	t	1	2026-01-01
mmaoayvt347s1m4kf	7718	1128386891	0	\N	0	Jhon Montoya	2026-03-03T08:58:25.818-05:00	t	0	t	1	2026-01-01
mmaob8i7q5d7katdw	7728	43097913	0	\N	0	Jhon Montoya	2026-03-03T08:58:38.288-05:00	t	0	t	1	2026-01-01
mmaobjlpzuoylcaag	7732	71223381	0	\N	0	Jhon Montoya	2026-03-03T08:58:52.670-05:00	t	0	t	1	2026-01-01
mmaocgw2h81nskfgj	7729	43097913	0	\N	0	Jhon Montoya	2026-03-03T08:59:35.810-05:00	t	0	t	1	2026-01-01
mmaocta0d700oicjj	7731	700530400	0	\N	0	Jhon Montoya	2026-03-03T08:59:51.865-05:00	t	0	t	1	2026-01-01
mmaod67lqfxnpyn4d	7719	1037264064	1	\N	0	Jhon Montoya	2026-03-03T09:00:08.626-05:00	t	0	t	1	2026-01-01
mmaodgh2kf28twwgc	7739	32461771	0	\N	0	Jhon Montoya	2026-03-03T09:00:21.926-05:00	t	0	t	1	2026-01-01
mmaoeh09ca7gtrvca	7667	43048297	0	\N	0	Jhon Montoya	2026-03-03T09:01:09.274-05:00	t	0	t	1	2026-01-01
mmaoeq2wmo7gj6j6p	7682	700530400	0	\N	0	Jhon Montoya	2026-03-03T09:01:21.033-05:00	t	0	t	1	2026-01-01
mmaof79qqdg6kd5pj	7684	43668259	0	\N	0	Jhon Montoya	2026-03-03T09:01:43.311-05:00	t	0	t	1	2026-01-01
mmaofh4i892efv0o1	7679	1128386891	0	\N	0	Jhon Montoya	2026-03-03T09:01:56.083-05:00	t	0	t	1	2026-01-01
mmaofx1h06n1546ur	7678	32461771	1	\N	0	Jhon Montoya	2026-03-03T09:02:16.710-05:00	t	0	t	1	2026-01-01
mmaogbltgoe8rv8ri	7683	42999087	0	Compra	1	Jhon Montoya	2026-03-03T09:02:35.586-05:00	t	0	t	1	2026-01-01
mmaohu58qvu5328vx	7663	71223381	0	\N	0	Jhon Montoya	2026-03-03T09:03:46.268-05:00	t	0	t	1	2026-01-01
mmaoi9xpijfoza3p6	7676	1037264064	0	Compra	1	Jhon Montoya	2026-03-03T09:04:06.734-05:00	t	0	t	1	2026-01-01
mmaoipiizi4ze0tjc	7655	42999087	1	\N	0	Jhon Montoya	2026-03-03T09:04:26.922-05:00	t	0	t	1	2026-01-01
mmaok0r0kw9pb5szb	7655	42999087	0	\N	0	Jhon Montoya	2026-03-03T09:05:28.140-05:00	t	0	t	1	2026-01-01
mmaokbqe7lbt1eszq	7647	43668259	0	\N	0	Jhon Montoya	2026-03-03T09:05:42.374-05:00	t	0	t	1	2026-01-01
mmaon9lzzmjumgs7e	7584	39439040	0	Cobro	2	Jhon Montoya	2026-03-03T09:07:59.591-05:00	t	0	t	1	2026-01-01
mmaoo6u5e2m5f4e7b	7658	32461771	0	\N	0	Jhon Montoya	2026-03-03T09:08:42.654-05:00	t	0	t	1	2026-01-01
mmaootlnq6jt4ayyb	7657	98587077	0	\N	0	Jhon Montoya	2026-03-03T09:09:12.155-05:00	t	0	t	1	2026-01-01
mmaoprvdbmx0vuvoc	7570	15927569	0	\N	0	Jhon Montoya	2026-03-03T09:09:56.569-05:00	t	0	t	1	2026-01-01
mmaor9v5w9x81d2uf	7624	32461771	0	\N	0	Jhon Montoya	2026-03-03T09:11:06.546-05:00	t	0	t	1	2026-01-01
mmtkw7eh639ljr8uh	7799	15927569	0	\N	0	Jhon Montoya	2026-03-16T14:30:35.514-05:00	t	0	t	1	2026-03-13
mmtkvmpihcbzv09lu	7789	42843342	1	\N	0	Jhon Montoya	2026-03-16T14:30:08.694-05:00	t	0	t	1	2026-03-12
mmtkulxysfu621goy	7779	42999087	1	\N	0	Jhon Montoya	2026-03-16T14:29:21.046-05:00	t	0	t	3	2026-03-11
mmtkv4mz2ig8vt28w	7767	71223381	0	\N	0	Jhon Montoya	2026-03-16T14:29:45.275-05:00	t	0	t	1	2026-03-11
mmatdii6pijgxundn	7754	43097913	0	Compra	1	Jhon Montoya	2026-03-03T11:20:22.640-05:00	t	0	f	0	2026-01-01
mmtkptc0epwlcqmxv	7762	42843342	0	\N	0	Jhon Montoya	2026-03-16T14:25:37.345-05:00	t	0	f	1	2026-01-01
mmtkqhp1d1x0k0vz4	7769	32461771	0	\N	0	Jhon Montoya	2026-03-16T14:26:08.917-05:00	t	0	t	1	2026-01-01
mmtkrqo8uztc861vm	7734	43189668	0	Compra	1	Jhon Montoya	2026-03-16T14:27:07.209-05:00	t	0	f	2	2026-01-01
mmtksjkyneo9y28m9	7768	43668259	0	\N	0	Jhon Montoya	2026-03-16T14:27:44.675-05:00	t	0	t	1	2026-01-01
mmtkt91os8d9s4699	7771	43097913	0	Compra	1	Jhon Montoya	2026-03-16T14:28:17.677-05:00	t	0	t	1	2026-01-01
mmtktv9awnd5r5fr4	7783	43181466	0	\N	0	Jhon Montoya	2026-03-16T14:28:46.462-05:00	t	0	t	1	2026-01-01
mmtkx8pcpn0utjkhp	7770	700530400	0	\N	0	Jhon Montoya	2026-03-16T14:31:23.857-05:00	t	0	t	2	2026-03-13
mmtkwoxetz288gyck	7790	32461771	0	\N	0	Jhon Montoya	2026-03-16T14:30:58.227-05:00	t	0	t	1	2026-03-13
mmuo4hmspea34ibjf	7804	24368442	0	\N	0	Nury	2026-03-17T08:48:47.045-05:00	t	0	f	1	2026-03-16
mmtp19eox7u0he5w4	7813	42999087	0	\N	0	Nury	2026-03-16T16:26:29.857-05:00	t	0	t	2	2026-03-16
mmv33njzk0f3az1dt	7798	43818822	0	\N	0	Nury	2026-03-17T15:48:02.305-05:00	t	1	f	1	2026-03-17
mmw7x9dnktu9qpyh9	7788	43668259	0	\N	0	Nury	2026-03-18T10:50:48.254-05:00	t	0	t	2	2026-03-18
\.


--
-- TOC entry 5250 (class 0 OID 16713)
-- Dependencies: 247
-- Data for Name: return_reception_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return_reception_items (id, return_reception_id, reference, quantity, unit_price) FROM stdin;
6	mm992elendvcsh0cp	12694	1	24900.00
7	mm992elendvcsh0cp	12693	1	25900.00
8	mmus2t8njmqmbax7y	12905	12	34900.00
9	mmus2t8njmqmbax7y	12937	12	14900.00
10	mmus2t8njmqmbax7y	12910	12	22900.00
\.


--
-- TOC entry 5252 (class 0 OID 16723)
-- Dependencies: 249
-- Data for Name: return_receptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return_receptions (id, client_id, credit_note_number, total_value, received_by, created_at) FROM stdin;
mm992elendvcsh0cp	133	NC-490	50800.00	Prueba general	2026-03-02T09:04:05.859-05:00
mmus2t8njmqmbax7y	231	000	872400.00	Jhon Montoya	2026-03-17T10:39:27.245-05:00
\.


--
-- TOC entry 5253 (class 0 OID 16733)
-- Dependencies: 250
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schema_migrations (id, migration_name, applied_at, success, error_message, execution_time_ms) FROM stdin;
1	001_example_migration.sql	2026-03-17 09:40:27.007668	f	La sección UP está vacía	\N
2	001_add_arrival_date_to_receptions.sql	2026-03-17 09:40:44.221754	t	\N	15
\.


--
-- TOC entry 5255 (class 0 OID 16743)
-- Dependencies: 252
-- Data for Name: sellers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sellers (id, name, active, created_at) FROM stdin;
mlia6gb0u2bhftxam	John Efrain Bolivar	1	2026-02-11 17:05:27
mlia6sxbdfmbvlex0	Lina Pulgarin	1	2026-02-11 17:05:43
mlia7rpjfmtwhg66q	Raul Gonzalez	1	2026-02-11 17:06:28
6vx31qu7f	Bodega	1	\N
\.


--
-- TOC entry 5256 (class 0 OID 16751)
-- Dependencies: 253
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_sessions (id, user_id, socket_id, status, connected_at, last_activity) FROM stdin;
1	mlgqup2eyhdq1lkxm	Qp7xMxfP5-xdNrnKAAAB	online	2026-02-26 14:25:23.522958	2026-02-26 14:25:23.522958
2	mlgqup2eyhdq1lkxm	msxDnFd0DiqEKh9HAAAD	online	2026-02-26 14:25:23.548895	2026-02-26 14:25:23.548895
3	mlgqup2eyhdq1lkxm	YNwzT3vuy7RHzIjnAAAF	online	2026-02-26 14:25:23.568254	2026-02-26 14:25:23.568254
4	mlgqup2eyhdq1lkxm	GXkwE6lbiBs9adTmAAAH	online	2026-02-26 14:25:23.586067	2026-02-26 14:25:23.586067
5	mlgqup2eyhdq1lkxm	GlGRYRYUw2UGnhTUAAAJ	online	2026-02-26 14:25:24.946723	2026-02-26 14:25:24.946723
6	mlgqup2eyhdq1lkxm	DBoU2EEjC3p5M-wkAAAB	online	2026-02-26 14:25:39.061698	2026-02-26 14:25:39.061698
7	mlgqup2eyhdq1lkxm	IN8QjacNqwKVqSOOAAAF	online	2026-02-26 14:25:39.100321	2026-02-26 14:25:39.100321
8	mlgqup2eyhdq1lkxm	gHMSSZD_rNxKIFWVAAAJ	online	2026-02-26 14:25:39.14255	2026-02-26 14:25:39.14255
9	mlgqup2eyhdq1lkxm	9TLuv2eQts3KleQuAAAD	online	2026-02-26 14:25:39.170119	2026-02-26 14:25:39.170119
10	mlgqup2eyhdq1lkxm	9FKyKU3ZQqb9f4IKAAAH	online	2026-02-26 14:25:39.184453	2026-02-26 14:25:39.184453
11	mlgqup2eyhdq1lkxm	S8Q5BUJ2fUxkbjD2AAAB	online	2026-02-26 14:26:07.523678	2026-02-26 14:26:07.523678
12	mlgqup2eyhdq1lkxm	kIHXDMLAHw2lIdUAAAAF	online	2026-02-26 14:26:07.567817	2026-02-26 14:26:07.567817
13	mlgqup2eyhdq1lkxm	7Z1se2qLQQwwGwQCAAAH	online	2026-02-26 14:26:07.59418	2026-02-26 14:26:07.59418
14	mlgqup2eyhdq1lkxm	JN7opTzLaq7rmyE2AAAD	online	2026-02-26 14:26:07.731375	2026-02-26 14:26:07.731375
15	mlgqup2eyhdq1lkxm	RKSPRl5sBWuqc4WbAAAJ	online	2026-02-26 14:26:08.948664	2026-02-26 14:26:08.948664
16	mlgqup2eyhdq1lkxm	isBLVeIFHpFxti4EAAAB	online	2026-02-26 14:26:39.511076	2026-02-26 14:26:39.511076
17	mlgqup2eyhdq1lkxm	SUq9v5BUtmkUEhAAAAAF	online	2026-02-26 14:26:39.552425	2026-02-26 14:26:39.552425
18	mlgqup2eyhdq1lkxm	ld829PHO1dFttUvDAAAD	online	2026-02-26 14:26:39.615452	2026-02-26 14:26:39.615452
19	mlgqup2eyhdq1lkxm	MysbY0jnhZUM3OUoAAAH	online	2026-02-26 14:26:39.617551	2026-02-26 14:26:39.617551
20	mlgqup2eyhdq1lkxm	L7lX7YATQEa3UX-3AAAJ	online	2026-02-26 14:26:40.947192	2026-02-26 14:26:40.947192
31	mlgqup29zlzugg8qk	xeJaTYlmbVkZVpJhAAAV	online	2026-02-26 14:27:40.878683	2026-02-26 14:27:40.878683
32	mlgqup29zlzugg8qk	ZUIj24kLMiTWoU6xAAAX	online	2026-02-26 14:27:41.056495	2026-02-26 14:27:41.056495
33	mlgqup29zlzugg8qk	PT3mC4UrI8LtxBsgAAAZ	online	2026-02-26 14:27:41.526418	2026-02-26 14:27:41.526418
34	mlgqup29zlzugg8qk	hSeqy9xWwmNNUoaRAAAb	online	2026-02-26 14:27:41.576924	2026-02-26 14:27:41.576924
35	mlgqup29zlzugg8qk	POinKjN3O1Bxgw6AAAAd	online	2026-02-26 14:27:41.607588	2026-02-26 14:27:41.607588
36	mlgqup2eyhdq1lkxm	sqG6F9xAwvWy8UyoAAAf	online	2026-02-26 14:27:53.903866	2026-02-26 14:27:53.903866
37	mlgqup2eyhdq1lkxm	81TzXMokNg4VNANSAAAh	online	2026-02-26 14:27:54.030064	2026-02-26 14:27:54.030064
38	mlgqup2eyhdq1lkxm	uoT3w8TrmbkOIQLBAAAj	online	2026-02-26 14:27:54.182917	2026-02-26 14:27:54.182917
39	mlgqup2eyhdq1lkxm	E44DN4hOvS-5LyTwAAAl	online	2026-02-26 14:27:54.218778	2026-02-26 14:27:54.218778
40	mlgqup2eyhdq1lkxm	458qGwW5PcNYjuxnAAAn	online	2026-02-26 14:27:54.248034	2026-02-26 14:27:54.248034
362	mm3x7j6m4p6s4g2zz	9rDCOfLwL2-Dsg6uAAAB	online	2026-02-27 07:27:06.803787	2026-02-27 07:27:06.803787
364	mm3x7j6m4p6s4g2zz	0O-kzkjP1Z3lK8fdAAAF	online	2026-02-27 07:27:07.004985	2026-02-27 07:27:07.004985
51	mlgqup2eyhdq1lkxm	Wc-EUD-miRZNfNhKAAAV	online	2026-02-26 14:30:07.611836	2026-02-26 14:30:07.611836
52	mlgqup2eyhdq1lkxm	qi5FaO368z4prjwsAAAX	online	2026-02-26 14:30:07.615318	2026-02-26 14:30:07.615318
53	mlgqup2eyhdq1lkxm	BrxH9w8u9UF4JA1UAAAZ	online	2026-02-26 14:30:07.903636	2026-02-26 14:30:07.903636
54	mlgqup2eyhdq1lkxm	ZiXbA2pkI-h7oPccAAAb	online	2026-02-26 14:30:08.020859	2026-02-26 14:30:08.020859
55	mlgqup2eyhdq1lkxm	bBksiBFM_K_iOMwLAAAd	online	2026-02-26 14:30:08.117309	2026-02-26 14:30:08.117309
56	mlgqup29zlzugg8qk	da-fPm7dNtd1K-5XAAAf	online	2026-02-26 14:30:11.886864	2026-02-26 14:30:11.886864
57	mlgqup29zlzugg8qk	hRrZvw9H3805-KvkAAAh	online	2026-02-26 14:30:12.063868	2026-02-26 14:30:12.063868
58	mlgqup29zlzugg8qk	OT6VuMmXhEk1jfSDAAAj	online	2026-02-26 14:30:12.517563	2026-02-26 14:30:12.517563
59	mlgqup29zlzugg8qk	dotN_4bQjJ5GsDjVAAAl	online	2026-02-26 14:30:12.617878	2026-02-26 14:30:12.617878
60	mlgqup29zlzugg8qk	Zup1WalG84Aba_rxAAAn	online	2026-02-26 14:30:12.655842	2026-02-26 14:30:12.655842
61	mlgqup2eyhdq1lkxm	GpljFNCcJLI_zzXNAAAB	online	2026-02-26 14:35:37.597149	2026-02-26 14:35:37.597149
62	mlgqup29zlzugg8qk	rjdP-yHR6HrAE7iAAAAH	online	2026-02-26 14:35:37.657585	2026-02-26 14:35:37.657585
63	mlgqup2eyhdq1lkxm	Z4oziJgiMbddBGv_AAAD	online	2026-02-26 14:35:37.667611	2026-02-26 14:35:37.667611
64	mlgqup2eyhdq1lkxm	FCDNbNBkgCakp0kKAAAF	online	2026-02-26 14:35:37.701083	2026-02-26 14:35:37.701083
65	mlgqup29zlzugg8qk	qEDrP9ybh4ttQjhsAAAJ	online	2026-02-26 14:35:37.910035	2026-02-26 14:35:37.910035
66	mlgqup2eyhdq1lkxm	uXYSeP__ZpjvMpZzAAAM	online	2026-02-26 14:35:37.951215	2026-02-26 14:35:37.951215
67	mlgqup29zlzugg8qk	gyY02q3d4oinF2OdAAAN	online	2026-02-26 14:35:37.971966	2026-02-26 14:35:37.971966
68	mlgqup29zlzugg8qk	hB5haXQYronIpBaYAAAP	online	2026-02-26 14:35:38.046864	2026-02-26 14:35:38.046864
69	mlgqup29zlzugg8qk	vmfBf-MHpO2gxijHAAAR	online	2026-02-26 14:35:38.233606	2026-02-26 14:35:38.233606
70	mlgqup2eyhdq1lkxm	HljRAFEnhc-CHduNAAAT	online	2026-02-26 14:35:39.952018	2026-02-26 14:35:39.952018
366	mm3x7j6m4p6s4g2zz	T4yxeLoNcKzBkL40AAAJ	online	2026-02-27 07:27:07.05519	2026-02-27 07:27:07.05519
81	mlgqup29zlzugg8qk	7dQgLyBrD9oN-QBPAAAV	online	2026-02-26 14:36:34.003579	2026-02-26 14:36:34.003579
82	mlgqup29zlzugg8qk	AUzsWgOMF7wiHa7HAAAX	online	2026-02-26 14:36:34.4668	2026-02-26 14:36:34.4668
83	mlgqup29zlzugg8qk	mvOjQ0V2lr4UjtzMAAAZ	online	2026-02-26 14:36:34.739462	2026-02-26 14:36:34.739462
84	mlgqup29zlzugg8qk	vyNBFXxLO15hSJzPAAAb	online	2026-02-26 14:36:34.793296	2026-02-26 14:36:34.793296
85	mlgqup29zlzugg8qk	BTRpu1PVfu6uFGZvAAAd	online	2026-02-26 14:36:34.889209	2026-02-26 14:36:34.889209
86	mlgqup2eyhdq1lkxm	_O42uA2hSlgjG7QGAAAf	online	2026-02-26 14:36:41.458597	2026-02-26 14:36:41.458597
87	mlgqup2eyhdq1lkxm	nUboAgapS2HpwOeDAAAh	online	2026-02-26 14:36:41.471304	2026-02-26 14:36:41.471304
88	mlgqup2eyhdq1lkxm	vu9jTa7Y4HqE7Kg3AAAj	online	2026-02-26 14:36:41.637421	2026-02-26 14:36:41.637421
89	mlgqup2eyhdq1lkxm	yGkc_gF_WW8XixCYAAAl	online	2026-02-26 14:36:41.727336	2026-02-26 14:36:41.727336
90	mlgqup2eyhdq1lkxm	s7THPbVO5KqDLRBCAAAn	online	2026-02-26 14:36:41.838088	2026-02-26 14:36:41.838088
106	mlgqup29zlzugg8qk	0Whe3QvVa117J6NaAAAf	online	2026-02-26 14:40:09.051014	2026-02-26 14:40:09.051014
107	mlgqup29zlzugg8qk	NHytY9MuVRbSEZ4FAAAh	online	2026-02-26 14:40:09.074583	2026-02-26 14:40:09.074583
108	mlgqup29zlzugg8qk	74u2VqS4RwFilYYpAAAj	online	2026-02-26 14:40:09.422775	2026-02-26 14:40:09.422775
109	mlgqup29zlzugg8qk	tRY6Er-FMraNu4-9AAAl	online	2026-02-26 14:40:09.527542	2026-02-26 14:40:09.527542
110	mlgqup29zlzugg8qk	j-GsUgpYzsOVoIFqAAAn	online	2026-02-26 14:40:09.63017	2026-02-26 14:40:09.63017
111	mlgqup2eyhdq1lkxm	uYMjwi4jwXwDn8UHAAAp	online	2026-02-26 14:40:18.012914	2026-02-26 14:40:18.012914
112	mlgqup2eyhdq1lkxm	GBFRm66JF56iGABxAAAr	online	2026-02-26 14:40:18.016199	2026-02-26 14:40:18.016199
113	mlgqup2eyhdq1lkxm	ZA1de1XuxZ7eqZMqAAAt	online	2026-02-26 14:40:18.186092	2026-02-26 14:40:18.186092
114	mlgqup2eyhdq1lkxm	zDM_0jajsA2U7il7AAAv	online	2026-02-26 14:40:18.215578	2026-02-26 14:40:18.215578
115	mlgqup2eyhdq1lkxm	opR5kgYKUyComBuhAAAx	online	2026-02-26 14:40:18.242748	2026-02-26 14:40:18.242748
127	mlgqup2eyhdq1lkxm	rlCM6M3nNj-6QkLvAAAX	online	2026-02-26 14:43:17.798882	2026-02-26 14:43:17.798882
126	mlgqup2eyhdq1lkxm	B5y05DocU917iFFkAAAV	online	2026-02-26 14:43:17.794462	2026-02-26 14:43:17.794462
128	mlgqup2eyhdq1lkxm	C3UFhEUuceXKa-VhAAAZ	online	2026-02-26 14:43:17.982394	2026-02-26 14:43:17.982394
129	mlgqup2eyhdq1lkxm	QWmjslV4tH37unspAAAb	online	2026-02-26 14:43:18.017242	2026-02-26 14:43:18.017242
130	mlgqup2eyhdq1lkxm	58eZsCpCbxsYijywAAAd	online	2026-02-26 14:43:18.047661	2026-02-26 14:43:18.047661
131	mlgqup29zlzugg8qk	hthtLYBLSnkdlRMOAAAf	online	2026-02-26 14:43:20.42766	2026-02-26 14:43:20.42766
132	mlgqup29zlzugg8qk	rj0muaV8caXjUWpXAAAh	online	2026-02-26 14:43:20.564552	2026-02-26 14:43:20.564552
133	mlgqup29zlzugg8qk	p4BmLiepwxQU225SAAAj	online	2026-02-26 14:43:20.861726	2026-02-26 14:43:20.861726
134	mlgqup29zlzugg8qk	mTfrL-a2r6mmCw0dAAAl	online	2026-02-26 14:43:20.899654	2026-02-26 14:43:20.899654
135	mlgqup29zlzugg8qk	YiQmvL7AAn_jas4XAAAn	online	2026-02-26 14:43:20.934453	2026-02-26 14:43:20.934453
146	mlgqup29zlzugg8qk	AzdvE6yYXGpSEbRQAAAV	online	2026-02-26 14:51:23.645236	2026-02-26 14:51:23.645236
147	mlgqup29zlzugg8qk	soVKo3_EDNUtg8oBAAAX	online	2026-02-26 14:51:23.756511	2026-02-26 14:51:23.756511
148	mlgqup29zlzugg8qk	4_UKVb9X6ukE3UchAAAZ	online	2026-02-26 14:51:24.379021	2026-02-26 14:51:24.379021
149	mlgqup29zlzugg8qk	HwTHOLEAXe2wFe07AAAb	online	2026-02-26 14:51:24.447144	2026-02-26 14:51:24.447144
150	mlgqup29zlzugg8qk	z4gaxKhYtsowRP_FAAAd	online	2026-02-26 14:51:24.504013	2026-02-26 14:51:24.504013
151	mlgqup2eyhdq1lkxm	xV2Q44N-3dtUf5EXAAAf	online	2026-02-26 14:51:28.792835	2026-02-26 14:51:28.792835
152	mlgqup2eyhdq1lkxm	k3KLY9zmvkGhpR5OAAAh	online	2026-02-26 14:51:29.043466	2026-02-26 14:51:29.043466
153	mlgqup2eyhdq1lkxm	H9NBTnVNykdEX8LWAAAk	online	2026-02-26 14:51:29.503049	2026-02-26 14:51:29.503049
154	mlgqup2eyhdq1lkxm	AvxQ0OlHHtriVVSEAAAl	online	2026-02-26 14:51:29.513144	2026-02-26 14:51:29.513144
155	mlgqup2eyhdq1lkxm	eF2-iqERHJNI6IBaAAAn	online	2026-02-26 14:51:29.655386	2026-02-26 14:51:29.655386
363	mm3x7j6m4p6s4g2zz	3p7AI5NemdabRhJDAAAD	online	2026-02-27 07:27:06.857225	2026-02-27 07:27:06.857225
365	mm3x7j6m4p6s4g2zz	fe95vXej4fBU1t24AAAH	online	2026-02-27 07:27:07.028859	2026-02-27 07:27:07.028859
296	mm3x7j6m4p6s4g2zz	dlpwnCvAU9q_eOlGAAEZ	online	2026-02-26 15:42:18.949249	2026-02-26 15:42:18.949249
297	mm3x7j6m4p6s4g2zz	nK7i3cFsOC98rEHUAAEb	online	2026-02-26 15:42:18.950177	2026-02-26 15:42:18.950177
298	mm3x7j6m4p6s4g2zz	VnU5T5z_3lItJoM_AAEd	online	2026-02-26 15:42:19.257875	2026-02-26 15:42:19.257875
299	mm3x7j6m4p6s4g2zz	C_yIyDhDhv9ME190AAEf	online	2026-02-26 15:42:19.307499	2026-02-26 15:42:19.307499
311	mm3x7j6m4p6s4g2zz	aWm1tlJtylsrZyH9AAAB	online	2026-02-26 15:57:50.195908	2026-02-26 15:57:50.195908
312	mm3x7j6m4p6s4g2zz	2iZPL8fluTGIUEIdAAAD	online	2026-02-26 15:57:50.941672	2026-02-26 15:57:50.941672
313	mm3x7j6m4p6s4g2zz	KSEU0GpKnNikUdA6AAAF	online	2026-02-26 15:57:50.954485	2026-02-26 15:57:50.954485
314	mm3x7j6m4p6s4g2zz	EGraRSXbWMFlTD0nAAAH	online	2026-02-26 15:57:50.97496	2026-02-26 15:57:50.97496
315	mm3x7j6m4p6s4g2zz	NXlDsUb-rSHQ4ZUbAAAB	online	2026-02-26 16:10:34.129855	2026-02-26 16:10:34.129855
316	mm3x7j6m4p6s4g2zz	H2plqLY78cjZW3oqAAAD	online	2026-02-26 16:10:34.146305	2026-02-26 16:10:34.146305
2328	mm5c36r94emvow7nf	8ergcMwXND8ZcQAJAAAf	online	2026-03-12 12:32:01.127043	2026-03-12 12:32:01.127043
2334	mm3x7j6m4p6s4g2zz	Kq4mFwITjCoZeYeHAAAr	online	2026-03-12 12:32:12.767933	2026-03-12 12:32:12.767933
529	mm3x7j6m4p6s4g2zz	seRSMmNrijCHwbmYAAFF	online	2026-02-27 11:55:26.726223	2026-02-27 11:55:26.726223
530	mm3x7j6m4p6s4g2zz	MBgwIIAtMlPL-pcmAAFH	online	2026-02-27 11:55:26.885319	2026-02-27 11:55:26.885319
531	mm3x7j6m4p6s4g2zz	8H4YdlaJA1d1THQwAAFJ	online	2026-02-27 11:55:27.000153	2026-02-27 11:55:27.000153
532	mm3x7j6m4p6s4g2zz	jXua4A2R0mxtUI3ZAAFL	online	2026-02-27 11:55:27.025369	2026-02-27 11:55:27.025369
533	mm3x7j6m4p6s4g2zz	zGp88UJLE7boTIjiAAFN	online	2026-02-27 11:55:27.040715	2026-02-27 11:55:27.040715
541	mm3x7j6m4p6s4g2zz	ae12qfjq8OvwjBm7AAAP	online	2026-02-27 11:58:14.930857	2026-02-27 11:58:14.930857
542	mm3x7j6m4p6s4g2zz	P02zad7GFltBRi2MAAAR	online	2026-02-27 11:58:14.935805	2026-02-27 11:58:14.935805
543	mm3x7j6m4p6s4g2zz	Jb5U07KndlIQR-4HAAAT	online	2026-02-27 11:58:15.043534	2026-02-27 11:58:15.043534
544	mm3x7j6m4p6s4g2zz	l3a9Wjwoh1n21j7RAAAV	online	2026-02-27 11:58:15.067414	2026-02-27 11:58:15.067414
545	mm3x7j6m4p6s4g2zz	Pxt5gt-Q3W1yF-xrAAAX	online	2026-02-27 11:58:15.078698	2026-02-27 11:58:15.078698
546	mm3x7j6m4p6s4g2zz	gN_qYdDTVljz0tROAAAB	online	2026-02-27 11:59:10.850297	2026-02-27 11:59:10.850297
547	mm3x7j6m4p6s4g2zz	WGwXkefARCbqlHCsAAAD	online	2026-02-27 11:59:10.868268	2026-02-27 11:59:10.868268
548	mm3x7j6m4p6s4g2zz	SwW0_O0DWYjevkGfAAAF	online	2026-02-27 11:59:10.884258	2026-02-27 11:59:10.884258
549	mm3x7j6m4p6s4g2zz	ADeOdEZfMm2RGsL4AAAH	online	2026-02-27 11:59:10.901028	2026-02-27 11:59:10.901028
550	mm3x7j6m4p6s4g2zz	yNNwLGYReKITzUxgAAAJ	online	2026-02-27 11:59:10.915993	2026-02-27 11:59:10.915993
796	mm3x7j6m4p6s4g2zz	Oy6-4h9ppcB90Q2mAAAV	online	2026-03-02 09:15:36.059992	2026-03-02 09:15:36.059992
797	mm3x7j6m4p6s4g2zz	ofJNTmPtZ2OZt60SAAAX	online	2026-03-02 09:15:36.140522	2026-03-02 09:15:36.140522
798	mm3x7j6m4p6s4g2zz	M2WvDL7Bijmjw2JTAAAZ	online	2026-03-02 09:15:36.250992	2026-03-02 09:15:36.250992
799	mm3x7j6m4p6s4g2zz	1BGwRiaR0vECHSBBAAAb	online	2026-03-02 09:15:36.277732	2026-03-02 09:15:36.277732
800	mm3x7j6m4p6s4g2zz	tKFmuojssIl-IaoRAAAd	online	2026-03-02 09:15:36.294424	2026-03-02 09:15:36.294424
751	mm5c36r94emvow7nf	jFq3Ik5uFvclnHMGAAAV	online	2026-03-02 08:52:25.385819	2026-03-02 08:52:25.385819
752	mm5c36r94emvow7nf	OckDOtHVoGzKqE-7AAAX	online	2026-03-02 08:52:25.469476	2026-03-02 08:52:25.469476
753	mm5c36r94emvow7nf	RK77QQitZGp7Bv9wAAAZ	online	2026-03-02 08:52:25.598239	2026-03-02 08:52:25.598239
754	mm5c36r94emvow7nf	SDfiD7pLIWY5-HAHAAAb	online	2026-03-02 08:52:25.617029	2026-03-02 08:52:25.617029
755	mm5c36r94emvow7nf	czD0aBzuYy6OIchNAAAd	online	2026-03-02 08:52:25.650461	2026-03-02 08:52:25.650461
831	mm9a66x3tqtxja160	CurjL3isqPd1eSJ-AAAB	online	2026-03-02 09:44:44.31474	2026-03-02 09:44:44.31474
832	mm9a66x3tqtxja160	h6RAg9QkOCX5TwEmAAAD	online	2026-03-02 09:44:44.31544	2026-03-02 09:44:44.31544
833	mm9a66x3tqtxja160	1tRgljlUR_bnsv2rAAAF	online	2026-03-02 09:44:44.454261	2026-03-02 09:44:44.454261
834	mm9a66x3tqtxja160	w__oI3C7lmkl3UatAAAH	online	2026-03-02 09:44:44.473653	2026-03-02 09:44:44.473653
836	mm3x7j6m4p6s4g2zz	Q16Pbvs50_rRoAvTAAAL	online	2026-03-02 09:45:35.282929	2026-03-02 09:45:35.282929
837	mm3x7j6m4p6s4g2zz	BzVO-Obun1UgQHbhAAAN	online	2026-03-02 09:45:35.451864	2026-03-02 09:45:35.451864
838	mm3x7j6m4p6s4g2zz	q72Bqtifu4L9LJMFAAAP	online	2026-03-02 09:45:35.582672	2026-03-02 09:45:35.582672
839	mm3x7j6m4p6s4g2zz	1oq45L77ycRVkq9fAAAR	online	2026-03-02 09:45:35.604459	2026-03-02 09:45:35.604459
840	mm3x7j6m4p6s4g2zz	TQK_npMwopbNwANlAAAT	online	2026-03-02 09:45:35.624786	2026-03-02 09:45:35.624786
850	mm3x7j6m4p6s4g2zz	9i70rzPYgNWA6qoTAAAT	online	2026-03-02 09:48:09.825003	2026-03-02 09:48:09.825003
851	mm3x7j6m4p6s4g2zz	UthyaI_BL_9UVId8AAAV	online	2026-03-02 09:48:10.014113	2026-03-02 09:48:10.014113
852	mm3x7j6m4p6s4g2zz	4tmRrDcOaUrL2pPLAAAX	online	2026-03-02 09:48:10.159898	2026-03-02 09:48:10.159898
853	mm3x7j6m4p6s4g2zz	VW_wo1u3ZskWyb1VAAAZ	online	2026-03-02 09:48:10.173821	2026-03-02 09:48:10.173821
855	mm9a66x3tqtxja160	pvCX5IDh2xUDZPl0AAAd	online	2026-03-02 09:48:17.232291	2026-03-02 09:48:17.232291
856	mm9a66x3tqtxja160	78xxYl0dAKPDcTzAAAAf	online	2026-03-02 09:48:17.334773	2026-03-02 09:48:17.334773
857	mm9a66x3tqtxja160	GNmpRZBt4uJCA7YeAAAh	online	2026-03-02 09:48:17.451296	2026-03-02 09:48:17.451296
858	mm9a66x3tqtxja160	urxY_nQQDNO-1ybIAAAj	online	2026-03-02 09:48:17.466123	2026-03-02 09:48:17.466123
859	mm9a66x3tqtxja160	p_rLLL8Xmd7RHIY4AAAl	online	2026-03-02 09:48:17.492656	2026-03-02 09:48:17.492656
869	mm9a66x3tqtxja160	emhGK3X55thpOCzQAAAT	online	2026-03-02 09:50:28.861356	2026-03-02 09:50:28.861356
870	mm9a66x3tqtxja160	0wTSoG5JQZA3c1JMAAAV	online	2026-03-02 09:50:29.002045	2026-03-02 09:50:29.002045
871	mm9a66x3tqtxja160	9okPXMNzdW99kYjyAAAX	online	2026-03-02 09:50:29.165404	2026-03-02 09:50:29.165404
872	mm9a66x3tqtxja160	SlTGO3Z1IA_WIcxZAAAZ	online	2026-03-02 09:50:29.19217	2026-03-02 09:50:29.19217
874	mm3x7j6m4p6s4g2zz	9pbTnVF04JuK19B3AAAd	online	2026-03-02 09:50:34.577721	2026-03-02 09:50:34.577721
875	mm3x7j6m4p6s4g2zz	Hz7CT1emVS-3pvPNAAAf	online	2026-03-02 09:50:34.653548	2026-03-02 09:50:34.653548
876	mm3x7j6m4p6s4g2zz	-Ij8VvXXpJjphGp-AAAh	online	2026-03-02 09:50:34.771136	2026-03-02 09:50:34.771136
877	mm3x7j6m4p6s4g2zz	Hwt5ylT3ZvysuA0QAAAj	online	2026-03-02 09:50:34.787694	2026-03-02 09:50:34.787694
878	mm3x7j6m4p6s4g2zz	7KfPEIs8y9BpB6MpAAAl	online	2026-03-02 09:50:34.812431	2026-03-02 09:50:34.812431
2329	mm5c36r94emvow7nf	hTS3N10n3exUSbpiAAAh	online	2026-03-12 12:32:01.184403	2026-03-12 12:32:01.184403
2333	mm3x7j6m4p6s4g2zz	LtVuk66ttOZuhfl9AAAp	online	2026-03-12 12:32:12.701207	2026-03-12 12:32:12.701207
2335	mm3x7j6m4p6s4g2zz	4FS_nhnOSL_7a8GSAAAu	online	2026-03-12 12:32:12.919715	2026-03-12 12:32:12.919715
888	mm3x7j6m4p6s4g2zz	POWQmVS01Icre9iMAAAT	online	2026-03-02 10:07:53.341668	2026-03-02 10:07:53.341668
889	mm3x7j6m4p6s4g2zz	6I9InUw-bsjRyohmAAAV	online	2026-03-02 10:07:53.513072	2026-03-02 10:07:53.513072
890	mm3x7j6m4p6s4g2zz	o2laysiKpNy-QT2mAAAX	online	2026-03-02 10:07:53.661341	2026-03-02 10:07:53.661341
891	mm3x7j6m4p6s4g2zz	Gv4cTuLNZUh0XJSkAAAZ	online	2026-03-02 10:07:53.67834	2026-03-02 10:07:53.67834
892	mm3x7j6m4p6s4g2zz	gmZK-TzBGLHCVZQZAAAb	online	2026-03-02 10:07:53.716138	2026-03-02 10:07:53.716138
913	mm3x7j6m4p6s4g2zz	i4O_ukuDBRbuHPf4AAAf	online	2026-03-02 10:40:19.992083	2026-03-02 10:40:19.992083
914	mm3x7j6m4p6s4g2zz	55WAe8jQstsHCO9fAAAh	online	2026-03-02 10:40:20.170092	2026-03-02 10:40:20.170092
915	mm3x7j6m4p6s4g2zz	-t5Bb_i3165LG9OsAAAj	online	2026-03-02 10:40:20.307873	2026-03-02 10:40:20.307873
916	mm3x7j6m4p6s4g2zz	o1I_K-Zipco4BzgRAAAl	online	2026-03-02 10:40:20.32772	2026-03-02 10:40:20.32772
898	mm3x7j6m4p6s4g2zz	_otKn6xAL1RBuGaGAAAL	online	2026-03-02 10:30:14.187726	2026-03-02 10:30:14.187726
899	mm3x7j6m4p6s4g2zz	Bjf52Qg1Ilek6owoAAAN	online	2026-03-02 10:30:14.440806	2026-03-02 10:30:14.440806
900	mm3x7j6m4p6s4g2zz	YqsHcsVP6e6FCTM4AAAP	online	2026-03-02 10:30:14.531918	2026-03-02 10:30:14.531918
901	mm3x7j6m4p6s4g2zz	cImh-iSTekLNAgpVAAAR	online	2026-03-02 10:30:14.553854	2026-03-02 10:30:14.553854
902	mm3x7j6m4p6s4g2zz	IRbbUYRRo3gWLG3rAAAT	online	2026-03-02 10:30:14.584183	2026-03-02 10:30:14.584183
917	mm3x7j6m4p6s4g2zz	xc4mGv2e-eDJBdiWAAAn	online	2026-03-02 10:40:20.344547	2026-03-02 10:40:20.344547
1128	mm3x7j6m4p6s4g2zz	RQjvOmYB6W9QBWNSAABR	online	2026-03-02 12:37:07.157173	2026-03-02 12:37:07.157173
1129	mm3x7j6m4p6s4g2zz	Uy_D1AiMQEwkMOt7AABT	online	2026-03-02 12:37:07.327329	2026-03-02 12:37:07.327329
1130	mm3x7j6m4p6s4g2zz	4oghv27kaTTRb3JiAABV	online	2026-03-02 12:37:07.440139	2026-03-02 12:37:07.440139
1131	mm3x7j6m4p6s4g2zz	26_M49JbOjEIygfEAABX	online	2026-03-02 12:37:07.460107	2026-03-02 12:37:07.460107
1132	mm3x7j6m4p6s4g2zz	MDfhtdEyteX-HR2NAABZ	online	2026-03-02 12:37:07.478808	2026-03-02 12:37:07.478808
1143	mm3x7j6m4p6s4g2zz	L6D6GcJxqu13nw1eAAAV	online	2026-03-02 12:39:03.241198	2026-03-02 12:39:03.241198
1144	mm3x7j6m4p6s4g2zz	i29aYmbyFvUv9EsFAAAX	online	2026-03-02 12:39:03.464461	2026-03-02 12:39:03.464461
1145	mm3x7j6m4p6s4g2zz	HXs10gd5lUl4p6wAAAAZ	online	2026-03-02 12:39:03.600266	2026-03-02 12:39:03.600266
1146	mm3x7j6m4p6s4g2zz	6uNDLvu0WWhsLpQMAAAb	online	2026-03-02 12:39:03.621439	2026-03-02 12:39:03.621439
1147	mm3x7j6m4p6s4g2zz	jgnE9S6y021JrAGLAAAd	online	2026-03-02 12:39:03.639354	2026-03-02 12:39:03.639354
948	mm3x7j6m4p6s4g2zz	4QAAgiK3fLsI1gf0AAAz	online	2026-03-02 11:17:43.729527	2026-03-02 11:17:43.729527
949	mm3x7j6m4p6s4g2zz	DrEQTJPJbsAL5s6cAAA1	online	2026-03-02 11:17:43.918191	2026-03-02 11:17:43.918191
950	mm3x7j6m4p6s4g2zz	FGxTa8qv6-H24Eo7AAA3	online	2026-03-02 11:17:44.077187	2026-03-02 11:17:44.077187
951	mm3x7j6m4p6s4g2zz	NmTDd2KrQ_hzG-GtAAA5	online	2026-03-02 11:17:44.102231	2026-03-02 11:17:44.102231
952	mm3x7j6m4p6s4g2zz	cM-vCbMWRw3AbZz7AAA7	online	2026-03-02 11:17:44.127243	2026-03-02 11:17:44.127243
2086	mm3x7j6m4p6s4g2zz	L2HmCR0uJhZJeQ9GAAAV	online	2026-03-11 12:53:06.114502	2026-03-11 12:53:06.114502
2087	mm3x7j6m4p6s4g2zz	gckmZA19DAWYOfrZAAAX	online	2026-03-11 12:53:06.119399	2026-03-11 12:53:06.119399
2088	mm3x7j6m4p6s4g2zz	WEx7pVYM8vixPLX1AAAZ	online	2026-03-11 12:53:06.588745	2026-03-11 12:53:06.588745
2089	mm3x7j6m4p6s4g2zz	SawzcOJ5mBrNhuK2AAAb	online	2026-03-11 12:53:06.608207	2026-03-11 12:53:06.608207
1158	mm3x7j6m4p6s4g2zz	4UcFCtOcDb9Mva0fAAAV	online	2026-03-02 12:40:59.365008	2026-03-02 12:40:59.365008
1159	mm3x7j6m4p6s4g2zz	iixutngztYDCLqspAAAX	online	2026-03-02 12:40:59.368605	2026-03-02 12:40:59.368605
1160	mm3x7j6m4p6s4g2zz	L2D8T76Rah3OfYK5AAAZ	online	2026-03-02 12:40:59.494963	2026-03-02 12:40:59.494963
1161	mm3x7j6m4p6s4g2zz	yhLyOvV-GmAmSNh5AAAb	online	2026-03-02 12:40:59.523795	2026-03-02 12:40:59.523795
1162	mm3x7j6m4p6s4g2zz	hPf8Qqs50MGuqONLAAAd	online	2026-03-02 12:40:59.543137	2026-03-02 12:40:59.543137
2090	mm3x7j6m4p6s4g2zz	P4rh3kelyzXi8Q-eAAAd	online	2026-03-11 12:53:06.636806	2026-03-11 12:53:06.636806
1173	mm3x7j6m4p6s4g2zz	BExn3almeVwM-KD8AAAV	online	2026-03-02 12:42:06.102121	2026-03-02 12:42:06.102121
1073	mm3x7j6m4p6s4g2zz	AgCiJ-5JsSYFQ7PdAAAX	online	2026-03-02 12:21:59.155783	2026-03-02 12:21:59.155783
1074	mm3x7j6m4p6s4g2zz	sJWJMXersFmUxGQaAAAV	online	2026-03-02 12:21:59.189019	2026-03-02 12:21:59.189019
1075	mm3x7j6m4p6s4g2zz	H93ccMXsQeRC23nQAAAZ	online	2026-03-02 12:21:59.29668	2026-03-02 12:21:59.29668
1076	mm3x7j6m4p6s4g2zz	0MvJsjxRF84Xe1_4AAAb	online	2026-03-02 12:21:59.324683	2026-03-02 12:21:59.324683
1077	mm3x7j6m4p6s4g2zz	Rl1VLqtl8B2MawYJAAAd	online	2026-03-02 12:21:59.343977	2026-03-02 12:21:59.343977
1174	mm3x7j6m4p6s4g2zz	iEIa2MYWGAf1BL8jAAAX	online	2026-03-02 12:42:06.277108	2026-03-02 12:42:06.277108
1175	mm3x7j6m4p6s4g2zz	dbHyTsCYMPEmbXeTAAAZ	online	2026-03-02 12:42:06.420424	2026-03-02 12:42:06.420424
1176	mm3x7j6m4p6s4g2zz	cmWsGTsDhbSw0nhKAAAb	online	2026-03-02 12:42:06.443836	2026-03-02 12:42:06.443836
1177	mm3x7j6m4p6s4g2zz	fPlRneRkKhtxqyUqAAAd	online	2026-03-02 12:42:06.469919	2026-03-02 12:42:06.469919
1083	mm3x7j6m4p6s4g2zz	iLfZPf4NOgd9dfThAAAL	online	2026-03-02 12:22:20.63163	2026-03-02 12:22:20.63163
1084	mm3x7j6m4p6s4g2zz	BQBZqrck9NVH6OC7AAAN	online	2026-03-02 12:22:20.859446	2026-03-02 12:22:20.859446
1085	mm3x7j6m4p6s4g2zz	msXq53F411onQv0EAAAP	online	2026-03-02 12:22:20.997773	2026-03-02 12:22:20.997773
1086	mm3x7j6m4p6s4g2zz	-NnOrpvJ3zCcDc-vAAAR	online	2026-03-02 12:22:21.017064	2026-03-02 12:22:21.017064
1087	mm3x7j6m4p6s4g2zz	M8KuTePjvI7CkEarAAAT	online	2026-03-02 12:22:21.042989	2026-03-02 12:22:21.042989
1996	mm3x7j6m4p6s4g2zz	NzVTlb5MdoRB7SFFAAAB	online	2026-03-06 08:57:03.745344	2026-03-06 08:57:03.745344
1997	mm3x7j6m4p6s4g2zz	Za-fUi2LR1WXyOJiAAAD	online	2026-03-06 08:57:03.745614	2026-03-06 08:57:03.745614
1998	mm3x7j6m4p6s4g2zz	Vn_nB6rgNRpX3nrgAAAF	online	2026-03-06 08:57:04.160285	2026-03-06 08:57:04.160285
1999	mm3x7j6m4p6s4g2zz	U7BdormK5PYoAHGQAAAH	online	2026-03-06 08:57:04.180805	2026-03-06 08:57:04.180805
2000	mm3x7j6m4p6s4g2zz	jpQreSXsbi8edXJuAAAJ	online	2026-03-06 08:57:04.198676	2026-03-06 08:57:04.198676
2006	mm3x7j6m4p6s4g2zz	maapniB9aeuX3pH5AAAL	online	2026-03-06 09:03:29.949961	2026-03-06 09:03:29.949961
2007	mm3x7j6m4p6s4g2zz	_KT1wXhdmabcQY_RAAAN	online	2026-03-06 09:03:29.963387	2026-03-06 09:03:29.963387
2008	mm3x7j6m4p6s4g2zz	LJvds-CVlAoK6HQ5AAAP	online	2026-03-06 09:03:30.23568	2026-03-06 09:03:30.23568
2009	mm3x7j6m4p6s4g2zz	W0qzt7krliXdouxiAAAR	online	2026-03-06 09:03:30.250827	2026-03-06 09:03:30.250827
2010	mm3x7j6m4p6s4g2zz	b_367RQ9N0pMzDI3AAAT	online	2026-03-06 09:03:30.263531	2026-03-06 09:03:30.263531
1330	mm9a66x3tqtxja160	Kr2MqMk4QQPISEjqAAC_	online	2026-03-03 09:30:04.647883	2026-03-03 09:30:04.647883
1331	mm9a66x3tqtxja160	LbMtvomFxIkS93m7AADB	online	2026-03-03 09:30:04.773784	2026-03-03 09:30:04.773784
1332	mm9a66x3tqtxja160	8vmf1PB616EjANjpAADD	online	2026-03-03 09:30:04.900256	2026-03-03 09:30:04.900256
1333	mm9a66x3tqtxja160	Jq_qL0Z0V_TSNNc_AADF	online	2026-03-03 09:30:04.917623	2026-03-03 09:30:04.917623
1334	mm9a66x3tqtxja160	PPXceDku6T7j4nX2AADH	online	2026-03-03 09:30:04.933124	2026-03-03 09:30:04.933124
1340	mm9a66x3tqtxja160	6FrT8kzFK5GIzQkOAAAL	online	2026-03-03 09:30:35.436313	2026-03-03 09:30:35.436313
1341	mm9a66x3tqtxja160	-p5xrZ1OSX8DFA9VAAAN	online	2026-03-03 09:30:35.439134	2026-03-03 09:30:35.439134
1342	mm9a66x3tqtxja160	ZnvY5-sB6pARBmqQAAAP	online	2026-03-03 09:30:35.606682	2026-03-03 09:30:35.606682
1343	mm9a66x3tqtxja160	39QTHRnSH7SYePB4AAAR	online	2026-03-03 09:30:35.630602	2026-03-03 09:30:35.630602
1344	mm9a66x3tqtxja160	vv-yHlNGdl16avGIAAAT	online	2026-03-03 09:30:35.64592	2026-03-03 09:30:35.64592
2330	mm5c36r94emvow7nf	dCFEGUcWC5ctEkNBAAAj	online	2026-03-12 12:32:01.296675	2026-03-12 12:32:01.296675
2336	mm3x7j6m4p6s4g2zz	r6voNzxuvH4ei-spAAAv	online	2026-03-12 12:32:12.921217	2026-03-12 12:32:12.921217
3562	mm3wcdhk7ksjtfh97	42j4pcSeYEdN8WdiAAAf	online	2026-03-18 08:14:41.82424	2026-03-18 08:14:41.82424
3564	mm3wcdhk7ksjtfh97	xIqqIyLWCRUigNXYAAAj	online	2026-03-18 08:14:42.460404	2026-03-18 08:14:42.460404
2603	mm3x7j6m4p6s4g2zz	-ygsn-Aexr8GXm-AAAAL	online	2026-03-12 16:16:58.309552	2026-03-12 16:16:58.309552
2605	mm3x7j6m4p6s4g2zz	owvup49YIZJD6IwhAAAP	online	2026-03-12 16:16:58.44678	2026-03-12 16:16:58.44678
2606	mm3x7j6m4p6s4g2zz	kxCzLY22q7ZqSbVAAAAR	online	2026-03-12 16:16:58.468515	2026-03-12 16:16:58.468515
2366	mm3x7j6m4p6s4g2zz	4V_FWHK2U07yX4XwAAA5	online	2026-03-12 12:36:04.462811	2026-03-12 12:36:04.462811
2369	mm3x7j6m4p6s4g2zz	a8oDtw9YSVIedIzYAAA_	online	2026-03-12 12:36:04.598821	2026-03-12 12:36:04.598821
2380	mm3x7j6m4p6s4g2zz	69l-p-y0Be7IVei9AAAV	online	2026-03-12 12:41:21.485587	2026-03-12 12:41:21.485587
2383	mm3x7j6m4p6s4g2zz	raMLC622s-WZDBiQAAAb	online	2026-03-12 12:41:21.670192	2026-03-12 12:41:21.670192
3058	mm3x7j6m4p6s4g2zz	DmcW9j2S-4AvDF58AAAP	online	2026-03-16 12:46:31.911065	2026-03-16 12:46:31.911065
3059	mm3x7j6m4p6s4g2zz	NztAvPBBBmxr2ci3AAAR	online	2026-03-16 12:46:31.911743	2026-03-16 12:46:31.911743
3060	mm3x7j6m4p6s4g2zz	P6F6SUoEwUlqaC3GAAAT	online	2026-03-16 12:46:32.01499	2026-03-16 12:46:32.01499
3061	mm3x7j6m4p6s4g2zz	zdFaqUEcqTcJKKUuAAAV	online	2026-03-16 12:46:32.03113	2026-03-16 12:46:32.03113
3062	mm3x7j6m4p6s4g2zz	SCv_ytCbACVzdifIAAAX	online	2026-03-16 12:46:32.049542	2026-03-16 12:46:32.049542
2789	mm3x7j6m4p6s4g2zz	78TL0FqJegTEEqJ-AABb	online	2026-03-13 13:50:38.529717	2026-03-13 13:50:38.529717
2792	mm3x7j6m4p6s4g2zz	tDGL3Mz5feYOagLfAABh	online	2026-03-13 13:50:38.647061	2026-03-13 13:50:38.647061
2908	mm3x7j6m4p6s4g2zz	wev7xQf0OYqYu7e9AAA3	online	2026-03-13 16:55:19.522445	2026-03-13 16:55:19.522445
2909	mm3x7j6m4p6s4g2zz	nie9UglmlXv2dtM-AAA5	online	2026-03-13 16:55:19.782865	2026-03-13 16:55:19.782865
2910	mm3x7j6m4p6s4g2zz	_7WsYCYcEzn8HS8ZAAA7	online	2026-03-13 16:55:19.919229	2026-03-13 16:55:19.919229
2289	mm3x7j6m4p6s4g2zz	wOSo_x9uuw875GxzAAAh	online	2026-03-12 12:11:57.095808	2026-03-12 12:11:57.095808
2291	mm3x7j6m4p6s4g2zz	YFMKJFKJKhl57qc9AAAl	online	2026-03-12 12:11:57.303339	2026-03-12 12:11:57.303339
2292	mm3x7j6m4p6s4g2zz	WK3Q7O7rcwUVyBU5AAAn	online	2026-03-12 12:11:57.354007	2026-03-12 12:11:57.354007
2911	mm3x7j6m4p6s4g2zz	9OKwMn2K6dIAO2LLAAA9	online	2026-03-13 16:55:19.945951	2026-03-13 16:55:19.945951
2912	mm3x7j6m4p6s4g2zz	dfrKGHzYsJIQzBJMAAA_	online	2026-03-13 16:55:20.003273	2026-03-13 16:55:20.003273
2804	mm3x7j6m4p6s4g2zz	cEeRm0le3FDGhZ10AAAV	online	2026-03-13 14:24:31.466629	2026-03-13 14:24:31.466629
2532	mm9a66x3tqtxja160	F3u1eoSkaO4OwmrFAAAZ	online	2026-03-12 14:50:58.893067	2026-03-12 14:50:58.893067
2533	mm9a66x3tqtxja160	XMdFgsMuttXl2SKsAAAb	online	2026-03-12 14:50:58.948303	2026-03-12 14:50:58.948303
2309	mm3x7j6m4p6s4g2zz	QXQirB5aFXgS76rnAAAh	online	2026-03-12 12:27:22.123471	2026-03-12 12:27:22.123471
2311	mm3x7j6m4p6s4g2zz	ND1nHNjiHPoaeqDHAAAl	online	2026-03-12 12:27:22.27115	2026-03-12 12:27:22.27115
2312	mm3x7j6m4p6s4g2zz	By9fnGqU84tsIuUhAAAn	online	2026-03-12 12:27:22.289672	2026-03-12 12:27:22.289672
2535	mm9a66x3tqtxja160	wgGkqBTXXH7U-FOAAAAf	online	2026-03-12 14:50:59.076585	2026-03-12 14:50:59.076585
2536	mm9a66x3tqtxja160	pbtniPRqvxiL7m64AAAh	online	2026-03-12 14:50:59.097652	2026-03-12 14:50:59.097652
2320	mm3x7j6m4p6s4g2zz	O7CXZ64WiUIDJLgBAAAP	online	2026-03-12 12:31:27.681671	2026-03-12 12:31:27.681671
2537	mm3x7j6m4p6s4g2zz	q656QB_RArtARekqAAAj	online	2026-03-12 14:51:39.14148	2026-03-12 14:51:39.14148
2325	mltycdim2me5704rt	xAZExIM5cWPpvXL2AAAZ	online	2026-03-12 12:31:47.12009	2026-03-12 12:31:47.12009
2326	mltycdim2me5704rt	D787QawAeI2gbBoGAAAb	online	2026-03-12 12:31:47.150029	2026-03-12 12:31:47.150029
2540	mm3x7j6m4p6s4g2zz	OIhmCeG01FMgvvjyAAAp	online	2026-03-12 14:51:39.833848	2026-03-12 14:51:39.833848
2822	mm3x7j6m4p6s4g2zz	KH3H2IxivdH4iOt6AAAc	online	2026-03-13 14:47:31.432342	2026-03-13 14:47:31.432342
2824	mm3x7j6m4p6s4g2zz	fCqzAb5y46blimHeAAAg	online	2026-03-13 14:47:31.633207	2026-03-13 14:47:31.633207
2837	mm3x7j6m4p6s4g2zz	SttQ1ZLPYrjopkuLAAAX	online	2026-03-13 15:18:43.296762	2026-03-13 15:18:43.296762
2836	mm3x7j6m4p6s4g2zz	VIwbfFe0UcrM_-puAAAV	online	2026-03-13 15:18:43.295596	2026-03-13 15:18:43.295596
2838	mm3x7j6m4p6s4g2zz	yo0dsFI3jpP3yB5OAAAZ	online	2026-03-13 15:18:43.436055	2026-03-13 15:18:43.436055
2839	mm3x7j6m4p6s4g2zz	s0dJNXovjzRauu62AAAb	online	2026-03-13 15:18:43.459692	2026-03-13 15:18:43.459692
2840	mm3x7j6m4p6s4g2zz	JiiRY9y4wwKT7Jt4AAAd	online	2026-03-13 15:18:43.482887	2026-03-13 15:18:43.482887
2928	mm3x7j6m4p6s4g2zz	ADjPL_Q9kPZzZtPpAAAV	online	2026-03-13 17:09:43.042992	2026-03-13 17:09:43.042992
2929	mm3x7j6m4p6s4g2zz	fph-MUaex20Wyd3RAAAX	online	2026-03-13 17:09:43.043113	2026-03-13 17:09:43.043113
2930	mm3x7j6m4p6s4g2zz	r-FQ21RXrsMXEGaeAAAZ	online	2026-03-13 17:09:43.141156	2026-03-13 17:09:43.141156
2931	mm3x7j6m4p6s4g2zz	KXDQgg0PrtKXTR1tAAAb	online	2026-03-13 17:09:43.163976	2026-03-13 17:09:43.163976
2932	mm3x7j6m4p6s4g2zz	PTw7a0yaPasbKfoTAAAd	online	2026-03-13 17:09:43.185962	2026-03-13 17:09:43.185962
2707	mm3x7j6m4p6s4g2zz	q06_tjSGfH7tUiqUAAA1	online	2026-03-13 12:53:41.726106	2026-03-13 12:53:41.726106
2709	mm3x7j6m4p6s4g2zz	t1Z6fErxiVI70wJoAAA3	online	2026-03-13 12:53:41.845173	2026-03-13 12:53:41.845173
2711	mm3x7j6m4p6s4g2zz	6PJ9u1UHxpDtSHTwAAA7	online	2026-03-13 12:53:41.891262	2026-03-13 12:53:41.891262
2723	mm3x7j6m4p6s4g2zz	pAxsZ0sbturecpSLAAAX	online	2026-03-13 12:57:53.062507	2026-03-13 12:57:53.062507
2725	mm3x7j6m4p6s4g2zz	W7WNp4I5dHfjow08AAAb	online	2026-03-13 12:57:53.186519	2026-03-13 12:57:53.186519
2856	mm3x7j6m4p6s4g2zz	t7zFXaKBGXklM6IuAAAf	online	2026-03-13 15:26:40.651945	2026-03-13 15:26:40.651945
2857	mm3x7j6m4p6s4g2zz	tgzXbYvjoalsRTo9AAAh	online	2026-03-13 15:26:40.652744	2026-03-13 15:26:40.652744
2858	mm3x7j6m4p6s4g2zz	sEgpB0AFbYqEC9oHAAAj	online	2026-03-13 15:26:40.793174	2026-03-13 15:26:40.793174
2859	mm3x7j6m4p6s4g2zz	H_S1WL2M2y_LHrzmAAAl	online	2026-03-13 15:26:40.8249	2026-03-13 15:26:40.8249
2860	mm3x7j6m4p6s4g2zz	_5eq7rY6WxEoiEuFAAAn	online	2026-03-13 15:26:40.835853	2026-03-13 15:26:40.835853
2876	mm3x7j6m4p6s4g2zz	ZNXdQrt-VxkpadzZAAAf	online	2026-03-13 15:53:27.288724	2026-03-13 15:53:27.288724
2877	mm3x7j6m4p6s4g2zz	eDNqRlRTlGHj3rEWAAAh	online	2026-03-13 15:53:27.289366	2026-03-13 15:53:27.289366
2878	mm3x7j6m4p6s4g2zz	jC7Yu2LSjgHciKQjAAAj	online	2026-03-13 15:53:27.456709	2026-03-13 15:53:27.456709
2879	mm3x7j6m4p6s4g2zz	2t57D8adwAZnrwhwAAAl	online	2026-03-13 15:53:27.489267	2026-03-13 15:53:27.489267
2880	mm3x7j6m4p6s4g2zz	FzeaSUFrtoy5x8urAAAn	online	2026-03-13 15:53:27.519242	2026-03-13 15:53:27.519242
3014	mm3x7j6m4p6s4g2zz	-lB7nEXnzrcPasAZAABJ	online	2026-03-16 11:20:43.355247	2026-03-16 11:20:43.355247
3013	mm3x7j6m4p6s4g2zz	CQ5grNFqjzPZmj-HAABH	online	2026-03-16 11:20:43.354809	2026-03-16 11:20:43.354809
3015	mm3x7j6m4p6s4g2zz	_g6Wty49Wk33MCTRAABL	online	2026-03-16 11:20:43.465509	2026-03-16 11:20:43.465509
3016	mm3x7j6m4p6s4g2zz	eueJzHQ333ooY1B-AABN	online	2026-03-16 11:20:43.502946	2026-03-16 11:20:43.502946
3017	mm3x7j6m4p6s4g2zz	AqYL6fXS_NoN0v72AABP	online	2026-03-16 11:20:43.523859	2026-03-16 11:20:43.523859
3030	mm3x7j6m4p6s4g2zz	N2FlW7Wpwbq_-B6yAAAa	online	2026-03-16 12:38:39.394955	2026-03-16 12:38:39.394955
3031	mm3x7j6m4p6s4g2zz	IBDTTdZ-4bVmFeLaAAAb	online	2026-03-16 12:38:39.395564	2026-03-16 12:38:39.395564
3032	mm3x7j6m4p6s4g2zz	GpAKH6GKpAd9AHs9AAAd	online	2026-03-16 12:38:39.557298	2026-03-16 12:38:39.557298
3033	mm3x7j6m4p6s4g2zz	iR79EX3opfaxkKxIAAAf	online	2026-03-16 12:38:39.577402	2026-03-16 12:38:39.577402
2331	mm5c36r94emvow7nf	yhY3deJJ8nycJA4FAAAl	online	2026-03-12 12:32:01.321827	2026-03-12 12:32:01.321827
2337	mm3x7j6m4p6s4g2zz	MqLXAMvzLdPYDj1qAAAx	online	2026-03-12 12:32:12.937439	2026-03-12 12:32:12.937439
3565	mm3wcdhk7ksjtfh97	SnvbHNmenf_PM76oAAAl	online	2026-03-18 08:14:42.47403	2026-03-18 08:14:42.47403
3573	mm3x7j6m4p6s4g2zz	uGdcDk1ZX-X19kNOAABb	online	2026-03-18 08:50:15.076988	2026-03-18 08:50:15.076988
2101	mm3x7j6m4p6s4g2zz	B_KEbLA3JmfhSTNJAAAV	online	2026-03-11 13:47:38.177518	2026-03-11 13:47:38.177518
2102	mm3x7j6m4p6s4g2zz	Gzy0pFQlkAnbdSVxAAAX	online	2026-03-11 13:47:38.201459	2026-03-11 13:47:38.201459
2103	mm3x7j6m4p6s4g2zz	8hFsfgmI_cYV3BArAAAZ	online	2026-03-11 13:47:38.467559	2026-03-11 13:47:38.467559
2104	mm3x7j6m4p6s4g2zz	Enq-NzkGlcBLp-0aAAAb	online	2026-03-11 13:47:38.482249	2026-03-11 13:47:38.482249
2105	mm3x7j6m4p6s4g2zz	aJ93STD1S49mFfaQAAAd	online	2026-03-11 13:47:38.495488	2026-03-11 13:47:38.495488
2604	mm3x7j6m4p6s4g2zz	PW-g9zUnDSdRiLl6AAAN	online	2026-03-12 16:16:58.309963	2026-03-12 16:16:58.309963
2111	mm3x7j6m4p6s4g2zz	_j0qo3qtoN2Fc_ImAAAL	online	2026-03-11 13:47:57.980785	2026-03-11 13:47:57.980785
2112	mm3x7j6m4p6s4g2zz	RXGc2JwDUIykVnFRAAAN	online	2026-03-11 13:47:58.008395	2026-03-11 13:47:58.008395
2113	mm3x7j6m4p6s4g2zz	ZjjyPA7owwrvk2vuAAAP	online	2026-03-11 13:47:58.293348	2026-03-11 13:47:58.293348
2114	mm3x7j6m4p6s4g2zz	pb_IymWwcDoI8EL7AAAR	online	2026-03-11 13:47:58.311134	2026-03-11 13:47:58.311134
2115	mm3x7j6m4p6s4g2zz	0vjI0GkskRxNVtaNAAAT	online	2026-03-11 13:47:58.328476	2026-03-11 13:47:58.328476
2121	mm3x7j6m4p6s4g2zz	bSHR3ZdRn8wtzgFHAAAL	online	2026-03-11 14:15:36.897068	2026-03-11 14:15:36.897068
2122	mm3x7j6m4p6s4g2zz	LvU444ujXHGvlq49AAAN	online	2026-03-11 14:15:36.938781	2026-03-11 14:15:36.938781
2123	mm3x7j6m4p6s4g2zz	_0PfFLgU3VfDwydqAAAP	online	2026-03-11 14:15:37.221096	2026-03-11 14:15:37.221096
2124	mm3x7j6m4p6s4g2zz	knpKJYHlEt6GTWyHAAAR	online	2026-03-11 14:15:37.235866	2026-03-11 14:15:37.235866
2125	mm3x7j6m4p6s4g2zz	8tJu9-OjIDSFalGWAAAT	online	2026-03-11 14:15:37.250417	2026-03-11 14:15:37.250417
2365	mm3x7j6m4p6s4g2zz	Uos8C9MN6V5dyMkPAAA3	online	2026-03-12 12:36:04.462106	2026-03-12 12:36:04.462106
2367	mm3x7j6m4p6s4g2zz	shPXN5o5Co56vBKSAAA7	online	2026-03-12 12:36:04.557345	2026-03-12 12:36:04.557345
2368	mm3x7j6m4p6s4g2zz	rrwna65jqpJgVNjQAAA9	online	2026-03-12 12:36:04.586029	2026-03-12 12:36:04.586029
2131	mm3x7j6m4p6s4g2zz	VtsJT0u6vp6Xzf3eAAAL	online	2026-03-11 14:27:50.09596	2026-03-11 14:27:50.09596
2132	mm3x7j6m4p6s4g2zz	KK_Ev2MHxDrLOa2yAAAN	online	2026-03-11 14:27:50.148288	2026-03-11 14:27:50.148288
2133	mm3x7j6m4p6s4g2zz	-Xpy0DLBj_6jPaWxAAAP	online	2026-03-11 14:27:50.379142	2026-03-11 14:27:50.379142
2134	mm3x7j6m4p6s4g2zz	H9lrx1mU6ZiGXFubAAAR	online	2026-03-11 14:27:50.399229	2026-03-11 14:27:50.399229
2135	mm3x7j6m4p6s4g2zz	XnLGt4pb_cTInn1gAAAT	online	2026-03-11 14:27:50.448098	2026-03-11 14:27:50.448098
2381	mm3x7j6m4p6s4g2zz	1anDO1r8g0c_nvqsAAAX	online	2026-03-12 12:41:21.534511	2026-03-12 12:41:21.534511
2382	mm3x7j6m4p6s4g2zz	grbsmtDjSdQFRDnsAAAZ	online	2026-03-12 12:41:21.646985	2026-03-12 12:41:21.646985
2384	mm3x7j6m4p6s4g2zz	Uko6gph36lN_TvweAAAd	online	2026-03-12 12:41:21.688217	2026-03-12 12:41:21.688217
2151	mm3x7j6m4p6s4g2zz	FNErrWRaWuNmvDT2AAAf	online	2026-03-11 14:35:46.812115	2026-03-11 14:35:46.812115
2152	mm3x7j6m4p6s4g2zz	NbB2cegCTTIgsPEDAAAh	online	2026-03-11 14:35:46.836341	2026-03-11 14:35:46.836341
2153	mm3x7j6m4p6s4g2zz	K6lrC-hyqcYjBwTkAAAj	online	2026-03-11 14:35:47.10602	2026-03-11 14:35:47.10602
2154	mm3x7j6m4p6s4g2zz	XgxcF5vT99Lnp-ZLAAAl	online	2026-03-11 14:35:47.11834	2026-03-11 14:35:47.11834
2155	mm3x7j6m4p6s4g2zz	11BtLSIaEb7_D2TiAAAn	online	2026-03-11 14:35:47.132139	2026-03-11 14:35:47.132139
2288	mm3x7j6m4p6s4g2zz	pLuOXi9uTNJQSEDnAAAf	online	2026-03-12 12:11:56.897785	2026-03-12 12:11:56.897785
2290	mm3x7j6m4p6s4g2zz	4W0uBlnRFeyPNNdbAAAj	online	2026-03-12 12:11:57.269601	2026-03-12 12:11:57.269601
2534	mm9a66x3tqtxja160	-SJqSnMgupki-V5MAAAd	online	2026-03-12 14:50:59.053754	2026-03-12 14:50:59.053754
2538	mm3x7j6m4p6s4g2zz	Hl9U_ng4T3UW90b-AAAl	online	2026-03-12 14:51:39.363537	2026-03-12 14:51:39.363537
2539	mm3x7j6m4p6s4g2zz	wLiCPUnGYBkH3wH-AAAn	online	2026-03-12 14:51:39.77574	2026-03-12 14:51:39.77574
2541	mm3x7j6m4p6s4g2zz	I2nFJ2xReKV3aWkaAAAr	online	2026-03-12 14:51:39.881718	2026-03-12 14:51:39.881718
2166	mm3x7j6m4p6s4g2zz	SZckZ2dyVmo0ppG6AAAV	online	2026-03-11 14:41:37.19202	2026-03-11 14:41:37.19202
2167	mm3x7j6m4p6s4g2zz	HEfcJKQHe8yllKGgAAAX	online	2026-03-11 14:41:37.242745	2026-03-11 14:41:37.242745
2168	mm3x7j6m4p6s4g2zz	5G2OmchuQPVx3WNUAAAZ	online	2026-03-11 14:41:37.843037	2026-03-11 14:41:37.843037
2169	mm3x7j6m4p6s4g2zz	CtvCaMNOAEB9QWs3AAAb	online	2026-03-11 14:41:37.861416	2026-03-11 14:41:37.861416
2170	mm3x7j6m4p6s4g2zz	bIt6wBUM7Y1zavt6AAAd	online	2026-03-11 14:41:37.887705	2026-03-11 14:41:37.887705
2308	mm3x7j6m4p6s4g2zz	a-5bD-hTXTpdEKuPAAAf	online	2026-03-12 12:27:22.121493	2026-03-12 12:27:22.121493
2310	mm3x7j6m4p6s4g2zz	82aU94h0En9CYnfIAAAj	online	2026-03-12 12:27:22.252535	2026-03-12 12:27:22.252535
2318	mm3x7j6m4p6s4g2zz	Dl_uePQMgOGFYQlpAAAL	online	2026-03-12 12:31:27.52848	2026-03-12 12:31:27.52848
2319	mm3x7j6m4p6s4g2zz	GuGcHkevdEC6hlieAAAN	online	2026-03-12 12:31:27.530115	2026-03-12 12:31:27.530115
2321	mm3x7j6m4p6s4g2zz	XoyB5UuoBP_O_o_vAAAR	online	2026-03-12 12:31:27.704546	2026-03-12 12:31:27.704546
2323	mltycdim2me5704rt	oUVoyaK70sMz89zpAAAV	online	2026-03-12 12:31:47.002273	2026-03-12 12:31:47.002273
2324	mltycdim2me5704rt	x5tqg_STS465haaYAAAX	online	2026-03-12 12:31:47.012558	2026-03-12 12:31:47.012558
2790	mm3x7j6m4p6s4g2zz	Bl9hxov-T9BAMdzxAABd	online	2026-03-13 13:50:38.530004	2026-03-13 13:50:38.530004
2791	mm3x7j6m4p6s4g2zz	9Agt1xZA2hX5aHoAAABf	online	2026-03-13 13:50:38.623787	2026-03-13 13:50:38.623787
2186	mm3x7j6m4p6s4g2zz	EdbuLjMSZzGoUGrMAAAf	online	2026-03-11 14:43:36.591604	2026-03-11 14:43:36.591604
2187	mm3x7j6m4p6s4g2zz	MJkBNN_Pj8HfsWBfAAAh	online	2026-03-11 14:43:36.605965	2026-03-11 14:43:36.605965
2188	mm3x7j6m4p6s4g2zz	7qsNXRa_f8UIytX3AAAj	online	2026-03-11 14:43:36.857911	2026-03-11 14:43:36.857911
2189	mm3x7j6m4p6s4g2zz	8srcmY-Ac2mrVSTbAAAl	online	2026-03-11 14:43:36.883169	2026-03-11 14:43:36.883169
2190	mm3x7j6m4p6s4g2zz	jPTYCeM801HMWPYkAAAn	online	2026-03-11 14:43:36.903917	2026-03-11 14:43:36.903917
2793	mm3x7j6m4p6s4g2zz	H-bDBFrzICYy9i6xAABj	online	2026-03-13 13:50:38.667577	2026-03-13 13:50:38.667577
2805	mm3x7j6m4p6s4g2zz	vNnbVDBXkNgePH6pAAAX	online	2026-03-13 14:24:31.466939	2026-03-13 14:24:31.466939
2198	mm3x7j6m4p6s4g2zz	xPh9WaLFl3ZaBFZ2AAAP	online	2026-03-11 14:50:57.279137	2026-03-11 14:50:57.279137
2199	mm3x7j6m4p6s4g2zz	VeYd_avF2eKZnNZJAAAR	online	2026-03-11 14:50:57.290733	2026-03-11 14:50:57.290733
2200	mm3x7j6m4p6s4g2zz	0_VOHvLX1u-JXgUIAAAT	online	2026-03-11 14:50:57.509912	2026-03-11 14:50:57.509912
2201	mm3x7j6m4p6s4g2zz	umRPGui6UeDR09TmAAAV	online	2026-03-11 14:50:57.528071	2026-03-11 14:50:57.528071
2202	mm3x7j6m4p6s4g2zz	dzmga2dfgoO6CD-pAAAX	online	2026-03-11 14:50:57.540445	2026-03-11 14:50:57.540445
2806	mm3x7j6m4p6s4g2zz	GepY88RS4xHQHPIMAAAZ	online	2026-03-13 14:24:31.567291	2026-03-13 14:24:31.567291
2807	mm3x7j6m4p6s4g2zz	WSNInJRLmAlptorTAAAb	online	2026-03-13 14:24:31.603504	2026-03-13 14:24:31.603504
2808	mm3x7j6m4p6s4g2zz	8g0f_XYKyYQFJf65AAAd	online	2026-03-13 14:24:31.619505	2026-03-13 14:24:31.619505
2708	mm3x7j6m4p6s4g2zz	GQXtvNkn9u3moFdyAAAz	online	2026-03-13 12:53:41.725939	2026-03-13 12:53:41.725939
2710	mm3x7j6m4p6s4g2zz	rpPJnl5HRKoHv9nzAAA5	online	2026-03-13 12:53:41.874836	2026-03-13 12:53:41.874836
2821	mm3x7j6m4p6s4g2zz	wL4dzRg7eJ4BEfaMAAAa	online	2026-03-13 14:47:31.280763	2026-03-13 14:47:31.280763
2823	mm3x7j6m4p6s4g2zz	tyKH2ZZituMbb2UQAAAe	online	2026-03-13 14:47:31.608712	2026-03-13 14:47:31.608712
2825	mm3x7j6m4p6s4g2zz	mmkYQcac8ygWAMzrAAAi	online	2026-03-13 14:47:31.660243	2026-03-13 14:47:31.660243
2722	mm3x7j6m4p6s4g2zz	4qtdQPm1Us_eJnTwAAAV	online	2026-03-13 12:57:53.062127	2026-03-13 12:57:53.062127
2724	mm3x7j6m4p6s4g2zz	-W8qGbwdV7UGNCYgAAAZ	online	2026-03-13 12:57:53.157701	2026-03-13 12:57:53.157701
2726	mm3x7j6m4p6s4g2zz	j-zLTJvcejDNIgOgAAAd	online	2026-03-13 12:57:53.207672	2026-03-13 12:57:53.207672
3253	mm3wcdhk7ksjtfh97	iPUokAF57pzv0yyvAABH	online	2026-03-17 08:23:28.054379	2026-03-17 08:23:28.054379
3254	mm3wcdhk7ksjtfh97	7mQdcCz0cj2twmztAABJ	online	2026-03-17 08:23:28.055197	2026-03-17 08:23:28.055197
3255	mm3wcdhk7ksjtfh97	3950ywbsN0MghAoqAABL	online	2026-03-17 08:23:28.136426	2026-03-17 08:23:28.136426
3256	mm3wcdhk7ksjtfh97	kXTvvwtZhH4vFrr_AABN	online	2026-03-17 08:23:28.154781	2026-03-17 08:23:28.154781
3257	mm3wcdhk7ksjtfh97	4Z5p36pAj6CQrniyAABP	online	2026-03-17 08:23:28.175963	2026-03-17 08:23:28.175963
3093	mm3x7j6m4p6s4g2zz	yHmSUgC_Fk3IpV7vAAAp	online	2026-03-16 13:46:15.607234	2026-03-16 13:46:15.607234
3094	mm3x7j6m4p6s4g2zz	qa_PmocEcJ3Dk2GaAAAr	online	2026-03-16 13:46:15.607669	2026-03-16 13:46:15.607669
3095	mm3x7j6m4p6s4g2zz	CxTNPv5keA144HzlAAAt	online	2026-03-16 13:46:15.714206	2026-03-16 13:46:15.714206
3096	mm3x7j6m4p6s4g2zz	R5M-dq3uUGHZsZ80AAAv	online	2026-03-16 13:46:15.732659	2026-03-16 13:46:15.732659
3097	mm3x7j6m4p6s4g2zz	_LtBBp_oiedgFbRfAAAx	online	2026-03-16 13:46:15.749193	2026-03-16 13:46:15.749193
3103	mm3x7j6m4p6s4g2zz	EvBtoQFPBCnyJJDjAAAM	online	2026-03-16 14:03:17.485676	2026-03-16 14:03:17.485676
3104	mm3x7j6m4p6s4g2zz	6gJGgo1J_qDsJ4EvAAAN	online	2026-03-16 14:03:17.486014	2026-03-16 14:03:17.486014
3105	mm3x7j6m4p6s4g2zz	GWVIsES6SgIVaeGYAAAP	online	2026-03-16 14:03:17.630376	2026-03-16 14:03:17.630376
3106	mm3x7j6m4p6s4g2zz	sTy7qEMRXeXb_DRIAAAR	online	2026-03-16 14:03:17.651949	2026-03-16 14:03:17.651949
3107	mm3x7j6m4p6s4g2zz	YBtIMELyaK6CY5lyAAAT	online	2026-03-16 14:03:17.664837	2026-03-16 14:03:17.664837
3118	mm3x7j6m4p6s4g2zz	GzxR1Ypv0ejZLUsKAAAW	online	2026-03-16 14:07:13.955576	2026-03-16 14:07:13.955576
3119	mm3x7j6m4p6s4g2zz	1E0TGCY1MvTaq1dMAAAX	online	2026-03-16 14:07:13.958246	2026-03-16 14:07:13.958246
3120	mm3x7j6m4p6s4g2zz	bl0GOSHB0J6MAOWAAAAZ	online	2026-03-16 14:07:14.064629	2026-03-16 14:07:14.064629
3121	mm3x7j6m4p6s4g2zz	gHcVflJ09wde7rXVAAAb	online	2026-03-16 14:07:14.094892	2026-03-16 14:07:14.094892
3122	mm3x7j6m4p6s4g2zz	xcTREatuVhXEUK_TAAAd	online	2026-03-16 14:07:14.119657	2026-03-16 14:07:14.119657
3278	mm3x7j6m4p6s4g2zz	YV-SFepIKTzTB06VAACN	online	2026-03-17 08:45:43.376715	2026-03-17 08:45:43.376715
3279	mm3x7j6m4p6s4g2zz	s1r_JaJkuLSL48DsAACP	online	2026-03-17 08:45:43.559322	2026-03-17 08:45:43.559322
3280	mm3x7j6m4p6s4g2zz	NVP0NdtUSARlIgBjAACR	online	2026-03-17 08:45:43.729897	2026-03-17 08:45:43.729897
3281	mm3x7j6m4p6s4g2zz	52q0nmqRkfYlht14AACT	online	2026-03-17 08:45:43.775363	2026-03-17 08:45:43.775363
3282	mm3x7j6m4p6s4g2zz	KmOrJdu2YvYIc7MbAACV	online	2026-03-17 08:45:43.817688	2026-03-17 08:45:43.817688
3138	mm3x7j6m4p6s4g2zz	zbGSaE6qG3h5sGIOAAAg	online	2026-03-16 14:19:25.45762	2026-03-16 14:19:25.45762
3139	mm3x7j6m4p6s4g2zz	FH6RuG82mssmA_EhAAAi	online	2026-03-16 14:19:25.458843	2026-03-16 14:19:25.458843
3140	mm3x7j6m4p6s4g2zz	5ZTPiJ39wC-PuEFKAAAk	online	2026-03-16 14:19:25.553369	2026-03-16 14:19:25.553369
3141	mm3x7j6m4p6s4g2zz	w4AUo8dYFYz1rWWAAAAm	online	2026-03-16 14:19:25.575936	2026-03-16 14:19:25.575936
3142	mm3x7j6m4p6s4g2zz	3nunLhqeXepg7nwBAAAo	online	2026-03-16 14:19:25.59374	2026-03-16 14:19:25.59374
3295	mm3x7j6m4p6s4g2zz	-kWFgMum46SSDmxFAAAP	online	2026-03-17 09:18:10.070041	2026-03-17 09:18:10.070041
3296	mm3x7j6m4p6s4g2zz	kiMuVd224vq2gcFYAAAR	online	2026-03-17 09:18:10.071553	2026-03-17 09:18:10.071553
3297	mm3x7j6m4p6s4g2zz	7f9qYSilL2-czw-IAAAT	online	2026-03-17 09:18:10.434433	2026-03-17 09:18:10.434433
3298	mm3x7j6m4p6s4g2zz	rTczQBaTTAcj8K69AAAW	online	2026-03-17 09:18:10.491858	2026-03-17 09:18:10.491858
3299	mm3x7j6m4p6s4g2zz	ID4bFwYwu1Ja1IWAAAAX	online	2026-03-17 09:18:10.529999	2026-03-17 09:18:10.529999
3154	mm3x7j6m4p6s4g2zz	BgJ9P6bKiZVjSEw4AAAX	online	2026-03-16 14:21:36.293939	2026-03-16 14:21:36.293939
3153	mm3x7j6m4p6s4g2zz	bmGnjo5OyxJnyuQ7AAAV	online	2026-03-16 14:21:36.292445	2026-03-16 14:21:36.292445
3155	mm3x7j6m4p6s4g2zz	5y4_qO_x7U-da4h8AAAZ	online	2026-03-16 14:21:36.410515	2026-03-16 14:21:36.410515
3156	mm3x7j6m4p6s4g2zz	sPm7nO8hpN-CwG_6AAAb	online	2026-03-16 14:21:36.440657	2026-03-16 14:21:36.440657
3157	mm3x7j6m4p6s4g2zz	l8TOC-9OqAVEYyDBAAAd	online	2026-03-16 14:21:36.466503	2026-03-16 14:21:36.466503
3306	mm3wcdhk7ksjtfh97	4GyxaqAbkLD0SqBUAAAj	online	2026-03-17 09:18:51.916501	2026-03-17 09:18:51.916501
3305	mm3wcdhk7ksjtfh97	tefdInZp1E6utiCtAAAl	online	2026-03-17 09:18:51.916619	2026-03-17 09:18:51.916619
3307	mm3wcdhk7ksjtfh97	TrLSpQ5Xv8qTnlUOAAAn	online	2026-03-17 09:18:52.010669	2026-03-17 09:18:52.010669
3308	mm3wcdhk7ksjtfh97	H2ZfzWdj1gcZB8MZAAAp	online	2026-03-17 09:18:52.037993	2026-03-17 09:18:52.037993
3309	mm3wcdhk7ksjtfh97	05ghPPwciqbd_OJVAAAr	online	2026-03-17 09:18:52.057555	2026-03-17 09:18:52.057555
3315	mm3wcdhk7ksjtfh97	Hg_rRaz6s9tTxUMEAAAL	online	2026-03-17 09:50:36.272312	2026-03-17 09:50:36.272312
3316	mm3wcdhk7ksjtfh97	zx3g2zqnRXbYza1NAAAN	online	2026-03-17 09:50:36.287691	2026-03-17 09:50:36.287691
3317	mm3wcdhk7ksjtfh97	vEkuTNmzb2pmLSgpAAAP	online	2026-03-17 09:50:36.313382	2026-03-17 09:50:36.313382
3318	mm3wcdhk7ksjtfh97	NbqvJ2YrgbpePvu-AAAR	online	2026-03-17 09:50:36.337819	2026-03-17 09:50:36.337819
3319	mm3wcdhk7ksjtfh97	CY750BxEuLCwH_2kAAAT	online	2026-03-17 09:50:36.363128	2026-03-17 09:50:36.363128
3325	mmtovpuh0hhrz20qp	PA-WtC-qG6RYi6XoAAAf	online	2026-03-17 09:50:42.840238	2026-03-17 09:50:42.840238
3326	mmtovpuh0hhrz20qp	zfxEzQEwQxuxuSg8AAAh	online	2026-03-17 09:50:42.845798	2026-03-17 09:50:42.845798
3327	mmtovpuh0hhrz20qp	S2s6FzNXGP2EcYQSAAAj	online	2026-03-17 09:50:43.394593	2026-03-17 09:50:43.394593
3328	mmtovpuh0hhrz20qp	Vw1Z8UjNiRwWzgqeAAAl	online	2026-03-17 09:50:43.530685	2026-03-17 09:50:43.530685
3329	mmtovpuh0hhrz20qp	CEGxmPplHqEed4JtAAAn	online	2026-03-17 09:50:43.564058	2026-03-17 09:50:43.564058
3340	mm3x7j6m4p6s4g2zz	CHaTbfn_rVj2c-lfAAA-	online	2026-03-17 09:53:06.348615	2026-03-17 09:53:06.348615
3203	mm3wcdhk7ksjtfh97	ufTHc_uJnfhjn6hwAABe	online	2026-03-16 16:28:01.375351	2026-03-16 16:28:01.375351
3204	mm3wcdhk7ksjtfh97	uZf-0oPUeLhNnyxxAABc	online	2026-03-16 16:28:01.375273	2026-03-16 16:28:01.375273
3205	mm3wcdhk7ksjtfh97	HIKsALpaEzgrUR_3AABg	online	2026-03-16 16:28:01.476643	2026-03-16 16:28:01.476643
3206	mm3wcdhk7ksjtfh97	J0yiroCvDuAYrklXAABi	online	2026-03-16 16:28:01.504492	2026-03-16 16:28:01.504492
3341	mm3x7j6m4p6s4g2zz	kzhIp-KXyOZQ5H4vAABA	online	2026-03-17 09:53:06.349727	2026-03-17 09:53:06.349727
3208	mm3wcdhk7ksjtfh97	GqQ4Uf3x9xSM0IxZAABm	online	2026-03-16 16:28:56.244287	2026-03-16 16:28:56.244287
3209	mm3wcdhk7ksjtfh97	_-LJ2RN5R2tG81PJAABo	online	2026-03-16 16:28:56.460955	2026-03-16 16:28:56.460955
3210	mm3wcdhk7ksjtfh97	0dZ8rWgEe7QLqrPTAABq	online	2026-03-16 16:28:56.597991	2026-03-16 16:28:56.597991
3211	mm3wcdhk7ksjtfh97	vYAltvfulP_VbQ5CAABs	online	2026-03-16 16:28:56.616169	2026-03-16 16:28:56.616169
3342	mm3x7j6m4p6s4g2zz	dPC6NcgpNOmwCzJNAABC	online	2026-03-17 09:53:06.531858	2026-03-17 09:53:06.531858
3343	mm3x7j6m4p6s4g2zz	v6UeHXr54wIxJYrQAABE	online	2026-03-17 09:53:06.548491	2026-03-17 09:53:06.548491
3344	mm3x7j6m4p6s4g2zz	Ni6P1iHD02nfdDT0AABG	online	2026-03-17 09:53:06.574499	2026-03-17 09:53:06.574499
3349	mmtovpuh0hhrz20qp	cUW2Wnk924yoPqQIAAAJ	online	2026-03-17 10:07:14.492643	2026-03-17 10:07:14.492643
3350	mmtovpuh0hhrz20qp	_s4nSuxE7OpFM-FzAAAL	online	2026-03-17 10:07:14.518625	2026-03-17 10:07:14.518625
3351	mmtovpuh0hhrz20qp	ztDAzVC7kV8Rl2lgAAAN	online	2026-03-17 10:07:14.543598	2026-03-17 10:07:14.543598
3352	mmtovpuh0hhrz20qp	c8Eecvfczh-l7SQ6AAAR	online	2026-03-17 10:07:14.606243	2026-03-17 10:07:14.606243
3353	mmtovpuh0hhrz20qp	ZhIGDEC8wFak9HEgAAAP	online	2026-03-17 10:07:14.615783	2026-03-17 10:07:14.615783
3354	mm3wcdhk7ksjtfh97	LDmgh2ROiSizTsZxAAAT	online	2026-03-17 10:07:15.168579	2026-03-17 10:07:15.168579
3355	mm3wcdhk7ksjtfh97	wqRKLSCDSv8XoAgyAAAV	online	2026-03-17 10:07:15.193784	2026-03-17 10:07:15.193784
3356	mm3wcdhk7ksjtfh97	24-77rUwGpsk-NCWAAAX	online	2026-03-17 10:07:15.225593	2026-03-17 10:07:15.225593
3375	mm3x7j6m4p6s4g2zz	VrOrBpbcv7AL3HoyAAA9	online	2026-03-17 10:07:39.495135	2026-03-17 10:07:39.495135
3376	mm3x7j6m4p6s4g2zz	kPbGESSJzkJPEGP1AAA_	online	2026-03-17 10:07:39.636799	2026-03-17 10:07:39.636799
3359	mm3wcdhk7ksjtfh97	ihQ0KK0q45vW19QzAAAd	online	2026-03-17 10:07:15.46483	2026-03-17 10:07:15.46483
3574	mm3x7j6m4p6s4g2zz	HHXGhwGkF5V4YXZnAABf	online	2026-03-18 08:50:15.179794	2026-03-18 08:50:15.179794
3576	mm3x7j6m4p6s4g2zz	f2fHdWSWOCi26omhAABj	online	2026-03-18 08:50:15.239884	2026-03-18 08:50:15.239884
3360	mm3wcdhk7ksjtfh97	441z5WLE2bwFKEZgAAAf	online	2026-03-17 10:07:15.471412	2026-03-17 10:07:15.471412
3563	mm3wcdhk7ksjtfh97	3s88G9EFOCsVDLoYAAAh	online	2026-03-18 08:14:42.292946	2026-03-18 08:14:42.292946
3566	mm3wcdhk7ksjtfh97	Lh9lkLMahQu3H5_uAAAn	online	2026-03-18 08:14:42.49392	2026-03-18 08:14:42.49392
3572	mm3x7j6m4p6s4g2zz	66z4IcWxZo5RjmMPAABd	online	2026-03-18 08:50:15.044047	2026-03-18 08:50:15.044047
3575	mm3x7j6m4p6s4g2zz	IXnQZyGXhWVFmIhMAABh	online	2026-03-18 08:50:15.22437	2026-03-18 08:50:15.22437
3374	mm3x7j6m4p6s4g2zz	YQYUh8kPq8aH7cieAAA7	online	2026-03-17 10:07:39.494713	2026-03-17 10:07:39.494713
3377	mm3x7j6m4p6s4g2zz	b_dPLGBLYqM_V9xmAABB	online	2026-03-17 10:07:39.655186	2026-03-17 10:07:39.655186
3378	mm3x7j6m4p6s4g2zz	T0umX5py9QN1C0vrAABD	online	2026-03-17 10:07:39.677246	2026-03-17 10:07:39.677246
3773	mm9a66x3tqtxja160	ECZJsDjRnIwWopytAAD9	online	2026-03-18 16:08:06.822826	2026-03-18 16:08:06.822826
3772	mm9a66x3tqtxja160	Hyxl02aTfCj8BlxTAAD7	online	2026-03-18 16:08:06.817236	2026-03-18 16:08:06.817236
3774	mm9a66x3tqtxja160	tObvTOM2JV9EkliXAAD_	online	2026-03-18 16:08:07.030155	2026-03-18 16:08:07.030155
3775	mm9a66x3tqtxja160	B9_2V4IgiZYZs6uDAAEB	online	2026-03-18 16:08:07.061034	2026-03-18 16:08:07.061034
3776	mm9a66x3tqtxja160	DbzcJX7Ph2eui9x7AAED	online	2026-03-18 16:08:07.085673	2026-03-18 16:08:07.085673
\.


--
-- TOC entry 5258 (class 0 OID 16763)
-- Dependencies: 255
-- Data for Name: user_view_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_view_preferences (id, user_id, view_order, created_at, updated_at) FROM stdin;
5	mmcek5ivcck8np2xg	["salesReport", "fichas-diseno", "fichas-costo", "reception", "returnReception", "maletas", "dispatch", "inventory", "orders", "settle", "orderHistory", "dispatchControl", "deliveryDates", "reports", "masters", "compras"]	2026-03-04 14:06:05.724513	2026-03-04 14:06:05.724513
3	mm3x7j6m4p6s4g2zz	["orders", "fichas-costo", "dispatchControl", "salesReport", "comparativeDashboard", "dispatch", "reports", "settle", "orderHistory", "reception", "returnReception", "fichas-diseno", "maletas", "inventory", "deliveryDates", "compras", "masters"]	2026-02-26 15:44:03.70884	2026-03-12 12:36:01.931213
6	mmtovpuh0hhrz20qp	["dispatchControl", "reception", "returnReception", "dispatch", "inventory", "orders", "settle", "salesReport", "orderHistory", "deliveryDates", "reports", "masters", "compras", "fichas-diseno", "fichas-costo", "comparativeDashboard"]	2026-03-16 16:22:31.984402	2026-03-16 16:22:31.984402
4	mm3wcdhk7ksjtfh97	["settle", "orders", "salesReport", "fichas-costo", "dispatchControl", "deliveryDates", "fichas-diseno", "reception", "dispatch", "returnReception", "maletas", "inventory", "reports", "orderHistory", "masters", "compras", "comparativeDashboard"]	2026-02-27 09:08:53.734436	2026-03-17 08:37:11.053978
\.


--
-- TOC entry 5260 (class 0 OID 16775)
-- Dependencies: 257
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, login_code, pin_hash, role, active, created_at, updated_at) FROM stdin;
mmtovpuh0hhrz20qp	Nury	JJJ	$2b$10$wRindhs.7AA2FBO4MY/Zx.sIpnHZd4LK9vG0a7cwxR2tP6YODMXgK	general	1	\N	2026-03-18 09:49:49.291592
mmcek5ivcck8np2xg	John Efrain	JEB	$2b$10$VD/JpW2jl4AxXDpYtr3kD.tGlnQxH6VKo7x9a6jckXIbNp5exrfzm	observer	1	\N	2026-03-04 14:02:18.439748
mm3x7j6m4p6s4g2zz	Jhon Montoya	JAM	$2b$10$HVWTGPseIo.4.kY81/hl9uBwSz9wZkDsDiXljkIKP1f4goh9OqDhW	admin	1	\N	2026-03-18 14:46:45.177373
mm3wcdhk7ksjtfh97	M@R!@ M	MMB	$2b$10$uWg1bxblm.Wtuox2ndVMXeFml5TrMymRp/GH19r8H/jwuSC0MbIMi	admin	1	\N	2026-03-18 15:14:30.41656
mm9a66x3tqtxja160	Soporte	SOP	$2b$10$B0nqx9NnkI63ADOtIgo9L.A7apvra4LlQkZMG0yE4B1iWWK1QfeVy	soporte	1	2026-03-02 09:35:02.154124	2026-03-18 16:04:57.839167
\.


--
-- TOC entry 5279 (class 0 OID 0)
-- Dependencies: 225
-- Name: correria_novedades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.correria_novedades_id_seq', 1, true);


--
-- TOC entry 5280 (class 0 OID 0)
-- Dependencies: 229
-- Name: dispatch_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dispatch_items_id_seq', 862, true);


--
-- TOC entry 5281 (class 0 OID 0)
-- Dependencies: 239
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 82, true);


--
-- TOC entry 5282 (class 0 OID 0)
-- Dependencies: 245
-- Name: reception_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reception_items_id_seq', 65, true);


--
-- TOC entry 5283 (class 0 OID 0)
-- Dependencies: 248
-- Name: return_reception_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.return_reception_items_id_seq', 10, true);


--
-- TOC entry 5284 (class 0 OID 0)
-- Dependencies: 251
-- Name: schema_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.schema_migrations_id_seq', 2, true);


--
-- TOC entry 5285 (class 0 OID 0)
-- Dependencies: 254
-- Name: user_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_sessions_id_seq', 3776, true);


--
-- TOC entry 5286 (class 0 OID 0)
-- Dependencies: 256
-- Name: user_view_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_view_preferences_id_seq', 6, true);


--
-- TOC entry 5287 (class 0 OID 0)
-- Dependencies: 258
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- TOC entry 4945 (class 2606 OID 16796)
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- TOC entry 4947 (class 2606 OID 16798)
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- TOC entry 4953 (class 2606 OID 16800)
-- Name: compras compras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT compras_pkey PRIMARY KEY (id);


--
-- TOC entry 4959 (class 2606 OID 16802)
-- Name: confeccionistas confeccionistas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.confeccionistas
    ADD CONSTRAINT confeccionistas_pkey PRIMARY KEY (id);


--
-- TOC entry 4961 (class 2606 OID 16804)
-- Name: correria_catalog correria_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.correria_catalog
    ADD CONSTRAINT correria_catalog_pkey PRIMARY KEY (id);


--
-- TOC entry 4963 (class 2606 OID 16806)
-- Name: correria_novedades correria_novedades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.correria_novedades
    ADD CONSTRAINT correria_novedades_pkey PRIMARY KEY (id);


--
-- TOC entry 4966 (class 2606 OID 16808)
-- Name: correrias correrias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.correrias
    ADD CONSTRAINT correrias_pkey PRIMARY KEY (id);


--
-- TOC entry 4968 (class 2606 OID 16810)
-- Name: delivery_dates delivery_dates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_dates
    ADD CONSTRAINT delivery_dates_pkey PRIMARY KEY (id);


--
-- TOC entry 4972 (class 2606 OID 16812)
-- Name: disenadoras disenadoras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disenadoras
    ADD CONSTRAINT disenadoras_pkey PRIMARY KEY (id);


--
-- TOC entry 4974 (class 2606 OID 16814)
-- Name: dispatch_items dispatch_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispatch_items
    ADD CONSTRAINT dispatch_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4978 (class 2606 OID 16816)
-- Name: dispatches dispatches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispatches
    ADD CONSTRAINT dispatches_pkey PRIMARY KEY (id);


--
-- TOC entry 4983 (class 2606 OID 16818)
-- Name: fichas_cortes fichas_cortes_ficha_costo_id_numero_corte_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_cortes
    ADD CONSTRAINT fichas_cortes_ficha_costo_id_numero_corte_key UNIQUE (ficha_costo_id, numero_corte);


--
-- TOC entry 4985 (class 2606 OID 16820)
-- Name: fichas_cortes fichas_cortes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_cortes
    ADD CONSTRAINT fichas_cortes_pkey PRIMARY KEY (id);


--
-- TOC entry 4988 (class 2606 OID 16822)
-- Name: fichas_costo fichas_costo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_costo
    ADD CONSTRAINT fichas_costo_pkey PRIMARY KEY (id);


--
-- TOC entry 4990 (class 2606 OID 16824)
-- Name: fichas_costo fichas_costo_referencia_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_costo
    ADD CONSTRAINT fichas_costo_referencia_key UNIQUE (referencia);


--
-- TOC entry 4993 (class 2606 OID 16826)
-- Name: fichas_diseno fichas_diseno_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_diseno
    ADD CONSTRAINT fichas_diseno_pkey PRIMARY KEY (id);


--
-- TOC entry 4995 (class 2606 OID 16828)
-- Name: fichas_diseno fichas_diseno_referencia_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_diseno
    ADD CONSTRAINT fichas_diseno_referencia_key UNIQUE (referencia);


--
-- TOC entry 5003 (class 2606 OID 16830)
-- Name: inventory_movements inventory_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_pkey PRIMARY KEY (id);


--
-- TOC entry 5005 (class 2606 OID 16832)
-- Name: maletas maletas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maletas
    ADD CONSTRAINT maletas_pkey PRIMARY KEY (id);


--
-- TOC entry 5009 (class 2606 OID 16834)
-- Name: maletas_referencias maletas_referencias_maleta_id_referencia_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maletas_referencias
    ADD CONSTRAINT maletas_referencias_maleta_id_referencia_key UNIQUE (maleta_id, referencia);


--
-- TOC entry 5011 (class 2606 OID 16836)
-- Name: maletas_referencias maletas_referencias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maletas_referencias
    ADD CONSTRAINT maletas_referencias_pkey PRIMARY KEY (id);


--
-- TOC entry 5017 (class 2606 OID 16838)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 5026 (class 2606 OID 16840)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 5028 (class 2606 OID 16842)
-- Name: product_references product_references_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_references
    ADD CONSTRAINT product_references_pkey PRIMARY KEY (id);


--
-- TOC entry 5031 (class 2606 OID 16844)
-- Name: production_tracking production_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_tracking
    ADD CONSTRAINT production_tracking_pkey PRIMARY KEY (ref_id, correria_id);


--
-- TOC entry 5034 (class 2606 OID 16846)
-- Name: reception_items reception_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reception_items
    ADD CONSTRAINT reception_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5038 (class 2606 OID 16848)
-- Name: receptions receptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receptions
    ADD CONSTRAINT receptions_pkey PRIMARY KEY (id);


--
-- TOC entry 5040 (class 2606 OID 16850)
-- Name: return_reception_items return_reception_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_reception_items
    ADD CONSTRAINT return_reception_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5042 (class 2606 OID 16852)
-- Name: return_receptions return_receptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_receptions
    ADD CONSTRAINT return_receptions_pkey PRIMARY KEY (id);


--
-- TOC entry 5044 (class 2606 OID 16854)
-- Name: schema_migrations schema_migrations_migration_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_migration_name_key UNIQUE (migration_name);


--
-- TOC entry 5046 (class 2606 OID 16856)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5048 (class 2606 OID 16858)
-- Name: sellers sellers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sellers
    ADD CONSTRAINT sellers_pkey PRIMARY KEY (id);


--
-- TOC entry 5053 (class 2606 OID 16860)
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 5055 (class 2606 OID 16862)
-- Name: user_sessions user_sessions_user_id_socket_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_socket_id_key UNIQUE (user_id, socket_id);


--
-- TOC entry 5058 (class 2606 OID 16864)
-- Name: user_view_preferences user_view_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_view_preferences
    ADD CONSTRAINT user_view_preferences_pkey PRIMARY KEY (id);


--
-- TOC entry 5060 (class 2606 OID 16866)
-- Name: user_view_preferences user_view_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_view_preferences
    ADD CONSTRAINT user_view_preferences_user_id_key UNIQUE (user_id);


--
-- TOC entry 5064 (class 2606 OID 16868)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4948 (class 1259 OID 16869)
-- Name: idx_clients_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_active ON public.clients USING btree (active);


--
-- TOC entry 4949 (class 1259 OID 16870)
-- Name: idx_clients_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_name ON public.clients USING btree (name);


--
-- TOC entry 4950 (class 1259 OID 16871)
-- Name: idx_clients_nit; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_nit ON public.clients USING btree (nit);


--
-- TOC entry 4951 (class 1259 OID 16872)
-- Name: idx_clients_seller_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_seller_id ON public.clients USING btree (seller_id);


--
-- TOC entry 4954 (class 1259 OID 16873)
-- Name: idx_compras_afecta_inventario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_compras_afecta_inventario ON public.compras USING btree (afecta_inventario);


--
-- TOC entry 4955 (class 1259 OID 16874)
-- Name: idx_compras_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_compras_fecha ON public.compras USING btree (fecha);


--
-- TOC entry 4956 (class 1259 OID 16875)
-- Name: idx_compras_insumo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_compras_insumo ON public.compras USING btree (insumo);


--
-- TOC entry 4957 (class 1259 OID 16876)
-- Name: idx_compras_proveedor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_compras_proveedor ON public.compras USING btree (proveedor);


--
-- TOC entry 4964 (class 1259 OID 16877)
-- Name: idx_correria_novedades_correria_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_correria_novedades_correria_id ON public.correria_novedades USING btree (correria_id);


--
-- TOC entry 4969 (class 1259 OID 16878)
-- Name: idx_delivery_dates_confeccionista_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_dates_confeccionista_id ON public.delivery_dates USING btree (confeccionista_id);


--
-- TOC entry 4970 (class 1259 OID 16879)
-- Name: idx_delivery_dates_reference_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_dates_reference_id ON public.delivery_dates USING btree (reference_id);


--
-- TOC entry 4975 (class 1259 OID 16880)
-- Name: idx_dispatch_items_dispatch_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dispatch_items_dispatch_id ON public.dispatch_items USING btree (dispatch_id);


--
-- TOC entry 4976 (class 1259 OID 16881)
-- Name: idx_dispatch_items_reference; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dispatch_items_reference ON public.dispatch_items USING btree (reference);


--
-- TOC entry 4979 (class 1259 OID 16882)
-- Name: idx_dispatches_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dispatches_client_id ON public.dispatches USING btree (client_id);


--
-- TOC entry 4980 (class 1259 OID 16883)
-- Name: idx_dispatches_correria_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dispatches_correria_id ON public.dispatches USING btree (correria_id);


--
-- TOC entry 4981 (class 1259 OID 16884)
-- Name: idx_dispatches_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dispatches_created_at ON public.dispatches USING btree (created_at);


--
-- TOC entry 4986 (class 1259 OID 16885)
-- Name: idx_fichas_cortes_ficha_costo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fichas_cortes_ficha_costo ON public.fichas_cortes USING btree (ficha_costo_id);


--
-- TOC entry 4991 (class 1259 OID 16886)
-- Name: idx_fichas_costo_referencia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fichas_costo_referencia ON public.fichas_costo USING btree (referencia);


--
-- TOC entry 4996 (class 1259 OID 16887)
-- Name: idx_fichas_diseno_referencia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fichas_diseno_referencia ON public.fichas_diseno USING btree (referencia);


--
-- TOC entry 4997 (class 1259 OID 16888)
-- Name: idx_inventory_movements_compra_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_movements_compra_id ON public.inventory_movements USING btree (compra_id);


--
-- TOC entry 4998 (class 1259 OID 16889)
-- Name: idx_inventory_movements_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_movements_created_at ON public.inventory_movements USING btree (created_at);


--
-- TOC entry 4999 (class 1259 OID 16890)
-- Name: idx_inventory_movements_insumo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_movements_insumo ON public.inventory_movements USING btree (lower((insumo)::text));


--
-- TOC entry 5000 (class 1259 OID 16891)
-- Name: idx_inventory_movements_movimiento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_movements_movimiento ON public.inventory_movements USING btree (movimiento);


--
-- TOC entry 5001 (class 1259 OID 16892)
-- Name: idx_inventory_movements_referencia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_movements_referencia ON public.inventory_movements USING btree (lower((referencia_destino)::text));


--
-- TOC entry 5006 (class 1259 OID 16893)
-- Name: idx_maletas_referencias_maleta; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maletas_referencias_maleta ON public.maletas_referencias USING btree (maleta_id);


--
-- TOC entry 5007 (class 1259 OID 16894)
-- Name: idx_maletas_referencias_maleta_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maletas_referencias_maleta_id ON public.maletas_referencias USING btree (maleta_id);


--
-- TOC entry 5012 (class 1259 OID 16895)
-- Name: idx_messages_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at);


--
-- TOC entry 5013 (class 1259 OID 16896)
-- Name: idx_messages_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_read ON public.messages USING btree (read);


--
-- TOC entry 5014 (class 1259 OID 16897)
-- Name: idx_messages_receiver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_receiver ON public.messages USING btree (receiver_id);


--
-- TOC entry 5015 (class 1259 OID 16898)
-- Name: idx_messages_sender_receiver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_sender_receiver ON public.messages USING btree (sender_id, receiver_id);


--
-- TOC entry 5018 (class 1259 OID 16899)
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- TOC entry 5019 (class 1259 OID 16900)
-- Name: idx_orders_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_client_id ON public.orders USING btree (client_id);


--
-- TOC entry 5020 (class 1259 OID 16901)
-- Name: idx_orders_correria_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_correria_id ON public.orders USING btree (correria_id);


--
-- TOC entry 5021 (class 1259 OID 16902)
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at);


--
-- TOC entry 5022 (class 1259 OID 16903)
-- Name: idx_orders_end_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_end_date ON public.orders USING btree (end_date);


--
-- TOC entry 5023 (class 1259 OID 16904)
-- Name: idx_orders_seller_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_seller_id ON public.orders USING btree (seller_id);


--
-- TOC entry 5024 (class 1259 OID 16905)
-- Name: idx_orders_start_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_start_date ON public.orders USING btree (start_date);


--
-- TOC entry 5029 (class 1259 OID 16906)
-- Name: idx_production_tracking_correria_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_production_tracking_correria_id ON public.production_tracking USING btree (correria_id);


--
-- TOC entry 5032 (class 1259 OID 16907)
-- Name: idx_reception_items_reception_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reception_items_reception_id ON public.reception_items USING btree (reception_id);


--
-- TOC entry 5035 (class 1259 OID 16908)
-- Name: idx_receptions_arrival_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receptions_arrival_date ON public.receptions USING btree (arrival_date);


--
-- TOC entry 5036 (class 1259 OID 16909)
-- Name: idx_receptions_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receptions_created_at ON public.receptions USING btree (created_at);


--
-- TOC entry 5049 (class 1259 OID 16910)
-- Name: idx_user_sessions_last_activity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_last_activity ON public.user_sessions USING btree (last_activity);


--
-- TOC entry 5050 (class 1259 OID 16911)
-- Name: idx_user_sessions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_status ON public.user_sessions USING btree (status);


--
-- TOC entry 5051 (class 1259 OID 16912)
-- Name: idx_user_sessions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions USING btree (user_id);


--
-- TOC entry 5056 (class 1259 OID 16913)
-- Name: idx_user_view_preferences_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_view_preferences_user_id ON public.user_view_preferences USING btree (user_id);


--
-- TOC entry 5061 (class 1259 OID 16914)
-- Name: idx_users_login_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_login_code ON public.users USING btree (login_code);


--
-- TOC entry 5062 (class 1259 OID 16915)
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- TOC entry 5074 (class 2620 OID 16916)
-- Name: user_view_preferences trigger_update_user_view_preferences_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_user_view_preferences_timestamp BEFORE UPDATE ON public.user_view_preferences FOR EACH ROW EXECUTE FUNCTION public.update_user_view_preferences_timestamp();


--
-- TOC entry 5065 (class 2606 OID 16917)
-- Name: correria_novedades correria_novedades_correria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.correria_novedades
    ADD CONSTRAINT correria_novedades_correria_id_fkey FOREIGN KEY (correria_id) REFERENCES public.correrias(id) ON DELETE CASCADE;


--
-- TOC entry 5067 (class 2606 OID 16922)
-- Name: fichas_cortes fichas_cortes_ficha_costo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_cortes
    ADD CONSTRAINT fichas_cortes_ficha_costo_id_fkey FOREIGN KEY (ficha_costo_id) REFERENCES public.fichas_costo(id) ON DELETE CASCADE;


--
-- TOC entry 5068 (class 2606 OID 16927)
-- Name: fichas_costo fichas_costo_ficha_diseno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_costo
    ADD CONSTRAINT fichas_costo_ficha_diseno_id_fkey FOREIGN KEY (ficha_diseno_id) REFERENCES public.fichas_diseno(id);


--
-- TOC entry 5069 (class 2606 OID 16932)
-- Name: fichas_diseno fichas_diseno_disenadora_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fichas_diseno
    ADD CONSTRAINT fichas_diseno_disenadora_id_fkey FOREIGN KEY (disenadora_id) REFERENCES public.disenadoras(id);


--
-- TOC entry 5066 (class 2606 OID 16937)
-- Name: dispatch_items fk_dispatch_items_dispatch; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispatch_items
    ADD CONSTRAINT fk_dispatch_items_dispatch FOREIGN KEY (dispatch_id) REFERENCES public.dispatches(id);


--
-- TOC entry 5070 (class 2606 OID 16942)
-- Name: inventory_movements inventory_movements_compra_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_compra_id_fkey FOREIGN KEY (compra_id) REFERENCES public.compras(id) ON DELETE SET NULL;


--
-- TOC entry 5071 (class 2606 OID 16947)
-- Name: maletas maletas_correria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maletas
    ADD CONSTRAINT maletas_correria_id_fkey FOREIGN KEY (correria_id) REFERENCES public.correrias(id);


--
-- TOC entry 5072 (class 2606 OID 16952)
-- Name: maletas_referencias maletas_referencias_maleta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maletas_referencias
    ADD CONSTRAINT maletas_referencias_maleta_id_fkey FOREIGN KEY (maleta_id) REFERENCES public.maletas(id) ON DELETE CASCADE;


--
-- TOC entry 5073 (class 2606 OID 16957)
-- Name: user_view_preferences user_view_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_view_preferences
    ADD CONSTRAINT user_view_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5269 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-03-18 16:22:18

--
-- PostgreSQL database dump complete
--

\unrestrict MvKVOryrqEJEboCxjgWqnJDdjpkSZvqKVQPiw4mgJ2pbC9DlZLCcLU6Wqu3Q2AR

