/**
 * 🧪 VALIDATION TESTS
 * 
 * Tests para verificar que los esquemas de validación funcionan correctamente
 */

const {
  clientSchemas,
  sellerSchemas,
  confeccionistaSchemas,
  referenceSchemas,
  orderSchemas,
  correriasSchemas,
  paginationSchema
} = require('../validators/schemas');

describe('✅ Client Validation Schema Tests', () => {
  test('✅ Should validate valid client creation', () => {
    const validClient = {
      id: 'client-1',
      name: 'Test Client',
      nit: '123456',
      address: 'Test Address',
      city: 'Test City',
      seller: 'Test Seller'
    };

    const { error, value } = clientSchemas.create.validate(validClient);
    expect(error).toBeUndefined();
    expect(value).toEqual(validClient);
  });

  test('✅ Should reject client without required fields', () => {
    const invalidClient = {
      name: 'Test Client'
      // Missing id
    };

    const { error } = clientSchemas.create.validate(invalidClient);
    expect(error).toBeDefined();
  });

  test('✅ Should validate client update', () => {
    const updateData = {
      name: 'Updated Client',
      city: 'Updated City'
    };

    const { error, value } = clientSchemas.update.validate(updateData);
    expect(error).toBeUndefined();
    expect(value).toEqual(updateData);
  });

  test('✅ Should strip unknown fields', () => {
    const clientWithExtra = {
      id: 'client-1',
      name: 'Test Client',
      nit: '123456',
      address: 'Test Address',
      city: 'Test City',
      seller: 'Test Seller',
      unknownField: 'should be removed'
    };

    const { value } = clientSchemas.create.validate(clientWithExtra, { stripUnknown: true });
    expect(value.unknownField).toBeUndefined();
  });
});

describe('✅ Seller Validation Schema Tests', () => {
  test('✅ Should validate valid seller creation', () => {
    const validSeller = {
      id: 'seller-1',
      name: 'Test Seller'
    };

    const { error, value } = sellerSchemas.create.validate(validSeller);
    expect(error).toBeUndefined();
    expect(value).toEqual(validSeller);
  });

  test('✅ Should reject seller without name', () => {
    const invalidSeller = {
      id: 'seller-1'
      // Missing name
    };

    const { error } = sellerSchemas.create.validate(invalidSeller);
    expect(error).toBeDefined();
  });
});

describe('✅ Confeccionista Validation Schema Tests', () => {
  test('✅ Should validate valid confeccionista creation', () => {
    const validConf = {
      id: 'conf-1',
      name: 'Test Confeccionista',
      score: 'A',
      active: 1
    };

    const { error, value } = confeccionistaSchemas.create.validate(validConf);
    expect(error).toBeUndefined();
  });

  test('✅ Should validate score enum', () => {
    const validScores = ['NA', 'A', 'AA', 'AAA'];

    validScores.forEach(score => {
      const conf = {
        id: 'conf-1',
        name: 'Test',
        score
      };

      const { error } = confeccionistaSchemas.create.validate(conf);
      expect(error).toBeUndefined();
    });
  });

  test('✅ Should reject invalid score', () => {
    const invalidConf = {
      id: 'conf-1',
      name: 'Test',
      score: 'INVALID'
    };

    const { error } = confeccionistaSchemas.create.validate(invalidConf);
    expect(error).toBeDefined();
  });
});

describe('✅ Reference Validation Schema Tests', () => {
  test('✅ Should validate valid reference creation', () => {
    const validRef = {
      id: 'ref-1',
      description: 'Test Reference',
      price: 100,
      designer: 'Test Designer'
    };

    const { error, value } = referenceSchemas.create.validate(validRef);
    expect(error).toBeUndefined();
  });

  test('✅ Should reject reference with negative price', () => {
    const invalidRef = {
      id: 'ref-1',
      description: 'Test',
      price: -100
    };

    const { error } = referenceSchemas.create.validate(invalidRef);
    expect(error).toBeDefined();
  });

  test('✅ Should validate cloth percentages', () => {
    const validRef = {
      id: 'ref-1',
      description: 'Test',
      price: 100,
      cloth1: 'Cotton',
      avgCloth1: 50,
      cloth2: 'Polyester',
      avgCloth2: 50
    };

    const { error } = referenceSchemas.create.validate(validRef);
    expect(error).toBeUndefined();
  });

  test('✅ Should reject cloth percentage > 100', () => {
    const invalidRef = {
      id: 'ref-1',
      description: 'Test',
      price: 100,
      cloth1: 'Cotton',
      avgCloth1: 150
    };

    const { error } = referenceSchemas.create.validate(invalidRef);
    expect(error).toBeDefined();
  });
});

