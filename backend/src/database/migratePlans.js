import { query } from '../config/database.js';

const createPlansTable = async () => {
  try {
    console.log('🔄 Creating plans table...');

    await query(`
      CREATE TABLE IF NOT EXISTS plans (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL,
        popular BOOLEAN DEFAULT FALSE,
        storage_gb INTEGER NOT NULL,
        bandwidth_gb INTEGER NOT NULL,
        api_calls INTEGER NOT NULL,
        api_upload VARCHAR(20) DEFAULT 'unlimited',
        api_download_limit INTEGER,
        analytics VARCHAR(20) DEFAULT 'none',
        custom_domain BOOLEAN DEFAULT FALSE,
        team_members INTEGER DEFAULT 1,
        auto_upgrade BOOLEAN DEFAULT FALSE,
        renewal VARCHAR(20) DEFAULT 'manual',
        price_usd DECIMAL(10, 2) DEFAULT 0,
        price_inr DECIMAL(10, 2) DEFAULT 0,
        after_limit VARCHAR(50),
        features JSONB DEFAULT '{}'::jsonb,
        limits JSONB DEFAULT '{}'::jsonb,
        pricing JSONB DEFAULT '{}'::jsonb,
        lemonsqueezy_variant_id VARCHAR(100),
        razorpay_plan_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Plans table created successfully!');

    // Insert default plans
    console.log('🔄 Inserting default plans...');

    await query(`
      INSERT INTO plans (id, name, type, popular, storage_gb, bandwidth_gb, api_calls, 
        api_upload, analytics, custom_domain, team_members, price_usd, price_inr, 
        after_limit, features, limits)
      VALUES 
      ('free_global', 'Free', 'fixed', false, 1, 3, 50000, 'unlimited', 'none', false, 1, 
        0, 0, 'stop_or_upgrade',
        '{"storage": {"amount": 1, "unit": "GB"}, "bandwidth": {"amount": 3, "unit": "GB/month"}, "apiCalls": {"amount": 50000, "unit": "calls/month"}}'::jsonb,
        '{"afterLimit": "stop_or_upgrade", "autoUpgrade": false}'::jsonb),
      
      ('payg_global', 'Pay As You Go', 'payg', true, 0, 0, 0, 'unlimited', 'advanced', true, 5,
        0, 0, 'pay_as_you_use',
        '{"storage": {"flexible": true}, "bandwidth": {"flexible": true}, "apiCalls": {"flexible": true}}'::jsonb,
        '{"afterLimit": "pay_as_you_use", "autoUpgrade": true}'::jsonb)
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('✅ Default plans inserted successfully!');
  } catch (error) {
    console.error('❌ Error creating plans table:', error);
    throw error;
  }
};

// Run migration
createPlansTable()
  .then(() => {
    console.log('✅ Plans migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Plans migration failed:', error);
    process.exit(1);
  });
