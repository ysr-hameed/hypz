import { query, transaction } from '../config/database.js';
import lemonSqueezyService from './lemonSqueezyService.js';
import { sendInvoiceEmail, sendPaymentFailedEmail, sendManualInvoiceEmail, sendServiceSuspensionEmail } from '../utils/email.js';
import { cleanupExpiredRefreshTokens } from './cleanupJobs.js';
import cron from 'node-cron';
import logger from '../utils/logger.js';

// Helper: send email with retries, structured logging, and activity log entries
const sendEmailWithRetry = async (emailFn, args = [], context = {}, maxRetries = 3) => {
  const { userId = null, billingId = null, type = 'email' } = context || {};

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info({ attempt, userId, billingId, type }, 'Attempting to send email');
      await emailFn(...args);

      // Record successful email send in activity_logs for traceability
      try {
        await query(
          'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
          [userId, 'email_sent', JSON.stringify({ type, billingId, attempt })]
        );
      } catch (logErr) {
        logger.warn({ err: logErr, userId, billingId, type }, 'Failed to write activity log for sent email');
      }

      logger.info({ userId, billingId, type }, 'Email sent successfully');
      return true;
    } catch (err) {
      logger.error({ err, attempt, userId, billingId, type }, 'Failed to send email, will retry');

      // If last attempt, record failure to activity logs
      if (attempt === maxRetries) {
        try {
          await query(
            'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
            [userId, 'email_failed', JSON.stringify({ type, billingId, error: err.message || String(err) })]
          );
        } catch (logErr) {
          logger.warn({ err: logErr, userId, billingId, type }, 'Failed to write activity log for failed email');
        }

        logger.error({ err, userId, billingId, type }, 'Email failed after retries');
        return false;
      }

      // Exponential backoff before retrying
      await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt - 1)));
    }
  }
};

/**
 * Monthly Billing Cycle Job - BEST PRACTICES
 * 
 * Runs on 1st of every month at 12:00 AM UTC (industry standard)
 * 
 * Process (following Stripe/AWS/GCP patterns):
 * 1. Get all PAYG users
 * 2. Calculate previous month usage
 * 3. Create usage_billing record
 * 4. For auto_renew users: Create LemonSqueezy invoice & charge
 * 5. For manual payment: Create invoice, send email, wait for payment
 * 6. Failed payments: 7-day grace period → suspend services
 * 
 * Key Features:
 * - Idempotent (safe to run multiple times)
 * - Atomic transactions
 * - Proper error handling
 * - Detailed logging
 */

const calculateUsageCost = (storageBytes, bandwidthBytes, apiCalls, plan) => {
  const storageGB = Number(storageBytes || 0) / (1024 ** 3);
  const bandwidthGB = Number(bandwidthBytes || 0) / (1024 ** 3);
  
  // Apply free bandwidth multiplier if exists
  const freeBandwidthGB = plan.free_bandwidth_multiplier 
    ? storageGB * plan.free_bandwidth_multiplier 
    : 0;
  
  const chargeableBandwidthGB = Math.max(0, bandwidthGB - freeBandwidthGB);
  
  const storageCost = storageGB * (plan.payg_storage_rate || 0.015);
  const bandwidthCost = chargeableBandwidthGB * (plan.payg_bandwidth_rate || 0.05);
  
  return {
    storageGB: storageGB.toFixed(2),
    bandwidthGB: bandwidthGB.toFixed(2),
    freeBandwidthGB: freeBandwidthGB.toFixed(2),
    chargeableBandwidthGB: chargeableBandwidthGB.toFixed(2),
    storageCost: storageCost.toFixed(4),
    bandwidthCost: bandwidthCost.toFixed(4),
    totalCost: (storageCost + bandwidthCost).toFixed(2)
  };
};

