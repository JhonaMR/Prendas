// ============================================
// CONTROLADOR: Fichas de Costo - PARTE 2
// Importar, Crear, Actualizar, Cortes
// ============================================

const { query, transaction } = require('../config/database');

const getLineaValida = (...valores) => {
    for (const v of valores) {
        if (v && typeof v === 'string' && v.trim() !== '' && v.trim() !== 'Elegir' && v.trim() !== 'null' && v.trim() !== 'undefined') {
            return v.trim();
        }
    }
    return null;
};
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

        materiaPrima.forEach(item => {
            if ((item.tipo === 'TELA' || item.tipo === 'SESGO') && item.concepto) {
                if (!telas[item.concepto]) {
                    telas[item.concepto] = 0;
                }
                telas[item.concepto] += item.cant || 0;
            }
        });

        // Convertir a array ordenado
        const telasArray = Object.entries(telas).map(([nombre, cantidad]) => ({ nombre, cantidad }));

        console.log(`✅ Telas sincronizadas para ${referencia}`);

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
        // Al importar siempre calcular precio al 35% de rentabilidad, ignorando precio de diseño
        const valores = calcularValoresFinancieros(parseFloat(fd.costo_total), null, 35);
        const lineaImportada = getLineaValida(fd.linea);

        let fichaData;
        await transaction(async (client) => {
            const result = await client.query(`
                INSERT INTO fichas_costo (
                    referencia, ficha_diseno_id,
                    linea, descripcion, marca, novedad, muestra_1, muestra_2, observaciones,
                    foto_1, foto_2, foto_3, archivo_psd,
                    materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones,
                    total_materia_prima, total_mano_obra, total_insumos_directos,
                    total_insumos_indirectos, total_provisiones, costo_total,
                    precio_venta, rentabilidad, margen_ganancia, costo_contabilizar,
                    desc_0_precio, desc_0_rent, desc_5_precio, desc_5_rent,
                    desc_10_precio, desc_10_rent, desc_15_precio, desc_15_rent,
                    created_by
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
                    $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23,
                    $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37
                ) RETURNING id, referencia, linea, costo_total, precio_venta
            `, [
                fd.referencia, fd.id,
                fd.linea, fd.descripcion, fd.marca, fd.novedad, fd.muestra_1, fd.muestra_2, fd.observaciones,
                fd.foto_1, fd.foto_2, fd.foto_3 || null, fd.archivo_psd || null,
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
                linea: fichaData.linea,
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
            referencia, linea, descripcion, marca, novedad, muestra1, muestra2, observaciones,
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
        const valores = calcularValoresFinancieros(totales.costo_total, null, rentabilidad || 35);
        const lineaFinal = getLineaValida(linea);

        let fichaData;
        await transaction(async (client) => {
            const result = await client.query(`
                INSERT INTO fichas_costo (
                    referencia, linea, descripcion, marca, novedad, muestra_1, muestra_2, observaciones,
                    foto_1, foto_2, materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones,
                    total_materia_prima, total_mano_obra, total_insumos_directos,
                    total_insumos_indirectos, total_provisiones, costo_total,
                    precio_venta, rentabilidad, margen_ganancia, costo_contabilizar,
                    desc_0_precio, desc_0_rent, desc_5_precio, desc_5_rent,
                    desc_10_precio, desc_10_rent, desc_15_precio, desc_15_rent,
                    created_by
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                    $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                    $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34
                ) RETURNING id, referencia, linea, costo_total, precio_venta
            `, [
                referencia, lineaFinal, descripcion, marca, novedad, muestra1, muestra2, observaciones,
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
            linea, descripcion, marca, novedad, muestra1, muestra2, observaciones, foto1, foto2, foto3, archivoPsd,
            materiaPrima, manoObra, insumosDirectos, insumosIndirectos, provisiones,
            precioVenta, rentabilidad, estadoRevision
        } = req.body;

        const existe = await query(`
            SELECT fc.id, fc.linea, fd.linea as disenadora_linea
            FROM fichas_costo fc
            LEFT JOIN fichas_diseno fd ON fc.ficha_diseno_id = fd.id
            WHERE fc.referencia = $1
        `, [referencia]);

        if (existe.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Ficha no encontrada' });
        }

        const lineaFinal = getLineaValida(linea, existe.rows[0].linea, existe.rows[0].disenadora_linea);

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
                SET linea=$1, descripcion=$2, marca=$3, novedad=$4, muestra_1=$5, muestra_2=$6,
                    observaciones=$7, foto_1=$8, foto_2=$9, foto_3=$10, archivo_psd=$11,
                    materia_prima=$12, mano_obra=$13, insumos_directos=$14, insumos_indirectos=$15, provisiones=$16,
                    total_materia_prima=$17, total_mano_obra=$18, total_insumos_directos=$19,
                    total_insumos_indirectos=$20, total_provisiones=$21, costo_total=$22,
                    precio_venta=$23, rentabilidad=$24, margen_ganancia=$25, costo_contabilizar=$26,
                    desc_0_precio=$27, desc_0_rent=$28, desc_5_precio=$29, desc_5_rent=$30,
                    desc_10_precio=$31, desc_10_rent=$32, desc_15_precio=$33, desc_15_rent=$34,
                    estado_revision=$35
                WHERE referencia=$36
            `, [
                lineaFinal, descripcion, marca, novedad, muestra1, muestra2, observaciones, foto1, foto2,
                foto3 !== undefined ? foto3 : null,
                archivoPsd !== undefined ? archivoPsd : null,
                JSON.stringify(secciones.materia_prima), JSON.stringify(secciones.mano_obra),
                JSON.stringify(secciones.insumos_directos), JSON.stringify(secciones.insumos_indirectos),
                JSON.stringify(secciones.provisiones),
                totales.total_materia_prima, totales.total_mano_obra, totales.total_insumos_directos,
                totales.total_insumos_indirectos, totales.total_provisiones, totales.costo_total,
                valores.precio_venta, valores.rentabilidad, valores.margen_ganancia, totales.costo_contabilizar,
                valores.desc_0_precio, valores.desc_0_rent, valores.desc_5_precio, valores.desc_5_rent,
                valores.desc_10_precio, valores.desc_10_rent, valores.desc_15_precio, valores.desc_15_rent,
                estadoRevision || null,
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
 * DELETE /api/fichas-costo/:referencia/cortes/:numeroCorte
 */
const deleteCorte = async (req, res) => {
    try {
        const { referencia, numeroCorte } = req.params;

        const fichaResult = await query('SELECT id, cantidad_total_cortada FROM fichas_costo WHERE referencia = $1', [referencia]);
        if (fichaResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Ficha no encontrada' });
        }
        const ficha = fichaResult.rows[0];

        const corteResult = await query('SELECT id, cantidad_cortada FROM fichas_cortes WHERE ficha_costo_id = $1 AND numero_corte = $2', [ficha.id, numeroCorte]);
        if (corteResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Corte no encontrado' });
        }
        const cantidadCortada = parseInt(corteResult.rows[0].cantidad_cortada);

        await transaction(async (client) => {
            await client.query('DELETE FROM fichas_cortes WHERE ficha_costo_id = $1 AND numero_corte = $2', [ficha.id, numeroCorte]);
            await client.query('UPDATE fichas_costo SET cantidad_total_cortada = cantidad_total_cortada - $1 WHERE id = $2', [cantidadCortada, ficha.id]);
        });

        return res.json({ success: true, message: `Corte #${numeroCorte} eliminado exitosamente` });
    } catch (error) {
        console.error('❌ Error eliminando corte:', error);
        return res.status(500).json({ success: false, message: 'Error al eliminar corte' });
    }
};


const deleteFichaCosto = async (req, res) => {
    try {
        const { referencia } = req.params;
        const user = req.user;

        if (user.role !== 'admin' && user.role !== 'soporte') {
            return res.status(403).json({ success: false, message: 'Solo administradores pueden eliminar fichas' });
        }

        const result = await query('DELETE FROM fichas_costo WHERE referencia = $1 RETURNING id', [referencia]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Ficha no encontrada' });
        }

        // Resetear el estado importada en fichas_diseno
        await query('UPDATE fichas_diseno SET importada = false WHERE referencia = $1', [referencia]);

        return res.json({ success: true, message: 'Ficha eliminada exitosamente' });
    } catch (error) {
        console.error('❌ Error eliminando ficha costo:', error);
        return res.status(500).json({ success: false, message: 'Error al eliminar ficha' });
    }
};

const validarReferencia = async (req, res) => {
    try {
        const { referencia } = req.params;
        if (!referencia) {
            return res.status(400).json({ success: false, message: 'Referencia es requerida' });
        }

        const existeCosto = await query('SELECT id FROM fichas_costo WHERE referencia = $1', [referencia]);
        if (existeCosto.rows.length > 0) {
            return res.json({ success: true, exists: true, message: 'La referencia ya existe en Fichas de Costos' });
        }

        const existeDiseno = await query('SELECT id FROM fichas_diseno WHERE referencia = $1', [referencia]);
        if (existeDiseno.rows.length > 0) {
            return res.json({ success: true, exists: true, message: 'La referencia ya existe en Fichas de Diseño' });
        }

        return res.json({ success: true, exists: false, message: 'Referencia disponible' });
    } catch (error) {
        console.error('❌ Error validando referencia:', error);
        return res.status(500).json({ success: false, message: 'Error interno del servidor al validar referencia' });
    }
};

const duplicarFichaCosto = async (req, res) => {
    try {
        const { referencia } = req.params; // La de origen
        const { nuevaReferencia, disenadoraId, duplicarCortes } = req.body;
        const createdBy = req.user.name;

        if (!nuevaReferencia || !disenadoraId) {
            return res.status(400).json({ success: false, message: 'Nueva referencia y diseñadora son obligatorias' });
        }

        // 1. Validar que la nueva referencia no exista
        const existeCosto = await query('SELECT id FROM fichas_costo WHERE referencia = $1', [nuevaReferencia]);
        const existeDiseno = await query('SELECT id FROM fichas_diseno WHERE referencia = $1', [nuevaReferencia]);
        if (existeCosto.rows.length > 0 || existeDiseno.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'La nueva referencia ya existe en el sistema' });
        }

        // 2. Obtener ficha original de costo
        const fichaCostoResult = await query('SELECT * FROM fichas_costo WHERE referencia = $1', [referencia]);
        if (fichaCostoResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Ficha de costo original no encontrada' });
        }
        const sourceCosto = fichaCostoResult.rows[0];

        // 3. Obtener diseño original (si existe)
        let sourceDiseno = null;
        if (sourceCosto.ficha_diseno_id) {
            const fdResult = await query('SELECT * FROM fichas_diseno WHERE id = $1', [sourceCosto.ficha_diseno_id]);
            if (fdResult.rows.length > 0) {
                sourceDiseno = fdResult.rows[0];
            }
        }

        let newFichaCostoId;
        await transaction(async (client) => {
            // A. Crear la ficha de diseño correspondiente
            // Usamos datos de la ficha original de diseño si existe, sino de la ficha de costos
            const desc = sourceDiseno?.descripcion || sourceCosto.descripcion || '';
            const marca = sourceDiseno?.marca || sourceCosto.marca || '';
            const novedad = sourceDiseno?.novedad || sourceCosto.novedad || '';
            const m1 = sourceDiseno?.muestra_1 || sourceCosto.muestra_1 || '';
            const m2 = sourceDiseno?.muestra_2 || sourceCosto.muestra_2 || '';
            const obs = sourceDiseno?.observaciones || sourceCosto.observaciones || '';
            
            const matPrima = sourceDiseno?.materia_prima || sourceCosto.materia_prima || [];
            const manObra = sourceDiseno?.mano_obra || sourceCosto.mano_obra || [];
            const insDirectos = sourceDiseno?.insumos_directos || sourceCosto.insumos_directos || [];
            const insIndirectos = sourceDiseno?.insumos_indirectos || sourceCosto.insumos_indirectos || [];
            const provs = sourceDiseno?.provisiones || sourceCosto.provisiones || [];

            const tMP = sourceDiseno?.total_materia_prima || sourceCosto.total_materia_prima || 0;
            const tMO = sourceDiseno?.total_mano_obra || sourceCosto.total_mano_obra || 0;
            const tID = sourceDiseno?.total_insumos_directos || sourceCosto.total_insumos_directos || 0;
            const tII = sourceDiseno?.total_insumos_indirectos || sourceCosto.total_insumos_indirectos || 0;
            const tPR = sourceDiseno?.total_provisiones || sourceCosto.total_provisiones || 0;
            const costTotal = sourceDiseno?.costo_total || sourceCosto.costo_total || 0;

            const lineaVar = getLineaValida(sourceDiseno?.linea, sourceCosto?.linea);

            const newFichaDisenoResult = await client.query(`
                INSERT INTO fichas_diseno (
                    referencia, disenadora_id, linea, descripcion, marca, novedad,
                    muestra_1, muestra_2, observaciones, foto_1, foto_2, foto_3, archivo_psd,
                    materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones,
                    total_materia_prima, total_mano_obra, total_insumos_directos,
                    total_insumos_indirectos, total_provisiones, costo_total, importada, created_by
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, NULL, NULL, NULL, NULL,
                    $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, true, $21
                ) RETURNING id
            `, [
                nuevaReferencia, disenadoraId, lineaVar, desc, marca, novedad,
                m1, m2, obs,
                JSON.stringify(matPrima), JSON.stringify(manObra), JSON.stringify(insDirectos), JSON.stringify(insIndirectos), JSON.stringify(provs),
                tMP, tMO, tID, tII, tPR, costTotal, createdBy
            ]);
            const newFichaDisenoId = newFichaDisenoResult.rows[0].id;

            // B. Crear la ficha de costo correspondiente
            const cantTotalCortada = duplicarCortes ? parseInt(sourceCosto.cantidad_total_cortada || 0) : 0;

            const newFichaCostoResult = await client.query(`
                INSERT INTO fichas_costo (
                    referencia, ficha_diseno_id, linea, descripcion, marca, novedad, muestra_1, muestra_2, observaciones,
                    foto_1, foto_2, foto_3, archivo_psd, materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones,
                    total_materia_prima, total_mano_obra, total_insumos_directos, total_insumos_indirectos, total_provisiones, costo_total,
                    precio_venta, rentabilidad, margen_ganancia, costo_contabilizar,
                    desc_0_precio, desc_0_rent, desc_5_precio, desc_5_rent, desc_10_precio, desc_10_rent, desc_15_precio, desc_15_rent,
                    cantidad_total_cortada, created_by
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9,
                    NULL, NULL, NULL, NULL, $10, $11, $12, $13, $14,
                    $15, $16, $17, $18, $19, $20,
                    $21, $22, $23, $24,
                    $25, $26, $27, $28, $29, $30, $31, $32,
                    $33, $34
                ) RETURNING id
            `, [
                nuevaReferencia, newFichaDisenoId, lineaVar, desc, marca, novedad, m1, m2, obs,
                JSON.stringify(sourceCosto.materia_prima || []), JSON.stringify(sourceCosto.mano_obra || []), JSON.stringify(sourceCosto.insumos_directos || []), JSON.stringify(sourceCosto.insumos_indirectos || []), JSON.stringify(sourceCosto.provisiones || []),
                sourceCosto.total_materia_prima, sourceCosto.total_mano_obra, sourceCosto.total_insumos_directos, sourceCosto.total_insumos_indirectos, sourceCosto.total_provisiones, sourceCosto.costo_total,
                sourceCosto.precio_venta, sourceCosto.rentabilidad, sourceCosto.margen_ganancia, sourceCosto.costo_contabilizar,
                sourceCosto.desc_0_precio, sourceCosto.desc_0_rent, sourceCosto.desc_5_precio, sourceCosto.desc_5_rent, sourceCosto.desc_10_precio, sourceCosto.desc_10_rent, sourceCosto.desc_15_precio, sourceCosto.desc_15_rent,
                cantTotalCortada, createdBy
            ]);
            newFichaCostoId = newFichaCostoResult.rows[0].id;

            // C. Duplicar los cortes si corresponde
            if (duplicarCortes) {
                const originalCortes = await client.query('SELECT * FROM fichas_cortes WHERE ficha_costo_id = $1 ORDER BY numero_corte ASC', [sourceCosto.id]);
                for (const corte of originalCortes.rows) {
                    await client.query(`
                        INSERT INTO fichas_cortes (
                            ficha_costo_id, numero_corte, ficha_corte, fecha_corte, cantidad_cortada,
                            materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones,
                            total_materia_prima, total_mano_obra, total_insumos_directos, total_insumos_indirectos, total_provisiones, costo_real,
                            precio_venta, rentabilidad, costo_proyectado, diferencia, margen_utilidad, created_by
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
                        )
                    `, [
                        newFichaCostoId, corte.numero_corte, corte.ficha_corte, corte.fecha_corte, corte.cantidad_cortada,
                        JSON.stringify(corte.materia_prima || []), JSON.stringify(corte.mano_obra || []), JSON.stringify(corte.insumos_directos || []), JSON.stringify(corte.insumos_indirectos || []), JSON.stringify(corte.provisiones || []),
                        corte.total_materia_prima, corte.total_mano_obra, corte.total_insumos_directos, corte.total_insumos_indirectos, corte.total_provisiones, corte.costo_real,
                        corte.precio_venta, corte.rentabilidad, corte.costo_proyectado, corte.diferencia, corte.margen_utilidad, createdBy
                    ]);
                }
            }
        });

        // 4. Sincronizar product_references (fuera de la transacción)
        try {
            const disenadoraNombreResult = await query('SELECT nombre FROM disenadoras WHERE id = $1', [disenadoraId]);
            const disenadoraNombre = disenadoraNombreResult.rows[0]?.nombre || '';
            await sincronizarProductReference(nuevaReferencia, {
                descripcion: sourceCosto.descripcion,
                precioVenta: sourceCosto.precio_venta,
                disenadoraNombre: disenadoraNombre,
                materiaPrima: sourceCosto.materia_prima
            });
        } catch (syncError) {
            console.error('⚠️ Error sincronizando product_references al duplicar:', syncError);
        }

        return res.json({
            success: true,
            message: 'Ficha de costo duplicada exitosamente',
            data: { referencia: nuevaReferencia }
        });
    } catch (error) {
        console.error('❌ Error duplicando ficha costo:', error);
        return res.status(500).json({ success: false, message: 'Error interno al duplicar ficha de costo' });
    }
};

module.exports = {
    importarFichaDiseno,
    createFichaCosto,
    updateFichaCosto,
    crearCorte,
    updateCorte,
    deleteCorte,
    deleteFichaCosto,
    sincronizarProductReference,
    validarReferencia,
    duplicarFichaCosto
};
