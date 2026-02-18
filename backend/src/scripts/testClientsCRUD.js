/**
 * Script de prueba para operaciones CRUD de clientsService.js
 * 
 * Este script prueba las operaciones CRUD directamente:
 * 1. Ejecutar getAllClients() y verificar que no haya errores
 * 2. Probar createClient() con datos de prueba
 * 3. Probar updateClient() con actualizaciones de todas las columnas
 * 4. Probar deleteClient() y verificar eliminación
 * 
 * Validates: Requirements 2.1, 2.2, 2.3, 2.5
 */

// Cargar variables de entorno
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { initDatabase, query } = require('../config/database');
const clientsService = require('../controllers/entities/clients/clientsService');

async function testClientsCRUD() {
  console.log('🧪 INICIANDO PRUEBAS CRUD PARA CLIENTSERVICE.JS\n');
  console.log('='.repeat(80));
  
  let testPassed = 0;
  let testFailed = 0;
  
  try {
    // 1. Inicializar base de datos
    console.log('1. 🔌 Inicializando base de datos...');
    await initDatabase();
    console.log('✅ Base de datos inicializada\n');
    
    // 2. Verificar que la tabla clients existe
    console.log('2. 📊 Verificando tabla clients...');
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'clients'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('❌ ERROR: La tabla clients no existe en PostgreSQL');
      console.error('   Ejecuta primero las tareas de corrección de esquema (1-5)');
      return { success: false, error: 'Tabla clients no existe' };
    }
    
    console.log('✅ Tabla clients existe\n');
    
    // 3. Verificar estructura de la tabla
    console.log('3. 🔍 Verificando estructura de la tabla...');
    const columns = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'clients'
      ORDER BY ordinal_position;
    `);
    
    const columnNames = columns.rows.map(col => col.column_name);
    console.log(`📊 Columnas encontradas: ${columnNames.join(', ')}`);
    
    // Columnas requeridas según clientsService.js
    const requiredColumns = ['id', 'name', 'nit', 'address', 'city', 'seller_id', 'active'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
    
    if (missingColumns.length > 0) {
      console.error(`❌ ERROR: Faltan columnas requeridas: ${missingColumns.join(', ')}`);
      console.error('   El esquema no coincide con lo que clientsService.js espera');
      console.error('   Ejecuta las tareas de corrección de esquema primero');
      return { success: false, error: `Columnas faltantes: ${missingColumns.join(', ')}` };
    }
    
    console.log('✅ Todas las columnas requeridas están presentes\n');
    
    // Datos de prueba
    const testId = 'test-crud-' + Date.now();
    const testClient = {
      id: testId,
      name: 'Cliente de Prueba CRUD',
      nit: '1234567890',
      address: 'Calle Falsa 123',
      city: 'Ciudad de Prueba',
      seller_id: 'test-seller-001',
      active: true
    };
    
    const updatedClientData = {
      name: 'Cliente Actualizado CRUD',
      nit: '9876543210',
      address: 'Nueva Dirección 456',
      city: 'Nueva Ciudad',
      seller_id: 'test-seller-002',
      active: false
    };
    
    // Limpiar datos de prueba anteriores
    console.log('4. 🧹 Limpiando datos de prueba anteriores...');
    await query('DELETE FROM clients WHERE id LIKE $1', ['test-crud-%']);
    console.log('✅ Datos de prueba anteriores limpiados\n');
    
    // ==================== PRUEBA 1: getAllClients() ====================
    console.log('='.repeat(80));
    console.log('PRUEBA 1: getAllClients()');
    console.log('='.repeat(80));
    
    try {
      console.log('Ejecutando getAllClients()...');
      const clients = await clientsService.getAllClients();
      
      // Verificar que no hay errores
      if (!Array.isArray(clients)) {
        throw new Error('getAllClients() no retornó un array');
      }
      
      console.log(`✅ getAllClients() ejecutado correctamente`);
      console.log(`   Clientes encontrados: ${clients.length}`);
      
      // Verificar estructura si hay clientes
      if (clients.length > 0) {
        const firstClient = clients[0];
        const hasAllColumns = requiredColumns.every(col => firstClient.hasOwnProperty(col));
        
        if (hasAllColumns) {
          console.log('✅ Estructura de datos validada correctamente');
        } else {
          console.log('⚠️  Estructura de datos incompleta en algunos registros');
        }
      }
      
      testPassed++;
      console.log('✅ PRUEBA 1 PASADA\n');
      
    } catch (error) {
      testFailed++;
      console.error(`❌ ERROR en getAllClients(): ${error.message}`);
      console.error('   Stack:', error.stack);
      console.log('❌ PRUEBA 1 FALLIDA\n');
    }
    
    // ==================== PRUEBA 2: createClient() ====================
    console.log('='.repeat(80));
    console.log('PRUEBA 2: createClient()');
    console.log('='.repeat(80));
    
    try {
      console.log('Creando cliente de prueba...');
      const createdClient = await clientsService.createClient(testClient);
      
      // Verificar que el cliente fue creado
      if (!createdClient || createdClient.id !== testClient.id) {
        throw new Error('Cliente no creado correctamente');
      }
      
      console.log(`✅ Cliente creado: ${createdClient.id}`);
      console.log(`   Nombre: ${createdClient.name}`);
      console.log(`   NIT: ${createdClient.nit}`);
      console.log(`   Dirección: ${createdClient.address}`);
      console.log(`   Ciudad: ${createdClient.city}`);
      console.log(`   Seller ID: ${createdClient.seller_id}`);
      console.log(`   Activo: ${createdClient.active}`);
      
      // Verificar en la base de datos
      const dbCheck = await query('SELECT * FROM clients WHERE id = $1', [testClient.id]);
      if (dbCheck.rows.length !== 1) {
        throw new Error('Cliente no encontrado en base de datos después de creación');
      }
      
      console.log('✅ Cliente verificado en base de datos');
      testPassed++;
      console.log('✅ PRUEBA 2 PASADA\n');
      
    } catch (error) {
      testFailed++;
      console.error(`❌ ERROR en createClient(): ${error.message}`);
      console.error('   Stack:', error.stack);
      console.log('❌ PRUEBA 2 FALLIDA\n');
      
      // Si createClient falla, no podemos continuar con las otras pruebas
      console.log('⚠️  No se puede continuar con las pruebas restantes');
      console.log('='.repeat(80));
      console.log(`RESUMEN: ${testPassed} pasadas, ${testFailed} fallidas`);
      return { success: false, testPassed, testFailed, error: error.message };
    }
    
    // ==================== PRUEBA 3: getClientById() ====================
    console.log('='.repeat(80));
    console.log('PRUEBA 3: getClientById()');
    console.log('='.repeat(80));
    
    try {
      console.log(`Obteniendo cliente por ID: ${testClient.id}...`);
      const client = await clientsService.getClientById(testClient.id);
      
      if (!client || client.id !== testClient.id) {
        throw new Error('Cliente no obtenido correctamente');
      }
      
      console.log(`✅ Cliente obtenido: ${client.id}`);
      console.log(`   Nombre: ${client.name}`);
      console.log(`   NIT: ${client.nit}`);
      
      // Verificar todas las columnas
      requiredColumns.forEach(col => {
        if (!client.hasOwnProperty(col)) {
          console.warn(`⚠️  Columna faltante en getClientById(): ${col}`);
        }
      });
      
      testPassed++;
      console.log('✅ PRUEBA 3 PASADA\n');
      
    } catch (error) {
      testFailed++;
      console.error(`❌ ERROR en getClientById(): ${error.message}`);
      console.error('   Stack:', error.stack);
      console.log('❌ PRUEBA 3 FALLIDA\n');
    }
    
    // ==================== PRUEBA 4: updateClient() ====================
    console.log('='.repeat(80));
    console.log('PRUEBA 4: updateClient()');
    console.log('='.repeat(80));
    
    try {
      console.log('Actualizando cliente con todas las columnas...');
      const updatedClient = await clientsService.updateClient(testClient.id, updatedClientData);
      
      // Verificar que el cliente fue actualizado
      if (!updatedClient || updatedClient.id !== testClient.id) {
        throw new Error('Cliente no actualizado correctamente');
      }
      
      console.log(`✅ Cliente actualizado: ${updatedClient.id}`);
      console.log(`   Nombre: ${updatedClient.name} (antes: ${testClient.name})`);
      console.log(`   NIT: ${updatedClient.nit} (antes: ${testClient.nit})`);
      console.log(`   Dirección: ${updatedClient.address} (antes: ${testClient.address})`);
      console.log(`   Ciudad: ${updatedClient.city} (antes: ${testClient.city})`);
      console.log(`   Seller ID: ${updatedClient.seller_id} (antes: ${testClient.seller_id})`);
      console.log(`   Activo: ${updatedClient.active} (antes: ${testClient.active})`);
      
      // Verificar en la base de datos
      const dbCheck = await query('SELECT * FROM clients WHERE id = $1', [testClient.id]);
      const dbClient = dbCheck.rows[0];
      
      if (dbClient.name !== updatedClientData.name) {
        throw new Error('Nombre no actualizado en base de datos');
      }
      if (dbClient.nit !== updatedClientData.nit) {
        throw new Error('NIT no actualizado en base de datos');
      }
      if (dbClient.address !== updatedClientData.address) {
        throw new Error('Dirección no actualizada en base de datos');
      }
      if (dbClient.city !== updatedClientData.city) {
        throw new Error('Ciudad no actualizada en base de datos');
      }
      if (dbClient.seller_id !== updatedClientData.seller_id) {
        throw new Error('Seller ID no actualizado en base de datos');
      }
      if (dbClient.active !== updatedClientData.active) {
        throw new Error('Estado activo no actualizado en base de datos');
      }
      
      console.log('✅ Todas las columnas actualizadas verificadas en base de datos');
      
      // Prueba de actualización parcial
      console.log('\nProbando actualización parcial (solo nombre)...');
      const partialUpdate = { name: 'Cliente con Nombre Modificado' };
      const partiallyUpdated = await clientsService.updateClient(testClient.id, partialUpdate);
      
      if (partiallyUpdated.name !== partialUpdate.name) {
        throw new Error('Actualización parcial falló');
      }
      
      console.log(`✅ Actualización parcial exitosa: ${partiallyUpdated.name}`);
      
      testPassed++;
      console.log('✅ PRUEBA 4 PASADA\n');
      
    } catch (error) {
      testFailed++;
      console.error(`❌ ERROR en updateClient(): ${error.message}`);
      console.error('   Stack:', error.stack);
      console.log('❌ PRUEBA 4 FALLIDA\n');
    }
    
    // ==================== PRUEBA 5: deleteClient() ====================
    console.log('='.repeat(80));
    console.log('PRUEBA 5: deleteClient()');
    console.log('='.repeat(80));
    
    try {
      // Crear un cliente específico para eliminar
      const deleteTestId = 'test-delete-' + Date.now();
      const deleteTestClient = {
        id: deleteTestId,
        name: 'Cliente a Eliminar',
        nit: '9999999999',
        address: 'Dirección a Eliminar',
        city: 'Ciudad a Eliminar',
        seller_id: 'test-seller-delete'
      };
      
      console.log(`Creando cliente para eliminación: ${deleteTestId}...`);
      await clientsService.createClient(deleteTestClient);
      
      // Verificar que existe antes de eliminar
      const beforeDelete = await query('SELECT id FROM clients WHERE id = $1', [deleteTestId]);
      if (beforeDelete.rows.length !== 1) {
        throw new Error('Cliente no creado para eliminación');
      }
      
      console.log(`Eliminando cliente: ${deleteTestId}...`);
      await clientsService.deleteClient(deleteTestId);
      
      // Verificar que fue eliminado
      const afterDelete = await query('SELECT id FROM clients WHERE id = $1', [deleteTestId]);
      if (afterDelete.rows.length !== 0) {
        throw new Error('Cliente no eliminado de la base de datos');
      }
      
      console.log('✅ Cliente eliminado y verificación exitosa');
      
      // Prueba de eliminación de cliente inexistente
      console.log('\nProbando eliminación de cliente inexistente...');
      try {
        await clientsService.deleteClient('cliente-inexistente-' + Date.now());
        console.error('❌ ERROR: Se esperaba error al eliminar cliente inexistente');
        testFailed++;
      } catch (error) {
        console.log('✅ Error esperado al eliminar cliente inexistente');
        console.log(`   Mensaje: ${error.message}`);
      }
      
      testPassed++;
      console.log('✅ PRUEBA 5 PASADA\n');
      
    } catch (error) {
      testFailed++;
      console.error(`❌ ERROR en deleteClient(): ${error.message}`);
      console.error('   Stack:', error.stack);
      console.log('❌ PRUEBA 5 FALLIDA\n');
    }
    
    // ==================== LIMPIEZA FINAL ====================
    console.log('='.repeat(80));
    console.log('LIMPIEZA FINAL');
    console.log('='.repeat(80));
    
    try {
      console.log('Limpiando todos los datos de prueba...');
      await query('DELETE FROM clients WHERE id LIKE $1', ['test-%']);
      console.log('✅ Datos de prueba limpiados\n');
    } catch (error) {
      console.error(`⚠️  Error limpiando datos: ${error.message}`);
    }
    
    // ==================== RESUMEN ====================
    console.log('='.repeat(80));
    console.log('RESUMEN DE PRUEBAS');
    console.log('='.repeat(80));
    
    console.log(`Pruebas pasadas: ${testPassed}`);
    console.log(`Pruebas fallidas: ${testFailed}`);
    console.log(`Total: ${testPassed + testFailed}`);
    
    if (testFailed === 0) {
      console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
      console.log('✅ clientsService.js es compatible con el esquema corregido');
      console.log('✅ Operaciones CRUD funcionan correctamente');
      console.log('✅ Esquema de tabla clients es correcto');
      return { success: true, testPassed, testFailed };
    } else {
      console.log('\n⚠️  ALGUNAS PRUEBAS FALLARON');
      console.log('❌ Se encontraron problemas con clientsService.js');
      console.log('❌ Revisa los errores anteriores para más detalles');
      return { success: false, testPassed, testFailed };
    }
    
  } catch (error) {
    console.error('\n❌ ERROR FATAL EN LAS PRUEBAS:');
    console.error(`Mensaje: ${error.message}`);
    console.error('Stack:', error.stack);
    return { success: false, testPassed, testFailed, error: error.message };
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testClientsCRUD()
    .then(result => {
      console.log('\n' + '='.repeat(80));
      if (result.success) {
        console.log('✅ SCRIPT DE PRUEBA CRUD COMPLETADO EXITOSAMENTE');
        process.exit(0);
      } else {
        console.log('❌ SCRIPT DE PRUEBA CRUD FALLÓ');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ ERROR NO MANEJADO:', error);
      process.exit(1);
    });
}

module.exports = { testClientsCRUD };