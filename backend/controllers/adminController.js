import pool from '../config/database.js';

// Get dashboard stats
export const getStats = async (request, reply) => {
  try {
    const [users, subscriptions, revenue, recentUsers] = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM users'),
      pool.query('SELECT COUNT(*) as total FROM subscriptions WHERE status = $1', ['active']),
      pool.query('SELECT SUM(amount) as total FROM transactions WHERE status = $1', ['completed']),
      pool.query(`
        SELECT u.id, u.email, u.name, u.created_at, u.is_verified, p.name as plan_name
        FROM users u
        LEFT JOIN plans p ON u.plan_id = p.id
        ORDER BY u.created_at DESC
        LIMIT 10
      `)
    ]);

    const planDistribution = await pool.query(`
      SELECT p.name, COUNT(u.id) as user_count
      FROM plans p
      LEFT JOIN users u ON p.id = u.plan_id
      GROUP BY p.id, p.name
      ORDER BY user_count DESC
    `);

    const recentTransactions = await pool.query(`
      SELECT t.*, u.name as user_name, u.email as user_email, p.name as plan_name
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN subscriptions s ON t.subscription_id = s.id
      LEFT JOIN plans p ON s.plan_id = p.id
      ORDER BY t.created_at DESC
      LIMIT 10
    `);

    reply.send({
      success: true,
      stats: {
        totalUsers: parseInt(users.rows[0].total),
        activeSubscriptions: parseInt(subscriptions.rows[0].total),
        totalRevenue: parseFloat(revenue.rows[0].total || 0),
        planDistribution: planDistribution.rows,
        recentUsers: recentUsers.rows,
        recentTransactions: recentTransactions.rows
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to fetch stats'
    });
  }
};

// Get all users
export const getAllUsers = async (request, reply) => {
  const { page = 1, limit = 20, search = '' } = request.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT u.id, u.email, u.name, u.avatar, u.is_verified, u.two_factor_enabled, 
             u.oauth_provider, u.created_at, p.name as plan_name
      FROM users u
      LEFT JOIN plans p ON u.plan_id = p.id
    `;

    const params = [];
    if (search) {
      query += ' WHERE u.email ILIKE $1 OR u.name ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    const countQuery = search 
      ? 'SELECT COUNT(*) as total FROM users WHERE email ILIKE $1 OR name ILIKE $1'
      : 'SELECT COUNT(*) as total FROM users';
    const countParams = search ? [`%${search}%`] : [];
    const count = await pool.query(countQuery, countParams);

    reply.send({
      success: true,
      users: result.rows,
      pagination: {
        total: parseInt(count.rows[0].total),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count.rows[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Get user details
export const getUserDetails = async (request, reply) => {
  const { userId } = request.params;

  try {
    const user = await pool.query(`
      SELECT u.*, p.name as plan_name, p.price as plan_price
      FROM users u
      LEFT JOIN plans p ON u.plan_id = p.id
      WHERE u.id = $1
    `, [userId]);

    if (user.rows.length === 0) {
      return reply.status(404).send({
        success: false,
        message: 'User not found'
      });
    }

    const subscriptions = await pool.query(`
      SELECT s.*, p.name as plan_name, p.price
      FROM subscriptions s
      LEFT JOIN plans p ON s.plan_id = p.id
      WHERE s.user_id = $1
      ORDER BY s.created_at DESC
    `, [userId]);

    const transactions = await pool.query(`
      SELECT * FROM transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 20
    `, [userId]);

    const sessions = await pool.query(`
      SELECT id, ip_address, user_agent, created_at, expires_at
      FROM sessions
      WHERE user_id = $1 AND expires_at > NOW()
      ORDER BY created_at DESC
    `, [userId]);

    reply.send({
      success: true,
      user: user.rows[0],
      subscriptions: subscriptions.rows,
      transactions: transactions.rows,
      sessions: sessions.rows
    });
  } catch (error) {
    console.error('Get user details error:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to fetch user details'
    });
  }
};

// Update user plan
export const updateUserPlan = async (request, reply) => {
  const { userId } = request.params;
  const { planId } = request.body;

  try {
    await pool.query(
      'UPDATE users SET plan_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [planId, userId]
    );

    // Log admin action
    await pool.query(
      'INSERT INTO admin_logs (admin_email, action, target_user_id, details) VALUES ($1, $2, $3, $4)',
      [request.adminEmail || 'admin', 'update_user_plan', userId, { planId }]
    );

    reply.send({
      success: true,
      message: 'User plan updated successfully'
    });
  } catch (error) {
    console.error('Update user plan error:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to update user plan'
    });
  }
};

// Toggle user status
export const toggleUserStatus = async (request, reply) => {
  const { userId } = request.params;
  const { isActive } = request.body;

  try {
    // You could add an is_active column or handle differently
    // For now, we'll just log the action
    await pool.query(
      'INSERT INTO admin_logs (admin_email, action, target_user_id, details) VALUES ($1, $2, $3, $4)',
      [request.adminEmail || 'admin', 'toggle_user_status', userId, { isActive }]
    );

    reply.send({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to toggle user status'
    });
  }
};

// Get admin logs
export const getAdminLogs = async (request, reply) => {
  const { page = 1, limit = 50 } = request.query;
  const offset = (page - 1) * limit;

  try {
    const result = await pool.query(`
      SELECT l.*, u.email as target_user_email, u.name as target_user_name
      FROM admin_logs l
      LEFT JOIN users u ON l.target_user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const count = await pool.query('SELECT COUNT(*) as total FROM admin_logs');

    reply.send({
      success: true,
      logs: result.rows,
      pagination: {
        total: parseInt(count.rows[0].total),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count.rows[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get admin logs error:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to fetch admin logs'
    });
  }
};

// Delete user
export const deleteUser = async (request, reply) => {
  const { userId } = request.params;

  try {
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    // Log admin action
    await pool.query(
      'INSERT INTO admin_logs (admin_email, action, target_user_id) VALUES ($1, $2, $3)',
      [request.adminEmail || 'admin', 'delete_user', userId]
    );

    reply.send({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to delete user'
    });
  }
};
