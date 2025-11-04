import pkg from 'pg';
const { Pool } = pkg;
import config from './src/config/config.js';

const pool = new Pool({ connectionString: config.DATABASE_URL });

(async () => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('=== DATABASE TABLES ===');
    result.rows.forEach(r => console.log(r.table_name));
    
    console.log('\n=== TABLE DETAILS ===');
    for (const row of result.rows) {
      const cols = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [row.table_name]);
      
      console.log(`\n📋 ${row.table_name} (${cols.rows.length} columns):`);
      cols.rows.slice(0, 10).forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));
      if (cols.rows.length > 10) console.log(`  ... and ${cols.rows.length - 10} more columns`);
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
