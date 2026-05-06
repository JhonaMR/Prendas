-- migrations/016_create_order_notes.sql
-- Descripción: Tabla para almacenar contacto y novedad por pedido (vista Clientes por Correría)
-- Relación 1:1 con orders — solo se crea la fila cuando el usuario guarda algo

-- ==================== UP ====================

CREATE TABLE IF NOT EXISTS public.order_notes (
    order_id    varchar(255) PRIMARY KEY REFERENCES public.orders(id) ON DELETE CASCADE,
    contacto    varchar(255),
    novedad     text,
    updated_at  timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by  varchar(255)
);

CREATE INDEX IF NOT EXISTS idx_order_notes_order_id ON public.order_notes(order_id);

-- ==================== DOWN ====================
-- DROP INDEX IF EXISTS idx_order_notes_order_id;
-- DROP TABLE IF EXISTS public.order_notes;
