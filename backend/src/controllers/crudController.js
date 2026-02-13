/**
 * 📦 CONTROLADOR CRUD (Create, Read, Update, Delete)
 * 
 * Este archivo maneja todas las operaciones CRUD para:
 * - Referencias (productos/prendas)
 * - Clientes
 * - Confeccionistas
 * - Vendedores
 * - Correrias
 * - Recepciones
 * - Despachos
 * - Pedidos
 * - Tracking de Producción
 */

const { getDatabase, generateId } = require('../config/database');

// ==================== REFERENCIAS ====================

/**
 * OBTENER TODAS LAS REFERENCIAS
 * GET /api/references
 */
const getReferences = (req, res) => {
    try {
        const db = getDatabase();

        const references = db.prepare(`
            SELECT id, description, price, designer, cloth1, avg_cloth1, cloth2, avg_cloth2
            FROM product_references
            ORDER BY id
        `).all();

        db.close();

        // Convertir a camelCase para el frontend
        const formattedRefs = references.map(ref => ({
            id: ref.id,
            description: ref.description,
            price: ref.price,
            designer: ref.designer,
            cloth1: ref.cloth1,
            avgCloth1: ref.avg_cloth1,
            cloth2: ref.cloth2,
            avgCloth2: ref.avg_cloth2
        }));

        return res.json({
            success: true,
            data: formattedRefs
        });

    } catch (error) {
        console.error('❌ Error al obtener referencias:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener referencias',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * CREAR REFERENCIA
 * POST /api/references
 */
const createReference = (req, res) => {
    try {
        const { id, description, price, designer, cloth1, avgCloth1, cloth2, avgCloth2 } = req.body;

        // Validaciones
        if (!id || !description || !price || !designer) {
            return res.status(400).json({
                success: false,
                message: 'ID, descripción, precio y diseñador son requeridos'
            });
        }

        if (price <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El precio debe ser mayor a 0'
            });
        }

        const db = getDatabase();

        // Verificar si ya existe
        const existing = db.prepare('SELECT id FROM product_references WHERE id = ?').get(id);
        if (existing) {
            db.close();
            return res.status(409).json({
                success: false,
                message: `La referencia ${id} ya existe`
            });
        }

        // Insertar
        db.prepare(`
            INSERT INTO product_references (id, description, price, designer, cloth1, avg_cloth1, cloth2, avg_cloth2, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        `).run(id, description, price, designer, cloth1 || null, avgCloth1 || null, cloth2 || null, avgCloth2 || null);

        db.close();

        return res.status(201).json({
            success: true,
            message: 'Referencia creada exitosamente',
            data: { id, description, price, designer, cloth1, avgCloth1, cloth2, avgCloth2 }
        });

    } catch (error) {
        console.error('❌ Error al crear referencia:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al crear referencia',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ACTUALIZAR REFERENCIA
 * PUT /api/references/:id
 */
const updateReference = (req, res) => {
    try {
        const { id } = req.params;
        const { description, price, designer, cloth1, avgCloth1, cloth2, avgCloth2 } = req.body;

        if (!description || !price || !designer) {
            return res.status(400).json({
                success: false,
                message: 'Descripción, precio y diseñador son requeridos'
            });
        }

        if (price <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El precio debe ser mayor a 0'
            });
        }

        const db = getDatabase();

        const result = db.prepare(`
            UPDATE product_references
            SET description = ?, price = ?, designer = ?, cloth1 = ?, avg_cloth1 = ?, cloth2 = ?, avg_cloth2 = ?
            WHERE id = ?
        `).run(description, price, designer, cloth1 || null, avgCloth1 || null, cloth2 || null, avgCloth2 || null, id);

        db.close();

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: `Referencia ${id} no encontrada`
            });
        }

        return res.json({
            success: true,
            message: 'Referencia actualizada exitosamente',
            data: { id, description, price, designer, cloth1, avgCloth1, cloth2, avgCloth2 }
        });

    } catch (error) {
        console.error('❌ Error al actualizar referencia:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar referencia',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ELIMINAR REFERENCIA (Soft delete)
 * DELETE /api/references/:id
 */
const deleteReference = (req, res) => {
    try {
        const { id } = req.params;
        console.log('🗑️ DELETE /api/references/:id - Intentando eliminar referencia con ID:', id);

        const db = getDatabase();

        // Verificar que la referencia existe
        const reference = db.prepare('SELECT * FROM product_references WHERE id = ?').get(id);
        console.log('📊 Referencia encontrada:', reference ? `${reference.description}` : 'NO ENCONTRADA');

        if (!reference) {
            db.close();
            console.log('❌ Referencia no encontrada');
            return res.status(404).json({
                success: false,
                message: `Referencia ${id} no encontrada`
            });
        }

        // Hard delete: eliminar completamente
        console.log('🔥 Ejecutando DELETE FROM product_references WHERE id =', id);
        const result = db.prepare('DELETE FROM product_references WHERE id = ?').run(id);
        console.log('📝 Resultado de DELETE:', result);

        db.close();

        if (result.changes === 0) {
            console.log('❌ No se eliminó nada');
            return res.status(404).json({
                success: false,
                message: `Referencia ${id} no encontrada`
            });
        }

        console.log('✅ Referencia eliminada exitosamente - cambios:', result.changes);
        return res.json({
            success: true,
            message: 'Referencia eliminada exitosamente'
        });

    } catch (error) {
        console.error('❌ Error al eliminar referencia:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar referencia',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ==================== CLIENTES ====================

const getClients = (req, res) => {
    try {
        const db = getDatabase();
        const clients = db.prepare('SELECT * FROM clients').all();
        db.close();
        return res.json({ success: true, data: clients });
    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener clientes' });
    }
};

const createClient = (req, res) => {
    try {
        const { id, name, nit, address, city, seller } = req.body;
        
        if (!id || !name || !nit || !address || !city || !seller) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        const db = getDatabase();

        db.prepare(`
            INSERT INTO clients (id, name, nit, address, city, seller, active)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        `).run(id, name, nit, address, city, seller);

        db.close();

        return res.status(201).json({
            success: true,
            message: 'Cliente creado exitosamente',
            data: { id, name, nit, address, city, seller }
        });

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ success: false, message: 'Error al crear cliente' });
    }
};

const updateClient = (req, res) => {
    try {
        const { id } = req.params;
        const { name, nit, address, city, seller } = req.body;

        const db = getDatabase();

        const result = db.prepare(`
            UPDATE clients
            SET name = ?, nit = ?, address = ?, city = ?, seller = ?
            WHERE id = ?
        `).run(name, nit, address, city, seller, id);

        db.close();

        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
        }

        return res.json({
            success: true,
            message: 'Cliente actualizado exitosamente',
            data: { id, name, nit, address, city, seller }
        });

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ success: false, message: 'Error al actualizar cliente' });
    }
};

