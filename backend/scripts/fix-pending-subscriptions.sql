-- Script to manually fix pending subscriptions that were paid but not activated
-- Run this SQL in your database to reconcile pending subscriptions

-- 1. Find all pending subscriptions with completed payments
SELECT 
  s.id as subscription_id,
  s.user_id,
  s.plan_id,
  s.status as subscription_status,
  u.email,
  u.subscription_status as user_status,
  u.plan_id as user_plan_id,
  p.status as payment_status,
  p.transaction_id
FROM subscriptions s
JOIN users u ON s.user_id = u.id
LEFT JOIN payments p ON p.user_id = s.user_id AND p.plan_id = s.plan_id
WHERE s.status = 'pending'
ORDER BY s.created_at DESC;

-- 2. Activate pending subscriptions where payment exists and is completed
-- IMPORTANT: Review the results from query 1 before running this!
UPDATE subscriptions 
SET 
  status = 'active',
  updated_at = CURRENT_TIMESTAMP
WHERE id IN (
  SELECT s.id
  FROM subscriptions s
  JOIN payments p ON p.user_id = s.user_id AND p.plan_id = s.plan_id
  WHERE s.status = 'pending' AND p.status = 'completed'
);

-- 3. Update users table to reflect their paid plan
UPDATE users u
SET 
  plan_id = s.plan_id,
  subscription_status = 'active',
  services_active = true,
  plan_start_date = COALESCE(u.plan_start_date, CURRENT_TIMESTAMP),
  updated_at = CURRENT_TIMESTAMP
FROM subscriptions s
WHERE u.id = s.user_id
  AND s.status = 'active'
  AND s.plan_id IS NOT NULL
  AND (u.plan_id IS NULL OR u.plan_id != s.plan_id OR u.subscription_status != 'active');

-- 4. Verify the fix - check active subscriptions
SELECT 
  u.email,
  u.subscription_status,
  u.services_active,
  pl.name as plan_name,
  pl.type as plan_type,
  s.status as subscription_status,
  s.created_at as subscription_created
FROM users u
LEFT JOIN plans pl ON u.plan_id = pl.id
LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
WHERE u.subscription_status = 'active'
ORDER BY s.created_at DESC;

-- 5. Optional: For a specific user by email (replace with actual email)
-- UPDATE users 
-- SET 
--   plan_id = 'pro_monthly',  -- or the plan ID they paid for
--   subscription_status = 'active',
--   services_active = true,
--   plan_start_date = CURRENT_TIMESTAMP
-- WHERE email = 'user@example.com';

-- 6. Optional: Mark specific subscription as active (replace with subscription ID)
-- UPDATE subscriptions 
-- SET status = 'active', updated_at = CURRENT_TIMESTAMP
-- WHERE id = 'subscription-uuid-here';
