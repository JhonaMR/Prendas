-- Llenar sale_price en dispatch_items con el precio de venta del pedido del cliente
-- para los items que no tienen sale_price (NULL o 0)

UPDATE dispatch_items di
SET sale_price = oi.sale_price
FROM order_items oi
INNER JOIN orders o ON oi.order_id = o.id
INNER JOIN dispatches d ON d.client_id = o.client_id AND d.correria_id = o.correria_id
WHERE oi.reference = di.reference
  AND di.dispatch_id = d.id
  AND (di.sale_price IS NULL OR di.sale_price = 0);

-- Verificar que se actualizaron correctamente
SELECT COUNT(*) as items_actualizados
FROM dispatch_items
WHERE sale_price > 0;
