/**
 * 📋 SERVICIO: Fichas
 * 
 * Lógica de negocio para fichas
 */

const { getDatabase } = require('../../../config/database');

// ==================== DISEÑADORAS ====================

async function getDisenadoras() {
  const db = getDatabase();
  const query = `
    SELECT id, nombre, cedula, telefono, activa, created_at, updated_at
    FROM disenadoras
    ORDER BY nombre ASC
  `;
  
  try {
    const result = await db.query(query);
    return result.rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      cedula: row.cedula,
      telefono: row.telefono,
      activa: row.activa,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch (error) {
    console.error('Error en getDisenadoras:', error);
    return [];
  }
}

// ==================== FICHAS DE DISEÑO ====================

async function getFichasDiseno() {
  const db = getDatabase();
  const query = `
    SELECT fd.*, d.nombre as disenadora_nombre
    FROM fichas_diseno fd
    LEFT JOIN disenadoras d ON fd.disenadora_id = d.id
    ORDER BY fd.referencia ASC
  `;
  
  try {
    const result = await db.query(query);
    return result.rows.map(formatFichaDiseno);
  } catch (error) {
    console.error('Error en getFichasDiseno:', error);
    return [];
  }
}

async function getFichaDiseno(referencia) {
  const db = getDatabase();
  const query = `
    SELECT fd.*, d.nombre as disenadora_nombre
    FROM fichas_diseno fd
    LEFT JOIN disenadoras d ON fd.disenadora_id = d.id
    WHERE fd.referencia = $1
  `;
  
  try {
    const result = await db.query(query, [referencia]);
    if (result.rows.length === 0) return null;
    return formatFichaDiseno(result.rows[0]);
  } catch (error) {
    console.error('Error en getFichaDiseno:', error);
    return null;
  }
}

async function createFichaDiseno(data) {
  const db = getDatabase();
  const query = `
    INSERT INTO fichas_diseno (
      referencia, disenadora_id, descripcion, marca, novedad, muestra1, muestra2,
      observaciones, foto1, foto2, materia_prima, mano_obra, insumos_directos,
      insumos_indirectos, provisiones, total_materia_prima, total_mano_obra,
      total_insumos_directos, total_insumos_indirectos, total_provisiones,
      costo_total, importada, created_by, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
      $16, $17, $18, $19, $20, $21, $22, $23, NOW(), NOW()
    )
    RETURNING *
  `;
  
  try {
    const result = await db.query(query, [
      data.referencia,
      data.disenadoraId,
      data.descripcion || '',
      data.marca || '',
      data.novedad || '',
      data.muestra1 || '',
      data.muestra2 || '',
      data.observaciones || '',
      data.foto1 || null,
      data.foto2 || null,
      JSON.stringify(data.materiaPrima || []),
      JSON.stringify(data.manoObra || []),
      JSON.stringify(data.insumosDirectos || []),
      JSON.stringify(data.insumosIndirectos || []),
      JSON.stringify(data.provisiones || []),
      data.totalMateriaPrima || 0,
      data.totalManoObra || 0,
      data.totalInsumosDirectos || 0,
      data.totalInsumosIndirectos || 0,
      data.totalProvisiones || 0,
      data.costoTotal || 0,
      data.importada || false,
      data.createdBy
    ]);
    
    return formatFichaDiseno(result.rows[0]);
  } catch (error) {
    console.error('Error en createFichaDiseno:', error);
    throw error;
  }
}

async function updateFichaDiseno(referencia, data) {
  const db = getDatabase();
  const query = `
    UPDATE fichas_diseno
    SET descripcion = $1, marca = $2, novedad = $3, muestra1 = $4, muestra2 = $5,
        observaciones = $6, foto1 = $7, foto2 = $8, materia_prima = $9,
        mano_obra = $10, insumos_directos = $11, insumos_indirectos = $12,
        provisiones = $13, total_materia_prima = $14, total_mano_obra = $15,
        total_insumos_directos = $16, total_insumos_indirectos = $17,
        total_provisiones = $18, costo_total = $19, updated_at = NOW()
    WHERE referencia = $20
    RETURNING *
  `;
  
  try {
    const result = await db.query(query, [
      data.descripcion || '',
      data.marca || '',
      data.novedad || '',
      data.muestra1 || '',
      data.muestra2 || '',
      data.observaciones || '',
      data.foto1 || null,
      data.foto2 || null,
      JSON.stringify(data.materiaPrima || []),
      JSON.stringify(data.manoObra || []),
      JSON.stringify(data.insumosDirectos || []),
      JSON.stringify(data.insumosIndirectos || []),
      JSON.stringify(data.provisiones || []),
      data.totalMateriaPrima || 0,
      data.totalManoObra || 0,
      data.totalInsumosDirectos || 0,
      data.totalInsumosIndirectos || 0,
      data.totalProvisiones || 0,
      data.costoTotal || 0,
      referencia
    ]);
    
    if (result.rows.length === 0) return null;
    return formatFichaDiseno(result.rows[0]);
  } catch (error) {
    console.error('Error en updateFichaDiseno:', error);
    throw error;
  }
}

// ==================== FICHAS DE COSTO ====================

async function getFichasCosto() {
  const db = getDatabase();
  const query = `
    SELECT * FROM fichas_costo
    ORDER BY referencia ASC
  `;
  
  try {
    const result = await db.query(query);
    return result.rows.map(formatFichaCosto);
  } catch (error) {
    console.error('Error en getFichasCosto:', error);
    return [];
  }
}

async function getFichaCosto(referencia) {
  const db = getDatabase();
  const query = `
    SELECT * FROM fichas_costo
    WHERE referencia = $1
  `;
  
  try {
    const result = await db.query(query, [referencia]);
    if (result.rows.length === 0) return null;
    return formatFichaCosto(result.rows[0]);
  } catch (error) {
    console.error('Error en getFichaCosto:', error);
    return null;
  }
}

async function createFichaCosto(data) {
  const db = getDatabase();
  const query = `
    INSERT INTO fichas_costo (
      referencia, ficha_diseno_id, descripcion, marca, novedad, muestra1, muestra2,
      observaciones, foto1, foto2, materia_prima, mano_obra, insumos_directos,
      insumos_indirectos, provisiones, total_materia_prima, total_mano_obra,
      total_insumos_directos, total_insumos_indirectos, total_provisiones,
      costo_total, precio_venta, rentabilidad, margen_ganancia, costo_contabilizar,
      desc0_precio, desc0_rent, desc5_precio, desc5_rent, desc10_precio, desc10_rent,
      desc15_precio, desc15_rent, cantidad_total_cortada, created_by, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
      $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29,
      $30, $31, $32, $33, $34, $35, NOW(), NOW()
    )
    RETURNING *
  `;
  
  try {
    const result = await db.query(query, [
      data.referencia,
      data.fichaDisenoId || null,
      data.descripcion || '',
      data.marca || '',
      data.novedad || '',
      data.muestra1 || '',
      data.muestra2 || '',
      data.observaciones || '',
      data.foto1 || null,
      data.foto2 || null,
      JSON.stringify(data.materiaPrima || []),
      JSON.stringify(data.manoObra || []),
      JSON.stringify(data.insumosDirectos || []),
      JSON.stringify(data.insumosIndirectos || []),
      JSON.stringify(data.provisiones || []),
      data.totalMateriaPrima || 0,
      data.totalManoObra || 0,
      data.totalInsumosDirectos || 0,
      data.totalInsumosIndirectos || 0,
      data.totalProvisiones || 0,
      data.costoTotal || 0,
      data.precioVenta || 0,
      data.rentabilidad || 0,
      data.margenGanancia || 0,
      data.costoContabilizar || 0,
      data.desc0Precio || 0,
      data.desc0Rent || 0,
      data.desc5Precio || 0,
      data.desc5Rent || 0,
      data.desc10Precio || 0,
      data.desc10Rent || 0,
      data.desc15Precio || 0,
      data.desc15Rent || 0,
      data.cantidadTotalCortada || 0,
      data.createdBy
    ]);
    
    return formatFichaCosto(result.rows[0]);
  } catch (error) {
    console.error('Error en createFichaCosto:', error);
    throw error;
  }
}

async function updateFichaCosto(referencia, data) {
  const db = getDatabase();
  const query = `
    UPDATE fichas_costo
    SET descripcion = $1, marca = $2, novedad = $3, muestra1 = $4, muestra2 = $5,
        observaciones = $6, foto1 = $7, foto2 = $8, materia_prima = $9,
        mano_obra = $10, insumos_directos = $11, insumos_indirectos = $12,
        provisiones = $13, total_materia_prima = $14, total_mano_obra = $15,
        total_insumos_directos = $16, total_insumos_indirectos = $17,
        total_provisiones = $18, costo_total = $19, precio_venta = $20,
        rentabilidad = $21, margen_ganancia = $22, costo_contabilizar = $23,
        desc0_precio = $24, desc0_rent = $25, desc5_precio = $26, desc5_rent = $27,
        desc10_precio = $28, desc10_rent = $29, desc15_precio = $30, desc15_rent = $31,
        updated_at = NOW()
    WHERE referencia = $32
    RETURNING *
  `;
  
  try {
    const result = await db.query(query, [
      data.descripcion || '',
      data.marca || '',
      data.novedad || '',
      data.muestra1 || '',
      data.muestra2 || '',
      data.observaciones || '',
      data.foto1 || null,
      data.foto2 || null,
      JSON.stringify(data.materiaPrima || []),
      JSON.stringify(data.manoObra || []),
      JSON.stringify(data.insumosDirectos || []),
      JSON.stringify(data.insumosIndirectos || []),
      JSON.stringify(data.provisiones || []),
      data.totalMateriaPrima || 0,
      data.totalManoObra || 0,
      data.totalInsumosDirectos || 0,
      data.totalInsumosIndirectos || 0,
      data.totalProvisiones || 0,
      data.costoTotal || 0,
      data.precioVenta || 0,
      data.rentabilidad || 0,
      data.margenGanancia || 0,
      data.costoContabilizar || 0,
      data.desc0Precio || 0,
      data.desc0Rent || 0,
      data.desc5Precio || 0,
      data.desc5Rent || 0,
      data.desc10Precio || 0,
      data.desc10Rent || 0,
      data.desc15Precio || 0,
      data.desc15Rent || 0,
      referencia
    ]);
    
    if (result.rows.length === 0) return null;
    return formatFichaCosto(result.rows[0]);
  } catch (error) {
    console.error('Error en updateFichaCosto:', error);
    throw error;
  }
}

// ==================== MALETAS ====================

async function getMaletas() {
  const db = getDatabase();
  const query = `
    SELECT * FROM maletas
    ORDER BY nombre ASC
  `;
  
  try {
    const result = await db.query(query);
    return result.rows.map(formatMaleta);
  } catch (error) {
    console.error('Error en getMaletas:', error);
    return [];
  }
}

async function getMaleta(id) {
  const db = getDatabase();
  const query = `
    SELECT * FROM maletas
    WHERE id = $1
  `;
  
  try {
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) return null;
    return formatMaleta(result.rows[0]);
  } catch (error) {
    console.error('Error en getMaleta:', error);
    return null;
  }
}

