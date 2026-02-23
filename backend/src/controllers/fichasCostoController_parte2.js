// ============================================
// CONTROLADOR: Fichas de Costo - PARTE 2
// Importar, Crear, Actualizar, Cortes
// ============================================

const { query, transaction } = require('../config/database');
const { calcularValoresFinancieros, calcularTotales } = require('./fichasCostoController_parte1');

/**
 * Sincronizar ficha de costo a product_references
 * Extrae telas de materia prima y las agrupa por nombre
 */
const sincronizarProductReference = async (referencia, fichaData) => {
    try {
        console.log(`🔄 Sincronizando referencia ${referencia}...`);
        
        // Verificar si existe
        const existe = await query('SELECT id FROM product_references WHERE id = $1', [referencia]);

        // Procesar telas: agrupar por nombre y sumar cantidades
        const telas = {};
        let materiaPrima = fichaData.materiaPrima || [];

        // Si materiaPrima es string, parsearlo
        if (typeof materiaPrima === 'string') {
            try {
                materiaPrima = JSON.parse(materiaPrima);
            } catch (e) {
                console.warn(`⚠️ No se pudo parsear materiaPrima para ${referencia}`);
                materiaPrima = [];
            }
        }

        console.log(`📦 Materia prima encontrada: ${materiaPrima.length} items`);

        materiaPrima.forEach(item => {
            if ((item.tipo === 'TELA' || item.tipo === 'SESGO') && item.nombre) {
                console.log(`  - ${item.tipo}: ${item.nombre} x ${item.cantidad}`);
                if (!telas[item.nombre]) {
                    telas[item.nombre] = 0;
                }
                telas[item.nombre] += item.cantidad || 0;
            }
        });

        // Convertir a array ordenado
        const telasArray = Object.entries(telas).map(([nombre, cantidad]) => ({ nombre, cantidad }));

        console.log(`🧵 Telas agrupadas: ${JSON.stringify(telasArray)}`);

        // Preparar datos para product_references
        const updateData = {
            description: fichaData.descripcion || '',
            price: fichaData.precioVenta || 0,
            designer: fichaData.disenadoraNombre || '',
            cloth1: telasArray[0]?.nombre || null,
            avg_cloth1: telasArray[0]?.cantidad || null,
            cloth2: telasArray[1]?.nombre || null,
            avg_cloth2: telasArray[1]?.cantidad || null
        };

        console.log(`📝 Datos a sincronizar:`, updateData);

        if (existe.rows.length > 0) {
            // Actualizar
            await query(`
                UPDATE product_references
                SET description = $1, price = $2, designer = $3,
                    cloth1 = $4, avg_cloth1 = $5, cloth2 = $6, avg_cloth2 = $7
                WHERE id = $8
            `, [
                updateData.description, updateData.price, updateData.designer,
                updateData.cloth1, updateData.avg_cloth1, updateData.cloth2, updateData.avg_cloth2,
                referencia
            ]);
            console.log(`✅ Referencia ${referencia} actualizada en product_references`);
        } else {
            // Crear - active es INTEGER (1 = true, 0 = false)
            await query(`
                INSERT INTO product_references (id, description, price, designer, cloth1, avg_cloth1, cloth2, avg_cloth2, active)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                referencia, updateData.description, updateData.price, updateData.designer,
                updateData.cloth1, updateData.avg_cloth1, updateData.cloth2, updateData.avg_cloth2,
                1  // 1 en lugar de true
            ]);
            console.log(`✅ Referencia ${referencia} creada en product_references`);
        }
    } catch (error) {
        console.error('❌ Error sincronizando product_references:', error);
        // No lanzar error, solo loguear
    }
};

/**
 * POST /api/fichas-costo/importar
 */
const importarFichaDiseno = async (req, res) => {
    try {
        const { referencia, createdBy } = req.body;

        if (!referencia) {
            return res.status(400).json({ success: false, message: 'Referencia es obligatoria' });
        }

        const existeCosto = await query('SELECT id FROM fichas_costo WHERE referencia = $1', [referencia]);
        if (existeCosto.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Esta ficha ya fue importada a costos' });
        }

        const fichaDiseno = await query(`
            SELECT fd.*, d.nombre as disenadora_nombre
            FROM fichas_diseno fd
            LEFT JOIN disenadoras d ON fd.disenadora_id = d.id
            WHERE fd.referencia = $1
        `, [referencia]);
        if (fichaDiseno.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No existe ficha de diseño con esta referencia' });
        }

        const fd = fichaDiseno.rows[0];
        const valores = calcularValoresFinancieros(parseFloat(fd.costo_total), null, 49);

        let fichaData;
        await transaction(async (client) => {
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
                ) RETURNING id, referencia, costo_total, precio_venta
            `, [
                fd.referencia, fd.id,
                fd.descripcion, fd.marca, fd.novedad, fd.muestra_1, fd.muestra_2, fd.observaciones,
                fd.foto_1, fd.foto_2,
                JSON.stringify(fd.materia_prima || []), JSON.stringify(fd.mano_obra || []), JSON.stringify(fd.insumos_directos || []), JSON.stringify(fd.insumos_indirectos || []), JSON.stringify(fd.provisiones || []),
                fd.total_materia_prima, fd.total_mano_obra, fd.total_insumos_directos,
                fd.total_insumos_indirectos, fd.total_provisiones, fd.costo_total,
                valores.precio_venta, valores.rentabilidad, valores.margen_ganancia,
                parseFloat(fd.costo_total) - parseFloat(fd.total_provisiones),
                valores.desc_0_precio, valores.desc_0_rent, valores.desc_5_precio, valores.desc_5_rent,
                valores.desc_10_precio, valores.desc_10_rent, valores.desc_15_precio, valores.desc_15_rent,
                createdBy
            ]);

            await client.query('UPDATE fichas_diseno SET importada = true WHERE referencia = $1', [referencia]);
            fichaData = result.rows[0];
        });

        // Sincronizar a product_references (fuera de la transacción)
        console.log(`🚀 Iniciando sincronización para referencia: ${referencia}`);
        console.log(`📋 Datos a sincronizar:`, {
            referencia,
            descripcion: fd.descripcion,
            precioVenta: valores.precio_venta,
            disenadoraNombre: fd.disenadora_nombre,
            materiaPrima: fd.materia_prima
        });
        
        try {
            await sincronizarProductReference(referencia, {
                descripcion: fd.descripcion,
                precioVenta: valores.precio_venta,
                disenadoraNombre: fd.disenadora_nombre || '',
                materiaPrima: fd.materia_prima
            });
        } catch (syncError) {
            console.error('⚠️ Error sincronizando product_references:', syncError);
            // No bloquear la importación si falla la sincronización
        }

        return res.json({
            success: true,
            data: {
                id: fichaData.id,
                referencia: fichaData.referencia,
                costoTotal: parseFloat(fichaData.costo_total),
                precioVenta: parseFloat(fichaData.precio_venta)
            },
            message: 'Ficha importada exitosamente'
        });
    } catch (error) {
        console.error('❌ Error importando ficha:', error);
        return res.status(500).json({ success: false, message: 'Error al importar ficha' });
    }
};

