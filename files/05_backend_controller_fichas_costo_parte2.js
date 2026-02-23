// ============================================
// CONTROLADOR: Fichas de Costo - PARTE 2
// Importar, Crear, Actualizar, Cortes
// ============================================

const pool = require('../config/database');
const { calcularValoresFinancieros, calcularTotales, ajustarA900 } = require('./04_backend_controller_fichas_costo_parte1');

/**
 * POST /api/fichas-costo/importar
 * Importar ficha desde fichas_diseno
 */
const importarFichaDiseno = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { referencia, createdBy } = req.body;

        if (!referencia) {
            return res.status(400).json({ success: false, message: 'Referencia es obligatoria' });
        }

        // Verificar que no exista ya en fichas_costo
        const existeCosto = await client.query(
            'SELECT id FROM fichas_costo WHERE referencia = $1',
            [referencia]
        );

        if (existeCosto.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Esta ficha ya fue importada a costos'
            });
        }

        // Obtener ficha de diseño
        const fichaDiseno = await client.query(
            'SELECT * FROM fichas_diseno WHERE referencia = $1',
            [referencia]
        );

        if (fichaDiseno.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No existe ficha de diseño con esta referencia'
            });
        }

        const fd = fichaDiseno.rows[0];

        // Calcular valores financieros (49% por defecto)
        const valores = calcularValoresFinancieros(
            parseFloat(fd.costo_total),
            null,
            49
        );

        await client.query('BEGIN');

        // Crear ficha_costo duplicando datos
        const result = await client.query(`
            INSERT INTO fichas_costo (
                referencia, ficha_diseno_id,
                descripcion, marca, novedad, muestra_1, muestra_2, observaciones,
                foto_1, foto_2,
                materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones,
                total_materia_prima, total_mano_obra, total_insumos_directos,
                total_insumos_indirectos, total_provisiones, costo_total,
                precio_venta, rentabilidad, margen_ganancia, costo_contabilizar,
                desc_0_precio, desc_0_rent, desc_5_precio, desc_5_rent,
                desc_10_precio, desc_10_rent, desc_15_precio, desc_15_rent,
                created_by
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,
                $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34
            ) RETURNING *
        `, [
            fd.referencia, fd.id,
            fd.descripcion, fd.marca, fd.novedad, fd.muestra_1, fd.muestra_2, fd.observaciones,
            fd.foto_1, fd.foto_2,
            fd.materia_prima, fd.mano_obra, fd.insumos_directos, fd.insumos_indirectos, fd.provisiones,
            fd.total_materia_prima, fd.total_mano_obra, fd.total_insumos_directos,
            fd.total_insumos_indirectos, fd.total_provisiones, fd.costo_total,
            valores.precio_venta, valores.rentabilidad, valores.margen_ganancia,
            parseFloat(fd.costo_total) - parseFloat(fd.total_provisiones),
            valores.desc_0_precio, valores.desc_0_rent, valores.desc_5_precio, valores.desc_5_rent,
            valores.desc_10_precio, valores.desc_10_rent, valores.desc_15_precio, valores.desc_15_rent,
            createdBy
        ]);

        // Marcar ficha_diseno como importada
        await client.query(
            'UPDATE fichas_diseno SET importada = true WHERE referencia = $1',
            [referencia]
        );

        await client.query('COMMIT');

        const ficha = result.rows[0];

        return res.json({
            success: true,
            data: {
                id: ficha.id,
                referencia: ficha.referencia,
                costoTotal: parseFloat(ficha.costo_total),
                precioVenta: parseFloat(ficha.precio_venta)
            },
            message: 'Ficha importada exitosamente'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error importando ficha:', error);
        return res.status(500).json({ success: false, message: 'Error al importar ficha' });
    } finally {
        client.release();
    }
};

/**
 * POST /api/fichas-costo
 * Crear nueva ficha de costo (sin importar)
 */
