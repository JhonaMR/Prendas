/**
 * Servicio para operaciones de Compras - POSTGRESQL
 */

const { query } = require('../../../config/database');
const { generateId } = require('../../../config/database');
const logger = require('../../shared/logger');
const inventoryMovementsService = require('../inventoryMovements/inventoryMovementsService');

/**
 * Obtener todas las compras
 */
const getAllCompras = async () => {
  try {
    const result = await query(
      `SELECT * FROM compras ORDER BY fecha DESC`
    );
    return result.rows;
  } catch (error) {
    logger.error('Error getting all compras', error);
    throw error;
  }
};

/**
 * Obtener compra por ID
 */
const getCompraById = async (id) => {
  try {
    const result = await query(
      `SELECT * FROM compras WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      const error = new Error('Compra no encontrada');
      error.statusCode = 404;
      throw error;
    }
    
    return result.rows[0];
  } catch (error) {
    logger.error('Error getting compra by id', error);
    throw error;
  }
};

/**
 * Crear nueva compra
 */
const createCompra = async (data) => {
  try {
    const id = generateId();
    
    const {
      fecha,
      referencia,
      unidades,
      insumo,
      cantidadInsumo,
      precioUnidad,
      cantidadTotal,
      total,
      proveedor,
      fechaPedido,
      observacion,
      factura,
      precioRealInsumoUnd,
      afectaInventario
    } = data;

    const result = await query(
      `INSERT INTO compras (
        id, fecha, referencia, unidades, insumo, cantidad_insumo,
        precio_unidad, cantidad_total, total, proveedor, fecha_pedido,
        observacion, factura, precio_real_insumo_und, afecta_inventario
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        id,
        fecha,
        referencia || null,
        unidades || null,
        insumo,
        cantidadInsumo,
        precioUnidad,
        cantidadTotal,
        total,
        proveedor,
        fechaPedido || null,
        observacion || null,
        factura || null,
        precioRealInsumoUnd || 'pendiente',
        afectaInventario !== false
      ]
    );

    const compra = result.rows[0];

    // Si afecta inventario, crear movimiento de entrada automáticamente
    if (afectaInventario !== false) {
      try {
        await inventoryMovementsService.createFromCompra({
          id: compra.id,
          insumo: compra.insumo,
          cantidadInsumo: parseFloat(cantidadInsumo),
          total: parseFloat(total),
          precioUnidad: parseFloat(precioUnidad) || 0,
          proveedor: proveedor
        });
        logger.info('Inventory movement created for compra', { compraId: id });
      } catch (invError) {
        logger.error('Error creating inventory movement for compra', invError);
        // No lanzar error, solo registrar
      }
    }

    logger.info('Compra created successfully', { id });
    return compra;
  } catch (error) {
    logger.error('Error creating compra', error);
    throw error;
  }
};

/**
 * Actualizar compra
 */
const updateCompra = async (id, data) => {
  try {
    const {
      fecha,
      referencia,
      unidades,
      insumo,
      cantidadInsumo,
      precioUnidad,
      cantidadTotal,
      total,
      proveedor,
      fechaPedido,
      observacion,
      factura,
      precioRealInsumoUnd,
      afectaInventario
    } = data;

    // Obtener la compra anterior para comparar afectaInventario
    const previousResult = await query(
      `SELECT afecta_inventario FROM compras WHERE id = $1`,
      [id]
    );

    if (previousResult.rows.length === 0) {
      const error = new Error('Compra no encontrada');
      error.statusCode = 404;
      throw error;
    }

    const previousAffectsInventory = previousResult.rows[0].afecta_inventario;

    const result = await query(
      `UPDATE compras SET
        fecha = COALESCE($1, fecha),
        referencia = COALESCE($2, referencia),
        unidades = COALESCE($3, unidades),
        insumo = COALESCE($4, insumo),
        cantidad_insumo = COALESCE($5, cantidad_insumo),
        precio_unidad = COALESCE($6, precio_unidad),
        cantidad_total = COALESCE($7, cantidad_total),
        total = COALESCE($8, total),
        proveedor = COALESCE($9, proveedor),
        fecha_pedido = COALESCE($10, fecha_pedido),
        observacion = COALESCE($11, observacion),
        factura = COALESCE($12, factura),
        precio_real_insumo_und = COALESCE($13, precio_real_insumo_und),
        afecta_inventario = COALESCE($14, afecta_inventario),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
      RETURNING *`,
      [
        fecha,
        referencia,
        unidades,
        insumo,
        cantidadInsumo,
        precioUnidad,
        cantidadTotal,
        total,
        proveedor,
        fechaPedido,
        observacion,
        factura,
        precioRealInsumoUnd,
        afectaInventario,
        id
      ]
    );

    if (result.rows.length === 0) {
      const error = new Error('Compra no encontrada');
      error.statusCode = 404;
      throw error;
    }

    const updatedCompra = result.rows[0];

    // Manejar cambios en afectaInventario
    if (previousAffectsInventory && !afectaInventario) {
      // Cambió de true a false: eliminar movimiento de inventario
      try {
        await query(
          `DELETE FROM inventory_movements WHERE compra_id = $1`,
          [id]
        );
        logger.info('Inventory movement deleted for compra', { compraId: id });
      } catch (invError) {
        logger.error('Error deleting inventory movement for compra', invError);
      }
    } else if (!previousAffectsInventory && afectaInventario) {
      // Cambió de false a true: crear movimiento de inventario
      try {
        await inventoryMovementsService.createFromCompra({
          id: updatedCompra.id,
          insumo: updatedCompra.insumo,
          cantidadInsumo: parseFloat(updatedCompra.cantidad_insumo),
          total: parseFloat(updatedCompra.total),
          precioUnidad: parseFloat(updatedCompra.precio_unidad) || 0,
          proveedor: updatedCompra.proveedor
        });
        logger.info('Inventory movement created for compra', { compraId: id });
      } catch (invError) {
        logger.error('Error creating inventory movement for compra', invError);
      }
    }

    logger.info('Compra updated successfully', { id });
    return updatedCompra;
  } catch (error) {
    logger.error('Error updating compra', error);
    throw error;
  }
};

/**
 * Eliminar compra
 */
const deleteCompra = async (id) => {
  try {
    // Eliminar movimientos de inventario asociados
    try {
      await query(
        `DELETE FROM inventory_movements WHERE compra_id = $1`,
        [id]
      );
      logger.info('Inventory movements deleted for compra', { compraId: id });
    } catch (invError) {
      logger.error('Error deleting inventory movements for compra', invError);
    }

    const result = await query(
      `DELETE FROM compras WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      const error = new Error('Compra no encontrada');
      error.statusCode = 404;
      throw error;
    }

    logger.info('Compra deleted successfully', { id });
    return { success: true };
  } catch (error) {
    logger.error('Error deleting compra', error);
    throw error;
  }
};

module.exports = {
  getAllCompras,
  getCompraById,
  createCompra,
  updateCompra,
  deleteCompra
};
