/**
 * 🔧 SCRIPT PARA ASOCIAR REFERENCIAS A CORRERÍA
 * 
 * Este script crea una nueva correría "Inicio de año 2026" y asocia
 * todas las referencias existentes a esa correría.
 * 
 * Uso: node src/scripts/associateReferencesToCorreria.js
 */

require('dotenv').config();
const { getDatabase, generateId } = require('../config/database');

console.log('\n' + '='.repeat(60));
console.log('🔗 ASOCIANDO REFERENCIAS A CORRERÍA');
console.log('='.repeat(60) + '\n');

try {
    const db = getDatabase();

    // 1. Verificar si la correría ya existe
    console.log('🔍 Buscando correría "Inicio de año 2026"...');
    let correria = db.prepare(`
        SELECT id FROM correrias WHERE name = ? AND year = ?
    `).get('Inicio de año', '2026');

    let correriaId;

    if (correria) {
        correriaId = correria.id;
        console.log('✅ Correría encontrada:', correriaId);
    } else {
        // 2. Crear la correría si no existe
        console.log('📝 Creando nueva correría...');
        correriaId = generateId();
        
        db.prepare(`
            INSERT INTO correrias (id, name, year, active)
            VALUES (?, ?, ?, 1)
        `).run(correriaId, 'Inicio de año', '2026');
        
        console.log('✅ Correría creada:', correriaId);
    }

    // 3. Obtener todas las referencias
    console.log('\n📦 Obteniendo referencias...');
    const referencias = db.prepare(`
        SELECT id FROM product_references WHERE active = 1
    `).all();

    console.log(`✅ Se encontraron ${referencias.length} referencias activas`);

    // 4. Asociar cada referencia a la correría
    console.log('\n🔗 Asociando referencias a la correría...');
    
    const insertCatalog = db.prepare(`
        INSERT OR IGNORE INTO correria_catalog (id, correria_id, reference_id)
        VALUES (?, ?, ?)
    `);

    let asociadas = 0;
    for (const ref of referencias) {
        const catalogId = generateId();
        insertCatalog.run(catalogId, correriaId, ref.id);
        asociadas++;
        console.log(`   ✅ Referencia ${ref.id} asociada`);
    }

    db.close();

    console.log('\n' + '='.repeat(60));
    console.log('✅ PROCESO COMPLETADO EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log(`\n📊 Resumen:`);
    console.log(`   - Correría: Inicio de año 2026`);
    console.log(`   - Referencias asociadas: ${asociadas}`);
    console.log('\n');

} catch (error) {
    console.error('\n❌ ERROR AL ASOCIAR REFERENCIAS');
    console.error(error);
    process.exit(1);
}
