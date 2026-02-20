/**
 * 📋 VALIDATION SCHEMAS
 * 
 * Esquemas de validación para todos los endpoints
 * Validación: Requirements 7.1
 */

const Joi = require('joi');

// ===== CLIENT SCHEMAS =====
const clientSchemas = {
  create: Joi.object({
    id: Joi.string().required().min(1).max(50),
    name: Joi.string().required().min(1).max(255),
    nit: Joi.string().optional().max(50),
    address: Joi.string().optional().max(255),
    city: Joi.string().optional().max(100),
    seller: Joi.string().optional().max(100),
    active: Joi.number().optional().valid(0, 1)
  }),

  update: Joi.object({
    name: Joi.string().optional().min(1).max(255),
    nit: Joi.string().optional().max(50),
    address: Joi.string().optional().max(255),
    city: Joi.string().optional().max(100),
    seller: Joi.string().optional().max(100),
    active: Joi.number().optional().valid(0, 1)
  })
};

// ===== SELLER SCHEMAS =====
const sellerSchemas = {
  create: Joi.object({
    id: Joi.string().required().min(1).max(50),
    name: Joi.string().required().min(1).max(255),
    active: Joi.number().optional().valid(0, 1)
  }),

  update: Joi.object({
    name: Joi.string().optional().min(1).max(255),
    active: Joi.number().optional().valid(0, 1)
  })
};

// ===== CONFECCIONISTA SCHEMAS =====
const confeccionistaSchemas = {
  create: Joi.object({
    id: Joi.string().required().min(1).max(50),
    name: Joi.string().required().min(1).max(255),
    address: Joi.string().optional().max(255),
    city: Joi.string().optional().max(100),
    phone: Joi.string().optional().max(20),
    score: Joi.string().optional().valid('NA', 'A', 'AA', 'AAA'),
    active: Joi.number().optional().valid(0, 1)
  }),

  update: Joi.object({
    name: Joi.string().optional().min(1).max(255),
    address: Joi.string().optional().max(255),
    city: Joi.string().optional().max(100),
    phone: Joi.string().optional().max(20),
    score: Joi.string().optional().valid('NA', 'A', 'AA', 'AAA'),
    active: Joi.number().optional().valid(0, 1)
  })
};

// ===== REFERENCE SCHEMAS =====
const referenceSchemas = {
  create: Joi.object({
    id: Joi.string().required().min(1).max(50),
    description: Joi.string().required().min(1).max(255),
    price: Joi.number().required().positive(),
    designer: Joi.string().optional().max(255),
    cloth1: Joi.string().optional().max(100),
    avgCloth1: Joi.number().optional().min(0).max(100),
    cloth2: Joi.string().optional().max(100),
    avgCloth2: Joi.number().optional().min(0).max(100),
    correrias: Joi.array().optional().items(Joi.string()),
    active: Joi.number().optional().valid(0, 1)
  }),

  update: Joi.object({
    description: Joi.string().optional().min(1).max(255),
    price: Joi.number().optional().positive(),
    designer: Joi.string().optional().max(255),
    cloth1: Joi.string().optional().max(100),
    avgCloth1: Joi.number().optional().min(0).max(100),
    cloth2: Joi.string().optional().max(100),
    avgCloth2: Joi.number().optional().min(0).max(100),
    correrias: Joi.array().optional().items(Joi.string()),
    active: Joi.number().optional().valid(0, 1)
  })
};

// ===== ORDER SCHEMAS =====
const orderSchemas = {
  create: Joi.object({
    client_id: Joi.string().required(),
    seller_id: Joi.string().optional(),
    correria_id: Joi.string().required(),
    status: Joi.string().optional().valid('pending', 'in_progress', 'completed', 'cancelled'),
    items: Joi.array().optional().items(
      Joi.object({
        reference_id: Joi.string().required(),
        quantity: Joi.number().required().positive(),
        sale_price: Joi.number().required().positive()
      })
    ),
    active: Joi.number().optional().valid(0, 1)
  }),

  update: Joi.object({
    status: Joi.string().optional().valid('pending', 'in_progress', 'completed', 'cancelled'),
    items: Joi.array().optional().items(
      Joi.object({
        reference_id: Joi.string().required(),
        quantity: Joi.number().required().positive(),
        sale_price: Joi.number().required().positive()
      })
    ),
    active: Joi.number().optional().valid(0, 1)
  })
};

// ===== CORRERIA SCHEMAS =====
const correriasSchemas = {
  create: Joi.object({
    id: Joi.string().required().min(1).max(50),
    name: Joi.string().required().min(1).max(255),
    year: Joi.string().required().regex(/^\d{4}$/),
    active: Joi.number().optional().valid(0, 1)
  }),

  update: Joi.object({
    name: Joi.string().optional().min(1).max(255),
    year: Joi.string().optional().regex(/^\d{4}$/),
    active: Joi.number().optional().valid(0, 1)
  })
};

// ===== PAGINATION SCHEMAS =====
const paginationSchema = Joi.object({
  page: Joi.number().optional().min(1).default(1),
  limit: Joi.number().optional().min(1).max(1000).default(25),
  sort: Joi.string().optional(),
  order: Joi.string().optional().valid('asc', 'desc').default('asc')
});

module.exports = {
  clientSchemas,
  sellerSchemas,
  confeccionistaSchemas,
  referenceSchemas,
  orderSchemas,
  correriasSchemas,
  paginationSchema
};
