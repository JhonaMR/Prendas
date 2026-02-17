/**
 * Tests para CRUD de Despachos
 * Verifica que la edición y eliminación funcionan correctamente
 */

const { getDatabase, generateId } = require('../config/database');
const {
  createDispatch,
  updateDispatch,
  deleteDispatch,
  getDispatches
} = require('../controllers/movementsController');

describe('Dispatch CRUD Operations', () => {
  let db;

  beforeEach(() => {
    // Limpiar BD antes de cada test
    db = getDatabase();
    db.prepare('DELETE FROM dispatch_items').run();
    db.prepare('DELETE FROM dispatches').run();
    db.close();
  });

  describe('Update Dispatch', () => {
    test('Debe actualizar un despacho existente sin crear duplicado', (done) => {
      const dispatchId = generateId();
      const db = getDatabase();

      // Crear despacho inicial
      db.prepare(`
        INSERT INTO dispatches (id, client_id, correria_id, invoice_no, remission_no, dispatched_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(dispatchId, 'client1', 'correria1', 'F-001', 'R-001', 'user1', new Date().toISOString());

      db.prepare(`
        INSERT INTO dispatch_items (dispatch_id, reference, quantity)
        VALUES (?, ?, ?)
      `).run(dispatchId, 'REF001', 5);

      db.close();

      // Mock request y response
      const req = {
        params: { id: dispatchId },
        body: {
          clientId: 'client2',
          correriaId: 'correria2',
          invoiceNo: 'F-002',
          remissionNo: 'R-002',
          items: [{ reference: 'REF002', quantity: 10 }],
          dispatchedBy: 'user2'
        }
      };

      const res = {
        json: (data) => {
          // Verificar que la respuesta es exitosa
          expect(data.success).toBe(true);
          expect(data.data.id).toBe(dispatchId);

          // Verificar que el despacho se actualizó
          const db2 = getDatabase();
          const dispatch = db2.prepare('SELECT * FROM dispatches WHERE id = ?').get(dispatchId);
          expect(dispatch.client_id).toBe('client2');
          expect(dispatch.invoice_no).toBe('F-002');

          // Verificar que no hay duplicados
          const count = db2.prepare('SELECT COUNT(*) as count FROM dispatches').get();
          expect(count.count).toBe(1);

          db2.close();
          done();
        },
        status: (code) => ({
          json: (data) => {
            done(new Error(`Error: ${data.message}`));
          }
        })
      };

      updateDispatch(req, res);
    });
  });

  describe('Delete Dispatch', () => {
    test('Debe eliminar un despacho y sus items', (done) => {
      const dispatchId = generateId();
      const db = getDatabase();

      // Crear despacho
      db.prepare(`
        INSERT INTO dispatches (id, client_id, correria_id, invoice_no, remission_no, dispatched_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(dispatchId, 'client1', 'correria1', 'F-001', 'R-001', 'user1', new Date().toISOString());

      db.prepare(`
        INSERT INTO dispatch_items (dispatch_id, reference, quantity)
        VALUES (?, ?, ?)
      `).run(dispatchId, 'REF001', 5);

      db.close();

      // Mock request y response
      const req = {
        params: { id: dispatchId }
      };

      const res = {
        json: (data) => {
          // Verificar que la respuesta es exitosa
          expect(data.success).toBe(true);

          // Verificar que el despacho fue eliminado
          const db2 = getDatabase();
          const dispatch = db2.prepare('SELECT * FROM dispatches WHERE id = ?').get(dispatchId);
          expect(dispatch).toBeUndefined();

          // Verificar que los items fueron eliminados
          const items = db2.prepare('SELECT * FROM dispatch_items WHERE dispatch_id = ?').all(dispatchId);
          expect(items.length).toBe(0);

          db2.close();
          done();
        },
        status: (code) => ({
          json: (data) => {
            done(new Error(`Error: ${data.message}`));
          }
        })
      };

      deleteDispatch(req, res);
    });

    test('Debe retornar 404 si el despacho no existe', (done) => {
      const req = {
        params: { id: 'nonexistent' }
      };

      let statusCode = null;
      const res = {
        json: (data) => {
          done(new Error('No debería llamar a json()'));
        },
        status: (code) => {
          statusCode = code;
          return {
            json: (data) => {
              expect(statusCode).toBe(404);
              expect(data.success).toBe(false);
              done();
            }
          };
        }
      };

      deleteDispatch(req, res);
    });
  });

  describe('Get Dispatches', () => {
    test('Debe retornar lista de despachos', (done) => {
      const db = getDatabase();

      // Crear varios despachos
      for (let i = 0; i < 3; i++) {
        const id = generateId();
        db.prepare(`
          INSERT INTO dispatches (id, client_id, correria_id, invoice_no, remission_no, dispatched_by, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, `client${i}`, 'correria1', `F-00${i}`, `R-00${i}`, 'user1', new Date().toISOString());

        db.prepare(`
          INSERT INTO dispatch_items (dispatch_id, reference, quantity)
          VALUES (?, ?, ?)
        `).run(id, `REF00${i}`, 5 + i);
      }

      db.close();

      const req = { query: {} };
      const res = {
        json: (data) => {
          expect(data.success).toBe(true);
          expect(data.data.length).toBe(3);
          expect(data.data[0].items).toBeDefined();
          done();
        }
      };

      getDispatches(req, res);
    });
  });
});