const deleteClient = (req, res) => {
    try {
        const { id } = req.params;
        console.log('🗑️ DELETE /api/clients/:id - Intentando eliminar cliente con ID:', id);

        const db = getDatabase();

        // Verificar que el cliente existe
        const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
        console.log('📊 Cliente encontrado:', client ? `${client.name}` : 'NO ENCONTRADO');

        if (!client) {
            db.close();
            console.log('❌ Cliente no encontrado');
            return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
        }

        // Hard delete: eliminar completamente
        console.log('🔥 Ejecutando DELETE FROM clients WHERE id =', id);
        const result = db.prepare('DELETE FROM clients WHERE id = ?').run(id);
        console.log('📝 Resultado de DELETE:', result);

        db.close();

        if (result.changes === 0) {
            console.log('❌ No se eliminó nada');
            return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
        }

        console.log('✅ Cliente eliminado exitosamente - cambios:', result.changes);
        return res.json({ success: true, message: 'Cliente eliminado exitosamente' });

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ success: false, message: 'Error al eliminar cliente' });
    }
};

// ==================== CONFECCIONISTAS ====================

const getConfeccionistas = (req, res) => {
    try {
        const db = getDatabase();
        const confeccionistas = db.prepare('SELECT * FROM confeccionistas').all();
        db.close();
        return res.json({ success: true, data: confeccionistas });
    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener confeccionistas' });
    }
};

const createConfeccionista = (req, res) => {
    try {
        const { id, name, address, city, phone, score } = req.body;

        if (!id || !name || !address || !city || !phone || !score) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        if (!['A', 'AA', 'AAA'].includes(score)) {
            return res.status(400).json({
                success: false,
                message: 'Score debe ser A, AA o AAA'
            });
        }

        const db = getDatabase();

        db.prepare(`
            INSERT INTO confeccionistas (id, name, address, city, phone, score, active)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        `).run(id, name, address, city, phone, score);

        db.close();

        return res.status(201).json({
            success: true,
            message: 'Confeccionista creado exitosamente',
            data: { id, name, address, city, phone, score, active: true }
        });

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ success: false, message: 'Error al crear confeccionista' });
    }
};

