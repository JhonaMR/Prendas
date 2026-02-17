/**
 * Script de prueba para la importación masiva de clientes
 */

const { getDatabase } = require('../config/database');
const { bulkImportClients } = require('../services/BulkClientImportService');

console.log('🧪 Iniciando prueba de importación masiva de clientes...\n');

try {
  const db = getDatabase();

  // Verificar que existan vendedores
  const sellers = db.prepare('SELECT id, name FROM sellers').all();
  console.log(`✅ Vendedores encontrados: ${sellers.length}`);
  sellers.forEach(s => console.log(`   - ${s.name} (ID: ${s.id})`));

  if (sellers.length === 0) {
    console.log('\n❌ No hay vendedores en el sistema. Crea algunos primero.');
    process.exit(1);
  }

  // Preparar datos de prueba
  const testRecords = [
    {
      id: 'BULK001',
      name: 'Bulk Test Client 1',
      nit: '111111111',
      address: 'Cra 5 #10-20',
      city: 'Bogotá',
      seller: sellers[0].name
    },
    {
      id: 'BULK002',
      name: 'Bulk Test Client 2',
      nit: '222222222',
      address: 'Cra 7 #15-30',
      city: 'Medellín',
      seller: sellers[0].name
    }
  ];

  console.log(`\n📋 Importando ${testRecords.length} clientes de prueba...\n`);

  const result = bulkImportClients(testRecords);

  if (result.success) {
    console.log(`✅ Importación exitosa!`);
    console.log(`   - Clientes importados: ${result.imported}`);
    console.log(`   - Mensaje: ${result.message}`);

    // Verificar que se insertaron
    const importedClients = db.prepare('SELECT id, name FROM clients WHERE id LIKE ?').all('BULK%');
    console.log(`\n✅ Verificación en BD: ${importedClients.length} clientes encontrados`);
    importedClients.forEach(c => console.log(`   - ${c.id}: ${c.name}`));

    // Limpiar datos de prueba
    console.log('\n🧹 Limpiando datos de prueba...');
    db.prepare('DELETE FROM clients WHERE id LIKE ?').run('BULK%');
    console.log('✅ Datos de prueba eliminados');
  } else {
    console.log(`❌ Error en importación:`);
    console.log(`   - Mensaje: ${result.message}`);
    console.log(`   - Errores:`);
    result.errors.forEach(e => console.log(`     • ${e}`));
  }

  console.log('\n✅ Prueba completada');
  process.exit(0);
} catch (error) {
  console.error('❌ Error durante la prueba:', error);
  process.exit(1);
}