const createFichaCosto = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const {
            referencia,
            descripcion,
            marca,
            novedad,
            muestra1,
            muestra2,
            observaciones,
            foto1,
            foto2,
            materiaPrima,
            manoObra,
            insumosDirectos,
            insumosIndirectos,
            provisiones,
            rentabilidad,
            createdBy
        } = req.body;

        if (!referencia) {
            return res.status(400).json({ success: false, message: 'Referencia es obligatoria' });
        }

        // Verificar que no exista
        const existe = await client.query(
            'SELECT id FROM fichas_costo WHERE referencia = $1',
            [referencia]
        );

        if (existe.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una ficha de costo con esta referencia'
            });
        }

        // Calcular totales
        const secciones = {
            materia_prima: materiaPrima || [],
            mano_obra: manoObra || [],
            insumos_directos: insumosDirectos || [],
            insumos_indirectos: insumosIndirectos || [],
            provisiones: provisiones || []
        };

        const totales = calcularTotales(secciones);

        // Calcular valores financieros
        const valores = calcularValoresFinancieros(
            totales.costo_total,
            null,
            rentabilidad || 49
        );

        await client.query('BEGIN');

        const result = await client.query(`
            INSERT INTO fichas_costo (
                referencia, descripcion, marca, novedad, muestra_1, muestra_2, observaciones,
                foto_1, foto_2,
                materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones,
                total_materia_prima, total_mano_obra, total_insumos_directos,
                total_insumos_indirectos, total_provisiones, costo_total,
                precio_venta, rentabilidad, margen_ganancia, costo_contabilizar,
                desc_0_precio, desc_0_rent, desc_5_precio, desc_5_rent,
                desc_10_precio, desc_10_rent, desc_15_precio, desc_15_rent,
                created_by
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9,
                $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33
            ) RETURNING *
        `, [
            referencia, descripcion, marca, novedad, muestra1, muestra2, observaciones,
            foto1, foto2,
            JSON.stringify(secciones.materia_prima),
            JSON.stringify(secciones.mano_obra),
            JSON.stringify(secciones.insumos_directos),
            JSON.stringify(secciones.insumos_indirectos),
            JSON.stringify(secciones.provisiones),
            totales.total_materia_prima,
            totales.total_mano_obra,
            totales.total_insumos_directos,
            totales.total_insumos_indirectos,
            totales.total_provisiones,
            totales.costo_total,
            valores.precio_venta, valores.rentabilidad, valores.margen_ganancia,
            totales.costo_contabilizar,
            valores.desc_0_precio, valores.desc_0_rent, valores.desc_5_precio, valores.desc_5_rent,
            valores.desc_10_precio, valores.desc_10_rent, valores.desc_15_precio, valores.desc_15_rent,
            createdBy
        ]);

        await client.query('COMMIT');

        const ficha = result.rows[0];

        return res.json({
            success: true,
            data: {
                id: ficha.id,
                referencia: ficha.referencia,
                costoTotal: parseFloat(ficha.costo_total),
                precioVenta: parseFloat(ficha.precio_venta)
            },
            message: 'Ficha de costo creada exitosamente'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error creando ficha costo:', error);
        return res.status(500).json({ success: false, message: 'Error al crear ficha' });
    } finally {
        client.release();
    }
};

/**
 * PUT /api/fichas-costo/:referencia
 * Actualizar ficha de costo
 */
const updateFichaCosto = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { referencia } = req.params;
        const {
            descripcion,
            marca,
            novedad,
            muestra1,
            muestra2,
            observaciones,
            foto1,
            foto2,
            materiaPrima,
            manoObra,
            insumosDirectos,
            insumosIndirectos,
            provisiones,
            precioVenta,
            rentabilidad
        } = req.body;

        // Verificar que existe
        const existe = await client.query(
            'SELECT id FROM fichas_costo WHERE referencia = $1',
            [referencia]
        );

        if (existe.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Ficha no encontrada' });
        }

        // Calcular totales
        const secciones = {
            materia_prima: materiaPrima || [],
            mano_obra: manoObra || [],
            insumos_directos: insumosDirectos || [],
            insumos_indirectos: insumosIndirectos || [],
            provisiones: provisiones || []
        };

        const totales = calcularTotales(secciones);

        // Calcular valores financieros
        const valores = calcularValoresFinancieros(
            totales.costo_total,
            precioVenta,
            rentabilidad
        );

        await client.query('BEGIN');

        const result = await client.query(`
            UPDATE fichas_costo
            SET descripcion = $1,
                marca = $2,
                novedad = $3,
                muestra_1 = $4,
                muestra_2 = $5,
                observaciones = $6,
                foto_1 = $7,
                foto_2 = $8,
                materia_prima = $9,
                mano_obra = $10,
                insumos_directos = $11,
                insumos_indirectos = $12,
                provisiones = $13,
                total_materia_prima = $14,
                total_mano_obra = $15,
                total_insumos_directos = $16,
                total_insumos_indirectos = $17,
                total_provisiones = $18,
                costo_total = $19,
                precio_venta = $20,
                rentabilidad = $21,
                margen_ganancia = $22,
                costo_contabilizar = $23,
                desc_0_precio = $24,
                desc_0_rent = $25,
                desc_5_precio = $26,
                desc_5_rent = $27,
                desc_10_precio = $28,
                desc_10_rent = $29,
                desc_15_precio = $30,
                desc_15_rent = $31
            WHERE referencia = $32
            RETURNING *
        `, [
            descripcion, marca, novedad, muestra1, muestra2, observaciones,
            foto1, foto2,
            JSON.stringify(secciones.materia_prima),
            JSON.stringify(secciones.mano_obra),
            JSON.stringify(secciones.insumos_directos),
            JSON.stringify(secciones.insumos_indirectos),
            JSON.stringify(secciones.provisiones),
            totales.total_materia_prima,
            totales.total_mano_obra,
            totales.total_insumos_directos,
            totales.total_insumos_indirectos,
            totales.total_provisiones,
            totales.costo_total,
            valores.precio_venta,
            valores.rentabilidad,
            valores.margen_ganancia,
            totales.costo_contabilizar,
            valores.desc_0_precio, valores.desc_0_rent,
            valores.desc_5_precio, valores.desc_5_rent,
            valores.desc_10_precio, valores.desc_10_rent,
            valores.desc_15_precio, valores.desc_15_rent,
            referencia
        ]);

        await client.query('COMMIT');

        const ficha = result.rows[0];

        return res.json({
            success: true,
            data: {
                id: ficha.id,
                referencia: ficha.referencia,
                costoTotal: parseFloat(ficha.costo_total),
                precioVenta: parseFloat(ficha.precio_venta)
            },
            message: 'Ficha actualizada exitosamente'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error actualizando ficha costo:', error);
        return res.status(500).json({ success: false, message: 'Error al actualizar ficha' });
    } finally {
        client.release();
    }
};

