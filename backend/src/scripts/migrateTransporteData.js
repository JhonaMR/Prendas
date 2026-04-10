/**
 * Script de migración de datos de transporte desde localStorage → PostgreSQL
 * 
 * Uso: node migrateTransporteData.js --transportistas='[...]' --talleres='[...]' --rutas='[...]'
 * 
 * O bien, editar las constantes DATA_* abajo con los datos exportados del localStorage.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { initDatabase, query, transaction } = require('../config/database');
const logger = require('../controllers/shared/logger');

// ── Pegar aquí los datos del localStorage si se usa sin argumentos CLI ──
const DATA_TRANSPORTISTAS = process.env.TRANSPORTISTAS_JSON
  ? JSON.parse(process.env.TRANSPORTISTAS_JSON)
  : [];

const DATA_TALLERES = process.env.TALLERES_JSON
  ? JSON.parse(process.env.TALLERES_JSON)
  : [];

const DATA_RUTAS = process.env.RUTAS_JSON
  ? JSON.parse(process.env.RUTAS_JSON)
  : [];

async function migrateTransportistas(transportistas) {
  let ok = 0, skip = 0;
  for (const t of transportistas) {
    const exists = await query('SELECT id FROM transportistas WHERE id = $1', [t.id]);
    if (exists.rows.length > 0) { skip++; continue; }
    await query(
      `INSERT INTO transportistas (id, nombre, celular, picoyplaca, color_key) VALUES ($1,$2,$3,$4,$5)`,
      [t.id, t.nombre, t.celular || '', t.picoyplaca || '', t.colorKey || 'red']
    );
    ok++;
  }
  logger.info(`Transportistas: ${ok} insertados, ${skip} ya existían`);
}

async function migrateTalleres(talleres) {
  let ok = 0, skip = 0;
  for (const t of talleres) {
    const exists = await query('SELECT id FROM talleres WHERE id = $1', [t.id]);
    if (exists.rows.length > 0) { skip++; continue; }
    await query(
      `INSERT INTO talleres (id, nombre, celular, direccion, sector, estado) VALUES ($1,$2,$3,$4,$5,$6)`,
      [t.id, t.nombre, t.celular || '', t.direccion || '', t.sector || '', t.estado || 'activo']
    );
    ok++;
  }
  logger.info(`Talleres: ${ok} insertados, ${skip} ya existían`);
}

async function migrateRutas(rutas) {
  let ok = 0, skip = 0;
  for (const ruta of rutas) {
    const exists = await query('SELECT id FROM rutas_transporte WHERE id = $1', [ruta.id]);
    if (exists.rows.length > 0) { skip++; continue; }

    // Verificar que el transportista existe
    const tExists = await query('SELECT id FROM transportistas WHERE id = $1', [ruta.transportistaId]);
    if (tExists.rows.length === 0) {
      logger.warn(`Ruta ${ruta.id}: transportista ${ruta.transportistaId} no encontrado, omitiendo`);
      skip++;
      continue;
    }

    await transaction(async (client) => {
      await client.query(
        `INSERT INTO rutas_transporte (id, fecha, transportista_id) VALUES ($1,$2,$3)`,
        [ruta.id, ruta.fecha, ruta.transportistaId]
      );
      for (const item of (ruta.items || [])) {
        await client.query(
          `INSERT INTO rutas_transporte_items (id, ruta_id, taller, celular, direccion, sector, detalle, servicio)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [item.id, ruta.id, item.taller||'', item.celular||'', item.direccion||'', item.sector||'', item.detalle||'', item.servicio||'']
        );
      }
    });
    ok++;
  }
  logger.info(`Rutas: ${ok} insertadas, ${skip} omitidas`);
}

async function run() {
  try {
    await initDatabase();
    logger.info('🚀 Iniciando migración de datos de transporte...');

    await migrateTransportistas(DATA_TRANSPORTISTAS);
    await migrateTalleres(DATA_TALLERES);
    await migrateRutas(DATA_RUTAS);

    // Resumen
    const counts = await Promise.all([
      query('SELECT COUNT(*) FROM transportistas'),
      query('SELECT COUNT(*) FROM talleres'),
      query('SELECT COUNT(*) FROM rutas_transporte'),
      query('SELECT COUNT(*) FROM rutas_transporte_items'),
    ]);

    logger.info('✅ Migración completada:');
    logger.info(`  Transportistas: ${counts[0].rows[0].count}`);
    logger.info(`  Talleres:       ${counts[1].rows[0].count}`);
    logger.info(`  Rutas:          ${counts[2].rows[0].count}`);
    logger.info(`  Items de ruta:  ${counts[3].rows[0].count}`);

    process.exit(0);
  } catch (error) {
    logger.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

run();
