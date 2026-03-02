#!/usr/bin/env node

/**
 * Script para generar el hash bcrypt del PIN del usuario Soporte
 * Uso: node generate-soporte-hash.js
 */

const bcrypt = require('bcrypt');

const PIN = '3438';
const ROUNDS = 10;

console.log('🔐 Generando hash bcrypt para el usuario Soporte...\n');
console.log(`PIN: ${PIN}`);
console.log(`Rounds: ${ROUNDS}\n`);

const hash = bcrypt.hashSync(PIN, ROUNDS);

console.log('✅ Hash generado:\n');
console.log(hash);
console.log('\n📝 Usa este hash en el script SQL init-soporte-user.sql\n');

// Verificar que el hash es correcto
const isValid = bcrypt.compareSync(PIN, hash);
console.log(`✓ Verificación: ${isValid ? 'CORRECTA' : 'INCORRECTA'}\n`);
