import { query } from '../config/database.js';
import logger from '../utils/logger.js';

const createTables = async () => {
  try {
  logger.info('Creating database tables...');

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
        auto_renew BOOLEAN DEFAULT true,
        subscription_id VARCHAR(255),
        subscription_status VARCHAR(50),
        lemon_customer_id VARCHAR(255),
        payment_method_id VARCHAR(255),
        card_last4 VARCHAR(4),
        card_brand VARCHAR(50),
        billing_cycle_day INTEGER DEFAULT 1,
        next_billing_date DATE,
        services_active BOOLEAN DEFAULT true,
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
        versioning_mfa_delete BOOLEAN DEFAULT FALSE,
        default_storage_class VARCHAR(50) DEFAULT 'STANDARD',
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
        version_id VARCHAR(255),
        is_latest BOOLEAN DEFAULT TRUE,
        is_delete_marker BOOLEAN DEFAULT FALSE,
        storage_class VARCHAR(50) DEFAULT 'STANDARD',
        is_public BOOLEAN DEFAULT FALSE,
        metadata JSONB,
        tags TEXT[],
        downloads INTEGER DEFAULT 0,
        upload_status VARCHAR(20) DEFAULT 'completed',
        sha1 VARCHAR(40),
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
      CREATE INDEX IF NOT EXISTS idx_files_version ON files(bucket_id, filename, version_id);
      CREATE INDEX IF NOT EXISTS idx_files_latest ON files(bucket_id, is_latest) WHERE is_latest = true;
      CREATE INDEX IF NOT EXISTS idx_files_storage_class ON files(storage_class);
      CREATE INDEX IF NOT EXISTS idx_files_upload_status ON files(upload_status) WHERE upload_status != 'completed';
    `);

    // Storage Classes table
    await query(`
      CREATE TABLE IF NOT EXISTS storage_classes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        description TEXT,
        cost_per_gb_month DECIMAL(10, 6) NOT NULL,
        retrieval_cost_per_gb DECIMAL(10, 6) DEFAULT 0,
        retrieval_time VARCHAR(50),
        minimum_storage_days INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  logger.info('Created storage_classes table');

    // Insert default storage classes
    await query(`
      INSERT INTO storage_classes (name, display_name, description, cost_per_gb_month, retrieval_cost_per_gb, retrieval_time, minimum_storage_days)
      VALUES 
        ('STANDARD', 'Standard', 'Instant access, highest cost', 0.010, 0.000, 'Instant', 0),
        ('INFREQUENT_ACCESS', 'Infrequent Access', 'Lower cost, quick access when needed', 0.005, 0.010, 'Instant', 30),
        ('GLACIER', 'Glacier', 'Archive storage, 3-5 hour retrieval', 0.002, 0.030, '3-5 hours', 90),
        ('DEEP_ARCHIVE', 'Deep Archive', 'Lowest cost, 12 hour retrieval', 0.001, 0.050, '12 hours', 180)
      ON CONFLICT (name) DO NOTHING;
    `);

    // Storage class transitions table
    await query(`
      CREATE TABLE IF NOT EXISTS storage_class_transitions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
        from_class VARCHAR(50) NOT NULL,
        to_class VARCHAR(50) NOT NULL,
        reason VARCHAR(100),
        transitioned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  logger.info('Created storage_class_transitions table');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_transitions_file ON storage_class_transitions(file_id);
      CREATE INDEX IF NOT EXISTS idx_transitions_date ON storage_class_transitions(transitioned_at);
    `);

    // Multipart uploads table
    await query(`
      CREATE TABLE IF NOT EXISTS multipart_uploads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        upload_id VARCHAR(255) UNIQUE NOT NULL,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        bucket_id UUID NOT NULL REFERENCES buckets(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100),
        total_size BIGINT,
        storage_class VARCHAR(50) DEFAULT 'STANDARD',
        metadata JSONB,
        b2_file_id VARCHAR(255),
        b2_upload_id VARCHAR(255),
        status VARCHAR(20) DEFAULT 'initiated',
        parts_count INTEGER DEFAULT 0,
        completed_parts INTEGER DEFAULT 0,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        aborted_at TIMESTAMP
      );
    `);
  logger.info('Created multipart_uploads table');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_multipart_user ON multipart_uploads(user_id);
      CREATE INDEX IF NOT EXISTS idx_multipart_bucket ON multipart_uploads(bucket_id);
      CREATE INDEX IF NOT EXISTS idx_multipart_upload_id ON multipart_uploads(upload_id);
      CREATE INDEX IF NOT EXISTS idx_multipart_status ON multipart_uploads(status);
      CREATE INDEX IF NOT EXISTS idx_multipart_expires ON multipart_uploads(expires_at);
    `);

    // Upload parts table
    await query(`
      CREATE TABLE IF NOT EXISTS upload_parts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        multipart_upload_id UUID NOT NULL REFERENCES multipart_uploads(id) ON DELETE CASCADE,
        part_number INTEGER NOT NULL,
        size BIGINT NOT NULL,
        etag VARCHAR(255),
        b2_file_id VARCHAR(255),
        sha1_hash VARCHAR(255),
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(multipart_upload_id, part_number)
      );
    `);
  logger.info('Created upload_parts table');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_parts_upload ON upload_parts(multipart_upload_id);
      CREATE INDEX IF NOT EXISTS idx_parts_number ON upload_parts(multipart_upload_id, part_number);
    `);

    // Lifecycle policies table
    await query(`
      CREATE TABLE IF NOT EXISTS lifecycle_policies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        bucket_id UUID NOT NULL REFERENCES buckets(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        enabled BOOLEAN DEFAULT true,
        rules JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(bucket_id, name)
      );
    `);
  logger.info('Created lifecycle_policies table');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_lifecycle_bucket ON lifecycle_policies(bucket_id);
      CREATE INDEX IF NOT EXISTS idx_lifecycle_enabled ON lifecycle_policies(enabled);
    `);

    // Webhook/Event subscriptions table
    await query(`
      CREATE TABLE IF NOT EXISTS event_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        bucket_id UUID REFERENCES buckets(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        endpoint_url TEXT NOT NULL,
        events TEXT[] NOT NULL,
        filters JSONB,
        secret VARCHAR(255),
        enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  logger.info('Created event_subscriptions table');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_event_subs_user ON event_subscriptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_event_subs_bucket ON event_subscriptions(bucket_id);
      CREATE INDEX IF NOT EXISTS idx_event_subs_enabled ON event_subscriptions(enabled);
    `);

    // Webhook deliveries (for tracking)
    await query(`
      CREATE TABLE IF NOT EXISTS webhook_deliveries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        subscription_id UUID NOT NULL REFERENCES event_subscriptions(id) ON DELETE CASCADE,
        event_type VARCHAR(100) NOT NULL,
        payload JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        response_code INTEGER,
        response_body TEXT,
        attempts INTEGER DEFAULT 0,
        next_retry_at TIMESTAMP,
        delivered_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  logger.info('Created webhook_deliveries table');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_webhook_subscription ON webhook_deliveries(subscription_id);
      CREATE INDEX IF NOT EXISTS idx_webhook_status ON webhook_deliveries(status);
      CREATE INDEX IF NOT EXISTS idx_webhook_retry ON webhook_deliveries(next_retry_at) WHERE status = 'pending';
    `);

    // CORS rules table
    await query(`
      CREATE TABLE IF NOT EXISTS cors_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        bucket_id UUID NOT NULL REFERENCES buckets(id) ON DELETE CASCADE,
        allowed_origins TEXT[] NOT NULL,
        allowed_methods TEXT[] NOT NULL,
        allowed_headers TEXT[],
        expose_headers TEXT[],
        max_age_seconds INTEGER DEFAULT 3600,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  logger.info('Created cors_rules table');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_cors_bucket ON cors_rules(bucket_id);
    `);

    // Bucket policies table (IAM-style)
    await query(`
      CREATE TABLE IF NOT EXISTS bucket_policies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        bucket_id UUID NOT NULL UNIQUE REFERENCES buckets(id) ON DELETE CASCADE,
        policy JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  logger.info('Created bucket_policies table');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_bucket_policies_bucket ON bucket_policies(bucket_id);
    `);

    // Pre-signed POST policies
    await query(`
      CREATE TABLE IF NOT EXISTS presigned_post_policies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        bucket_id UUID NOT NULL REFERENCES buckets(id) ON DELETE CASCADE,
        policy JSONB NOT NULL,
        signature VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        max_file_size BIGINT,
        allowed_content_types TEXT[],
        success_action_redirect TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  logger.info('Created presigned_post_policies table');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_presigned_user ON presigned_post_policies(user_id);
      CREATE INDEX IF NOT EXISTS idx_presigned_bucket ON presigned_post_policies(bucket_id);
      CREATE INDEX IF NOT EXISTS idx_presigned_expires ON presigned_post_policies(expires_at);
    `);

    // Batch operations tables
    await query(`
      CREATE TABLE IF NOT EXISTS batch_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        bucket_id UUID REFERENCES buckets(id) ON DELETE CASCADE,
        job_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        total_operations INTEGER DEFAULT 0,
        completed_operations INTEGER DEFAULT 0,
        failed_operations INTEGER DEFAULT 0,
        filters JSONB,
        priority INTEGER DEFAULT 0,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  logger.info('Created batch_jobs table');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_batch_jobs_user ON batch_jobs(user_id);
      CREATE INDEX IF NOT EXISTS idx_batch_jobs_status ON batch_jobs(status);
      CREATE INDEX IF NOT EXISTS idx_batch_jobs_priority ON batch_jobs(priority);
    `);

    // Batch operations (individual operations within a job)
    await query(`
      CREATE TABLE IF NOT EXISTS batch_operations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_id UUID NOT NULL REFERENCES batch_jobs(id) ON DELETE CASCADE,
        file_id UUID REFERENCES files(id) ON DELETE SET NULL,
        operation_type VARCHAR(50) NOT NULL,
        operation_data JSONB,
        status VARCHAR(50) DEFAULT 'pending',
        error_message TEXT,
        retries INTEGER DEFAULT 0,
        executed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  logger.info('Created batch_operations table');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_batch_ops_job ON batch_operations(job_id);
      CREATE INDEX IF NOT EXISTS idx_batch_ops_status ON batch_operations(status);
      CREATE INDEX IF NOT EXISTS idx_batch_ops_file ON batch_operations(file_id);
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
        upload_bytes BIGINT DEFAULT 0,
        download_bytes BIGINT DEFAULT 0,
        api_calls INTEGER DEFAULT 0,
        upload_calls INTEGER DEFAULT 0,
        download_calls INTEGER DEFAULT 0,
        delete_calls INTEGER DEFAULT 0,
        list_calls INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date)
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_usage_user_date ON usage_records(user_id, date);
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_usage_user ON usage_records(user_id);
    `);

    // Subscriptions table - tracks all subscriptions (Pro, PAYG, etc.)
    await query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_id VARCHAR(50) NOT NULL,
        lemon_subscription_id VARCHAR(255) UNIQUE,
        lemon_customer_id VARCHAR(255),
        lemon_order_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        billing_cycle VARCHAR(20) DEFAULT 'monthly',
        current_period_start DATE,
        current_period_end DATE,
        cancel_at_period_end BOOLEAN DEFAULT false,
        cancelled_at TIMESTAMP,
        trial_start DATE,
        trial_end DATE,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  logger.info('Created subscriptions table');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_lemon_id ON subscriptions(lemon_subscription_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);
    `);

    // Unified Payments table - all payment transactions
    await query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
        plan_id VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        status VARCHAR(20) DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_gateway VARCHAR(50) DEFAULT 'lemonsqueezy',
        lemon_order_id VARCHAR(255),
        lemon_subscription_invoice_id VARCHAR(255),
        transaction_id VARCHAR(255),
        invoice_url TEXT,
        billing_reason VARCHAR(100),
        period_start DATE,
        period_end DATE,
        usage_details JSONB,
        refunded BOOLEAN DEFAULT false,
        refund_amount DECIMAL(10, 2),
        refund_reason TEXT,
        refunded_at TIMESTAMP,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  logger.info('Created payments table');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
      CREATE INDEX IF NOT EXISTS idx_payments_subscription ON payments(subscription_id);
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
      CREATE INDEX IF NOT EXISTS idx_payments_lemon_order ON payments(lemon_order_id);
    `);

    // Usage billing table - for PAYG monthly invoices
    await query(`
      CREATE TABLE IF NOT EXISTS usage_billing (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
        billing_period_start DATE NOT NULL,
        billing_period_end DATE NOT NULL,
        storage_gb_hours DECIMAL(12, 2) DEFAULT 0,
        bandwidth_gb DECIMAL(12, 2) DEFAULT 0,
        api_calls INTEGER DEFAULT 0,
        storage_cost DECIMAL(10, 4) DEFAULT 0,
        bandwidth_cost DECIMAL(10, 4) DEFAULT 0,
        total_cost DECIMAL(10, 4) DEFAULT 0,
        payment_status VARCHAR(50) DEFAULT 'pending',
        payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
        lemon_invoice_id VARCHAR(255),
        invoice_generated BOOLEAN DEFAULT false,
        invoice_url TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, billing_period_start)
      );
    `);
  logger.info('Created usage_billing table');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_usage_billing_user ON usage_billing(user_id);
      CREATE INDEX IF NOT EXISTS idx_usage_billing_period ON usage_billing(billing_period_start, billing_period_end);
      CREATE INDEX IF NOT EXISTS idx_usage_billing_status ON usage_billing(payment_status);
    `);

    // Payment methods table - stores user payment methods
    await query(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        lemon_payment_method_id VARCHAR(255),
        type VARCHAR(50) DEFAULT 'card',
        brand VARCHAR(50),
        last4 VARCHAR(4),
        exp_month INTEGER,
        exp_year INTEGER,
        is_default BOOLEAN DEFAULT false,
        billing_email VARCHAR(255),
        billing_name VARCHAR(255),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  logger.info('Created payment_methods table');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_id);
      CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(user_id, is_default);
    `);

    // Webhook events table - for idempotent webhook processing
    await query(`
      CREATE TABLE IF NOT EXISTS webhook_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id VARCHAR(255) UNIQUE NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  logger.info('Created webhook_events table');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);
      CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(event_type);
      CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed_at);
    `);

    // Team members table (for collaboration)
    await query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'member',
        permissions JSONB DEFAULT '{}'::jsonb,
        status VARCHAR(20) DEFAULT 'pending',
        invite_token VARCHAR(255),
        invite_expires_at TIMESTAMP,
        accepted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(inviter_id, email)
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_team_members_inviter ON team_members(inviter_id);
      CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_team_members_token ON team_members(invite_token);
      CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
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

    // Notification preferences table
    await query(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        email_notifications BOOLEAN DEFAULT TRUE,
        usage_alerts BOOLEAN DEFAULT TRUE,
        billing_reminders BOOLEAN DEFAULT TRUE,
        security_updates BOOLEAN DEFAULT TRUE,
        marketing_emails BOOLEAN DEFAULT FALSE,
        product_updates BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);
    `);

    // Notifications table - for in-app notifications and announcements
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        link VARCHAR(500),
        icon VARCHAR(50),
        priority VARCHAR(20) DEFAULT 'normal',
        is_read BOOLEAN DEFAULT FALSE,
        is_global BOOLEAN DEFAULT FALSE,
        metadata JSONB,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
      CREATE INDEX IF NOT EXISTS idx_notifications_global ON notifications(is_global);
    `);

    // Plans table - S3-like storage provider features
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
        
        -- LemonSqueezy Integration
        lemonsqueezy_variant_id VARCHAR(100),
        lemonsqueezy_product_id VARCHAR(100),
        
        -- Storage & Bandwidth Limits
        storage_gb INTEGER DEFAULT 0, -- 0 means unlimited
        bandwidth_gb INTEGER DEFAULT 0, -- 0 means unlimited
        free_bandwidth_multiplier INTEGER DEFAULT 2,
        
        -- API Rate Limits
        api_calls INTEGER DEFAULT 0, -- 0 means unlimited
        requests_per_second INTEGER DEFAULT 10,
        
        -- Bucket Limits
        max_buckets INTEGER DEFAULT 0, -- 0 means unlimited
        public_buckets_allowed BOOLEAN DEFAULT true,
        private_buckets_allowed BOOLEAN DEFAULT true,
        
        -- File Size Limits (MB)
        max_file_size_mb INTEGER DEFAULT 0, -- 0 means unlimited
        max_multipart_file_size_gb INTEGER DEFAULT 0, -- For multipart uploads
        
        -- S3-Compatible Features
        signed_urls_enabled BOOLEAN DEFAULT false,
        presigned_post_enabled BOOLEAN DEFAULT false,
        cors_enabled BOOLEAN DEFAULT false,
        lifecycle_policies_enabled BOOLEAN DEFAULT false,
        object_lock_enabled BOOLEAN DEFAULT false,
        versioning_enabled BOOLEAN DEFAULT false,
        versioning_allowed BOOLEAN DEFAULT false,
        storage_classes_allowed BOOLEAN DEFAULT false,
        multipart_upload_allowed BOOLEAN DEFAULT false,
        replication_enabled BOOLEAN DEFAULT false,
        
        -- Advanced Features
        cdn_enabled BOOLEAN DEFAULT false,
        custom_domain BOOLEAN DEFAULT false,
        ssl_certificates BOOLEAN DEFAULT false,
        
        -- Storage Classes (S3-like)
        storage_classes TEXT[] DEFAULT ARRAY['STANDARD'],
        intelligent_tiering BOOLEAN DEFAULT false,
        
        -- Access Control
        bucket_policies_enabled BOOLEAN DEFAULT false,
        acl_enabled BOOLEAN DEFAULT false,
        iam_policies_enabled BOOLEAN DEFAULT false,
        
        -- Data Management
        batch_operations_enabled BOOLEAN DEFAULT false,
        inventory_reports BOOLEAN DEFAULT false,
        analytics_enabled BOOLEAN DEFAULT false,
        cloudwatch_metrics BOOLEAN DEFAULT false,
        
        -- Backup & Recovery
        backup_retention_days INTEGER DEFAULT 0,
        point_in_time_recovery BOOLEAN DEFAULT false,
        cross_region_replication BOOLEAN DEFAULT false,
        
        -- Encryption
        encryption_at_rest BOOLEAN DEFAULT true,
        encryption_in_transit BOOLEAN DEFAULT true,
        kms_encryption BOOLEAN DEFAULT false,
        
        -- Compliance & Logging
        audit_logs BOOLEAN DEFAULT false,
        access_logs BOOLEAN DEFAULT false,
        compliance_mode BOOLEAN DEFAULT false,
        
        -- Collaboration
        team_members INTEGER DEFAULT 1,
        role_based_access BOOLEAN DEFAULT false,
        
        -- PAYG Pricing (NULL for non-PAYG plans)
        payg_storage_rate DECIMAL(10, 4),
        payg_bandwidth_rate DECIMAL(10, 4),
        payg_request_rate DECIMAL(10, 6),
        
        -- Support Level
        support_level VARCHAR(50) DEFAULT 'community',
        sla_uptime DECIMAL(5, 2) DEFAULT 99.0,
        
        -- Payment Settings
        payment_mode VARCHAR(20) DEFAULT 'manual',
        credit_card_required BOOLEAN DEFAULT false,
        
        -- Additional Features (JSONB for flexibility)
        features JSONB DEFAULT '{}',
        
        -- Metadata
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  logger.info('Created plans table');

    // Add new columns if they don't exist (for existing databases)
    await query(`
      ALTER TABLE plans 
      ADD COLUMN IF NOT EXISTS versioning_allowed BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS storage_classes_allowed BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS multipart_upload_allowed BOOLEAN DEFAULT false;
    `);

    // Insert Free plan with realistic S3 limits
    await query(`
      INSERT INTO plans (
        id, name, type, lemonsqueezy_variant_id, price_usd, price_inr, billing_cycle, description,
        storage_gb, bandwidth_gb, api_calls, requests_per_second,
        max_buckets, public_buckets_allowed, private_buckets_allowed, 
        max_file_size_mb, max_multipart_file_size_gb,
        signed_urls_enabled, presigned_post_enabled, cors_enabled,
        lifecycle_policies_enabled, object_lock_enabled, versioning_enabled,
        versioning_allowed, storage_classes_allowed, multipart_upload_allowed,
        cdn_enabled, custom_domain, bucket_policies_enabled, acl_enabled,
        batch_operations_enabled, inventory_reports, analytics_enabled,
        backup_retention_days, encryption_at_rest, encryption_in_transit,
        audit_logs, access_logs, team_members, role_based_access,
        support_level, sla_uptime, credit_card_required, popular,
        features
      ) VALUES (
        'free_forever',
        'Free Forever',
        'free',
        NULL,
        0, 0,
        'Forever (no expiry)',
        'Perfect for testing and small projects. No card needed, no hidden fees.',
        1, 3, 50000, 5,
        3, true, true,
        100, 0,
        false, false, true,
        false, false, false,
        false, false, false,
        false, false, false, false,
        false, false, false,
        0, true, true,
        false, false, 1, false,
        'community', 99.0, false, false,
        '{
          "support": "Community forum support",
          "rate_limit": "5 requests/second",
          "max_upload_size": "100MB per file",
          "storage_class": "STANDARD only",
          "exceed_behavior": "Service paused until next reset or upgrade"
        }'::jsonb
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        lemonsqueezy_variant_id = EXCLUDED.lemonsqueezy_variant_id,
        private_buckets_allowed = EXCLUDED.private_buckets_allowed,
        updated_at = CURRENT_TIMESTAMP
    `);
  logger.info('Inserted/Updated Free plan');

    // Insert Pro plan with advanced S3 features
    await query(`
      INSERT INTO plans (
        id, name, type, lemonsqueezy_variant_id, price_usd, price_inr, billing_cycle, description,
        storage_gb, bandwidth_gb, free_bandwidth_multiplier, api_calls, requests_per_second,
        max_buckets, public_buckets_allowed, private_buckets_allowed,
        max_file_size_mb, max_multipart_file_size_gb,
        signed_urls_enabled, presigned_post_enabled, cors_enabled,
        lifecycle_policies_enabled, object_lock_enabled, versioning_enabled,
        versioning_allowed, storage_classes_allowed, multipart_upload_allowed, replication_enabled,
        cdn_enabled, custom_domain, ssl_certificates,
        storage_classes, intelligent_tiering,
        bucket_policies_enabled, acl_enabled, iam_policies_enabled,
        batch_operations_enabled, inventory_reports, analytics_enabled, cloudwatch_metrics,
        backup_retention_days, point_in_time_recovery, cross_region_replication,
        encryption_at_rest, encryption_in_transit, kms_encryption,
        audit_logs, access_logs, compliance_mode,
        team_members, role_based_access,
        support_level, sla_uptime, credit_card_required, popular,
        features
      ) VALUES (
        'pro_monthly',
        'Pro',
        'pro',
        '1080591',
        5, 399,
        'Monthly',
        'For creators and developers. Advanced S3-compatible features with unlimited storage.',
        100, 200, 2, 2000000, 50,
        0, true, true,
        5120, 5,
        true, true, true,
        true, false, true,
        true, true, true, false,
        true, true, true,
        ARRAY['STANDARD', 'INTELLIGENT_TIERING'], true,
        true, true, false,
        true, true, true, false,
        30, false, false,
        true, true, false,
        true, true, false,
        5, true,
        'priority', 99.9, true, true,
        '{
          "support": "24/7 Email + Chat support",
          "rate_limit": "50 requests/second",
          "max_upload_size": "5GB per file (multipart supported)",
          "storage_classes": "STANDARD, INTELLIGENT_TIERING",
          "s3_compatibility": "Full S3 API compatibility",
          "uptime_sla": "99.9% uptime guarantee"
        }'::jsonb
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        lemonsqueezy_variant_id = EXCLUDED.lemonsqueezy_variant_id,
        updated_at = CURRENT_TIMESTAMP
    `);
  logger.info('Inserted/Updated Pro plan');

    // Insert PAYG plan with enterprise-grade S3 features
    await query(`
      INSERT INTO plans (
        id, name, type, lemonsqueezy_variant_id, price_usd, price_inr, billing_cycle, description,
        storage_gb, bandwidth_gb, free_bandwidth_multiplier, api_calls, requests_per_second,
        max_buckets, public_buckets_allowed, private_buckets_allowed,
        max_file_size_mb, max_multipart_file_size_gb,
        signed_urls_enabled, presigned_post_enabled, cors_enabled,
        lifecycle_policies_enabled, object_lock_enabled, versioning_enabled,
        versioning_allowed, storage_classes_allowed, multipart_upload_allowed, replication_enabled,
        cdn_enabled, custom_domain, ssl_certificates,
        storage_classes, intelligent_tiering,
        bucket_policies_enabled, acl_enabled, iam_policies_enabled,
        batch_operations_enabled, inventory_reports, analytics_enabled, cloudwatch_metrics,
        backup_retention_days, point_in_time_recovery, cross_region_replication,
        encryption_at_rest, encryption_in_transit, kms_encryption,
        audit_logs, access_logs, compliance_mode,
        team_members, role_based_access,
        payg_storage_rate, payg_bandwidth_rate, payg_request_rate,
        support_level, sla_uptime, payment_mode, credit_card_required, popular,
        features
      ) VALUES (
        'payg',
        'Pay-As-You-Go',
        'payg',
        '1080598',
        0, 0,
        'Monthly (auto or manual)',
        'Enterprise-grade. Truly unlimited everything. Pay only for what you use.',
        0, 0, 2, 0, 200,
        0, true, true,
        0, 0,
        true, true, true,
        true, true, true,
        true, true, true, true,
        true, true, true,
        ARRAY['STANDARD', 'INTELLIGENT_TIERING', 'GLACIER', 'DEEP_ARCHIVE'], true,
        true, true, true,
        true, true, true, true,
        90, true, true,
        true, true, true,
        true, true, true,
        0, true,
        0.015, 0.05, 0.000001,
        'enterprise', 99.99, 'manual', true, false,
        '{
          "support": "24/7 Enterprise support with dedicated engineer",
          "rate_limit": "200 requests/second (burstable to 1000)",
          "max_upload_size": "Unlimited (5TB multipart supported)",
          "storage_classes": "All classes: STANDARD, INTELLIGENT_TIERING, GLACIER, DEEP_ARCHIVE",
          "s3_compatibility": "100% S3 API compatible",
          "uptime_sla": "99.99% uptime guarantee",
          "enterprise_features": "Object Lock, Cross-region replication, Compliance mode",
          "pricing": "$0.015/GB storage, $0.05/GB bandwidth, $0.000001 per request",
          "billing": "No minimums, pay only for usage"
        }'::jsonb
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        lemonsqueezy_variant_id = EXCLUDED.lemonsqueezy_variant_id,
        updated_at = CURRENT_TIMESTAMP
    `);
  logger.info('Inserted/Updated PAYG plan');

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
  logger.info('Created backup_files table');

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
  logger.info('Created custom_domains table');

    // Create index for domains
    await query('CREATE INDEX IF NOT EXISTS idx_custom_domains_user ON custom_domains(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_custom_domains_bucket ON custom_domains(bucket_id)');

    // Add foreign key constraints for plan_id references
    logger.info('Adding foreign key constraints for plan_id...');
    
    // For users table - plan_id should reference plans.id
    await query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'fk_users_plan_id' AND table_name = 'users'
        ) THEN
          ALTER TABLE users 
          ADD CONSTRAINT fk_users_plan_id 
          FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);
    
    // For subscriptions table - plan_id should reference plans.id
    await query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'fk_subscriptions_plan_id' AND table_name = 'subscriptions'
        ) THEN
          ALTER TABLE subscriptions 
          ADD CONSTRAINT fk_subscriptions_plan_id 
          FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);
    
    // For payments table - plan_id should reference plans.id
    await query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'fk_payments_plan_id' AND table_name = 'payments'
        ) THEN
          ALTER TABLE payments 
          ADD CONSTRAINT fk_payments_plan_id 
          FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);
    
    logger.info('Foreign key constraints added successfully');

    // Add additional indexes for better JOIN performance
    logger.info('Adding additional indexes...');
    await query('CREATE INDEX IF NOT EXISTS idx_users_plan_id ON users(plan_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_payments_plan_id ON payments(plan_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status)');
    await query('CREATE INDEX IF NOT EXISTS idx_users_services_active ON users(services_active)');
    logger.info('Additional indexes created successfully');

  logger.info('All tables created successfully');
  } catch (error) {
    logger.error('❌ Error creating tables:', error);
    throw error;
  }
};

// Run migration
createTables()
  .then(() => {
  logger.info('Database migration completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  });
