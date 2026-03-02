require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { initDatabase, query } = require('./src/config/database');

async function checkReturnItemsSchema() {
  try {
    await initDatabase();
    const result = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'return_reception_items'
      ORDER BY ordinal_position;
    `);
    console.log('return_reception_items table schema:');
    result.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkReturnItemsSchema();
