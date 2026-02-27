#!/usr/bin/env node

/**
 * Script para validar y limpiar backups corruptos
 * Uso: node validate-and-clean-backups.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const backupDir = path.join(__dirname, '../backups');

// Caracteres/patrones que indican corrupción
const CORRUPTION_PATTERNS = [
  /\\restrict/,
  /[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, // Caracteres de control inválidos
  /^[^\-\-\s].*?[^\n]*?[\x80-\xFF]{10,}/m, // Secuencias largas de bytes altos
];

/**
 * Verifica si un archivo está corrupto
 */
function isFileCorrupted(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    for (const pattern of CORRUPTION_PATTERNS) {
      if (pattern.test(content)) {
        return true;
      }
    }
    
    // Verificar que contiene comandos SQL válidos
    if (!content.includes('CREATE TABLE') && !content.includes('INSERT INTO')) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error al leer ${filePath}: ${error.message}`);
    return true;
  }
}

/**
 * Limpia un archivo de backup corrupto
 */
function cleanBackupFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalSize = content.length;
    
    // Remover líneas con \restrict
    content = content.replace(/\\restrict.*?\n/g, '');
    
    // Remover caracteres de control inválidos (excepto newline, tab, carriage return)
    content = content.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, '');
    
    // Remover secuencias de bytes altos sospechosas
    content = content.replace(/[\x80-\xFF]{10,}/g, '');
    
    // Asegurar que termina con newline
    if (!content.endsWith('\n')) {
      content += '\n';
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    
    const newSize = content.length;
    const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(2);
    
    return {
      success: true,
      originalSize,
      newSize,
      reduction: `${reduction}%`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Valida la estructura SQL básica
 */
function validateSQLStructure(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Verificar que tiene CREATE TABLE
    if (!content.includes('CREATE TABLE')) {
      issues.push('No contiene CREATE TABLE');
    }
    
    // Verificar que tiene PRIMARY KEY
    if (!content.includes('PRIMARY KEY')) {
      issues.push('No contiene PRIMARY KEY');
    }
    
    // Verificar que no tiene líneas incompletas
    const lines = content.split('\n');
    let inMultilineComment = false;
    let inMultilineString = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detectar comentarios multilínea
      if (line.includes('/*')) inMultilineComment = true;
      if (line.includes('*/')) inMultilineComment = false;
      
      // Detectar strings multilínea
      if (line.includes("'") && !line.includes("'::")) {
        inMultilineString = !inMultilineString;
      }
      
      // Verificar líneas sospechosas
      if (line.length > 1000 && !inMultilineComment && !inMultilineString) {
        issues.push(`Línea ${i + 1}: Línea sospechosamente larga (${line.length} caracteres)`);
      }
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  } catch (error) {
    return {
      valid: false,
      issues: [error.message]
    };
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🔍 Validando y limpiando backups...\n');
  
  if (!fs.existsSync(backupDir)) {
    console.error(`❌ Directorio de backups no encontrado: ${backupDir}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.sql'));
  
  if (files.length === 0) {
    console.log('ℹ️  No hay archivos SQL para validar');
    return;
  }
  
  console.log(`📁 Encontrados ${files.length} archivos SQL\n`);
  
  let corruptedCount = 0;
  let cleanedCount = 0;
  let validCount = 0;
  
  for (const file of files) {
    const filePath = path.join(backupDir, file);
    const stats = fs.statSync(filePath);
    const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
    
    process.stdout.write(`📄 ${file} (${sizeInMB} MB)... `);
    
    const corrupted = isFileCorrupted(filePath);
    
    if (corrupted) {
      console.log('⚠️  CORRUPTO');
      corruptedCount++;
      
      // Preguntar si limpiar
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      await new Promise(resolve => {
        rl.question('   ¿Limpiar este archivo? (s/n): ', (answer) => {
          if (answer.toLowerCase() === 's') {
            const result = cleanBackupFile(filePath);
            if (result.success) {
              console.log(`   ✅ Limpiado: ${result.reduction} reducción`);
              cleanedCount++;
              
              // Validar después de limpiar
              const validation = validateSQLStructure(filePath);
              if (validation.valid) {
                console.log(`   ✅ Estructura SQL válida`);
                validCount++;
              } else {
                console.log(`   ⚠️  Problemas en estructura:`);
                validation.issues.forEach(issue => {
                  console.log(`      - ${issue}`);
                });
              }
            } else {
              console.log(`   ❌ Error al limpiar: ${result.error}`);
            }
          }
          rl.close();
          resolve();
        });
      });
    } else {
      console.log('✅ OK');
      validCount++;
      
      // Validar estructura
      const validation = validateSQLStructure(filePath);
      if (!validation.valid) {
        console.log(`   ⚠️  Problemas en estructura:`);
        validation.issues.forEach(issue => {
          console.log(`      - ${issue}`);
        });
      }
    }
  }
  
  console.log('\n📊 RESUMEN:');
  console.log(`   Total archivos: ${files.length}`);
  console.log(`   Válidos: ${validCount}`);
  console.log(`   Corruptos: ${corruptedCount}`);
  console.log(`   Limpiados: ${cleanedCount}`);
  
  if (corruptedCount > 0) {
    console.log('\n⚠️  RECOMENDACIÓN: Ejecutar nuevos backups después de reparar BackupExecutionService.js');
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
