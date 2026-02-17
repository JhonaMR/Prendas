/**
 * Servicio de lógica de negocio para References
 * Maneja operaciones CRUD y lógica específica de dominio
 */

const { getDatabase } = require('../../../config/database');
const { NotFoundError, DatabaseError } = require('../../shared/errorHandler');
const logger = require('../../shared/logger');
const { invalidateOnCreate, invalidateOnUpdate, invalidateOnDelete } = require('../../../services/CacheInvalidationService');

/**
 * Obtiene todas las referencias con sus correrías asociadas
 */
function getAllReferences() {
  try {
    const db = getDatabase();

    const references = db.prepare(`
      SELECT id, description, price, designer, cloth1, avg_cloth1, cloth2, avg_cloth2, active
      FROM product_references
      ORDER BY id
    `).all();

    // Para cada referencia, obtener sus correrías
    const referencesWithCorrerias = references.map(ref => {
      const correrias = db.prepare(`
        SELECT correria_id
        FROM correria_catalog
        WHERE reference_id = ?
      `).all(ref.id);

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
        correrias: correrias.map(c => c.correria_id)
      };
    });

    logger.info('Retrieved all references', { count: referencesWithCorrerias.length });
    return referencesWithCorrerias;
  } catch (error) {
    logger.error('Error retrieving references', error);
    throw new DatabaseError('Failed to retrieve references', error);
  }
}

/**
 * Obtiene una referencia específica por ID
 */
function getReferenceById(id) {
  try {
    const db = getDatabase();

    const reference = db.prepare(`
      SELECT id, description, price, designer, cloth1, avg_cloth1, cloth2, avg_cloth2, active
      FROM product_references
      WHERE id = ?
    `).get(id);

    if (!reference) {
      throw new NotFoundError('Reference', id);
    }

    // Obtener correrías asociadas
    const correrias = db.prepare(`
      SELECT correria_id
      FROM correria_catalog
      WHERE reference_id = ?
    `).all(id);

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
      correrias: correrias.map(c => c.correria_id)
    };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error retrieving reference', error, { id });
    throw new DatabaseError('Failed to retrieve reference', error);
  }
}

/**
 * Crea una nueva referencia con sus correrías
 */
function createReference(data) {
  try {
    const db = getDatabase();

    // Iniciar transacción
    const insertRef = db.prepare(`
      INSERT INTO product_references (id, description, price, designer, cloth1, avg_cloth1, cloth2, avg_cloth2, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const insertCorreria = db.prepare(`
      INSERT INTO correria_catalog (reference_id, correria_id)
      VALUES (?, ?)
    `);

    const transaction = db.transaction(() => {
      // Insertar referencia
      insertRef.run(
        data.id,
        data.description,
        data.price,
        data.designer,
        data.cloth1 || null,
        data.avgCloth1 || null,
        data.cloth2 || null,
        data.avgCloth2 || null
      );

      // Insertar correrías
      for (const correria of data.correrias) {
        insertCorreria.run(data.id, correria);
      }
    });

    transaction();

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
 */
function updateReference(id, data) {
  try {
    const db = getDatabase();

    // Verificar que la referencia existe
    const existing = db.prepare('SELECT id FROM product_references WHERE id = ?').get(id);
    if (!existing) {
      throw new NotFoundError('Reference', id);
    }

    // Construir query dinámicamente según qué campos se actualizan
    const updates = [];
    const values = [];

    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.price !== undefined) {
      updates.push('price = ?');
      values.push(data.price);
    }
    if (data.designer !== undefined) {
      updates.push('designer = ?');
      values.push(data.designer);
    }
    if (data.cloth1 !== undefined) {
      updates.push('cloth1 = ?');
      values.push(data.cloth1);
    }
    if (data.avgCloth1 !== undefined) {
      updates.push('avg_cloth1 = ?');
      values.push(data.avgCloth1);
    }
    if (data.cloth2 !== undefined) {
      updates.push('cloth2 = ?');
      values.push(data.cloth2);
    }
    if (data.avgCloth2 !== undefined) {
      updates.push('avg_cloth2 = ?');
      values.push(data.avgCloth2);
    }

    // Si hay correrías, actualizar en transacción
    if (data.correrias !== undefined) {
      const transaction = db.transaction(() => {
        // Actualizar campos de referencia si hay
        if (updates.length > 0) {
          values.push(id);
          const query = `UPDATE product_references SET ${updates.join(', ')} WHERE id = ?`;
          db.prepare(query).run(...values);
        }

        // Eliminar correrías antiguas
        db.prepare('DELETE FROM correria_catalog WHERE reference_id = ?').run(id);

        // Insertar nuevas correrías
        const insertCorreria = db.prepare('INSERT INTO correria_catalog (reference_id, correria_id) VALUES (?, ?)');
        for (const correria of data.correrias) {
          insertCorreria.run(id, correria);
        }
      });

      transaction();
    } else if (updates.length > 0) {
      // Solo actualizar campos de referencia
      values.push(id);
      const query = `UPDATE product_references SET ${updates.join(', ')} WHERE id = ?`;
      db.prepare(query).run(...values);
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
 */
function deleteReference(id) {
  try {
    const db = getDatabase();

    // Verificar que la referencia existe
    const existing = db.prepare('SELECT id FROM product_references WHERE id = ?').get(id);
    if (!existing) {
      throw new NotFoundError('Reference', id);
    }

    // Eliminar en transacción
    const transaction = db.transaction(() => {
      // Eliminar correrías asociadas
      db.prepare('DELETE FROM correria_catalog WHERE reference_id = ?').run(id);
      // Eliminar referencia
      db.prepare('DELETE FROM product_references WHERE id = ?').run(id);
    });

    transaction();

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
 */
function getReferencesByCorreria(correria_id) {
  try {
    const db = getDatabase();

    const references = db.prepare(`
      SELECT pr.id, pr.description, pr.price, pr.designer, pr.cloth1, pr.avg_cloth1, pr.cloth2, pr.avg_cloth2, pr.active
      FROM product_references pr
      INNER JOIN correria_catalog cc ON pr.id = cc.reference_id
      WHERE cc.correria_id = ?
      ORDER BY pr.id
    `).all(correria_id);

    logger.info('Retrieved references by correria', { correria_id, count: references.length });
    return references;
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
