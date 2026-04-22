// ============================================
// SCRIPT: Actualizar rutas de fotos en BD
// Migra rutas de /images/references/ a /images/references/Plow/ o /images/references/Melas/
// ============================================

const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la base de datos
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true'
});

// Detectar instancia basada en el nombre de la BD
const getInstanceFolder = () => {
    const dbName = process.env.DB_NAME || '';
    if (dbName.includes('melas')) {
        return 'Melas';
    }
    return 'Plow';
};

async function updatePhotoPaths() {
    const client = await pool.connect();
    
    try {
        const instanceFolder = getInstanceFolder();
        console.log(`🔧 Actualizando rutas para instancia: ${instanceFolder}`);
        
        // Obtener todas las fichas con fotos
        const result = await client.query(`
            SELECT id, referencia, foto_1, foto_2 
            FROM fichas_diseno 
            WHERE foto_1 IS NOT NULL OR foto_2 IS NOT NULL
        `);
        
        console.log(`📋 Encontradas ${result.rows.length} fichas con fotos`);
        
        let updatedCount = 0;
        
        for (const row of result.rows) {
            let needsUpdate = false;
            let newFoto1 = row.foto_1;
            let newFoto2 = row.foto_2;
            
            // Actualizar foto_1 si es necesario
            if (row.foto_1 && row.foto_1.startsWith('/images/references/') && !row.foto_1.includes(`/images/references/${instanceFolder}/`)) {
                const filename = row.foto_1.replace('/images/references/', '');
                newFoto1 = `/images/references/${instanceFolder}/${filename}`;
                needsUpdate = true;
            }
            
            // Actualizar foto_2 si es necesario
            if (row.foto_2 && row.foto_2.startsWith('/images/references/') && !row.foto_2.includes(`/images/references/${instanceFolder}/`)) {
                const filename = row.foto_2.replace('/images/references/', '');
                newFoto2 = `/images/references/${instanceFolder}/${filename}`;
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                await client.query(
                    'UPDATE fichas_diseno SET foto_1 = $1, foto_2 = $2 WHERE id = $3',
                    [newFoto1, newFoto2, row.id]
                );
                
                console.log(`✅ Actualizada referencia ${row.referencia}:`);
                if (row.foto_1 !== newFoto1) console.log(`   Foto1: ${row.foto_1} → ${newFoto1}`);
                if (row.foto_2 !== newFoto2) console.log(`   Foto2: ${row.foto_2} → ${newFoto2}`);
                
                updatedCount++;
            }
        }
        
        console.log(`\n🎉 Proceso completado: ${updatedCount} fichas actualizadas`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

// Ejecutar el script
updatePhotoPaths();