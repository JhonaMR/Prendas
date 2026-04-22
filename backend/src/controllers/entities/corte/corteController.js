const db = require('../../../config/database');
const { v4: uuidv4 } = require('uuid');

// Obtener todos los registros de corte con paginación
exports.getCorteRegistros = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const registros = await db.query(
      'SELECT * FROM corte_registros ORDER BY fecha_corte DESC LIMIT $1 OFFSET $2',
      [parseInt(limit), offset]
    );

    const total = await db.query('SELECT COUNT(*) as total FROM corte_registros');

    res.json({
      success: true,
      data: registros.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.rows[0].total),
        pages: Math.ceil(parseInt(total.rows[0].total) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching corte registros:', error);
    res.status(500).json({ success: false, message: 'Error fetching registros' });
  }
};

// Obtener un registro por ID
exports.getCorteRegistroById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM corte_registros WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registro no encontrado' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching corte registro:', error);
    res.status(500).json({ success: false, message: 'Error fetching registro' });
  }
};

// Crear un nuevo registro
exports.createCorteRegistro = async (req, res) => {
  try {
    const { numeroFicha, fechaCorte, referencia, descripcion, cantidadCortada } = req.body;
    const userId = req.user?.id || 'system';

    // Validar campos requeridos
    if (!numeroFicha || !fechaCorte || !referencia || !cantidadCortada) {
      return res.status(400).json({ success: false, message: 'Campos requeridos faltantes' });
    }

    const id = uuidv4();
    const result = await db.query(
      'INSERT INTO corte_registros (id, numero_ficha, fecha_corte, referencia, descripcion, cantidad_cortada, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, numeroFicha, fechaCorte, referencia, descripcion || '', cantidadCortada, userId]
    );

    res.status(201).json({
      success: true,
      message: 'Registro creado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating corte registro:', error);
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'El número de ficha ya existe' });
    }
    res.status(500).json({ success: false, message: 'Error creating registro' });
  }
};

// Actualizar un registro
exports.updateCorteRegistro = async (req, res) => {
  try {
    const { id } = req.params;
    const { numeroFicha, fechaCorte, referencia, descripcion, cantidadCortada } = req.body;
    const userId = req.user?.id || 'system';

    // Validar que el registro existe
    const existing = await db.query('SELECT id FROM corte_registros WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registro no encontrado' });
    }

    const result = await db.query(
      'UPDATE corte_registros SET numero_ficha = $1, fecha_corte = $2, referencia = $3, descripcion = $4, cantidad_cortada = $5, updated_by = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [numeroFicha, fechaCorte, referencia, descripcion || '', cantidadCortada, userId, id]
    );

    res.json({
      success: true,
      message: 'Registro actualizado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating corte registro:', error);
    res.status(500).json({ success: false, message: 'Error updating registro' });
  }
};

// Eliminar un registro
exports.deleteCorteRegistro = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM corte_registros WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Registro no encontrado' });
    }

    res.json({ success: true, message: 'Registro eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting corte registro:', error);
    res.status(500).json({ success: false, message: 'Error deleting registro' });
  }
};

// Importar registros desde Excel (solo para SOPORTE)
exports.importCorteRegistros = async (req, res) => {
  try {
    const { registros } = req.body;
    const userId = req.user?.id || 'system';

    if (!Array.isArray(registros) || registros.length === 0) {
      return res.status(400).json({ success: false, message: 'No hay registros para importar' });
    }

    const results = { success: 0, failed: 0, errors: [] };

    for (let i = 0; i < registros.length; i++) {
      try {
        const { numeroFicha, fechaCorte, referencia, descripcion, cantidadCortada } = registros[i];

        if (!numeroFicha || !fechaCorte || !referencia || !cantidadCortada) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            message: 'Campos requeridos faltantes'
          });
          continue;
        }

        const id = uuidv4();
        await db.query(
          'INSERT INTO corte_registros (id, numero_ficha, fecha_corte, referencia, descripcion, cantidad_cortada, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [id, numeroFicha, fechaCorte, referencia, descripcion || '', cantidadCortada, userId]
        );

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          message: error.code === '23505' ? 'Número de ficha duplicado' : error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Importación completada: ${results.success} exitosos, ${results.failed} fallidos`,
      data: results
    });
  } catch (error) {
    console.error('Error importing corte registros:', error);
    res.status(500).json({ success: false, message: 'Error importing registros' });
  }
};

// Guardar múltiples registros (batch)
exports.saveCorteRegistrosBatch = async (req, res) => {
  try {
    const { registros } = req.body;
    const userId = req.user?.id || 'system';

    if (!Array.isArray(registros) || registros.length === 0) {
      return res.status(400).json({ success: false, message: 'No hay registros para guardar' });
    }

    const results = { saved: 0, failed: 0, errors: [] };

    for (let i = 0; i < registros.length; i++) {
      try {
        const { id, numeroFicha, fechaCorte, referencia, descripcion, cantidadCortada } = registros[i];

        if (!numeroFicha || !fechaCorte || !referencia || !cantidadCortada) {
          results.failed++;
          results.errors.push({
            index: i,
            message: 'Campos requeridos faltantes'
          });
          continue;
        }

        if (id && id.startsWith('temp_')) {
          // Nuevo registro
          const newId = uuidv4();
          await db.query(
            'INSERT INTO corte_registros (id, numero_ficha, fecha_corte, referencia, descripcion, cantidad_cortada, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [newId, numeroFicha, fechaCorte, referencia, descripcion || '', cantidadCortada, userId]
          );
        } else {
          // Actualizar registro existente
          await db.query(
            'UPDATE corte_registros SET numero_ficha = $1, fecha_corte = $2, referencia = $3, descripcion = $4, cantidad_cortada = $5, updated_by = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7',
            [numeroFicha, fechaCorte, referencia, descripcion || '', cantidadCortada, userId, id]
          );
        }

        results.saved++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          index: i,
          message: error.code === '23505' ? 'Número de ficha duplicado' : error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Guardado completado: ${results.saved} exitosos, ${results.failed} fallidos`,
      data: results
    });
  } catch (error) {
    console.error('Error saving corte registros batch:', error);
    res.status(500).json({ success: false, message: 'Error saving registros' });
  }
};
