/**
 * 📦 ADAPTADOR DE COMPATIBILIDAD - CONTROLADOR CRUD
 * 
 * Este archivo actúa como adaptador que mantiene compatibilidad hacia atrás
 * con el código existente, importando los nuevos controladores modularizados.
 * 
 * Nuevos módulos:
 * - backend/src/controllers/entities/references/
 * - backend/src/controllers/entities/clients/
 * - backend/src/controllers/entities/confeccionistas/
 * - backend/src/controllers/entities/sellers/
 * - backend/src/controllers/entities/correrias/
 */

// Importar controladores modularizados
const referencesController = require('./entities/references/referencesController');
const clientsController = require('./entities/clients/clientsController');
const confeccionistasController = require('./entities/confeccionistas/confeccionistasController');
const sellersController = require('./entities/sellers/sellersController');
const correriasController = require('./entities/correrias/correriasController');

// ==================== REFERENCIAS ====================
// Delegadas al módulo de references

const getReferences = referencesController.list;
const createReference = referencesController.create;
const updateReference = referencesController.update;
const deleteReference = referencesController.delete;
const getCorreriaReferences = referencesController.getCorreriaReferences;

// ==================== CLIENTES ====================
// Delegadas al módulo de clients

const getClients = clientsController.list;
const createClient = clientsController.create;
const updateClient = clientsController.update;
const deleteClient = clientsController.delete;

// ==================== CONFECCIONISTAS ====================
// Delegadas al módulo de confeccionistas

const getConfeccionistas = confeccionistasController.list;
const createConfeccionista = confeccionistasController.create;
const updateConfeccionista = confeccionistasController.update;
const deleteConfeccionista = confeccionistasController.delete;

// ==================== VENDEDORES ====================
// Delegadas al módulo de sellers

const getSellers = sellersController.list;
const createSeller = sellersController.create;
const updateSeller = sellersController.update;
const deleteSeller = sellersController.delete;

// ==================== CORRERIAS ====================
// Delegadas al módulo de correrias

const getCorrerias = correriasController.list;
const createCorreria = correriasController.create;
const updateCorreria = correriasController.update;
const deleteCorreria = correriasController.delete;

// Exportar todas las funciones manteniendo compatibilidad hacia atrás
module.exports = {
  // Referencias
  getReferences,
  createReference,
  updateReference,
  deleteReference,
  getCorreriaReferences,

  // Clientes
  getClients,
  createClient,
  updateClient,
  deleteClient,

  // Confeccionistas
  getConfeccionistas,
  createConfeccionista,
  updateConfeccionista,
  deleteConfeccionista,

  // Vendedores
  getSellers,
  createSeller,
  updateSeller,
  deleteSeller,

  // Correrias
  getCorrerias,
  createCorreria,
  updateCorreria,
  deleteCorreria
};
