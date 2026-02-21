/**
 * Tests para el endpoint POST /api/auth/login
 * 
 * Valida que:
 * 1. El backend retorna HTTP 200 OK con credenciales válidas
 * 2. El header Content-Type es application/json
 * 3. La respuesta contiene los campos success, message, data
 * 4. CORS está configurado correctamente
 * 5. No hay middleware modificando la respuesta
 */

const request = require('supertest');
const app = require('../server');
const { query } = require('../config/database');
const bcrypt = require('bcrypt');

describe('POST /api/auth/login', () => {
  let testUser;

  // Crear usuario de prueba antes de cada test
  beforeEach(async () => {
    try {
      // Limpiar usuarios de prueba anteriores
      await query('DELETE FROM users WHERE login_code = $1', ['TST']);
      
      // Crear usuario de prueba
      const hashedPin = bcrypt.hashSync('1234', 10);
      const result = await query(
        `INSERT INTO users (name, login_code, pin_hash, role, active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, login_code, role, active`,
        ['Test User', 'TST', hashedPin, 'general', true]
      );
      testUser = result.rows[0];
    } catch (error) {
      console.error('Error creating test user:', error);
    }
  });

  // Limpiar después de cada test
  afterEach(async () => {
    try {
      await query('DELETE FROM users WHERE login_code = $1', ['TST']);
    } catch (error) {
      // Ignorar errores de limpieza
    }
  });

  describe('2.1 Verify backend returns correct HTTP status and headers', () => {
    test('✅ Should return 200 OK with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          loginCode: 'TST',
          pin: '1234'
        });

      expect(response.status).toBe(200);
      expect(response.statusCode).toBe(200);
    });

    test('✅ Should have Content-Type: application/json header', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          loginCode: 'TST',
          pin: '1234'
        });

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    test('✅ Should return valid JSON with success, message, data fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          loginCode: 'TST',
          pin: '1234'
        });

      // Verify response is valid JSON
      expect(response.body).toBeDefined();
      expect(typeof response.body).toBe('object');

      // Verify required fields
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');

      // Verify field types
      expect(typeof response.body.success).toBe('boolean');
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.data).toBe('object');
    });

    test('✅ Should return token in data field', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          loginCode: 'TST',
          pin: '1234'
        });

      expect(response.body.data).toHaveProperty('token');
      expect(typeof response.body.data.token).toBe('string');
      expect(response.body.data.token.length).toBeGreaterThan(0);
    });

    test('✅ Should return user data in data field', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          loginCode: 'TST',
          pin: '1234'
        });

      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('name');
      expect(response.body.data.user).toHaveProperty('loginCode');
      expect(response.body.data.user).toHaveProperty('role');
    });

    test('✅ Should have success: true for valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          loginCode: 'TST',
          pin: '1234'
        });

      expect(response.body.success).toBe(true);
    });

    test('✅ Should return 401 Unauthorized with invalid PIN', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          loginCode: 'TST',
          pin: '9999'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('message');
    });

    test('✅ Should return 401 Unauthorized with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          loginCode: 'XXX',
          pin: '1234'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('✅ Should return 400 Bad Request with missing loginCode', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          pin: '1234'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('✅ Should return 400 Bad Request with missing PIN', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          loginCode: 'TST'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('2.2 Verify CORS configuration', () => {
    test('✅ Should include Access-Control-Allow-Origin header', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          loginCode: 'TST',
          pin: '1234'
        });

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    test('✅ Should allow localhost:5173 origin', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Origin', 'http://localhost:5173')
        .send({
          loginCode: 'TST',
          pin: '1234'
        });

      const allowedOrigin = response.headers['access-control-allow-origin'];
      expect(allowedOrigin).toBeDefined();
      expect(['http://localhost:5173', 'http://localhost:3000']).toContain(allowedOrigin);
    });

    test('✅ Should respond to preflight OPTIONS request', async () => {
      const response = await request(app)
        .options('/api/auth/login')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
    });

    test('✅ Should include credentials in CORS headers', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Origin', 'http://localhost:5173')
        .send({
          loginCode: 'TST',
          pin: '1234'
        });

      // CORS credentials should be allowed
      expect(response.headers['access-control-allow-credentials']).toBeDefined();
    });
  });

  describe('2.3 Verify no middleware is modifying responses', () => {
    test('✅ Should not modify status code in middleware', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          loginCode: 'TST',
          pin: '1234'
        });

      // Status should be exactly 200, not modified by middleware
      expect(response.status).toBe(200);
      expect(response.statusCode).toBe(200);
    });

    test('✅ Should not modify response structure', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          loginCode: 'TST',
          pin: '1234'
        });

      // Response should have exactly the expected structure
      expect(Object.keys(response.body).sort()).toEqual(
        ['data', 'message', 'success'].sort()
      );

      // Data should have exactly the expected structure
      expect(Object.keys(response.body.data).sort()).toEqual(
        ['token', 'user'].sort()
      );

      // User should have exactly the expected structure
      expect(Object.keys(response.body.data.user).sort()).toEqual(
        ['id', 'loginCode', 'name', 'role'].sort()
      );
    });

    test('✅ Should not add extra fields to response', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          loginCode: 'TST',
          pin: '1234'
        });

      // Should not have unexpected fields
      expect(response.body).not.toHaveProperty('error');
      expect(response.body).not.toHaveProperty('stack');
      expect(response.body).not.toHaveProperty('timestamp');
    });

    test('✅ Should return valid JSON without extra content', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          loginCode: 'TST',
          pin: '1234'
        });

      // Response text should be valid JSON
      expect(() => JSON.parse(response.text)).not.toThrow();

      // Response should not have any non-JSON content
      const parsed = JSON.parse(response.text);
      expect(parsed).toEqual(response.body);
    });
  });
});
