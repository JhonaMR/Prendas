/**
 * Tests para BulkClientImportService
 */

const { bulkImportClients } = require('./BulkClientImportService');
const { getDatabase } = require('../config/database');

// Mock de la base de datos
jest.mock('../config/database');

describe('BulkClientImportService', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      prepare: jest.fn(),
      transaction: jest.fn()
    };
    getDatabase.mockReturnValue(mockDb);
  });

  describe('bulkImportClients', () => {
    it('debe validar que todos los campos requeridos estén presentes', () => {
      const records = [
        { id: 'C001', name: 'Test', nit: '123', address: 'Addr', city: 'City' }
        // Falta seller
      ];

      mockDb.prepare.mockReturnValue({
        all: jest.fn().mockReturnValue([
          { id: 1, name: 'Juan Pérez' }
        ])
      });

      const result = bulkImportClients(records);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Vendedor es requerido');
    });

    it('debe validar que el vendedor exista en el sistema', () => {
      const records = [
        { 
          id: 'C001', 
          name: 'Test Client', 
          nit: '123456', 
          address: 'Cra 5 #10', 
          city: 'Bogotá', 
          seller: 'Vendedor Inexistente'
        }
      ];

      mockDb.prepare.mockReturnValue({
        all: jest.fn().mockReturnValue([
          { id: 1, name: 'Juan Pérez' }
        ])
      });

      const result = bulkImportClients(records);

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('no existe en el sistema');
    });

    it('debe detectar IDs duplicados dentro del lote', () => {
      const records = [
        { 
          id: 'C001', 
          name: 'Client 1', 
          nit: '123456', 
          address: 'Addr1', 
          city: 'City1', 
          seller: 'Juan Pérez'
        },
        { 
          id: 'C001', 
          name: 'Client 2', 
          nit: '789012', 
          address: 'Addr2', 
          city: 'City2', 
          seller: 'Juan Pérez'
        }
      ];

      mockDb.prepare.mockReturnValue({
        all: jest.fn().mockReturnValue([
          { id: 1, name: 'Juan Pérez' }
        ])
      });

      const result = bulkImportClients(records);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('duplicado'))).toBe(true);
    });

    it('debe mapear nombres de vendedores a IDs correctamente', () => {
      const records = [
        { 
          id: 'C001', 
          name: 'Acme Inc', 
          nit: '123456', 
          address: 'Cra 5 #10', 
          city: 'Bogotá', 
          seller: 'Juan Pérez'
        }
      ];

      const mockStmt = {
        all: jest.fn().mockReturnValue([
          { id: 5, name: 'Juan Pérez' }
        ]),
        get: jest.fn().mockReturnValue(null),
        run: jest.fn()
      };

      mockDb.prepare.mockReturnValue(mockStmt);
      mockDb.transaction = jest.fn((fn) => fn);

      const result = bulkImportClients(records);

      // Verificar que se intentó insertar con el ID correcto del vendedor
      expect(mockStmt.run).toHaveBeenCalledWith(
        'C001',
        'Acme Inc',
        '123456',
        'Cra 5 #10',
        'Bogotá',
        5 // ID del vendedor
      );
    });

    it('debe retornar éxito cuando todos los datos son válidos', () => {
      const records = [
        { 
          id: 'C001', 
          name: 'Acme Inc', 
          nit: '123456', 
          address: 'Cra 5 #10', 
          city: 'Bogotá', 
          seller: 'Juan Pérez'
        }
      ];

      const mockStmt = {
        all: jest.fn().mockReturnValue([
          { id: 5, name: 'Juan Pérez' }
        ]),
        get: jest.fn().mockReturnValue(null),
        run: jest.fn()
      };

      mockDb.prepare.mockReturnValue(mockStmt);
      mockDb.transaction = jest.fn((fn) => fn);

      const result = bulkImportClients(records);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(result.errors.length).toBe(0);
    });

    it('debe validar que no existan IDs duplicados en la BD', () => {
      const records = [
        { 
          id: 'C001', 
          name: 'Acme Inc', 
          nit: '123456', 
          address: 'Cra 5 #10', 
          city: 'Bogotá', 
          seller: 'Juan Pérez'
        }
      ];

      const mockStmt = {
        all: jest.fn().mockReturnValue([
          { id: 5, name: 'Juan Pérez' }
        ]),
        get: jest.fn().mockReturnValue({ id: 'C001' }), // Cliente ya existe
        run: jest.fn()
      };

      mockDb.prepare.mockReturnValue(mockStmt);

      const result = bulkImportClients(records);

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('ya existen en la BD');
    });
  });
});
