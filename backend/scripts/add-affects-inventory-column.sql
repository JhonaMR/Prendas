-- Migration: Add affects_inventory column to receptions table
-- Date: 2026-02-23
-- Description: Adds a boolean column to control whether a reception impacts inventory

-- Add the column with default value TRUE (all existing receptions will affect inventory)
ALTER TABLE public.receptions
ADD COLUMN affects_inventory BOOLEAN DEFAULT TRUE;

-- Add comment to explain the column
COMMENT ON COLUMN public.receptions.affects_inventory IS 'Controls whether this reception impacts the inventory. Set to FALSE for partial receptions that are part of a larger batch.';

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'receptions' AND column_name = 'affects_inventory';