/**
 * POST /api/fichas-costo
 */
const createFichaCosto = async (req, res) => {
    try {
        const {
            referencia, descripcion, marca, novedad, muestra1, muestra2, observaciones,
            foto1, foto2, materiaPrima, manoObra, insumosDirectos, insumosIndirectos,
            provisiones, rentabilidad, createdBy
        } = req.body;

        if (!referencia) {
            return res.status(400).json({ success: false, message: 'Referencia es obligatoria' });
        }

        const existe = await query('SELECT id FROM fichas_costo WHERE referencia = $1', [referencia]);
        if (existe.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Ya existe una ficha de costo con esta referencia' });
        }

        const secciones = {
            materia_prima: materiaPrima || [],
            mano_obra: manoObra || [],
            insumos_directos: insumosDirectos || [],
            insumos_indirectos: insumosIndirectos || [],
            provisiones: provisiones || []
        };
        const totales = calcularTotales(secciones);
        const valores = calcularValoresFinancieros(totales.costo_total, null, rentabilidad || 49);

        let fichaData;
        await transaction(async (client) => {
            const result = await client.query(`
                INSERT INTO fichas_costo (
                    referencia, descripcion, marca, novedad, muestra_1, muestra_2, observaciones,
                    foto_1, foto_2, materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones,
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
                ) RETURNING id, referencia, costo_total, precio_venta
            `, [
                referencia, descripcion, marca, novedad, muestra1, muestra2, observaciones,
                foto1, foto2,
                JSON.stringify(secciones.materia_prima), JSON.stringify(secciones.mano_obra),
                JSON.stringify(secciones.insumos_directos), JSON.stringify(secciones.insumos_indirectos),
                JSON.stringify(secciones.provisiones),
                totales.total_materia_prima, totales.total_mano_obra, totales.total_insumos_directos,
                totales.total_insumos_indirectos, totales.total_provisiones, totales.costo_total,
                valores.precio_venta, valores.rentabilidad, valores.margen_ganancia,
                totales.costo_contabilizar,
                valores.desc_0_precio, valores.desc_0_rent, valores.desc_5_precio, valores.desc_5_rent,
                valores.desc_10_precio, valores.desc_10_rent, valores.desc_15_precio, valores.desc_15_rent,
                createdBy
            ]);
            fichaData = result.rows[0];
        });

        // Sincronizar a product_references (fuera de la transacción)
        try {
            await sincronizarProductReference(referencia, {
                descripcion: descripcion,
                precioVenta: valores.precio_venta,
                disenadoraNombre: '',
                materiaPrima: secciones.materia_prima
            });
        } catch (syncError) {
            console.error('⚠️ Error sincronizando product_references:', syncError);
        }

        return res.json({
            success: true,
            data: { id: fichaData.id, referencia: fichaData.referencia, costoTotal: parseFloat(fichaData.costo_total), precioVenta: parseFloat(fichaData.precio_venta) },
            message: 'Ficha de costo creada exitosamente'
        });
    } catch (error) {
        console.error('❌ Error creando ficha costo:', error);
        return res.status(500).json({ success: false, message: 'Error al crear ficha' });
    }
};

