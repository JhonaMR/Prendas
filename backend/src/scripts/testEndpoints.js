/**
 * 🧪 SCRIPT DE TESTING DE ENDPOINTS
 * 
 * Prueba todos los endpoints del backend
 * Uso: node src/scripts/testEndpoints.js
 * 
 * Asegúrate de que el servidor esté corriendo antes de ejecutar este script
 */

function resetTestDatabase() {
    if (process.env.NODE_ENV !== 'test') {
        console.warn('⚠️  Reset de DB omitido (NODE_ENV no es test)');
        return;
    }

    console.log('🧼 Base de datos de referencias limpiada\n');
}

// URL del backend (cambiar si usas otro puerto o IP)
const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

let authToken = '';
let userId = '';

/**
 * Función auxiliar para hacer peticiones
 */
async function request(method, endpoint, body = null) {
    const url = `${BASE_URL}${endpoint}`;
    
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Agregar token si existe
    if (authToken) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Agregar body si existe
    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    return { status: response.status, data };
}

/**
 * Pruebas
 */
async function runTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 TESTING DE ENDPOINTS');
    console.log('='.repeat(60) + '\n');

    let testsPass = 0;
    let testsFailed = 0;

    // ========== TEST 1: Health Check ==========
    try {
        console.log('📍 TEST 1: Health Check');
        const { status, data } = await request('GET', '/health');
        
        if (status === 200 && data.success) {
            console.log('   ✅ PASS - Servidor funcionando');
            testsPass++;
        } else {
            console.log('   ❌ FAIL - Servidor no responde correctamente');
            testsFailed++;
        }
    } catch (error) {
        console.log('   ❌ FAIL - Error:', error.message);
        testsFailed++;
    }

    console.log('');

    // ========== TEST 2: Login con usuario existente ==========
    try {
        console.log('📍 TEST 2: Login con usuario existente (ADM/0000)');
        const { status, data } = await request('POST', '/auth/login', {
            loginCode: 'ADM',
            pin: '0000'
        });
        
        if (status === 200 && data.success && data.data.token) {
            console.log('   ✅ PASS - Login exitoso');
            authToken = data.data.token;
            userId = data.data.user.id;
            testsPass++;
        } else {
            console.log('   ❌ FAIL - Login falló');
            testsFailed++;
        }
    } catch (error) {
        console.log('   ❌ FAIL - Error:', error.message);
        testsFailed++;
    }

    console.log('');

    // ========== TEST 3: Login con credenciales incorrectas ==========
    try {
        console.log('📍 TEST 3: Login con credenciales incorrectas');
        const { status, data } = await request('POST', '/auth/login', {
            loginCode: 'XXX',
            pin: '9999'
        });
        
        if (status === 401 && !data.success) {
            console.log('   ✅ PASS - Login rechazado correctamente');
            testsPass++;
        } else {
            console.log('   ❌ FAIL - Debería rechazar credenciales incorrectas');
            testsFailed++;
        }
    } catch (error) {
        console.log('   ❌ FAIL - Error:', error.message);
        testsFailed++;
    }

    console.log('');

    // ========== TEST 4: Obtener referencias ==========
    try {
        console.log('📍 TEST 4: Obtener referencias');
        const { status, data } = await request('GET', '/references');
        
        if (status === 200 && data.success && Array.isArray(data.data)) {
            console.log(`   ✅ PASS - ${data.data.length} referencias obtenidas`);
            testsPass++;
        } else {
            console.log('   ❌ FAIL - No se pudieron obtener referencias');
            testsFailed++;
        }
    } catch (error) {
        console.log('   ❌ FAIL - Error:', error.message);
        testsFailed++;
    }

    console.log('');

    // ========== TEST 5: Crear referencia ==========
    try {
        console.log('📍 TEST 5: Crear nueva referencia');
        const testRef = {
            id: 'TEST001',
            description: 'Referencia de prueba',
            price: 50000,
            designer: 'Test Designer'
        };

        const { status, data } = await request('POST', '/references', testRef);
        
        if (status === 201 && data.success) {
            console.log('   ✅ PASS - Referencia creada exitosamente');
            testsPass++;

            // Eliminarla después de crearla
            await request('DELETE', '/references/TEST001');
        } else {
            console.log('   ❌ FAIL - No se pudo crear referencia');
            testsFailed++;
        }
    } catch (error) {
        console.log('   ❌ FAIL - Error:', error.message);
        testsFailed++;
    }

    console.log('');

    // ========== TEST 6: Obtener clientes ==========
    try {
        console.log('📍 TEST 6: Obtener clientes');
        const { status, data } = await request('GET', '/clients');
        
        if (status === 200 && data.success && Array.isArray(data.data)) {
            console.log(`   ✅ PASS - ${data.data.length} clientes obtenidos`);
            testsPass++;
        } else {
            console.log('   ❌ FAIL - No se pudieron obtener clientes');
            testsFailed++;
        }
    } catch (error) {
        console.log('   ❌ FAIL - Error:', error.message);
        testsFailed++;
    }

    console.log('');

    // ========== TEST 7: Obtener confeccionistas ==========
    try {
        console.log('📍 TEST 7: Obtener confeccionistas');
        const { status, data } = await request('GET', '/confeccionistas');
        
        if (status === 200 && data.success && Array.isArray(data.data)) {
            console.log(`   ✅ PASS - ${data.data.length} confeccionistas obtenidos`);
            testsPass++;
        } else {
            console.log('   ❌ FAIL - No se pudieron obtener confeccionistas');
            testsFailed++;
        }
    } catch (error) {
        console.log('   ❌ FAIL - Error:', error.message);
        testsFailed++;
    }

    console.log('');

    // ========== TEST 8: Obtener vendedores ==========
    try {
        console.log('📍 TEST 8: Obtener vendedores');
        const { status, data } = await request('GET', '/sellers');
        
        if (status === 200 && data.success && Array.isArray(data.data)) {
            console.log(`   ✅ PASS - ${data.data.length} vendedores obtenidos`);
            testsPass++;
        } else {
            console.log('   ❌ FAIL - No se pudieron obtener vendedores');
            testsFailed++;
        }
    } catch (error) {
        console.log('   ❌ FAIL - Error:', error.message);
        testsFailed++;
    }

    console.log('');

    // ========== TEST 9: Endpoint sin autenticación ==========
    try {
        console.log('📍 TEST 9: Intentar acceder sin token');
        authToken = ''; // Eliminar token temporalmente
        const { status, data } = await request('GET', '/references');
        
        if (status === 401 && !data.success) {
            console.log('   ✅ PASS - Acceso denegado correctamente');
            testsPass++;
        } else {
            console.log('   ❌ FAIL - Debería denegar acceso sin token');
            testsFailed++;
        }

        // Restaurar token para tests siguientes
        const loginRes = await request('POST', '/auth/login', {
            loginCode: 'ADM',
            pin: '0000'
        });
        authToken = loginRes.data.data.token;

    } catch (error) {
        console.log('   ❌ FAIL - Error:', error.message);
        testsFailed++;
    }

    console.log('');

    // ========== RESUMEN ==========
    console.log('='.repeat(60));
    console.log('📊 RESUMEN DE TESTS');
    console.log('='.repeat(60));
    console.log(`✅ Tests exitosos: ${testsPass}`);
    console.log(`❌ Tests fallidos: ${testsFailed}`);
    console.log(`📈 Total: ${testsPass + testsFailed}`);
    console.log('='.repeat(60) + '\n');

    if (testsFailed === 0) {
        console.log('🎉 ¡TODOS LOS TESTS PASARON! El backend está funcionando correctamente.\n');
    } else {
        console.log('⚠️  Algunos tests fallaron. Revisa los mensajes de error arriba.\n');
    }
}

// Ejecutar tests
runTests().catch(error => {
    console.error('\n❌ Error fatal:', error);
    console.error('\n⚠️  Asegúrate de que:');
    console.error('   1. El servidor esté corriendo (npm start)');
    console.error('   2. La base de datos esté inicializada (npm run init-db)');
    console.error('   3. El puerto 3000 esté disponible\n');
});
