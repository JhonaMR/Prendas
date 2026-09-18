-- Up
ALTER TABLE correrias ADD COLUMN numero_orden INTEGER DEFAULT NULL;

-- Down
ALTER TABLE correrias DROP COLUMN numero_orden;