/**
 * PUT /api/fichas-costo/:referencia
 */
const updateFichaCosto = async (req, res) => {
    try {
        const { referencia } = req.params;
        const {
            descripcion, marca, novedad, muestra1, muestra2, observaciones, foto1, foto2,
            materiaPrima, manoObra, insumosDirectos, insumosIndirectos, provisiones,
            precioVenta, rentabilidad
        } = req.body;

        const existe = await query('SELECT id FROM fichas_costo WHERE referencia = $1', [referencia]);
        if (existe.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Ficha no encontrada' });
        }

        const secciones = {
            materia_prima: materiaPrima || [],
            mano_obra: manoObra || [],
            insumos_directos: insumosDirectos || [],
            insumos_indirectos: insumosIndirectos || [],
            provisiones: provisiones || []
        };
        const totales = calcularTotales(secciones);
        const valores = calcularValoresFinancieros(totales.costo_total, precioVenta, rentabilidad);

        await transaction(async (client) => {
            await client.query(`
                UPDATE fichas_costo
                SET descripcion=$1, marca=$2, novedad=$3, muestra_1=$4, muestra_2=$5,
                    observaciones=$6, foto_1=$7, foto_2=$8,
                    materia_prima=$9, mano_obra=$10, insumos_directos=$11, insumos_indirectos=$12, provisiones=$13,
                    total_materia_prima=$14, total_mano_obra=$15, total_insumos_directos=$16,
                    total_insumos_indirectos=$17, total_provisiones=$18, costo_total=$19,
                    precio_venta=$20, rentabilidad=$21, margen_ganancia=$22, costo_contabilizar=$23,
                    desc_0_precio=$24, desc_0_rent=$25, desc_5_precio=$26, desc_5_rent=$27,
                    desc_10_precio=$28, desc_10_rent=$29, desc_15_precio=$30, desc_15_rent=$31
                WHERE referencia=$32
            `, [
                descripcion, marca, novedad, muestra1, muestra2, observaciones, foto1, foto2,
                JSON.stringify(secciones.materia_prima), JSON.stringify(secciones.mano_obra),
                JSON.stringify(secciones.insumos_directos), JSON.stringify(secciones.insumos_indirectos),
                JSON.stringify(secciones.provisiones),
                totales.total_materia_prima, totales.total_mano_obra, totales.total_insumos_directos,
                totales.total_insumos_indirectos, totales.total_provisiones, totales.costo_total,
                valores.precio_venta, valores.rentabilidad, valores.margen_ganancia, totales.costo_contabilizar,
                valores.desc_0_precio, valores.desc_0_rent, valores.desc_5_precio, valores.desc_5_rent,
                valores.desc_10_precio, valores.desc_10_rent, valores.desc_15_precio, valores.desc_15_rent,
                referencia
            ]);
        });

        // Sincronizar a product_references (fuera de la transacción)
        try {
            const fichaCompleta = await query(`
                SELECT fc.*, d.nombre as disenadora_nombre
                FROM fichas_costo fc
                LEFT JOIN fichas_diseno fd ON fc.ficha_diseno_id = fd.id
                LEFT JOIN disenadoras d ON fd.disenadora_id = d.id
                WHERE fc.referencia = $1
            `, [referencia]);

            if (fichaCompleta.rows.length > 0) {
                const f = fichaCompleta.rows[0];
                await sincronizarProductReference(referencia, {
                    descripcion: f.descripcion,
                    precioVenta: parseFloat(f.precio_venta),
                    disenadoraNombre: f.disenadora_nombre,
                    materiaPrima: f.materia_prima
                });
            }
        } catch (syncError) {
            console.error('⚠️ Error sincronizando product_references:', syncError);
        }

        return res.json({ success: true, message: 'Ficha actualizada exitosamente' });
    } catch (error) {
        console.error('❌ Error actualizando ficha costo:', error);
        return res.status(500).json({ success: false, message: 'Error al actualizar ficha' });
    }
};