describe('✅ Order Validation Schema Tests', () => {
  test('✅ Should validate valid order creation', () => {
    const validOrder = {
      client_id: 'client-1',
      correria_id: 'correria-1',
      status: 'pending',
      items: [
        { reference_id: 'ref-1', quantity: 10 }
      ]
    };

    const { error } = orderSchemas.create.validate(validOrder);
    expect(error).toBeUndefined();
  });

  test('✅ Should validate order status enum', () => {
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];

    validStatuses.forEach(status => {
      const order = {
        client_id: 'client-1',
        correria_id: 'correria-1',
        status
      };

      const { error } = orderSchemas.create.validate(order);
      expect(error).toBeUndefined();
    });
  });

  test('✅ Should reject order with invalid status', () => {
    const invalidOrder = {
      client_id: 'client-1',
      correria_id: 'correria-1',
      status: 'invalid_status'
    };

    const { error } = orderSchemas.create.validate(invalidOrder);
    expect(error).toBeDefined();
  });

  test('✅ Should validate order items', () => {
    const validOrder = {
      client_id: 'client-1',
      correria_id: 'correria-1',
      items: [
        { reference_id: 'ref-1', quantity: 10 },
        { reference_id: 'ref-2', quantity: 20 }
      ]
    };

    const { error } = orderSchemas.create.validate(validOrder);
    expect(error).toBeUndefined();
  });

  test('✅ Should reject order item with zero quantity', () => {
    const invalidOrder = {
      client_id: 'client-1',
      correria_id: 'correria-1',
      items: [
        { reference_id: 'ref-1', quantity: 0 }
      ]
    };

    const { error } = orderSchemas.create.validate(invalidOrder);
    expect(error).toBeDefined();
  });
});

describe('✅ Correria Validation Schema Tests', () => {
  test('✅ Should validate valid correria creation', () => {
    const validCorreria = {
      id: 'correria-1',
      name: 'Test Correria',
      year: '2025'
    };

    const { error } = correriasSchemas.create.validate(validCorreria);
    expect(error).toBeUndefined();
  });

  test('✅ Should validate year format', () => {
    const validCorreria = {
      id: 'correria-1',
      name: 'Test',
      year: '2025'
    };

    const { error } = correriasSchemas.create.validate(validCorreria);
    expect(error).toBeUndefined();
  });

  test('✅ Should reject invalid year format', () => {
    const invalidCorreria = {
      id: 'correria-1',
      name: 'Test',
      year: '25' // Should be 4 digits
    };

    const { error } = correriasSchemas.create.validate(invalidCorreria);
    expect(error).toBeDefined();
  });
});

describe('✅ Pagination Schema Tests', () => {
  test('✅ Should validate pagination parameters', () => {
    const validPagination = {
      page: 1,
      limit: 25,
      sort: 'name',
      order: 'asc'
    };

    const { error, value } = paginationSchema.validate(validPagination);
    expect(error).toBeUndefined();
    expect(value.page).toBe(1);
    expect(value.limit).toBe(25);
  });

  test('✅ Should set default values', () => {
    const emptyPagination = {};

    const { value } = paginationSchema.validate(emptyPagination);
    expect(value.page).toBe(1);
    expect(value.limit).toBe(25);
    expect(value.order).toBe('asc');
  });

  test('✅ Should reject invalid page', () => {
    const invalidPagination = {
      page: 0 // Must be >= 1
    };

    const { error } = paginationSchema.validate(invalidPagination);
    expect(error).toBeDefined();
  });

  test('✅ Should reject limit > 1000', () => {
    const invalidPagination = {
      limit: 1001
    };

    const { error } = paginationSchema.validate(invalidPagination);
    expect(error).toBeDefined();
  });

  test('✅ Should validate order enum', () => {
    const validOrders = ['asc', 'desc'];

    validOrders.forEach(order => {
      const pagination = { order };
      const { error } = paginationSchema.validate(pagination);
      expect(error).toBeUndefined();
    });
  });

  test('✅ Should reject invalid order', () => {
    const invalidPagination = {
      order: 'invalid'
    };

    const { error } = paginationSchema.validate(invalidPagination);
    expect(error).toBeDefined();
  });
});

describe('✅ Schema Error Messages Tests', () => {
  test('✅ Should provide clear error messages', () => {
    const invalidClient = {
      name: 'Test'
      // Missing id
    };

    const { error } = clientSchemas.create.validate(invalidClient);
    expect(error.details[0].message).toContain('required');
  });

  test('✅ Should report multiple errors', () => {
    const invalidClient = {
      // Missing id and name
    };

    const { error } = clientSchemas.create.validate(invalidClient, { abortEarly: false });
    expect(error.details.length).toBeGreaterThan(1);
  });
});
