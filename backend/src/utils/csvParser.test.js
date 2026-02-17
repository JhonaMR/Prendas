/**
 * Tests para csvParser
 */

const { parseCSV, parseCSVLine } = require('./csvParser');

describe('csvParser', () => {
  describe('parseCSVLine', () => {
    it('debe parsear una línea CSV simple', () => {
      const line = 'C001,Acme Inc,123456,Cra 5 #10,Bogotá,Juan Pérez';
      const result = parseCSVLine(line);
      
      expect(result).toEqual([
        'C001',
        'Acme Inc',
        '123456',
        'Cra 5 #10',
        'Bogotá',
        'Juan Pérez'
      ]);
    });

    it('debe manejar valores con espacios', () => {
      const line = '  C001  ,  Acme Inc  ,  123456  ';
      const result = parseCSVLine(line);
      
      expect(result).toEqual(['C001', 'Acme Inc', '123456']);
    });

    it('debe manejar valores entre comillas', () => {
      const line = '"C001","Acme Inc","123456"';
      const result = parseCSVLine(line);
      
      expect(result).toEqual(['C001', 'Acme Inc', '123456']);
    });

    it('debe manejar comillas escapadas dentro de valores', () => {
      const line = '"C001","Acme ""Inc""","123456"';
      const result = parseCSVLine(line);
      
      expect(result).toEqual(['C001', 'Acme "Inc"', '123456']);
    });

    it('debe manejar comas dentro de valores entre comillas', () => {
      const line = '"C001","Acme, Inc.","123456"';
      const result = parseCSVLine(line);
      
      expect(result).toEqual(['C001', 'Acme, Inc.', '123456']);
    });
  });

  describe('parseCSV', () => {
    it('debe parsear un CSV válido', () => {
      const csv = `id,name,nit,address,city,seller
C001,Acme Inc,123456,Cra 5 #10,Bogotá,Juan Pérez
C002,Tech Ltd,789012,Cra 7 #20,Medellín,María García`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(2);
      expect(result.data[0]).toEqual({
        id: 'C001',
        name: 'Acme Inc',
        nit: '123456',
        address: 'Cra 5 #10',
        city: 'Bogotá',
        seller: 'Juan Pérez'
      });
    });

    it('debe validar headers esperados', () => {
      const csv = `id,name,nit
C001,Acme Inc,123456`;

      const result = parseCSV(csv, ['id', 'name', 'nit', 'address']);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Headers faltantes');
      expect(result.error).toContain('address');
    });

    it('debe retornar error si no hay datos', () => {
      const csv = 'id,name,nit';

      const result = parseCSV(csv);

      expect(result.success).toBe(false);
      expect(result.error).toContain('al menos un header y una fila');
    });

    it('debe ignorar líneas vacías', () => {
      const csv = `id,name,nit,address,city,seller
C001,Acme Inc,123456,Cra 5 #10,Bogotá,Juan Pérez

C002,Tech Ltd,789012,Cra 7 #20,Medellín,María García`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(2);
    });

    it('debe retornar error si el número de columnas no coincide', () => {
      const csv = `id,name,nit,address,city,seller
C001,Acme Inc,123456,Cra 5 #10,Bogotá
C002,Tech Ltd,789012,Cra 7 #20,Medellín,María García`;

      const result = parseCSV(csv);

      expect(result.success).toBe(false);
      expect(result.error).toContain('número de columnas no coincide');
    });

    it('debe convertir headers a minúsculas', () => {
      const csv = `ID,Name,NIT,Address,City,Seller
C001,Acme Inc,123456,Cra 5 #10,Bogotá,Juan Pérez`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('name');
      expect(result.data[0]).toHaveProperty('nit');
    });

    it('debe manejar CSV con valores entre comillas', () => {
      const csv = `id,name,nit,address,city,seller
"C001","Acme Inc","123456","Cra 5, #10","Bogotá","Juan Pérez"`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.data[0].address).toBe('Cra 5, #10');
    });
  });
});