/**
 * POST /api/fichas-costo/:referencia/cortes
 * Crear (asentar) un nuevo corte
 */
const crearCorte = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { referencia } = req.params;
        const {
            numeroCorte,
            fechaCorte,
            cantidadCortada,
            materiaPrima,
            manoObra,
            insumosDirectos,
            insumosIndirectos,
            provisiones,
            precioVenta,
            rentabilidad,
            createdBy
        } = req.body;

        // Obtener ficha_costo
        const fichaResult = await client.query(
            'SELECT * FROM fichas_costo WHERE referencia = $1',
            [referencia]
        );

        if (fichaResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Ficha no encontrada' });
        }

        const ficha = fichaResult.rows[0];

        // Verificar que no exista ese número de corte
        const existeCorte = await client.query(
            'SELECT id FROM fichas_cortes WHERE ficha_costo_id = $1 AND numero_corte = $2',
            [ficha.id, numeroCorte]
        );

        if (existeCorte.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: `El corte #${numeroCorte} ya existe`
            });
        }

        // Calcular totales del corte
        const secciones = {
            materia_prima: materiaPrima || [],
            mano_obra: manoObra || [],
            insumos_directos: insumosDirectos || [],
            insumos_indirectos: insumosIndirectos || [],
            provisiones: provisiones || []
        };

        const totales = calcularTotales(secciones);
        const costoReal = totales.costo_total;
        const costoProyectado = parseFloat(ficha.costo_total);
        const diferencia = costoProyectado - costoReal;
        const margenUtilidad = costoReal !== 0 ? (diferencia / costoReal) * 100 : 0;

        // Calcular valores financieros del corte
        const valores = calcularValoresFinancieros(
            costoReal,
            precioVenta,
            rentabilidad
        );

        await client.query('BEGIN');

        // Crear corte
        const corteResult = await client.query(`
            INSERT INTO fichas_cortes (
                ficha_costo_id, numero_corte, fecha_corte, cantidad_cortada,
                materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones,
                total_materia_prima, total_mano_obra, total_insumos_directos,
                total_insumos_indirectos, total_provisiones, costo_real,
                precio_venta, rentabilidad,
                costo_proyectado, diferencia, margen_utilidad,
                created_by
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9,
                $10, $11, $12, $13, $14, $15, $16, $17,
                $18, $19, $20, $21
            ) RETURNING *
        `, [
            ficha.id, numeroCorte, fechaCorte, cantidadCortada,
            JSON.stringify(secciones.materia_prima),
            JSON.stringify(secciones.mano_obra),
            JSON.stringify(secciones.insumos_directos),
            JSON.stringify(secciones.insumos_indirectos),
            JSON.stringify(secciones.provisiones),
            totales.total_materia_prima,
            totales.total_mano_obra,
            totales.total_insumos_directos,
            totales.total_insumos_indirectos,
            totales.total_provisiones,
            costoReal,
            valores.precio_venta,
            valores.rentabilidad,
            costoProyectado,
            diferencia,
            margenUtilidad,
            createdBy
        ]);

        // Actualizar cantidad total cortada en ficha_costo
        await client.query(`
            UPDATE fichas_costo
            SET cantidad_total_cortada = cantidad_total_cortada + $1
            WHERE id = $2
        `, [cantidadCortada, ficha.id]);

        await client.query('COMMIT');

        const corte = corteResult.rows[0];

        return res.json({
            success: true,
            data: {
                id: corte.id,
                numeroCorte: corte.numero_corte,
                costoReal: parseFloat(corte.costo_real)
            },
            message: `Corte #${numeroCorte} asentado exitosamente`
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error creando corte:', error);
        return res.status(500).json({ success: false, message: 'Error al crear corte' });
    } finally {
        client.release();
    }
};

