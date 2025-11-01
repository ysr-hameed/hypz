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

    // Drop old plans table and create new plans table with updated schema
    await query('DROP TABLE IF EXISTS plans CASCADE');
    console.log('✅ Dropped old plans table');

    await query(`
      CREATE TABLE IF NOT EXISTS plans (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL, -- 'free', 'pro', 'payg'
        price_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
        price_inr DECIMAL(10, 2) NOT NULL DEFAULT 0,
        billing_cycle VARCHAR(50),
        description TEXT,
        popular BOOLEAN DEFAULT false,
        
        -- Storage & Bandwidth
        storage_gb INTEGER DEFAULT 0, -- 0 means unlimited for PAYG
        bandwidth_gb INTEGER DEFAULT 0, -- 0 means pay per use
        free_bandwidth_multiplier INTEGER DEFAULT 2, -- 2x of storage
        
        -- API Limits
        api_calls INTEGER DEFAULT 0, -- 0 means unlimited
        
        -- Team & Collaboration
        team_members INTEGER DEFAULT 1,
        
        -- Features (JSONB for flexibility)
        features JSONB DEFAULT '{}',
        
        -- Custom Domain
        custom_domain BOOLEAN DEFAULT false,
        
        -- Versioning & Backup
        versioning BOOLEAN DEFAULT false,
        backup_retention_days INTEGER DEFAULT 0,
        
        -- CDN
        cdn_enabled BOOLEAN DEFAULT false,
        
        -- PAYG Pricing (NULL for non-PAYG plans)
        payg_storage_rate DECIMAL(10, 4), -- per GB/month
        payg_bandwidth_rate DECIMAL(10, 4), -- per GB
        payg_meta_ops_rate DECIMAL(10, 4), -- per 10k requests
        payg_access_ops_rate DECIMAL(10, 4), -- per 1k requests
        
        -- Payment Settings
        payment_mode VARCHAR(20) DEFAULT 'manual', -- 'auto' or 'manual'
        credit_card_required BOOLEAN DEFAULT false,
        
        -- Metadata
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created new plans table');

    // Insert Free plan
    await query(`
      INSERT INTO plans (
        id, name, type, price_usd, price_inr, billing_cycle, description,
        storage_gb, bandwidth_gb, api_calls, team_members,
        custom_domain, versioning, backup_retention_days, cdn_enabled,
        credit_card_required, popular,
        features
      ) VALUES (
        'free_forever',
        'Free Forever',
        'free',
        0, 0,
        'Forever (no expiry)',
        'Perfect for testing and small projects. No card needed, no hidden fees.',
        1, 3, 50000, 1,
        false, false, 0, false,
        false, false,
        '{
          "support": "Community support",
          "uploads": "Free",
          "downloads": "Within 3 GB/month limit",
          "exceed_behavior": "Uploads and downloads temporarily paused until next reset or upgrade"
        }'::jsonb
      )
    `);
    console.log('✅ Inserted Free plan');

    // Insert Pro plan
    await query(`
      INSERT INTO plans (
        id, name, type, price_usd, price_inr, billing_cycle, description,
        storage_gb, bandwidth_gb, free_bandwidth_multiplier, api_calls, team_members,
        custom_domain, versioning, backup_retention_days, cdn_enabled,
        credit_card_required, popular,
        features
      ) VALUES (
        'pro_monthly',
        'Pro',
        'pro',
        5, 399,
        'Monthly',
        'For creators, students, and developers who want more space, faster access, and advanced team collaboration.',
        100, 200, 2, 2000000, 5,
        true, true, 30, true,
        true, true,
        '{
          "priority_support": "Email + Chat (24/7)",
          "uploads": "Unlimited",
          "downloads": "After free bandwidth, standard pay-as-you-go rates apply",
          "signed_urls": true,
          "free_bandwidth_policy": "2× of stored data each month included"
        }'::jsonb
      )
    `);
    console.log('✅ Inserted Pro plan');

    // Insert PAYG plan
    await query(`
      INSERT INTO plans (
        id, name, type, price_usd, price_inr, billing_cycle, description,
        storage_gb, bandwidth_gb, free_bandwidth_multiplier, api_calls, team_members,
        custom_domain, versioning, backup_retention_days, cdn_enabled,
        payg_storage_rate, payg_bandwidth_rate, payg_meta_ops_rate, payg_access_ops_rate,
        payment_mode, credit_card_required, popular,
        features
      ) VALUES (
        'payg_usage',
        'Pay-As-You-Go',
        'payg',
        0, 0,
        'Monthly (auto or manual)',
        'Scale without limits. You pay only for what you use, billed automatically or manually as per your choice.',
        0, 0, 2, 0, 10,
        true, true, 30, true,
        0.015, 0.05, 0.0002, 0.03,
        'manual', true, false,
        '{
          "write_operations": "Free (uploads, deletes, creates)",
          "uploads": "Always free",
          "private_public_buckets": true,
          "encryption": "AES-256 server-side",
          "free_bandwidth_policy": "2× of storage each month is free egress",
          "billing_auto": "Charges automatically deducted from linked payment card",
          "billing_manual": "User receives notifications 5 days before and on last day",
          "minimum_bill": "No minimum — pay only for actual usage"
        }'::jsonb
      )
    `);
    console.log('✅ Inserted PAYG plan');

    // Add backup_files table for 30-day retention
    await query(`
      CREATE TABLE IF NOT EXISTS backup_files (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        bucket_id UUID REFERENCES buckets(id) ON DELETE CASCADE,
        original_file_id UUID,
        file_name VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        size BIGINT NOT NULL,
        mime_type VARCHAR(100),
        b2_file_id VARCHAR(255),
        b2_version_id VARCHAR(255),
        deleted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        restored BOOLEAN DEFAULT false,
        restored_at TIMESTAMP,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created backup_files table');

    // Create index for quick lookups
    await query('CREATE INDEX IF NOT EXISTS idx_backup_files_user ON backup_files(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_backup_files_expires ON backup_files(expires_at)');
    await query('CREATE INDEX IF NOT EXISTS idx_backup_files_deleted ON backup_files(deleted_at)');

    // Add custom_domains table
    await query(`
      CREATE TABLE IF NOT EXISTS custom_domains (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        bucket_id UUID REFERENCES buckets(id) ON DELETE CASCADE,
        domain VARCHAR(255) NOT NULL UNIQUE,
        verified BOOLEAN DEFAULT false,
        verification_token VARCHAR(100),
        verification_type VARCHAR(20) DEFAULT 'TXT', -- TXT, CNAME
        ssl_enabled BOOLEAN DEFAULT false,
        ssl_certificate TEXT,
        status VARCHAR(20) DEFAULT 'pending', -- pending, active, failed
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        verified_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created custom_domains table');

    // Create index for domains
    await query('CREATE INDEX IF NOT EXISTS idx_custom_domains_user ON custom_domains(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_custom_domains_bucket ON custom_domains(bucket_id)');

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
