/**
 * 📦 CONTROLADOR DE MOVIMIENTOS
 * 
 * Maneja las operaciones de:
 * - Recepciones (entrada de mercancía)
 * - Despachos (salida de mercancía)
 * - Pedidos
 * - Tracking de Producción
 */

const { getDatabase, generateId } = require('../config/database');

// ==================== RECEPCIONES ====================

/**
 * OBTENER TODAS LAS RECEPCIONES
 * GET /api/receptions
 */
const getReceptions = (req, res) => {
    try {
        const db = getDatabase();

        // Obtener todas las recepciones
        const receptions = db.prepare(`
            SELECT * FROM receptions
            ORDER BY created_at DESC
        `).all();

        // Para cada recepción, obtener sus items
        const receptionsWithItems = receptions.map(reception => {
            const items = db.prepare(`
                SELECT reference, size, quantity
                FROM reception_items
                WHERE reception_id = ?
            `).all(reception.id);

            return {
                id: reception.id,
                batchCode: reception.batch_code,
                confeccionista: reception.confeccionista,
                hasSeconds: reception.has_seconds === 1 ? true : reception.has_seconds === 0 ? false : null,
                chargeType: reception.charge_type,
                chargeUnits: reception.charge_units,
                items,
                receivedBy: reception.received_by,
                createdAt: reception.created_at
            };
        });

        db.close();

        return res.json({
            success: true,
            data: receptionsWithItems
        });

    } catch (error) {
        console.error('❌ Error al obtener recepciones:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener recepciones',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * CREAR RECEPCIÓN
 * POST /api/receptions
 */
const createReception = (req, res) => {
    try {
        const { batchCode, confeccionista, hasSeconds, chargeType, chargeUnits, items, receivedBy } = req.body;

        // Validaciones
        if (!batchCode || !confeccionista || !items || !items.length || !receivedBy) {
            return res.status(400).json({
                success: false,
                message: 'Código de lote, confeccionista, items y recibido por son requeridos'
            });
        }

        const db = getDatabase();

        // Generar ID y timestamp
        const id = generateId();
        const createdAt = new Date().toISOString();

        // Iniciar transacción
        db.prepare('BEGIN').run();

        try {
            // Insertar recepción (maestro)
            db.prepare(`
                INSERT INTO receptions (id, batch_code, confeccionista, has_seconds, charge_type, charge_units, received_by, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                id,
                batchCode,
                confeccionista,
                hasSeconds === true ? 1 : hasSeconds === false ? 0 : null,
                chargeType || null,
                chargeUnits || 0,
                receivedBy,
                createdAt
            );

            // Insertar items (detalle)
            const insertItem = db.prepare(`
                INSERT INTO reception_items (reception_id, reference, size, quantity)
                VALUES (?, ?, ?, ?)
            `);

            for (const item of items) {
                if (!item.reference || !item.size || !item.quantity) {
                    throw new Error('Cada item debe tener reference, size y quantity');
                }

                if (item.quantity <= 0) {
                    throw new Error('La cantidad debe ser mayor a 0');
                }

                insertItem.run(id, item.reference, item.size, item.quantity);
            }

            // Confirmar transacción
            db.prepare('COMMIT').run();

        } catch (error) {
            // Si hay error, revertir cambios
            db.prepare('ROLLBACK').run();
            throw error;
        }

        db.close();

        return res.status(201).json({
            success: true,
            message: 'Recepción creada exitosamente',
            data: {
                id,
                batchCode,
                confeccionista,
                hasSeconds,
                chargeType,
                chargeUnits,
                items,
                receivedBy,
                createdAt
            }
        });

    } catch (error) {
        console.error('❌ Error al crear recepción:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al crear recepción',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ==================== DESPACHOS ====================

/**
 * OBTENER TODOS LOS DESPACHOS
 * GET /api/dispatches
 */
const getDispatches = (req, res) => {
    try {
        const db = getDatabase();

        const dispatches = db.prepare(`
            SELECT * FROM dispatches
            ORDER BY created_at DESC
        `).all();

        const dispatchesWithItems = dispatches.map(dispatch => {
            const items = db.prepare(`
                SELECT reference, size, quantity
                FROM dispatch_items
                WHERE dispatch_id = ?
            `).all(dispatch.id);

            return {
                id: dispatch.id,
                clientId: dispatch.client_id,
                invoiceNo: dispatch.invoice_no,
                remissionNo: dispatch.remission_no,
                items,
                dispatchedBy: dispatch.dispatched_by,
                createdAt: dispatch.created_at
            };
        });

        db.close();

        return res.json({
            success: true,
            data: dispatchesWithItems
        });

    } catch (error) {
        console.error('❌ Error al obtener despachos:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener despachos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * CREAR DESPACHO
 * POST /api/dispatches
 */
const createDispatch = (req, res) => {
    try {
        const { clientId, invoiceNo, remissionNo, items, dispatchedBy } = req.body;

        if (!clientId || !invoiceNo || !remissionNo || !items || !items.length || !dispatchedBy) {
            return res.status(400).json({
                success: false,
                message: 'Cliente, factura, remisión, items y despachado por son requeridos'
            });
        }

        const db = getDatabase();
        const id = generateId();
        const createdAt = new Date().toISOString();

        db.prepare('BEGIN').run();

        try {
            // Insertar despacho
            db.prepare(`
                INSERT INTO dispatches (id, client_id, invoice_no, remission_no, dispatched_by, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(id, clientId, invoiceNo, remissionNo, dispatchedBy, createdAt);

            // Insertar items
            const insertItem = db.prepare(`
                INSERT INTO dispatch_items (dispatch_id, reference, size, quantity)
                VALUES (?, ?, ?, ?)
            `);

            for (const item of items) {
                if (!item.reference || !item.size || !item.quantity) {
                    throw new Error('Cada item debe tener reference, size y quantity');
                }

                if (item.quantity <= 0) {
                    throw new Error('La cantidad debe ser mayor a 0');
                }

                insertItem.run(id, item.reference, item.size, item.quantity);
            }

            db.prepare('COMMIT').run();

        } catch (error) {
            db.prepare('ROLLBACK').run();
            throw error;
        }

        db.close();

        return res.status(201).json({
            success: true,
            message: 'Despacho creado exitosamente',
            data: {
                id,
                clientId,
                invoiceNo,
                remissionNo,
                items,
                dispatchedBy,
                createdAt
            }
        });

    } catch (error) {
        console.error('❌ Error al crear despacho:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al crear despacho',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ==================== PEDIDOS ====================

/**
 * OBTENER TODOS LOS PEDIDOS
 * GET /api/orders
 */
const getOrders = (req, res) => {
    try {
        const db = getDatabase();

        const orders = db.prepare(`
            SELECT * FROM orders
            ORDER BY created_at DESC
        `).all();

        const ordersWithItems = orders.map(order => {
            const items = db.prepare(`
                SELECT reference, size, quantity
                FROM order_items
                WHERE order_id = ?
            `).all(order.id);

            return {
                id: order.id,
                clientId: order.client_id,
                sellerId: order.seller_id,
                correriaId: order.correria_id,
                items,
                totalValue: order.total_value,
                createdAt: order.created_at,
                settledBy: order.settled_by
            };
        });

        db.close();

        return res.json({
            success: true,
            data: ordersWithItems
        });

    } catch (error) {
        console.error('❌ Error al obtener pedidos:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener pedidos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * CREAR PEDIDO
 * POST /api/orders
 */
const createOrder = (req, res) => {
    try {
        const { clientId, sellerId, correriaId, items, totalValue, settledBy } = req.body;

        if (!clientId || !sellerId || !correriaId || !items || !items.length || !totalValue || !settledBy) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        const db = getDatabase();
        const id = generateId();
        const createdAt = new Date().toISOString();

        db.prepare('BEGIN').run();

        try {
            // Insertar pedido
            db.prepare(`
                INSERT INTO orders (id, client_id, seller_id, correria_id, total_value, created_at, settled_by)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(id, clientId, sellerId, correriaId, totalValue, createdAt, settledBy);

            // Insertar items
            const insertItem = db.prepare(`
                INSERT INTO order_items (order_id, reference, size, quantity)
                VALUES (?, ?, ?, ?)
            `);

            for (const item of items) {
                if (!item.reference || !item.size || !item.quantity) {
                    throw new Error('Cada item debe tener reference, size y quantity');
                }

                if (item.quantity <= 0) {
                    throw new Error('La cantidad debe ser mayor a 0');
                }

                insertItem.run(id, item.reference, item.size, item.quantity);
            }

            db.prepare('COMMIT').run();

        } catch (error) {
            db.prepare('ROLLBACK').run();
            throw error;
        }

        db.close();

        return res.status(201).json({
            success: true,
            message: 'Pedido creado exitosamente',
            data: {
                id,
                clientId,
                sellerId,
                correriaId,
                items,
                totalValue,
                createdAt,
                settledBy
            }
        });

    } catch (error) {
        console.error('❌ Error al crear pedido:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al crear pedido',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ==================== TRACKING DE PRODUCCIÓN ====================

/**
 * OBTENER TODO EL TRACKING
 * GET /api/production
 */
const getProductionTracking = (req, res) => {
    try {
        const db = getDatabase();

        const tracking = db.prepare(`
            SELECT ref_id, correria_id, programmed, cut
            FROM production_tracking
        `).all();

        db.close();

        const formattedTracking = tracking.map(t => ({
            refId: t.ref_id,
            correriaId: t.correria_id,
            programmed: t.programmed,
            cut: t.cut
        }));

        return res.json({
            success: true,
            data: formattedTracking
        });

    } catch (error) {
        console.error('❌ Error al obtener tracking:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener tracking',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ACTUALIZAR/CREAR TRACKING
 * POST /api/production
 */
const updateProductionTracking = (req, res) => {
    try {
        const { refId, correriaId, programmed, cut } = req.body;

        if (!refId || !correriaId || programmed === undefined || cut === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        const db = getDatabase();

        // INSERT OR REPLACE - Si existe actualiza, si no existe crea
        db.prepare(`
            INSERT OR REPLACE INTO production_tracking (ref_id, correria_id, programmed, cut)
            VALUES (?, ?, ?, ?)
        `).run(refId, correriaId, programmed, cut);

        db.close();

        return res.json({
            success: true,
            message: 'Tracking actualizado exitosamente',
            data: { refId, correriaId, programmed, cut }
        });

    } catch (error) {
        console.error('❌ Error al actualizar tracking:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar tracking',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    // Recepciones
    getReceptions,
    createReception,
    
    // Despachos
    getDispatches,
    createDispatch,
    
    // Pedidos
    getOrders,
    createOrder,
    
    // Producción
    getProductionTracking,
    updateProductionTracking
};
