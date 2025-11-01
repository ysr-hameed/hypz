# Database Migration - Consolidated Schema

## ✅ Migration Consolidation Complete

All database tables and seed data are now in a **single file**: `backend/src/database/migrate.js`

## 📊 Tables Included (12 Total)

### Core Tables
1. **users** - User accounts with OTP, 2FA, OAuth support
2. **buckets** - Storage buckets
3. **files** - File metadata with B2 integration (`b2_file_id` column)
4. **plans** - Subscription plans (Free, PAYG) with pricing

### Feature Tables
5. **api_keys** - API key management
6. **usage_records** - Storage/bandwidth/API usage tracking
7. **payments** - Payment history and transactions
8. **team_members** - Team collaboration
9. **activity_logs** - System activity audit trail

### System Tables
10. **refresh_tokens** - JWT refresh token management
11. **admin_settings** - Global system configuration
12. **trusted_devices** - 2FA trusted device tokens

## 🗑️ Deleted Files

The following separate migration files have been removed:
- ❌ `migratePlans.js`
- ❌ `migrateB2Column.js`
- ❌ `migrations/003_add_otp_2fa.js` (directory deleted)

## 🚀 Running Migrations

```bash
# Run the consolidated migration
cd backend
node src/database/migrate.js
```

## 📝 Key Features

### Users Table Includes:
- Email/password authentication
- OTP verification (6-digit codes, 10-min expiry)
- 2FA with TOTP and backup codes
- OAuth integration (provider, oauth_id)
- Role-based access (user/admin)
- Last login tracking

### Files Table Includes:
- Backblaze B2 integration (`b2_file_id`)
- Soft delete support (`deleted_at`)
- Version tracking
- Public/private access control
- Metadata and tags
- Download counting

### Plans Table Includes:
- Default plans: `free_global`, `payg_global`
- Storage, bandwidth, API call limits
- Pricing in USD and INR
- LemonSqueezy and Razorpay integration IDs
- JSONB features and limits

### Admin Settings Includes Default Values:
- `force_2fa` - Force all users to enable 2FA (default: false)
- `max_file_size` - Max upload size (default: 100MB)
- `allowed_file_types` - Allowed MIME types
- `rate_limit_api` - API rate limit (default: 60/min)
- `email_verification_required` - Require email verification (default: true)
- `maintenance_mode` - System maintenance mode (default: false)

### Trusted Devices Table:
- Device token hashing (bcrypt)
- 30-day expiration
- IP and user agent tracking
- Revocation support

## 🔐 Security Features

- All passwords hashed with bcrypt
- OTP codes expire after 10 minutes
- 2FA backup codes are hashed
- Trusted device tokens are hashed
- API keys are hashed for storage
- Soft delete for files (recoverable)

## 📋 Indexes Created

All tables have proper indexes for:
- Foreign key relationships
- Frequently queried columns
- Unique constraints
- Performance optimization

## ⚙️ Auto-Populated Data

The migration automatically seeds:
- 6 default admin settings
- 2 default plans (Free, PAYG)

All other tables start empty and are populated through API usage.
