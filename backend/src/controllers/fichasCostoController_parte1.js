// ============================================
// CONTROLADOR: Fichas de Costo - PARTE 1
// Gestión de fichas con precios y rentabilidad
// ============================================

const { query } = require('../config/database');

// ============ FUNCIONES AUXILIARES ============

const ajustarA900 = (valor) => {
    if (valor <= 0) return 0;
    const miles = Math.ceil(valor / 1000);
    return miles * 1000 - 100;
};

const calcularTotales = (secciones) => {
    const totales = {};
    for (const [key, items] of Object.entries(secciones)) {
        totales[`total_${key}`] = items.reduce((acc, item) => acc + (item.total || 0), 0);
    }
    totales.costo_total = Object.values(totales).reduce((a, b) => a + b, 0);
    totales.costo_contabilizar = totales.costo_total - (totales.total_provisiones || 0);
    return totales;
};

const calcularPrecioVenta = (costoTotal, rentabilidad) =>
    ajustarA900(costoTotal * (1 + rentabilidad / 100));

const calcularRentabilidad = (precioVenta, costoTotal) => {
    if (costoTotal === 0) return 0;
    return ((precioVenta / costoTotal) - 1) * 100;
};

const calcularDescuentos = (precioVenta, costoTotal) => {
    const descuentos = {};
    [0, 5, 10, 15].forEach(desc => {
        const precio = ajustarA900(precioVenta * (1 - desc / 100));
        const rent = calcularRentabilidad(precio, costoTotal);
        descuentos[`desc_${desc}_precio`] = precio;
        descuentos[`desc_${desc}_rent`] = rent;
    });
    return descuentos;
};

const calcularMargenGanancia = (precioVenta) => ajustarA900(precioVenta * 0.35);

const calcularValoresFinancieros = (costoTotal, precioVenta = null, rentabilidad = null) => {
    let precio, rent;
    if (precioVenta) {
        precio = precioVenta;
        rent = calcularRentabilidad(precio, costoTotal);
    } else if (rentabilidad) {
        rent = rentabilidad;
        precio = calcularPrecioVenta(costoTotal, rent);
    } else {
        rent = 49;
        precio = calcularPrecioVenta(costoTotal, rent);
    }
    const descuentos = calcularDescuentos(precio, costoTotal);
    const margen = calcularMargenGanancia(precio);
    return { precio_venta: precio, rentabilidad: rent, margen_ganancia: margen, ...descuentos };
};

// ============ ENDPOINTS ============

/**
 * GET /api/fichas-costo
 */
const getFichasCosto = async (req, res) => {
    try {
        const result = await query(`
            SELECT
                fc.*,
                fd.disenadora_id,
                d.nombre as disenadora_nombre,
                (SELECT COUNT(*) FROM fichas_cortes WHERE ficha_costo_id = fc.id) as num_cortes
            FROM fichas_costo fc
            LEFT JOIN fichas_diseno fd ON fc.ficha_diseno_id = fd.id
            LEFT JOIN disenadoras d ON fd.disenadora_id = d.id
            ORDER BY fc.created_at DESC
        `);

        const fichas = result.rows.map(f => ({
            id: f.id,
            referencia: f.referencia,
            fichaDisenoId: f.ficha_diseno_id,
            disenadoraId: f.disenadora_id,
            disenadoraNombre: f.disenadora_nombre,
            descripcion: f.descripcion,
            marca: f.marca,
            novedad: f.novedad,
            muestra1: f.muestra_1,
            muestra2: f.muestra_2,
            observaciones: f.observaciones,
            foto1: f.foto_1,
            foto2: f.foto_2,
            materiaPrima: f.materia_prima,
            manoObra: f.mano_obra,
            insumosDirectos: f.insumos_directos,
            insumosIndirectos: f.insumos_indirectos,
            provisiones: f.provisiones,
            totalMateriaPrima: parseFloat(f.total_materia_prima),
            totalManoObra: parseFloat(f.total_mano_obra),
            totalInsumosDirectos: parseFloat(f.total_insumos_directos),
            totalInsumosIndirectos: parseFloat(f.total_insumos_indirectos),
            totalProvisiones: parseFloat(f.total_provisiones),
            costoTotal: parseFloat(f.costo_total),
            precioVenta: parseFloat(f.precio_venta),
            rentabilidad: parseFloat(f.rentabilidad),
            margenGanancia: parseFloat(f.margen_ganancia),
            costoContabilizar: parseFloat(f.costo_contabilizar),
            desc0Precio: parseFloat(f.desc_0_precio),
            desc0Rent: parseFloat(f.desc_0_rent),
            desc5Precio: parseFloat(f.desc_5_precio),
            desc5Rent: parseFloat(f.desc_5_rent),
            desc10Precio: parseFloat(f.desc_10_precio),
            desc10Rent: parseFloat(f.desc_10_rent),
            desc15Precio: parseFloat(f.desc_15_precio),
            desc15Rent: parseFloat(f.desc_15_rent),
            cantidadTotalCortada: parseInt(f.cantidad_total_cortada),
            numCortes: parseInt(f.num_cortes),
            createdBy: f.created_by,
            createdAt: f.created_at,
            updatedAt: f.updated_at
        }));

        return res.json({ success: true, data: fichas });
    } catch (error) {
        console.error('❌ Error obteniendo fichas costo:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener fichas' });
    }
};