const updateConfeccionista = (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, city, phone, score, active } = req.body;

        if (!['A', 'AA', 'AAA'].includes(score)) {
            return res.status(400).json({
                success: false,
                message: 'Score debe ser A, AA o AAA'
            });
        }

        const db = getDatabase();

        const result = db.prepare(`
            UPDATE confeccionistas
            SET name = ?, address = ?, city = ?, phone = ?, score = ?, active = ?
            WHERE id = ?
        `).run(name, address, city, phone, score, active ? 1 : 0, id);

        db.close();

        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Confeccionista no encontrado' });
        }

        return res.json({
            success: true,
            message: 'Confeccionista actualizado exitosamente',
            data: { id, name, address, city, phone, score, active }
        });

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ success: false, message: 'Error al actualizar confeccionista' });
    }
};

const deleteConfeccionista = (req, res) => {
    try {
        const { id } = req.params;
        console.log('🗑️ DELETE /api/confeccionistas/:id - Intentando eliminar confeccionista con ID:', id);

        const db = getDatabase();

        // Verificar que el confeccionista existe
        const confeccionista = db.prepare('SELECT * FROM confeccionistas WHERE id = ?').get(id);
        console.log('📊 Confeccionista encontrado:', confeccionista ? `${confeccionista.name}` : 'NO ENCONTRADO');

        if (!confeccionista) {
            db.close();
            console.log('❌ Confeccionista no encontrado');
            return res.status(404).json({ success: false, message: 'Confeccionista no encontrado' });
        }

        // Hard delete: eliminar completamente
        console.log('🔥 Ejecutando DELETE FROM confeccionistas WHERE id =', id);
        const result = db.prepare('DELETE FROM confeccionistas WHERE id = ?').run(id);
        console.log('📝 Resultado de DELETE:', result);

        db.close();

        if (result.changes === 0) {
            console.log('❌ No se eliminó nada');
            return res.status(404).json({ success: false, message: 'Confeccionista no encontrado' });
        }

        console.log('✅ Confeccionista eliminado exitosamente - cambios:', result.changes);
        return res.json({ success: true, message: 'Confeccionista eliminado exitosamente' });

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ success: false, message: 'Error al eliminar confeccionista' });
    }
};

// ==================== VENDEDORES ====================

const getSellers = (req, res) => {
    try {
        const db = getDatabase();
        const sellers = db.prepare('SELECT * FROM sellers').all();
        db.close();
        return res.json({ success: true, data: sellers });
    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener vendedores' });
    }
};

const createSeller = (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es requerido'
            });
        }

        const db = getDatabase();
        const id = generateId();

        db.prepare('INSERT INTO sellers (id, name, active) VALUES (?, ?, 1)').run(id, name);
        db.close();

        return res.status(201).json({
            success: true,
            message: 'Vendedor creado exitosamente',
            data: { id, name }
        });

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ success: false, message: 'Error al crear vendedor' });
    }
};

const updateSeller = (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es requerido'
            });
        }

        const db = getDatabase();

        const result = db.prepare(`
            UPDATE sellers
            SET name = ?
            WHERE LOWER(id) = LOWER(?)
        `).run(name, id);

        db.close();

        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Vendedor no encontrado' });
        }

        return res.json({
            success: true,
            message: 'Vendedor actualizado exitosamente',
            data: { id, name }
        });

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ success: false, message: 'Error al actualizar vendedor' });
    }
};

