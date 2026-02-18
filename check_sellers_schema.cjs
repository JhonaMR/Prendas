require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { initDatabase, query } = require('./backend/src/config/database');

async function checkSellersSchema() {
  try {
    await initDatabase();
    const result = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'sellers'
      ORDER BY ordinal_position;
    `);
    console.log('Sellers table schema:');
    result.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSellersSchema();