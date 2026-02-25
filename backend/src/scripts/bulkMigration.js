// ============================================
// SCRIPT: Migración Masiva de Datos
// Carga inicial del sistema
// ============================================

const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_TOKEN = process.env.MIGRATION_TOKEN || '';

class BulkMigration {
  constructor() {
    this.results = {
      references: { success: 0, failed: 0 },
      costSheets: { success: 0, failed: 0 },
      orders: { success: 0, failed: 0 },
      dispatches: { success: 0, failed: 0 },
      receptions: { success: 0, failed: 0 }
    };
    this.errors = [];
  }

  /**
   * Carga un archivo JSON
   */
  loadJsonFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Error cargando ${filePath}: ${error.message}`);
    }
  }

  /**
   * Realiza una llamada a la API
   */
  async callAPI(endpoint, data) {
    try {
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, 
        { data },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_TOKEN}`
          },
          timeout: 30000
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Error en API: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Importa referencias
   */
  async importReferences(filePath) {
    console.log('\n📦 Importando referencias...');
    
    try {
      const data = this.loadJsonFile(filePath);
      console.log(`  Cargando ${data.length} referencias...`);

      const result = await this.callAPI('/api/bulk-import/references', data);
      
      this.results.references = result.results;
      console.log(`  ✅ ${result.results.success} exitosas, ${result.results.failed} fallidas`);
      
      if (result.results.errors.length > 0) {
        this.errors.push({ type: 'references', errors: result.results.errors });
      }
    } catch (error) {
      console.error(`  ❌ ${error.message}`);
      this.errors.push({ type: 'references', error: error.message });
    }
  }

  /**
   * Importa fichas de costo
   */
  async importCostSheets(filePath) {
    console.log('\n💰 Importando fichas de costo...');
    
    try {
      const data = this.loadJsonFile(filePath);
      console.log(`  Cargando ${data.length} fichas...`);

      const result = await this.callAPI('/api/bulk-import/cost-sheets', data);
      
      this.results.costSheets = result.results;
      console.log(`  ✅ ${result.results.success} exitosas, ${result.results.failed} fallidas`);
      
      if (result.results.errors.length > 0) {
        this.errors.push({ type: 'costSheets', errors: result.results.errors });
      }
    } catch (error) {
      console.error(`  ❌ ${error.message}`);
      this.errors.push({ type: 'costSheets', error: error.message });
    }
  }

  /**
   * Importa pedidos
   */
  async importOrders(filePath) {
    console.log('\n📋 Importando pedidos...');
    
    try {
      const data = this.loadJsonFile(filePath);
      console.log(`  Cargando ${data.length} pedidos...`);

      const result = await this.callAPI('/api/bulk-import/orders', data);
      
      this.results.orders = result.results;
      console.log(`  ✅ ${result.results.success} exitosas, ${result.results.failed} fallidas`);
      
      if (result.results.errors.length > 0) {
        this.errors.push({ type: 'orders', errors: result.results.errors });
      }
    } catch (error) {
      console.error(`  ❌ ${error.message}`);
      this.errors.push({ type: 'orders', error: error.message });
    }
  }

  /**
   * Importa despachos
   */
  async importDispatches(filePath) {
    console.log('\n🚚 Importando despachos...');
    
    try {
      const data = this.loadJsonFile(filePath);
      console.log(`  Cargando ${data.length} despachos...`);

      const result = await this.callAPI('/api/bulk-import/dispatches', data);
      
      this.results.dispatches = result.results;
      console.log(`  ✅ ${result.results.success} exitosas, ${result.results.failed} fallidas`);
      
      if (result.results.errors.length > 0) {
        this.errors.push({ type: 'dispatches', errors: result.results.errors });
      }
    } catch (error) {
      console.error(`  ❌ ${error.message}`);
      this.errors.push({ type: 'dispatches', error: error.message });
    }
  }

  /**
   * Importa recepciones
   */
  async importReceptions(filePath) {
    console.log('\n📥 Importando recepciones...');
    
    try {
      const data = this.loadJsonFile(filePath);
      console.log(`  Cargando ${data.length} recepciones...`);

      const result = await this.callAPI('/api/bulk-import/receptions', data);
      
      this.results.receptions = result.results;
      console.log(`  ✅ ${result.results.success} exitosas, ${result.results.failed} fallidas`);
      
      if (result.results.errors.length > 0) {
        this.errors.push({ type: 'receptions', errors: result.results.errors });
      }
    } catch (error) {
      console.error(`  ❌ ${error.message}`);
      this.errors.push({ type: 'receptions', error: error.message });
    }
  }

  /**
   * Ejecuta la migración completa
   */
  async runMigration(config) {
    console.log('🚀 Iniciando migración masiva...');
    console.log(`📍 API: ${API_BASE_URL}`);
    console.log('─'.repeat(50));

    // Orden de importación (importante para integridad referencial)
    if (config.references) await this.importReferences(config.references);
    if (config.costSheets) await this.importCostSheets(config.costSheets);
    if (config.orders) await this.importOrders(config.orders);
    if (config.dispatches) await this.importDispatches(config.dispatches);
    if (config.receptions) await this.importReceptions(config.receptions);

    this.printSummary();
    this.saveReport();
  }

  /**
   * Imprime resumen de migración
   */
  printSummary() {
    console.log('\n' + '═'.repeat(50));
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('═'.repeat(50));

    const totalSuccess = Object.values(this.results).reduce((sum, r) => sum + r.success, 0);
    const totalFailed = Object.values(this.results).reduce((sum, r) => sum + r.failed, 0);

    console.log(`\n✅ Total exitosas: ${totalSuccess}`);
    console.log(`❌ Total fallidas: ${totalFailed}`);

    console.log('\nDetalle por tipo:');
    console.log(`  • Referencias: ${this.results.references.success}/${this.results.references.success + this.results.references.failed}`);
    console.log(`  • Fichas Costo: ${this.results.costSheets.success}/${this.results.costSheets.success + this.results.costSheets.failed}`);
    console.log(`  • Pedidos: ${this.results.orders.success}/${this.results.orders.success + this.results.orders.failed}`);
    console.log(`  • Despachos: ${this.results.dispatches.success}/${this.results.dispatches.success + this.results.dispatches.failed}`);
    console.log(`  • Recepciones: ${this.results.receptions.success}/${this.results.receptions.success + this.results.receptions.failed}`);

    if (this.errors.length > 0) {
      console.log(`\n⚠️  Se encontraron ${this.errors.length} tipos de errores`);
    }
  }

  /**
   * Guarda reporte de migración
   */
  saveReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(__dirname, `../../../migration-report-${timestamp}.json`);

    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      errors: this.errors,
      summary: {
        totalSuccess: Object.values(this.results).reduce((sum, r) => sum + r.success, 0),
        totalFailed: Object.values(this.results).reduce((sum, r) => sum + r.failed, 0)
      }
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`\n📄 Reporte guardado: ${reportPath}`);
  }
}

// ============ EXPORTAR ============

module.exports = BulkMigration;

// ============ USO DESDE CLI ============

if (require.main === module) {
  const configPath = process.argv[2];

  if (!configPath) {
    console.log(`
Uso: node bulkMigration.js <config.json>

Archivo de configuración (config.json):
{
  "references": "path/to/referencias.json",
  "costSheets": "path/to/fichas-costo.json",
  "orders": "path/to/pedidos.json",
  "dispatches": "path/to/despachos.json",
  "receptions": "path/to/recepciones.json"
}

Ejemplo:
  node bulkMigration.js migration-config.json
    `);
    process.exit(1);
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const migration = new BulkMigration();
    migration.runMigration(config).catch(error => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}
