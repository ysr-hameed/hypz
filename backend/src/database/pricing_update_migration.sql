-- Pricing Consistency Update Migration
-- Run this after deploying the updated code
-- This ensures database pricing matches the application config

-- Update Free Plan
UPDATE plans SET 
  storage_gb = 1,
  bandwidth_gb = 3,
  api_calls = 50000,
  free_bandwidth_multiplier = 3,
  price_usd = 0,
  price_inr = 0,
  description = 'Perfect for testing and small projects. No card needed, no hidden fees.',
  features = jsonb_set(
    COALESCE(features, '{}'::jsonb),
    '{bandwidth_note}',
    '"3GB bandwidth/month (3x storage multiplier)"'::jsonb
  ),
  updated_at = CURRENT_TIMESTAMP
WHERE type = 'free' OR id = 'free_forever';

-- Update Pro Plan
UPDATE plans SET 
  storage_gb = 100,
  bandwidth_gb = 200,
  api_calls = 2000000,
  free_bandwidth_multiplier = 2,
  price_usd = 5,
  price_inr = 399,
  description = 'For creators and developers. Advanced S3-compatible features with generous limits.',
  features = jsonb_set(
    COALESCE(features, '{}'::jsonb),
    '{bandwidth_note}',
    '"200GB bandwidth/month (2x storage multiplier)"'::jsonb
  ),
  updated_at = CURRENT_TIMESTAMP
WHERE type = 'pro' OR id = 'pro_monthly';

-- Update PAYG Plan Rates
UPDATE plans SET 
  payg_storage_rate = 0.015,
  payg_bandwidth_rate = 0.05,
  payg_meta_ops_rate = 0.00,      -- Write operations are FREE
  payg_access_ops_rate = 0.00002, -- Read operations: $0.0002 per 10K = $0.00002 per 1K
  free_bandwidth_multiplier = 3,
  price_usd = 0,
  price_inr = 0,
  description = 'Pay only for what you use. No commitments, scale infinitely.',
  features = jsonb_set(
    jsonb_set(
      jsonb_set(
        COALESCE(features, '{}'::jsonb),
        '{storage_rate}',
        '"$0.015/GB/month"'::jsonb
      ),
      '{bandwidth_rate}',
      '"$0.05/GB (after 3GB free per 1GB storage)"'::jsonb
    ),
    '{write_ops}',
    '"FREE (uploads, deletes, lists)"'::jsonb
  ),
  updated_at = CURRENT_TIMESTAMP
WHERE type = 'payg' OR id = 'payg_usage';

-- Verify the updates
SELECT 
  id,
  name,
  type,
  storage_gb,
  bandwidth_gb,
  api_calls,
  free_bandwidth_multiplier,
  price_usd,
  payg_storage_rate,
  payg_bandwidth_rate
FROM plans
ORDER BY 
  CASE type 
    WHEN 'free' THEN 1 
    WHEN 'pro' THEN 2 
    WHEN 'payg' THEN 3 
    ELSE 4 
  END;
