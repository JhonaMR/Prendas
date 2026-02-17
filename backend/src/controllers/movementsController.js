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
const DispatchService = require('../services/DispatchService');
const ReceptionService = require('../services/ReceptionService');
const ReturnService = require('../services/ReturnService');

// ==================== DEVOLUCIONES ====================

/**
 * OBTENER TODAS LAS DEVOLUCIONES
 * GET /api/return-receptions
 */
const getReturnReceptions = (req, res) => {
    try {
        const { page, limit, clientId, startDate, endDate } = req.query;

        // If pagination params provided, use paginated endpoint
        if (page || limit) {
            const filters = {};
            if (clientId) filters.clientId = clientId;
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;

            const result = ReturnService.getAllWithPagination(page, limit, filters);
            return res.json({
                success: true,
                ...result
            });
        }

        // Otherwise return all (backward compatibility)
        const db = getDatabase();

        const returnReceptions = db.prepare(`
            SELECT * FROM return_receptions
            ORDER BY created_at DESC
        `).all();

        const returnReceptionsWithItems = returnReceptions.map(reception => {
            const items = db.prepare(`
                SELECT reference, quantity, unit_price
                FROM return_reception_items
                WHERE return_reception_id = ?
            `).all(reception.id);

            return {
                id: reception.id,
                clientId: reception.client_id,
                creditNoteNumber: reception.credit_note_number,
                items,
                totalValue: reception.total_value,
                receivedBy: reception.received_by,
                createdAt: reception.created_at
            };
        });

        return res.json({
            success: true,
            data: returnReceptionsWithItems
        });

    } catch (error) {
        console.error('❌ Error al obtener devoluciones:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener devoluciones',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * CREAR DEVOLUCIÓN
 * POST /api/return-receptions
 */
const createReturnReception = (req, res) => {
    try {
        const { clientId, creditNoteNumber, items, totalValue, receivedBy } = req.body;

        if (!clientId || !items || !items.length || !receivedBy) {
            return res.status(400).json({
                success: false,
                message: 'Cliente, items y recibido por son requeridos'
            });
        }

        const db = getDatabase();
        const id = generateId();
        const createdAt = new Date().toISOString();

        db.prepare('BEGIN').run();

        try {
            // Insertar devolución (maestro)
            db.prepare(`
                INSERT INTO return_receptions (id, client_id, credit_note_number, total_value, received_by, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(
                id,
                clientId,
                creditNoteNumber || null,
                totalValue || 0,
                receivedBy,
                createdAt
            );

            // Insertar items (detalle)
            const insertItem = db.prepare(`
                INSERT INTO return_reception_items (return_reception_id, reference, quantity, unit_price)
                VALUES (?, ?, ?, ?)
            `);

            for (const item of items) {
                if (!item.reference || !item.quantity) {
                    throw new Error('Cada item debe tener reference y quantity');
                }

                if (item.quantity <= 0) {
                    throw new Error('La cantidad debe ser mayor a 0');
                }

                insertItem.run(id, item.reference, item.quantity, item.unitPrice || 0);
            }

            db.prepare('COMMIT').run();

        } catch (error) {
            db.prepare('ROLLBACK').run();
            throw error;
        }

        db.close();

        return res.status(201).json({
            success: true,
            message: 'Devolución creada exitosamente',
            data: {
                id,
                clientId,
                creditNoteNumber,
                items,
                totalValue,
                receivedBy,
                createdAt
            }
        });

    } catch (error) {
        console.error('❌ Error al crear devolución:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al crear devolución',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ==================== RECEPCIONES ====================

/**
 * OBTENER TODAS LAS RECEPCIONES
 * GET /api/receptions
 */
const getReceptions = (req, res) => {
    try {
        const { page, limit, confeccionistaId, referenceId, startDate, endDate } = req.query;

        // If pagination params provided, use paginated endpoint
        if (page || limit) {
            const filters = {};
            if (confeccionistaId) filters.confeccionistaId = confeccionistaId;
            if (referenceId) filters.referenceId = referenceId;
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;

            const result = ReceptionService.getAllWithPagination(page, limit, filters);
            return res.json({
                success: true,
                ...result
            });
        }

        // Otherwise return all (backward compatibility)
        const db = getDatabase();

        // Obtener todas las recepciones
        const receptions = db.prepare(`
            SELECT * FROM receptions
            ORDER BY created_at DESC
        `).all();

        // Para cada recepción, obtener sus items
        const receptionsWithItems = receptions.map(reception => {
            const items = db.prepare(`
                SELECT reference, quantity
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
                INSERT INTO reception_items (reception_id, reference, quantity)
                VALUES (?, ?, ?)
            `);

            for (const item of items) {
                if (!item.reference || !item.quantity) {
                    throw new Error('Cada item debe tener reference y quantity');
                }

                if (item.quantity <= 0) {
                    throw new Error('La cantidad debe ser mayor a 0');
                }

                insertItem.run(id, item.reference, item.quantity);
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
        const { page, limit, clientId, referenceId, startDate, endDate } = req.query;

        // If pagination params provided, use paginated endpoint
        if (page || limit) {
            const filters = {};
            if (clientId) filters.clientId = clientId;
            if (referenceId) filters.referenceId = referenceId;
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;

            const result = DispatchService.getAllWithPagination(page, limit, filters);
            return res.json({
                success: true,
                ...result
            });
        }

        // Otherwise return all (backward compatibility)
        const db = getDatabase();

        const dispatches = db.prepare(`
            SELECT * FROM dispatches
            ORDER BY created_at DESC
        `).all();

        const dispatchesWithItems = dispatches.map(dispatch => {
            const items = db.prepare(`
                SELECT reference, quantity
                FROM dispatch_items
                WHERE dispatch_id = ?
            `).all(dispatch.id);

            return {
                id: dispatch.id,
                clientId: dispatch.client_id,
                correriaId: dispatch.correria_id,
                invoiceNo: dispatch.invoice_no,
                remissionNo: dispatch.remission_no,
                items,
                dispatchedBy: dispatch.dispatched_by,
                createdAt: dispatch.created_at
            };
        });

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
        const { clientId, correriaId, invoiceNo, remissionNo, items, dispatchedBy } = req.body;

        if (!clientId || !correriaId || !invoiceNo || !remissionNo || !items || !items.length || !dispatchedBy) {
            return res.status(400).json({
                success: false,
                message: 'Cliente, correría, factura, remisión, items y despachado por son requeridos'
            });
        }

        const db = getDatabase();
        const id = generateId();
        const createdAt = new Date().toISOString();

        db.prepare('BEGIN').run();

        try {
            // Insertar despacho
            db.prepare(`
                INSERT INTO dispatches (id, client_id, correria_id, invoice_no, remission_no, dispatched_by, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(id, clientId, correriaId, invoiceNo, remissionNo, dispatchedBy, createdAt);

            // Insertar items
            const insertItem = db.prepare(`
                INSERT INTO dispatch_items (dispatch_id, reference, quantity)
                VALUES (?, ?, ?)
            `);

            for (const item of items) {
                if (!item.reference || !item.quantity) {
                    throw new Error('Cada item debe tener reference y quantity');
                }

                if (item.quantity <= 0) {
                    throw new Error('La cantidad debe ser mayor a 0');
                }

                insertItem.run(id, item.reference, item.quantity);
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
                correriaId,
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

/**
 * ACTUALIZAR DESPACHO
 * PUT /api/dispatches/:id
 */
const updateDispatch = (req, res) => {
    let db;
    try {
        const { id } = req.params;
        const { clientId, correriaId, invoiceNo, remissionNo, items, dispatchedBy } = req.body;

        if (!clientId || !correriaId || !invoiceNo || !remissionNo || !items || !items.length) {
            return res.status(400).json({
                success: false,
                message: 'Cliente, correría, factura, remisión e items son requeridos'
            });
        }

        db = getDatabase();

        db.prepare('BEGIN').run();

        try {
            // Actualizar despacho
            db.prepare(`
                UPDATE dispatches 
                SET client_id = ?, correria_id = ?, invoice_no = ?, remission_no = ?, dispatched_by = ?
                WHERE id = ?
            `).run(clientId, correriaId, invoiceNo, remissionNo, dispatchedBy || null, id);

            // Eliminar items antiguos
            db.prepare(`DELETE FROM dispatch_items WHERE dispatch_id = ?`).run(id);

            // Insertar nuevos items
            const insertItem = db.prepare(`
                INSERT INTO dispatch_items (dispatch_id, reference, quantity)
                VALUES (?, ?, ?)
            `);

            for (const item of items) {
                if (!item.reference || !item.quantity) {
                    throw new Error('Cada item debe tener reference y quantity');
                }

                if (item.quantity <= 0) {
                    throw new Error('La cantidad debe ser mayor a 0');
                }

                insertItem.run(id, item.reference, item.quantity);
            }

            db.prepare('COMMIT').run();

        } catch (error) {
            db.prepare('ROLLBACK').run();
            throw error;
        }

        db.close();

        return res.json({
            success: true,
            message: 'Despacho actualizado exitosamente',
            data: {
                id,
                clientId,
                correriaId,
                invoiceNo,
                remissionNo,
                items,
                dispatchedBy
            }
        });

    } catch (error) {
        if (db) {
            try {
                db.close();
            } catch (closeError) {
                console.error('❌ Error cerrando BD:', closeError);
            }
        }
        console.error('❌ Error al actualizar despacho:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar despacho',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ELIMINAR DESPACHO
 * DELETE /api/dispatches/:id
 */
const deleteDispatch = (req, res) => {
    let db;
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID del despacho es requerido'
            });
        }

        db = getDatabase();

        db.prepare('BEGIN').run();

        try {
            // Eliminar items del despacho
            db.prepare(`DELETE FROM dispatch_items WHERE dispatch_id = ?`).run(id);

            // Eliminar despacho
            const result = db.prepare(`DELETE FROM dispatches WHERE id = ?`).run(id);

            if (result.changes === 0) {
                db.prepare('ROLLBACK').run();
                db.close();
                return res.status(404).json({
                    success: false,
                    message: 'Despacho no encontrado'
                });
            }

            db.prepare('COMMIT').run();

        } catch (error) {
            db.prepare('ROLLBACK').run();
            throw error;
        }

        db.close();

        return res.json({
            success: true,
            message: 'Despacho eliminado exitosamente'
        });

    } catch (error) {
        if (db) {
            try {
                db.close();
            } catch (closeError) {
                console.error('❌ Error cerrando BD:', closeError);
            }
        }
        console.error('❌ Error al eliminar despacho:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar despacho',
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
                SELECT reference, quantity
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
                settledBy: order.settled_by,
                orderNumber: order.order_number
            };
        });

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
        const { clientId, sellerId, correriaId, items, totalValue, settledBy, orderNumber } = req.body;

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
            // Insertar pedido - sin order_number si no existe la columna
            let insertOrderStmt;
            try {
                // Intentar insertar con order_number
                insertOrderStmt = db.prepare(`
                    INSERT INTO orders (id, client_id, seller_id, correria_id, total_value, created_at, settled_by, order_number)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `);
                insertOrderStmt.run(id, clientId, sellerId, correriaId, totalValue, createdAt, settledBy, orderNumber || null);
            } catch (e) {
                // Si falla, intentar sin order_number
                if (e.message.includes('order_number')) {
                    insertOrderStmt = db.prepare(`
                        INSERT INTO orders (id, client_id, seller_id, correria_id, total_value, created_at, settled_by)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `);
                    insertOrderStmt.run(id, clientId, sellerId, correriaId, totalValue, createdAt, settledBy);
                } else {
                    throw e;
                }
            }

            // Insertar items
            const insertItem = db.prepare(`
                INSERT INTO order_items (order_id, reference, quantity)
                VALUES (?, ?, ?)
            `);

            for (const item of items) {
                if (!item.reference || !item.quantity) {
                    throw new Error('Cada item debe tener reference y quantity');
                }

                if (item.quantity <= 0) {
                    throw new Error('La cantidad debe ser mayor a 0');
                }

                insertItem.run(id, item.reference, item.quantity);
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
                settledBy,
                orderNumber: orderNumber || null
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

/**
 * GUARDAR MÚLTIPLES TRACKING EN BATCH
 * POST /api/production/batch
 * 
 * Recibe un array de registros de producción y los guarda/actualiza todos
 */
const saveProductionBatch = (req, res) => {
    try {
        const { trackingData } = req.body;

        // Validar que venga un array
        if (!Array.isArray(trackingData) || trackingData.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere un array de datos de producción'
            });
        }

        const db = getDatabase();

        // Iniciar transacción para asegurar atomicidad
        db.prepare('BEGIN').run();

        try {
            // Preparar statement para UPSERT
            const upsertStmt = db.prepare(`
                INSERT OR REPLACE INTO production_tracking (ref_id, correria_id, programmed, cut)
                VALUES (?, ?, ?, ?)
            `);

            let savedCount = 0;

            // Guardar cada registro
            for (const item of trackingData) {
                const { refId, correriaId, programmed, cut } = item;

                // Validar cada registro
                if (!refId || !correriaId || programmed === undefined || cut === undefined) {
                    throw new Error(`Registro inválido: falta refId, correriaId, programmed o cut`);
                }

                // Ejecutar UPSERT
                upsertStmt.run(refId, correriaId, programmed, cut);
                savedCount++;
            }

            // Confirmar transacción
            db.prepare('COMMIT').run();

            db.close();

            return res.json({
                success: true,
                message: `${savedCount} registro(s) guardado(s) exitosamente`,
                savedCount
            });

        } catch (error) {
            // Si hay error, revertir todos los cambios
            db.prepare('ROLLBACK').run();
            db.close();
            throw error;
        }

    } catch (error) {
        console.error('❌ Error al guardar batch de tracking:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al guardar tracking',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    // Devoluciones
    getReturnReceptions,
    createReturnReception,
    
    // Recepciones
    getReceptions,
    createReception,
    
    // Despachos
    getDispatches,
    createDispatch,
    updateDispatch,
    deleteDispatch,
    
    // Pedidos
    getOrders,
    createOrder,
    
    // Producción
    getProductionTracking,
    updateProductionTracking,
    saveProductionBatch
};