async function createMaleta(data) {
  const db = getDatabase();
  const query = `
    INSERT INTO maletas (
      nombre, correria_id, referencias, created_by, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, NOW(), NOW()
    )
    RETURNING *
  `;
  
  try {
    const result = await db.query(query, [
      data.nombre,
      data.correriaId || null,
      JSON.stringify(data.referencias || []),
      data.createdBy
    ]);
    
    return formatMaleta(result.rows[0]);
  } catch (error) {
    console.error('Error en createMaleta:', error);
    throw error;
  }
}

async function updateMaleta(id, data) {
  const db = getDatabase();
  const query = `
    UPDATE maletas
    SET nombre = $1, correria_id = $2, referencias = $3, updated_at = NOW()
    WHERE id = $4
    RETURNING *
  `;
  
  try {
    const result = await db.query(query, [
      data.nombre,
      data.correriaId || null,
      JSON.stringify(data.referencias || []),
      id
    ]);
    
    if (result.rows.length === 0) return null;
    return formatMaleta(result.rows[0]);
  } catch (error) {
    console.error('Error en updateMaleta:', error);
    throw error;
  }
}

async function deleteMaleta(id) {
  const db = getDatabase();
  const query = `
    DELETE FROM maletas
    WHERE id = $1
  `;
  
  try {
    await db.query(query, [id]);
  } catch (error) {
    console.error('Error en deleteMaleta:', error);
    throw error;
  }
}

