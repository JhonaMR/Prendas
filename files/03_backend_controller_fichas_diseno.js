// ============================================
// CONTROLADOR: Fichas de Diseño
// Gestión de fichas creadas por diseñadoras
// ============================================

const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============ CONFIGURACIÓN MULTER (Subida de fotos) ============
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../public/images/references');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // El nombre se asigna desde el frontend como: {referencia}.jpg o {referencia}-2.jpg
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes JPG, JPEG, PNG'));
    }
});

// ============ FUNCIONES AUXILIARES ============

/**
 * Calcular totales de secciones
 */
const calcularTotales = (secciones) => {
    const totales = {};
    
    for (const [key, items] of Object.entries(secciones)) {
        totales[`total_${key}`] = items.reduce((acc, item) => {
            return acc + (item.total || 0);
        }, 0);
    }
    
    // Costo total es la suma de todas las secciones
    totales.costo_total = Object.values(totales).reduce((a, b) => a + b, 0);
    
    return totales;
};

/**
 * Sincronizar con product_references
 */
const sincronizarProductReference = async (referencia, fichaData) => {
    try {
        // Verificar si existe
        const existe = await pool.query(
            'SELECT id FROM product_references WHERE id = $1',
            [referencia]
        );
        
        if (existe.rows.length === 0) {
            // Extraer telas de materia_prima
            const telas = fichaData.materia_prima
                .filter(m => m.tipo === 'TELA')
                .slice(0, 2);
            
            // Crear referencia sin correría
            await pool.query(`
                INSERT INTO product_references (
                    id, description, price, designer,
                    cloth1, avg_cloth1, cloth2, avg_cloth2
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
                referencia,
                fichaData.descripcion || '',
                0, // Sin precio inicial
                fichaData.marca || '',
                telas[0]?.concepto || null,
                telas[0]?.cant || null,
                telas[1]?.concepto || null,
                telas[1]?.cant || null
            ]);
            
            console.log(`✅ Referencia ${referencia} creada en product_references`);
        }
    } catch (error) {
        console.error('❌ Error sincronizando product_reference:', error);
        // No bloqueamos el proceso si falla
    }
};

// ============ ENDPOINTS ============

/**
 * GET /api/fichas-diseno
 * Obtener todas las fichas de diseño
 */
const getFichasDiseno = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                fd.*,
                d.nombre as disenadora_nombre
            FROM fichas_diseno fd
            LEFT JOIN disenadoras d ON fd.disenadora_id = d.id
            ORDER BY fd.created_at DESC
        `);

        const fichas = result.rows.map(f => ({
            id: f.id,
            referencia: f.referencia,
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
            importada: f.importada,
            createdBy: f.created_by,
            createdAt: f.created_at,
            updatedAt: f.updated_at
        }));

        return res.json({ success: true, data: fichas });
    } catch (error) {
        console.error('❌ Error obteniendo fichas diseño:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener fichas' });
    }
};

/**
 * GET /api/fichas-diseno/:referencia
 * Obtener una ficha específica
 */
const getFichaDiseno = async (req, res) => {
    try {
        const { referencia } = req.params;

        const result = await pool.query(`
            SELECT 
                fd.*,
                d.nombre as disenadora_nombre
            FROM fichas_diseno fd
            LEFT JOIN disenadoras d ON fd.disenadora_id = d.id
            WHERE fd.referencia = $1
        `, [referencia]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Ficha no encontrada' });
        }

        const f = result.rows[0];
        const ficha = {
            id: f.id,
            referencia: f.referencia,
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
            importada: f.importada,
            createdBy: f.created_by,
            createdAt: f.created_at,
            updatedAt: f.updated_at
        };

        return res.json({ success: true, data: ficha });
    } catch (error) {
        console.error('❌ Error obteniendo ficha:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener ficha' });
    }
};

/**
 * POST /api/fichas-diseno
 * Crear nueva ficha de diseño
 */