/**
 * PUT /api/fichas-costo/:referencia/cortes/:numeroCorte
 * Actualizar un corte existente
 */
const updateCorte = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { referencia, numeroCorte } = req.params;
        const {
            fechaCorte,
            cantidadCortada,
            materiaPrima,
            manoObra,
            insumosDirectos,
            insumosIndirectos,
            provisiones,
            precioVenta,
            rentabilidad
        } = req.body;

        // Obtener ficha y corte
        const fichaResult = await client.query(
            'SELECT id, costo_total FROM fichas_costo WHERE referencia = $1',
            [referencia]
        );

        if (fichaResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Ficha no encontrada' });
        }

        const ficha = fichaResult.rows[0];

        const corteResult = await client.query(
            'SELECT * FROM fichas_cortes WHERE ficha_costo_id = $1 AND numero_corte = $2',
            [ficha.id, numeroCorte]
        );

        if (corteResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Corte no encontrado' });
        }

        const corteAnterior = corteResult.rows[0];

        // Calcular totales
        const secciones = {
            materia_prima: materiaPrima || [],
            mano_obra: manoObra || [],
            insumos_directos: insumosDirectos || [],
            insumos_indirectos: insumosIndirectos || [],
            provisiones: provisiones || []
        };

        const totales = calcularTotales(secciones);
        const costoReal = totales.costo_total;
        const costoProyectado = parseFloat(ficha.costo_total);
        const diferencia = costoProyectado - costoReal;
        const margenUtilidad = costoReal !== 0 ? (diferencia / costoReal) * 100 : 0;

        const valores = calcularValoresFinancieros(costoReal, precioVenta, rentabilidad);

        await client.query('BEGIN');

        // Actualizar corte
        await client.query(`
            UPDATE fichas_cortes
            SET fecha_corte = $1,
                cantidad_cortada = $2,
                materia_prima = $3,
                mano_obra = $4,
                insumos_directos = $5,
                insumos_indirectos = $6,
                provisiones = $7,
                total_materia_prima = $8,
                total_mano_obra = $9,
                total_insumos_directos = $10,
                total_insumos_indirectos = $11,
                total_provisiones = $12,
                costo_real = $13,
                precio_venta = $14,
                rentabilidad = $15,
                diferencia = $16,
                margen_utilidad = $17
            WHERE ficha_costo_id = $18 AND numero_corte = $19
        `, [
            fechaCorte,
            cantidadCortada,
            JSON.stringify(secciones.materia_prima),
            JSON.stringify(secciones.mano_obra),
            JSON.stringify(secciones.insumos_directos),
            JSON.stringify(secciones.insumos_indirectos),
            JSON.stringify(secciones.provisiones),
            totales.total_materia_prima,
            totales.total_mano_obra,
            totales.total_insumos_directos,
            totales.total_insumos_indirectos,
            totales.total_provisiones,
            costoReal,
            valores.precio_venta,
            valores.rentabilidad,
            diferencia,
            margenUtilidad,
            ficha.id,
            numeroCorte
        ]);

        // Actualizar cantidad total si cambió
        const diferenciaCantidad = cantidadCortada - parseInt(corteAnterior.cantidad_cortada);
        if (diferenciaCantidad !== 0) {
            await client.query(`
                UPDATE fichas_costo
                SET cantidad_total_cortada = cantidad_total_cortada + $1
                WHERE id = $2
            `, [diferenciaCantidad, ficha.id]);
        }

        await client.query('COMMIT');

        return res.json({
            success: true,
            message: `Corte #${numeroCorte} actualizado exitosamente`
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error actualizando corte:', error);
        return res.status(500).json({ success: false, message: 'Error al actualizar corte' });
    } finally {
        client.release();
    }
};

module.exports = {
    importarFichaDiseno,
    createFichaCosto,
    updateFichaCosto,
    crearCorte,
    updateCorte
};
