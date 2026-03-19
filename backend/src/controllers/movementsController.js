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

const updateReturnReception = async (req, res) => {
    try {
        const { id } = req.params;
        const { clientId, creditNoteNumber, items, totalValue, receivedBy } = req.body;

        if (!clientId || !items || !items.length || !receivedBy) {
            return res.status(400).json({
                success: false,
                message: 'Cliente, items y recibido por son requeridos'
            });
        }

        const result = await ReturnService.updateReturnReception(id, {
            clientId,
            creditNoteNumber: creditNoteNumber || null,
            totalValue: totalValue || 0,
            receivedBy
        }, items);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Devolución no encontrada'
            });
        }

        // Get the updated reception with items
        const updatedReception = await ReturnService.getReturnReceptionById(id);

        return res.json({
            success: true,
            message: 'Devolución actualizada exitosamente',
            data: updatedReception
        });

    } catch (error) {
        logger.error('❌ Error al actualizar devolución:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar devolución',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const deleteReturnReception = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await ReturnService.deleteReturnReception(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Devolución no encontrada'
            });
        }

        return res.json({
            success: true,
            message: 'Devolución eliminada exitosamente'
        });

    } catch (error) {
        logger.error('❌ Error al eliminar devolución:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar devolución',
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
                incompleteUnits: reception.incomplete_units || 0,
                isPacked: reception.is_packed === true || reception.is_packed === 1,
                hasMuestra: reception.has_muestra === true || reception.has_muestra === 1,
                bagQuantity: reception.bag_quantity || 0,
                items: itemsResult.rows,
                receivedBy: reception.received_by,
                createdAt: reception.created_at,
                arrivalDate: reception.arrival_date,
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
        const { batchCode, confeccionista, hasSeconds, chargeType, chargeUnits, items, receivedBy, affectsInventory, incompleteUnits, isPacked, hasMuestra, bagQuantity, arrivalDate } = req.body;

        // Validaciones
        if (!batchCode || !confeccionista || !items || !items.length || !receivedBy || !arrivalDate) {
            return res.status(400).json({
                success: false,
                message: 'Código de lote, confeccionista, items, recibido por y fecha de llegada son requeridos'
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
                incompleteUnits: incompleteUnits || 0,
                isPacked: isPacked || false,
                hasMuestra: hasMuestra || false,
                bagQuantity: bagQuantity || 0,
                receivedBy,
                arrivalDate,
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
                incompleteUnits: incompleteUnits || 0,
                isPacked: isPacked || false,
                hasMuestra: hasMuestra || false,
                bagQuantity: bagQuantity || 0,
                items,
                receivedBy,
                arrivalDate,
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
        const { batchCode, confeccionista, hasSeconds, chargeType, chargeUnits, affectsInventory, incompleteUnits, isPacked, hasMuestra, bagQuantity, arrivalDate } = req.body;

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
            incompleteUnits: incompleteUnits || 0,
            isPacked: isPacked || false,
            hasMuestra: hasMuestra || false,
            bagQuantity: bagQuantity || 0,
            arrivalDate,
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
                incompleteUnits: result.incomplete_units || 0,
                isPacked: result.is_packed === true || result.is_packed === 1,
                hasMuestra: result.has_muestra === true || result.has_muestra === 1,
                bagQuantity: result.bag_quantity || 0,
                arrivalDate: result.arrival_date,
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
                SELECT reference, quantity, sale_price
                FROM dispatch_items
                WHERE dispatch_id = $1
            `, [dispatch.id]);

            return {
                id: dispatch.id,
                clientId: dispatch.client_id,
                correriaId: dispatch.correria_id,
                invoiceNo: dispatch.invoice_no,
                remissionNo: dispatch.remission_no,
                items: itemsResult.rows.map(item => ({
                  reference: item.reference,
                  quantity: item.quantity,
                  salePrice: item.sale_price
                })),
                dispatchedBy: dispatch.dispatched_by,
                checkedBy: dispatch.checked_by,
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
        const { clientId, correriaId, invoiceNo, remissionNo, items, dispatchedBy, checkedBy } = req.body;

        if (!clientId || !correriaId || !invoiceNo || !remissionNo || !items || !items.length || !dispatchedBy || !checkedBy) {
            return res.status(400).json({
                success: false,
                message: 'Cliente, correría, factura, remisión, items, despachado por y revisado por son requeridos'
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
                dispatchedBy,
                checkedBy
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
                checkedBy,
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
        const { clientId, correriaId, invoiceNo, remissionNo, items, dispatchedBy, checkedBy } = req.body;

        if (!clientId || !correriaId || !invoiceNo || !remissionNo || !items || !items.length || !checkedBy) {
            return res.status(400).json({
                success: false,
                message: 'Cliente, correría, factura, remisión, items y revisado por son requeridos'
            });
        }

        await transaction(async (client) => {
            // Actualizar despacho
            await client.query(
                `UPDATE dispatches 
                SET client_id = $1, correria_id = $2, invoice_no = $3, remission_no = $4, dispatched_by = $5, checked_by = $6
                WHERE id = $7`,
                [clientId, correriaId, invoiceNo, remissionNo, dispatchedBy || null, checkedBy, id]
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
                    `INSERT INTO dispatch_items (dispatch_id, reference, quantity, sale_price)
                    VALUES ($1, $2, $3, $4)`,
                    [id, item.reference, item.quantity, item.salePrice || 0]
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
                dispatchedBy,
                checkedBy
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
                items: itemsResult.rows.map(item => ({
                  reference: item.reference,
                  quantity: item.quantity,
                  salePrice: item.sale_price
                })),
                totalValue: parseFloat(order.total_value) || 0,
                createdAt: order.created_at,
                settledBy: order.settled_by,
                orderNumber: order.order_number,
                startDate: order.start_date || null,
                endDate: order.end_date || null,
                porcentajeOficial: order.porcentaje_oficial !== null && order.porcentaje_oficial !== undefined ? parseFloat(order.porcentaje_oficial) : null,
                porcentajeRemision: order.porcentaje_remision !== null && order.porcentaje_remision !== undefined ? parseFloat(order.porcentaje_remision) : null
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
        const { clientId, sellerId, correriaId, items, totalValue, settledBy, orderNumber, startDate, endDate, porcentajeOficial, porcentajeRemision } = req.body;

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
                `INSERT INTO orders (id, client_id, seller_id, correria_id, total_value, created_at, settled_by, order_number, start_date, end_date, porcentaje_oficial, porcentaje_remision)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                [id, clientId, sellerId, correriaId, String(totalValue), createdAt, settledBy, orderNumber || null, startDate || null, endDate || null, 
                 porcentajeOficial !== undefined && porcentajeOficial !== '' ? porcentajeOficial : null, 
                 porcentajeRemision !== undefined && porcentajeRemision !== '' ? porcentajeRemision : null]
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

                // NUEVO: Actualizar production_tracking si vienen los datos (retrocompatible)
                // Si el item tiene programmed, cut, o inventory, actualizar production_tracking
                if (item.programmed !== undefined || item.cut !== undefined || item.inventory !== undefined) {
                    const programmed = item.programmed !== undefined ? item.programmed : 0;
                    const cut = item.cut !== undefined ? item.cut : 0;
                    const inventory = item.inventory !== undefined ? item.inventory : 0;
                    
                    logger.info(`📊 Creando production_tracking para ${item.reference}:`, { programmed, cut, inventory });
                    
                    // UPSERT en production_tracking
                    await client.query(
                        `INSERT INTO production_tracking (ref_id, correria_id, programmed, cut, inventory)
                        VALUES ($1, $2, $3, $4, $5)
                        ON CONFLICT (ref_id, correria_id) DO UPDATE SET programmed = $3, cut = $4, inventory = $5`,
                        [item.reference, correriaId, programmed, cut, inventory]
                    );
                }
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
                orderNumber: orderNumber || null,
                startDate: startDate || null,
                endDate: endDate || null,
                porcentajeOficial: porcentajeOficial || null,
                porcentajeRemision: porcentajeRemision || null
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
            SELECT ref_id, correria_id, programmed, cut, inventory, novedades
            FROM production_tracking
        `);

        const tracking = result.rows;

        const formattedTracking = tracking.map(t => ({
            refId: t.ref_id,
            correriaId: t.correria_id,
            programmed: t.programmed,
            cut: t.cut,
            inventory: t.inventory || 0,
            novedades: t.novedades || null
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
        const { refId, correriaId, programmed, cut, inventory, novedades } = req.body;

        if (!refId || !correriaId || programmed === undefined || cut === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        // UPSERT - Si existe actualiza, si no existe crea
        await query(
            `INSERT INTO production_tracking (ref_id, correria_id, programmed, cut, inventory, novedades)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (ref_id, correria_id) DO UPDATE SET programmed = $3, cut = $4, inventory = $5, novedades = $6`,
            [refId, correriaId, programmed, cut, inventory || 0, novedades || null]
        );

        return res.json({
            success: true,
            message: 'Tracking actualizado exitosamente',
            data: { refId, correriaId, programmed, cut, inventory: inventory || 0, novedades: novedades || null }
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
                const { refId, correriaId, programmed, cut, inventory, novedades } = item;

                // Validar cada registro
                if (!refId || !correriaId || programmed === undefined || cut === undefined) {
                    throw new Error(`Registro inválido: falta refId, correriaId, programmed o cut`);
                }

                // Ejecutar UPSERT
                await client.query(
                    `INSERT INTO production_tracking (ref_id, correria_id, programmed, cut, inventory, novedades)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (ref_id, correria_id) DO UPDATE SET programmed = $3, cut = $4, inventory = $5, novedades = $6`,
                    [refId, correriaId, programmed, cut, inventory || 0, novedades || null]
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

/**
 * PUT /api/orders/:id
 * Actualizar un pedido
 */
const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { clientId, sellerId, correriaId, items, totalValue, settledBy, startDate, endDate, porcentajeOficial, porcentajeRemision } = req.body;

        logger.info(`📝 Actualizando pedido ${id}:`, { clientId, sellerId, correriaId, itemsCount: items?.length, totalValue });

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID del pedido es requerido'
            });
        }

        if (!clientId || !sellerId || !correriaId || !items || !items.length || !totalValue) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos',
                received: { clientId, sellerId, correriaId, itemsCount: items?.length, totalValue }
            });
        }

        await transaction(async (client) => {
            // Actualizar pedido
            const updateResult = await client.query(
                `UPDATE orders SET client_id = $1, seller_id = $2, correria_id = $3, total_value = $4, settled_by = $5, start_date = $6, end_date = $7, porcentaje_oficial = $8, porcentaje_remision = $9
                WHERE id = $10`,
                [clientId, sellerId, correriaId, String(totalValue), settledBy || null, startDate || null, endDate || null, 
                 porcentajeOficial !== undefined && porcentajeOficial !== '' ? porcentajeOficial : null, 
                 porcentajeRemision !== undefined && porcentajeRemision !== '' ? porcentajeRemision : null, id]
            );

            logger.info(`✏️ Pedido actualizado: ${updateResult.rowCount} filas afectadas`);

            // Eliminar items anteriores
            const deleteResult = await client.query(`DELETE FROM order_items WHERE order_id = $1`, [id]);
            logger.info(`🗑️ Items eliminados: ${deleteResult.rowCount} filas`);

            // Insertar nuevos items
            for (const item of items) {
                const salePrice = item.sale_price !== undefined ? item.sale_price : item.salePrice;
                
                logger.info(`📦 Procesando item:`, { reference: item.reference, quantity: item.quantity, salePrice });

                if (!item.reference || !item.quantity || salePrice === undefined) {
                    throw new Error(`Item inválido: reference=${item.reference}, quantity=${item.quantity}, salePrice=${salePrice}`);
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

                // NUEVO: Actualizar production_tracking si vienen los datos (retrocompatible)
                // Si el item tiene programmed, cut, o inventory, actualizar production_tracking
                if (item.programmed !== undefined || item.cut !== undefined || item.inventory !== undefined) {
                    const programmed = item.programmed !== undefined ? item.programmed : 0;
                    const cut = item.cut !== undefined ? item.cut : 0;
                    const inventory = item.inventory !== undefined ? item.inventory : 0;
                    
                    logger.info(`📊 Actualizando production_tracking para ${item.reference}:`, { programmed, cut, inventory });
                    
                    // UPSERT en production_tracking
                    await client.query(
                        `INSERT INTO production_tracking (ref_id, correria_id, programmed, cut, inventory)
                        VALUES ($1, $2, $3, $4, $5)
                        ON CONFLICT (ref_id, correria_id) DO UPDATE SET programmed = $3, cut = $4, inventory = $5`,
                        [item.reference, correriaId, programmed, cut, inventory]
                    );
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Pedido actualizado exitosamente',
            data: {
                id,
                clientId,
                sellerId,
                correriaId,
                items,
                totalValue,
                settledBy,
                startDate: startDate || null,
                endDate: endDate || null,
                porcentajeOficial: porcentajeOficial || null,
                porcentajeRemision: porcentajeRemision || null
            }
        });

    } catch (error) {
        logger.error('❌ Error al actualizar pedido:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar pedido',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * DELETE /api/orders/:id
 * Eliminar un pedido
 */
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID del pedido es requerido'
            });
        }

        await transaction(async (client) => {
            // Eliminar items del pedido
            await client.query(`DELETE FROM order_items WHERE order_id = $1`, [id]);

            // Eliminar pedido
            const result = await client.query(`DELETE FROM orders WHERE id = $1`, [id]);

            if (result.rowCount === 0) {
                throw new Error('Pedido no encontrado');
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Pedido eliminado exitosamente'
        });

    } catch (error) {
        logger.error('❌ Error al eliminar pedido:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar pedido',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    // Devoluciones
    getReturnReceptions,
    createReturnReception,
    updateReturnReception,
    deleteReturnReception,
    
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
    updateOrder,
    deleteOrder,
    
    // Producción
    getProductionTracking,
    updateProductionTracking,
    saveProductionBatch
};