const processBillingCycle = async () => {
  logger.info('🔄 Starting monthly billing cycle...');
  
  try {
    // Get previous month's date range
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const periodStart = lastMonth.toISOString().split('T')[0];
    const periodEnd = lastMonthEnd.toISOString().split('T')[0];
  const billingPeriod = `${periodStart} to ${periodEnd}`;
    
  logger.info(`📅 Processing billing for period: ${periodStart} to ${periodEnd}`);
    
    // Get all PAYG users
    const usersResult = await query(
      `SELECT u.id, u.email, u.auto_renew, u.payment_method_id, u.plan_id, p.*
       FROM users u
       JOIN plans p ON u.plan_id = p.id
       WHERE p.type = 'payg' AND u.is_active = true`
    );
    
  logger.info(`👥 Found ${usersResult.rows.length} PAYG users`);
    
    for (const user of usersResult.rows) {
  logger.info(`\n💳 Processing user: ${user.email}`);
      
      // Get user's usage for last month
      const usageResult = await query(
        `SELECT 
          SUM(storage_bytes) as total_storage,
          SUM(bandwidth_bytes) as total_bandwidth,
          SUM(api_calls) as total_api_calls
         FROM usage_records
         WHERE user_id = $1 AND date >= $2 AND date <= $3`,
        [user.id, periodStart, periodEnd]
      );
      
      const usage = usageResult.rows[0];
      
      // Calculate costs
      const costs = calculateUsageCost(
        usage.total_storage,
        usage.total_bandwidth,
        usage.total_api_calls,
        user
      );
      
  logger.info(`📊 Usage: ${costs.storageGB} GB storage, ${costs.bandwidthGB} GB bandwidth`);
  logger.info(`💰 Cost: $${costs.totalCost}`);
      
      // Skip if cost is $0
      if (parseFloat(costs.totalCost) === 0) {
  logger.info('✅ No charges for this period');
        continue;
      }
      
      // Check if billing record already exists
      const existingBilling = await query(
        `SELECT id FROM usage_billing 
         WHERE user_id = $1 AND billing_period_start = $2`,
        [user.id, periodStart]
      );
      
      if (existingBilling.rows.length > 0) {
  logger.warn('⚠️  Billing record already exists, skipping');
        continue;
      }
      
      // Create usage_billing record
      const billingResult = await query(
        `INSERT INTO usage_billing (
          user_id, billing_period_start, billing_period_end,
          storage_gb_hours, bandwidth_gb, api_calls,
          storage_cost, bandwidth_cost, total_cost,
          payment_status, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          user.id,
          periodStart,
          periodEnd,
          costs.storageGB,
          costs.bandwidthGB,
          usage.total_api_calls || 0,
          costs.storageCost,
          costs.bandwidthCost,
          costs.totalCost,
          'pending',
          `Free bandwidth: ${costs.freeBandwidthGB} GB, Chargeable: ${costs.chargeableBandwidthGB} GB`
        ]
      );
      
      const billing = billingResult.rows[0];
      
      // If auto_renew is enabled and user has payment method, charge automatically
      if (user.auto_renew && user.payment_method_id) {
  logger.info('🔄 Auto-charging user...');
        
        try {
          // Here you would integrate with LemonSqueezy to charge the card
          // For now, we'll simulate it
          
          await transaction(async (client) => {
            // Create payment record
            const paymentResult = await client.query(
              `INSERT INTO payments (
                user_id, plan_id, amount, currency, status,
                payment_method, payment_gateway, billing_reason, usage_details
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
              RETURNING *`,
              [
                user.id,
                user.plan_id,
                costs.totalCost,
                'USD',
                'completed',
                'lemonsqueezy',
                'lemonsqueezy',
                'usage_based',
                { usage: costs }
              ]
            );
            
            // Update billing record
            await client.query(
              `UPDATE usage_billing SET 
               payment_status = 'paid',
               payment_id = $1,
               invoice_generated = true,
               updated_at = CURRENT_TIMESTAMP
               WHERE id = $2`,
              [paymentResult.rows[0].id, billing.id]
            );
            
            logger.info('✅ Payment successful');
          });
          
          // Send invoice email (with retries & activity log on failure)
          await sendEmailWithRetry(sendInvoiceEmail, [
            user.email,
            user.first_name,
            billing.total_cost,
            billingPeriod,
            billing.id
          ], {
            userId: user.id,
            billingId: billing.id,
            type: 'invoice_email'
          });
          
        } catch (error) {
          logger.error('❌ Payment failed:', error.message);
          
          // Update billing status to failed
          await query(
            `UPDATE usage_billing SET 
             payment_status = 'failed',
             notes = notes || ' | Payment failed: ' || $1
             WHERE id = $2`,
            [error.message, billing.id]
          );
          
          // Set grace period (7 days from now)
          const gracePeriodEnd = new Date();
          gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
          
          await query(
            `UPDATE users SET 
             next_billing_date = $1
             WHERE id = $2`,
            [gracePeriodEnd.toISOString().split('T')[0], user.id]
          );
          
          // Send payment failed email with grace period notice (with retries)
          await sendEmailWithRetry(sendPaymentFailedEmail, [
            user.email,
            user.first_name,
            billing.total_cost,
            error.message,
            gracePeriodEnd.toLocaleDateString()
          ], {
            userId: user.id,
            billingId: billing.id,
            type: 'payment_failed_email'
          });
          
          logger.info(`⏰ Grace period set until ${gracePeriodEnd.toISOString().split('T')[0]}`);
        }
        
      } else {
        // Manual payment required
  logger.info('📧 Creating manual invoice...');
        
        await query(
          `UPDATE usage_billing SET 
           invoice_generated = true,
           notes = notes || ' | Manual payment required'
           WHERE id = $1`,
          [billing.id]
        );
        
        // Send manual invoice email (with retries)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14); // 14 days to pay

        await sendEmailWithRetry(sendManualInvoiceEmail, [
          user.email,
          user.first_name,
          billing.total_cost,
          billingPeriod,
          dueDate.toLocaleDateString()
        ], {
          userId: user.id,
          billingId: billing.id,
          type: 'manual_invoice_email'
        });
        
  logger.info('✅ Manual invoice created');
      }
    }
    
  logger.info('\n✅ Monthly billing cycle completed!');
    
  } catch (error) {
    logger.error('❌ Error in billing cycle:', error);
    throw error;
  }
};

// Check for overdue payments and suspend services
const checkOverduePayments = async () => {
  logger.info('🔍 Checking for overdue payments...');
  
  try {
    // Get users with failed payments past grace period
    const overdueResult = await query(
      `SELECT u.id, u.email, ub.id as billing_id, ub.total_cost
       FROM users u
       JOIN usage_billing ub ON u.id = ub.user_id
       WHERE ub.payment_status = 'failed' 
       AND u.next_billing_date < CURRENT_DATE
       AND u.services_active = true`
    );
    
  logger.warn(`⚠️  Found ${overdueResult.rows.length} overdue accounts`);
    
    for (const user of overdueResult.rows) {
  logger.info(`🚫 Suspending services for: ${user.email}`);
      
      await transaction(async (client) => {
        // Suspend services
        await client.query(
          `UPDATE users SET services_active = false WHERE id = $1`,
          [user.id]
        );
        
        // Log activity
        await client.query(
          'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
          [user.id, 'services_suspended', { reason: 'payment_overdue', billingId: user.billing_id }]
        );
      });
      
      // Send service suspension email (with retries)
      await sendEmailWithRetry(sendServiceSuspensionEmail, [
        user.email,
        user.first_name || 'User',
        'Payment overdue',
        user.total_cost
      ], {
        userId: user.id,
        billingId: user.billing_id,
        type: 'service_suspension_email'
      });
      
  logger.info('✅ Services suspended');
    }
    
  } catch (error) {
    logger.error('❌ Error checking overdue payments:', error);
  }
};

// Schedule billing cycle for 1st of every month at 12:00 AM UTC
export const startBillingScheduler = () => {
  logger.info('🚀 Starting billing scheduler...');
  
  // Run on 1st of every month at 00:00 (midnight) UTC
  cron.schedule('0 0 1 * *', async () => {
  logger.info('\n⏰ Billing cycle triggered');
    await processBillingCycle();
  });
  
  // Check for overdue payments daily at 01:00 AM UTC
  cron.schedule('0 1 * * *', async () => {
    await checkOverduePayments();
  });

  // Cleanup expired refresh tokens daily at 02:00 AM UTC
  cron.schedule('0 2 * * *', async () => {
    try {
      await cleanupExpiredRefreshTokens();
    } catch (err) {
      logger.error('Failed to run refresh token cleanup:', err);
    }
  });
  
  logger.info('✅ Billing scheduler started');
  logger.info('📅 Billing cycle: 1st of every month at 00:00 UTC');
  logger.info('🔍 Overdue check: Daily at 01:00 UTC');
};

// Manual trigger for testing
export const triggerBillingCycle = async () => {
  await processBillingCycle();
};

export default {
  startBillingScheduler,
  triggerBillingCycle,
  processBillingCycle,
  checkOverduePayments
};