/**
 * POST /api/fichas-costo/:referencia/cortes
 */
const crearCorte = async (req, res) => {
    try {
        const { referencia } = req.params;
        const {
            numeroCorte, fichaCorte, fechaCorte, cantidadCortada,
            materiaPrima, manoObra, insumosDirectos, insumosIndirectos, provisiones,
            precioVenta, rentabilidad, createdBy
        } = req.body;

        const fichaResult = await query('SELECT * FROM fichas_costo WHERE referencia = $1', [referencia]);
        if (fichaResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Ficha no encontrada' });
        }
        const ficha = fichaResult.rows[0];

        const existeCorte = await query('SELECT id FROM fichas_cortes WHERE ficha_costo_id = $1 AND numero_corte = $2', [ficha.id, numeroCorte]);
        if (existeCorte.rows.length > 0) {
            return res.status(400).json({ success: false, message: `El corte #${numeroCorte} ya existe` });
        }

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

        let corteData;
        await transaction(async (client) => {
            const corteResult = await client.query(`
                INSERT INTO fichas_cortes (
                    ficha_costo_id, numero_corte, ficha_corte, fecha_corte, cantidad_cortada,
                    materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones,
                    total_materia_prima, total_mano_obra, total_insumos_directos,
                    total_insumos_indirectos, total_provisiones, costo_real,
                    precio_venta, rentabilidad, costo_proyectado, diferencia, margen_utilidad, created_by
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                    $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
                ) RETURNING id, numero_corte, costo_real
            `, [
                ficha.id, numeroCorte, fichaCorte, fechaCorte, cantidadCortada,
                JSON.stringify(secciones.materia_prima), JSON.stringify(secciones.mano_obra),
                JSON.stringify(secciones.insumos_directos), JSON.stringify(secciones.insumos_indirectos),
                JSON.stringify(secciones.provisiones),
                totales.total_materia_prima, totales.total_mano_obra, totales.total_insumos_directos,
                totales.total_insumos_indirectos, totales.total_provisiones, costoReal,
                valores.precio_venta, valores.rentabilidad,
                costoProyectado, diferencia, margenUtilidad, createdBy
            ]);

            await client.query('UPDATE fichas_costo SET cantidad_total_cortada = cantidad_total_cortada + $1 WHERE id = $2', [cantidadCortada, ficha.id]);
            corteData = corteResult.rows[0];
        });

        return res.json({
            success: true,
            data: { id: corteData.id, numeroCorte: corteData.numero_corte, costoReal: parseFloat(corteData.costo_real) },
            message: `Corte #${numeroCorte} asentado exitosamente`
        });
    } catch (error) {
        console.error('❌ Error creando corte:', error);
        return res.status(500).json({ success: false, message: 'Error al crear corte' });
    }
};