const createFichaDiseno = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const {
            referencia,
            disenadoraId,
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
            createdBy
        } = req.body;

        if (!referencia || !disenadoraId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Referencia y diseñadora son obligatorios' 
            });
        }

        // Verificar que no exista
        const existe = await client.query(
            'SELECT id FROM fichas_diseno WHERE referencia = $1',
            [referencia]
        );

        if (existe.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una ficha con esta referencia'
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

        await client.query('BEGIN');

        // Insertar ficha
        const result = await client.query(`
            INSERT INTO fichas_diseno (
                referencia, disenadora_id, descripcion, marca, novedad,
                muestra_1, muestra_2, observaciones, foto_1, foto_2,
                materia_prima, mano_obra, insumos_directos, insumos_indirectos, provisiones,
                total_materia_prima, total_mano_obra, total_insumos_directos,
                total_insumos_indirectos, total_provisiones, costo_total,
                created_by
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15,
                $16, $17, $18, $19, $20, $21, $22
            ) RETURNING *
        `, [
            referencia, disenadoraId, descripcion, marca, novedad,
            muestra1, muestra2, observaciones, foto1, foto2,
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
            createdBy
        ]);

        await client.query('COMMIT');

        const ficha = result.rows[0];

        // Sincronizar con product_references (async, no bloqueante)
        sincronizarProductReference(referencia, {
            descripcion,
            marca,
            materia_prima: secciones.materia_prima
        });

        return res.json({
            success: true,
            data: {
                id: ficha.id,
                referencia: ficha.referencia,
                costoTotal: parseFloat(ficha.costo_total)
            },
            message: 'Ficha de diseño creada exitosamente'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error creando ficha diseño:', error);
        return res.status(500).json({ success: false, message: 'Error al crear ficha' });
    } finally {
        client.release();
    }
};

/**
 * PUT /api/fichas-diseno/:referencia
 * Actualizar ficha de diseño
 */
const updateFichaDiseno = async (req, res) => {
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
            provisiones
        } = req.body;

        // Verificar que existe
        const existe = await client.query(
            'SELECT id FROM fichas_diseno WHERE referencia = $1',
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

        await client.query('BEGIN');

        const result = await client.query(`
            UPDATE fichas_diseno
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
                costo_total = $19
            WHERE referencia = $20
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
            referencia
        ]);

        await client.query('COMMIT');

        const ficha = result.rows[0];

        return res.json({
            success: true,
            data: {
                id: ficha.id,
                referencia: ficha.referencia,
                costoTotal: parseFloat(ficha.costo_total)
            },
            message: 'Ficha actualizada exitosamente'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error actualizando ficha:', error);
        return res.status(500).json({ success: false, message: 'Error al actualizar ficha' });
    } finally {
        client.release();
    }
};

/**
 * DELETE /api/fichas-diseno/:referencia
 * Eliminar ficha de diseño
 */
const deleteFichaDiseno = async (req, res) => {
    try {
        const { referencia } = req.params;

        // Verificar si fue importada
        const importada = await pool.query(
            'SELECT importada FROM fichas_diseno WHERE referencia = $1',
            [referencia]
        );

        if (importada.rows.length > 0 && importada.rows[0].importada) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar una ficha que ya fue importada a costos'
            });
        }

        const result = await pool.query(
            'DELETE FROM fichas_diseno WHERE referencia = $1 RETURNING id',
            [referencia]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Ficha no encontrada' });
        }

        return res.json({ success: true, message: 'Ficha eliminada exitosamente' });
    } catch (error) {
        console.error('❌ Error eliminando ficha:', error);
        return res.status(500).json({ success: false, message: 'Error al eliminar ficha' });
    }
};

/**
 * POST /api/fichas-diseno/upload-foto
 * Subir foto de referencia
 */
const uploadFoto = (req, res) => {
    upload.single('foto')(req, res, (err) => {
        if (err) {
            console.error('❌ Error subiendo foto:', err);
            return res.status(400).json({ success: false, message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No se recibió archivo' });
        }

        const fotoPath = `/images/references/${req.file.filename}`;

        return res.json({
            success: true,
            data: { path: fotoPath },
            message: 'Foto subida exitosamente'
        });
    });
};

module.exports = {
    getFichasDiseno,
    getFichaDiseno,
    createFichaDiseno,
    updateFichaDiseno,
    deleteFichaDiseno,
    uploadFoto,
    upload // Para usar en rutas
};
