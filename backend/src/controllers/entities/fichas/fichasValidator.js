/**
 * 📋 VALIDADOR: Fichas
 * 
 * Valida datos de fichas
 */

const Joi = require('joi');

const validateFichaDiseno = (data) => {
  const schema = Joi.object({
    referencia: Joi.string().required(),
    disenadoraId: Joi.string().required(),
    descripcion: Joi.string().allow(''),
    marca: Joi.string().allow(''),
    novedad: Joi.string().allow(''),
    muestra1: Joi.string().allow(''),
    muestra2: Joi.string().allow(''),
    observaciones: Joi.string().allow(''),
    foto1: Joi.string().allow(null),
    foto2: Joi.string().allow(null),
    materiaPrima: Joi.array().default([]),
    manoObra: Joi.array().default([]),
    insumosDirectos: Joi.array().default([]),
    insumosIndirectos: Joi.array().default([]),
    provisiones: Joi.array().default([]),
    totalMateriaPrima: Joi.number().default(0),
    totalManoObra: Joi.number().default(0),
    totalInsumosDirectos: Joi.number().default(0),
    totalInsumosIndirectos: Joi.number().default(0),
    totalProvisiones: Joi.number().default(0),
    costoTotal: Joi.number().default(0),
    importada: Joi.boolean().default(false),
    createdBy: Joi.string().required()
  });

  return schema.validate(data);
};

const validateFichaCosto = (data) => {
  const schema = Joi.object({
    referencia: Joi.string().required(),
    fichaDisenoId: Joi.string().allow(null),
    descripcion: Joi.string().allow(''),
    marca: Joi.string().allow(''),
    novedad: Joi.string().allow(''),
    muestra1: Joi.string().allow(''),
    muestra2: Joi.string().allow(''),
    observaciones: Joi.string().allow(''),
    foto1: Joi.string().allow(null),
    foto2: Joi.string().allow(null),
    materiaPrima: Joi.array().default([]),
    manoObra: Joi.array().default([]),
    insumosDirectos: Joi.array().default([]),
    insumosIndirectos: Joi.array().default([]),
    provisiones: Joi.array().default([]),
    totalMateriaPrima: Joi.number().default(0),
    totalManoObra: Joi.number().default(0),
    totalInsumosDirectos: Joi.number().default(0),
    totalInsumosIndirectos: Joi.number().default(0),
    totalProvisiones: Joi.number().default(0),
    costoTotal: Joi.number().default(0),
    precioVenta: Joi.number().default(0),
    rentabilidad: Joi.number().default(0),
    margenGanancia: Joi.number().default(0),
    costoContabilizar: Joi.number().default(0),
    desc0Precio: Joi.number().default(0),
    desc0Rent: Joi.number().default(0),
    desc5Precio: Joi.number().default(0),
    desc5Rent: Joi.number().default(0),
    desc10Precio: Joi.number().default(0),
    desc10Rent: Joi.number().default(0),
    desc15Precio: Joi.number().default(0),
    desc15Rent: Joi.number().default(0),
    cantidadTotalCortada: Joi.number().default(0),
    createdBy: Joi.string().required()
  });

  return schema.validate(data);
};

module.exports = {
  validateFichaDiseno,
  validateFichaCosto
};
