const pool = require('../../../config/database');

class InventoryMovementsService {
  async getAll() {
    const query = `
      SELECT 
        id,
        insumo,
        cantidad,
        valor_unitario,
        valor_total,
        proveedor,
        referencia_destino,
        remision_factura,
        movimiento,
        compra_id,
        fecha_creacion,
        created_at,
        updated_at
      FROM inventory_movements
      ORDER BY fecha_creacion DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async getById(id) {
    const query = `
      SELECT 
        id,
        insumo,
        cantidad,
        valor_unitario,
        valor_total,
        proveedor,
        referencia_destino,
        remision_factura,
        movimiento,
        compra_id,
        fecha_creacion,
        created_at,
        updated_at
      FROM inventory_movements
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async create(data) {
    const {
      insumo,
      cantidad,
      valor_unitario,
      valor_total,
      proveedor,
      referencia_destino,
      remision_factura,
      movimiento,
      compra_id
    } = data;

    const query = `
      INSERT INTO inventory_movements (
        insumo,
        cantidad,
        valor_unitario,
        valor_total,
        proveedor,
        referencia_destino,
        remision_factura,
        movimiento,
        compra_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING 
        id,
        insumo,
        cantidad,
        valor_unitario,
        valor_total,
        proveedor,
        referencia_destino,
        remision_factura,
        movimiento,
        compra_id,
        fecha_creacion,
        created_at,
        updated_at
    `;

    const result = await pool.query(query, [
      insumo,
      cantidad,
      valor_unitario,
      valor_total,
      proveedor,
      referencia_destino || null,
      remision_factura || null,
      movimiento,
      compra_id || null
    ]);

    return result.rows[0];
  }

  async update(id, data) {
    const {
      insumo,
      cantidad,
      valor_unitario,
      valor_total,
      proveedor,
      referencia_destino,
      remision_factura,
      movimiento
    } = data;

    const query = `
      UPDATE inventory_movements
      SET 
        insumo = COALESCE($1, insumo),
        cantidad = COALESCE($2, cantidad),
        valor_unitario = COALESCE($3, valor_unitario),
        valor_total = COALESCE($4, valor_total),
        proveedor = COALESCE($5, proveedor),
        referencia_destino = COALESCE($6, referencia_destino),
        remision_factura = COALESCE($7, remision_factura),
        movimiento = COALESCE($8, movimiento),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING 
        id,
        insumo,
        cantidad,
        valor_unitario,
        valor_total,
        proveedor,
        referencia_destino,
        remision_factura,
        movimiento,
        compra_id,
        fecha_creacion,
        created_at,
        updated_at
    `;

    const result = await pool.query(query, [
      insumo,
      cantidad,
      valor_unitario,
      valor_total,
      proveedor,
      referencia_destino,
      remision_factura,
      movimiento,
      id
    ]);

    return result.rows[0];
  }

  async delete(id) {
    const query = 'DELETE FROM inventory_movements WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async createFromCompra(compraData) {
    const {
      id: compra_id,
      insumo,
      cantidadInsumo: cantidad,
      total: valor_total,
      precioUnidad: valor_unitario,
      proveedor
    } = compraData;

    return this.create({
      insumo,
      cantidad,
      valor_unitario,
      valor_total,
      proveedor,
      referencia_destino: null,
      remision_factura: null,
      movimiento: 'Entrada',
      compra_id
    });
  }
}

module.exports = new InventoryMovementsService();
