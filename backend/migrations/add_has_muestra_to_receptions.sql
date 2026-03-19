-- Migration: Add has_muestra column to receptions table
-- Apply to: inventory_plow, inventory_melas, inventory_dev (or dev DB)
-- All existing records default to FALSE (No)

ALTER TABLE receptions
ADD COLUMN IF NOT EXISTS has_muestra BOOLEAN NOT NULL DEFAULT FALSE;

-- Verify
-- SELECT column_name, data_type, column_default FROM information_schema.columns
-- WHERE table_name = 'receptions' AND column_name = 'has_muestra';