// ==================== FUNCIONES AUXILIARES ====================

function safeJsonParse(value) {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return [];
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error('Error parsing JSON:', error, 'Value:', value);
    return [];
  }
}

function formatFichaDiseno(row) {
  return {
    id: row.id,
    referencia: row.referencia,
    disenadoraId: row.disenadora_id,
    disenadoraNombre: row.disenadora_nombre || 'Sin diseñadora',
    descripcion: row.descripcion,
    marca: row.marca,
    novedad: row.novedad,
    muestra1: row.muestra1,
    muestra2: row.muestra2,
    observaciones: row.observaciones,
    foto1: row.foto1,
    foto2: row.foto2,
    materiaPrima: safeJsonParse(row.materia_prima),
    manoObra: safeJsonParse(row.mano_obra),
    insumosDirectos: safeJsonParse(row.insumos_directos),
    insumosIndirectos: safeJsonParse(row.insumos_indirectos),
    provisiones: safeJsonParse(row.provisiones),
    totalMateriaPrima: row.total_materia_prima,
    totalManoObra: row.total_mano_obra,
    totalInsumosDirectos: row.total_insumos_directos,
    totalInsumosIndirectos: row.total_insumos_indirectos,
    totalProvisiones: row.total_provisiones,
    costoTotal: row.costo_total,
    importada: row.importada,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function formatFichaCosto(row) {
  return {
    id: row.id,
    referencia: row.referencia,
    fichaDisenoId: row.ficha_diseno_id,
    descripcion: row.descripcion,
    marca: row.marca,
    novedad: row.novedad,
    muestra1: row.muestra1,
    muestra2: row.muestra2,
    observaciones: row.observaciones,
    foto1: row.foto1,
    foto2: row.foto2,
    materiaPrima: safeJsonParse(row.materia_prima),
    manoObra: safeJsonParse(row.mano_obra),
    insumosDirectos: safeJsonParse(row.insumos_directos),
    insumosIndirectos: safeJsonParse(row.insumos_indirectos),
    provisiones: safeJsonParse(row.provisiones),
    totalMateriaPrima: row.total_materia_prima,
    totalManoObra: row.total_mano_obra,
    totalInsumosDirectos: row.total_insumos_directos,
    totalInsumosIndirectos: row.total_insumos_indirectos,
    totalProvisiones: row.total_provisiones,
    costoTotal: row.costo_total,
    precioVenta: row.precio_venta,
    rentabilidad: row.rentabilidad,
    margenGanancia: row.margen_ganancia,
    costoContabilizar: row.costo_contabilizar,
    desc0Precio: row.desc0_precio,
    desc0Rent: row.desc0_rent,
    desc5Precio: row.desc5_precio,
    desc5Rent: row.desc5_rent,
    desc10Precio: row.desc10_precio,
    desc10Rent: row.desc10_rent,
    desc15Precio: row.desc15_precio,
    desc15Rent: row.desc15_rent,
    cantidadTotalCortada: row.cantidad_total_cortada,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function formatMaleta(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    correriaId: row.correria_id,
    referencias: safeJsonParse(row.referencias),
    numReferencias: row.referencias ? safeJsonParse(row.referencias).length : 0,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

module.exports = {
  getDisenadoras,
  getFichasDiseno,
  getFichaDiseno,
  createFichaDiseno,
  updateFichaDiseno,
  getFichasCosto,
  getFichaCosto,
  createFichaCosto,
  updateFichaCosto,
  getMaletas,
  getMaleta,
  createMaleta,
  updateMaleta,
  deleteMaleta
};
