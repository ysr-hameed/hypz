import { query } from '../config/database.js';

const createTables = async () => {
  try {
    console.log('🔄 Creating database tables...');

    // Users table - CLEANED (removed email_verification_token)
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email_verified BOOLEAN DEFAULT FALSE,
        reset_password_token VARCHAR(255),
        reset_password_expires TIMESTAMP,
        plan_id VARCHAR(50) DEFAULT 'free_global',
        plan_start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        oauth_provider VARCHAR(50),
        oauth_id VARCHAR(255),
        avatar_url TEXT,
        role VARCHAR(20) DEFAULT 'user',
        is_active BOOLEAN DEFAULT TRUE,
        otp_code VARCHAR(6),
        otp_expires TIMESTAMP,
        otp_attempts INTEGER DEFAULT 0,
        two_factor_enabled BOOLEAN DEFAULT FALSE,
        two_factor_secret VARCHAR(255),
        two_factor_backup_codes TEXT[],
        last_login TIMESTAMP,
        last_login_ip VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes on users table
    await query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_id);
      CREATE INDEX IF NOT EXISTS idx_users_otp_code ON users(otp_code);
      CREATE INDEX IF NOT EXISTS idx_users_two_factor ON users(two_factor_enabled);
    `);

    // Buckets table
    await query(`
      CREATE TABLE IF NOT EXISTS buckets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        visibility VARCHAR(20) DEFAULT 'private',
        description TEXT,
        region VARCHAR(50) DEFAULT 'us-east-1',
        custom_domain VARCHAR(255),
        cors_enabled BOOLEAN DEFAULT FALSE,
        cors_origins TEXT[],
        versioning_enabled BOOLEAN DEFAULT FALSE,
        lifecycle_rules JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, name)
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_buckets_user ON buckets(user_id);
      CREATE INDEX IF NOT EXISTS idx_buckets_slug ON buckets(slug);
    `);

    // Files table
    await query(`
      CREATE TABLE IF NOT EXISTS files (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        bucket_id UUID NOT NULL REFERENCES buckets(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        path TEXT NOT NULL,
        size BIGINT NOT NULL,
        mime_type VARCHAR(100),
        extension VARCHAR(10),
        url TEXT NOT NULL,
        cdn_url TEXT,
        b2_file_id VARCHAR(255),
        version INTEGER DEFAULT 1,
        is_public BOOLEAN DEFAULT FALSE,
        metadata JSONB,
        tags TEXT[],
        downloads INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_files_bucket ON files(bucket_id);
      CREATE INDEX IF NOT EXISTS idx_files_user ON files(user_id);
      CREATE INDEX IF NOT EXISTS idx_files_filename ON files(bucket_id, filename);
      CREATE INDEX IF NOT EXISTS idx_files_b2_id ON files(b2_file_id);
    `);

    // API Keys table
    await query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        key_hash VARCHAR(255) UNIQUE NOT NULL,
        key_prefix VARCHAR(20) NOT NULL,
        permissions JSONB DEFAULT '{"read": true, "write": true, "delete": false}'::jsonb,
        rate_limit INTEGER DEFAULT 1000,
        expires_at TIMESTAMP,
        last_used_at TIMESTAMP,
        last_used_ip VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
      CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
    `);

    // Usage tracking table
    await query(`
      CREATE TABLE IF NOT EXISTS usage_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        storage_bytes BIGINT DEFAULT 0,
        bandwidth_bytes BIGINT DEFAULT 0,
        api_calls INTEGER DEFAULT 0,
        upload_calls INTEGER DEFAULT 0,
        download_calls INTEGER DEFAULT 0,
        delete_calls INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date)
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_usage_user_date ON usage_records(user_id, date);
    `);

    // Payments/Subscriptions table
    await query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_id VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        status VARCHAR(20) DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_gateway VARCHAR(50),
        transaction_id VARCHAR(255),
        invoice_url TEXT,
        period_start DATE,
        period_end DATE,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
    `);

    // Team members table (for collaboration)
    await query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        member_email VARCHAR(255) NOT NULL,
        member_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'viewer',
        permissions JSONB DEFAULT '{"read": true, "write": false, "delete": false}'::jsonb,
        status VARCHAR(20) DEFAULT 'pending',
        invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        joined_at TIMESTAMP,
        UNIQUE(user_id, member_email)
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_team_members_member ON team_members(member_user_id);
    `);

    // Activity logs table
    await query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(50) NOT NULL,
        resource_type VARCHAR(50),
        resource_id UUID,
        details JSONB,
        ip_address VARCHAR(50),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(created_at);
    `);

    // Refresh tokens table
    await query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        revoked BOOLEAN DEFAULT FALSE
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
    `);

    // Admin Settings table
    await query(`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key VARCHAR(100) UNIQUE NOT NULL,
        value JSONB NOT NULL,
        description TEXT,
        category VARCHAR(50) DEFAULT 'general',
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);
      CREATE INDEX IF NOT EXISTS idx_admin_settings_category ON admin_settings(category);
    `);

    // Insert default admin settings
    await query(`
      INSERT INTO admin_settings (key, value, description, category, is_public)
      VALUES 
        ('force_2fa', '{"enabled": false}'::jsonb, 'Force all users to enable 2FA', 'security', false),
        ('max_file_size', '{"bytes": 104857600}'::jsonb, 'Maximum file upload size (100MB default)', 'storage', true),
        ('allowed_file_types', '{"types": ["image/*", "video/*", "application/pdf", "text/*"]}'::jsonb, 'Allowed file MIME types', 'storage', true),
        ('rate_limit_api', '{"requests_per_minute": 60}'::jsonb, 'API rate limit per user', 'security', true),
        ('email_verification_required', '{"enabled": true}'::jsonb, 'Require email verification for new users', 'security', false),
        ('maintenance_mode', '{"enabled": false, "message": "System under maintenance"}'::jsonb, 'Enable maintenance mode', 'general', false)
      ON CONFLICT (key) DO NOTHING;
    `);

    // Trusted devices table - used for "trust this device" feature for 2FA
    await query(`
      CREATE TABLE IF NOT EXISTS trusted_devices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        device_name VARCHAR(255),
        device_token_hash VARCHAR(255) NOT NULL,
        ip_address VARCHAR(50),
        user_agent TEXT,
        last_used_at TIMESTAMP,
        expires_at TIMESTAMP,
        revoked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_trusted_devices_user ON trusted_devices(user_id);
      CREATE INDEX IF NOT EXISTS idx_trusted_devices_expires ON trusted_devices(expires_at);
    `);

    // Plans table
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

    // Insert default plans
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

    console.log('✅ All tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

// Run migration
createTables()
  .then(() => {
    console.log('✅ Database migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
