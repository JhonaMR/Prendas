/**
 * Servicio de lógica de negocio para References - POSTGRESQL
 * Maneja operaciones CRUD y lógica específica de dominio
 */

const { query, transaction } = require('../../../config/database');
const { NotFoundError, DatabaseError } = require('../../shared/errorHandler');
const logger = require('../../shared/logger');
const { invalidateOnCreate, invalidateOnUpdate, invalidateOnDelete } = require('../../../services/CacheInvalidationService');

/**
 * Obtiene todas las referencias con sus correrías asociadas
 * @async
 */
async function getAllReferences() {
  try {
    const result = await query(`
      SELECT id, description, price, designer, cloth1, avg_cloth1, cloth2, avg_cloth2, active
      FROM product_references
      ORDER BY id
    `);

    const references = result.rows;

    // Para cada referencia, obtener sus correrías
    const referencesWithCorrerias = await Promise.all(references.map(async (ref) => {
      const correriasResult = await query(`
        SELECT correria_id
        FROM correria_catalog
        WHERE reference_id = $1
      `, [ref.id]);

      return {
        id: ref.id,
        description: ref.description,
        price: ref.price,
        designer: ref.designer,
        cloth1: ref.cloth1,
        avgCloth1: ref.avg_cloth1,
        cloth2: ref.cloth2,
        avgCloth2: ref.avg_cloth2,
        active: ref.active,
        correrias: correriasResult.rows.map(c => c.correria_id)
      };
    }));

    logger.info('Retrieved all references', { count: referencesWithCorrerias.length });
    return referencesWithCorrerias;
  } catch (error) {
    logger.error('Error retrieving references', error);
    throw new DatabaseError('Failed to retrieve references', error);
  }
}

/**
 * Obtiene una referencia específica por ID
 * @async
 */
async function getReferenceById(id) {
  try {
    const result = await query(`
      SELECT id, description, price, designer, cloth1, avg_cloth1, cloth2, avg_cloth2, active
      FROM product_references
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Reference', id);
    }

    const reference = result.rows[0];

    // Obtener correrías asociadas
    const correriasResult = await query(`
      SELECT correria_id
      FROM correria_catalog
      WHERE reference_id = $1
    `, [id]);

    logger.info('Retrieved reference', { id });
    return {
      id: reference.id,
      description: reference.description,
      price: reference.price,
      designer: reference.designer,
      cloth1: reference.cloth1,
      avgCloth1: reference.avg_cloth1,
      cloth2: reference.cloth2,
      avgCloth2: reference.avg_cloth2,
      active: reference.active,
      correrias: correriasResult.rows.map(c => c.correria_id)
    };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error retrieving reference', error, { id });
    throw new DatabaseError('Failed to retrieve reference', error);
  }
}

/**
 * Crea una nueva referencia con sus correrías
 * @async
 */
async function createReference(data) {
  try {
    await transaction(async (client) => {
      // Insertar referencia
      await client.query(`
        INSERT INTO product_references (id, description, price, designer, cloth1, avg_cloth1, cloth2, avg_cloth2, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        data.id,
        data.description,
        data.price,
        data.designer,
        data.cloth1 || null,
        data.avgCloth1 || null,
        data.cloth2 || null,
        data.avgCloth2 || null,
        1
      ]);

      // Insertar correrías
      for (const correria of data.correrias) {
        await client.query(`
          INSERT INTO correria_catalog (reference_id, correria_id)
          VALUES ($1, $2)
        `, [data.id, correria]);
      }
    });

    // Invalidate cache after creation
    invalidateOnCreate('Reference');

    logger.info('Created reference', { id: data.id });
    return getReferenceById(data.id);
  } catch (error) {
    logger.error('Error creating reference', error, { data });
    throw new DatabaseError('Failed to create reference', error);
  }
}

/**
 * Actualiza una referencia existente
 * @async
 */
