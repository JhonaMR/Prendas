-- Verificar los últimos despachos y sus sale_price
SELECT 
  d.id as dispatch_id,
  d.client_id,
  d.correria_id,
  di.reference,
  di.quantity,
  di.sale_price,
  d.created_at
FROM dispatches d
LEFT JOIN dispatch_items di ON d.id = di.dispatch_id
ORDER BY d.created_at DESC
LIMIT 50;
