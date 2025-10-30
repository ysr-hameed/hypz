import { query } from '../utils/db.js';

export const Billing = {
  async create(userId, plan, amount, razorpayOrderId = null) {
    const result = await query(
      `INSERT INTO billing (user_id, plan, amount, razorpay_order_id, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [userId, plan, amount, razorpayOrderId]
    );
    return result.rows[0];
  },

  async findById(billingId) {
    const result = await query(
      `SELECT * FROM billing WHERE id = $1`,
      [billingId]
    );
    return result.rows[0];
  },

  async findByRazorpayOrderId(orderId) {
    const result = await query(
      `SELECT * FROM billing WHERE razorpay_order_id = $1`,
      [orderId]
    );
    return result.rows[0];
  },

  async findByUser(userId, limit = 20, offset = 0) {
    const result = await query(
      `SELECT * FROM billing 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  },

  async updatePayment(billingId, paymentId, signature, status = 'completed') {
    const result = await query(
      `UPDATE billing 
       SET razorpay_payment_id = $1, 
           razorpay_signature = $2, 
           status = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [paymentId, signature, status, billingId]
    );
    return result.rows[0];
  },

  async updateStatus(billingId, status) {
    const result = await query(
      `UPDATE billing 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, billingId]
    );
    return result.rows[0];
  },

  async getStats(userId) {
    const result = await query(
      `SELECT 
         COUNT(*) as total_transactions,
         COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_spent
       FROM billing 
       WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  },
};

export default Billing;