/**
 * PUT /api/fichas-costo/:referencia/cortes/:numeroCorte
 */
const updateCorte = async (req, res) => {
    try {
        const { referencia, numeroCorte } = req.params;
        const {
            fichaCorte, fechaCorte, cantidadCortada, materiaPrima, manoObra,
            insumosDirectos, insumosIndirectos, provisiones, precioVenta, rentabilidad
        } = req.body;

        const fichaResult = await query('SELECT id, costo_total FROM fichas_costo WHERE referencia = $1', [referencia]);
        if (fichaResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Ficha no encontrada' });
        }
        const ficha = fichaResult.rows[0];

        const corteResult = await query('SELECT * FROM fichas_cortes WHERE ficha_costo_id = $1 AND numero_corte = $2', [ficha.id, numeroCorte]);
        if (corteResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Corte no encontrado' });
        }
        const corteAnterior = corteResult.rows[0];

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

        await transaction(async (client) => {
            await client.query(`
                UPDATE fichas_cortes
                SET ficha_corte=$1, fecha_corte=$2, cantidad_cortada=$3,
                    materia_prima=$4, mano_obra=$5, insumos_directos=$6, insumos_indirectos=$7, provisiones=$8,
                    total_materia_prima=$9, total_mano_obra=$10, total_insumos_directos=$11,
                    total_insumos_indirectos=$12, total_provisiones=$13, costo_real=$14,
                    precio_venta=$15, rentabilidad=$16, diferencia=$17, margen_utilidad=$18
                WHERE ficha_costo_id=$19 AND numero_corte=$20
            `, [
                fichaCorte, fechaCorte, cantidadCortada,
                JSON.stringify(secciones.materia_prima), JSON.stringify(secciones.mano_obra),
                JSON.stringify(secciones.insumos_directos), JSON.stringify(secciones.insumos_indirectos),
                JSON.stringify(secciones.provisiones),
                totales.total_materia_prima, totales.total_mano_obra, totales.total_insumos_directos,
                totales.total_insumos_indirectos, totales.total_provisiones, costoReal,
                valores.precio_venta, valores.rentabilidad, diferencia, margenUtilidad,
                ficha.id, numeroCorte
            ]);

            const diferenciaCantidad = cantidadCortada - parseInt(corteAnterior.cantidad_cortada);
            if (diferenciaCantidad !== 0) {
                await client.query('UPDATE fichas_costo SET cantidad_total_cortada = cantidad_total_cortada + $1 WHERE id = $2', [diferenciaCantidad, ficha.id]);
            }
        });

        return res.json({ success: true, message: `Corte #${numeroCorte} actualizado exitosamente` });
    } catch (error) {
        console.error('❌ Error actualizando corte:', error);
        return res.status(500).json({ success: false, message: 'Error al actualizar corte' });
    }
};

/**
 * DELETE /api/fichas-costo/:referencia
 */
const deleteFichaCosto = async (req, res) => {
    try {
        const { referencia } = req.params;
        const user = req.user;

        if (user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Solo administradores pueden eliminar fichas' });
        }

        const result = await query('DELETE FROM fichas_costo WHERE referencia = $1 RETURNING id', [referencia]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Ficha no encontrada' });
        }

        return res.json({ success: true, message: 'Ficha eliminada exitosamente' });
    } catch (error) {
        console.error('❌ Error eliminando ficha costo:', error);
        return res.status(500).json({ success: false, message: 'Error al eliminar ficha' });
    }
};

module.exports = {
    importarFichaDiseno,
    createFichaCosto,
    updateFichaCosto,
    crearCorte,
    updateCorte,
    deleteFichaCosto,
    sincronizarProductReference
};