async function updateReference(id, data) {
  try {
    // Verificar que la referencia existe
    const existingResult = await query('SELECT id FROM product_references WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      throw new NotFoundError('Reference', id);
    }

    // Si hay correrías, actualizar en transacción
    if (data.correrias !== undefined) {
      await transaction(async (client) => {
        // Actualizar campos de referencia
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (data.description !== undefined) {
          updates.push(`description = $${paramIndex++}`);
          values.push(data.description);
        }
        if (data.price !== undefined) {
          updates.push(`price = $${paramIndex++}`);
          values.push(data.price);
        }
        if (data.designer !== undefined) {
          updates.push(`designer = $${paramIndex++}`);
          values.push(data.designer);
        }
        if (data.cloth1 !== undefined) {
          updates.push(`cloth1 = $${paramIndex++}`);
          values.push(data.cloth1);
        }
        if (data.avgCloth1 !== undefined) {
          updates.push(`avg_cloth1 = $${paramIndex++}`);
          values.push(data.avgCloth1);
        }
        if (data.cloth2 !== undefined) {
          updates.push(`cloth2 = $${paramIndex++}`);
          values.push(data.cloth2);
        }
        if (data.avgCloth2 !== undefined) {
          updates.push(`avg_cloth2 = $${paramIndex++}`);
          values.push(data.avgCloth2);
        }

        if (updates.length > 0) {
          values.push(id);
          const query_str = `UPDATE product_references SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
          await client.query(query_str, values);
        }

        // Eliminar correrías antiguas
        await client.query('DELETE FROM correria_catalog WHERE reference_id = $1', [id]);

        // Insertar nuevas correrías
        for (const correria of data.correrias) {
          await client.query('INSERT INTO correria_catalog (reference_id, correria_id) VALUES ($1, $2)', [id, correria]);
        }
      });
    } else {
      // Solo actualizar campos de referencia
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (data.description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(data.description);
      }
      if (data.price !== undefined) {
        updates.push(`price = $${paramIndex++}`);
        values.push(data.price);
      }
      if (data.designer !== undefined) {
        updates.push(`designer = $${paramIndex++}`);
        values.push(data.designer);
      }
      if (data.cloth1 !== undefined) {
        updates.push(`cloth1 = $${paramIndex++}`);
        values.push(data.cloth1);
      }
      if (data.avgCloth1 !== undefined) {
        updates.push(`avg_cloth1 = $${paramIndex++}`);
        values.push(data.avgCloth1);
      }
      if (data.cloth2 !== undefined) {
        updates.push(`cloth2 = $${paramIndex++}`);
        values.push(data.cloth2);
      }
      if (data.avgCloth2 !== undefined) {
        updates.push(`avg_cloth2 = $${paramIndex++}`);
        values.push(data.avgCloth2);
      }

      if (updates.length > 0) {
        values.push(id);
        const query_str = `UPDATE product_references SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
        await query(query_str, values);
      }
    }

    // Invalidate cache after update
    invalidateOnUpdate('Reference');

    logger.info('Updated reference', { id });
    return getReferenceById(id);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error updating reference', error, { id, data });
    throw new DatabaseError('Failed to update reference', error);
  }
}

/**
 * Elimina una referencia y sus correrías asociadas
 * @async
 */
async function deleteReference(id) {
  try {
    // Verificar que la referencia existe
    const existingResult = await query('SELECT id FROM product_references WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      throw new NotFoundError('Reference', id);
    }

    // Eliminar en transacción
    await transaction(async (client) => {
      // Eliminar correrías asociadas
      await client.query('DELETE FROM correria_catalog WHERE reference_id = $1', [id]);
      // Eliminar referencia
      await client.query('DELETE FROM product_references WHERE id = $1', [id]);
    });

    // Invalidate cache after deletion
    invalidateOnDelete('Reference');

    logger.info('Deleted reference', { id });
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error deleting reference', error, { id });
    throw new DatabaseError('Failed to delete reference', error);
  }
}

/**
 * Obtiene todas las referencias de una correría específica
 * @async
 */
async function getReferencesByCorreria(correria_id) {
  try {
    const result = await query(`
      SELECT pr.id, pr.description, pr.price, pr.designer, pr.cloth1, pr.avg_cloth1, pr.cloth2, pr.avg_cloth2, pr.active
      FROM product_references pr
      INNER JOIN correria_catalog cc ON pr.id = cc.reference_id
      WHERE cc.correria_id = $1
      ORDER BY pr.id
    `, [correria_id]);

    logger.info('Retrieved references by correria', { correria_id, count: result.rows.length });
    return result.rows;
  } catch (error) {
    logger.error('Error retrieving references by correria', error, { correria_id });
    throw new DatabaseError('Failed to retrieve references by correria', error);
  }
}

module.exports = {
  getAllReferences,
  getReferenceById,
  createReference,
  updateReference,
  deleteReference,
  getReferencesByCorreria
};
