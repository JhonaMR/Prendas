/**
 * 📦 CONTROLADOR DE MOVIMIENTOS - POSTGRESQL
 * 
 * Maneja las operaciones de:
 * - Recepciones (entrada de mercancía)
 * - Despachos (salida de mercancía)
 * - Pedidos
 * - Tracking de Producción
 */

const { query, transaction, generateId } = require('../config/database');
const DispatchService = require('../services/DispatchService');
const ReceptionService = require('../services/ReceptionService');
const ReturnService = require('../services/ReturnService');
const logger = require('../utils/logger');

// ==================== DEVOLUCIONES ====================

/**
 * OBTENER TODAS LAS DEVOLUCIONES
 * GET /api/return-receptions
 */
const getReturnReceptions = async (req, res) => {
    try {
        const { page, limit, clientId, startDate, endDate } = req.query;

        // If pagination params provided, use paginated endpoint
        if (page || limit) {
            const filters = {};
            if (clientId) filters.clientId = clientId;
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;

            const result = await ReturnService.getAllWithPagination(page, limit, filters);
            return res.json({
                success: true,
                ...result
            });
        }

        // Otherwise return all (backward compatibility)
        const result = await query(`
            SELECT * FROM return_receptions
            ORDER BY created_at DESC
        `);

        const returnReceptions = result.rows;

        const returnReceptionsWithItems = await Promise.all(returnReceptions.map(async (reception) => {
            const itemsResult = await query(`
                SELECT reference, quantity, unit_price
                FROM return_reception_items
                WHERE return_reception_id = $1
            `, [reception.id]);

            return {
                id: reception.id,
                clientId: reception.client_id,
                creditNoteNumber: reception.credit_note_number,
                items: itemsResult.rows,
                totalValue: reception.total_value,
                receivedBy: reception.received_by,
                createdAt: reception.created_at
            };
        }));

        return res.json({
            success: true,
            data: returnReceptionsWithItems
        });

    } catch (error) {
        logger.error('❌ Error al obtener devoluciones:', error);
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
const createReturnReception = async (req, res) => {
    try {
        const { clientId, creditNoteNumber, items, totalValue, receivedBy } = req.body;

        if (!clientId || !items || !items.length || !receivedBy) {
            return res.status(400).json({
                success: false,
                message: 'Cliente, items y recibido por son requeridos'
            });
        }

        const id = generateId();
        const createdAt = new Date();

        const result = await ReturnService.createReturnReception(
            {
                id,
                clientId,
                creditNoteNumber: creditNoteNumber || null,
                totalValue: totalValue || 0,
                receivedBy
            },
            items
        );

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
        logger.error('❌ Error al crear devolución:', error);
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
const getReceptions = async (req, res) => {
    try {
        const { page, limit, confeccionistaId, referenceId, startDate, endDate } = req.query;

        // If pagination params provided, use paginated endpoint
        if (page || limit) {
            const filters = {};
            if (confeccionistaId) filters.confeccionistaId = confeccionistaId;
            if (referenceId) filters.referenceId = referenceId;
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;

            const result = await ReceptionService.getAllWithPagination(page, limit, filters);
            return res.json({
                success: true,
                ...result
            });
        }

        // Otherwise return all (backward compatibility)
        const result = await query(`
            SELECT * FROM receptions
            ORDER BY created_at DESC
        `);

        const receptions = result.rows;

        // Para cada recepción, obtener sus items
        const receptionsWithItems = await Promise.all(receptions.map(async (reception) => {
            const itemsResult = await query(`
                SELECT reference, quantity
                FROM reception_items
                WHERE reception_id = $1
            `, [reception.id]);

            return {
                id: reception.id,
                batchCode: reception.batch_code,
                confeccionista: reception.confeccionista,
                hasSeconds: reception.has_seconds === 1 ? true : reception.has_seconds === 0 ? false : null,
                chargeType: reception.charge_type,
                chargeUnits: reception.charge_units,
                items: itemsResult.rows,
                receivedBy: reception.received_by,
                createdAt: reception.created_at,
                affectsInventory: reception.affects_inventory !== false
            };
        }));

        return res.json({
            success: true,
            data: receptionsWithItems
        });

    } catch (error) {
        logger.error('❌ Error al obtener recepciones:', error);
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
const createReception = async (req, res) => {
    try {
        const { batchCode, confeccionista, hasSeconds, chargeType, chargeUnits, items, receivedBy, affectsInventory } = req.body;

        // Validaciones
        if (!batchCode || !confeccionista || !items || !items.length || !receivedBy) {
            return res.status(400).json({
                success: false,
                message: 'Código de lote, confeccionista, items y recibido por son requeridos'
            });
        }

        // Generar ID
        const id = generateId();

        // Crear recepción con transacción
        const result = await ReceptionService.createReception(
            {
                id,
                batchCode,
                confeccionista,
                hasSeconds,
                chargeType: chargeType || null,
                chargeUnits: chargeUnits || 0,
                receivedBy,
                affectsInventory: affectsInventory !== false
            },
            items
        );

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
                affectsInventory: affectsInventory !== false,
                createdAt: new Date()
            }
        });

    } catch (error) {
        logger.error('❌ Error al crear recepción:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al crear recepción',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ACTUALIZAR RECEPCIÓN
 * PUT /api/receptions/:id
 */
const updateReception = async (req, res) => {
    try {
        const { id } = req.params;
        const { batchCode, confeccionista, hasSeconds, chargeType, chargeUnits, affectsInventory } = req.body;

        // Validaciones
        if (!batchCode || !confeccionista) {
            return res.status(400).json({
                success: false,
                message: 'Código de lote y confeccionista son requeridos'
            });
        }

        // Actualizar recepción
        const result = await ReceptionService.updateReception(id, {
            batchCode,
            confeccionista,
            hasSeconds,
            chargeType: chargeType || null,
            chargeUnits: chargeUnits || 0,
            affectsInventory: affectsInventory !== false
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Recepción no encontrada'
            });
        }

        return res.json({
            success: true,
            message: 'Recepción actualizada exitosamente',
            data: {
                id: result.id,
                batchCode: result.batch_code,
                confeccionista: result.confeccionista,
                hasSeconds: result.has_seconds === 1 ? true : result.has_seconds === 0 ? false : null,
                chargeType: result.charge_type,
                chargeUnits: result.charge_units,
                affectsInventory: result.affects_inventory !== false,
                receivedBy: result.received_by,
                createdAt: result.created_at
            }
        });

    } catch (error) {
        logger.error('❌ Error al actualizar recepción:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar recepción',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ==================== DESPACHOS ====================

/**
 * OBTENER TODOS LOS DESPACHOS
 * GET /api/dispatches
 */
const getDispatches = async (req, res) => {
    try {
        const { page, limit, clientId, referenceId, startDate, endDate } = req.query;

        // If pagination params provided, use paginated endpoint
        if (page || limit) {
            const filters = {};
            if (clientId) filters.clientId = clientId;
            if (referenceId) filters.referenceId = referenceId;
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;

            const result = await DispatchService.getAllWithPagination(page, limit, filters);
            return res.json({
                success: true,
                ...result
            });
        }

        // Otherwise return all (backward compatibility)
        const result = await query(`
            SELECT * FROM dispatches
            ORDER BY created_at DESC
        `);

        const dispatches = result.rows;

        const dispatchesWithItems = await Promise.all(dispatches.map(async (dispatch) => {
            const itemsResult = await query(`
                SELECT reference, quantity
                FROM dispatch_items
                WHERE dispatch_id = $1
            `, [dispatch.id]);

            return {
                id: dispatch.id,
                clientId: dispatch.client_id,
                correriaId: dispatch.correria_id,
                invoiceNo: dispatch.invoice_no,
                remissionNo: dispatch.remission_no,
                items: itemsResult.rows,
                dispatchedBy: dispatch.dispatched_by,
                createdAt: dispatch.created_at
            };
        }));

        return res.json({
            success: true,
            data: dispatchesWithItems
        });

    } catch (error) {
        logger.error('❌ Error al obtener despachos:', error);
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
const createDispatch = async (req, res) => {
    try {
        const { clientId, correriaId, invoiceNo, remissionNo, items, dispatchedBy } = req.body;

        if (!clientId || !correriaId || !invoiceNo || !remissionNo || !items || !items.length || !dispatchedBy) {
            return res.status(400).json({
                success: false,
                message: 'Cliente, correría, factura, remisión, items y despachado por son requeridos'
            });
        }

        const id = generateId();

        const result = await DispatchService.createDispatch(
            {
                id,
                clientId,
                correriaId,
                invoiceNo,
                remissionNo,
                dispatchedBy
            },
            items
        );

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
                createdAt: new Date()
            }
        });

    } catch (error) {
        logger.error('❌ Error al crear despacho:', error);
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
const updateDispatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { clientId, correriaId, invoiceNo, remissionNo, items, dispatchedBy } = req.body;

        if (!clientId || !correriaId || !invoiceNo || !remissionNo || !items || !items.length) {
            return res.status(400).json({
                success: false,
                message: 'Cliente, correría, factura, remisión e items son requeridos'
            });
        }

        await transaction(async (client) => {
            // Actualizar despacho
            await client.query(
                `UPDATE dispatches 
                SET client_id = $1, correria_id = $2, invoice_no = $3, remission_no = $4, dispatched_by = $5
                WHERE id = $6`,
                [clientId, correriaId, invoiceNo, remissionNo, dispatchedBy || null, id]
            );

            // Eliminar items antiguos
            await client.query(`DELETE FROM dispatch_items WHERE dispatch_id = $1`, [id]);

            // Insertar nuevos items
            for (const item of items) {
                if (!item.reference || !item.quantity) {
                    throw new Error('Cada item debe tener reference y quantity');
                }

                if (item.quantity <= 0) {
                    throw new Error('La cantidad debe ser mayor a 0');
                }

                await client.query(
                    `INSERT INTO dispatch_items (dispatch_id, reference, quantity)
                    VALUES ($1, $2, $3)`,
                    [id, item.reference, item.quantity]
                );
            }
        });

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
        logger.error('❌ Error al actualizar despacho:', error);
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
const deleteDispatch = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID del despacho es requerido'
            });
        }

        const result = await DispatchService.deleteDispatch(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Despacho no encontrado'
            });
        }

        return res.json({
            success: true,
            message: 'Despacho eliminado exitosamente'
        });

    } catch (error) {
        logger.error('❌ Error al eliminar despacho:', error);
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
const getOrders = async (req, res) => {
    try {
        const result = await query(`
            SELECT * FROM orders
            ORDER BY created_at DESC
        `);

        const orders = result.rows;

        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const itemsResult = await query(`
                SELECT reference, quantity, sale_price
                FROM order_items
                WHERE order_id = $1
            `, [order.id]);

            return {
                id: order.id,
                clientId: order.client_id,
                sellerId: order.seller_id,
                correriaId: order.correria_id,
                items: itemsResult.rows,
                totalValue: parseFloat(order.total_value) || 0,
                createdAt: order.created_at,
                settledBy: order.settled_by,
                orderNumber: order.order_number
            };
        }));

        return res.json({
            success: true,
            data: ordersWithItems
        });

    } catch (error) {
        logger.error('❌ Error al obtener pedidos:', error);
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
const createOrder = async (req, res) => {
    try {
        const { clientId, sellerId, correriaId, items, totalValue, settledBy, orderNumber } = req.body;

        if (!clientId || !sellerId || !correriaId || !items || !items.length || !totalValue || !settledBy) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        const id = generateId();
        const createdAt = new Date().toISOString();

        await transaction(async (client) => {
            // Insertar pedido
            await client.query(
                `INSERT INTO orders (id, client_id, seller_id, correria_id, total_value, created_at, settled_by, order_number)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [id, clientId, sellerId, correriaId, String(totalValue), createdAt, settledBy, orderNumber || null]
            );

            // Insertar items
            for (const item of items) {
                const salePrice = item.sale_price || item.salePrice;
                
                if (!item.reference || !item.quantity || salePrice === undefined) {
                    throw new Error('Cada item debe tener reference, quantity y sale_price');
                }

                if (item.quantity <= 0) {
                    throw new Error('La cantidad debe ser mayor a 0');
                }

                if (salePrice <= 0) {
                    throw new Error('El precio de venta debe ser mayor a 0');
                }

                await client.query(
                    `INSERT INTO order_items (order_id, reference, quantity, sale_price)
                    VALUES ($1, $2, $3, $4)`,
                    [id, item.reference, item.quantity, salePrice]
                );
            }
        });

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
        logger.error('❌ Error al crear pedido:', error);
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
const getProductionTracking = async (req, res) => {
    try {
        const result = await query(`
            SELECT ref_id, correria_id, programmed, cut
            FROM production_tracking
        `);

        const tracking = result.rows;

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
        logger.error('❌ Error al obtener tracking:', error);
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
const updateProductionTracking = async (req, res) => {
    try {
        const { refId, correriaId, programmed, cut } = req.body;

        if (!refId || !correriaId || programmed === undefined || cut === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        // UPSERT - Si existe actualiza, si no existe crea
        await query(
            `INSERT INTO production_tracking (ref_id, correria_id, programmed, cut)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (ref_id, correria_id) DO UPDATE SET programmed = $3, cut = $4`,
            [refId, correriaId, programmed, cut]
        );

        return res.json({
            success: true,
            message: 'Tracking actualizado exitosamente',
            data: { refId, correriaId, programmed, cut }
        });

    } catch (error) {
        logger.error('❌ Error al actualizar tracking:', error);
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
const saveProductionBatch = async (req, res) => {
    try {
        const { trackingData } = req.body;

        // Validar que venga un array
        if (!Array.isArray(trackingData) || trackingData.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere un array de datos de producción'
            });
        }

        let savedCount = 0;

        await transaction(async (client) => {
            // Guardar cada registro
            for (const item of trackingData) {
                const { refId, correriaId, programmed, cut } = item;

                // Validar cada registro
                if (!refId || !correriaId || programmed === undefined || cut === undefined) {
                    throw new Error(`Registro inválido: falta refId, correriaId, programmed o cut`);
                }

                // Ejecutar UPSERT
                await client.query(
                    `INSERT INTO production_tracking (ref_id, correria_id, programmed, cut)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (ref_id, correria_id) DO UPDATE SET programmed = $3, cut = $4`,
                    [refId, correriaId, programmed, cut]
                );
                savedCount++;
            }
        });

        return res.json({
            success: true,
            message: `${savedCount} registro(s) guardado(s) exitosamente`,
            savedCount
        });

    } catch (error) {
        logger.error('❌ Error al guardar batch de tracking:', error);
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
    updateReception,
    
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
