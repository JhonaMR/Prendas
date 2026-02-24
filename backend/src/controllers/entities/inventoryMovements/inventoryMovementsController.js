const inventoryMovementsService = require('./inventoryMovementsService');
const inventoryMovementsValidator = require('./inventoryMovementsValidator');

class InventoryMovementsController {
  async getAll(req, res) {
    try {
      const movements = await inventoryMovementsService.getAll();
      res.json({
        success: true,
        data: movements
      });
    } catch (error) {
      console.error('Error fetching inventory movements:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener movimientos de inventario',
        error: error.message
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const movement = await inventoryMovementsService.getById(id);

      if (!movement) {
        return res.status(404).json({
          success: false,
          message: 'Movimiento de inventario no encontrado'
        });
      }

      res.json({
        success: true,
        data: movement
      });
    } catch (error) {
      console.error('Error fetching inventory movement:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener movimiento de inventario',
        error: error.message
      });
    }
  }

  async create(req, res) {
    try {
      const errors = inventoryMovementsValidator.validateCreate(req.body);

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors
        });
      }

      const movement = await inventoryMovementsService.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Movimiento de inventario creado exitosamente',
        data: movement
      });
    } catch (error) {
      console.error('Error creating inventory movement:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear movimiento de inventario',
        error: error.message
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const errors = inventoryMovementsValidator.validateUpdate(req.body);

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors
        });
      }

      const movement = await inventoryMovementsService.update(id, req.body);

      if (!movement) {
        return res.status(404).json({
          success: false,
          message: 'Movimiento de inventario no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Movimiento de inventario actualizado exitosamente',
        data: movement
      });
    } catch (error) {
      console.error('Error updating inventory movement:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar movimiento de inventario',
        error: error.message
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const movement = await inventoryMovementsService.delete(id);

      if (!movement) {
        return res.status(404).json({
          success: false,
          message: 'Movimiento de inventario no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Movimiento de inventario eliminado exitosamente',
        data: movement
      });
    } catch (error) {
      console.error('Error deleting inventory movement:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar movimiento de inventario',
        error: error.message
      });
    }
  }
}

module.exports = new InventoryMovementsController();
