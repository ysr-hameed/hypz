import { query } from '../config/database.js';

const addB2Column = async () => {
  try {
    console.log('🔄 Adding b2_file_id column to files table...');

    await query(`
      ALTER TABLE files 
      ADD COLUMN IF NOT EXISTS b2_file_id VARCHAR(255);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_files_b2_id ON files(b2_file_id);
    `);

    console.log('✅ b2_file_id column added successfully!');
  } catch (error) {
    console.error('❌ Error adding b2_file_id column:', error);
    throw error;
  }
};

// Run migration
addB2Column()
  .then(() => {
    console.log('✅ B2 column migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ B2 column migration failed:', error);
    process.exit(1);
  });
