// ============================================
// CONTROLADOR: Importación Masiva de Datos
// Gestión de carga masiva para migración
// ============================================

const { query } = require('../config/database');
const fs = require('fs');
const path = require('path');

// ============ SERVICIOS DE IMPORTACIÓN ============

const bulkImportService = {
  // Importar referencias de productos
  async importReferences(data) {
    const results = { success: 0, failed: 0, errors: [] };
    
    for (const ref of data) {
      try {
        const { codigo, descripcion, marca, novedad, observaciones } = ref;
        
        if (!codigo || !descripcion) {
          results.failed++;
          results.errors.push({ codigo, error: 'Código y descripción requeridos' });
          continue;
        }

        // Verificar si ya existe
        const existing = await query(
          'SELECT id FROM product_references WHERE codigo = $1',
          [codigo]
        );

        if (existing.rows.length > 0) {
          results.failed++;
          results.errors.push({ codigo, error: 'Referencia ya existe' });
          continue;
        }

        await query(
          `INSERT INTO product_references 
           (codigo, descripcion, marca, novedad, observaciones, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [codigo, descripcion, marca || null, novedad || false, observaciones || null]
        );

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({ codigo: ref.codigo, error: error.message });
      }
    }

    return results;
  },

  // Importar fichas de costo
  async importCostSheets(data) {
    const results = { success: 0, failed: 0, errors: [] };
    
    for (const ficha of data) {
      try {
        const {
          referencia,
          descripcion,
          marca,
          totalMateriaPrima,
          totalManoObra,
          totalInsumosDirectos,
          totalInsumosIndirectos,
          totalProvisiones,
          rentabilidad = 49
        } = ficha;

        if (!referencia || !descripcion) {
          results.failed++;
          results.errors.push({ referencia, error: 'Referencia y descripción requeridos' });
          continue;
        }

        // Verificar que la referencia existe
        const refExists = await query(
          'SELECT id FROM product_references WHERE codigo = $1',
          [referencia]
        );

        if (refExists.rows.length === 0) {
          results.failed++;
          results.errors.push({ referencia, error: 'Referencia no existe' });
          continue;
        }

        // Calcular totales
        const costoTotal = (totalMateriaPrima || 0) + (totalManoObra || 0) + 
                          (totalInsumosDirectos || 0) + (totalInsumosIndirectos || 0) + 
                          (totalProvisiones || 0);

        const precioVenta = this.calcularPrecioVenta(costoTotal, rentabilidad);

        await query(
          `INSERT INTO fichas_costo 
           (referencia, descripcion, marca, total_materia_prima, total_mano_obra,
            total_insumos_directos, total_insumos_indirectos, total_provisiones,
            costo_total, precio_venta, rentabilidad, margen_ganancia, 
            costo_contabilizar, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())`,
          [
            referencia, descripcion, marca || null,
            totalMateriaPrima || 0, totalManoObra || 0,
            totalInsumosDirectos || 0, totalInsumosIndirectos || 0,
            totalProvisiones || 0, costoTotal, precioVenta, rentabilidad,
            this.calcularMargenGanancia(precioVenta),
            costoTotal - (totalProvisiones || 0)
          ]
        );

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({ referencia: ficha.referencia, error: error.message });
      }
    }

    return results;
  },

  // Importar pedidos de clientes
  async importOrders(data) {
    const results = { success: 0, failed: 0, errors: [] };
    
    for (const order of data) {
      try {
        const {
          numeroOrden,
          clienteId,
          fechaPedido,
          fechaEntrega,
          estado = 'pendiente',
          items = []
        } = order;

        if (!numeroOrden || !clienteId) {
          results.failed++;
          results.errors.push({ numeroOrden, error: 'Número de orden y cliente requeridos' });
          continue;
        }

        // Verificar cliente
        const clienteExists = await query(
          'SELECT id FROM clients WHERE id = $1',
          [clienteId]
        );

        if (clienteExists.rows.length === 0) {
          results.failed++;
          results.errors.push({ numeroOrden, error: 'Cliente no existe' });
          continue;
        }

        // Crear orden
        const orderResult = await query(
          `INSERT INTO orders 
           (numero_orden, cliente_id, fecha_pedido, fecha_entrega, estado, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           RETURNING id`,
          [numeroOrden, clienteId, fechaPedido, fechaEntrega, estado]
        );

        const orderId = orderResult.rows[0].id;

        // Insertar items
        for (const item of items) {
          const { referencia, cantidad, precioUnitario } = item;
          
          if (!referencia || !cantidad) continue;

          await query(
            `INSERT INTO order_items 
             (order_id, referencia, cantidad, precio_unitario, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [orderId, referencia, cantidad, precioUnitario || 0]
          );
        }

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({ numeroOrden: order.numeroOrden, error: error.message });
      }
    }

    return results;
  },

  // Importar despachos
  async importDispatches(data) {
    const results = { success: 0, failed: 0, errors: [] };
    
    for (const dispatch of data) {
      try {
        const {
          numeroDespacho,
          numeroOrden,
          fechaDespacho,
          items = []
        } = dispatch;

        if (!numeroDespacho || !numeroOrden) {
          results.failed++;
          results.errors.push({ numeroDespacho, error: 'Número de despacho y orden requeridos' });
          continue;
        }

        // Verificar orden
        const orderExists = await query(
          'SELECT id FROM orders WHERE numero_orden = $1',
          [numeroOrden]
        );

        if (orderExists.rows.length === 0) {
          results.failed++;
          results.errors.push({ numeroDespacho, error: 'Orden no existe' });
          continue;
        }

        const orderId = orderExists.rows[0].id;

        // Crear despacho
        const dispatchResult = await query(
          `INSERT INTO dispatches 
           (numero_despacho, order_id, fecha_despacho, created_at)
           VALUES ($1, $2, $3, NOW())
           RETURNING id`,
          [numeroDespacho, orderId, fechaDespacho]
        );

        const dispatchId = dispatchResult.rows[0].id;

        // Insertar items
        for (const item of items) {
          const { referencia, cantidad } = item;
          
          if (!referencia || !cantidad) continue;

          await query(
            `INSERT INTO dispatch_items 
             (dispatch_id, referencia, cantidad, created_at)
             VALUES ($1, $2, $3, NOW())`,
            [dispatchId, referencia, cantidad]
          );
        }

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({ numeroDespacho: dispatch.numeroDespacho, error: error.message });
      }
    }

    return results;
  },

  // Importar recepciones de mercancía
  async importReceptions(data) {
    const results = { success: 0, failed: 0, errors: [] };
    
    for (const reception of data) {
      try {
        const {
          numeroRecepcion,
          numeroOrdenCompra,
          fechaRecepcion,
          items = []
        } = reception;

        if (!numeroRecepcion || !numeroOrdenCompra) {
          results.failed++;
          results.errors.push({ numeroRecepcion, error: 'Número de recepción y orden requeridos' });
          continue;
        }

        // Crear recepción
        const receptionResult = await query(
          `INSERT INTO receptions 
           (numero_recepcion, numero_orden_compra, fecha_recepcion, created_at)
           VALUES ($1, $2, $3, NOW())
           RETURNING id`,
          [numeroRecepcion, numeroOrdenCompra, fechaRecepcion]
        );

        const receptionId = receptionResult.rows[0].id;

        // Insertar items
        for (const item of items) {
          const { referencia, cantidad, lote } = item;
          
          if (!referencia || !cantidad) continue;

          await query(
            `INSERT INTO reception_items 
             (reception_id, referencia, cantidad, lote, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [receptionId, referencia, cantidad, lote || null]
          );
        }

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({ numeroRecepcion: reception.numeroRecepcion, error: error.message });
      }
    }

    return results;
  },

  // Funciones auxiliares
  calcularPrecioVenta(costoTotal, rentabilidad) {
    if (costoTotal <= 0) return 0;
    const miles = Math.ceil((costoTotal * (1 + rentabilidad / 100)) / 1000);
    return miles * 1000 - 100;
  },

  calcularMargenGanancia(precioVenta) {
    return Math.round(precioVenta + (precioVenta * 0.35));
  }
};

// ============ ENDPOINTS ============

/**
 * POST /api/bulk-import/references
 * Importar referencias de productos
 */
const importReferences = async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requiere un array de referencias' 
      });
    }

    const results = await bulkImportService.importReferences(data);

    return res.json({
      success: true,
      message: `Importación completada: ${results.success} exitosas, ${results.failed} fallidas`,
      results
    });
  } catch (error) {
    console.error('❌ Error importando referencias:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al importar referencias' 
    });
  }
};

/**
 * POST /api/bulk-import/cost-sheets
 * Importar fichas de costo
 */
const importCostSheets = async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requiere un array de fichas de costo' 
      });
    }

    const results = await bulkImportService.importCostSheets(data);

    return res.json({
      success: true,
      message: `Importación completada: ${results.success} exitosas, ${results.failed} fallidas`,
      results
    });
  } catch (error) {
    console.error('❌ Error importando fichas:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al importar fichas de costo' 
    });
  }
};

/**
 * POST /api/bulk-import/orders
 * Importar pedidos de clientes
 */
const importOrders = async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requiere un array de pedidos' 
      });
    }

    const results = await bulkImportService.importOrders(data);

    return res.json({
      success: true,
      message: `Importación completada: ${results.success} exitosas, ${results.failed} fallidas`,
      results
    });
  } catch (error) {
    console.error('❌ Error importando pedidos:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al importar pedidos' 
    });
  }
};

/**
 * POST /api/bulk-import/dispatches
 * Importar despachos
 */
const importDispatches = async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requiere un array de despachos' 
      });
    }

    const results = await bulkImportService.importDispatches(data);

    return res.json({
      success: true,
      message: `Importación completada: ${results.success} exitosas, ${results.failed} fallidas`,
      results
    });
  } catch (error) {
    console.error('❌ Error importando despachos:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al importar despachos' 
    });
  }
};

/**
 * POST /api/bulk-import/receptions
 * Importar recepciones de mercancía
 */
const importReceptions = async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requiere un array de recepciones' 
      });
    }

    const results = await bulkImportService.importReceptions(data);

    return res.json({
      success: true,
      message: `Importación completada: ${results.success} exitosas, ${results.failed} fallidas`,
      results
    });
  } catch (error) {
    console.error('❌ Error importando recepciones:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al importar recepciones' 
    });
  }
};

module.exports = {
  importReferences,
  importCostSheets,
  importOrders,
  importDispatches,
  importReceptions,
  bulkImportService
};
