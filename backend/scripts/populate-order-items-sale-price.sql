-- Llenar sale_price en order_items con el precio de lista de las referencias
-- para los items que no tienen sale_price (NULL o 0)

UPDATE order_items oi
SET sale_price = r.price
FROM product_references r
WHERE oi.reference = r.id
  AND (oi.sale_price IS NULL OR oi.sale_price = 0);

-- Verificar que se actualizaron correctamente
SELECT COUNT(*) as items_actualizados
FROM order_items
WHERE sale_price > 0;