/**
 * GET /api/fichas-costo/:referencia
 */
const getFichaCosto = async (req, res) => {
    try {
        const { referencia } = req.params;

        const fichaResult = await query(`
            SELECT
                fc.*,
                fd.disenadora_id,
                d.nombre as disenadora_nombre
            FROM fichas_costo fc
            LEFT JOIN fichas_diseno fd ON fc.ficha_diseno_id = fd.id
            LEFT JOIN disenadoras d ON fd.disenadora_id = d.id
            WHERE fc.referencia = $1
        `, [referencia]);

        if (fichaResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Ficha no encontrada' });
        }

        const f = fichaResult.rows[0];

        const cortesResult = await query(`
            SELECT * FROM fichas_cortes WHERE ficha_costo_id = $1 ORDER BY numero_corte ASC
        `, [f.id]);

        const cortes = cortesResult.rows.map(c => ({
            id: c.id,
            numeroCorte: c.numero_corte,
            fechaCorte: c.fecha_corte,
            cantidadCortada: parseInt(c.cantidad_cortada),
            materiaPrima: c.materia_prima,
            manoObra: c.mano_obra,
            insumosDirectos: c.insumos_directos,
            insumosIndirectos: c.insumos_indirectos,
            provisiones: c.provisiones,
            totalMateriaPrima: parseFloat(c.total_materia_prima),
            totalManoObra: parseFloat(c.total_mano_obra),
            totalInsumosDirectos: parseFloat(c.total_insumos_directos),
            totalInsumosIndirectos: parseFloat(c.total_insumos_indirectos),
            totalProvisiones: parseFloat(c.total_provisiones),
            costoReal: parseFloat(c.costo_real),
            precioVenta: parseFloat(c.precio_venta),
            rentabilidad: parseFloat(c.rentabilidad),
            costoProyectado: parseFloat(c.costo_proyectado),
            diferencia: parseFloat(c.diferencia),
            margenUtilidad: parseFloat(c.margen_utilidad),
            createdBy: c.created_by,
            createdAt: c.created_at
        }));

        const ficha = {
            id: f.id,
            referencia: f.referencia,
            fichaDisenoId: f.ficha_diseno_id,
            disenadoraId: f.disenadora_id,
            disenadoraNombre: f.disenadora_nombre,
            descripcion: f.descripcion,
            marca: f.marca,
            novedad: f.novedad,
            muestra1: f.muestra_1,
            muestra2: f.muestra_2,
            observaciones: f.observaciones,
            foto1: f.foto_1,
            foto2: f.foto_2,
            materiaPrima: f.materia_prima,
            manoObra: f.mano_obra,
            insumosDirectos: f.insumos_directos,
            insumosIndirectos: f.insumos_indirectos,
            provisiones: f.provisiones,
            totalMateriaPrima: parseFloat(f.total_materia_prima),
            totalManoObra: parseFloat(f.total_mano_obra),
            totalInsumosDirectos: parseFloat(f.total_insumos_directos),
            totalInsumosIndirectos: parseFloat(f.total_insumos_indirectos),
            totalProvisiones: parseFloat(f.total_provisiones),
            costoTotal: parseFloat(f.costo_total),
            precioVenta: parseFloat(f.precio_venta),
            rentabilidad: parseFloat(f.rentabilidad),
            margenGanancia: parseFloat(f.margen_ganancia),
            costoContabilizar: parseFloat(f.costo_contabilizar),
            desc0Precio: parseFloat(f.desc_0_precio),
            desc0Rent: parseFloat(f.desc_0_rent),
            desc5Precio: parseFloat(f.desc_5_precio),
            desc5Rent: parseFloat(f.desc_5_rent),
            desc10Precio: parseFloat(f.desc_10_precio),
            desc10Rent: parseFloat(f.desc_10_rent),
            desc15Precio: parseFloat(f.desc_15_precio),
            desc15Rent: parseFloat(f.desc_15_rent),
            cantidadTotalCortada: parseInt(f.cantidad_total_cortada),
            cortes,
            createdBy: f.created_by,
            createdAt: f.created_at,
            updatedAt: f.updated_at
        };

        return res.json({ success: true, data: ficha });
    } catch (error) {
        console.error('❌ Error obteniendo ficha costo:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener ficha' });
    }
};

module.exports = {
    getFichasCosto,
    getFichaCosto,
    calcularValoresFinancieros,
    calcularTotales,
    ajustarA900
};
