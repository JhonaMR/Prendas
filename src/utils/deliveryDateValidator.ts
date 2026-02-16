/**
 * 🔍 VALIDADOR DE FECHAS DE ENTREGA - FRONTEND
 * 
 * Valida datos de fechas de entrega en el cliente antes de enviar al servidor
 */

import { DeliveryDate } from '../types';

export interface ValidationError {
  [field: string]: string;
}

export interface BatchValidationResult {
  isValid: boolean;
  errors: {
    [index: number]: ValidationError;
  };
}

/**
 * Validar un campo individual
 */
export const validateField = (field: string, value: any): { isValid: boolean; error?: string } => {
  switch (field) {
    case 'confeccionistaId':
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return { isValid: false, error: 'Confeccionista es requerido' };
      }
      return { isValid: true };

    case 'referenceId':
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return { isValid: false, error: 'Referencia es requerida' };
      }
      return { isValid: true };

    case 'quantity':
      if (value === undefined || value === null || value === '') {
        return { isValid: false, error: 'Cantidad es requerida' };
      }
      if (Number(value) <= 0) {
        return { isValid: false, error: 'Cantidad debe ser mayor a 0' };
      }
      if (!Number.isInteger(Number(value))) {
        return { isValid: false, error: 'Cantidad debe ser un número entero' };
      }
      return { isValid: true };

    case 'sendDate':
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return { isValid: false, error: 'Fecha de envío es requerida' };
      }
      if (!isValidDate(value)) {
        return { isValid: false, error: `Fecha inválida: ${value} (formato: YYYY-MM-DD)` };
      }
      return { isValid: true };

    case 'expectedDate':
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return { isValid: false, error: 'Fecha presupuestada es requerida' };
      }
      if (!isValidDate(value)) {
        return { isValid: false, error: `Fecha inválida: ${value} (formato: YYYY-MM-DD)` };
      }
      return { isValid: true };

    case 'deliveryDate':
      if (value && (typeof value === 'string' && value.trim() !== '')) {
        if (!isValidDate(value)) {
          return { isValid: false, error: `Fecha inválida: ${value} (formato: YYYY-MM-DD)` };
        }
      }
      return { isValid: true };

    case 'process':
      if (value && typeof value !== 'string') {
        return { isValid: false, error: 'Proceso debe ser texto' };
      }
      return { isValid: true };

    case 'observation':
      if (value && typeof value !== 'string') {
        return { isValid: false, error: 'Observación debe ser texto' };
      }
      return { isValid: true };

    default:
      return { isValid: true };
  }
};

/**
 * Validar un registro completo
 */
export const validateRecord = (record: DeliveryDate): { isValid: boolean; errors: ValidationError } => {
  const errors: ValidationError = {};

  const requiredFields = ['confeccionistaId', 'referenceId', 'quantity', 'sendDate', 'expectedDate'];

  requiredFields.forEach(field => {
    const validation = validateField(field, (record as any)[field]);
    if (!validation.isValid) {
      errors[field] = validation.error || 'Campo inválido';
    }
  });

  // Validar campos opcionales
  ['deliveryDate', 'process', 'observation'].forEach(field => {
    const validation = validateField(field, (record as any)[field]);
    if (!validation.isValid) {
      errors[field] = validation.error || 'Campo inválido';
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validar un lote completo de registros
 */
export const validateBatch = (records: DeliveryDate[]): BatchValidationResult => {
  const errors: { [index: number]: ValidationError } = {};

  records.forEach((record, index) => {
    const validation = validateRecord(record);
    if (!validation.isValid) {
      errors[index] = validation.errors;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validar que una fecha sea válida en formato YYYY-MM-DD
 */
function isValidDate(dateString: string): boolean {
  if (typeof dateString !== 'string') return false;

  // Verificar formato YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  // Verificar que sea una fecha válida
  const date = new Date(dateString + 'T00:00:00Z');
  return date instanceof Date && !isNaN(date.getTime());
}
