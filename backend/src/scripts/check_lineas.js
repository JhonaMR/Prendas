const { query } = require('../config/database');

async function diagnostico() {
    try {
        console.log('====================================');
        console.log('🔍 DIAGNÓSTICO DE LÍNEAS EN BASE DE DATOS');
        console.log('====================================');

        const disenoNulls = await query(`SELECT COUNT(*) FROM fichas_diseno WHERE linea IS NULL OR linea = 'Elegir' OR linea = ''`);
        const disenoConLinea = await query(`SELECT COUNT(*) FROM fichas_diseno WHERE linea IS NOT NULL AND linea != 'Elegir' AND linea != ''`);
        const costoNulls = await query(`SELECT COUNT(*) FROM fichas_costo WHERE linea IS NULL OR linea = 'Elegir' OR linea = ''`);
        const costoConLinea = await query(`SELECT COUNT(*) FROM fichas_costo WHERE linea IS NOT NULL AND linea != 'Elegir' AND linea != ''`);

        console.log('📄 Fichas Diseño sin línea seleccionada:', disenoNulls.rows[0].count);
        console.log('📄 Fichas Diseño CON línea asignada:', disenoConLinea.rows[0].count);
        console.log('💵 Fichas Costo sin línea seleccionada:', costoNulls.rows[0].count);
        console.log('💵 Fichas Costo CON línea asignada:', costoConLinea.rows[0].count);

        console.log('\n📋 Muestra de las últimas 10 Fichas de Costo:');
        const muestraCosto = await query(`
            SELECT fc.referencia, fc.linea as linea_costo, fd.linea as linea_diseno
            FROM fichas_costo fc
            LEFT JOIN fichas_diseno fd ON fc.ficha_diseno_id = fd.id
            ORDER BY fc.updated_at DESC LIMIT 10
        `);
        console.table(muestraCosto.rows);
        console.log('====================================');
        process.exit(0);
    } catch (e) {
        console.error('❌ Error en diagnóstico:', e);
        process.exit(1);
    }
}

diagnostico();