const deleteSeller = (req, res) => {
    try {
        const { id } = req.params;
        console.log('🗑️ DELETE /api/sellers/:id - Intentando eliminar vendedor con ID:', id);
        
        const db = getDatabase();

        // Verificar que el vendedor existe (case-insensitive)
        const seller = db.prepare('SELECT * FROM sellers WHERE LOWER(id) = LOWER(?)').get(id);
        console.log('📊 Vendedor encontrado:', seller ? `${seller.name}` : 'NO ENCONTRADO');

        if (!seller) {
            db.close();
            console.log('❌ Vendedor no encontrado');
            return res.status(404).json({ success: false, message: 'Vendedor no encontrado' });
        }

        // Hard delete: eliminar completamente
        console.log('🔥 Ejecutando DELETE FROM sellers WHERE id =', id);
        const result = db.prepare('DELETE FROM sellers WHERE LOWER(id) = LOWER(?)').run(id);
        console.log('📝 Resultado de DELETE:', result);
        
        db.close();

        if (result.changes === 0) {
            console.log('❌ No se eliminó nada');
            return res.status(404).json({ success: false, message: 'Vendedor no encontrado' });
        }

        console.log('✅ Vendedor eliminado exitosamente - cambios:', result.changes);
        return res.json({ success: true, message: 'Vendedor eliminado exitosamente' });

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ success: false, message: 'Error al eliminar vendedor' });
    }
};

// ==================== CORRERIAS ====================

const getCorrerias = (req, res) => {
    try {
        const db = getDatabase();
        const correrias = db.prepare('SELECT * FROM correrias WHERE active = 1').all();
        db.close();
        return res.json({ success: true, data: correrias });
    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener correrias' });
    }
};

const createCorreria = (req, res) => {
    try {
        const { name, year } = req.body;

        if (!name || !year) {
            return res.status(400).json({
                success: false,
                message: 'Nombre y año son requeridos'
            });
        }

        const db = getDatabase();
        const id = generateId();

        db.prepare('INSERT INTO correrias (id, name, year, active) VALUES (?, ?, ?, 1)').run(id, name, year);
        db.close();

        return res.status(201).json({
            success: true,
            message: 'Correría creada exitosamente',
            data: { id, name, year }
        });

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ success: false, message: 'Error al crear correría' });
    }
};

const updateCorreria = (req, res) => {
    try {
        const { id } = req.params;
        const { name, year } = req.body;

        if (!name || !year) {
            return res.status(400).json({
                success: false,
                message: 'Nombre y año son requeridos'
            });
        }

        const db = getDatabase();

        const result = db.prepare(`
            UPDATE correrias
            SET name = ?, year = ?
            WHERE LOWER(id) = LOWER(?)
        `).run(name, year, id);

        db.close();

        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Correría no encontrada' });
        }

        return res.json({
            success: true,
            message: 'Correría actualizada exitosamente',
            data: { id, name, year }
        });

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ success: false, message: 'Error al actualizar correría' });
    }
};

const deleteCorreria = (req, res) => {
    try {
        const { id } = req.params;
        console.log('🗑️ DELETE /api/correrias/:id - Intentando eliminar correría con ID:', id);

        const db = getDatabase();

        // Verificar que la correría existe
        const correria = db.prepare('SELECT * FROM correrias WHERE id = ?').get(id);
        console.log('📊 Correría encontrada:', correria ? `${correria.name} (${correria.year})` : 'NO ENCONTRADA');

        if (!correria) {
            db.close();
            console.log('❌ Correría no encontrada');
            return res.status(404).json({ success: false, message: 'Correría no encontrada' });
        }

        // Hard delete: eliminar completamente
        console.log('🔥 Ejecutando DELETE FROM correrias WHERE id =', id);
        const result = db.prepare('DELETE FROM correrias WHERE id = ?').run(id);
        console.log('📝 Resultado de DELETE:', result);

        db.close();

        if (result.changes === 0) {
            console.log('❌ No se eliminó nada');
            return res.status(404).json({ success: false, message: 'Correría no encontrada' });
        }

        console.log('✅ Correría eliminada exitosamente - cambios:', result.changes);
        return res.json({ success: true, message: 'Correría eliminada exitosamente' });

    } catch (error) {
        console.error('❌ Error al eliminar correría:', error);
        return res.status(500).json({ success: false, message: 'Error al eliminar correría' });
    }
};

// Exportar todas las funciones
module.exports = {
    // Referencias
    getReferences,
    createReference,
    updateReference,
    deleteReference,
    
    // Clientes
    getClients,
    createClient,
    updateClient,
    deleteClient,
    
    // Confeccionistas
    getConfeccionistas,
    createConfeccionista,
    updateConfeccionista,
    deleteConfeccionista,
    
    // Vendedores
    getSellers,
    createSeller,
    updateSeller,
    deleteSeller,
    
    // Correrias
    getCorrerias,
    createCorreria,
    updateCorreria,
    deleteCorreria
};
