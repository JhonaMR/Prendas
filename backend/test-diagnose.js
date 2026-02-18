// Script de prueba para ejecutar el diagnóstico
const { diagnoseClientsSchema } = require('./src/scripts/diagnoseClientsSchema');

async function runDiagnosis() {
  console.log('🚀 Ejecutando diagnóstico del esquema de tabla clients...\n');
  
  try {
    const report = await diagnoseClientsSchema();
    
    console.log('\n📊 Resultado del diagnóstico:');
    console.log(JSON.stringify(report, null, 2));
    
    if (report.issues.critical.length > 0) {
      console.log('\n❌ Se encontraron problemas críticos que deben resolverse:');
      report.issues.critical.forEach(issue => console.log(`  - ${issue}`));
    } else {
      console.log('\n✅ No se encontraron problemas críticos.');
    }
    
  } catch (error) {
    console.error('❌ Error al ejecutar diagnóstico:', error);
    process.exit(1);
  }
}

// Ejecutar diagnóstico
runDiagnosis();