/**
 * Tests para el endpoint POST /api/auth/register
 * 
 * Valida que:
 * 1. Se pueden crear usuarios exitosamente
 * 2. Se rechaza datos inválidos
 * 3. Se previene duplicados de login_code
 */

const request = require('supertest');
const app = require('../server');
const { query } = require('../config/database');

describe('POST /api/auth/register', () => {
  // Limpiar usuarios de prueba después de cada test
  afterEach(async () => {
    try {
      await query('DELETE FROM users WHERE login_code LIKE $1', ['TST%']);
    } catch (error) {
      // Ignorar errores de limpieza
    }
  });

  describe('Registro exitoso', () => {
    test('Debería crear un usuario con datos válidos', async () => {
      const userData = {
        name: 'Test User',
        loginCode: 'TST',
        pin: '1234',
        role: 'general'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(typeof response.body.data.id).toBe('number');
      expect(response.body.data.name).toBe(userData.name);
      expect(response.body.data.loginCode).toBe(userData.loginCode.toUpperCase());
    });

    test('Debería retornar el id auto-generado', async () => {
      const userData = {
        name: 'Test User 2',
        loginCode: 'TS2',
        pin: '5678'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.id).toBeGreaterThan(0);
    });

    test('Debería persistir el usuario en la base de datos', async () => {
      const userData = {
        name: 'Test User 3',
        loginCode: 'TS3',
        pin: '9999'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);

      // Verificar que el usuario existe en la base de datos
      const result = await query(
        'SELECT * FROM users WHERE login_code = $1',
        [userData.loginCode.toUpperCase()]
      );

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].name).toBe(userData.name);
      expect(result.rows[0].id).toBe(response.body.data.id);
    });
  });

  describe('Validación de datos', () => {
    test('Debería rechazar nombre vacío', async () => {
      const userData = {
        name: '',
        loginCode: 'TST',
        pin: '1234'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    test('Debería rechazar nombre muy corto', async () => {
      const userData = {
        name: 'AB',
        loginCode: 'TST',
        pin: '1234'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('Debería rechazar login_code vacío', async () => {
      const userData = {
        name: 'Test User',
        loginCode: '',
        pin: '1234'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('Debería rechazar login_code con longitud incorrecta', async () => {
      const userData = {
        name: 'Test User',
        loginCode: 'TOOLONG',
        pin: '1234'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('Debería rechazar login_code con números', async () => {
      const userData = {
        name: 'Test User',
        loginCode: 'TS1',
        pin: '1234'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('Debería rechazar PIN vacío', async () => {
      const userData = {
        name: 'Test User',
        loginCode: 'TST',
        pin: ''
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('Debería rechazar PIN con longitud incorrecta', async () => {
      const userData = {
        name: 'Test User',
        loginCode: 'TST',
        pin: '12345'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('Debería rechazar PIN con caracteres no numéricos', async () => {
      const userData = {
        name: 'Test User',
        loginCode: 'TST',
        pin: '12AB'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Prevención de duplicados', () => {
    test('Debería rechazar login_code duplicado', async () => {
      const userData = {
        name: 'Test User',
        loginCode: 'DUP',
        pin: '1234'
      };

      // Crear primer usuario
      const response1 = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response1.status).toBe(201);

      // Intentar crear segundo usuario con mismo login_code
      const response2 = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          loginCode: 'DUP',
          pin: '5678'
        });

      expect(response2.status).toBe(409);
      expect(response2.body.success).toBe(false);
      expect(response2.body.message).toContain('ya está en uso');
    });

    test('Debería permitir login_code diferente', async () => {
      const userData1 = {
        name: 'Test User 1',
        loginCode: 'TS1',
        pin: '1234'
      };

      const userData2 = {
        name: 'Test User 2',
        loginCode: 'TS2',
        pin: '5678'
      };

      const response1 = await request(app)
        .post('/api/auth/register')
        .send(userData1);

      expect(response1.status).toBe(201);

      const response2 = await request(app)
        .post('/api/auth/register')
        .send(userData2);

      expect(response2.status).toBe(201);
      expect(response1.body.data.id).not.toBe(response2.body.data.id);
    });
  });

  describe('Campos requeridos', () => {
    test('Debería rechazar si falta name', async () => {
      const userData = {
        loginCode: 'TST',
        pin: '1234'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('Debería rechazar si falta loginCode', async () => {
      const userData = {
        name: 'Test User',
        pin: '1234'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('Debería rechazar si falta pin', async () => {
      const userData = {
        name: 'Test User',
        loginCode: 'TST'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
